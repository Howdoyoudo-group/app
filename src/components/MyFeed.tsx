import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCached, setCached } from "@/lib/ttlCache";
import { Rss, Newspaper, BookOpen, Briefcase, Building2, Sparkles, ExternalLink, Play, Download, Pencil, Plus, X, Loader2, Search, CalendarDays, MapPin } from "lucide-react";
import { ReactNode } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import FeedCardJob from "./feed/FeedCardJob";
import FeedCardEmployer from "./feed/FeedCardEmployer";
import FeedCardVideo from "./feed/FeedCardVideo";
import FeedSaveButton from "./feed/FeedSaveButton";
import PublisherThumb from "./feed/PublisherThumb";
import { industryVideos } from "@/data/industry-videos";
import { INDUSTRIES } from "@/data/industries";
import IndustryDoodle from "./feed/IndustryDoodle";
import howdyMascot from "@/assets/howdy-mascot.png";

// Curated ordering for the industry picker - leads with the most universally
// loved, culture-driving industries and tails off with the more specialist ones.
const CHIP_ORDER: string[] = [
  "football", "cinema", "music", "fashion", "beauty", "coffee",
  "hospitality", "travel", "gaming", "influencing", "formula-1", "cars",
  "footwear", "jewellery", "grocery", "beer", "bakery", "interior-design",
  "wellness", "health", "estate-agency", "money", "journalism", "pets",
  "horse-racing", "farming", "teaching", "charity", "physiotherapy", "psychotherapy",
];
const CHIP_SLUGS: string[] = [
  ...CHIP_ORDER.filter(s => INDUSTRIES.some(i => i.slug === s)),
  ...INDUSTRIES.map(i => i.slug).filter(s => !CHIP_ORDER.includes(s)),
];

type NewsItem = { id: string; title: string; source: string; url: string; ts: string; industry: string };
type ArticleItem = NewsItem;
type JobItem = { id?: string; title: string; company: string; url: string; ts: string };
type EmployerItem = { companyName: string; tagline: string; logoUrl: string | null; url: string | null; industry: string };
type BriefingItem = {
  id: string; mainNews: string; people: string | null; takeaway: string | null;
  sourceLinks: { title?: string; url: string }[]; briefingDate: string; ts: string; industry: string;
};
type EventItem = {
  id: string; title: string; url: string; location: string | null;
  startsOn: string | null; dateLabel: string | null; eventType: string | null;
  description: string | null; organizer: string | null;
};

interface Props {
  industries: string[];
  targetCompanies?: string[];
}

const INDUSTRY_PATHS: Record<string, string> = {
  bakery: "/bakery", beauty: "/beauty", beer: "/beer", cars: "/cars",
  charity: "/charity", cinema: "/cinema", coffee: "/coffee",
  "estate-agency": "/estate-agency", farming: "/farming", fashion: "/fashion",
  football: "/football", footwear: "/footwear", "formula-1": "/formula-1",
  gaming: "/gaming", grocery: "/grocery", health: "/health",
  "horse-racing": "/horse-racing", hospitality: "/hospitality",
  influencing: "/influencing", "interior-design": "/interior-design",
  jewellery: "/jewellery", journalism: "/journalism", money: "/money",
  music: "/music", pets: "/pets", physiotherapy: "/physiotherapy",
  psychotherapy: "/psychotherapy", teaching: "/teaching", travel: "/travel",
  wellness: "/wellness",
};

const toSlug = (name: string) =>
  name.toLowerCase()
    .replace("film and tv", "cinema")
    .replace("food & drink", "hospitality")
    .replace(/\s+/g, "-");

