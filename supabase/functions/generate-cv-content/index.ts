import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Invalid session. Please sign in again." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;

    // Rate limit: 10 AI calls per user per day
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await svcClient
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("used_at", todayStart.toISOString());
    if ((count ?? 0) >= 10) {
      return new Response(
        JSON.stringify({ error: "You've reached your daily limit of 10 AI requests. Try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    await svcClient.from("ai_usage_log").insert({ user_id: userId, function_name: "generate-cv-content" });

    const { type, industry, role, cv } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "adapt-cv") {
      systemPrompt = `You are a UK career coach specialising in the ${industry} industry. Given a target role from the industry career map, generate tailored CV content that would make a candidate stand out. Return JSON with this exact structure:
{
  "summary": "A 2-3 sentence professional summary tailored to the role",
  "skills": ["skill1", "skill2", ...],
  "experienceTips": "2-3 bullet points of experience highlights to include, formatted as a string with newlines"
}
Only return valid JSON, no markdown or extra text.`;
      userPrompt = `Target role: ${role.name}
Role description: ${role.description}
Salary range: ${role.salary}
Industry: ${industry}

${cv?.fullName ? `Candidate name: ${cv.fullName}` : ""}
${cv?.summary ? `Current summary: ${cv.summary}` : ""}
${cv?.skills?.length ? `Current skills: ${cv.skills.join(", ")}` : ""}`;
    } else if (type === "cover-letter") {
      systemPrompt = `You are a UK career coach specialising in the ${industry} industry. Write a professional, compelling covering letter for a candidate applying for the specified role. The letter should be 3-4 paragraphs, formal but engaging, and reference the specific industry context. Return JSON with this exact structure:
{
  "coverLetter": "The full covering letter text with proper paragraphs separated by \\n\\n"
}
Only return valid JSON, no markdown or extra text.`;
      userPrompt = `Target role: ${role.name}
Role description: ${role.description}
Salary range: ${role.salary}
Industry: ${industry}

Candidate details:
Name: ${cv?.fullName || "Not provided"}
Email: ${cv?.email || "Not provided"}
Phone: ${cv?.phone || "Not provided"}
Location: ${cv?.location || "Not provided"}
Summary: ${cv?.summary || "Not provided"}
Skills: ${cv?.skills?.length ? cv.skills.join(", ") : "Not provided"}
Experience: ${cv?.experiences?.filter((e: any) => e.title).map((e: any) => `${e.title} at ${e.company} (${e.dates}): ${e.description}`).join("\n") || "Not provided"}
Education: ${cv?.educations?.filter((e: any) => e.institution).map((e: any) => `${e.degree} at ${e.institution} (${e.dates})`).join("\n") || "Not provided"}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type. Use 'adapt-cv' or 'cover-letter'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please top up your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON from the AI response
    let parsed;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-cv-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
