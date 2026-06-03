import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-ocado-cover.jpg";

// Culture, values and benefits sourced directly from careers.ocadoretail.com
const ocadoRetailData: CompanyCultureData = {
  slug: "ocado-retail",
  name: "Ocado Retail",
  tagline:
    "Drivers of change - proudly and sustainably delivering joy in every shop, through unbeatable choice, unrivalled service and reassuringly good value.",
  industry: "Grocery",
  industrySlug: "grocery",
  coverImage,
  website: "https://www.ocado.com",
  careersUrl: "https://careers.ocadoretail.com/",
  founded: "2020",
  hq: "Hatfield, Hertfordshire (Apollo Court) + Customer Hub, Sunderland",
  employees: "2,500+",
  sectors: ["Grocery", "E-Commerce", "Retail", "FMCG"],
  glassdoor: 3.4,
  about: [
    "Ocado Retail (ORL) is a market-leading joint venture between Ocado Group and M&S Group, running the UK's largest pure-play online supermarket.",
    "ORL's vision is to \"never stop making our customers' lives better, by delivering the supermarket of tomorrow, today\" - serving around 50,000 products including the huge Ocado Own Range, big and small brands, and M&S (the only place to shop M&S online), plus Zoom by Ocado for 60-minute deliveries.",
    "Teams span Commercial (Buying, Own Brand, Sustainability), CFO Teams (Finance, Ops, Tech, Zoom, Data & Insights), Customer (Brand, Digital Marketing, EAT Creative, E-commerce), Supporting Functions, and the Sunderland-based Customer Hub.",
  ],
  whyWorkHere: [
    {
      title: "Unbeatable choice",
      description:
        "Around 50,000 products - bigger than any other supermarket - including the award-winning Ocado Own Range, leading brands, and the only online home for M&S Food.",
    },
    {
      title: "Unrivalled service",
      description:
        "Delivery slots on the hour and half hour from 5:30am to midnight, next-to-no substitutions, and the shop-from-anywhere app - making customers' lives just that bit easier.",
    },
    {
      title: "Grow your career, your way",
      description:
        "Career Management Principles: driven by you, supported by your manager, backed by ORL - with Walnut, the internal learning platform, and external career coaching.",
    },
    {
      title: "Graduate scheme & entry routes",
      description:
        "Responsibility from day one on the graduate scheme, plus internships and entry roles for an exciting first step into retail within a fast-growing business.",
    },
  ],
  values: [
    {
      emoji: "🔍",
      title: "Always be curious",
      description:
        "We aim to understand our customers better than anyone else. We ask why and we keep on learning.",
    },
    {
      emoji: "✨",
      title: "Bring our best selves",
      description:
        "A unique lot of individuals who turn up ready to give our best each day. We take ownership and we deliver together.",
    },
    {
      emoji: "🚀",
      title: "Challenge what's possible",
      description:
        "Together we are drivers of change - delivering the supermarket of tomorrow, today. We raise the bar and we never give up.",
    },
    {
      emoji: "🛒",
      title: "Reassuringly good value",
      description:
        "Ocado Own Range, the Big Price Drop and the Ocado Price Promise (matched like-for-like to tesco.com, including Clubcard prices) - week in, week out.",
    },
  ],
  perks: [
    "26 days holiday + 8 flexible Bank Holidays (option to buy 5 more)",
    "Hybrid working - 3 days a week together in person",
    "Ocado Bonus Plan (personal + business objectives)",
    "Pension matched up to 7%",
    "Private medical insurance (company-paid, family add-on at corporate rates)",
    "Life assurance - 4x salary",
    "Income protection (50%, top up to 66.7% or 75%)",
    "15% off Ocado from day 1 + 20% off M&S after probation",
    "Family policies: Primary & Secondary Carer Support + Fertility Policy",
    "Digital GP - unlimited video consultations",
    "Pick 'n' Mix flexible benefits platform",
  ],
  popularRoles: [
    "Buyer / Trading Manager",
    "Brand & Marketing Manager",
    "Digital Product Manager",
    "CRM Manager",
    "Merchandiser",
    "Data & Insights Analyst",
    "EAT Creative",
    "Customer Hub Frontline Advisor (Sunderland)",
  ],
};

const CompanyOcadoRetail = () => <CompanyCultureProfile data={ocadoRetailData} />;

export default CompanyOcadoRetail;
