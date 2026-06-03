import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-starbucks-cover.jpg";

const data: CompanyCultureData = {
  slug: "starbucks",
  name: "Starbucks",
  tagline: "The company that turned coffee into a global cultural phenomenon - and invented the 'third place'.",
  industry: "Coffee",
  industrySlug: "coffee",
  coverImage,
  website: "https://www.starbucks.co.uk",
  careersUrl: "https://www.starbucksemeacareers.com/",
  founded: "1971",
  hq: "Seattle, USA",
  employees: "380,000+",
  sectors: ["Coffee", "Hospitality", "Retail", "Technology"],
  glassdoor: 3.6,
  about: [
    "Starbucks was founded in 1971 in Seattle's Pike Place Market, originally selling whole-bean coffee. Under Howard Schultz's leadership from the 1980s, it transformed into the coffeehouse model we know today - inspired by Italian espresso bar culture.",
    "The company pioneered the concept of the 'third place' - a comfortable social environment between home and work. This idea reshaped how millions of people interact with coffee, turning a commodity into a lifestyle experience.",
    "With over 35,000 stores in 80+ countries, Starbucks is the world's largest coffeehouse chain. In the UK, it operates a mix of company-owned and licensed stores, with a strong presence on high streets, in airports, and in retail parks.",
    "Starbucks continues to innovate through mobile ordering, its Rewards loyalty programme, seasonal product drops like the Pumpkin Spice Latte, and investments in sustainability through its 'Greener Stores' framework.",
  ],
  whyWorkHere: [
    { title: "Global career mobility", description: "With operations in 80+ countries, Starbucks offers genuine international career opportunities across retail, corporate, and supply chain roles." },
    { title: "Partner culture", description: "Starbucks calls its employees 'partners' - not just branding, but reflected in stock options (Bean Stock), tuition support, and benefits from day one." },
    { title: "Innovation at scale", description: "From mobile-first ordering to cold brew innovation, Starbucks invests heavily in R&D. Tech, product, and marketing teams work on genuinely global products." },
    { title: "Recognised training", description: "Starbucks' barista and management training programmes are among the most respected in hospitality, opening doors across the industry." },
  ],
  values: [
    { emoji: "🤝", title: "Creating a culture of warmth", description: "Starbucks aims to create a welcoming environment where everyone feels they belong - customers and partners alike." },
    { emoji: "☕", title: "Delivering the best coffee", description: "From ethical sourcing through C.A.F.E. Practices to in-store craft, coffee quality is non-negotiable." },
    { emoji: "🌱", title: "Acting with courage", description: "Starbucks encourages challenging the status quo, finding new ways to grow the company and each other." },
    { emoji: "🌍", title: "Being present", description: "Connecting with transparency, dignity, and respect in every interaction - from the bar to the boardroom." },
  ],
  perks: ["Free drinks on shift", "30% partner discount", "Bean Stock (shares)", "Private healthcare", "Life assurance", "Pension scheme", "Mental health support", "Free Headspace subscription", "Flexible scheduling", "Career development programmes"],
  popularRoles: ["Barista", "Shift Supervisor", "Store Manager", "District Manager", "Coffee Master", "Digital Marketing Manager", "Supply Chain Manager", "Product Development Lead"],
};

const CompanyStarbucks = () => <CompanyCultureProfile data={data} />;
export default CompanyStarbucks;
