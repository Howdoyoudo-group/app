import { INDUSTRY_ICONS } from "@/data/industryIcons";

const SLUG_TO_DISPLAY: Record<string, string> = {
  cinema: "Film and TV",
  hospitality: "Hospitality",
  "estate-agency": "Estate Agency",
  "horse-racing": "Horse Racing",
  "interior-design": "Interior Design",
  "formula-1": "Formula 1",
};

/** Resolve a slug like "football" to its series doodle image */
export const getIndustryImage = (slug: string): string | undefined => {
  // Try direct display name
  const display = SLUG_TO_DISPLAY[slug] ||
    slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return INDUSTRY_ICONS[display];
};
