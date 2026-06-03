// scrape-graduate-boards
// Pulls UK internships + graduate schemes from RateMyPlacement, Milkround,
// and Prospects.ac.uk via Firecrawl JSON extraction, then upserts into the
// jobs table tagged as type=Internship, career_level=entry.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

type GradJob = {
  title: string;
  company: string;
  location: string | null;
  url: string;
  description: string | null;
  deadline: string | null;
};

const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    jobs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Job/programme title" },
          company: { type: "string", description: "Employer or company name" },
          location: { type: "string", description: "City or 'Remote' or 'UK-wide'" },
          url: { type: "string", description: "Direct link to the listing detail page" },
          description: { type: "string", description: "Short summary or tagline" },
          deadline: { type: "string", description: "Application deadline if shown (free text)" },
        },
        required: ["title", "company", "url"],
      },
    },
  },
  required: ["jobs"],
};

async function firecrawlExtract(url: string, apiKey: string): Promise<GradJob[]> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: [
          {
            type: "json",
            schema: EXTRACT_SCHEMA,
            prompt:
              "Extract every internship, placement year, summer scheme, spring week, or graduate programme listed on this page. Return only listings, not navigation links. The url must be the absolute URL of each listing detail page.",
          },
        ],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`Firecrawl ${url} failed [${res.status}]:`, JSON.stringify(data).slice(0, 300));
      return [];
    }

    const extracted =
      data?.data?.json?.jobs ??
      data?.json?.jobs ??
      data?.data?.extract?.jobs ??
      [];
    if (!Array.isArray(extracted)) return [];
    return extracted as GradJob[];
  } catch (err) {
    console.error(`Firecrawl ${url} threw:`, err);
    return [];
  }
}

function normalize(j: GradJob, source: string, sourceDomain: string) {
  const title = (j.title || "").trim().slice(0, 255);
  const company = (j.company || "").trim().slice(0, 200) || source;
  let url = (j.url || "").trim();
  if (!title || !url) return null;
  // Make sure URL is absolute
  if (url.startsWith("/")) {
    try {
      url = new URL(url, `https://${sourceDomain}`).toString();
    } catch {
      return null;
    }
  }
  return {
    title,
    company,
    industry: "graduate", // placeholder - classify-jobs reassigns via AI
    location: (j.location || null)?.toString().slice(0, 200) ?? null,
    type: "Internship",
    career_level: "entry",
    salary: null,
    description: (j.description || null)?.toString().slice(0, 2000) ?? null,
    url: url.slice(0, 500),
    source_url: sourceDomain,
    expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
    tags: ["Graduate", "Internship", source],
    needs_review: true,
  };
}

const SOURCES = [
  {
    name: "Higherin",
    domain: "higherin.com",
    pages: [
      "https://higherin.com/search-jobs/internships",
      "https://higherin.com/search-jobs/placements",
      "https://higherin.com/search-jobs/graduates",
      "https://higherin.com/search-jobs/graduate-scheme",
      "https://higherin.com/search-jobs/insights",
      "https://higherin.com/search-jobs/apprenticeships",
    ],
  },
  {
    name: "Milkround",
    domain: "milkround.com",
    pages: [
      "https://www.milkround.com/jobs/graduate-scheme",
      "https://www.milkround.com/jobs/internship",
    ],
  },
  {
    name: "Prospects",
    domain: "prospects.ac.uk",
    pages: [
      "https://www.prospects.ac.uk/graduate-jobs",
      "https://www.prospects.ac.uk/graduate-jobs/internships",
    ],
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase env vars missing");
    }
    if (!firecrawlKey) {
      throw new Error("FIRECRAWL_API_KEY missing - connect the Firecrawl connector");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Optional body: { source?: string, page?: string }
    // - If `page` is supplied, scrape only that single URL (fast, fits in timeout).
    // - If `source` is supplied, scrape only that source's pages.
    // - Otherwise, scrape all sources (may time out on cold gateway).
    let onlySource: string | null = null;
    let onlyPage: string | null = null;
    try {
      const body = await req.json();
      if (body?.source && typeof body.source === "string") onlySource = body.source;
      if (body?.page && typeof body.page === "string") onlyPage = body.page;
    } catch {
      /* no body, run all */
    }

    let totalFetched = 0;
    let totalInserted = 0;
    let totalSkipped = 0;
    const perSource: Record<string, { fetched: number; inserted: number; skipped: number }> = {};
    const errors: string[] = [];

    for (const src of SOURCES) {
      if (onlySource && src.name !== onlySource) continue;
      const pagesToRun = onlyPage ? src.pages.filter((p) => p === onlyPage) : src.pages;
      if (pagesToRun.length === 0) continue;
      let fetched = 0;
      const collected: ReturnType<typeof normalize>[] = [];

      for (const page of pagesToRun) {
        console.log(`[${src.name}] scraping ${page}`);
        const raw = await firecrawlExtract(page, firecrawlKey);
        console.log(`[${src.name}] ${page} -> ${raw.length} raw`);
        fetched += raw.length;
        for (const j of raw) {
          const norm = normalize(j, src.name, src.domain);
          if (norm) collected.push(norm);
        }
      }

      const seen = new Set<string>();
      const unique = collected.filter((j) => {
        if (!j) return false;
        if (seen.has(j.url)) return false;
        seen.add(j.url);
        return true;
      });
      console.log(`[${src.name}] unique=${unique.length}`);

      const urls = unique.map((j) => j!.url);
      let existingUrls = new Set<string>();
      if (urls.length > 0) {
        const { data: existing, error: exErr } = await supabase
          .from("jobs")
          .select("url")
          .in("url", urls.slice(0, 500));
        if (exErr) console.error(`[${src.name}] existing lookup error:`, exErr.message);
        existingUrls = new Set((existing || []).map((e: any) => e.url));
      }
      const toInsert = unique.filter((j) => j && !existingUrls.has(j!.url));
      console.log(`[${src.name}] toInsert=${toInsert.length}`);

      let inserted = 0;
      for (let i = 0; i < toInsert.length; i += 50) {
        const batch = toInsert.slice(i, i + 50);
        const { error, data } = await supabase.from("jobs").insert(batch).select("id");
        if (error) {
          console.error(`Insert error [${src.name}]:`, error.message);
          errors.push(`${src.name}: ${error.message}`);
        } else {
          inserted += data?.length || 0;
        }
      }

      const skipped = unique.length - inserted;
      perSource[src.name] = { fetched, inserted, skipped };
      totalFetched += fetched;
      totalInserted += inserted;
      totalSkipped += skipped;
      console.log(`[${src.name}] fetched=${fetched}, inserted=${inserted}, skipped=${skipped}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalFetched,
        totalInserted,
        totalSkipped,
        perSource,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("scrape-graduate-boards error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
