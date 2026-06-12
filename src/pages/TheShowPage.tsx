import { Image as ImageIcon } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const LIME = "hsl(120, 100%, 45%)";

const STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/the-show/gallery";

const GALLERY_PHOTOS: { id: number; src?: string; alt: string }[] = [
  { id: 2, src: `${STORAGE}/photo-2.jpg`, alt: "Live show audience" },
  { id: 3, src: `${STORAGE}/photo-3.jpg`, alt: "Filming at Tower Bridge" },
  { id: 4, src: `${STORAGE}/photo-4.jpg`, alt: "Interview at the show" },
  { id: 5, src: `${STORAGE}/photo-5.jpg`, alt: "Woody with the Howdoyoudo mic" },
  { id: 7, src: `${STORAGE}/photo-7.png`, alt: "What's Next billboard at Shoreditch High Street" },
  { id: 8, src: `${STORAGE}/photo-8.jpg`, alt: "Howdoyoudo t-shirts" },
];

const FEATURED_VIDEOS = [
  {
    id: "explainer",
    title: "HDYD Explainer — What is Howdoyoudo?",
    description: "Everything we're building, why it matters, and who it's for. Two minutes that explain it all.",
    url: "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/the-show/videos/hdyd-explainer-v6.mp4#t=0.001",
    muted: true,
  },
  {
    id: "promo",
    title: "How Do You Do — The Show",
    description: "A taste of what we're building. Real people, real industries, no corporate fluff.",
    url: "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/email-assets/promo-web.mp4#t=0.001",
    muted: true,
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

        {/* Featured videos */}
        <section className="mb-16 md:mb-24">
          <div className="flex items-baseline gap-3 mb-8">
            <h2 className="font-display font-900 text-2xl md:text-3xl uppercase tracking-tight">
              Watch<span style={{ color: LIME }}>.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURED_VIDEOS.map((v) => (
              <div key={v.id} className="border-2 border-foreground rounded-2xl overflow-hidden">
                <div className="aspect-video bg-black overflow-hidden">
                  <video
                    src={v.url}
                    controls
                    playsInline
                    muted={v.muted}
                    preload="metadata"
                    className="w-full h-full object-cover"
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
        </section>

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


      </main>

      <Footer />
    </div>
  );
}
