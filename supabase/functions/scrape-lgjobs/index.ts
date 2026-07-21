// Dedicated scraper for lgjobs.com — the UK's local-government jobs board.
//
// lgjobs is a Next.js + Apollo app: every /jobs?page=N request server-renders
// 25 jobs into a __NEXT_DATA__ → __APOLLO_STATE__ JSON blob (no CAPTCHA), so we
// extract them straight from the HTML — no Firecrawl, no credits, no API keys.
//
// IMPORTANT: lgjobs lists the ENTIRE council workforce (~1,900 jobs: social
// work, teaching, care, refuse, etc.). We only want the genuinely political /
// governance / policy roles for the Politics industry, so we filter by title
// (Democratic Services, Policy Officer, Electoral, Governance, Scrutiny, etc.).
// That narrows ~1,900 council jobs to the ~30 that belong in Politics.
//
// Accepts { dry_run?: boolean, max_pages?: number }.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decodeEntities } from "../_shared/decode-entities.ts";

declare const EdgeRuntime: { waitUntil?: (p: Promise<unknown>) => void } | undefined;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ORIGIN = "https://www.lgjobs.com";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const INDUSTRY = "politics";
const PAGE_SIZE = 25;
const MAX_PAGES = 85; // ~1,900 jobs / 25 ≈ 77 pages, with headroom

// Only genuinely political / governance / policy local-government roles belong
// in the Politics industry. Everything else on lgjobs (social work, teaching,
// care, cleaning, IT…) is deliberately excluded.
const POLITICAL_TITLE_RE = /\b(policy|policies|democratic services|electoral|governance|committee officer|committee services|scrutiny|civic officer|constitution(?:al)?|economic development|regeneration|elected member|member services|councillor|mayoral|elections? officer|returning officer|devolution|overview and scrutiny|corporate strateg|leader'?s office|cabinet (?:office|support)|public affairs|local democracy)\b/i;

interface LgJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  url: string;
}

interface ApolloJob {
  id?: string | number;
  title?: string;
  organization?: string;
  urlNoPrefix?: string;
  url?: { path?: string };
  address?: string[];
  salaryRangeFree?: { minSalary?: string; maxSalary?: string };
}

function formatSalary(s?: { minSalary?: string; maxSalary?: string }): string | null {
  if (!s?.minSalary && !s?.maxSalary) return null;
  const min = s.minSalary ? Math.round(parseFloat(s.minSalary)) : null;
  const max = s.maxSalary ? Math.round(parseFloat(s.maxSalary)) : null;
  if (min && max) return min === max ? `£${min.toLocaleString()}` : `£${min.toLocaleString()} - £${max.toLocaleString()}`;
  const one = min || max;
  return one ? `£${one.toLocaleString()}` : null;
}

// Pull the Apollo cache out of a page's __NEXT_DATA__ and return { jobs, resultCount }.
function parsePage(html: string): { jobs: LgJob[]; resultCount: number } {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!m) return { jobs: [], resultCount: 0 };
  let apollo: Record<string, unknown>;
  try {
    const data = JSON.parse(m[1]);
    apollo = data?.props?.pageProps?.__APOLLO_STATE__ ?? {};
  } catch {
    return { jobs: [], resultCount: 0 };
  }

  let resultCount = 0;
  const rq = apollo["ROOT_QUERY"] as Record<string, unknown> | undefined;
  if (rq) {
    const jobsKey = Object.keys(rq).find((k) => k.startsWith("jobs("));
    if (jobsKey) resultCount = Number((rq[jobsKey] as { result_count?: number })?.result_count ?? 0);
  }

  const jobs: LgJob[] = [];
  for (const [key, val] of Object.entries(apollo)) {
    if (!key.startsWith("Job:")) continue;
    const j = val as ApolloJob;
    const title = (j.title ?? "").trim();
    if (!title || !POLITICAL_TITLE_RE.test(title)) continue; // filter to political roles
    const path = j.urlNoPrefix || j.url?.path || "";
    if (!path) continue;
    jobs.push({
      id: String(j.id ?? path),
      title,
      company: (j.organization ?? "").trim() || "Local Government",
      location: j.address?.[0] ?? null,
      salary: formatSalary(j.salaryRangeFree),
      url: `${ORIGIN}${path}`,
    });
  }
  return { jobs, resultCount };
}

async function fetchPage(page: number): Promise<string> {
  const res = await fetch(`${ORIGIN}/jobs?page=${page}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`lgjobs page ${page} → ${res.status}`);
  return res.text();
}

async function scrapeAll(maxPages: number): Promise<LgJob[]> {
  const byUrl = new Map<string, LgJob>();
  const first = await fetchPage(0);
  const { jobs: firstJobs, resultCount } = parsePage(first);
  for (const j of firstJobs) byUrl.set(j.url, j);

  const totalPages = Math.min(maxPages, Math.ceil((resultCount || PAGE_SIZE) / PAGE_SIZE));
  for (let page = 1; page < totalPages; page++) {
    let html: string;
    try {
      html = await fetchPage(page);
    } catch {
      continue; // skip a transient page failure, keep going
    }
    const { jobs } = parsePage(html);
    for (const j of jobs) byUrl.set(j.url, j);
    await new Promise((r) => setTimeout(r, 150)); // be polite
  }
  return [...byUrl.values()];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dry_run === true;
    const maxPages = Number(body?.max_pages) > 0 ? Number(body.max_pages) : MAX_PAGES;

    if (dryRun) {
      const jobs = await scrapeAll(maxPages);
      return new Response(
        JSON.stringify({ success: true, dry_run: true, count: jobs.length, sample: jobs.slice(0, 10) }),
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
      const jobs = await scrapeAll(maxPages);
      console.log(`[scrape-lgjobs] ${jobs.length} political roles after filtering`);
      if (jobs.length === 0) return;

      const urls = jobs.map((j) => j.url);
      const { data: existing } = await supabase.from("jobs").select("url").in("url", urls);
      const existingSet = new Set((existing ?? []).map((r: { url: string }) => r.url));
      const newCount = jobs.filter((j) => !existingSet.has(j.url)).length;

      // Upsert ALL scraped jobs so expires_at is refreshed for roles still
      // listed (they stay live), while removed roles age out. Same lifecycle as
      // scrape-w4mp-jobs. lgjobs URLs are unique to this source.
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const rows = jobs.map((j) => ({
        title: decodeEntities(j.title),
        company: decodeEntities(j.company),
        location: j.location ? decodeEntities(j.location) : j.location,
        salary: j.salary,
        url: j.url,
        tags: ["Politics", "Local Government", "LGJobs"],
        industry: INDUSTRY,
        type: "Full-time",
        work_mode: "On-site",
        source_url: `${ORIGIN}/jobs`,
        expires_at: expiresAt,
      }));

      const { error } = await supabase.from("jobs").upsert(rows, { onConflict: "url" });
      if (error) {
        console.error("[scrape-lgjobs] upsert error:", error);
      } else {
        console.log(`[scrape-lgjobs] done: political=${jobs.length}, new=${newCount}, refreshed=${jobs.length - newCount}`);
      }
    })();

    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      EdgeRuntime.waitUntil(work);
    } else {
      await work;
    }

    return new Response(
      JSON.stringify({ success: true, accepted: true, message: "lgjobs scrape started in background" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[scrape-lgjobs] fatal:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
