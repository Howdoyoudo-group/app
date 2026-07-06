export type CareerLevel = "entry" | "mid" | "senior" | "director" | "executive";

export interface UnderstandMeRoleMatch {
  role?: string;
  slug?: string;
  percentage?: number;
  reason?: string;
}

export interface UnderstandMeIndustryFit {
  industry?: string;
  confidence?: number;
  reason?: string;
}

export interface UnderstandMeIntersectionIdea {
  role?: string;
  blend?: string;
  industry?: string;
  reason?: string;
  skills_needed?: string[];
  example_companies?: string[];
  search_query?: string;
}

export interface UnderstandMeResults {
  roleMatches?: UnderstandMeRoleMatch[];
  industryFit?: UnderstandMeIndustryFit[];
  intersectionIdeas?: UnderstandMeIntersectionIdea[];
  transferableSkills?: string[];
  personalityInsights?: string;
  careerLevel?: CareerLevel | null;
}

const BUSINESS_ROLE_SLUGS = new Set([
  "marketing",
  "operations",
  "strategy",
  "commercial",
  "e-commerce",
  "ecommerce",
  "finance",
  "sales",
  "hr-people",
  "legal-compliance",
  "product",
  "project-management",
  "producer",
]);

// Tier signals - each is more specific than the next.
// Executive (level 4): C-suite, MD, Founder, President, Partner - sets strategy for whole business.
const EXECUTIVE_SIGNALS = /(\bceo\b|\bcfo\b|\bcoo\b|\bcto\b|\bcmo\b|\bcpo\b|\bcro\b|c\.?e\.?o|c\.?f\.?o|c\.?o\.?o|c\.?t\.?o|c\.?m\.?o|chief\s+(?:executive|operating|financial|marketing|strategy|technology|product|people|commercial|revenue|of staff)|founder|co-?founder|managing director|managing partner|\bmd\b|president|chair(?:man|woman|person)?|\bpartner\b|country manager|general manager|group ceo|group chief|board member|board director)/i;
// Director (level 3): Director, VP, Senior Director - owns a department/function, P&L, reports to C-suite.
const DIRECTOR_SIGNALS = /(\bdirector\b|\bvp\b|vice president|\bsvp\b|\bevp\b|senior director|deputy director|associate director|director of|director,)/i;
// Senior (level 2): Head of, Principal, Group Head - owns a function or large team.
const SENIOR_SIGNALS = /(head of|principal|group manager|senior manager|senior lead|chief of staff|programme director|programme manager senior)/i;
const ENTRY_SIGNALS = /(junior|assistant|graduate|intern|apprentice|trainee|entry[-\s]level|placement student|year in industry|sandwich year|sixth form|a[-\s]?levels?|gcse|undergraduate|postgraduate|master'?s student|bachelor'?s student|currently studying|expected graduation|expected to graduate|graduating in|will graduate|recent graduate|recently graduated|no (?:prior |professional )?(?:work )?experience|first job|seeking my first|looking for my first|school leaver|college leaver|gap year)/i;

// Strong "early career" cues - when present, override mid-level even if the
// person used grown-up language elsewhere in their text.
const STRONG_EARLY_SIGNALS = /(currently studying|current student|undergraduate student|year \d (?:student|undergraduate)|expected (?:to )?graduat\w+|will graduate|graduating (?:in )?20\d{2}|recent graduate|recently graduated|no (?:prior |professional )?(?:work )?experience|first job|seeking my first|looking for my first|school leaver|college leaver|sixth form|a[-\s]?levels?\b|gcse|year in industry|placement student|sandwich year)/i;

// Always evaluated against the current calendar year - no hardcoded dates.
// `RECENT_GRAD_WINDOW_YEARS` controls how recently someone must have left
// education to still count as early-career; `EXPECTED_GRAD_LOOKAHEAD_YEARS`
// is how far in the future a graduation date can be (covers undergrads
// starting a 4-year course).
const CURRENT_YEAR = new Date().getFullYear();
const RECENT_GRAD_WINDOW_YEARS = 1;
const EXPECTED_GRAD_LOOKAHEAD_YEARS = 6;

/**
 * Looks for education end-dates and ages in the raw evidence text and
 * returns true if the person looks like they're still studying or only
 * just left education within the last ~2 years.
 */
