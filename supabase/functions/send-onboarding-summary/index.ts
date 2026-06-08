import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENDER_DOMAIN = "notify.howdoyoudo.group";
const FROM_EMAIL = `hello@${SENDER_DOMAIN}`;
const FROM_NAME = "Howdoyoudo";
const SITE_URL = "https://www.howdoyoudo.co.uk";

interface ProfileRow {
  id: string;
  full_name: string | null;
  career_level: string | null;
  salary_expectation: string | null;
  location_preference: string | null;
  industry_interests: string[] | null;
  role_preferences: string[] | null;
  job_preferences: Record<string, unknown> | null;
  understand_me_results: Record<string, unknown> | null;
  riasec_scores: Record<string, number> | null;
  work_values: Record<string, number> | null;
}

const RIASEC_LABELS: Record<string, string> = {
  R: "Realistic - hands-on, practical",
  I: "Investigative - analytical, curious",
  A: "Artistic - creative, expressive",
  S: "Social - helping, mentoring",
  E: "Enterprising - leading, persuading",
  C: "Conventional - organised, systematic",
};

function topRiasec(scores: Record<string, number> | null): { code: string; label: string } | null {
  if (!scores) return null;
  const sorted = Object.entries(scores).sort((a, b) => (b[1] as number) - (a[1] as number));
  if (!sorted.length) return null;
  const code = sorted.slice(0, 3).map(([k]) => k).join("");
  const label = RIASEC_LABELS[sorted[0][0]] || "";
  return { code, label };
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}

function pill(label: string): string {
  return `<span style="display:inline-block;background:#f5f5f0;border:1.5px solid #1a1a1a;color:#1a1a1a;padding:4px 10px;font-size:12px;font-weight:700;margin:2px 4px 2px 0;letter-spacing:0.5px;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">${escape(label)}</span>`;
}

