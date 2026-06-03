import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ExternalLink } from "lucide-react";
import { degreesByIndustry, Degree } from "@/data/degrees";
import { usPostgradByIndustry } from "@/data/degrees-us";

interface DegreesSectionProps {
  industry: string;
}

const DegreesSection = ({ industry }: DegreesSectionProps) => {
  const [region, setRegion] = useState<"uk" | "us">("uk");
  const degrees = degreesByIndustry[industry.toLowerCase()] ?? [];

  if (degrees.length === 0) return null;

  const undergraduate = degrees.filter((d) => d.type === "undergraduate");
  const ukPostgraduate = degrees.filter((d) => d.type === "postgraduate");
  const usPostgraduate = usPostgradByIndustry[industry.toLowerCase()] ?? [];
  const postgraduate = region === "uk" ? ukPostgraduate : usPostgraduate;

  const renderGroup = (title: string, items: Degree[], showToggle?: boolean) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg md:text-xl font-700">
            {title}
          </h3>
          {showToggle && (
            <div className="flex items-center bg-muted rounded-full p-0.5 gap-0.5">
              <button
                onClick={() => setRegion("uk")}
                className={`px-3 py-1 text-xs font-display font-700 rounded-full transition-colors ${
                  region === "uk"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🇬🇧 UK
              </button>
              <button
                onClick={() => setRegion("us")}
                className={`px-3 py-1 text-xs font-display font-700 rounded-full transition-colors ${
                  region === "us"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🇺🇸 US
              </button>
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((degree) => (
            <a
              key={degree.url + degree.title}
              href={degree.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-border p-5 hover:border-primary transition-colors flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <h4 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                    {degree.title}
                  </h4>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-2 mt-auto pt-1">
                <span className="text-xs font-display font-600 text-foreground/70">
                  {degree.university}
                </span>
                <span className="text-[10px] font-display font-700 uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                  {degree.duration}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-16"
    >
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">
        University Degrees<span className="text-primary">.</span>
      </h2>
      <p className="text-muted-foreground font-body text-sm mb-6 max-w-xl">
        Undergraduate and postgraduate programmes from leading universities.
      </p>
      {renderGroup("Undergraduate", undergraduate)}
      {renderGroup("Postgraduate", postgraduate, true)}
    </motion.div>
  );
};

export default DegreesSection;
