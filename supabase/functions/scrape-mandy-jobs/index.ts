// Dedicated scraper for mandy.com/uk/jobs/stage/ — real UK theatre backstage
// and crew job listings (stage management, lighting, sound, costume, touring)
// that never appear on Adzuna/Reed/Jooble/JSearch.
//
// A raw fetch (even with a full browser-realistic header set) gets a 403 from
// Mandy - this is TLS/browser fingerprinting bot protection (confirmed by
// testing from a residential IP too, not just Supabase's datacenter IPs), not
// a simple UA check. Routed through Firecrawl instead, same pattern as
// scrape-jobs-in-football/scrape-generic-boards: AI-structured JSON
// extraction with a raw-links backfill for anything the extraction misses.
//
// Accepts { dry_run?: boolean } — when true, returns parsed counts/sample
// without touching the DB.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: { waitUntil?: (p: Promise<unknown>) => void } | undefined;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://www.mandy.com/uk/jobs/stage/";
const INDUSTRY = "theatre";
const MAX_PAGES = 3; // Firecrawl free-tier credits - keep modest per run.

interface ExtractedJob {
  title: string;
  url: string;
  company: string | null;
  location: string | null;
  salary: string | null;
}

const STRUCTURED_PROMPT = `Extract every theatre job/production listing on this page. For each listing include:
- title (the specific role name being hired for, e.g. "Assistant Lighting Technician", "Deputy Stage Manager" - NOT the production name)
- company (the venue, production or show name, e.g. "Glyndebourne", "Billy Elliot The Musical")
- url (absolute URL to the specific job/production listing detail page)
- location (venue/city/region as displayed, e.g. "United Kingdom (Nationwide)" or a specific town)
- salary (the pay/rate shown, e.g. "£516.75" or "£13.25 / hour" - null if not shown)
Ignore navigation, filters, "Related Searches" links, and footer links.
Return JSON: {"jobs":[{"title":"...","company":"...","url":"...","location":"...","salary":"..."}]}`;

const JOB_URL_RE = /mandy\.com\/uk\/job\/\d+\/[a-z0-9-]+\/\d+\/?$/i;

function absUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function isJobUrl(url: string): boolean {
  return JOB_URL_RE.test(url);
}

function normalize(raw: unknown, pageUrl: string): ExtractedJob | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = typeof r.title === "string" ? r.title.trim() : "";
  const urlRaw = typeof r.url === "string" ? r.url.trim() : "";
  if (!title || !urlRaw) return null;
  const url = absUrl(urlRaw, pageUrl);
  if (!isJobUrl(url)) return null;
  return {
    title: title.slice(0, 255),
    url,
    company: typeof r.company === "string" && r.company.trim() ? r.company.trim().slice(0, 200) : null,
    location: typeof r.location === "string" && r.location.trim() ? r.location.trim().slice(0, 200) : null,
    salary: typeof r.salary === "string" && r.salary.trim() ? r.salary.trim() : null,
  };
}

async function scrapePage(page: number, apiKey: string): Promise<ExtractedJob[]> {
  const pageUrl = `${BASE_URL}?page=${page}&view=production`;
  const resp = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url: pageUrl,
      formats: [{ type: "json", prompt: STRUCTURED_PROMPT }, "links"],
      onlyMainContent: false,
      waitFor: 4000,
    }),
  });
  if (!resp.ok) {
    console.warn(`[scrape-mandy-jobs] page ${page} failed: ${resp.status}`);
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

  // Backfill from raw links if structured extraction missed any productions -
  // gives at least a title/url pair (derived from the URL slug) with no
  // company/location/salary, better than dropping the listing entirely.
  const seen = new Set(out.map((j) => j.url));
  for (const link of links) {
    const url = absUrl(link, pageUrl);
    if (!isJobUrl(url) || seen.has(url)) continue;
    const parts = url.replace(/\/$/, "").split("/");
    const slug = /^\d+$/.test(parts[parts.length - 1] ?? "") ? parts[parts.length - 2] ?? "" : parts[parts.length - 1] ?? "";
    const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (title.length < 4) continue;
    seen.add(url);
    out.push({ title, url, company: null, location: null, salary: null });
  }

  return out;
}

async function scrapeAll(apiKey: string): Promise<ExtractedJob[]> {
  const byUrl = new Map<string, ExtractedJob>();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const jobs = await scrapePage(page, apiKey);
    if (jobs.length === 0) break;
    let fresh = 0;
    for (const j of jobs) {
      if (!byUrl.has(j.url)) fresh++;
      byUrl.set(j.url, j);
    }
    if (fresh === 0) break;
  }
  return [...byUrl.values()];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing FIRECRAWL_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dry_run === true;

    if (dryRun) {
      const jobs = await scrapeAll(apiKey);
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
      const jobs = await scrapeAll(apiKey);
      console.log(`[scrape-mandy-jobs] parsed ${jobs.length} jobs`);
      if (jobs.length === 0) return;

      const urls = jobs.map((j) => j.url);
      const { data: existing } = await supabase.from("jobs").select("url").in("url", urls);
      const existingSet = new Set((existing ?? []).map((r: { url: string }) => r.url));
      const newCount = jobs.filter((j) => !existingSet.has(j.url)).length;

      // Refresh-expiry upsert, same pattern as w4mp/lgjobs: re-listed jobs stay
      // live, jobs that drop off Mandy simply stop being refreshed and age out
      // at their last expiry rather than being force-deleted.
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const rows = jobs.map((j) => ({
        title: j.title,
        company: j.company || "Mandy Network",
        location: j.location,
        salary: j.salary,
        url: j.url,
        tags: ["Theatre", "Mandy"],
        industry: INDUSTRY,
        type: "Contract",
        work_mode: "On-site",
        source_url: BASE_URL,
        expires_at: expiresAt,
      }));

      const { error } = await supabase.from("jobs").upsert(rows, { onConflict: "url" });
      if (error) {
        console.error("[scrape-mandy-jobs] upsert error:", error);
      } else {
        console.log(`[scrape-mandy-jobs] done: parsed=${jobs.length}, new=${newCount}, refreshed=${jobs.length - newCount}`);
      }
    })();

    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      EdgeRuntime.waitUntil(work);
    } else {
      await work;
    }

    return new Response(
      JSON.stringify({ success: true, accepted: true, message: "Mandy scrape started in background" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[scrape-mandy-jobs] fatal:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
