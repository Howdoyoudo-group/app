// Admin-only: generates a tagline + "why work here" bullets for one
// pinned_industry_employers row (the Employer Spotlight tile), replacing
// the generic "A notable employer in {industry}" fallback shown when a
// spotlight has no tagline set.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOOL = {
  type: "function",
  function: {
    name: "emit_spotlight_content",
    description: "Return a short tagline and 3-4 'why work here' bullets for this employer.",
    parameters: {
      type: "object",
      properties: {
        tagline: {
          type: "string",
          description: "One short line (under 6 words) describing the kinds of roles this company is known for hiring in the UK, e.g. 'Crew & operations roles' or 'Store, warehouse & HQ roles'. Not a company slogan - a roles descriptor.",
        },
        why_work_here: {
          type: "array",
          minItems: 3,
          maxItems: 4,
          items: { type: "string" },
          description: "3-4 short bullets (under 12 words each) giving genuine, well-known, safe-to-state reasons to work here - training/career development, scale, culture, benefits. No invented statistics, awards, or specific figures.",
        },
      },
      required: ["tagline", "why_work_here"],
      additionalProperties: false,
    },
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
    const SERVICE_KEY = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    const { id, force, company_name: adHocCompany, industry: adHocIndustry } = await req.json();

    // Two modes: an existing row (id) - generate, save to DB, and return the
    // content; or an ad-hoc company/industry pair (no id yet, e.g. mid-way
    // through adding a brand-new spotlight in the admin dialog) - generate
    // and return the content without writing anywhere, since there's no row
    // to write to until the admin hits Save.
    let row: { id: string; company_name: string; industry: string; tagline: string | null; why_work_here: string[] } | null = null;
    if (id) {
      const { data, error: rowErr } = await svc
        .from("pinned_industry_employers")
        .select("id, company_name, industry, tagline, why_work_here")
        .eq("id", id)
        .maybeSingle();
      if (rowErr || !data) {
        return new Response(JSON.stringify({ error: rowErr?.message ?? "Spotlight not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      row = data;
      if (!force && row.tagline && (row.why_work_here ?? []).length > 0) {
        return new Response(JSON.stringify({ error: "This spotlight already has content - pass force to regenerate." }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } else if (adHocCompany && adHocIndustry) {
      row = { id: "", company_name: adHocCompany, industry: adHocIndustry, tagline: null, why_work_here: [] };
    } else {
      return new Response(JSON.stringify({ error: "id, or company_name + industry, required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `You are writing short employer-spotlight copy for Howdy, a UK careers platform for young people and career changers. British English. Zero-hallucination rule: only state things that are genuinely well-known and safe to say about this specific company - no invented statistics, awards, revenue figures, headcounts, or specific perks you aren't confident are real. If you're not sure of something specific, keep it general (e.g. "structured career progression" rather than a made-up number of training days).`;

    const userPrompt = `Company: ${row.company_name}\nUK industry context: ${row.industry}\n\nWrite the tagline and why_work_here bullets for this company's employer spotlight tile.`;

    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "emit_spotlight_content" } },
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

    if (id) {
      const { error: updErr } = await svc
        .from("pinned_industry_employers")
        .update({ tagline: parsed.tagline, why_work_here: parsed.why_work_here })
        .eq("id", id);
      if (updErr) {
        return new Response(JSON.stringify({ error: `DB update failed: ${updErr.message}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ ok: true, tagline: parsed.tagline, why_work_here: parsed.why_work_here }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-spotlight-content error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
