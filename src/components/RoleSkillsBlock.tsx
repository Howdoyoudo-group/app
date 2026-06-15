// RoleSkillsBlock — shows structured skills for a role, powered by Skills England data.
// Displayed in the Plan tab of every role page, below the NCS panel.
// Includes a self-assessment readiness card for authenticated users.

import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Star, ArrowRight, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleSkills, type RoleSkill } from "@/hooks/useRoleSkills";
import { useSkillGap } from "@/hooks/useSkillGap";
import { supabase } from "@/integrations/supabase/client";

// ── Chip colours by skill type ────────────────────────────────────────────────
const TYPE_COLOURS: Record<string, string> = {
  knowledge: "bg-blue-50 text-blue-800 border-blue-200",
  skill:     "bg-green-50 text-green-800 border-green-200",
  behaviour: "bg-amber-50 text-amber-800 border-amber-200",
};
const TYPE_LABEL: Record<string, string> = {
  knowledge: "Knowledge",
  skill:     "Skill",
  behaviour: "Behaviour",
};

// ── Skills England logo (inline SVG text mark) ────────────────────────────────
function SEAttribution() {
  return (
    <span className="inline-flex items-center gap-1.5 font-body text-[10px] text-muted-foreground/70">
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="32" height="32" rx="4" fill="#003078"/>
        <text x="4" y="22" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">SE</text>
      </svg>
      Skills England data
    </span>
  );
}

