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
  Sparkles, Flag, Compass, Inbox, GraduationCap, Briefcase, Play, ChevronLeft, ChevronRight, Send, Loader2,
} from "lucide-react";
import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
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

// ---------- Dummy member talks ----------
const MEMBER_TALKS = [
  {
    id: "talk-1",
    speaker: "Priya Nair",
    role: "Creative Director",
    industry: "Fashion",
    title: "How I went from intern to creative director in 6 years",
    duration: "18 min",
    views: "2.4k",
    tag: "Career journey",
    hue: 280,
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "talk-2",
    speaker: "Marcus Webb",
    role: "Football Agent",
    industry: "Football",
    title: "What agents actually do — and how to break in",
    duration: "24 min",
    views: "5.1k",
    tag: "Industry insight",
    hue: 45,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "talk-3",
    speaker: "Cleo Adeyemi",
    role: "Music Producer",
    industry: "Music",
    title: "Building a studio career without the connections",
    duration: "31 min",
    views: "3.8k",
    tag: "Real talk",
    hue: 200,
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "talk-4",
    speaker: "Jamie Thornton",
    role: "UX Lead",
    industry: "Gaming",
    title: "Getting your first games job from the outside",
    duration: "22 min",
    views: "1.9k",
    tag: "Getting in",
    hue: 12,
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    id: "talk-5",
    speaker: "Sophia Lindqvist",
    role: "Production Manager",
    industry: "Film & TV",
    title: "The real timeline of a TV career — what nobody tells you",
    duration: "27 min",
    views: "4.2k",
    tag: "Career journey",
    hue: 160,
    photo: "https://randomuser.me/api/portraits/women/21.jpg",
  },
  {
    id: "talk-6",
    speaker: "Dev Patel",
    role: "Brand Strategist",
    industry: "Marketing",
    title: "Pitching yourself when you have no case studies yet",
    duration: "15 min",
    views: "3.1k",
    tag: "Skills",
    hue: 330,
    photo: "https://randomuser.me/api/portraits/men/57.jpg",
  },
];

// ---------- Coaching marketplace packages (dummy until real bookings live) ----------
const COACH_PACKAGES = [
  { title: "60-min Career Clarity Session", price: "£45", tag: "Popular", desc: "Identify where you want to go and map a realistic path to get there." },
  { title: "CV & Portfolio Power-Up", price: "£35", tag: "Quick win", desc: "A working review of your CV or portfolio with actionable rewrites." },
  { title: "Mock Interview (industry-specific)", price: "£40", tag: "High impact", desc: "Practise real interview questions with a working industry professional." },
  { title: "3-Session Starter Package", price: "£110", tag: "Best value", desc: "Three tailored sessions spread across six weeks — goals, strategy, accountability." },
];

// ---------- Real mentor type (mirrors MentoringPanel) ----------
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

