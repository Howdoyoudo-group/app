import { ExternalLink, Play, Search } from "lucide-react";
import { ROLE_BBC_STORIES, BBC_CAREER_BASE } from "@/data/role-bbc-careers";
import { ROLE_YOUTUBE_VIDEOS } from "@/data/role-youtube-videos";

interface RoleWatchSectionProps {
  roleName: string;
  roleSlug: string;
}

const RoleWatchSection = ({ roleName, roleSlug }: RoleWatchSectionProps) => {
  const story = ROLE_BBC_STORIES[roleSlug];
  const videos = ROLE_YOUTUBE_VIDEOS[roleSlug] ?? [];
  const youTubeQuery = encodeURIComponent(`day in the life ${roleName} UK`);
  const youTubeUrl = `https://www.youtube.com/results?search_query=${youTubeQuery}&sp=EgIQAQ%253D%253D`;

  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">
        Watch<span className="text-primary">.</span>
      </h2>
      <p className="font-body text-sm text-muted-foreground mb-6">
        Real people sharing what it's actually like to work as a {roleName.toLowerCase()}.
      </p>

      {story && (
        <a
          href={`${BBC_CAREER_BASE}${story.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-card border-2 border-foreground overflow-hidden mb-6"
        >
          {story.image && (
            <div className="relative">
              <img
                src={story.image}
                alt={story.title}
                loading="lazy"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
                </span>
              </div>
            </div>
          )}
          <div className="p-4">
            <span className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary">
              BBC Bitesize · Careers
            </span>
            <h3 className="font-display font-700 text-base text-foreground leading-tight mt-1 group-hover:text-primary transition-colors">
              {story.title}
            </h3>
            <span className="inline-flex items-center gap-1 mt-2 font-body text-xs text-muted-foreground">
              Watch on bbc.co.uk <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </a>
      )}

      {videos.length > 0 && (
        <>
          <h3 className="font-display text-sm font-700 uppercase tracking-[0.18em] text-muted-foreground mb-3">
            On YouTube
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {videos.map((v) => (
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="relative">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    loading="lazy"
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-display font-700 text-sm text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {v.title}
                  </h4>
                  <p className="font-body text-xs text-muted-foreground mt-1">{v.channel}</p>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      <a
        href={youTubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-display text-xs font-700 uppercase tracking-[0.18em] text-foreground hover:text-primary transition-colors"
      >
        <Search className="w-3 h-3" />
        More on YouTube <ExternalLink className="w-3 h-3" />
      </a>
    </>
  );
};

export default RoleWatchSection;
