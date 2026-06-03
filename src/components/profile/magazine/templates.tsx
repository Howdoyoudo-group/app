import React from "react";
import {
  HeroCard, PullQuote, RiasecStrip, ValuesChips, ImageMosaic, Timeline,
  EducationStack, FunFactStrip, TargetPanel, Card, ChipCloud, StatCard, PromptAnswers,
  IdentityBar, MiniStatStrip, FeatureBand, EditorialTimeline,
} from "./blocks";
import type { PrintableData, RenderTuning, TemplateKey } from "./types";

interface TplProps {
  d: PrintableData;
  tuning: RenderTuning;
  workDescriptions: Record<string, string>;
  pullQuoteText: string;
}

const cap = <T,>(arr: T[] | undefined, n: number): T[] => (arr || []).slice(0, n);
const workItems = (d: PrintableData, descs: Record<string, string>, capChars: number) =>
  (d.workHistory || [])
    .filter(w => w.title || w.company)
    .map((w, i) => {
      const raw = descs[w.id || String(i)] ?? w.description ?? "";
      const desc = raw.length > capChars ? raw.slice(0, capChars).replace(/\s+\S*$/, "") + "…" : raw;
      return { title: w.title, company: w.company, when: w.when, description: desc, logoUrl: w.logoUrl, link: w.link };
    });

// Estimate "years experience" from when strings (loose: extract 4-digit years)
const estimateYears = (d: PrintableData): number => {
  const years: number[] = [];
  (d.workHistory || []).forEach(w => {
    const matches = (w.when || "").match(/(19|20)\d{2}/g);
    if (matches) matches.forEach(m => years.push(Number(m)));
  });
  if (!years.length) return 0;
  return Math.max(1, new Date().getFullYear() - Math.min(...years));
};

// ----------------------------------------------------------------
// Balanced Executive - editorial magazine spread
// ----------------------------------------------------------------
export const BalancedExecutive_P1: React.FC<TplProps> = ({ d, tuning, pullQuoteText }) => {
  const passions = cap(d.passions, tuning.passionsCap);
  const industries = cap(d.industryInterests, tuning.industriesCap);
  const loves = (d.lovePhotos || []).filter(p => p.url);
  const facts = (d.funFacts || []).filter(f => f.q && f.a).slice(0, tuning.funFactsCap);
  const story = d.pbIntro || d.personalitySummary || "";
  const hasQuote = tuning.showPullQuote && !!pullQuoteText;

  return (
    <div className="grid grid-cols-12 gap-2 h-full grid-rows-[auto_auto_auto_auto_1fr] auto-rows-min">
      {/* Row 1 - masthead hero */}
      <div className="col-span-12"><HeroCard d={d} size="md" /></div>

      {/* Row 2 - story (5) | pull quote + looking-for stack (4) | loves mosaic (3) */}
      <div className="col-span-5">
        {story && (
          <Card eyebrow="Story" title="In my own words" className="h-full">
            <p>{story}</p>
          </Card>
        )}
      </div>
      <div className="col-span-4 flex flex-col gap-2">
        {hasQuote && <PullQuote quote={pullQuoteText} attribution={d.fullName} />}
        {d.pbLookingFor && (
          <Card eyebrow="Looking for" tone="accent" className="flex-1"><p>{d.pbLookingFor}</p></Card>
        )}
      </div>
      <div className="col-span-3">
        {loves.length > 0 ? (
          <Card eyebrow="My world" title="Things I love" className="h-full">
            <ImageMosaic photos={cap(loves, 4)} cols={2} rows={2} />
          </Card>
        ) : passions.length > 0 ? (
          <Card eyebrow="Obsessed with" className="h-full"><ChipCloud items={passions} /></Card>
        ) : null}
      </div>

      {/* Row 3 - RIASEC stat strip (7) | values chips (5) */}
      {d.riasecScores && (
        <div className="col-span-7">
          <Card eyebrow="How I'm wired" title="RIASEC top three">
            <div className="grid grid-cols-3 gap-2 mt-1">
              {Object.entries(d.riasecScores)
                .sort((a, b) => Number(b[1]) - Number(a[1]))
                .slice(0, 3)
                .map(([k, v]) => <StatCard key={k} value={Math.round(Number(v))} label={k} tone="accent" />)}
            </div>
          </Card>
        </div>
      )}
      <div className={d.riasecScores ? "col-span-5" : "col-span-12"}>
        <ValuesChips d={d} />
      </div>

      {/* Row 4 - industries feature band (8) | passions chips (4) */}
      {industries.length > 0 && (
        <div className="col-span-8">
          <Card eyebrow="Industries I follow" className="h-full">
            <ChipCloud items={industries} tone="fill" />
          </Card>
        </div>
      )}
      {passions.length > 0 && loves.length > 0 && (
        <div className={industries.length > 0 ? "col-span-4" : "col-span-12"}>
          <Card eyebrow="Obsessed with" className="h-full"><ChipCloud items={passions} /></Card>
        </div>
      )}

      {/* Row 5 - fun facts strip (filler that stretches) */}
      {facts.length > 0 && (
        <div className="col-span-12 self-end">
          <FunFactStrip items={facts} cols={facts.length >= 3 ? 3 : 2} />
        </div>
      )}
    </div>
  );
};

