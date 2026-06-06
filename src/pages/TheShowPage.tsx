import { useState } from "react";
import { Tv, Play, Image as ImageIcon, Film } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const LIME = "hsl(120, 100%, 45%)";

const STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/the-show/gallery";

const GALLERY_PHOTOS: { id: number; src?: string; alt: string }[] = [
  { id: 1, src: `${STORAGE}/photo-1.jpg`, alt: "The Howdoyoudo mic" },
  { id: 2, src: `${STORAGE}/photo-2.jpg`, alt: "Live show audience" },
  { id: 3, src: `${STORAGE}/photo-3.jpg`, alt: "Filming at Tower Bridge" },
  { id: 4, src: `${STORAGE}/photo-4.jpg`, alt: "Interview at the show" },
  { id: 5, src: `${STORAGE}/photo-5.jpg`, alt: "Host with mic" },
  { id: 6, src: `${STORAGE}/photo-6.jpg`, alt: "Interview at All Points East" },
];

// ── Add short films / vox pops here ─────────────────────────
// Add url and thumbnail when videos are live
const VIDEO_STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/the-show/videos";

const SHORT_FILMS: { id: number; title: string; description?: string; url?: string; thumbnail?: string }[] = [
  {
    id: 1,
    title: "How did you get into media?",
    description: "We hit the streets and asked someone working in media how they actually got there.",
    url: `${VIDEO_STORAGE}/video-2316.mp4`,
  },
  {
    id: 2,
    title: "The doctor who went viral",
    description: "A qualified doctor tells us why they became a content creator — and how both worlds collide.",
    url: `${VIDEO_STORAGE}/video-2317.mp4`,
  },
  {
    id: 3,
    title: "How did you get where you are?",
    description: "Real people, unscripted. We asked — they answered.",
    url: `${VIDEO_STORAGE}/video-2318.mp4`,
  },
];

export default function TheShowPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO path="/the-show" title="The Show — Howdoyoudo?" />
      <SiteNav />

      <main className="px-6 md:px-12 max-w-6xl mx-auto py-16 md:py-24">

        {/* Header */}
        <div className="mb-14 md:mb-20">
          <p className="font-display font-700 text-xs uppercase tracking-[0.2em] text-primary mb-3">
            Howdoyoudo Originals
          </p>
          <h1 className="font-display font-900 text-5xl md:text-7xl uppercase tracking-tight leading-[0.9] mb-6">
            The Show<span style={{ color: LIME }}>.</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Real people, real stories. Our growing community of experts, writers and comics are making clips, interviews and in-depth stories — all going inside the industries we love. The funny and unglamorous bits, the unexpected paths and meeting the people that make things work.
          </p>
        </div>

        {/* Gallery */}
        <section className="mb-16 md:mb-24">
          <div className="flex items-baseline gap-3 mb-8">
            <h2 className="font-display font-900 text-2xl md:text-3xl uppercase tracking-tight">
              Our gallery<span style={{ color: LIME }}>.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-fr">
            {GALLERY_PHOTOS.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square border-2 border-foreground/20 bg-foreground/5 overflow-hidden flex items-center justify-center"
              >
                {photo.src ? (
                  <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-foreground/20">
                    <ImageIcon className="w-8 h-8" />
                    <span className="font-display font-700 text-[10px] uppercase tracking-wide">Add photo</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Short films */}
        <section>
          <div className="flex items-baseline gap-3 mb-8">
            <h2 className="font-display font-900 text-2xl md:text-3xl uppercase tracking-tight">
              Our short stories<span style={{ color: LIME }}>.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SHORT_FILMS.map((film) => (
              <div
                key={film.id}
                className="group border-2 border-foreground/20 bg-card overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-foreground/5 flex items-center justify-center overflow-hidden">
                  {film.thumbnail ? (
                    <img src={film.thumbnail} alt={film.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-foreground/5 to-foreground/10 flex flex-col items-center justify-center gap-2">
                      <Film className="w-8 h-8 text-foreground/20" />
                      <span className="font-display font-700 text-[10px] uppercase tracking-wide text-foreground/20">Add video</span>
                    </div>
                  )}
                  {film.url && (
                    <a
                      href={film.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="w-14 h-14 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shadow-[3px_3px_0_hsl(var(--foreground))] group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
                      </span>
                    </a>
                  )}
                </div>
                {/* Info */}
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
        </section>

      </main>

      <Footer />
    </div>
  );
}
