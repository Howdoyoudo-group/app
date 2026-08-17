import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const threshold = parseInt(new URL(req.url).searchParams.get("threshold") || "100");
    console.log(`🔍 Revalidating industries with <${threshold} jobs...`);

    // Get job counts
    const { data: allJobs, error: fetchError } = await supabase
      .from("jobs")
      .select("*");

    if (fetchError) throw fetchError;

    // Group by industry
    const byIndustry: Record<string, any[]> = {};
    allJobs.forEach((job: any) => {
      if (!byIndustry[job.industry]) byIndustry[job.industry] = [];
      byIndustry[job.industry].push(job);
    });

    // Find low-count industries
    const lowCountIndustries = Object.entries(byIndustry)
      .filter(([_, jobs]) => jobs.length < threshold)
      .map(([industry, jobs]) => ({ industry, count: jobs.length, jobs }));

    console.log(`Found ${lowCountIndustries.length} industries with <${threshold} jobs`);

    // Re-validate jobs for low-count industries
    let revalidatedCount = 0;
    for (const { industry, jobs } of lowCountIndustries) {
      console.log(`  ▶ ${industry}: Re-validating ${jobs.length} jobs...`);

      // Mark jobs as needing revalidation (set expires_at to now to force fresh expiry calculation)
      const { error: updateError } = await supabase
        .from("jobs")
        .update({
          expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("industry", industry);

      if (updateError) {
        console.error(`    ✗ Error revalidating ${industry}:`, updateError);
      } else {
        console.log(`    ✓ Revalidated ${jobs.length} jobs`);
        revalidatedCount += jobs.length;
      }
    }

    // Trigger validate-jobs once PER industry. validate-jobs only ever reads
    // a singular body.industry - it has no concept of body.industries or
    // body.forceRevalidate, so the previous single call with
    // { industries: [...], forceRevalidate: true } was silently ignored on
    // every field, meaning targetIndustry fell through to null and every
    // trigger of this function ran a full, UNSCOPED sweep of the entire
    // jobs table instead of just these low-count industries. Confirmed live
    // 2026-08-17: this had been running for ~2 weeks and was very likely
    // the dominant cause of an unexpected ~20k-job drop across that period -
    // each unscoped run walks (and can delete/reassign from) a real chunk
    // of the whole table via validate-jobs' persisted cursor, not just the
    // handful of industries this function is meant to touch.
    console.log(`\n📋 Triggering validate-jobs for ${lowCountIndustries.length} industries (one call per industry)...`);
    for (const { industry } of lowCountIndustries) {
      try {
        const validateRes = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/validate-jobs`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ industry }),
          }
        );
        const validateData = await validateRes.json();
        console.log(`  validate-jobs(${industry}):`, validateData);
      } catch (validateError) {
        console.error(`  Error calling validate-jobs(${industry}):`, validateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Revalidation triggered for ${lowCountIndustries.length} industries`,
        industriesRevalidated: lowCountIndustries.map((i) => ({
          industry: i.industry,
          jobsRevalidated: i.count,
        })),
        totalJobsRevalidated: revalidatedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Revalidation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
