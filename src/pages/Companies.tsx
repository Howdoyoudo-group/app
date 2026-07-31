import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Search, X } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { ALL_COMPANIES_BY_INDUSTRY } from "@/data/all-companies";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

// Flatten all companies from the comprehensive data
const ALL_COMPANIES = Object.entries(ALL_COMPANIES_BY_INDUSTRY).flatMap(([industry, companies]) =>
  companies.map(company => ({ ...company, industry }))
);

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return ALL_COMPANIES;

    const query = searchQuery.toLowerCase();
    return ALL_COMPANIES.filter(company =>
      company.name.toLowerCase().includes(query) ||
      company.industry.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const industryList = Object.keys(ALL_COMPANIES_BY_INDUSTRY).sort();

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
          {filteredCompanies.length > 0 ? (
            <div className="space-y-12">
              {industryList.map((industry) => {
                const companiesInIndustry = filteredCompanies.filter(c => c.industry === industry);
                if (companiesInIndustry.length === 0) return null;

                return (
                  <motion.section key={industry} {...fadeUp}>
                    <h2 className="font-display font-700 text-2xl mb-6">
                      {industry} <span className="text-primary">({companiesInIndustry.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {companiesInIndustry.map((company) => (
                        <div key={`${industry}-${company.name}`}>
                          {company.profileUrl ? (
                            <Link
                              to={company.profileUrl}
                              className="group flex items-center justify-between p-4 border-2 border-border hover:border-primary hover:bg-primary/5 rounded-lg transition-all"
                            >
                              <span className="font-display font-700 text-foreground group-hover:text-primary transition-colors text-sm md:text-base">
                                {company.name}
                              </span>
                              <Building2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                            </Link>
                          ) : (
                            <div className="p-4 border-2 border-border rounded-lg bg-muted/30">
                              <span className="font-display font-700 text-foreground text-sm md:text-base">
                                {company.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
