import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { roles, industryToSlug } from "@/data/roles";
import { ROLE_ICONS } from "@/data/roleIcons";
import { INDUSTRY_ICONS } from "@/data/industryIcons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const businessRoles = roles.filter((r) => r.category === "business");
const craftRoles = roles.filter((r) => r.category === "craft");
const frontlineRoles = roles.filter((r) => r.category === "frontline");

type RoleView = "business" | "craft" | "frontline";

const RolesGrid = () => {
  const [view, setView] = useState<RoleView>("business");
  const activeRoles =
    view === "business" ? businessRoles : view === "craft" ? craftRoles : frontlineRoles;

  return (
    <section id="roles" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-12 md:mb-16">
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-3">
            The Roles
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-800 leading-none">
            Start with a role.
            <br />
            <span className="text-muted-foreground">Find an industry.</span>
          </h2>
          <p className="text-muted-foreground font-body text-base mt-4 max-w-lg mb-6">
            Some roles move across industries. Others are part of the industry itself.
          </p>

          <div className="inline-flex border-2 border-foreground flex-wrap">
            <button
              onClick={() => setView("business")}
              className={`px-5 py-2.5 font-display font-600 text-xs tracking-wide uppercase transition-colors ${
                view === "business"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Business Roles
            </button>
            <button
              onClick={() => setView("craft")}
              className={`px-5 py-2.5 font-display font-600 text-xs tracking-wide uppercase border-l-2 border-foreground transition-colors ${
                view === "craft"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Vocational Roles
            </button>
            <button
              onClick={() => setView("frontline")}
              className={`px-5 py-2.5 font-display font-600 text-xs tracking-wide uppercase border-l-2 border-foreground transition-colors ${
                view === "frontline"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:text-primary"
              }`}
            >
              Frontline Roles
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {activeRoles.map((role, i) => (
              <motion.div
                key={role.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.03 }}
              >
                <Link
                  to={`/roles/${role.slug}`}
                  className="group block border-2 border-foreground p-6 md:p-8 hover:border-primary transition-colors h-full"
                >
                  <div className="mb-4">
                    <p className="text-foreground text-xs tracking-[0.25em] uppercase font-body mb-1">
                      How do you do<span className="text-primary">?</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                        <img
                          src={ROLE_ICONS[role.slug]}
                          alt={role.title}
                          className="w-14 h-14 object-contain contrast-125 brightness-0"
                          loading="lazy"
                          width={56}
                          height={56}
                        />
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-700 text-foreground group-hover:text-primary transition-colors">
                        {role.title}<span className="text-primary">?</span>
                      </h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm font-body leading-relaxed mb-4">
                    {role.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {role.industries.slice(0, 6).map((ind) => {
                      const icon = INDUSTRY_ICONS[ind];
                      const slug = industryToSlug[ind];
                      return icon ? (
                        <TooltipProvider key={ind} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={slug || "#"}
                                onClick={(e) => e.stopPropagation()}
                                className="w-6 h-6 rounded-full overflow-hidden border border-border hover:border-primary transition-colors shrink-0"
                              >
                                <img src={icon} alt={ind} className="w-full h-full object-cover" loading="lazy" width={24} height={24} />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">{ind}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span key={ind} className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground">{ind}</span>
                      );
                    })}
                    {role.industries.length > 6 && (
                      <span className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground self-center">
                        +{role.industries.length - 6}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default RolesGrid;
