// Direct ATS JSON scrapers for "Who?" brands.
// Hits public Greenhouse / SmartRecruiters / Lever / Ashby JSON endpoints,
// filters to UK-relevant roles, normalises into the `jobs` table shape, and
// upserts. Designed to coexist with the Firecrawl scraper (different URLs).
//
// Trigger:  POST /scrape-ats-jobs   (body optional: { source?: "greenhouse"|"smartrecruiters"|"lever"|"ashby", company?: string })

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ----------------------------- ATS targets -----------------------------
type AtsKind = "greenhouse" | "smartrecruiters" | "lever" | "ashby" | "playrix" | "inploi" | "wiser" | "tesco-rss" | "eightfold";

interface AtsTarget {
  company: string;          // canonical display name used in DB
  industry: string;         // industry slug used in DB
  ats: AtsKind;
  token: string;            // board token / company name on ATS
  globalRemote?: boolean;   // skip UK location filter (e.g. Playrix is fully remote, hires globally)
  // For ats="inploi": override the sitemap URL we crawl for /job/<id> entries.
  // Defaults to `https://${token}/sitemap.xml` if omitted.
  sitemap?: string;
}

// Curated list - confirmed working endpoints only.
// Add more here as we discover them.
const TARGETS: AtsTarget[] = [
  // ===== Original confirmed targets =====
  { company: "ASOS",            industry: "fashion",      ats: "smartrecruiters", token: "ASOS" },
  { company: "Ocado Group",     industry: "grocery",      ats: "greenhouse",      token: "ocadogroup" },
  { company: "Blank Street",    industry: "coffee",       ats: "greenhouse",      token: "blankstreet" },
  // Soho House board is global / mostly non-UK - filter aggressively.
  { company: "Soho House",      industry: "hospitality",  ats: "greenhouse",      token: "sohohouseco" },
  // Playrix is a fully-remote global mobile games studio (Gardenscapes/Township) - no public ATS, scrape via Firecrawl.
  { company: "Playrix",         industry: "gaming",       ats: "playrix",         token: "playrix", globalRemote: true },
  // AI labs - UK-filtered (London / Cambridge offices). Surfaced under the Tech role.
  { company: "Anthropic",       industry: "ai",           ats: "greenhouse",      token: "anthropic" },
  { company: "Google DeepMind", industry: "ai",           ats: "greenhouse",      token: "deepmind" },
  { company: "OpenAI",          industry: "ai",           ats: "ashby",           token: "openai" },

  // ===== Discovered via ATS endpoint probe (Apr 2026) =====
  // Cinema / Film
  { company: "A24",                   industry: "cinema",       ats: "greenhouse",      token: "a24" },
  { company: "Curzon",                industry: "cinema",       ats: "smartrecruiters", token: "curzon" },
  { company: "Universal Pictures",    industry: "cinema",       ats: "greenhouse",      token: "universal" },
  // Travel / Hospitality
  { company: "Accor",                 industry: "travel",       ats: "smartrecruiters", token: "accor" },
  { company: "Airbnb",                industry: "travel",       ats: "greenhouse",      token: "airbnb" },
  { company: "Trainline",             industry: "travel",       ats: "ashby",           token: "trainline" },
  { company: "Uber",                  industry: "travel",       ats: "smartrecruiters", token: "uber" },
  // Fashion
  { company: "Gymshark",              industry: "fashion",      ats: "greenhouse",      token: "gymshark" },
  { company: "JD Sports",             industry: "fashion",      ats: "greenhouse",      token: "jdsports" },
  { company: "JOOR",                  industry: "fashion",      ats: "ashby",           token: "joor" },
  // Food & Drink / Hospitality
  { company: "Butternut Box",         industry: "pets",         ats: "greenhouse",      token: "butternutbox" },
  { company: "Deliveroo",             industry: "hospitality",  ats: "ashby",           token: "deliveroo" },
  { company: "Faire",                 industry: "fashion",      ats: "greenhouse",      token: "faire" },
  { company: "Gousto",                industry: "hospitality",  ats: "smartrecruiters", token: "gousto" },
  { company: "Caffè Nero",            industry: "coffee",       ats: "smartrecruiters", token: "caffenero" },
  // Music / Media
  { company: "Spotify",               industry: "music",        ats: "lever",           token: "spotify" },
  { company: "Universal Music Group", industry: "music",        ats: "smartrecruiters", token: "universalmusicgroup" },
  // News / Journalism
  { company: "Reach plc",             industry: "journalism",   ats: "smartrecruiters", token: "reachplc" },
  { company: "The Telegraph",         industry: "journalism",   ats: "smartrecruiters", token: "thetelegraph" },
  // Gaming
  { company: "Rockstar Games",        industry: "gaming",       ats: "greenhouse",      token: "rockstargames" },
  // Tech / Tools
  { company: "Skyscanner",            industry: "travel",       ats: "greenhouse",      token: "skyscanner" },
  { company: "Monzo",                 industry: "tech",         ats: "greenhouse",      token: "monzo" },
  // Jewellery / Luxury Retail
  { company: "Sotheby's",             industry: "jewellery",    ats: "greenhouse",      token: "sothebys" },
  // Grocery / Retail
  { company: "John Lewis Partnership", industry: "grocery",     ats: "smartrecruiters", token: "johnlewispartnership" },

  // ===== Health (Apr 2026) =====
  { company: "Bupa UK",               industry: "health",       ats: "smartrecruiters", token: "Bupa" },
  { company: "Boots UK",              industry: "health",       ats: "smartrecruiters", token: "Boots" },
  { company: "AstraZeneca",           industry: "health",       ats: "smartrecruiters", token: "AstraZeneca1" },

  // ===== Money / Financial Services =====
  { company: "HSBC",                  industry: "money",        ats: "eightfold",       token: "hsbc.com" },
  { company: "Barclays",              industry: "money",        ats: "smartrecruiters", token: "Barclays" },
  { company: "Aviva",                 industry: "money",        ats: "smartrecruiters", token: "AvivaPlc" },
  { company: "Monzo",                 industry: "money",        ats: "greenhouse",      token: "monzo" },

  // ===== Farming / Agriculture =====
  { company: "John Deere",            industry: "farming",      ats: "smartrecruiters", token: "JohnDeere" },

  // ===== Influencing / Creator Economy (Apr 2026) =====
  { company: "CreatorIQ",             industry: "influencing",  ats: "ashby",           token: "creatoriq" },
  { company: "Spotter",               industry: "influencing",  ats: "greenhouse",      token: "spotter" },
  { company: "Patreon",               industry: "influencing",  ats: "ashby",           token: "patreon" },
  { company: "Substack",              industry: "influencing",  ats: "ashby",           token: "substack" },
  { company: "Passes",                industry: "influencing",  ats: "ashby",           token: "passes" },

  // ===== Marketing / Advertising holding groups =====
  // WPP is a global ad/marketing holding group - its roles are advertising,
  // tech, finance & ops, NOT influencer-specific. Keep it under "marketing".
  { company: "WPP",                   industry: "marketing",    ats: "greenhouse",      token: "wpp" },

  // Lush - Greenhouse board is mostly US/Australia. UK jobs are on Pinpoint
  // (see PINPOINT_TENANTS in fetch-external-jobs).

  // ===== Bakery (Apr 2026) - direct sitemap+JSON-LD scrape via inploi =====
  // Gail's runs its careers site on inploi (jobs.gailsbread.co.uk). Each role
  // page exposes a full schema.org JobPosting in <script type="application/ld+json">,
  // and the sitemap.xml lists every live /job/<id>. We harvest both to get the
  // canonical 350-500 live UK roles directly - bypassing Adzuna/Reed dedup loss.
  {
    company: "Gail's",
    industry: "bakery",
    ats: "inploi",
    token: "jobs.gailsbread.co.uk",
    sitemap: "https://jobs.gailsbread.co.uk/sitemap.xml",
  },

  // ===== Fashion / Retail (May 2026) - Wiser CMS scrape =====
  // Next's careers site (careers.next.co.uk) is built on Wiser CMS and embeds
  // a JSON-LD @graph of ALL live jobs on the /jobs listing page. One HTTP
  // request yields ~800 structured JobPostings - no pagination needed.
  // Sub-brands (Joules, Victoria's Secret, Wholly Owned Brands) all appear.
  {
    company: "Next",
    industry: "fashion",
    ats: "wiser",
    token: "careers.next.co.uk",
    globalRemote: true, // All UK jobs - skip the location filter
  },
  // Tesco RSS feed - ~20 head-office / pharmacy / tech roles
  {
    company: "Tesco",
    industry: "grocery",
    ats: "tesco-rss",
    token: "tesco",
    globalRemote: true, // All roles are UK-based already
  },
];


