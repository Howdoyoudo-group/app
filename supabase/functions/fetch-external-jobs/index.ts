const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { INDUSTRY_SYNONYMS, INDUSTRY_REGISTRY } from "../_shared/industry-registry.ts";

// ── Hospitality remap ───────────────────────────────────────────────
// We don't have a "Hospitality" industry page anymore. Hospitality jobs
// are split between Travel (hotels), Beer (pubs/breweries/bars), and
// Food & Drink (everything else - restaurants, cafés, catering).
// Food & Drink uses the slug "hospitality" internally on the front-end
// (see src/data/industries.ts), so we keep that slug for the default
// bucket and only reroute hotel/pub jobs.
const HOTEL_RE = /\b(hotel|hotels|hospitality manager|concierge|front office|front of house manager|housekeep|night manager|duty manager|reservations|guest experience|general manager hotel|cluster gm|resort)\b/i;
const HOTEL_COMPANY_RE = /\b(marriott|hilton|hyatt|ihg|intercontinental|accor|radisson|premier inn|travelodge|whitbread|four seasons|claridge|savoy|dorchester|connaught|ace hotel|edition hotel|soho house|the ned|nobu hotel|rosewood|mandarin oriental|peninsula|shangri-la|kimpton|standard hotel|firmdale|citizenm|yotel|ennismore|hoxton)\b/i;
const PUB_RE = /\b(pub|publican|brewery|brewer|brewing|cask ale|craft beer|taproom|cellar|beer sommelier|bar manager|head brewer)\b/i;
const PUB_COMPANY_RE = /\b(brewdog|fuller'?s|young'?s|greene king|mitchells & butlers|jd wetherspoon|wetherspoon|stonegate|marston'?s|shepherd neame|adnams|camden town brewery|beavertown|meantime|thornbridge)\b/i;

function remapHospitalityIndustry(row: any): any {
  if (!row || row.industry !== "hospitality") return row;
  const title = String(row.title || "");
  const company = String(row.company || "");
  if (HOTEL_RE.test(title) || HOTEL_COMPANY_RE.test(company)) {
    return { ...row, industry: "travel" };
  }
  if (PUB_RE.test(title) || PUB_COMPANY_RE.test(company)) {
    return { ...row, industry: "beer" };
  }
  // Default: Food & Drink (its slug is "hospitality" on the FE).
  return row;
}

// ── Resilient batch upsert ─────────────────────────────────────────
// Two unique indexes guard public.jobs:
//   • jobs_url_unique_idx (url)
//   • jobs_title_company_location_unique_idx (lower(title), lower(company), lower(location))
// supabase-js can only declare one onConflict target per call. When the batch
// hits the *other* unique index, Postgres raises an error and the entire
// upsert fails. We retry row-by-row in that case so the rest of the batch lands.
async function safeUpsertJobs(supabase: any, batch: any[]): Promise<number> {
  if (batch.length === 0) return 0;
  const minFreshExpiry = new Date(Date.now() + 60 * 86400000).toISOString();
  const remapped = batch.map((row) => {
    const mapped = remapHospitalityIndustry(row);
    const existingExpiry = mapped.expires_at ? new Date(mapped.expires_at).getTime() : 0;
    return {
      ...mapped,
      scraped_at: new Date().toISOString(),
      expires_at: !existingExpiry || existingExpiry < new Date(minFreshExpiry).getTime()
        ? minFreshExpiry
        : mapped.expires_at,
    };
  });
  const { error, data } = await supabase
    .from("jobs")
    .upsert(remapped, { onConflict: "url" })
    .select("id");
  if (!error) return data?.length || 0;

  // Likely a unique-violation on the (title, company, location) index.
  // Retry one row at a time so a single bad row doesn't kill the batch.
  let inserted = 0;
  for (const row of remapped) {
    const { data: oneData, error: oneErr } = await supabase
      .from("jobs")
      .upsert([row], { onConflict: "url" })
      .select("id");
    if (!oneErr) inserted += oneData?.length || 0;
    // Silently swallow per-row dupes (23505) - they're expected.
  }
  return inserted;
}

// ── Industry search config ──────────────────────────────────────────
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  beauty: [
    "beauty therapist", "beauty advisor", "beauty consultant", "beauty editor",
    "makeup artist", "make-up artist", "cosmetic chemist", "skincare formulator",
    "spa therapist", "esthetician", "aesthetician", "nail technician",
    "salon manager", "hair stylist", "hairdresser", "fragrance developer",
    "beauty buyer", "beauty marketing",
  ],
  beer: ["brewer", "brewery", "beer", "cellar", "taproom", "pub manager", "beer sommelier", "craft beer", "cask ale", "head brewer", "brewing", "publican", "bar manager"],
  coffee: ["coffee roaster", "barista", "coffee buyer", "cafe manager", "head barista", "coffee shop", "speciality coffee", "coffee", "café", "coffee trainer", "shift leader cafe"],
  cinema: ["film production", "film crew", "film editor", "film director", "film producer", "filmmaker", "cinema manager", "cinema", "screenwriter", "VFX artist", "visual effects", "casting director", "production assistant film", "post production", "television production", "tv production", "documentary producer", "broadcast producer", "video editor", "videographer", "cinematographer", "projectionist", "animation", "studio production"],
  fashion: ["fashion designer", "textile", "garment technologist", "fashion buyer", "fashion merchandiser", "fashion", "apparel", "visual merchandiser", "fashion stylist", "fashion ecommerce", "fashion PR", "fashion assistant", "luxury retail"],
  grocery: ["grocery retail", "supermarket", "supply chain FMCG", "store manager supermarket", "category manager grocery", "FMCG", "grocery buyer", "convenience store", "shop assistant", "checkout", "grocery delivery"],
  hospitality: ["hospitality manager", "head chef", "restaurant manager", "front of house", "hotel manager", "sous chef", "bartender", "waiter", "waitress", "kitchen porter", "chef de partie", "commis chef", "events manager hospitality", "concierge"],
  "food-drink": [
    "restaurant manager", "head chef", "sous chef", "bartender", "food and beverage",
    "catering manager", "chef", "food production", "kitchen manager", "restaurant",
    "pub kitchen", "chef de partie", "commis chef", "kitchen porter", "waiter",
    "waitress", "front of house restaurant", "pastry chef restaurant", "bar manager",
    "gastropub", "fine dining", "café manager", "deli manager", "food technologist",
    "menu development", "food and beverage manager", "private chef", "events catering",
  ],
  football: ["football", "premier league", "football club", "sports", "sports marketing", "sports commercial", "sports sponsorship", "broadcast rights", "matchday operations", "stadium manager", "sports media", "sports analyst", "performance analyst football", "football academy", "football operations", "club commercial", "fan engagement", "ticketing manager", "EFL", "FA group", "UEFA", "FIFA", "football PR", "football communications", "football partnerships", "football data", "football scouting"],
  music: [
    // Core / well-known roles
    "music producer", "record label", "A&R", "music publishing", "music supervisor",
    "artist manager", "music marketing", "music PR", "music licensing",
    "music streaming", "music tour manager", "music venue manager", "booking agent",
    // Entry-level — the gap flagged by users
    "music assistant", "label assistant", "A&R assistant", "studio assistant",
    "artist management assistant", "music coordinator", "music administrator",
    "promotions assistant music", "events coordinator music", "tour coordinator",
    "ticketing coordinator music", "music runner", "studio runner",
    // Business of music — rights, royalties, commercial
    "music rights", "royalty analyst", "royalties music", "music catalogue",
    "catalogue manager music", "sync supervisor", "sync licensing",
    "music publishing manager", "label manager", "label coordinator",
    "music business manager", "streaming operations music", "music data analyst",
    "music accountant", "entertainment lawyer music", "music contracts",
    // Performing & live
    "session musician", "session vocalist", "touring musician",
    "live performer", "DJ resident", "resident DJ", "club DJ", "live DJ",
    "DJ booking", "DJ manager", "performing arts music",
    // Live & technical
    "live sound engineer", "monitor engineer", "FOH engineer",
    "stage manager music", "production manager music",
  ],
  teaching: [
    "teacher", "teaching assistant", "school teacher", "education", "curriculum",
    "secondary teacher", "primary teacher", "SEN teacher", "SEND teacher", "NQT", "ECT",
    "lecturer", "head of department school", "PGCE", "supply teacher", "classroom teacher",
    "school leader", "head teacher", "deputy head", "assistant head", "form tutor",
    "teacher of english", "teacher of maths", "teacher of science", "teacher of history",
    "teacher of geography", "teacher of mfl", "teacher of pe", "teacher of art",
    "teacher of music", "teacher of computing", "teacher of business", "teacher of psychology",
    "early years teacher", "EYFS teacher", "key stage", "KS1 teacher", "KS2 teacher", "KS3",
    "cover supervisor", "learning support assistant", "LSA", "HLTA",
    "exam invigilator", "school", "academy", "sixth form", "college lecturer", "FE lecturer",
    "TEFL", "ESOL teacher", "tutor", "private tutor",
  ],
  "interior-design": ["interior designer", "interior stylist", "furniture designer", "showroom manager interiors", "kitchen designer", "interior architect", "FF&E designer", "junior interior designer", "design studio", "homeware buyer"],
  "estate-agency": ["estate agent", "lettings negotiator", "property manager", "conveyancer", "mortgage adviser", "property valuer", "surveyor RICS", "sales negotiator", "branch manager estate agency", "lettings", "block manager", "property consultant"],
  charity: ["charity fundraiser", "nonprofit", "impact officer", "grant manager", "charity", "third sector", "fundraising manager", "trusts and foundations", "community fundraiser", "campaign manager charity", "charity shop manager", "volunteer coordinator"],
  footwear: ["footwear designer", "shoe buyer", "sneaker", "footwear production", "shoe retail", "footwear", "shoe designer", "footwear merchandiser", "footwear development", "shoe store manager", "footwear technologist", "shoe retail manager", "footwear supply chain", "sneaker store", "shoe brand", "footwear warehouse", "running shoe", "sports footwear"],
  physiotherapy: ["physiotherapist", "physio", "rehabilitation", "musculoskeletal", "sports physio", "MSK physiotherapist", "neuro physiotherapist", "paediatric physiotherapist", "physiotherapy assistant", "rehab assistant"],
  psychotherapy: ["psychotherapist", "counsellor", "therapist", "CBT", "talking therapies", "IAPT", "psychological wellbeing practitioner", "high intensity therapist", "child psychotherapist", "family therapist", "clinical psychologist"],
  wellness: ["gym manager", "personal trainer", "fitness instructor", "wellness coach", "nutritionist", "yoga instructor", "pilates instructor", "spa manager", "wellbeing coach", "fitness coach", "massage therapist", "pilates teacher", "yoga teacher", "spa therapist"],
  bakery: ["bakery manager", "baker", "pastry chef", "bread", "bakery", "patisserie", "bakery production", "viennoiserie", "bakery assistant", "pastry commis", "bread maker"],
  gaming: ["game designer", "game developer", "game artist", "QA tester games", "game programmer", "esports", "unity developer", "unreal engine", "games", "video games", "game producer", "narrative designer", "level designer", "gameplay engineer"],
  journalism: ["journalist", "reporter", "news editor", "sub editor", "broadcast journalist", "press officer", "newsroom", "NCTJ", "digital journalist", "news producer", "feature writer", "investigative journalist"],
  jewellery: ["jewellery designer", "jeweller", "goldsmith", "gemmologist", "diamond", "stone setter", "jewellery retail", "bench jeweller", "jewellery", "watchmaker", "jewellery sales consultant", "polisher", "jewellery valuer"],
  // Broad terms first ("influencer", "creator", "social media") unlock
  // Adzuna's full long-tail (43k+ "influencer" hits in title+description).
  // INFLUENCING_TITLE_RX in inferIndustryFromText filters out noise so only
  // genuine creator-economy roles land in this bucket.
  // Coverage target: every role on the Influencing career map (Creators & Talent,
  // Production & Craft, Talent Mgmt & Agencies, Brand Partnerships & Sales,
  // Strategy/Data/Growth, Business & Commercial).
  influencing: [
    // Creators & Talent
    "influencer", "creator", "content creator", "creator economy",
    "youtube creator", "youtuber", "vlogger", "tiktok creator", "instagram creator",
    "podcast host", "podcaster", "newsletter writer", "substack writer",
    "live streamer", "twitch streamer",
    // Production & Craft
    "video editor", "short form video editor", "reels editor", "youtube video editor",
    "videographer", "creator videographer",
    "photographer creator", "content photographer",
    "podcast producer", "video producer creator", "shorts producer",
    "motion designer creator", "thumbnail designer", "graphic designer creator",
    // Talent Management & Agencies
    "talent manager", "creator talent manager", "talent agent", "creator agent",
    "talent booker", "booker creator", "talent scout", "creator scout",
    // Brand Partnerships & Sales
    "influencer marketing manager", "influencer marketing", "influencer manager",
    "creator marketing", "creator marketing manager",
    "creator partnerships", "creator partnerships manager", "partnerships manager creator",
    "branded content manager", "campaign manager influencer",
    "sales executive influencer", "account executive creator",
    "pr manager creator", "comms manager creator",
    // Strategy, Data & Growth
    "social media", "social media manager", "social media executive", "social media coordinator",
    "social media strategist", "social strategist",
    "community manager", "community manager creator", "community lead",
    "growth lead creator", "audience growth", "growth analytics",
    "paid social", "paid social specialist", "paid social manager",
    "seo specialist creator", "discovery specialist", "youtube seo",
    "tiktok manager", "youtube manager", "instagram manager",
    // Business & Commercial
    "creator business manager", "creator operations", "creator ops",
    "brand director creator", "head of creator",
    "legal counsel creator", "contracts counsel influencer",
    "operations manager creator", "finance manager creator",
    // Catch-all platform terms (filtered by INFLUENCING_TITLE_RX downstream)
    "tiktok", "youtube", "instagram", "podcast", "reels", "shorts",
  ],
  pets: ["veterinary", "vet nurse", "veterinary surgeon", "animal care", "pet shop", "dog groomer", "dog walker", "pet food", "kennel", "animal welfare", "animal behaviourist", "pet sitter", "veterinary receptionist"],
  cars: [
    "automotive engineer", "vehicle technician", "MOT tester", "car sales executive",
    "service advisor automotive", "master technician", "EV powertrain", "automotive designer",
    "dealership manager", "parts advisor", "body shop",
    "automotive aftersales", "car mechanic", "vehicle dealership",
    // Expanded keywords
    "automotive", "dealership", "car dealer", "vehicle sales", "used car",
    "service technician automotive", "diagnostic technician", "vehicle inspector",
    "panel beater", "bodyshop technician", "paint sprayer", "vehicle painter",
    "tyre fitter", "vehicle mechanic", "HGV technician", "LCV technician",
    "EV technician", "electric vehicle", "battery engineer", "powertrain engineer",
    "chassis engineer", "vehicle engineer", "calibration engineer",
    "aftersales advisor", "warranty administrator", "workshop controller",
    "sales manager automotive", "business manager dealership",
    "motor trade", "car retail", "vehicle preparation", "PDI technician",
    "fleet manager automotive", "automotive fleet",
    // Note: "transport manager", "fleet manager" (bare), "vehicle logistics" removed
    // — too broad, pulls in 3PL/logistics roles with no automotive context
  ],
  travel: [
    // Aviation/airline — keep keywords short; Reed treats multi-word phrases
    // as AND-required, so "airline jobs" / "pilot jobs UK" almost never match.
    "cabin crew", "flight attendant", "airline pilot", "first officer",
    "airport operations", "ground handling agent", "ramp agent",
    "aviation engineer", "aircraft engineer", "licensed aircraft engineer",
    "airline customer", "airline operations", "airside operations",
    "British Airways", "easyJet", "Ryanair", "Jet2", "Virgin Atlantic", "TUI",
    "train driver", "rail engineer", "signalling technician", "station manager",
    "travel consultant", "tour operator", "cruise ship",
    "transport planner", "concierge", "reservations agent",
  ],
  // Farming keywords: kept tight to avoid Adzuna returning unrelated retail/sales/tech
  // jobs that incidentally mention "agricultural" or "shepherd" (e.g. Shepherd's Bush
  // in London) in their text. Use precise multi-word phrases - no bare "agricultural",
  // no bare "shepherd", no bare "farm sales" (matches generic "field sales" at Adzuna).
  farming: [
    "farm manager", "farm worker", "farmhand", "agronomist", "herd manager",
    "dairy farm", "stockperson", "livestock manager", "poultry manager",
    "tractor driver", "combine driver", "horticulturist", "soft fruit grower",
    "agricultural engineer", "precision agriculture", "agritech",
    "grain trader", "rural surveyor", "farm shop manager",
    "farming jobs", "viticulture", "vineyard manager", "arable farm",
  ],
  money: [
    "investment banker", "retail banker", "relationship manager bank", "credit analyst",
    "portfolio manager", "equity research", "quantitative analyst", "wealth manager",
    "ESG analyst", "underwriter insurance", "actuary", "insurance broker",
    "claims manager", "fintech product manager", "payments engineer",
    "compliance officer financial", "chartered accountant", "auditor",
    "tax adviser", "forensic accountant", "CFO", "finance director",
    "trader equities", "treasurer", "risk manager financial", "financial planner",
    "IFA independent financial adviser", "asset management",
  ],
  health: [
    // Nursing & midwifery (expanded - UK's largest single clinical workforce)
    "registered nurse", "staff nurse", "ward nurse", "specialist nurse",
    "nurse practitioner", "advanced nurse practitioner", "clinical nurse specialist",
    "district nurse", "community nurse", "practice nurse", "school nurse",
    "mental health nurse", "RMN", "RGN", "RNLD", "learning disability nurse",
    "paediatric nurse", "neonatal nurse", "theatre nurse", "scrub nurse",
    "ICU nurse", "ITU nurse", "A&E nurse", "emergency nurse", "oncology nurse",
    "midwife", "community midwife", "health visitor", "school health nurse",
    "band 5 nurse", "band 6 nurse", "band 7 nurse",
    "healthcare assistant", "HCA", "nursing assistant", "care assistant",
    // Medical & allied
    "GP general practitioner", "hospital doctor", "consultant doctor", "surgeon",
    "psychiatrist", "registrar", "junior doctor", "FY1", "FY2", "ST1",
    "care worker", "carer", "care home manager", "live-in carer", "social worker",
    "pharmacist", "paramedic", "radiographer", "occupational therapist",
    "physiotherapist", "speech and language therapist", "dietitian",
    // Industry adjacencies
    "clinical researcher", "biomedical scientist", "medtech", "health data scientist",
    "pharma sales", "hospital manager", "practice manager GP", "public health",
    "NHS", "healthcare", "medical",
  ],
  "horse-racing": [
    // Strongest-volume Adzuna terms first (first 16 are what get queried).
    "racecourse", "equine", "stable hand", "horse racing", "equine vet",
    "work rider", "jockey", "racehorse trainer", "assistant trainer",
    "stable lad", "stable lass", "head lad", "travelling head",
    "racecourse manager", "clerk of the course", "bloodstock",
    // The rest (used by Reed/Jooble/etc which take more keywords).
    "equine veterinary nurse", "farrier", "racecourse operations",
    "stud manager", "racing manager", "racing journalist",
    "racing broadcaster", "BHA", "horseracing", "thoroughbred",
    "racing yard", "head person racing", "pupil assistant",
  ],
  "formula-1": [
    "formula 1", "formula one", "f1", "motorsport", "motor sport",
    "f1 engineer", "race engineer", "performance engineer", "aerodynamicist",
    "composite technician", "laminator", "vehicle dynamics engineer", "simulation engineer",
    "cfd engineer", "wind tunnel", "trackside engineer", "telemetry engineer",
    "motorsport logistics", "paddock operations", "motorsport sponsorship", "motorsport marketing",
    "mclaren racing", "mercedes-amg petronas", "red bull racing", "aston martin f1", "williams racing",
  ],
};

// ── Merge registry synonyms into INDUSTRY_KEYWORDS ───────────────────
// The registry at supabase/functions/_shared/industry-registry.ts is the
// single source of truth for industry slugs, names, baselines and synonyms.
// We *augment* the per-source keyword lists above (which encode source-
// specific tuning) with every spelling variant from the registry so
// Adzuna/Reed/Jooble queries always cover US/UK variants and synonyms.
// Adding a new industry to the registry is enough to start ingestion.
for (const spec of INDUSTRY_REGISTRY) {
  const existing = INDUSTRY_KEYWORDS[spec.slug] || [];
  const merged = new Set<string>();
  for (const k of [...existing, ...(INDUSTRY_SYNONYMS[spec.slug] || [])]) {
    const norm = (k || "").toLowerCase().trim();
    if (norm) merged.add(norm);
  }
  INDUSTRY_KEYWORDS[spec.slug] = Array.from(merged);
}

// ── RSS feed config (specialist job boards with working RSS feeds) ──
const RSS_JOB_FEEDS: Record<string, { url: string; source: string; tags?: string[]; maxItems?: number }[]> = {
  cinema: [
    { url: "https://www.mandy.com/uk/job-search/rss?category=film", source: "Mandy.com" },
    { url: "https://www.screenskills.com/jobs-and-opportunities/rss/", source: "ScreenSkills" },
    { url: "https://artsjobs.artscouncil.org.uk/vacancies/rss/?discipline=Film%20%26%20Video", source: "Arts Jobs Film" },
    { url: "https://www.bcreative.co.uk/jobs/feed/", source: "BCreative Film Jobs" },
    { url: "https://careers.bbc.co.uk/rss/jobs.xml", source: "BBC Careers" },
  ],
  music: [
    { url: "https://www.musictechjobs.com/feed/", source: "MusicTechJobs" },
    { url: "https://www.musicweek.com/jobs/rss", source: "Music Week" },
    { url: "https://www.musicjobs.com/rss/latest-jobs.xml", source: "MusicJobs.com" },
    // Arts Jobs (Arts Council England) — covers performers, session musicians,
    // orchestral/ensemble roles, music educators, venue & production staff.
    // Filtered to Music discipline; also catches entry-level arts admin.
    { url: "https://artsjobs.artscouncil.org.uk/vacancies/rss/?discipline=Music", source: "Arts Jobs" },
    { url: "https://artsjobs.artscouncil.org.uk/vacancies/rss/?discipline=Music+%26+Sound", source: "Arts Jobs" },
    // Creative Access — diversity-focused, strong on entry-level music &
    // entertainment roles (label, agency, publishing assistants).
    { url: "https://creativeaccess.org.uk/feed/", source: "Creative Access" },
    // Music Ally (music industry digital/streaming news & jobs)
    { url: "https://musically.com/category/jobs/feed/", source: "Music Ally Jobs" },
  ],
  charity: [
    { url: "https://www.charityjob.co.uk/jobs/rss", source: "CharityJob" },
  ],
  hospitality: [
    { url: "https://www.caterer.com/jobs/rss", source: "Caterer.com" },
  ],
  "food-drink": [
    { url: "https://www.caterer.com/jobs/rss", source: "Caterer.com" },
  ],
  fashion: [
    { url: "https://www.fashionunited.uk/rss/fashion-jobs", source: "FashionUnited" },
  ],
  journalism: [
    { url: "https://pressgazette.co.uk/jobs/feed/", source: "Press Gazette" },
    { url: "https://www.journalism.co.uk/jobs/rss/", source: "Journalism.co.uk" },
    { url: "https://www.theguardian.com/guardian-jobs-rss", source: "Guardian Jobs" },
    { url: "https://artsjobs.artscouncil.org.uk/vacancies/rss/?discipline=Media%20%26%20Film", source: "Arts Jobs Media" },
  ],
  football: [
    { url: "https://www.leisurejobs.com/jobs/rss?category=sport", source: "LeisureJobs Sport" },
  ],
  teaching: [
    { url: "https://www.tes.com/jobs/rss/all", source: "TES Jobs", maxItems: 50 },
  ],
  wellness: [
    { url: "https://www.leisurejobs.com/jobs/rss?category=fitness", source: "LeisureJobs Fitness" },
  ],
  travel: [
    { url: "https://www.catererglobal.com/jobs/rss", source: "CatererGlobal" },
    // Travel Jobs UK — specialist UK travel/aviation/cruise board. Pagination
    // works (~20 items per page); pull the first few pages to surface a
    // healthy slice of the ~1500-job catalogue including cabin crew,
    // pilots, holiday reps and reservations roles.
    { url: "https://www.traveljobs.co.uk/jobsrss/?countrycode=GB", source: "TravelJobs UK", maxItems: 25 },
    { url: "https://www.traveljobs.co.uk/jobsrss/?countrycode=GB&Page=2", source: "TravelJobs UK", maxItems: 20 },
    { url: "https://www.traveljobs.co.uk/jobsrss/?countrycode=GB&Page=3", source: "TravelJobs UK", maxItems: 20 },
    { url: "https://www.traveljobs.co.uk/jobsrss/?countrycode=GB&Page=4", source: "TravelJobs UK", maxItems: 20 },
  ],
  // UK farming & agriculture specialist boards. agrifj used to be filed
  // under grocery before the Farming page existed - now it lives in farming
  // alongside agrirs (Agricultural Recruitment Specialists) and farmhands.
  // 4xtrahands has no public RSS feed so it's not included here; could be
  // added later via Firecrawl scrape if volume justifies it.
  farming: [
    {
      url: "https://www.agrifj.co.uk/jobs.xml",
      source: "Agricultural & Farming Jobs",
      tags: ["Farming", "Agriculture", "Role: Farmer"],
      maxItems: 40,
    },
    {
      url: "https://www.agrirs.co.uk/jobs.xml",
      source: "Agricultural Recruitment Specialists",
      tags: ["Farming", "Agriculture", "Role: Farmer"],
      maxItems: 40,
    },
    {
      url: "https://www.farmhands.co.uk/feed",
      source: "Farm Hands",
      tags: ["Farming", "Agriculture", "Role: Farmer"],
      maxItems: 30,
    },
  ],
};

// ── Value chain stages per industry ─────────────────────────────────
const INDUSTRY_STAGES: Record<string, string[]> = {
  beer: ["Brewing & Production", "Quality & Lab", "Taproom & Retail", "Sales & Distribution", "Marketing & Brand", "Operations"],
  cinema: ["Idea & Story", "Pre-Production", "Production", "Post-Production", "Distribution", "Exhibition"],
  coffee: ["Farm & Origin", "Processing", "Roasting", "Distribution", "Retail & Café", "Cup & Consumer"],
  fashion: ["Design", "Sourcing", "Production", "Marketing", "Retail", "Consumer"],
  football: ["Youth Development", "Scouting & Recruitment", "Club Operations", "Matchday", "Broadcasting", "Commercial"],
  music: ["Creation", "Recording", "Production", "Distribution", "Marketing", "Live & Exhibition"],
  hospitality: ["Concept & Design", "Kitchen", "Front of House", "Supply Chain", "Marketing", "Operations"],
  "food-drink": ["Concept & Design", "Kitchen", "Front of House", "Supply Chain", "Marketing", "Operations"],
  grocery: ["Sourcing", "Manufacturing", "Distribution", "Merchandising", "Retail Ops", "Consumer"],
  teaching: ["Policy & Governance", "Training & CPD", "Curriculum", "Classroom", "Assessment", "Leadership"],
  "interior-design": ["Brief & Research", "Concept", "Design Development", "Procurement", "Build & Install", "Handover & Styling"],
  "estate-agency": ["Valuation & Listing", "Sales & Lettings", "Conveyancing", "Mortgages & Finance", "Property Management", "Technology & Portals"],
  charity: ["Mission & Cause", "Strategy", "Fundraising", "Operations", "Delivery", "Impact & Reporting"],
  footwear: ["Design & Development", "Manufacturing", "Supply Chain", "Retail & E-Commerce", "Marketing & Brand", "Business & Strategy"],
  physiotherapy: ["Education & Training", "NHS & Primary Care", "Sports & Performance", "Private Practice", "Specialist Areas", "Leadership & Management"],
  psychotherapy: ["Training & Qualification", "NHS & IAPT", "Private Practice", "Specialist Populations", "Supervision & Ethics", "Leadership & Research"],
  wellness: ["Gyms & Fitness", "Health & Wellbeing", "Supplements & Nutrition", "Activewear & Apparel", "Community & Experience", "Business & Growth"],
  bakery: ["Ingredients & Sourcing", "Baking & Production", "Packaging", "Distribution", "Retail & Café", "Marketing"],
  gaming: ["Concept & Pre-Production", "Development & Engineering", "Art & Audio", "QA & Live Ops", "Marketing & Publishing", "Business & Distribution"],
  journalism: ["Reporting & Newsgathering", "Broadcast & Audio", "Digital & Multimedia", "Photography & Visual", "Editorial & Production", "Commercial & Business"],
  jewellery: ["Design & Creation", "Craft & Workshop", "Sourcing & Supply", "Retail & Client Experience", "Marketing & Brand", "Business & Operations"],
  influencing: ["Creators & Talent", "Production & Craft", "Talent Management & Agencies", "Brand Partnerships & Sales", "Strategy, Data & Growth", "Business & Commercial"],
  pets: ["Veterinary & Animal Health", "Pet Food & Nutrition", "Pet Retail & E-Commerce", "Pet Services & Wellbeing", "Marketing & Brand", "Business & Operations"],
  cars: ["Design & Engineering", "Manufacturing", "Aftersales & Service", "Distribution & Logistics", "Retail & Sales", "EV & Future Mobility"],
  "formula-1": ["Engineering & Design", "Race Operations", "Manufacturing & Build", "Commercial & Partnerships", "Media & Fan Experience", "Business & Leadership"],
  travel: ["Airlines & Aviation", "Rail & Public Transport", "Hotels & Accommodation", "Tour Operators & Experiences", "Travel Tech & Platforms", "Business & Commercial"],
  beauty: ["Product Development", "Manufacturing & Supply", "Brand & Marketing", "Retail & Sales", "Professional Services", "Consumer & Community"],
  farming: ["Crops & Arable", "Livestock & Dairy", "Horticulture & Produce", "AgriTech & Machinery", "Supply Chain & Trading", "Business & Estate"],
  money: ["Banking", "Investment & Asset Management", "Insurance & Risk", "FinTech & Payments", "Accountancy, Audit & Tax", "Finance Leadership & Markets"],
  health: ["Doctors & Clinicians", "Nursing & Midwifery", "Care & Social Care", "Allied Health & Pharmacy", "MedTech, Biotech & Pharma", "Health Leadership & Policy"],
  "horse-racing": ["Riding & Stable", "Training & Performance", "Veterinary & Welfare", "Racecourse & Raceday", "Bloodstock & Betting", "Business & Industry"],
};

// ── Classification keywords → stage ────────────────────────────────
const CLASSIFICATION_RULES: Record<string, Record<string, string[]>> = {
  beer: {
    "Brewing & Production": ["brewer", "brewing", "cellar", "fermentation", "packaging"],
    "Quality & Lab": ["quality", "lab", "microbiologist", "sensory"],
    "Taproom & Retail": ["taproom", "bar", "bartender", "front of house", "retail"],
    "Sales & Distribution": ["sales", "account manager", "distribution", "wholesale"],
    "Marketing & Brand": ["marketing", "brand", "content", "social", "events"],
    "Operations": ["operations", "logistics", "warehouse", "finance"],
  },
  cinema: {
    "Idea & Story": ["screenwriter", "script", "story", "development", "literary"],
    "Pre-Production": ["producer", "casting", "location", "production design", "storyboard", "coordinator"],
    "Production": ["director", "cinematograph", "camera", "sound recordist", "gaffer", "grip"],
    "Post-Production": ["editor", "colourist", "vfx", "visual effects", "composer", "foley", "post-production"],
    "Distribution": ["sales agent", "distribution", "marketing", "publicist", "festival", "acquisitions"],
    "Exhibition": ["cinema manager", "programmer", "projectionist", "box office", "events"],
  },
  football: {
    "Youth Development": ["academy", "youth", "development officer"],
    "Scouting & Recruitment": ["scout", "recruitment", "video analyst", "data analyst"],
    "Club Operations": ["ceo", "operations", "stadium", "hr ", "finance"],
    "Matchday": ["coach", "manager", "physio", "kit manager", "doctor", "performance"],
    "Broadcasting": ["commentator", "pundit", "broadcast", "graphics", "digital content"],
    "Commercial": ["commercial", "sponsorship", "ticketing", "retail", "community", "brand"],
  },
  music: {
    "Creation": ["songwriter", "composer", "lyricist", "beat maker", "arranger"],
    "Recording & Production": ["recording engineer", "studio", "session musician", "session vocalist", "a&r", "mixing", "mastering", "sound design", "audio programmer"],
    "Performing & DJs": ["performer", "performing", "live performer", "touring musician", "DJ", "resident DJ", "club DJ", "session player", "orchestra", "conductor"],
    "Business & Rights": ["royalt", "sync", "music rights", "catalogue", "music publishing", "label manager", "label coordinator", "music contracts", "entertainment lawyer", "music accountant", "streaming operations"],
    "Marketing & PR": ["artist manager", "pr ", "publicity", "social media", "playlist", "journalist", "music marketing", "music coordinator", "music assistant", "label assistant"],
    "Live & Events": ["tour", "live sound", "foh engineer", "monitor engineer", "stage manager", "promoter", "festival", "venue", "booking agent", "production manager music"],
  },
  fashion: {
    "Design": ["fashion design", "textile design", "pattern", "creative director", "trend"],
    "Sourcing": ["sourcing", "fabric buyer", "sustainability", "compliance"],
    "Production": ["garment", "sample", "quality control", "production manager"],
    "Marketing": ["brand manager", "pr manager", "content creator", "stylist", "photographer"],
    "Retail": ["retail manager", "visual merchandis", "buyer", "store manager", "e-commerce"],
    "Consumer": ["customer experience", "community manager", "loyalty", "data analyst"],
  },
  coffee: {
    "Farm & Origin": ["farmer", "agronomist", "q grader", "origin buyer"],
    "Processing": ["processing", "green coffee", "import"],
    "Roasting": ["roaster", "roasting", "blend develop", "r&d"],
    "Distribution": ["wholesale", "account manager", "supply chain", "e-commerce"],
    "Retail & Café": ["café manager", "cafe manager", "barista", "shift supervisor"],
    "Cup & Consumer": ["brand strategist", "content creator", "events", "coffee educator"],
  },
  footwear: {
    "Design & Development": ["designer", "design", "last", "prototype", "materials", "colour"],
    "Manufacturing": ["production", "factory", "quality", "cobbler", "sample maker", "manufacturing"],
    "Supply Chain": ["supply chain", "sourcing", "logistics", "procurement", "warehouse"],
    "Retail & E-Commerce": ["store manager", "retail", "e-commerce", "ecommerce", "visual merchandis"],
    "Marketing & Brand": ["brand", "marketing", "social media", "content", "buyer"],
    "Business & Strategy": ["director", "head of", "sustainability", "analyst", "strategy"],
  },
  physiotherapy: {
    "Education & Training": ["student", "placement", "lecturer", "research", "academic"],
    "NHS & Primary Care": ["band 5", "band 6", "band 7", "band 8", "nhs", "community physio", "outpatient"],
    "Sports & Performance": ["sports physio", "pitch", "strength", "conditioning", "performance", "athlete"],
    "Private Practice": ["private", "clinic owner", "msk", "musculoskeletal", "domiciliary"],
    "Specialist Areas": ["neuro", "respiratory", "paediatric", "women's health", "pain management", "hand therapy"],
    "Leadership & Management": ["head of", "director", "ahp", "consultant", "service lead", "clinical lead"],
  },
  psychotherapy: {
    "Training & Qualification": ["trainee", "student", "placement", "training programme"],
    "NHS & IAPT": ["iapt", "pwp", "psychological wellbeing", "high intensity", "talking therapies", "nhs"],
    "Private Practice": ["private therapist", "online therapist", "private practice", "self-employed"],
    "Specialist Populations": ["child", "adolescent", "addiction", "eating disorder", "trauma", "perinatal", "couples"],
    "Supervision & Ethics": ["supervisor", "clinical supervisor", "ethics", "assessor"],
    "Leadership & Research": ["head of psychology", "director", "professor", "research", "service lead"],
  },
  wellness: {
    "Gyms & Fitness": ["gym", "fitness", "personal trainer", "pt", "instructor", "coach", "exercise"],
    "Health & Wellbeing": ["wellbeing", "wellness", "yoga", "pilates", "mindfulness", "spa"],
    "Supplements & Nutrition": ["nutrition", "supplement", "dietitian", "formulation", "protein"],
    "Activewear & Apparel": ["activewear", "apparel", "designer", "merchandis", "buyer", "retail"],
    "Community & Experience": ["community", "events", "social media", "content", "membership"],
    "Business & Growth": ["director", "head of", "operations", "strategy", "finance"],
  },
  "food-drink": {
    "Concept & Design": ["concept", "menu", "recipe"],
    "Kitchen": ["chef", "sous", "pastry", "baker", "kitchen"],
    "Front of House": ["waiter", "waitress", "host", "bartender", "sommelier", "front of house", "server"],
    "Supply Chain": ["supply chain", "procurement", "logistics", "wholesale"],
    "Marketing": ["marketing", "brand", "social media", "content"],
    "Operations": ["operations", "general manager", "area manager", "regional"],
  },
  "estate-agency": {
    "Valuation & Listing": ["valuer", "valuation", "listing", "appraiser", "EPC"],
    "Sales & Lettings": ["estate agent", "negotiator", "lettings", "sales progressor", "property consultant"],
    "Conveyancing": ["conveyancer", "solicitor", "legal", "paralegal"],
    "Mortgages & Finance": ["mortgage", "financial adviser", "broker"],
    "Property Management": ["property manager", "tenancy", "block manager", "maintenance"],
    "Technology & Portals": ["developer", "engineer", "analyst", "data", "product"],
  },
  "interior-design": {
    "Brief & Research": ["researcher", "trend", "consultant"],
    "Concept": ["designer", "creative director", "visualiser", "3d"],
    "Design Development": ["cad", "technical", "specification", "architect"],
    "Procurement": ["buyer", "procurement", "sourcing"],
    "Build & Install": ["project manager", "site manager", "installation", "joiner"],
    "Handover & Styling": ["stylist", "staging", "visual merchandis"],
  },
  bakery: {
    "Ingredients & Sourcing": ["sourcing", "buyer", "procurement", "ingredients"],
    "Baking & Production": ["baker", "pastry", "production", "dough"],
    "Packaging": ["packaging", "labelling"],
    "Distribution": ["distribution", "logistics", "driver", "warehouse"],
    "Retail & Café": ["retail", "café", "cafe", "store", "shop"],
    "Marketing": ["marketing", "brand", "social", "content"],
  },
  gaming: {
    "Concept & Pre-Production": ["game designer", "narrative", "level designer", "creative director", "ux designer", "producer"],
    "Development & Engineering": ["programmer", "developer", "engineer", "devops", "technical director", "coder", "unity", "unreal"],
    "Art & Audio": ["artist", "animator", "concept art", "audio", "composer", "vfx", "ui art", "3d"],
    "QA & Live Ops": ["qa", "tester", "live ops", "data analyst", "localisation", "community manager"],
    "Marketing & Publishing": ["brand manager", "pr ", "influencer", "trailer", "social media", "user acquisition", "marketing"],
    "Business & Distribution": ["business development", "monetisation", "esports", "licensing", "platform relations"],
  },
  journalism: {
    "Reporting & Newsgathering": ["reporter", "correspondent", "investigative", "data journalist", "court reporter"],
    "Broadcast & Audio": ["broadcast", "presenter", "anchor", "camera operator", "video journalist", "audio producer"],
    "Digital & Multimedia": ["digital editor", "social media editor", "seo", "newsletter", "podcast", "interactive"],
    "Photography & Visual": ["photographer", "picture editor", "photo", "graphic designer", "infographic"],
    "Editorial & Production": ["editor", "sub-editor", "copy editor", "features", "fact-check", "editorial assistant"],
    "Commercial & Business": ["subscription", "advertising", "audience development", "partnerships", "media lawyer", "communications"],
  },
  pets: {
    "Veterinary & Animal Health": ["vet", "veterinary", "veterinarian", "vet nurse", "veterinary nurse", "rvn", "animal health", "clinical"],
    "Pet Food & Nutrition": ["pet food", "nutrition", "npd", "formulation", "quality assurance", "production", "manufacturing"],
    "Pet Retail & E-Commerce": ["retail", "store", "shop", "e-commerce", "ecommerce", "buyer", "merchandis", "warehouse"],
    "Pet Services & Wellbeing": ["groomer", "grooming", "dog walker", "pet sitter", "trainer", "dog trainer", "behaviourist", "photographer", "boarding", "kennel", "daycare"],
    "Marketing & Brand": ["marketing", "brand", "content", "social media", "pr ", "communications"],
    "Business & Operations": ["operations", "finance", "hr", "director", "head of", "practice manager", "franchise"],
  },
  travel: {
    "Airlines & Aviation": ["pilot", "cabin crew", "flight", "airline", "airport", "aviation", "ground handling", "cargo"],
    "Rail & Public Transport": ["train driver", "rail", "signalling", "station", "bus", "transport planner", "tfl"],
    "Hotels & Accommodation": ["hotel", "housekeeping", "concierge", "front desk", "reception", "f&b", "spa"],
    "Tour Operators & Experiences": ["tour", "travel agent", "travel consultant", "destination", "cruise", "holiday"],
    "Travel Tech & Platforms": ["product manager", "software engineer", "data scientist", "ux", "booking", "platform"],
    "Business & Commercial": ["commercial", "marketing", "brand", "sustainability", "finance", "hr", "director"],
  },
  cars: {
    "Design & Engineering": ["designer", "automotive engineer", "powertrain", "aerodynamics", "cad", "cae", "vehicle engineer", "chassis"],
    "Manufacturing": ["production", "assembly", "quality engineer", "robotics", "supply chain", "paint shop", "lean manufacturing", "plant"],
    "Aftersales & Service": ["technician", "service advisor", "parts", "warranty", "mot tester", "body shop", "mechanic", "workshop"],
    "Distribution & Logistics": ["fleet manager", "logistics", "import", "export", "remarketing", "used car buyer", "vehicle logistics"],
    "Retail & Sales": ["sales executive", "business development", "finance and insurance", "dealership", "showroom", "brand experience", "car sales"],
    "EV & Future Mobility": ["ev", "electric vehicle", "charging", "connected car", "autonomous", "battery", "mobility", "sustainability"],
  },
  "formula-1": {
    "Engineering & Design": ["engineer", "aerodynamic", "cfd", "simulation", "vehicle dynamics", "controls", "systems", "design"],
    "Race Operations": ["race", "trackside", "performance", "strategy", "telemetry", "logistics", "paddock", "travel"],
    "Manufacturing & Build": ["composite", "laminator", "model maker", "machinist", "fabrication", "manufacturing", "assembly", "inspection"],
    "Commercial & Partnerships": ["commercial", "partnership", "sponsorship", "account", "sales", "hospitality"],
    "Media & Fan Experience": ["media", "content", "social", "communications", "marketing", "fan", "events"],
    "Business & Leadership": ["finance", "people", "hr", "legal", "strategy", "director", "manager", "operations"],
  },
};

function classifyJob(title: string, description: string, industry: string): { stage: string; roleCategory: string } {
  const combined = `${title} ${description}`.toLowerCase();
  const rules = CLASSIFICATION_RULES[industry];
  
  if (rules) {
    for (const [stage, keywords] of Object.entries(rules)) {
      for (const kw of keywords) {
        if (combined.includes(kw)) {
          return { stage, roleCategory: title };
        }
      }
    }
  }

  // Fallback: assign to middle stage
  const stages = INDUSTRY_STAGES[industry] || [];
  return { stage: stages[Math.floor(stages.length / 2)] || "General", roleCategory: title };
}

// ── Adzuna category → our industry slug ─────────────────────────────
// Adzuna classifies every job into one of ~30 categories. We trust this as a
// signal: when it clearly contradicts the industry we searched for, we keep
// the job under the searched industry but flag it for AI re-check.
const ADZUNA_CATEGORY_TO_INDUSTRY: Record<string, string[]> = {
  "retail-jobs": ["fashion", "footwear", "beauty", "grocery", "jewellery", "interior-design"],
  "hospitality-catering-jobs": ["hospitality", "food-drink", "coffee", "bakery", "beer", "travel", "formula-1"],
  "creative-design-jobs": ["fashion", "footwear", "interior-design", "cinema", "music", "jewellery", "formula-1"],
  "pr-advertising-marketing-jobs": ["fashion", "beauty", "music", "football", "cinema", "charity", "influencing", "formula-1"],
  "it-jobs": ["gaming", "formula-1"],
  "engineering-jobs": ["cars", "formula-1", "travel", "beer", "coffee"],
  "healthcare-nursing-jobs": ["physiotherapy", "psychotherapy", "wellness", "health"],
  "teaching-jobs": ["teaching"],
  "charity-voluntary-jobs": ["charity"],
  "property-jobs": ["estate-agency"],
  "logistics-warehouse-jobs": ["grocery", "fashion", "footwear", "farming", "formula-1"],
  // "cars" removed — automotive ≠ 3PL/warehouse; was pulling in haulage/logistics roles
  "sales-jobs": ["estate-agency", "cars", "fashion", "formula-1"],
  "travel-jobs": ["travel", "formula-1"],
  "manufacturing-jobs": ["cars", "beer", "coffee", "footwear", "fashion", "farming", "health", "formula-1"],
  "consultancy-jobs": ["money"],
  "domestic-help-cleaning-jobs": ["pets", "health"],
  "graduate-jobs": [],
  "trade-construction-jobs": ["interior-design"],
  "energy-oil-gas-jobs": [],
  "scientific-qa-jobs": ["beauty", "beer", "coffee", "health", "farming"],
  "social-work-jobs": ["charity", "psychotherapy", "health"],
  "admin-jobs": [],
  "hr-jobs": [],
  "legal-jobs": ["estate-agency", "money", "formula-1"],
  "accounting-finance-jobs": ["money", "formula-1"],
  "customer-services-jobs": [],
  "part-time-jobs": [],
  "other-general-jobs": [],
  "unknown": [],
};

// ── Temp / casual employer & agency keywords (per industry) ─────────
// These are added on top of the standard industry keywords during the
// "temp pass" so we surface contract/seasonal/casual roles from major UK
// generalist agencies, industry specialists, and direct hospitality/
// facilities employers known for casual hiring.
const TEMP_KEYWORDS_GLOBAL = [
  "Adecco", "Reed", "Hays", "Manpower", "Randstad", "Blue Arrow",
  "Pertemps", "Major Recruitment", "Office Angels", "Brook Street",
];
const TEMP_KEYWORDS_BY_INDUSTRY: Record<string, string[]> = {
  hospitality: ["Off to Work", "Berkeley Scott", "Sodexo", "Compass Group", "ISS Facility", "Aramark", "Mitie", "OCS", "Elior", "casual hospitality", "agency chef", "agency waiter"],
  "food-drink": ["Off to Work", "Berkeley Scott", "Sodexo", "Compass Group", "Aramark", "casual catering", "agency chef"],
  teaching: ["Zen Educate", "Teaching Personnel", "Protocol Education", "Academics Ltd", "supply teacher", "supply teaching"],
  travel: ["Sodexo", "Compass Group", "ISS Facility", "OCS"],
  charity: ["temporary fundraiser", "interim charity"],
  grocery: ["Blue Arrow", "Pertemps", "warehouse temp", "seasonal retail"],
  fashion: ["seasonal retail", "Christmas temp", "pop-up retail"],
  bakery: ["seasonal baker", "Christmas temp"],
  beer: ["festival bar staff", "events bar staff"],
  music: ["festival crew", "events crew", "stagehand"],
  cinema: ["festival runner", "production runner"],
  football: ["matchday steward", "matchday hospitality", "stadium catering"],
};

// Extra company → industry overrides for temp/agency hiring.
// Used during the temp pass to push agency listings into the right industry.
const TEMP_COMPANY_OVERRIDES: Record<string, string> = {
  "sodexo": "hospitality",
  "compass group": "hospitality",
  "aramark": "hospitality",
  "elior": "hospitality",
  "iss facility": "hospitality",
  "mitie": "hospitality",
  "ocs group": "hospitality",
  "off to work": "hospitality",
  "berkeley scott": "hospitality",
  "zen educate": "teaching",
  "teaching personnel": "teaching",
  "protocol education": "teaching",
  "academics": "teaching",
};

// ── Graduate / internship keywords (used by the grad sweep pass) ────
// Targets UK student-facing schemes Adzuna + Reed both index well.
const GRAD_KEYWORDS = [
  "graduate scheme",
  "graduate programme",
  "internship",
  "summer internship",
  "industrial placement",
  "year in industry",
  "spring week",
  "summer analyst",
  "trainee",
  "apprenticeship",
];

// Titles that should NEVER be force-tagged as Internship even if a grad
// keyword matched (Adzuna/Reed broad-match against descriptions, so senior
// recruiters and managers leak in).
const NON_GRAD_TITLE_REGEX =
  /\b(senior|lead|principal|staff|head of|manager|director|chief|partner|consultant|architect|specialist|supervisor|vp|vice president|sr\.?|associate director)\b/i;

// Manual / trade / operative titles that get false-positive tagged as
// "Internship" because recruiter blurbs mention apprenticeship schemes.
// These are real entry-level frontline jobs, not graduate schemes.
const MANUAL_TRADE_TITLE_REGEX =
  /\b(crane|forklift|fork lift|hgv|lgv|pcv|driver|warehouse operative|warehouse worker|labourer|labourer|cleaner|chef|cook|barista|bartender|waiter|waitress|carer|care assistant|support worker|nurse|electrician|plumber|welder|machinist|mechanic|operative|operator|fitter|fabricator|joiner|carpenter|bricklayer|scaffolder|roofer|painter|decorator|gardener|groundsman|porter|stocker|picker|packer|cashier|sales assistant|retail assistant|kitchen assistant|housekeeper|security guard|receptionist|administrator|admin assistant|teaching assistant|nursery assistant|hairdresser|beautician|dog walker|delivery|courier|technician)\b/i;

// Grad keywords that, when present in the TITLE, confirm it's a real
// scheme (not just a blurb mention).
const GRAD_TITLE_KEYWORDS_REGEX =
  /\b(graduate|intern|internship|placement|trainee|apprentice|apprenticeship|spring week|summer analyst|year in industry|industrial placement)\b/i;

// If the salary clearly exceeds entry-level pay, treat it as a normal role.
const GRAD_SALARY_CEILING = 38000; // £38k upper bound for true grad/intern jobs

function looksLikeRealGradJob(title: string, salaryMax: number | null): boolean {
  const t = title || "";
  // Must have a grad/intern keyword IN THE TITLE - not just the description
  if (!GRAD_TITLE_KEYWORDS_REGEX.test(t)) return false;
  // Block senior titles
  if (NON_GRAD_TITLE_REGEX.test(t)) return false;
  // Block manual/trade titles even if "apprentice" appears (e.g. "Apprentice Electrician")
  if (MANUAL_TRADE_TITLE_REGEX.test(t)) return false;
  // Block clearly above entry-level pay
  if (typeof salaryMax === "number" && salaryMax > GRAD_SALARY_CEILING) return false;
  return true;
}

// ── Adzuna global rate limiter ──────────────────────────────────────
// Adzuna's developer plan caps us at ~25 hits/minute. We keep a rolling
// window of recent request timestamps and gate every Adzuna fetch through
// adzunaFetch() so concurrent batches/sweeps share the same budget.
// Target 18/min to leave headroom for retries and the alert threshold (80%).
const ADZUNA_RATE_LIMIT = 18; // requests per 60s window
const _adzunaWindow: number[] = [];

// ── Adzuna 429 circuit-breaker ─────────────────────────────────────
// We distinguish two kinds of 429:
//   • Rate-limit 429  — Adzuna returns Retry-After; we waited and retried,
//     got 429 again. This is transient. Do NOT count toward the trip counter
//     — just skip this page and move on.
//   • Quota-exhausted 429 — no Retry-After on the retry response, meaning
//     Adzuna's daily 250-call cap is truly hit. Count these. After
//     ADZUNA_QUOTA_THRESHOLD exhausted responses, trip the breaker.
// Raising the threshold from 3 → 8 gives headroom for the occasional
// transient error that slips through the rate-limit retry path.
const ADZUNA_QUOTA_THRESHOLD = 8;
let _adzunaQuota429s = 0;   // only quota-exhausted 429s count here
let _adzunaExhausted = false;
// Hard per-run cap to protect the daily Adzuna quota (250 hits/day on the
// free dev plan). Budget: 2 daily-adzuna runs (06:00, 18:00) × 100 = 200,
// plus ~30 from the industry-health-monitor-morning sweep ≈ 230/day, leaving
// ~20 headroom for ad-hoc manual runs before Adzuna throttles us.
const ADZUNA_MAX_REQUESTS_PER_RUN = Number(Deno.env.get("ADZUNA_MAX_REQUESTS_PER_RUN") || 100);
let _adzunaTotalRequests = 0;
function isAdzunaExhausted(): boolean { return _adzunaExhausted; }

// ── Adzuna run telemetry ────────────────────────────────────────────
// Tracks per-sweep request/error counts during a single ingestion run so
// we can write a summary row to adzuna_run_log at the end.
type AdzunaSweepKind = "keyword" | "temp" | "grad" | "category" | "geo" | "role" | "passion" | "other";
type SweepStats = { requests: number; errors: number; jobs: number };
const _adzunaTelemetry = {
  startedAt: Date.now(),
  sweeps: new Map<string, SweepStats>(), // key = `${kind}:${industry}`
  errors: [] as Array<{ sweep: string; status?: number; message: string; at: string }>,
  currentSweep: "other:unknown" as string,
};
function setAdzunaSweep(kind: AdzunaSweepKind, industry: string) {
  _adzunaTelemetry.currentSweep = `${kind}:${industry}`;
  if (!_adzunaTelemetry.sweeps.has(_adzunaTelemetry.currentSweep)) {
    _adzunaTelemetry.sweeps.set(_adzunaTelemetry.currentSweep, { requests: 0, errors: 0, jobs: 0 });
  }
}
function recordAdzunaJobs(count: number) {
  const s = _adzunaTelemetry.sweeps.get(_adzunaTelemetry.currentSweep);
  if (s) s.jobs += count;
}
function recordAdzunaError(message: string, status?: number) {
  const s = _adzunaTelemetry.sweeps.get(_adzunaTelemetry.currentSweep);
  if (s) s.errors += 1;
  _adzunaTelemetry.errors.push({
    sweep: _adzunaTelemetry.currentSweep,
    status,
    message: message.slice(0, 300),
    at: new Date().toISOString(),
  });
}

async function adzunaFetch(url: string): Promise<Response> {
  // Circuit-breaker: if we've already tripped, return a synthetic 429
  // immediately so callers skip without wasting time.
  if (_adzunaExhausted) {
    return new Response("Adzuna circuit-breaker open", { status: 429 });
  }
  // Per-run hard cap to protect the monthly Adzuna quota
  if (_adzunaTotalRequests >= ADZUNA_MAX_REQUESTS_PER_RUN) {
    if (!_adzunaExhausted) {
      console.warn(`⚡ Adzuna per-run cap reached (${ADZUNA_MAX_REQUESTS_PER_RUN}) — tripping breaker for the rest of this run`);
    }
    _adzunaExhausted = true;
    return new Response("Adzuna per-run cap reached", { status: 429 });
  }
  // Wait until the rolling 60s window has room for one more hit
  while (true) {
    const now = Date.now();
    while (_adzunaWindow.length > 0 && now - _adzunaWindow[0] > 60_000) {
      _adzunaWindow.shift();
    }
    if (_adzunaWindow.length < ADZUNA_RATE_LIMIT) {
      _adzunaWindow.push(now);
      break;
    }
    const waitMs = 60_000 - (now - _adzunaWindow[0]) + 50;
    await new Promise((r) => setTimeout(r, Math.min(waitMs, 5_000)));
  }
  // Track every request, regardless of outcome.
  _adzunaTotalRequests += 1;
  const stats = _adzunaTelemetry.sweeps.get(_adzunaTelemetry.currentSweep);
  if (stats) stats.requests += 1;
  try {
    let res = await fetch(url);
    // Honour Retry-After on 429/503 once before giving up on this call.
    if ((res.status === 429 || res.status === 503)) {
      const retryAfterRaw = res.headers.get("retry-after");
      let waitMs = 0;
      if (retryAfterRaw) {
        const asInt = parseInt(retryAfterRaw, 10);
        if (!Number.isNaN(asInt)) waitMs = Math.min(asInt * 1000, 8_000);
      }
      if (waitMs === 0) waitMs = 2_000; // small default backoff
      await new Promise((r) => setTimeout(r, waitMs));
      res = await fetch(url);
    }
    if (res.status === 429) {
      // If the retry response has no Retry-After, the daily quota is exhausted
      // (not just a per-minute rate limit). Count only those toward the breaker.
      const isQuotaExhausted = !res.headers.get("retry-after");
      if (isQuotaExhausted) {
        _adzunaQuota429s += 1;
        if (_adzunaQuota429s >= ADZUNA_QUOTA_THRESHOLD) {
          _adzunaExhausted = true;
          console.warn(`⚡ Adzuna circuit-breaker TRIPPED: ${_adzunaQuota429s} quota-exhausted 429s — skipping all remaining Adzuna calls this run`);
        } else {
          console.warn(`⚡ Adzuna quota 429 (${_adzunaQuota429s}/${ADZUNA_QUOTA_THRESHOLD} before breaker trips)`);
        }
      } else {
        console.warn(`⚡ Adzuna rate-limit 429 (transient, Retry-After present — not counting toward breaker)`);
      }
      recordAdzunaError(`HTTP 429 (${isQuotaExhausted ? "quota" : "rate-limit"})`, 429);
      return res;
    }
    // Successful response resets the quota streak
    _adzunaQuota429s = 0;
    if (!res.ok) {
      recordAdzunaError(`HTTP ${res.status}`, res.status);
    }
    return res;
  } catch (err: any) {
    recordAdzunaError(err?.message || String(err));
    throw err;
  }
}

// ── Adzuna API fetcher ──────────────────────────────────────────────
async function fetchAdzunaJobs(industry: string, keywords: string[], appId: string, appKey: string, opts?: { temp?: boolean; grad?: boolean }) {
  const allJobs: any[] = [];
  const isTempPass = opts?.temp === true;
  const isGradPass = opts?.grad === true;

  // MAX_PAGES is calibrated against the real Adzuna budget (250 calls/day free
  // plan, 100 per run). With ~5 industries per day-bucket and 16 keywords each,
  // the per-keyword page budget is roughly 100 ÷ (5 × 16) ≈ 1.25 pages.
  // Setting MAX_PAGES = 4 means early keywords in a popular industry can go
  // a bit deeper while the global 100-request cap still terminates the run
  // before we truly over-spend — and industries processed later in the run
  // still get at least page 1 per keyword rather than nothing.
  // Temp/grad passes use 2 pages: they're supplementary and shouldn't crowd
  // out standard keyword results.
  // When a publisher account is obtained (25k+ calls/day), raise this to 20.
  const MAX_PAGES = isGradPass || isTempPass ? 2 : 4;
  // Niche industries have long-tail synonyms (groom, farrier, work rider for
  // horse-racing; sneaker, cordwainer for footwear; etc.) that get truncated
  // by the default 16-keyword cap. Give them more headroom - the global
  // 18req/min limiter still gates total Adzuna throughput.
  const NICHE_INDUSTRIES = new Set(["horse-racing", "formula-1", "jewellery", "footwear", "gaming", "interior-design"]);
  const standardKeywordCap = NICHE_INDUSTRIES.has(industry) ? 24 : 16;
  const searchKeywords = isGradPass
    ? GRAD_KEYWORDS.slice(0, 6)
    : isTempPass
    ? [
        ...(TEMP_KEYWORDS_BY_INDUSTRY[industry] || []),
        ...TEMP_KEYWORDS_GLOBAL.slice(0, 4),
      ].slice(0, 6)
    : keywords.slice(0, standardKeywordCap);

  for (const keyword of searchKeywords) {
    let stop = false;
    // Fetch pages in parallel batches of 5 to cut wall time ~5x while
    // staying under Adzuna's per-second rate limit.
    const BATCH = 5;
    for (let batchStart = 1; batchStart <= MAX_PAGES && !stop; batchStart += BATCH) {
      const pages = Array.from({ length: Math.min(BATCH, MAX_PAGES - batchStart + 1) }, (_, i) => batchStart + i);
      if (batchStart === 1) {
        console.log(`Adzuna ${isTempPass ? "TEMP " : ""}request for "${keyword}" (paginating up to ${MAX_PAGES} pages, batches of ${BATCH})`);
      }
      const tempFilter = isTempPass ? "&contract_time=contract" : "";
      const pageResults = await Promise.all(pages.map(async (page) => {
        try {
          const url = `https://api.adzuna.com/v1/api/jobs/gb/search/${page}?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}&results_per_page=50&what=${encodeURIComponent(keyword)}${tempFilter}&content-type=application/json`;
          const res = await adzunaFetch(url);
          if (!res.ok) {
            const errBody = await res.text();
            console.error(`Adzuna error for "${keyword}" p${page}: ${res.status} - ${errBody.slice(0, 200)}`);
            return { page, results: [] as any[], errored: true };
          }
          const data = await res.json();
          const results = data.results || [];
          if (page === 1) console.log(`Adzuna "${keyword}": total=${data.count}, page1=${results.length}`);
          return { page, results, errored: false };
        } catch (err) {
          console.error(`Adzuna fetch error for "${keyword}" p${page}:`, err);
          return { page, results: [] as any[], errored: true };
        }
      }));

      // If the entire batch came back empty, treat as end-of-results.
      if (pageResults.every((p) => p.results.length === 0)) {
        stop = true;
        continue;
      }

      for (const { results } of pageResults) {
        if (results.length === 0) continue;

      
      // Filter out obviously irrelevant employers for this industry.
      // Teaching is special-cased: schools/academies/councils legitimately post
      // classroom roles, so we only block central-government departments.
      // Health / wellness / physiotherapy are also special-cased: NHS Trusts
      // are the largest UK employer of nurses, midwives and allied health staff,
      // so we MUST keep "nhs" employers in those feeds - only strip true central
      // government departments.
      const HEALTH_LIKE = industry === "health" || industry === "wellness" || industry === "physiotherapy";
      const GOV_FILTER = industry === "teaching"
        ? /\b(hm treasury|hmrc|home office|cabinet office|dwp|defra|mod |civil service)\b/i
        : HEALTH_LIKE
        ? /\b(hm treasury|hmrc|home office|cabinet office|dwp|defra|mod |civil service|police force|borough council|county council|district council|parish council)\b/i
        : /\b(hm treasury|treasury|hmrc|home office|ministry of|cabinet office|nhs|dwp|defra|mod |civil service|government|police|council|borough|county council)\b/i;
      
      // Known company → correct industry overrides
     const COMPANY_INDUSTRY_OVERRIDES: Record<string, string> = {
         // F1 racing teams - MUST come before generic car brands so they match first
         "mclaren racing": "formula-1", "mclaren f1": "formula-1", "mclaren formula": "formula-1",
         "mercedes-amg petronas": "formula-1", "mercedes f1": "formula-1",
         "red bull racing": "formula-1", "red bull technology": "formula-1", "oracle red bull": "formula-1",
         "scuderia ferrari": "formula-1", "ferrari s.p.a": "formula-1",
         "aston martin f1": "formula-1", "aston martin aramco": "formula-1", "aston martin cognizant": "formula-1",
         "williams racing": "formula-1", "williams f1": "formula-1", "williams grand prix": "formula-1",
         "alpine f1": "formula-1", "alpine racing": "formula-1", "bwt alpine": "formula-1",
         "haas f1": "formula-1", "moneygram haas": "formula-1",
         "visa cash app rb": "formula-1", "rb f1": "formula-1", "racing bulls": "formula-1",
         "sauber motorsport": "formula-1", "stake f1": "formula-1", "audi f1": "formula-1",
         "formula 1": "formula-1", "formula one": "formula-1", "f1 management": "formula-1",
         "motorsport uk": "formula-1", "silverstone": "formula-1", "fia": "formula-1",
         "mclaren applied": "formula-1", "mclaren technology": "formula-1",
         "ann summers": "fashion", "victoria's secret": "fashion", "agent provocateur": "fashion",
        // Pet-services platforms - should always live in pets, never farming
        "tailster": "pets", "rover": "pets", "borrowmydoggy": "pets", "dogbuddy": "pets",
        "pets at home": "pets", "vets4pets": "pets",
        // Ride-hailing / mobility - Travel, not Tech/Cars feeds
        "uber": "travel", "uber eats": "hospitality", "bolt": "travel", "lyft": "travel",
        "addison lee": "travel", "free now": "travel",
        // Care providers - always Health, never Beauty/Farming/anything else
        "voyage care": "health", "hamberley care": "health",
        "hc-one": "health", "hc one": "health",
        "barchester healthcare": "health", "bupa care": "health", "bupa": "health",
        "care uk": "health", "four seasons health care": "health",
        "anchor hanover": "health", "sanctuary care": "health",
        "outcomes first group": "health", "priory group": "health",
        "the priory": "health", "elysium healthcare": "health",
        "cygnet health care": "health", "ramsay health": "health",
        "spire healthcare": "health", "circle health": "health",
        "nuffield health": "wellness",
        // Automotive OEMs / dealers - always Cars regardless of role title
        // (Tesla "Sales Advisor" was leaking into beauty; "Store Manager" into grocery)
        "tesla": "cars", "rivian": "cars", "lucid motors": "cars", "polestar": "cars",
        "bmw": "cars", "mercedes-benz": "cars", "mercedes benz": "cars", "audi": "cars",
        "volkswagen": "cars", "porsche": "cars", "ferrari": "cars", "lamborghini": "cars",
        "bentley motors": "cars", "rolls-royce motor": "cars", "aston martin": "cars",
        "mclaren automotive": "cars", "jaguar land rover": "cars", "jlr": "cars",
        "ford motor": "cars", "vauxhall": "cars", "stellantis": "cars", "peugeot": "cars",
        "renault": "cars", "nissan": "cars", "toyota": "cars", "lexus": "cars",
        "honda motor": "cars", "hyundai motor": "cars", "kia uk": "cars", "kia motors": "cars",
        "mazda motors": "cars", "volvo cars": "cars", "byd auto": "cars", "byd uk": "cars",
        "mini uk": "cars", "skoda": "cars", "seat uk": "cars", "cupra": "cars",
        "arnold clark": "cars", "sytner": "cars", "lookers": "cars", "vertu motors": "cars",
        "pendragon": "cars", "marshall motor": "cars", "inchcape": "cars", "jct600": "cars",
        "stoneacre": "cars", "lithia motors": "cars", "group 1 automotive": "cars",
        "cazoo": "cars", "cinch": "cars", "motorpoint": "cars", "carwow": "cars",
        "auto trader": "cars", "we buy any car": "cars", "webuyanycar": "cars",
      };

      // Company-name patterns that indicate the wrong industry assignment.
      // Used as a blocklist before any keyword match - catches care/charity/healthcare
      // companies leaking into beauty / farming / cinema feeds.
      const COMPANY_BLOCKLIST: Record<string, RegExp> = {
        beauty: /\b(care home|care management|care services|care group|healthcare|health care|nursing home|residential care|domiciliary|home care|hospice|nhs|hospital trust)\b/i,
        farming: /\b(care home|care management|care services|care group|healthcare|health care|nursing home|residential care|domiciliary|home care|hospice|nhs|hospital trust|legal|solicitor|barrister)\b/i,
        cinema: /\b(care home|care management|care services|healthcare|nursing home|nhs|hospital trust)\b/i,
        coffee: /\b(care home|nursing home|nhs|hospital trust)\b/i,
        beer: /\b(care home|nursing home|nhs|hospital trust)\b/i,
        cars: /\b(bromford)\b/i,
        psychotherapy: /\b(bromford|yard sale pizza|culina group|rapiscan|bionic services|vacancy filler|randox|aermor)\b/i,
        "horse-racing": /\b(specsavers|vision express|just eat|teleperformance|superbike factory|tesla|breedon group|hertfordshire catering|newto training|compass travel)\b/i,
        gaming: /\b(bennett & game|bennett and game)\b/i,
      };

      // Title-pattern rerouter: regardless of which industry feed found it,
      // certain title patterns belong elsewhere.
      const TITLE_INDUSTRY_REROUTE: Array<{ pattern: RegExp; industry: string }> = [
        { pattern: /\b(dog boarding|dog walk(?:er|ing)?|dog sit(?:ter|ting)?|pet sit(?:ter|ting)?|cat sit(?:ter|ting)?|kennel|cattery|dog day care|doggy daycare|pet groom)\b/i, industry: "pets" },
      ];

      // Title blocklist per industry
      const TITLE_BLOCKLIST: Record<string, RegExp> = {
        cinema: /\b(care assistant|care worker|carer|nurse|nursing|social worker|support worker|domiciliary|live.in care|healthcare)\b/i,
        grocery: /\b(lingerie|apparel|intimates|adult|swimwear)\b/i,
        football: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare)\b/i,
        beer: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare)\b/i,
        coffee: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare)\b/i,
        music: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare)\b/i,
        "interior-design": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|forklift|warehouse operative)\b/i,
        "estate-agency": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|forklift|warehouse operative)\b/i,
        "food-drink": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|forklift)\b/i,
        // Beauty: drop care/healthcare/kitchen leaks (Hamberley "Care Salon" etc.)
        beauty: /\b(care assistant|care worker|carer|nurse|nursing|social worker|support worker|domiciliary|live.in care|healthcare|kitchen assistant|kitchen porter|housekeep|maintenance|chef|cook|warehouse operative|forklift|hgv driver|delivery driver|courier|cleaner|electrician|plumber|therapy lead|occupational therapist|physiotherap|teaching assistant|sen teacher|registered manager care|deputy manager care)\b/i,
        // Farming: drop retail-adjacent matches that sneak through on incidental
        // mentions of "field" or "shepherd" (e.g. Shepherd's Bush in London).
        farming: /\b(shepherd['']?s bush|hollister|abercrombie|victoria['']?s secret|brand representative|key lead|hardware field|mechanical supervisor|field sales (?:executive|manager|representative)|field service engineer|mechanical design engineer|test.?commissioning engineer|maintenance technician|maintenance engineer|workshop engineer|technical trainer|criminal lawyer|head of prosecutions|prosecutor|rail engineering|automotive|industrial sales|cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka|sap consultant|paralegal|solicitor|barrister|legal counsel|care assistant|care worker|carer|nurse|nursing|social worker|support worker|healthcare|therapy lead|occupational therapist|physiotherap|warehouse operative|forklift|hgv driver|delivery driver|courier|cleaner|housekeep|electrician|plumber|refrigeration|draughtsperson|draughtsman|cad technician|architectural technician)\b/i,
        // Cars: exclude jobs that mention "car allowance" or "-driven" as a perk/buzzword in non-automotive roles
        cars: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|cook|chef|catering|kitchen assistant|kitchen porter|barista|bartender|waiter|waitress|warehouse operative|forklift|hgv driver|delivery driver|courier|car allowance|company car|target.?driven|results.?driven|sales.?driven|performance.?driven|commercially.?driven|data.?driven|insight.?driven|detail.?driven|customer.?driven|driven individual|driven professional)\b/i,
      };
      const titleBlocklist = TITLE_BLOCKLIST[industry];
      const companyBlocklist = COMPANY_BLOCKLIST[industry];

      // Positive-signal allowlist: for niche industries, require the title or
      // description to contain at least one strong industry term. Adzuna's
      // free-text "what" param is too loose on its own (e.g. "racing manager"
      // matches any job whose description mentions racing AND manager).
      const REQUIRED_SIGNAL: Record<string, RegExp> = {
        // Broadened: also accept groom/stud/hunt-yard/farrier/equine vet/jockey
        // coach/breaking-in. Without these we drop legit roles like
        // "Groom – Hunter Yard, Devon" or "Equine Vet – Newmarket".
        "horse-racing": /\b(horse[- ]?rac(?:e|ing)|horseracing|racehorse|race ?horse|racecourse|race.?course|race.?day|equine|equine vet|equestrian|thoroughbred|jockey|amateur jockey|apprentice jockey|conditional jockey|jockey coach|stable[s]?\b|stable lad|stable lass|stable hand|head lad|head girl|head lass|work rider|exercise rider|travelling head|yard manager|racing yard|hunt yard|hunter yard|stud farm|stud manager|stud groom|stud hand|stud assistant|stud secretary|groom|head groom|travelling groom|breaking.in|pre.training|bloodstock|bloodstock agent|farrier|paddock|turf club|BHA|British Horseracing|gallops|point.to.point|hunt yard|riding school|riding centre|riding instructor|racing manager|racing secretary|racing administrator|racecourse manager|clerk of the course|trainer['']?s assistant|assistant trainer)\b/i,
        "formula-1": /\b(formula\s?1|formula one|\bf1\b|grand prix|motorsport|motor sport|race engineer|race operations|trackside|paddock|aerodynamic|cfd|wind tunnel|vehicle dynamics|simulation engineer|performance engineer|strategy engineer|telemetry|composite|laminator|carbon fibre|motorsport logistics|racing team|mclaren racing|mercedes-amg petronas|red bull racing|aston martin f1|williams racing|alpine f1|haas f1|silverstone|motorsport uk|fia)\b/i,
      };
      const requiredSignal = REQUIRED_SIGNAL[industry];

      // Company-name allowlist for niche industries - if the title/description
      // doesn't trip the regex but the employer is clearly in-industry, keep
      // the job. Critical for racing yards whose vacancies just say "Groom".
      const COMPANY_ALLOWLIST: Record<string, RegExp> = {
        "horse-racing": /\b(racing|racecourse|race ?course|stud|stables|thoroughbred|jockey club|godolphin|coolmore|juddmonte|shadwell|cheveley park|darley|arena racing|jockey|equine|equestrian|hunt|bloodstock|BHA|British Horseracing)\b/i,
        "formula-1": /\b(formula\s?1|formula one|\bf1\b|motorsport|motor sport|mclaren racing|mercedes-amg petronas|red bull racing|oracle red bull|aston martin aramco|aston martin f1|williams racing|williams f1|alpine f1|haas f1|racing bulls|sauber motorsport|f1 management|motorsport uk|silverstone|fia)\b/i,
      };
      const companyAllowlist = COMPANY_ALLOWLIST[industry];

      for (const r of results) {
        const companyName = r.company?.display_name || "Unknown";
        const jobTitle = (r.title || "").slice(0, 255);
        
        // Skip government employers
        if (GOV_FILTER.test(companyName)) {
          console.log(`Skipping gov company "${companyName}" for ${industry}`);
          continue;
        }

        // Skip companies that obviously belong to another industry
        if (companyBlocklist && companyBlocklist.test(companyName)) {
          console.log(`Skipping blocked company "${companyName}" for ${industry}`);
          continue;
        }

        // Cross-industry brand blocklist (Uniqlo / Gail's / Tesco etc. in cinema)
        const crossBrandBlock = CROSS_INDUSTRY_BRAND_BLOCKLIST[industry];
        if (crossBrandBlock && crossBrandBlock.test(companyName)) {
          console.log(`[${industry}] Adzuna BLOCKED cross-industry brand: "${companyName}"`);
          continue;
        }

        // Skip blocked titles
        if (titleBlocklist && titleBlocklist.test(jobTitle)) {
          console.log(`Skipping blocked title "${jobTitle}" for ${industry}`);
          continue;
        }

        // Required positive signal (niche industries only).
        // Adzuna's free-text matching is too loose for narrow industries like
        // horse-racing - require a strong industry term in title or description,
        // OR an in-industry employer name (e.g. "Newmarket Racing Stables").
        if (requiredSignal) {
          const haystack = `${jobTitle}\n${r.description || ""}`;
          const titleOrDescMatch = requiredSignal.test(haystack);
          const companyMatch = companyAllowlist?.test(companyName) ?? false;
          if (!titleOrDescMatch && !companyMatch) {
            console.log(`Skipping "${jobTitle}" @ "${companyName}" for ${industry} - no required signal`);
            continue;
          }
        }

        // Check company override - reassign industry if needed
        const companyLower = companyName.toLowerCase();
        let assignedIndustry = industry;
        for (const [key, correctIndustry] of Object.entries(COMPANY_INDUSTRY_OVERRIDES)) {
          if (companyLower.includes(key)) {
            if (correctIndustry !== industry) {
              console.log(`Reassigning "${companyName}" from ${industry} → ${correctIndustry}`);
              assignedIndustry = correctIndustry;
            }
            break;
          }
        }
        // Temp-pass overrides (agencies / facilities employers → real industry)
        if (isTempPass) {
          for (const [key, correctIndustry] of Object.entries(TEMP_COMPANY_OVERRIDES)) {
            if (companyLower.includes(key)) {
              if (correctIndustry !== assignedIndustry) {
                console.log(`Temp override: "${companyName}" → ${correctIndustry}`);
                assignedIndustry = correctIndustry;
              }
              break;
            }
          }
        }
        // Title-pattern reroute (e.g. "Dog Boarding" → pets, even if found via farming feed)
        for (const { pattern, industry: targetIndustry } of TITLE_INDUSTRY_REROUTE) {
          if (pattern.test(jobTitle) && targetIndustry !== assignedIndustry) {
            console.log(`Title reroute: "${jobTitle}" from ${assignedIndustry} → ${targetIndustry}`);
            assignedIndustry = targetIndustry;
            break;
          }
        }
        // ── Adzuna structured fields ──────────────────────────────
        // 1) Category → industry sanity check
        const adzunaCategoryTag = (r.category?.tag || "").toLowerCase();
        const compatibleIndustries = ADZUNA_CATEGORY_TO_INDUSTRY[adzunaCategoryTag];
        // Flag for AI re-check if Adzuna's category doesn't include our industry
        // (and we have a mapping for that category at all)
        const categoryConflict = compatibleIndustries !== undefined
          && compatibleIndustries.length > 0
          && !compatibleIndustries.includes(assignedIndustry);
        if (categoryConflict) {
          console.log(`Adzuna category mismatch: "${jobTitle}" tagged ${adzunaCategoryTag}, kept under ${assignedIndustry} for AI re-check`);
        }

        // 2) Contract time → proper Full-time / Part-time / Temporary / Internship
        // Grad pass tags as "Internship" ONLY if the title/salary plausibly
        // matches a real grad/intern role.
        const adzMaxSalary = typeof r.salary_max === "number" ? r.salary_max : null;
        const treatAsGrad = isGradPass && looksLikeRealGradJob(jobTitle, adzMaxSalary);
        let jobType = "Full-time";
        if (treatAsGrad) jobType = "Internship";
        else if (isTempPass) jobType = "Temporary";
        else if (r.contract_type === "contract") jobType = "Contract";
        else if (r.contract_time === "part_time") jobType = "Part-time";
        else if (r.contract_time === "full_time") jobType = "Full-time";

        // 3) Richer location string from area hierarchy
        let locationStr: string | null = null;
        if (Array.isArray(r.location?.area) && r.location.area.length > 0) {
          // area is ordered country → region → county → city; reverse for "City, County, Region"
          const parts = [...r.location.area].reverse().slice(0, 3);
          locationStr = parts.join(", ");
        } else if (r.location?.display_name) {
          locationStr = r.location.display_name;
        }

        // 4) Salary with predicted flag
        let salaryStr: string | null = null;
        if (r.salary_min && r.salary_max) {
          const base = `£${Math.round(r.salary_min)} - £${Math.round(r.salary_max)}`;
          salaryStr = r.salary_is_predicted ? `${base} (est.)` : base;
        }

        const { stage, roleCategory } = classifyJob(jobTitle, r.description || "", assignedIndustry);
        // Append adref to description as a stable Adzuna ID for dedup/debug
        const baseDescription = (r.description || "").slice(0, 1900);
        const adref = r.adref ? `\n\n[adzuna:${r.adref}]` : "";

        const tagSet: string[] = [];
        if (isTempPass) tagSet.push("Temp");
        if (treatAsGrad) tagSet.push("Graduate", "Internship");

        // Adzuna's `redirect_url` (/jobs/land/ad/<id>?se=…&v=…) is a short-
        // lived, session-bound tracking redirector. CloudFront 403s end-user
        // browsers that hit it without coming through Adzuna's own site, so
        // candidates see "this job is no longer available" within hours of
        // posting. The canonical, browser-safe URL uses the numeric job id:
        //   https://www.adzuna.co.uk/details/<id>
        // which 301-redirects to /jobs/details/<id> and stays valid for the
        // lifetime of the listing. Fall back to redirect_url only if id is
        // missing.
        const canonicalAdzunaUrl = r.id
          ? `https://www.adzuna.co.uk/details/${r.id}`
          : (r.redirect_url || "");

        allJobs.push({
          title: jobTitle,
          company: companyName,
          industry: assignedIndustry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: locationStr,
          type: jobType,
          salary: salaryStr,
          description: baseDescription + adref,
          url: canonicalAdzunaUrl,
          source_url: "adzuna.com",
          expires_at: r.created ? new Date(new Date(r.created).getTime() + 60 * 86400000).toISOString() : null,
          // Flag conflicts so classify-jobs picks them up via the AI second pass
          needs_review: categoryConflict || undefined,
          // Force entry-level only when we believe it's a real grad role
          career_level: treatAsGrad ? "entry" : undefined,
          tags: tagSet.length > 0 ? tagSet : undefined,
        });
      }
      } // end for {results} of pageResults
      // Tiny throttle between page-batches to stay friendly with Adzuna's rate limit
      await new Promise((r) => setTimeout(r, 150));
    } // end for batchStart
  } // end for keyword

  return allJobs;
}

// ── Adzuna CATEGORY sweep ───────────────────────────────────────────
// For industries where Adzuna has a tightly-mapped category, sweep that
// category directly (no keyword filter). This unlocks the long tail Adzuna
// surfaces that our keyword list misses (e.g. ~12k teaching jobs vs ~500
// from keyword search). We trust Adzuna's category as the quality signal
// and only apply lightweight title/company sanity checks.
const INDUSTRY_TO_ADZUNA_CATEGORY: Record<string, string> = {
  teaching: "teaching-jobs",
  cinema: "creative-design-jobs",
  health: "healthcare-nursing-jobs",
  physiotherapy: "healthcare-nursing-jobs",
  charity: "charity-voluntary-jobs",
  "estate-agency": "property-jobs",
  hospitality: "hospitality-catering-jobs",
  "food-drink": "hospitality-catering-jobs",
  influencing: "pr-advertising-marketing-jobs",
};

// Influencing/creator-economy positive title signal - the
// pr-advertising-marketing-jobs category is broad (lots of B2B sales, account
// management, generic marketing). Require a creator/social/community signal
// before accepting a job into the influencing industry.
const INFLUENCING_CATEGORY_SIGNAL =
  /\b(influencer|creator|tiktok|youtube|youtuber|vlogger|instagram|reels|short.?form video|community manager|social media|paid social|content creator|creator partnerships|talent (?:manager|agent|booker|scout)|podcast (?:host|producer|manager)|podcaster|newsletter writer|substack|live streamer|twitch|video editor|videographer|thumbnail|motion designer|social strategist|creator (?:operations|ops|marketing|business|economy)|influencer marketing|branded content|partnerships manager|audience growth|youtube seo)\b/i;

async function fetchAdzunaByCategory(industry: string, appId: string, appKey: string) {
  const category = INDUSTRY_TO_ADZUNA_CATEGORY[industry];
  if (!category) return [];

  const allJobs: any[] = [];
  // Teaching has 220k+ live UK jobs on Adzuna - bump page cap so we sweep
  // a meaningful share of the long tail. Other industries stay at 30 pages.
  const MAX_PAGES = industry === "teaching" ? 80 : 50;
  const BATCH = 5;

  // Cinema needs a positive film/TV signal - creative-design-jobs is broad.
  const FILM_SIGNAL = /\b(film|tv|television|cinema|broadcast|production|post.?production|vfx|visual effects|animation|documentary|cinematograph|videograph|video editor|screenwriter|casting|studio|projectionist|runner)\b/i;

  // Teaching: only block obviously off-topic titles. teaching-jobs is clean.
  const TEACHING_BLOCK = /\b(software engineer|data engineer|devops|cyber security|paralegal|solicitor|barrister|hgv driver|forklift|warehouse operative|nurse practitioner|registered nurse|care assistant|estate agent|recruitment consultant)\b/i;

  for (let batchStart = 1; batchStart <= MAX_PAGES; batchStart += BATCH) {
    const pages = Array.from(
      { length: Math.min(BATCH, MAX_PAGES - batchStart + 1) },
      (_, i) => batchStart + i,
    );
    const pageResults = await Promise.all(pages.map(async (page) => {
      try {
        const url =
          `https://api.adzuna.com/v1/api/jobs/gb/search/${page}` +
          `?app_id=${encodeURIComponent(appId)}` +
          `&app_key=${encodeURIComponent(appKey)}` +
          `&results_per_page=50` +
          `&category=${encodeURIComponent(category)}` +
          `&max_days_old=30` +
          `&sort_by=date` +
          `&content-type=application/json`;
        const res = await adzunaFetch(url);
        if (!res.ok) {
          const errBody = await res.text();
          console.error(`Adzuna CATEGORY ${category} p${page}: ${res.status} - ${errBody.slice(0, 200)}`);
          return { results: [] as any[] };
        }
        const data = await res.json();
        if (page === 1) console.log(`Adzuna CATEGORY ${category}: total=${data.count}, page1=${data.results?.length || 0}`);
        return { results: data.results || [] };
      } catch (err) {
        console.error(`Adzuna CATEGORY ${category} p${page} fetch error:`, err);
        return { results: [] as any[] };
      }
    }));

    if (pageResults.every((p) => p.results.length === 0)) break;

    for (const { results } of pageResults) {
      for (const r of results) {
        const companyName = r.company?.display_name || "Unknown";
        const jobTitle = (r.title || "").slice(0, 255);
        const haystack = `${jobTitle}\n${r.description || ""}`;

        if (industry === "cinema" && !FILM_SIGNAL.test(haystack)) continue;
        if (industry === "teaching" && TEACHING_BLOCK.test(jobTitle)) continue;
        if (industry === "influencing" && !INFLUENCING_CATEGORY_SIGNAL.test(haystack)) continue;

        let jobType = "Full-time";
        if (r.contract_type === "contract") jobType = "Contract";
        else if (r.contract_time === "part_time") jobType = "Part-time";
        else if (r.contract_time === "full_time") jobType = "Full-time";

        let locationStr: string | null = null;
        if (Array.isArray(r.location?.area) && r.location.area.length > 0) {
          const parts = [...r.location.area].reverse().slice(0, 3);
          locationStr = parts.join(", ");
        } else if (r.location?.display_name) {
          locationStr = r.location.display_name;
        }

        let salaryStr: string | null = null;
        if (r.salary_min && r.salary_max) {
          const base = `£${Math.round(r.salary_min)} - £${Math.round(r.salary_max)}`;
          salaryStr = r.salary_is_predicted ? `${base} (est.)` : base;
        }

        const { stage, roleCategory } = classifyJob(jobTitle, r.description || "", industry);
        const baseDescription = (r.description || "").slice(0, 1900);
        const adref = r.adref ? `\n\n[adzuna:${r.adref}]` : "";

        // See note above on canonical Adzuna URLs - avoid the redirect_url
        // tracking redirector which 403s for end users.
        const canonicalAdzunaUrl = r.id
          ? `https://www.adzuna.co.uk/details/${r.id}`
          : (r.redirect_url || "");

        allJobs.push({
          title: jobTitle,
          company: companyName,
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: locationStr,
          type: jobType,
          salary: salaryStr,
          description: baseDescription + adref,
          url: canonicalAdzunaUrl,
          source_url: "adzuna.com",
          expires_at: r.created
            ? new Date(new Date(r.created).getTime() + 60 * 86400000).toISOString()
            : null,
        });
      }
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`[${industry}] Adzuna CATEGORY ${category} sweep: ${allJobs.length} jobs`);
  return allJobs;
}

// ── Geo-sweep: re-query the same Adzuna category sliced by major UK city ──
// Each city slice returns a distinct result set, so we can pull deeper into
// the long tail without spamming the same query. We only run this for
// industries known to be geographically dense (teaching, film, healthcare).
//
// Cost per industry: 6 cities × 5 pages = 30 calls. Combined with the
// national category sweep (30 calls) we stay well inside the 1k/day soft cap
// for daily runs across our top industries.
const ADZUNA_GEO_CITIES = [
  "London", "Manchester", "Birmingham", "Bristol", "Leeds", "Glasgow",
];

// Teaching is geographically dispersed across every UK town, so we add a much
// wider city list to slice the 220k+ Adzuna teaching pool.
const ADZUNA_GEO_CITIES_TEACHING = [
  "London", "Manchester", "Birmingham", "Bristol", "Leeds", "Glasgow",
  "Liverpool", "Sheffield", "Newcastle", "Nottingham", "Cardiff", "Edinburgh",
  "Belfast", "Coventry", "Leicester", "Stoke-on-Trent", "Reading", "Brighton",
  "Southampton", "Portsmouth", "Plymouth", "Norwich", "Oxford", "Cambridge",
  "York", "Bradford", "Sunderland", "Hull", "Wolverhampton", "Bolton",
];

async function fetchAdzunaByCategoryGeo(industry: string, appId: string, appKey: string) {
  const category = INDUSTRY_TO_ADZUNA_CATEGORY[industry];
  if (!category) return [];

  const allJobs: any[] = [];
  const PAGES_PER_CITY = 5; // up to 250 per city per industry
  const cities = industry === "teaching" ? ADZUNA_GEO_CITIES_TEACHING : ADZUNA_GEO_CITIES;
  const FILM_SIGNAL = /\b(film|tv|television|cinema|broadcast|production|post.?production|vfx|visual effects|animation|documentary|cinematograph|videograph|video editor|screenwriter|casting|studio|projectionist|runner)\b/i;
  const TEACHING_BLOCK = /\b(software engineer|data engineer|devops|cyber security|paralegal|solicitor|barrister|hgv driver|forklift|warehouse operative|nurse practitioner|registered nurse|care assistant|estate agent|recruitment consultant)\b/i;

  for (const city of cities) {
    const pages = Array.from({ length: PAGES_PER_CITY }, (_, i) => i + 1);
    const pageResults = await Promise.all(pages.map(async (page) => {
      try {
        const url =
          `https://api.adzuna.com/v1/api/jobs/gb/search/${page}` +
          `?app_id=${encodeURIComponent(appId)}` +
          `&app_key=${encodeURIComponent(appKey)}` +
          `&results_per_page=50` +
          `&category=${encodeURIComponent(category)}` +
          `&where=${encodeURIComponent(city)}` +
          `&max_days_old=30` +
          `&sort_by=date` +
          `&content-type=application/json`;
        const res = await adzunaFetch(url);
        if (!res.ok) {
          const errBody = await res.text();
          console.error(`Adzuna GEO ${category}/${city} p${page}: ${res.status} - ${errBody.slice(0, 200)}`);
          return { results: [] as any[] };
        }
        const data = await res.json();
        if (page === 1) console.log(`Adzuna GEO ${category}/${city}: total=${data.count}, page1=${data.results?.length || 0}`);
        return { results: data.results || [] };
      } catch (err) {
        console.error(`Adzuna GEO ${category}/${city} p${page} fetch error:`, err);
        return { results: [] as any[] };
      }
    }));

    for (const { results } of pageResults) {
      for (const r of results) {
        const companyName = r.company?.display_name || "Unknown";
        const jobTitle = (r.title || "").slice(0, 255);
        const haystack = `${jobTitle}\n${r.description || ""}`;

        if (industry === "cinema" && !FILM_SIGNAL.test(haystack)) continue;
        if (industry === "teaching" && TEACHING_BLOCK.test(jobTitle)) continue;
        if (industry === "influencing" && !INFLUENCING_CATEGORY_SIGNAL.test(haystack)) continue;

        let jobType = "Full-time";
        if (r.contract_type === "contract") jobType = "Contract";
        else if (r.contract_time === "part_time") jobType = "Part-time";
        else if (r.contract_time === "full_time") jobType = "Full-time";

        let locationStr: string | null = null;
        if (Array.isArray(r.location?.area) && r.location.area.length > 0) {
          const parts = [...r.location.area].reverse().slice(0, 3);
          locationStr = parts.join(", ");
        } else if (r.location?.display_name) {
          locationStr = r.location.display_name;
        }

        let salaryStr: string | null = null;
        if (r.salary_min && r.salary_max) {
          const base = `£${Math.round(r.salary_min)} - £${Math.round(r.salary_max)}`;
          salaryStr = r.salary_is_predicted ? `${base} (est.)` : base;
        }

        const { stage, roleCategory } = classifyJob(jobTitle, r.description || "", industry);
        const baseDescription = (r.description || "").slice(0, 1900);
        const adref = r.adref ? `\n\n[adzuna:${r.adref}]` : "";

        // Use canonical Adzuna listing URL (see note above) - avoid the
        // short-lived /jobs/land/ad/<id>?se=… tracking redirect.
        const canonicalAdzunaUrl = r.id
          ? `https://www.adzuna.co.uk/details/${r.id}`
          : (r.redirect_url || "");

        allJobs.push({
          title: jobTitle,
          company: companyName,
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: locationStr,
          type: jobType,
          salary: salaryStr,
          description: baseDescription + adref,
          url: canonicalAdzunaUrl,
          source_url: "adzuna.com",
          expires_at: r.created
            ? new Date(new Date(r.created).getTime() + 60 * 86400000).toISOString()
            : null,
        });
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`[${industry}] Adzuna GEO sweep ${category}: ${allJobs.length} jobs across ${cities.length} cities`);
  return allJobs;
}

// Industries where the geo-sweep adds meaningful coverage (high volume,
// geographically dispersed). Limited to keep us under daily quota.
const ADZUNA_GEO_INDUSTRIES = new Set(["teaching", "cinema", "health", "physiotherapy"]);


// ── Jobicy remote feeds (UK + EU + key categories) ──────────────────
// Jobicy publishes a worldwide remote-work job board with an RSS feed.
// We pull UK + Europe regions and only categories that match our platform.
const JOBICY_FEEDS: { url: string; source: string; category: string; region: string }[] = [
  // UK-tagged remote roles (broadest catch)
  { url: "https://jobicy.com/?feed=job_feed&search_region=uk", source: "Jobicy", category: "all", region: "uk" },
  // EU-tagged remote roles (most are open to UK applicants)
  { url: "https://jobicy.com/?feed=job_feed&search_region=europe", source: "Jobicy", category: "all", region: "europe" },
  // Worldwide remote in our key categories
  { url: "https://jobicy.com/?feed=job_feed&job_categories=marketing-communications", source: "Jobicy", category: "marketing", region: "worldwide" },
  { url: "https://jobicy.com/?feed=job_feed&job_categories=copywriting", source: "Jobicy", category: "copywriting", region: "worldwide" },
  { url: "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia", source: "Jobicy", category: "design", region: "worldwide" },
  { url: "https://jobicy.com/?feed=job_feed&job_categories=technical-support", source: "Jobicy", category: "tech", region: "worldwide" },
  { url: "https://jobicy.com/?feed=job_feed&job_categories=customer-service", source: "Jobicy", category: "customer-support", region: "worldwide" },
];

// Map Jobicy job titles → our internal industry slug. Anything that doesn't
// match a specific industry stays as "remote" so it shows in the Remote chip.
function inferIndustryFromTitle(title: string, desc: string): string {
  const t = `${title} ${desc}`.toLowerCase();
  if (/\b(marketing|brand|growth|seo|content|copywriter|crm|paid media|social media)\b/.test(t)) return "remote";
  if (/\b(designer|design|ux|ui|product designer|graphic)\b/.test(t)) return "remote";
  if (/\b(engineer|developer|software|devops|data scientist|sre|frontend|backend|full[- ]stack|qa|machine learning)\b/.test(t)) return "remote";
  if (/\b(customer support|customer success|technical support|customer service)\b/.test(t)) return "remote";
  return "remote";
}

async function fetchJobicyJobs() {
  const allJobs: any[] = [];
  for (const feed of JOBICY_FEEDS) {
    try {
      const res = await fetch(feed.url, { headers: { "User-Agent": "howdoyoudo-bot/1.0" } });
      if (!res.ok) {
        console.error(`Jobicy error (${feed.region}/${feed.category}): ${res.status}`);
        continue;
      }
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
      console.log(`Jobicy ${feed.region}/${feed.category}: ${items.length} items`);

      for (const item of items.slice(0, 25)) {
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const descMatch = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/);
        const pubMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        const regionMatch = item.match(/<job_listing:job_region><!\[CDATA\[(.*?)\]\]>/i);
        const typeMatch = item.match(/<job_listing:job_type><!\[CDATA\[(.*?)\]\]>/i);
        const companyMatch = item.match(/<job_listing:company><!\[CDATA\[(.*?)\]\]>/i);

        const title = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
        const url = (linkMatch?.[1] || "").trim();
        const desc = (descMatch?.[1] || "").replace(/<[^>]*>/g, "").trim();
        const company = (companyMatch?.[1] || "Jobicy").trim();
        const jobRegion = (regionMatch?.[1] || feed.region).trim();
        const jobType = (typeMatch?.[1] || "Full-time").trim();

        if (!title || !url) continue;

        const industry = inferIndustryFromTitle(title, desc);
        const pubDate = pubMatch?.[1] ? new Date(pubMatch[1]) : new Date();
        const expiresAt = new Date(pubDate.getTime() + 60 * 86400000).toISOString();

        allJobs.push({
          title: title.slice(0, 255),
          company: company.slice(0, 200),
          industry,
          value_chain_stage: null,
          role_category: null,
          location: `Remote (${jobRegion})`.slice(0, 200),
          type: jobType.slice(0, 50),
          work_mode: "Remote",
          salary: null,
          description: desc.slice(0, 2000) || null,
          url,
          source_url: feed.url,
          expires_at: expiresAt,
          tags: ["Remote"],
        });
      }
    } catch (err) {
      console.error(`Jobicy fetch error (${feed.region}/${feed.category}):`, err);
    }
  }
  return allJobs;
}

// ── RSS job feed parser ─────────────────────────────────────────────
async function fetchRssJobs(
  industry: string,
  feeds: { url: string; source: string; tags?: string[]; maxItems?: number }[],
) {
  const allJobs: any[] = [];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "howdoyoudo-bot/1.0" },
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`RSS error for ${feed.source} (${feed.url}): ${res.status} - ${body.slice(0, 200)}`);
        continue;
      }

      const xml = await res.text();
      console.log(`RSS ${feed.source}: ${xml.length} bytes, items=${(xml.match(/<item>/gi) || []).length}`);
      const items = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

      const cap = feed.maxItems ?? 10;
      for (const item of items.slice(0, cap)) {
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/);
        const pubMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

        const title = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
        const url = (linkMatch?.[1] || "").trim();
        const desc = (descMatch?.[1] || descMatch?.[2] || "").replace(/<[^>]*>/g, "").trim();

        if (!title || !url) continue;

        const { stage, roleCategory } = classifyJob(title, desc, industry);

        const pubDate = pubMatch?.[1] ? new Date(pubMatch[1]) : new Date();
        const expiresAt = new Date(pubDate.getTime() + 60 * 86400000).toISOString();

        allJobs.push({
          title: title.slice(0, 255),
          company: feed.source,
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: null,
          type: "Full-time",
          salary: null,
          description: desc.slice(0, 2000) || null,
          url,
          source_url: feed.url,
          expires_at: expiresAt,
          tags: feed.tags && feed.tags.length > 0 ? feed.tags : undefined,
        });
      }
    } catch (err) {
      console.error(`RSS fetch error for ${feed.source}:`, err);
    }
  }

  return allJobs;
}

// ── Reed.co.uk Jobseeker API ────────────────────────────────────────
// https://www.reed.co.uk/developers - free, ~250k UK jobs, strong on
// part-time/temp/entry-level. Auth: HTTP Basic with API key as username.
// Reed/Adzuna do free-text matching against title+description, so a "football coach"
// keyword can match a children's home that mentions football activities.
// REED GUARDRAILS - mirrored from Adzuna's stricter pipeline:
//  1) Government/public-sector employer filter (NHS, councils, MoD, etc.)
//  2) Per-industry title blocklist (mirrors validate-jobs)
//  3) Banned recruiters/aggregators that spam every keyword
//  4) Company → correct-industry overrides (e.g. Ann Summers searched under
//     grocery gets reassigned to fashion)
//  5) Cross-industry "company doesn't fit" detection → flag needs_review for
//     the AI second pass instead of silently keeping junk
//  6) Stable dedup ID appended to description ([reed:jobId]) like Adzuna adref
const REED_TITLE_BLOCKLIST: Record<string, RegExp> = {
  football: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|residential|children's home|childrens home|domiciliary|carer|teacher|teaching assistant|sen |send |send teacher|paediatric|pastoral|school|college|tutor|physiotherap|psycholog|counsellor|housekeep|cleaner|warehouse|forklift|hgv|driver|electrician|plumber|welder|labourer|lecturer|bingo caller|paralegal|solicitor|barrister|pawnbroker|surfacing operative|1st line engineer|it support|it service desk|service desk|apprentice (?!football|sport)|campsite|lifeguard|litiga|conveyancer|mortgage|estate agent|lettings)\b/i,
  cinema: /\b(care assistant|care worker|carer|nurse|nursing|social worker|support worker|domiciliary|live.in care|healthcare|warehouse|forklift|hgv|driver|electrician|plumber|welder|labourer)\b/i,
  music: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|warehouse|forklift|hgv|class 1 driver|class 2 driver|c\+e driver|tramper driver|delivery driver|courier|gxo|greencore|muller|stonegate|marston|calor gas|apleona|phs group|matchtech|specsavers|bet365|maintenance engineer|maintenance technician|machine operator|opex engineer|safety engineer|stores operative|gas service|service desk coordinator|hvac|wastekit|carpentry|joinery|engineering team leader|kitchen team|front of house team|activities assistant|inventory planning|portfolio director|early careers trainee|fundraising administrator|product architect)\b/i,
  beer: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|delivery driver|hgv driver|parcel|courier|yodel|dpd|evri|hermes|amazon flex|warehouse operative|forklift|integration engineer|billing manager|financial controller|tax manager|finance director|lead engineer|facilities project manager|electrical.*engineer|mechanical.*engineer|strategy.*go.to.market|service delivery partner|collections and treasury)\b/i,
  coffee: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|butcher|butchery|hgv|forklift)\b/i,
  bakery: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|hgv|forklift|sushi)\b/i,
  beauty: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|hgv|forklift|warehouse)\b/i,
  fashion: /\b(cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka|sap consultant|care assistant|nurse|social worker|support worker)\b/i,
  jewellery: /\b(cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka|sap consultant|hgv|forklift|care assistant|nurse|social worker|support worker)\b/i,
  hospitality: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|cyber security|software engineer|wind turbine|substation|nuclear|electrical engineer)\b/i,
  "food-drink": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|cyber security|software engineer|wind turbine|substation|nuclear|electrical engineer)\b/i,
  "interior-design": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|forklift|warehouse operative)\b/i,
  "estate-agency": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|forklift|warehouse operative)\b/i,
  travel: /\b(estate agent|lettings negotiator|conveyancer|mortgage adviser|care assistant|nurse|support worker)\b/i,
  charity: /\b(cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka)\b/i,
  pets: /\b(lecturer|fe teacher|further education|btec|examiner|teacher of|sen teacher|primary teacher|secondary teacher|teaching assistant|tutor|cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka|sap consultant)\b/i,
  cars: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|cook|chef|catering|kitchen assistant|kitchen porter|hertfordshire catering|school cook|barista|bartender|waiter|waitress|warehouse operative|warehouse manager|warehouse supervisor|warehouse team leader|3pl|third.party logistics|logistics coordinator|logistics manager|logistics administrator|transport coordinator|transport planner|transport administrator|transport manager|transport director|transport supervisor|transport operative|\btransport\b|freight coordinator|freight manager|haulage|pallet|forklift|class 1 driver|class 2 driver|hgv driver|lgv driver|tramper driver|night trunk driver|delivery driver|multi.?drop driver|van driver|courier|last mile|parcel operative|picker packer|picking packer|fulfilment operative|distribution operative|inventory controller|stock controller|car allowance|company car|target.?driven|results.?driven|sales.?driven|performance.?driven|commercially.?driven|data.?driven|insight.?driven|detail.?driven|customer.?driven|driven individual|driven professional)\b/i,
  "formula-1": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|cook|chef|kitchen assistant|kitchen porter|barista|bartender|waiter|waitress|vehicle technician|mot tester|service advisor|car sales|dealership|used car|tyre fitter|delivery driver|courier|warehouse operative)\b/i,
  teaching: /\b(plumber|electrician|welder|forklift|hgv driver|cyber security|software engineer|paralegal|solicitor|barrister|legal counsel|swim school|lifeguard|marketing executive|marketing manager|marketing assistant|sales executive|recruitment consultant|estate agent|nurse|nursing|care assistant|support worker|psychologist|aspiring child|psychology graduate)\b/i,
  farming: /\b(shepherd['']?s bush|hollister|abercrombie|victoria['']?s secret|brand representative|key lead|hardware field|mechanical supervisor|field sales (?:executive|manager|representative)|field service engineer|mechanical design engineer|test.?commissioning engineer|maintenance technician|maintenance engineer|workshop engineer|technical trainer|criminal lawyer|head of prosecutions|prosecutor|rail engineering|automotive|industrial sales|uber|drive with uber|driver account|deliveroo|amazon flex|care assistant|care worker|carer|support worker|nurse|nursing|social worker|charity lawyer|solicitor|paralegal|barrister|hgv class|delivery driver|courier|warehouse operative|forklift|cleaner|housekeep|draughtsperson|draughtsman|draftsman|cad technician|architectural technician|refrigeration|electrician|plumber|cyber security|software engineer)\b/i,
  journalism: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|hgv|forklift)\b/i,
  // NEW - mirror Adzuna coverage:
  grocery: /\b(lingerie|apparel|intimates|adult|swimwear|cyber security|software engineer|care assistant|nurse|social worker|support worker)\b/i,
  footwear: /\b(cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka|care assistant|nurse|social worker|support worker|driving instructor|hgv driver|trainee hgv|trainee driver|become a driving|personal trainer|fitness coach|pharmacy technician|pharmacist|dispenser|beauty advisor|beauty specialist|beauty consultant|optical assistant|optometrist|dispensing optician|maintenance electrician|head waiter|waiter|waitress|head of food|joint venture partner|swim school|lifeguard|estate agent|lettings)\b/i,
  gaming: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|hgv|forklift)\b/i,
  wellness: /\b(cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka|hgv|forklift)\b/i,
  physiotherapy: /\b(cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka|hgv|forklift|estate agent|lettings)\b/i,
  psychotherapy: /\b(cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka|hgv|forklift|estate agent|lettings|delivery driver|delivery cyclist|moped driver|pizza|cleaning assistant|sales administrator|insurance sales|office manager|computer programmer|eyfs practitioner)\b/i,
  "horse-racing": /\b(teacher|teaching assistant|eyfs|sen teacher|lecturer|tutor|nurse|nursing|care assistant|carer|social worker|support worker|delivery driver|courier|cleaner|cleaning|field service engineer|maintenance engineer|plumber|electrician|welder|hgv|forklift|warehouse|paralegal|solicitor|barrister|conveyancer|mortgage|estate agent|lettings|credit controller|motor vehicle|assembler|production operative|electronics technician|cyber security|software engineer|optometrist|optician|dispensing|bus driver|data entry clerk|surfacing operative)\b/i,
};

// Government / public-sector employers that should never appear under a
// consumer-industry feed (mirrors Adzuna's GOV_FILTER).
// Health / wellness / physiotherapy retain NHS Trusts (largest UK employer of
// nurses, midwives, allied-health professionals) - only strip true central-gov.
const REED_GOV_FILTER = /\b(hm treasury|treasury|hmrc|home office|ministry of|cabinet office|nhs|dwp|defra|mod |civil service|government|police|council|borough|county council|hm prison|hmps|ofsted|ofcom)\b/i;
const REED_GOV_FILTER_HEALTH = /\b(hm treasury|hmrc|home office|cabinet office|dwp|defra|mod |civil service|hm prison|hmps|ofsted|ofcom|police force|borough council|county council|district council|parish council)\b/i;

// Generic recruiters/aggregators that spam every keyword with unrelated roles.
const REED_BANNED_COMPANIES = /\b(appcastenterprise|appcast|witherslack|hays|reed specialist|michael page|robert walters|adecco|randstad|manpower|kelly services|search consultancy|gi group|pertemps|brook street|office angels|blue arrow|major recruitment|service care solutions|sanctuary personnel|zachary daniels|aspire people|teaching personnel|reeson education|tradewind recruitment)\b/i;

// ── Cross-industry brand blocklist ────────────────────────────────────
// For every consumer industry, list well-known brands from OTHER industries
// that keep leaking in via loose keyword/category matching (e.g. Uniqlo, Gail's,
// Pret showing up under "cinema" because Adzuna's category sweep grabs any
// retail/store role tangentially mentioning "film", "media" or a postcode).
//
// Multi-industry brands (Amazon, Google, Disney, Sony) are intentionally
// NOT listed - they really do hire across these areas.
const FASHION_BRANDS = "uniqlo|zara|primark|h&m|h & m|hennes|asos|boohoo|missguided|next plc|next retail|ted baker|burberry|paul smith|reiss|whistles|hobbs|jigsaw|cos stores|& other stories|river island|new look|peacocks|matalan|tk maxx|tjx|mountain warehouse|jack wolfskin|fat face|white stuff|seasalt|joules|barbour|hunter boot|crew clothing|jack wills|superdry|all saints|allsaints|urban outfitters|anthropologie|free people|levi['']?s|gap inc|banana republic|old navy|abercrombie|hollister|american eagle|tommy hilfiger|calvin klein|ralph lauren|polo ralph|lacoste|fred perry|ben sherman|farah|pretty little thing|prettylittlething|nasty gal|in the style|quiz clothing|select fashion|dorothy perkins|wallis|burton menswear|topshop|topman|m&co|monsoon|accessorize|oasis fashion|warehouse fashion|coast fashion|karen millen|lk bennett|phase eight|french connection|fcuk|sosandar|joe browns|long tall sally|simply be|jd williams|cotton traders";
const GROCERY_BRANDS = "tesco|sainsbury['']?s|asda|morrisons|aldi|lidl|waitrose|co-op food|the co-operative food|iceland foods|ocado|farmfoods|booths supermarket|budgens|nisa local|spar uk|costcutter|londis|premier stores|heron foods|poundland|poundstretcher|home bargains|b&m retail|wilko";
const HOSPITALITY_BRANDS = "gail['']?s|gails bakery|pret|pret a manger|greggs|costa coffee|costa limited|starbucks|caffe nero|caff[èe] nero|nero group|leon restaurants|itsu|wasabi|yo! sushi|wagamama|nando['']?s|pizza express|pizzaexpress|pizza hut|domino['']?s pizza|papa john['']?s|kfc|mcdonald['']?s|burger king|five guys|subway sandwich|chipotle|honest burgers|gourmet burger|byron burger|wahaca|dishoom|las iguanas|all bar one|harvester|toby carvery|brewers fayre|beefeater|miller & carter|premier inn|travelodge|hilton hotel|marriott|intercontinental|ihg hotels|holiday inn|accor hotels|novotel|ibis hotel|whitbread|mitchells & butlers|stonegate group|greene king|ei group|young['']?s pub|fuller['']?s|wetherspoon|jd wetherspoon|caffè ritazza|soho house";
const ESTATE_AGENCY_BRANDS = "haart|foxtons|savills|knight frank|jll uk|cbre uk|hamptons international|chestertons|winkworth|kfh|kinleigh folkard|dexters|marsh & parsons|john d wood|douglas & gordon|barnard marcus|ludlowthompson|james pendleton|bairstow eves|connells|countrywide estate|william h brown|spencers estate|jackson stops|fine & country|leaders romans|leaders limited|martin & co|northwood uk|belvoir|reeds rains|your move|rightmove|zoopla|onthemarket|purple ?bricks|yopa|housesimple";
const HEALTH_CARE_BRANDS = "bupa|nuffield health|spire healthcare|circle health|ramsay health|priory group|cygnet health|elysium healthcare|four seasons health|hc-one|hc one|hca healthcare|barchester|anchor hanover|sanctuary care|care uk|hamberley|voyage care|outcomes first|witherslack|caretech|allied healthcare|bluebird care|agria pet|compass group";
const CARS_BRANDS_X = "arnold clark|sytner|lookers|vertu motors|pendragon|marshall motor|inchcape|jct600|stoneacre|cazoo|cinch|motorpoint|carwow|webuyanycar|we buy any car|kwik fit|halfords autocentre|protyre|mr clutch|ats euromaster|formula one autocentres";
const F1_BRANDS_X = "mclaren racing|mercedes-amg petronas|red bull racing|oracle red bull|aston martin aramco|aston martin f1|williams racing|williams f1|alpine f1|haas f1|racing bulls|sauber motorsport|formula 1|formula one|f1 management|motorsport uk|silverstone";
const PETS_BRANDS = "pets at home|vets4pets|companion care|medivet|cvs group|ivc evidensia|linnaeus|vets now|jollyes|petsmart|pets corner";
const BANKS_BRANDS = "barclays|hsbc|natwest|lloyds bank|halifax|santander uk|nationwide building|tsb bank|metro bank|monzo|starling bank|revolut|wise plc|paypal|klarna|afterpay|clearpay|capital one";
const TELCO_BRANDS = "bt group|british telecom|openreach|virgin media|sky uk|sky betting|talktalk|ee mobile|vodafone|o2 telef|three uk|hyperoptic|community fibre|cityfibre";
const ENERGY_BRANDS_X = "british gas|centrica|edf energy|e\\.on|eon next|octopus energy|ovo energy|scottish power|sse plc|bulb energy|shell energy|ecotricity|good energy|drax|national grid";
const LOGISTICS_BRANDS = "yodel|dpd uk|evri|hermes parcel|amazon flex|amazon logistics|royal mail|parcelforce|fedex|ups uk|tnt express|dhl supply|gxo|wincanton|xpo logistics|culina|stobart|dx delivery";
const PROFESSIONAL_SERVICES_BRANDS = "deloitte|kpmg|pwc uk|pricewaterhousecoopers|ey llp|ernst & young|accenture|capgemini|atos|cognizant|infosys|tcs uk|tata consultancy|wipro|hcl tech|dxc technology|fujitsu|cgi group|mckinsey|bain & company|oliver wyman|roland berger";
const RECRUITER_NOISE = "zachary daniels|four squared|norfolk capsey|bv recruitment|grapevine jobs|harnham|pyramid recruitment|rocking zebra|get staffed|handle recruitment|christy media|brewer morris|la fosse|larbey evans|gearing recruitment|aspire people|teaching personnel|reeson education|tradewind recruitment|academics ltd|academics ";
const EDUCATION_BRANDS = "kingston college|chichester college|birmingham metropolitan college|capital city college|stoke-on-trent college|ncg corporation|lte group|magdalen college school|brighton college|malvern college|oneeschool|oneschool global|university of|canterbury christ church|leeds beckett|sheffield hallam|oxford brookes|de montfort|edge hill|roehampton|ucl |imperial college|king['']?s college";
const MISC_NON_SPORTS_BRANDS = "national trust|buzz bingo|keoghs llp|icaew|superdrug|ao\\.com|h&t pawnbroker|breedon group|claranet|bechtle|express solicitors|horwich farrelly|flow recruitment|rise technical|forward role|adore recruitment|the army|mbs lighting|unipart|vermelo|pursuit resources|connaught resourcing|barnardos|barnardo['']?s|david lloyd";
const TRAVEL_TECH_BRANDS = "expedia|booking\\.com|trivago|skyscanner|kayak|tripadvisor|lastminute";

const CROSS_INDUSTRY_BRAND_BLOCKLIST: Record<string, RegExp> = {
  cinema: new RegExp(`\\b(${FASHION_BRANDS}|${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${ENERGY_BRANDS_X}|${LOGISTICS_BRANDS}|${RECRUITER_NOISE})\\b`, "i"),
  music: new RegExp(`\\b(${FASHION_BRANDS}|${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${ENERGY_BRANDS_X}|${LOGISTICS_BRANDS})\\b`, "i"),
  football: new RegExp(`\\b(${FASHION_BRANDS}|${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${LOGISTICS_BRANDS}|${EDUCATION_BRANDS}|${MISC_NON_SPORTS_BRANDS}|${RECRUITER_NOISE}|${ENERGY_BRANDS_X}|${PROFESSIONAL_SERVICES_BRANDS}|${CARS_BRANDS_X})\\b`, "i"),
  gaming: new RegExp(`\\b(${FASHION_BRANDS}|${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${PETS_BRANDS}|${LOGISTICS_BRANDS})\\b`, "i"),
  journalism: new RegExp(`\\b(${FASHION_BRANDS}|${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${PETS_BRANDS})\\b`, "i"),
  beauty: new RegExp(`\\b(${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${BANKS_BRANDS}|${TELCO_BRANDS}|${LOGISTICS_BRANDS})\\b`, "i"),
  beer: new RegExp(`\\b(${FASHION_BRANDS}|${GROCERY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${LOGISTICS_BRANDS}|${PROFESSIONAL_SERVICES_BRANDS}|${RECRUITER_NOISE}|${TRAVEL_TECH_BRANDS}|nala)\\b`, "i"),
  coffee: new RegExp(`\\b(${FASHION_BRANDS}|${GROCERY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${LOGISTICS_BRANDS}|${PROFESSIONAL_SERVICES_BRANDS})\\b`, "i"),
  bakery: new RegExp(`\\b(${FASHION_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${LOGISTICS_BRANDS}|${PROFESSIONAL_SERVICES_BRANDS})\\b`, "i"),
  fashion: new RegExp(`\\b(${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${ENERGY_BRANDS_X}|${LOGISTICS_BRANDS}|${PROFESSIONAL_SERVICES_BRANDS})\\b`, "i"),
  jewellery: new RegExp(`\\b(${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${HEALTH_CARE_BRANDS}|${CARS_BRANDS_X}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${LOGISTICS_BRANDS})\\b`, "i"),
  footwear: new RegExp(`\\b(${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${HEALTH_CARE_BRANDS}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${LOGISTICS_BRANDS}|${RECRUITER_NOISE}|boots|boots uk|boots opticians|boots pharmacy|boots healthcare|tesla|tesla motors|tesla uk|specsavers|vision express|pure gym|puregym|l['']?or[ée]al|lor[ée]al|loreal|lanc[ôo]me|grantley hall|my four wheels|hgv training network|success talent|adjusting appointments|david lloyd)\\b`, "i"),
  influencing: new RegExp(`\\b(${GROCERY_BRANDS}|${HEALTH_CARE_BRANDS}|${ESTATE_AGENCY_BRANDS}|${LOGISTICS_BRANDS}|${PROFESSIONAL_SERVICES_BRANDS})\\b`, "i"),
  "interior-design": new RegExp(`\\b(${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${HEALTH_CARE_BRANDS}|${PETS_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${LOGISTICS_BRANDS}|${PROFESSIONAL_SERVICES_BRANDS})\\b`, "i"),
  "horse-racing": new RegExp(`\\b(${FASHION_BRANDS}|${GROCERY_BRANDS}|${HOSPITALITY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS}|${LOGISTICS_BRANDS})\\b`, "i"),
  "formula-1": new RegExp(`\\b(${FASHION_BRANDS}|${GROCERY_BRANDS}|${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${BANKS_BRANDS}|${TELCO_BRANDS})\\b`, "i"),
  travel: new RegExp(`\\b(${ESTATE_AGENCY_BRANDS}|${HEALTH_CARE_BRANDS}|${PETS_BRANDS}|${LOGISTICS_BRANDS}|${PROFESSIONAL_SERVICES_BRANDS})\\b`, "i"),
};


// Company-name → correct-industry overrides (mirrors Adzuna's COMPANY_INDUSTRY_OVERRIDES).
// If we searched under industry X but recognise the company belongs elsewhere,
// re-route it. Used in addition to the dedicated validate-jobs allow-list.
const REED_COMPANY_INDUSTRY_OVERRIDES: Record<string, string> = {
  "mclaren racing": "formula-1", "mclaren f1": "formula-1", "mclaren formula": "formula-1",
  "mercedes-amg petronas": "formula-1", "mercedes f1": "formula-1",
  "red bull racing": "formula-1", "red bull technology": "formula-1", "oracle red bull": "formula-1",
  "aston martin f1": "formula-1", "aston martin aramco": "formula-1",
  "williams racing": "formula-1", "williams f1": "formula-1", "williams grand prix": "formula-1",
  "alpine f1": "formula-1", "haas f1": "formula-1", "sauber motorsport": "formula-1",
  "formula 1": "formula-1", "formula one": "formula-1", "f1 management": "formula-1",
  "motorsport uk": "formula-1", "silverstone": "formula-1", "fia": "formula-1",
  "ann summers": "fashion",
  "victoria's secret": "fashion",
  "agent provocateur": "fashion",
  "british heart foundation": "charity",
  "save the children": "charity",
  "oxfam": "charity",
  "cancer research": "charity",
  "yodel": "grocery",
  "dpd": "grocery",
  "evri": "grocery",
  "hermes parcel": "grocery",
  "hitachi": "cars",
  "siemens": "cars",
  "saab": "cars",
  "scania": "cars",
  // Automotive OEMs / dealers - always Cars regardless of role title
  "tesla": "cars", "rivian": "cars", "lucid motors": "cars", "polestar": "cars",
  "bmw": "cars", "mercedes-benz": "cars", "mercedes benz": "cars", "audi": "cars",
  "volkswagen": "cars", "porsche": "cars", "ferrari": "cars", "lamborghini": "cars",
  "bentley motors": "cars", "rolls-royce motor": "cars", "aston martin": "cars",
  "mclaren automotive": "cars", "jaguar land rover": "cars", "jlr": "cars",
  "ford motor": "cars", "vauxhall": "cars", "stellantis": "cars", "peugeot": "cars",
  "renault": "cars", "nissan": "cars", "toyota": "cars", "lexus": "cars",
  "honda motor": "cars", "hyundai motor": "cars", "kia uk": "cars", "kia motors": "cars",
  "mazda motors": "cars", "volvo cars": "cars", "byd auto": "cars", "byd uk": "cars",
  "mini uk": "cars", "skoda": "cars", "seat uk": "cars", "cupra": "cars",
  "arnold clark": "cars", "sytner": "cars", "lookers": "cars", "vertu motors": "cars",
  "pendragon": "cars", "marshall motor": "cars", "inchcape": "cars", "jct600": "cars",
  "stoneacre": "cars", "cazoo": "cars", "cinch": "cars", "motorpoint": "cars",
  "carwow": "cars", "auto trader": "cars", "we buy any car": "cars", "webuyanycar": "cars",
};

async function fetchReedJobs(industry: string, keywords: string[], apiKey: string, opts?: { grad?: boolean }) {
  const allJobs: any[] = [];
  const isGradPass = opts?.grad === true;
  // Reed wants Basic auth: base64("apiKey:")
  const auth = btoa(`${apiKey}:`);
  // Use the full curated keyword list for each industry. Previously we capped
  // at 4 (12 for health/wellness/physio) to stay inside Reed's per-minute rate
  // limit, but that left long-tail roles invisible. Reed's quota is generous
  // enough at our cadence to sweep all keywords.
  const searchKeywords = isGradPass ? GRAD_KEYWORDS.slice(0, 5) : keywords;
  const titleBlocklist = REED_TITLE_BLOCKLIST[industry];
  // Reed pagination: 100 per page via resultsToTake. We sweep up to MAX_PAGES
  // pages per keyword (so up to 100 × MAX_PAGES per keyword) and stop early
  // when a page returns < pageSize results (last page reached).
  // Deep-sweep industries have large job pools → more pages per keyword.
  // Standard: 5 pages = up to 500 jobs/keyword. Deep: 12 pages = up to 1,200/keyword.
  const DEEP_SWEEP_INDUSTRIES = new Set([
    "teaching", "health", "wellness", "physiotherapy", "hospitality",
    "charity", "money", "estate-agency", "travel", "cars", "farming",
    "interior-design", "beauty", "fashion", "psychotherapy",
    "music", // added: small pool of specialist jobs warrants deeper keyword sweep
  ]);
  const MAX_PAGES = isGradPass ? 2 : (DEEP_SWEEP_INDUSTRIES.has(industry) ? 12 : 5);
  const PAGE_SIZE = 100;
  for (const kw of searchKeywords) {
    try {
      let pageResults: any[] = [];
      let totalForKw = 0;
      for (let page = 0; page < MAX_PAGES; page++) {
        const skip = page * PAGE_SIZE;
        const url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(kw)}&resultsToTake=${PAGE_SIZE}&resultsToSkip=${skip}&distanceFromLocation=15`;
        const res = await fetch(url, {
          headers: { Authorization: `Basic ${auth}`, "User-Agent": "howdoyoudo-bot/1.0" },
        });
        if (!res.ok) {
          console.error(`Reed error for "${kw}" page ${page}: ${res.status}`);
          break;
        }
        const data = await res.json();
        pageResults = Array.isArray(data?.results) ? data.results : [];
        totalForKw += pageResults.length;
        // Process this page's results (loop body below operates on `results`)
        const results = pageResults;
        console.log(`[${industry}] Reed ${isGradPass ? "GRAD " : ""}"${kw}" p${page}: ${results.length} jobs`);

        for (const r of results) {
        const title = (r.jobTitle || "").trim();
        const company = (r.employerName || "Reed").trim();
        const link = r.jobUrl || "";
        if (!title || !link) continue;

        // 1) Drop polluted titles (e.g. "Children's Residential Support Worker"
        //    matched by Reed for the football "football coach" keyword).
        if (titleBlocklist && titleBlocklist.test(title)) {
          console.log(`[${industry}] Reed BLOCKED title: "${title}" @ ${company}`);
          continue;
        }
        // 1b) Positive-signal gate per industry. Reed does free-text matching
        //     across title+description, so generic keywords ("music", "fashion",
        //     "beauty", "officer") pull in massive amounts of noise from
        //     factory/logistics/legal/HR/care work. We require a real
        //     industry-specific term in the configured haystack.
        //
        //     scope = 'tc'  -> title + company only (description too leaky:
        //                      cinema, coffee, fashion, beauty, jewellery,
        //                      footwear, cars, travel, beer, bakery,
        //                      interior-design, estate-agency, hospitality,
        //                      food-drink, grocery, pets).
        //     scope = 'tcd' -> title + company + description (legitimate
        //                      generic-titled roles need the JD to qualify:
        //                      charity, influencing, music, formula-1,
        //                      horse-racing, gaming, football, journalism,
        //                      wellness, teaching, farming, physiotherapy,
        //                      psychotherapy).
        const REED_INDUSTRY_SIGNALS: Record<string, { rx: RegExp; scope: "tc" | "tcd" }> = {
          music: { scope: "tc", rx: /\b(music|musician|musical|record label|recording studio|sound engineer|live sound|tour manager|touring artist|artist manager|a&r|songwriter|composer|music producer|record producer|dj\b|orchestra|choir|opera house|operatic|conductor|spotify|apple music|tidal|deezer|warner music|universal music|sony music|bmg|live nation|aeg|o2 academy|royal albert hall|barbican|glastonbury|coachella|reading festival|musictech|music week|music business|music publishing|music licensing|music supervisor|music streaming|sync licensing|playlist editor|audio engineer|mastering engineer|mixing engineer|foh engineer|monitor engineer|stagehand|roadie|backline|music marketing|music pr|music agent|booking agent|talent buyer|music journalist|music critic|music photographer|music video|music teacher|music education|music therapy|music therapist)\b/i },
          "formula-1": { scope: "tcd", rx: /\b(formula\s?1|formula one|\bf1\b|grand prix|motorsport|motor sport|race engineer|race operations|trackside|paddock|aerodynamic|cfd|wind tunnel|vehicle dynamics|simulation engineer|performance engineer|strategy engineer|telemetry|composite|laminator|carbon fibre|motorsport logistics|racing team|mclaren racing|mercedes-amg petronas|red bull racing|aston martin f1|williams racing|alpine f1|haas f1|silverstone|motorsport uk|fia)\b/i },
          "horse-racing": { scope: "tcd", rx: /\b(horse[- ]?rac(?:e|ing)|horseracing|racehorse|race ?horse|racecourse|race.?course|race.?day|equine|equestrian|thoroughbred|jockey|stable[s]?\b|stable lad|stable lass|stable hand|head lad|head girl|head lass|work rider|exercise rider|travelling head|yard manager|racing yard|stud farm|stud manager|stud groom|bloodstock|farrier|paddock|turf club|BHA|British Horseracing|gallops|point.to.point|riding school|riding instructor|racecourse manager|clerk of the course|trainer['']?s assistant|assistant trainer|jockey club|newmarket|epsom|cheltenham|ascot|aintree|doncaster racecourse|kempton|sandown|goodwood|york races|weatherbys|godolphin|coolmore|juddmonte|shadwell|cheveley park|darley|careers in racing|yard and groom)\b/i },
          cinema: { scope: "tc", rx: /\b(film|movie|cinema|television|tv production|broadcast|production company|post.production|vfx|visual effects|animation studio|animator|screenwriter|screenplay|cinematograph|camera operator|dop\b|director of photography|gaffer|grip\b|focus puller|clapper loader|steadicam|colourist|colorist|foley|adr\b|dubbing|netflix|bbc studios|itv\b|channel ?4|sky studios|paramount|disney|warner bros|sony pictures|universal pictures|lionsgate|studiocanal|working title|aardman|pinewood|shepperton|elstree|framestore|dneg|the mill|molinare|goldcrest|technicolor|deluxe|bafta|bfi\b|documentary|docuseries|showrunner|commissioning editor|development producer|location manager|art director|set design|costume design|video editor|videographer|cinematographer|projectionist|everyman cinema|odeon|cineworld|vue cinemas|picturehouse)\b/i },
          gaming: { scope: "tcd", rx: /\b(game[s]?\b|gaming|video game|esport|e-sport|twitch|unity|unreal engine|playstation|xbox|nintendo|steam|level design|qa tester|gameplay|3d artist|concept art|narrative design|game design|game developer|game programmer|game engine|multiplayer|metaverse|vr game|ar game|mobile game|indie game|aaa\b|triple.a|ubisoft|ea games|electronic arts|riot games|epic games|rockstar|frontier developments|jagex|sumo digital|playground games|creative assembly|rebellion|team17|codemasters|sega|capcom|square enix|bethesda|bungie|blizzard|activision|valve|mojang|king|supercell|cd projekt|naughty dog|insomniac|double fine|rare|505 games|devolver|raw fury|roblox|fortnite|minecraft|call of duty|fifa\b|madden|nba 2k|gta\b|grand theft auto|world of warcraft|league of legends|dota|counter.strike|apex legends|overwatch|destiny|halo|pokemon|zelda|mario|sonic|tomb raider|hitman|racing game|simulation game|strategy game|rpg|mmo|fps|moba|roguelike|pixel art|sprite|shader|procedural generation|game jam|ludum dare|bafta games|game awards)\b/i },
          coffee: { scope: "tc", rx: /\b(coffee|barista|caf[eé]\b|caff[èe]|espresso|roastery|roaster|coffee shop|coffee house|q grader|costa\b|starbucks|pret\b|caff[èe] nero|gail['']?s|blank street|black sheep coffee|joe & the juice|ole & steen|tim hortons|dunkin|nero group|cafenero)\b/i },
          influencing: { scope: "tc", rx: /\b(influencer|content creator|creator economy|influencer marketing|brand ambassador|ugc|user.generated|talent management|talent agent|paid social|organic social|social.first|digital creator|brand partnership|brand collaboration|creator fund|patreon|substack|onlyfans|twitch|linkedin creator|tiktok|instagram|youtube|podcast|social media manager|social media executive|social media coordinator|head of social|community manager)\b/i },
          charity: { scope: "tc", rx: /\b(charity|charities|fundrais(?:er|ing)|non[- ]?profit|not[- ]for[- ]?profit|third sector|voluntary sector|ngo\b|trustee|trusts and foundation|grant[- ]?making|grant[- ]?maker|major (?:donor|gift)|individual giving|legacy giving|donor (?:care|engagement|relations|development)|corporate partnership|community fundrais|philanthrop|cic\b|social enterprise|appeal manager|volunteer (?:coordinator|manager|engagement)|cause[- ]?led|mission[- ]?led|registered charity)\b/i },
          beauty: { scope: "tc", rx: /\b(beauty (?:therapist|advisor|consultant|counter|manager|expert|assistant|specialist|trainer|salon|brand)|beautician|aesthetician|aesthetic (?:nurse|practitioner|clinic)|hair (?:stylist|salon|colour|colourist|technician|extension)|hairdress(?:er|ing)|barber(?:ing|shop)?|makeup (?:artist|consultant|advisor)|mua\b|nail (?:technician|artist|bar)|manicur|pedicur|lash (?:tech|artist|technician)|brow (?:artist|technician|bar)|salon manager|spa (?:manager|therapist|host)|skincare|skin (?:therapist|specialist|expert)|cosmetic(?:s)? (?:buyer|brand|counter|advisor|consultant|trainer|merchandiser|developer|chemist|formulator|product|category)|fragrance (?:advisor|consultant|buyer|counter)|haircare|perfumer|sephora|space ?nk|charlotte tilbury|the body shop|l['']?or[eé]al|est[eé]e lauder|m\.?a\.?c\.? cosmetics|benefit cosmetics|bobbi brown|clinique|nars|rituals|lush\b|elemis|liz earle|trinny london|huda beauty|drunk elephant|glossier|fenty beauty|bare ?minerals|illamasqua|morphe|too faced|urban decay|sally beauty|cult beauty|lookfantastic|feel ?unique|boots no7|no7\b)\b/i },
          fashion: { scope: "tc", rx: /\b(fashion|apparel|clothing|garment|knitwear|womensw?ear|menswear|childrensw?ear|kidsw?ear|loungewear|swimwear|activewear|denim|tailoring|haute couture|ready[- ]to[- ]wear|rtw\b|atelier|garment (?:technologist|technician|tech)|textile (?:designer|technologist|buyer)|pattern (?:cutter|maker|grader)|fabric (?:buyer|sourcing|technologist)|trend forecaster|visual merchandiser|asos\b|boohoo|prettylittlething|missguided|shein|net[- ]a[- ]porter|matchesfashion|farfetch|ssense|browns fashion|selfridges|harrods|harvey nichols|liberty london|primark|h&m|zara\b|inditex|uniqlo|cos\b|& other stories|reiss\b|whistles|hobbs|jigsaw|me\\+em|kurt geiger|all ?saints|ted baker|paul smith|burberry|alexander mcqueen|stella mccartney|mulberry|barbour|belstaff|joules|fat face|white stuff|monsoon|accessorize|river island|new look|topshop|topman|urban outfitters|anthropologie|free people|gym ?shark|castore|sweaty betty|lululemon|nobody['']?s child|rixo\b|nadine merabi|self portrait|ganni|jacquemus|loewe\b|chanel\b|dior\b|prada\b|gucci\b|louis vuitton|lvmh|kering|hermes|hermès|fendi\b|valentino|saint laurent|ysl\b|givenchy|balmain|moncler|moschino|versace|armani)\b/i },
          // Football: scope=tc (description matching was leaking sports/championship/FC into
          // unrelated industries). Tokens must be football-specific OR a known UK club/body.
          football: { scope: "tc", rx: /\b(football|soccer|premier league|premiership football|fa cup|uefa|fifa\b|football club|\bfc\b|football academy|football coach|football scout|football analyst|football administration|football association|english football league|sky sports|tnt sports|bt sport|talksport|the athletic|professional footballers|\bpfa\b|league managers association|football foundation|brighton & hove albion|brighton and hove albion|manchester united|manchester city|liverpool fc|arsenal fc|chelsea fc|tottenham|spurs\b|west ham|newcastle united|aston villa|crystal palace|everton fc|fulham fc|brentford fc|leeds united|leicester city|nottingham forest|wolverhampton wanderers|wolves fc|sheffield united|sheffield wednesday|burnley fc|cardiff city|swansea city|sunderland afc|norwich city|southampton fc|coventry city|preston north end|hull city|middlesbrough fc|millwall fc|\bqpr\b|queens park rangers|reading fc|stoke city|watford fc|\bwba\b|west bromwich|bournemouth fc|afc bournemouth)\b/i },
          journalism: { scope: "tc", rx: /\b(journalist|reporter|newsroom|news editor|sub.?editor|copy editor|feature writer|investigative journalist|broadcast journalist|press officer|nctj|digital journalist|news producer|editorial assistant|magazine editor|staff writer|columnist|correspondent|wire service|news agency|bbc news|sky news|itn|guardian|telegraph|times newspaper|daily mail|financial times|economist|reuters|bloomberg|associated press|pa media|press association|reach plc|news uk)\b/i },
          wellness: { scope: "tc", rx: /\b(personal trainer|fitness instructor|fitness coach|wellness coach|wellbeing coach|nutritionist|dietitian|nutrition coach|yoga (?:instructor|teacher)|pilates (?:instructor|teacher)|spa (?:manager|therapist|host)|spa receptionist|massage therapist|sports therapist|holistic therapist|meditation|mindfulness|breathwork|reformer pilates|barre instructor|class instructor|group exercise|exercise referral|health coach|life coach|wellness centre|wellness retreat|sweaty betty|lululemon|gymshark|barry['']?s|psycle|third space|equinox|david lloyd|virgin active|nuffield health|pure gym|the gym group|fitness first|f45|orangetheory|peloton|les mills)\b/i },
          teaching: { scope: "tc", rx: /\b(teacher|teaching assistant|nursery (?:nurse|practitioner|teacher)|early years|eyfs|primary teacher|secondary teacher|sen (?:teacher|coordinator|teaching)|send teacher|head ?teacher|deputy head|assistant head|cover supervisor|learning support|\blsa\b|\bhlta\b|exam invigilator|sixth form|college lecturer|fe lecturer|further education lecturer|higher education lecturer|university lecturer|tefl|esol tutor|private tutor|education recruitment|\bqts\b|teach first|now teach)\b/i },
          farming: { scope: "tc", rx: /\b(farm|farmer|farming|agriculture|agricultur|agronomist|agronomy|crop|arable|livestock|dairy farm|cattle|sheep farm|pig farm|poultry|herd manager|herdsperson|shepherd|tractor driver|combine|silage|nfu\b|red tractor|leaf marque|agri.?food|agtech|agri.?business|farm shop|farm manager|farm assistant|stockperson|stock person|animal husbandry|land manager rural|estate manager rural)\b/i },
          physiotherapy: { scope: "tcd", rx: /\b(physiotherapist|physio\b|physiotherapy|\bmsk\b|musculoskeletal|sports physio|neuro physio|paediatric physio|rehabilitation|rehab assistant|osteopath|chiropractor|sports therapist|hcpc registered|csp\b|chartered society of physiotherapy|nordic walking|movement therapist|exercise therapist|hydrotherapy|electrotherapy|manual therapy|outpatient physio|inpatient physio|community physio)\b/i },
          psychotherapy: { scope: "tcd", rx: /\b(psychotherapist|psychotherapy|counsellor|counselling|therapist|\bcbt\b|talking therap|iapt\b|psychological wellbeing practitioner|\bpwp\b|high intensity therapist|hit\b|child psychotherapist|family therapist|clinical psychologist|counselling psychologist|forensic psychologist|systemic psychotherapy|integrative therapist|person.?centred|psychodynamic|bacp\b|ukcp\b|hcpc\b|nice guidelines|mental health practitioner|emotional wellbeing)\b/i },
          hospitality: { scope: "tc", rx: /\b(restaurant|hotel|pub\b|bar manager|bar staff|bartender|waiter|waitress|server|front of house|\bfoh\b|back of house|\bboh\b|chef|sous chef|head chef|chef de partie|commis chef|kitchen porter|hospitality manager|f&b manager|food and beverage|concierge|hotel receptionist|housekeeping|housekeeper|room attendant|guest services|sommelier|mixologist|venue manager|events manager|banqueting|gastropub|fine dining|michelin|aa rosette|hilton|marriott|ihg\b|premier inn|travelodge|whitbread|mitchells & butlers|wagamama|nando['']?s|pizza express|prezzo|bill['']?s|côte\b|cote restaurant|five guys|leon\b|wahaca|honest burger|dishoom|hawksmoor|gaucho|hakkasan|soho house)\b/i },
          "food-drink": { scope: "tc", rx: /\b(food|drink|beverage|\bf&b\b|fmcg|food manufacturing|food production|food technologist|food scientist|product developer food|nutritionist food|recipe development|chef|restaurant|kitchen|bar|brewery|distillery|winery|food retail|deli|delicatessen|farm shop|street food|catering|caterer|food service|contract catering|compass group|sodexo|aramark|elior|baxterstorey|cygnet|harrison|bidfood|brakes|booker|fresh produce|food hall|borough market|fortnum|harrods food|m&s food|waitrose food|ocado retail)\b/i },
          beer: { scope: "tc", rx: /\b(beer|brew(?:er|ery|ing)|cask ale|craft beer|real ale|ipa\b|lager|stout|cider|publican|landlord|landlady|pub manager|pub assistant|pub team|cellar (?:manager|technician|person)|drayman|cellarperson|barback|head brewer|assistant brewer|brewing technician|brewery (?:manager|operative|tour|shop)|taproom|microbrewery|guinness|heineken|carlsberg|molson coors|asahi|budweiser|stella artois|bavaria|brewdog|camden town brewery|fuller['?]?s|greene king|marston['?]?s|wetherspoon|wetherspoons|jd wetherspoon|young['?]?s pubs|samuel smith|st austell|adnams|theakston|timothy taylor|thornbridge|northern monk|beavertown|tiny rebel|verdant|cloudwater|magic rock|five points brewery|kernel brewery|gypsy hill)\b/i },
          travel: { scope: "tc", rx: /\b(travel|tour operator|tour guide|travel agent|travel consultant|reservations agent|holiday consultant|destination management|cruise|holiday|airline|cabin crew|flight attendant|pilot|airport (?:ground|operations|services)|ground handling|baggage handler|aviation|tui\b|jet2|easyjet|ryanair|british airways|virgin atlantic|emirates|qatar airways|wizz air|loganair|trailfinders|kuoni|hayes & jarvis|abercrombie & kent|audley travel|expedia|booking\.com|airbnb|on the beach|hotels\.com|loveholidays|secret escapes|skyscanner|kayak|lastminute|abta|atol|iata|thomas cook|jet2holidays)\b/i },
          cars: { scope: "tc", rx: /\b(car sales|car salesperson|car sales executive|sales executive automotive|automotive sales|vehicle technician|motor vehicle|mot tester|service advisor automotive|service technician automotive|parts advisor|workshop controller|aftersales|car dealership|dealer principal|motor trade|dealership|car valeter|panel beater|paint sprayer|bodyshop|coach builder|trim technician|fleet manager|fleet sales|leasing consultant|automotive engineer|powertrain|ev charging|electric vehicle|sytner|arnold clark|lookers|inchcape|pendragon|stratstone|jardine motors|jct600|listers|vertu motors|bristol street motors|carwow|auto trader|cazoo|cinch|carshop|we buy any car|webuyanycar|hpi|aa cars|bca\b|manheim|copart|bmw|audi|mercedes.benz|volkswagen|jaguar|land rover|jlr\b|ford|vauxhall|toyota|honda|nissan|porsche|tesla|peugeot|renault|kia\b|hyundai|skoda|seat|volvo|mini\b|fiat\b|alfa romeo|maserati|bentley|rolls.royce|aston martin|mclaren automotive|lotus cars|stellantis)\b/i },
          jewellery: { scope: "tc", rx: /\b(jewellery|jeweller|jeweler|jewelry|goldsmith|silversmith|gemmologist|gemologist|diamond (?:grader|setter|expert|specialist)|stone setter|bench jeweller|watchmaker|watch technician|jewellery (?:designer|sales|consultant|retail|valuer|polisher|specialist|advisor)|fine jewellery|fashion jewellery|hatton garden|pragnell|boodles|graff|chopard|cartier|tiffany|bulgari|van cleef|harry winston|chaumet|piaget|david morris|garrard|asprey|theo fennell|monica vinader|astley clarke|missoma|missuma|maria tash|alex monroe|stephen webster|annoushka|shaun leane|fope\b|messika|bvlgari|swatch group|richemont|kering jewellery|the watches of switzerland|goldsmiths|ernest jones|h\.?samuel|beaverbrooks)\b/i },
          footwear: { scope: "tc", rx: /\b(footwear|shoe[s]?\b|sneaker|trainer footwear|boots footwear|sandal|sole|last (?:maker|technician)|cobbler|shoe (?:designer|buyer|merchandiser|technologist|production|developer|retail|store|brand|warehouse|sales)|footwear (?:designer|buyer|merchandiser|technologist|developer|production|supply chain|retail|warehouse|sales|brand)|trainer (?:designer|retail|store)|nike\b|adidas\b|reebok|puma|new balance|asics|under armour|hoka|on running|on cloud|salomon|brooks running|saucony|allbirds|veja|dr\.? martens|dr ?marten|drmartens|clarks\b|timberland|birkenstock|ugg\b|hunter boots|aldo\b|kurt geiger footwear|office shoes|schuh|foot ?locker|jd sports|jd group|sports direct|skechers|crocs\b|teva\b|merrell|vans\b|converse|fitflop|grenson|loake|church['']?s|cheaney|john lobb|edward green)\b/i },
          bakery: { scope: "tc", rx: /\b(bakery|baker|bakers|baking|pastry chef|pâtissier|patissier|pastry cook|bread maker|breadmaker|viennoiserie|patisserie|chocolatier|bakery (?:manager|assistant|production|operative|sales|counter|technician|developer)|head baker|production baker|night baker|hot cross|sourdough|artisan bread|greggs|gail['']?s|paul bakery|le pain quotidien|pret a manger|pret\b|warburtons|hovis|kingsmill|allied bakeries|finsbury food|st pierre|jus.rol|bidfood bakery|cinnabon|krispy kreme|dominique ansel|fortitude bakery|princi)\b/i },
          "interior-design": { scope: "tc", rx: /\b(interior (?:designer|architect|stylist|decorator|consultant|design assistant|design intern)|interior design (?:studio|practice|firm)|ff&e (?:designer|consultant|coordinator)|furniture designer|furniture buyer|showroom (?:manager|consultant|assistant) interiors|kitchen designer|bathroom designer|cad designer interiors|3d visualiser|interior architecture|residential interiors|hospitality interiors|commercial interiors|homeware buyer|home accessories|soft furnishings|lighting designer interiors|wallcoverings|fabric designer|tom dixon|kelly hoppen|soho house design|martin brudnizki|david collins studio|conran|heal['']?s|john lewis home|west elm|made\.com|loaf\.com|swoon|dunelm|the white company|cox & cox|graham & green|oka\b|neptune|sofa\.com|habitat|dwell\b)\b/i },
          "estate-agency": { scope: "tc", rx: /\b(estate agent|lettings (?:agent|negotiator|consultant|manager)|sales negotiator|property (?:manager|consultant|valuer|coordinator|administrator)|surveyor|rics\b|mortgage (?:adviser|advisor|consultant|broker)|conveyanc(?:er|ing)|block manager|branch manager estate|new homes (?:consultant|sales|negotiator)|land (?:buyer|acquisition|negotiator)|haart|foxtons|savills|knight frank|jll\b|cbre\b|hamptons|chestertons|winkworth|kfh\b|kinleigh folkard|dexters|marsh & parsons|john d wood|douglas & gordon|barnard marcus|ludlowthompson|james pendleton|bairstow eves|connells|countrywide|william h brown|spencers estate|jackson stops|fine & country|leaders roman|leaders limited|martin & co|northwood|belvoir|reeds rains|your move|rightmove|zoopla|onthemarket|purple ?bricks|yopa|housesimple)\b/i },
          grocery: { scope: "tc", rx: /\b(grocery|supermarket|convenience store|grocer|grocer['']?s|fresh produce|tesco|sainsbury|asda|morrisons|waitrose|ocado|m&s food|marks ?& ?spencer food|aldi\b|lidl\b|iceland foods|co.?op food|booths\b|whole foods|wholefoods|amazon fresh|gopuff|getir|uber grocery|deliveroo grocery|booker wholesale|costco|spar\b|nisa\b|premier stores|londis|budgens|one stop)\b/i },
          pets: { scope: "tc", rx: /\b(pet[s]? (?:care|food|industry|retail|store|advisor|consultant|specialist|nutritionist|behaviourist|sitter|walker)|dog (?:walker|trainer|groomer|behaviourist|breeder|sitter|day ?care|boarding)|cat (?:groomer|behaviourist|breeder|sitter|hotel)|cattery|kennels?\b|kennel (?:assistant|manager)|veterinary (?:nurse|surgeon|practice|hospital|receptionist|technician|assistant)|\brvn\b|vet nurse|vet surgeon|pet shop|aquatics|equine vet|pets at home|pdsa\b|rspca|blue cross|battersea|dogs trust|wood green|cats protection|jollyes|just for pets|fetch\.co\.uk|tails\.com|butternut box|lily['']?s kitchen|forthglade|burns pet|royal canin)\b/i },
        };

        const sig = REED_INDUSTRY_SIGNALS[industry];
        if (sig) {
          const haystack = sig.scope === "tc"
            ? `${title}\n${company}`
            : `${title}\n${company}\n${(r.jobDescription || "")}`;
          if (!sig.rx.test(haystack)) {
            console.log(`[${industry}] Reed NO SIGNAL: "${title}" @ ${company}`);
            continue;
          }
        }

        // 1c) Description-level exclusions for industries where title-only filtering
        //     isn't enough. E.g. cars: Reed keyword "car" matches any job whose
        //     description mentions "car allowance" or "-driven" as a perk — these
        //     are non-automotive sales/logistics roles that squeezed through the
        //     positive-signal gate via a brand name in the company field.
        const REED_DESC_EXCLUDE: Partial<Record<string, RegExp>> = {
          cars: /\b(car allowance|company car benefit|car allowance included|car allowance provided|target.?driven|results.?driven|sales.?driven|performance.?driven|commercially.?driven|data.?driven|insight.?driven|detail.?driven|customer.?driven|driven individual|driven professional|\btransport\b|transport manager|transport director|transport supervisor|hgv driver|lgv driver|class 1 driver|class 2 driver|delivery driver|van driver|courier|logistics manager|logistics coordinator|freight manager|freight coordinator|haulage|warehouse operative|forklift)\b/i,
        };
        const descExclude = REED_DESC_EXCLUDE[industry];
        if (descExclude) {
          const desc0 = (r.jobDescription || "").replace(/<[^>]*>/g, "");
          if (descExclude.test(`${title}\n${desc0}`)) {
            console.log(`[${industry}] Reed BLOCKED desc-exclude: "${title}" @ ${company}`);
            continue;
          }
        }

        // 2) Drop generic recruiters that spam every keyword.
        //    EXCEPTION: nurse-specialist agencies (Sanctuary Personnel, Service
        //    Care Solutions) are legitimate, dominant nurse employers in the
        //    UK - keep them when we're searching health/wellness/physiotherapy.
        const isHealthLike = industry === "health" || industry === "wellness" || industry === "physiotherapy";
        const NURSE_AGENCY_RX = /\b(sanctuary personnel|service care solutions|nurseplus|cura recruitment)\b/i;
        const isAllowedNurseAgency = isHealthLike && NURSE_AGENCY_RX.test(company);
        if (REED_BANNED_COMPANIES.test(company) && !isAllowedNurseAgency) {
          console.log(`[${industry}] Reed BLOCKED recruiter: "${title}" @ ${company}`);
          continue;
        }
        // 3) Drop government / public-sector employers from consumer feeds.
        //    (Mirrors Adzuna GOV_FILTER.) Health/wellness/physiotherapy use a
        //    relaxed filter that retains NHS Trusts.
        const reedGovFilter = (industry === "health" || industry === "wellness" || industry === "physiotherapy")
          ? REED_GOV_FILTER_HEALTH
          : REED_GOV_FILTER;
        if (reedGovFilter.test(company)) {
          console.log(`[${industry}] Reed BLOCKED gov employer: "${title}" @ ${company}`);
          continue;
        }

        // 3b) Cross-industry brand blocklist (Uniqlo, Gail's, Tesco etc. in cinema)
        const reedCrossBrandBlock = CROSS_INDUSTRY_BRAND_BLOCKLIST[industry];
        if (reedCrossBrandBlock && reedCrossBrandBlock.test(company)) {
          console.log(`[${industry}] Reed BLOCKED cross-industry brand: "${title}" @ ${company}`);
          continue;
        }

        // 4) Company → correct-industry override (mirrors Adzuna).
        //    Re-route well-known brands to where they actually belong instead
        //    of leaving them under the searched industry.
        let assignedIndustry = industry;
        const companyLower = company.toLowerCase();
        for (const [key, correctIndustry] of Object.entries(REED_COMPANY_INDUSTRY_OVERRIDES)) {
          if (companyLower.includes(key)) {
            if (correctIndustry !== industry) {
              console.log(`[${industry}] Reed reassigning "${company}" → ${correctIndustry}`);
              assignedIndustry = correctIndustry;
            }
            break;
          }
        }

        // Reed exposes part-time / contract / temp flags
        const reedMaxSalary = typeof r.maximumSalary === "number" ? r.maximumSalary : null;
        const treatAsGrad = isGradPass && looksLikeRealGradJob(title, reedMaxSalary);
        let jobType = "Full-time";
        if (treatAsGrad) jobType = "Internship";
        else if (r.partTime) jobType = "Part-time";
        else if (r.contractType === "Contract") jobType = "Contract";
        else if (r.contractType === "Temporary") jobType = "Temporary";
        else if (r.fullTime === false && r.partTime === false) jobType = "Temporary";

        // Build salary string when available
        let salary: string | null = null;
        if (r.minimumSalary && r.maximumSalary) {
          salary = `£${Math.round(r.minimumSalary)} - £${Math.round(r.maximumSalary)}`;
        } else if (r.minimumSalary) {
          salary = `£${Math.round(r.minimumSalary)}`;
        }

        const desc = (r.jobDescription || "").replace(/<[^>]*>/g, "").trim();
        const { stage, roleCategory } = classifyJob(title, desc, assignedIndustry);
        // Reed serves dates as "DD/MM/YYYY" - Date() can't parse that.
        let pubDate: Date;
        if (typeof r.date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(r.date)) {
          const [d, m, y] = r.date.split("/").map(Number);
          pubDate = new Date(Date.UTC(y, m - 1, d));
        } else {
          const parsed = r.date ? new Date(r.date) : new Date();
          pubDate = isNaN(parsed.getTime()) ? new Date() : parsed;
        }
        const expiresAt = new Date(pubDate.getTime() + 60 * 86400000).toISOString();

        // 5) Append a stable Reed dedup ID to the description (mirrors adref).
        const reedId = r.jobId ? `\n\n[reed:${r.jobId}]` : "";
        const baseDescription = desc.slice(0, 1900);

        // 6) Flag for AI re-check when our company override re-routed the
        //    industry - mirrors Adzuna's category-conflict path.
        const needsReview = assignedIndustry !== industry || undefined;

        const tagSet: string[] = [];
        if (treatAsGrad) tagSet.push("Graduate", "Internship");

        allJobs.push({
          title: title.slice(0, 255),
          company: company.slice(0, 200),
          industry: assignedIndustry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: (r.locationName || null)?.slice(0, 200) ?? null,
          type: jobType,
          salary,
          description: (baseDescription + reedId) || null,
          url: link,
          source_url: "reed.co.uk",
          expires_at: expiresAt,
          needs_review: needsReview,
          career_level: treatAsGrad ? "entry" : undefined,
          tags: tagSet.length > 0 ? tagSet : undefined,
        });
      }
        // End of per-page result processing. Stop early if last page.
        if (pageResults.length < PAGE_SIZE) break;
      }
      console.log(`[${industry}] Reed ${isGradPass ? "GRAD " : ""}"${kw}" total: ${totalForKw} jobs`);
    } catch (err) {
      console.error(`Reed fetch error for "${kw}":`, err);
    }
  }
  return allJobs;
}

// ── The Muse API ────────────────────────────────────────────────────
// Free, no key needed. Strong on grad / entry-level / culture-led roles.
// We filter to UK + Remote and map each industry to Muse "category" tags.
const MUSE_CATEGORY_MAP: Record<string, string[]> = {
  fashion: ["Design and UX", "Marketing"],
  beauty: ["Marketing", "Retail"],
  cinema: ["Creative", "Editorial"],
  music: ["Creative", "Marketing"],
  gaming: ["Software Engineering", "Design and UX"],
  journalism: ["Editorial", "Creative"],
  charity: ["Social Services", "Project Management"],
  teaching: ["Education"],
  hospitality: ["Retail", "Project Management"],
  "food-drink": ["Retail", "Project Management"],
  travel: ["Customer Service", "Project Management"],
  pets: ["Animal Care", "Retail"],
  remote: ["Software Engineering", "Marketing", "Design and UX", "Customer Service"],
};

async function fetchMuseJobs(industry: string) {
  const cats = MUSE_CATEGORY_MAP[industry];
  if (!cats || cats.length === 0) return [];
  const allJobs: any[] = [];
  for (const cat of cats) {
    try {
      // location filter accepts "United Kingdom" + "Flexible / Remote"
      const url = `https://www.themuse.com/api/public/jobs?category=${encodeURIComponent(cat)}&location=${encodeURIComponent("United Kingdom")}&page=0&descending=true`;
      const res = await fetch(url, { headers: { "User-Agent": "howdoyoudo-bot/1.0" } });
      if (!res.ok) {
        console.error(`Muse error for "${cat}": ${res.status}`);
        continue;
      }
      const data = await res.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      console.log(`[${industry}] Muse "${cat}": ${results.length} items`);

      for (const r of results) {
        const title = (r.name || "").trim();
        const company = (r.company?.name || "The Muse").trim();
        const link = r.refs?.landing_page || "";
        if (!title || !link) continue;

        const desc = (r.contents || "").replace(/<[^>]*>/g, "").trim();
        const locArr: string[] = Array.isArray(r.locations)
          ? r.locations.map((l: any) => (l.name || "").trim()).filter(Boolean)
          : [];
        const locationStr = locArr.length > 0 ? locArr.join(", ") : null;

        // Strict UK gate: require at least one location to be UK or pure Remote.
        // Drops multi-location postings that include US/India alongside UK shells.
        const UK_RE = /\b(United Kingdom|UK|England|Scotland|Wales|Northern Ireland|London|Manchester|Birmingham|Leeds|Bristol|Edinburgh|Glasgow|Cardiff|Belfast)\b/i;
        const NON_UK_RE = /\b(USA|United States|, [A-Z]{2}\b|India|Bangalore|Mumbai|Delhi|Singapore|Sydney|Toronto|Berlin|Paris|Amsterdam|Dublin|Madrid|Tokyo|Hong Kong|Mexico|Brazil|Canada|Australia|Germany|France|Spain|Italy|Netherlands|Ireland|Japan|China|Philippines|Poland|Romania|Argentina|Chile|Colombia|San Francisco|New York|Boston|Seattle|Austin|Chicago|Denver|Atlanta|Mountain View|Sunnyvale|Cupertino|Palo Alto|Santa Monica|Indianapolis|Portsmouth, NH|Warren, MI)\b/i;
        const hasUk = locArr.some((l) => UK_RE.test(l));
        const hasNonUk = locArr.some((l) => NON_UK_RE.test(l));
        const isRemoteOnly = locArr.length === 1 && /Flexible \/ Remote/i.test(locArr[0]);
        if (!hasUk && !isRemoteOnly) continue;
        if (hasNonUk && !hasUk) continue;

        // Muse "levels" → our type
        const levels = Array.isArray(r.levels) ? r.levels.map((l: any) => (l.name || "").toLowerCase()) : [];
        let jobType = "Full-time";
        if (levels.some((l: string) => l.includes("intern"))) jobType = "Internship";
        else if (levels.some((l: string) => l.includes("entry"))) jobType = "Full-time";

        const { stage, roleCategory } = classifyJob(title, desc, industry);
        const pubDate = r.publication_date ? new Date(r.publication_date) : new Date();
        const expiresAt = new Date(pubDate.getTime() + 60 * 86400000).toISOString();

        allJobs.push({
          title: title.slice(0, 255),
          company: company.slice(0, 200),
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: locationStr?.slice(0, 200) ?? null,
          type: jobType,
          salary: null,
          description: desc.slice(0, 2000) || null,
          url: link,
          source_url: "themuse.com",
          expires_at: expiresAt,
        });
      }
    } catch (err) {
      console.error(`Muse fetch error for "${cat}":`, err);
    }
  }
  return allJobs;
}

// ── NHS Jobs (jobs.nhs.uk) ──────────────────────────────────────────
// Direct scrape of the official NHS Jobs candidate site. The site has
// no public RSS/JSON feed but the search results page is plain HTML
// when called with a real browser User-Agent. We parse a handful of
// pages per keyword to surface clinical roles (nurse, midwife, HCA,
// AHP) that aggregators like Adzuna/Reed under-index.
const NHS_JOBS_KEYWORDS_HEALTH = [
  "registered nurse",
  "staff nurse",
  "midwife",
  "healthcare assistant",
  "mental health nurse",
  "district nurse",
  "paramedic",
  "physiotherapist",
  "occupational therapist",
];
const NHS_BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function parseNhsJobsHtml(html: string, keyword: string): any[] {
  const out: any[] = [];
  const liRx = /<li[^>]*data-test="search-result"[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = liRx.exec(html)) !== null) {
    const block = m[1];
    const linkMatch = block.match(
      /href="(\/candidate\/jobadvert\/[A-Z0-9-]+)[^"]*"[^>]*data-test="search-result-job-title"[^>]*>\s*([^<]+?)\s*<\/a>/i,
    );
    if (!linkMatch) continue;
    const path = linkMatch[1];
    const title = linkMatch[2].replace(/\s+/g, " ").trim();
    if (!title) continue;

    const locBlock = block.match(/data-test="search-result-location"[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/i);
    let employer = "NHS";
    let location: string | null = null;
    if (locBlock) {
      const inner = locBlock[1];
      const empMatch = inner.match(/^\s*([^<\n]+?)\s*<div/);
      if (empMatch) employer = empMatch[1].replace(/\s+/g, " ").trim() || "NHS";
      const locMatch = inner.match(/<div class="location-font-size">\s*([\s\S]*?)\s*<\/div>/);
      if (locMatch) location = locMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || null;
    }

    const salaryMatch = block.match(/data-test="search-result-salary"[\s\S]*?<strong[^>]*>([\s\S]*?)<\/strong>/i);
    const salary = salaryMatch
      ? salaryMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : null;

    const url = path.startsWith("http") ? path : `https://www.jobs.nhs.uk${path.startsWith("/") ? path : "/" + path}`;
    out.push({
      title: title.slice(0, 255),
      company: employer.slice(0, 200),
      industry: "health",
      value_chain_stage: null,
      role_category: null,
      location: (location || "United Kingdom").slice(0, 200),
      type: "Full-time",
      work_mode: "On-site",
      salary,
      description: `NHS clinical role sourced via NHS Jobs. Search keyword: "${keyword}".`,
      url,
      source_url: "jobs.nhs.uk",
      tags: ["NHS"],
    });
  }
  return out;
}

async function fetchNhsJobs(industry: string): Promise<any[]> {
  if (industry !== "health") return [];
  const allJobs: any[] = [];
  const seen = new Set<string>();

  for (const kw of NHS_JOBS_KEYWORDS_HEALTH) {
    for (let page = 1; page <= 3; page++) {
      try {
        const url = `https://www.jobs.nhs.uk/candidate/search/results?keyword=${encodeURIComponent(kw)}&page=${page}`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": NHS_BROWSER_UA,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-GB,en;q=0.9",
          },
        });
        if (!res.ok) {
          console.warn(`[health] NHS Jobs "${kw}" p${page}: HTTP ${res.status}`);
          break;
        }
        const html = await res.text();
        const parsed = parseNhsJobsHtml(html, kw);
        if (parsed.length === 0) break;

        let added = 0;
        for (const j of parsed) {
          if (seen.has(j.url)) continue;
          seen.add(j.url);
          allJobs.push(j);
          added++;
        }
        console.log(`[health] NHS Jobs "${kw}" p${page}: ${parsed.length} parsed, +${added} new`);
        await new Promise((r) => setTimeout(r, 250));
      } catch (err) {
        console.error(`[health] NHS Jobs error "${kw}" p${page}:`, err);
        break;
      }
    }
  }
  console.log(`[health] NHS Jobs total: ${allJobs.length} unique roles`);
  return allJobs;
}

// ── NHS Jobs RSS (HealthJobsUK mirror) ──────────────────────────────
// HealthJobsUK is the official RSS mirror for NHS Jobs run by the same
// platform (Trac/HealthJobsUK). It returns thousands of items per
// keyword in a single XML response - far higher recall than the
// HTML scrape above, which is paginated and rate-limited.
//
// Item URLs encode trust + location:
//   /job/UK/<County>/<Town>/<Trust_Name>/<Dept>/<Dept>-v<id>
// We parse those segments to reconstruct employer + location without
// needing per-item HTTP requests.
const NHS_RSS_KEYWORDS_HEALTH = [
  "nurse",
  "midwife",
  "healthcare assistant",
  "mental health nurse",
  "paramedic",
  "physiotherapist",
  "occupational therapist",
  "doctor",
  "consultant",
];

const HEALTHJOBSUK_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)));
}

function parseNhsRssItem(itemXml: string, keyword: string): any | null {
  const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
  const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
  if (!titleMatch || !linkMatch) return null;

  const title = decodeXmlEntities(titleMatch[1]).replace(/\s+/g, " ").trim();
  let url = decodeXmlEntities(linkMatch[1]).trim();
  if (!title || !url) return null;
  if (url.startsWith("http://")) url = "https://" + url.slice(7);

  // /job/UK/<County>/<Town>/<Trust>/<Dept>/<Dept>-v<id>
  const pathMatch = url.match(/\/job\/[A-Za-z]+\/([^/]+)\/([^/]+)\/([^/]+)\//);
  let location = "United Kingdom";
  let employer = "NHS";
  if (pathMatch) {
    const county = decodeURIComponent(pathMatch[1]).replace(/_/g, " ").trim();
    const town = decodeURIComponent(pathMatch[2]).replace(/_/g, " ").trim();
    const trust = decodeURIComponent(pathMatch[3]).replace(/_/g, " ").trim();
    location = [town, county].filter(Boolean).join(", ").slice(0, 200) || "United Kingdom";
    if (trust) employer = trust.slice(0, 200);
  }

  return {
    title: title.slice(0, 255),
    company: employer,
    industry: "health",
    value_chain_stage: null,
    role_category: null,
    location,
    type: "Full-time",
    work_mode: "On-site",
    salary: null,
    description: `NHS clinical role sourced via NHS Jobs RSS (HealthJobsUK). Search keyword: "${keyword}".`,
    url,
    source_url: "healthjobsuk.com",
    tags: ["NHS"],
  };
}

async function fetchNhsJobsRss(industry: string): Promise<any[]> {
  if (industry !== "health") return [];
  const allJobs: any[] = [];
  const seen = new Set<string>();
  // Per-keyword cap so one massive feed (e.g. "nurse" with ~7k items)
  // doesn't dominate the run and starve other sources of memory/time.
  const MAX_PER_KEYWORD = 800;

  for (const kw of NHS_RSS_KEYWORDS_HEALTH) {
    try {
      const url = `https://www.healthjobsuk.com/job_list/rss?KeyWord=${encodeURIComponent(kw)}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": HEALTHJOBSUK_UA,
          "Accept": "application/rss+xml, application/xml, text/xml",
          "Accept-Language": "en-GB,en;q=0.9",
        },
      });
      if (!res.ok) {
        console.warn(`[health] NHS RSS "${kw}": HTTP ${res.status}`);
        continue;
      }
      const xml = await res.text();
      const itemRx = /<item>([\s\S]*?)<\/item>/gi;
      let m: RegExpExecArray | null;
      let parsed = 0;
      let added = 0;
      while ((m = itemRx.exec(xml)) !== null && parsed < MAX_PER_KEYWORD) {
        parsed++;
        const job = parseNhsRssItem(m[1], kw);
        if (!job) continue;
        if (seen.has(job.url)) continue;
        seen.add(job.url);
        allJobs.push(job);
        added++;
      }
      console.log(`[health] NHS RSS "${kw}": ${parsed} parsed, +${added} new`);
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`[health] NHS RSS error "${kw}":`, err);
    }
  }
  console.log(`[health] NHS RSS total: ${allJobs.length} unique roles`);
  return allJobs;
}

// ── Jooble (UK aggregator) ──────────────────────────────────────────
// 500 requests/month limit. We previously joined the top 3 keywords with
// commas - Jooble interprets that as "must contain ALL three", which
// returned almost nothing (8 jobs/day across the whole platform). Switched
// to one query per keyword (top 6) so each synonym (jockey, racehorse,
// stable hand, etc.) gets its own search. ~6 calls × 30 industries ≈ 180/day
// = well under the 500/month monthly cap.
async function fetchJoobleJobs(industry: string, keywords: string[], apiKey: string) {
  if (!keywords.length) return [];
  const queries = keywords.slice(0, 6);
  const allJobs: any[] = [];
  const seenLinks = new Set<string>();
  let totalRaw = 0;

  for (const kw of queries) {
    try {
      const res = await fetch(`https://jooble.org/api/${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: kw,
          location: "United Kingdom",
          page: "1",
          ResultOnPage: "20",
        }),
      });
      if (!res.ok) {
        console.error(`Jooble error for "${industry}" kw="${kw}": ${res.status}`);
        continue;
      }
      const data = await res.json();
      const results = Array.isArray(data?.jobs) ? data.jobs : [];
      totalRaw += results.length;

      for (const r of results) {
        const title = (r.title || "").trim();
        const link = (r.link || "").trim();
        if (!title || !link) continue;
        if (seenLinks.has(link)) continue;
        seenLinks.add(link);

        const company = (r.company || "Unknown").trim();
        const desc = (r.snippet || "").replace(/<[^>]*>/g, "").trim();
        const locationStr = (r.location || "").trim() || null;
        const salary = (r.salary || "").trim() || null;
        const jobType = (r.type || "").toLowerCase().includes("part") ? "Part-time" : "Full-time";

        const { stage, roleCategory } = classifyJob(title, desc, industry);
        const updatedRaw = r.updated ? new Date(r.updated) : new Date();
        const expiresAt = new Date(updatedRaw.getTime() + 60 * 86400000).toISOString();

        allJobs.push({
          title: title.slice(0, 255),
          company: company.slice(0, 200),
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: locationStr?.slice(0, 200) ?? null,
          type: jobType,
          salary,
          description: desc.slice(0, 2000) || null,
          url: link,
          source_url: "jooble.org",
          expires_at: expiresAt,
        });
      }
    } catch (err) {
      console.error(`Jooble fetch error for "${industry}" kw="${kw}":`, err);
    }
  }
  console.log(`[${industry}] Jooble: ${allJobs.length} unique jobs (raw=${totalRaw}, ${queries.length} queries)`);
  return allJobs;
}

// ── Active Jobs DB (RapidAPI - Fantastic.jobs) ──────────────────────
// Pulls direct-from-ATS listings (Greenhouse, Workday, Lever, etc.).
// Migrated to v4 (June 2026): endpoint active-ats-7d → active-ats?time_frame=7d,
// params title_filter → title, location_filter → location,
// field remote_derived → ai_work_arrangement, locations_derived → locations.
async function fetchActiveJobsDb(industry: string, keywords: string[], rapidApiKey: string) {
  if (!keywords.length) return [];
  const titleFilter = keywords
    .slice(0, 4)
    .map(k => `"${k}"`)
    .join(" OR ");
  try {
    const url = new URL("https://active-jobs-db.p.rapidapi.com/active-ats");
    url.searchParams.set("title", titleFilter);
    url.searchParams.set("location", '"United Kingdom" OR "UK"');
    url.searchParams.set("time_frame", "7d");
    url.searchParams.set("description_type", "text");
    url.searchParams.set("limit", "20");
    url.searchParams.set("offset", "0");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "active-jobs-db.p.rapidapi.com",
      },
    });
    if (!res.ok) {
      console.error(`ActiveJobsDB error for "${industry}": ${res.status}`);
      return [];
    }
    const data = await res.json();
    const results = Array.isArray(data) ? data : Array.isArray(data?.jobs) ? data.jobs : [];
    console.log(`[${industry}] ActiveJobsDB: ${results.length} raw items`);

    const allJobs: any[] = [];
    for (const r of results) {
      const title = (r.title || "").trim();
      const link = (r.url || r.apply_url || "").trim();
      if (!title || !link) continue;

      if (typeof MANUAL_TRADE_TITLE_REGEX !== "undefined" && MANUAL_TRADE_TITLE_REGEX.test(title)) {
        continue;
      }

      const company = (r.organization || r.company || "Unknown").trim();
      const desc = (r.description_text || r.description || "")
        .replace(/<[^>]*>/g, "")
        .trim();

      // v4: locations_derived → locations
      let locationStr: string | null = null;
      if (Array.isArray(r.locations) && r.locations.length > 0) {
        locationStr = String(r.locations[0]).trim();
      } else if (Array.isArray(r.locations_derived) && r.locations_derived.length > 0) {
        locationStr = String(r.locations_derived[0]).trim(); // fallback during transition
      } else if (r.location) {
        locationStr = String(r.location).trim();
      } else if (r.cities_derived?.[0]) {
        locationStr = String(r.cities_derived[0]).trim();
      }

      if (locationStr && !/united kingdom|england|scotland|wales|northern ireland|\bUK\b|london|manchester|birmingham|leeds|bristol|glasgow|edinburgh|cardiff|belfast|liverpool|newcastle|sheffield|nottingham|brighton/i.test(locationStr)) {
        continue;
      }

      const employment = Array.isArray(r.employment_type)
        ? r.employment_type.join(",").toLowerCase()
        : String(r.employment_type || "").toLowerCase();
      const jobType = employment.includes("part") ? "Part-time"
        : employment.includes("intern") ? "Internship"
        : employment.includes("contract") ? "Contract"
        : "Full-time";

      // v4: remote_derived → ai_work_arrangement
      const workArrangement = String(r.ai_work_arrangement || r.remote_derived || "").toLowerCase();
      const remoteFlag = workArrangement.includes("remote") || r.remote_derived === true || /remote/i.test(employment);

      const { stage, roleCategory } = classifyJob(title, desc, industry);
      const postedRaw = r.date_posted ? new Date(r.date_posted) : new Date();
      const expiresAt = new Date(postedRaw.getTime() + 60 * 86400000).toISOString();

      allJobs.push({
        title: title.slice(0, 255),
        company: company.slice(0, 200),
        industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: locationStr?.slice(0, 200) ?? null,
        type: jobType,
        work_mode: remoteFlag ? "Remote" : "On-site",
        salary: null,
        description: desc.slice(0, 2000) || null,
        url: link,
        source_url: "active-jobs-db",
        expires_at: expiresAt,
      });
    }
    return allJobs;
  } catch (err) {
    console.error(`ActiveJobsDB fetch error for "${industry}":`, err);
    return [];
  }
}

// ── LinkedIn Job Search (RapidAPI - Fantastic.jobs) ─────────────────
// Fills the LinkedIn coverage gap. Same RapidAPI key as Active Jobs DB.
// Migrated to v4 (June 2026): endpoint active-jb-7d → active-jb?time_frame=7d,
// params title_filter → title, location_filter → location,
// field remote_derived → ai_work_arrangement, locations_derived → locations.
async function fetchLinkedInJobs(industry: string, keywords: string[], rapidApiKey: string) {
  if (!keywords.length) return [];
  const titleFilter = keywords
    .slice(0, 4)
    .map(k => `"${k}"`)
    .join(" OR ");
  try {
    const url = new URL("https://linkedin-job-search-api.p.rapidapi.com/active-jb");
    url.searchParams.set("title", titleFilter);
    url.searchParams.set("location", '"United Kingdom" OR "UK"');
    url.searchParams.set("time_frame", "7d");
    url.searchParams.set("description_type", "text");
    url.searchParams.set("limit", "20");
    url.searchParams.set("offset", "0");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "linkedin-job-search-api.p.rapidapi.com",
      },
    });
    if (!res.ok) {
      console.error(`LinkedIn error for "${industry}": ${res.status}`);
      return [];
    }
    const data = await res.json();
    const results = Array.isArray(data) ? data : Array.isArray(data?.jobs) ? data.jobs : [];
    console.log(`[${industry}] LinkedIn: ${results.length} raw items`);

    const allJobs: any[] = [];
    for (const r of results) {
      const title = (r.title || "").trim();
      const link = (r.url || r.apply_url || "").trim();
      if (!title || !link) continue;

      if (typeof MANUAL_TRADE_TITLE_REGEX !== "undefined" && MANUAL_TRADE_TITLE_REGEX.test(title)) {
        continue;
      }

      const company = (r.organization || r.company || "Unknown").trim();
      const desc = (r.description_text || r.description || "")
        .replace(/<[^>]*>/g, "")
        .trim();

      // v4: locations_derived → locations
      let locationStr: string | null = null;
      if (Array.isArray(r.locations) && r.locations.length > 0) {
        locationStr = String(r.locations[0]).trim();
      } else if (Array.isArray(r.locations_derived) && r.locations_derived.length > 0) {
        locationStr = String(r.locations_derived[0]).trim(); // fallback during transition
      } else if (r.location) {
        locationStr = String(r.location).trim();
      } else if (r.cities_derived?.[0]) {
        locationStr = String(r.cities_derived[0]).trim();
      }

      if (locationStr && !/united kingdom|england|scotland|wales|northern ireland|\bUK\b|london|manchester|birmingham|leeds|bristol|glasgow|edinburgh|cardiff|belfast|liverpool|newcastle|sheffield|nottingham|brighton/i.test(locationStr)) {
        continue;
      }

      const employment = Array.isArray(r.employment_type)
        ? r.employment_type.join(",").toLowerCase()
        : String(r.employment_type || "").toLowerCase();
      const jobType = employment.includes("part") ? "Part-time"
        : employment.includes("intern") ? "Internship"
        : employment.includes("contract") ? "Contract"
        : "Full-time";

      // v4: remote_derived → ai_work_arrangement
      const workArrangement = String(r.ai_work_arrangement || r.remote_derived || "").toLowerCase();
      const remoteFlag = workArrangement.includes("remote") || r.remote_derived === true || /remote/i.test(employment);

      const { stage, roleCategory } = classifyJob(title, desc, industry);
      const postedRaw = r.date_posted ? new Date(r.date_posted) : new Date();
      const expiresAt = new Date(postedRaw.getTime() + 60 * 86400000).toISOString();

      allJobs.push({
        title: title.slice(0, 255),
        company: company.slice(0, 200),
        industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: locationStr?.slice(0, 200) ?? null,
        type: jobType,
        work_mode: remoteFlag ? "Remote" : "On-site",
        salary: null,
        description: desc.slice(0, 2000) || null,
        url: link,
        source_url: "linkedin",
        expires_at: expiresAt,
      });
    }
    return allJobs;
  } catch (err) {
    console.error(`LinkedIn fetch error for "${industry}":`, err);
    return [];
  }
}

// ── Pinpoint HR (direct ATS - public /postings.json feed) ───────────
// Pinpoint is used by the Premier League and a growing number of UK
// sports/media employers. Each tenant exposes a structured JSON feed at
// `https://<tenant>.pinpointhq.com/postings.json` - no key required.
// We hit each tenant once per refresh, map directly to our jobs schema
// and rely on the URL unique index for cross-run dedupe.
const PINPOINT_TENANTS: Array<{ slug: string; company: string; industry: string }> = [
  { slug: "premierleague", company: "The Premier League", industry: "football" },
  { slug: "chelseafc",     company: "Chelsea FC",          industry: "football" },
  { slug: "manutd",        company: "Manchester United",    industry: "football" },
  { slug: "cpfc",          company: "Crystal Palace FC",    industry: "football" },
  { slug: "afcb",          company: "AFC Bournemouth",      industry: "football" },
  { slug: "safc",          company: "Sunderland AFC",       industry: "football" },
  { slug: "sufc",          company: "Sheffield United FC",  industry: "football" },
  { slug: "astonmartinf1", company: "Aston Martin Aramco F1 Team", industry: "formula-1" },
  // ===== Who-section companies discovered May 2026 =====
  { slug: "pret",              company: "Pret A Manger",      industry: "hospitality" },
  { slug: "dishoom",           company: "Dishoom",             industry: "hospitality" },
  { slug: "fiveguys",          company: "Five Guys",           industry: "hospitality" },
  { slug: "foxtons",           company: "Foxtons",             industry: "estate-agency" },
  { slug: "rightmove",         company: "Rightmove",           industry: "estate-agency" },
  { slug: "selfridges",        company: "Selfridges",          industry: "fashion" },
  { slug: "lush",              company: "Lush",                industry: "beauty" },
  { slug: "easyjet",           company: "easyJet",             industry: "travel" },
  { slug: "tui",               company: "TUI",                 industry: "travel" },
  { slug: "marksandspencer",   company: "Marks & Spencer",     industry: "fashion" },
  { slug: "hollandandbarrett", company: "Holland & Barrett",   industry: "health" },
  { slug: "thirdspace",        company: "Third Space",         industry: "wellness" },
  // ===== Who's Hiring discoveries (May 2026) =====
  { slug: "silverstone",        company: "Silverstone Circuits", industry: "formula-1" },
  { slug: "jmw",                company: "JMW Solicitors",       industry: "money" },
  // ── Lettings specialists (Pinpoint) ─────────────────
  { slug: "spicerhaart",        company: "Spicerhaart",          industry: "estate-agency" },
  { slug: "goodlord",           company: "Goodlord",             industry: "estate-agency" },
];

async function fetchPinpointJobs(tenant: { slug: string; company: string; industry: string }) {
  try {
    const res = await fetch(`https://${tenant.slug}.pinpointhq.com/postings.json`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) {
      console.error(`Pinpoint error for "${tenant.slug}": ${res.status}`);
      return [];
    }
    const data = await res.json();
    const results: any[] = Array.isArray(data?.data) ? data.data
      : Array.isArray(data?.postings) ? data.postings
      : Array.isArray(data) ? data : [];
    console.log(`[${tenant.industry}] Pinpoint(${tenant.slug}): ${results.length} raw items`);

    const allJobs: any[] = [];
    for (const r of results) {
      const title = String(r.title || "").trim();
      const link = String(r.url || r.apply_url || r.advert_url || "").trim()
        || (r.id ? `https://${tenant.slug}.pinpointhq.com/jobs/${r.id}` : "");
      if (!title || !link) continue;

      // Skip closed/expired listings.
      const deadlineRaw = r.deadline_at || r.closes_at || null;
      const deadline = deadlineRaw ? new Date(deadlineRaw) : null;
      if (deadline && deadline.getTime() < Date.now()) continue;

      const desc = String(r.description || r.summary || "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Location: Pinpoint exposes either a string or array of locations.
      let locationStr: string | null = null;
      if (Array.isArray(r.locations) && r.locations.length > 0) {
        const first = r.locations[0];
        locationStr = typeof first === "string" ? first : (first?.name || first?.city || null);
      } else if (r.location) {
        locationStr = typeof r.location === "string" ? r.location : (r.location?.name || null);
      } else if (r.city) {
        locationStr = String(r.city);
      }

      const employment = String(r.employment_type || r.contract_type || "").toLowerCase();
      const jobType = employment.includes("part") ? "Part-time"
        : employment.includes("intern") ? "Internship"
        : employment.includes("contract") ? "Contract"
        : employment.includes("temp") ? "Contract"
        : "Full-time";

      const remoteFlag = r.workplace_type === "remote"
        || /remote/i.test(employment)
        || /remote/i.test(String(locationStr || ""));

      const salary = r.compensation
        ? String(r.compensation)
        : (r.compensation_minimum && r.compensation_maximum
            ? `£${r.compensation_minimum} - £${r.compensation_maximum}`
            : null);

      const { stage, roleCategory } = classifyJob(title, desc, tenant.industry);
      const expiresAt = (deadline ?? new Date(Date.now() + 60 * 86400000)).toISOString();

      allJobs.push({
        title: title.slice(0, 255),
        company: tenant.company.slice(0, 200),
        industry: tenant.industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: locationStr?.slice(0, 200) ?? null,
        type: jobType,
        work_mode: remoteFlag ? "Remote" : "On-site",
        salary,
        description: desc.slice(0, 2000) || null,
        url: link,
        source_url: "pinpointhq.com",
        expires_at: expiresAt,
      });
    }
    return allJobs;
  } catch (err) {
    console.error(`Pinpoint fetch error for "${tenant.slug}":`, err);
    return [];
  }
}

// ── Oracle Recruiting Cloud (HCM REST API - direct, no key) ───────────
// Many large UK retailers / employers run their careers portal on Oracle
// HCM Cloud. The public site is a JS-rendered SPA, but the underlying
// REST endpoint returns clean JSON for every requisition. Pattern:
//   https://<host>/hcmRestApi/resources/latest/recruitingCEJobRequisitions
//     ?finder=findReqs;siteNumber=<site>,limit=200,offset=N
//     &onlyData=true&expand=requisitionList
// Apply URL: <jobBoardUrl>/job/<Id>
const ORACLE_HCM_TENANTS: Array<{
  company: string;
  industry: string;
  host: string;        // Oracle HCM API host (no scheme)
  site: string;        // siteNumber (usually CX_1)
  jobBoardUrl: string; // public job-board base for apply links
  /** Optional secondary industry routing for sub-brands inferred from job text. */
  routes?: Array<{ match: RegExp; industry: string; company?: string }>;
}> = [
  {
    company: "Marks & Spencer",
    industry: "fashion",
    host: "fa-eqid-saasfaprod1.fa.ocs.oraclecloud.com",
    site: "CX_1",
    jobBoardUrl: "https://jobs.marksandspencer.com",
    // M&S Food roles → grocery industry
    routes: [
      { match: /\b(food|grocery|deli|bakery|butcher|fishmonger|cafe)\b/i, industry: "grocery", company: "M&S Food" },
    ],
  },
  {
    company: "Next",
    industry: "fashion",
    host: "ekeq.fa.em2.oraclecloud.com",
    site: "CX_1",
    jobBoardUrl: "https://careers.next.co.uk",
  },
  {
    // ITV - TV broadcaster. Default to cinema (Film & TV); journalism/news roles route to journalism.
    company: "ITV",
    industry: "cinema",
    host: "fa-euup-saasfaprod1.fa.ocs.oraclecloud.com",
    site: "CX_1",
    jobBoardUrl: "https://careers.itv.com",
    routes: [
      { match: /\b(news|journalist|reporter|correspondent|editor.*news|itn)\b/i, industry: "journalism" },
    ],
  },
  {
    // Virgin Atlantic - UK airline. Travel industry.
    company: "Virgin Atlantic",
    industry: "travel",
    host: "iagime.fa.ocs.oraclecloud.com",
    site: "CX_1",
    jobBoardUrl: "https://careersuk.virgin-atlantic.com",
  },
  {
    // Hearst UK - magazine publisher (Cosmopolitan, Elle, Esquire, Country Living, Digital Spy).
    company: "Hearst UK",
    industry: "journalism",
    host: "eevd.fa.us6.oraclecloud.com",
    site: "CX_1001",
    jobBoardUrl: "https://eevd.fa.us6.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001",
  },
  {
    // Marriott International - global hotel group. Travel industry.
    company: "Marriott International",
    industry: "travel",
    host: "ejwl.fa.us2.oraclecloud.com",
    site: "CX",
    jobBoardUrl: "https://careers.marriott.com",
  },
];

async function fetchOracleHcmJobs(tenant: typeof ORACLE_HCM_TENANTS[number]) {
  const allJobs: any[] = [];
  const PAGE_SIZE = 200;
  const MAX_PAGES = 8; // safety cap → 1,600 jobs max per tenant
  let offset = 0;
  let total = 0;
  let totalRaw = 0;
  let droppedNonUk = 0;
  let droppedExpired = 0;
  let droppedNoTitle = 0;
  console.log(`[OracleHCM:${tenant.company}] start - host=${tenant.host} site=${tenant.site}`);

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const url =
        `https://${tenant.host}/hcmRestApi/resources/latest/recruitingCEJobRequisitions` +
        `?finder=findReqs;siteNumber=${tenant.site},limit=${PAGE_SIZE},offset=${offset}` +
        `&onlyData=true&expand=requisitionList.secondaryLocations`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "REST-Framework-Version": "7",
        },
      });

      if (!res.ok) {
        console.error(`OracleHCM error for "${tenant.company}" offset=${offset}: ${res.status}`);
        break;
      }

      const data = await res.json();
      const wrapper = data?.items?.[0];
      if (!wrapper) break;
      if (page === 0) total = Number(wrapper.TotalJobsCount || 0);

      const reqs = wrapper?.requisitionList?.items;
      if (!Array.isArray(reqs) || reqs.length === 0) break;
      totalRaw += reqs.length;

      for (const r of reqs) {
        const id = String(r.Id || "").trim();
        const title = String(r.Title || "").trim();
        if (!id || !title) { droppedNoTitle++; continue; }

        // UK-only filter (strip Ireland / international roles).
        const country = String(r.PrimaryLocationCountry || "").toUpperCase();
        if (country && country !== "GB" && country !== "UK") { droppedNonUk++; continue; }

        const desc = String(r.ShortDescriptionStr || r.ExternalQualificationsStr || "")
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim();

        const locationStr = String(r.PrimaryLocation || "").trim() || null;

        // Sub-brand routing (e.g. M&S Food → grocery).
        let industry = tenant.industry;
        let company = tenant.company;
        if (tenant.routes && tenant.routes.length > 0) {
          const haystack = `${title} ${desc}`;
          for (const route of tenant.routes) {
            if (route.match.test(haystack)) {
              industry = route.industry;
              if (route.company) company = route.company;
              break;
            }
          }
        }

        const jobUrl = `${tenant.jobBoardUrl.replace(/\/$/, "")}/job/${id}`;
        const { stage, roleCategory } = classifyJob(title, desc, industry);

        const postedAt = r.PostedDate ? new Date(r.PostedDate) : null;
        const postingEnd = r.PostingEndDate ? new Date(r.PostingEndDate) : null;
        const expiresAt = (postingEnd && !isNaN(postingEnd.getTime()))
          ? postingEnd.toISOString()
          : new Date(Date.now() + 60 * 86400000).toISOString();

        // Skip already-expired postings.
        if (postingEnd && postingEnd.getTime() < Date.now()) { droppedExpired++; continue; }

        allJobs.push({
          title: title.slice(0, 255),
          company: company.slice(0, 200),
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: locationStr?.slice(0, 200) ?? null,
          type: "Full-time",
          work_mode: /remote/i.test(title) || /remote/i.test(String(locationStr || "")) ? "Remote" : "On-site",
          salary: null,
          description: desc.slice(0, 2000) || null,
          url: jobUrl,
          source_url: tenant.jobBoardUrl.replace(/^https?:\/\//, ""),
          expires_at: expiresAt,
        });
      }

      const hasMore = wrapper?.requisitionList?.hasMore === true;
      if (!hasMore) break;
      offset += PAGE_SIZE;
    }

    // Summary by industry (helps debug sub-brand routing for M&S/Next/JLP).
    const byIndustry = allJobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.industry] = (acc[j.industry] || 0) + 1;
      return acc;
    }, {});
    const breakdown = Object.entries(byIndustry).map(([k, v]) => `${k}=${v}`).join(", ") || "none";
    console.log(
      `[OracleHCM:${tenant.company}] kept=${allJobs.length} raw=${totalRaw} total=${total} ` +
      `dropped(nonUK=${droppedNonUk}, expired=${droppedExpired}, noTitle=${droppedNoTitle}) ` +
      `byIndustry: ${breakdown}`
    );
    return allJobs;
  } catch (err) {
    console.error(`[OracleHCM:${tenant.company}] fetch error after kept=${allJobs.length}:`, err);
    return allJobs;
  }
}

// ── Workday Recruiting (CXS public search API - direct, no key) ───────
// Pattern (POST):
//   https://<tenant>.<wdN>.myworkdayjobs.com/wday/cxs/<tenant>/<site>/jobs
// Body: { appliedFacets: {}, limit: 20, offset: N, searchText: "" }
// Apply URL: https://<tenant>.<wdN>.myworkdayjobs.com/<site><externalPath>
// We filter to UK postings via locationsText (no reliable server-side facet
// across tenants), then bucket into the declared industry.
const WORKDAY_TENANTS: Array<{
  company: string;
  industry: string;
  tenant: string; // subdomain segment
  wd: string;     // wd1 / wd3 / wd5 etc.
  site: string;   // e.g. LSEG_External_Career_Site
  /** Optional secondary industry routing for sub-brands inferred from job text. */
  routes?: Array<{ match: RegExp; industry: string; company?: string }>;
  /** Skip UK location filter - for tenants whose career site only lists domestic jobs. */
  allUk?: boolean;
}> = [
  { company: "LSEG",   industry: "money",    tenant: "lseg",   wd: "wd3", site: "LSEG_External_Career_Site" },
  { company: "Bupa",   industry: "health",   tenant: "bupa",   wd: "wd3", site: "External" },
  { company: "Nike",   industry: "footwear", tenant: "nike",   wd: "wd1", site: "nikecareers" },
  { company: "Diageo", industry: "beer",     tenant: "diageo", wd: "wd3", site: "Diageo_Careers" },
  { company: "Skechers", industry: "footwear", tenant: "skechers", wd: "wd5", site: "skechers" },
  // John Lewis Partnership - multi-brand. Default John Lewis & Partners → fashion.
  // Sub-brand routing: Waitrose → grocery; Home/Furniture roles → interior-design.
  {
    company: "John Lewis & Partners",
    industry: "fashion",
    tenant: "jlp",
    wd: "wd3",
    site: "JLPjobs_careers",
    routes: [
      { match: /\bwaitrose\b/i, industry: "grocery", company: "Waitrose & Partners" },
      { match: /\b(home|furniture|sofa|bedroom|kitchen design|bathroom|interior|homeware|soft furnishing|curtain|lighting|cookshop|nursery|dining|outdoor living|christmas shop)\b/i, industry: "interior-design" },
    ],
  },
  // Lloyds Banking Group - multi-brand (Lloyds, Halifax, Bank of Scotland, Scottish Widows).
  { company: "Lloyds Banking Group", industry: "money", tenant: "lbg", wd: "wd3", site: "LBG_Careers", allUk: true },
  // ===== Who's Hiring discoveries (May 2026) =====
  { company: "Christie's",        industry: "fashion",   tenant: "christies",        wd: "wd1", site: "Christies" },
  { company: "Deckers (UGG/HOKA)", industry: "footwear",  tenant: "deckers",          wd: "wd1", site: "Deckers" },
  { company: "Puma",              industry: "footwear",  tenant: "puma",             wd: "wd3", site: "puma_careers" },
  { company: "Clarks",            industry: "footwear",  tenant: "clarks",           wd: "wd3", site: "Clarks_Careers" },
  { company: "ASICS",             industry: "footwear",  tenant: "asics",            wd: "wd3", site: "External" },
  { company: "On Running",        industry: "footwear",  tenant: "on",               wd: "wd3", site: "On_Careers" },
  { company: "VF Corp (Vans/Timberland)", industry: "footwear", tenant: "vfc", wd: "wd5", site: "vfc_careers",
    routes: [
      { match: /\bvans\b/i,       industry: "footwear", company: "Vans" },
      { match: /\btimberland\b/i, industry: "footwear", company: "Timberland" },
      { match: /\bnorth face\b/i, industry: "fashion",  company: "The North Face" },
    ],
  },
  { company: "Signet Jewelers",    industry: "fashion",   tenant: "signetjewelers",   wd: "wd1", site: "Signet_Jewelers" },
  { company: "Universal Music",    industry: "music",     tenant: "umusic",           wd: "wd1", site: "UMG_Careers" },
  { company: "Warner Music Group", industry: "music",     tenant: "warnermusic",      wd: "wd1", site: "Warner_Music" },
  { company: "Sony Music",         industry: "music",     tenant: "sonymusic",        wd: "wd5", site: "Sony_Music" },
  { company: "Live Nation",        industry: "music",     tenant: "livenation",       wd: "wd5", site: "Live_Nation" },
  { company: "Medivet",            industry: "pets",      tenant: "medivet",          wd: "wd3", site: "Medivet" },
  { company: "Ramsay Health Care",  industry: "health",    tenant: "ramsayhealthcare", wd: "wd3", site: "Ramsay_Health_Care" },
  { company: "HSBC",               industry: "money",     tenant: "hsbc",             wd: "wd3", site: "HSBC_Careers", allUk: false },
  { company: "Expedia Group",      industry: "travel",    tenant: "expedia",          wd: "wd5", site: "Expedia_Group_Careers" },
  { company: "Unilever",           industry: "beauty",    tenant: "unilever",         wd: "wd3", site: "Unilever_Experienced_Professionals",
    routes: [
      { match: /\b(food|ice cream|knorr|hellmann|magnum|ben & jerry|wall'?s|colman|marmite|pot noodle|bovril)\b/i, industry: "grocery" },
      { match: /\b(dove|lynx|axe|sure|rexona|vaseline|simple|tresemme|sunsilk|lux)\b/i, industry: "beauty" },
      { match: /\b(persil|comfort|domestos|cif|surf)\b/i, industry: "grocery" },
    ],
  },
  // Red Bull Racing - Formula 1
  { company: "Red Bull Racing", industry: "formula-1", tenant: "redbull", wd: "wd1", site: "Red_Bull" },
  // Burberry - fashion (Workday wd3)
  { company: "Burberry", industry: "fashion", tenant: "burberry", wd: "wd3", site: "burberry" },
  // Condé Nast - journalism / media (Workday wd5)
  { company: "Condé Nast", industry: "journalism", tenant: "condenast", wd: "wd5", site: "CondeCareers",
    routes: [
      { match: /\b(vogue|glamour|gq|tatler|vanity fair|wired|bon app[eé]tit)\b/i, industry: "fashion", company: "Condé Nast" },
    ],
  },
  // Brentford FC - football (Workday wd107)
  { company: "Brentford FC", industry: "football", tenant: "brentfordfootballclub", wd: "wd107", site: "BrentfordFC", allUk: true },

  // ===== Cinema / Film & TV =====
  { company: "Sky",            industry: "cinema",   tenant: "sky",          wd: "wd3", site: "External",
    routes: [
      { match: /\b(news|journalism|reporter|anchor|correspondent|newsroom)\b/i, industry: "journalism" },
      { match: /\b(sport|premier league|football|f1|formula)\b/i,              industry: "football" },
    ],
  },
  { company: "Netflix",        industry: "cinema",   tenant: "netflix",      wd: "wd1", site: "Netflix_External_Site" },
  { company: "Warner Bros. Discovery", industry: "cinema", tenant: "wbd",    wd: "wd5", site: "careers",
    routes: [
      { match: /\b(hbo|max|streaming|series|drama|comedy|scripted)\b/i, industry: "cinema" },
      { match: /\b(news|cnbc|cnn|cbs)\b/i, industry: "journalism" },
    ],
  },
  { company: "Paramount",      industry: "cinema",   tenant: "paramount",    wd: "wd3", site: "External" },
  { company: "Odeon Cinemas",  industry: "cinema",   tenant: "odeon",        wd: "wd3", site: "External", allUk: true },
  { company: "Electronic Arts", industry: "gaming",  tenant: "ea",           wd: "wd1", site: "EA_Careers" },
  { company: "Ubisoft",        industry: "gaming",   tenant: "ubisoft",      wd: "wd3", site: "Ubisoft_Careers" },

  // ===== Journalism / Media =====
  { company: "News UK (Times / Sun)", industry: "journalism", tenant: "newsuk", wd: "wd3", site: "External", allUk: true },
  { company: "ITV",            industry: "journalism", tenant: "itv",        wd: "wd3", site: "External",
    routes: [
      { match: /\b(drama|comedy|entertainment|reality|love island|production)\b/i, industry: "cinema" },
    ],
  },

  // ===== Footwear =====
  { company: "Adidas",         industry: "footwear", tenant: "adidas",       wd: "wd3", site: "adidas-jobs" },
  { company: "Foot Locker",    industry: "footwear", tenant: "footlocker",   wd: "wd5", site: "FootLockerCareers" },
  { company: "New Balance",    industry: "footwear", tenant: "newbalance",   wd: "wd3", site: "External" },

  // ===== Jewellery =====
  { company: "Pandora",        industry: "jewellery", tenant: "pandora",     wd: "wd3", site: "Pandora_Careers" },
  { company: "Richemont (Cartier/IWC)", industry: "jewellery", tenant: "richemont", wd: "wd3", site: "Richemont" },
  { company: "LVMH",           industry: "jewellery", tenant: "lvmh",        wd: "wd3", site: "LVMH_Careers",
    routes: [
      { match: /\b(fashion|clothing|apparel|leather|handbag|luggage|dior|givenchy|fendi|kenzo|loewe)\b/i, industry: "fashion" },
      { match: /\b(wine|champagne|moet|hennessy|spirits|cognac|drink)\b/i, industry: "beer" },
      { match: /\b(perfume|cosmetic|beauty|makeup|skincare|guerlain|benefit|fresh|make up for ever)\b/i, industry: "beauty" },
    ],
  },

  // ===== Beer / Drinks =====
  { company: "Heineken",       industry: "beer",     tenant: "heineken",     wd: "wd3", site: "HNZ" },
  { company: "AB InBev",       industry: "beer",     tenant: "abinbev",      wd: "wd3", site: "AB-InBev" },
  { company: "Carlsberg Group", industry: "beer",    tenant: "carlsberg",    wd: "wd3", site: "External" },
  { company: "Molson Coors",    industry: "beer",    tenant: "molsoncoors",  wd: "wd5", site: "MolsonCoors" },

  // ===== Health / Pharma =====
  { company: "Pfizer UK",       industry: "health",   tenant: "npfizer",     wd: "wd5", site: "External" },
  { company: "Johnson & Johnson", industry: "health", tenant: "jj",          wd: "wd3", site: "External" },
];

function isUkLocation(s: string): boolean {
  if (!s) return false;
  const t = s.toLowerCase();
  if (/\b(united kingdom|uk|england|scotland|wales|northern ireland|britain)\b/.test(t)) return true;
  if (/\b(london|manchester|birmingham|leeds|liverpool|bristol|glasgow|edinburgh|cardiff|belfast|nottingham|sheffield|newcastle|cambridge|oxford|brighton|reading|coventry|leicester|southampton|portsmouth|york|hull|derby|stoke|aberdeen|dundee|swansea|milton keynes|watford|st albans|guildford|crawley|woking|slough|reigate|basingstoke|maidenhead|chelmsford|colchester|norwich|ipswich|preston|bolton|wigan|warrington|bradford|wakefield|huddersfield|sunderland|middlesbrough)\b/.test(t)) return true;
  return false;
}

async function fetchWorkdayJobs(tenant: typeof WORKDAY_TENANTS[number]) {
  const allJobs: any[] = [];
  const PAGE_SIZE = 20;
  const MAX_PAGES = 30; // safety cap → 600 jobs max per tenant
  let offset = 0;
  const baseHost = `${tenant.tenant}.${tenant.wd}.myworkdayjobs.com`;
  const apiUrl = `https://${baseHost}/wday/cxs/${tenant.tenant}/${tenant.site}/jobs`;
  const siteUrl = `https://${baseHost}/${tenant.site}`;

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)",
        },
        body: JSON.stringify({
          appliedFacets: {},
          limit: PAGE_SIZE,
          offset,
          searchText: "",
        }),
      });

      if (!res.ok) {
        console.error(`Workday error for "${tenant.company}" offset=${offset}: ${res.status}`);
        break;
      }

      const data = await res.json();
      const postings = data?.jobPostings;
      if (!Array.isArray(postings) || postings.length === 0) break;

      for (const p of postings) {
        const title = String(p.title || "").trim();
        const externalPath = String(p.externalPath || "").trim();
        const locationsText = String(p.locationsText || "").trim();
        if (!title || !externalPath) continue;

        // UK-only filter - Workday locationsText covers primary + additional locs.
        if (!tenant.allUk && !isUkLocation(locationsText)) continue;

        // Sub-brand routing.
        let industry = tenant.industry;
        let company = tenant.company;
        if (tenant.routes && tenant.routes.length > 0) {
          for (const route of tenant.routes) {
            if (route.match.test(title)) {
              industry = route.industry;
              if (route.company) company = route.company;
              break;
            }
          }
        }

        const jobUrl = `${siteUrl}${externalPath}`;
        const { stage, roleCategory } = classifyJob(title, "", industry);

        const postedOn = String(p.postedOn || "").trim(); // e.g. "Posted 3 Days Ago"
        // We don't have a reliable expiry; default to +30 days.
        const expiresAt = new Date(Date.now() + 60 * 86400000).toISOString();

        allJobs.push({
          title: title.slice(0, 255),
          company: company.slice(0, 200),
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: locationsText.slice(0, 200) || null,
          type: "Full-time",
          work_mode: /remote/i.test(title) || /remote/i.test(locationsText) ? "Remote" : "On-site",
          salary: null,
          description: postedOn || null,
          url: jobUrl,
          source_url: baseHost,
          expires_at: expiresAt,
        });
      }

      const total = Number(data?.total || 0);
      offset += PAGE_SIZE;
      if (offset >= total) break;
    }

    console.log(`Workday[${tenant.company}]: ${allJobs.length} UK jobs ingested`);
    return allJobs;
  } catch (err) {
    console.error(`Workday fetch error for "${tenant.company}":`, err);
    return allJobs;
  }
}

// ── Formula 1 direct sources ─────────────────────────────────────────
// Aggregators under-surface F1 because many teams post directly to their own
// ATS. These lightweight direct pulls cover the official F1 jobs page,
// Motorsportjobs, Motorsport UK, and key UK-based team career sites.
const F1_DIRECT_FIRECRAWL_SOURCES = [
  { company: "Formula 1", url: "https://corp.formula1.com/careers-at-formula-1/all-jobs/", host: "corp.formula1.com" },
  { company: "Motorsportjobs.com", url: "https://www.motorsportjobs.com/en/jobs/industry/formula-1-10611", host: "motorsportjobs.com" },
  { company: "Red Bull Racing", url: "https://www.redbullracing.com/int-en/jobs", host: "redbullracing.com" },
  { company: "Alpine F1 Team", url: "https://www.alpinecars.com/en/formula-1/careers/", host: "alpinecars.com" },
];

function isLikelyF1JobTitle(title: string): boolean {
  // Block nav items, single-word page labels, article/story links
  if (/\b(privacy|cookie|terms|login|sign in|newsletter|menu|home|about|contact|all jobs|job search|departments|clear filters|learn more|read more|view vision|candidate brief|shop|partners|careers|hospitality|podcast|imprint|races|team|cars|my paddock|web3|media|highlights|story|video|min read|red bull academy|girls on track|meet our|cookie settings|privacy policy|terms of use|contact us|load more|image description|sign maker|view all|show more|next page|previous page|go back|subscribe|bookmark|apply to job)\b/i.test(title)) return false;
  if (title.length < 6 || title.length > 120) return false;
  // Reject single-word titles (nav items like "Races", "Team", "Cars")
  if (!/\s/.test(title.trim())) return false;
  return true;
}

function f1JobRow(args: {
  title: string; company: string; url: string; sourceUrl: string; description?: string | null;
  location?: string | null; type?: string | null; salary?: string | null; expiresAt?: string | null;
}) {
  const desc = args.description || `Direct Formula 1 / motorsport listing from ${args.company}.`;
  const { stage, roleCategory } = classifyJob(args.title, desc, "formula-1");
  return {
    title: args.title.slice(0, 255),
    company: args.company.slice(0, 200),
    industry: "formula-1",
    value_chain_stage: stage,
    role_category: roleCategory,
    location: args.location?.slice(0, 200) ?? null,
    type: args.type || (/intern|placement|graduate/i.test(args.title) ? "Internship" : "Full-time"),
    work_mode: /remote|home[\s-]?based/i.test(`${args.title} ${args.location ?? ""}`) ? "Remote" : /hybrid/i.test(`${args.title} ${args.location ?? ""}`) ? "Hybrid" : "On-site",
    salary: args.salary?.slice(0, 200) ?? null,
    description: desc.slice(0, 2000),
    url: args.url,
    source_url: args.sourceUrl,
    expires_at: args.expiresAt || new Date(Date.now() + 60 * 86400000).toISOString(),
    tags: ["Formula 1", "Motorsport"],
  };
}

async function fetchMcLarenRacingJobs() {
  const allJobs: any[] = [];
  try {
    const res = await fetch("https://racingcareers.mclaren.com/api/offers", {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; howdoyoudo.jobs/1.0)" },
    });
    if (!res.ok) return allJobs;
    const data = await res.json();
    const offers: any[] = Array.isArray(data?.offers) ? data.offers : [];
    for (const offer of offers) {
      const title = String(offer.title || "").trim();
      const url = String(offer.careers_url || offer.url || "").trim();
      if (!title || !url || !isLikelyF1JobTitle(title)) continue;
      const expiresAt = offer.close_at ? new Date(offer.close_at).toISOString() : null;
      allJobs.push(f1JobRow({
        title,
        company: "McLaren Racing",
        url,
        sourceUrl: "racingcareers.mclaren.com",
        location: String(offer.location || offer.city || "Woking").trim(),
        type: /part/i.test(String(offer.employment_type_code || "")) ? "Part-time" : "Full-time",
        salary: Array.isArray(offer.tags) ? offer.tags.find((t: string) => /£|salary|competitive/i.test(String(t))) : null,
        description: cleanHtmlText(`${offer.description || ""} ${offer.requirements || ""}`) || offer.sharing_description || null,
        expiresAt,
      }));
    }
  } catch (err) {
    console.error("[formula-1] McLaren direct fetch error:", err);
  }
  console.log(`[formula-1] McLaren Racing direct: ${allJobs.length} jobs`);
  return allJobs;
}

async function fetchMercedesF1Jobs() {
  const allJobs: any[] = [];
  try {
    const res = await fetch("https://www.mercedesamgf1.com/careers/vacancies", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; howdoyoudo.jobs/1.0)" },
    });
    if (!res.ok) return allJobs;
    const html = await res.text();
    const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i);
    if (!jsonMatch) return allJobs;
    const payload = JSON.parse(decodeXmlEntities(jsonMatch[1]));
    const vacancies: any[] = payload?.props?.pageProps?.vacancies || [];
    for (const vacancy of vacancies) {
      const fields = vacancy?.fields || {};
      const title = String(fields.title || "").trim();
      const id = String(fields.id || fields.jobNumber || vacancy?.sys?.id || title).trim();
      if (!title || !isLikelyF1JobTitle(title)) continue;
      const end = fields.endDate ? new Date(fields.endDate) : null;
      if (end && end.getTime() < Date.now()) continue;
      allJobs.push(f1JobRow({
        title,
        company: "Mercedes-AMG PETRONAS F1 Team",
        url: `https://www.mercedesamgf1.com/careers/vacancies#${encodeURIComponent(id)}`,
        sourceUrl: "mercedesamgf1.com",
        location: "Brackley / Brixworth",
        description: fields.department ? `${fields.department} role at Mercedes-AMG PETRONAS F1 Team.` : null,
        expiresAt: end && !Number.isNaN(end.getTime()) ? end.toISOString() : null,
      }));
    }
  } catch (err) {
    console.error("[formula-1] Mercedes direct fetch error:", err);
  }
  console.log(`[formula-1] Mercedes-AMG PETRONAS direct: ${allJobs.length} jobs`);
  return allJobs;
}

async function fetchWilliamsRacingJobs() {
  const allJobs: any[] = [];
  try {
    const res = await fetch("https://careers.williamsf1.com/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; howdoyoudo.jobs/1.0)" },
    });
    if (!res.ok) return allJobs;
    const html = await res.text();
    const titleRe = /<a[^>]+class="[^"]*attrax-vacancy-tile__title[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const matches = Array.from(html.matchAll(titleRe));
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const href = decodeXmlEntities(match[1]);
      const title = cleanHtmlText(match[2]);
      if (!title || !href || !isLikelyF1JobTitle(title)) continue;
      const nextIndex = matches[i + 1]?.index ?? html.length;
      const chunk = html.slice(match.index ?? 0, nextIndex);
      const location = cleanHtmlText(chunk.match(/Location\s*<\/p>\s*<p[^>]*class="[^"]*attrax-vacancy-tile__item-value[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1]) || "Grove, Wantage";
      const functionName = cleanHtmlText(chunk.match(/Function[\s\S]{0,500}?attrax-vacancy-tile__item-value[^>]*>([\s\S]*?)<\/p>/i)?.[1]);
      const type = /part[\s-]?time/i.test(chunk) ? "Part-time" : "Full-time";
      allJobs.push(f1JobRow({
        title,
        company: "Williams Racing",
        url: href.startsWith("http") ? href : `https://careers.williamsf1.com${href}`,
        sourceUrl: "careers.williamsf1.com",
        location,
        type,
        description: functionName ? `${functionName} role at Williams Racing.` : null,
      }));
    }
  } catch (err) {
    console.error("[formula-1] Williams direct fetch error:", err);
  }
  console.log(`[formula-1] Williams Racing direct: ${allJobs.length} jobs`);
  return allJobs;
}

async function fetchMotorsportUkJobs() {
  const allJobs: any[] = [];
  try {
    const res = await fetch("https://motorsportuk.org/contact-us/careers/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; howdoyoudo.jobs/1.0)" },
    });
    if (!res.ok) return allJobs;
    const html = await res.text();
    const itemRe = /<div class="accordion-item">([\s\S]*?)(?=<div class="accordion-item">|<\/section>)/gi;
    let match: RegExpExecArray | null;
    while ((match = itemRe.exec(html)) !== null) {
      const item = match[1];
      const title = cleanHtmlText(item.match(/<h3[^>]*class="accordion-title"[^>]*>\s*<span>([\s\S]*?)<\/h3>/i)?.[1]);
      if (!title || !isLikelyF1JobTitle(title)) continue;
      const apply = decodeXmlEntities(item.match(/href="(https?:\/\/[^"]+)"/i)?.[1] || "https://motorsportuk.org/contact-us/careers/");
      const desc = cleanHtmlText(item.match(/<div class="accordion-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1]);
      const salary = desc.match(/Salary:\s*([^\.\n]+|£[^\.\n]+)/i)?.[1]?.trim() || null;
      const location = desc.match(/Location:\s*([^\.\n]+)/i)?.[1]?.trim() || "Bicester Motion";
      allJobs.push(f1JobRow({
        title,
        company: "Motorsport UK",
        url: apply,
        sourceUrl: "motorsportuk.org/contact-us/careers",
        location,
        salary,
        description: desc || null,
      }));
    }
  } catch (err) {
    console.error("[formula-1] Motorsport UK direct fetch error:", err);
  }
  console.log(`[formula-1] Motorsport UK direct: ${allJobs.length} jobs`);
  return allJobs;
}

function parseMotorsportJobsMd(md: string): Array<{ title: string; company: string; url: string; location: string; description: string }> {
  // Pattern: ## [Title](url)\n\n[Company](company-url)\n\nLocationCity, Country\n\n...description text...
  const jobBlocks = md.split(/(?=^## \[)/m).filter(b => b.startsWith("## ["));
  const results: Array<{ title: string; company: string; url: string; location: string; description: string }> = [];
  for (const block of jobBlocks) {
    const titleMatch = block.match(/^## \[([^\]]+)\]\((https:\/\/www\.motorsportjobs\.com\/en\/job\/[^\s)]+)\)/);
    if (!titleMatch) continue;
    const title = cleanHtmlText(titleMatch[1].replace(/\s+Featured$/, "").trim());
    const url = titleMatch[2].split("?")[0];
    if (!isLikelyF1JobTitle(title)) continue;
    // Company is the next markdown link on a line by itself
    const companyMatch = block.match(/\n\[([^\]]+)\]\(https:\/\/www\.motorsportjobs\.com\/en\/company\//);
    const company = companyMatch ? cleanHtmlText(companyMatch[1].trim()) : "Unknown";
    // Location follows "Location" prefix
    const locMatch = block.match(/Location([A-Z][^\n]{2,80})/);
    const location = locMatch ? locMatch[1].trim() : "";
    // Only keep UK-based jobs
    if (location && !/UK|United Kingdom|England|Scotland|Wales|London|Silverstone|Woking|Brackley|Grove|Enstone|Banbury|Milton Keynes|Northampton|Bicester|Towcester/i.test(location)) continue;
    // Extract first paragraph of description text (skip boilerplate lines)
    const descLines = block.split("\n").filter(l =>
      l.length > 40 && !/^\[|^##|^Location|^Published|^!\[|^- \[|^\*\*/i.test(l.trim())
    );
    const desc = descLines.slice(0, 2).join(" ").slice(0, 500) || `${title} at ${company} - listed on Motorsportjobs.com.`;
    results.push({ title, company, url, location, description: desc });
  }
  return results;
}

async function fetchF1FirecrawlSourceJobs(firecrawlKey: string) {
  if (!firecrawlKey) return [];
  const allJobs: any[] = [];
  const seen = new Set<string>();
  for (const source of F1_DIRECT_FIRECRAWL_SOURCES) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url: source.url, formats: ["markdown"], onlyMainContent: true, waitFor: 3000 }),
      });
      if (!res.ok) {
        console.warn(`[formula-1] Firecrawl ${source.company}: HTTP ${res.status}`);
        continue;
      }
      const payload = await res.json();
      const md: string = payload?.data?.markdown ?? payload?.markdown ?? "";
      let count = 0;

      // Motorsportjobs.com has structured job listings - use dedicated parser
      if (source.host === "motorsportjobs.com") {
        const parsed = parseMotorsportJobsMd(md);
        for (const job of parsed) {
          if (seen.has(job.url)) continue;
          seen.add(job.url);
          allJobs.push(f1JobRow({
            title: job.title,
            company: job.company,
            url: job.url,
            sourceUrl: source.host,
            description: job.description,
            location: job.location || null,
          }));
          count++;
        }
      } else {
        // Generic link extraction for other sources
        const linkRe = /\[([^\]\n]{4,120})\]\((https?:\/\/[^)]+)\)/g;
        let match: RegExpExecArray | null;
        while ((match = linkRe.exec(md)) !== null) {
          const title = cleanHtmlText(match[1]);
          const url = match[2].split("?")[0];
          if (!isLikelyF1JobTitle(title) || seen.has(url)) continue;
          const hostMatch = url.match(/^https?:\/\/([^/]+)/i);
          const host = hostMatch?.[1]?.toLowerCase() || "";
          if (!host.includes(source.host.replace(/^www\./, "")) && !/pinpointhq|recruitee|jobs|careers/i.test(url)) continue;
          seen.add(url);
          allJobs.push(f1JobRow({
            title,
            company: source.company,
            url,
            sourceUrl: source.host,
            description: `Direct listing discovered from ${source.company}.`,
          }));
          count++;
        }
      }
      console.log(`[formula-1] Firecrawl(${source.company}): ${count} jobs`);
    } catch (err) {
      console.error(`[formula-1] Firecrawl ${source.company} error:`, err);
    }
  }
  return allJobs;
}

async function fetchFormula1DirectJobs(firecrawlKey: string | undefined) {
  const directJobs = [
    ...(await fetchMcLarenRacingJobs()),
    ...(await fetchMercedesF1Jobs()),
    ...(await fetchWilliamsRacingJobs()),
    ...(await fetchMotorsportUkJobs()),
    ...(firecrawlKey ? await fetchF1FirecrawlSourceJobs(firecrawlKey) : []),
  ];
  const seen = new Set<string>();
  const unique = directJobs.filter((job) => job.url && !seen.has(job.url) && seen.add(job.url));
  console.log(`[formula-1] Direct sources total unique: ${unique.length} jobs`);
  return unique;
}

// ── Talent Funnel ATS (Firecrawl-rendered SPA) ────────────────────────
// Talent Funnel powers careers sites for several UK fashion/footwear brands
// (Dr. Martens, etc.). The public results page is a JS SPA whose listings
// load client-side from an authenticated API; standard fetches only see the
// SSR'd first page. We render via Firecrawl and parse the markdown cards.
//
// Pagination is purely client-side (?page params are ignored), so we issue
// one Firecrawl call per page (~3 credits per tenant per refresh).
const TALENT_FUNNEL_TENANTS: Array<{
  company: string;
  industry: string;
  tenantId: string;    // Talent Funnel tenant UUID (sent as Tenant header)
  jobBaseUrl: string;  // base URL for building apply links
  routes?: Array<{ match: RegExp; industry: string; company?: string }>;
}> = [
  {
    company: "Dr. Martens",
    industry: "footwear",
    tenantId: "a3e88308-2615-4415-bb56-cc5267bc1ced",
    jobBaseUrl: "https://jobs.drmartens.com/job",
  },
];

// UK location keywords for filtering - Talent Funnel API country filter is unreliable.
const UK_LOCATION_RE = /\b(United Kingdom|UK|London|Manchester|Birmingham|Leeds|Bristol|Liverpool|Edinburgh|Glasgow|Cambridge|Oxford|Cardiff|Belfast|Nottingham|Sheffield|Newcastle|Brighton|Southampton|Northampton|Northamptonshire|Wellingborough|Milton Keynes|(?<!New )York|Bicester|Dublin)\b/i;
const UK_COMPANY_RE = /\bDr\.\s*Martens\s*UK\b/i;

async function fetchTalentFunnelJobs(
  tenant: typeof TALENT_FUNNEL_TENANTS[number],
) {
  const allJobs: any[] = [];
  const seenIds = new Set<string>();

  try {
    const res = await fetch("https://ats-api.talent-funnel.com/js/search/vacancy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Tenant": tenant.tenantId,
      },
      body: JSON.stringify({
        limit: 500,
        start: 0,
        sort: [{ order: "DESC", field: "createdDateTime" }],
        fields: [
          "id", "category", "company", "description", "hoursType",
          "jobTitle", "location", "remuneration", "applicationUrl",
          "validFrom", "validTo",
        ],
      }),
    });

    if (!res.ok) {
      console.error(`TalentFunnel ${tenant.company}: HTTP ${res.status}`);
      await res.text();
      return allJobs;
    }

    const data = await res.json();
    const items: any[] = data?.items ?? data?.results ?? [];

    for (const item of items) {
      const id = item.id;
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);

      const title = item.jobTitle?.trim();
      if (!title) continue;

      const city = item.location?.city ?? null;
      const country = item.location?.country ?? null;
      const companyName = item.company?.name ?? tenant.company;
      const locationStr = [city, country].filter(Boolean).join(", ");

      // Filter to UK/Ireland jobs only - use country field when available.
      const NON_UK_COUNTRIES = /\b(United States|US|USA|Germany|France|Italy|Spain|Netherlands|Austria|Japan|India|Philippines|Korea|Brazil|Colombia|South Africa|Belgium|Denmark|Sweden|Mexico)\b/i;
      if (country && NON_UK_COUNTRIES.test(country)) continue;
      const isUk = UK_COMPANY_RE.test(companyName) ||
                   (country && /United Kingdom|Ireland/i.test(country)) ||
                   UK_LOCATION_RE.test(locationStr) ||
                   UK_LOCATION_RE.test(city ?? "");
      if (!isUk) continue;

      const hoursType = (item.hoursType ?? "").toLowerCase();
      const isPartTime = hoursType.includes("part");
      const category = item.category?.name ?? null;
      const salary = item.remuneration ?? null;
      const description = item.description
        ? item.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500)
        : (category ? `${category} role at ${tenant.company}.` : null);

      // Build apply URL from job ID
      const url = item.applicationUrl || `${tenant.jobBaseUrl}/${id}`;

      // Sub-brand routing.
      let industry = tenant.industry;
      let company = tenant.company;
      if (tenant.routes) {
        const haystack = `${title} ${category ?? ""}`;
        for (const route of tenant.routes) {
          if (route.match.test(haystack)) {
            industry = route.industry;
            if (route.company) company = route.company;
            break;
          }
        }
      }

      const { stage, roleCategory } = classifyJob(title, category ?? "", industry);

      allJobs.push({
        title: title.slice(0, 255),
        company: (company || companyName).slice(0, 200),
        industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: locationStr?.slice(0, 200) || null,
        type: isPartTime ? "Part-time" : "Full-time",
        work_mode: /remote/i.test(title) || /remote/i.test(locationStr) ? "Remote" : "On-site",
        salary: typeof salary === "string" ? salary.slice(0, 120) : null,
        description,
        url,
        source_url: "jobs.drmartens.com",
        expires_at: item.validTo || new Date(Date.now() + 60 * 86400000).toISOString(),
      });
    }
  } catch (err) {
    console.error(`TalentFunnel ${tenant.company} error:`, err);
  }

  console.log(`TalentFunnel[${tenant.company}]: ${allJobs.length} UK jobs ingested (direct API)`);
  return allJobs;
}

// ── Eploy ATS (Firecrawl-rendered SSR list) ───────────────────────────
// Eploy powers careers sites for several UK retail brands (Dunelm, Hotter,
// Mountain Warehouse, etc.). The vacancy list is server-rendered ASP.NET
// HTML, but the markup is heavy and inconsistent across themes - Firecrawl's
// markdown extraction normalises it into clean cards we can parse cheaply.
//
// Each tenant's `?pagesize=100` URL returns the entire UK vacancy list in
// one response, so this is one Firecrawl credit per tenant per refresh.
const EPLOY_TENANTS: Array<{
  company: string;
  industry: string;
  /** Listing URL - append/override pagesize=100 to fit everything on one page. */
  baseUrl: string;
  /** Hostname stored in source_url for attribution + dedupe. */
  host: string;
  routes?: Array<{ match: RegExp; industry: string; company?: string }>;
}> = [
  {
    company: "Dunelm",
    industry: "interior-design",
    baseUrl: "https://www.dunelmcareers.com/vacancies/vacancy-search-results.aspx?pagesize=100",
    host: "dunelmcareers.com",
    // Most Dunelm roles are stores (retail) or head-office. Route store/sales
    // roles to retail-style fashion footprint? No - keep them all in
    // interior-design since Dunelm IS the interior-design retailer.
  },
];

async function fetchEployJobs(
  tenant: typeof EPLOY_TENANTS[number],
  firecrawlKey: string,
) {
  const allJobs: any[] = [];
  const seenUrls = new Set<string>();

  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: tenant.baseUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!res.ok) {
      console.error(`Eploy ${tenant.company}: HTTP ${res.status}`);
      return allJobs;
    }

    const data = await res.json();
    const root = data?.data ?? data;
    const markdown: string = root?.markdown ?? "";
    if (!markdown) {
      console.warn(`Eploy ${tenant.company}: empty markdown`);
      return allJobs;
    }

    // Split markdown into job blocks. Each card starts with `## [Title](url)`
    // followed by metadata lines and ends before the next `## [` or end of doc.
    const blockRe = /## \[([^\]]+?)\]\((https?:\/\/[^)]*\/vacancies\/\d+\/[^)]+)\)([\s\S]*?)(?=\n## \[|$)/g;
    let m: RegExpExecArray | null;
    while ((m = blockRe.exec(markdown)) !== null) {
      const title = m[1].trim();
      const url = m[2].split("?")[0];
      const block = m[3];
      if (!title || !url || seenUrls.has(url)) continue;
      seenUrls.add(url);

      const lines = block.split(/\n+/).map((l) => l.trim()).filter(Boolean);

      // Location: the first short line that isn't a label/meta/CTA.
      const SKIP_RE = /^(posted on|_all locations_|all locations|_position_|_vacancy type_|_salary_|hybrid|non-hybrid|apply|more info|save job|salary|pay|position|vacancy type)\b/i;
      let location: string | null = null;
      for (const l of lines) {
        const stripped = l.replace(/[*_]/g, "").trim();
        if (!stripped) continue;
        if (SKIP_RE.test(stripped)) continue;
        if (/^\[/.test(stripped)) continue; // skip link-only lines
        if (stripped.length > 60) continue;  // descriptions are long
        if (/^[\d/]+$/.test(stripped)) continue; // dates
        location = stripped;
        break;
      }

      // Salary - first line containing £ or "per hour".
      let salary: string | null = null;
      for (const l of lines) {
        if (/£|per hour|per annum/i.test(l)) {
          salary = l.replace(/[*_]/g, "").trim().slice(0, 160);
          break;
        }
      }

      // Vacancy type for full/part-time signal.
      const blockLower = block.toLowerCase();
      const isPartTime = /part[\s-]?time|\bhrs? per week\b/.test(blockLower);
      const isFullTime = /full[\s-]?time|permanent|fixed term/.test(blockLower);

      // Sub-brand routing (none for Dunelm currently).
      let industry = tenant.industry;
      let company = tenant.company;
      if (tenant.routes) {
        for (const route of tenant.routes) {
          if (route.match.test(title)) {
            industry = route.industry;
            if (route.company) company = route.company;
            break;
          }
        }
      }

      const { stage, roleCategory } = classifyJob(title, "", industry);

      allJobs.push({
        title: title.slice(0, 255),
        company: company.slice(0, 200),
        industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: location?.slice(0, 200) ?? null,
        type: isPartTime && !isFullTime ? "Part-time" : "Full-time",
        work_mode: /remote/i.test(title) || /remote/i.test(location ?? "") ? "Remote" : "On-site",
        salary,
        description: null,
        url,
        source_url: tenant.host,
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      });
    }

    console.log(`Eploy[${tenant.company}]: ${allJobs.length} UK jobs ingested`);
    return allJobs;
  } catch (err) {
    console.error(`Eploy fetch error for "${tenant.company}":`, err);
    return allJobs;
  }
}

// ── Careers in Racing (Madgex job board, BHA-affiliated) ──────────────
// Source #13 - direct scrape of UK horse-racing's official sectoral board.
// Uses Firecrawl to render the JS-driven category pages, then parses the
// markdown listing cards (title, location, salary, company, snippet).
// ~5 category pages per refresh = ~5 Firecrawl scrape credits/day.
const CAREERSINRACING_CATEGORIES = [
  "horse-care",
  "grounds-and-maintenance",
  "office-and-administration",
  "marketing-pr-and-comms",
  "hospitality-and-events",
  "finance-and-it",
  "hr-and-training",
  "management-and-legal",
  "media-and-journalism",
  "sales-and-sponsorship",
  "apprenticeship",
];

function titleFromCareersInRacingUrl(url: string) {
  const slug = url.match(/\/job\/\d+\/([^/]+)\//)?.[1] || "horse-racing-role";
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.length <= 3 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1))
    .join(" ")
    .slice(0, 255);
}

function cleanHtmlText(value: string | null | undefined): string {
  return decodeXmlEntities(String(value || ""))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.length <= 3 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .slice(0, 255);
}

async function fetchCareersInRacingSitemapJobs() {
  const allJobs: any[] = [];
  const seenUrls = new Set<string>();

  try {
    const indexRes = await fetch("https://jobs.careersinracing.com/sitemapindex.xml", {
      headers: { "User-Agent": "howdoyoudo-bot/1.0" },
    });
    if (!indexRes.ok) {
      console.warn(`[horse-racing] CIR sitemap index HTTP ${indexRes.status}`);
      return allJobs;
    }

    const indexXml = await indexRes.text();
    const sitemapUrls = Array.from(indexXml.matchAll(/<loc>(https:\/\/jobs\.careersinracing\.com\/sitemap2[^<]+\.xml)<\/loc>/g))
      .map((m) => m[1]);

    for (const sitemapUrl of sitemapUrls) {
      const sitemapRes = await fetch(sitemapUrl, {
        headers: { "User-Agent": "howdoyoudo-bot/1.0" },
      });
      if (!sitemapRes.ok) {
        console.warn(`[horse-racing] CIR sitemap ${sitemapUrl}: HTTP ${sitemapRes.status}`);
        continue;
      }

      const sitemapXml = await sitemapRes.text();
      const jobUrls = Array.from(sitemapXml.matchAll(/<loc>(https:\/\/jobs\.careersinracing\.com\/job\/\d+\/[^<]+)<\/loc>/g))
        .map((m) => m[1]);

      for (const link of jobUrls) {
        if (seenUrls.has(link)) continue;
        seenUrls.add(link);

        const cleanTitle = titleFromCareersInRacingUrl(link);
        const { stage, roleCategory } = classifyJob(cleanTitle, "Official Careers in Racing live job listing", "horse-racing");
        allJobs.push({
          title: cleanTitle,
          company: "Careers in Racing",
          industry: "horse-racing",
          value_chain_stage: stage,
          role_category: roleCategory,
          location: null,
          type: /apprentice/i.test(cleanTitle) ? "Apprenticeship" : /part[\s-]?time/i.test(cleanTitle) ? "Part-time" : "Full-time",
          work_mode: "On-site",
          salary: null,
          description: "Official live listing from the Careers in Racing jobs board.",
          url: link,
          source_url: "careersinracing.com",
          expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        });
      }
    }
  } catch (err) {
    console.error("[horse-racing] CIR sitemap error:", err);
  }

  console.log(`[horse-racing] CareersInRacing sitemap: ${allJobs.length} jobs`);
  return allJobs;
}

async function fetchYardAndGroomJobs() {
  const allJobs: any[] = [];
  const seenUrls = new Set<string>();
  const MAX_PAGES = 4;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://www.yardandgroom.com/jobs/UK?industry=horse-racing&page=${page}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; howdoyoudo.jobs/1.0)",
          Accept: "text/html",
        },
      });
      if (!res.ok) {
        console.warn(`[horse-racing] Yard&Groom p${page}: HTTP ${res.status}`);
        break;
      }
      const html = await res.text();
      const cards = Array.from(html.matchAll(/<li class="card searchresult searchresult-job[\s\S]*?<\/li>/g));
      if (cards.length === 0) break;

      for (const cardMatch of cards) {
        const card = cardMatch[0];
        const hrefMatch = card.match(/href="(\/Job\/UK\/[^"#]+\/\d+)"[^>]*class="[^"]*job-listing-title/i)
          || card.match(/href="(\/Job\/UK\/[^"#]+\/\d+)"/i);
        if (!hrefMatch) continue;
        const link = `https://www.yardandgroom.com${hrefMatch[1]}`;
        if (seenUrls.has(link)) continue;
        seenUrls.add(link);

        const titleMatch = card.match(/class="[^"]*job-listing-title[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
        const slugTitle = link.match(/\/Job\/UK\/[^/]+\/([^/]+)\/\d+$/)?.[1] || "horse-racing-role";
        const title = (cleanHtmlText(titleMatch?.[1]) || titleFromSlug(slugTitle)).slice(0, 255);
        if (!title) continue;

        const metaMatch = card.match(/<span class="job-listing-employer-address">([\s\S]*?)<\/span>/i);
        const meta = cleanHtmlText(metaMatch?.[1]);
        const metaParts = meta.split("|").map((part) => part.trim()).filter(Boolean);
        const companyHint = metaParts[0] || "Yard and Groom";
        const location = (metaParts.slice(1).join(", ") || "United Kingdom").slice(0, 200);

        const typeBlock = cleanHtmlText(card.match(/<span class="job-listing-employment-types-times">([\s\S]*?)<\/span>/i)?.[1]);
        const salaryMatch = typeBlock.match(/£\s?\d+(?:[,.]\d+)?(?:\s*(?:to|-|–)\s*£?\s?\d+(?:[,.]\d+)?)?\s*(?:hour|day|week|month|year|annum)?/i);
        const jobType = /part[\s-]?time/i.test(typeBlock) && !/full[\s-]?time/i.test(typeBlock) ? "Part-time"
          : /temporary|freelance|contract/i.test(typeBlock) ? "Contract"
          : /apprentice/i.test(typeBlock + " " + title) ? "Apprenticeship"
          : "Full-time";

        const desc = cleanHtmlText(card.match(/<p>([\s\S]*?)<\/p>/i)?.[1]) || `${title} via Yard and Groom. Location: ${location}.`;
        const { stage, roleCategory } = classifyJob(title, desc, "horse-racing");

        allJobs.push({
          title,
          company: companyHint === "Employer" || companyHint === "Jobseeker" ? "Yard and Groom" : companyHint.slice(0, 200),
          industry: "horse-racing",
          value_chain_stage: stage,
          role_category: roleCategory,
          location,
          type: jobType,
          work_mode: /remote|home[\s-]?based/i.test(location) ? "Remote" : "On-site",
          salary: salaryMatch?.[0]?.slice(0, 200) ?? null,
          description: desc.slice(0, 2000) || null,
          url: link,
          source_url: "yardandgroom.com",
          expires_at: new Date(Date.now() + 45 * 86400000).toISOString(),
        });
      }
    } catch (err) {
      console.error(`[horse-racing] Yard&Groom p${page} error:`, err);
      break;
    }
  }

  console.log(`[horse-racing] Yard&Groom: ${allJobs.length} jobs parsed`);
  return allJobs;
}

async function fetchArenaRacingCompanyJobs() {
  const allJobs: any[] = [];
  const seenUrls = new Set<string>();
  const url = "https://careers.arenaracingcompany.co.uk/asp.html?snippet=jobListingREACH&descLen=400&showResults=1&showSearch=0&feed=employees,casuals";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; howdoyoudo.jobs/1.0)",
        Accept: "text/html",
      },
    });
    if (!res.ok) {
      console.warn(`[horse-racing] ARC: HTTP ${res.status}`);
      return allJobs;
    }

    const html = await res.text();
    const rows = Array.from(html.matchAll(/<div class="list-row">([\s\S]*?)(?=<div class="list-row">|$)/g));
    for (const rowMatch of rows) {
      const row = rowMatch[1];
      const title = cleanHtmlText(row.match(/<strong>([\s\S]*?)<\/strong>/i)?.[1]).slice(0, 255);
      const applyUrl = cleanHtmlText(row.match(/href="(https:\/\/(?:candidate|casuals)\.arenaracingcompany\.co\.uk\/[^"]+)"/i)?.[1]);
      if (!title || !applyUrl || seenUrls.has(applyUrl)) continue;
      seenUrls.add(applyUrl);

      const type = cleanHtmlText(row.match(/<h4>Type<\/h4>([\s\S]*?)<\/div>/i)?.[1]);
      const salary = cleanHtmlText(row.match(/<h4>Salary<\/h4>([\s\S]*?)<\/div>/i)?.[1]) || null;
      const location = (cleanHtmlText(row.match(/<h4>Location<\/h4>([\s\S]*?)<\/div>/i)?.[1]) || "United Kingdom").slice(0, 200);
      const desc = cleanHtmlText(row.match(/<h4>Description<\/h4>\s*<p>([\s\S]*?)<\/p>/i)?.[1]) || `${title} at Arena Racing Company. Location: ${location}.`;
      const { stage, roleCategory } = classifyJob(title, desc, "horse-racing");

      allJobs.push({
        title,
        company: "Arena Racing Company",
        industry: "horse-racing",
        value_chain_stage: stage,
        role_category: roleCategory,
        location,
        type: /casual|temporary|fixed term|seasonal|contract/i.test(type + " " + applyUrl) ? "Contract"
          : /part[\s-]?time/i.test(type) && !/full[\s-]?time/i.test(type) ? "Part-time"
          : "Full-time",
        work_mode: /remote|home[\s-]?based/i.test(location) ? "Remote" : "On-site",
        salary: salary?.slice(0, 200) ?? null,
        description: desc.slice(0, 2000) || null,
        url: applyUrl,
        source_url: "careers.arenaracingcompany.co.uk",
        expires_at: new Date(Date.now() + 45 * 86400000).toISOString(),
      });
    }
  } catch (err) {
    console.error("[horse-racing] ARC fetch error:", err);
  }

  console.log(`[horse-racing] Arena Racing Company: ${allJobs.length} jobs parsed`);
  return allJobs;
}

async function fetchCareersInRacingJobs(firecrawlKey: string) {
  if (!firecrawlKey) return [];
  const allJobs: any[] = [];
  const seenUrls = new Set<string>();

  for (const category of CAREERSINRACING_CATEGORIES) {
    const url = `https://jobs.careersinracing.com/jobs/${category}/`;
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
          waitFor: 1500,
        }),
      });
      if (!res.ok) {
        console.warn(`[horse-racing] CIR ${category}: HTTP ${res.status}`);
        continue;
      }
      const payload = await res.json();
      const md: string = payload?.data?.markdown ?? payload?.markdown ?? "";
      if (!md) continue;

      // Listing card pattern (one per job):
      //   ### [Title](https://jobs.careersinracing.com/job/<id>/<slug>/)
      //     - <location>
      //     - <salary or "Competitive">
      //     - <company>
      //   <description snippet>
      const cardRegex =
        /### \[([^\]]+)\]\((https:\/\/jobs\.careersinracing\.com\/job\/\d+\/[^)]+)\)\s*\n\s*\n((?:\s*-\s*[^\n]+\n)+)\s*\n([^\n]+)/g;

      let match: RegExpExecArray | null;
      let count = 0;
      while ((match = cardRegex.exec(md)) !== null) {
        const [, title, link, metaBlock, snippet] = match;
        if (seenUrls.has(link)) continue;
        seenUrls.add(link);

        const metaItems = metaBlock
          .split("\n")
          .map((l) => l.replace(/^\s*-\s*/, "").trim())
          .filter(Boolean);

        // Order on these cards is consistently: location, salary, company.
        const [location, salary, company] = [
          metaItems[0] || null,
          metaItems[1] || null,
          metaItems[2] || metaItems[metaItems.length - 1] || "Careers in Racing",
        ];

        const cleanTitle = title.trim().slice(0, 255);
        const cleanCompany = (company || "Careers in Racing").trim().slice(0, 200);
        const cleanLocation = location?.trim().slice(0, 200) ?? null;
        const cleanSalary = salary && !/^description$/i.test(salary)
          ? salary.trim().slice(0, 200)
          : null;
        const desc = snippet.trim().slice(0, 2000) || null;

        const remoteFlag = /remote/i.test(`${cleanTitle} ${cleanLocation ?? ""}`);
        const { stage, roleCategory } = classifyJob(cleanTitle, desc ?? "", "horse-racing");

        allJobs.push({
          title: cleanTitle,
          company: cleanCompany,
          industry: "horse-racing",
          value_chain_stage: stage,
          role_category: roleCategory,
          location: cleanLocation,
          type: /apprentice/i.test(cleanTitle) ? "Apprenticeship"
            : /part[\s-]?time/i.test(cleanTitle) ? "Part-time"
            : "Full-time",
          work_mode: remoteFlag ? "Remote" : "On-site",
          salary: cleanSalary,
          description: desc,
          url: link,
          source_url: "careersinracing.com",
          // Madgex listings typically auto-expire after ~30 days; honour that.
          expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        });
        count++;
      }
      console.log(`[horse-racing] CIR ${category}: ${count} jobs parsed`);
    } catch (err) {
      console.error(`[horse-racing] CIR ${category} error:`, err);
    }
  }
  return allJobs;
}

// ── Crisis (Tribepad ATS) - UK homelessness charity ─────────────────
// Source #14 - direct scrape of jobs.crisis.org.uk. Tribepad SPA renders
// listings via JS, so we use Firecrawl with a short waitFor to capture
// the rendered markdown. Typically <20 live roles, so 1 scrape per refresh.
async function fetchCrisisJobs(firecrawlKey: string) {
  if (!firecrawlKey) return [];
  const allJobs: any[] = [];
  const seenUrls = new Set<string>();

  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://jobs.crisis.org.uk/Home/Job",
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 2500,
      }),
    });
    if (!res.ok) {
      console.warn(`[charity] Crisis: HTTP ${res.status}`);
      return allJobs;
    }
    const payload = await res.json();
    const md: string = payload?.data?.markdown ?? payload?.markdown ?? "";
    if (!md) {
      console.warn("[charity] Crisis: empty markdown");
      return allJobs;
    }

    // Each job card looks like:
    //   [<Title>](https://jobs.crisis.org.uk/Job/JobDetail?JobId=NNNN)
    //   ... **Salary:** £X ... **Closing date:** DD/MM/YYYY
    //   **Department:** <dept> ... **Location:** <city>
    //   **Employment type:** <Permanent|Fixed Term|...>
    const cardRegex = /\[([^\]]+)\]\((https:\/\/jobs\.crisis\.org\.uk\/Job\/JobDetail\?JobId=\d+)\)([\s\S]*?)(?=\[[^\]]+\]\(https:\/\/jobs\.crisis\.org\.uk\/Job\/JobDetail\?JobId=\d+\)|## |Load More|$)/g;

    let match: RegExpExecArray | null;
    while ((match = cardRegex.exec(md)) !== null) {
      const [, rawTitle, link, body] = match;
      if (seenUrls.has(link)) continue;
      seenUrls.add(link);

      const title = rawTitle.trim();
      // Skip the duplicate "More.." anchor entries.
      if (/^more\.\.?$/i.test(title)) continue;

      const pick = (label: string) => {
        const m = body.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i"));
        return m ? m[1].trim() : null;
      };

      const salary = pick("Salary");
      const closingRaw = pick("Closing date");
      const department = pick("Department");
      const location = pick("Location") || "London";
      const employment = pick("Employment type") || "";

      // dd/mm/yyyy → ISO
      let expiresAt: string | null = null;
      if (closingRaw) {
        const parts = closingRaw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (parts) {
          const [, d, mo, y] = parts;
          const dt = new Date(`${y}-${mo}-${d}T23:59:59Z`);
          if (!Number.isNaN(dt.getTime()) && dt.getTime() > Date.now()) {
            expiresAt = dt.toISOString();
          } else if (!Number.isNaN(dt.getTime())) {
            // Already closed - skip.
            continue;
          }
        }
      }
      if (!expiresAt) {
        expiresAt = new Date(Date.now() + 60 * 86400000).toISOString();
      }

      const jobType = /fixed term|temporary|temp/i.test(employment) ? "Contract"
        : /part[\s-]?time/i.test(employment) ? "Part-time"
        : "Full-time";

      const desc = department ? `${department} - Crisis. Location: ${location}.` : `Crisis. Location: ${location}.`;
      const { stage, roleCategory } = classifyJob(title, desc, "charity");

      allJobs.push({
        title: title.slice(0, 255),
        company: "Crisis",
        industry: "charity",
        value_chain_stage: stage,
        role_category: roleCategory,
        location: location.slice(0, 200),
        type: jobType,
        work_mode: /remote|online/i.test(location) ? "Remote" : "On-site",
        salary: salary?.slice(0, 200) ?? null,
        description: desc.slice(0, 2000),
        url: link,
        source_url: "jobs.crisis.org.uk",
        expires_at: expiresAt,
      });
    }
    console.log(`[charity] Crisis: ${allJobs.length} jobs parsed`);
  } catch (err) {
    console.error("[charity] Crisis fetch error:", err);
  }
  return allJobs;
}

// =====================================================================
// The AA careers (WordPress-rendered listings on theaacareers.co.uk)
// ~194 live roles paginated ~20/page. We scrape the first 12 pages with
// Firecrawl (no JS wait needed - server-rendered).
// Industry: cars.
// =====================================================================
async function fetchTheAAJobs(firecrawlKey: string) {
  if (!firecrawlKey) return [];
  const allJobs: any[] = [];
  const seenUrls = new Set<string>();
  const MAX_PAGES = 12;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1
      ? "https://www.theaacareers.co.uk/apply/?s_Keywords="
      : `https://www.theaacareers.co.uk/apply/page/${page}/?s_Keywords=`;
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });
      if (!res.ok) {
        console.warn(`[cars] AA p${page}: HTTP ${res.status}`);
        break;
      }
      const payload = await res.json();
      const md: string = payload?.data?.markdown ?? payload?.markdown ?? "";
      if (!md) break;

      // Each card:
      //   ### [<Title>](<job url>)
      //   <Location>
      //   <Reference>
      //   [View](<job url>)
      const cardRegex = /###\s+\[([^\]]+)\]\((https:\/\/www\.theaacareers\.co\.uk\/apply\/job-details\/\?id=\d+[^)]*)\)\s*\n+\s*([^\n]+)\n+\s*([A-Z0-9]+)/g;

      let match: RegExpExecArray | null;
      let pageCount = 0;
      while ((match = cardRegex.exec(md)) !== null) {
        const [, rawTitle, link, locationRaw, ref] = match;
        if (seenUrls.has(link)) continue;
        seenUrls.add(link);
        pageCount++;

        const title = rawTitle.trim();
        const location = locationRaw.trim();
        const desc = `${title} at The AA. Location: ${location}. Ref: ${ref}.`;
        const { stage, roleCategory } = classifyJob(title, desc, "cars");

        const lowerTitle = title.toLowerCase();
        const jobType = /casual|temp|temporary|fixed term|seasonal/i.test(lowerTitle) ? "Contract"
          : /part[\s-]?time/i.test(lowerTitle) ? "Part-time"
          : "Full-time";

        allJobs.push({
          title: title.slice(0, 255),
          company: "The AA",
          industry: "cars",
          value_chain_stage: stage,
          role_category: roleCategory,
          location: location.slice(0, 200),
          type: jobType,
          work_mode: /remote|home[\s-]?based/i.test(location) ? "Remote" : "On-site",
          salary: null,
          description: desc.slice(0, 2000),
          url: link,
          source_url: "theaacareers.co.uk",
          // AA listings stay live until filled; default 30 days.
          expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        });
      }
      if (pageCount === 0) {
        // Empty page = end of results.
        break;
      }
    } catch (err) {
      console.error(`[cars] AA p${page} fetch error:`, err);
      break;
    }
  }
  console.log(`[cars] The AA: ${allJobs.length} jobs parsed`);
  return allJobs;
}

// =====================================================================
// Teach First - Salesforce-backed careers page on teachfirst.org.uk.
// Listings are server-rendered as plain markdown blocks. ~16 live roles
// paginated 4/page (Showing X out of Y).
// Industry: teaching.
// =====================================================================
async function fetchTeachFirstJobs(firecrawlKey: string) {
  if (!firecrawlKey) return [];
  const allJobs: any[] = [];
  const seenUrls = new Set<string>();
  const MAX_PAGES = 6;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1
      ? "https://www.teachfirst.org.uk/working-teach-first/vacancies"
      : `https://www.teachfirst.org.uk/working-teach-first/vacancies?page=${page - 1}`;
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });
      if (!res.ok) {
        console.warn(`[teaching] TeachFirst p${page}: HTTP ${res.status}`);
        break;
      }
      const payload = await res.json();
      const md: string = payload?.data?.markdown ?? payload?.markdown ?? "";
      if (!md) break;

      // Each card:
      //   ### <Title>
      //   <description paragraph(s)>
      //   Closing:<DD Mon YYYY>
      //   Location: <X>
      //   Salary: <X>
      //   Type: <X>
      //   [Apply now](https://teachfirst-peopleplatform.my.salesforce-sites.com/recruit/fRecruit__ApplyJob?vacancyNo=VN.....)
      const cardRegex = /###\s+([^\n]+)\n+([\s\S]*?)\[Apply now\]\((https:\/\/teachfirst-peopleplatform\.my\.salesforce-sites\.com\/recruit\/fRecruit__ApplyJob\?vacancyNo=VN\d+)\)/g;

      let match: RegExpExecArray | null;
      let pageCount = 0;
      while ((match = cardRegex.exec(md)) !== null) {
        const [, rawTitle, body, link] = match;
        if (seenUrls.has(link)) continue;
        seenUrls.add(link);
        pageCount++;

        const title = rawTitle.trim();
        const pick = (label: string) => {
          const m = body.match(new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, "i"));
          return m ? m[1].trim() : null;
        };

        const closingRaw = pick("Closing");
        const location = pick("Location") || "Nationwide";
        const salaryRaw = pick("Salary");
        const typeRaw = pick("Type") || "";

        // "03 May 2026" → ISO
        let expiresAt: string | null = null;
        if (closingRaw) {
          const dt = new Date(closingRaw.replace(/^:/, "").trim());
          if (!Number.isNaN(dt.getTime())) {
            if (dt.getTime() < Date.now()) continue; // expired
            // End of day to be safe
            dt.setUTCHours(23, 59, 59, 0);
            expiresAt = dt.toISOString();
          }
        }
        if (!expiresAt) {
          expiresAt = new Date(Date.now() + 60 * 86400000).toISOString();
        }

        const jobType = /fixed[\s-]?term|temp|contract/i.test(typeRaw) ? "Contract"
          : /part[\s-]?time|job share|voluntary|casual/i.test(typeRaw) ? "Part-time"
          : "Full-time";

        // Skip purely voluntary unpaid roles to keep marketplace meaningful.
        if (/voluntary/i.test(typeRaw) && /^0(\.0+)?$/.test((salaryRaw || "").replace(/[£,]/g, "").trim())) {
          continue;
        }

        // First sentence of the body as description.
        const cleanBody = body
          .replace(/\[[^\]]*\]\([^)]*\)/g, "") // strip markdown links
          .replace(/\s+/g, " ")
          .trim();
        const desc = (cleanBody.split(". ")[0] || `${title} at Teach First.`).slice(0, 2000);

        const { stage, roleCategory } = classifyJob(title, desc, "teaching");

        allJobs.push({
          title: title.slice(0, 255),
          company: "Teach First",
          industry: "teaching",
          value_chain_stage: stage,
          role_category: roleCategory,
          location: location.slice(0, 200),
          type: jobType,
          work_mode: /remote|home[\s-]?based/i.test(location) ? "Remote"
            : /hybrid/i.test(location + " " + typeRaw) ? "Hybrid"
            : "On-site",
          salary: salaryRaw && !/^0(\.0+)?$/.test(salaryRaw.replace(/[£,]/g, "").trim()) ? salaryRaw.slice(0, 200) : null,
          description: desc,
          url: link,
          source_url: "teachfirst.org.uk",
          expires_at: expiresAt,
        });
      }
      if (pageCount === 0) break;
    } catch (err) {
      console.error(`[teaching] TeachFirst p${page} fetch error:`, err);
      break;
    }
  }
  console.log(`[teaching] Teach First: ${allJobs.length} jobs parsed`);
  return allJobs;
}

// =====================================================================
// TUI Group careers (careers.tuigroup.com) - Radancy / TalentBrew board.
// Returns HTML-in-JSON via /en/search-jobs/results. ~314 jobs total
// across all countries; we filter to UK by location string. Includes
// cabin crew, pilots, retail travel advisors, head office, and
// engineering roles. No API key required.
// Industry: travel.
// =====================================================================
async function fetchTuiCareersJobs() {
  const allJobs: any[] = [];
  const seenIds = new Set<string>();
  const PER_PAGE = 50;
  const MAX_PAGES = 12; // safety cap (12 * 50 = 600, well above current ~314 total)

  const decode = (s: string) => s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ");

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://careers.tuigroup.com/en/search-jobs/results?CurrentPage=${page}&RecordsPerPage=${PER_PAGE}&SearchType=5&SortCriteria=0&SortDirection=0`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0; +https://howdoyoudo.co.uk)",
          "Accept": "application/json,text/html",
        },
      });
      if (!res.ok) {
        console.warn(`[travel] TUI p${page}: HTTP ${res.status}`);
        break;
      }
      const payload: any = await res.json().catch(() => null);
      const html: string = payload?.results ?? "";
      if (!html) break;

      const liRegex = /<li class="section12-search-results__item[^>]*>([\s\S]*?)<\/li>/g;
      let m: RegExpExecArray | null;
      let pageCount = 0;
      while ((m = liRegex.exec(html)) !== null) {
        const li = m[1];
        const hrefM = li.match(/href="(\/en\/job\/[^"]+)"/);
        const idM = li.match(/data-job-id="(\d+)"/);
        const titleM = li.match(/<h3 class="job-list-v1__title">([^<]+)<\/h3>/);
        const locM = li.match(/class="job-location[^"]*"[^>]*>\s*([^<]+?)\s*<\/span>/);
        const wpM = li.match(/class="job-list-v1__workplace[^"]*"[^>]*>\s*([^<]+?)\s*<\/span>/);
        if (!hrefM || !titleM || !idM) continue;

        const jobId = idM[1];
        if (seenIds.has(jobId)) continue;
        seenIds.add(jobId);

        const link = `https://careers.tuigroup.com${hrefM[1]}`;
        const title = decode(titleM[1]).trim();
        const location = locM ? decode(locM[1]).trim() : "";
        const workplace = wpM ? wpM[1].trim() : "";

        // UK-only filter — keep jobs explicitly tagged United Kingdom.
        if (!/united kingdom|^uk$|\buk\b/i.test(location)) continue;

        pageCount++;
        const desc = `${title} at TUI. Location: ${location}.`;
        const { stage, roleCategory } = classifyJob(title, desc, "travel");
        const workMode = /remote|home[\s-]?based/i.test(location) || /remote/i.test(workplace)
          ? "Remote"
          : /hybrid/i.test(workplace) ? "Hybrid" : "On-site";

        allJobs.push({
          title: title.slice(0, 255),
          company: "TUI",
          industry: "travel",
          value_chain_stage: stage,
          role_category: roleCategory,
          location: (location || "United Kingdom").slice(0, 200),
          type: "Full-time",
          work_mode: workMode,
          salary: null,
          description: desc.slice(0, 2000),
          url: link,
          source_url: "careers.tuigroup.com",
          expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        });
      }
      // Pagination ends when a page returns no <li> items at all.
      const totalLi = (html.match(/<li class="section12-search-results__item/g) || []).length;
      if (totalLi < PER_PAGE) break; // last page
      if (pageCount === 0 && totalLi === 0) break;
    } catch (err) {
      console.error(`[travel] TUI p${page} fetch error:`, err);
      break;
    }
  }
  console.log(`[travel] TUI careers: ${allJobs.length} UK jobs parsed`);
  return allJobs;
}


// =====================================================================
// Ryanair careers (careers.ryanair.com) - WordPress static HTML.
// Lists ~10 jobs per page across departments & locations Europe-wide.
// UK-filter on location text. No key, free.
// Industry: travel.
// =====================================================================
async function fetchRyanairCareersJobs() {
  const allJobs: any[] = [];
  const seenUrls = new Set<string>();
  const MAX_PAGES = 15;

  const decode = (s: string) => s
    .replace(/&amp;/g, "&").replace(/&#8211;/g, "–").replace(/&#8217;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ").replace(/&#0?38;/g, "&");

  const UK_LOC_RX = /(united kingdom|\bU\.?K\.?\b|stansted|manchester|edinburgh|bristol|birmingham|liverpool|east midlands|leeds|glasgow|prestwick|newcastle|belfast|cardiff|bournemouth|luton|gatwick|heathrow|london|aberdeen|exeter|southampton)/i;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1
      ? "https://careers.ryanair.com/jobs/"
      : `https://careers.ryanair.com/jobs/?page=${page}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0; +https://howdoyoudo.co.uk)" },
      });
      if (!res.ok) {
        console.warn(`[travel] Ryanair p${page}: HTTP ${res.status}`);
        break;
      }
      const html = await res.text();

      // Each job is an <li class="job"> ... </li> block.
      const liRegex = /<li class="job">([\s\S]*?)<\/li>/g;
      let m: RegExpExecArray | null;
      let pageCount = 0;
      while ((m = liRegex.exec(html)) !== null) {
        const li = m[1];
        const titleM = li.match(/<h2 class="job__title"><a href="([^"]+)">([\s\S]*?)<\/a><\/h2>/);
        if (!titleM) continue;
        const link = titleM[1];
        if (seenUrls.has(link)) continue;
        seenUrls.add(link);
        const title = decode(titleM[2].replace(/<[^>]+>/g, "")).trim();

        // Extract location terms block.
        const locBlockM = li.match(/job-terms__icon--ryanair-jobs-location[\s\S]*?<\/p>/);
        const locBlock = locBlockM ? locBlockM[0] : "";
        const locParts = Array.from(locBlock.matchAll(/<a[^>]*>([^<]+)<\/a>/g))
          .map((x) => decode(x[1]).trim());
        const location = locParts.join(", ");

        // Department block (for description colour).
        const deptBlockM = li.match(/job-terms__icon--ryanair-jobs-department[\s\S]*?<\/p>/);
        const deptBlock = deptBlockM ? deptBlockM[0] : "";
        const dept = Array.from(deptBlock.matchAll(/<a[^>]*>([^<]+)<\/a>/g))
          .map((x) => decode(x[1]).trim()).join(", ");

        if (!UK_LOC_RX.test(location)) continue;

        pageCount++;
        const desc = `${title} at Ryanair${dept ? ` (${dept})` : ""}. Location: ${location}.`;
        const { stage, roleCategory } = classifyJob(title, desc, "travel");

        allJobs.push({
          title: title.slice(0, 255),
          company: "Ryanair",
          industry: "travel",
          value_chain_stage: stage,
          role_category: roleCategory,
          location: (location || "United Kingdom").slice(0, 200),
          type: "Full-time",
          work_mode: "On-site",
          salary: null,
          description: desc.slice(0, 2000),
          url: link,
          source_url: "careers.ryanair.com",
          expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        });
      }

      // Stop when no more pagination links beyond current page.
      const hasNext = new RegExp(`href="https://careers\\.ryanair\\.com/jobs/\\?page=${page + 1}"`).test(html);
      if (!hasNext) break;
      if (pageCount === 0 && page > 1) break;
    } catch (err) {
      console.error(`[travel] Ryanair p${page} fetch error:`, err);
      break;
    }
  }
  console.log(`[travel] Ryanair careers: ${allJobs.length} UK jobs parsed`);
  return allJobs;
}


// =====================================================================
// easyJet careers (easyjet.taleo.net) - Oracle Taleo RSS feed.
// Returns 25 most-recently-posted jobs; ~88% are UK (London Luton,
// Gatwick, Bristol, Edinburgh). Title or description usually includes
// the city. No key, free, 1 HTTP call per refresh.
// Industry: travel.
// =====================================================================
async function fetchEasyJetCareersJobs() {
  const allJobs: any[] = [];
  const url = "https://easyjet.taleo.net/careersection/feed/joblist.rss?lang=en&portal=101430233&searchtype=3&f=null&s=5%7CA&a=null&multiline=true";

  const decode = (s: string) => s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ").replace(/&#13;/g, " ");

  const NON_UK_RX = /\b(barcelona|berlin|vienna|paris|amsterdam|milan|rome|madrid|lisbon|geneva|zurich|prague|warsaw|krakow)\b/i;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0; +https://howdoyoudo.co.uk)" },
    });
    if (!res.ok) {
      console.warn(`[travel] easyJet RSS: HTTP ${res.status}`);
      return allJobs;
    }
    const xml = await res.text();

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let m: RegExpExecArray | null;
    while ((m = itemRegex.exec(xml)) !== null) {
      const it = m[1];
      const titleM = it.match(/<title>([\s\S]*?)<\/title>/);
      const linkM = it.match(/<link>([\s\S]*?)<\/link>/);
      const descM = it.match(/<description>([\s\S]*?)<\/description>/);
      if (!titleM || !linkM) continue;

      const title = decode(titleM[1]).trim();
      const link = decode(linkM[1]).trim();
      const rawDesc = descM ? decode(descM[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim() : "";

      // Filter obvious non-UK postings if city in title.
      if (NON_UK_RX.test(title)) continue;

      // Infer location from common easyJet airport tokens.
      let location = "United Kingdom";
      if (/luton|\bLTN\b/i.test(title)) location = "London Luton, United Kingdom";
      else if (/gatwick|\bLGW\b/i.test(title)) location = "London Gatwick, United Kingdom";
      else if (/bristol|\bBRS\b/i.test(title)) location = "Bristol, United Kingdom";
      else if (/edinburgh|\bEDI\b/i.test(title)) location = "Edinburgh, United Kingdom";
      else if (/manchester|\bMAN\b/i.test(title)) location = "Manchester, United Kingdom";
      else if (/london/i.test(title)) location = "London, United Kingdom";

      const desc = `${title} at easyJet. ${rawDesc}`.trim();
      const { stage, roleCategory } = classifyJob(title, desc, "travel");

      allJobs.push({
        title: title.slice(0, 255),
        company: "easyJet",
        industry: "travel",
        value_chain_stage: stage,
        role_category: roleCategory,
        location: location.slice(0, 200),
        type: "Full-time",
        work_mode: "On-site",
        salary: null,
        description: desc.slice(0, 2000),
        url: link,
        source_url: "easyjet.taleo.net",
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      });
    }
  } catch (err) {
    console.error(`[travel] easyJet RSS fetch error:`, err);
  }
  console.log(`[travel] easyJet careers: ${allJobs.length} UK jobs parsed`);
  return allJobs;
}





// =====================================================================
// Jibe Apply (iCIMS-backed) ingester.
// Booking.com and several other enterprise iCIMS customers wrap their
// public job board with Jibe Apply (<tenant>.jibeapply.com). The
// `/api/jobs?limit=100&page=N` endpoint returns clean JSON jobs with
// rich location data, no API key required.
//
// Free, no key. ~2 HTTP calls per tenant per refresh.
// UK-only filter via `country_code === 'GB'`.
// =====================================================================
type JibeTenant = { slug: string; company: string; industry: string };

const JIBE_TENANTS: JibeTenant[] = [
  // Booking.com - main London/Manchester tech & commercial roles. ~7-15 UK live.
  { slug: "workingatbooking", company: "Booking.com", industry: "travel" },
];

async function fetchJibeApplyJobs(tenant: JibeTenant) {
  const allJobs: any[] = [];
  const PER_PAGE = 100;
  const MAX_PAGES = 5; // up to 500 jobs per tenant before paging out

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const res = await fetch(
        `https://${tenant.slug}.jibeapply.com/api/jobs?limit=${PER_PAGE}&page=${page}`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) {
        console.warn(`[${tenant.industry}] Jibe(${tenant.slug}) p${page}: HTTP ${res.status}`);
        break;
      }
      const data: any = await res.json().catch(() => null);
      const jobs: any[] = Array.isArray(data?.jobs) ? data.jobs : [];
      if (jobs.length === 0) break;

      for (const wrapper of jobs) {
        const j = wrapper?.data;
        if (!j) continue;
        // UK-only filter.
        if (j.country_code !== "GB" && !/united kingdom/i.test(j.country || "")) continue;

        const title: string = (j.title || "").toString();
        const location: string = (j.short_location || j.full_location || j.city || "United Kingdom").toString();
        // Apply URL goes to iCIMS hosted apply flow; prefer that over slug-only.
        const link: string = (j.apply_url || `https://${tenant.slug}.jibeapply.com/jobs/${j.slug}`).toString();
        const descHtml: string = (j.description || "").toString();
        const desc = descHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

        const { stage, roleCategory } = classifyJob(title, desc, tenant.industry);
        const employmentType: string = (j.employment_type || "FULL_TIME").toString();
        const jobType = /PART/i.test(employmentType) ? "Part-time"
          : /CONTRACT|TEMP/i.test(employmentType) ? "Contract"
          : /INTERN/i.test(employmentType) ? "Internship"
          : "Full-time";

        const expiresAt = j.posted_date
          ? new Date(new Date(j.posted_date).getTime() + 60 * 86400000).toISOString()
          : new Date(Date.now() + 60 * 86400000).toISOString();

        allJobs.push({
          title: title.slice(0, 255),
          company: tenant.company,
          industry: tenant.industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: location.slice(0, 200),
          type: jobType,
          work_mode: /remote/i.test(location) ? "Remote" : "On-site",
          salary: null,
          description: desc.slice(0, 2000),
          url: link,
          source_url: `${tenant.slug}.jibeapply.com`,
          expires_at: expiresAt,
        });
      }

      // Stop when last page is short.
      if (jobs.length < PER_PAGE) break;
    } catch (err) {
      console.error(`[${tenant.industry}] Jibe(${tenant.slug}) p${page} fetch error:`, err);
      break;
    }
  }
  console.log(`[${tenant.industry}] Jibe(${tenant.slug}): ${allJobs.length} UK jobs parsed`);
  return allJobs;
}


// =====================================================================
// DICE - Greenhouse JSON API. No key needed, single GET, ~10 roles.
// Industry: music.
// =====================================================================
async function fetchDiceJobs() {
  const allJobs: any[] = [];
  try {
    const res = await fetch(
      "https://boards-api.greenhouse.io/v1/boards/dicefm-careers/jobs?content=true",
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) {
      console.warn(`[music] DICE: HTTP ${res.status}`);
      return allJobs;
    }
    const payload = await res.json();
    const jobs: any[] = Array.isArray(payload?.jobs) ? payload.jobs : [];

    for (const j of jobs) {
      const title = String(j?.title || "").trim();
      const link = String(j?.absolute_url || "").trim();
      if (!title || !link) continue;

      const location = String(j?.location?.name || "London").trim();
      // Strip HTML from content for description.
      const html = String(j?.content || "");
      const text = html
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      const desc = (text.split(". ")[0] || `${title} at DICE.`).slice(0, 2000);

      // Filter to UK-relevant roles (DICE is global). Keep UK + Remote UK + Europe HQ roles.
      const lowerLoc = location.toLowerCase();
      const isUk = /united kingdom|uk|london|manchester|leeds|bristol|birmingham|edinburgh|glasgow|remote/i.test(lowerLoc);
      if (!isUk) continue;

      const { stage, roleCategory } = classifyJob(title, desc, "music");

      allJobs.push({
        title: title.slice(0, 255),
        company: "DICE",
        industry: "music",
        value_chain_stage: stage,
        role_category: roleCategory,
        location: location.slice(0, 200),
        type: "Full-time",
        work_mode: /remote/i.test(lowerLoc) ? "Remote"
          : /hybrid/i.test(lowerLoc) ? "Hybrid"
          : "On-site",
        salary: null,
        description: desc,
        url: link,
        source_url: "greenhouse.io",
        // Greenhouse listings stay live until the employer pulls them; default 30 days.
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      });
    }
  } catch (err) {
    console.error("[music] DICE fetch error:", err);
  }
  console.log(`[music] DICE: ${allJobs.length} jobs parsed`);
  return allJobs;
}

// ── Generic Greenhouse API scraper ──────────────────────────────────
// boards-api.greenhouse.io is a free public REST API, no auth needed.
// Each tenant costs exactly 1 HTTP call per refresh.
type GreenhouseTenant = {
  board: string;
  company: string;
  industry: string;
  allUk?: boolean;
  routes?: Array<{ match: RegExp; industry: string; company?: string }>;
};

const GREENHOUSE_TENANTS: GreenhouseTenant[] = [
  { board: "monzo",           company: "Monzo",          industry: "money",       allUk: true },
  { board: "sothebys",        company: "Sotheby's",      industry: "fashion",     allUk: false },
  { board: "butternutbox",    company: "Butternut Box",   industry: "pets",        allUk: true },
  { board: "whalarinc",       company: "Whalar",          industry: "influencing", allUk: false },
  { board: "rightmovecareers", company: "Rightmove",     industry: "estate-agency", allUk: true },
  { board: "a24",              company: "A24",            industry: "cinema",        allUk: false },
  { board: "gymshark",         company: "Gymshark",       industry: "wellness",      allUk: false },
  { board: "airbnb",           company: "Airbnb",         industry: "travel",        allUk: false },
  { board: "skyscanner",       company: "Skyscanner",     industry: "travel",        allUk: false },
  { board: "jdsports",         company: "JD Sports",      industry: "fashion",       allUk: false },
  { board: "dicefm-careers",   company: "DICE",           industry: "music",         allUk: false },
  { board: "aegpresents",      company: "AEG Presents",   industry: "music",         allUk: false },
  { board: "bmg",              company: "BMG",            industry: "music",         allUk: false },
  { board: "prsformusic",      company: "PRS for Music",  industry: "music",         allUk: true  },
  { board: "concord",          company: "Concord Music",  industry: "music",         allUk: false },
  { board: "hospitalrecords",  company: "Hospital Records", industry: "music",       allUk: true  },
  // Music
  { board: "kobalt",           company: "Kobalt Music",     industry: "music",       allUk: false },
  { board: "beggarsgroup",     company: "Beggars Group",    industry: "music",       allUk: true  },
  // Cinema / Film & TV / VFX
  { board: "framestore",       company: "Framestore",       industry: "cinema",      allUk: true  },
  { board: "dneg",             company: "DNEG",             industry: "cinema",      allUk: true  },
  { board: "everymancinema",   company: "Everyman Cinema",  industry: "cinema",      allUk: true  },
  { board: "themill",          company: "The Mill",         industry: "cinema",      allUk: true  },
  { board: "cinesite",         company: "Cinesite",         industry: "cinema",      allUk: true  },
  { board: "lionsgate",        company: "Lionsgate",        industry: "cinema",      allUk: false },
  // Journalism / Media
  { board: "reach",            company: "Reach plc",        industry: "journalism",  allUk: true  },
  { board: "theguardian",      company: "The Guardian",     industry: "journalism",  allUk: true  },
  { board: "hearstuk",         company: "Hearst UK",        industry: "journalism",  allUk: true  },
  { board: "gbnews",           company: "GB News",          industry: "journalism",  allUk: true  },
  { board: "telegraph",        company: "The Telegraph",    industry: "journalism",  allUk: true  },
  // Footwear
  { board: "drmartens",        company: "Dr. Martens",      industry: "footwear",    allUk: false },
  { board: "schuh",            company: "Schuh",            industry: "footwear",    allUk: true  },
  // Gaming
  { board: "sega",             company: "SEGA",             industry: "gaming",      allUk: false },
  { board: "wargaming",        company: "Wargaming",        industry: "gaming",      allUk: false },
  // Beer
  { board: "brewdog",          company: "BrewDog",          industry: "beer",        allUk: true  },
  { board: "greeneking",       company: "Greene King",      industry: "beer",        allUk: true  },
  // Footwear
  { board: "onrunning",        company: "On Running",       industry: "footwear",    allUk: false },
];

async function fetchGreenhouseJobs(tenant: GreenhouseTenant) {
  const allJobs: any[] = [];
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${tenant.board}/jobs?content=true`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) {
      console.warn(`[${tenant.industry}] Greenhouse(${tenant.board}): HTTP ${res.status}`);
      return allJobs;
    }
    const payload = await res.json();
    const jobs: any[] = Array.isArray(payload?.jobs) ? payload.jobs : [];

    for (const j of jobs) {
      const title = String(j?.title || "").trim();
      const link = String(j?.absolute_url || "").trim();
      if (!title || !link) continue;

      const location = String(j?.location?.name || "").trim();

      if (!tenant.allUk) {
        const isUk = /united kingdom|uk|london|manchester|leeds|bristol|birmingham|edinburgh|glasgow|cardiff|belfast|remote/i.test(location.toLowerCase());
        if (!isUk) continue;
      }

      const html = String(j?.content || "");
      const text = html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
      const desc = (text.split(". ")[0] || `${title} at ${tenant.company}.`).slice(0, 2000);

      let industry = tenant.industry;
      let company = tenant.company;
      if (tenant.routes) {
        for (const r of tenant.routes) {
          if (r.match.test(title) || r.match.test(text)) {
            industry = r.industry;
            if (r.company) company = r.company;
            break;
          }
        }
      }

      const { stage, roleCategory } = classifyJob(title, desc, industry);
      allJobs.push({
        title: title.slice(0, 255),
        company,
        industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: location.slice(0, 200) || "London",
        type: "Full-time",
        work_mode: /remote/i.test(location) ? "Remote" : /hybrid/i.test(location) ? "Hybrid" : "On-site",
        salary: null,
        description: desc,
        url: link,
        source_url: "greenhouse.io",
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      });
    }
  } catch (err) {
    console.error(`[${tenant.industry}] Greenhouse(${tenant.board}) error:`, err);
  }
  console.log(`[${tenant.industry}] Greenhouse(${tenant.board}): ${allJobs.length} jobs parsed`);
  return allJobs;
}

// ── Generic Workable API scraper ────────────────────────────────────
// apply.workable.com/api/v1/widget/accounts/{slug} - free, no auth.
type WorkableTenant = {
  slug: string;
  company: string;
  industry: string;
  allUk?: boolean;
};

const WORKABLE_TENANTS: WorkableTenant[] = [
  { slug: "charlotte-tilbury",    company: "Charlotte Tilbury",    industry: "beauty",        allUk: false },
  { slug: "zoopla",               company: "Zoopla",               industry: "estate-agency", allUk: true },
  { slug: "tomorrow-2",           company: "Tomorrow London",      industry: "fashion",       allUk: true },
  { slug: "motabilityfoundation", company: "Motability Foundation", industry: "charity",       allUk: true },
  { slug: "team-17-digital",      company: "Team17",               industry: "gaming",        allUk: false },
  // ── Lettings / property specialists ─────────────────
  { slug: "cluttons",             company: "Cluttons",             industry: "estate-agency", allUk: true },
  { slug: "dexters",              company: "Dexters",              industry: "estate-agency", allUk: true },
  { slug: "belvoir",              company: "Belvoir Group",        industry: "estate-agency", allUk: true },
  { slug: "openrent",             company: "OpenRent",             industry: "estate-agency", allUk: true },
  { slug: "hunters",              company: "Hunters",              industry: "estate-agency", allUk: true },
  { slug: "jll",                  company: "JLL",                  industry: "estate-agency", allUk: true },
  { slug: "cbre",                 company: "CBRE",                 industry: "estate-agency", allUk: true },
];

async function fetchWorkableJobs(tenant: WorkableTenant) {
  const allJobs: any[] = [];
  try {
    const res = await fetch(
      `https://apply.workable.com/api/v1/widget/accounts/${tenant.slug}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) {
      console.warn(`[${tenant.industry}] Workable(${tenant.slug}): HTTP ${res.status}`);
      return allJobs;
    }
    const payload = await res.json();
    const jobs: any[] = Array.isArray(payload?.jobs) ? payload.jobs : [];

    for (const j of jobs) {
      const title = String(j?.title || "").trim();
      const link = String(j?.shortlink || j?.url || "").trim();
      if (!title || !link) continue;

      const city = String(j?.city || "").trim();
      const country = String(j?.country || "").trim();
      const location = [city, country].filter(Boolean).join(", ") || "UK";

      if (!tenant.allUk) {
        const isUk = /united kingdom|uk|gb|london|manchester|leeds|bristol|birmingham|edinburgh|glasgow|cardiff|belfast|remote/i.test(location.toLowerCase());
        if (!isUk) continue;
      }

      const dept = String(j?.department || "").trim();
      const desc = `${title} at ${tenant.company}${dept ? ` - ${dept}` : ""}.`.slice(0, 2000);
      const { stage, roleCategory } = classifyJob(title, desc, tenant.industry);

      allJobs.push({
        title: title.slice(0, 255),
        company: tenant.company,
        industry: tenant.industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: location.slice(0, 200),
        type: j?.employment_type === "Part-time" ? "Part-time" : "Full-time",
        work_mode: j?.telecommute ? "Remote" : /hybrid/i.test(String(j?.workplace || "")) ? "Hybrid" : "On-site",
        salary: null,
        description: desc,
        url: link,
        source_url: "workable.com",
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      });
    }
  } catch (err) {
    console.error(`[${tenant.industry}] Workable(${tenant.slug}) error:`, err);
  }
  console.log(`[${tenant.industry}] Workable(${tenant.slug}): ${allJobs.length} jobs parsed`);
  return allJobs;
}

// ── Workable public job board aggregator ────────────────────────────
// jobs.workable.com/api/v1/jobs - free, no auth. Aggregates all opted-in
// Workable customers. Paginated via nextPageToken.
async function fetchWorkableBoardJobs(
  industry: string,
  keywords: string[],
  opts: { maxPages?: number; perPage?: number; perKeywordCap?: number } = {},
) {
  const out: any[] = [];
  const seen = new Set<string>();
  const maxPages = opts.maxPages ?? 2;
  const perPage = Math.min(opts.perPage ?? 50, 100);
  const perKeywordCap = opts.perKeywordCap ?? 150;

  // Use top 2 keywords per industry to limit API load.
  const queries = keywords.slice(0, 2).filter((k) => k && k.length > 1);
  if (queries.length === 0) queries.push("");

  for (const q of queries) {
    let token: string | null = null;
    let pulled = 0;
    for (let page = 0; page < maxPages; page++) {
      const body: Record<string, unknown> = {
        location: { country: "United Kingdom" },
        limit: perPage,
      };
      if (q) body.query = q;
      if (token) body.nextPageToken = token;

      try {
        const res = await fetch("https://jobs.workable.com/api/v1/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          // Fallback to GET for older endpoint shape.
          const qs = new URLSearchParams({
            location: "United Kingdom",
            limit: String(perPage),
          });
          if (q) qs.set("query", q);
          if (token) qs.set("nextPageToken", token);
          const r2 = await fetch(`https://jobs.workable.com/api/v1/jobs?${qs.toString()}`);
          if (!r2.ok) {
            console.warn(`[${industry}] WorkableBoard q="${q}" p${page}: HTTP ${res.status}/${r2.status}`);
            break;
          }
          const payload = await r2.json();
          token = payload?.nextPageToken || null;
          processWorkableBoardPage(payload?.jobs, industry, seen, out);
          pulled += (payload?.jobs?.length || 0);
        } else {
          const payload = await res.json();
          token = payload?.nextPageToken || null;
          processWorkableBoardPage(payload?.jobs, industry, seen, out);
          pulled += (payload?.jobs?.length || 0);
        }
      } catch (err) {
        console.error(`[${industry}] WorkableBoard q="${q}" error:`, err);
        break;
      }
      if (!token) break;
      if (pulled >= perKeywordCap) break;
    }
  }
  console.log(`[${industry}] WorkableBoard: ${out.length} jobs parsed (${queries.length} queries)`);
  return out;
}

function processWorkableBoardPage(jobs: any, industry: string, seen: Set<string>, out: any[]) {
  if (!Array.isArray(jobs)) return;
  for (const j of jobs) {
    const url = String(j?.url || j?.applyUrl || "").trim();
    const title = String(j?.title || "").trim();
    if (!url || !title || seen.has(url)) continue;
    seen.add(url);

    const company = String(j?.company?.title || j?.companyName || j?.company_name || "").trim() || "Unknown";
    const loc = j?.location || {};
    const location = [loc?.city, loc?.subregion, loc?.countryName]
      .filter(Boolean)
      .join(", ") || (Array.isArray(j?.locations) ? String(j.locations[0] || "") : "") || "United Kingdom";

    // UK guard (Workable sometimes returns adjacent results).
    if (!/united kingdom|england|scotland|wales|northern ireland|\buk\b|london|manchester|birmingham|leeds|bristol|edinburgh|glasgow|cardiff|belfast/i.test(location)) {
      continue;
    }

    const rawDesc = String(j?.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const desc = (rawDesc || `${title} at ${company}`).slice(0, 2000);
    const { stage, roleCategory } = classifyJob(title, desc, industry);

    const employmentType = String(j?.employmentType || "").toLowerCase();
    const workplace = String(j?.workplace || "").toLowerCase();

    out.push({
      title: title.slice(0, 255),
      company: company.slice(0, 200),
      industry,
      value_chain_stage: stage,
      role_category: roleCategory,
      location: location.slice(0, 200),
      type: employmentType.includes("part") ? "Part-time" : employmentType.includes("contract") ? "Contract" : "Full-time",
      work_mode: workplace.includes("remote") ? "Remote" : workplace.includes("hybrid") ? "Hybrid" : "On-site",
      salary: null,
      description: desc,
      url,
      source_url: "jobs.workable.com",
      expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
    });
  }
}

// ── Generic Ashby API scraper ───────────────────────────────────────
// api.ashbyhq.com/posting-api/job-board/{board} - free, no auth.
type AshbyTenant = {
  board: string;
  company: string;
  industry: string;
  allUk?: boolean;
};

const ASHBY_TENANTS: AshbyTenant[] = [
  { board: "MUBI", company: "MUBI", industry: "cinema", allUk: false },
  { board: "joor", company: "JOOR", industry: "fashion", allUk: false },
  { board: "trainline", company: "Trainline", industry: "travel", allUk: false },
];

async function fetchAshbyJobs(tenant: AshbyTenant) {
  const allJobs: any[] = [];
  try {
    const res = await fetch(
      `https://api.ashbyhq.com/posting-api/job-board/${tenant.board}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) {
      console.warn(`[${tenant.industry}] Ashby(${tenant.board}): HTTP ${res.status}`);
      return allJobs;
    }
    const payload = await res.json();
    const jobs: any[] = Array.isArray(payload?.jobs) ? payload.jobs : [];

    for (const j of jobs) {
      const title = String(j?.title || "").trim();
      const link = String(j?.jobUrl || j?.applyUrl || "").trim();
      if (!title || !link) continue;

      const location = String(j?.location || "").trim();

      if (!tenant.allUk) {
        const isUk = /united kingdom|uk|london|manchester|leeds|bristol|birmingham|edinburgh|glasgow|cardiff|belfast|remote/i.test(location.toLowerCase());
        if (!isUk) continue;
      }

      const dept = String(j?.department || "").trim();
      const desc = `${title} at ${tenant.company}${dept ? ` - ${dept}` : ""}.`.slice(0, 2000);
      const { stage, roleCategory } = classifyJob(title, desc, tenant.industry);

      allJobs.push({
        title: title.slice(0, 255),
        company: tenant.company,
        industry: tenant.industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: location.slice(0, 200) || "London",
        type: j?.employmentType === "PartTime" ? "Part-time" : "Full-time",
        work_mode: /remote/i.test(location) ? "Remote" : /hybrid/i.test(location) ? "Hybrid" : "On-site",
        salary: null,
        description: desc,
        url: link,
        source_url: "ashbyhq.com",
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      });
    }
  } catch (err) {
    console.error(`[${tenant.industry}] Ashby(${tenant.board}) error:`, err);
  }
  console.log(`[${tenant.industry}] Ashby(${tenant.board}): ${allJobs.length} jobs parsed`);
  return allJobs;
}

// JSearch quota math (RapidAPI Pro = 10k requests/month):
//   Each `num_pages` value counts as N billable requests (1 page = 1 request,
//   10 pages = 10 requests). So total daily cost is roughly:
//     keywords_per_industry × pages_per_call × industries_covered
//
// Defaults below: 3 kw × 5 pages × ~15 industries reached before the soft cap
//   = ~225 requests/day = ~6,750/month (~67% of 10k quota). Safe headroom for
//   ad-hoc refetches via the industry health monitor.
//
// All three knobs are tunable at runtime via env vars without a redeploy:
//   JSEARCH_KEYWORDS_PER_INDUSTRY (default 3)
//   JSEARCH_PAGES                 (default 5)
//   JSEARCH_MAX_CALLS_PER_RUN     (default 250)
// Kill switch: JSEARCH_ENABLED=false
const UK_LOCATION_RE_JSEARCH = /united kingdom|england|scotland|wales|northern ireland|\bUK\b|london|manchester|birmingham|leeds|bristol|glasgow|edinburgh|cardiff|belfast|liverpool|newcastle|sheffield|nottingham|brighton/i;

let jsearchCallsThisRun = 0;
const JSEARCH_MAX_CALLS_PER_RUN = Math.max(1, Number(Deno.env.get("JSEARCH_MAX_CALLS_PER_RUN") ?? "500"));
const JSEARCH_KEYWORDS_PER_INDUSTRY = Math.max(1, Number(Deno.env.get("JSEARCH_KEYWORDS_PER_INDUSTRY") ?? "6"));
const JSEARCH_PAGES = Math.max(1, Math.min(20, Number(Deno.env.get("JSEARCH_PAGES") ?? "5")));

async function fetchJSearchJobs(industry: string, keywords: string[], rapidApiKey: string) {
  if (!keywords.length) return [];
  if (Deno.env.get("JSEARCH_ENABLED") === "false") return [];

  const queries = keywords.slice(0, JSEARCH_KEYWORDS_PER_INDUSTRY);
  const out: any[] = [];

  for (const keyword of queries) {
    if (jsearchCallsThisRun + JSEARCH_PAGES > JSEARCH_MAX_CALLS_PER_RUN) {
      console.warn(`[${industry}] JSearch: soft cap of ${JSEARCH_MAX_CALLS_PER_RUN} calls reached (used ${jsearchCallsThisRun}) - skipping`);
      break;
    }
    try {
      const url = new URL("https://jsearch.p.rapidapi.com/search");
      url.searchParams.set("query", `${keyword} in United Kingdom`);
      url.searchParams.set("page", "1");
      url.searchParams.set("num_pages", String(JSEARCH_PAGES));
      url.searchParams.set("country", "gb");
      url.searchParams.set("date_posted", "month");

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 45000);
      let res: Response;
      try {
        res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": "jsearch.p.rapidapi.com",
          },
          signal: ctrl.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      jsearchCallsThisRun += JSEARCH_PAGES;

      if (!res.ok) {
        console.error(`[${industry}] JSearch HTTP ${res.status} for "${keyword}"`);
        await res.text();
        continue;
      }
      const json = await res.json();
      const results = Array.isArray(json?.data) ? json.data : [];

      for (const j of results) {
        const title = (j.job_title || "").trim();
        const link = (j.job_apply_link || "").trim();
        if (!title || !link) continue;

        // NOTE: We do NOT apply MANUAL_TRADE_TITLE_REGEX here. JSearch is a
        // general aggregator (like Adzuna) where baristas/chefs/cleaners are
        // legitimate hits in coffee/food-drink/wellness etc. The validate-jobs
        // function handles cross-industry contamination via the
        // INDUSTRY_TITLE_BLOCKLIST + relevance keyword check.

        const company = (j.employer_name || "Unknown").trim();
        const desc = (j.job_description || "").replace(/<[^>]*>/g, "").trim();
        const loc = [j.job_city, j.job_state, j.job_country].filter(Boolean).join(", ");

        // Reject only when location is explicitly set AND not UK.
        // Empty/missing locations are allowed because the API was called with country=gb,
        // and remote jobs often have no city. Excluding them dropped ~95% of JSearch results.
        if (loc && !UK_LOCATION_RE_JSEARCH.test(loc) && !/remote/i.test(loc)) continue;
        const displayLoc = loc || (j.job_is_remote ? "Remote, UK" : "United Kingdom");

        const employment = String(j.job_employment_type || "").toLowerCase();
        const jobType = employment.includes("part") ? "Part-time"
          : employment.includes("intern") ? "Internship"
          : employment.includes("contract") ? "Contract"
          : "Full-time";

        const remoteFlag = j.job_is_remote === true || /remote/i.test(employment);

        const { stage, roleCategory } = classifyJob(title, desc, industry);
        const postedRaw = j.job_posted_at_datetime_utc
          ? new Date(j.job_posted_at_datetime_utc)
          : new Date();
        const expiresAt = new Date(postedRaw.getTime() + 60 * 86400000).toISOString();

        out.push({
          title: title.slice(0, 255),
          company: company.slice(0, 200),
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: displayLoc.slice(0, 200),
          type: jobType,
          work_mode: remoteFlag ? "Remote" : "On-site",
          salary: null,
          description: desc.slice(0, 2000) || null,
          url: link,
          source_url: "jsearch",
          expires_at: expiresAt,
        });
      }
    } catch (err) {
      console.error(`[${industry}] JSearch fetch error for "${keyword}":`, err);
    }
  }
  return out;
}

// ── Role sweep ordering ─────────────────────────────────────────────
// Heavy/wide roles (e.g. "influencing" with 50+ creator-economy synonyms)
// can drain Adzuna's 60s rate-limit window if scheduled first, leaving the
// rest of the role sweeps to bounce off HTTP 429s. We push them to the end
// so siblings get fair access to the limiter.
const HEAVY_ROLES = new Set(["influencing"]);
function orderRolesForFairUse(roles: string[]): string[] {
  const heavy: string[] = [];
  const light: string[] = [];
  for (const r of roles) {
    if (HEAVY_ROLES.has(r)) heavy.push(r); else light.push(r);
  }
  return [...light, ...heavy];
}

// ── Industry sweep ordering ────────────────────────────────────────
// Heavy industries (beauty, fashion, grocery) generate hundreds of Adzuna
// pages and exhaust the rate limit before niche industries (horse-racing,
// jewellery) ever get a turn. Put niche industries first so they hit
// Adzuna while the budget is fresh, then let the heavy ones fight for
// the remaining quota. Non-Adzuna sources (Reed, Jooble, RSS, direct
// feeds) still run for every industry regardless.
const HEAVY_INDUSTRIES = new Set(["beauty", "fashion", "grocery", "hospitality", "health", "teaching", "charity"]);
const PRIORITY_INDUSTRIES = new Set(["horse-racing", "jewellery", "footwear", "gaming", "interior-design", "farming"]);
function orderIndustriesForFairUse(industries: string[]): string[] {
  const priority: string[] = [];
  const normal: string[] = [];
  const heavy: string[] = [];
  for (const ind of industries) {
    if (PRIORITY_INDUSTRIES.has(ind)) priority.push(ind);
    else if (HEAVY_INDUSTRIES.has(ind)) heavy.push(ind);
    else normal.push(ind);
  }
  return [...priority, ...normal, ...heavy];
}

// ── Day-of-week scheduling ──────────────────────────────────────────
// Spread industries across 7 days (0=Sun … 6=Sat) so each cron run
// only hits Adzuna for ~4-5 industries, keeping well within the 250
// hits/day quota. Non-Adzuna sources (Reed, Jooble, RSS, direct feeds)
// still run for every industry regardless - the Adzuna guard
// (isAdzunaExhausted) handles the cutoff.
//
// Targeted refreshes (body.industry) and health-monitor refetches
// bypass this schedule so urgent gaps can still be filled.
const INDUSTRY_DAY_SCHEDULE: Record<number, string[]> = {
  0: ["football", "formula-1", "horse-racing", "gaming", "music"],          // Sun
  1: ["fashion", "footwear", "jewellery", "beauty", "interior-design"],     // Mon
  2: ["hospitality", "food-drink", "coffee", "bakery", "beer"],             // Tue
  3: ["health", "wellness", "physiotherapy", "psychotherapy", "pets"],       // Wed
  4: ["money", "estate-agency", "journalism", "teaching", "charity"],       // Thu
  5: ["cinema", "travel", "influencing", "cars", "grocery"],                // Fri
  6: ["farming", "building", "fixing", "delivery", "remote"],              // Sat
};

function getScheduledIndustries(): string[] {
  const day = new Date().getUTCDay(); // cron fires at 06:00 / 18:00 UTC
  const scheduled = INDUSTRY_DAY_SCHEDULE[day] || [];
  console.log(`[schedule] Day ${day} → ${scheduled.length} industries: ${scheduled.join(", ")}`);
  return orderIndustriesForFairUse(scheduled);
}

// Today's Adzuna-allowed bucket as a Set (used to gate Adzuna calls when we
// run the lightweight "all industries, non-Adzuna" pass on every cron run).
function getAdzunaAllowedSet(): Set<string> {
  const day = new Date().getUTCDay();
  return new Set(INDUSTRY_DAY_SCHEDULE[day] || []);
}

// ── Internships API (Fantastic Jobs - RapidAPI, dedicated intern/grad roles) ──
// Same RAPIDAPI_KEY as JSearch / Active Jobs DB / LinkedIn Jobs API.
// Strategy: 2 grad-friendly keywords per industry × ~12 industries that hire
// interns/grads = ~24 calls/day. Each call returns up to 100 results.
// All jobs auto-tagged career_level='entry' and type='Internship'.
//
// Kill switch: set INTERNSHIPS_ENABLED=false to disable instantly.
// Soft cap: 60 calls per fetch-external-jobs invocation (defensive).
const UK_LOCATION_RE_INTERNS = /united kingdom|england|scotland|wales|northern ireland|\bUK\b|\bGB\b|london|manchester|birmingham|leeds|bristol|glasgow|edinburgh|cardiff|belfast|liverpool|newcastle|sheffield|nottingham|brighton/i;

// Industries that meaningfully hire interns / grads. We skip trades-heavy
// industries (estate-agency manual, beauty therapists, vehicle techs etc.)
// where "internship" returns near-zero relevant results.
const INTERN_KEYWORDS: Record<string, string[]> = {
  cinema: ["film production intern", "tv production graduate"],
  music: ["music industry intern", "record label graduate"],
  fashion: ["fashion intern", "fashion graduate scheme"],
  journalism: ["journalism intern", "editorial graduate"],
  gaming: ["games industry intern", "game design graduate"],
  charity: ["charity intern", "non profit graduate"],
  football: ["football club intern", "sports business graduate"],
  travel: ["travel intern", "hospitality graduate scheme"],
  grocery: ["FMCG graduate scheme", "retail graduate scheme"],
  beer: ["brewery intern", "drinks industry graduate"],
  coffee: ["coffee industry intern", "speciality coffee graduate"],
  "interior-design": ["interior design intern", "architecture graduate"],
};

let internshipsCallsThisRun = 0;
const INTERNSHIPS_MAX_CALLS_PER_RUN = 60;

async function fetchInternshipsJobs(industry: string, rapidApiKey: string) {
  if (Deno.env.get("INTERNSHIPS_ENABLED") === "false") return [];
  const keywords = INTERN_KEYWORDS[industry];
  if (!keywords?.length) return [];

  const out: any[] = [];

  for (const keyword of keywords) {
    if (internshipsCallsThisRun >= INTERNSHIPS_MAX_CALLS_PER_RUN) {
      console.warn(`[${industry}] Internships: soft cap of ${INTERNSHIPS_MAX_CALLS_PER_RUN} calls reached - skipping`);
      break;
    }
    try {
      const url = new URL("https://internships-api.p.rapidapi.com/active-jb-7d");
      url.searchParams.set("title_filter", `"${keyword}"`);
      url.searchParams.set("location_filter", `"United Kingdom" OR "London" OR "Manchester" OR "Birmingham"`);
      url.searchParams.set("description_type", "text");
      url.searchParams.set("limit", "100");

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 45000);
      let res: Response;
      try {
        res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": "internships-api.p.rapidapi.com",
          },
          signal: ctrl.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      internshipsCallsThisRun++;

      if (!res.ok) {
        console.error(`[${industry}] Internships HTTP ${res.status} for "${keyword}"`);
        await res.text();
        continue;
      }
      const json = await res.json();
      const results = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);

      for (const j of results) {
        const title = (j.title || j.job_title || "").trim();
        const link = (j.url || j.apply_url || j.job_apply_link || "").trim();
        if (!title || !link) continue;

        const company = (j.organization || j.company || j.employer_name || "Unknown").trim();
        const desc = String(j.description_text || j.description || "").replace(/<[^>]*>/g, "").trim();

        // locations_derived is array of "City, Region, Country" strings
        const locArr = Array.isArray(j.locations_derived) ? j.locations_derived
          : Array.isArray(j.locations_raw) ? j.locations_raw.map((l: any) => l?.address?.addressLocality || l?.address?.addressCountry || "").filter(Boolean)
          : [];
        const loc = locArr[0] || j.location || [j.job_city, j.job_state, j.job_country].filter(Boolean).join(", ");

        if (!loc || !UK_LOCATION_RE_INTERNS.test(String(loc))) continue;

        const employment = String(
          Array.isArray(j.employment_type) ? j.employment_type.join(" ") : (j.employment_type || j.job_employment_type || "")
        ).toLowerCase();
        const jobType = employment.includes("intern") ? "Internship"
          : employment.includes("contract") ? "Contract"
          : employment.includes("part") ? "Part-time"
          : "Internship"; // default - this IS the internships feed

        const remoteFlag = j.remote === true || /remote/i.test(employment) || /remote/i.test(String(loc));

        const { stage, roleCategory } = classifyJob(title, desc, industry);
        const postedRaw = j.date_posted ? new Date(j.date_posted)
          : j.job_posted_at_datetime_utc ? new Date(j.job_posted_at_datetime_utc)
          : new Date();
        const expiresAt = new Date(postedRaw.getTime() + 60 * 86400000).toISOString();

        out.push({
          title: title.slice(0, 255),
          company: company.slice(0, 200),
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: String(loc).slice(0, 200),
          type: jobType,
          work_mode: remoteFlag ? "Remote" : "On-site",
          salary: null,
          description: desc.slice(0, 2000) || null,
          url: link,
          source_url: "internships-api",
          career_level: "entry",
          expires_at: expiresAt,
        });
      }
    } catch (err) {
      console.error(`[${industry}] Internships fetch error for "${keyword}":`, err);
    }
  }
  return out;
}

// ── Glassdoor Jobs via RapidAPI ────────────────────────────────────
// Uses glassdoor-real-time.p.rapidapi.com/jobs/search — same key as Indeed.
// Budget: 200 calls/month free. 2 runs/day × 30 days = 60 runs → 3 calls/run max.
// 3 calls × 30 jobs = ~90 new jobs/run. Targets top-3 industries by keyword volume.
// Kill switch: GLASSDOOR_RAPIDAPI_ENABLED=false.

const UK_LOCATION_RE_GLASSDOOR = /united kingdom|england|scotland|wales|\bUK\b|\bGB\b|london|manchester|birmingham|leeds|bristol|glasgow|edinburgh|cardiff|belfast|liverpool/i;
let glassdoorCallsThisRun = 0;
const GLASSDOOR_MAX_CALLS_PER_RUN = Number(Deno.env.get("GLASSDOOR_MAX_CALLS_PER_RUN") ?? "3");

// Rotate industries so different ones get Glassdoor coverage across runs
// Sorted by expected job volume
const GLASSDOOR_INDUSTRY_PRIORITY = [
  "technology", "finance", "marketing", "business", "hospitality",
  "healthcare", "media", "fashion", "music", "sport",
];

async function fetchGlassdoorJobs(industry: string, keywords: string[], indeedKey: string): Promise<any[]> {
  if (Deno.env.get("GLASSDOOR_RAPIDAPI_ENABLED") === "false") return [];
  if (glassdoorCallsThisRun >= GLASSDOOR_MAX_CALLS_PER_RUN) return [];
  // Only run for priority industries to conserve quota
  const rank = GLASSDOOR_INDUSTRY_PRIORITY.indexOf(industry);
  if (rank === -1 || rank >= GLASSDOOR_MAX_CALLS_PER_RUN) return [];

  const kw = keywords[0];
  if (!kw) return [];

  const out: any[] = [];
  try {
    const url = new URL("https://glassdoor-real-time.p.rapidapi.com/jobs/search");
    url.searchParams.set("query", kw);
    url.searchParams.set("location", "United Kingdom");
    url.searchParams.set("page", "1");

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 30000);
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: {
          "x-rapidapi-key": indeedKey,
          "x-rapidapi-host": "glassdoor-real-time.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    glassdoorCallsThisRun++;

    if (!res.ok) {
      console.error(`[${industry}] Glassdoor HTTP ${res.status} for "${kw}"`);
      await res.text();
      return out;
    }

    const json = await res.json();
    const listings = (json?.data?.jobListings ?? []) as any[];

    for (const item of listings) {
      const header = item?.jobview?.header ?? {};
      const job = item?.jobview?.job ?? {};

      const title = (header.normalizedJobTitle || job.jobTitleText || "").trim();
      const link = (header.jobViewUrl || "").trim();
      if (!title || !link) continue;

      const company = (header.employer?.name || header.employerNameFromSearch || "Unknown").trim();
      const loc = (header.locationName || "United Kingdom").trim();
      if (!UK_LOCATION_RE_GLASSDOOR.test(loc)) continue;

      const ageInDays = header.ageInDays ?? 30;
      if (ageInDays > 30) continue;

      const postedAt = new Date(Date.now() - ageInDays * 86400000);
      const expiresAt = new Date(Date.now() + (30 - ageInDays) * 86400000).toISOString();

      // Salary — payPeriodAdjustedPay has p10/p50/p90
      const pay = header.payPeriodAdjustedPay ?? {};
      const salaryStr = pay.p50 ? `~£${Math.round(pay.p50 / 1000)}k` : null;

      const { stage, roleCategory } = classifyJob(title, "", industry);

      out.push({
        title: title.slice(0, 255),
        company: company.slice(0, 200),
        industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: loc.slice(0, 200),
        type: "Full-time",
        work_mode: /remote/i.test(loc) ? "Remote" : "On-site",
        salary: salaryStr,
        description: null,
        url: link,
        source_url: "glassdoor-rapidapi",
        career_level: null,
        expires_at: expiresAt,
      });
    }
  } catch (err) {
    console.error(`[${industry}] Glassdoor fetch error:`, err);
  }
  return out;
}

// ── Indeed Jobs via RapidAPI ────────────────────────────────────────
// Uses the "Indeed Job Search" API (indeed12.p.rapidapi.com).
// Separate key: RAPIDAPI_INDEED_KEY. Kill switch: INDEED_RAPIDAPI_ENABLED=false.
// Rate limit: 10 calls/minute → enforce 6s minimum between calls.
// Budget: 1 keyword × 2 pages × 30 industries = 60 calls/run (~6 min at 10/min).
// Two runs/day = 120 calls/day, well within quota.

const UK_LOCATION_RE_INDEED = /united kingdom|england|scotland|wales|northern ireland|\bUK\b|\bGB\b|london|manchester|birmingham|leeds|bristol|glasgow|edinburgh|cardiff|belfast|liverpool|newcastle|sheffield|nottingham|brighton/i;
let indeedCallsThisRun = 0;
let _indeedLastCallAt = 0;
const INDEED_RATE_INTERVAL_MS = 6200; // 10/min = 1 per 6s, +200ms safety margin
const INDEED_MAX_CALLS_PER_RUN = Number(Deno.env.get("INDEED_MAX_CALLS_PER_RUN") ?? "60");
const INDEED_KEYWORDS_PER_INDUSTRY = Number(Deno.env.get("INDEED_KEYWORDS_PER_INDUSTRY") ?? "1");
const INDEED_PAGES = Number(Deno.env.get("INDEED_PAGES") ?? "2");

async function fetchIndeedJobs(industry: string, keywords: string[], indeedKey: string): Promise<any[]> {
  if (Deno.env.get("INDEED_RAPIDAPI_ENABLED") === "false") return [];
  if (!keywords.length) return [];

  const out: any[] = [];
  const topKeywords = keywords.slice(0, INDEED_KEYWORDS_PER_INDUSTRY);

  for (const kw of topKeywords) {
    for (let page = 0; page < INDEED_PAGES; page++) {
      if (indeedCallsThisRun >= INDEED_MAX_CALLS_PER_RUN) {
        console.warn(`[${industry}] Indeed: cap of ${INDEED_MAX_CALLS_PER_RUN} calls reached`);
        return out;
      }
      // Respect 10 calls/min rate limit
      const now = Date.now();
      const wait = _indeedLastCallAt + INDEED_RATE_INTERVAL_MS - now;
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      _indeedLastCallAt = Date.now();
      try {
        const url = new URL("https://indeed12.p.rapidapi.com/jobs/search");
        url.searchParams.set("query", kw);
        url.searchParams.set("location", "United Kingdom");
        url.searchParams.set("page_id", String(page + 1));
        url.searchParams.set("locality", "uk");
        url.searchParams.set("fromage", "7"); // last 7 days

        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 30000);
        let res: Response;
        try {
          res = await fetch(url.toString(), {
            headers: {
              "x-rapidapi-key": indeedKey,
              "x-rapidapi-host": "indeed12.p.rapidapi.com",
            },
            signal: ctrl.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
        indeedCallsThisRun++;

        if (!res.ok) {
          console.error(`[${industry}] Indeed HTTP ${res.status} for "${kw}" page ${page + 1}`);
          await res.text();
          continue;
        }

        const json = await res.json();
        const hits = Array.isArray(json?.hits) ? json.hits : [];

        for (const j of hits) {
          const title = (j.title || "").trim();
          const link = (j.link || j.apply_url || "").trim();
          if (!title || !link) continue;

          const company = (j.company_name || j.company || "Unknown").trim();
          const loc = (j.location || j.formatted_location || "United Kingdom").trim();
          if (!UK_LOCATION_RE_INDEED.test(loc)) continue;

          const desc = String(j.description || j.snippet || "").replace(/<[^>]*>/g, "").trim();
          const salaryRaw = j.salary || j.formatted_salary || null;
          const postedAt = j.date ? new Date(j.date) : new Date();
          const expiresAt = new Date(postedAt.getTime() + 60 * 86400000).toISOString();

          const employment = String(j.job_type || j.employment_type || "").toLowerCase();
          const jobType = employment.includes("part") ? "Part-time"
            : employment.includes("contract") ? "Contract"
            : employment.includes("temp") ? "Contract"
            : "Full-time";

          const remoteFlag = /remote/i.test(employment) || /remote/i.test(loc);
          const { stage, roleCategory } = classifyJob(title, desc, industry);

          out.push({
            title: title.slice(0, 255),
            company: company.slice(0, 200),
            industry,
            value_chain_stage: stage,
            role_category: roleCategory,
            location: loc.slice(0, 200),
            type: jobType,
            work_mode: remoteFlag ? "Remote" : "On-site",
            salary: salaryRaw ? String(salaryRaw).slice(0, 100) : null,
            description: desc.slice(0, 2000) || null,
            url: link,
            source_url: "indeed-rapidapi",
            career_level: null,
            expires_at: expiresAt,
          });
        }
      } catch (err) {
        console.error(`[${industry}] Indeed fetch error for "${kw}" page ${page}:`, err);
      }
    }
  }
  return out;
}

// ── Generic Lever API scraper ───────────────────────────────────────
// https://api.lever.co/v0/postings/<company> is a free public REST API, no auth.
// Each tenant costs exactly 1 HTTP call per refresh.
type LeverTenant = {
  company_slug: string;
  company: string;
  industry: string;
  allUk?: boolean;
  routes?: Array<{ match: RegExp; industry: string; company?: string }>;
};

const LEVER_TENANTS: LeverTenant[] = [
  { company_slug: "spotify",      company: "Spotify",        industry: "music",     allUk: false },
  { company_slug: "soundcloud",   company: "SoundCloud",     industry: "music",     allUk: false },
  { company_slug: "deezer",       company: "Deezer",         industry: "music",     allUk: false },
  { company_slug: "ticketmaster", company: "Ticketmaster",   industry: "music",     allUk: false },
  // Gaming
  { company_slug: "rockstargames", company: "Rockstar Games", industry: "gaming",   allUk: false },
  { company_slug: "take-two",      company: "Take-Two Interactive", industry: "gaming", allUk: false },
  { company_slug: "rebellion",     company: "Rebellion",     industry: "gaming",    allUk: true  },
  // Footwear
  { company_slug: "kurtgeiger",   company: "Kurt Geiger",    industry: "footwear",  allUk: true  },
  // Journalism
  { company_slug: "the-economist-group", company: "The Economist", industry: "journalism", allUk: false },
  { company_slug: "future-plc",   company: "Future plc",     industry: "journalism", allUk: true  },
  // Cinema
  { company_slug: "bfi",          company: "BFI",            industry: "cinema",    allUk: true  },
  { company_slug: "sister-pictures", company: "Sister Pictures", industry: "cinema", allUk: true },
];

async function fetchLeverJobs(tenant: LeverTenant) {
  const allJobs: any[] = [];
  try {
    const res = await fetch(
      `https://api.lever.co/v0/postings/${tenant.company_slug}?mode=json`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) {
      console.warn(`[${tenant.industry}] Lever(${tenant.company_slug}): HTTP ${res.status}`);
      return allJobs;
    }
    const postings: any[] = await res.json();
    if (!Array.isArray(postings)) return allJobs;

    for (const p of postings) {
      const title = String(p?.text || "").trim();
      const link = String(p?.hostedUrl || p?.applyUrl || "").trim();
      if (!title || !link) continue;

      const location = String(
        p?.categories?.location || p?.categories?.allLocations?.[0] || ""
      ).trim();

      if (!tenant.allUk) {
        const isUk = /united kingdom|uk|london|manchester|leeds|bristol|birmingham|edinburgh|glasgow|cardiff|belfast|remote/i.test(location.toLowerCase());
        if (!isUk) continue;
      }

      const dept = String(p?.categories?.department || p?.categories?.team || "").trim();
      const descParts = (p?.descriptionPlain || p?.description || "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
      const desc = (descParts.split(". ")[0] || `${title} at ${tenant.company}.`).slice(0, 2000);

      let industry = tenant.industry;
      let company = tenant.company;
      if (tenant.routes) {
        for (const r of tenant.routes) {
          if (r.match.test(title) || r.match.test(desc)) {
            industry = r.industry;
            if (r.company) company = r.company;
            break;
          }
        }
      }

      const commitment = String(p?.categories?.commitment || "").trim();
      const { stage, roleCategory } = classifyJob(title, desc, industry);
      allJobs.push({
        title: title.slice(0, 255),
        company,
        industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: location.slice(0, 200) || "London",
        type: /part[\s-]?time/i.test(commitment) ? "Part-time" : "Full-time",
        work_mode: /remote/i.test(location) ? "Remote" : /hybrid/i.test(location) ? "Hybrid" : "On-site",
        salary: null,
        description: desc,
        url: link,
        source_url: "lever.co",
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      });
    }
  } catch (err) {
    console.error(`[${tenant.industry}] Lever(${tenant.company_slug}) error:`, err);
  }
  console.log(`[${tenant.industry}] Lever(${tenant.company_slug}): ${allJobs.length} jobs parsed`);
  return allJobs;
}

// ── Generic SmartRecruiters API scraper ─────────────────────────────
// https://api.smartrecruiters.com/v1/companies/<id>/postings is free public REST.
// Paginated with limit/offset, max 100 per page.
type SmartRecruitersTenant = {
  companyId: string;
  company: string;
  industry: string;
  allUk?: boolean;
  routes?: Array<{ match: RegExp; industry: string; company?: string }>;
};

const SMARTRECRUITERS_TENANTS: SmartRecruitersTenant[] = [
  { companyId: "ASOS", company: "ASOS", industry: "fashion", allUk: false },
];

async function fetchSmartRecruitersJobs(tenant: SmartRecruitersTenant) {
  const allJobs: any[] = [];
  const PAGE_SIZE = 100;
  const MAX_PAGES = 10;
  let offset = 0;
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const url = `https://api.smartrecruiters.com/v1/companies/${tenant.companyId}/postings?limit=${PAGE_SIZE}&offset=${offset}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        console.warn(`[${tenant.industry}] SmartRecruiters(${tenant.companyId}): HTTP ${res.status}`);
        break;
      }
      const payload = await res.json();
      const postings: any[] = Array.isArray(payload?.content) ? payload.content : [];
      if (postings.length === 0) break;

      for (const p of postings) {
        const title = String(p?.name || "").trim();
        const link = String(p?.ref || p?.company?.identifier
          ? `https://jobs.smartrecruiters.com/${tenant.companyId}/${p?.id}`
          : "").trim();
        if (!title || !link) continue;

        const loc = p?.location;
        const location = [loc?.city, loc?.region, loc?.country].filter(Boolean).join(", ").trim();

        if (!tenant.allUk) {
          const isUk = /united kingdom|uk|gb|london|manchester|leeds|bristol|birmingham|edinburgh|glasgow|cardiff|belfast|remote/i.test(location.toLowerCase());
          if (!isUk) continue;
        }

        const dept = String(p?.department?.label || "").trim();
        const desc = `${title} at ${tenant.company}${dept ? ` - ${dept}` : ""}.`.slice(0, 2000);

        let industry = tenant.industry;
        let company = tenant.company;
        if (tenant.routes) {
          for (const r of tenant.routes) {
            if (r.match.test(title) || r.match.test(desc)) {
              industry = r.industry;
              if (r.company) company = r.company;
              break;
            }
          }
        }

        const typeOfEmployment = String(p?.typeOfEmployment || "").trim();
        const { stage, roleCategory } = classifyJob(title, desc, industry);
        allJobs.push({
          title: title.slice(0, 255),
          company,
          industry,
          value_chain_stage: stage,
          role_category: roleCategory,
          location: location.slice(0, 200) || "London",
          type: /part[\s-]?time/i.test(typeOfEmployment) ? "Part-time" : "Full-time",
          work_mode: /remote/i.test(location) ? "Remote" : /hybrid/i.test(location) ? "Hybrid" : "On-site",
          salary: null,
          description: desc,
          url: link,
          source_url: "smartrecruiters.com",
          expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        });
      }

      offset += PAGE_SIZE;
      if (postings.length < PAGE_SIZE) break;
    }
  } catch (err) {
    console.error(`[${tenant.industry}] SmartRecruiters(${tenant.companyId}) error:`, err);
  }
  console.log(`[${tenant.industry}] SmartRecruiters(${tenant.companyId}): ${allJobs.length} jobs parsed`);
  return allJobs;
}

// ── SAP SuccessFactors scraper ──────────────────────────────────────
// Uses the public career site API. Paginated via pageSize + startRow.
type SuccessFactorsTenant = {
  apiHost: string;    // e.g. "burberry.wd3.myworkdayjobs.com" → actually SF uses different hosts
  company: string;
  industry: string;
  careerSiteUrl: string; // base URL used to construct job links
  apiUrl: string;    // the full API endpoint for searching jobs
  allUk?: boolean;
};

const SUCCESSFACTORS_TENANTS: SuccessFactorsTenant[] = [
  {
    company: "Burberry",
    industry: "fashion",
    careerSiteUrl: "https://burberry.wd3.myworkdayjobs.com",
    apiUrl: "https://burberry.wd3.myworkdayjobs.com/wday/cxs/burberry/burberry/jobs",
    apiHost: "burberry.wd3.myworkdayjobs.com",
    allUk: false,
  },
  {
    company: "Bentley Motors",
    industry: "cars",
    careerSiteUrl: "https://career5.successfactors.eu/career?company=BentleyMoto",
    apiUrl: "https://career5.successfactors.eu/career?company=BentleyMoto&career_ns=job_listing&navBarLevel=JOB_SEARCH&_s.crb=",
    apiHost: "career5.successfactors.eu",
    allUk: true, // Bentley is HQ'd in Crewe, UK - virtually all roles are UK
  },
];

async function fetchSuccessFactorsJobs(tenant: SuccessFactorsTenant) {
  const allJobs: any[] = [];

  // Burberry is actually on Workday (wd3), so delegate to Workday handler if URL matches
  if (tenant.apiUrl.includes("myworkdayjobs.com")) {
    // Convert to Workday tenant format and use existing handler
    console.log(`[${tenant.industry}] SuccessFactors(${tenant.company}): Detected Workday URL, delegating to Workday handler`);
    // Already handled via WORKDAY_TENANTS - skip here to avoid duplication
    return allJobs;
  }

  // True SuccessFactors API - Firecrawl scrape for now (the SF API is not easily public)
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!firecrawlKey) {
    console.warn(`[${tenant.industry}] SuccessFactors(${tenant.company}) skipped - FIRECRAWL_API_KEY not set`);
    return allJobs;
  }

  try {
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firecrawlKey}`,
      },
      body: JSON.stringify({
        url: tenant.careerSiteUrl,
        formats: ["links", "markdown"],
        waitFor: 5000,
      }),
    });
    if (!scrapeRes.ok) {
      console.error(`[${tenant.industry}] SuccessFactors(${tenant.company}): Firecrawl HTTP ${scrapeRes.status}`);
      return allJobs;
    }
    const scrapeData = await scrapeRes.json();
    const md: string = scrapeData?.data?.markdown || "";
    const links: string[] = scrapeData?.data?.links || [];

    // Parse job links from the career page
    const jobLinks = links.filter((l: string) =>
      /job_listing|jobDetail|career.*company=/i.test(l)
    );

    // Extract job titles from markdown - typical pattern: [Job Title](url)
    const mdJobPattern = /\[([^\]]{5,100})\]\((https?:\/\/[^\)]+(?:job_listing|jobDetail)[^\)]*)\)/gi;
    let match: RegExpExecArray | null;
    while ((match = mdJobPattern.exec(md)) !== null) {
      const title = match[1].trim();
      const link = match[2].trim();
      if (!title || !link) continue;

      const desc = `${title} at ${tenant.company}.`.slice(0, 2000);
      const { stage, roleCategory } = classifyJob(title, desc, tenant.industry);
      allJobs.push({
        title: title.slice(0, 255),
        company: tenant.company,
        industry: tenant.industry,
        value_chain_stage: stage,
        role_category: roleCategory,
        location: tenant.allUk ? "United Kingdom" : "London",
        type: "Full-time",
        work_mode: "On-site",
        salary: null,
        description: desc,
        url: link,
        source_url: "successfactors.eu",
        expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      });
    }
  } catch (err) {
    console.error(`[${tenant.industry}] SuccessFactors(${tenant.company}) error:`, err);
  }
  console.log(`[${tenant.industry}] SuccessFactors(${tenant.company}): ${allJobs.length} jobs parsed`);
  return allJobs;
}


// Cross-industry business roles that get under-served by industry-only
// search (a Marketing Manager at a coffee chain rarely mentions "coffee").
// Each role gets its own pass against Reed + Adzuna with role keywords.
const ROLE_KEYWORDS: Record<string, string[]> = {
  marketing: ["marketing manager", "brand manager", "content marketing", "growth marketing", "performance marketing", "digital marketing"],
  influencing: ["social media manager", "influencer marketing manager", "creator partnerships manager", "tiktok manager", "youtube manager", "creator marketing manager", "community manager", "paid social specialist", "social strategist", "content creator", "podcast producer", "creator operations", "talent manager creator"],
  finance: ["finance manager", "financial controller", "management accountant", "fp&a analyst", "finance business partner", "treasury analyst"],
  sales: ["sales manager", "account executive", "business development manager", "account manager", "sales director", "key account manager"],
  hr: ["hr manager", "people partner", "talent acquisition", "recruiter", "people operations", "head of people", "hr business partner"],
  operations: ["operations manager", "head of operations", "coo ", "operations director", "general manager", "regional operations"],
  product: ["product manager", "senior product manager", "head of product", "product owner", "associate product manager"],
  strategy: ["strategy manager", "strategy consultant", "head of strategy", "corporate strategy", "business strategy"],
  legal: ["legal counsel", "in-house lawyer", "compliance officer", "company secretary", "paralegal", "general counsel"],
  it: ["software engineer", "developer", "devops engineer", "data engineer", "it manager", "head of engineering", "platform engineer"],
  "project-management": ["project manager", "programme manager", "delivery manager", "scrum master", "pmo analyst"],
  commercial: ["commercial manager", "commercial director", "head of commercial", "commercial analyst", "partnerships manager"],
  creative: ["creative director", "art director", "designer", "graphic designer", "ux designer", "ui designer", "design lead"],
};

// Entry-level keyword sweeps per business role. UK junior titles like
// "assistant", "coordinator", "executive", "trainee", "associate", "junior"
// surface true entry roles that the senior-leaning ROLE_KEYWORDS miss.
// Run as a separate Reed + Adzuna pass; results still classified via the
// existing career_level trigger and inferred industry logic.
const ENTRY_LEVEL_ROLE_KEYWORDS: Record<string, string[]> = {
  marketing: ["marketing assistant", "marketing executive", "marketing coordinator", "junior marketing", "marketing graduate"],
  influencing: ["social media assistant", "social media executive", "social media coordinator", "content executive", "junior content creator", "community executive", "influencer executive", "creator coordinator", "junior social media", "social media graduate"],
  finance: ["finance assistant", "finance graduate", "junior accountant", "accounts assistant", "trainee accountant", "finance analyst", "audit associate"],
  sales: ["sales executive", "sales assistant", "junior account manager", "sales development representative", "sdr", "bdr", "graduate sales", "sales associate"],
  hr: ["hr assistant", "hr coordinator", "people coordinator", "recruitment coordinator", "talent associate", "hr graduate", "junior recruiter"],
  operations: ["operations assistant", "operations coordinator", "operations executive", "junior operations", "operations graduate", "office coordinator"],
  product: ["associate product manager", "junior product manager", "product analyst", "product graduate", "product coordinator"],
  strategy: ["strategy analyst", "junior strategy", "strategy associate", "strategy graduate", "business analyst graduate"],
  legal: ["paralegal", "legal assistant", "trainee solicitor", "legal coordinator", "junior compliance", "compliance analyst"],
  it: ["junior developer", "graduate developer", "junior software engineer", "trainee developer", "junior data analyst", "graduate engineer", "associate engineer"],
  "project-management": ["junior project manager", "project coordinator", "project assistant", "pmo coordinator", "graduate project manager"],
  commercial: ["commercial executive", "commercial assistant", "commercial coordinator", "junior commercial", "commercial graduate", "partnerships executive"],
  creative: ["junior designer", "graduate designer", "design assistant", "junior creative", "junior copywriter", "creative assistant"],
};

// Role → industry hint for jobs that look generic. Used as a fallback when
// the job description doesn't clearly map to one of our industries.
const ROLE_INDUSTRY_FALLBACK: Record<string, string> = {
  marketing: "marketing",
  influencing: "influencing",
  finance: "finance",
  sales: "sales",
  hr: "hr",
  operations: "operations",
  product: "product",
  strategy: "strategy",
  legal: "legal",
  it: "technology",
  "project-management": "operations",
  commercial: "commercial",
  creative: "creative",
};

// Try to map a job to one of our existing industries based on keywords in
// title/company/description. Returns null if nothing matches confidently.
// IMPORTANT: priority industries are checked first to avoid mis-routing
// (e.g. "social media manager" → influencing, not music via "music marketing").
function inferIndustryFromText(title: string, company: string, description: string): string | null {
  const combined = `${title} ${company} ${description}`.toLowerCase();

  // 1. Strong influencing/creator-economy signals - check title first to avoid
  //    bleeding into music/football/marketing via generic terms.
  const titleLower = title.toLowerCase();
  const INFLUENCING_TITLE_RX =
    /\b(influencer|creator|tiktok|youtube|youtuber|vlogger|instagram|reels|short.?form video|community manager|social media (?:manager|executive|coordinator|lead|specialist|strategist|assistant)|paid social|content creator|creator partnerships|talent (?:manager|agent|booker|scout)|booker|podcast (?:host|producer|manager)|podcaster|newsletter writer|substack|live streamer|twitch|video editor|videographer|thumbnail|motion designer|social strategist|creator (?:operations|ops|marketing|business|economy)|influencer marketing|branded content|partnerships manager|paid social|growth (?:lead|analytics)|audience growth|youtube seo|discovery specialist)\b/i;
  if (INFLUENCING_TITLE_RX.test(titleLower)) return "influencing";

  // 2. Check the existing industry keyword map for any match (insertion order).
  for (const [industry, kws] of Object.entries(INDUSTRY_KEYWORDS)) {
    for (const kw of kws) {
      if (combined.includes(kw.toLowerCase())) return industry;
    }
  }
  return null;
}

// Reed + Adzuna + Muse pass for a single role (no industry filter).
async function fetchRoleJobs(
  role: string,
  keywords: string[],
  reedApiKey: string | undefined,
  adzunaAppId: string | undefined,
  adzunaAppKey: string | undefined,
) {
  const allJobs: any[] = [];
  const fallbackIndustry = ROLE_INDUSTRY_FALLBACK[role] || role;
  const roleKeywordLimit = role === "influencing" ? 6 : 3;
  const reedPagesPerKeyword = role === "influencing" ? 3 : 1;
  const reedPageSize = role === "influencing" ? 100 : 50;
  const adzunaPagesPerKeyword = role === "influencing" ? 10 : 1;

  // Per-role positive title signal - Reed/Adzuna keyword sweeps return huge
  // amounts of generic "Account Manager / CRM / Marketing Executive" noise
  // that should NOT be tagged with the role. Without this, the role-pass for
  // "influencing" was stamping ~600 generic CRM/marketing jobs as influencer
  // roles. Only accept a result if the title clearly matches the role.
  const ROLE_TITLE_SIGNAL: Record<string, RegExp> = {
    influencing: /\b(influencer|creator|tiktok|youtube|youtuber|vlogger|instagram|reels|short.?form video|community manager|social media (?:manager|executive|coordinator|lead|specialist|strategist|assistant|intern|graduate|apprentice)|paid social|content creator|creator partnerships|talent (?:manager|agent|booker|scout) creator|booker|podcast (?:host|producer|manager|coordinator)|podcaster|newsletter writer|substack|live streamer|twitch|video editor (?:social|creator|content)|videographer (?:social|creator|content)|thumbnail artist|motion designer (?:social|creator)|social strategist|creator (?:operations|ops|marketing|business|economy|coordinator|executive)|influencer marketing|branded content|partnerships manager (?:creator|influencer|brand)|youtube seo|audience growth|short form video)\b/i,
  };
  const roleSignal = ROLE_TITLE_SIGNAL[role];

  // ── Reed pass ──
  if (reedApiKey) {
    const auth = btoa(`${reedApiKey}:`);
    for (const kw of keywords.slice(0, roleKeywordLimit)) {
      try {
        for (let page = 0; page < reedPagesPerKeyword; page++) {
          const skip = page * reedPageSize;
          const url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(kw)}&resultsToTake=${reedPageSize}&resultsToSkip=${skip}`;
          const res = await fetch(url, {
            headers: { Authorization: `Basic ${auth}`, "User-Agent": "howdoyoudo-bot/1.0" },
          });
          if (!res.ok) {
            console.error(`Reed role error for "${kw}" p${page}: ${res.status}`);
            break;
          }
          const data = await res.json();
          const results = Array.isArray(data?.results) ? data.results : [];
          console.log(`[role:${role}] Reed "${kw}" p${page}: ${results.length} jobs`);

          for (const r of results) {
            const title = (r.jobTitle || "").trim();
            const company = (r.employerName || "Reed").trim();
            const link = r.jobUrl || "";
            if (!title || !link) continue;
            // Enforce per-role title signal (e.g. influencing must look like a creator role).
            if (roleSignal && !roleSignal.test(title)) {
              continue;
            }

            let jobType = "Full-time";
            if (r.partTime) jobType = "Part-time";
            else if (r.contractType === "Contract") jobType = "Contract";
            else if (r.contractType === "Temporary") jobType = "Temporary";

            let salary: string | null = null;
            if (r.minimumSalary && r.maximumSalary) {
              salary = `£${Math.round(r.minimumSalary)} - £${Math.round(r.maximumSalary)}`;
            } else if (r.minimumSalary) {
              salary = `£${Math.round(r.minimumSalary)}`;
            }

            const desc = (r.jobDescription || "").replace(/<[^>]*>/g, "").trim();
            // Try to map into one of our industries; fall back to the role's own bucket.
            const inferredIndustry = inferIndustryFromText(title, company, desc) || fallbackIndustry;

            let pubDate: Date;
            if (typeof r.date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(r.date)) {
              const [d, m, y] = r.date.split("/").map(Number);
              pubDate = new Date(Date.UTC(y, m - 1, d));
            } else {
              const parsed = r.date ? new Date(r.date) : new Date();
              pubDate = isNaN(parsed.getTime()) ? new Date() : parsed;
            }
            const expiresAt = new Date(pubDate.getTime() + 60 * 86400000).toISOString();

            allJobs.push({
              title: title.slice(0, 255),
              company: company.slice(0, 200),
              industry: inferredIndustry,
              value_chain_stage: null,
              role_category: role,
              location: (r.locationName || null)?.slice(0, 200) ?? null,
              type: jobType,
              salary,
              description: desc.slice(0, 2000) || null,
              url: link,
              source_url: "reed.co.uk",
              expires_at: expiresAt,
            });
          }

          if (results.length < reedPageSize) break;
        }
      } catch (err) {
        console.error(`Reed role fetch error for "${kw}":`, err);
      }
    }
  }

  // ── Adzuna pass ──
  if (adzunaAppId && adzunaAppKey) {
    setAdzunaSweep("role", role);
    for (const kw of keywords.slice(0, roleKeywordLimit)) {
      try {
        const pageResults = await Promise.all(
          Array.from({ length: adzunaPagesPerKeyword }, (_, i) => i + 1).map(async (page) => {
            const url = `https://api.adzuna.com/v1/api/jobs/gb/search/${page}?app_id=${encodeURIComponent(adzunaAppId)}&app_key=${encodeURIComponent(adzunaAppKey)}&results_per_page=50&what=${encodeURIComponent(kw)}&max_days_old=30&sort_by=date&content-type=application/json`;
            const res = await adzunaFetch(url);
            if (!res.ok) return [] as any[];
            const data = await res.json();
            const results = data.results || [];
            if (page === 1) console.log(`[role:${role}] Adzuna "${kw}": total=${data.count}, page1=${results.length}`);
            return results;
          })
        );

        // For nursing/care/health roles, retain NHS Trusts (largest employer of UK nurses).
        const isHealthRole = /\b(nurs|midwif|hca|healthcare|paramedic|doctor|gp|consultant|surgeon|physio|psychotherap|psychiatr|allied health|clinical|pharmac)\b/i.test(role);
        const GOV_FILTER = isHealthRole
          ? /\b(hm treasury|hmrc|home office|cabinet office|dwp|defra|mod |civil service|police force|borough council|county council|district council)\b/i
          : /\b(hm treasury|treasury|hmrc|home office|ministry of|cabinet office|nhs|dwp|defra|mod |civil service|government|police|council|borough|county council)\b/i;

        for (const results of pageResults) {
          for (const r of results) {
            const company = r.company?.display_name || "Unknown";
            const title = (r.title || "").slice(0, 255);
            // Use canonical Adzuna listing URL (avoid short-lived redirect_url).
            const link = r.id
              ? `https://www.adzuna.co.uk/details/${r.id}`
              : (r.redirect_url || "");
            if (!title || !link) continue;
            if (GOV_FILTER.test(company)) continue;
            // Enforce per-role title signal.
            if (roleSignal && !roleSignal.test(title)) continue;

            const desc = (r.description || "").replace(/<[^>]*>/g, "").trim();
            const inferredIndustry = inferIndustryFromText(title, company, desc) || fallbackIndustry;

            let salary: string | null = null;
            if (r.salary_min && r.salary_max) {
              salary = `£${Math.round(r.salary_min)} - £${Math.round(r.salary_max)}`;
            } else if (r.salary_min) {
              salary = `£${Math.round(r.salary_min)}`;
            }

            const pubDate = r.created ? new Date(r.created) : new Date();
            const expiresAt = new Date(pubDate.getTime() + 60 * 86400000).toISOString();

            allJobs.push({
              title,
              company: company.slice(0, 200),
              industry: inferredIndustry,
              value_chain_stage: null,
              role_category: role,
              location: (r.location?.display_name || null)?.slice(0, 200) ?? null,
              type: r.contract_time === "part_time" ? "Part-time" : "Full-time",
              salary,
              description: desc.slice(0, 2000) || null,
              url: link,
              source_url: "adzuna.com",
              expires_at: expiresAt,
            });
          }
        }
      } catch (err) {
        console.error(`Adzuna role fetch error for "${kw}":`, err);
      }
    }
  }

  return allJobs;
}

// ── Passion-driven sweep ────────────────────────────────────────────
// Pulls jobs by passion keyword (wine, golf, tennis, sailing, etc.) so we
// can surface lifestyle-aligned roles even for niches we don't have a
// dedicated industry page for. Results are tagged "passion-job" + "Passion: <name>"
// and the My Jobs scorer gives them a strong boost when the passion matches
// the user. industry is left null so the AI classifier can still backfill it.
const PASSION_KEYWORDS: Record<string, string[]> = {
  Wine: ["sommelier", "wine buyer", "wine merchant", "vineyard", "viticulture", "wine retail"],
  Golf: ["golf club", "greenkeeper", "golf coach", "pro shop", "golf operations", "PGA"],
  Tennis: ["tennis coach", "tennis academy", "tennis club", "racquets coach", "padel coach", "padel club"],
  Cycling: ["bike mechanic", "cycling coach", "bicycle retail", "Rapha", "Brompton"],
  Yoga: ["yoga teacher", "pilates instructor", "studio manager wellness"],
  Sailing: ["yacht", "sailing instructor", "marina", "RYA instructor"],
  Skiing: ["ski instructor", "chalet host", "ski resort", "snowsports"],
  Surfing: ["surf school", "surf shop", "watersports instructor"],
  Climbing: ["climbing wall", "climbing instructor", "route setter"],
  Photography: ["photographer", "photo assistant", "retoucher", "image editor"],
  Writing: ["copywriter", "content writer", "staff writer", "feature writer"],
  Art: ["gallery assistant", "curator", "art handler", "art dealer"],
  Gardening: ["gardener", "horticulturist", "landscape designer", "RHS"],
  Sustainability: ["sustainability manager", "ESG analyst", "climate", "carbon analyst"],
  Horses: ["stable hand", "groom equestrian", "racing yard", "stud farm"],
  Chocolate: ["chocolatier", "confectioner", "patissier chocolate"],
};

async function fetchPassionJobs(
  passion: string,
  keywords: string[],
  reedApiKey: string | undefined,
  adzunaAppId: string | undefined,
  adzunaAppKey: string | undefined,
) {
  const out: any[] = [];
  const tag = `Passion: ${passion}`;
  // Cap keywords per pass to keep us within rate limits.
  const kws = keywords.slice(0, 4);
  if (adzunaAppId && adzunaAppKey) setAdzunaSweep("passion", passion);

  for (const kw of kws) {
    // Adzuna
    if (adzunaAppId && adzunaAppKey) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${encodeURIComponent(adzunaAppId)}&app_key=${encodeURIComponent(adzunaAppKey)}&results_per_page=50&what=${encodeURIComponent(kw)}&max_days_old=30&sort_by=date&content-type=application/json`;
        const res = await adzunaFetch(url);
        if (res.ok) {
          const data = await res.json();
          for (const r of (data.results || [])) {
            const title = (r.title || "").slice(0, 255);
            // Use canonical Adzuna listing URL (avoid short-lived redirect_url).
            const link = r.id
              ? `https://www.adzuna.co.uk/details/${r.id}`
              : (r.redirect_url || "");
            if (!title || !link) continue;
            const desc = (r.description || "").slice(0, 1900);
            let salary: string | null = null;
            if (r.salary_min && r.salary_max) {
              salary = `£${Math.round(r.salary_min)} - £${Math.round(r.salary_max)}`;
            }
            out.push({
              title,
              company: (r.company?.display_name || "Unknown").slice(0, 200),
              industry: "passion", // synthetic bucket; classify-jobs may upgrade later
              location: r.location?.display_name?.slice(0, 200) || null,
              type: "Full-time",
              salary,
              description: desc,
              url: link,
              source_url: "adzuna.com",
              expires_at: r.created ? new Date(new Date(r.created).getTime() + 60 * 86400000).toISOString() : null,
              needs_review: true,
              tags: ["passion-job", tag],
            });
          }
        }
      } catch (err) {
        console.error(`Passion Adzuna error [${passion}/${kw}]:`, err);
      }
    }

    // Reed
    if (reedApiKey) {
      try {
        const auth = btoa(`${reedApiKey}:`);
        const url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(kw)}&resultsToTake=25`;
        const res = await fetch(url, {
          headers: { Authorization: `Basic ${auth}`, "User-Agent": "howdoyoudo-bot/1.0" },
        });
        if (res.ok) {
          const data = await res.json();
          for (const r of (data.results || [])) {
            const title = (r.jobTitle || "").trim();
            if (!title || !r.jobUrl) continue;
            let salary: string | null = null;
            if (r.minimumSalary && r.maximumSalary) {
              salary = `£${Math.round(r.minimumSalary)} - £${Math.round(r.maximumSalary)}`;
            }
            const desc = (r.jobDescription || "").replace(/<[^>]*>/g, "").trim();
            out.push({
              title: title.slice(0, 255),
              company: (r.employerName || "Reed").slice(0, 200),
              industry: "passion",
              location: (r.locationName || null)?.slice(0, 200) ?? null,
              type: r.partTime ? "Part-time" : "Full-time",
              salary,
              description: desc.slice(0, 2000) || null,
              url: r.jobUrl,
              source_url: "reed.co.uk",
              expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
              needs_review: true,
              tags: ["passion-job", tag],
            });
          }
        }
      } catch (err) {
        console.error(`Passion Reed error [${passion}/${kw}]:`, err);
      }
    }
  }

  return out;
}

// ── Main handler ────────────────────────────────────────────────────
// EdgeRuntime is provided by the Supabase Edge Functions runtime.
// Declared here so TS doesn't complain in the local typecheck.
declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void } | undefined;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const reedApiKey = Deno.env.get("REED_API_KEY");
    const joobleApiKey = Deno.env.get("JOOBLE_API_KEY");
    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    const indeedRapidApiKey = Deno.env.get("RAPIDAPI_INDEED_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Reset Adzuna telemetry for this run
    _adzunaTelemetry.startedAt = Date.now();
    _adzunaTelemetry.sweeps = new Map();
    _adzunaTelemetry.errors = [];
    _adzunaTelemetry.currentSweep = "other:unknown";
    const triggerSource = req.headers.get("x-trigger-source") || "manual";

    // Adzuna free-tier quota guard:
    // Re-sweeps fired by the industry-health-monitor were burning the entire
    // monthly Adzuna call budget within days. We skip Adzuna for the bulk of
    // health-monitor refetches and lean on Reed / Jooble / JSearch / ATS
    // instead. The main daily cron (`daily-adzuna`) always uses Adzuna, and
    // a single morning health-monitor run per day (`industry-health-monitor-morning`)
    // is also allowed an Adzuna top-up.
    const skipAdzuna = triggerSource === "industry-health-monitor";
    const adzunaAppId = skipAdzuna ? undefined : Deno.env.get("ADZUNA_APP_ID");
    const adzunaAppKey = skipAdzuna ? undefined : Deno.env.get("ADZUNA_API_KEY");
    if (skipAdzuna) {
      console.log(`[fetch-external-jobs] trigger=${triggerSource} → Adzuna skipped (quota guard)`);
    }

    // Optionally accept a specific industry/role, otherwise process everything.
    // Body shape: { industry?: string, role?: string, mode?: "industry"|"role"|"both"|"passions" }
    let targetIndustries: string[];
    let targetRoles: string[];
    let passionsOnly = false;
    let targetedRefresh = false;
    let forceCareersInRacing = false;
    // When set, restricts Adzuna sweeps to industries in this set. Other
    // sources (Reed/Jooble/RSS/ATS/direct feeds) still run for every industry
    // in `targetIndustries`. Empty set = no restriction (targeted refreshes).
    let adzunaAllowedSet: Set<string> = new Set();
    let adzunaGated = false;
    try {
      const body = await req.json();
      forceCareersInRacing = body?.forceCareersInRacing === true;
      if (body.mode === "passions") {
        targetIndustries = [];
        targetRoles = [];
        passionsOnly = true;
      } else if (body.industry) {
        targetedRefresh = true;
        targetIndustries = body.industry === "influencing" ? [] : [body.industry];
        targetRoles = body.industry === "influencing" ? ["influencing"] : [];
      } else if (body.role) {
        targetedRefresh = true;
        targetIndustries = [];
        targetRoles = [body.role];
      } else if (body.mode === "role") {
        targetIndustries = [];
        targetRoles = orderRolesForFairUse(Object.keys(ROLE_KEYWORDS));
      } else if (body.mode === "industry") {
        targetIndustries = orderIndustriesForFairUse([...Object.keys(INDUSTRY_KEYWORDS), "remote"]);
        targetRoles = [];
      } else if (body.mode === "all-industries") {
        // Explicit override to bypass day scheduling (admin/debug use)
        targetIndustries = orderIndustriesForFairUse([...Object.keys(INDUSTRY_KEYWORDS), "remote"]);
        targetRoles = orderRolesForFairUse(Object.keys(ROLE_KEYWORDS));
      } else {
        // Default cron path: process EVERY industry every run for the
        // free, no-quota sources (Reed/Jooble/RSS/ATS/direct employer
        // feeds), but stagger Adzuna across the 7-day bucket so we stay
        // under the 250 hits/day quota.
        targetIndustries = orderIndustriesForFairUse([...Object.keys(INDUSTRY_KEYWORDS), "remote"]);
        targetRoles = orderRolesForFairUse(Object.keys(ROLE_KEYWORDS));
        adzunaAllowedSet = getAdzunaAllowedSet();
        adzunaGated = true;
        console.log(`[schedule] Cron run → all ${targetIndustries.length} industries for non-Adzuna; Adzuna restricted to: ${Array.from(adzunaAllowedSet).join(", ")}`);
      }
    } catch {
      targetIndustries = orderIndustriesForFairUse([...Object.keys(INDUSTRY_KEYWORDS), "remote"]);
      targetRoles = orderRolesForFairUse(Object.keys(ROLE_KEYWORDS));
      adzunaAllowedSet = getAdzunaAllowedSet();
      adzunaGated = true;
    }

    // Heavy work - wrap in EdgeRuntime.waitUntil so we return 202 immediately and
    // continue fetching/upserting in the background. The HTTP gateway timeout is
    // 150s; a full multi-source ingestion (esp. for niche industries that need
    // many Adzuna pages) regularly exceeds that and previously left no rows
    // written. Returning early lets the runtime finish the job.
    const work = (async () => {
    let totalInserted = 0;
    let totalSkipped = 0;
    let totalExpired = 0;
    const errors: string[] = [];

    console.log(`Industry sweep order: ${targetIndustries.join(", ")}`);
    for (const industry of targetIndustries) {
      console.log(`\n=== [${industry}] Starting sweep${isAdzunaExhausted() ? " (Adzuna EXHAUSTED - skipping Adzuna)" : ""} ===`);
      const allJobs: any[] = [];

      // Horse racing has an official sector job board with a public sitemap.
      // Pull this first and avoid Adzuna when its quota is exhausted, otherwise
      // the racing refresh can time out before reaching the reliable source.
      if (industry === "horse-racing") {
        const horseDirectJobs: any[] = [];
        const cirSitemapJobs = await fetchCareersInRacingSitemapJobs();
        if (cirSitemapJobs.length > 0) {
          horseDirectJobs.push(...cirSitemapJobs);
          allJobs.push(...cirSitemapJobs);
          console.log(`[horse-racing] CareersInRacing sitemap: ${cirSitemapJobs.length} jobs`);
        }
        const yardAndGroomJobs = await fetchYardAndGroomJobs();
        if (yardAndGroomJobs.length > 0) {
          horseDirectJobs.push(...yardAndGroomJobs);
          allJobs.push(...yardAndGroomJobs);
          console.log(`[horse-racing] Yard&Groom: ${yardAndGroomJobs.length} jobs`);
        }
        const arcJobs = await fetchArenaRacingCompanyJobs();
        if (arcJobs.length > 0) {
          horseDirectJobs.push(...arcJobs);
          allJobs.push(...arcJobs);
          console.log(`[horse-racing] Arena Racing Company: ${arcJobs.length} jobs`);
        }
        const seenDirect = new Set<string>();
        const directToSave = horseDirectJobs.filter((j) => j.url && !seenDirect.has(j.url) && seenDirect.add(j.url));
        for (let i = 0; i < directToSave.length; i += 50) {
          totalInserted += await safeUpsertJobs(supabase, directToSave.slice(i, i + 50));
        }
        console.log(`[horse-racing] Direct sources saved immediately: ${directToSave.length} jobs`);
      }

      if (industry === "formula-1") {
        const f1DirectJobs = await fetchFormula1DirectJobs(Deno.env.get("FIRECRAWL_API_KEY") || undefined);
        if (f1DirectJobs.length > 0) {
          allJobs.push(...f1DirectJobs);
          for (let i = 0; i < f1DirectJobs.length; i += 50) {
            totalInserted += await safeUpsertJobs(supabase, f1DirectJobs.slice(i, i + 50));
          }
          console.log(`[formula-1] Direct sources saved immediately: ${f1DirectJobs.length} jobs`);
        }
      }

      // Run high-value direct employer feeds before slow aggregators so targeted
      // refreshes for brands like M&S / Next land even if Adzuna/Reed are slow.
      const priorityOracleTenants = ORACLE_HCM_TENANTS.filter((t) =>
        t.industry === industry || (t.routes ?? []).some((r) => r.industry === industry)
      );
      console.log(`[${industry}] Priority OracleHCM tenants: ${priorityOracleTenants.length} (${priorityOracleTenants.map(t => t.company).join(", ") || "none"})`);
      for (const tenant of priorityOracleTenants) {
        const oracleJobs = await fetchOracleHcmJobs(tenant);
        const matched = oracleJobs.filter((j) => j.industry === industry);
        console.log(`[${industry}] Priority OracleHCM(${tenant.company}): kept=${matched.length} of ${oracleJobs.length}`);
        if (matched.length > 0) {
          allJobs.push(...matched);
          // Save immediately so M&S/Next land even if the rest of the run times out.
          try {
            const inserted = await safeUpsertJobs(supabase, matched);
            totalInserted += inserted;
            console.log(`[${industry}] Priority OracleHCM(${tenant.company}): saved=${inserted}`);
          } catch (e: any) {
            console.error(`[${industry}] Priority OracleHCM(${tenant.company}) save error:`, e?.message || e);
          }
        }
      }

      // Priority Talent Funnel tenants - run early so Dr. Martens etc. land
      // even if later Adzuna passes time out.
      const priorityTfTenants = TALENT_FUNNEL_TENANTS.filter((t) =>
        t.industry === industry || (t.routes ?? []).some((r) => r.industry === industry)
      );
      for (const tenant of priorityTfTenants) {
        const tfJobs = await fetchTalentFunnelJobs(tenant);
        const matched = tfJobs.filter((j) => j.industry === industry);
        if (matched.length > 0) {
          allJobs.push(...matched);
          try {
            const inserted = await safeUpsertJobs(supabase, matched);
            totalInserted += inserted;
            console.log(`[${industry}] Priority TalentFunnel(${tenant.company}): saved=${inserted} of ${matched.length}`);
          } catch (e: any) {
            console.error(`[${industry}] Priority TalentFunnel(${tenant.company}) save error:`, e?.message || e);
          }
        }
      }

      // Day-bucket gate: when called via cron, only run Adzuna sweeps for
      // industries in today's allowed set. Targeted refreshes and admin
      // overrides leave adzunaGated=false so Adzuna runs for everything.
      const adzunaAllowedToday = !adzunaGated || adzunaAllowedSet.has(industry);
      if (adzunaAppId && adzunaAppKey && !isAdzunaExhausted() && adzunaAllowedToday) {
        const keywords = INDUSTRY_KEYWORDS[industry] || [];
        setAdzunaSweep("keyword", industry);
        const adzunaJobs = await fetchAdzunaJobs(industry, keywords, adzunaAppId, adzunaAppKey);
        recordAdzunaJobs(adzunaJobs.length);
        allJobs.push(...adzunaJobs);
        console.log(`[${industry}] Adzuna: ${adzunaJobs.length} jobs`);

        // 1b. Adzuna - temp pass (skip the synthetic "remote" industry)
        if (industry !== "remote" && !isAdzunaExhausted()) {
          setAdzunaSweep("temp", industry);
          const tempJobs = await fetchAdzunaJobs(industry, keywords, adzunaAppId, adzunaAppKey, { temp: true });
          recordAdzunaJobs(tempJobs.length);
          allJobs.push(...tempJobs);
          console.log(`[${industry}] Adzuna TEMP: ${tempJobs.length} jobs`);
        }

        // 1c. Adzuna - CATEGORY sweep (unlocks the long tail Adzuna has
        // for industries with a clean category mapping, e.g. teaching, film).
        // Quota-heavy — restricted to Sunday UTC to protect the monthly cap.
        const isCategorySweepDay = new Date().getUTCDay() === 0; // Sun
        if (isCategorySweepDay && industry !== "remote" && INDUSTRY_TO_ADZUNA_CATEGORY[industry] && !isAdzunaExhausted()) {
          setAdzunaSweep("category", industry);
          const catJobs = await fetchAdzunaByCategory(industry, adzunaAppId, adzunaAppKey);
          recordAdzunaJobs(catJobs.length);
          allJobs.push(...catJobs);
        }

        // 1d. Adzuna - GEO sweep (city-sliced category queries) for the
        // densest industries to push past the per-query 50-page cap.
        // Same weekly gate as the category sweep above.
        if (isCategorySweepDay && industry !== "remote" && ADZUNA_GEO_INDUSTRIES.has(industry) && !isAdzunaExhausted()) {
          setAdzunaSweep("geo", industry);
          const geoJobs = await fetchAdzunaByCategoryGeo(industry, adzunaAppId, adzunaAppKey);
          recordAdzunaJobs(geoJobs.length);
          allJobs.push(...geoJobs);
        }
      } else if (isAdzunaExhausted()) {
        console.log(`[${industry}] Adzuna SKIPPED (circuit-breaker open)`);
      } else if (!adzunaAllowedToday) {
        console.log(`[${industry}] Adzuna SKIPPED (not in today's day-bucket; non-Adzuna sources still running)`);
      }

      // 2. RSS feeds
      const feeds = RSS_JOB_FEEDS[industry];
      if (feeds) {
        const rssJobs = await fetchRssJobs(industry, feeds);
        allJobs.push(...rssJobs);
        console.log(`[${industry}] RSS: ${rssJobs.length} jobs`);
      }

      // 3. Jobicy (only when processing the "remote" pseudo-industry)
      if (industry === "remote") {
        const jobicyJobs = await fetchJobicyJobs();
        allJobs.push(...jobicyJobs);
        console.log(`[${industry}] Jobicy: ${jobicyJobs.length} jobs`);
      }

      // 4. Reed.co.uk (UK Jobseeker API)
      if (reedApiKey && industry !== "remote") {
        const keywords = INDUSTRY_KEYWORDS[industry] || [];
        if (keywords.length > 0) {
          const reedJobs = await fetchReedJobs(industry, keywords, reedApiKey);
          allJobs.push(...reedJobs);
          console.log(`[${industry}] Reed: ${reedJobs.length} jobs`);
        }
      }

      // 4b. NHS Jobs (jobs.nhs.uk) - direct scrape, health only.
      // The UK's largest single clinical employer; not well covered by
      // Adzuna/Reed because Trusts post almost exclusively here.
      if (industry === "health") {
        const nhsJobs = await fetchNhsJobs(industry);
        if (nhsJobs.length > 0) {
          allJobs.push(...nhsJobs);
          console.log(`[${industry}] NHS Jobs: ${nhsJobs.length} jobs`);
        }

        // 4c. NHS Jobs RSS (HealthJobsUK mirror) - much higher recall
        // than the HTML scrape. Provides thousands of clinical roles
        // per keyword in one request.
        const nhsRssJobs = await fetchNhsJobsRss(industry);
        if (nhsRssJobs.length > 0) {
          allJobs.push(...nhsRssJobs);
          console.log(`[${industry}] NHS Jobs RSS: ${nhsRssJobs.length} jobs`);
        }
      }

      // 5. GOV.UK Find a Job - disabled (RSS endpoint unreliable from edge runtime).
      // Adzuna already aggregates Find-a-Job listings server-side.

      // 6. The Muse (grad / entry-level, no key needed)
      const museJobs = await fetchMuseJobs(industry);
      if (museJobs.length > 0) {
        allJobs.push(...museJobs);
        console.log(`[${industry}] Muse: ${museJobs.length} jobs`);
      }

      // 12e. Eploy ATS (Dunelm, etc.) - Firecrawl-rendered SSR list.
      // ~1 Firecrawl scrape per tenant per refresh (single ?pagesize=100 page).
      const eployTenants = EPLOY_TENANTS.filter((t) =>
        t.industry === industry || (t.routes ?? []).some((r) => r.industry === industry)
      );
      if (eployTenants.length > 0) {
        const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
        if (firecrawlKey) {
          for (const tenant of eployTenants) {
            const eployJobs = await fetchEployJobs(tenant, firecrawlKey);
            const matched = eployJobs.filter((j) => j.industry === industry);
            if (matched.length > 0) {
              allJobs.push(...matched);
              console.log(`[${industry}] Eploy(${tenant.company}): ${matched.length} jobs (of ${eployJobs.length} total)`);
            }
          }
        } else {
          console.warn(`[${industry}] Eploy skipped - FIRECRAWL_API_KEY not set`);
        }
      }

      // 12c-v. Lever API tenants (Spotify) - free, no key.
      const leverTenants = LEVER_TENANTS.filter((t) =>
        t.industry === industry || (t.routes ?? []).some((r) => r.industry === industry)
      );
      for (const tenant of leverTenants) {
        const leverJobs = await fetchLeverJobs(tenant);
        const matched = leverJobs.filter((j) => j.industry === industry);
        if (matched.length > 0) {
          allJobs.push(...matched);
          console.log(`[${industry}] Lever(${tenant.company_slug}): ${matched.length} jobs`);
        }
      }

      // 12c-vi. SmartRecruiters API tenants (ASOS) - free, no key.
      const srTenants = SMARTRECRUITERS_TENANTS.filter((t) =>
        t.industry === industry || (t.routes ?? []).some((r) => r.industry === industry)
      );
      for (const tenant of srTenants) {
        const srJobs = await fetchSmartRecruitersJobs(tenant);
        const matched = srJobs.filter((j) => j.industry === industry);
        if (matched.length > 0) {
          allJobs.push(...matched);
          console.log(`[${industry}] SmartRecruiters(${tenant.companyId}): ${matched.length} jobs`);
        }
      }

      // 12c-vii. SAP SuccessFactors tenants (Bentley) - Firecrawl-rendered.
      const sfTenants = SUCCESSFACTORS_TENANTS.filter((t) => t.industry === industry);
      for (const tenant of sfTenants) {
        const sfJobs = await fetchSuccessFactorsJobs(tenant);
        if (sfJobs.length > 0) {
          allJobs.push(...sfJobs);
          console.log(`[${industry}] SuccessFactors(${tenant.company}): ${sfJobs.length} jobs`);
        }
      }

      // 7. Jooble (UK aggregator - 500 reqs/month, one query per industry)
      if (joobleApiKey && industry !== "remote") {
        const keywords = INDUSTRY_KEYWORDS[industry] || [];
        const joobleJobs = await fetchJoobleJobs(industry, keywords, joobleApiKey);
        if (joobleJobs.length > 0) {
          allJobs.push(...joobleJobs);
          console.log(`[${industry}] Jooble: ${joobleJobs.length} jobs`);
        }
      }

      // 8. Active Jobs DB (RapidAPI - direct ATS pulls, UK-filtered)
      if (rapidApiKey && industry !== "remote") {
        const keywords = INDUSTRY_KEYWORDS[industry] || [];
        const activeJobs = await fetchActiveJobsDb(industry, keywords, rapidApiKey);
        if (activeJobs.length > 0) {
          allJobs.push(...activeJobs);
          console.log(`[${industry}] ActiveJobsDB: ${activeJobs.length} jobs`);
        }
      }

      // 9. LinkedIn Job Search (RapidAPI - UK ATS pulls from LinkedIn)
      if (rapidApiKey && industry !== "remote") {
        const keywords = INDUSTRY_KEYWORDS[industry] || [];
        const linkedInJobs = await fetchLinkedInJobs(industry, keywords, rapidApiKey);
        if (linkedInJobs.length > 0) {
          allJobs.push(...linkedInJobs);
          console.log(`[${industry}] LinkedIn: ${linkedInJobs.length} jobs`);
        }
      }

      // 10. JSearch (RapidAPI - Indeed/LinkedIn/ZipRecruiter aggregator)
      // Defaults: 3 keywords × 5 pages × ~15 industries = ~225 reqs/day = ~67% of 10k quota.
      // Tune via env: JSEARCH_KEYWORDS_PER_INDUSTRY, JSEARCH_PAGES, JSEARCH_MAX_CALLS_PER_RUN.
      if (rapidApiKey && industry !== "remote") {
        const keywords = INDUSTRY_KEYWORDS[industry] || [];
        const jsearchJobs = await fetchJSearchJobs(industry, keywords, rapidApiKey);
        if (jsearchJobs.length > 0) {
          allJobs.push(...jsearchJobs);
          console.log(`[${industry}] JSearch: ${jsearchJobs.length} jobs (calls used: ${jsearchCallsThisRun})`);
        }
      }

      // 11. Internships API (Fantastic Jobs - dedicated intern/grad roles)
      // 2 keywords × 12 grad-friendly industries = ~24 calls/day
      // All results auto-tagged career_level='entry', type='Internship'
      if (rapidApiKey && industry !== "remote") {
        const internJobs = await fetchInternshipsJobs(industry, rapidApiKey);
        if (internJobs.length > 0) {
          allJobs.push(...internJobs);
          console.log(`[${industry}] Internships: ${internJobs.length} jobs (calls used: ${internshipsCallsThisRun})`);
        }
      }

      // 11b. Glassdoor via RapidAPI (3 calls/run max, top industries only)
      if (indeedRapidApiKey && industry !== "remote") {
        const keywords = INDUSTRY_KEYWORDS[industry] || [];
        const glassdoorJobs = await fetchGlassdoorJobs(industry, keywords, indeedRapidApiKey);
        if (glassdoorJobs.length > 0) {
          allJobs.push(...glassdoorJobs);
          console.log(`[${industry}] Glassdoor: ${glassdoorJobs.length} jobs (calls used: ${glassdoorCallsThisRun})`);
        }
      }

      // 11c. Indeed via RapidAPI (indeed12.p.rapidapi.com — separate key)
      if (indeedRapidApiKey && industry !== "remote") {
        const keywords = INDUSTRY_KEYWORDS[industry] || [];
        const indeedJobs = await fetchIndeedJobs(industry, keywords, indeedRapidApiKey);
        if (indeedJobs.length > 0) {
          allJobs.push(...indeedJobs);
          console.log(`[${industry}] Indeed: ${indeedJobs.length} jobs (calls used: ${indeedCallsThisRun})`);
        }
      }

      // 12. Pinpoint HR (direct ATS feeds - no key, no quota)
      // One HTTP call per tenant whose declared industry matches.
      const pinpointTenants = PINPOINT_TENANTS.filter((t) => t.industry === industry);
      for (const tenant of pinpointTenants) {
        const pinpointJobs = await fetchPinpointJobs(tenant);
        if (pinpointJobs.length > 0) {
          allJobs.push(...pinpointJobs);
          console.log(`[${industry}] Pinpoint(${tenant.slug}): ${pinpointJobs.length} jobs`);
        }
      }

      // 12b. Oracle Recruiting Cloud tenants (M&S, Next, etc.) - direct REST, no key.
      // We fetch each tenant whose primary OR routed industry matches the current pass,
      // then ingest only the jobs that bucket into the current industry. The Oracle
      // pull happens once per tenant per refresh - subsequent industry passes hit the
      // URL unique index and are deduped server-side.
      const oracleTenants = ORACLE_HCM_TENANTS.filter((t) =>
        t.industry === industry || (t.routes ?? []).some((r) => r.industry === industry)
      );
      for (const tenant of oracleTenants) {
        const oracleJobs = await fetchOracleHcmJobs(tenant);
        const matched = oracleJobs.filter((j) => j.industry === industry);
        if (matched.length > 0) {
          allJobs.push(...matched);
          console.log(`[${industry}] OracleHCM(${tenant.company}): ${matched.length} jobs (of ${oracleJobs.length} total)`);
        }
      }

      // 12c. Workday Recruiting tenants (LSEG, Bupa, Nike, Diageo, Skechers) - direct CXS API, no key.
      // Same per-industry pattern: pull each tenant whose primary or routed industry matches,
      // then bucket only the matching jobs. URL unique index dedupes across passes.
      const workdayTenants = WORKDAY_TENANTS.filter((t) =>
        t.industry === industry || (t.routes ?? []).some((r) => r.industry === industry)
      );
      for (const tenant of workdayTenants) {
        const workdayJobs = await fetchWorkdayJobs(tenant);
        const matched = workdayJobs.filter((j) => j.industry === industry);
        if (matched.length > 0) {
          allJobs.push(...matched);
          console.log(`[${industry}] Workday(${tenant.company}): ${matched.length} jobs (of ${workdayJobs.length} total)`);
        }
      }

      // 12c-ii. Greenhouse API tenants (Monzo, Sotheby's, etc.) - free, no key.
      const ghTenants = GREENHOUSE_TENANTS.filter((t) =>
        t.industry === industry || (t.routes ?? []).some((r) => r.industry === industry)
      );
      for (const tenant of ghTenants) {
        const ghJobs = await fetchGreenhouseJobs(tenant);
        const matched = ghJobs.filter((j) => j.industry === industry);
        if (matched.length > 0) {
          allJobs.push(...matched);
          console.log(`[${industry}] Greenhouse(${tenant.board}): ${matched.length} jobs`);
        }
      }

      // 12c-iii. Workable API tenants (Charlotte Tilbury, Zoopla, etc.) - free, no key.
      const wkTenants = WORKABLE_TENANTS.filter((t) => t.industry === industry);
      for (const tenant of wkTenants) {
        const wkJobs = await fetchWorkableJobs(tenant);
        if (wkJobs.length > 0) {
          allJobs.push(...wkJobs);
          console.log(`[${industry}] Workable(${tenant.slug}): ${wkJobs.length} jobs`);
        }
      }

      // 12c-iii-b. Workable public board aggregator (jobs.workable.com).
      // Free, no key. Pulls UK-located jobs across all opted-in Workable customers.
      if (Deno.env.get("WORKABLE_BOARD_ENABLED") !== "false") {
        const wbKeywords = INDUSTRY_KEYWORDS[industry] || [];
        const wbJobs = await fetchWorkableBoardJobs(industry, wbKeywords);
        if (wbJobs.length > 0) {
          allJobs.push(...wbJobs);
          console.log(`[${industry}] WorkableBoard: ${wbJobs.length} jobs`);
        }
      }

      // 12c-iv. Ashby API tenants (MUBI, JOOR) - free, no key.
      const ashTenants = ASHBY_TENANTS.filter((t) => t.industry === industry);
      for (const tenant of ashTenants) {
        const ashJobs = await fetchAshbyJobs(tenant);
        if (ashJobs.length > 0) {
          allJobs.push(...ashJobs);
          console.log(`[${industry}] Ashby(${tenant.board}): ${ashJobs.length} jobs`);
        }
      }

      // 12c-v. Jibe Apply (iCIMS-backed) tenants — Booking.com etc. Free, no key.
      const jibeTenants = JIBE_TENANTS.filter((t) => t.industry === industry);
      for (const tenant of jibeTenants) {
        const jibeJobs = await fetchJibeApplyJobs(tenant);
        if (jibeJobs.length > 0) {
          allJobs.push(...jibeJobs);
          console.log(`[${industry}] Jibe(${tenant.slug}): ${jibeJobs.length} jobs`);
        }
      }

      // 12d. Talent Funnel - already handled as priority source above.

      // 13. Careers in Racing (BHA-affiliated sectoral board) - horse-racing only
      // Runs every refresh now; CIR sitemap is light and yields the bulk of yard roles.
      if (industry === "horse-racing") {
        const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
        if (firecrawlKey) {
          const cirJobs = await fetchCareersInRacingJobs(firecrawlKey);
          if (cirJobs.length > 0) {
            allJobs.push(...cirJobs);
            console.log(`[horse-racing] CareersInRacing: ${cirJobs.length} jobs`);
          }
        } else {
          console.warn("[horse-racing] CareersInRacing skipped - FIRECRAWL_API_KEY not set");
        }
      }

      // 14. Crisis (Tribepad ATS) - charity only. ~1 Firecrawl scrape/refresh.
      if (industry === "charity") {
        const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
        if (firecrawlKey) {
          const crisisJobs = await fetchCrisisJobs(firecrawlKey);
          if (crisisJobs.length > 0) {
            allJobs.push(...crisisJobs);
            console.log(`[charity] Crisis: ${crisisJobs.length} jobs`);
          }
        } else {
          console.warn("[charity] Crisis skipped - FIRECRAWL_API_KEY not set");
        }
      }

      // 15. The AA careers (WordPress listings) - cars only. ~12 Firecrawl scrapes/refresh.
      if (industry === "cars") {
        const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
        if (firecrawlKey) {
          const aaJobs = await fetchTheAAJobs(firecrawlKey);
          if (aaJobs.length > 0) {
            allJobs.push(...aaJobs);
            console.log(`[cars] The AA: ${aaJobs.length} jobs`);
          }
        } else {
          console.warn("[cars] The AA skipped - FIRECRAWL_API_KEY not set");
        }
      }

      // 15b. TUI Group careers (Radancy) - travel only. Free, no key. ~10 HTTP calls.
      if (industry === "travel") {
        const tuiJobs = await fetchTuiCareersJobs();
        if (tuiJobs.length > 0) {
          allJobs.push(...tuiJobs);
          console.log(`[travel] TUI careers: ${tuiJobs.length} jobs`);
        }

        // 15c. Ryanair careers (WordPress) - free, no key. ~6-15 HTTP calls.
        const ryanairJobs = await fetchRyanairCareersJobs();
        if (ryanairJobs.length > 0) {
          allJobs.push(...ryanairJobs);
          console.log(`[travel] Ryanair careers: ${ryanairJobs.length} jobs`);
        }

        // 15d. easyJet careers (Taleo RSS) - free, no key. 1 HTTP call.
        const easyjetJobs = await fetchEasyJetCareersJobs();
        if (easyjetJobs.length > 0) {
          allJobs.push(...easyjetJobs);
          console.log(`[travel] easyJet careers: ${easyjetJobs.length} jobs`);
        }
      }





      // 16. Teach First (Salesforce-backed) - teaching only. ~6 Firecrawl scrapes/refresh.
      if (industry === "teaching") {
        const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
        if (firecrawlKey) {
          const tfJobs = await fetchTeachFirstJobs(firecrawlKey);
          if (tfJobs.length > 0) {
            allJobs.push(...tfJobs);
            console.log(`[teaching] Teach First: ${tfJobs.length} jobs`);
          }
        } else {
          console.warn("[teaching] Teach First skipped - FIRECRAWL_API_KEY not set");
        }
      }

      // 17. DICE (Greenhouse JSON API) - music only. 1 free HTTP call.
      if (industry === "music") {
        const diceJobs = await fetchDiceJobs();
        if (diceJobs.length > 0) {
          allJobs.push(...diceJobs);
          console.log(`[music] DICE: ${diceJobs.length} jobs`);
        }
      }

      if (allJobs.length === 0) continue;

      // 3. Local dedupe by URL within this batch (DB unique index handles cross-run dedupe)
      const seen = new Set<string>();
      const newJobs = allJobs.filter((j) => {
        if (!j.url) return false;
        if (seen.has(j.url)) return false;
        seen.add(j.url);
        return true;
      });
      totalSkipped += allJobs.length - newJobs.length;

      // 4. Upsert in batches of 50 - resilient to either unique-index conflict
      for (let i = 0; i < newJobs.length; i += 50) {
        const batch = newJobs.slice(i, i + 50);
        try {
          totalInserted += await safeUpsertJobs(supabase, batch);
        } catch (e: any) {
          console.error(`Insert error [${industry}]:`, e?.message || e);
          errors.push(`${industry}: ${e?.message || e}`);
        }
      }
    } // end of per-industry for loop


    // ── Graduate / internship sweep ────────────────────────────────
    // Single sweep across Adzuna + Reed using grad-specific keywords
    // ("graduate scheme", "internship", "spring week" …). Industry is set
    // to "graduate" as a placeholder; classify-jobs re-tags the real
    // industry via AI on a second pass. All results forced to type
    // "Internship" + career_level "entry" so the Internships tab picks
    // them up immediately.
    const includeGradSweep = !targetedRefresh && (targetIndustries.length > 0 || targetRoles.length > 0);
    if (includeGradSweep) {
      const gradJobs: any[] = [];
      if (adzunaAppId && adzunaAppKey) {
        setAdzunaSweep("grad", "graduate");
        const adzGrad = await fetchAdzunaJobs("graduate", [], adzunaAppId, adzunaAppKey, { grad: true });
        recordAdzunaJobs(adzGrad.length);
        gradJobs.push(...adzGrad);
        console.log(`[grad-sweep] Adzuna: ${adzGrad.length} jobs`);
      }
      if (reedApiKey) {
        const reedGrad = await fetchReedJobs("graduate", [], reedApiKey, { grad: true });
        gradJobs.push(...reedGrad);
        console.log(`[grad-sweep] Reed: ${reedGrad.length} jobs`);
      }

      if (gradJobs.length > 0) {
        // Local in-batch dedupe; DB unique index handles the rest
        const seen = new Set<string>();
        const newJobs = gradJobs.filter((j) => {
          if (!j.url) return false;
          if (seen.has(j.url)) return false;
          seen.add(j.url);
          return true;
        });
        totalSkipped += gradJobs.length - newJobs.length;

        // Mark for AI re-classification so industry gets set properly
        for (const j of newJobs) j.needs_review = true;

        for (let i = 0; i < newJobs.length; i += 50) {
          const batch = newJobs.slice(i, i + 50);
          try {
            totalInserted += await safeUpsertJobs(supabase, batch);
          } catch (e: any) {
            console.error(`Insert error [grad-sweep]:`, e?.message || e);
            errors.push(`grad-sweep: ${e?.message || e}`);
          }
        }
      }
    }

    // ── Role-based ingest pass ─────────────────────────────────────
    // Runs after the industry loop. Hits Reed + Adzuna with role-specific
    // keywords (e.g., "marketing manager") with no industry filter, then
    // infers the industry from the result. Captures cross-industry roles
    // missed by the industry pass.
    // NOTE: targetRoles is sorted by orderRolesForFairUse() so heavy roles
    // (like "influencing", which has 50+ creator-economy synonyms) run LAST.
    // This stops them from burning the Adzuna 60s rate-limit window early
    // and starving the other roles with HTTP 429s.
    for (const role of targetRoles) {
      const keywords = ROLE_KEYWORDS[role];
      if (!keywords || keywords.length === 0) continue;

      const roleJobs = await fetchRoleJobs(role, keywords, reedApiKey, adzunaAppId, adzunaAppKey);
      if (roleJobs.length === 0) continue;
      console.log(`[role:${role}] total fetched: ${roleJobs.length}`);

      const seen = new Set<string>();
      const newJobs = roleJobs.filter((j) => {
        if (!j.url) return false;
        if (seen.has(j.url)) return false;
        seen.add(j.url);
        return true;
      });
      totalSkipped += roleJobs.length - newJobs.length;

      for (let i = 0; i < newJobs.length; i += 50) {
        const batch = newJobs.slice(i, i + 50);
        try {
          totalInserted += await safeUpsertJobs(supabase, batch);
        } catch (e: any) {
          console.error(`Insert error [role:${role}]:`, e?.message || e);
          errors.push(`role:${role}: ${e?.message || e}`);
        }
      }
    }

    // ── Entry-level role sweep ─────────────────────────────────────
    // Same as the role pass above, but with junior/assistant/coordinator/
    // graduate/trainee titles to widen entry-level coverage on business
    // roles. Reed + Adzuna only; classified by the existing trigger.
    for (const role of targetRoles) {
      const entryKeywords = ENTRY_LEVEL_ROLE_KEYWORDS[role];
      if (!entryKeywords || entryKeywords.length === 0) continue;

      const roleJobs = await fetchRoleJobs(role, entryKeywords, reedApiKey, adzunaAppId, adzunaAppKey);
      if (roleJobs.length === 0) continue;
      console.log(`[entry:${role}] total fetched: ${roleJobs.length}`);

      const seen = new Set<string>();
      const newJobs = roleJobs.filter((j) => {
        if (!j.url) return false;
        if (seen.has(j.url)) return false;
        seen.add(j.url);
        return true;
      });
      totalSkipped += roleJobs.length - newJobs.length;

      for (let i = 0; i < newJobs.length; i += 50) {
        const batch = newJobs.slice(i, i + 50);
        try {
          totalInserted += await safeUpsertJobs(supabase, batch);
        } catch (e: any) {
          console.error(`Insert error [entry:${role}]:`, e?.message || e);
          errors.push(`entry:${role}: ${e?.message || e}`);
        }
      }
    }

    // ── Passion sweep ──────────────────────────────────────────────
    // Pulls jobs by lifestyle keyword (wine, golf, tennis, sailing, etc.)
    // Tagged "passion-job" so the My Jobs scorer can boost them for users
    // who love that thing - even when we don't have a dedicated industry page.
    const includePassionSweep = passionsOnly || (!targetedRefresh && (targetIndustries.length > 0 || targetRoles.length > 0));
    if (includePassionSweep) {
      for (const [passion, keywords] of Object.entries(PASSION_KEYWORDS)) {
        const passionJobs = await fetchPassionJobs(passion, keywords, reedApiKey, adzunaAppId, adzunaAppKey);
        if (passionJobs.length === 0) continue;
        console.log(`[passion:${passion}] fetched: ${passionJobs.length}`);

        const seen = new Set<string>();
        const newJobs = passionJobs.filter((j) => {
          if (!j.url) return false;
          if (seen.has(j.url)) return false;
          seen.add(j.url);
          return true;
        });
        totalSkipped += passionJobs.length - newJobs.length;

        for (let i = 0; i < newJobs.length; i += 50) {
          const batch = newJobs.slice(i, i + 50);
          try {
            totalInserted += await safeUpsertJobs(supabase, batch);
          } catch (e: any) {
            console.error(`Insert error [passion:${passion}]:`, e?.message || e);
            errors.push(`passion:${passion}: ${e?.message || e}`);
          }
        }
      }
    }

    // 5. Clean expired listings globally
    const { data: expired } = await supabase
      .from("jobs")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .not("expires_at", "is", null)
      .select("id");

    totalExpired = expired?.length || 0;

    console.log(`Done: inserted=${totalInserted}, skipped=${totalSkipped}, expired=${totalExpired}`);

    // ── Write Adzuna run telemetry ──────────────────────────────────
    try {
      const sweepRows = Array.from(_adzunaTelemetry.sweeps.entries()).map(([key, s]) => {
        const [kind, ...rest] = key.split(":");
        return { kind, target: rest.join(":"), requests: s.requests, errors: s.errors, jobs: s.jobs };
      });
      const totalReq = sweepRows.reduce((a, b) => a + b.requests, 0);
      const totalErr = sweepRows.reduce((a, b) => a + b.errors, 0);
      const totalAdzJobs = sweepRows.reduce((a, b) => a + b.jobs, 0);
      const finishedAt = Date.now();
      await supabase.from("adzuna_run_log").insert({
        started_at: new Date(_adzunaTelemetry.startedAt).toISOString(),
        finished_at: new Date(finishedAt).toISOString(),
        duration_ms: finishedAt - _adzunaTelemetry.startedAt,
        total_requests: totalReq,
        total_errors: totalErr,
        total_jobs_returned: totalAdzJobs,
        sweeps: sweepRows,
        errors: _adzunaTelemetry.errors.slice(-100), // cap noise
        trigger_source: triggerSource,
        industries: targetIndustries,
      });
    } catch (logErr) {
      console.error("Failed to write adzuna_run_log:", logErr);
    }

    console.log(`fetch-external-jobs background work done: inserted=${totalInserted}, skipped=${totalSkipped}, expired=${totalExpired}`);
    })(); // end of work IIFE

    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      EdgeRuntime.waitUntil(work);
    } else {
      // Local/dev fallback - await inline.
      await work;
    }

    return new Response(
      JSON.stringify({
        success: true,
        accepted: true,
        message: "Job fetch started in background",
        industries: targetIndustries,
        roles: targetRoles,
      }),
      { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("fetch-external-jobs error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
