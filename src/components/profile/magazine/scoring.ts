import { PASS, Scores, ContentInventory, TemplateKey } from "./types";

export function inventory(d: import("./types").PrintableData): ContentInventory {
  const intro = (d.pbIntro || d.personalitySummary || "").trim();
  const work = (d.workHistory || []).filter(w => w.title || w.company);
  const careerWords = work.reduce((n, w) => n + (w.description || "").split(/\s+/).filter(Boolean).length, 0);
  return {
    hasPhoto: !!d.photoUrl,
    hasIntro: intro.length > 0,
    introWords: intro.split(/\s+/).filter(Boolean).length,
    introText: intro,
    lovesCount: (d.lovePhotos || []).filter(p => p.url).length,
    passionsCount: (d.passions || []).length,
    industriesCount: (d.industryInterests || []).length,
    workCount: work.length,
    careerWords,
    eduCount: (d.education || []).filter(e => e.school || e.qualification).length,
    qualsCount: (d.qualifications || []).filter(q => q.name).length,
    funFactCount: (d.funFacts || []).filter(f => f.q && f.a).length,
    hasRiasec: !!d.riasecScores && Object.keys(d.riasecScores).length > 0,
    hasValues: !!d.workValues && Object.keys(d.workValues).length > 0,
    targetRolesCount: (d.targetRoles || []).length,
    targetCompaniesCount: (d.targetCompanies || []).length,
  };
}

export function selectTemplate(inv: ContentInventory): TemplateKey {
  if (inv.workCount >= 5 || inv.careerWords > 700) return "career-heavy";
  if (inv.lovesCount >= 6) return "image-heavy";
  if (inv.introWords > 250 && inv.lovesCount < 3) return "text-heavy";
  if (inv.workCount <= 2 && (inv.passionsCount >= 6 || inv.hasRiasec)) return "profile-heavy";
  return "balanced-executive";
}

export function nextTemplate(current: TemplateKey, inv: ContentInventory): TemplateKey | null {
  const order: TemplateKey[] = ["balanced-executive", "profile-heavy", "career-heavy", "image-heavy", "text-heavy"];
  const filtered = order.filter(t => t !== current);
  // pick one that fits inventory better
  if (current !== "career-heavy" && inv.workCount >= 4) return "career-heavy";
  if (current !== "balanced-executive") return "balanced-executive";
  return filtered[0] || null;
}

export function measurePage(el: HTMLElement | null): { used: number; capacity: number; ratio: number; overflow: boolean } {
  if (!el) return { used: 0, capacity: 1, ratio: 0, overflow: false };
  const capacity = el.clientHeight;
  // Use scrollHeight to detect overflow
  const scroll = el.scrollHeight;
  const overflow = scroll > capacity + 2;
  // Compute used height: tallest child bottom relative to el top
  let used = 0;
  const elTop = el.getBoundingClientRect().top;
  el.querySelectorAll<HTMLElement>(":scope > *").forEach(child => {
    const r = child.getBoundingClientRect();
    const bottom = r.bottom - elTop;
    if (bottom > used) used = bottom;
  });
  if (overflow) used = scroll;
  return { used, capacity, ratio: Math.min(1.2, used / capacity), overflow };
}

export function scoreLayout(p1: HTMLElement | null, p2: HTMLElement | null, inclusionRatio: number): Scores {
  const m1 = measurePage(p1);
  const m2 = measurePage(p2);
  const fillP1 = m1.ratio;
  const fillP2 = m2.ratio;
  const fill = (Math.min(fillP1, 1) + Math.min(fillP2, 1)) / 2;
  const balance = 1 - Math.abs(Math.min(fillP1, 1) - Math.min(fillP2, 1));
  const printSafe = m1.overflow || m2.overflow ? 0 : 1;
  return {
    fillP1, fillP2, fill, balance,
    inclusion: inclusionRatio,
    readability: 1, // we clamp font sizes by design
    printSafe,
  };
}

export function passes(s: Scores): boolean {
  return (
    s.printSafe === 1 &&
    s.fillP1 >= PASS.fillMin && s.fillP1 <= PASS.fillMax &&
    s.fillP2 >= PASS.fillMin && s.fillP2 <= PASS.fillMax &&
    s.balance >= PASS.balance &&
    s.inclusion >= PASS.inclusion
  );
}

export { PASS };
