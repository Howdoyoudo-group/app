// Enriches a job's description on demand by fetching the source page (Adzuna,
// Reed, etc.) server-side, extracting the full posting text, and caching it
// back to the jobs row so subsequent reads are instant.
//
// Called from the marketplace "Read more" expand. Keeps users on our site
// (no redirect required to read the full description).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MIN_FULL_LENGTH = 900; // jobs already this long don't need enrichment

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<\/(p|div|li|h[1-6]|br)>/gi, "\n")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Try JSON-LD JobPosting schema first (most accurate, works on Adzuna,
// Greenhouse, Lever, Workable, Workday, SmartRecruiters, Pinpoint).
function extractFromJsonLd(html: string): string | null {
  const blockRx = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRx.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const c of candidates) {
        if (!c) continue;
        const type = c["@type"];
        const isJobPosting =
          type === "JobPosting" ||
          (Array.isArray(type) && type.includes("JobPosting"));
        if (isJobPosting && typeof c.description === "string" && c.description.length > 200) {
          return htmlToText(c.description);
        }
      }
    } catch {
      // ignore malformed JSON-LD
    }
  }
  return null;
}

// Adzuna detail pages embed the description inside <section class="adp-body">
// or a div with itemprop="description". Fall back to og:description.
function extractFromAdzuna(html: string): string | null {
  const sectionMatch = html.match(/<section[^>]*class="[^"]*adp-body[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
  if (sectionMatch) {
    const text = htmlToText(sectionMatch[1]);
    if (text.length > 300) return text;
  }
  const itempropMatch = html.match(/<[^>]+itemprop=["']description["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/i);
  if (itempropMatch) {
    const text = htmlToText(itempropMatch[1]);
    if (text.length > 300) return text;
  }
  return null;
}

// Adzuna detail pages link out to the original employer/aggregator page via an
// "Apply now" / "View original" button - usually under /jobs/land/ad/<id> which
// then 302-redirects to the real source. Following this gets the FULL description.
function extractAdzunaOutboundUrl(html: string, adzunaId?: string): string | null {
  if (adzunaId) {
    const re = new RegExp(`https?://[^"'\\s]*?/jobs?/land/ad/${adzunaId}[^"'\\s]*`, "i");
    const m = html.match(re);
    if (m) return m[0].replace(/&amp;/g, "&");
  }
  const landMatch = html.match(/https?:\/\/[^"'\s]*?\/jobs?\/land\/ad\/\d+[^"'\s]*/i);
  if (landMatch) return landMatch[0].replace(/&amp;/g, "&");
  return null;
}

async function followAdzunaRedirect(landUrl: string): Promise<string | null> {
  try {
    const res = await fetch(landUrl, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      redirect: "follow",
    });
    // After redirects, res.url is the final destination
    if (res.url && !/adzuna\./i.test(res.url)) return res.url;
  } catch (e) {
    console.warn("Adzuna redirect follow failed:", e);
  }
  return null;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("html") && !ctype.includes("xml")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Firecrawl fallback for sites that block direct fetch (Adzuna 429s, JS-heavy
// pages, etc.). Returns clean markdown which is even better than parsed HTML.
async function fetchViaFirecrawl(url: string): Promise<{ markdown?: string; html?: string } | null> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
        waitFor: 1500,
      }),
    });
    if (!res.ok) {
      console.warn(`Firecrawl ${res.status} for ${url}`);
      return null;
    }
    const json = await res.json();
    // v2 returns data on root or under .data depending on payload
    const doc = json.data || json;
    return { markdown: doc.markdown, html: doc.html };
  } catch (e) {
    console.warn("Firecrawl error:", e);
    return null;
  }
}

