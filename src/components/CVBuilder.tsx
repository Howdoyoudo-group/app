import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  LogIn,
  Download,
  Upload,
  Video,
  Sparkles,
  Heart,
  Wrench,
  Users,
  Palette,
  Monitor,
  Link as LinkIcon,
  FileText,
  Camera,
  MapPin,
  CheckCircle2,
  Mail,
  Loader2,
  Eye,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, Award } from "lucide-react";
import jsPDF from "jspdf";


type Thing = { id: string; title: string; kind: string; when: string; description: string; link?: string };
type Proof = { id: string; label: string; url: string };
type Education = { id: string; school: string; qualification: string; dates: string; grade: string; link?: string; logoUrl?: string };
type Qualification = { id: string; name: string; issuer: string; year: string };
type WorkExperience = { id: string; company: string; title: string; dates: string; location: string; description: string; link?: string; logoUrl?: string };

const uid = () => Math.random().toString(36).slice(2, 9);

// Pull a hostname out of any url-ish string
const hostFrom = (u?: string) => {
  if (!u) return "";
  try {
    const url = u.startsWith("http") ? u : `https://${u}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const isImageUrl = (u?: string) =>
  !!u && /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(u);

const isCvFileName = (name?: string) => !!name && /\.(pdf|docx?|txt)$/i.test(name);

// Deterministic pastel from a string for fallback initials bubble
const colorFor = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h}, 70%, 88%)`;
};

const initialsOf = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "•";

const normaliseOrgName = (name: string) =>
  (name || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const KNOWN_LOGO_DOMAINS: Record<string, string> = {
  "ucl": "ucl.ac.uk",
  "university college london": "ucl.ac.uk",
  "kings college london": "kcl.ac.uk",
  "imperial college london": "imperial.ac.uk",
  "london school of economics": "lse.ac.uk",
  "lse": "lse.ac.uk",
  "university of oxford": "ox.ac.uk",
  "university of cambridge": "cam.ac.uk",
  "university of edinburgh": "ed.ac.uk",
  "university of manchester": "manchester.ac.uk",
  "university of leeds": "leeds.ac.uk",
  "university of bristol": "bristol.ac.uk",
  "university of birmingham": "birmingham.ac.uk",
  "university of nottingham": "nottingham.ac.uk",
  "university of sheffield": "sheffield.ac.uk",
  "university of warwick": "warwick.ac.uk",
  "university of exeter": "exeter.ac.uk",
  "university of bath": "bath.ac.uk",
  "university of york": "york.ac.uk",
  "durham university": "durham.ac.uk",
  "cardiff university": "cardiff.ac.uk",
  "newcastle university": "newcastle.ac.uk",
  "queen mary university of london": "qmul.ac.uk",
  "university of the arts london": "arts.ac.uk",
  "ual": "arts.ac.uk",
  "oxford brookes university": "brookes.ac.uk",
};

// Guess likely domains from a company / school name for logo lookup.
const guessDomains = (name: string): string[] => {
  const normalised = normaliseOrgName(name);
  const withoutSuffixes = normalised
    .replace(/\b(ltd|limited|plc|inc|llc|llp|gmbh|company|group|uk)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const compact = withoutSuffixes.replace(/\b(the|and|co)\b/g, " ").replace(/\s+/g, "").trim();
  const domains = new Set<string>();

  if (KNOWN_LOGO_DOMAINS[normalised]) domains.add(KNOWN_LOGO_DOMAINS[normalised]);

  const universityOf = normalised.match(/^university of (.+)$/)?.[1]?.replace(/\b(the)\b/g, "").replace(/\s+/g, "").trim();
  if (universityOf) domains.add(`${universityOf}.ac.uk`);

  const educationSlug = normalised
    .replace(/\b(university|college|school|academy|sixth form|institute|of|the)\b/g, " ")
    .replace(/\s+/g, "")
    .trim();
  if (/\b(university|college|school|academy|sixth form|institute)\b/.test(normalised) && educationSlug) {
    domains.add(`${educationSlug}.ac.uk`);
    domains.add(`${educationSlug}.sch.uk`);
    domains.add(`${educationSlug}.edu`);
    domains.add(`${educationSlug}.org.uk`);
    domains.add(`${educationSlug}.school`);
  }

  if (compact) {
    domains.add(`${compact}.com`);
    domains.add(`${compact}.co.uk`);
  }

  return [...domains];
};

const LogoBubble = ({
  name,
  url,
  size = 44,
}: {
  name: string;
  url?: string;
  size?: number;
}) => {
  // Build a chain of logo sources to try in order
  const sources: string[] = [];
  const explicitHost = hostFrom(url);
  if (isImageUrl(url)) sources.push(url!);
  if (explicitHost) {
    sources.push(`https://logo.clearbit.com/${explicitHost}`);
    sources.push(`https://www.google.com/s2/favicons?domain_url=https://${explicitHost}&sz=128`);
    sources.push(`https://icons.duckduckgo.com/ip3/${explicitHost}.ico`);
  }
  guessDomains(name).forEach((guessed) => {
    if (!guessed || guessed === explicitHost) return;
    sources.push(`https://logo.clearbit.com/${guessed}`);
    sources.push(`https://www.google.com/s2/favicons?domain_url=https://${guessed}&sz=128`);
    sources.push(`https://icons.duckduckgo.com/ip3/${guessed}.ico`);
  });

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [name, url]);
  const src = sources[idx];

  if (src) {
    return (
      <img
        src={src}
        alt={`${name} logo`}
        loading="lazy"
        onError={() => setIdx((i) => i + 1)}
        style={{ width: size, height: size }}
        className="rounded-xl object-contain bg-card border border-border p-1 shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, background: colorFor(name) }}
      className="rounded-xl flex items-center justify-center font-display font-700 text-foreground/80 text-sm shrink-0 border border-border"
      aria-hidden
    >
      {initialsOf(name)}
    </div>
  );
};

const Card = ({
  title,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-3xl border border-border bg-card p-5 md:p-6 space-y-4 shadow-[0_2px_0_0_hsl(var(--border)),0_8px_24px_-12px_hsl(var(--foreground)/0.08)]"
  >
    <h3 className="font-display font-700 text-foreground flex items-center gap-2 text-base">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
        <Icon className="w-4 h-4" />
      </span>
      {title}
    </h3>
    {children}
  </motion.div>
);

const SKILL_GROUPS: { key: string; label: string; icon: any; tags: string[] }[] = [
  {
    key: "practical",
    label: "Practical",
    icon: Wrench,
    tags: ["Customer service", "Admin", "Selling", "Hands-on", "Driving", "Cooking", "DIY", "Organising"],
  },
  {
    key: "people",
    label: "People",
    icon: Users,
    tags: ["Leadership", "Teamwork", "Empathy", "Public speaking", "Mentoring", "Conflict-solving", "Listening"],
  },
  {
    key: "creative",
    label: "Creative",
    icon: Palette,
    tags: ["Writing", "Design", "Photography", "Video", "Music", "Drawing", "Storytelling", "Styling"],
  },
  {
    key: "digital",
    label: "Digital",
    icon: Monitor,
    tags: ["Social media", "Canva", "Figma", "Excel", "Coding", "AI tools", "Editing", "Analytics"],
  },
];

const PROMPTS = [
  "What are you proud of?",
  "What gives you energy?",
  "What do people come to you for?",
  "What kind of team do you work best in?",
];

const mapCvExtraction = (data: any) => ({
  education: ((data?.education || []) as any[]).map((e) => ({
    id: uid(),
    school: e.school || "",
    qualification: e.qualification || "",
    dates: e.dates || "",
    grade: e.grade || "",
    link: e.link || "",
  })) as Education[],
  qualifications: ((data?.qualifications || []) as any[]).map((q) => ({
    id: uid(),
    name: q.name || "",
    issuer: q.issuer || "",
    year: q.year || "",
  })) as Qualification[],
  experience: ((data?.experience || []) as any[]).map((w) => ({
    id: uid(),
    company: w.company || "",
    title: w.title || "",
    dates: w.dates || "",
    location: w.location || "",
    description: w.description || "",
    link: w.link || "",
  })) as WorkExperience[],
});

const CVBuilder = () => {
  const { user } = useAuth();

  // Personal
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [personalLink, setPersonalLink] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [importingLinkedin, setImportingLinkedin] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");

  // Story
  const [intro, setIntro] = useState("");
  const [interests, setInterests] = useState("");
  const [passions, setPassions] = useState("");
  const [lookingFor, setLookingFor] = useState("");

  // Video
  const [videoUrl, setVideoUrl] = useState<string>("");

  // Things
  const [things, setThings] = useState<Thing[]>([
    { id: uid(), title: "", kind: "Project", when: "", description: "" },
  ]);

  // Skills
  const [skills, setSkills] = useState<Record<string, string[]>>({
    practical: [],
    people: [],
    creative: [],
    digital: [],
  });
  const [customSkill, setCustomSkill] = useState("");

  // Proof
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [proofLabel, setProofLabel] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  // Prompts
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});

  // Education & Qualifications
  const [education, setEducation] = useState<Education[]>([
    { id: uid(), school: "", qualification: "", dates: "", grade: "" },
  ]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [storedCvPath, setStoredCvPath] = useState<string | null>(null);

  // ATS CV
  const [showAts, setShowAts] = useState(false);
  const [cvScore, setCvScore] = useState<{ score: number; grade: string; suggestions: string[] } | null>(null);
  const [scoringCv, setScoringCv] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [atsResult, setAtsResult] = useState<{ cvText: string; keywords: string[]; score: number } | null>(null);
  const [generatingAts, setGeneratingAts] = useState(false);

  // AI / personality data (read-only)
  const [aiOverview, setAiOverview] = useState<string>("");
  const [riasecScores, setRiasecScores] = useState<Record<string, number> | null>(null);
  const [workValues, setWorkValues] = useState<Record<string, number> | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  // Prepopulate from profile + hydrate Profile Builder JSON
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, photo_url, location_preference, home_address, industry_interests, role_preferences, understand_me_results, riasec_scores, work_values, job_preferences")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setFullName((p) => p || data.full_name || "");
        setPhone((p) => p || data.phone || "");
        setPhotoUrl((p) => p || data.photo_url || "");
        setLocation((p) => p || data.location_preference || "");
        setHomeAddress((p) => p || data.home_address || "");
        setInterests((p) => p || (data.industry_interests || []).join(", "));
        setLookingFor((p) => p || (data.role_preferences || []).join(", "));
        const um = (data as any).understand_me_results || {};
        setAiOverview(um.personalityInsights || um.summary || "");
        setRiasecScores(((data as any).riasec_scores as any) || null);
        setWorkValues(((data as any).work_values as any) || null);

        // Hydrate Profile Builder sub-object (saved by Onboarding + Save button)
        const jp: any = (data as any).job_preferences || {};
        const pb = jp.profileBuilder || {};
        // Check both sources for the CV path — _inputData may exist but lack the full path
        const umInput = ((um as any)?._inputData && typeof (um as any)._inputData === "object") ? (um as any)._inputData : {};
        const jpUm = jp.understandMe || {};
        const existingCvPath =
          (typeof umInput.cvFilePath === "string" && umInput.cvFilePath) ||
          (typeof umInput.cvPath === "string" && umInput.cvPath) ||
          (typeof jpUm.cvFilePath === "string" && jpUm.cvFilePath) ||
          (typeof jpUm.cvPath === "string" && jpUm.cvPath) ||
          null;
        if (existingCvPath) setStoredCvPath(existingCvPath);
        // Pull "what you love" from onboarding (job_preferences.passions + passionsText)
        const onboardingPassions: string[] = [
          ...(Array.isArray(jp.passions) ? jp.passions : []),
          ...(typeof jp.passionsText === "string" && jp.passionsText.trim()
            ? jp.passionsText.split(/[,\n]+/).map((s: string) => s.trim()).filter(Boolean)
            : []),
        ];
        const pbPassions: string[] = Array.isArray(pb.passions) ? pb.passions : [];
        const mergedPassions = Array.from(new Set([...pbPassions, ...onboardingPassions]));
        if (mergedPassions.length) setPassions((p) => p || mergedPassions.join(", "));
        if (pb.intro) setIntro(pb.intro);
        if (pb.personalLink) setPersonalLink(pb.personalLink);
        if (pb.videoUrl) setVideoUrl(pb.videoUrl);
        if (pb.skills && typeof pb.skills === "object") {
          setSkills({
            practical: pb.skills.practical || [],
            people: pb.skills.people || [],
            creative: pb.skills.creative || [],
            digital: pb.skills.digital || [],
          });
        }
        if (Array.isArray(pb.things) && pb.things.length) {
          setThings(pb.things.map((t: any) => ({
            id: uid(),
            title: t.title || "",
            kind: t.kind || "Project",
            when: t.when || "",
            description: t.description || "",
            link: t.link || "",
          })));
        }
        if (pb.promptAnswers && typeof pb.promptAnswers === "object") {
          setPromptAnswers(pb.promptAnswers);
        }
        if (Array.isArray(pb.education) && pb.education.length) {
          setEducation(pb.education.map((e: any) => ({
            id: uid(),
            school: e.school || "",
            qualification: e.qualification || "",
            dates: e.dates || "",
            grade: e.grade || "",
            link: e.link || "",
            logoUrl: e.logoUrl || "",
          })));
        }
        if (Array.isArray(pb.qualifications) && pb.qualifications.length) {
          setQualifications(pb.qualifications.map((q: any) => ({
            id: uid(),
            name: q.name || "",
            issuer: q.issuer || "",
            year: q.year || "",
          })));
        }
        if (Array.isArray(pb.experience) && pb.experience.length) {
          setExperience(pb.experience.map((w: any) => ({
            id: uid(),
            company: w.company || "",
            title: w.title || "",
            dates: w.dates || "",
            location: w.location || "",
            description: w.description || "",
            link: w.link || "",
            logoUrl: w.logoUrl || "",
          })));
        }
      }
      setEmail((p) => p || user.email || "");
      setHydrated(true);
    })();
  }, [user]);

  // Auto-populate education / qualifications / work experience from the user's existing CV (if any)
  useEffect(() => {
    if (!user || !hydrated) return;
    let cancelled = false;
    (async () => {
      const educationEmpty = education.length <= 1 && !education[0]?.school && !education[0]?.qualification;
      const experienceEmpty = experience.length === 0 || (experience.length === 1 && !experience[0]?.company && !experience[0]?.title);
      if (!educationEmpty && !experienceEmpty) return;
      try {
        const filePath = await getExistingCvPath();
        if (!filePath) return;
        setExtracting(true);
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
        const fnRes = await fetch(
          "https://wgistckxxbfpsuulbswr.supabase.co/functions/v1/extract-cv-education",
          { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ filePath }) }
        );
        const data = await fnRes.json().catch(() => ({}));
        if (cancelled || !fnRes.ok || !data?.success) return;
        const { education: newEd, qualifications: newQ, experience: newW } = mapCvExtraction(data);
        if (newEd.length && educationEmpty) setEducation(newEd);
        if (newQ.length) setQualifications((prev) => [...prev, ...newQ]);
        if (newW.length && experienceEmpty) setExperience(newW);
        if (newEd.length || newQ.length || newW.length) {
          toast.success(`Auto-filled ${newEd.length} education, ${newQ.length} qualifications and ${newW.length} jobs from your CV.`);
        }
      } catch {
        // silent - user can still upload manually
      } finally {
        if (!cancelled) setExtracting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hydrated]);

  const onUpload = (file: File | null, set: (v: string) => void) => {
    if (!file) return;
    set(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    if (!user) {
      toast.error("Sign in to save your profile.");
      return;
    }
    setSaving(true);
    try {
      // Read current job_preferences so we don't clobber other keys
      const { data: existing } = await supabase
        .from("profiles")
        .select("job_preferences")
        .eq("id", user.id)
        .maybeSingle();
      const currentPrefs = (existing?.job_preferences as any) || {};

      const passionsArr = passions
        ? passions.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const profileBuilder = {
        intro,
        personalLink,
        videoUrl,
        skills,
        passions: passionsArr,
        things: things
          .filter((t) => t.title || t.description)
          .map(({ id: _id, ...rest }) => rest),
        promptAnswers,
        education: education
          .filter((e) => e.school || e.qualification)
          .map(({ id: _id, ...rest }) => rest),
        qualifications: qualifications
          .filter((q) => q.name)
          .map(({ id: _id, ...rest }) => rest),
        experience: experience
          .filter((w) => w.company || w.title)
          .map(({ id: _id, ...rest }) => rest),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          phone: phone || null,
          photo_url: photoUrl || null,
          location_preference: location || null,
          home_address: homeAddress || null,
          industry_interests: interests
            ? interests.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          role_preferences: lookingFor
            ? lookingFor.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          job_preferences: { ...currentPrefs, passions: passionsArr, profileBuilder },
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Could not save your profile.");
        return;
      }
      toast.success("Profile saved.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Fetch a logo image and return it as a base64 data URL.
  // Tries stored logoUrl first, then Clearbit from the link domain, then guessed domain.
  const fetchLogoDataUrl = async (entry: {
    logoUrl?: string; link?: string; company?: string; school?: string;
  }): Promise<string | null> => {
    const tryFetch = async (url: string): Promise<string | null> => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return null;
        const ct = res.headers.get("content-type") || "";
        if (!ct.startsWith("image/")) return null;
        const blob = await res.blob();
        return await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch { return null; }
    };

    if (entry.logoUrl) { const r = await tryFetch(entry.logoUrl); if (r) return r; }

    const linkStr = entry.link || "";
    if (linkStr) {
      try {
        const url = linkStr.startsWith("http") ? linkStr : `https://${linkStr}`;
        const domain = new URL(url).hostname.replace(/^www\./, "");
        const r = await tryFetch(`https://logo.clearbit.com/${domain}`);
        if (r) return r;
      } catch { /* ignore */ }
    }

    const name = (entry.company || entry.school || "").toLowerCase()
      .replace(/\b(ltd|limited|plc|inc|llc|group|uk|the|of|and)\b/g, " ")
      .replace(/[^a-z0-9]+/g, "").trim().slice(0, 20);
    if (name.length >= 3) {
      const r = await tryFetch(`https://logo.clearbit.com/${name}.com`);
      if (r) return r;
    }
    return null;
  };

  // Build a properly formatted two-column A4 CV using jsPDF text API.
  // Left sidebar (dark navy): contact, skills, interests, education.
  // Right main (white): name, profile, experience, qualifications.
  const buildPdf = async (): Promise<jsPDF | null> => {
    const allSkills = Object.values(skills).flat();

    // ── Deduplication ─────────────────────────────────────────────────────────
    // Filter out "things" that are really work-experience entries (kind=Role or
    // title matches an experience entry) — prevents the same job appearing twice.
    const validExp = experience.filter((w) => w.company || w.title);
    const expTitleSet = new Set(
      validExp.map((w) => w.title?.toLowerCase().trim()).filter(Boolean),
    );
    const validThings = things.filter(
      (t) =>
        t.title &&
        t.kind !== "Role" &&
        !expTitleSet.has(t.title.toLowerCase().trim()),
    );
    const validEd = education.filter((e) => e.school || e.qualification);
    const validQ = qualifications.filter((q) => q.name);

    // ── Pre-fetch logos in parallel ───────────────────────────────────────────
    const [expLogos, edLogos] = await Promise.all([
      Promise.all(validExp.map((w) => fetchLogoDataUrl(w))),
      Promise.all(validEd.map((e) => fetchLogoDataUrl(e))),
    ]);

    const pdf = new jsPDF("p", "mm", "a4");

    // ── Page geometry ──────────────────────────────────────────────────────────
    const PW = 210;
    const PH = 297;
    const SB = 68; // sidebar width
    const SP = 8;  // sidebar inner padding
    const SW = SB - SP * 2; // sidebar text width
    const MX = SB + 10; // main column x start
    const MW = PW - MX - 10; // main column width
    const MT = 14; // margin top
    const MB = 14; // margin bottom

    // ── Colours (RGB) ─────────────────────────────────────────────────────────
    const NAVY = [22, 37, 58]; // sidebar bg
    const WHITE = [255, 255, 255];
    const OFF_WHITE = [230, 235, 240]; // sidebar muted text
    const GREEN = [16, 185, 129]; // accent
    const DARK = [20, 20, 20]; // main text
    const MID = [90, 90, 90]; // secondary text
    const LIGHT = [160, 160, 160]; // tertiary

    const rgb = (c: number[]) => ({ r: c[0], g: c[1], b: c[2] });

    // ── State for each column ──────────────────────────────────────────────────
    let sY = MT; // sidebar cursor
    let mY = MT; // main cursor

    // ── Helpers ───────────────────────────────────────────────────────────────
    const drawSidebarBg = () => {
      pdf.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      pdf.rect(0, 0, SB, PH, "F");
    };

    const newPage = () => {
      pdf.addPage();
      drawSidebarBg();
      sY = MT;
      mY = MT;
    };

    const lineH = (size: number) => size * 0.3528 * 1.45;

    // Write text in sidebar column; returns height consumed.
    const sbText = (
      text: string,
      size: number,
      style: "normal" | "bold" = "normal",
      color: number[] = WHITE,
      extraGap = 0,
    ) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", style);
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, SW) as string[];
      pdf.text(lines, SP, sY);
      const h = lines.length * lineH(size) + extraGap;
      sY += h;
      return h;
    };

    // Write text in main column; returns height consumed.
    const mnText = (
      text: string,
      x: number,
      size: number,
      style: "normal" | "bold" = "normal",
      color: number[] = DARK,
      width = MW,
      extraGap = 0,
    ) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", style);
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, width) as string[];
      pdf.text(lines, x, mY);
      const h = lines.length * lineH(size) + extraGap;
      mY += h;
      return h;
    };

    // Right-aligned text (for dates)
    const mnTextRight = (text: string, size: number, color: number[] = MID) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(color[0], color[1], color[2]);
      const tw = (pdf.getStringUnitWidth(text) * size) / (72 / 25.4);
      pdf.text(text, PW - 10 - tw, mY);
    };

    // Sidebar section heading
    const sbHeading = (label: string) => {
      if (sY + 10 > PH - MB) return; // no space
      sY += 3;
      pdf.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
      pdf.rect(SP, sY, 18, 0.5, "F");
      sY += 3;
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
      pdf.text(label.toUpperCase(), SP, sY);
      sY += lineH(7) + 1;
    };

    // Main section heading with green underline
    const mnHeading = (label: string) => {
      if (mY + 10 > PH - MB) newPage();
      mY += 4;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
      pdf.text(label.toUpperCase(), MX, mY);
      mY += lineH(9);
      pdf.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
      pdf.setLineWidth(0.5);
      pdf.line(MX, mY, PW - 10, mY);
      mY += 3;
    };

    // Ensure main column has room for `needed` mm
    const ensureMain = (needed: number) => {
      if (mY + needed > PH - MB) newPage();
    };

    // ── Draw first page sidebar background ────────────────────────────────────
    drawSidebarBg();

    // ── SIDEBAR: contact info ─────────────────────────────────────────────────
    // Small HDYD branding at top of sidebar
    sY += 4;
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    pdf.text("HOWDOYOUDO.CO.UK", SP, sY);
    sY += lineH(7) + 2;

    // Photo circle placeholder / actual photo
    const PHOTO_R = 18; // radius mm
    const PHOTO_CX = SB / 2;
    const PHOTO_CY = sY + PHOTO_R + 2;
    if (photoUrl) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej();
          img.src = photoUrl;
          setTimeout(rej, 4000);
        });
        const c = document.createElement("canvas");
        const size = PHOTO_R * 2 * 10;
        c.width = size; c.height = size;
        const ctx = c.getContext("2d")!;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 0, 0, size, size);
        const dataUrl = c.toDataURL("image/jpeg", 0.85);
        pdf.addImage(dataUrl, "JPEG", PHOTO_CX - PHOTO_R, sY + 2, PHOTO_R * 2, PHOTO_R * 2);
      } catch {
        // If image load fails, draw a circle placeholder
        pdf.setFillColor(40, 60, 90);
        pdf.circle(PHOTO_CX, PHOTO_CY, PHOTO_R, "F");
      }
    } else {
      pdf.setFillColor(40, 60, 90);
      pdf.circle(PHOTO_CX, PHOTO_CY, PHOTO_R, "F");
    }
    sY += PHOTO_R * 2 + 6;

    sbHeading("Contact");
    if (email) sbText(email, 7.5, "normal", OFF_WHITE, 1);
    if (phone) sbText(phone, 7.5, "normal", OFF_WHITE, 1);
    if (location || homeAddress) sbText(location || homeAddress, 7.5, "normal", OFF_WHITE, 1);
    if (personalLink) sbText(personalLink.replace(/^https?:\/\//i, ""), 7.5, "normal", GREEN, 1);
    if (linkedinUrl) sbText(linkedinUrl.replace(/^https?:\/\//i, ""), 7.5, "normal", GREEN, 1);

    if (allSkills.length > 0) {
      sbHeading("Skills");
      allSkills.forEach((s) => {
        if (sY + lineH(7.5) > PH - MB) return;
        // Small bullet
        pdf.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
        pdf.circle(SP + 1.5, sY - 1.2, 0.9, "F");
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
        const lines = pdf.splitTextToSize(s, SW - 5) as string[];
        pdf.text(lines, SP + 4.5, sY);
        sY += lines.length * lineH(7.5) + 0.5;
      });
    }

    // Merge passions + industry interests for sidebar
    const passionList = [
      ...passions.split(",").map((p) => p.trim()).filter(Boolean),
      ...interests.split(",").map((p) => p.trim()).filter(Boolean),
    ].filter((v, i, a) => a.indexOf(v) === i); // dedupe
    if (passionList.length > 0) {
      sbHeading("Interests");
      passionList.forEach((p) => {
        if (sY + lineH(7.5) > PH - MB) return;
        pdf.setFillColor(OFF_WHITE[0], OFF_WHITE[1], OFF_WHITE[2]);
        pdf.circle(SP + 1.5, sY - 1.2, 0.9, "F");
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
        const lines = pdf.splitTextToSize(p, SW - 5) as string[];
        pdf.text(lines, SP + 4.5, sY);
        sY += lines.length * lineH(7.5) + 0.5;
      });
    }

    // Education in sidebar if short
    if (validEd.length > 0 && validEd.length <= 2) {
      sbHeading("Education");
      validEd.forEach((e, ei) => {
        const eLogo = edLogos[ei] || null;
        if (eLogo && sY + 7 < PH - MB) {
          addLogoSafe(eLogo, SP + 2.5, sY - 5, 5, 5);
        }
        if (sY + lineH(7.5) + lineH(7) > PH - MB) return;
        sbText(e.school || e.qualification, 7.5, "bold", WHITE, 0);
        if (e.school && e.qualification) sbText(e.qualification, 7, "normal", OFF_WHITE, 0);
        if (e.dates) sbText(e.dates, 7, "normal", [GREEN[0], GREEN[1], GREEN[2]], 0);
        if (e.grade) sbText(e.grade, 7, "normal", OFF_WHITE, 0);
        sY += 2;
      });
    }

    // ── MAIN COLUMN ───────────────────────────────────────────────────────────

    // Name
    mY += 2;
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
    pdf.text(fullName || "Your Name", MX, mY);
    mY += lineH(22);

    // Looking-for / tagline
    if (lookingFor.trim()) {
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
      pdf.text(lookingFor.trim(), MX, mY);
      mY += lineH(9) + 1;
    }

    // Thin green line under header
    pdf.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
    pdf.setLineWidth(0.4);
    pdf.line(MX, mY, PW - 10, mY);
    mY += 4;

    // Profile / overview
    const profileText = (aiOverview || intro || "").trim();
    if (profileText) {
      mnHeading("Profile");
      const pLines = pdf.splitTextToSize(profileText, MW) as string[];
      ensureMain(pLines.length * lineH(9.5));
      pdf.setFontSize(9.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
      pdf.text(pLines, MX, mY);
      mY += pLines.length * lineH(9.5);
    }

    const addLogoSafe = (logo: string, x: number, y: number, w: number, h: number) => {
      try {
        const fmt = logo.startsWith("data:image/jpeg") || logo.startsWith("data:image/jpg")
          ? "JPEG" : "PNG";
        pdf.addImage(logo, fmt, x, y, w, h);
      } catch { /* unsupported format — skip */ }
    };

    // Experience
    if (validExp.length > 0) {
      mnHeading("Experience");
      validExp.forEach((w, wi) => {
        const logo = expLogos[wi] || null;
        const logoW = 6;
        const textX = logo ? MX + logoW + 2 : MX;
        const textW = logo ? MW - logoW - 2 : MW;

        const label = w.title && w.company ? `${w.title}` : (w.title || w.company || "");
        const dateStr = w.dates || "";
        const descLines = w.description
          ? (pdf.splitTextToSize(w.description, textW) as string[]).length
          : 0;
        const needed = lineH(10) + lineH(8.5) * (descLines + 1) + 5;
        ensureMain(needed);

        // Logo (drawn at current mY position, not offset above)
        if (logo) {
          addLogoSafe(logo, MX, mY - 4, logoW, logoW);
        }

        // Role title (left) + dates (right)
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
        pdf.text(label, textX, mY);
        if (dateStr) {
          pdf.setFontSize(8.5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(MID[0], MID[1], MID[2]);
          const tw = (pdf.getStringUnitWidth(dateStr) * 8.5) / (72 / 25.4);
          pdf.text(dateStr, PW - 10 - tw, mY);
        }
        mY += lineH(10);

        // Company + location
        const compLoc = [w.company, w.location].filter(Boolean).join(", ");
        if (compLoc) {
          pdf.setFontSize(8.5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
          pdf.text(compLoc, textX, mY);
          mY += lineH(8.5);
        }

        // Description bullets
        if (w.description) {
          // Split only on newlines and explicit bullet chars — NOT hyphens
          // (hyphens appear in date ranges like "Jun 2022 – Aug 2023")
          const bullets = w.description
            .split(/\n+/)
            .flatMap((line) => line.split(/^[•·]\s*/m))
            .map((s) => s.replace(/^[-–—]\s+/, "").trim())
            .filter(Boolean);
          bullets.forEach((b) => {
            const bLines = pdf.splitTextToSize(b, textW - 4) as string[];
            ensureMain(bLines.length * lineH(8.5) + 1);
            pdf.setFillColor(MID[0], MID[1], MID[2]);
            pdf.circle(textX + 1, mY - 1.2, 0.7, "F");
            pdf.setFontSize(8.5);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
            pdf.text(bLines, textX + 4, mY);
            mY += bLines.length * lineH(8.5) + 0.5;
          });
        }

        mY += 3;
      });
    }

    // Things I've done (projects / achievements) — roles already excluded above
    if (validThings.length > 0) {
      mnHeading("Projects & Achievements");
      validThings.forEach((t) => {
        const needed = lineH(10) + lineH(8.5) + 5;
        ensureMain(needed);

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
        pdf.text(t.title, MX, mY);
        if (t.when) {
          pdf.setFontSize(8.5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(MID[0], MID[1], MID[2]);
          const tw = (pdf.getStringUnitWidth(t.when) * 8.5) / (72 / 25.4);
          pdf.text(t.when, PW - 10 - tw, mY);
        }
        mY += lineH(10);

        if (t.kind) {
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
          pdf.text(t.kind, MX, mY);
          mY += lineH(8);
        }
        if (t.description) {
          const dLines = pdf.splitTextToSize(t.description, MW) as string[];
          ensureMain(dLines.length * lineH(8.5));
          pdf.setFontSize(8.5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
          pdf.text(dLines, MX, mY);
          mY += dLines.length * lineH(8.5);
        }
        mY += 3;
      });
    }

    // Education (in main column if more than 2 entries)
    if (validEd.length > 2) {
      mnHeading("Education");
      validEd.forEach((e, ei) => {
        const eLogo = edLogos[ei];
        const logoW = 6;
        const textX = eLogo ? MX + logoW + 2 : MX;
        ensureMain(lineH(10) + lineH(8.5) * 2 + 4);
        const label = e.school || e.qualification;

        if (eLogo) {
          addLogoSafe(eLogo, MX, mY - 4, logoW, logoW);
        }

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
        pdf.text(label, textX, mY);
        if (e.dates) {
          pdf.setFontSize(8.5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(MID[0], MID[1], MID[2]);
          const tw = (pdf.getStringUnitWidth(e.dates) * 8.5) / (72 / 25.4);
          pdf.text(e.dates, PW - 10 - tw, mY);
        }
        mY += lineH(10);
        if (e.school && e.qualification) {
          pdf.setFontSize(8.5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
          pdf.text(e.qualification, textX, mY);
          mY += lineH(8.5);
        }
        if (e.grade) {
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(MID[0], MID[1], MID[2]);
          pdf.text(`Grade: ${e.grade}`, textX, mY);
          mY += lineH(8);
        }
        mY += 3;
      });
    }

    // Qualifications
    if (validQ.length > 0) {
      mnHeading("Qualifications & Certifications");
      validQ.forEach((q) => {
        ensureMain(lineH(8.5) * 2 + 1);
        const qLine = [q.name, q.issuer && `· ${q.issuer}`, q.year && `(${q.year})`].filter(Boolean).join(" ");
        pdf.setFontSize(8.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
        pdf.setFillColor(MID[0], MID[1], MID[2]);
        pdf.circle(MX + 1, mY - 1.2, 0.7, "F");
        pdf.text(qLine, MX + 4, mY);
        mY += lineH(8.5) + 0.5;
      });
    }

    // References line
    ensureMain(lineH(8.5));
    mY += 4;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(LIGHT[0], LIGHT[1], LIGHT[2]);
    pdf.text("References available on request.", MX, mY);

    return pdf;
  };

  const previewProfile = async () => {
    setGeneratingPdf(true);
    try {
      const pdf = await buildPdf();
      if (!pdf) return;
      const url = pdf.output("bloburl") as unknown as string;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate CV preview.");
    } finally {
      setGeneratingPdf(false);
    }
  };


  const generateAtsCv = async () => {
    if (!user) { toast.error("Sign in to generate an ATS CV."); return; }
    if (!jobDescription.trim()) { toast.error("Paste a job description first."); return; }
    setGeneratingAts(true);
    try {
      const allSkills = Object.values(skills).flat();
      const profileData = {
        fullName, location,
        personalIntro: intro,
        industryInterests: interests,
        lookingFor,
        skills: allSkills,
        experiences: things.map(t => ({ category: t.kind, description: t.description })),
        workExperience: experience.map(w => ({ jobTitle: w.title, company: w.company, dates: w.dates, description: w.description })),
        education: education.map(e => ({ school: e.school, qualification: e.qualification, grade: e.grade })),
        qualifications: qualifications.map(q => ({ name: q.name, issuer: q.issuer, year: q.year })),
        proudOf: promptAnswers["proud"] || "",
        givesEnergy: promptAnswers["energy"] || "",
      };
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(
        "https://wgistckxxbfpsuulbswr.supabase.co/functions/v1/generate-ats-cv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ jobDescription, profileData }),
        }
      );
      const data = await res.json();
      if (!data?.cvText) { toast.error(data?.error || "Could not generate ATS CV."); return; }
      setAtsResult(data);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setGeneratingAts(false);
    }
  };

  const downloadAtsTxt = () => {
    if (!atsResult) return;
    const blob = new Blob([atsResult.cvText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(fullName || "cv").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-ats.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const pdf = await buildPdf();
      if (!pdf) return;
      const safeName = (fullName || "profile").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      pdf.save(`${safeName}-howdoyoudo.pdf`);
    } catch (err) {
      console.error(err);
      toast.error("Could not generate PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const downloadWord = () => {
    // Build a clean Word-compatible HTML document
    const allSkills = Object.values(skills).flat();
    const validExp = experience.filter((w) => w.company || w.title);
    const expTitleSet = new Set(validExp.map((w) => w.title?.toLowerCase().trim()).filter(Boolean));
    const validThings = things.filter((t) => t.title && t.kind !== "Role" && !expTitleSet.has(t.title.toLowerCase().trim()));
    const validEd = education.filter((e) => e.school || e.qualification);
    const validQ = qualifications.filter((q) => q.name);
    const passionMerged = [
      ...passions.split(",").map((p) => p.trim()).filter(Boolean),
      ...interests.split(",").map((p) => p.trim()).filter(Boolean),
    ].filter((v, i, a) => a.indexOf(v) === i);

    const sect = (title: string, body: string) =>
      body.trim() ? `<h2 style="font-size:12pt;text-transform:uppercase;letter-spacing:1pt;border-bottom:1pt solid #10b981;padding-bottom:3pt;margin-top:16pt;margin-bottom:6pt;">${title}</h2>${body}` : "";

    const expHtml = validExp.map((w) => `
      <p style="margin:0 0 1pt 0;">
        <strong>${w.title || ""}${w.company ? ` · ${w.company}` : ""}</strong>
        ${w.dates ? `<span style="color:#666;float:right;">${w.dates}</span>` : ""}
      </p>
      ${w.location ? `<p style="margin:0 0 3pt 0;color:#666;font-size:9pt;">${w.location}</p>` : ""}
      ${w.description ? `<p style="margin:0 0 8pt 0;font-size:10pt;">${w.description.replace(/\n/g, "<br>")}</p>` : ""}
    `).join("");

    const thingsHtml = validThings.map((t) => `
      <p style="margin:0 0 1pt 0;"><strong>${t.title}</strong>${t.when ? ` <span style="color:#666;">(${t.when})</span>` : ""}</p>
      ${t.description ? `<p style="margin:0 0 8pt 0;font-size:10pt;">${t.description}</p>` : ""}
    `).join("");

    const edHtml = validEd.map((e) => `
      <p style="margin:0 0 1pt 0;"><strong>${e.school || e.qualification}</strong>${e.dates ? ` <span style="color:#666;">(${e.dates})</span>` : ""}</p>
      ${e.school && e.qualification ? `<p style="margin:0 0 1pt 0;font-size:10pt;">${e.qualification}${e.grade ? ` — ${e.grade}` : ""}</p>` : ""}
    `).join("");

    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #1a1a1a; margin: 1.5cm 2cm; line-height: 1.5; }
  h1 { font-size: 22pt; margin: 0 0 4pt 0; }
  h2 { font-size: 10pt; }
  p { margin: 0 0 6pt 0; }
  .tagline { color: #10b981; font-size: 11pt; margin-bottom: 14pt; }
  .contact { color: #555; font-size: 9pt; margin-bottom: 14pt; }
  .skill { display: inline-block; border: 1pt solid #1a1a1a; padding: 1pt 6pt; margin: 2pt; font-size: 9pt; }
</style>
</head><body>
<h1>${fullName || "Your Name"}</h1>
${lookingFor ? `<p class="tagline">${lookingFor}</p>` : ""}
<p class="contact">${[email, phone, location || homeAddress, linkedinUrl, personalLink].filter(Boolean).join("  ·  ")}</p>

${(aiOverview || intro) ? sect("Profile", `<p style="font-size:10.5pt;">${(aiOverview || intro).replace(/\n/g, "<br>")}</p>`) : ""}
${validExp.length ? sect("Experience", expHtml) : ""}
${validThings.length ? sect("Projects & Achievements", thingsHtml) : ""}
${validEd.length ? sect("Education", edHtml) : ""}
${validQ.length ? sect("Qualifications", validQ.map((q) => `<p>${q.name}${q.issuer ? ` · ${q.issuer}` : ""}${q.year ? ` (${q.year})` : ""}</p>`).join("")) : ""}
${allSkills.length ? sect("Skills", `<p>${allSkills.map((s) => `<span class="skill">${s}</span>`).join("")}</p>`) : ""}
${passionMerged.length ? sect("Interests", `<p>${passionMerged.join("  ·  ")}</p>`) : ""}
<p style="margin-top:24pt;font-size:8pt;color:#aaa;">References available on request · Created with Howdoyoudo.co.uk</p>
</body></html>`;

    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(fullName || "cv").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-howdoyoudo.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Word document downloaded.");
  };

  const scoreCv = async () => {
    setScoringCv(true);
    setCvScore(null);
    try {
      const allSkills = Object.values(skills).flat();
      const validExp = experience.filter((w) => w.company || w.title);
      const validEd = education.filter((e) => e.school || e.qualification);
      const validQ = qualifications.filter((q) => q.name);
      const passionMerged = [
        ...passions.split(",").map((p) => p.trim()).filter(Boolean),
        ...interests.split(",").map((p) => p.trim()).filter(Boolean),
      ].filter(Boolean);

      const cvSummary = [
        `Name: ${fullName || "not provided"}`,
        `Looking for: ${lookingFor || "not specified"}`,
        `Profile/intro: ${(aiOverview || intro || "").slice(0, 300)}`,
        `Experience entries: ${validExp.length}`,
        ...validExp.map((w) => `  - ${w.title || ""} at ${w.company || ""} (${w.dates || ""}) — ${(w.description || "").slice(0, 120)}`),
        `Skills: ${allSkills.join(", ") || "none"}`,
        `Interests/passions: ${passionMerged.join(", ") || "none"}`,
        `Education entries: ${validEd.length}`,
        ...validEd.map((e) => `  - ${e.qualification || ""} at ${e.school || ""} (${e.grade || ""})`),
        `Qualifications: ${validQ.map((q) => q.name).join(", ") || "none"}`,
        `Photo: ${photoUrl ? "yes" : "no"}`,
        `Contact details: ${[email, phone, location].filter(Boolean).length}/3 provided`,
        `LinkedIn: ${linkedinUrl ? "yes" : "no"}`,
      ].join("\n");

      const { data, error } = await supabase.functions.invoke("score-cv", {
        body: { cvSummary },
      });

      if (error || !data?.score) {
        // Fallback: score locally based on completeness
        let score = 0;
        if (fullName) score += 5;
        if (email) score += 5;
        if (phone) score += 3;
        if (linkedinUrl) score += 5;
        if (photoUrl) score += 5;
        if ((aiOverview || intro).length > 50) score += 10;
        if (lookingFor) score += 5;
        if (validExp.length >= 1) score += 15;
        if (validExp.length >= 2) score += 5;
        if (validExp.some((w) => w.description && w.description.length > 50)) score += 10;
        if (allSkills.length >= 3) score += 10;
        if (allSkills.length >= 6) score += 5;
        if (validEd.length >= 1) score += 10;
        if (passionMerged.length >= 2) score += 5;
        if (validQ.length >= 1) score += 2;

        const suggestions: string[] = [];
        if (!photoUrl) suggestions.push("Add a professional photo — CVs with photos get more attention.");
        if (!(aiOverview || intro) || (aiOverview || intro).length < 50) suggestions.push("Write a personal profile (2–3 sentences) — it's the first thing recruiters read.");
        if (!lookingFor) suggestions.push("Add a job title or tagline so employers know what role you're targeting.");
        if (validExp.length === 0) suggestions.push("Add at least one work experience entry, including part-time or voluntary work.");
        if (validExp.some((w) => !w.description || w.description.length < 30)) suggestions.push("Expand your job descriptions — use specific achievements and numbers where possible.");
        if (allSkills.length < 4) suggestions.push("Add more skills — aim for 6–10 relevant to the roles you're applying for.");
        if (!linkedinUrl) suggestions.push("Add your LinkedIn URL to make it easy for recruiters to find you.");
        if (passionMerged.length === 0) suggestions.push("Add interests or passions — they help employers see the person behind the CV.");
        if (validEd.length === 0) suggestions.push("Add your education — even if it's just your secondary school.");

        setCvScore({ score, grade: score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D", suggestions: suggestions.slice(0, 5) });
      } else {
        setCvScore(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not score CV right now.");
    } finally {
      setScoringCv(false);
    }
  };

  const emailProfile = async () => {
    if (!user) {
      toast.error("Sign in to email your profile.");
      return;
    }
    setEmailing(true);
    try {
      const pdf = await buildPdf();
      if (!pdf) return;
      const dataUri = pdf.output("datauristring") as string;
      const base64 = dataUri.split(",")[1];
      const { error } = await supabase.functions.invoke("send-profile-email", {
        body: { pdfBase64: base64, fullName: fullName || null },
      });
      if (error) {
        toast.error("Could not send email.");
        return;
      }
      toast.success(`Sent to ${user.email}.`);
    } catch (err) {
      console.error(err);
      toast.error("Could not send email.");
    } finally {
      setEmailing(false);
    }
  };

  const toggleSkill = (group: string, tag: string) => {
    setSkills((prev) => {
      const list = prev[group] || [];
      return { ...prev, [group]: list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag] };
    });
  };

  const addCustomSkill = () => {
    const v = customSkill.trim();
    if (!v) return;
    setSkills((prev) => ({ ...prev, practical: [...prev.practical, v] }));
    setCustomSkill("");
  };

  const applyCvExtraction = (data: any, replaceBlankEducation = false) => {
    const { education: newEd, qualifications: newQ, experience: newW } = mapCvExtraction(data);
    if (newEd.length) {
      setEducation((prev) => {
        const existing = prev.filter((e) => e.school || e.qualification);
        return replaceBlankEducation && !existing.length ? newEd : [...existing, ...newEd];
      });
    }
    if (newQ.length) setQualifications((prev) => [...prev, ...newQ]);
    if (newW.length) setExperience((prev) => [...prev, ...newW]);
    return { newEd, newQ, newW };
  };

  const getExistingCvPath = async () => {
    if (storedCvPath && isCvFileName(storedCvPath)) return storedCvPath;

    const { data: profile } = await supabase
      .from("profiles")
      .select("job_preferences, understand_me_results")
      .eq("id", user!.id)
      .maybeSingle();
    const jp: any = (profile as any)?.job_preferences || {};
    const um: any = (profile as any)?.understand_me_results || {};
    const savedInput = um?._inputData || jp.understandMe || {};
    const savedPath = savedInput.cvFilePath || savedInput.cvPath;
    if (typeof savedPath === "string" && isCvFileName(savedPath)) {
      setStoredCvPath(savedPath);
      return savedPath;
    }

    const listMostRecent = async (folder?: string) => {
      const { data, error } = await supabase.storage.from("cv-uploads").list(folder, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) return null;
      const latest = (data || []).find((file) => isCvFileName(file.name));
      if (!latest) return null;
      return folder ? `${folder}/${latest.name}` : latest.name;
    };

    const found = (await listMostRecent(user!.id)) || (await listMostRecent());
    if (found) {
      const fileName = found.split("/").pop() || found;
      try { await rememberCvPath(found, fileName); } catch { /* ignore */ }
    }
    return found;
  };

  const rememberCvPath = async (path: string, fileName: string) => {
    setStoredCvPath(path);
    const { data: profile } = await supabase
      .from("profiles")
      .select("job_preferences")
      .eq("id", user!.id)
      .maybeSingle();
    const jp: any = (profile as any)?.job_preferences || {};
    await supabase
      .from("profiles")
      .update({
        job_preferences: {
          ...jp,
          understandMe: {
            ...(jp.understandMe || {}),
            cvFileName: fileName,
            cvFilePath: path,
            cvPath: path,
          },
        },
      } as never)
      .eq("id", user!.id);
  };

  const uploadLogoForExperience = async (id: string, file: File | null) => {
    if (!file) return;
    if (!user) {
      toast.error("Sign in to upload a logo.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be smaller than 2MB.");
      return;
    }
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${user.id}/logos/${id}-${Date.now()}.${ext || "png"}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) {
        toast.error("Could not upload logo.");
        return;
      }
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub?.publicUrl;
      if (!url) {
        toast.error("Could not read logo URL.");
        return;
      }
      setExperience((prev) => prev.map((x) => (x.id === id ? { ...x, link: url } : x)));
      toast.success("Logo added.");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const uploadLogoForEducation = async (id: string, file: File | null) => {
    if (!file) return;
    if (!user) {
      toast.error("Sign in to upload a logo.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be smaller than 2MB.");
      return;
    }
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${user.id}/logos/edu-${id}-${Date.now()}.${ext || "png"}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) {
        toast.error("Could not upload logo.");
        return;
      }
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub?.publicUrl;
      if (!url) {
        toast.error("Could not read logo URL.");
        return;
      }
      setEducation((prev) => prev.map((x) => (x.id === id ? { ...x, link: url } : x)));
      toast.success("Logo added.");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const extractFromCV = async (file: File | null) => {
    if (!file || !user) return;
    setExtracting(true);
    try {
      const path = `${user.id}/profile-builder-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("cv-uploads").upload(path, file);
      if (upErr) {
        toast.error("Could not upload file.");
        return;
      }
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
      const fnRes = await fetch(
        "https://wgistckxxbfpsuulbswr.supabase.co/functions/v1/extract-cv-education",
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ filePath: path }) }
      );
      const data = await fnRes.json().catch(() => ({}));
      if (!fnRes.ok || !data?.success) {
        toast.error(data?.error || "Could not extract from CV.");
        return;
      }
      await rememberCvPath(path, file.name);
      const { newEd, newQ, newW } = applyCvExtraction(data);
      toast.success(`Pulled ${newEd.length} education, ${newQ.length} qualifications and ${newW.length} jobs from your CV.`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setExtracting(false);
    }
  };

  // Pull education + qualifications from the user's most recent CV already in storage
  const pullFromExistingCV = async () => {
    if (!user) {
      toast.error("Sign in first.");
      return;
    }
    setExtracting(true);
    try {
      const filePath = await getExistingCvPath();
      if (!filePath) {
        toast.error("No CV found in your account. Upload one above and we'll fill this in.");
        return;
      }
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
      const fnRes = await fetch(
        "https://wgistckxxbfpsuulbswr.supabase.co/functions/v1/extract-cv-education",
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ filePath }) }
      );
      const data = await fnRes.json().catch(() => ({}));
      if (!fnRes.ok || !data?.success) {
        console.error("extract-cv-education error:", data);
        toast.error(data?.error || "Could not extract from your CV.");
        return;
      }
      const { newEd, newQ, newW } = applyCvExtraction(data, true);
      if (!newEd.length && !newQ.length && !newW.length) {
        toast.message("We couldn't find any education or work experience on that CV.");
      } else {
        toast.success(`Pulled ${newEd.length} education, ${newQ.length} qualifications and ${newW.length} jobs from your CV.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setExtracting(false);
    }
  };

  const importFromLinkedIn = async () => {
    if (!user) {
      toast.error("Sign in first.");
      return;
    }
    const url = linkedinUrl.trim();
    if (!url) {
      toast.error("Paste your LinkedIn profile URL first.");
      return;
    }
    if (!/linkedin\.com\/in\//i.test(url)) {
      toast.error("That needs to be your personal LinkedIn URL (the one with /in/ in it). School and company pages don't work.");
      return;
    }
    setImportingLinkedin(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-linkedin-profile", {
        body: { url },
      });
      if (error || !data?.success) {
        toast.error(data?.error || "Could not import that LinkedIn profile.");
        return;
      }
      // Personal fields - only fill blanks so we don't clobber what's already typed.
      if (data.fullName && !fullName) setFullName(data.fullName);
      if (data.location && !location) setLocation(data.location);
      if (data.bio && !intro) setIntro(data.bio);
      else if (data.headline && !intro) setIntro(data.headline);
      if (Array.isArray(data.skills) && data.skills.length) {
        setSkills((prev) => {
          const existing = new Set(Object.values(prev).flat().map((s) => s.toLowerCase()));
          const fresh = (data.skills as string[]).filter((s) => !existing.has(s.toLowerCase()));
          if (!fresh.length) return prev;
          return { ...prev, other: [...(prev.other || []), ...fresh] };
        });
      }
      if (Array.isArray(data.interests) && data.interests.length && !interests) {
        setInterests((data.interests as string[]).join(", "));
      }
      const { newEd, newQ, newW } = applyCvExtraction(data, true);
      const bits: string[] = [];
      if (newEd.length) bits.push(`${newEd.length} education`);
      if (newW.length) bits.push(`${newW.length} jobs`);
      if (newQ.length) bits.push(`${newQ.length} qualifications`);
      if (data.skills?.length) bits.push(`${data.skills.length} skills`);
      toast.success(bits.length ? `Imported ${bits.join(", ")} from LinkedIn.` : "Imported your LinkedIn profile.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong importing from LinkedIn.");
    } finally {
      setImportingLinkedin(false);
    }
  };

  const allSkills = useMemo(() => Object.values(skills).flat(), [skills]);

  // Progress
  const progress = useMemo(() => {
    let done = 0;
    if (intro.trim()) done += 20;
    if (videoUrl) done += 20;
    if (allSkills.length >= 3) done += 20;
    if (proofs.length > 0 || things.some((t) => t.title)) done += 20;
    if (fullName.trim() && (lookingFor.trim() || interests.trim())) done += 20;
    return done;
  }, [intro, videoUrl, allSkills, proofs, things, fullName, lookingFor, interests]);

  const lookingForTags = lookingFor
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!user) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-3 shadow-sm">
        <LogIn className="w-6 h-6 text-primary mx-auto" />
        <p className="font-display font-700 text-sm text-foreground">Sign in to build your profile</p>
        <p className="font-body text-xs text-muted-foreground">Create an account or sign in to start.</p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-display font-700 text-xs tracking-wider uppercase hover:bg-primary/90 transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign in
        </Link>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="rounded-3xl border border-border bg-card p-4 md:p-5 shadow-sm print:hidden">
        <div className="flex items-center justify-between mb-2 text-xs font-display font-700 uppercase tracking-widest text-muted-foreground gap-2 flex-wrap">
          {["Story", "Video", "Skills", "Proof", "Preview"].map((s, i) => (
            <span
              key={s}
              className={`flex items-center gap-1.5 ${
                progress >= (i + 1) * 20 ? "text-primary" : ""
              }`}
            >
              {progress >= (i + 1) * 20 && <CheckCircle2 className="w-3.5 h-3.5" />}
              {s}
            </span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Form ── */}
        <div className="space-y-6 print:hidden">
          {/* Personal */}
          <Card title="Personal Details" icon={Sparkles}>
            <div className="flex items-center gap-4">
              <label className="relative w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0] || null, setPhotoUrl)}
                />
              </label>
              <p className="font-body text-xs text-muted-foreground">
                Add a profile photo. A clear face shot works best.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="font-body bg-background rounded-xl" />
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="font-body bg-background rounded-xl" />
              <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="font-body bg-background rounded-xl" />
              <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="font-body bg-background rounded-xl" />
              <Input placeholder="Home address" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} className="font-body bg-background rounded-xl" />
              <Input placeholder="Personal link (Insta, TikTok, portfolio)" value={personalLink} onChange={(e) => setPersonalLink(e.target.value)} className="font-body bg-background rounded-xl md:col-span-2" />
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-display font-700 uppercase tracking-widest text-muted-foreground">
                <LinkIcon className="w-3.5 h-3.5" /> Import from LinkedIn
              </div>
              <p className="font-body text-xs text-muted-foreground">
                Paste your public LinkedIn URL - we'll pre-fill your story, skills, education and work history.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="https://www.linkedin.com/in/your-handle"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="font-body bg-background rounded-xl flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={importFromLinkedIn}
                  disabled={importingLinkedin || !user}
                  className="font-body gap-2 rounded-full"
                >
                  {importingLinkedin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {importingLinkedin ? "Importing…" : "Import"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Video */}
          <Card title="Video Intro" icon={Video} delay={0.05}>
            <p className="font-body text-xs text-muted-foreground">
              Upload a 30 to 60 second intro. Tell employers what you're into, what you're good at,
              and what kind of opportunity you're looking for.
            </p>
            <label className="block">
              <div className="rounded-2xl border-2 border-dashed border-border bg-background hover:border-primary transition-colors p-6 text-center cursor-pointer">
                {videoUrl ? (
                  <video src={videoUrl} controls className="w-full max-h-64 rounded-xl mx-auto" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-primary" />
                    <span className="font-display font-700 text-sm">Upload your video</span>
                    <span className="font-body text-xs text-muted-foreground">MP4, MOV - up to 60 seconds</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0] || null, setVideoUrl)}
                />
              </div>
            </label>
          </Card>

          {/* Story */}
          <Card title="Your Story" icon={Heart} delay={0.1}>
            <Textarea placeholder="Short intro - who are you?" value={intro} onChange={(e) => setIntro(e.target.value)} className="font-body bg-background min-h-[80px] rounded-xl" />
            <div className="space-y-1.5">
              <label className="font-body text-xs text-muted-foreground">What you love (from onboarding - edit any time)</label>
              <Textarea placeholder="e.g. tennis, vinyl, baking, climbing" value={passions} onChange={(e) => setPassions(e.target.value)} className="font-body bg-background min-h-[60px] rounded-xl" />
            </div>
            <Textarea placeholder="What are you interested in? (e.g. music, sustainability, coding)" value={interests} onChange={(e) => setInterests(e.target.value)} className="font-body bg-background min-h-[60px] rounded-xl" />
            <Textarea placeholder="What kind of work are you looking for? (e.g. internship, weekend job, apprenticeship)" value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} className="font-body bg-background min-h-[60px] rounded-xl" />
          </Card>


          {/* Things */}
          <Card title="Things You've Done" icon={Sparkles} delay={0.15}>
            <p className="font-body text-xs text-muted-foreground">
              Add projects, side hustles, volunteering, school work, clubs, sport, content, events
              or part-time jobs. Anything counts.
            </p>
            {things.map((t, i) => (
              <div key={t.id} className="rounded-2xl bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">#{i + 1}</span>
                  {things.length > 1 && (
                    <button onClick={() => setThings(things.filter((x) => x.id !== t.id))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input placeholder="Title (e.g. Started a podcast)" value={t.title} onChange={(e) => setThings(things.map((x) => x.id === t.id ? { ...x, title: e.target.value } : x))} className="font-body bg-background rounded-xl" />
                  <select
                    value={t.kind}
                    onChange={(e) => setThings(things.map((x) => x.id === t.id ? { ...x, kind: e.target.value } : x))}
                    className="font-body bg-background rounded-xl border border-input px-3 h-10 text-sm"
                  >
                    {["Project", "Side hustle", "Volunteering", "School", "Club", "Sport", "Content", "Event", "Part-time job"].map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                  <Input placeholder="When (e.g. 2024 – Present)" value={t.when} onChange={(e) => setThings(things.map((x) => x.id === t.id ? { ...x, when: e.target.value } : x))} className="font-body bg-background rounded-xl md:col-span-2" />
                  <Input placeholder="Link (optional - company, club, project) to pull a logo" value={t.link || ""} onChange={(e) => setThings(things.map((x) => x.id === t.id ? { ...x, link: e.target.value } : x))} className="font-body bg-background rounded-xl md:col-span-2" />
                </div>
                <Textarea placeholder="What did you do? What did you learn?" value={t.description} onChange={(e) => setThings(things.map((x) => x.id === t.id ? { ...x, description: e.target.value } : x))} className="font-body bg-background min-h-[60px] rounded-xl" />
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setThings([...things, { id: uid(), title: "", kind: "Project", when: "", description: "" }])} className="font-body text-xs gap-1 rounded-full">
              <Plus className="w-3 h-3" /> Add another
            </Button>
          </Card>

          {/* Skills */}
          <Card title="Skills" icon={Sparkles} delay={0.2}>
            {SKILL_GROUPS.map((g) => (
              <div key={g.key} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-display font-700 uppercase tracking-widest text-muted-foreground">
                  <g.icon className="w-3.5 h-3.5" /> {g.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...g.tags, ...skills[g.key].filter((t) => !g.tags.includes(t))].map((tag) => {
                    const active = skills[g.key].includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleSkill(g.key, tag)}
                        title={active ? "Click to remove" : "Click to add"}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body border transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                            : "bg-background border-border hover:border-primary"
                        }`}
                      >
                        {tag}
                        {active && <Trash2 className="w-3 h-3 opacity-80" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input placeholder="Add your own skill" value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())} className="font-body bg-background rounded-xl" />
              <Button size="sm" variant="outline" onClick={addCustomSkill} className="font-body text-xs shrink-0 rounded-full">Add</Button>
            </div>
          </Card>

          {/* Proof */}
          <Card title="Proof" icon={LinkIcon} delay={0.25}>
            <p className="font-body text-xs text-muted-foreground">
              Add links, images or documents that show your work.
            </p>
            <div className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
              <Input placeholder="Label" value={proofLabel} onChange={(e) => setProofLabel(e.target.value)} className="font-body bg-background rounded-xl" />
              <Input placeholder="https://..." value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} className="font-body bg-background rounded-xl" />
              <Button
                size="sm"
                variant="outline"
                className="font-body text-xs rounded-full"
                onClick={() => {
                  if (!proofLabel.trim() || !proofUrl.trim()) return;
                  setProofs([...proofs, { id: uid(), label: proofLabel.trim(), url: proofUrl.trim() }]);
                  setProofLabel("");
                  setProofUrl("");
                }}
              >
                <Plus className="w-3 h-3" /> Add link
              </Button>
            </div>
            <label className="block">
              <div className="rounded-2xl border-2 border-dashed border-border bg-background hover:border-primary transition-colors p-4 text-center cursor-pointer text-xs font-body text-muted-foreground">
                <Upload className="w-4 h-4 mx-auto mb-1 text-primary" />
                Or upload a file
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setProofs([...proofs, { id: uid(), label: f.name, url: URL.createObjectURL(f) }]);
                  }}
                />
              </div>
            </label>
            {proofs.length > 0 && (
              <ul className="space-y-1.5">
                {proofs.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm font-body bg-muted/40 rounded-xl px-3 py-2">
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                      {p.label}
                    </a>
                    <button onClick={() => setProofs(proofs.filter((x) => x.id !== p.id))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Work Experience */}
          <Card title="Where You've Worked" icon={Briefcase} delay={0.26}>
            <p className="font-body text-xs text-muted-foreground">
              Jobs, internships, placements, weekend work or freelance gigs. Upload your CV and we'll fill these in for you.
            </p>
            {storedCvPath ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={extracting}
                  onClick={pullFromExistingCV}
                  className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:border-primary transition-colors p-4 text-center w-full disabled:opacity-50"
                >
                  {extracting ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-body text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" /> Reading your CV...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-display font-700 text-xs uppercase tracking-widest text-primary">Fill from my CV</span>
                      <span className="font-body text-[11px] text-muted-foreground">Use the CV already on your account</span>
                    </div>
                  )}
                </button>
                <label className="block">
                  <span className="font-body text-[11px] text-muted-foreground underline cursor-pointer hover:text-primary">Upload a different CV file</span>
                  <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" disabled={extracting} onChange={(e) => extractFromCV(e.target.files?.[0] || null)} />
                </label>
              </div>
            ) : (
              <label className="block">
                <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:border-primary transition-colors p-4 text-center cursor-pointer">
                  {extracting ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-body text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" /> Reading your CV...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-4 h-4 text-primary" />
                      <span className="font-display font-700 text-xs uppercase tracking-widest text-primary">Pull from CV</span>
                      <span className="font-body text-[11px] text-muted-foreground">Upload a PDF, DOC or DOCX and we'll fill this in for you</span>
                    </div>
                  )}
                  <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" disabled={extracting} onChange={(e) => extractFromCV(e.target.files?.[0] || null)} />
                </div>
              </label>
            )}
            {experience.length === 0 && (
              <p className="font-body text-xs text-muted-foreground italic">No work experience yet. Add one below or upload your CV.</p>
            )}
            {experience.map((w, i) => (
              <div key={w.id} className="rounded-2xl bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">#{i + 1}</span>
                  <button onClick={() => setExperience(experience.filter((x) => x.id !== w.id))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input placeholder="Company / employer" value={w.company} onChange={(e) => setExperience(experience.map((x) => x.id === w.id ? { ...x, company: e.target.value } : x))} className="font-body bg-background rounded-xl" />
                  <Input placeholder="Job title" value={w.title} onChange={(e) => setExperience(experience.map((x) => x.id === w.id ? { ...x, title: e.target.value } : x))} className="font-body bg-background rounded-xl" />
                  <Input placeholder="Dates (e.g. Jun 2022 – Aug 2023)" value={w.dates} onChange={(e) => setExperience(experience.map((x) => x.id === w.id ? { ...x, dates: e.target.value } : x))} className="font-body bg-background rounded-xl" />
                  <Input placeholder="Location (optional)" value={w.location} onChange={(e) => setExperience(experience.map((x) => x.id === w.id ? { ...x, location: e.target.value } : x))} className="font-body bg-background rounded-xl" />
                  <Textarea placeholder="What did you do? (1-2 sentences)" value={w.description} onChange={(e) => setExperience(experience.map((x) => x.id === w.id ? { ...x, description: e.target.value } : x))} className="font-body bg-background min-h-[60px] rounded-xl md:col-span-2" />
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center gap-3">
                      <LogoBubble name={w.company || "?"} url={w.link} size={40} />
                      <Input
                        placeholder="Company website (we'll use it for the logo)"
                        value={w.link || ""}
                        onChange={(e) => setExperience(experience.map((x) => x.id === w.id ? { ...x, link: e.target.value } : x))}
                        className="font-body bg-background rounded-xl flex-1"
                      />
                      <label className="shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => uploadLogoForExperience(w.id, e.target.files?.[0] || null)}
                        />
                        <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-body rounded-full border border-border bg-background hover:bg-muted cursor-pointer whitespace-nowrap">
                          <Upload className="w-3 h-3" /> Upload logo
                        </span>
                      </label>
                    </div>
                    <p className="font-body text-[11px] text-muted-foreground">
                      We try to find the logo automatically from the company name and website. If we can't, upload one (PNG/JPG/SVG, &lt;2MB).
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setExperience([...experience, { id: uid(), company: "", title: "", dates: "", location: "", description: "" }])} className="font-body text-xs gap-1 rounded-full">
                <Plus className="w-3 h-3" /> Add job
              </Button>
              <Button size="sm" variant="outline" onClick={pullFromExistingCV} disabled={extracting || !user} className="font-body text-xs gap-1 rounded-full">
                <Sparkles className="w-3 h-3" /> {extracting ? "Reading your CV…" : "Auto-fill from my CV"}
              </Button>
            </div>
          </Card>

          {/* Education */}
          <Card title="Education" icon={GraduationCap} delay={0.27}>
            <p className="font-body text-xs text-muted-foreground">
              Where you went to school, sixth-form, college or university. Add as many as you like.
            </p>
            {storedCvPath ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={extracting}
                  onClick={pullFromExistingCV}
                  className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:border-primary transition-colors p-4 text-center w-full disabled:opacity-50"
                >
                  {extracting ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-body text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" /> Reading your CV...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-display font-700 text-xs uppercase tracking-widest text-primary">Fill from my CV</span>
                      <span className="font-body text-[11px] text-muted-foreground">Use the CV already on your account</span>
                    </div>
                  )}
                </button>
                <label className="block">
                  <span className="font-body text-[11px] text-muted-foreground underline cursor-pointer hover:text-primary">Upload a different CV file</span>
                  <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" disabled={extracting} onChange={(e) => extractFromCV(e.target.files?.[0] || null)} />
                </label>
              </div>
            ) : (
              <label className="block">
                <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:border-primary transition-colors p-4 text-center cursor-pointer">
                  {extracting ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-body text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" /> Reading your CV...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-4 h-4 text-primary" />
                      <span className="font-display font-700 text-xs uppercase tracking-widest text-primary">Pull from CV</span>
                      <span className="font-body text-[11px] text-muted-foreground">Upload a PDF, DOC or DOCX and we'll fill this in for you</span>
                    </div>
                  )}
                  <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" disabled={extracting} onChange={(e) => extractFromCV(e.target.files?.[0] || null)} />
                </div>
              </label>
            )}
            {education.map((ed, i) => (
              <div key={ed.id} className="rounded-2xl bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">#{i + 1}</span>
                  {education.length > 1 && (
                    <button onClick={() => setEducation(education.filter((x) => x.id !== ed.id))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input placeholder="School / college / university" value={ed.school} onChange={(e) => setEducation(education.map((x) => x.id === ed.id ? { ...x, school: e.target.value } : x))} className="font-body bg-background rounded-xl md:col-span-2" />
                  <Input placeholder="Qualification (e.g. A-Levels, BA Economics)" value={ed.qualification} onChange={(e) => setEducation(education.map((x) => x.id === ed.id ? { ...x, qualification: e.target.value } : x))} className="font-body bg-background rounded-xl" />
                  <Input placeholder="Dates (e.g. 2019 – 2022)" value={ed.dates} onChange={(e) => setEducation(education.map((x) => x.id === ed.id ? { ...x, dates: e.target.value } : x))} className="font-body bg-background rounded-xl" />
                  <Input placeholder="Grade / result (optional)" value={ed.grade} onChange={(e) => setEducation(education.map((x) => x.id === ed.id ? { ...x, grade: e.target.value } : x))} className="font-body bg-background rounded-xl md:col-span-2" />
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center gap-3">
                      <LogoBubble name={ed.school || "?"} url={ed.link} size={40} />
                      <Input
                        placeholder="School website (e.g. https://www.ucl.ac.uk)"
                        value={ed.link || ""}
                        onChange={(e) => setEducation((prev) => prev.map((x) => x.id === ed.id ? { ...x, link: e.target.value } : x))}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && !/^https?:\/\//i.test(v)) {
                            setEducation((prev) => prev.map((x) => x.id === ed.id ? { ...x, link: `https://${v}` } : x));
                          }
                        }}
                        className="font-body bg-background rounded-xl flex-1"
                      />
                      <label className="shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => uploadLogoForEducation(ed.id, e.target.files?.[0] || null)}
                        />
                        <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-body rounded-full border border-border bg-background hover:bg-muted cursor-pointer whitespace-nowrap">
                          <Upload className="w-3 h-3" /> Upload logo
                        </span>
                      </label>
                    </div>
                    <p className="font-body text-[11px] text-muted-foreground">
                      Paste your school's website and we'll fetch the logo. Don't forget to hit <strong>Save profile</strong> below.
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEducation([...education, { id: uid(), school: "", qualification: "", dates: "", grade: "" }])} className="font-body text-xs gap-1 rounded-full">
                <Plus className="w-3 h-3" /> Add education
              </Button>
              <Button size="sm" variant="outline" onClick={pullFromExistingCV} disabled={extracting || !user} className="font-body text-xs gap-1 rounded-full">
                <Sparkles className="w-3 h-3" /> {extracting ? "Reading your CV…" : "Auto-fill from my CV"}
              </Button>
            </div>
          </Card>

          {/* Qualifications */}
          <Card title="Qualifications & Certifications" icon={Award} delay={0.28}>
            <p className="font-body text-xs text-muted-foreground">
              Standalone certifications, licences or short courses (e.g. First Aid, Driving Licence, AWS Certified).
            </p>
            {qualifications.map((q, i) => (
              <div key={q.id} className="rounded-2xl bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">#{i + 1}</span>
                  <button onClick={() => setQualifications(qualifications.filter((x) => x.id !== q.id))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Input placeholder="Name" value={q.name} onChange={(e) => setQualifications(qualifications.map((x) => x.id === q.id ? { ...x, name: e.target.value } : x))} className="font-body bg-background rounded-xl md:col-span-2" />
                  <Input placeholder="Year" value={q.year} onChange={(e) => setQualifications(qualifications.map((x) => x.id === q.id ? { ...x, year: e.target.value } : x))} className="font-body bg-background rounded-xl" />
                  <Input placeholder="Issuer / awarding body" value={q.issuer} onChange={(e) => setQualifications(qualifications.map((x) => x.id === q.id ? { ...x, issuer: e.target.value } : x))} className="font-body bg-background rounded-xl md:col-span-3" />
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setQualifications([...qualifications, { id: uid(), name: "", issuer: "", year: "" }])} className="font-body text-xs gap-1 rounded-full">
              <Plus className="w-3 h-3" /> Add qualification
            </Button>
          </Card>

          {/* Prompts */}
          <Card title="Personality Prompts" icon={Heart} delay={0.3}>
            <div className="grid gap-3">
              {PROMPTS.map((q) => (
                <div key={q} className="rounded-2xl bg-primary/5 border border-primary/20 p-4 space-y-2">
                  <p className="font-display font-700 text-sm text-foreground">{q}</p>
                  <Textarea
                    placeholder="Type your answer..."
                    value={promptAnswers[q] || ""}
                    onChange={(e) => setPromptAnswers({ ...promptAnswers, [q]: e.target.value })}
                    className="font-body bg-background min-h-[60px] rounded-xl"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* RIASEC + Values from onboarding */}
          {(riasecScores || workValues) && (
            <Card title="From your onboarding" icon={Sparkles} delay={0.35}>
              <p className="font-body text-xs text-muted-foreground">
                Pulled from your personality quiz. Update these by re-running
                onboarding from your profile.
              </p>
              {workValues && (
                <div>
                  <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">What I value at work</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(workValues)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([k, v]) => (
                        <Badge key={k} variant="secondary" className="rounded-full text-xs font-body capitalize">
                          {k} · {Math.round(v as number)}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <div className="flex flex-wrap gap-3 print:hidden">
            <Button onClick={saveProfile} disabled={saving || !user} className="font-body gap-2 rounded-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? "Saving…" : "Save profile"}
            </Button>
            <Button variant="outline" onClick={previewProfile} disabled={generatingPdf} className="font-body gap-2 rounded-full">
              {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              {generatingPdf ? "Building…" : "Preview CV"}
            </Button>
            <Button variant="outline" onClick={downloadPdf} disabled={generatingPdf} className="font-body gap-2 rounded-full">
              {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
            </Button>
            <Button variant="outline" onClick={downloadWord} className="font-body gap-2 rounded-full">
              <Download className="w-4 h-4" /> Download Word
            </Button>
            <Button variant="outline" onClick={emailProfile} disabled={emailing || !user} className="font-body gap-2 rounded-full">
              {emailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Email me a copy
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAts(v => !v)}
              className="font-body gap-2 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Sparkles className="w-4 h-4" /> ATS CV Generator
            </Button>
            <Button
              variant="outline"
              onClick={scoreCv}
              disabled={scoringCv}
              className="font-body gap-2 rounded-full border-foreground hover:bg-foreground hover:text-background"
            >
              {scoringCv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              {scoringCv ? "Scoring…" : "Score my CV"}
            </Button>
          </div>

          {/* CV Score Panel */}
          {cvScore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-foreground rounded-2xl p-5 bg-background"
            >
              <div className="flex items-start gap-5">
                {/* Score circle */}
                <div className={`shrink-0 w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${
                  cvScore.score >= 80 ? "border-primary bg-primary/10" :
                  cvScore.score >= 65 ? "border-blue-400 bg-blue-50" :
                  cvScore.score >= 50 ? "border-yellow-400 bg-yellow-50" :
                  "border-red-400 bg-red-50"
                }`}>
                  <span className="font-display font-900 text-2xl leading-none">{cvScore.score}</span>
                  <span className="font-display font-700 text-xs text-muted-foreground">/100</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display font-900 text-base uppercase tracking-wide">CV Score — Grade {cvScore.grade}</h3>
                    <span className={`font-display font-700 text-xs px-2 py-0.5 rounded-full border ${
                      cvScore.score >= 80 ? "border-primary text-primary bg-primary/10" :
                      cvScore.score >= 65 ? "border-blue-400 text-blue-600 bg-blue-50" :
                      cvScore.score >= 50 ? "border-yellow-400 text-yellow-700 bg-yellow-50" :
                      "border-red-400 text-red-600 bg-red-50"
                    }`}>
                      {cvScore.score >= 80 ? "Strong" : cvScore.score >= 65 ? "Good" : cvScore.score >= 50 ? "Fair" : "Needs work"}
                    </span>
                  </div>
                  {cvScore.suggestions.length > 0 && (
                    <div>
                      <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Suggestions to improve</p>
                      <ul className="space-y-1.5">
                        {cvScore.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 font-body text-xs">
                            <span className="shrink-0 w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-700 text-[10px] mt-0.5">{i + 1}</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ATS CV Panel */}
          {showAts && (
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 space-y-4 print:hidden">
              <div>
                <p className="font-display font-700 text-sm mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> ATS CV Generator
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Most job portals use AI to scan CVs for keywords before a human sees them. Paste the job description below and we'll generate a plain-text CV tailored to pass the filter.
                </p>
              </div>
              <textarea
                className="w-full min-h-[120px] rounded-xl border border-border bg-background p-3 font-body text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Paste the full job description here…"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />
              <Button onClick={generateAtsCv} disabled={generatingAts || !user} className="font-body gap-2 rounded-full">
                {generatingAts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generatingAts ? "Generating…" : "Generate ATS CV"}
              </Button>

              {atsResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-display font-700">
                      ATS Score: {atsResult.score}%
                    </span>
                    <span className="font-body text-xs text-muted-foreground">
                      Keywords matched: {atsResult.keywords.slice(0, 5).join(", ")}
                      {atsResult.keywords.length > 5 ? ` +${atsResult.keywords.length - 5} more` : ""}
                    </span>
                  </div>
                  <pre className="w-full min-h-[200px] max-h-[400px] overflow-y-auto rounded-xl border border-border bg-background p-3 font-body text-xs whitespace-pre-wrap">
                    {atsResult.cvText}
                  </pre>
                  <Button variant="outline" onClick={downloadAtsTxt} className="font-body gap-2 rounded-full">
                    <Download className="w-4 h-4" /> Download as .txt
                  </Button>
                  <p className="font-body text-[11px] text-muted-foreground">
                    ⚠️ Your visual PDF is for human readers. Use this plain-text version when applying through an online job portal or ATS system.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Preview ── */}
        <div className="lg:sticky lg:top-8 lg:self-start" ref={previewRef}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="profile-preview-card rounded-3xl border border-border bg-card overflow-hidden shadow-[0_2px_0_0_hsl(var(--border)),0_20px_50px_-20px_hsl(var(--foreground)/0.15)] print:shadow-none print:border-0"
            data-profile-preview
          >
            <style>{`
              @media print {
                @page { size: A4; margin: 10mm; }
                html, body { background: #fff !important; }
                .profile-preview-card { break-inside: avoid; }
                .profile-preview-card section,
                .profile-preview-card > div > div,
                .profile-preview-card h2,
                .profile-preview-card h4,
                .profile-preview-card ul,
                .profile-preview-card li,
                .profile-preview-card p,
                .profile-preview-card .rounded-2xl,
                .profile-preview-card .badge,
                .profile-preview-card [data-keep] {
                  break-inside: avoid;
                  page-break-inside: avoid;
                }
                .profile-preview-card h2,
                .profile-preview-card h4 { break-after: avoid; page-break-after: avoid; }
                .profile-preview-card .p-6 { padding: 12px !important; }
                .profile-preview-card .space-y-5 > * + * { margin-top: 10px !important; }
                .profile-preview-card [data-pdf-hide] { display: none !important; }
                .print\\:hidden { display: none !important; }
              }
            `}</style>
            {/* Header band */}
            <div className="bg-primary/10 p-6 relative">
              <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-display font-700 uppercase tracking-widest text-primary">
                <Sparkles className="w-3 h-3" /> How Do You Do
              </div>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-background border-4 border-background overflow-hidden shrink-0 shadow-md">
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-2xl font-800 text-foreground leading-tight">
                    {fullName || "Your name"}
                  </h2>
                  {location && (
                    <p className="text-xs font-body text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {location}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground font-body mt-1">
                    {email && <span>{email}</span>}
                    {phone && <span>{phone}</span>}
                    {homeAddress && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{homeAddress}</span>}
                    {personalLink && <a href={personalLink} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{personalLink}</a>}
                  </div>
                </div>
              </div>

              {lookingForTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {lookingForTags.map((t) => (
                    <Badge key={t} className="bg-primary text-primary-foreground rounded-full text-xs">
                      Looking for: {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* Video - hidden in PDF; only shown in preview + emailed copy */}
              <div data-pdf-hide>
                <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Video intro
                </h4>
                {videoUrl ? (
                  <video src={videoUrl} controls className="w-full rounded-2xl bg-black" />
                ) : (
                  <div className="rounded-2xl bg-muted aspect-video flex items-center justify-center text-xs font-body text-muted-foreground">
                    Video intro will appear here
                  </div>
                )}
              </div>

              {intro && (
                <p className="font-body text-sm text-foreground leading-relaxed">{intro}</p>
              )}

              {/* What I love */}
              {passions.trim() && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" /> What I love
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {passions.split(",").map((p) => p.trim()).filter(Boolean).map((p) => (
                      <Badge key={p} variant="secondary" className="rounded-full text-xs font-body">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry interests */}
              {interests.trim() && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Industry interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.split(",").map((p) => p.trim()).filter(Boolean).map((p) => (
                      <Badge key={p} variant="outline" className="rounded-full text-xs font-body">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {allSkills.length > 0 && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allSkills.map((s) => (
                      <Badge key={s} variant="secondary" className="rounded-full text-xs font-body">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Things */}
              {things.some((t) => t.title) && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Things I've done</h4>
                  <div className="space-y-3">
                    {things.filter((t) => t.title).map((t) => (
                      <div key={t.id} className="rounded-2xl bg-muted/40 p-3 flex gap-3 items-start">
                        <LogoBubble name={t.title} url={t.link} size={44} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            {t.link ? (
                              <a href={t.link.startsWith("http") ? t.link : `https://${t.link}`} target="_blank" rel="noreferrer" className="font-display font-700 text-sm text-foreground hover:text-primary underline decoration-primary/40 underline-offset-2 truncate">
                                {t.title}
                              </a>
                            ) : (
                              <span className="font-display font-700 text-sm text-foreground truncate">{t.title}</span>
                            )}
                            <Badge variant="outline" className="rounded-full text-[10px]">{t.kind}</Badge>
                          </div>
                          {t.when && <p className="text-[11px] text-muted-foreground font-body">{t.when}</p>}
                          {t.description && <p className="text-xs text-foreground font-body mt-1 leading-relaxed">{t.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {experience.some((w) => w.company || w.title) && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Where I've worked
                  </h4>
                  <div className="space-y-2">
                    {experience.filter((w) => w.company || w.title).map((w) => {
                      const label = w.title && w.company ? `${w.title} · ${w.company}` : (w.title || w.company);
                      const href = w.link?.trim()
                        ? (w.link.startsWith("http") ? w.link : `https://${w.link}`)
                        : (w.company ? `https://www.google.com/search?q=${encodeURIComponent(w.company)}` : null);
                      return (
                        <div key={w.id} className="rounded-2xl bg-muted/40 p-3 flex gap-3 items-start">
                          <LogoBubble name={w.company || w.title} url={w.link} size={44} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              {href ? (
                                <a href={href} target="_blank" rel="noreferrer" className="font-display font-700 text-sm text-foreground hover:text-primary underline decoration-primary/40 underline-offset-2 truncate">
                                  {label}
                                </a>
                              ) : (
                                <span className="font-display font-700 text-sm text-foreground truncate">{label}</span>
                              )}
                              {w.dates && <span className="text-[11px] text-muted-foreground font-body shrink-0">{w.dates}</span>}
                            </div>
                            {w.location && <p className="text-[11px] text-muted-foreground font-body mt-0.5">{w.location}</p>}
                            {w.description && <p className="text-xs text-foreground font-body mt-1 leading-relaxed">{w.description}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.some((e) => e.school || e.qualification) && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Education
                  </h4>
                  <div className="space-y-2">
                    {education.filter((e) => e.school || e.qualification).map((e) => {
                      const label = e.school || e.qualification;
                      const href = e.link?.trim()
                        ? (e.link.startsWith("http") ? e.link : `https://${e.link}`)
                        : (e.school ? `https://www.google.com/search?q=${encodeURIComponent(e.school)}` : null);
                      return (
                        <div key={e.id} className="rounded-2xl bg-muted/40 p-3 flex gap-3 items-start">
                          <LogoBubble name={e.school || e.qualification} url={e.link} size={44} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              {href ? (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-display font-700 text-sm text-foreground hover:text-primary underline decoration-primary/40 underline-offset-2 truncate"
                                >
                                  {label}
                                </a>
                              ) : (
                                <span className="font-display font-700 text-sm text-foreground truncate">{label}</span>
                              )}
                              {e.dates && <span className="text-[11px] text-muted-foreground font-body shrink-0">{e.dates}</span>}
                            </div>
                            {e.school && e.qualification && (
                              <p className="text-xs text-foreground font-body mt-0.5">{e.qualification}</p>
                            )}
                            {e.grade && <p className="text-[11px] text-muted-foreground font-body mt-0.5">{e.grade}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {qualifications.length > 0 && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Qualifications
                  </h4>
                  <ul className="space-y-1">
                    {qualifications.map((q) => (
                      <li key={q.id} className="text-sm font-body text-foreground flex flex-wrap items-baseline gap-x-2">
                        <span className="font-display font-700">{q.name}</span>
                        {q.issuer && <span className="text-xs text-muted-foreground">· {q.issuer}</span>}
                        {q.year && <span className="text-[11px] text-muted-foreground">({q.year})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overview */}
              {aiOverview && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Overview
                  </h4>
                  <p className="font-body text-sm text-foreground leading-relaxed bg-primary/5 border border-primary/20 rounded-2xl p-3">{aiOverview}</p>
                </div>
              )}

              {/* RIASEC */}
              {riasecScores && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Personality (RIASEC)</h4>
                  <div className="space-y-1.5">
                    {(["R","I","A","S","E","C"] as const).map((k) => {
                      const labels: Record<string, string> = { R: "Realistic", I: "Investigative", A: "Artistic", S: "Social", E: "Enterprising", C: "Conventional" };
                      const v = Math.round(((riasecScores as any)[k] ?? 0));
                      return (
                        <div key={k} className="flex items-center gap-2">
                          <span className="font-body text-xs w-24 text-muted-foreground">{labels[k]}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                          </div>
                          <span className="font-body text-[11px] w-7 text-right text-foreground">{v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Work values */}
              {workValues && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">What I value at work</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(workValues)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([k, v]) => (
                        <Badge key={k} variant="secondary" className="rounded-full text-xs font-body capitalize">
                          {k} · {Math.round(v as number)}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* Prompts */}
              {Object.values(promptAnswers).some((v) => v?.trim()) && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">In my own words</h4>
                  <div className="space-y-2">
                    {PROMPTS.filter((q) => promptAnswers[q]?.trim()).map((q) => (
                      <div key={q} className="rounded-2xl bg-primary/5 border border-primary/20 p-3">
                        <p className="font-display font-700 text-xs text-primary mb-1">{q}</p>
                        <p className="font-body text-sm text-foreground leading-relaxed">{promptAnswers[q]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proofs */}
              {proofs.length > 0 && (
                <div>
                  <h4 className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-2">Proof & uploads</h4>
                  {/* Image gallery */}
                  {proofs.some((p) => isImageUrl(p.url)) && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {proofs.filter((p) => isImageUrl(p.url)).map((p) => (
                        <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="block group">
                          <img
                            src={p.url}
                            alt={p.label}
                            loading="lazy"
                            className="w-full aspect-square object-cover rounded-xl border border-border group-hover:opacity-90 transition-opacity"
                          />
                          <p className="text-[10px] font-body text-muted-foreground mt-1 truncate">{p.label}</p>
                        </a>
                      ))}
                    </div>
                  )}
                  {/* Link list with favicons */}
                  {proofs.some((p) => !isImageUrl(p.url)) && (
                    <ul className="space-y-1.5">
                      {proofs.filter((p) => !isImageUrl(p.url)).map((p) => (
                        <li key={p.id} className="flex items-center gap-2">
                          <LogoBubble name={p.label} url={p.url} size={28} />
                          <a href={p.url} target="_blank" rel="noreferrer" className="text-sm font-body text-primary hover:underline truncate">
                            {p.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;
