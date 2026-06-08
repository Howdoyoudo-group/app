import React, { useEffect, useState, useRef } from "react";
import SiteNav from "@/components/SiteNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight, Briefcase, MapPin, Zap, LogOut, Save, User, Loader2, Inbox, Target, Sparkles,
  CheckCircle2, Circle, Upload, LinkIcon, ClipboardPaste, Heart, Building2, X, Mail, MailX,
  ChevronDown, Pencil, Eye, Camera, Quote, GraduationCap, Award, Plus, Trash2, Video, Calendar,
  Pin, PinOff, Share2, Download, Printer, Phone, Home,
} from "lucide-react";
import PrintableProfileGenerator from "@/components/profile/PrintableProfileGenerator";
import LovesGallery, { LovePhoto } from "@/components/profile/LovesGallery";
import FamilyPetsGallery, { FamilyPhoto } from "@/components/profile/FamilyPetsGallery";
import FunFactsEditor from "@/components/profile/FunFactsEditor";
import LogoUploader from "@/components/profile/LogoUploader";
import WhatsAppOptIn from "@/components/profile/WhatsAppOptIn";
import RiasecHexagon from "@/components/profile/RiasecHexagon";
import UnderstandMe from "@/components/UnderstandMe";
import YourBadges from "@/components/YourBadges";
import RiasecQuiz, { RiasecScores, WorkValues } from "@/components/RiasecQuiz";
import { roles } from "@/data/roles";
import { CAREER_MAP_ROLES } from "@/data/career-map-roles";
import { WHO_COMPANIES } from "@/data/who-companies";

const PASSION_TAGS = [
  "Tennis", "Football", "Golf", "Running", "Cycling", "Yoga", "Swimming", "Skiing", "Surfing",
  "Climbing", "Hiking", "Sailing", "Horses", "Music", "Live gigs", "DJing", "Vinyl", "Guitar", "Piano",
  "Cooking", "Baking", "Wine", "Chocolate", "Coffee culture", "Restaurants", "Travel", "Photography",
  "Film", "TV series", "Reading", "Writing", "Podcasts", "Gaming", "Tech",
  "Fashion", "Art", "Design", "Architecture", "Dance", "Theatre", "Comedy",
  "Volunteering", "Animals", "Gardening", "Sustainability", "Cars", "Motorbikes", "Motor racing",
];

const INDUSTRIES = [
  "Bakery", "Beauty", "Beer", "Cars", "Charity", "Coffee", "Estate Agency",
  "Farming", "Fashion", "Film and TV", "Food & Drink", "Football", "Footwear",
  "Formula 1", "Gaming", "Grocery", "Health", "Horse Racing", "Influencing",
  "Interior Design", "Jewellery", "Journalism", "Money", "Music", "Pets",
  "Physiotherapy", "Psychotherapy", "Teaching", "Travel", "Wellness",
];

const ROLE_OPTIONS = roles.map((r) => r.title);

interface UnderstandMeResult {
  roleMatches?: { role: string; slug: string; percentage: number; reason: string }[];
  industryFit?: { industry: string; confidence: number; reason: string }[];
  transferableSkills?: string[];
  personalityInsights?: string;
  suggestedNextSteps?: { action: string; link: string; type: string }[];
}

type WorkItem = { id: string; title: string; company?: string; link?: string; logoUrl?: string; kind: string; when: string; description: string };
type EducationItem = { id: string; school: string; qualification: string; dates: string; grade: string; link?: string; logoUrl?: string };
type QualificationItem = { id: string; name: string; issuer: string; year: string };

const uid = () => Math.random().toString(36).slice(2, 10);

