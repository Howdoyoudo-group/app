import { Building2 } from "lucide-react";
import CompanyLogo from "@/components/CompanyLogo";
import IndustryDoodle from "./IndustryDoodle";
import FeedSaveButton from "./FeedSaveButton";

interface Props {
  id?: string;
  title: string;
  source: string;
  url: string;
  timestamp: string;
  industry: string;
  targetCompanies?: string[];
}

const displayIndustry = (slug: string) =>
  slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** Word-boundary check - prevents "UGG" matching inside "struggling" */
const matchesAsWord = (text: string, term: string): boolean => {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[\\s,;:!?("'])${escaped}(?:[\\s,;:!?.'")]|$|'s)`, "i").test(text);
};

/** Try to extract a recognisable company name from headline text */
const extractCompany = (title: string, targetCompanies: string[] = []): string | null => {
  for (const company of targetCompanies) {
    if (company && matchesAsWord(title, company)) return company;
  }
  const match = title.match(
    /^([A-Z][A-Za-z&''.\- ]{1,30}?)(?:\s+(?:reports?|launches?|announces?|expands?|opens?|unveils?|reveals?|cuts?|plans?|posts?|repositions?|hands?|offers?|closes?|hires?|names?|appoints?|partners?|joins?|signs?|acquires?|enters?|rolls?|drops?|adds?|raises?|invests?|sells?|explores?|buys?|starts?|tests?|releases?|enters?))/i
  );
  if (match) return match[1].trim();
  const brand = title.match(
    /\b(Cartier|Tiffany|De Beers|Signet|Pandora|Swarovski|TUI|easyJet|Jet2|British Airways|Ryanair|EasyJet|Nike|Adidas|Puma|Burberry|ASOS|Zara|H&M|Primark|M&S|John Lewis|Waitrose|Tesco|Sainsbury|Aldi|Lidl|Costa|Starbucks|Pret|Greggs|Nando|McDonald|KFC|Netflix|Amazon|Disney|Sky|BBC|ITV|Channel 4|Sony|Microsoft|Apple|Google|Meta|Samsung|Diageo|Heineken|BrewDog|Guinness|Ocado|Deliveroo|Uber|Savills|Rightmove|Zoopla|Foxtons|Knight Frank|JLL|Bupa|Boots|Superdrug|L'Oréal|Estée Lauder|Unilever|P&G|Dyson|LEGO|Ferrari|McLaren|Mercedes|BMW|Audi|Porsche|Land Rover|Jaguar|Rolls.Royce|Bentley|Dr\. Martens|New Balance|Converse|Vans|Skechers|Timberland|UGG|Crocs|Birkenstock|Instacart)\b/i
  );
  if (brand) return brand[1];
  return null;
};

const FeedCardCompanyNews = ({ id, title, source, url, timestamp, industry, targetCompanies = [] }: Props) => {
  const company = extractCompany(title, targetCompanies);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="relative bg-gradient-to-r from-violet-500/15 via-violet-400/5 to-transparent p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Industry doodle - always shown */}
          <IndustryDoodle industry={industry} size={40} />
          {/* Company logo - shown alongside if a company is detected */}
          {company && (
            <CompanyLogo company={company} size={40} rounded="md" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-3 h-3 text-violet-600 shrink-0" />
              <span className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-violet-600">
                {company ? company : "Company News"}
              </span>
              <span className="ml-auto font-body text-[10px] text-muted-foreground">{timestamp}</span>
              <FeedSaveButton
                type="company_news"
                itemKey={id || url}
                payload={{ title, url, source, industry, company: company || undefined }}
              />
            </div>
            <p className="font-body text-[11px] text-muted-foreground">
              {displayIndustry(industry)}
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 pt-2">
        <a href={url} target="_blank" rel="noopener noreferrer" className="group">
          <h3 className="font-display font-800 text-[15px] text-foreground leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
        </a>
      </div>
    </div>
  );
};

export default FeedCardCompanyNews;
