import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LS_KEY = "saved-jobs-guest";

function readGuest(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuest(ids: string[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {}
}

/**
 * Persistent saved-jobs hook.
 * - Signed in: stored in `saved_jobs` table (RLS scoped to auth.uid()).
 * - Guests:    stored in localStorage. Migrated to DB on next sign-in.
 *
 * Job IDs are the DB uuid (Job.dbId in Marketplace).
 */
export function useSavedJobs() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load + migrate guest items into DB on sign-in
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (user) {
        // Migrate any guest-saved jobs into the DB
        const guest = readGuest();
        if (guest.length > 0) {
          const rows = guest.map((job_id) => ({ user_id: user.id, job_id }));
          await supabase.from("saved_jobs").upsert(rows, { onConflict: "user_id,job_id" });
          writeGuest([]);
        }
        const { data } = await supabase
          .from("saved_jobs")
          .select("job_id")
          .eq("user_id", user.id);
        if (cancelled) return;
        setSaved(new Set((data ?? []).map((r) => r.job_id as string)));
      } else {
        setSaved(new Set(readGuest()));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const toggle = useCallback(
    async (jobId: string) => {
      if (!jobId) return;
      const isSaved = saved.has(jobId);
      // Optimistic update
      setSaved((prev) => {
        const next = new Set(prev);
        isSaved ? next.delete(jobId) : next.add(jobId);
        return next;
      });

      if (user) {
        if (isSaved) {
          await supabase
            .from("saved_jobs")
            .delete()
            .eq("user_id", user.id)
            .eq("job_id", jobId);
        } else {
          await supabase
            .from("saved_jobs")
            .upsert({ user_id: user.id, job_id: jobId }, { onConflict: "user_id,job_id" });
        }
      } else {
        const current = readGuest();
        const next = isSaved
          ? current.filter((id) => id !== jobId)
          : [...current, jobId];
        writeGuest(next);
      }
    },
    [saved, user]
  );

  const isSaved = useCallback((jobId?: string | null) => !!jobId && saved.has(jobId), [saved]);

  return { saved, isSaved, toggle, loading };
}
