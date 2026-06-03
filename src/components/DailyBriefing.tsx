import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Sparkles, ChevronDown, Headphones, Loader2, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Industries where the spoken briefing experiment is active.
// Start with football, expand based on play-rate + completion data.
const TTS_ENABLED_INDUSTRIES = new Set(["football"]);

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

interface DailyBriefingProps {
  industry: string;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return iso;
  }
};

const DailyBriefing = ({ industry }: DailyBriefingProps) => {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // --- Listen (TTS) state ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const ttsEnabled = TTS_ENABLED_INDUSTRIES.has(industry.toLowerCase());

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_briefings")
        .select("*")
        .eq("industry", industry.toLowerCase())
        .order("briefing_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;
      if (error) {
        console.warn("DailyBriefing load failed", error);
        setBriefing(null);
      } else {
        setBriefing(data as unknown as Briefing | null);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [industry]);

  // Cleanup audio when briefing changes or component unmounts.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const buildBriefingScript = (b: Briefing): string => {
    const parts: string[] = [];
    parts.push(`Howdy. Here's your ${industry} briefing for ${formatDate(b.briefing_date)}.`);
    if (b.main_news) parts.push(`Main news. ${b.main_news}`);
    if (b.people) parts.push(`People. ${b.people}`);
    if (b.takeaway) parts.push(`The takeaway. ${b.takeaway}`);
    return parts.join("\n\n");
  };

  const handleListen = async () => {
    if (!briefing) return;
    // Toggle pause if already playing.
    if (audioRef.current && ttsPlaying) {
      audioRef.current.pause();
      setTtsPlaying(false);
      return;
    }
    // Resume if we already have audio loaded.
    if (audioRef.current && audioUrlRef.current) {
      try {
        await audioRef.current.play();
        setTtsPlaying(true);
      } catch (e) {
        console.error("resume play failed", e);
      }
      return;
    }

    // CRITICAL for iOS Safari: create the Audio element *synchronously* inside
    // the click handler so it stays attached to the user gesture. We then set
    // src + call play() after the fetch resolves.
    const audio = new Audio();
    audio.preload = "auto";
    audio.onended = () => setTtsPlaying(false);
    audio.onpause = () => setTtsPlaying(false);
    audio.onplay = () => setTtsPlaying(true);
    audioRef.current = audio;

    setTtsLoading(true);
    setTtsError(null);
    try {
      const script = buildBriefingScript(briefing);
      // Direct fetch (not supabase.functions.invoke) so we can stream the blob
      // and avoid the SDK buffering the whole response.
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/briefing-tts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: script }),
        },
      );
      if (!resp.ok) throw new Error(`TTS HTTP ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      audio.src = url;
      await audio.play();

      // Lightweight tracking - prove demand before investing further.
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          await supabase.from("user_interactions").insert([{
            user_id: userData.user.id,
            interaction_type: "industry_view",
            industry: industry.toLowerCase(),
            metadata: { event: "briefing_listen", briefing_date: briefing.briefing_date } as never,
          }]);
        }
      } catch { /* tracking must not break UX */ }
    } catch (e) {
      console.error("briefing-tts failed", e);
      setTtsError("Audio unavailable, please try again.");
      audioRef.current = null;
    } finally {
      setTtsLoading(false);
    }
  };

  if (loading || !briefing) return null;

  const sources = Array.isArray(briefing.source_links) ? briefing.source_links : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-10 border-2 border-foreground bg-background rounded-3xl overflow-hidden"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full border-b-2 border-foreground px-5 py-3 flex items-center justify-between gap-3 bg-primary/10 hover:bg-primary/20 transition-colors text-left">
          <div className="flex items-center gap-2 min-w-0">
            <Newspaper className="w-4 h-4 text-foreground shrink-0" strokeWidth={2.5} />
            <span className="font-display text-xs uppercase tracking-[0.2em] text-foreground truncate">
              Today's briefing
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-body text-[11px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
              {formatDate(briefing.briefing_date)}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>
        </CollapsibleTrigger>

        {!open && (
          <div className="px-5 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="font-body text-xs text-muted-foreground truncate">
                A morning briefing from across the {industry} industry.{" "}
                <span className="text-foreground underline-offset-2 underline">Tap to read</span>
              </p>
            </div>
            {ttsEnabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleListen(); }}
                disabled={ttsLoading}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-foreground hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
                aria-label={ttsPlaying ? "Pause spoken briefing" : "Listen to briefing"}
              >
                {ttsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : ttsPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Headphones className="w-3.5 h-3.5" />
                )}
                <span>{ttsLoading ? "Loading" : ttsPlaying ? "Pause" : "Listen"}</span>
              </button>
            )}
          </div>
        )}
        {ttsEnabled && ttsError && (
          <div className="px-5 pb-2 font-body text-[11px] text-destructive">{ttsError}</div>
        )}

        <CollapsibleContent>
          <div className="px-5 md:px-8 py-6 md:py-8 space-y-7">
            <header className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" />
                <p className="font-body text-xs uppercase tracking-widest text-muted-foreground">
                  A morning briefing - synthesised daily from across the {industry} industry.
                </p>
              </div>
              {ttsEnabled && (
                <button
                  type="button"
                  onClick={handleListen}
                  disabled={ttsLoading}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.18em] text-foreground hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
                  aria-label={ttsPlaying ? "Pause spoken briefing" : "Listen to briefing"}
                >
                  {ttsLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : ttsPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Headphones className="w-3.5 h-3.5" />
                  )}
                  <span>{ttsLoading ? "Loading" : ttsPlaying ? "Pause" : "Listen"}</span>
                </button>
              )}
            </header>

            {briefing.main_news && (
              <article>
                <h3 className="font-display text-xl md:text-2xl font-700 text-foreground mb-3">
                  Main news<span className="text-primary">.</span>
                </h3>
                <p className="font-body text-foreground/90 text-[15px] leading-relaxed whitespace-pre-line">
                  {briefing.main_news}
                </p>
              </article>
            )}

            {briefing.people && (
              <article>
                <h3 className="font-display text-xl md:text-2xl font-700 text-foreground mb-3">
                  People<span className="text-primary">.</span>
                </h3>
                <p className="font-body text-foreground/90 text-[15px] leading-relaxed whitespace-pre-line">
                  {briefing.people}
                </p>
              </article>
            )}

            {briefing.takeaway && (
              <article className="border-l-4 border-primary pl-4">
                <h3 className="font-display text-xl md:text-2xl font-700 text-foreground mb-3">
                  The takeaway<span className="text-primary">.</span>
                </h3>
                <p className="font-body text-foreground/90 text-[15px] leading-relaxed whitespace-pre-line">
                  {briefing.takeaway}
                </p>
              </article>
            )}

            {sources.length > 0 && (
              <footer className="border-t border-border pt-4">
                <p className="font-display text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                  Sources
                </p>
                <ul className="space-y-1.5">
                  {sources.map((s, idx) => (
                    <li key={`${s.url}-${idx}`}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-start gap-1.5 font-body text-xs text-foreground/70 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 opacity-60 group-hover:opacity-100" />
                        <span className="underline-offset-2 group-hover:underline">{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </footer>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.section>
  );
};

export default DailyBriefing;
