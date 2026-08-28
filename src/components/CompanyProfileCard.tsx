import { Star, ArrowRight, Target, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CompanyLogo from "@/components/CompanyLogo";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackInteraction } from "@/hooks/useTrackInteraction";

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
  const [pinned, setPinned] = useState<CompanyProfile[]>([]);

  // Load pinned employers for this industry from the database, then merge
  // with the page-defined `companies` (pinned ones come first; dedup by name).
  useEffect(() => {
    if (!industry) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("pinned_industry_employers")
        .select("company_name, rank, tagline, url")
        .ilike("industry", industry)
        .eq("active", true)
        .order("rank", { ascending: true })
        .order("company_name", { ascending: true });
      if (cancelled || !data) return;
      // Build minimal CompanyProfile entries; admins can pin any brand by name
      // even if it doesn't yet have a hardcoded profile entry.
      const mapped: CompanyProfile[] = data.map((p: any) => ({
        name: p.company_name,
        url: p.url || "#",
        founded: "",
        hq: "",
        overview: p.tagline || "Pinned by editors as a notable employer in this industry.",
      }));
      setPinned(mapped);
    })();
    return () => { cancelled = true; };
  }, [industry]);

  // Merge: pinned first, then any hardcoded company not already pinned (case-insensitive name match).
  const mergedCompanies = (() => {
    if (pinned.length === 0) return companies;
    const pinnedNames = new Set(pinned.map((p) => p.name.toLowerCase()));
    // For pinned brands that DO have a richer hardcoded entry, prefer the hardcoded one
    // (more fields like glassdoor/trustpilot) but keep pinned position.
    const enrichedPinned: CompanyProfile[] = pinned.map((p) => {
      const rich = companies.find((c) => c.name.toLowerCase() === p.name.toLowerCase());
      return rich ?? p;
    });
    const remaining = companies.filter((c) => !pinnedNames.has(c.name.toLowerCase()));
    return [...enrichedPinned, ...remaining];
  })();

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
      </div>
    </>
  );
};

export default CompanyProfileCard;
