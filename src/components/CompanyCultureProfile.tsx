import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Globe,
  Briefcase,
  Heart,
  ExternalLink,
  Building2,
} from "lucide-react";
import SignUpForm from "@/components/SignUpForm";
import CompanyLogo from "@/components/CompanyLogo";
import { useTrackPageView } from "@/hooks/useTrackInteraction";
import SEO, { companyDesc, breadcrumbJsonLd } from "@/components/SEO";

export interface CompanyCultureData {
  slug: string;
  name: string;
  tagline: string;
  industry: string;
  industrySlug: string;
  coverImage: string;
  website: string;
  careersUrl: string;
  founded: string;
  hq: string;
  employees: string;
  sectors: string[];
  about: string[];
  videoUrl?: string;
  whyWorkHere: {
    title: string;
    description: string;
  }[];
  values: {
    emoji: string;
    title: string;
    description: string;
  }[];
  perks: string[];
  popularRoles: string[];
  glassdoor?: number;
  trustpilot?: number;
}

const ease = [0.22, 1, 0.36, 1] as const;

const CompanyCultureProfile = ({ data }: { data: CompanyCultureData }) => {
  // Track this brand engagement so it shows up in the employer Talent Pool dashboard
  useTrackPageView({
    type: "company_view",
    companySlug: data.slug,
    industry: data.industrySlug,
  });
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${data.name} Careers & Culture`}
        description={data.tagline ? `${data.name} - ${data.tagline.replace(/\.+$/, "")}. ${companyDesc(data.name)}` : companyDesc(data.name)}
        path={`/company/${data.slug}`}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: data.industry, path: `/${data.industrySlug}` },
          { name: data.name, path: `/company/${data.slug}` },
        ])}
      />
      {/* Cover Image */}
      <div className="relative w-full h-[280px] md:h-[400px] overflow-hidden">
        <img
          src={data.coverImage}
          alt={`${data.name} workplace`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 -mt-20 relative z-10">
        {/* Back link */}
        <Link
          to={`/${data.industrySlug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {data.industry}
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-12"
        >
          <div className="flex items-start gap-5 mb-2">
            <CompanyLogo company={data.name} size={88} className="mt-1 shadow-md" />
            <div className="min-w-0">
              <h1 className="font-display text-4xl md:text-6xl font-900 leading-[0.9] tracking-tight mb-2">
                {data.name}<span className="text-primary">.</span>
              </h1>
              <p className="text-muted-foreground font-body text-lg max-w-xl">
                {data.tagline}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main grid: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
            >
              <h2 className="font-display text-xl md:text-2xl font-700 mb-4">
                About {data.name}
              </h2>
              <div className="space-y-4">
                {data.about.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-foreground/80 font-body text-sm leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              {data.videoUrl && (
                <div className="mt-6 aspect-[9/16] max-w-[320px] overflow-hidden rounded-lg border border-border">
                  <iframe
                    src={data.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/").replace("/shorts/", "/embed/")}
                    title={`${data.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}
            </motion.section>

            {/* Why Work Here */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            >
              <h2 className="font-display text-xl md:text-2xl font-700 mb-6">
                Why work here<span className="text-primary">?</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.whyWorkHere.map((item, i) => (
                  <div
                    key={i}
                    className="border border-border p-5 hover:border-primary/40 transition-colors"
                  >
                    <h3 className="font-display text-sm font-700 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-xs leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Values */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
            >
              <h2 className="font-display text-xl md:text-2xl font-700 mb-6">
                Culture & values
              </h2>
              <div className="space-y-4">
                {data.values.map((value, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-start border border-border p-5"
                  >
                    <span className="text-2xl shrink-0">{value.emoji}</span>
                    <div>
                      <h3 className="font-display text-sm font-700 mb-1">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground font-body text-xs leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Perks */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease }}
            >
              <h2 className="font-display text-xl md:text-2xl font-700 mb-4">
                Perks & benefits
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.perks.map((perk, i) => (
                  <span
                    key={i}
                    className="bg-secondary text-secondary-foreground font-body text-xs px-3 py-1.5"
                  >
                    {perk}
                  </span>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="space-y-6"
          >
            {/* Key facts card */}
            <div className="border border-border divide-y divide-border">
              <div className="p-5">
                <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                  Employees
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-display text-sm font-700">
                    {data.employees}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                  Headquarters
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-display text-sm font-700">
                    {data.hq}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                  Founded
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-display text-sm font-700">
                    {data.founded}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                  Sectors
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.sectors.map((sector, i) => (
                    <span
                      key={i}
                      className="bg-primary/10 text-primary font-body text-[11px] px-2 py-0.5"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
              {data.glassdoor && (
                <div className="p-5">
                  <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                    Glassdoor
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-display text-sm font-700">
                      {data.glassdoor.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
              )}
              {data.trustpilot && (
                <div className="p-5">
                  <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                    Trustpilot
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-display text-sm font-700">
                      {data.trustpilot.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Popular roles */}
            <div className="border border-border p-5">
              <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                Popular roles
              </span>
              <ul className="mt-3 space-y-2">
                {data.popularRoles.map((role, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-primary" />
                    <span className="font-body text-sm text-foreground/80">
                      {role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA links */}
            <div className="space-y-3">
              <a
                href={data.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-display text-sm font-700 py-3 px-4 hover:opacity-90 transition-opacity"
              >
                <Building2 className="w-4 h-4" />
                View open roles
              </a>
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-border text-foreground font-body text-sm py-3 px-4 hover:border-primary transition-colors"
              >
                <Globe className="w-4 h-4" />
                Visit website
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Newsletter */}
      <div className="mt-20">
        <SignUpForm />
      </div>
    </div>
  );
};

export default CompanyCultureProfile;
