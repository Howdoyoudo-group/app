import { useState } from "react";
import SiteNav from "@/components/SiteNav";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { INDUSTRIES } from "@/data/industries";

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

        {/* Industry filter chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setSelectedIndustry("All")}
            className={`px-3 py-1.5 border-2 font-display font-700 text-xs uppercase tracking-wide transition-colors ${
              selectedIndustry === "All"
                ? "border-foreground bg-primary"
                : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            All
          </button>
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.slug}
              onClick={() => setSelectedIndustry(ind.name)}
              className={`px-3 py-1.5 border-2 font-display font-700 text-xs uppercase tracking-wide transition-colors ${
                selectedIndustry === ind.name
                  ? "border-foreground bg-primary"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              {ind.name}
            </button>
          ))}
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
