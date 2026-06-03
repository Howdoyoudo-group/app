import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-ocado-cover.jpg";

const ocadoData: CompanyCultureData = {
  slug: "ocado-group",
  name: "Ocado Group",
  tagline: "A technology company solving the world's hardest logistics problems - disguised as a grocer.",
  industry: "Grocery",
  industrySlug: "grocery",
  coverImage,
  videoUrl: "https://www.youtube.com/watch?v=LslIg1bK0uI",
  website: "https://www.ocadogroup.com",
  careersUrl: "https://careers.ocadogroup.com/",
  founded: "2000",
  hq: "Hatfield, Hertfordshire",
  employees: "16,000+ (Group-wide, incl. JV operations)",
  sectors: ["Grocery", "Technology", "Robotics", "Logistics", "E-Commerce"],
  glassdoor: 3.3,
  about: [
    "Ocado was founded in 2000 by three former Goldman Sachs bankers - Tim Steiner, Jonathan Faiman, and Jason Gissing - who believed the internet would fundamentally change how people buy groceries. Unlike traditional supermarkets bolting on a website, Ocado was built online-first from day one.",
    "The company operates the UK's largest dedicated online grocery business through a joint venture with M&S, delivering over 400,000 orders per week from its Customer Fulfilment Centres (CFCs). But Ocado's real story is its technology division, Ocado Technology.",
    "Ocado's proprietary warehouse automation - featuring thousands of robots navigating an aluminium grid at speed - is now licensed to major grocers worldwide including Kroger (US), Coles (Australia), Aeon (Japan), and Lotte (South Korea). The Ocado Smart Platform combines robotics, AI, machine learning, and cloud computing into a full-stack grocery logistics solution.",
    "Listed on the London Stock Exchange (LSE: OCDO), Ocado sits at the intersection of retail, deep tech, and supply chain innovation. It's one of the few UK companies building genuinely world-leading robotics technology.",
  ],
  whyWorkHere: [
    {
      title: "Tech company, grocery wrapper",
      description:
        "Ocado invests hundreds of millions in R&D. Engineers here work on swarm robotics, computer vision, and warehouse simulation - not just putting apples in bags.",
    },
    {
      title: "Real-world robotics at scale",
      description:
        "This isn't lab-stage research. Ocado's bots are live in fulfilment centres across four continents, picking millions of items per week. You'll build things that actually run.",
    },
    {
      title: "Global licensing, UK roots",
      description:
        "While HQ is in Hertfordshire, the technology is deployed globally. Teams work with international retail partners to localise and scale the Ocado Smart Platform.",
    },
    {
      title: "Solve genuinely hard problems",
      description:
        "Optimising the pick-and-pack of 50,000+ SKUs in real time, routing hundreds of delivery vans, predicting demand for perishable goods - the complexity here is exceptional.",
    },
  ],
  values: [
    {
      emoji: "🤖",
      title: "Technology changes everything",
      description:
        "Ocado believes that better technology leads to better outcomes - for customers, partners, and the planet. Innovation isn't a department; it's the business model.",
    },
    {
      emoji: "📦",
      title: "Obsess over the last mile",
      description:
        "Getting the right groceries to the right door at the right time, every time. Ocado sweats the logistics details that other companies treat as someone else's problem.",
    },
    {
      emoji: "🌍",
      title: "Reduce food waste",
      description:
        "By predicting demand with AI and picking to order (not to shelf), Ocado achieves food waste rates far below traditional supermarkets. Technology serves sustainability.",
    },
    {
      emoji: "🧠",
      title: "Intellectual curiosity",
      description:
        "The culture rewards people who ask 'what if' and 'why not'. From simulation engineers to data scientists, Ocado hires thinkers who enjoy unsolved problems.",
    },
  ],
  perks: [
    "Ocado grocery discount",
    "Share save scheme",
    "Hybrid working (tech roles)",
    "Private medical insurance",
    "Enhanced parental leave",
    "Annual bonus scheme",
    "Cycle to work scheme",
    "Mental health & wellbeing support",
    "Learning & development budget",
    "Free on-site parking (Hatfield)",
  ],
  popularRoles: [
    "Software Engineer",
    "Robotics Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Supply Chain Analyst",
    "Product Manager",
    "DevOps / Platform Engineer",
    "Warehouse Operations Manager",
  ],
};

const CompanyOcado = () => <CompanyCultureProfile data={ocadoData} />;

export default CompanyOcado;
