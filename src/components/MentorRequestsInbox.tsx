import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2, HeartHandshake, Check, X, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface MentorRequest {
  id: string;
  mentee_id: string;
  mentor_id: string;
  message: string;
  industry: string | null;
  role: string | null;
  status: string;
  response_note: string | null;
  created_at: string;
  responded_at: string | null;
}

interface ProfileLite {
  id: string;
  full_name: string | null;
  photo_url: string | null;
  home_town: string | null;
}

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

const Avatar = ({ p, size = 44 }: { p?: ProfileLite; size?: number }) => (
  <div
    className="rounded-full overflow-hidden border-2 border-foreground bg-background flex items-center justify-center font-display font-900 shrink-0"
    style={{ width: size, height: size, fontSize: size / 2.6 }}
  >
    {p?.photo_url ? (
      <img src={p.photo_url} alt={p.full_name || ""} className="w-full h-full object-cover" loading="lazy" />
    ) : (
      <span>{initials(p?.full_name || null)}</span>
    )}
  </div>
);

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-[hsl(45,100%,75%)] text-foreground" },
  accepted: { label: "Accepted", cls: "bg-primary text-foreground" },
  declined: { label: "Declined", cls: "bg-foreground/10 text-foreground/60" },
  cancelled: { label: "Cancelled", cls: "bg-foreground/10 text-foreground/60" },
};

export default function MentorRequestsInbox() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<MentorRequest[]>([]);
  const [outgoing, setOutgoing] = useState<MentorRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: inc }, { data: out }] = await Promise.all([
      supabase
        .from("mentor_requests")
        .select("*")
        .eq("mentor_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("mentor_requests")
        .select("*")
        .eq("mentee_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    const incArr = (inc as MentorRequest[]) || [];
    const outArr = (out as MentorRequest[]) || [];
    setIncoming(incArr);
    setOutgoing(outArr);

    // Hydrate counterpart profiles
    const ids = new Set<string>();
    incArr.forEach((r) => ids.add(r.mentee_id));
    outArr.forEach((r) => ids.add(r.mentor_id));
    if (ids.size > 0) {
      const map: Record<string, ProfileLite> = {};
      await Promise.all(
        Array.from(ids).map(async (id) => {
          const { data } = await supabase.rpc("get_member_profile", { _id: id });
          const row = Array.isArray(data) ? data[0] : null;
          if (row) {
            map[id] = {
              id: row.id,
              full_name: row.full_name,
              photo_url: row.photo_url,
              home_town: row.home_town,
            };
          }
        })
      );
      setProfiles(map);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (req: MentorRequest, status: "accepted" | "declined") => {
    setActingOn(req.id);
    const { error } = await supabase
      .from("mentor_requests")
      .update({ status, responded_at: new Date().toISOString() })
      .eq("id", req.id);
    setActingOn(null);
    if (error) {
      toast({ title: "Couldn't update", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: status === "accepted" ? "Accepted!" : "Declined",
      description: status === "accepted" ? "Start a chat to work out a time that suits you both." : undefined,
    });
    load();
  };

  const cancel = async (req: MentorRequest) => {
    setActingOn(req.id);
    const { error } = await supabase
      .from("mentor_requests")
      .update({ status: "cancelled" })
      .eq("id", req.id);
    setActingOn(null);
    if (error) {
      toast({ title: "Couldn't cancel", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  if (!user) return null;

  const pendingIncoming = incoming.filter((r) => r.status === "pending").length;

  return (
    <div className="border-2 border-foreground rounded-2xl overflow-hidden">
      <div className="bg-[hsl(160,80%,80%)] border-b-2 border-foreground px-4 py-3 flex items-center gap-2">
        <HeartHandshake className="w-4 h-4 text-foreground" />
        <h2 className="font-display font-900 text-sm uppercase tracking-wider text-foreground">
          Mentoring
        </h2>
        {pendingIncoming > 0 && (
          <span className="ml-auto bg-primary text-foreground font-display font-900 text-[10px] px-2 py-0.5 rounded-full border-2 border-foreground">
            {pendingIncoming} pending
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-6 flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : incoming.length === 0 && outgoing.length === 0 ? (
        <div className="p-6 text-center font-body text-sm text-foreground/60">
          No mentor requests yet. Browse <a href="/mentoring" className="text-primary underline font-700">Mentoring</a> to send one or offer 30 mins of your time.
        </div>
      ) : (
        <div className="divide-y-2 divide-foreground/10">
          {incoming.length > 0 && (
            <div className="p-4">
              <h3 className="font-display text-xs font-900 uppercase tracking-wider text-foreground/70 mb-3">
                Requests for you ({incoming.length})
              </h3>
              <ul className="space-y-3">
                {incoming.map((req) => {
                  const p = profiles[req.mentee_id];
                  const s = STATUS_LABEL[req.status] || STATUS_LABEL.pending;
                  return (
                    <li key={req.id} className="flex items-start gap-3 border border-foreground/15 p-3 rounded-xl">
                      <Avatar p={p} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-display font-900 text-sm truncate">{p?.full_name || "A member"}</p>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-display font-700 ${s.cls}`}>{s.label}</span>
                          {req.industry && <span className="text-[10px] text-foreground/50 font-body">· {req.industry}</span>}
                        </div>
                        <p className="font-body text-sm text-foreground/80 leading-snug whitespace-pre-wrap">{req.message}</p>
                        {req.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" disabled={actingOn === req.id} onClick={() => respond(req, "accepted")}>
                              <Check className="w-3.5 h-3.5 mr-1" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" disabled={actingOn === req.id} onClick={() => respond(req, "declined")}>
                              <X className="w-3.5 h-3.5 mr-1" /> Decline
                            </Button>
                          </div>
                        )}
                        {req.status === "accepted" && (
                          <Button size="sm" className="mt-3" asChild>
                            <Link to={`/community/members?thread=${req.mentee_id}`}>
                              <MessageCircle className="w-3.5 h-3.5 mr-1" /> Start a chat to work out a time
                            </Link>
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {outgoing.length > 0 && (
            <div className="p-4">
              <h3 className="font-display text-xs font-900 uppercase tracking-wider text-foreground/70 mb-3">
                Your requests ({outgoing.length})
              </h3>
              <ul className="space-y-3">
                {outgoing.map((req) => {
                  const p = profiles[req.mentor_id];
                  const s = STATUS_LABEL[req.status] || STATUS_LABEL.pending;
                  return (
                    <li key={req.id} className="flex items-start gap-3 border border-foreground/15 p-3 rounded-xl">
                      <Avatar p={p} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-display font-900 text-sm truncate">{p?.full_name || "Mentor"}</p>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-display font-700 ${s.cls}`}>{s.label}</span>
                          {req.industry && <span className="text-[10px] text-foreground/50 font-body">· {req.industry}</span>}
                        </div>
                        <p className="font-body text-sm text-foreground/70 leading-snug line-clamp-2 whitespace-pre-wrap">{req.message}</p>
                        {req.status === "pending" && (
                          <Button size="sm" variant="ghost" className="mt-2 -ml-2 h-7 px-2 text-xs" disabled={actingOn === req.id} onClick={() => cancel(req)}>
                            <Clock className="w-3 h-3 mr-1" /> Cancel request
                          </Button>
                        )}
                        {req.status === "accepted" && (
                          <Button size="sm" className="mt-3" asChild>
                            <Link to={`/community/members?thread=${req.mentor_id}`}>
                              <MessageCircle className="w-3.5 h-3.5 mr-1" /> Start a chat to work out a time
                            </Link>
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
