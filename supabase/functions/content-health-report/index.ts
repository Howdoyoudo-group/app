const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDUSTRIES = [
  'bakery','beer','beauty','cars','charity','cinema','coffee','estate-agency',
  'farming','fashion','food-drink','football','footwear','gaming','grocery',
  'health','horse-racing','hospitality','interior-design','jewellery','journalism',
  'money','music','pets','physiotherapy','psychotherapy','teaching','travel','wellness',
];

const INDUSTRY_CONTEXT: Record<string, string> = {
  cinema: "film, cinema, streaming, TV production, box office, studios, entertainment industry business",
  fashion: "fashion brands, clothing retail, luxury fashion, sustainable fashion, beauty industry",
  beer: "beer industry, craft beer, breweries, pub industry, brewing, taproom, beer brands",
  coffee: "coffee shops, coffee chains, specialty coffee, barista, coffee roasting, cafe industry",
  music: "music industry, record labels, live music, festivals, streaming, music business",
  grocery: "supermarkets, grocery retail, food supply chain, Tesco, Sainsburys, online grocery",
  "food-drink": "restaurants, pubs, bars, hotels, hospitality, catering, food service, dining",
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
  gaming: "video game industry, game studios, esports, game development",
  journalism: "journalism, media industry, newspapers, broadcasting, press",
  jewellery: "jewellery industry, luxury watches, diamonds, goldsmiths",
  pets: "pet industry, pet food, veterinary, pet retail, animal health",
  travel: "travel industry, tourism, airlines, hotels, travel agencies",
  cars: "automotive industry, car manufacturers, electric vehicles, car dealers",
  beauty: "beauty industry, cosmetics, skincare, beauty retail, makeup brands",
};

function formatIndustryName(industry: string): string {
  const names: Record<string, string> = {
    cinema: "Film and TV", fashion: "Fashion", coffee: "Coffee", music: "Music",
    grocery: "Grocery", "food-drink": "Food & Drink", football: "Football",
    teaching: "Teaching", "interior-design": "Interior Design", charity: "Charity",
    "estate-agency": "Estate Agency", bakery: "Bakery", hospitality: "Hospitality",
    footwear: "Footwear", physiotherapy: "Physiotherapy", psychotherapy: "Psychotherapy",
    wellness: "Wellness", beer: "Beer", gaming: "Gaming", journalism: "Journalism",
    jewellery: "Jewellery", pets: "Pets", travel: "Travel", cars: "Cars", beauty: "Beauty",
  };
  return names[industry] || industry;
}

interface IndustryRow {
  industry: string;
  raw_news: number;
  filtered_news: number;
  news_sources: number;
  raw_articles: number;
  filtered_articles: number;
  article_sources: number;
  jobs: number;
  job_companies: number;
}

function statusEmoji(count: number, threshold = 3): string {
  if (count === 0) return '❌';
  if (count < threshold) return '⚠️';
  return '✅';
}

/**
 * AI filter: given titles+sources, return indices of relevant ones.
 */
async function aiFilterForIndustry(
  items: { title: string; source: string; type: string }[],
  industry: string,
  apiKey: string
): Promise<Set<number>> {
  if (!items.length) return new Set();

  const context = INDUSTRY_CONTEXT[industry] || industry;
  const numberedList = items.map((h, i) => `${i}. [${h.type}] [${h.source}] ${h.title}`).join('\n');

  const prompt = `You are a newsletter editor for a career-focused daily digest about the "${formatIndustryName(industry)}" industry.

Industry context: ${context}

Below is a list of news headlines and articles. Rate each: is it RELEVANT for someone interested in careers and business in this industry?

KEEP items about:
- Industry business news, company updates, market trends
- Policy or regulatory changes
- Major appointments, layoffs, restructuring
- New launches, expansions, or closures

REJECT items about:
- Consumer reviews, product recommendations, "best of" lists
- Celebrity gossip, personal drama
- General news with no industry connection
- Sports match results or scores
- Recipes, cooking tips, restaurant reviews (unless about business)

Items:
${numberedList}

Return ONLY a JSON array of the index numbers of items to KEEP, e.g. [0, 2, 5]. If none are relevant, return [].`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: 'You are a precise news relevance filter. Return only a JSON array of index numbers.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.warn(`AI filter failed for ${industry}:`, response.status);
      return new Set(items.map((_, i) => i));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\d,\s]*\]/);
    if (jsonMatch) {
      const indices: number[] = JSON.parse(jsonMatch[0]);
      return new Set(indices);
    }
    return new Set(items.map((_, i) => i));
  } catch (err) {
    console.warn(`AI filter error for ${industry}:`, err);
    return new Set(items.map((_, i) => i));
  }
}

