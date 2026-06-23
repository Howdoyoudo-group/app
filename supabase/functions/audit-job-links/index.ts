// Daily link-health audit for non-Adzuna jobs.
// HEAD/GET checks every non-Adzuna job URL and deletes ones that are broken,
// redirected to a homepage/landing page, or that no longer return a real job page.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const LANDING_PATH_RX =
  /^\/?(careers?|jobs?|grads?|graduate|search|vacancies|recruitment|about|blog|home|opportunities|work-with-us|join-us|join|hiring|talent|life|people)\/?$/i;

function isLandingUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    const path = u.pathname.replace(/\/+$/, "");
    if (path === "" || path === "/") return true;
    if (LANDING_PATH_RX.test(path)) return true;
    // /jobs?empNo=… style aggregator listings
    if (
      /^\/jobs\/?$/i.test(path) &&
      /(?:^|[?&])(empNo|employer|company|category|department|location|keywords|q)=/i.test(u.search)
    ) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

type CheckResult = {
  ok: boolean;
  reason: string;
  finalUrl?: string;
};

async function checkUrl(url: string, signal: AbortSignal): Promise<CheckResult> {
  // Try GET (some sites return 405 to HEAD, or render via JS so HEAD is unreliable for content)
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal,
      headers: {
        "User-Agent": UA,
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });

    const finalUrl = res.url || url;

    // 404 / 410 / 5xx → broken
    if (res.status === 404 || res.status === 410) {
      return { ok: false, reason: `http_${res.status}`, finalUrl };
    }
    if (res.status >= 500) {
      return { ok: false, reason: `http_${res.status}`, finalUrl };
    }
    // 403/401 → likely anti-bot, treat as OK to avoid false positives
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      return { ok: true, reason: `blocked_${res.status}`, finalUrl };
    }
    if (!res.ok && res.status !== 200) {
      // Other non-2xx (e.g. 3xx loops) - treat as broken
      return { ok: false, reason: `http_${res.status}`, finalUrl };
    }

    // Redirected to a landing page
    if (finalUrl !== url && isLandingUrl(finalUrl)) {
      return { ok: false, reason: "redirected_to_landing", finalUrl };
    }

    // Sample body for "job not found" markers
    const text = (await res.text()).slice(0, 4000).toLowerCase();
    const notFoundMarkers = [
      "this job is no longer available",
      "this vacancy is no longer available",
      "this job has expired",
      "this position has been filled",
      "job not found",
      "vacancy not found",
      "page not found",
      "no longer accepting applications",
      "the job you are looking for is no longer",
      "sorry, this job is no longer",
      "this opportunity has closed",
    ];
    for (const marker of notFoundMarkers) {
      if (text.includes(marker)) {
        return { ok: false, reason: "expired_marker", finalUrl };
      }
    }

    return { ok: true, reason: "ok", finalUrl };
  } catch (err) {
    const msg = (err as Error).message || "";
    if (msg.includes("aborted") || msg.includes("timeout")) {
      // Don't delete on timeout - could be transient
      return { ok: true, reason: "timeout", finalUrl: url };
    }
    return { ok: false, reason: `fetch_error:${msg.slice(0, 80)}`, finalUrl: url };
  }
}

async function withTimeout<T>(p: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await p(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let dryRun = false;
  let limit = 1000; // per invocation - 4x increase to clear backlog faster
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      dryRun = body?.dryRun === true;
      if (typeof body?.limit === "number") limit = Math.min(2000, Math.max(1, body.limit));
    } else {
      const u = new URL(req.url);
      dryRun = u.searchParams.get("dryRun") === "1";
      const ql = u.searchParams.get("limit");
      if (ql) limit = Math.min(2000, Math.max(1, parseInt(ql, 10)));
    }
  } catch (_) {}

  // Pre-pass: auto-delete Reed jobs older than 60 days.
  // Reed listing period is 30 days — anything older is expired by design.
  let staleReedDeleted = 0;
  if (!dryRun) {
    const staleCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: staleErr, count } = await supabase
      .from("jobs")
      .delete({ count: "exact" })
      .ilike("source_url", "%reed.co.uk%")
      .lt("scraped_at", staleCutoff);
    if (!staleErr && count) staleReedDeleted = count;
    if (staleReedDeleted > 0) console.log(`Pre-pass: deleted ${staleReedDeleted} stale Reed jobs (>60 days old)`);
  }

  // Fetch oldest-checked first by created_at - rotate through inventory daily
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, url, company, source_url, scraped_at")
    .or("source_url.is.null,source_url.not.ilike.%adzuna%")
    .order("scraped_at", { ascending: true })
    .limit(limit);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const toDelete: { id: string; url: string; reason: string }[] = [];
  const checked: number = jobs?.length ?? 0;
  const concurrency = 8;
  let idx = 0;

  async function worker() {
    while (idx < (jobs?.length ?? 0)) {
      const job = jobs![idx++];
      // Pre-filter: obvious landing pages get deleted without HTTP call
      if (isLandingUrl(job.url)) {
        toDelete.push({ id: job.id, url: job.url, reason: "landing_url" });
        continue;
      }
      const result = await withTimeout((sig) => checkUrl(job.url, sig), 12000);
      if (!result.ok) {
        toDelete.push({ id: job.id, url: job.url, reason: result.reason });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  let deleted = 0;
  if (!dryRun && toDelete.length > 0) {
    // Delete in chunks of 100
    for (let i = 0; i < toDelete.length; i += 100) {
      const chunk = toDelete.slice(i, i + 100).map((d) => d.id);
      const { error: delErr } = await supabase.from("jobs").delete().in("id", chunk);
      if (!delErr) deleted += chunk.length;
    }
  }

  // Touch scraped_at on the survivors so they rotate to the back of the queue
  if (!dryRun && jobs && jobs.length > 0) {
    const survivorIds = jobs
      .filter((j) => !toDelete.some((d) => d.id === j.id))
      .map((j) => j.id);
    if (survivorIds.length > 0) {
      // chunked touch
      for (let i = 0; i < survivorIds.length; i += 200) {
        const chunk = survivorIds.slice(i, i + 200);
        await supabase
          .from("jobs")
          .update({ scraped_at: new Date().toISOString() })
          .in("id", chunk);
      }
    }
  }

  const reasonCounts: Record<string, number> = {};
  for (const d of toDelete) reasonCounts[d.reason] = (reasonCounts[d.reason] ?? 0) + 1;

  return new Response(
    JSON.stringify({
      checked,
      flagged: toDelete.length,
      deleted: dryRun ? 0 : deleted,
      staleReedDeleted,
      dryRun,
      reasonCounts,
      sample: toDelete.slice(0, 20),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
