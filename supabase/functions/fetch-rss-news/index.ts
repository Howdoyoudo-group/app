const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const INDUSTRY_CONTEXT: Record<string, string> = {
  cinema: "film, cinema, streaming, TV production, box office, studios, entertainment industry business",
  fashion: "fashion brands, clothing retail, luxury fashion, sustainable fashion, fashion business",
  beer: "beer industry, craft beer, breweries, pub industry, brewing, beer brands",
  coffee: "coffee shops, coffee chains, specialty coffee, barista, coffee roasting, cafe industry",
  music: "music industry, record labels, live music, music festivals, streaming, music business",
  
  "food-drink": "restaurants, pubs, bars, hotels, hospitality, catering, food service, food brands launching in supermarkets (Waitrose, Tesco, Sainsbury's, M&S, Aldi, Lidl), restaurant chain openings/closures (e.g. Franco Manca, Mango), food startups, FMCG brand news, retailer investment announcements",
  football: "football business, Premier League commercial, sports media rights, broadcasting rights, sports sponsorship. EXCLUDE match results, scores, lineups, player performance, transfer rumours",
  teaching: "education policy, schools, teaching, EdTech, universities, teacher training",
  "interior-design": "interior design, architecture, home interiors, furnishings, design trends",
  charity: "charity sector, nonprofits, social enterprise, fundraising, grants, voluntary sector",
  "estate-agency": "property market, estate agents, lettings, proptech, housing market, big-name agency expansion, mergers, leadership changes, regulation",
  grocery: "supermarkets, grocery retail (Tesco, Sainsbury's, Asda, Waitrose, M&S, Aldi, Lidl, Co-op, Morrisons), retailer capex/store investment, food supply chain, online grocery, FMCG brand launches and listings",
  bakery: "bakery industry, artisan bread, bakery chains, patisserie, baking business",
  hospitality: "hospitality industry, restaurants, hotels, pubs, bars, catering, events",
  footwear: "footwear industry, shoe brands, sneakers, Nike, Adidas, JD Sports",
  physiotherapy: "physiotherapy, physical therapy, NHS physio, sports rehab",
  psychotherapy: "psychotherapy, counselling, mental health services, CBT, therapy",
  wellness: "fitness, gyms, health wellness, activewear, spa, wellbeing",
  gaming: "video game industry, game studios, esports, game development",
  journalism: "journalism, media industry, newspapers, broadcasting, press",
  jewellery: "jewellery industry, luxury watches, diamonds, goldsmiths",
  pets: "pet industry, pet food, veterinary, pet retail, animal health",
  travel: "travel industry, tourism, airlines, hotels, travel agencies",
  cars: "automotive industry, car manufacturers, electric vehicles, car dealers",
  beauty: "beauty industry, cosmetics, skincare, beauty retail, makeup brands",
  health: "UK healthcare, NHS, hospitals, GPs, private healthcare providers, medtech, healthcare workforce, pharmaceuticals business",
  farming: "UK farming, agriculture, agritech, food supply chain, livestock, arable, DEFRA policy, farm subsidies, rural business",
  money: "UK banking, fintech, financial services, wealth management, retail banking, payments, financial regulation, FCA",
  "horse-racing": "UK horse racing, racecourses, Jockey Club, Arena Racing, BHA, bloodstock, breeding, racing broadcast (Racing TV, ITV Racing), betting industry",
  "formula-1": "Formula 1 business, F1 teams, motorsport industry, F1 sponsorship, Liberty Media, FIA regulations, F1 technology, Motorsport Valley UK",
  influencing: "creator economy, influencer marketing, social media business, brand partnerships, talent management, content creation industry",
  building: "UK construction industry, housebuilding, civil engineering, infrastructure, planning policy, architects, property developers, Balfour Beatty, Kier, Taylor Wimpey, Persimmon",
  fixing: "trades industry, electricians, plumbers, gas engineers, HVAC, building maintenance, heat pumps, boilers, apprenticeships, skills shortage in trades",
  delivery: "last-mile delivery, courier industry, logistics, Royal Mail, DPD, Evri, Amazon Logistics, e-commerce fulfilment, HGV drivers, parcel delivery",
};

const VALID_INDUSTRIES = Object.keys(INDUSTRY_CONTEXT);

