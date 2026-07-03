import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type InteractionType =
  | "company_view"
  | "industry_view"
  | "job_click"
  | "help_apply"
  | "career_map_role_link"
  | "save_company"
  | "save_role"
  | "save_industry"
  | "marketplace_search";

interface TrackArgs {
  type: InteractionType;
  companySlug?: string;
  industry?: string;
  jobId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs a user interaction to user_interactions table.
 * Silent no-op when user is not signed in.
 */
export async function trackInteraction(args: TrackArgs) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_interactions").insert([{
      user_id: user.id,
      interaction_type: args.type,
      company_slug: args.companySlug,
      industry: args.industry,
      job_id: args.jobId,
      metadata: (args.metadata ?? {}) as never,
    }]);
  } catch {
    // swallow - tracking must never break UX
  }
}

/**
 * Fire-and-forget hook for page view tracking. Runs once on mount.
 */
export function useTrackPageView(args: TrackArgs) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    trackInteraction(args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, args.type, args.companySlug, args.industry]);
}

// ─── Behavioural affinity ────────────────────────────────────────────────────
// Signal weights: job clicks matter most, marketplace filter picks second,
// industry page visits least. Recency decay keeps old curiosity from persisting.
// Threshold of 5 pts means one stray visit never influences the feed.

const SIGNAL_WEIGHTS: Partial<Record<InteractionType, number>> = {
  job_click: 3,
  industry_view: 1,       // includes marketplace_filter source
  marketplace_search: 2,
};

const RECENCY_DECAY = (createdAt: string): number => {
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  if (ageDays <= 7)  return 1.0;
  if (ageDays <= 14) return 0.6;
  if (ageDays <= 30) return 0.3;
  return 0;
};

export interface IndustryAffinity {
  /** industry slug → weighted score (only entries that hit the threshold) */
  scores: Map<string, number>;
  /** max score across all industries (for normalising the boost) */
  max: number;
}

/**
 * Fetches the last 30 days of user_interactions for the signed-in user,
 * builds a weighted + decayed industry affinity map, and filters out
 * industries that haven't hit the minimum threshold.
 *
 * Returns null while loading or when the user is not signed in.
 */
export function useBehavioralAffinity(): IndustryAffinity | null {
  const { user, loading } = useAuth();
  const [affinity, setAffinity] = useState<IndustryAffinity | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    supabase
      .from("user_interactions")
      .select("interaction_type, industry, created_at, metadata")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .then(({ data }) => {
        if (!data) return;
        const raw = new Map<string, number>();
        for (const row of data) {
          const ind = (row.industry as string | null)?.toLowerCase().trim();
          if (!ind) continue;
          // marketplace_filter is stored as industry_view with source metadata
          const source = (row.metadata as Record<string, unknown> | null)?.source as string | undefined;
          const type: InteractionType =
            source === "marketplace_filter" ? "industry_view" :
            source === "marketplace_search" ? "marketplace_search" :
            (row.interaction_type as InteractionType);
          const weight = SIGNAL_WEIGHTS[type] ?? 0;
          if (weight === 0) continue;
          const decay = RECENCY_DECAY(row.created_at as string);
          raw.set(ind, (raw.get(ind) ?? 0) + weight * decay);
        }
        // Apply threshold — must reach 5 weighted points to count
        const THRESHOLD = 5;
        const scores = new Map<string, number>();
        let max = 0;
        for (const [ind, score] of raw) {
          if (score >= THRESHOLD) {
            scores.set(ind, score);
            if (score > max) max = score;
          }
        }
        setAffinity({ scores, max });
      });
  }, [user, loading]);

  return affinity;
}
