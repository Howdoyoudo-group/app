import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import CompanyLogo from "@/components/CompanyLogo";
import { getIndustryImage } from "@/components/feed/feedUtils";

interface Props {
  industry: string;
  count: number;
  jobs: { title: string; url: string; company: string }[];
  timestamp: string;
}

const displayName = (slug: string) =>
  slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const FeedCardJob = ({ industry, count, jobs, timestamp }: Props) => {
  const slug = industry.toLowerCase().replace(/\s+/g, "-").replace("film and tv", "cinema").replace("food & drink", "hospitality");
  const heroImg = getIndustryImage(slug);

  // Collect unique companies for the logo strip
  const uniqueCompanies = [...new Set(jobs.map(j => j.company))].slice(0, 4);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Mini hero banner */}
      <div className="relative h-20 overflow-hidden">
        {heroImg ? (
          <img
            src={heroImg}
            alt={displayName(slug)}
            className="w-full h-full object-cover brightness-[0.3]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10" />
        )}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              <span className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary">
                New Jobs
              </span>
            </div>
            <h3 className="font-display font-800 text-base text-white leading-tight">
              {count} {displayName(slug)} jobs<span className="text-primary">.</span>
            </h3>
          </div>
          <span className="font-body text-[10px] text-white/50">{timestamp}</span>
        </div>
      </div>

      <div className="p-4">
        {/* Company logo strip */}
        {uniqueCompanies.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {uniqueCompanies.map((company, i) => (
              <CompanyLogo key={i} company={company} size={24} rounded="full" />
            ))}
            {count > uniqueCompanies.length && (
              <span className="font-body text-[10px] text-muted-foreground ml-1">
                +{count - uniqueCompanies.length} more
              </span>
            )}
          </div>
        )}

        {jobs.length > 0 && (
          <ul className="space-y-2.5 mb-3">
            {jobs.map((j, i) => (
              <li key={i}>
                <a
                  href={j.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 group"
                >
                  <CompanyLogo company={j.company} size={28} rounded="full" />
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-xs text-foreground truncate group-hover:text-primary transition-colors">
                      {j.title}
                    </p>
                    <p className="font-body text-[10px] text-muted-foreground truncate">
                      {j.company}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
        <Link
          to={`/marketplace?industry=${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1.5 font-display text-xs font-700 uppercase tracking-wider text-primary hover:underline"
        >
          Browse all →
        </Link>
      </div>
    </div>
  );
};

export default FeedCardJob;
