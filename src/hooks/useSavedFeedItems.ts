import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SavedItemType = "article" | "news" | "company_news" | "briefing" | "video";

export interface SavedFeedItem {
  id?: string;
  item_type: SavedItemType;
  item_key: string;
  payload: {
    title?: string;
    url?: string;
    source?: string;
    industry?: string;
    youtubeId?: string;
    channel?: string;
    duration?: string;
    mainNews?: string;
    briefingDate?: string;
    [k: string]: unknown;
  };
  created_at?: string;
}

const LS_KEY = "saved-feed-items-guest";

const readGuest = (): SavedFeedItem[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const writeGuest = (items: SavedFeedItem[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
};

const keyOf = (t: SavedItemType, k: string) => `${t}::${k}`;

export function useSavedFeedItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (user) {
      // Migrate guest items
      const guest = readGuest();
      if (guest.length > 0) {
        const rows = guest.map((g) => ({
          user_id: user.id,
          item_type: g.item_type,
          item_key: g.item_key,
          payload: g.payload as never,
        }));
        await supabase
          .from("saved_feed_items")
          .upsert(rows as never, { onConflict: "user_id,item_type,item_key" });
        writeGuest([]);
      }
      const { data } = await supabase
        .from("saved_feed_items")
        .select("id, item_type, item_key, payload, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems(((data ?? []) as unknown) as SavedFeedItem[]);
    } else {
      setItems(readGuest());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const keys = new Set(items.map((i) => keyOf(i.item_type, i.item_key)));

  const isSaved = useCallback(
    (type: SavedItemType, key: string) => keys.has(keyOf(type, key)),
    [keys],
  );

  const toggle = useCallback(
    async (item: SavedFeedItem) => {
      const k = keyOf(item.item_type, item.item_key);
      const already = keys.has(k);
      // optimistic
      setItems((prev) =>
        already
          ? prev.filter((i) => keyOf(i.item_type, i.item_key) !== k)
          : [{ ...item, created_at: new Date().toISOString() }, ...prev],
      );
      if (user) {
        if (already) {
          await supabase
            .from("saved_feed_items")
            .delete()
            .eq("user_id", user.id)
            .eq("item_type", item.item_type)
            .eq("item_key", item.item_key);
        } else {
          await supabase
            .from("saved_feed_items")
            .upsert(
              {
                user_id: user.id,
                item_type: item.item_type,
                item_key: item.item_key,
                payload: item.payload as never,
              } as never,
              { onConflict: "user_id,item_type,item_key" },
            );
        }
      } else {
        const cur = readGuest();
        const next = already
          ? cur.filter((i) => keyOf(i.item_type, i.item_key) !== k)
          : [item, ...cur];
        writeGuest(next);
      }
    },
    [keys, user],
  );

  return { items, isSaved, toggle, loading, refresh };
}
