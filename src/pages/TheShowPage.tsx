import { useState } from "react";
import { Tv, Bell, Play } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const LIME = "hsl(120, 100%, 45%)";

// Add your vox pop videos here — swap url/thumbnail when they go live on YouTube/socials
const VOX_POPS: { id: number; title: string; description?: string; industry?: string; url?: string; thumbnail?: string }[] = [
  { id: 1, title: "What does nobody tell you about working in football?", industry: "Football" },
  { id: 2, title: "How did you actually get your first job in fashion?", industry: "Fashion" },
  { id: 3, title: "What's the worst career advice you ever got?", industry: "All industries" },
  { id: 4, title: "Would you do it all again?", industry: "Music" },
  { id: 5, title: "What do you wish you'd known at 21?", industry: "Film & TV" },
  { id: 6, title: "What's one thing that changed everything for you?", industry: "Hospitality" },
];

export default function TheShowPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/the-show" title="The Show — Howdoyoudo?" />
      <SiteNav />

      <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border-2 border-foreground px-3 py-1.5 mb-8 shadow-[2px_2px_0_hsl(var(--foreground))]">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-display font-700 text-[11px] uppercase tracking-[0.2em]">
              Coming Soon
            </span>
          </div>

          {/* Headline */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 border-2 border-foreground bg-foreground flex items-center justify-center shrink-0 shadow-[3px_3px_0_hsl(var(--primary))]">
              <Tv className="w-8 h-8 text-background" />
            </div>
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-[0.2em] text-primary mb-1">
                Howdoyoudo Originals
              </p>
              <h1
                className="font-display font-900 text-5xl md:text-7xl uppercase tracking-tight leading-[0.9]"
              >
                The Show<span style={{ color: LIME }}>.</span>
              </h1>
            </div>
          </div>

          {/* Description */}
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
            Real people. Real careers. No filter.
            Our original series goes inside the industries you love —
            the unglamorous bits, the unexpected paths, the people who made it work.
          </p>

          {/* Notify form */}
          {submitted ? (
            <div className="border-2 border-primary bg-primary/10 px-6 py-4 inline-flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <p className="font-display font-700 text-sm uppercase tracking-wide">
                You're on the list. We'll be in touch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 border-2 border-foreground bg-background px-4 py-3 font-body text-base focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="border-2 border-foreground bg-primary px-6 py-3 font-display font-700 text-sm uppercase tracking-wider shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all whitespace-nowrap"
              >
                Notify me
              </button>
            </form>
          )}

          {/* Hint */}
          <p className="font-body text-xs text-muted-foreground mt-4">
            No spam. Just a heads-up when we launch.
          </p>
        </div>
      </main>

      {/* Vox pop section */}
      <section className="border-t-2 border-foreground/10 px-4 md:px-12 py-16 md:py-20 max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="font-display font-700 text-xs uppercase tracking-[0.2em] text-primary mb-2">
            While you wait
          </p>
          <h2 className="font-display font-900 text-3xl md:text-5xl uppercase tracking-tight leading-tight">
            See what the community<br />have been saying<span style={{ color: LIME }}>.</span>
          </h2>
          <p className="font-body text-muted-foreground mt-3 max-w-lg">
            Why don't you see what people have been saying about Howdoyoudo — in their own words.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VOX_POPS.map((clip) => (
            <div
              key={clip.id}
              className="group border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-foreground/5 flex items-center justify-center overflow-hidden">
                {clip.thumbnail ? (
                  <img src={clip.thumbnail} alt={clip.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-foreground/5 to-foreground/10 flex items-center justify-center">
                    <Tv className="w-10 h-10 text-foreground/20" />
                  </div>
                )}
                {clip.url ? (
                  <a
                    href={clip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label={`Watch ${clip.title}`}
                  >
                    <span className="w-14 h-14 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shadow-[3px_3px_0_hsl(var(--foreground))] group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
                    </span>
                  </a>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-primary/30 border-2 border-foreground/30 flex items-center justify-center">
                      <Play className="w-6 h-6 text-foreground/40 fill-foreground/40 ml-0.5" />
                    </span>
                  </div>
                )}
                {/* Industry tag */}
                {clip.industry && (
                  <span className="absolute top-2 left-2 bg-foreground text-background font-display font-700 text-[10px] uppercase tracking-wider px-2 py-0.5">
                    {clip.industry}
                  </span>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <p className="font-display font-900 text-sm uppercase tracking-wide text-foreground leading-snug mb-1">
                  {clip.title}
                </p>
                {clip.description && (
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {clip.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
