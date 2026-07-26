// Resolves a Career Map role name (e.g. "Band 6 Senior Physiotherapist",
// "Chef de Partie", "Branch / Mortgage Manager") to a /roles/:slug page,
// when there's a clear, direct correlation.
//
// Returns null when no confident match exists - caller falls back to the
// existing "Save to Most Wanted" CTA only.

import { roles, industryToSlug } from "./roles";

const ROLE_SLUGS = new Set(roles.map((r) => r.slug));
const SLUG_TO_ROLE = new Map(roles.map((r) => [r.slug, r]));

// industryToSlug maps a Title Case industry name (e.g. "Theatre") to a path
// (e.g. "/theatre"). CareerMap's `industry` prop is the bare slug ("theatre").
// Build the reverse lookup once: slug -> every industry name that maps to it.
const SLUG_TO_INDUSTRY_NAMES = new Map<string, string[]>();
for (const [name, path] of Object.entries(industryToSlug)) {
  const slug = path.replace(/^\//, "");
  const list = SLUG_TO_INDUSTRY_NAMES.get(slug) ?? [];
  list.push(name);
  SLUG_TO_INDUSTRY_NAMES.set(slug, list);
}

/**
 * A role-name match is only trustworthy if the resolved role is actually
 * tagged to the industry the Career Map is showing. Without this, generic
 * keyword aliases (e.g. "buyer") false-match unrelated roles from other
 * industries (e.g. Building's "Land Buyer" incorrectly resolving to the
 * Fashion/Grocery/etc. "Buyer / Merchandiser" role).
 */
function roleAppliesToIndustry(roleSlug: string, industry: string): boolean {
  const role = SLUG_TO_ROLE.get(roleSlug);
  if (!role) return false;
  const industryNames = SLUG_TO_INDUSTRY_NAMES.get(industry) ?? [];
  return role.industries.some((ind) => industryNames.includes(ind));
}

/** Manual aliases for role-name families that don't slug-match cleanly. */
const ALIAS_MAP: Array<{ test: RegExp; slug: string }> = [
  // Physio family
  { test: /physiotherapist|physio/i, slug: "physiotherapist" },
  { test: /football physio|sports physio/i, slug: "football-physio" },

  // Chef / kitchen
  { test: /\b(chef|sous chef|head chef|chef de partie|commis|kitchen porter)\b/i, slug: "chef" },
  { test: /\b(baker)\b/i, slug: "chef" },

  // Bar / coffee
  { test: /\bbarista\b/i, slug: "barista" },
  { test: /\b(bartender|barback|mixologist)\b/i, slug: "bartender" },

  // Teaching
  { test: /\b(teacher|headteacher|head of department|lecturer|tutor)\b/i, slug: "teacher" },
  { test: /\b(teaching assistant|ta)\b/i, slug: "teaching-assistant" },

  // Health
  { test: /\b(nurse|staff nurse|matron)\b/i, slug: "nurse" },
  { test: /\bmidwife\b/i, slug: "midwife" },
  // Deliberately NOT bare "gp" - that 2-letter token also turns up as a
  // parenthetical qualifier on non-clinical roles (e.g. Health's "Practice
  // Manager (GP)", an admin/business role, not a doctor).
  { test: /\b(doctor|general practitioner|consultant physician|registrar|fy[12])\b/i, slug: "doctor" },
  { test: /\boccupational therapist|ot\b/i, slug: "occupational-therapist" },
  { test: /\bpsychotherapist|cbt therapist|counsellor\b/i, slug: "psychotherapist" },
  { test: /\bhealthcare assistant|hca\b/i, slug: "healthcare-assistant" },
  { test: /\bcare worker|care assistant|support worker\b/i, slug: "care-worker" },

  // Vet
  { test: /\bveterinary surgeon|vet surgeon|\bvet\b/i, slug: "veterinary-surgeon" },
  { test: /\bveterinary nurse|vet nurse|rvn\b/i, slug: "veterinary-nurse" },

  // Property / mortgage / estate
  { test: /\bestate agent|sales negotiator|valuer\b/i, slug: "estate-agent" },
  { test: /\blettings negotiator|lettings agent\b/i, slug: "lettings-negotiator" },
  { test: /\bproperty manager\b/i, slug: "property-manager" },
  { test: /\bconveyancer|licensed conveyancer\b/i, slug: "conveyancer" },
  { test: /\bmortgage advisor|mortgage adviser\b/i, slug: "mortgage-advisor" },
  { test: /\bmortgage broker\b/i, slug: "mortgage-broker" },

  // Finance
  { test: /\bfinancial advisor|financial adviser|ifa\b/i, slug: "financial-advisor" },
  { test: /\bwealth manager|private banker\b/i, slug: "wealth-manager" },
  { test: /\binvestment analyst|equity analyst\b/i, slug: "investment-analyst" },
  { test: /\b(cfo|chief financial officer|finance director|finance manager|financial controller|accountant|accounts assistant|fp&a|treasury)\b/i, slug: "finance" },

  // Marketing / brand / creative / product / strategy
  { test: /\b(marketing|brand manager|cmo|chief marketing officer|marketing director|growth marketer|content marketer|seo manager|social media manager|community manager|pr manager|pr (&|and) communications manager)\b/i, slug: "marketing" },
  { test: /\b(creative director|art director|copywriter|graphic designer|chief creative officer|content creator)\b/i, slug: "creative" },
  { test: /\b(product manager|associate product manager|product owner|chief product officer|head of product)\b/i, slug: "product" },
  { test: /\b(strategy|strategist|chief strategy officer|chief transformation officer)\b/i, slug: "strategy" },
  { test: /\b(commercial manager|chief commercial officer|chief revenue officer|commercial director|sponsorship manager|partnerships manager)\b/i, slug: "commercial" },
  { test: /\b(ecommerce|e-commerce|digital trading|online merchandiser)\b/i, slug: "ecommerce" },
  { test: /\b(sustainability manager|sustainability lead|sustainability officer|esg manager|corporate responsibility)\b/i, slug: "sustainability" },

  // Sales / customer
  { test: /\b(sales|account executive|account manager|business development|bdm|sdr|inside sales|sales director)\b/i, slug: "sales" },
  { test: /\b(customer service|customer support|customer success|contact centre)\b/i, slug: "customer-service" },

  // Ops / PM
  { test: /\b(operations|coo|chief operating officer|ops manager|operations director|logistics coordinator|logistics manager|production manager|quality assurance manager|quality controller|supply chain coordinator|supply chain analyst|fleet manager|procurement manager|facilities manager)\b/i, slug: "operations" },
  { test: /\b(project manager|programme manager|pmo|delivery manager)\b/i, slug: "project-management" },

  // People / legal / IT / AI / data
  { test: /\b(hr|human resources|people partner|people director|chief people officer|talent acquisition|recruiter|training manager)\b/i, slug: "hr-people" },
  { test: /\b(legal counsel|solicitor|paralegal|chief legal officer|general counsel|compliance)\b/i, slug: "legal-compliance" },
  // Deliberately NOT bare "developer" - that word alone also appears in
  // non-software job titles across other industries (e.g. Beauty's
  // "Fragrance Developer", Coffee's "Blend Developer", Footwear's "Product
  // Developer"), which would otherwise false-match into IT & Technology.
  { test: /\b(software engineer|software developer|web developer|app developer|game developer|devops|cio|chief information officer|it manager|it support technician|field engineer|network engineer|cyber|sysadmin)\b/i, slug: "it-technology" },
  { test: /\b(data analyst|business analyst|data scientist|bi analyst)\b/i, slug: "data-analyst" },
  { test: /\b(ai engineer|machine learning|ml engineer|chief ai officer|ai product|ai policy)\b/i, slug: "ai" },

  // Retail / hospitality / store
  { test: /\b(retail assistant|sales assistant|shop assistant|store assistant)\b/i, slug: "retail-assistant" },
  { test: /\b(grocery store manager|store manager|assistant store manager|branch manager)\b/i, slug: "grocery-store-manager" },
  { test: /\b(hotel manager|general manager|gm)\b/i, slug: "hotel-manager" },

  // Fitness / beauty / stylist
  { test: /\b(personal trainer|pt|fitness coach)\b/i, slug: "personal-trainer" },
  { test: /\b(fitness instructor|gym instructor|group exercise)\b/i, slug: "fitness-instructor" },
  { test: /\b(beauty therapist|aesthetic practitioner|nail technician)\b/i, slug: "beauty-therapist" },
  { test: /\b(stylist|hairdresser|hair stylist|colourist)\b/i, slug: "stylist" },

  // Auto / warehouse / vehicle
  { test: /\b(vehicle technician|mechanic apprentice|mot tester)\b/i, slug: "vehicle-technician" },
  { test: /\b(mechanic)\b/i, slug: "mechanic" },
  { test: /\b(car sales executive|car sales|aftersales)\b/i, slug: "car-sales-executive" },
  { test: /\b(warehouse|delivery driver|hgv|picker|packer|fulfilment)\b/i, slug: "warehouse-delivery" },

  // Farm / ag
  { test: /\b(farmer)\b/i, slug: "farmer" },
  { test: /\b(farm manager)\b/i, slug: "farm-manager" },
  { test: /\b(farm worker|farm hand|stockperson)\b/i, slug: "farm-worker" },
  { test: /\b(agronomist|farm consultant)\b/i, slug: "agronomist" },

  // Football
  { test: /\b(academy coach|youth coach)\b/i, slug: "academy-coach" },
  { test: /\b(football coach|first[- ]team coach|head coach|manager.*football)\b/i, slug: "football-coach" },
  { test: /\b(football scout|chief scout|recruitment analyst)\b/i, slug: "football-scout" },
  { test: /\b(football analyst|performance analyst|opposition analyst)\b/i, slug: "football-analyst" },
  { test: /\b(kit manager|kit assistant)\b/i, slug: "kit-manager" },
  { test: /\b(groundsperson|groundsman|head groundsperson)\b/i, slug: "groundsperson" },
  { test: /\b(sports scientist|s&c coach|strength\s*(?:&|and)\s*conditioning)\b/i, slug: "sports-scientist" },

  // Motorsport / engineering
  { test: /\b(aerodynamicist|aero performance)\b/i, slug: "aerodynamicist" },
  { test: /\b(performance engineer)\b/i, slug: "performance-engineer" },
  { test: /\b(race engineer)\b/i, slug: "race-engineer" },
  { test: /\b(composite technician|composites)\b/i, slug: "composite-technician" },

  // Media / broadcast / games / events / interiors / travel
  { test: /\b(broadcast journalist|news reporter|news presenter)\b/i, slug: "broadcast-journalist" },
  // "Sub-Editor / Copy Editor" is deliberately left OUT of this alias - it's
  // editing work ("commissioning, shaping, quality-checking"), not reporting
  // ("researching, interviewing, writing") - it falls through to the bare
  // "editor" alias below instead.
  { test: /\b(reporter|correspondent|journalist)\b/i, slug: "reporter" },
  { test: /\b(editor|editor[- ]in[- ]chief|features editor)\b/i, slug: "editor" },
  { test: /\b(producer|line producer|series producer)\b/i, slug: "producer" },
  { test: /\b(sound engineer|audio engineer|live sound)\b/i, slug: "sound-engineer" },
  { test: /\b(game designer|level designer|narrative designer)\b/i, slug: "game-designer" },
  { test: /\b(qa tester|qa analyst|test analyst)\b/i, slug: "qa-tester" },
  { test: /\b(interior designer|fit[- ]out designer)\b/i, slug: "interior-designer" },
  { test: /\b(live events manager|events producer|event manager|events coordinator)\b/i, slug: "live-events-manager" },
  { test: /\b(travel consultant|travel agent|reservations consultant)\b/i, slug: "travel-consultant" },

  // Buyer / merchandiser / garment
  { test: /\b(buyer|assistant buyer|merchandiser|category manager)\b/i, slug: "buyer" },
  { test: /\b(garment technologist|gt)\b/i, slug: "garment-technologist" },

  // Equine
  { test: /\b(jockey|apprentice jockey)\b/i, slug: "jockey" },
  { test: /\b(racehorse trainer|trainer.*racing)\b/i, slug: "racehorse-trainer" },
  { test: /\b(stable hand|stable staff|work rider|groom)\b/i, slug: "stable-hand" },

  // Fixing (trades) - Electrical Engineer is deliberately grouped in with
  // Electrician (same underlying trade, bigger-scale work), unlike the
  // Theatre precedent where genuinely distinct disciplines were kept apart.
  { test: /\b(electrician|electrical engineer|solar panel installer|ev charger installer)\b/i, slug: "electrician" },
  { test: /\bplumber\b/i, slug: "plumber" },
  // Gas/heating/heat-pump/HVAC are one real trade cluster per NCS itself -
  // its own Heat Pump Engineer profile lists "gas service technician,
  // heating and ventilation engineer or plumber" as the entry routes in.
  { test: /\b(heating engineer|gas engineer|heat pump engineer|hvac engineer)\b/i, slug: "heating-engineer" },
  { test: /\b(appliance repair technician|mobile phone repair technician|electronics repair technician)\b/i, slug: "repair-technician" },
  { test: /\b(multi-trade engineer|maintenance technician|handyperson)\b/i, slug: "handyperson" },

  // Building (hands-on trades)
  { test: /\bbricklayer\b/i, slug: "bricklayer" },
  { test: /\b(carpenter|joiner)\b/i, slug: "carpenter" },
  { test: /\bplasterer\b/i, slug: "plasterer" },
  { test: /\bgroundworker\b/i, slug: "groundworker" },
  { test: /\broofer\b/i, slug: "roofer" },

  // Charity
  { test: /\b(charity fundraiser|fundraiser|fundraising manager|trusts and foundations|partnerships manager)\b/i, slug: "charity-fundraiser" },

  // Politics uses the US spelling "Advisor" (matches the slug directly),
  // but Charity/Teaching/Psychotherapy's Career Maps use the UK spelling
  // "Adviser" - slugify() alone won't bridge that, so spell both out.
  { test: /\bpolicy advis(?:e|o)r\b/i, slug: "policy-advisor" },

  // Theatre - CareerMap uses different display names than the roles.ts
  // titles/slugs (e.g. "Actor" vs "Performer"), so these need explicit
  // aliases. Safe to phrase loosely because industry-scoping in
  // resolveCareerMapRoleSlug is the real guard against cross-industry
  // false positives (e.g. "Producer" here won't leak into Cinema's
  // generic "producer" role, and vice versa).
  { test: /\b(actor|actress|ensemble member|dancer|understudy|swing|singer)\b/i, slug: "performer" },
  { test: /\b(stage manager|dsm|asm|company manager)\b/i, slug: "theatre-stage-manager" },
  { test: /\b(lighting technician|lx|sound engineer|sound no\.?\s*1|av \/? video technician|av technician)\b/i, slug: "theatre-technician" },
  { test: /\b(set \/? scenic designer|scenic designer|costume designer|wardrobe supervisor|wigs,? hair & makeup)\b/i, slug: "theatre-costume-designer" },
  // Only "Producer" and "General Manager" genuinely fit theatre-producer's
  // description ("runs the business side... general management"). Casting
  // Director and Literary Manager/Dramaturg are distinct enough specialisms
  // that forcing them onto the same page would be misleading rather than
  // helpful - better to leave them unmatched (falls back to "Save to Most
  // Wanted" only) than link somewhere that doesn't actually describe the job.
  { test: /\b(producer|general manager)\b/i, slug: "theatre-producer" },
];

/** Quick slugify of a free-text role name, stripping parentheticals & noise. */
const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "") // drop parentheticals e.g. "(NHS)"
    .replace(/\bband\s*\d+\b/g, "") // drop "Band 5"
    .replace(/\blevel\s*\d+\b/g, "") // drop "Level 2/3"
    .replace(/\bjunior\b|\bsenior\b|\bapprentice\b|\bassistant\b/g, "")
    .replace(/[\\/&]/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/**
 * Returns a /roles/:slug match for a career-map role name, or null.
 *
 * `industry` should be the Career Map's own industry slug (e.g. "theatre",
 * matching the CareerMap `industry` prop). When provided, a candidate slug
 * is only accepted if that role is actually tagged to this industry in
 * roles.ts - this is what stops generic keyword aliases from resolving to
 * the wrong industry's role (e.g. Building's "Land Buyer" incorrectly
 * matching Fashion/Grocery's "Buyer / Merchandiser").
 *
 * Omitting `industry` restores the old unscoped behaviour (first text
 * match wins) - only do this if you don't have an industry to pass.
 */
export const resolveCareerMapRoleSlug = (roleName: string, industry?: string): string | null => {
  if (!roleName) return null;
  const inScope = (slug: string) => !industry || roleAppliesToIndustry(slug, industry);

  // 1. Direct slugify match
  const direct = slugify(roleName);
  if (ROLE_SLUGS.has(direct) && inScope(direct)) return direct;

  // 2. Alias overrides - keep checking candidates until one is actually
  // tagged to this industry, rather than stopping at the first text match.
  for (const { test, slug } of ALIAS_MAP) {
    if (test.test(roleName) && ROLE_SLUGS.has(slug) && inScope(slug)) return slug;
  }

  return null;
};

// ─────────────────────────────────────────────────────────────────────────
// NCS catalog matching - a SECOND, independent resolution tier for tiles
// that don't have a roles.ts equivalent. Called only when
// resolveCareerMapRoleSlug() above returns null. See
// supabase/functions/scrape-ncs-catalog/index.ts for how the 733-profile
// catalog itself is built; this only needs the lightweight
// {ncs_slug, title, ncs_sector} index, fetched once by the caller.
// ─────────────────────────────────────────────────────────────────────────

export interface NcsCatalogEntry {
  ncs_slug: string;
  title: string;
  ncs_sector: string | null;
}

export interface NcsMatch {
  ncsSlug: string;
  title: string;
  confidence: "high" | "medium";
}

// NCS titles broad/generic enough that a fuzzy token-overlap match against
// them is more likely to be wrong than right - only ever match these via
// the exact-slugify tier, never via token overlap. Audited from the first
// full-catalog scrape; extend this list if the full backfill surfaces more.
const NCS_HARD_EXCLUSIONS = new Set([
  "manager", "administrator", "assistant", "officer", "consultant",
  "coordinator", "supervisor", "director", "advisor", "adviser",
]);

const STOPWORDS = new Set([
  "a", "an", "the", "of", "and", "or", "for", "in", "to", "your",
  "junior", "senior", "apprentice", "assistant", "trainee", "graduate",
  "head", "lead", "chief", "deputy", "associate", "principal",
]);

const tokenize = (s: string): Set<string> =>
  new Set(
    s
      .toLowerCase()
      .replace(/\([^)]*\)/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t))
  );

