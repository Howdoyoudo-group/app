import React from "react";
import {
  HeroCard, IdentityBar, PullQuote, RiasecStrip, RiasecRadar, ValuesChips, ImageMosaic,
  Timeline, EditorialTimeline, EducationStack, FunFactStrip, TargetPanel,
  Card, ChipCloud, MiniStatStrip, FeatureBand, PromptAnswers,
} from "./blocks";
import type { PrintableData, RenderTuning } from "./types";

export type SectionId =
  | "hero"
  | "identity"
  | "story"
  | "looking_for"
  | "pull_quote"
  | "riasec"
  | "riasec_graph"
  | "values"
  | "passions"
  | "industries"
  | "loves"
  | "fun_facts"
  | "targets"
  | "roles_chasing"
  | "work_editorial"
  | "work_timeline"
  | "education"
  | "qualifications"
  | "strengths"
  | "family"
  | "stats"
  | "prompt_answers"
  | "home_town"
  | "contact";

export interface SectionContext {
  d: PrintableData;
  tuning: RenderTuning;
  workDescriptions: Record<string, string>;
  pullQuoteText: string;
}

interface SectionDef {
  id: SectionId;
  label: string;
  // Default span hints (out of 12 cols, out of 12 rows on a page)
  defaultCols: number;
  defaultRows: number;
  // Returns true if the section has any data to render
  has: (ctx: SectionContext) => boolean;
  render: (ctx: SectionContext) => React.ReactNode;
}

const cap = <T,>(arr: T[] | undefined, n: number): T[] => (arr || []).slice(0, n);

const domainFromLink = (link?: string) => {
  if (!link) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(link) ? link : `https://${link}`;
    return new URL(withProtocol).hostname.replace(/^www\./, "");
  } catch {
    return link.replace(/^https?:\/\//i, "").replace(/^www\./, "").split(/[/?#]/)[0] || null;
  }
};

