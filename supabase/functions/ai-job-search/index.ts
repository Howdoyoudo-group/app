import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INDUSTRY_ALIASES: Array<{
  pattern: RegExp;
  industry?: string;
  roleCategories?: string[];
  titleKeywords?: string[];
  excludeKeywords?: string[];
}> = [
  {
    pattern: /\b(vet|vets|veterinary|veterinarian|veterinarians|pet|pets|petcare|pet care|animal care|canine|feline|kennel)\b/i,
    industry: "pets",
    titleKeywords: ["vet", "veterinary", "animal", "pet", "canine", "feline", "kennel"],
  },
  // Common abbreviations / slang → role categories or title keywords
  {
    pattern: /\b(hr|h\.r\.|people ops|people operations)\b/i,
    roleCategories: ["HR & People"],
    titleKeywords: ["hr", "people", "talent", "human resources"],
  },
  {
    pattern: /\b(pm|project manager|project management|programme manager|program manager)\b/i,
    roleCategories: ["Operations", "Strategy"],
    titleKeywords: ["project manager", "programme manager", "program manager", "pmo"],
  },
  {
    pattern: /\b(pr|public relations|comms|communications)\b/i,
    roleCategories: ["Marketing"],
    titleKeywords: ["pr", "public relations", "communications", "comms"],
  },
  {
    pattern: /\b(ux|ui|ux\/ui|ui\/ux|product design|product designer)\b/i,
    roleCategories: ["Creative", "Product"],
    titleKeywords: ["ux", "ui", "designer", "product design"],
  },
  {
    pattern: /\b(football|footy|soccer)\b/i,
    industry: "football",
    titleKeywords: [
      "football", "soccer", "coach", "scout", "scouting", "academy",
      "matchday", "club", "fc ", "afc", "stadium", "performance analyst",
      "sporting director", "kit manager", "sports therapist", "physio",
      "groundsman", "groundskeeper", "commercial", "partnerships", "ticketing",
      "broadcast", "media",
    ],
  },
  {
    pattern: /\b(physio|physiotherapist|physiotherapy)\b/i,
    industry: "physiotherapy",
    titleKeywords: ["physio", "physiotherapist"],
  },
  {
    pattern: /\b(doctor|doctors|gp|gps|physician|physicians|surgeon|surgeons|registrar|registrars|specialty doctor|speciality doctor|clinical fellow|resident medical officer|rmo)\b/i,
    industry: "health",
    titleKeywords: [
      "doctor",
      "gp",
      "physician",
      "surgeon",
      "registrar",
      "specialty doctor",
      "speciality doctor",
      "clinical fellow",
      "resident medical officer",
      "medical officer",
      "psychiatrist",
      "radiologist",
      "anaesthetist",
    ],
    // Vets are technically "doctors" of veterinary medicine but should not appear
    // in a human-doctor search. Exclude any job whose title/category mentions them.
    excludeKeywords: ["vet", "vets", "veterinary", "veterinarian", "veterinarians", "animal", "canine", "feline", "equine"],
  },
  {
    // Counsellor / counselor are therapy roles, NOT legal "counsel".
    pattern: /\b(counsellor|counselor|counselling|counseling|psychotherapist|psychotherapy|cbt therapist)\b/i,
    industry: "psychotherapy",
    titleKeywords: ["counsellor", "counselor", "psychotherapist", "cbt therapist", "psychologist"],
  },
  {
    // LTA = Lawn Tennis Association (sport), not Landlord & Tenant Act
    pattern: /\b(tennis|lta|lawn tennis)\b/i,
    titleKeywords: ["tennis", "padel", "racquet", "racket"],
  },
  {
    // Top leadership / C-suite - make CEO, Chief Executive, MD, Managing Director all interchangeable
    pattern: /\b(ceo|c\.e\.o|chief executive|chief exec|managing director|m\.d\.|md|founder|president|chair(?:man|woman|person)?)\b/i,
    titleKeywords: [
      "ceo", "chief executive", "chief exec", "managing director",
      "founder", "co-founder", "president", "chair", "chairman", "chairwoman",
      "general manager", "head of",
    ],
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Query too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const rawQuery = query.trim();
    const normalizedQuery = rawQuery.toLowerCase();
    const deterministicMatch = INDUSTRY_ALIASES.find(({ pattern }) => pattern.test(normalizedQuery));

    // ───────────────────────── COMPANY-NAME FAST PATH ─────────────────────────
    // Many users search for a brand they want to work for ("Gail's", "Greggs",
    // "Soho House", "BrewDog"). The free-text AI path then matches the keyword
    // anywhere in title/description and returns unrelated jobs that mention the
    // brand in passing. Detect when the query unambiguously names a company
    // we already have jobs for, and short-circuit to a company-only search.
    //
    // We compare the query against distinct company names in the jobs table
    // (DB-backed so it auto-updates as new brands are scraped). Matching is
    // case-insensitive and ignores punctuation/possessives so "gails", "Gail's"
    // and "GAIL'S" all hit the same employer.
    const stripCompanyNoise = (s: string) =>
      s.toLowerCase()
        .replace(/['’`´]/g, "")              // possessives/apostrophes
        .replace(/[.,&]/g, " ")              // common punctuation
        .replace(/\b(jobs?|careers?|hiring|vacanc(y|ies)|roles?|opportunit(y|ies)|at|the)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const queryCompanyKey = stripCompanyNoise(rawQuery);
    const queryWordCount = queryCompanyKey.split(" ").filter(Boolean).length;

    // Generic role/profession keywords must NEVER trigger the company fast-path
    // even if a company name happens to contain them (e.g. query "nurse" should
    // not match "Nurseplus UK Ltd" / "Nurse Seekers" - the user wants nursing
    // ROLES, not those specific employers). Any single-word query in this list
    // is forced down the regular keyword/AI path.
    const GENERIC_ROLE_KEYWORDS = new Set([
      "nurse", "nurses", "nursing", "doctor", "doctors", "gp", "midwife", "midwives",
      "dentist", "dentists", "pharmacist", "pharmacists", "paramedic", "surgeon", "surgeons",
      "consultant", "consultants", "clinician", "physician", "physicians", "therapist", "therapists",
      "teacher", "teachers", "teaching", "tutor", "tutors", "tutoring", "lecturer", "lecturers",
      "lecturing", "professor", "education", "educator", "educators", "school", "schools",
      "engineer", "engineers", "engineering", "developer", "developers", "designer", "designers",
      "manager", "managers", "management", "director", "directors", "executive", "executives",
      "assistant", "assistants", "administrator", "admin", "coordinator",
      "chef", "chefs", "cook", "cooking", "cooks", "barista", "baristas", "waiter", "waitress", "bartender",
      "driver", "drivers", "driving", "cleaner", "cleaners", "cleaning", "carer", "carers", "care", "caring", "receptionist",
      "accountant", "accountants", "accounting", "lawyer", "lawyers", "legal", "law", "solicitor", "paralegal",
      "marketing", "sales", "selling", "finance", "financial", "hr", "recruiter", "recruitment", "recruiting",
      "analyst", "analysts", "consultant", "consulting", "intern", "internship", "graduate", "apprentice", "apprenticeship", "trainee",
      "plumber", "plumbing", "electrician", "carpenter", "carpentry", "mechanic", "technician", "technicians",
      "scientist", "scientists", "science", "researcher", "research", "writer", "writing", "editor", "editing", "journalist", "journalism",
      "photographer", "photography", "videographer", "producer", "stylist", "florist", "barber", "hairdresser", "hairdressing",
      "architect", "architecture", "surveyor", "estate", "agent", "broker", "trader", "trading",
      "officer", "police", "firefighter", "soldier", "pilot", "captain",
      "operator", "supervisor", "labourer", "porter", "warehouse", "picker", "packer",
      "barista", "barman", "barmaid", "barwork", "hospitality", "retail", "fashion", "beauty",
      "coding", "code", "programmer", "programming", "data", "analytics",
    ]);
    const isGenericRoleQuery =
      queryWordCount === 1 && GENERIC_ROLE_KEYWORDS.has(queryCompanyKey);

    let companyMatchValue: string | null = null;
    // Only attempt company match for short queries (1–4 tokens). Longer queries
    // are sentence-style and should use the full AI path. Skip entirely for
    // generic role keywords (see GENERIC_ROLE_KEYWORDS above).
    if (queryCompanyKey.length >= 2 && queryWordCount <= 4 && !isGenericRoleQuery) {
      // Pull every distinct non-null company that contains any token of the
      // query. We then exact-match in JS against the noise-stripped key.
      // IMPORTANT: use a shortened prefix (drop trailing chars) so that
      // apostrophe / pluralisation differences don't filter out real matches
      // (e.g. query "gails" must still find DB company "Gail's").
      const firstToken = queryCompanyKey.split(" ")[0];
      const searchPrefix = firstToken.length >= 5 ? firstToken.slice(0, firstToken.length - 1) : firstToken;
      const { data: companyRows } = await sb
        .from("jobs")
        .select("company")
        .ilike("company", `%${searchPrefix}%`)
        .not("company", "is", null)
        .limit(2000);
      const seenKeys = new Map<string, string>();
      for (const row of companyRows || []) {
        const c = (row as { company: string | null }).company;
        if (!c) continue;
        const key = stripCompanyNoise(c);
        if (!key) continue;
        if (!seenKeys.has(key)) seenKeys.set(key, c);
      }

      // 1. Exact noise-stripped match (preferred).
      if (seenKeys.has(queryCompanyKey)) {
        companyMatchValue = queryCompanyKey;
      } else if (queryWordCount >= 2 && queryCompanyKey.length >= 4) {
        // 2. Allow contains/contained-by match ONLY for multi-token queries
        //    (e.g. "soho house" vs "Soho House Group"; "brew dog" vs "BrewDog Brewery").
        //    Single-token queries like "teaching", "marketing", "fashion" must
        //    NOT trigger this - they collide with employer names like
        //    "Teaching Personnel", "Marketing Heroes", etc.
        for (const key of seenKeys.keys()) {
          if (key === queryCompanyKey) continue;
          if (key.includes(queryCompanyKey) || queryCompanyKey.includes(key)) {
            companyMatchValue = queryCompanyKey;
            break;
          }
        }
      }

      if (companyMatchValue) {
        console.log(`Company fast-path: query "${rawQuery}" → matched ${seenKeys.size} candidate companies`);
        // Build a single regex that matches the canonical key with word boundaries.
        const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const keyRx = new RegExp(`(?:^|[^a-z0-9])${escapeRe(companyMatchValue)}(?:[^a-z0-9]|$)`, "i");

        // Pull all jobs whose company contains the prefix, then filter to
        // companies whose noise-stripped name matches the query.
        const { data: jobRows } = await sb
          .from("jobs")
          .select("id, title, company")
          .ilike("company", `%${searchPrefix}%`)
          .not("company", "is", null)
          .limit(5000);

        const matchedRows = (jobRows || []).filter((j: { company: string | null }) => {
          if (!j.company) return false;
          const key = stripCompanyNoise(j.company);
          if (!key) return false;
          if (key === companyMatchValue) return true;
          // Allow a substring-with-word-boundary match for multi-tenant brands
          // ("Gail's Management" → "gails management" contains the key "gails").
          return keyRx.test(key);
        });

        const jobIds = matchedRows.map((j: { id: string }) => j.id);
        return new Response(
          JSON.stringify({
            filters: { company: companyMatchValue, _matchedVia: "company_fast_path" },
            job_ids: jobIds,
            count: jobIds.length,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    // ──────────────────────── END COMPANY-NAME FAST PATH ────────────────────────

    const aiResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You interpret natural language job search queries into structured SQL filters for a UK jobs database.

The database has these columns:
- title (text) - job title
- company (text)
- location (text) - free-text UK location, e.g. "London", "Manchester", "Bristol", "Leeds, UK"
- industry (text) - one of: bakery, beauty, beer, cars, charity, cinema, coffee, estate-agency, farming, fashion, football, footwear, gaming, grocery, health, horse-racing, hospitality, interior-design, jewellery, journalism, money, music, pets, physiotherapy, psychotherapy, teaching, travel, wellness
- role_category (text) - e.g. Marketing, Finance, Operations, Strategy, Sales, Product, Creative, HR & People, Legal & Compliance, Commercial, E-commerce, Technology, Retail
- value_chain_stage (text) - e.g. Production, Distribution, Retail, Marketing, Operations, Central/HQ
- career_level (text) - entry, mid, senior, executive
- description (text)
- type (text) - Full-time, Part-time, Freelance, Internship
- work_mode (text) - On-site, Remote, Hybrid

Critical rules:
- Only set "industry" if the query CLEARLY maps to one of the listed industries above. If unsure, leave industry blank.
- DO NOT force-fit industries. For terms that don't map cleanly (e.g. "insurance", "law", "accounting", "consulting", "tech", "engineering", "construction", "logistics", "manufacturing", "real estate", "government", "energy"), leave industry blank and use title_keywords instead - these jobs span many industries.
- Queries about vet, vets, veterinary, veterinarian, pet care, kennels, canine, feline, or animal care should map to industry="pets".
- Always provide title_keywords for free-text queries - include the original term plus close synonyms.
- LOCATION: If the user names a UK city, town, region, postcode area, or country (e.g. "Manchester", "London", "Bristol", "Yorkshire", "Scotland", "Northern Ireland", "remote"), set "locations" to an array containing that place AND any common variants/nearby suburbs you'd expect on a job posting (e.g. "Manchester" → ["Manchester","Salford","Trafford","Stockport","Greater Manchester"]; "London" → ["London","Greater London"]). If "remote" is mentioned, also set work_mode="Remote".
- WEEKEND / EVENING / SHIFT: If the user mentions "weekend", "weekends", "evenings", "nights", "shift", "casual", or "part time", set type="Part-time" AND add these as title_keywords (["weekend","evening","shift","casual","part-time"]) so we can match them in the description.

When the user says things like:
- "insurance" → title_keywords=["insurance","insurer","underwriter","actuary","claims","broker"] (NO industry - insurance spans money + others)
- "law" or "legal" → title_keywords=["legal","lawyer","solicitor","paralegal","counsel"], role_categories=["Legal & Compliance"] (NO industry)
- "accounting" → title_keywords=["accountant","accounting","auditor","bookkeeper"], role_categories=["Finance"] (NO industry)
- "engineer" → title_keywords=["engineer","engineering"] (NO industry)
- "business side of football" → industry=football, role_categories=["Finance","Strategy","Commercial","Marketing","Operations","Sales","HR & People","Legal & Compliance"]
- "coaching in football" → industry=football, title_keywords=["coach","coaching","trainer"]
- "creative jobs in fashion" → industry=fashion, role_categories=["Creative"]
- "entry level coffee jobs" → industry=coffee, career_level=entry
- "remote marketing" → role_categories=["Marketing"], work_mode=Remote
- "vet jobs" → industry=pets
- "weekend bar work in Manchester" → title_keywords=["bar","bartender","barback","bar staff","weekend","shift"], type="Part-time", locations=["Manchester","Salford","Trafford","Stockport","Greater Manchester"], industry=hospitality
- "evening cleaning jobs in Leeds" → title_keywords=["cleaner","cleaning","evening"], type="Part-time", locations=["Leeds","West Yorkshire"]

Return a JSON object with these optional fields:
- industry: string (lowercase) - ONLY if clearly mapped
- role_categories: string[] (exact category names)
- title_keywords: string[] (keywords to match in title/description) - always include for free-text queries
- locations: string[] (UK place names + variants)
- career_level: string
- work_mode: string
- type: string

Be generous with title_keywords (include synonyms) and conservative with industry.`,
          },
          { role: "user", content: rawQuery },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "search_filters",
              description: "Return structured job search filters",
              parameters: {
                type: "object",
                properties: {
                  industry: { type: "string" },
                  role_categories: { type: "array", items: { type: "string" } },
                  title_keywords: { type: "array", items: { type: "string" } },
                  locations: { type: "array", items: { type: "string" } },
                  career_level: { type: "string" },
                  work_mode: { type: "string" },
                  type: { type: "string" },
                },
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "search_filters" } },
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const filters = JSON.parse(toolCall.function.arguments);

    if (deterministicMatch) {
      if (deterministicMatch.industry) filters.industry = deterministicMatch.industry;
      if (deterministicMatch.roleCategories?.length) {
        filters.role_categories = Array.from(
          new Set([...(filters.role_categories || []), ...deterministicMatch.roleCategories])
        );
      }
      if (deterministicMatch.titleKeywords?.length) {
        filters.title_keywords = Array.from(
          new Set([...(filters.title_keywords || []), ...deterministicMatch.titleKeywords])
        );
      }
    }

    console.log("AI parsed filters:", JSON.stringify(filters));

    // Word-boundary regex helper (used in multiple places below).
    const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Known industries (must match the enum the AI was given).
    const KNOWN_INDUSTRIES = new Set([
      "bakery","beauty","beer","cars","charity","cinema","coffee","estate-agency",
      "farming","fashion","football","footwear","gaming","grocery","health",
      "horse-racing","hospitality","interior-design","jewellery","journalism","money",
      "music","pets","physiotherapy","psychotherapy","teaching","travel","wellness",
    ]);

    // Trust the AI's industry pick when (a) it's in the known list AND (b) the raw
    // query actually mentions the industry (or a close synonym). Prevents force-fits
    // (e.g. "insurance" → money) while honouring obvious cases like "junior fashion".
    const INDUSTRY_SYNONYMS: Record<string, string[]> = {
      "estate-agency": ["estate agency", "estate agent", "lettings", "property"],
      "horse-racing": ["horse racing", "racing", "equine", "horse"],
      "interior-design": ["interior design", "interior designer", "interiors"],
      fashion: ["fashion", "clothing", "apparel", "garment", "menswear", "womenswear"],
      football: ["football", "footy", "soccer"],
      footwear: ["footwear", "shoes", "trainers", "sneakers"],
      hospitality: ["hospitality", "bar", "pub", "restaurant", "hotel", "catering"],
      pets: ["pet", "pets", "vet", "veterinary", "animal", "kennel"],
      cinema: ["cinema", "film", "movie"],
      grocery: ["grocery", "supermarket"],
      money: ["money", "finance", "banking", "fintech", "investment"],
      music: ["music", "musician", "band", "record label"],
      health: ["health", "healthcare", "medical", "nhs", "nurse", "nursing", "doctor", "gp", "physician", "consultant", "surgeon", "paramedic", "midwife", "dentist", "dental", "pharmacist", "pharmacy", "radiologist", "psychiatrist", "clinician", "clinical"],
      coffee: ["coffee", "barista", "cafe", "café"],
      beer: ["beer", "brewery", "brewing", "ale", "lager"],
      wellness: ["wellness", "wellbeing", "yoga", "meditation"],
      beauty: ["beauty", "cosmetics", "makeup", "skincare", "salon"],
      jewellery: ["jewellery", "jewelry", "jeweller", "watches"],
      cars: ["car", "cars", "automotive", "vehicle"],
      farming: ["farm", "farming", "agriculture", "agri"],
      gaming: ["gaming", "games", "video game", "esports"],
      journalism: ["journalism", "journalist", "reporter", "news", "editorial"],
      bakery: ["bakery", "baker", "baking", "bread", "patisserie", "pastry"],
      charity: ["charity", "non-profit", "nonprofit", "ngo", "third sector"],
      teaching: ["teaching", "teacher", "tutor", "education", "school"],
      travel: ["travel", "tourism", "tour operator", "airline"],
      physiotherapy: ["physio", "physiotherapy", "physiotherapist"],
      psychotherapy: ["psychotherapy", "therapist", "counsellor", "counselor", "psychology"],
    };

    const aiIndustry = typeof filters.industry === "string" ? filters.industry.toLowerCase().trim() : "";
    const aiIndustryMentioned =
      !!aiIndustry &&
      KNOWN_INDUSTRIES.has(aiIndustry) &&
      (INDUSTRY_SYNONYMS[aiIndustry] || [aiIndustry]).some((syn) =>
        new RegExp(`(?:^|[^a-z])${escapeRe(syn)}(?:[^a-z]|$)`, "i").test(normalizedQuery)
      );

    const shouldForceIndustry = Boolean(deterministicMatch?.industry) || aiIndustryMentioned;
    if (aiIndustryMentioned) filters.industry = aiIndustry;
    console.log(`Industry handling → forced=${shouldForceIndustry}, value=${filters.industry || "(none)"}, source=${deterministicMatch?.industry ? "alias" : aiIndustryMentioned ? "ai+query-mention" : "none"}`);

    const isShortQuery = rawQuery.length < 6;
    const hasKeywordGuard = Boolean(filters.title_keywords?.length || filters.role_categories?.length);

    const aliasKeywordPool = deterministicMatch?.titleKeywords || [];
    const aliasWordCount = rawQuery.split(/\s+/).filter(Boolean).length;
    const useDeterministicKeywordsOnly =
      Boolean(deterministicMatch?.industry && aliasKeywordPool.length > 0) &&
      aliasWordCount <= 3 &&
      !filters.locations?.length &&
      !filters.work_mode &&
      !filters.type &&
      !filters.role_categories?.length;

    // Build the keyword pool first so we can drive search by it from the start.
    const keywordPool: string[] = [];
    if (useDeterministicKeywordsOnly) {
      keywordPool.push(...aliasKeywordPool);
      if (!aliasKeywordPool.some((kw) => kw.toLowerCase() === normalizedQuery)) {
        keywordPool.unshift(rawQuery);
      }
    } else if (filters.title_keywords?.length) {
      keywordPool.push(...filters.title_keywords);
    }
    // For free-text searches without explicit keywords, treat the raw query as a keyword.
    if (keywordPool.length === 0) keywordPool.push(rawQuery);

    const kwLower = keywordPool.map((k: string) => k.toLowerCase());
    const semanticKeywords = Array.from(
      new Set([
        ...kwLower,
        ...((aliasKeywordPool || []).map((k: string) => k.toLowerCase())),
      ])
    );
    const isSimpleSemanticQuery =
      rawQuery.split(/\s+/).filter(Boolean).length <= 3 &&
      !filters.locations?.length &&
      !filters.work_mode &&
      !filters.type &&
      !filters.career_level &&
      semanticKeywords.length > 0;

    // Short keywords (≤3 chars like "rn", "hr", "pm", "ux") cause massive false positives
    // when used with ilike '%kw%' (e.g. "rn" matches "intern", "Northern", "Therapist").
    const SQL_MIN_LEN = 4;
    const sqlKeywords = keywordPool.filter((k: string) => k.length >= SQL_MIN_LEN);
    if (sqlKeywords.length === 0 && keywordPool.length > 0) {
      const longest = [...keywordPool].sort((a, b) => b.length - a.length)[0];
      sqlKeywords.push(longest);
    }

    const kwBoundaryRegexes = kwLower.map(
      (k: string) => new RegExp(`(?:^|[^a-z0-9])${escapeRe(k)}(?:[^a-z0-9]|$)`, "i")
    );

    // ---------- PRIMARY SEARCH ----------
    let matched: any[] = [];

    if (sqlKeywords.length > 0) {
      // For short single-word queries (e.g. "doctor", "nurse", "barista"), restrict
      // SQL search to title + company only. Description matching causes false positives
      // when keywords appear in venue names, addresses, or boilerplate copy
      // (e.g. the pub "Old Doctor Butlers Head" returning for "doctor").
      const restrictToTitle = sqlKeywords.length <= 2 && sqlKeywords.every((kw: string) => !kw.includes(" "));
      const orClauses = sqlKeywords
        .map((kw: string) =>
          restrictToTitle
            ? `title.ilike.%${kw}%,company.ilike.%${kw}%`
            : `title.ilike.%${kw}%,description.ilike.%${kw}%,company.ilike.%${kw}%`
        )
        .join(",");

      let kwQuery = sb
        .from("jobs")
        .select("id, title, company, description, industry, tags, role_category, ai_role_category, career_level, work_mode, type, location")
        .or(orClauses)
        .limit(500);

      // Constrain by industry whenever we trust the pick (deterministic alias OR
      // AI-picked industry explicitly named/synonymised in the query).
      if (shouldForceIndustry && filters.industry) {
        kwQuery = kwQuery.eq("industry", filters.industry);
      }
      if (filters.career_level) kwQuery = kwQuery.eq("career_level", filters.career_level);
      if (filters.work_mode) kwQuery = kwQuery.eq("work_mode", filters.work_mode);
      if (filters.type) kwQuery = kwQuery.eq("type", filters.type);

      // Tag-based search (Passion tags) in parallel for richer matching.
      const tagQueries = keywordPool.map((kw: string) => {
        const exactPassionTag = `Passion: ${kw
          .split(/\s+/)
          .filter(Boolean)
          .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(" ")}`;
        let tagQuery = sb
          .from("jobs")
          .select("id, title, company, description, industry, tags, role_category, ai_role_category, career_level, work_mode, type, location")
          .contains("tags", [exactPassionTag])
          .limit(200);
        if (shouldForceIndustry && filters.industry) {
          tagQuery = tagQuery.eq("industry", filters.industry);
        }
        return tagQuery;
      });

      const [{ data: kwRows, error: kwErr }, ...tagResults] = await Promise.all([kwQuery, ...tagQueries]);
      if (kwErr) {
        console.error("Keyword query error:", kwErr);
      }

      const merged = [
        ...(kwRows || []),
        ...tagResults.flatMap((r: any) => r.data || []),
      ];
      const deduped = Array.from(new Map(merged.map((row: any) => [row.id, row])).values());

      // ---------- WORD-BOUNDARY VALIDATION ----------
      // Eliminate substring false-positives (e.g. "rn" matching "intern", "Northern",
      // or "doctor" matching pub names like "Old Doctor Butlers Head" in descriptions).
      // For short single-word queries we exclude description from the haystack - the
      // keyword must appear in title, company or tags as a whole word.
      const semanticTitleRegexes = semanticKeywords
        .filter((k: string) => k.length >= 3)
        .map((k: string) => new RegExp(`(?:^|[^a-z0-9])${escapeRe(k)}(?:[^a-z0-9]|$)`, "i"));

      // Exclusion regexes - drop jobs whose title/category/tags mention an excluded
      // term (e.g. exclude "vet"/"veterinary" from a "doctor" search).
      const excludeRegexes = (deterministicMatch?.excludeKeywords || [])
        .filter((k: string) => k.length >= 3)
        .map((k: string) => new RegExp(`(?:^|[^a-z0-9])${escapeRe(k)}(?:[^a-z0-9]|$)`, "i"));

      matched = deduped.filter((j: any) => {
        const haystackParts = [
          j.title || "",
          j.company || "",
          Array.isArray(j.tags) ? j.tags.join(" ") : "",
        ];
        if (!restrictToTitle) haystackParts.push(j.description || "");
        const haystack = haystackParts.join(" ");
        const boundaryMatch = kwBoundaryRegexes.some((re) => re.test(haystack));
        if (!boundaryMatch) return false;

        // Apply exclusion list against title/category/tags (never description, to
        // avoid dropping legitimate human-medicine jobs that mention "animal model" etc.)
        if (excludeRegexes.length > 0) {
          const exclusionHaystack = [
            j.title || "",
            j.role_category || "",
            j.ai_role_category || "",
            Array.isArray(j.tags) ? j.tags.join(" ") : "",
          ].join(" ");
          if (excludeRegexes.some((re) => re.test(exclusionHaystack))) return false;
        }

        if (!isSimpleSemanticQuery) return true;

        const titleSemanticHaystack = [
          j.title || "",
          j.role_category || "",
          j.ai_role_category || "",
          Array.isArray(j.tags) ? j.tags.join(" ") : "",
        ].join(" ");

        return semanticTitleRegexes.length > 0
          ? semanticTitleRegexes.some((re) => re.test(titleSemanticHaystack))
          : kwBoundaryRegexes.some((re) => re.test(titleSemanticHaystack));
      });
    }

    // ---------- ROLE CATEGORY POST-FILTER ----------
    // Apply role_category as a soft filter in JS so it works alongside keywords without
    // imploding the result set when categories don't match exactly.
    if (filters.role_categories && filters.role_categories.length > 0 && matched.length > 0) {
      const cats = filters.role_categories.map((c: string) => c.toLowerCase());
      const roleMatched = matched.filter((j: any) => {
        const rc = `${j.role_category || ""} ${j.ai_role_category || ""}`.toLowerCase();
        return cats.some((c: string) => rc.includes(c));
      });
      // Only apply if it doesn't wipe out everything
      if (roleMatched.length >= 3) matched = roleMatched;
    }

    // ---------- INDUSTRY-ONLY PATH (no keyword fallback) ----------
    // If somehow we have no keywords and an industry was forced, return that industry.
    if (matched.length === 0 && shouldForceIndustry && filters.industry) {
      const { data: industryRows } = await sb
        .from("jobs")
        .select("id, title, company, description, industry, tags, role_category, ai_role_category, career_level, work_mode, type, location")
        .eq("industry", filters.industry)
        .limit(120);
      matched = industryRows || [];
    }

    // ---------- INDUSTRY-RELAX FALLBACK ----------
    // When we forced an industry filter but ended up with a thin result set, the
    // industry tag is almost certainly under-classifying genuinely matching jobs
    // (e.g. "influencer" returns 47 in industry=influencing but the DB has
    // 80+ matching titles spread across football/gaming/marketing/null). Run a
    // second pass WITHOUT the industry constraint, validate against the same
    // word-boundary regex, and merge anything new in. This lets the AI surface
    // long-tail relevant roles without polluting the result with false positives.
    const RELAX_THRESHOLD = 30;
    if (
      shouldForceIndustry &&
      filters.industry &&
      sqlKeywords.length > 0 &&
      matched.length < RELAX_THRESHOLD
    ) {
      const restrictToTitle = sqlKeywords.length <= 2 && sqlKeywords.every((kw: string) => !kw.includes(" "));
      const orClauses = sqlKeywords
        .map((kw: string) =>
          restrictToTitle
            ? `title.ilike.%${kw}%,company.ilike.%${kw}%`
            : `title.ilike.%${kw}%,description.ilike.%${kw}%,company.ilike.%${kw}%`
        )
        .join(",");

      const { data: relaxRows, error: relaxErr } = await sb
        .from("jobs")
        .select("id, title, company, description, industry, tags, role_category, ai_role_category, career_level, work_mode, type, location")
        .or(orClauses)
        .limit(500);

      if (relaxErr) {
        console.error("Industry-relax fallback error:", relaxErr);
      } else {
        const seenIds = new Set(matched.map((j: any) => j.id));
        const semanticTitleRegexes = semanticKeywords
          .filter((k: string) => k.length >= 3)
          .map((k: string) => new RegExp(`(?:^|[^a-z0-9])${escapeRe(k)}(?:[^a-z0-9]|$)`, "i"));
        const excludeRegexes = (deterministicMatch?.excludeKeywords || [])
          .filter((k: string) => k.length >= 3)
          .map((k: string) => new RegExp(`(?:^|[^a-z0-9])${escapeRe(k)}(?:[^a-z0-9]|$)`, "i"));

        const extras = (relaxRows || []).filter((j: any) => {
          if (seenIds.has(j.id)) return false;
          // Strict title-only validation in the relax pass - we're trusting
          // title match instead of the industry tag, so the title must clearly
          // contain a query keyword (no description-only matches).
          const titleHaystack = [
            j.title || "",
            j.role_category || "",
            j.ai_role_category || "",
            Array.isArray(j.tags) ? j.tags.join(" ") : "",
          ].join(" ");
          const titleMatch = semanticTitleRegexes.length > 0
            ? semanticTitleRegexes.some((re) => re.test(titleHaystack))
            : kwBoundaryRegexes.some((re) => re.test(titleHaystack));
          if (!titleMatch) return false;

          if (excludeRegexes.length > 0) {
            if (excludeRegexes.some((re) => re.test(titleHaystack))) return false;
          }
          return true;
        });

        if (extras.length > 0) {
          console.log(`Industry-relax fallback added ${extras.length} jobs from outside industry=${filters.industry} (had ${matched.length}).`);
          matched = [...matched, ...extras];
        }
      }
    }

    // ---------- LOCATION POST-FILTER ----------
    // The AI extracts UK place names + variants into filters.locations. Apply as a
    // strict post-filter so "weekend bar work in Manchester" doesn't return Devon.
    // We need the location column on every row - re-fetch it if missing.
    if (filters.locations && filters.locations.length > 0 && matched.length > 0) {
      const needsLocation = matched.some((j: any) => j.location === undefined);
      if (needsLocation) {
        const ids = matched.map((j: any) => j.id);
        const { data: locRows } = await sb
          .from("jobs")
          .select("id, location")
          .in("id", ids);
        const locMap = new Map((locRows || []).map((r: any) => [r.id, r.location]));
        matched = matched.map((j: any) => ({ ...j, location: locMap.get(j.id) ?? j.location ?? null }));
      }
      const locRegexes = (filters.locations as string[])
        .filter((l) => typeof l === "string" && l.trim().length >= 3)
        .map((l) => new RegExp(`(?:^|[^a-z0-9])${escapeRe(l.toLowerCase())}(?:[^a-z0-9]|$)`, "i"));
      // Also accept Remote work-mode rows when "remote" is in the requested locations.
      const acceptsRemote = (filters.locations as string[]).some((l) => /remote/i.test(l));
      const locFiltered = matched.filter((j: any) => {
        const loc = (j.location || "").toLowerCase();
        if (acceptsRemote && /remote/i.test(j.work_mode || "")) return true;
        if (!loc) return false;
        return locRegexes.some((re) => re.test(loc));
      });
      // Only apply the location filter if it leaves a meaningful result set.
      // Otherwise keep all matches but log - we'd rather over-return than 0.
      if (locFiltered.length > 0) {
        matched = locFiltered;
      } else {
        console.log(`Location filter (${filters.locations.join(", ")}) eliminated all ${matched.length} matches - keeping unfiltered set.`);
      }
    }

    // ---------- RANKING ----------
    // Prioritise title matches > company > description; within ties, keep insertion order.
    if (matched.length > 0 && kwLower.length > 0) {
      const score = (j: any): number => {
        const title = (j.title || "").toLowerCase();
        const company = (j.company || "").toLowerCase();
        const desc = (j.description || "").toLowerCase();
        const roleMeta = `${j.role_category || ""} ${j.ai_role_category || ""} ${Array.isArray(j.tags) ? j.tags.join(" ") : ""}`.toLowerCase();
        let s = 0;
        for (const kw of semanticKeywords) {
          if (title.includes(kw)) s += 10;
          if (!isSimpleSemanticQuery && company.includes(kw)) s += 4;
          if (roleMeta.includes(kw)) s += 6;
          if (desc.includes(kw)) s += 1;
        }
        return s;
      };
      matched.sort((a: any, b: any) => score(b) - score(a));
    }

    // Cap final result set
    const MAX_RESULTS = hasKeywordGuard || keywordPool.length > 0 ? 250 : 60;
    if (matched.length > MAX_RESULTS) matched = matched.slice(0, MAX_RESULTS);

    const jobIds = matched.map((j: any) => j.id);

    return new Response(
      JSON.stringify({
        filters,
        job_ids: jobIds,
        count: jobIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-job-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});