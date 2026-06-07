import { motion } from "framer-motion";
import { Play } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const FEATURED_VIDEOS = [
  {
    title: "How Do You Do — Voxpops",
    description: "Real people, real careers. Hear from young people and industry insiders about how they got where they are.",
    src: "https://https-howdoyoudo-group.lovable.app/__l5e/assets-v1/867b66a7-10b5-43f6-9316-a1c231af2265/hdyd-voxpops-v6.mp4",
    poster: "/videos/hdyd-voxpops-1-poster.jpg",
    tag: "Howdoyoudo",
  },
];

const INDUSTRY_VIDEOS = [
  {
    industry: "Football",
    title: "Inside Football — How the game really works",
    description: "From the training pitch to the boardroom — who makes the decisions, where the money goes, and what the jobs actually look like.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tag: "Industry",
  },
  {
    industry: "Music",
    title: "The Music Industry Explained",
    description: "How streaming changed everything, where the money comes from and what it actually takes to build a career in music.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tag: "Industry",
  },
  {
    industry: "Fashion",
    title: "Fashion Careers — Beyond the Catwalk",
    description: "Designers, buyers, stylists, marketers — the full picture of how the fashion industry employs people you'd never expect.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tag: "Industry",
  },
];

const CAREER_VIDEOS = [
  {
    title: "How to Write a CV That Gets Noticed",
    description: "The exact format recruiters want to see, what to put in each section, and the mistakes that get you binned immediately.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tag: "CV & Applications",
  },
  {
    title: "How to Ace a Job Interview",
    description: "From preparation to the hardest questions — a practical guide to interviews that actually works.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tag: "Interviews",
  },
  {
    title: "Side Hustles That Actually Work",
    description: "Six real side hustles you can start this weekend — with honest numbers and what it takes to make them work.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tag: "Side Hustles",
  },
  {
    title: "Apprenticeships vs University — The Real Comparison",
    description: "No spin. What each path actually looks like, what you earn, what you learn, and who each is right for.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tag: "Education",
  },
];

export default function Videos() {
  return (
    <>
      <SEO
        title="Videos | Howdoyoudo?"
        description="Watch career stories, industry explainers, CV guides and inspiration from real people who've done it."
      />

      <main className="min-h-screen bg-background">
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-5xl mx-auto">

          {/* Hero */}
          <motion.div {...fadeUp} className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-foreground/20 bg-background mb-4">
              <Play className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="font-display font-700 text-xs uppercase tracking-widest">Videos</span>
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground mb-4">
              Watch & learn.
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl">
              Real career stories, industry explainers and practical guides — from people who've actually done it.
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
                  <video
                    src={v.src}
                    poster={v.poster}
                    controls
                    playsInline
                    muted
                    preload="metadata"
                    controlsList="nodownload noplaybackrate"
                    className="w-full aspect-video object-cover bg-foreground/5"
                  />
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

          {/* Career guides */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-14"
          >
            <h2 className="font-display font-900 text-xl md:text-2xl uppercase tracking-wide mb-5">Career Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CAREER_VIDEOS.map((v) => (
                <div key={v.title} className="border-2 border-foreground/20 rounded-2xl overflow-hidden hover:border-foreground transition-colors">
                  <div className="aspect-video bg-foreground/5 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary border-2 border-foreground flex items-center justify-center">
                      <Play className="w-5 h-5 fill-foreground text-foreground ml-0.5" />
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="inline-block font-display font-700 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-foreground/10 border border-foreground/20 mb-2">
                      {v.tag}
                    </span>
                    <h3 className="font-display font-900 text-sm uppercase tracking-wide mb-1">{v.title}</h3>
                    <p className="font-body text-xs text-muted-foreground">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="font-body text-xs text-muted-foreground mt-4 px-1">More videos coming soon as The Show launches.</p>
          </motion.section>

          {/* The Show CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border-2 border-foreground rounded-3xl p-6 md:p-8 bg-primary/5 text-center"
          >
            <h2 className="font-display font-900 text-2xl uppercase tracking-wide mb-2">The Show is coming.</h2>
            <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Our original interview series — founders, experts, young people and comedians unpacking the industries you love. Watch this space.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-foreground bg-foreground/10 font-display font-900 text-sm uppercase tracking-wide text-foreground/60 cursor-not-allowed">
              <Play className="w-4 h-4" />
              Coming Soon
            </div>
          </motion.div>

        </section>
      </main>
      <Footer />
    </>
  );
}
