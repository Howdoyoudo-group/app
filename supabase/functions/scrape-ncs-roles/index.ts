// Scrapes National Careers Service (NCS) job profiles for our mapped roles.
// Stores enriched data (salary, hours, entry routes, qualifications) in role_metadata.
// Run manually to seed/refresh; no live user data involved.
//
// Usage: POST with optional body {"slugs": ["chef", "nurse"]} to scrape a subset.
//        POST with empty body to scrape all mapped roles.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map our role slugs → NCS job-profile slugs.
// Only roles with a clear 1:1 NCS equivalent are listed.
const NCS_MAP: Record<string, string> = {
  // Health
  nurse: "nurse",
  doctor: "gp",
  midwife: "midwife",
  physiotherapist: "physiotherapist",
  "occupational-therapist": "occupational-therapist",
  psychotherapist: "counsellor",
  "healthcare-assistant": "healthcare-assistant",
  "care-worker": "care-worker",
  // Teaching
  teacher: "secondary-school-teacher",
  "teaching-assistant": "teaching-assistant",
  // Hospitality / food
  chef: "chef",
  bartender: "bar-person",
  barista: "barista",
  "hotel-manager": "hotel-manager",
  // Fitness / beauty
  "personal-trainer": "personal-trainer",
  "fitness-instructor": "fitness-instructor",
  "beauty-therapist": "beauty-therapist",
  stylist: "hairdresser",
  // Property
  "estate-agent": "estate-agent",
  "lettings-negotiator": "lettings-agent",
  "property-manager": "property-manager",
  conveyancer: "conveyancer",
  "mortgage-advisor": "mortgage-adviser",
  "financial-advisor": "financial-adviser",
  // Retail / warehouse
  "retail-assistant": "retail-assistant",
  "grocery-store-manager": "retail-manager",
  "warehouse-delivery": "warehouse-operative",
  "car-sales-executive": "car-salesperson",
  // Vehicles / engineering
  mechanic: "vehicle-technician",
  "vehicle-technician": "vehicle-technician",
  // Farming / animals
  farmer: "farmer",
  "farm-worker": "farm-worker",
  "farm-manager": "farm-manager",
  agronomist: "agronomist",
  "veterinary-surgeon": "vet",
  "veterinary-nurse": "veterinary-nurse",
  // Horse racing
  jockey: "jockey",
  "racehorse-trainer": "racehorse-trainer",
  "stable-hand": "stable-hand",
  // Football / sport
  "football-coach": "football-coach",
  "sports-scientist": "sports-scientist",
  groundsperson: "groundsperson",
  // Charity
  "charity-fundraiser": "fundraiser",
  // Creative / media
  "broadcast-journalist": "broadcast-journalist",
  reporter: "journalist",
  editor: "editor",
  producer: "broadcast-producer",
  "sound-engineer": "sound-engineer",
  "interior-designer": "interior-designer",
  "travel-consultant": "travel-agent",
  "live-events-manager": "events-manager",
  "game-designer": "game-designer",
  "qa-tester": "quality-assurance-tester",
  // Fashion
  buyer: "buyer",
  "garment-technologist": "garment-technologist",
  // Tech / data
  "it-technology": "software-developer",
  "data-analyst": "data-analyst",
  "investment-analyst": "investment-analyst",
};

const NCS_BASE = "https://nationalcareers.service.gov.uk/job-profiles/";

