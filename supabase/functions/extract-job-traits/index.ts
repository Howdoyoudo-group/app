import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RIASEC_KEYS = ["R", "I", "A", "S", "E", "C"];
const VALUE_KEYS = [
  "autonomy", "creativity", "stability", "helping_others",
  "leadership", "intellectual_challenge", "work_life_balance",
  "financial_reward", "variety", "teamwork",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting extract-job-traits");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(body.batch_size || 20, 50);
    const force = body.force === true;

    console.log(`Batch size: ${batchSize}, force: ${force}`);

    // Fetch jobs with descriptions that haven't been processed
    let query = supabase
      .from("jobs")
      .select("id, title, description, industry, career_level")
      .not("description", "is", null)
      .order("created_at", { ascending: false })
      .limit(batchSize);

    if (!force) {
      query = query.is("job_traits", null);
    }

    const { data: jobs, error: jobsError } = await query;
    console.log(`Fetched ${jobs?.length || 0} jobs, error: ${jobsError?.message || 'none'}`);
    if (jobsError) throw jobsError;
    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ message: "No jobs to process", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    let errors = 0;

    // Process in mini-batches of 5 to manage rate limits
    for (let i = 0; i < jobs.length; i += 5) {
      const batch = jobs.slice(i, i + 5);

      const results = await Promise.allSettled(
        batch.map(async (job) => {
          const description = (job.description || "").slice(0, 2000);
          const prompt = `Analyze this job listing and extract the personality traits, work values, and key skills it requires.

Job Title: ${job.title}
Industry: ${job.industry || "Unknown"}
Career Level: ${job.career_level || "Unknown"}
Description: ${description}`;

          const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GEMINI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content: `You are a career psychologist. Extract Holland RIASEC personality demands and work values from job descriptions. Be accurate - only score dimensions the job genuinely requires.`,
                },
                { role: "user", content: prompt },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "extract_job_traits",
                    description: "Extract RIASEC scores, work values, and key skills from a job description",
                    parameters: {
                      type: "object",
                      properties: {
                        riasec: {
                          type: "object",
                          description: "Holland RIASEC scores (0-100) representing what personality traits this job demands",
                          properties: {
                            R: { type: "number", description: "Realistic - hands-on, practical, physical tasks" },
                            I: { type: "number", description: "Investigative - analytical, research, problem-solving" },
                            A: { type: "number", description: "Artistic - creative, expressive, design-oriented" },
                            S: { type: "number", description: "Social - helping, teaching, mentoring" },
                            E: { type: "number", description: "Enterprising - leading, persuading, managing" },
                            C: { type: "number", description: "Conventional - organizing, data, structured processes" },
                          },
                          required: RIASEC_KEYS,
                        },
                        values: {
                          type: "object",
                          description: "Work values this role emphasises (0-100)",
                          properties: {
                            autonomy: { type: "number" },
                            creativity: { type: "number" },
                            stability: { type: "number" },
                            helping_others: { type: "number" },
                            leadership: { type: "number" },
                            intellectual_challenge: { type: "number" },
                            work_life_balance: { type: "number" },
                            financial_reward: { type: "number" },
                            variety: { type: "number" },
                            teamwork: { type: "number" },
                          },
                          required: VALUE_KEYS,
                        },
                        key_skills: {
                          type: "array",
                          items: { type: "string" },
                          description: "Top 5-10 key skills or traits this job requires",
                        },
                      },
                      required: ["riasec", "values", "key_skills"],
                      additionalProperties: false,
                    },
                  },
                },
              ],
              tool_choice: { type: "function", function: { name: "extract_job_traits" } },
            }),
          });

          if (response.status === 429) {
            throw new Error("rate_limited");
          }
          if (response.status === 402) {
            throw new Error("credits_exhausted");
          }
          if (!response.ok) {
            const text = await response.text();
            throw new Error(`AI error ${response.status}: ${text}`);
          }

          const aiText = await response.text();
          let traits;
          try {
            const aiData = JSON.parse(aiText);
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall) {
              traits = JSON.parse(toolCall.function.arguments);
            } else {
              // Fallback: try to extract JSON from content
              const content = aiData.choices?.[0]?.message?.content || aiText;
              const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
              traits = JSON.parse(jsonMatch ? jsonMatch[1] : content);
            }
          } catch (parseErr) {
            console.error("Parse error for job", job.id, "raw:", aiText.slice(0, 500));
            throw new Error("Failed to parse AI response");
          }

          // Validate and clamp scores
          for (const k of RIASEC_KEYS) {
            traits.riasec[k] = Math.max(0, Math.min(100, Math.round(traits.riasec[k] || 0)));
          }
          for (const k of VALUE_KEYS) {
            traits.values[k] = Math.max(0, Math.min(100, Math.round(traits.values[k] || 0)));
          }
          traits.key_skills = (traits.key_skills || []).slice(0, 10);
          traits.extracted_at = new Date().toISOString();

          const { error: updateError } = await supabase
            .from("jobs")
            .update({ job_traits: traits })
            .eq("id", job.id);

          if (updateError) throw updateError;
          return true;
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled") {
          processed++;
        } else {
          errors++;
          console.error("Job trait extraction error:", r.reason?.message);
          if (r.reason?.message === "rate_limited" || r.reason?.message === "credits_exhausted") {
            // Stop processing on rate limit or credits
            return new Response(
              JSON.stringify({ processed, errors, stopped: r.reason.message }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          }
        }
      }

      // Small delay between mini-batches
      if (i + 5 < jobs.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    return new Response(
      JSON.stringify({ processed, errors, total: jobs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-job-traits error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
