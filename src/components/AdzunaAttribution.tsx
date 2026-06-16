// Job source attribution.
// Major aggregators we surface jobs from get a visible badge per card +
// a "Jobs via" line at the foot of any list that contains them. Adzuna
// attribution is required by their ToS; the others follow the same
// pattern for consistency and transparency.
//
// Brand rendering:
//  • Adzuna  - official press PNG + swirl from adzuna.co.uk/press.html
//  • Reed/LinkedIn/Jooble - inline styled wordmarks in brand colours.
//    (Inline React text rather than SVG <img> so the page font renders
//    reliably across browsers; SVG <text> inside <img> can fail to load
//    fonts and appear blank.)

import adzunaSwirl from "@/assets/adzuna/adzuna-swirl.svg";
import adzunaLogo from "@/assets/adzuna/adzuna-logo.png";

export type JobSource = "adzuna" | "reed" | "linkedin" | "jooble" | "cvlibrary";

type Props = {
  source: JobSource;
  variant?: "badge" | "footer";
  className?: string;
};

const SOURCE_META: Record<JobSource, { name: string; href: string; color: string }> = {
  adzuna:    { name: "Adzuna",     href: "https://www.adzuna.co.uk/",     color: "#7B2CBF" },
  reed:      { name: "Reed",       href: "https://www.reed.co.uk/",       color: "#E60028" },
  linkedin:  { name: "LinkedIn",   href: "https://www.linkedin.com/jobs/", color: "#0A66C2" },
  jooble:    { name: "Jooble",     href: "https://uk.jooble.org/",        color: "#2657EB" },
  cvlibrary: { name: "CV-Library", href: "https://www.cv-library.co.uk/", color: "#00A99D" },
};

export function detectJobSource(url: string | null | undefined): JobSource | null {
  if (!url) return null;
  if (/adzuna\./i.test(url)) return "adzuna";
  if (/reed\.co\.uk/i.test(url)) return "reed";
  if (/linkedin\./i.test(url)) return "linkedin";
  if (/jooble\./i.test(url)) return "jooble";
  if (/cv-library\.co\.uk/i.test(url)) return "cvlibrary";
  return null;
}

// Back-compat shim - older code paths used this helper.
export function isAdzunaJobUrl(url: string | null | undefined): boolean {
  return detectJobSource(url) === "adzuna";
}

// Brand wordmark - inline so the live page font stack renders it.
function Wordmark({ source, size = "sm" }: { source: JobSource; size?: "sm" | "md" }) {
  const meta = SOURCE_META[source];
  const fontSize = size === "md" ? "0.95rem" : "0.8rem";

  if (source === "adzuna") {
    return (
      <img
        src={adzunaLogo}
        alt="Adzuna"
        className={size === "md" ? "h-7 w-auto" : "h-5 w-auto"}
        loading="lazy"
      />
    );
  }

  if (source === "linkedin") {
    return (
      <span className="inline-flex items-center gap-1" aria-label="LinkedIn">
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center font-black leading-none text-white"
          style={{
            backgroundColor: meta.color,
            fontSize: size === "md" ? "0.7rem" : "0.6rem",
            width: size === "md" ? "1rem" : "0.85rem",
            height: size === "md" ? "1rem" : "0.85rem",
            borderRadius: "0.15rem",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          in
        </span>
        <span
          style={{
            color: meta.color,
            fontSize,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            fontFamily: "Arial, Helvetica, sans-serif",
            lineHeight: 1,
          }}
        >
          LinkedIn
        </span>
      </span>
    );
  }

  // Reed + Jooble + CV-Library - coloured bold wordmark
  return (
    <span
      style={{
        color: meta.color,
        fontSize,
        fontWeight: 900,
        letterSpacing: "-0.02em",
        fontFamily: "Arial, Helvetica, sans-serif",
        lineHeight: 1,
      }}
      aria-label={meta.name}
    >
      {source === "reed" ? "reed.co.uk" : source === "cvlibrary" ? "CV-Library" : "Jooble"}
    </span>
  );
}

export default function SourceAttribution({ source, variant = "badge", className = "" }: Props) {
  const meta = SOURCE_META[source];
  if (!meta) return null;

  if (variant === "footer") {
    return (
      <a
        href={meta.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 text-xs text-foreground/70 font-body hover:text-primary transition-colors ${className}`}
        aria-label={`Jobs via ${meta.name}`}
      >
        <span>Jobs via</span>
        <Wordmark source={source} size="md" />
      </a>
    );
  }

  return (
    <a
      href={meta.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-foreground/60 hover:text-primary font-body ${className}`}
      aria-label={`Jobs via ${meta.name}`}
      title={`Jobs via ${meta.name}`}
    >
      <span>Jobs via</span>
      <Wordmark source={source} size="sm" />
    </a>
  );
}

// Footer line that lists every distinct source present in a job collection,
// in priority order. Renders nothing if no recognised sources are present.
export function SourceAttributionFooter({
  jobs,
  className = "",
}: {
  jobs: Array<{ url?: string | null }>;
  className?: string;
}) {
  const present = new Set<JobSource>();
  for (const j of jobs) {
    const src = detectJobSource(j.url);
    if (src) present.add(src);
  }
  if (present.size === 0) return null;

  const order: JobSource[] = ["adzuna", "reed", "linkedin", "jooble", "cvlibrary"];
  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      {order.filter((s) => present.has(s)).map((s) => (
        <SourceAttribution key={s} source={s} variant="footer" />
      ))}
    </div>
  );
}
