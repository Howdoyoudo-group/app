// Career Passport tab — curated learning pathway based on skill gaps.
// Shows HDYD badge modules first (free), then external courses.
// Accessible at /skills-passport?tab=passport

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, ExternalLink, Trophy, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSkillGap, type SkillWithGap } from "@/hooks/useSkillGap";
import { coursesByIndustry, type Course } from "@/data/courses";
import { supabase } from "@/integrations/supabase/client";

// ── Course matching ──────────────────────────────────────────────────────────

function tokenise(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(" ")
      .filter((w) => w.length > 3),
  );
}

function skillCourseScore(skillTitle: string, course: Course): number {
  const skillTokens = tokenise(skillTitle);
  const courseTokens = tokenise(`${course.title} ${course.description}`);
  let matches = 0;
  for (const t of skillTokens) if (courseTokens.has(t)) matches++;
  return matches;
}

interface CourseMatch {
  course: Course;
  score: number;
  matchedSkills: string[];
  isHDYD: boolean;
}

function matchCoursesToGaps(topGaps: SkillWithGap[], _industries: string[]): CourseMatch[] {
  // Search across ALL industries — the derived industry from a role slug rarely matches coursesByIndustry keys
  const allCourses: { course: Course; industry: string }[] = [];
  for (const [ind, courses] of Object.entries(coursesByIndustry)) {
    for (const c of courses) {
      allCourses.push({ course: c, industry: ind });
    }
  }

  const scoredMap = new Map<string, CourseMatch>();
  for (const { course } of allCourses) {
    const key = course.url;
    let totalScore = 0;
    const matchedSkills: string[] = [];
    for (const gap of topGaps) {
      const s = skillCourseScore(gap.skill_title, course);
      if (s > 0) { totalScore += s; matchedSkills.push(gap.skill_title); }
    }
    if (totalScore > 0) {
      if (!scoredMap.has(key) || scoredMap.get(key)!.score < totalScore) {
        scoredMap.set(key, { course, score: totalScore, matchedSkills, isHDYD: false });
      }
    }
  }

  return [...scoredMap.values()].sort((a, b) => {
    // Free first, then by score
    if (a.course.free !== b.course.free) return a.course.free ? -1 : 1;
    return b.score - a.score;
  }).slice(0, 8);
}

// HDYD badge industries available (matches existing badge_lessons)
const HDYD_BADGE_INDUSTRIES = [
  { slug: "football", label: "Football Industry", href: "/football/badge", domain: "Catering and Hospitality" },
  // Add more as they launch
];

function badgesForDomains(domains: string[]): typeof HDYD_BADGE_INDUSTRIES {
  // Only surface a badge when its domain is relevant to this role's skill domains
  return HDYD_BADGE_INDUSTRIES.filter((b) =>
    domains.some((d) => d.toLowerCase().includes(b.domain.toLowerCase().split(" ")[0])),
  );
}

// ── Skill gap item ────────────────────────────────────────────────────────────
const TYPE_COLOURS: Record<string, string> = {
  knowledge: "bg-blue-50 text-blue-800 border-blue-200",
  skill:     "bg-green-50 text-green-800 border-green-200",
  behaviour: "bg-amber-50 text-amber-800 border-amber-200",
};