// ----------------------------- UK filter -----------------------------
const UK_RX =
  /\b(United Kingdom|UK|England|Scotland|Wales|Northern Ireland|London|Manchester|Birmingham|Leeds|Liverpool|Bristol|Edinburgh|Glasgow|Cardiff|Belfast|Sheffield|Newcastle|Nottingham|Brighton|Cambridge|Oxford|Reading|Watford|Hatfield|Welwyn|Hertfordshire|Surrey|Kent|Essex|Yorkshire|Lancashire|GB)\b/i;

function isUkLocation(loc: string | null | undefined, country?: string | null): boolean {
  if (country) {
    const c = country.toLowerCase();
    if (c === "gb" || c === "uk" || c === "united kingdom") return true;
  }
  if (!loc) return false;
  return UK_RX.test(loc);
}

// ----------------------------- Industry classifier (light) -----------------------------
const STAGE_BY_INDUSTRY: Record<string, (title: string) => string> = {
  health: (t) => {
    const x = t.toLowerCase();
    if (/\b(doctor|gp|consultant|surgeon|psychiatr|registrar|sho|fy[12])\b/.test(x)) return "Doctors & Clinicians";
    if (/\b(nurse|midwif|hca|healthcare assistant|nursing)\b/.test(x)) return "Nursing & Midwifery";
    if (/\b(care|carer|support worker|social worker|domiciliary|live[- ]?in)\b/.test(x)) return "Care & Social Care";
    if (/\b(pharmac|dispens|radiograph|paramedic|physio|occupational therap|dietit|allied)\b/.test(x)) return "Allied Health & Pharmacy";
    if (/\b(medtech|biotech|pharma|clinical research|biomedical|r&d|regulatory|qa|qc|manufactur)\b/.test(x)) return "MedTech, Biotech & Pharma";
    return "Health Leadership & Policy";
  },
  money: (t) => {
    const x = t.toLowerCase();
    if (/\b(branch|relationship manager|retail bank|customer adviser|teller|mortgage adviser)\b/.test(x)) return "Banking";
    if (/\b(portfolio|equity research|trader|quant|asset management|wealth|fund manager|analyst)\b/.test(x)) return "Investment & Asset Management";
    if (/\b(actuary|underwrit|insurance|claims|broker|reinsur|risk manager)\b/.test(x)) return "Insurance & Risk";
    if (/\b(fintech|payments|engineer|software|data|product manager|design|developer)\b/.test(x)) return "FinTech & Payments";
    if (/\b(audit|accountant|tax|finance director|cfo|controller|bookkeep)\b/.test(x)) return "Accountancy, Audit & Tax";
    return "Finance Leadership & Markets";
  },
  farming: (t) => {
    const x = t.toLowerCase();
    if (/\b(arable|agronomist|crop|combine|tractor|seed|grain)\b/.test(x)) return "Crops & Arable";
    if (/\b(dairy|herdsman|stockperson|shepherd|livestock|abattoir|butcher|poultry)\b/.test(x)) return "Livestock & Dairy";
    if (/\b(horticulture|glasshouse|fruit|veg|nursery|grower)\b/.test(x)) return "Horticulture & Produce";
    if (/\b(engineer|machinery|technician|robot|precision|software|data)\b/.test(x)) return "AgriTech & Machinery";
    if (/\b(trader|buyer|sourcing|supply chain|logistics)\b/.test(x)) return "Supply Chain & Trading";
    return "Business & Estate";
  },
  "horse-racing": (t) => {
    const x = t.toLowerCase();
    if (/\b(stable|groom|stable lad|stable lass|work rider|head lad|yard)\b/.test(x)) return "Riding & Stable";
    if (/\b(trainer|assistant trainer|jockey coach|conditioning)\b/.test(x)) return "Training & Performance";
    if (/\b(vet|veterinary|farrier|welfare|equine hospital)\b/.test(x)) return "Veterinary & Welfare";
    if (/\b(racecourse|raceday|clerk of the course|stewards|operations)\b/.test(x)) return "Racecourse & Raceday";
    if (/\b(bloodstock|stud|breeder|sales|tattersalls|goffs|betting|trader|odds)\b/.test(x)) return "Bloodstock & Betting";
    return "Business & Industry";
  },
  fashion: (t) => {
    const x = t.toLowerCase();
    if (/\b(designer|design|creative)\b/.test(x)) return "Design";
    if (/\b(buyer|sourcing|merchand|garment|technologist)\b/.test(x)) return "Sourcing";
    if (/\b(marketing|brand|content|social|pr)\b/.test(x)) return "Marketing";
    if (/\b(retail|store|shop|sales|e-?commerce|ecom)\b/.test(x)) return "Retail";
    return "Consumer";
  },
  grocery: (t) => {
    const x = t.toLowerCase();
    // Technology / IT first - covers Ocado Group's engineering-heavy board.
    if (/\b(software|developer|engineer|programmer|devops|sre|platform|backend|frontend|full[- ]?stack|data scientist|data analyst|data engineer|machine learning|ml |ai |robotics|firmware|electronics|electrical|mechanical design|technician|cyber|security|cloud|infra(structure)?|qa|tester|automation|architect|technical|technology|it )\b/.test(x)) return "Technology";
    if (/\b(buyer|sourcing|category)\b/.test(x)) return "Sourcing";
    if (/\b(warehouse|fulfil|driver|delivery|operative|logistics|supply)\b/.test(x)) return "Distribution";
    if (/\b(store|retail|shop floor|cashier|customer)\b/.test(x)) return "Retail Ops";
    if (/\b(marketing|brand|content|merchand)\b/.test(x)) return "Merchandising";
    return "Retail Ops";
  },
  coffee: (t) => {
    const x = t.toLowerCase();
    if (/\b(barista|shift|store manager|café|cafe|assistant)\b/.test(x)) return "Retail & Café";
    if (/\b(roaster|production|qa)\b/.test(x)) return "Roasting";
    if (/\b(marketing|brand|content)\b/.test(x)) return "Cup & Consumer";
    if (/\b(buyer|trader|sourcing|origin)\b/.test(x)) return "Farm & Origin";
    return "Retail & Café";
  },
  hospitality: (t) => {
    const x = t.toLowerCase();
    if (/\b(chef|cook|kitchen|sous|pastry)\b/.test(x)) return "Kitchen";
    if (/\b(server|waiter|waitress|host|bar|barback|reception|concierge)\b/.test(x)) return "Front of House";
    if (/\b(marketing|brand|content|membership|comms)\b/.test(x)) return "Marketing";
    if (/\b(supply|procurement|logistics)\b/.test(x)) return "Supply Chain";
    if (/\b(general manager|operations|director|finance|hr)\b/.test(x)) return "Operations";
    return "Front of House";
  },
  gaming: (t) => {
    const x = t.toLowerCase();
    if (/\b(designer|design|narrative|level|ux|creative director|producer)\b/.test(x)) return "Concept & Pre-Production";
    if (/\b(programmer|engineer|developer|devops|c\+\+|tech(nical)? director|backend|frontend|full[- ]?stack)\b/.test(x)) return "Development & Engineering";
    if (/\b(artist|animator|art director|vfx|audio|composer|sound)\b/.test(x)) return "Art & Audio";
    if (/\b(qa|test|live ops|liveops|community|localisation|localization|analyst|data)\b/.test(x)) return "QA & Live Ops";
    if (/\b(marketing|brand|pr|social|user acquisition|trailer|motion|influencer)\b/.test(x)) return "Marketing & Publishing";
    if (/\b(business development|monetisation|monetization|esports|licensing|platform)\b/.test(x)) return "Business & Distribution";
    return "Development & Engineering";
  },
  ai: (t) => {
    const x = t.toLowerCase();
    if (/\b(research scientist|research engineer|ml researcher|alignment|interpretab)\b/.test(x)) return "Research";
    if (/\b(software engineer|swe|infrastructure|platform|systems|backend|frontend|full[- ]?stack|devops|security)\b/.test(x)) return "Engineering";
    if (/\b(applied|deployment|solutions|forward deployed|product engineer)\b/.test(x)) return "Applied & Product";
    if (/\b(policy|trust|safety|legal|comms|communications|public)\b/.test(x)) return "Policy & Safety";
    if (/\b(sales|account|partnerships|business development|gtm|marketing|brand|design|recruit|people|finance|operations|legal)\b/.test(x)) return "Go-to-Market & Ops";
    return "Engineering";
  },
  influencing: (t) => {
    const x = t.toLowerCase();
    if (/\b(creator|youtuber|streamer|host|talent|writer|editor[- ]in[- ]chief)\b/.test(x)) return "Creators & Talent";
    if (/\b(video editor|videograph|photograph|producer|graphic|motion|designer|production)\b/.test(x)) return "Production & Craft";
    if (/\b(talent manager|talent agent|booker|talent scout|agency|representation)\b/.test(x)) return "Talent Management & Agencies";
    if (/\b(influencer|partnerships|brand partner|campaign|account executive|sales|pr |comms|press)\b/.test(x)) return "Brand Partnerships & Sales";
    if (/\b(strateg|community|growth|analytic|data|paid social|seo|insight|engineer|developer|product manager|software|platform)\b/.test(x)) return "Strategy, Data & Growth";
    if (/\b(operations|finance|accountant|legal|counsel|business manager|director|hr|people)\b/.test(x)) return "Business & Commercial";
    return "Strategy, Data & Growth";
  },
};

