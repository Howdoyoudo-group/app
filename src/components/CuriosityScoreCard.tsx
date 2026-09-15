import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Flame, ArrowRight } from "lucide-react";
import { missingCuriosityCategories } from "@/lib/curiosityCategories";

// Candidate-facing gamification for profiles.curiosity_score - previously
// only ever shown to employers (EmployerDashboard.tsx's "{score}% curious"
// badge). Same underlying percentile (see compute-curiosity-scores), just
// framed for the person it's actually about instead of the people looking
// at them.
export default function CuriosityScoreCard() {
  const { user } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [breadth, setBreadth] = useState<number | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("curiosity_score, curiosity_breadth, curiosity_active_categories")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      // numeric columns come back as strings from PostgREST (precision
      // safety), not JS numbers - Number() rather than a typeof check.
      const raw = (data as any)?.curiosity_score;
      setScore(raw != null ? Number(raw) : null);
      setBreadth((data as any)?.curiosity_breadth ?? null);
      setActiveCategories((data as any)?.curiosity_active_categories ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!user || loading) return null;
  // Computed nightly - a brand new account genuinely has no score yet.
  // Showing "0%" here would read as a bad grade rather than "not measured".
  if (score == null || Number.isNaN(score)) return null;

  const tier =
    score >= 90 ? "Top 10% most curious on Howdy"
    : score >= 75 ? "Top 25% most curious on Howdy"
    : score >= 50 ? "More curious than average"
    : "Just getting started";

  // Only present once compute-curiosity-scores has run since this field was
  // added - older scores may have breadth/score but no category breakdown
  // yet, so the "how to improve" section quietly doesn't show rather than
  // rendering an empty/wrong list.
  const missing = activeCategories != null ? missingCuriosityCategories(activeCategories) : [];

  return (
    <div className="bg-card border-2 border-foreground rounded-3xl p-5 md:p-6 shadow-[4px_4px_0_hsl(var(--foreground))]">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg">Your curiosity score</h2>
      </div>
      <div className="flex items-end gap-3 mb-2 flex-wrap">
        <span className="font-display font-800 text-4xl text-primary">{score}%</span>
        <span className="font-body text-sm text-muted-foreground pb-1">{tier} this month</span>
      </div>
      <p className="font-body text-xs text-muted-foreground mb-3">
        How actively you're exploring Howdy - browsing, saving jobs, tracking applications, learning. Employers see this too, it's part of what makes you stand out.
      </p>
      {breadth != null && (
        <div className="flex gap-1 mb-4" title={`Active in ${breadth}/5 signal areas`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${i < breadth ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      )}
      {missing.length > 0 && (
        <div className="border-t-2 border-foreground/10 pt-4">
          <p className="font-display font-700 text-xs uppercase tracking-wide text-foreground mb-2">
            Ways to raise your score
          </p>
          <ul className="space-y-2">
            {missing.map((c) => (
              <li key={c.key}>
                <Link
                  to={c.linkTo}
                  className="group flex items-start gap-2 rounded-xl border-2 border-foreground/10 hover:border-foreground p-2.5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-display font-800 text-sm text-foreground">{c.label}</p>
                    <p className="font-body text-xs text-muted-foreground">{c.suggestion}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary shrink-0 ml-auto mt-1 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