function buildHtml(profile: ProfileRow, suggestedRoles: string[]): string {
  const rawFirst = (profile.full_name || "there").split(" ")[0];
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  const industries = profile.industry_interests || [];
  const roles = profile.role_preferences || [];
  const passions = ((profile.job_preferences as any)?.passions as string[] | undefined) || [];
  const passionsText = ((profile.job_preferences as any)?.passionsText as string | undefined) || "";
  const riasec = topRiasec(profile.riasec_scores);
  const umRoles = ((profile.understand_me_results as any)?.roleMatches as Array<{ role?: string; percentage?: number }> | undefined) || [];
  const topUmRoles = umRoles.filter((r) => r.role).slice(0, 3);

  const industriesHtml = industries.length ? industries.map(pill).join("") : `<em style="color:#999;font-size:13px;">None selected yet - <a href="${SITE_URL}/onboarding?restart=1" style="color:#00e600;">add some</a></em>`;
  const rolesHtml = roles.length ? roles.map(pill).join("") : `<em style="color:#999;font-size:13px;">No role preferences yet</em>`;
  const passionsHtml = passions.length ? passions.map(pill).join("") : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>You're all set, ${escape(firstName)}</title>
<link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;"><tr><td align="center" style="padding:32px 16px 40px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:2px solid #1a1a1a;">

  <!-- Header -->
  <tr><td style="background:#1a1a1a;padding:28px 36px;">
    <p style="margin:0;font-family:'Dela Gothic One',Impact,'Arial Black',sans-serif;font-size:32px;font-weight:400;color:#ffffff;letter-spacing:-0.5px;line-height:1;">howdoyoudo<span style="color:#00e600;">?</span></p>
  </td></tr>

  <!-- Intro -->
  <tr><td style="padding:36px 36px 8px 36px;">
    <h2 style="margin:0 0 8px 0;font-size:28px;font-weight:800;color:#1a1a1a;line-height:1.1;font-family:'Arial Black',Impact,'Helvetica Neue',Arial,sans-serif;">You're all set, ${escape(firstName)}<span style="color:#00e600;">.</span></h2>
    <p style="margin:0;font-size:12px;color:#00e600;text-transform:uppercase;letter-spacing:3px;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;font-weight:700;">A quick snapshot of you</p>
  </td></tr>

  <tr><td style="padding:16px 36px 8px 36px;">
    <p style="margin:0;font-size:15px;color:#333;line-height:1.7;">
      Thanks for sharing what makes you tick. Here's what we've captured — you can edit any of it from your profile at any time.
    </p>
  </td></tr>

  <tr><td style="padding:0 36px 0 36px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:20px;background:#f5f5f0;border-left:4px solid #00e600;">
    <h3 style="margin:0 0 10px 0;font-size:11px;color:#00e600;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Industries you're tracking</h3>
    <div style="line-height:1.8;">${industriesHtml}</div>
    ${industries.length ? `<p style="margin:12px 0 0 0;font-size:13px;color:#666;">You'll get a daily morning briefing for these. UK weekdays.</p>` : ""}
  </td></tr></table>
  </td></tr>

  <tr><td style="padding:24px 36px 0 36px;">
    <h3 style="margin:0 0 10px 0;font-size:11px;color:#1a1a1a;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Role preferences</h3>
    <div style="line-height:1.8;">${rolesHtml}</div>
  </td></tr>

  ${passions.length || passionsText ? `
  <tr><td style="padding:24px 36px 0 36px;">
    <h3 style="margin:0 0 10px 0;font-size:11px;color:#1a1a1a;text-transform:uppercase;letter-spacing:2px;font-weight:700;">What you love outside work</h3>
    <div style="line-height:1.8;">${passionsHtml}</div>
    ${passionsText ? `<p style="margin:12px 0 0 0;font-size:14px;color:#333;line-height:1.6;font-style:italic;">"${escape(passionsText)}"</p>` : ""}
  </td></tr>
  ` : ""}

  ${riasec ? `
  <tr><td style="padding:24px 36px 0 36px;">
    <h3 style="margin:0 0 10px 0;font-size:11px;color:#1a1a1a;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Your career personality</h3>
    <p style="margin:0 0 4px 0;font-size:22px;color:#1a1a1a;font-weight:800;font-family:'Arial Black',Impact,Arial,sans-serif;">${escape(riasec.code)}</p>
    <p style="margin:0;font-size:13px;color:#666;">Top dimension: ${escape(riasec.label)}</p>
  </td></tr>
  ` : ""}

  ${suggestedRoles.length ? `
  <tr><td style="padding:24px 36px 0 36px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px;background:#1a1a1a;">
    <h3 style="margin:0 0 14px 0;font-size:11px;color:#00e600;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Roles that may match you</h3>
    ${suggestedRoles.map((r) => `<p style="margin:6px 0;font-size:15px;color:#ffffff;font-weight:bold;font-family:'Arial Black',Impact,Arial,sans-serif;">→ ${escape(r)}</p>`).join("")}
    <p style="margin:18px 0 0 0;"><a href="${SITE_URL}/my-jobs" style="color:#00e600;font-size:13px;text-decoration:underline;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">See your matched jobs →</a></p>
  </td></tr></table>
  </td></tr>
  ` : ""}

  <tr><td style="padding:32px 36px 0 36px;">
    <h3 style="margin:0 0 14px 0;font-size:11px;color:#00e600;text-transform:uppercase;letter-spacing:2px;font-weight:700;">3 ways to get the most from Howdoyoudo</h3>
    <p style="margin:8px 0;font-size:14px;color:#333;line-height:1.7;">
      <strong style="color:#1a1a1a;">1. Watch your inbox.</strong> Daily UK morning briefings for the industries you picked.
    </p>
    <p style="margin:8px 0;font-size:14px;color:#333;line-height:1.7;">
      <strong style="color:#1a1a1a;">2. Check My Jobs.</strong> Personalised job inbox refreshed continually — based on your CV, RIASEC, and preferences.
    </p>
    <p style="margin:8px 0;font-size:14px;color:#333;line-height:1.7;">
      <strong style="color:#1a1a1a;">3. Explore industries.</strong> Each page unpacks who's hiring, what's happening and how to break in.
    </p>
  </td></tr>

  <tr><td style="padding:28px 36px;">
    <a href="${SITE_URL}/my-jobs" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:14px 28px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-right:8px;">Go to my jobs</a>
    <a href="${SITE_URL}/my-profile" style="display:inline-block;background:#ffffff;color:#1a1a1a;text-decoration:none;padding:13px 26px;border:2px solid #1a1a1a;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Edit profile</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 36px;background:#1a1a1a;border-top:2px solid #00e600;">
    <p style="margin:0 0 6px 0;font-size:16px;color:#ffffff;font-family:'Dela Gothic One',Impact,'Arial Black',sans-serif;">howdoyoudo<span style="color:#00e600;">?</span></p>
    <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
      We're really glad you're here. Reply to this email anytime — a real person reads it.<br>
      <a href="${SITE_URL}" style="color:#00e600;text-decoration:none;">www.howdoyoudo.co.uk</a>
    </p>
  </td></tr>

</table></td></tr></table></body></html>`;
}

function buildText(profile: ProfileRow, suggestedRoles: string[]): string {
  const rawFirst = (profile.full_name || "there").split(" ")[0];
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  const industries = profile.industry_interests || [];
  const roles = profile.role_preferences || [];
  const passions = ((profile.job_preferences as any)?.passions as string[] | undefined) || [];
  const riasec = topRiasec(profile.riasec_scores);

  return `You're all set, ${firstName}.

Here's a snapshot of what we've captured:

INDUSTRIES YOU'RE TRACKING
${industries.length ? industries.join(", ") : "(none yet)"}

ROLE PREFERENCES
${roles.length ? roles.join(", ") : "(none yet)"}

${passions.length ? `WHAT YOU LOVE OUTSIDE WORK\n${passions.join(", ")}\n\n` : ""}${riasec ? `YOUR CAREER PERSONALITY: ${riasec.code}\n${riasec.label}\n\n` : ""}${suggestedRoles.length ? `ROLES THAT MAY MATCH YOU\n${suggestedRoles.map((r) => `→ ${r}`).join("\n")}\n\n` : ""}3 WAYS TO GET THE MOST FROM THE SITE
1. Watch your inbox - daily UK morning briefings.
2. Check My Jobs - your personalised job inbox.
3. Explore industries - each page unpacks who's hiring and how to get in.

My Jobs: ${SITE_URL}/my-jobs
Edit profile: ${SITE_URL}/my-profile

We're really glad you're here.

-
howdoyoudo.group`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorised" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = user.email;
    if (!email) {
      return new Response(JSON.stringify({ error: "No email on user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build suggested roles: prefer Understand Me roleMatches, otherwise role preferences
    const umRoles = ((profile.understand_me_results as any)?.roleMatches as Array<{ role?: string }> | undefined) || [];
    let suggested = umRoles.map((r) => r.role).filter(Boolean) as string[];
    if (suggested.length === 0) suggested = (profile.role_preferences as string[]) || [];
    suggested = suggested.slice(0, 5);

    const firstName = ((profile.full_name as string | null) || "there").split(" ")[0];
    const messageId = crypto.randomUUID();
    const runId = crypto.randomUUID();

    const payload = {
      run_id: runId,
      message_id: messageId,
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      sender_domain: SENDER_DOMAIN,
      subject: `${firstName}, here's your How Do You Do snapshot.`,
      html: buildHtml(profile as ProfileRow, suggested),
      text: buildText(profile as ProfileRow, suggested),
      purpose: "transactional",
      label: "onboarding-summary",
      queued_at: new Date().toISOString(),
    };

    const { sendViaResend } = await import("../_shared/send-via-resend.ts");
    const { id, error } = await sendViaResend(payload);

    if (error) {
      console.error("Failed to send summary email via Resend:", error);
      return new Response(
        JSON.stringify({ error: `Failed to send: ${error}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Onboarding summary sent to ${email}, resend_id: ${id}`);

    return new Response(
      JSON.stringify({ success: true, sent: true, id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Onboarding summary error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
