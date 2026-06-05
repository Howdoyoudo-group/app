// Jobs Emergency Topup
// --------------------
// Adzuna recovery fallback. While Adzuna is rate-limited / quota-exhausted,
// this function picks the N worst-hit industries (lowest live job count vs
// baseline) and dispatches targeted fetch-external-jobs refetches that
// explicitly SKIP Adzuna (uses Reed, Jooble, JSearch, ATS, direct boards,
// RSS, plus SerpAPI Google Jobs fallback inside the health monitor).
//
// Designed to be safe to run on a frequent cron (every 4h) — refetches are
// staggered and Adzuna is never touched.
//
// Body (all optional):
//   { count?: number = 10, stagger_ms?: number = 30000, dry_run?: boolean = false }

import { createClient } from "jsr:@supabase/supabase-js@2";
import { INDUSTRY_BASELINES as REGISTRY_BASELINES } from "../_shared/industry-registry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Same baseline source-of-truth as industry-health-monitor.
const INDUSTRY_BASELINES: Record<string, number> = {
  ...REGISTRY_BASELINES,
  marketing: 150,
  graduate: 150,
  ai: 40,
  tech: 40,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  let count = 10;
  let staggerMs = 30_000;
  let dryRun = false;
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.count === "number") count = Math.max(1, Math.min(20, body.count));
    if (typeof body?.stagger_ms === "number") staggerMs = Math.max(0, body.stagger_ms);
    if (body?.dry_run === true) dryRun = true;
  } catch {}

  const startedAt = new Date();

  // Use the SECURITY DEFINER RPC so we get a true GROUP BY count, bypassing
  // the 1000-row PostgREST limit.
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

  // Rank industries by shortfall ratio (count / baseline). Lowest first.
  const ranked = Object.entries(INDUSTRY_BASELINES)
    .map(([industry, baseline]) => {
      const c = counts.get(industry) || 0;
      return { industry, count: c, baseline, ratio: c / baseline };
    })
    .sort((a, b) => a.ratio - b.ratio);

  const targets = ranked.slice(0, count);

  const dispatched: any[] = [];

  const dispatch = async () => {
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/fetch-external-jobs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
            // Reuses the existing Adzuna quota guard in fetch-external-jobs —
            // any trigger string OTHER than "daily-adzuna" /
            // "industry-health-monitor-morning" / "manual" still skips Adzuna
            // because of the explicit `=== "industry-health-monitor"` check;
            // we forward that exact value to be safe.
            "x-trigger-source": "industry-health-monitor",
            "x-recovery-source": "emergency-topup",
          },
          body: JSON.stringify({ industry: t.industry }),
        });
        dispatched.push({ industry: t.industry, count: t.count, baseline: t.baseline, status: res.status });
        console.log(`[emergency-topup] dispatched ${t.industry} (count=${t.count}/${t.baseline}, ratio=${t.ratio.toFixed(2)}) → ${res.status}`);
      } catch (e: any) {
        dispatched.push({ industry: t.industry, error: e?.message || String(e) });
        console.error(`[emergency-topup] dispatch ${t.industry} failed:`, e);
      }
      if (i < targets.length - 1) await new Promise((r) => setTimeout(r, staggerMs));
    }
  };

  if (!dryRun) {
    // @ts-ignore EdgeRuntime is provided by Supabase Edge Functions.
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(dispatch());
    } else {
      dispatch();
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      started_at: startedAt.toISOString(),
      dry_run: dryRun,
      targets,
      dispatched: dryRun ? [] : "running in background",
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
