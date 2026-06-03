import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-five-guys-cover.jpg";

const fiveGuysData: CompanyCultureData = {
  slug: "five-guys",
  name: "Five Guys",
  tagline: "Burgers, fries, and a culture built on simplicity done obsessively well.",
  industry: "Food & Drink",
  industrySlug: "hospitality",
  coverImage,
  website: "https://www.fiveguys.co.uk",
  careersUrl: "https://www.fiveguys.co.uk/careers",
  founded: "1986",
  hq: "Lorton, Virginia (UK: London)",
  employees: "5,000+ (UK)",
  sectors: ["Food & Drink", "Quick Service Restaurants", "Hospitality"],
  glassdoor: 3.5,
  about: [
    "Five Guys was founded in 1986 by Jerry and Janie Murrell in Arlington, Virginia, as a small family-run burger joint. The original deal was simple: four sons could either go to college or start a business. They chose burgers.",
    "The chain expanded through franchising and now operates over 1,800 locations worldwide, including 150+ in the UK and Europe. Five Guys entered the UK market in 2013 with its first Covent Garden location and has since become a premium fast-casual staple on British high streets.",
    "Five Guys' model is deliberately limited: burgers, hot dogs, fries, and milkshakes. No freezers, no timers, no microwaves. Everything is fresh, cooked to order, and customisable with 15 free toppings. The peanut oil-fried chips are hand-cut in every restaurant daily.",
    "The brand has a cult following built on consistency, generous portions, and a no-frills approach. Five Guys competes at a higher price point than traditional fast food, positioning itself between McDonald's and a sit-down burger restaurant - and it works.",
  ],
  whyWorkHere: [
    { title: "Simplicity as a system", description: "Five Guys keeps the menu small and the standards high. Every crew member masters the same processes, which means you learn a craft - not just a task list." },
    { title: "Secret shopper bonuses", description: "Five Guys runs a mystery shopper programme and distributes bonuses to the entire crew when stores score well. It creates genuine team accountability and shared reward." },
    { title: "Promote from within", description: "Five Guys has a strong internal promotion culture. Many General Managers and District Managers started as crew members, and the company actively develops people for leadership." },
    { title: "Energy on the floor", description: "With an open kitchen, loud music, and a fast-paced service model, Five Guys stores have a buzzy, high-energy atmosphere that people either love or find addictive - usually both." },
  ],
  values: [
    { emoji: "🍔", title: "Quality obsession", description: "No freezers. No shortcuts. Five Guys is fanatical about fresh ingredients, hand-formed patties, and hand-cut fries - every single day, in every single store." },
    { emoji: "🥜", title: "Keep it simple", description: "A small menu done exceptionally well. Five Guys proves that restraint and consistency beat complexity every time." },
    { emoji: "🏆", title: "Crew-first culture", description: "The mystery shopper bonus programme rewards the whole team, not individuals. Five Guys believes great service comes from great teams." },
    { emoji: "📈", title: "Grow your own", description: "Internal promotion is the default path. Five Guys invests in crew development because the best managers are the ones who've worked every station." },
  ],
  perks: [
    "Mystery shopper crew bonuses",
    "Free meal on shift",
    "Internal promotion pathway",
    "Competitive hourly pay",
    "Flexible scheduling",
    "Pension scheme",
    "Paid training programmes",
    "Employee assistance programme",
    "Uniform provided",
    "Team incentives and competitions",
  ],
  popularRoles: [
    "Crew Member",
    "Shift Leader",
    "Assistant Manager",
    "General Manager",
    "District Manager",
    "Training Manager",
    "Area Coach",
    "Operations Manager",
  ],
};

const CompanyFiveGuys = () => <CompanyCultureProfile data={fiveGuysData} />;
export default CompanyFiveGuys;
