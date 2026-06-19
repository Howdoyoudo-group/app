const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDUSTRY_CONTEXT: Record<string, string> = {
  cinema: "film, cinema, streaming, TV production, box office, studios, screenwriting, filmmaking, entertainment industry business",
  fashion: "fashion brands, clothing retail, luxury fashion, sustainable fashion, fashion design, fashion business",
  beer: "beer industry, craft beer, breweries, pub industry, brewing, taproom, beer brands",
  coffee: "coffee shops, coffee chains, specialty coffee, barista, coffee roasting, cafe industry",
  music: "music industry, record labels, live music, music festivals, streaming, music business",
  grocery: "supermarkets, grocery retail, food supply chain, online grocery, food retail",
  "food-drink": "restaurants, pubs, bars, hotels, hospitality, catering, food service, dining",
  football: "football business, Premier League commercial, sports media rights, football club revenue, broadcasting rights, sports sponsorship",
  teaching: "education policy, schools, teaching, EdTech, universities, SEND, teacher training",
  "interior-design": "interior design, architecture, home interiors, furnishings, design trends",
  charity: "charity sector, nonprofits, social enterprise, fundraising, grants, voluntary sector",
  "estate-agency": "property market, estate agents, lettings, proptech, housing market, rental",
  bakery: "bakery industry, artisan bread, bakery chains, patisserie, baking business",
  hospitality: "hospitality industry, restaurants, hotels, pubs, bars, catering, events",
  footwear: "footwear industry, shoe brands, sneakers, Nike, Adidas, JD Sports, footwear retail",
  physiotherapy: "physiotherapy, physical therapy, NHS physio, sports rehab, musculoskeletal health",
  psychotherapy: "psychotherapy, counselling, mental health services, CBT, therapy, psychology",
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
  building: "UK construction industry, housebuilding, civil engineering, infrastructure, planning, architects, developers, planning policy, NHBC",
  fixing: "trades industry, electricians, plumbers, gas engineers, HVAC, building maintenance, heat pumps, boilers, skills shortage, apprenticeships",
  delivery: "last-mile delivery, courier industry, logistics, Royal Mail, DPD, Evri, Amazon Logistics, e-commerce fulfilment, HGV drivers",
};

const VALID_INDUSTRIES = Object.keys(INDUSTRY_CONTEXT);

const articlesSchema = {
  type: "json_schema" as const,
  json_schema: {
    name: "articles_response",
    schema: {
      type: "object",
      properties: {
        articles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "The exact headline/title of the article" },
              source: { type: "string", description: "The publication or website name" },
              url: { type: "string", description: "The full URL of the article" },
              description: { type: "string", description: "A one-sentence summary of the article" },
              published_date: { type: "string", description: "ISO publish date YYYY-MM-DD. REQUIRED. If unknown, OMIT the article entirely - do NOT guess." },
            },
            required: ["title", "source", "url", "description", "published_date"],
          },
        },
      },
      required: ["articles"],
    },
  },
};

