// July/August (+ early Sept) 2026 founding-community broadcast. Modelled on
// send-june-update - same styling, same recipient/suppression handling.
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
const THE_SHOW = `${SITE}/the-show`;
const JOB_TRACKER = `${SITE}/job-tracker`;
const MARKETPLACE = `${SITE}/marketplace`;
const STUFF_WE_RATE = `${SITE}/articles`;
const LEARNING = `${SITE}/learning`;
const USING_OUR_SITE = `${SITE}/using-our-site`;
const BOOKS = `${SITE}/books`;
const THEATRE = `${SITE}/theatre`;
const POLITICS = `${SITE}/politics`;

// YouTube's own thumbnail CDN - no API call needed, works for any public video.
const ytThumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
const EP1_THUMB = ytThumb("Nb8idwwX4Yo"); // How Do You Do, Music?
const EP2_THUMB = ytThumb("JQGH2S4xso0"); // How Do You Do, Journalism?
const EP1_LINK = `${THE_SHOW}#episodes`;
const EP2_LINK = `${THE_SHOW}#episodes`;

function buildHtml(firstName: string, unsubscribeUrl: string, liveJobs: number): string {
  const hi = firstName ? `Howdy ${firstName} 👋` : "Howdy 👋";
  const liveJobsFormatted = liveJobs.toLocaleString("en-GB");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>What's new at Howdoyoudo - Summer 2026</title>
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
  .chip { display:inline-block; background:#0a0a0a; color:#ffffff; font-family:'Dela Gothic One',Georgia,serif; font-size:11px; padding:5px 10px; margin:3px 3px 3px 0; letter-spacing:0.06em; }
  .label { font-family:'Dela Gothic One',Georgia,serif; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:#555; margin:0 0 6px; }
  .meta { font-size:13px; color:#555; line-height:1.5; }
  .footer { margin-top:32px; padding-top:20px; border-top:2px solid #0a0a0a; text-align:center; }
  .footer a { color:#555; text-decoration:underline; }
  .episode-card { display:block; text-decoration:none; border:2px solid #0a0a0a; margin-bottom:14px; }
  .episode-thumb { display:block; width:100%; height:auto; border-bottom:2px solid #0a0a0a; }
  .episode-body { padding:12px 14px; background:#ffffff; }
  .episode-tag { font-family:'Dela Gothic One',Georgia,serif; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#00b800; margin:0 0 4px; }
  .episode-title { font-family:'Dela Gothic One',Georgia,serif; font-size:16px; color:#0a0a0a; margin:0 0 4px; }
  .episode-desc { font-size:13px; color:#555; margin:0; line-height:1.4; }
  .play-badge { display:inline-block; background:#0a0a0a; color:#ffffff; border-radius:50%; width:22px; height:22px; text-align:center; line-height:22px; font-size:11px; margin-right:6px; }
</style>
</head>
<body>
<div class="wrap">

  <!-- HEADER -->
  <div style="text-align:center; padding:24px 0 16px; border-bottom:3px solid #0a0a0a; margin-bottom:24px;">
    <img src="${WORDMARK}" alt="Howdoyoudo" width="180" style="max-width:180px;height:auto;" />
    <div style="margin-top:10px;">
      <span style="font-family:'Dela Gothic One',Georgia,serif; font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:#555;">Founding Member Update &nbsp;·&nbsp; Summer 2026</span>
    </div>
  </div>

  <h1>${hi}</h1>

  <p>It's been a big couple of months - two full episodes of the show are out, the jobs board has more than doubled, and we've shipped a proper tool for keeping track of every application you make. Here's everything, in one place.</p>

  <p style="font-family:'Dela Gothic One',Georgia,serif; font-size:13px; letter-spacing:0.1em; text-transform:uppercase; color:#555; margin-bottom:4px;">Here's what we shipped ↓</p>

  <!-- THE SHOW - major focus -->
  <div class="section" style="border-top:3px solid #0a0a0a;">
    <div class="highlight" style="margin-bottom:16px;">
      <p class="label" style="color:#0a0a0a; margin-bottom:8px;">★ The big one</p>
      <h2 style="margin-top:0; font-size:24px;">The Show is live. Two full episodes, out now.</h2>
      <p style="margin-bottom:0;">Real people, inside the industries we love. No scripts, no PR spin - just honest conversations about how people actually got into their careers and what the work is really like day to day.</p>
    </div>

    <a class="episode-card" href="${EP1_LINK}">
      <img class="episode-thumb" src="${EP1_THUMB}" alt="How Do You Do, Music? — Episode 1" />
      <div class="episode-body">
        <p class="episode-tag">Episode 1 · Music</p>
        <p class="episode-title"><span class="play-badge">▶</span>How Do You Do, Music?</p>
        <p class="episode-desc">Going inside the music industry with the people who live it - the paths in, the graft, and how it really works.</p>
      </div>
    </a>

    <a class="episode-card" href="${EP2_LINK}">
      <img class="episode-thumb" src="${EP2_THUMB}" alt="How Do You Do, Journalism? — Episode 2" />
      <div class="episode-body">
        <p class="episode-tag">Episode 2 · Journalism</p>
        <p class="episode-title"><span class="play-badge">▶</span>How Do You Do, Journalism?</p>
        <p class="episode-desc">Going inside the world of journalism with the people who live it.</p>
      </div>
    </a>

    <p style="margin-top:4px;">There's more too - <strong>Pitch Over a Pint</strong> (two real pitches, no boardroom), and a growing library of street interviews from London and SXSW.</p>
    <a class="cta" href="${THE_SHOW}">Watch The Show →</a>
  </div>

  <!-- JOB TRACKER -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-grocery.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">New Tool</p>
        <h2>Job Tracker - one board, every application.</h2>
        <p>A proper pipeline board: Wishlist → Applied → Interviewing → Offer. Track jobs, or a company you'd like to approach speculatively even with no live posting. Log key contacts at each company, set as many time-based reminders as an opportunity needs, and add a closing date so nothing slips through unnoticed. Howdy's tailored cover-letter help is built right into each card.</p>
        <a class="cta" href="${JOB_TRACKER}">Try Job Tracker →</a>
      </div>
    </div>
  </div>

  <!-- JOB NUMBERS -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-teaching.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">Jobs Marketplace</p>
        <h2>${liveJobsFormatted} live jobs - more than double since June.</h2>
        <p>Direct connections to hundreds of employer career sites across every industry on the platform, no middleman. Save any job, or send it straight to your new Job Tracker board.</p>
        <a class="cta" href="${MARKETPLACE}">Browse the marketplace →</a>
      </div>
    </div>
  </div>

  <!-- NEW INDUSTRIES -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-travel.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">New Industries</p>
        <h2>Books, Theatre and Politics - now 38 industries.</h2>
        <p>Three more full industries added, each with their own career map, real company profiles, live jobs, daily briefings and events.</p>
        <div style="margin:10px 0;">
          <span class="chip">Books</span><span class="chip">Theatre</span><span class="chip">Politics</span>
        </div>
        <a class="cta" href="${BOOKS}">Explore Books →</a>
      </div>
    </div>
  </div>

  <!-- STUFF WE RATE -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-fashion.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">Renamed &amp; refreshed</p>
        <h2>Stuff We Rate.</h2>
        <p>Our reading/watching/listening page has a new name and new picks - including Jimmy's Jobs of the Future and Max Klymenko. If a video, podcast or newsletter genuinely helped us understand an industry better, it's in here.</p>
        <a class="cta" href="${STUFF_WE_RATE}">See what we rate →</a>
      </div>
    </div>
  </div>

  <!-- SUPPORT INTO WORK -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-psychotherapy.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">Learning Hub</p>
        <h2>A new "Support into Work" section.</h2>
        <p>Curated, free routes for anyone finding it harder to get started - NHS work-and-health programmes, DWP Kickstart, Traineeships, The Prince's Trust, and support specifically for parents, carers and people managing a health condition or disability.</p>
        <a class="cta" href="${LEARNING}">See what's there →</a>
      </div>
    </div>
  </div>

  <!-- USING OUR SITE -->
  <div class="section">
    <div class="section-inner">
      <div class="doodle-cell">
        <img src="${OLD_ASSETS}/email-icon-journalism.png" width="72" height="72" alt="" style="display:block;width:72px;height:72px;object-fit:contain;" />
      </div>
      <div class="content-cell">
        <p class="label">Using Our Site</p>
        <h2>"Start with a blank sheet of paper."</h2>
        <p>There are thousands of jobs in the world, yet most of us only ever consider a handful - not because the others aren't for us, but because we never knew they existed. We rewrote our guide to the site around that idea, and Howdy will now read it to you if you'd rather listen.</p>
        <a class="cta" href="${USING_OUR_SITE}">Read the guide →</a>
      </div>
    </div>
  </div>

  <!-- SIGN OFF -->
  <div class="section" style="border-top:3px solid #0a0a0a;">
    <p>Thank you for being part of this from the start. As always, reply and tell us what to build next - we read every one.</p>
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

function buildText(firstName: string, unsubscribeUrl: string, liveJobs: number): string {
  const hi = firstName ? `Howdy ${firstName}` : "Howdy";
  const liveJobsFormatted = liveJobs.toLocaleString("en-GB");
  return `${hi},

It's been a big couple of months - two full episodes of the show are out, the jobs board has more than doubled, and we've shipped a proper tool for keeping track of every application you make. Here's everything, in one place.

★ THE SHOW - TWO FULL EPISODES, OUT NOW
Real people, inside the industries we love. No scripts, no PR spin.
Episode 1 - How Do You Do, Music?
Episode 2 - How Do You Do, Journalism?
Plus Pitch Over a Pint and a growing library of street interviews from London and SXSW.
${THE_SHOW}

NEW TOOL - JOB TRACKER
One board, every application: Wishlist -> Applied -> Interviewing -> Offer. Track jobs, or a company you'd like to approach speculatively. Log key contacts, set reminders, add a closing date. Howdy's tailored cover-letter help is built right in.
${JOB_TRACKER}

JOBS MARKETPLACE - ${liveJobsFormatted} LIVE JOBS
More than double since June. Direct connections to hundreds of employer career sites, no middleman.
${MARKETPLACE}

NEW INDUSTRIES - BOOKS, THEATRE, POLITICS
Now 38 industries on the platform, each with a full career map, company profiles, live jobs and events.
${BOOKS} | ${THEATRE} | ${POLITICS}

STUFF WE RATE (renamed & refreshed)
New picks including Jimmy's Jobs of the Future and Max Klymenko.
${STUFF_WE_RATE}

LEARNING HUB - NEW "SUPPORT INTO WORK" SECTION
Curated, free routes for anyone finding it harder to get started - NHS work-and-health programmes, DWP Kickstart, Traineeships, The Prince's Trust, and support for parents, carers and people managing a health condition or disability.
${LEARNING}

USING OUR SITE - "START WITH A BLANK SHEET OF PAPER"
There are thousands of jobs in the world, yet most of us only ever consider a handful - not because the others aren't for us, but because we never knew they existed. We rewrote our guide to the site, and Howdy will now read it to you if you'd rather listen.
${USING_OUR_SITE}

Thank you for being part of this from the start. As always, reply and tell us what to build next - we read every one.

The Howdoyoudo team
Unpacking the industries we love and live in. Built in London.

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
        subject: "The Show is live, 130k+ jobs & a new Job Tracker - what's new at Howdoyoudo",
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
