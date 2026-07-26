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

// Same brand assets as the monthly update newsletter (send-june-update) -
// real logo + Howdy mascot, not the text-only faux-wordmark this email used
// to draw with CSS borders.
const OLD_ASSETS = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/email-assets";
const WORDMARK = `${OLD_ASSETS}/howdoyoudo-wordmark.png`;
const HOWDY_AVATAR = `${OLD_ASSETS}/howdy-character.png`;

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
  return `<span class="chip">${escape(label)}</span>`;
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
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>You're all set, ${escape(firstName)}</title>
<style>
  body { margin:0; padding:0; background:#ffffff; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#0a0a0a; }
  .wrap { max-width:600px; margin:0 auto; padding:32px 24px 48px; }
  h1, h2 { font-family: 'Dela Gothic One', Georgia, serif; font-weight:400; line-height:1.1; margin:0 0 10px; letter-spacing:-0.02em; }
  h1 { font-size:32px; }
  h2 { font-size:15px; }
  p { font-size:15px; line-height:1.6; margin:0 0 12px; color:#1a1a1a; }
  a { color:#0a0a0a; }
  .accent { color:#00b800; }
  .label { font-family:'Dela Gothic One',Georgia,serif; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#00b800; margin:0 0 10px; }
  .cta { display:inline-block; background:#00E600; color:#0a0a0a; font-family:'Dela Gothic One',Georgia,serif; font-size:13px; font-weight:700; padding:12px 22px; text-decoration:none; border:2px solid #0a0a0a; letter-spacing:0.04em; margin:0 8px 8px 0; }
  .cta-outline { background:#ffffff; }
  .section { padding:24px 0; border-top:2px solid #0a0a0a; }
  .section:first-of-type { border-top:none; }
  .chip { display:inline-block; background:#0a0a0a; color:#ffffff; font-family:'Dela Gothic One',Georgia,serif; font-size:11px; padding:6px 12px; margin:3px 4px 3px 0; letter-spacing:0.05em; }
  .highlight { background:#0a0a0a; border:2px solid #0a0a0a; padding:22px; }
  .highlight h2, .highlight .label { color:#00E600; }
  .highlight p, .highlight a { color:#ffffff; }
  .meta { font-size:13px; color:#555; line-height:1.5; }
  .footer { margin-top:32px; padding-top:20px; border-top:1px solid #eee; text-align:center; }
  .footer a { color:#555; text-decoration:underline; }
</style>
</head>
<body>
<div class="wrap">

  <div style="text-align:center; margin-bottom:24px;">
    <img src="${WORDMARK}" alt="Howdoyoudo" width="180" style="max-width:180px;height:auto;" />
  </div>

  <img src="${HOWDY_AVATAR}" alt="Howdy" width="88" height="88" style="display:block;margin:0 auto 16px;max-width:88px;height:auto;border-radius:18px;" />

  <div style="text-align:center;">
    <h1>You're all set, ${escape(firstName)}<span class="accent">.</span></h1>
    <p class="label" style="margin-bottom:20px;">A quick snapshot of you</p>
  </div>

  <p>Thanks for sharing what makes you tick. Here's what we've captured — you can edit any of it from your profile at any time.</p>

  <div class="section">
    <p class="label">Industries you're tracking</p>
    <div style="line-height:2;">${industriesHtml}</div>
    ${industries.length ? `<p class="meta" style="margin-top:10px;">You'll get a daily morning briefing for these. UK weekdays.</p>` : ""}
  </div>

  <div class="section">
    <p class="label" style="color:#0a0a0a;">Role preferences</p>
    <div style="line-height:2;">${rolesHtml}</div>
  </div>

  ${passions.length || passionsText ? `
  <div class="section">
    <p class="label" style="color:#0a0a0a;">What you love outside work</p>
    <div style="line-height:2;">${passionsHtml}</div>
    ${passionsText ? `<p style="margin-top:10px;font-style:italic;color:#333;">"${escape(passionsText)}"</p>` : ""}
  </div>
  ` : ""}

  ${riasec ? `
  <div class="section">
    <p class="label" style="color:#0a0a0a;">Your career personality</p>
    <h2 style="font-size:26px;margin-bottom:4px;">${escape(riasec.code)}</h2>
    <p class="meta">Top dimension: ${escape(riasec.label)}</p>
  </div>
  ` : ""}

  ${suggestedRoles.length ? `
  <div class="section">
    <div class="highlight">
      <p class="label">Roles that may match you</p>
      ${suggestedRoles.map((r) => `<p style="margin:6px 0;font-weight:700;">→ ${escape(r)}</p>`).join("")}
      <p style="margin:16px 0 0;"><a href="${SITE_URL}/my-jobs" class="accent" style="text-decoration:underline;font-weight:700;">See your matched jobs →</a></p>
    </div>
  </div>
  ` : ""}

  <div class="section">
    <p class="label">3 ways to get the most from Howdoyoudo</p>
    <p><strong>1. Watch your inbox.</strong> Daily UK morning briefings for the industries you picked.</p>
    <p><strong>2. Check My Jobs.</strong> Personalised job inbox refreshed continually — based on your CV, RIASEC, and preferences.</p>
    <p><strong>3. Explore industries.</strong> Each page unpacks who's hiring, what's happening and how to break in.</p>
  </div>

  <div class="section" style="text-align:center;">
    <a href="${SITE_URL}/my-jobs" class="cta">Go to my jobs</a>
    <a href="${SITE_URL}/my-profile" class="cta cta-outline">Edit profile</a>
  </div>

  <div class="footer">
    <p style="font-family:'Dela Gothic One',Georgia,serif; font-size:16px; margin-bottom:6px;">howdoyoudo<span class="accent">?</span></p>
    <p class="meta">
      We're really glad you're here. Reply to this email anytime — a real person reads it.<br/>
      <a href="${SITE_URL}">www.howdoyoudo.co.uk</a>
    </p>
  </div>
</div>
</body>
</html>`;
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
