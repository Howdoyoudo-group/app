import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, X, Loader2, CheckCircle2, Briefcase,
  MapPin, Zap, ArrowRight, User, LinkIcon, ClipboardPaste, Save, LogIn, Camera, Image,
} from "lucide-react";

const ACCEPTED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface RoleMatch {
  role: string;
  slug: string;
  percentage: number;
  reason: string;
}

interface IndustryFit {
  industry: string;
  confidence: number;
  reason: string;
}

interface NextStep {
  action: string;
  link: string;
  type: "role" | "industry" | "jobs";
}

interface UnderstandMeResult {
  roleMatches: RoleMatch[];
  industryFit: IndustryFit[];
  transferableSkills: string[];
  personalityInsights: string;
  suggestedNextSteps: NextStep[];
}

type InputMode = "cv" | "linkedin" | "paste";

interface SavedInputData {
  pastedText?: string;
  linkedinUrl?: string;
  linkedinScreenshotName?: string | null;
  lastMode?: InputMode;
  cvFileName?: string | null;
  cvFilePath?: string | null;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getSavedInputData = (value: unknown): SavedInputData | null => {
  if (!isObject(value)) return null;

  return {
    pastedText: typeof value.pastedText === "string" ? value.pastedText : "",
    linkedinUrl: typeof value.linkedinUrl === "string" ? value.linkedinUrl : "",
    linkedinScreenshotName: typeof value.linkedinScreenshotName === "string" ? value.linkedinScreenshotName : null,
    lastMode:
      value.lastMode === "cv" || value.lastMode === "linkedin" || value.lastMode === "paste"
        ? value.lastMode
        : undefined,
    cvFileName: typeof value.cvFileName === "string" ? value.cvFileName : null,
    cvFilePath: typeof value.cvFilePath === "string" ? value.cvFilePath : null,
  };
};

interface UnderstandMeProps {
  forceEditMode?: boolean;
}

const UnderstandMe = ({ forceEditMode = false }: UnderstandMeProps) => {
  const { user } = useAuth();
  const [inputMode] = useState<InputMode>("paste");
  const [pastedText, setPastedText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinScreenshot, setLinkedinScreenshot] = useState<File | null>(null);
  const [savedLinkedinScreenshotName, setSavedLinkedinScreenshotName] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [savedCvFileName, setSavedCvFileName] = useState<string | null>(null);
  const [savedCvFilePath, setSavedCvFilePath] = useState<string | null>(null);
  const [savedInputData, setSavedInputData] = useState<SavedInputData | null>(null);
  const [jobPreferences, setJobPreferences] = useState<Record<string, unknown>>({});
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<UnderstandMeResult | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkedinInputRef = useRef<HTMLInputElement>(null);

  const applySavedInputData = useCallback((inputData: SavedInputData | null) => {
    if (!inputData) return;

    setPastedText(inputData.pastedText || "");
    setLinkedinUrl(inputData.linkedinUrl || "");
    setSavedCvFileName(inputData.cvFileName || null);
    setSavedCvFilePath(inputData.cvFilePath || null);
    setSavedLinkedinScreenshotName(inputData.linkedinScreenshotName || null);

    // inputMode no longer used as tabs - all inputs shown simultaneously
  }, []);

  // Load saved results and input data on mount if logged in
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("understand_me_results, job_preferences")
        .eq("id", user.id)
        .maybeSingle();
      const profileJobPreferences = isObject(data?.job_preferences) ? data.job_preferences : {};
      setJobPreferences(profileJobPreferences);

      if (data?.understand_me_results) {
        const saved = data.understand_me_results as any;
        if (saved.roleMatches || saved.personalityInsights) {
          setResult(saved as unknown as UnderstandMeResult);
          setSaved(true);
        }

        const restoredInputData =
          getSavedInputData(saved._inputData) ||
          getSavedInputData(profileJobPreferences.understandMe);

        setSavedInputData(restoredInputData);
        applySavedInputData(restoredInputData);
      } else {
        const restoredInputData = getSavedInputData(profileJobPreferences.understandMe);
        setSavedInputData(restoredInputData);
        applySavedInputData(restoredInputData);
      }
    })();
  }, [applySavedInputData, user]);

  const buildInputData = (overrides?: Partial<SavedInputData>): SavedInputData => ({
    pastedText,
    linkedinUrl,
    linkedinScreenshotName: linkedinScreenshot?.name || savedLinkedinScreenshotName || null,
    lastMode: "paste" as InputMode,
    cvFileName: cvFile?.name || savedCvFileName || null,
    cvFilePath: savedCvFilePath || null,
    ...(overrides || {}),
  });

  const persistProfileState = async (
    nextResult?: UnderstandMeResult,
    inputOverrides?: Partial<SavedInputData>,
  ) => {
    if (!user) return { error: null };

    const draftInputData = buildInputData(inputOverrides);
    const hasInputData = Boolean(
      draftInputData.pastedText?.trim() ||
      draftInputData.linkedinUrl?.trim() ||
      draftInputData.cvFileName
    );
    const inputData = hasInputData ? draftInputData : savedInputData || draftInputData;
    const nextJobPreferences = {
      ...jobPreferences,
      understandMe: inputData,
    };

    const payload: Record<string, unknown> = {
      job_preferences: nextJobPreferences,
      updated_at: new Date().toISOString(),
    };

    if (nextResult || result) {
      payload.understand_me_results = {
        ...(nextResult || result),
        _inputData: inputData,
      };
    }

    const response = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...payload } as never, { onConflict: "id" })
      .select("job_preferences, understand_me_results")
      .single();

    if (!response.error) {
      const persistedJobPreferences = isObject(response.data?.job_preferences)
        ? response.data.job_preferences
        : nextJobPreferences;
      const persistedInputData =
        getSavedInputData((persistedJobPreferences as Record<string, unknown>).understandMe) || inputData;

      setJobPreferences(persistedJobPreferences);
      setSavedInputData(persistedInputData);
      setSavedCvFileName(persistedInputData.cvFileName || null);
      setSavedCvFilePath(persistedInputData.cvFilePath || null);
      setSavedLinkedinScreenshotName(persistedInputData.linkedinScreenshotName || null);
    }

    return response;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!ACCEPTED_CV_TYPES.includes(file.type) && !file.name.endsWith(".txt")) {
      toast.error("Please upload a PDF, Word document, or text file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File must be under 5MB.");
      return;
    }
    setCvFile(file);
    setSavedCvFileName(file.name);
  }, []);

  const handleLinkedinScreenshot = useCallback((file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, or WebP screenshot.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File must be under 5MB.");
      return;
    }
    setLinkedinScreenshot(file);
    setSavedLinkedinScreenshotName(file.name);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleAnalyse = async () => {
    if (analyzing) return;

    const hasPastedText = pastedText.trim().length >= 30;
    const hasLinkedin = linkedinUrl.trim().length > 0;
    const hasLinkedinScreenshot = !!linkedinScreenshot;
    const hasCv = !!cvFile;

    if (!hasPastedText && !hasLinkedin && !hasLinkedinScreenshot && !hasCv) {
      toast.error("Please provide at least one source - your CV, LinkedIn screenshots, or tell us about yourself.");
      return;
    }

    setAnalyzing(true);
    setSaved(false);
    setResult(null);

    try {
      if (user) {
        await persistProfileState();
      }

      // Upload CV if provided
      let filePath: string | null = null;
      if (cvFile) {
        const path = `${Date.now()}-${cvFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: uploadError } = await supabase.storage
          .from("cv-uploads")
          .upload(path, cvFile);
        if (uploadError) {
          toast.error("Failed to upload CV.");
          setAnalyzing(false);
          return;
        }
        filePath = path;
      }

      // Upload LinkedIn screenshot if provided
      let linkedinScreenshotPath: string | null = null;
      if (linkedinScreenshot) {
        const path = `linkedin-${Date.now()}-${linkedinScreenshot.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: uploadError } = await supabase.storage
          .from("cv-uploads")
          .upload(path, linkedinScreenshot);
        if (uploadError) {
          toast.error("Failed to upload LinkedIn screenshot.");
          setAnalyzing(false);
          return;
        }
        linkedinScreenshotPath = path;
      }

      // Send ALL sources together
      const { data, error } = await supabase.functions.invoke("understand-me", {
        body: {
          inputType: "combined",
          text: hasPastedText ? pastedText.trim() : undefined,
          linkedinText: hasLinkedin ? linkedinUrl.trim() : undefined,
          linkedinScreenshotPath: linkedinScreenshotPath || undefined,
          filePath: filePath || undefined,
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Analysis failed. Please try again.");
        return;
      }

      const resultData = data.data as UnderstandMeResult;
      setResult(resultData);
      toast.success("Analysis complete!");

      // Capture stored CV path so it can be persisted on the profile.
      // The edge function echoes back the original filePath now that we
      // no longer delete the upload after extraction.
      const newCvFilePath: string | null =
        typeof data.cvFilePath === "string" && data.cvFilePath ? data.cvFilePath : filePath || null;
      if (newCvFilePath) {
        setSavedCvFilePath(newCvFilePath);
      }

      // Auto-save if logged in (include input data for pre-population)
      if (user) {
        const { error: saveError } = await persistProfileState(
          resultData,
          newCvFilePath
            ? { cvFilePath: newCvFilePath, cvFileName: cvFile?.name || savedCvFileName || null }
            : undefined,
        );
        if (saveError) {
          toast.error("Analysis worked, but we couldn't save your profile inputs.");
          return;
        }
        setSaved(true);
        setRerunning(false);
        toast.success("Profile saved!");
      }
    } catch (err) {
      console.error("Understand me error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // inputModes kept for saved data backward compat

  // If we have saved results and user hasn't chosen to re-run, show results view
  const [rerunning, setRerunning] = useState(forceEditMode);
  const showResults = result && saved && !rerunning;

  if (!user) {
    return (
      <div className="border border-border p-6 text-center space-y-3">
        <LogIn className="w-6 h-6 text-primary mx-auto" />
        <p className="font-display font-700 text-sm text-foreground">Sign in to use Understand Me</p>
        <p className="font-body text-xs text-muted-foreground">Create an account or sign in to analyse your career profile.</p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-display font-700 text-xs tracking-wider uppercase hover:bg-primary/90 transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showResults ? (
        <>
          {/* Saved Results View */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-display font-700 text-sm uppercase tracking-wider text-foreground">
                Your Career Profile
              </p>
              <button
                type="button"
                onClick={() => {
                  applySavedInputData(savedInputData);
                  setRerunning(true);
                }}
                className="flex items-center gap-1.5 border border-primary text-primary px-4 py-2 font-display font-700 text-xs tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Run again
              </button>
            </div>

            {result.personalityInsights && (
              <div>
                <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-2">About You</p>
                <p className="font-body text-sm text-foreground leading-relaxed">{result.personalityInsights}</p>
              </div>
            )}

            {result.roleMatches?.length > 0 && (
              <div>
                <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-3">
                  <Briefcase className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Role Fit
                </p>
                <div className="space-y-3">
                  {result.roleMatches.map((match, i) => (
                    <Link key={i} to={`/roles/${match.slug}`} className="block border border-border p-4 hover:border-primary transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors">{match.role}</span>
                        <span className="font-display font-800 text-lg text-primary">{match.percentage}%</span>
                      </div>
                      <div className="w-full bg-border h-1.5 mb-2">
                        <div className="bg-primary h-1.5 transition-all duration-500" style={{ width: `${match.percentage}%` }} />
                      </div>
                      <p className="font-body text-xs text-muted-foreground">{match.reason}</p>
                      <span className="font-display text-[10px] text-primary uppercase tracking-wider mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore this role <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {result.industryFit?.length > 0 && (
              <div>
                <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-3">
                  <MapPin className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Industry Fit
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.industryFit.map((fit, i) => {
                    const slug = fit.industry.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-");
                    return (
                      <Link key={i} to={`/${slug}`} className="group border border-border px-3 py-2 hover:border-primary transition-colors">
                        <span className="font-display font-600 text-xs text-foreground group-hover:text-primary">{fit.industry}</span>
                        <span className="font-display font-700 text-xs text-primary ml-2">{fit.confidence}%</span>
                        <p className="font-body text-[10px] text-muted-foreground mt-0.5 max-w-[200px]">{fit.reason}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {result.transferableSkills?.length > 0 && (
              <div>
                <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-2">
                  <Zap className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Transferable Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.transferableSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-muted text-foreground font-body text-xs border border-border">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {result.suggestedNextSteps?.length > 0 && (
              <div>
                <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-3">Suggested Next Steps</p>
                <div className="space-y-2">
                  {result.suggestedNextSteps.map((step, i) => (
                    <Link key={i} to={step.link} className="flex items-center justify-between border border-border px-4 py-3 hover:border-primary group transition-colors">
                      <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors">{step.action}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {result.industryFit?.length > 0 && (
              <Link to={`/marketplace?industry=${encodeURIComponent(result.industryFit[0].industry)}`} className="block w-full bg-foreground text-background font-display font-700 text-sm tracking-wider uppercase px-6 py-3.5 text-center hover:bg-foreground/90 transition-colors">
                View matching jobs →
              </Link>
            )}

            <div className="flex items-center gap-2 text-primary font-body text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Profile saved to your account
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="font-body text-xs text-muted-foreground mb-2">
            Add as many sources as you can - the more we know, the better your matches.
          </p>

          {/* CV Upload - always visible */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              {cvFile || savedCvFileName ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <Upload className="w-4 h-4 text-muted-foreground" />
              )}
              <p className="font-display font-600 text-xs uppercase tracking-wider text-foreground">Upload CV</p>
            </div>
            {!cvFile ? (
              <div className="space-y-2">
                {savedCvFileName && (
                  <div className="border border-border bg-muted/30 px-4 py-2">
                    <p className="font-body text-xs text-foreground">
                      Last saved: <span className="font-600">{savedCvFileName}</span>
                    </p>
                    <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                      Please upload again to include in your analysis.
                    </p>
                  </div>
                )}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed cursor-pointer px-6 py-6 text-center transition-colors ${
                    dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="font-body text-sm text-muted-foreground">
                    <span className="text-primary font-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="font-body text-xs text-muted-foreground/60 mt-1">PDF, DOC, DOCX, or TXT - max 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-body text-sm text-foreground truncate max-w-[250px]">{cvFile.name}</span>
                </div>
                <button type="button" onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* LinkedIn - screenshot upload + optional text paste */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              {linkedinScreenshot || savedLinkedinScreenshotName || linkedinUrl.trim() ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
              )}
              <p className="font-display font-600 text-xs uppercase tracking-wider text-foreground">LinkedIn Profile</p>
            </div>
            <div className="border border-border bg-muted/20 px-4 py-3 mb-2 space-y-1.5">
              <p className="font-display font-600 text-[11px] uppercase tracking-wider text-foreground">How to add your LinkedIn:</p>
              <ol className="font-body text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open your <a href="https://www.linkedin.com/in/me" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">LinkedIn profile</a> on your phone or desktop</li>
                <li>Take a screenshot (or multiple) showing your headline, about, experience and education</li>
                <li>Upload the screenshot below - we'll extract the text automatically</li>
              </ol>
              <p className="font-body text-[11px] text-muted-foreground italic">You can also paste text directly if you prefer.</p>
            </div>

            {/* Screenshot upload */}
            {!linkedinScreenshot ? (
              <div className="space-y-2">
                {savedLinkedinScreenshotName && (
                  <div className="border border-border bg-muted/30 px-4 py-2">
                    <p className="font-body text-xs text-foreground">
                      Last saved: <span className="font-600">{savedLinkedinScreenshotName}</span>
                    </p>
                    <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                      Upload again to include in your analysis.
                    </p>
                  </div>
                )}
                <div
                  onClick={() => linkedinInputRef.current?.click()}
                  className="border-2 border-dashed cursor-pointer px-6 py-5 text-center transition-colors border-border hover:border-primary/50"
                >
                  <Camera className="w-5 h-5 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="font-body text-sm text-muted-foreground">
                    <span className="text-primary font-600">Upload screenshot</span> of your LinkedIn profile
                  </p>
                  <p className="font-body text-xs text-muted-foreground/60 mt-1">PNG, JPG, or WebP - max 5MB</p>
                  <input
                    ref={linkedinInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLinkedinScreenshot(file);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-primary" />
                  <span className="font-body text-sm text-foreground truncate max-w-[250px]">{linkedinScreenshot.name}</span>
                </div>
                <button type="button" onClick={() => { setLinkedinScreenshot(null); if (linkedinInputRef.current) linkedinInputRef.current.value = ""; }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Optional text paste fallback */}
            <details className="mt-2">
              <summary className="font-body text-[11px] text-muted-foreground cursor-pointer hover:text-foreground">
                Or paste LinkedIn text manually
              </summary>
              <textarea
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="Paste your LinkedIn headline, about section, experience..."
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors min-h-[80px] resize-y mt-2"
                maxLength={15000}
              />
            </details>
          </div>

          {/* Free text - always visible */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              {pastedText.trim().length > 10 ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <ClipboardPaste className="w-4 h-4 text-muted-foreground" />
              )}
              <p className="font-display font-600 text-xs uppercase tracking-wider text-foreground">Tell Us About You</p>
            </div>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="e.g. I've spent 3 years in retail managing a team. I'm a natural organiser and love working with people..."
              className="w-full border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-y"
              maxLength={5000}
            />
          </div>

          {/* Analyse Button */}
          <button
            type="button"
            onClick={handleAnalyse}
            disabled={analyzing}
            className="w-full bg-primary text-primary-foreground font-display font-700 text-sm tracking-wider uppercase px-6 py-3.5 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analysing...
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                Understand Me
              </>
            )}
          </button>

          {/* Fresh Results */}
          <AnimatePresence>
            {result && !saved && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 border-t border-border pt-6"
              >
                {result.personalityInsights && (
                  <div>
                    <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-2">About You</p>
                    <p className="font-body text-sm text-foreground leading-relaxed">{result.personalityInsights}</p>
                  </div>
                )}

                {result.roleMatches?.length > 0 && (
                  <div>
                    <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-3">
                      <Briefcase className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      Role Fit
                    </p>
                    <div className="space-y-3">
                      {result.roleMatches.map((match, i) => (
                        <Link key={i} to={`/roles/${match.slug}`} className="block border border-border p-4 hover:border-primary transition-colors group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors">{match.role}</span>
                            <span className="font-display font-800 text-lg text-primary">{match.percentage}%</span>
                          </div>
                          <div className="w-full bg-border h-1.5 mb-2">
                            <div className="bg-primary h-1.5 transition-all duration-500" style={{ width: `${match.percentage}%` }} />
                          </div>
                          <p className="font-body text-xs text-muted-foreground">{match.reason}</p>
                          <span className="font-display text-[10px] text-primary uppercase tracking-wider mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Explore this role <ArrowRight className="w-3 h-3" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {result.industryFit?.length > 0 && (
                  <div>
                    <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-3">
                      <MapPin className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      Industry Fit
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.industryFit.map((fit, i) => {
                        const slug = fit.industry.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-");
                        return (
                          <Link key={i} to={`/${slug}`} className="group border border-border px-3 py-2 hover:border-primary transition-colors">
                            <span className="font-display font-600 text-xs text-foreground group-hover:text-primary">{fit.industry}</span>
                            <span className="font-display font-700 text-xs text-primary ml-2">{fit.confidence}%</span>
                            <p className="font-body text-[10px] text-muted-foreground mt-0.5 max-w-[200px]">{fit.reason}</p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {result.transferableSkills?.length > 0 && (
                  <div>
                    <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-2">
                      <Zap className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      Transferable Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.transferableSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-muted text-foreground font-body text-xs border border-border">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestedNextSteps?.length > 0 && (
                  <div>
                    <p className="font-display font-600 text-xs uppercase tracking-wider text-primary mb-3">Suggested Next Steps</p>
                    <div className="space-y-2">
                      {result.suggestedNextSteps.map((step, i) => (
                        <Link key={i} to={step.link} className="flex items-center justify-between border border-border px-4 py-3 hover:border-primary group transition-colors">
                          <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors">{step.action}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {result.industryFit?.length > 0 && (
                  <Link to={`/marketplace?industry=${encodeURIComponent(result.industryFit[0].industry)}`} className="block w-full bg-foreground text-background font-display font-700 text-sm tracking-wider uppercase px-6 py-3.5 text-center hover:bg-foreground/90 transition-colors">
                    View matching jobs →
                  </Link>
                )}

                {!user ? (
                  <div className="border border-primary/30 bg-primary/5 p-4">
                    <p className="font-body text-sm text-foreground mb-2">Want to save your results?</p>
                    <Link to="/auth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-display font-700 text-xs tracking-wider uppercase hover:bg-primary/90 transition-colors">
                      <LogIn className="w-3.5 h-3.5" />
                      Sign up / Sign in to save
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      const { error } = await persistProfileState();
                      if (error) {
                        toast.error("We couldn't save your profile.");
                        return;
                      }
                      setSaved(true);
                      setRerunning(false);
                      toast.success("Profile saved!");
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-primary text-primary px-6 py-3 font-display font-700 text-sm tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save to my profile
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default UnderstandMe;