const displayIndustry = (slug: string) => {
  const match = INDUSTRIES.find((i) => i.slug === slug);
  if (match) return match.name;
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const SECTION_TONES: Record<string, { bar: string; text: string }> = {
  News:                { bar: "bg-amber-500",   text: "text-white" },
  Articles:            { bar: "bg-blue-600",    text: "text-white" },
  Watch:               { bar: "bg-rose-600",    text: "text-white" },
  Jobs:                { bar: "bg-primary",     text: "text-foreground" },
  "Howdy Jobs":        { bar: "bg-primary",     text: "text-foreground" },
  "Featured Employer": { bar: "bg-primary",     text: "text-foreground" },
  "Who's Hiring":      { bar: "bg-emerald-600", text: "text-white" },
  Companies:           { bar: "bg-violet-600",  text: "text-white" },
  "Daily Digest":      { bar: "bg-amber-100",   text: "text-foreground" },
  Events:              { bar: "bg-fuchsia-600", text: "text-white" },
};

const SectionCard = ({
  icon: Icon,
  iconImage,
  title,
  count,
  children,
  empty,
  action,
}: {
  icon: typeof Newspaper;
  iconImage?: string;
  title: string;
  count?: number;
  empty?: string;
  children: ReactNode;
  action?: ReactNode;
}) => {
  return (
    <section className="mb-5 p-4 md:p-5 rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0_hsl(var(--foreground))]">
      <header className="flex items-end gap-3 mb-4">
        <div className="flex items-baseline gap-2 flex-1 min-w-0">
          {iconImage ? (
            <img src={iconImage} alt="" className="w-5 h-5 rounded-md object-cover translate-y-[3px]" />
          ) : (
            <Icon className="w-4 h-4 text-foreground/70 translate-y-[2px]" />
          )}
          <h2 className="font-display font-900 text-xl md:text-2xl leading-none text-foreground tracking-tight">
            {title}
          </h2>
          {typeof count === "number" && count > 0 && (
            <span className="font-display text-[11px] font-700 uppercase tracking-[0.14em] text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        {action}
      </header>
      <div>
        {!children || (Array.isArray(children) && children.length === 0) ? (
          <p className="font-body text-sm text-muted-foreground py-4">
            {empty || "Nothing new just yet."}
          </p>
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </div>
    </section>
  );
};



/** Compact ad-style employer card - one per company. */
const EmployerAd = ({ companyName, tagline, url }: EmployerItem) => {
  const inner = (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:border-foreground/30 hover:shadow-sm transition">
      <CompanyLogo company={companyName} size={40} rounded="md" />
      <div className="flex-1 min-w-0">
        <p className="font-display font-800 text-sm text-foreground leading-tight truncate">
          {companyName}
        </p>
        {tagline && (
          <p className="font-body text-[11px] text-muted-foreground truncate">{tagline}</p>
        )}
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    </div>
  );
  if (url) {
    return <a href={url} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>;
  }
  // Fallback: link to the marketplace filtered by this company so the card always goes somewhere.
  return (
    <Link to={`/marketplace?company=${encodeURIComponent(companyName)}`} className="block">
      {inner}
    </Link>
  );
};

/** Newsletter-style briefing panel - collapsible: first paragraph visible, rest expands. */
const BriefingPanel = ({ briefing }: { briefing: BriefingItem }) => {
  const path = INDUSTRY_PATHS[briefing.industry] || `/${briefing.industry}`;
  const [expanded, setExpanded] = useState(false);

  const main = briefing.mainNews || "";
  const splitIdx = main.search(/\n\s*\n/);
  const firstPara = splitIdx > 0 ? main.slice(0, splitIdx).trim() : main;
  const restMain = splitIdx > 0 ? main.slice(splitIdx).trim() : "";
  const hasMore = Boolean(
    restMain || briefing.people || briefing.takeaway ||
    (briefing.sourceLinks && briefing.sourceLinks.length > 0),
  );

  return (
    <article className="bg-background border border-foreground/10 rounded-2xl p-5 md:p-6">
      <h3 className="font-display font-900 text-xl md:text-2xl text-foreground leading-tight mb-4">
        {displayIndustry(briefing.industry)}<span className="text-primary">.</span>
      </h3>

      <div className="space-y-5">
        {firstPara && (
          <div>
            <h4 className="font-display text-[11px] font-700 uppercase tracking-[0.18em] text-foreground/60 mb-2">
              Main news
            </h4>
            <p className="font-body text-[15px] text-foreground leading-relaxed whitespace-pre-line">
              {firstPara}
            </p>
          </div>
        )}

        {expanded && restMain && (
          <p className="font-body text-[15px] text-foreground leading-relaxed whitespace-pre-line">
            {restMain}
          </p>
        )}

        {expanded && briefing.people && (
          <div>
            <h4 className="font-display text-[11px] font-700 uppercase tracking-[0.18em] text-foreground/60 mb-2">
              People
            </h4>
            <p className="font-body text-[15px] text-foreground leading-relaxed whitespace-pre-line">
              {briefing.people}
            </p>
          </div>
        )}

        {expanded && briefing.takeaway && (
          <div className="bg-primary/10 border-l-4 border-primary px-4 py-3 rounded-r-xl">
            <h4 className="font-display text-[11px] font-700 uppercase tracking-[0.18em] text-primary mb-1">
              Takeaway
            </h4>
            <p className="font-body text-[14px] text-foreground leading-relaxed">
              {briefing.takeaway}
            </p>
          </div>
        )}

        {expanded && briefing.sourceLinks && briefing.sourceLinks.length > 0 && (
          <div>
            <h4 className="font-display text-[11px] font-700 uppercase tracking-[0.18em] text-foreground/60 mb-2">
              Sources
            </h4>
            <ul className="space-y-1.5">
              {briefing.sourceLinks.slice(0, 6).map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="font-body text-[13px] text-primary hover:underline inline-flex items-center gap-1">
                    {s.title || s.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4 flex-wrap">
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-1.5 font-display text-xs font-700 uppercase tracking-wider text-foreground hover:text-primary transition-colors"
          >
            {expanded ? "Show less ↑" : "Read more ↓"}
          </button>
        )}
        <Link to={path}
          className="inline-flex items-center gap-1.5 font-display text-xs font-700 uppercase tracking-wider text-primary hover:underline">
          Open {displayIndustry(briefing.industry)} →
        </Link>
      </div>
    </article>
  );
};

type PinnedRow = { id: string; company_name: string; rank: number };

const CompanyAdminEditor = ({
  industry,
  onChanged,
  onClose,
}: {
  industry: string;
  onChanged: () => void;
  onClose: () => void;
}) => {
  const [pinned, setPinned] = useState<PinnedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ name: string; n: number; pinId?: string; otherIndustry?: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pinned_industry_employers")
      .select("id, company_name, rank")
      .eq("industry", industry)
      .order("rank", { ascending: true });
    setPinned((data || []) as PinnedRow[]);
    setLoading(false);
  }, [industry]);

  useEffect(() => { load(); }, [load]);

  const doSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setError(null);
    const term = `%${search.trim()}%`;

    // First: in-industry matches
    const { data: inIndustry } = await supabase
      .from("jobs")
      .select("company")
      .eq("industry", industry)
      .ilike("company", term)
      .limit(500);
    const counts = new Map<string, number>();
    (inIndustry || []).forEach((r: any) => {
      const n = (r.company || "").trim();
      if (!n) return;
      counts.set(n, (counts.get(n) || 0) + 1);
    });

    // Second: cross-industry matches so we can still surface the company.
    const { data: anyIndustry } = await supabase
      .from("jobs")
      .select("company, industry")
      .ilike("company", term)
      .limit(500);
    const otherInd = new Map<string, string>();
    (anyIndustry || []).forEach((r: any) => {
      const n = (r.company || "").trim();
      if (!n || counts.has(n)) return;
      counts.set(n, 0);
      if (r.industry) otherInd.set(n, r.industry);
    });

    const names = Array.from(counts.keys());
    const pinMap = new Map<string, string>();
    if (names.length) {
      const { data: existing } = await supabase
        .from("pinned_industry_employers")
        .select("id, company_name")
        .eq("industry", industry)
        .in("company_name", names);
      (existing || []).forEach((p: any) => pinMap.set(p.company_name, p.id));
    }
    setResults(
      Array.from(counts.entries())
        .map(([name, n]) => ({ name, n, pinId: pinMap.get(name), otherIndustry: otherInd.get(name) }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 20)
    );
    setSearching(false);
  };

  const addCompany = async (name: string) => {
    setBusy(name);
    setError(null);
    const nextRank = pinned.length ? Math.max(...pinned.map(p => p.rank ?? 0)) + 1 : 0;
    const { error: insertError } = await supabase.from("pinned_industry_employers").insert({
      industry, company_name: name, rank: nextRank,
    });
    setBusy(null);
    if (insertError) {
      setError(insertError.message || "Could not add company.");
      return;
    }
    await load();
    onChanged();
    setResults(rs => rs.map(r => r.name === name ? { ...r, pinId: "new" } : r));
  };

  const removeCompany = async (id: string) => {
    setBusy(id);
    setError(null);
    const { error: delError } = await supabase.from("pinned_industry_employers").delete().eq("id", id);
    setBusy(null);
    if (delError) {
      setError(delError.message || "Could not remove company.");
      return;
    }
    await load();
    onChanged();
  };

  const trimmed = search.trim();
  const exactExists = results.some(r => r.name.toLowerCase() === trimmed.toLowerCase());


  return (
    <div className="mb-4 border-2 border-violet-600/40 rounded-2xl bg-violet-50 dark:bg-violet-950/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-[11px] font-700 uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
          Edit companies for {displayIndustry(industry)}
        </p>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-foreground/10" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <p className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-1.5">
          Currently curated ({pinned.length})
        </p>
        {loading ? (
          <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading…
          </p>
        ) : pinned.length === 0 ? (
          <p className="text-xs text-muted-foreground">None yet - search below to add some.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {pinned.map(p => (
              <span key={p.id}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-card border border-border rounded-full text-xs">
                {p.company_name}
                <button
                  onClick={() => removeCompany(p.id)}
                  disabled={busy === p.id}
                  className="p-0.5 rounded-full hover:bg-destructive/15 text-destructive disabled:opacity-50"
                  aria-label="Remove"
                >
                  {busy === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-1.5">
          Add a company (searches live jobs in this industry)
        </p>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }}
            placeholder="Company name…"
            className="flex-1 border border-border rounded-full px-3 py-1.5 bg-background text-sm"
          />
          <button
            onClick={doSearch}
            disabled={searching || !search.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-full text-[11px] font-700 uppercase tracking-wider disabled:opacity-50"
          >
            {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
            Search
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
        {!searching && trimmed && !exactExists && (
          <div className="mt-2 flex items-center gap-2 bg-card border border-dashed border-border rounded-lg px-2.5 py-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-600 truncate">Add "{trimmed}" as a new company</p>
              <p className="text-[10px] text-muted-foreground">No live jobs required — we'll still curate news on them.</p>
            </div>
            <button
              onClick={() => addCompany(trimmed)}
              disabled={busy === trimmed}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-foreground rounded-full text-[10px] font-700 uppercase tracking-wider disabled:opacity-50"
            >
              {busy === trimmed ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Add
            </button>
          </div>
        )}
        {results.length > 0 && (
          <div className="mt-2 space-y-1 max-h-56 overflow-y-auto">
            {results.map(r => (
              <div key={r.name} className="flex items-center gap-2 bg-card border border-border rounded-lg px-2.5 py-1.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 truncate">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {r.n > 0
                      ? `${r.n} live ${r.n === 1 ? "job" : "jobs"} in ${displayIndustry(industry)}`
                      : r.otherIndustry
                        ? `No live jobs in ${displayIndustry(industry)} - currently active in ${displayIndustry(r.otherIndustry)}`
                        : "No live jobs"}
                  </p>
                </div>
                {r.pinId ? (
                  <span className="text-[10px] font-700 uppercase tracking-wider text-muted-foreground px-2">Added</span>
                ) : (
                  <button
                    onClick={() => addCompany(r.name)}
                    disabled={busy === r.name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-foreground rounded-full text-[10px] font-700 uppercase tracking-wider disabled:opacity-50"
                  >
                    {busy === r.name ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

const MyFeed = ({ industries, targetCompanies = [] }: Props) => {
  const validSlugs = new Set(INDUSTRIES.map((i) => i.slug));
  // Filter out anything that isn't a real industry (e.g. leftover passions
  // like "Tennis" stored in industry_interests from earlier onboarding).
  const allSlugs = industries.map(toSlug).filter((s) => validSlugs.has(s));
  const [activeSlug, setActiveSlug] = useState<string>(allSlugs[0] || "");
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [jobCount, setJobCount] = useState(0);
  const [employers, setEmployers] = useState<EmployerItem[]>([]);
  const [briefing, setBriefing] = useState<BriefingItem | null>(null);
  const [companyNews, setCompanyNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [knownCompanies, setKnownCompanies] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCompanies, setEditingCompanies] = useState(false);
  const [videoWindow, setVideoWindow] = useState<"week" | "month">("week");
  const [dynamicVideos, setDynamicVideos] = useState<Array<{ youtubeId: string; title: string; channel: string | null; durationSeconds: number | null; publishedAt: string | null; }>>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", user.id);
      setIsAdmin((roles || []).some((r: any) => r.role === "admin"));
    })();
  }, []);

  useEffect(() => {
    if (allSlugs.length > 0 && (!activeSlug || !validSlugs.has(activeSlug))) {
      setActiveSlug(allSlugs[0]);
    }
  }, [allSlugs.join(","), activeSlug, validSlugs]);

  // Cache key includes industry + user's target-companies list, since those
  // affect which company stories surface. 5 min stale window — enough to make
  // tab-switching instant while staying fresh.
  const FEED_TTL = 5 * 60 * 1000;
  const cacheKeyFor = useCallback(
    (slug: string) => `myfeed:${slug}:${targetCompanies.slice().sort().join("|")}`,
    [targetCompanies],
  );

  type FeedSnapshot = {
    briefing: BriefingItem | null;
    companyNews: NewsItem[];
    news: NewsItem[];
    articles: ArticleItem[];
    jobs: JobItem[];
    jobCount: number;
    employers: EmployerItem[];
    knownCompanies: string[];
  };

  const applySnapshot = useCallback((snap: FeedSnapshot) => {
    setBriefing(snap.briefing);
    setCompanyNews(snap.companyNews);
    setNews(snap.news);
    setArticles(snap.articles);
    setJobs(snap.jobs);
    setJobCount(snap.jobCount);
    setEmployers(snap.employers);
    setKnownCompanies(snap.knownCompanies);
  }, []);

  const fetchAll = useCallback(async (slug: string) => {
    if (!slug) { setLoading(false); return; }

    // Cache hit: paint instantly, then keep going in the background to revalidate.
    const cacheKey = cacheKeyFor(slug);
    const cached = getCached<FeedSnapshot>(cacheKey, FEED_TTL);
    if (cached) {
      applySnapshot(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const nowIso = new Date().toISOString();
    const cutoff30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();


    // 1) Pull the admin-curated companies for this industry FIRST so we can use
    //    them to filter Company News and to detect logos for headlines.
    //    In parallel, pull the top live-job employers in this industry so we
    //    have a real-world fallback list when no admin curation exists — this
    //    prevents Companies feed from collapsing to a single user-favourite
    //    (e.g. Spotify-only on Music).
    const [pinnedRes, jobCompaniesRes] = await Promise.all([
      supabase.from("pinned_industry_employers")
        .select("company_name, tagline, logo_url, url, industry, rank")
        .eq("industry", slug)
        .order("rank", { ascending: true })
        .limit(20),
      supabase.from("jobs")
        .select("company")
        .eq("industry", slug)
        .not("expires_at", "is", null).gte("expires_at", nowIso)
        .limit(500),
    ]);

    const curatedNames: string[] = (pinnedRes.data || [])
      .map((p: any) => p.company_name).filter(Boolean);

    // Top live-job employers ranked by posting volume (fallback pool).
    const jobCompanyCounts = new Map<string, { name: string; n: number }>();
    (jobCompaniesRes.data || []).forEach((r: any) => {
      const name = (r.company || "").trim();
      if (!name) return;
      const key = name.toLowerCase();
      const cur = jobCompanyCounts.get(key);
      if (cur) cur.n += 1; else jobCompanyCounts.set(key, { name, n: 1 });
    });
    const topJobCompanyNames = Array.from(jobCompanyCounts.values())
      .sort((a, b) => b.n - a.n)
      .slice(0, 15)
      .map(c => c.name);

    // Priority map: the user's own target ("most wanted") companies come first,
    // then admin-curated "Who's Hiring" employers in pinned order, then top
    // live-job employers as a fallback so every industry has variety.
    const companyPriority = new Map<string, number>();
    targetCompanies.forEach((c, i) => {
      const key = (c || "").toLowerCase().trim();
      if (key) companyPriority.set(key, i);
    });
    curatedNames.forEach((c, i) => {
      const key = c.toLowerCase().trim();
      if (!companyPriority.has(key)) companyPriority.set(key, 1000 + i);
    });
    topJobCompanyNames.forEach((c, i) => {
      const key = c.toLowerCase().trim();
      if (!companyPriority.has(key)) companyPriority.set(key, 2000 + i);
    });

    // Combine into the search filter pool.
    const allFilterCompanies = Array.from(new Set([
      ...curatedNames,
      ...targetCompanies,
      ...topJobCompanyNames,
    ]));

    // PostgREST `or=(...)` chokes on commas, parens, slashes and quotes inside
    // values. Strip those, then drop any name that no longer looks searchable.
    const safeFilterCompanies = allFilterCompanies
      .map(c => c.replace(/[(),/"']/g, " ").replace(/\s+/g, " ").trim())
      .filter(c => c.length >= 2 && /[A-Za-z0-9]/.test(c))
      .slice(0, 40); // cap or= clause length

    const companyFilter = safeFilterCompanies.length > 0
      ? safeFilterCompanies.map(c => {
          if (c.length <= 4) return `title.ilike.% ${c} %,title.ilike.${c} %,title.ilike.% ${c}`;
          return `title.ilike.%${c}%`;
        }).join(",")
      : null;

    const [briefingRes, newsRes, articlesRes, jobsRes, jobsCountRes, companyNewsRes, companyArticlesRes, topJobCompaniesRes] = await Promise.all([
      supabase.from("daily_briefings")
        .select("id, industry, main_news, people, takeaway, source_links, briefing_date, generated_at")
        .eq("industry", slug)
        .order("briefing_date", { ascending: false })
        .order("generated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("breaking_news")
        .select("id, title, source, url, fetched_at, industry")
        .eq("industry", slug)
        .gte("fetched_at", cutoff30d)
        .order("fetched_at", { ascending: false }).limit(20),
      supabase.from("articles")
        .select("id, title, source, url, scraped_at, industry")
        .eq("industry", slug)
        .order("scraped_at", { ascending: false }).limit(40),
      // Pull a wider window so we can dedupe by company and still have variety.
      supabase.from("jobs")
        .select("id, title, company, url, scraped_at")
        .eq("industry", slug)
        .not("expires_at", "is", null).gte("expires_at", nowIso)
        .order("scraped_at", { ascending: false }).limit(60),
      supabase.from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("industry", slug)
        .not("expires_at", "is", null).gte("expires_at", nowIso),
      // Companies feed: only items fetched in the last 30 days so we never
      // surface stale stories. Pull a generous pool so we can rank + dedupe
      // client-side.
      companyFilter
        ? supabase.from("breaking_news")
            .select("id, title, source, url, fetched_at, industry")
            .eq("industry", slug)
            .gte("fetched_at", cutoff30d)
            .or(companyFilter)
            .order("fetched_at", { ascending: false }).limit(40)
        : Promise.resolve({ data: [] as any[] }),
      companyFilter
        ? supabase.from("articles")
            .select("id, title, source, url, scraped_at, industry")
            .eq("industry", slug)
            .gte("scraped_at", cutoff30d)
            .or(companyFilter)
            .order("scraped_at", { ascending: false }).limit(20)
        : Promise.resolve({ data: [] as any[] }),
      // Reuse the live-job employer pool we already fetched above as the
      // Who's Hiring fallback when no admin-curated employers exist.
      Promise.resolve({ data: jobCompaniesRes.data || [] }),
    ]);

    const seenNewsIds = new Set<string>();

    const newBriefing: BriefingItem | null = briefingRes.data && briefingRes.data.main_news ? {
      id: briefingRes.data.id,
      mainNews: briefingRes.data.main_news,
      people: briefingRes.data.people || null,
      takeaway: briefingRes.data.takeaway || null,
      sourceLinks: Array.isArray(briefingRes.data.source_links) ? briefingRes.data.source_links as any[] : [],
      briefingDate: briefingRes.data.briefing_date,
      ts: briefingRes.data.generated_at,
      industry: briefingRes.data.industry,
    } : null;
    setBriefing(newBriefing);

    // Word-boundary match so "Apple" doesn't match "Pineapple" etc.
    const matchesCompanyWord = (title: string, name: string): boolean => {
      if (!title || !name) return false;
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?:^|[\\s,;:!?("'\\-])${escaped}(?:[\\s,;:!?.'")\\-]|$|'s)`, "i").test(title);
    };

    // Story fingerprint: first 4 meaningful words. Mirrors backend dedupe so
    // the same story syndicated across publishers only appears once.
    const FEED_STOPWORDS = new Set([
      "the","a","an","of","in","on","for","to","and","or","with","at","by","from",
      "is","are","was","were","be","been","as","it","its","this","that","amid",
      "after","over","up","down","new","uk","us","plc",
    ]);
    const storyFingerprint = (title: string) => title
      .toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter(t => t && !FEED_STOPWORDS.has(t)).slice(0, 4).join(" ");

    const scoreTitle = (title: string): number => {
      let best = 9999;
      for (const [name, prio] of companyPriority) {
        if (name.length < 2) continue;
        if (matchesCompanyWord(title, name) && prio < best) best = prio;
      }
      return best;
    };

    type ScoredNews = NewsItem & { _priority: number; _fp: string };
    const rawCompanyItems: ScoredNews[] = [];

    (companyNewsRes.data || []).forEach((n: any) => {
      if (seenNewsIds.has(n.id)) return;
      const prio = scoreTitle(n.title || "");
      // Drop noise: SQL ILIKE can match substrings (e.g. brand inside a
      // longer word). Require a real word-boundary hit on a prioritised
      // company before showing the headline.
      if (prio === 9999) return;
      seenNewsIds.add(n.id);
      rawCompanyItems.push({
        id: n.id, title: n.title, source: n.source, url: n.url,
        ts: n.fetched_at, industry: n.industry,
        _priority: prio, _fp: storyFingerprint(n.title || ""),
      });
    });
    (companyArticlesRes.data || []).forEach((a: any) => {
      if (seenNewsIds.has(a.id)) return;
      const prio = scoreTitle(a.title || "");
      if (prio === 9999) return;
      seenNewsIds.add(a.id);
      rawCompanyItems.push({
        id: a.id, title: a.title, source: a.source, url: a.url,
        ts: a.scraped_at, industry: a.industry,
        _priority: prio, _fp: storyFingerprint(a.title || ""),
      });
    });

    // Sort: most-wanted user companies first, then bigger curated employers in
    // pin order, then freshest within each tier.
    rawCompanyItems.sort((a, b) => {
      if (a._priority !== b._priority) return a._priority - b._priority;
      return new Date(b.ts).getTime() - new Date(a.ts).getTime();
    });
    // Dedupe by story fingerprint (keeps highest-priority/freshest version).
    const seenFp = new Set<string>();
    const cNews: NewsItem[] = [];
    for (const item of rawCompanyItems) {
      if (item._fp && seenFp.has(item._fp)) continue;
      if (item._fp) seenFp.add(item._fp);
      cNews.push({
        id: item.id, title: item.title, source: item.source, url: item.url,
        ts: item.ts, industry: item.industry,
      });
      if (cNews.length >= 10) break;
    }
    setCompanyNews(cNews);

    const newNews = (newsRes.data || [])
      .filter((n: any) => !seenNewsIds.has(n.id) && !/companies/i.test(n.source || ""))
      .map((n: any) => ({ id: n.id, title: n.title, source: n.source, url: n.url, ts: n.fetched_at, industry: n.industry }));
    setNews(newNews);

    const ANALYSIS_RX = /\b(analysis|analyses|deep[- ]dive|long[- ]read|market\s+(report|outlook|analysis|landscape)|industry\s+(report|outlook|analysis|landscape|insight)|annual\s+report|state\s+of\s+(the\s+)?(industry|market|play|art|nation)|outlook\s+20\d{2}|20\d{2}\s+outlook|forecast\s+20\d{2}|whitepaper|white\s+paper|research\s+report|the\s+rise\s+of|the\s+future\s+of|the\s+state\s+of|the\s+economics\s+of|the\s+business\s+of|the\s+making\s+of|why\s+(the|now|are|is|do|does|we|your)|how\s+(to|the|i|we|brands?|companies)|what('?s|\s+is)\s+(next|behind|driving)|playbook|case\s+study|landscape|explainer|explained:|behind\s+the|inside\s+the)\b/i;
    const ANALYTIC_SOURCE_RX = /(mckinsey|bcg\.com|bain\.com|deloitte|pwc|kpmg|economist\.com|ft\.com|financial\s+times|harvard\s+business|hbr\.org|forrester|gartner|statista|nielsen|euromonitor|mintel|ibisworld|insider\s+intelligence|emarketer|breakingviews|bloomberg\s+opinion|the\s+conversation|substack|medium\.com|stratechery|sifted|the\s+drum|business\s+of\s+fashion|businessoffashion)/i;
    // Reject aggregator/search URLs - those land on a headline listing, not the article itself.
    const AGGREGATOR_URL_RX = /^https?:\/\/(?:[a-z0-9-]+\.)*(?:news\.google\.com|google\.[a-z.]+|news\.yahoo\.com|yahoo\.com|msn\.com|bing\.com|apple\.news|flipboard\.com|smartnews\.com|duckduckgo\.com|feedly\.com|t\.co|lnkd\.in|bit\.ly|tinyurl\.com)\b/i;
    const AGGREGATOR_PATH_RX = /\/(search|results|topic|topics|tag|tags|category|categories|section|sections)(\/|$)|[?&](q|query)=/i;
    const newArticles = (articlesRes.data || [])
      .filter((a: any) => !!a.url && !AGGREGATOR_URL_RX.test(a.url) && !AGGREGATOR_PATH_RX.test(a.url))
      .filter((a: any) => ANALYSIS_RX.test(a.title || "") || ANALYTIC_SOURCE_RX.test(a.source || ""))
      .slice(0, 8)
      .map((a: any) => ({
        id: a.id, title: a.title, source: a.source, url: a.url, ts: a.scraped_at, industry: a.industry,
      }));
    setArticles(newArticles);

    // Job variety: dedupe by company so one employer can't dominate the feed.
    const seenJobCompanies = new Set<string>();
    const variedJobs: JobItem[] = [];
    for (const j of (jobsRes.data || []) as any[]) {
      const key = (j.company || "").toLowerCase().trim();
      if (!key || seenJobCompanies.has(key)) continue;
      seenJobCompanies.add(key);
      variedJobs.push({ id: j.id, title: j.title, company: j.company, url: j.url, ts: j.scraped_at });
      if (variedJobs.length >= 6) break;
    }
    setJobs(variedJobs);
    setJobCount(jobsCountRes.count || 0);

    // Who's Hiring: prefer admin-curated. Fall back to top job-posting employers
    // for industries that haven't been curated yet.
    const seenEmps = new Set<string>();
    const emps: EmployerItem[] = [];
    (pinnedRes.data || []).forEach((e: any) => {
      const key = e.company_name.toLowerCase().trim();
      if (seenEmps.has(key)) return;
      seenEmps.add(key);
      emps.push({
        companyName: e.company_name, tagline: e.tagline || "",
        logoUrl: e.logo_url, url: e.url, industry: e.industry,
      });
    });
    if (emps.length === 0 && (topJobCompaniesRes.data || []).length > 0) {
      const counts = new Map<string, { name: string; n: number }>();
      (topJobCompaniesRes.data as any[]).forEach((r) => {
        const name = (r.company || "").trim();
        if (!name) return;
        const key = name.toLowerCase();
        const cur = counts.get(key);
        if (cur) cur.n += 1; else counts.set(key, { name, n: 1 });
      });
      Array.from(counts.values())
        .sort((a, b) => b.n - a.n)
        .slice(0, 8)
        .forEach((c) => emps.push({
          companyName: c.name, tagline: `${c.n} live ${c.n === 1 ? "job" : "jobs"}`,
          logoUrl: null, url: null, industry: slug,
        }));
    }
    const knownCompanyNames = emps.map((e) => e.companyName);
    setEmployers(emps);
    setKnownCompanies(knownCompanyNames);

    // Cache the fully-derived snapshot so the next visit paints instantly.
    setCached<FeedSnapshot>(cacheKey, {
      briefing: newBriefing,
      companyNews: cNews,
      news: newNews,
      articles: newArticles,
      jobs: variedJobs,
      jobCount: jobsCountRes.count || 0,
      employers: emps,
      knownCompanies: knownCompanyNames,
    });

    setLoading(false);
  }, [targetCompanies.join(","), applySnapshot, cacheKeyFor]);

  useEffect(() => { fetchAll(activeSlug); }, [activeSlug, fetchAll]);

  // Fetch fresh videos for the active industry + window (week/month). Stored
  // by `fetch-industry-videos` edge function on a weekly cron.
  useEffect(() => {
    let cancelled = false;
    if (!activeSlug) return;

    type Vid = { youtubeId: string; title: string; channel: string | null; durationSeconds: number | null; publishedAt: string | null };
    const vidKey = `myfeed-videos:${activeSlug}:${videoWindow}`;
    // Videos are refreshed weekly on a cron — 1h cache is fine.
    const cachedVids = getCached<Vid[]>(vidKey, 60 * 60 * 1000);
    if (cachedVids) {
      setDynamicVideos(cachedVids);
      setVideosLoading(false);
    } else {
      setDynamicVideos([]);
      setVideosLoading(true);
    }

    (async () => {
      const cutoffDays = videoWindow === "week" ? 8 : 35;
      const cutoff = new Date(Date.now() - cutoffDays * 86400 * 1000).toISOString();
      const { data } = await supabase
        .from("industry_videos")
        .select("youtube_id, title, channel, duration_seconds, published_at, fetched_at")
        .eq("industry", activeSlug)
        .eq("window_tag", videoWindow)
        .gte("fetched_at", cutoff)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(6);
      if (cancelled) return;
      const vids: Vid[] = (data || []).map((r: any) => ({
        youtubeId: r.youtube_id,
        title: r.title,
        channel: r.channel,
        durationSeconds: r.duration_seconds,
        publishedAt: r.published_at,
      }));
      setDynamicVideos(vids);
      setCached(vidKey, vids);
      setVideosLoading(false);
    })();
    return () => { cancelled = true; };
  }, [activeSlug, videoWindow]);


  // Upcoming events for the active industry. Sourced from `industry_events`,
  // refreshed weekly by the `fetch-industry-events` edge function.
  useEffect(() => {
    let cancelled = false;
    if (!activeSlug) { setEvents([]); return; }

    const evKey = `myfeed-events:${activeSlug}`;
    // Events refresh weekly — 1h cache is fine.
    const cachedEv = getCached<EventItem[]>(evKey, 60 * 60 * 1000);
    if (cachedEv) setEvents(cachedEv);

    (async () => {
      const todayIso = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("industry_events")
        .select("id, title, url, location, starts_on, date_label, event_type, description, organizer")
        .eq("industry", activeSlug)
        .or(`starts_on.gte.${todayIso},starts_on.is.null`)
        .order("starts_on", { ascending: true, nullsFirst: false })
        .limit(8);
      if (cancelled) return;
      const evs: EventItem[] = (data || []).map((r: any) => ({
        id: r.id, title: r.title, url: r.url, location: r.location,
        startsOn: r.starts_on, dateLabel: r.date_label, eventType: r.event_type,
        description: r.description, organizer: r.organizer,
      }));
      setEvents(evs);
      setCached(evKey, evs);
    })();
    return () => { cancelled = true; };
  }, [activeSlug]);

  if (industries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Rss className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-display font-800 text-lg text-foreground mb-2">
          Your feed is empty<span className="text-primary">.</span>
        </h3>
        <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto">
          Select your industries in the <span className="font-600 text-foreground">Profile</span> tab to personalise your feed.
        </p>
      </div>
    );
  }

  // Best-effort: detect a known/known-brand company in a headline so we can render its logo.
  const KNOWN_BRAND_RX = /\b(Cartier|Tiffany|De Beers|Signet|Pandora|Swarovski|TUI|easyJet|Jet2|British Airways|Ryanair|Nike|Adidas|Puma|Burberry|ASOS|Zara|H&M|Primark|M&S|Marks & Spencer|John Lewis|Waitrose|Tesco|Sainsbury'?s?|Aldi|Lidl|Asda|Morrisons|Costa|Starbucks|Pret|Greggs|Nando'?s?|McDonald'?s?|KFC|Netflix|Amazon|Disney|Sky|BBC|ITV|Channel 4|Sony|Microsoft|Apple|Google|Meta|Samsung|Diageo|Heineken|BrewDog|Guinness|Ocado|Deliveroo|Uber|Savills|Rightmove|Zoopla|Foxtons|Knight Frank|JLL|Bupa|Boots|Superdrug|L'?Oréal|Estée Lauder|Unilever|P&G|Dyson|LEGO|Ferrari|McLaren|Mercedes|BMW|Audi|Porsche|Land Rover|Jaguar|Rolls.?Royce|Bentley|Dr\.? Martens|New Balance|Converse|Vans|Skechers|Timberland|UGG|Crocs|Birkenstock|Instacart|Gail'?s|Gymshark|Lululemon|PureGym|Soho House|Everyman|Spotify|Premier League|Arsenal|Chelsea|Tottenham|Liverpool|Manchester (?:City|United))\b/i;

  const detectCompany = (title: string): string | null => {
    if (!title) return null;
    // 1) Try project's curated/known companies for this industry first.
    if (knownCompanies.length) {
      const sorted = [...knownCompanies].sort((a, b) => b.length - a.length);
      const t = title.toLowerCase();
      for (const name of sorted) {
        const n = name.toLowerCase();
        if (n.length < 3) continue;
        if (t.includes(n)) return name;
      }
    }
    // 2) Fall back to a global well-known brand regex so big names always get a logo.
    const m = title.match(KNOWN_BRAND_RX);
    if (m) return m[1];
    return null;
  };


  const featuredEmployer = employers[0] || null;
  const otherEmployers = employers.slice(1);

  const orderedChipSlugs = (() => {
    const seen = new Set<string>();
    const out: string[] = [];
    // 1. User's own selected industries first (in their saved order)
    for (const s of allSlugs) {
      if (validSlugs.has(s) && !seen.has(s)) { out.push(s); seen.add(s); }
    }
    // 2. Then the rest in CHIP_ORDER
    for (const s of CHIP_SLUGS) {
      if (!seen.has(s)) { out.push(s); seen.add(s); }
    }
    return out;
  })();

  const industryChips = (
    <div className="bg-background rounded-2xl border-2 border-foreground/10 shadow-sm px-4 py-3">
    <div className="flex gap-3 overflow-x-auto pt-1 pb-1 px-1 scrollbar-hide snap-x">
      {orderedChipSlugs.map(slug => {
        const active = activeSlug === slug;
        return (
          <button
            key={slug}
            onClick={() => setActiveSlug(slug)}
            className="shrink-0 snap-start flex flex-col items-center gap-1.5 w-[72px] focus:outline-none group"
            aria-pressed={active}
            aria-label={displayIndustry(slug)}
          >
            <span
              className={`relative inline-flex items-center justify-center rounded-full transition-all ${
                active
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "opacity-80 group-hover:opacity-100"
              }`}
              style={{ width: 56, height: 56 }}
            >
              <IndustryDoodle industry={slug} size={56} />
            </span>
            <span
              className={`font-display font-700 text-[9px] uppercase tracking-[0.06em] text-center leading-[1.15] break-words hyphens-auto w-full px-0.5 ${
                active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {displayIndustry(slug)}
            </span>
          </button>
        );
      })}
    </div>
    </div>
  );




  return (
    <div className="space-y-5">


      {industryChips}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm animate-pulse">
              <div className="h-4 w-32 bg-muted rounded mb-3" />
              <div className="h-3 w-full bg-muted rounded mb-2" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {briefing && (
            <SectionCard
              icon={Sparkles}
              title="Daily Digest"
              action={
                <span className="font-display text-[10px] font-700 uppercase tracking-[0.14em] opacity-80 whitespace-nowrap">
                  {new Date(briefing.briefingDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                </span>
              }
              empty="No recent briefing yet - check back soon."
            >
              <BriefingPanel briefing={briefing} />
            </SectionCard>
          )}

          {(news.length > 0 || articles.length > 0) && (
            <SectionCard icon={Newspaper} title="News" count={news.length}
              empty="No fresh headlines yet today.">
              <ul className="divide-y divide-border/60">
                {news.slice(0, 8).map(n => {
                  const co = detectCompany(n.title);
                  return (
                    <li key={n.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      {co
                        ? <CompanyLogo company={co} size={44} rounded="md" />
                        : <PublisherThumb url={n.url} source={n.source} tint="amber" size={44} />}
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 group pt-0.5">
                        <p className="font-body text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors">
                          {n.title}
                        </p>
                        <p className="font-display text-[10px] font-700 uppercase tracking-[0.14em] text-muted-foreground mt-1">
                          {n.source} · {timeAgo(n.ts)}
                        </p>
                      </a>
                      <FeedSaveButton type="news" itemKey={n.id}
                        payload={{ title: n.title, url: n.url, source: n.source, industry: n.industry, timestamp: n.ts }} />
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          )}

          <SectionCard icon={BookOpen} title="Analysis" count={articles.length}
            empty="No fresh analysis, reports or deep dives yet.">
            {/* Pinned: industry briefing download (always available) */}
            <a
              href={`/downloads/download-${activeSlug}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex items-start gap-3 p-3 rounded-2xl border-2 border-foreground bg-primary/10 hover:bg-primary/20 transition-colors group"
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center">
                <Download className="w-4 h-4" />
              </span>
              <span className="flex-1 min-w-0">
                <p className="font-display font-900 text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors">
                  The Download · {displayIndustry(activeSlug)} industry briefing
                </p>
                <p className="font-display text-[10px] font-700 uppercase tracking-[0.14em] text-muted-foreground mt-1">
                  Howdy briefing · 2-page PDF · UK market, players, trends
                </p>
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            </a>
            <ul className="divide-y divide-border/60">
              {articles.slice(0, 6).map(a => {
                const co = detectCompany(a.title);
                return (
                  <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    {co
                      ? <CompanyLogo company={co} size={44} rounded="md" />
                      : <PublisherThumb url={a.url} source={a.source} tint="blue" size={44} />}
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 group pt-0.5">
                      <p className="font-body text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors">
                        {a.title}
                      </p>
                      <p className="font-display text-[10px] font-700 uppercase tracking-[0.14em] text-muted-foreground mt-1">
                        {a.source} · {timeAgo(a.ts)}
                      </p>
                    </a>
                    <FeedSaveButton type="article" itemKey={a.id}
                      payload={{ title: a.title, url: a.url, source: a.source, industry: a.industry, timestamp: a.ts }} />
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          {(() => {
            // Keep Watch videos anchored to the active industry. The dynamic
            // weekly feed can be noisy/repeated across industries, so use the
            // curated per-industry set first and only fall back to dynamic
            // results where no curated list exists yet.
            const fmtDur = (s: number | null) => {
              if (!s || s <= 0) return undefined;
              const h = Math.floor(s / 3600);
              const m = Math.floor((s % 3600) / 60);
              const sec = s % 60;
              return h > 0
                ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
                : `${m}:${String(sec).padStart(2, "0")}`;
            };
            const curated = (industryVideos[activeSlug] || []).slice(0, 4);
            const dyn = dynamicVideos.slice(0, 4);
            const showCurated = curated.length > 0;
            const vids = curated.length > 0
              ? curated.map(v => ({
                  youtubeId: v.youtubeId, title: v.title,
                  channel: v.channel || "", duration: v.duration,
                }))
              : dyn.map(v => ({
                  youtubeId: v.youtubeId, title: v.title,
                  channel: v.channel || "", duration: fmtDur(v.durationSeconds),
                }));

            const toggle = (
              <div className="inline-flex items-center gap-1 bg-card border border-border rounded-full p-0.5">
                {(["week", "month"] as const).map(w => (
                  <button
                    key={w}
                    onClick={() => setVideoWindow(w)}
                    className={`px-2.5 py-1 rounded-full font-display text-[10px] font-700 uppercase tracking-[0.14em] transition-colors ${
                      videoWindow === w
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {w === "week" ? "This week" : "This month"}
                  </button>
                ))}
              </div>
            );

            return (
              <SectionCard
                icon={Play}
                title="Watch"
                count={vids.length || undefined}
                action={toggle}
                empty={videosLoading ? "Loading fresh videos…" : "No fresh videos found - try the other window."}
              >
                {showCurated && curated.length > 0 && (
                  <p className="font-display text-[10px] font-700 uppercase tracking-[0.14em] text-muted-foreground mb-2">
                    Showing {displayIndustry(activeSlug)} picks
                  </p>
                )}
                {vids.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vids.map(v => (
                      <FeedCardVideo
                        key={v.youtubeId}
                        youtubeId={v.youtubeId}
                        title={v.title}
                        channel={v.channel}
                        industry={displayIndustry(activeSlug)}
                        duration={v.duration}
                      />
                    ))}
                  </div>
                ) : null}
              </SectionCard>
            );
          })()}

          <SectionCard icon={CalendarDays} title="Events" count={events.length}
            empty="No upcoming events listed yet - we refresh these weekly.">
            {events.length > 0 && (
              <ul className="divide-y divide-border/60">
                {events.slice(0, 6).map(ev => {
                  const d = ev.startsOn ? new Date(ev.startsOn + "T00:00:00") : null;
                  const day = d ? d.toLocaleDateString("en-GB", { day: "numeric" }) : null;
                  const mon = d ? d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase() : null;
                  const when = d
                    ? d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                    : (ev.dateLabel || "Date TBC");
                  return (
                    <li key={ev.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                      <div className="shrink-0 w-12 h-12 rounded-xl border-2 border-foreground bg-primary/15 flex flex-col items-center justify-center leading-none">
                        {d ? (
                          <>
                            <span className="font-display font-900 text-base text-foreground">{day}</span>
                            <span className="font-display text-[9px] font-700 tracking-wider text-foreground/70">{mon}</span>
                          </>
                        ) : ev.dateLabel ? (
                          // No exact date — show label text (e.g. "Oct 2025", "TBC") instead of icon
                          (() => {
                            // Try to parse month from label like "October 2025" or "Oct 25"
                            const parts = ev.dateLabel.trim().split(/\s+/);
                            const monthPart = parts[0]?.slice(0, 3).toUpperCase();
                            const yearPart = parts[1]?.slice(-2);
                            return (
                              <>
                                <span className="font-display font-700 text-[10px] text-foreground text-center px-0.5 leading-tight">{monthPart}</span>
                                {yearPart && <span className="font-display text-[8px] text-foreground/60">{yearPart}</span>}
                              </>
                            );
                          })()
                        ) : (
                          // No date info at all — show "TBC"
                          <span className="font-display font-700 text-[9px] text-foreground/60 tracking-wide">TBC</span>
                        )}
                      </div>
                      <a href={ev.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 group">
                        <p className="font-body text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors">
                          {ev.title}
                        </p>
                        <p className="font-display text-[10px] font-700 uppercase tracking-[0.14em] text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          {ev.eventType && <span className="px-1.5 py-0.5 rounded bg-fuchsia-600/10 text-fuchsia-700 dark:text-fuchsia-300">{ev.eventType}</span>}
                          <span>{when}</span>
                          {ev.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.location}</span>}
                        </p>
                      </a>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-3 text-right">
              <Link
                to={`/${activeSlug}?tab=attend`}
                className="font-display text-[10px] font-700 uppercase tracking-[0.14em] text-primary hover:underline"
              >
                See all {displayIndustry(activeSlug)} events →
              </Link>
            </div>
          </SectionCard>

          <SectionCard icon={Briefcase} iconImage={howdyMascot} title={`${displayIndustry(activeSlug)} Jobs`} count={jobs.length}
            empty="No live jobs right now - check back tomorrow.">
            {jobs.length > 0 && (
              <FeedCardJob
                industry={activeSlug}
                count={jobCount}
                jobs={jobs.slice(0, 3).map(j => ({ title: j.title, url: j.url, company: j.company }))}
                timestamp={timeAgo(jobs[0].ts)}
              />
            )}
          </SectionCard>

          {featuredEmployer && (
            <SectionCard icon={Sparkles} title="Featured Employer">
              <FeedCardEmployer
                companyName={featuredEmployer.companyName}
                tagline={featuredEmployer.tagline}
                logoUrl={featuredEmployer.logoUrl}
                url={featuredEmployer.url}
                industry={featuredEmployer.industry}
              />
            </SectionCard>
          )}

          <SectionCard icon={Building2} title="Who's Hiring" count={otherEmployers.length}
            empty="No featured employers for this industry yet.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherEmployers.map(e => <EmployerAd key={e.companyName} {...e} />)}
            </div>
          </SectionCard>

          <SectionCard icon={Building2} title="Companies" count={companyNews.length}
            action={isAdmin ? (
              <button
                onClick={() => setEditingCompanies(v => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 font-display text-[10px] font-700 uppercase tracking-wider transition-colors"
              >
                <Pencil className="w-3 h-3" />
                {editingCompanies ? "Done" : "Edit"}
              </button>
            ) : undefined}
            empty={
              knownCompanies.length === 0 && targetCompanies.length === 0
                ? "Add the companies you want to work for in your profile to see news on them here."
                : "No fresh news on the curated companies for this industry just yet."
            }>
            {isAdmin && editingCompanies && (
              <CompanyAdminEditor
                industry={activeSlug}
                onChanged={() => fetchAll(activeSlug)}
                onClose={() => setEditingCompanies(false)}
              />
            )}

            <ul className="divide-y divide-border/60">
              {companyNews.map(n => {
                const co = detectCompany(n.title);
                return (
                  <li key={n.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                    {co
                      ? <CompanyLogo company={co} size={44} rounded="md" />
                      : <PublisherThumb url={n.url} source={n.source} tint="amber" size={44} />}

                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 group">
                      <p className="font-body text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors">
                        {n.title}
                      </p>
                      <p className="font-display text-[10px] font-700 uppercase tracking-[0.14em] text-muted-foreground mt-1">
                        {n.source} · {timeAgo(n.ts)}
                      </p>
                    </a>
                    <FeedSaveButton type="company_news" itemKey={n.id}
                      payload={{ title: n.title, url: n.url, source: n.source, industry: n.industry, timestamp: n.ts }} />
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </>
      )}
    </div>
  );
};

export default MyFeed;
