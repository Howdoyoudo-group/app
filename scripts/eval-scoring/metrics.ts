// Ranking metrics for the scoring eval harness.
// All metrics operate on plain number arrays so they stay decoupled from
// how scores were produced.

/** Pairwise AUC: P(random positive scores above random negative).
 *  Ties count as 0.5. Returns null when either side is empty. */
export function pairwiseAUC(posScores: number[], negScores: number[]): number | null {
  if (posScores.length === 0 || negScores.length === 0) return null;
  let wins = 0;
  let total = 0;
  for (const p of posScores) {
    for (const n of negScores) {
      total++;
      if (p > n) wins++;
      else if (p === n) wins += 0.5;
    }
  }
  return wins / total;
}

/** Precision@K over a ranked candidate list: fraction of the top K that are positives. */
export function precisionAtK(
  ranked: { id: string; score: number }[],
  positiveIds: Set<string>,
  k: number,
): number | null {
  if (ranked.length === 0 || positiveIds.size === 0) return null;
  const top = ranked.slice(0, k);
  const hits = top.filter((r) => positiveIds.has(r.id)).length;
  return hits / Math.min(k, top.length);
}

/** Mean reciprocal rank of the first positive in the ranked list. */
export function mrr(
  ranked: { id: string; score: number }[],
  positiveIds: Set<string>,
): number | null {
  if (ranked.length === 0 || positiveIds.size === 0) return null;
  for (let i = 0; i < ranked.length; i++) {
    if (positiveIds.has(ranked[i].id)) return 1 / (i + 1);
  }
  return 0;
}

/** Deterministic RNG (mulberry32) so pool sampling and bootstrap are reproducible. */
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bootstrap 95% CI for the mean of per-user metric values. */
export function bootstrapCI(
  values: number[],
  iterations = 2000,
  seed = 42,
): { mean: number; lo: number; hi: number } | null {
  if (values.length === 0) return null;
  const rng = seededRng(seed);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const means: number[] = [];
  for (let i = 0; i < iterations; i++) {
    let sum = 0;
    for (let j = 0; j < values.length; j++) {
      sum += values[Math.floor(rng() * values.length)];
    }
    means.push(sum / values.length);
  }
  means.sort((a, b) => a - b);
  return {
    mean,
    lo: means[Math.floor(iterations * 0.025)],
    hi: means[Math.floor(iterations * 0.975)],
  };
}
