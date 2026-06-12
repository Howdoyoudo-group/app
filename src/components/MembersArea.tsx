import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Send, Check, X, MessageCircle, ArrowLeft, MapPin,
  Loader2, UserPlus, Clock, Shield, Inbox as InboxIcon, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

type Member = {
  id: string;
  full_name: string | null;
  photo_url: string | null;
  home_town: string | null;
  career_level: string | null;
  member_bio: string | null;
  industry_interests: string[] | null;
  role_preferences: string[] | null;
  mentor_opt_in?: boolean | null;
};

type Connection = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "declined";
  message: string | null;
  created_at: string;
  accepted_at: string | null;
};

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

type View =
  | { kind: "directory" }
  | { kind: "requests" }
  | { kind: "messages" }
  | { kind: "profile"; userId: string }
  | { kind: "thread"; userId: string };

const TONES = {
  directory: "bg-[hsl(160,80%,80%)]",
  requests: "bg-[hsl(45,100%,75%)]",
  messages: "bg-[hsl(200,90%,80%)]",
};

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

const Avatar = ({ member, size = 48 }: { member: Pick<Member, "full_name" | "photo_url">; size?: number }) => (
  <div
    className="rounded-full overflow-hidden border-2 border-foreground bg-background flex items-center justify-center font-display font-900 shrink-0"
    style={{ width: size, height: size, fontSize: size / 2.6 }}
  >
    {member.photo_url ? (
      <img src={member.photo_url} alt="" className="w-full h-full object-cover" />
    ) : (
      <span>{initials(member.full_name)}</span>
    )}
  </div>
);

