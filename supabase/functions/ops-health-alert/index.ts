import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALERT_RECIPIENTS = ["woodyharrison100@gmail.com", "andrew@stanwoodoffice.com"];
const DROP_THRESHOLD_PCT = -15;
const HEALTH_MONITOR_STALE_HOURS = 9;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: check, error } = await supabase.rpc("ops_health_check");
    if (error) throw error;

    const issues: string[] = [];

    if (check.http_hard_failures_12h > 0) {
      issues.push(
        `${check.http_hard_failures_12h} scheduled job(s) got a real HTTP error (4xx/5xx) in the last 12 hours — this is the same class of bug that silently disabled embed-jobs for months (a 401 from a bad auth key format). Check the sample errors below.`
      );
    }

    if (check.cron_failures_12h?.length > 0) {
      const names = [...new Set(check.cron_failures_12h.map((f: any) => f.jobname))].join(", ");
      issues.push(`${check.cron_failures_12h.length} cron run(s) failed outright in the last 12 hours: ${names}.`);
    }

    if (check.pct_change_24h !== null && check.pct_change_24h <= DROP_THRESHOLD_PCT) {
      issues.push(
        `Total live jobs dropped ${Math.abs(check.pct_change_24h)}% in the last ~24 hours (${check.baseline_total_jobs?.toLocaleString()} → ${check.total_jobs?.toLocaleString()}). This may be a legitimate expiry wave (validate-jobs has a safety valve for that) or a real scraping outage — worth a quick look.`
      );
    }

    if (check.industry_health_monitor_last_run) {
      const hoursSince = (Date.now() - new Date(check.industry_health_monitor_last_run).getTime()) / 3600000;
      if (hoursSince > HEALTH_MONITOR_STALE_HOURS) {
        issues.push(
          `industry-health-monitor hasn't logged a run in ${Math.round(hoursSince)} hours (should run every 6h). It went silently broken for 2+ months once already (pointed at the wrong Supabase project) — worth checking it's still wired up correctly.`
        );
      }
    } else {
      issues.push(`industry-health-monitor has never logged a run — check it's deployed and the cron is pointed at the right project.`);
    }

    const alertSent = issues.length > 0;

    if (alertSent) {
      const today = new Date().toLocaleDateString("en-GB", {
        weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      });

      const issueRows = issues.map(i => `<li style="margin-bottom:10px">${i}</li>`).join("");
      const sampleRows = (check.http_failure_sample || []).map((s: any) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${s.status_code ?? "—"}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:12px">${(s.error_msg || "").slice(0, 120)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:12px">${s.created}</td></tr>`
      ).join("");

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;margin:0">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5">
    <div style="background:#c0392b;padding:24px 30px">
      <h1 style="color:#fff;font-size:20px;margin:0">⚠ HDYD Pipeline Health Alert</h1>
      <p style="color:#f5cccc;font-size:13px;margin:6px 0 0">${today}</p>
    </div>
    <div style="padding:24px 30px">
      <ul style="font-size:14px;color:#222;line-height:1.5;padding-left:20px">${issueRows}</ul>
      ${sampleRows ? `
      <h2 style="font-size:14px;color:#000;margin:20px 0 8px">Sample failed requests</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="background:#f4f4f4"><th style="padding:6px 12px;text-align:left">Status</th><th style="padding:6px 12px;text-align:left">Error</th><th style="padding:6px 12px;text-align:left">When</th></tr>
        ${sampleRows}
      </table>` : ""}
      <p style="font-size:12px;color:#777;margin-top:20px">Current total: ${check.total_jobs?.toLocaleString()} live jobs.</p>
      <p style="font-size:11px;color:#999;margin-top:20px;text-align:center">Automated check from ops-health-alert. Runs twice daily, only emails when something looks wrong.</p>
    </div>
  </div>
</body>
</html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "howdoyoudo <reports@notify.howdoyoudo.group>",
          to: ALERT_RECIPIENTS,
          subject: `⚠ HDYD pipeline alert — ${issues.length} issue${issues.length > 1 ? "s" : ""} found`,
          html,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, alert_sent: alertSent, issues, check }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
