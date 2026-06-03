import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENDER_DOMAIN = "notify.howdoyoudo.group";
const FROM_EMAIL = `hello@${SENDER_DOMAIN}`;
const FROM_NAME = "How Do You Do";
const NOTIFY_TO = "AndrewHarrison@howdoyoudo.group";

function buildHtml(data: Record<string, string>): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New Employer Enquiry</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:0 0 24px;border-bottom:2px solid #1a1a1a;">
          <h1 style="margin:0;font-size:22px;font-weight:800;color:#1a1a1a;">howdoyoudo<span style="color:#00e600;">?</span></h1>
        </td></tr>
        <tr><td style="padding:32px 0 16px;">
          <h2 style="margin:0;font-size:20px;font-weight:800;color:#1a1a1a;">New Employer Enquiry</h2>
        </td></tr>
        <tr><td style="padding:0 0 24px;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="padding:8px 0;font-size:14px;color:#333;"><strong>Contact:</strong> ${data.contact_name}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#333;"><strong>Company:</strong> ${data.company_name}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#333;"><strong>Email:</strong> ${data.email}</td></tr>
            ${data.phone ? `<tr><td style="padding:8px 0;font-size:14px;color:#333;"><strong>Phone:</strong> ${data.phone}</td></tr>` : ""}
            <tr><td style="padding:8px 0;font-size:14px;color:#333;"><strong>Package:</strong> ${data.package_interest}</td></tr>
            ${data.industry ? `<tr><td style="padding:8px 0;font-size:14px;color:#333;"><strong>Industry:</strong> ${data.industry}</td></tr>` : ""}
            ${data.message ? `<tr><td style="padding:16px 0 8px;font-size:14px;color:#333;"><strong>Message:</strong><br/>${data.message}</td></tr>` : ""}
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const messageId = crypto.randomUUID();
    const runId = crypto.randomUUID();

    const payload = {
      run_id: runId,
      message_id: messageId,
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: NOTIFY_TO,
      sender_domain: SENDER_DOMAIN,
      subject: `Employer Enquiry: ${data.company_name}`,
      html: buildHtml(data),
      text: `New employer enquiry from ${data.contact_name} at ${data.company_name} (${data.email}). Package: ${data.package_interest}.`,
      purpose: "transactional",
      label: "employer-enquiry-notification",
      queued_at: new Date().toISOString(),
    };

    const { sendViaResend } = await import("../_shared/send-via-resend.ts");
    const { error: sendErr } = await sendViaResend({ ...payload, reply_to: data.email });
    if (sendErr) {
      console.error("Failed to send notification via Resend:", sendErr);
      return new Response(JSON.stringify({ error: sendErr }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Employer enquiry notification enqueued for ${NOTIFY_TO}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Notification error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
