// RoleNCSPanel: displays enriched career data from the National Careers Service
// and CareerPilot (UK government sources), plus a Skills England skills block.
// Returns null (no output) if no data exists — fully graceful.

import { useEffect, useState } from "react";
import RoleSkillsBlock from "@/components/RoleSkillsBlock";
import {
  Clock,
  GraduationCap,
  PoundSterling,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowRight,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ────────────────────────────────────────────────────────────────────

interface NCSEntryRoute {
  type: "Apprenticeship" | "College" | "University" | string;
  name: string;
  level?: string;
  duration?: string;
}

interface CPEntryRoute {
  type: "apprenticeship" | "t-level" | "a-level" | "btec" | "university" | string;
  name?: string;
  level?: number;
  duration?: string;
  requirements?: string;
  subjects?: string[];
}

interface RelatedRole {
  title: string;
  salary_range: string;
}

interface RoleMetadata {
  // NCS fields
  ncs_url: string | null;
  ncs_salary_starter: number | null;
  ncs_salary_experienced: number | null;
  ncs_hours: string | null;
  ncs_work_pattern: string | null;
  ncs_entry_routes: NCSEntryRoute[] | null;
  ncs_qualifications: string | null;
  // CareerPilot fields
  cp_url: string | null;
  cp_salary_min: number | null;
  cp_salary_max: number | null;
  cp_entry_routes: CPEntryRoute[] | null;
  cp_career_progression: string[] | null;
  cp_related_roles: RelatedRole[] | null;
  cp_work_environment: string | null;
  cp_growth: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtK(n: number): string {
  return `£${Math.round(n / 1000)}k`;
}
function fmtFull(n: number): string {
  return `£${n.toLocaleString("en-GB")}`;
}

const LEVEL_COLOURS: Record<number, string> = {
  2: "bg-blue-100 text-blue-800 border-blue-200",
  3: "bg-green-100 text-green-800 border-green-200",
  4: "bg-yellow-100 text-yellow-800 border-yellow-200",
  5: "bg-orange-100 text-orange-800 border-orange-200",
  6: "bg-purple-100 text-purple-800 border-purple-200",
  7: "bg-pink-100 text-pink-800 border-pink-200",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * CareerPilot sometimes stores apprenticeship names as the full prose sentence:
 * "You might be able to apply for a Registered Nurse Level 6 Degree Apprenticeship"
 * This strips the leading filler, leaving just the standard name.
 */
function cleanApprName(name: string): string {
  if (!name) return name;
  return name
    // Strip leading "You [might/can] [be able to] [apply for a / do a / complete a]"
    .replace(/^You\s+(?:might|may|can|could)\s+(?:be\s+able\s+to\s+)?(?:apply\s+(?:for|to\s+do)\s+an?\s+|do\s+an?\s+|complete\s+an?\s+)?/i, "")
    // Strip "apply for a / to do a / through a / complete a" prefix
    .replace(/^(?:apply\s+(?:for\s+)?(?:to\s+do\s+)?|to\s+do\s+|through\s+|complete\s+|do\s+)an?\s+/i, "")
    // Strip trailing "Level N [type] Apprenticeship" if it leaked into the name
    .replace(/\s+Level\s+\d.*$/i, "")
    .replace(/\s+[Aa]pprenticeship.*$/i, "")
    .trim();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ApprenticeshipCard({ route }: { route: CPEntryRoute }) {
  const lvl = route.level ?? 0;
  const colourClass = LEVEL_COLOURS[lvl] ?? "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <div className="flex items-start gap-3 p-3 border border-border bg-background rounded-sm">
      {lvl > 0 && (
        <span className={`shrink-0 text-[10px] font-display font-800 px-1.5 py-0.5 border rounded-sm uppercase tracking-wide ${colourClass}`}>
          L{lvl}
        </span>
      )}
      <div className="min-w-0">
        <p className="font-display font-700 text-xs leading-tight">{route.name ? cleanApprName(route.name) : ""}</p>
        <div className="flex flex-wrap gap-x-3 mt-0.5">
          {route.duration && (
            <span className="font-body text-[11px] text-muted-foreground">{route.duration}</span>
          )}
          {route.requirements && (
            <span className="font-body text-[11px] text-muted-foreground">{route.requirements}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function TLevelBadge({ name }: { name: string }) {
  return (
    <div className="flex items-start gap-2 p-3 border border-border bg-background rounded-sm">
      <span className="shrink-0 text-[10px] font-display font-800 px-1.5 py-0.5 border rounded-sm bg-teal-50 text-teal-700 border-teal-200 uppercase tracking-wide">
        T Level
      </span>
      <div className="min-w-0">
        <p className="font-display font-700 text-xs leading-tight">{name.replace(/^T Level in /i, "")}</p>
        <p className="font-body text-[11px] text-muted-foreground mt-0.5">
          2-year post-GCSE qualification (equivalent to 3 A levels)
        </p>
      </div>
    </div>
  );
}

function CareerLadder({ steps }: { steps: string[] }) {
  return (
    <div>
      <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5" />
        Career ladder
      </p>
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex flex-wrap items-center gap-1.5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="font-display font-600 text-xs px-2.5 py-1.5 bg-muted/50 border border-border rounded-sm whitespace-nowrap">
              {step}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </div>
      {/* Mobile: vertical list */}
      <div className="md:hidden space-y-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-display font-600 text-xs w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="font-display font-600 text-xs">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RoleNCSPanel({ slug }: { slug: string }) {
  const [data, setData] = useState<RoleMetadata | null>(null);
  const [routesOpen, setRoutesOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("role_metadata")
      .select(
        [
          "ncs_url", "ncs_salary_starter", "ncs_salary_experienced",
          "ncs_hours", "ncs_work_pattern", "ncs_entry_routes", "ncs_qualifications",
          "cp_url", "cp_salary_min", "cp_salary_max",
          "cp_entry_routes", "cp_career_progression",
          "cp_related_roles", "cp_work_environment", "cp_growth",
        ].join(",")
      )
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data: row }) => {
        if (!cancelled && row) setData(row as RoleMetadata);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (!data) return null;

  // ── Derived values ──────────────────────────────────────────────────────
  // Prefer CareerPilot salary range; fall back to NCS starter/experienced
  const showSalaryRange = data.cp_salary_min && data.cp_salary_max;
  const showNcsSalary = !showSalaryRange && (data.ncs_salary_starter || data.ncs_salary_experienced);
  const hasHours = data.ncs_hours;
  const workEnv = data.cp_work_environment;

  // Entry routes: CareerPilot has the richer data (A levels, T levels, named apprenticeships)
  const cpRoutes = data.cp_entry_routes ?? [];
  const cpApprenticeships = cpRoutes.filter(r => r.type === "apprenticeship");
  const cpTLevels = cpRoutes.filter(r => r.type === "t-level");
  const cpALevels = cpRoutes.filter(r => r.type === "a-level");
  const cpBTECs = cpRoutes.filter(r => r.type === "btec");
  const cpUni = cpRoutes.filter(r => r.type === "university");

  // Fall back to NCS routes if no CareerPilot data
  const ncsApprenticeships = data.ncs_entry_routes?.filter(r => r.type === "Apprenticeship") ?? [];
  const ncsOtherRoutes = data.ncs_entry_routes?.filter(r => r.type !== "Apprenticeship") ?? [];

  const hasRoutes = cpRoutes.length > 0 || (data.ncs_entry_routes?.length ?? 0) > 0;
  const hasProgression = (data.cp_career_progression?.length ?? 0) >= 3;
  const hasRelated = (data.cp_related_roles?.length ?? 0) > 0;

  const hasAnything = showSalaryRange || showNcsSalary || hasHours || hasRoutes || hasProgression;
  if (!hasAnything) return null;

  return (
    <div className="border-2 border-foreground/10 bg-muted/30 mb-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
            UK Career Facts
          </p>
          <h3 className="font-display font-800 text-base">Salary, hours & how to get in</h3>
        </div>
        <div className="flex items-center gap-3">
          {data.cp_url && (
            <a href={data.cp_url} target="_blank" rel="noopener noreferrer"
              className="text-[11px] font-display font-600 text-muted-foreground hover:text-primary inline-flex items-center gap-1 shrink-0">
              CareerPilot <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {data.ncs_url && (
            <a href={data.ncs_url} target="_blank" rel="noopener noreferrer"
              className="text-[11px] font-display font-600 text-muted-foreground hover:text-primary inline-flex items-center gap-1 shrink-0">
              NCS <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="px-5 pb-4 flex flex-wrap gap-4 md:gap-8">

        {/* Salary — CareerPilot range preferred */}
        {showSalaryRange && (
          <div className="flex items-start gap-2">
            <PoundSterling className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-display font-700 text-sm">
                {fmtK(data.cp_salary_min!)} – {fmtK(data.cp_salary_max!)}
              </p>
              <p className="font-body text-[11px] text-muted-foreground">UK salary range</p>
            </div>
          </div>
        )}
        {showNcsSalary && (
          <div className="flex items-start gap-2">
            <PoundSterling className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-display font-700 text-sm">
                {data.ncs_salary_starter ? fmtFull(data.ncs_salary_starter) : "—"}
                {data.ncs_salary_experienced ? ` → ${fmtFull(data.ncs_salary_experienced)}` : ""}
              </p>
              <p className="font-body text-[11px] text-muted-foreground">Starter → experienced · UK-wide avg</p>
            </div>
          </div>
        )}

        {/* Hours */}
        {hasHours && (
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-display font-700 text-sm">{data.ncs_hours} hrs/week</p>
              {data.ncs_work_pattern && (
                <p className="font-body text-[11px] text-muted-foreground capitalize">
                  {data.ncs_work_pattern}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Entry routes summary */}
        {hasRoutes && (
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-display font-700 text-sm">
                {cpApprenticeships.length > 0
                  ? `${cpApprenticeships.length} apprenticeship route${cpApprenticeships.length > 1 ? "s" : ""}`
                  : ncsApprenticeships.length > 0
                  ? `${ncsApprenticeships.length} apprenticeship route${ncsApprenticeships.length > 1 ? "s" : ""}`
                  : "Entry routes available"}
              </p>
              <button
                onClick={() => setRoutesOpen(v => !v)}
                className="font-body text-[11px] text-primary hover:underline inline-flex items-center gap-0.5"
              >
                {routesOpen ? "Hide routes" : "How to get in"}{" "}
                {routesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {/* Growth outlook */}
        {data.cp_growth && (
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-display font-700 text-sm">Growing</p>
              <p className="font-body text-[11px] text-muted-foreground">{data.cp_growth}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Work environment badge ──────────────────────────────────────── */}
      {workEnv && (
        <div className="px-5 pb-4">
          <span className="inline-flex items-center gap-1.5 font-body text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border">
            <Briefcase className="w-3 h-3 shrink-0" />
            {workEnv}
          </span>
        </div>
      )}

      {/* ── Expanded: How to get in ─────────────────────────────────────── */}
      {routesOpen && hasRoutes && (
        <div className="border-t border-border px-5 py-5 space-y-5">

          {/* CareerPilot apprenticeships */}
          {cpApprenticeships.length > 0 && (
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Apprenticeship routes
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {cpApprenticeships.map((r, i) => (
                  <ApprenticeshipCard key={i} route={r} />
                ))}
              </div>
            </div>
          )}

          {/* Fall back to NCS apprenticeships if no CareerPilot ones */}
          {cpApprenticeships.length === 0 && ncsApprenticeships.length > 0 && (
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Apprenticeship routes
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ncsApprenticeships.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border border-border bg-background rounded-sm">
                    {r.level && (
                      <span className={`shrink-0 text-[10px] font-display font-800 px-1.5 py-0.5 border rounded-sm uppercase tracking-wide ${LEVEL_COLOURS[parseInt(r.level)] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
                        L{r.level}
                      </span>
                    )}
                    <div>
                      <p className="font-display font-700 text-xs">{r.name}</p>
                      {r.duration && <p className="font-body text-[11px] text-muted-foreground">{r.duration}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* T Levels */}
          {cpTLevels.length > 0 && (
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                T Level routes
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {cpTLevels.map((r, i) => (
                  <TLevelBadge key={i} name={r.name ?? ""} />
                ))}
              </div>
            </div>
          )}

          {/* BTECs */}
          {cpBTECs.length > 0 && (
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                BTEC routes
              </p>
              <div className="flex flex-wrap gap-2">
                {cpBTECs.map((r, i) => (
                  <span key={i} className="font-display font-600 text-xs px-2.5 py-1.5 border border-border bg-background rounded-sm">
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* A levels */}
          {cpALevels.length > 0 && (
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                A level route
              </p>
              <div className="flex flex-wrap gap-2">
                {cpALevels.map((r, i) => (
                  <span key={i} className="font-display font-600 text-xs px-2.5 py-1.5 border border-border bg-muted/40 rounded-sm">
                    📚 {r.requirements}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* University subjects */}
          {cpUni.length > 0 && cpUni[0].subjects && cpUni[0].subjects.length > 0 && (
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                University route — relevant degrees
              </p>
              <div className="flex flex-wrap gap-2">
                {cpUni[0].subjects.map((s, i) => (
                  <span key={i} className="font-body text-[11px] px-2 py-0.5 bg-muted/60 border border-border rounded-full capitalize">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* NCS other routes fallback */}
          {cpRoutes.length === 0 && ncsOtherRoutes.length > 0 && (
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Other routes
              </p>
              <div className="flex flex-wrap gap-2">
                {ncsOtherRoutes.map((r, i) => (
                  <span key={i} className="font-display font-600 text-xs px-2.5 py-1 border border-border bg-background">
                    {r.type} — {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* NCS qualifications note */}
          {data.ncs_qualifications && (
            <p className="font-body text-[11px] text-muted-foreground border-t border-border pt-3">
              <span className="font-display font-600">Qualifications note: </span>
              {data.ncs_qualifications}
            </p>
          )}
        </div>
      )}

      {/* ── Career ladder ───────────────────────────────────────────────── */}
      {hasProgression && (
        <div className="border-t border-border px-5 py-5">
          <CareerLadder steps={data.cp_career_progression!} />
        </div>
      )}

      {/* ── Related roles ───────────────────────────────────────────────── */}
      {hasRelated && (
        <div className="border-t border-border px-5 py-4">
          <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Related roles
          </p>
          <div className="flex flex-wrap gap-2">
            {data.cp_related_roles!.map((r, i) => (
              <span key={i} className="font-body text-[11px] px-2.5 py-1 bg-muted/40 border border-border rounded-full">
                {r.title}
                {r.salary_range && (
                  <span className="text-muted-foreground ml-1">· {r.salary_range}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="px-5 pb-3">
        <p className="font-body text-[10px] text-muted-foreground/60">
          Sources: National Careers Service & CareerPilot (UK government data). Salaries are UK-wide averages — London typically higher.
        </p>
      </div>

      {/* ── Skills England skills block ──────────────────────────────────── */}
      <div className="px-5 pb-5">
        <RoleSkillsBlock slug={slug} />
      </div>
    </div>
  );
}
