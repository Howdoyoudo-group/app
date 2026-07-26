// Scrapes findapprenticeship.service.gov.uk (DfE's "Find an Apprenticeship").
//
// Sweeps a handful of keywords per industry (reusing INDUSTRY_REGISTRY's
// synonyms, same source of truth used by the Adzuna/Reed/DWP sweeps) and
// upserts results into `jobs`, tagged type: "Apprenticeship".
//
// Licence: content is published under the Open Government Licence v3.0
// (same permissive category as jobs.service.gov.uk, which we already
// scrape with GOV.UK attribution) - see
// https://developer.apprenticeships.education.gov.uk/third-party-accounts/terms-conditions
// Attribution wired up in src/components/AdzunaAttribution.tsx as the
// "govuk-apprenticeships" source, separate badge from the DWP Work Hub one.
//
// Unlike jobs.service.gov.uk, this site is plain server-rendered GOV.UK
// Design System HTML - no JS rendering needed, a direct fetch is enough.
// Verified live structure (searched via ?searchTerm=<kw>):
//   <li class="das-search-results__list-item">
//     <div class="faa-search_results__content">
//       <h2 class="das-search-results__heading">
//         <a class="das-search-results__link" href="/apprenticeship/{id}">
//           <span id="{id}-vacancy-title">{title}</span>
//         </a>
//       </h2>
//       <p class="govuk-body govuk-!-margin-bottom-0">{employer}</p>
//       <p class="govuk-body das-!-color-dark-grey">{location}</p>
//       <p><b>Start date</b> {date}</p>
//       <p><b>Training course</b> {course}</p>
//       <p><b>Wage</b> {wage}</p>
//     </div>
//   </li>
// Vacancy detail page: /apprenticeship/{id} (public, no sign-in).
//
// Usage: POST with optional body {"industries": ["fixing", "health"]} to
// scrape a subset. POST with empty body to sweep all industries.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { INDUSTRY_REGISTRY } from "../_shared/industry-registry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keep the daily sweep modest and polite, matching the DWP scraper's cadence.
const KEYWORDS_PER_INDUSTRY = 3;

const SEARCH_BASE = "https://www.findapprenticeship.service.gov.uk/apprenticeships";
const SITE_BASE = "https://www.findapprenticeship.service.gov.uk";

interface ApprenticeshipVacancy {
  title: string;
  url: string;
  company: string | null;
  location: string | null;
  wage: string | null;
  trainingCourse: string | null;
  startDate: string | null;
  closingSoon: boolean;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#xA3;/gi, "£")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Parse vacancy cards out of the server-rendered search results page.
function parseSearchResults(html: string): ApprenticeshipVacancy[] {
  const vacancies: ApprenticeshipVacancy[] = [];
  const cardRe = /href="\/apprenticeship\/([A-Za-z0-9]+)"[^>]*>\s*<span id="\1-vacancy-title">([^<]+)<\/span>/g;
  const matches: { id: string; title: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = cardRe.exec(html))) {
    matches.push({ id: m[1], title: decodeEntities(m[2]), index: m.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const { id, title, index } = matches[i];
    const end = i + 1 < matches.length ? matches[i + 1].index : Math.min(html.length, index + 3000);
    const block = html.slice(Math.max(0, index - 400), end);

    const employerMatch = block.match(/govuk-body govuk-!-margin-bottom-0">([^<]+)</);
    const company = employerMatch ? decodeEntities(employerMatch[1]) : null;

    const locationMatch = block.match(/govuk-body das-!-color-dark-grey">\s*([^<]+?)\s*</);
    const location = locationMatch ? decodeEntities(locationMatch[1]) : null;

    const startDateMatch = block.match(/<b>Start date<\/b>\s*([^<]+)</);
    const startDate = startDateMatch ? decodeEntities(startDateMatch[1]) : null;

    const courseMatch = block.match(/<b>Training course<\/b>\s*([^<]+)</);
    const trainingCourse = courseMatch ? decodeEntities(courseMatch[1]) : null;

    const wageMatch = block.match(/<b>Wage<\/b>\s*([^<]+)</);
    const wage = wageMatch ? decodeEntities(wageMatch[1]) : null;

    const closingSoon = /Closing soon/.test(block);

    vacancies.push({
      title,
      url: `${SITE_BASE}/apprenticeship/${id}`,
      company,
      location,
      wage,
      trainingCourse,
      startDate,
      closingSoon,
    });
  }
  return vacancies;
}

async function scrapeKeyword(keyword: string): Promise<ApprenticeshipVacancy[]> {
  const url = `${SEARCH_BASE}?searchTerm=${encodeURIComponent(keyword)}`;
  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HowdoyoudoBot/1.0)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!resp.ok) {
    console.warn(`[scrape-apprenticeships-gov] "${keyword}" ${resp.status}`);
    return [];
  }
  const html = await resp.text();
  return parseSearchResults(html);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
        const byUrl = new Map<string, ApprenticeshipVacancy>();
        for (const kw of keywords) {
          const vacancies = await scrapeKeyword(kw);
          for (const v of vacancies) byUrl.set(v.url, v);
          await new Promise((r) => setTimeout(r, 1000));
        }

        const vacancies = Array.from(byUrl.values());
        found = vacancies.length;

        if (vacancies.length > 0) {
          const rows = vacancies.map((v) => ({
            title: v.title,
            company: v.company || "Unknown employer",
            location: v.location,
            description: v.trainingCourse ? `Training course: ${v.trainingCourse}` : null,
            url: v.url,
            tags: [industry.name, "Apprenticeship", ...(v.closingSoon ? ["Closing soon"] : [])],
            industry: industry.slug,
            salary: v.wage,
            type: "Apprenticeship",
            work_mode: "On-site",
            featured: false,
            source_url: `${SEARCH_BASE}?searchTerm=${encodeURIComponent(keywords[0])}`,
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
      console.log(`[scrape-apprenticeships-gov] ${industry.slug}: found=${found} inserted=${inserted}${error ? ` error=${error}` : ""}`);
    }

    console.log("[scrape-apprenticeships-gov] done:", JSON.stringify(stats));
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
