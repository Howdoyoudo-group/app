import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const GATEWAY_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`;
// Twilio WhatsApp Sandbox sender (works while user is in sandbox mode).
// Override via WHATSAPP_FROM env once a registered WABA sender is approved.
const DEFAULT_FROM = "whatsapp:+14155238886";

function normaliseE164(input: string): string | null {
  const cleaned = input.replace(/[^\d+]/g, "");
  if (!cleaned) return null;
  if (cleaned.startsWith("+")) return cleaned;
  // Default to UK if no country code provided
  if (cleaned.startsWith("0")) return "+44" + cleaned.slice(1);
  if (cleaned.startsWith("44")) return "+" + cleaned;
  return "+" + cleaned;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WHATSAPP_FROM = Deno.env.get("WHATSAPP_FROM") ?? DEFAULT_FROM;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: "WhatsApp service not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Premium gate
    const { data: roles } = await userClient.from("user_roles").select("role").eq("user_id", user.id);
    const isPremium = (roles ?? []).some((r: any) => r.role === "premium" || r.role === "admin");
    if (!isPremium) {
      return new Response(JSON.stringify({
        error: "WhatsApp delivery is a premium feature.",
        code: "premium_required",
      }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const phone = normaliseE164(String(body?.phone ?? ""));
    if (!phone || phone.length < 8 || phone.length > 16) {
      return new Response(JSON.stringify({ error: "Enter a valid mobile number in international format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Rate limit: max 5 verification sends per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("whatsapp_verifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);
    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: "Too many attempts. Try again in an hour." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("whatsapp_verifications").insert({
      user_id: user.id,
      phone_e164: phone,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    // Send WhatsApp message via Twilio gateway
    const msgBody = `Howdy! Your verification code is ${code}. It expires in 10 minutes. Reply STOP at any time to unsubscribe.`;
    const twilioRes = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: WHATSAPP_FROM,
        To: `whatsapp:${phone}`,
        Body: msgBody,
      }),
    });
    const twilioData = await twilioRes.json().catch(() => ({}));

    await admin.from("whatsapp_send_log").insert({
      user_id: user.id,
      phone_e164: phone,
      template_name: "verification_code",
      status: twilioRes.ok ? "sent" : "failed",
      twilio_message_sid: twilioData?.sid ?? null,
      error_message: twilioRes.ok ? null : JSON.stringify(twilioData).slice(0, 500),
      payload: { code_length: 6 },
    });

    if (!twilioRes.ok) {
      console.error("Twilio send failed", twilioRes.status, twilioData);
      const errMsg = twilioData?.message ?? "Could not send WhatsApp message";
      // Sandbox-specific helpful hint
      if (String(twilioData?.code) === "63007" || String(errMsg).includes("Channel")) {
        return new Response(JSON.stringify({
          error: "Join the Twilio WhatsApp sandbox first by sending the join code to +1 415 523 8886, then try again.",
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, phone }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("whatsapp-send-verification error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
