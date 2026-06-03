import type { CareerStage } from "@/components/CareerMap";
import { PoundSterling, ExternalLink, Building2, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const getBrandDomain = (url: string): string | null => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    // Strip common career-site subdomains to get the brand root
    const parts = hostname.split(".");
    if (parts.length > 2) {
      const sub = parts[0].toLowerCase();
      if (["careers", "jobs", "career", "recruit", "hiring", "apply", "talent", "workfor", "work"].includes(sub)) {
        return parts.slice(1).join(".");
      }
    }
    return hostname;
  } catch {
    return null;
  }
};

const CompanyLogo = ({ url, name }: { url: string; name: string }) => {
  const [failed, setFailed] = useState(false);
  const domain = getBrandDomain(url);

  if (!domain || failed) {
    return (
      <div className="w-10 h-10 rounded border border-border bg-muted flex items-center justify-center shrink-0">
        <Building2 className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt={`${name} logo`}
      className="w-10 h-10 rounded border border-border object-contain bg-white shrink-0"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
};

interface CompanyWithCareers {
  name: string;
  url: string;
  hq?: string;
  valueChainStage?: string;
}

interface IndustryRolesShowcaseProps {
  stages: CareerStage[];
  industry: string;
  companies?: CompanyWithCareers[];
}

interface ShowcaseRole {
  name: string;
  description: string;
  salary?: string;
  category: string;
}

const RoleCard = ({ role, industry }: { role: ShowcaseRole; industry: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [longDesc, setLongDesc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMore = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (longDesc || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke("expand-role", {
        body: { roleName: role.name, industry, shortDescription: role.description },
      });
      if (err) throw err;
      const desc = (data as { description?: string })?.description?.trim();
      if (desc) setLongDesc(desc);
      else setError("No description returned.");
    } catch (e) {
      setError("Couldn't load - try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border p-5 hover:border-primary/40 transition-colors flex flex-col">
      <span className="inline-block text-[10px] font-display uppercase tracking-widest text-primary mb-2">
        {role.category}
      </span>
      <h3 className="font-display text-base font-700 mb-2">{role.name}</h3>
      <p
        className={`text-muted-foreground font-body text-xs leading-relaxed mb-2 whitespace-pre-line ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {expanded && longDesc ? longDesc : role.description}
      </p>
      {expanded && loading && (
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading more…
        </p>
      )}
      {expanded && error && (
        <p className="text-[11px] text-destructive mb-2">{error}</p>
      )}
      <button
        type="button"
        onClick={handleMore}
        className="self-start text-[11px] font-display uppercase tracking-wider text-primary hover:underline mb-3"
      >
        {expanded ? "Less" : "More"}
      </button>
      {role.salary && (
        <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border/60">
          <PoundSterling className="w-3 h-3" />
          <span className="font-body">{role.salary}</span>
        </div>
      )}
    </div>
  );
};

const IndustryRolesShowcase = ({ stages, industry, companies = [] }: IndustryRolesShowcaseProps) => {
  // Pick two representative roles from each stage
  const showcaseRoles = stages.flatMap((stage) =>
    (stage.roles || []).slice(0, 2).map((role) => ({
      ...role,
      category: stage.title,
    }))
  );

  // Filter companies that have a careers URL
  const companiesWithCareers = companies.filter((c) => c.url);

  if (showcaseRoles.length === 0 && companiesWithCareers.length === 0) return null;

  return (
    <div className="space-y-12 mb-12">
      {/* Companies with open roles */}
      {companiesWithCareers.length > 0 && (
        <div className="border border-border p-6">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">
            Who's hiring<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-6">
            These {industry} employers have careers pages with open roles - visit them directly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companiesWithCareers.map((company) => (
              <a
                key={company.name}
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-border p-4 hover:border-primary/40 transition-colors group block"
              >
                <div className="flex items-start gap-3">
                  <CompanyLogo url={company.url} name={company.name} />
                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-display uppercase tracking-widest text-primary mb-1">
                      {company.valueChainStage || "Open roles"}
                    </span>
                    <h3 className="font-display text-sm font-700 mb-1 group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    {company.hq && (
                      <p className="text-muted-foreground font-body text-xs mb-2">{company.hq}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider text-primary">
                      View open roles <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Role types showcase */}
      {showcaseRoles.length > 0 && (
        <div className="border border-border p-6">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">
            Roles in {industry}<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-6">
            These are the types of roles you'll find across {industry} - live vacancies are being added daily.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {showcaseRoles.map((role) => (
              <RoleCard key={role.name} role={role} industry={industry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustryRolesShowcase;
