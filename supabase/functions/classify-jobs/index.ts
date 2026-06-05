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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("GEMINI_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const batchSize = body.batch_size || 50;
    const forceReclassify = body.force || false;

    // 1. Load all title variants for fuzzy matching
    const { data: variants } = await supabase
      .from("title_variants")
      .select("variant_title, canonical_role_id");

    const { data: canonicalRoles } = await supabase
      .from("canonical_roles")
      .select("id, role_category, role_subcategory, role_type");

    const roleMap = new Map(
      (canonicalRoles || []).map((r: any) => [r.id, r])
    );

    // Build variant lookup (lowercased)
    const variantLookup = new Map(
      (variants || []).map((v: any) => [v.variant_title.toLowerCase(), v.canonical_role_id])
    );

    // 2. Fetch unclassified jobs
    let query = supabase
      .from("jobs")
      .select("id, title, description, role_category")
      .order("scraped_at", { ascending: false })
      .limit(batchSize);

    if (!forceReclassify) {
      // Pick up unclassified jobs OR jobs flagged for re-check (e.g. Adzuna category conflict)
      query = query.or("ai_role_category.is.null,needs_review.eq.true");
    }

    const { data: jobs, error: jobsErr } = await query;
    if (jobsErr) throw jobsErr;
    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ message: "No jobs to classify", classified: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = { matched: 0, ai_classified: 0, flagged: 0, errors: 0 };

    // 3. Process each job
    for (const job of jobs) {
      try {
        const titleLower = job.title.toLowerCase().trim();

        // Step A: Exact match
        let matchedRoleId = variantLookup.get(titleLower);

        // Step B: Fuzzy / contains match
        if (!matchedRoleId) {
          for (const [variant, roleId] of variantLookup) {
            if (titleLower.includes(variant) || variant.includes(titleLower)) {
              matchedRoleId = roleId;
              break;
            }
          }
        }

        if (matchedRoleId) {
          const role = roleMap.get(matchedRoleId);
          if (role) {
            await supabase
              .from("jobs")
              .update({
                ai_role_category: role.role_category,
                ai_role_subcategory: role.role_subcategory,
                ai_confidence: 0.95,
                needs_review: false,
                classified_at: new Date().toISOString(),
              })
              .eq("id", job.id);
            results.matched++;
            continue;
          }
        }

        // Step C: AI classification
        const categoryList = [...new Set((canonicalRoles || []).map((r: any) => r.role_category))];
        const prompt = `Classify this job into exactly ONE of these role categories: ${categoryList.join(", ")}.

Job title: "${job.title}"
Job description (first 500 chars): "${(job.description || "").slice(0, 500)}"

Respond with ONLY a JSON object: {"role_category": "...", "role_subcategory": "..." or null, "confidence": 0.0-1.0}
If the job doesn't clearly fit any category, use confidence below 0.5.`;

        const aiResp = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gemini-2.5-flash-lite",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a job classification engine. Respond only with valid JSON. No markdown, no explanation.",
                },
                { role: "user", content: prompt },
              ],
            }),
          }
        );

        if (!aiResp.ok) {
          if (aiResp.status === 429) {
            // Rate limited - stop processing, return what we have
            console.log("Rate limited, stopping batch early");
            break;
          }
          console.error("AI error:", aiResp.status);
          results.errors++;
          continue;
        }

        const aiData = await aiResp.json();
        const content = aiData.choices?.[0]?.message?.content || "";

        // Parse JSON from AI response (handle markdown code blocks)
        let parsed;
        try {
          const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
          parsed = JSON.parse(cleaned);
        } catch {
          console.error("Failed to parse AI response:", content);
          results.errors++;
          continue;
        }

        const confidence = parseFloat(parsed.confidence) || 0;
        const needsReview = confidence < 0.6;

        await supabase
          .from("jobs")
          .update({
            ai_role_category: parsed.role_category || null,
            ai_role_subcategory: parsed.role_subcategory || null,
            ai_confidence: Math.min(confidence, 0.99),
            needs_review: needsReview,
            classified_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        if (needsReview) {
          results.flagged++;
        } else {
          results.ai_classified++;

          // Save successful AI classification as a new title variant for future matching
          if (confidence >= 0.8 && parsed.role_category) {
            const matchingRole = (canonicalRoles || []).find(
              (r: any) =>
                r.role_category === parsed.role_category &&
                (r.role_subcategory || null) === (parsed.role_subcategory || null)
            );
            if (matchingRole) {
              await supabase
                .from("title_variants")
                .upsert(
                  {
                    variant_title: titleLower,
                    canonical_role_id: matchingRole.id,
                    source: "ai",
                  },
                  { onConflict: "variant_title" }
                );
            }
          }
        }

        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error("Error classifying job:", job.id, err);
        results.errors++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Classified ${results.matched + results.ai_classified + results.flagged} jobs`,
        total_processed: jobs.length,
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("classify-jobs error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
