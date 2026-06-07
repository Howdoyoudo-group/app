import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You convert a scraped LinkedIn profile into structured JSON for a personal profile builder.

ABSOLUTE RULE - ZERO HALLUCINATION:
- Use ONLY information present in the scraped text.
- If a field is missing, return an empty string or empty array. NEVER invent.

Return ONLY valid JSON (no markdown), shaped exactly:
{
  "fullName": "",
  "headline": "",
  "location": "",
  "bio": "",
  "skills": [],
  "interests": [],
  "education": [
    { "school": "", "qualification": "", "dates": "", "grade": "", "link": "" }
  ],
  "qualifications": [
    { "name": "", "issuer": "", "year": "" }
  ],
  "experience": [
    { "company": "", "title": "", "dates": "", "location": "", "description": "", "link": "" }
  ]
}

Notes:
- "bio" = the LinkedIn About / Summary section, condensed to 2-4 sentences in the candidate's own words.
- "skills" = the explicit Skills section (max 30).
- "qualifications" = Licenses & certifications.
- Sort education and experience most-recent first.`;

function parseJsonContent(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] || content).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return JSON.parse(start >= 0 && end >= start ? raw.slice(start, end + 1) : raw);
}

function normalizeUrl(input: string): { url: string | null; reason?: string } {
  let url = input.trim();
  if (!url) return { url: null, reason: "empty" };
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (!/(^|\.)linkedin\.com$/.test(host)) return { url: null, reason: "not-linkedin" };
    // Only personal profile URLs (/in/handle). Reject /school, /company, /pub, /jobs etc.
    if (!/^\/in\/[^/]+\/?/i.test(u.pathname)) return { url: null, reason: "not-profile" };
    return { url: u.toString() };
  } catch {
    return { url: null, reason: "invalid" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Invalid session." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await svc
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("used_at", todayStart.toISOString());
    if ((count ?? 0) >= 50) {
      return new Response(
        JSON.stringify({ error: "You've reached your daily limit of 50 AI requests. Try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    await svc.from("ai_usage_log").insert({ user_id: userId, function_name: "import-linkedin-profile" });

    const { url } = await req.json().catch(() => ({}));
    const { url: target, reason } = normalizeUrl(typeof url === "string" ? url : "");
    if (!target) {
      const message = reason === "not-profile"
        ? "That looks like a school or company page. Paste your personal profile URL - it should start with https://www.linkedin.com/in/"
        : reason === "not-linkedin"
          ? "That URL isn't from linkedin.com. Paste the link to your LinkedIn profile."
          : "Please paste a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/your-handle).";
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // 1) Scrape LinkedIn page via Firecrawl (markdown).
    const fc = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: target,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 1500,
      }),
    });

    if (!fc.ok) {
      const body = await fc.text().catch(() => "");
      console.error("Firecrawl scrape failed", fc.status, body);
      if (fc.status === 402) {
        return new Response(JSON.stringify({ error: "Web scraper credits exhausted. Try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Could not load that LinkedIn page. Make sure it's public." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fcJson = await fc.json();
    const markdown: string =
      fcJson?.data?.markdown ||
      fcJson?.markdown ||
      fcJson?.data?.content ||
      "";

    if (!markdown || markdown.trim().length < 80) {
      return new Response(JSON.stringify({
        error: "LinkedIn returned a sign-in wall - make sure the profile URL is public, then try again.",
      }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2) Ask Gemini to extract structured profile data.
    const ai = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        max_tokens: 8192,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `LinkedIn profile (markdown):\n\n${markdown.substring(0, 60000)}` },
        ],
      }),
    });

    if (!ai.ok) {
      const body = await ai.text().catch(() => "");
      console.error("Gemini call failed", ai.status, body);
      if (ai.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (ai.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await ai.json();
    const content = aiJson.choices?.[0]?.message?.content || "";
    let parsed: any;
    try {
      parsed = parseJsonContent(content);
    } catch (err) {
      console.error("parse failed", err, "content=", content.slice(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse profile data." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = {
      success: true,
      fullName: typeof parsed.fullName === "string" ? parsed.fullName.trim() : "",
      headline: typeof parsed.headline === "string" ? parsed.headline.trim() : "",
      location: typeof parsed.location === "string" ? parsed.location.trim() : "",
      bio: typeof parsed.bio === "string" ? parsed.bio.trim() : "",
      skills: Array.isArray(parsed.skills)
        ? parsed.skills.filter((s: any) => typeof s === "string" && s.trim()).slice(0, 30)
        : [],
      interests: Array.isArray(parsed.interests)
        ? parsed.interests.filter((s: any) => typeof s === "string" && s.trim()).slice(0, 20)
        : [],
      education: Array.isArray(parsed.education)
        ? parsed.education.filter((e: any) => e?.school || e?.qualification)
        : [],
      qualifications: Array.isArray(parsed.qualifications)
        ? parsed.qualifications.filter((q: any) => q?.name)
        : [],
      experience: Array.isArray(parsed.experience)
        ? parsed.experience.filter((w: any) => w?.company || w?.title)
        : [],
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("import-linkedin-profile error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
