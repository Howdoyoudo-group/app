/**
 * Logo proxy — fetches company/school logos server-side and returns a
 * base64 data URL so the browser can embed them in jsPDF without CORS issues.
 *
 * GET /fetch-logo?domain=drmartens.com
 * GET /fetch-logo?name=Dr+Martens
 *
 * Returns: { dataUrl: "data:image/png;base64,..." } or { error: "..." }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// logo.dev token (already used in daily digest)
const LOGO_DEV_TOKEN = "pk_X-1ZO13GSgeOoUrIuJ6GMQ";

function guessDomains(name: string): string[] {
  const clean = name
    .toLowerCase()
    .replace(/\b(ltd|limited|plc|inc|llc|group|uk|the|of|and|&)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "")
    .trim()
    .slice(0, 30);
  if (!clean || clean.length < 2) return [];
  return [`${clean}.com`, `${clean}.co.uk`];
}

async function tryLogo(domain: string): Promise<string | null> {
  const urls = [
    `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`,
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain_url=https://${domain}&sz=128`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") || "";
      if (!ct.startsWith("image/")) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 200) continue; // skip tiny/blank images
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const mime = ct.split(";")[0].trim();
      return `data:${mime};base64,${b64}`;
    } catch { continue; }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const params = new URL(req.url).searchParams;
  const domain = params.get("domain")?.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const name = params.get("name") || "";

  const domains: string[] = [];
  if (domain) domains.push(domain);
  for (const d of guessDomains(name)) {
    if (!domains.includes(d)) domains.push(d);
  }

  if (domains.length === 0) {
    return new Response(JSON.stringify({ error: "Provide domain or name param" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  for (const d of domains) {
    const dataUrl = await tryLogo(d);
    if (dataUrl) {
      return new Response(JSON.stringify({ dataUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Logo not found" }), {
    status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
