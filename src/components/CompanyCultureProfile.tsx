import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Globe,
  Briefcase,
  ExternalLink,
  Building2,
  Star,
  Mail,
  Newspaper,
} from "lucide-react";
import SignUpForm from "@/components/SignUpForm";
import CompanyLogo from "@/components/CompanyLogo";
import { useTrackPageView } from "@/hooks/useTrackInteraction";
import SEO, { companyDesc, breadcrumbJsonLd } from "@/components/SEO";
import { toEmbeddableVideo } from "@/lib/video-embed";
import { fetchCompanyNews, type CompanyNewsItem } from "@/lib/company-news";

export interface CompanyCultureData {
  slug: string;
  name: string;
  tagline: string;
  industry: string;
  industrySlug: string;
  coverImage: string;
  website: string;
  careersUrl: string;
  /** Direct "view live vacancies" link, when it differs from careersUrl (the general careers/info page) */
  jobsUrl?: string;
  founded: string;
  hq: string;
  employees: string;
  sectors: string[];
  about: string[];
  videoUrl?: string;
  /** Defaults to "landscape" (16:9) - set "portrait" for Shorts/TikTok-style 9:16 clips */
  videoOrientation?: "landscape" | "portrait";
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
  /** Deep link to this company's actual Glassdoor/Trustpilot review page, not just the homepage */
  glassdoorUrl?: string;
  trustpilotUrl?: string;
  keyPeople?: { name: string; title: string; photoUrl?: string }[];
  /** Supplements the plain hq line with structured, possibly multi-site office info */
  officeLocations?: { label: string; address?: string; isHQ?: boolean }[];
  contactLinks?: { label: string; url: string }[];
  /** Static fallback/override for the auto-matched news feed below */
  newsItems?: { title: string; url: string; source?: string }[];
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
              {data.videoUrl && (() => {
                const video = toEmbeddableVideo(data.videoUrl);
                if (!video) return null;
                const isPortrait = data.videoOrientation === "portrait";
                return (
                  <div
                    className={`mt-6 overflow-hidden rounded-lg border border-border ${
                      isPortrait ? "aspect-[9/16] max-w-[320px]" : "aspect-video max-w-2xl"
                    }`}
                  >
                    {video.kind === "iframe" ? (
                      <iframe
                        src={video.src}
                        title={`${data.name} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <video src={video.src} controls className="w-full h-full" />
                    )}
                  </div>
                );
              })()}
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

            {/* Key people */}
            {data.keyPeople && data.keyPeople.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease }}
              >
                <h2 className="font-display text-xl md:text-2xl font-700 mb-6">
                  Key people
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.keyPeople.map((person, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 border border-border p-4"
                    >
                      {person.photoUrl ? (
                        <img
                          src={person.photoUrl}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-secondary-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-display text-sm font-700 truncate">{person.name}</p>
                        <p className="text-muted-foreground font-body text-xs truncate">{person.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Office */}
            {data.officeLocations && data.officeLocations.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease }}
              >
                <h2 className="font-display text-xl md:text-2xl font-700 mb-6">
                  Office
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.officeLocations.map((office, i) => (
                    <div key={i} className="flex gap-3 items-start border border-border p-4">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-display text-sm font-700">
                          {office.label}
                          {office.isHQ && (
                            <span className="ml-2 text-[10px] font-body uppercase tracking-widest text-primary">HQ</span>
                          )}
                        </p>
                        {office.address && (
                          <p className="text-muted-foreground font-body text-xs mt-1">{office.address}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Get in touch */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease }}
            >
              <h2 className="font-display text-xl md:text-2xl font-700 mb-4">
                Get in touch
              </h2>
              <div className="flex flex-wrap gap-2">
                {(data.contactLinks && data.contactLinks.length > 0
                  ? data.contactLinks
                  : [{ label: "Careers page", url: data.careersUrl }, { label: "Website", url: data.website }]
                ).map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-border font-body text-xs px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.section>

            {/* Latest news */}
            <CompanyNewsSection
              industrySlug={data.industrySlug}
              companyName={data.name}
              staticItems={data.newsItems}
            />
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
                  <RatingRow score={data.glassdoor} url={data.glassdoorUrl} />
                </div>
              )}
              {data.trustpilot && (
                <div className="p-5">
                  <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                    Trustpilot
                  </span>
                  <RatingRow score={data.trustpilot} url={data.trustpilotUrl} />
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
              <Link
                to={`/marketplace?company=${encodeURIComponent(data.name)}`}
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-display text-sm font-700 py-3 px-4 hover:opacity-90 transition-opacity"
              >
                <Briefcase className="w-4 h-4" />
                See jobs on Howdoyoudo
              </Link>
              <a
                href={data.jobsUrl || data.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-primary text-primary font-body text-sm py-3 px-4 hover:bg-primary/5 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Apply on {data.name}'s site
                <ExternalLink className="w-3 h-3" />
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

/** Numeric score, linked to the company's actual review page when we have one */
const RatingRow = ({ score, url }: { score: number; url?: string }) => {
  const content = (
    <div className="flex items-center gap-2 mt-1">
      <Star className="w-4 h-4 text-muted-foreground" />
      <span className="font-display text-sm font-700">{score.toFixed(1)} / 5.0</span>
      {url && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
    </div>
  );
  if (!url) return content;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
      {content}
    </a>
  );
};

/** Recent company news, reusing the same title-matching approach as the Companies feed on /feed */
const CompanyNewsSection = ({
  industrySlug,
  companyName,
  staticItems,
}: {
  industrySlug: string;
  companyName: string;
  staticItems?: { title: string; url: string; source?: string }[];
}) => {
  const hasStatic = !!staticItems && staticItems.length > 0;
  const [fetched, setFetched] = useState<CompanyNewsItem[] | null>(null);

  useEffect(() => {
    if (hasStatic) return;
    let cancelled = false;
    fetchCompanyNews(industrySlug, [companyName]).then((items) => {
      if (!cancelled) setFetched(items);
    });
    return () => {
      cancelled = true;
    };
  }, [industrySlug, companyName, hasStatic]);

  const items: CompanyNewsItem[] = hasStatic
    ? staticItems!.map((n, i) => ({ id: `static-${i}`, title: n.title, source: n.source || "", url: n.url, publishedAt: null }))
    : fetched || [];

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease }}
    >
      <h2 className="font-display text-xl md:text-2xl font-700 mb-4 flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-primary" />
        Latest news
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 border border-border p-4 hover:border-primary/40 transition-colors group"
            >
              <span className="font-body text-sm text-foreground/90 group-hover:text-primary transition-colors">
                {item.title}
              </span>
              <span className="shrink-0 flex items-center gap-1 text-muted-foreground font-body text-xs">
                {item.source}
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </motion.section>
  );
};

export default CompanyCultureProfile;
