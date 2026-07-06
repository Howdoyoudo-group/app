// Scoring eval harness — compares matching algorithm variants against
// real swipe history (liked/saved = positive, dismissed = negative).
//
// Usage:
//   # Build a fixture from prod (read-only) and evaluate:
//   SUPABASE_URL=… HDYD_SERVICE_JWT=… deno run --allow-net --allow-env --allow-read --allow-write \
//     scripts/eval-scoring/run.ts --build-fixture
//
//   # Re-run offline against the saved fixture:
//   deno run --allow-read --allow-env scripts/eval-scoring/run.ts
//
//   # Choose algorithms and time-split:
//   deno run --allow-read --allow-env scripts/eval-scoring/run.ts --algo simple,v1 --train-before 2026-06-15
//
// Gate convention: a new algorithm variant must not lose to its predecessor
// on mean AUC (and should win on precision@10) before it ships.

import {
  scoreJob,
  type Job,
  type RoleRiasecProfile,
  type UserProfile,
  type LearnedSignals,
  buildLearnedSignals,
  getFreshnessBoost,
  shouldExcludeJob,
  passesSalaryFilter,
  SALARY_THRESHOLDS,
} from "../../supabase/functions/_shared/scoring/score-job.ts";
import { bootstrapCI, mrr, pairwiseAUC, precisionAtK } from "./metrics.ts";
import { buildFixture, loadFixture, saveFixture, type EvalUser, type Fixture } from "./fixture.ts";

const FIXTURE_PATH = "scripts/eval-scoring/fixture.json";

// ───── Algorithm registry ────────────────────────────────────────────────────
// Each algorithm is a pure function (job, user, ctx) → score. Register new
// variants here; every eval run can compare any subset via --algo.

interface AlgoContext {
  roleProfiles: Map<string, RoleRiasecProfile>;
  learned?: LearnedSignals;
}

type ScoreFn = (job: Job, profile: UserProfile, ctx: AlgoContext) => number;

const ALGORITHMS: Record<string, ScoreFn> = {
  // The crude server-side pre-scorer formula from score-new-jobs (pre-unification).
  // Kept as the harness's own smoke test: the full scorer must beat this.
  simple: (job, profile) => {
    let score = 0;
    const interests = (profile.industry_interests || []).map((i) => i.toLowerCase());
    if (job.industry && interests.some((i) => job.industry!.toLowerCase().includes(i) || i.includes(job.industry!.toLowerCase()))) {
      score += 40;
    }
    if (job.career_level && profile.career_level && job.career_level.toLowerCase() === profile.career_level.toLowerCase()) {
      score += 20;
    }
    const roles = profile.role_preferences || [];
    if (roles.some((r) => job.title.toLowerCase().includes(r.toLowerCase()))) score += 20;
    if (job.salary) score += 5;
    score += Math.min(15, getFreshnessBoost(job.created_at));
    return score;
  },

  // Current canonical shared scorer, profile signals only (no swipe-derived
  // learning, so scores are honest for jobs the user hasn't seen).
  v1: (job, profile, ctx) => scoreJob(job, profile, ctx.roleProfiles).score,

  // Shared scorer + learned signals built from training-window swipes.
  // Only meaningful with --train-before (otherwise it leaks test labels).
  v1_learned: (job, profile, ctx) => scoreJob(job, profile, ctx.roleProfiles, ctx.learned).score,
};

// ───── Evaluation ────────────────────────────────────────────────────────────

interface UserResult {
  user_id: string;
  n_pos: number;
  n_neg: number;
  auc: number | null;
  p10: number | null;
  mrr: number | null;
}

function evaluateUser(
  user: EvalUser,
  fixture: Fixture,
  scoreFn: ScoreFn,
  roleProfiles: Map<string, RoleRiasecProfile>,
  trainBefore: Date | null,
): UserResult | null {
  // Split events: with --train-before, events before the cutoff feed learned
  // signals and events after are the test set. Without it, everything is test.
  const inTest = (at: string) => !trainBefore || new Date(at) >= trainBefore;
  const inTrain = (at: string) => trainBefore && new Date(at) < trainBefore;

  const testPos = [...user.liked, ...user.saved].filter((e) => inTest(e.at));
  const testNeg = user.dismissed.filter((e) => inTest(e.at));

  const posJobs = testPos.map((e) => fixture.jobs[e.job_id]).filter(Boolean);
  const negJobs = testNeg.map((e) => fixture.jobs[e.job_id]).filter(Boolean);
  if (posJobs.length === 0 || negJobs.length === 0) return null;

  let learned: LearnedSignals | undefined;
  if (trainBefore) {
    const trainPosIds = new Set(
      [...user.liked, ...user.saved].filter((e) => inTrain(e.at)).map((e) => e.job_id),
    );
    const trainNegIds = new Set(user.dismissed.filter((e) => inTrain(e.at)).map((e) => e.job_id));
    const trainJobs = [...trainPosIds, ...trainNegIds]
      .map((id) => fixture.jobs[id])
      .filter(Boolean);
    learned = buildLearnedSignals(trainJobs, trainNegIds, trainPosIds);
  }

  const ctx: AlgoContext = { roleProfiles, learned };

  const posScores = posJobs.map((j) => scoreFn(j, user.profile, ctx));
  const negScores = negJobs.map((j) => scoreFn(j, user.profile, ctx));

  // Ranked pool for precision@10 / MRR: positives + negatives + shared random
  // pool. Mirror the production funnel: hard exclusions + salary filter run
  // BEFORE ranking in every consumer, so pool jobs the user would never be
  // shown must not count against the ranker. Labeled jobs are kept regardless
  // (they were provably shown to the user).
  const positiveIds = new Set(posJobs.map((j) => j.id));
  const minSalary = user.profile.salary_expectation
    ? SALARY_THRESHOLDS[user.profile.salary_expectation] || 0
    : 0;
  const poolJobs = fixture.pool_ids
    .map((id) => fixture.jobs[id])
    .filter(Boolean)
    .filter((j) => !shouldExcludeJob(j, user.profile) && passesSalaryFilter(j, minSalary));
  const ranked = [...posJobs, ...negJobs, ...poolJobs]
    .map((j) => ({ id: j.id, score: scoreFn(j, user.profile, ctx) }))
    .sort((a, b) => b.score - a.score);

  return {
    user_id: user.user_id,
    n_pos: posJobs.length,
    n_neg: negJobs.length,
    auc: pairwiseAUC(posScores, negScores),
    p10: precisionAtK(ranked, positiveIds, 10),
    mrr: mrr(ranked, positiveIds),
  };
}

