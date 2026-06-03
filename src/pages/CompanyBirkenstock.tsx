import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-birkenstock-cover.jpg";

const birkenstockData: CompanyCultureData = {
  slug: "birkenstock",
  name: "Birkenstock",
  tagline: "250 years of craftsmanship - from orthopaedic roots to luxury comfort.",
  industry: "Footwear",
  industrySlug: "footwear",
  coverImage,
  website: "https://www.birkenstock.com",
  careersUrl: "https://www.birkenstock.com/us/us-about-careers.html",
  founded: "1774",
  hq: "Linz am Rhein, Germany",
  employees: "6,200+",
  sectors: ["Footwear", "Luxury", "Manufacturing", "Retail"],
  glassdoor: 3.6,
  about: [
    "Birkenstock's story begins in 1774 when Johann Adam Birkenstock was registered as a 'subject and shoemaker' in a small German village. By the late 1800s, the family had developed the first contoured insole, and by 1963, Karl Birkenstock had created the iconic cork-latex footbed that defines the brand today.",
    "For decades, Birkenstocks were the quiet choice of podiatrists and hippies. Then fashion caught up. Phoebe Philo put them on the Céline runway in 2012, and the brand's trajectory changed forever. Today, Birkenstock is a publicly listed company (NYSE: BIRK) valued at over €8 billion.",
    "The company still manufactures almost entirely in Germany, operating multiple factories that combine heritage handcraft with modern automation. Every footbed is heat-moulded from a mix of cork, latex, jute, and suede - no two pairs break in the same way.",
    "Birkenstock's product range has expanded beyond the Arizona and Boston into closed-toe shoes, professional clogs, and high-end collaborations with Dior, Stüssy, and Manolo Blahnik.",
  ],
  whyWorkHere: [
    {
      title: "A 250-year-old startup",
      description:
        "Birkenstock went public in 2023 and is scaling rapidly, but the culture still feels founder-led. It's a rare chance to join a heritage brand in growth mode.",
    },
    {
      title: "Product-obsessed to the core",
      description:
        "This is a company that has spent a quarter of a millennium perfecting a footbed. Quality and craft aren't slogans - they're operational principles.",
    },
    {
      title: "German engineering, global ambition",
      description:
        "With HQ in Germany and offices in New York, London, and Hong Kong, you'll work within a precise, quality-driven European culture with global commercial reach.",
    },
    {
      title: "Sustainability is built in, not bolted on",
      description:
        "Cork is renewable. Shoes last for years. Repairs are encouraged. Birkenstock's sustainability credentials stem from its product philosophy, not a CSR department.",
    },
  ],
  values: [
    {
      emoji: "🪵",
      title: "Craft above all",
      description:
        "Birkenstock's manufacturing is still rooted in skilled handcraft. The company values precision, patience, and pride in the work - whether you're in a factory or an office.",
    },
    {
      emoji: "🦶",
      title: "Function first",
      description:
        "The contoured footbed isn't designed to look good - it's designed to support the human foot. Form follows function at every level of the business.",
    },
    {
      emoji: "♻️",
      title: "Natural materials, long life",
      description:
        "Cork, latex, jute, leather - Birkenstock uses natural, renewable materials and builds products that last years, not seasons.",
    },
    {
      emoji: "🤲",
      title: "Quiet confidence",
      description:
        "Birkenstock doesn't chase trends or shout. The brand lets the product speak - and the culture reflects that understated, substance-over-style ethos.",
    },
  ],
  perks: [
    "Staff discount on all Birkenstock products",
    "Flexible working arrangements",
    "Company pension scheme",
    "Professional development budget",
    "Employee assistance programme",
    "Subsidised canteen (German offices)",
    "Team events and brand experiences",
    "Generous holiday allowance",
    "Parental leave",
    "Relocation support",
  ],
  popularRoles: [
    "Product Developer",
    "Production Engineer",
    "E-Commerce Manager",
    "Visual Merchandiser",
    "Quality Assurance Specialist",
    "Marketing Manager",
    "Wholesale Account Manager",
    "Logistics Coordinator",
  ],
};

const CompanyBirkenstock = () => <CompanyCultureProfile data={birkenstockData} />;

export default CompanyBirkenstock;
