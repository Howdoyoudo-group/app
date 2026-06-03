import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-hawkstone-cover.jpg";

const data: CompanyCultureData = {
  slug: "hawkstone",
  name: "Hawkstone",
  tagline: "Farm-born lager and cider. Hard to make, easy to drink.",
  industry: "Beer",
  industrySlug: "beer",
  coverImage,
  website: "https://hawkstone.com",
  careersUrl: "https://hawkstone.com",
  founded: "2021",
  hq: "Chipping Norton, Cotswolds",
  employees: "50+",
  sectors: ["Brewing", "Cider", "Agriculture", "DTC"],
  glassdoor: undefined,
  about: [
    "Hawkstone was launched in 2021 by Jeremy Clarkson and the Cotswold Brew Co. What started as a farm-shop curiosity - lager brewed with barley grown on Clarkson's Diddly Squat Farm - has rapidly become one of the UK's fastest-growing drinks brands.",
    "The brand produces a premium lager and cider range, with ingredients sourced as locally as possible. The lager uses British-grown barley, and the cider is pressed from apples grown in Oxfordshire and Gloucestershire orchards.",
    "Hawkstone was named the south west's fastest-growing private company in The Sunday Times 100 rankings. The brand has expanded from farm-shop sales into national supermarket distribution, export markets, and a growing direct-to-consumer operation.",
    "Despite its celebrity connection, Hawkstone positions itself as a serious brewing operation - focused on quality, provenance, and the story of where ingredients come from. The team is small, scrappy, and scaling fast.",
  ],
  whyWorkHere: [
    { title: "Rocket-ship growth", description: "Hawkstone is one of the UK's fastest-growing drinks brands. You'll be building systems, processes, and partnerships from scratch - not inheriting someone else's playbook." },
    { title: "Farm-to-glass authenticity", description: "This isn't a brand story invented by a marketing agency. The barley really does come from the farm. The provenance is real, and that makes the work meaningful." },
    { title: "Small team, big impact", description: "With around 50 people, everyone's contribution is visible. You'll work across functions, solve real problems, and see your work on shelves within weeks." },
    { title: "Cotswolds base", description: "Headquartered in Chipping Norton - beautiful countryside, strong community, and a refreshing alternative to London-centric drinks brands." },
  ],
  values: [
    { emoji: "🌾", title: "Provenance matters", description: "Hawkstone is obsessive about where ingredients come from. British barley, local apples, short supply chains - it's farming-first brewing." },
    { emoji: "🍺", title: "Quality over hype", description: "The brand could coast on celebrity. Instead, it invests in brewing quality, flavour development, and production standards that stand up against any craft lager." },
    { emoji: "⚡", title: "Move fast, stay lean", description: "Hawkstone operates with startup intensity. Decisions happen quickly, roles are broad, and everyone rolls up their sleeves." },
    { emoji: "🌍", title: "Think big from small beginnings", description: "From a farm shop to national supermarkets and international export - Hawkstone proves that starting small doesn't mean thinking small." },
  ],
  perks: ["Staff beer allowance", "Cotswolds working environment", "Pension scheme", "Growth-stage equity culture", "Farm events and tastings", "Flexible working where possible", "Fast career progression", "Product development involvement"],
  popularRoles: ["Head of Sales Operations", "Brand Manager", "Production Brewer", "Supply Chain Manager", "E-Commerce Manager", "Marketing Coordinator", "Logistics Coordinator", "Quality Assurance"],
};

const CompanyHawkstone = () => <CompanyCultureProfile data={data} />;
export default CompanyHawkstone;
