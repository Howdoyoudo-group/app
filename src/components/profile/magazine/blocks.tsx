import React, { useEffect, useState } from "react";
import type { PrintableData } from "./types";

const RIASEC_LABEL: Record<string, string> = {
  R: "Realistic", I: "Investigative", A: "Artistic",
  S: "Social", E: "Enterprising", C: "Conventional",
};

export const initials = (s: string) =>
  (s || "?").split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("") || "•";

// ---------- SmartLogo: mirrors MyProfile's Clearbit → DDG → Google fallback ----------
const domainFromLink = (link?: string): string | null => {
  if (!link) return null;
  try { return new URL(link.startsWith("http") ? link : `https://${link}`).hostname.replace(/^www\./, ""); }
  catch { return null; }
};

// Known brand aliases - companies whose domain isn't obvious from their name.
// Keys are normalised (lowercase, alphanumerics only).
const BRAND_DOMAIN_ALIASES: Record<string, string> = {
  carphonewarehouse: "currys.co.uk", // merged into Currys
  dixonscarphone: "currys.co.uk",
  pcworld: "currys.co.uk",
  currysdigital: "currys.co.uk",
  marksandspencer: "marksandspencer.com",
  mands: "marksandspencer.com",
  johnlewis: "johnlewis.com",
  jlp: "johnlewispartnership.co.uk",
  waitrose: "waitrose.com",
  tescoplc: "tesco.com",
  sainsburys: "sainsburys.co.uk",
  asda: "asda.com",
  morrisons: "morrisons.com",
  bbc: "bbc.co.uk",
  itv: "itv.com",
  sky: "sky.com",
  o2: "o2.co.uk",
  ee: "ee.co.uk",
  virginmedia: "virginmedia.com",
  thephonehouse: "currys.co.uk",
};

const guessDomain = (name?: string): string | null => {
  const slug = (name || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
  if (!slug) return null;
  if (BRAND_DOMAIN_ALIASES[slug]) return BRAND_DOMAIN_ALIASES[slug];
  if (/(university|college|school|academy|institute)/i.test(name || "")) {
    const eduSlug = (name || "").toLowerCase().replace(/\b(university|college|school|academy|institute|of|the)\b/g, "").replace(/[^a-z0-9]+/g, "");
    return eduSlug ? `${eduSlug}.ac.uk` : `${slug}.com`;
  }
  return `${slug}.com`;
};
export const SmartLogo: React.FC<{
  name?: string;
  link?: string;
  logoUrl?: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ name, link, logoUrl, size = 36, className = "", fallback = null }) => {
  const domain = domainFromLink(link) || guessDomain(name);
  // Request a high-resolution image so it stays crisp when scaled in print.
  const px = Math.max(256, Math.round(size * 4));
  const sources = [
    ...(logoUrl ? [logoUrl] : []),
    ...(domain
      ? [
          `https://logo.clearbit.com/${domain}?size=${px}`,
          `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
          `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        ]
      : []),
  ];
  const key = sources.join("|");
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [key]);
  if (!sources.length || idx >= sources.length) return <>{fallback}</>;
  return (
    <img
      src={sources[idx]}
      alt={`${name || ""} logo`}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setIdx(i => i + 1)}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
};

export const topRiasec = (s?: PrintableData["riasecScores"]) =>
  !s ? [] : Object.entries(s).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 3)
    .map(([k, v]) => ({ key: k, label: RIASEC_LABEL[k] || k, value: Number(v) }));

export const topValues = (s?: PrintableData["workValues"]) =>
  !s ? [] : Object.entries(s).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 5)
    .map(([k, v]) => ({ key: k, value: Number(v) }));

// Match MyProfile pastel skill chip rotation
const SKILL_COLOURS = [
  "bg-yellow-200",
  "bg-blue-200",
  "bg-pink-200",
  "bg-green-200",
  "bg-orange-200",
  "bg-purple-200",
];

// ---------- atoms (mirror MyProfile tokens) ----------
// MyProfile: cardBase = "bg-card border-2 border-foreground rounded-3xl p-5 md:p-6 shadow-[4px_4px_0_hsl(var(--foreground))]"
//            eyebrowCls = "font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary mb-1"
//            titleCls = "font-display font-800 text-lg md:text-xl text-foreground leading-tight"

