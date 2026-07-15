import { useState } from "react";
import { motion } from "framer-motion";
import { Clapperboard } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const LIME = "hsl(120, 100%, 45%)";

const VIDEO_STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/the-show/videos";
const VOXPOPS_STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/voxpops";
const SXSW_STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/the-show/voxpops";
const GALLERY_STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/the-show/gallery";

// ─── THE SHOW: full episodes + teasers ───────────────────────────────────────
const SHOW_TEASERS = [
  {
    id: "explainer",
    title: "HDYD Explainer — What is Howdoyoudo?",
    description: "Everything we're building, why it matters, and who it's for. Two minutes that explain it all.",
    embedUrl: "https://www.youtube.com/embed/o0YUzxz4eSs?rel=0&modestbranding=1",
  },
  {
    id: "promo",
    title: "HDYD Explainer Film — Start with what you love",
    description: "Who we are, what we're building, and why. Watch the full explainer.",
    embedUrl: "https://www.youtube.com/embed/NrYsqaJRqFo?rel=0&modestbranding=1",
  },
];

// ─── PITCH OVER A PINT ───────────────────────────────────────────────────────
const PITCH_VIDEOS = [
  {
    id: "elma",
    title: "Pitch Over a Pint — Episode 1",
    description: "Elma pitches her idea over a pint. Real ambition, no boardroom.",
    src: `${VIDEO_STORAGE}/hdyd-pop-elma.mp4#t=0.001`,
    poster: "/videos/hdyd-pop-poster.jpg",
  },
];

// ─── WHAT THE STREETS ARE SAYING: all vox pops ───────────────────────────────
const VOXPOPS = [
  {
    id: "general",
    title: "General Interviews",
    description: "Real people on the street — we asked, they answered.",
    src: `${VOXPOPS_STORAGE}/general-interviews-.mp4#t=0.001`,
  },
  {
    id: "dream-job",
    title: "What's your dream job?",
    description: "We asked people what they'd do if they could do anything.",
    src: `${VOXPOPS_STORAGE}/tiktok-dream-job.mp4#t=0.001`,
  },
  {
    id: "guess-sound",
    title: "Guess the job — sound edition",
    description: "Can you guess the industry from the sound alone?",
    src: `${VOXPOPS_STORAGE}/tiktok-guess-sound.mp4#t=0.001`,
  },
  {
    id: "guess-job",
    title: "Guess their job",
    description: "We put people to the test — can you spot the career from the person?",
    src: `${VOXPOPS_STORAGE}/tiktok-guess-their-job.mp4#t=0.001`,
  },
  {
    id: "what-industry",
    title: "What industry are you in?",
    description: "Straight from the street — the industries people are actually working in.",
    src: `${VOXPOPS_STORAGE}/tiktok-what-industry.mp4#t=0.001`,
  },
  {
    id: "sxsw-mashup",
    title: "What advice would you give? — SXSW",
    description: "We asked people at SXSW what advice they'd give to someone starting out in their industry.",
    src: `${SXSW_STORAGE}/SXSW%20Voxpop%20MASHUP-what%20advice%20would%20you%20give%3F.mp4#t=0.001`,
  },
  {
    id: "sxsw-1",
    title: "SXSW Voxpop 1",
    description: "Voices from SXSW — real people, real careers.",
    src: `${SXSW_STORAGE}/SXSW%20Voxpop%201.mp4#t=0.001`,
  },
  {
    id: "sxsw-2",
    title: "SXSW Voxpop 2",
    description: "Voices from SXSW — real people, real careers.",
    src: `${SXSW_STORAGE}/SXSW%20Voxpop%202.mp4#t=0.001`,
  },
  {
    id: "sxsw-3",
    title: "SXSW Voxpop 3",
    description: "Voices from SXSW — real people, real careers.",
    src: `${SXSW_STORAGE}/SXSW%20Voxpop%203.mp4#t=0.001`,
  },
  {
    id: "sxsw-4",
    title: "SXSW Voxpop 4",
    description: "Voices from SXSW — real people, real careers.",
    src: `${SXSW_STORAGE}/SXSW%20Voxpop%204.mp4#t=0.001`,
  },
  {
    id: "sxsw-5",
    title: "SXSW Voxpop 5",
    description: "Voices from SXSW — real people, real careers.",
    src: `${SXSW_STORAGE}/SXSW%20Voxpop%205.mp4#t=0.001`,
  },
];

// ─── GALLERY ─────────────────────────────────────────────────────────────────
const GALLERY_PHOTOS: { id: number; src?: string; alt: string }[] = [
  { id: 2, src: `${GALLERY_STORAGE}/photo-2.jpg`, alt: "Live show audience" },
  { id: 4, src: `${GALLERY_STORAGE}/photo-4.jpg`, alt: "Interview at the show" },
  { id: 5, src: `${GALLERY_STORAGE}/photo-5.jpg`, alt: "Woody with the Howdoyoudo mic" },
  { id: 7, src: `${GALLERY_STORAGE}/photo-7.png`, alt: "What's Next billboard at Shoreditch High Street" },
  { id: 9, src: `${GALLERY_STORAGE}/photo-9.jpg`, alt: "HDYD interview at an event" },
  { id: 10, src: `${GALLERY_STORAGE}/photo-10.jpg`, alt: "Street interview with the HDYD mic" },
  { id: 11, src: `${GALLERY_STORAGE}/photo-11.jpg`, alt: "Filming on location" },
  { id: 12, src: `${GALLERY_STORAGE}/photo-12.jpg`, alt: "Behind the scenes on a shoot" },
  { id: 13, src: `${GALLERY_STORAGE}/photo-13.jpg`, alt: "HDYD crew on location" },
  { id: 14, src: `${GALLERY_STORAGE}/photo-14.jpg`, alt: "Street interview by the Thames" },
  { id: 15, src: `${GALLERY_STORAGE}/photo-15.jpg`, alt: "Filming in London" },
  { id: 17, src: `${GALLERY_STORAGE}/photo-17.jpg`, alt: "On location interview" },
  { id: 18, src: `${GALLERY_STORAGE}/photo-18.png`, alt: "Howdoyoudo Jobs marketplace" },
];

