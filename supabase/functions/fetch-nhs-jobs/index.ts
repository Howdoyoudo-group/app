// fetch-nhs-jobs
// Scrapes the public NHS Jobs (jobs.nhs.uk) search results and ingests
// vacancies into public.jobs under the "health" industry.
//
// Why: NHS Jobs is the single largest employer in UK healthcare with 13k+
// live vacancies. Adzuna under-indexes NHS Trust feeds, so a dedicated
// fetcher gives Health a much richer signal.
//
// Approach: NHS Jobs renders results server-side as predictable HTML with
// stable `data-test` attributes (per gov.uk frontend conventions). We page
// through results, parse the structured fields, classify into the Health
// value-chain stages, and upsert on URL.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Health value-chain stages (mirrors fetch-external-jobs) ──────────
// "Doctors & Clinicians", "Nursing & Midwifery", "Care & Social Care",
// "Allied Health & Pharmacy", "MedTech, Biotech & Pharma",
// "Health Leadership & Policy"
function classifyNhsRole(title: string): { stage: string; level: string } {
  const t = title.toLowerCase();

  let stage = "Doctors & Clinicians"; // sensible default for NHS

  if (/\b(nurse|nursing|midwife|midwifery|health visitor|hca|healthcare assistant)\b/.test(t)) {
    stage = "Nursing & Midwifery";
  } else if (/\b(care assistant|support worker|care worker|social worker|live[- ]in|residential|domiciliary|carer)\b/.test(t)) {
    stage = "Care & Social Care";
  } else if (/\b(pharmacist|pharmacy|radiograph|sonograph|physio|occupational therap|dietitian|dietician|speech (and|&) language|paramedic|operating department practitioner|odp|biomedical scientist|cytolog|pathology|optometrist|orthoptist|podiatr|prosthet|orthotist|psychotherap|psycholog|counsellor|cbt|iapt|pwp|art therap|music therap)\b/.test(t)) {
    stage = "Allied Health & Pharmacy";
  } else if (/\b(medtech|medical device|biotech|pharma|clinical research|clinical trial|laborator|r&d|research scientist|genomic|bioinformat|regulatory affairs|medicinal)\b/.test(t)) {
    stage = "MedTech, Biotech & Pharma";
  } else if (/\b(chief|director|head of|deputy|associate director|board|trust executive|workforce|hr business partner|finance manager|service manager|programme manager|policy|commissioning|governance|transformation lead)\b/.test(t)) {
    stage = "Health Leadership & Policy";
  } else if (/\b(consultant|gp|general practitioner|registrar|specialty doctor|specialist doctor|senior house officer|sho|f1|f2|foundation doctor|core trainee|st\d|doctor|surgeon|psychiatrist|anaesthet|dentist|dental)\b/.test(t)) {
    stage = "Doctors & Clinicians";
  } else if (/\b(receptionist|admin|administrator|secretary|coordinator|clerk|porter|cleaner|estates|catering|domestic|booking|ward clerk)\b/.test(t)) {
    // Operations support - bucket under leadership/policy as the closest match
    stage = "Health Leadership & Policy";
  }

  // Career level - NHS bands as primary signal
  let level = "mid";
  const bandMatch = t.match(/\bband\s*(\d)\b/);
  if (bandMatch) {
    const band = parseInt(bandMatch[1]);
    if (band <= 4) level = "entry";
    else if (band <= 6) level = "mid";
    else if (band <= 7) level = "senior";
    else level = "executive";
  } else if (/\b(consultant|chief|director|head of|principal|executive|cmo|cno|coo|ceo)\b/.test(t)) {
    level = "executive";
  } else if (/\b(senior|lead|principal|specialist|advanced practitioner|nurse practitioner)\b/.test(t)) {
    level = "senior";
  } else if (/\b(trainee|apprentice|graduate|student|f1|f2|foundation|junior|assistant)\b/.test(t)) {
    level = "entry";
  }

  return { stage, level };
}

// ── HTML utilities ───────────────────────────────────────────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&pound;/g, "£");
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

interface ParsedJob {
  url: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  publicationDate: string | null;
  closingDate: string | null;
  jobType: string | null;
  workingPattern: string | null;
}

