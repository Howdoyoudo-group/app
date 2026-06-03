import { RenderTuning, defaultTuning, Scores } from "./types";

export interface RebalanceContext {
  tuning: RenderTuning;
  scores: Scores;
  iteration: number;
}

/** Mutate (return new) tuning toward a balanced layout. */
export function nextTuning(ctx: RebalanceContext): RenderTuning {
  const { tuning, scores } = ctx;
  const next: RenderTuning = { ...tuning };
  const overP1 = scores.fillP1 > 1 || scores.fillP1 > 0.99;
  const overP2 = scores.fillP2 > 1 || scores.fillP2 > 0.99;
  const underP1 = scores.fillP1 < 0.85;
  const underP2 = scores.fillP2 < 0.85;

  if (overP1) {
    next.passionsCap = Math.max(8, next.passionsCap - 4);
    next.industriesCap = Math.max(6, next.industriesCap - 3);
    next.lovesCap = Math.max(4, next.lovesCap - 2);
    next.funFactsCap = Math.max(2, next.funFactsCap - 1);
    if (next.passionsCap <= 8) next.density = "tight";
  }
  if (overP2) {
    next.workDescCap = Math.max(140, Math.floor(next.workDescCap * 0.7));
    next.workSummaryRatio = Math.max(0.4, next.workSummaryRatio - 0.15);
  }
  if (underP1) {
    next.passionsCap = Math.min(28, next.passionsCap + 4);
    next.industriesCap = Math.min(20, next.industriesCap + 3);
    next.lovesCap = Math.min(9, next.lovesCap + 2);
    next.funFactsCap = Math.min(6, next.funFactsCap + 1);
    next.showPullQuote = true;
    next.fillerPromptAnswers = true;
  }
  if (underP2) {
    next.workDescCap = Math.min(560, next.workDescCap + 80);
    next.fillerSkills = true;
  }
  return next;
}

export function shouldSwitchTemplate(scores: Scores, iteration: number): boolean {
  if (iteration < 3) return false;
  return scores.printSafe === 0 || scores.fill < 0.7 || scores.balance < 0.65;
}

export { defaultTuning };
