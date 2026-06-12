import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Briefcase, ExternalLink, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SourceAttribution, { SourceAttributionFooter, detectJobSource } from "@/components/AdzunaAttribution";

interface CareerJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  type: string | null;
  description: string | null;
  url: string;
  value_chain_stage: string | null;
  role_category: string | null;
  career_level: string | null;
  industry: string | null;
  created_at: string;
}

const CAREER_LEVELS = ["All", "Entry", "Mid", "Senior", "Executive"] as const;
type CareerLevelFilter = (typeof CAREER_LEVELS)[number];

interface CareerJobsPanelProps {
  open: boolean;
  onClose: () => void;
  industry: string;
  stage?: string;
  role?: string;
}

const CareerJobsPanel = ({ open, onClose, industry, stage, role }: CareerJobsPanelProps) => {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [levelFilter, setLevelFilter] = useState<CareerLevelFilter>("All");

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    const fetchJobs = async () => {
      // Normalize industry name to DB slug
      const slugMap: Record<string, string> = {
        "Estate Agency": "estate-agency",
        "Interior Design": "interior-design",
        "Food & Drink": "hospitality",
        "Food and Drink": "hospitality",
        "Formula 1": "formula-1",
      };
      const dbIndustry = slugMap[industry] || industry.toLowerCase();

      let query = supabase
        .from("jobs")
        .select("id, title, company, location, salary, type, description, url, value_chain_stage, role_category, career_level, industry, created_at")
        .ilike("industry", `%${dbIndustry}%`);

      if (stage) {
        query = query.ilike("value_chain_stage", `%${stage}%`);
      }
      if (role) {
        query = query.ilike("role_category", `%${role}%`);
      }
      if (levelFilter !== "All") {
        query = query.eq("career_level", levelFilter.toLowerCase());
      }

      const { data, error } = await query
        .order("ai_confidence", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setJobs(data as CareerJob[]);
      }
      setLoading(false);
    };

    fetchJobs();
  }, [open, industry, stage, role, levelFilter]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b border-border p-5 z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-display font-700 text-lg text-foreground">
                    {role || stage || "All"} Jobs
                  </h2>
                  <p className="text-muted-foreground font-body text-xs mt-0.5">
                    {stage && <span className="text-primary">{stage}</span>}
                    {stage && role && <span> · </span>}
                    {role && <span>{role}</span>}
                    {!stage && !role && <span>{industry}</span>}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Career level filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {CAREER_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevelFilter(lvl)}
                    className={`px-3 py-1 text-[11px] font-display font-700 uppercase tracking-wide rounded-full border transition-colors ${
                      levelFilter === lvl
                        ? lvl === "Entry"
                          ? "bg-[hsl(120,100%,45%)] text-black border-[hsl(120,100%,45%)]"
                          : "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-border p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16">
                  <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="font-display font-700 text-foreground text-sm mb-1">
                    No jobs found yet
                  </p>
                  <p className="text-muted-foreground font-body text-xs">
                    Jobs matching {role ? `"${role}"` : `"${stage}"`} will appear here as they're synced.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <a
                      key={job.id}
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-border p-4 hover:border-primary transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors truncate">
                              {job.title}
                            </h3>
                            {job.career_level === "entry" && levelFilter === "All" && (
                              <span className="shrink-0 text-[9px] font-display font-700 uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                                style={{ background: "hsl(120,100%,45%)", color: "#000" }}>
                                Entry
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground font-body text-xs mt-0.5">
                            {job.company}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3 text-muted-foreground font-body text-[11px]">
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {job.type}
                          </span>
                        )}
                        {job.salary && (
                          <span className="inline-flex items-center gap-1">
                            💷 {job.salary}
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-muted-foreground font-body text-xs mt-2 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {(() => {
                        const src = detectJobSource(job.url);
                        if (!job.value_chain_stage && !job.role_category && !src) return null;
                        return (
                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            {job.value_chain_stage && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-body rounded-sm">
                                {job.value_chain_stage}
                              </span>
                            )}
                            {job.role_category && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-body rounded-sm">
                                {job.role_category}
                              </span>
                            )}
                            {src && <SourceAttribution source={src} variant="badge" className="ml-auto" />}
                          </div>
                        );
                      })()}
                    </a>
                  ))}
                  <SourceAttributionFooter jobs={jobs} className="pt-3 border-t border-border" />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CareerJobsPanel;