function buildHtmlReport(rows: IndustryRow[], dateStr: string): string {
  const tableRows = rows.map(r => `
    <tr>
      <td style="padding:6px 12px;border:1px solid #ddd;font-weight:bold">${r.industry}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:center">${statusEmoji(r.filtered_news)} ${r.filtered_news}/${r.raw_news}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:center">${r.news_sources}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:center">${statusEmoji(r.filtered_articles)} ${r.filtered_articles}/${r.raw_articles}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:center">${r.article_sources}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:center">${statusEmoji(r.jobs, 1)} ${r.jobs}</td>
      <td style="padding:6px 12px;border:1px solid #ddd;text-align:center">${r.job_companies}</td>
    </tr>`).join('');

  const totalRawNews = rows.reduce((s, r) => s + r.raw_news, 0);
  const totalFilteredNews = rows.reduce((s, r) => s + r.filtered_news, 0);
  const totalRawArticles = rows.reduce((s, r) => s + r.raw_articles, 0);
  const totalFilteredArticles = rows.reduce((s, r) => s + r.filtered_articles, 0);
  const totalJobs = rows.reduce((s, r) => s + r.jobs, 0);
  const zeroFilteredNews = rows.filter(r => r.filtered_news === 0).length;
  const zeroFilteredArticles = rows.filter(r => r.filtered_articles === 0).length;
  const zeroJobs = rows.filter(r => r.jobs === 0).length;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;background:#fff;padding:20px">
    <h1 style="font-family:'Arial Black',Impact,sans-serif;color:#000;font-size:24px">📊 Daily Content Health Report</h1>
    <p style="color:#555;font-size:14px">${dateStr} - Shows <strong>delivered/raw</strong> counts (AI-filtered vs total in DB)</p>
    
    <div style="display:flex;gap:16px;margin:16px 0;flex-wrap:wrap">
      <div style="background:#f0f9ff;padding:12px 20px;border-radius:8px;min-width:140px">
        <div style="font-size:24px;font-weight:bold;color:#000">${totalFilteredNews} <span style="font-size:14px;color:#888">/ ${totalRawNews}</span></div>
        <div style="font-size:12px;color:#555">Breaking News (delivered/raw)</div>
        <div style="font-size:11px;color:${zeroFilteredNews > 0 ? '#e00' : '#0a0'}">${zeroFilteredNews} industries with 0 delivered</div>
      </div>
      <div style="background:#f0fff0;padding:12px 20px;border-radius:8px;min-width:140px">
        <div style="font-size:24px;font-weight:bold;color:#000">${totalFilteredArticles} <span style="font-size:14px;color:#888">/ ${totalRawArticles}</span></div>
        <div style="font-size:12px;color:#555">Articles (delivered/raw)</div>
        <div style="font-size:11px;color:${zeroFilteredArticles > 0 ? '#e00' : '#0a0'}">${zeroFilteredArticles} industries with 0 delivered</div>
      </div>
      <div style="background:#fff0f0;padding:12px 20px;border-radius:8px;min-width:120px">
        <div style="font-size:24px;font-weight:bold;color:#000">${totalJobs}</div>
        <div style="font-size:12px;color:#555">Jobs</div>
        <div style="font-size:11px;color:${zeroJobs > 0 ? '#e00' : '#0a0'}">${zeroJobs} industries with 0</div>
      </div>
    </div>

    <table style="border-collapse:collapse;width:100%;font-size:13px;margin-top:16px">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:left">Industry</th>
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:center">News (del/raw)</th>
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:center">Sources</th>
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:center">Articles (del/raw)</th>
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:center">Sources</th>
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:center">Jobs</th>
          <th style="padding:8px 12px;border:1px solid #ddd;text-align:center">Companies</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    
    <p style="font-size:11px;color:#999;margin-top:24px">Key: ✅ healthy | ⚠️ low | ❌ missing - "del/raw" = AI-filtered delivered count / total in database</p>
  </body></html>`;
}

function buildPlainText(rows: IndustryRow[], dateStr: string): string {
  const header = `DAILY CONTENT HEALTH REPORT - ${dateStr}\nShows delivered/raw counts (AI-filtered vs total)\n${'='.repeat(70)}\n\n`;
  const lines = rows.map(r =>
    `${r.industry.padEnd(18)} News: ${String(r.filtered_news).padStart(3)}/${String(r.raw_news).padStart(3)} (${r.news_sources} src)  Articles: ${String(r.filtered_articles).padStart(3)}/${String(r.raw_articles).padStart(3)} (${r.article_sources} src)  Jobs: ${String(r.jobs).padStart(4)} (${r.job_companies} co)`
  );
  return header + lines.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const lovableApiKey = Deno.env.get('GEMINI_API_KEY');

    const url = new URL(req.url);
    const recipientEmail = url.searchParams.get('email') || 'andrew@stanwoodoffice.com';

    const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    // Use a 36h window for jobs so the overnight scrape that lands at ~01:00–03:00 UTC
    // is always reflected in the 08:30 BST report (regardless of run time / DST).
    const sinceJobs = new Date(Date.now() - 36 * 3600 * 1000).toISOString();

    // Fetch raw data for all industries in parallel
    const headers = { 'Authorization': `Bearer ${supabaseKey}`, 'apikey': supabaseKey, 'Prefer': 'count=exact' };
    const [newsRes, articlesRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/breaking_news?select=industry,source,title&fetched_at=gte.${since24h}&limit=1000`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/articles?select=industry,source,title&scraped_at=gte.${since24h}&limit=1000`, { headers }),
    ]);

    // Fetch job ingestion activity per industry. We use `scraped_at` (not `created_at`)
    // so re-scrapes of existing jobs count as activity - `created_at` only fires on
    // first insert, which made stable industries look like "no new jobs" even when
    // they refreshed overnight.
    const jobCountPromises = INDUSTRIES.map(async (industry) => {
      const res = await fetch(`${supabaseUrl}/rest/v1/jobs?select=company&industry=eq.${industry}&scraped_at=gte.${sinceJobs}`, {
        headers: { ...headers, 'Prefer': 'count=exact', 'Range': '0-0' },
      });
      const count = parseInt(res.headers.get('content-range')?.split('/')[1] || '0', 10);
      // For company diversity, fetch a sample
      const sampleRes = await fetch(`${supabaseUrl}/rest/v1/jobs?select=company&industry=eq.${industry}&scraped_at=gte.${sinceJobs}&limit=500`, { headers });
      const sampleData = sampleRes.ok ? await sampleRes.json() : [];
      return { industry, count, companies: new Set(sampleData.map((j: any) => j.company)).size };
    });

    const allNews = newsRes.ok ? await newsRes.json() : [];
    const allArticles = articlesRes.ok ? await articlesRes.json() : [];
    const jobResults = await Promise.all(jobCountPromises);
    const jobMap = Object.fromEntries(jobResults.map(j => [j.industry, j]));

    // Build rows with raw counts first
    const rows: IndustryRow[] = INDUSTRIES.map(industry => {
      const indNews = allNews.filter((r: any) => r.industry === industry);
      const indArticles = allArticles.filter((r: any) => r.industry === industry);
      const jd = jobMap[industry] || { count: 0, companies: 0 };
      return {
        industry,
        raw_news: indNews.length,
        filtered_news: indNews.length,
        news_sources: new Set(indNews.map((r: any) => r.source)).size,
        raw_articles: indArticles.length,
        filtered_articles: indArticles.length,
        article_sources: new Set(indArticles.map((r: any) => r.source)).size,
        jobs: jd.count,
        job_companies: jd.companies,
      };
    });

    // Run AI filter per industry to show what would actually be delivered
    if (lovableApiKey) {
      // Process in batches of 4 to avoid rate limits
      for (let i = 0; i < INDUSTRIES.length; i += 4) {
        const batch = INDUSTRIES.slice(i, i + 4);
        await Promise.all(batch.map(async (industry) => {
          const row = rows.find(r => r.industry === industry)!;
          const indNews = allNews.filter((r: any) => r.industry === industry);
          const indArticles = allArticles.filter((r: any) => r.industry === industry);

          const combined = [
            ...indNews.map((n: any) => ({ title: n.title, source: n.source, type: 'news' })),
            ...indArticles.map((a: any) => ({ title: a.title, source: a.source, type: 'article' })),
          ];

          if (combined.length === 0) return;

          const kept = await aiFilterForIndustry(combined, industry, lovableApiKey);
          
          let filteredNewsCount = 0;
          let filteredArticlesCount = 0;
          combined.forEach((item, idx) => {
            if (kept.has(idx)) {
              if (item.type === 'news') filteredNewsCount++;
              else filteredArticlesCount++;
            }
          });

          row.filtered_news = filteredNewsCount;
          row.filtered_articles = filteredArticlesCount;
        }));
      }
    }

    const dateStr = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const htmlBody = buildHtmlReport(rows, dateStr);
    const textBody = buildPlainText(rows, dateStr);

    // Send via Resend if key available
    if (resendKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'How do you do? <notify@notify.howdoyoudo.group>',
          to: [recipientEmail],
          subject: `📊 Content Health Report - ${dateStr}`,
          html: htmlBody,
          text: textBody,
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.text();
        console.error('Email send error:', err);
        return new Response(
          JSON.stringify({ success: false, error: `Email send failed: ${err}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Content health report sent to ${recipientEmail}`);

    return new Response(
      JSON.stringify({ success: true, sent_to: recipientEmail, data: rows }),
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
