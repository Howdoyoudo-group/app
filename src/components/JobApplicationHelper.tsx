import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  Copy,
  Check,
  FileText,
  Lightbulb,
  Building2,
  MapPin,
  Banknote,
  Briefcase,
  RefreshCw,
  ChevronLeft,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export interface JobForHelper {
  title: string;
  company: string;
  industry: string;
  location: string;
  salary: string;
  description: string;
  tags: string[];
  type: string;
}

interface CvTip {
  category: string;
  tip: string;
}

interface ApplicationHelp {
  cvTips: CvTip[];
  coverLetter: string;
  keySkills: string[];
  companyInsight: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Keywords: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Experience: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Skills: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Format: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Tailoring: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

const JobApplicationHelper = ({
  job,
  onBack,
}: {
  job: JobForHelper;
  onBack: () => void;
}) => {
  const { user } = useAuth();
  const [result, setResult] = useState<ApplicationHelp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchHelp = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Gather user context from profile
    let userContext: Record<string, unknown> = {};
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, career_level, industry_interests, understand_me_results")
        .eq("id", user.id)
        .single();

      if (profile) {
        userContext = {
          fullName: profile.full_name || undefined,
          careerLevel: profile.career_level || undefined,
          industryInterests: profile.industry_interests || undefined,
        };

        // Extract skills from Understand Me results
        if (profile.understand_me_results && typeof profile.understand_me_results === "object") {
          const umResults = profile.understand_me_results as Record<string, unknown>;
          if (Array.isArray(umResults.transferableSkills)) {
            userContext.skills = umResults.transferableSkills;
          }
        }
      }
    }

    try {
      // Ensure we have a fresh session — stale tokens (e.g. after a key rotation)
      // produce "invalid claim: missing sub claim" 401s from edge functions.
      const { data: sessionData } = await supabase.auth.getSession();
      let session = sessionData.session;
      if (!session) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshed.session) {
          await supabase.auth.signOut();
          throw new Error("Your session has expired. Please sign in again.");
        }
        session = refreshed.session;
      }

      const { data, error: fnError } = await supabase.functions.invoke("tailor-application", {
        body: { job, userContext },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) {
        if (/sign in|invalid session/i.test(data.error)) {
          await supabase.auth.signOut();
        }
        throw new Error(data.error);
      }

      setResult(data as ApplicationHelp);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLetter = async () => {
    if (!result?.coverLetter) return;
    await navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    toast.success("Cover letter copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="mt-1 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-1">
            Howdy is helping you apply
          </p>
          <h3 className="font-display font-800 text-xl leading-tight text-foreground">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground font-body">
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {job.company}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            {job.salary && job.salary !== "Not listed" && (
              <span className="inline-flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" />
                {job.salary}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {job.type}
            </span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-6">
          <div className="border border-border p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="font-display font-700 text-sm">Analysing the role and tailoring advice…</span>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="border border-destructive/30 bg-destructive/5 p-5 space-y-3 text-center">
          <p className="font-body text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchHelp} className="font-body text-xs">
            Try again
          </Button>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Company Insight */}
          {result.companyInsight && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-l-3 border-primary bg-primary/5 p-4"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-700 text-xs uppercase tracking-widest text-primary mb-1">
                    What {job.company} is looking for
                  </p>
                  <p className="font-body text-sm text-foreground leading-relaxed">
                    {result.companyInsight}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Key Skills */}
          {result.keySkills?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="border border-border p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <h4 className="font-display font-700 text-sm text-foreground">
                  Keywords to include
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.keySkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs font-body">
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* CV Tips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-border p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-display font-700 text-sm text-foreground">
                CV tips for this role
              </h4>
            </div>
            <div className="space-y-3">
              {result.cvTips.map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-display font-700 uppercase tracking-wider ${
                      CATEGORY_COLORS[tip.category] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tip.category}
                  </span>
                  <p className="font-body text-sm text-foreground leading-relaxed">{tip.tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cover Letter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-border p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h4 className="font-display font-700 text-sm text-foreground">
                  Draft cover letter
                </h4>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyLetter}
                className="font-body text-xs gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="bg-muted/30 border border-border p-4 md:p-6 font-body text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {result.coverLetter}
            </div>
          </motion.div>

          {/* Regenerate */}
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchHelp}
              className="font-body text-xs gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationHelper;
