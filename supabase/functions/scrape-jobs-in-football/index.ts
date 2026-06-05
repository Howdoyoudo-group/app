// Dedicated scraper for jobsinfootball.com.
//
// The site uses an AJAX "Load more" button (data-page=N) rather than ?page=N
// for the unfiltered jobs index, AND most listings are US college soccer roles
// - irrelevant to our UK-focused football industry tab.
//
// Strategy: scrape the UK-relevant category filters
// (Premier League, EFL, Championship, Womens Football, Business & Commercial)
// where each filter is a static, paginated URL we can scan with Firecrawl.
// Job links use the pattern /job/<id>/<slug>/ (singular).
//
// Accepts { categories?: string[] } so a cron driver can call it weekly with
// no payload and get the full UK refresh.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMPANY = 'Jobs in Football';
const BASE = 'https://jobsinfootball.com/jobs/';
const INDUSTRY = 'football';

// UK-relevant category filters - each renders a static HTML page Firecrawl can parse.
const DEFAULT_CATEGORIES = [
  'Premier League',
  'EFL',
  'Championship',
  'Womens Football',
  'Business & Commercial',
  'Marketing',
  'Digital',
  'Hospitality',
  'Events',
  'Sales',
];

interface ExtractedJob {
  title: string;
  url: string;
  company?: string | null;
  location?: string | null;
  type?: string | null;
  description?: string | null;
}

const STRUCTURED_PROMPT = `Extract every football job listing on this page. For each job include:
- title (exact wording from the listing heading)
- url (absolute URL to the job detail page - must look like https://jobsinfootball.com/job/<digits>/<slug>/)
- company (the hiring organisation, e.g. "Manchester United", "Premier League", "Arsenal")
- location (city/region as displayed)
- type (Full time / Part time / Casual / Intern etc. when shown)
- description (first 1-2 sentences of the listing summary)
Ignore navigation, refine-search filters, category counts, and the "Load more" button.
Return JSON: {"jobs":[{"title":"...","url":"...","company":"...","location":"...","type":"...","description":"..."}]}`;

function absUrl(href: string, base: string): string {
  try { return new URL(href, base).toString(); } catch { return href; }
}

// /job/<id>/<slug>/ - singular "job", id is digits.
const JOB_URL_RE = /jobsinfootball\.com\/job\/\d+\/[a-z0-9-]+\/?$/i;

function isJobUrl(url: string): boolean {
  return JOB_URL_RE.test(url);
}

// UK-relevance filter so we don't pollute the feed with US college soccer.
const US_STATE_RE = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/;
const UK_HINT_RE = /\b(United Kingdom|UK|England|Scotland|Wales|Northern Ireland|London|Manchester|Liverpool|Birmingham|Leeds|Newcastle|Sheffield|Bristol|Nottingham|Leicester|Brighton|Southampton|Cardiff|Edinburgh|Glasgow|Belfast)\b/i;
const UK_CLUB_RE = /\b(Premier League|EFL|Championship|FA |The FA|Football Association|Arsenal|Chelsea|Tottenham|Spurs|Liverpool FC|Manchester United|Manchester City|Man Utd|Man City|Newcastle United|Aston Villa|West Ham|Everton|Crystal Palace|Fulham|Brentford|Wolves|Wolverhampton|Nottingham Forest|Bournemouth|Leicester|Ipswich|Southampton|Brighton|Burnley|Sheffield United|Leeds United|Sunderland|Norwich|West Brom|Cardiff City|Swansea|QPR|Millwall|Watford|Reading|Coventry|Hull City|Stoke|Birmingham City|Derby County|Preston|Blackburn|Bristol City|Middlesbrough|Plymouth|Portsmouth|Wrexham|Sky Sports|BT Sport|TNT Sports|DAZN|Premiership|Wembley)\b/i;

function isUkRelevant(job: ExtractedJob): boolean {
  const loc = (job.location ?? '').trim();
  const company = (job.company ?? '').trim();
  const text = `${job.title} ${company} ${loc} ${job.description ?? ''}`;

  // Hard reject: US-state suffix in location (e.g. "Raleigh, NC", "Bend, OR").
  if (loc && /,\s*[A-Z]{2}$/.test(loc) && US_STATE_RE.test(loc)) return false;

  // Accept if any UK hint or known UK club appears.
  return UK_HINT_RE.test(text) || UK_CLUB_RE.test(text);
}

function normalize(raw: any, pageUrl: string): ExtractedJob | null {
  if (!raw || typeof raw !== 'object') return null;
  const title = String(raw.title ?? '').trim();
  const rawUrl = String(raw.url ?? raw.link ?? raw.href ?? '').trim();
  if (!title || !rawUrl) return null;
  const url = absUrl(rawUrl, pageUrl);
  if (!isJobUrl(url)) return null;
  return {
    title,
    url,
    company: raw.company ? String(raw.company).trim() : null,
    location: raw.location ? String(raw.location).trim() : null,
    type: raw.type ? String(raw.type).trim() : null,
    description: raw.description ? String(raw.description).trim().slice(0, 1000) : null,
  };
}

