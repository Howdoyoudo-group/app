import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, SlidersHorizontal, X, Check } from "lucide-react";
import SEO from "@/components/SEO";
import { roles, industryToSlug, type RoleCategory } from "@/data/roles";
import { ROLE_ICONS } from "@/data/roleIcons";
import { INDUSTRY_ICONS } from "@/data/industryIcons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

// ── All unique industries from role data ──────────────────────────────────────
const ALL_INDUSTRIES = Array.from(new Set(roles.flatMap((r) => r.industries))).sort();

const CATEGORY_OPTIONS: { value: RoleCategory | "all"; label: string }[] = [
  { value: "all",       label: "All roles" },
  { value: "business",  label: "Business" },
  { value: "craft",     label: "Craft & Specialist" },
  { value: "frontline", label: "Frontline" },
];

// ── Role card ─────────────────────────────────────────────────────────────────
const RoleCard = ({ role }: { role: typeof roles[0] }) => (
  <Link
    to={`/roles/${role.slug}`}
    className="group block border-2 border-foreground p-5 md:p-7 hover:border-primary transition-colors h-full"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden">
        <img
          src={ROLE_ICONS[role.slug]}
          alt={role.title}
          className="w-12 h-12 object-contain contrast-125 brightness-0"
          loading="lazy"
          width={48}
          height={48}
        />
      </div>
      <h3 className="font-display text-lg md:text-xl font-700 text-foreground group-hover:text-primary transition-colors leading-tight">
        {role.title}
      </h3>
    </div>

    <p className="text-muted-foreground text-sm font-body leading-relaxed mb-3 line-clamp-2">
      {role.description}
    </p>

    {/* Industry chips — icons on desktop, text on mobile */}
    <div className="hidden md:flex flex-wrap gap-2 mb-3">
      {role.industries.slice(0, 6).map((ind) => {
        const icon = INDUSTRY_ICONS[ind];
        const slug = industryToSlug[ind];
        return icon ? (
          <TooltipProvider key={ind} delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={slug || "#"}
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-full overflow-hidden border border-border hover:border-primary transition-colors shrink-0"
                >
                  <img src={icon} alt={ind} className="w-full h-full object-cover" loading="lazy" width={28} height={28} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{ind}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span key={ind} className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground">{ind}</span>
        );
      })}
      {role.industries.length > 6 && (
        <span className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground self-center">
          +{role.industries.length - 6} more
        </span>
      )}
    </div>

    {/* Mobile: show first 3 industries as text chips */}
    <div className="flex md:hidden flex-wrap gap-1.5 mb-3">
      {role.industries.slice(0, 3).map((ind) => (
        <span key={ind} className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground rounded-sm">
          {ind}
        </span>
      ))}
      {role.industries.length > 3 && (
        <span className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground rounded-sm self-center">
          +{role.industries.length - 3}
        </span>
      )}
    </div>

    <span className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary">
      Explore role <ArrowRight className="w-3 h-3" />
    </span>
  </Link>
);

// ── Mobile filter drawer ──────────────────────────────────────────────────────
interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  category: RoleCategory | "all";
  setCategory: (c: RoleCategory | "all") => void;
  industry: string;
  setIndustry: (i: string) => void;
  resultCount: number;
}

