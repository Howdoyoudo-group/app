import { Headphones } from "lucide-react";
import { useEffect, useState } from "react";

export interface PodcastItem {
  title: string;
  description: string;
  url: string;
  image?: string;
}

interface PodcastGridProps {
  podcasts: PodcastItem[];
}

/** Generate a deterministic hue from a string */
const stringToHue = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

/** Fetch podcast artwork from iTunes Search API */
const fetchArtwork = async (title: string): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=podcast&limit=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.artworkUrl600 || data.results?.[0]?.artworkUrl100 || null;
  } catch {
    return null;
  }
};

const PodcastCard = ({ pod }: { pod: PodcastItem }) => {
  const [artwork, setArtwork] = useState<string | null>(pod.image || null);
  const hue = stringToHue(pod.title);
  const initials = pod.title
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  useEffect(() => {
    if (pod.image) return;
    let cancelled = false;
    fetchArtwork(pod.title).then((url) => {
      if (!cancelled && url) setArtwork(url);
    });
    return () => { cancelled = true; };
  }, [pod.title, pod.image]);

  return (
    <a
      key={pod.url}
      href={pod.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-2 border-border hover:border-primary transition-all group overflow-hidden"
    >
      {artwork ? (
        <div className="aspect-square overflow-hidden">
          <img
            src={artwork}
            alt={pod.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            width={512}
            height={512}
          />
        </div>
      ) : (
        <div
          className="aspect-square flex flex-col items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform duration-300"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 60%, 25%), hsl(${(hue + 40) % 360}, 50%, 15%))`,
          }}
        >
          <Headphones className="w-8 h-8 text-white/60" />
          <span className="font-display font-900 text-2xl text-white/80 tracking-wider">
            {initials}
          </span>
        </div>
      )}
      <div className="p-3">
        <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors leading-tight">
          {pod.title}
        </h3>
        <p className="text-muted-foreground font-body text-xs mt-1 line-clamp-2">
          {pod.description}
        </p>
        <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-display font-600 text-primary uppercase tracking-wider">
          Listen →
        </span>
      </div>
    </a>
  );
};

const PodcastGrid = ({ podcasts }: PodcastGridProps) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
    {podcasts.map((pod) => (
      <PodcastCard key={pod.url} pod={pod} />
    ))}
  </div>
);

export default PodcastGrid;
