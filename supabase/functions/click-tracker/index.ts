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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function safeRedirectUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function fallbackHtml(target: string | null) {
  const safe = target ?? "https://howdoyoudo.group/";
  return `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${safe}"><title>Redirecting…</title><p>Redirecting to <a href="${safe}">${safe}</a>…</p>`;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const target = safeRedirectUrl(url.searchParams.get("u"));
  const kind = url.searchParams.get("kind") || "link"; // "job" | "news" | "link"
  const jobId = url.searchParams.get("jid");
  const industry = url.searchParams.get("ind");
  const companySlug = url.searchParams.get("co");
  const subEmail = url.searchParams.get("sub");

  if (!target) {
    return new Response(fallbackHtml(null), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

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
