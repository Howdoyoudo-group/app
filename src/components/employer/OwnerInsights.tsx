import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, Users, Building2, MousePointerClick, TrendingDown, UserCheck,
  Briefcase, Newspaper, Mail, Loader2, BarChart3, RefreshCw, Sparkles,
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Minus, Database,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import AdminPinning from "./AdminPinning";

// Map raw DB industry slugs/values to display labels
const INDUSTRY_LABEL_OVERRIDES: Record<string, string> = {
  cinema: "Film and TV",
  "film-and-tv": "Film and TV",
  film_and_tv: "Film and TV",
  influencing: "Influencing",
};

const formatIndustryLabel = (raw: string): string => {
  if (!raw) return raw;
  const key = raw.trim().toLowerCase();
  return INDUSTRY_LABEL_OVERRIDES[key] ?? raw;
};

type IndustryCount = { industry: string; count: number };
type RoleCount = { role: string; count: number };
type TemplateCount = { template: string; count: number };
type EmployerCount = { company: string; count: number };
type EmployerByIndustry = { industry: string; company: string; count: number };
type SourceCount = { source: string; count: number };
type AddedRemoved = { source: string; added: number; removed: number; net: number };
type InteractionByIndustry = {
  industry: string;
  views: number;
  companyViews: number;
  jobClicks: number;
  total: number;
};

interface InsightData {
  liveUsers: number;
  liveEmployers: number;
  active24h: number;
  totalUsers: number;
  totalEmployers: number;
  applies30d: number;
  applies7d: number;
  pageViews30d: number;
  bouncedSessions: number;
  totalSessions: number;
  bounceRate: number;
  profilesUpdated30d: number;
  profilesUpdated7d: number;
  jobsTotal: number;
  jobsTotalRaw: number;
  jobsByIndustry: IndustryCount[];
  jobsByRole: RoleCount[];
  topEmployers: EmployerCount[];
  topEmployersByIndustry: EmployerByIndustry[];
  jobsBySource: SourceCount[];
  jobsAddedRemovedYesterday: AddedRemoved[];
  yesterdayDate: string | null;
  articles30d: number;
  briefings30d: number;
  newslettersSent30d: number;
  emailsSentTotal30d: number;
  emailsByTemplate30d: TemplateCount[];
  digestsByIndustry30d: IndustryCount[];
  interactionsByIndustry30d: InteractionByIndustry[];
  contactRequests30d: number;
  contactReplies30d: number;
}