// Try to derive a domain we can fetch a favicon from.
const domainFromLink = (link?: string): string | null => {
  if (!link) return null;
  try {
    const url = new URL(link.startsWith("http") ? link : `https://${link}`);
    return url.hostname.replace(/^www\./, "");
  } catch { return null; }
};
const guessDomain = (name?: string): string | null => {
  if (!name) return null;
  const slug = name.toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(ltd|limited|plc|inc|llc|the|and|co|company|group)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "");
  if (!slug) return null;
  if (/(university|college|school|academy|institute)/i.test(name)) {
    const eduSlug = name.toLowerCase().replace(/\b(university|college|school|academy|institute|of|the)\b/g, "").replace(/[^a-z0-9]+/g, "");
    return eduSlug ? `${eduSlug}.ac.uk` : `${slug}.com`;
  }
  return `${slug}.com`;
};
const LogoBubble: React.FC<{ name?: string; link?: string; logoUrl?: string; size?: number; rounded?: string }> = ({ name, link, logoUrl, size = 44, rounded = "rounded-2xl" }) => {
  const domain = domainFromLink(link) || guessDomain(name);
  const initials = (name || "?").split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  // Manual logo URL (user-pasted) takes priority, then Clearbit, DuckDuckGo, Google.
  const sources = [
    ...(logoUrl ? [logoUrl] : []),
    ...(domain
      ? [
          `https://logo.clearbit.com/${domain}`,
          `https://icons.duckduckgo.com/ip3/${domain}.ico`,
          `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        ]
      : []),
  ];
  const [idx, setIdx] = useState(0);
  const sourcesKey = sources.join("|");
  useEffect(() => { setIdx(0); }, [sourcesKey]);
  if (sources.length === 0 || idx >= sources.length) {
    return (
      <div
        className={`${rounded} bg-foreground text-background flex items-center justify-center font-display font-800 shrink-0`}
        style={{ width: size, height: size, fontSize: size * 0.36 }}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={sources[idx]}
      alt={`${name || ""} logo`}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setIdx((i) => i + 1)}
      className={`${rounded} bg-background border border-foreground/10 object-contain p-1 shrink-0`}
      style={{ width: size, height: size }}
    />
  );
};

// Tokens
const cardBase =
  "bg-card border-2 border-foreground rounded-3xl p-5 md:p-6 shadow-[4px_4px_0_hsl(var(--foreground))]";
const eyebrowCls =
  "font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary mb-1";
const titleCls = "font-display font-800 text-lg md:text-xl text-foreground leading-tight";
const inputBase =
  "w-full border border-border bg-background rounded-2xl px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition placeholder:text-muted-foreground/50";
const fieldLabel =
  "font-display text-[11px] font-600 uppercase tracking-[0.14em] text-muted-foreground mb-1.5 flex items-center gap-1.5";

const PB_PROMPTS = [
  "What are you proud of?",
  "What gives you energy?",
  "What do people come to you for?",
  "What kind of team do you work best in?",
];

const normaliseUrl = (v: string, prefix?: string) => {
  const s = (v || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (prefix) return `${prefix}${s.replace(/^@/, "")}`;
  return `https://${s.replace(/^@/, "")}`;
};
const chipBase = "px-3 py-1.5 font-display text-xs font-600 border rounded-full transition-colors";
const chipIdle = "border-border text-foreground hover:border-primary hover:text-primary";
const chipSelected = "bg-primary text-primary-foreground border-primary";
const chipDark = "bg-foreground text-background border-foreground";

// Pastel skill chip colours rotated through the list (Vizzy-style)
const SKILL_COLOURS = [
  "bg-yellow-200 text-foreground border-foreground",
  "bg-blue-200 text-foreground border-foreground",
  "bg-pink-200 text-foreground border-foreground",
  "bg-green-200 text-foreground border-foreground",
  "bg-orange-200 text-foreground border-foreground",
  "bg-purple-200 text-foreground border-foreground",
];

const CollapsibleEdit = ({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="bg-card border border-border rounded-2xl p-4 md:p-5 mb-3 group"
    >
      <summary className="list-none cursor-pointer flex items-center justify-between">
        <span className="font-display font-700 text-sm uppercase tracking-wider text-foreground">
          {title}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
};

const MyProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const understandMeRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [homeTown, setHomeTown] = useState("");
  const [homeTownBlurb, setHomeTownBlurb] = useState("");
  const [lookingUpTown, setLookingUpTown] = useState(false);
  const [careerLevel, setCareerLevel] = useState("");
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [industryInterests, setIndustryInterests] = useState<string[]>([]);
  const [newsletterIndustries, setNewsletterIndustries] = useState<string[]>([]);
  const [rolePreferences, setRolePreferences] = useState<string[]>([]);
  const [employerVisibilityOptIn, setEmployerVisibilityOptIn] = useState(false);
  const [memberDirectoryOptIn, setMemberDirectoryOptIn] = useState(true);
  const [acceptMessages, setAcceptMessages] = useState(true);
  const [shareDetailsDefault, setShareDetailsDefault] = useState(false);
  const [mentorOptIn, setMentorOptIn] = useState(false);
  const [mentorBio, setMentorBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showUnderstandMe, setShowUnderstandMe] = useState(false);
  const [results, setResults] = useState<UnderstandMeResult | null>(null);
  const [riasecScores, setRiasecScores] = useState<RiasecScores | null>(null);
  const [savedWorkValues, setSavedWorkValues] = useState<WorkValues | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const [linkedinScreenshotName, setLinkedinScreenshotName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string | null>(null);
  const [passions, setPassions] = useState<string[]>([]);
  const [passionsText, setPassionsText] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [tagline, setTagline] = useState("");
  const [lovePhotos, setLovePhotos] = useState<LovePhoto[]>([]);
  const [familyPhotos, setFamilyPhotos] = useState<FamilyPhoto[]>([]);
  const [funFacts, setFunFacts] = useState<{ q: string; a: string }[]>([]);
  const [workHistory, setWorkHistory] = useState<WorkItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [qualifications, setQualifications] = useState<QualificationItem[]>([]);
  const [introVideoUrl, setIntroVideoUrl] = useState<string>("");
  const [pbIntro, setPbIntro] = useState("");
  const [pbLookingFor, setPbLookingFor] = useState("");
  const [pbInstagram, setPbInstagram] = useState("");
  const [pbTiktok, setPbTiktok] = useState("");
  const [pbPortfolio, setPbPortfolio] = useState("");
  const [pbPersonalLink, setPbPersonalLink] = useState("");
  const [pbPromptAnswers, setPbPromptAnswers] = useState<Record<string, string>>({});
  const [showExport, setShowExport] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!user) { setIsPremium(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      setIsPremium((data ?? []).some((r: any) => r.role === "premium" || r.role === "admin"));
    })();
    return () => { cancelled = true; };
  }, [user]);


  // Pin/unpin sections to control what shows on the shareable PDF / printable profile
  const SECTION_LABELS: Record<string, string> = {
    riasec: "How you're wired (RIASEC)",
    values: "What you want from work",
    loves: "Things I'm obsessed with",
    qa: "Things you don't know about me",
    family: "Family & pets",
    skills: "What I love doing",
    industries: "Industries I follow",
    story: "Your story",
    prompts: "In your words",
    hitlist: "Most wanted",
    employment: "Where I've worked",
    education: "Education",
    qualifications: "Qualifications, Awards, Prizes",
    video: "Intro video",
    about: "About you, by us",
    roles: "Top role matches",
  };
  const SECTION_KEYS = Object.keys(SECTION_LABELS);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTION_KEYS.map((k) => [k, true]))
  );
  const togglePin = (k: string) =>
    setVisibleSections((v) => ({ ...v, [k]: v[k] === false ? true : false }));
  const sectionWrap = (k: string) =>
    `relative ${visibleSections[k] === false ? "opacity-40 hover:opacity-100 transition-opacity export-hidden" : ""}`;
  const SectionPin: React.FC<{ k: string }> = ({ k }) => {
    const on = visibleSections[k] !== false;
    return (
      <button
        type="button"
        onClick={() => togglePin(k)}
        title={on ? "Pinned - included in your shareable profile. Click to hide." : "Hidden from shareable profile. Click to pin."}
        aria-label={on ? "Hide section from shareable profile" : "Pin section to shareable profile"}
        className={`no-print absolute top-2 right-2 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-foreground"}`}
      >
        {on ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
      </button>
    );
  };
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [companyInput, setCompanyInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [allCompanies, setAllCompanies] = useState<string[]>([]);
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);

  // CV / LinkedIn import
  const [extracting, setExtracting] = useState(false);
  const [linkedinImportUrl, setLinkedinImportUrl] = useState("");
  const [importingLinkedin, setImportingLinkedin] = useState(false);
  const cvFileInputRef = useRef<HTMLInputElement | null>(null);

  const isCvFileName = (name: string) => /\.(pdf|docx?|txt|rtf|odt|pages)$/i.test(name);

  const findExistingCvPath = async (): Promise<string | null> => {
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("job_preferences, understand_me_results")
      .eq("id", user.id)
      .maybeSingle();
    const jp: any = (profile as any)?.job_preferences || {};
    const um: any = (profile as any)?.understand_me_results || {};
    const savedInput = um?._inputData || jp.understandMe || {};
    const savedPath: string | undefined = savedInput.cvFilePath || savedInput.cvPath;
    if (savedPath && isCvFileName(savedPath)) return savedPath;
    const { data } = await supabase.storage.from("cv-uploads").list(user.id, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });
    const latest = (data || []).find((f) => isCvFileName(f.name));
    return latest ? `${user.id}/${latest.name}` : null;
  };

  const mergeImported = (incoming: { education?: any[]; qualifications?: any[]; experience?: any[] }) => {
    const newEd: EducationItem[] = (incoming.education || []).map((e: any) => ({
      id: uid(), school: e.school || "", qualification: e.qualification || "", dates: e.dates || "", grade: e.grade || "", link: e.link || "", logoUrl: e.logoUrl || "",
    })).filter((e) => e.school || e.qualification);
    const newQ: QualificationItem[] = (incoming.qualifications || []).map((q: any) => ({
      id: uid(), name: q.name || "", issuer: q.issuer || "", year: q.year || "",
    })).filter((q) => q.name);
    const newW: WorkItem[] = (incoming.experience || []).map((w: any) => ({
      id: uid(), title: w.title || "", company: w.company || "", link: w.link || "", logoUrl: w.logoUrl || "", kind: "Role", when: w.dates || "", description: w.description || "",
    })).filter((w) => w.title || w.company);

    if (newEd.length) {
      setEducation((prev) => {
        const seen = new Set(prev.map((e) => `${e.school?.toLowerCase()}|${e.qualification?.toLowerCase()}`));
        return [...prev, ...newEd.filter((e) => !seen.has(`${e.school?.toLowerCase()}|${e.qualification?.toLowerCase()}`))];
      });
    }
    if (newQ.length) {
      setQualifications((prev) => {
        const seen = new Set(prev.map((q) => q.name?.toLowerCase()));
        return [...prev, ...newQ.filter((q) => !seen.has(q.name?.toLowerCase()))];
      });
    }
    if (newW.length) {
      setWorkHistory((prev) => {
        const seen = new Set(prev.map((w) => `${(w.title || "").toLowerCase()}|${(w.company || "").toLowerCase()}`));
        return [...prev, ...newW.filter((w) => !seen.has(`${(w.title || "").toLowerCase()}|${(w.company || "").toLowerCase()}`))];
      });
    }
    return { newEd, newQ, newW };
  };

  const pullFromExistingCV = async () => {
    if (!user) { toast.error("Sign in first."); return; }
    setExtracting(true);
    try {
      const filePath = await findExistingCvPath();
      if (!filePath) { toast.error("No CV found in your account. Upload one and we'll fill this in."); return; }
      const { data, error } = await supabase.functions.invoke("extract-cv-education", { body: { filePath } });
      if (error || !data?.success) { toast.error(data?.error || "Could not read your CV."); return; }
      const { newEd, newQ, newW } = mergeImported(data);
      if (!newEd.length && !newQ.length && !newW.length) toast.message("Nothing new found on that CV.");
      else toast.success(`Pulled ${newEd.length} education, ${newQ.length} qualifications and ${newW.length} jobs.`);
    } catch (err) { console.error(err); toast.error("Something went wrong reading your CV."); }
    finally { setExtracting(false); }
  };

  const uploadAndExtractCV = async (file: File | null) => {
    if (!file || !user) return;
    setExtracting(true);
    try {
      const path = `${user.id}/profile-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("cv-uploads").upload(path, file);
      if (upErr) { toast.error("Could not upload file."); return; }
      const { data, error } = await supabase.functions.invoke("extract-cv-education", { body: { filePath: path } });
      if (error || !data?.success) { toast.error(data?.error || "Could not extract from CV."); return; }
      const { newEd, newQ, newW } = mergeImported(data);
      toast.success(`Pulled ${newEd.length} education, ${newQ.length} qualifications and ${newW.length} jobs from your CV.`);
    } catch (err) { console.error(err); toast.error("Something went wrong."); }
    finally { setExtracting(false); if (cvFileInputRef.current) cvFileInputRef.current.value = ""; }
  };

  const importFromLinkedIn = async () => {
    if (!user) { toast.error("Sign in first."); return; }
    const url = linkedinImportUrl.trim();
    if (!url) { toast.error("Paste your LinkedIn profile URL first."); return; }
    if (!/linkedin\.com\/in\//i.test(url)) {
      toast.error("That needs to be your personal LinkedIn URL (the one with /in/ in it).");
      return;
    }
    setImportingLinkedin(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-linkedin-profile", { body: { url } });
      if (error || !data?.success) { toast.error(data?.error || "Could not import that LinkedIn profile."); return; }
      const { newEd, newQ, newW } = mergeImported(data);
      const bits: string[] = [];
      if (newEd.length) bits.push(`${newEd.length} education`);
      if (newW.length) bits.push(`${newW.length} jobs`);
      if (newQ.length) bits.push(`${newQ.length} qualifications`);
      toast.success(bits.length ? `Imported ${bits.join(", ")} from LinkedIn.` : "Imported your LinkedIn profile.");
    } catch (err) { console.error(err); toast.error("Something went wrong importing from LinkedIn."); }
    finally { setImportingLinkedin(false); }
  };

  // Load companies
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
    if (!companyInput.trim()) return setCompanySuggestions([]);
    const q = companyInput.trim().toLowerCase();
    setCompanySuggestions(
      allCompanies.filter((c) => c.toLowerCase().includes(q) && !targetCompanies.includes(c)).slice(0, 6),
    );
  }, [companyInput, allCompanies, targetCompanies]);

  useEffect(() => {
    if (!roleInput.trim()) return setRoleSuggestions([]);
    const q = roleInput.trim().toLowerCase();
    setRoleSuggestions(
      CAREER_MAP_ROLES.filter((r) => r.toLowerCase().includes(q) && !targetRoles.includes(r)).slice(0, 8),
    );
  }, [roleInput, targetRoles]);

  // Deep-link: ?edit=most-wanted opens edit mode and scrolls to the Most Wanted section
  useEffect(() => {
    if (loading) return;
    const edit = searchParams.get("edit");
    if (edit === "most-wanted") {
      setEditMode(true);
      setTimeout(() => {
        const el = document.getElementById("edit-most-wanted");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          const details = el.querySelector("details");
          if (details && !details.open) details.open = true;
        }
      }, 150);
    }
  }, [searchParams, loading]);

  const addCompany = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || targetCompanies.includes(trimmed)) return;
    setTargetCompanies([...targetCompanies, trimmed]);
    setCompanyInput("");
  };
  const removeCompany = (name: string) =>
    setTargetCompanies(targetCompanies.filter((c) => c !== name));
  const addRole = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || targetRoles.includes(trimmed)) return;
    setTargetRoles([...targetRoles, trimmed]);
    setRoleInput("");
  };
  const removeRole = (name: string) =>
    setTargetRoles(targetRoles.filter((r) => r !== name));

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setHomeAddress((data as any).home_address || "");
        setHomeTown((data as any).home_town || "");
        setHomeTownBlurb((data as any).home_town_blurb || "");
        setCareerLevel(data.career_level || "");
        setSalaryExpectation(data.salary_expectation || "");
        setLocationPreference((data as any).location_preference || "");
        setIndustryInterests(data.industry_interests || []);
        const nl = (data as any).newsletter_industries as string[] | null;
        setNewsletterIndustries(
          Array.isArray(nl) && nl.length > 0 ? nl : (data.industry_interests || []),
        );
        setRolePreferences((data as any).role_preferences || []);
        setEmployerVisibilityOptIn(Boolean((data as any).employer_visibility_opt_in));
        setMemberDirectoryOptIn((data as any).member_directory_opt_in !== false);
        setAcceptMessages((data as any).accept_messages !== false);
        setShareDetailsDefault(Boolean((data as any).share_details_default));
        setMentorOptIn(Boolean((data as any).mentor_opt_in));
        setMentorBio((data as any).mentor_bio || "");
        setPhotoUrl((data as any).photo_url || null);
        setResults(data.understand_me_results as UnderstandMeResult | null);
        setRiasecScores((data as any).riasec_scores as RiasecScores | null);
        setSavedWorkValues((data as any).work_values as WorkValues | null);
        const umResults = data.understand_me_results as any;
        const jp = (data as any).job_preferences || {};
        const inputData = umResults?._inputData || jp.understandMe;
        if (inputData) {
          setCvFileName(inputData.cvFileName || null);
          setLinkedinUrl(inputData.linkedinUrl || null);
          setLinkedinScreenshotName(inputData.linkedinScreenshotName || null);
          setPastedText(inputData.pastedText || null);
        }
        if (Array.isArray(jp.passions)) setPassions(jp.passions);
        if (typeof jp.passionsText === "string") setPassionsText(jp.passionsText);
        if (typeof jp.pronouns === "string") setPronouns(jp.pronouns);
        if (typeof jp.tagline === "string") setTagline(jp.tagline);
        if (Array.isArray(jp.lovePhotos)) setLovePhotos(jp.lovePhotos);
        if (Array.isArray(jp.familyPhotos)) setFamilyPhotos(jp.familyPhotos);
        if (Array.isArray(jp.funFacts)) setFunFacts(jp.funFacts);
        if (Array.isArray(jp.targetCompanies)) setTargetCompanies(jp.targetCompanies);
        if (Array.isArray(jp.targetRoles)) setTargetRoles(jp.targetRoles);
        const pb = jp.profileBuilder || {};
        // Prefer CV-imported `experience` (richer: company + link), fall back to `things`.
        const fromExp = Array.isArray(pb.experience)
          ? pb.experience
              .filter((w: any) => w && (w.company || w.title))
              .map((w: any) => ({
                id: uid(),
                title: w.title || "",
                company: w.company || "",
                link: w.link || "",
                logoUrl: w.logoUrl || "",
                kind: "Role",
                when: w.dates || w.when || "",
                description: w.description || "",
              }))
          : [];
        const fromThings = Array.isArray(pb.things)
          ? pb.things
              .filter((t: any) => t && (t.title || t.description))
              .map((t: any) => ({
                id: uid(),
                title: t.title || "",
                company: t.company || "",
                link: t.link || "",
                logoUrl: t.logoUrl || "",
                kind: t.kind || "Role",
                when: t.when || "",
                description: t.description || "",
              }))
          : [];
        // De-dupe by title+company
        const seen = new Set<string>();
        const combined = [...fromExp, ...fromThings].filter((w) => {
          const key = `${(w.title || "").toLowerCase()}|${(w.company || "").toLowerCase()}`;
          if (seen.has(key)) return false;
          seen.add(key); return true;
        });
        if (combined.length) setWorkHistory(combined);
        if (Array.isArray(pb.education)) setEducation(pb.education.filter((e: any) => e && (e.school || e.qualification)).map((e: any) => ({
          id: uid(), school: e.school || "", qualification: e.qualification || "", dates: e.dates || "", grade: e.grade || "", link: e.link || "", logoUrl: e.logoUrl || "",
        })));
        if (Array.isArray(pb.qualifications)) setQualifications(pb.qualifications.filter((q: any) => q && (q.name || q.issuer)).map((q: any) => ({ id: uid(), name: q.name || "", issuer: q.issuer || "", year: q.year || "" })));
        if (typeof pb.videoUrl === "string") setIntroVideoUrl(pb.videoUrl);
        if (typeof pb.intro === "string") setPbIntro(pb.intro);
        if (typeof pb.lookingFor === "string") setPbLookingFor(pb.lookingFor);
        if (typeof pb.instagram === "string") setPbInstagram(pb.instagram);
        if (typeof pb.tiktok === "string") setPbTiktok(pb.tiktok);
        if (typeof pb.portfolio === "string") setPbPortfolio(pb.portfolio);
        if (typeof pb.personalLink === "string") setPbPersonalLink(pb.personalLink);
        if (pb.promptAnswers && typeof pb.promptAnswers === "object") setPbPromptAnswers(pb.promptAnswers);
        if (pb.visibleSections && typeof pb.visibleSections === "object") {
          setVisibleSections((prev) => ({ ...prev, ...pb.visibleSections }));
        }
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  // Auto-save love photos when they change (so uploads aren't lost)
  const lovePhotosFirstRender = useRef(true);
  useEffect(() => {
    if (loading) return;
    if (lovePhotosFirstRender.current) {
      lovePhotosFirstRender.current = false;
      return;
    }
    if (!user) return;
    (async () => {
      const { data: existing } = await supabase
        .from("profiles")
        .select("job_preferences")
        .eq("id", user.id)
        .maybeSingle();
      const merged = {
        ...((existing?.job_preferences as Record<string, unknown>) || {}),
        lovePhotos,
      };
      await supabase
        .from("profiles")
        .update({ job_preferences: merged, updated_at: new Date().toISOString() } as any)
        .eq("id", user.id);
    })();
  }, [lovePhotos, loading, user]);

  // Auto-save family/pets photos when they change
  const familyPhotosFirstRender = useRef(true);
  useEffect(() => {
    if (loading) return;
    if (familyPhotosFirstRender.current) {
      familyPhotosFirstRender.current = false;
      return;
    }
    if (!user) return;
    (async () => {
      const { data: existing } = await supabase
        .from("profiles")
        .select("job_preferences")
        .eq("id", user.id)
        .maybeSingle();
      const merged = {
        ...((existing?.job_preferences as Record<string, unknown>) || {}),
        familyPhotos,
      };
      await supabase
        .from("profiles")
        .update({ job_preferences: merged, updated_at: new Date().toISOString() } as any)
        .eq("id", user.id);
    })();
  }, [familyPhotos, loading, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { data: existing } = await supabase
      .from("profiles")
      .select("job_preferences")
      .eq("id", user.id)
      .maybeSingle();
    const existingJp = (existing?.job_preferences as Record<string, any>) || {};
    const mergedPrefs = {
      ...existingJp,
      passions,
      passionsText,
      pronouns,
      tagline,
      lovePhotos,
      familyPhotos,
      funFacts,
      targetCompanies,
      targetRoles,
      profileBuilder: {
        ...(existingJp.profileBuilder || {}),
        things: workHistory.map(({ id: _id, ...rest }) => rest),
        experience: workHistory
          .filter((w) => w.company || w.title)
          .map((w) => ({ company: w.company || "", title: w.title || "", dates: w.when || "", link: w.link || "", logoUrl: w.logoUrl || "", description: w.description || "", location: "" })),
        education: education
          .filter((e) => e.school || e.qualification)
          .map((e) => ({ school: e.school || "", qualification: e.qualification || "", dates: e.dates || "", grade: e.grade || "", link: e.link || "", logoUrl: e.logoUrl || "" })),
        qualifications: qualifications
          .filter((q) => q.name)
          .map((q) => ({ name: q.name || "", issuer: q.issuer || "", year: q.year || "" })),
        videoUrl: introVideoUrl || null,
        intro: pbIntro,
        lookingFor: pbLookingFor,
        instagram: pbInstagram,
        tiktok: pbTiktok,
        portfolio: pbPortfolio,
        personalLink: pbPersonalLink,
        promptAnswers: pbPromptAnswers,
        visibleSections,
      },
    };
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        home_address: homeAddress || null,
        home_town: homeTown || null,
        home_town_blurb: homeTownBlurb || null,
        career_level: careerLevel || null,
        salary_expectation: salaryExpectation || null,
        location_preference: locationPreference || null,
        industry_interests: industryInterests,
        newsletter_industries: newsletterIndustries,
        role_preferences: rolePreferences,
        employer_visibility_opt_in: employerVisibilityOptIn,
        member_directory_opt_in: memberDirectoryOptIn,
        accept_messages: acceptMessages,
        share_details_default: shareDetailsDefault,
        mentor_opt_in: mentorOptIn,
        mentor_bio: mentorBio || null,
        job_preferences: mergedPrefs,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", user.id);

    if (!error && user.email) {
      await supabase.from("subscribers").upsert(
        {
          email: user.email.toLowerCase(),
          name: fullName || user.email.split("@")[0],
          industry_interests: industryInterests,
          newsletter_industries: newsletterIndustries,
        } as never,
        { onConflict: "email" } as never,
      );
    }

    setSaving(false);
    if (error) toast.error("Failed to save profile.");
    else {
      toast.success("Profile saved!");
      setEditMode(false);
    }
  };

  const handleRiasecComplete = async (scores: RiasecScores, values: WorkValues) => {
    setRiasecScores(scores);
    setSavedWorkValues(values);
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        riasec_scores: scores,
        work_values: values,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", user.id);
    if (error) toast.error("Failed to save quiz results.");
    else toast.success("Career personality saved!");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const [sendingReset, setSendingReset] = useState(false);
  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent. Check your inbox.");
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
    await supabase
      .from("profiles")
      .update({ photo_url: data.publicUrl, updated_at: new Date().toISOString() } as any)
      .eq("id", user.id);
    toast.success("Photo updated!");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const firstName = (fullName || "Friend").split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <SiteNav />

      <div id="profile-export-root" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Profile actions */}
        <div className="export-hidden flex items-center gap-2 flex-wrap mb-6">
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-display font-700 text-xs uppercase tracking-wider border-2 transition-colors ${
              editMode ? "bg-foreground text-background border-foreground" : "border-foreground/40 hover:border-foreground hover:bg-primary"
            }`}
          >
            {editMode ? <><Eye className="w-3 h-3" /> Preview</> : <><Pencil className="w-3 h-3" /> Edit</>}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-primary rounded-full px-4 py-2 font-display font-700 text-xs uppercase tracking-wider border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </button>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-display font-700 text-xs uppercase tracking-wider border-2 border-foreground/20 text-foreground/50 hover:border-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>

        {/* ============================ ACCOUNT MANAGEMENT ============================ */}
        <section className="mb-6 export-hidden">
          <div className="rounded-2xl border-2 border-foreground bg-card shadow-[4px_4px_0_hsl(var(--foreground))] overflow-hidden">
            <div className="px-5 py-4 bg-primary/10 border-b-2 border-foreground flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-display font-800 text-base uppercase tracking-wider">Account</p>
                <p className="font-body text-xs text-muted-foreground">Manage newsletters, personal details, password and visibility.</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-3 py-1.5 font-display font-700 text-[11px] uppercase tracking-wider shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save account
              </button>
            </div>
            <div className="p-4 md:p-5 space-y-0">
              <CollapsibleEdit title="📸 Profile photo" defaultOpen>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-foreground bg-muted cursor-pointer group flex-shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt={fullName} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <User className="w-10 h-10 text-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-5 h-5 text-background" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handlePhotoUpload(f);
                      }}
                    />
                  </label>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-700 text-sm">Add or change your photo</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Click the image to upload. Used across your profile and (if you opt in) the member directory.
                    </p>
                  </div>
                </div>
              </CollapsibleEdit>

              <CollapsibleEdit title="📧 Newsletter & industries you follow">
                <p className="font-body text-xs text-muted-foreground mb-3">
                  <strong>Follow</strong> personalises your inbox &amp; site. <strong>Newsletter</strong> sends one short weekday email per industry.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  {INDUSTRIES.map((ind) => {
                    const followed = industryInterests.includes(ind);
                    const subscribed = newsletterIndustries.includes(ind);
                    return (
                      <div key={ind} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-xl hover:bg-muted/40">
                        <span className="font-display text-sm font-600 truncate">{ind}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setIndustryInterests((prev) =>
                                followed ? prev.filter((i) => i !== ind) : [...prev, ind],
                              )
                            }
                            className={`px-2.5 py-1 rounded-full font-display text-[10px] font-700 uppercase tracking-wider border ${
                              followed
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-border hover:border-primary"
                            }`}
                          >
                            {followed ? "Following" : "Follow"}
                          </button>
                          <button
                            type="button"
                            aria-label={subscribed ? `Unsubscribe from ${ind} newsletter` : `Subscribe to ${ind} newsletter`}
                            title={subscribed ? "Subscribed - click to unsubscribe" : "Subscribe to newsletter"}
                            onClick={() =>
                              setNewsletterIndustries((prev) =>
                                subscribed ? prev.filter((i) => i !== ind) : [...prev, ind],
                              )
                            }
                            className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                              subscribed
                                ? "bg-foreground text-background border-foreground"
                                : "bg-background text-muted-foreground border-border hover:border-foreground"
                            }`}
                          >
                            {subscribed ? <Mail className="w-3.5 h-3.5" /> : <MailX className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleEdit>

              <CollapsibleEdit title="👤 Personal details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={fieldLabel}><Mail className="w-3 h-3" />Email</label>
                    <input type="email" value={user?.email || ""} readOnly className={`${inputBase} bg-muted/40`} />
                  </div>
                  <div>
                    <label className={fieldLabel}><Phone className="w-3 h-3" />Phone (optional)</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputBase} />
                  </div>
                  <div>
                    <label className={fieldLabel}><MapPin className="w-3 h-3" />Location</label>
                    <input
                      value={locationPreference}
                      onChange={(e) => setLocationPreference(e.target.value)}
                      placeholder="London, Manchester, Remote"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}><Briefcase className="w-3 h-3" />Career level</label>
                    <select value={careerLevel} onChange={(e) => setCareerLevel(e.target.value)} className={inputBase}>
                      <option value="">Select your level</option>
                      <option value="entry">Entry (Assistant, Coordinator, Analyst)</option>
                      <option value="mid">Mid (Manager, Senior Manager, Specialist)</option>
                      <option value="senior">Senior (Head of, Principal)</option>
                      <option value="director">Director (Director, VP)</option>
                      <option value="executive">Executive (CEO, MD, C-suite, Founder)</option>
                    </select>
                  </div>
                  <div>
                    <label className={fieldLabel}>Salary expectation</label>
                    <select value={salaryExpectation} onChange={(e) => setSalaryExpectation(e.target.value)} className={inputBase}>
                      <option value="">Select range</option>
                      <option value="Under £25k">Under £25k</option>
                      <option value="£25k–£35k">£25k–£35k</option>
                      <option value="£35k–£50k">£35k–£50k</option>
                      <option value="£50k–£70k">£50k–£70k</option>
                      <option value="£70k–£90k">£70k–£90k</option>
                      <option value="£90k–£120k">£90k–£120k</option>
                      <option value="£120k+">£120k+</option>
                    </select>
                  </div>
                  <div>
                    <label className={fieldLabel}><Home className="w-3 h-3" />Address</label>
                    <textarea
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      placeholder="Street, town, postcode"
                      rows={2}
                      maxLength={200}
                      className={`${inputBase} resize-none`}
                    />
                  </div>
                </div>
              </CollapsibleEdit>

              <CollapsibleEdit title="🔒 Password">
                <p className="font-body text-sm text-muted-foreground mb-3">
                  We'll email a secure link to <strong>{user?.email}</strong> so you can set a new password.
                </p>
                <button
                  type="button"
                  onClick={handleSendPasswordReset}
                  disabled={sendingReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-2xl disabled:opacity-50"
                >
                  {sendingReset ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  Send password reset email
                </button>
              </CollapsibleEdit>

              <CollapsibleEdit title="💬 WhatsApp digest">
                <WhatsAppOptIn />
              </CollapsibleEdit>

              <CollapsibleEdit title="👀 Visibility">
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-border hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={memberDirectoryOptIn}
                    onChange={(e) => setMemberDirectoryOptIn(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex-1">
                    <p className="font-display font-700 text-sm">Show me in the member directory</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Other members can find you in the Community directory.
                    </p>
                  </div>
                </label>
                <label className="mt-3 flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-border hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={acceptMessages}
                    onChange={(e) => setAcceptMessages(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex-1">
                    <p className="font-display font-700 text-sm">Accept messages from members</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Connected members can send you direct messages.
                    </p>
                  </div>
                </label>
                <label className="mt-3 flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-border hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={employerVisibilityOptIn}
                    onChange={(e) => setEmployerVisibilityOptIn(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex-1">
                    <p className="font-display font-700 text-sm">Let matched employers see my profile</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Only employers in industries you follow can view your basic profile.
                    </p>
                  </div>
                </label>
                <label className="mt-3 flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-border hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={shareDetailsDefault}
                    onChange={(e) => setShareDetailsDefault(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex-1">
                    <p className="font-display font-700 text-sm">Auto-share contact when I reply</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Otherwise we'll ask each time.
                    </p>
                  </div>
                </label>
              </CollapsibleEdit>

              <CollapsibleEdit title="🤝 Offer mentoring">
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-border hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={mentorOptIn}
                    onChange={(e) => setMentorOptIn(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex-1">
                    <p className="font-display font-700 text-sm">I offer 30 min mentoring</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      You'll appear in the member-mentors grid on the industries and roles you follow. Members can request a chat.
                    </p>
                  </div>
                </label>
                {mentorOptIn && (
                  <div className="mt-3">
                    <label className="block font-display font-700 text-xs uppercase tracking-wider mb-2">Mentor bio</label>
                    <textarea
                      value={mentorBio}
                      onChange={(e) => setMentorBio(e.target.value)}
                      placeholder="Tell mentees what you can help with"
                      rows={4}
                      maxLength={400}
                      className="w-full rounded-2xl border border-border bg-background p-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{mentorBio.length}/400</p>
                  </div>
                )}
              </CollapsibleEdit>

              <CollapsibleEdit title="🚪 Sign out">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors rounded-2xl"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </CollapsibleEdit>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
          {/* COVER: left column */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <div className={`${cardBase} bg-background overflow-hidden p-0`}>
              {/* Photo */}
              <label className="block relative aspect-[4/5] bg-gradient-to-br from-primary/15 via-muted to-foreground/5 cursor-pointer group">
                {photoUrl ? (
                  <img src={photoUrl} alt={fullName} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-20 h-20 text-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-foreground/70 to-transparent flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1.5 bg-background text-foreground px-3 py-1.5 rounded-full font-display font-700 text-[11px] uppercase tracking-wider">
                    <Camera className="w-3 h-3" /> Change
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePhotoUpload(f);
                  }}
                />
              </label>

              <div className="p-5 md:p-6">
                {editMode ? (
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className={`${inputBase} font-display font-800 text-2xl mb-2`}
                  />
                ) : (
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="font-display font-800 text-3xl md:text-4xl text-foreground leading-[0.95]">
                      {fullName || "Welcome"}
                    </h1>
                    {isPremium && (
                      <span className="inline-flex items-center gap-1 rounded-full border-2 border-foreground bg-primary px-2.5 py-0.5 font-display font-900 text-[10px] uppercase tracking-wider text-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
                        ★ Premium
                      </span>
                    )}
                  </div>
                )}

                {editMode ? (
                  <input
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    placeholder="She / Her · They / Them …"
                    className={`${inputBase} text-sm mb-3`}
                  />
                ) : (
                  pronouns && <p className="font-body text-sm text-muted-foreground mb-3">{pronouns}</p>
                )}

                {/* Tagline (one-liner about you) */}
                {editMode ? (
                  <textarea
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="One line about you (e.g. Hospitality student · animal lover · cake baker)"
                    rows={2}
                    className={`${inputBase} text-sm mb-3`}
                  />
                ) : (
                  tagline && (
                    <p className="font-display font-700 text-base text-foreground leading-snug mb-3">
                      {tagline}
                    </p>
                  )
                )}

                {locationPreference && (
                  <p className="font-body text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {locationPreference}
                  </p>
                )}

                {/* Personal contact details */}
                <div className="mt-2 space-y-2 border-t border-border pt-3">
                  {editMode ? (
                    <>
                      <div>
                        <label className={fieldLabel}><Mail className="w-3 h-3" /> Email</label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          readOnly
                          className={`${inputBase} text-sm bg-muted/40`}
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}><Phone className="w-3 h-3" /> Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 07xxx xxx xxx"
                          maxLength={30}
                          className={`${inputBase} text-sm`}
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}><Home className="w-3 h-3" /> Address</label>
                        <textarea
                          value={homeAddress}
                          onChange={(e) => setHomeAddress(e.target.value)}
                          placeholder="Street, town, postcode"
                          rows={2}
                          maxLength={200}
                          className={`${inputBase} text-sm resize-none`}
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}><MapPin className="w-3 h-3" /> Town / city you live in</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={homeTown}
                            onChange={(e) => setHomeTown(e.target.value)}
                            placeholder="e.g. Manchester"
                            maxLength={80}
                            className={`${inputBase} text-sm`}
                          />
                          <button
                            type="button"
                            disabled={!homeTown.trim() || lookingUpTown}
                            onClick={async () => {
                              setLookingUpTown(true);
                              const { data, error } = await supabase.functions.invoke("describe-town", {
                                body: { town: homeTown.trim() },
                              });
                              setLookingUpTown(false);
                              if (error || !data?.blurb) {
                                toast.error("Could not look up that town. Try again.");
                                return;
                              }
                              setHomeTownBlurb(data.blurb);
                              toast.success("Added a few words about your town");
                            }}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 border-2 border-foreground font-display font-700 text-[10px] uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-2xl disabled:opacity-50"
                          >
                            {lookingUpTown ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            {lookingUpTown ? "Looking…" : "Look up"}
                          </button>
                        </div>
                        {homeTownBlurb && (
                          <div className="mt-2 relative">
                            <textarea
                              value={homeTownBlurb}
                              onChange={(e) => setHomeTownBlurb(e.target.value)}
                              rows={3}
                              maxLength={500}
                              className={`${inputBase} text-sm resize-none`}
                            />
                            <button
                              type="button"
                              onClick={() => setHomeTownBlurb("")}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                              aria-label="Clear blurb"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {user?.email && (
                        <p className="font-body text-sm text-muted-foreground flex items-center gap-1.5 break-all">
                          <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                          <a href={`mailto:${user.email}`} className="hover:text-primary transition-colors">{user.email}</a>
                        </p>
                      )}
                      {phone && (
                        <p className="font-body text-sm text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                          <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-primary transition-colors">{phone}</a>
                        </p>
                      )}
                      {homeAddress && (
                        <p className="font-body text-sm text-muted-foreground flex items-start gap-1.5 whitespace-pre-line">
                          <Home className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{homeAddress}</span>
                        </p>
                      )}
                      {(homeTown || homeTownBlurb) && (
                        <div className="mt-3 pt-3 border-t border-border">
                          {homeTown && (
                            <p className="font-display font-700 text-sm text-foreground flex items-center gap-1.5 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {homeTown}
                            </p>
                          )}
                          {homeTownBlurb && (
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">
                              {homeTownBlurb}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

              </div>


            </div>

            <div className={`${cardBase} bg-background mt-4`}>
              <WhatsAppOptIn />
            </div>
          </aside>

          {/* RIGHT spread */}
          <main className="lg:col-span-8 space-y-5">
            {/* Greeting strip */}
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <p className="font-display text-sm text-muted-foreground">
                Hey <span className="text-foreground font-700">{firstName}</span> - this is your magazine.
              </p>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="font-display font-700 text-[11px] uppercase tracking-wider text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            <YourBadges />

            {/* Mosaic grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
              {/* Your story (intro + looking for + links) */}
              <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-green-50 via-card to-card ${sectionWrap('story')}`}>
                <SectionPin k="story" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className={eyebrowCls}>Your story</p>
                    <h2 className={titleCls}>In a few lines, who are you? <Quote className="inline w-4 h-4 text-primary" /></h2>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      The intro that goes at the top of your profile, what you're after, and where to find you online.
                    </p>
                  </div>
                </div>

                {editMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className={fieldLabel}>Short intro</label>
                      <textarea value={pbIntro} onChange={(e) => setPbIntro(e.target.value)} rows={4} placeholder="e.g. 18 from Manchester, studying business, obsessed with music marketing…" className={`${inputBase} resize-none`} />
                    </div>
                    <div>
                      <label className={fieldLabel}>What kind of work are you looking for?</label>
                      <textarea value={pbLookingFor} onChange={(e) => setPbLookingFor(e.target.value)} rows={2} placeholder="e.g. internship, weekend job, apprenticeship…" className={`${inputBase} resize-none`} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className={fieldLabel}><LinkIcon className="w-3 h-3" /> Instagram</label>
                        <input value={pbInstagram} onChange={(e) => setPbInstagram(e.target.value)} placeholder="@username" className={inputBase} />
                      </div>
                      <div>
                        <label className={fieldLabel}><LinkIcon className="w-3 h-3" /> TikTok</label>
                        <input value={pbTiktok} onChange={(e) => setPbTiktok(e.target.value)} placeholder="@username" className={inputBase} />
                      </div>
                      <div>
                        <label className={fieldLabel}><LinkIcon className="w-3 h-3" /> Portfolio / website</label>
                        <input value={pbPortfolio} onChange={(e) => setPbPortfolio(e.target.value)} placeholder="https://…" className={inputBase} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pbIntro ? (
                      <p className="font-body text-sm md:text-base text-foreground leading-relaxed whitespace-pre-line">{pbIntro}</p>
                    ) : (
                      <button type="button" onClick={() => setEditMode(true)} className="font-body text-sm text-muted-foreground italic hover:text-foreground">+ Add your short intro</button>
                    )}
                    {pbLookingFor && (
                      <div>
                        <p className={eyebrowCls}>Looking for</p>
                        <p className="font-body text-sm text-foreground">{pbLookingFor}</p>
                      </div>
                    )}
                    {(pbInstagram || pbTiktok || pbPortfolio || pbPersonalLink) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {pbInstagram && (
                          <a href={normaliseUrl(pbInstagram, "https://instagram.com/")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-foreground font-display text-xs font-700 hover:bg-foreground hover:text-background transition-colors">
                            <LinkIcon className="w-3 h-3" /> Instagram
                          </a>
                        )}
                        {pbTiktok && (
                          <a href={normaliseUrl(pbTiktok, "https://tiktok.com/@")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-foreground font-display text-xs font-700 hover:bg-foreground hover:text-background transition-colors">
                            <LinkIcon className="w-3 h-3" /> TikTok
                          </a>
                        )}
                        {pbPortfolio && (
                          <a href={normaliseUrl(pbPortfolio)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-foreground font-display text-xs font-700 hover:bg-foreground hover:text-background transition-colors">
                            <LinkIcon className="w-3 h-3" /> Portfolio
                          </a>
                        )}
                        {pbPersonalLink && !pbInstagram && !pbTiktok && !pbPortfolio && (
                          <a href={normaliseUrl(pbPersonalLink)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-foreground font-display text-xs font-700 hover:bg-foreground hover:text-background transition-colors">
                            <LinkIcon className="w-3 h-3" /> Link
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* In your words - four prompts */}
              <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-lime-50 via-card to-card ${sectionWrap('prompts')}`}>
                <SectionPin k="prompts" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className={eyebrowCls}>In your words</p>
                    <h2 className={titleCls}>Four quick prompts <Sparkles className="inline w-4 h-4 text-primary" /></h2>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      A handful of sentences each. These bring your profile to life.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PB_PROMPTS.map((q) => (
                    <div key={q} className="border-2 border-border rounded-2xl p-3 bg-background/60">
                      <p className="font-display font-700 text-sm text-foreground mb-1.5">{q}</p>
                      {editMode ? (
                        <textarea
                          value={pbPromptAnswers[q] || ""}
                          onChange={(e) => setPbPromptAnswers({ ...pbPromptAnswers, [q]: e.target.value })}
                          rows={2}
                          placeholder="Type your answer…"
                          className={`${inputBase} resize-none`}
                        />
                      ) : pbPromptAnswers[q] ? (
                        <p className="font-body text-sm text-foreground whitespace-pre-line">{pbPromptAnswers[q]}</p>
                      ) : (
                        <button type="button" onClick={() => setEditMode(true)} className="font-body text-xs text-muted-foreground italic hover:text-foreground">+ Add an answer</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Loves Gallery */}

              <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-pink-50 via-card to-card ${sectionWrap('loves')}`}>
                <SectionPin k="loves" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className={eyebrowCls}>Loves</p>
                    <h2 className={titleCls}>Things I'm doing right now <Heart className="inline w-4 h-4 text-primary fill-primary" /></h2>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Drop in photos of the shows, books, places, recipes - anything that makes you, you.
                    </p>
                  </div>
                </div>
                <LovesGallery userId={user.id} photos={lovePhotos} onChange={setLovePhotos} />
              </div>

              {/* Things you don't know about me */}
              <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-orange-50 via-card to-card ${sectionWrap('qa')}`}>
                <SectionPin k="qa" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className={eyebrowCls}>Q & A</p>
                    <h2 className={titleCls}>Things you don't know about me 🤫</h2>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Pick a prompt, drop in a one-line answer. The more honest, the better.
                    </p>
                  </div>
                </div>
                <FunFactsEditor facts={funFacts} onChange={setFunFacts} userId={user.id} />
              </div>

              {/* Family & Pets */}
              <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-amber-50 via-card to-card ${sectionWrap('family')}`}>
                <SectionPin k="family" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className={eyebrowCls}>My people</p>
                    <h2 className={titleCls}>Family &amp; pets <Heart className="inline w-4 h-4 text-primary fill-primary" /></h2>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      The humans (and four-legged friends) who make life worth it.
                    </p>
                  </div>
                </div>
                <FamilyPetsGallery userId={user.id} photos={familyPhotos} onChange={setFamilyPhotos} />
              </div>

              {/* RIASEC */}
              <div className={`${cardBase} md:col-span-6 ${sectionWrap('riasec')}`}>
                <SectionPin k="riasec" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className={eyebrowCls}>Career personality · RIASEC</p>
                    <h2 className={titleCls}>How you're wired ⚡</h2>
                  </div>
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                {riasecScores ? (
                  <RiasecHexagon scores={riasecScores} />
                ) : (
                  <div className="border-2 border-dashed border-foreground/30 rounded-2xl p-5 text-center">
                    <p className="font-body text-sm text-muted-foreground mb-3">
                      Take the 5-minute personality quiz to bring this card to life.
                    </p>
                    <button
                      onClick={() => {
                        const el = document.getElementById("riasec-quiz");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 font-display font-700 text-xs uppercase tracking-wider"
                    >
                      Start the quiz <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Work Values */}
              <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-violet-50 via-card to-card ${sectionWrap('values')}`}>
                <SectionPin k="values" />
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className={eyebrowCls}>Work values</p>
                    <h2 className={titleCls}>What you want from work ✨</h2>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      RIASEC says <em>what kind of work</em> you're drawn to. Work values say <em>how</em> you want it to feel day-to-day. Two people can both be "Artistic" but want very different things - one craves stability in-house, the other variety as a freelancer.
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                {savedWorkValues ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(savedWorkValues)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([k, v], i) => (
                          <span
                            key={k}
                            className={`px-3 py-1.5 rounded-full font-display text-xs font-700 border-2 capitalize ${SKILL_COLOURS[i % SKILL_COLOURS.length]}`}
                          >
                            {k} · {Math.round(v as number)}
                          </span>
                        ))}
                    </div>
                    <details className="font-body text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">What do these mean?</summary>
                      <ul className="mt-2 space-y-1 pl-4 list-disc">
                        <li><strong>Creativity</strong> - making, designing, original output.</li>
                        <li><strong>Autonomy</strong> - owning your time, low oversight.</li>
                        <li><strong>Stability</strong> - predictable hours, steady income, clear path.</li>
                        <li><strong>Variety</strong> - mixed tasks, new problems, no two days the same.</li>
                        <li><strong>Recognition</strong> - visible impact, credit, status.</li>
                      </ul>
                    </details>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-foreground/30 rounded-2xl p-5 text-center mt-2">
                    <p className="font-body text-sm text-muted-foreground mb-3">
                      Take the personality quiz to set your work values.
                    </p>
                    <button
                      onClick={() => {
                        const el = document.getElementById("riasec-quiz");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 font-display font-700 text-xs uppercase tracking-wider"
                    >
                      Start the quiz <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className={`${cardBase} md:col-span-3 bg-gradient-to-br from-yellow-50 to-card ${sectionWrap('skills')}`}>
                <SectionPin k="skills" />
                <p className={eyebrowCls}>Skills & vibes</p>
                <h2 className={titleCls}>What I love doing…</h2>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {passions.length === 0 && (
                    <p className="font-body text-xs text-muted-foreground">
                      Hit Edit and tap the things that light you up.
                    </p>
                  )}
                  {passions.map((p, i) => (
                    <span
                      key={p}
                      className={`px-3 py-1.5 rounded-full font-display text-xs font-700 border-2 ${SKILL_COLOURS[i % SKILL_COLOURS.length]}`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div className={`${cardBase} md:col-span-3 bg-gradient-to-br from-blue-50 to-card ${sectionWrap('industries')}`}>
                <SectionPin k="industries" />
                <p className={eyebrowCls}>Industries I follow</p>
                <h2 className={titleCls}>My world</h2>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {industryInterests.length === 0 && (
                    <p className="font-body text-xs text-muted-foreground">
                      No industries yet - pick a few in Edit mode.
                    </p>
                  )}
                  {industryInterests.map((ind, i) => {
                    const slug = ind.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-");
                    return (
                      <Link
                        key={ind}
                        to={`/${slug}`}
                        className={`px-3 py-1.5 rounded-full font-display text-xs font-700 border-2 hover:scale-105 transition-transform ${SKILL_COLOURS[(i + 2) % SKILL_COLOURS.length]}`}
                      >
                        {ind}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Most Wanted */}
              <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-primary/10 via-card to-card ${sectionWrap('hitlist')}`}>
                <SectionPin k="hitlist" />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={eyebrowCls}>Hit list</p>
                    <h2 className={titleCls}>Most wanted <Target className="inline w-4 h-4 text-primary" /></h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-2">
                      Dream companies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {targetCompanies.length === 0 && (
                        <p className="font-body text-xs text-muted-foreground">None yet.</p>
                      )}
                      {targetCompanies.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 rounded-full font-display font-700 text-xs"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-2">
                      Roles I'm chasing
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {targetRoles.length === 0 && (
                        <p className="font-body text-xs text-muted-foreground">None yet.</p>
                      )}
                      {targetRoles.map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-display font-700 text-xs"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Where I've worked */}
              <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-amber-50 via-card to-card ${sectionWrap('employment')}`}>
                <SectionPin k="employment" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className={eyebrowCls}>Track record</p>
                    <h2 className={titleCls}>Where I've worked <Briefcase className="inline w-4 h-4 text-primary" /></h2>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Roles, projects and the things you've shipped.
                    </p>
                  </div>
                  <button
                    onClick={() => { setEditMode(true); setTimeout(() => document.getElementById("edit-work")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                    className="inline-flex items-center gap-1 text-[11px] font-display font-700 uppercase tracking-wider text-primary hover:text-primary/80 border border-primary rounded-full px-3 py-1.5"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                </div>
                {workHistory.length === 0 ? (
                  <button
                    onClick={() => { setEditMode(true); setTimeout(() => document.getElementById("edit-work")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                    className="w-full border-2 border-dashed border-foreground/30 rounded-2xl p-5 text-center font-body text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    + Add the roles, projects and things you're proud of
                  </button>
                ) : (
                  <div className="space-y-3">
                    {workHistory.map((w) => (
                      <div key={w.id} className="flex gap-3 items-start border-l-4 border-primary pl-4 py-1">
                        <LogoBubble name={w.company || w.title} link={w.link} logoUrl={w.logoUrl} size={44} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <h3 className="font-display font-800 text-base text-foreground">{w.title || "Untitled"}</h3>
                            {w.company && <span className="font-display font-700 text-sm text-foreground/80">· {w.company}</span>}
                          </div>
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-0.5">
                            {w.kind && <span className="font-display text-[10px] font-700 uppercase tracking-wider text-primary">{w.kind}</span>}
                            {w.when && <span className="font-body text-xs text-muted-foreground">· {w.when}</span>}
                          </div>
                          {w.description && (
                            <p className="font-body text-sm text-foreground/80 mt-1 leading-relaxed">{w.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              <div className={`${cardBase} md:col-span-3 bg-gradient-to-br from-green-50 to-card ${sectionWrap('education')}`}>
                <SectionPin k="education" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className={eyebrowCls}>Schooled</p>
                    <h2 className={titleCls}>Education <GraduationCap className="inline w-4 h-4 text-primary" /></h2>
                  </div>
                  <button
                    onClick={() => { setEditMode(true); setTimeout(() => document.getElementById("edit-education")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                    className="inline-flex items-center gap-1 text-[11px] font-display font-700 uppercase tracking-wider text-primary hover:text-primary/80 border border-primary rounded-full px-3 py-1.5"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                </div>
                {education.length === 0 ? (
                  <button
                    onClick={() => { setEditMode(true); setTimeout(() => document.getElementById("edit-education")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                    className="w-full border-2 border-dashed border-foreground/30 rounded-2xl p-4 text-center font-body text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    + Add education
                  </button>
                ) : (
                  <div className="space-y-3">
                    {education.map((e) => (
                      <div key={e.id} className="bg-background border-2 border-foreground rounded-2xl p-3 flex gap-3 items-start">
                        <LogoBubble name={e.school} link={e.link} logoUrl={e.logoUrl} size={40} />
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-800 text-sm leading-tight">{e.school || "-"}</p>
                          <p className="font-body text-xs text-foreground/70 mt-0.5">{e.qualification}{e.grade ? ` · ${e.grade}` : ""}</p>
                          {e.dates && <p className="font-body text-[11px] text-muted-foreground mt-0.5">{e.dates}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Qualifications */}
              <div className={`${cardBase} md:col-span-3 bg-gradient-to-br from-purple-50 to-card ${sectionWrap('qualifications')}`}>
                <SectionPin k="qualifications" />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className={eyebrowCls}>Credentials</p>
                    <h2 className={titleCls}>Qualifications, Awards, Prizes <Award className="inline w-4 h-4 text-primary" /></h2>
                  </div>
                  <button
                    onClick={() => { setEditMode(true); setTimeout(() => document.getElementById("edit-qualifications")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                    className="inline-flex items-center gap-1 text-[11px] font-display font-700 uppercase tracking-wider text-primary hover:text-primary/80 border border-primary rounded-full px-3 py-1.5"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                </div>
                {qualifications.length === 0 ? (
                  <button
                    onClick={() => { setEditMode(true); setTimeout(() => document.getElementById("edit-qualifications")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                    className="w-full border-2 border-dashed border-foreground/30 rounded-2xl p-4 text-center font-body text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    + Add a qualification
                  </button>
                ) : (
                  <div className="space-y-2">
                    {qualifications.map((q) => (
                      <div key={q.id} className="flex items-start gap-2 bg-background border-2 border-foreground rounded-2xl p-3">
                        <Award className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-display font-700 text-sm">{q.name || "-"}</p>
                          <p className="font-body text-[11px] text-muted-foreground">{[q.issuer, q.year].filter(Boolean).join(" · ")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Intro video */}
              <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-rose-50 to-card ${sectionWrap('video')}`}>
                <SectionPin k="video" />
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className={eyebrowCls}>Press play</p>
                    <h2 className={titleCls}>My intro video <Video className="inline w-4 h-4 text-primary" /></h2>
                  </div>
                  <button
                    onClick={() => { setEditMode(true); setTimeout(() => document.getElementById("edit-video")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                    className="inline-flex items-center gap-1 text-[11px] font-display font-700 uppercase tracking-wider text-primary hover:text-primary/80 border border-primary rounded-full px-3 py-1.5"
                  >
                    <Pencil className="w-3 h-3" /> {introVideoUrl ? "Replace" : "Add"}
                  </button>
                </div>
                {introVideoUrl ? (
                  <video src={introVideoUrl} controls className="w-full rounded-2xl border-2 border-foreground bg-black" />
                ) : (
                  <button
                    onClick={() => { setEditMode(true); setTimeout(() => document.getElementById("edit-video")?.scrollIntoView({ behavior: "smooth" }), 50); }}
                    className="w-full border-2 border-dashed border-foreground/30 rounded-2xl p-5 text-center font-body text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    + Paste a YouTube, Vimeo, Loom or .mp4 link
                  </button>
                )}
              </div>

              {results?.personalityInsights && (
                <div className={`${cardBase} md:col-span-6 bg-gradient-to-br from-purple-50 to-card ${sectionWrap('about')}`}>
                  <SectionPin k="about" />
                  <p className={eyebrowCls}>The story so far</p>
                  <h2 className={titleCls}>About you, by us</h2>
                  <div className="mt-4 flex gap-3">
                    <Quote className="w-6 h-6 text-primary flex-shrink-0" />
                    <p className="font-body text-sm text-foreground leading-relaxed italic">
                      {results.personalityInsights}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 no-print">
                    <Link
                      to="/onboarding"
                      className="inline-flex items-center gap-1.5 bg-foreground text-background px-4 py-2 rounded-full font-display font-700 text-[11px] uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Re-run onboarding
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(true);
                        setShowUnderstandMe(true);
                        setTimeout(() => understandMeRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
                      }}
                      className="inline-flex items-center gap-1.5 border-2 border-foreground px-4 py-2 rounded-full font-display font-700 text-[11px] uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Update inputs
                    </button>
                  </div>
                </div>
              )}

              {results?.roleMatches && results.roleMatches.length > 0 && (
                <div className={`${cardBase} md:col-span-6 ${sectionWrap('roles')}`}>
                  <SectionPin k="roles" />
                  <p className={eyebrowCls}>Top role matches</p>
                  <h2 className={titleCls}>What I'm good at...</h2>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.roleMatches.slice(0, 6).map((m, i) => (
                      <Link
                        key={i}
                        to={`/roles/${m.slug}`}
                        className="group block border-2 border-foreground rounded-2xl p-3 bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-display font-700 text-sm">{m.role}</span>
                          <span className="font-display font-800 text-base">{m.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted group-hover:bg-primary-foreground/20 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary group-hover:bg-primary-foreground h-full"
                            style={{ width: `${m.percentage}%` }}
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ============================== EDIT PANEL ============================== */}
            {editMode && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Pencil className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-800 text-lg uppercase tracking-wide">
                    Edit details
                  </h2>
                </div>


                <CollapsibleEdit title="What you love">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PASSION_TAGS.map((tag) => {
                      const selected = passions.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setPassions((prev) => (selected ? prev.filter((p) => p !== tag) : [...prev, tag]))
                          }
                          className={`${chipBase} ${selected ? chipSelected : chipIdle}`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </CollapsibleEdit>

                <CollapsibleEdit title="Pull from your CV or LinkedIn" defaultOpen>
                  <p className="font-body text-xs text-muted-foreground mb-3">
                    We'll merge what we find with what's already here - nothing gets overwritten.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="border-2 border-foreground rounded-2xl p-4 bg-background space-y-2">
                      <p className="font-display font-700 text-sm flex items-center gap-1.5"><Upload className="w-4 h-4 text-primary" /> From your CV</p>
                      <input
                        ref={cvFileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.rtf"
                        onChange={(e) => uploadAndExtractCV(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={extracting}
                          onClick={() => cvFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-2xl disabled:opacity-50"
                        >
                          {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          Upload CV
                        </button>
                        <button
                          type="button"
                          disabled={extracting}
                          onClick={pullFromExistingCV}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-primary text-primary font-display font-700 text-xs uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors rounded-2xl disabled:opacity-50"
                        >
                          {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          Pull from existing CV
                        </button>
                      </div>
                      <p className="font-body text-[11px] text-muted-foreground">PDF, DOC, DOCX, TXT or RTF.</p>
                    </div>
                    <div className="border-2 border-foreground rounded-2xl p-4 bg-background space-y-2">
                      <p className="font-display font-700 text-sm flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-primary" /> From LinkedIn</p>
                      <input
                        type="url"
                        value={linkedinImportUrl}
                        onChange={(e) => setLinkedinImportUrl(e.target.value)}
                        placeholder="https://www.linkedin.com/in/your-handle"
                        className={inputBase}
                      />
                      <button
                        type="button"
                        disabled={importingLinkedin}
                        onClick={importFromLinkedIn}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-2xl disabled:opacity-50"
                      >
                        {importingLinkedin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {importingLinkedin ? "Importing…" : "Import"}
                      </button>
                    </div>
                  </div>
                </CollapsibleEdit>

                <div id="edit-work" />
                <CollapsibleEdit title="Where you've worked (roles & projects)" defaultOpen>
                  <div className="space-y-3">
                    {workHistory.map((w) => (
                      <div key={w.id} className="border-2 border-border rounded-2xl p-3 space-y-2 bg-background">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">Entry</span>
                          <button type="button" onClick={() => setWorkHistory(workHistory.filter((x) => x.id !== w.id))} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <LogoBubble name={w.company || w.title} link={w.link} logoUrl={w.logoUrl} size={36} />
                          <input value={w.title} onChange={(e) => setWorkHistory(workHistory.map((x) => x.id === w.id ? { ...x, title: e.target.value } : x))} placeholder="Job title (e.g. Senior PM)" className={inputBase} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={w.company || ""} onChange={(e) => setWorkHistory(workHistory.map((x) => x.id === w.id ? { ...x, company: e.target.value } : x))} placeholder="Company / employer" className={inputBase} />
                          <input value={w.link || ""} onChange={(e) => setWorkHistory(workHistory.map((x) => x.id === w.id ? { ...x, link: e.target.value } : x))} placeholder="Website (for logo, e.g. acme.com)" className={inputBase} />
                        </div>
                        <div>
                          <label className={fieldLabel}><Upload className="w-3 h-3" /> Logo (upload - optional)</label>
                          <LogoUploader
                            userId={user.id}
                            value={w.logoUrl || ""}
                            onChange={(url) => setWorkHistory(workHistory.map((x) => x.id === w.id ? { ...x, logoUrl: url } : x))}
                            preview={<LogoBubble name={w.company || w.title} link={w.link} logoUrl={w.logoUrl} size={36} />}
                            label="Add a photo"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select value={w.kind} onChange={(e) => setWorkHistory(workHistory.map((x) => x.id === w.id ? { ...x, kind: e.target.value } : x))} className={inputBase}>
                            {["Role", "Project", "Internship", "Volunteering", "Side hustle", "Award"].map((k) => <option key={k} value={k}>{k}</option>)}
                          </select>
                          <input value={w.when} onChange={(e) => setWorkHistory(workHistory.map((x) => x.id === w.id ? { ...x, when: e.target.value } : x))} placeholder="When (e.g. 2022 – Present)" className={inputBase} />
                        </div>
                        <textarea value={w.description} onChange={(e) => setWorkHistory(workHistory.map((x) => x.id === w.id ? { ...x, description: e.target.value } : x))} rows={2} placeholder="What did you do? What did you learn?" className={`${inputBase} resize-none`} />
                      </div>
                    ))}
                    <button type="button" onClick={() => setWorkHistory([...workHistory, { id: uid(), title: "", company: "", link: "", kind: "Role", when: "", description: "" }])} className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-2xl">
                      <Plus className="w-3.5 h-3.5" /> Add entry
                    </button>
                  </div>
                </CollapsibleEdit>

                <div id="edit-education" />
                <CollapsibleEdit title="Education" defaultOpen>
                  <div className="space-y-3">
                    {education.map((ed) => (
                      <div key={ed.id} className="border-2 border-border rounded-2xl p-3 space-y-2 bg-background">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">School / college / university</span>
                          <button type="button" onClick={() => setEducation(education.filter((x) => x.id !== ed.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <input value={ed.school} onChange={(e) => setEducation(education.map((x) => x.id === ed.id ? { ...x, school: e.target.value } : x))} placeholder="School / college / university" className={inputBase} />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={ed.qualification} onChange={(e) => setEducation(education.map((x) => x.id === ed.id ? { ...x, qualification: e.target.value } : x))} placeholder="Qualification" className={inputBase} />
                          <input value={ed.dates} onChange={(e) => setEducation(education.map((x) => x.id === ed.id ? { ...x, dates: e.target.value } : x))} placeholder="Dates" className={inputBase} />
                        </div>
                        <input value={ed.grade} onChange={(e) => setEducation(education.map((x) => x.id === ed.id ? { ...x, grade: e.target.value } : x))} placeholder="Grade / result (optional)" className={inputBase} />
                        <div>
                          <label className={fieldLabel}><LinkIcon className="w-3 h-3" /> School website (for logo)</label>
                          <input
                            type="url"
                            value={ed.link || ""}
                            onChange={(e) => setEducation(education.map((x) => x.id === ed.id ? { ...x, link: e.target.value } : x))}
                            placeholder="e.g. ox.ac.uk or https://leeds.ac.uk"
                            className={inputBase}
                          />
                        </div>
                        <div>
                          <label className={fieldLabel}><Upload className="w-3 h-3" /> Logo (upload - optional)</label>
                          <LogoUploader
                            userId={user.id}
                            value={ed.logoUrl || ""}
                            onChange={(url) => setEducation(education.map((x) => x.id === ed.id ? { ...x, logoUrl: url } : x))}
                            preview={<LogoBubble name={ed.school} link={ed.link} logoUrl={ed.logoUrl} size={32} />}
                            label="Add a photo"
                          />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setEducation([...education, { id: uid(), school: "", qualification: "", dates: "", grade: "" }])} className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-2xl">
                      <Plus className="w-3.5 h-3.5" /> Add education
                    </button>
                  </div>
                </CollapsibleEdit>

                <div id="edit-qualifications" />
                <CollapsibleEdit title="Qualifications & certifications" defaultOpen>
                  <div className="space-y-3">
                    {qualifications.map((q) => (
                      <div key={q.id} className="border-2 border-border rounded-2xl p-3 space-y-2 bg-background">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground">Certification</span>
                          <button type="button" onClick={() => setQualifications(qualifications.filter((x) => x.id !== q.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <input value={q.name} onChange={(e) => setQualifications(qualifications.map((x) => x.id === q.id ? { ...x, name: e.target.value } : x))} placeholder="Name (e.g. PRINCE2 Practitioner)" className={inputBase} />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={q.issuer} onChange={(e) => setQualifications(qualifications.map((x) => x.id === q.id ? { ...x, issuer: e.target.value } : x))} placeholder="Issuer" className={inputBase} />
                          <input value={q.year} onChange={(e) => setQualifications(qualifications.map((x) => x.id === q.id ? { ...x, year: e.target.value } : x))} placeholder="Year" className={inputBase} />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setQualifications([...qualifications, { id: uid(), name: "", issuer: "", year: "" }])} className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-foreground font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-2xl">
                      <Plus className="w-3.5 h-3.5" /> Add qualification
                    </button>
                  </div>
                </CollapsibleEdit>

                <div id="edit-video" />
                <CollapsibleEdit title="Intro video (optional)" defaultOpen>
                  <p className="font-body text-xs text-muted-foreground mb-3">
                    Paste a public link to a short intro video (YouTube, Vimeo, Loom, or any direct .mp4 URL).
                  </p>
                  <input
                    value={introVideoUrl}
                    onChange={(e) => setIntroVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className={inputBase}
                  />
                </CollapsibleEdit>


                <CollapsibleEdit title="Role preferences">
                  <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map((role) => {
                      const selected = rolePreferences.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() =>
                            setRolePreferences((prev) =>
                              selected ? prev.filter((r) => r !== role) : [...prev, role],
                            )
                          }
                          className={`${chipBase} ${selected ? chipDark : chipIdle}`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </CollapsibleEdit>

                <div id="edit-most-wanted" />
                <CollapsibleEdit title="⭐ Most Wanted (companies & roles)">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={fieldLabel}><Building2 className="w-3 h-3" />Dream companies</label>
                      <div className="relative">
                        <input
                          value={companyInput}
                          onChange={(e) => setCompanyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCompany(companyInput);
                            }
                          }}
                          placeholder="Type a company"
                          className={inputBase}
                        />
                        {companySuggestions.length > 0 && (
                          <div className="absolute z-10 left-0 right-0 top-full mt-1 border border-border bg-background rounded-2xl shadow-lg max-h-56 overflow-auto">
                            {companySuggestions.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => addCompany(s)}
                                className="w-full text-left px-4 py-2 font-body text-sm hover:bg-primary/10 hover:text-primary"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {targetCompanies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {targetCompanies.map((c) => (
                            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-full font-display font-600 text-xs">
                              {c}
                              <button type="button" onClick={() => removeCompany(c)} className="hover:opacity-70">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={fieldLabel}><Briefcase className="w-3 h-3" />Specific job titles</label>
                      <div className="relative">
                        <input
                          value={roleInput}
                          onChange={(e) => setRoleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addRole(roleInput);
                            }
                          }}
                          placeholder="Search roles or type your own"
                          className={inputBase}
                        />
                        {roleSuggestions.length > 0 && (
                          <div className="absolute z-10 left-0 right-0 top-full mt-1 border border-border bg-background rounded-2xl shadow-lg max-h-56 overflow-auto">
                            {roleSuggestions.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => addRole(s)}
                                className="w-full text-left px-4 py-2 font-body text-sm hover:bg-primary/10 hover:text-primary"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {targetRoles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {targetRoles.map((r) => (
                            <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full font-display font-600 text-xs">
                              {r}
                              <button type="button" onClick={() => removeRole(r)} className="hover:opacity-70">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleEdit>


                <CollapsibleEdit title="Profile sources (CV, LinkedIn, About)">
                  <div className="space-y-3">
                    {[
                      { label: "CV / Resume", done: !!cvFileName, value: cvFileName || "Not yet uploaded", icon: Upload },
                      {
                        label: "LinkedIn", done: !!(linkedinScreenshotName || (linkedinUrl && linkedinUrl.length > 20)),
                        value: linkedinScreenshotName ? `Screenshot: ${linkedinScreenshotName}` : (linkedinUrl ? `${linkedinUrl.slice(0, 80)}…` : "Not yet added"),
                        icon: LinkIcon,
                      },
                      { label: "About You", done: !!(pastedText && pastedText.length > 10), value: pastedText ? `${pastedText.slice(0, 80)}…` : "Not yet provided", icon: ClipboardPaste },
                    ].map((src) => (
                      <div key={src.label} className="flex items-center gap-3 border border-border rounded-2xl p-4 bg-background">
                        {src.done ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground/40" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-700 text-xs uppercase tracking-wider">{src.label}</p>
                          <p className="font-body text-xs text-muted-foreground truncate">{src.value}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowUnderstandMe(true);
                            setTimeout(() => understandMeRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                          }}
                          className="font-display text-[10px] font-700 uppercase tracking-wider text-primary hover:text-primary/80"
                        >
                          {src.done ? "Update" : "Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                  {showUnderstandMe && (
                    <div id="understand-me" className="pt-6" ref={understandMeRef}>
                      <UnderstandMe forceEditMode />
                    </div>
                  )}
                </CollapsibleEdit>

                <div id="riasec-quiz">
                  <CollapsibleEdit title="RIASEC personality quiz" defaultOpen={!riasecScores}>
                    <RiasecQuiz
                      initialScores={riasecScores}
                      initialWorkValues={savedWorkValues}
                      onComplete={handleRiasecComplete}
                    />
                  </CollapsibleEdit>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-display font-700 text-xs tracking-wider uppercase shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save changes
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <PrintableProfileGenerator
        open={showExport}
        onClose={() => setShowExport(false)}
        fileName={`${(fullName || "profile").replace(/\s+/g, "-").toLowerCase()}-profile`}
        data={{
          fullName,
          pronouns,
          tagline,
          email: user?.email || "",
          phone,
          homeTown,
          homeTownBlurb,
          locationPreference,
          careerLevel,
          salaryExpectation,
          photoUrl,
          pbIntro,
          pbLookingFor,
          pbPersonalLink,
          pbInstagram,
          pbTiktok,
          pbPortfolio,
          pbPromptAnswers,
          passions: [...passions, ...(passionsText ? passionsText.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean) : [])],
          industryInterests,
          rolePreferences,
          transferableSkills: results?.transferableSkills || [],
          targetCompanies,
          targetRoles,
          funFacts,
          lovePhotos,
          familyPhotos,
          riasecScores,
          workValues: savedWorkValues,
          personalitySummary: results?.personalityInsights,
          workHistory: workHistory.map((w) => ({ id: w.id, title: w.title, company: w.company, when: w.when, description: w.description, logoUrl: w.logoUrl, link: w.link })),
          education,
          qualifications,
        }}
      />
    </div>
  );
};

export default MyProfile;
