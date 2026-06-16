// fetch-cvlibrary-jobs
// Streams the CV-Library affiliate XML feed (full UK market, ~270MB+) and
// keeps only jobs relevant to HDYD's industries, using the synonym lists in
// the shared industry registry. The feed is never buffered in full — it's
// read and parsed chunk-by-chunk so memory stays flat regardless of feed size.
//
// IMPORTANT: every job URL from CV-Library carries an affiliate tracking
// parameter (?s=<affid>). This MUST be preserved exactly as supplied —
// stripping it loses attribution and commission for HDYD.
//
// Cron: nightly, alongside other job sources.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { INDUSTRY_REGISTRY } from "../_shared/industry-registry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CV_LIBRARY_AFFID = Deno.env.get("CV_LIBRARY_AFFID") || "107508";
const FEED_URL = `https://www.cv-library.co.uk/cgi-bin/feed.xml?affid=${CV_LIBRARY_AFFID}`;

// Hard caps so a single invocation can't run forever or blow Edge Function limits.
const MAX_JOBS_TO_INSERT = 3000;   // generous — most runs will be far fewer matches
const MAX_RUNTIME_MS = 110_000;    // leave headroom under the ~150s edge timeout
const INSERT_BATCH_SIZE = 200;

// Build one relevance regex per industry from the shared synonym list.
// Reused from the same approach as fetch-external-jobs/validate-jobs.
const INDUSTRY_RELEVANCE: { slug: string; regex: RegExp }[] = INDUSTRY_REGISTRY.map((spec) => {
  const escaped = spec.synonyms
    .filter((s) => s.length > 2) // skip ultra-short synonyms that cause false positives
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = `\\b(${escaped.join("|")})\\b`;
  return { slug: spec.slug, regex: new RegExp(pattern, "i") };
});

function classifyIndustry(title: string, description: string): string | null {
  const combined = `${title} ${description}`;
  for (const { slug, regex } of INDUSTRY_RELEVANCE) {
    if (regex.test(combined)) return slug;
  }
  return null;
}

// Cross-industry noise that should never be imported regardless of keyword match —
// mirrors the tech-role guard in fetch-external-jobs.
const TECH_ROLE_REGEX = /\b(cyber security|cybersecurity|it support|software engineer|devops|sre|data engineer|cloud engineer|java developer|\.net developer|salesforce developer|sap consultant|oracle dba|backend engineer|frontend engineer|full[- ]?stack|qa engineer|systems engineer|network engineer)\b/i;

interface ParsedJob {
  jobref: string;
  title: string;
  company: string;
  url: string;
  location: string;
  description: string;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  jobtype: string | null;
  date: string | null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&pound;/g, "£");
}

function extractTag(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return m ? decodeEntities(m[1].trim()) : "";
}

// CV-Library's basic affiliate feed does not expose the real hiring employer —
// every <company> tag in the feed is literally the string "CV-Library" itself
// (confirmed across 80k+ sampled jobs). Showing that as the employer name would
// mislead users into thinking CV-Library is hiring for every role. Until/unless
// a richer feed tier exposes the real employer, label it honestly as an
// aggregator listing rather than a fabricated company name.
const FEED_COMPANY_PLACEHOLDER = "Confidential Employer (via CV-Library)";

function parseJobBlock(block: string): ParsedJob | null {
  const jobref = extractTag(block, "jobref");
  const title = extractTag(block, "title");
  const url = extractTag(block, "url");
  if (!jobref || !title || !url) return null;

  const salaryMinStr = extractTag(block, "salarymin");
  const salaryMaxStr = extractTag(block, "salarymax");

  const rawCompany = extractTag(block, "company");
  const company = !rawCompany || rawCompany.trim().toLowerCase() === "cv-library"
    ? FEED_COMPANY_PLACEHOLDER
    : rawCompany;

  return {
    jobref,
    title,
    company,
    url,
    location: extractTag(block, "location"),
    description: extractTag(block, "description"),
    salary: extractTag(block, "salary") || null,
    salaryMin: salaryMinStr ? parseFloat(salaryMinStr) : null,
    salaryMax: salaryMaxStr ? parseFloat(salaryMaxStr) : null,
    jobtype: extractTag(block, "jobtype") || null,
    date: extractTag(block, "date") || null,
  };
}

