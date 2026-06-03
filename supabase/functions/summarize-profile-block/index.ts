// Summarise a block of profile text to fit a max character budget.
// Used by the printable two-page profile when content overflows.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { text, maxChars, label } = await req.json();
    const safe = String(text || "").trim();
    const budget = Math.max(60, Math.min(800, Number(maxChars) || 200));
    if (!safe) return json({ summary: "" });
    if (safe.length <= budget) return json({ summary: safe });

    const prompt = `Shorten the following ${label || "profile section"} to roughly ${budget} characters (max ${budget + 30}). Keep British English, factual content, names, dates and metrics. Flowing prose, no bullets, no headings, no emojis. Do not invent anything.

TEXT:
${safe}`;

    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You shorten profile text. British English. Factual only. No invention." },
          { role: "user", content: prompt },
        ],
        max_tokens: 280,
      }),
    });
    if (!r.ok) {
      const errTxt = await r.text();
      return json({ summary: safe.slice(0, budget) + "…", error: errTxt }, r.status === 429 || r.status === 402 ? r.status : 200);
    }
    const data = await r.json();
    const out = String(data?.choices?.[0]?.message?.content || "").trim() || safe.slice(0, budget) + "…";
    return json({ summary: out });
  } catch (e) {
    return json({ summary: "", error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
