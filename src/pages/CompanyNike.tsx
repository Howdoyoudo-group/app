import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-nike-cover.jpg";

const nikeData: CompanyCultureData = {
  slug: "nike",
  name: "Nike",
  tagline: "If you have a body, you are an athlete - and this is where sport meets career.",
  industry: "Footwear",
  industrySlug: "footwear",
  coverImage,
  website: "https://www.nike.com",
  careersUrl: "https://jobs.nike.com/",
  founded: "1964",
  hq: "Beaverton, Oregon",
  employees: "79,000+",
  sectors: ["Footwear", "Apparel", "Retail", "DTC", "Technology"],
  glassdoor: 4.0,
  about: [
    "Nike was founded as Blue Ribbon Sports in 1964 by Bill Bowerman and Phil Knight. What began as a handshake deal to import Japanese running shoes became the world's largest athletic brand, generating over $51 billion in annual revenue.",
    "The company's innovation engine is legendary - from the Waffle Trainer sole (made on an actual waffle iron) to Flyknit, Air Max, and the self-lacing Adapt. Nike doesn't just make shoes; it shapes how humans move.",
    "Beyond product, Nike has redefined sports marketing through athlete partnerships - Michael Jordan, Serena Williams, Cristiano Ronaldo - and culturally charged campaigns like 'Just Do It' and the Colin Kaepernick ad.",
    "The business operates through Nike Direct (its own stores, apps, and SNKRS) and wholesale channels. Sub-brands include Jordan Brand, Converse, and Nike ACG. The company is headquartered at the sprawling World Headquarters campus in Beaverton, Oregon.",
  ],
  whyWorkHere: [
    {
      title: "World-class innovation culture",
      description:
        "Nike invests billions in R&D. Teams work with elite athletes, biomechanics labs, and materials scientists to push the boundaries of performance footwear and apparel.",
    },
    {
      title: "The campus is unlike anywhere else",
      description:
        "World HQ features Olympic-sized pools, running trails, basketball courts, and buildings named after athletes. It's a sports-obsessed campus that embodies the brand.",
    },
    {
      title: "Global scale, startup energy",
      description:
        "Despite its size, Nike encourages intrapreneurship. Teams like ISPA and Innovation Kitchen operate like skunkworks - fast, experimental, and permission-to-fail.",
    },
    {
      title: "Sport is the great equaliser",
      description:
        "Nike's mission centres on bringing inspiration and innovation to every athlete. The culture is competitive but inclusive - sport connects everyone here.",
    },
  ],
  values: [
    {
      emoji: "⚡",
      title: "Obsess over the athlete",
      description:
        "Every product decision starts with the athlete. Nike listens to runners, ballers, and yogis - then engineers solutions that make them faster, stronger, more comfortable.",
    },
    {
      emoji: "🔬",
      title: "Innovate relentlessly",
      description:
        "From Air to Flyknit to Forward - Nike doesn't iterate, it leaps. Failure is expected on the way to breakthrough.",
    },
    {
      emoji: "🌱",
      title: "Move to zero",
      description:
        "Nike's sustainability programme targets zero carbon and zero waste. Initiatives include Space Hippie (shoes from factory scraps) and Refurbished (reselling returned pairs).",
    },
    {
      emoji: "🏳️‍🌈",
      title: "Belong everywhere",
      description:
        "Nike invests in diversity, equity, and inclusion across hiring, product lines, and community programmes. The brand has a long history of standing behind social causes.",
    },
  ],
  perks: [
    "Generous product discounts",
    "On-campus fitness centres & sports leagues",
    "Summer Fridays",
    "Sabbatical programme",
    "Tuition reimbursement",
    "Relocation assistance",
    "Employee stock purchase plan",
    "Mental health & wellbeing support",
    "Parental leave (birth & adoptive)",
    "Volunteer time off",
  ],
  popularRoles: [
    "Footwear Designer",
    "Product Line Manager",
    "Software Engineer (Nike Digital)",
    "Supply Chain Analyst",
    "Retail Athlete (Store Associate)",
    "Brand Marketing Manager",
    "Materials Developer",
    "Data Scientist",
  ],
};

const CompanyNike = () => <CompanyCultureProfile data={nikeData} />;

export default CompanyNike;
