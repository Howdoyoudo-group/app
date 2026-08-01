import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Search, X, ChevronDown } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { CompanyProfileGrid } from "@/components/CompanyProfileCard";
import { ALL_COMPANIES_BY_INDUSTRY } from "@/data/all-companies";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndustries, setExpandedIndustries] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredByIndustry = useMemo(() => {
    const result: Record<string, typeof ALL_COMPANIES_BY_INDUSTRY[keyof typeof ALL_COMPANIES_BY_INDUSTRY]> = {};

    for (const [industry, companies] of Object.entries(ALL_COMPANIES_BY_INDUSTRY)) {
      if (!searchQuery.trim()) {
        result[industry] = companies;
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = companies.filter(company =>
          company.name.toLowerCase().includes(query)
        );
        if (filtered.length > 0) {
          result[industry] = filtered;
        }
      }
    }

    return result;
  }, [searchQuery]);

  const industryList = Object.keys(filteredByIndustry).sort();

  return (
    <>
      <SEO
        title="Companies | Howdoyoudo?"
        description="Discover all the companies we feature across 30+ industries. Explore company profiles and find where you might want to work."
        path="/companies"
      />
      <main className="min-h-screen bg-background">
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-5xl mx-auto">
          {/* Header */}
          <motion.div {...fadeUp} className="mb-12">
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground mb-4">
              Explore Companies.
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl">
              Browse companies across all industries. Check out company profiles, see what employees say, and find where your values align.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div {...fadeUp} className="mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search companies or industries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Results by Industry */}
          {industryList.length > 0 ? (
            <div className="space-y-4 md:space-y-12">
              {industryList.map((industry) => {
                const companiesInIndustry = filteredByIndustry[industry];
                if (!companiesInIndustry || companiesInIndustry.length === 0) return null;

                const isExpanded = expandedIndustries[industry] ?? false;

                const toggleIndustry = () => {
                  setExpandedIndustries((prev) => ({
                    ...prev,
                    [industry]: !prev[industry],
                  }));
                };

                return (
                  <motion.section key={industry} {...fadeUp} className="md:space-y-6">
                    {/* Mobile: Collapsible header */}
                    <button
                      onClick={toggleIndustry}
                      className="w-full md:hidden flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <h2 className="font-display font-700 text-lg text-left">
                        {industry}
                      </h2>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Desktop: Always visible, Mobile: Conditionally visible */}
                    {isExpanded || !isMobile ? (
                      <>
                        <div className="hidden md:block">
                          <h2 className="font-display font-700 text-2xl mb-6">
                            {industry}
                          </h2>
                        </div>
                        <CompanyProfileGrid companies={companiesInIndustry as any} title="" subtitle="" />
                      </>
                    ) : null}
                  </motion.section>
                );
              })}
            </div>
          ) : (
            <motion.div {...fadeUp} className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-700 text-xl mb-2">No companies found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords or{" "}
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary font-600 hover:underline"
                >
                  clear your search
                </button>
              </p>
            </motion.div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