// Parse the Firecrawl markdown output of an NCS profile page.
function parseNcsMarkdown(md: string, ncsSlug: string): Record<string, unknown> {
  const result: Record<string, unknown> = {
    ncs_url: `${NCS_BASE}${ncsSlug}`,
  };

  // --- Salary ---
  const starterMatch = md.match(/[Ss]tarter[^\n£]*£\s*([\d,]+)/);
  const expMatch = md.match(/[Ee]xperienced[^\n£]*£\s*([\d,]+)/);
  if (starterMatch) result.ncs_salary_starter = parseInt(starterMatch[1].replace(/,/g, ""), 10);
  if (expMatch) result.ncs_salary_experienced = parseInt(expMatch[1].replace(/,/g, ""), 10);

  // --- Hours ---
  const hoursMatch = md.match(/(\d+)\s+to\s+(\d+)\s+hours/i);
  if (hoursMatch) result.ncs_hours = `${hoursMatch[1]} to ${hoursMatch[2]}`;

  // --- Work pattern ---
  const patternMatch = md.match(/(evenings|weekends|shifts|bank holidays|flexibly|on call)[^\n]*/i);
  if (patternMatch) {
    // Capture a clean phrase
    const raw = patternMatch[0].replace(/\*+/g, "").trim();
    result.ncs_work_pattern = raw.slice(0, 80);
  }

  // --- Tasks: look for a "Day-to-day" or "You could" section ---
  const tasksSection = md.match(/(?:day[- ]to[- ]day|you could|typical tasks?)[^\n]*\n([\s\S]{0,1500}?)(?:\n#+|\n\n[A-Z]|entry requirements|how to become|skills)/i);
  if (tasksSection) {
    const lines = tasksSection[1]
      .split("\n")
      .map((l) => l.replace(/^[\s*\-•]+/, "").trim())
      .filter((l) => l.length > 10 && l.length < 200);
    if (lines.length) result.ncs_tasks = lines.slice(0, 8);
  }

  // --- Skills ---
  const skillsSection = md.match(/skills[^\n]*\n([\s\S]{0,1000}?)(?:\n#+|\n\n[A-Z]|more information|entry requirements)/i);
  if (skillsSection) {
    const lines = skillsSection[1]
      .split("\n")
      .map((l) => l.replace(/^[\s*\-•]+/, "").trim())
      .filter((l) => l.length > 4 && l.length < 100);
    if (lines.length) result.ncs_skills = lines.slice(0, 10);
  }

  // --- Entry routes ---
  const routes: Array<{ type: string; name: string; level?: string; duration?: string }> = [];

  // Apprenticeship names like "Foundation (Level 2)" or "Level 3 Advanced"
  const apprenticeRe = /([A-Za-z][^\n(]{3,60})\s*\(?[Ll]evel\s*(\d)\)?/g;
  let am;
  while ((am = apprenticeRe.exec(md)) !== null && routes.length < 8) {
    const name = am[1].trim().replace(/\*+/g, "");
    if (name.length > 3) {
      routes.push({ type: "Apprenticeship", name, level: am[2] });
    }
  }

  // Duration hints like "approximately 4 years" near apprenticeship
  const durMatch = md.match(/approximately\s+(\d+)\s+year/i);
  if (durMatch && routes.length > 0) {
    routes[routes.length - 1].duration = `~${durMatch[1]} years`;
  }

  // College / University sections
  if (/college/i.test(md)) routes.push({ type: "College", name: "Further education / T Level" });
  if (/university|degree/i.test(md)) routes.push({ type: "University", name: "Degree or Foundation degree" });

  if (routes.length) result.ncs_entry_routes = routes;

  // --- Qualifications summary ---
  const qualMatch = md.match(/(GCSEs?|A levels?|degree|NVQ|diploma)[^\n]{0,200}/i);
  if (qualMatch) result.ncs_qualifications = qualMatch[0].replace(/\*+/g, "").trim().slice(0, 200);

  // --- Related roles ---
  const relSection = md.match(/(?:related careers?|similar roles?|you might also)[^\n]*\n([\s\S]{0,600}?)(?:\n#+|$)/i);
  if (relSection) {
    const related = relSection[1]
      .split("\n")
      .map((l) => l.replace(/^[\s*\-•\[\]]+/, "").replace(/\(.*?\)/, "").trim())
      .filter((l) => l.length > 3 && l.length < 80)
      .slice(0, 6)
      .map((title) => ({ title, ncs_slug: title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }));
    if (related.length) result.ncs_related_roles = related;
  }

  return result;
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

  let body: { slugs?: string[] } = {};
  try { body = await req.json(); } catch { /* allow empty */ }

  const targetSlugs = body.slugs?.length
    ? body.slugs.filter((s) => NCS_MAP[s])
    : Object.keys(NCS_MAP);

  // Return immediately, run scraping in background
  const work = (async () => {
    const summary: Record<string, string> = {};

    for (const ourSlug of targetSlugs) {
      const ncsSlug = NCS_MAP[ourSlug];
      const ncsUrl = `${NCS_BASE}${ncsSlug}`;

      try {
        // Fetch via Firecrawl
        const fcRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${FIRECRAWL}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: ncsUrl, formats: ["markdown"], waitFor: 2000 }),
          signal: AbortSignal.timeout(20000),
        });

        if (!fcRes.ok) {
          summary[ourSlug] = `firecrawl ${fcRes.status}`;
          continue;
        }

        const fcData = await fcRes.json();
        const md: string = fcData?.data?.markdown || "";

        if (!md || md.length < 200) {
          summary[ourSlug] = "empty markdown";
          continue;
        }

        const parsed = parseNcsMarkdown(md, ncsSlug);

        const { error } = await supabase
          .from("role_metadata")
          .upsert({ slug: ourSlug, ...parsed, fetched_at: new Date().toISOString() });

        summary[ourSlug] = error ? `db error: ${error.message}` : "ok";
      } catch (e) {
        summary[ourSlug] = `error: ${(e as Error).message}`;
      }

      // Polite delay between Firecrawl requests
      await new Promise((r) => setTimeout(r, 1500));
    }

    console.log("[scrape-ncs-roles] done:", JSON.stringify(summary));
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