const TABS = [
  { id: "show", label: "The Show" },
  { id: "pitch", label: "Pitch Over a Pint" },
  { id: "streets", label: "What the Streets Are Saying" },
  { id: "gallery", label: "Gallery" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

export default function TheShowPage() {
  const [tab, setTab] = useState<TabId>("show");

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/the-show" title="The HDYD Show — Howdoyoudo?" description="Full episodes, Pitch Over a Pint, street interviews and photos — all the Howdoyoudo original content in one place." />
      <SiteNav />

      <main className="px-4 sm:px-6 md:px-12 max-w-6xl mx-auto py-12 md:py-20">

        {/* Header */}
        <div className="mb-10 md:mb-14">
          <p className="font-display font-700 text-xs uppercase tracking-[0.2em] text-primary mb-3">
            Howdoyoudo Originals
          </p>
          <h1 className="font-display font-900 text-5xl md:text-7xl uppercase tracking-tight leading-[0.9] mb-6">
            The HDYD Show<span style={{ color: LIME }}>.</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Real people, real stories — going inside the industries we love. Full episodes, pitches over a pint, voices from the street, and everything in between.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-10 md:mb-14">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`font-display font-900 text-xs sm:text-sm uppercase tracking-wide px-4 py-2.5 rounded-full border-2 border-foreground transition-colors min-h-[44px] ${
                  active ? "bg-primary text-foreground" : "bg-background text-foreground hover:bg-foreground/5"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── THE SHOW ── */}
        {tab === "show" && (
          <motion.section key="show" {...fadeUp}>
            {/* Episode 1 — Coming Soon */}
            <div className="border-2 border-foreground rounded-2xl overflow-hidden mb-8">
              <div className="relative aspect-video bg-foreground/5 flex flex-col items-center justify-center gap-3 text-center px-6">
                <Clapperboard className="w-10 h-10 md:w-14 md:h-14 text-primary" />
                <p className="font-display font-900 text-2xl md:text-4xl uppercase tracking-tight">
                  Episode 1
                </p>
                <span className="font-display font-900 text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-primary border-2 border-foreground">
                  Coming Soon
                </span>
              </div>
              <div className="p-4">
                <p className="font-display font-900 text-sm uppercase tracking-wide">The first full episode</p>
                <p className="font-body text-xs text-muted-foreground leading-relaxed mt-1">
                  Our first full-length episode is on the way. Watch the teasers below while we finish it off.
                </p>
              </div>
            </div>

            <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-5">
              Teasers<span style={{ color: LIME }}>.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SHOW_TEASERS.map((v) => (
                <div key={v.id} className="border-2 border-foreground rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-black overflow-hidden">
                    <iframe
                      src={v.embedUrl}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      style={{ border: 0 }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-display font-900 text-sm uppercase tracking-wide text-foreground leading-snug">
                      {v.title}
                    </p>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed mt-1">
                      {v.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── PITCH OVER A PINT ── */}
        {tab === "pitch" && (
          <motion.section key="pitch" {...fadeUp}>
            <div className="grid grid-cols-1 gap-6 max-w-3xl">
              {PITCH_VIDEOS.map((v) => (
                <div key={v.id} className="border-2 border-foreground rounded-2xl overflow-hidden">
                  <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
                    <video
                      src={v.src}
                      poster={v.poster}
                      controls
                      playsInline
                      preload="metadata"
                      controlsList="nodownload noplaybackrate"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <span className="inline-block font-display font-700 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary border border-foreground mb-2">
                      Pitch Over a Pint
                    </span>
                    <h3 className="font-display font-900 text-lg uppercase tracking-wide mb-1">{v.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── WHAT THE STREETS ARE SAYING ── */}
        {tab === "streets" && (
          <motion.section key="streets" {...fadeUp}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {VOXPOPS.map((v) => (
                <div key={v.id} className="border-2 border-foreground rounded-2xl overflow-hidden flex flex-col">
                  <div className="relative w-full bg-black" style={{ paddingTop: "177.78%" }}>
                    <video
                      src={v.src}
                      controls
                      playsInline
                      preload="metadata"
                      controlsList="nodownload noplaybackrate"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-display font-900 text-xs uppercase tracking-wide text-foreground leading-snug">
                      {v.title}
                    </p>
                    <p className="font-body text-[11px] text-muted-foreground leading-relaxed mt-1">
                      {v.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── GALLERY ── */}
        {tab === "gallery" && (
          <motion.section key="gallery" {...fadeUp}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-fr">
              {GALLERY_PHOTOS.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square border-2 border-foreground/20 bg-foreground/5 overflow-hidden flex items-center justify-center"
                >
                  {photo.src ? (
                    <img src={photo.src} alt={photo.alt} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-foreground/20">
                      <span className="font-display font-700 text-[10px] uppercase tracking-wide">Add photo</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

      </main>

      <Footer />
    </div>
  );
}
