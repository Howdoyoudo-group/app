// Maps company names (as they appear in job listings) to their internal
// "culture profile" route slug. When a company has a profile, the marketplace
// job card surfaces a "View culture profile" link.

export const COMPANY_PROFILE_SLUGS: Record<string, string> = {
  "ME+EM": "me-em",
  "Me+Em": "me-em",
  "Me+em": "me-em",
  "ME&EM": "me-em",
  "Me&Em": "me-em",
  "Gail's": "gails",
  "Gails": "gails",
  "Gail's Bakery": "gails",
  "Dr. Martens": "dr-martens",
  "Dr Martens": "dr-martens",
  "Nike": "nike",
  "Birkenstock": "birkenstock",
  "Timberland": "timberland",
  "UGG": "ugg",
  "Ugg": "ugg",
  "Ocado": "ocado-group",
  "Ocado Group": "ocado-group",
  "Ocado Retail": "ocado-retail",
  "Ocado Logistics": "ocado-logistics",
  "Greggs": "greggs",
  "Save the Children": "save-the-children",
  "Save The Children": "save-the-children",
  "Netflix": "netflix",
  "Everyman": "everyman",
  "Everyman Cinema": "everyman",
  "Everyman Cinemas": "everyman",
  "Grind": "grind",
  "Savills": "savills",
  "Rightmove": "rightmove",
  "Burberry": "burberry",
  "ASOS": "asos",
  "Asos": "asos",
  "Premier League": "premier-league",
  "The Premier League": "premier-league",
  "Sky Sports": "sky-sports",
  "Tesco": "tesco",
  "Soho House": "soho-house",
  "Soho House & Co": "soho-house",
  "Tom Dixon": "tom-dixon",
  "Tom Dixon Studio": "tom-dixon",
  "DICE": "dice",
  "Dice": "dice",
  "Dice FM": "dice",
  "Teach First": "teach-first",
  "Adidas": "adidas",
  "adidas": "adidas",
  "Purplebricks": "purplebricks",
  "Costa": "costa",
  "Costa Coffee": "costa",
  "Starbucks": "starbucks",
  "Caffè Nero": "caffe-nero",
  "Caffe Nero": "caffe-nero",
  "Blank Street": "blank-street",
  "Blank Street Coffee": "blank-street",
  "Five Guys": "five-guys",
  "Hawkstone": "hawkstone",
  "Pragnell": "pragnell",
  "News UK": "news-uk",
};

/** Returns the internal profile path (e.g. "/company/me-em") if one exists. */
export function getCompanyProfilePath(company: string | null | undefined): string | null {
  if (!company) return null;
  const trimmed = company.trim();
  if (COMPANY_PROFILE_SLUGS[trimmed]) return `/company/${COMPANY_PROFILE_SLUGS[trimmed]}`;

  // Case-insensitive fallback
  const lower = trimmed.toLowerCase();
  for (const [name, slug] of Object.entries(COMPANY_PROFILE_SLUGS)) {
    if (name.toLowerCase() === lower) return `/company/${slug}`;
  }
  return null;
}

export function hasCompanyProfile(company: string | null | undefined): boolean {
  return getCompanyProfilePath(company) !== null;
}

/**
 * Returns the canonical slug for a company name (e.g. "ME+EM" → "me-em").
 * Falls back to a kebab-cased version of the name when no mapped slug exists,
 * so external/Adzuna/Reed jobs still get a consistent identifier for analytics.
 */
export function getCompanySlug(company: string | null | undefined): string | null {
  if (!company) return null;
  const trimmed = company.trim();
  if (!trimmed) return null;
  if (COMPANY_PROFILE_SLUGS[trimmed]) return COMPANY_PROFILE_SLUGS[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [name, slug] of Object.entries(COMPANY_PROFILE_SLUGS)) {
    if (name.toLowerCase() === lower) return slug;
  }
  return lower.replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || null;
}
