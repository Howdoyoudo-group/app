import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { jobDescription, profileData } = await req.json();
    if (!jobDescription?.trim()) {
      return new Response(JSON.stringify({ error: "Job description is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build profile summary from profileData
    const p = profileData || {};
    const profileSummary = `
Name: ${p.fullName || ""}
Location: ${p.location || ""}
Personal intro: ${p.personalIntro || ""}
Industries interested in: ${(p.industryInterests || []).join(", ")}
Looking for: ${p.lookingFor || ""}
Skills: ${(p.skills || []).join(", ")}
Things I've done: ${(p.experiences || []).map((e: any) => `${e.category}: ${e.description}`).join(" | ")}
Work experience: ${(p.workExperience || []).map((w: any) => `${w.jobTitle} at ${w.company} (${w.startDate}–${w.endDate}): ${w.description}`).join(" | ")}
Education: ${(p.education || []).map((e: any) => `${e.qualification} at ${e.school} (${e.grade})`).join(" | ")}
Qualifications: ${(p.qualifications || []).map((q: any) => `${q.name} from ${q.issuer} (${q.year})`).join(" | ")}
Proud of: ${p.proudOf || ""}
What gives energy: ${p.givesEnergy || ""}
`.trim();

    const prompt = `You are an expert UK CV writer and ATS specialist.

A young person has shared their profile and a job description. Your job is to write an ATS-optimised CV for them in plain text format that will pass automated screening systems.

RULES:
- Use ONLY standard section headings: PERSONAL STATEMENT, SKILLS, WORK EXPERIENCE, EDUCATION, QUALIFICATIONS, PROJECTS & ACTIVITIES
- Mirror keywords and phrases from the job description naturally throughout
- No tables, columns, graphics, or special characters (only hyphens and pipe | as separators)
- Keep it to 1 page equivalent (max ~450 words of content)
- Write in first person implied (no "I") — direct, confident, punchy
- For young people with limited experience: lead with skills and character, not gaps
- Add an ATS KEYWORDS line at the very end listing the top 10 keywords matched from the job description

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
${profileSummary}

Now write the ATS CV:`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("GEMINI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini error:", err);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const cvText = data.choices?.[0]?.message?.content || "";

    // Extract keywords line for the score badge
    const keywordsMatch = cvText.match(/ATS KEYWORDS[:\s]+(.+)/i);
    const keywords = keywordsMatch ? keywordsMatch[1].split(/[,|]/).map((k: string) => k.trim()).filter(Boolean) : [];

    // Rough ATS score: % of keywords from JD that appear in the CV
    const jdWords = jobDescription.toLowerCase().split(/\W+/);
    const cvWords = cvText.toLowerCase();
    const matched = keywords.filter((k: string) => cvWords.includes(k.toLowerCase()));
    const score = keywords.length > 0 ? Math.round((matched.length / keywords.length) * 100) : 85;

    return new Response(JSON.stringify({ cvText, keywords, score }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("generate-ats-cv error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