function classifyStage(industry: string, title: string): string | null {
  const fn = STAGE_BY_INDUSTRY[industry];
  return fn ? fn(title) : null;
}

function inferCareerLevel(title: string): string {
  const x = title.toLowerCase();
  if (/(chief|ceo|cfo|cto|coo|managing director|vp |vice president|head of|director)/.test(x)) return "executive";
  if (/(senior|lead|principal|staff|manager|supervisor)/.test(x)) return "senior";
  if (/(junior|trainee|apprentice|intern|graduate|entry|assistant)/.test(x)) return "entry";
  return "mid";
}

// ----------------------------- Fetchers -----------------------------
type RawJob = {
  title: string;
  company: string;
  industry: string;
  location: string | null;
  url: string;
  description: string | null;
  career_level: string;
  value_chain_stage: string | null;
  role_category: string | null;
  type: string;
  work_mode: string;
  source_url: string;
  scraped_at: string;
  tags: string[];
};

function decodeEntities(s: string): string {
  // Decode common HTML entities. Run TWICE to handle double-encoded payloads
  // (e.g. Greenhouse sometimes returns "&amp;lt;div&amp;gt;").
  const pass = (x: string) => x
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  return pass(pass(s));
}

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  // Decode entities FIRST so escaped tags like "&lt;div&gt;" become real tags
  // and get stripped out, instead of leaking through as literal text.
  return decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