function mapToRow(job: ParsedJob, industry: string) {
  // The feed's <url> already contains the affiliate tracking param (?s=<affid>).
  // Never modify or strip it.
  return {
    title: job.title.slice(0, 500),
    company: job.company.slice(0, 250),
    url: job.url,
    location: job.location || null,
    description: job.description ? job.description.slice(0, 5000) : null,
    salary: job.salary,
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    type: job.jobtype,
    industry,
    source_url: "cv-library.co.uk",
    expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
    scraped_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const startTime = Date.now();

  const work = (async () => {
    const stats = {
      jobs_scanned: 0,
      jobs_matched: 0,
      jobs_inserted: 0,
      by_industry: {} as Record<string, number>,
      stopped_reason: "completed" as string,
    };

    let pendingBatch: ReturnType<typeof mapToRow>[] = [];

    async function flushBatch() {
      if (pendingBatch.length === 0) return;
      const { error, data } = await supabase
        .from("jobs")
        .upsert(pendingBatch, { onConflict: "url" })
        .select("id");
      if (error) {
        // Fall back to row-by-row on conflict with the other unique index
        for (const row of pendingBatch) {
          const { error: rowErr } = await supabase.from("jobs").upsert(row, { onConflict: "url" });
          if (!rowErr) stats.jobs_inserted++;
        }
      } else {
        stats.jobs_inserted += data?.length ?? pendingBatch.length;
      }
      pendingBatch = [];
    }

    try {
      const res = await fetch(FEED_URL);
      if (!res.ok || !res.body) {
        throw new Error(`Feed fetch failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      outer: while (true) {
        if (Date.now() - startTime > MAX_RUNTIME_MS) {
          stats.stopped_reason = "time_limit";
          break;
        }
        if (stats.jobs_inserted >= MAX_JOBS_TO_INSERT) {
          stats.stopped_reason = "job_cap";
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Extract complete <job>...</job> blocks from the buffer as they arrive.
        let jobStart = buffer.indexOf("<job>");
        let jobEnd = buffer.indexOf("</job>");
        while (jobStart !== -1 && jobEnd !== -1 && jobEnd > jobStart) {
          const block = buffer.slice(jobStart, jobEnd + "</job>".length);
          buffer = buffer.slice(jobEnd + "</job>".length);

          const job = parseJobBlock(block);
          if (job) {
            stats.jobs_scanned++;

            if (!TECH_ROLE_REGEX.test(job.title)) {
              const industry = classifyIndustry(job.title, job.description);
              if (industry) {
                stats.jobs_matched++;
                stats.by_industry[industry] = (stats.by_industry[industry] ?? 0) + 1;
                pendingBatch.push(mapToRow(job, industry));
                if (pendingBatch.length >= INSERT_BATCH_SIZE) {
                  await flushBatch();
                }
              }
            }
          }

          if (Date.now() - startTime > MAX_RUNTIME_MS || stats.jobs_inserted >= MAX_JOBS_TO_INSERT) {
            await flushBatch();
            stats.stopped_reason = stats.jobs_inserted >= MAX_JOBS_TO_INSERT ? "job_cap" : "time_limit";
            reader.cancel().catch(() => {});
            break outer;
          }

          jobStart = buffer.indexOf("<job>");
          jobEnd = buffer.indexOf("</job>");
        }

        // Prevent unbounded buffer growth if a malformed block never closes
        if (buffer.length > 2_000_000) {
          buffer = buffer.slice(-500_000);
        }
      }

      await flushBatch();
    } catch (err) {
      console.error("[fetch-cvlibrary-jobs] error:", err);
      stats.stopped_reason = `error: ${String(err)}`;
    }

    console.log("[fetch-cvlibrary-jobs] Run complete:", JSON.stringify(stats, null, 2));
  })();

  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
    (EdgeRuntime as any).waitUntil(work);
  } else {
    await work;
  }

  return new Response(
    JSON.stringify({ accepted: true, message: "CV-Library import running in background — check function logs for results" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
