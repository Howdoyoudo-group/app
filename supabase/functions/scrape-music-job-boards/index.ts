import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MusicJob {
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  source: string;
  scraped_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const allJobs: any[] = [];
  const results: { source: string; jobsFound: number; status: string }[] = [];

  try {
    // 1. Doors Open - UK music industry job board
    console.log("Scraping Doors Open...");
    try {
      const doorsRes = await fetch("https://www.doorsopen.co/jobs", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)" }
      });
      if (doorsRes.ok) {
        const html = await doorsRes.text();
        // Parse jobs from HTML (selector may vary)
        const jobMatches = html.match(/<article[^>]*class="[^"]*job[^"]*"[^>]*>.*?<\/article>/gs) || [];
        const doorsJobs = jobMatches.slice(0, 20).map((jobHtml: string) => ({
          title: extractText(jobHtml, 'h[2-3]') || "Music Industry Job",
          company: extractText(jobHtml, '.company|.employer') || "Unknown",
          location: extractText(jobHtml, '.location|.city') || "UK",
          url: extractAttr(jobHtml, 'a', 'href') || "https://www.doorsopen.co/jobs",
          source: "Doors Open",
          scraped_at: new Date().toISOString(),
          industry: "music",
        })).filter((j: any) => j.url.includes("doorsopen"));

        allJobs.push(...doorsJobs);
        results.push({ source: "Doors Open", jobsFound: doorsJobs.length, status: "success" });
        console.log(`  ✓ Found ${doorsJobs.length} jobs`);
      }
    } catch (e) {
      console.error("Doors Open error:", e);
      results.push({ source: "Doors Open", jobsFound: 0, status: "error" });
    }

    // 2. Music Careers - specialist platform
    console.log("Scraping Music Careers...");
    try {
      const musicRes = await fetch("https://www.musiccareers.co/jobs", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)" }
      });
      if (musicRes.ok) {
        const html = await musicRes.text();
        const jobMatches = html.match(/<div[^>]*class="[^"]*job[^"]*"[^>]*>.*?<\/div>/gs) || [];
        const careerJobs = jobMatches.slice(0, 20).map((jobHtml: string) => ({
          title: extractText(jobHtml, '.job-title|h3') || "Music Role",
          company: extractText(jobHtml, '.company|.employer') || "Unknown",
          location: extractText(jobHtml, '.location|.place') || "UK",
          url: extractAttr(jobHtml, 'a', 'href') || "https://www.musiccareers.co/jobs",
          source: "Music Careers",
          scraped_at: new Date().toISOString(),
          industry: "music",
        })).filter((j: any) => j.url.includes("musiccareers"));

        allJobs.push(...careerJobs);
        results.push({ source: "Music Careers", jobsFound: careerJobs.length, status: "success" });
        console.log(`  ✓ Found ${careerJobs.length} jobs`);
      }
    } catch (e) {
      console.error("Music Careers error:", e);
      results.push({ source: "Music Careers", jobsFound: 0, status: "error" });
    }

    // 3. Music Jobs UK
    console.log("Scraping Music Jobs UK...");
    try {
      const ukRes = await fetch("https://www.music-jobs.com/uk", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)" }
      });
      if (ukRes.ok) {
        const html = await ukRes.text();
        const jobMatches = html.match(/<li[^>]*class="[^"]*job[^"]*"[^>]*>.*?<\/li>/gs) || [];
        const ukJobs = jobMatches.slice(0, 20).map((jobHtml: string) => ({
          title: extractText(jobHtml, 'a') || "Music Job",
          company: extractText(jobHtml, '.company|strong') || "Unknown",
          location: extractText(jobHtml, '.location|.place') || "UK",
          url: extractAttr(jobHtml, 'a', 'href') || "https://www.music-jobs.com/uk",
          source: "Music Jobs UK",
          scraped_at: new Date().toISOString(),
          industry: "music",
        })).filter((j: any) => j.url.includes("music-jobs"));

        allJobs.push(...ukJobs);
        results.push({ source: "Music Jobs UK", jobsFound: ukJobs.length, status: "success" });
        console.log(`  ✓ Found ${ukJobs.length} jobs`);
      }
    } catch (e) {
      console.error("Music Jobs UK error:", e);
      results.push({ source: "Music Jobs UK", jobsFound: 0, status: "error" });
    }

    // 4. Rostr Jobs
    console.log("Scraping Rostr Jobs...");
    try {
      const rostrRes = await fetch("https://jobs.rostr.cc", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)" }
      });
      if (rostrRes.ok) {
        const html = await rostrRes.text();
        const jobMatches = html.match(/<div[^>]*class="[^"]*job[^"]*"[^>]*>.*?<\/div>/gs) || [];
        const rostrJobs = jobMatches.slice(0, 20).map((jobHtml: string) => ({
          title: extractText(jobHtml, 'h[2-3]|a') || "Rostr Job",
          company: extractText(jobHtml, '.company|.org') || "Rostr Network",
          location: extractText(jobHtml, '.location') || "Remote",
          url: extractAttr(jobHtml, 'a', 'href') || "https://jobs.rostr.cc",
          source: "Rostr Jobs",
          scraped_at: new Date().toISOString(),
          industry: "music",
        })).filter((j: any) => j.url.includes("rostr"));

        allJobs.push(...rostrJobs);
        results.push({ source: "Rostr Jobs", jobsFound: rostrJobs.length, status: "success" });
        console.log(`  ✓ Found ${rostrJobs.length} jobs`);
      }
    } catch (e) {
      console.error("Rostr Jobs error:", e);
      results.push({ source: "Rostr Jobs", jobsFound: 0, status: "error" });
    }

    // 5. IQ Magazine Jobs
    console.log("Scraping IQ Magazine Jobs...");
    try {
      const iqRes = await fetch("https://www.iqmagazine.com/jobs", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)" }
      });
      if (iqRes.ok) {
        const html = await iqRes.text();
        const jobMatches = html.match(/<a[^>]*href="[^"]*jobs[^"]*"[^>]*>.*?<\/a>/gs) || [];
        const iqJobs = jobMatches.slice(0, 20).map((jobHtml: string) => ({
          title: extractText(jobHtml, '') || "Live Music Job",
          company: extractText(jobHtml, '.company') || "IQ Advertiser",
          location: extractText(jobHtml, '.location') || "UK",
          url: extractAttr(jobHtml, 'a', 'href') || "https://www.iqmagazine.com/jobs",
          source: "IQ Magazine Jobs",
          scraped_at: new Date().toISOString(),
          industry: "music",
        })).filter((j: any) => j.url);

        allJobs.push(...iqJobs);
        results.push({ source: "IQ Magazine Jobs", jobsFound: iqJobs.length, status: "success" });
        console.log(`  ✓ Found ${iqJobs.length} jobs`);
      }
    } catch (e) {
      console.error("IQ Magazine error:", e);
      results.push({ source: "IQ Magazine Jobs", jobsFound: 0, status: "error" });
    }

    // Insert jobs into database
    if (allJobs.length > 0) {
      console.log(`\nInserting ${allJobs.length} total jobs into database...`);
      const { data, error } = await supabase
        .from("jobs")
        .upsert(allJobs.map(job => ({
          ...job,
          expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        })), { onConflict: "url" });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      console.log(`✓ Inserted/updated ${data?.length || allJobs.length} jobs`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalJobsScraped: allJobs.length,
        results,
        message: `Successfully scraped music job boards. Found ${allJobs.length} jobs total.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Scraper error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        results,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper functions
function extractText(html: string, selector: string): string {
  try {
    const patterns = selector.split('|').map(s => s.trim());
    for (const pattern of patterns) {
      const regex = pattern.startsWith('.')
        ? new RegExp(`class=["'][^"']*${pattern.slice(1)}[^"']*["'][^>]*>([^<]+)`, 'i')
        : new RegExp(`<${pattern}[^>]*>([^<]+)</${pattern}>`, 'i');
      const match = html.match(regex);
      if (match?.[1]) return match[1].trim().slice(0, 255);
    }
  } catch (e) {
    console.error("Extract text error:", e);
  }
  return "";
}

function extractAttr(html: string, tag: string, attr: string): string {
  try {
    const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, 'i');
    const match = html.match(regex);
    if (match?.[1]) return match[1];
  } catch (e) {
    console.error("Extract attr error:", e);
  }
  return "";
}
