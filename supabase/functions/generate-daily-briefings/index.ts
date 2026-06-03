import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INDUSTRY_NAMES: Record<string, string> = {
  bakery: "Bakery",
  beauty: "Beauty",
  beer: "Beer",
  cars: "Cars",
  charity: "Charity",
  cinema: "Film and TV",
  coffee: "Coffee",
  "estate-agency": "Estate Agency",
  fashion: "Fashion",
  football: "Football",
  footwear: "Footwear",
  gaming: "Gaming",
  grocery: "Grocery",
  hospitality: "Hospitality",
  "interior-design": "Interior Design",
  jewellery: "Jewellery",
  journalism: "Journalism",
  music: "Music",
  pets: "Pets",
  physiotherapy: "Physiotherapy",
  psychotherapy: "Psychotherapy",
  teaching: "Teaching",
  travel: "Travel",
  wellness: "Wellness",
  farming: "Farming",
  money: "Money",
  health: "Health",
  "horse-racing": "Horse Racing",
};

const INDUSTRY_CONTEXT: Record<string, string> = {
  cinema: "film, cinema, streaming, TV production, box office, studios, entertainment industry business",
  fashion: "fashion brands, clothing retail, luxury fashion, sustainable fashion",
  beer: "beer industry, craft beer, breweries, pub industry, brewing, taproom, beer brands",
  coffee: "coffee shops, coffee chains, specialty coffee, barista, coffee roasting, cafe industry",
  music: "music industry, record labels, live music, festivals, streaming, music business",
  grocery: "supermarkets, grocery retail, food supply chain, Tesco, Sainsburys, online grocery",
  football: "football business, Premier League, sports media, clubs, sponsorship, broadcasting",
  teaching: "education policy, schools, teaching, EdTech, universities, teacher training",
  "interior-design": "interior design, architecture, home interiors, furnishings, design trends",
  charity: "charity sector, nonprofits, social enterprise, fundraising, grants, voluntary sector",
  "estate-agency": "property market, estate agents, lettings, proptech, housing market",
  bakery: "bakery industry, artisan bread, bakery chains, patisserie, baking business",
  hospitality: "hospitality industry, restaurants, hotels, pubs, bars, catering, events",
  footwear: "footwear industry, shoe brands, sneakers, Nike, Adidas, JD Sports",
  physiotherapy: "physiotherapy, physical therapy, NHS physio, sports rehab",
  psychotherapy: "psychotherapy, counselling, mental health services, CBT, therapy",
  wellness: "fitness, gyms, health wellness, activewear, spa, wellbeing, sports nutrition",
  gaming: "video game industry, game studios, esports, game development, gaming business",
  journalism: "journalism, media industry, newspapers, broadcasting, press, digital media",
  jewellery: "jewellery industry, luxury watches, diamonds, goldsmiths, jewellery retail",
  pets: "pet industry, pet food, veterinary, pet retail, animal health",
  travel: "travel industry, tourism, airlines, hotels, travel agencies, aviation",
  cars: "automotive industry, car manufacturers, electric vehicles, car dealers, motoring",
  beauty: "beauty industry, cosmetics, skincare, beauty retail, makeup brands",
  farming: "UK farming, agriculture, agritech, food supply chain, livestock, arable, DEFRA policy, farm subsidies, rural business",
  money: "UK banking, fintech, financial services, wealth management, retail banking, payments, financial regulation, FCA",
  health: "UK healthcare, NHS, hospitals, GPs, private healthcare providers, medtech, healthcare workforce, pharmaceuticals business",
  "horse-racing": "UK horse racing, racecourses, Jockey Club, Arena Racing, BHA, bloodstock, breeding, racing broadcast, betting industry",
};

interface NewsItem {
  title: string;
  source: string;
  url: string;
}

interface SourceLink {
  title: string;
  url: string;
}

interface RecentBriefingContext {
  summaries: string;
  sourceLinks: SourceLink[];
}

const RECENT_BRIEFING_LOOKBACK_DAYS = 21;

const GENERIC_REPEAT_PHRASES = new Set([
  "premier league",
  "champions league",
  "world cup",
  "media rights",
  "sports media",
  "football club",
  "football clubs",
  "broadcasting rights",
]);

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// Lightweight title-similarity to drop near-duplicate headlines.
function normaliseTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}
function tokenSet(t: string): Set<string> {
  return new Set(normaliseTitle(t).split(" ").filter((w) => w.length > 3));
}
function jaccardSimilarity(a: string, b: string): number {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}
function dedupeByTitle<T extends { title: string }>(items: T[], threshold = 0.55): T[] {
  const out: T[] = [];
  for (const item of items) {
    if (out.some((kept) => jaccardSimilarity(kept.title, item.title) >= threshold)) continue;
    out.push(item);
  }
  return out;
}

function canonicalUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return url.split(/[?#]/)[0].replace(/\/$/, "").toLowerCase();
  }
}

function urlLooksStale(url: string, maxAgeDays = 14): boolean {
  const match = url.match(/\/(20\d{2})\/(\d{1,2})(?:\/(\d{1,2}))?\//);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3] || "1");
  const urlDate = new Date(Date.UTC(year, month - 1, day));
  if (!Number.isFinite(urlDate.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);
  return urlDate < cutoff;
}

function titlePhrases(title: string): Set<string> {
  const tokens = normaliseTitle(title)
    .split(" ")
    .filter((word) => word.length > 3);
  const phrases = new Set<string>();
  for (let size = 2; size <= 3; size++) {
    for (let i = 0; i <= tokens.length - size; i++) {
      const phrase = tokens.slice(i, i + size).join(" ");
      if (!GENERIC_REPEAT_PHRASES.has(phrase)) phrases.add(phrase);
    }
  }
  return phrases;
}

function filterRecentlyCovered<T extends { title: string; url: string }>(items: T[], recentLinks: SourceLink[]): T[] {
  if (recentLinks.length === 0) return items;
  const recentUrls = new Set(recentLinks.map((link) => canonicalUrl(link.url)));
  const recentPhrases = new Set<string>();
  for (const link of recentLinks) {
    for (const phrase of titlePhrases(link.title)) recentPhrases.add(phrase);
  }

  return items.filter((item) => {
    if (recentUrls.has(canonicalUrl(item.url))) return false;
    if (recentLinks.some((link) => jaccardSimilarity(item.title, link.title) >= 0.5)) return false;
    for (const phrase of titlePhrases(item.title)) {
      if (recentPhrases.has(phrase)) return false;
    }
    return true;
  });
}

// Hard exclusions per industry to stop off-topic publishers/titles bleeding
// into the briefing pool (e.g. American football noise in `football`).
const HOST_BLOCKLIST_BY_INDUSTRY: Record<string, Set<string>> = {
  football: new Set([
    "nflpa.com", "wnfcfootball.com", "nfl.com",
    "espn.com", "espn.co.uk", "cbssports.com", "nbcsports.com",
    "pro-football-reference.com", "profootballtalk.nbcsports.com",
  ]),
};
const TITLE_BLOCKLIST_BY_INDUSTRY: Record<string, RegExp> = {
  football: /\b(NFL|NFLPA|WNFC|Super Bowl|NCAA|college football|AFC|NFC|Aaron Rodgers|Patrick Mahomes|quarterback|touchdown|gridiron|American football)\b/i,
};

function filterBriefingCandidates<T extends { title: string; url: string; source?: string }>(items: T[], industry: string): T[] {
  const hostBlock = HOST_BLOCKLIST_BY_INDUSTRY[industry];
  const titleBlock = TITLE_BLOCKLIST_BY_INDUSTRY[industry];
  return items.filter((item) => {
    const host = (() => {
      try { return new URL(item.url).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; }
    })();
    if (host === "offthepitch.com") return false;
    if (hostBlock && hostBlock.has(host)) return false;
    if (titleBlock && titleBlock.test(item.title)) return false;
    if (urlLooksStale(item.url)) return false;
    return true;
  });
}

async function fetchRecentBriefings(supabase: any, industry: string): Promise<RecentBriefingContext> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_BRIEFING_LOOKBACK_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("daily_briefings")
    .select("briefing_date, main_news, source_links")
    .eq("industry", industry)
    .gte("briefing_date", cutoffStr)
    .lt("briefing_date", today)
    .order("briefing_date", { ascending: false })
    .limit(14);
  if (!data || data.length === 0) return { summaries: "", sourceLinks: [] };
  const rows = data as { briefing_date: string; main_news: string | null; source_links: SourceLink[] | null }[];
  const summaries = rows
    .filter((d) => d.main_news)
    .map((d) => `[${d.briefing_date}] ${d.main_news!.replace(/<[^>]+>/g, " ").slice(0, 450)}`)
    .join("\n---\n");
  const sourceLinks = rows.flatMap((d) => Array.isArray(d.source_links) ? d.source_links : []);
  return { summaries, sourceLinks };
}

async function fetchContent(supabase: any, industry: string, recentLinks: SourceLink[] = []) {
  // Primary window: last 48 hours. Only fall back to 7 days if the 48h pool
  // yields fewer than 3 items total - this stops stale headlines (like
  // "London commissions") from resurfacing week after week.
  // We filter on BOTH fetched_at/scraped_at AND published_at so that a freshly
  // re-crawled but year-old article cannot leak into "today's briefing".
  const cutoff48h = daysAgoIso(2);
  const cutoff7d = daysAgoIso(7);
  const publishedCutoff = daysAgoIso(14); // article publish date must be within 2 weeks

  const [newsRes48, articlesRes48] = await Promise.all([
    supabase
      .from("breaking_news")
      .select("title, source, url, published_at")
      .eq("industry", industry)
      .gte("fetched_at", cutoff48h)
      .gte("published_at", publishedCutoff)
      .order("published_at", { ascending: false })
      .limit(40),
    supabase
      .from("articles")
      .select("title, source, url, published_at")
      .eq("industry", industry)
      .gte("scraped_at", cutoff48h)
      .gte("published_at", publishedCutoff)
      .order("published_at", { ascending: false })
      .limit(40),
  ]);

  let rawNews = (newsRes48.data ?? []) as NewsItem[];
  let rawArticles = (articlesRes48.data ?? []) as NewsItem[];

  // If the 48h window is too thin, widen to 7 days but clearly mark older items
  if (rawNews.length + rawArticles.length < 3) {
    const [newsRes7d, articlesRes7d] = await Promise.all([
      supabase
        .from("breaking_news")
        .select("title, source, url, published_at")
        .eq("industry", industry)
        .gte("fetched_at", cutoff7d)
        .gte("published_at", publishedCutoff)
        .order("published_at", { ascending: false })
        .limit(40),
      supabase
        .from("articles")
        .select("title, source, url, published_at")
        .eq("industry", industry)
        .gte("scraped_at", cutoff7d)
        .gte("published_at", publishedCutoff)
        .order("published_at", { ascending: false })
        .limit(40),
    ]);
    rawNews = (newsRes7d.data ?? []) as NewsItem[];
    rawArticles = (articlesRes7d.data ?? []) as NewsItem[];
  }

  const news = filterRecentlyCovered(filterBriefingCandidates(dedupeByTitle(rawNews), industry), recentLinks).slice(0, 12);
  const articles = filterRecentlyCovered(filterBriefingCandidates(dedupeByTitle(rawArticles), industry), recentLinks).slice(0, 18);

  return { news, articles };
}

async function generateBriefing(
  industry: string,
  articles: NewsItem[],
  news: NewsItem[],
  apiKey: string,
  recentSummaries: string = "",
): Promise<{ mainNews: string; people: string; takeaway: string; sourceLinks: SourceLink[] } | null> {
  if (articles.length === 0 && news.length === 0) return null;

  const industryName = INDUSTRY_NAMES[industry] || industry;
  const context = INDUSTRY_CONTEXT[industry] || industry;

  const articleList = articles.map((a, i) => `[A${i}] "${a.title}" (${a.source}) - ${a.url}`).join("\n");
  const newsList = news.map((n, i) => `[N${i}] "${n.title}" (${n.source})`).join("\n");

  const recentBlock = recentSummaries
    ? `\nRECENT BRIEFINGS (last ${RECENT_BRIEFING_LOOKBACK_DAYS} days) - you MUST NOT repeat any of these stories, companies, statistics, or framings. Find genuinely NEW angles:\n"""\n${recentSummaries}\n"""\n`
    : "";

  const prompt = `You are a sharp, professional UK newsletter editor writing the morning briefing for the ${industryName} industry.

Industry context: ${context}
${recentBlock}
You have TWO pools of content (covering the last 48 hours primarily). Only use older items if the pool is very thin. Do NOT recycle any story that appeared in the recent briefings above - find a genuinely new angle or a different story entirely.

BREAKING NEWS (do not repeat verbatim, but use for context):
${newsList || "None today."}

ARTICLES (your primary source):
${articleList || "None today."}

EDITORIAL RULES:
- Stay strictly within ${industryName}. Ignore any item from the pools that is clearly about a different industry.
- HARD RULE: if your draft lead sentence names the same company + same fact that ANY of the recent briefings already covered, REWRITE the lead with a different story or a different angle on a different company. Repeating stories from the last 5 days is a failure.
- If today's pool genuinely echoes recent briefings, find a fresh detail, a new development, or a different company - do NOT recycle the same opening sentence or framing.
- Name specific companies, brands, places and numbers wherever the source supports it.

Write a concise editorial briefing with EXACTLY 3 sections. Use a professional, slightly witty British tone - like the FT or City AM morning briefing.

SECTION 1 - "Main News" (2-3 short paragraphs)
Synthesize the most important stories into a narrative. Connect the dots, explain why it matters.

SECTION 2 - "People" (1-2 short paragraphs)
STRICTLY genuine appointments, resignations, promotions, senior hires. If none, write "No major moves to report today."

SECTION 3 - "The Takeaway" (1 paragraph)
What does today's news mean for someone building a career in ${industryName}?

FORMAT RULES:
- Flowing prose, NOT bullet points
- Max 150 words per section
- Where you reference an article tag inline (use [A0]/[A1]... for ARTICLES and [N0]/[N1]... for BREAKING NEWS)
- Return as JSON: { "mainNews": "...", "people": "...", "takeaway": "...", "citedArticles": [0, 2, 3], "citedNews": [1, 4] }`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional newsletter editor. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      console.warn(`Briefing generation failed for ${industry}:`, response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const citedArticleIdx: number[] = parsed.citedArticles || [];
    const citedNewsIdx: number[] = parsed.citedNews || [];

    let mainNews = parsed.mainNews || "";
    let people = parsed.people || "";
    let takeaway = parsed.takeaway || "";

    // Strip ALL [A#] and [N#] inline markers from the body - the frontend
    // renders the link list separately so leaving raw tags in the prose
    // (e.g. "...as cost-of-living bites [N4]") looks broken.
    const stripTags = (s: string) =>
      s
        // Match any bracketed group consisting of A#/N# tokens, e.g. [A0], [N4], [N4, A6], [A1; N2]
        .replace(/\s*\[\s*(?:[AN]\d+)(?:\s*[,;]\s*[AN]\d+)*\s*\]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    mainNews = stripTags(mainNews);
    people = stripTags(people);
    takeaway = stripTags(takeaway);

    const sourceLinks: SourceLink[] = [
      ...citedArticleIdx
        .filter((i) => i >= 0 && i < articles.length)
        .map((i) => ({ title: articles[i].title, url: articles[i].url })),
      ...citedNewsIdx
        .filter((i) => i >= 0 && i < news.length)
        .map((i) => ({ title: news[i].title, url: news[i].url })),
    ];
    // Dedupe by URL
    const seen = new Set<string>();
    const dedupedSources = sourceLinks.filter((s) => {
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });

    return { mainNews, people, takeaway, sourceLinks: dedupedSources };
  } catch (err) {
    console.warn(`Briefing error for ${industry}:`, err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const apiKey = Deno.env.get("LOVABLE_API_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  let body: { industry?: string; industries?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const industries = body.industries
    ?? (body.industry ? [body.industry] : Object.keys(INDUSTRY_NAMES));

  const today = new Date().toISOString().slice(0, 10);
  const results: Record<string, string> = {};

  // Process in batches of 4 to stay within Deno Deploy CPU/timeout limits
  const BATCH_SIZE = 4;
  for (let i = 0; i < industries.length; i += BATCH_SIZE) {
    const batch = industries.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (industry) => {
        try {
          const recentContext = await fetchRecentBriefings(supabase, industry);
          const { news, articles } = await fetchContent(supabase, industry, recentContext.sourceLinks);
          // Anchor rule: at least ONE recent dated item must exist (RSS or
          // article). The hard "RSS-only" rule was starving industries whose
          // RSS pool had gone stale even though Perplexity-scraped articles
          // were fresh - which was the root cause of the daily-newsletter
          // failures. Articles already have validated `published_at`, so
          // they are a safe anchor on their own.
          if (news.length === 0 && articles.length === 0) {
            results[industry] = "skipped (no content)";
            return;
          }
          const briefing = await generateBriefing(industry, articles, news, apiKey, recentContext.summaries);
          if (!briefing) {
            results[industry] = "skipped (no content)";
            return;
          }

          const { error } = await supabase
            .from("daily_briefings")
            .upsert(
              {
                industry,
                briefing_date: today,
                main_news: briefing.mainNews,
                people: briefing.people,
                takeaway: briefing.takeaway,
                source_links: briefing.sourceLinks,
                generated_at: new Date().toISOString(),
              },
              { onConflict: "industry,briefing_date" },
            );

          if (error) {
            results[industry] = `error: ${error.message}`;
          } else {
            results[industry] = "ok";
          }
        } catch (err) {
          results[industry] = `error: ${(err as Error).message}`;
        }
      }),
    );
    // Small delay between batches to ease pressure on the AI gateway
    if (i + BATCH_SIZE < industries.length) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return new Response(
    JSON.stringify({ success: true, date: today, results }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
});