export const BalancedExecutive_P2: React.FC<TplProps> = ({ d, tuning, workDescriptions }) => {
  const items = workItems(d, workDescriptions, tuning.workDescCap);
  const years = estimateYears(d);
  const distinctIndustries = new Set((d.workHistory || []).map(w => (w.company || "").trim().toLowerCase()).filter(Boolean)).size;
  const stats = [
    { value: items.length, label: "Roles" },
    ...(years > 0 ? [{ value: `${years}`, label: "Years" }] : []),
    { value: distinctIndustries || items.length, label: "Employers" },
    ...(d.education && d.education.length > 0 ? [{ value: d.education.length, label: "Studies" }] : []),
  ];
  const targets = (d.targetRoles?.length || d.targetCompanies?.length) ? true : false;

  return (
    <div className="grid grid-cols-12 gap-2 h-full grid-rows-[auto_auto_1fr_auto] auto-rows-min">
      {/* Row 1 - identity masthead spans full width */}
      <div className="col-span-12"><IdentityBar d={d} /></div>

      {/* Row 2 - mini stat strip */}
      {stats.length > 0 && (
        <div className="col-span-12"><MiniStatStrip items={stats} /></div>
      )}

      {/* Row 3 - editorial timeline (8) + sidebar (4) */}
      <div className="col-span-8 flex flex-col gap-2 min-h-0">
        <EditorialTimeline items={items} />
      </div>
      <div className="col-span-4 flex flex-col gap-2 min-h-0">
        <EducationStack items={d.education} />
        {(d.qualifications || []).length > 0 && (
          <Card eyebrow="Awards & certifications">
            <ul className="space-y-0.5 mt-1">
              {(d.qualifications || []).map((q, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span className="font-600 truncate">{q.name}</span>
                  <span className="opacity-60 text-[8.5px] shrink-0">{q.issuer}{q.year ? ` · ${q.year}` : ""}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {d.rolePreferences && d.rolePreferences.length > 0 && (
          <Card eyebrow="Strengths"><ChipCloud items={d.rolePreferences} tone="ghost" /></Card>
        )}
      </div>

      {/* Row 4 - edge-to-edge "Where I'm headed" feature */}
      {targets && (
        <div className="col-span-12">
          <FeatureBand
            eyebrow="Most wanted"
            title={d.targetRoles && d.targetRoles.length > 0 ? d.targetRoles.slice(0, 4).join(" · ") : "Where I'm headed"}
            body={d.targetCompanies && d.targetCompanies.length > 0 ? `Employers on the radar: ${d.targetCompanies.slice(0, 8).join(", ")}` : undefined}
            tone="dark"
          />
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------
// Profile Heavy
// ----------------------------------------------------------------
export const ProfileHeavy_P1: React.FC<TplProps> = ({ d, tuning, pullQuoteText }) => {
  const passions = cap(d.passions, tuning.passionsCap);
  const industries = cap(d.industryInterests, tuning.industriesCap);
  const loves = (d.lovePhotos || []).filter(p => p.url);
  const facts = (d.funFacts || []).filter(f => f.q && f.a).slice(0, tuning.funFactsCap);
  return (
    <div className="grid grid-cols-12 gap-2.5 h-full">
      <div className="col-span-5 flex flex-col gap-2.5">
        <HeroCard d={d} size="lg" />
        {(d.pbIntro || d.personalitySummary) && (
          <Card eyebrow="Story" title="In my own words"><p>{d.pbIntro || d.personalitySummary}</p></Card>
        )}
        {d.pbLookingFor && <Card eyebrow="Looking for" tone="accent"><p>{d.pbLookingFor}</p></Card>}
      </div>
      <div className="col-span-4 flex flex-col gap-2.5">
        <RiasecStrip d={d} />
        <ValuesChips d={d} />
        {passions.length > 0 && <Card eyebrow="Obsessed with"><ChipCloud items={passions} /></Card>}
      </div>
      <div className="col-span-3 flex flex-col gap-2.5">
        {loves.length > 0 && <Card eyebrow="My world" title="Things I love"><ImageMosaic photos={cap(loves, tuning.lovesCap)} cols={2} rows={3} /></Card>}
        {industries.length > 0 && <Card eyebrow="Industries"><ChipCloud items={industries} tone="fill" /></Card>}
      </div>
      {tuning.showPullQuote && pullQuoteText && (
        <div className="col-span-12"><PullQuote quote={pullQuoteText} attribution={d.fullName} /></div>
      )}
      {facts.length > 0 && <div className="col-span-12"><FunFactStrip items={facts} cols={3} /></div>}
    </div>
  );
};

export const ProfileHeavy_P2 = BalancedExecutive_P2;

// ----------------------------------------------------------------
// Career Heavy
// ----------------------------------------------------------------
export const CareerHeavy_P1: React.FC<TplProps> = ({ d, tuning, pullQuoteText }) => {
  const loves = (d.lovePhotos || []).filter(p => p.url);
  const industries = cap(d.industryInterests, tuning.industriesCap);
  return (
    <div className="grid grid-cols-12 gap-2.5 h-full">
      <div className="col-span-4"><HeroCard d={d} size="md" /></div>
      <div className="col-span-4">
        {tuning.showPullQuote && pullQuoteText
          ? <PullQuote quote={pullQuoteText} attribution={d.fullName} />
          : (d.pbIntro || d.personalitySummary)
            ? <Card eyebrow="Story" title="In my own words"><p>{d.pbIntro || d.personalitySummary}</p></Card>
            : null}
      </div>
      <div className="col-span-4"><RiasecStrip d={d} /></div>

      <div className="col-span-5">
        {d.pbLookingFor && <Card eyebrow="Looking for" tone="accent"><p>{d.pbLookingFor}</p></Card>}
      </div>
      <div className="col-span-4">
        <ValuesChips d={d} />
      </div>
      <div className="col-span-3">
        {loves.length > 0 && <Card eyebrow="My world"><ImageMosaic photos={cap(loves, 4)} cols={2} rows={2} /></Card>}
      </div>

      {industries.length > 0 && <div className="col-span-12"><Card eyebrow="Industries I follow"><ChipCloud items={industries} tone="fill" /></Card></div>}
      <div className="col-span-12"><TargetPanel roles={d.targetRoles || []} companies={d.targetCompanies || []} /></div>
    </div>
  );
};

export const CareerHeavy_P2: React.FC<TplProps> = ({ d, tuning, workDescriptions }) => {
  const items = workItems(d, workDescriptions, tuning.workDescCap);
  return (
    <div className="grid grid-cols-12 gap-2.5 h-full">
      <div className="col-span-8 flex flex-col gap-2.5">
        <Timeline items={items} titleText="Where I've worked" />
      </div>
      <div className="col-span-4 flex flex-col gap-2.5">
        <EducationStack items={d.education} />
        {(d.qualifications || []).length > 0 && (
          <Card eyebrow="Awards & certifications">
            <ul className="space-y-0.5 mt-1">
              {(d.qualifications || []).map((q, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span className="font-600 truncate">{q.name}</span>
                  <span className="opacity-60 text-[9px] shrink-0">{q.issuer}{q.year ? ` · ${q.year}` : ""}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {d.rolePreferences && d.rolePreferences.length > 0 && (
          <Card eyebrow="Strengths"><ChipCloud items={d.rolePreferences} tone="ghost" /></Card>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------
// Image Heavy
// ----------------------------------------------------------------
export const ImageHeavy_P1: React.FC<TplProps> = ({ d, tuning, pullQuoteText }) => {
  const loves = (d.lovePhotos || []).filter(p => p.url);
  const passions = cap(d.passions, tuning.passionsCap);
  const facts = (d.funFacts || []).filter(f => f.q && f.a).slice(0, tuning.funFactsCap);
  return (
    <div className="grid grid-cols-12 gap-2.5 h-full">
      <div className="col-span-4 flex flex-col gap-2.5">
        <HeroCard d={d} size="md" />
        {(d.pbIntro || d.personalitySummary) && <Card eyebrow="Story"><p>{d.pbIntro || d.personalitySummary}</p></Card>}
        <RiasecStrip d={d} />
      </div>
      <div className="col-span-8">
        <Card eyebrow="My world" title="Things I love" className="h-full">
          <ImageMosaic photos={loves} cols={3} rows={3} />
        </Card>
      </div>
      {tuning.showPullQuote && pullQuoteText && <div className="col-span-12"><PullQuote quote={pullQuoteText} attribution={d.fullName} /></div>}
      {passions.length > 0 && <div className="col-span-7"><Card eyebrow="Obsessed with"><ChipCloud items={passions} /></Card></div>}
      {facts.length > 0 && <div className="col-span-5"><FunFactStrip items={facts.slice(0, 2)} cols={2} /></div>}
    </div>
  );
};

export const ImageHeavy_P2 = BalancedExecutive_P2;

// ----------------------------------------------------------------
// Text Heavy
// ----------------------------------------------------------------
export const TextHeavy_P1: React.FC<TplProps> = ({ d, tuning, pullQuoteText }) => {
  const intro = d.pbIntro || d.personalitySummary || "";
  return (
    <div className="grid grid-cols-12 gap-2.5 h-full">
      <div className="col-span-4 flex flex-col gap-2.5">
        <HeroCard d={d} size="md" />
        <RiasecStrip d={d} />
        <ValuesChips d={d} />
      </div>
      <div className="col-span-8 flex flex-col gap-2.5">
        <Card eyebrow="Story" title="In my own words" className="flex-1">
          <div className="columns-2 gap-4 text-[10.5px] leading-relaxed">
            <p>{intro}</p>
          </div>
        </Card>
        {tuning.showPullQuote && pullQuoteText && <PullQuote quote={pullQuoteText} attribution={d.fullName} />}
        {d.pbLookingFor && <Card eyebrow="Looking for" tone="accent"><p>{d.pbLookingFor}</p></Card>}
      </div>
      {(d.industryInterests || []).length > 0 && (
        <div className="col-span-12"><Card eyebrow="Industries I follow"><ChipCloud items={cap(d.industryInterests, tuning.industriesCap)} tone="fill" /></Card></div>
      )}
    </div>
  );
};

export const TextHeavy_P2 = BalancedExecutive_P2;

// ----------------------------------------------------------------
// Registry
// ----------------------------------------------------------------
export const TEMPLATES: Record<TemplateKey, { P1: React.FC<TplProps>; P2: React.FC<TplProps>; label: string }> = {
  "balanced-executive": { P1: BalancedExecutive_P1, P2: BalancedExecutive_P2, label: "Balanced executive" },
  "profile-heavy":      { P1: ProfileHeavy_P1,      P2: ProfileHeavy_P2,      label: "Profile heavy" },
  "career-heavy":       { P1: CareerHeavy_P1,       P2: CareerHeavy_P2,       label: "Career heavy" },
  "image-heavy":        { P1: ImageHeavy_P1,        P2: ImageHeavy_P2,        label: "Image heavy" },
  "text-heavy":         { P1: TextHeavy_P1,         P2: TextHeavy_P2,         label: "Text heavy" },
};
