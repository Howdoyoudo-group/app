import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { INDUSTRIES } from "@/data/industries";
import IndustryDoodle from "@/components/feed/IndustryDoodle";
import { Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function EventsPage() {
  const { user } = useAuth();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null); // null = loading
  const [orderedIndustries, setOrderedIndustries] = useState(INDUSTRIES);

  // On mount: load user's industry_interests and default to first one (or first alphabetically)
  useEffect(() => {
    async function loadPrefs() {
      if (!user) {
        // Not logged in — default to first industry alphabetically
        const sorted = [...INDUSTRIES].sort((a, b) => a.name.localeCompare(b.name));
        setOrderedIndustries(sorted);
        setSelectedIndustry(sorted[0]?.name ?? "All");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("industry_interests")
        .eq("id", user.id)
        .single();
      const interests: string[] = data?.industry_interests ?? [];

      // Sort industries: preferred ones first (in order), then rest alphabetically
      const preferredSlugs = new Set(
        interests.map((name) => {
          const match = INDUSTRIES.find(
            (i) => i.name.toLowerCase() === name.toLowerCase() || i.slug === name.toLowerCase()
          );
          return match?.name ?? name;
        })
      );
      const preferred = INDUSTRIES.filter((i) => preferredSlugs.has(i.name));
      const rest = [...INDUSTRIES]
        .filter((i) => !preferredSlugs.has(i.name))
        .sort((a, b) => a.name.localeCompare(b.name));
      const ordered = [...preferred, ...rest];
      setOrderedIndustries(ordered);

      // Default selection: first preferred industry (or first in list)
      const defaultIndustry = preferred[0]?.name ?? ordered[0]?.name ?? "All";
      setSelectedIndustry(defaultIndustry);
    }
    loadPrefs();
  }, [user]);

  if (selectedIndustry === null) return null; // brief loading pause before render

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

        {/* Industry filter — swipeable, preferred industries first */}
        <div className="bg-background rounded-2xl border-2 border-foreground/10 shadow-sm px-4 py-3 mb-8">
          <div className="flex gap-3 overflow-x-auto pt-1 pb-1 px-1 scrollbar-hide snap-x">
            {orderedIndustries.map((ind) => {
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
          industry={selectedIndustry}
          searchQuery=""
        />
      </div>

      <Footer />
    </div>
  );
}
