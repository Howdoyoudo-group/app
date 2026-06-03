import { Building2 } from "lucide-react";
import CompanyLogo from "@/components/CompanyLogo";
import { getIndustryImage } from "@/components/feed/feedUtils";

interface Props {
  companyName: string;
  tagline: string;
  logoUrl: string | null;
  url: string | null;
  industry: string;
}

const displayName = (slug: string) =>
  slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const FeedCardEmployer = ({ companyName, tagline, logoUrl, url, industry }: Props) => {
  const heroImg = getIndustryImage(industry);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Mini hero */}
      <div className="relative h-16 overflow-hidden">
        {heroImg ? (
          <img
            src={heroImg}
            alt={displayName(industry)}
            className="w-full h-full object-cover brightness-[0.25]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/40 to-accent/20" />
        )}
        <div className="absolute inset-0 flex items-center px-4 gap-2">
          <Building2 className="w-3.5 h-3.5 text-white/70" />
          <span className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-white/70">
            Who's Hiring - {displayName(industry)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <CompanyLogo company={companyName} size={48} rounded="md" />
          <div className="min-w-0">
            <h3 className="font-display font-800 text-base text-foreground leading-tight truncate">
              {companyName}
            </h3>
            {tagline && (
              <p className="font-body text-xs text-muted-foreground truncate">{tagline}</p>
            )}
          </div>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-display text-xs font-700 uppercase tracking-wider text-primary hover:underline mt-1"
          >
            View jobs →
          </a>
        )}
      </div>
    </div>
  );
};

export default FeedCardEmployer;
