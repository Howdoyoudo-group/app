import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-pragnell-cover.jpg";

const data: CompanyCultureData = {
  slug: "pragnell",
  name: "Pragnell",
  tagline: "Family-owned fine jewellers & Royal Warrant holders since 1954.",
  industry: "Jewellery",
  industrySlug: "jewellery",
  coverImage,
  videoUrl: "https://www.youtube.com/embed/7zlZsbHIFXA",
  website: "https://www.pragnell.co.uk",
  careersUrl: "https://www.pragnell.co.uk/careers",
  founded: "1954",
  hq: "Stratford-upon-Avon, UK",
  employees: "100–250",
  sectors: ["Fine Jewellery", "High Jewellery", "Watches", "Antique & Estate Jewellery", "Bespoke Commissions"],
  about: [
    "Pragnell is one of Britain's most respected independent fine jewellers, founded in 1954 by George Pragnell in the heart of Stratford-upon-Avon. Now in its third generation of family ownership, the house holds a Royal Warrant as jewellers to HM The King.",
    "The business spans three showrooms - Stratford-upon-Avon, Mayfair, and Leicester - each offering an intimate, appointment-led experience. Pragnell is known for museum-quality antique jewellery, exceptional loose diamonds, and bespoke commissions crafted in-house.",
    "Unlike many luxury jewellers, Pragnell retains a genuine workshop culture. Their master goldsmiths and diamond setters work on-site, creating one-of-a-kind pieces from sketch to finished article. The team also includes specialist gemmologists, valuers, and watch experts.",
    "Pragnell has built a loyal client base through discretion, deep expertise, and an unwavering commitment to quality over volume. They source stones directly, maintain their own heritage archive, and invest heavily in training the next generation of jewellery professionals.",
  ],
  whyWorkHere: [
    {
      title: "Royal Warrant heritage",
      description:
        "As holders of a Royal Warrant, Pragnell operates at the highest standard. You'll learn what excellence looks like in an environment that prizes craftsmanship and legacy.",
    },
    {
      title: "Family values, not corporate politics",
      description:
        "Third-generation family ownership means decisions are made with care, staff are treated as people, and long-term relationships matter more than quarterly targets.",
    },
    {
      title: "Genuine craft",
      description:
        "Pragnell's in-house workshop means you work alongside master goldsmiths and setters. Whether you're on the bench or in the showroom, you're surrounded by real making.",
    },
    {
      title: "World-class stock",
      description:
        "From Georgian tiaras to 10-carat diamonds, the pieces you'll handle are extraordinary. This is an education in fine jewellery that money can't buy.",
    },
  ],
  values: [
    {
      emoji: "👑",
      title: "Excellence without compromise",
      description:
        "Every piece - whether antique or bespoke - meets the same exacting standard. The Royal Warrant isn't a badge; it's a daily discipline.",
    },
    {
      emoji: "🔍",
      title: "Deep expertise",
      description:
        "Pragnell invests in knowledge. Their team includes qualified gemmologists (FGA, DGA), trained watchmakers, and experienced valuers. Learning never stops.",
    },
    {
      emoji: "🤝",
      title: "Client trust",
      description:
        "Many clients have been with Pragnell for decades - engagement rings, wedding gifts, milestone purchases. Discretion, honesty, and long-term care define every relationship.",
    },
    {
      emoji: "🏛️",
      title: "Heritage & stewardship",
      description:
        "Pragnell curates one of the UK's finest collections of antique jewellery. They see themselves as custodians - preserving and passing on pieces with proper provenance.",
    },
  ],
  perks: [
    "Staff discount on jewellery & watches",
    "Gemmology & watchmaking training support",
    "Pension scheme",
    "25+ days holiday",
    "Intimate team culture",
    "Exposure to museum-grade pieces",
    "Professional development funding",
    "Central showroom locations",
  ],
  popularRoles: [
    "Sales Consultant",
    "Bench Jeweller",
    "Gemmologist",
    "Bespoke Consultant",
    "Watch Specialist",
    "Showroom Manager",
    "Marketing Coordinator",
    "Valuer & Appraiser",
  ],
};

const CompanyPragnell = () => <CompanyCultureProfile data={data} />;

export default CompanyPragnell;
