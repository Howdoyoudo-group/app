import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Loader2, Upload, Linkedin, Heart, Sparkles,
  User as UserIcon, Briefcase, FileText, CheckCircle2, X, SkipForward, PartyPopper,
  Target, Building2, Camera, Eye, Video as VideoIcon, GraduationCap, Award,
  Wrench, Users, Palette, Monitor, Plus, Trash2, Link as LinkIcon,
} from "lucide-react";
import { roles } from "@/data/roles";
import { INDUSTRIES as CANONICAL_INDUSTRIES } from "@/data/industries";
import { CAREER_MAP_ROLES } from "@/data/career-map-roles";
import { WHO_COMPANIES } from "@/data/who-companies";
import RiasecQuiz, { RiasecScores, WorkValues } from "@/components/RiasecQuiz";
import HowdyCoach from "@/components/HowdyCoach";
import HowdyIntro from "@/components/HowdyIntro";
import { launchHowdyTour } from "@/components/HowdyTour";

const INDUSTRIES = CANONICAL_INDUSTRIES.map((i) => i.name);

const ROLE_OPTIONS = roles.map((r) => r.title);

const PASSION_TAGS = [
  "Tennis", "Football", "Golf", "Running", "Cycling", "Yoga", "Swimming", "Skiing", "Surfing",
  "Climbing", "Hiking", "Sailing", "Horses", "Music", "Live gigs", "DJing", "Vinyl", "Guitar", "Piano",
  "Cooking", "Baking", "Wine", "Chocolate", "Coffee culture", "Restaurants", "Travel", "Photography",
  "Film", "TV series", "Reading", "Writing", "Podcasts", "Gaming", "Tech",
  "Fashion", "Art", "Design", "Architecture", "Dance", "Theatre", "Comedy",
  "Volunteering", "Animals", "Gardening", "Sustainability", "Cars", "Motorbikes", "Motor racing",
];

const SKILL_GROUPS = [
  { key: "practical", label: "Practical", icon: Wrench, tags: ["Customer service", "Admin", "Selling", "Hands-on", "Driving", "Cooking", "DIY", "Organising"] },
  { key: "people", label: "People", icon: Users, tags: ["Leadership", "Teamwork", "Empathy", "Public speaking", "Mentoring", "Conflict-solving", "Listening"] },
  { key: "creative", label: "Creative", icon: Palette, tags: ["Writing", "Design", "Photography", "Video", "Music", "Drawing", "Storytelling", "Styling"] },
  { key: "digital", label: "Digital", icon: Monitor, tags: ["Social media", "Canva", "Figma", "Excel", "Coding", "AI tools", "Editing", "Analytics"] },
];

const PB_PROMPTS = [
  "What are you proud of?",
  "What gives you energy?",
  "What do people come to you for?",
  "What kind of team do you work best in?",
];

const uid = () => Math.random().toString(36).slice(2, 9);

const STEPS = [
  { id: "personal", label: "Personal", icon: UserIcon },
  { id: "photo", label: "Your photo", icon: Camera },
  { id: "cv", label: "Your CV", icon: FileText },
  { id: "passions", label: "What you love", icon: Sparkles },
  { id: "interests", label: "Interests", icon: Building2 },
  { id: "roles", label: "Roles", icon: Briefcase },
  { id: "wanted", label: "Most Wanted", icon: Target },
  { id: "story", label: "Your Story", icon: Heart },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "experiences", label: "Things You've Done", icon: Sparkles },
  { id: "prompts", label: "In Your Words", icon: Heart },
  { id: "video", label: "Video Intro", icon: VideoIcon },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "personality", label: "Personality", icon: Sparkles },
] as const;