export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary leading-none ${className}`}>{children}</div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`font-display font-800 text-lg text-foreground leading-tight ${className}`}>{children}</div>
);

export const Card: React.FC<React.PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  tone?: "default" | "accent" | "dark" | "yellow" | "pink" | "blue" | "green" | "orange" | "purple";
  className?: string;
}>> = ({ eyebrow, title, tone = "default", className = "", children }) => {
  const bg =
    tone === "accent" ? "bg-primary/10 border-foreground"
    : tone === "dark" ? "bg-foreground text-background border-foreground"
    : tone === "yellow" ? "bg-yellow-200 border-foreground"
    : tone === "pink" ? "bg-pink-200 border-foreground"
    : tone === "blue" ? "bg-blue-200 border-foreground"
    : tone === "green" ? "bg-green-200 border-foreground"
    : tone === "orange" ? "bg-orange-200 border-foreground"
    : tone === "purple" ? "bg-purple-200 border-foreground"
    : "bg-card border-foreground";
  return (
    <div
      className={`rounded-3xl border-2 ${bg} p-4 shadow-[4px_4px_0_hsl(var(--foreground))] ${className}`}
      style={{ breakInside: "avoid" }}
    >
      {(eyebrow || title) && (
        <div className="mb-2">
          {eyebrow && <Eyebrow className={`mb-1 ${tone === "dark" ? "text-primary" : ""}`}>{eyebrow}</Eyebrow>}
          {title && <SectionTitle>{title}</SectionTitle>}
        </div>
      )}
      <div className="font-body text-sm leading-snug">{children}</div>
    </div>
  );
};

export const Chip: React.FC<React.PropsWithChildren<{ tone?: "idle" | "fill" | "ghost" | "pastel"; index?: number }>> = ({ children, tone = "idle", index = 0 }) => {
  const cls =
    tone === "fill" ? "bg-foreground text-background border-foreground"
    : tone === "ghost" ? `${SKILL_COLOURS[index % SKILL_COLOURS.length]} text-foreground border-foreground`
    : tone === "pastel" ? `${SKILL_COLOURS[index % SKILL_COLOURS.length]} text-foreground border-foreground`
    : "bg-background text-foreground border-foreground";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full font-display text-xs font-700 border-2 mr-1.5 mb-1.5 ${cls}`}>
      {children}
    </span>
  );
};

export const ChipCloud: React.FC<{ items: string[]; tone?: "idle" | "fill" | "ghost" | "pastel"; cap?: number }> = ({ items, tone = "idle", cap }) => {
  const list = cap ? items.slice(0, cap) : items;
  return (
    <div className="flex flex-wrap mt-1">
      {list.map((p, i) => <Chip key={i} tone={tone} index={i}>{p}</Chip>)}
    </div>
  );
};

