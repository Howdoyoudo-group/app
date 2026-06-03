import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Heart, Send, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getOrgsForIndustry } from "@/data/mentoring-orgs";

interface MentorRow {
  id: string;
  full_name: string | null;
  photo_url: string | null;
  home_town: string | null;
  career_level: string | null;
  mentor_bio: string | null;
  mentor_offers: string[] | null;
  industry_interests: string[] | null;
  role_preferences: string[] | null;
}

interface Props {
  industrySlug?: string;
  industryName?: string;
  role?: string;
}

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

const MentorAvatar = ({ m, size = 56 }: { m: MentorRow; size?: number }) => (
  <div
    className="rounded-full overflow-hidden border-2 border-foreground bg-background flex items-center justify-center font-display font-900 shrink-0"
    style={{ width: size, height: size, fontSize: size / 2.6 }}
  >
    {m.photo_url ? (
      <img src={m.photo_url} alt={m.full_name || ""} className="w-full h-full object-cover" loading="lazy" />
    ) : (
      <span>{initials(m.full_name)}</span>
    )}
  </div>
);

export default function MentoringPanel({ industrySlug, industryName, role }: Props) {
  const { user } = useAuth();
  const orgs = getOrgsForIndustry(industrySlug);

  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Request dialog state
  const [target, setTarget] = useState<MentorRow | null>(null);
  const [reqMsg, setReqMsg] = useState("");
  const [sending, setSending] = useState(false);

  // Load mentors via secure RPC
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_mentor_directory", {
        _industry: industrySlug || null,
        _role: role || null,
        _limit: 60,
        _offset: 0,
      });
      if (!cancelled) {
        if (error) {
          console.error("[mentoring] rpc error", error);
          setMentors([]);
        } else {
          setMentors((data as MentorRow[]) || []);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [industrySlug, role]);

  const sendRequest = async () => {
    if (!user || !target || !reqMsg.trim()) return;
    setSending(true);
    const { error } = await supabase.from("mentor_requests").insert({
      mentee_id: user.id,
      mentor_id: target.id,
      industry: industrySlug || null,
      role: role || null,
      message: reqMsg.trim(),
    });
    if (error) {
      setSending(false);
      toast({ title: "Couldn't send request", description: error.message, variant: "destructive" });
      return;
    }
    // Fire-and-forget email notification to the mentor.
    supabase.functions.invoke("notify-member-event", {
      body: {
        event: "mentor_request",
        recipient_id: target.id,
        actor_id: user.id,
        message: reqMsg.trim(),
      },
    }).catch((e) => console.warn("[mentoring] notify failed", e));
    setSending(false);
    toast({ title: "Request sent", description: `${target.full_name} will get an email.` });
    setTarget(null);
    setReqMsg("");
  };

  return (
    <div className="space-y-12">
      {/* Intro */}
      <div className="max-w-3xl">
        <p className="text-foreground/70 font-body text-base leading-relaxed">
          Get a 30-minute chat with someone working in {industryName || "the industry"}. Pick from vetted external programmes
          or reach out to a member here who's offered to mentor.
        </p>
      </div>

      {/* External orgs */}
      <section>
        <div className="flex items-baseline justify-between mb-5 border-b-2 border-foreground pb-2">
          <h2 className="font-display text-2xl md:text-3xl font-900 tracking-tight">
            Mentoring programmes
          </h2>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">External</span>
        </div>
        {orgs.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgs.map((o) => (
                <a
                  key={o.url}
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border-2 border-foreground bg-background p-5 flex flex-col hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display font-900 text-lg leading-tight">{o.name}</h3>
                    <ExternalLink className="w-4 h-4 text-foreground/40 group-hover:text-primary shrink-0 mt-1" />
                  </div>
                  <p className="font-body text-sm text-foreground/75 leading-snug flex-1">{o.blurb}</p>
                  {o.whoFor && (
                    <p className="mt-3 text-xs font-body text-foreground/60 border-t border-foreground/10 pt-2">
                      <span className="font-700">For:</span> {o.whoFor}
                    </p>
                  )}
                  <p className="mt-1 text-xs font-body text-primary font-700">{o.cost || "Free"}</p>
                </a>
              ))}
            </div>
            <div className="mt-4">
              <Link
                to="/resources/mentoring"
                className="inline-flex items-center gap-1 text-sm font-700 text-primary hover:underline"
              >
                Browse generic mentoring services →
              </Link>
            </div>
          </>
        ) : (
          <Link
            to="/resources/mentoring"
            className="block border-2 border-foreground bg-primary/5 p-6 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-900 text-lg mb-1">
                  No {industryName || "industry"}-specific programme listed yet
                </h3>
                <p className="font-body text-sm text-foreground/75">
                  Head to Learning Resources → Mentoring for a number of generic mentoring services —
                  cross-industry schemes, social-mobility programmes, STEM, entrepreneurship and more.
                </p>
              </div>
              <span className="shrink-0 text-primary font-700 text-sm whitespace-nowrap">Open →</span>
            </div>
          </Link>
        )}
      </section>


      {/* Member mentors */}
      <section>
        <div className="flex items-baseline justify-between mb-5 border-b-2 border-foreground pb-2">
          <h2 className="font-display text-2xl md:text-3xl font-900 tracking-tight">
            Members offering mentoring
          </h2>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">
            {mentors.length} {mentors.length === 1 ? "mentor" : "mentors"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading mentors…
          </div>
        ) : mentors.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/30 p-8 text-center">
            <Heart className="w-8 h-8 mx-auto mb-3 text-foreground/40" />
            <p className="font-body text-foreground/70 mb-1">No member mentors here yet.</p>
            <p className="font-body text-sm text-foreground/50">
              {user ? (
                <>Be the first — turn on <Link to="/my-profile" className="underline text-primary">"Offer mentoring"</Link> in your profile.</>
              ) : (
                "Sign in and offer 30 mins to help someone starting out."
              )}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((m) => (
              <div key={m.id} className="border-2 border-foreground bg-background p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <MentorAvatar m={m} />
                  <div className="min-w-0">
                    <p className="font-display font-900 text-base leading-tight truncate">{m.full_name}</p>
                    {m.home_town && (
                      <p className="text-xs text-foreground/60 font-body truncate">{m.home_town}</p>
                    )}
                  </div>
                </div>
                {m.mentor_bio && (
                  <p className="font-body text-sm text-foreground/75 leading-snug flex-1">{m.mentor_bio}</p>
                )}
                {m.mentor_offers && m.mentor_offers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {m.mentor_offers.slice(0, 4).map((o) => (
                      <span key={o} className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary font-700">
                        {o}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => {
                    if (!user) {
                      toast({ title: "Sign in to request mentoring" });
                      return;
                    }
                    setTarget(m);
                  }}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Request 30 min
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Offer mentoring — managed from MyProfile */}
      {user && (
        <section className="border-2 border-foreground bg-primary/5 p-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-900 mb-1">Want to mentor?</h3>
            <p className="font-body text-sm text-foreground/70">
              Toggle "Offer mentoring" in your profile to appear in this grid across the industries and roles you follow.
            </p>
          </div>
          <Link
            to="/my-profile"
            className="shrink-0 border-2 border-foreground bg-background px-4 py-2 text-sm font-700 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Open profile
          </Link>
        </section>
      )}

      {!user && (
        <section className="border-2 border-foreground bg-primary/5 p-6 text-center">
          <UserPlus className="w-6 h-6 mx-auto mb-2 text-primary" />
          <h3 className="font-display text-xl font-900 mb-1">Sign in to request or offer mentoring</h3>
          <Link to="/auth" className="inline-block mt-2 text-primary font-700 underline">
            Sign in
          </Link>
        </section>
      )}

      {/* Request dialog */}
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request 30 min with {target?.full_name}</DialogTitle>
            <DialogDescription>
              Say hi and explain what you'd like to chat about. They'll get a notification and can accept or decline.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Hi! I'm starting out in… I'd love to ask you about…"
            value={reqMsg}
            onChange={(e) => setReqMsg(e.target.value)}
            rows={5}
            maxLength={600}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button disabled={sending || reqMsg.trim().length < 10} onClick={sendRequest}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
