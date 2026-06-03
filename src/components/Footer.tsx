import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-display text-xl font-700">
          howdoyoudo<span className="text-primary">.group</span>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground font-body">
          <a href="#series" className="hover:text-primary transition-colors">Series</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Listen</a>
          <Link to="/marketplace" className="hover:text-primary transition-colors">Job Marketplace</Link>
          <Link to="/employers" className="hover:text-primary transition-colors">Employers</Link>
          <Link to="/educators" className="hover:text-primary transition-colors">Educators</Link>
          <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms & Privacy</Link>
        </div>
        <p className="text-xs text-muted-foreground font-body">
          © 2026 Howdoyoudo Group. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
