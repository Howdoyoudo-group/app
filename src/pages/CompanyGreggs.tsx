import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-greggs-cover.jpg";

const greggsData: CompanyCultureData = {
  slug: "greggs",
  name: "Greggs",
  tagline: "From a Tyneside bakery to the UK's favourite high-street food brand.",
  industry: "Bakery",
  industrySlug: "bakery",
  coverImage,
  website: "https://www.greggs.co.uk",
  careersUrl: "https://careerssearch.greggs.co.uk/",
  founded: "1939",
  hq: "Newcastle upon Tyne",
  employees: "32,000+",
  sectors: ["Bakery", "Food & Drink", "Retail", "Supply Chain"],
  glassdoor: 3.5,
  about: [
    "Greggs started in 1939 when John Gregg began delivering fresh eggs and yeast by bicycle on Tyneside. His son Ian turned the business into a chain of bakeries, and by the 1980s Greggs was the largest bakery chain in the UK.",
    "Today, Greggs operates over 2,400 shops across the UK, serving millions of customers per week. The vegan sausage roll launch in 2019 became a cultural moment - and a masterclass in PR - propelling the brand into mainstream food conversation.",
    "Greggs is publicly listed on the LSE and generates over £1.8 billion in annual revenue. The business runs its own bakeries, supply chain, and logistics - everything from mixing dough at 3am to serving a steak bake at noon.",
    "The company's strategy centres on extending trading hours (breakfast, evening), delivery partnerships (Just Eat, Uber Eats), and expanding its menu beyond traditional bakery into hot food, coffee, and meal deals.",
  ],
  whyWorkHere: [
    { title: "Genuinely loved brand", description: "Greggs has an almost cult-like following. Working here means being part of a brand that people feel emotional about - from the sausage roll to the festive bake." },
    { title: "Growth at scale", description: "With plans to reach 3,000+ shops, Greggs is one of the UK's fastest-expanding food retailers. There's real career progression across retail, supply chain, digital, and corporate." },
    { title: "Profit-sharing culture", description: "Every employee is part of the Greggs profit share scheme. When the business does well, everyone benefits - from shop teams to HQ." },
    { title: "Community roots", description: "The Greggs Foundation funds breakfast clubs in over 1,000 schools. The company's social purpose is genuine and deeply embedded." },
  ],
  values: [
    { emoji: "🥖", title: "Fresh every day", description: "Greggs bakes fresh in every shop, every morning. Quality and freshness aren't slogans - they're operational commitments that shape every role." },
    { emoji: "💷", title: "Value for everyone", description: "Great food shouldn't be expensive. Greggs exists to offer quality at prices everyone can afford - and that principle drives its business model." },
    { emoji: "❤️", title: "Giving something back", description: "Through the Greggs Foundation, the company supports communities with food poverty programmes, education, and local grants." },
    { emoji: "🤝", title: "Inclusive and down-to-earth", description: "No airs and graces. Greggs' culture is unpretentious, team-oriented, and proud of its working-class roots." },
  ],
  perks: ["Profit sharing", "Free/discounted food", "21 days holiday + bank holidays", "Pension scheme", "Employee assistance programme", "Cycle to work scheme", "Career development programmes", "Long service awards", "Flexible working (HQ roles)", "Greggs Foundation support"],
  popularRoles: ["Shop Team Member", "Shop Manager", "Baker", "Supply Chain Operative", "Area Manager", "Digital Marketing Manager", "Food Technologist", "Logistics Planner"],
};

const CompanyGreggs = () => <CompanyCultureProfile data={greggsData} />;
export default CompanyGreggs;
