// Admin-only: generates 4 lessons + 15 quiz questions for an industry badge,
// strictly grounded in our existing platform data (briefings, articles, profiles, videos).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOOL = {
  type: "function",
  function: {
    name: "emit_badge_content",
    description: "Return 4 industry lessons and 15 quiz questions grounded only in the provided sources.",
    parameters: {
      type: "object",
      properties: {
        lessons: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: {
            type: "object",
            properties: {
              slot: { type: "integer", minimum: 1, maximum: 4 },
              title: { type: "string" },
              body_markdown: { type: "string", description: "300-500 words. British English. BBC Business/Monocle tone. Cite source links inline as [text](url) using ONLY URLs from the input sources." },
              source_urls: { type: "array", items: { type: "string" } },
            },
            required: ["slot", "title", "body_markdown", "source_urls"],
            additionalProperties: false,
          },
        },
        questions: {
          type: "array",
          minItems: 15,
          maxItems: 15,
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              options: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
              correct_index: { type: "integer", minimum: 0, maximum: 3 },
              explanation: { type: "string" },
            },
            required: ["question", "options", "correct_index", "explanation"],
            additionalProperties: false,
          },
        },
      },
      required: ["lessons", "questions"],
      additionalProperties: false,
    },
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const svc = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roles } = await svc.from("user_roles").select("role").eq("user_id", user.id);
    if (!(roles ?? []).some((r: any) => r.role === "admin")) {
      return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { industry } = await req.json();
    if (!industry || typeof industry !== "string") {
      return new Response(JSON.stringify({ error: "industry required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Pull existing platform data for grounding
    const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const [briefings, articles, profiles, videos] = await Promise.all([
      svc.from("daily_briefings").select("briefing_date,main_news,people,takeaway,source_links").eq("industry", industry).gte("generated_at", since).order("briefing_date", { ascending: false }).limit(20),
      svc.from("articles").select("title,description,url,source,published_at").eq("industry", industry).gte("scraped_at", since).order("scraped_at", { ascending: false }).limit(40),
      svc.from("career_profiles").select("name,job_title,company,bio,how_they_got_the_job,advice").eq("industry", industry).limit(15),
      svc.from("industry_videos").select("title,channel,description").eq("industry", industry).order("published_at", { ascending: false }).limit(20),
    ]);

    const sources = {
      briefings: briefings.data ?? [],
      articles: articles.data ?? [],
      career_profiles: profiles.data ?? [],
      videos: videos.data ?? [],
    };

    const totalItems = sources.briefings.length + sources.articles.length + sources.career_profiles.length + sources.videos.length;
    if (totalItems < 5) {
      return new Response(JSON.stringify({ error: `Not enough source content for ${industry} (only ${totalItems} items found). Generate briefings/articles first.` }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `You are creating "Industry Fundamentals" learning content for the UK ${industry} industry on Howdy. Strict zero-hallucination rule: every fact, name, number and quote MUST come from the supplied sources. If you don't have a source for a claim, leave it out. British English. Tone: BBC Business / Monocle — professional, curious, never breathless.

The 4 lessons should cover, in order:
  1) "The Landscape" — size, structure, key players, value chain of UK ${industry}
  2) "How It Makes Money" — the business model and revenue drivers
  3) "Who Works Here" — the roles, the people, the routes in (draw from career_profiles)
  4) "What's Changing" — current trends, recent stories from briefings/articles

The 15 multiple-choice questions test understanding of facts from the lessons. Each has 4 options, one correct, plus a one-sentence explanation. Questions must be answerable purely from the lesson content. Mix easy/medium/hard. Avoid trick questions.

Inline links in body_markdown must use ONLY URLs that appear in the sources. Cite generously.`;

    const userPrompt = `Industry: ${industry}\n\nSOURCES (JSON):\n${JSON.stringify(sources).slice(0, 60000)}`;

    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "emit_badge_content" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Top up in Lovable AI settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI returned no structured output" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const parsed = JSON.parse(toolCall.function.arguments);

    // Wipe and replace existing content for this industry (idempotent regenerate)
    await svc.from("badge_lessons").delete().eq("industry", industry);
    await svc.from("badge_questions").delete().eq("industry", industry);

    const lessonRows = parsed.lessons.map((l: any) => ({
      industry,
      slot: l.slot,
      title: l.title,
      body_markdown: l.body_markdown,
      source_links: l.source_urls ?? [],
    }));
    const questionRows = parsed.questions.map((q: any) => ({
      industry,
      question: q.question,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation ?? null,
    }));

    const ins1 = await svc.from("badge_lessons").insert(lessonRows);
    const ins2 = await svc.from("badge_questions").insert(questionRows);
    if (ins1.error || ins2.error) {
      console.error("Insert error", ins1.error, ins2.error);
      return new Response(JSON.stringify({ error: "DB insert failed", detail: ins1.error?.message || ins2.error?.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, lessons: lessonRows.length, questions: questionRows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-badge-content error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
