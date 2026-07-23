import { useEffect, useState } from "react";
import { fetchSkillGap, type SkillWithGap, type DomainGap } from "@/lib/skillGap";

export type { SkillWithGap, DomainGap };

export interface SkillGapResult {
  overallReadiness: number;
  ratedCount: number;
  totalCount: number;
  domains: DomainGap[];
  topGaps: SkillWithGap[];
  allSkills: SkillWithGap[];
  loading: boolean;
}

export function useSkillGap(slug: string, userId: string | null | undefined): SkillGapResult {
  const [result, setResult] = useState<SkillGapResult>({
    overallReadiness: 0,
    ratedCount: 0,
    totalCount: 0,
    domains: [],
    topGaps: [],
    allSkills: [],
    loading: true,
  });

  useEffect(() => {
    if (!slug || !userId) {
      setResult((r) => ({ ...r, loading: false }));
      return;
    }
    let cancelled = false;
    fetchSkillGap(slug, userId).then((r) => {
      if (!cancelled) setResult({ ...r, loading: false });
    });
    return () => { cancelled = true; };
  }, [slug, userId]);

  return result;
}
