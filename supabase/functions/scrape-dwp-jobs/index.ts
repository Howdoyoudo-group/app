// Scrapes jobs.service.gov.uk (DWP's "Work Hub", formerly Find a Job / findajob.dwp.gov.uk).
//
// Sweeps a handful of keywords per industry (reusing INDUSTRY_REGISTRY's
// synonyms, the same source of truth used by the Adzuna/Reed sweep in
// fetch-external-jobs) and upserts results into `jobs`.
//
// Terms of use (jobs.service.gov.uk/terms-of-use, checked 2026-07-26):
// "We allow reasonable use of computer tools to copy or scrape information.
// If you make use of a large amount of data in any way, you must attribute
// it to DWP." - hence the GOV.UK attribution badge wired up in
// src/components/AdzunaAttribution.tsx, and a modest per-industry keyword
// cap here rather than an aggressive multi-page sweep.
//
// The search results page (/jobs/search?keywords=...) is a JS-rendered
// Next.js app - the raw server HTML has no listings at all, so this needs
// Firecrawl's rendered rawHtml, not a plain fetch. Verified live structure:
//   <div data-testid="searchResultCard-{id}">
//     <a data-testid="jobTitle-{id}" href="/jobs/{id}/view">{title}</a>
//     <p data-testid="searchResultCardEmployer"><span>{company}</span><span> - {location}</span></p>
//     <p>{salary}</p>
//     <p data-testid="searchResultsCardTags"><span>{tag}</span>...</p>
//     <p data-testid="searchResultCardJobDescription">{description}</p>
//   </div>
// Job detail: /jobs/{id}/view, apply: /jobs/{id}/apply (both public, no sign-in).
//
// Usage: POST with optional body {"industries": ["fixing", "health"]} to
// scrape a subset. POST with empty body to sweep all industries.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { INDUSTRY_REGISTRY } from "../_shared/industry-registry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keep the daily sweep modest and polite - a handful of keywords per
// industry, not an exhaustive one, per the ToS's "reasonable use" wording.
const KEYWORDS_PER_INDUSTRY = 3;

const SEARCH_BASE = "https://www.jobs.service.gov.uk/jobs/search";
const SITE_BASE = "https://www.jobs.service.gov.uk";

interface DwpJob {
  title: string;
  url: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  tags: string[];
  description: string | null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
}

// Parse job cards out of the rendered page HTML - see structure notes above.
function parseSearchResults(html: string): DwpJob[] {
  const jobs: DwpJob[] = [];
  const cardRe = /data-testid="searchResultCard-([a-f0-9]+)"/g;
  const starts: { id: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = cardRe.exec(html))) {
    starts.push({ id: m[1], index: m.index });
  }

  for (let i = 0; i < starts.length; i++) {
    const { id, index } = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1].index : Math.min(html.length, index + 4000);
    const block = html.slice(index, end);

    const titleMatch = block.match(new RegExp(`data-testid="jobTitle-${id}"[^>]*>([^<]+)<`));
    const title = titleMatch ? decodeEntities(titleMatch[1]) : null;
    if (!title) continue;

    const employerMatch = block.match(/data-testid="searchResultCardEmployer"[^>]*>(.*?)<\/p>/s);
    let company: string | null = null;
    let location: string | null = null;
    if (employerMatch) {
      const spans = Array.from(employerMatch[1].matchAll(/<span[^>]*>(.*?)<\/span>/gs)).map((s) =>
        stripTags(s[1])
      );
      company = spans[0] || null;
      location = spans[1] ? spans[1].replace(/^-\s*/, "").trim() : null;
    }

    const salaryMatch = block.match(
      /<\/p>\s*<p class="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-2">([^<]*)<\/p>/
    );
    const salary = salaryMatch ? decodeEntities(salaryMatch[1]) || null : null;

    const tagsMatch = block.match(/data-testid="searchResultsCardTags"[^>]*>(.*?)<\/p>/s);
    const tags = tagsMatch
      ? Array.from(tagsMatch[1].matchAll(/<span[^>]*>([^<]*)<\/span>/g)).map((s) => decodeEntities(s[1]))
      : [];

    const descMatch = block.match(/data-testid="searchResultCardJobDescription"[^>]*>([^<]*)</);
    const description = descMatch ? decodeEntities(descMatch[1]).slice(0, 1000) : null;

    jobs.push({
      title,
      url: `${SITE_BASE}/jobs/${id}/view`,
      company,
      location,
      salary,
      tags,
      description,
    });
  }
  return jobs;
}

