import { useEffect, useState, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getCached, setCached, invalidate as invalidateCache } from "@/lib/ttlCache";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, TrendingUp, ExternalLink, Loader2, Inbox, Search, Mail, MailOpen, Sparkles, X, ThumbsUp, Trash2, Reply, Send, CheckCircle2, Pin, Newspaper, Bookmark, BookmarkCheck, Globe, Heart, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { roles } from "@/data/roles";
import {
  scoreJob,
  shouldExcludeJob,
  hasRoleMatch,
  passesSalaryFilter,
  buildLearnedSignals,
  jobDedupeKey,
  normalizeTitleForDedupe,
  isLiveJob,
  toSlug,
  expandIndustrySlugs,
  getEffectiveRoles,
  getEffectiveIndustries,
  isIndustrySwitcher,
  getEffectiveCareerLevel,
  shouldRequireRoleMatch,
  getIndustriesFromPassions,
  SALARY_THRESHOLDS,
  summarizeBreakdown,
  getExclusionOrMismatchReason,
  type Job,
  type UserProfile,
  type RoleRiasecProfile,
  type LearnedSignals,
  type CareerLevel,
  type ScoreBreakdownItem,
} from "@scoring/score-job.ts";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import CompanyLogo from "@/components/CompanyLogo";
import { trackInteraction, useBehavioralAffinity, type IndustryAffinity } from "@/hooks/useTrackInteraction";
import { getCompanySlug, getCompanyProfilePath } from "@/lib/company-profiles";
import { getCompanyExternalUrl } from "@/lib/company-external-links";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import SourceAttribution, { SourceAttributionFooter, detectJobSource } from "@/components/AdzunaAttribution";
import SavedTabContent from "@/components/SavedTabContent";
import MembersArea from "@/components/MembersArea";
import MentorRequestsInbox from "@/components/MentorRequestsInbox";
import howdyMascot from "@/assets/howdy-mascot.png";
import HowdyHeaderButton from "@/components/HowdyHeaderButton";
import { matchesToReasons } from "@/lib/profile-matching";
import { useJobTracker } from "@/hooks/useJobTracker";
import { Kanban } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/* ───── Hand-drawn rounded pill CTA - matches home hero style ───── */
const LIME = "hsl(120, 100%, 45%)";
const SketchCta = ({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) => (
  <span className="relative inline-flex items-center hover:opacity-90 transition-opacity">
    <svg
      viewBox="0 0 140 52"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <path
        d="M26,3 C14,3 4,14 3,26 C3,38 13,49 26,49 L114,49 C127,49 137,38 137,26 C138,14 127,3 114,3 Z"
        fill={variant === "primary" ? LIME : "hsl(0, 0%, 100%)"}
        stroke="hsl(0, 0%, 7%)"
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    <span className="relative inline-flex items-center gap-1.5 font-display font-900 text-xs md:text-sm tracking-wide uppercase text-foreground px-5 py-2.5 whitespace-nowrap">
      {children}
    </span>
  </span>
);


// ─── Scoring: single source of truth in supabase/functions/_shared/scoring ───
// All matching logic (types, exclusion rules, salary filters, learned signals,
// scoreJob itself) lives in the shared isomorphic module so the inbox, the
// server-side pre-scorer and every digest rank jobs identically.

/* ───── Job Card (click to open, X to dismiss) ───── */
// ─── Tinder-style swipeable job card ─────────────────────────────────────────
const SCORE_BANDS = [
  { min: 85, bg: "#00E600", label: "Perfect match" },
  { min: 70, bg: "#0a0a0a", label: "Strong match" },
  { min: 0,  bg: "#f5f5f5", label: "Worth a look" },
] as const;

function getScoreBand(score: number) {
  return SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

const INDUSTRY_LABELS: Record<string, string> = {
  bakery: "Bakery", beauty: "Beauty", beer: "Beer", building: "Building",
  cars: "Cars", charity: "Charity", cinema: "Film & TV", coffee: "Coffee",
  delivery: "Delivery", "estate-agency": "Estate Agency", farming: "Farming",
  fashion: "Fashion", fixing: "Fixing", football: "Football", footwear: "Footwear",
  gaming: "Gaming", grocery: "Grocery", health: "Health", "horse-racing": "Horse Racing",
  hospitality: "Food & Drink", "interior-design": "Interior Design",
  jewellery: "Jewellery", journalism: "Journalism", money: "Money", music: "Music",
  pets: "Pets", physiotherapy: "Physio", politics: "Politics", psychotherapy: "Therapy",
  teaching: "Teaching", tennis: "Tennis", travel: "Travel", wellness: "Wellness",
};

const LEVEL_LABELS: Record<string, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior Level",
  director: "Director",
  executive: "Executive",
};

// Jobs fetched via the pre-scored path carry their server-computed semantic
// similarity and whether they're a core match or a discovery suggestion.
type JobWithMeta = Job & { _semantic?: number; _matchKind?: "core" | "discovery" };

// Insert one discovery card after every `gap` core cards. Leftover discovery
// cards go to the back so they still surface when the core stream runs long.
function interleaveDiscovery<T>(core: T[], discovery: T[], gap = 3): T[] {
  if (discovery.length === 0) return core;
  if (core.length === 0) return discovery;
  const out: T[] = [];
  let d = 0;
  for (let i = 0; i < core.length; i++) {
    out.push(core[i]);
    if ((i + 1) % gap === 0 && d < discovery.length) out.push(discovery[d++]);
  }
  while (d < discovery.length) out.push(discovery[d++]);
  return out;
}

function normalizeJobType(raw: string | null): string | null {
  if (!raw) return null;
  // Take the first value when DB has comma-separated types
  const first = raw.split(",")[0].trim();
  const lc = first.toLowerCase();
  if (lc.includes("full")) return "Full-time";
  if (lc.includes("part")) return "Part-time";
  if (lc.includes("intern")) return "Internship";
  if (lc.includes("contract")) return "Contract";
  if (lc.includes("temp")) return "Temporary";
  if (lc.includes("perm")) return "Permanent";
  if (lc.includes("freelance")) return "Freelance";
  return first || null;
}

function TinderJobCard({
  job,
  onDismiss,
  onLike,
  onOpen,
  onSave,
  savedIdSet,
  onTrack,
  trackedIdSet,
  isTop,
  stackIndex,
  exitDirection,
}: {
  job: Job & { score: number; matches: string[]; breakdown?: ScoreBreakdownItem[] };
  onDismiss: (id: string) => void;
  onLike: (id: string) => void;
  onOpen: (url: string, id?: string) => void;
  onSave: (id: string) => void;
  savedIdSet: Set<string>;
  onTrack: (id: string) => void;
  trackedIdSet: Set<string>;
  isTop: boolean;
  stackIndex: number;
  exitDirection: "left" | "right" | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [30, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -30], [1, 0]);
  const cardScale = isTop ? 1 : Math.max(0.93, 1 - stackIndex * 0.035);
  const cardY = isTop ? 0 : stackIndex * 10;

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -80) onDismiss(job.id);
    else if (info.offset.x > 80) onLike(job.id);
  };

  const band = getScoreBand(job.score);
  const [showWhy, setShowWhy] = useState(false);
  const whyReasons = job.breakdown ? summarizeBreakdown(job.breakdown) : [];

  const industryLabel = job.industry ? (INDUSTRY_LABELS[job.industry] ?? job.industry) : null;
  const levelLabel = job.career_level ? (LEVEL_LABELS[job.career_level.toLowerCase()] ?? null) : null;
  const jobTypeLabel = normalizeJobType(job.type);
  const isSaved = savedIdSet.has(job.id);
  const isTracked = trackedIdSet.has(job.id);
  const source = detectJobSource(job.url);

  return (
    <motion.div
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, zIndex: 10 - stackIndex }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
      className="absolute inset-0 bg-[#E2F5A6] rounded-[32px] overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-[0_20px_40px_-12px_rgba(10,10,10,0.3)]"
      initial={false}
      animate={
        exitDirection === "left"
          ? { x: -600, rotate: -28, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
          : exitDirection === "right"
          ? { x: 600, rotate: 28, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
          : { scale: cardScale, y: cardY, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 32 } }
      }
    >
      {/* LIKE overlay */}
      {isTop && (
        <motion.div style={{ opacity: likeOpacity }} className="absolute inset-0 z-10 flex items-start justify-end p-5 pointer-events-none">
          <span className="border-[3px] border-[#00E600] text-[#00E600] bg-background/90 backdrop-blur-sm font-display font-900 text-2xl px-4 py-1.5 rounded-xl rotate-[-12deg] tracking-widest shadow-lg">LIKE</span>
        </motion.div>
      )}
      {/* NOPE overlay */}
      {isTop && (
        <motion.div style={{ opacity: nopeOpacity }} className="absolute inset-0 z-10 flex items-start justify-start p-5 pointer-events-none">
          <span className="border-[3px] border-red-500 text-red-500 bg-background/90 backdrop-blur-sm font-display font-900 text-2xl px-4 py-1.5 rounded-xl rotate-[12deg] tracking-widest shadow-lg">NOPE</span>
        </motion.div>
      )}

      {/* Card content */}
      <div className="h-full flex flex-col" onClick={isTop ? () => onOpen(job.url, job.id) : undefined}>
        <div className="flex-1 flex flex-col p-6 pb-4 min-h-0">
          {/* Top row: match badge + bookmark */}
          <div className="flex items-center justify-between mb-5 flex-shrink-0">
            <button
              type="button"
              disabled={whyReasons.length === 0}
              onClick={(e) => { e.stopPropagation(); setShowWhy((v) => !v); }}
              className="inline-flex items-center gap-1.5 pl-1.5 pr-3.5 py-1.5 bg-foreground text-background font-display font-800 text-[11px] tracking-wide uppercase rounded-full disabled:cursor-default"
            >
              <img src={howdyMascot} alt="" className="w-5 h-5 object-contain rounded-full bg-background/10" />
              {band.label}
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => { e.stopPropagation(); onTrack(job.id); }}
                    className={`w-9 h-9 rounded-full bg-background/50 hover:bg-background/80 flex items-center justify-center transition-colors ${isTracked ? "text-primary" : ""}`}
                    aria-label={isTracked ? "In your Job Tracker" : "Add to Job Tracker"}
                  >
                    <Kanban className="w-[18px] h-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isTracked ? "In your Job Tracker" : "Add to Job Tracker"}</TooltipContent>
              </Tooltip>
              <button
                onClick={(e) => { e.stopPropagation(); onSave(job.id); }}
                className="w-9 h-9 rounded-full bg-background/50 hover:bg-background/80 flex items-center justify-center transition-colors"
                title="Save for later"
              >
                {isSaved ? <BookmarkCheck className="w-[18px] h-[18px]" /> : <Bookmark className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {/* Why this matched - tap the band pill to reveal */}
          {showWhy && whyReasons.length > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mb-4 flex-shrink-0 rounded-2xl border border-foreground/15 bg-background/60 px-4 py-3 space-y-1"
            >
              <p className="font-display font-800 text-[10px] uppercase tracking-widest text-foreground/50 mb-1.5">Why Howdy picked this</p>
              {whyReasons.map((reason) => (
                <p key={reason} className="font-body text-xs text-foreground/80 leading-snug">· {reason}</p>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="font-display font-900 text-2xl leading-[1.1] mb-3 flex-shrink-0">{job.title}</h3>

          {/* Location + type row */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mb-4 font-body text-sm text-foreground/75 flex-shrink-0">
            {job.location && (
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
            )}
            {jobTypeLabel && (
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{jobTypeLabel}</span>
            )}
          </div>

          <div className="h-px bg-foreground/15 mb-4 flex-shrink-0" />

          {/* Description snippet */}
          {job.description && (
            <p className="font-body text-[13px] text-foreground/70 leading-relaxed line-clamp-3 mb-4">
              {job.description.slice(0, 180)}
            </p>
          )}

          {/* Tag pills: salary · level · match tags */}
          <div className="flex flex-wrap gap-2.5 mt-auto flex-shrink-0">
            {job.salary && (
              <span className="px-4 py-2 bg-background text-foreground font-display text-xs font-800 uppercase tracking-wide rounded-full">
                {job.salary}
              </span>
            )}
            {levelLabel && (
              <span className="px-4 py-2 bg-background text-foreground font-display text-xs font-800 uppercase tracking-wide rounded-full">
                {levelLabel}
              </span>
            )}
            {matchesToReasons(job.matches, industryLabel ?? job.industry).map((m) => (
              <span key={m} className="px-4 py-2 bg-background text-foreground font-display text-xs font-800 uppercase tracking-wide rounded-full">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Company footer */}
        <div className="flex items-center gap-3 px-6 py-4 bg-background/40 border-t border-foreground/10 flex-shrink-0">
          <CompanyLogo company={job.company} size={40} />
          <div className="min-w-0 flex-1">
            <p className="font-display font-800 text-sm truncate">{job.company}</p>
            {industryLabel && <p className="font-body text-xs text-foreground/60 truncate">{industryLabel}</p>}
          </div>
          {source && <SourceAttribution source={source} variant="badge" />}
          <ChevronRight className="w-5 h-5 text-foreground/40 flex-shrink-0" />
        </div>
      </div>
    </motion.div>
  );
}

// One AI-polished "stretch pick" a day - modelled on PlanTab's HowdyTake():
// fetch once, static fallback on failure, respects the same 50-calls/day
// career-assistant quota (server-side) plus a client-side once-a-day gate.
function StretchPickCard({ job, reason }: { job: Job & { score: number }; reason: string }) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) { setLoading(false); return; }
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-assistant`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            mode: "candidate",
            stretchPickNarrative: true,
            stretchPickJob: { title: job.title, company: job.company, industry: job.industry, matchReason: reason },
            messages: [{ role: "user", content: "Tell me about this stretch job." }],
          }),
        });
        if (!resp.ok) { if (!cancelled) setLoading(false); return; }
        const data = await resp.json();
        if (!cancelled) setNarrative(data?.narrative || null);
      } catch {
        // Silent fail - the static fallback line below still works.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [job.id, job.title, job.company, job.industry, reason]);

  return (
    <div className="mb-5 border-2 border-primary/50 bg-primary/5 rounded-2xl px-4 py-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        <img src={howdyMascot} alt="" className="w-6 h-6 object-contain rounded-full" />
        <p className="font-display font-800 text-xs uppercase tracking-widest text-primary">This one's a stretch, but worth a look</p>
      </div>
      <p className="font-body text-sm font-700 mb-1">{job.title} · {job.company}</p>
      {loading ? (
        <div className="space-y-1.5 mt-1.5">
          <div className="h-3 bg-foreground/10 rounded animate-pulse w-full" />
          <div className="h-3 bg-foreground/10 rounded animate-pulse w-3/4" />
        </div>
      ) : (
        <p className="font-body text-xs text-foreground/80 leading-relaxed">
          {narrative || `Honestly? ${reason.charAt(0).toUpperCase() + reason.slice(1)} — but it's worth a shot anyway.`}
        </p>
      )}
    </div>
  );
}

// Card stack + action buttons
function TinderCardStack({
  jobs,
  isFallback,
  onDismiss,
  onLike,
  onSave,
  onOpen,
  savedIdSet,
  onTrack,
  trackedIdSet,
}: {
  jobs: (Job & { score: number; matches: string[] })[];
  isFallback?: boolean;
  onDismiss: (id: string) => void;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onOpen: (url: string, id?: string) => void;
  savedIdSet: Set<string>;
  onTrack: (id: string) => void;
  trackedIdSet: Set<string>;
}) {
  const [exiting, setExiting] = useState<{ id: string; direction: "left" | "right" } | null>(null);

  const visible = jobs.slice(0, 3);

  const runExit = (direction: "left" | "right", action: (id: string) => void) => {
    if (jobs.length === 0 || exiting) return;
    const id = jobs[0].id;
    setExiting({ id, direction });
    window.setTimeout(() => {
      action(id);
      setExiting(null);
    }, 300);
  };

  // Keyboard shortcuts: ← dismiss, → like, ↑ save, Enter open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!jobs.length || exiting) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); runExit("left", onDismiss); }
      else if (e.key === "ArrowRight") { e.preventDefault(); runExit("right", onLike); }
      else if (e.key === "ArrowUp") { e.preventDefault(); onSave(jobs[0].id); }
      else if (e.key === "Enter") { e.preventDefault(); onOpen(jobs[0].url, jobs[0].id); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [jobs, exiting]);

  if (jobs.length === 0) {
    return (
      <div className="border-[3px] border-foreground rounded-[28px] p-12 text-center bg-muted/20">
        <p className="font-display font-900 text-2xl mb-2">You're all caught up<span className="text-primary">.</span></p>
        <p className="font-body text-sm text-muted-foreground">New jobs arrive twice daily. Check back soon.</p>
      </div>
    );
  }

  const top = jobs[0];

  return (
    <div className="flex flex-col items-center gap-6">
      {isFallback && (
        <div className="w-full bg-[#00E600]/10 border-2 border-[#00E600] rounded-2xl px-4 py-3 text-center">
          <p className="font-display font-800 text-sm">Out of exact matches — here's what else you might like<span className="text-primary">.</span></p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">Picked using your role, passions and behaviour, just outside your usual industries.</p>
        </div>
      )}
      {/* Card stack */}
      <div className="relative w-full" style={{ height: 520 }}>
        {[...visible].reverse().map((job, i) => {
          const stackIndex = visible.length - 1 - i;
          return (
            <TinderJobCard
              key={job.id}
              job={job}
              onDismiss={(id) => runExit("left", onDismiss)}
              onLike={(id) => runExit("right", onLike)}
              onOpen={onOpen}
              onSave={onSave}
              savedIdSet={savedIdSet}
              onTrack={onTrack}
              trackedIdSet={trackedIdSet}
              isTop={stackIndex === 0}
              stackIndex={stackIndex}
              exitDirection={exiting?.id === job.id ? exiting.direction : null}
            />
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-5">
        <button
          onClick={() => runExit("left", onDismiss)}
          disabled={!!exiting}
          className="w-16 h-16 rounded-full border-[3px] border-red-500 text-red-500 bg-background flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-[4px_4px_0_0_rgba(239,68,68,0.25)] active:scale-95 disabled:opacity-50"
          title="Not for me"
        >
          <X className="w-7 h-7" strokeWidth={3} />
        </button>
        <button
          onClick={() => onSave(top.id)}
          className={`w-12 h-12 rounded-full border-[3px] flex items-center justify-center transition-colors shadow-sm active:scale-95 ${
            savedIdSet.has(top.id) ? "border-foreground bg-foreground text-background" : "border-foreground/30 text-foreground/50 hover:border-foreground hover:text-foreground"
          }`}
          title="Save for later"
        >
          {savedIdSet.has(top.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
        <button
          onClick={() => runExit("right", onLike)}
          disabled={!!exiting}
          className="w-16 h-16 rounded-full border-[3px] border-[#00E600] text-[#00E600] bg-background flex items-center justify-center hover:bg-[#00E600] hover:text-foreground transition-colors shadow-[4px_4px_0_0_rgba(0,230,0,0.3)] active:scale-95 disabled:opacity-50"
          title="Like — show me more like this"
        >
          <Heart className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>

      <p className="font-body text-[10px] text-muted-foreground text-center uppercase tracking-wide">
        Swipe or use ← → keys · ↑ save · Enter to open
      </p>

      <p className="font-display font-700 text-xs text-muted-foreground">{jobs.length} job{jobs.length !== 1 ? "s" : ""} in your stack</p>
    </div>
  );
}
const MyJobs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roleProfiles, setRoleProfiles] = useState<Map<string, RoleRiasecProfile>>(new Map());
  const [howdyJobsMeta, setHowdyJobsMeta] = useState<{ lastSeenAt: string | null; curiosityScore: number | null; curiosityBreadth: number | null }>({ lastSeenAt: null, curiosityScore: null, curiosityBreadth: null });
  const minMatch = 60;
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set());
  const [dismissedLoaded, setDismissedLoaded] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likedJobs, setLikedJobs] = useState<Job[]>([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedLoaded, setLikedLoaded] = useState(false);
  // Gate the swipe stack on having a fresh read of what's already been
  // swiped, so a reload can't briefly re-show cards you already actioned
  // (which looked like the deck "resetting" while dismissed/liked state
  // was still in flight from the DB).
  const historyReady = dismissedLoaded && likedLoaded;
  const [employerRequests, setEmployerRequests] = useState<Array<{
    id: string;
    company_name: string;
    message: string | null;
    created_at: string;
    status: string;
    reply_message: string | null;
    replied_at: string | null;
  }>>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "search" | "jobs" | "liked" | "saved" | "members" | "links") || "jobs";
  const [inboxTab, setInboxTab] = useState<"search" | "jobs" | "liked" | "saved" | "members" | "links">(initialTab);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [memberAlerts, setMemberAlerts] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const refresh = async () => {
      const [reqRes, msgRes] = await Promise.all([
        supabase.from("member_connections").select("id", { count: "exact", head: true })
          .eq("recipient_id", user.id).eq("status", "pending"),
        supabase.from("member_messages").select("id", { count: "exact", head: true })
          .eq("recipient_id", user.id).is("read_at", null),
      ]);
      if (cancelled) return;
      setMemberAlerts((reqRes.count || 0) + (msgRes.count || 0));
    };
    refresh();
    const ch = supabase
      .channel(`member-alerts-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "member_connections", filter: `recipient_id=eq.${user.id}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "member_messages", filter: `recipient_id=eq.${user.id}` }, refresh)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate(`/auth?next=${encodeURIComponent("/my-jobs")}`);
      return;
    }

    loadData();
  }, [user, authLoading, navigate]);

  // Load saved jobs
  const loadSavedJobs = useCallback(async () => {
    if (!user) return;

    const savedKey = `myjobs-saved:${user.id}`;
    const cached = getCached<Job[]>(savedKey, 5 * 60 * 1000);
    if (cached) {
      setSavedJobs(cached);
      setSavedLoading(false);
    } else {
      setSavedLoading(true);
    }

    const { data: saves } = await supabase
      .from("saved_jobs")
      .select("job_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const jobIds = (saves ?? []).map((s) => s.job_id as string);
    if (jobIds.length === 0) {
      setSavedJobs([]);
      setCached(savedKey, [] as Job[]);
      setSavedLoading(false);
      return;
    }
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags")
      .in("id", jobIds);
    // Preserve save order
    const map = new Map((jobsData ?? []).map((j: any) => [j.id, j]));
    const ordered = jobIds.map((id) => map.get(id)).filter(Boolean) as Job[];
    setSavedJobs(ordered);
    setCached(savedKey, ordered);
    setSavedLoading(false);
  }, [user]);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  const unsaveJob = async (jobId: string) => {
    if (!user) return;
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
    invalidateCache(`myjobs-saved:${user.id}`);
    toast({ title: "Job removed from saved" });
  };

  const toggleSaveJob = useCallback(async (jobId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const already = savedJobs.some((j) => j.id === jobId);
    if (already) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
      invalidateCache(`myjobs-saved:${user.id}`);
      toast({ title: "Removed from saved" });
    } else {
      // Optimistic add - pull job from current `jobs` list if available
      const job = jobs.find((j) => j.id === jobId);
      if (job) setSavedJobs((prev) => [job, ...prev]);
      const { error } = await supabase
        .from("saved_jobs")
        .upsert({ user_id: user.id, job_id: jobId }, { onConflict: "user_id,job_id" });
      if (error) {
        // Roll back optimistic add
        setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
        toast({ title: "Couldn't save job", description: error.message, variant: "destructive" });
      } else {
        invalidateCache(`myjobs-saved:${user.id}`);
        toast({
          title: "Saved to your list",
          description: "View saved →",
          action: (
            <button
              onClick={() => setInboxTab("saved")}
              className="text-xs font-display font-700 underline underline-offset-2"
            >
              View saved
            </button>
          ),
        } as any);
      }
    }
  }, [user, navigate, savedJobs, jobs]);

  const savedIdSet = useMemo(() => new Set(savedJobs.map((j) => j.id)), [savedJobs]);

  const { isTracked: isJobTracked, addItem: addTrackerItem } = useJobTracker();
  const trackedIdSet = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => { if (isJobTracked(j.id)) set.add(j.id); });
    return set;
  }, [jobs, isJobTracked]);

  const trackJob = useCallback(async (jobId: string) => {
    if (!user) { navigate("/auth"); return; }
    if (isJobTracked(jobId)) {
      toast({ title: "Already in your Job Tracker" });
      return;
    }
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    await addTrackerItem({
      job_id: job.id,
      company: job.company,
      title: job.title,
      url: job.url,
      location: job.location,
      salary: job.salary,
      industry: job.industry,
    });
    toast({
      title: "Added to Job Tracker",
      action: (
        <button
          onClick={() => navigate("/job-tracker")}
          className="text-xs font-display font-700 underline underline-offset-2"
        >
          View board
        </button>
      ),
    } as any);
  }, [user, navigate, jobs, isJobTracked, addTrackerItem]);

  const loadLikedJobs = useCallback(async () => {
    if (!user) return;
    setLikedLoading(true);
    try {
      const { data: likes, error: likesError } = await supabase
        .from("liked_jobs")
        .select("job_id, liked_at")
        .eq("user_id", user.id)
        .order("liked_at", { ascending: false });

      if (likesError) throw likesError;

      const jobIds = (likes ?? []).map((l) => l.job_id as string);
      // Set the exclusion set from the raw likes list FIRST, before any
      // detail-hydration or staleness pruning below. This is what stops
      // already-liked jobs from reappearing in the swipe stack - it must
      // not depend on the (separate, more failure-prone) job-details fetch
      // succeeding. A previous version only set this after that second
      // fetch completed, so any hiccup there silently left liked jobs
      // fully unprotected for the rest of the session.
      setLikedIds(new Set(jobIds));

      if (jobIds.length === 0) { setLikedJobs([]); setLikedLoading(false); setLikedLoaded(true); return; }

      const now = new Date().toISOString();
      const { data: jobData, error: jobsError } = await supabase
        .from("jobs")
        .select("id,title,company,location,salary,industry,career_level,url,created_at,type,work_mode,role_category,ai_role_category,job_traits,description,tags,expires_at")
        .in("id", jobIds)
        .or(`expires_at.is.null,expires_at.gt.${now}`);

      if (jobsError) throw jobsError;

      // Only treat a liked job as "stale and safe to delete" when this fetch
      // definitely succeeded - never prune based on a failed/partial query.
      const liveIds = new Set((jobData ?? []).map((j: any) => j.id));
      const staleIds = jobIds.filter((id) => !liveIds.has(id));
      if (staleIds.length > 0) {
        await supabase.from("liked_jobs").delete().eq("user_id", user.id).in("job_id", staleIds);
        setLikedIds((prev) => { const next = new Set(prev); staleIds.forEach((id) => next.delete(id)); return next; });
      }

      // Clean up duplicate likes from before the dedupe fix - same real job
      // liked multiple times as separate DB rows. `likes` is already ordered
      // most-recent-first, so keep the first (newest) copy per dedupe key
      // and delete the rest, both from the list and from the DB.
      const jobById = new Map(((jobData ?? []) as any[]).map((j) => [j.id, j]));
      const seenKeys = new Set<string>();
      const deduped: Job[] = [];
      const duplicateIdsToDelete: string[] = [];
      for (const like of (likes ?? [])) {
        const job = jobById.get(like.job_id);
        if (!job) continue;
        const key = jobDedupeKey(job);
        if (seenKeys.has(key)) {
          duplicateIdsToDelete.push(like.job_id);
          continue;
        }
        seenKeys.add(key);
        deduped.push(job as Job);
      }
      if (duplicateIdsToDelete.length > 0) {
        await supabase.from("liked_jobs").delete().eq("user_id", user.id).in("job_id", duplicateIdsToDelete);
        setLikedIds((prev) => { const next = new Set(prev); duplicateIdsToDelete.forEach((id) => next.delete(id)); return next; });
      }

      setLikedJobs(deduped);
    } catch (_) {}
    setLikedLoading(false);
    setLikedLoaded(true);
  }, [user]);

  useEffect(() => {
    loadLikedJobs();
  }, [loadLikedJobs]);

  const loadData = async () => {
    if (!user) return;

    // Cache-first paint: if we have a recent snapshot, show it instantly while
    // the fresh fetch runs in the background. Big win on tab switches because
    // the jobs query paginates up to 5,000 rows.
    const jobsKey = `myjobs-matched:${user.id}`;
    const cachedJobs = getCached<Job[]>(jobsKey, 5 * 60 * 1000);
    if (cachedJobs) {
      setJobs(cachedJobs);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const [profileRes, roleProfilesRes, dismissedRes, requestsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("career_level, industry_interests, newsletter_industries, location_preference, role_preferences, salary_expectation, understand_me_results, riasec_scores, work_values, job_preferences, share_details_default, photo_url, howdy_jobs_last_seen_at, curiosity_score, curiosity_breadth")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("role_riasec_profiles").select("role_category, riasec_scores, work_values"),
        supabase.from("dismissed_jobs").select("job_id, reason, dismissed_at").eq("user_id", user.id),
        supabase
          .from("contact_requests")
          .select("id, message, reply_message, replied_at, created_at, status, employer_companies:company_id(name)")
          .eq("candidate_user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setEmployerRequests(
        (requestsRes.data || []).map((r: any) => ({
          id: r.id,
          company_name: r.employer_companies?.name ?? "An employer",
          message: r.message,
          created_at: r.created_at,
          status: r.status,
          reply_message: r.reply_message ?? null,
          replied_at: r.replied_at ?? null,
        }))
      );

      const nextProfile = (profileRes.data as unknown as UserProfile) || null;
      setProfile(nextProfile);
      setPhotoUrl((profileRes.data as any)?.photo_url ?? null);
      setHowdyJobsMeta({
        lastSeenAt: (profileRes.data as any)?.howdy_jobs_last_seen_at ?? null,
        curiosityScore: (profileRes.data as any)?.curiosity_score ?? null,
        curiosityBreadth: (profileRes.data as any)?.curiosity_breadth ?? null,
      });

      const map = new Map<string, RoleRiasecProfile>();
      for (const rp of roleProfilesRes.data || []) {
        map.set(rp.role_category, rp as unknown as RoleRiasecProfile);
      }
      setRoleProfiles(map);

      // Dismissals older than the cooldown get a second chance — a "no" today
      // doesn't mean "no" forever, and it keeps the stack from running dry for
      // fast swipers in narrow industries.
      const DISMISS_COOLDOWN_DAYS = 21;
      const cooldownCutoff = Date.now() - DISMISS_COOLDOWN_DAYS * 86_400_000;
      const dismissed = new Set<string>();
      const opened = new Set<string>();
      for (const d of dismissedRes.data || []) {
        if ((d as any).reason === "opened") {
          opened.add((d as any).job_id);
        } else {
          const dismissedAt = (d as any).dismissed_at ? new Date((d as any).dismissed_at).getTime() : Date.now();
          if (dismissedAt >= cooldownCutoff) dismissed.add((d as any).job_id);
        }
      }
      setDismissedIds(dismissed);
      setOpenedIds(opened);
      setDismissedLoaded(true);

      if (!nextProfile) {
        setJobs([]);
        return;
      }

      const minSalary = nextProfile.salary_expectation ? (SALARY_THRESHOLDS[nextProfile.salary_expectation] || 0) : 0;

      // ── Pre-scored path ──────────────────────────────────────────────────────
      // job_matches is populated server-side by score-new-jobs after each scrape.
      // If we have >= 50 entries, use that pre-ranked pool instead of paginating
      // 2,000 newest jobs and scoring everything in the browser. The client still
      // runs the full scoreJob() pass — this just gives it better raw candidates.
      const passesAllFiltersPreScored = (job: Job) =>
        isLiveJob(job) &&
        !dismissed.has(job.id) &&
        !shouldExcludeJob(job, nextProfile) &&
        passesSalaryFilter(job, minSalary);

      const { data: preMatches } = await supabase
        .from("job_matches")
        .select("job_id, score, semantic_score, match_kind")
        .eq("user_id", user.id)
        .order("score", { ascending: false })
        .limit(500);

      type PreMatch = { job_id: string; score: number; semantic_score: number | null; match_kind: "core" | "discovery" | null };

      if (preMatches && preMatches.length >= 50) {
        const preJobIds = (preMatches as PreMatch[]).map((m) => m.job_id);
        const { data: preJobs } = await supabase
          .from("jobs")
          .select("id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags, ai_confidence, expires_at")
          .in("id", preJobIds)
          .gt("expires_at", new Date().toISOString());

        if (preJobs && preJobs.length > 0) {
          // Re-order by pre-score — the DB fetch doesn't preserve IN-list order.
          // Semantic score + match kind travel on the job object so the display
          // scorer and the discovery interleave can use them without extra fetches.
          const matchMeta = new Map(
            (preMatches as PreMatch[]).map((m) => [m.job_id, m]),
          );
          const scoreMap = new Map(
            (preMatches as PreMatch[]).map((m) => [m.job_id, m.score]),
          );
          const sortedPreJobs = (preJobs as unknown as Job[])
            .map((j) => {
              const meta = matchMeta.get(j.id);
              return {
                ...j,
                _semantic: meta?.semantic_score ?? undefined,
                _matchKind: meta?.match_kind ?? "core",
              } as JobWithMeta;
            })
            .filter(passesAllFiltersPreScored)
            .sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));

          // Only use the pre-scored path if jobs remain after filtering out dismissed/excluded.
          // If the entire pool has been swiped, fall through to the full paginated fetch.
          if (sortedPreJobs.length > 0) {
            setJobs(sortedPreJobs);
            setCached(jobsKey, sortedPreJobs);
            setLoading(false);
            return;
          }
        }
      }
      // ── End pre-scored path — fall through to paginated fetch ────────────────

      const candidateTarget = 300;
      const pageSize = 500;
      const maxRows = 2000;
      const matchedJobs: Job[] = [];

      const passesAllFilters = (job: Job) =>
        isLiveJob(job) &&
        !dismissed.has(job.id) &&
        !shouldExcludeJob(job, nextProfile) &&
        passesSalaryFilter(job, minSalary);

      // Build industry filter at DB level — massive performance win now we have 25k+ jobs.
      // Only skip the filter if the user has no industry signal at all (show everything).
      const effectiveIndustries = getEffectiveIndustries(nextProfile);
      const passionIndustries = Array.from(getIndustriesFromPassions(nextProfile.job_preferences?.passions || []));
      const allIndustrySlugs = [...new Set([
        ...expandIndustrySlugs(effectiveIndustries),
        ...passionIndustries,
      ])].filter(Boolean);

      const buildQuery = () => {
        let q = supabase
          .from("jobs")
          .select("id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags, ai_confidence, expires_at")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false });
        if (allIndustrySlugs.length > 0) {
          // Always include "other" so role-matched cross-industry jobs surface
          // in the "Roles you might not have considered" section.
          q = q.in("industry", [...allIndustrySlugs, "other"]);
        }
        return q;
      };

      const { data: firstPage } = await buildQuery().range(0, pageSize - 1);

      if (firstPage?.length) {
        matchedJobs.push(...(firstPage as unknown as Job[]).filter(passesAllFilters));
        setJobs([...matchedJobs]);
        setLoading(false);
      } else {
        setJobs([]);
      }

      for (let from = pageSize; from < maxRows && matchedJobs.length < candidateTarget; from += pageSize) {
        const { data: jobsPage, error } = await buildQuery().range(from, from + pageSize - 1);

        if (error || !jobsPage?.length) break;

        matchedJobs.push(...(jobsPage as unknown as Job[]).filter(passesAllFilters));

        if (jobsPage.length < pageSize) break;
      }

      // Narrow industry lists (or fast swipers who've cleared their usual pool)
      // can run the industry-scoped fetch dry. Top up with a cross-industry
      // batch so the algorithm always has fresh material to recommend from —
      // scoreJob still ranks these on role/passion/behaviour fit, this just
      // stops the well running dry.
      const TOPUP_TARGET = 150;
      if (allIndustrySlugs.length > 0 && matchedJobs.length < TOPUP_TARGET) {
        const seenIds = new Set(matchedJobs.map((j) => j.id));
        const { data: topup } = await supabase
          .from("jobs")
          .select("id, title, company, location, salary, industry, career_level, url, created_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags, ai_confidence, expires_at")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .range(0, 300);
        for (const job of (topup as unknown as Job[]) || []) {
          if (seenIds.has(job.id)) continue;
          if (passesAllFilters(job)) {
            matchedJobs.push(job);
            seenIds.add(job.id);
          }
        }
      }

      setJobs(matchedJobs);
      setCached(jobsKey, matchedJobs);
    } finally {
      setLoading(false);
    }
  };

  // The same real-world job often exists as multiple DB rows (scraped from
  // Adzuna, Reed, Jooble etc with slightly different company formatting).
  // When a user swipes on one copy, sweep the rest away too so it doesn't
  // reappear moments later as a "new" card.
  const findDuplicateJobIds = useCallback((jobId: string): string[] => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return [jobId];
    const key = jobDedupeKey(target);
    const dupes = jobs.filter((j) => jobDedupeKey(j) === key).map((j) => j.id);
    return dupes.length > 0 ? dupes : [jobId];
  }, [jobs]);

  const handleDismiss = useCallback(async (jobId: string) => {
    if (!user) return;
    const duplicateIds = findDuplicateJobIds(jobId);

    // Re-check session freshness - RLS will reject if the JWT is stale/missing
    const { data: sessionData } = await supabase.auth.getSession();
    const activeUserId = sessionData?.session?.user?.id;
    if (!activeUserId) {
      toast({
        title: "Session expired",
        description: "Please sign in again to dismiss jobs.",
        variant: "destructive",
      });
      return;
    }

    let openedThatWereCleared: string[] = [];

    const rollbackDismiss = () => {
      setDismissedIds((prev) => {
        const next = new Set(prev);
        duplicateIds.forEach((id) => next.delete(id));
        return next;
      });

      if (openedThatWereCleared.length > 0) {
        setOpenedIds((prev) => new Set([...prev, ...openedThatWereCleared]));
      }
    };

    setDismissedIds((prev) => new Set([...prev, ...duplicateIds]));

    setOpenedIds((prev) => {
      openedThatWereCleared = duplicateIds.filter((id) => prev.has(id));
      if (openedThatWereCleared.length === 0) return prev;
      const next = new Set(prev);
      openedThatWereCleared.forEach((id) => next.delete(id));
      return next;
    });

    const { error: deleteError } = await supabase
      .from("dismissed_jobs")
      .delete()
      .eq("user_id", activeUserId)
      .in("job_id", duplicateIds);

    if (deleteError) {
      console.error("Failed to clear existing job status", deleteError);
      rollbackDismiss();
      toast({
        title: "Could not dismiss job",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    const { error: insertError } = await supabase
      .from("dismissed_jobs")
      .insert(duplicateIds.map((id) => ({ user_id: activeUserId, job_id: id, reason: "dismissed", dismissed_at: new Date().toISOString() })));

    if (insertError) {
      console.error("Failed to dismiss job", insertError);
      rollbackDismiss();
      toast({
        title: "Could not dismiss job",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Stale matched-jobs cache after a dismiss so the next load excludes it.
    invalidateCache(`myjobs-matched:${activeUserId}`);



    toast({
      title: "Job dismissed",
      description: "Click here to undo",
      action: (
        <button
          onClick={async () => {
            setDismissedIds((prev) => {
              const next = new Set(prev);
              duplicateIds.forEach((id) => next.delete(id));
              return next;
            });
            await supabase.from("dismissed_jobs").delete().eq("user_id", activeUserId).in("job_id", duplicateIds);
          }}
          className="font-display text-xs font-700 px-3 py-1.5 bg-foreground text-background rounded-full hover:bg-foreground/80 transition-colors"
        >
          Click here to undo
        </button>
      ),
    });
  }, [user, findDuplicateJobIds]);

  const handleLike = useCallback(async (jobId: string) => {
    if (!user) return;
    const duplicateIds = findDuplicateJobIds(jobId);
    setLikedIds((prev) => new Set([...prev, ...duplicateIds]));
    const job = jobs.find((j) => j.id === jobId);
    if (job) setLikedJobs((prev) => [job, ...prev.filter((j) => !duplicateIds.includes(j.id))]);
    try {
      await supabase.from("liked_jobs").upsert(
        duplicateIds.map((id) => ({ user_id: user.id, job_id: id, liked_at: new Date().toISOString() })),
        { onConflict: "user_id,job_id" },
      );
      trackInteraction({ type: "job_click", industry: job?.industry ?? undefined, jobId, metadata: { source: "like" } });
    } catch (_) {}
    toast({ title: "Liked", description: "Howdy will show you more like this." });
  }, [user, jobs, findDuplicateJobIds]);

  const handleUnlike = useCallback(async (jobId: string) => {
    if (!user) return;
    setLikedIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
    setLikedJobs((prev) => prev.filter((j) => j.id !== jobId));
    try { await supabase.from("liked_jobs").delete().eq("user_id", user.id).eq("job_id", jobId); } catch (_) {}
  }, [user]);

  const handleOpen = useCallback((url: string, jobId?: string) => {
    // Route to Marketplace's fuller job view with the "Howdy can help" helper
    // pre-opened, instead of sending users straight to the external posting.
    if (jobId) {
      navigate(`/marketplace?jobId=${jobId}`);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    // Track this as an "opened" job for learning
    if (user && jobId && !openedIds.has(jobId)) {
      setOpenedIds((prev) => new Set(prev).add(jobId));
      supabase.from("dismissed_jobs").insert({
        user_id: user.id,
        job_id: jobId,
        reason: "opened",
      }).then(({ error }) => {
        if (error && !error.message?.includes("duplicate")) {
          console.error("Failed to track opened job", error);
        }
      });
      // Log a job_click interaction so the brand's employer dashboard
      // sees this candidate engaged with one of their listings - even
      // when the job came from Adzuna / Reed / RSS sources.
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        trackInteraction({
          type: "job_click",
          companySlug: getCompanySlug(job.company) ?? undefined,
          industry: job.industry ?? undefined,
          jobId: job.id,
          metadata: { title: job.title, company: job.company, source: "my-jobs" },
        });
      }
    }
  }, [user, openedIds, jobs, navigate]);

  // The `jobs` candidate pool and `likedIds` are matched by literal DB row id,
  // but the same real posting (esp. from Jooble, which appends per-search
  // tracking params to the URL) frequently gets re-scraped as a brand new row
  // with a different id. That row was never swiped, so id-based exclusion
  // lets it right back into the stack looking like the identical job you
  // already liked. Belt-and-braces: also exclude by normalized title+company
  // key against every job we know is liked (we have full details for those).
  const likedDedupeKeys = useMemo(
    () => new Set(likedJobs.map((j) => jobDedupeKey(j))),
    [likedJobs],
  );

  // Build learning signals from dismiss/open history
  const learnedSignals = useMemo(() => {
    return buildLearnedSignals(jobs, dismissedIds, openedIds, likedIds);
  }, [jobs, dismissedIds, openedIds, likedIds]);

  const behavioralAffinity = useBehavioralAffinity();

  const scoredJobs = useMemo(() => {
    if (!profile) return { primary: [], broader: [] };

    const requireRoleMatch = shouldRequireRoleMatch(profile);
    const minSalary = profile.salary_expectation ? (SALARY_THRESHOLDS[profile.salary_expectation] || 0) : 0;
    const MIN_PER_INDUSTRY = 2;

    const baseScoredRaw = jobs
      .filter((job) => !dismissedIds.has(job.id) && !likedIds.has(job.id) && !likedDedupeKeys.has(jobDedupeKey(job)))
      .map((job) => ({
        ...job,
        ...scoreJob(job, profile, {
          roleProfiles,
          learned: learnedSignals,
          behavioralAffinity,
          semanticSimilarity: (job as JobWithMeta)._semantic,
        }),
      }))
      .filter((job) => !shouldExcludeJob(job, profile))
      .filter((job) => passesSalaryFilter(job, minSalary))
      .sort((a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Dedupe by (normalized title + company) - keep highest-scoring listing per unique role.
    // Many retailers post the SAME role for every store branch with the only difference
    // being the store name in the title (e.g. "Brand Specialist - Fenwick Tunbridge Wells"
    // vs "Brand Specialist - John Lewis Bluewater"), and the same real posting often gets
    // scraped from multiple boards with slightly different company formatting - see
    // jobDedupeKey / handleLike / handleDismiss, which sweep all copies together.
    const seenRoles = new Set<string>();
    const baseScored = baseScoredRaw.filter((job) => {
      const normTitle = normalizeTitleForDedupe(job.title || "");
      if (!normTitle) return true;
      const key = jobDedupeKey(job);
      if (seenRoles.has(key)) return false;
      seenRoles.add(key);
      return true;
    });

    // Discovery cards skip the role-match and industry-guarantee funnels —
    // they are deliberate out-of-industry suggestions vetted server-side
    // (≥2 bridge signals: adjacent industry / semantic fit / passion / skills).
    const discoveryPool = baseScored
      .filter((j) => (j as JobWithMeta)._matchKind === "discovery")
      .map((j) => ({ ...j, matches: ["You might love this", ...j.matches] }));
    const coreBase = baseScored.filter((j) => (j as JobWithMeta)._matchKind !== "discovery");

    const allScored = requireRoleMatch
      ? (() => {
          const roleMatched = coreBase.filter((job) => hasRoleMatch(job, profile));
          return roleMatched.length > 0 ? roleMatched : coreBase;
        })()
      : coreBase;

    // Guarantee at least MIN_PER_INDUSTRY jobs per interested industry
    const guaranteed = new Set<string>();
    const industryCounts: Record<string, number> = {};
    const interests = profile.industry_interests || [];
    const interestSlugs = new Set(expandIndustrySlugs(interests));

    // First pass: collect top jobs per industry that are below minMatch
    const belowThreshold: typeof allScored = [];
    const aboveThreshold: typeof allScored = [];

    for (const job of allScored) {
      if (job.score >= minMatch) {
        aboveThreshold.push(job);
      } else {
        belowThreshold.push(job);
      }
    }

    // Count how many above-threshold jobs each industry already has
    for (const job of aboveThreshold) {
      const ind = job.industry ? toSlug(job.industry) : "other";
      industryCounts[ind] = (industryCounts[ind] || 0) + 1;
    }

    // Fill up industries that have fewer than MIN_PER_INDUSTRY
    for (const job of belowThreshold) {
      const ind = job.industry ? toSlug(job.industry) : "other";
      if (interestSlugs.size > 0 && !interestSlugs.has(ind)) continue;
      if ((industryCounts[ind] || 0) < MIN_PER_INDUSTRY) {
        guaranteed.add(job.id);
        industryCounts[ind] = (industryCounts[ind] || 0) + 1;
      }
    }

    const byScoreThenDate = (a: typeof allScored[number], b: typeof allScored[number]) =>
      b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    const coreCards = [...aboveThreshold, ...belowThreshold.filter((j) => guaranteed.has(j.id))]
      .filter((j) => j.industry !== "other")
      .sort(byScoreThenDate);

    // Discovery interleave: one "you might love this" card after every 3rd
    // core card, instead of sinking out-of-industry suggestions to the bottom
    // of a score sort.
    const discoveryCards = discoveryPool.sort(byScoreThenDate);

    return {
      primary: interleaveDiscovery(coreCards, discoveryCards),
      // Broader pool: everything that passed scoring/exclusion, no industry-only
      // restriction and no minMatch cutoff — this is the algorithm's best guess
      // at what else you'd like, used when the strict stack runs dry.
      broader: allScored.sort(byScoreThenDate),
    };
  }, [jobs, profile, minMatch, roleProfiles, dismissedIds, likedIds, likedDedupeKeys, openedIds, learnedSignals, behavioralAffinity]);

  const primaryScoredJobs = scoredJobs.primary;
  const broaderScoredJobs = useMemo(
    () => scoredJobs.broader.filter((j) => !primaryScoredJobs.some((p) => p.id === j.id)).slice(0, 40),
    [scoredJobs, primaryScoredJobs],
  );

  // "New since you last checked" — falls back to the full queue on a first-
  // ever visit (no watermark yet), otherwise counts only genuinely new jobs.
  const jobsQueueForBadge = primaryScoredJobs.length > 0 ? primaryScoredJobs : broaderScoredJobs;
  const newJobsSinceLastSeen = useMemo(() => {
    if (!howdyJobsMeta.lastSeenAt) return jobsQueueForBadge.length;
    const watermark = new Date(howdyJobsMeta.lastSeenAt).getTime();
    return jobsQueueForBadge.filter((j) => new Date(j.created_at).getTime() > watermark).length;
  }, [jobsQueueForBadge, howdyJobsMeta.lastSeenAt]);

  // Once per session: when the Jobs tab is opened with genuinely new matches
  // waiting (not on a first-ever visit, where "new" would just mean "all of
  // them"), let Howdy say so — and fold in a curiosity-score insight when
  // there's a broad enough signal to make it feel earned, not generic.
  const jobsNoticeShownRef = useRef(false);
  useEffect(() => {
    if (loading || inboxTab !== "jobs" || !user || jobsNoticeShownRef.current) return;
    jobsNoticeShownRef.current = true;

    if (howdyJobsMeta.lastSeenAt && newJobsSinceLastSeen > 0) {
      let description = `${newJobsSinceLastSeen} new match${newJobsSinceLastSeen === 1 ? "" : "es"} since you were last here.`;
      if ((howdyJobsMeta.curiosityBreadth ?? 0) >= 3 && behavioralAffinity && behavioralAffinity.max > 0) {
        let topIndustry: string | null = null;
        let topScore = 0;
        for (const [industry, score] of behavioralAffinity.scores) {
          if (score > topScore) { topScore = score; topIndustry = industry; }
        }
        if (topIndustry) {
          description += ` Howdy's noticed you've been curious about ${INDUSTRY_LABELS[topIndustry] ?? topIndustry} lately.`;
        }
      }
      toast({ title: "Howdy Jobs", description });
    }

    supabase.from("profiles").update({ howdy_jobs_last_seen_at: new Date().toISOString() }).eq("id", user.id).then(() => {});
  }, [loading, inboxTab, user, newJobsSinceLastSeen, howdyJobsMeta, behavioralAffinity]);

  // The day's "stretch pick" - highest-scoring 45-65 band job whose only
  // real gap is career-level or target-role (never a hard exclusion, since
  // shouldExcludeJob() has already filtered those out of these arrays).
  const stretchPickJob = useMemo(() => {
    if (!profile) return null;
    const candidates = (primaryScoredJobs.length > 0 ? primaryScoredJobs : broaderScoredJobs)
      .filter((j) => j.score >= 45 && j.score <= 65);
    let best: (typeof candidates[number] & { _stretchReason: string }) | null = null;
    for (const job of candidates) {
      const reason = getExclusionOrMismatchReason(job, profile);
      if (!reason || reason.startsWith("it's outside your usual industries")) continue;
      if (!best || job.score > best.score) best = { ...job, _stretchReason: reason };
    }
    return best;
  }, [profile, primaryScoredJobs, broaderScoredJobs]);

  // Client-side once-a-day gate, on top of the server-side AI quota.
  const [showStretchPick, setShowStretchPick] = useState(false);
  useEffect(() => {
    if (!stretchPickJob) { setShowStretchPick(false); return; }
    try {
      const key = `howdy_stretch_pick_shown:${new Date().toISOString().slice(0, 10)}`;
      if (localStorage.getItem(key)) { setShowStretchPick(false); return; }
      localStorage.setItem(key, "1");
      setShowStretchPick(true);
    } catch {
      setShowStretchPick(true);
    }
  }, [stretchPickJob?.id]);

  // Jobs from the "other" bucket that match the user's role preferences —
  // surfaced separately as "roles you might not have considered".
  const discoverJobs = useMemo(() => {
    if (!profile) return [];
    const effectiveRoles = getEffectiveRoles(profile);
    if (effectiveRoles.length === 0) return [];
    return jobs
      .filter((job) => job.industry === "other" && !dismissedIds.has(job.id) && !likedIds.has(job.id) && !likedDedupeKeys.has(jobDedupeKey(job)))
      .map((job) => ({ ...job, ...scoreJob(job, profile, { roleProfiles, learned: learnedSignals, behavioralAffinity }) }))
      .filter((job) => hasRoleMatch(job, profile) && job.score >= 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [jobs, profile, roleProfiles, dismissedIds, likedIds, likedDedupeKeys, learnedSignals, behavioralAffinity]);

  const hasPreferences = profile && (
    (profile.industry_interests && profile.industry_interests.length > 0) ||
    getEffectiveCareerLevel(profile) ||
    profile.location_preference ||
    (profile.role_preferences && profile.role_preferences.length > 0) ||
    (profile.understand_me_results?.roleMatches && profile.understand_me_results.roleMatches.length > 0) ||
    profile.understand_me_results
  );


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const navItems: { value: typeof inboxTab; label: string; icon: React.ReactNode; badge?: number; highlight?: boolean; to?: string }[] = [
    { value: "search",  label: "Jobs",        icon: <Search className="w-[22px] h-[22px]" />, to: "/marketplace" },
    { value: "jobs",    label: "Howdy Jobs",  icon: <img src={howdyMascot} alt="" className="w-7 h-7 object-contain" />, badge: newJobsSinceLastSeen || jobsQueueForBadge.length },
    { value: "liked",   label: "Liked",       icon: <Heart className="w-[22px] h-[22px]" />, badge: likedJobs.length || undefined },
    { value: "saved",   label: "Saved",       icon: <Bookmark className="w-[22px] h-[22px]" />, badge: savedJobs.length || undefined },
    { value: "links",   label: "Settings",    icon: <Globe className="w-[22px] h-[22px]" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/my-jobs" title="Howdy Jobs" noIndex />
      <div className="max-w-3xl lg:max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8">

        {/* Editorial header — calm, two-line greeting, tagline, inbox bubble */}
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
                {((user?.user_metadata as any)?.full_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#00E600] ring-2 ring-background" aria-hidden />
          </Link>

          <div className="flex-1 min-w-0">
            {(() => {
              const firstName = (user?.user_metadata as any)?.full_name?.split(" ")[0];
              return (
                <h1 className="font-display font-900 text-[26px] sm:text-[34px] leading-[1.02] tracking-tight text-foreground break-words">
                  Howdoyoudo<span className="text-[#00E600]">?</span>
                  {firstName ? (
                    <>
                      <br />
                      <span className="text-[#00E600]">{firstName}</span>
                    </>
                  ) : null}
                </h1>
              );
            })()}
            <p className="mt-2 font-body text-[13px] sm:text-sm text-foreground/55 leading-snug">
              Your world. Your feed. Your opportunities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/inbox")}
            aria-label="Open inbox"
            className="relative w-11 h-11 rounded-full flex items-center justify-center text-foreground bg-foreground/[0.04] hover:bg-foreground/10 transition shrink-0 mt-1"
          >
            <Inbox className="w-[20px] h-[20px]" />
            {employerRequests.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#00E600] text-foreground font-display font-900 text-[10px] px-1 ring-2 ring-background">
                {employerRequests.length}
              </span>
            )}
          </button>
          <HowdyHeaderButton showDot={!!howdyJobsMeta.lastSeenAt && newJobsSinceLastSeen > 0} />
        </header>


        {/* Tab state container - bottom nav drives this */}
        <Tabs value={inboxTab} onValueChange={(v) => setInboxTab(v as typeof inboxTab)} className="w-full">


          {/* ─── QUICK LINKS TAB ─── */}
          <TabsContent value="links" className="mt-0 focus-visible:outline-none">
            {profile?.industry_interests && profile.industry_interests.length > 0 ? (
              <div className="border-2 border-foreground p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Pin className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-900 text-sm uppercase tracking-wider text-foreground">
                    Your pinned industries
                  </h2>
                  <Link to="/my-profile" className="ml-auto font-display text-[10px] font-700 uppercase tracking-wider text-primary hover:underline">
                    Edit
                  </Link>
                </div>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  Tap any pin to jump straight into that industry hub.
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.industry_interests.map((ind) => {
                    const slug = ind.toLowerCase().trim().replace(/\s+/g, "-");
                    const label = ind.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    return (
                      <Link
                        key={slug}
                        to={`/${slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-background text-foreground font-display text-xs font-700 border-2 border-foreground rounded-full shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        title={`Open ${label}`}
                      >
                        📌 {label}
                      </Link>
                    );
                  })}
                </div>

                {/* Other preference chips */}
                {(profile.role_preferences?.length || profile.location_preference || getEffectiveCareerLevel(profile)) && (
                  <div className="mt-5 pt-4 border-t-2 border-foreground/10">
                    <p className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-2">
                      Also matching on
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.role_preferences && profile.role_preferences.length > 0 && (
                        <>
                          {profile.role_preferences.map((rp) => {
                            const needle = rp.toString().trim().toLowerCase();
                            const match = roles.find(
                              (r) =>
                                r.slug.toLowerCase() === needle ||
                                r.title.toLowerCase() === needle ||
                                r.slug.toLowerCase() === needle.replace(/\s+/g, "-"),
                            );
                            const label = match?.title ?? rp;
                            const slug = match?.slug ?? needle.replace(/\s+/g, "-");
                            return (
                              <Link
                                key={`role-${slug}`}
                                to={`/roles/${slug}`}
                                title={`Open ${label}`}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-foreground/10 text-foreground font-display text-xs font-600 border-2 border-foreground/80 rounded-full hover:bg-primary/15 hover:border-foreground transition-colors"
                              >
                                <Search className="w-3 h-3" />
                                {label}
                              </Link>
                            );
                          })}
                        </>
                      )}
                      {getEffectiveCareerLevel(profile) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary font-display text-xs font-600 border-2 border-foreground/80 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          {LEVEL_LABELS[getEffectiveCareerLevel(profile) as CareerLevel] || getEffectiveCareerLevel(profile)}
                        </span>
                      )}
                      {profile.location_preference && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary font-display text-xs font-600 border-2 border-foreground/80 rounded-full">
                          <MapPin className="w-3 h-3" />
                          {profile.location_preference}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Most Wanted companies */}
                <div className="mt-5 pt-4 border-t-2 border-foreground/10">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">
                      ⭐ Most wanted
                    </p>
                    <Link
                      to="/my-profile?edit=most-wanted"
                      className="ml-auto font-display text-[10px] font-700 uppercase tracking-wider text-primary hover:underline"
                    >
                      {profile.job_preferences?.targetCompanies?.length ? "Edit" : "Add"}
                    </Link>
                  </div>

                  {profile.job_preferences?.targetCompanies && profile.job_preferences.targetCompanies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.job_preferences.targetCompanies.map((co) => {
                        const externalUrl = getCompanyExternalUrl(co);
                        const profilePath = getCompanyProfilePath(co);
                        const slug = getCompanySlug(co);
                        const chip = (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background text-foreground font-display text-xs font-700 border-2 border-foreground rounded-full shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            ⭐ {co}
                          </span>
                        );

                        if (externalUrl) {
                          return (
                            <a
                              key={`co-${co}`}
                              href={externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Open ${co}`}
                              onClick={() => {
                                trackInteraction({
                                  type: "company_view",
                                  companySlug: slug ?? undefined,
                                  metadata: { company_name: co, source: "my_jobs_quick_links", destination: externalUrl },
                                });
                              }}
                            >
                              {chip}
                            </a>
                          );
                        }

                        return profilePath ? (
                          <Link
                            key={`co-${co}`}
                            to={profilePath}
                            title={`Open ${co} profile`}
                            onClick={() => {
                              trackInteraction({
                                type: "company_view",
                                companySlug: slug ?? undefined,
                                metadata: { company_name: co, source: "my_jobs_quick_links" },
                              });
                            }}
                          >
                            {chip}
                          </Link>
                        ) : (
                          <span key={`co-${co}`} title={co}>{chip}</span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="font-body text-xs text-muted-foreground">
                      No target companies yet.{" "}
                      <Link to="/my-profile?edit=most-wanted" className="text-primary font-700 hover:underline">
                        Add the brands you'd love to work for →
                      </Link>
                    </p>
                  )}
                </div>

              </div>
            ) : (
              <div className="border-2 border-foreground p-8 text-center rounded-2xl">
                <Pin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-700 text-sm text-foreground mb-2">No pinned industries yet</p>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  Pin your favourite industries from My Profile to keep one-tap access here.
                </p>
                <Link to="/my-profile" className="inline-block hover:opacity-90 transition-opacity">
                  <SketchCta>Pin industries →</SketchCta>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* ─── JOBS TAB ─── */}
          <TabsContent value="jobs" className="mt-0 focus-visible:outline-none">
            {/* Switcher mode banner */}
            {hasPreferences && isIndustrySwitcher(profile) && (
              <div className="mb-5 border-2 border-foreground bg-primary/5 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-display font-700 text-xs text-foreground mb-1 uppercase tracking-wider">
                    Industry switch detected
                  </p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    We're showing roles in {profile.industry_interests?.slice(0, 3).join(", ")} based on what you said you want next, not your CV history. We've also relaxed seniority filters so you can explore routes into the new field.
                  </p>
                </div>
                <Link to="/profile" className="font-display text-[10px] font-700 uppercase tracking-wider text-primary hover:underline shrink-0">
                  Edit
                </Link>
              </div>
            )}


            {/* No preferences set */}
            {!hasPreferences && (
              <div className="border-2 border-foreground p-8 text-center rounded-2xl">
                <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-700 text-sm text-foreground mb-2">Set your preferences first</p>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  Add your industry interests, role preferences, career level, and location to start seeing matched jobs.
                </p>
                <Link to="/my-profile" className="inline-block hover:opacity-90 transition-opacity">
                  <SketchCta>Set up My Profile →</SketchCta>
                </Link>
              </div>
            )}

            {/* Explainer banner */}
            {hasPreferences && (
              <div className="mb-5 border-2 border-foreground/10 bg-muted/40 rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 space-y-1">
                  <p className="font-display font-800 text-sm">Swipe through jobs picked for you<span className="text-primary">.</span></p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    <span className="text-[#00E600] font-700">→ Right</span> to like · <span className="text-red-500 font-700">← Left</span> to pass · <span className="font-700">Bookmark</span> to save for later. The more you swipe, the smarter your picks get — every like and pass teaches the algorithm what you're really after.
                  </p>
                </div>
              </div>
            )}

            {/* Stretch pick — at most one per day, only when a genuine reach exists */}
            {hasPreferences && showStretchPick && stretchPickJob && (
              <StretchPickCard job={stretchPickJob} reason={stretchPickJob._stretchReason} />
            )}

            {/* Tinder card stack — falls back to the algorithm's broader picks
                once the strict industry+match-threshold stack runs dry, instead
                of just stopping. Gated on historyReady so a reload never briefly
                re-shows cards you already swiped before the dismissed/liked
                state has loaded back from the DB. */}
            {hasPreferences && !historyReady && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {hasPreferences && historyReady && (
              <TinderCardStack
                jobs={primaryScoredJobs.length > 0 ? primaryScoredJobs : broaderScoredJobs}
                isFallback={primaryScoredJobs.length === 0 && broaderScoredJobs.length > 0}
                onDismiss={handleDismiss}
                onLike={handleLike}
                onSave={toggleSaveJob}
                onOpen={handleOpen}
                savedIdSet={savedIdSet}
                onTrack={trackJob}
                trackedIdSet={trackedIdSet}
              />
            )}
          </TabsContent>

          {/* ─── LIKED JOBS TAB ─── */}
          <TabsContent value="liked" className="mt-0 focus-visible:outline-none">
            {likedLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : likedJobs.length === 0 ? (
              <div className="border-2 border-foreground rounded-2xl p-10 text-center">
                <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-700 text-lg mb-1">No likes yet<span className="text-primary">.</span></p>
                <p className="font-body text-sm text-muted-foreground">Swipe right on jobs you like — they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-body text-xs text-muted-foreground mb-4">{likedJobs.length} liked job{likedJobs.length !== 1 ? "s" : ""} — stale ones are removed automatically.</p>
                <div className="divide-y-2 divide-foreground/10 border-2 border-foreground rounded-2xl overflow-hidden">
                  {likedJobs.map((job) => (
                    <div key={job.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => handleOpen(job.url, job.id)}>
                      <CompanyLogo company={job.company} size={36} className="mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-700 text-sm truncate">{job.title}</p>
                        <p className="font-body text-xs text-muted-foreground truncate">{job.company}{job.location && ` · ${job.location}`}{job.salary && ` · ${job.salary}`}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUnlike(job.id); }}
                        className="shrink-0 p-1.5 text-[#00E600] hover:text-red-400 transition-colors rounded-full hover:bg-red-50"
                        title="Unlike"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ─── SAVED JOBS TAB ─── */}
          <TabsContent value="saved" className="mt-0 focus-visible:outline-none">
            <SavedTabContent
              savedJobs={savedJobs}
              savedLoading={savedLoading}
              unsaveJob={unsaveJob}
            />
          </TabsContent>

          {/* ─── MEMBERS TAB ─── */}
          <TabsContent value="members" className="mt-0 focus-visible:outline-none">
            <div className="space-y-6">
              <MentorRequestsInbox />
              <MembersArea />
            </div>
          </TabsContent>

        </Tabs>

        {/* Tab navigation — sits below the card content, not floating */}
        <nav
          aria-label="Primary"
          className="mt-8 border-t-2 border-foreground/10"
        >
          <ul className="grid grid-cols-5">
            {navItems.map((item) => {
              const active = inboxTab === item.value;
              return (
                <li key={item.value} className="flex">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.to) {
                        navigate(item.to);
                        return;
                      }
                      setInboxTab(item.value as typeof inboxTab);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 pt-3 pb-2 transition-colors ${
                      active ? "text-[#00E600]" : "text-foreground/55 hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span
                      className={`relative flex items-center justify-center ${
                        active ? "w-11 h-11 rounded-full -mt-1 bg-[#00E600]/15" : ""
                      }`}
                    >
                      {item.icon}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#FF3B30] text-white font-display font-900 text-[9px]">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </span>
                    <span className={`font-display text-[10px] tracking-tight ${active ? "font-800 text-[#00E600]" : "font-600"}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

      </div>
    </div>
  );
};

export default MyJobs;