function buildRaw(t: AtsTarget, opts: {
  title: string;
  url: string;
  location: string | null;
  description: string | null;
  country?: string | null;
}): RawJob | null {
  if (!opts.title || !opts.url) return null;
  if (!t.globalRemote && !isUkLocation(opts.location, opts.country)) return null;
  const isRemote = t.globalRemote || /remote/i.test(opts.location ?? "");
  return {
    title: opts.title.trim().slice(0, 200),
    company: t.company,
    industry: t.industry,
    location: opts.location?.slice(0, 200) ?? (t.globalRemote ? "Remote (Global)" : null),
    url: opts.url,
    description: opts.description,
    career_level: inferCareerLevel(opts.title),
    value_chain_stage: classifyStage(t.industry, opts.title),
    role_category: null,
    type: "Full-time",
    work_mode: isRemote ? "Remote" : "On-site",
    source_url: `ats:${t.ats}:${t.token}`,
    scraped_at: new Date().toISOString(),
    tags: ["who-brand", `ats:${t.ats}`],
  };
}

async function fetchGreenhouse(t: AtsTarget): Promise<RawJob[]> {
  const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${t.token}/jobs?content=true`);
  if (!r.ok) return [];
  const json = await r.json();
  const jobs: any[] = json.jobs ?? [];
  const out: RawJob[] = [];
  for (const j of jobs) {
    const built = buildRaw(t, {
      title: j.title,
      url: j.absolute_url,
      location: j.location?.name ?? null,
      description: stripHtml(j.content),
    });
    if (built) out.push(built);
  }
  return out;
}

async function fetchSmartRecruiters(t: AtsTarget): Promise<RawJob[]> {
  const all: any[] = [];
  let offset = 0;
  for (let page = 0; page < 10; page++) {
    const r = await fetch(`https://api.smartrecruiters.com/v1/companies/${t.token}/postings?limit=100&offset=${offset}`);
    if (!r.ok) break;
    const json = await r.json();
    const content: any[] = json.content ?? [];
    if (content.length === 0) break;
    all.push(...content);
    if (content.length < 100) break;
    offset += 100;
  }
  const out: RawJob[] = [];
  for (const j of all) {
    const city = j.location?.city ?? null;
    const country = j.location?.country ?? null;
    const loc = [city, country?.toUpperCase()].filter(Boolean).join(", ");
    const url = j.ref || `https://jobs.smartrecruiters.com/${t.token}/${j.id}`;
    const built = buildRaw(t, {
      title: j.name,
      url,
      location: loc || null,
      country,
      description: stripHtml(j.jobAd?.sections?.jobDescription?.text),
    });
    if (built) out.push(built);
  }
  return out;
}

