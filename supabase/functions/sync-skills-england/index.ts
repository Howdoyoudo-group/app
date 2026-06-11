// sync-skills-england
// Ingests data from the Skills England Occupational Maps API and
// associated sources to build structured skill profiles for every role.
//
// Steps:
//  1. Fetch SE occupation list + routes taxonomy
//  2. Match our role slugs to SE occupations (fuzzy title + AI fallback)
//  3. Scrape formal KSBs via Firecrawl for matched occupations
//  4. Categorise NCS skills via Gemini for all remaining roles
//
// Usage: POST with optional body {"slugs": ["chef","nurse"]} to run a subset.
//        POST with empty body to run all roles.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SE_BASE = "https://occupational-maps-api.skillsengland.education.gov.uk/api/v1";
const IFATE_BASE = "https://www.instituteforapprenticeships.org/apprenticeship-standards";
const FIRECRAWL_API = "https://api.firecrawl.dev/v1/scrape";

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normaliseTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

// Jaro-Winkler similarity — runs inline with no external lib
function jaroWinkler(s1: string, t1: string): number {
  const s = normaliseTitle(s1);
  const t = normaliseTitle(t1);
  if (s === t) return 1;
  const sl = s.length, tl = t.length;
  const matchDist = Math.floor(Math.max(sl, tl) / 2) - 1;
  const sMatches = new Array(sl).fill(false);
  const tMatches = new Array(tl).fill(false);
  let matches = 0, transpositions = 0;
  for (let i = 0; i < sl; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, tl);
    for (let j = start; j < end; j++) {
      if (tMatches[j] || s[i] !== t[j]) continue;
      sMatches[i] = true; tMatches[j] = true; matches++; break;
    }
  }
  if (!matches) return 0;
  let k = 0;
  for (let i = 0; i < sl; i++) {
    if (!sMatches[i]) continue;
    while (!tMatches[k]) k++;
    if (s[i] !== t[k]) transpositions++;
    k++;
  }
  const jaro = (matches / sl + matches / tl + (matches - transpositions / 2) / matches) / 3;
  const prefix = Math.min(4, [...s].findIndex((c, i) => c !== t[i]) === -1 ? Math.min(sl, tl) : [...s].findIndex((c, i) => c !== t[i]));
  return jaro + prefix * 0.1 * (1 - jaro);
}

// ── Step 1: Fetch SE data ─────────────────────────────────────────────────────