type StepId = typeof STEPS[number]["id"];
type PbThing = { id: string; title: string; kind: string; when: string; description: string };
type PbEducation = { id: string; school: string; qualification: string; dates: string; grade: string };
type PbQualification = { id: string; name: string; issuer: string; year: string };

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const restart = params.get("restart") === "1";

  const [stepIdx, setStepIdx] = useState(0);
  const [hydrating, setHydrating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [careerLevel, setCareerLevel] = useState("");
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [industryInterests, setIndustryInterests] = useState<string[]>([]);
  const [rolePreferences, setRolePreferences] = useState<string[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [savedCvName, setSavedCvName] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinScreenshotName, setLinkedinScreenshotName] = useState<string | null>(null);
  const linkedinInputRef = useRef<HTMLInputElement>(null);
  const [passions, setPassions] = useState<string[]>([]);
  const [passionsText, setPassionsText] = useState("");
  const [riasecScores, setRiasecScores] = useState<RiasecScores | null>(null);
  const [workValues, setWorkValues] = useState<WorkValues | null>(null);
  // Most Wanted
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [companyInput, setCompanyInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [allCompanies, setAllCompanies] = useState<string[]>([]);
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);

  const cvInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [employerVisibilityOptIn, setEmployerVisibilityOptIn] = useState(false);

  // Profile Builder state - persisted into job_preferences.profileBuilder
  const [pbIntro, setPbIntro] = useState("");
  const [pbLookingFor, setPbLookingFor] = useState("");
  const [pbPersonalLink, setPbPersonalLink] = useState("");
  const [pbInstagram, setPbInstagram] = useState("");
  const [pbTiktok, setPbTiktok] = useState("");
  const [pbPortfolio, setPbPortfolio] = useState("");
  const [pbSkills, setPbSkills] = useState<Record<string, string[]>>({ practical: [], people: [], creative: [], digital: [] });
  const [pbCustomSkill, setPbCustomSkill] = useState("");
  const [pbThings, setPbThings] = useState<PbThing[]>([{ id: uid(), title: "", kind: "Project", when: "", description: "" }]);
  const [pbPromptAnswers, setPbPromptAnswers] = useState<Record<string, string>>({});
  const [pbVideoUrl, setPbVideoUrl] = useState<string | null>(null);
  const [pbVideoUploading, setPbVideoUploading] = useState(false);
  const [pbEducation, setPbEducation] = useState<PbEducation[]>([{ id: uid(), school: "", qualification: "", dates: "", grade: "" }]);
  const [pbQualifications, setPbQualifications] = useState<PbQualification[]>([]);
  const [pbExtractingEdu, setPbExtractingEdu] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Redirect to auth if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?next=/onboarding");
    }
  }, [user, authLoading, navigate]);

  // Hydrate existing data
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setFullName(data.full_name || (user.user_metadata?.full_name as string) || "");
        setPhone(data.phone || "");
        setCareerLevel(data.career_level || "");
        setSalaryExpectation(data.salary_expectation || "");
        setLocationPreference((data as any).location_preference || "");
        setIndustryInterests(data.industry_interests || []);
        setRolePreferences((data as any).role_preferences || []);
        setRiasecScores((data as any).riasec_scores || null);
        setWorkValues((data as any).work_values || null);
        setPhotoUrl((data as any).photo_url || null);
        setEmployerVisibilityOptIn(!!(data as any).employer_visibility_opt_in);
        const jp = (data.job_preferences as any) || {};
        if (jp.passions && Array.isArray(jp.passions)) setPassions(jp.passions);
        if (jp.passionsText) setPassionsText(jp.passionsText);
        if (jp.linkedinUrl) setLinkedinUrl(jp.linkedinUrl);
        const um = (data.understand_me_results as any)?._inputData || jp.understandMe;
        if (um?.cvFileName) setSavedCvName(um.cvFileName);
        if (um?.linkedinUrl && !jp.linkedinUrl) setLinkedinUrl(um.linkedinUrl);
        if (jp.linkedinScreenshotName) setLinkedinScreenshotName(jp.linkedinScreenshotName);
        else if (um?.linkedinScreenshotName) setLinkedinScreenshotName(um.linkedinScreenshotName);
        if (Array.isArray(jp.targetCompanies)) setTargetCompanies(jp.targetCompanies);
        if (Array.isArray(jp.targetRoles)) setTargetRoles(jp.targetRoles);
        const pb = jp.profileBuilder || {};
        if (typeof pb.intro === "string") setPbIntro(pb.intro);
        if (typeof pb.lookingFor === "string") setPbLookingFor(pb.lookingFor);
        if (typeof pb.personalLink === "string") setPbPersonalLink(pb.personalLink);
        if (typeof pb.instagram === "string") setPbInstagram(pb.instagram);
        if (typeof pb.tiktok === "string") setPbTiktok(pb.tiktok);
        if (typeof pb.portfolio === "string") setPbPortfolio(pb.portfolio);
        if (pb.skills && typeof pb.skills === "object") setPbSkills({ practical: [], people: [], creative: [], digital: [], ...pb.skills });
        if (Array.isArray(pb.things) && pb.things.length) setPbThings(pb.things);
        if (pb.promptAnswers && typeof pb.promptAnswers === "object") setPbPromptAnswers(pb.promptAnswers);
        if (typeof pb.videoUrl === "string") setPbVideoUrl(pb.videoUrl);
        if (Array.isArray(pb.education) && pb.education.length) setPbEducation(pb.education);
        if (Array.isArray(pb.qualifications)) setPbQualifications(pb.qualifications);
      } else {
        setFullName((user.user_metadata?.full_name as string) || "");
      }
      setHydrating(false);
    })();
  }, [user]);

  // Load distinct companies from jobs (paginated) merged with curated "Who" companies
  useEffect(() => {
    (async () => {
      const merged = new Set<string>(WHO_COMPANIES);
      const PAGE = 1000;
      let from = 0;
      for (let i = 0; i < 10; i++) {
        const { data, error } = await supabase
          .from("jobs")
          .select("company")
          .range(from, from + PAGE - 1);
        if (error || !data || data.length === 0) break;
        data.forEach((d: any) => {
          const c = (d.company || "").trim();
          if (c) merged.add(c);
        });
        if (data.length < PAGE) break;
        from += PAGE;
      }
      setAllCompanies(Array.from(merged).sort((a, b) => a.localeCompare(b)));
    })();
  }, []);

  useEffect(() => {
    if (!companyInput.trim()) { setCompanySuggestions([]); return; }
    const q = companyInput.trim().toLowerCase();
    setCompanySuggestions(
      allCompanies.filter((c) => c.toLowerCase().includes(q) && !targetCompanies.includes(c)).slice(0, 6)
    );
  }, [companyInput, allCompanies, targetCompanies]);

  useEffect(() => {
    if (!roleInput.trim()) { setRoleSuggestions([]); return; }
    const q = roleInput.trim().toLowerCase();
    setRoleSuggestions(
      CAREER_MAP_ROLES.filter((r) => r.toLowerCase().includes(q) && !targetRoles.includes(r)).slice(0, 8)
    );
  }, [roleInput, targetRoles]);

  const addCompany = (name: string) => {
    const t = name.trim();
    if (!t || targetCompanies.includes(t)) return;
    setTargetCompanies([...targetCompanies, t]);
    setCompanyInput("");
  };
  const removeCompany = (name: string) => setTargetCompanies(targetCompanies.filter((c) => c !== name));
  const addRoleTarget = (name: string) => {
    const t = name.trim();
    if (!t || targetRoles.includes(t)) return;
    setTargetRoles([...targetRoles, t]);
    setRoleInput("");
  };
  const removeRoleTarget = (name: string) => setTargetRoles(targetRoles.filter((r) => r !== name));

  const currentStep = STEPS[stepIdx];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const persistStep = useCallback(async (nextStep?: number) => {
    if (!user) return;
    const updates: Record<string, unknown> = {
      full_name: fullName || null,
      phone: phone || null,
      career_level: careerLevel || null,
      salary_expectation: salaryExpectation || null,
      location_preference: locationPreference || null,
      industry_interests: industryInterests,
      // Onboarding subscribes new users to all selected industries by default.
      // They can fine-tune which ones email them later in My Profile.
      newsletter_industries: industryInterests,
      role_preferences: rolePreferences,
      photo_url: photoUrl,
      employer_visibility_opt_in: employerVisibilityOptIn,
      updated_at: new Date().toISOString(),
    };

    // Merge job_preferences
    const { data: existing } = await supabase
      .from("profiles")
      .select("job_preferences")
      .eq("id", user.id)
      .maybeSingle();
    const existingJp = (existing?.job_preferences as any) || {};
    updates.job_preferences = {
      ...existingJp,
      passions,
      passionsText,
      linkedinUrl: linkedinUrl || existingJp.linkedinUrl || null,
      linkedinScreenshotName: linkedinScreenshotName || existingJp.linkedinScreenshotName || null,
      targetCompanies,
      targetRoles,
      profileBuilder: {
        ...(existingJp.profileBuilder || {}),
        intro: pbIntro,
        lookingFor: pbLookingFor,
        personalLink: pbPersonalLink,
        instagram: pbInstagram,
        tiktok: pbTiktok,
        portfolio: pbPortfolio,
        skills: pbSkills,
        things: pbThings,
        promptAnswers: pbPromptAnswers,
        videoUrl: pbVideoUrl,
        education: pbEducation,
        qualifications: pbQualifications,
      },
    };

    await supabase.from("profiles").update(updates as never).eq("id", user.id);

    // Sync subscribers - upsert so missing rows get created
    if (user.email) {
      await supabase
        .from("subscribers")
        .upsert(
          {
            email: user.email.toLowerCase(),
            name: fullName || user.email.split("@")[0],
            industry_interests: industryInterests,
            newsletter_industries: industryInterests,
          } as never,
          { onConflict: "email" } as never,
        );
    }

    if (typeof nextStep === "number") setStepIdx(nextStep);
  }, [user, fullName, phone, careerLevel, salaryExpectation, locationPreference,
      industryInterests, rolePreferences, passions, passionsText, linkedinUrl, linkedinScreenshotName,
      targetCompanies, targetRoles, photoUrl, employerVisibilityOptIn,
      pbIntro, pbLookingFor, pbPersonalLink, pbInstagram, pbTiktok, pbPortfolio, pbSkills, pbThings, pbPromptAnswers, pbVideoUrl, pbEducation, pbQualifications]);

  const handleCvUpload = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/onboarding-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("cv-uploads").upload(path, file);
    if (error) {
      toast.error("CV upload failed");
      return;
    }
    setCvFile(file);
    setSavedCvName(file.name);
    // Persist filename hint
    const { data: existing } = await supabase
      .from("profiles")
      .select("job_preferences")
      .eq("id", user.id)
      .maybeSingle();
    const jp = (existing?.job_preferences as any) || {};
    await supabase
      .from("profiles")
      .update({
        job_preferences: {
          ...jp,
          understandMe: { ...(jp.understandMe || {}), cvFileName: file.name, cvPath: path },
        },
      } as never)
      .eq("id", user.id);
    toast.success("CV uploaded");
  };

  const handleLinkedinScreenshotUpload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image (PNG or JPG)");
      return;
    }
    const path = `${user.id}/linkedin-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("cv-uploads").upload(path, file);
    if (error) {
      toast.error("Screenshot upload failed");
      return;
    }
    setLinkedinScreenshotName(file.name);
    const { data: existing } = await supabase
      .from("profiles")
      .select("job_preferences")
      .eq("id", user.id)
      .maybeSingle();
    const jp = (existing?.job_preferences as any) || {};
    await supabase
      .from("profiles")
      .update({
        job_preferences: {
          ...jp,
          linkedinScreenshotName: file.name,
          linkedinScreenshotPath: path,
        },
      } as never)
      .eq("id", user.id);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image (PNG or JPG)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setPhotoUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Photo upload failed");
      setPhotoUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl;
    setPhotoUrl(url);
    await supabase
      .from("profiles")
      .update({ photo_url: url, updated_at: new Date().toISOString() } as never)
      .eq("id", user.id);
    setPhotoUploading(false);
    toast.success("Photo saved");
  };

  const togglePbSkill = (group: string, tag: string) => {
    setPbSkills((prev) => {
      const list = prev[group] || [];
      return { ...prev, [group]: list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag] };
    });
  };
  const addPbCustomSkill = () => {
    const v = pbCustomSkill.trim();
    if (!v) return;
    setPbSkills((prev) => ({ ...prev, practical: [...(prev.practical || []), v] }));
    setPbCustomSkill("");
  };

  const handleVideoUpload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("video/")) { toast.error("Please upload a video file"); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error("Video must be under 50MB"); return; }
    setPbVideoUploading(true);
    const ext = file.name.split(".").pop() || "mp4";
    const path = `${user.id}/intro-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { toast.error("Video upload failed"); setPbVideoUploading(false); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    setPbVideoUrl(pub.publicUrl);
    setPbVideoUploading(false);
    toast.success("Video saved");
  };

  const extractEducationFromCv = async () => {
    if (!user) return;
    // Try the latest CV path stored on the profile
    const { data: pr } = await supabase.from("profiles").select("job_preferences").eq("id", user.id).maybeSingle();
    const jp = (pr?.job_preferences as any) || {};
    const cvPath = jp.understandMe?.cvPath;
    if (!cvPath) { toast.error("Upload your CV first on the previous step."); return; }
    setPbExtractingEdu(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
      const fnRes = await fetch(
        "https://wgistckxxbfpsuulbswr.supabase.co/functions/v1/extract-cv-education",
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ filePath: cvPath }) }
      );
      const data = await fnRes.json().catch(() => ({}));
      if (!fnRes.ok || !data?.success) { toast.error(data?.error || "Could not extract from your CV."); return; }
      const newEd: PbEducation[] = (data.education || []).map((e: any) => ({
        id: uid(), school: e.school || "", qualification: e.qualification || "", dates: e.dates || "", grade: e.grade || "",
      }));
      const newQ: PbQualification[] = (data.qualifications || []).map((q: any) => ({
        id: uid(), name: q.name || "", issuer: q.issuer || "", year: q.year || "",
      }));
      if (newEd.length) setPbEducation((prev) => {
        const existing = prev.filter((e) => e.school || e.qualification);
        return [...existing, ...newEd];
      });
      if (newQ.length) setPbQualifications((prev) => [...prev, ...newQ]);
      toast.success(`Pulled ${newEd.length} education entries and ${newQ.length} qualifications.`);
    } finally {
      setPbExtractingEdu(false);
    }
  };

  const [pbExtractingExp, setPbExtractingExp] = useState(false);
  const extractExperienceFromCv = async () => {
    if (!user) return;
    const { data: pr } = await supabase.from("profiles").select("job_preferences").eq("id", user.id).maybeSingle();
    const jp = (pr?.job_preferences as any) || {};
    const cvPath = jp.understandMe?.cvPath;
    if (!cvPath) { toast.error("Upload your CV on the earlier step first."); return; }
    setPbExtractingExp(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
      const fnRes = await fetch(
        "https://wgistckxxbfpsuulbswr.supabase.co/functions/v1/extract-cv-education",
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ filePath: cvPath }) }
      );
      const data = await fnRes.json().catch(() => ({}));
      if (!fnRes.ok || !data?.success) { toast.error(data?.error || "Could not extract from your CV."); return; }
      const newExp: PbThing[] = (data.experience || []).map((e: any) => ({
        id: uid(),
        title: [e.title, e.company].filter(Boolean).join(" - ") || e.title || e.company || "",
        kind: "Part-time job",
        when: e.dates || "",
        description: e.description || "",
      }));
      if (!newExp.length) { toast.message("No work experience found in your CV."); return; }
      setPbThings((prev) => {
        const existing = prev.filter((t) => t.title || t.description);
        return [...existing, ...newExp];
      });
      toast.success(`Pulled ${newExp.length} experience entries from your CV.`);
    } finally {
      setPbExtractingExp(false);
    }
  };

  const handleNext = async () => {
    await persistStep(stepIdx + 1);
  };

  const handleSkip = async () => {
    await persistStep(stepIdx + 1);
  };

  const handleBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const handleRiasecComplete = async (scores: RiasecScores, values: WorkValues) => {
    setRiasecScores(scores);
    setWorkValues(values);
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ riasec_scores: scores, work_values: values, updated_at: new Date().toISOString() } as never)
      .eq("id", user.id);
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await persistStep();
    } catch (e) {
      console.warn("persistStep error on finish", e);
    }
    // Send personalized welcome summary email
    try {
      await supabase.functions.invoke("send-onboarding-summary", {
        body: { userId: user?.id },
      });
    } catch (e) {
      console.warn("Welcome summary email failed", e);
    }
    setSubmitting(false);
    setCompleted(true);
  };

  const togglePassion = (tag: string) => {
    setPassions((prev) => prev.includes(tag) ? prev.filter((p) => p !== tag) : [...prev, tag]);
  };
  const toggleIndustry = (ind: string) => {
    setIndustryInterests((prev) => prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]);
  };
  const toggleRole = (role: string) => {
    setRolePreferences((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  if (authLoading || hydrating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  // Completion screen
  if (completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full text-center"
        >
          <div className="inline-flex w-16 h-16 bg-primary items-center justify-center mb-6 shadow-[4px_4px_0_hsl(var(--foreground))]">
            <PartyPopper className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display font-900 text-3xl md:text-4xl mb-4">
            You're all set{fullName ? `, ${fullName.split(" ")[0]}` : ""}<span className="text-primary">.</span>
          </h1>
          <HowdyIntro className="mb-6 text-left">
            You're set - I'll start watching for matches as soon as you land in Howdy Jobs, and flag anything worth a second look.
          </HowdyIntro>
          <p className="font-body text-muted-foreground mb-8">
            We're excited to have you. We've sent a personal welcome to your inbox with role
            matches, daily digest details, and a quick guide to getting the most from the site.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/my-profile")}
              className="bg-primary text-primary-foreground px-6 py-3 font-display font-700 text-sm uppercase tracking-wider shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              View my profile
            </button>
            <button
              onClick={() => navigate("/my-jobs")}
              className="border-2 border-foreground text-foreground px-6 py-3 font-display font-700 text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              See my jobs
            </button>
            <button
              onClick={() => { launchHowdyTour(); navigate("/"); }}
              className="border-2 border-foreground text-foreground px-6 py-3 font-display font-700 text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              Take the 90-sec tour
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/my-profile")}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Exit onboarding"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">
                Step {stepIdx + 1} of {STEPS.length} - {currentStep.label}
              </span>
              <span className="font-display text-[10px] font-700 uppercase tracking-wider text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Card content */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-6 py-8">
        <div className="w-full max-w-2xl">
          <HowdyCoach stepId={currentStep.id} />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 1: Personal Details */}
              {currentStep.id === "personal" && (
                <StepShell
                  icon={UserIcon}
                  eyebrow="01 - Personal details"
                  title="Let's start with the basics"
                  subtitle="Just the essentials so we know who you are. All optional."
                >
                  <div className="space-y-4">
                    <Field label="Full name">
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="w-full border-2 border-border bg-background px-4 py-3 font-body text-base text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </Field>
                    <Field label="Phone (optional)">
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07…"
                        className="w-full border-2 border-border bg-background px-4 py-3 font-body text-base text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Career level">
                        <select
                          value={careerLevel}
                          onChange={(e) => setCareerLevel(e.target.value)}
                          className="w-full border-2 border-border bg-background px-4 py-3 font-body text-base text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="">Choose…</option>
                          <option value="entry">Entry (Assistant, Analyst)</option>
                          <option value="mid">Mid (Manager)</option>
                          <option value="senior">Senior (Head of)</option>
                          <option value="director">Director / VP</option>
                          <option value="executive">Executive (CEO, MD, C-suite)</option>
                        </select>
                      </Field>
                      <Field label="Salary expectation">
                        <select
                          value={salaryExpectation}
                          onChange={(e) => setSalaryExpectation(e.target.value)}
                          className="w-full border-2 border-border bg-background px-4 py-3 font-body text-base text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="">Choose…</option>
                          <option value="Under £25k">Under £25k</option>
                          <option value="£25k–£35k">£25k–£35k</option>
                          <option value="£35k–£50k">£35k–£50k</option>
                          <option value="£50k–£70k">£50k–£70k</option>
                          <option value="£70k–£90k">£70k–£90k</option>
                          <option value="£90k–£120k">£90k–£120k</option>
                          <option value="£120k+">£120k+</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Location preference">
                      <input
                        value={locationPreference}
                        onChange={(e) => setLocationPreference(e.target.value)}
                        placeholder="London, Manchester, Remote…"
                        className="w-full border-2 border-border bg-background px-4 py-3 font-body text-base text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </Field>
                  </div>
                </StepShell>
              )}

              {/* Step: Photo */}
              {currentStep.id === "photo" && (
                <StepShell
                  icon={Camera}
                  eyebrow="02 - Your photo"
                  title="Add a photo of yourself"
                  subtitle="A friendly face helps you stand out. Optional - you can always add or change it later."
                >
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 border-2 border-foreground bg-muted overflow-hidden flex items-center justify-center shadow-[3px_3px_0_hsl(var(--primary))]">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Your profile" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      {photoUploading && (
                        <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={photoUploading}
                        className="w-full sm:w-auto inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 font-display font-700 text-xs uppercase tracking-wider shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        {photoUrl ? "Replace photo" : "Upload photo"}
                      </button>
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            setPhotoUrl(null);
                            if (user) {
                              await supabase
                                .from("profiles")
                                .update({ photo_url: null, updated_at: new Date().toISOString() } as never)
                                .eq("id", user.id);
                            }
                          }}
                          className="ml-3 font-display text-xs font-700 uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Remove
                        </button>
                      )}
                      <p className="font-body text-xs text-muted-foreground mt-3">
                        PNG, JPG or WEBP. Max 5MB. A square head-and-shoulders shot works best.
                      </p>
                    </div>
                  </div>

                  {/* Employer visibility opt-in */}
                  <div className="mt-8 border-2 border-border p-4 bg-muted/30">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={employerVisibilityOptIn}
                        onChange={(e) => setEmployerVisibilityOptIn(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span className="font-display text-xs font-700 uppercase tracking-wider text-foreground">
                            Let matched employers see my profile
                          </span>
                        </div>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed">
                          When you tick this, employers in industries or companies you've shown interest in
                          can view your profile basics (name, photo, industries, role interests). Off by default -
                          you can change it any time in your profile.{" "}
                          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Read more
                          </a>.
                        </p>
                      </div>
                    </label>
                  </div>
                </StepShell>
              )}

              {/* Step 3: Interests / Newsletter */}
              {currentStep.id === "interests" && (
                <StepShell
                  icon={Building2}
                  eyebrow="02 - Click what you love"
                  title="Which industries excite you?"
                  subtitle="Tap any that interest you. You'll get one short newsletter per industry, every weekday morning - so 5 industries means 5 emails a day. Start with a few; you can change this any time."
                >
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((ind) => {
                      const selected = industryInterests.includes(ind);
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() =>
                            setIndustryInterests((prev) =>
                              selected ? prev.filter((i) => i !== ind) : [...prev, ind],
                            )
                          }
                          className={`px-3 py-1.5 border text-xs font-display font-600 tracking-wide uppercase transition-colors ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                          }`}
                        >
                          {ind}
                        </button>
                      );
                    })}
                  </div>
                  {industryInterests.length > 0 && (
                    <p className="font-body text-xs text-primary mt-4">
                      You'll receive {industryInterests.length} {industryInterests.length === 1 ? "newsletter" : "newsletters"} each weekday morning.
                    </p>
                  )}
                </StepShell>
              )}

              {/* Step 3: Roles */}
              {currentStep.id === "roles" && (
                <StepShell
                  icon={Briefcase}
                  eyebrow="03 - Role preferences"
                  title="Any roles you already fancy?"
                  subtitle="Pick the role types you'd consider. This sharpens your job matches."
                >
                  <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map((role) => {
                      const selected = rolePreferences.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className={`px-4 py-2 font-display text-sm font-600 border-2 transition-all ${
                            selected
                              ? "bg-foreground text-background border-foreground shadow-[2px_2px_0_hsl(var(--primary))]"
                              : "border-border text-foreground hover:border-foreground"
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </StepShell>
              )}

              {/* Step: Most Wanted */}
              {currentStep.id === "wanted" && (
                <StepShell
                  icon={Target}
                  eyebrow="04 - Most Wanted"
                  title="Your hit list"
                  subtitle="Drop in the companies you'd love to work for and the exact job titles you're chasing. Add as many as you like - we'll push matches to the top of your inbox."
                >
                  <div className="space-y-6">
                    <div>
                      <label className="font-display text-xs font-700 uppercase tracking-wider text-foreground mb-2 block">
                        <Building2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        Dream companies
                      </label>
                      <div className="relative">
                        <input
                          value={companyInput}
                          onChange={(e) => setCompanyInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCompany(companyInput); } }}
                          placeholder="Type a company name (e.g. Netflix, Greggs)"
                          className="w-full border-2 border-border bg-background px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                        />
                        {companySuggestions.length > 0 && (
                          <div className="absolute z-10 left-0 right-0 top-full mt-1 border border-border bg-background shadow-lg max-h-56 overflow-auto">
                            {companySuggestions.map((s) => (
                              <button key={s} type="button" onClick={() => addCompany(s)}
                                className="w-full text-left px-4 py-2 font-body text-sm hover:bg-primary/10 hover:text-primary transition-colors">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {targetCompanies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {targetCompanies.map((c) => (
                            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-display font-600 text-xs">
                              {c}
                              <button type="button" onClick={() => removeCompany(c)} aria-label={`Remove ${c}`} className="hover:opacity-70">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-display text-xs font-700 uppercase tracking-wider text-foreground mb-2 block">
                        <Briefcase className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                        Specific job titles
                      </label>
                      <div className="relative">
                        <input
                          value={roleInput}
                          onChange={(e) => setRoleInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRoleTarget(roleInput); } }}
                          placeholder="Search career-map roles or type your own (e.g. Junior Buyer, Conveyancer)"
                          className="w-full border-2 border-border bg-background px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                        />
                        {roleSuggestions.length > 0 && (
                          <div className="absolute z-10 left-0 right-0 top-full mt-1 border border-border bg-background shadow-lg max-h-56 overflow-auto">
                            {roleSuggestions.map((s) => (
                              <button key={s} type="button" onClick={() => addRoleTarget(s)}
                                className="w-full text-left px-4 py-2 font-body text-sm hover:bg-primary/10 hover:text-primary transition-colors">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {targetRoles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {targetRoles.map((r) => (
                            <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background font-display font-600 text-xs">
                              {r}
                              <button type="button" onClick={() => removeRoleTarget(r)} aria-label={`Remove ${r}`} className="hover:opacity-70">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </StepShell>
              )}

              {/* Step 5: CV */}
              {currentStep.id === "cv" && (
                <StepShell
                  icon={FileText}
                  eyebrow="04 - Your CV"
                  title="Got a CV? Drop it in"
                  subtitle="PDF, Word, or text. We use it to find roles that actually fit you. You can always add it later."
                >
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCvUpload(file);
                    }}
                    className="hidden"
                  />
                  {savedCvName ? (
                    <div className="border-2 border-primary bg-primary/5 p-6 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-700 text-sm text-foreground truncate">{savedCvName}</p>
                        <p className="font-body text-xs text-muted-foreground">CV saved.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => cvInputRef.current?.click()}
                        className="font-display text-xs font-700 uppercase tracking-wider text-primary hover:underline"
                      >
                        Replace
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => cvInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border hover:border-primary p-12 flex flex-col items-center gap-3 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="font-display font-700 text-sm text-foreground">Click to upload your CV</p>
                      <p className="font-body text-xs text-muted-foreground">PDF, DOC, DOCX or TXT</p>
                    </button>
                  )}
                </StepShell>
              )}

              {/* Step 5: LinkedIn (screenshot upload) */}
              {currentStep.id === "linkedin" && (
                <StepShell
                  icon={Linkedin}
                  eyebrow="05 - LinkedIn"
                  title="Upload a screenshot of your LinkedIn"
                  subtitle="Optional but helpful - a quick screenshot of your profile pairs with your CV for sharper matching. PNG or JPG."
                >
                  <input
                    ref={linkedinInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLinkedinScreenshotUpload(file);
                    }}
                    className="hidden"
                  />
                  {linkedinScreenshotName ? (
                    <div className="border-2 border-primary bg-primary/5 p-6 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-700 text-sm text-foreground truncate">{linkedinScreenshotName}</p>
                        <p className="font-body text-xs text-muted-foreground">Screenshot saved.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => linkedinInputRef.current?.click()}
                        className="font-display text-xs font-700 uppercase tracking-wider text-primary hover:underline"
                      >
                        Replace
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => linkedinInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border hover:border-primary p-12 flex flex-col items-center gap-3 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="font-display font-700 text-sm text-foreground">Click to upload a screenshot</p>
                      <p className="font-body text-xs text-muted-foreground">PNG or JPG of your LinkedIn profile</p>
                    </button>
                  )}
                </StepShell>
              )}

              {/* Step 2: What you love */}
              {currentStep.id === "passions" && (
                <StepShell
                  icon={Sparkles}
                  eyebrow="02 - What you love"
                  title="What do you love?"
                  subtitle="Tennis, vinyl, baking, climbing - the stuff that fills your weekends. This helps us connect you with industries you'll actually love."
                >
                  <div className="flex flex-wrap gap-2 mb-5">
                    {PASSION_TAGS.map((tag) => {
                      const selected = passions.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => togglePassion(tag)}
                          className={`px-3.5 py-1.5 rounded-full font-display text-sm font-600 border-2 transition-all ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-foreground hover:border-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <Field label="Anything else? (free text)">
                    <textarea
                      value={passionsText}
                      onChange={(e) => setPassionsText(e.target.value)}
                      rows={3}
                      placeholder="e.g. I'm obsessed with specialty coffee and ultra-running…"
                      className="w-full border-2 border-border bg-background px-4 py-3 font-body text-base text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </Field>
                </StepShell>
              )}

              {/* Step: Story */}
              {currentStep.id === "story" && (
                <StepShell icon={Heart} eyebrow="07 - Your story" title="In a few lines, who are you?" subtitle="The intro that goes at the top of your profile.">
                  <div className="space-y-4">
                    <Field label="Short intro">
                      <textarea value={pbIntro} onChange={(e) => setPbIntro(e.target.value)} rows={4} placeholder="e.g. 18 from Manchester, studying business, obsessed with music marketing…" className="w-full border-2 border-border bg-background px-4 py-3 font-body text-base focus:outline-none focus:border-primary resize-none" />
                    </Field>
                    <Field label="What kind of work are you looking for?">
                      <textarea value={pbLookingFor} onChange={(e) => setPbLookingFor(e.target.value)} rows={2} placeholder="e.g. internship, weekend job, apprenticeship…" className="w-full border-2 border-border bg-background px-4 py-3 font-body text-base focus:outline-none focus:border-primary resize-none" />
                    </Field>
                    <Field label="Instagram">
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={pbInstagram} onChange={(e) => setPbInstagram(e.target.value)} placeholder="@username or https://instagram.com/…" className="w-full border-2 border-border bg-background pl-9 pr-4 py-3 font-body text-base focus:outline-none focus:border-primary" />
                      </div>
                    </Field>
                    <Field label="TikTok">
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={pbTiktok} onChange={(e) => setPbTiktok(e.target.value)} placeholder="@username or https://tiktok.com/@…" className="w-full border-2 border-border bg-background pl-9 pr-4 py-3 font-body text-base focus:outline-none focus:border-primary" />
                      </div>
                    </Field>
                    <Field label="Portfolio / website">
                      <div className="relative">
                        <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={pbPortfolio} onChange={(e) => setPbPortfolio(e.target.value)} placeholder="https://…" className="w-full border-2 border-border bg-background pl-9 pr-4 py-3 font-body text-base focus:outline-none focus:border-primary" />
                      </div>
                    </Field>
                  </div>
                </StepShell>
              )}

              {/* Step: Skills */}
              {currentStep.id === "skills" && (
                <StepShell icon={Sparkles} eyebrow="08 - Skills" title="Tap the skills that sound like you" subtitle="Pick as many as you like. Add your own at the bottom.">
                  <div className="space-y-5">
                    {SKILL_GROUPS.map((g) => (
                      <div key={g.key} className="space-y-2">
                        <div className="flex items-center gap-2 font-display text-xs font-700 uppercase tracking-wider text-muted-foreground">
                          <g.icon className="w-3.5 h-3.5" /> {g.label}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[...g.tags, ...(pbSkills[g.key] || []).filter((t) => !g.tags.includes(t))].map((tag) => {
                            const active = (pbSkills[g.key] || []).includes(tag);
                            return (
                              <button key={tag} type="button" onClick={() => togglePbSkill(g.key, tag)} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-display text-xs font-600 border-2 transition-all ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-foreground"}`}>
                                {tag}
                                {active && <Trash2 className="w-3 h-3 opacity-80" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <input value={pbCustomSkill} onChange={(e) => setPbCustomSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPbCustomSkill(); } }} placeholder="Add your own skill" className="flex-1 border-2 border-border bg-background px-4 py-2.5 font-body text-sm focus:outline-none focus:border-primary" />
                      <button type="button" onClick={addPbCustomSkill} className="px-4 bg-foreground text-background font-display font-700 text-xs uppercase tracking-wider">Add</button>
                    </div>
                  </div>
                </StepShell>
              )}

              {/* Step: Things you've done */}
              {currentStep.id === "experiences" && (
                <StepShell icon={Sparkles} eyebrow="09 - Things you've done" title="What have you done so far?" subtitle="Projects, side hustles, volunteering, school work, clubs, sport, content, events or part-time jobs. Anything counts.">
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={extractExperienceFromCv}
                      disabled={pbExtractingExp}
                      className="w-full inline-flex items-center justify-center gap-2 border-2 border-primary bg-primary/5 text-primary px-4 py-3 font-display font-700 text-xs uppercase tracking-wider hover:bg-primary/10 transition-colors disabled:opacity-50"
                    >
                      {pbExtractingExp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {pbExtractingExp ? "Reading your CV…" : "Pull experience from my CV"}
                    </button>
                    {pbThings.map((t, i) => (
                      <div key={t.id} className="border-2 border-border p-4 space-y-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">#{i + 1}</span>
                          {pbThings.length > 1 && (
                            <button type="button" onClick={() => setPbThings(pbThings.filter((x) => x.id !== t.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                        <input value={t.title} onChange={(e) => setPbThings(pbThings.map((x) => x.id === t.id ? { ...x, title: e.target.value } : x))} placeholder="Title (e.g. Started a podcast)" className="w-full border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <select value={t.kind} onChange={(e) => setPbThings(pbThings.map((x) => x.id === t.id ? { ...x, kind: e.target.value } : x))} className="border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary">
                            {["Project", "Side hustle", "Volunteering", "School", "Club", "Sport", "Content", "Event", "Part-time job"].map((k) => (<option key={k}>{k}</option>))}
                          </select>
                          <input value={t.when} onChange={(e) => setPbThings(pbThings.map((x) => x.id === t.id ? { ...x, when: e.target.value } : x))} placeholder="When (e.g. 2024 – Present)" className="border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <textarea value={t.description} onChange={(e) => setPbThings(pbThings.map((x) => x.id === t.id ? { ...x, description: e.target.value } : x))} rows={2} placeholder="What did you do? What did you learn?" className="w-full border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary resize-none" />
                      </div>
                    ))}
                    <button type="button" onClick={() => setPbThings([...pbThings, { id: uid(), title: "", kind: "Project", when: "", description: "" }])} className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add another
                    </button>
                  </div>
                </StepShell>
              )}

              {/* Step: Prompts */}
              {currentStep.id === "prompts" && (
                <StepShell icon={Heart} eyebrow="10 - In your words" title="Four quick prompts" subtitle="A handful of sentences each. These bring your profile to life.">
                  <div className="space-y-4">
                    {PB_PROMPTS.map((q) => (
                      <div key={q} className="border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
                        <p className="font-display text-sm font-700 text-foreground">{q}</p>
                        <textarea value={pbPromptAnswers[q] || ""} onChange={(e) => setPbPromptAnswers({ ...pbPromptAnswers, [q]: e.target.value })} rows={2} placeholder="Type your answer…" className="w-full border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary resize-none" />
                      </div>
                    ))}
                  </div>
                </StepShell>
              )}

              {/* Step: Video Intro */}
              {currentStep.id === "video" && (
                <StepShell icon={VideoIcon} eyebrow="11 - Video intro" title="Record a 30-60 second intro" subtitle="Tell employers what you're into, what you're good at, and what you're looking for. Optional but powerful.">
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); }} />
                  <div className="border-2 border-dashed border-border bg-muted/30 p-6 text-center">
                    {pbVideoUrl ? (
                      <video src={pbVideoUrl} controls className="w-full max-h-72 mx-auto" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-6">
                        <VideoIcon className="w-8 h-8 text-primary" />
                        <span className="font-display text-sm font-700">No video yet</span>
                        <span className="font-body text-xs text-muted-foreground">MP4 or MOV, up to 50MB</span>
                      </div>
                    )}
                    <button type="button" onClick={() => videoInputRef.current?.click()} disabled={pbVideoUploading} className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-display font-700 text-xs uppercase tracking-wider shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50">
                      {pbVideoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {pbVideoUrl ? "Replace video" : "Upload video"}
                    </button>
                  </div>
                </StepShell>
              )}

              {/* Step: Education */}
              {currentStep.id === "education" && (
                <StepShell icon={GraduationCap} eyebrow="13 - Education" title="School, college, university" subtitle="Where you've studied and any qualifications. Tap 'Pull from CV' to auto-fill from the CV you uploaded earlier.">
                  <div className="space-y-5">
                    <button type="button" onClick={extractEducationFromCv} disabled={pbExtractingEdu} className="w-full inline-flex items-center justify-center gap-2 border-2 border-primary bg-primary/5 text-primary px-4 py-3 font-display font-700 text-xs uppercase tracking-wider hover:bg-primary/10 transition-colors disabled:opacity-50">
                      {pbExtractingEdu ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {pbExtractingEdu ? "Reading your CV…" : "Pull from CV"}
                    </button>

                    <div className="space-y-3">
                      <div className="font-display text-xs font-700 uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" /> Education
                      </div>
                      {pbEducation.map((ed, i) => (
                        <div key={ed.id} className="border-2 border-border p-4 space-y-3 bg-muted/30">
                          <div className="flex items-center justify-between">
                            <span className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">#{i + 1}</span>
                            {pbEducation.length > 1 && (
                              <button type="button" onClick={() => setPbEducation(pbEducation.filter((x) => x.id !== ed.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                            )}
                          </div>
                          <input value={ed.school} onChange={(e) => setPbEducation(pbEducation.map((x) => x.id === ed.id ? { ...x, school: e.target.value } : x))} placeholder="School / college / university" className="w-full border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input value={ed.qualification} onChange={(e) => setPbEducation(pbEducation.map((x) => x.id === ed.id ? { ...x, qualification: e.target.value } : x))} placeholder="Qualification" className="border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary" />
                            <input value={ed.dates} onChange={(e) => setPbEducation(pbEducation.map((x) => x.id === ed.id ? { ...x, dates: e.target.value } : x))} placeholder="Dates" className="border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary" />
                          </div>
                          <input value={ed.grade} onChange={(e) => setPbEducation(pbEducation.map((x) => x.id === ed.id ? { ...x, grade: e.target.value } : x))} placeholder="Grade / result (optional)" className="w-full border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary" />
                        </div>
                      ))}
                      <button type="button" onClick={() => setPbEducation([...pbEducation, { id: uid(), school: "", qualification: "", dates: "", grade: "" }])} className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add education
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="font-display text-xs font-700 uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Qualifications & certifications
                      </div>
                      {pbQualifications.map((q, i) => (
                        <div key={q.id} className="border-2 border-border p-4 space-y-3 bg-muted/30">
                          <div className="flex items-center justify-between">
                            <span className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">#{i + 1}</span>
                            <button type="button" onClick={() => setPbQualifications(pbQualifications.filter((x) => x.id !== q.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input value={q.name} onChange={(e) => setPbQualifications(pbQualifications.map((x) => x.id === q.id ? { ...x, name: e.target.value } : x))} placeholder="Name" className="sm:col-span-2 border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary" />
                            <input value={q.year} onChange={(e) => setPbQualifications(pbQualifications.map((x) => x.id === q.id ? { ...x, year: e.target.value } : x))} placeholder="Year" className="border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary" />
                          </div>
                          <input value={q.issuer} onChange={(e) => setPbQualifications(pbQualifications.map((x) => x.id === q.id ? { ...x, issuer: e.target.value } : x))} placeholder="Issuer / awarding body" className="w-full border-2 border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:border-primary" />
                        </div>
                      ))}
                      <button type="button" onClick={() => setPbQualifications([...pbQualifications, { id: uid(), name: "", issuer: "", year: "" }])} className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add qualification
                      </button>
                    </div>
                  </div>
                </StepShell>
              )}

              {/* Step 7: Personality */}
              {currentStep.id === "personality" && (
                <StepShell
                  icon={Sparkles}
                  eyebrow="07 - Career personality"
                  title="A quick personality test"
                  subtitle="12 questions, ~2 minutes. Based on Holland's RIASEC model used by careers professionals worldwide."
                >
                  <div className="border-2 border-border p-1">
                    <RiasecQuiz
                      initialScores={riasecScores}
                      initialWorkValues={workValues}
                      onComplete={handleRiasecComplete}
                      onFinish={handleFinish}
                    />
                  </div>
                </StepShell>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer nav */}
      <footer className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={stepIdx === 0}
            className="flex items-center gap-2 px-4 py-2.5 font-display font-700 text-xs uppercase tracking-wider text-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleSkip}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2.5 font-display font-600 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>

          {stepIdx < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={submitting}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-display font-700 text-xs uppercase tracking-wider shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-display font-700 text-xs uppercase tracking-wider shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Finish
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="font-display text-[11px] font-700 uppercase tracking-wider text-muted-foreground mb-1.5 block">
      {label}
    </label>
    {children}
  </div>
);

const StepShell = ({
  icon: Icon, eyebrow, title, subtitle, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="font-display text-[10px] font-700 uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </span>
    </div>
    <h1 className="font-display font-900 text-2xl md:text-4xl leading-tight mb-3">
      {title}<span className="text-primary">.</span>
    </h1>
    <p className="font-body text-sm md:text-base text-muted-foreground mb-8">
      {subtitle}
    </p>
    {children}
  </div>
);

export default Onboarding;
