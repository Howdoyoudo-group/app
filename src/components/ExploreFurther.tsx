interface ExploreLink {
  title: string;
  description: string;
  url: string;
}

interface ExploreFurtherProps {
  links: ExploreLink[];
  title?: string;
  subtitle?: string;
}

const ExploreFurther = ({ links, title = "Explore Further", subtitle }: ExploreFurtherProps) => {
  if (!links.length) return null;
  return (
    <div className="mt-12 space-y-4">
      <h3 className="font-display text-lg font-700">{title}<span className="text-primary">.</span></h3>
      {subtitle && <p className="text-muted-foreground font-body text-sm -mt-2">{subtitle}</p>}
      <div className="space-y-3">
        {links.map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
            <h4 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{link.title}</h4>
            <p className="text-muted-foreground font-body text-xs mt-1">{link.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ExploreFurther;
