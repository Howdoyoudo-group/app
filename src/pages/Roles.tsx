import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { roles, industryToSlug } from "@/data/roles";
import { ROLE_ICONS } from "@/data/roleIcons";
import { INDUSTRY_ICONS } from "@/data/industryIcons";
import { Link as RouterLink } from "react-router-dom";

const businessRoles = roles.filter((r) => r.category === "business");
const craftRoles = roles.filter((r) => r.category === "craft");

const RoleCard = ({ role, i }: { role: typeof roles[0]; i: number }) => (
  <motion.div
    key={role.slug}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay: i * 0.08 }}
  >
    <Link
      to={`/roles/${role.slug}`}
      className="group block border-2 border-foreground p-6 md:p-8 hover:border-primary transition-colors h-full"
    >
      <div className="flex items-center gap-3 mb-4">
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
          {role.title}
        </h3>
      </div>
      <p className="text-muted-foreground text-sm font-body leading-relaxed mb-4">
        {role.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
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
                    className="w-7 h-7 rounded-full overflow-hidden border border-border hover:border-primary transition-colors shrink-0"
                  >
                    <img
                      src={icon}
                      alt={ind}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={28}
                      height={28}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {ind}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span key={ind} className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground">
              {ind}
            </span>
          );
        })}
        {role.industries.length > 6 && (
          <span className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground self-center">
            +{role.industries.length - 6} more
          </span>
        )}
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary">
        Explore role <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  </motion.div>
);

const Roles = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Explore Roles - Jobs & Career Guides"
        description="Browse detailed role guides across 30+ industries - from marketing and finance to barista and estate agent. Discover salaries, skills and live UK jobs."
        path="/roles"
      />
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20">


        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-3">
            Explore by role
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-900 leading-[0.9] tracking-tight mb-4">
            Roles<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-xl mb-4">
            Don't know what industry you want? Start with what you'd actually do.
          </p>
          <p className="text-muted-foreground/70 font-body text-sm italic max-w-lg mb-16">
            Some roles move across industries. Others are part of the industry itself.
          </p>
        </motion.div>

        {/* Business Roles */}
        <div className="mb-16">
          <div className="mb-8">
            <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">
              Business Roles
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-800 leading-none mb-2">
              Roles that move across industries
            </h2>
            <p className="text-muted-foreground font-body text-sm max-w-lg">
              These functions exist in every sector - marketing, finance, operations, and more.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {businessRoles.map((role, i) => (
              <RoleCard key={role.slug} role={role} i={i} />
            ))}
          </div>
        </div>

        {/* Craft & Industry Roles */}
        <div>
          <div className="mb-8">
            <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">
              Craft & Industry Roles
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-800 leading-none mb-2">
              Roles tied to specific industries
            </h2>
            <p className="text-muted-foreground font-body text-sm max-w-lg">
              These are the hands-on, specialist roles that define what each industry actually does.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {craftRoles.map((role, i) => (
              <RoleCard key={role.slug} role={role} i={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roles;
