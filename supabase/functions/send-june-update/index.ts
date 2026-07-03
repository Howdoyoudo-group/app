// June 2026 founding-community broadcast.
// Usage:
//   { preview_email: "you@example.com" }          -> sends only to that address
//   { send_all: true, batch_size?: 20, delay_ms?: 1500 } -> sends to every subscriber
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendViaResend } from "../_shared/send-via-resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "notify.howdoyoudo.group";
const FROM_EMAIL = `hello@${SENDER_DOMAIN}`;
const FROM_NAME = "Howdoyoudo";
const REPLY_TO = "hello@howdoyoudo.co.uk";
const SITE = "https://www.howdoyoudo.co.uk";
const ASSETS_BASE = "https://wgistckxxbfpsuulbswr.supabase.co/storage/v1/object/public/email-assets";
const OLD_ASSETS = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/email-assets";
const WORDMARK = `${OLD_ASSETS}/howdoyoudo-wordmark.png`;
const HOWDY_AVATAR = `${OLD_ASSETS}/howdy-character.png`;
const HOWDY_LINK = `${SITE}/howdy`;
const MARKETPLACE = `${SITE}/marketplace`;
const MATCH_ME = `${SITE}/match-me`;
const VIDEOS = `${SITE}/videos`;
const SKILLS_PASSPORT = `${SITE}/skills-passport`;
const CV_BUILDER = `${SITE}/cv-builder`;
const COMMUNITY = `${SITE}/community`;

