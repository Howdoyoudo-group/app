import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { INDUSTRIES as industries } from "@/data/industries";

interface EventsSectionProps {
  industry: string;
  searchQuery: string;
  /** Optional explicit slug; falls back to looking up by display name. */
  industrySlug?: string;
}

interface IndustryEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  organizer: string | null;
  location: string | null;
  starts_on: string | null;
  ends_on: string | null;
  date_label: string | null;
  url: string;
}

const TYPE_COLORS: Record<string, string> = {
  conference: "bg-primary text-primary-foreground",
  talk: "bg-foreground text-background",
  webinar: "bg-foreground text-background",
  awards: "bg-primary text-primary-foreground",
  networking: "bg-muted text-foreground",
  exhibition: "bg-foreground text-background",
};

function nameToSlug(name: string): string | undefined {
  const found = industries.find(
    (i) => i.name.toLowerCase() === name.toLowerCase(),
  );
  return found?.slug;
}

function formatMonth(dateIso: string | null, fallback: string | null) {
  if (!dateIso) return { d: fallback?.split(" ")[0] ?? "TBC", m: "" };
  const d = new Date(dateIso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return { d: "TBC", m: "" };
  return {
    d: String(d.getDate()),
    m: d.toLocaleString("en-GB", { month: "short" }).toUpperCase(),
  };
}

const EventsSection = ({ industry, searchQuery, industrySlug }: EventsSectionProps) => {
  const slug = industrySlug ?? nameToSlug(industry);
  const eventbriteUrl = `https://www.eventbrite.com/d/united-kingdom/${encodeURIComponent(searchQuery)}/`;

  const [events, setEvents] = useState<IndustryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!slug) { setLoading(false); return; }
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("industry_events")
        .select("id,title,description,event_type,organizer,location,starts_on,ends_on,date_label,url")
        .eq("industry", slug)
        .or(`starts_on.gte.${today},starts_on.is.null`)
        .order("starts_on", { ascending: true, nullsFirst: false })
        .limit(24);
      if (!cancelled) {
        setEvents((data as IndustryEvent[] | null) ?? []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const grouped = useMemo(() => {
    const groups = new Map<string, IndustryEvent[]>();
    for (const e of events) {
      const key = e.starts_on
        ? new Date(e.starts_on + "T00:00:00").toLocaleString("en-GB", { month: "long", year: "numeric" })
        : "Date TBC";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }
    return Array.from(groups.entries());
  }, [events]);

  return (
    <motion.div
      id="events"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 scroll-mt-24"
    >
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <h2 className="font-display text-2xl md:text-3xl font-700">
          Upcoming {industry} events<span className="text-primary">.</span>
        </h2>
        <a
          href={eventbriteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-display font-600 uppercase tracking-wide text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          More on Eventbrite <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {loading && (
        <div className="border border-border p-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="font-body text-sm">Loading events…</span>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="border border-border p-6">
          <p className="font-body text-sm text-muted-foreground mb-4">
            We're still gathering upcoming {industry.toLowerCase()} events. In the meantime,
            browse the open listings on Eventbrite.
          </p>
          <a
            href={eventbriteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity"
          >
            Browse {industry} events <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {!loading && grouped.map(([month, list]) => (
        <div key={month} className="mb-10">
          <h3 className="font-display font-700 text-base mb-4 text-muted-foreground uppercase tracking-wide">
            {month}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((e) => {
              const { d, m } = formatMonth(e.starts_on, e.date_label);
              const typeClass = e.event_type
                ? TYPE_COLORS[e.event_type.toLowerCase()] ?? "bg-muted text-foreground"
                : "bg-muted text-foreground";
              return (
                <a
                  key={e.id}
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-border p-5 hover:border-primary transition-colors flex gap-4"
                >
                  <div className="shrink-0 w-16 text-center border border-border py-2 self-start">
                    <div className="font-display font-700 text-2xl leading-none">{d}</div>
                    {m && (
                      <div className="font-display text-[10px] tracking-widest mt-1 text-muted-foreground">{m}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {e.event_type && (
                        <span className={`text-[10px] font-display font-700 uppercase tracking-widest px-2 py-0.5 ${typeClass}`}>
                          {e.event_type}
                        </span>
                      )}
                      {e.date_label && (
                        <span className="text-[11px] text-muted-foreground font-body">{e.date_label}</span>
                      )}
                    </div>
                    <h4 className="font-display font-700 text-sm leading-snug group-hover:text-primary transition-colors flex items-start gap-1">
                      {e.title}
                      <ExternalLink className="w-3 h-3 mt-1 shrink-0 opacity-60" />
                    </h4>
                    {e.description && (
                      <p className="font-body text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {e.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground font-body flex-wrap">
                      {e.organizer && <span>{e.organizer}</span>}
                      {e.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {e.location}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ))}

      {!loading && events.length > 0 && (
        <p className="text-[11px] text-muted-foreground font-body mt-2 inline-flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          Refreshed weekly. Always check the organiser's page for the latest details.
        </p>
      )}
    </motion.div>
  );
};

export default EventsSection;
