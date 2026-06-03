import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-tesco-cover.jpg";

const data: CompanyCultureData = {
  slug: "tesco",
  name: "Tesco",
  tagline: "Every little helps - the UK's largest retailer, serving millions every week.",
  industry: "Grocery",
  industrySlug: "grocery",
  coverImage,
  website: "https://www.tescoplc.com",
  careersUrl: "https://www.tesco-careers.com/",
  founded: "1919",
  hq: "Welwyn Garden City",
  employees: "330,000+",
  sectors: ["Grocery", "Retail", "Banking", "Technology"],
  glassdoor: 3.4,
  about: [
    "Tesco was founded in 1919 when Jack Cohen began selling surplus groceries from a stall in London's East End. The name came from a supplier - T.E. Stockwell - combined with Cohen's own initials. By the 1960s, Tesco had become a supermarket powerhouse.",
    "Today, Tesco is the UK's largest retailer, operating over 4,000 stores - from Express convenience shops to Extra hypermarkets. It serves tens of millions of customers weekly and employs 330,000+ people, making it one of the largest private-sector employers in the UK.",
    "Tesco's Clubcard loyalty programme - with data on millions of UK households - is one of the most valuable consumer datasets in British retail. The business also operates Tesco Bank, Tesco Mobile, and a growing online grocery delivery operation.",
    "The company's recent strategy focuses on value (Aldi Price Match), convenience, and digital transformation. After the accounting scandal of 2014 and subsequent restructuring, Tesco has rebuilt under CEO Ken Murphy with a focus on core UK grocery and operational efficiency.",
  ],
  whyWorkHere: [
    { title: "Unmatched scale in UK retail", description: "With 330,000+ employees and 4,000+ stores, Tesco offers career paths across every function - from store operations to data science to banking." },
    { title: "Clubcard data powerhouse", description: "Tesco's Clubcard data gives the business unique consumer insights. Data, analytics, and personalisation roles are central to strategy." },
    { title: "Genuine career ladders", description: "Many Tesco leaders started on the shop floor. The company invests in apprenticeships, management programmes, and internal mobility." },
    { title: "Community commitment", description: "Tesco's Community Food Connection redistributes surplus food to charities. The company takes its role in communities seriously." },
  ],
  values: [
    { emoji: "🛒", title: "Every little helps", description: "Tesco's famous strapline is also its operating philosophy. Small improvements, compounded across thousands of stores, create enormous impact." },
    { emoji: "💰", title: "Value for customers", description: "In a cost-of-living crisis, Tesco's commitment to affordable food is both commercial strategy and social responsibility." },
    { emoji: "👥", title: "Treat people how they want to be treated", description: "Tesco's people principles centre on respect, inclusion, and creating opportunities for everyone to get on." },
    { emoji: "📊", title: "Data-driven retail", description: "Clubcard data informs ranging, pricing, promotion, and personalisation. Tesco is as much a data company as a grocer." },
  ],
  perks: ["Colleague discount (10% + double events)", "Pension scheme", "Life assurance", "Holiday trading", "Shares schemes", "Wellbeing support", "Apprenticeships & qualifications", "Flexible working", "Cycle to work scheme", "Long service awards"],
  popularRoles: ["Store Manager", "Category Buyer", "Data Analyst", "Supply Chain Manager", "Software Engineer", "Marketing Manager", "HR Business Partner", "Logistics Planner"],
};

const CompanyTesco = () => <CompanyCultureProfile data={data} />;
export default CompanyTesco;