// ---------- hero ----------
export const HeroCard: React.FC<{ d: PrintableData; size?: "sm" | "md" | "lg" }> = ({ d, size = "md" }) => {
  const photoSize = size === "lg" ? 128 : size === "sm" ? 80 : 104;
  return (
    <div
      className="rounded-3xl border-2 border-foreground bg-foreground text-background p-5 flex gap-4 items-center shadow-[4px_4px_0_hsl(var(--foreground))]"
      style={{ breakInside: "avoid" }}
    >
      {d.photoUrl ? (
        <img
          src={d.photoUrl}
          alt=""
          style={{ width: photoSize, height: photoSize }}
          className="rounded-3xl object-cover border-2 border-background shrink-0"
          crossOrigin="anonymous"
        />
      ) : (
        <div
          style={{ width: photoSize, height: photoSize }}
          className="rounded-3xl bg-primary text-primary-foreground flex items-center justify-center font-display font-800 text-4xl shrink-0 border-2 border-background"
        >
          {initials(d.fullName)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary mb-1">Profile</div>
        <div className="font-display font-800 leading-[1.05] break-words text-3xl">{d.fullName || "-"}</div>
        {d.pronouns && <div className="font-body text-xs opacity-70 mt-1">{d.pronouns}</div>}
        {d.tagline && <div className="font-body text-sm opacity-90 mt-2 italic">{d.tagline}</div>}
        {(d.email || d.phone || d.locationPreference) && (
          <div className="mt-2 font-body text-xs opacity-80 flex flex-wrap gap-x-3 gap-y-0.5">
            {d.email && <span>{d.email}</span>}
            {d.phone && <span>· {d.phone}</span>}
            {d.locationPreference && <span>· {d.locationPreference}</span>}
            {d.homeTown && <span>· From {d.homeTown}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- pull quote ----------
export const PullQuote: React.FC<{ quote: string; attribution?: string }> = ({ quote, attribution }) => {
  if (!quote) return null;
  return (
    <div
      className="rounded-3xl border-2 border-foreground bg-primary/10 p-5 flex gap-4 items-start shadow-[4px_4px_0_hsl(var(--foreground))]"
      style={{ breakInside: "avoid" }}
    >
      <div className="font-display text-primary text-[56px] leading-none -mt-2">“</div>
      <div className="flex-1">
        <div className="font-display font-800 text-xl leading-snug text-foreground">{quote}</div>
        {attribution && <div className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary mt-2">- {attribution}</div>}
      </div>
    </div>
  );
};

// ---------- stat cards ----------
export const StatCard: React.FC<{ value: React.ReactNode; label: string; tone?: "default" | "accent" }> = ({ value, label, tone = "default" }) => (
  <div
    className={`rounded-2xl border-2 border-foreground p-3 text-center shadow-[2px_2px_0_hsl(var(--foreground))] ${tone === "accent" ? "bg-primary text-primary-foreground" : "bg-background"}`}
    style={{ breakInside: "avoid" }}
  >
    <div className="font-display font-800 text-3xl leading-none">{value}</div>
    <div className="font-display text-[10px] font-700 uppercase tracking-[0.14em] mt-1">{label}</div>
  </div>
);

export const RiasecStrip: React.FC<{ d: PrintableData }> = ({ d }) => {
  const r = topRiasec(d.riasecScores);
  if (!r.length) return null;
  return (
    <Card eyebrow="How I'm wired" title="RIASEC top three">
      <div className="grid grid-cols-3 gap-2 mt-2">
        {r.map(x => <StatCard key={x.key} value={Math.round(x.value)} label={x.label} />)}
      </div>
    </Card>
  );
};

// Radar / hexagon graph showing all six RIASEC dimensions
export const RiasecRadar: React.FC<{ d: PrintableData }> = ({ d }) => {
  const scores = d.riasecScores;
  if (!scores || !Object.keys(scores).length) return null;
  const order: { key: string; label: string }[] = [
    { key: "R", label: "Realistic" },
    { key: "I", label: "Investigative" },
    { key: "A", label: "Artistic" },
    { key: "S", label: "Social" },
    { key: "E", label: "Enterprising" },
    { key: "C", label: "Conventional" },
  ];
  const max = Math.max(...order.map(o => Number((scores as any)[o.key] ?? 0)), 1);
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const angle = (i: number) => (Math.PI * 2 * i) / order.length - Math.PI / 2;
  const point = (i: number, r: number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r] as const;
  const rings = [0.25, 0.5, 0.75, 1];
  const dataPts = order.map((o, i) => point(i, radius * (Number((scores as any)[o.key] ?? 0) / max)));
  const polyPts = dataPts.map(p => p.join(",")).join(" ");
  return (
    <Card eyebrow="How I'm wired" title="RIASEC graph" className="h-full">
      <div className="flex items-center justify-center mt-1">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px] h-auto">
          {rings.map((r, i) => (
            <polygon
              key={i}
              points={order.map((_, j) => point(j, radius * r).join(",")).join(" ")}
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeOpacity={i === rings.length - 1 ? 0.6 : 0.18}
              strokeWidth={1}
            />
          ))}
          {order.map((_, i) => {
            const [x, y] = point(i, radius);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--foreground))" strokeOpacity={0.15} strokeWidth={1} />;
          })}
          <polygon points={polyPts} fill="hsl(var(--primary))" fillOpacity={0.35} stroke="hsl(var(--primary))" strokeWidth={2} />
          {dataPts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill="hsl(var(--foreground))" />
          ))}
          {order.map((o, i) => {
            const [x, y] = point(i, radius + 14);
            return (
              <text key={o.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: 9, fontWeight: 700 }}>
                {o.label}
              </text>
            );
          })}
        </svg>
      </div>
    </Card>
  );
};

export const ValuesChips: React.FC<{ d: PrintableData }> = ({ d }) => {
  const v = topValues(d.workValues);
  if (!v.length) return null;
  return (
    <Card eyebrow="What I want from work" title="My values">
      <div className="flex flex-wrap mt-1">
        {v.map((x, i) => <Chip key={x.key} tone="fill" index={i}>{x.key} · {Math.round(x.value)}</Chip>)}
      </div>
    </Card>
  );
};

// ---------- image mosaic ----------
export const ImageMosaic: React.FC<{ photos: { url: string; caption?: string }[]; cols?: 2 | 3; rows?: 2 | 3 }> = ({ photos, cols = 2, rows = 3 }) => {
  const max = cols * rows;
  const list = photos.filter(p => p.url).slice(0, max);
  if (!list.length) return null;
  return (
    <div className={`grid gap-2 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`} style={{ breakInside: "avoid" }}>
      {list.map((p, i) => (
        <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-foreground bg-muted shadow-[2px_2px_0_hsl(var(--foreground))]">
          <img src={p.url} alt={p.caption || ""} className="w-full h-full object-cover" crossOrigin="anonymous" />
        </div>
      ))}
    </div>
  );
};

// ---------- timeline (career) ----------
export const Timeline: React.FC<{ items: { title: string; company?: string; when?: string; description?: string; logoUrl?: string; link?: string }[]; titleText?: string }> = ({ items, titleText = "Career timeline" }) => (
  <div
    className="rounded-3xl border-2 border-foreground bg-card p-4 shadow-[4px_4px_0_hsl(var(--foreground))]"
    style={{ breakInside: "avoid" }}
  >
    <Eyebrow className="mb-1">Career</Eyebrow>
    <SectionTitle className="mb-3">{titleText}</SectionTitle>
    <div className="relative pl-5 space-y-3">
      <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-foreground/40" />
      {items.map((w, i) => (
        <div key={i} className="relative" style={{ breakInside: "avoid" }}>
          <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-foreground" />
          <div className="flex items-start gap-2.5">
            <SmartLogo
              name={w.company || w.title}
              link={(w as any).link}
              logoUrl={w.logoUrl}
              size={36}
              className="rounded-xl object-contain border-2 border-foreground bg-background shrink-0 p-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-display font-800 text-sm leading-tight">
                  {w.title}{w.company && <span className="font-600 opacity-70"> · {w.company}</span>}
                </div>
                {w.when && <div className="font-display text-[10px] font-700 uppercase tracking-wider opacity-60 shrink-0">{w.when}</div>}
              </div>
              {w.description && <p className="text-xs mt-1 leading-snug opacity-90">{w.description}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ---------- education stack ----------
export const EducationStack: React.FC<{ items: PrintableData["education"] }> = ({ items }) => {
  const ed = (items || []).filter(e => e.school || e.qualification);
  if (!ed.length) return null;
  return (
    <Card eyebrow="Learning" title="Education">
      <div className="space-y-2 mt-2">
        {ed.map((e, i) => (
          <div key={i} className="rounded-2xl border-2 border-foreground p-2.5 flex items-start gap-2.5 bg-background shadow-[2px_2px_0_hsl(var(--foreground))]" style={{ breakInside: "avoid" }}>
            <SmartLogo
              name={e.school}
              link={(e as any).link}
              logoUrl={e.logoUrl}
              size={36}
              className="rounded-xl object-contain border-2 border-foreground bg-background shrink-0 mt-0.5 p-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="font-display font-800 text-sm leading-tight">{e.school}</div>
              {e.qualification && <div className="text-xs mt-0.5">{e.qualification}</div>}
              <div className="flex justify-between text-[10px] font-display uppercase tracking-wider opacity-70 mt-1">
                <span>{e.dates}</span><span>{e.grade}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ---------- fun facts ----------
const FUN_FACT_COLOURS = [
  "bg-yellow-200",
  "bg-pink-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-orange-200",
  "bg-purple-200",
];
export const FunFactStrip: React.FC<{ items: { q: string; a: string }[]; cols?: 2 | 3 }> = ({ items, cols = 2 }) => {
  const list = items.filter(f => f.q && f.a);
  if (!list.length) return null;
  return (
    <div
      className="rounded-3xl border-2 border-foreground bg-card p-3 h-full flex flex-col shadow-[4px_4px_0_hsl(var(--foreground))]"
      style={{ breakInside: "avoid" }}
    >
      <div className="flex items-baseline gap-2 mb-2">
        <Eyebrow>Fun facts</Eyebrow>
        <div className="font-body text-[10px] italic opacity-60">things you don't know about me</div>
      </div>
      <div className={`grid gap-2 flex-1 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {list.map((f, i) => (
          <div
            key={i}
            className={`rounded-2xl border-2 border-foreground p-2.5 shadow-[2px_2px_0_hsl(var(--foreground))] ${FUN_FACT_COLOURS[i % FUN_FACT_COLOURS.length]}`}
            style={{ breakInside: "avoid" }}
          >
            <div className="font-display text-[10px] font-700 uppercase tracking-[0.14em] text-foreground/80">{f.q}</div>
            <div className="text-xs mt-1 leading-snug text-foreground">{f.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- target panel ----------
export const TargetPanel: React.FC<{ roles: string[]; companies: string[] }> = ({ roles, companies }) => {
  if (!roles.length && !companies.length) return null;
  return (
    <Card eyebrow="Most wanted" title="Where I'm headed">
      {roles.length > 0 && <>
        <div className="font-display text-[10px] font-700 uppercase tracking-[0.14em] mb-1 mt-2">Roles</div>
        <ChipCloud items={roles} cap={8} />
      </>}
      {companies.length > 0 && <>
        <div className="font-display text-[10px] font-700 uppercase tracking-[0.14em] mb-1 mt-2">Employers</div>
        <ChipCloud items={companies} cap={12} tone="fill" />
      </>}
    </Card>
  );
};

// ---------- prompt answers (editorial filler) ----------
export const PromptAnswers: React.FC<{ answers: Record<string, string> | undefined; cap?: number }> = ({ answers, cap = 3 }) => {
  if (!answers) return null;
  const entries = Object.entries(answers).filter(([, v]) => (v || "").trim().length > 0).slice(0, cap);
  if (!entries.length) return null;
  return (
    <Card eyebrow="In conversation" title="In my own words">
      <div className="space-y-2 mt-2">
        {entries.map(([q, a], i) => (
          <div key={i} style={{ breakInside: "avoid" }}>
            <div className="font-display text-[10px] font-700 uppercase tracking-[0.14em] text-primary">{q.replace(/_/g, " ")}</div>
            <div className="text-xs leading-snug mt-0.5">{a}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ---------- identity bar (compact masthead) ----------
export const IdentityBar: React.FC<{ d: PrintableData }> = ({ d }) => (
  <div className="flex items-center gap-3 border-b-2 border-foreground pb-1">
    {d.photoUrl ? (
      <img src={d.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-foreground shrink-0" crossOrigin="anonymous" />
    ) : (
      <div className="w-14 h-14 rounded-full bg-foreground text-background font-display font-800 text-lg flex items-center justify-center shrink-0 border-2 border-foreground">
        {initials(d.fullName)}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <Eyebrow>Profile · {d.locationPreference || d.homeTown || "-"}</Eyebrow>
      <div className="font-display font-800 text-2xl leading-[1.05] mt-0.5">{d.fullName || "-"}</div>
      {d.tagline && <div className="font-body text-xs italic opacity-80 leading-tight mt-0.5">{d.tagline}</div>}
    </div>
  </div>
);

// ---------- mini stat strip (inline) ----------
export const MiniStatStrip: React.FC<{ items: { value: React.ReactNode; label: string }[] }> = ({ items }) => {
  if (!items.length) return null;
  return (
    <div
      className="flex divide-x-2 divide-foreground border-2 border-foreground rounded-2xl overflow-hidden bg-background shadow-[2px_2px_0_hsl(var(--foreground))]"
      style={{ breakInside: "avoid" }}
    >
      {items.map((s, i) => (
        <div key={i} className="flex-1 px-3 py-2 text-center">
          <div className="font-display font-800 text-2xl leading-none">{s.value}</div>
          <div className="font-display text-[10px] font-700 uppercase tracking-[0.14em] opacity-70 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ---------- feature band (edge-to-edge) ----------
export const FeatureBand: React.FC<{ eyebrow?: string; title: string; body?: string; tone?: "dark" | "accent" }> = ({ eyebrow, title, body, tone = "dark" }) => (
  <div
    className={`rounded-3xl border-2 border-foreground px-5 py-4 shadow-[4px_4px_0_hsl(var(--foreground))] ${tone === "dark" ? "bg-foreground text-background" : "bg-primary/10 text-foreground"}`}
    style={{ breakInside: "avoid" }}
  >
    {eyebrow && <div className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary mb-1">{eyebrow}</div>}
    <div className="font-display font-800 text-xl leading-tight">{title}</div>
    {body && <div className="font-body text-sm leading-snug opacity-90 mt-1.5">{body}</div>}
  </div>
);

// ---------- editorial timeline (hero + 2-col compact rows) ----------
export const EditorialTimeline: React.FC<{
  items: { title: string; company?: string; when?: string; description?: string; logoUrl?: string; link?: string }[];
  titleText?: string;
}> = ({ items, titleText = "How I've spent my time" }) => {
  if (!items.length) return null;
  const [hero, ...rest] = items;
  return (
    <div
      className="rounded-3xl border-2 border-foreground bg-card p-4 h-full flex flex-col shadow-[4px_4px_0_hsl(var(--foreground))]"
      style={{ breakInside: "avoid" }}
    >
      <Eyebrow>Career</Eyebrow>
      <SectionTitle className="mb-3 mt-1">{titleText}</SectionTitle>
      {hero && (
        <div
          className="rounded-2xl bg-primary/10 border-2 border-foreground p-3 flex gap-3 mb-3 shadow-[2px_2px_0_hsl(var(--foreground))]"
          style={{ breakInside: "avoid" }}
        >
          <SmartLogo
            name={hero.company || hero.title}
            link={hero.link}
            logoUrl={hero.logoUrl}
            size={48}
            className="rounded-xl object-contain border-2 border-foreground bg-background shrink-0 p-1"
            fallback={<div className="w-12 h-12 rounded-xl bg-primary/30 shrink-0 border-2 border-foreground" />}
          />
          <div className="flex-1 min-w-0">
            <div className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary">Now</div>
            <div className="font-display font-800 text-base leading-tight mt-0.5">
              {hero.title}
              {hero.company && <span className="opacity-70 font-600"> · {hero.company}</span>}
            </div>
            {hero.when && <div className="font-display text-[10px] font-700 uppercase tracking-wider opacity-60 mt-1">{hero.when}</div>}
            {hero.description && <p className="text-xs mt-1.5 leading-snug opacity-90">{hero.description}</p>}
          </div>
        </div>
      )}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-2 content-start">
          {rest.map((w, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-foreground p-2 flex gap-2 bg-background shadow-[2px_2px_0_hsl(var(--foreground))]"
              style={{ breakInside: "avoid" }}
            >
              <SmartLogo
                name={w.company || w.title}
                link={w.link}
                logoUrl={w.logoUrl}
                size={28}
                className="rounded-lg object-contain border border-foreground/30 bg-background shrink-0 mt-0.5 p-0.5"
                fallback={<div className="w-7 h-7 rounded-lg bg-primary/30 shrink-0 mt-0.5 border border-foreground/30" />}
              />
              <div className="flex-1 min-w-0">
                {w.when && <div className="font-display text-[9px] font-700 uppercase tracking-wider opacity-60 leading-none">{w.when}</div>}
                <div className="font-display font-800 text-xs leading-tight mt-0.5">{w.title}</div>
                {w.company && <div className="text-[10px] opacity-70 leading-tight truncate">{w.company}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
