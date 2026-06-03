// Generates a short, friendly explanation of a user's RIASEC 3-letter code.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TYPE_LABELS: Record<string, { label: string; vibe: string }> = {
  R: { label: "Realistic", vibe: "Doer - practical, hands-on, builder" },
  I: { label: "Investigative", vibe: "Thinker - curious, analytical, problem-solver" },
  A: { label: "Artistic", vibe: "Creator - expressive, imaginative, original" },
  S: { label: "Social", vibe: "Helper - empathetic, supportive, people-focused" },
  E: { label: "Enterprising", vibe: "Persuader - ambitious, leading, influential" },
  C: { label: "Conventional", vibe: "Organiser - structured, detail-loving, reliable" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string" || !/^[RIASEC]{3}$/.test(code)) {
      return new Response(JSON.stringify({ error: "Invalid code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "Unauthorised" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const breakdown = code
      .split("")
      .map((l) => `${l} = ${TYPE_LABELS[l].label} (${TYPE_LABELS[l].vibe})`)
      .join("; ");

    const prompt = `A user's RIASEC career-personality code is "${code}". The three letters in order of strength mean: ${breakdown}.
Write 2 short sentences (max 55 words total, British English, warm and conversational, no jargon, no emojis):
1. Plain-English explanation of what RIASEC is and what their specific 3-letter blend says about how they're wired.
2. The kinds of work environments or activities they tend to thrive in.
Address the reader as "you". Do not list the letters back - synthesise them into a personality.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You write warm, plain-English career-personality explanations. British English, factual, no clichés, no emojis." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return new Response(JSON.stringify({ error: "AI error", detail: t }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const blurb: string = data?.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ blurb }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
