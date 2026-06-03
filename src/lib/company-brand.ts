// Lightweight brand-colour lookup for the Marketplace EmployerSpotlight card.
// Returns a primary brand colour (hex) per company, plus a contrasting text
// colour to use on top of it. Used to give the spotlight box a distinct,
// brand-aligned look without pulling in a full design system per company.

export type CompanyBrand = {
  bg: string;        // brand background (hex)
  fg: string;        // foreground/text on brand bg
  accent?: string;   // optional secondary/accent
};

const BRANDS: Record<string, CompanyBrand> = {
  "me-em":          { bg: "#1B1B1B", fg: "#FFFFFF", accent: "#E8D9C4" },
  "burberry":       { bg: "#A47A4C", fg: "#FFFFFF", accent: "#000000" },
  "soho-house":     { bg: "#7A0019", fg: "#F4E9D8", accent: "#F4E9D8" },
  "greggs":         { bg: "#003B71", fg: "#FFE600", accent: "#FFE600" },
  "tesco":          { bg: "#00539F", fg: "#FFFFFF", accent: "#EE1C2E" },
  "netflix":        { bg: "#000000", fg: "#FFFFFF", accent: "#E50914" },
  "nike":           { bg: "#000000", fg: "#FFFFFF", accent: "#FA5400" },
  "adidas":         { bg: "#000000", fg: "#FFFFFF" },
  "dr-martens":     { bg: "#000000", fg: "#FFE600", accent: "#FFE600" },
  "birkenstock":    { bg: "#1F4434", fg: "#F5EFE6" },
  "timberland":     { bg: "#1F3D2B", fg: "#F5EAA8", accent: "#F5EAA8" },
  "ugg":            { bg: "#3E2A1F", fg: "#F4E6D2" },
  "asos":           { bg: "#000000", fg: "#FFFFFF" },
  "premier-league": { bg: "#3D195B", fg: "#FFFFFF", accent: "#04F5FF" },
  "sky-sports":     { bg: "#0072C6", fg: "#FFFFFF", accent: "#F4D03F" },
  "blank-street":   { bg: "#1F4D3D", fg: "#E8E0CF" },
  "grind":          { bg: "#000000", fg: "#F25C66", accent: "#F25C66" },
  "gails":          { bg: "#7B1F2B", fg: "#F4E9D8" },
  "costa":          { bg: "#6E1F2F", fg: "#FFFFFF" },
  "starbucks":      { bg: "#00754A", fg: "#FFFFFF" },
  "caffe-nero":     { bg: "#0C2340", fg: "#FFFFFF", accent: "#C9A227" },
  "five-guys":      { bg: "#ED1C24", fg: "#FFFFFF" },
  "dice":           { bg: "#000000", fg: "#FFFFFF", accent: "#FF6680" },
  "everyman":       { bg: "#8B0000", fg: "#F4E9D8" },
  "savills":        { bg: "#0033A0", fg: "#FFFFFF" },
  "rightmove":      { bg: "#00DEB6", fg: "#0B1A2A", accent: "#0B1A2A" },
  "purplebricks":   { bg: "#4B0082", fg: "#FFFFFF" },
  "ocado-group":    { bg: "#6E1F7A", fg: "#FFFFFF" },
  "ocado-retail":   { bg: "#6E1F7A", fg: "#FFFFFF" },
  "ocado-logistics":{ bg: "#6E1F7A", fg: "#FFFFFF" },
  "save-the-children": { bg: "#E2231A", fg: "#FFFFFF" },
  "teach-first":    { bg: "#003E7E", fg: "#FFFFFF" },
  "tom-dixon":      { bg: "#111111", fg: "#D4AF37", accent: "#D4AF37" },
  "hawkstone":      { bg: "#1B2A1F", fg: "#E6CFA1", accent: "#E6CFA1" },
  "pragnell":       { bg: "#0B1A2A", fg: "#D4AF37", accent: "#D4AF37" },
  "news-uk":        { bg: "#0A0A0A", fg: "#FFFFFF", accent: "#E03131" },
};

const DEFAULT_BRAND: CompanyBrand = {
  bg: "#0F172A",
  fg: "#FFFFFF",
  accent: "hsl(120 100% 45%)",
};

export function getCompanyBrand(slug: string | null | undefined): CompanyBrand {
  if (!slug) return DEFAULT_BRAND;
  return BRANDS[slug.toLowerCase()] ?? DEFAULT_BRAND;
}