async function enrichDescription(url: string): Promise<string | null> {
  // Strategy 1: try direct fetch + JSON-LD / Adzuna selectors
  const html = await fetchHtml(url);
  console.log(`direct fetch ${url}: ${html ? `${html.length} bytes` : "null"}`);
  if (html) {
    const ld = extractFromJsonLd(html);
    if (ld && ld.length > 400) {
      console.log(`got ${ld.length} chars from JSON-LD direct`);
      return ld.slice(0, 8000);
    }

    if (/adzuna\.co\.uk|adzuna\.com/i.test(url)) {
      // Adzuna only shows a short teaser. Follow its outbound link to the real
      // employer/aggregator page and enrich from there.
      const adzunaIdMatch = url.match(/\/(?:details|jobs\/details)\/(\d+)/);
      const landUrl = extractAdzunaOutboundUrl(html, adzunaIdMatch?.[1]);
      console.log(`Adzuna land URL: ${landUrl}`);
      if (landUrl) {
        const sourceUrl = await followAdzunaRedirect(landUrl);
        console.log(`Adzuna source URL: ${sourceUrl}`);
        if (sourceUrl) {
          const sourceHtml = await fetchHtml(sourceUrl);
          if (sourceHtml) {
            const ld2 = extractFromJsonLd(sourceHtml);
            if (ld2 && ld2.length > 400) {
              console.log(`got ${ld2.length} chars from JSON-LD via Adzuna source`);
              return ld2.slice(0, 8000);
            }
          }
          // Source page likely needs JS - Firecrawl it
          const fcSource = await fetchViaFirecrawl(sourceUrl);
          if (fcSource?.html) {
            const ld3 = extractFromJsonLd(fcSource.html);
            if (ld3 && ld3.length > 400) {
              console.log(`got ${ld3.length} chars from JSON-LD via Firecrawl source`);
              return ld3.slice(0, 8000);
            }
          }
          if (fcSource?.markdown && fcSource.markdown.length > 600) {
            const cleaned = fcSource.markdown
              .split("\n")
              .filter((l) => !/^(cookie|accept all|sign in|register|menu|search jobs)$/i.test(l.trim()))
              .join("\n")
              .trim();
            console.log(`returning ${cleaned.length} chars from Firecrawl markdown source`);
            return cleaned.slice(0, 8000);
          }
        }
      }
      // Last resort on Adzuna: the (short) adp-body teaser
      const adz = extractFromAdzuna(html);
      if (adz) {
        console.log(`fallback ${adz.length} chars from Adzuna selectors direct`);
        return adz.slice(0, 8000);
      }
    }
  }

  // Strategy 2: Firecrawl fallback for the original URL (non-Adzuna sites)
  console.log("Trying Firecrawl fallback on original URL…");
  const fc = await fetchViaFirecrawl(url);
  console.log(`Firecrawl: markdown=${fc?.markdown?.length || 0} html=${fc?.html?.length || 0}`);
  if (fc) {
    if (fc.html) {
      const ld = extractFromJsonLd(fc.html);
      if (ld && ld.length > 400) return ld.slice(0, 8000);
    }
    if (fc.markdown && fc.markdown.length > 600) {
      const cleaned = fc.markdown
        .split("\n")
        .filter((l) => !/^(cookie|accept all|sign in|register|menu|search jobs)$/i.test(l.trim()))
        .join("\n")
        .trim();
      return cleaned.slice(0, 8000);
    }
  }

  if (!html) return null;

  const og = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  if (og && og[1].length > 200) return decodeEntities(og[1]);

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId } = await req.json();
    if (!jobId || typeof jobId !== "string") {
      return new Response(
        JSON.stringify({ error: "jobId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("id, url, description")
      .eq("id", jobId)
      .maybeSingle();

    if (jobErr || !job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Already enriched - return as-is
    if (job.description && job.description.length >= MIN_FULL_LENGTH) {
      return new Response(
        JSON.stringify({ description: job.description, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!job.url) {
      return new Response(
        JSON.stringify({ description: job.description || "", cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullText = await enrichDescription(job.url);
    if (!fullText || fullText.length <= (job.description?.length || 0)) {
      // Couldn't get anything better - return what we have
      return new Response(
        JSON.stringify({ description: job.description || "", cached: false, enriched: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cache to DB so future reads are instant
    await supabase.from("jobs").update({ description: fullText }).eq("id", jobId);

    return new Response(
      JSON.stringify({ description: fullText, cached: false, enriched: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("enrich-job-description error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
