import { Play } from "lucide-react";
import FeedSaveButton from "./FeedSaveButton";

interface Props {
  youtubeId: string;
  title: string;
  channel: string;
  industry: string;
  duration?: string;
}

const FeedCardVideo = ({ youtubeId, title, channel, industry, duration }: Props) => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
    <a
      href={`https://www.youtube.com/watch?v=${youtubeId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative group"
    >
      <img
        src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
        alt={title}
        loading="lazy"
        className="w-full aspect-video object-cover"
      />
      <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
          <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
        </span>
      </div>
      {duration && (
        <span className="absolute bottom-2 right-2 bg-foreground/80 text-background font-body text-[10px] px-1.5 py-0.5 rounded">
          {duration}
        </span>
      )}
    </a>
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary">
          Watch
        </span>
        <span className="font-body text-[10px] text-muted-foreground">
          {industry}
        </span>
        <span className="ml-auto">
          <FeedSaveButton
            type="video"
            itemKey={youtubeId}
            payload={{ title, channel, industry, youtubeId, duration, url: `https://www.youtube.com/watch?v=${youtubeId}` }}
          />
        </span>
      </div>
      <a
        href={`https://www.youtube.com/watch?v=${youtubeId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <h3 className="font-display font-700 text-sm text-foreground leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
      </a>
      <p className="font-body text-xs text-muted-foreground mt-1">{channel}</p>
    </div>
  </div>
);

export default FeedCardVideo;
