import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Rss, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const STOPWORDS = new Set([
  "the","a","an","of","in","on","for","to","and","or","with","at","by","from",
  "is","are","was","were","be","been","as","it","its","this","that","amid",
  "after","over","up","down","new","uk","us","plc",
]);

function storyFingerprint(title: string): string {
  const tokens = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));
  // Use the 4 most distinctive leading tokens - typically the entity + topic.
  return tokens.slice(0, 4).join(" ");
}

function dedupeByStory<T extends { title: string; url: string }>(items: T[]): T[] {
  const seenFp = new Set<string>();
  const seenUrl = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!item.title || !item.url) continue;
    if (seenUrl.has(item.url)) continue;
    const fp = storyFingerprint(item.title);
    if (fp && seenFp.has(fp)) continue;
    seenUrl.add(item.url);
    if (fp) seenFp.add(fp);
    out.push(item);
    if (out.length >= 15) break;
  }
  return out;
}

interface BreakingNewsFeedProps {
  industry: string;
  sources: { title: string; url: string }[];
}

const BreakingNewsFeed = ({ industry, sources }: BreakingNewsFeedProps) => {
  const [headlines, setHeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchHeadlines = async () => {
    const { data } = await supabase
      .from("breaking_news")
      .select("title, source, url, published_at")
      .eq("industry", industry)
      .order("published_at", { ascending: false })
      .limit(60);

    if (data) setHeadlines(dedupeByStory(data));
  };

  const handleRefreshFeed = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-rss-news", {
        body: { industry },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Pulled ${data.headlines_found} headlines`);
        await fetchHeadlines();
      } else {
        toast.error(data?.error || "Failed to fetch news");
      }
    } catch (err) {
      console.error("RSS fetch error:", err);
      toast.error("Failed to fetch news feed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchHeadlines();
  }, [open, industry]);

  return (
    <div id="breaking-news" className="scroll-mt-24">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-3 border-2 border-foreground px-6 py-4 font-display font-700 text-base tracking-wide uppercase hover:border-primary hover:text-primary transition-colors w-full text-left"
      >
        <Rss className="w-5 h-5" />
        Breaking News
        <span className="text-muted-foreground text-xs font-body normal-case tracking-normal ml-auto">
          {open ? "Close" : "Open feed"}
        </span>
      </button>

      {open && (
        <div className="border-2 border-t-0 border-foreground p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
              Live RSS feed
            </p>
            <button
              onClick={handleRefreshFeed}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Fetching..." : "Refresh"}
            </button>
          </div>

          {headlines.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {headlines.map((item, i) => (
                <a
                  key={`${item.url}-${i}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    // Robust open: works inside iframes / in-app webviews where
                    // implicit target="_blank" popups can be silently blocked.
                    e.preventDefault();
                    const win = window.open(item.url, "_blank", "noopener,noreferrer");
                    if (!win) window.location.href = item.url;
                  }}
                  className="block border-b border-border pb-3 last:border-0 hover:text-primary transition-colors group cursor-pointer"
                >
                  <h4 className="font-display font-600 text-foreground text-sm group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground font-body text-[10px] uppercase tracking-wider">
                      {item.source}
                    </span>
                    {item.published_at && (
                      <span className="text-muted-foreground/60 font-body text-[10px]">
                        {new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground font-body text-sm mb-3">
                No headlines yet.
              </p>
              <button
                onClick={handleRefreshFeed}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-display font-600 text-xs tracking-wide uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                Fetch latest news
              </button>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-2">
              Sources
            </p>
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-body text-muted-foreground hover:text-primary transition-colors underline"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreakingNewsFeed;
