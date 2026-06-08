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
// NCS page format (verified from actual page source):
//   Salary: "£22,000 Starter\n\n_to_\n\n£40,000 Experienced"
//   Hours:  "40 to 45 a week"
//   Pattern: "You could work\n\nevenings / weekends / bank holidays on shifts"
//   Tasks:  "### Day-to-day tasks\n\nAs a X, you would:\n\n*   task1\n*   task2"
//   Apprenticeships: "Production Chef or Commis Chef Level 2 Intermediate Apprenticeship"
function parseNcsMarkdown(md: string, ncsSlug: string): Record<string, unknown> {
  // Strip markdown hyperlinks but keep the link text: [text](url) → text
  const clean = md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  const result: Record<string, unknown> = {
    ncs_url: `${NCS_BASE}${ncsSlug}`,
  };

  // --- Salary: £22,000 Starter ... £40,000 Experienced ---
  const starterMatch = clean.match(/£\s*([\d,]+)\s+Starter/i);
  const expMatch = clean.match(/£\s*([\d,]+)\s+Experienced/i);
  if (starterMatch) result.ncs_salary_starter = parseInt(starterMatch[1].replace(/,/g, ""), 10);
  if (expMatch) result.ncs_salary_experienced = parseInt(expMatch[1].replace(/,/g, ""), 10);

  // --- Hours: "40 to 45 a week" ---
  const hoursMatch = clean.match(/(\d+)\s+to\s+(\d+)\s+a\s+week/i);
  if (hoursMatch) result.ncs_hours = `${hoursMatch[1]} to ${hoursMatch[2]}`;

  // --- Work pattern: line after "You could work" ---
  const patternMatch = clean.match(/you could work\s*[\r\n]+([\s\S]{0,120}?)(?:\n\n|\n#)/i);
  if (patternMatch) {
    result.ncs_work_pattern = patternMatch[1].trim().slice(0, 100);
  }

  // --- Tasks: bullet list after "Day-to-day tasks" ---
  const tasksSection = clean.match(/day[- ]to[- ]day tasks[\s\S]{0,200}?you would:?\s*\n([\s\S]{0,1500}?)(?:\n#+|\n\nSkills|\n\nHow to become)/i);
  if (tasksSection) {
    const lines = tasksSection[1]
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s+/, "").trim())
      .filter((l) => l.length > 8 && l.length < 200 && !l.startsWith("#"));
    if (lines.length) result.ncs_tasks = lines.slice(0, 8);
  }

  // --- Skills: list under "Skills and knowledge" / "You'll need:" ---
  const skillsSection = clean.match(/You['']ll need:?\s*\n([\s\S]{0,1200}?)(?:\n#+|\n\nMore information|\n\nRestrictions)/i);
  if (skillsSection) {
    const lines = skillsSection[1]
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s+/, "").replace(/^to be /, "").trim())
      .filter((l) => l.length > 4 && l.length < 120 && !l.startsWith("#"));
    if (lines.length) result.ncs_skills = lines.slice(0, 10);
  }

  // --- Entry routes ---
  const routes: Array<{ type: string; name: string; level?: string; duration?: string }> = [];

  // Apprenticeship lines: "Production Chef Level 2 Intermediate Apprenticeship"
  // or "Level 2 Intermediate Apprenticeship in..."
  const apprenticeRe = /([A-Z][^\n]{5,80}?)\s+Level\s+(\d)\s+(?:Foundation|Intermediate|Advanced|Higher|Degree)\s+Apprenticeship/g;
  let am;
  while ((am = apprenticeRe.exec(clean)) !== null && routes.length < 8) {
    routes.push({ type: "Apprenticeship", name: am[1].trim(), level: am[2] });
  }

  // Duration: "These take between 1 and 2 years" or "approximately 4 years"
  const durMatch = clean.match(/take between (\d) and (\d) years|approximately (\d+) years?/i);
  if (durMatch && routes.length > 0) {
    const dur = durMatch[3] ? `~${durMatch[3]} years` : `${durMatch[1]}–${durMatch[2]} years`;
    routes[routes.length - 1].duration = dur;
  }

  // College / University routes
  const hasCollege = /college\s*route|T\s*Level|further education/i.test(clean);
  const hasUni = /university route|degree route|foundation degree/i.test(clean);
  if (hasCollege) routes.push({ type: "College", name: "Further education / T Level" });
  if (hasUni) routes.push({ type: "University", name: "Degree or Foundation degree" });

  if (routes.length) result.ncs_entry_routes = routes;

  // --- Qualifications summary (first relevant line) ---
  const qualMatch = clean.match(/\d+\s+GCSEs?[^.\n]{0,200}|A levels?[^.\n]{0,200}|degree[^.\n]{0,100}/i);
  if (qualMatch) result.ncs_qualifications = qualMatch[0].replace(/\s+/g, " ").trim().slice(0, 200);

  // --- Related roles ---
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
