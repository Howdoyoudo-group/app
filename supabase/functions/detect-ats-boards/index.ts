/**
 * detect-ats-boards
 *
 * Accepts a single company and detects which ATS they use.
 * Call from a local script iterating through companies.
 *
 * POST body: { company: string, industry: string, url: string }
 * Returns: { ats_type, board_slug, wd_tenant, wd_site, wd_version, final_url, notes, in_scraper }
 *
 * Or GET with ?offset=N&limit=M to run a slice of the built-in company list.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ── ATS detection patterns ────────────────────────────────────────────────────

interface AtsMatch {
  type: string;
  board_slug?: string;
  wd_tenant?: string;
  wd_site?: string;
  wd_version?: string;
}

const ATS_URL_PATTERNS: Array<{
  type: string;
  pattern: RegExp;
  extract: (m: RegExpMatchArray, url: string) => Partial<AtsMatch>;
}> = [
  { type: "workday",  pattern: /([a-z0-9-]+)\.(wd\d+)\.myworkdayjobs\.com(?:\/([^/?#]+))?/i, extract: (m) => ({ wd_tenant: m[1], wd_version: m[2], wd_site: m[3] || "External" }) },
  { type: "greenhouse", pattern: /boards(?:-api)?\.greenhouse\.io\/(?:v1\/boards\/)?([a-z0-9_-]+)/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "greenhouse", pattern: /app\.greenhouse\.io\/accounts\/([a-z0-9_-]+)/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "lever",    pattern: /jobs\.lever\.co\/([a-z0-9_-]+)/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "workable", pattern: /(?:apply|jobs)\.workable\.com\/([a-z0-9_-]+)/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "teamtailor", pattern: /([a-z0-9_-]+)\.teamtailor\.com/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "pinpoint", pattern: /([a-z0-9_-]+)\.pinpointhq\.com/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "ashby",    pattern: /jobs\.ashbyhq\.com\/([a-z0-9_-]+)/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "smartrecruiters", pattern: /jobs\.smartrecruiters\.com\/([a-z0-9_-]+)/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "recruitee", pattern: /([a-z0-9_-]+)\.recruitee\.com/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "bamboohr", pattern: /([a-z0-9_-]+)\.bamboohr\.com\/jobs/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "jobvite",  pattern: /jobs\.jobvite\.com\/([a-z0-9_-]+)/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "successfactors", pattern: /([a-z0-9_-]+)\.successfactors\.com/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "taleo",    pattern: /([a-z0-9_-]+)\.taleo\.net/i, extract: (m) => ({ board_slug: m[1] }) },
  { type: "breezy",   pattern: /([a-z0-9_-]+)\.breezy\.hr/i, extract: (m) => ({ board_slug: m[1] }) },
];

const DOMAIN_HINTS: Array<{ domain: string; type: string }> = [
  { domain: "myworkdayjobs.com", type: "workday" },
  { domain: "greenhouse.io", type: "greenhouse" },
  { domain: "lever.co", type: "lever" },
  { domain: "workable.com", type: "workable" },
  { domain: "teamtailor.com", type: "teamtailor" },
  { domain: "pinpointhq.com", type: "pinpoint" },
  { domain: "ashbyhq.com", type: "ashby" },
  { domain: "smartrecruiters.com", type: "smartrecruiters" },
  { domain: "recruitee.com", type: "recruitee" },
  { domain: "bamboohr.com", type: "bamboohr" },
  { domain: "jobvite.com", type: "jobvite" },
  { domain: "icims.com", type: "icims" },
  { domain: "successfactors.com", type: "successfactors" },
  { domain: "taleo.net", type: "taleo" },
  { domain: "breezy.hr", type: "breezy" },
];

const ALREADY_IN_SCRAPER = new Set([
  "lseg","bupa","nike","diageo","skechers","jlp","lbg","christies","deckers","puma","clarks","asics","on",
  "vfc","signetjewelers","umusic","warnermusic","sonymusic","livenation","medivet","ramsayhealthcare","hsbc",
  "expedia","unilever","redbull","burberry","condenast","brentfordfootballclub","sky","netflix","wbd",
  "paramount","odeon","ea","ubisoft","newsuk","itv","adidas","footlocker","newbalance","pandora","richemont",
  "lvmh","heineken","abinbev","carlsberg",
  "monzo","sothebys","butternutbox","whalarinc","rightmovecareers","a24","gymshark","airbnb","skyscanner",
  "jdsports","dicefm-careers","aegpresents","bmg","prsformusic","concord","hospitalrecords","kobalt",
  "beggarsgroup","framestore","dneg","everymancinema","themill","cinesite","lionsgate","reach","theguardian",
  "hearstuk","gbnews","telegraph","drmartens","schuh","sega","wargaming","brewdog","greeneking",
  "spotify","soundcloud","deezer","ticketmaster","rockstargames","take-two","rebellion","kurtgeiger",
  "the-economist-group","future-plc","bfi","sister-pictures",
  "premierleague","chelseafc","manutd","cpfc","afcb","safc","sufc","astonmartinf1","pret",
]);

function detectAtsFromUrl(url: string): AtsMatch | null {
  for (const { type, pattern, extract } of ATS_URL_PATTERNS) {
    const m = url.match(pattern);
    if (m) return { type, ...extract(m, url) };
  }
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const { domain, type } of DOMAIN_HINTS) {
      if (host.includes(domain)) return { type };
    }
  } catch {}
  return null;
}

function detectAtsFromHtml(html: string): AtsMatch | null {
  for (const { type, pattern, extract } of ATS_URL_PATTERNS) {
    const m = html.match(pattern);
    if (m) return { type, ...extract(m, html) };
  }
  return null;
}

async function detectOne(company: string, industry: string, careerUrl: string) {
  let finalUrl = careerUrl;

  // 1. URL pattern (no network)
  const fromUrl = detectAtsFromUrl(careerUrl);
  if (fromUrl) {
    return { ats_type: fromUrl.type, board_slug: fromUrl.board_slug ?? null, wd_tenant: fromUrl.wd_tenant ?? null, wd_site: fromUrl.wd_site ?? null, wd_version: fromUrl.wd_version ?? null, final_url: careerUrl, notes: "url pattern" };
  }

  // 2. Fetch page (follow redirects)
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 6000);
    let res: Response;
    try {
      res = await fetch(careerUrl, { signal: controller.signal, redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (compatible; HowDoYouDoBot/1.0)" } });
    } finally {
      clearTimeout(id);
    }

    finalUrl = res.url;
    const fromFinal = detectAtsFromUrl(finalUrl);
    if (fromFinal) {
      return { ats_type: fromFinal.type, board_slug: fromFinal.board_slug ?? null, wd_tenant: fromFinal.wd_tenant ?? null, wd_site: fromFinal.wd_site ?? null, wd_version: fromFinal.wd_version ?? null, final_url: finalUrl, notes: "redirect" };
    }

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("text/html")) {
      const html = await res.text();
      const fromHtml = detectAtsFromHtml(html);
      if (fromHtml) {
        return { ats_type: fromHtml.type, board_slug: fromHtml.board_slug ?? null, wd_tenant: fromHtml.wd_tenant ?? null, wd_site: fromHtml.wd_site ?? null, wd_version: fromHtml.wd_version ?? null, final_url: finalUrl, notes: "html links" };
      }
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ats_type: null, board_slug: null, wd_tenant: null, wd_site: null, wd_version: null, final_url: null, notes: msg.includes("abort") ? "timeout" : `fetch error: ${msg.slice(0, 80)}` };
  }

  return { ats_type: null, board_slug: null, wd_tenant: null, wd_site: null, wd_version: null, final_url: finalUrl, notes: "not found" };
}

Deno.serve(async (req) => {
  const body = req.method === "POST" ? await req.json().catch(() => null) : null;

  if (!body?.company || !body?.url) {
    return new Response(JSON.stringify({ error: "POST body must include company, industry, url" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { company, industry, url: careerUrl } = body;
  const result = await detectOne(company, industry, careerUrl);

  const isInScraper = result.wd_tenant
    ? ALREADY_IN_SCRAPER.has(result.wd_tenant)
    : result.board_slug
      ? ALREADY_IN_SCRAPER.has(result.board_slug)
      : false;

  const row = {
    company,
    industry,
    career_url: careerUrl,
    ...result,
    in_scraper: isInScraper,
    detected_at: new Date().toISOString(),
  };

  await supabase
    .from("ats_detection_results")
    .upsert(row, { onConflict: "career_url" });

  return new Response(JSON.stringify(row), { headers: { "Content-Type": "application/json" } });
});
