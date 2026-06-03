import { motion } from "framer-motion";
import { Youtube, ExternalLink } from "lucide-react";
import { youtubeByIndustry } from "@/data/courses";

interface YouTubeChannelsProps {
  industry: string;
}

const YouTubeChannels = ({ industry }: YouTubeChannelsProps) => {
  const channels = youtubeByIndustry[industry.toLowerCase()] ?? [];

  if (channels.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Youtube className="w-5 h-5 text-red-500" />
        <h2 className="font-display text-2xl md:text-3xl font-700 text-foreground">
          YouTube Channels<span className="text-primary">.</span>
        </h2>
      </div>
      <p className="text-muted-foreground font-body text-sm mb-5 max-w-xl">
        Subscribe to these channels for free industry insights, tutorials, and behind-the-scenes content.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {channels.map((ch) => (
          <a
            key={ch.url}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border p-4 hover:border-red-500 transition-colors flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-display font-700 text-sm text-foreground group-hover:text-red-500 transition-colors">
                {ch.name}
              </h4>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-muted-foreground font-body text-xs leading-relaxed">
              {ch.description}
            </p>
            <span className="text-[10px] font-display font-700 uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-sm self-start mt-1">
              Free
            </span>
          </a>
        ))}
      </div>
    </motion.div>
  );
};

export default YouTubeChannels;
