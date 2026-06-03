import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-netflix-cover.jpg";

const data: CompanyCultureData = {
  slug: "netflix",
  name: "Netflix",
  tagline: "From DVD-by-mail to the world's most influential entertainment company.",
  industry: "Film and TV",
  industrySlug: "cinema",
  coverImage,
  website: "https://www.netflix.com",
  careersUrl: "https://jobs.netflix.com/",
  founded: "1997",
  hq: "Los Gatos, California",
  employees: "13,000+",
  sectors: ["Streaming", "Film", "Television", "Technology"],
  glassdoor: 4.0,
  about: [
    "Netflix was founded in 1997 by Reed Hastings and Marc Randolph as a DVD rental-by-mail service. The pivot to streaming in 2007 changed entertainment forever - killing Blockbuster, disrupting linear TV, and creating the binge-watching era.",
    "Today, Netflix has 280+ million subscribers in 190 countries and spends over $17 billion annually on content. It produces original films, series, documentaries, and games, with award-winning titles from Squid Game to The Crown.",
    "The company's culture deck - published in 2009 - became one of the most important documents in Silicon Valley, defining principles like 'Freedom & Responsibility', 'Context not Control', and the famous 'Keeper Test'.",
    "Netflix's UK operations span a London office, Shepperton Studios partnership, and significant investment in British production - making it a major employer in the UK creative industries.",
  ],
  whyWorkHere: [
    { title: "Freedom & Responsibility", description: "Netflix gives exceptional employees exceptional freedom. There are no approval chains, no expense policies, no vacation tracking. You're trusted to act in Netflix's best interest." },
    { title: "Top-of-market compensation", description: "Netflix pays at the top of the market for every role. No bonuses, no equity vesting schedules - just the highest salary they can offer." },
    { title: "Global cultural influence", description: "Few companies shape culture like Netflix. Working here means contributing to stories that reach hundreds of millions of people." },
    { title: "Radical candour", description: "Feedback is direct, frequent, and expected in all directions. It's not for everyone - but for those who thrive on honesty, it's transformative." },
  ],
  values: [
    { emoji: "🎬", title: "Entertainment obsession", description: "Netflix exists to entertain the world. Every role - from engineering to marketing - serves the goal of creating joy through stories." },
    { emoji: "⚡", title: "High performance", description: "Netflix is a professional sports team, not a family. They hire the best, pay the best, and expect the best. Adequate performance gets a generous severance package." },
    { emoji: "🔓", title: "Freedom with responsibility", description: "No rules about expenses, travel, or time off - just the expectation that you'll make smart decisions. Freedom increases as talent density increases." },
    { emoji: "💬", title: "Radical transparency", description: "Information flows freely. Strategy documents, financials, and decisions are shared broadly. Context replaces control." },
  ],
  perks: ["Top-of-market salary", "Unlimited holiday", "No expense policy (use good judgement)", "Stock options available", "Comprehensive health benefits", "Parental leave (52 weeks)", "Relocation support", "Free Netflix subscription", "Home office setup budget", "Learning & development budget"],
  popularRoles: ["Software Engineer", "Content Strategist", "Production Manager", "Data Scientist", "Product Manager", "Creative Executive", "Marketing Manager", "Studio Operations"],
};

const CompanyNetflix = () => <CompanyCultureProfile data={data} />;
export default CompanyNetflix;
