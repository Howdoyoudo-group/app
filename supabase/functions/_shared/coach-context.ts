import { ROLE_SLUGS } from "./role-slugs.ts";

// Deno-side port of src/lib/skillGap.ts's readiness calc (can't import that
// across the Vite/Deno boundary). Mirrors it exactly - same effective-rating
// formula, same <3 gap threshold - so Howdy's numbers never disagree with
// what the user sees on the Skills Passport screens.
export function computeReadiness(
  skillRows: { id: string; skill_title: string }[],
  ratingRows: { skill_id: string; rating: number; evidenced: boolean }[],
) {
  const ratingMap = new Map(ratingRows.map((r) => [r.skill_id, r]));
  const effective = skillRows.map((s) => {
    const r = ratingMap.get(s.id);
    const rating = r ? Math.min(5, r.rating + (r.evidenced ? 0.5 : 0)) : null;
    return { ...s, rating };
  });
  const total = effective.length;
  const rated = effective.filter((s) => s.rating !== null).length;
  const sum = effective.reduce((a, s) => a + (s.rating ?? 0), 0);
  const overallReadiness = total > 0 ? Math.round((sum / (total * 5)) * 100) : 0;
  const topGaps = effective
    .filter((s) => (s.rating ?? 0) < 3)
    .sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0))
    .slice(0, 5);
  return { overallReadiness, rated, total, topGaps };
}

/**
 * Builds Howdy's "coaching focus" context block covering ALL of a user's
 * target roles (not just one) - readiness, gaps, checklist per role, plus
 * shared CV/experience/badge signals. Used by both career-assistant (text
 * chat) and howdy-voice-token (voice) so the two channels never diverge.
 * Returns "" if the user has no target roles set.
 */