async function scrapeCategory(category: string, apiKey: string): Promise<ExtractedJob[]> {
  const pageUrl = `${BASE}?categories[]=${encodeURIComponent(category)}`;
  const resp = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: pageUrl,
      formats: [{ type: 'json', prompt: STRUCTURED_PROMPT }, 'links'],
      onlyMainContent: true,
      waitFor: 2000,
    }),
  });
  if (!resp.ok) {
    console.warn(`[scrape-jobs-in-football] category "${category}" failed: ${resp.status}`);
    return [];
  }
  const data = await resp.json();
  const structured = data?.data?.json ?? data?.json ?? null;
  const links: string[] = data?.data?.links ?? data?.links ?? [];

  const out: ExtractedJob[] = [];
  if (structured && Array.isArray(structured.jobs)) {
    for (const j of structured.jobs) {
      const norm = normalize(j, pageUrl);
      if (norm) out.push(norm);
    }
  }

  // Backfill from raw links if structured extraction missed any.
  const seen = new Set(out.map((j) => j.url));
  for (const link of links) {
    const url = absUrl(link, pageUrl);
    if (!isJobUrl(url) || seen.has(url)) continue;
    // Derive a fallback title from the slug.
    const slug = url.replace(/\/$/, '').split('/').pop() ?? '';
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    if (title.length < 4) continue;
    seen.add(url);
    out.push({ title, url, company: null, location: null, type: null, description: null });
  }

  // Dedupe within category.
  const uniq = new Map<string, ExtractedJob>();
  for (const j of out) {
    const k = j.url.toLowerCase();
    if (!uniq.has(k)) uniq.set(k, j);
  }
  return Array.from(uniq.values());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('HDYD_SERVICE_JWT') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!apiKey || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ success: false, error: 'Missing env vars' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const categories: string[] = Array.isArray(body?.categories) && body.categories.length
      ? body.categories
      : DEFAULT_CATEGORIES;

    // Return immediately and run scraping in background to avoid resource limit
    const work = (async () => {
      let totalFound = 0;
      let totalUkRelevant = 0;
      let totalInserted = 0;
      const stats: Array<{ category: string; found: number; ukRelevant: number; inserted: number }> = [];

      for (const category of categories) {
        const jobs = await scrapeCategory(category, apiKey);
        totalFound += jobs.length;

        const ukJobs = jobs.filter(isUkRelevant);
        totalUkRelevant += ukJobs.length;
        console.log(`[scrape-jobs-in-football] ${category}: ${jobs.length} found, ${ukJobs.length} UK-relevant`);

        if (ukJobs.length === 0) {
          stats.push({ category, found: jobs.length, ukRelevant: 0, inserted: 0 });
          continue;
        }

        // Skip URLs already in the DB.
        const urls = ukJobs.map((j) => j.url);
        const { data: existing } = await supabase
          .from('jobs')
          .select('url')
          .in('url', urls);
        const existingSet = new Set((existing ?? []).map((r: any) => r.url));
        const fresh = ukJobs.filter((j) => !existingSet.has(j.url));

        if (fresh.length === 0) {
          stats.push({ category, found: jobs.length, ukRelevant: ukJobs.length, inserted: 0 });
          continue;
        }

        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const rows = fresh.map((j) => ({
          title: j.title,
          company: j.company || COMPANY,
          location: j.location,
          description: j.description,
          url: j.url,
          tags: ['Football', category],
          industry: INDUSTRY,
          type: j.type ?? 'Full-time',
          work_mode: 'On-site',
          featured: false,
          source_url: BASE,
          expires_at: expiresAt,
        }));

        const { error: insertErr, data: insertedRows } = await supabase
          .from('jobs')
          .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
          .select('id');
        if (insertErr) {
          console.error(`[scrape-jobs-in-football] insert error for ${category}:`, insertErr);
          stats.push({ category, found: jobs.length, ukRelevant: ukJobs.length, inserted: 0 });
        } else {
          const inserted = insertedRows?.length ?? 0;
          totalInserted += inserted;
          stats.push({ category, found: jobs.length, ukRelevant: ukJobs.length, inserted });
        }
      }
      console.log(`[scrape-jobs-in-football] done: found=${totalFound}, ukRelevant=${totalUkRelevant}, inserted=${totalInserted}`);
    })();

    if (typeof EdgeRuntime !== 'undefined' && (EdgeRuntime as any)?.waitUntil) {
      (EdgeRuntime as any).waitUntil(work);
    } else {
      await work;
    }

    return new Response(
      JSON.stringify({ success: true, accepted: true, message: 'Football job scrape started in background', categories }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[scrape-jobs-in-football] fatal:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
