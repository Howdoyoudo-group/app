// compute-curiosity-scores: daily composite "curiosity score" per user.
//
// Blends 5 independent engagement-signal categories - the interaction log,
// job saves/likes, Job Tracker pipeline depth, feed saves, and course/badge
// completions - each with its own recency decay and capped so no single
// category can dominate, combined with a breadth multiplier that rewards
// engaging across multiple areas over one obsessive signal. The result is
// converted to a percentile rank (0-100) across all profiles, so the score
// always means "more platform-wide curiosity than N% of candidates" - self-
// calibrating as the user base grows, rather than a fixed threshold that
// would need re-tuning.
//
// Reuses the weight+recency-decay shape of useBehavioralAffinity()
// (src/hooks/useTrackInteraction.ts) but persists server-side instead of
// recomputing client-side on every page load, and extends it from 3 signal
// types to all 5 categories. Surfaced to employers in EmployerDashboard.tsx
// and blended into computeMatch() there.
//
// Modeled on score-new-jobs/index.ts's service-role + EdgeRuntime.waitUntil
// pattern. Deploys with verify_jwt = false (see supabase/config.toml) and
// checks the HDYD_SERVICE_JWT bearer itself, per this project's documented
// cron-auth convention (Supabase's own key-rotation has silently broken
// verify_jwt-gated crons here before).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

declare const EdgeRuntime: { waitUntil?: (p: Promise<unknown>) => void } | undefined;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DAY_MS = 86_400_000;
const CATEGORY_CAP = 30;

const cutoffIso = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString();
const ageDays = (iso: string) => (Date.now() - new Date(iso).getTime()) / DAY_MS;

// Fast decay - page-view-grade signals (interaction log).
const decayFast = (days: number) => (days <= 7 ? 1.0 : days <= 14 ? 0.6 : days <= 30 ? 0.3 : 0);
// Medium decay - deliberate saves and tracker activity.
const decayMedium = (days: number) => (days <= 30 ? 1.0 : days <= 60 ? 0.6 : days <= 90 ? 0.3 : 0);
// Slow decay - real accomplishments (course/badge completions).
const decaySlow = (days: number) => (days <= 90 ? 1.0 : days <= 180 ? 0.6 : days <= 365 ? 0.3 : 0);

const INTERACTION_WEIGHTS: Record<string, number> = {
  job_click: 3,
  marketplace_search: 2,
  industry_view: 1,
  company_view: 2,
  help_apply: 5,
  save_company: 4,
  save_role: 4,
  save_industry: 3,
  career_map_role_link: 2,
  career_map_ncs_link: 2,
};

const TRACKER_STATUS_WEIGHTS: Record<string, number> = {
  wishlist: 2,
  applied: 8,
  interviewing: 12,
  offer: 16,
  rejected: 6,
  withdrawn: 4,
};

