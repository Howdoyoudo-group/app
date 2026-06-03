import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { getIndustryImage } from "@/components/feed/feedUtils";
import FeedSaveButton from "./FeedSaveButton";

interface Props {
  id?: string;
  industry: string;
  mainNews: string;
  briefingDate: string;
  timestamp: string;
}

const displayName = (slug: string) =>
  slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const INDUSTRY_SLUG_MAP: Record<string, string> = {
  bakery: "/bakery", beauty: "/beauty", beer: "/beer", cars: "/cars",
  charity: "/charity", cinema: "/cinema", coffee: "/coffee",
  "estate-agency": "/estate-agency", farming: "/farming", fashion: "/fashion",
  football: "/football", footwear: "/footwear", "formula-1": "/formula-1",
  gaming: "/gaming", grocery: "/grocery", health: "/health",
  "horse-racing": "/horse-racing", hospitality: "/hospitality",
  influencing: "/influencing", "interior-design": "/interior-design",
  jewellery: "/jewellery", journalism: "/journalism", money: "/money",
  music: "/music", pets: "/pets", physiotherapy: "/physiotherapy",
  psychotherapy: "/psychotherapy", teaching: "/teaching", travel: "/travel",
  wellness: "/wellness",
};

const FeedCardBriefing = ({ id, industry, mainNews, briefingDate, timestamp }: Props) => {
  const slug = industry.toLowerCase().replace(/\s+/g, "-");
  const path = INDUSTRY_SLUG_MAP[slug] || `/${slug}`;
  const heroImg = getIndustryImage(slug);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Hero banner with industry doodle */}
      <div className="relative h-28 overflow-hidden">
        {heroImg ? (
          <img
            src={heroImg}
            alt={displayName(slug)}
            className="w-full h-full object-cover brightness-[0.35]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-foreground/90 to-foreground/70" />
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-3.5 h-3.5 text-white/70" />
            <span className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-white/70">
              Morning Briefing
            </span>
            <span className="ml-auto font-body text-[10px] text-white/50">
              {new Date(briefingDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>
          <h3 className="font-display font-800 text-lg text-white leading-tight">
            {displayName(slug)}<span className="text-primary">.</span>
          </h3>
        </div>
      </div>
      <div className="p-4">
        <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
          {mainNews}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Link
            to={path}
            className="inline-flex items-center gap-1.5 font-display text-xs font-700 uppercase tracking-wider text-primary hover:underline"
          >
            Read full briefing →
          </Link>
          <FeedSaveButton
            type="briefing"
            itemKey={id || `${slug}-${briefingDate}`}
            payload={{ industry: slug, mainNews, briefingDate, title: `${displayName(slug)} Briefing` }}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedCardBriefing;
