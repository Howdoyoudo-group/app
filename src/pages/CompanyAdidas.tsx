import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-adidas-cover.jpg";

const adidasData: CompanyCultureData = {
  slug: "adidas",
  name: "Adidas",
  tagline: "Through sport, we have the power to change lives - and the careers behind the brand prove it.",
  industry: "Footwear",
  industrySlug: "footwear",
  coverImage,
  website: "https://www.adidas.co.uk",
  careersUrl: "https://careers.adidas-group.com/",
  founded: "1949",
  hq: "Herzogenaurach, Germany",
  employees: "59,000+",
  sectors: ["Footwear", "Apparel", "Accessories", "Retail", "E-Commerce"],
  glassdoor: 4.0,
  trustpilot: 1.7,
  about: [
    "Adidas was founded in 1949 by Adi Dassler in the small Bavarian town of Herzogenaurach, Germany. The name itself is a portmanteau of his nickname and surname. What started as a one-man cobbler operation has grown into the second-largest sportswear company in the world, generating over €22 billion in annual revenue.",
    "The brand's influence spans elite sport and street culture in equal measure. From Jesse Owens at the 1936 Olympics to the Yeezy phenomenon, Adidas has shaped how the world thinks about athletic footwear - and what people wear off the pitch.",
    "Today, Adidas operates through three key pillars: Performance (sport-specific gear), Originals (lifestyle and heritage), and Terrex (outdoor). The company also owns a significant stake in the running market through its BOOST and LIGHTSTRIKE technologies.",
    "Under CEO Bjørn Gulden, Adidas is undergoing a cultural reset - returning to its sporting roots while maintaining its credibility in fashion collaborations with the likes of Wales Bonner, Bad Bunny, and Pharrell Williams.",
  ],
  whyWorkHere: [
    {
      title: "Sport-first culture, every day",
      description:
        "Employees get time during the workday to train. The Herzogenaurach campus has pitches, gyms, and running tracks - sport isn't a perk, it's the operating system.",
    },
    {
      title: "Creativity meets commerce",
      description:
        "Adidas blends high-fashion collaborations (Prada, Gucci, Wales Bonner) with mass-market performance - giving teams the chance to work across both worlds.",
    },
    {
      title: "Genuinely global, genuinely diverse",
      description:
        "With offices in Portland, Shanghai, London, Dubai, and beyond, Adidas teams are deeply international. Over 100 nationalities work at HQ alone.",
    },
    {
      title: "A turnaround story you can shape",
      description:
        "Adidas is in a pivotal chapter - new leadership, renewed focus on sport, and a rebuilding year. Joining now means real influence over the brand's next era.",
    },
  ],
  values: [
    {
      emoji: "⚽",
      title: "Sport is everything",
      description:
        "Adidas exists to serve athletes. Every innovation - from Predator boots to 4DFWD soles - starts with making sport better, faster, more accessible.",
    },
    {
      emoji: "🤝",
      title: "Better together",
      description:
        "Collaboration is baked in. From co-creation with athletes like Lionel Messi to cross-functional product teams, the culture rewards collective wins.",
    },
    {
      emoji: "🌍",
      title: "End plastic waste",
      description:
        "Adidas partnered with Parley for the Oceans to create shoes from recycled ocean plastic. Sustainability isn't a side project - it's woven into the product roadmap.",
    },
    {
      emoji: "💡",
      title: "Impossible is nothing",
      description:
        "The brand's iconic tagline reflects its internal mindset. Teams are encouraged to challenge convention, prototype fast, and learn from what doesn't work.",
    },
  ],
  perks: [
    "Generous product discounts",
    "On-campus sports facilities",
    "Flexible working hours",
    "Annual performance bonus",
    "Employee stock purchase plan",
    "Subsidised canteen",
    "Relocation support",
    "Mental health resources",
    "Parental leave",
    "Learning & development budget",
  ],
  popularRoles: [
    "Footwear Designer",
    "Product Manager",
    "Retail Store Manager",
    "Supply Chain Planner",
    "Digital Marketing Manager",
    "Data Analyst",
    "Sustainability Specialist",
    "E-Commerce Merchandiser",
  ],
};

const CompanyAdidas = () => <CompanyCultureProfile data={adidasData} />;

export default CompanyAdidas;
