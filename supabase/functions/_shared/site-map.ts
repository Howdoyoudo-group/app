// =============================================================================
// SINGLE SOURCE OF TRUTH for Howdy's site knowledge.
//
// Both the web Howdy (`career-assistant`) and the WhatsApp Howdy
// (`whatsapp-inbound`) read from this file to build their system prompt.
//
// This file now exposes both a compact prompt map and a searchable page index.
// Howdy should search the index at answer time instead of relying on memory.
//
// Do NOT list: /admin/*, /auth, /reset-password, /forgot-password,
// /onboarding, /employer-login, /employer-dashboard, /howdy/*, *-demo,
// /home-v2, /briefings, /unsubscribe.
// =============================================================================

export const SITE_DOMAIN = "https://howdoyoudo.group";

export const SITE_INDUSTRIES = [
  { slug: "bakery", label: "Bakery" },
  { slug: "beauty", label: "Beauty" },
  { slug: "beer", label: "Beer" },
  { slug: "cars", label: "Cars" },
  { slug: "charity", label: "Charity" },
  { slug: "cinema", label: "Film & TV" },
  { slug: "coffee", label: "Coffee" },
  { slug: "estate-agency", label: "Estate Agency" },
  { slug: "farming", label: "Farming" },
  { slug: "fashion", label: "Fashion" },
  { slug: "football", label: "Football" },
  { slug: "footwear", label: "Footwear" },
  { slug: "formula-1", label: "Formula 1" },
  { slug: "gaming", label: "Gaming" },
  { slug: "grocery", label: "Grocery" },
  { slug: "health", label: "Health" },
  { slug: "horse-racing", label: "Horse Racing" },
  { slug: "hospitality", label: "Hospitality" },
  { slug: "influencing", label: "Influencing & Creators" },
  { slug: "interior-design", label: "Interior Design" },
  { slug: "jewellery", label: "Jewellery" },
  { slug: "journalism", label: "Journalism" },
  { slug: "money", label: "Money & Finance" },
  { slug: "music", label: "Music" },
  { slug: "pets", label: "Pets" },
  { slug: "physiotherapy", label: "Physiotherapy" },
  { slug: "psychotherapy", label: "Psychotherapy" },
  { slug: "teaching", label: "Teaching" },
  { slug: "travel", label: "Travel" },
  { slug: "wellness", label: "Wellness" },
] as const;

export const SITE_TOOLS = [
  { path: "/marketplace", label: "Marketplace", desc: "Jobs board, Smart Search, Understand Me career profiling, Help me get this job" },
  { path: "/my-jobs", label: "Jobs Inbox", desc: "Personalised live UK job matches based on profile + RIASEC" },
  { path: "/my-profile", label: "My Profile", desc: "Profile, interests, saved jobs, WhatsApp digest" },
  { path: "/cv-builder", label: "CV Builder", desc: "Build and tailor your CV" },
  { path: "/learning", label: "Learning Hub", desc: "Courses, mentoring, apprenticeships, further education" },
  { path: "/mentoring", label: "Mentoring", desc: "Mentor directory and requests" },
  { path: "/roles", label: "Roles directory", desc: "All role pages: marketing, finance, creative, chef, teacher, etc." },
] as const;

export const SITE_SIDE_HUSTLES_ROOT = "/side-hustles";
export const SITE_SIDE_HUSTLE_TOPICS = [
  { slug: "selling-online", label: "Selling Online" },
  { slug: "freelancing", label: "Freelancing" },
  { slug: "delivery-driving", label: "Delivery & Driving" },
  { slug: "tutoring-coaching", label: "Tutoring & Coaching" },
  { slug: "content-creation", label: "Content Creation" },
  { slug: "pet-care", label: "Pet Care" },
  { slug: "renting-assets", label: "Renting Assets" },
  { slug: "handmade-products", label: "Handmade Products" },
  { slug: "digital-products", label: "Digital Products" },
  { slug: "local-services", label: "Local Services" },
] as const;

export const SITE_STARTING_A_BUSINESS = "/starting-a-business";

