import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, Briefcase, Clock, Lightbulb, Route, Mic, ExternalLink } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  job_title: string;
  company: string;
  industry: string;
  career_stage: string | null;
  salary_range: string | null;
  years_experience: number | null;
  bio: string | null;
  typical_day: string | null;
  skills_required: string[] | null;
  how_they_got_the_job: string | null;
  advice: string | null;
  photo_url: string | null;
  podcast_episode: string | null;
  related_jobs_tag: string | null;
}

interface RelatedJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
}

interface RelatedArticle {
  title: string;
  source: string;
  url: string;
}

const CareerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<RelatedJob[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("career_profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setProfile(data);

        // Fetch related jobs
        if (data.related_jobs_tag) {
          const { data: jobs } = await supabase
            .from("jobs")
            .select("id, title, company, location, url")
            .eq("industry", data.industry)
            .or(`role_category.eq.${data.related_jobs_tag},tags.cs.{${data.related_jobs_tag}}`)
            .limit(6);
          if (jobs) setRelatedJobs(jobs);
        }

        // Fetch related articles
        const { data: articles } = await supabase
          .from("articles")
          .select("title, source, url")
          .eq("industry", data.industry)
          .order("scraped_at", { ascending: false })
          .limit(5);
        if (articles) setRelatedArticles(articles);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-body">Profile not found.</p>
        <Link to="/" className="text-primary font-body text-sm underline">Back to home</Link>
      </div>
    );
  }

  const industrySlug = profile.industry.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-");

  const sections = [
    { icon: User, title: "About", content: profile.bio },
    { icon: Clock, title: "A Typical Day", content: profile.typical_day },
    { icon: Route, title: "How They Got the Job", content: profile.how_they_got_the_job },
    { icon: Lightbulb, title: "Advice", content: profile.advice },
  ].filter((s) => s.content);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20 max-w-4xl">
        <Link
          to={`/${industrySlug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {profile.industry}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            {/* Photo */}
            <div className="w-full md:w-64 shrink-0">
              <div className="aspect-square bg-muted overflow-hidden">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex-1">
              <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">
                A Day in the Life
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-900 leading-tight mb-2">
                {profile.name}<span className="text-primary">.</span>
              </h1>
              <p className="font-display font-700 text-foreground text-lg">{profile.job_title}</p>
              <p className="text-muted-foreground font-body text-sm">{profile.company}</p>

              <div className="flex flex-wrap gap-3 mt-4">
                {profile.salary_range && (
                  <span className="inline-flex items-center gap-1.5 bg-muted px-3 py-1.5 text-xs font-body text-foreground">
                    <Briefcase className="w-3 h-3" /> {profile.salary_range}
                  </span>
                )}
                {profile.years_experience != null && (
                  <span className="inline-flex items-center gap-1.5 bg-muted px-3 py-1.5 text-xs font-body text-foreground">
                    <Clock className="w-3 h-3" /> {profile.years_experience} years experience
                  </span>
                )}
                {profile.career_stage && (
                  <span className="inline-flex items-center gap-1.5 bg-muted px-3 py-1.5 text-xs font-body text-foreground">
                    {profile.career_stage}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content sections */}
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <div className="flex items-center gap-2 mb-3">
                  <s.icon className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-700 text-lg">{s.title}</h2>
                </div>
                <p className="text-foreground font-body text-sm leading-relaxed whitespace-pre-line">
                  {s.content}
                </p>
              </div>
            ))}

            {/* Skills */}
            {profile.skills_required && profile.skills_required.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-700 text-lg">Skills Required</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className="border border-border px-3 py-1.5 text-xs font-body text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Podcast */}
            {profile.podcast_episode && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-700 text-lg">Related Episode</h2>
                </div>
                <a
                  href={profile.podcast_episode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-border px-4 py-3 text-sm font-body text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  Listen to episode <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="font-display font-700 text-lg mb-4">
                Related Jobs<span className="text-primary">.</span>
              </h2>
              <div className="space-y-3">
                {relatedJobs.map((job) => (
                  <a
                    key={job.id}
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-border p-4 hover:border-primary transition-colors group"
                  >
                    <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-xs mt-1">
                      {job.company}{job.location ? ` · ${job.location}` : ""}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="font-display font-700 text-lg mb-4">
                Related Articles<span className="text-primary">.</span>
              </h2>
              <div className="space-y-3">
                {relatedArticles.map((article) => (
                  <a
                    key={article.url}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-border p-4 hover:border-primary transition-colors group"
                  >
                    <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-xs mt-1">{article.source}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CareerProfile;