const newsSchema = {
  type: "json_schema" as const,
  json_schema: {
    name: "news_response",
    schema: {
      type: "object",
      properties: {
        headlines: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "The exact headline as published" },
              source: { type: "string", description: "The publication name" },
              url: { type: "string", description: "The full URL" },
            },
            required: ["title", "source", "url"],
          },
        },
      },
      required: ["headlines"],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry } = await req.json();

    if (!industry || !VALID_INDUSTRIES.includes(industry)) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid industry: ${industry}` }),
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

    // Multiple angles to extract more diverse stories per industry
    const ANGLES = [
      `recent business news, company announcements, leadership moves, financial results, deals, mergers, and market trends`,
      `recent brand launches, product news, store openings, partnerships, and notable cultural moments`,
      `recent industry analysis, market reports, regulatory updates, and emerging trends`,
    ];

    const buildPrompt = (angle: string, broadMode: boolean) => broadMode
      ? `Find 8-10 recent news stories about the ${displayName} industry from anywhere in the world (last 6 months). Focus angle: ${angle}.

Industry context: ${context}

Return real, verifiable stories. For each, give the EXACT real headline as published, the source name, and the full URL.`
      : `Find 8-10 recent news stories about the ${displayName} industry. Prefer UK-relevant stories but include important international ones too. Focus angle: ${angle}.

Industry context: ${context}

Global brands (Nike, Starbucks, Netflix, etc.) always count. Avoid sports match results, celebrity gossip, and individual job listings.

