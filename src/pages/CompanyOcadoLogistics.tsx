import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-ocado-cover.jpg";

// Culture, values and benefits sourced directly from www.ocado-logistics.com
const ocadoLogisticsData: CompanyCultureData = {
  slug: "ocado-logistics",
  name: "Ocado Logistics",
  tagline:
    "Be a local legend - transforming the future of grocery deliveries and helping everyday moments flow.",
  industry: "Grocery",
  industrySlug: "grocery",
  coverImage,
  website: "https://www.ocado-logistics.com",
  careersUrl: "https://www.ocado-logistics.com/",
  founded: "2021",
  hq: "Hatfield, Hertfordshire",
  employees: "12,000+",
  sectors: ["Logistics", "Warehousing", "Last-Mile Delivery", "Grocery"],
  glassdoor: 3.0,
  about: [
    "Ocado Logistics is one of Ocado Group's founding divisions (2000), pioneering the 'last-mile delivery model' using branded vans and directly-employed drivers - and now operating as a distinct business running the fulfilment and delivery operation behind Ocado.com.",
    "Our network spans the whole country - Customer Fulfilment Centres (CFCs) and spokes across Hatfield, Dordon, Andover, Erith, Purfleet, Bristol, Luton, Bicester and beyond - combining industry-leading tech, fair pay and clear paths for progression.",
    "We're proud to be a Disability Confident employer and a supporter of the Armed Forces Covenant - prioritising inclusivity and equal opportunities for all. Whatever your background or story, you'll find a home at Ocado Logistics.",
  ],
  whyWorkHere: [
    {
      title: "Come and truly belong",
      description:
        "Join our inclusive workforce and feel heard, respected and valued as an integral team member.",
    },
    {
      title: "We've got your back",
      description:
        "Whether it's work-life balance, heavy lifting or support as you grow - we've got you.",
    },
    {
      title: "Become a career contender",
      description:
        "Whatever your aspirations, our training and internal mobility are designed to offer more opportunities and help you stretch your horizons.",
    },
    {
      title: "Big impact, every shift",
      description:
        "CFCs run on industry-leading robotics and our drivers serve communities across the UK - every team member plays an essential role in delivering for customers.",
    },
  ],
  values: [
    {
      emoji: "💜",
      title: "#deliver_joy",
      description:
        "Every order is someone's week of food - pride in delivering joy is the operational heartbeat across CFCs and the road.",
    },
    {
      emoji: "🤝",
      title: "Belonging",
      description:
        "A Great Place to Work-recognised culture where everyone - from any walk of life - can be their true self and feel safe, supported and heard.",
    },
    {
      emoji: "🛡️",
      title: "Safety first, always",
      description:
        "Working alongside automation and on the road means safety culture is non-negotiable across every site and every route.",
    },
    {
      emoji: "📈",
      title: "Career contenders",
      description:
        "Internal mobility is real - many shift managers and site leaders started as Personal Shoppers or drivers.",
    },
  ],
  perks: [
    "Up to 15% staff discount at Ocado.com + free deliveries Tue/Wed/Thu",
    "Smart Pass for £39.99 (55% saving)",
    "Pension auto-enrol at 4% matched, rising to 7% Enhanced after 3 months",
    "Free Shares - 0.5% of annual pay twice a year",
    "Help@Hand 24/7 Employee Assistance Programme",
    "Private Medical Insurance",
    "Life Insurance (core cover, top up to 8x salary)",
    "Group Income Protection (50%, top up to 66% or 77%)",
    "Car Salary Sacrifice (eco-friendly range, no deposit)",
    "Motor Breakdown Cover + Car Maintenance",
    "Cancer Screening + Partner Life Assurance",
    "Discount Plus - hundreds of retailers",
    "Technology Vouchers + Gym Membership (3,000+ gyms)",
    "Charitable Giving direct from salary",
  ],
  popularRoles: [
    "Personal Shopper (Warehouse Operative)",
    "Customer Service Team Member (Driver)",
    "Shift Manager",
    "Operations Manager",
    "Maintenance Engineer",
    "Reliability Engineer",
    "Health & Safety Advisor",
    "Transport Planner",
  ],
};

const CompanyOcadoLogistics = () => <CompanyCultureProfile data={ocadoLogisticsData} />;

export default CompanyOcadoLogistics;
