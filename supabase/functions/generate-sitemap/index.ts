// generate-sitemap
//
// Serves sitemap.xml dynamically instead of the old hand-maintained static
// file, which had already silently drifted (missing Politics and Theatre
// entirely — the exact bug class CLAUDE.md warns about for hardcoded page
// lists). Reuses the SAME source-of-truth data files the frontend reads
// (src/data/industries.ts, src/data/roles.ts — both are dependency-free pure
// data modules, safe to import cross-directory into a Deno function) so this
// can never drift from what pages actually exist again.
//
// Companies are the union of the ~38 hardcoded /company/<slug> routes in
// App.tsx and the live `employer_companies` table, deduped by slug — the two
// don't perfectly overlap (35 in the table vs 38 routes at time of writing),
// so either alone would under-list.
//
// No auth (public data, verify_jwt = false in config.toml). Cached for an
// hour so it doesn't rebuild on every single crawler hit, while staying far
// fresher than the static file it replaces.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { INDUSTRIES } from "../../../src/data/industries.ts";
import { roles } from "../../../src/data/roles.ts";

const SITE_URL = "https://www.howdoyoudo.co.uk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Core pages that aren't derived from a data file — carried over from the old
// static sitemap.
const CORE_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/marketplace", priority: "0.9", changefreq: "daily" },
  { path: "/roles", priority: "0.8", changefreq: "weekly" },
  { path: "/learning", priority: "0.7", changefreq: "weekly" },
  { path: "/employers", priority: "0.6", changefreq: "weekly" },
  { path: "/cv-builder", priority: "0.6", changefreq: "monthly" },
  { path: "/starting-a-business", priority: "0.5", changefreq: "monthly" },
  { path: "/the-show", priority: "0.5", changefreq: "weekly" },
  { path: "/contact", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.2", changefreq: "yearly" },
];

// Bespoke /company/<slug> routes hardcoded in App.tsx (not all of these are
// necessarily in employer_companies yet, and vice versa).
const HARDCODED_COMPANY_SLUGS = [
  "adidas", "asos", "birkenstock", "blank-street", "burberry", "caffe-nero",
  "costa", "dice", "dr-martens", "everyman", "fever-tree", "five-guys",
  "gails", "greggs", "grind", "hawkstone", "me-em", "netflix", "news-uk",
  "nike", "ocado", "ocado-group", "ocado-logistics", "ocado-retail",
  "pragnell", "premier-league", "purplebricks", "rightmove",
  "save-the-children", "savills", "sky-sports", "soho-house", "starbucks",
  "teach-first", "tesco", "timberland", "tom-dixon", "ugg",
];

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(path: string, opts: { priority?: string; changefreq?: string; lastmod?: string } = {}): string {
  const loc = `${SITE_URL}${path}`;
  let entry = `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n`;
  if (opts.lastmod) entry += `    <lastmod>${opts.lastmod}</lastmod>\n`;
  if (opts.changefreq) entry += `    <changefreq>${opts.changefreq}</changefreq>\n`;
  if (opts.priority) entry += `    <priority>${opts.priority}</priority>\n`;
  entry += `  </url>`;
  return entry;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const today = new Date().toISOString().split("T")[0];
    const urls: string[] = [];

    // Core pages — these are live/dynamic content, so a fresh lastmod is honest.
    for (const p of CORE_PAGES) {
      urls.push(urlEntry(p.path, { ...p, lastmod: today }));
    }

    // Industries — from the same source of truth the frontend uses. No
    // lastmod: we don't track true per-page modification dates, and claiming
    // "changed today" on every generation would be dishonest.
    for (const ind of INDUSTRIES) {
      urls.push(urlEntry(`/${ind.slug}`, { priority: "0.8", changefreq: "weekly" }));
    }

    // Roles
    for (const role of roles) {
      urls.push(urlEntry(`/roles/${role.slug}`, { priority: "0.6", changefreq: "monthly" }));
    }

    // Companies: union of the live table and the hardcoded routes, deduped.
    const companySlugs = new Set<string>(HARDCODED_COMPANY_SLUGS);
    const { data: companies, error: companiesError } = await supabase
      .from("employer_companies")
      .select("slug");
    if (companiesError) throw companiesError;
    for (const c of companies ?? []) {
      if (c.slug) companySlugs.add(c.slug);
    }
    for (const slug of companySlugs) {
      urls.push(urlEntry(`/company/${slug}`, { priority: "0.5", changefreq: "monthly" }));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("generate-sitemap error:", err);
    return new Response(`<?xml version="1.0"?><error>${err instanceof Error ? err.message : "Unknown error"}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" },
    });
  }
});
