// Scrapes ALL National Careers Service (NCS) job profiles into their own
// free-standing catalog, keyed by NCS's own slug - NOT our roles.ts slug.
// This is separate from scrape-ncs-roles/role_metadata (which covers only
// the 71 roles with a clean 1:1 mapping to our own role pages). It exists
// to fuzzy-match CareerMap tile role names that have no roles.ts equivalent,
// so those tiles can show real facts instead of an AI-improvised blurb.
// See src/data/career-map-role-resolver.ts's resolveNcsCatalogMatch().
//
// Usage:
//   POST {"action": "enumerate"}
//     Fetches the NCS sitemap, seeds every /job-profiles/{slug} as a
//     pending row. Cheap (one plain fetch, no Firecrawl spend). Run once,
//     safe to re-run (ON CONFLICT DO NOTHING).
//   POST {"action": "sectors"}
//     Fetches NCS's 15 job-sector listing pages (plain fetch, no
//     Firecrawl - these are server-rendered) and tags each catalog row
//     with its ncs_sector. Run once after enumerate.
//   POST {"slugs"?: string[], "limit"?: number}
//     Scrapes profile pages via Firecrawl. If slugs given, scrapes exactly
//     those (manual retry path). Otherwise self-batches: pulls up to
//     `limit` (default 15 - the empirically observed safe ceiling before
//     the background execution gets killed) rows with scrape_status =
//     'pending', ordered by ncs_slug. Keep POSTing {} with no body until
//     the pending count hits 0 - no manual offset tracking needed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NCS_BASE = "https://nationalcareers.service.gov.uk/job-profiles/";
const SITEMAP_URL = "https://nationalcareers.service.gov.uk/explore-careers/sitemap.xml";

const NCS_SECTORS = [
  "agriculture-environment-and-animal-care",
  "business-and-administration",
  "care-services",
  "catering-and-hospitality",
  "construction-and-the-built-environment",
  "creative-and-design",
  "digital",
  "education-and-early-years",
  "engineering-and-manufacturing",
  "hair-and-beauty",
  "health-and-science",
  "legal-finance-and-accounting",
  "protective-services",
  "sales-marketing-and-procurement",
  "transport-and-logistics",
];

// NCS pages use a GDS accordion whose section content (tasks, skills,
// requirements, entry routes) is NOT in the DOM until a section is
// expanded - confirmed live: Firecrawl's markdown without an explicit
// click is missing all of it. Firecrawl's `actions: [{click: "Show all
// sections"}]` (wired into the fetch call below) fixes this - once
// expanded, the video also resolves to a plain youtube.com markdown link
// (no need for the iframe/rawHtml trick this needed before).
//
// Real heading/wording verified from actual expanded-page markdown
// (2026-07-26, plumber profile):
//   "### Day-to-day tasks\n\nAs a plumber, you'll:\n\n- task1\n- task2"
//   "### Skills and knowledge\n\nYou'll need:\n\n- skill1\n- skill2"
//   "### Restrictions and Requirements\n\nYou'll need to:\n\n- item1"
// Salary/hours/work-pattern are NOT present in Firecrawl's markdown even
// with the accordion expanded (they render via a separate stats widget
// Firecrawl's extraction doesn't capture) - a known gap, not a regex bug.
function parseVideoUrl(md: string): string | null {
  const match = md.match(/\]\((https:\/\/www\.youtube\.com\/watch\?v=[^)\s]+)\)/i);
  return match ? match[1] : null;
}

