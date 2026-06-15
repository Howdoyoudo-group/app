// generate-skill-course — generates a full role accreditation course (4 lessons by skill domain + 10-question quiz)
// covering ALL skills for the role, not just gaps. Passing earns the role badge.
// POST { role_slug: string } — requires auth JWT

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function roleTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify user from JWT
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: corsHeaders });

    const { role_slug } = await req.json();
    if (!role_slug) return new Response(JSON.stringify({ error: "role_slug required" }), { status: 400, headers: corsHeaders });

    const title = roleTitle(role_slug);

    // Fetch ALL skills for this role, ordered by domain then display_order
    const { data: skillRows } = await supabase
      .from("role_skills")
      .select("id, skill_title, skill_type, broad_domain")
      .eq("slug", role_slug)
      .order("broad_domain")
      .order("display_order");

    if (!skillRows || skillRows.length === 0) {
      return new Response(JSON.stringify({ error: "No skills data for this role" }), { status: 404, headers: corsHeaders });
    }

    // Group all skills by broad_domain
    const domainMap = new Map<string, string[]>();
    for (const s of skillRows as any[]) {
      const domain = s.broad_domain || "General";
      if (!domainMap.has(domain)) domainMap.set(domain, []);
      domainMap.get(domain)!.push(`${s.skill_title} [${s.skill_type ?? "skill"}]`);
    }

    // Build domain summary for the prompt
    const domainLines = Array.from(domainMap.entries())
      .map(([domain, skills]) => `**${domain}**\n${skills.map((s) => `  - ${s}`).join("\n")}`)
      .join("\n\n");

    const allSkillTitles = (skillRows as any[]).map((s: any) => s.skill_title);

    // Delete any existing course for this user+role (fresh regeneration)
    await supabase
      .from("skill_courses")
      .delete()
      .eq("user_id", user.id)
      .eq("role_slug", role_slug);

    // Insert placeholder so we have a course_id to return immediately
    const { data: courseRow, error: insertErr } = await supabase
      .from("skill_courses")
      .insert({
        user_id: user.id,
        role_slug,
        role_title: title,
        course_title: `${title} Accreditation`,
        focus_skills: allSkillTitles,
        status: "generating",
      })
      .select("id")
      .single();

    if (insertErr || !courseRow) {
      return new Response(JSON.stringify({ error: "Failed to create course" }), { status: 500, headers: corsHeaders });
    }

    const courseId = courseRow.id;
    const domainCount = domainMap.size;

    // Generate content with Gemini in the background
    const generate = async () => {
      try {
        const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")!;

        const prompt = `You are creating a professional accreditation course for someone preparing to work as a ${title} in the UK.

This course must cover ALL of the following skills, grouped by domain:

${domainLines}

The course has exactly 4 lessons. Each lesson covers one or two skill domains. For each domain's skills:
- Explain what the skill means in a ${title} context
- Give a practical UK workplace example
- For behavioural skills (teamwork, resilience, communication etc.) — explain what "good" looks like on the job day-to-day; you cannot prove these with a test but a good professional understands them

Use UK English throughout. Content should be practical, not academic.

Return ONLY valid JSON matching this exact structure:
{
  "course_title": "A specific accreditation title, e.g. '${title}: Full Skills Accreditation'",
  "lessons": [
    {
      "slot": 1,
      "title": "Lesson title covering the domain(s)",
      "body_markdown": "400-500 words of practical markdown content. Use ## subheadings per skill or skill cluster, bullet points, and **bold key terms**. Cover every skill listed for these domains."
    },
    { "slot": 2, "title": "...", "body_markdown": "..." },
    { "slot": 3, "title": "...", "body_markdown": "..." },
    { "slot": 4, "title": "...", "body_markdown": "..." }
  ],
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why this is correct."
    }
  ]
}

Requirements:
- Exactly 4 lessons covering ALL skill domains (spread evenly)
- Exactly 10 quiz questions — spread across all domains (2-3 per domain), including at least 2 on behavioural skills
- Questions must be specific to ${title} work in a UK context
- Do not include markdown code fences — return raw JSON only`;

        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GEMINI_KEY}`,
            },
            body: JSON.stringify({
              model: "gemini-2.5-flash",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
            }),
          },
        );

        const json = await res.json();
        const raw = json.choices?.[0]?.message?.content ?? "";

        // Strip any markdown fences Gemini might add
        const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
        const parsed = JSON.parse(cleaned);

        const { lessons, questions, course_title } = parsed;

        if (!Array.isArray(lessons) || lessons.length !== 4 || !Array.isArray(questions) || questions.length !== 10) {
          throw new Error(`Unexpected structure: ${lessons?.length} lessons, ${questions?.length} questions`);
        }

        // Insert lessons
        await supabase.from("skill_course_lessons").insert(
          lessons.map((l: any) => ({
            course_id: courseId,
            slot: l.slot,
            title: l.title,
            body_markdown: l.body_markdown,
          })),
        );

        // Insert questions
        await supabase.from("skill_course_questions").insert(
          questions.map((q: any) => ({
            course_id: courseId,
            question: q.question,
            options: q.options,
            correct_index: q.correct_index,
            explanation: q.explanation ?? null,
          })),
        );

        // Mark ready with final title
        await supabase
          .from("skill_courses")
          .update({ status: "ready", course_title: course_title ?? `${title} Accreditation` })
          .eq("id", courseId);

      } catch (err) {
        console.error("generate-skill-course error:", err);
        await supabase
          .from("skill_courses")
          .update({ status: "error" })
          .eq("id", courseId);
      }
    };

    // Run generation — use waitUntil if available so we can return fast
    const work = generate();
    if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
      (EdgeRuntime as any).waitUntil(work);
    } else {
      await work;
    }

    return new Response(
      JSON.stringify({ course_id: courseId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err: any) {
    console.error("generate-skill-course top-level error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
