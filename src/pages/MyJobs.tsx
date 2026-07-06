import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from "react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCached, setCached, invalidate as invalidateCache } from "@/lib/ttlCache";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, TrendingUp, ExternalLink, Loader2, Inbox, Search, Mail, MailOpen, Sparkles, X, ThumbsUp, Trash2, Reply, Send, CheckCircle2, Pin, Newspaper, Bookmark, BookmarkCheck, Globe, Heart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { roles } from "@/data/roles";
import {
  getUnderstandMeIndustries,
  getUnderstandMeRoles,
  inferCareerLevelFromUnderstandMe,
  normalizeCareerLevel,
  isCraftServiceJob,
  isBusinessRoleSlug,
  LEVEL_ORDER,
  type CareerLevel,
  type UnderstandMeResults,
} from "@/lib/understand-me";
import { getIndustryRankBoost } from "@/lib/industry-rankings";
import { getIndustriesFromPassions, PASSION_INDUSTRY_MAP } from "@/lib/passion-industry-map";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import CompanyLogo from "@/components/CompanyLogo";
import { trackInteraction, useBehavioralAffinity, type IndustryAffinity } from "@/hooks/useTrackInteraction";
import { getCompanySlug, getCompanyProfilePath } from "@/lib/company-profiles";
import { getCompanyExternalUrl } from "@/lib/company-external-links";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import SourceAttribution, { SourceAttributionFooter, detectJobSource } from "@/components/AdzunaAttribution";
import SavedTabContent from "@/components/SavedTabContent";
import MembersArea from "@/components/MembersArea";
import MentorRequestsInbox from "@/components/MentorRequestsInbox";
import howdyMascot from "@/assets/howdy-mascot.png";
import { getIntersectionKeywords } from "@/data/intersection-roles";
import { matchesToReasons } from "@/lib/profile-matching";

/* ───── Hand-drawn rounded pill CTA - matches home hero style ───── */
const LIME = "hsl(120, 100%, 45%)";
const SketchCta = ({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) => (
  <span className="relative inline-flex items-center hover:opacity-90 transition-opacity">
    <svg
      viewBox="0 0 140 52"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <path
        d="M26,3 C14,3 4,14 3,26 C3,38 13,49 26,49 L114,49 C127,49 137,38 137,26 C138,14 127,3 114,3 Z"
        fill={variant === "primary" ? LIME : "hsl(0, 0%, 100%)"}
        stroke="hsl(0, 0%, 7%)"
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    <span className="relative inline-flex items-center gap-1.5 font-display font-900 text-xs md:text-sm tracking-wide uppercase text-foreground px-5 py-2.5 whitespace-nowrap">
      {children}
    </span>
  </span>
);


interface JobTraits {
  riasec: RiasecScores;
  values: WorkValues;
  key_skills: string[];
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  industry: string | null;
  career_level: string | null;
  url: string;
  created_at: string;
  type: string | null;
  work_mode: string | null;
  role_category: string | null;
  ai_role_category: string | null;
  job_traits: JobTraits | null;
  description: string | null;
  tags: string[] | null;
  expires_at?: string | null;
}

interface RiasecScores {
  R: number; I: number; A: number; S: number; E: number; C: number;
}

interface WorkValues {
  [key: string]: number;
}

interface RoleRiasecProfile {
  role_category: string;
  riasec_scores: RiasecScores;
  work_values: WorkValues;
}

interface UserProfile {
  career_level: string | null;
  industry_interests: string[] | null;
  newsletter_industries: string[] | null;
  location_preference: string | null;
  role_preferences: string[] | null;
  salary_expectation: string | null;
  understand_me_results: UnderstandMeResults | null;
  riasec_scores: RiasecScores | null;
  work_values: WorkValues | null;
  job_preferences: { passions?: string[]; passionsText?: string; targetCompanies?: string[]; targetRoles?: string[] } | null;
}

// Map a passion to extra keywords so we catch related jobs even when the
// passion word itself isn't in the listing (e.g. Golf → caddie, country club).
// All single-token keywords are matched with WORD BOUNDARIES (\bword\b) so
// they never match inside other words - e.g. "wine" won't match "swine",
// "ski" won't match "skill"/"skin", "win" won't match "window". Multi-word
// phrases (containing a space or hyphen) use substring match.
// When a stem like "swim" needs to also catch "swimming"/"swimmer", list
// each form explicitly.
const PASSION_KEYWORD_MAP: Record<string, string[]> = {
  golf: ["golf", "golfing", "caddie", "caddy", "country club", "greenkeeper", "pro shop"],
  tennis: ["tennis", "racket", "racquet", "padel", "tennis club", "padel club"],
  wine: ["wine", "wines", "sommelier", "vineyard", "winery", "viticulture", "wset"],
  football: ["football", "soccer", "matchday"],
  running: ["running", "runner", "runners", "marathon", "athletics"],
  cycling: ["cycling", "cyclist", "cyclists", "bicycle", "velo"],
  yoga: ["yoga", "pilates"],
  swimming: ["swim", "swims", "swimmer", "swimmers", "swimming", "aquatic", "swimming pool"],
  // Skiing was matching "skill", "skin", "skincare" via substring "ski".
  // Use precise multi-word phrases so we only fire on genuine ski/snow content.
  skiing: ["skiing", "snowboard", "snowboarding", "ski resort", "ski instructor", "ski season", "après-ski", "apres-ski", "alpine resort"],
  surfing: ["surf", "surfer", "surfing", "surfboard", "wetsuit"],
  climbing: ["climber", "climbing", "bouldering", "mountaineering"],
  hiking: ["hiker", "hiking", "trekking", "trail running"],
  music: ["music", "musical", "musician", "record label", "concert", "live music"],
  "live gigs": ["gig", "gigs", "live music", "concert", "festival", "promoter"],
  djing: ["dj", "decks", "nightclub"],
  vinyl: ["vinyl", "record label"],
  guitar: ["guitar", "guitarist", "luthier"],
  piano: ["piano", "pianist", "keyboard player"],
  cooking: ["chef", "chefs", "kitchen", "culinary", "restaurant"],
  baking: ["bakery", "baker", "bakers", "pastry", "patisserie"],
  "coffee culture": ["coffee", "barista", "baristas", "roaster", "café", "cafe"],
  restaurants: ["restaurant", "restaurants", "front of house", "fine dining"],
  travel: ["travel agent", "tour operator", "hotel", "hotels", "airline", "airlines", "tourism"],
  photography: ["photographer", "photographers", "photography", "imagery"],
  film: ["film production", "cinema", "post-production", "filmmaker"],
  "tv series": ["television", "broadcast", "broadcaster", "streaming"],
  reading: ["editorial", "publishing", "publisher", "books"],
  writing: ["writer", "writers", "copywriter", "editor", "journalism", "journalist"],
  podcasts: ["podcast", "podcasts", "podcaster"],
  gaming: ["gaming", "esports", "game studio", "video game"],
  tech: ["software engineer", "developer", "saas", "tech startup"],
  fashion: ["fashion", "apparel", "garment", "atelier"],
  art: ["art gallery", "curator", "fine art"],
  design: ["designer", "designers", "design studio"],
  architecture: ["architect", "architecture"],
  dance: ["dancer", "dancers", "choreograph"],
  theatre: ["theatre", "theater", "stage production"],
  comedy: ["comedy", "comedian", "comedians"],
  volunteering: ["charity", "non-profit", "ngo", "volunteer", "volunteering"],
  animals: ["pet", "pets", "animal", "animals", "veterinary", "zoo", "rspca"],
  gardening: ["garden", "gardens", "horticulture", "landscape", "plants"],
  cars: ["automotive", "vehicle", "vehicles"],
  motorbikes: ["motorbike", "motorbikes", "motorcycle", "motorcycles"],
  sailing: ["sailing", "yacht", "yachts", "marine", "boat", "boats"],
  beauty: ["beauty", "salon", "cosmetic", "cosmetics", "skincare"],
};

function getPassionKeywords(passions: string[], passionsText: string): string[] {
  const set = new Set<string>();
  for (const raw of passions) {
    const key = raw.toLowerCase().trim();
    if (!key) continue;
    set.add(key);
    const mapped = PASSION_KEYWORD_MAP[key];
    if (mapped) mapped.forEach((k) => set.add(k.toLowerCase()));
  }
  if (passionsText) {
    passionsText
      .toLowerCase()
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 4)
      .forEach((s) => set.add(s));
  }
  return Array.from(set);
}

// Match keywords using word boundaries so short tokens like "ski" don't
// match inside "skill", "skin", "skincare". Multi-word phrases are matched
// as substrings (since they're inherently safe).
function jobMatchesPassion(job: Job, keywords: string[]): string | null {
  if (keywords.length === 0) return null;
  const haystack = [
    job.title,
    job.company,
    job.industry || "",
    job.description || "",
    (job.tags || []).join(" "),
  ]
    .join(" ")
    .toLowerCase();
  for (const kw of keywords) {
    if (kw.includes(" ") || kw.includes("-")) {
      if (haystack.includes(kw)) return kw;
    } else {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`\\b${escaped}\\b`, "i");
      if (re.test(haystack)) return kw;
    }
  }
  return null;
}

const SALARY_THRESHOLDS: Record<string, number> = {
  "Under £25k": 0,
  "£25k–£35k": 25000,
  "£35k–£50k": 35000,
  "£50k–£70k": 50000,
  "£70k–£90k": 70000,
  "£90k–£120k": 90000,
  "£120k+": 120000,
};

function parseSalaryMax(salary: string | null): number | null {
  if (!salary) return null;
  const normalized = salary.replace(/,/g, "").replace(/–/g, "-");
  const matches = normalized.match(/£([0-9.]+)/g);
  if (!matches || matches.length === 0) return null;
  const values = matches.map((m) => {
    const num = parseFloat(m.replace("£", ""));
    return num < 1000 ? num * 1000 : num;
  });
  return Math.max(...values);
}

function isLiveJob(job: Job): boolean {
  return !job.expires_at || new Date(job.expires_at).getTime() > Date.now();
}

function getFreshnessBoost(createdAt: string): number {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours <= 24) return 18;
  if (ageHours <= 72) return 12;
  if (ageHours <= 7 * 24) return 7;
  if (ageHours <= 14 * 24) return 3;
  return 0;
}

const LEVEL_LABELS: Record<string, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior Level",
  director: "Director",
  executive: "Executive",
};

const ROLE_TITLE_TO_SLUG: Record<string, string> = {};
roles.forEach((r) => {
  ROLE_TITLE_TO_SLUG[r.title.toLowerCase()] = r.slug;
});

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Some interests on a profile are umbrella categories that should fan out to
// multiple job-table industries. Keep slugs lowercase, hyphenated.
const INDUSTRY_INTEREST_ALIASES: Record<string, string[]> = {
  "food-drink": ["hospitality", "coffee", "bakery", "beer"],
  "food-and-drink": ["hospitality", "coffee", "bakery", "beer"],
};

function expandIndustrySlug(value: string): string[] {
  const slug = toSlug(value);
  return INDUSTRY_INTEREST_ALIASES[slug] ?? [slug];
}

function expandIndustrySlugs(values: string[]): string[] {
  const out = new Set<string>();
  for (const v of values) for (const s of expandIndustrySlug(v)) out.add(s);
  return [...out];
}

function getJobCategorySlug(job: Job): string {
  return toSlug(job.ai_role_category || job.role_category || "");
}

function getJobRoleContext(job: Job): string {
  return `${job.title || ""} ${job.role_category || ""}`.toLowerCase();
}

const BUSINESS_ROLE_KEYWORD_PATTERNS: Record<string, RegExp> = {
  marketing: /\b(marketing|brand|growth|crm|performance|acquisition|content|communications|campaign|digital|seo|ppc|paid media|paid social|lifecycle|field marketing|product marketing|martech|influencer|social media)\b/i,
  strategy: /\b(strategy|strategic|business development|corporate development|growth strategy|go-to-market|gtm|m&a|ventures|chief of staff|planning|transformation|insight|analytics?|consulting|consultant)\b/i,
  commercial: /\b(commercial|partnerships?|revenue|trading|trader|merchandis(?:e|ing|er)|category|buying|buyer|account management|head of sales|business development|wholesale)\b/i,
  operations: /\b(operations|operational|ops|business transformation|process improvement|programme|program|supply chain|logistics|fulfilment|distribution|warehouse|procurement|facilities)\b/i,
  "e-commerce": /\b(e-?commerce|digital trading|online trading|marketplace|conversion|retention|merchandis(?:e|ing|er)|dtc|d2c|omnichannel|online manager)\b/i,
  ecommerce: /\b(e-?commerce|digital trading|online trading|marketplace|conversion|retention|merchandis(?:e|ing|er)|dtc|d2c|omnichannel|online manager)\b/i,
  finance: /\b(finance|financial|fp&a|controller|treasury|audit|accountant|accounting|tax|payroll|bookkeep)\b/i,
  sales: /\b(sales|account executive|account manager|business development|partnerships?|bdr|sdr|new business)\b/i,
  "hr-people": /\b(hr|people|talent|recruitment|recruiter|learning and development|l&d|employee|reward|compensation|benefits|culture)\b/i,
  "legal-compliance": /\b(legal|compliance|risk|regulatory|privacy|governance|solicitor|counsel|lawyer|paralegal|barrister)\b/i,
  product: /\b(product|roadmap|go-to-market|gtm|product manager|product owner|product design|ux|ui|user experience)\b/i,
  "project-management": /\b(project|programme|program|pmo|delivery|implementation|transformation|scrum|agile)\b/i,
  producer: /\b(producer|production|editorial production)\b/i,
  creative: /\b(creative|design|designer|art direction|art director|copywriter|content|illustrator|graphic|photographer|videographer)\b/i,
};

