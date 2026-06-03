import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-drmartens-cover.jpg";

const drMartensData: CompanyCultureData = {
  slug: "dr-martens",
  name: "Dr. Martens",
  tagline: "Rebellious self-expression, one boot at a time - since 1960.",
  industry: "Footwear",
  industrySlug: "footwear",
  coverImage,
  videoUrl: "https://www.youtube.com/embed/CerohhfcTVY",
  website: "https://www.drmartens.com",
  careersUrl: "https://jobs.drmartens.com/",
  founded: "1960",
  hq: "London, UK (heritage: Wollaston, Northamptonshire)",
  employees: "3,000+",
  sectors: ["Footwear", "Fashion", "Retail", "DTC"],
  glassdoor: 3.5,
  about: [
    "Dr. Martens began in 1960 when the Griggs family licensed a revolutionary air-cushioned sole designed by Dr. Klaus Märtens. The first boot - the 1460 - rolled off the production line on 1 April 1960, and became a symbol of working-class durability.",
    "Within a decade, the boots had been adopted by skinheads, punks, goths, Britpop fans, and anyone who valued authenticity over trends. From Pete Townshend to Agyness Deyn, Docs became cultural armour.",
    "Today, Dr. Martens is a publicly listed company (LSE: DOCS) with annual revenues exceeding £800 million. The business operates a direct-to-consumer model through its own stores and website, alongside wholesale partnerships globally.",
    "While the iconic 1460 and 1461 remain bestsellers, the brand has expanded into sandals, platforms, and collaborations with designers like Comme des Garçons, Rick Owens, and A Bathing Ape. The Cobbs Lane factory in Northamptonshire still produces the 'Made in England' range.",
  ],
  whyWorkHere: [
    {
      title: "A brand people genuinely love",
      description:
        "Dr. Martens has true cultural equity. Working here means being part of a brand that people tattoo on their skin - not just wear on their feet.",
    },
    {
      title: "Heritage meets modern commerce",
      description:
        "You'll work at the intersection of a 60-year manufacturing legacy and a fast-moving DTC retail business. It's craft and data, tradition and innovation.",
    },
    {
      title: "Global reach, London HQ",
      description:
        "The company operates in over 60 countries with offices in Portland, Hong Kong, and across Europe - but the heart of the brand beats from Camden.",
    },
    {
      title: "Subculture runs deep",
      description:
        "This isn't a brand that borrows from culture - it's part of it. Internal teams champion music, art, and self-expression in everything they do.",
    },
  ],
  values: [
    {
      emoji: "🥾",
      title: "Built to last",
      description:
        "Every pair is made to endure. Dr. Martens stands for durability in product and purpose - no throwaway fashion, no planned obsolescence.",
    },
    {
      emoji: "🎸",
      title: "Rebellious spirit",
      description:
        "The brand was born from counterculture. Teams are encouraged to challenge convention, speak up, and bring bold ideas - conformity isn't the culture here.",
    },
    {
      emoji: "🌍",
      title: "Responsible sourcing",
      description:
        "The company is committed to improving its supply chain, reducing emissions, and using more sustainable materials - including its new vegan range.",
    },
    {
      emoji: "🤝",
      title: "Community & belonging",
      description:
        "Dr. Martens has always been for outsiders. The internal culture mirrors that - inclusive, diverse, and deliberately anti-corporate.",
    },
  ],
  perks: [
    "65% staff discount on products",
    "Hybrid working (3 days office / 2 remote)",
    "Private medical & dental insurance",
    "Enhanced parental leave",
    "Annual bonus scheme",
    "Free Dr. Martens boots on joining",
    "Season ticket loan",
    "Volunteer days",
    "Mental health support & EAP",
    "Cycle to work scheme",
  ],
  popularRoles: [
    "Footwear Designer",
    "Product Developer",
    "E-Commerce Manager",
    "Retail Store Manager",
    "Supply Chain Planner",
    "Brand Marketing Manager",
    "Merchandiser",
    "Sustainability Analyst",
  ],
};

const CompanyDrMartens = () => <CompanyCultureProfile data={drMartensData} />;

export default CompanyDrMartens;
