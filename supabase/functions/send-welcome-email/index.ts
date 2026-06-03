import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENDER_DOMAIN = "notify.howdoyoudo.group";
const FROM_EMAIL = `hello@${SENDER_DOMAIN}`;
const FROM_NAME = "How Do You Do";

function buildWelcomeHtml(name: string): string {
  const rawFirst = name.split(" ")[0];
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to How Do You Do</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Arial Black',Impact,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:0 0 32px 0;border-bottom:2px solid #1a1a1a;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#1a1a1a;letter-spacing:-0.5px;">
                howdoyoudo<span style="color:#00e600;">?</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 0 24px 0;">
              <h2 style="margin:0 0 8px 0;font-size:26px;font-weight:800;color:#1a1a1a;line-height:1.1;">
                How do you do, ${firstName}<span style="color:#00e600;">?</span>
              </h2>
              <p style="margin:0;font-size:14px;color:#00e600;text-transform:uppercase;letter-spacing:3px;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                You're in the community
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 28px 0;">
              <h3 style="margin:0 0 12px 0;font-size:13px;color:#00e600;text-transform:uppercase;letter-spacing:2px;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;font-weight:600;">
                What you've signed up for
              </h3>
               <p style="margin:0 0 16px 0;font-size:15px;color:#333;line-height:1.7;font-weight:bold;">
                We live inside markets we barely understand. We buy coffee from brands with cult followings. We stream films from multi-billion dollar studios. We wear fashion on global supply chains. We queue for gigs run by tiny promoters or giant corporations.
              </p>
              <p style="margin:0;font-size:15px;color:#333;line-height:1.7;font-weight:bold;">
                <strong style="color:#1a1a1a;">How Do You Do</strong> dives into the mechanics behind the culture &mdash; unpacking the business models, hustle, risks, and creativity behind the industries that define modern life.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;background-color:#f8f8f6;border-left:3px solid #00e600;">
              <h3 style="margin:0 0 16px 0;font-size:13px;color:#00e600;text-transform:uppercase;letter-spacing:2px;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;font-weight:600;">
                What you'll get from us
              </h3>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="padding:6px 0;font-size:14px;color:#333;line-height:1.6;">&#9654;&ensp; <strong>New episodes</strong> &mdash; deep-dive conversations with people who actually run these industries</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#333;line-height:1.6;">&#9654;&ensp; <strong>Industry news</strong> &mdash; curated breaking news from the sectors you care about</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#333;line-height:1.6;">&#9654;&ensp; <strong>Career maps</strong> &mdash; real roles, real companies, real paths into each industry</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#333;line-height:1.6;">&#9654;&ensp; <strong>Job alerts</strong> &mdash; hand-picked roles across the industries you selected</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 0 0 0;">
              <h3 style="margin:0 0 16px 0;font-size:13px;color:#1a1a1a;text-transform:uppercase;letter-spacing:2px;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;font-weight:600;">
                What you won't get
              </h3>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="padding:6px 0;font-size:14px;color:#666;line-height:1.6;">&#10005;&ensp; Founder worship or hustle porn</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;line-height:1.6;">&#10005;&ensp; Vague trend talk or buzzword bingo</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;line-height:1.6;">&#10005;&ensp; Day-to-day politics or broad macro commentary</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;line-height:1.6;">&#10005;&ensp; A dull recruitment platform or earnest corporate speak</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#666;line-height:1.6;">&#10005;&ensp; Spam. We email when there's something worth reading.</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 0;">
              <a href="https://howdoyoudo.group"
                 style="display:inline-block;background-color:#00e600;color:#ffffff;text-decoration:none;padding:14px 32px;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                Explore the site
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0 0;border-top:1px solid #e0e0e0;">
              <p style="margin:0;font-size:13px;color:#999;line-height:1.6;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                You're receiving this because you joined the How Do You Do community.
              </p>
              <p style="margin:8px 0 0 0;font-size:13px;color:#999;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                <a href="https://howdoyoudo.group" style="color:#00e600;text-decoration:none;">howdoyoudo.group</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeText(name: string): string {
  const rawFirst = name.split(" ")[0];
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  return `Welcome, ${firstName}. You're in the community.

WHAT YOU'VE SIGNED UP FOR
We live inside markets we barely understand. How Do You Do dives into the mechanics behind the culture - unpacking the business models, hustle, risks, and creativity behind the industries that define modern life.

WHAT YOU'LL GET FROM US
• New episodes - deep-dive conversations with people who actually run these industries
• Industry news - curated breaking news from the sectors you care about
• Career maps - real roles, real companies, real paths into each industry
• Job alerts - hand-picked roles across the industries you selected

WHAT YOU WON'T GET
✗ Founder worship or hustle porn
✗ Vague trend talk or buzzword bingo
✗ Day-to-day politics or broad macro commentary
✗ A dull recruitment platform or earnest corporate speak
✗ Spam. We email when there's something worth reading.

Explore the site: https://howdoyoudo.group

-
howdoyoudo.group`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const firstName = name.split(" ")[0];
    const messageId = crypto.randomUUID();
    const runId = crypto.randomUUID();

    const payload = {
      run_id: runId,
      message_id: messageId,
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      sender_domain: SENDER_DOMAIN,
      subject: `Welcome, ${firstName}.`,
      html: buildWelcomeHtml(name),
      text: buildWelcomeText(name),
      purpose: "transactional",
      label: "welcome",
      queued_at: new Date().toISOString(),
    };

    const { sendViaResend } = await import("../_shared/send-via-resend.ts");
    const { id, error } = await sendViaResend(payload);

    if (error) {
      console.error("Failed to send welcome email via Resend:", error);
      return new Response(
        JSON.stringify({ error: `Failed to send: ${error}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Welcome email sent to ${email}, resend_id: ${id}`);

    return new Response(
      JSON.stringify({ success: true, sent: true, id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Welcome email error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
