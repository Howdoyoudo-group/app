import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("GEMINI_API_KEY")!;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Validate caller is an employer
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "employer").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Employer access required" }), { status: 403, headers: corsHeaders });
    }
    const { data: empRow } = await admin
      .from("employer_users")
      .select("company_id, employer_companies(name, industry)")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!empRow) {
      return new Response(JSON.stringify({ error: "No employer profile" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const candidateUserId = body.candidateUserId as string;
    if (!candidateUserId) {
      return new Response(JSON.stringify({ error: "candidateUserId required" }), { status: 400, headers: corsHeaders });
    }

    // Cache check
    const { data: cached } = await admin
      .from("employer_ai_summaries")
      .select("summary")
      .eq("employer_user_id", user.id)
      .eq("candidate_user_id", candidateUserId)
      .maybeSingle();
    if (cached?.summary) {
      return new Response(JSON.stringify({ summary: cached.summary, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch candidate profile (admin bypasses RLS)
    const { data: profile } = await admin
      .from("profiles")
      .select("industry_interests, role_preferences, career_level, location_preference, riasec_scores, understand_me_results, work_values")
      .eq("id", candidateUserId)
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Candidate not found" }), { status: 404, headers: corsHeaders });
    }

    const company = empRow.employer_companies as any;
    const prompt = `You are an AI talent analyst writing a brief, factual 2-3 sentence summary of a candidate for an employer (${company.name}, ${company.industry ?? "their industry"}).

Use ONLY the structured profile data provided. Do NOT invent skills, experience, or background. If a field is empty, ignore it. Keep the tone professional and British.

Candidate data:
- Industry interests: ${JSON.stringify(profile.industry_interests ?? [])}
- Role preferences: ${JSON.stringify(profile.role_preferences ?? [])}
- Career level: ${profile.career_level ?? "unknown"}
- Location: ${profile.location_preference ?? "unknown"}
- RIASEC scores: ${JSON.stringify(profile.riasec_scores ?? {})}
- Work values: ${JSON.stringify(profile.work_values ?? {})}
- Understand-Me results: ${JSON.stringify(profile.understand_me_results ?? {})}

Write a 2-3 sentence summary highlighting fit with ${company.name} based ONLY on the above. No fluff.`;

    const aiResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a concise, factual talent analyst. Never hallucinate." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit, please retry later." }), { status: 429, headers: corsHeaders });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: corsHeaders });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: corsHeaders });
    }

    const aiData = await aiResp.json();
    const summary = aiData.choices?.[0]?.message?.content?.trim() ?? "Summary unavailable.";

    // Cache
    await admin.from("employer_ai_summaries").insert({
      employer_user_id: user.id,
      candidate_user_id: candidateUserId,
      company_id: empRow.company_id,
      summary,
    });

    return new Response(JSON.stringify({ summary, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("employer-candidate-summary error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
