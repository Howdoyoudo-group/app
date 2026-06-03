import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface LiveArticlesProps {
  industry: string;
  fallbackArticles: { title: string; source: string; url: string }[];
}

const LiveArticles = ({ industry, fallbackArticles }: LiveArticlesProps) => {
  const [articles, setArticles] = useState(fallbackArticles);
  const [loading, setLoading] = useState(false);
  const [hasLive, setHasLive] = useState(false);

  const fetchStoredArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("title, source, url, description")
      .eq("industry", industry)
      .order("scraped_at", { ascending: false })
      .limit(10);

    if (data && data.length > 0) {
      setArticles(data);
      setHasLive(true);
    }
  };

  useEffect(() => {
    fetchStoredArticles();
  }, [industry]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-articles", {
        body: { industry },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Found ${data.articles_found} fresh articles`);
        await fetchStoredArticles();
      } else {
        toast.error(data?.error || "Failed to refresh articles");
      }
    } catch (err) {
      console.error("Refresh error:", err);
      toast.error("Failed to refresh articles. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-700">
          Articles<span className="text-primary">.</span>
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs font-display font-600 tracking-wide uppercase text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {hasLive && (
        <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-4">
          Live articles · powered by search
        </p>
      )}
      <div className="space-y-4">
        {articles.map((article) => (
          <a
            key={article.url}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-border p-4 hover:border-primary transition-colors group"
          >
            <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-muted-foreground font-body text-xs mt-1">
              {article.source}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default LiveArticles;
