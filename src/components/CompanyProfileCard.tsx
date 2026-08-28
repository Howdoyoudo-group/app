import { Star, ArrowRight, Target, Check, Sparkles, Building2, Briefcase, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompanyLogo from "@/components/CompanyLogo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackInteraction } from "@/hooks/useTrackInteraction";
import { getCompanyBrand } from "@/lib/company-brand";
import { getCompanyProfilePath } from "@/lib/company-profiles";
import { toEmbeddableVideo } from "@/lib/video-embed";

export interface CompanyProfile {
  name: string;
  url: string;
  founded: string;
  hq: string;
  overview: string;
  glassdoor?: number;
  trustpilot?: number;
  profileUrl?: string;
  valueChainStage?: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`f-${i}`} className="w-3 h-3 fill-amber-400 text-amber-400" />
        ))}
        {hasHalf && (
          <div className="relative w-3 h-3">
            <Star className="absolute inset-0 w-3 h-3 text-amber-400/30" />
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`e-${i}`} className="w-3 h-3 text-amber-400/30" />
        ))}
      </div>
      <span className="text-[11px] font-body text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
};

const CompanyProfileCard = ({
  company,
  isSaved = false,
  onToggleSave,
  saving = false,
}: {
  company: CompanyProfile;
  isSaved?: boolean;
  onToggleSave?: (name: string) => void;
  saving?: boolean;
}) => {
  return (
    <div className="border border-border p-5 hover:border-primary transition-colors group">
      <a
        href={company.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex items-start gap-3 mb-2">
          <CompanyLogo company={company.name} size={44} />
          <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
            <h3 className="font-display font-700 text-foreground text-base group-hover:text-primary transition-colors">
              {company.name}
            </h3>
            <span className="text-muted-foreground font-body text-xs shrink-0">
              {company.founded} · {company.hq}
            </span>
          </div>
        </div>
        {company.valueChainStage && (
          <span className="inline-block text-[10px] font-body font-600 uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 mb-2">
            {company.valueChainStage}
          </span>
        )}
        <p className="text-muted-foreground font-body text-sm leading-relaxed">
          {company.overview}
        </p>
      </a>
      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        {(company.glassdoor || company.trustpilot) ? (
          <div className="flex items-center gap-4 flex-wrap">
            {company.glassdoor && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Glassdoor</span>
                <StarRating rating={company.glassdoor} />
              </div>
            )}
            {company.trustpilot && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Trustpilot</span>
                <StarRating rating={company.trustpilot} />
              </div>
            )}
          </div>
        ) : (
          <div />
        )}
        {company.profileUrl && (
          <Link
            to={company.profileUrl}
            className="inline-flex items-center gap-1 text-primary font-body text-xs font-500 hover:underline"
          >
            View culture profile
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {onToggleSave && (
        <button
          onClick={() => onToggleSave(company.name)}
          disabled={saving}
          className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border text-xs font-display font-700 uppercase tracking-wider transition-colors ${
            isSaved
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:border-primary hover:text-primary"
          } disabled:opacity-50`}
        >
          {isSaved ? (
            <>
              <Check className="w-3 h-3" />
              Saved to Most Wanted
            </>
          ) : (
            <>
              <Target className="w-3 h-3" />
              Save to Most Wanted
            </>
          )}
        </button>
      )}
    </div>
  );
};

/** Map URL pathname → industry slug used in pinned_industry_employers.industry */
const industryFromPath = (): string | null => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname.toLowerCase();
  const seg = path.split("/").filter(Boolean)[0];
  if (!seg) return null;
  // pages with multi-word slugs already match (e.g. /horse-racing, /estate-agency)
  return seg;
};

type Spotlight = {
  name: string;
  slug: string;
  tagline: string;
  whyWorkHere: string[];
  url: string;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
};

/** Premium "advert" tile for the editor-picked Employer Spotlight - same
 * brand-banner treatment as the Marketplace jobs-page spotlight, so a pinned
 * employer reads as a promoted feature rather than just an ordinary card
 * that happens to be first. */
const EmployerSpotlightTile = ({ spotlight }: { spotlight: Spotlight }) => {
  const brand = getCompanyBrand(spotlight.slug);
  const profilePath = getCompanyProfilePath(spotlight.name);
  const isExternalUrl = /^https?:\/\//i.test(spotlight.url || "");
  const embed = spotlight.mediaType === "video" && spotlight.mediaUrl
    ? toEmbeddableVideo(spotlight.mediaUrl)
    : null;
  const hasCustomMedia = Boolean(spotlight.mediaUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative border-2 border-foreground bg-card flex flex-col min-w-0 overflow-hidden shadow-[6px_6px_0_0_hsl(var(--foreground))] mb-8"
    >
      {hasCustomMedia ? (
        <div className="relative">
          <div
            className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-[10px] font-body uppercase tracking-[0.18em] px-2 py-0.5 border bg-card/90"
            style={{ borderColor: "hsl(var(--foreground))" }}
          >
            <Sparkles className="w-3 h-3" /> Employer spotlight
          </div>
          {spotlight.mediaType === "video" && embed ? (
            embed.kind === "iframe" ? (
              <iframe
                src={embed.src}
                title={`${spotlight.name} video`}
                className="w-full aspect-video border-0 block"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={embed.src}
                controls
                muted
                loop
                playsInline
                className="w-full aspect-video object-cover block"
              />
            )
          ) : (
            <img
              src={spotlight.mediaUrl!}
              alt={`${spotlight.name} banner`}
              className="w-full aspect-[21/9] object-cover block"
            />
          )}
        </div>
      ) : (
        <div
          className="relative px-4 md:px-6 pt-4 pb-12"
          style={{ backgroundColor: brand.bg, color: brand.fg }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 10px)",
            }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div
                className="inline-flex items-center gap-1 text-[10px] font-body uppercase tracking-[0.18em] px-2 py-0.5 border"
                style={{ borderColor: brand.fg, color: brand.fg, opacity: 0.85 }}
              >
                <Sparkles className="w-3 h-3" /> Employer spotlight
              </div>
              <h3
                className="font-display font-700 text-xl md:text-2xl leading-tight mt-2 break-words"
                style={{ color: brand.fg }}
              >
                {spotlight.name}
              </h3>
              <p
                className="font-body text-sm leading-relaxed mt-1.5 max-w-prose"
                style={{ color: brand.fg, opacity: 0.92 }}
              >
                {spotlight.tagline}
              </p>
            </div>
          </div>
        </div>
      )}

      {hasCustomMedia && (
        <div className="px-4 md:px-6 pt-3">
          <h3 className="font-display font-700 text-xl md:text-2xl leading-tight break-words">
            {spotlight.name}
          </h3>
          <p className="font-body text-sm leading-relaxed mt-1.5 max-w-prose text-muted-foreground">
            {spotlight.tagline}
          </p>
        </div>
      )}

      <div className="relative px-4 md:px-6">
        <div className={`${hasCustomMedia ? "mt-3" : "-mt-9"} mb-3 inline-flex bg-card border-2 border-foreground p-1.5 shadow-sm`}>
          <CompanyLogo company={spotlight.name} size={56} />
        </div>
      </div>

      <div className="px-4 md:px-6 pb-4 md:pb-5 flex flex-col gap-3">
        {spotlight.whyWorkHere.length > 0 && (
          <div>
            <p className="font-display font-700 text-xs uppercase tracking-wide text-foreground mb-2">
              Why work here
            </p>
            <ul className="space-y-1.5">
              {spotlight.whyWorkHere.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-foreground/80 font-body text-xs leading-relaxed"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: brand.bg }}
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {profilePath ? (
            <Button
              size="sm"
              className="font-body text-xs border-2 border-foreground hover:opacity-90"
              style={{ backgroundColor: brand.bg, color: brand.fg }}
              asChild
            >
              <Link to={profilePath}>
                <Building2 className="w-3.5 h-3.5 mr-1" /> View company profile
              </Link>
            </Button>
          ) : null}
          {isExternalUrl && (
            <Button size="sm" variant="outline" className="font-body text-xs border-2 border-foreground" asChild>
              <a href={spotlight.url} target="_blank" rel="noopener noreferrer">
                <Briefcase className="w-3.5 h-3.5 mr-1" />
                See open roles
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/** Filterable grid of company profiles with value chain stage toggle */
export const CompanyProfileGrid = ({
  companies,
  title = "Companies to know",
  subtitle = "Who's who",
  industry: industryProp,
}: {
  companies: CompanyProfile[];
  title?: string;
  subtitle?: string;
  industry?: string;
}) => {
  const industry = (industryProp ?? industryFromPath() ?? "").toLowerCase();
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null);
  // Whether we've finished checking for a pin yet. The animated grid below
  // waits for this before its first paint, so the spotlighted company is
  // never briefly included then removed - that flicker was getting the
  // exit animation stuck (a lingering opacity:0 ghost card) rather than
  // cleanly unmounting.
  const [spotlightChecked, setSpotlightChecked] = useState(false);

  // Load the single winning Employer Spotlight pin for this industry (lowest
  // rank, active row). It renders as its own premium "advert" tile above the
  // grid - not merged into the grid as an ordinary card.
  useEffect(() => {
    if (!industry) { setSpotlightChecked(true); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("pinned_industry_employers")
        .select("company_name, tagline, why_work_here, url, media_url, media_type")
        .ilike("industry", industry)
        .eq("active", true)
        .order("rank", { ascending: true })
        .limit(1);
      if (cancelled) return;
      const row = data?.[0] as any;
      if (!row) { setSpotlight(null); setSpotlightChecked(true); return; }
      setSpotlight({
        name: row.company_name,
        slug: row.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        tagline: row.tagline || `A notable employer in ${industry}.`,
        whyWorkHere: row.why_work_here ?? [],
        url: row.url || "#",
        mediaUrl: row.media_url || null,
        mediaType: row.media_type || null,
      });
      setSpotlightChecked(true);
    })();
    return () => { cancelled = true; };
  }, [industry]);

  // The spotlighted company already gets its own featured tile above the
  // grid, so drop it from the ordinary grid to avoid showing it twice.
  const mergedCompanies = spotlight
    ? companies.filter((c) => c.name.toLowerCase() !== spotlight.name.toLowerCase())
    : companies;

  const stages = Array.from(
    new Set(mergedCompanies.map((c) => c.valueChainStage).filter(Boolean))
  ) as string[];
  const hasStages = stages.length > 1;
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const { user } = useAuth();
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [savingCompany, setSavingCompany] = useState<string | null>(null);

  // Load saved target companies
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
      const saved = Array.isArray(jp.targetCompanies) ? (jp.targetCompanies as string[]) : [];
      if (!cancelled) setTargetCompanies(saved);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleCompany = async (name: string) => {
    if (!user) {
      toast.error("Please log in to save companies to your Most Wanted", {
        action: {
          label: "Log in",
          onClick: () => {
            window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          },
        },
      });
      return;
    }
    setSavingCompany(name);
    const isSaved = targetCompanies.includes(name);
    const next = isSaved
      ? targetCompanies.filter((c) => c !== name)
      : [...targetCompanies, name];
    const { data: existing } = await supabase
      .from("profiles")
      .select("job_preferences")
      .eq("id", user.id)
      .maybeSingle();
    const merged = {
      ...((existing?.job_preferences as Record<string, unknown>) || {}),
      targetCompanies: next,
    };
    const { error } = await supabase
      .from("profiles")
      .update({ job_preferences: merged, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSavingCompany(null);
    if (error) {
      toast.error("Couldn't save. Try again.");
      return;
    }
    setTargetCompanies(next);
    // Log a "save_company" interaction so the brand's employer dashboard counts it.
    if (!isSaved) {
      trackInteraction({
        type: "save_company",
        metadata: { company_name: name },
      });
    }
    toast.success(
      isSaved ? `Removed "${name}" from Most Wanted` : `Saved "${name}" to Most Wanted`,
      {
        action: {
          label: "View profile",
          onClick: () => {
            window.location.href = "/my-profile";
          },
        },
      }
    );
  };

  const filtered = activeStage
    ? mergedCompanies.filter((c) => c.valueChainStage === activeStage)
    : mergedCompanies;

  return (
    <>
      {subtitle && (
        <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-3">
          {subtitle}
        </p>
      )}
      {title && (
        <h2 className="font-display text-3xl md:text-5xl font-800 leading-none mb-6">
          {title}
          <span className="text-primary">.</span>
        </h2>
      )}

      {spotlight && <EmployerSpotlightTile spotlight={spotlight} />}

      {hasStages && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveStage(null)}
            className={`px-4 py-2 text-xs font-display font-600 uppercase tracking-wide border transition-colors ${
              activeStage === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            All
          </button>
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(activeStage === stage ? null : stage)}
              className={`px-4 py-2 text-xs font-display font-600 uppercase tracking-wide border transition-colors ${
                activeStage === stage
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!spotlightChecked ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))
        ) : (
        <AnimatePresence mode="popLayout">
          {filtered.map((c) => (
            <motion.div
              key={c.name}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <CompanyProfileCard
                company={c}
                isSaved={targetCompanies.includes(c.name)}
                onToggleSave={toggleCompany}
                saving={savingCompany === c.name}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        )}
      </div>
    </>
  );
};

export default CompanyProfileCard;
