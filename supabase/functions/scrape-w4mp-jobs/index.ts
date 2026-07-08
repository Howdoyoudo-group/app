// Dedicated scraper for w4mpjobs.org — the UK's definitive board for
// parliamentary and political jobs (MP caseworkers/researchers, party staff,
// policy managers, think tanks, public affairs). This content never appears on
// Adzuna/Reed/Jooble, so it's the specialist source that makes the Politics
// industry feed genuinely differentiated.
//
// The site is ASP.NET WebForms with schema.org JobPosting microdata and NO
// CAPTCHA, so a plain fetch + regex parse works — no Firecrawl, no credits.
// Pagination is __doPostBack (not ?page=N): we carry the __VIEWSTATE /
// __EVENTVALIDATION hidden fields forward and POST the "Next Page" control's
// event target to walk all ~8 pages.
//
// Accepts { dry_run?: boolean } — when true, returns parsed counts/sample
// without touching the DB.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: { waitUntil?: (p: Promise<unknown>) => void } | undefined;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEARCH_URL = "https://www.w4mpjobs.org/SearchJobs.aspx?search=alljobs";
const DETAIL_BASE = "https://www.w4mpjobs.org/JobDetails.aspx?jobid=";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const INDUSTRY = "politics";
const MAX_PAGES = 12;

interface W4mpJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  url: string;
}

// ── HTML helpers ─────────────────────────────────────────────────────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&pound;/g, "£")
    .replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}
function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}
function hidden(html: string, name: string): string {
  const m = html.match(new RegExp(`id="${name}" value="([^"]*)"`));
  return m ? m[1] : "";
}
// The __doPostBack target whose anchor text is "Next Page".
function nextTarget(html: string): string | null {
  const re = /href="javascript:__doPostBack\(&#39;([^&]+)&#39;[^"]*"[^>]*>\s*([^<]+?)\s*<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m[2].trim().toLowerCase() === "next page") return m[1];
  }
  return null;
}

// ── Parse one results page into jobs ─────────────────────────────────────────
function parseJobs(html: string): W4mpJob[] {
  const jobs: W4mpJob[] = [];
  const re = /JobDetails\.aspx\?jobid=(\d+)"[^>]*>\d+<\/a><\/strong>\s*\/\s*<span itemprop="title">(.*?)<\/span>\s*,\s*for\s*<span itemprop="hiringOrganization">(.*?)<\/span>(.*?)(?=<div class="jobadvertdetailbox" id="jobid"|<article|<\/section|$)/gs;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const [, id, titleRaw, orgRaw, rest] = m;
    const title = stripTags(titleRaw);
    const company = stripTags(orgRaw) || "W4MP";
    if (!title) continue;
    const locM = rest.match(/itemprop="jobLocation"[^>]*>(.*?)<\/div>/s);
    const salM = rest.match(/itemprop="baseSalary"[^>]*>(.*?)<\/div>/s);
    const location = locM ? stripTags(locM[1]).replace(/^Location:\s*/i, "") || null : null;
    const salary = salM ? stripTags(salM[1]).replace(/^Salary:\s*/i, "") || null : null;
    jobs.push({ id, title, company, location, salary, url: `${DETAIL_BASE}${id}` });
  }
  return jobs;
}

async function fetchPage(body?: string): Promise<string> {
  const res = await fetch(SEARCH_URL, {
    method: body ? "POST" : "GET",
    headers: {
      "User-Agent": UA,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body,
  });
  if (!res.ok) throw new Error(`w4mp fetch ${res.status}`);
  return res.text();
}

// Walk all pages, collecting unique jobs by id.
async function scrapeAll(): Promise<W4mpJob[]> {
  const byId = new Map<string, W4mpJob>();
  let html = await fetchPage();
  for (const j of parseJobs(html)) byId.set(j.id, j);

  for (let page = 1; page < MAX_PAGES; page++) {
    const target = nextTarget(html);
    if (!target) break;
    const body = new URLSearchParams({
      __EVENTTARGET: target,
      __EVENTARGUMENT: "",
      __VIEWSTATE: hidden(html, "__VIEWSTATE"),
      __VIEWSTATEGENERATOR: hidden(html, "__VIEWSTATEGENERATOR"),
      __EVENTVALIDATION: hidden(html, "__EVENTVALIDATION"),
    }).toString();
    html = await fetchPage(body);
    const pageJobs = parseJobs(html);
    let fresh = 0;
    for (const j of pageJobs) {
      if (!byId.has(j.id)) fresh++;
      byId.set(j.id, j);
    }
    if (fresh === 0) break; // safety: no new jobs → stop
  }
  return [...byId.values()];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dry_run === true;

    if (dryRun) {
      const jobs = await scrapeAll();
      return new Response(
        JSON.stringify({ success: true, dry_run: true, count: jobs.length, sample: jobs.slice(0, 8) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing env vars" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const work = (async () => {
      const jobs = await scrapeAll();
      console.log(`[scrape-w4mp-jobs] parsed ${jobs.length} jobs`);
      if (jobs.length === 0) return;

      // How many were new (for logging) vs already known.
      const urls = jobs.map((j) => j.url);
      const { data: existing } = await supabase.from("jobs").select("url").in("url", urls);
      const existingSet = new Set((existing ?? []).map((r: { url: string }) => r.url));
      const newCount = jobs.filter((j) => !existingSet.has(j.url)).length;

      // Upsert ALL scraped jobs (not just new ones) so that every weekly run
      // refreshes expires_at for vacancies still listed on W4MP — they stay
      // live as long as they're open. Jobs that drop off W4MP simply stop
      // being refreshed and age out at their last expiry. created_at is not in
      // the payload, so freshness ranking of existing rows is preserved.
      // These JobDetails.aspx?jobid= URLs are unique to W4MP, so updating on
      // conflict never clobbers another source's data.
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const rows = jobs.map((j) => ({
        title: j.title,
        company: j.company,
        location: j.location,
        salary: j.salary,
        url: j.url,
        tags: ["Politics", "W4MP"],
        industry: INDUSTRY,
        type: "Full-time",
        work_mode: "On-site",
        source_url: SEARCH_URL,
        expires_at: expiresAt,
      }));

      const { error } = await supabase.from("jobs").upsert(rows, { onConflict: "url" });
      if (error) {
        console.error("[scrape-w4mp-jobs] upsert error:", error);
      } else {
        console.log(`[scrape-w4mp-jobs] done: parsed=${jobs.length}, new=${newCount}, refreshed=${jobs.length - newCount}`);
      }
    })();

    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      EdgeRuntime.waitUntil(work);
    } else {
      await work;
    }

    return new Response(
      JSON.stringify({ success: true, accepted: true, message: "W4MP scrape started in background" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[scrape-w4mp-jobs] fatal:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
