import { FileText } from "lucide-react";
import CVBuilder from "@/components/CVBuilder";
import Footer from "@/components/Footer";
import SiteNav from "@/components/SiteNav";

const CVBuilderPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="container mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-6 md:pb-8">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="w-6 h-6 md:w-7 md:h-7 text-primary" />
          <span className="font-display text-xs md:text-sm uppercase tracking-widest text-muted-foreground">
            Profile Builder
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-800 text-foreground leading-tight mb-3">
          Build a profile that shows who you are<span className="text-primary">…</span> not just what you've achieved<span className="text-primary">.</span>
        </h1>
        <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Add your story, skills, interests, projects and video intro. Perfect if you're starting
          out and don't have a traditional CV yet.
        </p>
      </section>

      {/* Builder */}
      <section className="container mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <CVBuilder />
      </section>

      <Footer />
    </div>
  );
};

export default CVBuilderPage;
