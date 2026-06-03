// ──────────────────────────────────────────────────────────────────────
// Industry Registry - single source of truth for backend ingestion
// ──────────────────────────────────────────────────────────────────────
// Every industry the platform supports is listed here ONCE with:
//   • slug          - canonical url segment (matches src/data/industries.ts)
//   • name          - display name
//   • synonyms      - alternative spellings, US/UK variants, related terms,
//                     and common phrasings used by aggregators. Merged into
//                     the keyword list at fetch time so we never miss a job
//                     just because Adzuna/Reed/Jooble use a different word.
//   • baseline      - minimum healthy live job count (used by industry-health-monitor)
//
// Adding a new industry? Add it here AND to src/data/industries.ts.
// Renaming the slug? Update both files. Slugs MUST match.
//
// This registry is intentionally additive: it AUGMENTS the existing per-source
// keyword lists, blocklists and required-signal regexes in fetch-external-jobs.
// It does not replace them - those still encode source-specific quirks.
// ──────────────────────────────────────────────────────────────────────

export interface IndustrySpec {
  slug: string;
  name: string;
  /** Alternative spellings, synonyms, US/UK variants, related job terms */
  synonyms: string[];
  /** Min healthy live job count for industry-health-monitor */
  baseline: number;
}

export const INDUSTRY_REGISTRY: IndustrySpec[] = [
  {
    slug: "bakery",
    name: "Bakery",
    baseline: 200,
    synonyms: [
      "baker", "bakery", "bakery assistant", "bakery manager", "bakery production",
      "bread baker", "bread maker", "artisan baker", "sourdough baker",
      "pastry chef", "pastry commis", "patissier", "patisserie", "viennoiserie",
      "cake decorator", "chocolatier", "boulanger", "boulangerie",
    ],
  },
  {
    slug: "beauty",
    name: "Beauty",
    baseline: 400,
    synonyms: [
      "beauty", "beauty advisor", "beauty consultant", "beauty therapist", "beauty editor",
      "beauty buyer", "beauty marketing", "beautician",
      "makeup artist", "make-up artist", "make up artist", "MUA",
      "cosmetic chemist", "cosmetics", "skincare formulator", "skincare",
      "esthetician", "aesthetician", "spa therapist", "nail technician", "nail tech",
      "salon manager", "hair stylist", "hairdresser", "hair colourist", "barber",
      "fragrance developer", "perfumer", "brow technician", "lash technician",
    ],
  },
  {
    slug: "beer",
    name: "Beer",
    baseline: 800,
    synonyms: [
      "beer", "brewer", "brewery", "head brewer", "assistant brewer", "brewing",
      "cellar", "cellarperson", "cellar manager", "taproom", "taproom manager",
      "pub manager", "publican", "bar manager", "bar staff",
      "beer sommelier", "cicerone", "craft beer", "cask ale", "real ale",
      "draught", "draft beer", "kegging", "bottling line",
    ],
  },
  {
    slug: "cars",
    name: "Cars",
    baseline: 200,
    synonyms: [
      "automotive", "automobile", "motor trade", "car retail", "car dealership",
      "dealership", "vehicle dealership", "car dealer", "vehicle sales", "used car",
      "automotive engineer", "vehicle technician", "vehicle mechanic", "car mechanic",
      "MOT tester", "service technician", "diagnostic technician", "vehicle inspector",
      "panel beater", "bodyshop", "body shop", "paint sprayer", "vehicle painter",
      "tyre fitter", "tire fitter",
      "HGV technician", "LCV technician", "EV technician", "electric vehicle",
      "battery engineer", "powertrain engineer", "chassis engineer",
      "service advisor", "aftersales advisor", "warranty administrator",
      "workshop controller", "service manager", "parts advisor",
      "car sales executive", "sales manager automotive", "fleet sales", "fleet manager",
      "PDI technician", "vehicle preparation",
    ],
  },
  {
    slug: "charity",
    name: "Charity",
    baseline: 150,
    synonyms: [
      "charity", "charities", "third sector", "nonprofit", "non-profit", "not for profit",
      "NGO", "voluntary sector", "social enterprise",
      "fundraiser", "fundraising", "fundraising manager", "community fundraiser",
      "trusts and foundations", "trust fundraiser", "major donor",
      "grant manager", "grants officer", "impact officer", "impact manager",
      "campaign manager charity", "charity shop manager", "volunteer coordinator",
      "programme manager charity", "policy officer", "advocacy officer",
    ],
  },
  {
    slug: "cinema",
    name: "Film and TV",
    baseline: 80,
    synonyms: [
      "film", "film production", "film crew", "film editor", "film director", "film producer",
      "filmmaker", "cinema", "cinema manager", "screenwriter", "scriptwriter",
      "VFX", "VFX artist", "visual effects", "casting director", "casting assistant",
      "production assistant", "post production", "post-production", "postproduction",
      "television", "television production", "TV", "TV production", "tv producer",
      "documentary", "documentary producer", "broadcast producer", "broadcast",
      "video editor", "videographer", "cinematographer", "DOP", "director of photography",
      "projectionist", "animation", "animator", "studio production",
      "runner", "production runner", "AD", "assistant director", "boom operator",
      "sound recordist", "gaffer", "grip", "sparks", "lighting technician",
    ],
  },
  {
    slug: "coffee",
    name: "Coffee",
    baseline: 300,
    synonyms: [
      "coffee", "café", "cafe", "coffee shop", "coffee house",
      "barista", "head barista", "shift leader cafe", "café manager", "cafe manager",
      "coffee roaster", "roaster", "green coffee", "specialty coffee", "speciality coffee",
      "coffee buyer", "coffee trainer", "coffee educator",
      "cupping", "Q grader", "espresso", "latte art",
    ],
  },
  {
    slug: "estate-agency",
    name: "Estate Agency",
    baseline: 200,
    synonyms: [
      "estate agent", "estate agency", "real estate", "realtor",
      "lettings", "lettings negotiator", "lettings manager", "lettings consultant",
      "property manager", "property management", "property consultant", "property valuer",
      "block manager", "build to rent", "BTR",
      "sales negotiator", "branch manager estate agency",
      "conveyancer", "conveyancing",
      "mortgage adviser", "mortgage advisor", "mortgage broker",
      "surveyor", "surveyor RICS", "chartered surveyor", "valuation surveyor",
      "land agent", "rural surveyor",
    ],
  },
  {
    slug: "farming",
    name: "Farming",
    baseline: 300,
    synonyms: [
      "farming", "farmer", "farm manager", "farm worker", "farmhand", "farm hand",
      "agriculture", "agricultural", "agritech", "agri-tech", "agri tech", "ag tech",
      "agronomist", "agronomy", "crop manager", "arable farm", "arable manager",
      "herd manager", "stockperson", "livestock manager", "dairy farm", "dairy herdsperson",
      "poultry manager", "poultry farm", "shepherd",
      "tractor driver", "combine driver", "machinery operator",
      "horticulture", "horticulturist", "soft fruit grower", "grower",
      "agricultural engineer", "precision agriculture",
      "grain trader", "rural surveyor", "farm shop manager",
      "viticulture", "viticulturist", "vineyard manager", "vineyard",
    ],
  },
  {
    slug: "fashion",
    name: "Fashion",
    baseline: 150,
    synonyms: [
      "fashion", "apparel", "clothing", "garment", "garments",
      "fashion designer", "fashion design", "designer womenswear", "designer menswear",
      "garment technologist", "pattern cutter", "sample machinist",
      "fashion buyer", "buying admin assistant fashion", "BAA",
      "fashion merchandiser", "merchandising fashion", "MAA merchandising",
      "visual merchandiser", "VM", "fashion stylist", "personal stylist",
      "fashion ecommerce", "fashion PR", "fashion press", "fashion assistant",
      "fashion editor", "fashion writer", "fashion marketing",
      "luxury retail", "luxury fashion", "ready-to-wear", "RTW", "haute couture",
      "textile", "textiles", "fabric technologist", "print designer",
    ],
  },
  {
    slug: "football",
    name: "Football",
    baseline: 400,
    synonyms: [
      "football", "soccer", "football club", "premier league", "EFL", "FA group",
      "UEFA", "FIFA", "football academy", "football operations", "club commercial",
      "sports", "sports marketing", "sports commercial", "sports sponsorship",
      "sports media", "sports analyst", "performance analyst football",
      "broadcast rights", "matchday operations", "stadium manager", "stadium operations",
      "fan engagement", "ticketing manager", "ticketing operations",
      "football PR", "football communications", "football partnerships",
      "football data", "football scouting", "scout", "recruitment analyst football",
      "kit manager", "groundsman", "groundskeeper", "head of grounds",
    ],
  },
  {
    slug: "formula-1",
    name: "Formula 1",
    baseline: 200,
    synonyms: [
      "formula 1", "formula one", "F1", "motorsport", "motor sport",
      "formula 1 engineer", "F1 engineer", "F1 team", "F1 racing",
      "aerodynamicist", "race engineer", "performance engineer F1",
      "composite technician", "composites F1", "laminator motorsport",
      "simulation engineer", "vehicle dynamics engineer",
      "CFD engineer", "computational fluid dynamics",
      "pit crew", "pit mechanic", "F1 mechanic", "race mechanic",
      "tyre engineer", "tire engineer", "tyre strategy",
      "strategy engineer F1", "race strategist",
      "wind tunnel", "wind tunnel technician", "wind tunnel engineer",
      "trackside engineer", "trackside systems", "telemetry engineer",
      "F1 logistics", "motorsport logistics", "freight coordinator motorsport",
      "sponsorship manager F1", "motorsport sponsorship",
      "hospitality F1", "paddock club", "paddock operations",
      "F1 broadcast", "F1 presenter", "F1 journalist", "motorsport journalist",
      "team principal", "technical director F1", "sporting director",
      "head of aerodynamics", "head of vehicle performance",
      "McLaren", "Mercedes F1", "Red Bull Racing", "Aston Martin F1",
      "Williams Racing", "Alpine F1", "Haas F1", "Cadillac F1",
      "Silverstone", "motorsport valley",
    ],
  },
  {
    slug: "footwear",
    name: "Footwear",
    baseline: 60,
    synonyms: [
      "footwear", "shoe", "shoes", "sneaker", "sneakers", "trainers", "trainer brand",
      "footwear designer", "shoe designer", "footwear development",
      "footwear production", "shoemaker", "cordwainer",
      "shoe buyer", "footwear buyer", "footwear merchandiser", "shoe retail",
      "footwear technologist", "last maker", "pattern maker shoes",
      "boot maker", "heel designer",
      "shoe store manager", "footwear supply chain", "sneaker store",
      "shoe brand", "footwear warehouse", "running shoe", "sports footwear",
      "shoe company", "footwear retail", "shoe shop", "footwear brand",
      "athletic footwear", "shoe factory", "footwear sourcing",
    ],
  },
  {
    slug: "gaming",
    name: "Gaming",
    baseline: 40,
    synonyms: [
      "gaming", "games", "video games", "videogames", "video game", "game",
      "game designer", "game developer", "game artist", "game programmer", "game producer",
      "QA tester games", "QA games", "games tester",
      "esports", "e-sports", "esports manager",
      "unity developer", "unreal developer", "unreal engine", "unity engine",
      "narrative designer", "level designer", "gameplay engineer", "gameplay programmer",
      "gameplay designer", "technical artist", "concept artist games", "3d artist games",
      "game audio", "sound designer games", "game writer",
    ],
  },
  {
    slug: "grocery",
    name: "Grocery",
    baseline: 150,
    synonyms: [
      "grocery", "supermarket", "supermarkets", "convenience store", "corner shop",
      "FMCG", "fast moving consumer goods",
      "grocery retail", "grocery buyer", "grocery delivery",
      "category manager grocery", "category manager FMCG",
      "store manager supermarket", "shop assistant", "checkout", "till operator",
      "supply chain FMCG", "supply chain grocery",
      "fresh foods", "produce manager", "deli counter", "butcher", "fishmonger",
    ],
  },
  {
    slug: "health",
    name: "Health",
    baseline: 600,
    synonyms: [
      "health", "healthcare", "health care", "medical", "clinical", "NHS",
      // Nursing
      "nurse", "registered nurse", "RN", "staff nurse", "ward nurse", "specialist nurse",
      "nurse practitioner", "advanced nurse practitioner", "ANP", "clinical nurse specialist",
      "district nurse", "community nurse", "practice nurse", "school nurse",
      "mental health nurse", "RMN", "RGN", "RNLD", "learning disability nurse",
      "paediatric nurse", "pediatric nurse", "neonatal nurse",
      "theatre nurse", "scrub nurse", "ICU nurse", "ITU nurse",
      "A&E nurse", "ER nurse", "emergency nurse", "oncology nurse",
      "midwife", "community midwife", "health visitor",
      "band 5 nurse", "band 6 nurse", "band 7 nurse",
      // Care
      "healthcare assistant", "HCA", "nursing assistant", "care assistant", "carer",
      "care worker", "care home manager", "live-in carer", "support worker",
      "social worker",
      // Medical
      "doctor", "GP", "general practitioner", "hospital doctor", "consultant doctor",
      "physician", "surgeon", "psychiatrist", "registrar", "junior doctor",
      "FY1", "FY2", "ST1", "ST2",
      // Allied
      "pharmacist", "pharmacy technician", "paramedic", "ambulance technician",
      "radiographer", "occupational therapist", "OT",
      "speech and language therapist", "SLT", "dietitian", "dietician",
      "podiatrist", "audiologist", "phlebotomist",
      // Adjacent
      "clinical researcher", "biomedical scientist", "medtech", "med tech",
      "health data scientist", "pharma sales", "hospital manager", "practice manager GP",
      "public health", "health economist",
    ],
  },
  {
    slug: "horse-racing",
    name: "Horse Racing",
    baseline: 150,
    synonyms: [
      "horse racing", "horseracing", "horse-racing", "thoroughbred", "racing yard",
      "racehorse", "race horse", "racehorse trainer", "assistant trainer",
      "stable lass", "stable lad", "stable hand", "stablehand",
      "work rider", "head lad", "head lass", "head person racing",
      "pupil assistant", "travelling head",
      "jockey", "amateur jockey", "apprentice jockey", "conditional jockey",
      "equine vet", "equine veterinary nurse", "equine dentist", "farrier",
      "racecourse manager", "clerk of the course", "racecourse operations",
      "bloodstock", "bloodstock agent", "stud manager", "stud groom",
      "racing manager", "racing journalist", "racing broadcaster", "BHA",
      "yearling manager", "foaling assistant",
    ],
  },
  {
    slug: "hospitality",
    name: "Food & Drink",
    baseline: 800,
    synonyms: [
      "hospitality", "food and drink", "food & drink", "F&B", "food and beverage",
      "restaurant", "restaurants", "restaurant manager", "restaurant general manager",
      "GM restaurant", "AGM restaurant", "assistant general manager",
      "head chef", "executive chef", "sous chef", "chef de partie", "CDP",
      "commis chef", "chef", "private chef", "pastry chef restaurant",
      "kitchen manager", "kitchen porter", "KP",
      "front of house", "FOH", "back of house", "BOH",
      "waiter", "waitress", "wait staff", "server", "host", "hostess",
      "bartender", "barback", "bar manager", "bar supervisor",
      "hotel manager", "hotel general manager", "hotel receptionist",
      "concierge", "housekeeping supervisor", "housekeeper",
      "events manager hospitality", "banqueting manager",
      "café manager", "deli manager", "gastropub", "fine dining",
      "food technologist", "menu development", "events catering", "catering manager",
    ],
  },
  {
    slug: "influencing",
    name: "Influencing",
    baseline: 200,
    synonyms: [
      "influencer", "creator", "content creator", "creator economy",
      "creator manager", "creator marketing", "creator marketing manager",
      "youtube creator", "youtuber", "vlogger", "tiktok creator", "tiktoker",
      "instagram creator", "instagrammer",
      "podcast host", "podcaster", "newsletter writer", "substack writer",
      "live streamer", "streamer", "twitch streamer",
      // Production
      "video editor", "short form video editor", "reels editor", "shorts editor",
      "youtube video editor", "videographer", "creator videographer",
      "photographer creator", "content photographer",
      "podcast producer", "video producer creator", "shorts producer",
      "motion designer creator", "thumbnail designer", "graphic designer creator",
      // Talent mgmt
      "talent manager", "creator talent manager", "talent agent", "creator agent",
      "talent booker", "booker creator", "talent scout", "creator scout",
      // Brand & sales
      "influencer marketing", "influencer marketing manager", "influencer manager",
      "creator partnerships", "creator partnerships manager", "partnerships manager creator",
      "branded content manager", "campaign manager influencer",
      "sales executive influencer", "account executive creator",
      "PR manager creator", "comms manager creator",
      // Strategy & growth
      "social media", "social media manager", "social media executive", "social media coordinator",
      "social media strategist", "social strategist",
      "community manager", "community manager creator", "community lead",
      "growth lead creator", "audience growth", "growth analytics",
      "paid social", "paid social specialist", "paid social manager",
      "SEO specialist creator", "discovery specialist", "youtube SEO",
      "tiktok manager", "youtube manager", "instagram manager",
      // Business & ops
      "creator business manager", "creator operations", "creator ops",
      "brand director creator", "head of creator",
      "legal counsel creator", "contracts counsel influencer",
      "operations manager creator", "finance manager creator",
      // Catch-all
      "tiktok", "youtube", "instagram", "podcast", "reels", "shorts",
    ],
  },
  {
    slug: "interior-design",
    name: "Interior Design",
    baseline: 80,
    synonyms: [
      "interior design", "interior designer", "interior architect", "interior architecture",
      "interior stylist", "interiors stylist",
      "furniture designer", "furniture maker", "cabinet maker",
      "kitchen designer", "bathroom designer",
      "showroom manager interiors", "showroom manager furniture",
      "FF&E designer", "FFE designer",
      "junior interior designer", "design studio", "homeware buyer", "homewares buyer",
      "lighting designer", "soft furnishings designer",
    ],
  },
  {
    slug: "jewellery",
    name: "Jewellery",
    baseline: 50,
    synonyms: [
      "jewellery", "jewelry", "jewellery designer", "jewelry designer",
      "jeweller", "jeweler", "bench jeweller", "goldsmith", "silversmith",
      "gemmologist", "gemologist", "diamond grader", "diamond setter",
      "stone setter", "polisher",
      "jewellery retail", "jewelry retail", "jewellery sales consultant",
      "watchmaker", "horologist", "watch repair",
      "jewellery valuer", "jewelry valuer", "appraiser jewellery",
      "fine jewellery", "fine jewelry", "demi-fine jewellery",
    ],
  },
  {
    slug: "journalism",
    name: "Journalism",
    baseline: 80,
    synonyms: [
      "journalism", "journalist", "reporter", "correspondent",
      "news editor", "sub editor", "subeditor", "copy editor",
      "broadcast journalist", "press officer", "newsroom",
      "NCTJ", "digital journalist", "online journalist", "news producer",
      "feature writer", "features editor", "investigative journalist",
      "staff writer", "contributing editor", "magazine editor",
      "editor in chief", "editor-in-chief", "managing editor",
      "fact checker", "researcher journalist", "podcast journalist",
    ],
  },
  {
    slug: "money",
    name: "Money",
    baseline: 600,
    synonyms: [
      "finance", "financial services", "banking", "investment",
      "investment banker", "retail banker", "private banker",
      "relationship manager bank", "credit analyst", "credit risk analyst",
      "portfolio manager", "fund manager", "equity research", "equity analyst",
      "quantitative analyst", "quant", "wealth manager", "wealth management",
      "ESG analyst", "sustainability analyst finance",
      "underwriter", "underwriter insurance", "actuary", "actuarial analyst",
      "insurance broker", "claims manager", "claims handler",
      "fintech", "fintech product manager", "payments engineer", "payments analyst",
      "compliance officer financial", "AML analyst", "KYC analyst",
      "chartered accountant", "ACA", "ACCA", "CIMA", "auditor", "audit senior",
      "tax adviser", "tax advisor", "tax manager", "forensic accountant",
      "CFO", "finance director", "FD", "financial controller",
      "trader", "trader equities", "FX trader", "treasurer", "treasury analyst",
      "risk manager financial", "operational risk",
      "financial planner", "financial adviser", "financial advisor",
      "IFA", "independent financial adviser",
      "asset management", "asset manager",
      "mortgage broker", "mortgage adviser", "mortgage advisor", "protection adviser",
    ],
  },
  {
    slug: "music",
    name: "Music",
    baseline: 100,
    synonyms: [
      "music", "music industry",
      "music producer", "record producer", "sound engineer", "audio engineer",
      "mixing engineer", "mastering engineer",
      "music marketing", "music PR", "music publicist",
      "live events music", "live music", "tour manager", "tour assistant",
      "venue manager", "venue booker", "live sound", "live sound engineer",
      "record label", "label manager", "A&R", "A and R", "artists and repertoire",
      "music publishing", "music publisher", "sync licensing", "sync agent",
      "session musician", "music supervisor",
    ],
  },
  {
    slug: "pets",
    name: "Pets",
    baseline: 50,
    synonyms: [
      "pets", "pet care", "animal care", "animal welfare",
      "veterinary", "veterinary surgeon", "vet", "veterinarian",
      "vet nurse", "veterinary nurse", "RVN", "student vet nurse",
      "veterinary receptionist", "veterinary technician",
      "pet shop", "pet retail",
      "dog groomer", "pet groomer", "dog walker", "dog walking",
      "pet sitter", "cat sitter", "pet sitting",
      "kennel", "kennels", "cattery", "boarding kennels",
      "doggy daycare", "dog day care", "dog boarding",
      "pet food", "pet nutritionist", "animal behaviourist", "animal behaviorist",
      "dog trainer",
    ],
  },
  {
    slug: "physiotherapy",
    name: "Physiotherapy",
    baseline: 100,
    synonyms: [
      "physiotherapy", "physiotherapist", "physio", "physical therapy", "physical therapist",
      "PT physio",
      "musculoskeletal", "MSK physiotherapist", "MSK physio",
      "neuro physiotherapist", "neurological physiotherapist",
      "paediatric physiotherapist", "pediatric physiotherapist",
      "sports physio", "sports physiotherapist", "sports rehab",
      "rehabilitation", "rehab assistant", "rehabilitation assistant",
      "physiotherapy assistant", "physio assistant",
      "respiratory physiotherapist", "cardio physiotherapist",
      "occupational therapist", "OT", "hand therapist",
    ],
  },
  {
    slug: "psychotherapy",
    name: "Psychotherapy",
    baseline: 150,
    synonyms: [
      "psychotherapy", "psychotherapist", "counsellor", "counselor", "counselling", "counseling",
      "therapist", "therapy", "talking therapies",
      "CBT therapist", "CBT", "cognitive behavioural therapist", "cognitive behavioral therapist",
      "IAPT", "talking therapies practitioner",
      "psychological wellbeing practitioner", "PWP",
      "high intensity therapist", "high-intensity CBT",
      "child psychotherapist", "child and adolescent psychotherapist",
      "family therapist", "systemic therapist",
      "clinical psychologist", "counselling psychologist",
      "art therapist", "drama therapist", "music therapist",
      "EMDR therapist", "trauma therapist",
    ],
  },
  {
    slug: "teaching",
    name: "Teaching",
    baseline: 2000,
    synonyms: [
      "teaching", "teacher", "education",
      "school teacher", "primary teacher", "secondary teacher",
      "SEN teacher", "SEND teacher", "SENCO",
      "NQT", "ECT", "early career teacher", "newly qualified teacher",
      "supply teacher", "cover teacher", "classroom teacher",
      "head teacher", "headteacher", "deputy head", "assistant head",
      "head of department school", "form tutor", "school leader",
      "lecturer", "FE lecturer", "college lecturer", "university lecturer",
      "PGCE", "QTS",
      "teacher of english", "teacher of maths", "teacher of math", "teacher of science",
      "teacher of history", "teacher of geography", "teacher of MFL",
      "teacher of modern foreign languages", "teacher of PE", "teacher of art",
      "teacher of music", "teacher of computing", "teacher of business",
      "teacher of psychology", "teacher of religious studies",
      "early years teacher", "EYFS teacher", "nursery teacher",
      "key stage", "KS1 teacher", "KS2 teacher", "KS3 teacher",
      "cover supervisor", "learning support assistant", "LSA", "TA",
      "teaching assistant", "HLTA", "higher level teaching assistant",
      "exam invigilator", "school", "academy", "sixth form",
      "TEFL", "TESOL", "ESOL teacher", "EFL teacher",
      "tutor", "private tutor", "online tutor",
      "curriculum lead", "phase leader",
    ],
  },
  {
    slug: "travel",
    name: "Travel",
    baseline: 250,
    synonyms: [
      "travel", "travel industry", "tourism", "hospitality travel",
      "airline", "airlines", "aviation", "cabin crew", "flight attendant",
      "pilot", "first officer", "captain airline",
      "airport operations", "airport", "ground handling", "ramp agent",
      "aviation engineer", "aircraft engineer", "licensed aircraft engineer",
      "train driver", "rail engineer", "signalling technician", "station manager",
      "rail operations", "conductor",
      "hotel general manager", "hotel receptionist", "front office manager",
      "housekeeping supervisor",
      "travel consultant", "travel agent", "tour operator", "tour guide",
      "cruise ship", "cruise ship jobs", "cruise crew",
      "travel tech", "revenue management airline",
      "transport planner", "logistics travel",
      "bus driver", "coach driver", "concierge", "booking agent", "reservations agent",
    ],
  },
  {
    slug: "wellness",
    name: "Wellness",
    baseline: 250,
    synonyms: [
      "wellness", "wellbeing", "well-being", "well being",
      "gym manager", "gym instructor", "personal trainer", "PT", "personal training",
      "fitness instructor", "fitness coach", "strength coach",
      "wellness coach", "wellbeing coach", "health coach",
      "nutritionist", "nutrition coach", "dietetic technician",
      "activewear", "athleisure", "supplement", "supplements brand",
      "yoga instructor", "yoga teacher", "pilates instructor", "pilates teacher",
      "barre instructor", "spin instructor", "reformer pilates",
      "spa manager", "spa therapist", "massage therapist", "sports massage therapist",
      "meditation teacher", "mindfulness teacher",
      "breathwork coach", "sound healer", "reiki practitioner",
      "physiotherapist private practice", "occupational therapist wellness",
      "beauty therapist spa", "holistic therapist",
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────
// Convenience exports - derived from the registry
// ──────────────────────────────────────────────────────────────────────

/** slug → IndustrySpec lookup */
export const BY_SLUG: Record<string, IndustrySpec> = Object.fromEntries(
  INDUSTRY_REGISTRY.map((i) => [i.slug, i]),
);

/** slug → minimum healthy live job count */
export const INDUSTRY_BASELINES: Record<string, number> = Object.fromEntries(
  INDUSTRY_REGISTRY.map((i) => [i.slug, i.baseline]),
);

/** slug → flat de-duped list of synonyms (lowercased) */
export const INDUSTRY_SYNONYMS: Record<string, string[]> = Object.fromEntries(
  INDUSTRY_REGISTRY.map((i) => [
    i.slug,
    Array.from(new Set(i.synonyms.map((s) => s.toLowerCase().trim()))),
  ]),
);

/**
 * Merge registry synonyms into a base keyword list (e.g. INDUSTRY_KEYWORDS in
 * fetch-external-jobs). Returns a de-duped, lowercased list. Used so the
 * existing per-source keyword tuning is preserved AND every spelling variant
 * gets queried.
 */
export function mergeKeywords(
  slug: string,
  baseKeywords: string[] = [],
): string[] {
  const synonyms = INDUSTRY_SYNONYMS[slug] || [];
  const merged = new Set<string>();
  for (const k of [...baseKeywords, ...synonyms]) {
    const norm = (k || "").toLowerCase().trim();
    if (norm) merged.add(norm);
  }
  return Array.from(merged);
}