const MAX_ARTICLE_AGE_DAYS = 45;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry } = await req.json();

    if (!industry || !VALID_INDUSTRIES.includes(industry)) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid industry: ${industry}. Valid: ${VALID_INDUSTRIES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Perplexity API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('HDYD_SERVICE_JWT') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const context = INDUSTRY_CONTEXT[industry];
    const displayName = industry.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const buildPrompt = (broadMode: boolean) => broadMode
      ? `Find 10-12 recent feature articles about the ${displayName} industry from anywhere in the world (last 12 months). Mix opinion columns, business analysis, founder/company profiles, and market reports.

Industry context: ${context}

Return real, verifiable articles. For each, give the EXACT real headline as published, the source name, the full URL, a one-sentence summary, AND the article's actual publish date in YYYY-MM-DD form. If you do not know the real publish date, OMIT that article - do not guess.`
      : `Find 10-12 recent feature articles about the ${displayName} industry, published in the last 30 days. Prefer UK-focused but international is welcome. Mix opinion columns, business analysis, founder/company profiles, and market reports.

Industry context: ${context}

Avoid pure breaking-news wire copy, consumer "best of" lists, job listings, and recipes.

Return real, verifiable articles. For each, give the EXACT real headline as published, the source name, the full URL, a one-sentence summary, AND the article's actual publish date in YYYY-MM-DD form. If you do not know the real publish date, OMIT that article - do not guess. Do NOT include articles older than 30 days.`;

    async function callPerplexity(broadMode: boolean) {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar', // cheaper than sonar-pro; ~5x cost saving
          messages: [
            { role: 'system', content: 'You are a features editor. Find real, substantive articles and return their exact titles, source names, URLs, and one-sentence summaries. Never fabricate.' },
            { role: 'user', content: buildPrompt(broadMode) },
          ],
          temperature: 0.3,
          max_tokens: 3000,
          search_recency_filter: broadMode ? 'year' : 'month',
          response_format: articlesSchema,
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error(`Perplexity API error ${response.status}:`, errText);
        return [] as { title: string; source: string; url: string; description?: string; published_date?: string }[];
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      try {
        const parsed: { articles?: { title: string; source: string; url: string; description?: string; published_date?: string }[] } = JSON.parse(content);
        return parsed.articles || [];
      } catch {
        console.error('Failed to parse Perplexity response:', content.slice(0, 300));
        return [];
      }
    }

    console.log(`Searching Perplexity (sonar, 1 call, UK-focused) for ${industry}...`);
    let articles = await callPerplexity(false);

    if (articles.length === 0) {
      console.log(`UK-focused returned 0 for ${industry} - retrying global broad search...`);
      articles = await callPerplexity(true);
    }

    // Dedupe, date-filter, and prepare for upsert.
    // We REQUIRE a real published_date and reject anything older than
    // MAX_ARTICLE_AGE_DAYS - Perplexity sometimes "remembers" a real story
    // from years ago and invents a fresh-looking URL for it (the Akeroyd /
    // Burberry hallucination). A hard date floor stops that at the door.
    const seenUrls = new Set<string>();
    const ageCutoffMs = Date.now() - MAX_ARTICLE_AGE_DAYS * 24 * 60 * 60 * 1000;
    let droppedNoDate = 0;
    let droppedStale = 0;
    const validArticles = articles
      .filter(a => {
        if (!a.title || !a.url || a.title.length < 10) return false;
        if (seenUrls.has(a.url)) return false;
        const urlLower = a.url.toLowerCase();
        const blockedPatterns = ['/jobs/', '/careers/', '/vacancies/', '/apply/', '/recruitment/'];
        if (blockedPatterns.some(p => urlLower.includes(p))) return false;
        // Hostname blocklist - paywalled / aggregator / search-result URLs that
        // open a listing of the headline instead of the actual article.
        const blockedHosts = [
          'offthepitch.com',
          'news.google.com', 'google.com', 'google.co.uk',
          'news.yahoo.com', 'yahoo.com',
          'msn.com',
          'bing.com',
          'apple.news',
          'flipboard.com',
          'news.knowledia.com',
          'smartnews.com',
          'duckduckgo.com',
          'feedly.com',
          't.co', 'lnkd.in', 'bit.ly', 'tinyurl.com',
        ];
        try {
          const u = new URL(a.url);
          const h = u.hostname.replace(/^www\./, '').toLowerCase();
          if (blockedHosts.some(b => h === b || h.endsWith('.' + b))) return false;
          // Reject obvious search/aggregator paths even on allowed hosts.
          const path = u.pathname.toLowerCase();
          if (/^\/(search|results|topic|topics|tag|tags|category|categories|section|sections)(\/|$)/.test(path)) return false;
          if (/\/search\?|[?&]q=|[?&]query=/.test(a.url)) return false;
        } catch { return false; }
        // Obvious placeholder slugs Perplexity invents (xyz123, c1234567890, abc123def456, etc.)
        if (/\b(xyz123|abc123|c1234567890|def456|author\/2026|sites\/author\/)\b/i.test(a.url)) return false;
        if (/\/c[0-9a-f]{6,}\/(2025|2026|2027)\//i.test(a.url) && /[a-z]{3}\d{3,}/.test(a.url)) return false;
        const pd = (a as any).published_date;
        if (!pd || typeof pd !== 'string') { droppedNoDate++; return false; }
        const t = Date.parse(pd);
        if (!Number.isFinite(t)) { droppedNoDate++; return false; }
        if (t < ageCutoffMs) { droppedStale++; return false; }
        if (t > Date.now() + 24 * 60 * 60 * 1000) { droppedNoDate++; return false; } // future-dated = junk
        seenUrls.add(a.url);
        return true;
      })
      .map(a => ({
        industry,
        title: a.title.slice(0, 300),
        source: (() => {
          try { return new URL(a.url).hostname.replace('www.', ''); } catch { return a.source || 'unknown'; }
        })(),
        url: a.url,
        description: a.description?.slice(0, 500) || null,
        published_at: new Date((a as any).published_date).toISOString(),
        scraped_at: new Date().toISOString(),
      }));

    if (droppedNoDate || droppedStale) {
      console.warn(`[${industry}] dropped ${droppedNoDate} undated and ${droppedStale} stale (>${MAX_ARTICLE_AGE_DAYS}d) articles`);
    }

    console.log(`Perplexity returned ${validArticles.length} candidate articles for ${industry}; verifying URLs...`);

    // URL liveness check - Perplexity occasionally hallucinates plausible-looking URLs that 404.
    // We HEAD each URL (fall back to GET) and drop anything that doesn't resolve to a 2xx/3xx with a real destination.
    async function urlIsLive(url: string): Promise<boolean> {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        let res: Response;
        try {
          res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
          // Some sites reject HEAD - fall back to GET
          if (res.status === 405 || res.status === 403) {
            res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
          }
        } finally {
          clearTimeout(timer);
        }
        return res.ok; // 200-299 only after following redirects
      } catch {
        return false;
      }
    }

    const liveChecks = await Promise.all(validArticles.map(a => urlIsLive(a.url)));
    const liveArticles = validArticles.filter((_, i) => liveChecks[i]);
    const dropped = validArticles.length - liveArticles.length;
    if (dropped > 0) console.warn(`Dropped ${dropped} dead/hallucinated URLs for ${industry}`);

    if (liveArticles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, articles_found: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/articles?on_conflict=url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(liveArticles),
    });

    if (!upsertRes.ok) {
      const err = await upsertRes.text();
      console.error('Upsert error:', err);
    }

    return new Response(
      JSON.stringify({ success: true, articles_found: liveArticles.length, dropped_dead_urls: dropped }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
