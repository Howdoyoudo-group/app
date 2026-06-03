import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-gails-cover.jpg";

const gailsData: CompanyCultureData = {
  slug: "gails",
  name: "Gail's",
  tagline: "Neighbourhood bakeries & cafés - bread baked fresh, every single day.",
  industry: "Bakery",
  industrySlug: "bakery",
  coverImage,
  videoUrl: "https://www.youtube.com/embed/kTIj-5SMdw8",
  website: "https://gfrb.co/gails-web",
  careersUrl: "https://jobs.gailsbread.co.uk",
  founded: "2005",
  hq: "London, UK",
  employees: "1,000–2,000",
  sectors: ["Artisan Bakery", "Hospitality", "Food & Drink", "Retail"],
  glassdoor: 3.4,
  about: [
    "Gail's is a neighbourhood bakery born in London in 2005. Founded by three friends - Gail Mejia, Tom Molnar, and Ran Avidan - with the simple belief that every community deserves access to properly made bread, baked fresh each morning.",
    "Today, Gail's operates over 100 bakeries across London and the south of England. Every loaf, pastry, and cake is made using slow fermentation, hand-shaping, and real ingredients - no shortcuts, no preservatives, no compromises.",
    "Behind the bakeries sits a serious operation: a central bakery in Bermondsey that produces through the night, a supply chain sourcing high-quality flour and seasonal ingredients, and a growing team of bakers, baristas, and hospitality professionals.",
    "Gail's is part of the GAIL's Bakery & Bread Holdings group, which also operates the Bread Factory wholesale business supplying restaurants, hotels, and retailers across the UK. The group has attracted significant private equity investment and continues to expand rapidly.",
  ],
  whyWorkHere: [
    {
      title: "Craft meets scale",
      description:
        "Gail's proves you can grow to 100+ locations without sacrificing quality. You'll learn how artisan standards work at commercial scale.",
    },
    {
      title: "Every bakery is different",
      description:
        "Each Gail's is designed to reflect its neighbourhood. There's creative freedom in how each location looks, feels, and operates.",
    },
    {
      title: "Baking is taken seriously",
      description:
        "This isn't factory production. Gail's invests in long fermentation, proper technique, and training. Bakers here are genuine craftspeople.",
    },
    {
      title: "Rapid expansion = opportunity",
      description:
        "With 10–15 new bakeries opening per year, there's a constant flow of new management, operations, and creative roles.",
    },
  ],
  values: [
    {
      emoji: "🍞",
      title: "Bread first",
      description:
        "Everything starts with the bread. Gail's obsession with quality ingredients and proper baking technique is the foundation of the entire brand.",
    },
    {
      emoji: "🏘️",
      title: "Neighbourhood spirit",
      description:
        "Each bakery is designed to be part of its local community. Staff are encouraged to know their regulars, support local suppliers, and make the space feel like home.",
    },
    {
      emoji: "🌱",
      title: "Sustainability & sourcing",
      description:
        "Gail's works directly with British farmers and millers, champions heritage grain varieties, and is committed to reducing food waste across every bakery.",
    },
    {
      emoji: "👩‍🍳",
      title: "Invest in people",
      description:
        "From apprentice bakers to general managers, Gail's runs structured training programmes and promotes heavily from within. Many area managers started behind the counter.",
    },
  ],
  perks: [
    "Free bread & pastries daily",
    "50% staff discount",
    "Tips shared fairly",
    "Structured training programmes",
    "Career progression pathways",
    "Pension scheme",
    "28 days holiday",
    "Wellbeing support",
    "Cycle to work scheme",
    "Team events & bake-offs",
  ],
  popularRoles: [
    "Baker",
    "Barista",
    "General Manager",
    "Assistant Manager",
    "Kitchen Porter",
    "Area Manager",
    "Supply Chain Planner",
    "Marketing Coordinator",
  ],
};

const CompanyGails = () => <CompanyCultureProfile data={gailsData} />;

export default CompanyGails;
