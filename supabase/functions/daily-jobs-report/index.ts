import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all jobs
    const allJobs: any[] = [];
    let from = 0;
    const batchSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("jobs")
        .select("source_url, industry, company")
        .range(from, from + batchSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allJobs.push(...data);
      if (data.length < batchSize) break;
      from += batchSize;
    }

    const totalJobs = allJobs.length;

    // By source
    const sourceMap = new Map<string, number>();
    for (const job of allJobs) {
      const raw = job.source_url || "Unknown";
      let source: string;
      if (raw === "adzuna.com") {
        source = "Adzuna";
      } else {
        try {
          source = new URL(raw).hostname.replace("www.", "");
        } catch {
          source = raw.length > 40 ? raw.slice(0, 40) + "…" : raw;
        }
      }
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    }
    const sourceRows = [...sourceMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${source}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${count.toLocaleString()}</td></tr>`)
      .join("");

    // By industry
    const industryMap = new Map<string, number>();
    for (const job of allJobs) {
      const ind = job.industry || "Unclassified";
      industryMap.set(ind, (industryMap.get(ind) || 0) + 1);
    }
    const industryRows = [...industryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([ind, count]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${ind}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${count.toLocaleString()}</td></tr>`)
      .join("");

    // Unique companies
    const uniqueCompanies = new Set(allJobs.map(j => j.company)).size;

    const today = new Date().toLocaleDateString("en-GB", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;margin:0">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5">
    <div style="background:#000;padding:24px 30px">
      <h1 style="color:#fff;font-size:22px;margin:0">How do you do<span style="color:#00e600">.</span></h1>
      <p style="color:#aaa;font-size:13px;margin:6px 0 0">Daily Jobs Report - ${today}</p>
    </div>
    <div style="padding:24px 30px">
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;flex:1;text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#000">${totalJobs.toLocaleString()}</div>
          <div style="font-size:12px;color:#777;margin-top:4px">Total Jobs</div>
        </div>
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;flex:1;text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#000">${uniqueCompanies.toLocaleString()}</div>
          <div style="font-size:12px;color:#777;margin-top:4px">Companies</div>
        </div>
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;flex:1;text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#000">${industryMap.size}</div>
          <div style="font-size:12px;color:#777;margin-top:4px">Industries</div>
        </div>
      </div>

      <h2 style="font-size:16px;color:#000;margin:24px 0 12px;border-bottom:2px solid #00e600;padding-bottom:6px">Jobs by Source</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="background:#f4f4f4"><th style="padding:8px 12px;text-align:left">Source</th><th style="padding:8px 12px;text-align:right">Count</th></tr>
        ${sourceRows}
      </table>

      <h2 style="font-size:16px;color:#000;margin:24px 0 12px;border-bottom:2px solid #00e600;padding-bottom:6px">Jobs by Industry</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="background:#f4f4f4"><th style="padding:8px 12px;text-align:left">Industry</th><th style="padding:8px 12px;text-align:right">Count</th></tr>
        ${industryRows}
      </table>

      <p style="font-size:11px;color:#999;margin-top:24px;text-align:center">This report was generated automatically by howdoyoudo.</p>
    </div>
  </div>
</body>
</html>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "howdoyoudo <reports@notify.howdoyoudo.group>",
        to: ["andrew@stanwoodoffice.com"],
        subject: `Daily Jobs Report - ${totalJobs.toLocaleString()} active jobs`,
        html,
      }),
    });

    const emailResult = await emailRes.json();

    return new Response(JSON.stringify({ success: true, totalJobs, sources: sourceMap.size, emailResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
