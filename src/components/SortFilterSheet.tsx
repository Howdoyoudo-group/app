import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export type SortOption =
  | "smart"
  | "newest"
  | "salary-high"
  | "salary-low"
  | "company-az";

export const SORT_OPTIONS: { value: SortOption; label: string; description: string }[] = [
  { value: "smart", label: "Recommended", description: "Best matches for you" },
  { value: "newest", label: "Newest first", description: "Most recently posted" },
  { value: "salary-high", label: "Salary: high to low", description: "Highest paying first" },
  { value: "salary-low", label: "Salary: low to high", description: "Lowest paying first" },
  { value: "company-az", label: "Company A–Z", description: "Alphabetical" },
];

interface FilterGroup {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
}

interface SortFilterSheetProps {
  open: boolean;
  onClose: () => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  filterGroups: FilterGroup[];
  activeFilterCount: number;
  onClearAll: () => void;
  resultCount: number;
  preserveBottomNav?: boolean;
}

const SortFilterSheet = ({
  open,
  onClose,
  sortBy,
  setSortBy,
  filterGroups,
  activeFilterCount,
  onClearAll,
  resultCount,
  preserveBottomNav = false,
}: SortFilterSheetProps) => {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 bg-foreground/40 ${preserveBottomNav ? "z-30" : "z-50"}`}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className={`fixed left-0 right-0 z-50 bg-background border-t-2 border-foreground rounded-t-2xl shadow-2xl flex flex-col sm:max-h-[85vh] sm:max-w-lg sm:mx-auto sm:rounded-2xl sm:left-4 sm:right-4 ${preserveBottomNav ? "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] max-h-[calc(90vh-4.75rem-env(safe-area-inset-bottom))] sm:bottom-4" : "bottom-0 max-h-[90vh] sm:bottom-4"}`}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-primary" />
                <h2 className="font-display font-700 text-base text-foreground">
                  Sort & Filter
                </h2>
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-display font-700 bg-primary text-primary-foreground rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* Sort */}
              <div>
                <h3 className="font-display font-600 text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                  Sort by
                </h3>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((opt) => {
                    const active = sortBy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg border-2 transition-colors text-left ${
                          active
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover:bg-muted"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-display font-600 text-sm text-foreground">
                            {opt.label}
                          </div>
                          <div className="font-body text-xs text-muted-foreground">
                            {opt.description}
                          </div>
                        </div>
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

              {/* Filters */}
              <div>
                <h3 className="font-display font-600 text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                  Filters
                </h3>
                <div className="space-y-5">
                  {filterGroups.map((group) => (
                    <div key={group.label}>
                      <div className="font-display font-600 text-xs text-foreground mb-2">
                        {group.label}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt) => {
                          const active = group.value === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => group.setValue(opt)}
                              className={`px-3 py-1.5 font-body text-xs rounded-full border-2 transition-colors ${
                                active
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border bg-card text-foreground hover:border-foreground"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="border-t border-border px-5 py-3 flex items-center gap-3 bg-background">
              <button
                onClick={onClearAll}
                disabled={activeFilterCount === 0 && sortBy === "smart"}
                className="font-display font-600 text-xs uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:hover:text-muted-foreground"
              >
                Clear all
              </button>
              <Button onClick={onClose} className="flex-1 font-body">
                Show {resultCount} {resultCount === 1 ? "job" : "jobs"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SortFilterSheet;
