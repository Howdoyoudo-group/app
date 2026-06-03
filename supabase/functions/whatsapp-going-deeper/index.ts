import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const GATEWAY_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`;
const DEFAULT_FROM = "whatsapp:+14155238886";
const SITE_URL = "https://howdoyoudo.group";

function formatIndustryName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

// Strip markdown links [text](Ax) -> text
function stripCitations(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[[AN]\d+(?:,\s*[AN]\d+)*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function chunk(text: string, max = 1500): string[] {
  if (text.length <= max) return [text];
  const out: string[] = [];
  let remaining = text;
  while (remaining.length > max) {
    let cut = remaining.lastIndexOf(" ", max);
    if (cut < max * 0.5) cut = max;
    out.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) out.push(remaining);
  return out;
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
    body: new URLSearchParams({ From: opts.from, To: `whatsapp:${opts.to}`, Body: opts.body }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WHATSAPP_FROM = Deno.env.get("WHATSAPP_FROM") ?? DEFAULT_FROM;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: "WhatsApp not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const body = await req.json().catch(() => ({}));
    const industry: string = (body.industry || "").toLowerCase().trim();
    // date: 'today' | 'yesterday' | 'YYYY-MM-DD'
    let date: string = body.date || "today";
    const userId: string | undefined = body.user_id;
    const phoneOverride: string | undefined = body.phone;

    if (!industry) {
      return new Response(JSON.stringify({ error: "industry required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (date === "today") date = new Date().toISOString().slice(0, 10);
    else if (date === "yesterday") {
      const d = new Date(); d.setUTCDate(d.getUTCDate() - 1);
      date = d.toISOString().slice(0, 10);
    }

    // Find recipient
    let phone = phoneOverride;
    let name = "there";
    if (!phone) {
      let q = admin.from("profiles")
        .select("id, full_name, whatsapp_number")
        .not("whatsapp_number", "is", null)
        .not("whatsapp_verified_at", "is", null)
        .limit(1);
      if (userId) q = q.eq("id", userId);
      const { data: rows } = await q;
      const row = rows?.[0];
      if (!row) {
        return new Response(JSON.stringify({ error: "no verified WhatsApp user found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      phone = row.whatsapp_number as string;
      name = ((row.full_name as string) || "there").split(" ")[0];
    }

    // Pull briefing
    const { data: briefing } = await admin
      .from("daily_briefings")
      .select("main_news, people, takeaway, briefing_date")
      .eq("industry", industry)
      .eq("briefing_date", date)
      .maybeSingle();

    if (!briefing) {
      return new Response(JSON.stringify({ error: `no briefing for ${industry} on ${date}` }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const indName = formatIndustryName(industry);
    const dateLabel = new Date(date + "T00:00:00Z").toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long",
    });

    const main = stripCitations(briefing.main_news || "");
    const people = stripCitations(briefing.people || "");
    const takeaway = stripCitations(briefing.takeaway || "");

    const header = `Howdy ${name} 👋\n\n📰 *Going Deeper — ${indName}*\n${dateLabel}\n`;
    const sections = [
      main ? `*Main news*\n${main}` : "",
      people && !/no major moves/i.test(people) ? `\n*People*\n${people}` : "",
      takeaway ? `\n*The takeaway*\n${takeaway}` : "",
    ].filter(Boolean).join("\n");
    const footer = `\n\nRead the full briefing 👉 ${SITE_URL}/${industry}\n— Howdy, from How do you do?`;

    const full = `${header}\n${sections}${footer}`;
    const parts = chunk(full, 1500);

    const results: any[] = [];
    for (let i = 0; i < parts.length; i++) {
      const piece = parts.length > 1 ? `${parts[i]}\n\n(${i + 1}/${parts.length})` : parts[i];
      const res = await sendWhatsApp({
        to: phone, body: piece, from: WHATSAPP_FROM,
        accountSid: TWILIO_ACCOUNT_SID, authToken: TWILIO_AUTH_TOKEN,
      });
      const data = await res.json().catch(() => ({}));
      results.push({ ok: res.ok, sid: data?.sid, error: res.ok ? null : data });
      await admin.from("whatsapp_send_log").insert({
        user_id: userId ?? null, phone_e164: phone,
        template_name: "going_deeper",
        status: res.ok ? "sent" : "failed",
        twilio_message_sid: data?.sid ?? null,
        error_message: res.ok ? null : JSON.stringify(data).slice(0, 500),
        payload: { industry, date, part: i + 1, of: parts.length },
      });
      await new Promise((r) => setTimeout(r, 300));
    }

    return new Response(JSON.stringify({ sent: results.filter(r => r.ok).length, parts: results, date, industry }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
