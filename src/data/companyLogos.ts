// Maps company slugs to their logo/cover image paths
// Used in the Companies directory to display company imagery

export const COMPANY_LOGOS: Record<string, string> = {
  "asos": new URL("../assets/company-asos-cover.jpg", import.meta.url).href,
  "birkenstock": new URL("../assets/company-birkenstock-cover.jpg", import.meta.url).href,
  "blank-street": new URL("../assets/company-blank-street-cover.jpg", import.meta.url).href,
  "caffe-nero": new URL("../assets/company-caffe-nero-cover.jpg", import.meta.url).href,
  "five-guys": new URL("../assets/company-five-guys-cover.jpg", import.meta.url).href,
  "greggs": new URL("../assets/company-greggs-cover.jpg", import.meta.url).href,
  "grind": new URL("../assets/company-grind-cover.jpg", import.meta.url).href,
  "hawkstone": new URL("../assets/company-hawkstone-cover.jpg", import.meta.url).href,
  "me-em": new URL("../assets/company-meem-cover.jpg", import.meta.url).href,
  "netflix": new URL("../assets/company-netflix-cover.jpg", import.meta.url).href,
  "news-uk": new URL("../assets/company-news-uk-cover.jpg", import.meta.url).href,
  "rightmove": new URL("../assets/company-rightmove-cover.jpg", import.meta.url).href,
  "savills": new URL("../assets/company-savills-cover.jpg", import.meta.url).href,
  "sky-sports": new URL("../assets/company-skysports-cover.jpg", import.meta.url).href,
  "soho-house": new URL("../assets/company-sohohouse-cover.jpg", import.meta.url).href,
  "starbucks": new URL("../assets/company-starbucks-cover.jpg", import.meta.url).href,
  "teach-first": new URL("../assets/company-teachfirst-cover.jpg", import.meta.url).href,
  "tesco": new URL("../assets/company-tesco-cover.jpg", import.meta.url).href,
  "timberland": new URL("../assets/company-timberland-cover.jpg", import.meta.url).href,
  "tom-dixon": new URL("../assets/company-tomdixon-cover.jpg", import.meta.url).href,
};

export function getCompanyLogo(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  return COMPANY_LOGOS[slug.toLowerCase()];
}
