// Newsletter click-tracking redirect.
// Records a user_interactions row, then 302-redirects to the destination URL.
// Designed to be invoked from email links - works without auth, no CORS preflight.
//
// Usage:
//   GET /click-tracker?u=<url>&kind=job&jid=<job_id>&sub=<subscriber_email>&ind=<industry>
//   GET /click-tracker?u=<url>&kind=news&ind=<industry>&sub=<email>
//
// All params except `u` are optional. We attribute to the matching auth.users.id
// when the subscriber's email maps to a registered user, otherwise we just
// 302 through without logging.
//
// Important: this function has verify_jwt = false (configured in
// supabase/config.toml) because email clients won't send a JWT.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { signClickTrackerUrl } from "../_shared/click-tracker-sign.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLICK_TRACKER_SECRET = Deno.env.get("CLICK_TRACKER_SECRET")!;
const SAFE_FALLBACK = "https://www.howdoyoudo.co.uk/";

// This endpoint has to accept a redirect to ANY real job/news URL - jobs come
// from thousands of different employer/publisher domains, so a domain
// allowlist isn't workable. Instead the target is HMAC-signed at link-build
// time (see send-daily-digest's trackUrl(), via _shared/click-tracker-sign.ts)
// and verified here, so the redirect only ever fires for a URL *we*
// generated - closing the open redirect (an attacker can no longer use this
// endpoint to bounce an arbitrary phishing link through our trusted domain)
// without breaking the real feature. Links built before this fix have no
// signature and safely fall back to the homepage instead of erroring.
async function verifySignedTarget(raw: string | null, sig: string | null): Promise<string | null> {
  if (!raw || !sig) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  } catch {
    return null;
  }
  const expected = await signClickTrackerUrl(CLICK_TRACKER_SECRET, raw);
  if (expected.length !== sig.length) return null;
  // Constant-time-ish compare - this isn't a high-value secret boundary,
  // but there's no reason to make timing analysis easier than it needs to be.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0 ? raw : null;
}

function fallbackHtml(target: string) {
  return `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><title>Redirecting…</title><p>Redirecting to <a href="${target}">${target}</a>…</p>`;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const rawTarget = url.searchParams.get("u");
  const sig = url.searchParams.get("sig");
  const kind = url.searchParams.get("kind") || "link"; // "job" | "news" | "link"
  const jobId = url.searchParams.get("jid");
  const industry = url.searchParams.get("ind");
  const companySlug = url.searchParams.get("co");
  const subEmail = url.searchParams.get("sub");

  // No signature, or it doesn't match => either a forged link or one built
  // before this fix shipped. Either way, land somewhere safe rather than
  // following an unverified destination.
  const target = await verifySignedTarget(rawTarget, sig) ?? SAFE_FALLBACK;

  // Fire-and-forget logging - never block the redirect.
  (async () => {
    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      let userId: string | null = null;
      if (subEmail) {
        // Look up the auth user by email. service_role can read auth.users.
        const { data: u } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", subEmail) // try by id first (no-op for emails)
          .maybeSingle();
        if (u?.id) userId = u.id;
        if (!userId) {
          // Fallback: look up via auth admin API
          try {
            const adminRes = await fetch(
              `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(subEmail)}`,
              { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
            );
            if (adminRes.ok) {
              const j = await adminRes.json();
              const found = Array.isArray(j?.users) ? j.users[0] : null;
              if (found?.id) userId = found.id;
            }
          } catch (_) { /* ignore */ }
        }
      }

      if (!userId) return; // No identifiable user - skip logging.

      const interactionType =
        kind === "job" ? "job_click" :
        kind === "news" ? "industry_view" :
        "page_view";

      await supabase.from("user_interactions").insert({
        user_id: userId,
        interaction_type: interactionType,
        industry: industry || null,
        company_slug: companySlug || null,
        job_id: jobId || null,
        metadata: { source: "newsletter", target_url: target.slice(0, 500) },
      });
    } catch (err) {
      console.warn("click-tracker log failed:", err);
    }
  })();

  // 302 redirect - works in every email client.
  return new Response(fallbackHtml(target), {
    status: 302,
    headers: {
      Location: target,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
});
