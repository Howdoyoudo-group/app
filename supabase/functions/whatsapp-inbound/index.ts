// Twilio WhatsApp inbound webhook → Howdy reply
// Twilio posts application/x-www-form-urlencoded. We respond with TwiML.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { renderSiteMapForWhatsApp, renderSiteSearchResults, buildRoutingDirectiveWhatsApp } from "../_shared/site-map.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const GATEWAY_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`;
const DEFAULT_FROM = "whatsapp:+14155238886";

const SYSTEM_PROMPT = `You are "Howdy", a friendly UK careers assistant on WhatsApp.

Tone: warm, British, like a knowledgeable older sibling. Concise — WhatsApp messages should be SHORT (under 600 chars when possible). Use plain text, no markdown headings. Bullet with "• ". You may include up to 2 links as full https URLs.

The user is texting you on WhatsApp. They're a member of the Howdy platform (https://howdoyoudo.group) — a UK site that unpacks industries young professionals love.

${renderSiteMapForWhatsApp()}

Rules:
• Never invent companies, pages, or features that don't exist on the site.
• Treat live site-search matches for the current message as higher priority than general knowledge.
• If you don't know, say so.
• Only recommend pages from the site map above.

IMPORTANT: Whenever you include a link, append this tip on a new line at the end of the message (only once per message, only if a link is present):
"💡 Tip: long-press the link → Open in Safari/Chrome to stay signed in."

Never start a message with "All right", "Alright", "Right then", "Okay", "OK", or similar filler openers. Get straight to the point.`;


function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function twiml(message: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
  return new Response(xml, { headers: { "Content-Type": "text/xml" } });
}

function isSideHustleQuery(message: string): boolean {
  return /\b(side\s*hustl|side\s*income|extra\s*(cash|money|income)|make\s*money\s*on\s*the\s*side|part[-\s]*time\s*income|supplement\s*(my\s*)?income)\b/i.test(message);
}

function sideHustleWhatsAppAnswer(): string {
  return "Start here: https://howdoyoudo.group/side-hustles — that’s Howdy’s dedicated UK side-income section, with freelancing, selling online, content, tutoring, delivery, pet care and practical tax/registration help.\n\n💡 Tip: long-press the link → Open in Safari/Chrome to stay signed in.";
}

