import { Download, ExternalLink } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";

const CHECKLIST_URL = "/downloads/work-curiosity-checklist.png";

const WorkCuriosityChecklist = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Work Curiosity Checklist - Free Download"
        description="A printable, one-page checklist covering all five steps of the Howdoyoudo journey - Inspire, Discover, Level Up, Jobs and Community."
        path="/resources/work-curiosity-checklist"
      />

      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20">
        <p className="text-foreground text-xs tracking-[0.3em] uppercase font-body mb-3">
          Free Download
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-900 leading-[0.9] tracking-tight mb-4">
          Work Curiosity Checklist<span className="text-primary">.</span>
        </h1>
        <p className="text-muted-foreground font-body text-lg max-w-2xl mb-10">
          One page, five steps - Inspire, Discover, Level Up, Jobs and Community. Print it out,
          stick it up, and tick things off as you go.
        </p>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="border-2 border-foreground bg-background shadow-[8px_8px_0_0_hsl(var(--foreground))] overflow-hidden">
            <img
              src={CHECKLIST_URL}
              alt="Work Curiosity Checklist - a printable one-page guide covering Inspire, Discover, Level Up, Jobs and Community"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>

          <div>
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-4">
              What's in it<span className="text-primary">.</span>
            </h2>
            <ul className="space-y-3 mb-8 font-body text-sm md:text-base text-muted-foreground">
              <li><span className="font-display font-700 text-foreground">Inspire</span> - find what excites you</li>
              <li><span className="font-display font-700 text-foreground">Discover</span> - explore where you could fit</li>
              <li><span className="font-display font-700 text-foreground">Level Up</span> - grow your skills, close the gaps</li>
              <li><span className="font-display font-700 text-foreground">Jobs</span> - get ready, apply with confidence</li>
              <li><span className="font-display font-700 text-foreground">Community</span> - build your network, open more doors</li>
            </ul>

            <div className="flex flex-wrap gap-3">
              <a
                href={CHECKLIST_URL}
                download="Howdoyoudo-Work-Curiosity-Checklist.png"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-700 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                Download to print
              </a>
              <a
                href={CHECKLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-foreground px-6 py-3 font-display font-700 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open full size
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WorkCuriosityChecklist;
