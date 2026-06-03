import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-skysports-cover.jpg";

const data: CompanyCultureData = {
  slug: "sky-sports",
  name: "Sky Sports",
  tagline: "The broadcaster that transformed English football - and never stopped.",
  industry: "Football",
  industrySlug: "football",
  coverImage,
  website: "https://www.skysports.com",
  careersUrl: "https://careers.sky.com/",
  founded: "1991",
  hq: "Isleworth, London",
  employees: "5,000+ (Sky UK)",
  sectors: ["Broadcasting", "Sport", "Media", "Technology"],
  glassdoor: 3.8,
  about: [
    "Sky Sports launched in 1991 and immediately changed the landscape of British sport by securing the first Premier League broadcasting deal in 1992. That partnership - now worth billions - transformed football from a Saturday afternoon pastime into a global media product.",
    "Today, Sky Sports is the UK's dominant sports broadcaster, holding primary rights to the Premier League, EFL, cricket, golf, F1, and boxing. The operation spans live production, studio analysis, digital content, and the Sky Sports News channel.",
    "Part of Comcast's Sky Group, Sky Sports sits within a media conglomerate that includes NBCUniversal and Peacock. This gives employees access to a massive global media infrastructure while working within a distinctly British sports culture.",
    "The Osterley campus in west London is one of the most impressive media facilities in Europe - with multiple studios, production suites, and the kind of technology that makes live sports broadcasting possible at the highest level.",
  ],
  whyWorkHere: [
    { title: "Best-in-class production", description: "Sky Sports' live broadcasts set the standard globally. The production values, camera innovation, and presentation are world-leading." },
    { title: "Multi-sport exposure", description: "Football, cricket, golf, F1, boxing, tennis - Sky Sports covers the full sporting calendar. The variety is unmatched." },
    { title: "Technology-driven storytelling", description: "From augmented reality graphics to AI-powered stats, Sky Sports invests heavily in how stories are told. Tech and editorial work hand-in-hand." },
    { title: "Part of a global media group", description: "As part of Comcast/Sky, there are career paths across NBCUniversal, Peacock, and Sky operations in Germany, Italy, and Austria." },
  ],
  values: [
    { emoji: "📺", title: "Live sport is king", description: "Nothing beats live sport. Sky Sports exists to bring fans closer to the action - in real time, with context, analysis, and emotion." },
    { emoji: "🎙️", title: "Storytelling excellence", description: "Great sports broadcasting isn't just showing the match. It's telling the stories behind the sport - the drama, the data, the human interest." },
    { emoji: "🔧", title: "Innovation in production", description: "Sky Sports pioneered innovations like Monday Night Football, Sky Pad analysis, and UHD HDR broadcasting. The culture rewards creative technical thinking." },
    { emoji: "🏆", title: "Competitive drive", description: "The people who work in sport love competition. Sky Sports' culture reflects that - ambitious, fast-paced, and always striving to be best." },
  ],
  perks: ["Free Sky TV & broadband", "Generous staff discount", "Private medical insurance", "Pension scheme", "Hybrid working", "On-site gym & restaurant", "Enhanced parental leave", "Learning & development budget", "Volunteer days", "Career mobility across Sky/Comcast"],
  popularRoles: ["Broadcast Producer", "Camera Operator", "Sports Journalist", "Data Analyst", "Software Engineer", "Studio Director", "Graphics Designer", "Social Media Producer"],
};

const CompanySkySports = () => <CompanyCultureProfile data={data} />;
export default CompanySkySports;
