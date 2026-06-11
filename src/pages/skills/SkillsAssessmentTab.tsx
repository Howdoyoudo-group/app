// Skills Assessment tab — lets authenticated users rate their skills per role.
// Accessible at /skills-passport?tab=assessment
// Pre-selects a role if ?role=slug is in the URL.

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleSkills, type RoleSkill } from "@/hooks/useRoleSkills";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

const TYPE_COLOURS: Record<string, string> = {
  knowledge: "bg-blue-50 text-blue-800 border-blue-200",
  skill:     "bg-green-50 text-green-800 border-green-200",
  behaviour: "bg-amber-50 text-amber-800 border-amber-200",
};

const RATING_LABELS = [
  "Haven't done this yet",
  "Tried it a few times",
  "Can do independently",
  "Do it well consistently",
  "Could teach someone else",
];

interface SavedRating { skill_id: string; rating: number; evidenced: boolean; }

// ── Role selector ─────────────────────────────────────────────────────────────
function RoleSelector({ selected, onChange }: { selected: string; onChange: (slug: string) => void }) {
  const [roles, setRoles] = useState<{ slug: string; title: string }[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch distinct role slugs that have skills data, limited to 200
    supabase
      .from("role_skills")
      .select("slug")
      .limit(200)
      .then(({ data }) => {
        if (!data) return;
        const unique = [...new Set((data as any[]).map((r) => r.slug))].sort();
        setRoles(unique.map((slug) => ({
          slug,
          title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        })));
      });
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = selected
    ? selected.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Choose a role";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-3 w-full sm:w-64 px-4 py-2.5 border-2 border-foreground/20 bg-background rounded-xl font-display font-700 text-sm hover:border-primary transition-colors"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-background border-2 border-foreground/20 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {roles.map((r) => (
            <button
              key={r.slug}
              onClick={() => { onChange(r.slug); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 font-display font-600 text-sm hover:bg-muted/50 transition-colors ${selected === r.slug ? "text-primary bg-primary/5" : ""}`}
            >
              {r.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Rating row ────────────────────────────────────────────────────────────────
function RatingRow({ skill, rating, onRate }: { skill: RoleSkill; rating: number | null; onRate: (id: string, n: number) => void }) {
  const typeClass = TYPE_COLOURS[skill.skill_type ?? "skill"] ?? TYPE_COLOURS.skill;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-border/40 last:border-0">
      <span className={`px-2 py-0.5 text-[10px] font-display font-600 border rounded-full ${typeClass} shrink-0 self-start sm:self-center w-fit`}>
        {skill.skill_type ?? "skill"}
      </span>
      <span className="font-body text-sm flex-1 leading-snug">{skill.skill_title}</span>
      <div className="flex items-center gap-1 shrink-0">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onRate(skill.id, n)}
            title={RATING_LABELS[n - 1]}
            className={`w-7 h-7 rounded-full border text-xs font-display font-700 transition-colors ${
              rating === n
                ? "bg-primary text-primary-foreground border-primary"
                : rating && n <= rating
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SkillsAssessmentTab() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState(searchParams.get("role") ?? "");
  const { skills, domains, loading, hasData } = useRoleSkills(selectedRole);

  // Ratings state
  const [ratings, setRatings] = useState<Map<string, number>>(new Map());
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  // Load saved ratings when role or user changes
  useEffect(() => {
    if (!user || !selectedRole || skills.length === 0) return;
    const skillIds = skills.map((s) => s.id);
    supabase
      .from("user_skill_ratings")
      .select("skill_id,rating")
      .eq("user_id", user.id)
      .in("skill_id", skillIds)
      .then(({ data }) => {
        const map = new Map<string, number>();
        for (const r of (data ?? []) as SavedRating[]) map.set(r.skill_id, r.rating);
        setRatings(map);
        setLoadedUserId(user.id);
      });
  }, [user, selectedRole, skills]);

  const handleRate = async (skillId: string, rating: number) => {
    if (!user) return;
    setRatings((prev) => new Map(prev).set(skillId, rating));
    supabase.from("user_skill_ratings").upsert(
      { user_id: user.id, skill_id: skillId, rating, evidenced: false, source: "self", updated_at: new Date().toISOString() },
      { onConflict: "user_id,skill_id" },
    );
  };

  const handleRoleChange = (slug: string) => {
    setSelectedRole(slug);
    setRatings(new Map());
    setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set("role", slug); return n; });
  };

  const ratedCount = [...ratings.values()].filter(Boolean).length;
  const totalCount = skills.length;
  const readiness = totalCount > 0
    ? Math.round(([...ratings.values()].reduce((a, b) => a + b, 0)) / (totalCount * 5) * 100)
    : 0;

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="font-display font-700 text-lg mb-2">Sign in to assess your skills</p>
        <p className="font-body text-sm text-muted-foreground">Your ratings are saved to your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-1">Skills Assessment</h2>
        <p className="font-body text-sm text-muted-foreground">Rate your confidence for each skill. 1 = just starting, 5 = could teach it.</p>
      </div>

      {/* Role selector */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <span className="font-display font-700 text-sm shrink-0">Role:</span>
        <RoleSelector selected={selectedRole} onChange={handleRoleChange} />
      </div>

      {/* Progress summary */}
      {selectedRole && !loading && hasData && (
        <div className="border-2 border-foreground/10 rounded-2xl p-4 mb-6 flex items-center gap-4 bg-muted/20">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-700 text-sm">
                {ratedCount} / {totalCount} skills rated
              </span>
              {ratedCount > 0 && (
                <span className={`font-display font-900 text-lg ${readiness >= 70 ? "text-green-600" : readiness >= 40 ? "text-amber-600" : "text-red-500"}`}>
                  {readiness}% ready
                </span>
              )}
            </div>
            <Progress value={totalCount > 0 ? (ratedCount / totalCount) * 100 : 0} className="h-1.5" />
          </div>
          {ratedCount === totalCount && totalCount > 0 && (
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
          )}
        </div>
      )}

      {/* Skills by domain */}
      {selectedRole && loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {selectedRole && !loading && !hasData && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <p className="font-body text-sm text-muted-foreground">No skills data yet for this role.</p>
          <p className="font-body text-xs text-muted-foreground/60 mt-1">Skills England data is syncing — check back soon.</p>
        </div>
      )}

      {!selectedRole && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <p className="font-body text-sm text-muted-foreground">Select a role above to start rating your skills.</p>
        </div>
      )}

      {selectedRole && !loading && hasData && (
        <div className="space-y-6">
          {domains.map((d) => (
            <div key={d.domain}>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display font-800 text-sm uppercase tracking-wide">{d.domain}</h3>
                <div className="flex-1 h-px bg-border" />
                <span className="font-body text-[11px] text-muted-foreground">{d.count} skills</span>
              </div>
              {d.areas.map((area) => (
                <div key={area.area} className="mb-4 pl-0">
                  {d.areas.length > 1 && (
                    <p className="font-display font-600 text-[10px] uppercase tracking-wider text-muted-foreground mb-2 pl-1">{area.area}</p>
                  )}
                  <div className="bg-card border border-border/60 rounded-xl px-4 py-1">
                    {area.skills.map((s) => (
                      <RatingRow
                        key={s.id}
                        skill={s}
                        rating={ratings.get(s.id) ?? null}
                        onRate={handleRate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
