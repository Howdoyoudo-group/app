// scrape-careerpilot
// Scrapes CareerPilot (careerpilot.org.uk) job profiles via Firecrawl and stores
// enrichment data into role_metadata.cp_* columns.
//
// CareerPilot is a UK government-funded career exploration site closing in 2026.
// It has ~700 structured job profiles with data our NCS scraper doesn't provide:
// named A-level / T-Level / BTEC entry routes, named apprenticeship standards with
// levels & durations, career progression ladders, and related roles with salaries.
//
// POST body (all optional):
//   slugs?: string[]  — HDYD role slugs to scrape (defaults to all ~29 mapped roles)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── HDYD slug → CareerPilot path segment ─────────────────────────────────────
// Full URL: https://www.careerpilot.org.uk/job-sectors/{path}
const CP_MAP: Record<string, string> = {
  "chef":                  "food-drink/job-profile/chef",
  "bartender":             "food-drink/job-profile/bar-person",
  "barista":               "food-drink/job-profile/barista",
  "hotel-manager":         "hotels/job-profile/hotel-manager",
  "nurse":                 "medical/job-profile/nurse",
  "doctor":                "medical/job-profile/gp",
  "physiotherapist":       "therapy/job-profile/physiotherapist",
  "occupational-therapist":"therapy/job-profile/occupational-therapist",
  "psychotherapist":       "therapy/job-profile/psychotherapist",
  "midwife":               "medical/job-profile/midwife",
  "beauty-therapist":      "hair-beauty/job-profile/beauty-therapist",
  "stylist":               "hair-beauty/job-profile/hairdresser",
  "personal-trainer":      "wellbeing/job-profile/personal-trainer",
  "fitness-instructor":    "wellbeing/job-profile/fitness-instructor",
  "teacher":               "education/job-profile/secondary-school-teacher",
  "teaching-assistant":    "education/job-profile/teaching-assistant",
  "estate-agent":          "property-management/job-profile/estate-agent",
  "mortgage-advisor":      "finance-accounting/job-profile/mortgage-adviser",
  "financial-advisor":     "finance-accounting/job-profile/financial-adviser",
  "interior-designer":     "design/job-profile/interior-designer",
  "game-designer":         "games/job-profile/game-designer",
  "it-technology":         "software-systems/job-profile/software-developer",
  "data-analyst":          "data-network/job-profile/data-analyst",
  "marketing":             "sales-marketing/job-profile/marketing-manager",
  "farmer":                "agriculture/job-profile/farmer",
  "farm-manager":          "agriculture/job-profile/farm-manager",
  "veterinary-surgeon":    "animal/job-profile/vet",
  "charity-fundraiser":    "admin-hr-legal/job-profile/fundraiser",
  "producer":              "media/job-profile/broadcast-producer",
  "broadcast-journalist":  "media/job-profile/broadcast-journalist",
  "healthcare-assistant":  "medical/job-profile/healthcare-assistant",
  "care-worker":           "social-care/job-profile/care-worker",
  "investment-analyst":    "finance-accounting/job-profile/investment-analyst",
  "conveyancer":           "property-management/job-profile/conveyancer",
  "lettings-negotiator":   "property-management/job-profile/lettings-agent",
  // Theatre
  "performer":                "performing-arts/job-profile/actor",
  "theatre-stage-manager":    "performing-arts/job-profile/stage-manager",
  "theatre-technician":       "performing-arts/job-profile/stagehand",
  "theatre-costume-designer": "performing-arts/job-profile/costume-designer",
  // Sustainability
  "sustainability":           "admin-hr-legal/job-profile/corporate-responsibility-and-sustainability-practitioner",
  // Fixing (trades)
  "electrician":              "on-site/job-profile/electrician",
  "plumber":                  "on-site/job-profile/plumber",
  "heating-engineer":         "on-site/job-profile/gas-service-technician",
  // Building (trades)
  "bricklayer":               "on-site/job-profile/bricklayer",
  "carpenter":                "on-site/job-profile/carpenter",
  "plasterer":                "on-site/job-profile/plasterer",
  "groundworker":             "on-site/job-profile/construction-labourer",
  "roofer":                   "on-site/job-profile/roofer",
};

