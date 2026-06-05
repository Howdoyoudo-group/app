// Industry Job Health Monitor
// ----------------------------
// Runs on a schedule. For every known industry it compares the live job count
// to a per-industry minimum baseline. If the count is below the baseline (a
// "shortfall"), it triggers fetch-external-jobs for that industry to top it up.
//
// Results are written to industry_health_log so admins can see what happened.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { INDUSTRY_BASELINES as REGISTRY_BASELINES } from "../_shared/industry-registry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Per-industry minimum healthy live job count.
// Sourced from the canonical registry (single source of truth) plus a few
// extra pseudo-industries that aren't in the public industry list (e.g.
// graduate, marketing, ai, tech) but still have content we want to monitor.
const INDUSTRY_BASELINES: Record<string, number> = {
  ...REGISTRY_BASELINES,
  // Pseudo-industries - not on the public industries list, monitored separately.
  marketing: 150,
  graduate: 150,
  ai: 40,
  tech: 40,
};

// Below this fraction of baseline → trigger refetch.
// Raised from 0.5 → 0.7 so industries that drift down (rather than crash) also
// get topped up - keeps the daily ingestion broader across all industries.
const SHORTFALL_THRESHOLD = 0.7;

// Rate-limiting refetch dispatch.
// fetch-external-jobs hits Adzuna/Reed/Jooble - firing them all at once
// burns through provider rate limits in seconds. We instead:
//   1. Cap how many industries we refetch per run (the rest wait for the
//      next scheduled run - they'll still be flagged unhealthy).
//   2. Stagger dispatches with a delay between each so providers see a
//      steady trickle instead of a thundering herd.
//   3. Shuffle the unhealthy list so the same industries aren't always
//      first in line if we hit the cap.
const MAX_REFETCHES_PER_RUN = 3;
const REFETCH_STAGGER_MS = 90_000; // 90s between dispatches

// ── SerpAPI Google Jobs fallback ──
// Free tier = 100 searches/month total. We only fire SerpAPI for industries
// flagged unhealthy this run, capped to 1 search per industry per run, and
// hard-stopped at SERPAPI_MONTHLY_CAP to leave headroom under the 100 quota.
// Kill switch: set SERPAPI_ENABLED=false.
const SERPAPI_MONTHLY_CAP = 95;
const SERPAPI_ENABLED = (Deno.env.get("SERPAPI_ENABLED") ?? "true").toLowerCase() !== "false";
const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY") || "";

// Representative search query per industry slug for Google Jobs.
// Falls back to "<slug humanised> jobs" if not listed.
const SERPAPI_QUERIES: Record<string, string> = {
  bakery: "bakery jobs",
  beauty: "beauty therapist jobs",
  beer: "brewery jobs",
  cars: "automotive jobs",
  charity: "charity fundraiser jobs",
  cinema: "film production jobs",
  coffee: "barista jobs",
  "estate-agency": "estate agent jobs",
  farming: "farm worker jobs",
  fashion: "fashion designer jobs",
  football: "football club jobs",
  footwear: "footwear designer jobs",
  "formula-1": "motorsport jobs",
  gaming: "video game developer jobs",
  grocery: "supermarket jobs",
  health: "healthcare assistant jobs",
  "horse-racing": "horse racing jobs",
  hospitality: "restaurant manager jobs",
  "food-drink": "restaurant chef jobs",
  influencing: "creator economy jobs",
  "interior-design": "interior designer jobs",
  jewellery: "jeweller jobs",
  journalism: "journalist jobs",
  money: "financial advisor jobs",
  music: "music industry jobs",
  pets: "veterinary jobs",
  physiotherapy: "physiotherapist jobs",
  psychotherapy: "psychotherapist jobs",
  teaching: "teaching jobs",
  travel: "travel jobs",
  wellness: "wellness coach jobs",
};

function humanizeSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

async function getSerpapiUsage(sb: any, month: string): Promise<number> {
  const { data } = await sb
    .from("serpapi_usage")
    .select("count")
    .eq("month", month)
    .maybeSingle();
  return data?.count ?? 0;
}

