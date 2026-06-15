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
  roleTitle: string,
  ncsSkills: string[] | null,
  routes: string[],
  geminiKey: string,
): Promise<CategorisedSkill[]> {
  const routeList = routes.join(", ");
  const roleName = roleTitle;

  let prompt: string;
  if (!ncsSkills || ncsSkills.length === 0) {
    // No NCS data — ask Gemini to generate typical skills for this role
    prompt = `Generate 10-15 typical skills, knowledge areas, and behaviours needed for the role "${roleName}" in the UK job market.
Return JSON array only. Each item must have all four fields.

Routes/domains available: ${routeList}

Return: [{"skill_title":"concise skill name","skill_type":"knowledge|skill|behaviour","broad_domain":"one from routes list","skill_area":"sub-group you create"}]`;
  } else {
    const skillList = ncsSkills.map((s, i) => `${i + 1}. ${s}`).join("\n");
    prompt = `Categorise each skill for the role "${roleName}" into structured fields.
Return JSON array only. Each item must have all four fields.

Routes/domains available: ${routeList}

Skills to categorise:
${skillList}

Return: [{"skill_title":"exact text","skill_type":"knowledge|skill|behaviour","broad_domain":"one from routes list","skill_area":"sub-group you create"}]`;
  }

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

// ── All 310 HDYD career roles (from src/data/career-map-roles.ts) ────────────
const ALL_ROLES: { title: string; slug: string }[] = [
  { title: 'Account Executive (Junior)', slug: 'account-executive-junior' },
  { title: 'Account Manager', slug: 'account-manager' },
  { title: 'Accounts Assistant', slug: 'accounts-assistant' },
  { title: 'Aerodynamicist', slug: 'aerodynamicist' },
  { title: 'Aesthetic Practitioner', slug: 'aesthetic-practitioner' },
  { title: 'Aftersales Manager', slug: 'aftersales-manager' },
  { title: 'Agronomist / Farm Consultant', slug: 'agronomist-farm-consultant' },
  { title: 'AI Policy / Trust & Safety', slug: 'ai-policy-trust-safety' },
  { title: 'AI Product Analyst / Data Analyst', slug: 'ai-product-analyst-data-analyst' },
  { title: 'AI Product Manager', slug: 'ai-product-manager' },
  { title: 'Applied AI Engineer', slug: 'applied-ai-engineer' },
  { title: 'Apprentice (Level 2/3 Agriculture)', slug: 'apprentice-level-2-3-agriculture' },
  { title: 'Apprentice Vehicle Technician', slug: 'apprentice-vehicle-technician' },
  { title: 'Area / Regional Manager', slug: 'area-regional-manager' },
  { title: 'Area Manager', slug: 'area-manager' },
  { title: 'Art Director', slug: 'art-director' },
  { title: 'Assistant Garment Technologist', slug: 'assistant-garment-technologist' },
  { title: 'Assistant Headteacher', slug: 'assistant-headteacher' },
  { title: 'Assistant Store Manager', slug: 'assistant-store-manager' },
  { title: 'Associate Product Manager', slug: 'associate-product-manager' },
  { title: 'Baker (Junior)', slug: 'baker-junior' },
  { title: 'Band 5 Physiotherapist (NHS)', slug: 'band-5-physiotherapist-nhs' },
  { title: 'Band 6 Senior Physiotherapist', slug: 'band-6-senior-physiotherapist' },
  { title: 'Band 7 Clinical Specialist', slug: 'band-7-clinical-specialist' },
  { title: 'Band 8 Consultant Physiotherapist', slug: 'band-8-consultant-physiotherapist' },
  { title: 'Barback', slug: 'barback' },
  { title: 'Barista', slug: 'barista' },
  { title: 'Barista Trainer', slug: 'barista-trainer' },
  { title: 'Bartender', slug: 'bartender' },
  { title: 'Beauty Therapist (Level 2)', slug: 'beauty-therapist-level-2' },
  { title: 'Branch / Mortgage Manager', slug: 'branch-mortgage-manager' },
  { title: 'Branch Manager', slug: 'branch-manager' },
  { title: 'Brand Manager', slug: 'brand-manager' },
  { title: 'Business Analyst', slug: 'business-analyst' },
  { title: 'Business Development Manager', slug: 'business-development-manager' },
  { title: 'Café Manager', slug: 'caf-manager' },
  { title: 'CBT Therapist (IAPT)', slug: 'cbt-therapist-iapt' },
  { title: 'Chef de Partie', slug: 'chef-de-partie' },
  { title: 'CEO / Chief Executive Officer', slug: 'ceo-chief-executive-officer' },
  { title: 'Chief AI Officer', slug: 'chief-ai-officer' },
  { title: 'Chief Commercial Officer', slug: 'chief-commercial-officer' },
  { title: 'Chief Creative Officer', slug: 'chief-creative-officer' },
  { title: 'Chief Digital Officer', slug: 'chief-digital-officer' },
  { title: 'Chief Executive', slug: 'chief-executive' },
  { title: 'Chief Financial Officer', slug: 'chief-financial-officer' },
  { title: 'Chief Information Officer (CIO)', slug: 'chief-information-officer-cio' },
  { title: 'Chief Legal Officer', slug: 'chief-legal-officer' },
  { title: 'Chief Marketing Officer', slug: 'chief-marketing-officer' },
  { title: 'Chief Operating Officer', slug: 'chief-operating-officer' },
  { title: 'Chief People Officer', slug: 'chief-people-officer' },
  { title: 'Chief Product Officer', slug: 'chief-product-officer' },
  { title: 'Chief Revenue Officer', slug: 'chief-revenue-officer' },
  { title: 'Chief Strategy Officer', slug: 'chief-strategy-officer' },
  { title: 'Chief Transformation Officer', slug: 'chief-transformation-officer' },
  { title: 'Classroom Teacher', slug: 'classroom-teacher' },
  { title: 'Clinical Director', slug: 'clinical-director' },
  { title: 'Cluster / Regional GM', slug: 'cluster-regional-gm' },
  { title: 'Commercial Analyst', slug: 'commercial-analyst' },
  { title: 'Commercial Coordinator', slug: 'commercial-coordinator' },
  { title: 'Commercial Director', slug: 'commercial-director' },
  { title: 'Commercial Finance Manager', slug: 'commercial-finance-manager' },
  { title: 'Commercial Manager', slug: 'commercial-manager' },
  { title: 'Commis Chef', slug: 'commis-chef' },
  { title: 'Community Fundraiser', slug: 'community-fundraiser' },
  { title: 'Compliance Coordinator', slug: 'compliance-coordinator' },
  { title: 'Compliance Manager', slug: 'compliance-manager' },
  { title: 'Composite Technician', slug: 'composite-technician' },
  { title: 'Concession / Flagship Manager', slug: 'concession-flagship-manager' },
  { title: 'Content Producer', slug: 'content-producer' },
  { title: 'Content Writer', slug: 'content-writer' },
  { title: 'Corporate Partnerships Manager', slug: 'corporate-partnerships-manager' },
  { title: 'Counsellor (BACP Accredited)', slug: 'counsellor-bacp-accredited' },
  { title: 'Counter Beauty Advisor', slug: 'counter-beauty-advisor' },
  { title: 'Creative Director', slug: 'creative-director' },
  { title: 'Credit Controller', slug: 'credit-controller' },
  { title: 'CRM Manager', slug: 'crm-manager' },
  { title: 'CRO / Growth Manager', slug: 'cro-growth-manager' },
  { title: 'CFD Engineer', slug: 'cfd-engineer' },
  { title: 'Culinary Director', slug: 'culinary-director' },
  { title: 'Data Analyst', slug: 'data-analyst' },
  { title: 'Data Scientist (Vehicle Performance)', slug: 'data-scientist-vehicle-performance' },
  { title: 'Dealer Principal / GM', slug: 'dealer-principal-gm' },
  { title: 'Delivery Driver / Rider', slug: 'delivery-driver-rider' },
  { title: 'Deputy Headteacher', slug: 'deputy-headteacher' },
  { title: 'Design Intern', slug: 'design-intern' },
  { title: 'Development Chef', slug: 'development-chef' },
  { title: 'DevOps / Platform Engineer', slug: 'devops-platform-engineer' },
  { title: 'Digital Marketing Manager', slug: 'digital-marketing-manager' },
  { title: 'Digital Merchandiser', slug: 'digital-merchandiser' },
  { title: 'Director / Partner', slug: 'director-partner' },
  { title: 'Director of Business Development', slug: 'director-of-business-development' },
  { title: 'Director of Fundraising', slug: 'director-of-fundraising' },
  { title: 'Director of Programmes', slug: 'director-of-programmes' },
  { title: 'Duty Manager', slug: 'duty-manager' },
  { title: 'E-commerce Coordinator', slug: 'e-commerce-coordinator' },
  { title: 'E-commerce Director', slug: 'e-commerce-director' },
  { title: 'E-commerce Manager', slug: 'e-commerce-manager' },
  { title: 'Engineering Manager', slug: 'engineering-manager' },
  { title: 'Estate Manager', slug: 'estate-manager' },
  { title: 'Executive Chef', slug: 'executive-chef' },
  { title: 'Executive Headteacher / CEO (MAT)', slug: 'executive-headteacher-ceo-mat' },
  { title: 'Executive Producer', slug: 'executive-producer' },
  { title: 'Facilities Manager', slug: 'facilities-manager' },
  { title: 'Farm Manager', slug: 'farm-manager' },
  { title: 'Farm Owner / Tenant', slug: 'farm-owner-tenant' },
  { title: 'Farm Worker / General Operative', slug: 'farm-worker-general-operative' },
  { title: 'Fashion Designer', slug: 'fashion-designer' },
  { title: 'Fashion Stylist', slug: 'fashion-stylist' },
  { title: 'Finance Director', slug: 'finance-director' },
  { title: 'Finance Graduate', slug: 'finance-graduate' },
  { title: 'Financial Analyst', slug: 'financial-analyst' },
  { title: 'Financial Controller', slug: 'financial-controller' },
  { title: 'Fitness Director', slug: 'fitness-director' },
  { title: 'Fitness Instructor', slug: 'fitness-instructor' },
  { title: 'Fitness Manager', slug: 'fitness-manager' },
  { title: 'Food Director / Head of NPD', slug: 'food-director-head-of-npd' },
  { title: 'Forklift / FLT Operator', slug: 'forklift-flt-operator' },
  { title: 'Forward Deployed Engineer', slug: 'forward-deployed-engineer' },
  { title: 'Founder / Brand Owner', slug: 'founder-brand-owner' },
  { title: 'Front of House Manager', slug: 'front-of-house-manager' },
  { title: 'Fundraising Assistant', slug: 'fundraising-assistant' },
  { title: 'Garment Technologist', slug: 'garment-technologist' },
  { title: 'General Counsel', slug: 'general-counsel' },
  { title: 'General Manager', slug: 'general-manager' },
  { title: 'Graphic Designer', slug: 'graphic-designer' },
  { title: 'Group Beverage Director', slug: 'group-beverage-director' },
  { title: 'Group Exercise Instructor', slug: 'group-exercise-instructor' },
  { title: 'Group Spa Director', slug: 'group-spa-director' },
  { title: 'Gym Floor Instructor', slug: 'gym-floor-instructor' },
  { title: 'Head Baker', slug: 'head-baker' },
  { title: 'Head Barista / Quality Lead', slug: 'head-barista-quality-lead' },
  { title: 'Head Bartender / Bar Manager', slug: 'head-bartender-bar-manager' },
  { title: 'Head Chef', slug: 'head-chef' },
  { title: 'Head of AI / Director of Research', slug: 'head-of-ai-director-of-research' },
  { title: 'Head of Brand', slug: 'head-of-brand' },
  { title: 'Head of Coffee / Coffee Director', slug: 'head-of-coffee-coffee-director' },
  { title: 'Head of Commercial', slug: 'head-of-commercial' },
  { title: 'Head of Compliance', slug: 'head-of-compliance' },
  { title: 'Head of Content', slug: 'head-of-content' },
  { title: 'Head of Content / Programming', slug: 'head-of-content-programming' },
  { title: 'Head of Creative', slug: 'head-of-creative' },
  { title: 'Head of Design', slug: 'head-of-design' },
  { title: 'Head of Digital', slug: 'head-of-digital' },
  { title: 'Head of Digital Trading', slug: 'head-of-digital-trading' },
  { title: 'Head of E-commerce', slug: 'head-of-e-commerce' },
  { title: 'Head of Engineering / VP', slug: 'head-of-engineering-vp' },
  { title: 'Head of Finance', slug: 'head-of-finance' },
  { title: 'Head of FP&A', slug: 'head-of-fp-a' },
  { title: 'Head of Fundraising', slug: 'head-of-fundraising' },
  { title: 'Head of Garment Technology', slug: 'head-of-garment-technology' },
  { title: 'Head of Logistics / Supply Chain Director', slug: 'head-of-logistics-supply-chain-director' },
  { title: 'Head of Marketing', slug: 'head-of-marketing' },
  { title: 'Head of Mortgages', slug: 'head-of-mortgages' },
  { title: 'Head of Operations', slug: 'head-of-operations' },
  { title: 'Head of People', slug: 'head-of-people' },
  { title: 'Head of Physiotherapy / Allied Health', slug: 'head-of-physiotherapy-allied-health' },
  { title: 'Head of PMO', slug: 'head-of-pmo' },
  { title: 'Head of Product', slug: 'head-of-product' },
  { title: 'Head of Production', slug: 'head-of-production' },
  { title: 'Head of Psychological Services', slug: 'head-of-psychological-services' },
  { title: 'Head of PT / Fitness Manager', slug: 'head-of-pt-fitness-manager' },
  { title: 'Head of Retail / Retail Director', slug: 'head-of-retail-retail-director' },
  { title: 'Head of Sales', slug: 'head-of-sales' },
  { title: 'Head of Strategy', slug: 'head-of-strategy' },
  { title: 'Head of Supply Chain', slug: 'head-of-supply-chain' },
  { title: 'Head of Talent', slug: 'head-of-talent' },
  { title: 'Head Waiter / Section Leader', slug: 'head-waiter-section-leader' },
  { title: 'Headteacher', slug: 'headteacher' },
  { title: 'HGV Class 1/2 Driver', slug: 'hgv-class-1-2-driver' },
  { title: 'Hotel Manager', slug: 'hotel-manager' },
  { title: 'HR Business Partner', slug: 'hr-business-partner' },
  { title: 'HR Coordinator', slug: 'hr-coordinator' },
  { title: 'Individual Giving Manager', slug: 'individual-giving-manager' },
  { title: 'Interior Stylist', slug: 'interior-stylist' },
  { title: 'Internal Auditor', slug: 'internal-auditor' },
  { title: 'IT Support Analyst', slug: 'it-support-analyst' },
  { title: 'Junior Designer', slug: 'junior-designer' },
  { title: 'Junior Personal Trainer', slug: 'junior-personal-trainer' },
  { title: 'Junior Physiotherapist (Private)', slug: 'junior-physiotherapist-private' },
  { title: 'Junior Producer', slug: 'junior-producer' },
  { title: 'Junior Software Engineer', slug: 'junior-software-engineer' },
  { title: 'Key Account Director', slug: 'key-account-director' },
  { title: 'Kitchen Porter / Apprentice', slug: 'kitchen-porter-apprentice' },
  { title: 'L&D Manager', slug: 'l-d-manager' },
  { title: 'Lead Trainer / Educator', slug: 'lead-trainer-educator' },
  { title: 'Legal Assistant / Paralegal', slug: 'legal-assistant-paralegal' },
  { title: 'Legal Counsel', slug: 'legal-counsel' },
  { title: 'Lettings Negotiator', slug: 'lettings-negotiator' },
  { title: 'Logistics Assistant', slug: 'logistics-assistant' },
  { title: 'Machine Learning Engineer', slug: 'machine-learning-engineer' },
  { title: 'Major Donor Lead', slug: 'major-donor-lead' },
  { title: 'Management Accountant', slug: 'management-accountant' },
  { title: 'Managing Director', slug: 'managing-director' },
  { title: 'Marketing Assistant', slug: 'marketing-assistant' },
  { title: 'Marketing Director', slug: 'marketing-director' },
  { title: 'Marketing Intern', slug: 'marketing-intern' },
  { title: 'Marketing Manager', slug: 'marketing-manager' },
  { title: 'Master Technician / Diagnostic Specialist', slug: 'master-technician-diagnostic-specialist' },
  { title: 'Master Trainer', slug: 'master-trainer' },
  { title: 'Mental Health Support Worker', slug: 'mental-health-support-worker' },
  { title: 'ML / AI Engineer (Junior)', slug: 'ml-ai-engineer-junior' },
  { title: 'Mortgage Administrator', slug: 'mortgage-administrator' },
  { title: 'Mortgage Advisor', slug: 'mortgage-advisor' },
  { title: 'Mortgage Broker / Founder', slug: 'mortgage-broker-founder' },
  { title: 'Motion Designer', slug: 'motion-designer' },
  { title: 'Music Producer', slug: 'music-producer' },
  { title: 'NQT / ECT', slug: 'nqt-ect' },
  { title: 'Online Coach / Educator', slug: 'online-coach-educator' },
  { title: 'Operations Coordinator', slug: 'operations-coordinator' },
  { title: 'Operations Director', slug: 'operations-director' },
  { title: 'Operations Manager', slug: 'operations-manager' },
  { title: 'Partnerships Manager', slug: 'partnerships-manager' },
  { title: 'Parts Advisor', slug: 'parts-advisor' },
  { title: 'Pattern Cutter', slug: 'pattern-cutter' },
  { title: 'Payroll Administrator', slug: 'payroll-administrator' },
  { title: 'People Director / HR Director', slug: 'people-director-hr-director' },
  { title: 'Personal Trainer', slug: 'personal-trainer' },
  { title: 'PMO Analyst', slug: 'pmo-analyst' },
  { title: 'PR & Comms Manager', slug: 'pr-comms-manager' },
  { title: 'Private Practice Owner', slug: 'private-practice-owner' },
  { title: 'Process Improvement Manager', slug: 'process-improvement-manager' },
  { title: 'Producer', slug: 'producer' },
  { title: 'Product Analyst', slug: 'product-analyst' },
  { title: 'Product Manager', slug: 'product-manager' },
  { title: 'Product Manager (Technical)', slug: 'product-manager-technical' },
  { title: 'Programme Manager', slug: 'programme-manager' },
  { title: 'Project Coordinator', slug: 'project-coordinator' },
  { title: 'Project Manager', slug: 'project-manager' },
  { title: 'Protection Advisor', slug: 'protection-advisor' },
  { title: 'Psychotherapist', slug: 'psychotherapist' },
  { title: 'Quality Assurance Assistant', slug: 'quality-assurance-assistant' },
  { title: 'Receptionist / Front Office', slug: 'receptionist-front-office' },
  { title: 'Recruitment Coordinator', slug: 'recruitment-coordinator' },
  { title: 'Regional Director', slug: 'regional-director' },
  { title: 'Regional Fitness Director', slug: 'regional-fitness-director' },
  { title: 'Regional Operations Director', slug: 'regional-operations-director' },
  { title: 'Research Engineer (Early Career)', slug: 'research-engineer-early-career' },
  { title: 'Research Scientist', slug: 'research-scientist' },
  { title: 'Restaurant Manager', slug: 'restaurant-manager' },
  { title: 'Runner / Production Assistant', slug: 'runner-production-assistant' },
  { title: 'Sales Assistant / SDR', slug: 'sales-assistant-sdr' },
  { title: 'Sales Assistant / Store Colleague', slug: 'sales-assistant-store-colleague' },
  { title: 'Sales Director', slug: 'sales-director' },
  { title: 'Sales Manager', slug: 'sales-manager' },
  { title: 'Salon Owner / Founder', slug: 'salon-owner-founder' },
  { title: 'Senior / Staff ML Engineer', slug: 'senior-staff-ml-engineer' },
  { title: 'Senior Barista / Shift Supervisor', slug: 'senior-barista-shift-supervisor' },
  { title: 'Senior Beauty Therapist (Level 3+)', slug: 'senior-beauty-therapist-level-3' },
  { title: 'Senior Designer / Design Lead', slug: 'senior-designer-design-lead' },
  { title: 'Senior Designer / Design Manager', slug: 'senior-designer-design-manager' },
  { title: 'Senior Engineer / Staff Engineer', slug: 'senior-engineer-staff-engineer' },
  { title: 'Senior Garment Technologist', slug: 'senior-garment-technologist' },
  { title: 'Senior Legal Counsel', slug: 'senior-legal-counsel' },
  { title: 'Senior Mortgage Advisor', slug: 'senior-mortgage-advisor' },
  { title: 'Senior Negotiator', slug: 'senior-negotiator' },
  { title: 'Senior Producer', slug: 'senior-producer' },
  { title: 'Senior Product Manager', slug: 'senior-product-manager' },
  { title: 'Senior Programme Manager', slug: 'senior-programme-manager' },
  { title: 'Senior Stylist / Style Director', slug: 'senior-stylist-style-director' },
  { title: 'Senior Therapist / Clinical Lead', slug: 'senior-therapist-clinical-lead' },
  { title: 'Service Advisor', slug: 'service-advisor' },
  { title: 'Shift Manager', slug: 'shift-manager' },
  { title: 'Site / Distribution Centre Manager', slug: 'site-distribution-centre-manager' },
  { title: 'Social Media Coordinator', slug: 'social-media-coordinator' },
  { title: 'Software Engineer', slug: 'software-engineer' },
  { title: 'Solutions Engineer', slug: 'solutions-engineer' },
  { title: 'Sous Chef', slug: 'sous-chef' },
  { title: 'Spa / Salon Manager', slug: 'spa-salon-manager' },
  { title: 'Specialist Coach', slug: 'specialist-coach' },
  { title: 'Sports Physiotherapist', slug: 'sports-physiotherapist' },
  { title: 'Stockperson / Herdsperson', slug: 'stockperson-herdsperson' },
  { title: 'Store Manager', slug: 'store-manager' },
  { title: 'Strategy Analyst', slug: 'strategy-analyst' },
  { title: 'Strategy Manager', slug: 'strategy-manager' },
  { title: 'Studio Owner', slug: 'studio-owner' },
  { title: 'Styling Assistant', slug: 'styling-assistant' },
  { title: 'Subject Lead / Head of Department', slug: 'subject-lead-head-of-department' },
  { title: 'Supervisor / Team Leader', slug: 'supervisor-team-leader' },
  { title: 'Supply Chain Manager', slug: 'supply-chain-manager' },
  { title: 'Talent Acquisition Manager', slug: 'talent-acquisition-manager' },
  { title: 'Tax Manager', slug: 'tax-manager' },
  { title: 'Teaching Assistant', slug: 'teaching-assistant' },
  { title: 'Tech Manager', slug: 'tech-manager' },
  { title: 'Tractor / Combine Operator', slug: 'tractor-combine-operator' },
  { title: 'Trainee Barista', slug: 'trainee-barista' },
  { title: 'Trainee Counsellor / Therapist', slug: 'trainee-counsellor-therapist' },
  { title: 'Trainee Estate Agent', slug: 'trainee-estate-agent' },
  { title: 'Trainee Mortgage Advisor', slug: 'trainee-mortgage-advisor' },
  { title: 'Trainee Teacher (PGCE / QTS)', slug: 'trainee-teacher-pgce-qts' },
  { title: 'Transport Manager', slug: 'transport-manager' },
  { title: 'Treasury Manager', slug: 'treasury-manager' },
  { title: 'Trusts & Foundations Manager', slug: 'trusts-foundations-manager' },
  { title: 'UX/Product Designer', slug: 'ux-product-designer' },
  { title: 'Valuer', slug: 'valuer' },
  { title: 'Vehicle Technician', slug: 'vehicle-technician' },
  { title: 'Venue Owner / Operator', slug: 'venue-owner-operator' },
  { title: 'Visual Merchandiser (Junior)', slug: 'visual-merchandiser-junior' },
  { title: 'VP Engineering (AI Infra)', slug: 'vp-engineering-ai-infra' },
  { title: 'VP of Finance', slug: 'vp-of-finance' },
  { title: 'VP of Marketing', slug: 'vp-of-marketing' },
  { title: 'VP of Operations', slug: 'vp-of-operations' },
  { title: 'VP of Product', slug: 'vp-of-product' },
  { title: 'VP of Strategy', slug: 'vp-of-strategy' },
  { title: 'VP Operations / COO', slug: 'vp-operations-coo' },
  { title: 'Waiter / Front of House', slug: 'waiter-front-of-house' },
  { title: 'Warehouse Operative', slug: 'warehouse-operative' },
  { title: 'Warehouse Operative / Picker', slug: 'warehouse-operative-picker' },
  { title: 'Warehouse Team Leader / Shift Supervisor', slug: 'warehouse-team-leader-shift-supervisor' },
  { title: 'Workshop Controller / Service Manager', slug: 'workshop-controller-service-manager' },
  { title: 'Year Group Lead / Pastoral Lead', slug: 'year-group-lead-pastoral-lead' },
];

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

  let body: { slugs?: string[]; offset?: number } = {};
  try { body = await req.json(); } catch { body = {}; }

  // Support optional slug filter or offset for batch resumption
  const slugFilter: string[] | null = body.slugs ?? null;
  const offset = body.offset ?? 0;

  const work = (async () => {
    const results: Record<string, string> = {};

    try {
      // Fetch SE routes for domain taxonomy
      const seRoutes = await fetchSERoutes("");
      const routeNames = seRoutes.map((r) => r.name);

      // Determine which roles to process
      let roles = slugFilter
        ? ALL_ROLES.filter((r) => slugFilter.includes(r.slug))
        : ALL_ROLES.slice(offset);

      // Skip roles that already have skills
      const { data: existingRows } = await supabase
        .from("role_skills")
        .select("slug");
      const existingSet = new Set((existingRows ?? []).map((r: any) => r.slug));
      const toProcess = roles.filter((r) => !existingSet.has(r.slug));

      console.log(`[SE] ${toProcess.length} roles need skills (${existingSet.size} already done)`);
      let categorised = 0;

      // Process in batches of 8 in parallel
      for (let i = 0; i < toProcess.length; i += 8) {
        const batch = toProcess.slice(i, i + 8);
        await Promise.all(
          batch.map(async (role) => {
            const skills = await categoriseNCSSkills(role.title, null, routeNames, GEMINI_KEY);
            if (skills.length === 0) return;

            // Deduplicate within the batch by normalised title before upserting.
            // Normalise: lowercase, strip punctuation, collapse spaces.
            // This prevents "Problem-Solving", "Problem Solving", and "Problem solving"
            // from all landing as separate rows in the same generation run.
            const seen = new Set<string>();
            const deduped = skills.filter((s) => {
              const key = s.skill_title.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            if (deduped.length < skills.length) {
              console.log(`[SE] ${role.slug}: dropped ${skills.length - deduped.length} within-batch dupes`);
            }

            const rows = deduped.map((s, idx) => ({
              slug: role.slug,
              skill_title: s.skill_title.slice(0, 250),
              skill_type: s.skill_type,
              broad_domain: s.broad_domain,
              skill_area: s.skill_area,
              source: "ai_generated" as const,
              se_ksb_ref: null as string | null,
              display_order: idx,
              synced_at: new Date().toISOString(),
            }));
            const { error } = await supabase
              .from("role_skills")
              .upsert(rows, { onConflict: "slug,skill_title" });
            if (error) console.error(`[SE] upsert error (${role.slug}):`, error.message);
            else categorised++;
          }),
        );
        await sleep(500);
      }

      results.status = "completed";
      results.roles_processed = String(categorised);
      results.total_with_skills = String(existingSet.size + categorised);
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