// ── Firecrawl fetch ───────────────────────────────────────────────────────────
async function firecrawlMarkdown(url: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, formats: ["markdown"] }),
    });
    if (!res.ok) {
      console.warn(`Firecrawl ${url} → ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json?.data?.markdown ?? null;
  } catch (e) {
    console.warn(`Firecrawl error for ${url}:`, e);
    return null;
  }
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseSalary(md: string): { min: number | null; max: number | null } {
  // "£22,000 to £40,000" or "£22000 to £40000"
  const m = md.match(/£([\d,]+)\s+to\s+£([\d,]+)/);
  if (!m) return { min: null, max: null };
  const clean = (s: string) => parseInt(s.replace(/,/g, ""), 10);
  return { min: clean(m[1]), max: clean(m[2]) };
}

interface EntryRoute {
  type: string;
  name?: string;
  level?: number;
  duration?: string;
  requirements?: string;
  subjects?: string[];
}

function parseEntryRoutes(md: string): EntryRoute[] {
  const routes: EntryRoute[] = [];

  // ── Apprenticeships ───────────────────────────────────────────────────────
  // Look for apprenticeship section. CareerPilot markdown typically has:
  // "## Apprenticeship" or "### Apprenticeship" header, then bullet lines like:
  // "- Chef de Partie Level 3 Apprenticeship (2 years)"
  // "Production Chef or Commis Chef Level 2 Intermediate Apprenticeship"
  const apprSection = md.match(/##+ Apprenticeship[\s\S]*?(?=##+ |\Z)/i)?.[0] ?? "";

  // Named apprenticeship standard lines — look for Level N patterns
  const FILLER_PREFIX = /^(?:you\s+(?:might|may|can|could)|to\s+do|apply\s+for|complete\s+a|do\s+a|there\s+is|this\s+is)/i;

  const apprLines = apprSection.match(/[-*•]\s+(.+)/g) ?? [];
  for (const line of apprLines) {
    // Strip markdown bold/italic and link syntax before processing
    const text = line.replace(/^[-*•]\s+/, "").replace(/\*+/g, "").replace(/_+/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
    // Skip lines that are just noise / too long (likely prose not a list item)
    if (text.length > 150) continue;

    // If the line starts with a filler phrase, try to extract the actual apprenticeship name.
    // CareerPilot writes prose like:
    //   "You might be able to apply for a Registered Nurse Level 6 Degree Apprenticeship"
    //   "You could apply to do a Food and Beverage Team Member Level 2 Apprenticeship"
    //   "You can get into this job through a Healthcare Support Worker Level 2 Apprenticeship"
    if (FILLER_PREFIX.test(text)) {
      // Pattern: look for the name immediately AFTER "apply for a/an", "do a/an", "through a/an"
      // "[apply for / do / through] a[n] [Name] Level N [type] Apprenticeship"
      const proseM = text.match(/(?:apply\s+(?:for|to\s+do)\s+a[n]?\s+|do\s+a[n]?\s+|through\s+a[n]?\s+|complete\s+a[n]?\s+)([A-Z][a-zA-Z\s&'-]{3,45}?)\s+Level\s+(\d)/i);
      if (proseM) {
        const level = parseInt(proseM[2]);
        const name = proseM[1].trim();
        if (name.length > 3 && name.length < 50) {
          routes.push({ type: "apprenticeship", name, level });
        }
      }
      continue; // Don't process this line further as a regular bullet
    }

    // Regular named-standard bullet line (e.g. "Chef de Partie Level 3 (2 years)")
    // Extract level
    const levelM = text.match(/Level\s+(\d)/i);
    const level = levelM ? parseInt(levelM[1]) : undefined;
    // Extract duration
    const durM = text.match(/\((\d[\d–\-]+\s+years?(?:\s+to\s+\d+\s+years?)?)\)/i);
    const duration = durM ? durM[1] : undefined;
    // Clean name — remove " Level N Apprenticeship" and duration
    const name = text
      .replace(/Level\s+\d\s*(Intermediate|Advanced|Higher|Degree)?\s*Apprenticeship/gi, "")
      .replace(/\([^)]+\)/g, "")
      .replace(/Apprenticeship/gi, "")
      .replace(/[*_\[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (name && name.length > 2 && name.length < 80) {
      routes.push({ type: "apprenticeship", name, ...(level !== undefined && { level }), ...(duration && { duration }) });
    }
  }

  // Final fallback: if no apprenticeships found yet, scan full section for "[Name] Level N Apprenticeship" patterns
  if (apprSection.length > 30 && routes.filter(r => r.type === "apprenticeship").length === 0) {
    // Strip markdown from section before scanning
    const cleanSection = apprSection.replace(/\*+/g, "").replace(/_+/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // Try: "([Name] Level N [type] Apprenticeship)" anywhere in the section
    const allMatches = [...cleanSection.matchAll(/([A-Za-z][a-zA-Z\s&'-]{3,45}?)\s+Level\s+(\d)\s+(?:Intermediate|Advanced|Higher|Degree)?\s*Apprenticeship/gi)];
    for (const m of allMatches.slice(0, 4)) {
      const rawName = m[1].trim();
      // Skip if starts with common filler words
      if (/^(?:you|a |an |the |to |for |do |apply|might|may|can|could|able|this|there|through|complete|get|working)/i.test(rawName)) continue;
      const level = parseInt(m[2]);
      if (rawName.length > 3 && rawName.length < 50) {
        routes.push({ type: "apprenticeship", name: rawName, level });
      }
    }
  }

  // Last resort prose extraction if still nothing
  if (apprSection.length > 30 && routes.filter(r => r.type === "apprenticeship").length === 0) {
    // Extract "[Name] Level N [type] Apprenticeship" patterns from prose
    const proseMatches = apprSection.match(/([A-Z][a-zA-Z\s&'-]{3,60}?)\s+Level\s+(\d)\s+(?:Intermediate|Advanced|Higher|Degree)?\s*Apprenticeship/g) ?? [];
    for (const m of proseMatches.slice(0, 4)) {
      const levelM = m.match(/Level\s+(\d)/i);
      const level = levelM ? parseInt(levelM[1]) : undefined;
      const name = m
        .replace(/Level\s+\d\s*(Intermediate|Advanced|Higher|Degree)?\s*Apprenticeship/i, "")
        .replace(/^(?:a|an|the|do|apply for a?|to do a?)\s+/i, "")
        .replace(/[*_]/g, "").trim();
      if (name.length > 3 && name.length < 80) {
        routes.push({ type: "apprenticeship", name, ...(level !== undefined && { level }) });
      }
    }
    // Also catch "a [Name] apprenticeship" without level
    if (routes.filter(r => r.type === "apprenticeship").length === 0) {
      const noLevelMatch = apprSection.match(/(?:apply for|do|complete)\s+a\s+([A-Z][a-zA-Z\s&'-]{3,60}?)\s+[Aa]pprenticeship/g) ?? [];
      for (const m of noLevelMatch.slice(0, 3)) {
        const name = m
          .replace(/^(?:apply for|do|complete)\s+a\s+/i, "")
          .replace(/\s+[Aa]pprenticeship$/, "")
          .replace(/[*_]/g, "").trim();
        if (name.length > 3 && name.length < 80) {
          routes.push({ type: "apprenticeship", name });
        }
      }
    }
  }

  // ── T Levels ─────────────────────────────────────────────────────────────
  const tLevelMatches = md.match(/T\s+Level\s+in\s+([^\n.([\]]+)/gi) ?? [];
  const seenTLevels = new Set<string>();
  for (const m of tLevelMatches) {
    const rawName = m.replace(/^T\s+Level\s+in\s+/i, "").trim().replace(/[*_\[\]()]+/g, "").trim();
    // Clean up any trailing markdown link text or URLs
    const name = rawName.replace(/\]\(https?:.*$/, "").replace(/\s+/g, " ").trim();
    if (name.length > 2 && name.length < 80 && !seenTLevels.has(name)) {
      seenTLevels.add(name);
      routes.push({ type: "t-level", name: `T Level in ${name}` });
    }
  }

  // ── A levels ─────────────────────────────────────────────────────────────
  // "2 or 3 A levels" / "1 to 2 A levels" / "2-3 A levels"
  const aLevelM = md.match(/(\d+)[\s\-–]+(?:or\s+|to\s+)?(\d+)?\s*A[\s-]levels?(?:[^.]*?(?:including|inc\.?)\s+([^.\n]+))?/i);
  if (aLevelM) {
    const lo = aLevelM[1];
    const hi = aLevelM[2];
    const subjects = aLevelM[3]?.replace(/[*_]/g, "").trim();
    const req = hi ? `${lo}–${hi} A levels${subjects ? `, including ${subjects}` : ""}` : `${lo} A levels${subjects ? `, including ${subjects}` : ""}`;
    routes.push({ type: "a-level", requirements: req });
  }

  // ── BTECs ─────────────────────────────────────────────────────────────────
  const btecM = md.match(/BTEC\s+(?:Level\s+\d\s+)?(?:National\s+)?(?:Extended\s+)?(?:Diploma\s+)?(?:in\s+)?([^\n.]*)/i);
  if (btecM) {
    const name = btecM[0].replace(/[*_]/g, "").trim();
    routes.push({ type: "btec", name });
  }

  // ── University ───────────────────────────────────────────────────────────
  const uniSection = md.match(/##+ University[\s\S]*?(?=##+ |\Z)/i)?.[0] ?? "";
  if (uniSection.length > 20) {
    // Extract listed subjects
    const subjectLines = uniSection.match(/[-*•]\s+([^\n]+)/g) ?? [];
    const subjects = subjectLines
      .map(l => l.replace(/^[-*•]\s+/, "").replace(/[*_]/g, "").trim())
      .filter(s => s.length > 3 && s.length < 80)
      .slice(0, 6);
    if (subjects.length > 0) {
      routes.push({ type: "university", subjects });
    } else {
      routes.push({ type: "university" });
    }
  }

  return routes;
}

function extractProgressionSection(md: string): string {
  return (
    md.match(/##+ Career path and progression[\s\S]*?(?=##+ |\Z)/i)?.[0]
    ?? md.match(/##+ Career progression[\s\S]*?(?=##+ |\Z)/i)?.[0]
    ?? ""
  ).replace(/##+ [^\n]+\n?/, "").trim();
}

// Extract career steps from CareerPilot's prose-format progression sections.
// CareerPilot writes prose like: "progress from commis chef... to sous chef...
// As a head chef, you could train to move into restaurant management."
// We store the raw progression text so it can be displayed directly.
function parseCareerProgressionFallback(md: string): string[] {
  const section = extractProgressionSection(md);
  if (!section) return [];

  // Try bullet list
  const bullets = section.match(/[-*•]\s+([^\n]+)/g);
  if (bullets && bullets.length >= 2) {
    return bullets
      .map(b => b.replace(/^[-*•]\s+/, "").replace(/[*_]/g, "").trim())
      .filter(s => s.length > 2 && s.length < 80)
      .slice(0, 8);
  }
  return [];
}

function parseRelatedRoles(md: string): Array<{ title: string; salary_range: string }> {
  // CareerPilot uses "Related jobs" as the section heading
  const section = md.match(/##+ Related jobs[\s\S]*?(?=##+ |\Z)/i)?.[0]
    ?? md.match(/##+ Related[\s\S]*?(?=##+ |\Z)/i)?.[0]
    ?? "";
  if (!section) return [];

  // CareerPilot shows related jobs as cards — Firecrawl may render them as:
  // "**Barista** - Salary range: £19,000 to £24,000" or just bold text
  const lines = section.match(/(?:[-*•]\s+|\*\*)[^\n]+/g) ?? [];
  return lines
    .map(line => {
      const text = line.replace(/^[-*•]\s+/, "").replace(/[*_[\]]/g, "").trim();
      // Extract salary
      const salaryM = text.match(/£[\d,]+\s*(?:to|–|-)\s*£[\d,]+/);
      const salary_range = salaryM ? salaryM[0].trim() : "";
      // Extract title — everything before salary or "- Salary"
      const title = text
        .replace(/[-–]\s*Salary[^:]*:.*$/, "")
        .replace(/£[\d,]+.*$/, "")
        .replace(/[()]/g, "")
        .trim();
      return { title, salary_range };
    })
    .filter(r => r.title.length > 2 && r.title.length < 60 && !/^(salary|range|the|a|an)$/i.test(r.title))
    .slice(0, 5);
}

function parseWorkEnvironment(md: string): string {
  const clues: string[] = [];

  // Schedule
  const schedule: string[] = [];
  if (/evenings/i.test(md)) schedule.push("evenings");
  if (/weekends/i.test(md)) schedule.push("weekends");
  if (/bank holidays/i.test(md)) schedule.push("bank holidays");
  if (/shift/i.test(md)) schedule.push("shift work");
  if (schedule.length > 0) clues.push(schedule.join(", "));

  // Physical/emotional demands
  if (/physically demanding/i.test(md)) clues.push("physically demanding");
  if (/emotionally demanding/i.test(md)) clues.push("emotionally demanding");
  if (/hot.{0,15}humid/i.test(md) || /humid/i.test(md)) clues.push("hot & humid environment");
  if (/outdoors/i.test(md)) clues.push("outdoor work");

  // Uniform
  if (/uniform/i.test(md)) clues.push("uniform required");

  return clues.join(" · ");
}

function parseGrowthOutlook(md: string): string | null {
  // "2.8% job growth projected by 2029" type patterns
  const m = md.match(/([\d.]+%[^.]{0,60}(?:growth|decline|increase)[^.]{0,40})/i);
  if (m) return m[1].trim();
  return null;
}

// ── Main scrape ───────────────────────────────────────────────────────────────
interface ScrapeResult {
  slug: string;
  ok: boolean;
  reason?: string;
}

async function scrapeSlug(
  slug: string,
  cpPath: string,
  firecrawlKey: string,
  supabase: ReturnType<typeof createClient>
): Promise<ScrapeResult> {
  const url = `https://www.careerpilot.org.uk/job-sectors/${cpPath}`;
  const md = await firecrawlMarkdown(url, firecrawlKey);
  if (!md) return { slug, ok: false, reason: "firecrawl_failed" };

  const { min: cpSalaryMin, max: cpSalaryMax } = parseSalary(md);
  const cpEntryRoutes = parseEntryRoutes(md);
  const cpCareerProgression = parseCareerProgressionFallback(md);
  const cpRelatedRoles = parseRelatedRoles(md);
  const cpWorkEnvironment = parseWorkEnvironment(md);
  const cpGrowth = parseGrowthOutlook(md);

  const row = {
    slug,
    cp_url: url,
    cp_salary_min: cpSalaryMin,
    cp_salary_max: cpSalaryMax,
    cp_entry_routes: cpEntryRoutes.length > 0 ? cpEntryRoutes : null,
    cp_career_progression: cpCareerProgression.length > 0 ? cpCareerProgression : null,
    cp_related_roles: cpRelatedRoles.length > 0 ? cpRelatedRoles : null,
    cp_work_environment: cpWorkEnvironment || null,
    cp_growth: cpGrowth,
    cp_fetched_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("role_metadata")
    .upsert(row, { onConflict: "slug" });

  if (error) {
    console.error(`DB error for ${slug}:`, error.message);
    return { slug, ok: false, reason: error.message };
  }

  console.log(`✓ ${slug}: salary=${cpSalaryMin}–${cpSalaryMax}, routes=${cpEntryRoutes.length}, progression=${cpCareerProgression.length}`);
  return { slug, ok: true };
}

// ── Handler ───────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!firecrawlKey) {
    return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { slugs?: string[] } = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  const slugsToScrape = body.slugs ?? Object.keys(CP_MAP);
  const validSlugs = slugsToScrape.filter(s => s in CP_MAP);
  const unknownSlugs = slugsToScrape.filter(s => !(s in CP_MAP));

  if (validSlugs.length === 0) {
    return new Response(JSON.stringify({ error: "No valid slugs", unknown: unknownSlugs }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: ScrapeResult[] = [];

  const work = (async () => {
    for (const slug of validSlugs) {
      const cpPath = CP_MAP[slug];
      const result = await scrapeSlug(slug, cpPath, firecrawlKey, supabaseClient);
      results.push(result);
      // Polite delay between Firecrawl requests
      if (validSlugs.indexOf(slug) < validSlugs.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    const ok = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok);
    console.log(`scrape-careerpilot complete: ${ok}/${validSlugs.length} ok`, failed.length > 0 ? failed : "");
  })();

  // Background pattern to avoid 150s gateway timeout
  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
    (EdgeRuntime as any).waitUntil(work);
  } else {
    await work;
  }

  return new Response(
    JSON.stringify({
      accepted: true,
      slugs: validSlugs,
      total: validSlugs.length,
      unknown: unknownSlugs.length > 0 ? unknownSlugs : undefined,
      estimatedMinutes: Math.ceil((validSlugs.length * 1.5) / 60),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
