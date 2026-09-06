import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Building2, LogOut, MessageSquare, Sparkles, TrendingUp, Users, Briefcase, Loader2, ShieldCheck, Eye, MousePointerClick, Heart, BarChart3, Search, X, Trash2, RotateCcw, Inbox, Mail, MailOpen, CheckCircle2, ChevronDown, ChevronUp, Download } from "lucide-react";
import JobPostForm from "@/components/employer/JobPostForm";
import CompanyProfileEditor from "@/components/employer/CompanyProfileEditor";
import CompanyLogo from "@/components/CompanyLogo";
import OwnerInsights from "@/components/employer/OwnerInsights";

interface CompanyInfo {
  id: string;
  slug: string;
  name: string;
  industry: string | null;
  featured?: boolean;
}

// RIASEC fit (only computed when employer is a paying partner)
interface EmployerValuesVector {
  riasec: Record<string, number>; // R I A S E C → 0-100
  workValues: Record<string, number>; // creativity, autonomy, stability, variety, recognition → 0-100
  sourceRoleCount: number;
}

interface Candidate {
  user_id: string;
  display_name: string;
  industry_interests: string[];
  role_preferences: string[];
  career_level: string | null;
  location: string | null;
  riasec_code: string;
  brand_interactions: number;
  industry_interactions: number;
  match_score: number;
  fit_score: number | null; // RIASEC + work-values fit (0-100), null when employer is not a partner
  curiosity_score: number | null; // percentile rank (0-100) of platform-wide engagement breadth, null until computed
  curiosity_breadth: number | null; // 0-5, how many signal categories were active
  understand_me_summary: string | null;
  cv_skills: string[];
  cv_personality: string | null;
  cv_role_matches: string[];
  cv_industry_fit: string[];
  last_seen_at: string | null;
  badges: string[];
}

interface JobRow {
  id: string;
  title: string;
  location: string | null;
  career_level: string | null;
  role_category: string | null;
}

interface EngagementStats {
  profileViews7d: number;
  profileViews30d: number;
  uniqueVisitors30d: number;
  jobClicks7d: number;
  jobClicks30d: number;
  savesToMostWanted: number;
  topJobs: { jobId: string | null; title: string; clicks: number }[];
}

const RIASEC_KEYS = ["realistic","investigative","artistic","social","enterprising","conventional"] as const;