function looksLikeEarlyCareerByDates(evidence: string): boolean {
  if (!evidence) return false;
  const lower = evidence.toLowerCase();

  // "Age: 19" / "I am 18" / "aged 21"
  const ageMatch = lower.match(/\b(?:age[d]?[:\s]+|i am |i'm )(\d{2})\b/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    if (age >= 15 && age <= 22) return true;
  }

  // Education / graduation years - pick up the LATEST 4-digit year mentioned
  // alongside education-context words. If it's >= current year - 1 we treat
  // them as a recent grad / current student.
  const eduContextRegex = /(university|college|school|bsc|ba\b|msc|ma\b|mba|degree|undergraduate|postgraduate|bachelor|master|diploma|graduat\w+|sixth form|a[-\s]?levels?|gcse)[^.\n]{0,120}(20\d{2})/gi;
  let latestEduYear = 0;
  let m: RegExpExecArray | null;
  while ((m = eduContextRegex.exec(lower)) !== null) {
    const y = parseInt(m[2], 10);
    if (y > latestEduYear && y <= CURRENT_YEAR + EXPECTED_GRAD_LOOKAHEAD_YEARS) latestEduYear = y;
  }
  // "Present" / "current" alongside an education term ⇒ still in education
  if (/(university|college|school|degree|undergraduate|postgraduate|bachelor|master)[^.\n]{0,80}(present|current|ongoing)/i.test(lower)) {
    return true;
  }
  if (latestEduYear && latestEduYear >= CURRENT_YEAR - RECENT_GRAD_WINDOW_YEARS) return true;
  if (latestEduYear && latestEduYear > CURRENT_YEAR) return true; // expected graduation in the future

  return false;
}

/**
 * Rough count of professional work entries (job title + company patterns).
 * If we see 0 or 1 substantive role we treat that as little-to-no history.
 */
function countLikelyJobEntries(evidence: string): number {
  if (!evidence) return 0;
  // Count "Job Title at Company" / "Job Title, Company" / "Company - date" lines.
  const atPattern = /\b[A-Z][a-zA-Z &/-]{2,40}\s+(?:at|@|,)\s+[A-Z][a-zA-Z0-9 &.'/-]{2,60}/g;
  const matches = evidence.match(atPattern) || [];
  // Date-range pattern often used in CV experience sections.
  const dateRanges = evidence.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d{2})[^.\n]{0,30}[–-][^.\n]{0,30}(?:present|current|20\d{2})/gi) || [];
  return Math.max(matches.length, dateRanges.length);
}

// Job titles that are clearly hands-on craft/service/trade roles - never appropriate for executive business profiles
const CRAFT_TITLE_PATTERNS = /\b(bartender|barista|barber|waiter|waitress|server|dishwasher|busser|housekeeper|cleaner|receptionist|cashier|porter|dog walker|dog groomer|pet sitter|vet|veterinarian|veterinary surgeon|vet nurse|veterinary nurse|veterinary assistant|veterinary care assistant|kennel|cattery|nail technician|beauty therapist|massage therapist|lifeguard|swim teacher|fitness instructor|gym instructor|yoga teacher|pilates instructor|care assistant|support worker|rehabilitation (?:carer|assistant|support worker)|kitchen assistant|kitchen porter|pot wash|commis chef|sous chef|line cook|prep cook|baker|pastry chef|butcher|fishmonger|greengrocer|florist|delivery driver|courier|shelf stacker|checkout|till operator|store assistant|shop assistant|retail assistant|sales assistant|floor managers?|floor staff|window fitter|window fitters|door fitter|door fitters|window(?: and door)? fitters?|window installer|plumber|electrician|carpenter|roofer|bricklayer|plasterer|painter decorator|scaffolder|labourer|welder|machinist|forklift|warehouse operative|picker packer|van driver|lorry driver|hgv driver|bus driver|taxi driver|refuse collector|street cleaner|gardener|groundskeeper|farm worker|stable hand|zookeeper|nursery assistant|nursery nurse|teaching assistant|classroom assistant|lollipop|crossing patrol|security guard|security officer|door supervisor|bouncer|carer|domiciliary|night carer|healthcare assistant|phlebotomist)\b/i;

/**
 * Returns true if the job title describes a hands-on craft/service role
 * that should not be shown to executive/senior business profiles.
 */