function cosineSimilarity(a: RiasecScores, b: RiasecScores): number {
  const keys: (keyof RiasecScores)[] = ["R", "I", "A", "S", "E", "C"];
  let dot = 0, magA = 0, magB = 0;
  for (const k of keys) {
    dot += a[k] * b[k];
    magA += a[k] * a[k];
    magB += b[k] * b[k];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function workValuesSimilarity(user: WorkValues, role: WorkValues): number {
  const keys = Object.keys(role);
  if (keys.length === 0) return 0;
  let totalSim = 0;
  for (const k of keys) {
    const uv = user[k] ?? 50;
    const rv = role[k] ?? 50;
    totalSim += 1 - Math.abs(uv - rv) / 100;
  }
  return totalSim / keys.length;
}

function uniqueCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

// STATED PREFERENCES WIN: if the user has explicitly told us what roles they
// want next (in onboarding/profile), those take priority over CV-inferred roles.
// CV signals are only used as a fallback when the user hasn't said what they
// want - this prevents an experienced barista who wants to move into Marketing
// from being shown only barista jobs.
function getEffectiveRoles(profile: UserProfile): string[] {
  const explicit = profile.role_preferences || [];
  if (explicit.length > 0) {
    return uniqueCaseInsensitive(explicit);
  }
  const strongUnderstandMeRoles = getUnderstandMeRoles(profile.understand_me_results, 80);
  if (strongUnderstandMeRoles.length > 0) {
    return strongUnderstandMeRoles;
  }
  return uniqueCaseInsensitive([
    ...getUnderstandMeRoles(profile.understand_me_results),
  ]);
}

function getEffectiveIndustries(profile: UserProfile): string[] {
  const explicit = profile.industry_interests || [];
  if (explicit.length > 0) return [...explicit];
  const strongUnderstandMeIndustries = getUnderstandMeIndustries(profile.understand_me_results, 75);
  if (strongUnderstandMeIndustries.length > 0) {
    return strongUnderstandMeIndustries;
  }
  return getUnderstandMeIndustries(profile.understand_me_results);
}

// AUTO-DETECT INDUSTRY SWITCHERS: if the user's CV-inferred industries don't
// overlap with their stated industry interests, they're moving fields. We
// shouldn't penalise them for lacking experience in the new industry.
function isIndustrySwitcher(profile: UserProfile): boolean {
  const stated = (profile.industry_interests || []).map((i) => i.trim().toLowerCase()).filter(Boolean);
  if (stated.length === 0) return false;
  const cvIndustries = getUnderstandMeIndustries(profile.understand_me_results)
    .map((i) => i.trim().toLowerCase());
  if (cvIndustries.length === 0) return false;
  // Switcher = no overlap between what they did and what they want next.
  return !stated.some((s) => cvIndustries.includes(s));
}

function getEffectiveCareerLevel(profile: UserProfile): CareerLevel | null {
  // STATED PREFERENCE WINS: if the user has explicitly set a career level, use it.
  // This stops a CV with senior tenure overriding "I want exec/CEO roles".
  const explicit = normalizeCareerLevel(profile.career_level);
  if (explicit) return explicit;
  return inferCareerLevelFromUnderstandMe(profile.understand_me_results);
}

// Pre-relaxation level - used for exclusion/seniority gates so a switcher who
// is genuinely senior or exec doesn't suddenly start seeing assistant-level
// craft jobs just because we relaxed their level for ranking.
function getRawCareerLevel(profile: UserProfile): CareerLevel | null {
  return normalizeCareerLevel(profile.career_level)
    || inferCareerLevelFromUnderstandMe(profile.understand_me_results);
}

function shouldRequireRoleMatch(profile: UserProfile): boolean {
  return getEffectiveRoles(profile).length > 0;
}

function shouldRequireIndustryMatch(profile: UserProfile): boolean {
  return getEffectiveIndustries(profile).length > 0;
}

function getEffectiveRoleSlugs(profile: UserProfile): string[] {
  return uniqueCaseInsensitive(
    getEffectiveRoles(profile).map((role) => toSlug(ROLE_TITLE_TO_SLUG[role.toLowerCase()] || role)),
  );
}

function hasIndustryMatch(job: Job, profile: UserProfile): boolean {
  if (!job.industry) return false;
  const jobSlug = toSlug(job.industry);
  const interestSlugs = expandIndustrySlugs(getEffectiveIndustries(profile));
  return interestSlugs.includes(jobSlug);
}

function isCareerLevelCompatible(job: Job, profile: UserProfile): boolean {
  const effectiveCareerLevel = getEffectiveCareerLevel(profile);
  const normalizedJobLevel = normalizeCareerLevel(job.career_level);

  if (!effectiveCareerLevel || !normalizedJobLevel) return true;

  return Math.abs((LEVEL_ORDER[effectiveCareerLevel] ?? 1) - (LEVEL_ORDER[normalizedJobLevel] ?? 1)) <= 1;
}

function hasBusinessProfileSignals(profile: UserProfile): boolean {
  const effectiveLevel = getEffectiveCareerLevel(profile);
  if (effectiveLevel && (LEVEL_ORDER[effectiveLevel] ?? 0) >= 2) return true;
  return getEffectiveRoleSlugs(profile).some(isBusinessRoleSlug);
}

function isBusinessCategoryJob(job: Job): boolean {
  return BUSINESS_ROLE_SLUGS_SET.has(getJobCategorySlug(job));
}

const BUSINESS_ROLE_SLUGS_SET = new Set([
  "marketing", "operations", "strategy", "commercial", "e-commerce", "ecommerce",
  "finance", "sales", "hr-people", "legal-compliance", "product", "project-management", "producer",
  "creative",
]);

function jobTitleMatchesAnyBusinessKeyword(job: Job): boolean {
  const ctx = getJobRoleContext(job);
  return Object.values(BUSINESS_ROLE_KEYWORD_PATTERNS).some((re) => re.test(ctx));
}

// Titles that are clearly NOT senior/director/executive - used to block obvious
// junior or shop-floor roles from senior+ users (e.g. "Costa Store Manager"
// shouldn't reach a self-described CEO/Strategy candidate).
// "Manager" alone is included because at senior+ a plain "Manager" is too junior.
const NON_SENIOR_TITLE_PATTERN = /\b(store manager|shop manager|branch manager|assistant manager|deputy manager|shift manager|duty manager|team leader|supervisor|crew member|crew trainer|barista|bartender|server|waiter|waitress|host(?:ess)?|cashier|sales assistant|retail assistant|warehouse|driver|delivery|cleaner|porter|kitchen porter|line cook|commis|chef de partie|receptionist|junior|trainee|apprentice|intern|graduate|entry)\b/i;

// Director / VP titles - used to recognise level-3 (Director) jobs.
const DIRECTOR_TITLE_PATTERN = /\b(director|\bvp\b|vice president|svp|evp|senior director|deputy director|associate director|director of|director,)\b/i;

// Executive (C-suite / MD / Founder / Partner) titles - level 4.
const EXECUTIVE_TITLE_PATTERN = /\b(ceo|cfo|coo|cto|cmo|cpo|cro|chief\s+(?:executive|operating|financial|marketing|strategy|technology|product|people|commercial|revenue|of staff)|founder|co-?founder|managing director|managing partner|md\b|president|chair(?:man|woman|person)?|partner,|partner\b|country manager)\b/i;

// Strategic leadership titles - anything Senior+ that's clearly leadership-track
// (used as the "allowed" list when a senior+ user has stated target roles).
const STRATEGY_LEADER_TITLE_PATTERN = /\b(ceo|cfo|coo|cto|cmo|cpo|cro|chief\s+(?:executive|operating|financial|marketing|strategy|technology|product|people|commercial|revenue|of staff)|founder|co-?founder|managing director|managing partner|president|chair(?:man|woman|person)?|md\b|vp |vice president|svp|evp|head of|director of|director,|partner,|partner\b|chief of staff|strategy director|strategy lead|head of strategy|principal|general manager|country manager|regional director|director\b)\b/i;

// Regulated / clinical roles that require specific qualifications.
// Block these unless the user has explicitly indicated a clinical/regulated
// background (matching role preference, target role, or work history hint).
// Prevents e.g. "Consultant Psychiatrist" from showing to a non-clinician
// just because "consultant" matches the strategy keyword.
const REGULATED_CLINICAL_TITLE_PATTERN = /\b(psychiatrist|psychologist|psychotherapist|counsellor|counselor|therapist|physiotherapist|physio|occupational therapist|speech (?:and )?language therapist|dietician|dietitian|radiographer|sonographer|paramedic|midwife|midwifery|nurse|nursing|nhs band|health(?:care)? assistant|doctor|gp\b|general practitioner|surgeon|anaesthetist|anesthetist|registrar|consultant (?:psychiatrist|surgeon|physician|cardiologist|oncologist|paediatrician|pediatrician|radiologist|anaesthetist|anesthetist|dermatologist|geriatrician|gynaecologist|neurologist|nephrologist|ophthalmologist|orthopaedic|pathologist|psychotherapist|rheumatologist|urologist)|specialty doctor|clinical fellow|f1|f2|st[1-8]|core trainee|specialist registrar|pharmacist|dentist|dental nurse|optometrist|orthoptist|chiropractor|osteopath|veterinary surgeon|veterinary nurse|vet nurse|solicitor|barrister|paralegal|conveyancer|actuary|chartered accountant|architect|civil engineer|structural engineer|electrician|plumber|gas engineer|hgv driver|airline pilot|cabin crew|teacher|teaching assistant|sen teacher|early years|qts\b)\b/i;

const CLINICAL_REGULATED_ROLE_SLUGS = new Set([
  "doctor", "nurse", "midwife", "psychotherapist", "physiotherapist",
  "occupational-therapist", "healthcare-assistant", "veterinary-surgeon",
  "veterinary-nurse", "teacher", "teaching-assistant", "conveyancer",
  "legal-compliance",
]);

// Finance / accountancy titles that require a recognised qualification
// (ACA, ACCA, CIMA, AAT, CFA) or demonstrable accounting background
// (audit, FP&A, controller, tax, treasury, bookkeeping). Block these unless
// the user's profile shows a finance signal — prevents "Finance Manager"
// or "Tax Accountant" jobs reaching candidates with no finance training.
const FINANCE_QUALIFIED_TITLE_PATTERN = /\b(accountant|accounting|bookkeep(?:er|ing)?|auditor|audit (?:manager|senior|associate|director)|financial controller|finance controller|\bcontroller\b|fp&a|\bfpa\b|treasury|tax (?:manager|senior|associate|advisor|adviser|accountant|analyst|director)|payroll (?:manager|specialist|officer|administrator)|financial analyst|finance analyst|finance manager|finance business partner|management accountant|chartered accountant|\baca\b|\bacca\b|\bcima\b|\baat\b|\bcfa\b|actuary|actuarial|forensic accountant|credit controller|finance director|head of finance|director of finance|cfo)\b/i;

const FINANCE_SIGNAL_PATTERN = /\b(finance|financial|account(?:ant|ing|s)?|audit|tax|treasury|fp&a|controller|bookkeep|payroll|actuar|aca|acca|cima|aat|cfa)\b/i;

function userHasFinanceSignal(profile: UserProfile): boolean {
  const roleSlugs = getEffectiveRoleSlugs(profile);
  if (roleSlugs.includes("finance")) return true;
  const targetRoles = profile.job_preferences?.targetRoles || [];
  if (targetRoles.some((r) => FINANCE_SIGNAL_PATTERN.test(r || ""))) return true;
  // CV / Understand Me inferred roles hinting at a finance background.
  const understandRoles = getUnderstandMeRoles(profile.understand_me_results);
  if (understandRoles.some((r) => FINANCE_SIGNAL_PATTERN.test(r))) return true;
  return false;
}

function userHasRegulatedSignal(profile: UserProfile, titleLower: string): boolean {
  const roleSlugs = getEffectiveRoleSlugs(profile);
  if (roleSlugs.some((s) => CLINICAL_REGULATED_ROLE_SLUGS.has(s))) return true;
  const targetRoles = profile.job_preferences?.targetRoles || [];
  // If user has explicitly named a target role that overlaps the regulated title
  // (e.g. "Psychotherapist" in targets, "Consultant Psychotherapist" job), allow.
  if (targetRoles.some((r) => {
    const t = (r || "").toLowerCase().trim();
    if (!t) return false;
    return titleLower.includes(t) || REGULATED_CLINICAL_TITLE_PATTERN.test(t);
  })) return true;
  return false;
}

function shouldExcludeJob(job: Job, profile: UserProfile): boolean {
  const effectiveLevel = getEffectiveCareerLevel(profile);
  const rawLevel = getRawCareerLevel(profile);
  const userLevelNum = effectiveLevel ? (LEVEL_ORDER[effectiveLevel] ?? 1) : null;
  const rawLevelNum = rawLevel ? (LEVEL_ORDER[rawLevel] ?? 1) : null;
  const craftJob = isCraftServiceJob(job.title || "", [job.ai_role_category, job.role_category]);
  const businessProfile = hasBusinessProfileSignals(profile);
  const switcher = isIndustrySwitcher(profile);
  const titleLower = (job.title || "").toLowerCase();
  // Salary expectation is also a strong seniority signal - a £50k+ expectation
  // means the user is targeting senior/leadership roles regardless of how
  // their career_level is set in profile.
  const minSalary = profile.salary_expectation ? (SALARY_THRESHOLDS[profile.salary_expectation] || 0) : 0;
  const wantsSeniorPay = minSalary >= 50000;

  // REGULATED PROFESSIONS: hard-block titles that require specific licences
  // / qualifications unless the user's profile shows a matching background.
  // Stops e.g. "Consultant Psychiatrist", "Solicitor", "HGV Driver" reaching
  // people who haven't trained for them.
  if (REGULATED_CLINICAL_TITLE_PATTERN.test(titleLower) && !userHasRegulatedSignal(profile, titleLower)) {
    return true;
  }

  // FINANCE / ACCOUNTANCY: hard-block qualified finance roles (Accountant,
  // Auditor, FP&A, Controller, Tax, Treasury, CFO etc.) unless the user shows
  // a finance background — finance preference, target role mentioning
  // finance/accounting, or CV-inferred finance signal.
  if (FINANCE_QUALIFIED_TITLE_PATTERN.test(titleLower) && !userHasFinanceSignal(profile)) {
    return true;
  }


  // EXECUTIVE / SENIOR USERS (or anyone expecting £50k+): hard-block obvious
  // shop-floor or junior roles. A CEO doesn't want a Costa store manager job
  // even if they're switching into hospitality.
  if ((rawLevelNum ?? -1) >= 2 || wantsSeniorPay) {
    if (NON_SENIOR_TITLE_PATTERN.test(titleLower) && !STRATEGY_LEADER_TITLE_PATTERN.test(titleLower)) {
      return true;
    }
  }

  // Per-tier salary floors when job has a parsed salary.
  // Executive (C-suite) - block anything under £90k.
  // Director - block anything under £65k.
  // Senior - block anything under £45k.
  if (rawLevel === "executive") {
    const jobMaxSalary = parseSalaryMax(job.salary);
    if (jobMaxSalary !== null && jobMaxSalary < 90000) return true;
  } else if (rawLevel === "director") {
    const jobMaxSalary = parseSalaryMax(job.salary);
    if (jobMaxSalary !== null && jobMaxSalary < 65000) return true;
  } else if (rawLevel === "senior") {
    const jobMaxSalary = parseSalaryMax(job.salary);
    if (jobMaxSalary !== null && jobMaxSalary < 45000) return true;
  }

  // EXECUTIVE users specifically: only allow titles that are actually C-suite
  // or strategic leadership. A "Marketing Director" is NOT an Executive role
  // - it's a Director role and should be filtered out for self-described execs.
  if (rawLevel === "executive") {
    if (!EXECUTIVE_TITLE_PATTERN.test(titleLower) && !STRATEGY_LEADER_TITLE_PATTERN.test(titleLower)) {
      // Allow only if title contains a clear C-level / MD / Founder cue.
      // Block plain "Director", "VP", "Head of" etc. - those are Director tier.
      if (DIRECTOR_TITLE_PATTERN.test(titleLower) && !EXECUTIVE_TITLE_PATTERN.test(titleLower)) {
        return true;
      }
    }
  }

  // TARGET-ROLE GATING: if the user has explicitly named target roles
  // (e.g. "CEO", "Strategy", "Head of"), exclude jobs whose title clearly
  // doesn't match any of them AND falls into the obvious non-senior bucket.
  // This prevents the inbox being flooded with operational roles when the
  // user has made it crystal clear what they want.
  const targetRoles = profile.job_preferences?.targetRoles || [];
  if (targetRoles.length > 0 && ((rawLevelNum ?? -1) >= 2 || wantsSeniorPay)) {
    const matchesAnyTarget = targetRoles.some((r) => titleLower.includes(r.toLowerCase().trim()));
    const looksStrategic = STRATEGY_LEADER_TITLE_PATTERN.test(titleLower);
    if (!matchesAnyTarget && !looksStrategic) {
      return true;
    }
  }

  if (craftJob && ((userLevelNum ?? -1) >= 2 || (rawLevelNum ?? -1) >= 2 || businessProfile || wantsSeniorPay)) {
    return true;
  }

  // Senior business users: exclude jobs that are NOT in business categories
  // AND whose title doesn't match any business keyword (covers null/mis-categorised jobs).
  // EXCEPTION: switchers who are mid-level - they may need broader exposure.
  // Senior/exec switchers still get the filter applied (raw level check).
  if (businessProfile && (rawLevelNum ?? 0) >= 2 && !switcher) {
    if (!isBusinessCategoryJob(job) && !jobTitleMatchesAnyBusinessKeyword(job)) {
      return true;
    }
  }

  // Early-career users (students, recent grads, no work history):
  // hide jobs that clearly require seniority OR pay > ~£40k. There's no
  // point offering a first-time job hunter a £45k Head of Marketing role.
  if (effectiveLevel === "entry") {
    const jobLevel = (job.career_level || "").toLowerCase();
    if (jobLevel === "senior" || jobLevel === "executive") {
      return true;
    }
    const jobMaxSalary = parseSalaryMax(job.salary);
    if (jobMaxSalary !== null && jobMaxSalary > 40000) {
      return true;
    }
    // Block obvious senior keywords in the title even when career_level is null.
    if (/\b(head of|director|vp|vice president|chief|principal|lead\b|senior|managing|partner)\b/i.test(job.title || "")) {
      return true;
    }
  }

  if (userLevelNum === null) return false;

  const jobLevel = (job.career_level || "").toLowerCase();
  const jobLevelNum = LEVEL_ORDER[jobLevel];
  if (jobLevelNum !== undefined && userLevelNum - jobLevelNum > 1) {
    return true;
  }

  return false;
}

function hasRoleMatch(job: Job, profile: UserProfile): boolean {
  const effectiveRoles = getEffectiveRoles(profile);
  if (effectiveRoles.length === 0) return false;

  const normalizedJobCategory = getJobCategorySlug(job);
  const jobRoleContext = getJobRoleContext(job);
  const craftJob = isCraftServiceJob(job.title || "", [job.ai_role_category, job.role_category]);
  const industryMatch = hasIndustryMatch(job, profile);
  const careerLevelCompatible = isCareerLevelCompatible(job, profile);

  return effectiveRoles.some((rp) => {
    const normalizedRole = rp.trim().toLowerCase();
    const slug = toSlug(ROLE_TITLE_TO_SLUG[normalizedRole] || normalizedRole);

    if (craftJob && isBusinessRoleSlug(slug)) {
      return false;
    }

    const categoryMatch = normalizedJobCategory === slug;
    const titleMatch = jobRoleContext.includes(normalizedRole);

    if (!isBusinessRoleSlug(slug)) {
      return categoryMatch || titleMatch;
    }

    const keywordPattern = BUSINESS_ROLE_KEYWORD_PATTERNS[slug];
    const keywordMatch = keywordPattern ? keywordPattern.test(jobRoleContext) : false;

    if (titleMatch || keywordMatch) {
      return true;
    }

    return categoryMatch && industryMatch && careerLevelCompatible;
  });
}

function passesSalaryFilter(job: Job, minSalary: number): boolean {
  if (minSalary <= 0) return true;
  const jobMax = parseSalaryMax(job.salary);
  if (jobMax === null) {
    const titleLower = (job.title || "").toLowerCase();
    // No salary parsed. If the user wants £50k+ and the title is obviously
    // a junior/shop-floor role, block it - these almost never pay £50k+.
    if (minSalary >= 50000 && NON_SENIOR_TITLE_PATTERN.test(titleLower)) {
      return false;
    }
    // £90k+ users: missing salary AND title isn't clearly Director/Exec → block.
    // Recruiters often omit salary for senior roles, but if the title doesn't
    // signal seniority at all, it's almost certainly not a £90k+ role.
    if (
      minSalary >= 90000 &&
      !DIRECTOR_TITLE_PATTERN.test(titleLower) &&
      !EXECUTIVE_TITLE_PATTERN.test(titleLower) &&
      !STRATEGY_LEADER_TITLE_PATTERN.test(titleLower)
    ) {
      return false;
    }
    return true;
  }
  return jobMax >= minSalary * 0.85;
}

/* ───── Learning signals from user actions ───── */
interface LearnedSignals {
  boostedKeywords: Map<string, number>;  // keyword → boost count
  penalizedKeywords: Map<string, number>; // keyword → penalty count
  boostedCompanies: Set<string>;
  penalizedCompanies: Set<string>;
  boostedIndustries: Set<string>;
  penalizedIndustries: Set<string>;
  boostedLocations: Map<string, number>;  // location bucket → boost count
  penalizedLocations: Map<string, number>; // location bucket → penalty count
}

// A dismiss is often really "wrong location", not "wrong industry" - e.g. a
// London-based user swiping left on an otherwise-great job because it's in
// South Wales. Without its own signal, that swipe would only ever be read as
// "penalize this industry/company/keyword", which can wrongly suppress an
// industry the user actually likes. Bucket jobs by a coarse location so
// dismiss/like patterns tied to geography get attributed to geography.
function normalizeLocationBucket(job: { location: string | null; work_mode?: string | null }): string {
  if (job.work_mode && job.work_mode.toLowerCase() === "remote") return "remote";
  let loc = (job.location || "").toLowerCase().trim();
  if (!loc) return "";
  if (loc.includes("remote")) return "remote";
  // Strip UK postcode tokens (e.g. "WA5 7YF" / "WA57YF") - they identify a
  // specific street, not a meaningful region, and are too granular to learn from.
  loc = loc.replace(/\b[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}\b/gi, "").trim();
  // Keep just the first segment before a comma (e.g. "Cardiff, South Wales" → "cardiff")
  loc = loc.split(",")[0].trim();
  return loc;
}

// Same job often gets scraped from multiple boards (Adzuna, Reed, Jooble) as
// separate DB rows with slightly different company formatting - these two
// helpers build a normalized key so we can recognize "same real-world job,
// different row" both for dedupe display and for sweeping duplicates when a
// user likes/dismisses one copy of it.
function normalizeTitleForDedupe(raw: string): string {
  let t = (raw || "").toLowerCase().trim();
  const cutAt = t.search(/\s+[–\-|·•]\s+|,\s+/);
  if (cutAt > 0) t = t.slice(0, cutAt);
  t = t.replace(/\s*\([^)]*\)\s*$/, "");
  return t.replace(/\s+/g, " ").trim();
}
function normalizeCompanyForDedupe(raw: string): string {
  let c = (raw || "").toLowerCase().trim();
  c = c.replace(/[.,]/g, "");
  c = c.replace(/\b(corp|corporation|ltd|limited|plc|inc|llc|group|the|uk|international|holdings)\b/g, "");
  c = c.replace(/[^a-z0-9\s]/g, "");
  return c.replace(/\s+/g, " ").trim();
}
function jobDedupeKey(job: { title: string; company: string | null; location: string | null }): string {
  const normTitle = normalizeTitleForDedupe(job.title || "");
  const normCompany = normalizeCompanyForDedupe(job.company || "");
  return normCompany
    ? `${normTitle}::${normCompany}`
    : `${normTitle}::${(job.location || "").toLowerCase().trim()}`;
}

function extractTitleKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "into", "this", "that", "will", "are", "was",
  "has", "have", "had", "been", "being", "does", "did", "not", "but", "its", "all",
  "can", "may", "our", "you", "your", "per", "via", "new", "one", "two",
]);

