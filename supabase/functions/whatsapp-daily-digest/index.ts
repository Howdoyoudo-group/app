import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  scoreJob,
  shouldExcludeJob,
  passesSalaryFilter,
  isLiveJob,
  SALARY_THRESHOLDS,
  type Job,
  type UserProfile,
} from "../_shared/scoring/score-job.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const GATEWAY_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}`;
const DEFAULT_FROM = "whatsapp:+14155238886";

function pickFirstIndustry(interests: string[] | null): string | null {
  if (!interests || interests.length === 0) return null;
  return interests[0];
}

const SITE_URL = "https://howdoyoudo.group";
const MY_JOBS_URL = `${SITE_URL}/my-jobs?from=whatsapp`;

function normalizeTitleForDedupe(raw: string): string {
  let t = (raw || "").toLowerCase().trim();
  const cutAt = t.search(/\s+[–\-|·•]\s+|,\s+/);
  if (cutAt > 0) t = t.slice(0, cutAt);
  return t.replace(/\s*\([^)]*\)\s*$/, "").replace(/\s+/g, " ").trim();
}

async function sendWhatsApp(opts: {
  to: string; body: string; from: string; accountSid: string; authToken: string;
  contentSid?: string | null; contentVariables?: Record<string, string> | null;
}) {
  const params: Record<string, string> = { From: opts.from, To: `whatsapp:${opts.to}` };
  if (opts.contentSid) {
    // Template send — works outside the 24h customer-service window.
    params.ContentSid = opts.contentSid;
    if (opts.contentVariables) {
      params.ContentVariables = JSON.stringify(opts.contentVariables);
    }
  } else {
    // Free-form — only delivers if user messaged us in the last 24h.
    params.Body = opts.body;
  }
  return fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${opts.accountSid}:${opts.authToken}`)}`,
      
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
}

