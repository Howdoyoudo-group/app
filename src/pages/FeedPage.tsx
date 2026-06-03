import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import MyFeed from "@/components/MyFeed";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
  const { user } = useAuth();
  const [industries, setIndustries] = useState<string[]>([]);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("industry_interests, job_preferences")
        .eq("id", user.id)
        .maybeSingle();
      setIndustries((data?.industry_interests as string[]) || []);
      setTargetCompanies(((data?.job_preferences as any)?.targetCompanies as string[]) || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <SEO path="/feed" title="Feed — Howdoyoudo?" />
      <SiteNav />
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <MyFeed industries={industries} targetCompanies={targetCompanies} />
      )}
      <Footer />
    </div>
  );
}