function buildLearnedSignals(
  allJobs: Job[],
  dismissedIds: Set<string>,
  openedIds: Set<string>,
  likedIds?: Set<string>,
): LearnedSignals {
  const signals: LearnedSignals = {
    boostedKeywords: new Map(),
    penalizedKeywords: new Map(),
    boostedCompanies: new Set(),
    penalizedCompanies: new Set(),
    boostedIndustries: new Set(),
    penalizedIndustries: new Set(),
    boostedLocations: new Map(),
    penalizedLocations: new Map(),
  };

  const jobMap = new Map(allJobs.map((j) => [j.id, j]));

  for (const id of openedIds) {
    const job = jobMap.get(id);
    if (!job) continue;
    const keywords = extractTitleKeywords(job.title);
    for (const kw of keywords) {
      signals.boostedKeywords.set(kw, (signals.boostedKeywords.get(kw) || 0) + 1);
    }
    if (job.company) signals.boostedCompanies.add(job.company.toLowerCase());
    if (job.industry) signals.boostedIndustries.add(job.industry.toLowerCase());
    const loc = normalizeLocationBucket(job);
    if (loc) signals.boostedLocations.set(loc, (signals.boostedLocations.get(loc) || 0) + 1);
  }

  // Likes are a stronger signal than opens — count twice
  for (const id of (likedIds ?? new Set())) {
    const job = jobMap.get(id);
    if (!job) continue;
    const keywords = extractTitleKeywords(job.title);
    for (const kw of keywords) {
      signals.boostedKeywords.set(kw, (signals.boostedKeywords.get(kw) || 0) + 2);
    }
    if (job.company) signals.boostedCompanies.add(job.company.toLowerCase());
    if (job.industry) signals.boostedIndustries.add(job.industry.toLowerCase());
    const loc = normalizeLocationBucket(job);
    if (loc) signals.boostedLocations.set(loc, (signals.boostedLocations.get(loc) || 0) + 2);
  }

  for (const id of dismissedIds) {
    const job = jobMap.get(id);
    if (!job) continue;
    const keywords = extractTitleKeywords(job.title);
    for (const kw of keywords) {
      signals.penalizedKeywords.set(kw, (signals.penalizedKeywords.get(kw) || 0) + 1);
    }
    if (job.company) signals.penalizedCompanies.add(job.company.toLowerCase());
    if (job.industry) signals.penalizedIndustries.add(job.industry.toLowerCase());
    const loc = normalizeLocationBucket(job);
    if (loc) signals.penalizedLocations.set(loc, (signals.penalizedLocations.get(loc) || 0) + 1);
  }

  return signals;
}