function riasecCode(scores: Record<string, number> | null): string {
  if (!scores) return "-";
  const sorted = RIASEC_KEYS
    .map((k) => ({ k, v: Number(scores[k] ?? 0) }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3);
  return sorted.map((s) => s.k[0].toUpperCase()).join("");
}

function anonymise(fullName: string | null, userId: string): string {
  if (!fullName) return `Candidate ${userId.slice(0, 4).toUpperCase()}`;
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ?? "Candidate";
  const lastInitial = parts[1]?.[0] ? `${parts[1][0]}.` : "";
  return `${first} ${lastInitial}`.trim();
}

const EmployerDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [loadingData, setLoadingData] = useState(true);
  const [aiBusyFor, setAiBusyFor] = useState<string | null>(null);
  const [contactBusyFor, setContactBusyFor] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "brand" | "industry" | "match">("brand");
  const [isAdmin, setIsAdmin] = useState(false);
  const [allCompanies, setAllCompanies] = useState<CompanyInfo[]>([]);
  const [employerValues, setEmployerValues] = useState<EmployerValuesVector | null>(null);
  const [switchingCompany, setSwitchingCompany] = useState(false);
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "match" | "brand">("brand");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showDismissed, setShowDismissed] = useState(false);
  const [dismissBusyFor, setDismissBusyFor] = useState<string | null>(null);
  const [mailbox, setMailbox] = useState<Array<{
    id: string;
    candidate_user_id: string;
    candidate_name: string;
    revealed_name: string | null;
    revealed_email: string | null;
    revealed_phone: string | null;
    revealed_photo: string | null;
    message: string | null;
    reply_message: string | null;
    replied_at: string | null;
    created_at: string;
    status: string;
    employer_read_at: string | null;
    cv_summary: string | null;
    cv_skills: string[];
    cv_role_matches: string[];
    cv_industry_fit: string[];
    cv_personality: string | null;
    cv_file_name: string | null;
    cv_has_file: boolean;
  }>>([]);
  const [mailboxLoading, setMailboxLoading] = useState(false);
  const [mailboxFilter, setMailboxFilter] = useState<"all" | "replied" | "unread">("all");
  const [mailboxCollapsed, setMailboxCollapsed] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/employer-login");
      return;
    }
    const load = async () => {
      // Check admin role first - admins can browse any brand
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const adminFlag = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(adminFlag);

      if (adminFlag) {
        // Load all companies for the picker
        const { data: companies } = await supabase
          .from("employer_companies")
          .select("id, slug, name, industry, featured")
          .eq("is_active", true)
          .order("name");
        const list = (companies ?? []) as CompanyInfo[];
        setAllCompanies(list);
        // Default to Howdoyoudo (owner brand) if present, otherwise first company
        const first = list.find((c) => c.slug === "howdoyoudo") ?? list[0];
        if (first) {
          setCompany(first);
          const values = await deriveEmployerValues(first);
          setEmployerValues(values);
          await Promise.all([loadCandidates(first, values), loadJobs(first), loadStats(first), loadDismissed(first), loadMailbox(first)]);
        }
        setLoadingData(false);
        return;
      }

      // Verify employer role + fetch company
      const { data: empRow } = await supabase
        .from("employer_users")
        .select("company_id, employer_companies(id, slug, name, industry, featured)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!empRow?.employer_companies) {
        toast.error("No employer profile found. Please contact us.");
        await signOut();
        navigate("/employer-login");
        return;
      }
      const c = empRow.employer_companies as any;
      const companyInfo: CompanyInfo = { id: c.id, slug: c.slug, name: c.name, industry: c.industry, featured: c.featured };
      setCompany(companyInfo);
      const values = await deriveEmployerValues(companyInfo);
      setEmployerValues(values);
      await Promise.all([loadCandidates(companyInfo, values), loadJobs(companyInfo), loadStats(companyInfo), loadDismissed(companyInfo), loadMailbox(companyInfo)]);
      setLoadingData(false);
    };
    load();
  }, [user, authLoading, navigate, signOut]);

  const switchCompany = async (companyId: string) => {
    const next = allCompanies.find((c) => c.id === companyId);
    if (!next) return;
    setSwitchingCompany(true);
    setCompany(next);
    setSelectedJobId("");
    setTab("brand");
    const values = await deriveEmployerValues(next);
    setEmployerValues(values);
    await Promise.all([loadCandidates(next, values), loadJobs(next), loadStats(next), loadDismissed(next), loadMailbox(next)]);
    setSwitchingCompany(false);
  };

  // Derive an employer's RIASEC + work-values vector from the role categories of their live jobs.
  // Only runs for paying partners (employer_companies.featured = true). Returns null otherwise.
  const deriveEmployerValues = async (c: CompanyInfo): Promise<EmployerValuesVector | null> => {
    if (!c.featured) return null;

    // Pull live jobs for this company (case-insensitive on company name)
    const { data: companyJobs } = await supabase
      .from("jobs")
      .select("role_category")
      .ilike("company", c.name)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());

    const roleCounts = new Map<string, number>();
    (companyJobs ?? []).forEach((j: any) => {
      const rc = (j.role_category || "").toLowerCase().trim();
      if (rc) roleCounts.set(rc, (roleCounts.get(rc) ?? 0) + 1);
    });

    if (roleCounts.size === 0) return null;

    const { data: roleProfiles } = await supabase
      .from("role_riasec_profiles")
      .select("role_category, riasec_scores, work_values")
      .in("role_category", Array.from(roleCounts.keys()));

    if (!roleProfiles || roleProfiles.length === 0) return null;

    const riasec: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const workValues: Record<string, number> = { creativity: 0, autonomy: 0, stability: 0, variety: 0, recognition: 0 };
    let totalWeight = 0;

    roleProfiles.forEach((rp: any) => {
      const weight = roleCounts.get(rp.role_category) ?? 1;
      totalWeight += weight;
      const rs = rp.riasec_scores || {};
      Object.keys(riasec).forEach((k) => { riasec[k] += (Number(rs[k]) || 0) * weight; });
      const wv = rp.work_values || {};
      Object.keys(workValues).forEach((k) => { workValues[k] += (Number(wv[k]) || 0) * weight; });
    });

    if (totalWeight === 0) return null;
    Object.keys(riasec).forEach((k) => { riasec[k] = riasec[k] / totalWeight; });
    Object.keys(workValues).forEach((k) => { workValues[k] = workValues[k] / totalWeight; });

    return { riasec, workValues, sourceRoleCount: roleProfiles.length };
  };

  // Cosine-style similarity (0-100) between two scalar maps with the same keys.
  const vectorFit = (a: Record<string, number>, b: Record<string, number>): number => {
    const keys = Object.keys(a);
    let dot = 0, magA = 0, magB = 0;
    keys.forEach((k) => {
      const av = Number(a[k]) || 0;
      const bv = Number(b[k]) || 0;
      dot += av * bv;
      magA += av * av;
      magB += bv * bv;
    });
    if (magA === 0 || magB === 0) return 0;
    return Math.round((dot / (Math.sqrt(magA) * Math.sqrt(magB))) * 100);
  };

  const loadJobs = async (c: CompanyInfo) => {
    // 1. Try jobs posted by / for this exact company first
    const { data: ownJobs } = await supabase
      .from("jobs")
      .select("id, title, location, career_level, role_category")
      .ilike("company", c.name)
      .order("created_at", { ascending: false })
      .limit(50);

    if (ownJobs && ownJobs.length > 0) {
      setJobs(ownJobs);
      return;
    }

    // 2. Fallback: pull jobs from the same industry so the employer can still
    //    match candidates against representative open roles in their sector.
    if (c.industry) {
      const industryVariants = Array.from(new Set([
        c.industry,
        c.industry.toLowerCase(),
        c.industry.charAt(0).toUpperCase() + c.industry.slice(1).toLowerCase(),
      ]));
      const { data: industryJobs } = await supabase
        .from("jobs")
        .select("id, title, location, career_level, role_category")
        .in("industry", industryVariants)
        .order("ai_confidence", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(50);
      setJobs(industryJobs ?? []);
      return;
    }

    // 3. Last resort: most recent jobs across the marketplace
    const { data: recentJobs } = await supabase
      .from("jobs")
      .select("id, title, location, career_level, role_category")
      .order("created_at", { ascending: false })
      .limit(50);
    setJobs(recentJobs ?? []);
  };

  const loadStats = async (c: CompanyInfo) => {
    setStatsLoading(true);
    try {
      const now = Date.now();
      const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      const since7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Pull all brand-tagged interactions in last 30d (one query, then bucket client-side)
      const { data: rows } = await supabase
        .from("user_interactions")
        .select("user_id, interaction_type, job_id, created_at, metadata")
        .eq("company_slug", c.slug)
        .gte("created_at", since30)
        .limit(5000);

      const all = rows ?? [];
      const in7 = all.filter((r) => r.created_at >= since7);

      const isView = (t: string) => t === "company_view" || t === "page_view" || t === "profile_view";
      const isJobClick = (t: string) => t === "job_click";
      const isSave = (t: string) => t === "save_company";

      const profileViews30d = all.filter((r) => isView(r.interaction_type)).length;
      const profileViews7d = in7.filter((r) => isView(r.interaction_type)).length;
      const jobClicks30d = all.filter((r) => isJobClick(r.interaction_type)).length;
      const jobClicks7d = in7.filter((r) => isJobClick(r.interaction_type)).length;
      const savesToMostWanted = all.filter((r) => isSave(r.interaction_type)).length;

      const uniq = new Set<string>();
      all.forEach((r) => { if (isView(r.interaction_type)) uniq.add(r.user_id); });

      // Top jobs by clicks
      const jobClickRows = all.filter((r) => isJobClick(r.interaction_type));
      const byJob = new Map<string, number>();
      jobClickRows.forEach((r) => {
        const key = r.job_id ?? `meta:${(r.metadata as any)?.job_title ?? "unknown"}`;
        byJob.set(key, (byJob.get(key) ?? 0) + 1);
      });

      // Resolve job titles
      const jobIds = Array.from(byJob.keys()).filter((k) => !k.startsWith("meta:"));
      const titles = new Map<string, string>();
      if (jobIds.length) {
        const { data: jrows } = await supabase
          .from("jobs")
          .select("id, title")
          .in("id", jobIds);
        (jrows ?? []).forEach((j: any) => titles.set(j.id, j.title));
      }

      const topJobs = Array.from(byJob.entries())
        .map(([key, clicks]) => ({
          jobId: key.startsWith("meta:") ? null : key,
          title: key.startsWith("meta:") ? key.slice(5) : (titles.get(key) ?? "Removed listing"),
          clicks,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      setStats({
        profileViews7d,
        profileViews30d,
        uniqueVisitors30d: uniq.size,
        jobClicks7d,
        jobClicks30d,
        savesToMostWanted,
        topJobs,
      });
    } catch (e) {
      console.error("loadStats failed", e);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadDismissed = async (c: CompanyInfo) => {
    const { data } = await supabase
      .from("dismissed_candidates")
      .select("candidate_user_id")
      .eq("company_id", c.id);
    setDismissedIds(new Set((data ?? []).map((r) => r.candidate_user_id)));
  };

  const loadMailbox = async (c: CompanyInfo) => {
    setMailboxLoading(true);
    try {
      const { data: requests, error } = await supabase
        .from("contact_requests")
        .select("id, candidate_user_id, message, reply_message, replied_at, created_at, status, employer_read_at, details_shared")
        .eq("company_id", c.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const list = requests ?? [];
      const ids = Array.from(new Set(list.map((r: any) => r.candidate_user_id)));
      const repliedIds = new Set(
        list.filter((r: any) => r.details_shared === true).map((r: any) => r.candidate_user_id)
      );
      const profMap = new Map<string, { full_name: string | null; phone: string | null; photo_url: string | null; understand_me_results: any }>();
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, phone, photo_url, understand_me_results")
          .in("id", ids);
        (profs ?? []).forEach((p: any) =>
          profMap.set(p.id, { full_name: p.full_name, phone: p.phone, photo_url: p.photo_url, understand_me_results: p.understand_me_results })
        );
      }
      // Fetch real emails for replied candidates via secure RPC
      const emailMap = new Map<string, string | null>();
      await Promise.all(
        Array.from(repliedIds).map(async (cid) => {
          const { data } = await supabase.rpc("get_replied_candidate_email", { _candidate_id: cid });
          emailMap.set(cid as string, (data as string | null) ?? null);
        })
      );
      setMailbox(
        list.map((r: any) => {
          const isReplied = repliedIds.has(r.candidate_user_id);
          const prof = profMap.get(r.candidate_user_id);
          const um = (isReplied ? prof?.understand_me_results : null) || {};
          const umInputData = (um._inputData || {}) as Record<string, unknown>;
          const cvFileName = typeof umInputData.cvFileName === "string" ? umInputData.cvFileName : null;
          const cvFilePath = typeof umInputData.cvFilePath === "string" ? umInputData.cvFilePath : null;
          const roleMatches = Array.isArray(um.roleMatches)
            ? um.roleMatches.map((x: any) => x?.role || x?.title).filter(Boolean).slice(0, 6)
            : [];
          const industryFit = Array.isArray(um.industryFit)
            ? um.industryFit.map((x: any) => x?.industry || x?.name).filter(Boolean).slice(0, 6)
            : [];
          return {
            id: r.id,
            candidate_user_id: r.candidate_user_id,
            candidate_name: isReplied && prof?.full_name
              ? prof.full_name
              : (prof ? anonymise(prof.full_name, r.candidate_user_id) : `Candidate ${String(r.candidate_user_id).slice(0, 4).toUpperCase()}`),
            revealed_name: isReplied ? (prof?.full_name ?? null) : null,
            revealed_email: isReplied ? (emailMap.get(r.candidate_user_id) ?? null) : null,
            revealed_phone: isReplied ? (prof?.phone ?? null) : null,
            revealed_photo: isReplied ? (prof?.photo_url ?? null) : null,
            message: r.message,
            reply_message: r.reply_message,
            replied_at: r.replied_at,
            created_at: r.created_at,
            status: r.status,
            employer_read_at: r.employer_read_at,
            cv_summary: typeof um.summary === "string" ? um.summary : null,
            cv_skills: Array.isArray(um.transferableSkills) ? um.transferableSkills.slice(0, 12) : [],
            cv_role_matches: roleMatches,
            cv_industry_fit: industryFit,
            cv_personality: typeof um.personalityInsights === "string" ? um.personalityInsights : null,
            cv_file_name: isReplied ? cvFileName : null,
            cv_has_file: isReplied && !!cvFilePath,
          };
        })
      );
    } catch (e: any) {
      console.error("loadMailbox failed", e);
      setMailbox([]);
    } finally {
      setMailboxLoading(false);
    }
  };

  const markMailboxRead = async (id: string) => {
    const { error } = await supabase
      .from("contact_requests")
      .update({ employer_read_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMailbox((prev) => prev.map((m) => (m.id === id ? { ...m, employer_read_at: new Date().toISOString() } : m)));
  };

  const [deletingMailboxId, setDeletingMailboxId] = useState<string | null>(null);
  const deleteMailboxThread = async (id: string) => {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    setDeletingMailboxId(id);
    const { error } = await supabase.from("contact_requests").delete().eq("id", id);
    setDeletingMailboxId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMailbox((prev) => prev.filter((m) => m.id !== id));
    toast.success("Conversation deleted.");
  };

  const [cvDownloadingFor, setCvDownloadingFor] = useState<string | null>(null);
  const downloadCandidateCv = async (candidateUserId: string) => {
    setCvDownloadingFor(candidateUserId);
    try {
      const { data, error } = await supabase.functions.invoke("get-candidate-cv", {
        body: { candidateUserId },
      });
      if (error || !data?.success || !data?.url) {
        toast.error(data?.error || "Could not open the candidate's CV.");
        return;
      }
      window.open(data.url as string, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      console.error("downloadCandidateCv failed", e);
      toast.error("Could not open the candidate's CV.");
    } finally {
      setCvDownloadingFor(null);
    }
  };

  const dismissCandidate = async (candidateId: string) => {
    if (!company || !user) return;
    setDismissBusyFor(candidateId);
    const { error } = await supabase
      .from("dismissed_candidates")
      .insert({
        company_id: company.id,
        candidate_user_id: candidateId,
        dismissed_by: user.id,
      });
    setDismissBusyFor(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDismissedIds((prev) => new Set(prev).add(candidateId));
    toast.success("Candidate hidden from your view.");
  };

  const restoreCandidate = async (candidateId: string) => {
    if (!company) return;
    setDismissBusyFor(candidateId);
    const { error } = await supabase
      .from("dismissed_candidates")
      .delete()
      .eq("company_id", company.id)
      .eq("candidate_user_id", candidateId);
    setDismissBusyFor(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(candidateId);
      return next;
    });
    toast.success("Candidate restored.");
  };

  const loadCandidates = async (c: CompanyInfo, values: EmployerValuesVector | null = null) => {
    // Case-insensitive industry matching helpers - profiles store "Fashion",
    // employer_companies stores "fashion".
    const industryVariants = c.industry
      ? Array.from(new Set([
          c.industry,
          c.industry.toLowerCase(),
          c.industry.charAt(0).toUpperCase() + c.industry.slice(1).toLowerCase(),
          c.industry.toUpperCase(),
        ]))
      : [];

    // 1. Brand interactions (page views, saves, etc. tagged with our slug)
    const { data: brandRows } = await supabase
      .from("user_interactions")
      .select("user_id, created_at")
      .eq("company_slug", c.slug);

    // 2. Industry interactions (anyone who viewed any page in our industry)
    const { data: industryRows } = industryVariants.length
      ? await supabase
          .from("user_interactions")
          .select("user_id, created_at")
          .in("industry", industryVariants)
      : { data: [] as { user_id: string; created_at: string }[] };

    // 3. People who saved our brand to Most Wanted
    const { data: wantedRows } = await supabase
      .from("profiles")
      .select("id")
      .contains("job_preferences", { targetCompanies: [c.name] });

    // Tally counts (saves count as one brand interaction each) and last-seen
    const brandCount = new Map<string, number>();
    const lastSeen = new Map<string, string>();
    const bumpLastSeen = (uid: string, ts: string | null | undefined) => {
      if (!ts) return;
      const cur = lastSeen.get(uid);
      if (!cur || ts > cur) lastSeen.set(uid, ts);
    };
    (brandRows ?? []).forEach((r: any) => {
      brandCount.set(r.user_id, (brandCount.get(r.user_id) ?? 0) + 1);
      bumpLastSeen(r.user_id, r.created_at);
    });
    (wantedRows ?? []).forEach((r) => brandCount.set(r.id, (brandCount.get(r.id) ?? 0) + 1));

    const industryCount = new Map<string, number>();
    (industryRows ?? []).forEach((r: any) => {
      industryCount.set(r.user_id, (industryCount.get(r.user_id) ?? 0) + 1);
      bumpLastSeen(r.user_id, r.created_at);
    });

    // 4. Profiles whose industry_interests includes our industry (passive engagement signal)
    const userIds = new Set<string>([...brandCount.keys(), ...industryCount.keys()]);

    if (industryVariants.length) {
      const { data: passiveRows } = await supabase
        .from("profiles")
        .select("id")
        .overlaps("industry_interests", industryVariants);
      (passiveRows ?? []).forEach((r) => userIds.add(r.id));
    }

    if (userIds.size === 0) {
      setCandidates([]);
      return;
    }

    // 4. Fetch profile details for these users
    const ids = Array.from(userIds);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, industry_interests, role_preferences, career_level, location_preference, riasec_scores, work_values, understand_me_results, curiosity_score, curiosity_breadth")
      .in("id", ids);

    // Fetch visible earned badges for these candidates
    const { data: badgeRows } = await supabase
      .from("earned_badges")
      .select("user_id,industry")
      .in("user_id", ids)
      .eq("visible_to_employers", true);
    const badgeMap = new Map<string, string[]>();
    (badgeRows ?? []).forEach((r: any) => {
      const list = badgeMap.get(r.user_id) ?? [];
      list.push(r.industry);
      badgeMap.set(r.user_id, list);
    });

    const result: Candidate[] = (profiles ?? []).map((p: any) => {
      const code = riasecCode(p.riasec_scores);
      const fitScore = computeFit(p, values);
      const matchScore = computeMatch(p, c, fitScore);
      const um = p.understand_me_results || {};
      const roleMatches = Array.isArray(um.roleMatches)
        ? um.roleMatches.map((r: any) => r?.role || r?.title).filter(Boolean).slice(0, 6)
        : [];
      const industryFit = Array.isArray(um.industryFit)
        ? um.industryFit.map((r: any) => r?.industry || r?.name).filter(Boolean).slice(0, 6)
        : [];
      return {
        user_id: p.id,
        display_name: anonymise(p.full_name, p.id),
        industry_interests: p.industry_interests ?? [],
        role_preferences: p.role_preferences ?? [],
        career_level: p.career_level,
        location: p.location_preference,
        riasec_code: code,
        brand_interactions: brandCount.get(p.id) ?? 0,
        industry_interactions: industryCount.get(p.id) ?? 0,
        match_score: matchScore,
        fit_score: fitScore,
        curiosity_score: p.curiosity_score ?? null,
        curiosity_breadth: p.curiosity_breadth ?? null,
        understand_me_summary: um?.summary ?? null,
        cv_skills: Array.isArray(um.transferableSkills) ? um.transferableSkills.slice(0, 12) : [],
        cv_personality: typeof um.personalityInsights === "string" ? um.personalityInsights : null,
        cv_role_matches: roleMatches,
        cv_industry_fit: industryFit,
        last_seen_at: lastSeen.get(p.id) ?? null,
        badges: badgeMap.get(p.id) ?? [],
      };
    });

    // Default sort: brand interactions desc, then match score
    result.sort((a, b) => (b.brand_interactions - a.brand_interactions) || (b.match_score - a.match_score));
    setCandidates(result);
  };

  // Compute RIASEC + work-values fit between a candidate and the employer's derived values vector.
  // Returns null when employer is not a partner (no values vector) or candidate has no scores.
  const computeFit = (profile: any, values: EmployerValuesVector | null): number | null => {
    if (!values) return null;
    const candRiasec = profile.riasec_scores || null;
    const candValues = profile.work_values || null;
    if (!candRiasec && !candValues) return null;
    const riasecFit = candRiasec ? vectorFit(values.riasec, candRiasec) : null;
    const wvFit = candValues ? vectorFit(values.workValues, candValues) : null;
    if (riasecFit !== null && wvFit !== null) return Math.round(riasecFit * 0.6 + wvFit * 0.4);
    return riasecFit ?? wvFit ?? null;
  };

  const computeMatch = (profile: any, c: CompanyInfo, fitScore: number | null = null): number => {
    let score = 0;
    if (c.industry && profile.industry_interests?.includes(c.industry)) score += 50;
    if (profile.career_level) score += 10;
    if (profile.riasec_scores) score += 20;
    if (profile.understand_me_results) score += 20;
    // For paying partners, RIASEC fit replaces the flat +20 with a weighted signal up to +40.
    if (fitScore !== null) score += Math.round((fitScore - 50) * 0.4); // -20 to +20 around neutral
    // Curiosity: percentile rank of platform-wide engagement breadth (see
    // compute-curiosity-scores). Null for not-yet-computed profiles adds
    // nothing. Scaled to +18 max - meaningful but doesn't dominate the
    // static-profile signals above.
    if (profile.curiosity_score != null) score += Math.round((profile.curiosity_score / 100) * 18);
    // Clamp to the advertised 0-100 range (the tooltip has always claimed
    // "0-100"; scores could technically exceed 100 before this).
    return Math.max(0, Math.min(100, score));
  };

  const filteredCandidates = useMemo(() => {
    // 1. Tab filter
    let list: Candidate[];
    if (tab === "brand") list = candidates.filter((c) => c.brand_interactions > 0);
    else if (tab === "industry") list = candidates.filter((c) => c.industry_interactions > 0 || c.industry_interests.length > 0);
    else if (tab === "match" && selectedJobId) {
      const job = jobs.find((j) => j.id === selectedJobId);
      list = job
        ? candidates.map((c) => {
            let s = c.match_score;
            if (job.career_level && c.career_level === job.career_level) s += 15;
            if (job.role_category && c.role_preferences.includes(job.role_category)) s += 25;
            return { ...c, match_score: s };
          })
        : candidates;
    } else {
      list = candidates;
    }

    // 2. Dismissed filter
    list = showDismissed
      ? list.filter((c) => dismissedIds.has(c.user_id))
      : list.filter((c) => !dismissedIds.has(c.user_id));

    // 3. Search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const haystack = [
          c.display_name,
          c.career_level ?? "",
          c.location ?? "",
          c.riasec_code,
          ...(c.role_preferences ?? []),
          ...(c.industry_interests ?? []),
        ].join(" ").toLowerCase();
        return haystack.includes(q);
      });
    }

    // 4. Sort
    const sorted = [...list];
    if (sortBy === "recent") {
      sorted.sort((a, b) => {
        const ax = a.last_seen_at ? Date.parse(a.last_seen_at) : 0;
        const bx = b.last_seen_at ? Date.parse(b.last_seen_at) : 0;
        return bx - ax;
      });
    } else if (sortBy === "match") {
      sorted.sort((a, b) => b.match_score - a.match_score);
    } else {
      sorted.sort((a, b) => (b.brand_interactions - a.brand_interactions) || (b.match_score - a.match_score));
    }
    return sorted;
  }, [candidates, tab, selectedJobId, jobs, searchQuery, sortBy, dismissedIds, showDismissed]);

  const requestAiSummary = async (candidateId: string) => {
    setAiBusyFor(candidateId);
    try {
      const { data, error } = await supabase.functions.invoke("employer-candidate-summary", {
        body: { candidateUserId: candidateId },
      });
      if (error) throw error;
      toast.success("AI summary ready.");
      // Patch into local state
      setCandidates((prev) => prev.map((c) =>
        c.user_id === candidateId ? { ...c, understand_me_summary: data.summary } : c
      ));
    } catch (e: any) {
      toast.error(e.message ?? "Could not generate summary.");
    } finally {
      setAiBusyFor(null);
    }
  };

  const requestContact = async (candidateId: string) => {
    setContactBusyFor(candidateId);
    try {
      const { data, error } = await supabase.functions.invoke("employer-request-contact", {
        body: {
          candidateUserId: candidateId,
          companyId: company?.id,
          message: `${company?.name} have their eye on you and would like to chat.`,
        },
      });
      if (error) throw error;
      if (data && data.ok === false) {
        toast.info(data.error ?? "Could not send request.");
        return;
      }
      toast.success("Contact request sent. The candidate will receive an email.");
      if (company) loadMailbox(company);
    } catch (e: any) {
      toast.error(e.message ?? "Could not send request.");
    } finally {
      setContactBusyFor(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/employer-login");
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sign out - fixed pill matching the global Home pill on the left */}
      <div className="fixed top-3 right-3 md:top-6 md:right-6 z-50">
        <button onClick={handleSignOut} aria-label="Sign out">
          <span className="relative inline-flex items-center hover:opacity-90 transition-opacity">
            <svg
              viewBox="0 0 140 52"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              <path
                d="M26,3 C14,3 4,14 3,26 C3,38 13,49 26,49 L114,49 C127,49 137,38 137,26 C138,14 127,3 114,3 Z"
                fill="hsl(120, 100%, 45%)"
                stroke="hsl(0, 0%, 7%)"
                strokeWidth="4.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <span className="relative inline-flex items-center gap-1.5 font-display font-900 text-xs md:text-sm tracking-wide uppercase text-foreground px-5 py-2.5 whitespace-nowrap">
              <LogOut className="w-4 h-4" strokeWidth={3} />
              Sign out
            </span>
          </span>
        </button>
      </div>

      {/* Header - logo-style title centred */}
      <div className="border-b-2 border-foreground bg-background sticky top-0 z-10">
        <div className="relative max-w-7xl mx-auto px-24 md:px-32 py-4 flex items-center justify-center">
          <Link to="/employer-dashboard" className="font-display text-2xl md:text-3xl uppercase tracking-tight leading-none">
            Talent <span className="text-primary">Pool</span>
          </Link>
        </div>
        {isAdmin && (
          <div className="border-t border-border bg-muted/40">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Browse brand:</span>
              <select
                value={company?.id ?? ""}
                onChange={(e) => switchCompany(e.target.value)}
                disabled={switchingCompany}
                className="text-sm font-body border-2 border-foreground bg-background px-3 py-1.5 disabled:opacity-50"
              >
                {allCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.industry ? ` - ${c.industry}` : ""}
                  </option>
                ))}
              </select>
              {switchingCompany && <Loader2 className="w-4 h-4 animate-spin" />}
              {company && (
                <label className="ml-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wide cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!company.featured}
                    onChange={async (e) => {
                      const next = e.target.checked;
                      const prev = company.featured;
                      setCompany({ ...company, featured: next });
                      setAllCompanies((list) => list.map((c) => c.id === company.id ? { ...c, featured: next } : c));
                      const { error } = await supabase
                        .from("employer_companies")
                        .update({ featured: next })
                        .eq("id", company.id);
                      if (error) {
                        toast.error("Could not update partner status", { description: error.message });
                        setCompany({ ...company, featured: prev });
                        setAllCompanies((list) => list.map((c) => c.id === company.id ? { ...c, featured: prev } : c));
                      } else {
                        toast.success(next ? "Marked as paying partner" : "Removed partner status");
                      }
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  Paying partner {company.featured && <span className="text-primary">●</span>}
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Active brand label - sits above the Post a job panel */}
        {company && (
          <div className="mb-4 flex items-center gap-3">
            <CompanyLogo company={company.name} size={48} />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Brand</div>
              <div className="font-display text-xl leading-tight">{company.name}</div>
            </div>
          </div>
        )}

        {/* Owner-only Site Insights - visible when active brand is Howdoyoudo */}
        {company && company.slug === "howdoyoudo" && <OwnerInsights />}

        {/* Post a job */}
        {company && user && (
          <JobPostForm
            companyId={company.id}
            companyName={company.name}
            companyIndustry={company.industry}
            posterUserId={user.id}
            onPosted={() => loadJobs(company)}
          />
        )}

        {/* Company profile editor */}
        {company && (
          <CompanyProfileEditor
            companyId={company.id}
            companySlug={company.slug}
            companyName={company.name}
          />
        )}

        {/* Mailbox - contact requests sent + candidate replies */}
        {company && (
          <div className="mb-8 border-2 border-foreground rounded-2xl overflow-hidden">
            {(() => {
              const totalCount = mailbox.length;
              const repliedCount = mailbox.filter((m) => !!m.reply_message).length;
              const unreadCount = mailbox.filter((m) => !!m.reply_message && !m.employer_read_at).length;
              return (
                <>
                  <div className="bg-primary/10 border-b-2 border-foreground px-4 py-3 flex items-center gap-3 flex-wrap">
                    <Inbox className="w-5 h-5" strokeWidth={3} />
                    <h2 className="font-display text-xl uppercase tracking-wide">Mailbox</h2>
                    <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 bg-foreground text-background rounded-full text-[11px] font-bold tabular-nums">
                      {totalCount}
                    </span>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 bg-primary text-primary-foreground rounded-full text-[11px] font-bold tabular-nums uppercase tracking-wide">
                        {unreadCount} new
                      </span>
                    )}
                    {mailboxLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    <span className="ml-auto text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {totalCount} {totalCount === 1 ? "thread" : "threads"} · {repliedCount} replied · {unreadCount} unread
                    </span>
                    <button
                      type="button"
                      onClick={() => setMailboxCollapsed((v) => !v)}
                      aria-expanded={!mailboxCollapsed}
                      aria-controls="mailbox-body"
                      className="inline-flex items-center gap-1 px-2 py-1 border-2 border-foreground bg-background hover:bg-primary text-[10px] font-bold uppercase tracking-wider rounded-full"
                    >
                      {mailboxCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                      {mailboxCollapsed ? "Expand" : "Collapse"}
                    </button>
                  </div>

                  {!mailboxCollapsed && (
                  <div id="mailbox-body">
                  <div className="px-4 py-2 border-b-2 border-foreground/10 flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold uppercase tracking-wide text-muted-foreground mr-1">Filter</span>
                    <button
                      type="button"
                      onClick={() => setMailboxFilter("all")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 border-foreground rounded-full font-display font-700 uppercase text-[10px] tracking-wider ${mailboxFilter === "all" ? "bg-foreground text-background" : "bg-background text-foreground"}`}
                    >
                      All
                      <span className={`tabular-nums px-1.5 rounded-full text-[10px] ${mailboxFilter === "all" ? "bg-background text-foreground" : "bg-foreground/10 text-foreground"}`}>{totalCount}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMailboxFilter("replied")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 border-foreground rounded-full font-display font-700 uppercase text-[10px] tracking-wider ${mailboxFilter === "replied" ? "bg-foreground text-background" : "bg-background text-foreground"}`}
                    >
                      Replies received
                      <span className={`tabular-nums px-1.5 rounded-full text-[10px] ${mailboxFilter === "replied" ? "bg-background text-foreground" : "bg-foreground/10 text-foreground"}`}>{repliedCount}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMailboxFilter("unread")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 border-foreground rounded-full font-display font-700 uppercase text-[10px] tracking-wider ${mailboxFilter === "unread" ? "bg-foreground text-background" : "bg-background text-foreground"}`}
                    >
                      Unread replies
                      <span className={`tabular-nums px-1.5 rounded-full text-[10px] ${mailboxFilter === "unread" ? "bg-background text-foreground" : (unreadCount > 0 ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-foreground")}`}>{unreadCount}</span>
                    </button>
                  </div>

            {mailbox.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No contact requests yet. When you reach out to a candidate from the talent pool, the conversation will appear here.
              </div>
            ) : (
              <ul className="divide-y-2 divide-foreground/10">
                {mailbox
                  .filter((m) => {
                    if (mailboxFilter === "replied") return !!m.reply_message;
                    if (mailboxFilter === "unread") return !!m.reply_message && !m.employer_read_at;
                    return true;
                  })
                  .map((m) => {
                    const isUnreadReply = !!m.reply_message && !m.employer_read_at;
                    return (
                      <li key={m.id} className={`px-4 py-3 flex items-start gap-3 ${isUnreadReply ? "bg-primary/5" : ""}`}>
                        <div className={`w-9 h-9 rounded-full border-2 border-foreground flex items-center justify-center shrink-0 ${isUnreadReply ? "bg-primary/30" : "bg-muted"}`}>
                          {isUnreadReply ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="font-display font-800 text-sm text-foreground">
                              {m.candidate_name}
                              {isUnreadReply && (
                                <span className="ml-2 inline-block px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-700 uppercase tracking-wider rounded-full">
                                  New reply
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground/80">
                                {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              <button
                                type="button"
                                onClick={() => deleteMailboxThread(m.id)}
                                disabled={deletingMailboxId === m.id}
                                title="Delete conversation"
                                aria-label="Delete conversation"
                                className="inline-flex items-center justify-center w-6 h-6 border-2 border-foreground rounded-full bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-60"
                              >
                                {deletingMailboxId === m.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Outbound message you sent */}
                          <div className="mt-1.5 border-l-2 border-foreground/30 pl-2.5">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">
                              You sent
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                              {m.message ?? `${company.name} have their eye on you and would like to chat.`}
                            </p>
                          </div>

                          {/* Candidate reply */}
                          {m.reply_message ? (
                            <div className="mt-2 border-2 border-foreground/20 bg-background rounded-xl px-3 py-2">
                              <div className="flex items-center gap-1.5 mb-1">
                                <CheckCircle2 className="w-3 h-3 text-primary" />
                                <span className="font-display text-[10px] font-700 uppercase tracking-wider text-foreground">
                                  Candidate replied
                                </span>
                                {m.replied_at && (
                                  <span className="text-[10px] text-muted-foreground/80">
                                    · {new Date(m.replied_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                  </span>
                                )}
                                {isUnreadReply && (
                                  <button
                                    type="button"
                                    onClick={() => markMailboxRead(m.id)}
                                    className="ml-auto text-[10px] font-display font-700 uppercase tracking-wider text-primary hover:underline"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                                {m.reply_message}
                              </p>
                              {(m.revealed_email || m.revealed_phone || m.revealed_name) && (
                                <div className="mt-2.5 pt-2.5 border-t-2 border-foreground/10">
                                  <div className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1.5">
                                    Contact details unlocked
                                  </div>
                                  <div className="flex items-start gap-2.5">
                                    {m.revealed_photo && (
                                      <img
                                        src={m.revealed_photo}
                                        alt={m.revealed_name ?? "Candidate"}
                                        className="w-10 h-10 rounded-full border-2 border-foreground object-cover shrink-0"
                                      />
                                    )}
                                    <div className="text-xs text-foreground space-y-0.5 min-w-0">
                                      {m.revealed_name && (
                                        <div className="font-display font-700">{m.revealed_name}</div>
                                      )}
                                      {m.revealed_email && (
                                        <div className="truncate">
                                          <a href={`mailto:${m.revealed_email}`} className="underline hover:text-primary">
                                            {m.revealed_email}
                                          </a>
                                        </div>
                                      )}
                                      {m.revealed_phone && (
                                        <div>
                                          <a href={`tel:${m.revealed_phone}`} className="underline hover:text-primary">
                                            {m.revealed_phone}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {m.cv_has_file && (
                                    <button
                                      type="button"
                                      onClick={() => downloadCandidateCv(m.candidate_user_id)}
                                      disabled={cvDownloadingFor === m.candidate_user_id}
                                      className="mt-2.5 inline-flex items-center gap-1.5 border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground transition-colors px-2.5 py-1 text-[11px] font-display font-700 uppercase tracking-wider disabled:opacity-60"
                                    >
                                      {cvDownloadingFor === m.candidate_user_id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Download className="w-3 h-3" />
                                      )}
                                      Download CV
                                      {m.cv_file_name && (
                                        <span className="font-body font-400 normal-case tracking-normal text-foreground/60 truncate max-w-[140px]">
                                          · {m.cv_file_name}
                                        </span>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}
                              {(m.cv_summary || m.cv_skills.length > 0 || m.cv_role_matches.length > 0 || m.cv_industry_fit.length > 0 || m.cv_personality) && (
                                <div className="mt-2.5 pt-2.5 border-t-2 border-foreground/10">
                                  <div className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1.5">
                                    CV summary
                                  </div>
                                  {m.cv_summary && (
                                    <p className="text-xs text-foreground/80 italic border-l-2 border-primary pl-2 mb-2">
                                      {m.cv_summary}
                                    </p>
                                  )}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {m.cv_role_matches.length > 0 && (
                                      <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Best-fit roles</div>
                                        <div className="flex flex-wrap gap-1">
                                          {m.cv_role_matches.map((r) => (
                                            <span key={r} className="text-[11px] border-2 border-foreground px-2 py-0.5 bg-background">{r}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {m.cv_industry_fit.length > 0 && (
                                      <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Industry fit</div>
                                        <div className="flex flex-wrap gap-1">
                                          {m.cv_industry_fit.map((r) => (
                                            <span key={r} className="text-[11px] border-2 border-dashed border-foreground px-2 py-0.5 bg-background">{r}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {m.cv_skills.length > 0 && (
                                      <div className="sm:col-span-2">
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Transferable skills</div>
                                        <div className="flex flex-wrap gap-1">
                                          {m.cv_skills.map((s) => (
                                            <span key={s} className="text-[11px] border border-foreground px-2 py-0.5 bg-background">{s}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {m.cv_personality && (
                                      <div className="sm:col-span-2">
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Personality insight</div>
                                        <p className="text-[11px] text-foreground/80 italic">{m.cv_personality}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                              {m.status === "pending" ? "Waiting for reply" : m.status}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
            </div>
            )}
                </>
              );
            })()}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5" strokeWidth={3} />
            <h2 className="font-display text-xl uppercase tracking-wide">Engagement (last 30 days)</h2>
            {statsLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard
              icon={<Eye className="w-5 h-5" />}
              label="Profile views"
              value={stats?.profileViews30d ?? 0}
              sub={stats ? `${stats.profileViews7d} this week` : undefined}
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Unique visitors"
              value={stats?.uniqueVisitors30d ?? 0}
              sub="signed-in users"
            />
            <StatCard
              icon={<MousePointerClick className="w-5 h-5" />}
              label="Job clicks"
              value={stats?.jobClicks30d ?? 0}
              sub={stats ? `${stats.jobClicks7d} this week` : undefined}
            />
            <StatCard
              icon={<Heart className="w-5 h-5" />}
              label="Saves to Most Wanted"
              value={stats?.savesToMostWanted ?? 0}
            />
          </div>

          {stats && stats.topJobs.length > 0 && (
            <div className="border-2 border-foreground bg-background p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
                Top jobs by clicks
              </div>
              <ul className="divide-y-2 divide-dashed divide-foreground/30">
                {stats.topJobs.map((j, i) => (
                  <li key={`${j.jobId ?? "x"}-${i}`} className="flex items-center justify-between py-2">
                    <span className="font-medium text-sm truncate pr-3">{j.title}</span>
                    <span className="font-display text-base flex-shrink-0">{j.clicks}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stats && stats.profileViews30d === 0 && stats.jobClicks30d === 0 && (
            <p className="text-xs text-muted-foreground italic mt-2">
              No tracked engagement yet - stats appear as signed-in users browse your brand and jobs.
            </p>
          )}
        </div>

        {/* Candidate stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total candidates" value={candidates.length} />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Engaged with your brand" value={candidates.filter((c) => c.brand_interactions > 0).length} />
          <StatCard icon={<Sparkles className="w-5 h-5" />} label="Engaged with your industry" value={candidates.filter((c) => c.industry_interactions > 0 || c.industry_interests.length > 0).length} />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-foreground">
          <TabBtn active={tab === "brand"} onClick={() => setTab("brand")}>Brand engaged</TabBtn>
          <TabBtn active={tab === "industry"} onClick={() => setTab("industry")}>Industry engaged</TabBtn>
          <TabBtn active={tab === "all"} onClick={() => setTab("all")}>All candidates</TabBtn>
          <TabBtn active={tab === "match"} onClick={() => setTab("match")}>
            <Briefcase className="w-3 h-3 inline mr-1" /> Match to a job
          </TabBtn>
        </div>

        {tab === "match" && (
          <div className="mb-6 border-2 border-foreground p-4">
            <label className="block text-xs font-bold uppercase tracking-wide mb-2">Select a job to match against</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full border-2 border-foreground bg-background px-4 py-2 font-medium"
            >
              <option value="">- Choose a job -</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title} · {j.location ?? "UK"}</option>
              ))}
            </select>
            {jobs.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">No active jobs found{company?.industry ? ` in ${company.industry}` : ""}. Post a job above to start matching candidates.</p>
            )}
            {jobs.length > 0 && company?.industry && (
              <p className="text-[11px] text-muted-foreground mt-2 italic">Showing roles from {company.name} and the wider {company.industry} industry so you can match against open positions.</p>
            )}
          </div>
        )}

        {/* Search + sort + dismissed toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, location, RIASEC, industry…"
              className="w-full pl-9 pr-9 py-2 border-2 border-foreground bg-background text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold uppercase tracking-wide text-muted-foreground mr-1">Sort</span>
            <SortBtn active={sortBy === "recent"} onClick={() => setSortBy("recent")}>Recent</SortBtn>
            <SortBtn active={sortBy === "match"} onClick={() => setSortBy("match")}>Match %</SortBtn>
            <SortBtn active={sortBy === "brand"} onClick={() => setSortBy("brand")}>Brand engagement</SortBtn>
          </div>
          <button
            type="button"
            onClick={() => setShowDismissed((v) => !v)}
            className={`text-xs font-bold uppercase tracking-wide px-3 py-2 border-2 border-foreground ${showDismissed ? "bg-foreground text-background" : "bg-background hover:bg-muted"}`}
          >
            {showDismissed ? `Showing hidden (${dismissedIds.size})` : `Hidden (${dismissedIds.size})`}
          </button>
        </div>

        {/* Candidate grid */}
        {filteredCandidates.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/30 p-12 text-center">
            <p className="font-display text-xl mb-2">{showDismissed ? "No hidden candidates" : "No candidates here yet"}</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "No candidates match your search."
                : showDismissed
                  ? "Candidates you hide will appear here."
                  : "As people engage with your brand or industry, they'll appear in this view."}
            </p>
          </div>
        ) : (
          <div className="border-2 border-foreground bg-background divide-y-2 divide-foreground">
            {filteredCandidates.map((c, idx) => (
              <CandidateRow
                key={c.user_id}
                candidate={c}
                index={idx}
                companyIndustry={company?.industry ?? null}
                onAiSummary={() => requestAiSummary(c.user_id)}
                onContact={() => requestContact(c.user_id)}
                onDismiss={() => dismissCandidate(c.user_id)}
                onRestore={() => restoreCandidate(c.user_id)}
                isDismissed={dismissedIds.has(c.user_id)}
                aiBusy={aiBusyFor === c.user_id}
                contactBusy={contactBusyFor === c.user_id}
                dismissBusy={dismissBusyFor === c.user_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) => (
  <div className="border-2 border-foreground p-4 bg-background">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
      {icon} {label}
    </div>
    <div className="font-display text-3xl">{value}</div>
    {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
  </div>
);

const TabBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-bold uppercase tracking-wide border-2 border-b-0 ${active ? "bg-primary border-foreground" : "bg-background border-transparent hover:border-foreground/30"}`}
  >
    {children}
  </button>
);

const SortBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    type="button"
    className={`px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide border-2 border-foreground ${active ? "bg-primary" : "bg-background hover:bg-muted"}`}
  >
    {children}
  </button>
);

const CandidateRow = ({
  candidate,
  index,
  companyIndustry,
  onAiSummary,
  onContact,
  onDismiss,
  onRestore,
  isDismissed,
  aiBusy,
  contactBusy,
  dismissBusy,
}: {
  candidate: Candidate;
  index: number;
  companyIndustry: string | null;
  onAiSummary: () => void;
  onContact: () => void;
  onDismiss: () => void;
  onRestore: () => void;
  isDismissed: boolean;
  aiBusy: boolean;
  contactBusy: boolean;
  dismissBusy: boolean;
}) => {
  const [open, setOpen] = useState(false);
  // Cycle subtle hand-drawn accent colour per row for a doodled feel
  const accents = ["bg-primary", "bg-yellow-200", "bg-pink-200", "bg-sky-200", "bg-orange-200"];
  const accent = accents[index % accents.length];

  return (
    <div className="bg-background hover:bg-muted/30 transition-colors">
      {/* Main row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full grid grid-cols-12 gap-3 items-center px-4 py-3 text-left"
      >
        {/* Doodled avatar circle with initial */}
        <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
          <span
            className={`relative flex-shrink-0 w-10 h-10 ${accent} border-2 border-foreground flex items-center justify-center font-display text-base`}
            style={{ borderRadius: "55% 45% 52% 48% / 48% 55% 45% 52%" }}
          >
            {candidate.display_name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base truncate">{candidate.display_name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {candidate.career_level ?? "Level -"}{candidate.location ? ` · ${candidate.location}` : ""}
            </div>
            {/* Mobile-only compact stats row */}
            <div className="md:hidden mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] border-2 border-foreground px-1.5 py-0.5 bg-background">
                {candidate.riasec_code}
              </span>
              <span
                className="inline-flex items-baseline gap-1 cursor-help"
                title={`Match score (0–100): how closely this candidate fits your brand based on behaviour and profile.\n\n• ${candidate.brand_interactions} brand interactions (your company page / job clicks)\n• ${candidate.industry_interactions} industry interactions (${companyIndustry ?? "your industry"} content)\n• Curiosity: ${candidate.curiosity_score != null ? `${candidate.curiosity_score}th percentile` : "not yet computed"} platform-wide engagement (up to +18 pts)\n• Profile signals: industry interests, target companies, seniority & location\n\nHigher = stronger intent + fit. Sorted highest first.`}
              >
                <span className="font-display text-sm leading-none">{candidate.match_score}</span>
                <span className="text-[10px] text-muted-foreground">match</span>
              </span>
              {candidate.fit_score !== null && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-display border-2 border-foreground bg-[#00E600] text-foreground cursor-help"
                  title="Fit % (paying partners only): cosine similarity between this candidate's RIASEC + work-values vector and your live job mix. 100% = perfect personality/values match for the kinds of roles you're hiring for."
                >
                  {candidate.fit_score}% fit
                </span>
              )}
              {candidate.curiosity_score !== null && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-display border-2 border-foreground bg-[#FFD400] text-foreground cursor-help"
                  title={`Curiosity: ${candidate.curiosity_score}th percentile of platform-wide engagement over time — active in ${candidate.curiosity_breadth ?? 0}/5 signal areas (browsing, job saves, application tracking, learning content, saved articles/videos). Distinguishes broad, sustained curiosity from one-off browsing.`}
                >
                  {candidate.curiosity_score}% curious
                </span>
              )}
              <span
                className="text-[10px] text-muted-foreground cursor-help"
                title={`${candidate.brand_interactions} brand interactions · ${candidate.industry_interactions} industry interactions`}
              >
                {candidate.brand_interactions}b · {candidate.industry_interactions}i
              </span>
              {candidate.badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-display border-2 border-foreground bg-[#00E600] text-foreground"
                  title={`Earned the ${b} Fundamentals badge.`}
                >
                  {b.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} ✓
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIASEC tag */}
        <div className="hidden md:flex col-span-2 items-center">
          <span className="font-mono text-xs border-2 border-foreground px-2 py-0.5 bg-background">
            {candidate.riasec_code}
          </span>
        </div>

        {/* Engagement counts */}
        <div className="hidden md:flex col-span-3 items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <span className="font-display text-base leading-none">{candidate.brand_interactions}</span>
            <span className="text-muted-foreground">brand</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-display text-base leading-none">{candidate.industry_interactions}</span>
            <span className="text-muted-foreground">industry</span>
          </span>
        </div>

        {/* Match score with hand-drawn underline */}
        <div
          className="hidden md:flex col-span-2 items-center gap-2 cursor-help"
          title={`Match score (0–100): how closely this candidate fits your brand based on behaviour and profile.\n\n• ${candidate.brand_interactions} brand interactions (your company page / job clicks)\n• ${candidate.industry_interactions} industry interactions (${companyIndustry ?? "your industry"} content)\n• Curiosity: ${candidate.curiosity_score != null ? `${candidate.curiosity_score}th percentile` : "not yet computed"} platform-wide engagement (up to +18 pts)\n• Profile signals: industry interests, target companies, seniority & location\n\nHigher = stronger intent + fit. Sorted highest first.`}
        >
          <span className="relative inline-block">
            <span className="font-display text-lg">{candidate.match_score}</span>
            <svg className="absolute left-0 -bottom-1 w-full" height="4" viewBox="0 0 60 4" preserveAspectRatio="none">
              <path d="M1 2 Q15 0 30 2 T59 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-xs text-muted-foreground">match</span>
          {candidate.fit_score !== null && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-display border-2 border-foreground bg-[#00E600] text-foreground"
              title="Fit % (paying partners only): cosine similarity between this candidate's RIASEC + work-values vector and your live job mix. 100% = perfect personality/values match for the kinds of roles you're hiring for."
            >
              {candidate.fit_score}% fit
            </span>
          )}
          {candidate.curiosity_score !== null && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-display border-2 border-foreground bg-[#FFD400] text-foreground"
              title={`Curiosity: ${candidate.curiosity_score}th percentile of platform-wide engagement over time — active in ${candidate.curiosity_breadth ?? 0}/5 signal areas (browsing, job saves, application tracking, learning content, saved articles/videos). Distinguishes broad, sustained curiosity from one-off browsing.`}
            >
              {candidate.curiosity_score}% curious
            </span>
          )}
          {candidate.badges.map((b) => (
            <span
              key={b}
              className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-display border-2 border-foreground bg-[#00E600] text-foreground"
              title={`Earned the ${b} Fundamentals badge on Howdoyoudo — passed the 80% quiz on industry essentials.`}
            >
              {b.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Fundamentals ✓
            </span>
          ))}
        </div>

        {/* Expand chevron */}
        <div className="col-span-12 md:col-span-1 flex md:justify-end">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 border-2 border-foreground bg-background transition-transform ${open ? "rotate-180" : ""}`}
            style={{ borderRadius: "48% 52% 45% 55% / 52% 45% 55% 48%" }}
            aria-hidden
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1 Q5 6 9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </div>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t-2 border-dashed border-foreground/40 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Roles wanted</p>
              {candidate.role_preferences.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {candidate.role_preferences.slice(0, 6).map((r) => (
                    <span key={r} className="text-xs border-2 border-foreground px-2 py-0.5 bg-background">{r}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not specified</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Industries</p>
              {candidate.industry_interests.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {candidate.industry_interests.slice(0, 6).map((r) => (
                    <span key={r} className="text-xs border-2 border-dashed border-foreground px-2 py-0.5 bg-background">{r}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Not specified</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Snapshot</p>
              {candidate.understand_me_summary ? (
                <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2">
                  {candidate.understand_me_summary}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">No AI summary yet - generate one below.</p>
              )}
            </div>
          </div>

          {/* CV summary - visible upfront because the candidate opted in to employer visibility */}
          {(candidate.cv_skills.length > 0 || candidate.cv_personality || candidate.cv_role_matches.length > 0 || candidate.cv_industry_fit.length > 0) && (
            <div className="mt-4 border-2 border-foreground bg-muted/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wide">CV summary</p>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Shared via opt-in</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {candidate.cv_role_matches.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Best-fit roles</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.cv_role_matches.map((r) => (
                        <span key={r} className="text-xs border-2 border-foreground px-2 py-0.5 bg-background">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.cv_industry_fit.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Industry fit</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.cv_industry_fit.map((r) => (
                        <span key={r} className="text-xs border-2 border-dashed border-foreground px-2 py-0.5 bg-background">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.cv_skills.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Transferable skills</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.cv_skills.map((s) => (
                        <span key={s} className="text-xs border border-foreground px-2 py-0.5 bg-background">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.cv_personality && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Personality insight</p>
                    <p className="text-xs text-foreground/80 italic border-l-2 border-primary pl-2">{candidate.cv_personality}</p>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Contact details (email, phone, full name) remain hidden until the candidate replies to your message.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={onAiSummary}
              disabled={aiBusy}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase border-2 border-foreground bg-background hover:bg-primary disabled:opacity-50"
            >
              {aiBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI summary
            </button>
            <button
              onClick={onContact}
              disabled={contactBusy}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase border-2 border-foreground bg-primary hover:opacity-90 disabled:opacity-50"
            >
              {contactBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
              Request contact
            </button>
            {isDismissed ? (
              <button
                onClick={onRestore}
                disabled={dismissBusy}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase border-2 border-foreground bg-background hover:bg-muted disabled:opacity-50 ml-auto"
              >
                {dismissBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                Restore
              </button>
            ) : (
              <button
                onClick={onDismiss}
                disabled={dismissBusy}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase border-2 border-foreground bg-background text-muted-foreground hover:text-destructive hover:border-destructive disabled:opacity-50 ml-auto"
              >
                {dismissBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Hide
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
