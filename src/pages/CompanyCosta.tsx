import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-costa-cover.jpg";

const data: CompanyCultureData = {
  slug: "costa",
  name: "Costa Coffee",
  tagline: "The UK's favourite coffee shop - from a single London roastery to a global brand owned by Coca-Cola.",
  industry: "Coffee",
  industrySlug: "coffee",
  coverImage,
  website: "https://www.costa.co.uk",
  careersUrl: "https://www.costa.co.uk/careers",
  founded: "1971",
  hq: "Dunstable",
  employees: "14,000+",
  sectors: ["Coffee", "Hospitality", "FMCG", "Retail"],
  glassdoor: 3.5,
  about: [
    "Costa Coffee was founded in 1971 by Italian brothers Sergio and Bruno Costa, who started by supplying roasted coffee to local caterers and Italian coffee shops from a roastery in Lambeth, London. The first Costa Coffee shop opened in 1978 in Vauxhall Bridge Road.",
    "In 2019, The Coca-Cola Company acquired Costa from Whitbread for £3.9 billion - one of the largest deals in the UK food and drink sector. The acquisition gave Costa access to Coca-Cola's global distribution network, accelerating its expansion into ready-to-drink products and international markets.",
    "Today, Costa operates over 2,700 stores across the UK, plus thousands of Costa Express self-serve machines in petrol stations, supermarkets, and offices. Their Basildon roastery is one of Europe's largest, processing over 11,000 tonnes of coffee beans annually.",
    "Costa's vertically integrated model - owning the roastery, retail stores, self-serve machines, and at-home products - makes it a uniquely scaled coffee business in the UK market.",
  ],
  whyWorkHere: [
    { title: "Scale and structure", description: "With thousands of stores and a corporate parent like Coca-Cola, Costa offers structured career paths, training programmes, and clear progression routes." },
    { title: "Barista training academy", description: "Costa runs one of the most comprehensive barista training programmes in the UK, with certified courses that are recognised industry-wide." },
    { title: "Drive-through and Express growth", description: "Costa is rapidly expanding its drive-through and Express machine formats, creating new operational and tech-focused roles." },
    { title: "Global parent, local feel", description: "Despite Coca-Cola ownership, individual stores retain a neighbourhood café culture. You get big-company benefits with small-team energy." },
  ],
  values: [
    { emoji: "☕", title: "Coffee at the core", description: "Costa's Mocha Italia blend has been the foundation since 1971. Quality and consistency across thousands of locations is the daily mission." },
    { emoji: "🌍", title: "Sustainability commitments", description: "Costa has pledged to make all cups 100% recyclable and is working towards net zero across its operations." },
    { emoji: "🤝", title: "Community focus", description: "The Costa Foundation has funded education projects around the world, building schools in coffee-growing communities." },
    { emoji: "📈", title: "Growth mindset", description: "Under Coca-Cola, Costa is expanding into new formats, new markets, and new product lines at pace." },
  ],
  perks: ["Free drinks on shift", "50% staff discount", "Pension scheme", "28 days holiday", "Barista training & certification", "Employee assistance programme", "Cycle to work scheme", "Career progression pathways", "Flexible shifts", "Costa Foundation volunteering days"],
  popularRoles: ["Barista", "Shift Supervisor", "Store Manager", "Area Manager", "Roastery Technician", "Marketing Manager", "Supply Chain Analyst", "Express Operations Manager"],
};

const CompanyCosta = () => <CompanyCultureProfile data={data} />;
export default CompanyCosta;