export function isCraftServiceTitle(title: string): boolean {
  return CRAFT_TITLE_PATTERNS.test(title);
}

export function isCraftServiceJob(title: string, categories: Array<string | null | undefined> = []): boolean {
  if (isCraftServiceTitle(title)) return true;
  return categories.some((value) => typeof value === "string" && CRAFT_TITLE_PATTERNS.test(value));
}

export function isBusinessRoleSlug(value: string): boolean {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/&/g, "-")
    .replace(/\s+/g, "-");

  return BUSINESS_ROLE_SLUGS.has(normalized);
}

/**
 * Numeric ordering of career levels for gap comparison.
 */
export const LEVEL_ORDER: Record<string, number> = {
  entry: 0,
  mid: 1,
  senior: 2,
  director: 3,
  executive: 4,
};

function collectNestedStrings(value: unknown): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectNestedStrings(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) => collectNestedStrings(item));
  }

  return [];
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

export function normalizeCareerLevel(value: unknown): CareerLevel | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (
    normalized === "entry" ||
    normalized === "mid" ||
    normalized === "senior" ||
    normalized === "director" ||
    normalized === "executive"
  ) {
    return normalized;
  }

  return null;
}

export function inferCareerLevelFromUnderstandMe(results: UnderstandMeResults | null | undefined): CareerLevel | null {
  const rawInputEvidence = collectNestedStrings(
    results && typeof results === "object"
      ? (results as Record<string, unknown>)._inputData
      : null,
  );

  const rawEvidence = rawInputEvidence.join(" ");

  const evidence = [
    results?.personalityInsights ?? "",
    ...(results?.roleMatches ?? []).flatMap((match) => [match.role ?? "", match.reason ?? ""]),
    ...(results?.industryFit ?? []).flatMap((fit) => [fit.industry ?? "", fit.reason ?? ""]),
    rawEvidence,
  ].join(" ");

  // STRONG early-career cues (e.g. "currently studying", recent graduation
  // year, "no work experience") override any AI-supplied careerLevel - the
  // AI sometimes labels a student as "mid" because they list internships.
  const dateBasedEarly = looksLikeEarlyCareerByDates(rawEvidence || evidence);
  if (STRONG_EARLY_SIGNALS.test(evidence) || dateBasedEarly) {
    // Only override if there is NO executive/senior evidence - protects
    // career-changers who happen to have just finished a postgrad.
    if (!EXECUTIVE_SIGNALS.test(evidence) && !SENIOR_SIGNALS.test(evidence)) {
      return "entry";
    }
  }

  // Very thin work history → entry.
  if (rawEvidence) {
    const jobCount = countLikelyJobEntries(rawEvidence);
    if (jobCount <= 1 && !EXECUTIVE_SIGNALS.test(evidence) && !SENIOR_SIGNALS.test(evidence)) {
      // Only treat as entry if there's also some education/student/young
      // signal, otherwise we'd misclassify a sparse mid-career CV.
      if (/(university|college|school|degree|graduat\w+|student|undergraduate|postgraduate|gcse|a[-\s]?levels?)/i.test(evidence)) {
        return "entry";
      }
    }
  }

  const explicit = normalizeCareerLevel(results?.careerLevel);
  if (explicit) return explicit;

  if (!evidence.trim()) return null;
  if (EXECUTIVE_SIGNALS.test(evidence)) return "executive";
  if (DIRECTOR_SIGNALS.test(evidence)) return "director";
  if (SENIOR_SIGNALS.test(evidence)) return "senior";
  if (ENTRY_SIGNALS.test(evidence)) return "entry";

  return null;
}

export function getUnderstandMeRoles(
  results: UnderstandMeResults | null | undefined,
  minPercentage = 0,
): string[] {
  return uniqueCaseInsensitive(
    (results?.roleMatches ?? [])
      .filter((match) => (match.percentage ?? 0) >= minPercentage)
      .map((match) => match.role?.trim() ?? "")
      .filter(Boolean),
  );
}

export function getUnderstandMeIndustries(
  results: UnderstandMeResults | null | undefined,
  minConfidence = 0,
): string[] {
  return uniqueCaseInsensitive(
    (results?.industryFit ?? [])
      .filter((fit) => (fit.confidence ?? 0) >= minConfidence)
      .map((fit) => fit.industry?.trim() ?? "")
      .filter(Boolean),
  );
}