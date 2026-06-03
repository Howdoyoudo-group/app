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
import html2canvas from "html2canvas";

type Thing = { id: string; title: string; kind: string; when: string; description: string; link?: string };
type Proof = { id: string; label: string; url: string };
type Education = { id: string; school: string; qualification: string; dates: string; grade: string; link?: string };
type Qualification = { id: string; name: string; issuer: string; year: string };
type WorkExperience = { id: string; company: string; title: string; dates: string; location: string; description: string; link?: string };

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
        const savedCvInput = ((um as any)?._inputData && typeof (um as any)._inputData === "object")
          ? (um as any)._inputData
          : (jp.understandMe || {});
        const existingCvPath = typeof savedCvInput.cvFilePath === "string" && savedCvInput.cvFilePath
          ? savedCvInput.cvFilePath
          : typeof savedCvInput.cvPath === "string" && savedCvInput.cvPath
            ? savedCvInput.cvPath
            : null;
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
        const { data, error: fnErr } = await supabase.functions.invoke("extract-cv-education", { body: { filePath } });
        if (cancelled || fnErr || !data?.success) return;
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

  const buildPdf = async (): Promise<jsPDF | null> => {
    const el = previewRef.current?.querySelector("[data-profile-preview]") as HTMLElement | null;
    if (!el) {
      toast.error("Preview not ready yet.");
      return null;
    }

    // Hide elements marked data-pdf-hide (e.g. video intro) during capture.
    const hidden = Array.from(el.querySelectorAll<HTMLElement>("[data-pdf-hide]"));
    const prevDisplay = hidden.map((h) => h.style.display);
    hidden.forEach((h) => { h.style.display = "none"; });

    let canvas;
    try {
      // Capture the element's full scroll height - sticky/scaled containers can
      // otherwise crop the canvas to the viewport, which truncates the PDF.
      const fullHeight = Math.max(el.scrollHeight, el.offsetHeight, el.clientHeight);
      const fullWidth = Math.max(el.scrollWidth, el.offsetWidth, el.clientWidth);

      canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
        width: fullWidth,
        height: fullHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
      });
    } finally {
      hidden.forEach((h, i) => { h.style.display = prevDisplay[i]; });
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210; // mm
    const pageHeight = 297; // mm

    // Slice the canvas into A4-sized chunks so each page is a fresh image
    // - this keeps content from rendering off-page and avoids the single-image
    // overflow approach that was hiding later sections.
    const pxPerMm = canvas.width / pageWidth;
    const pageHeightPx = Math.floor(pageHeight * pxPerMm);

    let renderedPx = 0;
    let pageIndex = 0;
    while (renderedPx < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedPx);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext("2d");
      if (!ctx) break;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(
        canvas,
        0, renderedPx, canvas.width, sliceHeight,
        0, 0, canvas.width, sliceHeight,
      );
      const sliceImg = sliceCanvas.toDataURL("image/jpeg", 0.92);
      const sliceHeightMm = sliceHeight / pxPerMm;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(sliceImg, "JPEG", 0, 0, pageWidth, sliceHeightMm);
      renderedPx += sliceHeight;
      pageIndex += 1;
    }

    return pdf;
  };

  const previewProfile = () => {
    const el = previewRef.current?.querySelector("[data-profile-preview]") as HTMLElement | null;
    if (!el) {
      toast.error("Preview not ready yet.");
      return;
    }

    // On mobile (or anywhere a popup would be blocked), scroll the inline preview into view.
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.success("Scroll down - your profile preview is below.");
      return;
    }

    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) {
      // Popup blocked on desktop - fall back to scrolling to the inline preview.
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      toast.message("Popups are blocked - showing the inline preview instead.");
      return;
    }
    try {
      // Clone all stylesheets and <style> tags so the preview window matches the app exactly.
      const styles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((n) => n.outerHTML)
        .join("\n");

      const title = `${fullName || "Profile"} - Preview`;
      const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title.replace(/[<>&]/g, "")}</title>
  ${styles}
  <style>
    html, body { background: hsl(var(--background, 0 0% 100%)); margin: 0; }
    body { padding: 24px; display: flex; justify-content: center; }
    .preview-shell { width: 100%; max-width: 880px; }
    [data-pdf-hide] { } /* keep video etc visible in preview */
  </style>
</head>
<body>
  <div class="preview-shell">${el.outerHTML}</div>
</body>
</html>`;
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (err) {
      console.error(err);
      win.close();
      toast.error("Could not open preview.");
    }
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
      const { data, error } = await supabase.functions.invoke("extract-cv-education", { body: { filePath: path } });
      if (error || !data?.success) {
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
      const { data, error: fnErr } = await supabase.functions.invoke("extract-cv-education", { body: { filePath } });
      if (fnErr) {
        console.error("Edge function error:", fnErr);
        toast.error("Could not read your CV. Try uploading it again.");
        return;
      }
      if (!data?.success) {
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
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  disabled={extracting}
                  onChange={(e) => extractFromCV(e.target.files?.[0] || null)}
                />
              </div>
            </label>
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
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  disabled={extracting}
                  onChange={(e) => extractFromCV(e.target.files?.[0] || null)}
                />
              </div>
            </label>
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
            <Button variant="outline" onClick={previewProfile} className="font-body gap-2 rounded-full">
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button variant="outline" onClick={downloadPdf} disabled={generatingPdf} className="font-body gap-2 rounded-full">
              {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Save as PDF
            </Button>
            <Button variant="outline" onClick={emailProfile} disabled={emailing || !user} className="font-body gap-2 rounded-full">
              {emailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Email me a copy
            </Button>
          </div>
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
