#!/usr/bin/env node
// Full external link audit. Walks src/ for http(s) URLs, checks each, writes a
// markdown report to /mnt/documents/link-audit.md.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT = "/mnt/documents/link-audit.md";

const SKIP_HOSTS = new Set([
  "example.com", "localhost", "127.0.0.1", "0.0.0.0",
  "schema.org", "www.w3.org", "www.gstatic.com", "fonts.googleapis.com",
  "fonts.gstatic.com", "ogp.me",
  // Internal/template:
  "supabase.co", "supabase.in", "lovable.app", "lovable.dev",
  // Image CDNs that are programmatic, not curated:
  "i.ytimg.com", "img.youtube.com", "image.tmdb.org", "i.scdn.co",
  "is1-ssl.mzstatic.com", "is2-ssl.mzstatic.com", "is3-ssl.mzstatic.com",
  "is4-ssl.mzstatic.com", "is5-ssl.mzstatic.com",
  // Loaded as part of embeds, not direct links:
  "youtube-nocookie.com", "www.youtube-nocookie.com",
]);

const URL_RX = /https?:\/\/[^\s"'`<>)\\]+/g;

const walk = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|jsx?|mdx?|html|json|css)$/.test(e.name)) acc.push(p);
  }
  return acc;
};

const files = walk(SRC);

const refs = new Map(); // url -> [{file, line}]
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(URL_RX)) {
      let url = m[0]
        .replace(/[.,;:!?)\]]+$/, "") // trailing punctuation
        .replace(/\\+$/, "");
      // Skip URLs containing template-literal placeholders — they aren't real links.
      if (url.includes("${") || url.includes("%24%7B") || url.includes("%7B")) continue;
      try {
        const u = new URL(url);
        if (SKIP_HOSTS.has(u.hostname)) continue;
        if (u.hostname.endsWith(".lovable.app") || u.hostname.endsWith(".supabase.co")) continue;
        const key = `${u.protocol}//${u.host}${u.pathname}${u.search}`;
        if (!refs.has(key)) refs.set(key, []);
        refs.get(key).push({ file: path.relative(ROOT, f), line: i + 1 });
      } catch { /* not a URL */ }
    }
  });
}

const urls = [...refs.keys()];
console.log(`Discovered ${urls.length} unique URLs across ${files.length} files`);

const UA = "Mozilla/5.0 (compatible; HowdyDoYouBot/1.0; +https://howdoyoudo.group)";
const TIMEOUT_MS = 12000;
const CONCURRENCY = 12;

async function check(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const fetchOpts = {
    headers: { "User-Agent": UA, Accept: "*/*" },
    redirect: "follow",
    signal: ctrl.signal,
  };
  try {
    let res = await fetch(url, { ...fetchOpts, method: "HEAD" });
    if (res.status === 405 || res.status === 403 || res.status === 400 || res.status === 501) {
      res = await fetch(url, { ...fetchOpts, method: "GET" });
    }
    clearTimeout(t);
    // 401/402/403/429 are typically paywall / anti-bot / rate-limit, not broken.
    const ok = res.status < 400 || [401, 402, 403, 429].includes(res.status);
    return { status: res.status, ok };
  } catch (e) {
    clearTimeout(t);
    return { status: 0, ok: false, error: e.code || e.name || String(e).slice(0, 80) };
  }
}

const results = [];
let done = 0;
async function worker(queue) {
  while (queue.length) {
    const url = queue.shift();
    const r = await check(url);
    results.push({ url, ...r });
    done++;
    if (done % 25 === 0) console.log(`  ${done}/${urls.length}`);
  }
}

const queue = [...urls];
const workers = Array.from({ length: CONCURRENCY }, () => worker(queue));
await Promise.all(workers);

const broken = results
  .filter((r) => !r.ok)
  .sort((a, b) => (a.status || 999) - (b.status || 999));

let md = `# Link Audit Report\n\n`;
md += `Scanned **${urls.length}** unique external URLs across **${files.length}** files.\n\n`;
md += `- **OK** (status <400, or 403/429 treated as anti-bot per project rule): ${results.length - broken.length}\n`;
md += `- **Broken / suspicious**: ${broken.length}\n\n`;
md += `Generated ${new Date().toISOString()}\n\n---\n\n`;

if (broken.length === 0) {
  md += `## All clear\n\nNo broken links found.\n`;
} else {
  md += `## Broken links\n\n`;
  for (const b of broken) {
    md += `### ${b.status || "ERR"} — ${b.url}\n\n`;
    if (b.error) md += `- Error: \`${b.error}\`\n`;
    const where = refs.get(b.url) || [];
    for (const w of where.slice(0, 6)) md += `- ${w.file}:${w.line}\n`;
    if (where.length > 6) md += `- …and ${where.length - 6} more\n`;
    md += `\n`;
  }
}

fs.mkdirSync("/mnt/documents", { recursive: true });
fs.writeFileSync(OUT, md);
console.log(`\nReport: ${OUT}`);
console.log(`Broken: ${broken.length}/${urls.length}`);
