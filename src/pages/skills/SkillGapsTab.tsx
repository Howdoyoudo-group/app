// Skill Gaps tab — shows gap analysis across all roles the user has rated.
// Accessible at /skills-passport?tab=gaps

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { TrendingUp, ArrowRight, AlertCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSkillGap, type SkillWithGap } from "@/hooks/useSkillGap";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

// ── Skills Pathway links (role-level learning resources) ─────────────────────
const SENIORITY_PREFIXES = /^(junior|senior|assistant|deputy|head|lead|chief|principal|graduate|trainee|apprentice|associate)\s+/i;

function coreTitle(slug: string): string {
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return title.replace(SENIORITY_PREFIXES, "");
}

function SkillsPathway({ slug }: { slug: string }) {
  const display = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const core = coreTitle(slug);
  const encodedCore = encodeURIComponent(core);

  const links = [
    { label: `${display} courses`, provider: "Reed Online Learning", href: `https://www.reed.co.uk/courses/search?keywords=${encodedCore}`, color: "#CC0000", initial: "R" },
    { label: `${display} courses`, provider: "FutureLearn", href: `https://www.futurelearn.com/search?q=${encodedCore}`, color: "#D63384", initial: "FL" },
    { label: `${display} — career info & training`, provider: "National Careers Service", href: `https://nationalcareers.service.gov.uk/explore-careers?searchTerm=${encodedCore}`, color: "#00703C", initial: "NCS" },
  ];

  return (
    <div className="pt-3 border-t border-border/40">
      <p className="font-display font-800 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Skills Pathway</p>
      <div className="space-y-1.5">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2 border border-border/60 rounded-lg hover:border-primary/50 hover:bg-background transition-colors group"
          >
            <div className="w-5 h-5 shrink-0 rounded flex items-center justify-center" style={{ backgroundColor: l.color }}>
              <span className="text-white font-display font-900 text-[7px] leading-none">{l.initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-700 text-xs truncate group-hover:text-primary transition-colors">{l.label}</p>
              <p className="font-body text-[10px] text-muted-foreground">{l.provider}</p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

const TYPE_COLOURS: Record<string, string> = {
  knowledge: "bg-blue-50 text-blue-800 border-blue-200",
  skill:     "bg-green-50 text-green-800 border-green-200",
  behaviour: "bg-amber-50 text-amber-800 border-amber-200",
};

function ReadinessBadge({ value }: { value: number }) {
  const colour = value >= 70 ? "bg-green-100 text-green-700 border-green-200"
    : value >= 40 ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-red-100 text-red-700 border-red-200";
  return (
    <span className={`px-2.5 py-1 font-display font-900 text-sm border rounded-xl ${colour}`}>
      {value}%
    </span>
  );
}

// Per-role gap card
function RoleGapCard({ slug }: { slug: string }) {
  const { user } = useAuth();
  const gap = useSkillGap(slug, user?.id);
  const [expanded, setExpanded] = useState(false);

  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (gap.loading) return <div className="h-20 bg-muted/30 rounded-2xl animate-pulse" />;
  if (gap.ratedCount === 0) return null;

  return (
    <div className="border-2 border-foreground/10 rounded-2xl overflow-hidden">
      <button
        className="w-full text-left p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-display font-800 text-sm truncate">{title}</p>
          <p className="font-body text-[11px] text-muted-foreground mt-0.5">
            {gap.ratedCount} of {gap.totalCount} skills rated
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-24">
            <Progress value={gap.overallReadiness} className="h-2" />
          </div>
          <ReadinessBadge value={gap.overallReadiness} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-4 py-4 bg-muted/10 space-y-3">
          {/* Domain breakdown */}
          {gap.domains.slice(0, 5).map((d) => (
            <div key={d.domain} className="flex items-center gap-3">
              <span className="font-display font-600 text-xs w-36 shrink-0 truncate text-muted-foreground">{d.domain}</span>
              <Progress value={d.readiness} className="flex-1 h-1.5" />
              <span className="font-body text-[11px] text-muted-foreground w-10 text-right">{d.readiness}%</span>
            </div>
          ))}

          {/* Top gaps */}
          {gap.topGaps.length > 0 && (
            <div className="pt-2">
              <p className="font-display font-700 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Priority gaps
              </p>
              <div className="flex flex-wrap gap-1.5">
                {gap.topGaps.slice(0, 5).map((s) => (
                  <span
                    key={s.id}
                    className={`px-2.5 py-1 text-[11px] font-display font-600 border rounded-full ${TYPE_COLOURS[s.skill_type ?? "skill"] ?? TYPE_COLOURS.skill}`}
                  >
                    {s.skill_title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-1">
            <Link
              to={`/skills-passport?tab=assessment&role=${slug}`}
              className="inline-flex items-center gap-1 font-display font-700 text-xs text-primary hover:underline"
            >
              Update ratings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <SkillsPathway slug={slug} />
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SkillGapsTab() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [ratedRoles, setRatedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    // Find all role slugs this user has rated at least one skill for
    supabase
      .from("user_skill_ratings")
      .select("skill_id")
      .eq("user_id", user.id)
      .then(async ({ data }) => {
        if (!data || data.length === 0) { setLoading(false); return; }
        const skillIds = (data as any[]).map((r) => r.skill_id);
        const { data: slugRows } = await supabase
          .from("role_skills")
          .select("slug")
          .in("id", skillIds);
        const unique = [...new Set((slugRows ?? []).map((r: any) => r.slug))].sort();
        setRatedRoles(unique);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="font-display font-700 text-lg mb-2">Sign in to see your skill gaps</p>
        <p className="font-body text-sm text-muted-foreground">Rate skills for any role to see where you need to develop.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3 max-w-2xl">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted/30 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (ratedRoles.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl max-w-md mx-auto">
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-display font-700 text-base mb-2">No skills rated yet</p>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Visit any role page, scroll to the Skills section in the Plan tab, and rate your skills to see your gaps here.
        </p>
        <Link
          to="/roles"
          className="inline-flex items-center gap-1.5 px-4 py-2 font-display font-700 text-xs bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
        >
          Browse roles <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-1">Skill Gaps</h2>
        <p className="font-body text-sm text-muted-foreground">
          Your readiness for {ratedRoles.length} role{ratedRoles.length !== 1 ? "s" : ""}. Click a role to see which skills need the most work.
        </p>
      </div>

      <div className="space-y-3">
        {ratedRoles.map((slug) => (
          <RoleGapCard key={slug} slug={slug} />
        ))}
      </div>

      <div className="mt-6 p-4 border border-dashed border-border rounded-xl">
        <p className="font-display font-700 text-sm mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Improve your scores
        </p>
        <p className="font-body text-xs text-muted-foreground">
          Your readiness score rises as you rate more skills and earn industry badges. Expand a role above to see your Skills Pathway.
        </p>
      </div>
    </div>
  );
}
