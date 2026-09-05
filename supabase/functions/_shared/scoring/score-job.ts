// =============================================================================
// CANONICAL JOB SCORING MODULE
// =============================================================================
// This is the single source of truth for how jobs are ranked across the app.
// It is imported by:
//   • src/pages/MyJobs.tsx           (the user's inbox UI)
//   • supabase/functions/whatsapp-daily-digest  (WhatsApp digest)
//   • any future ranking surface (email digests, push notifications, etc.)
//
// The module is deliberately isomorphic:
//   • no React, no DOM
//   • no `Deno` globals
//   • only depends on sibling files in this folder
//
// If you change scoring logic here, the inbox AND every digest changes
// together. That is the whole point of this file existing.
// =============================================================================

import {
  isCraftServiceJob,
  isBusinessRoleSlug,
  LEVEL_ORDER,
  normalizeCareerLevel,
  inferCareerLevelFromUnderstandMe,
  getUnderstandMeRoles,
  getUnderstandMeIndustries,
  type CareerLevel,
  type UnderstandMeResults,
} from "./understand-me.ts";
import { getIndustriesFromPassions, PASSION_INDUSTRY_MAP } from "./passion-industry-map.ts";
import { getIndustryRankBoost } from "./industry-rankings.ts";
import { getIntersectionKeywords } from "./intersection-roles.ts";

// ───── Types ─────────────────────────────────────────────────────────────────

export interface RiasecScores {
  R: number; I: number; A: number; S: number; E: number; C: number;
}
export interface WorkValues { [key: string]: number }
export interface JobTraits {
  riasec: RiasecScores;
  values: WorkValues;
  key_skills: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  industry: string | null;
  career_level: string | null;
  url: string;
  created_at: string;
  scraped_at?: string;
  type: string | null;
  work_mode: string | null;
  role_category: string | null;
  ai_role_category: string | null;
  job_traits: JobTraits | null;
  description: string | null;
  tags: string[] | null;
  expires_at?: string | null;
}

export interface RoleRiasecProfile {
  role_category: string;
  riasec_scores: RiasecScores;
  work_values: WorkValues;
}

export interface UserProfile {
  career_level: string | null;
  industry_interests: string[] | null;
  newsletter_industries?: string[] | null;
  location_preference: string | null;
  role_preferences: string[] | null;
  salary_expectation: string | null;
  understand_me_results: UnderstandMeResults | null;
  riasec_scores: RiasecScores | null;
  work_values: WorkValues | null;
  job_preferences: {
    passions?: string[];
    passionsText?: string;
    targetCompanies?: string[];
    targetRoles?: string[];
  } | null;
}

export interface ScoreResult {
  score: number;
  matches: string[];
  riasecMatch?: number;
  /** Ordered, human-readable contribution list — additive/optional, not read
   *  by any existing caller. Populated so UI can explain *why* a job scored
   *  the way it did, ranked by actual weight rather than declaration order. */
  breakdown?: ScoreBreakdownItem[];
}

export interface ScoreBreakdownItem {
  /** Plain-English description of this factor, safe to show verbatim. */
  label: string;
  /** Points this factor actually contributed (0 when it didn't hit). */
  weight: number;
  hit: boolean;
}

/** Ranks a scoreJob() breakdown by actual weight contributed (descending),
 *  keeping only the factors that hit — for "here's why this matched". */
export function summarizeBreakdown(breakdown: ScoreBreakdownItem[], max = 3): string[] {
  return breakdown
    .filter((b) => b.hit && b.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, max)
    .map((b) => b.label);
}

// ───── Behavioural affinity (browsing-derived industry interest) ────────────
// Built client-side by useBehavioralAffinity (user_interactions, 30-day
// recency-decayed) or server-side in score-new-jobs. Plain data — no hooks.
export interface IndustryAffinity {
  /** industry slug → weighted score (only entries that hit the threshold) */
  scores: Map<string, number>;
  /** max score across all industries (for normalising the boost) */
  max: number;
}

/** Everything scoreJob can use beyond the job and profile. All optional slots
 *  degrade gracefully — an absent signal simply drops out of the weighting. */
export interface ScoringContext {
  roleProfiles: Map<string, RoleRiasecProfile>;
  learned?: LearnedSignals;
  behavioralAffinity?: IndustryAffinity | null;
  roleTitleToSlug?: Record<string, string>;
  /** Cosine similarity (0–1) between the job and user preference embeddings.
   *  Populated from job_matches.semantic_score (Phase 3); weighted in when present. */
  semanticSimilarity?: number;
  /** Per-user component weight multipliers (Phase 4). */
  weights?: Record<string, number>;
  /** Skills passport snapshot (Phase 5). */
  skillsSnapshot?: { have: string[]; gaps: string[] } | null;
}

// Re-export upstream pieces consumers commonly need.
export {
  LEVEL_ORDER,
  normalizeCareerLevel,
  inferCareerLevelFromUnderstandMe,
  getUnderstandMeRoles,
  getUnderstandMeIndustries,
  isCraftServiceJob,
  isBusinessRoleSlug,
  PASSION_INDUSTRY_MAP,
  getIndustriesFromPassions,
};
export type { CareerLevel, UnderstandMeResults };

