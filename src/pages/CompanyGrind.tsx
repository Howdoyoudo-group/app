import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-grind-cover.jpg";

const data: CompanyCultureData = {
  slug: "grind",
  name: "Grind",
  tagline: "From a single Shoreditch espresso bar to a sustainability-first coffee brand.",
  industry: "Coffee",
  industrySlug: "coffee",
  coverImage,
  website: "https://grind.co.uk",
  careersUrl: "https://grind.co.uk/pages/careers",
  founded: "2011",
  hq: "London",
  employees: "500+",
  sectors: ["Coffee", "Hospitality", "E-Commerce", "Sustainability"],
  glassdoor: 3.7,
  about: [
    "Grind started in 2011 as a single espresso bar and cocktail lounge on Old Street roundabout in Shoreditch. Founded by David Abrahamovitch, it quickly became a fixture of London's specialty coffee scene - known for great coffee, late-night cocktails, and slick design.",
    "Today, Grind operates multiple cafés across London, roasts its own coffee, and runs a fast-growing direct-to-consumer business selling compostable Nespresso-compatible pods. The pods - which are fully home-compostable - have become Grind's biggest revenue driver.",
    "Sustainability sits at the core of the business. Grind was the UK's first coffee brand to achieve certified carbon-neutral status, and the company has planted over a million trees through its partnership with the Eden Reforestation Project.",
    "The business model blends hospitality, e-commerce, and brand partnerships - making Grind one of the most interesting hybrid businesses in the UK food & drink space.",
  ],
  whyWorkHere: [
    { title: "Design-led brand", description: "Grind's aesthetic is instantly recognisable - from the pink branding to the beautifully designed cafés. If you care about how things look and feel, you'll fit in." },
    { title: "Sustainability is the business model", description: "Compostable pods, carbon neutrality, tree planting - sustainability isn't a side project at Grind; it's what drives product development and growth." },
    { title: "Hospitality + DTC hybrid", description: "You could be pulling espresso shots in Soho or optimising subscription funnels. Grind offers exposure to both physical and digital commerce." },
    { title: "London-centric, founder-led", description: "David Abrahamovitch is still closely involved. The company has a startup energy with the brand equity of an established player." },
  ],
  values: [
    { emoji: "♻️", title: "Sustainability first", description: "Every business decision is filtered through environmental impact. Grind aims to prove that doing good and doing well aren't mutually exclusive." },
    { emoji: "☕", title: "Quality without compromise", description: "From bean sourcing to extraction, Grind is obsessive about coffee quality. The same standard applies to food, cocktails, and packaging." },
    { emoji: "🎨", title: "Design matters", description: "Grind treats design as a core competency. Brand, interiors, packaging, and digital experience are all crafted with equal care." },
    { emoji: "🚀", title: "Move fast, stay scrappy", description: "Despite its brand polish, Grind operates with startup speed. Teams are small, decisions are fast, and everyone wears multiple hats." },
  ],
  perks: ["Free coffee & staff discount", "Flexible scheduling", "Tips pooled fairly", "Pension scheme", "Cycle to work scheme", "Mental health support", "Career progression across sites", "Staff events and tastings", "Sustainable commute incentives", "Product samples"],
  popularRoles: ["Barista", "Café Manager", "E-Commerce Manager", "Brand Designer", "Head Roaster", "Operations Manager", "Marketing Manager", "Subscription Growth Lead"],
};

const CompanyGrind = () => <CompanyCultureProfile data={data} />;
export default CompanyGrind;
