import { supabase } from "@/integrations/supabase/client";

export interface SkillWithGap {
  id: string;
  skill_title: string;
  skill_type: "knowledge" | "skill" | "behaviour" | null;
  broad_domain: string | null;
  skill_area: string | null;
  rating: number | null;
  evidenced: boolean;
}

export interface DomainGap {
  domain: string;
  totalSkills: number;
  ratedSkills: number;
  readiness: number; // 0–100
  gapCount: number;  // skills rated < 3 or unrated
}

export interface SkillGapResult {
  overallReadiness: number;
  ratedCount: number;
  totalCount: number;
  domains: DomainGap[];
  topGaps: SkillWithGap[];
  allSkills: SkillWithGap[];
}

const EMPTY_RESULT: SkillGapResult = {
  overallReadiness: 0,
  ratedCount: 0,
  totalCount: 0,
  domains: [],
  topGaps: [],
  allSkills: [],
};

/**
 * Fetch a role's skills + a user's ratings for them and compute readiness.
 * Plain async function (not a hook) so it can be called in a loop across
 * several roles at once - see useCoachPlan.ts.
 */
export async function fetchSkillGap(slug: string, userId: string | null | undefined): Promise<SkillGapResult> {
  if (!slug || !userId) return EMPTY_RESULT;

  const { data: skillRows } = await supabase
    .from("role_skills")
    .select("id,skill_title,skill_type,broad_domain,skill_area")
    .eq("slug", slug)
    .order("display_order", { ascending: true });

  if (!skillRows) return EMPTY_RESULT;
  const skillIds = skillRows.map((s: any) => s.id);

  const { data: ratingRows } = await supabase
    .from("user_skill_ratings")
    .select("skill_id,rating,evidenced")
    .eq("user_id", userId)
    .in("skill_id", skillIds);

  const ratingMap = new Map<string, { rating: number; evidenced: boolean }>();
  for (const r of (ratingRows ?? []) as any[]) {
    ratingMap.set(r.skill_id, { rating: r.rating, evidenced: r.evidenced });
  }

  const allSkills: SkillWithGap[] = skillRows.map((s: any) => {
    const r = ratingMap.get(s.id);
    const baseRating = r?.rating ?? null;
    const evidenced = r?.evidenced ?? false;
    // Evidenced skills get a small bonus (capped at 5)
    const effectiveRating = baseRating !== null ? Math.min(5, baseRating + (evidenced ? 0.5 : 0)) : null;
    return {
      id: s.id,
      skill_title: s.skill_title,
      skill_type: s.skill_type,
      broad_domain: s.broad_domain ?? "General",
      skill_area: s.skill_area,
      rating: effectiveRating,
      evidenced,
    };
  });

  const totalCount = allSkills.length;
  const ratedCount = allSkills.filter((s) => s.rating !== null).length;
  const sumRatings = allSkills.reduce((acc, s) => acc + (s.rating ?? 0), 0);
  const overallReadiness = totalCount > 0 ? Math.round((sumRatings / (totalCount * 5)) * 100) : 0;

  // Domain breakdown
  const domainMap = new Map<string, SkillWithGap[]>();
  for (const s of allSkills) {
    const d = s.broad_domain ?? "General";
    if (!domainMap.has(d)) domainMap.set(d, []);
    domainMap.get(d)!.push(s);
  }
  const domains: DomainGap[] = [];
  for (const [domain, dSkills] of domainMap) {
    const dRated = dSkills.filter((s) => s.rating !== null).length;
    const dSum = dSkills.reduce((acc, s) => acc + (s.rating ?? 0), 0);
    const readiness = dSkills.length > 0 ? Math.round((dSum / (dSkills.length * 5)) * 100) : 0;
    const gapCount = dSkills.filter((s) => (s.rating ?? 0) < 3).length;
    domains.push({ domain, totalSkills: dSkills.length, ratedSkills: dRated, readiness, gapCount });
  }
  domains.sort((a, b) => a.readiness - b.readiness); // worst gaps first

  // Top gaps: unrated or low-rated, sorted by gap size
  const topGaps = [...allSkills]
    .filter((s) => (s.rating ?? 0) < 3)
    .sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0))
    .slice(0, 6);

  return { overallReadiness, ratedCount, totalCount, domains, topGaps, allSkills };
}
