// blend-roles
// Takes two industries + a skill type and returns 10 real roles at their intersection,
// plus a short story about what that world looks and feels like.
// Powers the What If Machine on the Match Me page.

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

    const prompt = `You are a creative UK career advisor helping young people discover unexpected careers.

A user is interested in both "${industry1}" and "${industry2}", and their strongest skill type is "${skill}".

Your job is to paint a picture of the world where these two industries collide — and list 10 real, specific job roles that live there. The key insight is: you do not have to be a professional in either industry. You can work where they meet.

Return ONLY valid JSON (no markdown fences):
{
  "blend": "${industry1} × ${industry2}",
  "tagline": "A short punchy phrase (8-15 words) describing what this intersection world is about. E.g. 'Fan culture, matchday atmosphere, content, events and brand storytelling.'",
  "story": "One sentence (max 25 words) that captures the liberating idea. E.g. 'You don't have to be a footballer or a musician — you can work where football sounds and feels alive.'",
  "roles": [
    {
      "title": "Job Title",
      "description": "One sentence (max 20 words) of what this person actually does day-to-day in a UK context."
    }
  ],
  "entry_routes": [
    {
      "title": "Entry-level job title at a specific type of employer",
      "why": "2-3 sentences explaining why this is a realistic first step, what makes it achievable, and exactly how ${industry1} and ${industry2} show up in the day-to-day of this role. Be specific and encouraging — not generic."
    }
  ]
}

Rules for the roles:
- Exactly 10 roles
- All must be genuine UK job titles that appear on job boards or at real organisations
- Range from entry-level / trainee to mid-level — nothing that needs 15 years of experience
- Lean toward the ${skill} skill type but spread across the intersection
- Be specific and surprising — avoid generic "Marketing Manager" unless it's clearly scoped to this intersection (e.g. "Matchday Marketing Executive")
- The best roles are ones the user would never have thought of themselves
- Each description must say what the person actually DOES, not what the role IS

Rules for entry_routes:
- Exactly 5 entry-level routes
- These are the most REALISTIC first jobs for someone with no industry experience — assistant, junior, trainee, coordinator level
- Title must name a specific type of employer (e.g. "Social Media Assistant at a Football Club", not just "Social Media Assistant")
- The "why" must explain concretely how both ${industry1} and ${industry2} feature in the job — not just that it's a good opportunity
- Order from easiest to get into (most openings, lowest barrier) to slightly more specialist`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("GEMINI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const raw = (data.choices?.[0]?.message?.content ?? "{}").trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
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
