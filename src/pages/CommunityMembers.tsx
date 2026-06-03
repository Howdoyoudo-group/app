import SEO from "@/components/SEO";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import MembersArea from "@/components/MembersArea";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CommunityMembers = () => {
  const [searchParams] = useSearchParams();
  const threadUserId = searchParams.get("thread");
  return (
    <div className="min-h-screen bg-background">
      <SEO
        path="/community/members"
        title="Member Directory — Howdoyoudo"
        description="Browse and message opted-in Howdoyoudo community members."
      />
      <SiteNav />
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-6">
        <Link
          to="/community"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to community
        </Link>
        <header className="space-y-2">
          <p className="font-display text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Community
          </p>
          <h1 className="font-display text-4xl md:text-6xl leading-none">
            Real member directory
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Find opted-in members, send connection messages and see mentor badges.
          </p>
        </header>
        <MembersArea initialThreadUserId={threadUserId} />
      </main>
      <Footer />
    </div>
  );
};

export default CommunityMembers;