export const SITE_OTHER = [
  { path: "/employers", label: "For Employers" },
  { path: "/educators", label: "For Schools / Educators" },
  { path: "/contact", label: "Contact" },
  { path: "/terms", label: "Terms & Privacy" },
] as const;

// Curated company profiles (a subset — there are more dynamic /company/:slug pages).
export const SITE_COMPANIES = [
  "me-em", "gails", "dr-martens", "nike", "birkenstock", "timberland", "ugg",
  "ocado", "greggs", "save-the-children", "netflix", "everyman", "grind",
  "savills", "rightmove", "burberry", "asos", "premier-league", "sky-sports",
  "tesco", "soho-house", "tom-dixon", "dice", "teach-first", "adidas",
  "purplebricks", "costa", "starbucks", "caffe-nero", "blank-street",
  "hawkstone", "five-guys", "pragnell", "news-uk",
] as const;

export type SiteIndexEntry = {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  priority?: number;
};

export const SITE_SEARCH_INDEX: SiteIndexEntry[] = [
  ...SITE_INDUSTRIES.map((industry) => ({
    path: `/${industry.slug}`,
    title: `${industry.label} industry`,
    description: `${industry.label} industry page with career map, breaking news, featured articles, company profiles, courses, podcasts, videos and Jobs.`,
    keywords: [industry.slug, industry.label, "industry", "career map", "companies", "courses", "jobs", "day in the life"],
    priority: 4,
  })),
  ...SITE_TOOLS.map((tool) => ({
    path: tool.path,
    title: tool.label,
    description: tool.desc,
    keywords: [tool.label, tool.desc, tool.path.replace("/", ""), "tool"],
    priority: 5,
  })),
  {
    path: SITE_SIDE_HUSTLES_ROOT,
    title: "Side Hustles",
    description: "Curated UK guide to part-time income: selling online, freelancing, delivery, tutoring, content creation, pet care, renting assets, handmade products, digital products and local services. Includes what to watch, listen, read and practical help on tax, insurance and registration.",
    keywords: ["side hustle", "side hustles", "side income", "extra money", "make money", "part-time income", "supplement income", "freelance", "freelancing", "selling online", "vinted", "depop", "ebay", "etsy", "delivery", "driving", "tutoring", "coaching", "content creation", "creator", "pet care", "dog walking", "renting assets", "handmade", "digital products", "local services", "self-employed", "hmrc", "tax"],
    priority: 100,
  },
  ...SITE_SIDE_HUSTLE_TOPICS.map((topic) => ({
    path: `${SITE_SIDE_HUSTLES_ROOT}/${topic.slug}`,
    title: `${topic.label} side hustle`,
    description: `Dedicated Side Hustles topic for ${topic.label}, with curated watch/listen/read resources and practical UK help.`,
    keywords: ["side hustle", "side hustles", "side income", "extra money", "make money", topic.label, topic.slug.replace(/-/g, " ")],
    priority: 80,
  })),
  {
    path: SITE_STARTING_A_BUSINESS,
    title: "Starting a Business",
    description: "Comprehensive UK founder hub covering business ideas, AI, business plans, incorporation, SEIS, EIS, HMRC Advance Assurance, fundraising, grants, angels, crowdfunding, cap tables, shareholder agreements, legal foundations and founder stories.",
    keywords: ["starting a business", "start a business", "startup", "founder", "entrepreneur", "incorporate", "limited company", "ltd", "companies house", "seis", "eis", "seed enterprise investment scheme", "enterprise investment scheme", "advance assurance", "hmrc", "fundraising", "raise money", "investment", "investors", "angel", "vc", "venture capital", "grants", "crowdfunding", "cap table", "shareholder agreement", "seedlegals", "british business bank", "sfc capital", "angel academe", "backeriq"],
    priority: 100,
  },
  ...SITE_OTHER.map((page) => ({
    path: page.path,
    title: page.label,
    description: `${page.label} page on Howdy.`,
    keywords: [page.label, page.path.replace("/", "")],
    priority: 2,
  })),
  ...SITE_COMPANIES.map((slug) => ({
    path: `/company/${slug}`,
    title: `${slug.replace(/-/g, " ")} company profile`,
    description: `Company profile for ${slug.replace(/-/g, " ")} with brand overview and related Jobs.`,
    keywords: [slug, slug.replace(/-/g, " "), "company", "employer", "brand", "profile", "jobs"],
    priority: 3,
  })),
];

