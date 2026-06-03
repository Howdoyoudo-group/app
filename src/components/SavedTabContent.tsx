import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark, Briefcase, FileText, Zap, Building2, Newspaper, Play,
  ExternalLink, X, Loader2, MapPin,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSavedFeedItems, type SavedItemType } from "@/hooks/useSavedFeedItems";
import { INDUSTRIES } from "@/data/industries";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CompanyLogo from "@/components/CompanyLogo";
import { trackInteraction } from "@/hooks/useTrackInteraction";

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  salary?: string | null;
  url: string;
  industry?: string | null;
}

interface Props {
  savedJobs: Job[];
  savedLoading: boolean;
  unsaveJob: (id: string) => void;
}

const TYPE_META: Record<
  SavedItemType,
  { label: string; Icon: typeof FileText }
> = {
  article: { label: "Articles", Icon: FileText },
  news: { label: "News", Icon: Zap },
  company_news: { label: "Company", Icon: Building2 },
  briefing: { label: "Briefings", Icon: Newspaper },
  video: { label: "Videos", Icon: Play },
};

const displayIndustry = (slug?: string) => {
  const s = slug || "";
  const match = INDUSTRIES.find((i) => i.slug === s);
  if (match) return match.name;
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const SavedTabContent = ({ savedJobs, savedLoading, unsaveJob }: Props) => {
  const { items, loading, toggle } = useSavedFeedItems();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sub, setSub] = useState<"jobs" | SavedItemType>("jobs");

  const counts: Record<SavedItemType, number> = {
    article: 0, news: 0, company_news: 0, briefing: 0, video: 0,
  };
  items.forEach((i) => {
    if (i.item_type in counts) counts[i.item_type as SavedItemType]++;
  });

  const remove = (type: SavedItemType, key: string, payload: Record<string, unknown>) => {
    toggle({ item_type: type, item_key: key, payload });
    toast({ title: "Removed from saved" });
  };

  const renderEmpty = (label: string) => (
    <div className="border-2 border-foreground p-8 text-center rounded-2xl">
      <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <h3 className="font-display font-900 text-base uppercase tracking-wider text-foreground mb-2">
        No saved {label} yet
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        Tap the bookmark on any {label.toLowerCase().replace(/s$/, "")} in your feed to save it here.
      </p>
    </div>
  );

  const filtered = (t: SavedItemType) => items.filter((i) => i.item_type === t);

  return (
    <Tabs value={sub} onValueChange={(v) => setSub(v as typeof sub)}>
      <TabsList className="grid grid-cols-6 w-full h-auto p-1 mb-5 border-2 border-foreground bg-background rounded-2xl gap-1">
        <TabsTrigger
          value="jobs"
          className="flex flex-col items-center gap-1 py-2 px-1 font-display text-[9px] font-700 uppercase tracking-wider rounded-xl data-[state=active]:bg-foreground data-[state=active]:text-background"
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs{savedJobs.length ? ` · ${savedJobs.length}` : ""}</span>
        </TabsTrigger>
        {(Object.keys(TYPE_META) as SavedItemType[]).map((t) => {
          const { label, Icon } = TYPE_META[t];
          return (
            <TabsTrigger
              key={t}
              value={t}
              className="flex flex-col items-center gap-1 py-2 px-1 font-display text-[9px] font-700 uppercase tracking-wider rounded-xl data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              <Icon className="w-4 h-4" />
              <span>{label}{counts[t] ? ` · ${counts[t]}` : ""}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Jobs */}
      <TabsContent value="jobs" className="mt-0 focus-visible:outline-none">
        {savedLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="border-2 border-foreground p-8 text-center rounded-2xl">
            <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-display font-900 text-base uppercase tracking-wider text-foreground mb-2">
              No saved jobs yet
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Tap the bookmark on any job in the marketplace to save it here.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 border-2 border-foreground bg-primary text-primary-foreground rounded-2xl px-4 py-2 font-display font-700 text-xs tracking-wider uppercase shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              <Briefcase className="w-4 h-4" />
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedJobs.map((job) => (
              <div key={job.id} className="border-2 border-foreground p-4 rounded-2xl bg-background">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <CompanyLogo company={job.company} size={44} />
                    <div className="min-w-0">
                      <h3 className="font-display font-900 text-sm uppercase tracking-wider text-foreground leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground font-body">
                        <span>{job.company}</span>
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                        {job.salary && <span>{job.salary}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => unsaveJob(job.id)}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 border-2 border-foreground rounded-2xl text-[10px] font-display font-700 uppercase tracking-wider text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                    title="Remove"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
                <div className="flex items-center justify-end mt-3">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackInteraction({
                        type: "job_click",
                        industry: job.industry ?? undefined,
                        jobId: job.id,
                        metadata: { title: job.title, company: job.company, source: "saved-jobs" },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 border-2 border-foreground bg-primary text-primary-foreground rounded-2xl px-3 py-1.5 font-display font-700 text-[10px] tracking-wider uppercase shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Apply <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Saved feed item types */}
      {(Object.keys(TYPE_META) as SavedItemType[]).map((t) => {
        const { label, Icon } = TYPE_META[t];
        const list = filtered(t);
        return (
          <TabsContent key={t} value={t} className="mt-0 focus-visible:outline-none">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : list.length === 0 ? (
              renderEmpty(label)
            ) : (
              <div className="space-y-3">
                {list.map((it) => {
                  const p = it.payload || {};
                  const url = (p.url as string) || "#";
                  const title = (p.title as string) || "(untitled)";
                  const source = p.source as string | undefined;
                  const industry = p.industry as string | undefined;
                  return (
                    <div
                      key={`${it.item_type}-${it.item_key}`}
                      className="border-2 border-foreground p-4 rounded-2xl bg-background"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-muted-foreground">
                              {label.replace(/s$/, "")}
                            </span>
                            {industry && (
                              <span className="font-body text-[10px] text-muted-foreground">
                                · {displayIndustry(industry)}
                              </span>
                            )}
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                          >
                            <h3 className="font-display font-800 text-sm text-foreground leading-tight group-hover:text-primary transition-colors">
                              {title}
                            </h3>
                          </a>
                          {source && (
                            <p className="font-body text-[11px] text-muted-foreground mt-1">
                              {source}
                            </p>
                          )}
                          {t === "briefing" && p.mainNews && (
                            <p className="font-body text-xs text-muted-foreground mt-2 line-clamp-3">
                              {p.mainNews as string}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => remove(t, it.item_key, p)}
                          className="shrink-0 inline-flex items-center gap-1 px-2 py-1 border-2 border-foreground rounded-2xl text-[10px] font-display font-700 uppercase tracking-wider text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {url !== "#" && (
                        <div className="flex items-center justify-end mt-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-display text-[10px] font-700 uppercase tracking-wider text-primary hover:underline"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default SavedTabContent;