const Stat = ({
  icon: Icon, label, value, hint, accent,
}: { icon: any; label: string; value: string | number; hint?: string; accent?: "primary" | "muted" }) => (
  <div className={`border-2 border-foreground rounded-2xl p-4 ${accent === "primary" ? "bg-primary/10" : "bg-background"}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4" strokeWidth={2.5} />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
    <div className="font-display text-3xl leading-none tabular-nums">{value}</div>
    {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
  </div>
);

const Bar = ({ label, value, max }: { label: string; value: number; max: number }) => {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-body text-foreground/90 truncate pr-2">{label}</span>
        <span className="tabular-nums font-bold">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden border border-foreground/10">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const CollapsibleCard = ({
  icon: Icon,
  title,
  meta,
  defaultOpen = false,
  children,
}: {
  icon: any;
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-2 border-foreground rounded-2xl bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-5 py-4 text-left"
      >
        <Icon className="w-4 h-4 shrink-0" strokeWidth={3} />
        <h3 className="font-display uppercase tracking-wide text-sm">{title}</h3>
        {meta && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline">
            {meta}
          </span>
        )}
        {open ? (
          <ChevronUp className={`w-4 h-4 shrink-0 ${meta ? "ml-2 sm:ml-0" : "ml-auto"}`} strokeWidth={3} />
        ) : (
          <ChevronDown className={`w-4 h-4 shrink-0 ${meta ? "ml-2 sm:ml-0" : "ml-auto"}`} strokeWidth={3} />
        )}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
};

const OwnerInsights = () => {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [aiGeneratedAt, setAiGeneratedAt] = useState<string | null>(null);
  const [employerFilter, setEmployerFilter] = useState<string>("all");

  const runHowdy = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke(
        "owner-insights-ai",
      );
      if (fnErr) throw fnErr;
      const r = res as any;
      if (r?.error) throw new Error(r.error);
      setAiText(r?.insight ?? "");
      setAiGeneratedAt(r?.generated_at ?? new Date().toISOString());
      setAiCollapsed(false);
    } catch (e: any) {
      setAiError(e?.message ?? "Howdy is unavailable right now.");
    } finally {
      setAiLoading(false);
    }
  };

  const load = async () => {
    setRefreshing(true);
    try {
      const { data: row, error: rpcError } = await supabase.rpc("get_owner_insights" as any);
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      const r = row as any;
      const totalSessions = Number(r.totalSessions ?? 0);
      const bouncedSessions = Number(r.bouncedSessions ?? 0);
      const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 1000) / 10 : 0;

      setData({
        liveUsers: Number(r.liveUsers ?? 0),
        liveEmployers: Number(r.liveEmployers ?? 0),
        active24h: Number(r.active24h ?? 0),
        totalUsers: Number(r.totalUsers ?? 0),
        totalEmployers: Number(r.totalEmployers ?? 0),
        applies30d: Number(r.applies30d ?? 0),
        applies7d: Number(r.applies7d ?? 0),
        pageViews30d: Number(r.pageViews30d ?? 0),
        bouncedSessions,
        totalSessions,
        bounceRate,
        profilesUpdated30d: Number(r.profilesUpdated30d ?? 0),
        profilesUpdated7d: Number(r.profilesUpdated7d ?? 0),
        jobsTotal: Number(r.jobsTotal ?? 0),
        jobsTotalRaw: Number(r.jobsTotalRaw ?? r.jobsTotal ?? 0),
        jobsByIndustry: (r.jobsByIndustry ?? []).map((d: any) => ({ industry: d.industry, count: Number(d.count) })),
        jobsByRole: (r.jobsByRole ?? []).map((d: any) => ({ role: d.role, count: Number(d.count) })),
        topEmployers: (r.topEmployers ?? []).map((d: any) => ({ company: d.company, count: Number(d.count) })),
        topEmployersByIndustry: (r.topEmployersByIndustry ?? []).map((d: any) => ({ industry: d.industry, company: d.company, count: Number(d.count) })),
        jobsBySource: (r.jobsBySource ?? []).map((d: any) => ({ source: d.source, count: Number(d.count) })),
        jobsAddedRemovedYesterday: (r.jobsAddedRemovedYesterday ?? []).map((d: any) => ({
          source: d.source,
          added: Number(d.added ?? 0),
          removed: Number(d.removed ?? 0),
          net: Number(d.net ?? 0),
        })),
        yesterdayDate: r.yesterdayDate ?? null,
        articles30d: Number(r.articles30d ?? 0),
        briefings30d: Number(r.briefings30d ?? 0),
        newslettersSent30d: Number(r.newslettersSent30d ?? 0),
        emailsSentTotal30d: Number(r.emailsSentTotal30d ?? 0),
        emailsByTemplate30d: (r.emailsByTemplate30d ?? []).map((d: any) => ({ template: d.template, count: Number(d.count) })),
        digestsByIndustry30d: (r.digestsByIndustry30d ?? []).map((d: any) => ({ industry: d.industry, count: Number(d.count) })),
        interactionsByIndustry30d: (r.interactionsByIndustry30d ?? []).map((d: any) => ({
          industry: d.industry,
          views: Number(d.views ?? 0),
          companyViews: Number(d.companyViews ?? 0),
          jobClicks: Number(d.jobClicks ?? 0),
          total: Number(d.total ?? 0),
        })),
        contactRequests30d: Number(r.contactRequests30d ?? 0),
        contactReplies30d: Number(r.contactReplies30d ?? 0),
      });
      setError(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxIndustry = useMemo(() => Math.max(1, ...(data?.jobsByIndustry ?? []).map((d) => d.count)), [data]);
  const maxRole = useMemo(() => Math.max(1, ...(data?.jobsByRole ?? []).map((d) => d.count)), [data]);
  const maxTpl = useMemo(() => Math.max(1, ...(data?.emailsByTemplate30d ?? []).map((d) => d.count)), [data]);
  const maxSource = useMemo(() => Math.max(1, ...(data?.jobsBySource ?? []).map((d) => d.count)), [data]);
  const maxDigest = useMemo(() => Math.max(1, ...(data?.digestsByIndustry30d ?? []).map((d) => d.count)), [data]);
  const maxInteractions = useMemo(
    () => Math.max(1, ...(data?.interactionsByIndustry30d ?? []).map((d) => d.total)),
    [data],
  );
  const sortedInteractions = useMemo(() => {
    if (!data) return [];
    return [...data.interactionsByIndustry30d].sort((a, b) => b.total - a.total);
  }, [data]);
  const totalDigests = useMemo(
    () => (data?.digestsByIndustry30d ?? []).reduce((sum, d) => sum + d.count, 0),
    [data],
  );
  const totalInteractions = useMemo(
    () => sortedInteractions.reduce((sum, d) => sum + d.total, 0),
    [sortedInteractions],
  );

  const employerCategories = useMemo(() => {
    const set = new Set<string>();
    (data?.topEmployersByIndustry ?? []).forEach((d) => set.add(d.industry));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredEmployers = useMemo(() => {
    if (!data) return [];
    if (employerFilter === "all") return data.topEmployers;
    return data.topEmployersByIndustry
      .filter((d) => d.industry === employerFilter)
      .map((d) => ({ company: d.company, count: d.count }));
  }, [data, employerFilter]);

  const maxEmployer = useMemo(
    () => Math.max(1, ...filteredEmployers.map((d) => d.count)),
    [filteredEmployers],
  );

  if (loading || !data) {
    return (
      <div className="border-2 border-foreground rounded-2xl p-12 flex items-center justify-center bg-background mb-8">
        {error ? (
          <span className="text-sm text-destructive">Insights unavailable: {error}</span>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-3 font-body text-sm text-muted-foreground">Loading insights…</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-10">
      {/* Header */}
      <div className="border-2 border-foreground rounded-2xl bg-primary/10 px-5 py-4 flex items-center gap-3 flex-wrap">
        <BarChart3 className="w-6 h-6" strokeWidth={3} />
        <h2 className="font-display text-2xl uppercase tracking-tight">Site Insights</h2>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Owner-only · last 30 days</span>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/admin/adzuna-runs"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground rounded-full bg-background text-[10px] font-bold uppercase tracking-wider hover:bg-primary"
          >
            <Database className="w-3 h-3" />
            Adzuna runs
          </Link>
          <Link
            to="/admin/industry-health"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground rounded-full bg-background text-[10px] font-bold uppercase tracking-wider hover:bg-primary"
          >
            <Database className="w-3 h-3" />
            Industry health
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground rounded-full bg-background text-[10px] font-bold uppercase tracking-wider hover:bg-primary"
          >
            <Database className="w-3 h-3" />
            Users
          </Link>
          <button
            type="button"
            onClick={load}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground rounded-full bg-background text-[10px] font-bold uppercase tracking-wider hover:bg-primary disabled:opacity-60"
          >
            {refreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Admin pinning */}
      <AdminPinning />

      {/* Howdy AI Insight */}
      <div className="border-2 border-foreground rounded-2xl bg-background p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Sparkles className="w-4 h-4 text-primary" strokeWidth={3} />
          <h3 className="font-display uppercase tracking-wide text-sm">Howdy says - things to consider</h3>
          {aiGeneratedAt && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              · generated {new Date(aiGeneratedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={runHowdy}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground rounded-full bg-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/80 disabled:opacity-60"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {aiText ? "Re-run Howdy" : "Ask Howdy"}
            </button>
            {aiText && (
              <button
                type="button"
                onClick={() => setAiCollapsed((v) => !v)}
                aria-expanded={!aiCollapsed}
                aria-label={aiCollapsed ? "Expand Howdy insight" : "Collapse Howdy insight"}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border-2 border-foreground rounded-full bg-background text-[10px] font-bold uppercase tracking-wider hover:bg-muted"
              >
                {aiCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                {aiCollapsed ? "Show" : "Hide"}
              </button>
            )}
          </div>
        </div>

        {!aiCollapsed && (
          <>
            {aiError && <p className="text-xs text-destructive">{aiError}</p>}

            {!aiText && !aiError && !aiLoading && (
              <p className="text-xs text-muted-foreground">
                Tap <span className="font-bold">Ask Howdy</span> to get an AI read on your latest metrics - what's working, what's slipping, and where to look next.
              </p>
            )}

            {aiLoading && !aiText && (
              <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Howdy is reading the dashboard…
              </p>
            )}

            {aiText && (
              <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:uppercase prose-strong:text-foreground prose-li:my-1">
                <ReactMarkdown>{aiText}</ReactMarkdown>
              </div>
            )}
          </>
        )}
      </div>

      {/* Live row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Activity} label="Live users (5 min)" value={data.liveUsers} hint={`${data.active24h} active in last 24h`} accent="primary" />
        <Stat icon={Building2} label="Live employers" value={data.liveEmployers} hint={`${data.totalEmployers} total employer accounts`} accent="primary" />
        <Stat icon={Users} label="Registered users" value={data.totalUsers} hint={`${data.profilesUpdated7d} updated this week`} />
        <Stat icon={UserCheck} label="Profiles updated (30d)" value={data.profilesUpdated30d} hint={`${data.profilesUpdated7d} in last 7d`} />
      </div>

      {/* Engagement row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat icon={Briefcase} label="Live job listings" value={data.jobsTotalRaw.toLocaleString()} hint={`${data.jobsTotal.toLocaleString()} unique roles · ${data.jobsByIndustry.length} industries`} accent="primary" />
        <Stat icon={MousePointerClick} label="Apply clicks (30d)" value={data.applies30d} hint={`${data.applies7d} in last 7d`} />
        <Stat icon={TrendingDown} label="Bounce rate (30d)" value={`${data.bounceRate}%`} hint={`${data.bouncedSessions} of ${data.totalSessions} sessions`} />
        <Stat icon={Mail} label="Newsletters sent (30d)" value={data.newslettersSent30d} hint="Daily digest emails" />
        <Stat icon={Newspaper} label="Content (30d)" value={data.articles30d + data.briefings30d} hint={`${data.articles30d} articles · ${data.briefings30d} briefings`} />
      </div>

      {/* Jobs by industry */}
      <CollapsibleCard
        icon={Briefcase}
        title="Jobs by industry"
        meta={`${data.jobsTotalRaw.toLocaleString()} listings · ${data.jobsTotal.toLocaleString()} unique roles`}
      >
        {data.jobsByIndustry.length === 0 ? (
          <p className="text-xs text-muted-foreground">No jobs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {data.jobsByIndustry.map((d) => (
              <Bar key={d.industry} label={formatIndustryLabel(d.industry)} value={d.count} max={maxIndustry} />
            ))}
          </div>
        )}
      </CollapsibleCard>

      {/* Daily digests by industry + Interactions by industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollapsibleCard
          icon={Mail}
          title="Daily digests by industry"
          meta={`${totalDigests.toLocaleString()} sent · 30d`}
          defaultOpen
        >
          {data.digestsByIndustry30d.length === 0 ? (
            <p className="text-xs text-muted-foreground">No digests sent in this window.</p>
          ) : (
            <div className="space-y-3">
              {data.digestsByIndustry30d.map((d) => (
                <Bar
                  key={d.industry}
                  label={formatIndustryLabel(d.industry)}
                  value={d.count}
                  max={maxDigest}
                />
              ))}
            </div>
          )}
        </CollapsibleCard>

        <CollapsibleCard
          icon={MousePointerClick}
          title="Engagement by industry"
          meta={`${totalInteractions.toLocaleString()} interactions · 30d`}
          defaultOpen
        >
          {sortedInteractions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No interactions yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedInteractions.map((d) => {
                const pct =
                  maxInteractions > 0
                    ? Math.max(2, Math.round((d.total / maxInteractions) * 100))
                    : 0;
                return (
                  <div key={d.industry} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-body text-foreground/90 truncate pr-2">
                        {formatIndustryLabel(d.industry)}
                      </span>
                      <span className="tabular-nums font-bold">{d.total}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden border border-foreground/10">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground tabular-nums">
                      <span>{d.views} views</span>
                      <span>·</span>
                      <span>{d.companyViews} co. views</span>
                      <span>·</span>
                      <span>{d.jobClicks} job clicks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleCard>
      </div>
      <CollapsibleCard icon={BarChart3} title="Jobs by role category">
        {data.jobsByRole.length === 0 ? (
          <p className="text-xs text-muted-foreground">No role-tagged jobs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {data.jobsByRole.map((d) => (
              <Bar key={d.role} label={d.role} value={d.count} max={maxRole} />
            ))}
          </div>
        )}
      </CollapsibleCard>

      {/* Top Employers + Jobs by Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollapsibleCard
          icon={Building2}
          title="Top employers"
          meta={employerFilter === "all" ? "All industries" : formatIndustryLabel(employerFilter)}
        >
          {employerCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                type="button"
                onClick={() => setEmployerFilter("all")}
                className={`px-2.5 py-1 rounded-full border-2 border-foreground text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  employerFilter === "all" ? "bg-primary" : "bg-background hover:bg-primary/20"
                }`}
              >
                All
              </button>
              {employerCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEmployerFilter(cat)}
                  className={`px-2.5 py-1 rounded-full border-2 border-foreground text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    employerFilter === cat ? "bg-primary" : "bg-background hover:bg-primary/20"
                  }`}
                >
                  {formatIndustryLabel(cat)}
                </button>
              ))}
            </div>
          )}

          {filteredEmployers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No employers in this category.</p>
          ) : (
            <div className="space-y-3">
              {filteredEmployers.map((d) => (
                <Bar key={d.company} label={d.company} value={d.count} max={maxEmployer} />
              ))}
            </div>
          )}
        </CollapsibleCard>

        <CollapsibleCard
          icon={Briefcase}
          title="Jobs by source"
          meta="Top 10 ingestion sources"
        >
          {data.jobsBySource.length === 0 ? (
            <p className="text-xs text-muted-foreground">No source data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.jobsBySource.map((d) => (
                <Bar key={d.source} label={d.source} value={d.count} max={maxSource} />
              ))}
            </div>
          )}
        </CollapsibleCard>
      </div>

      {/* Added vs Removed yesterday */}
      {(() => {
        const rows = data.jobsAddedRemovedYesterday ?? [];
        const totals = rows.reduce(
          (acc, r) => ({
            added: acc.added + r.added,
            removed: acc.removed + r.removed,
            net: acc.net + r.net,
          }),
          { added: 0, removed: 0, net: 0 },
        );
        const yLabel = data.yesterdayDate
          ? new Date(data.yesterdayDate).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })
          : "yesterday";
        return (
          <CollapsibleCard
            icon={BarChart3}
            title="Added vs removed (yesterday)"
            meta={`${yLabel} · +${totals.added.toLocaleString()} / −${totals.removed.toLocaleString()} · net ${
              totals.net >= 0 ? "+" : ""
            }${totals.net.toLocaleString()}`}
            defaultOpen
          >
            {rows.length === 0 ? (
              <p className="text-xs text-muted-foreground">No ingestion activity yesterday.</p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-xs tabular-nums">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-foreground/20">
                      <th className="py-2 px-1">Source</th>
                      <th className="py-2 px-1 text-right">Added</th>
                      <th className="py-2 px-1 text-right">Removed</th>
                      <th className="py-2 px-1 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const NetIcon = r.net > 0 ? ArrowUpRight : r.net < 0 ? ArrowDownRight : Minus;
                      const netColor =
                        r.net > 0 ? "text-primary" : r.net < 0 ? "text-destructive" : "text-muted-foreground";
                      return (
                        <tr key={r.source} className="border-b border-foreground/10 last:border-0">
                          <td className="py-2 px-1 font-body">{r.source}</td>
                          <td className="py-2 px-1 text-right">
                            <span className="text-primary">+{r.added.toLocaleString()}</span>
                          </td>
                          <td className="py-2 px-1 text-right">
                            <span className="text-destructive">−{r.removed.toLocaleString()}</span>
                          </td>
                          <td className={`py-2 px-1 text-right font-bold ${netColor}`}>
                            <span className="inline-flex items-center gap-1 justify-end">
                              <NetIcon className="w-3 h-3" strokeWidth={3} />
                              {r.net > 0 ? "+" : ""}
                              {r.net.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-foreground bg-primary/5">
                      <td className="py-2 px-1 font-display uppercase text-[11px]">Total</td>
                      <td className="py-2 px-1 text-right font-bold text-primary">
                        +{totals.added.toLocaleString()}
                      </td>
                      <td className="py-2 px-1 text-right font-bold text-destructive">
                        −{totals.removed.toLocaleString()}
                      </td>
                      <td
                        className={`py-2 px-1 text-right font-bold ${
                          totals.net > 0
                            ? "text-primary"
                            : totals.net < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {totals.net > 0 ? "+" : ""}
                        {totals.net.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleCard>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollapsibleCard icon={Newspaper} title="Content (last 30 days)">
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={Newspaper} label="Articles ingested" value={data.articles30d} />
            <Stat icon={Newspaper} label="Daily briefings" value={data.briefings30d} />
            <Stat icon={Mail} label="Contact requests" value={data.contactRequests30d} hint={`${data.contactReplies30d} replied`} />
            <Stat icon={MousePointerClick} label="Page views" value={data.pageViews30d} />
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          icon={Mail}
          title="Emails sent (30d, by template)"
          meta={`${data.emailsSentTotal30d.toLocaleString()} total`}
        >
          {data.emailsByTemplate30d.length === 0 ? (
            <p className="text-xs text-muted-foreground">No emails sent in this window.</p>
          ) : (
            <div className="space-y-3">
              {data.emailsByTemplate30d.map((d) => (
                <Bar key={d.template} label={d.template} value={d.count} max={maxTpl} />
              ))}
            </div>
          )}
        </CollapsibleCard>
      </div>
    </div>
  );
};

export default OwnerInsights;