function summarize(name: string, results: UserResult[]): void {
  const aucs = results.map((r) => r.auc).filter((v): v is number => v !== null);
  const p10s = results.map((r) => r.p10).filter((v): v is number => v !== null);
  const mrrs = results.map((r) => r.mrr).filter((v): v is number => v !== null);

  const auc = bootstrapCI(aucs);
  const p10 = bootstrapCI(p10s);
  const m = bootstrapCI(mrrs);

  console.log(`\n── ${name} ─ ${results.length} users ─────────────────────────`);
  if (auc) console.log(`  AUC          ${auc.mean.toFixed(3)}  [${auc.lo.toFixed(3)}, ${auc.hi.toFixed(3)}]`);
  if (p10) console.log(`  Precision@10 ${p10.mean.toFixed(3)}  [${p10.lo.toFixed(3)}, ${p10.hi.toFixed(3)}]`);
  if (m) console.log(`  MRR          ${m.mean.toFixed(3)}  [${m.lo.toFixed(3)}, ${m.hi.toFixed(3)}]`);
}

// ───── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = new Map<string, string>();
  const argv = [...Deno.args];
  while (argv.length) {
    const a = argv.shift()!;
    if (a.startsWith("--")) args.set(a.slice(2), argv[0]?.startsWith("--") || argv.length === 0 ? "true" : argv.shift()!);
  }

  let fixture: Fixture;
  if (args.has("build-fixture")) {
    fixture = await buildFixture({ seed: Number(args.get("seed") ?? 42) });
    await saveFixture(fixture, FIXTURE_PATH);
  } else {
    try {
      fixture = await loadFixture(FIXTURE_PATH);
      console.log(`Loaded fixture from ${FIXTURE_PATH} (built ${fixture.built_at}, ${fixture.users.length} users)`);
    } catch {
      console.error(`No fixture at ${FIXTURE_PATH}. Run with --build-fixture first (needs SUPABASE_URL + HDYD_SERVICE_JWT).`);
      Deno.exit(1);
    }
  }

  // Neutralise freshness: labeled jobs were fresh when swiped but are stale at
  // eval time, while the random pool is brand new — comparing them with live
  // freshness boosts measures recency, not preference. Age every job past the
  // freshness window so the boost is uniformly zero. (--live-freshness to keep.)
  if (!args.has("live-freshness")) {
    const staleDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    for (const id of Object.keys(fixture.jobs)) {
      fixture.jobs[id] = { ...fixture.jobs[id], created_at: staleDate };
    }
    console.log("Freshness neutralised (pass --live-freshness to disable).");
  }

  const algoNames = (args.get("algo") ?? "simple,v1").split(",").map((s) => s.trim());
  const trainBefore = args.has("train-before") ? new Date(args.get("train-before")!) : null;
  if (trainBefore) console.log(`Time split: training on events before ${trainBefore.toISOString()}`);

  const roleProfiles = new Map(
    fixture.role_profiles.map((rp) => [rp.role_category.toLowerCase(), rp]),
  );

  for (const name of algoNames) {
    const fn = ALGORITHMS[name];
    if (!fn) {
      console.error(`Unknown algorithm "${name}". Available: ${Object.keys(ALGORITHMS).join(", ")}`);
      Deno.exit(1);
    }
    const results = fixture.users
      .map((u) => evaluateUser(u, fixture, fn, roleProfiles, trainBefore))
      .filter((r): r is UserResult => r !== null);
    summarize(name, results);

    if (args.has("per-user")) {
      console.log("  user                                  pos  neg   AUC    P@10");
      for (const r of results) {
        console.log(
          `  ${r.user_id}  ${String(r.n_pos).padStart(3)}  ${String(r.n_neg).padStart(3)}   ${r.auc?.toFixed(2) ?? " —  "}   ${r.p10?.toFixed(2) ?? "—"}`,
        );
      }
    }
  }

  console.log(
    "\nMetric hierarchy:" +
    "\n  AUC (labeled swipes) — PRIMARY GATE: both sides are real user decisions." +
    "\n  P@10 / MRR (vs pool) — diagnostic only: pool jobs are unlabeled, not negatives," +
    "\n    so richer scorers get punished for surfacing good jobs the user never saw." +
    "\nKnown bias: labels come from jobs the previous algorithm chose to surface." +
    "\nGate: a new variant must match or beat its predecessor on AUC before shipping.",
  );
}

if (import.meta.main) await main();