const FilterDrawer = ({ open, onClose, category, setCategory, industry, setIndustry, resultCount }: FilterDrawerProps) => {
  const activeCount = (category !== "all" ? 1 : 0) + (industry !== "all" ? 1 : 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed left-0 right-0 bottom-0 z-50 bg-background border-t-2 border-foreground rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h2 className="font-display font-700 text-base">Filter Roles</h2>
                {activeCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-display font-700 bg-primary text-primary-foreground rounded-full">
                    {activeCount}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable filters */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* Category */}
              <div>
                <h3 className="font-display font-600 text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
                  Role type
                </h3>
                <div className="space-y-1">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const active = category === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setCategory(opt.value)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg border-2 transition-colors ${active ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"}`}
                      >
                        <span className="font-display font-600 text-sm">{opt.label}</span>
                        {active && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Industry */}
              <div>
                <h3 className="font-display font-600 text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
                  Industry
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIndustry("all")}
                    className={`px-3 py-1.5 font-body text-xs rounded-full border-2 transition-colors ${industry === "all" ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:border-foreground"}`}
                  >
                    All industries
                  </button>
                  {ALL_INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setIndustry(industry === ind ? "all" : ind)}
                      className={`px-3 py-1.5 font-body text-xs rounded-full border-2 transition-colors ${industry === ind ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:border-foreground"}`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-3 flex items-center gap-3 bg-background">
              <button
                onClick={() => { setCategory("all"); setIndustry("all"); }}
                disabled={activeCount === 0}
                className="font-display font-600 text-xs uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
              >
                Clear all
              </button>
              <Button onClick={onClose} className="flex-1 font-body">
                Show {resultCount} {resultCount === 1 ? "role" : "roles"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const Roles = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<RoleCategory | "all">("all");
  const [industry, setIndustry] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeFilterCount = (category !== "all" ? 1 : 0) + (industry !== "all" ? 1 : 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return roles.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (industry !== "all" && !r.industries.includes(industry)) return false;
      if (q && !r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q) && !r.keywords?.some((k) => k.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [search, category, industry]);

  // Group filtered results by category for display
  const businessFiltered  = filtered.filter((r) => r.category === "business");
  const craftFiltered     = filtered.filter((r) => r.category === "craft");
  const frontlineFiltered = filtered.filter((r) => r.category === "frontline");

  const showAsFlat = category !== "all" || industry !== "all" || search.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Explore Roles - Jobs & Career Guides"
        description="Browse detailed role guides across 30+ industries - from marketing and finance to barista and estate agent. Discover salaries, skills and live UK jobs."
        path="/roles"
      />

      <div className="container mx-auto px-4 md:px-12 py-10 md:py-20">

        {/* Header */}
        <div className="mb-8 md:mb-12">
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-3">Explore by role</p>
          <h1 className="font-display text-5xl md:text-7xl font-900 leading-[0.9] tracking-tight mb-4">
            Roles<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-xl">
            Don't know what industry you want? Start with what you'd actually do.
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex gap-3 mb-6 sticky top-0 bg-background/95 backdrop-blur-sm py-3 z-10 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:backdrop-blur-none md:py-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Search roles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border-2 border-border focus:border-primary bg-background font-body text-sm outline-none rounded-none transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Mobile: filter button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`md:hidden flex items-center gap-2 px-4 py-2.5 border-2 font-display font-600 text-sm transition-colors ${activeFilterCount > 0 ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-foreground"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-700 bg-primary-foreground text-primary rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop: inline category pills */}
          <div className="hidden md:flex items-center gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className={`px-3 py-2.5 font-display font-600 text-xs uppercase tracking-wide border-2 transition-colors ${category === opt.value ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:border-foreground"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: industry filter pills */}
        <div className="hidden md:flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setIndustry("all")}
            className={`px-3 py-1 font-body text-xs rounded-full border transition-colors ${industry === "all" ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
          >
            All industries
          </button>
          {ALL_INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(industry === ind ? "all" : ind)}
              className={`px-3 py-1 font-body text-xs rounded-full border transition-colors ${industry === ind ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Results count when filtering */}
        {(activeFilterCount > 0 || search) && (
          <div className="flex items-center justify-between mb-6">
            <p className="font-body text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "role" : "roles"} found
            </p>
            {(activeFilterCount > 0) && (
              <button
                onClick={() => { setCategory("all"); setIndustry("all"); }}
                className="font-display font-600 text-xs uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Role grid — flat when filtering/searching, grouped otherwise */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl font-700 mb-2">No roles found</p>
            <p className="font-body text-muted-foreground text-sm">Try a different search or clear your filters</p>
          </div>
        ) : showAsFlat ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((role) => <RoleCard key={role.slug} role={role} />)}
          </div>
        ) : (
          <>
            {/* Business Roles */}
            {businessFiltered.length > 0 && (
              <div className="mb-14">
                <div className="mb-6">
                  <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">Business Roles</p>
                  <h2 className="font-display text-2xl md:text-4xl font-800 leading-none mb-1">Roles that move across industries</h2>
                  <p className="text-muted-foreground font-body text-sm max-w-lg">Marketing, finance, operations — these functions exist in every sector.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {businessFiltered.map((role) => <RoleCard key={role.slug} role={role} />)}
                </div>
              </div>
            )}

            {/* Craft & Industry Roles */}
            {craftFiltered.length > 0 && (
              <div className="mb-14">
                <div className="mb-6">
                  <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">Craft & Specialist</p>
                  <h2 className="font-display text-2xl md:text-4xl font-800 leading-none mb-1">Roles tied to specific industries</h2>
                  <p className="text-muted-foreground font-body text-sm max-w-lg">The hands-on, specialist roles that define what each industry actually does.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {craftFiltered.map((role) => <RoleCard key={role.slug} role={role} />)}
                </div>
              </div>
            )}

            {/* Frontline Roles */}
            {frontlineFiltered.length > 0 && (
              <div className="mb-14">
                <div className="mb-6">
                  <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">Frontline</p>
                  <h2 className="font-display text-2xl md:text-4xl font-800 leading-none mb-1">Customer-facing roles</h2>
                  <p className="text-muted-foreground font-body text-sm max-w-lg">Roles where people are the product — service, care, and direct interaction.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {frontlineFiltered.map((role) => <RoleCard key={role.slug} role={role} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={category}
        setCategory={setCategory}
        industry={industry}
        setIndustry={setIndustry}
        resultCount={filtered.length}
      />
    </div>
  );
};

export default Roles;
