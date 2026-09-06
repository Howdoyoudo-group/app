// Shared between the profile editor's pin/unpin toggles (MyProfile.tsx) and
// the public profile page (PublicProfile.tsx) - one source of truth for
// which sections exist and what a hidden section defaults to.
export const SECTION_LABELS: Record<string, string> = {
  riasec: "How you're wired (RIASEC)",
  values: "What you want from work",
  loves: "Things I'm obsessed with",
  qa: "Things you don't know about me",
  family: "Family & pets",
  skills: "What I love doing",
  industries: "Industries I follow",
  story: "Your story",
  prompts: "In your words",
  hitlist: "Most wanted",
  employment: "Where I've worked",
  education: "Education",
  qualifications: "Qualifications, Awards, Prizes",
  video: "Intro video",
  about: "About you, by us",
  roles: "Top role matches",
};

export const SECTION_KEYS = Object.keys(SECTION_LABELS);

/** A section with no explicit entry defaults to visible (matches the
 * editor's default-all-true state), so older saved profiles that predate a
 * given key still show everything until the user actively hides something. */
export const isSectionVisible = (visibleSections: Record<string, boolean> | null | undefined, key: string): boolean =>
  !visibleSections || visibleSections[key] !== false;
