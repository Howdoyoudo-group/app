import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

type SweepRow = { kind: string; target: string; requests: number; errors: number; jobs: number };
type ErrorRow = { sweep: string; status?: number; message: string; at: string };

interface RunRow {
  id: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  total_requests: number;
  total_errors: number;
  total_jobs_returned: number;
  sweeps: SweepRow[];
  errors: ErrorRow[];
  trigger_source: string | null;
  industries: string[] | null;
}

const SWEEP_LABELS: Record<string, string> = {
  keyword: "Keyword sweep",
  temp: "Temp / contract",
  grad: "Graduate / intern",
  category: "Category sweep",
  geo: "Geo (city) sweep",
  role: "Role sweep",
  passion: "Passion sweep",
  other: "Other",
};

function formatDuration(ms: number | null): string {
  if (!ms) return "-";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminAdzunaRuns() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Adzuna Runs · Admin";
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
      .from("adzuna_run_log")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50);
    if (error) console.error(error);
    setRuns((data ?? []) as unknown as RunRow[]);
    setLoading(false);
  };

  const latest = runs[0];

  const totals = useMemo(() => {
    if (!latest) return null;
    const bySweepKind = new Map<string, { requests: number; errors: number; jobs: number }>();
    for (const s of latest.sweeps || []) {
      const cur = bySweepKind.get(s.kind) || { requests: 0, errors: 0, jobs: 0 };
      cur.requests += s.requests;
      cur.errors += s.errors;
      cur.jobs += s.jobs;
      bySweepKind.set(s.kind, cur);
    }
    return Array.from(bySweepKind.entries()).map(([kind, v]) => ({ kind, ...v }));
  }, [latest]);

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
            You need an admin role to view Adzuna run telemetry.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Adzuna runs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Per-sweep request counts, errors and timing for the last 50 ingestion runs.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadRuns} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : runs.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No Adzuna runs logged yet. The next ingestion job will populate this page.
          </Card>
        ) : (
          <>
            {/* Latest run summary */}
            {latest && (
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
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
                    {latest.total_errors === 0 ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Clean
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" /> {latest.total_errors} errors
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="text-xs text-muted-foreground">Requests</div>
                    <div className="text-2xl font-bold">{latest.total_requests}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="text-xs text-muted-foreground">Errors</div>
                    <div className="text-2xl font-bold">{latest.total_errors}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="text-xs text-muted-foreground">Jobs returned</div>
                    <div className="text-2xl font-bold">{latest.total_jobs_returned.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold mb-2">By sweep type</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sweep</TableHead>
                        <TableHead className="text-right">Requests</TableHead>
                        <TableHead className="text-right">Errors</TableHead>
                        <TableHead className="text-right">Jobs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(totals || []).map((t) => (
                        <TableRow key={t.kind}>
                          <TableCell className="font-medium">{SWEEP_LABELS[t.kind] || t.kind}</TableCell>
                          <TableCell className="text-right">{t.requests}</TableCell>
                          <TableCell className={`text-right ${t.errors > 0 ? "text-destructive font-semibold" : ""}`}>
                            {t.errors}
                          </TableCell>
                          <TableCell className="text-right">{t.jobs.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Per-sweep detail */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Per-industry breakdown ({(latest.sweeps || []).length} entries)
                  </summary>
                  <div className="mt-3 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sweep</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead className="text-right">Requests</TableHead>
                          <TableHead className="text-right">Errors</TableHead>
                          <TableHead className="text-right">Jobs</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(latest.sweeps || [])
                          .slice()
                          .sort((a, b) => b.requests - a.requests)
                          .map((s, i) => (
                            <TableRow key={`${s.kind}-${s.target}-${i}`}>
                              <TableCell>{SWEEP_LABELS[s.kind] || s.kind}</TableCell>
                              <TableCell className="font-mono text-xs">{s.target}</TableCell>
                              <TableCell className="text-right">{s.requests}</TableCell>
                              <TableCell className={`text-right ${s.errors > 0 ? "text-destructive" : ""}`}>
                                {s.errors}
                              </TableCell>
                              <TableCell className="text-right">{s.jobs.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </details>

                {latest.errors && latest.errors.length > 0 && (
                  <details className="mt-4" open>
                    <summary className="cursor-pointer text-sm font-semibold text-destructive">
                      Errors ({latest.errors.length})
                    </summary>
                    <div className="mt-3 max-h-72 overflow-auto rounded-md border bg-muted/30 p-3 space-y-2">
                      {latest.errors.map((e, i) => (
                        <div key={i} className="text-xs font-mono">
                          <span className="text-muted-foreground">{new Date(e.at).toLocaleTimeString()}</span>{" "}
                          <Badge variant="outline" className="mx-1 text-[10px]">{e.sweep}</Badge>
                          {e.status && <Badge variant="destructive" className="mr-1 text-[10px]">{e.status}</Badge>}
                          {e.message}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </Card>
            )}

            {/* Recent runs list */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-3">Recent runs</h2>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                      <TableHead className="text-right">Errors</TableHead>
                      <TableHead className="text-right">Jobs</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Industries</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((r) => (
                      <RunRowExpandable
                        key={r.id}
                        r={r}
                        expanded={expandedId === r.id}
                        onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function RunRowExpandable({
  r,
  expanded,
  onToggle,
}: {
  r: RunRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow>
        <TableCell className="whitespace-nowrap">{formatTime(r.started_at)}</TableCell>
        <TableCell>{formatDuration(r.duration_ms)}</TableCell>
        <TableCell className="text-right">{r.total_requests}</TableCell>
        <TableCell className={`text-right ${r.total_errors > 0 ? "text-destructive font-semibold" : ""}`}>
          {r.total_errors}
        </TableCell>
        <TableCell className="text-right">{r.total_jobs_returned.toLocaleString()}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{r.trigger_source || "manual"}</TableCell>
        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
          {(r.industries || []).slice(0, 4).join(", ")}
          {(r.industries?.length || 0) > 4 ? "…" : ""}
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {expanded ? "Hide" : "Detail"}
          </Button>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30">
            <div className="grid md:grid-cols-2 gap-4 py-2">
              <div>
                <div className="text-xs font-semibold mb-2">Sweeps</div>
                <div className="max-h-60 overflow-auto text-xs space-y-1">
                  {(r.sweeps || []).slice().sort((a, b) => b.requests - a.requests).map((s, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <span>
                        <Badge variant="outline" className="mr-2 text-[10px]">{s.kind}</Badge>
                        {s.target}
                      </span>
                      <span className="text-muted-foreground">
                        {s.requests} req · {s.errors} err · {s.jobs} jobs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2">Errors</div>
                <div className="max-h-60 overflow-auto text-xs space-y-1">
                  {(r.errors || []).length === 0 ? (
                    <div className="text-muted-foreground">No errors.</div>
                  ) : (
                    (r.errors || []).map((e, i) => (
                      <div key={i} className="font-mono">
                        <Badge variant="outline" className="mr-1 text-[10px]">{e.sweep}</Badge>
                        {e.status ? <span className="text-destructive">{e.status} </span> : null}
                        {e.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

