// May 2026 founding-community broadcast.
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
const SITE = "https://howdoyoudo.group";
const ASSETS = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/email-assets/may-update";
const WORDMARK = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/email-assets/howdoyoudo-wordmark.png";
// Deep link that opens the dedicated Howdy page and auto-plays the intro video
const HOWDY_LINK = `${SITE}/howdy?video=1`;
const HOWDY_AVATAR = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/email-assets/howdy-character.png";
const VOXPOPS_VIDEO = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/email-assets/may-update%2Fhdyd-voxpops-1.mp4";
const MY_INBOX = `${SITE}/my-jobs`;
const MARKETPLACE = `${SITE}/marketplace`;
const INDUSTRY_CONTENT = `${SITE}/football`;
const SIDE_HUSTLES = `${SITE}/side-hustles`;
const LEARNING = `${SITE}/learning`;
const MENTORING = `${SITE}/mentoring`;

function buildHtml(firstName: string, unsubscribeUrl: string, liveJobs: number): string {
  const jobsLabel = liveJobs > 0 ? liveJobs.toLocaleString("en-GB") : "thousands of";
  const hi = firstName ? `Howdy ${firstName} 👋` : "Howdy 👋";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>You're a founding member — what's new at Howdoyoudo</title>
<style>
  body { margin:0; padding:0; background:#ffffff; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#0a0a0a; }
  .wrap { max-width:600px; margin:0 auto; padding:32px 24px 48px; }
  h1, h2, h3 { font-family: 'Dela Gothic One', Georgia, serif; font-weight:400; line-height:1.15; margin:0 0 12px; letter-spacing:-0.01em; }
  h1 { font-size:32px; }
  h2 { font-size:22px; margin-top:8px; }
  h3 { font-size:18px; margin:0 0 6px; }
  p { font-size:16px; line-height:1.55; margin:0 0 14px; color:#1a1a1a; }
  a { color:#0a0a0a; }
  .accent { color:#00b800; }
  .green-pill { display:inline-block; background:#00E600; color:#0a0a0a; font-family:'Dela Gothic One',Georgia,serif; font-size:14px; padding:10px 18px; border-radius:999px; text-decoration:none; }
  .section { padding:28px 0; border-top:2px dashed #0a0a0a; }
  .section:first-of-type { border-top:none; }
  .doodle { display:block; margin:8px auto 18px; }
  .hero-doodle { display:block; margin:0 auto 8px; }
  .bullets { padding-left:0; list-style:none; margin:0 0 8px; }
  .bullets li { padding:8px 0 8px 28px; position:relative; font-size:16px; line-height:1.5; }
  .bullets li:before { content:""; position:absolute; left:0; top:14px; width:14px; height:14px; background:#00E600; border-radius:50%; }
  .highlight { background:#ecffe8; border:2px solid #00E600; border-radius:18px; padding:22px; }
  .meta { font-size:13px; color:#555; line-height:1.5; }
  .footer { margin-top:32px; padding-top:20px; border-top:1px solid #eee; text-align:center; }
  .footer a { color:#555; text-decoration:underline; }
  .play-caption { text-align:center; font-family:'Dela Gothic One',Georgia,serif; font-size:14px; color:#00b800; margin:-4px 0 18px; }
</style>
</head>
<body>
<div class="wrap">

  <div style="text-align:center; margin-bottom:8px;">
    <img src="${WORDMARK}" alt="Howdoyoudo" width="180" style="max-width:180px;height:auto;" />
  </div>

  <a href="${HOWDY_LINK}" style="text-decoration:none;">
    <img src="${ASSETS}/howdy-wave-play.png" alt="Howdy — tap to chat and watch the intro" width="280" height="186" class="hero-doodle" style="max-width:280px;height:auto;border:0;" />
  </a>

  <h1>${hi}</h1>
  <p>You're one of the <strong>founding members</strong> of the Howdoyoudo community — and that means a lot to the small team building this. Thank you for being here while we figure out what a genuinely useful chatshow and work-discovery platform looks like in 2026.</p>
  <p>Here's everything that landed in May.</p>

  <!-- BIG ONE: MY INBOX -->
  <div class="section">
    <div class="highlight">
      <h2 style="margin-top:0;">⭐ The big one — <span class="accent">My Inbox</span></h2>
      <p><strong>My Inbox is our biggest new feature.</strong> Please pop in and update your profile — the richer it is, the better it gets.</p>
      <p>Once you're set up you get a <strong>daily feed for every industry you follow</strong>, with:</p>
      <ul class="bullets">
        <li>Daily news from your world</li>
        <li>Analysis and behind-the-scenes thinking</li>
        <li>Video — the best of what's actually being made</li>
        <li>Job search — <strong>${jobsLabel} live jobs</strong> on the site right now</li>
      </ul>
      <p>And Howdy picks jobs for you <strong>while you sleep</strong> 💤 — so when you open the app in the morning, your matches are already waiting.</p>
      <p style="text-align:center; margin-top:18px;">
        <a class="green-pill" href="${MY_INBOX}">Open My Inbox</a>
      </p>
    </div>
  </div>

  <!-- HOWDY -->
  <div class="section">
    <img src="${HOWDY_AVATAR}" alt="Howdy" width="120" height="120" class="doodle" style="max-width:120px;height:auto;border-radius:18px;" />
    <h2>Meet Howdy, properly</h2>
    <p>Howdy is our in-app guide — think knowledgeable older sibling, not chatbot. This month Howdy grew up.</p>
    <ul class="bullets">
      <li><strong>Play the video</strong> — 60 seconds on what Howdy can actually do for you.</li>
      <li><strong>Take the tour</strong> — a guided walk through the app, launched from the Howdy chat header.</li>
      <li><strong>Ask any questions</strong> — jobs, industries, your CV, what to do next. Howdy remembers what you tell it.</li>
      <li><strong>Voice chat</strong> (premium) — talk to Howdy hands-free, like a real conversation.</li>
    </ul>
    <p style="text-align:center; margin-top:18px;">
      <a class="green-pill" href="${HOWDY_LINK}">Say hi to Howdy</a>
    </p>
  </div>

  <!-- SIDE HUSTLES -->
  <div class="section">
    <img src="${ASSETS}/doodle-side-hustle.png" alt="" width="180" height="180" class="doodle" style="max-width:180px;height:auto;" />
    <h2>Side hustles</h2>
    <p>For the things you do outside the 9–5. Side hustles are now woven into your profile and shape what Howdy recommends — because the side project is often where the next thing starts.</p>
    <p style="text-align:center; margin-top:14px;">
      <a class="green-pill" href="${SIDE_HUSTLES}">Add your side hustles</a>
    </p>
  </div>

  <!-- COURSES -->
  <div class="section">
    <img src="${ASSETS}/doodle-courses.png" alt="" width="180" height="180" class="doodle" style="max-width:180px;height:auto;" />
    <h2>Online learning &amp; courses</h2>
    <p>Surfaced per industry so you can actually skill up without trawling the internet. We've leaned heavily into online courses you can do in your own time, alongside the in-person classics.</p>
    <p style="text-align:center; margin-top:14px;">
      <a class="green-pill" href="${LEARNING}">Browse online learning</a>
    </p>
  </div>

  <!-- MENTORING -->
  <div class="section">
    <img src="${ASSETS}/doodle-mentoring.png" alt="" width="180" height="180" class="doodle" style="max-width:180px;height:auto;" />
    <h2>Mentoring</h2>
    <p>Connect with people a few steps ahead of you in your industry through the Members area. Opt in from Account settings and we'll start making introductions.</p>
    <p style="text-align:center; margin-top:14px;">
      <a class="green-pill" href="${MENTORING}">Find a mentor</a>
    </p>
  </div>

  <!-- VIDEOS -->
  <div class="section">
    <h2>Richer video content</h2>
    <p>Every industry now has its own video feed — refreshed weekly, pulling the best of what's actually being made about your world. No hobbyist noise. Work-focused only.</p>
    <p style="text-align:center; margin-top:18px;">
      <a class="green-pill" href="${INDUSTRY_CONTENT}">See an industry feed</a>
    </p>
  </div>

  <!-- WORKSHOPS / COMMUNITY -->
  <div class="section">
    <h2>From the workshops</h2>
    <p>We've been running workshops in <strong>London, Manchester and New York</strong> and the feedback has been super helpful.</p>
    <p>People want to be part of an <strong>authentic community</strong> — a place where they can understand a breadth of industries and roles, meet mentors, share good and bad experiences, and reflect their real personalities, likes and dislikes. Not just an automated AI-driven profile.</p>
    <p>A space against the backdrop of doom and gloom. Not to boast or perform, but to connect with purpose — and find their people.</p>
    <p>We've also been out <strong>on the streets</strong> talking to people — <a href="${VOXPOPS_VIDEO}" style="color:#00b800; font-weight:700;">watch what they had to say →</a></p>
  </div>


  <!-- ALSO -->
  <div class="section">
    <img src="${ASSETS}/doodle-tour-map.png" alt="" width="180" height="180" class="doodle" style="max-width:180px;height:auto;" />
    <h2>Also new this month</h2>
    <ul class="bullets">
      <li><strong>Jobs marketplace</strong> — thousands more roles from Workday, Workable, Greenhouse, Ashby, Pinpoint, plus Dr. Martens, Dunelm, Booking.com. Smart Search understands what you mean.</li>
      <li><strong>Members area</strong> — find other founding members in your industry. Opt-in from Account settings.</li>
      <li><strong>Daily newsletters</strong> — separate picks from each industry you follow, designed to be skimmable over coffee.</li>
      <li><strong>Most Wanted</strong> — your dream employers, front and centre in your Inbox, feeding your job matches.</li>
    </ul>
  </div>

  <!-- BEHIND THE SCENES -->
  <div class="section">
    <h2>Behind the scenes</h2>
    <p>Faster on mobile. Tighter UK-only filtering. A strict no-AI-hallucination rule on everything you read. An Industry Health Monitor that quietly refetches jobs whenever a sector dips.</p>
  </div>

  <div class="section" style="text-align:center;">
    <p style="font-family:'Dela Gothic One',Georgia,serif; font-size:18px; margin-bottom:6px;">Built in London by a very small team.</p>
    <p class="meta">Reply to this email if something's broken, missing, or brilliant — it lands directly in our inbox.</p>
    <p style="margin-top:24px; font-family:'Dela Gothic One',Georgia,serif;">The Howdoyoudo team <span class="accent">?</span></p>
    <p class="meta"><em>Unpacking the industries we love and live in.</em></p>
  </div>

  <div class="footer">
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
  const jobsLabel = liveJobs > 0 ? liveJobs.toLocaleString("en-GB") : "thousands of";
  const hi = firstName ? `Howdy ${firstName}` : "Howdy";
  return `${hi},

You're one of the founding members of the Howdoyoudo community — thank you for being here.

Here's what landed in May.

★ THE BIG ONE — MY INBOX
My Inbox is our biggest new feature. Please pop in and update your profile.
Once you're set up you get a daily feed for every industry you follow:
- Daily news from your world
- Analysis and behind-the-scenes thinking
- Video — the best of what's being made
- Job search — ${jobsLabel} live jobs on the site right now
And Howdy picks jobs for you while you sleep — your matches are waiting in the morning.
Open My Inbox: ${MY_INBOX}

MEET HOWDY, PROPERLY
- Play the video — 60s on what Howdy can do
- Take the tour — guided walk through the app
- Ask any questions — Howdy remembers what you tell it
- Voice chat (premium) — talk to Howdy hands-free
Say hi to Howdy: ${HOWDY_LINK}

NEW THIS MONTH
- Side hustles — woven into your profile and recommendations: ${SIDE_HUSTLES}
- Courses, especially online — surfaced per industry: ${LEARNING}
- Mentoring — connect with people a few steps ahead via Members area: ${MENTORING}
- Richer video content — per-industry feed, refreshed weekly: ${INDUSTRY_CONTENT}


FROM THE WORKSHOPS
We've been running workshops in London, Manchester and New York and the feedback has been super helpful. People want to be part of an authentic community — a place where they can understand a breadth of industries and roles, meet mentors, share good and bad experiences, and reflect their real personalities, likes and dislikes. Not just an automated AI-driven profile. A space against the backdrop of doom and gloom — not to boast or perform, but to connect with purpose and find their people.
We've also been out on the streets talking to people — watch what they had to say: ${VOXPOPS_VIDEO}

ALSO NEW
- Jobs marketplace: Workday, Workable, Greenhouse, Ashby, Pinpoint, Dr. Martens, Dunelm, Booking.com
- Members area, Daily newsletters, Most Wanted

Behind the scenes: faster on mobile, tighter UK filtering, strict no-hallucination rule, Industry Health Monitor.

Built in London by a very small team. Reply to this email if something's broken, missing or brilliant.

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

// First whitespace-separated token of the full name (e.g. "Andrew Harrison" -> "Andrew",
// "Andrew and Tristia" -> "Andrew"). Falls back to a tidied email local-part.
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

// Enrich a recipient by looking up the auth user + profile for their real full name.
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
        subject: "You're a founding member — what's new at Howdoyoudo this May",
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