// ───── Passion keyword map ───────────────────────────────────────────────────
// Single-token keywords are matched with word boundaries so short stems like
// "ski" never match "skill"/"skin". Multi-word phrases use substring match.
export const PASSION_KEYWORD_MAP: Record<string, string[]> = {
  golf: ["golf", "golfing", "caddie", "caddy", "country club", "greenkeeper", "pro shop"],
  tennis: ["tennis", "racket", "racquet", "padel", "tennis club", "padel club"],
  wine: ["wine", "wines", "sommelier", "vineyard", "winery", "viticulture", "wset"],
  football: ["football", "soccer", "matchday"],
  running: ["running", "runner", "runners", "marathon", "athletics"],
  cycling: ["cycling", "cyclist", "cyclists", "bicycle", "velo"],
  yoga: ["yoga", "pilates"],
  swimming: ["swim", "swims", "swimmer", "swimmers", "swimming", "aquatic", "swimming pool"],
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

export function getPassionKeywords(passions: string[], passionsText: string): string[] {
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

export function jobMatchesPassion(job: Job, keywords: string[]): string | null {
  if (keywords.length === 0) return null;
  const haystack = [
    job.title,
    job.company,
    job.industry || "",
    job.description || "",
    (job.tags || []).join(" "),
  ].join(" ").toLowerCase();
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

// ───── Salary helpers ────────────────────────────────────────────────────────

export const SALARY_THRESHOLDS: Record<string, number> = {
  "Under £25k": 0,
  "£25k–£35k": 25000,
  "£35k–£50k": 35000,
  "£50k–£70k": 50000,
  "£70k–£90k": 70000,
  "£90k–£120k": 90000,
  "£120k+": 120000,
};

export function parseSalaryMax(salary: string | null): number | null {
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

export function isLiveJob(job: Job): boolean {
  return !job.expires_at || new Date(job.expires_at).getTime() > Date.now();
}

export function getFreshnessBoost(createdAt: string): number {
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
  if (ageHours <= 24) return 18;
  if (ageHours <= 72) return 12;
  if (ageHours <= 7 * 24) return 7;
  if (ageHours <= 14 * 24) return 3;
  return 0;
}

// ───── Slugging + industry aliasing ──────────────────────────────────────────

export function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const INDUSTRY_INTEREST_ALIASES: Record<string, string[]> = {
  "food-drink": ["hospitality", "coffee", "bakery", "beer"],
  "food-and-drink": ["hospitality", "coffee", "bakery", "beer"],
};

export function expandIndustrySlugs(values: string[]): string[] {
  const out = new Set<string>();
  for (const v of values) {
    const slug = toSlug(v);
    for (const s of INDUSTRY_INTEREST_ALIASES[slug] ?? [slug]) out.add(s);
  }
  return [...out];
}

function getJobCategorySlug(job: Job): string {
  return toSlug(job.ai_role_category || job.role_category || "");
}
function getJobRoleContext(job: Job): string {
  return `${job.title || ""} ${job.role_category || ""}`.toLowerCase();
}

// ───── Title / category patterns ─────────────────────────────────────────────

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

const BUSINESS_ROLE_SLUGS_SET = new Set([
  "marketing", "operations", "strategy", "commercial", "e-commerce", "ecommerce",
  "finance", "sales", "hr-people", "legal-compliance", "product", "project-management",
  "producer", "creative",
]);

const NON_SENIOR_TITLE_PATTERN = /\b(store manager|shop manager|branch manager|assistant manager|deputy manager|shift manager|duty manager|team leader|supervisor|crew member|crew trainer|barista|bartender|server|waiter|waitress|host(?:ess)?|cashier|sales assistant|retail assistant|warehouse|driver|delivery|cleaner|porter|kitchen porter|line cook|commis|chef de partie|receptionist|junior|trainee|apprentice|intern|graduate|entry)\b/i;

// Titles that require specific licences/qualifications - block unless the
// user's profile shows a matching background. Stops e.g. "Consultant
// Psychiatrist", "Solicitor", "HGV Driver" reaching people who haven't
// trained for them.
const REGULATED_CLINICAL_TITLE_PATTERN = /\b(psychiatrist|psychologist|psychotherapist|counsellor|counselor|therapist|physiotherapist|physio|occupational therapist|speech (?:and )?language therapist|dietician|dietitian|radiographer|sonographer|paramedic|midwife|midwifery|nurse|nursing|nhs band|health(?:care)? assistant|doctor|gp\b|general practitioner|surgeon|anaesthetist|anesthetist|registrar|consultant (?:psychiatrist|surgeon|physician|cardiologist|oncologist|paediatrician|pediatrician|radiologist|anaesthetist|anesthetist|dermatologist|geriatrician|gynaecologist|neurologist|nephrologist|ophthalmologist|orthopaedic|pathologist|psychotherapist|rheumatologist|urologist)|specialty doctor|clinical fellow|f1|f2|st[1-8]|core trainee|specialist registrar|pharmacist|dentist|dental nurse|optometrist|orthoptist|chiropractor|osteopath|veterinary surgeon|veterinary nurse|vet nurse|solicitor|barrister|paralegal|conveyancer|actuary|chartered accountant|architect|civil engineer|structural engineer|electrician|plumber|gas engineer|hgv driver|airline pilot|cabin crew|teacher|teaching assistant|sen teacher|early years|qts\b)\b/i;

const CLINICAL_REGULATED_ROLE_SLUGS = new Set([
  "doctor", "nurse", "midwife", "psychotherapist", "physiotherapist",
  "occupational-therapist", "healthcare-assistant", "veterinary-surgeon",
  "veterinary-nurse", "teacher", "teaching-assistant", "conveyancer",
  "legal-compliance",
]);

// Finance / accountancy titles that require a recognised qualification
// (ACA, ACCA, CIMA, AAT, CFA) or demonstrable accounting background.
const FINANCE_QUALIFIED_TITLE_PATTERN = /\b(accountant|accounting|bookkeep(?:er|ing)?|auditor|audit (?:manager|senior|associate|director)|financial controller|finance controller|\bcontroller\b|fp&a|\bfpa\b|treasury|tax (?:manager|senior|associate|advisor|adviser|accountant|analyst|director)|payroll (?:manager|specialist|officer|administrator)|financial analyst|finance analyst|finance manager|finance business partner|management accountant|chartered accountant|\baca\b|\bacca\b|\bcima\b|\baat\b|\bcfa\b|actuary|actuarial|forensic accountant|credit controller|finance director|head of finance|director of finance|cfo)\b/i;

const FINANCE_SIGNAL_PATTERN = /\b(finance|financial|account(?:ant|ing|s)?|audit|tax|treasury|fp&a|controller|bookkeep|payroll|actuar|aca|acca|cima|aat|cfa)\b/i;

function userHasFinanceSignal(profile: UserProfile, roleTitleToSlug?: Record<string, string>): boolean {
  const roleSlugs = getEffectiveRoleSlugs(profile, roleTitleToSlug);
  if (roleSlugs.includes("finance")) return true;
  const targetRoles = profile.job_preferences?.targetRoles || [];
  if (targetRoles.some((r) => FINANCE_SIGNAL_PATTERN.test(r || ""))) return true;
  const understandRoles = getUnderstandMeRoles(profile.understand_me_results);
  if (understandRoles.some((r) => FINANCE_SIGNAL_PATTERN.test(r))) return true;
  return false;
}

function userHasRegulatedSignal(profile: UserProfile, titleLower: string, roleTitleToSlug?: Record<string, string>): boolean {
  const roleSlugs = getEffectiveRoleSlugs(profile, roleTitleToSlug);
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
const DIRECTOR_TITLE_PATTERN = /\b(director|\bvp\b|vice president|svp|evp|senior director|deputy director|associate director|director of|director,)\b/i;
const EXECUTIVE_TITLE_PATTERN = /\b(ceo|cfo|coo|cto|cmo|cpo|cro|chief\s+(?:executive|operating|financial|marketing|strategy|technology|product|people|commercial|revenue|of staff)|founder|co-?founder|managing director|managing partner|md\b|president|chair(?:man|woman|person)?|partner,|partner\b|country manager)\b/i;
const STRATEGY_LEADER_TITLE_PATTERN = /\b(ceo|cfo|coo|cto|cmo|cpo|cro|chief\s+(?:executive|operating|financial|marketing|strategy|technology|product|people|commercial|revenue|of staff)|founder|co-?founder|managing director|managing partner|president|chair(?:man|woman|person)?|md\b|vp |vice president|svp|evp|head of|director of|director,|partner,|partner\b|chief of staff|strategy director|strategy lead|head of strategy|principal|general manager|country manager|regional director|director\b)\b/i;

// ───── Effective preference resolution ───────────────────────────────────────

function uniqueCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export function getEffectiveRoles(profile: UserProfile): string[] {
  const explicit = profile.role_preferences || [];
  if (explicit.length > 0) return uniqueCaseInsensitive(explicit);
  const strong = getUnderstandMeRoles(profile.understand_me_results, 80);
  if (strong.length > 0) return strong;
  return uniqueCaseInsensitive([...getUnderstandMeRoles(profile.understand_me_results)]);
}

export function getEffectiveIndustries(profile: UserProfile): string[] {
  const explicit = profile.industry_interests || [];
  if (explicit.length > 0) return [...explicit];
  const strong = getUnderstandMeIndustries(profile.understand_me_results, 75);
  if (strong.length > 0) return strong;
  return getUnderstandMeIndustries(profile.understand_me_results);
}

export function isIndustrySwitcher(profile: UserProfile): boolean {
  const stated = (profile.industry_interests || []).map((i) => i.trim().toLowerCase()).filter(Boolean);
  if (stated.length === 0) return false;
  const cv = getUnderstandMeIndustries(profile.understand_me_results).map((i) => i.trim().toLowerCase());
  if (cv.length === 0) return false;
  return !stated.some((s) => cv.includes(s));
}

export function getEffectiveCareerLevel(profile: UserProfile): CareerLevel | null {
  const explicit = normalizeCareerLevel(profile.career_level);
  if (explicit) return explicit;
  return inferCareerLevelFromUnderstandMe(profile.understand_me_results);
}

export function getRawCareerLevel(profile: UserProfile): CareerLevel | null {
  return normalizeCareerLevel(profile.career_level)
    || inferCareerLevelFromUnderstandMe(profile.understand_me_results);
}

export function getEffectiveRoleSlugs(profile: UserProfile, roleTitleToSlug?: Record<string, string>): string[] {
  return uniqueCaseInsensitive(
    getEffectiveRoles(profile).map((role) => {
      const lc = role.toLowerCase();
      return toSlug(roleTitleToSlug?.[lc] || role);
    }),
  );
}

export function hasBusinessProfileSignals(profile: UserProfile, roleTitleToSlug?: Record<string, string>): boolean {
  const effectiveLevel = getEffectiveCareerLevel(profile);
  if (effectiveLevel && (LEVEL_ORDER[effectiveLevel] ?? 0) >= 2) return true;
  return getEffectiveRoleSlugs(profile, roleTitleToSlug).some(isBusinessRoleSlug);
}

function isBusinessCategoryJob(job: Job): boolean {
  return BUSINESS_ROLE_SLUGS_SET.has(getJobCategorySlug(job));
}
function jobTitleMatchesAnyBusinessKeyword(job: Job): boolean {
  const ctx = getJobRoleContext(job);
  return Object.values(BUSINESS_ROLE_KEYWORD_PATTERNS).some((re) => re.test(ctx));
}

export function hasIndustryMatch(job: Job, profile: UserProfile): boolean {
  if (!job.industry) return false;
  const jobSlug = toSlug(job.industry);
  return expandIndustrySlugs(getEffectiveIndustries(profile)).includes(jobSlug);
}

export function isCareerLevelCompatible(job: Job, profile: UserProfile): boolean {
  const effective = getEffectiveCareerLevel(profile);
  const jobLevel = normalizeCareerLevel(job.career_level);
  if (!effective || !jobLevel) return true;
  return Math.abs((LEVEL_ORDER[effective] ?? 1) - (LEVEL_ORDER[jobLevel] ?? 1)) <= 1;
}

export function hasRoleMatch(job: Job, profile: UserProfile, roleTitleToSlug?: Record<string, string>): boolean {
  const effectiveRoles = getEffectiveRoles(profile);
  if (effectiveRoles.length === 0) return false;

  const normalizedJobCategory = getJobCategorySlug(job);
  const jobRoleContext = getJobRoleContext(job);
  const craftJob = isCraftServiceJob(job.title || "", [job.ai_role_category, job.role_category]);
  const industryMatch = hasIndustryMatch(job, profile);
  const careerLevelCompatible = isCareerLevelCompatible(job, profile);

  return effectiveRoles.some((rp) => {
    const normalized = rp.trim().toLowerCase();
    const slug = toSlug(roleTitleToSlug?.[normalized] || normalized);
    if (craftJob && isBusinessRoleSlug(slug)) return false;

    const categoryMatch = normalizedJobCategory === slug;
    const titleMatch = jobRoleContext.includes(normalized);
    if (!isBusinessRoleSlug(slug)) return categoryMatch || titleMatch;

    const pattern = BUSINESS_ROLE_KEYWORD_PATTERNS[slug];
    const keywordMatch = pattern ? pattern.test(jobRoleContext) : false;
    if (titleMatch || keywordMatch) return true;

    return categoryMatch && industryMatch && careerLevelCompatible;
  });
}

// ───── Hard exclusion gate ───────────────────────────────────────────────────

export function shouldExcludeJob(job: Job, profile: UserProfile, roleTitleToSlug?: Record<string, string>): boolean {
  const effectiveLevel = getEffectiveCareerLevel(profile);
  const rawLevel = getRawCareerLevel(profile);
  const userLevelNum = effectiveLevel ? (LEVEL_ORDER[effectiveLevel] ?? 1) : null;
  const rawLevelNum = rawLevel ? (LEVEL_ORDER[rawLevel] ?? 1) : null;
  const craftJob = isCraftServiceJob(job.title || "", [job.ai_role_category, job.role_category]);
  const businessProfile = hasBusinessProfileSignals(profile, roleTitleToSlug);
  const switcher = isIndustrySwitcher(profile);
  const titleLower = (job.title || "").toLowerCase();
  const minSalary = profile.salary_expectation ? (SALARY_THRESHOLDS[profile.salary_expectation] || 0) : 0;
  const wantsSeniorPay = minSalary >= 50000;

  // REGULATED PROFESSIONS: hard-block licensed/qualified titles unless the
  // user's profile shows a matching background.
  if (REGULATED_CLINICAL_TITLE_PATTERN.test(titleLower) && !userHasRegulatedSignal(profile, titleLower, roleTitleToSlug)) {
    return true;
  }

  // FINANCE / ACCOUNTANCY: hard-block qualified finance roles unless the
  // user shows a finance background.
  if (FINANCE_QUALIFIED_TITLE_PATTERN.test(titleLower) && !userHasFinanceSignal(profile, roleTitleToSlug)) {
    return true;
  }

  if ((rawLevelNum ?? -1) >= 2 || wantsSeniorPay) {
    if (NON_SENIOR_TITLE_PATTERN.test(titleLower) && !STRATEGY_LEADER_TITLE_PATTERN.test(titleLower)) return true;
  }

  if (rawLevel === "executive") {
    const m = parseSalaryMax(job.salary); if (m !== null && m < 90000) return true;
  } else if (rawLevel === "director") {
    const m = parseSalaryMax(job.salary); if (m !== null && m < 65000) return true;
  } else if (rawLevel === "senior") {
    const m = parseSalaryMax(job.salary); if (m !== null && m < 45000) return true;
  }

  if (rawLevel === "executive") {
    if (!EXECUTIVE_TITLE_PATTERN.test(titleLower) && !STRATEGY_LEADER_TITLE_PATTERN.test(titleLower)) {
      if (DIRECTOR_TITLE_PATTERN.test(titleLower) && !EXECUTIVE_TITLE_PATTERN.test(titleLower)) return true;
    }
  }

  const targetRoles = profile.job_preferences?.targetRoles || [];
  if (targetRoles.length > 0 && ((rawLevelNum ?? -1) >= 2 || wantsSeniorPay)) {
    const matchesAnyTarget = targetRoles.some((r) => titleLower.includes(r.toLowerCase().trim()));
    if (!matchesAnyTarget && !STRATEGY_LEADER_TITLE_PATTERN.test(titleLower)) return true;
  }

  if (craftJob && ((userLevelNum ?? -1) >= 2 || (rawLevelNum ?? -1) >= 2 || businessProfile || wantsSeniorPay)) {
    return true;
  }

  if (businessProfile && (rawLevelNum ?? 0) >= 2 && !switcher) {
    if (!isBusinessCategoryJob(job) && !jobTitleMatchesAnyBusinessKeyword(job)) return true;
  }

  if (effectiveLevel === "entry") {
    const jl = (job.career_level || "").toLowerCase();
    if (jl === "senior" || jl === "executive") return true;
    const m = parseSalaryMax(job.salary);
    if (m !== null && m > 40000) return true;
    if (/\b(head of|director|vp|vice president|chief|principal|lead\b|senior|managing|partner)\b/i.test(job.title || "")) return true;
  }

  if (userLevelNum === null) return false;
  const jobLevel = (job.career_level || "").toLowerCase();
  const jobLevelNum = LEVEL_ORDER[jobLevel];
  if (jobLevelNum !== undefined && userLevelNum - jobLevelNum > 1) return true;

  return false;
}

/** For a job that scored in a middling band, name the single biggest reason
 *  it's a "stretch" rather than a clean match — reuses the same signal
 *  functions scoreJob() itself uses, so it can never disagree with the score.
 *  Returns null when there's no clear stretch reason (i.e. it's just a
 *  generically average match, not worth narrating as a reach). */
export function getExclusionOrMismatchReason(
  job: Job,
  profile: UserProfile,
  roleTitleToSlug?: Record<string, string>,
): string | null {
  const effectiveIndustries = getEffectiveIndustries(profile);
  const effectiveRoles = getEffectiveRoles(profile);
  const industryOk = effectiveIndustries.length === 0 || hasIndustryMatch(job, profile);
  const roleOk = effectiveRoles.length === 0 || hasRoleMatch(job, profile, roleTitleToSlug);
  const levelOk = isCareerLevelCompatible(job, profile);

  if (industryOk && !roleOk) return "the role's a bit different from what you've been targeting, but the industry fits";
  if (!levelOk) return "it's a stretch on career level";
  if (!industryOk && roleOk) return "it's outside your usual industries, but the role itself is a strong fit";
  return null;
}

export function passesSalaryFilter(job: Job, minSalary: number): boolean {
  if (minSalary <= 0) return true;
  const jobMax = parseSalaryMax(job.salary);
  if (jobMax === null) {
    const titleLower = (job.title || "").toLowerCase();
    if (minSalary >= 50000 && NON_SENIOR_TITLE_PATTERN.test(titleLower)) return false;
    if (
      minSalary >= 90000 &&
      !DIRECTOR_TITLE_PATTERN.test(titleLower) &&
      !EXECUTIVE_TITLE_PATTERN.test(titleLower) &&
      !STRATEGY_LEADER_TITLE_PATTERN.test(titleLower)
    ) return false;
    return true;
  }
  return jobMax >= minSalary * 0.85;
}

// ───── Learning signals from user actions ────────────────────────────────────

export interface LearnedSignals {
  boostedKeywords: Map<string, number>;
  penalizedKeywords: Map<string, number>;
  boostedCompanies: Set<string>;
  penalizedCompanies: Set<string>;
  boostedIndustries: Set<string>;
  penalizedIndustries: Set<string>;
  boostedLocations: Map<string, number>;
  penalizedLocations: Map<string, number>;
}

// A dismiss is often really "wrong location", not "wrong industry" - e.g. a
// London-based user swiping left on an otherwise-great job because it's in
// South Wales. Without its own signal, that swipe would only ever be read as
// "penalize this industry/company/keyword", which can wrongly suppress an
// industry the user actually likes. Bucket jobs by a coarse location so
// dismiss/like patterns tied to geography get attributed to geography.
export function normalizeLocationBucket(job: { location: string | null; work_mode?: string | null }): string {
  if (job.work_mode && job.work_mode.toLowerCase() === "remote") return "remote";
  let loc = (job.location || "").toLowerCase().trim();
  if (!loc) return "";
  if (loc.includes("remote")) return "remote";
  // Strip UK postcode tokens (e.g. "WA5 7YF") - too granular to learn from.
  loc = loc.replace(/\b[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}\b/gi, "").trim();
  // Keep just the first segment before a comma (e.g. "Cardiff, South Wales" → "cardiff")
  loc = loc.split(",")[0].trim();
  return loc;
}

// Same job often gets scraped from multiple boards (Adzuna, Reed, Jooble) as
// separate DB rows with slightly different company formatting - these helpers
// build a normalized key so we can recognize "same real-world job, different
// row" for dedupe display and for sweeping duplicates on like/dismiss.
export function shouldRequireRoleMatch(profile: UserProfile): boolean {
  return getEffectiveRoles(profile).length > 0;
}

export function shouldRequireIndustryMatch(profile: UserProfile): boolean {
  return getEffectiveIndustries(profile).length > 0;
}

export function normalizeTitleForDedupe(raw: string): string {
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
export function jobDedupeKey(job: { title: string; company: string | null; location: string | null }): string {
  const normTitle = normalizeTitleForDedupe(job.title || "");
  const normCompany = normalizeCompanyForDedupe(job.company || "");
  return normCompany
    ? `${normTitle}::${normCompany}`
    : `${normTitle}::${(job.location || "").toLowerCase().trim()}`;
}

const STOP_WORDS = new Set([
  "the","and","for","with","from","into","this","that","will","are","was",
  "has","have","had","been","being","does","did","not","but","its","all",
  "can","may","our","you","your","per","via","new","one","two",
]);

function extractTitleKeywords(title: string): string[] {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function buildLearnedSignals(
  allJobs: Job[],
  dismissedIds: Set<string>,
  openedIds: Set<string>,
  likedIds?: Set<string>,
): LearnedSignals {
  const signals: LearnedSignals = {
    boostedKeywords: new Map(), penalizedKeywords: new Map(),
    boostedCompanies: new Set(), penalizedCompanies: new Set(),
    boostedIndustries: new Set(), penalizedIndustries: new Set(),
    boostedLocations: new Map(), penalizedLocations: new Map(),
  };
  const jobMap = new Map(allJobs.map((j) => [j.id, j]));
  for (const id of openedIds) {
    const j = jobMap.get(id); if (!j) continue;
    for (const kw of extractTitleKeywords(j.title)) {
      signals.boostedKeywords.set(kw, (signals.boostedKeywords.get(kw) || 0) + 1);
    }
    if (j.company) signals.boostedCompanies.add(j.company.toLowerCase());
    if (j.industry) signals.boostedIndustries.add(j.industry.toLowerCase());
    const loc = normalizeLocationBucket(j);
    if (loc) signals.boostedLocations.set(loc, (signals.boostedLocations.get(loc) || 0) + 1);
  }
  // Likes are a stronger signal than opens — count twice
  for (const id of likedIds ?? new Set<string>()) {
    const j = jobMap.get(id); if (!j) continue;
    for (const kw of extractTitleKeywords(j.title)) {
      signals.boostedKeywords.set(kw, (signals.boostedKeywords.get(kw) || 0) + 2);
    }
    if (j.company) signals.boostedCompanies.add(j.company.toLowerCase());
    if (j.industry) signals.boostedIndustries.add(j.industry.toLowerCase());
    const loc = normalizeLocationBucket(j);
    if (loc) signals.boostedLocations.set(loc, (signals.boostedLocations.get(loc) || 0) + 2);
  }
  for (const id of dismissedIds) {
    const j = jobMap.get(id); if (!j) continue;
    for (const kw of extractTitleKeywords(j.title)) {
      signals.penalizedKeywords.set(kw, (signals.penalizedKeywords.get(kw) || 0) + 1);
    }
    if (j.company) signals.penalizedCompanies.add(j.company.toLowerCase());
    if (j.industry) signals.penalizedIndustries.add(j.industry.toLowerCase());
    const loc = normalizeLocationBucket(j);
    if (loc) signals.penalizedLocations.set(loc, (signals.penalizedLocations.get(loc) || 0) + 1);
  }
  return signals;
}

export function learningAdjustment(job: Job, signals: LearnedSignals): number {
  if (
    signals.boostedKeywords.size === 0 && signals.penalizedKeywords.size === 0 &&
    signals.boostedCompanies.size === 0 && signals.penalizedCompanies.size === 0
  ) return 0;

  let adjustment = 0;
  const titleKws = extractTitleKeywords(job.title);
  const company = (job.company || "").toLowerCase();
  const industry = (job.industry || "").toLowerCase();

  for (const kw of titleKws) {
    const b = signals.boostedKeywords.get(kw) || 0;
    const p = signals.penalizedKeywords.get(kw) || 0;
    if (b > p) adjustment += 2; else if (p > b) adjustment -= 3;
  }
  if (company && signals.boostedCompanies.has(company) && !signals.penalizedCompanies.has(company)) adjustment += 5;
  else if (company && signals.penalizedCompanies.has(company) && !signals.boostedCompanies.has(company)) adjustment -= 5;
  if (industry && signals.boostedIndustries.has(industry) && !signals.penalizedIndustries.has(industry)) adjustment += 3;
  else if (industry && signals.penalizedIndustries.has(industry) && !signals.boostedIndustries.has(industry)) adjustment -= 3;

  const locKey = normalizeLocationBucket(job);
  if (locKey) {
    const boostCount = signals.boostedLocations.get(locKey) || 0;
    const penaltyCount = signals.penalizedLocations.get(locKey) || 0;
    if (boostCount > penaltyCount) adjustment += 4;
    else if (penaltyCount > boostCount) adjustment -= 4;
  }

  return Math.max(-15, Math.min(15, adjustment));
}

export function applyBehavioralBoost(score: number, matches: string[], job: Job, affinity: IndustryAffinity | null): number {
  if (!affinity || affinity.max === 0 || !job.industry) return score;
  const ind = job.industry.toLowerCase().trim();
  const affinityScore = affinity.scores.get(ind) ?? 0;
  if (affinityScore === 0) return score;
  // Normalise to 0-1 then scale to max +10 boost
  const boost = Math.round((affinityScore / affinity.max) * 10);
  if (boost >= 3 && !matches.some((m) => m === "Industry")) {
    matches.push("Trending for you");
  }
  return Math.min(100, score + boost);
}

// ───── The big one: scoreJob ─────────────────────────────────────────────────

export function scoreJob(
  job: Job,
  profile: UserProfile,
  ctx: ScoringContext,
): ScoreResult {
  const { roleProfiles, learned, roleTitleToSlug } = ctx;
  const matches: string[] = [];
  const breakdown: ScoreBreakdownItem[] = [];
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

  // Industry – 40%
  if (effectiveIndustries.length > 0) {
    totalWeight += 40;
    const hit = !!(job.industry && expandIndustrySlugs(effectiveIndustries).includes(toSlug(job.industry)));
    if (hit) { weightedScore += 40; matches.push("Industry"); }
    breakdown.push({ label: "Matches an industry you're interested in", weight: hit ? 40 : 0, hit });
  }

  // Role – 20%
  if (effectiveRoles.length > 0) {
    const hit = hasRoleMatch(job, profile, roleTitleToSlug);
    totalWeight += 20;
    if (hit) { weightedScore += 20; matches.push("Role"); }
    breakdown.push({ label: "Fits a role you're targeting", weight: hit ? 20 : 0, hit });
  }

  // Target companies +30
  const targetCompanies = profile.job_preferences?.targetCompanies || [];
  if (targetCompanies.length > 0 && job.company) {
    const jobCompany = job.company.toLowerCase().trim();
    const matchedCo = targetCompanies.find((c) => {
      const t = c.toLowerCase().trim();
      return jobCompany === t || jobCompany.includes(t) || t.includes(jobCompany);
    });
    if (matchedCo) {
      weightedScore += 30; matches.push(`Wanted · ${matchedCo}`);
      breakdown.push({ label: `${matchedCo} is one of your dream companies`, weight: 30, hit: true });
    }
  }

  // Target roles +25
  const targetRoles = profile.job_preferences?.targetRoles || [];
  if (targetRoles.length > 0 && job.title) {
    const jobTitle = job.title.toLowerCase();
    const matchedRole = targetRoles.find((r) => jobTitle.includes(r.toLowerCase().trim()));
    if (matchedRole) {
      weightedScore += 25; matches.push(`Wanted · ${matchedRole}`);
      breakdown.push({ label: `You've said you want a ${matchedRole} role`, weight: 25, hit: true });
    }
  }

  // Passions – 25%
  const passionList = profile.job_preferences?.passions || [];
  const passionsText = profile.job_preferences?.passionsText || "";
  const passionKeywords = getPassionKeywords(passionList, passionsText);
  let isPassionTaggedJob = false;
  if (passionKeywords.length > 0) {
    totalWeight += 25;
    const matchedKw = jobMatchesPassion(job, passionKeywords);
    const jobTagsLower = (job.tags || []).map((t) => t.toLowerCase());
    const matchedPassionTag = passionList.find((p) => jobTagsLower.includes(`passion: ${p.toLowerCase()}`));
    isPassionTaggedJob = !!matchedPassionTag;
    if (matchedKw || isPassionTaggedJob) {
      weightedScore += 25;
      const friendly = matchedPassionTag || passionList.find((p) => {
        const k = p.toLowerCase();
        if (matchedKw === k) return true;
        const mapped = PASSION_KEYWORD_MAP[k];
        return mapped?.includes(matchedKw || "");
      });
      matches.push(friendly ? `Passion post · ${friendly}` : "Passion post");
      breakdown.push({ label: friendly ? `Connects to your passion for ${friendly}` : "Connects to one of your passions", weight: 25, hit: true });
    }
  }

  // Loved Industry – 10%
  if (passionList.length > 0 && job.industry) {
    const lovedIndustries = getIndustriesFromPassions(passionList);
    if (lovedIndustries.size > 0) {
      totalWeight += 10;
      if (lovedIndustries.has(job.industry.toLowerCase())) {
        weightedScore += 10;
        if (!matches.includes("Industry") && !matches.some((m) => m.startsWith("Passion post"))) {
          const driver = passionList.find((p) =>
            (PASSION_INDUSTRY_MAP[p.toLowerCase()] || []).some((i) => i.toLowerCase() === job.industry!.toLowerCase()),
          );
          matches.push(driver ? `Passion post · ${driver}` : "Passion post");
          breakdown.push({ label: driver ? `In an industry linked to your passion for ${driver}` : "In an industry linked to one of your passions", weight: 10, hit: true });
        }
      }
    }
  }

  // Career Level – 15%
  if (effectiveCareerLevel) {
    totalWeight += 15;
    const hit = !!(job.career_level && job.career_level.toLowerCase() === effectiveCareerLevel);
    if (hit) { weightedScore += 15; matches.push("Level"); }
    breakdown.push({ label: "Matches your career level", weight: hit ? 15 : 0, hit });
  }

  // Location – 10%
  if (profile.location_preference) {
    totalWeight += 10;
    const pref = profile.location_preference.toLowerCase();
    const hit = !!(
      (job.location && job.location.toLowerCase().includes(pref)) ||
      (job.work_mode?.toLowerCase() === "remote" && pref === "remote")
    );
    if (hit) { weightedScore += 10; matches.push("Location"); }
    breakdown.push({ label: "In your preferred location", weight: hit ? 10 : 0, hit });
  }

  // RIASEC – 5%
  if (profile.riasec_scores && (hasPerJobTraits || roleProfile)) {
    totalWeight += 5;
    const u = profile.riasec_scores as unknown as Record<string, number>;
    const r = hasPerJobTraits ? jobRiasec : (roleProfile?.riasec_scores as unknown as Record<string, number> | undefined);
    if (r) {
      let dot = 0, magU = 0, magR = 0;
      for (const k of ["R","I","A","S","E","C"]) {
        const uv = u[k] ?? 0; const rv = (r as Record<string, number>)[k] ?? 0;
        dot += uv * rv; magU += uv * uv; magR += rv * rv;
      }
      const cosine = magU && magR ? dot / (Math.sqrt(magU) * Math.sqrt(magR)) : 0;
      const riasecScore = Math.max(0, (cosine - 0.5) * 2);
      weightedScore += riasecScore * 5;
      const hit = riasecScore > 0.3;
      if (hit) matches.push("Personality");
      breakdown.push({ label: "Fits your personality profile", weight: Math.round(riasecScore * 5), hit });
    }
  }

  // Values – 5%
  if (profile.work_values && (hasPerJobTraits || roleProfile)) {
    totalWeight += 5;
    const uVals = profile.work_values as Record<string, number>;
    const rVals = hasPerJobTraits ? jobValues : roleProfile?.work_values as Record<string, number> | undefined;
    if (rVals) {
      const keys = Object.keys(uVals);
      if (keys.length > 0) {
        let sum = 0;
        for (const k of keys) {
          const diff = Math.abs((uVals[k] ?? 50) - ((rVals as Record<string, number>)[k] ?? 50));
          sum += 1 - diff / 100;
        }
        const valScore = sum / keys.length;
        weightedScore += valScore * 5;
        const hit = valScore > 0.6;
        if (hit) matches.push("Values");
        breakdown.push({ label: "Aligns with what matters to you at work", weight: Math.round(valScore * 5), hit });
      }
    }
  }

  // Skills overlap (bonus tag only)
  if (hasPerJobTraits && job.job_traits?.key_skills && profile.understand_me_results?.transferableSkills) {
    const userSkills = profile.understand_me_results.transferableSkills.map((s) => s.toLowerCase());
    const jobSkills = job.job_traits.key_skills.map((s) => s.toLowerCase());
    const overlap = jobSkills.filter((js) => userSkills.some((us) => js.includes(us) || us.includes(js))).length;
    const ratio = jobSkills.length > 0 ? overlap / jobSkills.length : 0;
    if (ratio >= 0.2) matches.push("Skills");
  }

  // Semantic similarity – 20% (only when an embedding comparison is supplied;
  // populated from job_matches.semantic_score, never computed client-side)
  if (ctx.semanticSimilarity !== undefined) {
    totalWeight += 20;
    const semanticWeight = Math.max(0, Math.min(1, ctx.semanticSimilarity)) * 20;
    weightedScore += semanticWeight;
    const hit = ctx.semanticSimilarity >= 0.62;
    if (hit) matches.push("Strong fit");
    breakdown.push({ label: "Reads like a strong overall fit", weight: Math.round(semanticWeight), hit });
  }

  // Intersection boost (+20 pts flat): job title matches a known cross-industry
  // intersection role for this user's combination of industry interests +
  // AI-generated intersection ideas. Only fires when the user has 2+ industries
  // so the intersection concept is meaningful.
  if (effectiveIndustries.length >= 2 && job.title) {
    const staticKws = getIntersectionKeywords(effectiveIndustries);
    const aiIdeas = profile.understand_me_results?.intersectionIdeas || [];
    const aiKws = aiIdeas.flatMap((idea) => (idea.search_query ? [idea.search_query] : []));
    const allKws = [...staticKws, ...aiKws];
    if (allKws.length > 0) {
      const titleLower = job.title.toLowerCase();
      const matched = allKws.find((kw) => titleLower.includes(kw.toLowerCase()));
      if (matched) {
        weightedScore += 20;
        matches.push("Intersection match");
        breakdown.push({ label: "A rare crossover between your interests", weight: 20, hit: true });
      }
    }
  }

  let score = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

  if (learned) {
    const adj = learningAdjustment(job, learned);
    score = Math.max(0, Math.min(100, score + adj));
    if (adj > 3) { matches.push("✓ Learned"); breakdown.push({ label: "Similar to jobs you've liked before", weight: adj, hit: true }); }
    if (adj < -3) matches.push("↓ Learned");
  }

  const industryBoost = getIndustryRankBoost(job.industry, job.title, job.company);
  if (industryBoost !== 0) {
    score = Math.max(0, Math.min(100, score + industryBoost * 3));
    if (industryBoost >= 3) { matches.push("Top employer"); breakdown.push({ label: "A well-known name in this industry", weight: industryBoost * 3, hit: true }); }
    else if (industryBoost <= -3) matches.push("↓ Generic role");
  }

  if (isPassionTaggedJob) score = Math.min(100, score + 20);

  const freshnessBoost = getFreshnessBoost(job.created_at);
  score = Math.min(100, score + freshnessBoost);
  if (freshnessBoost >= 10) breakdown.push({ label: "Just posted", weight: freshnessBoost, hit: true });

  // Behavioural affinity boost - soft nudge based on what the user actually browses.
  const preBehavioralScore = score;
  score = applyBehavioralBoost(score, matches, job, ctx.behavioralAffinity ?? null);
  const behavioralBoost = score - preBehavioralScore;
  if (behavioralBoost >= 3) breakdown.push({ label: "You've been browsing jobs like this", weight: behavioralBoost, hit: true });

  return { score, matches, breakdown };
}