async function fetchSEOccupations(apiKey: string): Promise<{ stdCode: string; name: string; level: number }[]> {
  const res = await fetch(`${SE_BASE}/occupations`, {
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`SE occupations fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchSERoutes(apiKey: string): Promise<{ name: string; description?: string }[]> {
  try {
    const res = await fetch(`${SE_BASE}/routes`, {
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    });
    if (!res.ok) return SE_FALLBACK_ROUTES;
    const data = await res.json();
    return Array.isArray(data) ? data.map((r: any) => ({ name: r.name ?? r.title ?? r.route ?? String(r) })) : SE_FALLBACK_ROUTES;
  } catch {
    return SE_FALLBACK_ROUTES;
  }
}

// Fallback route list if API doesn't return routes (stable government taxonomy)
const SE_FALLBACK_ROUTES = [
  { name: "Agriculture, Environmental and Animal Care" },
  { name: "Business and Administration" },
  { name: "Care Services" },
  { name: "Catering and Hospitality" },
  { name: "Construction and the Built Environment" },
  { name: "Creative and Design" },
  { name: "Digital" },
  { name: "Education and Early Years" },
  { name: "Engineering and Manufacturing" },
  { name: "Hair and Beauty" },
  { name: "Health and Science" },
  { name: "Legal, Finance and Accounting" },
  { name: "Protective Services" },
  { name: "Sales, Marketing and Procurement" },
  { name: "Transport and Logistics" },
];

// ── Step 2: Match role slugs ──────────────────────────────────────────────────

interface SEOccupation { stdCode: string; name: string; level: number; }

interface RoleRow { slug: string; ncs_skills: string[] | null; se_synced_at: string | null; }

interface MatchResult {
  slug: string;
  se_occ_code: string | null;
  se_occ_name: string | null;
  se_level: number | null;
  se_route: string | null;
  match_method: "title_exact" | "title_fuzzy" | "ai_mapped" | "unmatched";
  match_score: number | null;
}

function matchByTitle(
  slug: string,
  seList: SEOccupation[],
): { occ: SEOccupation; score: number; method: "title_exact" | "title_fuzzy" } | null {
  // Derive a human title from the slug (e.g. "software-engineer" → "software engineer")
  const title = slug.replace(/-/g, " ");
  for (const occ of seList) {
    if (normaliseTitle(occ.name) === normaliseTitle(title)) {
      return { occ, score: 1, method: "title_exact" };
    }
  }
  let best: { occ: SEOccupation; score: number } | null = null;
  for (const occ of seList) {
    const score = jaroWinkler(title, occ.name);
    if (score >= 0.85 && (!best || score > best.score)) best = { occ, score };
  }
  return best ? { ...best, method: "title_fuzzy" } : null;
}

async function aiMatchRoles(
  unmatched: { slug: string; title: string }[],
  seList: SEOccupation[],
  geminiKey: string,
): Promise<Map<string, { occ: SEOccupation; score: number }>> {
  const result = new Map<string, { occ: SEOccupation; score: number }>();
  const seNames = seList.map((o) => `${o.stdCode}|${o.name}`).join("\n");

  // Batch 25 at a time
  for (let i = 0; i < unmatched.length; i += 25) {
    const batch = unmatched.slice(i, i + 25);
    const roleList = batch.map((r) => `${r.slug}: ${r.title}`).join("\n");
    const prompt = `Match each role to the closest SE occupation. Return JSON array only.
Format: [{"slug":"...", "se_code":"OCC####", "confidence":0.0-1.0}]
Use "unmatched" for se_code if nothing fits well (confidence < 0.7).

SE occupations:
${seNames}

Roles to match:
${roleList}`;

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${geminiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-2.5-flash",
            messages: [
              { role: "system", content: "Return valid JSON only, no markdown." },
              { role: "user", content: prompt },
            ],
            temperature: 0.1,
          }),
        },
      );
      if (!res.ok) { await sleep(2000); continue; }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      const matches = JSON.parse(content.replace(/```json|```/g, "").trim());
      if (Array.isArray(matches)) {
        for (const m of matches) {
          if (m.se_code && m.se_code !== "unmatched" && m.confidence >= 0.7) {
            const occ = seList.find((o) => o.stdCode === m.se_code);
            if (occ) result.set(m.slug, { occ, score: m.confidence });
          }
        }
      }
    } catch { /* skip batch on parse failure */ }
    await sleep(500);
  }
  return result;
}

// ── Step 3: Firecrawl KSB scrape ─────────────────────────────────────────────

interface KSBItem { title: string; type: "knowledge" | "skill" | "behaviour"; ref?: string; }

async function scrapeKSBs(occName: string, firecrawlKey: string): Promise<KSBItem[]> {
  const slug = occName.toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, "-");

  // Try common URL patterns for IfATE pages
  const urls = [
    `${IFATE_BASE}/${slug}/`,
    `${IFATE_BASE}/${slug}-v1-0/`,
    `${IFATE_BASE}/${slug}-v2-0/`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(FIRECRAWL_API, {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const md = data?.data?.markdown ?? "";
      if (!md || md.length < 200) continue;

      const items: KSBItem[] = [];
      // Parse K / S / B labelled sections from IfATE markdown format
      const kSection = md.match(/##\s+Knowledge[^\n]*\n([\s\S]*?)(?=##\s+(?:Skill|Behaviour|$))/i)?.[1] ?? "";
      const sSection = md.match(/##\s+Skill[^\n]*\n([\s\S]*?)(?=##\s+(?:Behaviour|Knowledge|$))/i)?.[1] ?? "";
      const bSection = md.match(/##\s+Behaviour[^\n]*\n([\s\S]*?)(?=##\s+(?:Knowledge|Skill|$))/i)?.[1] ?? "";

      function parseSection(text: string, type: KSBItem["type"]) {
        const lines = text.split("\n").map((l) => l.replace(/^[-*•K\d\.]\s*/, "").trim()).filter((l) => l.length > 10 && l.length < 200);
        for (const line of lines) {
          const refMatch = line.match(/\(([KSB]\d+)\)/i);
          items.push({ title: line.replace(/\([KSB]\d+\)/gi, "").trim(), type, ref: refMatch?.[1] });
        }
      }
      parseSection(kSection, "knowledge");
      parseSection(sSection, "skill");
      parseSection(bSection, "behaviour");

      if (items.length > 0) return items;
    } catch { /* try next URL */ }
    await sleep(200);
  }
  return [];
}

// ── Step 4: Gemini NCS categorisation ────────────────────────────────────────

interface CategorisedSkill {
  skill_title: string;
  skill_type: "knowledge" | "skill" | "behaviour";
  broad_domain: string;
  skill_area: string;
}

async function categoriseNCSSkills(
  slug: string,
  ncsSkills: string[],
  routes: string[],
  geminiKey: string,
): Promise<CategorisedSkill[]> {
  if (!ncsSkills || ncsSkills.length === 0) return [];
  const routeList = routes.join(", ");
  const skillList = ncsSkills.map((s, i) => `${i + 1}. ${s}`).join("\n");

  const prompt = `Categorise each skill for the role "${slug.replace(/-/g, " ")}" into structured fields.
Return JSON array only. Each item must have all four fields.

Routes/domains available: ${routeList}

Skills to categorise:
${skillList}

Return: [{"skill_title":"exact text","skill_type":"knowledge|skill|behaviour","broad_domain":"one from routes list","skill_area":"sub-group you create"}]`;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${geminiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: "Return valid JSON array only, no markdown fences." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(25000),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
    return Array.isArray(parsed) ? parsed.filter((s: any) => s.skill_title && s.broad_domain) : [];
  } catch {
    return [];
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const SE_API_KEY = Deno.env.get("SKILLSENGLAND_API_KEY") ?? "";
  const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
  const FIRECRAWL_KEY = Deno.env.get("FIRECRAWL_API_KEY") ?? "";

  let body: { slugs?: string[]; step?: string } = {};
  try { body = await req.json(); } catch { body = {}; }

  // Determine which slugs to process
  let slugFilter: string[] | null = body.slugs ?? null;

  const work = (async () => {
    const results: Record<string, string> = {};

    try {
      console.log("[SE] Step 1: Fetching SE occupations and routes...");
      const [seOccs, seRoutes] = await Promise.all([
        fetchSEOccupations(SE_API_KEY),
        fetchSERoutes(SE_API_KEY),
      ]);
      const routeNames = seRoutes.map((r) => r.name);
      console.log(`[SE] Fetched ${seOccs.length} occupations, ${routeNames.length} routes`);

      // Fetch our role slugs
      let roleQuery = supabase.from("role_metadata").select("slug, ncs_skills, se_synced_at");
      if (slugFilter) roleQuery = roleQuery.in("slug", slugFilter);
      const { data: roles, error: rolesErr } = await roleQuery;
      if (rolesErr || !roles) throw new Error(`role_metadata fetch failed: ${rolesErr?.message}`);
      console.log(`[SE] Processing ${roles.length} roles`);

      // ── Step 2: Match roles to SE occupations ─────────────────────────────
      console.log("[SE] Step 2: Matching roles to SE occupations...");
      const matchResults: MatchResult[] = [];
      const aiUnmatched: { slug: string; title: string }[] = [];

      for (const role of roles as RoleRow[]) {
        const fuzzy = matchByTitle(role.slug, seOccs);
        if (fuzzy) {
          matchResults.push({
            slug: role.slug,
            se_occ_code: fuzzy.occ.stdCode,
            se_occ_name: fuzzy.occ.name,
            se_level: fuzzy.occ.level,
            se_route: null, // route lookup below
            match_method: fuzzy.method,
            match_score: fuzzy.score,
          });
        } else {
          aiUnmatched.push({ slug: role.slug, title: role.slug.replace(/-/g, " ") });
        }
      }

      // AI fallback for unmatched
      if (aiUnmatched.length > 0 && GEMINI_KEY) {
        console.log(`[SE] AI matching ${aiUnmatched.length} unmatched roles...`);
        const aiMap = await aiMatchRoles(aiUnmatched, seOccs, GEMINI_KEY);
        for (const { slug } of aiUnmatched) {
          const match = aiMap.get(slug);
          matchResults.push({
            slug,
            se_occ_code: match?.occ.stdCode ?? null,
            se_occ_name: match?.occ.name ?? null,
            se_level: match?.occ.level ?? null,
            se_route: null,
            match_method: match ? "ai_mapped" : "unmatched",
            match_score: match?.score ?? null,
          });
        }
      } else {
        for (const { slug } of aiUnmatched) {
          matchResults.push({ slug, se_occ_code: null, se_occ_name: null, se_level: null, se_route: null, match_method: "unmatched", match_score: null });
        }
      }

      // Upsert role_se_mapping
      const { error: mapErr } = await supabase
        .from("role_se_mapping")
        .upsert(matchResults.map((r) => ({ ...r, synced_at: new Date().toISOString() })), { onConflict: "slug" });
      if (mapErr) console.error("[SE] role_se_mapping upsert error:", mapErr.message);
      console.log(`[SE] Mapped ${matchResults.filter((r) => r.se_occ_code).length} / ${matchResults.length} roles`);

      // ── Step 3: Firecrawl KSB scrape for matched roles ────────────────────
      if (FIRECRAWL_KEY) {
        const matched = matchResults.filter((r) => r.se_occ_code && r.se_occ_name);
        console.log(`[SE] Step 3: Scraping KSBs for ${matched.length} matched occupations...`);

        // Deduplicate by OCC code — multiple role slugs may share an occupation
        const uniqueOccs = new Map<string, { code: string; name: string; slugs: string[] }>();
        for (const m of matched) {
          if (!uniqueOccs.has(m.se_occ_code!)) {
            uniqueOccs.set(m.se_occ_code!, { code: m.se_occ_code!, name: m.se_occ_name!, slugs: [] });
          }
          uniqueOccs.get(m.se_occ_code!)!.slugs.push(m.slug);
        }

        let scraped = 0;
        for (const { name, slugs } of uniqueOccs.values()) {
          const ksbs = await scrapeKSBs(name, FIRECRAWL_KEY);
          if (ksbs.length === 0) continue;
          scraped++;
          // Write KSBs for every slug that maps to this occupation
          for (const slug of slugs) {
            const rows = ksbs.map((k, i) => ({
              slug,
              skill_title: k.title.slice(0, 250),
              skill_type: k.type,
              broad_domain: null as string | null,
              skill_area: null as string | null,
              source: "firecrawl_ksb",
              se_ksb_ref: k.ref ?? null,
              display_order: i,
              synced_at: new Date().toISOString(),
            }));
            const { error } = await supabase.from("role_skills").upsert(rows, { onConflict: "slug,skill_title" });
            if (error) console.error(`[SE] role_skills upsert error (${slug}):`, error.message);
          }
          await sleep(250);
        }
        console.log(`[SE] Scraped KSBs for ${scraped} unique occupations`);
      }

      // ── Step 4: Gemini NCS skill categorisation ───────────────────────────
      if (GEMINI_KEY) {
        console.log("[SE] Step 4: Categorising NCS skills via Gemini...");
        let categorised = 0;

        // Only process roles that don't already have role_skills from Firecrawl
        const { data: existingSlugs } = await supabase
          .from("role_skills")
          .select("slug")
          .eq("source", "firecrawl_ksb");
        const existingSet = new Set((existingSlugs ?? []).map((r: any) => r.slug));

        const toProcess = (roles as RoleRow[]).filter(
          (r) => !existingSet.has(r.slug) && r.ncs_skills && r.ncs_skills.length > 0,
        );
        console.log(`[SE] ${toProcess.length} roles need NCS categorisation`);

        for (let i = 0; i < toProcess.length; i += 10) {
          const batch = toProcess.slice(i, i + 10);
          await Promise.all(
            batch.map(async (role) => {
              const categorised_skills = await categoriseNCSSkills(
                role.slug,
                role.ncs_skills!,
                routeNames,
                GEMINI_KEY,
              );
              if (categorised_skills.length === 0) return;
              const rows = categorised_skills.map((s, i) => ({
                slug: role.slug,
                skill_title: s.skill_title.slice(0, 250),
                skill_type: s.skill_type,
                broad_domain: s.broad_domain,
                skill_area: s.skill_area,
                source: "ncs",
                se_ksb_ref: null as string | null,
                display_order: i,
                synced_at: new Date().toISOString(),
              }));
              const { error } = await supabase.from("role_skills").upsert(rows, { onConflict: "slug,skill_title" });
              if (error) console.error(`[SE] NCS upsert error (${role.slug}):`, error.message);
              else categorised++;
            }),
          );
          await sleep(600);
        }
        console.log(`[SE] Categorised NCS skills for ${categorised} roles`);
      }

      // Mark all processed roles as synced
      const processedSlugs = (roles as RoleRow[]).map((r) => r.slug);
      await supabase
        .from("role_metadata")
        .update({ se_synced_at: new Date().toISOString() })
        .in("slug", processedSlugs);

      results.status = "completed";
      results.roles_processed = String(processedSlugs.length);
      results.matched = String(matchResults.filter((r) => r.se_occ_code).length);
    } catch (err: any) {
      results.status = "error";
      results.error = err?.message ?? String(err);
      console.error("[SE] Fatal error:", err);
    }

    console.log("[SE] Done:", results);
  })();

  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
    (EdgeRuntime as any).waitUntil(work);
  } else {
    await work;
  }

  return new Response(
    JSON.stringify({ accepted: true, message: "sync-skills-england running in background" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 202 },
  );
});
