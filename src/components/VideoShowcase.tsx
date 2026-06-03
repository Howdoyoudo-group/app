import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ExternalLink } from "lucide-react";

export interface VideoClip {
  /** YouTube video ID (the part after v=) */
  youtubeId: string;
  title: string;
  /** Short 1-liner shown under the title */
  description: string;
  /** e.g. "Documentary", "Explainer", "Interview" */
  tag?: string;
  /** Duration label e.g. "12:34" */
  duration?: string;
  /** Channel / creator name */
  channel?: string;
}

export interface VideoShowcaseProps {
  /** Section heading */
  heading?: string;
  /** Curated clips to display */
  clips: VideoClip[];
}

/* ── thumbnail URL helper ────────────────────────────── */
const thumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

/* ── tag colour palette (rotates) ────────────────────── */
const TAG_COLOURS = [
  { bg: "bg-primary/15", text: "text-primary" },
  { bg: "bg-red-500/15", text: "text-red-500" },
  { bg: "bg-blue-500/15", text: "text-blue-500" },
  { bg: "bg-amber-500/15", text: "text-amber-500" },
  { bg: "bg-purple-500/15", text: "text-purple-500" },
];
const tagColour = (tag: string) => {
  let hash = 0;
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  return TAG_COLOURS[Math.abs(hash) % TAG_COLOURS.length];
};

/* ── main component ──────────────────────────────────── */
const VideoShowcase = ({
  heading = "Watch",
  clips,
}: VideoShowcaseProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (clips.length === 0) return null;

  /* Featured clip = first one, rest go in a grid below */
  const [featured, ...rest] = clips;

  return (
    <section>
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 text-foreground">
        {heading}
        <span className="text-primary">.</span>
      </h2>

      {/* ── Featured hero clip ────────────────────────── */}
      <FeaturedCard clip={featured} isActive={activeId === featured.youtubeId} onPlay={() => setActiveId(featured.youtubeId)} onClose={() => setActiveId(null)} />

      {/* ── Grid of remaining clips ───────────────────── */}
      {rest.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {rest.map((clip) => (
            <GridCard key={clip.youtubeId} clip={clip} isActive={activeId === clip.youtubeId} onPlay={() => setActiveId(clip.youtubeId)} onClose={() => setActiveId(null)} />
          ))}
        </div>
      )}
    </section>
  );
};

/* ── Featured (large) card ───────────────────────────── */
const FeaturedCard = ({ clip, isActive, onPlay, onClose }: { clip: VideoClip; isActive: boolean; onPlay: () => void; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="relative w-full aspect-video border border-border overflow-hidden bg-foreground/5 group"
  >
    <AnimatePresence mode="wait">
      {isActive ? (
        <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${clip.youtubeId}?autoplay=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            title={clip.title}
          />
          <button onClick={onClose} className="absolute top-3 right-3 bg-foreground/80 text-background p-1.5 rounded-full z-10 hover:bg-foreground transition-colors" aria-label="Close video">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="thumb"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onPlay}
          className="absolute inset-0 w-full h-full cursor-pointer"
          aria-label={`Play ${clip.title}`}
        >
          <img src={thumb(clip.youtubeId)} alt="" className="w-full h-full object-cover" loading="lazy" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 md:w-9 md:h-9 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
          {/* Meta bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              {clip.tag && <TagBadge tag={clip.tag} />}
              {clip.duration && <span className="text-[10px] font-display font-700 text-background/70 uppercase tracking-wider">{clip.duration}</span>}
            </div>
            <h3 className="font-display font-700 text-background text-base md:text-xl leading-tight">{clip.title}</h3>
            {clip.channel && <p className="text-background/60 font-body text-xs mt-1">{clip.channel}</p>}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  </motion.div>
);

/* ── Grid (small) card ───────────────────────────────── */
const GridCard = ({ clip, isActive, onPlay, onClose }: { clip: VideoClip; isActive: boolean; onPlay: () => void; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    className="relative border border-border overflow-hidden bg-foreground/5 group flex flex-col"
  >
    {/* Thumbnail / Player area */}
    <div className="relative w-full aspect-video">
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${clip.youtubeId}?autoplay=1&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              title={clip.title}
            />
            <button onClick={onClose} className="absolute top-2 right-2 bg-foreground/80 text-background p-1 rounded-full z-10 hover:bg-foreground transition-colors" aria-label="Close video">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="thumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onPlay}
            className="absolute inset-0 w-full h-full cursor-pointer"
            aria-label={`Play ${clip.title}`}
          >
            <img src={thumb(clip.youtubeId)} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
            {clip.duration && (
              <span className="absolute bottom-2 right-2 bg-foreground/80 text-background text-[10px] font-display font-700 px-1.5 py-0.5 rounded-sm">{clip.duration}</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>

    {/* Info */}
    <div className="p-3 flex flex-col gap-1 flex-1">
      <div className="flex items-center gap-2">
        {clip.tag && <TagBadge tag={clip.tag} />}
      </div>
      <h4 className="font-display font-700 text-sm text-foreground leading-snug mt-1">{clip.title}</h4>
      <p className="text-muted-foreground font-body text-xs leading-relaxed line-clamp-2">{clip.description}</p>
      {clip.channel && (
        <span className="text-muted-foreground/70 font-body text-[10px] mt-auto pt-1">{clip.channel}</span>
      )}
    </div>
  </motion.div>
);

/* ── Tag badge ───────────────────────────────────────── */
const TagBadge = ({ tag }: { tag: string }) => {
  const c = tagColour(tag);
  return (
    <span className={`text-[10px] font-display font-700 uppercase tracking-wider ${c.bg} ${c.text} px-1.5 py-0.5 rounded-sm`}>
      {tag}
    </span>
  );
};

export default VideoShowcase;
