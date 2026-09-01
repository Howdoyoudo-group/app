import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, Sparkles, ExternalLink, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO, { breadcrumbJsonLd } from "@/components/SEO";

interface SourceLink {
  title: string;
  url: string;
}

interface Briefing {
  industry: string;
  briefing_date: string;
  main_news: string | null;
  people: string | null;
  takeaway: string | null;
  source_links: SourceLink[] | null;
  generated_at: string;
}

const prettyIndustry = (slug: string) =>
  slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

const formatDate = (iso: string) => {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const BriefingsSample = () => {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("daily_briefings")
        .select("*")
        .order("briefing_date", { ascending: false })
        .limit(60);
      if (error) {
        console.warn("BriefingsSample load failed", error);
        setBriefings([]);
      } else {
        // Keep only the latest per industry
        const seen = new Set<string>();
        const latest: Briefing[] = [];
        for (const row of (data as unknown as Briefing[]) || []) {
          if (!seen.has(row.industry)) {
            seen.add(row.industry);
            latest.push(row);
          }
        }
        setBriefings(latest);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Daily Career Briefings"
        description="Fresh, AI-curated career news and industry takeaways, generated daily across UK industries - what's happening and what it means for your career."
        path="/briefings"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Daily Briefings", path: "/briefings" },
        ])}
      />
      <header className="border-b-2 border-foreground bg-background">
        <div className="max-w-5xl mx-auto px-5 py-6 md:py-10 flex items-start justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back home
            </Link>
            <h1 className="font-display text-3xl md:text-5xl font-700 text-foreground leading-tight">
              Daily briefings<span className="text-primary">.</span>
            </h1>
            <p className="font-body text-sm md:text-base text-muted-foreground mt-3 max-w-xl">
              A peek at the morning briefings we send across each industry - synthesised daily from
              trusted UK sources. Subscribe from any industry page to get yours by email.
            </p>
          </div>
          <Newspaper
            className="hidden md:block w-10 h-10 text-foreground shrink-0 mt-2"
            strokeWidth={2}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8 md:py-12">
        {loading && (
          <p className="font-body text-sm text-muted-foreground">Loading briefings…</p>
        )}

        {!loading && briefings.length === 0 && (
          <p className="font-body text-sm text-muted-foreground">
            No briefings available right now - check back tomorrow morning.
          </p>
        )}

        <div className="grid gap-8">
          {briefings.map((b, i) => {
            const sources = Array.isArray(b.source_links) ? b.source_links : [];
            return (
              <motion.article
                key={`${b.industry}-${b.briefing_date}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
                className="border-2 border-foreground rounded-3xl overflow-hidden bg-background"
              >
                <div className="border-b-2 border-foreground px-5 md:px-7 py-4 bg-primary/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-display text-xs uppercase tracking-[0.2em] text-foreground truncate">
                      {prettyIndustry(b.industry)} briefing
                    </span>
                  </div>
                  <span className="font-body text-[11px] uppercase tracking-wider text-muted-foreground shrink-0">
                    {formatDate(b.briefing_date)}
                  </span>
                </div>

                <div className="px-5 md:px-8 py-6 md:py-8 space-y-6">
                  {b.main_news && (
                    <section>
                      <h2 className="font-display text-lg md:text-xl font-700 text-foreground mb-2">
                        Main news<span className="text-primary">.</span>
                      </h2>
                      <p className="font-body text-foreground/90 text-[15px] leading-relaxed whitespace-pre-line">
                        {b.main_news}
                      </p>
                    </section>
                  )}

                  {b.people && (
                    <section>
                      <h2 className="font-display text-lg md:text-xl font-700 text-foreground mb-2">
                        People<span className="text-primary">.</span>
                      </h2>
                      <p className="font-body text-foreground/90 text-[15px] leading-relaxed whitespace-pre-line">
                        {b.people}
                      </p>
                    </section>
                  )}

                  {b.takeaway && (
                    <section className="border-l-4 border-primary pl-4">
                      <h2 className="font-display text-lg md:text-xl font-700 text-foreground mb-2">
                        The takeaway<span className="text-primary">.</span>
                      </h2>
                      <p className="font-body text-foreground/90 text-[15px] leading-relaxed whitespace-pre-line">
                        {b.takeaway}
                      </p>
                    </section>
                  )}

                  {sources.length > 0 && (
                    <footer className="border-t border-border pt-4">
                      <p className="font-display text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                        Sources
                      </p>
                      <ul className="space-y-1.5">
                        {sources.slice(0, 6).map((s, idx) => (
                          <li key={`${s.url}-${idx}`}>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group inline-flex items-start gap-1.5 font-body text-xs text-foreground/70 hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 opacity-60 group-hover:opacity-100" />
                              <span className="underline-offset-2 group-hover:underline">
                                {s.title}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </footer>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default BriefingsSample;
