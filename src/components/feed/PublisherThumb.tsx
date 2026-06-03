import { useState } from "react";

interface Props {
  url: string;
  source: string;
  tint?: "amber" | "blue";
  size?: number;
}

const tintBg: Record<NonNullable<Props["tint"]>, string> = {
  amber:
    "bg-[radial-gradient(circle_at_30%_30%,hsl(43_96%_56%/0.35),transparent_70%),linear-gradient(135deg,hsl(43_96%_56%/0.22),hsl(43_96%_56%/0.06))]",
  blue:
    "bg-[radial-gradient(circle_at_30%_30%,hsl(217_91%_60%/0.30),transparent_70%),linear-gradient(135deg,hsl(217_91%_60%/0.20),hsl(217_91%_60%/0.06))]",
};

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const PublisherThumb = ({ url, source, tint = "amber", size = 52 }: Props) => {
  const domain = getDomain(url);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const sources = domain
    ? [
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      ]
    : [];
  const logoSrc = sources[stage];
  const ok = !!logoSrc && stage < sources.length;


  return (
    <div
      className={`relative flex-shrink-0 rounded-xl border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))] overflow-hidden ${tintBg[tint]}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center p-1.5">
        {logoSrc && ok ? (
          <img
            src={logoSrc}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setStage((s) => (s + 1) as 0 | 1 | 2)}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="font-display font-900 text-[10px] leading-tight text-foreground text-center break-words">
            {(source || domain || "?").slice(0, 14)}
          </span>
        )}
      </div>
    </div>
  );
};

export default PublisherThumb;
