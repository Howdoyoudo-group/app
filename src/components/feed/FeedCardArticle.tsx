import FeedSaveButton from "./FeedSaveButton";
import FeedSourceHero from "./FeedSourceHero";
import { INDUSTRIES } from "@/data/industries";

interface Props {
  id?: string;
  title: string;
  source: string;
  url: string;
  timestamp: string;
  industry: string;
}

const displayIndustry = (slug: string) => {
  const match = INDUSTRIES.find((i) => i.slug === slug);
  if (match) return match.name;
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const FeedCardArticle = ({ id, title, source, url, timestamp, industry }: Props) => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
    <FeedSourceHero url={url} source={source} industry={industry} tint="blue" />
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <p className="font-body font-300 text-[11px] text-muted-foreground/80 flex-1 truncate">
          {displayIndustry(industry)}{source ? ` · ${source}` : ""}
        </p>
        <span className="font-body text-[10px] text-muted-foreground">{timestamp}</span>
        <FeedSaveButton
          type="article"
          itemKey={id || url}
          payload={{ title, url, source, industry }}
        />
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="group">
        <h3 className="font-display font-900 text-base md:text-[17px] text-foreground leading-[1.2] group-hover:text-primary transition-colors">
          {title}
        </h3>
      </a>
    </div>
  </div>
);

export default FeedCardArticle;
