#!/usr/bin/env node
// Codemod: add Watch tab + replace inline podcast renderer with <PodcastGrid />
// across every src/pages/roles/*.tsx file.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ROLES_DIR = path.join(ROOT, "src/pages/roles");
const APP_TSX = path.join(ROOT, "src/App.tsx");

// 1) Build basename -> slug map from App.tsx routes
const appSrc = fs.readFileSync(APP_TSX, "utf8");
const lazyMap = new Map(); // ConstName -> basename
for (const m of appSrc.matchAll(/const\s+(Role[A-Za-z0-9]+)\s*=\s*lazy\(\(\)\s*=>\s*import\("\.\/pages\/roles\/([A-Za-z0-9]+)\.tsx"\)\)/g)) {
  lazyMap.set(m[1], m[2]);
}
const slugMap = new Map(); // basename -> slug
for (const m of appSrc.matchAll(/<Route\s+path="\/roles\/([a-z0-9-]+)"\s+element=\{<(Role[A-Za-z0-9]+)\s*\/>\}/g)) {
  const bn = lazyMap.get(m[2]);
  if (bn) slugMap.set(bn, m[1]);
}

const files = fs.readdirSync(ROLES_DIR).filter((f) => f.endsWith(".tsx") && f !== "RoleGeneric.tsx");

const report = { changed: [], skipped: [], failed: [] };

for (const file of files) {
  const fp = path.join(ROLES_DIR, file);
  const basename = file.replace(/\.tsx$/, "");
  const slug = slugMap.get(basename);
  let src = fs.readFileSync(fp, "utf8");
  const orig = src;

  // Extract role name from RolePageLayout name="..."
  const nameMatch = src.match(/<RolePageLayout[^>]*\bname=(?:\{`([^`]+)`\}|"([^"]+)")/);
  const roleName = nameMatch?.[1] ?? nameMatch?.[2];

  if (!slug || !roleName) {
    report.skipped.push({ file, reason: !slug ? "no slug in App.tsx" : "no name on RolePageLayout" });
    continue;
  }

  // ── 1) Add imports if missing ───────────────────────────────────
  if (!/from\s+"@\/components\/RoleWatchSection"/.test(src)) {
    src = src.replace(
      /(import\s+RolePageLayout\s+from\s+"@\/components\/RolePageLayout";)/,
      `$1\nimport RoleWatchSection from "@/components/RoleWatchSection";`
    );
  }
  if (!/from\s+"@\/components\/PodcastGrid"/.test(src)) {
    src = src.replace(
      /(import\s+RolePageLayout\s+from\s+"@\/components\/RolePageLayout";)/,
      `$1\nimport PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";`
    );
  }

  // ── 2) Replace inline podcast renderer in the listen tab ───────
  // Pattern: <div ...>{podcasts.map((p) => (<a ...>...</a>))}</div>
  // Be conservative: only if we find that exact map shape inside id: "listen".
  const inlineRx = /<div\s+className="space-y-4">\s*\{podcasts\.map\(\(p\)\s*=>\s*\([\s\S]*?\)\)\}\s*<\/div>/;
  if (inlineRx.test(src)) {
    src = src.replace(inlineRx, `<PodcastGrid podcasts={podcasts as PodcastItem[]} />`);
  }

  // ── 3) Insert Watch tab right after the Listen tab object ───────
  if (!/id:\s*"watch"/.test(src)) {
    // Find the listen tab object boundary. Listen tab is one line in current files.
    const listenTabRx = /(\{\s*id:\s*"listen",[\s\S]*?\}\)\s*\}\s*\)\s*\}\s*<\/>\)\s*\}\s*,\n)/;
    const watchEntry = `    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="${slug}" roleName="${roleName.replace(/"/g, '\\"')}" /> },\n`;
    if (listenTabRx.test(src)) {
      src = src.replace(listenTabRx, `$1${watchEntry}`);
    } else {
      // Fallback: simpler match — line that starts with `{ id: "listen"` ending with `,`
      const lineRx = /^( {2,4})(\{\s*id:\s*"listen",[\s\S]*?\}),\s*$/m;
      if (lineRx.test(src)) {
        src = src.replace(lineRx, (_, indent, body) => `${indent}${body},\n${indent}{ id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="${slug}" roleName="${roleName.replace(/"/g, '\\"')}" /> },`);
      } else {
        report.failed.push({ file, reason: "could not locate listen tab to insert after" });
        continue;
      }
    }
  }

  if (src !== orig) {
    fs.writeFileSync(fp, src);
    report.changed.push(file);
  } else {
    report.skipped.push({ file, reason: "no changes needed" });
  }
}

console.log(JSON.stringify(report, null, 2));
console.log(`\nChanged: ${report.changed.length}  Skipped: ${report.skipped.length}  Failed: ${report.failed.length}`);
