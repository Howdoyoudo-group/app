import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { INDUSTRIES } from "@/data/industries";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Flame, Calendar, ArrowRight, MapPin, MessageCircle,
  Sparkles, Activity, TrendingUp, Flag, Compass, Inbox,
} from "lucide-react";
import { ReportUserDialog } from "@/components/ReportUserDialog";
import { useAuth } from "@/contexts/AuthContext";
import howdyMascot from "@/assets/howdy-mascot.png";

import { getIndustryImage } from "@/components/feed/feedUtils";
import CourseOfTheDay from "@/components/community/CourseOfTheDay";
import IndustryDoodle from "@/components/feed/IndustryDoodle";

const LIME = "hsl(120, 100%, 45%)";

// ---------- Dummy seed (clearly labelled) ----------
const FIRST_NAMES = ["James","Lucy","Ben","Maya","Alex","Sophie","Tom","Olivia","Sarah","Noah","Ava","Liam","Mia","Ethan","Zara","Jake","Ruby","Ollie","Grace","Finn"];
const LOCATIONS = ["London","Manchester","Bristol","Edinburgh","Leeds","Birmingham","Brighton","Glasgow","Liverpool"];
const ACTIONS = [
  (n: string) => `${n} joined the community`,
  (n: string) => `${n} attended a live event`,
  (n: string) => `${n} completed a mentoring session`,
  (n: string) => `${n} started a new role`,
  (n: string) => `${n} posted in the discussion board`,
  (n: string) => `${n} shared a CV win`,
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const peopleAround = (slug: string) => {
  const h = hash(slug + "p");
  return Array.from({ length: 4 }).map((_, i) => {
    const name = FIRST_NAMES[(h + i * 7) % FIRST_NAMES.length];
    const loc = LOCATIONS[(h + i * 3) % LOCATIONS.length];
    const status = ["Active now", "Active 1h ago", "Active 2h ago", "Active 4h ago"][i];
    return { name, loc, status };
  });
};

const activityFor = (slug: string, label: string) => {
  const h = hash(slug + "a");
  return Array.from({ length: 6 }).map((_, i) => {
    const name = FIRST_NAMES[(h + i * 5) % FIRST_NAMES.length];
    const action = ACTIONS[(h + i) % ACTIONS.length](name);
    const ago = ["just now", "12m ago", "1h ago", "2h ago", "5h ago", "1d ago"][i];
    return { name, action, ago, label };
  });
};

// ---------- Types ----------
interface EventRow {
  id: string;
  title: string;
  industry: string;
  starts_on: string | null;
  date_label: string | null;
  location: string | null;
  url: string;
  event_type: string | null;
}

// ---------- Helpers ----------
const DummyTag = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-flex items-center rounded-full bg-foreground/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-foreground/60 ${className}`}
    title="Placeholder content — real activity coming soon"
  >
    Dummy
  </span>
);

const RealTag = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${className}`}
    style={{ background: "hsl(120, 80%, 92%)", color: "hsl(140, 70%, 22%)" }}
    title="Real opted-in member"
  >
    <span className="w-1 h-1 rounded-full" style={{ background: "hsl(140, 70%, 30%)" }} />
    Real
  </span>
);

const SectionHeader = ({ title, action, dummy }: { title: React.ReactNode; action?: React.ReactNode; dummy?: boolean }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <h2 className="font-display text-xs tracking-[0.2em] uppercase text-foreground/80">{title}</h2>
      {dummy && <DummyTag />}
    </div>
    {action}
  </div>
);