export default function MembersArea({ defaultView = "directory" }: { defaultView?: "directory" | "messages" } = {}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the source of truth for the current view, so browser
  // back/forward and refresh behave naturally:
  //   ?thread=<id>  → open chat   ?member=<id> → profile
  //   ?view=requests|messages|directory → list views
  const view: View = useMemo(() => {
    const thread = searchParams.get("thread");
    if (thread) return { kind: "thread", userId: thread };
    const member = searchParams.get("member");
    if (member) return { kind: "profile", userId: member };
    const v = searchParams.get("view");
    if (v === "requests") return { kind: "requests" };
    if (v === "messages") return { kind: "messages" };
    if (v === "directory") return { kind: "directory" };
    return { kind: defaultView };
  }, [searchParams, defaultView]);

  const setView = (next: View, opts?: { replace?: boolean }) => {
    const p = new URLSearchParams(searchParams);
    p.delete("thread");
    p.delete("member");
    p.delete("view");
    if (next.kind === "thread") p.set("thread", next.userId);
    else if (next.kind === "profile") p.set("member", next.userId);
    else p.set("view", next.kind);
    setSearchParams(p, opts);
  };

  const openProfile = (userId: string) => setView({ kind: "profile", userId });

  // Back uses real history when there is any (covers deep links from the
  // Inbox and internally opened threads alike); falls back to messages list
  // when this page was opened directly as the first history entry.
  const goBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      setView({ kind: "messages" }, { replace: true });
    }
  };

  const [optIn, setOptIn] = useState(true);
  const [bio, setBio] = useState("");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Directory
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loadingDir, setLoadingDir] = useState(false);
  const [premiumIds, setPremiumIds] = useState<Set<string>>(new Set());

  // Connections
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connLoading, setConnLoading] = useState(false);

  // Profiles cache (id -> Member)
  const [profileCache, setProfileCache] = useState<Record<string, Member>>({});

  // Messages (per thread)
  const [thread, setThread] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // Recent threads list
  const [recentThreads, setRecentThreads] = useState<
    Array<{ otherId: string; lastMessage: Message; unread: number }>
  >([]);

  // ── Load own preferences
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("member_directory_opt_in, member_bio")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOptIn(data.member_directory_opt_in ?? true);
          setBio(data.member_bio ?? "");
        }
      });
  }, [user]);

  // ── Load directory
  const loadDirectory = useCallback(async () => {
    setLoadingDir(true);
    const { data, error } = await supabase.rpc("get_member_directory", {
      _search: search || null,
      _industry: null,
      _limit: 60,
      _offset: 0,
    });
    if (!error && data) {
      const list = data as Member[];
      setMembers(list);
      const ids = list.map((m) => m.id);
      if (ids.length > 0) {
        const { data: prem } = await supabase.rpc("get_premium_member_ids", { _ids: ids });
        setPremiumIds(new Set(((prem as any[]) ?? []).map((r) => r.user_id)));
      } else {
        setPremiumIds(new Set());
      }
    }
    setLoadingDir(false);
  }, [search]);

  useEffect(() => {
    if (view.kind === "directory") loadDirectory();
  }, [view.kind, loadDirectory]);

  // ── Load connections
  const loadConnections = useCallback(async () => {
    if (!user) return;
    setConnLoading(true);
    const { data } = await supabase
      .from("member_connections")
      .select("*")
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    setConnections((data ?? []) as Connection[]);
    setConnLoading(false);
  }, [user]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // ── Realtime: connections + messages
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`members-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "member_connections" }, () => loadConnections())
      .on("postgres_changes", { event: "*", schema: "public", table: "member_messages" }, (payload) => {
        const m = (payload.new ?? payload.old) as Message;
        if (m && (m.sender_id === user.id || m.recipient_id === user.id)) {
          loadRecentThreads();
          if (view.kind === "thread") {
            const other = view.userId;
            if (m.sender_id === other || m.recipient_id === other) {
              loadThread(other);
            }
          }
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, view]);

  // ── Hydrate cache for connection counterparts
  useEffect(() => {
    if (!user || connections.length === 0) return;
    const others = Array.from(
      new Set(
        connections.map((c) => (c.requester_id === user.id ? c.recipient_id : c.requester_id))
      )
    ).filter((id) => !profileCache[id]);
    if (others.length === 0) return;
    Promise.all(
      others.map((id) =>
        supabase.rpc("get_member_profile", { _id: id }).then(({ data }) => {
          const row = (data as Member[] | null)?.[0];
          return row ? [id, row] as const : null;
        })
      )
    ).then((rows) => {
      const next = { ...profileCache };
      for (const r of rows) if (r) next[r[0]] = r[1];
      setProfileCache(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections, user]);

  // ── Helpers
  const acceptedConnectionFor = useCallback(
    (otherId: string) =>
      connections.find(
        (c) =>
          c.status === "accepted" &&
          ((c.requester_id === user?.id && c.recipient_id === otherId) ||
            (c.recipient_id === user?.id && c.requester_id === otherId))
      ),
    [connections, user]
  );

  const pendingConnectionFor = useCallback(
    (otherId: string) =>
      connections.find(
        (c) =>
          c.status === "pending" &&
          ((c.requester_id === user?.id && c.recipient_id === otherId) ||
            (c.recipient_id === user?.id && c.requester_id === otherId))
      ),
    [connections, user]
  );

  // ── Recent threads
  const loadRecentThreads = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("member_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(200);
    const byOther = new Map<string, { lastMessage: Message; unread: number }>();
    for (const m of (data ?? []) as Message[]) {
      const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      const prev = byOther.get(other);
      if (!prev) {
        byOther.set(other, {
          lastMessage: m,
          unread: m.recipient_id === user.id && !m.read_at ? 1 : 0,
        });
      } else if (m.recipient_id === user.id && !m.read_at) {
        prev.unread += 1;
      }
    }
    const list = Array.from(byOther.entries()).map(([otherId, v]) => ({ otherId, ...v }));
    setRecentThreads(list);

    // Hydrate profile cache for those thread partners
    const missing = list.map((t) => t.otherId).filter((id) => !profileCache[id]);
    if (missing.length) {
      const rows = await Promise.all(
        missing.map((id) =>
          supabase.rpc("get_member_profile", { _id: id }).then(({ data }) => {
            const row = (data as Member[] | null)?.[0];
            return row ? [id, row] as const : null;
          })
        )
      );
      const next = { ...profileCache };
      for (const r of rows) if (r) next[r[0]] = r[1];
      setProfileCache(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    loadRecentThreads();
  }, [loadRecentThreads]);

  // ── Thread loading
  const loadThread = useCallback(
    async (otherId: string) => {
      if (!user) return;
      setThreadLoading(true);
      const { data } = await supabase
        .from("member_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      const list = (data ?? []) as Message[];
      setThread(list);
      setThreadLoading(false);
      // Mark unread received messages as read
      const unreadIds = list.filter((m) => m.recipient_id === user.id && !m.read_at).map((m) => m.id);
      if (unreadIds.length) {
        await supabase
          .from("member_messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
        loadRecentThreads();
      }
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    },
    [user, loadRecentThreads]
  );

  useEffect(() => {
    if (view.kind === "thread") {
      loadThread(view.userId);
      // ensure profile is in cache
      if (!profileCache[view.userId]) {
        supabase.rpc("get_member_profile", { _id: view.userId }).then(({ data }) => {
          const row = (data as Member[] | null)?.[0];
          if (row) setProfileCache((p) => ({ ...p, [view.userId]: row }));
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // ── Actions
  const savePrefs = async (next: { optIn?: boolean; bio?: string }) => {
    if (!user) return;
    setSavingPrefs(true);
    const payload: Record<string, unknown> = {};
    if (next.optIn !== undefined) payload.member_directory_opt_in = next.optIn;
    if (next.bio !== undefined) payload.member_bio = next.bio;
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    setSavingPrefs(false);
    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
      return;
    }
    if (next.optIn !== undefined) setOptIn(next.optIn);
    if (next.bio !== undefined) setBio(next.bio);
    toast({ title: "Saved" });
  };

  const requestConnection = async (otherId: string, message?: string) => {
    if (!user) return;
    const { error } = await supabase.from("member_connections").insert({
      requester_id: user.id,
      recipient_id: otherId,
      message: message ?? null,
    });
    if (error) {
      toast({ title: "Couldn't send request", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Request sent" });
    loadConnections();
    supabase.functions.invoke("notify-member-event", {
      body: { event: "connection_request", recipient_id: otherId, actor_id: user.id, message: message ?? null },
    }).catch((e) => console.warn("notify-member-event failed", e));
  };

  const respondToRequest = async (id: string, accept: boolean) => {
    const { error } = await supabase
      .from("member_connections")
      .update({
        status: accept ? "accepted" : "declined",
        accepted_at: accept ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) {
      toast({ title: "Couldn't update", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: accept ? "Connected" : "Declined" });
    loadConnections();
  };

  const removeConnection = async (id: string) => {
    const { error } = await supabase.from("member_connections").delete().eq("id", id);
    if (error) {
      toast({ title: "Couldn't remove", description: error.message, variant: "destructive" });
      return;
    }
    loadConnections();
  };

  const sendMessage = async (otherId: string) => {
    if (!user || !composer.trim()) return;
    setSending(true);
    const body = composer.trim();
    setComposer("");
    const { error } = await supabase.from("member_messages").insert({
      sender_id: user.id,
      recipient_id: otherId,
      body,
    });
    setSending(false);
    if (error) {
      toast({ title: "Couldn't send", description: error.message, variant: "destructive" });
      setComposer(body);
      return;
    }
    loadThread(otherId);
    supabase.functions.invoke("notify-member-event", {
      body: { event: "new_message", recipient_id: otherId, actor_id: user.id, message: body },
    }).catch((e) => console.warn("notify-member-event failed", e));
  };

  // ── Derived
  const incomingRequests = useMemo(
    () => connections.filter((c) => c.recipient_id === user?.id && c.status === "pending"),
    [connections, user]
  );
  const outgoingRequests = useMemo(
    () => connections.filter((c) => c.requester_id === user?.id && c.status === "pending"),
    [connections, user]
  );
  const acceptedCount = useMemo(
    () => connections.filter((c) => c.status === "accepted").length,
    [connections]
  );
  const totalUnread = useMemo(
    () => recentThreads.reduce((sum, t) => sum + t.unread, 0),
    [recentThreads]
  );

  if (!user) {
    return (
      <div className="border-2 border-foreground rounded-2xl p-8 text-center">
        <p className="font-body text-muted-foreground">Sign in to use the Members area.</p>
      </div>
    );
  }

  // ── Render
  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <SubNavBtn
          active={view.kind === "directory"}
          tone={TONES.directory}
          onClick={() => setView({ kind: "directory" })}
          icon={<Users className="w-4 h-4" />}
          label="Directory"
        />
        <SubNavBtn
          active={view.kind === "requests"}
          tone={TONES.requests}
          onClick={() => setView({ kind: "requests" })}
          icon={<UserPlus className="w-4 h-4" />}
          label="Requests"
          badge={incomingRequests.length || undefined}
        />
        <SubNavBtn
          active={view.kind === "messages" || view.kind === "thread"}
          tone={TONES.messages}
          onClick={() => setView({ kind: "messages" })}
          icon={<MessageCircle className="w-4 h-4" />}
          label="Messages"
          badge={totalUnread || undefined}
        />
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="sm:ml-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border-2 border-foreground bg-background hover:bg-muted/40 font-display text-xs font-900 uppercase"
        >
          <Shield className="w-4 h-4" /> Privacy
        </button>
      </div>

      {/* Privacy / settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-2 border-foreground rounded-2xl p-4 bg-muted/30 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display font-900 text-base uppercase">Show me in the directory</h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Other signed-in members can see your name, photo, town, industries and bio. Your phone, address and CV stay private.
                  </p>
                </div>
                <Switch
                  checked={optIn}
                  disabled={savingPrefs}
                  onCheckedChange={(v) => savePrefs({ optIn: v })}
                />
              </div>
              <div>
                <label className="font-display text-xs font-900 uppercase block mb-2">Short bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="One or two lines about you and what you're up to."
                  maxLength={400}
                  className="border-2 border-foreground rounded-xl"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={() => savePrefs({ bio })}
                    disabled={savingPrefs}
                    className="font-display font-900 uppercase"
                  >
                    {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save bio"}
                  </Button>
                </div>
              </div>
              <p className="font-body text-xs text-muted-foreground">
                You have <strong>{acceptedCount}</strong> connections.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      {view.kind === "directory" && (
        <DirectoryView
          members={members}
          loading={loadingDir}
          search={search}
          setSearch={setSearch}
          onSearch={loadDirectory}
          onOpen={openProfile}
          pendingFor={pendingConnectionFor}
          acceptedFor={acceptedConnectionFor}
          onConnect={(id, message) => requestConnection(id, message)}
          onMessage={(id) => setView({ kind: "thread", userId: id })}
          premiumIds={premiumIds}
        />
      )}

      {view.kind === "requests" && (
        <RequestsView
          incoming={incomingRequests}
          outgoing={outgoingRequests}
          cache={profileCache}
          onAccept={(id) => respondToRequest(id, true)}
          onDecline={(id) => respondToRequest(id, false)}
          onCancel={(id) => removeConnection(id)}
          onOpenProfile={openProfile}
          loading={connLoading}
        />
      )}

      {view.kind === "messages" && (
        <MessagesListView
          threads={recentThreads}
          cache={profileCache}
          onOpen={(id) => setView({ kind: "thread", userId: id })}
        />
      )}

      {view.kind === "profile" && (
        <ProfileView
          userId={view.userId}
          onBack={goBack}
          onMessage={(id) => setView({ kind: "thread", userId: id })}
          pending={!!pendingConnectionFor(view.userId)}
          accepted={!!acceptedConnectionFor(view.userId)}
          onConnect={() => requestConnection(view.userId)}
        />
      )}

      {view.kind === "thread" && (
        <ThreadView
          otherId={view.userId}
          other={profileCache[view.userId]}
          messages={thread}
          loading={threadLoading}
          composer={composer}
          setComposer={setComposer}
          onSend={() => sendMessage(view.userId)}
          sending={sending}
          isConnected={!!acceptedConnectionFor(view.userId)}
          isPending={!!pendingConnectionFor(view.userId)}
          onConnect={() => requestConnection(view.userId)}
          onBack={goBack}
          onOpenProfile={() => openProfile(view.userId)}
          threadEndRef={threadEndRef}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}

/* ─────────── sub-components ─────────── */

const SubNavBtn = ({
  active, onClick, icon, label, badge, tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  tone: string;
}) => (
  <button
    onClick={onClick}
    className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-foreground font-display text-xs font-900 uppercase transition-all ${
      active ? `${tone} shadow-[2px_2px_0_0_hsl(var(--foreground))]` : "bg-background hover:bg-muted/40"
    }`}
  >
    {icon}
    {label}
    {badge ? (
      <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center">
        {badge}
      </span>
    ) : null}
  </button>
);

