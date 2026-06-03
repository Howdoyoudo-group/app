import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-dice-cover.jpg";

const data: CompanyCultureData = {
  slug: "dice",
  name: "Dice",
  tagline: "Mobile-first ticketing that puts fans and artists first - no touts, no fees.",
  industry: "Music",
  industrySlug: "music",
  coverImage,
  website: "https://dice.fm",
  careersUrl: "https://dice.fm/jobs",
  founded: "2014",
  hq: "London",
  employees: "400+",
  sectors: ["Music", "Technology", "Ticketing", "Live Events"],
  glassdoor: 4.0,
  about: [
    "Dice was founded in 2014 by Phil Hutcheon with a mission to fix live music ticketing. The app removes touts, hidden fees, and paper tickets - using mobile-only, non-transferable tickets that can only be returned to the waiting list, not resold at inflated prices.",
    "The platform uses data and algorithms to recommend gigs to users based on their listening habits and location. This discovery engine helps fans find events they'd otherwise miss, and helps artists and venues fill rooms with genuine fans.",
    "Dice has expanded rapidly across Europe and the US, partnering with major venues and festivals. The company pays artists faster than traditional promoters and gives them direct access to fan data - a significant shift in an industry where artists often don't know who attends their shows.",
    "Backed by significant venture funding, Dice represents a genuine challenge to the Ticketmaster-dominated status quo. The company is building a fairer, more transparent live music ecosystem - one gig at a time.",
  ],
  whyWorkHere: [
    { title: "Mission-driven tech company", description: "Dice exists to fix a broken industry. If you've ever been ripped off by a tout or charged hidden booking fees, you understand the mission." },
    { title: "Music culture is in the DNA", description: "Dice employees genuinely love live music. The office culture reflects that - gig recommendations, artist visits, and a deep respect for the creative community." },
    { title: "Product-led growth", description: "Dice grows through product quality, not marketing spend. The engineering and design teams are central to the company's strategy." },
    { title: "Startup energy, real scale", description: "With 400+ employees and operations across multiple countries, Dice has startup energy with meaningful scale and impact." },
  ],
  values: [
    { emoji: "🎵", title: "Fans first", description: "No hidden fees, no touts, fair prices. Dice believes fans deserve a better deal - and builds technology to deliver it." },
    { emoji: "🎤", title: "Artist empowerment", description: "Dice gives artists data on their fans, faster payments, and control over pricing. The platform serves creators, not just consumers." },
    { emoji: "📱", title: "Mobile-native", description: "Dice is mobile-only by design. The constraint forces better product thinking and creates a seamless, secure ticketing experience." },
    { emoji: "🔍", title: "Discovery over search", description: "The best gig is the one you didn't know about. Dice's recommendation engine helps fans discover new music and emerging artists." },
  ],
  perks: ["Free gig tickets", "Flexible & hybrid working", "Stock options", "Pension scheme", "Private medical insurance", "Learning & development budget", "Annual team festivals", "Music industry events", "Generous holiday allowance", "Sabbatical policy"],
  popularRoles: ["Software Engineer", "Product Manager", "Data Scientist", "Artist Relations Manager", "Marketing Manager", "UX Designer", "Venue Partnerships Manager", "Content Producer"],
};

const CompanyDice = () => <CompanyCultureProfile data={data} />;
export default CompanyDice;
