// Industry adjacency map for the discovery engine.
//
// Each entry lists industries a fan of the key industry plausibly hasn't
// considered but often loves — same crowd, same culture, overlapping
// employers or skills. Used to source "you might love this" discovery cards
// ("you like Football + Marketing → here's a Formula 1 marketing job").
//
// Slugs must match jobs.industry values (see src/data/industries.ts).
// Deliberately curated and asymmetric: football fans often love F1;
// F1 fans are narrower, so its list is shorter.

export const INDUSTRY_ADJACENCY: Record<string, string[]> = {
  football: ["tennis", "formula-1", "horse-racing", "beer", "gaming"],
  tennis: ["football", "formula-1", "wellness", "fashion"],
  "formula-1": ["cars", "football", "gaming"],
  "horse-racing": ["farming", "pets", "football"],
  gaming: ["cinema", "music", "football", "influencing"],

  fashion: ["footwear", "jewellery", "beauty", "interior-design", "influencing"],
  footwear: ["fashion", "cars"],
  jewellery: ["fashion", "beauty"],
  beauty: ["fashion", "wellness", "influencing"],
  "interior-design": ["fashion", "estate-agency", "building"],

  coffee: ["bakery", "hospitality", "beer", "grocery"],
  bakery: ["coffee", "hospitality", "grocery"],
  beer: ["coffee", "hospitality", "football", "grocery"],
  hospitality: ["coffee", "bakery", "beer", "travel", "grocery"],
  grocery: ["hospitality", "farming", "delivery"],

  cinema: ["gaming", "music", "journalism", "influencing"],
  music: ["cinema", "gaming", "influencing", "journalism"],
  journalism: ["cinema", "music", "influencing"],
  influencing: ["fashion", "beauty", "gaming", "music", "journalism"],

  farming: ["horse-racing", "pets", "grocery", "building"],
  pets: ["farming", "horse-racing", "charity", "wellness"],
  charity: ["teaching", "health", "wellness", "pets"],

  health: ["wellness", "physiotherapy", "psychotherapy", "charity"],
  wellness: ["health", "physiotherapy", "beauty", "tennis"],
  physiotherapy: ["health", "wellness", "football", "tennis"],
  psychotherapy: ["health", "wellness", "teaching"],
  teaching: ["charity", "psychotherapy", "health"],

  cars: ["formula-1", "footwear", "fixing", "delivery"],
  building: ["fixing", "interior-design", "farming"],
  fixing: ["building", "cars", "delivery"],
  delivery: ["grocery", "fixing", "cars"],

  "estate-agency": ["interior-design", "money", "building"],
  money: ["estate-agency", "travel"],
  travel: ["hospitality", "money", "wellness"],
};

/** Adjacent industries for a set of interest slugs (interests themselves excluded). */
export function getAdjacentIndustries(interestSlugs: string[]): Set<string> {
  const own = new Set(interestSlugs);
  const out = new Set<string>();
  for (const slug of interestSlugs) {
    for (const adj of INDUSTRY_ADJACENCY[slug] ?? []) {
      if (!own.has(adj)) out.add(adj);
    }
  }
  return out;
}
