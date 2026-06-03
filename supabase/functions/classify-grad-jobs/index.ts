// classify-grad-jobs
// Reassigns jobs currently tagged industry='graduate' (from grad-board scrapes)
// into real industries + role categories using Lovable AI.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INDUSTRIES = [
  "bakery","beauty","beer","cars","charity","cinema","coffee","estate agency",
  "farming","fashion","football","footwear","gaming","grocery","health","horse-racing",
  "hospitality","interior design","jewellery","journalism","money","music","pets",
  "physiotherapy","psychotherapy","teaching","travel","wellness",
  "finance","tech","law","consulting","marketing","engineering",
  "media","retail","property","energy","healthcare","government","manufacturing",
  "logistics","construction","accounting","insurance","pharma","fmcg","other"
];

const ROLE_CATEGORIES = [
  "commercial","creative","ecommerce","finance","hr-people","it-technology",
  "legal-compliance","marketing","operations","product","project-management",
  "sales","strategy","stylist","other"
];

const TOOL = {
  type: "function",
  function: {
    name: "classify_grad_job",
    description: "Classify a graduate/internship job into a real industry and role category.",
    parameters: {
      type: "object",
      properties: {
        industry: { type: "string", enum: INDUSTRIES },
        role_category: { type: "string", enum: ROLE_CATEGORIES },
        confidence: { type: "number" },
      },
      required: ["industry", "role_category", "confidence"],
      additionalProperties: false,
    },
  },
};

async function classifyOne(job: any, key: string) {
  const prompt = `Title: ${job.title}\nCompany: ${job.company}\nDescription: ${(job.description || "").slice(0, 500)}\nLocation: ${job.location || ""}\n\nPick the best industry and role category for this UK graduate/internship role.`;
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You classify UK graduate jobs. Always call the tool. Pick the single best industry and role_category from the enums." },
        { role: "user", content: prompt },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "classify_grad_job" } },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error(`AI ${res.status}:`, t.slice(0, 300));
    throw new Error(`AI ${res.status}`);
  }
  const data = await res.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) {
    console.error("No tool_calls in response:", JSON.stringify(data).slice(0, 300));
    return null;
  }
  try {
    return JSON.parse(args);
  } catch (e) {
    console.error("Bad JSON in tool args:", args.slice(0, 200));
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) throw new Error("GEMINI_API_KEY not set");

    let limit = 100;
    try {
      const body = await req.json();
      if (typeof body?.limit === "number") limit = Math.min(body.limit, 300);
    } catch { /* default */ }

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("id,title,company,description,location")
      .eq("industry", "graduate")
      .limit(limit);
    if (error) throw error;

    let updated = 0, failed = 0;
    const results: any[] = [];
    for (const job of jobs || []) {
      try {
        const c = await classifyOne(job, key);
        if (!c) { failed++; continue; }
        const { error: upErr } = await supabase
          .from("jobs")
          .update({
            industry: c.industry,
            ai_role_category: c.role_category,
            ai_confidence: c.confidence,
            classified_at: new Date().toISOString(),
            needs_review: c.confidence < 0.6,
          })
          .eq("id", job.id);
        if (upErr) { failed++; console.error("update", upErr.message); }
        else { updated++; results.push({ title: job.title, ...c }); }
        await new Promise((r) => setTimeout(r, 200));
      } catch (e) {
        failed++;
        console.error("classify err:", (e as Error).message);
      }
    }

    return new Response(
      JSON.stringify({ success: true, scanned: jobs?.length ?? 0, updated, failed, sample: results.slice(0, 5) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
