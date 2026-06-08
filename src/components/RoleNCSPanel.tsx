// RoleNCSPanel: displays enriched career data sourced from the National Careers Service.
// Rendered on role pages for roles that have an NCS equivalent.
// Returns null (no output) if no data exists — fully graceful.

import { useEffect, useState } from "react";
import { Clock, GraduationCap, PoundSterling, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EntryRoute {
  type: "Apprenticeship" | "College" | "University" | string;
  name: string;
  level?: string;
  duration?: string;
}

interface NCSData {
  ncs_url: string | null;
  ncs_salary_starter: number | null;
  ncs_salary_experienced: number | null;
  ncs_hours: string | null;
  ncs_work_pattern: string | null;
  ncs_entry_routes: EntryRoute[] | null;
  ncs_qualifications: string | null;
}

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB")}`;
}

export default function RoleNCSPanel({ slug }: { slug: string }) {
  const [data, setData] = useState<NCSData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("role_metadata")
      .select(
        "ncs_url,ncs_salary_starter,ncs_salary_experienced,ncs_hours,ncs_work_pattern,ncs_entry_routes,ncs_qualifications"
      )
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data: row }) => {
        if (!cancelled && row) setData(row as NCSData);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (!data) return null;

  const hasSalary = data.ncs_salary_starter || data.ncs_salary_experienced;
  const hasHours = data.ncs_hours;
  const hasRoutes = data.ncs_entry_routes && data.ncs_entry_routes.length > 0;
  if (!hasSalary && !hasHours && !hasRoutes) return null;

  const apprenticeships = data.ncs_entry_routes?.filter((r) => r.type === "Apprenticeship") ?? [];
  const otherRoutes = data.ncs_entry_routes?.filter((r) => r.type !== "Apprenticeship") ?? [];

  return (
    <div className="border-2 border-foreground/10 bg-muted/30 mb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display font-700 text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
            UK Career Facts
          </p>
          <h3 className="font-display font-800 text-base">National Careers Service data</h3>
        </div>
        {data.ncs_url && (
          <a
            href={data.ncs_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-display font-600 text-muted-foreground hover:text-primary inline-flex items-center gap-1 shrink-0"
          >
            View on NCS <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Stats row */}
      <div className="px-5 pb-4 flex flex-wrap gap-4 md:gap-8">
        {hasSalary && (
          <div className="flex items-start gap-2">
            <PoundSterling className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-display font-700 text-sm">
                {data.ncs_salary_starter ? fmt(data.ncs_salary_starter) : "—"}
                {data.ncs_salary_experienced ? ` → ${fmt(data.ncs_salary_experienced)}` : ""}
              </p>
              <p className="font-body text-[11px] text-muted-foreground">
                Starter → experienced · UK-wide avg
              </p>
            </div>
          </div>
        )}

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

        {hasRoutes && (
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-display font-700 text-sm">
                {apprenticeships.length > 0
                  ? `${apprenticeships.length} apprenticeship route${apprenticeships.length > 1 ? "s" : ""}`
                  : "Entry routes available"}
              </p>
              <button
                onClick={() => setOpen((v) => !v)}
                className="font-body text-[11px] text-primary hover:underline inline-flex items-center gap-0.5"
              >
                {open ? "Hide" : "Show routes"}{" "}
                {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expanded entry routes */}
      {open && hasRoutes && (
        <div className="border-t border-border px-5 py-4">
          {apprenticeships.length > 0 && (
            <div className="mb-4">
              <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Apprenticeship routes
              </p>
              <div className="space-y-2">
                {apprenticeships.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 font-display font-700 text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground uppercase tracking-wider">
                      L{r.level ?? "?"}
                    </span>
                    <div>
                      <p className="font-display font-600 text-xs">{r.name}</p>
                      {r.duration && (
                        <p className="font-body text-[11px] text-muted-foreground">{r.duration}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherRoutes.length > 0 && (
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Other routes
              </p>
              <div className="flex flex-wrap gap-2">
                {otherRoutes.map((r, i) => (
                  <span
                    key={i}
                    className="font-display font-600 text-xs px-2.5 py-1 border border-border bg-background"
                  >
                    {r.type} — {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.ncs_qualifications && (
            <p className="font-body text-[11px] text-muted-foreground mt-3 border-t border-border pt-3">
              <span className="font-display font-600">Qualifications: </span>
              {data.ncs_qualifications}
            </p>
          )}
        </div>
      )}

      {/* Footer note */}
      <div className="px-5 pb-3">
        <p className="font-body text-[10px] text-muted-foreground/60">
          Source: National Careers Service (UK government). Salaries are UK-wide averages — London typically higher.
        </p>
      </div>
    </div>
  );
}
