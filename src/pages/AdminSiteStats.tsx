import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Users, Briefcase, BookmarkCheck, Sparkles, Info } from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { INDUSTRIES } from "@/data/industries";

const labelForSlug = (slug: string) =>
  INDUSTRIES.find((i) => i.slug === slug)?.name ??
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface InteractionRow {
  user_id: string;
  job_id: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

// Burst-collapse: a scanner pre-fetching a digest email opens every link at
// once (5-10 DIFFERENT job_ids, same user, same second, repeating ~10s
// later) - that's per-user temporal density, not a per-job repeat, so
// grouping is by user_id alone. Clusters are DISCARDED, not collapsed to
// one "real" click - a cluster of different jobs opened simultaneously by a
// bot carries no signal about which job (if any) a human actually wanted.
const BURST_THRESHOLD_MS = 3000;

function splitRealVsBurst<T extends { user_id: string; created_at: string }>(rows: T[]) {
  const byUser = new Map<string, T[]>();
  rows.forEach((r) => {
    const list = byUser.get(r.user_id) ?? [];
    list.push(r);
    byUser.set(r.user_id, list);
  });
  const real: T[] = [];
  const burst: T[] = [];
  for (const userRows of byUser.values()) {
    const sorted = [...userRows].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    let start = 0;
    for (let i = 1; i <= sorted.length; i++) {
      const gap = i < sorted.length
        ? Date.parse(sorted[i].created_at) - Date.parse(sorted[i - 1].created_at)
        : Infinity;
      if (gap > BURST_THRESHOLD_MS) {
        const cluster = sorted.slice(start, i);
        (cluster.length === 1 ? real : burst).push(...cluster);
        start = i;
      }
    }
  }
  return { real, burst };
}

const dayMs = 86400000;
const dayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);

interface SiteStats {
  clicksRaw30d: number;
  clicksReal7d: number;
  clicksReal30d: number;
  clicksBurst30d: number;
  burstSources: { source: string; count: number }[];
  topJobs: { jobId: string | null; title: string; clicks: number }[];
  dailyClicks: { date: string; real: number; burst: number }[];
  uniqueUsers7d: number;
  uniqueUsers30d: number;
  signups7d: number;
  signups30d: number;
  totalUsers: number;
  totalLiveJobs: number;
  jobsByIndustry: { industry: string; count: number }[];
  savedJobs: number;
  likedJobs: number;
  jobTrackerItems: number;
  savedFeedItems: number;
  avgCuriosityScore: number | null;
  pctScored: number | null;
}