function mentorInitials(name: string | null) {
  if (!name) return "?";
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

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
  const talksScrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string>("all");
  const [followers, setFollowers] = useState<Record<string, number>>({});
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [realMembers, setRealMembers] = useState<RealMember[]>([]);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [mentorTarget, setMentorTarget] = useState<MentorRow | null>(null);
  const [mentorMsg, setMentorMsg] = useState("");
  const [mentorSending, setMentorSending] = useState(false);
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



  // Real mentors from DB, filtered by selected industry
  useEffect(() => {
    let cancelled = false;
    setMentorsLoading(true);
    (async () => {
      const industryName = selected === "all"
        ? null
        : INDUSTRIES.find(i => i.slug === selected)?.name ?? null;
      const { data, error } = await (supabase as any).rpc("get_mentor_directory", {
        _industry: industryName,
        _role: null,
        _limit: 4,
        _offset: 0,
      });
      if (!cancelled) {
        setMentors(error ? [] : (data as MentorRow[]) || []);
        setMentorsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selected]);

  const sendMentorRequest = async () => {
    if (!user || !mentorTarget || !mentorMsg.trim()) return;
    setMentorSending(true);
    const { error } = await supabase.from("mentor_requests").insert({
      mentee_id: user.id,
      mentor_id: mentorTarget.id,
      message: mentorMsg.trim(),
    });
    if (error) {
      setMentorSending(false);
      toast({ title: "Couldn't send request", description: error.message, variant: "destructive" });
      return;
    }
    supabase.functions.invoke("notify-member-event", {
      body: { event: "mentor_request", recipient_id: mentorTarget.id, actor_id: user.id, message: mentorMsg.trim() },
    }).catch(() => {});
    setMentorSending(false);
    toast({ title: "Request sent!", description: `${mentorTarget.full_name} will get an email.` });
    setMentorTarget(null);
    setMentorMsg("");
  };

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
                const dateBox = (() => {
                  if (e.starts_on) {
                    const d = new Date(e.starts_on + "T00:00:00");
                    if (!Number.isNaN(d.getTime())) {
                      return {
                        day: String(d.getDate()),
                        mon: d.toLocaleString("en-GB", { month: "short" }).toUpperCase(),
                      };
                    }
                  }
                  return { day: e.date_label?.split(" ")[0] ?? "TBC", mon: "" };
                })();
                return (
                  <a
                    key={e.id}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Card className="p-4 border-2 border-foreground/10 flex items-start gap-4 hover:border-foreground/40 transition-colors">
                      <div className="shrink-0 w-14 text-center border-2 border-foreground/15 py-2 rounded-lg self-start">
                        <div className="font-display font-700 text-2xl leading-none">{dateBox.day}</div>
                        {dateBox.mon && (
                          <div className="font-display text-[10px] tracking-widest mt-0.5 text-muted-foreground">{dateBox.mon}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-base leading-tight group-hover:text-primary transition-colors">{e.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {e.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</span>}
                          {selected === "all" && <span className="rounded-full bg-foreground/5 px-2 py-0.5">{indName}</span>}
                          {e.event_type && <span className="rounded-full bg-foreground/5 px-2 py-0.5 capitalize">{e.event_type}</span>}
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
              title={<>Members offering <span style={{ color: LIME }}>mentoring</span></>}
              action={
                <Link to="/mentoring" className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: LIME }}>
                  See all <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />
            <div className="space-y-3">
              {mentorsLoading && (
                <Card className="p-4 border-2 border-foreground/10 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" /> Loading mentors…
                </Card>
              )}
              {!mentorsLoading && mentors.length === 0 && (
                <Card className="p-5 border-2 border-foreground/10 text-center">
                  <GraduationCap className="w-6 h-6 mx-auto mb-2 text-foreground/30" />
                  <p className="text-sm text-muted-foreground mb-1">No mentors listed for this industry yet.</p>
                  <Link to="/mentoring" className="text-xs font-semibold underline" style={{ color: LIME }}>
                    Browse all mentors →
                  </Link>
                </Card>
              )}
              {mentors.map((m) => {
                const name = m.full_name || "Member";
                return (
                  <Card key={m.id} className="p-4 border-2 border-foreground/10 flex items-start gap-3">
                    <div
                      className="rounded-full overflow-hidden border-2 border-foreground/10 bg-muted flex items-center justify-center font-display font-900 shrink-0 text-sm"
                      style={{ width: 44, height: 44 }}
                    >
                      {m.photo_url
                        ? <img src={m.photo_url} alt={name} className="w-full h-full object-cover" />
                        : <span>{mentorInitials(m.full_name)}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                        {name}
                        <RealTag />
                      </div>
                      {m.home_town && (
                        <div className="text-xs text-muted-foreground truncate">{m.home_town}</div>
                      )}
                      {m.mentor_bio && (
                        <div className="text-xs text-foreground/70 mt-1 line-clamp-2">{m.mentor_bio}</div>
                      )}
                      {m.mentor_offers && m.mentor_offers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {m.mentor_offers.slice(0, 3).map((o) => (
                            <span key={o} className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                              {o}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) { toast({ title: "Sign in to request mentoring" }); return; }
                        setMentorTarget(m);
                      }}
                      className="shrink-0 mt-0.5 rounded-full border-2 border-foreground/20 px-3 py-1.5 text-[11px] font-semibold hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                    >
                      30 min
                    </button>
                  </Card>
                );
              })}
            </div>
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

        {/* Member Talks carousel */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xs tracking-[0.2em] uppercase text-foreground/80">
                Member <span style={{ color: LIME }}>Talks</span>
              </h2>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{ background: LIME, color: "#000" }}
              >
                <Sparkles className="w-2.5 h-2.5" /> Coming soon
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => talksScrollRef.current?.scrollBy({ left: -280, behavior: "smooth" })}
                className="w-8 h-8 rounded-full border-2 border-foreground/15 flex items-center justify-center hover:border-foreground/40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => talksScrollRef.current?.scrollBy({ left: 280, behavior: "smooth" })}
                className="w-8 h-8 rounded-full border-2 border-foreground/15 flex items-center justify-center hover:border-foreground/40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={talksScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-2"
          >
            {MEMBER_TALKS.map((talk) => (
              <div
                key={talk.id}
                className="shrink-0 snap-start w-[260px] sm:w-[300px] rounded-2xl border-2 border-foreground/10 overflow-hidden cursor-pointer hover:border-foreground/30 transition-colors group opacity-90"
              >
                {/* Thumbnail */}
                <div
                  className="relative h-[140px] flex items-center justify-center overflow-hidden"
                  style={{ background: `hsl(${talk.hue}, 45%, 82%)` }}
                >
                  {/* Speaker photo */}
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={talk.photo}
                      alt={talk.speaker}
                      className="rounded-full object-cover shadow-md ring-4 ring-white/40"
                      style={{ width: 80, height: 80 }}
                    />
                    <div
                      className="font-display font-700 text-[11px] uppercase tracking-widest"
                      style={{ color: `hsl(${talk.hue}, 55%, 28%)` }}
                    >
                      {talk.industry}
                    </div>
                  </div>
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-md">
                      <Play className="w-5 h-5 ml-0.5" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {talk.duration}
                  </span>
                </div>
                {/* Info */}
                <div className="p-3">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ background: `hsl(${talk.hue}, 55%, 90%)`, color: `hsl(${talk.hue}, 50%, 30%)` }}
                  >
                    {talk.tag}
                  </span>
                  <div className="font-display font-700 text-sm leading-snug line-clamp-2 mb-2">
                    {talk.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground truncate">
                      {talk.speaker} · {talk.role}
                    </div>
                    <div className="text-[11px] text-muted-foreground shrink-0 ml-2">{talk.views} views</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coaching Marketplace */}
        <section>
          <SectionHeader
            title={<>Coaching <span style={{ color: LIME }}>marketplace</span></>}
            dummy
            action={<span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> coming soon</span>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COACH_PACKAGES.map((pkg, i) => (
              <Card key={i} className="p-5 border-2 border-foreground/10 flex flex-col gap-2 opacity-90">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-700 text-sm leading-snug">{pkg.title}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{pkg.desc}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">{pkg.tag}</span>
                  <DummyTag />
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Coaches and pricing are illustrative — real bookings opening soon.
          </p>
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




      <Dialog open={!!mentorTarget} onOpenChange={(o) => !o && setMentorTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request 30 min with {mentorTarget?.full_name}</DialogTitle>
            <DialogDescription>
              Say hi and explain what you'd like to chat about. They'll get a notification and can accept or decline.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Hi! I'm starting out in… I'd love to ask you about…"
            value={mentorMsg}
            onChange={(e) => setMentorMsg(e.target.value)}
            rows={5}
            maxLength={600}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMentorTarget(null)}>Cancel</Button>
            <Button disabled={mentorSending || mentorMsg.trim().length < 10} onClick={sendMentorRequest}>
              {mentorSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1.5" />Send request</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
