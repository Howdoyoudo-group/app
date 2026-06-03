import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-timberland-cover.jpg";

const timberlandData: CompanyCultureData = {
  slug: "timberland",
  name: "Timberland",
  tagline: "Built for the trail, worn on the street - rugged heritage meets modern purpose.",
  industry: "Footwear",
  industrySlug: "footwear",
  coverImage,
  website: "https://www.timberland.co.uk",
  careersUrl: "https://vfrightfit.wd5.myworkdayjobs.com/en-US/VFCorporation",
  founded: "1973",
  hq: "Stratham, New Hampshire",
  employees: "5,500+",
  sectors: ["Footwear", "Outdoor", "Apparel", "Sustainability"],
  glassdoor: 3.8,
  about: [
    "Timberland was born in 1973 when Sidney Swartz introduced injection-moulding technology to create truly waterproof leather boots. The original yellow boot - later known simply as 'Timbs' - became one of the most iconic silhouettes in footwear history.",
    "What started as New England workwear was embraced by hip-hop culture in the 1990s, worn by Wu-Tang Clan, Notorious B.I.G., and Aaliyah. That crossover from function to fashion cemented Timberland as a cultural staple that transcends any single category.",
    "Today, Timberland is part of VF Corporation (alongside The North Face, Vans, and Dickies) and generates over $1.8 billion in annual revenue. The business spans boots, shoes, apparel, and accessories across 85+ countries.",
    "Timberland has also become a leader in sustainable innovation - its GreenStride soles use bio-based materials, the TimberlandLoop programme accepts returned boots for recycling, and the brand has planted over 50 million trees worldwide.",
  ],
  whyWorkHere: [
    {
      title: "Purpose-driven at the core",
      description:
        "Timberland's mission is to equip people to make a difference in the world. Sustainability isn't a department - it's baked into product, supply chain, and community programmes.",
    },
    {
      title: "Part of the VF Corporation family",
      description:
        "As a VF brand, you get the backing of a $11B company with world-class supply chain, retail, and technology infrastructure - plus mobility across sister brands.",
    },
    {
      title: "Culture meets counterculture",
      description:
        "Timberland has been adopted by hikers, builders, MCs, and fashion editors. Working here means serving a community that's impossibly diverse and fiercely loyal.",
    },
    {
      title: "Outdoor days built into the culture",
      description:
        "Employees get paid 'Path of Service' hours to volunteer outdoors. Tree planting, trail building, and greening projects are part of the working calendar.",
    },
  ],
  values: [
    {
      emoji: "🌳",
      title: "Nature needs heroes",
      description:
        "Timberland's rallying cry. The company is committed to a net-positive impact on nature - planting trees, regenerating farmland, and sourcing responsibly.",
    },
    {
      emoji: "🥾",
      title: "Built to last, built to return",
      description:
        "Products are designed for durability and end-of-life recycling. The TimberlandLoop programme takes back worn boots and gives them new life.",
    },
    {
      emoji: "✊",
      title: "Community first",
      description:
        "From the Bronx to rural New Hampshire, Timberland invests in the communities where its products are worn - through volunteering, grants, and partnerships.",
    },
    {
      emoji: "🔄",
      title: "Circularity by design",
      description:
        "GreenStride soles, recycled fabrics, regenerative leather - Timberland is redesigning its entire supply chain around circular principles.",
    },
  ],
  perks: [
    "Generous product discounts across VF brands",
    "Paid volunteer hours (Path of Service)",
    "Flexible & hybrid working",
    "401(k) with company match (US) / pension (UK)",
    "Tuition reimbursement",
    "Wellness programmes",
    "Employee resource groups",
    "Outdoor team experiences",
    "Parental leave",
    "Career mobility across VF brands",
  ],
  popularRoles: [
    "Footwear Designer",
    "Materials Innovation Specialist",
    "Sustainability Manager",
    "Digital Marketing Manager",
    "Supply Chain Planner",
    "Retail Store Manager",
    "Product Line Manager",
    "Merchandiser",
  ],
};

const CompanyTimberland = () => <CompanyCultureProfile data={timberlandData} />;

export default CompanyTimberland;
