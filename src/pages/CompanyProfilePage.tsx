import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CompanyProfileDynamic, { DynamicCompanyProfile } from "@/components/CompanyProfileDynamic";
import { Loader2 } from "lucide-react";

/**
 * Generic dynamic company profile route used when the slug doesn't match a
 * hardcoded /company/<slug> page. Loads from the company_profiles table.
 */
const CompanyProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<DynamicCompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      // Find company by slug, then its profile
      const { data: companyRow } = await supabase
        .from("employer_companies")
        .select("id, slug, name, industry")
        .eq("slug", slug)
        .maybeSingle();

      if (!companyRow) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: profileRow } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("company_id", companyRow.id)
        .maybeSingle();

      if (!profileRow) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile({
        slug: companyRow.slug,
        name: companyRow.name,
        industry: companyRow.industry,
        tagline: profileRow.tagline,
        about: profileRow.about,
        mission: profileRow.mission,
        culture: profileRow.culture,
        perks: profileRow.perks ?? [],
        locations: profileRow.locations ?? [],
        logo_url: profileRow.logo_url,
        cover_image_url: profileRow.cover_image_url,
        website_url: profileRow.website_url,
        linkedin_url: profileRow.linkedin_url,
        careers_url: profileRow.careers_url,
        instagram_url: profileRow.instagram_url,
        press_mentions: (profileRow.press_mentions as any) ?? [],
        awards: (profileRow.awards as any) ?? [],
        sustainability: profileRow.sustainability,
        custom_blocks: (profileRow.custom_blocks as any) ?? [],
      });
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-3xl mb-2">Company profile not found</h1>
        <p className="text-muted-foreground">This company hasn't published a profile yet.</p>
      </div>
    );
  }

  return <CompanyProfileDynamic profile={profile} />;
};

export default CompanyProfilePage;
