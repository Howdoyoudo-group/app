import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { INDUSTRIES } from "@/data/industries";
import { roles } from "@/data/roles";
import { INDUSTRY_ICONS } from "@/data/industryIcons";
import { ALL_COMPANIES_BY_INDUSTRY } from "@/data/all-companies";
import HowdyIntro from "@/components/HowdyIntro";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function MostWanted() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedRoles, setSavedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchSaved = async () => {
      try {
        const { data } = await supabase
          .from("user_target_roles")
          .select("role_slug")
          .eq("user_id", user.id);

        if (data) {
          setSavedRoles(data.map(r => r.role_slug));
        }
      } catch (err) {
        console.error("Error fetching saved data:", err);
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
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-5xl mx-auto">
          {/* Header */}
          <motion.div {...fadeUp} className="mb-8">
            <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground">
              Most Wanted.
            </h1>
          </motion.div>

          <motion.div {...fadeUp} className="mb-16">
            <HowdyIntro>
              Every role and company you save around the site lands here. Think of it as your shortlist - the ones worth a second look when you're ready to apply.
            </HowdyIntro>
          </motion.div>

          {/* Industries */}
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="font-display font-700 text-2xl md:text-3xl mb-8">Industries</h2>
            {savedIndustries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {savedIndustries.map((industry) => {
                  const icon = INDUSTRY_ICONS[industry.slug as keyof typeof INDUSTRY_ICONS];
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
            ) : (
              <p className="text-muted-foreground">No saved industries yet</p>
            )}
          </motion.section>

          {/* Roles */}
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="font-display font-700 text-2xl md:text-3xl mb-8">Roles</h2>
            {savedRoles.length > 0 ? (
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
            ) : (
              <p className="text-muted-foreground">No saved roles yet</p>
            )}
          </motion.section>

          {/* Companies */}
          <motion.section {...fadeUp} className="mb-16">
            <h2 className="font-display font-700 text-2xl md:text-3xl mb-8">Companies</h2>
            <p className="text-muted-foreground mb-8">Explore companies across all industries and find where you'd like to work.</p>
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity rounded-lg"
            >
              <Building2 className="w-4 h-4" />
              Browse All Companies
            </Link>
          </motion.section>

        </section>
      </main>
      <Footer />
    </>
  );
}