async function sendWhatsApp(opts: {
  to: string; body: string; from: string; accountSid: string; authToken: string;
}) {
  return fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${opts.accountSid}:${opts.authToken}`)}`,
      
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: opts.from, To: opts.to.startsWith("whatsapp:") ? opts.to : `whatsapp:${opts.to}`, Body: opts.body }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WHATSAPP_FROM = Deno.env.get("WHATSAPP_FROM") ?? DEFAULT_FROM;

    if (!TWILIO_ACCOUNT_SID) {
      return twiml("Howdy is offline right now. Please try again shortly.");
    }

    const form = await req.formData();
    const fromRaw = String(form.get("From") ?? ""); // e.g. "whatsapp:+447..."
    const bodyText = String(form.get("Body") ?? "").trim();
    const phoneE164 = fromRaw.replace(/^whatsapp:/i, "").trim();

    if (!phoneE164 || !bodyText) {
      return twiml("Hi! Send me a question and I'll help.");
    }

    // Handle STOP / START locally
    const lower = bodyText.toLowerCase();
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    if (/^(stop|stopall|unsubscribe|cancel|end|quit)$/i.test(lower)) {
      await admin.from("profiles").update({ whatsapp_opt_in: false }).eq("whatsapp_number", phoneE164);
      return twiml("You're opted out. Reply START to resume.");
    }
    if (/^(start|unstop|yes)$/i.test(lower)) {
      await admin.from("profiles").update({ whatsapp_opt_in: true }).eq("whatsapp_number", phoneE164);
      return twiml("You're back in. Ask me anything.");
    }

    // Look up the user by verified WhatsApp number
    const { data: profile } = await admin
      .from("profiles")
      .select("id, full_name, industry_interests, role_preferences, career_level, location_preference, howdy_memory, whatsapp_verified_at")
      .eq("whatsapp_number", phoneE164)
      .maybeSingle();

    if (!profile || !profile.whatsapp_verified_at) {
      return twiml(
        "Hi! I don't recognise this number. Sign in at https://howdoyoudo.group/my-profile and verify your WhatsApp under the WhatsApp Digest card. Then text me again."
      );
    }

    // Premium gating (same as voice / digest)
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", profile.id);
    const isPremium = (roles ?? []).some((r: any) => r.role === "premium" || r.role === "admin");
    if (!isPremium) {
      return twiml("Howdy chat over WhatsApp is a premium feature. Upgrade at https://howdoyoudo.group/my-profile to unlock.");
    }

    // (No hardcoded topic bypass — routing handled below via buildRoutingDirectiveWhatsApp)

    // Build a tight user context block
    const ctxBits: string[] = [];
    const name = (profile.full_name as string)?.split(" ")[0];
    if (name) ctxBits.push(`Name: ${name}`);
    const interests = (profile.industry_interests as string[] | null) ?? [];
    if (interests.length) ctxBits.push(`Industries: ${interests.slice(0, 6).join(", ")}`);
    const roleP = (profile.role_preferences as string[] | null) ?? [];
    if (roleP.length) ctxBits.push(`Roles wanted: ${roleP.slice(0, 6).join(", ")}`);
    if (profile.career_level) ctxBits.push(`Level: ${profile.career_level}`);
    if (profile.location_preference) ctxBits.push(`Location: ${profile.location_preference}`);
    const mem = (profile.howdy_memory as string[] | null) ?? [];
    if (mem.length) ctxBits.push(`Memory: ${mem.slice(-8).join(" | ")}`);

    const siteSearchContext = renderSiteSearchResults(bodyText, 4);
    const routingDirective = buildRoutingDirectiveWhatsApp(bodyText);
    const systemPrompt = SYSTEM_PROMPT
      + `\n\nLive site-search matches for this message:\n${siteSearchContext}`
      + (ctxBits.length ? `\n\nUser context:\n${ctxBits.join("\n")}` : "");

    // Call Lovable AI gateway
    let reply = "";
    try {
      const messages: any[] = [{ role: "system", content: systemPrompt }];
      if (routingDirective) messages.push({ role: "system", content: routingDirective });
      messages.push({ role: "user", content: bodyText });

      const aiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
        }),
      });
      const data = await aiRes.json();
      reply = String(data?.choices?.[0]?.message?.content ?? "").trim();
    } catch (e) {
      console.error("AI call failed", e);
    }

    if (!reply) {
      reply = "Sorry — I couldn't think of an answer just now. Try again in a moment.";
    }

    // WhatsApp message hard cap = 1600 chars
    if (reply.length > 1500) reply = reply.slice(0, 1490) + "…";

    // Log the exchange
    await admin.from("ai_usage_log").insert({
      user_id: profile.id,
      function_name: "whatsapp-inbound",
    });

    // Twilio expects a TwiML reply — but only the FIRST Message is delivered reliably
    // when also using the REST API. We use TwiML and skip a duplicate REST send.
    if (TWILIO_API_KEY) {
      // Use REST so we control From sender explicitly and log delivery
      try {
        const sendRes = await sendWhatsApp({
          to: phoneE164, body: reply, from: WHATSAPP_FROM,
          accountSid: TWILIO_ACCOUNT_SID, authToken: TWILIO_AUTH_TOKEN,
        });
        const sendData = await sendRes.json().catch(() => ({}));
        await admin.from("whatsapp_send_log").insert({
          user_id: profile.id, phone_e164: phoneE164,
          template_name: "howdy_reply",
          status: sendRes.ok ? "sent" : "failed",
          twilio_message_sid: sendData?.sid ?? null,
          error_message: sendRes.ok ? null : JSON.stringify(sendData).slice(0, 500),
          payload: { inbound: bodyText.slice(0, 200) },
        });
        // Ack Twilio with empty TwiML (we already sent via REST)
        return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
          headers: { "Content-Type": "text/xml" },
        });
      } catch (e) {
        console.error("REST send failed, falling back to TwiML", e);
      }
    }

    return twiml(reply);
  } catch (e) {
    console.error("whatsapp-inbound error", e);
    return twiml("Something went wrong on my side. Try again in a minute.");
  }
});
