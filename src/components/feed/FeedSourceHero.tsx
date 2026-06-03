import { useState } from "react";
import IndustryDoodle from "./IndustryDoodle";

interface Props {
  url: string;
  source: string;
  industry: string;
  tint?: "amber" | "blue";
}

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const tintClasses: Record<NonNullable<Props["tint"]>, string> = {
  amber:
    "bg-[radial-gradient(circle_at_30%_30%,hsl(43_96%_56%/0.28),transparent_60%),linear-gradient(135deg,hsl(43_96%_56%/0.18),hsl(43_96%_56%/0.04))]",
  blue:
    "bg-[radial-gradient(circle_at_30%_30%,hsl(217_91%_60%/0.25),transparent_60%),linear-gradient(135deg,hsl(217_91%_60%/0.18),hsl(217_91%_60%/0.04))]",
};

const FeedSourceHero = ({ url, source, industry, tint = "amber" }: Props) => {
  const domain = getDomain(url);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const sources = domain
    ? [
        `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      ]
    : [];
  const logoSrc = sources[stage];
  const logoOk = !!logoSrc && stage < sources.length;


  return (
    <div
      className={`relative h-28 md:h-32 w-full overflow-hidden border-b-2 border-foreground/10 ${tintClasses[tint]}`}
      aria-hidden="true"
    >
      {/* Doodle backdrop in corner */}
      <div className="absolute -bottom-4 -left-4 opacity-30 blur-[0.4px]">
        <IndustryDoodle industry={industry} size={120} />
      </div>

      {/* Source logo card */}
      <div className="absolute inset-0 flex items-center justify-end pr-5">
        {logoSrc && logoOk ? (
          <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-background border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))] p-2.5">
            <img
              src={logoSrc}
              alt={`${source} logo`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setStage((s) => (s + 1) as 0 | 1 | 2)}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-background border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))] p-2 text-center">
            <span className="font-display text-[11px] leading-tight text-foreground">
              {source || domain}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedSourceHero;
