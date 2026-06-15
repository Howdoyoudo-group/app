import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import SiteNav from "@/components/SiteNav";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const VIDEO_STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/the-show/videos";
const VOXPOPS_STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/voxpops";

const FEATURED_VIDEOS = [
  {
    title: "How Do You Do — Voxpops",
    description: "Real people, real careers. Hear from young people and industry insiders about how they got where they are.",
    src: `${VOXPOPS_STORAGE}/general-interviews-.mp4#t=0.001`,
    tag: "Howdoyoudo",
  },
];

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
];

const SHORT_FILMS: { id: number; title: string; description?: string; url?: string }[] = [
  {
    id: 1,
    title: "How did you get into media?",
    description: "We hit the streets and asked someone working in media how they actually got there.",
    url: `${VIDEO_STORAGE}/video-2316.mp4#t=0.001`,
  },
  {
    id: 2,
    title: "The doctor who went viral",
    description: "A qualified doctor tells us why they became a content creator — and how both worlds collide.",
    url: `${VIDEO_STORAGE}/video-2317.mp4#t=0.001`,
  },
  {
    id: 3,
    title: "How did you get where you are?",
    description: "Real people, unscripted. We asked — they answered.",
    url: `${VIDEO_STORAGE}/video-2318.mp4#t=0.001`,
  },
];

export default function Videos() {
  return (
    <>
      <SEO
        title="Videos | Howdoyoudo?"
        description="Watch career stories, industry explainers and inspiration from real people who've done it."
      />

      <SiteNav />
      <main className="min-h-screen bg-background">
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-5xl mx-auto">

          {/* Hero */}
          <motion.div {...fadeUp} className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-foreground/20 bg-background mb-4">
              <Play className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="font-display font-700 text-xs uppercase tracking-widest">Videos</span>
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground mb-4">
              Watch.
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl">
              Real career stories and inspiration — from people who've actually done it.
            </p>
          </motion.div>

          {/* Featured */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-14"
          >
            <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-5">Featured</h2>
            <div className="grid grid-cols-1 gap-6">
              {FEATURED_VIDEOS.map((v) => (
                <div key={v.title} className="border-2 border-foreground rounded-2xl overflow-hidden">
                  {/* cap height on desktop so Short Stories stay visible without scrolling */}
                  <div className="relative w-full" style={{ paddingTop: "min(56.25%, 420px)" }}>
                    <video
                      src={v.src}
                      controls
                      playsInline
                      muted
                      preload="metadata"
                      controlsList="nodownload noplaybackrate"
                      className="absolute inset-0 w-full h-full object-cover bg-foreground/5"
                    />
                  </div>
                  <div className="p-4">
                    <span className="inline-block font-display font-700 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary border border-foreground mb-2">
                      {v.tag}
                    </span>
                    <h3 className="font-display font-900 text-lg uppercase tracking-wide mb-1">{v.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Voxpops */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mb-14"
          >
            <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-5">Voxpops</h2>
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

          {/* Short stories */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-14"
          >
            <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-5">Our Short Stories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SHORT_FILMS.map((film) => (
                <div key={film.id} className="border-2 border-foreground rounded-2xl overflow-hidden">
                  <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
                    <video
                      src={film.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-display font-900 text-sm uppercase tracking-wide text-foreground leading-snug">
                      {film.title}
                    </p>
                    {film.description && (
                      <p className="font-body text-xs text-muted-foreground leading-relaxed mt-1">
                        {film.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* The Show CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border-2 border-foreground rounded-3xl p-6 md:p-8 bg-primary/5 text-center"
          >
            <h2 className="font-display font-900 text-2xl uppercase tracking-wide mb-2">See The Show.</h2>
            <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              More clips, stories and interviews from the industries you love.
            </p>
            <Link
              to="/the-show"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-foreground bg-primary font-display font-900 text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
            >
              Go to The Show <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        </section>
      </main>
      <Footer />
    </>
  );
}
