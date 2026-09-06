// Searchable role picker - shared by SkillsAssessmentTab and CoachPlanPanel's
// "set a target role" empty state.

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { roles } from "@/data/roles";

// Sourced directly from roles.ts (not career-map-roles.ts's freeform CareerMap
// titles) - every slug here is guaranteed to have real role_skills data,
// since that's the same list sync-skills-england generates skills for.
const ALL_ROLES: { slug: string; title: string }[] = roles.map((r) => ({
  slug: r.slug,
  title: r.title,
}));

export default function RoleSelector({
  selected,
  onChange,
  placeholder = "Choose a role…",
  className = "w-full sm:w-80",
}: {
  selected: string;
  onChange: (slug: string, title: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() =>
    query.trim()
      ? ALL_ROLES.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
      : ALL_ROLES,
    [query]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedTitle = ALL_ROLES.find((r) => r.slug === selected)?.title ?? placeholder;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-3 w-full px-4 py-2.5 border-2 border-foreground/20 bg-background rounded-xl font-display font-700 text-sm hover:border-primary transition-colors"
      >
        <span className="truncate">{selectedTitle}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-background border-2 border-foreground/20 rounded-xl shadow-xl z-50">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles…"
                className="w-full text-sm font-body bg-transparent outline-none py-1"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted-foreground font-body">No roles found</p>
            )}
            {filtered.map((r) => (
              <button
                key={r.slug}
                onClick={() => { onChange(r.slug, r.title); setOpen(false); setQuery(""); }}
                className={`w-full text-left px-4 py-2.5 font-display font-600 text-sm hover:bg-muted/50 transition-colors ${selected === r.slug ? "text-primary bg-primary/5" : ""}`}
              >
                {r.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
