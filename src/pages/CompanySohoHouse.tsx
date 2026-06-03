import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-sohohouse-cover.jpg";

const data: CompanyCultureData = {
  slug: "soho-house",
  name: "Soho House",
  tagline: "A members' club empire where creativity, hospitality, and community collide.",
  industry: "Food & Drink",
  industrySlug: "hospitality",
  coverImage,
  website: "https://www.sohohouse.com",
  careersUrl: "https://www.sohohouse.com/careers",
  founded: "1995",
  hq: "London",
  employees: "12,000+",
  sectors: ["Hospitality", "Members' Clubs", "Hotels", "Wellness"],
  glassdoor: 3.2,
  about: [
    "Soho House was founded in 1995 by Nick Jones as a private members' club for people in the creative industries - a place where film-makers, musicians, artists, and media professionals could eat, drink, and work. The first House opened above a Greek Street café in Soho.",
    "Today, Soho House & Co operates 40+ Houses across 15 countries, alongside Soho Works co-working spaces, Cowshed spas, Cecconi's restaurants, and The Ned hotels. The empire spans hospitality, wellness, retail, and real estate.",
    "The company went public on the NYSE in 2021 (ticker: SHCO) under CEO Andrew Carnie. The membership model - with annual fees ranging from £2,000 to £4,000+ - creates recurring revenue that funds the expansion of new Houses and brands.",
    "Soho House's interiors are legendary - designed in-house by a team that has created one of the most recognisable aesthetic identities in global hospitality. If you've ever seen a velvet sofa next to an exposed-brick wall under a vintage painting, the influence is clear.",
  ],
  whyWorkHere: [
    { title: "The hospitality brand of our generation", description: "Soho House defined the members' club model for creative professionals. Working here means being part of a cultural institution." },
    { title: "Incredible interiors and design", description: "Every House is designed in-house to a world-class standard. If you care about design, this is one of the most visually inspiring places to work." },
    { title: "Global opportunities", description: "With Houses on four continents, there are opportunities to work in London, New York, Hong Kong, Mykonos, or wherever the next House opens." },
    { title: "Creative community", description: "Members include some of the most interesting people in culture. The atmosphere is genuinely inspiring - and staff are treated as part of that community." },
  ],
  values: [
    { emoji: "🎨", title: "Creativity is core", description: "Soho House was built for creative people. The culture reflects that - individuality, self-expression, and original thinking are celebrated." },
    { emoji: "🍽️", title: "Hospitality excellence", description: "Great food, great drinks, great service. Despite the design focus, Soho House is fundamentally a hospitality business - and standards are high." },
    { emoji: "🤝", title: "Community over exclusivity", description: "The membership model creates intimacy and connection. Soho House aims to feel like a second home, not a VIP lounge." },
    { emoji: "🌍", title: "Global with local soul", description: "Each House reflects its neighbourhood. A Soho House in Barcelona feels different from one in Shoreditch - and that's intentional." },
  ],
  perks: ["Free House membership (after probation)", "Staff meals on shift", "Generous employee discounts", "Flexible scheduling", "Tips & service charge", "Career mobility across Houses", "Health & wellbeing support", "Learning & development", "Social events & screenings", "Cowshed product discounts"],
  popularRoles: ["Restaurant Manager", "Chef de Partie", "Bartender", "Receptionist / Host", "Events Coordinator", "Membership Manager", "Interior Designer", "Marketing Manager"],
};

const CompanySohoHouse = () => <CompanyCultureProfile data={data} />;
export default CompanySohoHouse;
