import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, ArrowRight } from "lucide-react";
import { getRolesForIndustry } from "@/data/roles";

interface IndustryRolesLinkProps {
  industry: string;
}

const IndustryRolesLink = ({ industry }: IndustryRolesLinkProps) => {
  const relevantRoles = getRolesForIndustry(industry);
  if (!relevantRoles.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16"
    >
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">
        Explore by Role<span className="text-primary">.</span>
      </h2>
      <p className="text-muted-foreground font-body text-sm mb-6">
        See how core business functions work inside {industry.toLowerCase()}.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {relevantRoles.map((role) => (
          <Link
            key={role.slug}
            to={`/roles/${role.slug}`}
            className="group border border-border p-4 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <h3 className="font-display font-700 text-foreground text-xs group-hover:text-primary transition-colors">
                {role.title}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-display font-600 tracking-wide uppercase text-primary">
              Explore <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default IndustryRolesLink;
