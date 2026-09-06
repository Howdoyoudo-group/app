import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, Play } from "lucide-react";
import { toast } from "sonner";

interface CheckRow {
  industry: string;
  count: number;
  baseline: number;
  healthy: boolean;
  triggered: boolean;
  refetch_inserted?: number | null;
  refetch_skipped?: number | null;
  error?: string;
  coverage_total?: number;
  coverage_covered?: number;
  coverage_missing?: string[];
}

interface RunRow {
  id: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  trigger_source: string | null;
  industries_checked: number;
  industries_unhealthy: number;
  industries_refetched: number;
  checks: CheckRow[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function formatDuration(ms: number | null): string {
  if (!ms) return "-";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export default function AdminIndustryHealth() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    document.title = "Industry Health · Admin";
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/employer-login");
      return;
    }
    (async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await loadRuns();
      else setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadRuns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("industry_health_log" as never)
      .select("*")
      .order("started_at", { ascending: false })
      .limit(30);
    if (error) console.error(error);
    setRuns((data ?? []) as unknown as RunRow[]);
    setLoading(false);
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const { error } = await supabase.functions.invoke("industry-health-monitor", {
        body: {},
      });
      if (error) throw error;
      toast.success("Health check started");
      // give it a moment then reload
      setTimeout(loadRuns, 2000);
    } catch (e) {
      toast.error(`Failed to start: ${(e as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  const [badgeBusy, setBadgeBusy] = useState(false);
  const generateBadge = async (industry: string) => {
    setBadgeBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-badge-content", {
        body: { industry },
      });
      if (error) throw error;
      toast.success(`${industry} badge content generated (${data?.lessons ?? 0} lessons, ${data?.questions ?? 0} questions)`);
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setBadgeBusy(false);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Admins only</h1>
          <p className="text-sm text-muted-foreground">
            You need an admin role to view industry health telemetry.
          </p>
        </Card>
      </div>
    );
  }

  const latest = runs[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Industry health</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Automated job-count check runs every 6 hours. Industries below 50% of their baseline trigger an automatic re-fetch.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="default" size="sm" onClick={runNow} disabled={running}>
              <Play className={`h-4 w-4 mr-2 ${running ? "animate-pulse" : ""}`} />
              Run now
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateBadge("football")} disabled={badgeBusy}>
              {badgeBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              (Re)generate Football badge
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateBadge("music")} disabled={badgeBusy}>
              {badgeBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              (Re)generate Music badge
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateBadge("journalism")} disabled={badgeBusy}>
              {badgeBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              (Re)generate Journalism badge
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateBadge("fashion")} disabled={badgeBusy}>
              {badgeBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              (Re)generate Fashion badge
            </Button>
            <Button variant="outline" size="sm" onClick={loadRuns} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : runs.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No runs logged yet. Click "Run now" to trigger the first check.
          </Card>
        ) : (
          <>
            {latest && (
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Latest run
                    </div>
                    <div className="text-lg font-semibold">{formatTime(latest.started_at)}</div>
                    <div className="text-sm text-muted-foreground">
                      Duration {formatDuration(latest.duration_ms)} · Trigger {latest.trigger_source || "manual"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {latest.industries_unhealthy === 0 ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> All healthy
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {latest.industries_unhealthy} unhealthy · {latest.industries_refetched} refetched
                      </Badge>
                    )}
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Industry</TableHead>
                      <TableHead className="text-right">Live</TableHead>
                      <TableHead className="text-right">Baseline</TableHead>
                      <TableHead className="text-right">% of baseline</TableHead>
                      <TableHead className="text-right">Career-map</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(latest.checks || [])
                      .slice()
                      .sort((a, b) => a.count / a.baseline - b.count / b.baseline)
                      .map((c) => {
                        const pct = Math.round((c.count / c.baseline) * 100);
                        const hasCoverage = typeof c.coverage_total === "number" && c.coverage_total > 0;
                        const coveragePct = hasCoverage
                          ? Math.round(((c.coverage_covered ?? 0) / (c.coverage_total ?? 1)) * 100)
                          : null;
                        return (
                          <TableRow key={c.industry}>
                            <TableCell className="font-medium">{c.industry}</TableCell>
                            <TableCell className="text-right">{c.count}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{c.baseline}</TableCell>
                            <TableCell className="text-right">
                              <span className={pct < 50 ? "text-destructive font-semibold" : pct < 100 ? "text-orange-500" : "text-green-600"}>
                                {pct}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {hasCoverage ? (
                                <span
                                  className={coveragePct! < 50 ? "text-destructive font-semibold" : coveragePct! < 100 ? "text-orange-500" : "text-green-600"}
                                  title={
                                    c.coverage_missing && c.coverage_missing.length > 0
                                      ? `Missing: ${c.coverage_missing.join(", ")}`
                                      : "All career-map roles covered"
                                  }
                                >
                                  {c.coverage_covered}/{c.coverage_total}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {c.healthy ? (
                                <Badge variant="secondary">Healthy</Badge>
                              ) : (
                                <Badge variant="destructive">Low</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {c.triggered ? (
                                c.error ? `Refetch error: ${c.error}` : `Refetched (+${c.refetch_inserted ?? "?"})`
                              ) : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-3">History</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Started</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead className="text-right">Checked</TableHead>
                    <TableHead className="text-right">Unhealthy</TableHead>
                    <TableHead className="text-right">Refetched</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{formatTime(r.started_at)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.trigger_source || "manual"}</TableCell>
                      <TableCell className="text-right">{r.industries_checked}</TableCell>
                      <TableCell className="text-right">{r.industries_unhealthy}</TableCell>
                      <TableCell className="text-right">{r.industries_refetched}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatDuration(r.duration_ms)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
