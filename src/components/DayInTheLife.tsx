import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User, ArrowRight } from "lucide-react";

interface CareerProfile {
  id: string;
  name: string;
  job_title: string;
  company: string;
  salary_range: string | null;
  photo_url: string | null;
  career_stage: string | null;
}

interface DayInTheLifeProps {
  industry: string;
}

const DayInTheLife = ({ industry }: DayInTheLifeProps) => {
  const [profiles, setProfiles] = useState<CareerProfile[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("career_profiles")
        .select("id, name, job_title, company, salary_range, photo_url, career_stage")
        .eq("industry", industry)
        .order("created_at", { ascending: true });
      if (data) setProfiles(data);
    };
    fetch();
  }, [industry]);

  if (!profiles.length) return null;

  return (
    <motion.div
      id="day-in-the-life"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 scroll-mt-24"
    >
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">
        A Day in the Life<span className="text-primary">.</span>
      </h2>
      <p className="text-muted-foreground font-body text-sm mb-6">
        Real people, real roles - find out what it's actually like to work in {industry.toLowerCase()}.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {profiles.map((p) => (
          <Link
            key={p.id}
            to={`/profile/${p.id}`}
            className="group border border-border hover:border-primary transition-colors block"
          >
            {/* Photo */}
            <div className="aspect-[4/3] bg-muted overflow-hidden">
              {p.photo_url ? (
                <img
                  src={p.photo_url}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">
                {p.job_title}
              </h3>
              <p className="text-muted-foreground font-body text-xs mt-0.5">
                {p.company}
              </p>
              {p.salary_range && (
                <p className="text-muted-foreground/70 font-body text-[11px] mt-1">
                  {p.salary_range}
                </p>
              )}
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary">
                Read profile <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default DayInTheLife;
