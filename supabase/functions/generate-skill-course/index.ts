// generate-skill-course — generates a personalised 4-lesson course + 10-question quiz
// for a user's skill gaps on a given role. Stores in skill_courses/lessons/questions tables.
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

    // Fetch user's skill ratings for this role — gaps first (lowest rating / unrated)
    const { data: skillRows } = await supabase
      .from("role_skills")
      .select("id, skill_title, skill_type, broad_domain")
      .eq("slug", role_slug)
      .order("display_order");

    if (!skillRows || skillRows.length === 0) {
      return new Response(JSON.stringify({ error: "No skills data for this role" }), { status: 404, headers: corsHeaders });
    }

    const skillIds = skillRows.map((s: any) => s.id);
    const { data: ratingRows } = await supabase
      .from("user_skill_ratings")
      .select("skill_id, rating")
      .eq("user_id", user.id)
      .in("skill_id", skillIds);

    const ratingMap = new Map<string, number>(
      (ratingRows ?? []).map((r: any) => [r.skill_id, r.rating]),
    );

    // Sort by rating ascending (unrated = 0), take top 8 gaps
    const gaps = skillRows
      .map((s: any) => ({ ...s, rating: ratingMap.get(s.id) ?? 0 }))
      .filter((s: any) => s.rating <= 2)
      .sort((a: any, b: any) => a.rating - b.rating)
      .slice(0, 8);

    if (gaps.length === 0) {
      return new Response(JSON.stringify({ error: "No significant skill gaps found — your ratings are already strong!" }), { status: 400, headers: corsHeaders });
    }

    const focusSkills = gaps.map((g: any) => g.skill_title);
    const gapLines = gaps
      .map((g: any) => `- ${g.skill_title}${g.broad_domain ? ` (${g.broad_domain})` : ""}${g.rating > 0 ? ` — current self-rating: ${g.rating}/5` : " — not yet rated"}`)
      .join("\n");

    // Delete any existing course for this user+role (fresh regeneration)
    await supabase
      .from("skill_courses")
      .delete()
      .eq("user_id", user.id)
      .eq("role_slug", role_slug);

    // Insert placeholder so we have a course_id to return
    const { data: courseRow, error: insertErr } = await supabase
      .from("skill_courses")
      .insert({
        user_id: user.id,
        role_slug,
        role_title: title,
        course_title: `${title} Skills Course`,
        focus_skills: focusSkills,
        status: "generating",
      })
      .select("id")
      .single();

    if (insertErr || !courseRow) {
      return new Response(JSON.stringify({ error: "Failed to create course" }), { status: 500, headers: corsHeaders });
    }

    const courseId = courseRow.id;

    // Generate content with Gemini in the background
    const generate = async () => {
      try {
        const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")!;

        const prompt = `You are creating a short professional development course for someone preparing to work as a ${title} in the UK.

Their weakest skills (the gaps this course must address) are:
${gapLines}

Write a practical, engaging course covering these specific gaps. Use UK English throughout.

Return ONLY valid JSON matching this exact structure:
{
  "course_title": "A specific title for this course (not generic, e.g. '${title}: Mastering Food Safety & Kitchen Craft')",
  "lessons": [
    {
      "slot": 1,
      "title": "Lesson title",
      "body_markdown": "300-400 words of practical markdown content directly addressing 1-2 of the gap skills above. Use headings (##), bullet points, and bold key terms. Include a practical tip or real-world example."
    },
    { "slot": 2, "title": "...", "body_markdown": "..." },
    { "slot": 3, "title": "...", "body_markdown": "..." },
    { "slot": 4, "title": "...", "body_markdown": "..." }
  ],
  "questions": [
    {
      "question": "Question text testing knowledge from the lessons?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why this answer is correct."
    }
  ]
}

Requirements:
- Exactly 4 lessons, each covering different gaps
- Exactly 10 quiz questions testing the lesson content
- Questions must be specific to ${title} work, not generic
- All content must be practical and directly usable on the job
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

        // Mark ready
        await supabase
          .from("skill_courses")
          .update({ status: "ready", course_title: course_title ?? `${title} Skills Course` })
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
