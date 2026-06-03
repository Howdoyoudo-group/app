import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-caffe-nero-cover.jpg";

const data: CompanyCultureData = {
  slug: "caffe-nero",
  name: "Caffè Nero",
  tagline: "The privately-held Italian-inspired coffee house that chose craft over corporate.",
  industry: "Coffee",
  industrySlug: "coffee",
  coverImage,
  website: "https://caffenero.com",
  careersUrl: "https://caffenero.com/uk/careers/",
  founded: "1997",
  hq: "London",
  employees: "6,000+",
  sectors: ["Coffee", "Hospitality", "Food & Drink"],
  glassdoor: 3.4,
  about: [
    "Caffè Nero was founded in 1997 by Gerry Ford with a simple mission: to create an authentic Italian coffee house experience on British high streets. The first store opened in London's South Kensington, and the brand has since grown to over 1,000 stores.",
    "What sets Nero apart from its competitors is its private ownership. Unlike Costa (Coca-Cola) and Starbucks (publicly traded), Caffè Nero remains independent, allowing it to make long-term brand decisions without quarterly earnings pressure.",
    "The company positions itself as the artisan alternative - darker roasts, a focus on traditional Italian espresso technique, and stores designed to feel like neighbourhood hangouts rather than corporate outlets. Their signature blend is roasted in-house.",
    "Nero operates across the UK, Ireland, Turkey, Cyprus, the UAE, and the USA. The brand has also expanded into food, with an emphasis on freshly made sandwiches, pastries, and seasonal menus.",
  ],
  whyWorkHere: [
    { title: "Independent spirit", description: "Private ownership means decisions are made for the long term, not for quarterly results. There's a genuine entrepreneurial culture." },
    { title: "Italian coffee craft", description: "Nero takes its espresso seriously. If you want to learn traditional Italian coffee technique, this is the place." },
    { title: "Store-level autonomy", description: "Managers have more freedom to shape their store's personality than at most chains. Each Nero feels slightly different." },
    { title: "International growth", description: "Expansion into the US, Turkey, and the Middle East means new markets and new career opportunities." },
  ],
  values: [
    { emoji: "🇮🇹", title: "Italian authenticity", description: "Everything from the coffee blend to the store design is inspired by the Italian coffee bar tradition." },
    { emoji: "☕", title: "Craft over convenience", description: "Nero prioritises the quality of the espresso shot over speed of service. Baristas are trained to take time getting it right." },
    { emoji: "🏠", title: "Neighbourhood presence", description: "Each store aims to be a genuine part of its local community, not just another chain outlet." },
    { emoji: "🎯", title: "Long-term thinking", description: "As a private company, Nero invests in brand equity and customer experience over short-term profit maximisation." },
  ],
  perks: ["Free drinks on shift", "Staff food allowance", "Pension scheme", "Employee assistance programme", "Flexible shifts", "Barista training programme", "Career progression", "Tips shared fairly", "Holiday entitlement above minimum", "Birthday off"],
  popularRoles: ["Barista", "Assistant Manager", "Store Manager", "Area Manager", "Head Barista", "Training Manager", "Operations Director", "Marketing Executive"],
};

const CompanyCaffeNero = () => <CompanyCultureProfile data={data} />;
export default CompanyCaffeNero;
