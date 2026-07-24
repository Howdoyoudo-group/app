import { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import RolePageLayout from "@/components/RolePageLayout";
import RoleOverview from "@/components/RoleOverview";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import { roles, industryToSlug } from "@/data/roles";
import { supabase } from "@/integrations/supabase/client";

const GENERIC_DAY_TO_DAY = [
  "Hands-on work that matters to the people you serve",
  "Building expertise through practice and on-the-job learning",
  "Working closely with colleagues across the business",
  "Keeping standards high and customers / clients happy",
  "Picking up new tools, regulations and ways of working",
];

const GENERIC_SKILLS = ["Communication", "Attention to Detail", "Reliability", "Problem Solving", "Teamwork"];

/**
 * Generic role page - renders any role defined in src/data/roles.ts
 * for which there isn't a bespoke page yet.
 *
 * This guarantees no role slug listed in roles.ts ever 404s.
 */
const RoleGeneric = () => {
  const { slug } = useParams<{ slug: string }>();
  const role = useMemo(() => roles.find((r) => r.slug === slug), [slug]);
  const [cpData, setCpData] = useState<{ description: string | null; skills: string[] | null }>({ description: null, skills: null });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    supabase
      .from("role_metadata")
      .select("cp_description, cp_skills")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setCpData({
          description: (data as any)?.cp_description ?? null,
          skills: (data as any)?.cp_skills ?? null,
        });
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (!role) {
    return <Navigate to="/roles" replace />;
  }

  // Use the first industry as the contextual hook for events/jobs links.
  const primaryIndustry = role.industries[0];
  const industryHref = primaryIndustry ? industryToSlug[primaryIndustry] : undefined;

  // Real CareerPilot data (day-to-day tasks, skills) when we have it for this
  // role - only falls back to generic boilerplate for the roles CareerPilot
  // doesn't cover yet, rather than showing stale generic text for everyone.
  const overviewData = {
    summary: role.description,
    dayToDay: cpData.description
      ? cpData.description.split(/;\s*/).map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      : GENERIC_DAY_TO_DAY,
    skills: cpData.skills?.length
      ? cpData.skills.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      : GENERIC_SKILLS,
    traits: [
      "Genuine interest in the work and the industry",
      "Comfortable learning on the job",
      "Reliable, organised and self-motivated",
      "Cares about doing things properly",
    ],
    salary: "Varies by employer and experience",
    entryTip:
      "Routes in vary - apprenticeships, college courses, direct entry roles and on-the-job training are all common. Browse live jobs below to see what employers are asking for right now.",
  };

  const tabs = [
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <RoleOverview name={role.title} data={overviewData} />
          {role.industries.length > 0 && (
            <div className="border border-border p-6 mb-12">
              <h3 className="font-display text-xl md:text-2xl font-700 mb-3">
                Where this role shows up<span className="text-primary">.</span>
              </h3>
              <p className="text-muted-foreground font-body text-sm mb-4">
                {role.title} appears across these industries - click through to
                explore each one.
              </p>
              <div className="flex flex-wrap gap-2">
                {role.industries.map((ind) => {
                  const href = industryToSlug[ind];
                  return href ? (
                    <Link
                      key={ind}
                      to={href}
                      className="text-xs font-display font-600 px-3 py-1.5 border border-border hover:border-primary hover:text-primary transition-colors"
                    >
                      {ind}
                    </Link>
                  ) : (
                    <span
                      key={ind}
                      className="text-xs font-display font-600 px-3 py-1.5 border border-border text-muted-foreground"
                    >
                      {ind}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: primaryIndustry ? (
        <EventsSection
          industry={primaryIndustry}
          searchQuery={`${role.title} ${primaryIndustry} UK`}
        />
      ) : (
        <div className="border border-border p-6">
          <p className="text-muted-foreground font-body text-sm">
            We're curating events for this role.
          </p>
        </div>
      ),
    },
    {
      id: "watch",
      label: "Watch",
      content: <RoleWatchSection roleSlug={role.slug} roleName={role.title} />,
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">
            Job Marketplace<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-4">
            Browse live {role.title} roles across the UK.
          </p>
          <Link
            to={`/marketplace?role=${role.slug}#jobs-list`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity"
          >
            View {role.title} Jobs
          </Link>
          {industryHref && (
            <Link
              to={industryHref}
              className="inline-flex items-center gap-2 ml-3 border border-border px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:border-primary hover:text-primary transition-colors"
            >
              Explore {primaryIndustry}
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <RolePageLayout
      name={role.title}
      description={role.description}
      tabs={tabs}
      category={role.category}
      slug={role.slug}
    />
  );
};

export default RoleGeneric;