async function fetchLever(t: AtsTarget): Promise<RawJob[]> {
  const r = await fetch(`https://api.lever.co/v0/postings/${t.token}?mode=json`);
  if (!r.ok) return [];
  const json = await r.json();
  if (!Array.isArray(json)) return [];
  const out: RawJob[] = [];
  for (const j of json) {
    const built = buildRaw(t, {
      title: j.text,
      url: j.hostedUrl,
      location: j.categories?.location ?? null,
      description: stripHtml(j.descriptionPlain ?? j.description),
    });
    if (built) out.push(built);
  }
  return out;
}

async function fetchAshby(t: AtsTarget): Promise<RawJob[]> {
  const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${t.token}?includeCompensation=false`);
  if (!r.ok) return [];
  const json = await r.json();
  const jobs: any[] = json.jobs ?? [];
  const out: RawJob[] = [];
  for (const j of jobs) {
    const built = buildRaw(t, {
      title: j.title,
      url: j.jobUrl,
      location: j.location ?? null,
      description: stripHtml(j.descriptionPlain),
    });
    if (built) out.push(built);
  }
  return out;
}

// Playrix has no public ATS - scrape https://playrix.com/job/open via Firecrawl
// and extract role links from the rendered markdown.
async function fetchPlayrix(t: AtsTarget): Promise<RawJob[]> {
  const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!fcKey) {
    console.warn("[Playrix] FIRECRAWL_API_KEY missing - skipping");
    return [];
  }
  const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://playrix.com/job/open",
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });
  if (!r.ok) {
    console.warn("[Playrix] Firecrawl returned", r.status);
    return [];
  }
  const json = await r.json();
  const md: string = json?.data?.markdown ?? json?.markdown ?? "";
  if (!md) return [];

  // Match every link that points at a role page: /job/open/<category>/<slug>
  const rx = /\[([^\]]+?)\]\((https:\/\/playrix\.com\/job\/open\/[a-z0-9-]+\/[a-z0-9-]+)\)/gi;
  const seen = new Set<string>();
  const out: RawJob[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(md)) !== null) {
    const rawTitle = m[1].replace(/\\\\/g, " ").replace(/\s+/g, " ").trim();
    const url = m[2];
    if (seen.has(url)) continue;
    seen.add(url);
    // Title text often has "Role\\n\\nGame names" - keep just the role part.
    const title = rawTitle.split(/\s{2,}|\s-\s/)[0].trim();
    const built = buildRaw(t, {
      title,
      url,
      location: "Remote (Global)",
      description: null,
    });
    if (built) out.push(built);
  }
  console.log(`[Playrix] parsed ${out.length} roles from markdown`);
  return out;
}

// ----------------------------- inploi (sitemap → JSON-LD) -----------------------------
// inploi powers careers sites for several UK hospitality / bakery brands
// (Gail's, Honest Burgers, etc.). They expose:
//   1. /sitemap.xml listing every live /job/<id>
//   2. each job page contains <script type="application/ld+json"> with a
//      full schema.org JobPosting (title, employmentType, baseSalary,
//      jobLocation, description, validThrough)
// We crawl all listed jobs, parse the structured data, and normalise into
// the same RawJob shape as the JSON ATSes. We cap parallelism to be polite.
const INPLOI_UA =
  "Mozilla/5.0 (compatible; HowDoYouDo/1.0; +https://howdoyoudo.group)";

function extractJobPostingJsonLd(html: string): any | null {
  // Match every ld+json block, then JSON.parse and look for @type=JobPosting.
  const blockRx = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRx.exec(html)) !== null) {
    const raw = m[1].trim();
    try {
      const parsed = JSON.parse(raw);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const c of candidates) {
        if (!c || typeof c !== "object") continue;
        const type = c["@type"];
        if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) {
          return c;
        }
      }
    } catch {
      // Skip malformed JSON-LD; many sites have multiple blocks and only one is valid.
    }
  }
  return null;
}

function normaliseInploiEmploymentType(jp: any): string {
  const v = String(jp.employmentType ?? "").toUpperCase();
  if (v.includes("PART")) return "Part-time";
  if (v.includes("CONTRACT") || v.includes("TEMPORARY")) return "Freelance";
  if (v.includes("INTERN")) return "Internship";
  return "Full-time";
}

function formatInploiSalary(jp: any): string | null {
  const base = jp.baseSalary;
  if (!base || typeof base !== "object") return null;
  const currency = base.currency || "GBP";
  const sym = currency === "GBP" ? "£" : `${currency} `;
  const v = base.value;
  if (!v) return null;
  const unit = String(v.unitText || v.unitCode || "").toUpperCase();
  const suffix =
    unit.startsWith("HOUR") || unit === "H" ? "/hr" :
    unit.startsWith("ANNUAL") || unit === "A" || unit === "YEAR" ? "/yr" :
    unit.startsWith("MONTH") || unit === "M" ? "/mo" :
    "";
  if (typeof v.value === "number") return `${sym}${Math.round(v.value)}${suffix}`;
  if (v.minValue && v.maxValue) {
    return `${sym}${Math.round(v.minValue)} - ${sym}${Math.round(v.maxValue)}${suffix}`;
  }
  return null;
}

function formatInploiLocation(jp: any): { location: string | null; country: string | null } {
  const j = jp.jobLocation;
  if (!j) return { location: null, country: null };
  const arr = Array.isArray(j) ? j : [j];
  const parts: string[] = [];
  let country: string | null = null;
  for (const loc of arr) {
    const addr = loc?.address;
    if (!addr) continue;
    const town = addr.addressLocality || "";
    const region = addr.addressRegion || "";
    const c = (addr.addressCountry?.name ?? addr.addressCountry ?? "").toString();
    const piece = [town, region].filter(Boolean).join(", ").trim();
    if (piece) parts.push(piece);
    if (c) country = c;
  }
  return { location: parts.join(" / ") || null, country };
}

async function fetchInploi(t: AtsTarget): Promise<RawJob[]> {
  const sitemapUrl = t.sitemap ?? `https://${t.token}/sitemap.xml`;
  const sitemapRes = await fetch(sitemapUrl, {
    headers: { "User-Agent": INPLOI_UA, "Accept": "application/xml,text/xml" },
  });
  if (!sitemapRes.ok) {
    console.warn(`[${t.company}] inploi sitemap ${sitemapRes.status} for ${sitemapUrl}`);
    return [];
  }
  const xml = await sitemapRes.text();
  const jobUrlRx = /<loc>([^<]*\/job\/[A-Za-z0-9_-]+)<\/loc>/gi;
  const urls = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = jobUrlRx.exec(xml)) !== null) {
    urls.add(m[1].trim());
  }
  console.log(`[${t.company}] inploi sitemap: ${urls.size} job URLs`);
  if (urls.size === 0) return [];

  const out: RawJob[] = [];
  const concurrency = 6;
  const queue = Array.from(urls);
  let cursor = 0;
  let parsed = 0;
  let skippedNoLd = 0;
  let skippedExpired = 0;

  async function worker() {
    while (cursor < queue.length) {
      const idx = cursor++;
      const jobUrl = queue[idx];
      try {
        const r = await fetch(jobUrl, {
          headers: { "User-Agent": INPLOI_UA, "Accept": "text/html" },
        });
        if (!r.ok) continue;
        const html = await r.text();
        const jp = extractJobPostingJsonLd(html);
        if (!jp) { skippedNoLd++; continue; }

        // Drop expired postings.
        if (jp.validThrough) {
          const v = Date.parse(jp.validThrough);
          if (!Number.isNaN(v) && v < Date.now()) { skippedExpired++; continue; }
        }

        const title = String(jp.title || "").trim();
        if (!title) continue;

        const { location, country } = formatInploiLocation(jp);
        const built = buildRaw(t, {
          title,
          url: jobUrl,
          location,
          country,
          description: stripHtml(jp.description),
        });
        if (!built) continue;

        // Override defaults with structured-data values.
        built.type = normaliseInploiEmploymentType(jp);
        const salary = formatInploiSalary(jp);
        // RawJob doesn't have a salary field, but we tag it for visibility.
        if (salary) built.tags = [...built.tags, `salary:${salary}`];
        // expires_at is honoured by the validate-jobs job; we set it via tags
        // for this scrape (jobs table has its own expires_at column populated
        // by classify, but we can pass through via metadata if needed later).
        out.push(built);
        parsed++;
      } catch (e) {
        console.warn(`[${t.company}] inploi fetch ${jobUrl} failed:`, (e as Error).message);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(`[${t.company}] inploi parsed ${parsed} jobs (skipped no-ld:${skippedNoLd}, expired:${skippedExpired})`);
  return out;
}

// ----------------------------- Wiser CMS scraper -----------------------------
// Wiser-powered careers sites (e.g. careers.next.co.uk) embed a JSON-LD
// @graph array of every live JobPosting on their /jobs listing page.
// One fetch → all jobs. No pagination, no per-page crawling.

async function fetchWiser(t: AtsTarget): Promise<RawJob[]> {
  const listingUrl = `https://${t.token}/jobs`;
  const res = await fetch(listingUrl, {
    headers: { "User-Agent": INPLOI_UA, "Accept": "text/html" },
  });
  if (!res.ok) {
    console.warn(`[${t.company}] wiser listing ${res.status} for ${listingUrl}`);
    return [];
  }
  const html = await res.text();

  // Extract the ld+json block - Wiser uses single-quotes around the type attr
  const ldMatch = html.match(/type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/i);
  if (!ldMatch) {
    console.warn(`[${t.company}] wiser: no ld+json block found`);
    return [];
  }

  let graph: any[];
  try {
    const parsed = JSON.parse(ldMatch[1]);
    // May be { @graph: [...] } or a raw array
    graph = Array.isArray(parsed) ? parsed : (parsed?.["@graph"] ?? []);
  } catch (e) {
    console.warn(`[${t.company}] wiser: ld+json parse error:`, (e as Error).message);
    return [];
  }

  const postings = graph.filter(
    (x: any) => x && typeof x === "object" && x["@type"] === "JobPosting"
  );
  console.log(`[${t.company}] wiser: ${postings.length} JobPostings from listing page`);

  const out: RawJob[] = [];
  for (const jp of postings) {
    const title = String(jp.title || "").trim();
    if (!title) continue;

    // Skip expired postings
    if (jp.validThrough) {
      const v = Date.parse(jp.validThrough);
      if (!Number.isNaN(v) && v < Date.now()) continue;
    }

    const { location, country } = formatInploiLocation(jp);

    const built = buildRaw(t, {
      title,
      url: jp.url || `https://${t.token}/jobs/${jp.identifier?.value || ""}`,
      location,
      country,
      description: stripHtml(jp.description),
    });
    if (!built) continue;

    // Override employment type from structured data
    built.type = normaliseInploiEmploymentType(jp);

    // Extract salary if present
    const salary = formatInploiSalary(jp);
    if (salary) built.tags = [...built.tags, `salary:${salary}`];

    out.push(built);
  }

  console.log(`[${t.company}] wiser: ${out.length} UK jobs after filtering`);
  return out;
}

// ----------------------------- Tesco RSS feed -----------------------------
async function fetchTescoRss(t: AtsTarget): Promise<RawJob[]> {
  const feedUrl = "https://careers.tesco.com/en_GB/careers/SearchJobs/feed/";
  const res = await fetch(feedUrl);
  if (!res.ok) {
    console.warn(`[Tesco] RSS feed returned ${res.status}`);
    return [];
  }
  const xml = await res.text();

  const items: RawJob[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const linkMatch = block.match(/<link>(.*?)<\/link>/);
    if (!titleMatch || !linkMatch) continue;

    let title = titleMatch[1].trim();
    const url = linkMatch[1].trim();

    // Strip leading job-code prefix like "235108 - "
    title = title.replace(/^\d+\s*-\s*/, "");

    // Try to extract location from title suffix (e.g. "Pharmacy Manager - Padiham")
    const locParts = title.match(/^(.+?)\s+-\s+([A-Z][A-Za-z\s/]+(?:P\/T|F\/T|Extra)?)$/);
    let location: string | null = null;
    if (locParts) {
      title = locParts[1].trim();
      location = locParts[2].trim() + ", UK";
    }

    const raw = buildRaw(t, { title, url, location, description: null });
    if (raw) items.push(raw);
  }

  console.log(`[Tesco] RSS: ${items.length} jobs parsed from feed`);
  return items;
}

// ----------------------------- Eightfold AI careers portal -----------------------------
// Public JSON API used by companies like HSBC. Paginates via `start` + `num`.
// Token is the domain param (e.g. "hsbc.com").
async function fetchEightfold(t: AtsTarget): Promise<RawJob[]> {
  const baseUrl = `https://portal.careers.${t.token}/api/apply/v2/jobs`;
  const out: RawJob[] = [];
  const pageSize = 10; // Eightfold caps responses at 10 regardless of num param

  for (let start = 0; start < 500; start += pageSize) {
    const url = `${baseUrl}?domain=${t.token}&location=united+kingdom&start=${start}&num=${pageSize}&sort_by=relevance`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) {
      console.warn(`[${t.company}] Eightfold API returned ${res.status}`);
      break;
    }
    const json = await res.json();
    const positions: any[] = json.positions ?? [];
    if (positions.length === 0) break;

    for (const p of positions) {
      const title = p.name || p.posting_name;
      const loc = p.location || (p.locations?.[0]) || null;
      const canonUrl = p.canonicalPositionUrl || `https://portal.careers.${t.token}/careers/job/${p.id}`;
      const workMode = p.work_location_option === "remote" ? "Remote"
        : p.work_location_option === "hybrid" ? "Hybrid" : "On-site";

      const raw = buildRaw(t, {
        title,
        url: canonUrl,
        location: loc,
        description: stripHtml(p.job_description) || null,
      });
      if (raw) {
        raw.work_mode = workMode;
        if (p.department) raw.tags = [...raw.tags, `dept:${p.department}`];
        out.push(raw);
      }
    }

    if (positions.length < pageSize) break;
  }

  console.log(`[${t.company}] eightfold: ${out.length} UK jobs fetched`);
  return out;
}

async function fetchTarget(t: AtsTarget): Promise<RawJob[]> {
  try {
    if (t.ats === "greenhouse")      return await fetchGreenhouse(t);
    if (t.ats === "smartrecruiters") return await fetchSmartRecruiters(t);
    if (t.ats === "lever")           return await fetchLever(t);
    if (t.ats === "ashby")           return await fetchAshby(t);
    if (t.ats === "playrix")         return await fetchPlayrix(t);
    if (t.ats === "inploi")          return await fetchInploi(t);
    if (t.ats === "wiser")           return await fetchWiser(t);
    if (t.ats === "tesco-rss")       return await fetchTescoRss(t);
    if (t.ats === "eightfold")       return await fetchEightfold(t);
  } catch (e) {
    console.error(`[${t.company}] fetch failed:`, e);
  }
  return [];
}

// ----------------------------- Hospitality remap -----------------------------
// We don't have a "Hospitality" industry page. Reroute hotel jobs to
// Travel, pub/brewery jobs to Beer; otherwise keep "hospitality" (which
// the front-end maps to Food & Drink via src/data/industries.ts).
const HOTEL_RE = /\b(hotel|hotels|concierge|front office|housekeep|night manager|duty manager|reservations|guest experience|general manager hotel|cluster gm|resort)\b/i;
const HOTEL_COMPANY_RE = /\b(marriott|hilton|hyatt|ihg|intercontinental|accor|radisson|premier inn|travelodge|whitbread|four seasons|claridge|savoy|dorchester|connaught|ace hotel|edition hotel|soho house|the ned|nobu hotel|rosewood|mandarin oriental|peninsula|shangri-la|kimpton|standard hotel|firmdale|citizenm|yotel|ennismore|hoxton)\b/i;
const PUB_RE = /\b(pub|publican|brewery|brewer|brewing|cask ale|craft beer|taproom|cellar|beer sommelier|head brewer)\b/i;
const PUB_COMPANY_RE = /\b(brewdog|fuller'?s|young'?s|greene king|mitchells & butlers|jd wetherspoon|wetherspoon|stonegate|marston'?s|shepherd neame|adnams|camden town brewery|beavertown|meantime|thornbridge)\b/i;
function remapHospitalityIndustry(row: any): any {
  if (!row || row.industry !== "hospitality") return row;
  const t = String(row.title || "");
  const c = String(row.company || "");
  if (HOTEL_RE.test(t) || HOTEL_COMPANY_RE.test(c)) return { ...row, industry: "travel" };
  if (PUB_RE.test(t) || PUB_COMPANY_RE.test(c)) return { ...row, industry: "beer" };
  return row;
}

// ----------------------------- Resilient upsert -----------------------------
async function safeUpsert(supabase: any, batch: RawJob[]): Promise<number> {
  if (batch.length === 0) return 0;
  const remapped = batch.map(remapHospitalityIndustry);
  const { error, data } = await supabase
    .from("jobs")
    .upsert(remapped, { onConflict: "url", ignoreDuplicates: true })
    .select("id");
  if (!error) return data?.length ?? 0;

  // Fallback: row-by-row to skip composite-unique-index violations
  console.warn("Batch upsert failed, retrying row-by-row:", error.message);
  let n = 0;
  for (const row of remapped) {
    const { data: d2, error: e2 } = await supabase
      .from("jobs")
      .upsert([row], { onConflict: "url", ignoreDuplicates: true })
      .select("id");
    if (!e2 && d2 && d2.length > 0) n += d2.length;
  }
  return n;
}

// ----------------------------- HTTP handler -----------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key);

    const body = await req.json().catch(() => ({}));
    const filterSource: AtsKind | undefined = body.source;
    const filterCompany: string | undefined = body.company?.toLowerCase();

    const targets = TARGETS.filter((t) => {
      if (filterSource && t.ats !== filterSource) return false;
      if (filterCompany && t.company.toLowerCase() !== filterCompany) return false;
      return true;
    });

    const perBrand: Record<string, { fetched: number; inserted: number }> = {};
    let totalFetched = 0;
    let totalInserted = 0;

    for (const t of targets) {
      const jobs = await fetchTarget(t);
      totalFetched += jobs.length;
      // upsert in chunks of 50
      let inserted = 0;
      for (let i = 0; i < jobs.length; i += 50) {
        inserted += await safeUpsert(supabase, jobs.slice(i, i + 50));
      }
      totalInserted += inserted;
      perBrand[t.company] = { fetched: jobs.length, inserted };
      console.log(`[${t.company} / ${t.ats}] UK jobs fetched: ${jobs.length}, inserted: ${inserted}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        targetsRun: targets.length,
        totalFetched,
        totalInserted,
        perBrand,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("scrape-ats-jobs error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
