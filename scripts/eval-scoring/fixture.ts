// Fixture builder for the scoring eval harness.
//
// Pulls ground-truth swipe data (liked / saved / dismissed), the matching
// user profiles, the labeled jobs, a seeded random pool of live jobs, and
// role RIASEC profiles from Supabase, then snapshots everything to a local
// JSON file so eval runs are deterministic and repeatable offline.
//
// Env required (read-only usage):
//   SUPABASE_URL       — https://<ref>.supabase.co
//   HDYD_SERVICE_JWT   — service-role JWT (never committed; export from memory file)

import type { Job, RoleRiasecProfile, UserProfile } from "../../supabase/functions/_shared/scoring/score-job.ts";
import { seededRng } from "./metrics.ts";

export interface LabeledEvent {
  job_id: string;
  at: string; // ISO timestamp of the event (for time-split evals)
}

export interface EvalUser {
  user_id: string;
  profile: UserProfile;
  liked: LabeledEvent[];
  saved: LabeledEvent[];
  dismissed: LabeledEvent[];
}

export interface Fixture {
  built_at: string;
  seed: number;
  users: EvalUser[];
  /** All jobs referenced by labels plus the random pool, keyed by id. */
  jobs: Record<string, Job>;
  /** Ids of the seeded random live-job pool (shared across users). */
  pool_ids: string[];
  role_profiles: RoleRiasecProfile[];
}

const JOB_COLUMNS =
  "id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags, expires_at";

function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

async function rest<T>(path: string): Promise<T> {
  const url = `${env("SUPABASE_URL")}/rest/v1/${path}`;
  const key = env("HDYD_SERVICE_JWT");
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()} — ${path}`);
  return res.json();
}

async function fetchJobsByIds(ids: string[]): Promise<Job[]> {
  const out: Job[] = [];
  // PostgREST in-list URLs get long; chunk to 100 ids per request.
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const rows = await rest<Job[]>(
      `jobs?id=in.(${chunk.join(",")})&select=${encodeURIComponent(JOB_COLUMNS)}`,
    );
    out.push(...rows);
  }
  return out;
}

export async function buildFixture(opts: {
  seed?: number;
  poolSize?: number;
  minPositives?: number;
  minNegatives?: number;
}): Promise<Fixture> {
  const seed = opts.seed ?? 42;
  const poolSize = opts.poolSize ?? 500;
  const minPos = opts.minPositives ?? 3;
  const minNeg = opts.minNegatives ?? 3;

  console.log("Fetching swipe events…");
  const [liked, saved, dismissed] = await Promise.all([
    rest<{ user_id: string; job_id: string; liked_at: string }[]>(
      "liked_jobs?select=user_id,job_id,liked_at&limit=10000",
    ),
    rest<{ user_id: string; job_id: string; created_at: string }[]>(
      "saved_jobs?select=user_id,job_id,created_at&limit=10000",
    ),
    rest<{ user_id: string; job_id: string; dismissed_at: string; reason: string | null }[]>(
      "dismissed_jobs?select=user_id,job_id,dismissed_at,reason&reason=eq.dismissed&limit=20000",
    ),
  ]);

  // Group events per user.
  const byUser = new Map<string, { liked: LabeledEvent[]; saved: LabeledEvent[]; dismissed: LabeledEvent[] }>();
  const bucket = (uid: string) => {
    let b = byUser.get(uid);
    if (!b) { b = { liked: [], saved: [], dismissed: [] }; byUser.set(uid, b); }
    return b;
  };
  for (const r of liked) bucket(r.user_id).liked.push({ job_id: r.job_id, at: r.liked_at });
  for (const r of saved) bucket(r.user_id).saved.push({ job_id: r.job_id, at: r.created_at });
  for (const r of dismissed) bucket(r.user_id).dismissed.push({ job_id: r.job_id, at: r.dismissed_at });

  // Keep users with enough signal on both sides.
  const eligible = [...byUser.entries()].filter(([, b]) => {
    const pos = b.liked.length + b.saved.length;
    return pos >= minPos && b.dismissed.length >= minNeg;
  });
  console.log(`${byUser.size} users with events; ${eligible.length} eligible (≥${minPos} positives, ≥${minNeg} negatives)`);
  if (eligible.length === 0) throw new Error("No eligible users — cannot build fixture");

  console.log("Fetching profiles…");
  const userIds = eligible.map(([uid]) => uid);
  const profiles = await rest<(UserProfile & { id: string })[]>(
    `profiles?id=in.(${userIds.join(",")})&select=id,career_level,industry_interests,location_preference,role_preferences,salary_expectation,understand_me_results,riasec_scores,work_values,job_preferences`,
  );
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const users: EvalUser[] = eligible
    .filter(([uid]) => profileMap.has(uid))
    .map(([uid, b]) => ({
      user_id: uid,
      profile: profileMap.get(uid)!,
      liked: b.liked,
      saved: b.saved,
      dismissed: b.dismissed,
    }));

  console.log("Fetching labeled jobs…");
  const labeledIds = [
    ...new Set(users.flatMap((u) => [...u.liked, ...u.saved, ...u.dismissed].map((e) => e.job_id))),
  ];
  const labeledJobs = await fetchJobsByIds(labeledIds);

  console.log("Sampling random live-job pool…");
  // Seeded sample: fetch a wide window of live job ids, shuffle deterministically.
  const liveIds = await rest<{ id: string }[]>(
    `jobs?select=id&expires_at=gt.${new Date().toISOString()}&order=created_at.desc&limit=10000`,
  );
  const rng = seededRng(seed);
  const shuffled = liveIds.map((r) => r.id);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const labeledSet = new Set(labeledIds);
  const poolIds = shuffled.filter((id) => !labeledSet.has(id)).slice(0, poolSize);
  const poolJobs = await fetchJobsByIds(poolIds);

  console.log("Fetching role RIASEC profiles…");
  const roleProfiles = await rest<RoleRiasecProfile[]>(
    "role_riasec_profiles?select=role_category,riasec_scores,work_values",
  );

  const jobs: Record<string, Job> = {};
  for (const j of [...labeledJobs, ...poolJobs]) jobs[j.id] = j;

  return {
    built_at: new Date().toISOString(),
    seed,
    users,
    jobs,
    pool_ids: poolIds,
    role_profiles: roleProfiles,
  };
}

export async function saveFixture(fixture: Fixture, path: string): Promise<void> {
  await Deno.writeTextFile(path, JSON.stringify(fixture));
  console.log(`Fixture saved → ${path} (${fixture.users.length} users, ${Object.keys(fixture.jobs).length} jobs)`);
}

export async function loadFixture(path: string): Promise<Fixture> {
  return JSON.parse(await Deno.readTextFile(path));
}
