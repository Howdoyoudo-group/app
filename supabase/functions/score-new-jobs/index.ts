// score-new-jobs: server-side pre-scoring of job matches per user.
// Runs after each scrape (6:30am and 6:30pm UTC) to populate the
// job_matches table so the frontend can fetch a pre-ranked pool
// instead of paginating 2,000 rows and scoring everything in browser.
//
// Uses the SAME shared scoreJob as the inbox and every digest — full profile
// signals (industry, role, passions, RIASEC, work values, target companies),
// learned signals from the user's swipe history, and behavioural affinity
// from their browsing. The browser re-runs scoreJob on the fetched pool for
// display, so ordering here and ordering there can never disagree.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  scoreJob,
  shouldExcludeJob,
  passesSalaryFilter,
  buildLearnedSignals,
  isLiveJob,
  expandIndustrySlugs,
  SALARY_THRESHOLDS,
  type IndustryAffinity,
  type Job,
  type RoleRiasecProfile,
  type UserProfile,
} from "../_shared/scoring/score-job.ts";
import { buildPreferenceDoc } from "../_shared/scoring/preference-doc.ts";
import { getAdjacentIndustries } from "../_shared/scoring/industry-adjacency.ts";

const ALGORITHM_VERSION = 2; // v2 = unified scorer + semantic + discovery pool

// Pool split: ~70% core (declared industries), ~30% discovery (adjacent /
// semantic / passion bridges outside declared industries).
const CORE_LIMIT = 140;
const DISCOVERY_LIMIT = 60;

// Discovery cards must clear a floor so "adjacent" never means "random".
const DISCOVERY_MIN_SCORE = 45;
const DISCOVERY_SEMANTIC_BRIDGE = 0.55;

declare const EdgeRuntime: { waitUntil?: (p: Promise<unknown>) => void } | undefined;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY =
  Deno.env.get("HDYD_SERVICE_JWT") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Embed the user's preference document (same model + dims as embed-jobs so
// cosine similarity between user and job vectors is meaningful).
async function embedPreferenceDoc(text: string): Promise<number[] | null> {
  if (!GEMINI_API_KEY || !text.trim()) return null;
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/embeddings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gemini-embedding-001", input: text, dimensions: 768 }),
    },
  );
  if (!res.ok) {
    console.error(`preference embedding failed ${res.status}: ${await res.text()}`);
    return null;
  }
  const data = await res.json();
  return data.data?.[0]?.embedding ?? null;
}

const JOB_COLUMNS =
  "id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags, expires_at";

// Mirror of the client's useBehavioralAffinity hook (plain data, no React).
const AFFINITY_WEIGHTS: Record<string, number> = {
  job_click: 3,
  marketplace_search: 2,
  industry_view: 1,
};
function affinityDecay(createdAt: string): number {
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  if (ageDays <= 7) return 1.0;
  if (ageDays <= 14) return 0.6;
  if (ageDays <= 30) return 0.3;
  return 0;
}

interface ProfileRow extends UserProfile {
  id: string;
}

type Client = ReturnType<typeof createClient>;

async function buildBehavioralAffinity(supabase: Client, userId: string): Promise<IndustryAffinity | null> {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("user_interactions")
    .select("interaction_type, industry, created_at, metadata")
    .eq("user_id", userId)
    .gte("created_at", since);
  if (!data?.length) return null;

  const raw = new Map<string, number>();
  for (const row of data) {
    const ind = (row.industry as string | null)?.toLowerCase().trim();
    if (!ind) continue;
    const source = (row.metadata as Record<string, unknown> | null)?.source as string | undefined;
    const type =
      source === "marketplace_filter" ? "industry_view" :
      source === "marketplace_search" ? "marketplace_search" :
      (row.interaction_type as string);
    const weight = AFFINITY_WEIGHTS[type] ?? 0;
    if (weight === 0) continue;
    raw.set(ind, (raw.get(ind) ?? 0) + weight * affinityDecay(row.created_at as string));
  }
  const THRESHOLD = 5;
  const scores = new Map<string, number>();
  let max = 0;
  for (const [ind, score] of raw) {
    if (score >= THRESHOLD) {
      scores.set(ind, score);
      if (score > max) max = score;
    }
  }
  return max > 0 ? { scores, max } : null;
}