// ── Domain bar row ────────────────────────────────────────────────────────────
function DomainBar({ domain, count, total, readiness, onClick, expanded }: {
  domain: string;
  count: number;
  total: number;
  readiness?: number;
  onClick: () => void;
  expanded: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 py-1.5 group"
    >
      <span className="font-display font-600 text-xs w-40 shrink-0 truncate group-hover:text-primary transition-colors">
        {domain}
      </span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1">
          {readiness !== undefined ? (
            <Progress
              value={readiness}
              className="h-1.5"
            />
          ) : (
            <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/50 rounded-full transition-all"
                style={{ width: `${Math.round((count / total) * 100)}%` }}
              />
            </div>
          )}
        </div>
        <span className="font-body text-[11px] text-muted-foreground shrink-0 w-16 text-right">
          {readiness !== undefined ? `${readiness}%` : `${count} skill${count !== 1 ? "s" : ""}`}
        </span>
      </div>
      {expanded
        ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
    </button>
  );
}

// ── Skill chip ────────────────────────────────────────────────────────────────
function SkillChip({ skill, rating, onRate }: {
  skill: RoleSkill;
  rating?: number | null;
  onRate?: (skillId: string, rating: number) => void;
}) {
  const typeClass = TYPE_COLOURS[skill.skill_type ?? "skill"] ?? TYPE_COLOURS.skill;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-display font-600 border rounded-full ${typeClass} leading-none`}
    >
      {rating !== null && rating !== undefined && (
        <Star className="w-2.5 h-2.5 fill-current shrink-0" />
      )}
      {skill.skill_title}
    </span>
  );
}

// ── Inline rating component ───────────────────────────────────────────────────
const RATING_LABELS = [
  "Haven't done this yet",
  "Tried it a few times",
  "Can do independently",
  "Do it well consistently",
  "Could teach someone else",
];

function SkillRatingRow({ skill, currentRating, onRate }: {
  skill: RoleSkill;
  currentRating: number | null;
  onRate: (skillId: string, rating: number) => void;
}) {
  const typeClass = TYPE_COLOURS[skill.skill_type ?? "skill"] ?? TYPE_COLOURS.skill;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b border-border/50 last:border-0">
      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-display font-600 border rounded-full ${typeClass} shrink-0 self-start`}>
        {TYPE_LABEL[skill.skill_type ?? "skill"]}
      </span>
      <span className="font-body text-sm flex-1">{skill.skill_title}</span>
      <div className="flex items-center gap-1 shrink-0">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onRate(skill.id, n)}
            title={RATING_LABELS[n - 1]}
            className={`w-6 h-6 rounded-full border text-[10px] font-display font-700 transition-colors ${
              currentRating === n
                ? "bg-primary text-primary-foreground border-primary"
                : currentRating && n <= currentRating
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

export default function RoleSkillsBlock({ slug }: { slug: string }) {
  const { user } = useAuth();
  const { skills, domains, loading, hasData } = useRoleSkills(slug);
  const gap = useSkillGap(slug, user?.id);

  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<"all" | "knowledge" | "skill" | "behaviour">("all");
  const [ratingMode, setRatingMode] = useState(false);
  const [localRatings, setLocalRatings] = useState<Map<string, number>>(new Map());
  const [saving, setSaving] = useState(false);

  // Pre-populate local ratings from gap data
  const getRating = (skillId: string): number | null => {
    if (localRatings.has(skillId)) return localRatings.get(skillId)!;
    const fromGap = gap.allSkills.find((s) => s.id === skillId);
    return fromGap?.rating ?? null;
  };

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      next.has(domain) ? next.delete(domain) : next.add(domain);
      return next;
    });
  };

  const handleRate = async (skillId: string, rating: number) => {
    if (!user) return;
    setLocalRatings((prev) => new Map(prev).set(skillId, rating));
    // Debounced save — fire and forget
    supabase.from("user_skill_ratings").upsert(
      { user_id: user.id, skill_id: skillId, rating, evidenced: false, source: "self", updated_at: new Date().toISOString() },
      { onConflict: "user_id,skill_id" },
    );
  };

  if (loading) return null;

  if (!hasData) {
    return (
      <div className="border-t border-border/60 mt-0 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div>
            <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
              Skills England
            </p>
            <h3 className="font-display font-800 text-base">Skills for this role</h3>
          </div>
          <SEAttribution />
        </div>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Structured skill data for this role is coming soon — powered by Skills England.
        </p>
        <Link
          to="/skills-passport?tab=assessment"
          className="inline-flex items-center gap-1.5 px-4 py-2 font-display font-700 text-xs bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
        >
          <Star className="w-3 h-3" />
          Rate your skills
        </Link>
      </div>
    );
  }

  const filteredSkills = activeFilter === "all" ? skills : skills.filter((s) => s.skill_type === activeFilter);
  const totalDomainSkills = skills.length;

  return (
    <div className="border-t border-border/60 mt-0 pt-6 pb-2">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
            Skills England
          </p>
          <h3 className="font-display font-800 text-base">Skills for this role</h3>
        </div>
        <SEAttribution />
      </div>

      {/* Domain bars — readiness if logged in, else skill count */}
      <div className="mb-4 space-y-0.5">
        {domains.slice(0, 6).map((d) => {
          const gapDomain = gap.domains.find((gd) => gd.domain === d.domain);
          return (
            <div key={d.domain}>
              <DomainBar
                domain={d.domain}
                count={d.count}
                total={totalDomainSkills}
                readiness={user && !gap.loading ? gapDomain?.readiness : undefined}
                onClick={() => toggleDomain(d.domain)}
                expanded={expandedDomains.has(d.domain)}
              />
              {expandedDomains.has(d.domain) && (
                <div className="pl-4 pb-3 pt-1">
                  {d.areas.map((area) => (
                    <div key={area.area} className="mb-3">
                      <p className="font-display font-600 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                        {area.area}
                      </p>
                      {ratingMode && user ? (
                        <div className="space-y-0">
                          {area.skills.map((s) => (
                            <SkillRatingRow
                              key={s.id}
                              skill={s}
                              currentRating={getRating(s.id)}
                              onRate={handleRate}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {area.skills.map((s) => (
                            <SkillChip key={s.id} skill={s} rating={getRating(s.id)} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(["all", "knowledge", "skill", "behaviour"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 font-display font-600 text-[10px] uppercase tracking-wide rounded-full border transition-colors ${
              activeFilter === f
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            {f === "all" ? `All (${skills.length})` : `${TYPE_LABEL[f]}s`}
          </button>
        ))}
      </div>

      {/* All skills as chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {filteredSkills.slice(0, 24).map((s) => (
          <SkillChip key={s.id} skill={s} rating={getRating(s.id)} />
        ))}
        {filteredSkills.length > 24 && (
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-body text-muted-foreground">
            +{filteredSkills.length - 24} more
          </span>
        )}
      </div>

      {/* Auth-gated readiness card */}
      {user ? (
        <div className="border border-border rounded-xl p-4 bg-muted/30">
          <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
            <div>
              <p className="font-display font-700 text-sm">Your readiness</p>
              {gap.ratedCount > 0 ? (
                <p className="font-body text-[11px] text-muted-foreground">
                  {gap.ratedCount} of {gap.totalCount} skills rated
                </p>
              ) : (
                <p className="font-body text-[11px] text-muted-foreground">Rate your skills to see your score</p>
              )}
            </div>
            {gap.ratedCount > 0 && (
              <span className={`font-display font-900 text-2xl ${gap.overallReadiness >= 70 ? "text-green-600" : gap.overallReadiness >= 40 ? "text-amber-600" : "text-red-500"}`}>
                {gap.overallReadiness}%
              </span>
            )}
          </div>

          {gap.ratedCount > 0 && (
            <Progress value={gap.overallReadiness} className="h-2 mb-3" />
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setRatingMode((v) => !v);
                // Expand all domains when entering rating mode
                if (!ratingMode) setExpandedDomains(new Set(domains.map((d) => d.domain)));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-display font-700 text-xs bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              <Star className="w-3 h-3" />
              {ratingMode ? "Done rating" : gap.ratedCount > 0 ? "Update ratings" : "Rate your skills"}
            </button>

            {gap.ratedCount > 0 && (
              <Link
                to={`/skills-passport?tab=gaps&role=${slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-display font-700 text-xs border border-border bg-background rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                View skill gaps <ArrowRight className="w-3 h-3" />
              </Link>
            )}

            <Link
              to={`/skills-passport?tab=gaps&role=${slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-display font-700 text-xs border border-border bg-background rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              Skill gaps
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-xl p-4 text-center">
          <p className="font-display font-700 text-sm mb-1">Track your skills for this role</p>
          <p className="font-body text-xs text-muted-foreground mb-3">
            Sign in to rate your skills, see your readiness score, and get a personalised learning pathway.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 px-4 py-2 font-display font-700 text-xs bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            Sign in free <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
