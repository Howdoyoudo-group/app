import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, Download, Loader2, FileText, ArrowRight, ExternalLink, Send } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApplyAndTrack } from "@/hooks/useApplyAndTrack";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function HelpMeApply() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  // Carries the job over from a Job Tracker card (or any other "Help me
  // apply" link) so this page isn't just a blank form disconnected from the
  // job the user actually clicked from.
  const prefillCompany = searchParams.get("company") || "";
  const prefillTitle = searchParams.get("title") || "";
  const prefillUrl = searchParams.get("url") || "";
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly">("friendly");
  const [coverLetter, setCoverLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [applied, setApplied] = useState(false);
  const { applyAndTrack } = useApplyAndTrack();

  const markApplied = async () => {
    if (!prefillUrl) return;
    await applyAndTrack({
      company: prefillCompany || "Unknown",
      title: prefillTitle || "Untitled role",
      url: prefillUrl,
    });
    setApplied(true);
    toast.success("Saved to your Job Tracker as applied");
  };

  const generate = async () => {
    if (!user) { toast.error("Sign in to use this feature."); return; }
    if (!jobDescription.trim()) { toast.error("Paste a job description first."); return; }
    setGenerating(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("job_preferences, full_name")
        .eq("id", user.id)
        .maybeSingle();
      const jp = (profile as any)?.job_preferences || {};
      const pb = jp.profileBuilder || {};
      const profileData = {
        fullName: (profile as any)?.full_name || pb.fullName || "",
        location: pb.location || "",
        personalIntro: pb.personalIntro || jp.personalIntro || "",
        skills: Object.values(pb.skills || {}).flat(),
        workExperience: (pb.workExperience || jp.workExperience || []).map((w: any) => ({
          jobTitle: w.title || w.jobTitle || "",
          company: w.company || "",
          dates: w.dates || "",
          description: w.description || "",
        })),
        education: (pb.education || jp.education || []).map((e: any) => ({
          school: e.school || "",
          qualification: e.qualification || "",
          grade: e.grade || "",
        })),
      };

      const contextHeader = prefillCompany || prefillTitle
        ? `Role: ${prefillTitle || "Unknown"}\nCompany: ${prefillCompany || "Unknown"}\n\n`
        : "";
      const res = await fetch(
        "https://wgistckxxbfpsuulbswr.supabase.co/functions/v1/help-me-apply",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ jobDescription: contextHeader + jobDescription, tone, profileData }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.coverLetter) {
        toast.error(data?.error || "Could not generate cover letter. Try again.");
        return;
      }
      setCoverLetter(data.coverLetter);
      toast.success("Cover letter ready!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard!");
  };

  const downloadTxt = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEO title="Help Me Apply | Howdoyoudo?" description="AI-powered cover letters tailored to you and the job." />
      <main className="min-h-screen bg-background">
        <section className="px-4 sm:px-6 lg:px-10 pt-8 pb-16 max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-primary bg-primary/10 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-display font-700 text-xs uppercase tracking-widest">AI Application Helper</span>
            </div>
            <h1 className="font-display font-900 text-4xl md:text-5xl leading-[1.05] tracking-tight text-foreground mb-3">
              Help Me Apply
            </h1>
            <p className="font-body text-base text-muted-foreground max-w-lg">
              Paste the job description and we'll write a tailored cover letter using your profile. Takes about 15 seconds.
            </p>
          </motion.div>

          {!user ? (
            <motion.div {...fadeUp} className="text-center py-16 border-2 border-dashed border-foreground/20 rounded-3xl">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display font-900 text-2xl mb-2">Sign in to get started</h2>
              <p className="font-body text-muted-foreground mb-6">We use your profile to personalise your cover letter.</p>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/auth">Sign in / Create account <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div {...fadeUp} className="space-y-6">
              {/* Tone toggle */}
              <div className="flex items-center gap-3">
                <span className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground">Tone:</span>
                <div className="flex rounded-full border-2 border-foreground overflow-hidden">
                  {(["friendly", "formal"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`px-4 py-1.5 font-display font-700 text-xs uppercase tracking-wide transition-colors ${
                        tone === t ? "bg-primary text-foreground" : "bg-background text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {(prefillCompany || prefillTitle) && (
                <div className="flex items-center justify-between gap-3 border-2 border-primary/40 bg-primary/5 rounded-2xl px-4 py-3">
                  <p className="font-body text-sm text-foreground">
                    Cover letter for{" "}
                    <span className="font-display font-700">{prefillTitle || "this role"}</span>
                    {prefillCompany && (
                      <>
                        {" "}at <span className="font-display font-700">{prefillCompany}</span>
                      </>
                    )}
                  </p>
                  {prefillUrl && (
                    <a
                      href={prefillUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-body text-primary hover:underline"
                    >
                      View listing <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Job description input */}
              <div>
                <label className="block font-display font-700 text-xs uppercase tracking-widest text-foreground mb-2">
                  Job Description
                </label>
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="font-body text-sm min-h-[200px] rounded-2xl border-2 border-foreground/30 focus:border-primary resize-none"
                />
              </div>

              <Button
                onClick={generate}
                disabled={generating || !jobDescription.trim()}
                size="lg"
                className="w-full rounded-full gap-2"
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Writing your cover letter…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Write my cover letter</>
                )}
              </Button>

              {/* Output */}
              {coverLetter && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-900 text-lg uppercase tracking-wide">Your Cover Letter</h2>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyToClipboard} className="rounded-full border-2 border-foreground gap-1.5 font-display font-700 text-xs uppercase">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadTxt} className="rounded-full border-2 border-foreground gap-1.5 font-display font-700 text-xs uppercase">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </div>
                  </div>
                  <div className="border-2 border-foreground rounded-2xl p-5 bg-background">
                    <pre className="font-body text-sm text-foreground whitespace-pre-wrap leading-relaxed">{coverLetter}</pre>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={generate} variant="outline" size="sm" disabled={generating} className="rounded-full border-2 border-foreground font-display font-700 text-xs uppercase gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Regenerate
                    </Button>
                    <Button asChild variant="outline" size="sm" className="rounded-full border-2 border-foreground font-display font-700 text-xs uppercase">
                      <Link to="/cv-builder">Also build my CV →</Link>
                    </Button>
                    {prefillUrl && (
                      <Button
                        onClick={markApplied}
                        disabled={applied}
                        size="sm"
                        className="rounded-full gap-1.5 font-display font-700 text-xs uppercase"
                      >
                        <Send className="w-3.5 h-3.5" /> {applied ? "Marked as applied" : "Mark as applied & save"}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tip */}
              {!coverLetter && (
                <p className="font-body text-xs text-muted-foreground text-center">
                  Tip: make sure your{" "}
                  <Link to="/cv-builder" className="underline hover:text-primary">profile is filled in</Link>
                  {" "}for the best results — we use your work history, skills and education.
                </p>
              )}
            </motion.div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