export default function AdminSiteStats() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SiteStats | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const now = Date.now();
    const since7 = new Date(now - 7 * dayMs).toISOString();
    const since14 = new Date(now - 14 * dayMs).toISOString();
    const since30 = new Date(now - 30 * dayMs).toISOString();

    const [clickRes, allInteractionsRes, totalUsersRes, signups7Res, signups30Res, jobsByIndustryRes, engagementRes, curiosityRes] =
      await Promise.all([
        supabase.from("user_interactions").select("user_id, job_id, created_at, metadata")
          .eq("interaction_type", "job_click").gte("created_at", since30).limit(20000),
        supabase.from("user_interactions").select("user_id, created_at").gte("created_at", since30).limit(20000),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since7),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since30),
        supabase.rpc("get_live_job_counts_by_industry"),
        supabase.rpc("admin_get_engagement_counts"),
        supabase.from("profiles").select("curiosity_score").not("curiosity_score", "is", null).limit(20000),
      ]);

    // Real vs burst job clicks
    const clickRows = (clickRes.data ?? []) as InteractionRow[];
    const { real, burst } = splitRealVsBurst(clickRows);
    const clicksReal7d = real.filter((r) => r.created_at >= since7).length;
    const clicksReal30d = real.length;
    const clicksBurst30d = burst.length;

    const sourceCounts = new Map<string, number>();
    burst.forEach((r) => {
      const source = (r.metadata as any)?.source ?? "unknown";
      sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
    });
    const burstSources = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    const byJob = new Map<string, number>();
    real.forEach((r) => { if (r.job_id) byJob.set(r.job_id, (byJob.get(r.job_id) ?? 0) + 1); });
    const topJobIds = Array.from(byJob.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id]) => id);
    const titles = new Map<string, string>();
    if (topJobIds.length) {
      const { data: jrows } = await supabase.from("jobs").select("id, title").in("id", topJobIds);
      (jrows ?? []).forEach((j: any) => titles.set(j.id, j.title));
    }
    const topJobs = topJobIds.map((id) => ({ jobId: id, title: titles.get(id) ?? "Removed listing", clicks: byJob.get(id)! }));

    // Daily real vs burst, last 14 days
    const dailyMap = new Map<string, { real: number; burst: number }>();
    for (let i = 13; i >= 0; i--) {
      const key = dayKey(new Date(now - i * dayMs).toISOString());
      dailyMap.set(key, { real: 0, burst: 0 });
    }
    real.filter((r) => r.created_at >= since14).forEach((r) => {
      const key = dayKey(r.created_at);
      const entry = dailyMap.get(key);
      if (entry) entry.real += 1;
    });
    burst.filter((r) => r.created_at >= since14).forEach((r) => {
      const key = dayKey(r.created_at);
      const entry = dailyMap.get(key);
      if (entry) entry.burst += 1;
    });
    const dailyClicks = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

    // Unique active signed-in users
    const allInteractions = (allInteractionsRes.data ?? []) as { user_id: string; created_at: string }[];
    const uniq7 = new Set<string>();
    const uniq30 = new Set<string>();
    allInteractions.forEach((r) => {
      uniq30.add(r.user_id);
      if (r.created_at >= since7) uniq7.add(r.user_id);
    });

    // Jobs by industry
    const industryRows = (jobsByIndustryRes.data ?? []) as { industry: string; count: number }[];
    const sortedIndustries = [...industryRows].sort((a, b) => Number(b.count) - Number(a.count));
    const totalLiveJobs = sortedIndustries.reduce((sum, r) => sum + Number(r.count), 0);
    const topIndustries = sortedIndustries.slice(0, 8).map((r) => ({ industry: labelForSlug(r.industry), count: Number(r.count) }));
    const otherCount = sortedIndustries.slice(8).reduce((sum, r) => sum + Number(r.count), 0);
    const jobsByIndustry = otherCount > 0 ? [...topIndustries, { industry: "Other", count: otherCount }] : topIndustries;

    // Engagement (saved/liked/tracker/feed) - via RPC, RLS on the base tables is owner-only
    const engagement = (engagementRes.data as any)?.[0] ?? { saved_jobs: 0, liked_jobs: 0, job_tracker_items: 0, saved_feed_items: 0 };

    // Curiosity score
    const curiosityScores = ((curiosityRes.data ?? []) as { curiosity_score: number | null }[])
      .map((r) => r.curiosity_score)
      .filter((v): v is number => v != null);
    const totalUsers = totalUsersRes.count ?? 0;
    const avgCuriosityScore = curiosityScores.length
      ? Math.round((curiosityScores.reduce((a, b) => a + b, 0) / curiosityScores.length) * 10) / 10
      : null;
    const pctScored = totalUsers > 0 ? Math.round((curiosityScores.length / totalUsers) * 1000) / 10 : null;

    setStats({
      clicksRaw30d: clickRows.length,
      clicksReal7d,
      clicksReal30d,
      clicksBurst30d,
      burstSources,
      topJobs,
      dailyClicks,
      uniqueUsers7d: uniq7.size,
      uniqueUsers30d: uniq30.size,
      signups7d: signups7Res.count ?? 0,
      signups30d: signups30Res.count ?? 0,
      totalUsers,
      totalLiveJobs,
      jobsByIndustry,
      savedJobs: engagement.saved_jobs ?? 0,
      likedJobs: engagement.liked_jobs ?? 0,
      jobTrackerItems: engagement.job_tracker_items ?? 0,
      savedFeedItems: engagement.saved_feed_items ?? 0,
      avgCuriosityScore,
      pctScored,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?redirect=/admin/site-stats");
      return;
    }
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await loadStats();
    })();
  }, [user, authLoading, navigate, loadStats]);

  const clicksChartConfig: ChartConfig = useMemo(() => ({
    real: { label: "Real clicks", color: "hsl(var(--primary))" },
    burst: { label: "Bot bursts", color: "hsl(var(--muted-foreground))" },
  }), []);

  const industryChartConfig: ChartConfig = useMemo(() => ({
    count: { label: "Live jobs", color: "hsl(var(--primary))" },
  }), []);

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Admins only</h1>
          <p className="text-muted-foreground">You don't have access to this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" /> Site Stats
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Real (bot-filtered) job clicks and site-wide engagement. Only counts signed-in users -
            anonymous browsing before signup isn't tracked.
          </p>
        </header>

        {loading || !stats ? (
          <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-8">
            {/* Real vs raw clicks */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Job apply clicks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Real clicks (7d)</p>
                  <p className="text-3xl font-bold mt-1">{stats.clicksReal7d}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Real clicks (30d)</p>
                  <p className="text-3xl font-bold mt-1">{stats.clicksReal30d}</p>
                  <p className="text-xs text-muted-foreground mt-1">of {stats.clicksRaw30d} raw rows</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Discarded as bot bursts (30d)</p>
                  <p className="text-3xl font-bold mt-1">{stats.clicksBurst30d}</p>
                </Card>
              </div>
              <Card className="p-4 mb-3 flex items-start gap-2 bg-muted/30">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  A row is discarded when 2+ interactions from the same signed-in user land within 3 seconds
                  of each other - the signature of an email security scanner pre-fetching every link in a
                  digest email before it's opened, not a human click.
                  {stats.burstSources.length > 0 && (
                    <> Sources of discarded rows: {stats.burstSources.map((s) => `${s.source} (${s.count})`).join(", ")}.</>
                  )}
                </p>
              </Card>
              {stats.dailyClicks.some((d) => d.real > 0 || d.burst > 0) && (
                <Card className="p-4 mb-3">
                  <p className="text-sm font-medium mb-2">Real vs bot-burst clicks, last 14 days</p>
                  <ChartContainer config={clicksChartConfig} className="aspect-auto h-64 w-full">
                    <BarChart data={stats.dailyClicks}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="real" fill="var(--color-real)" radius={2} />
                      <Bar dataKey="burst" fill="var(--color-burst)" radius={2} />
                    </BarChart>
                  </ChartContainer>
                </Card>
              )}
              {stats.topJobs.length > 0 && (
                <Card className="p-4">
                  <p className="text-sm font-medium mb-2">Top jobs by real clicks</p>
                  <div className="space-y-1.5">
                    {stats.topJobs.map((j) => (
                      <div key={j.jobId ?? j.title} className="flex items-center justify-between text-sm">
                        <span className="truncate">{j.title}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">{j.clicks}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </section>

            {/* Users & engagement */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> Users
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Active (7d)</p>
                  <p className="text-3xl font-bold mt-1">{stats.uniqueUsers7d}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Active (30d)</p>
                  <p className="text-3xl font-bold mt-1">{stats.uniqueUsers30d}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">New signups (7d)</p>
                  <p className="text-3xl font-bold mt-1">{stats.signups7d}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total accounts</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                </Card>
              </div>
            </section>

            {/* Jobs inventory */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Jobs live right now
              </h2>
              <Card className="p-4 mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total live jobs</p>
                <p className="text-3xl font-bold mt-1">{stats.totalLiveJobs.toLocaleString()}</p>
              </Card>
              {stats.jobsByIndustry.length > 0 && (
                <Card className="p-4">
                  <p className="text-sm font-medium mb-2">By industry (top 8)</p>
                  <ChartContainer config={industryChartConfig} className="aspect-auto h-72 w-full">
                    <BarChart data={stats.jobsByIndustry} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                      <YAxis type="category" dataKey="industry" tickLine={false} axisLine={false} fontSize={11} width={110} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={2} />
                    </BarChart>
                  </ChartContainer>
                </Card>
              )}
            </section>

            {/* Engagement */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4" /> Engagement
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Saved jobs</p>
                  <p className="text-3xl font-bold mt-1">{stats.savedJobs}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Liked jobs</p>
                  <p className="text-3xl font-bold mt-1">{stats.likedJobs}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Job Tracker items</p>
                  <p className="text-3xl font-bold mt-1">{stats.jobTrackerItems}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Saved articles/videos</p>
                  <p className="text-3xl font-bold mt-1">{stats.savedFeedItems}</p>
                </Card>
              </div>
            </section>

            {/* Curiosity score */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Curiosity score
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Average score</p>
                  <p className="text-3xl font-bold mt-1">{stats.avgCuriosityScore ?? "—"}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">% of accounts scored</p>
                  <p className="text-3xl font-bold mt-1">{stats.pctScored != null ? `${stats.pctScored}%` : "—"}</p>
                </Card>
              </div>
            </section>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={loadStats} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
