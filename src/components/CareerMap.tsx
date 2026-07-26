import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, PoundSterling, Briefcase, Target, Check, ArrowUpRight, ExternalLink, Loader2, Star } from "lucide-react";
import { resolveCareerMapRoleSlug, resolveNcsCatalogMatch, type NcsCatalogEntry, type NcsMatch } from "@/data/career-map-role-resolver";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { trackInteraction } from "@/hooks/useTrackInteraction";
import { getStageImage } from "@/data/career-stage-images";
import { useTargetRoles } from "@/hooks/useTargetRoles";

export interface RoleDetail {
  name: string;
  description: string;
  salary: string;
  track?: string;
}

export interface CareerStage {
  title: string;
  icon: LucideIcon;
  roles: RoleDetail[];
  image?: string;
}

interface CareerMapProps {
  title: string;
  subtitle: string;
  stages: CareerStage[];
  industry: string;
}

/** Derive an experience-level label from salary string */
const deriveLevel = (salary: string): string => {
  const match = salary.match(/£(\d+)k/i);
  if (!match) return "Various";
  const lower = parseInt(match[1], 10);
  if (lower >= 50) return "Senior";
  if (lower >= 30) return "Mid level";
  return "Entry level";
};

const LEVEL_FILTERS = ["All", "Entry level", "Mid level", "Senior"] as const;
type LevelFilter = (typeof LEVEL_FILTERS)[number];

// Lightweight {ncs_slug, title, ncs_sector} index for all ~733 NCS job
// profiles - cached at module level so navigating between industry pages
// doesn't refetch it every time. Heavy content columns (tasks, skills etc.)
// are fetched per-tile, lazily, only on "More" expand.
let ncsCatalogCache: NcsCatalogEntry[] | null = null;
let ncsCatalogPromise: Promise<NcsCatalogEntry[]> | null = null;
const loadNcsCatalogIndex = async (): Promise<NcsCatalogEntry[]> => {
  if (ncsCatalogCache) return ncsCatalogCache;
  if (!ncsCatalogPromise) {
    ncsCatalogPromise = (async () => {
      const { data } = await supabase
        .from("ncs_role_catalog")
        .select("ncs_slug, title, ncs_sector")
        .eq("scrape_status", "ok");
      ncsCatalogCache = (data ?? []) as NcsCatalogEntry[];
      return ncsCatalogCache;
    })();
  }
  return ncsCatalogPromise;
};

