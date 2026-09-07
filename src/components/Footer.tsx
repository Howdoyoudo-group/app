import { Link } from "react-router-dom";
import { Instagram, Youtube, Linkedin } from "lucide-react";

// Lucide has no TikTok glyph (brand-icon licensing) - a small inline path is
// the standard workaround other sites use too.
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.6 5.82a4.28 4.28 0 0 1-3.11-1.32 4.32 4.32 0 0 1-1.19-3H9.28v13.66a2.6 2.6 0 1 1-1.85-2.49v-2.94a5.5 5.5 0 1 0 4.77 5.45V9.4a7.19 7.19 0 0 0 4.4 1.49V7.86a4.3 4.3 0 0 1-.99-.04z" />
  </svg>
);

// lucide's "x" icon (the current X/Twitter logo)
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.4 22H1.3l8.1-9.3L1 2h7.2l5 6.6zm-1.2 18h1.7L7.4 3.9H5.6z" />
  </svg>
);

const SOCIALS = [
  { name: "Instagram", href: "https://instagram.com/Howdoyoudo_official", Icon: Instagram },
  { name: "TikTok", href: "https://tiktok.com/@Howdoyoudo_official", Icon: TikTokIcon },
  { name: "YouTube", href: "https://youtube.com/@HDYD_OFFICIAL", Icon: Youtube },
  { name: "X", href: "https://x.com/HDYD_OFFICIAL", Icon: XIcon },
  { name: "LinkedIn", href: "https://linkedin.com/company/howdoyoudoltd", Icon: Linkedin },
];

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-display text-xl font-700">
          howdoyoudo<span className="text-primary">.group</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground font-body">
          <a href="#series" className="hover:text-primary transition-colors">Series</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Listen</a>
          <Link to="/marketplace" className="hover:text-primary transition-colors">Job Marketplace</Link>
          <Link to="/employers" className="hover:text-primary transition-colors">Employers</Link>
          <Link to="/educators" className="hover:text-primary transition-colors">Educators</Link>
          <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms & Privacy</Link>
        </div>
        <div className="flex items-center gap-4">
          {SOCIALS.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Howdoyoudo on ${name}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-body">
          © 2026 Howdoyoudo Group. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
