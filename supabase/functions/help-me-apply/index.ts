import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    let userId: string;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload?.sub) throw new Error("no sub");
      userId = payload.sub as string;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid session." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check daily usage limit
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await svc
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("used_at", todayStart.toISOString());
    if ((count ?? 0) >= 50) {
      return new Response(JSON.stringify({ error: "You've reached your daily limit of 50 AI requests. Try again tomorrow." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await svc.from("ai_usage_log").insert({ user_id: userId, function_name: "help-me-apply" });

    const { jobDescription, tone = "friendly", profileData } = await req.json();
    if (!jobDescription?.trim()) {
      return new Response(JSON.stringify({ error: "jobDescription is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const p = profileData || {};
    const profileSummary = `
Name: ${p.fullName || ""}
Location: ${p.location || ""}
Personal intro: ${p.personalIntro || ""}
Skills: ${(p.skills || []).join(", ")}
Work experience: ${(p.workExperience || []).map((w: any) => `${w.jobTitle} at ${w.company} (${w.dates || ""}): ${w.description}`).join(" | ")}
Education: ${(p.education || []).map((e: any) => `${e.qualification} at ${e.school} (${e.grade})`).join(" | ")}
`.trim();

    const toneInstruction = tone === "formal"
      ? "Write in a professional, formal tone. Use complete sentences and avoid contractions."
      : "Write in a warm, confident and engaging tone. Be direct and human — avoid corporate jargon and stuffy phrases. Use 'I' naturally.";

    const prompt = `You are an expert UK careers coach and cover letter writer helping a young person apply for a job.

Write a tailored cover letter for the job described below using the candidate's profile.

${toneInstruction}

RULES:
- Maximum 3 short paragraphs (opening, body, close)
- Mirror 2-3 keywords from the job description naturally
- No filler phrases like "I am writing to apply for..." or "Please find attached..."
- Start with something that grabs attention
- Close with a clear, confident call to action
- No sign-off or "Yours sincerely" — end after the closing paragraph
- Keep it under 250 words

JOB DESCRIPTION:
${jobDescription.substring(0, 3000)}

CANDIDATE PROFILE:
${profileSummary}

Write the cover letter now:`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("Gemini error:", res.status, err);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const coverLetter = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("help-me-apply error:", err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
