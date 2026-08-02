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
    // Get job counts by industry
    const { data: jobCounts, error: countError } = await supabase
      .from("jobs")
      .select("industry")
      .then(async (res) => {
        if (res.error) return res;
        const counts: Record<string, number> = {};
        res.data.forEach((job: any) => {
          counts[job.industry] = (counts[job.industry] || 0) + 1;
        });
        return { data: Object.entries(counts).map(([industry, count]) => ({ industry, count })) };
      });

    if (countError) throw countError;

    // Identify industries with <100 jobs
    const lowCount = jobCounts.filter((j: any) => j.count < 100).sort((a: any, b: any) => a.count - b.count);
    const healthy = jobCounts.filter((j: any) => j.count >= 100).sort((a: any, b: any) => b.count - a.count);

    // Get recent errors from logs
    const { data: recentJobs, error: jobError } = await supabase
      .from("jobs")
      .select("industry, scraped_at, source_url")
      .order("scraped_at", { ascending: false })
      .limit(1000);

    if (jobError) throw jobError;

    // Analyze scraping by industry
    const scrapingStatus: Record<string, any> = {};
    recentJobs.forEach((job: any) => {
      if (!scrapingStatus[job.industry]) {
        scrapingStatus[job.industry] = {
          lastScraped: job.scraped_at,
          sources: new Set(),
          jobsInLastHour: 0,
        };
      }
      scrapingStatus[job.industry].sources.add(job.source_url);

      const jobTime = new Date(job.scraped_at).getTime();
      const oneHourAgo = Date.now() - 3600000;
      if (jobTime > oneHourAgo) {
        scrapingStatus[job.industry].jobsInLastHour++;
      }
    });

    // Get source health
    const { data: sourceHealth, error: healthError } = await supabase
      .from("source_health_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (healthError) throw healthError;

    // Compile audit report
    const audit = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIndustries: jobCounts.length,
        healthyIndustries: healthy.length,
        problemIndustries: lowCount.length,
        totalJobs: jobCounts.reduce((sum: number, j: any) => sum + j.count, 0),
      },
      problemIndustries: lowCount.map((j: any) => ({
        industry: j.industry,
        jobs: j.count,
        severity: j.count === 0 ? "CRITICAL" : j.count < 50 ? "HIGH" : "MEDIUM",
        lastScraped: scrapingStatus[j.industry]?.lastScraped,
        jobsInLastHour: scrapingStatus[j.industry]?.jobsInLastHour || 0,
        sources: Array.from(scrapingStatus[j.industry]?.sources || []),
      })),
      healthyIndustries: healthy.slice(0, 10).map((j: any) => ({
        industry: j.industry,
        jobs: j.count,
        jobsInLastHour: scrapingStatus[j.industry]?.jobsInLastHour || 0,
      })),
      sourceHealth: sourceHealth.slice(0, 5).map((sh: any) => ({
        sourceType: sh.source_type,
        workingCount: sh.working_count,
        brokenCount: sh.broken_count,
        timestamp: sh.created_at,
      })),
      recommendations: generateRecommendations(lowCount, scrapingStatus),
    };

    return new Response(JSON.stringify(audit, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Audit error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateRecommendations(lowCount: any[], scrapingStatus: Record<string, any>) {
  const recs = [];

  lowCount.forEach((industry: any) => {
    const status = scrapingStatus[industry.industry];

    if (industry.count === 0) {
      recs.push(`🔴 ${industry.industry}: NO JOBS - Check if industry is in COMPANY_INDUSTRY_MAP and if scrapers are running`);
    } else if (status?.jobsInLastHour === 0) {
      recs.push(`🟡 ${industry.industry}: Last jobs ${getDaysAgo(status?.lastScraped)} ago - Scraper may be broken`);
    } else if (industry.count < 50) {
      recs.push(`🟠 ${industry.industry}: Only ${industry.count} jobs - May need specialist scrapers or better keywords`);
    }
  });

  return recs;
}

function getDaysAgo(date: string | undefined): string {
  if (!date) return "unknown";
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}
