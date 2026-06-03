import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-rightmove-cover.jpg";

const data: CompanyCultureData = {
  slug: "rightmove",
  name: "Rightmove",
  tagline: "The UK's largest property portal - where 86% of home searches begin.",
  industry: "Estate Agency",
  industrySlug: "estate-agency",
  coverImage,
  website: "https://www.rightmove.co.uk",
  careersUrl: "https://www.rightmove.co.uk/careers//",
  founded: "2000",
  hq: "Milton Keynes",
  employees: "800+",
  sectors: ["Property", "Technology", "Data", "Digital Media"],
  glassdoor: 4.1,
  about: [
    "Rightmove launched in 2000 as a joint venture between the UK's four largest estate agency groups. The idea was simple: create a single place where all properties for sale or rent could be listed online. It worked - spectacularly.",
    "Today, Rightmove lists over 1 million properties at any time and attracts over 2 billion visits per year. It's the most visited property website in the UK, and the place where 86% of home searches begin.",
    "Rightmove's business model is elegantly simple: it doesn't sell houses. It sells advertising space to estate agents, letting agents, and new-home developers. This platform model generates exceptional margins and has made Rightmove one of the most profitable companies on the FTSE 250.",
    "The company is headquartered in Milton Keynes with a relatively small team of around 800, making it one of the most revenue-per-employee efficient businesses in the UK. The tech stack, data science capabilities, and product innovation are central to maintaining its dominance.",
  ],
  whyWorkHere: [
    { title: "Highly profitable, lean team", description: "With £300m+ revenue and ~800 employees, Rightmove punches well above its weight. You'll have outsized impact in a small, focused team." },
    { title: "Product-led tech company", description: "Despite being a property brand, Rightmove is fundamentally a tech company. Engineering, data science, and product design drive the business." },
    { title: "Work-life balance is real", description: "Rightmove consistently ranks as one of the best UK companies to work for. The culture genuinely values balance, flexibility, and wellbeing." },
    { title: "Data at massive scale", description: "2 billion visits per year generates extraordinary data. If you're a data scientist or analyst, the dataset is unmatched in UK property." },
  ],
  values: [
    { emoji: "🏠", title: "Make home happen", description: "Rightmove's mission is to make the home-moving process easier. Every product decision serves this goal." },
    { emoji: "📈", title: "Data-driven decisions", description: "With billions of data points, Rightmove lets evidence guide product, commercial, and strategic choices." },
    { emoji: "🧑‍💻", title: "Innovation through technology", description: "From AI-powered price estimates to virtual tours, Rightmove invests in technology that genuinely improves the property search experience." },
    { emoji: "😊", title: "Happy teams, happy product", description: "Rightmove believes that treating people well produces better work. The culture is supportive, collaborative, and low-ego." },
  ],
  perks: ["Flexible & hybrid working", "Private medical insurance", "Life assurance", "Pension scheme", "Share incentive plan", "25 days holiday + buy more", "Wellbeing allowance", "On-site gym (Milton Keynes)", "Enhanced parental leave", "Learning & development budget"],
  popularRoles: ["Software Engineer", "Data Scientist", "Product Manager", "UX Designer", "Account Manager", "Marketing Manager", "QA Engineer", "Commercial Analyst"],
};

const CompanyRightmove = () => <CompanyCultureProfile data={data} />;
export default CompanyRightmove;
