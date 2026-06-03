// scrape-film-boards
// Pulls UK Film & TV jobs from JS-heavy boards (Production Guild, Creative
// Access, The Dots) using Firecrawl JSON extraction with a long waitFor so
// client-side rendered listings have time to appear. Upserts into the jobs
// table tagged industry=cinema.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

type FilmJob = {
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  description: string | null;
  type: string | null;
};

const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    jobs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Job/role title" },
          company: { type: "string", description: "Employer, production company, or agency" },
          location: { type: "string", description: "City, region, or 'Remote'" },
          url: { type: "string", description: "Absolute URL to the job detail page" },
          description: { type: "string", description: "Short summary or tagline" },
          type: { type: "string", description: "Contract type (Freelance, Full-time, etc.) if shown" },
        },
        required: ["title", "url"],
      },
    },
  },
  required: ["jobs"],
};

type Source = {
  name: string;
  url: string;
  domain: string;
  waitFor: number;
};

const SOURCES: Source[] = [
  {
    name: "Production Guild",
    url: "https://productionguild.com/member-resources/job-opportunities/",
    domain: "productionguild.com",
    waitFor: 6000,
  },
  {
    name: "Creative Access",
    url: "https://opportunities.creativeaccess.org.uk/jobs/film-tv-radio-audio",
    domain: "opportunities.creativeaccess.org.uk",
    waitFor: 8000,
  },
  {
    name: "The Dots",
    url: "https://the-dots.com/jobs/search/film-jobs",
    domain: "the-dots.com",
    waitFor: 8000,
  },
];

async function firecrawlExtract(source: Source, apiKey: string): Promise<FilmJob[]> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: source.url,
        formats: [
          {
            type: "json",
            schema: EXTRACT_SCHEMA,
            prompt:
              "Extract every Film, TV, broadcast, video, post-production, or audio job listing on this page. Include freelance gigs, runners, assistants, technical and creative roles. Skip navigation, login, or category links. The url must be the absolute URL to the listing detail page.",
          },
        ],
        onlyMainContent: false,
        waitFor: source.waitFor,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`Firecrawl ${source.name} failed [${res.status}]:`, JSON.stringify(data).slice(0, 400));
      return [];
    }

    const extracted =
      data?.data?.json?.jobs ??
      data?.json?.jobs ??
      data?.data?.extract?.jobs ??
      [];
    if (!Array.isArray(extracted)) return [];
    console.log(`${source.name}: extracted ${extracted.length} jobs`);
    return extracted as FilmJob[];
  } catch (err) {
    console.error(`Firecrawl ${source.name} threw:`, err);
    return [];
  }
}

function normalize(j: FilmJob, source: Source) {
  const title = (j.title || "").trim().slice(0, 255);
  const company = (j.company || "").trim().slice(0, 200) || source.name;
  let url = (j.url || "").trim();
  if (!title || !url) return null;
  // Make absolute URL
  if (url.startsWith("/")) {
    try {
      url = new URL(url, `https://${source.domain}`).toString();
    } catch {
      return null;
    }
  }
  if (!/^https?:\/\//i.test(url)) return null;

  // Filter out obvious nav/category links
  const lowerUrl = url.toLowerCase();
  if (
    lowerUrl.endsWith("/jobs") ||
    lowerUrl.endsWith("/jobs/") ||
    lowerUrl.includes("/category/") ||
    lowerUrl.includes("/search/") && !lowerUrl.match(/\d/) ||
    lowerUrl.includes("/login") ||
    lowerUrl.includes("/signup") ||
    lowerUrl.includes("/register")
  ) {
    return null;
  }

  return {
    title,
    company,
    industry: "cinema",
    location: (j.location || null)?.toString().slice(0, 200) ?? null,
    type: (j.type || "Freelance").toString().slice(0, 50),
    salary: null,
    description: (j.description || null)?.toString().slice(0, 2000) ?? null,
    url: url.slice(0, 500),
    source_url: source.domain,
    expires_at: new Date(Date.now() + 45 * 86400000).toISOString(),
    tags: ["Film", "TV", source.name],
    needs_review: true,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!apiKey || !supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required env vars" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let body: { source?: string } = {};
    try {
      body = await req.json();
    } catch (_) {
      // no body - scrape all
    }

    const targets = body.source
      ? SOURCES.filter((s) => s.name.toLowerCase() === body.source!.toLowerCase())
      : SOURCES;

    if (targets.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: `Unknown source: ${body.source}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const perSource: Record<string, { fetched: number; inserted: number; skippedExisting: number }> = {};
    const errors: string[] = [];
    const allJobs: ReturnType<typeof normalize>[] = [];

    for (const source of targets) {
      try {
        const raw = await firecrawlExtract(source, apiKey);
        const normalized = raw.map((j) => normalize(j, source)).filter(Boolean);
        // Dedupe within source by url
        const seen = new Set<string>();
        const unique = normalized.filter((j) => {
          if (!j) return false;
          if (seen.has(j.url)) return false;
          seen.add(j.url);
          return true;
        });

        // Skip jobs that already exist
        let skippedExisting = 0;
        const toInsert: typeof unique = [];
        if (unique.length > 0) {
          const { data: existing } = await supabase
            .from("jobs")
            .select("url")
            .in("url", unique.map((j) => j!.url));
          const existingSet = new Set((existing || []).map((r: { url: string }) => r.url));
          for (const j of unique) {
            if (j && existingSet.has(j.url)) {
              skippedExisting++;
            } else if (j) {
              toInsert.push(j);
            }
          }
        }

        perSource[source.name] = {
          fetched: raw.length,
          inserted: toInsert.length,
          skippedExisting,
        };
        allJobs.push(...toInsert);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Source ${source.name} failed:`, msg);
        errors.push(`${source.name}: ${msg}`);
      }
    }

    // Insert in batches of 50
    let inserted = 0;
    for (let i = 0; i < allJobs.length; i += 50) {
      const batch = allJobs.slice(i, i + 50).filter(Boolean);
      if (batch.length === 0) continue;
      const { error } = await supabase.from("jobs").upsert(batch as any, { onConflict: "url" });
      if (error) {
        console.error("Upsert batch failed:", error.message);
        errors.push(`upsert: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalInserted: inserted,
        perSource,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("scrape-film-boards crashed:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
