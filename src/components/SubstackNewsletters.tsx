import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { substackByIndustry } from "@/data/courses";

const SubstackLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
  </svg>
);

interface SubstackNewslettersProps {
  industry: string;
}

const SubstackNewsletters = ({ industry }: SubstackNewslettersProps) => {
  const substacks = substackByIndustry[industry.toLowerCase()] ?? [];

  if (substacks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-2 mb-4">
        <SubstackLogo className="w-4 h-4 text-[#FF6719]" />
        <h2 className="font-display text-2xl md:text-3xl font-700 text-foreground">
          Substack Newsletters<span className="text-primary">.</span>
        </h2>
      </div>
      <p className="text-muted-foreground font-body text-sm mb-5 max-w-xl">
        Independent writers and industry insiders - subscribe for career insights straight to your inbox.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {substacks.map((sub) => (
          <a
            key={sub.url}
            href={sub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border p-4 hover:border-[#FF6719] transition-colors flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-display font-700 text-sm text-foreground group-hover:text-[#FF6719] transition-colors">
                {sub.name}
              </h4>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-muted-foreground font-body text-xs leading-relaxed">
              {sub.description}
            </p>
            <span className="text-[10px] font-display font-700 uppercase tracking-wider text-[#FF6719] bg-[#FF6719]/10 px-1.5 py-0.5 rounded-sm self-start mt-1">
              Free
            </span>
          </a>
        ))}
      </div>
    </motion.div>
  );
};

export default SubstackNewsletters;