function buildHtml(firstName: string, unsubscribeUrl: string, liveJobs: number): string {
  const hi = firstName ? `Howdy ${firstName} 👋` : "Howdy 👋";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>What's new at Howdoyoudo - June 2026</title>
<style>
  body { margin:0; padding:0; background:#ffffff; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#0a0a0a; }
  .wrap { max-width:600px; margin:0 auto; padding:32px 24px 48px; }
  h1, h2 { font-family: 'Dela Gothic One', Georgia, serif; font-weight:400; line-height:1.1; margin:0 0 10px; letter-spacing:-0.02em; }
  h1 { font-size:34px; }
  h2 { font-size:20px; }
  p { font-size:15px; line-height:1.6; margin:0 0 12px; color:#1a1a1a; }
  a { color:#0a0a0a; }
  .accent { color:#00b800; }
  .cta { display:inline-block; background:#00E600; color:#0a0a0a; font-family:'Dela Gothic One',Georgia,serif; font-size:13px; font-weight:700; padding:11px 22px; text-decoration:none; border:2px solid #0a0a0a; letter-spacing:0.04em; }
  .section { padding:24px 0; border-top:2px solid #0a0a0a; }
  .section-inner { display:table; width:100%; }
  .doodle-cell { display:table-cell; width:72px; vertical-align:top; padding-right:16px; }
  .content-cell { display:table-cell; vertical-align:top; }
  .bullets { padding-left:0; list-style:none; margin:0 0 10px; }
  .bullets li { padding:5px 0 5px 20px; position:relative; font-size:14px; line-height:1.5; }
  .bullets li:before { content:""; position:absolute; left:0; top:11px; width:10px; height:10px; background:#00E600; border:1.5px solid #0a0a0a; }
  .highlight { background:#00E600; border:2px solid #0a0a0a; padding:20px; margin-bottom:4px; }
  .highlight h2 { color:#0a0a0a; }
  .milburn { background:#f5f5f5; border:2px solid #0a0a0a; border-left:6px solid #00E600; padding:16px 18px; margin:0 0 20px; }
  .chip { display:inline-block; background:#0a0a0a; color:#ffffff; font-family:'Dela Gothic One',Georgia,serif; font-size:11px; padding:5px 10px; margin:3px 3px 3px 0; letter-spacing:0.06em; }
  .label { font-family:'Dela Gothic One',Georgia,serif; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:#555; margin:0 0 6px; }
  .meta { font-size:13px; color:#555; line-height:1.5; }
  .footer { margin-top:32px; padding-top:20px; border-top:2px solid #0a0a0a; text-align:center; }
  .footer a { color:#555; text-decoration:underline; }
  .stamp { display:inline-block; border:3px solid #0a0a0a; padding:10px 16px; font-family:'Dela Gothic One',Georgia,serif; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; transform:rotate(-2deg); color:#0a0a0a; }
</style>
</head>
<body>
<div class="wrap">

  <!-- HEADER -->
  <div style="text-align:center; padding:24px 0 16px; border-bottom:3px solid #0a0a0a; margin-bottom:24px;">
    <img src="${WORDMARK}" alt="Howdoyoudo" width="180" style="max-width:180px;height:auto;" />
    <div style="margin-top:10px;">
      <span style="font-family:'Dela Gothic One',Georgia,serif; font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:#555;">Founding Member Update &nbsp;·&nbsp; June 2026</span>
    </div>
  </div>

  <h1>${hi}</h1>

  <p>June has been another busy month in start-up land and we have lots to share - and there's also a clear reason why we are doing this.</p>

  <div class="milburn">
    <p style="margin:0 0 0 0; font-size:14px;">The Milburn report has been all over the news this month - and it makes for uncomfortable reading for young people trying to find the first rung on the ladder. We believe that inspiring people to genuinely understand the breadth of what's out there - the industries, the roles, the people in them - is one of the most powerful things we can give someone early in their journey. <strong>Never has that felt more urgent.</strong> Thank you for being part of this.</p>
  </div>

  <p style="font-family:'Dela Gothic One',Georgia,serif; font-size:13px; letter-spacing:0.1em; text-transform:uppercase; color:#555; margin-bottom:4px;">Here's what we shipped ↓</p>

  <!-- NEW HOME -->
  <div class="section">
    <div class="highlight">
      <div class="section-inner">
        <div class="doodle-cell">
          <img src="${OLD_ASSETS}/email-icon-estate-agency.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
        </div>
        <div class="content-cell">
          <p class="label" style="color:#0a0a0a; margin-bottom:8px;">★ Big news</p>
          <h2 style="margin-top:0; font-size:24px;">We have a new home.</h2>
          <p style="font-size:16px; font-weight:700; margin:0 0 10px;">www.howdoyoudo.co.uk</p>
          <p style="margin-bottom:16px;">The platform has moved to its permanent address. Your profile, your matches, your saved jobs - all right there. If you bookmarked the old address, update it now.</p>
          <a class="cta" href="${SITE}">Go to howdoyoudo.co.uk →</a>
        </div>
      </div>
    </div>
  </div>

  <!-- NAV -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-cars.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">Navigation</p>
        <h2>A simpler way around the site.</h2>
        <p>Five clear sections now - Show, Discover, Level Up, Jobs, Community. Everything has a home. No hunting around.</p>
        <div>
          <span class="chip">Show</span><span class="chip">Discover</span><span class="chip">Level Up</span><span class="chip">Jobs</span><span class="chip">Community</span>
        </div>
      </div>
    </div>
  </div>

  <!-- THE SHOW -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-journalism.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">The Show</p>
        <h2>Our first episode is recorded.</h2>
        <p>A deep dive into <strong>Journalism</strong> - with the people who actually do it. It launches next month.</p>
        <p>We were also at <strong>SXSW London</strong> this month, talking to people about the industries they love and the careers they stumbled into. Five street interview clips are already live.</p>
        <a class="cta" href="${VIDEOS}">Watch the clips →</a>
      </div>
    </div>
  </div>

  <!-- 30+ INDUSTRIES -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-travel.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">New Industries</p>
        <h2>Over 30 industries - and growing.</h2>
        <p>We added <strong>Building, Fixing</strong> and <strong>Delivery</strong> - three huge UK sectors that don't get enough love. Career maps, real company profiles, daily briefings, live jobs and events. Now over 30 industries covered.</p>
        <div style="margin:10px 0;">
          <span class="chip">Building</span><span class="chip">Fixing</span><span class="chip">Delivery</span>
        </div>
        <a class="cta" href="${SITE}/building">Explore Building →</a>
      </div>
    </div>
  </div>

  <!-- TENNIS -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-footwear.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">New Industry · Wimbledon 2026</p>
        <h2>Tennis is on the platform.</h2>
        <p>With Wimbledon starting 29 June, we've added Tennis as a full industry. Real jobs from the <strong>LTA, AELTC, ATP, WTA and ITF</strong>. Live tournament events, career map, community feed and a downloadable briefing.</p>
        <a class="cta" href="${SITE}/tennis">Explore Tennis →</a>
      </div>
    </div>
  </div>

  <!-- JOBS -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-grocery.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">Jobs Marketplace</p>
        <h2>Over 60,000 curated jobs.</h2>
        <p>Direct connections to <strong>over 400 employer career sites</strong> - straight to source, no middleman. New: save any job and find it in your Saved tab when you're ready to apply.</p>
        <a class="cta" href="${MARKETPLACE}">Browse the marketplace →</a>
      </div>
    </div>
  </div>

  <!-- SKILLS -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-teaching.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">Skills England</p>
        <h2>Skills passport &amp; gap tracker.</h2>
        <p>Official UK government skills frameworks built into your profile. See exactly what any role needs, find your gaps, and track progress in your Career Passport. Badges update your ratings automatically.</p>
        <a class="cta" href="${SKILLS_PASSPORT}">See your passport →</a>
      </div>
    </div>
  </div>

  <!-- MATCH ME -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-psychotherapy.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">Match Me</p>
        <h2>Smarter and more personal.</h2>
        <p>Now uses your RIASEC personality type, passions, dream employers and role preferences. New: <strong>"Where your worlds collide"</strong> - roles at the intersection of the industries you follow.</p>
        <a class="cta" href="${MATCH_ME}">See your matches →</a>
      </div>
    </div>
  </div>

  <!-- CV BUILDER -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-fashion.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">CV Builder</p>
        <h2>Properly redesigned.</h2>
        <p>Two-column A4 PDF, company logos pulled automatically. New: <strong>ATS optimisation</strong> - structured to pass automated screening before a human ever sees it.</p>
        <a class="cta" href="${CV_BUILDER}">Build your CV →</a>
      </div>
    </div>
  </div>

  <!-- ROLE PAGES -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-teaching.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">Role Pages</p>
        <h2>Richer entry routes &amp; salary data.</h2>
        <p>Every role page now has CareerPilot data - the official UK careers database being retired this year. Named apprenticeship routes (L2–L6), T Levels, A Level requirements, real salary ranges and work environment descriptions.</p>
      </div>
    </div>
  </div>

  <!-- SIGN OFF -->
  <div class="section" style="border-top:3px solid #0a0a0a;">
    <p>We want to thank everyone for their support, time and encouragement this month. We are building something important and as always please push us to make this better week by week.</p>
    <p style="font-family:'Dela Gothic One',Georgia,serif; font-size:20px; margin:20px 0 4px;">The Howdoyoudo team<span style="color:#00b800;">?</span></p>
    <p class="meta"><em>Unpacking the industries we love and live in. Built in London.</em></p>
  </div>

  <div class="footer">
    <p style="font-family:'Dela Gothic One',Georgia,serif; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#555; margin-bottom:12px;">Follow us</p>
    <p class="meta" style="margin-bottom:16px;">
      <strong>Instagram</strong> &nbsp;<a href="https://instagram.com/Howdoyoudo_official" style="color:#0a0a0a;">@Howdoyoudo_official</a>
      &nbsp;&nbsp;·&nbsp;&nbsp;
      <strong>TikTok</strong> &nbsp;<a href="https://tiktok.com/@Howdoyoudo_official" style="color:#0a0a0a;">@Howdoyoudo_official</a>
      &nbsp;&nbsp;·&nbsp;&nbsp;
      <strong>YouTube</strong> &nbsp;<a href="https://youtube.com/@HDYD_OFFICIAL" style="color:#0a0a0a;">@HDYD_OFFICIAL</a>
      &nbsp;&nbsp;·&nbsp;&nbsp;
      <strong>X</strong> &nbsp;<a href="https://x.com/HDYD_OFFICIAL" style="color:#0a0a0a;">@HDYD_OFFICIAL</a>
    </p>
    <p class="meta">
      You're getting this because you're a founding member of Howdoyoudo.<br/>
      <a href="${unsubscribeUrl}">Unsubscribe</a> &nbsp;·&nbsp;
      <a href="${SITE}">howdoyoudo.co.uk</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

function buildText(firstName: string, unsubscribeUrl: string, _liveJobs: number): string {
  const hi = firstName ? `Howdy ${firstName}` : "Howdy";
  return `${hi},

June has been another busy month in start-up land and we have lots to share - and there's also a clear reason why we are doing this.

The Milburn report has been all over the news this month - and it makes for uncomfortable reading for young people trying to find the first rung on the ladder. We believe that inspiring people to genuinely understand the breadth of what's out there - the industries, the roles, the people in them - is one of the most powerful things we can give someone early in their journey. Never has that felt more urgent. Thank you for being part of this.

Here's what we shipped in June.

★ NEW HOME - www.howdoyoudo.co.uk
The platform has moved to its permanent address. Everything you had before is right there waiting.
${SITE}

A SIMPLER WAY AROUND THE SITE
New navigation: Show · Discover · Level Up · Jobs · Community. Everything has a home.

OVER 30 INDUSTRIES - AND GROWING
Added Building, Fixing and Delivery this month. Full career maps, company profiles, daily briefings and jobs. Now over 30 industries covered.
${SITE}/building | ${SITE}/fixing | ${SITE}/delivery

THE SHOW - OUR FIRST EPISODE IS RECORDED
We've recorded our first ever Howdoyoudo show - a deep dive into Journalism. It launches next month. We were also at SXSW London talking to people about the industries they love and the careers they stumbled into. Those conversations are coming to the platform soon.
Five street interview clips are already live on the Videos page.
${VIDEOS}

OVER 60,000 CURATED JOBS
Direct connections to over 400 employer career sites - straight to source, no middleman. Save any job and find it in your Saved tab.
${MARKETPLACE}

SKILLS PASSPORT & GAP TRACKER
Skills England data integrated - see what skills any role needs, where your gaps are, and a Career Passport. Badges you earn update your skill ratings automatically.
${SKILLS_PASSPORT}

MATCH ME - SMARTER
Now uses your RIASEC type, passions, dream employers and role preferences. New: "Where your worlds collide" - roles at the intersection of the industries you follow.
${MATCH_ME}

CV BUILDER - REDESIGNED
Proper two-column A4 PDF with company logos. New: ATS optimisation so your CV passes automated screening before a human sees it.
${CV_BUILDER}

TENNIS - JUST IN TIME FOR WIMBLEDON
With Wimbledon starting 29 June, we've added Tennis as a full industry. Real jobs from the LTA, AELTC, ATP, WTA and ITF. Live tournament events, career map, downloadable briefing and daily briefings.
${SITE}/tennis

RICHER ROLE PAGES
CareerPilot data on every role: named apprenticeship routes (L2–L6), T Levels, A Level requirements, real salary ranges, work environment descriptions.

We want to thank everyone for their support, time and encouragement this month. We are building something important and as always please push us to make this better week by week.

Built in London. Shipping every week. Reply to this email - we read every one.

The Howdoyoudo team
Unpacking the industries we love and live in.

Unsubscribe: ${unsubscribeUrl}
${SITE}`;
}

async function getUnsubscribeUrl(supabase: any, email: string): Promise<string> {
  try {
    const { data } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (data?.token) {
      return `${SITE}/api/unsubscribe?token=${data.token}`;
    }
  } catch (_) {}
  return `${SITE}/unsubscribe?email=${encodeURIComponent(email)}`;
}

function firstNameFrom(full?: string | null, email?: string | null): string {
  const titleCase = (s: string) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "");
  if (full && full.trim()) {
    const token = full.trim().split(/\s+/)[0].replace(/[^a-zA-Z'-]/g, "");
    if (token) return titleCase(token);
  }
  if (email) {
    const local = email.split("@")[0].split(/[._\-+]/)[0].replace(/[^a-zA-Z]/g, "");
    if (local) return titleCase(local);
  }
  return "";
}

async function enrichName(supabase: any, email: string, fallbackName?: string | null): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("get_full_name_by_email", { p_email: email });
    if (!error && data) return data as string;
  } catch (_) {}
  return fallbackName ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  let body: any = {};
  try { body = await req.json(); } catch (_) {}

  const previewEmail: string | undefined = body.preview_email;
  const sendAll: boolean = !!body.send_all;
  const batchSize: number = body.batch_size ?? 20;
  const delayMs: number = body.delay_ms ?? 1500;

  let recipients: { email: string; name?: string | null }[] = [];

  if (previewEmail) {
    const { data: sub } = await supabase
      .from("subscribers")
      .select("email, name")
      .eq("email", previewEmail.toLowerCase())
      .maybeSingle();
    recipients = sub ? [sub] : [{ email: previewEmail, name: null }];
  } else if (sendAll) {
    const { data, error } = await supabase
      .from("subscribers")
      .select("email, name");
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    recipients = data ?? [];
  } else {
    return new Response(JSON.stringify({ error: "Provide preview_email or send_all:true" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Filter suppressed
  const emails = recipients.map((r) => r.email.toLowerCase());
  const { data: suppressed } = await supabase
    .from("suppressed_emails")
    .select("email")
    .in("email", emails);
  const suppressedSet = new Set((suppressed ?? []).map((s: any) => s.email.toLowerCase()));
  recipients = recipients.filter((r) => !suppressedSet.has(r.email.toLowerCase()));

  // Fetch live job count once per send
  let liveJobs = 0;
  try {
    const { count } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());
    if (typeof count === "number") liveJobs = count;
  } catch (_) {}

  const results: { email: string; firstName: string; ok: boolean; id?: string; error?: string }[] = [];

  for (let i = 0; i < recipients.length; i += batchSize) {
    const slice = recipients.slice(i, i + batchSize);
    await Promise.all(slice.map(async (r) => {
      const enriched = await enrichName(supabase, r.email, r.name);
      const firstName = firstNameFrom(enriched, r.email);
      const unsub = await getUnsubscribeUrl(supabase, r.email);
      const html = buildHtml(firstName, unsub, liveJobs);
      const text = buildText(firstName, unsub, liveJobs);
      const res = await sendViaResend({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: r.email,
        subject: "June at Howdoyoudo - new site, 30+ industries, 60,000 jobs & our first show is coming",
        html,
        text,
        reply_to: REPLY_TO,
      });
      results.push({ email: r.email, firstName, ok: !res.error, id: res.id, error: res.error });
    }));
    if (i + batchSize < recipients.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  const ok = results.filter((r) => r.ok).length;
  const failed = results.length - ok;

  return new Response(
    JSON.stringify({ total: results.length, sent: ok, failed, mode: previewEmail ? "preview" : "broadcast", results: previewEmail ? results : results.filter((r) => !r.ok) }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
  );
});
