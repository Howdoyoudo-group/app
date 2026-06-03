import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-ugg-cover.jpg";

const uggData: CompanyCultureData = {
  slug: "ugg",
  name: "UGG",
  tagline: "From surf culture to global comfort icon - warmth runs through everything.",
  industry: "Footwear",
  industrySlug: "footwear",
  coverImage,
  website: "https://www.ugg.com",
  careersUrl: "https://www.deckers.com/careers",
  founded: "1978",
  hq: "Goleta, California",
  employees: "4,500+ (Deckers Brands)",
  sectors: ["Footwear", "Lifestyle", "Retail", "DTC"],
  glassdoor: 3.7,
  about: [
    "UGG was founded in 1978 by Australian surfer Brian Smith, who brought sheepskin boots to the California coast. What started as post-surf warming gear became one of the most recognisable comfort brands in the world.",
    "The Classic Boot - with its twin-face sheepskin and plush wool lining - sparked a cultural phenomenon in the early 2000s. Celebrities from Oprah to Tom Brady adopted UGGs, and the brand became synonymous with casual luxury.",
    "Today, UGG is owned by Deckers Brands (alongside HOKA and Teva) and generates over $2 billion in annual revenue. The product line has expanded well beyond boots into slippers, sneakers, ready-to-wear, and home goods.",
    "UGG's recent trajectory has been remarkable - collaborations with brands like Gallery Dept, Telfar, and Madhappy have repositioned UGG as a fashion-forward brand while retaining its core comfort identity. The Tasman slipper became one of the most viral shoes of 2023.",
  ],
  whyWorkHere: [
    {
      title: "California lifestyle, global business",
      description:
        "UGG's HQ sits on the Goleta coast near Santa Barbara. The culture is relaxed and creative - but the commercial operation spans 130+ countries.",
    },
    {
      title: "Part of the Deckers Brands portfolio",
      description:
        "Deckers also owns HOKA (the fastest-growing running brand globally) and Teva. Working here gives you access to a multi-brand ecosystem with shared resources and mobility.",
    },
    {
      title: "A comfort brand in a hype-driven world",
      description:
        "UGG's ability to stay relevant through cultural collaborations while keeping comfort at the centre is rare. You'll work on a brand that balances heritage with reinvention.",
    },
    {
      title: "Strong DTC focus",
      description:
        "UGG has invested heavily in direct-to-consumer through its own stores, website, and app. Digital, data, and consumer experience roles are central to the growth strategy.",
    },
  ],
  values: [
    {
      emoji: "☀️",
      title: "Feel good",
      description:
        "UGG exists to make people feel good - physically and emotionally. Comfort isn't just a product attribute; it's the brand's reason for being.",
    },
    {
      emoji: "🏄",
      title: "California spirit",
      description:
        "Laid-back doesn't mean lazy. UGG's culture reflects its surf-town origins - creative, optimistic, and unafraid to do things differently.",
    },
    {
      emoji: "🔥",
      title: "Cultural relevance",
      description:
        "From Telfar to TikTok, UGG actively partners with culture-shaping creators and communities. Staying relevant requires curiosity, speed, and taste.",
    },
    {
      emoji: "🐑",
      title: "Responsible sourcing",
      description:
        "UGG is committed to responsibly sourced sheepskin and has introduced plant-based and recycled alternatives across its range. Animal welfare is taken seriously.",
    },
  ],
  perks: [
    "Generous product discounts (UGG, HOKA, Teva)",
    "Hybrid working model",
    "Annual wellness reimbursement",
    "401(k) with company match",
    "Paid volunteer time",
    "Employee stock purchase plan",
    "On-site fitness centre (HQ)",
    "Summer Fridays",
    "Parental leave",
    "Pet-friendly offices",
  ],
  popularRoles: [
    "Footwear Designer",
    "E-Commerce Manager",
    "Brand Marketing Coordinator",
    "Visual Merchandiser",
    "Supply Chain Analyst",
    "Retail Store Manager",
    "Product Developer",
    "Consumer Insights Analyst",
  ],
};

const CompanyUgg = () => <CompanyCultureProfile data={uggData} />;

export default CompanyUgg;
