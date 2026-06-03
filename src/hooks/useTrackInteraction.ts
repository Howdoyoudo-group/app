import { useEffect } from "react";
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
  | "save_industry";

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