function learningAdjustment(job: Job, signals: LearnedSignals): number {
  if (
    signals.boostedKeywords.size === 0 &&
    signals.penalizedKeywords.size === 0 &&
    signals.boostedCompanies.size === 0 &&
    signals.penalizedCompanies.size === 0 &&
    signals.boostedLocations.size === 0 &&
    signals.penalizedLocations.size === 0
  ) {
    return 0;
  }

  let adjustment = 0;
  const titleKws = extractTitleKeywords(job.title);
  const company = (job.company || "").toLowerCase();
  const industry = (job.industry || "").toLowerCase();

  // Keyword signals: each boosted keyword adds +2, each penalized adds -3
  for (const kw of titleKws) {
    const boostCount = signals.boostedKeywords.get(kw) || 0;
    const penaltyCount = signals.penalizedKeywords.get(kw) || 0;
    // Only penalize if keyword was dismissed MORE than it was opened
    if (boostCount > penaltyCount) {
      adjustment += 2;
    } else if (penaltyCount > boostCount) {
      adjustment -= 3;
    }
  }

  // Company signals
  if (company && signals.boostedCompanies.has(company) && !signals.penalizedCompanies.has(company)) {
    adjustment += 5;
  } else if (company && signals.penalizedCompanies.has(company) && !signals.boostedCompanies.has(company)) {
    adjustment -= 5;
  }

  // Industry signals (lighter touch since main scoring already handles this)
  if (industry && signals.boostedIndustries.has(industry) && !signals.penalizedIndustries.has(industry)) {
    adjustment += 3;
  } else if (industry && signals.penalizedIndustries.has(industry) && !signals.boostedIndustries.has(industry)) {
    adjustment -= 3;
  }

  // Location signals: a dismiss is often "wrong location", not "wrong
  // industry/company" - so it needs its own weighted vote rather than only
  // ever showing up as an industry/keyword penalty. Counts require a clear
  // majority (not just one stray swipe) before tipping, same as keywords.
  const locKey = normalizeLocationBucket(job);
  if (locKey) {
    const boostCount = signals.boostedLocations.get(locKey) || 0;
    const penaltyCount = signals.penalizedLocations.get(locKey) || 0;
    if (boostCount > penaltyCount) {
      adjustment += 4;
    } else if (penaltyCount > boostCount) {
      adjustment -= 4;
    }
  }

  // Clamp adjustment to ±15 points
  return Math.max(-15, Math.min(15, adjustment));
}

function applyBehavioralBoost(score: number, matches: string[], job: Job, affinity: IndustryAffinity | null): number {
  if (!affinity || affinity.max === 0 || !job.industry) return score;
  const ind = job.industry.toLowerCase().trim();
  const affinityScore = affinity.scores.get(ind) ?? 0;
  if (affinityScore === 0) return score;
  // Normalise to 0-1 then scale to max +10 boost
  const boost = Math.round((affinityScore / affinity.max) * 10);
  if (boost >= 3 && !matches.some(m => m === "Industry")) {
    matches.push("Trending for you");
  }
  return Math.min(100, score + boost);
}

function scoreJob(
  job: Job,
  profile: UserProfile,
  roleProfiles: Map<string, RoleRiasecProfile>,
  learned?: LearnedSignals,
  affinity?: IndustryAffinity | null,
): { score: number; matches: string[]; riasecMatch?: number } {
  const matches: string[] = [];
  const effectiveRoles = getEffectiveRoles(profile);
  const effectiveIndustries = getEffectiveIndustries(profile);
  const effectiveCareerLevel = getEffectiveCareerLevel(profile);
  const normalizedJobCategory = (job.ai_role_category || job.role_category || "").toLowerCase();
  const roleProfile = normalizedJobCategory ? roleProfiles.get(normalizedJobCategory) : undefined;

  const jobRiasec = job.job_traits?.riasec;
  const jobValues = job.job_traits?.values;
  const hasPerJobTraits = !!(jobRiasec && jobValues);

  let weightedScore = 0;
  let totalWeight = 0;

  // Industry - 40% (primary signal)
  if (effectiveIndustries.length > 0) {
    totalWeight += 40;
    if (job.industry && expandIndustrySlugs(effectiveIndustries).includes(toSlug(job.industry))) {
      weightedScore += 40;
      matches.push("Industry");
    }
  }

  // Role match - 20%
  if (effectiveRoles.length > 0) {
    totalWeight += 20;
    if (hasRoleMatch(job, profile)) {
      weightedScore += 20;
      matches.push("Role");
    }
  }

  // Wanted: target companies - flat +30 boost (very strong signal)
  const targetCompanies = profile.job_preferences?.targetCompanies || [];
  if (targetCompanies.length > 0 && job.company) {
    const jobCompany = job.company.toLowerCase().trim();
    const matchedCo = targetCompanies.find((c) => {
      const t = c.toLowerCase().trim();
      return jobCompany === t || jobCompany.includes(t) || t.includes(jobCompany);
    });
    if (matchedCo) {
      weightedScore += 30;
      matches.push(`Wanted · ${matchedCo}`);
    }
  }

  // Wanted: target role titles - flat +25 boost when title matches
  const targetRoles = profile.job_preferences?.targetRoles || [];
  if (targetRoles.length > 0 && job.title) {
    const jobTitle = job.title.toLowerCase();
    const matchedRole = targetRoles.find((r) => jobTitle.includes(r.toLowerCase().trim()));
    if (matchedRole) {
      weightedScore += 25;
      matches.push(`Wanted · ${matchedRole}`);
    }
  }

  // Passions - 25% (treat each loved thing as a strong signal: keyword match
  // in title/company/desc/tags, including jobs we scraped specifically for that
  // passion via the "passion-job" tag from fetch-external-jobs).
  const passionList = profile.job_preferences?.passions || [];
  const passionsText = profile.job_preferences?.passionsText || "";
  const passionKeywords = getPassionKeywords(passionList, passionsText);
  let isPassionTaggedJob = false;
  if (passionKeywords.length > 0) {
    totalWeight += 25;
    const matchedKw = jobMatchesPassion(job, passionKeywords);
    // Did this job come from a passion sweep that matches a user passion?
    const jobTagsLower = (job.tags || []).map((t) => t.toLowerCase());
    const matchedPassionTag = passionList.find((p) =>
      jobTagsLower.includes(`passion: ${p.toLowerCase()}`),
    );
    isPassionTaggedJob = !!matchedPassionTag;

    if (matchedKw || isPassionTaggedJob) {
      weightedScore += 25;
      const friendly = matchedPassionTag
        || passionList.find((p) => {
          const k = p.toLowerCase();
          if (matchedKw === k) return true;
          const mapped = PASSION_KEYWORD_MAP[k];
          return mapped?.includes(matchedKw || "");
        });
      matches.push(friendly ? `Passion post · ${friendly}` : "Passion post");
    }
  }

  // Loved Industry - 10% (passions → industry mapping; e.g. "Wine" → Beer/Hospitality)
  // Independent of explicit industry interests so it surfaces jobs the user
  // would never have searched for but would genuinely enjoy.
  if (passionList.length > 0 && job.industry) {
    const lovedIndustries = getIndustriesFromPassions(passionList);
    if (lovedIndustries.size > 0) {
      totalWeight += 10;
      if (lovedIndustries.has(job.industry.toLowerCase())) {
        weightedScore += 10;
        if (!matches.includes("Industry") && !matches.some((m) => m.startsWith("Passion post"))) {
          const driver = passionList.find((p) =>
            (PASSION_INDUSTRY_MAP[p.toLowerCase()] || []).some(
              (i) => i.toLowerCase() === job.industry!.toLowerCase(),
            ),
          );
          matches.push(driver ? `Passion post · ${driver}` : "Passion post");
        }
      }
    }
  }

  // Career Level - 15%
  if (effectiveCareerLevel) {
    totalWeight += 15;
    if (job.career_level && job.career_level.toLowerCase() === effectiveCareerLevel) {
      weightedScore += 15;
      matches.push("Level");
    }
  }

  // Location - 10%
  if (profile.location_preference) {
    totalWeight += 10;
    const pref = profile.location_preference.toLowerCase();
    if (job.location && job.location.toLowerCase().includes(pref)) {
      weightedScore += 10;
      matches.push("Location");
    } else if (job.work_mode?.toLowerCase() === "remote" && pref === "remote") {
      weightedScore += 10;
      matches.push("Location");
    }
  }

  // Personality (RIASEC) - 5%
  if (profile.riasec_scores && (hasPerJobTraits || roleProfile)) {
    totalWeight += 5;
    const userScores = profile.riasec_scores as unknown as Record<string, number>;
    const refScores = hasPerJobTraits ? jobRiasec : (roleProfile?.riasec_scores as unknown as Record<string, number> | undefined);
    if (refScores) {
      let dot = 0, magU = 0, magR = 0;
      for (const k of ["R","I","A","S","E","C"]) {
        const u = userScores[k] ?? 0;
        const r = (refScores as Record<string, number>)[k] ?? 0;
        dot += u * r; magU += u * u; magR += r * r;
      }
      const cosine = magU && magR ? dot / (Math.sqrt(magU) * Math.sqrt(magR)) : 0;
      const riasecScore = Math.max(0, (cosine - 0.5) * 2);
      weightedScore += riasecScore * 5;
      if (riasecScore > 0.3) matches.push("Personality");
    }
  }

  // Work Values - 5%
  if (profile.work_values && (hasPerJobTraits || roleProfile)) {
    totalWeight += 5;
    const userVals = profile.work_values as Record<string, number>;
    const refVals = hasPerJobTraits ? jobValues : roleProfile?.work_values as Record<string, number> | undefined;
    if (refVals) {
      const keys = Object.keys(userVals);
      if (keys.length > 0) {
        let sum = 0;
        for (const k of keys) {
          const diff = Math.abs((userVals[k] ?? 50) - ((refVals as Record<string, number>)[k] ?? 50));
          sum += 1 - diff / 100;
        }
        const valScore = sum / keys.length;
        weightedScore += valScore * 5;
        if (valScore > 0.6) matches.push("Values");
      }
    }
  }

  // Skills overlap (bonus, not weighted into 100%)
  if (hasPerJobTraits && job.job_traits?.key_skills && profile.understand_me_results?.transferableSkills) {
    const userSkills = profile.understand_me_results.transferableSkills.map((s) => s.toLowerCase());
    const jobSkills = job.job_traits.key_skills.map((s) => s.toLowerCase());
    const overlap = jobSkills.filter((js) => userSkills.some((us) => js.includes(us) || us.includes(js))).length;
    const ratio = jobSkills.length > 0 ? overlap / jobSkills.length : 0;
    if (ratio >= 0.2) matches.push("Skills");
  }

  // Intersection boost (+20 pts flat): job title matches a known cross-industry intersection role
  // for this user's combination of industry interests + AI-generated intersection ideas.
  // Only fires when the user has 2+ industries so the intersection concept is meaningful.
  if (effectiveIndustries.length >= 2 && job.title) {
    const staticKws = getIntersectionKeywords(effectiveIndustries);
    const aiIdeas: any[] = profile.understand_me_results?.intersectionIdeas || [];
    const aiKws = aiIdeas.flatMap((idea: any) => {
      const q: string = idea.search_query || "";
      return q ? [q] : [];
    });
    const allKws = [...staticKws, ...aiKws];
    if (allKws.length > 0) {
      const titleLower = job.title.toLowerCase();
      const matched = allKws.find((kw) => titleLower.includes(kw.toLowerCase()));
      if (matched) {
        weightedScore += 20;
        matches.push("Intersection match");
      }
    }
  }

  let score = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

  // Apply learning adjustment
  if (learned) {
    const adj = learningAdjustment(job, learned);
    score = Math.max(0, Math.min(100, score + adj));
    if (adj > 3) matches.push("✓ Learned");
    if (adj < -3) matches.push("↓ Learned");
  }

  // Apply industry-specific re-ranking boost (career-map roles + well-known
  // companies get a lift; generic recruiter-noise titles get pushed down).
  // Scale: boost is in [-3, +5] → adjusts score by up to ±15.
  const industryBoost = getIndustryRankBoost(job.industry, job.title, job.company);
  if (industryBoost !== 0) {
    score = Math.max(0, Math.min(100, score + industryBoost * 3));
    if (industryBoost >= 3) matches.push("Top employer");
    else if (industryBoost <= -3) matches.push("↓ Generic role");
  }

  // Passion-tagged job bonus - push these to the top of the inbox.
  // We pulled these jobs specifically for the user's passion (e.g. wine, golf),
  // so they deserve a strong flat boost regardless of industry/role match.
  if (isPassionTaggedJob) {
    score = Math.min(100, score + 20);
  }

  // Fresh jobs should surface fast in the inbox.
  score = Math.min(100, score + getFreshnessBoost(job.created_at));

  // Behavioural affinity boost - soft nudge based on what the user actually browses.
  score = applyBehavioralBoost(score, matches, job, affinity ?? null);

  return { score, matches };
}

