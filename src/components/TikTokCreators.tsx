import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { tiktokByIndustry } from "@/data/courses";

const TikTokLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z" />
  </svg>
);

interface TikTokCreatorsProps {
  industry: string;
}

const getTikTokBrowserUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set("is_from_webapp", "1");
    parsedUrl.searchParams.set("sender_device", "pc");
    return parsedUrl.toString();
  } catch {
    return url;
  }
};

const TikTokCreators = ({ industry }: TikTokCreatorsProps) => {
  const creators = tiktokByIndustry[industry.toLowerCase()] ?? [];

  if (creators.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-12"
    >
      <div className="flex items-center gap-2 mb-4">
        <TikTokLogo className="w-4 h-4 text-foreground" />
        <h2 className="font-display text-2xl md:text-3xl font-700 text-foreground">
          TikTok Creators<span className="text-primary">.</span>
        </h2>
      </div>
      <p className="text-muted-foreground font-body text-sm mb-5 max-w-xl">
        Career-focused creators sharing day-in-the-life content, industry insights, and job advice.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {creators.map((creator) => {
          const creatorUrl = getTikTokBrowserUrl(creator.url);

          return (
          <a
            key={creator.url}
            href={creatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border p-4 hover:border-foreground transition-colors flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors">
                  {creator.name}
                </h4>
                <span className="text-[11px] font-body text-muted-foreground">
                  @{creator.handle}
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-muted-foreground font-body text-xs leading-relaxed">
              {creator.description}
            </p>
          </a>
        )})}
      </div>
    </motion.div>
  );
};

export default TikTokCreators;
