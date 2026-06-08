import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "notify.howdoyoudo.group";
const FROM_EMAIL = `hello@${SENDER_DOMAIN}`;
const FROM_NAME = "How Do You Do";

const STORAGE_BASE = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/email-assets";
const SITE_URL = "https://www.howdoyoudo.co.uk";

function buildEmailHtml(name: string, jobCount: number): string {
  const rawFirst = name.split(" ")[0] || "there";
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  return `<!DOCTYPE html>
<html lang="en">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:'Trebuchet MS',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:32px 16px 40px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:2px solid #1a1a1a;">

<!-- Header — speech bubble logo -->
<tr><td style="background:#ffffff;padding:28px 32px 8px 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="border:3px solid #0a0a0a;border-radius:20px;background:#ffffff;display:inline-table;">
    <tr><td style="padding:18px 28px 16px;">
      <p style="margin:0;font-family:'Dela Gothic One',Impact,'Arial Black',sans-serif;font-size:38px;font-weight:400;color:#0a0a0a;line-height:0.92;letter-spacing:-1px;">How do</p>
      <p style="margin:0;font-family:'Dela Gothic One',Impact,'Arial Black',sans-serif;font-size:38px;font-weight:400;color:#0a0a0a;line-height:0.92;letter-spacing:-1px;">you do<span style="color:#00e600;">?</span></p>
    </td></tr>
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-left:140px;">
    <tr><td width="0" height="0" style="width:0;height:0;border-left:14px solid transparent;border-right:0px solid transparent;border-top:18px solid #0a0a0a;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>
</td></tr>

<!-- Greeting -->
<tr><td style="padding:35px 40px 20px;">
  <p style="font-size:20px;color:#111111;margin:0 0 15px;font-weight:bold;font-family:Arial Black,Impact,Arial,sans-serif;">
    How do you do, ${firstName}<span style="color:#00e600;">?</span>
  </p>
  <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 10px;">
    You've been invited to our <strong>beta trial</strong>. We're building something new and we'd love your feedback. Create a free account to get full access - it takes 30 seconds.
  </p>
</td></tr>

<!-- Feature 1: Understand Me -->
<tr><td style="padding:0 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #000000;">
    <tr>
      <td style="width:70px;padding:20px;vertical-align:top;text-align:center;">
        <img src="${STORAGE_BASE}/tab-who.png" width="48" height="48" alt="Understand Me" style="display:block;margin:0 auto;" />
      </td>
      <td style="padding:20px 20px 20px 0;vertical-align:top;">
        <p style="margin:0 0 6px;font-family:Arial Black,Impact,Arial,sans-serif;font-size:15px;color:#000000;text-transform:uppercase;letter-spacing:0.5px;">
          Understand Me
        </p>
        <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">
          Our AI career profiler analyses your experience and matches you to the roles and industries where you'd thrive. Like a career coach in your pocket.
        </p>
      </td>
    </tr>
  </table>
</td></tr>

<!-- Feature 2: Job Marketplace -->
<tr><td style="padding:0 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #000000;">
    <tr>
      <td style="width:70px;padding:20px;vertical-align:top;text-align:center;">
        <img src="${STORAGE_BASE}/tab-apply.png" width="48" height="48" alt="Jobs" style="display:block;margin:0 auto;" />
      </td>
      <td style="padding:20px 20px 20px 0;vertical-align:top;">
        <p style="margin:0 0 6px;font-family:Arial Black,Impact,Arial,sans-serif;font-size:15px;color:#000000;text-transform:uppercase;letter-spacing:0.5px;">
          ${jobCount.toLocaleString()}+ Live Jobs
        </p>
        <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">
          Browse thousands of UK roles across every industry we cover. Filter by sector, search by role, and apply directly.
        </p>
      </td>
    </tr>
  </table>
</td></tr>

<!-- Feature 3: Search by Role -->
<tr><td style="padding:0 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #000000;">
    <tr>
      <td style="width:70px;padding:20px;vertical-align:top;text-align:center;">
        <img src="${STORAGE_BASE}/role-marketing.png" width="48" height="48" alt="Roles" style="display:block;margin:0 auto;" />
      </td>
      <td style="padding:20px 20px 20px 0;vertical-align:top;">
        <p style="margin:0 0 6px;font-family:Arial Black,Impact,Arial,sans-serif;font-size:15px;color:#000000;text-transform:uppercase;letter-spacing:0.5px;">
          Explore by Role
        </p>
        <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">
          From Marketing to Strategy, Finance to Operations - deep-dive into 20+ career functions with real company profiles, courses, and job listings.
        </p>
      </td>
    </tr>
  </table>
</td></tr>

<!-- Feature 4: Learning Hub -->
<tr><td style="padding:0 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #000000;">
    <tr>
      <td style="width:70px;padding:20px;vertical-align:top;text-align:center;">
        <img src="${STORAGE_BASE}/tab-learn.png" width="48" height="48" alt="Learn" style="display:block;margin:0 auto;" />
      </td>
      <td style="padding:20px 20px 20px 0;vertical-align:top;">
        <p style="margin:0 0 6px;font-family:Arial Black,Impact,Arial,sans-serif;font-size:15px;color:#000000;text-transform:uppercase;letter-spacing:0.5px;">
          Learning Hub
        </p>
        <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">
          Curated UK courses, apprenticeships, mentoring, and professional development resources - all in one place.
        </p>
      </td>
    </tr>
  </table>
</td></tr>

<!-- Feature 5: Industries -->
<tr><td style="padding:0 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #000000;">
    <tr>
      <td style="width:70px;padding:20px;vertical-align:top;text-align:center;">
        <img src="${STORAGE_BASE}/tab-read.png" width="48" height="48" alt="Industries" style="display:block;margin:0 auto;" />
      </td>
      <td style="padding:20px 20px 20px 0;vertical-align:top;">
        <p style="margin:0 0 6px;font-family:Arial Black,Impact,Arial,sans-serif;font-size:15px;color:#000000;text-transform:uppercase;letter-spacing:0.5px;">
          17 Industries Live
        </p>
        <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">
          Coffee, Cinema, Fashion, Football, Music, Grocery, Hospitality, Beer, Footwear, Teaching, Charity, Estate Agency, Bakery, Interior Design, Physiotherapy, Psychotherapy & Wellness.
        </p>
      </td>
    </tr>
  </table>
</td></tr>

<!-- Feature 6: Daily Digest -->
<tr><td style="padding:0 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #000000;">
    <tr>
      <td style="width:70px;padding:20px;vertical-align:top;text-align:center;">
        <img src="${STORAGE_BASE}/tab-listen.png" width="48" height="48" alt="Digest" style="display:block;margin:0 auto;" />
      </td>
      <td style="padding:20px 20px 20px 0;vertical-align:top;">
        <p style="margin:0 0 6px;font-family:Arial Black,Impact,Arial,sans-serif;font-size:15px;color:#000000;text-transform:uppercase;letter-spacing:0.5px;">
          Personalised Daily Digest
        </p>
        <p style="margin:0;font-size:14px;color:#555555;line-height:1.5;">
          Get the latest news, articles, and jobs from the industries you care about - delivered to your inbox every weekday morning.
        </p>
      </td>
    </tr>
  </table>
</td></tr>

<!-- CTA Button -->
<tr><td align="center" style="padding:15px 40px 35px;">
  <a href="${SITE_URL}/auth?ref=email"
     style="display:inline-block;background-color:#00e600;color:#000000;font-family:Arial Black,Impact,Arial,sans-serif;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;padding:16px 45px;text-decoration:none;border:2px solid #000000;">
    Join the Beta →
  </a>
  <p style="margin:15px 0 0;font-size:13px;color:#777777;">
    It takes 30 seconds. Once you create your account, you'll always be able to sign in - no beta password needed.
  </p>
</td></tr>

<!-- Sign off -->
<tr><td style="padding:0 40px 30px;">
  <p style="font-size:15px;color:#333333;line-height:1.6;margin:0 0 5px;">
    See you on the other side,
  </p>
  <p style="font-size:15px;color:#111111;font-weight:bold;margin:0;font-family:Arial Black,Impact,Arial,sans-serif;">
    The How Do You Do Team
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 40px;background-color:#000000;text-align:center;">
  <p style="font-size:11px;color:#666666;margin:0;">
    You're receiving this because you signed up at howdoyoudo.group
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildPlainText(name: string, jobCount: number): string {
  const rawFirst = name.split(" ")[0] || "there";
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  return `How do you do, ${firstName}?

You've been invited to our beta trial. We're building something new and we'd love your feedback. Create a free account to get full access - it takes 30 seconds.

WHAT'S INSIDE:

UNDERSTAND ME - AI career profiler that matches you to roles and industries where you'd thrive.

${jobCount.toLocaleString()}+ LIVE JOBS - Browse thousands of UK roles. Filter by sector, search by role, apply directly.

EXPLORE BY ROLE - Deep-dive into 20+ career functions with real company profiles, courses, and job listings.

LEARNING HUB - Curated UK courses, apprenticeships, mentoring, and professional development resources.

17 INDUSTRIES LIVE - Coffee, Cinema, Fashion, Football, Music, Grocery, Hospitality, Beer, Footwear, Teaching, Charity, Estate Agency, Bakery, Interior Design, Physiotherapy, Psychotherapy & Wellness.

PERSONALISED DAILY DIGEST - Latest news, articles, and jobs from the industries you care about, every weekday morning.

Join the beta: ${SITE_URL}/auth?ref=email
It takes 30 seconds. Once you create your account, you'll always be able to sign in.

See you on the other side,
The How Do You Do Team`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const testEmail = body.test_email || body.testEmail;

    // Get live job count
    const { count } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());

    const jobCount = count || 5400;

    // Fetch all subscribers
    const { data: subscribers, error } = await supabase
      .from("subscribers")
      .select("name, email");

    if (error) throw error;

    const targets = testEmail
      ? subscribers.filter((s: any) => s.email === testEmail)
      : subscribers;

    const results: { email: string; status: string }[] = [];

    for (const sub of targets) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [sub.email],
            subject: "You're invited to our beta trial 🎯",
            html: buildEmailHtml(sub.name, jobCount),
            text: buildPlainText(sub.name, jobCount),
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          results.push({ email: sub.email, status: `error: ${errText}` });
        } else {
          results.push({ email: sub.email, status: "sent" });
        }

        await new Promise((r) => setTimeout(r, 300));
      } catch (e) {
        results.push({ email: sub.email, status: `error: ${e.message}` });
      }
    }

    return new Response(JSON.stringify({ sent: results.length, jobCount, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
