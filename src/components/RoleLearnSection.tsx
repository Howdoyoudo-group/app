import { ExternalLink, GraduationCap } from "lucide-react";
import { coursesByIndustry } from "@/data/courses";
import { roles } from "@/data/roles";
import OnlineLearningGrid from "@/components/OnlineLearningGrid";

interface RoleLearnSectionProps {
  roleName: string;
  roleSlug: string;
}

const COURSE_INDUSTRY_ALIASES: Record<string, string> = {
  hospitality: "food & drink",
};

const MAX_COURSES = 12;

const RoleLearnSection = ({ roleName, roleSlug }: RoleLearnSectionProps) => {
  const role = roles.find((item) => item.slug === roleSlug);

  // Industry trade courses (City & Guilds plumbing, IMI automotive quals, brewing
  // certificates, etc.) are only genuinely relevant for roles tied to one real
  // trade/industry. Business-function roles (Sales, Marketing, Sustainability
  // Manager...) exist across dozens of unrelated industries, so cross-referencing
  // them here surfaced irrelevant industry courses instead of role-relevant ones -
  // those roles rely on OnlineLearningGrid's role-name search below instead.
  const seenUrls = new Set<string>();
  const courses =
    role?.category === "business"
      ? []
      : role?.industries
          .flatMap((industry) => {
            const normalizedIndustry = industry.toLowerCase();
            const courseKey = COURSE_INDUSTRY_ALIASES[normalizedIndustry] ?? normalizedIndustry;

            return (coursesByIndustry[courseKey] ?? []).slice(0, 2).map((course) => ({
              ...course,
              industry,
            }));
          })
          .filter((course) => {
            if (seenUrls.has(course.url)) return false;
            seenUrls.add(course.url);
            return true;
          })
          .slice(0, MAX_COURSES) ?? [];

  return (
    <>
      {role?.category !== "business" && (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">
            Courses & Qualifications<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-6 max-w-2xl">
            A cross-industry learning shortlist for {roleName} - pulled from the sectors where this role shows up.
          </p>

          {courses.length === 0 ? (
            <div className="border border-border p-6">
              <p className="text-muted-foreground font-body text-sm">
                Learning resources for this role are being curated now.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course) => (
                <a
                  key={course.url}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-border p-5 hover:border-primary transition-colors flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <h3 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                        {course.title}
                      </h3>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <p className="text-muted-foreground font-body text-xs leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
                    <span className="text-xs font-display font-600 text-foreground/70">{course.provider}</span>
                    <span className="text-[10px] font-body px-2 py-0.5 border border-border text-muted-foreground">
                      {course.industry}
                    </span>
                    {course.free && (
                      <span className="text-[10px] font-display font-700 uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
                        Free
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}

      <OnlineLearningGrid roleName={roleName} />
    </>
  );
};

export default RoleLearnSection;
