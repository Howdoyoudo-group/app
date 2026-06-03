import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Globe, Linkedin, Briefcase, Instagram, Award, Newspaper, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import CompanyLogo from "@/components/CompanyLogo";
import { useTrackPageView } from "@/hooks/useTrackInteraction";
import SEO, { companyDesc, breadcrumbJsonLd } from "@/components/SEO";

export interface DynamicCompanyProfile {
  slug: string;
  name: string;
  industry: string | null;
  tagline: string | null;
  about: string | null;
  mission: string | null;
  culture: string | null;
  perks: string[];
  locations: string[];
  logo_url: string | null;
  cover_image_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  careers_url: string | null;
  instagram_url: string | null;
  press_mentions: { title: string; url: string }[];
  awards: { title: string; year?: string }[];
  sustainability: string | null;
  custom_blocks: { heading: string; body: string }[];
}

const ease = [0.22, 1, 0.36, 1] as const;

const CompanyProfileDynamic = ({ profile }: { profile: DynamicCompanyProfile }) => {
  useTrackPageView({
    type: "company_view",
    companySlug: profile.slug,
    industry: profile.industry ?? undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${profile.name} - Company Profile`}
        description={companyDesc(profile.name)}
        path={`/company/${profile.slug}`}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Employers", path: "/employers" },
          { name: profile.name, path: `/company/${profile.slug}` },
        ])}
      />
      {/* Cover */}
      {profile.cover_image_url ? (
        <div className="relative w-full h-[280px] md:h-[400px] overflow-hidden">
          <img src={profile.cover_image_url} alt={`${profile.name} cover`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-[160px] bg-muted" />
      )}

      <div className="container mx-auto px-6 md:px-12 -mt-20 relative z-10 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="border-2 border-foreground bg-background p-6 md:p-8 mb-8"
        >
          <div className="flex items-start gap-4 md:gap-6">
            <div className="flex-shrink-0">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt={`${profile.name} logo`} className="w-20 h-20 md:w-28 md:h-28 object-contain border-2 border-foreground bg-background" />
              ) : (
                <CompanyLogo company={profile.name} size={96} />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-3xl md:text-5xl leading-tight">{profile.name}</h1>
              {profile.tagline && <p className="text-base md:text-lg mt-2 text-muted-foreground">{profile.tagline}</p>}
              {profile.industry && (
                <span className="inline-block mt-3 text-xs font-bold uppercase tracking-wide border-2 border-foreground px-2 py-0.5">
                  {profile.industry}
                </span>
              )}
            </div>
          </div>

          {/* External links */}
          <div className="flex flex-wrap gap-2 mt-6">
            {profile.website_url && <ExtLink href={profile.website_url} icon={<Globe className="w-3 h-3" />} label="Website" />}
            {profile.careers_url && <ExtLink href={profile.careers_url} icon={<Briefcase className="w-3 h-3" />} label="Careers" />}
            {profile.linkedin_url && <ExtLink href={profile.linkedin_url} icon={<Linkedin className="w-3 h-3" />} label="LinkedIn" />}
            {profile.instagram_url && <ExtLink href={profile.instagram_url} icon={<Instagram className="w-3 h-3" />} label="Instagram" />}
          </div>
        </motion.div>

        {/* About */}
        {profile.about && (
          <Block title="About">
            <p className="whitespace-pre-line leading-relaxed">{profile.about}</p>
          </Block>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.mission && (
            <Block title="Mission">
              <p className="whitespace-pre-line leading-relaxed">{profile.mission}</p>
            </Block>
          )}
          {profile.culture && (
            <Block title="Culture">
              <p className="whitespace-pre-line leading-relaxed">{profile.culture}</p>
            </Block>
          )}
        </div>

        {profile.perks.length > 0 && (
          <Block title="Perks">
            <div className="flex flex-wrap gap-2">
              {profile.perks.map((p) => (
                <span key={p} className="text-sm border-2 border-foreground px-3 py-1 bg-background">{p}</span>
              ))}
            </div>
          </Block>
        )}

        {profile.locations.length > 0 && (
          <Block title="Locations">
            <div className="flex flex-wrap gap-2">
              {profile.locations.map((p) => (
                <span key={p} className="text-sm border-2 border-dashed border-foreground px-3 py-1 bg-background">{p}</span>
              ))}
            </div>
          </Block>
        )}

        {profile.press_mentions.length > 0 && (
          <Block title="Press" icon={<Newspaper className="w-4 h-4" />}>
            <ul className="space-y-2">
              {profile.press_mentions.map((p, i) => (
                <li key={i}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm hover:text-primary underline-offset-4 hover:underline">
                    {p.title} <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {profile.awards.length > 0 && (
          <Block title="Awards" icon={<Award className="w-4 h-4" />}>
            <ul className="space-y-1">
              {profile.awards.map((a, i) => (
                <li key={i} className="text-sm">
                  <span className="font-bold">{a.title}</span>
                  {a.year && <span className="text-muted-foreground"> · {a.year}</span>}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {profile.sustainability && (
          <Block title="Sustainability" icon={<Leaf className="w-4 h-4" />}>
            <p className="whitespace-pre-line leading-relaxed">{profile.sustainability}</p>
          </Block>
        )}

        {profile.custom_blocks.map((b, i) => (
          <Block key={i} title={b.heading || "More"}>
            <p className="whitespace-pre-line leading-relaxed">{b.body}</p>
          </Block>
        ))}
      </div>
    </div>
  );
};

const Block = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <section className="border-2 border-foreground bg-background p-6 mb-6">
    <h2 className="font-display text-xl uppercase tracking-wide mb-3 inline-flex items-center gap-2">
      {icon} {title}
    </h2>
    <div className="text-foreground/90">{children}</div>
  </section>
);

const ExtLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase border-2 border-foreground bg-background px-3 py-1.5 hover:bg-primary">
    {icon} {label}
  </a>
);

export default CompanyProfileDynamic;
