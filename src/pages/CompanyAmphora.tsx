import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-amphora-cover.jpg";

const amphoraData: CompanyCultureData = {
  slug: "amphora",
  name: "Amphora",
  tagline: "Workwear and everyday essentials, built for the people who wear them.",
  industry: "Fashion",
  industrySlug: "fashion",
  coverImage,
  website: "https://amphoraclothing.com",
  careersUrl: "https://amphoraclothing.com",
  founded: "2022",
  hq: "London, UK",
  employees: "Small, founder-led team",
  sectors: ["Workwear", "D2C Retail", "E-Commerce", "Sportswear"],
  about: [
    "Amphora is a London clothing brand founded in 2022, selling work-wear jackets, custom jeans, caps and everyday essentials direct to customers online, with international shipping reaching customers in over 190 countries.",
    "Alongside the core clothing line, the brand runs Amphora Sports, a dedicated offshoot for sport-focused apparel.",
    "This is Amphora's first time hiring beyond its founding team - joining now means getting in early on a growing brand and helping shape how it runs as it scales.",
  ],
  whyWorkHere: [
    {
      title: "Ground floor of a growing brand",
      description:
        "Amphora is hiring for the first time. Early hires get real influence over how the brand and its processes take shape, not a seat in an already-set structure.",
    },
    {
      title: "Direct-to-consumer, globally",
      description:
        "Selling direct to customers in 190+ countries means every role has a direct line to real customers and real sales - no layers between the work and its impact.",
    },
    {
      title: "Small team, close to the founders",
      description:
        "As a small, founder-led operation, you'll work closely with the people who built the brand, not through several layers of management.",
    },
  ],
  values: [
    {
      emoji: "🧵",
      title: "Built for wear",
      description:
        "From work-wear jackets to custom jeans, the product range is designed around function first - clothes made to actually be worn and used.",
    },
    {
      emoji: "🌍",
      title: "Global from day one",
      description:
        "Amphora ships to customers in over 190 countries, a genuinely international operation despite its small size.",
    },
  ],
  perks: [
    "Real ownership from your first day",
    "Direct access to the founders",
    "The flexibility of an early-stage team",
    "A say in how the brand grows",
  ],
  popularRoles: [
    "E-Commerce Assistant",
    "Customer Service Advisor",
    "Warehouse & Fulfilment",
    "Social Media & Marketing",
    "Product & Design",
  ],
};

const CompanyAmphora = () => <CompanyCultureProfile data={amphoraData} />;

export default CompanyAmphora;
