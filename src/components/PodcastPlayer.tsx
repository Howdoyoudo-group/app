import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, Loader2, Mic, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Episode {
  id: string;
  title: string;
  description: string | null;
  audio_url: string | null;
  duration_seconds: number | null;
  published_at: string | null;
  industry: string;
}

interface PodcastPlayerProps {
  industry: string;
}

const PodcastPlayer = ({ industry }: PodcastPlayerProps) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const industryKey = industry.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    fetchEpisodes();
  }, [industryKey]);

  const fetchEpisodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("podcast_episodes" as any)
      .select("*")
      .eq("industry", industryKey)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setEpisodes(data as unknown as Episode[]);
      if (data.length > 0 && !currentEpisode) {
        setCurrentEpisode(data[0] as unknown as Episode);
      }
    }
    setLoading(false);
  };


  const togglePlay = () => {
    if (!audioRef.current || !currentEpisode?.audio_url) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const selectEpisode = (ep: Episode) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
    }
    setCurrentEpisode(ep);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(pct) ? 0 : pct);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "~1 min";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <section id="podcasts" className="py-12">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Mic className="w-6 h-6 text-primary" />
          Podcasts
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Short career tips, narrated for you
        </p>
      </div>

      {/* Current player */}
      <AnimatePresence mode="wait">
        {currentEpisode?.audio_url && (
          <motion.div
            key={currentEpisode.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border bg-card p-4 mb-6"
          >
            <audio
              ref={audioRef}
              src={currentEpisode.audio_url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              preload="metadata"
            />
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {currentEpisode.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(currentEpisode.published_at)} · {formatDuration(currentEpisode.duration_seconds)}
                </p>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Episode list */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading episodes...
        </div>
      ) : episodes.length === 0 ? null : (
        <div className="space-y-2">
          {episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => selectEpisode(ep)}
              className={`w-full text-left p-3 rounded-lg border transition hover:bg-accent/50 ${
                currentEpisode?.id === ep.id ? "border-primary bg-accent/30" : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ep.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(ep.published_at)} · {formatDuration(ep.duration_seconds)}
                  </p>
                </div>
                <Play className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default PodcastPlayer;
