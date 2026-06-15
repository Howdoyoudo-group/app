import { Image as ImageIcon } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const LIME = "hsl(120, 100%, 45%)";

const STORAGE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/the-show/gallery";

const GALLERY_PHOTOS: { id: number; src?: string; alt: string }[] = [
  { id: 2, src: `${STORAGE}/photo-2.jpg`, alt: "Live show audience" },
  { id: 4, src: `${STORAGE}/photo-4.jpg`, alt: "Interview at the show" },
  { id: 5, src: `${STORAGE}/photo-5.jpg`, alt: "Woody with the Howdoyoudo mic" },
  { id: 7, src: `${STORAGE}/photo-7.png`, alt: "What's Next billboard at Shoreditch High Street" },
  { id: 9, src: `${STORAGE}/photo-9.jpg`, alt: "HDYD interview at an event" },
  { id: 10, src: `${STORAGE}/photo-10.jpg`, alt: "Street interview with the HDYD mic" },
  { id: 11, src: `${STORAGE}/photo-11.jpg`, alt: "Filming on location" },
  { id: 12, src: `${STORAGE}/photo-12.jpg`, alt: "Behind the scenes on a shoot" },
  { id: 13, src: `${STORAGE}/photo-13.jpg`, alt: "HDYD crew on location" },
  { id: 14, src: `${STORAGE}/photo-14.jpg`, alt: "Street interview by the Thames" },
  { id: 15, src: `${STORAGE}/photo-15.jpg`, alt: "Filming in London" },
  { id: 16, src: `${STORAGE}/photo-16.jpg`, alt: "HDYD crew preparing for a shoot" },
  { id: 17, src: `${STORAGE}/photo-17.jpg`, alt: "On location interview" },
];

const FEATURED_VIDEOS = [
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
                  <iframe
                    src={v.embedUrl}
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