const jaccard = (a: Set<string>, b: Set<string>): number => {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

const TOKEN_OVERLAP_THRESHOLD = 0.6;

// Sparse, best-effort map from our industry slugs to NCS's 15 sector names
// (see scrape-ncs-catalog's NCS_SECTORS). Only used to break ties among
// otherwise-equal token-overlap candidates - never to accept a match that
// token overlap alone wouldn't already support, and never populated for
// industries with no plausible NCS sector (e.g. Football, Formula 1 -
// NCS has no sport-specific sector, so those industries get no tie-break
// help and simply fall back to "no match" on any tie, which is fine).
const INDUSTRY_TO_NCS_SECTOR: Record<string, string[]> = {
  building: ["construction-and-the-built-environment"],
  fixing: ["construction-and-the-built-environment", "engineering-and-manufacturing"],
  health: ["health-and-science", "care-services"],
  wellness: ["health-and-science", "care-services"],
  physiotherapy: ["health-and-science"],
  psychotherapy: ["health-and-science", "care-services"],
  teaching: ["education-and-early-years"],
  beauty: ["hair-and-beauty"],
  farming: ["agriculture-environment-and-animal-care"],
  pets: ["agriculture-environment-and-animal-care"],
  "horse-racing": ["agriculture-environment-and-animal-care"],
  "it-technology": ["digital"],
  gaming: ["digital", "creative-and-design"],
  money: ["legal-finance-and-accounting"],
  "estate-agency": ["legal-finance-and-accounting", "business-and-administration"],
  charity: ["business-and-administration", "care-services"],
  politics: ["business-and-administration"],
  journalism: ["creative-and-design"],
  cinema: ["creative-and-design"],
  theatre: ["creative-and-design"],
  music: ["creative-and-design"],
  "interior-design": ["creative-and-design"],
  fashion: ["creative-and-design"],
  hospitality: ["catering-and-hospitality"],
  "food-drink": ["catering-and-hospitality"],
  coffee: ["catering-and-hospitality"],
  beer: ["catering-and-hospitality"],
  bakery: ["catering-and-hospitality"],
  grocery: ["sales-marketing-and-procurement"],
  travel: ["catering-and-hospitality", "transport-and-logistics"],
  delivery: ["transport-and-logistics"],
  cars: ["engineering-and-manufacturing", "transport-and-logistics"],
  "formula-1": ["engineering-and-manufacturing"],
};

/**
 * Resolves a Career Map role name to an NCS catalog entry when there's no
 * roles.ts equivalent. Deliberately conservative: a wrong "high" or
 * "medium" match sends someone to the wrong real job, which is worse than
 * today's status quo (no link at all) - genuine ambiguity returns null
 * rather than guessing.
 */
export const resolveNcsCatalogMatch = (
  roleName: string,
  catalog: NcsCatalogEntry[],
  industry?: string,
): NcsMatch | null => {
  if (!roleName || catalog.length === 0) return null;

  // 1. Exact slugify match against NCS's own slugs.
  const direct = slugify(roleName);
  const exact = catalog.find((c) => c.ncs_slug === direct);
  if (exact) return { ncsSlug: exact.ncs_slug, title: exact.title, confidence: "high" };

  // 2. Token-overlap fallback - collect every candidate clearing the bar,
  // then use the sector map only to break a tie among them.
  const nameTokens = tokenize(roleName);
  if (nameTokens.size === 0) return null;

  let bestScore = 0;
  let winners: NcsCatalogEntry[] = [];

  for (const entry of catalog) {
    if (NCS_HARD_EXCLUSIONS.has(entry.ncs_slug)) continue;
    const score = jaccard(nameTokens, tokenize(entry.title));
    if (score < TOKEN_OVERLAP_THRESHOLD) continue;
    if (score > bestScore) {
      bestScore = score;
      winners = [entry];
    } else if (score === bestScore) {
      winners.push(entry);
    }
  }

  if (winners.length === 0) return null;
  if (winners.length === 1) {
    return { ncsSlug: winners[0].ncs_slug, title: winners[0].title, confidence: "medium" };
  }

  // Tie: only resolve it if the industry has a known plausible sector AND
  // exactly one tied candidate is tagged to it - otherwise stay ambiguous.
  const plausibleSectors = industry ? INDUSTRY_TO_NCS_SECTOR[industry] : undefined;
  if (plausibleSectors) {
    const sectorMatches = winners.filter((w) => w.ncs_sector && plausibleSectors.includes(w.ncs_sector));
    if (sectorMatches.length === 1) {
      return { ncsSlug: sectorMatches[0].ncs_slug, title: sectorMatches[0].title, confidence: "medium" };
    }
  }

  return null;
};