Deno.serve(async (req) => {
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${Deno.env.get("HDYD_SERVICE_JWT")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const work = (async () => {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: profiles } = await supabase.from("profiles").select("id");
    const ids = (profiles ?? []).map((p) => p.id as string);
    if (ids.length === 0) return;

    const [interactions, savedJobs, likedJobs, trackerItems, feedSaves, courseProgress, badges] =
      await Promise.all([
        supabase.from("user_interactions").select("user_id, interaction_type, created_at").gte("created_at", cutoffIso(35)),
        supabase.from("saved_jobs").select("user_id, created_at").gte("created_at", cutoffIso(95)),
        supabase.from("liked_jobs").select("user_id, liked_at").gte("liked_at", cutoffIso(95)),
        supabase.from("job_tracker_items").select("user_id, status, updated_at"),
        supabase.from("saved_feed_items").select("user_id, created_at").gte("created_at", cutoffIso(95)),
        supabase.from("skill_course_progress").select("user_id, completed_at").eq("passed", true).gte("completed_at", cutoffIso(370)),
        supabase.from("earned_badges").select("user_id, earned_at").gte("earned_at", cutoffIso(370)),
      ]);

    // subscores[user_id] = [cat1, cat2, cat3, cat4, cat5], each accumulated
    // raw (pre-cap) then capped once at the end.
    const subscores = new Map<string, [number, number, number, number, number]>();
    const bump = (userId: string | null | undefined, category: number, amount: number) => {
      if (!userId) return;
      const arr = subscores.get(userId) ?? [0, 0, 0, 0, 0];
      arr[category] += amount;
      subscores.set(userId, arr);
    };

    // 1. Interaction log - fast decay.
    (interactions.data ?? []).forEach((r: any) => {
      const weight = INTERACTION_WEIGHTS[r.interaction_type as string] ?? 0;
      if (weight === 0 || !r.created_at) return;
      bump(r.user_id, 0, weight * decayFast(ageDays(r.created_at)));
    });

    // 2. Job saves/likes - medium decay.
    (savedJobs.data ?? []).forEach((r: any) => {
      if (!r.created_at) return;
      bump(r.user_id, 1, 3 * decayMedium(ageDays(r.created_at)));
    });
    (likedJobs.data ?? []).forEach((r: any) => {
      if (!r.liked_at) return;
      bump(r.user_id, 1, 2 * decayMedium(ageDays(r.liked_at)));
    });

    // 3. Job Tracker pipeline depth - medium decay, weighted by how far
    // along the opportunity is (further = stronger demonstrated intent).
    (trackerItems.data ?? []).forEach((r: any) => {
      const weight = TRACKER_STATUS_WEIGHTS[r.status as string] ?? 0;
      if (weight === 0 || !r.updated_at) return;
      bump(r.user_id, 2, weight * decayMedium(ageDays(r.updated_at)));
    });

    // 4. Feed saves (articles/videos/news/briefings) - medium decay, flat
    // weight for v1 (no read/watch ground truth yet to weight types against).
    (feedSaves.data ?? []).forEach((r: any) => {
      if (!r.created_at) return;
      bump(r.user_id, 3, 2 * decayMedium(ageDays(r.created_at)));
    });

    // 5. Course/badge completions - slow decay, real accomplishments.
    (courseProgress.data ?? []).forEach((r: any) => {
      if (!r.completed_at) return;
      bump(r.user_id, 4, 10 * decaySlow(ageDays(r.completed_at)));
    });
    (badges.data ?? []).forEach((r: any) => {
      if (!r.earned_at) return;
      bump(r.user_id, 4, 15 * decaySlow(ageDays(r.earned_at)));
    });

    // Cap each category, apply the breadth multiplier, get one weighted_raw
    // per user (0 for users with no rows in `subscores` at all).
    const weightedRaw = new Map<string, { weighted: number; breadth: number }>();
    ids.forEach((id) => {
      const raw = subscores.get(id) ?? [0, 0, 0, 0, 0];
      const capped = raw.map((v) => Math.min(CATEGORY_CAP, v));
      const total = capped.reduce((a, b) => a + b, 0);
      const breadth = capped.filter((v) => v >= 3).length;
      const breadthMult = 0.6 + 0.4 * (breadth / 5);
      weightedRaw.set(id, { weighted: total * breadthMult, breadth });
    });

    // Percentile rank across ALL profiles (not just opted-in candidates) -
    // a privacy toggle shouldn't silently shift everyone else's percentile.
    const sorted = ids.slice().sort((a, b) => (weightedRaw.get(a)!.weighted - weightedRaw.get(b)!.weighted));
    const n = sorted.length;
    const now = new Date().toISOString();
    const rows = sorted.map((id, rank) => {
      const { weighted, breadth } = weightedRaw.get(id)!;
      return {
        id,
        curiosity_score: n > 1 ? Math.round((rank / (n - 1)) * 100) : 50,
        curiosity_score_raw: Math.round(weighted * 100) / 100,
        curiosity_breadth: breadth,
        curiosity_score_computed_at: now,
      };
    });

    for (let i = 0; i < rows.length; i += 500) {
      await supabase.from("profiles").upsert(rows.slice(i, i + 500), { onConflict: "id" });
    }
  })();

  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
    (EdgeRuntime as any).waitUntil(work);
  } else {
    await work;
  }

  return new Response(JSON.stringify({ accepted: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
