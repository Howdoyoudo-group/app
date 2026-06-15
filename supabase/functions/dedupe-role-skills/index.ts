// dedupe-role-skills — AI-powered semantic deduplication of role_skills.
// Sends each role's skill list to Gemini, which identifies near-duplicates
// (same concept, different wording) and returns IDs to delete.
//
// POST {} → processes all roles
// POST { slugs: ["junior-baker", "trainee-estate-agent"] } → specific roles only
// POST { dry_run: true } → report what would be deleted without deleting
//
// Safe to re-run at any time. Typically called after sync-skills-england.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_KEY = () => Deno.env.get("GEMINI_API_KEY")!;

async function askGeminiForDupes(
  roleTitle: string,
  skills: { id: string; skill_title: string; skill_type: string; broad_domain: string }[],
): Promise<string[]> {
  const skillList = skills
    .map((s) => `  ${s.id} | ${s.broad_domain} | [${s.skill_type}] ${s.skill_title}`)
    .join("\n");

  const prompt = `You are reviewing the skills list for the role "${roleTitle}" in a UK career platform.

The list below contains many near-duplicates — same concept with slightly different wording, added as a result of multiple AI generation runs. Your job is to identify which IDs to DELETE, keeping only the best version of each distinct skill.

Skills (format: id | domain | [type] title):
${skillList}

Deduplication rules:
- Same concept, different wording → DUPLICATE. Delete all but the most specific/descriptive title.
  Examples: "Copywriting" + "Digital Copywriting" + "Copywriting for Social Media" → keep "Copywriting for Social Media", delete the other two
  "Resilience & Adaptability" + "Resilience and Adaptability" → keep one (prefer "&"), delete the other
  "Problem-Solving" + "Problem Solving" → keep hyphenated version
- One title is a vague subset of another → delete the vaguer one
  ("Communication Skills" vs "Verbal & Written Communication" → delete "Communication Skills")
- Skills in different domains that describe the same thing → delete the domain-duplicate, keep the most relevant domain
- Genuinely distinct concepts → NOT duplicates, keep both

Return ONLY a valid JSON array of UUIDs to delete. No explanation, no markdown fences, just the array.
If no duplicates found, return: []`;

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEMINI_KEY()}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, // low temp for consistent decisions
      }),
    },
  );

  const json = await res.json();
  const raw = (json.choices?.[0]?.message?.content ?? "[]").trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const ids = JSON.parse(cleaned);
    if (!Array.isArray(ids)) return [];
    // Validate they're all UUIDs from the input set (prevent hallucinations)
    const validIds = new Set(skills.map((s) => s.id));
    return ids.filter((id: unknown) => typeof id === "string" && validIds.has(id));
  } catch {
    console.warn(`[dedupe] Failed to parse Gemini response for ${roleTitle}:`, cleaned.slice(0, 200));
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let slugFilter: string[] | null = null;
  let dryRun = false;
  let minSkills = 15; // only dedupe roles with more than this many skills (fewer = less likely to have dupes)

  try {
    const body = await req.json().catch(() => ({}));
    slugFilter = body.slugs ?? null;
    dryRun = body.dry_run === true;
    if (typeof body.min_skills === "number") minSkills = body.min_skills;
  } catch { /* no body */ }

  // Fire in background so the HTTP response returns immediately
  const work = (async () => {
    // Fetch all distinct role slugs that have skills
    const { data: slugRows } = await supabase
      .from("role_skills")
      .select("slug")
      .order("slug");

    const allSlugs = [...new Set((slugRows ?? []).map((r: any) => r.slug as string))];
    const slugsToProcess = slugFilter ? allSlugs.filter((s) => slugFilter!.includes(s)) : allSlugs;

    const summary: Record<string, { before: number; deleted: number; titles: string[] }> = {};
    let totalDeleted = 0;

    for (const slug of slugsToProcess) {
      // Fetch all skills for this role
      const { data: skills } = await supabase
        .from("role_skills")
        .select("id, skill_title, skill_type, broad_domain")
        .eq("slug", slug)
        .order("broad_domain")
        .order("display_order");

      if (!skills || skills.length < minSkills) {
        console.log(`[dedupe] ${slug}: ${skills?.length ?? 0} skills — skipping (below threshold)`);
        continue;
      }

      console.log(`[dedupe] ${slug}: ${skills.length} skills — asking Gemini...`);

      // Derive a human title from the slug for the prompt
      const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      const toDelete = await askGeminiForDupes(title, skills as any[]);

      const deletedTitles = toDelete.map(
        (id) => (skills as any[]).find((s) => s.id === id)?.skill_title ?? id,
      );

      summary[slug] = { before: skills.length, deleted: toDelete.length, titles: deletedTitles };

      if (toDelete.length === 0) {
        console.log(`[dedupe] ${slug}: no duplicates found`);
        continue;
      }

      console.log(`[dedupe] ${slug}: deleting ${toDelete.length} dupes: ${deletedTitles.join(", ")}`);

      if (!dryRun) {
        // Delete orphaned user_skill_ratings first
        await supabase.from("user_skill_ratings").delete().in("skill_id", toDelete);
        // Delete the duplicate role_skills
        const { error } = await supabase.from("role_skills").delete().in("id", toDelete);
        if (error) console.error(`[dedupe] delete error for ${slug}:`, error.message);
        else totalDeleted += toDelete.length;
      } else {
        totalDeleted += toDelete.length;
      }

      // Brief pause between roles to avoid hammering Gemini quota
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`[dedupe] Done. ${dryRun ? "(DRY RUN) Would have deleted" : "Deleted"} ${totalDeleted} duplicate skills across ${slugsToProcess.length} roles.`);
    console.log("[dedupe] Summary:", JSON.stringify(summary, null, 2));
  })();

  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
    (EdgeRuntime as any).waitUntil(work);
  } else {
    await work;
  }

  return new Response(
    JSON.stringify({
      accepted: true,
      dry_run: dryRun,
      message: dryRun
        ? "Dry run — check function logs for what would be deleted"
        : "Deduplication running in background — check function logs for results",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