async function bumpSerpapiUsage(sb: any, month: string, by: number) {
  // Read-modify-write upsert. Race-safe enough for single-cron invocation.
  const current = await getSerpapiUsage(sb, month);
  await sb.from("serpapi_usage").upsert(
    { month, count: current + by, updated_at: new Date().toISOString() },
    { onConflict: "month" }
  );
}

// Fetch one page of Google Jobs results from SerpAPI and upsert into jobs.
// Returns { searches, inserted }.
async function serpapiFallback(sb: any, industry: string): Promise<{ searches: number; inserted: number; error?: string }> {
  if (!SERPAPI_ENABLED || !SERPAPI_KEY) return { searches: 0, inserted: 0, error: "disabled" };
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const used = await getSerpapiUsage(sb, month);
  if (used >= SERPAPI_MONTHLY_CAP) return { searches: 0, inserted: 0, error: `monthly cap reached (${used}/${SERPAPI_MONTHLY_CAP})` };

  const q = SERPAPI_QUERIES[industry] || `${humanizeSlug(industry)} jobs`;
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_jobs");
  url.searchParams.set("q", q);
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "uk");
  url.searchParams.set("location", "United Kingdom");
  url.searchParams.set("api_key", SERPAPI_KEY);

  let data: any;
  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { searches: 1, inserted: 0, error: `http ${res.status} ${txt.slice(0, 120)}` };
    }
    data = await res.json();
  } catch (e: any) {
    return { searches: 1, inserted: 0, error: `fetch failed: ${e?.message || e}` };
  } finally {
    // Count the search regardless of outcome — SerpAPI charges on dispatch.
    await bumpSerpapiUsage(sb, month, 1);
  }

  const results: any[] = data?.jobs_results || [];
  if (results.length === 0) return { searches: 1, inserted: 0 };

  const minExpiry = new Date(Date.now() + 30 * 86400000).toISOString();
  const rows = results
    .map((r: any) => {
      const apply = Array.isArray(r.apply_options) && r.apply_options.length > 0 ? r.apply_options[0]?.link : null;
      const link = apply || r.share_link || r.related_links?.[0]?.link || null;
      if (!link || !r.title || !r.company_name) return null;
      const desc: string = (r.description || "").toString().slice(0, 4000);
      return {
        url: link,
        title: String(r.title).slice(0, 300),
        company: String(r.company_name).slice(0, 200),
        location: r.location ? String(r.location).slice(0, 200) : "United Kingdom",
        description: desc,
        industry,
        scraped_at: new Date().toISOString(),
        expires_at: minExpiry,
      };
    })
    .filter(Boolean) as any[];

  if (rows.length === 0) return { searches: 1, inserted: 0 };

  let inserted = 0;
  // Row-by-row upsert (jobs table has two unique indexes; safer than batch).
  for (const row of rows) {
    const { data: ins, error: upErr } = await sb
      .from("jobs")
      .upsert([row], { onConflict: "url" })
      .select("id");
    if (!upErr) inserted += ins?.length || 0;
  }
  return { searches: 1, inserted };
}

