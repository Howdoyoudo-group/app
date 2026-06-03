import { useMemo } from "react";
import CompanyLogo, { findCuratedDomain } from "@/components/CompanyLogo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JobLike {
  company?: string | null;
}

interface CompanyLogoStripProps {
  jobs: JobLike[];
  /** Max distinct companies to show before the "+N" suffix. */
  limit?: number;
  className?: string;
  /**
   * Currently-active company filter (lowercased company name). When set,
   * that logo is highlighted and clicking it again clears the filter.
   */
  activeCompany?: string | null;
  /**
   * Click handler - receives the canonical company name. Pass a function
   * that sets the marketplace search/company filter to this value.
   * Pass null to clear.
   */
  onCompanyClick?: (company: string | null) => void;
}

/**
 * Thin, horizontally-scrolling strip of company logos derived from the
 * current job results. Only renders companies we have a curated logo
 * domain for (no grey initials placeholders). Clicking a logo filters
 * the marketplace to that company.
 *
 * Visible on mobile and desktop - adds ~52px of vertical footprint.
 */
const CompanyLogoStrip = ({
  jobs,
  limit = 40,
  className = "",
  activeCompany = null,
  onCompanyClick,
}: CompanyLogoStripProps) => {
  const companies = useMemo(() => {
    // Tally job counts per canonical brand. We dedupe by curated logo domain
    // so that "Dr. Martens" / "Dr Martens" / "Marks & Spencer" / "M&S" don't
    // each render their own logo. The first-seen display name wins.
    const tally = new Map<string, { name: string; count: number }>();
    for (const j of jobs) {
      const rawName = (j.company ?? "").trim();
      if (!rawName) continue;
      const domain = findCuratedDomain(rawName);
      // Only include companies we have a real, recognisable logo for.
      if (!domain) continue;
      const key = domain.toLowerCase();
      // Roll up every NHS Trust under a single "NHS" logo + filter.
      const name = key === "nhs.uk" ? "NHS" : rawName;
      const existing = tally.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        tally.set(key, { name, count: 1 });
      }
    }
    return Array.from(tally.values())
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .map((entry) => entry.name);
  }, [jobs]);

  if (companies.length === 0) return null;

  const visible = companies.slice(0, limit);
  const overflow = companies.length - visible.length;
  const activeKey = activeCompany?.toLowerCase() ?? null;

  return (
    <div
      className={`relative -mx-4 md:mx-0 mb-3 ${className}`}
      aria-label="Companies hiring in this view"
    >
      <div
        className="flex items-center gap-3 overflow-x-auto px-4 md:px-0 py-2 scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <span className="shrink-0 text-[10px] tracking-[0.25em] uppercase font-body text-muted-foreground pr-1">
          Hiring
        </span>
        <TooltipProvider delayDuration={200}>
          {visible.map((company) => {
            const isActive = activeKey === company.toLowerCase();
            const logo = (
              <span
                className={`block w-9 h-9 rounded-full overflow-hidden bg-background transition-all ${
                  isActive
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:opacity-75"
                }`}
              >
                <CompanyLogo company={company} size={36} />
              </span>
            );
            return (
              <Tooltip key={company}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onCompanyClick?.(isActive ? null : company)}
                    aria-label={
                      isActive
                        ? `Clear filter (currently ${company})`
                        : `Filter jobs by ${company}`
                    }
                    aria-pressed={isActive}
                    className="shrink-0 cursor-pointer"
                  >
                    {logo}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {company}
                  <span className="block text-[10px] text-primary">
                    {isActive ? "Tap to clear" : "Tap to filter"}
                  </span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
        {overflow > 0 && (
          <span className="shrink-0 text-[11px] font-body text-muted-foreground px-2">
            +{overflow}
          </span>
        )}
        {activeKey && (
          <button
            type="button"
            onClick={() => onCompanyClick?.(null)}
            className="shrink-0 ml-2 text-[11px] font-body text-primary underline whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanyLogoStrip;
