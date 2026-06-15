import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, ChevronDown, Search, AlertCircle, BookOpen, ArrowRight, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleSkills, type RoleSkill } from "@/hooks/useRoleSkills";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { CAREER_MAP_ROLES } from "@/data/career-map-roles";

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

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Build the full 310-role list from career-map-roles.ts
const ALL_ROLES: { slug: string; title: string }[] = CAREER_MAP_ROLES.map((title) => ({
  slug: slugify(title),
  title,
}));

// ── Role selector ─────────────────────────────────────────────────────────────
function RoleSelector({ selected, onChange }: { selected: string; onChange: (slug: string, title: string) => void }) {
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

  const selectedTitle = ALL_ROLES.find((r) => r.slug === selected)?.title ?? "Choose a role…";

  return (
    <div ref={ref} className="relative w-full sm:w-80">
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

// ── Rating row ────────────────────────────────────────────────────────────────
function RatingRow({ skill, rating, onRate }: { skill: RoleSkill; rating: number | null; onRate: (id: string, n: number) => void }) {
  const typeClass = TYPE_COLOURS[skill.skill_type ?? "skill"] ?? TYPE_COLOURS.skill;
  const isGap = rating !== null && rating <= 2;
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-border/40 last:border-0 ${isGap ? "bg-red-50/30" : ""}`}>
      <span className={`px-2 py-0.5 text-[10px] font-display font-600 border rounded-full ${typeClass} shrink-0 self-start sm:self-center w-fit`}>
        {skill.skill_type ?? "skill"}
      </span>
      <span className="font-body text-sm flex-1 leading-snug">
        {skill.skill_title}
        {isGap && <span className="ml-2 text-[10px] font-display font-700 text-red-600 uppercase tracking-wide">gap</span>}
      </span>
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

// ── Gap summary card ──────────────────────────────────────────────────────────
function GapSummary({ skills, ratings, roleSlug }: { skills: RoleSkill[]; ratings: Map<string, number>; roleSlug: string }) {
  const gaps = skills.filter((s) => {
    const r = ratings.get(s.id);
    return r !== undefined && r <= 2;
  });
  const strengths = skills.filter((s) => {
    const r = ratings.get(s.id);
    return r !== undefined && r >= 4;
  });

  if (gaps.length === 0 && strengths.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      {gaps.length > 0 && (
        <div className="border-2 border-red-200 bg-red-50/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <h3 className="font-display font-800 text-sm uppercase tracking-wide text-red-700">
              {gaps.length} skill gap{gaps.length !== 1 ? "s" : ""} to develop
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {gaps.map((s) => (
              <span key={s.id} className="px-2.5 py-1 text-[11px] font-display font-600 bg-red-100 text-red-800 border border-red-200 rounded-full">
                {s.skill_title}
              </span>
            ))}
          </div>
          <Link
            to={`/skills-passport?tab=passport&role=${roleSlug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-display font-700 text-xs bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            Find courses to close these gaps
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {strengths.length > 0 && (
        <div className="border-2 border-green-200 bg-green-50/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <h3 className="font-display font-800 text-sm uppercase tracking-wide text-green-700">
              {strengths.length} strength{strengths.length !== 1 ? "s" : ""}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {strengths.map((s) => (
              <span key={s.id} className="px-2.5 py-1 text-[11px] font-display font-600 bg-green-100 text-green-800 border border-green-200 rounded-full">
                {s.skill_title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SkillsAssessmentTab() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState(searchParams.get("role") ?? "");
  const { skills, domains, loading, hasData } = useRoleSkills(selectedRole);

  const [ratings, setRatings] = useState<Map<string, number>>(new Map());
  const [dirty, setDirty] = useState<Set<string>>(new Set()); // unsaved skill IDs
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Load existing ratings when role/user changes
  useEffect(() => {
    if (!user || !selectedRole || skills.length === 0) return;
    supabase
      .from("user_skill_ratings")
      .select("skill_id,rating")
      .eq("user_id", user.id)
      .in("skill_id", skills.map((s) => s.id))
      .then(({ data }) => {
        const map = new Map<string, number>();
        for (const r of (data ?? []) as { skill_id: string; rating: number }[]) {
          map.set(r.skill_id, r.rating);
        }
        setRatings(map);
        setDirty(new Set());
        setSavedAt(null);
      });
  }, [user, selectedRole, skills]);

  const handleRate = (skillId: string, rating: number) => {
    if (!user) return;
    setRatings((prev) => new Map(prev).set(skillId, rating));
    setDirty((prev) => new Set(prev).add(skillId));
    setSavedAt(null);
  };

  const handleSave = async () => {
    if (!user || dirty.size === 0) return;
    setSaving(true);
    const rows = [...dirty].map((skillId) => ({
      user_id: user.id,
      skill_id: skillId,
      rating: ratings.get(skillId)!,
      evidenced: false,
      source: "self",
      updated_at: new Date().toISOString(),
    }));
    await supabase.from("user_skill_ratings").upsert(rows, { onConflict: "user_id,skill_id" });
    setDirty(new Set());
    setSavedAt(new Date());
    setSaving(false);
  };

  const handleRoleChange = (slug: string) => {
    setSelectedRole(slug);
    setRatings(new Map());
    setDirty(new Set());
    setSavedAt(null);
    setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set("role", slug); return n; });
  };

  const ratedCount = [...ratings.values()].filter(Boolean).length;
  const totalCount = skills.length;
  const readiness = totalCount > 0
    ? Math.round([...ratings.values()].reduce((a, b) => a + b, 0) / (totalCount * 5) * 100)
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
        <p className="font-body text-sm text-muted-foreground">
          Pick a role, rate each skill 1–5. We'll show your gaps and suggest learning to close them.
        </p>
      </div>

      {/* Role selector */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <span className="font-display font-700 text-sm shrink-0">Role:</span>
        <RoleSelector selected={selectedRole} onChange={handleRoleChange} />
      </div>

      {/* Progress + save bar */}
      {selectedRole && !loading && hasData && (
        <div className="border-2 border-foreground/10 rounded-2xl p-4 mb-6 flex items-center gap-4 bg-muted/20 flex-wrap">
          <div className="flex-1 min-w-40">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-700 text-sm">
                {ratedCount} / {totalCount} rated
              </span>
              {ratedCount > 0 && (
                <span className={`font-display font-900 text-lg ${readiness >= 70 ? "text-green-600" : readiness >= 40 ? "text-amber-600" : "text-red-500"}`}>
                  {readiness}% ready
                </span>
              )}
            </div>
            <Progress value={totalCount > 0 ? (ratedCount / totalCount) * 100 : 0} className="h-1.5" />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={dirty.size === 0 || saving}
            className={`inline-flex items-center gap-1.5 px-4 py-2 font-display font-700 text-xs rounded-full transition-all shrink-0 ${
              dirty.size > 0
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : savedAt
                ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                : "bg-foreground/5 text-muted-foreground cursor-default"
            }`}
          >
            {saving ? (
              "Saving…"
            ) : savedAt ? (
              <><CheckCircle2 className="w-3 h-3" /> Saved</>
            ) : dirty.size > 0 ? (
              <><Save className="w-3 h-3" /> Save {dirty.size} rating{dirty.size !== 1 ? "s" : ""}</>
            ) : (
              <><CheckCircle2 className="w-3 h-3" /> Up to date</>
            )}
          </button>
        </div>
      )}

      {/* States */}
      {selectedRole && loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />)}
        </div>
      )}

      {selectedRole && !loading && !hasData && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <p className="font-body text-sm text-muted-foreground">No skills data yet for this role.</p>
          <p className="font-body text-xs text-muted-foreground/60 mt-1">Skills data is syncing — check back soon.</p>
        </div>
      )}

      {!selectedRole && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <p className="font-body text-sm text-muted-foreground">Select a role above to start your assessment.</p>
        </div>
      )}

      {/* Skills list */}
      {selectedRole && !loading && hasData && (
        <>
          <div className="space-y-6">
            {domains.map((d) => (
              <div key={d.domain}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display font-800 text-sm uppercase tracking-wide">{d.domain}</h3>
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-body text-[11px] text-muted-foreground">{d.count} skills</span>
                </div>
                {d.areas.map((area) => (
                  <div key={area.area} className="mb-4">
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

          {/* Save button at bottom too */}
          {dirty.size > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 font-display font-700 text-sm bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : `Save assessment (${dirty.size} change${dirty.size !== 1 ? "s" : ""})`}
              </button>
            </div>
          )}

          {/* Gap summary — shown after any ratings made */}
          {ratedCount > 0 && (
            <GapSummary skills={skills} ratings={ratings} roleSlug={selectedRole} />
          )}

          {/* Passport CTA */}
          {ratedCount > 0 && (
            <div className="mt-6 p-5 border-2 border-foreground/10 rounded-2xl bg-muted/20 flex items-start gap-4">
              <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-display font-800 text-sm mb-0.5">Build your learning pathway</p>
                <p className="font-body text-xs text-muted-foreground mb-3">
                  See courses, HDYD badges and resources matched to your skill gaps.
                </p>
                <Link
                  to={`/skills-passport?tab=passport&role=${selectedRole}`}
                  className="inline-flex items-center gap-1.5 font-display font-700 text-xs text-primary hover:opacity-80 transition-opacity"
                >
                  Go to your Skills Passport <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
