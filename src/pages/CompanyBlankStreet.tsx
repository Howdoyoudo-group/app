import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-blank-street-cover.jpg";

const data: CompanyCultureData = {
  slug: "blank-street",
  name: "Blank Street",
  tagline: "The venture-backed micro-café rethinking how specialty coffee scales in cities.",
  industry: "Coffee",
  industrySlug: "coffee",
  coverImage,
  website: "https://www.blankstreet.com",
  careersUrl: "https://www.blankstreet.com/careers",
  founded: "2020",
  hq: "New York / London",
  employees: "500+",
  sectors: ["Coffee", "Technology", "Hospitality", "Venture-Backed"],
  glassdoor: 3.8,
  about: [
    "Blank Street launched in 2020 in Brooklyn, New York, founded by Vinay Menda and Issam Freiha. The idea was simple but radical: use compact, tech-enabled formats to offer specialty-quality coffee at mainstream prices.",
    "The company operates micro-cafés and kiosks - typically 200–400 sq ft - equipped with automated espresso machines that reduce labour costs and ensure drink consistency. This allows Blank Street to undercut traditional specialty coffee pricing by 20–30%.",
    "Backed by over $120 million in venture funding from investors including Tiger Global and General Catalyst, Blank Street expanded aggressively into London, opening dozens of locations across central and east London within 18 months.",
    "The model sits at the intersection of hospitality and tech. Blank Street uses data to optimise site selection, staffing, and product mix - treating each kiosk as a node in a network rather than a standalone café.",
  ],
  whyWorkHere: [
    { title: "Startup energy, real scale", description: "Blank Street has the pace and culture of a startup, but with significant funding and rapid expansion. You'll grow as the company grows." },
    { title: "Tech meets hospitality", description: "Data-driven operations, automated equipment, and app-first ordering mean you'll work at the intersection of coffee and technology." },
    { title: "Small-format innovation", description: "The micro-café model is genuinely new. You'll be part of proving whether this format can reshape urban coffee culture." },
    { title: "Cross-market exposure", description: "Operating across New York and London, Blank Street offers exposure to two of the world's most competitive coffee markets." },
  ],
  values: [
    { emoji: "⚡", title: "Move fast", description: "Blank Street opens new locations at startup speed. The team ships, iterates, and adapts constantly." },
    { emoji: "📊", title: "Data-informed", description: "Every decision - from site selection to menu design - is backed by data. Intuition plus evidence." },
    { emoji: "♻️", title: "Efficient by design", description: "Small footprints, less waste, lower energy use. The micro-café model is inherently more sustainable than traditional formats." },
    { emoji: "🎯", title: "Accessible quality", description: "The mission is to make specialty coffee affordable and convenient without compromising on taste." },
  ],
  perks: ["Competitive pay", "Free drinks on shift", "Flexible scheduling", "Equity options for key roles", "Rapid career progression", "Cross-city transfer opportunities", "Mental health support", "Team socials", "Product input - your ideas matter", "Training on automated and manual equipment"],
  popularRoles: ["Barista", "Shift Lead", "Area Manager", "Operations Manager", "Growth & Expansion Lead", "Data Analyst", "Marketing Manager", "Site Acquisition Manager"],
};

const CompanyBlankStreet = () => <CompanyCultureProfile data={data} />;
export default CompanyBlankStreet;
