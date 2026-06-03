import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-premierleague-cover.jpg";

const data: CompanyCultureData = {
  slug: "premier-league",
  name: "The Premier League",
  tagline: "The world's most-watched football league - 189 countries, £6bn in revenue.",
  industry: "Football",
  industrySlug: "football",
  coverImage,
  website: "https://www.premierleague.com",
  careersUrl: "https://careers.premierleague.com/",
  founded: "1992",
  hq: "London",
  employees: "500+",
  sectors: ["Football", "Broadcasting", "Commercial", "Community"],
  glassdoor: 4.1,
  about: [
    "The Premier League was formed in 1992 when the First Division clubs broke away from the Football League to negotiate their own broadcasting deals. That decision created the richest domestic football competition in the world.",
    "Today, the Premier League generates over £6 billion in annual revenue, primarily through broadcasting deals spanning 189 countries. The central body negotiates TV rights and distributes revenue across 20 clubs, funding everything from transfer fees to grassroots football.",
    "But the Premier League is far more than a sports organiser. It employs hundreds of people across broadcasting production, commercial partnerships, community programmes (Premier League Kicks, Primary Stars), digital content, legal, safeguarding, and football development.",
    "The organisation operates from offices near Paddington, with matchday operations spanning every ground in the country. It's one of the most prestigious employers in British sport - and one of the least understood from a careers perspective.",
  ],
  whyWorkHere: [
    { title: "The pinnacle of football", description: "The Premier League is the world's most-watched sporting competition. Working here means being at the absolute centre of the global game." },
    { title: "Impact beyond the pitch", description: "Community programmes like Premier League Kicks reach hundreds of thousands of young people. The social impact work is substantial and genuine." },
    { title: "Broadcasting & content", description: "The Premier League produces world-class broadcast content - from match coverage to digital storytelling. Media roles here are genuinely best-in-class." },
    { title: "Commercial sophistication", description: "Managing partnerships worth billions requires serious commercial and legal talent. The deals are complex, global, and high-stakes." },
  ],
  values: [
    { emoji: "⚽", title: "Football first", description: "Every decision serves the game. The Premier League exists to make English football the best it can be - competitively, commercially, and culturally." },
    { emoji: "🌍", title: "Global reach, local impact", description: "Broadcast in 189 countries but invested in every community in England. The Premier League bridges global entertainment and grassroots participation." },
    { emoji: "🤝", title: "Collective competition", description: "20 clubs competing fiercely on the pitch but collaborating off it. Revenue sharing, governance, and rulebook development require diplomacy and fairness." },
    { emoji: "🛡️", title: "Integrity and governance", description: "Fair play, financial sustainability, and safeguarding are non-negotiable. The league invests heavily in ensuring the game is clean and safe." },
  ],
  perks: ["Competitive salary", "Private medical insurance", "Pension scheme", "Hybrid working", "Match tickets", "25 days holiday + bank holidays", "Season ticket loan", "Employee assistance programme", "Professional development", "Volunteer days"],
  popularRoles: ["Broadcasting Manager", "Commercial Partnerships Manager", "Community Programme Manager", "Legal Counsel", "Football Development Officer", "Digital Content Producer", "Data Analyst", "Safeguarding Officer"],
};

const CompanyPremierLeague = () => <CompanyCultureProfile data={data} />;
export default CompanyPremierLeague;