async function scoreForUser(
  supabase: Client,
  profile: ProfileRow,
  roleProfiles: Map<string, RoleRiasecProfile>,
) {
  const interests = profile.industry_interests ?? [];
  if (interests.length === 0) return;

  const industrySlugs = expandIndustrySlugs(interests);
  if (industrySlugs.length === 0) return;

  const now = new Date().toISOString();

  // Swipe history: excluded from the pool AND fed into learned signals.
  const [dismissedRes, likedRes, interactionsPromise] = await Promise.all([
    supabase.from("dismissed_jobs").select("job_id, reason").eq("user_id", profile.id),
    supabase.from("liked_jobs").select("job_id, liked_at").eq("user_id", profile.id),
    buildBehavioralAffinity(supabase, profile.id),
  ]);
  const dismissedIds = new Set<string>(
    (dismissedRes.data ?? []).filter((r) => r.reason === "dismissed").map((r) => r.job_id as string),
  );
  const openedIds = new Set<string>(
    (dismissedRes.data ?? []).filter((r) => r.reason === "opened").map((r) => r.job_id as string),
  );
  const likedIds = new Set<string>((likedRes.data ?? []).map((r) => r.job_id as string));
  const behavioralAffinity = interactionsPromise;

  // Refresh the user's preference embedding when new likes/saves have landed
  // since it was last computed (or it has never been computed).
  const [savedRes, { data: profRow }] = await Promise.all([
    supabase.from("saved_jobs").select("job_id, created_at").eq("user_id", profile.id),
    supabase.from("profiles").select("preference_embedded_at, updated_at").eq("id", profile.id).single(),
  ]);
  const savedIds = new Set<string>((savedRes.data ?? []).map((r) => r.job_id as string));
  const prof = profRow as { preference_embedded_at?: string | null; updated_at?: string | null } | null;
  const embeddedAt = prof?.preference_embedded_at ? new Date(prof.preference_embedded_at) : null;
  const profileUpdatedAt = prof?.updated_at ? new Date(prof.updated_at) : null;
  const needsRefresh =
    !embeddedAt ||
    (profileUpdatedAt !== null && profileUpdatedAt > embeddedAt) ||
    (likedRes.data ?? []).some((r) => {
      const at = (r as { liked_at?: string }).liked_at;
      return at !== undefined && new Date(at) > embeddedAt;
    }) ||
    (savedRes.data ?? []).some((r) => {
      const at = (r as { created_at?: string }).created_at;
      return at !== undefined && new Date(at) > embeddedAt;
    });

  if (needsRefresh) {
    const positiveIds = [...new Set([...likedIds, ...savedIds])].slice(-40);
    let recentPositives: { title: string; company: string | null }[] = [];
    if (positiveIds.length > 0) {
      const { data } = await supabase
        .from("jobs")
        .select("title, company")
        .in("id", positiveIds)
        .limit(20);
      recentPositives = (data ?? []) as { title: string; company: string | null }[];
    }
    const vector = await embedPreferenceDoc(buildPreferenceDoc(profile, recentPositives));
    if (vector) {
      await supabase
        .from("profiles")
        .update({
          preference_embedding: JSON.stringify(vector),
          preference_embedded_at: now,
        })
        .eq("id", profile.id);
    }
  }

  // Candidate pool: recent live jobs in the user's industries, a slice of the
  // newest jobs from ANY industry (passion/target-company/intersection matches
  // outside declared industries), and the top jobs by semantic similarity to
  // the user's preference embedding (discovery sourcing).
  const [industryJobsRes, anyJobsRes, semanticTopRes] = await Promise.all([
    supabase
      .from("jobs")
      .select(JOB_COLUMNS)
      .in("industry", industrySlugs)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(600),
    supabase
      .from("jobs")
      .select(JOB_COLUMNS)
      .not("industry", "in", `(${industrySlugs.join(",")})`)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.rpc("top_jobs_semantic", { p_user_id: profile.id, p_limit: 200 }),
  ]);

  const candidates = new Map<string, Job>();
  for (const j of [...(industryJobsRes.data ?? []), ...(anyJobsRes.data ?? [])] as unknown as Job[]) {
    candidates.set(j.id, j);
  }

  // Hydrate semantic-sourced jobs not already in the pool.
  const semanticSourcedIds = ((semanticTopRes.data ?? []) as { job_id: string }[])
    .map((r) => r.job_id)
    .filter((id) => !candidates.has(id));
  for (let i = 0; i < semanticSourcedIds.length; i += 100) {
    const { data } = await supabase
      .from("jobs")
      .select(JOB_COLUMNS)
      .in("id", semanticSourcedIds.slice(i, i + 100));
    for (const j of (data ?? []) as unknown as Job[]) candidates.set(j.id, j);
  }
  if (candidates.size === 0) return;

  // Semantic similarity for every candidate in one round trip.
  const semanticScores = new Map<string, number>();
  const allIds = [...candidates.keys()];
  for (let i = 0; i < allIds.length; i += 500) {
    const { data } = await supabase.rpc("match_jobs_semantic", {
      p_user_id: profile.id,
      p_job_ids: allIds.slice(i, i + 500),
    });
    for (const r of (data ?? []) as { job_id: string; similarity: number }[]) {
      semanticScores.set(r.job_id, r.similarity);
    }
  }

  // Learned signals need the job rows for the user's swipe history.
  const historyIds = [...dismissedIds, ...openedIds, ...likedIds].filter((id) => !candidates.has(id));
  const historyJobs: Job[] = [];
  for (let i = 0; i < historyIds.length; i += 100) {
    const { data } = await supabase
      .from("jobs")
      .select(JOB_COLUMNS)
      .in("id", historyIds.slice(i, i + 100));
    historyJobs.push(...((data ?? []) as unknown as Job[]));
  }
  const learned = buildLearnedSignals(
    [...candidates.values(), ...historyJobs],
    dismissedIds,
    openedIds,
    likedIds,
  );

  const minSalary = profile.salary_expectation
    ? SALARY_THRESHOLDS[profile.salary_expectation] || 0
    : 0;

  const slugSet = new Set(industrySlugs);
  const adjacent = getAdjacentIndustries(industrySlugs);

  interface ScoredRow {
    job_id: string;
    score: number;
    semantic: number | null;
    kind: "core" | "discovery";
  }
  const core: ScoredRow[] = [];
  const discovery: ScoredRow[] = [];

  for (const job of candidates.values()) {
    if (dismissedIds.has(job.id) || likedIds.has(job.id)) continue;
    if (!isLiveJob(job)) continue;
    if (shouldExcludeJob(job, profile)) continue;
    if (!passesSalaryFilter(job, minSalary)) continue;

    const semanticSimilarity = semanticScores.get(job.id);
    const { score, matches } = scoreJob(job, profile, {
      roleProfiles,
      learned,
      behavioralAffinity,
      semanticSimilarity,
    });

    const jobSlug = (job.industry ?? "").toLowerCase();
    if (slugSet.has(jobSlug)) {
      core.push({ job_id: job.id, score, semantic: semanticSimilarity ?? null, kind: "core" });
      continue;
    }

    // Discovery: outside declared industries, needs ≥2 independent bridge
    // signals so an adjacent suggestion never feels random.
    let bridges = 0;
    if ((semanticSimilarity ?? 0) >= DISCOVERY_SEMANTIC_BRIDGE) bridges++;
    if (adjacent.has(jobSlug)) bridges++;
    if (matches.some((m) => m.startsWith("Passion post"))) bridges++;
    if (matches.includes("Skills")) bridges++;
    if (matches.includes("Intersection match")) bridges++;
    if (matches.some((m) => m.startsWith("Wanted"))) bridges++;
    if (bridges >= 2 && score >= DISCOVERY_MIN_SCORE) {
      discovery.push({ job_id: job.id, score, semantic: semanticSimilarity ?? null, kind: "discovery" });
    }
  }

  core.sort((a, b) => b.score - a.score);
  discovery.sort((a, b) => b.score - a.score);
  const top = [...core.slice(0, CORE_LIMIT), ...discovery.slice(0, DISCOVERY_LIMIT)];
  if (top.length === 0) return;

  const rows = top.map((s) => ({
    user_id: profile.id,
    job_id: s.job_id,
    score: s.score,
    semantic_score: s.semantic,
    match_kind: s.kind,
    algorithm_version: ALGORITHM_VERSION,
    computed_at: now,
  }));

  await supabase.from("job_matches").upsert(rows, { onConflict: "user_id,job_id" });
}