const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  const initials = name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const hues = [12, 45, 120, 200, 280, 330];
  const hue = hues[hash(name) % hues.length];
  return (
    <div
      className="flex items-center justify-center rounded-full font-display text-white shrink-0"
      style={{
        width: size, height: size,
        background: `hsl(${hue}, 65%, 55%)`,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
};

const formatWhen = (e: EventRow): string => {
  if (e.starts_on) {
    const d = new Date(e.starts_on);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }
  return e.date_label || "Upcoming";
};

type RealMember = {
  id: string;
  first_name: string | null;
  photo_url: string | null;
  home_town: string | null;
  industry_interests: string[] | null;
  created_at: string | null;
};

function joinedLabel(created_at: string | null): string {
  if (!created_at) return "New member";
  const days = Math.floor((Date.now() - new Date(created_at).getTime()) / 86_400_000);
  if (days === 0) return "Joined today";
  if (days === 1) return "Joined yesterday";
  if (days < 7) return `Joined ${days} days ago`;
  if (days < 30) return `Joined ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  if (days < 365) return `Joined ${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
  return "Long-time member";
}

const Community = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string>("all");
  const [followers, setFollowers] = useState<Record<string, number>>({});
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [realMembers, setRealMembers] = useState<RealMember[]>([]);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [userIndustries, setUserIndustries] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setPhotoUrl(null); setFirstName(null); setUserIndustries([]); return; }
    let cancelled = false;
    (async () => {
      const meta = (user.user_metadata as any) || {};
      const metadataPhoto = meta.avatar_url || meta.picture || null;
      const { data } = await supabase
        .from("profiles")
        .select("photo_url, full_name, industry_interests")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setPhotoUrl((data as any)?.photo_url || metadataPhoto || null);
      const fullName = (data as any)?.full_name as string | null;
      setFirstName(
        (fullName ? fullName.trim().split(/\s+/)[0] : null)
          || meta.first_name
          || (typeof meta.full_name === "string" ? meta.full_name.split(" ")[0] : null)
          || (typeof meta.name === "string" ? meta.name.split(" ")[0] : null)
      );
      setUserIndustries(((data as any)?.industry_interests as string[]) || []);
    })();
    return () => { cancelled = true; };
  }, [user]);



  // Real data: follower counts by industry (aggregated via RPC, no PII)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [followersRes, countRes] = await Promise.all([
        (supabase as any).rpc("get_industry_follower_counts"),
        (supabase as any).rpc("get_total_member_count"),
      ]);
      if (cancelled) return;
      const counts: Record<string, number> = {};
      ((followersRes.data as Array<{ industry: string; follower_count: number }>) || []).forEach((row) => {
        const key = String(row.industry || "").trim();
        if (!key) return;
        counts[key] = Number(row.follower_count) || 0;
      });
      setFollowers(counts);
      setTotalMembers(Number(countRes.data) || 0);
    })();
    return () => { cancelled = true; };
  }, []);


  // Real data: upcoming events (filtered by selected industry)
  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      let q = supabase
        .from("industry_events")
        .select("id,title,industry,starts_on,date_label,location,url,event_type")
        .or(`starts_on.gte.${today},starts_on.is.null`)
        .order("starts_on", { ascending: true, nullsFirst: false })
        .limit(selected === "all" ? 12 : 6);
      if (selected !== "all") q = q.eq("industry", selected);
      const { data } = await q;
      if (cancelled) return;
      setEvents((data as EventRow[]) || []);
      setEventsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selected]);

  // Real data: opted-in members (first name + photo only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const industryName = selected === "all"
        ? null
        : INDUSTRIES.find(i => i.slug === selected)?.name ?? selected;
      const { data } = await (supabase as any).rpc("get_public_member_preview", {
        _industry: industryName,
        _limit: 12,
      });
      let members = ((data as RealMember[]) || []);
      if (selected !== "all" && members.length < 6) {
        const { data: fallbackData } = await (supabase as any).rpc("get_public_member_preview", {
          _industry: null,
          _limit: 12,
        });
        const seen = new Set(members.map((m) => m.id));
        members = [
          ...members,
          ...(((fallbackData as RealMember[]) || []).filter((m) => !seen.has(m.id))),
        ];
      }
      if (cancelled) return;
      setRealMembers(members);
    })();
    return () => { cancelled = true; };
  }, [selected]);



  const industryLabel = useMemo(() => {
    if (selected === "all") return "the community";
    return INDUSTRIES.find(i => i.slug === selected)?.name ?? "the community";
  }, [selected]);

  const followersFor = (slug: string): number => {
    const ind = INDUSTRIES.find(i => i.slug === slug);
    if (!ind) return 0;
    const keys = [ind.name, slug, ind.name.toLowerCase()];
    for (const k of keys) {
      if (followers[k]) return followers[k];
    }
    // case-insensitive scan
    const lower = ind.name.toLowerCase();
    for (const [k, v] of Object.entries(followers)) {
      if (k.toLowerCase() === lower || k.toLowerCase() === slug) return v;
    }
    return 0;
  };


  const slugKey = selected === "all" ? "community" : selected;
  const totalFollowersSelected = selected === "all" ? totalMembers : followersFor(selected);

  const around = peopleAround(slugKey);
  const activity = activityFor(slugKey, industryLabel);
  const discussion = `Breaking into ${selected === "all" ? "the industry you love" : industryLabel}`;

  const ranked = useMemo(
    () => [...INDUSTRIES]
      .map(i => ({ ...i, members: followersFor(i.slug) }))
      .sort((a, b) => b.members - a.members),
    [followers]
  );

  const nextEvent = events[0];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        path="/community"
        title="Community — Howdoyoudo"
        description="See who's around, what's happening across industries, and join live events."
      />
      <SiteNav />

      <main className={user
        ? "max-w-3xl lg:max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-[120px] space-y-10"
        : "max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-10"
      }>
        {/* Editorial header — matches MyInbox lockup */}
        {user ? (
          <>
            <header className="flex items-start gap-3 sm:gap-4 mb-7 sm:mb-9">
              <Link
                to="/my-profile"
                aria-label="My Profile"
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-muted shrink-0 ring-1 ring-foreground/10 hover:ring-foreground/30 transition mt-1"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-foreground/5 flex items-center justify-center font-display font-900 text-foreground text-lg">
                    {(firstName?.[0] || user?.email?.[0] || "?").toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#00E600] ring-2 ring-background" aria-hidden />
              </Link>

              <div className="flex-1 min-w-0">
                <h1 className="font-display font-900 text-[26px] sm:text-[34px] leading-[1.02] tracking-tight text-foreground break-words">
                  Howdoyoudo<span className="text-[#00E600]">?</span>
                  {firstName ? (
                    <>
                      <br />
                      <span className="text-[#00E600]">{firstName}</span>
                    </>
                  ) : null}
                </h1>
                <p className="mt-2 font-body text-[13px] sm:text-sm text-foreground/55 leading-snug">
                  Your world. Your feed. Your opportunities.
                </p>
              </div>

              <Link
                to="/my-jobs"
                aria-label="Open inbox"
                className="relative w-11 h-11 rounded-full flex items-center justify-center text-foreground bg-foreground/[0.04] hover:bg-foreground/10 transition shrink-0 mt-1"
              >
                <Inbox className="w-[20px] h-[20px]" />
              </Link>
              <Link
                to="/howdy"
                aria-label="Open Howdy"
                className="relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-1 bg-[#00E600] ring-2 ring-foreground/10 hover:ring-foreground/30 transition overflow-hidden"
              >
                <img src={howdyMascot} alt="" className="w-8 h-8 object-contain" />
              </Link>
            </header>

          </>
        ) : (
          <header>
            <p className="font-display text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
              The Community
            </p>
            <h1 className="font-display text-4xl md:text-6xl leading-none">
              Who's around in{" "}
              <span style={{ color: LIME }}>{industryLabel}</span>.
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Live activity, upcoming events and people you should meet across the industries we love and live in.
            </p>
          </header>
        )}

        {/* Industry filter chips */}
        <section className="pt-2">
          <div className="mb-8">
            <SectionHeader title={<>See who's in your <span style={{ color: LIME }}>community</span></>} />
          </div>
          <div className="flex gap-3 overflow-x-auto pt-1 pb-2 px-1 scrollbar-hide snap-x">
            {(() => {
              const validSlugs = new Set(INDUSTRIES.map(i => i.slug));
              const toSlug = (name: string) =>
                name.toLowerCase()
                  .replace("film and tv", "cinema")
                  .replace("food & drink", "hospitality")
                  .replace(/\s+/g, "-");
              const userSlugs = userIndustries.map(toSlug).filter(s => validSlugs.has(s));
              const seen = new Set<string>();
              const ordered: { slug: string; name: string }[] = [{ slug: "all", name: "All" }];
              for (const s of userSlugs) {
                if (!seen.has(s)) {
                  const ind = INDUSTRIES.find(i => i.slug === s);
                  if (ind) { ordered.push({ slug: ind.slug, name: ind.name }); seen.add(s); }
                }
              }
              for (const ind of INDUSTRIES) {
                if (!seen.has(ind.slug)) { ordered.push({ slug: ind.slug, name: ind.name }); seen.add(ind.slug); }
              }
              return ordered.map((i) => {
                const isActive = selected === i.slug;
                return (
                  <button
                    key={i.slug}
                    onClick={() => setSelected(i.slug)}
                    className="shrink-0 snap-start flex flex-col items-center gap-1.5 w-[72px] focus:outline-none group"
                    aria-pressed={isActive}
                    aria-label={i.name}
                  >
                    <span
                      className={`relative inline-flex items-center justify-center rounded-full transition-all ${
                        isActive
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "opacity-80 group-hover:opacity-100"
                      }`}
                      style={{ width: 56, height: 56 }}
                    >
                      {i.slug === "all" ? (
                        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-foreground/10 font-display text-[11px] uppercase tracking-wider">All</span>
                      ) : (
                        <IndustryDoodle industry={i.slug} size={56} />
                      )}
                    </span>
                    <span
                      className={`font-display font-700 text-[9px] uppercase tracking-[0.06em] text-center leading-[1.15] break-words hyphens-auto w-full px-0.5 ${
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {i.name}
                    </span>
                  </button>
                );
              });
            })()}
          </div>
        </section>


        {/* Top stats row */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 border-2 border-foreground/10 bg-[hsl(120,60%,96%)]">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              <span className="font-display text-xs tracking-[0.2em] uppercase">
                {selected === "all" ? "Members" : `${industryLabel} followers`}
              </span>
            </div>
            <div className="font-display text-4xl md:text-5xl leading-none">
              {totalFollowersSelected.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selected === "all" ? "registered members" : "people following this industry"}
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 rounded-xl border-2 border-foreground/10 bg-background p-3">
                <Flame className="w-4 h-4 text-[hsl(20,90%,55%)] shrink-0" />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    Most discussed <DummyTag />
                  </div>
                  <div className="text-sm font-semibold">{discussion}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3 rounded-xl border-2 border-foreground/10 bg-background p-3">
                <Calendar className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next event</div>
                  <div className="text-sm font-semibold truncate">
                    {nextEvent ? nextEvent.title : (eventsLoading ? "Loading…" : "No upcoming events")}
                  </div>
                </div>
                {nextEvent && (
                  <div className="text-xs text-muted-foreground text-right shrink-0">{formatWhen(nextEvent)}</div>
                )}
              </div>
              <CourseOfTheDay industry={selected} industryLabel={industryLabel} />
            </div>
          </Card>

          <Card className="p-5 border-2 border-foreground/10">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="font-display text-xs tracking-[0.2em] uppercase">New Members</span>
              <RealTag />
            </div>
            <div className="space-y-3">
              {realMembers.slice(0, 4).map((m) => {
                const name = m.first_name || "Member";
                return (
                  <div key={`real-${m.id}`} className="flex items-center gap-3">
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <Avatar name={name} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {joinedLabel(m.created_at)}
                        {m.home_town ? ` · ${m.home_town}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        to={`/community/members?thread=${m.id}`}
                        aria-label={`Message ${name}`}
                        title={`Message ${name}`}
                        className="rounded-full border-2 border-foreground/15 p-2 hover:border-foreground/40"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setReportTarget({ id: m.id, name })}
                        aria-label={`Report ${name}`}
                        title={`Report ${name}`}
                        className="rounded-full border-2 border-foreground/15 p-2 hover:border-destructive/60 hover:text-destructive"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {realMembers.length === 0 && (
                <p className="text-sm text-muted-foreground">No members to show yet.</p>
              )}
            </div>
          </Card>

        </section>




        {/* Two columns: events + activity */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SectionHeader
              title="Upcoming events"
              action={<Link to="/howdy/events" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: LIME }}>View all <ArrowRight className="w-3 h-3" /></Link>}
            />
            <div className="space-y-3">
              {eventsLoading && (
                <Card className="p-4 border-2 border-foreground/10 text-sm text-muted-foreground">Loading events…</Card>
              )}
              {!eventsLoading && events.length === 0 && (
                <Card className="p-4 border-2 border-foreground/10 text-sm text-muted-foreground">
                  No upcoming events for {industryLabel} yet.
                </Card>
              )}
              {events.slice(0, 6).map((e) => {
                const indName = INDUSTRIES.find(i => i.slug === e.industry)?.name ?? e.industry;
                return (
                  <a
                    key={e.id}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="p-4 border-2 border-foreground/10 flex items-start gap-4 hover:border-foreground/40 transition-colors">
                      <div className="rounded-lg bg-[hsl(120,60%,96%)] p-3 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-base leading-tight">{e.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatWhen(e)}</span>
                          {e.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</span>}
                          {selected === "all" && <span className="rounded-full bg-foreground/5 px-2 py-0.5">{indName}</span>}
                        </div>
                      </div>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <SectionHeader
              title="What's happening"
              dummy
              action={<span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Activity className="w-3 h-3" /> preview</span>}
            />
            <Card className="p-4 border-2 border-foreground/10 divide-y divide-foreground/5">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar name={a.name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{a.action}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {a.label} · {a.ago}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </section>

        {/* People you should meet */}
        <section>
          <SectionHeader
            title="People you should meet"
            action={<Link to="/community/members" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: LIME }}>Real directory <ArrowRight className="w-3 h-3" /></Link>}
          />
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <RealTag />
            <span className="text-foreground/40 text-[10px]">+</span>
            <DummyTag />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Real opted-in members first */}
            {realMembers.slice(0, 6).map((m) => {
              const name = m.first_name || "Member";
              return (
                <Card key={`real-meet-${m.id}`} className="p-4 border-2 border-foreground/10 flex items-center gap-3">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <Avatar name={name} size={48} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                      {name}
                      <RealTag />
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {industryLabel === "the community" ? "Member" : industryLabel}
                      {m.home_town ? ` · ${m.home_town}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/community/members?thread=${m.id}`}
                      aria-label={`Message ${name}`}
                      title={`Message ${name}`}
                      className="rounded-full border-2 border-foreground/15 p-2 hover:border-foreground/40"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setReportTarget({ id: m.id, name })}
                      aria-label={`Report ${name}`}
                      title={`Report ${name}`}
                      className="rounded-full border-2 border-foreground/15 p-2 hover:border-destructive/60 hover:text-destructive"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}

            {/* Dummy fillers to keep the section full */}
            {Array.from({ length: Math.max(0, 6 - realMembers.slice(0, 6).length) }).map((_, i) => {
              const name = FIRST_NAMES[(hash(slugKey + "meet") + i * 3) % FIRST_NAMES.length] + " " +
                ["Chen","Hughes","Lane","Patel","Okafor","Walsh"][i % 6];
              const roles = ["Producer","Brand Manager","Founder","Mentor","Industry Expert","Recruiter"];
              const tag = roles[i % roles.length];
              return (
                <Card key={`dummy-meet-${i}`} className="p-4 border-2 border-foreground/10 flex items-center gap-3 opacity-80">
                  <Avatar name={name} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                      {name}
                      <DummyTag />
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {tag} · {industryLabel === "the community" ? "Cross-industry" : industryLabel}
                    </div>
                    <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider rounded-full bg-[hsl(120,60%,94%)] px-2 py-0.5">
                      {tag}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Community Chat coming soon */}
        <section className="rounded-3xl border-2 border-foreground p-6 md:p-8 bg-background flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-display uppercase tracking-wider"
                style={{ background: LIME, color: "#000" }}
              >
                <Sparkles className="w-3 h-3" /> Coming soon
              </span>
              <span className="font-display text-xs tracking-[0.2em] uppercase">Community Chat</span>
            </div>
            <h3 className="font-display text-xl md:text-2xl leading-tight mb-1">
              Live channels for members — opening soon.
            </h3>
            <p className="font-body text-sm text-muted-foreground max-w-xl">
              Read the guidelines, confirm you're 16+, and join the early list.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/community-chat">Read guidelines & join list</Link>
          </Button>
        </section>

        {/* Explore the industry you're in */}
        <section className="rounded-3xl border-2 border-foreground p-6 md:p-10 bg-[hsl(120,60%,96%)] flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4" />
              <span className="font-display text-xs tracking-[0.2em] uppercase">
                {selected === "all" ? "Pick an industry" : "Explore the industry you're in"}
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl leading-tight">
              {selected === "all"
                ? "Choose an industry above to dive deeper."
                : `Show up where ${industryLabel} hangs out.`}
            </h3>

            <p className="font-body text-sm text-muted-foreground mt-2 max-w-xl">
              {selected === "all"
                ? "Filter the community by industry to see live jobs, events, news and the people working in it."
                : `See the latest jobs, events, news and creators working in ${industryLabel}.`}
            </p>
          </div>
          {selected !== "all" && (
            <Button asChild size="lg" className="rounded-full">
              <Link to={`/${selected}`}>
                Open {industryLabel} <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          )}
        </section>
      </main>

      <Footer />




      {reportTarget && (
        <ReportUserDialog
          open={!!reportTarget}
          onOpenChange={(o) => { if (!o) setReportTarget(null); }}
          reportedUserId={reportTarget.id}
          reportedName={reportTarget.name}
          context="community-page"
        />
      )}
    </div>
  );
};

export default Community;
