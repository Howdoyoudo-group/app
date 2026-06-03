import { ExternalLink } from "lucide-react";

type NewsfeedSource = {
  title: string;
  url: string;
};

interface NewsfeedModalProps {
  sources: NewsfeedSource[];
  industry: string;
}

const NewsfeedModal = ({ sources, industry }: NewsfeedModalProps) => {
  return (
    <div id="newsfeed" className="mb-16 scroll-mt-24">
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">
        Newsfeed<span className="text-primary">.</span>
      </h2>
      <p className="text-muted-foreground font-body text-sm mb-4">
        Stay up to date with the latest from the {industry.toLowerCase()} industry.
      </p>
      <div className="space-y-4">
        {sources.map((source) => (
          <a
            key={source.title}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-border p-4 hover:border-primary transition-colors group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">
                {source.title}
              </h3>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-4" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsfeedModal;