// Trim helper — WhatsApp template variables cannot contain newlines and are
// length-limited; keep each var well under 1024 chars and single-line.
function tmplVar(s: string, max = 480): string {
  return (s || "").replace(/\s+/g, " ").trim().slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const WHATSAPP_FROM = Deno.env.get("WHATSAPP_FROM") ?? DEFAULT_FROM;
    const WHATSAPP_DIGEST_CONTENT_SID = Deno.env.get("WHATSAPP_DIGEST_CONTENT_SID") ?? null;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: "WhatsApp service not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Optional test mode: send only to the authenticated caller (premium-gated).
    let testUserId: string | null = null;
    const body = await req.json().catch(() => ({}));
    if (body?.test_self === true) {
      const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Sign in required" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      const { data: roles } = await userClient.from("user_roles").select("role").eq("user_id", user.id);
      const isPremium = (roles ?? []).some((r: any) => r.role === "premium" || r.role === "admin");
      if (!isPremium) {
        return new Response(JSON.stringify({ error: "Premium required" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      testUserId = user.id;
    }

    // Get all premium users opted-in & verified (or just the test user)
    const { data: premiumRows } = await admin
      .from("user_roles")
      .select("user_id")
      .in("role", ["premium", "admin"]);
    let premiumIds = Array.from(new Set((premiumRows ?? []).map((r: any) => r.user_id)));
    if (testUserId) premiumIds = premiumIds.filter((id) => id === testUserId);
    if (premiumIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no premium users" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let profilesQuery = admin
      .from("profiles")
      .select("id, whatsapp_number, whatsapp_verified_at, whatsapp_opt_in, whatsapp_frequency, industry_interests, full_name")
      .in("id", premiumIds)
      .not("whatsapp_verified_at", "is", null)
      .not("whatsapp_number", "is", null);
    // In test mode skip the opt_in requirement so user can preview before enabling
    if (!testUserId) profilesQuery = profilesQuery.eq("whatsapp_opt_in", true);
    const { data: profiles } = await profilesQuery;

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no opted-in profiles" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Today's briefings keyed by industry slug
    const today = new Date().toISOString().slice(0, 10);
    const { data: briefings } = await admin
      .from("daily_briefings")
      .select("industry, main_news, takeaway")
      .eq("briefing_date", today);
    const briefingMap = new Map<string, any>();
    for (const b of (briefings ?? [])) {
      briefingMap.set(String(b.industry).toLowerCase(), b);
    }

    let sent = 0; let failed = 0;
    for (const p of profiles) {
      const phone = p.whatsapp_number as string;
      const industry = pickFirstIndustry(p.industry_interests as string[] | null);
      const industrySlug = industry?.toLowerCase().replace(/\s+/g, "-") ?? null;

      // Pull the same fields MyJobs scoring uses, so the digest mirrors the inbox.
      const { data: fullProfile } = await admin
        .from("profiles")
        .select("career_level, industry_interests, newsletter_industries, location_preference, role_preferences, salary_expectation, understand_me_results, riasec_scores, work_values, job_preferences")
        .eq("id", p.id)
        .maybeSingle();
      if (!fullProfile) continue;

      const userProfile: UserProfile = {
        career_level: fullProfile.career_level ?? null,
        industry_interests: fullProfile.industry_interests ?? null,
        newsletter_industries: fullProfile.newsletter_industries ?? null,
        location_preference: fullProfile.location_preference ?? null,
        role_preferences: fullProfile.role_preferences ?? null,
        salary_expectation: fullProfile.salary_expectation ?? null,
        understand_me_results: fullProfile.understand_me_results as any ?? null,
        riasec_scores: fullProfile.riasec_scores as any ?? null,
        work_values: fullProfile.work_values as any ?? null,
        job_preferences: fullProfile.job_preferences as any ?? null,
      };
      const minSalary = userProfile.salary_expectation ? (SALARY_THRESHOLDS[userProfile.salary_expectation] || 0) : 0;

      // Jobs already sent to this user in the last 30 days — never repeat.
      const { data: prevSends } = await admin
        .from("whatsapp_send_log")
        .select("payload, created_at")
        .eq("user_id", p.id)
        .eq("template_name", "daily_digest")
        .eq("status", "sent")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      const alreadySent = new Set<string>();
      for (const row of (prevSends ?? [])) {
        const ids = (row as any)?.payload?.job_ids;
        if (Array.isArray(ids)) ids.forEach((id) => alreadySent.add(String(id)));
      }

      // Only consider jobs scraped in the last 7 days — these are new arrivals.
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: jobs } = await admin
        .from("jobs")
        .select("id, title, company, location, salary, industry, career_level, url, created_at, scraped_at, type, work_mode, role_category, ai_role_category, job_traits, description, tags, expires_at")
        .gte("scraped_at", since)
        .order("scraped_at", { ascending: false })
        .limit(2000);

      const candidates = ((jobs ?? []) as unknown as Job[]).filter((j) => {
        if (alreadySent.has(String(j.id))) return false;
        if (!isLiveJob(j)) return false;
        if (shouldExcludeJob(j, userProfile)) return false;
        if (!passesSalaryFilter(j, minSalary)) return false;
        return true;
      });

      // Score with the SAME function MyJobs uses, then take ≥60% only.
      const scored = candidates
        .map((j) => ({ j, ...scoreJob(j, userProfile, new Map()) }))
        .filter((x) => x.score >= 60)
        .sort((a, b) => b.score - a.score || new Date(b.j.scraped_at || b.j.created_at).getTime() - new Date(a.j.scraped_at || a.j.created_at).getTime());

      // Dedupe by normalized title + company, take top 3.
      const seen = new Set<string>();
      const fresh: Job[] = [];
      for (const { j } of scored) {
        const companyKey = String(j.company || "").toLowerCase().replace(/\s+(corp\.?|corporation|ltd\.?|limited|plc|inc\.?)$/i, "");
        const k = `${normalizeTitleForDedupe(String(j.title))}|${companyKey}`;
        if (seen.has(k)) continue;
        seen.add(k);
        fresh.push(j);
        if (fresh.length >= 3) break;
      }

      const jobLines = fresh.length > 0
        ? fresh.map((j, i) => `${i + 1}. ${j.title} — ${j.company}`).join("\n")
        : "";

      const sentJobIds: string[] = fresh.map((j) => j.id).filter(Boolean);


      const briefing = industrySlug ? (briefingMap.get(industrySlug) ?? briefingMap.get(industry ?? "")) : null;
      const briefingLine = briefing?.takeaway
        ? `Today in ${industry ?? "your world"} — ${String(briefing.takeaway).slice(0, 220)}`
        : briefing?.main_news
          ? `Today in ${industry ?? "your world"} — ${String(briefing.main_news).slice(0, 220)}`
          : "";

      if (!jobLines && !briefingLine) continue;

      const name = (p.full_name as string)?.split(" ")[0] ?? "there";
      const jobsCount = jobLines ? jobLines.split("\n").length : 0;
      const parts = [
        `Howdy ${name} 👋`,
        `\nUnpacking the industries you love and live in.`,
        briefingLine ? `\n📰 ${briefingLine}` : "",
        jobLines
          ? `\n🎯 ${jobsCount} fresh Job${jobsCount === 1 ? "" : "s"} for you today:\n${jobLines}`
          : "",
        jobLines ? `\nOpen your Jobs inbox 👉 ${MY_JOBS_URL}` : "",
        `\n— Howdy, from How do you do?`,
        `Reply STOP to opt out.`,
      ].filter(Boolean);
      const body = parts.join("\n");

      // Build template variables. Template (5 vars):
      //   1: first name
      //   2: industry label (e.g. "football")
      //   3: briefing takeaway (one line)
      //   4: jobs list (joined with " · "), or "No new matches today"
      //   5: My Jobs URL
      const contentVariables: Record<string, string> = {
        "1": tmplVar(name, 40),
        "2": tmplVar(industry ?? "your world", 40),
        "3": tmplVar(briefingLine.replace(/^Today in [^—]+—\s*/, "") || "Quiet news day.", 480),
        "4": tmplVar(
          jobLines ? fresh.map((j) => `${j.title} — ${j.company}`).join(" · ") : "No new matches today",
          600,
        ),
        "5": MY_JOBS_URL,
      };

      const res = await sendWhatsApp({
        to: phone, body, from: WHATSAPP_FROM,
        accountSid: TWILIO_ACCOUNT_SID, authToken: TWILIO_AUTH_TOKEN,
        contentSid: WHATSAPP_DIGEST_CONTENT_SID,
        contentVariables: WHATSAPP_DIGEST_CONTENT_SID ? contentVariables : null,
      });
      const data = await res.json().catch(() => ({}));
      await admin.from("whatsapp_send_log").insert({
        user_id: p.id, phone_e164: phone,
        template_name: "daily_digest",
        status: res.ok ? "sent" : "failed",
        twilio_message_sid: data?.sid ?? null,
        error_message: res.ok ? null : JSON.stringify(data).slice(0, 500),
        payload: { industry, jobs: jobLines ? jobLines.split("\n").length : 0, job_ids: sentJobIds, destination: MY_JOBS_URL },
      });
      if (res.ok) {
        sent++;
        await admin.from("profiles").update({ whatsapp_last_sent_at: new Date().toISOString() }).eq("id", p.id);
      } else {
        failed++;
      }
      // tiny stagger
      await new Promise((r) => setTimeout(r, 300));
    }

    return new Response(JSON.stringify({ sent, failed, total: profiles.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("whatsapp-daily-digest error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