// Parse one <li class="search-result"> chunk
function parseResult(block: string): ParsedJob | null {
  const titleMatch = block.match(
    /<a\s+href="([^"]+jobadvert\/[^"]+)"[^>]*data-test="search-result-job-title"[^>]*>\s*([^<]+?)\s*<\/a>/i,
  );
  if (!titleMatch) return null;

  let url = decodeEntities(titleMatch[1]);
  const title = stripTags(titleMatch[2]);
  // Normalise URL: drop the search query suffix, keep canonical jobadvert path
  url = url.split("?")[0];
  // NHS Jobs anchors are relative (e.g. "/candidate/jobadvert/X"). Make
  // absolute so url + source_url are valid URLs (the daily report buckets by
  // hostname via `new URL(...)`, which silently drops relative paths).
  if (url.startsWith("/")) {
    url = `https://www.jobs.nhs.uk${url}`;
  } else if (!/^https?:\/\//i.test(url)) {
    url = `https://www.jobs.nhs.uk/${url.replace(/^\/+/, "")}`;
  }

  // Employer name + location - anchor on location-font-size which only
  // appears in real result blocks (not the NHS Talking Therapies promo).
  let company = "NHS";
  let location = "United Kingdom";
  const locInner = block.match(
    /data-test="search-result-location"[^>]*>\s*<h3[^>]*>([\s\S]*?)<div\s+class="location-font-size"[^>]*>([\s\S]*?)<\/div>\s*<\/h3>/i,
  );
  if (locInner) {
    const companyRaw = stripTags(locInner[1]);
    if (companyRaw) company = companyRaw;
    const loc = stripTags(locInner[2]).replace(/,\s*$/, "");
    if (loc) location = loc;
  }

  const salaryMatch = block.match(
    /data-test="search-result-salary"[^>]*>[\s\S]*?<strong[^>]*>([\s\S]*?)<\/strong>/i,
  );
  const pubMatch = block.match(
    /data-test="search-result-publicationDate"[^>]*>[\s\S]*?<strong[^>]*>([\s\S]*?)<\/strong>/i,
  );
  const closeMatch = block.match(
    /data-test="search-result-closingDate"[^>]*>[\s\S]*?<strong[^>]*>([\s\S]*?)<\/strong>/i,
  );
  const jobTypeMatch = block.match(
    /data-test="search-result-jobType"[^>]*>[\s\S]*?<strong[^>]*>([\s\S]*?)<\/strong>/i,
  );
  const wpMatch = block.match(
    /data-test="search-result-workingPattern"[^>]*>[\s\S]*?<strong[^>]*>([\s\S]*?)<\/strong>/i,
  );

  return {
    url,
    title,
    company,
    location,
    salary: salaryMatch ? stripTags(salaryMatch[1]) : null,
    publicationDate: pubMatch ? stripTags(pubMatch[1]) : null,
    closingDate: closeMatch ? stripTags(closeMatch[1]) : null,
    jobType: jobTypeMatch ? stripTags(jobTypeMatch[1]) : null,
    workingPattern: wpMatch ? stripTags(wpMatch[1]) : null,
  };
}

function splitResults(html: string): string[] {
  // Split on the closing </li> of each search-result panel.
  const blocks: string[] = [];
  const regex = /<li[^>]*class="[^"]*search-result[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    blocks.push(m[1]);
  }
  return blocks;
}

// Parse "28 May 2026" → ISO timestamp
function parseUkDate(s: string | null): string | null {
  if (!s) return null;
  const d = new Date(s + " UTC");
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function fetchPage(page: number): Promise<string | null> {
  const url =
    `https://www.jobs.nhs.uk/candidate/search/results?language=en&keyword=&location=&distance=10` +
    `&page=${page}&sort=publicationDateDesc`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0; +https://howdoyoudo.group)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      console.warn(`NHS page ${page} status ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.warn(`NHS page ${page} fetch error`, e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: { maxPages?: number } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }
  // NHS Jobs publishes ~12k live vacancies (~1,200 result pages of 10).
  // Default to 60 pages (~600 jobs) per run, ceiling 200 (~2,000) to stay
  // well within the 150s edge-function budget. Two daily runs give us
  // strong coverage and rapid expiry detection on the freshest postings.
  const maxPages = Math.min(Math.max(body.maxPages ?? 60, 1), 200);

  const collected: ParsedJob[] = [];
  for (let p = 1; p <= maxPages; p++) {
    const html = await fetchPage(p);
    if (!html) break;
    const blocks = splitResults(html);
    if (blocks.length === 0) break;
    for (const b of blocks) {
      const parsed = parseResult(b);
      if (parsed) collected.push(parsed);
    }
    // Stop early if NHS returned a short page (last page).
    if (blocks.length < 10) break;
  }

  console.log(`NHS Jobs: collected ${collected.length} listings across up to ${maxPages} pages`);

  // De-dupe by URL within this run
  const seen = new Set<string>();
  const unique = collected.filter((j) => {
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  // Map to jobs schema
  const rows = unique.map((j) => {
    const { stage, level } = classifyNhsRole(j.title);
    const description = [
      j.salary ? `Salary: ${j.salary}` : null,
      j.jobType ? `Contract: ${j.jobType}` : null,
      j.workingPattern ? `Pattern: ${j.workingPattern}` : null,
      j.publicationDate ? `Posted: ${j.publicationDate}` : null,
      j.closingDate ? `Closes: ${j.closingDate}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary && /£/.test(j.salary) ? j.salary : null,
      description: description || `${j.title} at ${j.company}`,
      url: j.url,
      industry: "health",
      type: j.jobType?.toLowerCase().includes("permanent") ? "Full-time" : (j.jobType || "Full-time"),
      work_mode: j.workingPattern?.toLowerCase().includes("remote") ? "Remote" : "On-site",
      tags: ["NHS"],
      value_chain_stage: stage,
      role_category: j.title,
      career_level: level,
      source_url: j.url,
      expires_at: parseUkDate(j.closingDate),
    };
  });

  let inserted = 0;
  let errored = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { data, error } = await supabase
      .from("jobs")
      .upsert(batch, { onConflict: "url", ignoreDuplicates: true })
      .select("id");
    if (error) {
      // Likely a (title,company,location) unique-violation; retry per row.
      for (const row of batch) {
        const { data: oneData, error: oneErr } = await supabase
          .from("jobs")
          .upsert([row], { onConflict: "url", ignoreDuplicates: true })
          .select("id");
        if (oneErr) errored++;
        else inserted += oneData?.length || 0;
      }
    } else {
      inserted += data?.length || 0;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      pagesAttempted: maxPages,
      collected: collected.length,
      uniqueParsed: unique.length,
      inserted,
      errored,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
