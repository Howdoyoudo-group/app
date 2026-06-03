import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-everyman-cover.jpg";

const data: CompanyCultureData = {
  slug: "everyman",
  name: "Everyman Cinemas",
  tagline: "Rewriting the rules on what a trip to the pictures looks like.",
  industry: "Film and TV",
  industrySlug: "cinema",
  coverImage,
  website: "https://www.everymancinema.com",
  careersUrl: "https://careers.everymancinema.com/",
  founded: "2000",
  hq: "London",
  employees: "1,500+",
  sectors: ["Film and TV", "Hospitality", "Leisure", "Retail"],
  glassdoor: 3.9,
  about: [
    "Everyman Cinemas was founded in 2000 with a simple idea: cinema should be an experience, not just a screening. With sofa seating, in-screen dining, craft cocktails, and a curated programme of mainstream and independent films, Everyman redefined what going to the pictures means.",
    "The company now operates 40+ venues across the UK, from converted theatres in Hampstead to purpose-built sites in retail parks. Each venue is designed with its own character - no two Everymans look alike.",
    "Listed on AIM (LSE: EMAN), Everyman has grown rapidly by targeting an audience willing to pay more for a premium experience. The model positions cinema as hospitality rather than entertainment, competing less with other cinemas and more with restaurants and bars for an evening out.",
    "Everyman's growth strategy focuses on new site openings, membership expansion, and broadening its food & drink offering - making it one of the most interesting employers in the UK leisure sector.",
  ],
  whyWorkHere: [
    { title: "Hospitality meets cinema", description: "This isn't a popcorn-and-Pepsi operation. Everyman teams deliver restaurant-quality food and cocktails in a unique setting - it's hospitality with a screen." },
    { title: "Each venue has its own personality", description: "From art deco theatres to modern builds, every site is different. Teams take pride in their venue's character and community." },
    { title: "Growing brand, real progression", description: "With new sites opening regularly, there are genuine opportunities to step up - from team member to venue manager and beyond." },
    { title: "Cultural programming", description: "Everyman shows a mix of blockbusters, independent films, live events, and special screenings. If you love film, you'll be surrounded by it." },
  ],
  values: [
    { emoji: "🛋️", title: "Experience first", description: "Every detail - from the sofa fabric to the cocktail menu - is designed to make the visit memorable. Everyman cares about how things feel." },
    { emoji: "🎥", title: "Love of film", description: "The company's programming reflects genuine cinematic taste. Staff are encouraged to be film enthusiasts, not just ticket sellers." },
    { emoji: "🍸", title: "Hospitality standards", description: "Everyman holds itself to restaurant-grade hospitality. Service, quality, and attention to detail are non-negotiable." },
    { emoji: "🏘️", title: "Community venue", description: "Each Everyman aims to be a neighbourhood hub - hosting events, Q&As, and partnerships that go beyond just showing films." },
  ],
  perks: ["Free cinema tickets", "Staff discount on food & drink", "Tips & service charge", "Flexible scheduling", "Career development programmes", "Pension scheme", "Employee assistance programme", "Venue social events", "Membership perks", "Uniform provided"],
  popularRoles: ["Team Member", "Venue Manager", "Assistant Manager", "Chef / Kitchen Team", "Bar Team", "Projectionist", "Marketing Coordinator", "Operations Manager"],
};

const CompanyEveryman = () => <CompanyCultureProfile data={data} />;
export default CompanyEveryman;
