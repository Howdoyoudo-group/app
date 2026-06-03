// Serves 10 random quiz questions (without answers) and grades a submission.
// Two endpoints in one function based on `action`.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PASS_PCT = 0.8;
const DAILY_ATTEMPT_LIMIT = 2;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    // Guests are allowed to take the quiz; they just can't have a badge
    // saved to a profile.

    const svc = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json();
    const { action, industry } = body;

    if (!industry || typeof industry !== "string") {
      return new Response(JSON.stringify({ error: "industry required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "start") {
      // Rate limit only applies to signed-in users
      if (user) {
        const isUnlimited = await checkUnlimited(svc, user.id);
        if (!isUnlimited) {
          const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { count } = await svc
            .from("ai_usage_log")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("function_name", `grade-badge-quiz:${industry}`)
            .gte("used_at", since);
          if ((count ?? 0) >= DAILY_ATTEMPT_LIMIT) {
            return new Response(JSON.stringify({ error: `You've used your ${DAILY_ATTEMPT_LIMIT} attempts for the ${industry} quiz today. Try again tomorrow.` }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }
      }

      const { data: all } = await svc
        .from("badge_questions")
        .select("id,question,options")
        .eq("industry", industry);
      if (!all || all.length < 10) {
        return new Response(JSON.stringify({ error: "Quiz not yet available for this industry." }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Pick 10 random
      const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 10);
      return new Response(JSON.stringify({ questions: shuffled }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "submit") {
      const { answers } = body as { answers: Array<{ id: string; chosen_index: number }> };
      if (!Array.isArray(answers) || answers.length === 0) {
        return new Response(JSON.stringify({ error: "answers required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const ids = answers.map((a) => a.id);
      const { data: qs } = await svc
        .from("badge_questions")
        .select("id,question,options,correct_index,explanation")
        .in("id", ids);
      if (!qs || qs.length !== answers.length) {
        return new Response(JSON.stringify({ error: "Question mismatch" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const byId = new Map(qs.map((q: any) => [q.id, q]));
      let correct = 0;
      const feedback = answers.map((a) => {
        const q: any = byId.get(a.id);
        const isCorrect = q.correct_index === a.chosen_index;
        if (isCorrect) correct++;
        return {
          question: q.question,
          options: q.options,
          chosen_index: a.chosen_index,
          correct_index: q.correct_index,
          explanation: q.explanation,
          is_correct: isCorrect,
        };
      });

      const total = answers.length;
      const pct = correct / total;
      const passed = pct >= PASS_PCT;

      // Log attempt + save badge only for signed-in users
      if (user) {
        await svc.from("ai_usage_log").insert({ user_id: user.id, function_name: `grade-badge-quiz:${industry}` });
        if (passed) {
          await svc.from("earned_badges").upsert(
            { user_id: user.id, industry, score: correct, earned_at: new Date().toISOString() },
            { onConflict: "user_id,industry" },
          );
        }
      }

      return new Response(JSON.stringify({ passed, score: correct, total, feedback, saved: !!user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("grade-badge-quiz error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function checkUnlimited(svc: any, userId: string): Promise<boolean> {
  const { data } = await svc.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => r.role);
  return roles.includes("admin") || roles.includes("premium");
}