function parseNcsMarkdown(md: string, ncsSlug: string): Record<string, unknown> {
  const videoUrl = parseVideoUrl(md);
  const clean = md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  const result: Record<string, unknown> = {
    ncs_url: `${NCS_BASE}${ncsSlug}`,
  };

  const titleMatch = clean.match(/^#\s+(.+)$/m);
  result.title = titleMatch ? titleMatch[1].trim() : ncsSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const starterMatch = clean.match(/£\s*([\d,]+)\s+Starter/i);
  const expMatch = clean.match(/£\s*([\d,]+)\s+Experienced/i);
  if (starterMatch) result.ncs_salary_starter = parseInt(starterMatch[1].replace(/,/g, ""), 10);
  if (expMatch) result.ncs_salary_experienced = parseInt(expMatch[1].replace(/,/g, ""), 10);

  const hoursMatch = clean.match(/(\d+)\s+to\s+(\d+)\s+a\s+week/i);
  if (hoursMatch) result.ncs_hours = `${hoursMatch[1]} to ${hoursMatch[2]}`;

  const patternMatch = clean.match(/you could work\s*[\r\n]+([\s\S]{0,120}?)(?:\n\n|\n#)/i);
  if (patternMatch) result.ncs_work_pattern = patternMatch[1].trim().slice(0, 100);

  const tasksSection = clean.match(/day-to-day tasks\s*\n+([\s\S]{0,1600}?)\n#/i);
  if (tasksSection) {
    const lines = tasksSection[1]
      .split("\n")
      .map((l) => l.replace(/^\s*[-*]\s*/, "").trim())
      .filter((l) => l.length > 8 && l.length < 200 && !l.startsWith("#") && !/^as an?\b.*you('ll|'d| would):?$/i.test(l));
    if (lines.length) result.ncs_tasks = lines.slice(0, 8);
  }

  const skillsSection = clean.match(/skills and knowledge\s*\n+you'?ll need:?\s*\n([\s\S]{0,1200}?)\n#/i);
  if (skillsSection) {
    const lines = skillsSection[1]
      .split("\n")
      .map((l) => l.replace(/^\s*[-*]\s*/, "").replace(/^to be /, "").trim())
      .filter((l) => l.length > 4 && l.length < 120 && !l.startsWith("#"));
    if (lines.length) result.ncs_skills = lines.slice(0, 10);
  }

  const restrictionsSection = clean.match(/restrictions and requirements\s*\n+you'?ll need to:?\s*\n([\s\S]{0,800}?)\n#/i);
  if (restrictionsSection) {
    const lines = restrictionsSection[1]
      .split("\n")
      .map((l) => l.replace(/^\s*[-*]\s*/, "").trim())
      .filter((l) => l.length > 4 && l.length < 300 && !l.startsWith("#"));
    if (lines.length) result.ncs_restrictions = lines.join("; ").slice(0, 500);
  }

  const routes: Array<{ type: string; name: string; level?: string; duration?: string }> = [];
  const apprenticeRe = /([A-Z][^\n]{5,80}?)\s+Level\s+(\d)\s+(?:Foundation|Intermediate|Advanced|Higher|Degree)\s+Apprenticeship/g;
  let am;
  while ((am = apprenticeRe.exec(clean)) !== null && routes.length < 8) {
    routes.push({ type: "Apprenticeship", name: am[1].trim(), level: am[2] });
  }
  const durMatch = clean.match(/take between (\d) and (\d) years|approximately (\d+) years?/i);
  if (durMatch && routes.length > 0) {
    const dur = durMatch[3] ? `~${durMatch[3]} years` : `${durMatch[1]}–${durMatch[2]} years`;
    routes[routes.length - 1].duration = dur;
  }
  const hasCollege = /college\s*route|T\s*Level|further education/i.test(clean);
  const hasUni = /university route|degree route|foundation degree/i.test(clean);
  if (hasCollege) routes.push({ type: "College", name: "Further education / T Level" });
  if (hasUni) routes.push({ type: "University", name: "Degree or Foundation degree" });
  if (routes.length) result.ncs_entry_routes = routes;

  const qualMatch = clean.match(/\d+\s+GCSEs?[^.\n]{0,200}|A levels?[^.\n]{0,200}|degree[^.\n]{0,100}/i);
  if (qualMatch) result.ncs_qualifications = qualMatch[0].replace(/\s+/g, " ").trim().slice(0, 200);

  const relSection = clean.match(/(?:related careers?|similar roles?|explore related careers?)[^\n]*\n([\s\S]{0,600}?)(?:\n#+|$)/i);
  if (relSection) {
    const related = relSection[1]
      .split("\n")
      .map((l) => l.replace(/^[\s*\-•]+/, "").trim())
      .filter((l) => l.length > 3 && l.length < 80)
      .slice(0, 6)
      .map((title) => ({ title, ncs_slug: title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }));
    if (related.length) result.ncs_related_roles = related;
  }

  if (videoUrl) result.ncs_video_url = videoUrl;

  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const FIRECRAWL = Deno.env.get("FIRECRAWL_API_KEY");

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: { action?: string; slugs?: string[]; limit?: number } = {};
  try { body = await req.json(); } catch { /* allow empty */ }

  // ── Enumerate: seed all NCS job-profile slugs as pending rows ──────────
  if (body.action === "enumerate") {
    const res = await fetch(SITEMAP_URL);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `sitemap fetch ${res.status}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const xml = await res.text();
    const slugs = Array.from(
      xml.matchAll(/<loc>https:\/\/nationalcareers\.service\.gov\.uk\/job-profiles\/([a-z0-9-]+)<\/loc>/g)
    ).map((m) => m[1]);

    const uniqueSlugs = Array.from(new Set(slugs));
    const rows = uniqueSlugs.map((slug) => ({
      ncs_slug: slug,
      title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      ncs_url: `${NCS_BASE}${slug}`,
      scrape_status: "pending",
    }));

    const { error } = await supabase.from("ncs_role_catalog").upsert(rows, { onConflict: "ncs_slug", ignoreDuplicates: true });

    return new Response(JSON.stringify({ enumerated: uniqueSlugs.length, error: error?.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Sectors: tag rows with their NCS job-sector ────────────────────────
  // Sector listing pages paginate (?page=N) - verified up to 5 pages on
  // some sectors - so walk pages until one returns no new slugs, capped
  // at 15 pages as a safety ceiling.
  if (body.action === "sectors") {
    const sectorSummary: Record<string, number> = {};
    for (const sector of NCS_SECTORS) {
      try {
        const allSlugs = new Set<string>();
        for (let page = 1; page <= 15; page++) {
          const url = `https://nationalcareers.service.gov.uk/explore-careers/job-sector/${sector}/view-all-sector-careers?page=${page}`;
          const res = await fetch(url);
          if (!res.ok) break;
          const html = await res.text();
          const pageSlugs = Array.from(new Set(Array.from(html.matchAll(/\/job-profiles\/([a-z0-9-]+)/g)).map((m) => m[1])));
          const newOnes = pageSlugs.filter((s) => !allSlugs.has(s));
          if (newOnes.length === 0) break;
          newOnes.forEach((s) => allSlugs.add(s));
          await new Promise((r) => setTimeout(r, 300));
        }
        const slugs = Array.from(allSlugs);
        if (slugs.length) {
          await supabase.from("ncs_role_catalog").update({ ncs_sector: sector }).in("ncs_slug", slugs);
        }
        sectorSummary[sector] = slugs.length;
      } catch (e) {
        sectorSummary[sector] = -1;
        console.error(`[scrape-ncs-catalog] sector ${sector} error:`, e);
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    return new Response(JSON.stringify({ sectors: sectorSummary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Scrape: fetch + parse individual job-profile pages via Firecrawl ───
  if (!FIRECRAWL) {
    return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY not set" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let targetSlugs: string[];
  if (body.slugs?.length) {
    targetSlugs = body.slugs;
  } else {
    const limit = body.limit ?? 15;
    const { data, error } = await supabase
      .from("ncs_role_catalog")
      .select("ncs_slug")
      .eq("scrape_status", "pending")
      .order("ncs_slug")
      .limit(limit);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    targetSlugs = (data ?? []).map((r) => r.ncs_slug as string);
  }

  const work = (async () => {
    const summary: Record<string, string> = {};

    for (const slug of targetSlugs) {
      const url = `${NCS_BASE}${slug}`;
      try {
        const fcRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${FIRECRAWL}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            formats: ["markdown"],
            waitFor: 2000,
            actions: [
              { type: "click", selector: ".govuk-accordion__show-all" },
              { type: "wait", milliseconds: 1000 },
            ],
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (!fcRes.ok) {
          await supabase.from("ncs_role_catalog").update({
            scrape_status: "error", scrape_error: `firecrawl ${fcRes.status}`, fetched_at: new Date().toISOString(),
          }).eq("ncs_slug", slug);
          summary[slug] = `firecrawl ${fcRes.status}`;
          continue;
        }

        const fcData = await fcRes.json();
        const md: string = fcData?.data?.markdown || "";

        if (!md || md.length < 200) {
          await supabase.from("ncs_role_catalog").update({
            scrape_status: "empty", fetched_at: new Date().toISOString(),
          }).eq("ncs_slug", slug);
          summary[slug] = "empty markdown";
          continue;
        }

        const parsed = parseNcsMarkdown(md, slug);

        const { error } = await supabase
          .from("ncs_role_catalog")
          .update({ ...parsed, scrape_status: "ok", scrape_error: null, fetched_at: new Date().toISOString() })
          .eq("ncs_slug", slug);

        summary[slug] = error ? `db error: ${error.message}` : "ok";
        if (error) {
          await supabase.from("ncs_role_catalog").update({ scrape_status: "error", scrape_error: error.message }).eq("ncs_slug", slug);
        }
      } catch (e) {
        await supabase.from("ncs_role_catalog").update({
          scrape_status: "error", scrape_error: (e as Error).message, fetched_at: new Date().toISOString(),
        }).eq("ncs_slug", slug);
        summary[slug] = `error: ${(e as Error).message}`;
      }

      await new Promise((r) => setTimeout(r, 1500));
    }

    console.log("[scrape-ncs-catalog] done:", JSON.stringify(summary));
  })();

  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
    (EdgeRuntime as any).waitUntil(work);
  } else {
    await work;
  }

  return new Response(
    JSON.stringify({ accepted: true, queued: targetSlugs.length, slugs: targetSlugs }),
    { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
