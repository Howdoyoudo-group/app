// Maps onboarding passions/interests to existing industry slugs/names.
// Used by the My Jobs algorithm to boost jobs in industries that align
// with the user's stated passions, even if they didn't explicitly pick
// the industry on the "Industries" step.
//
// Industry names MUST match the `industry` column on `jobs` (matched
// case-insensitively in scoreJob).

export const PASSION_INDUSTRY_MAP: Record<string, string[]> = {
  // Sport & fitness
  tennis: ["Wellness", "Football"],
  football: ["Football"],
  golf: ["Football", "Hospitality"],
  running: ["Wellness", "Footwear"],
  cycling: ["Wellness", "Cars"],
  yoga: ["Wellness", "Psychotherapy"],
  swimming: ["Wellness"],
  skiing: ["Travel", "Wellness"],
  surfing: ["Wellness", "Travel"],
  climbing: ["Wellness", "Travel"],
  hiking: ["Travel", "Wellness"],
  sailing: ["Travel"],

  // Music
  music: ["Music"],
  "live gigs": ["Music"],
  djing: ["Music"],
  vinyl: ["Music"],
  guitar: ["Music"],
  piano: ["Music"],

  // Food, drink & hospitality
  cooking: ["Hospitality", "Grocery"],
  baking: ["Bakery", "Hospitality"],
  wine: ["Beer", "Hospitality", "Grocery"],
  "coffee culture": ["Coffee", "Hospitality"],
  restaurants: ["Hospitality"],

  // Travel
  travel: ["Travel", "Hospitality"],

  // Visual & screen
  photography: ["Film and TV", "Fashion", "Journalism"],
  film: ["Film and TV"],
  "tv series": ["Film and TV", "Journalism"],

  // Words
  reading: ["Journalism"],
  writing: ["Journalism"],
  podcasts: ["Music", "Journalism"],

  // Tech & games
  gaming: ["Gaming"],
  tech: ["Gaming"],

  // Creator economy
  "social media": ["Influencing"],
  influencers: ["Influencing"],
  youtube: ["Influencing", "Film and TV"],
  tiktok: ["Influencing"],
  blogging: ["Influencing", "Journalism"],

  // Style & space
  fashion: ["Fashion", "Footwear", "Jewellery"],
  art: ["Film and TV", "Interior Design"],
  design: ["Interior Design", "Fashion"],
  architecture: ["Interior Design"],

  // Stage
  dance: ["Music", "Wellness"],
  theatre: ["Film and TV", "Music"],
  comedy: ["Film and TV", "Music"],

  // Lifestyle
  volunteering: ["Charity"],
  animals: ["Pets"],
  gardening: ["Interior Design"],
  cars: ["Cars"],
  motorbikes: ["Cars"],
  "formula 1": ["Formula 1"],
  f1: ["Formula 1"],
  motorsport: ["Formula 1"],
  "motor racing": ["Formula 1"],
  beauty: ["Beauty"],
};

/**
 * Returns the set of industry names a user's passions map to.
 * Useful for boosting job scores in those industries.
 */
export function getIndustriesFromPassions(passions: string[]): Set<string> {
  const out = new Set<string>();
  for (const p of passions) {
    const key = p.toLowerCase().trim();
    const mapped = PASSION_INDUSTRY_MAP[key];
    if (mapped) mapped.forEach((i) => out.add(i.toLowerCase()));
  }
  return out;
}
