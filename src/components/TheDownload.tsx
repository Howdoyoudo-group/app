import { Download, ExternalLink, FileText } from "lucide-react";

interface TheDownloadProps {
  /** Display name e.g. "Bakery" */
  industry: string;
  /** URL slug used in /public/downloads/download-{slug}.html (lowercase, hyphenated) */
  slug: string;
}

// Industries that currently have a published "Download" briefing.
// Map slug -> file extension ("html" or "pdf").
const AVAILABLE_DOWNLOADS: Record<string, "html" | "pdf"> = {
  bakery: "html",
  building: "html",
  beauty: "html",
  beer: "html",
  cars: "html",
  charity: "html",
  delivery: "html",
  cinema: "html",
  coffee: "html",
  "estate-agency": "html",
  farming: "html",
  fixing: "html",
  fashion: "html",
  football: "html",
  "formula-1": "html",
  footwear: "html",
  gaming: "html",
  grocery: "html",
  health: "html",
  "horse-racing": "html",
  hospitality: "html",
  influencing: "html",
  "interior-design": "html",
  jewellery: "html",
  journalism: "html",
  money: "html",
  music: "html",
  pets: "html",
  physiotherapy: "html",
  psychotherapy: "html",
  teaching: "html",
  travel: "html",
  wellness: "html",
};

const TheDownload = ({ industry, slug }: TheDownloadProps) => {
  const ext = AVAILABLE_DOWNLOADS[slug];
  const isAvailable = Boolean(ext);
  const fileUrl = `/downloads/download-${slug}.${ext ?? "html"}`;
  const downloadName = `Download-${industry}.${ext ?? "html"}`;

  return (
    <section className="mb-12 border-2 border-foreground bg-background">
      {/* Header strip */}
      <div className="bg-primary px-5 py-2 flex items-center justify-between">
        <span className="font-display text-[10px] tracking-[0.18em] uppercase font-700 text-primary-foreground">
          The Download · Industry Briefing
        </span>
        <span className="font-display text-[10px] tracking-[0.18em] uppercase font-700 text-primary-foreground">
          {industry}
        </span>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Insights · Market Data · Key Players
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-900 leading-[0.95] tracking-tight mb-3">
              The Download<span className="text-primary">.</span>
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed mb-5">
              A two-page snapshot of the UK {industry.toLowerCase()} industry - market size,
              global context, the major players, category map, and the trends shaping
              what comes next.
            </p>

            {/* Quick facts strip */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["UK Market", "Global Context", "Key Players", "Trends to Watch"].map((tag) => (
                <span
                  key={tag}
                  className="font-display text-[10px] tracking-[0.1em] uppercase font-700 px-2.5 py-1 border-2 border-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {isAvailable ? (
              <div className="flex flex-wrap gap-3">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-3 font-display font-700 text-xs tracking-[0.1em] uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Briefing
                </a>
                <a
                  href={fileUrl}
                  download={downloadName}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 font-display font-700 text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 border-2 border-dashed border-muted-foreground/40 px-5 py-3 font-display font-700 text-xs tracking-[0.1em] uppercase text-muted-foreground">
                <FileText className="w-4 h-4" />
                Coming soon
              </div>
            )}
          </div>

          {/* Decorative document mock */}
          <div className="hidden md:flex flex-col gap-1.5 w-44 flex-shrink-0">
            <div className="border-2 border-foreground bg-background p-3 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
              <div className="h-1.5 bg-primary mb-2" />
              <div className="font-display text-base font-900 leading-none mb-2">
                {industry}<span className="text-primary">.</span>
              </div>
              <div className="space-y-1">
                <div className="h-1 bg-foreground/80 w-full" />
                <div className="h-1 bg-foreground/40 w-5/6" />
                <div className="h-1 bg-foreground/40 w-4/6" />
              </div>
              <div className="grid grid-cols-2 gap-1 mt-3">
                <div className="h-6 bg-foreground" />
                <div className="h-6 bg-primary" />
                <div className="h-6 border-2 border-foreground" />
                <div className="h-6 bg-foreground/10" />
              </div>
            </div>
            <p className="font-body text-[9px] tracking-[0.16em] uppercase text-muted-foreground text-center mt-1">
              2-page briefing · A4
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TheDownload;
