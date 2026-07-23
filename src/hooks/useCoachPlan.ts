import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSkillGap, type SkillWithGap } from "@/lib/skillGap";
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

export interface RolePlan {
  role_slug: string;
  role_title: string;
  readiness: number;
  ratedCount: number;
  totalCount: number;
  topGaps: SkillWithGap[];
  openTasks: CoachPlanTask[];
  doneTasks: CoachPlanTask[];
}

interface DeterministicTask {
  role_slug: string;
  task_type: string;
  title: string;
  detail: string;
  link: string;
}

/**
 * The Plan: a persisted, deterministic checklist per target role, plus any
 * bespoke tasks Howdy has added mid-conversation. A user can have several
 * target roles at once - each gets its own readiness/gap calc and checklist.
 * Deterministic tasks are generated from data that already exists (skill
 * ratings, CV presence, badges, courses) - no LLM call needed - and are
 * upserted without touching `status`, so a task the user has already marked
 * done/dismissed stays that way even if the underlying condition still
 * technically applies.
 */
export function useCoachPlan(userId: string | null | undefined) {
  const [roleSlugs, setRoleSlugs] = useState<string[]>([]);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [experienceEntries, setExperienceEntries] = useState(0);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [tasks, setTasks] = useState<CoachPlanTask[]>([]);
  const [gapByRole, setGapByRole] = useState<Record<string, Awaited<ReturnType<typeof fetchSkillGap>>>>({});
  const [hasCourseByRole, setHasCourseByRole] = useState<Record<string, boolean>>({});
  const [gapsLoaded, setGapsLoaded] = useState(false);

  const refetchTasks = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("coach_plan_tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    setTasks((data ?? []) as CoachPlanTask[]);
  }, [userId]);

  // Step 1: load target roles + profile-level signals + task list once.
  useEffect(() => {
    if (!userId) {
      setProfileLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: targetRows }, { data: profile }] = await Promise.all([
        supabase.from("user_target_roles").select("role_slug").eq("user_id", userId).order("set_at", { ascending: false }),
        supabase.from("profiles").select("job_preferences").eq("id", userId).maybeSingle(),
      ]);
      if (cancelled) return;

      setRoleSlugs((targetRows ?? []).map((r) => r.role_slug));

      const jp: any = profile?.job_preferences || {};
      setCvUploaded(Boolean(jp?.understandMe?.cvFileName));
      setExperienceEntries(Array.isArray(jp?.profileBuilder?.things) ? jp.profileBuilder.things.length : 0);

      await refetchTasks();
      if (!cancelled) setProfileLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [userId, refetchTasks]);

  // Step 2: once roles are known, fetch each role's skill-gap + course status.
  useEffect(() => {
    if (!userId || !profileLoaded) return;
    if (roleSlugs.length === 0) { setGapsLoaded(true); return; }
    let cancelled = false;
    (async () => {
      const [gapResults, courseResults] = await Promise.all([
        Promise.all(roleSlugs.map((slug) => fetchSkillGap(slug, userId))),
        Promise.all(roleSlugs.map((slug) =>
          supabase.from("skill_courses").select("id").eq("user_id", userId).eq("role_slug", slug).maybeSingle()
        )),
      ]);
      if (cancelled) return;
      const gapMap: Record<string, Awaited<ReturnType<typeof fetchSkillGap>>> = {};
      const courseMap: Record<string, boolean> = {};
      roleSlugs.forEach((slug, i) => {
        gapMap[slug] = gapResults[i];
        courseMap[slug] = Boolean(courseResults[i].data);
      });
      setGapByRole(gapMap);
      setHasCourseByRole(courseMap);
      setGapsLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [userId, profileLoaded, roleSlugs]);

  // Step 3: once every role's gap data is in, generate (and upsert) each
  // role's deterministic checklist. Re-runs whenever the underlying gap
  // numbers change - each run reads fresh values, no stale closures.
  useEffect(() => {
    if (!userId || !gapsLoaded || roleSlugs.length === 0) return;
    let cancelled = false;
    (async () => {
      const allDeterministic: DeterministicTask[] = [];
      for (const slug of roleSlugs) {
        const gap = gapByRole[slug];
        if (!gap) continue;
        const roleTitle = roles.find((r) => r.slug === slug)?.title ?? slug;
        const hasCourse = hasCourseByRole[slug] ?? false;

        if (gap.ratedCount < gap.totalCount) {
          const remaining = gap.totalCount - gap.ratedCount;
          allDeterministic.push({
            role_slug: slug,
            task_type: "rate_skills",
            title: `Rate your remaining ${remaining} ${roleTitle} skill${remaining === 1 ? "" : "s"}`,
            detail: "Skills England data, rated 1-5 - this is what your readiness score is built from.",
            link: `/skills-passport?tab=assessment&role=${slug}`,
          });
        }

        if (!cvUploaded) {
          allDeterministic.push({
            role_slug: slug,
            task_type: "upload_cv",
            title: "Upload your CV",
            detail: "Employers can't consider you for real without one, however strong your skills are.",
            link: "/my-profile",
          });
        }

        if (gap.overallReadiness < 50 && experienceEntries < 2) {
          allDeterministic.push({
            role_slug: slug,
            task_type: "build_experience",
            title: "Build some real experience in the meantime",
            detail: "A short volunteering placement or work-experience week counts for more than applying cold right now.",
            link: "/resources/volunteering",
          });
        }

        if (gap.overallReadiness < 50 && !hasCourse) {
          allDeterministic.push({
            role_slug: slug,
            task_type: "take_course",
            title: `Start your ${roleTitle} accreditation course`,
            detail: "A short AI-guided course targeted at your specific gaps.",
            link: `/skills-passport?tab=gaps&role=${slug}`,
          });
        }

        allDeterministic.push({
          role_slug: slug,
          task_type: "stand_out",
          title: "Learn how to stand out",
          detail: "Once the basics are in place, this is what actually gets you noticed.",
          link: "/how-to-stand-out",
        });
      }

      // Deliberately omit `status` from the payload - upserting won't touch
      // it, so a task the user already marked done/dismissed stays that way
      // even if the underlying condition still applies.
      await supabase.from("coach_plan_tasks").upsert(
        allDeterministic.map((t) => ({ user_id: userId, ...t })),
        { onConflict: "user_id,role_slug,task_type" },
      );
      if (!cancelled) await refetchTasks();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, gapsLoaded, roleSlugs, gapByRole, hasCourseByRole, cvUploaded, experienceEntries]);

  const completeTask = useCallback(async (taskId: string) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "done", completed_at: new Date().toISOString() } : t));
    await supabase.from("coach_plan_tasks").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", taskId);
  }, []);

  const reopenTask = useCallback(async (taskId: string) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "open", completed_at: null } : t));
    await supabase.from("coach_plan_tasks").update({ status: "open", completed_at: null }).eq("id", taskId);
  }, []);

  const rolePlans: RolePlan[] = roleSlugs
    .filter((slug) => gapByRole[slug])
    .map((slug) => {
      const gap = gapByRole[slug];
      const roleTasks = tasks.filter((t) => t.role_slug === slug);
      return {
        role_slug: slug,
        role_title: roles.find((r) => r.slug === slug)?.title ?? slug,
        readiness: gap.overallReadiness,
        ratedCount: gap.ratedCount,
        totalCount: gap.totalCount,
        topGaps: gap.topGaps,
        openTasks: roleTasks.filter((t) => t.status === "open"),
        doneTasks: roleTasks.filter((t) => t.status === "done"),
      };
    });

  const generalTasks = tasks.filter((t) => !t.role_slug);

  return {
    rolePlans,
    generalOpenTasks: generalTasks.filter((t) => t.status === "open"),
    loading: !profileLoaded || (roleSlugs.length > 0 && !gapsLoaded),
    completeTask,
    reopenTask,
    refetchTasks,
  };
}
