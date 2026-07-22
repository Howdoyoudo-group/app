import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ExternalLink } from "lucide-react";
import { coursesByIndustry } from "@/data/courses";
import { buildOnlineProviders } from "@/data/online-providers";
import DegreesSection from "@/components/DegreesSection";

interface CoursesSectionProps {
  industry: string;
}

const hostnameFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const ProviderLogo = ({ url, provider }: { url: string; provider: string }) => {
  const host = hostnameFromUrl(url);
  const [errored, setErrored] = useState(false);
  if (!host || errored) {
    return <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
      alt={`${provider} logo`}
      onError={() => setErrored(true)}
      className="w-5 h-5 shrink-0 mt-0.5 object-contain rounded-sm bg-white"
      loading="lazy"
    />
  );
};

const INDUSTRY_QUERY_ALIASES: Record<string, string> = {
  hospitality: "hospitality food and drink",
  cinema: "film and tv production",
  "estate agency": "estate agency property",
  "horse racing": "equine horse racing",
  "formula 1": "motorsport",
  influencing: "content creator social media",
  fixing: "electrical plumbing trades skilled",
  building: "construction site management building",
  delivery: "logistics supply chain warehouse",
};

const CoursesSection = ({ industry }: CoursesSectionProps) => {
  const key = industry.toLowerCase();
  const courses = coursesByIndustry[key] ?? [];
  const queryTerm = INDUSTRY_QUERY_ALIASES[key] ?? key;
  const providers = buildOnlineProviders(queryTerm);




  return (
    <div id="courses" className="scroll-mt-24">
      {courses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">
            Courses<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-6 max-w-xl">
            Upskill, retrain, or get ahead - curated courses from leading platforms and institutions.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <a
                key={course.url}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-border p-5 hover:border-primary transition-colors flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ProviderLogo url={course.url} provider={course.provider} />
                    <h3 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                      {course.title}
                    </h3>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-muted-foreground font-body text-xs leading-relaxed">
                  {course.description}
                </p>
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <span className="text-xs font-display font-600 text-foreground/70">{course.provider}</span>
                  {course.free && (
                    <span className="text-[10px] font-display font-700 uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                      Free
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16"
      >
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">
          Online Courses<span className="text-primary">.</span>
        </h2>
        <p className="text-muted-foreground font-body text-sm mb-6 max-w-xl">
          Search the leading online learning platforms for {industry}-specific courses - from free taster modules to accredited qualifications.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-border p-4 hover:border-primary transition-colors flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2 min-w-0">
                <ProviderLogo url={p.url} provider={p.name} />
                <div className="min-w-0">
                  <h3 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors leading-snug truncate">
                    {p.name}
                  </h3>
                  <p className="text-muted-foreground font-body text-xs leading-relaxed mt-0.5">
                    {p.note}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </motion.div>

      <DegreesSection industry={industry} />
    </div>
  );
};

export default CoursesSection;