async function scrapeKeyword(keyword: string, apiKey: string): Promise<DwpJob[]> {
  const url = `${SEARCH_BASE}?keywords=${encodeURIComponent(keyword)}`;
  const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["rawHtml"], waitFor: 3000 }),
    signal: AbortSignal.timeout(25000),
  });
  if (!resp.ok) {
    console.warn(`[scrape-dwp-jobs] "${keyword}" firecrawl ${resp.status}`);
    return [];
  }
  const data = await resp.json();
  const html: string = data?.data?.rawHtml || "";
  if (!html) return [];
  return parseSearchResults(html);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const FIRECRAWL = Deno.env.get("FIRECRAWL_API_KEY");

  if (!FIRECRAWL) {
    return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY not set" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: { industries?: string[] } = {};
  try { body = await req.json(); } catch { /* allow empty */ }

  const targets = body.industries?.length
    ? INDUSTRY_REGISTRY.filter((i) => body.industries!.includes(i.slug))
    : INDUSTRY_REGISTRY;

  const work = (async () => {
    const stats: Array<{ industry: string; found: number; inserted: number; error?: string }> = [];

    for (const industry of targets) {
      const keywords = industry.synonyms.slice(0, KEYWORDS_PER_INDUSTRY);
      let found = 0;
      let inserted = 0;
      let error: string | undefined;

      try {
        const byUrl = new Map<string, DwpJob>();
        for (const kw of keywords) {
          const jobs = await scrapeKeyword(kw, FIRECRAWL);
          for (const j of jobs) byUrl.set(j.url, j);
          await new Promise((r) => setTimeout(r, 1500));
        }

        const jobs = Array.from(byUrl.values());
        found = jobs.length;

        if (jobs.length > 0) {
          const rows = jobs.map((j) => ({
            title: j.title,
            company: j.company || "Unknown employer",
            location: j.location,
            description: j.description,
            url: j.url,
            tags: [industry.name, ...j.tags],
            industry: industry.slug,
            salary: j.salary,
            type: j.tags.find((t) => /full time|part time|contract|temporary|apprenticeship/i.test(t)) || "Full-time",
            work_mode: j.tags.find((t) => /remote|hybrid|on-site/i.test(t)) || "On-site",
            featured: false,
            source_url: `${SEARCH_BASE}?keywords=${encodeURIComponent(keywords[0])}`,
          }));

          const { data: insertedRows, error: insertErr } = await supabase
            .from("jobs")
            .upsert(rows, { onConflict: "url", ignoreDuplicates: true })
            .select("id");

          if (insertErr) {
            error = insertErr.message;
          } else {
            inserted = insertedRows?.length ?? 0;
          }
        }
      } catch (e) {
        error = (e as Error).message;
      }

      stats.push({ industry: industry.slug, found, inserted, ...(error ? { error } : {}) });
      console.log(`[scrape-dwp-jobs] ${industry.slug}: found=${found} inserted=${inserted}${error ? ` error=${error}` : ""}`);
    }

    console.log("[scrape-dwp-jobs] done:", JSON.stringify(stats));
  })();

  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
    (EdgeRuntime as any).waitUntil(work);
  } else {
    await work;
  }

  return new Response(
    JSON.stringify({ accepted: true, queued: targets.length, industries: targets.map((i) => i.slug) }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
