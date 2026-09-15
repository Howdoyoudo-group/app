// Mirrors the CATEGORY_KEYS order in
// supabase/functions/compute-curiosity-scores/index.ts - one source of
// truth for what each category means and a concrete action that raises it.
// Shown wherever the curiosity score itself is (CuriosityScoreCard,
// SiteHeader/GlobalMobileMenu popovers) so "improve your score" always
// means the same specific things.
export type CuriosityCategoryKey =
  | "browsing"
  | "saves"
  | "tracker"
  | "learning_content"
  | "courses_badges";

export interface CuriosityCategoryInfo {
  key: CuriosityCategoryKey;
  label: string;
  suggestion: string;
  linkTo: string;
  linkLabel: string;
}

export const CURIOSITY_CATEGORIES: CuriosityCategoryInfo[] = [
  {
    key: "browsing",
    label: "Explore the site",
    suggestion: "Browse jobs, industries or company profiles - it all counts.",
    linkTo: "/marketplace",
    linkLabel: "Browse Marketplace",
  },
  {
    key: "saves",
    label: "Save jobs you like",
    suggestion: "Tap the heart on jobs in your Jobs Inbox or the Marketplace.",
    linkTo: "/my-jobs",
    linkLabel: "Go to Jobs Inbox",
  },
  {
    key: "tracker",
    label: "Track an application",
    suggestion: "Add a job to your Job Tracker and move it through the stages.",
    linkTo: "/job-tracker",
    linkLabel: "Open Job Tracker",
  },
  {
    key: "learning_content",
    label: "Save something from your feed",
    suggestion: "Save a briefing, article or video that catches your eye.",
    linkTo: "/feed",
    linkLabel: "Open your feed",
  },
  {
    key: "courses_badges",
    label: "Finish a course or earn a badge",
    suggestion: "Complete a skill course or accreditation quiz.",
    linkTo: "/skills-passport",
    linkLabel: "Open Skills Passport",
  },
];

/** Categories NOT currently contributing to breadth, in a stable suggestion order. */
export function missingCuriosityCategories(active: string[] | null | undefined): CuriosityCategoryInfo[] {
  const activeSet = new Set(active ?? []);
  return CURIOSITY_CATEGORIES.filter((c) => !activeSet.has(c.key));
}
