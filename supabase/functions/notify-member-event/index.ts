import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENDER_DOMAIN = "notify.howdoyoudo.group";
const FROM_EMAIL = `hello@${SENDER_DOMAIN}`;
const FROM_NAME = "How Do You Do";
const APP_URL = "https://howdoyoudo.group/my-jobs";

type EventType = "connection_request" | "new_message" | "mentor_request";

function htmlShell(title: string, bodyHtml: string, ctaLabel: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;"><tr><td align="center" style="padding:32px 16px 40px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:2px solid #1a1a1a;">
      <tr><td style="background:#1a1a1a;padding:24px 32px;">
        <p style="margin:0;font-family:'Dela Gothic One',Impact,'Arial Black',sans-serif;font-size:28px;font-weight:400;color:#ffffff;letter-spacing:-0.5px;line-height:1;">howdoyoudo<span style="color:#00e600;">?</span></p>
      </td></tr>
      <tr><td style="padding:32px 32px 16px;"><h2 style="margin:0;font-size:20px;font-weight:800;">${title}</h2></td></tr>
      <tr><td style="padding:0 32px 24px;font-size:15px;line-height:1.55;color:#333;">${bodyHtml}</td></tr>
      <tr><td style="padding:8px 32px 32px;">
        <a href="${APP_URL}" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-weight:700;text-decoration:none;padding:14px 24px;font-size:13px;letter-spacing:1px;text-transform:uppercase;">${ctaLabel}</a>
      </td></tr>
      <tr><td style="padding:20px 32px;background:#1a1a1a;border-top:3px solid #00e600;">
        <p style="margin:0 0 4px 0;font-family:'Dela Gothic One',Impact,'Arial Black',sans-serif;font-size:18px;color:#ffffff;">howdoyoudo<span style="color:#00e600;">?</span></p>
        <p style="margin:0;font-size:12px;color:#999;">You're receiving this because you're a Howdoyoudo member. <a href="https://www.howdoyoudo.co.uk" style="color:#00e600;text-decoration:none;">www.howdoyoudo.co.uk</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { event, recipient_id, actor_id, message } = await req.json() as {
      event: EventType; recipient_id: string; actor_id: string; message?: string;
    };

    if (!event || !recipient_id || !actor_id) {
      return new Response(JSON.stringify({ error: "missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: recipientUser } = await supabase.auth.admin.getUserById(recipient_id);
    const toEmail = recipientUser?.user?.email;
    if (!toEmail) {
      return new Response(JSON.stringify({ error: "no recipient email" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: actorProfile } = await supabase.from("profiles").select("full_name").eq("id", actor_id).maybeSingle();
    const actorName = actorProfile?.full_name?.trim() || "A member";

    let subject = "";
    let title = "";
    let body = "";
    let cta = "Open Inbox";

    if (event === "connection_request") {
      subject = `${actorName} wants to connect on How Do You Do`;
      title = "New connection request";
      body = `<strong>${escapeHtml(actorName)}</strong> just sent you a connection request.`
        + (message ? `<br/><br/><em>"${escapeHtml(message)}"</em>` : "")
        + `<br/><br/>Accept it from your Members tab to start chatting.`;
      cta = "View request";
    } else if (event === "new_message") {
      subject = `New message from ${actorName}`;
      title = "You've got a new message";
      body = `<strong>${escapeHtml(actorName)}</strong> sent you a message.`
        + (message ? `<br/><br/><em>"${escapeHtml(message.slice(0, 240))}${message.length > 240 ? "…" : ""}"</em>` : "");
      cta = "Read message";
    } else if (event === "mentor_request") {
      subject = `${actorName} would love 30 mins with you`;
      title = "New mentoring request";
      body = `<strong>${escapeHtml(actorName)}</strong> has asked for a 30-minute mentoring chat.`
        + (message ? `<br/><br/><em>"${escapeHtml(message.slice(0, 320))}${message.length > 320 ? "…" : ""}"</em>` : "")
        + `<br/><br/>Open your Members tab to accept or decline.`;
      cta = "View request";
    } else {
      return new Response(JSON.stringify({ error: "unknown event" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const html = htmlShell(title, body, cta);
    const { sendViaResend } = await import("../_shared/send-via-resend.ts");
    const { error: sendErr } = await sendViaResend({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toEmail,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text: `${title}\n\n${actorName} ${event === "connection_request" ? "wants to connect" : "sent you a message"} on How Do You Do. Open ${APP_URL}`,
      purpose: "transactional",
      label: `member-${event}`,
      queued_at: new Date().toISOString(),
    } as any);

    if (sendErr) {
      console.error("Send failed:", sendErr);
      return new Response(JSON.stringify({ error: sendErr }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("notify-member-event error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
