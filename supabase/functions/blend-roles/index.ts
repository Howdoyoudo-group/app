// blend-roles
// Takes two industries + a skill type and returns 10 real roles at their intersection,
// plus a short story about what that world looks and feels like.
// Powers the What If Machine on the Match Me page.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Explicit descriptions so Gemini can't confuse similar-sounding industries
// (Football ≠ Footwear, Formula 1 ≠ Fashion, Cars ≠ Coffee etc.)
const INDUSTRY_DESCRIPTIONS: Record<string, string> = {
  "Football":        "the sport played on a grass pitch — Premier League, EFL, grassroots clubs, fan media, football agencies",
  "Music":           "the recording and live performance industry — record labels, artists, concerts, festivals, streaming, studios",
  "Fashion":         "clothing and apparel — designers, garment production, trend forecasting, fashion weeks, retail brands",
  "Cinema & Film":   "movie and TV production — studios, streaming shows, VFX, animation, cinema exhibition",
  "Gaming":          "video game development, esports, game publishing and streaming",
  "Journalism":      "news reporting, editorial, print and digital media, broadcasting",
  "Farming":         "agriculture, horticulture, livestock, food production on the land",
  "Beer & Drinks":   "brewing, craft beer, distilling, pub trade, drinks distribution",
  "Coffee":          "specialty coffee, cafes, roasteries, barista culture",
  "Formula 1":       "F1 motorsport — race teams, engineering, circuits, sponsorship, F1 media",
  "Jewellery":       "fine jewellery design, manufacture, retail, gemstones and goldsmithing",
  "Horse Racing":    "thoroughbred racing — stables, racecourses, betting industry, bloodstock",
  "Pets":            "veterinary, pet retail, grooming, animal welfare, pet food brands",
  "Charity":         "non-profit organisations, fundraising, social impact, third sector",
  "Travel":          "tourism, airlines, hotels, tour operators, destination marketing",
  "Interior Design": "residential and commercial interior design, furniture, space planning, specification",
  "Beauty":          "cosmetics, skincare, haircare, salons, aesthetics clinics",
  "Estate Agency":   "residential property sales and lettings in the UK",
  "Teaching":        "UK schools, colleges, education, tutoring and EdTech",
  "Bakery":          "bread, pastry, cakes — bakeries, patisseries, artisan bakers",
  "Cars":            "automotive — car dealerships, vehicle manufacturing, aftersales, motor trade",
  "Grocery":         "supermarkets, food retail, FMCG brands, convenience stores",
  "Hospitality":     "restaurants, hotels, events catering, front-of-house operations",
};

function describeIndustry(name: string): string {
  return INDUSTRY_DESCRIPTIONS[name] ?? name;
}

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

    const desc1 = describeIndustry(industry1);
    const desc2 = describeIndustry(industry2);

    const systemMessage = `You are a creative UK career advisor. You will be given two specific industries and must only write about those exact industries. Never substitute, paraphrase or confuse them with similar-sounding ones.`;

    const prompt = `The user wants to explore careers at the intersection of these two industries:

INDUSTRY A: ${industry1}
What "${industry1}" means: ${desc1}

INDUSTRY B: ${industry2}
What "${industry2}" means: ${desc2}

Their strongest skill type is: ${skill}

Your job: paint a picture of the world where ${industry1} and ${industry2} collide — and list 10 real UK job roles that live there. The key message: you don't have to be a professional in either field. You can work where they meet.

Return ONLY valid JSON (no markdown fences):
{
  "blend": "${industry1} × ${industry2}",
  "tagline": "A punchy phrase (8-15 words) about what this intersection world feels and looks like.",
  "story": "One sentence (max 25 words) with the liberating insight — you don't have to be [X] or [Y], you can work where they meet.",
  "roles": [
    {
      "title": "Specific UK job title",
      "description": "One sentence (max 20 words) of what this person actually does day-to-day."
    }
  ],
  "entry_routes": [
    {
      "title": "Entry-level job title at a specific type of employer",
      "why": "2-3 sentences: why this is a realistic first step and exactly how ${industry1} and ${industry2} show up in the day-to-day work."
    }
  ]
}

Rules for roles (exactly 10):
- All genuine UK job titles — real things that appear on job boards
- Entry-level to mid-level only — nothing requiring 15+ years experience
- Lean toward ${skill} skills but spread across the intersection
- Be specific: "Matchday Social Media Assistant" beats "Social Media Manager"
- Each description says what the person DOES, not what the role IS

Rules for entry_routes (exactly 5):
- Most realistic first jobs — assistant, junior, trainee, coordinator level
- Title names a specific employer type (e.g. "Social Media Assistant at a Football Club")
- "why" explains concretely how BOTH ${industry1} and ${industry2} feature in the day-to-day
- Order: easiest to get (most openings) → most specialist`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("GEMINI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
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

    // Force the blend field to exactly what was requested — never let Gemini override it.
    result.blend = `${industry1} × ${industry2}`;

    // Sanity-check the content: if either industry name is absent from all the roles+story,
    // Gemini has likely hallucinated the wrong industry. Return an error so the UI retries.
    const allContent = JSON.stringify(result).toLowerCase();
    if (!allContent.includes(industry1.toLowerCase()) || !allContent.includes(industry2.toLowerCase())) {
      console.error(`[blend-roles] Content doesn't reference both industries. i1="${industry1}" i2="${industry2}". Blend: "${result.blend}"`);
      return new Response(
        JSON.stringify({ error: "Got the wrong blend back — please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