function DirectoryView({
  members, loading, search, setSearch, onSearch, onOpen,
  pendingFor, acceptedFor, onConnect, onMessage, premiumIds,
}: {
  members: Member[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  onSearch: () => void;
  onOpen: (id: string) => void;
  pendingFor: (id: string) => Connection | undefined;
  acceptedFor: (id: string) => Connection | undefined;
  onConnect: (id: string, message?: string) => void;
  onMessage: (id: string) => void;
  premiumIds: Set<string>;
}) {
  const [composeFor, setComposeFor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => { e.preventDefault(); onSearch(); }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, town or bio…"
            className="pl-9 border-2 border-foreground rounded-xl"
          />
        </div>
        <Button type="submit" className="font-display font-900 uppercase">Search</Button>
      </form>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-6 h-6 animate-spin inline" />
        </div>
      ) : members.length === 0 ? (
        <div className="border-2 border-dashed border-foreground/30 rounded-2xl p-8 text-center">
          <p className="font-body text-muted-foreground">No members yet — try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map((m) => {
            const acc = acceptedFor(m.id);
            const pen = pendingFor(m.id);
            const composing = composeFor === m.id;
            return (
              <div
                key={m.id}
                className="border-2 border-foreground rounded-2xl p-4 bg-background hover:shadow-[3px_3px_0_0_hsl(var(--foreground))] transition-all"
              >
                <div className="flex items-start gap-3">
                  <button onClick={() => onOpen(m.id)}>
                    <Avatar member={m} size={56} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => onOpen(m.id)}
                        className="font-display font-900 text-base text-left hover:underline truncate"
                      >
                        {m.full_name || "Member"}
                      </button>
                      {m.mentor_opt_in && (
                        <span className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-[hsl(45,100%,75%)] px-1.5 py-0.5 font-display font-900 text-[9px] uppercase tracking-wider text-foreground">
                          <GraduationCap className="w-2.5 h-2.5" /> Mentor
                        </span>
                      )}
                      {premiumIds.has(m.id) && (
                        <span className="inline-flex items-center rounded-full border-2 border-foreground bg-primary px-1.5 py-0.5 font-display font-900 text-[9px] uppercase tracking-wider text-foreground">
                          ★ Premium
                        </span>
                      )}
                    </div>
                    {m.home_town && (
                      <p className="font-body text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {m.home_town}
                      </p>
                    )}
                    {m.member_bio && (
                      <p className="font-body text-sm mt-1.5 line-clamp-2">{m.member_bio}</p>
                    )}
                    {(m.industry_interests || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(m.industry_interests || []).slice(0, 3).map((i) => (
                          <span key={i} className="text-[10px] font-display font-900 uppercase border border-foreground/40 rounded-full px-2 py-0.5">
                            {i}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {composing && !acc && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={`Say hi to ${m.full_name?.split(" ")[0] || "them"}…`}
                      maxLength={500}
                      autoFocus
                      className="border-2 border-foreground rounded-xl text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          onConnect(m.id, draft.trim() || undefined);
                          setComposeFor(null);
                          setDraft("");
                        }}
                        className="font-display font-900 uppercase flex-1"
                      >
                        <Send className="w-4 h-4 mr-1" /> Send
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setComposeFor(null); setDraft(""); }}
                        className="font-display font-900 uppercase"
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="font-body text-[11px] text-muted-foreground">
                      They'll see your message as a connection request. Once they accept you can keep chatting.
                    </p>
                  </div>
                )}

                {!composing && (
                  <div className="flex gap-2 mt-3">
                    {acc ? (
                      <Button onClick={() => onMessage(m.id)} size="sm" className="font-display font-900 uppercase flex-1">
                        <MessageCircle className="w-4 h-4 mr-1" /> Message
                      </Button>
                    ) : pen ? (
                      <Button disabled size="sm" variant="outline" className="font-display font-900 uppercase flex-1">
                        <Clock className="w-4 h-4 mr-1" /> Pending
                      </Button>
                    ) : (
                      <Button
                        onClick={() => { setComposeFor(m.id); setDraft(""); }}
                        size="sm"
                        className="font-display font-900 uppercase flex-1"
                      >
                        <UserPlus className="w-4 h-4 mr-1" /> Connect
                      </Button>
                    )}
                    <Button onClick={() => onOpen(m.id)} size="sm" variant="ghost" className="font-display font-900 uppercase">
                      View
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequestsView({
  incoming, outgoing, cache, onAccept, onDecline, onCancel, onOpenProfile, loading,
}: {
  incoming: Connection[];
  outgoing: Connection[];
  cache: Record<string, Member>;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onCancel: (id: string) => void;
  onOpenProfile: (id: string) => void;
  loading: boolean;
}) {
  if (loading) return <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin inline" /></div>;
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-display font-900 uppercase text-sm mb-3">Incoming ({incoming.length})</h3>
        {incoming.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">No requests waiting.</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map((c) => {
              const m = cache[c.requester_id];
              return (
                <li key={c.id} className="border-2 border-foreground rounded-2xl p-3 flex items-center gap-3">
                  <button onClick={() => onOpenProfile(c.requester_id)}><Avatar member={m ?? { full_name: null, photo_url: null }} /></button>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => onOpenProfile(c.requester_id)} className="font-display font-900 text-left hover:underline">{m?.full_name || "Member"}</button>
                    {m?.home_town && <p className="font-body text-xs text-muted-foreground">{m.home_town}</p>}
                    {c.message && <p className="font-body text-sm mt-1 italic">"{c.message}"</p>}
                  </div>
                  <Button size="sm" onClick={() => onAccept(c.id)} className="font-display font-900 uppercase">
                    <Check className="w-4 h-4 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDecline(c.id)} className="font-display font-900 uppercase">
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-display font-900 uppercase text-sm mb-3">Sent ({outgoing.length})</h3>
        {outgoing.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground">You haven't sent any requests.</p>
        ) : (
          <ul className="space-y-2">
            {outgoing.map((c) => {
              const m = cache[c.recipient_id];
              return (
                <li key={c.id} className="border-2 border-foreground rounded-2xl p-3 flex items-center gap-3">
                  <button onClick={() => onOpenProfile(c.recipient_id)}><Avatar member={m ?? { full_name: null, photo_url: null }} /></button>
                  <div className="flex-1 min-w-0">
                    <button onClick={() => onOpenProfile(c.recipient_id)} className="font-display font-900 text-left hover:underline">{m?.full_name || "Member"}</button>
                    <p className="font-body text-xs text-muted-foreground">Sent {timeAgo(c.created_at)} · waiting for reply</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => onCancel(c.id)} className="font-display font-900 uppercase">
                    Cancel
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function MessagesListView({
  threads, cache, onOpen,
}: {
  threads: Array<{ otherId: string; lastMessage: Message; unread: number }>;
  cache: Record<string, Member>;
  onOpen: (id: string) => void;
}) {
  if (threads.length === 0) {
    return (
      <div className="border-2 border-dashed border-foreground/30 rounded-2xl p-8 text-center">
        <InboxIcon className="w-8 h-8 inline mb-2" />
        <p className="font-body text-muted-foreground">No messages yet. Connect with someone in the Directory to start a conversation.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {threads.map((t) => {
        const m = cache[t.otherId];
        return (
          <li key={t.otherId}>
            <button
              onClick={() => onOpen(t.otherId)}
              className="w-full border-2 border-foreground rounded-2xl p-3 flex items-center gap-3 hover:shadow-[3px_3px_0_0_hsl(var(--foreground))] transition-all text-left"
            >
              <Avatar member={m ?? { full_name: null, photo_url: null }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-900 truncate">{m?.full_name || "Member"}</span>
                  <span className="font-body text-xs text-muted-foreground shrink-0">{timeAgo(t.lastMessage.created_at)}</span>
                </div>
                <p className={`font-body text-sm truncate ${t.unread ? "font-semibold" : "text-muted-foreground"}`}>
                  {t.lastMessage.body}
                </p>
              </div>
              {t.unread > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-foreground border-2 border-foreground font-display font-900 text-[10px] flex items-center justify-center">
                  {t.unread}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ProfileView({
  userId, onBack, onMessage, onConnect, pending, accepted,
}: {
  userId: string;
  onBack: () => void;
  onMessage: (id: string) => void;
  onConnect: () => void;
  pending: boolean;
  accepted: boolean;
}) {
  const [profile, setProfile] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.rpc("get_member_profile", { _id: userId }).then(({ data }) => {
      setProfile((data as Member[] | null)?.[0] ?? null);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin inline" /></div>;
  if (!profile) {
    return (
      <div className="border-2 border-foreground rounded-2xl p-6 text-center">
        <p className="font-body text-muted-foreground mb-4">This member isn't visible.</p>
        <Button onClick={onBack} variant="outline">Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 font-display text-xs font-900 uppercase">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="border-2 border-foreground rounded-2xl p-6 bg-background">
        <div className="flex items-start gap-4">
          <Avatar member={profile} size={88} />
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-900 text-2xl">{profile.full_name || "Member"}</h2>
            {profile.home_town && (
              <p className="font-body text-sm text-muted-foreground inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {profile.home_town}
              </p>
            )}
            {profile.career_level && (
              <p className="font-body text-sm mt-1">Level: <strong>{profile.career_level}</strong></p>
            )}
          </div>
          <div className="flex gap-2">
            {accepted ? (
              <Button onClick={() => onMessage(userId)} className="font-display font-900 uppercase">
                <MessageCircle className="w-4 h-4 mr-1" /> Message
              </Button>
            ) : pending ? (
              <Button disabled variant="outline" className="font-display font-900 uppercase">
                <Clock className="w-4 h-4 mr-1" /> Pending
              </Button>
            ) : (
              <Button onClick={onConnect} className="font-display font-900 uppercase">
                <UserPlus className="w-4 h-4 mr-1" /> Connect
              </Button>
            )}
          </div>
        </div>
        {profile.member_bio && (
          <div className="mt-4">
            <h3 className="font-display font-900 uppercase text-xs mb-1">About</h3>
            <p className="font-body text-sm whitespace-pre-wrap">{profile.member_bio}</p>
          </div>
        )}
        {(profile.industry_interests || []).length > 0 && (
          <div className="mt-4">
            <h3 className="font-display font-900 uppercase text-xs mb-2">Industries</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.industry_interests!.map((i) => (
                <span key={i} className="text-xs font-display font-900 uppercase border-2 border-foreground rounded-full px-2.5 py-1">
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}
        {(profile.role_preferences || []).length > 0 && (
          <div className="mt-4">
            <h3 className="font-display font-900 uppercase text-xs mb-2">Roles they're interested in</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.role_preferences!.map((i) => (
                <span key={i} className="text-xs font-display font-900 uppercase border border-foreground/40 rounded-full px-2 py-0.5">
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadView({
  otherId, other, messages, loading, composer, setComposer, onSend, sending,
  isConnected, isPending, onConnect, onBack, onOpenProfile, threadEndRef, currentUserId,
}: {
  otherId: string;
  other: Member | undefined;
  messages: Message[];
  loading: boolean;
  composer: string;
  setComposer: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  isConnected: boolean;
  isPending: boolean;
  onConnect: () => void;
  onBack: () => void;
  onOpenProfile: () => void;
  threadEndRef: React.RefObject<HTMLDivElement>;
  currentUserId: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 font-display text-xs font-900 uppercase">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onOpenProfile} className="ml-2 inline-flex items-center gap-2 hover:underline">
          <Avatar member={other ?? { full_name: null, photo_url: null }} size={36} />
          <span className="font-display font-900">{other?.full_name || "Member"}</span>
        </button>
      </div>

      <div className="border-2 border-foreground rounded-2xl bg-background h-[320px] md:h-[420px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="font-body text-sm text-muted-foreground">
                {isConnected
                  ? "Say hi 👋"
                  : isPending
                    ? "Connection request sent — you can chat once they accept."
                    : "You're not connected yet — send a connection request to start chatting."}
              </p>
              {!isConnected && !isPending && (
                <Button onClick={onConnect} size="sm" className="font-display font-900 uppercase">
                  <UserPlus className="w-4 h-4 mr-1" /> Send connection request
                </Button>
              )}
            </div>
          ) : (
            messages.map((m, i) => {
              const mine = m.sender_id === currentUserId;
              const prev = messages[i - 1];
              const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
              return (
                <div key={m.id}>
                  {newDay && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-foreground/10" />
                      <span className="font-display font-700 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {dayLabel(m.created_at)}
                      </span>
                      <div className="flex-1 h-px bg-foreground/10" />
                    </div>
                  )}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 border-2 border-foreground ${mine ? "bg-primary" : "bg-muted/40"}`}>
                      <p className="font-body text-sm whitespace-pre-wrap break-words">{m.body}</p>
                      <p className="font-body text-[10px] text-muted-foreground mt-1 text-right">
                        {new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={threadEndRef} />
        </div>
        <div className="border-t-2 border-foreground p-3 pr-20 md:pr-3 flex gap-2">
          <Input
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder={isConnected ? "Write a message…" : isPending ? "Waiting for them to accept…" : "Connect first to message"}
            disabled={!isConnected || sending}
            className="border-2 border-foreground rounded-xl"
            maxLength={4000}
          />
          <Button onClick={onSend} disabled={!isConnected || sending || !composer.trim()} className="font-display font-900 uppercase">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
