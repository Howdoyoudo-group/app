// Canonical list of all industries on the platform.
// Source of truth - keep alphabetical. Add new industries here and they'll
// automatically flow through Learning, Employers, etc.

export interface Industry {
  name: string;
  slug: string; // url path segment, e.g. "estate-agency"
}

export const INDUSTRIES: Industry[] = [
  { name: "Bakery", slug: "bakery" },
  { name: "Beauty", slug: "beauty" },
  { name: "Beer", slug: "beer" },
  { name: "Books", slug: "books" },
  { name: "Building", slug: "building" },
  { name: "Cars", slug: "cars" },
  { name: "Charity", slug: "charity" },
  { name: "Coffee", slug: "coffee" },
  { name: "Delivery", slug: "delivery" },
  { name: "Estate Agency", slug: "estate-agency" },
  { name: "Farming", slug: "farming" },
  { name: "Fashion", slug: "fashion" },
  { name: "Film and TV", slug: "cinema" },
  { name: "Fixing", slug: "fixing" },
  { name: "Food & Drink", slug: "hospitality" },
  { name: "Football", slug: "football" },
  { name: "Footwear", slug: "footwear" },
  { name: "Formula 1", slug: "formula-1" },
  { name: "Gaming", slug: "gaming" },
  { name: "Grocery", slug: "grocery" },
  { name: "Health", slug: "health" },
  { name: "Horse Racing", slug: "horse-racing" },
  { name: "Influencing", slug: "influencing" },
  { name: "Interior Design", slug: "interior-design" },
  { name: "Jewellery", slug: "jewellery" },
  { name: "Journalism", slug: "journalism" },
  { name: "Money", slug: "money" },
  { name: "Music", slug: "music" },
  { name: "Pets", slug: "pets" },
  { name: "Physiotherapy", slug: "physiotherapy" },
  { name: "Politics", slug: "politics" },
  { name: "Psychotherapy", slug: "psychotherapy" },
  { name: "Teaching", slug: "teaching" },
  { name: "Tennis", slug: "tennis" },
  { name: "Theatre", slug: "theatre" },
  { name: "Travel", slug: "travel" },
  { name: "Wellness", slug: "wellness" },
];

export const INDUSTRY_COUNT = INDUSTRIES.length;
