import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-burberry-cover.jpg";

const data: CompanyCultureData = {
  slug: "burberry",
  name: "Burberry",
  tagline: "160 years of British luxury - from the trenches to the runway.",
  industry: "Fashion",
  industrySlug: "fashion",
  coverImage,
  website: "https://www.burberryplc.com",
  careersUrl: "https://burberrycareers.com/",
  founded: "1856",
  hq: "London",
  employees: "9,000+",
  sectors: ["Luxury Fashion", "Retail", "DTC", "Accessories"],
  glassdoor: 3.9,
  about: [
    "Burberry was founded in 1856 by 21-year-old Thomas Burberry in Basingstoke, Hampshire. He invented gabardine - a breathable, waterproof fabric - and the brand's outerwear was worn by polar explorers, military officers, and aviators before becoming a luxury fashion icon.",
    "The trench coat and the Burberry check are two of the most recognisable symbols in fashion. But the brand's journey hasn't been linear - from ubiquity in the 1990s to 'chav culture' associations, Burberry has reinvented itself multiple times.",
    "Today, Burberry is listed on the FTSE 100 with annual revenues exceeding £3 billion. The business spans ready-to-wear, accessories, beauty, and fragrance, with a global store network and a strong digital presence.",
    "Under creative director Daniel Lee (from 2022), Burberry is repositioning firmly in the luxury tier - tightening distribution, elevating product, and investing in its British heritage as a point of differentiation against French and Italian luxury houses.",
  ],
  whyWorkHere: [
    { title: "Iconic British luxury house", description: "Burberry is one of the few truly global British luxury brands. Working here means contributing to a 160-year creative legacy." },
    { title: "Creative meets commercial", description: "The tension between art and commerce is real at Burberry. Every season balances creative vision with commercial reality - it's endlessly interesting." },
    { title: "Digital pioneer in luxury", description: "Burberry was one of the first luxury brands to embrace digital - livestreaming shows, social commerce, and data-driven personalisation." },
    { title: "London HQ, global reach", description: "Headquartered in the Horseferry Road campus, Burberry operates in 30+ countries with manufacturing in Yorkshire and Italy." },
  ],
  values: [
    { emoji: "🧥", title: "Creativity is everything", description: "Burberry exists because of invention - gabardine, the trench, the check. The culture celebrates creative thinking across every function." },
    { emoji: "🇬🇧", title: "Proudly British", description: "British heritage is Burberry's competitive advantage. The brand leans into its identity - from Yorkshire manufacturing to London fashion week." },
    { emoji: "🌿", title: "Responsible luxury", description: "Burberry has committed to becoming climate positive by 2040. Sustainability programmes span materials, supply chain, and circular fashion." },
    { emoji: "✨", title: "Luxury standards", description: "Every touchpoint - from product quality to retail experience - must meet luxury standards. Excellence is the baseline." },
  ],
  perks: ["Generous staff discount", "Private medical & dental", "Pension scheme", "Annual bonus scheme", "Life assurance", "Enhanced parental leave", "Hybrid working", "Season ticket loan", "Wellbeing programmes", "Professional development"],
  popularRoles: ["Fashion Designer", "Merchandiser", "Retail Manager", "Visual Merchandiser", "Digital Marketing Manager", "Supply Chain Planner", "Buyer", "Brand Communications Manager"],
};

const CompanyBurberry = () => <CompanyCultureProfile data={data} />;
export default CompanyBurberry;
