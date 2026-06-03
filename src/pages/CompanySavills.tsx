import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-savills-cover.jpg";

const data: CompanyCultureData = {
  slug: "savills",
  name: "Savills",
  tagline: "170 years of advising on the world's most important asset - property.",
  industry: "Estate Agency",
  industrySlug: "estate-agency",
  coverImage,
  website: "https://www.savills.co.uk",
  careersUrl: "https://www.savills.co.uk/contact-us/careers.aspx",
  founded: "1855",
  hq: "London",
  employees: "40,000+ (globally)",
  sectors: ["Property", "Real Estate", "Consulting", "Research"],
  glassdoor: 3.8,
  about: [
    "Savills was founded in 1855 by Alfred Savill in London. Over 170 years later, it has grown into one of the world's leading property advisory firms, operating across 70+ countries with over 700 offices.",
    "The UK operation spans residential sales and lettings, commercial property, rural and agricultural land, property management, planning consultancy, and research. Savills is the go-to adviser for prime London property, country estates, and institutional real estate.",
    "What sets Savills apart is its research-driven approach. The Savills Research team produces some of the most cited property data in the UK, influencing everything from government housing policy to institutional investment decisions.",
    "Listed on the LSE, Savills generates over £2 billion in annual revenue. The business model combines transactional fee income with growing consultancy and management services - offering a breadth of career paths rarely found in a single property firm.",
  ],
  whyWorkHere: [
    { title: "Breadth of career paths", description: "From selling a studio flat in Clapham to advising on a £500m commercial portfolio - Savills offers an extraordinary range of roles under one roof." },
    { title: "Research and thought leadership", description: "Savills' research team is genuinely influential. If you want to understand property markets deeply, there's no better platform." },
    { title: "Prime market expertise", description: "Savills dominates the prime London and country house markets. If you're interested in high-value, relationship-driven property work, this is the firm." },
    { title: "Global network", description: "With offices in 70+ countries, Savills offers international mobility and exposure to global real estate markets." },
  ],
  values: [
    { emoji: "🏛️", title: "Heritage and trust", description: "170 years of reputation. Savills' name carries weight with clients, developers, and institutions because trust has been earned over generations." },
    { emoji: "📊", title: "Evidence-based advice", description: "Savills leads with data. Research informs every client recommendation, market view, and strategic decision." },
    { emoji: "🤝", title: "Client relationships", description: "Long-term client relationships - often spanning decades - are the foundation of the business. Advisers are expected to earn and keep trust." },
    { emoji: "🌍", title: "Sustainability in property", description: "Savills is increasingly focused on ESG, helping clients navigate energy performance, biodiversity net gain, and sustainable development." },
  ],
  perks: ["Competitive salary + commission", "Pension scheme", "Private medical insurance", "Life assurance", "Season ticket loan", "Cycle to work scheme", "Professional qualification support (RICS)", "25 days holiday + bank holidays", "Employee assistance programme", "Volunteer days"],
  popularRoles: ["Graduate Surveyor", "Residential Sales Negotiator", "Commercial Agent", "Planning Consultant", "Property Manager", "Research Analyst", "Rural Surveyor", "Valuer"],
};

const CompanySavills = () => <CompanyCultureProfile data={data} />;
export default CompanySavills;
