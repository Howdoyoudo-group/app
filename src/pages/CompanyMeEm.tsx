import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-meem-cover.jpg";

const meemData: CompanyCultureData = {
  slug: "me-em",
  name: "ME+EM",
  tagline: "Modern luxury womenswear - designed to last, priced to be fair.",
  industry: "Fashion",
  industrySlug: "fashion",
  coverImage,
  videoUrl: "https://www.youtube.com/embed/CdE_y6G_974",
  website: "https://www.meandem.com",
  careersUrl: "https://www.meandem.com/careers",
  founded: "2009",
  hq: "London, UK",
  employees: "200–500",
  sectors: ["Womenswear", "Luxury Fashion", "D2C Retail", "E-Commerce"],
  glassdoor: 3.8,
  about: [
    "ME+EM is a modern luxury womenswear brand founded by Clare Hornby in 2009. Built on the belief that women deserve beautifully designed, high-quality clothes without the traditional luxury markup, the brand cuts out the middleman and sells directly to customers.",
    "What started as a kitchen-table startup has grown into one of the UK's most exciting fashion brands, with flagship stores in London's Marylebone, Chelsea, and Notting Hill, plus a thriving e-commerce business shipping worldwide.",
    "The brand is known for its timeless yet contemporary aesthetic - sharp tailoring, refined knitwear, and colour-rich collections that work for real life. Every piece is designed in-house at the London studio and crafted using premium fabrics sourced from the same mills that supply the world's top fashion houses.",
    "ME+EM has attracted significant investment, raising over £55m to fuel its growth. The team is scaling rapidly across product, digital, retail, and operations - making it one of the most dynamic places to build a fashion career in London right now.",
  ],
  whyWorkHere: [
    {
      title: "Founder-led & fast-growing",
      description:
        "Clare Hornby remains CEO. You'll work in a business that's scaling fast but stays close to its founder's vision - no corporate bloat.",
    },
    {
      title: "Direct-to-consumer DNA",
      description:
        "ME+EM's D2C model means every team - from design to data - has a direct line to the customer. You see the impact of your work immediately.",
    },
    {
      title: "London design studio",
      description:
        "All design happens in-house in London. If you're a creative, you'll be working alongside the product team, not outsourcing to third parties.",
    },
    {
      title: "Real career progression",
      description:
        "A fast-scaling brand means new roles, new teams, and real opportunities to grow. Many senior leaders started in junior positions.",
    },
  ],
  values: [
    {
      emoji: "✂️",
      title: "Cut the middleman",
      description:
        "ME+EM's entire business model is built on directness - selling straight to the customer, removing unnecessary markups, and being transparent about pricing.",
    },
    {
      emoji: "🎨",
      title: "Design-led thinking",
      description:
        "Every decision starts with the product. The brand obsesses over fabric, fit, and finish - and expects every team to bring that same attention to detail.",
    },
    {
      emoji: "💪",
      title: "Empowering women",
      description:
        "ME+EM exists to make women feel confident. That mission extends internally - the team is predominantly female, and leadership actively supports women's career development.",
    },
    {
      emoji: "🌍",
      title: "Sustainability in progress",
      description:
        "The brand is transparent about being on a journey. They're investing in responsible sourcing, reduced waste, and longer-lasting garments rather than greenwashing.",
    },
  ],
  perks: [
    "Generous staff discount",
    "Hybrid working",
    "London studio",
    "Private healthcare",
    "Annual bonus",
    "Enhanced parental leave",
    "Sample sales",
    "Team socials",
    "Learning & development budget",
    "Cycle to work scheme",
  ],
  popularRoles: [
    "Fashion Designer",
    "E-Commerce Manager",
    "Visual Merchandiser",
    "Buyer",
    "Marketing Executive",
    "Retail Store Manager",
    "Graphic Designer",
    "Supply Chain Coordinator",
  ],
};

const CompanyMeEm = () => <CompanyCultureProfile data={meemData} />;

export default CompanyMeEm;
