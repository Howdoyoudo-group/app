import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Search, X } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { INDUSTRIES } from "@/data/industries";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

// Import all company data from industry pages
// Note: This is a simplified version - we're pulling from industry pages dynamically
// In production, you might want a central companies database

interface Company {
  name: string;
  industry: string;
  profileUrl?: string;
}

// Aggregated companies from all industries
// This could be expanded to dynamically import from each industry module
const ALL_COMPANIES: Company[] = [
  // Fashion
  { name: "ASOS", industry: "Fashion", profileUrl: "/company/asos" },
  { name: "Burberry", industry: "Fashion", profileUrl: "/company/burberry" },
  { name: "Nike", industry: "Fashion", profileUrl: "/company/nike" },
  { name: "Adidas", industry: "Fashion", profileUrl: "/company/adidas" },

  // Footwear
  { name: "Dr Martens", industry: "Footwear", profileUrl: "/company/dr-martens" },
  { name: "Birkenstock", industry: "Footwear", profileUrl: "/company/birkenstock" },
  { name: "UGG", industry: "Footwear", profileUrl: "/company/ugg" },
  { name: "Timberland", industry: "Footwear", profileUrl: "/company/timberland" },
  { name: "Gails", industry: "Footwear", profileUrl: "/company/gails" },
  { name: "Me+Em", industry: "Footwear", profileUrl: "/company/me-em" },

  // Grocery
  { name: "Ocado", industry: "Grocery", profileUrl: "/company/ocado" },
  { name: "Tesco", industry: "Grocery", profileUrl: "/company/tesco" },
  { name: "Greggs", industry: "Grocery", profileUrl: "/company/greggs" },

  // Coffee
  { name: "Costa", industry: "Coffee", profileUrl: "/company/costa" },
  { name: "Starbucks", industry: "Coffee", profileUrl: "/company/starbucks" },
  { name: "Caffe Nero", industry: "Coffee", profileUrl: "/company/caffe-nero" },
  { name: "Blank Street", industry: "Coffee", profileUrl: "/company/blank-street" },

  // Hospitality
  { name: "Grind", industry: "Hospitality", profileUrl: "/company/grind" },
  { name: "Soho House", industry: "Hospitality", profileUrl: "/company/soho-house" },

  // Football
  { name: "Premier League", industry: "Football", profileUrl: "/company/premier-league" },
  { name: "Sky Sports", industry: "Football", profileUrl: "/company/sky-sports" },

  // Estate Agency
  { name: "Savills", industry: "Estate Agency", profileUrl: "/company/savills" },
  { name: "Rightmove", industry: "Estate Agency", profileUrl: "/company/rightmove" },
  { name: "Purplebricks", industry: "Estate Agency", profileUrl: "/company/purplebricks" },

  // Charity
  { name: "Save the Children UK", industry: "Charity", profileUrl: "/company/save-the-children" },

  // Cinema
  { name: "Netflix", industry: "Cinema", profileUrl: "/company/netflix" },
  { name: "Everyman", industry: "Cinema", profileUrl: "/company/everyman" },

  // Gaming
  { name: "Dice", industry: "Gaming", profileUrl: "/company/dice" },

  // Money
  { name: "Hawkstone", industry: "Money", profileUrl: "/company/hawkstone" },

  // Beer
  { name: "Fever-Tree", industry: "Beer", profileUrl: "/company/fever-tree" },

  // Food & Drink
  { name: "Five Guys", industry: "Food & Drink", profileUrl: "/company/five-guys" },

  // Jewellery
  { name: "Pragnell", industry: "Jewellery", profileUrl: "/company/pragnell" },

  // Journalism
  { name: "News UK", industry: "Journalism", profileUrl: "/company/news-uk" },

  // Teaching
  { name: "Teach First", industry: "Teaching", profileUrl: "/company/teach-first" },

  // Home & Design
  { name: "Tom Dixon", industry: "Home & Design", profileUrl: "/company/tom-dixon" },
];

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

  const uniqueIndustries = [...new Set(ALL_COMPANIES.map(c => c.industry))].sort();

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
              {uniqueIndustries.map((industry) => {
                const companiesInIndustry = filteredCompanies.filter(c => c.industry === industry);
                if (companiesInIndustry.length === 0) return null;

                return (
                  <motion.section key={industry} {...fadeUp}>
                    <h2 className="font-display font-700 text-2xl mb-6">
                      {industry} <span className="text-primary">({companiesInIndustry.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {companiesInIndustry.map((company) => (
                        <div key={company.name}>
                          {company.profileUrl ? (
                            <Link
                              to={company.profileUrl}
                              className="group flex items-center justify-between p-4 border-2 border-border hover:border-primary hover:bg-primary/5 rounded-lg transition-all"
                            >
                              <span className="font-display font-700 text-foreground group-hover:text-primary transition-colors">
                                {company.name}
                              </span>
                              <Building2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                          ) : (
                            <div className="p-4 border-2 border-border rounded-lg bg-muted/30">
                              <span className="font-display font-700 text-foreground">
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
