// blend-roles
// Takes two industries + a skill type and uses Gemini to suggest a real job role
// at their intersection. Powers the "Role Mixer" fruit machine on the Match Me page.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { industry1, industry2, skill } = await req.json();

    if (!industry1 || !industry2 || !skill) {
      return new Response(JSON.stringify({ error: "Missing industry1, industry2, or skill" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are a creative career advisor. A user is interested in both "${industry1}" and "${industry2}", and their strongest skill type is "${skill}".

Suggest ONE specific, real job role that sits at the intersection of these two industries and uses ${skill} skills. This should be a genuine career path, not made up.

Respond with JSON only (no markdown):
{
  "role": "Job Title Here",
  "blend": "${industry1} × ${industry2}",
  "description": "One punchy sentence explaining what this person does day-to-day.",
  "why": "One sentence explaining why this specific mix of ${industry1}, ${industry2} and ${skill} skills makes this person perfect for this role.",
  "example_companies": ["Company 1", "Company 2", "Company 3"],
  "search_query": "search terms to find this job on a job board"
}

Be specific and surprising. Avoid generic roles. The best answer is one the user would never have thought of themselves.`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("GEMINI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const result = JSON.parse(raw);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[blend-roles]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
