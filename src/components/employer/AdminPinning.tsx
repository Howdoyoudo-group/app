import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Pin, PinOff, Search, Loader2, Briefcase, Building2, ArrowUp, ArrowDown,
} from "lucide-react";

// Map raw DB industry slugs to display labels
const INDUSTRY_LABEL: Record<string, string> = {
  "estate-agency": "Estate Agency",
  "horse-racing": "Horse Racing",
  "interior-design": "Interior Design",
  "hospitality": "Food & Drink",
  "cinema": "Film and TV",
};

const labelOf = (slug: string) =>
  INDUSTRY_LABEL[slug.toLowerCase()] ??
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

type PinnedJob = {
  id: string;
  title: string;
  company: string;
  industry: string | null;
  url: string;
  scraped_at: string;
};

type SearchedJob = PinnedJob & { featured: boolean };

type PinnedEmployer = {
  id: string;
  industry: string;
  company_name: string;
  rank: number;
  tagline: string | null;
  url: string | null;
};

type CandidateEmployer = {
  company_name: string;
  job_count: number;
  industry: string;
  pin_id?: string; // present if already pinned
};

const Section = ({
  icon: Icon,
  title,
  meta,
  children,
}: {
  icon: any;
  title: string;
  meta?: string;
  children: React.ReactNode;
}) => (
  <div className="border-2 border-foreground rounded-2xl bg-background">
    <div className="flex items-center gap-2 px-5 py-4 border-b-2 border-foreground/10">
      <Icon className="w-4 h-4 shrink-0" strokeWidth={3} />
      <h4 className="font-display uppercase tracking-wide text-sm">{title}</h4>
      {meta && (
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {meta}
        </span>
      )}
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

const Pill = ({
  active, onClick, children,
}: { active?: boolean; onClick?: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 border-2 border-foreground rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
      active ? "bg-primary text-foreground" : "bg-background hover:bg-muted"
    }`}
  >
    {children}
  </button>
);

const AdminPinning = () => {
  const [tab, setTab] = useState<"jobs" | "employers">("jobs");

  // ===== Shared: industry list =====
  const [industries, setIndustries] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // ===== Pinned Jobs state =====
  const [pinnedJobs, setPinnedJobs] = useState<PinnedJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const [jobResults, setJobResults] = useState<SearchedJob[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);

  // ===== Pinned Employers state =====
  const [employers, setEmployers] = useState<PinnedEmployer[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empSearch, setEmpSearch] = useState("");
  const [empResults, setEmpResults] = useState<CandidateEmployer[]>([]);
  const [empSearching, setEmpSearching] = useState(false);
  const [busyEmpKey, setBusyEmpKey] = useState<string | null>(null);

  // Load distinct industries via RPC (avoids PostgREST 1000-row cap that
  // would otherwise leave the dropdown showing only the few industries that
  // happen to appear in the first page of jobs).
  useEffect(() => {
    (async () => {
      const { data, error: e } = await supabase.rpc("get_live_job_counts_by_industry");
      if (e) {
        setError(e.message);
        return;
      }
      const set = new Set<string>();
      (data ?? []).forEach((r: any) => {
        if (r.industry && String(r.industry).trim()) {
          set.add(String(r.industry).trim().toLowerCase());
        }
      });
      const list = Array.from(set).sort();
      setIndustries(list);
      if (!industry && list.length) setIndustry(list[0]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Pinned Jobs: load currently featured =====
  const loadPinnedJobs = async () => {
    setJobsLoading(true);
    const { data, error: e } = await supabase
      .from("jobs")
      .select("id, title, company, industry, url, scraped_at")
      .eq("featured", true)
      .order("industry", { ascending: true })
      .order("scraped_at", { ascending: false });
    setJobsLoading(false);
    if (e) {
      setError(e.message);
      return;
    }
    setPinnedJobs((data ?? []) as PinnedJob[]);
  };

  useEffect(() => { if (tab === "jobs") loadPinnedJobs(); }, [tab]);

  const searchJobs = async () => {
    if (!jobSearch.trim() || !industry) return;
    setSearching(true);
    const term = `%${jobSearch.trim()}%`;
    const { data, error: e } = await supabase
      .from("jobs")
      .select("id, title, company, industry, url, scraped_at, featured")
      .ilike("industry", industry)
      .or(`title.ilike.${term},company.ilike.${term}`)
      .order("scraped_at", { ascending: false })
      .limit(20);
    setSearching(false);
    if (e) { setError(e.message); return; }
    setJobResults((data ?? []) as SearchedJob[]);
  };

  const togglePinJob = async (jobId: string, next: boolean) => {
    setBusyJobId(jobId);
    const { error: e } = await supabase
      .from("jobs")
      .update({ featured: next })
      .eq("id", jobId);
    setBusyJobId(null);
    if (e) { setError(e.message); return; }
    setJobResults((rows) => rows.map((r) => r.id === jobId ? { ...r, featured: next } : r));
    await loadPinnedJobs();
  };

  // ===== Pinned Employers (new pinned_industry_employers table) =====
  const loadEmployers = async () => {
    setEmpLoading(true);
    const { data, error: e } = await supabase
      .from("pinned_industry_employers")
      .select("id, industry, company_name, rank, tagline, url")
      .order("industry", { ascending: true })
      .order("rank", { ascending: true })
      .order("company_name", { ascending: true });
    setEmpLoading(false);
    if (e) { setError(e.message); return; }
    setEmployers((data ?? []) as PinnedEmployer[]);
  };

  useEffect(() => { if (tab === "employers") loadEmployers(); }, [tab]);

  // Search company names *that have jobs in our database* for the selected industry.
  // We aggregate distinct companies + job count, then mark which are already pinned.
  const searchEmployers = async () => {
    if (!empSearch.trim() || !industry) return;
    setEmpSearching(true);
    const term = `%${empSearch.trim()}%`;

    // 1) Pull jobs matching company ilike for this industry (limit big to dedupe in memory)
    const { data: jobsData, error: jErr } = await supabase
      .from("jobs")
      .select("company")
      .ilike("industry", industry)
      .ilike("company", term)
      .limit(2000);

    if (jErr) { setEmpSearching(false); setError(jErr.message); return; }

    const counts = new Map<string, number>();
    (jobsData ?? []).forEach((r: any) => {
      const name = (r.company ?? "").trim();
      if (!name) return;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });

    // 2) See which are already pinned for this industry
    const names = Array.from(counts.keys());
    let pinMap = new Map<string, string>();
    if (names.length) {
      const { data: pinned } = await supabase
        .from("pinned_industry_employers")
        .select("id, company_name")
        .ilike("industry", industry)
        .in("company_name", names);
      (pinned ?? []).forEach((p: any) => pinMap.set(p.company_name, p.id));
    }

    const candidates: CandidateEmployer[] = Array.from(counts.entries())
      .map(([name, n]) => ({
        company_name: name,
        job_count: n,
        industry,
        pin_id: pinMap.get(name),
      }))
      .sort((a, b) => b.job_count - a.job_count)
      .slice(0, 25);

    setEmpResults(candidates);
    setEmpSearching(false);
  };

  const pinEmployer = async (cand: CandidateEmployer) => {
    setBusyEmpKey(cand.company_name);
    // Insert at rank = (current max + 1) for that industry
    const { data: existing } = await supabase
      .from("pinned_industry_employers")
      .select("rank")
      .ilike("industry", cand.industry)
      .order("rank", { ascending: false })
      .limit(1);
    const nextRank = existing && existing.length ? (existing[0].rank ?? 0) + 1 : 0;

    const { data, error: e } = await supabase
      .from("pinned_industry_employers")
      .insert({
        industry: cand.industry,
        company_name: cand.company_name,
        rank: nextRank,
      })
      .select("id")
      .single();
    setBusyEmpKey(null);
    if (e) { setError(e.message); return; }
    setEmpResults((rows) =>
      rows.map((r) => r.company_name === cand.company_name ? { ...r, pin_id: data?.id } : r),
    );
    await loadEmployers();
  };

  const unpinEmployer = async (pinId: string, companyName?: string) => {
    setBusyEmpKey(pinId);
    const { error: e } = await supabase
      .from("pinned_industry_employers")
      .delete()
      .eq("id", pinId);
    setBusyEmpKey(null);
    if (e) { setError(e.message); return; }
    if (companyName) {
      setEmpResults((rows) =>
        rows.map((r) => r.company_name === companyName ? { ...r, pin_id: undefined } : r),
      );
    }
    await loadEmployers();
  };

  const bumpEmployerRank = async (pinId: string, delta: number) => {
    const target = employers.find((e) => e.id === pinId);
    if (!target) return;
    const next = Math.max(0, (target.rank ?? 0) + delta);
    setBusyEmpKey(pinId);
    const { error: e } = await supabase
      .from("pinned_industry_employers")
      .update({ rank: next })
      .eq("id", pinId);
    setBusyEmpKey(null);
    if (e) { setError(e.message); return; }
    await loadEmployers();
  };

  // ===== Group pinned items by industry for display =====
  const jobsByIndustry = useMemo(() => {
    const map = new Map<string, PinnedJob[]>();
    pinnedJobs.forEach((j) => {
      const key = (j.industry ?? "unspecified").toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(j);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [pinnedJobs]);

  const employersByIndustry = useMemo(() => {
    const map = new Map<string, PinnedEmployer[]>();
    employers.forEach((e) => {
      const key = (e.industry ?? "unspecified").toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [employers]);

  return (
    <div className="border-2 border-foreground rounded-2xl bg-primary/5 p-5 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Pin className="w-5 h-5" strokeWidth={3} />
        <h3 className="font-display uppercase tracking-wide text-base">Admin · Pin to top of industry</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Pinned items appear first on industry pages and the marketplace spotlight
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Pill active={tab === "jobs"} onClick={() => setTab("jobs")}>Pinned jobs</Pill>
        <Pill active={tab === "employers"} onClick={() => setTab("employers")}>Pinned employers</Pill>
      </div>

      {error && (
        <p className="text-xs text-destructive border-2 border-destructive rounded-lg p-2 bg-destructive/5">
          {error}
        </p>
      )}

      {/* ============================ JOBS TAB ============================ */}
      {tab === "jobs" && (
        <div className="space-y-4">
          <Section icon={Search} title="Find a job to pin" meta="Search by title or company within an industry">
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="border-2 border-foreground rounded-full px-3 py-1.5 bg-background text-xs font-bold uppercase tracking-wider"
              >
                {industries.map((s) => (
                  <option key={s} value={s}>{labelOf(s)}</option>
                ))}
              </select>
              <input
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") searchJobs(); }}
                placeholder="Job title or company…"
                className="flex-1 min-w-[200px] border-2 border-foreground rounded-full px-3 py-1.5 bg-background text-sm"
              />
              <button
                type="button"
                onClick={searchJobs}
                disabled={searching || !jobSearch.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground rounded-full bg-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/80 disabled:opacity-60"
              >
                {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                Search
              </button>
            </div>

            {jobResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {jobResults.map((j) => (
                  <div key={j.id} className="flex items-center gap-2 border border-foreground/20 rounded-lg p-2 bg-background">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{j.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {j.company} · {labelOf(j.industry ?? "")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePinJob(j.id, !j.featured)}
                      disabled={busyJobId === j.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 border-2 border-foreground rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        j.featured ? "bg-destructive/20 hover:bg-destructive/30" : "bg-primary hover:bg-primary/80"
                      } disabled:opacity-60`}
                    >
                      {busyJobId === j.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : j.featured ? (
                        <PinOff className="w-3 h-3" />
                      ) : (
                        <Pin className="w-3 h-3" />
                      )}
                      {j.featured ? "Unpin" : "Pin"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            icon={Briefcase}
            title="Currently pinned jobs"
            meta={`${pinnedJobs.length} pinned`}
          >
            {jobsLoading ? (
              <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading…
              </p>
            ) : pinnedJobs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No jobs pinned yet.</p>
            ) : (
              <div className="space-y-4">
                {jobsByIndustry.map(([ind, list]) => (
                  <div key={ind}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      {labelOf(ind)} - {list.length}
                    </div>
                    <div className="space-y-1.5">
                      {list.map((j) => (
                        <div key={j.id} className="flex items-center gap-2 border border-foreground/15 rounded-lg p-2 bg-background">
                          <Pin className="w-3 h-3 text-primary shrink-0" strokeWidth={3} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate">{j.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{j.company}</div>
                          </div>
                          <a
                            href={j.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hidden sm:inline"
                          >
                            View ↗
                          </a>
                          <button
                            type="button"
                            onClick={() => togglePinJob(j.id, false)}
                            disabled={busyJobId === j.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-foreground rounded-full bg-destructive/20 hover:bg-destructive/30 text-[10px] font-bold uppercase tracking-wider disabled:opacity-60"
                          >
                            {busyJobId === j.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <PinOff className="w-3 h-3" />
                            )}
                            Unpin
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* ============================ EMPLOYERS TAB ============================ */}
      {tab === "employers" && (
        <div className="space-y-4">
          <Section
            icon={Search}
            title="Find an employer to pin"
            meta="Searches every company that has jobs in this industry"
          >
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="border-2 border-foreground rounded-full px-3 py-1.5 bg-background text-xs font-bold uppercase tracking-wider"
              >
                {industries.map((s) => (
                  <option key={s} value={s}>{labelOf(s)}</option>
                ))}
              </select>
              <input
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") searchEmployers(); }}
                placeholder="Company name…"
                className="flex-1 min-w-[200px] border-2 border-foreground rounded-full px-3 py-1.5 bg-background text-sm"
              />
              <button
                type="button"
                onClick={searchEmployers}
                disabled={empSearching || !empSearch.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground rounded-full bg-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/80 disabled:opacity-60"
              >
                {empSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                Search
              </button>
            </div>

            {empResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {empResults.map((c) => (
                  <div key={c.company_name} className="flex items-center gap-2 border border-foreground/20 rounded-lg p-2 bg-background">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{c.company_name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {labelOf(c.industry)} · {c.job_count} live job{c.job_count === 1 ? "" : "s"}
                      </div>
                    </div>
                    {c.pin_id ? (
                      <button
                        type="button"
                        onClick={() => unpinEmployer(c.pin_id!, c.company_name)}
                        disabled={busyEmpKey === c.pin_id || busyEmpKey === c.company_name}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-foreground rounded-full bg-destructive/20 hover:bg-destructive/30 text-[10px] font-bold uppercase tracking-wider disabled:opacity-60"
                      >
                        {busyEmpKey === c.pin_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <PinOff className="w-3 h-3" />}
                        Unpin
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => pinEmployer(c)}
                        disabled={busyEmpKey === c.company_name}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-foreground rounded-full bg-primary hover:bg-primary/80 text-[10px] font-bold uppercase tracking-wider disabled:opacity-60"
                      >
                        {busyEmpKey === c.company_name ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pin className="w-3 h-3" />}
                        Pin
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section
            icon={Building2}
            title="Currently pinned employers"
            meta={`${employers.length} pinned · lower rank shows first`}
          >
            {empLoading ? (
              <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading…
              </p>
            ) : employers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No employers pinned yet.</p>
            ) : (
              <div className="space-y-4">
                {employersByIndustry.map(([ind, list]) => (
                  <div key={ind}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      {labelOf(ind)} - {list.length}
                    </div>
                    <div className="space-y-1.5">
                      {list.map((e) => (
                        <div key={e.id} className="flex items-center gap-2 border border-foreground/15 rounded-lg p-2 bg-background">
                          <Pin className="w-3 h-3 text-primary shrink-0" strokeWidth={3} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate">{e.company_name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              rank {e.rank}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => bumpEmployerRank(e.id, -1)}
                            disabled={busyEmpKey === e.id}
                            className="inline-flex items-center justify-center w-7 h-7 border-2 border-foreground rounded-full bg-background hover:bg-muted disabled:opacity-60"
                            aria-label="Move up"
                          >
                            <ArrowUp className="w-3 h-3" strokeWidth={3} />
                          </button>
                          <button
                            type="button"
                            onClick={() => bumpEmployerRank(e.id, 1)}
                            disabled={busyEmpKey === e.id}
                            className="inline-flex items-center justify-center w-7 h-7 border-2 border-foreground rounded-full bg-background hover:bg-muted disabled:opacity-60"
                            aria-label="Move down"
                          >
                            <ArrowDown className="w-3 h-3" strokeWidth={3} />
                          </button>
                          <button
                            type="button"
                            onClick={() => unpinEmployer(e.id)}
                            disabled={busyEmpKey === e.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-foreground rounded-full bg-destructive/20 hover:bg-destructive/30 text-[10px] font-bold uppercase tracking-wider disabled:opacity-60"
                          >
                            {busyEmpKey === e.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <PinOff className="w-3 h-3" />}
                            Unpin
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
};

export default AdminPinning;