Deno.serve(async (req) => {
  // No incoming auth previously. verify_jwt is false, so this in-code check
  // is the only gate against someone repeatedly triggering a full rescore.
  if (req.headers.get("Authorization") !== `Bearer ${Deno.env.get("HDYD_SERVICE_JWT")}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const work = (async () => {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY) as unknown as Client;

    const [{ data: profiles, error: pErr }, { data: roleProfileRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, industry_interests, career_level, role_preferences, location_preference, salary_expectation, job_preferences, understand_me_results, riasec_scores, work_values",
        )
        .not("industry_interests", "is", null),
      supabase.from("role_riasec_profiles").select("role_category, riasec_scores, work_values"),
    ]);

    if (pErr) {
      console.error("Failed to fetch profiles:", pErr.message);
      return;
    }

    const roleProfiles = new Map<string, RoleRiasecProfile>(
      ((roleProfileRows ?? []) as unknown as RoleRiasecProfile[]).map((rp) => [
        rp.role_category.toLowerCase(),
        rp,
      ]),
    );

    const active = ((profiles ?? []) as unknown as ProfileRow[]).filter(
      (p) => (p.industry_interests ?? []).length > 0,
    );

    console.log(`Scoring jobs for ${active.length} users (unified scorer)`);

    for (const profile of active) {
      try {
        await scoreForUser(supabase, profile, roleProfiles);
      } catch (e) {
        console.error(`Failed to score for user ${profile.id}:`, e);
      }
    }

    // Prune entries older than 14 days — keeps the table lean
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const { error: pruneErr } = await supabase
      .from("job_matches")
      .delete()
      .lt("computed_at", cutoff.toISOString());

    if (pruneErr) console.error("Prune failed:", pruneErr.message);

    console.log(`score-new-jobs complete for ${active.length} users`);
  })();

  if (
    typeof EdgeRuntime !== "undefined" &&
    (EdgeRuntime as unknown as { waitUntil?: (p: Promise<unknown>) => void })?.waitUntil
  ) {
    (EdgeRuntime as unknown as { waitUntil: (p: Promise<unknown>) => void }).waitUntil(work);
  } else {
    await work;
  }

  return new Response(JSON.stringify({ accepted: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