/* ───── Job Card (click to open, X to dismiss) ───── */
// ─── Tinder-style swipeable job card ─────────────────────────────────────────
const SCORE_BANDS = [
  { min: 85, bg: "#00E600", label: "Perfect match" },
  { min: 70, bg: "#0a0a0a", label: "Strong match" },
  { min: 0,  bg: "#f5f5f5", label: "Worth a look" },
] as const;

function getScoreBand(score: number) {
  return SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

const INDUSTRY_LABELS: Record<string, string> = {
  bakery: "Bakery", beauty: "Beauty", beer: "Beer", building: "Building",
  cars: "Cars", charity: "Charity", cinema: "Film & TV", coffee: "Coffee",
  delivery: "Delivery", "estate-agency": "Estate Agency", farming: "Farming",
  fashion: "Fashion", fixing: "Fixing", football: "Football", footwear: "Footwear",
  gaming: "Gaming", grocery: "Grocery", health: "Health", "horse-racing": "Horse Racing",
  hospitality: "Food & Drink", "interior-design": "Interior Design",
  jewellery: "Jewellery", journalism: "Journalism", money: "Money", music: "Music",
  pets: "Pets", physiotherapy: "Physio", psychotherapy: "Therapy",
  teaching: "Teaching", tennis: "Tennis", travel: "Travel", wellness: "Wellness",
};

function normalizeJobType(raw: string | null): string | null {
  if (!raw) return null;
  // Take the first value when DB has comma-separated types
  const first = raw.split(",")[0].trim();
  const lc = first.toLowerCase();
  if (lc.includes("full")) return "Full-time";
  if (lc.includes("part")) return "Part-time";
  if (lc.includes("intern")) return "Internship";
  if (lc.includes("contract")) return "Contract";
  if (lc.includes("temp")) return "Temporary";
  if (lc.includes("perm")) return "Permanent";
  if (lc.includes("freelance")) return "Freelance";
  return first || null;
}

function TinderJobCard({
  job,
  onDismiss,
  onLike,
  onOpen,
  isTop,
  stackIndex,
  exitDirection,
}: {
  job: Job & { score: number; matches: string[] };
  onDismiss: (id: string) => void;
  onLike: (id: string) => void;
  onOpen: (url: string, id?: string) => void;
  isTop: boolean;
  stackIndex: number;
  exitDirection: "left" | "right" | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [30, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -30], [1, 0]);
  const cardScale = isTop ? 1 : Math.max(0.93, 1 - stackIndex * 0.035);
  const cardY = isTop ? 0 : stackIndex * 10;

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -80) onDismiss(job.id);
    else if (info.offset.x > 80) onLike(job.id);
  };

  const band = getScoreBand(job.score);
  const bandIsDark = band.bg === "#0a0a0a";
  const bandIsGreen = band.bg === "#00E600";
  const bandTextColor = bandIsDark || bandIsGreen ? "#ffffff" : "#0a0a0a";

  const industryLabel = job.industry ? (INDUSTRY_LABELS[job.industry] ?? job.industry) : null;
  const levelLabel = job.career_level ? (LEVEL_LABELS[job.career_level.toLowerCase()] ?? null) : null;
  const jobTypeLabel = normalizeJobType(job.type);
  const locationDisplay = [job.location, job.work_mode && job.work_mode !== job.location ? job.work_mode : null].filter(Boolean).join(" · ");

  return (
    <motion.div
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, zIndex: 10 - stackIndex }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
      className="absolute inset-0 bg-background border-[3px] border-foreground rounded-[28px] overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-[6px_6px_0_0_rgba(10,10,10,0.15)]"
      initial={false}
      animate={
        exitDirection === "left"
          ? { x: -600, rotate: -28, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
          : exitDirection === "right"
          ? { x: 600, rotate: 28, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
          : { scale: cardScale, y: cardY, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 32 } }
      }
    >
      {/* Score band header */}
      <div style={{ background: band.bg, color: bandTextColor }} className="px-5 py-2.5 flex items-center justify-between border-b-[3px] border-foreground">
        <span className="font-display font-900 text-sm tracking-wide">{job.score}% · {band.label}</span>
        {(() => { const src = detectJobSource(job.url); return src ? <SourceAttribution source={src} variant="badge" /> : null; })()}
      </div>

      {/* LIKE overlay */}
      {isTop && (
        <motion.div style={{ opacity: likeOpacity }} className="absolute inset-0 z-10 flex items-start justify-end p-5 pointer-events-none">
          <span className="border-[3px] border-[#00E600] text-[#00E600] bg-background/90 backdrop-blur-sm font-display font-900 text-2xl px-4 py-1.5 rounded-xl rotate-[-12deg] tracking-widest shadow-lg">LIKE</span>
        </motion.div>
      )}
      {/* NOPE overlay */}
      {isTop && (
        <motion.div style={{ opacity: nopeOpacity }} className="absolute inset-0 z-10 flex items-start justify-start p-5 pointer-events-none">
          <span className="border-[3px] border-red-500 text-red-500 bg-background/90 backdrop-blur-sm font-display font-900 text-2xl px-4 py-1.5 rounded-xl rotate-[12deg] tracking-widest shadow-lg">NOPE</span>
        </motion.div>
      )}

      {/* Card content */}
      <div className="h-full flex flex-col p-5" onClick={isTop ? () => onOpen(job.url, job.id) : undefined}>
        {/* Company logo + name + location */}
        <div className="flex items-center gap-3 mb-3">
          <CompanyLogo company={job.company} size={44} />
          <div className="min-w-0 flex-1">
            <p className="font-display font-800 text-sm truncate">{job.company}</p>
            {locationDisplay && (
              <p className="font-body text-xs text-muted-foreground truncate">{locationDisplay}</p>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-900 text-xl leading-[1.1] mb-2.5">{job.title}</h3>

        {/* Salary */}
        {job.salary && (
          <p className="inline-block w-fit font-display font-800 text-sm text-foreground bg-[#00E600]/20 border-2 border-[#00E600] px-2.5 py-1 rounded-lg mb-2.5">
            {job.salary}
          </p>
        )}

        {/* Metadata chips: industry · level · type */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {industryLabel && (
            <span className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary font-display text-[11px] font-700 rounded-full">
              {industryLabel}
            </span>
          )}
          {levelLabel && (
            <span className="px-2.5 py-1 bg-muted border border-border text-foreground/70 font-display text-[11px] font-700 rounded-full">
              {levelLabel}
            </span>
          )}
          {jobTypeLabel && (
            <span className="px-2.5 py-1 bg-muted border border-border text-foreground/70 font-display text-[11px] font-700 rounded-full">
              {jobTypeLabel}
            </span>
          )}
        </div>

        {/* Match tags */}
        {job.matches.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {job.matches.slice(0, 4).map((m) => (
              <span key={m} className="px-2.5 py-1 bg-foreground text-background font-display text-[10px] font-700 rounded-full">{m}</span>
            ))}
          </div>
        )}

        {/* Description snippet */}
        {job.description && (
          <p className="font-body text-[12px] text-foreground/65 leading-relaxed line-clamp-2 flex-1">{job.description.slice(0, 180)}</p>
        )}

        <div className="mt-auto pt-2.5 border-t border-foreground/10 flex items-center justify-between">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide">Tap to view full job</p>
          <p className="font-body text-[10px] text-muted-foreground">← swipe · →</p>
        </div>
      </div>
    </motion.div>
  );
}

// Card stack + action buttons
function TinderCardStack({
  jobs,
  isFallback,
  onDismiss,
  onLike,
  onSave,
  onOpen,
  savedIdSet,
}: {
  jobs: (Job & { score: number; matches: string[] })[];
  isFallback?: boolean;
  onDismiss: (id: string) => void;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onOpen: (url: string, id?: string) => void;
  savedIdSet: Set<string>;
}) {
  const [exiting, setExiting] = useState<{ id: string; direction: "left" | "right" } | null>(null);

  const visible = jobs.slice(0, 3);

  const runExit = (direction: "left" | "right", action: (id: string) => void) => {
    if (jobs.length === 0 || exiting) return;
    const id = jobs[0].id;
    setExiting({ id, direction });
    window.setTimeout(() => {
      action(id);
      setExiting(null);
    }, 300);
  };

  // Keyboard shortcuts: ← dismiss, → like, ↑ save, Enter open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!jobs.length || exiting) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); runExit("left", onDismiss); }
      else if (e.key === "ArrowRight") { e.preventDefault(); runExit("right", onLike); }
      else if (e.key === "ArrowUp") { e.preventDefault(); onSave(jobs[0].id); }
      else if (e.key === "Enter") { e.preventDefault(); onOpen(jobs[0].url, jobs[0].id); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [jobs, exiting]);

  if (jobs.length === 0) {
    return (
      <div className="border-[3px] border-foreground rounded-[28px] p-12 text-center bg-muted/20">
        <p className="font-display font-900 text-2xl mb-2">You're all caught up<span className="text-primary">.</span></p>
        <p className="font-body text-sm text-muted-foreground">New jobs arrive twice daily. Check back soon.</p>
      </div>
    );
  }

  const top = jobs[0];

  return (
    <div className="flex flex-col items-center gap-6">
      {isFallback && (
        <div className="w-full bg-[#00E600]/10 border-2 border-[#00E600] rounded-2xl px-4 py-3 text-center">
          <p className="font-display font-800 text-sm">Out of exact matches — here's what else you might like<span className="text-primary">.</span></p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">Picked using your role, passions and behaviour, just outside your usual industries.</p>
        </div>
      )}
      {/* Card stack */}
      <div className="relative w-full" style={{ height: 480 }}>
        {[...visible].reverse().map((job, i) => {
          const stackIndex = visible.length - 1 - i;
          return (
            <TinderJobCard
              key={job.id}
              job={job}
              onDismiss={(id) => runExit("left", onDismiss)}
              onLike={(id) => runExit("right", onLike)}
              onOpen={onOpen}
              isTop={stackIndex === 0}
              stackIndex={stackIndex}
              exitDirection={exiting?.id === job.id ? exiting.direction : null}
            />
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-5">
        <button
          onClick={() => runExit("left", onDismiss)}
          disabled={!!exiting}
          className="w-16 h-16 rounded-full border-[3px] border-red-500 text-red-500 bg-background flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-[4px_4px_0_0_rgba(239,68,68,0.25)] active:scale-95 disabled:opacity-50"
          title="Not for me"
        >
          <X className="w-7 h-7" strokeWidth={3} />
        </button>
        <button
          onClick={() => onSave(top.id)}
          className={`w-12 h-12 rounded-full border-[3px] flex items-center justify-center transition-colors shadow-sm active:scale-95 ${
            savedIdSet.has(top.id) ? "border-foreground bg-foreground text-background" : "border-foreground/30 text-foreground/50 hover:border-foreground hover:text-foreground"
          }`}
          title="Save for later"
        >
          {savedIdSet.has(top.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
        <button
          onClick={() => runExit("right", onLike)}
          disabled={!!exiting}
          className="w-16 h-16 rounded-full border-[3px] border-[#00E600] text-[#00E600] bg-background flex items-center justify-center hover:bg-[#00E600] hover:text-foreground transition-colors shadow-[4px_4px_0_0_rgba(0,230,0,0.3)] active:scale-95 disabled:opacity-50"
          title="Like — show me more like this"
        >
          <Heart className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>

      <p className="font-body text-[10px] text-muted-foreground text-center uppercase tracking-wide">
        Swipe or use ← → keys · ↑ save · Enter to open
      </p>

      <p className="font-display font-700 text-xs text-muted-foreground">{jobs.length} job{jobs.length !== 1 ? "s" : ""} in your stack</p>
    </div>
  );
}
const MyJobs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roleProfiles, setRoleProfiles] = useState<Map<string, RoleRiasecProfile>>(new Map());
  const minMatch = 60;
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set());
  const [dismissedLoaded, setDismissedLoaded] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likedJobs, setLikedJobs] = useState<Job[]>([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedLoaded, setLikedLoaded] = useState(false);
  // Gate the swipe stack on having a fresh read of what's already been
  // swiped, so a reload can't briefly re-show cards you already actioned
  // (which looked like the deck "resetting" while dismissed/liked state
  // was still in flight from the DB).
  const historyReady = dismissedLoaded && likedLoaded;
  const [employerRequests, setEmployerRequests] = useState<Array<{
    id: string;
    company_name: string;
    message: string | null;
    created_at: string;
    status: string;
    reply_message: string | null;
    replied_at: string | null;
  }>>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "search" | "jobs" | "liked" | "saved" | "members" | "links") || "jobs";
  const [inboxTab, setInboxTab] = useState<"search" | "jobs" | "liked" | "saved" | "members" | "links">(initialTab);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [memberAlerts, setMemberAlerts] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const refresh = async () => {
      const [reqRes, msgRes] = await Promise.all([
        supabase.from("member_connections").select("id", { count: "exact", head: true })
          .eq("recipient_id", user.id).eq("status", "pending"),
        supabase.from("member_messages").select("id", { count: "exact", head: true })
          .eq("recipient_id", user.id).is("read_at", null),
      ]);
      if (cancelled) return;
      setMemberAlerts((reqRes.count || 0) + (msgRes.count || 0));
    };
    refresh();
    const ch = supabase
      .channel(`member-alerts-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "member_connections", filter: `recipient_id=eq.${user.id}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "member_messages", filter: `recipient_id=eq.${user.id}` }, refresh)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate(`/auth?next=${encodeURIComponent("/my-jobs")}`);
      return;
    }

    loadData();
  }, [user, authLoading, navigate]);

  // Load saved jobs
  const loadSavedJobs = useCallback(async () => {
    if (!user) return;

    const savedKey = `myjobs-saved:${user.id}`;
    const cached = getCached<Job[]>(savedKey, 5 * 60 * 1000);
    if (cached) {
      setSavedJobs(cached);
      setSavedLoading(false);
    } else {
      setSavedLoading(true);
    }

    const { data: saves } = await supabase
      .from("saved_jobs")
      .select("job_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const jobIds = (saves ?? []).map((s) => s.job_id as string);
    if (jobIds.length === 0) {
      setSavedJobs([]);
      setCached(savedKey, [] as Job[]);
      setSavedLoading(false);
      return;
    }
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags")
      .in("id", jobIds);
    // Preserve save order
    const map = new Map((jobsData ?? []).map((j: any) => [j.id, j]));
    const ordered = jobIds.map((id) => map.get(id)).filter(Boolean) as Job[];
    setSavedJobs(ordered);
    setCached(savedKey, ordered);
    setSavedLoading(false);
  }, [user]);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  const unsaveJob = async (jobId: string) => {
    if (!user) return;
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
    invalidateCache(`myjobs-saved:${user.id}`);
    toast({ title: "Job removed from saved" });
  };

  const toggleSaveJob = useCallback(async (jobId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const already = savedJobs.some((j) => j.id === jobId);
    if (already) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
      invalidateCache(`myjobs-saved:${user.id}`);
      toast({ title: "Removed from saved" });
    } else {
      // Optimistic add - pull job from current `jobs` list if available
      const job = jobs.find((j) => j.id === jobId);
      if (job) setSavedJobs((prev) => [job, ...prev]);
      const { error } = await supabase
        .from("saved_jobs")
        .upsert({ user_id: user.id, job_id: jobId }, { onConflict: "user_id,job_id" });
      if (error) {
        // Roll back optimistic add
        setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
        toast({ title: "Couldn't save job", description: error.message, variant: "destructive" });
      } else {
        invalidateCache(`myjobs-saved:${user.id}`);
        toast({
          title: "Saved to your list",
          description: "View saved →",
          action: (
            <button
              onClick={() => setInboxTab("saved")}
              className="text-xs font-display font-700 underline underline-offset-2"
            >
              View saved
            </button>
          ),
        } as any);
      }
    }
  }, [user, navigate, savedJobs, jobs]);

  const savedIdSet = useMemo(() => new Set(savedJobs.map((j) => j.id)), [savedJobs]);

  const loadLikedJobs = useCallback(async () => {
    if (!user) return;
    setLikedLoading(true);
    try {
      const { data: likes, error: likesError } = await supabase
        .from("liked_jobs")
        .select("job_id, liked_at")
        .eq("user_id", user.id)
        .order("liked_at", { ascending: false });

      if (likesError) throw likesError;

      const jobIds = (likes ?? []).map((l) => l.job_id as string);
      // Set the exclusion set from the raw likes list FIRST, before any
      // detail-hydration or staleness pruning below. This is what stops
      // already-liked jobs from reappearing in the swipe stack - it must
      // not depend on the (separate, more failure-prone) job-details fetch
      // succeeding. A previous version only set this after that second
      // fetch completed, so any hiccup there silently left liked jobs
      // fully unprotected for the rest of the session.
      setLikedIds(new Set(jobIds));

      if (jobIds.length === 0) { setLikedJobs([]); setLikedLoading(false); setLikedLoaded(true); return; }

      const now = new Date().toISOString();
      const { data: jobData, error: jobsError } = await supabase
        .from("jobs")
        .select("id,title,company,location,salary,industry,career_level,url,created_at,type,work_mode,role_category,ai_role_category,job_traits,description,tags,expires_at")
        .in("id", jobIds)
        .or(`expires_at.is.null,expires_at.gt.${now}`);

      if (jobsError) throw jobsError;

      // Only treat a liked job as "stale and safe to delete" when this fetch
      // definitely succeeded - never prune based on a failed/partial query.
      const liveIds = new Set((jobData ?? []).map((j: any) => j.id));
      const staleIds = jobIds.filter((id) => !liveIds.has(id));
      if (staleIds.length > 0) {
        await supabase.from("liked_jobs").delete().eq("user_id", user.id).in("job_id", staleIds);
        setLikedIds((prev) => { const next = new Set(prev); staleIds.forEach((id) => next.delete(id)); return next; });
      }

      // Clean up duplicate likes from before the dedupe fix - same real job
      // liked multiple times as separate DB rows. `likes` is already ordered
      // most-recent-first, so keep the first (newest) copy per dedupe key
      // and delete the rest, both from the list and from the DB.
      const jobById = new Map(((jobData ?? []) as any[]).map((j) => [j.id, j]));
      const seenKeys = new Set<string>();
      const deduped: Job[] = [];
      const duplicateIdsToDelete: string[] = [];
      for (const like of (likes ?? [])) {
        const job = jobById.get(like.job_id);
        if (!job) continue;
        const key = jobDedupeKey(job);
        if (seenKeys.has(key)) {
          duplicateIdsToDelete.push(like.job_id);
          continue;
        }
        seenKeys.add(key);
        deduped.push(job as Job);
      }
      if (duplicateIdsToDelete.length > 0) {
        await supabase.from("liked_jobs").delete().eq("user_id", user.id).in("job_id", duplicateIdsToDelete);
        setLikedIds((prev) => { const next = new Set(prev); duplicateIdsToDelete.forEach((id) => next.delete(id)); return next; });
      }

      setLikedJobs(deduped);
    } catch (_) {}
    setLikedLoading(false);
    setLikedLoaded(true);
  }, [user]);

  useEffect(() => {
    loadLikedJobs();
  }, [loadLikedJobs]);

  const loadData = async () => {
    if (!user) return;

    // Cache-first paint: if we have a recent snapshot, show it instantly while
    // the fresh fetch runs in the background. Big win on tab switches because
    // the jobs query paginates up to 5,000 rows.
    const jobsKey = `myjobs-matched:${user.id}`;
    const cachedJobs = getCached<Job[]>(jobsKey, 5 * 60 * 1000);
    if (cachedJobs) {
      setJobs(cachedJobs);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const [profileRes, roleProfilesRes, dismissedRes, requestsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("career_level, industry_interests, newsletter_industries, location_preference, role_preferences, salary_expectation, understand_me_results, riasec_scores, work_values, job_preferences, share_details_default, photo_url")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("role_riasec_profiles").select("role_category, riasec_scores, work_values"),
        supabase.from("dismissed_jobs").select("job_id, reason, dismissed_at").eq("user_id", user.id),
        supabase
          .from("contact_requests")
          .select("id, message, reply_message, replied_at, created_at, status, employer_companies:company_id(name)")
          .eq("candidate_user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setEmployerRequests(
        (requestsRes.data || []).map((r: any) => ({
          id: r.id,
          company_name: r.employer_companies?.name ?? "An employer",
          message: r.message,
          created_at: r.created_at,
          status: r.status,
          reply_message: r.reply_message ?? null,
          replied_at: r.replied_at ?? null,
        }))
      );

      const nextProfile = (profileRes.data as unknown as UserProfile) || null;
      setProfile(nextProfile);
      setPhotoUrl((profileRes.data as any)?.photo_url ?? null);

      const map = new Map<string, RoleRiasecProfile>();
      for (const rp of roleProfilesRes.data || []) {
        map.set(rp.role_category, rp as unknown as RoleRiasecProfile);
      }
      setRoleProfiles(map);

      // Dismissals older than the cooldown get a second chance — a "no" today
      // doesn't mean "no" forever, and it keeps the stack from running dry for
      // fast swipers in narrow industries.
      const DISMISS_COOLDOWN_DAYS = 21;
      const cooldownCutoff = Date.now() - DISMISS_COOLDOWN_DAYS * 86_400_000;
      const dismissed = new Set<string>();
      const opened = new Set<string>();
      for (const d of dismissedRes.data || []) {
        if ((d as any).reason === "opened") {
          opened.add((d as any).job_id);
        } else {
          const dismissedAt = (d as any).dismissed_at ? new Date((d as any).dismissed_at).getTime() : Date.now();
          if (dismissedAt >= cooldownCutoff) dismissed.add((d as any).job_id);
        }
      }
      setDismissedIds(dismissed);
      setOpenedIds(opened);
      setDismissedLoaded(true);

      if (!nextProfile) {
        setJobs([]);
        return;
      }

      const minSalary = nextProfile.salary_expectation ? (SALARY_THRESHOLDS[nextProfile.salary_expectation] || 0) : 0;

      // ── Pre-scored path ──────────────────────────────────────────────────────
      // job_matches is populated server-side by score-new-jobs after each scrape.
      // If we have >= 50 entries, use that pre-ranked pool instead of paginating
      // 2,000 newest jobs and scoring everything in the browser. The client still
      // runs the full scoreJob() pass — this just gives it better raw candidates.
      const passesAllFiltersPreScored = (job: Job) =>
        isLiveJob(job) &&
        !dismissed.has(job.id) &&
        !shouldExcludeJob(job, nextProfile) &&
        passesSalaryFilter(job, minSalary);

      const { data: preMatches } = await supabase
        .from("job_matches")
        .select("job_id, score")
        .eq("user_id", user.id)
        .order("score", { ascending: false })
        .limit(500);

      if (preMatches && preMatches.length >= 50) {
        const preJobIds = (preMatches as { job_id: string; score: number }[]).map((m) => m.job_id);
        const { data: preJobs } = await supabase
          .from("jobs")
          .select("id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags, ai_confidence, expires_at")
          .in("id", preJobIds)
          .gt("expires_at", new Date().toISOString());

        if (preJobs && preJobs.length > 0) {
          // Re-order by pre-score — the DB fetch doesn't preserve IN-list order
          const scoreMap = new Map(
            (preMatches as { job_id: string; score: number }[]).map((m) => [m.job_id, m.score]),
          );
          const sortedPreJobs = (preJobs as unknown as Job[])
            .filter(passesAllFiltersPreScored)
            .sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));

          // Only use the pre-scored path if jobs remain after filtering out dismissed/excluded.
          // If the entire pool has been swiped, fall through to the full paginated fetch.
          if (sortedPreJobs.length > 0) {
            setJobs(sortedPreJobs);
            setCached(jobsKey, sortedPreJobs);
            setLoading(false);
            return;
          }
        }
      }
      // ── End pre-scored path — fall through to paginated fetch ────────────────

      const candidateTarget = 300;
      const pageSize = 500;
      const maxRows = 2000;
      const matchedJobs: Job[] = [];

      const passesAllFilters = (job: Job) =>
        isLiveJob(job) &&
        !dismissed.has(job.id) &&
        !shouldExcludeJob(job, nextProfile) &&
        passesSalaryFilter(job, minSalary);

      // Build industry filter at DB level — massive performance win now we have 25k+ jobs.
      // Only skip the filter if the user has no industry signal at all (show everything).
      const effectiveIndustries = getEffectiveIndustries(nextProfile);
      const passionIndustries = Array.from(getIndustriesFromPassions(nextProfile.job_preferences?.passions || []));
      const allIndustrySlugs = [...new Set([
        ...expandIndustrySlugs(effectiveIndustries),
        ...passionIndustries,
      ])].filter(Boolean);

      const buildQuery = () => {
        let q = supabase
          .from("jobs")
          .select("id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags, ai_confidence, expires_at")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false });
        if (allIndustrySlugs.length > 0) {
          // Always include "other" so role-matched cross-industry jobs surface
          // in the "Roles you might not have considered" section.
          q = q.in("industry", [...allIndustrySlugs, "other"]);
        }
        return q;
      };

      const { data: firstPage } = await buildQuery().range(0, pageSize - 1);

      if (firstPage?.length) {
        matchedJobs.push(...(firstPage as unknown as Job[]).filter(passesAllFilters));
        setJobs([...matchedJobs]);
        setLoading(false);
      } else {
        setJobs([]);
      }

      for (let from = pageSize; from < maxRows && matchedJobs.length < candidateTarget; from += pageSize) {
        const { data: jobsPage, error } = await buildQuery().range(from, from + pageSize - 1);

        if (error || !jobsPage?.length) break;

        matchedJobs.push(...(jobsPage as unknown as Job[]).filter(passesAllFilters));

        if (jobsPage.length < pageSize) break;
      }

      // Narrow industry lists (or fast swipers who've cleared their usual pool)
      // can run the industry-scoped fetch dry. Top up with a cross-industry
      // batch so the algorithm always has fresh material to recommend from —
      // scoreJob still ranks these on role/passion/behaviour fit, this just
      // stops the well running dry.
      const TOPUP_TARGET = 150;
      if (allIndustrySlugs.length > 0 && matchedJobs.length < TOPUP_TARGET) {
        const seenIds = new Set(matchedJobs.map((j) => j.id));
        const { data: topup } = await supabase
          .from("jobs")
          .select("id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags, ai_confidence, expires_at")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .range(0, 300);
        for (const job of (topup as unknown as Job[]) || []) {
          if (seenIds.has(job.id)) continue;
          if (passesAllFilters(job)) {
            matchedJobs.push(job);
            seenIds.add(job.id);
          }
        }
      }

      setJobs(matchedJobs);
      setCached(jobsKey, matchedJobs);
    } finally {
      setLoading(false);
    }
  };

  // The same real-world job often exists as multiple DB rows (scraped from
  // Adzuna, Reed, Jooble etc with slightly different company formatting).
  // When a user swipes on one copy, sweep the rest away too so it doesn't
  // reappear moments later as a "new" card.
  const findDuplicateJobIds = useCallback((jobId: string): string[] => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return [jobId];
    const key = jobDedupeKey(target);
    const dupes = jobs.filter((j) => jobDedupeKey(j) === key).map((j) => j.id);
    return dupes.length > 0 ? dupes : [jobId];
  }, [jobs]);

  const handleDismiss = useCallback(async (jobId: string) => {
    if (!user) return;
    const duplicateIds = findDuplicateJobIds(jobId);

    // Re-check session freshness - RLS will reject if the JWT is stale/missing
    const { data: sessionData } = await supabase.auth.getSession();
    const activeUserId = sessionData?.session?.user?.id;
    if (!activeUserId) {
      toast({
        title: "Session expired",
        description: "Please sign in again to dismiss jobs.",
        variant: "destructive",
      });
      return;
    }

    let openedThatWereCleared: string[] = [];

    const rollbackDismiss = () => {
      setDismissedIds((prev) => {
        const next = new Set(prev);
        duplicateIds.forEach((id) => next.delete(id));
        return next;
      });

      if (openedThatWereCleared.length > 0) {
        setOpenedIds((prev) => new Set([...prev, ...openedThatWereCleared]));
      }
    };

    setDismissedIds((prev) => new Set([...prev, ...duplicateIds]));

    setOpenedIds((prev) => {
      openedThatWereCleared = duplicateIds.filter((id) => prev.has(id));
      if (openedThatWereCleared.length === 0) return prev;
      const next = new Set(prev);
      openedThatWereCleared.forEach((id) => next.delete(id));
      return next;
    });

    const { error: deleteError } = await supabase
      .from("dismissed_jobs")
      .delete()
      .eq("user_id", activeUserId)
      .in("job_id", duplicateIds);

    if (deleteError) {
      console.error("Failed to clear existing job status", deleteError);
      rollbackDismiss();
      toast({
        title: "Could not dismiss job",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    const { error: insertError } = await supabase
      .from("dismissed_jobs")
      .insert(duplicateIds.map((id) => ({ user_id: activeUserId, job_id: id, reason: "dismissed", dismissed_at: new Date().toISOString() })));

    if (insertError) {
      console.error("Failed to dismiss job", insertError);
      rollbackDismiss();
      toast({
        title: "Could not dismiss job",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Stale matched-jobs cache after a dismiss so the next load excludes it.
    invalidateCache(`myjobs-matched:${activeUserId}`);



    toast({
      title: "Job dismissed",
      description: "Click here to undo",
      action: (
        <button
          onClick={async () => {
            setDismissedIds((prev) => {
              const next = new Set(prev);
              duplicateIds.forEach((id) => next.delete(id));
              return next;
            });
            await supabase.from("dismissed_jobs").delete().eq("user_id", activeUserId).in("job_id", duplicateIds);
          }}
          className="font-display text-xs font-700 px-3 py-1.5 bg-foreground text-background rounded-full hover:bg-foreground/80 transition-colors"
        >
          Click here to undo
        </button>
      ),
    });
  }, [user, findDuplicateJobIds]);

  const handleLike = useCallback(async (jobId: string) => {
    if (!user) return;
    const duplicateIds = findDuplicateJobIds(jobId);
    setLikedIds((prev) => new Set([...prev, ...duplicateIds]));
    const job = jobs.find((j) => j.id === jobId);
    if (job) setLikedJobs((prev) => [job, ...prev.filter((j) => !duplicateIds.includes(j.id))]);
    try {
      await supabase.from("liked_jobs").upsert(
        duplicateIds.map((id) => ({ user_id: user.id, job_id: id, liked_at: new Date().toISOString() })),
        { onConflict: "user_id,job_id" },
      );
      trackInteraction({ type: "job_click", industry: job?.industry ?? undefined, jobId, metadata: { source: "like" } });
    } catch (_) {}
    toast({ title: "Liked", description: "Howdy will show you more like this." });
  }, [user, jobs, findDuplicateJobIds]);

  const handleUnlike = useCallback(async (jobId: string) => {
    if (!user) return;
    setLikedIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
    setLikedJobs((prev) => prev.filter((j) => j.id !== jobId));
    try { await supabase.from("liked_jobs").delete().eq("user_id", user.id).eq("job_id", jobId); } catch (_) {}
  }, [user]);

  const handleOpen = useCallback((url: string, jobId?: string) => {
    // Route to Marketplace's fuller job view with the "Howdy can help" helper
    // pre-opened, instead of sending users straight to the external posting.
    if (jobId) {
      navigate(`/marketplace?jobId=${jobId}`);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    // Track this as an "opened" job for learning
    if (user && jobId && !openedIds.has(jobId)) {
      setOpenedIds((prev) => new Set(prev).add(jobId));
      supabase.from("dismissed_jobs").insert({
        user_id: user.id,
        job_id: jobId,
        reason: "opened",
      }).then(({ error }) => {
        if (error && !error.message?.includes("duplicate")) {
          console.error("Failed to track opened job", error);
        }
      });
      // Log a job_click interaction so the brand's employer dashboard
      // sees this candidate engaged with one of their listings - even
      // when the job came from Adzuna / Reed / RSS sources.
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        trackInteraction({
          type: "job_click",
          companySlug: getCompanySlug(job.company) ?? undefined,
          industry: job.industry ?? undefined,
          jobId: job.id,
          metadata: { title: job.title, company: job.company, source: "my-jobs" },
        });
      }
    }
  }, [user, openedIds, jobs, navigate]);

  // The `jobs` candidate pool and `likedIds` are matched by literal DB row id,
  // but the same real posting (esp. from Jooble, which appends per-search
  // tracking params to the URL) frequently gets re-scraped as a brand new row
  // with a different id. That row was never swiped, so id-based exclusion
  // lets it right back into the stack looking like the identical job you
  // already liked. Belt-and-braces: also exclude by normalized title+company
  // key against every job we know is liked (we have full details for those).
  const likedDedupeKeys = useMemo(
    () => new Set(likedJobs.map((j) => jobDedupeKey(j))),
    [likedJobs],
  );

  // Build learning signals from dismiss/open history
  const learnedSignals = useMemo(() => {
    return buildLearnedSignals(jobs, dismissedIds, openedIds, likedIds);
  }, [jobs, dismissedIds, openedIds, likedIds]);

  const behavioralAffinity = useBehavioralAffinity();

  const scoredJobs = useMemo(() => {
    if (!profile) return { primary: [], broader: [] };

    const requireRoleMatch = shouldRequireRoleMatch(profile);
    const minSalary = profile.salary_expectation ? (SALARY_THRESHOLDS[profile.salary_expectation] || 0) : 0;
    const MIN_PER_INDUSTRY = 2;

    const baseScoredRaw = jobs
      .filter((job) => !dismissedIds.has(job.id) && !likedIds.has(job.id) && !likedDedupeKeys.has(jobDedupeKey(job)))
      .map((job) => ({ ...job, ...scoreJob(job, profile, roleProfiles, learnedSignals, behavioralAffinity) }))
      .filter((job) => !shouldExcludeJob(job, profile))
      .filter((job) => passesSalaryFilter(job, minSalary))
      .sort((a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Dedupe by (normalized title + company) - keep highest-scoring listing per unique role.
    // Many retailers post the SAME role for every store branch with the only difference
    // being the store name in the title (e.g. "Brand Specialist - Fenwick Tunbridge Wells"
    // vs "Brand Specialist - John Lewis Bluewater"), and the same real posting often gets
    // scraped from multiple boards with slightly different company formatting - see
    // jobDedupeKey / handleLike / handleDismiss, which sweep all copies together.
    const seenRoles = new Set<string>();
    const baseScored = baseScoredRaw.filter((job) => {
      const normTitle = normalizeTitleForDedupe(job.title || "");
      if (!normTitle) return true;
      const key = jobDedupeKey(job);
      if (seenRoles.has(key)) return false;
      seenRoles.add(key);
      return true;
    });

    const allScored = requireRoleMatch
      ? (() => {
          const roleMatched = baseScored.filter((job) => hasRoleMatch(job, profile));
          return roleMatched.length > 0 ? roleMatched : baseScored;
        })()
      : baseScored;

    // Guarantee at least MIN_PER_INDUSTRY jobs per interested industry
    const guaranteed = new Set<string>();
    const industryCounts: Record<string, number> = {};
    const interests = profile.industry_interests || [];
    const interestSlugs = new Set(expandIndustrySlugs(interests));

    // First pass: collect top jobs per industry that are below minMatch
    const belowThreshold: typeof allScored = [];
    const aboveThreshold: typeof allScored = [];

    for (const job of allScored) {
      if (job.score >= minMatch) {
        aboveThreshold.push(job);
      } else {
        belowThreshold.push(job);
      }
    }

    // Count how many above-threshold jobs each industry already has
    for (const job of aboveThreshold) {
      const ind = job.industry ? toSlug(job.industry) : "other";
      industryCounts[ind] = (industryCounts[ind] || 0) + 1;
    }

    // Fill up industries that have fewer than MIN_PER_INDUSTRY
    for (const job of belowThreshold) {
      const ind = job.industry ? toSlug(job.industry) : "other";
      if (interestSlugs.size > 0 && !interestSlugs.has(ind)) continue;
      if ((industryCounts[ind] || 0) < MIN_PER_INDUSTRY) {
        guaranteed.add(job.id);
        industryCounts[ind] = (industryCounts[ind] || 0) + 1;
      }
    }

    return {
      primary: [...aboveThreshold, ...belowThreshold.filter((j) => guaranteed.has(j.id))]
        .filter((j) => j.industry !== "other")
        .sort((a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      // Broader pool: everything that passed scoring/exclusion, no industry-only
      // restriction and no minMatch cutoff — this is the algorithm's best guess
      // at what else you'd like, used when the strict stack runs dry.
      broader: allScored.sort((a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    };
  }, [jobs, profile, minMatch, roleProfiles, dismissedIds, likedIds, likedDedupeKeys, openedIds, learnedSignals, behavioralAffinity]);

  const primaryScoredJobs = scoredJobs.primary;
  const broaderScoredJobs = useMemo(
    () => scoredJobs.broader.filter((j) => !primaryScoredJobs.some((p) => p.id === j.id)).slice(0, 40),
    [scoredJobs, primaryScoredJobs],
  );

  // Jobs from the "other" bucket that match the user's role preferences —
  // surfaced separately as "roles you might not have considered".
  const discoverJobs = useMemo(() => {
    if (!profile) return [];
    const effectiveRoles = getEffectiveRoles(profile);
    if (effectiveRoles.length === 0) return [];
    return jobs
      .filter((job) => job.industry === "other" && !dismissedIds.has(job.id) && !likedIds.has(job.id) && !likedDedupeKeys.has(jobDedupeKey(job)))
      .map((job) => ({ ...job, ...scoreJob(job, profile, roleProfiles, learnedSignals, behavioralAffinity) }))
      .filter((job) => hasRoleMatch(job, profile) && job.score >= 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [jobs, profile, roleProfiles, dismissedIds, likedIds, likedDedupeKeys, learnedSignals, behavioralAffinity]);

  const hasPreferences = profile && (
    (profile.industry_interests && profile.industry_interests.length > 0) ||
    getEffectiveCareerLevel(profile) ||
    profile.location_preference ||
    (profile.role_preferences && profile.role_preferences.length > 0) ||
    (profile.understand_me_results?.roleMatches && profile.understand_me_results.roleMatches.length > 0) ||
    profile.understand_me_results
  );


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const navItems: { value: typeof inboxTab; label: string; icon: React.ReactNode; badge?: number; highlight?: boolean; to?: string }[] = [
    { value: "search",  label: "Jobs",        icon: <Search className="w-[22px] h-[22px]" />, to: "/marketplace" },
    { value: "jobs",    label: "Howdy Jobs",  icon: <img src={howdyMascot} alt="" className="w-7 h-7 object-contain" />, badge: primaryScoredJobs.length || broaderScoredJobs.length },
    { value: "liked",   label: "Liked",       icon: <Heart className="w-[22px] h-[22px]" />, badge: likedJobs.length || undefined },
    { value: "saved",   label: "Saved",       icon: <Bookmark className="w-[22px] h-[22px]" />, badge: savedJobs.length || undefined },
    { value: "links",   label: "Settings",    icon: <Globe className="w-[22px] h-[22px]" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/my-jobs" title="Howdy Jobs" noIndex />
      <div className="max-w-3xl lg:max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8">

        {/* Editorial header — calm, two-line greeting, tagline, inbox bubble */}
        <header className="flex items-start gap-3 sm:gap-4 mb-7 sm:mb-9">
          <Link
            to="/my-profile"
            aria-label="My Profile"
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-muted shrink-0 ring-1 ring-foreground/10 hover:ring-foreground/30 transition mt-1"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-foreground/5 flex items-center justify-center font-display font-900 text-foreground text-lg">
                {((user?.user_metadata as any)?.full_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#00E600] ring-2 ring-background" aria-hidden />
          </Link>

          <div className="flex-1 min-w-0">
            {(() => {
              const firstName = (user?.user_metadata as any)?.full_name?.split(" ")[0];
              return (
                <h1 className="font-display font-900 text-[26px] sm:text-[34px] leading-[1.02] tracking-tight text-foreground break-words">
                  Howdoyoudo<span className="text-[#00E600]">?</span>
                  {firstName ? (
                    <>
                      <br />
                      <span className="text-[#00E600]">{firstName}</span>
                    </>
                  ) : null}
                </h1>
              );
            })()}
            <p className="mt-2 font-body text-[13px] sm:text-sm text-foreground/55 leading-snug">
              Your world. Your feed. Your opportunities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/inbox")}
            aria-label="Open inbox"
            className="relative w-11 h-11 rounded-full flex items-center justify-center text-foreground bg-foreground/[0.04] hover:bg-foreground/10 transition shrink-0 mt-1"
          >
            <Inbox className="w-[20px] h-[20px]" />
            {employerRequests.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#00E600] text-foreground font-display font-900 text-[10px] px-1 ring-2 ring-background">
                {employerRequests.length}
              </span>
            )}
          </button>
          <Link
            to="/howdy"
            aria-label="Open Howdy"
            className="relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-1 bg-[#00E600] ring-2 ring-foreground/10 hover:ring-foreground/30 transition overflow-hidden"
          >
            <img src={howdyMascot} alt="" className="w-8 h-8 object-contain" />
          </Link>
        </header>


        {/* Tab state container - bottom nav drives this */}
        <Tabs value={inboxTab} onValueChange={(v) => setInboxTab(v as typeof inboxTab)} className="w-full">


          {/* ─── QUICK LINKS TAB ─── */}
          <TabsContent value="links" className="mt-0 focus-visible:outline-none">
            {profile?.industry_interests && profile.industry_interests.length > 0 ? (
              <div className="border-2 border-foreground p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Pin className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-900 text-sm uppercase tracking-wider text-foreground">
                    Your pinned industries
                  </h2>
                  <Link to="/my-profile" className="ml-auto font-display text-[10px] font-700 uppercase tracking-wider text-primary hover:underline">
                    Edit
                  </Link>
                </div>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  Tap any pin to jump straight into that industry hub.
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.industry_interests.map((ind) => {
                    const slug = ind.toLowerCase().trim().replace(/\s+/g, "-");
                    const label = ind.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    return (
                      <Link
                        key={slug}
                        to={`/${slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-background text-foreground font-display text-xs font-700 border-2 border-foreground rounded-full shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        title={`Open ${label}`}
                      >
                        📌 {label}
                      </Link>
                    );
                  })}
                </div>

                {/* Other preference chips */}
                {(profile.role_preferences?.length || profile.location_preference || getEffectiveCareerLevel(profile)) && (
                  <div className="mt-5 pt-4 border-t-2 border-foreground/10">
                    <p className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-2">
                      Also matching on
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.role_preferences && profile.role_preferences.length > 0 && (
                        <>
                          {profile.role_preferences.map((rp) => {
                            const needle = rp.toString().trim().toLowerCase();
                            const match = roles.find(
                              (r) =>
                                r.slug.toLowerCase() === needle ||
                                r.title.toLowerCase() === needle ||
                                r.slug.toLowerCase() === needle.replace(/\s+/g, "-"),
                            );
                            const label = match?.title ?? rp;
                            const slug = match?.slug ?? needle.replace(/\s+/g, "-");
                            return (
                              <Link
                                key={`role-${slug}`}
                                to={`/roles/${slug}`}
                                title={`Open ${label}`}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-foreground/10 text-foreground font-display text-xs font-600 border-2 border-foreground/80 rounded-full hover:bg-primary/15 hover:border-foreground transition-colors"
                              >
                                <Search className="w-3 h-3" />
                                {label}
                              </Link>
                            );
                          })}
                        </>
                      )}
                      {getEffectiveCareerLevel(profile) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary font-display text-xs font-600 border-2 border-foreground/80 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          {LEVEL_LABELS[getEffectiveCareerLevel(profile) as CareerLevel] || getEffectiveCareerLevel(profile)}
                        </span>
                      )}
                      {profile.location_preference && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary font-display text-xs font-600 border-2 border-foreground/80 rounded-full">
                          <MapPin className="w-3 h-3" />
                          {profile.location_preference}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Most Wanted companies */}
                <div className="mt-5 pt-4 border-t-2 border-foreground/10">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">
                      ⭐ Most wanted
                    </p>
                    <Link
                      to="/my-profile?edit=most-wanted"
                      className="ml-auto font-display text-[10px] font-700 uppercase tracking-wider text-primary hover:underline"
                    >
                      {profile.job_preferences?.targetCompanies?.length ? "Edit" : "Add"}
                    </Link>
                  </div>

                  {profile.job_preferences?.targetCompanies && profile.job_preferences.targetCompanies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.job_preferences.targetCompanies.map((co) => {
                        const externalUrl = getCompanyExternalUrl(co);
                        const profilePath = getCompanyProfilePath(co);
                        const slug = getCompanySlug(co);
                        const chip = (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background text-foreground font-display text-xs font-700 border-2 border-foreground rounded-full shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            ⭐ {co}
                          </span>
                        );

                        if (externalUrl) {
                          return (
                            <a
                              key={`co-${co}`}
                              href={externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Open ${co}`}
                              onClick={() => {
                                trackInteraction({
                                  type: "company_view",
                                  companySlug: slug ?? undefined,
                                  metadata: { company_name: co, source: "my_jobs_quick_links", destination: externalUrl },
                                });
                              }}
                            >
                              {chip}
                            </a>
                          );
                        }

                        return profilePath ? (
                          <Link
                            key={`co-${co}`}
                            to={profilePath}
                            title={`Open ${co} profile`}
                            onClick={() => {
                              trackInteraction({
                                type: "company_view",
                                companySlug: slug ?? undefined,
                                metadata: { company_name: co, source: "my_jobs_quick_links" },
                              });
                            }}
                          >
                            {chip}
                          </Link>
                        ) : (
                          <span key={`co-${co}`} title={co}>{chip}</span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="font-body text-xs text-muted-foreground">
                      No target companies yet.{" "}
                      <Link to="/my-profile?edit=most-wanted" className="text-primary font-700 hover:underline">
                        Add the brands you'd love to work for →
                      </Link>
                    </p>
                  )}
                </div>

              </div>
            ) : (
              <div className="border-2 border-foreground p-8 text-center rounded-2xl">
                <Pin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-700 text-sm text-foreground mb-2">No pinned industries yet</p>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  Pin your favourite industries from My Profile to keep one-tap access here.
                </p>
                <Link to="/my-profile" className="inline-block hover:opacity-90 transition-opacity">
                  <SketchCta>Pin industries →</SketchCta>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* ─── JOBS TAB ─── */}
          <TabsContent value="jobs" className="mt-0 focus-visible:outline-none">
            {/* Switcher mode banner */}
            {hasPreferences && isIndustrySwitcher(profile) && (
              <div className="mb-5 border-2 border-foreground bg-primary/5 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-display font-700 text-xs text-foreground mb-1 uppercase tracking-wider">
                    Industry switch detected
                  </p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    We're showing roles in {profile.industry_interests?.slice(0, 3).join(", ")} based on what you said you want next, not your CV history. We've also relaxed seniority filters so you can explore routes into the new field.
                  </p>
                </div>
                <Link to="/profile" className="font-display text-[10px] font-700 uppercase tracking-wider text-primary hover:underline shrink-0">
                  Edit
                </Link>
              </div>
            )}


            {/* No preferences set */}
            {!hasPreferences && (
              <div className="border-2 border-foreground p-8 text-center rounded-2xl">
                <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-700 text-sm text-foreground mb-2">Set your preferences first</p>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  Add your industry interests, role preferences, career level, and location to start seeing matched jobs.
                </p>
                <Link to="/my-profile" className="inline-block hover:opacity-90 transition-opacity">
                  <SketchCta>Set up My Profile →</SketchCta>
                </Link>
              </div>
            )}

            {/* Explainer banner */}
            {hasPreferences && (
              <div className="mb-5 border-2 border-foreground/10 bg-muted/40 rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 space-y-1">
                  <p className="font-display font-800 text-sm">Swipe through jobs picked for you<span className="text-primary">.</span></p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    <span className="text-[#00E600] font-700">→ Right</span> to like · <span className="text-red-500 font-700">← Left</span> to pass · <span className="font-700">Bookmark</span> to save for later. The more you swipe, the smarter your picks get — every like and pass teaches the algorithm what you're really after.
                  </p>
                </div>
              </div>
            )}

            {/* Tinder card stack — falls back to the algorithm's broader picks
                once the strict industry+match-threshold stack runs dry, instead
                of just stopping. Gated on historyReady so a reload never briefly
                re-shows cards you already swiped before the dismissed/liked
                state has loaded back from the DB. */}
            {hasPreferences && !historyReady && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {hasPreferences && historyReady && (
              <TinderCardStack
                jobs={primaryScoredJobs.length > 0 ? primaryScoredJobs : broaderScoredJobs}
                isFallback={primaryScoredJobs.length === 0 && broaderScoredJobs.length > 0}
                onDismiss={handleDismiss}
                onLike={handleLike}
                onSave={toggleSaveJob}
                onOpen={handleOpen}
                savedIdSet={savedIdSet}
              />
            )}
          </TabsContent>

          {/* ─── LIKED JOBS TAB ─── */}
          <TabsContent value="liked" className="mt-0 focus-visible:outline-none">
            {likedLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : likedJobs.length === 0 ? (
              <div className="border-2 border-foreground rounded-2xl p-10 text-center">
                <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-700 text-lg mb-1">No likes yet<span className="text-primary">.</span></p>
                <p className="font-body text-sm text-muted-foreground">Swipe right on jobs you like — they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-body text-xs text-muted-foreground mb-4">{likedJobs.length} liked job{likedJobs.length !== 1 ? "s" : ""} — stale ones are removed automatically.</p>
                <div className="divide-y-2 divide-foreground/10 border-2 border-foreground rounded-2xl overflow-hidden">
                  {likedJobs.map((job) => (
                    <div key={job.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => handleOpen(job.url, job.id)}>
                      <CompanyLogo company={job.company} size={36} className="mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-700 text-sm truncate">{job.title}</p>
                        <p className="font-body text-xs text-muted-foreground truncate">{job.company}{job.location && ` · ${job.location}`}{job.salary && ` · ${job.salary}`}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUnlike(job.id); }}
                        className="shrink-0 p-1.5 text-[#00E600] hover:text-red-400 transition-colors rounded-full hover:bg-red-50"
                        title="Unlike"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ─── SAVED JOBS TAB ─── */}
          <TabsContent value="saved" className="mt-0 focus-visible:outline-none">
            <SavedTabContent
              savedJobs={savedJobs}
              savedLoading={savedLoading}
              unsaveJob={unsaveJob}
            />
          </TabsContent>

          {/* ─── MEMBERS TAB ─── */}
          <TabsContent value="members" className="mt-0 focus-visible:outline-none">
            <div className="space-y-6">
              <MentorRequestsInbox />
              <MembersArea />
            </div>
          </TabsContent>

        </Tabs>

        {/* Tab navigation — sits below the card content, not floating */}
        <nav
          aria-label="Primary"
          className="mt-8 border-t-2 border-foreground/10"
        >
          <ul className="grid grid-cols-5">
            {navItems.map((item) => {
              const active = inboxTab === item.value;
              return (
                <li key={item.value} className="flex">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.to) {
                        navigate(item.to);
                        return;
                      }
                      setInboxTab(item.value as typeof inboxTab);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 pt-3 pb-2 transition-colors ${
                      active ? "text-[#00E600]" : "text-foreground/55 hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={`relative flex items-center justify-center ${
                        active ? "w-11 h-11 rounded-full -mt-1 bg-[#00E600]/15" : ""
                      }`}
                    >
                      {item.icon}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#FF3B30] text-white font-display font-900 text-[9px]">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </span>
                    <span className={`font-display text-[10px] tracking-tight ${active ? "font-800 text-[#00E600]" : "font-600"}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

      </div>
    </div>
  );
};

export default MyJobs;
