import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { roles } from "@/data/roles";

export interface TargetRole {
  slug: string;
  title: string;
  set_at: string;
}

/**
 * The user's active target roles - Howdy coaches on all of them at once.
 * Backed by user_target_roles (one row per role), ordered most-recent first.
 */
export function useTargetRoles(userId: string | null | undefined) {
  const [targetRoles, setTargetRoles] = useState<TargetRole[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) {
      setTargetRoles([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_target_roles")
      .select("role_slug, set_at")
      .eq("user_id", userId)
      .order("set_at", { ascending: false });
    const list: TargetRole[] = (data ?? []).map((r) => ({
      slug: r.role_slug,
      title: roles.find((role) => role.slug === r.role_slug)?.title ?? r.role_slug,
      set_at: r.set_at,
    }));
    setTargetRoles(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addTargetRole = useCallback(async (slug: string) => {
    if (!userId) return;
    await supabase
      .from("user_target_roles")
      .upsert({ user_id: userId, role_slug: slug, set_at: new Date().toISOString() }, { onConflict: "user_id,role_slug" });
    await refetch();
    window.dispatchEvent(new Event("howdy:target-roles-changed"));
  }, [userId, refetch]);

  const removeTargetRole = useCallback(async (slug: string) => {
    if (!userId) return;
    await supabase
      .from("user_target_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role_slug", slug);
    await refetch();
    window.dispatchEvent(new Event("howdy:target-roles-changed"));
  }, [userId, refetch]);

  // Other mounted instances of this hook (e.g. useCoachPlan in an
  // already-open Howdy widget) won't otherwise know a role was
  // added/removed elsewhere on the site - refetch when that happens.
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("howdy:target-roles-changed", handler);
    return () => window.removeEventListener("howdy:target-roles-changed", handler);
  }, [refetch]);

  return { targetRoles, loading, addTargetRole, removeTargetRole, refetch };
}
