import { useState } from "react";
import SiteNav from "@/components/SiteNav";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { INDUSTRIES } from "@/data/industries";
import IndustryDoodle from "@/components/feed/IndustryDoodle";
import { Circle } from "lucide-react";

export default function EventsPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/events" title="Events — Howdoyoudo?" />
      <SiteNav />

      <div className="container mx-auto px-4 md:px-8 pt-8 pb-4">
        <h1 className="font-display font-900 text-4xl md:text-5xl uppercase tracking-tight mb-2">
          Events<span className="text-primary">.</span>
        </h1>
        <p className="font-body text-muted-foreground mb-6">
          What's on across every industry.
        </p>

        {/* Industry filter doodles — swipeable */}
        <div className="bg-background rounded-2xl border-2 border-foreground/10 shadow-sm px-4 py-3 mb-8">
          <div className="flex gap-3 overflow-x-auto pt-1 pb-1 px-1 scrollbar-hide snap-x">
            {/* All button */}
            <button
              onClick={() => setSelectedIndustry("All")}
              className="shrink-0 snap-start flex flex-col items-center gap-1.5 w-[72px] focus:outline-none group"
              aria-pressed={selectedIndustry === "All"}
            >
              <span
                className={`relative inline-flex items-center justify-center rounded-full transition-all bg-foreground text-background ${
                  selectedIndustry === "All"
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-80 group-hover:opacity-100"
                }`}
                style={{ width: 56, height: 56 }}
              >
                <Circle size={28} strokeWidth={2.2} />
              </span>
              <span className={`font-display font-700 text-[9px] uppercase tracking-[0.06em] text-center leading-[1.15] w-full px-0.5 ${
                selectedIndustry === "All" ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              }`}>
                All
              </span>
            </button>

            {INDUSTRIES.map((ind) => {
              const active = selectedIndustry === ind.name;
              return (
                <button
                  key={ind.slug}
                  onClick={() => setSelectedIndustry(ind.name)}
                  className="shrink-0 snap-start flex flex-col items-center gap-1.5 w-[72px] focus:outline-none group"
                  aria-pressed={active}
                  aria-label={ind.name}
                >
                  <span
                    className={`relative inline-flex items-center justify-center rounded-full transition-all ${
                      active
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "opacity-80 group-hover:opacity-100"
                    }`}
                    style={{ width: 56, height: 56 }}
                  >
                    <IndustryDoodle industry={ind.slug} size={56} />
                  </span>
                  <span className={`font-display font-700 text-[9px] uppercase tracking-[0.06em] text-center leading-[1.15] break-words hyphens-auto w-full px-0.5 ${
                    active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}>
                    {ind.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pb-16">
        <EventsSection
          industry={selectedIndustry === "All" ? "" : selectedIndustry}
          searchQuery=""
        />
      </div>

      <Footer />
    </div>
  );
}
