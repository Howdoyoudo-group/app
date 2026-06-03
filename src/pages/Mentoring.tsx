import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import MentoringPanel from "@/components/MentoringPanel";
import { INDUSTRIES } from "@/data/industries";

export default function Mentoring() {
  const [industry, setIndustry] = useState<string>("");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Mentoring | Howdy"
        description="Free 30-minute mentoring with people working in the industries you love. Vetted programmes plus members offering their time."
        path="/mentoring"
      />
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        <p className="text-foreground text-xs tracking-[0.3em] uppercase font-body mb-3">
          How do you do<span className="text-primary">?</span>
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-900 leading-[0.9] tracking-tight mb-4">
          Mentoring<span className="text-primary">.</span>
        </h1>
        <p className="text-muted-foreground font-body text-lg max-w-2xl mb-8">
          30 minutes with someone who's done it. Pick an industry to see vetted programmes and members offering their time.
        </p>

        <div className="mb-10 max-w-md">
          <label className="block text-xs uppercase tracking-widest font-700 mb-2">Filter by industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full border-2 border-foreground bg-background px-3 py-2 font-body"
          >
            <option value="">All industries</option>
            {INDUSTRIES.map((i) => (
              <option key={i.slug} value={i.slug}>{i.name}</option>
            ))}
          </select>
        </div>

        <MentoringPanel
          industrySlug={industry || undefined}
          industryName={INDUSTRIES.find((i) => i.slug === industry)?.name}
        />
      </div>
    </div>
  );
}