// Per-industry career-map role coverage. Every entry MUST have at least one
// matching live job; if not, we trigger fetch-external-jobs for that industry
// so the marketplace surfaces something for every box on the career map.
//
// The keyword list is the set of substrings (case-insensitive) we accept as
// proof a role is covered. Keep them broad enough that minor title variations
// match (e.g. "talent manager" matches "Senior Talent Manager - Creators").
const CAREER_MAP_COVERAGE: Record<string, Array<{ role: string; keywords: string[] }>> = {
  influencing: [
    // Creators & Talent
    { role: "Content Creator", keywords: ["content creator", "creator"] },
    { role: "Vlogger / YouTuber", keywords: ["youtuber", "vlogger", "youtube creator"] },
    { role: "Podcast Host", keywords: ["podcast host", "podcaster"] },
    { role: "Newsletter Writer", keywords: ["newsletter writer", "substack"] },
    { role: "Live Streamer", keywords: ["live streamer", "twitch streamer", "streamer"] },
    // Production & Craft
    { role: "Video Editor", keywords: ["video editor", "reels editor", "shorts editor"] },
    { role: "Videographer", keywords: ["videographer"] },
    { role: "Photographer", keywords: ["photographer"] },
    { role: "Producer", keywords: ["video producer", "content producer", "podcast producer"] },
    { role: "Graphic / Motion Designer", keywords: ["motion designer", "thumbnail designer", "graphic designer"] },
    // Talent Management & Agencies
    { role: "Talent Manager", keywords: ["talent manager"] },
    { role: "Talent Agent", keywords: ["talent agent"] },
    { role: "Booker", keywords: ["booker"] },
    { role: "Talent Scout", keywords: ["talent scout", "creator scout"] },
    // Brand Partnerships & Sales
    { role: "Influencer Marketing Manager", keywords: ["influencer marketing", "influencer manager"] },
    { role: "Partnerships Manager", keywords: ["partnerships manager", "creator partnerships"] },
    { role: "Sales / Account Executive", keywords: ["account executive", "sales executive"] },
    { role: "Campaign Manager", keywords: ["campaign manager"] },
    { role: "PR & Comms Manager", keywords: ["pr manager", "comms manager", "communications manager"] },
    // Strategy, Data & Growth
    { role: "Social Media Strategist", keywords: ["social media strategist", "social strategist"] },
    { role: "Community Manager", keywords: ["community manager"] },
    { role: "Growth / Analytics Lead", keywords: ["growth lead", "growth manager", "audience growth", "growth analytics"] },
    { role: "Paid Social Specialist", keywords: ["paid social"] },
    { role: "SEO / Discovery Specialist", keywords: ["seo specialist", "seo manager", "discovery specialist"] },
    // Business & Commercial
    { role: "Creator Business Manager", keywords: ["creator business", "creator operations", "creator ops"] },
    { role: "Brand Director", keywords: ["brand director", "head of brand", "head of creator"] },
    { role: "Legal / Contracts Counsel", keywords: ["legal counsel", "contracts counsel"] },
    { role: "Operations Manager", keywords: ["operations manager"] },
    { role: "Finance / Accounting Lead", keywords: ["finance manager", "finance lead", "accounting lead"] },
  ],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  const startedAt = new Date();
  const trigger = req.headers.get("x-trigger-source") || "manual";

  // Use the SECURITY DEFINER RPC so we get a true GROUP BY count, bypassing
  // the 1000-row PostgREST limit that would otherwise undercount most industries.
  const { data: rows, error } = await sb.rpc("get_live_job_counts_by_industry");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const counts = new Map<string, number>();
  for (const r of (rows as Array<{ industry: string; count: number | string }>) || []) {
    counts.set(r.industry, Number(r.count) || 0);
  }

  const checks: Array<{
    industry: string;
    count: number;
    baseline: number;
    healthy: boolean;
    triggered: boolean;
    refetch_inserted?: number;
    refetch_skipped?: number;
    error?: string;
  }> = [];

  for (const [industry, baseline] of Object.entries(INDUSTRY_BASELINES)) {
    const count = counts.get(industry) || 0;
    const healthy = count >= Math.floor(baseline * SHORTFALL_THRESHOLD);
    const entry: any = { industry, count, baseline, healthy, triggered: false };

    // ── Career-map role coverage ──
    // Every role on the industry's career map should have at least one live job.
    // If any role is missing, mark the industry as "uncovered" and trigger refetch.
    const coverage = CAREER_MAP_COVERAGE[industry];
    if (coverage && coverage.length > 0) {
      const missing: string[] = [];
      for (const { role, keywords } of coverage) {
        // Build an OR ilike query: title ILIKE '%kw1%' OR title ILIKE '%kw2%' ...
        const orClause = keywords
          .map((kw) => `title.ilike.%${kw.replace(/[%,]/g, "")}%`)
          .join(",");
        const { count: roleCount, error: roleErr } = await sb
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("industry", industry)
          .or(orClause)
          .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());
        if (roleErr) {
          console.error(`[coverage] ${industry}/${role} error:`, roleErr.message);
          continue;
        }
        if ((roleCount || 0) === 0) missing.push(role);
      }
      entry.coverage_total = coverage.length;
      entry.coverage_covered = coverage.length - missing.length;
      entry.coverage_missing = missing;
      if (missing.length > 0) entry.healthy = false;
    }

    checks.push(entry);
  }

  // ── Staggered refetch dispatch ──
  // Pick the unhealthy entries, shuffle (so the same industries don't always
  // win when we hit the cap), take the first N, then dispatch them with a
  // delay between each to spare Adzuna/Reed/Jooble rate limits.
  const unhealthy = checks.filter((c) => !c.healthy);
  for (let i = unhealthy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unhealthy[i], unhealthy[j]] = [unhealthy[j], unhealthy[i]];
  }
  const toRefetch = unhealthy.slice(0, MAX_REFETCHES_PER_RUN);
  const deferred = unhealthy.slice(MAX_REFETCHES_PER_RUN);
  for (const entry of toRefetch) entry.triggered = true;
  for (const entry of deferred) {
    entry.triggered = false;
    entry.error = "deferred: rate-limit cap reached this run";
  }

  // Run the staggered dispatch in the background so the HTTP response can
  // return immediately. EdgeRuntime.waitUntil keeps the worker alive.
  const dispatch = async () => {
    for (let i = 0; i < toRefetch.length; i++) {
      const entry = toRefetch[i];
      const { industry } = entry;
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/fetch-external-jobs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
            // Forward the inbound trigger so e.g. `industry-health-monitor-morning`
            // can opt back into Adzuna (see fetch-external-jobs skipAdzuna logic).
            "x-trigger-source": trigger === "industry-health-monitor-morning"
              ? "industry-health-monitor-morning"
              : "industry-health-monitor",
          },
          body: JSON.stringify({ industry }),
        }).catch((e) => {
          console.error(`[industry-health-monitor] refetch ${industry} failed:`, e);
        });
        console.log(`[industry-health-monitor] dispatched refetch for ${industry} (${i + 1}/${toRefetch.length})`);
      } catch (e) {
        console.error(`[industry-health-monitor] refetch ${industry} threw:`, e);
      }

      // ── SerpAPI Google Jobs fallback ──
      // Only fired for industries actually being refetched, so worst case we
      // burn MAX_REFETCHES_PER_RUN (3) searches per cron run. Hard-capped
      // monthly to stay under the 100 free-tier quota.
      try {
        const serp = await serpapiFallback(sb, industry);
        entry.serpapi_searches = serp.searches;
        entry.serpapi_inserted = serp.inserted;
        if (serp.error) entry.serpapi_error = serp.error;
        if (serp.searches > 0) {
          console.log(`[industry-health-monitor] serpapi ${industry}: +${serp.inserted} jobs (${serp.error || "ok"})`);
        }
      } catch (e: any) {
        entry.serpapi_error = e?.message || String(e);
        console.error(`[industry-health-monitor] serpapi ${industry} threw:`, e);
      }

      if (i < toRefetch.length - 1) {
        await new Promise((r) => setTimeout(r, REFETCH_STAGGER_MS));
      }
    }
  };
  // @ts-ignore EdgeRuntime is available in Supabase Edge Functions
  if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
    // @ts-ignore
    EdgeRuntime.waitUntil(dispatch());
  } else {
    dispatch();
  }


  const finishedAt = new Date();
  const summary = {
    started_at: startedAt.toISOString(),
    finished_at: finishedAt.toISOString(),
    duration_ms: finishedAt.getTime() - startedAt.getTime(),
    trigger_source: trigger,
    industries_checked: checks.length,
    industries_unhealthy: checks.filter((c) => !c.healthy).length,
    industries_refetched: checks.filter((c) => c.triggered).length,
    checks,
  };

  // Persist log
  try {
    await sb.from("industry_health_log").insert({
      started_at: summary.started_at,
      finished_at: summary.finished_at,
      duration_ms: summary.duration_ms,
      trigger_source: summary.trigger_source,
      industries_checked: summary.industries_checked,
      industries_unhealthy: summary.industries_unhealthy,
      industries_refetched: summary.industries_refetched,
      checks: summary.checks,
    });
  } catch (e) {
    console.error("[industry-health-monitor] failed to log:", e);
  }

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
