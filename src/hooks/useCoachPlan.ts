import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSkillGap } from "@/hooks/useSkillGap";
import { roles } from "@/data/roles";

export interface CoachPlanTask {
  id: string;
  role_slug: string | null;
  task_type: string;
  title: string;
  detail: string | null;
  link: string | null;
  status: "open" | "done" | "dismissed";
  source: "system" | "howdy";
  created_at: string;
  completed_at: string | null;
}

interface DeterministicTask {
  role_slug: string;
  task_type: string;
  title: string;
  detail: string;
  link: string;
}

/**
 * The Plan: a persisted, deterministic checklist of concrete next steps
 * toward the user's active target role, plus any bespoke tasks Howdy has
 * added mid-conversation. Deterministic tasks are generated from data that
 * already exists (skill ratings, CV presence, badges, courses) - no LLM
 * call needed - and are upserted without touching `status`, so a task the
 * user has already marked done/dismissed stays that way even if the
 * underlying condition still technically applies.
 */
export function useCoachPlan(userId: string | null | undefined) {
  const [activeRoleSlug, setActiveRoleSlug] = useState<string | null>(null);
  const [activeRoleTitle, setActiveRoleTitle] = useState<string | null>(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [experienceEntries, setExperienceEntries] = useState(0);
  const [hasCourse, setHasCourse] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [tasks, setTasks] = useState<CoachPlanTask[]>([]);

  const gap = useSkillGap(activeRoleSlug ?? "", userId);

  const refetchTasks = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("coach_plan_tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    setTasks((data ?? []) as CoachPlanTask[]);
  }, [userId]);

  // Step 1: load the active role + profile signals + task list once.
  useEffect(() => {
    if (!userId) {
      setProfileLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role_slug, job_preferences")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;

      const slug = (profile as any)?.active_role_slug ?? null;
      setActiveRoleSlug(slug);
      setActiveRoleTitle(slug ? (roles.find((r) => r.slug === slug)?.title ?? slug) : null);

      const jp: any = profile?.job_preferences || {};
      setCvUploaded(Boolean(jp?.understandMe?.cvFileName));
      setExperienceEntries(Array.isArray(jp?.profileBuilder?.things) ? jp.profileBuilder.things.length : 0);

      if (slug) {
        const { data: courseRow } = await supabase
          .from("skill_courses")
          .select("id")
          .eq("user_id", userId)
          .eq("role_slug", slug)
          .maybeSingle();
        if (!cancelled) setHasCourse(Boolean(courseRow));
      }

      await refetchTasks();
      if (!cancelled) setProfileLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [userId, refetchTasks]);

  // Step 2: once the role + skill-gap data are both actually loaded, generate
  // (and upsert) the deterministic checklist. Runs again whenever the
  // underlying gap numbers change - each run reads fresh values, no stale
  // closures, no polling.
  useEffect(() => {
    if (!userId || !profileLoaded || !activeRoleSlug || gap.loading) return;
    let cancelled = false;
    (async () => {
      const roleTitle = activeRoleTitle ?? activeRoleSlug;
      const deterministic: DeterministicTask[] = [];

      if (gap.ratedCount < gap.totalCount) {
        const remaining = gap.totalCount - gap.ratedCount;
        deterministic.push({
          role_slug: activeRoleSlug,
          task_type: "rate_skills",
          title: `Rate your remaining ${remaining} ${roleTitle} skill${remaining === 1 ? "" : "s"}`,
          detail: "Skills England data, rated 1-5 - this is what your readiness score is built from.",
          link: `/skills-passport?tab=assessment&role=${activeRoleSlug}`,
        });
      }

      if (!cvUploaded) {
        deterministic.push({
          role_slug: activeRoleSlug,
          task_type: "upload_cv",
          title: "Upload your CV",
          detail: "Employers can't consider you for real without one, however strong your skills are.",
          link: "/my-profile",
        });
      }

      if (gap.overallReadiness < 50 && experienceEntries < 2) {
        deterministic.push({
          role_slug: activeRoleSlug,
          task_type: "build_experience",
          title: "Build some real experience in the meantime",
          detail: "A short volunteering placement or work-experience week counts for more than applying cold right now.",
          link: "/resources/volunteering",
        });
      }

      if (gap.overallReadiness < 50 && !hasCourse) {
        deterministic.push({
          role_slug: activeRoleSlug,
          task_type: "take_course",
          title: `Start your ${roleTitle} accreditation course`,
          detail: "A short AI-guided course targeted at your specific gaps.",
          link: `/skills-passport?tab=gaps&role=${activeRoleSlug}`,
        });
      }

      deterministic.push({
        role_slug: activeRoleSlug,
        task_type: "stand_out",
        title: "Learn how to stand out",
        detail: "Once the basics are in place, this is what actually gets you noticed.",
        link: "/how-to-stand-out",
      });

      // Deliberately omit `status` from the payload - upserting won't touch
      // it, so a task the user already marked done/dismissed stays that way
      // even if the underlying condition still applies.
      await supabase.from("coach_plan_tasks").upsert(
        deterministic.map((t) => ({ user_id: userId, ...t })),
        { onConflict: "user_id,role_slug,task_type" },
      );
      if (!cancelled) await refetchTasks();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, profileLoaded, activeRoleSlug, activeRoleTitle, gap.loading, gap.ratedCount, gap.totalCount, gap.overallReadiness, cvUploaded, experienceEntries, hasCourse]);

  const completeTask = useCallback(async (taskId: string) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "done", completed_at: new Date().toISOString() } : t));
    await supabase.from("coach_plan_tasks").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", taskId);
  }, []);

  const reopenTask = useCallback(async (taskId: string) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "open", completed_at: null } : t));
    await supabase.from("coach_plan_tasks").update({ status: "open", completed_at: null }).eq("id", taskId);
  }, []);

  const openTasks = tasks.filter((t) => t.status === "open");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return {
    activeRoleSlug,
    activeRoleTitle,
    readiness: gap.overallReadiness,
    ratedCount: gap.ratedCount,
    totalCount: gap.totalCount,
    topGaps: gap.topGaps,
    tasks,
    openTasks,
    doneTasks,
    loading: !profileLoaded || gap.loading,
    completeTask,
    reopenTask,
    refetchTasks,
  };
}