export async function buildTargetRolesContext(svcClient: any, userId: string): Promise<string> {
  const [{ data: targetRows }, { data: profile }] = await Promise.all([
    svcClient
      .from("user_target_roles")
      .select("role_slug")
      .eq("user_id", userId)
      .order("set_at", { ascending: false }),
    svcClient
      .from("profiles")
      .select("job_preferences, understand_me_results, riasec_scores, work_values")
      .eq("id", userId)
      .maybeSingle(),
  ]);
  const slugs: string[] = (targetRows ?? []).map((r: any) => r.role_slug);
  if (!slugs.length) return "";

  const jobPrefs: any = profile?.job_preferences || {};
  const cvUploaded = Boolean(jobPrefs?.understandMe?.cvFileName);
  const workHistory: any[] = Array.isArray(jobPrefs?.profileBuilder?.things) ? jobPrefs.profileBuilder.things : [];
  const experienceEntries = workHistory.length;
  const understandMe: any = profile?.understand_me_results || null;

  const [{ data: badgeRows }, { data: allPlanTasks }] = await Promise.all([
    svcClient.from("earned_badges").select("industry").eq("user_id", userId),
    svcClient.from("coach_plan_tasks").select("role_slug, title, status").eq("user_id", userId).order("created_at", { ascending: true }),
  ]);

  const roleBlocks: string[] = [];
  for (const slug of slugs) {
    const roleTitle = ROLE_SLUGS.find((r) => r.slug === slug)?.title ?? slug;
    const { data: skillRows } = await svcClient.from("role_skills").select("id, skill_title").eq("slug", slug);
    const skillIds = (skillRows ?? []).map((s: any) => s.id);
    const { data: ratingRows } = skillIds.length
      ? await svcClient.from("user_skill_ratings").select("skill_id, rating, evidenced").eq("user_id", userId).in("skill_id", skillIds)
      : { data: [] as any[] };
    const { rated, total, overallReadiness, topGaps } = computeReadiness((skillRows ?? []) as any, (ratingRows ?? []) as any);
    const { data: courseRow } = await svcClient
      .from("skill_courses")
      .select("status")
      .eq("user_id", userId)
      .eq("role_slug", slug)
      .maybeSingle();

    const roleParts: string[] = [`Readiness: ${overallReadiness}% (${rated}/${total} skills self-rated)`];
    if (topGaps.length) roleParts.push(`Top gaps: ${topGaps.map((s: any) => s.skill_title).join(", ")}`);
    roleParts.push(
      courseRow
        ? `Accreditation course: ${(courseRow as any).status}`
        : "No accreditation course started yet - Howdy can suggest starting one via /skills-passport?tab=gaps."
    );

    const roleTasks = (allPlanTasks ?? []).filter((t: any) => t.role_slug === slug);
    const openTasks = roleTasks.filter((t: any) => t.status === "open");
    const doneTasks = roleTasks.filter((t: any) => t.status === "done");
    if (openTasks.length) roleParts.push(`Open items on their Plan checklist: ${openTasks.map((t: any) => t.title).join("; ")}`);
    if (doneTasks.length) roleParts.push(`Already completed on their Plan checklist: ${doneTasks.map((t: any) => t.title).join("; ")}`);

    roleBlocks.push(`### ${roleTitle}\n${roleParts.join("\n")}`);
  }

  const sharedParts: string[] = [
    `CV uploaded: ${cvUploaded ? "yes" : "no"}`,
  ];
  if (badgeRows?.length) sharedParts.push(`HDYD badges earned: ${badgeRows.map((b: any) => b.industry).join(", ")}`);
  const generalOpen = (allPlanTasks ?? []).filter((t: any) => !t.role_slug && t.status === "open");
  if (generalOpen.length) sharedParts.push(`Other open checklist items (not tied to one role): ${generalOpen.map((t: any) => t.title).join("; ")}`);

  // Real signal from their CV/onboarding (Understand Me, Match Me, logged
  // work history) - readiness % itself stays purely self-rated (must never
  // disagree with the Skills Passport screen), but Howdy should reason and
  // talk about the person using this real evidence, not just a CV yes/no
  // and a count. This is what lets Howdy say "you mention customer-facing
  // work at X - that's real evidence for your interpersonal skills" instead
  // of generic "rate your skills" advice that ignores what it already knows.
  const evidenceParts: string[] = [];
  if (workHistory.length) {
    const entries = workHistory.slice(0, 6).map((w: any) => {
      const bits = [w.title, w.company ? `at ${w.company}` : null, w.when ? `(${w.when})` : null].filter(Boolean).join(" ");
      return w.description ? `${bits} - ${w.description}` : bits;
    }).filter(Boolean);
    if (entries.length) evidenceParts.push(`Logged work/experience history:\n- ${entries.join("\n- ")}`);
  }
  if (understandMe?.transferableSkills?.length) {
    evidenceParts.push(`Transferable skills identified from their CV (Understand Me): ${understandMe.transferableSkills.join(", ")}`);
  }
  if (understandMe?.personalityInsights) {
    evidenceParts.push(`Working style, from their CV analysis: ${understandMe.personalityInsights}`);
  }
  if (understandMe?.careerLevel) {
    evidenceParts.push(`Inferred career level from CV: ${understandMe.careerLevel}`);
  }
  if (jobPrefs?.passions?.length || jobPrefs?.passionsText) {
    evidenceParts.push(`Passions: ${[...(jobPrefs.passions ?? []), jobPrefs.passionsText].filter(Boolean).join(", ")}`);
  }

  const heading = slugs.length > 1
    ? `## Target roles (coaching focus - ${slugs.length} active)`
    : `## Target role (coaching focus)`;

  const evidenceBlock = evidenceParts.length
    ? `\n\n### Real evidence from their CV, onboarding and Match Me (use this - don't ask them to repeat it, and give credit for it rather than only pointing at unrated skills)\n${evidenceParts.join("\n")}`
    : "";

  return `\n\n${heading}\n${sharedParts.join("\n")}${evidenceBlock}\n\n${roleBlocks.join("\n\n")}`;
}
