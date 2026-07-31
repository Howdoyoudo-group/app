import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { INDUSTRIES } from "@/data/industries";
import { roles } from "@/data/roles";
import { industryIcons } from "@/components/industryIcons";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function MostWanted() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedRoles, setSavedRoles] = useState<string[]>([]);
  const [savedCompanies, setSavedCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Fetch user's saved roles and companies
    const fetchSaved = async () => {
      try {
        const { data } = await supabase
          .from("user_target_roles")
          .select("role_slug")
          .eq("user_id", user.id);

        if (data) {
          setSavedRoles(data.map(r => r.role_slug));
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("target_companies")
          .eq("id", user.id)
          .single();

        if (profile?.target_companies) {
          setSavedCompanies(Array.isArray(profile.target_companies) ? profile.target_companies : []);
        }
      } catch (err) {
        console.error("Error fetching saved data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user, navigate]);

  // Get unique industries from saved roles
  const industriesFromRoles = new Set<string>();
  savedRoles.forEach(roleSlug => {
    const role = roles.find(r => r.slug === roleSlug);
    if (role?.industries) {
      role.industries.forEach(ind => industriesFromRoles.add(ind));
    }
  });

  const savedIndustries = Array.from(industriesFromRoles)
    .map(slug => INDUSTRIES.find(i => i.slug === slug))
    .filter(Boolean) as typeof INDUSTRIES;

  return (
    <>
      <SEO
        title="Most Wanted | Howdoyoudo?"
        description="Your saved roles and companies all in one place."
      />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 mb-4">
              <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="font-display font-700 text-xs uppercase tracking-widest">Your collection</span>
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground mb-4">
              Most Wanted.
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl">
              {savedRoles.length === 0 && savedCompanies.length === 0
                ? "No saved roles or companies yet. Explore industries and companies to add them here."
                : "All your saved roles and companies in one place. Keep track of what you're interested in."}
            </p>
          </motion.div>

          {/* Industries Section */}
          {savedIndustries.length > 0 && (
            <motion.section {...fadeUp} className="mb-16">
              <h2 className="font-display font-700 text-2xl md:text-3xl mb-8">
                Industries <span className="text-primary">({savedIndustries.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {savedIndustries.map((industry) => {
                  const icon = industryIcons[industry.slug as keyof typeof industryIcons];
                  return (
                    <Link
                      key={industry.slug}
                      to={`/${industry.slug}`}
                      className="group relative aspect-square border-2 border-foreground bg-background p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-primary hover:-translate-y-0.5 transition-all"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center [&_img]:w-full [&_img]:h-full">
                        {icon ? <img src={icon} alt={industry.name} style={{ filter: "brightness(0)" }} /> : null}
                      </div>
                      <span className="font-display font-700 text-[11px] md:text-xs leading-tight tracking-tight text-foreground group-hover:text-primary-foreground">
                        {industry.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Roles Section */}
          {savedRoles.length > 0 && (
            <motion.section {...fadeUp} className="mb-16">
              <h2 className="font-display font-700 text-2xl md:text-3xl mb-8">
                Roles <span className="text-primary">({savedRoles.length})</span>
              </h2>
              <div className="space-y-3">
                {savedRoles.map((roleSlug) => {
                  const role = roles.find(r => r.slug === roleSlug);
                  return role ? (
                    <Link
                      key={roleSlug}
                      to={`/roles/${roleSlug}`}
                      className="group flex items-center justify-between p-4 border-2 border-border hover:border-primary hover:bg-primary/5 transition-all rounded-lg"
                    >
                      <span className="font-display font-700 text-foreground group-hover:text-primary transition-colors">
                        {role.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ) : null;
                })}
              </div>
            </motion.section>
          )}

          {/* Companies Section */}
          {savedCompanies.length > 0 && (
            <motion.section {...fadeUp} className="mb-16">
              <h2 className="font-display font-700 text-2xl md:text-3xl mb-8">
                Companies <span className="text-primary">({savedCompanies.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedCompanies.map((company) => (
                  <div
                    key={company}
                    className="border-2 border-border hover:border-primary rounded-lg p-4 transition-all hover:bg-primary/5"
                  >
                    <p className="font-display font-700 text-foreground text-sm md:text-base line-clamp-2">
                      {company}
                    </p>
                    <p className="text-muted-foreground text-xs mt-2">Saved to explore</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Empty State */}
          {loading === false && savedRoles.length === 0 && savedCompanies.length === 0 && (
            <motion.div {...fadeUp} className="text-center py-12">
              <div className="inline-block mb-6 p-4 rounded-full bg-primary/10 border-2 border-primary/20">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-700 text-xl mb-2">Start exploring</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Save roles and companies as you explore industries to see them all collected here.
              </p>
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-700 hover:opacity-90 transition-opacity"
              >
                Explore Industries
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