function GapWithCourses({ gap, courses }: { gap: SkillWithGap; courses: CourseMatch[] }) {
  const relevant = courses.filter((c) => c.matchedSkills.includes(gap.skill_title));
  const typeClass = TYPE_COLOURS[gap.skill_type ?? "skill"] ?? TYPE_COLOURS.skill;
  const gapSize = Math.max(0, 3 - (gap.rating ?? 0));

  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${gapSize >= 3 ? "bg-red-500" : gapSize >= 2 ? "bg-amber-500" : "bg-yellow-400"}`} />
        <div className="flex-1 min-w-0">
          <p className="font-display font-700 text-sm">{gap.skill_title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`px-2 py-0.5 text-[10px] font-display font-600 border rounded-full ${typeClass}`}>
              {gap.skill_type ?? "skill"}
            </span>
            {gap.broad_domain && (
              <span className="font-body text-[11px] text-muted-foreground">{gap.broad_domain}</span>
            )}
          </div>
        </div>
        {gap.rating !== null && (
          <div className="text-right shrink-0">
            <p className="font-display font-900 text-sm text-muted-foreground">
              {gap.rating?.toFixed(0) ?? "0"}/5
            </p>
            <p className="font-body text-[10px] text-muted-foreground">current</p>
          </div>
        )}
      </div>

      {relevant.length > 0 ? (
        <div className="space-y-2">
          {relevant.slice(0, 3).map((c, i) => (
            <a
              key={i}
              href={c.course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 border border-border/60 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-display font-700 text-xs truncate group-hover:text-primary transition-colors">
                  {c.course.title}
                </p>
                <p className="font-body text-[11px] text-muted-foreground">{c.course.provider}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.course.free && (
                  <span className="px-1.5 py-0.5 font-display font-700 text-[9px] uppercase tracking-wide bg-green-100 text-green-700 border border-green-200 rounded-full">
                    Free
                  </span>
                )}
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="font-body text-[11px] text-muted-foreground italic">
          Explore general courses in your chosen industry to build this skill.
        </p>
      )}
    </div>
  );
}

// ── Role selector (reuse same pattern) ───────────────────────────────────────
function RoleLabel({ slug }: { slug: string }) {
  return <>{slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</>;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CareerPassportTab() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState(searchParams.get("role") ?? "");
  const [ratedRoles, setRatedRoles] = useState<string[]>([]);
  const [roleIndustries, setRoleIndustries] = useState<string[]>([]);
  const gap = useSkillGap(selectedRole, user?.id);

  // Find roles the user has rated
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_skill_ratings")
      .select("skill_id")
      .eq("user_id", user.id)
      .then(async ({ data }) => {
        if (!data || data.length === 0) return;
        const skillIds = (data as any[]).map((r) => r.skill_id);
        const { data: slugRows } = await supabase
          .from("role_skills")
          .select("slug")
          .in("id", skillIds);
        const unique = [...new Set((slugRows ?? []).map((r: any) => r.slug))].sort();
        setRatedRoles(unique);
        if (!selectedRole && unique.length > 0) {
          setSelectedRole(unique[0]);
          setSearchParams((p) => { const n = new URLSearchParams(p); n.set("role", unique[0]); return n; });
        }
      });
  }, [user]);

  // Get industries for the selected role (to match courses)
  useEffect(() => {
    if (!selectedRole) return;
    // Derive industry from role slug heuristic
    const industry = selectedRole.split("-")[0];
    setRoleIndustries([industry, "hospitality", "business"]);
  }, [selectedRole]);

  const courseMatches = matchCoursesToGaps(gap.topGaps, roleIndustries);
  const availableBadges = badgesForDomains(gap.domains.map((d) => d.domain));

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="font-display font-700 text-lg mb-2">Sign in for your learning pathway</p>
        <p className="font-body text-sm text-muted-foreground">We'll match courses to your skill gaps.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-1">Skills Passport</h2>
        <p className="font-body text-sm text-muted-foreground">
          Courses and resources matched to your skill gaps. Complete them to raise your readiness score.
        </p>
      </div>

      {/* Role picker */}
      {ratedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {ratedRoles.map((slug) => (
            <button
              key={slug}
              onClick={() => {
                setSelectedRole(slug);
                setSearchParams((p) => { const n = new URLSearchParams(p); n.set("role", slug); return n; });
              }}
              className={`px-3 py-1.5 font-display font-700 text-xs rounded-full border transition-colors ${
                selectedRole === slug
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40"
              }`}
            >
              <RoleLabel slug={slug} />
            </button>
          ))}
        </div>
      )}

      {!selectedRole && ratedRoles.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-display font-700 text-base mb-2">Rate your skills first</p>
          <p className="font-body text-sm text-muted-foreground mb-4">
            Visit a role page, go to the Plan tab, and rate your skills to unlock your personalised learning pathway.
          </p>
          <Link
            to="/roles"
            className="inline-flex items-center gap-1.5 px-4 py-2 font-display font-700 text-xs bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            Browse roles <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {selectedRole && (
        <>
          {/* HDYD badge recommendations (free, always first) */}
          {availableBadges.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-primary" />
                <h3 className="font-display font-800 text-sm uppercase tracking-wide">HDYD Badges — Free</h3>
              </div>
              <div className="space-y-2">
                {availableBadges.map((b) => (
                  <Link
                    key={b.slug}
                    to={b.href}
                    className="flex items-center gap-3 p-3 border-2 border-primary/20 bg-primary/5 rounded-xl hover:border-primary/40 hover:bg-primary/10 transition-colors group"
                  >
                    <Trophy className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-700 text-sm group-hover:text-primary transition-colors">{b.label} Badge</p>
                      <p className="font-body text-[11px] text-muted-foreground">4 lessons · quiz · earns badge for your profile</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-1.5 py-0.5 font-display font-700 text-[9px] uppercase tracking-wide bg-green-100 text-green-700 border border-green-200 rounded-full">
                        Free
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Priority skill gaps with matched courses */}
          {gap.loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-muted/30 rounded-xl animate-pulse" />)}
            </div>
          ) : gap.topGaps.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl">
              <p className="font-display font-700 text-sm mb-1">No major gaps detected 🎉</p>
              <p className="font-body text-xs text-muted-foreground">
                You've rated yourself highly across most skills for this role.
                {gap.ratedCount < gap.totalCount && ` Rate the remaining ${gap.totalCount - gap.ratedCount} skills to confirm.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-display font-800 text-sm uppercase tracking-wide text-muted-foreground">
                Priority gaps for <RoleLabel slug={selectedRole} />
              </h3>
              {gap.topGaps.map((g) => (
                <GapWithCourses key={g.id} gap={g} courses={courseMatches} />
              ))}
            </div>
          )}

          {/* SE Attribution */}
          <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="4" fill="#003078"/>
              <text x="4" y="22" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">SE</text>
            </svg>
            <p className="font-body text-[10px] text-muted-foreground/60">
              Skills data provided by Skills England. <a href="https://occupational-maps.skillsengland.education.gov.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground">Skills England</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
