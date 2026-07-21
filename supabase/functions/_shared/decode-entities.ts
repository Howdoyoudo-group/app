// Shared HTML/XML entity decoder for job scrapers.
//
// Job sources encode entities inconsistently and some (notably CV-Library)
// DOUBLE-encode: the feed literally contains "&amp;pound;17.34" and
// "&amp;rsquo;". A single decode pass leaves "&pound;" / "&rsquo;" intact,
// which is why titles rendered as "Support Worker &ndash; Children&rsquo;s
// Residential Care" across the site.
//
// decodeEntities:
//   - handles numeric (&#39;) and hex (&#x27;) references
//   - covers the named entities the feeds actually use (not just the 5 XML ones)
//   - decodes repeatedly until stable, so double-encoding is fully unwound
//   - is idempotent: text with no entities is returned unchanged, so it is
//     safe to apply at a write boundary over already-clean rows
//
// Apply it wherever a scraper writes a job's title/description/salary, ideally
// at the single upsert choke point so every source is covered regardless of
// adapter.

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: " ", pound: "£", euro: "€", cent: "¢", yen: "¥",
  ndash: "–", mdash: "—", hellip: "…", bull: "•", middot: "·",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  copy: "©", reg: "®", trade: "™", deg: "°", plusmn: "±",
  frac12: "½", frac14: "¼", frac34: "¾", times: "×", divide: "÷",
  eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", uuml: "ü", ouml: "ö", auml: "ä",
};

function decodeOnce(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => {
      const code = parseInt(d, 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : _;
    })
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, h) => {
      const code = parseInt(h, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : _;
    })
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (m, name) => {
      const key = String(name).toLowerCase();
      return key in NAMED_ENTITIES ? NAMED_ENTITIES[key] : m;
    });
}

/**
 * Decode HTML/XML entities, unwinding double-encoding. Idempotent.
 * Returns "" for null/undefined so it is safe to call on optional fields.
 */
export function decodeEntities(s: string | null | undefined): string {
  if (!s) return "";
  let out = s;
  // 3 passes is ample for the double-encoding seen in the feeds; the loop
  // exits as soon as a pass makes no change.
  for (let i = 0; i < 3; i++) {
    const next = decodeOnce(out);
    if (next === out) break;
    out = next;
  }
  return out;
}