const guessDomain = (name?: string) => {
  const slug = (name || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
  if (!slug) return null;
  if (/(university|college|school|academy|institute)/i.test(name || "")) {
    const eduSlug = (name || "").toLowerCase().replace(/\b(university|college|school|academy|institute|of|the)\b/g, "").replace(/[^a-z0-9]+/g, "");
    return eduSlug ? `${eduSlug}.ac.uk` : `${slug}.com`;
  }
  return `${slug}.com`;
};

const logoFor = (name?: string, link?: string, logoUrl?: string) => {
  if (logoUrl) return logoUrl;
  const domain = domainFromLink(link) || guessDomain(name);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : undefined;
};

const workItems = (d: PrintableData, descs: Record<string, string>, capChars: number) =>
  (d.workHistory || [])
    .filter(w => w.title || w.company)
    .map((w, i) => {
      const raw = descs[w.id || String(i)] ?? w.description ?? "";
      const desc = raw.length > capChars ? raw.slice(0, capChars).replace(/\s+\S*$/, "") + "…" : raw;
      // Pass raw fields so SmartLogo can run the Clearbit→DDG→Google fallback chain.
      return { title: w.title, company: w.company, when: w.when, description: desc, logoUrl: w.logoUrl, link: w.link };
    });

const estimateYears = (d: PrintableData): number => {
  const years: number[] = [];
  (d.workHistory || []).forEach(w => {
    const matches = (w.when || "").match(/(19|20)\d{2}/g);
    if (matches) matches.forEach(m => years.push(Number(m)));
  });
  if (!years.length) return 0;
  return Math.max(1, new Date().getFullYear() - Math.min(...years));
};

export const SECTIONS: Record<SectionId, SectionDef> = {
  hero: {
    id: "hero", label: "Profile hero", defaultCols: 12, defaultRows: 3,
    has: ({ d }) => Boolean(d.fullName),
    render: ({ d }) => <HeroCard d={d} size="md" />,
  },
  identity: {
    id: "identity", label: "Identity bar", defaultCols: 12, defaultRows: 2,
    has: ({ d }) => Boolean(d.fullName),
    render: ({ d }) => <IdentityBar d={d} />,
  },
  story: {
    id: "story", label: "About you (in your own words)", defaultCols: 6, defaultRows: 4,
    has: ({ d }) => Boolean(d.pbIntro || d.personalitySummary),
    render: ({ d }) => (
      <Card eyebrow="About you" title="In your own words" tone="yellow" className="h-full">
        <p>{d.pbIntro || d.personalitySummary}</p>
      </Card>
    ),
  },
  looking_for: {
    id: "looking_for", label: "Looking for", defaultCols: 4, defaultRows: 3,
    has: ({ d }) => Boolean(d.pbLookingFor),
    render: ({ d }) => (
      <Card eyebrow="Looking for" tone="accent" className="h-full"><p>{d.pbLookingFor}</p></Card>
    ),
  },
  pull_quote: {
    id: "pull_quote", label: "Pull quote", defaultCols: 12, defaultRows: 2,
    has: ({ pullQuoteText }) => Boolean(pullQuoteText),
    render: ({ pullQuoteText, d }) => <PullQuote quote={pullQuoteText} attribution={d.fullName} />,
  },
  riasec: {
    id: "riasec", label: "How I'm wired (RIASEC top 3)", defaultCols: 6, defaultRows: 3,
    has: ({ d }) => Boolean(d.riasecScores && Object.keys(d.riasecScores).length),
    render: ({ d }) => <RiasecStrip d={d} />,
  },
  riasec_graph: {
    id: "riasec_graph", label: "RIASEC graph", defaultCols: 6, defaultRows: 5,
    has: ({ d }) => Boolean(d.riasecScores && Object.keys(d.riasecScores).length),
    render: ({ d }) => <RiasecRadar d={d} />,
  },
  values: {
    id: "values", label: "Work values", defaultCols: 6, defaultRows: 3,
    has: ({ d }) => Boolean(d.workValues && Object.keys(d.workValues).length),
    render: ({ d }) => <ValuesChips d={d} />,
  },
  passions: {
    id: "passions", label: "What I love doing", defaultCols: 6, defaultRows: 3,
    has: ({ d }) => (d.passions || []).length > 0,
    render: ({ d, tuning }) => (
      <Card eyebrow="What I love doing" tone="pink" className="h-full">
        <ChipCloud items={cap(d.passions, tuning.passionsCap)} tone="pastel" />
      </Card>
    ),
  },
  industries: {
    id: "industries", label: "Industries I follow", defaultCols: 8, defaultRows: 3,
    has: ({ d }) => (d.industryInterests || []).length > 0,
    render: ({ d, tuning }) => (
      <Card eyebrow="Industries I follow" tone="blue" className="h-full">
        <ChipCloud items={cap(d.industryInterests, tuning.industriesCap)} tone="pastel" />
      </Card>
    ),
  },
  loves: {
    id: "loves", label: "My world (love photos)", defaultCols: 6, defaultRows: 5,
    has: ({ d }) => (d.lovePhotos || []).filter(p => p.url).length > 0,
    render: ({ d, tuning }) => {
      const photos = (d.lovePhotos || []).filter(p => p.url);
      const cols = photos.length >= 6 ? 3 : 2;
      const rows = photos.length >= 6 ? 3 : 2;
      return (
        <Card eyebrow="My world" title="Things I love" tone="green" className="h-full">
          <ImageMosaic photos={cap(photos, tuning.lovesCap)} cols={cols as 2 | 3} rows={rows as 2 | 3} />
        </Card>
      );
    },
  },
  family: {
    id: "family", label: "Family & pets", defaultCols: 6, defaultRows: 4,
    has: ({ d }) => (d.familyPhotos || []).filter(p => p.url).length > 0,
    render: ({ d }) => {
      const photos = (d.familyPhotos || []).filter(p => p.url);
      return (
        <Card eyebrow="Family & pets" tone="orange" className="h-full">
          <ImageMosaic photos={photos} cols={2} rows={2} />
        </Card>
      );
    },
  },
  fun_facts: {
    id: "fun_facts", label: "Fun facts", defaultCols: 12, defaultRows: 4,
    has: ({ d }) => (d.funFacts || []).filter(f => f.q && f.a).length > 0,
    render: ({ d, tuning }) => {
      const facts = (d.funFacts || []).filter(f => f.q && f.a).slice(0, tuning.funFactsCap);
      return <FunFactStrip items={facts} cols={facts.length >= 3 ? 3 : 2} />;
    },
  },

  targets: {
    id: "targets", label: "Most wanted (target roles + employers)", defaultCols: 12, defaultRows: 3,
    has: ({ d }) => (d.targetRoles?.length || 0) + (d.targetCompanies?.length || 0) > 0,
    render: ({ d }) => (
      <FeatureBand
        eyebrow="Most wanted"
        title={d.targetRoles && d.targetRoles.length ? d.targetRoles.slice(0, 4).join(" · ") : "Where I'm headed"}
        body={d.targetCompanies && d.targetCompanies.length ? `Employers on the radar: ${d.targetCompanies.slice(0, 8).join(", ")}` : undefined}
        tone="dark"
      />
    ),
  },
  work_editorial: {
    id: "work_editorial", label: "Career - editorial timeline", defaultCols: 8, defaultRows: 8,
    has: ({ d }) => (d.workHistory || []).length > 0,
    render: ({ d, tuning, workDescriptions }) => (
      <EditorialTimeline items={workItems(d, workDescriptions, tuning.workDescCap)} />
    ),
  },
  work_timeline: {
    id: "work_timeline", label: "Career - vertical timeline", defaultCols: 8, defaultRows: 8,
    has: ({ d }) => (d.workHistory || []).length > 0,
    render: ({ d, tuning, workDescriptions }) => (
      <Timeline items={workItems(d, workDescriptions, tuning.workDescCap)} titleText="Where I've worked" />
    ),
  },
  education: {
    id: "education", label: "Education", defaultCols: 4, defaultRows: 4,
    has: ({ d }) => (d.education || []).length > 0,
    render: ({ d }) => <EducationStack items={d.education || []} />,
  },
  qualifications: {
    id: "qualifications", label: "Awards & certifications", defaultCols: 4, defaultRows: 3,
    has: ({ d }) => (d.qualifications || []).length > 0,
    render: ({ d }) => (
      <Card eyebrow="Awards & certifications" className="h-full">
        <ul className="space-y-0.5 mt-1">
          {(d.qualifications || []).map((q, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="font-600 truncate">{q.name}</span>
              <span className="opacity-60 text-[8.5px] shrink-0">{q.issuer}{q.year ? ` · ${q.year}` : ""}</span>
            </li>
          ))}
        </ul>
      </Card>
    ),
  },
  strengths: {
    id: "strengths", label: "Strengths", defaultCols: 4, defaultRows: 3,
    has: ({ d }) => (d.transferableSkills || []).length > 0,
    render: ({ d }) => (
      <Card eyebrow="Strengths" tone="purple" className="h-full">
        <ChipCloud items={d.transferableSkills || []} tone="pastel" />
      </Card>
    ),
  },
  roles_chasing: {
    id: "roles_chasing", label: "Roles I'm chasing", defaultCols: 6, defaultRows: 3,
    has: ({ d }) => (d.rolePreferences || []).length > 0,
    render: ({ d }) => (
      <Card eyebrow="Roles I'm chasing" tone="yellow" className="h-full">
        <ChipCloud items={d.rolePreferences || []} tone="fill" />
      </Card>
    ),
  },
  stats: {
    id: "stats", label: "Career stats", defaultCols: 12, defaultRows: 2,
    has: ({ d }) => (d.workHistory || []).length > 0 || (d.education || []).length > 0,
    render: ({ d }) => {
      const items = workItems(d, {}, 0);
      const years = estimateYears(d);
      const employers = new Set((d.workHistory || []).map(w => (w.company || "").trim().toLowerCase()).filter(Boolean)).size;
      const stats = [
        { value: items.length, label: "Roles" },
        ...(years > 0 ? [{ value: `${years}`, label: "Years" }] : []),
        { value: employers || items.length, label: "Employers" },
        ...((d.education || []).length > 0 ? [{ value: (d.education || []).length, label: "Studies" }] : []),
      ];
      return <MiniStatStrip items={stats} />;
    },
  },
  prompt_answers: {
    id: "prompt_answers", label: "Prompt answers", defaultCols: 6, defaultRows: 4,
    has: ({ d }) => Boolean(d.pbPromptAnswers && Object.values(d.pbPromptAnswers).some(v => (v || "").trim())),
    render: ({ d }) => <PromptAnswers answers={d.pbPromptAnswers} cap={4} />,
  },
  home_town: {
    id: "home_town", label: "Home town", defaultCols: 6, defaultRows: 3,
    has: ({ d }) => Boolean(d.homeTown || d.homeTownBlurb),
    render: ({ d }) => (
      <Card eyebrow="Where I'm from" title={d.homeTown || "Home town"} className="h-full">
        {d.homeTownBlurb && <p>{d.homeTownBlurb}</p>}
      </Card>
    ),
  },
  contact: {
    id: "contact", label: "Contact + links", defaultCols: 6, defaultRows: 2,
    has: ({ d }) => Boolean(d.email || d.phone || d.pbPersonalLink || d.pbInstagram || d.pbTiktok || d.pbPortfolio),
    render: ({ d }) => (
      <Card eyebrow="Get in touch" className="h-full">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          {d.email && <span>✉ {d.email}</span>}
          {d.phone && <span>☎ {d.phone}</span>}
          {d.pbPersonalLink && <span>🔗 {d.pbPersonalLink}</span>}
          {d.pbPortfolio && <span>📁 {d.pbPortfolio}</span>}
          {d.pbInstagram && <span>IG {d.pbInstagram}</span>}
          {d.pbTiktok && <span>TT {d.pbTiktok}</span>}
        </div>
      </Card>
    ),
  },
};

export const SECTION_LIST: SectionDef[] = Object.values(SECTIONS);

export interface SlotConfig {
  i: string;          // unique key (stable across drags)
  section: SectionId | null;
  unit?: "px";        // present once the legacy 12×12 layout has been converted to exact canvas pixels
  x: number;          // 0..11 (legacy) or px once unit==="px"
  y: number;
  w: number;
  h: number;
  z?: number;         // z-index for stacking (Canva/PowerPoint style)
}


export interface PinnedLayout {
  page1: SlotConfig[];
  page2: SlotConfig[];
}

let _id = 0;
const k = (s: SectionId) => `${s}-${++_id}`;

// Default layout - every section pinned somewhere, sized to fill both pages.
export const DEFAULT_PINNED_LAYOUT: PinnedLayout = {
  page1: [
    { i: k("hero"),        section: "hero",        x: 0, y: 0,  w: 12, h: 3 },
    { i: k("story"),       section: "story",       x: 0, y: 3,  w: 5,  h: 5 },
    { i: k("loves"),       section: "loves",       x: 5, y: 3,  w: 4,  h: 5 },
    { i: k("looking_for"), section: "looking_for", x: 9, y: 3,  w: 3,  h: 5 },
    { i: k("riasec"),      section: "riasec",      x: 0, y: 8,  w: 6,  h: 2 },
    { i: k("values"),      section: "values",      x: 6, y: 8,  w: 6,  h: 2 },
    { i: k("pull_quote"),  section: "pull_quote",  x: 0, y: 10, w: 12, h: 2 },
  ],
  page2: [
    { i: k("identity"),       section: "identity",       x: 0, y: 0,  w: 12, h: 2 },
    { i: k("stats"),          section: "stats",          x: 0, y: 2,  w: 12, h: 1 },
    { i: k("work_editorial"), section: "work_editorial", x: 0, y: 3,  w: 8,  h: 7 },
    { i: k("education"),      section: "education",      x: 8, y: 3,  w: 4,  h: 4 },
    { i: k("qualifications"), section: "qualifications", x: 8, y: 7,  w: 4,  h: 3 },
    { i: k("targets"),        section: "targets",        x: 0, y: 10, w: 12, h: 2 },
  ],
};

let _runtimeId = 1000;
export const newSlotId = (s: SectionId) => `${s}-rt${++_runtimeId}`;
