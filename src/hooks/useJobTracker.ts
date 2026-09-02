import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TrackerStatus = "wishlist" | "applied" | "interviewing" | "offer" | "rejected" | "withdrawn";

export const TRACKER_STATUSES: { value: TrackerStatus; label: string }[] = [
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export interface TrackerItem {
  id: string;
  job_id: string | null;
  company: string;
  title: string;
  url: string | null;
  location: string | null;
  salary: string | null;
  industry: string | null;
  status: TrackerStatus;
  notes: string | null;
  next_action: string | null;
  follow_up_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type NewTrackerItem = {
  job_id?: string | null;
  company: string;
  title: string;
  url?: string | null;
  location?: string | null;
  salary?: string | null;
  industry?: string | null;
  status?: TrackerStatus;
};

/**
 * Job Tracker hook - full CRUD over `job_tracker_items`. Signed-in only;
 * unlike useSavedJobs there's no guest/localStorage mode since the tracker
 * is a proper multi-field record, not a togglable boolean.
 */
export function useJobTracker() {
  const { user } = useAuth();
  const [items, setItems] = useState<TrackerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("job_tracker_items")
      .select("*")
      .eq("user_id", user.id)
      .order("status", { ascending: true })
      .order("sort_order", { ascending: true });
    setItems((data ?? []) as TrackerItem[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = useCallback(
    async (item: NewTrackerItem) => {
      if (!user) return null;
      const status = item.status ?? "wishlist";
      const siblingCount = items.filter((i) => i.status === status).length;
      const { data, error } = await supabase
        .from("job_tracker_items")
        .insert({
          user_id: user.id,
          job_id: item.job_id ?? null,
          company: item.company,
          title: item.title,
          url: item.url ?? null,
          location: item.location ?? null,
          salary: item.salary ?? null,
          industry: item.industry ?? null,
          status,
          sort_order: siblingCount,
        })
        .select("*")
        .single();
      if (error || !data) return null;
      setItems((prev) => [...prev, data as TrackerItem]);
      return data as TrackerItem;
    },
    [user, items]
  );

  const updateStatus = useCallback(
    async (id: string, status: TrackerStatus, sortOrder?: number) => {
      if (!user) return;
      const patch: { status: TrackerStatus; sort_order?: number; updated_at: string } = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (sortOrder !== undefined) patch.sort_order = sortOrder;
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
      );
      await supabase.from("job_tracker_items").update(patch).eq("id", id).eq("user_id", user.id);
    },
    [user]
  );

  const updateItem = useCallback(
    async (
      id: string,
      patch: Partial<Pick<TrackerItem, "notes" | "next_action" | "follow_up_date" | "salary" | "location">>
    ) => {
      if (!user) return;
      const withTimestamp = { ...patch, updated_at: new Date().toISOString() };
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...withTimestamp } : i)));
      await supabase.from("job_tracker_items").update(withTimestamp).eq("id", id).eq("user_id", user.id);
    },
    [user]
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (!user) return;
      setItems((prev) => prev.filter((i) => i.id !== id));
      await supabase.from("job_tracker_items").delete().eq("id", id).eq("user_id", user.id);
    },
    [user]
  );

  const isTracked = useCallback(
    (jobId?: string | null) => !!jobId && items.some((i) => i.job_id === jobId),
    [items]
  );

  return { items, loading, addItem, updateStatus, updateItem, removeItem, isTracked, reload: load };
}