const STOP_WORDS = new Set(["about", "after", "again", "also", "because", "being", "could", "does", "find", "from", "get", "have", "help", "how", "into", "know", "like", "make", "need", "page", "please", "ready", "show", "some", "that", "their", "there", "these", "thing", "this", "want", "what", "when", "where", "which", "with", "would", "your"]);

export type ScoredSiteEntry = { entry: SiteIndexEntry; score: number };

export function searchSiteIndexScored(query: string, limit = 6): ScoredSiteEntry[] {
  const normalised = query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!normalised) return [];
  const tokens = Array.from(new Set(normalised.split(/\s+/).filter((t) => t.length > 2 && !STOP_WORDS.has(t))));

  return SITE_SEARCH_INDEX
    .map((entry) => {
      const haystack = `${entry.title} ${entry.description} ${entry.keywords.join(" ")}`.toLowerCase();
      let score = 0;
      if (haystack.includes(normalised)) score += 80;
      for (const token of tokens) {
        if (entry.path.toLowerCase().includes(token)) score += 10;
        if (entry.title.toLowerCase().includes(token)) score += 16;
        if (entry.keywords.some((k) => k.toLowerCase() === token || k.toLowerCase().includes(token))) score += 14;
        if (entry.description.toLowerCase().includes(token)) score += 5;
      }
      if (score > 0) score += entry.priority ?? 0;
      return { entry, score };
    })
    .filter(({ score }) => score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function searchSiteIndex(query: string, limit = 6): SiteIndexEntry[] {
  return searchSiteIndexScored(query, limit).map(({ entry }) => entry);
}

export function renderSiteSearchResults(query: string, limit = 6): string {
  const matches = searchSiteIndex(query, limit);
  if (!matches.length) return "No matching Howdy pages found.";
  return matches
    .map((entry) => `- [${entry.title}](${entry.path}) — ${entry.description}`)
    .join("\n");
}

/**
 * High-priority routing directive when the top match scores strongly.
 * Inject as its own system message — separate from the long site map —
 * so the model treats it as a directive, not a memorised reference.
 * Returns null when there's no confident match.
 */
export function buildRoutingDirective(query: string): string | null {
  const scored = searchSiteIndexScored(query, 5);
  if (!scored.length) return null;
  const top = scored[0];
  if (top.score < 60) return null;

  const supporting = scored.slice(1, 4)
    .filter((s) => s.score >= 30)
    .map((s) => `- [${s.entry.title}](${s.entry.path})`)
    .join("\n");

  return [
    `PRIORITY ROUTING — the user's question matches a canonical Howdy page.`,
    ``,
    `Top match: [${top.entry.title}](${top.entry.path})`,
    `Why: ${top.entry.description}`,
    ``,
    `Rules for this reply (override anything in your general prompt that conflicts):`,
    `1. The FIRST sentence or bullet of your reply MUST link to ${top.entry.path} using markdown.`,
    `2. Do NOT bury this link under generic brainstorming, Learning Hub suggestions, or unrelated industry pages.`,
    `3. Do NOT invent off-platform ideas in place of this page.`,
    `4. You MAY add up to 2 supporting Howdy links from the list below if directly relevant.`,
    supporting ? `\nSupporting pages you may also link:\n${supporting}` : ``,
  ].filter(Boolean).join("\n");
}

/** Plain-text version for WhatsApp. */
export function buildRoutingDirectiveWhatsApp(query: string): string | null {
  const scored = searchSiteIndexScored(query, 3);
  if (!scored.length) return null;
  const top = scored[0];
  if (top.score < 60) return null;
  const url = `${SITE_DOMAIN}${top.entry.path}`;
  return `PRIORITY: The user's question maps to ${top.entry.title} (${url}). Your reply MUST start with that URL and a one-line "why". Do NOT replace it with generic advice or Learning Hub suggestions.`;
}

// -----------------------------------------------------------------------------
// Renderers — produce prompt-ready text blocks. Two flavours: rich markdown
// for the web chatbot, compact plain-text for WhatsApp.
// -----------------------------------------------------------------------------

/** Rich markdown block for the web Howdy (`career-assistant`). */
export function renderSiteMapForPrompt(): string {
  const industries = SITE_INDUSTRIES
    .map((i) => `${i.label} (/${i.slug})`)
    .join(", ");

  const tools = SITE_TOOLS
    .map((t) => `- **${t.label}** ([${t.path}](${t.path})) — ${t.desc}`)
    .join("\n");

  const hustleTopics = SITE_SIDE_HUSTLE_TOPICS
    .map((t) => `[${t.label}](${SITE_SIDE_HUSTLES_ROOT}/${t.slug})`)
    .join(", ");

  const other = SITE_OTHER
    .map((o) => `- [${o.label}](${o.path})`)
    .join("\n");

  const companies = SITE_COMPANIES.join(", ");

  return `
## Site map (canonical — only recommend pages that appear here)

### Industries
Each industry has its own page at \`/{slug}\` with career map, breaking news, featured articles, company profiles, courses & degrees, podcasts and "Day in the Life" content.

${industries}

### Career tools
${tools}

### Side Hustles ([${SITE_SIDE_HUSTLES_ROOT}](${SITE_SIDE_HUSTLES_ROOT}))
Curated UK guide to part-time ways young people make money — what to watch, listen, read, and the UK tax/insurance/registration help. Topics: ${hustleTopics}.

**Rule:** Whenever a user asks about side hustles, side income, making money on the side, supplementing income, or proving strategic value through a side project, ALWAYS link them to [/side-hustles](/side-hustles) (and a specific topic if relevant). Do NOT invent generic side-hustle ideas off-platform.

### Starting a Business ([${SITE_STARTING_A_BUSINESS}](${SITE_STARTING_A_BUSINESS}))
Comprehensive UK founder hub. Covers: incorporating a Ltd company, **SEIS & EIS tax-relief schemes** (SeedLegals, British Business Bank, SFC Capital, Angel Academe, BackerIQ), HMRC Advance Assurance, fundraising legal foundations, grants, angel networks, crowdfunding, cap tables, shareholder agreements, and founder stories.

**Rule:** Whenever a user asks about starting a business, founding a startup, incorporating, raising investment, SEIS, EIS, Advance Assurance, angel investors, VC, grants, cap tables, or any founder/fundraising topic, ALWAYS link to [/starting-a-business](/starting-a-business) FIRST. Do NOT route these questions to the Learning Hub or industry pages — /starting-a-business is the canonical home.

### Company profiles
At \`/company/{slug}\`. Curated profiles include: ${companies}.

### Other pages
${other}
`.trim();
}

/** Compact plain-text block for the WhatsApp Howdy (must keep replies short). */
export function renderSiteMapForWhatsApp(): string {
  const topIndustries = SITE_INDUSTRIES.slice(0, 12).map((i) => `/${i.slug}`).join(", ");
  return `
Site sections you can point to (URLs are ${SITE_DOMAIN}{path}):
• Industries (30+): ${topIndustries}… — career map, news, companies, courses
• /marketplace — full jobs board + "Understand Me" career profiling + "Help me get this job"
• /my-jobs — personalised live UK jobs inbox
• /learning — courses, mentoring, apprenticeships
• /side-hustles — curated UK part-time income ideas (freelancing, tutoring, content, pet care, selling online, delivery, handmade, digital products, renting assets, local services) with what to watch/listen/read + UK tax/registration help. **ALWAYS link here for any side-income question — never invent off-platform ideas.**
• /starting-a-business — UK founder hub: incorporating, **SEIS/EIS**, HMRC Advance Assurance, fundraising, grants, angels, crowdfunding, cap tables. **ALWAYS link here for any founder/startup/SEIS/EIS/fundraising question — not the Learning Hub.**
• /cv-builder — build/tailor your CV
• /mentoring — mentor directory
• /my-profile — profile, interests, WhatsApp digest

Rule: only recommend pages listed above. If a user asks about something not here, say you don't have a page for it rather than inventing one.
`.trim();
}