Return real, verifiable stories. For each, give the EXACT real headline as published, the source name, and the full URL.`;

    async function callPerplexity(angle: string, broadMode: boolean) {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: 'You are a news editor. Find real, recent news stories and return their exact published headlines, source names, and URLs. Never fabricate.' },
            { role: 'user', content: buildPrompt(angle, broadMode) },
          ],
          temperature: 0.3,
          max_tokens: 3000,
          search_recency_filter: broadMode ? 'year' : 'month',
          response_format: newsSchema,
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error(`Perplexity API error ${response.status}:`, errText);
        return [] as { title: string; source: string; url: string }[];
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      try {
        const parsed: { headlines?: { title: string; source: string; url: string }[] } = JSON.parse(content);
        return (parsed.headlines || []).map(h => ({ ...h, source_kind: 'perplexity' as const, published_at: null as string | null }));
      } catch {
        console.error('Failed to parse Perplexity response:', content.slice(0, 300));
        return [] as { title: string; source: string; url: string; source_kind: 'perplexity'; published_at: string | null }[];
      }
    }

    // Per-industry Google News RSS queries (UK-focused). These broaden the pool with
    // mainstream British coverage that Perplexity sometimes misses.
    const GOOGLE_NEWS_QUERIES: Record<string, string[]> = {
      "food-drink": ["UK restaurant chain", "Waitrose new brand launch", "Mango restaurant closing", "Franco Manca", "food brand launch UK supermarket"],
      grocery: ["Tesco store investment", "Sainsbury's", "Waitrose", "M&S food", "Aldi UK", "Lidl UK", "Morrisons supermarket"],
      football: ["Premier League broadcasting rights", "football club commercial deal", "football sponsorship UK"],
      "estate-agency": ["UK estate agency", "Foxtons", "Savills", "Knight Frank", "lettings agent UK"],
      teaching: ["UK teaching jobs", "school recruitment England", "DfE teachers"],
      coffee: ["UK coffee chain", "Pret A Manger", "Costa Coffee UK", "Caffè Nero"],
      bakery: ["UK bakery chain", "Greggs", "Gail's bakery"],
      hospitality: ["UK hospitality industry", "UK hotels investment", "UK pubs"],
      cinema: ["UK cinema chain", "Vue Cinemas", "Odeon UK", "UK box office"],
      fashion: ["UK fashion retailer", "Marks Spencer fashion", "Next plc", "ASOS"],
      footwear: ["JD Sports", "UK sneaker market", "Schuh"],
      beer: ["UK brewery", "BrewDog", "UK pub group"],
      music: ["UK music industry", "live music UK", "UK record label"],
      beauty: ["UK beauty industry", "Boots beauty", "Space NK"],
      jewellery: ["UK jewellery retail", "Goldsmiths jeweller", "Pandora UK"],
      pets: ["UK pet retail", "Pets at Home", "UK veterinary group"],
      travel: ["UK travel industry", "easyJet", "British Airways", "Jet2"],
      cars: ["UK car market", "UK car dealership", "EV sales UK"],
      wellness: ["UK gym chain", "PureGym", "David Lloyd Clubs"],
      gaming: ["UK games studio", "UK video game industry"],
      journalism: ["UK newspaper", "BBC News", "UK journalism"],
      charity: ["UK charity sector", "UK fundraising", "UK nonprofit"],
      physiotherapy: ["UK physiotherapy", "NHS physio"],
      psychotherapy: ["UK counselling sector", "UK mental health services"],
      "interior-design": ["UK interior design", "UK furniture retail"],
      "formula-1": ["Formula 1 business", "F1 team investment", "McLaren Racing", "Red Bull Racing", "Motorsport Valley UK"],
      influencing: ["UK influencer marketing", "creator economy UK", "social media talent agency"],
    };

    // Resolve Google News' interstitial RSS URL to the publisher URL by following
    // the redirect chain. Google's news.google.com/rss/articles/CBM... links open
    // a generic Google interstitial in many email clients (especially mobile),
    // so we always need the underlying publisher URL.
    async function resolveGoogleNewsUrl(googleUrl: string): Promise<string> {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(googleUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
          signal: ctrl.signal,
        }).finally(() => clearTimeout(timer));
        const finalUrl = res.url;
        if (finalUrl && !/news\.google\.com/.test(finalUrl)) return finalUrl;
        // Some Google interstitial pages contain the real URL inside a meta refresh
        // or a data attribute. Sniff the HTML for the first http(s) URL pointing
        // outside Google.
        const html = await res.text();
        const m = html.match(/https?:\/\/(?!(?:[a-z0-9-]+\.)*google\.com)[^"'<>\s]+/i);
        if (m) return m[0];
        return googleUrl;
      } catch {
        return googleUrl;
      }
    }

    // Maximum age (days) for any breaking-news item, regardless of source.
    // Anything older than this is treated as stale and dropped before insert.
    const MAX_AGE_DAYS = 21;

    function parsePubDate(raw: string | undefined | null): string | null {
      if (!raw) return null;
      const t = Date.parse(raw);
      if (!Number.isFinite(t)) return null;
      return new Date(t).toISOString();
    }

    // Pull a date from publisher URL slugs like /2024/feb/06/ or /2024/02/06/.
    function extractUrlDate(url: string): Date | null {
      const MONTHS: Record<string, number> = {
        jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
      };
      const m1 = url.match(/\/(20\d{2})\/([a-z]{3})(?:\/(\d{1,2}))?\//i);
      if (m1) {
        const y = Number(m1[1]);
        const mo = MONTHS[m1[2].toLowerCase()];
        const d = Number(m1[3] || '1');
        if (mo) {
          const dt = new Date(Date.UTC(y, mo - 1, d));
          if (Number.isFinite(dt.getTime())) return dt;
        }
      }
      const m2 = url.match(/\/(20\d{2})\/(\d{1,2})(?:\/(\d{1,2}))?\//);
      if (m2) {
        const dt = new Date(Date.UTC(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3] || '1')));
        if (Number.isFinite(dt.getTime())) return dt;
      }
      return null;
    }

    function urlLooksStale(url: string, maxAgeDays = MAX_AGE_DAYS): boolean {
      const urlDate = extractUrlDate(url);
      if (!urlDate) return false;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - maxAgeDays);
      return urlDate < cutoff;
    }

    // Hosts that ALWAYS produce off-industry noise. Some are industry-specific
    // (American football leaks into the `football` pool from these publishers).
    const HOST_BLOCKLIST_GLOBAL = new Set<string>(['offthepitch.com']);
    const HOST_BLOCKLIST_BY_INDUSTRY: Record<string, Set<string>> = {
      football: new Set([
        'nflpa.com', 'wnfcfootball.com', 'nfl.com',
        'espn.com', 'espn.co.uk', 'cbssports.com', 'nbcsports.com',
        'pro-football-reference.com', 'profootballtalk.nbcsports.com',
      ]),
    };
    // Title patterns to drop per industry (case-insensitive). For `football`
    // this kills the American-football noise that recurringly bleeds through.
    const TITLE_BLOCKLIST_BY_INDUSTRY: Record<string, RegExp> = {
      football: /\b(NFL|NFLPA|WNFC|Super Bowl|NCAA|college football|AFC|NFC|Aaron Rodgers|Patrick Mahomes|quarterback|touchdown|gridiron|American football)\b/i,
    };

    function blockedPublisherUrl(url: string): boolean {
      try {
        const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
        if (HOST_BLOCKLIST_GLOBAL.has(host)) return true;
        const perIndustry = HOST_BLOCKLIST_BY_INDUSTRY[industry];
        if (perIndustry && perIndustry.has(host)) return true;
      } catch {
        return true;
      }
      return urlLooksStale(url);
    }

    function blockedTitle(title: string): boolean {
      const re = TITLE_BLOCKLIST_BY_INDUSTRY[industry];
      return !!re && re.test(title);
    }


    async function fetchGoogleNews(query: string) {
      // Widen to a 7-day window so quiet news days (weekends, bank holidays)
      // don't collapse the feed to a single headline. We still drop anything
      // older than MAX_AGE_DAYS at the verification step.
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' when:7d')}&hl=en-GB&gl=GB&ceid=GB:en`;
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)' } });
        if (!res.ok) return [] as { title: string; source: string; url: string; published_at: string | null }[];
        const xml = await res.text();
        const items: { title: string; source: string; url: string; published_at: string | null; source_kind: 'google' }[] = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
          const block = match[1];
          const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
          const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
          const sourceMatch = block.match(/<source[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/source>/);
          const pubMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
          if (titleMatch && linkMatch) {
            const rawTitle = titleMatch[1].trim();
            // Google News titles end with " - Source"; strip if present
            const cleanTitle = rawTitle.replace(/\s+-\s+[^-]+$/, '').trim();
            items.push({
              title: cleanTitle,
              source: sourceMatch ? sourceMatch[1].trim() : 'Google News',
              url: linkMatch[1].trim(),
              published_at: parsePubDate(pubMatch?.[1]),
              source_kind: 'google',
            });
          }
        }
        // Resolve Google's interstitial URLs to publisher URLs in parallel.
        const resolved = await Promise.all(
          items.map(async (it) => ({ ...it, url: await resolveGoogleNewsUrl(it.url) }))
        );
        return resolved;
      } catch (err) {
        console.warn(`Google News fetch failed for "${query}":`, err);
        return [];
      }
    }

    console.log(`Searching Perplexity + Google News for ${industry}...`);
    const queries = GOOGLE_NEWS_QUERIES[industry] || [displayName];
    const [angleResults, googleResults] = await Promise.all([
      Promise.all(ANGLES.map(a => callPerplexity(a, false))),
      Promise.all(queries.slice(0, 8).map(q => fetchGoogleNews(q))),
    ]);
    let headlines = [...angleResults.flat(), ...googleResults.flat()];

    if (headlines.length === 0) {
      console.log(`UK-focused returned 0 for ${industry} - retrying global broad search...`);
      const broadResults = await Promise.all(ANGLES.map(a => callPerplexity(a, true)));
      headlines = broadResults.flat();
    }

    // Drop obvious non-UK noise (Google News leaks foreign cities for "UK restaurants" etc.)
    const NON_UK_NOISE = /\b(toronto|new york|nyc|los angeles|long island|texas|california|shreveport|bossier|ontario|quebec|sydney|melbourne|mumbai|delhi|bangalore|singapore|dubai|riyadh|johannesburg|nairobi|hong kong|shanghai)\b/i;

    // Dedupe and prepare
    const seenUrls = new Set<string>();
    const seenStoryFp = new Set<string>();
    const STOPWORDS = new Set([
      'the','a','an','of','in','on','for','to','and','or','with','at','by','from',
      'is','are','was','were','be','been','as','it','its','this','that','amid',
      'after','over','up','down','new','uk','us','plc',
    ]);
    const storyFingerprint = (title: string) => title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t && !STOPWORDS.has(t))
      .slice(0, 4)
      .join(' ');
    const nowIso = new Date().toISOString();
    const validNews = headlines
      .filter(h => {
        if (!h.title || !h.url || h.title.length < 5) return false;
        if (blockedPublisherUrl(h.url)) return false;
        if (blockedTitle(h.title)) return false;
        if (seenUrls.has(h.url)) return false;
        if (NON_UK_NOISE.test(h.title)) return false;
        const fp = storyFingerprint(h.title);
        if (fp && seenStoryFp.has(fp)) return false;
        seenUrls.add(h.url);
        if (fp) seenStoryFp.add(fp);
        return true;
      })
      .map(h => {
        const rssDate = (h as { published_at?: string | null }).published_at || null;
        const urlDate = extractUrlDate(h.url);
        const sourceKind = (h as { source_kind?: 'perplexity' | 'google' }).source_kind || 'perplexity';
        return {
          industry,
          title: h.title.slice(0, 300),
          source: (() => {
            try { return new URL(h.url).hostname.replace('www.', ''); } catch { return h.source || 'unknown'; }
          })(),
          url: h.url,
          published_at: rssDate || (urlDate ? urlDate.toISOString() : null),
          fetched_at: nowIso,
          source_kind: sourceKind,
        };
      });

    console.log(`Perplexity returned ${validNews.length} structured headlines for ${industry}`);

    // Final URL validation: drop generic section pages and dead links (404/410).
    // Perplexity occasionally hallucinates plausible-looking publisher URLs, so we
    // verify each link with a HEAD request before persisting.
    function looksLikeArticleUrl(rawUrl: string): boolean {
      try {
        const u = new URL(rawUrl);
        const path = u.pathname.replace(/\/+$/, '');
        if (!path) return false;
        const segments = path.split('/').filter(Boolean);
        if (segments.length < 2) return false;
        const last = segments[segments.length - 1].toLowerCase();
        // Article slugs typically have a hyphen or a digit. Section pages like
        // "/news/fashion" don't.
        if (!/[-]/.test(last) && !/\d/.test(last)) return false;
        if (/^(news|fashion|business|home|index|category|tag|topics?)$/.test(last)) return false;
        // Reject obvious hallucinations: pure numeric slugs like /12345678 or
        // /article123 placeholders Perplexity sometimes invents.
        if (/^\d{4,}$/.test(last)) return false;
        if (/^(article|story|post|item)\d+$/i.test(last)) return false;
        return true;
      } catch {
        return false;
      }
    }

    async function fetchWithTimeout(url: string, init: RequestInit, ms: number) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ms);
      try {
        return await fetch(url, { ...init, signal: ctrl.signal });
      } finally {
        clearTimeout(timer);
      }
    }

    /**
     * Validate a candidate article URL. We do two things:
     *   1. Confirm the page exists (no 404/410, and not an obvious error page)
     *   2. Confirm the publisher didn't redirect us to a homepage / section
     *      (i.e. the link doesn't take you to a *different* story)
     */
    async function urlReachable(rawUrl: string): Promise<{ ok: boolean; dead: boolean; status: number; metaDate: string | null }> {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Range': 'bytes=0-16384',
      };
      let res: Response;
      try {
        res = await fetchWithTimeout(rawUrl, { method: 'GET', redirect: 'follow', headers }, 7000);
      } catch {
        return { ok: false, dead: false, status: 0, metaDate: null };
      }
      if (res.status === 404 || res.status === 410) {
        return { ok: false, dead: true, status: res.status, metaDate: null };
      }
      // 5xx, 403, redirects to consent/section pages → "unverified" (not dead).
      // Perplexity items get dropped at the strict-check step; Google News
      // items pass through because their URLs come from real publishers.
      try {
        const original = new URL(rawUrl);
        const finalUrl = new URL(res.url);
        const origHost = original.hostname.replace(/^www\./, '');
        const finalHost = finalUrl.hostname.replace(/^www\./, '');
        // Tolerate consent / cdn / amp subdomain redirects (e.g. consent.theguardian.com,
        // amp.theguardian.com) — only flag as dead when the redirect lands on a
        // completely unrelated host AND truncates the article path.
        const sharedRoot = origHost.split('.').slice(-2).join('.');
        const finalShared = finalHost.split('.').slice(-2).join('.');
        const hostMismatch = sharedRoot !== finalShared
          && !finalHost.endsWith(origHost) && !origHost.endsWith(finalHost);
        const origSegs = original.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
        const finalSegs = finalUrl.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
        if (hostMismatch && origSegs.length >= 2 && finalSegs.length < 2) {
          return { ok: false, dead: true, status: res.status, metaDate: null };
        }
      } catch { /* ignore */ }

      let metaDate: string | null = null;
      try {
        const body = await res.text();
        const patterns = [
          /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
          /<meta[^>]+name=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
          /<meta[^>]+property=["']og:published_time["'][^>]+content=["']([^"']+)["']/i,
          /<meta[^>]+name=["']pubdate["'][^>]+content=["']([^"']+)["']/i,
          /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i,
          /<meta[^>]+itemprop=["']datePublished["'][^>]+content=["']([^"']+)["']/i,
          /<time[^>]+datetime=["']([^"']+)["']/i,
        ];
        for (const re of patterns) {
          const m = body.match(re);
          if (m) {
            const iso = parsePubDate(m[1]);
            if (iso) { metaDate = iso; break; }
          }
        }
      } catch { /* ignore */ }
      return { ok: res.status >= 200 && res.status < 300, dead: false, status: res.status, metaDate };
    }

    const shapeFiltered = validNews.filter(n => looksLikeArticleUrl(n.url));
    // Reachability check is expensive (HTTP GET per URL). Skip it for Google
    // News items that already have a real RSS pubDate — Google News only
    // indexes real publisher articles, so URL + date are trustworthy. Only
    // run reachability for Perplexity items (which can hallucinate URLs) and
    // for Google items with no pubDate.
    const needsReach = shapeFiltered.map(n =>
      n.source_kind === 'perplexity' || !n.published_at
    );
    const reachabilityResults = await Promise.all(shapeFiltered.map((n, i) =>
      needsReach[i] ? urlReachable(n.url) : Promise.resolve({ ok: true, dead: false, status: 200, metaDate: null })
    ));
    const cutoffMs = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    let staleCount = 0;
    let deadCount = 0;
    let unverifiedPerplexity = 0;
    let undatedAccepted = 0;
    const verifiedNews = shapeFiltered
      .map((n, i) => {
        const r = reachabilityResults[i];
        if (r.dead) { deadCount++; return null; }
        // STRICT for Perplexity: must return a real 2xx response. Any 403, timeout,
        // network error, or redirect oddity = drop. Perplexity frequently invents
        // plausible URLs on paywalled sites (FT, Times, Telegraph) that return 403.
        if (n.source_kind === 'perplexity' && !r.ok) {
          unverifiedPerplexity++;
          return null;
        }
        // Lenient for Google News RSS items (real URLs, just publisher may block bots).
        if (!r.ok) {
          if (urlLooksStale(n.url)) { staleCount++; return null; }
        }
        const resolved = n.published_at || r.metaDate || n.fetched_at;
        const ts = Date.parse(resolved);
        if (!Number.isFinite(ts)) return null;
        if (ts < cutoffMs) { staleCount++; return null; }
        if (!n.published_at && !r.metaDate) undatedAccepted++;
        const { source_kind: _sk, ...rest } = n;
        return { ...rest, published_at: new Date(ts).toISOString() };
      })
      .filter((n): n is NonNullable<typeof n> => n !== null);

    const droppedCount = validNews.length - verifiedNews.length;
    if (droppedCount > 0 || undatedAccepted > 0) {
      console.log(`${industry}: kept ${verifiedNews.length}, dropped ${droppedCount} (dead=${deadCount}, unverified-perplexity=${unverifiedPerplexity}, stale>${MAX_AGE_DAYS}d=${staleCount}), accepted-undated=${undatedAccepted}`);
    }

    if (verifiedNews.length > 0) {
      const upsertRes = await fetch(`${supabaseUrl}/rest/v1/breaking_news?on_conflict=url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(verifiedNews),
      });

      if (!upsertRes.ok) {
        const err = await upsertRes.text();
        console.error('Upsert error:', err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, headlines_found: verifiedNews.length, dropped: droppedCount }),
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
