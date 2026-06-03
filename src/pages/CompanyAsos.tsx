import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-asos-cover.jpg";

const data: CompanyCultureData = {
  slug: "asos",
  name: "ASOS",
  tagline: "The UK's largest online-only fashion retailer - 850+ brands, 20m+ customers.",
  industry: "Fashion",
  industrySlug: "fashion",
  coverImage,
  website: "https://www.asos.com",
  careersUrl: "https://www.asoscareers.com/",
  founded: "2000",
  hq: "London",
  employees: "2,500+",
  sectors: ["Fashion", "E-Commerce", "Retail", "Technology"],
  glassdoor: 3.4,
  about: [
    "ASOS - originally 'As Seen On Screen' - launched in 2000 as a website selling copies of clothes worn by celebrities. It quickly pivoted to become the UK's largest online-only fashion retailer, selling over 850 brands alongside its own label.",
    "At its peak, ASOS served 26 million active customers globally, offering free delivery and free returns in a model that defined fast-fashion e-commerce. The company pioneered social-first marketing, influencer partnerships, and size-inclusive ranges.",
    "Recent years have been challenging. Returns logistics, competition from ultra-fast-fashion (Shein), and margin pressure have forced ASOS to restructure - reducing headcount, tightening its brand portfolio, and focusing on profitability over growth.",
    "Despite the turbulence, ASOS remains one of the most important employers in UK fashion tech. Its engineering, data, and product teams are building the infrastructure for digital-first fashion retail.",
  ],
  whyWorkHere: [
    { title: "Digital-first fashion at scale", description: "ASOS processes millions of orders and returns. The operational, data, and logistics challenges are genuinely world-class." },
    { title: "Fashion-forward culture", description: "ASOS employees are fashion enthusiasts. The office culture reflects the brand - creative, expressive, and trend-aware." },
    { title: "Tech roles with real impact", description: "ASOS' engineering team builds everything from recommendation engines to warehouse automation. It's a tech company that happens to sell clothes." },
    { title: "London HQ, global customer base", description: "Based near London Bridge, ASOS serves customers in 200+ markets. It's a London startup that became a global platform." },
  ],
  values: [
    { emoji: "👗", title: "Fashion for all", description: "ASOS believes fashion should be accessible. Size-inclusive ranges, affordable prices, and global delivery reflect this commitment." },
    { emoji: "⚡", title: "Speed and agility", description: "In fast fashion, speed wins. ASOS' culture rewards quick decisions, rapid testing, and comfort with ambiguity." },
    { emoji: "📱", title: "Digital native", description: "No stores, no wholesale - ASOS is 100% digital. The business thinks in clicks, conversions, and customer journeys." },
    { emoji: "🌱", title: "Responsible fashion", description: "ASOS is working to make fashion more sustainable - through circular design, better materials, and supply chain transparency." },
  ],
  perks: ["40% staff discount", "Flexible & hybrid working", "25 days holiday + buy more", "Pension scheme", "Private medical insurance", "Annual bonus scheme", "Enhanced parental leave", "Wellbeing programmes", "Learning & development budget", "Sample sales"],
  popularRoles: ["Software Engineer", "Buyer", "Merchandiser", "Product Manager", "UX Designer", "Data Analyst", "Content Creator", "Supply Chain Manager"],
};

const CompanyAsos = () => <CompanyCultureProfile data={data} />;
export default CompanyAsos;
