const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface JobContext {
  title: string;
  company: string;
  industry: string;
  location: string;
  salary: string;
  description: string;
  tags: string[];
  type: string;
}

interface UserContext {
  fullName?: string;
  careerLevel?: string;
  industryInterests?: string[];
  cvText?: string;
  experiences?: string;
  skills?: string[];
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;

    // Rate limit: 10 AI calls per user per day (admins and premium users are exempt)
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: roleRows } = await svcClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (roleRows ?? []).map((r: any) => r.role);
    const isUnlimited = roles.includes("admin") || roles.includes("premium");
    if (!isUnlimited) {
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
    }
    await svcClient.from("ai_usage_log").insert({ user_id: userId, function_name: "tailor-application" });

    const { job, userContext } = (await req.json()) as {
      job: JobContext;
      userContext: UserContext;
    };

    if (!job?.title || !job?.company) {
      return new Response(
        JSON.stringify({ error: "Job title and company are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userProfile = userContext
      ? `
USER PROFILE:
${userContext.fullName ? `Name: ${userContext.fullName}` : ""}
${userContext.careerLevel ? `Career Level: ${userContext.careerLevel}` : ""}
${userContext.industryInterests?.length ? `Industry Interests: ${userContext.industryInterests.join(", ")}` : ""}
${userContext.skills?.length ? `Skills: ${userContext.skills.join(", ")}` : ""}
${userContext.experiences ? `Experience Summary: ${userContext.experiences}` : ""}
${userContext.cvText ? `\nCV/PROFILE TEXT:\n${userContext.cvText.slice(0, 3000)}` : ""}
`.trim()
      : "No user profile data available.";

    const prompt = `You are a career coach and application specialist for the UK job market.

A user wants help applying for this job:

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Industry: ${job.industry}
Location: ${job.location}
Salary: ${job.salary}
Type: ${job.type}
Tags: ${job.tags.join(", ")}
Description: ${job.description || "Not provided"}

${userProfile}

Provide the following as a JSON object with these exact keys:

1. "cvTips" - an array of 5-7 specific, actionable CV tips for this exact role. Each tip should be an object with:
   - "category" (one of: "Keywords", "Experience", "Skills", "Format", "Tailoring")
   - "tip" (the specific advice, 1-2 sentences)
   ${userContext?.cvText ? "Base tips on the user's actual CV content - what to change, add, or reword." : "Give general tips for someone applying to this type of role."}

2. "coverLetter" - a professional cover letter (3-4 paragraphs) tailored to this specific role at ${job.company}. ${userContext?.fullName ? `Address it from ${userContext.fullName}.` : "Use [Your Name] as placeholder."} The letter should:
   - Open with genuine enthusiasm for ${job.company} specifically (not generic)
   - Reference specific aspects of the role from the job description
   - ${userContext?.cvText || userContext?.experiences ? "Draw on the user's actual experience and skills" : "Include placeholder sections for the applicant to fill in their relevant experience"}
   - Close with a confident, professional sign-off
   - Be UK English, professional but not stuffy
   - NOT be generic - it must be clearly written for this exact role

3. "keySkills" - array of 5-8 key skills/keywords this employer is likely looking for based on the job details

4. "companyInsight" - 1-2 sentences about what ${job.company} likely values in candidates (based on the job description and industry context)

Return ONLY valid JSON, no markdown wrapping.`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a UK career coach. Return only valid JSON. No markdown code fences." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_application_help",
              description: "Provide tailored CV tips and cover letter for a job application",
              parameters: {
                type: "object",
                properties: {
                  cvTips: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["Keywords", "Experience", "Skills", "Format", "Tailoring"] },
                        tip: { type: "string" },
                      },
                      required: ["category", "tip"],
                    },
                  },
                  coverLetter: { type: "string" },
                  keySkills: { type: "array", items: { type: "string" } },
                  companyInsight: { type: "string" },
                },
                required: ["cvTips", "coverLetter", "keySkills", "companyInsight"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_application_help" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate application help" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || "";
      try {
        const parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, ""));
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(
          JSON.stringify({ error: "Failed to parse AI response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const result = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("tailor-application error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
