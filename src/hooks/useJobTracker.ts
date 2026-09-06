import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TrackerStatus = "wishlist" | "applied" | "interviewing" | "offer" | "rejected" | "withdrawn";
export type OpportunityType = "job" | "company";
export type ContactStatus = "not_contacted" | "messaged" | "responded" | "met";

export const TRACKER_STATUSES: { value: TrackerStatus; label: string }[] = [
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export const CONTACT_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: "not_contacted", label: "Contact" },
  { value: "messaged", label: "Contacted" },
  { value: "responded", label: "Spoken" },
  { value: "met", label: "Met" },
];

/** Whatever Howdy generated for this application - cached so reopening a
 * saved/applied job doesn't regenerate it. Either flow's shape fits: the
 * richer tailor-application result, or help-me-apply's plain cover letter
 * (plus the job description it was generated from, so Regenerate still works). */
export type ApplicationHelperCache = {
  coverLetter?: string;
  jobDescription?: string;
  cvTips?: { category: string; tip: string }[];
  keySkills?: string[];
  companyInsight?: string;
};

export interface TrackerItem {
  id: string;
  job_id: string | null;
  company: string;
  title: string | null;
  opportunity_type: OpportunityType;
  url: string | null;
  location: string | null;
  salary: string | null;
  industry: string | null;
  status: TrackerStatus;
  notes: string | null;
  next_action: string | null;
  follow_up_date: string | null;
  closing_date: string | null;
  application_helper: ApplicationHelperCache | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type NewTrackerItem = {
  job_id?: string | null;
  company: string;
  title?: string | null;
  opportunity_type?: OpportunityType;
  url?: string | null;
  location?: string | null;
  salary?: string | null;
  industry?: string | null;
  status?: TrackerStatus;
  notes?: string | null;
  next_action?: string | null;
  follow_up_date?: string | null;
  closing_date?: string | null;
  application_helper?: ApplicationHelperCache | null;
};

export interface TrackerAction {
  id: string;
  tracker_item_id: string;
  description: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface TrackerContact {
  id: string;
  tracker_item_id: string | null;
  company: string | null;
  name: string;
  role: string | null;
  relationship: string | null;
  contact_info: string | null;
  notes: string | null;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export type NewTrackerContact = {
  tracker_item_id?: string | null;
  company?: string | null;
  name: string;
  role?: string | null;
  relationship?: string | null;
  contact_info?: string | null;
  notes?: string | null;
  status?: ContactStatus;
};

/**
 * Job Tracker hook - full CRUD over `job_tracker_items` plus the two
 * satellite tables that hang off it: `job_tracker_actions` (multiple
 * time-based to-dos per opportunity) and `job_tracker_contacts` (people to
 * approach for advice - optionally scoped to a company and/or a specific
 * opportunity, or fully standalone). Signed-in only; unlike useSavedJobs
 * there's no guest/localStorage mode since these are proper multi-field
 * records, not a togglable boolean.
 */
export function useJobTracker() {
  const { user } = useAuth();
  const [items, setItems] = useState<TrackerItem[]>([]);
  const [actions, setActions] = useState<TrackerAction[]>([]);
  const [contacts, setContacts] = useState<TrackerContact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setActions([]);
      setContacts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [itemsRes, actionsRes, contactsRes] = await Promise.all([
      supabase
        .from("job_tracker_items")
        .select("*")
        .eq("user_id", user.id)
        .order("status", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("job_tracker_actions")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("job_tracker_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setItems((itemsRes.data ?? []) as TrackerItem[]);
    setActions((actionsRes.data ?? []) as TrackerAction[]);
    setContacts((contactsRes.data ?? []) as TrackerContact[]);
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
          title: item.title ?? null,
          opportunity_type: item.opportunity_type ?? "job",
          url: item.url ?? null,
          location: item.location ?? null,
          salary: item.salary ?? null,
          industry: item.industry ?? null,
          status,
          sort_order: siblingCount,
          notes: item.notes ?? null,
          next_action: item.next_action ?? null,
          follow_up_date: item.follow_up_date ?? null,
          closing_date: item.closing_date ?? null,
          application_helper: item.application_helper ?? null,
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
      patch: Partial<Pick<TrackerItem, "title" | "opportunity_type" | "notes" | "next_action" | "follow_up_date" | "closing_date" | "salary" | "location" | "application_helper">>
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
      setActions((prev) => prev.filter((a) => a.tracker_item_id !== id));
      await supabase.from("job_tracker_items").delete().eq("id", id).eq("user_id", user.id);
    },
    [user]
  );

  const isTracked = useCallback(
    (jobId?: string | null) => !!jobId && items.some((i) => i.job_id === jobId),
    [items]
  );

  // ── Actions (multiple time-based to-dos per opportunity) ──────────────
  const addAction = useCallback(
    async (trackerItemId: string, description: string, dueDate: string | null) => {
      if (!user || !description.trim()) return null;
      const { data, error } = await supabase
        .from("job_tracker_actions")
        .insert({
          user_id: user.id,
          tracker_item_id: trackerItemId,
          description: description.trim(),
          due_date: dueDate || null,
        })
        .select("*")
        .single();
      if (error || !data) return null;
      setActions((prev) => [...prev, data as TrackerAction]);
      return data as TrackerAction;
    },
    [user]
  );

  const toggleActionComplete = useCallback(
    async (id: string) => {
      if (!user) return;
      const current = actions.find((a) => a.id === id);
      if (!current) return;
      const completed = !current.completed;
      const patch = { completed, completed_at: completed ? new Date().toISOString() : null };
      setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      await supabase.from("job_tracker_actions").update(patch).eq("id", id).eq("user_id", user.id);
    },
    [user, actions]
  );

  const removeAction = useCallback(
    async (id: string) => {
      if (!user) return;
      setActions((prev) => prev.filter((a) => a.id !== id));
      await supabase.from("job_tracker_actions").delete().eq("id", id).eq("user_id", user.id);
    },
    [user]
  );

  const actionsForItem = useCallback(
    (trackerItemId: string) => actions.filter((a) => a.tracker_item_id === trackerItemId),
    [actions]
  );

  // ── Contacts (people to approach - by company, by opportunity, or standalone) ──
  const addContact = useCallback(
    async (contact: NewTrackerContact) => {
      if (!user || !contact.name.trim()) return null;
      const { data, error } = await supabase
        .from("job_tracker_contacts")
        .insert({
          user_id: user.id,
          tracker_item_id: contact.tracker_item_id ?? null,
          company: contact.company?.trim() || null,
          name: contact.name.trim(),
          role: contact.role?.trim() || null,
          relationship: contact.relationship?.trim() || null,
          contact_info: contact.contact_info?.trim() || null,
          notes: contact.notes?.trim() || null,
          status: contact.status ?? "not_contacted",
        })
        .select("*")
        .single();
      if (error || !data) return null;
      setContacts((prev) => [data as TrackerContact, ...prev]);
      return data as TrackerContact;
    },
    [user]
  );

  const updateContact = useCallback(
    async (id: string, patch: Partial<Omit<TrackerContact, "id" | "created_at" | "updated_at">>) => {
      if (!user) return;
      const withTimestamp = { ...patch, updated_at: new Date().toISOString() };
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...withTimestamp } : c)));
      await supabase.from("job_tracker_contacts").update(withTimestamp).eq("id", id).eq("user_id", user.id);
    },
    [user]
  );

  const removeContact = useCallback(
    async (id: string) => {
      if (!user) return;
      setContacts((prev) => prev.filter((c) => c.id !== id));
      await supabase.from("job_tracker_contacts").delete().eq("id", id).eq("user_id", user.id);
    },
    [user]
  );

  const contactsForItem = useCallback(
    (trackerItemId: string) => contacts.filter((c) => c.tracker_item_id === trackerItemId),
    [contacts]
  );

  const contactsForCompany = useCallback(
    (company: string) => contacts.filter((c) => c.company?.toLowerCase() === company.toLowerCase()),
    [contacts]
  );

  return {
    items, loading, addItem, updateStatus, updateItem, removeItem, isTracked, reload: load,
    actions, addAction, toggleActionComplete, removeAction, actionsForItem,
    contacts, addContact, updateContact, removeContact, contactsForItem, contactsForCompany,
  };
}
