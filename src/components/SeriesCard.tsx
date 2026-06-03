import { Link } from "react-router-dom";

interface SeriesCardProps {
  title: string;
  description: string;
  image: string;
  index: number;
  href?: string;
}

const SeriesCard = ({ title, description, image, href }: SeriesCardProps) => {
  const content = (
    <div className="group relative overflow-hidden cursor-pointer">
      <div className="aspect-[3/4] overflow-hidden border-2 border-foreground">
        <img
          src={image}
          alt={`How do you do ${title}`}
          className="w-full h-full object-cover will-change-transform"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="mt-4">
        <p className="text-foreground text-xs tracking-[0.25em] uppercase font-body mb-1">
          How do you do<span className="text-primary">?</span>
        </p>
        <h3 className="font-display text-2xl md:text-3xl leading-none mb-2 text-foreground">
          {title}<span className="text-primary">?</span>
        </h3>
        <p className="text-muted-foreground text-sm font-body leading-relaxed max-w-xs">
          {description}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        to={href}
        onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default SeriesCard;
