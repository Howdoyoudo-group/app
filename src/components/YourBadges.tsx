import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Award } from "lucide-react";

interface EarnedBadge {
  id: string;
  industry: string;
  score: number;
  earned_at: string;
  visible_to_employers: boolean;
}

const prettyIndustry = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function YourBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("earned_badges")
        .select("id,industry,score,earned_at,visible_to_employers")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });
      if (!cancelled) {
        setBadges((data ?? []) as EarnedBadge[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const toggle = async (b: EarnedBadge) => {
    const next = !b.visible_to_employers;
    setBadges((prev) => prev.map((x) => (x.id === b.id ? { ...x, visible_to_employers: next } : x)));
    await supabase.from("earned_badges").update({ visible_to_employers: next }).eq("id", b.id);
  };

  if (!user || loading) return null;
  if (badges.length === 0) return null;

  return (
    <div className="bg-card border-2 border-foreground rounded-3xl p-5 md:p-6 shadow-[4px_4px_0_hsl(var(--foreground))]">
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg">Your badges</h2>
      </div>
      <p className="font-body text-xs text-muted-foreground mb-4">
        Industry Fundamentals badges you've earned. Toggle off to hide one from employers.
      </p>
      <ul className="space-y-2">
        {badges.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between gap-3 border-2 border-foreground bg-background px-3 py-2 rounded-2xl"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-display border-2 border-foreground bg-[#00E600] text-foreground rounded-full">
                {prettyIndustry(b.industry)} Fundamentals ✓
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {b.score}/10 · {new Date(b.earned_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </span>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground hidden sm:inline">Visible to employers</span>
              <Switch checked={b.visible_to_employers} onCheckedChange={() => toggle(b)} />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