const CareerMap = ({ title, subtitle, stages, industry }: CareerMapProps) => {
  const { user } = useAuth();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("All");

  const [jobCount, setJobCount] = useState<number | null>(null);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const { targetRoles: activeRoles, addTargetRole, removeTargetRole } = useTargetRoles(user?.id);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [ncsCatalog, setNcsCatalog] = useState<NcsCatalogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadNcsCatalogIndex().then((entries) => {
      if (!cancelled) setNcsCatalog(entries);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!industry) return;
    (async () => {
      const { count } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .ilike("industry", industry);
      if (!cancelled) setJobCount(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [industry]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("job_preferences")
        .eq("id", user.id)
        .maybeSingle();
      const jp = (data?.job_preferences as Record<string, unknown>) || {};
      const saved = Array.isArray(jp.targetRoles) ? (jp.targetRoles as string[]) : [];
      if (!cancelled) {
        setTargetRoles(saved);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // "Save to Most Wanted" does double duty: it's the wishlist AND, when the
  // role resolves to a real slug, one of Howdy's coaching focuses - a user
  // can have several roles active at once, and un-saving one here also stops
  // Howdy coaching on it.
  const toggleTargetRole = async (roleName: string, roleSlug?: string | null) => {
    if (!user) {
      toast.error("Please log in to save roles to your Most Wanted", {
        action: {
          label: "Log in",
          onClick: () => {
            window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          },
        },
      });
      return;
    }
    setSavingRole(roleName);
    const isSaved = targetRoles.includes(roleName);
    const next = isSaved
      ? targetRoles.filter((r) => r !== roleName)
      : [...targetRoles, roleName];
    const { data: existing } = await supabase
      .from("profiles")
      .select("job_preferences")
      .eq("id", user.id)
      .maybeSingle();
    const merged = {
      ...((existing?.job_preferences as Record<string, unknown>) || {}),
      targetRoles: next,
    };
    const updates: Record<string, unknown> = { job_preferences: merged, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from("profiles")
      .update(updates as any)
      .eq("id", user.id);
    setSavingRole(null);
    if (error) {
      toast.error("Couldn't save. Try again.");
      return;
    }
    setTargetRoles(next);
    const becomesActiveRole = !isSaved && roleSlug;
    if (becomesActiveRole) await addTargetRole(roleSlug!);
    else if (isSaved && roleSlug) await removeTargetRole(roleSlug);
    if (!isSaved) {
      trackInteraction({
        type: "save_role",
        industry,
        metadata: { role_name: roleName },
      });
    }
    toast.success(
      isSaved
        ? `Removed "${roleName}" from Most Wanted`
        : becomesActiveRole
          ? `Saved "${roleName}" - Howdy's now coaching you on this`
          : `Saved "${roleName}" to Most Wanted`
    );
  };

  const marketplaceHref = `/marketplace?industry=${encodeURIComponent(industry)}#jobs-list`;

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      id="career-map"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 scroll-mt-24"
    >
      {/* Header */}
      <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">Your Pathway</p>
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">
        {title}<span className="text-primary">.</span>
      </h2>
      <p className="text-muted-foreground font-body text-sm mb-6">
        {subtitle}
      </p>

      {jobCount !== null && jobCount > 0 && (
        <Link
          to={marketplaceHref}
          className="inline-flex items-center gap-2 mb-8 border border-border px-3 py-1.5 hover:border-primary hover:bg-primary/5 transition-colors group"
        >
          <Briefcase className="w-3.5 h-3.5 text-primary" />
          <span className="font-display font-700 text-xs text-foreground group-hover:text-primary transition-colors">
            {jobCount} live {jobCount === 1 ? "job" : "jobs"} in this industry
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      )}

      {/* Salary Guide label */}
      <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">Salary Guide</p>

      {/* Stage selector - pill tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          const isActive = expandedIndex === i;
          return (
            <button
              key={stage.title}
              onClick={() => {
                setExpandedIndex(isActive ? null : i); setShowSwipeHint(true);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 border-2 transition-all cursor-pointer ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-display font-700 text-xs tracking-wide uppercase">
                {stage.title}
              </span>
              <span className={`text-[10px] font-body ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {stage.roles.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded stage - department image + role cards */}
      <AnimatePresence mode="wait">
        {expandedIndex !== null && (
          <motion.div
            key={expandedIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Department hero image or generated visual */}
            {(() => {
              const stage = stages[expandedIndex];
              const stageImg = stage.image || getStageImage(industry, stage.title);
              if (stageImg) {
                return (
                  <div className="h-40 md:h-52 overflow-hidden mb-6 border-2 border-border">
                    <img src={stageImg} alt={stage.title} className="w-full h-full object-cover" loading="lazy" width={800} height={208} />
                  </div>
                );
              }
              // Generate a unique visual from stage title + industry
              const str = `${industry}-${stage.title}`;
              let hash = 0;
              for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
              const hue = Math.abs(hash) % 360;
              const hue2 = (hue + 45) % 360;
              const Icon = stage.icon;
              return (
                <div
                  className="h-40 md:h-52 overflow-hidden mb-6 border-2 border-border flex items-center justify-center relative"
                  style={{ background: `linear-gradient(135deg, hsl(${hue}, 50%, 18%), hsl(${hue2}, 40%, 12%))` }}
                >
                  <Icon className="w-16 h-16 text-white/15 absolute right-6 bottom-4" />
                  <div className="text-center z-10 px-4">
                    <Icon className="w-8 h-8 text-white/70 mx-auto mb-2" />
                    <h3 className="font-display font-700 text-white/90 text-lg md:text-xl tracking-wide">{stage.title}</h3>
                    <p className="text-white/50 font-body text-xs mt-1">{stage.roles.length} roles</p>
                  </div>
                </div>
              );
            })()}

            {/* Scroll hint button */}
            {stages[expandedIndex].roles.length > 3 && (
              <button
                onClick={scrollRight}
                className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background border-2 border-border shadow-lg items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            )}

            {/* Career level filter pills */}
            <div className="flex gap-2 flex-wrap mb-4">
              {LEVEL_FILTERS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1 text-[11px] font-display font-700 uppercase tracking-wide rounded-full border transition-colors ${
                    levelFilter === lvl
                      ? lvl === "Entry level"
                        ? "border-[hsl(120,100%,45%)] text-black"
                        : "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                  }`}
                  style={levelFilter === lvl && lvl === "Entry level" ? { background: "hsl(120,100%,45%)" } : {}}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div
              ref={scrollRef}
              onScroll={() => {
                if (scrollRef.current) {
                  const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                  setShowSwipeHint(scrollLeft < scrollWidth - clientWidth - 20);
                }
              }}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {stages[expandedIndex].roles
                .filter((role) => levelFilter === "All" || deriveLevel(role.salary) === levelFilter)
                .map((role, ri) => {
                  const level = deriveLevel(role.salary);
                  const isSaved = targetRoles.includes(role.name);
                  const roleSlug = resolveCareerMapRoleSlug(role.name, industry);
                  const ncsMatch = roleSlug === null ? resolveNcsCatalogMatch(role.name, ncsCatalog, industry) : null;

                  return (
                    <CareerMapRoleCard
                      key={role.name}
                      role={role}
                      ri={ri}
                      level={level}
                      isSaved={isSaved}
                      savingRole={savingRole}
                      roleSlug={roleSlug}
                      ncsMatch={ncsMatch}
                      industry={industry}
                      toggleTargetRole={toggleTargetRole}
                      isActiveRole={roleSlug !== null && activeRoles.some((r) => r.slug === roleSlug)}
                    />
                  );
                })}
            </div>


            {/* Swipe hint for mobile */}
            {showSwipeHint && stages[expandedIndex].roles.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 py-2 md:hidden"
              >
                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="flex items-center gap-1.5 text-muted-foreground"
                >
                  <span className="font-body text-xs">Swipe for more</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state - show a prompt */}
      {expandedIndex === null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-dashed border-border p-8 flex flex-col items-center justify-center text-center"
        >
          <Briefcase className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="font-display font-700 text-foreground text-sm mb-1">
            Select a department above
          </p>
          <p className="text-muted-foreground font-body text-xs">
            Tap any area to explore roles, salaries, and save to your Most Wanted list.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

interface CareerMapRoleCardProps {
  role: RoleDetail;
  ri: number;
  level: string;
  isSaved: boolean;
  savingRole: string | null;
  roleSlug: string | null;
  ncsMatch: NcsMatch | null;
  industry: string;
  toggleTargetRole: (name: string, roleSlug?: string | null) => void;
  isActiveRole: boolean;
}

interface NcsFacts {
  tasks: string[] | null;
  restrictions: string | null;
}

const stripBullet = (s: string) => s.replace(/^\s*[-*]\s*/, "");

const CareerMapRoleCard = ({
  role, ri, level, isSaved, savingRole, roleSlug, ncsMatch, industry, toggleTargetRole, isActiveRole,
}: CareerMapRoleCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [longDesc, setLongDesc] = useState<string | null>(null);
  const [ncsFacts, setNcsFacts] = useState<NcsFacts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMore = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);

    // Real NCS facts take priority over the AI-improvised blurb whenever
    // we have a catalog match - that's the actual fix for tiles that
    // previously only ever showed an AI guess.
    if (ncsMatch) {
      if (ncsFacts || loading) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from("ncs_role_catalog")
          .select("ncs_tasks, ncs_restrictions")
          .eq("ncs_slug", ncsMatch.ncsSlug)
          .maybeSingle();
        if (err) throw err;
        const tasks = (data?.ncs_tasks as string[] | null) ?? null;
        setNcsFacts({
          tasks: tasks && tasks.length > 0 ? tasks : null,
          restrictions: (data?.ncs_restrictions as string | null) ?? null,
        });
      } catch {
        setError("Couldn't load - try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (longDesc || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke("expand-role", {
        body: { roleName: role.name, industry, shortDescription: role.description },
      });
      if (err) throw err;
      const desc = (data as { description?: string })?.description?.trim();
      if (desc) setLongDesc(desc); else setError("No description returned.");
    } catch {
      setError("Couldn't load - try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasNcsTasks = expanded && ncsMatch && ncsFacts?.tasks && ncsFacts.tasks.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: ri * 0.04 }}
      className="snap-start shrink-0 w-[260px] md:w-[280px]"
    >
      <div className="h-full border-2 border-border hover:border-primary/40 transition-all flex flex-col">
        <div className="h-1.5 bg-primary/20" />
        <div className="p-4 flex flex-col flex-1">
          <h4 className="font-display font-700 text-base text-foreground mb-2 leading-tight">
            {role.name}
          </h4>
          {hasNcsTasks ? (
            <div className="mb-2">
              {ncsMatch!.confidence === "medium" && (
                <p className="text-[10px] text-muted-foreground italic mb-1">Closest match: {ncsMatch!.title}</p>
              )}
              <ul className="text-muted-foreground font-body text-sm leading-relaxed space-y-1 list-disc list-inside">
                {ncsFacts!.tasks!.slice(0, 4).map((t, i) => (
                  <li key={i}>{stripBullet(t)}</li>
                ))}
              </ul>
              {ncsFacts!.restrictions && (
                <p className="text-[11px] text-amber-700 dark:text-amber-500 mt-2">You'll need to: {ncsFacts!.restrictions}</p>
              )}
            </div>
          ) : (
            <p className={`text-muted-foreground font-body text-sm leading-relaxed mb-2 ${expanded ? "" : "line-clamp-3"}`}>
              {expanded && longDesc ? longDesc : role.description}
            </p>
          )}
          {expanded && loading && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading more…
            </p>
          )}
          {expanded && error && (
            <p className="text-[11px] text-destructive mb-2">{error}</p>
          )}
          <button
            type="button"
            onClick={handleMore}
            className="self-start text-[11px] font-display uppercase tracking-wider text-primary hover:underline mb-3"
          >
            {expanded ? "Less" : "More"}
          </button>
          <div className="flex items-center gap-1.5 mb-2">
            <PoundSterling className="w-3.5 h-3.5 text-primary" />
            <span className="font-display font-900 text-sm text-foreground">{role.salary}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-display font-600 tracking-wide uppercase ${
              level === "Senior" ? "bg-primary/15 text-primary"
                : level === "Mid level" ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}>{level}</span>
          </div>
          <div className="mt-auto space-y-2">
            {roleSlug && (
              <Link
                to={`/roles/${roleSlug}`}
                onClick={() => trackInteraction({
                  type: "career_map_role_link",
                  industry,
                  metadata: { role_name: role.name, role_slug: roleSlug },
                })}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-primary bg-primary/5 text-foreground text-xs font-display font-700 uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ArrowUpRight className="w-3 h-3" />
                Explore this role
              </Link>
            )}
            {!roleSlug && ncsMatch && ncsMatch.confidence === "high" && (
              <a
                href={`https://nationalcareers.service.gov.uk/job-profiles/${ncsMatch.ncsSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackInteraction({
                  type: "career_map_ncs_link",
                  industry,
                  metadata: { role_name: role.name, ncs_slug: ncsMatch.ncsSlug },
                })}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-border text-muted-foreground text-xs font-display font-700 uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View real job facts (GOV.UK)
              </a>
            )}
            <button
              onClick={() => toggleTargetRole(role.name, roleSlug)}
              disabled={savingRole === role.name}
              className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border text-xs font-display font-700 uppercase tracking-wider transition-colors cursor-pointer ${
                isSaved
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:border-primary hover:text-primary"
              } disabled:opacity-50`}
            >
              {isActiveRole ? (
                <><Star className="w-3 h-3 fill-current" />Your focus role - Howdy's coaching you on this</>
              ) : isSaved ? (
                <><Check className="w-3 h-3" />Saved to Most Wanted</>
              ) : (
                <><Target className="w-3 h-3" />Save to Most Wanted</>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CareerMap;
