import { useEffect, useState } from "react";
import { Building2, Sparkles, TrendingUp, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

type IndustryRow = { industry: string; count: number };

interface Props {
  totalJobs: number;
  onPickIndustry: (industry: string) => void;
}

const titleCase = (s: string) =>
  s
    .split(/[\s-]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

export default function DynamicJobsEmptyState({ totalJobs, onPickIndustry }: Props) {
  const [industries, setIndustries] = useState<IndustryRow[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [newToday, setNewToday] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [indRes, compRes, newRes] = await Promise.all([
          supabase.rpc("get_live_job_counts_by_industry"),
          supabase
            .from("jobs")
            .select("company")
            .not("company", "is", null)
            .order("created_at", { ascending: false })
            .limit(120),
          supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .gte("created_at", since),
        ]);

        if (cancelled) return;

        const rows = ((indRes.data ?? []) as IndustryRow[])
          .filter((r) => r.industry && r.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setIndustries(rows);

        const seen = new Set<string>();
        const list: string[] = [];
        for (const row of (compRes.data ?? []) as { company: string | null }[]) {
          const c = (row.company || "").trim();
          if (!c) continue;
          const key = c.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          list.push(c);
          if (list.length >= 12) break;
        }
        setCompanies(list);
        setNewToday(newRes.count ?? null);
      } catch (e) {
        console.warn("DynamicJobsEmptyState load failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="col-span-full font-body">
      {/* Hero stat band */}
      <div className="rounded-3xl border-2 border-foreground bg-background p-6 md:p-8 mb-6">
        <div className="flex items-center gap-2 mb-2 text-foreground/70">
          <Sparkles className="h-4 w-4 text-[#00E600]" />
          <span className="text-xs uppercase tracking-wider font-700">Live right now</span>
        </div>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <div className="font-display text-4xl md:text-6xl leading-none">
              {totalJobs.toLocaleString()}
            </div>
            <div className="text-sm text-foreground/60 mt-1">roles across all industries</div>
          </div>
          {newToday !== null && newToday > 0 && (
            <div className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-4 w-4 text-[#00E600]" />
              <span className="font-700">+{newToday.toLocaleString()}</span>
              <span className="text-foreground/60 text-sm">added in the last 24h</span>
            </div>
          )}
        </div>
        <p className="text-foreground/60 mt-4 text-sm md:text-base">
          Pick an industry below or use the tabs above to start browsing.
        </p>
      </div>

      {/* Top industries */}
      {industries.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4" />
            <h3 className="font-display text-lg md:text-xl">Top hiring industries</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {industries.map((row) => (
              <button
                key={row.industry}
                onClick={() => onPickIndustry(row.industry)}
                className="group inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-background px-4 py-2 text-sm font-700 hover:bg-[#00E600] hover:text-foreground transition-colors"
              >
                <span>{titleCase(row.industry)}</span>
                <Badge
                  variant="secondary"
                  className="bg-foreground text-background group-hover:bg-foreground/90 rounded-full px-2 py-0 text-xs"
                >
                  {row.count.toLocaleString()}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent companies */}
      {companies.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4" />
            <h3 className="font-display text-lg md:text-xl">Recently posting</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {companies.map((c) => (
              <span
                key={c}
                className="inline-flex items-center rounded-full bg-foreground/5 border border-foreground/15 px-3 py-1.5 text-xs md:text-sm text-foreground/80"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading && industries.length === 0 && (
        <div className="text-center text-foreground/50 py-8 text-sm">Loading live activity…</div>
      )}
    </div>
  );
}
