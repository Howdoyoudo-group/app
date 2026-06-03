import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENDER_DOMAIN = "notify.howdoyoudo.group";
const FROM_EMAIL = `hello@${SENDER_DOMAIN}`;
const FROM_NAME = "How Do You Do";
const SITE_URL = "https://howdoyoudo.group";

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function buildHtml(firstName: string, downloadUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your How Do You Do profile</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding:0 0 24px 0;border-bottom:2px solid #1a1a1a;">
    <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">howdoyoudo<span style="color:#00e600;">?</span></h1>
  </td></tr>
  <tr><td style="padding:32px 0 12px 0;">
    <h2 style="margin:0 0 12px 0;font-size:24px;font-weight:800;">Hey ${escape(firstName)} - here's your profile.</h2>
    <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#333;">A PDF copy of your How Do You Do profile is ready to download. Share it with employers, save it for yourself, or just keep a backup.</p>
    <p style="margin:0 0 32px 0;">
      <a href="${escape(downloadUrl)}" style="display:inline-block;background:#00e600;color:#1a1a1a;font-weight:800;text-decoration:none;padding:14px 24px;border:2px solid #1a1a1a;border-radius:999px;font-size:14px;letter-spacing:0.5px;">Download your profile (PDF)</a>
    </p>
    <p style="margin:0 0 8px 0;font-size:12px;color:#777;">This download link is private to you and expires in 7 days. You can always re-generate it from your profile builder.</p>
  </td></tr>
  <tr><td style="padding:32px 0;border-top:1px solid #eee;font-size:12px;color:#999;">
    Sent by <a href="${SITE_URL}" style="color:#00e600;text-decoration:none;">How Do You Do</a> - unpacking the industries we love and live in.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
    if (userErr || !user || !user.email) {
      return new Response(JSON.stringify({ error: "Unauthorised" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const pdfBase64: string | undefined = body?.pdfBase64;
    const fullName: string | null = body?.fullName ?? null;
    if (!pdfBase64 || typeof pdfBase64 !== "string" || pdfBase64.length < 100) {
      return new Response(JSON.stringify({ error: "Invalid pdfBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (pdfBase64.length > 8_000_000) {
      return new Response(JSON.stringify({ error: "PDF too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const bytes = base64ToBytes(pdfBase64);
    const path = `${user.id}/profile-${Date.now()}.pdf`;
    const { error: upErr } = await supabase.storage
      .from("cv-uploads")
      .upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (upErr) {
      console.error("Upload failed:", upErr);
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from("cv-uploads")
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
    if (signErr || !signed?.signedUrl) {
      console.error("Sign URL failed:", signErr);
      return new Response(JSON.stringify({ error: "Could not create download link" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstNameRaw = (fullName || "there").split(" ")[0];
    const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1).toLowerCase();
    const messageId = crypto.randomUUID();
    const runId = crypto.randomUUID();

    const payload = {
      run_id: runId,
      message_id: messageId,
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: user.email,
      sender_domain: SENDER_DOMAIN,
      subject: `${firstName}, here's your How Do You Do profile.`,
      html: buildHtml(firstName, signed.signedUrl),
      text: `Hey ${firstName} - your How Do You Do profile PDF is ready: ${signed.signedUrl}\n\n(Link expires in 7 days.)`,
      purpose: "transactional",
      label: "profile-pdf",
      queued_at: new Date().toISOString(),
    };

    const { sendViaResend } = await import("../_shared/send-via-resend.ts");
    const { error: sendErr } = await sendViaResend(payload);
    if (sendErr) {
      console.error("Resend send failed:", sendErr);
      return new Response(JSON.stringify({ error: `Send failed: ${sendErr}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, sent: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-profile-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
