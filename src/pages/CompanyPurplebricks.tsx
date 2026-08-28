import CompanyCultureProfile, { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-purplebricks-cover.jpg";

const data: CompanyCultureData = {
  slug: "purplebricks",
  name: "Purplebricks",
  tagline: "The hybrid online estate agent that rewrote the rules on selling your home.",
  industry: "Estate Agency",
  industrySlug: "estate-agency",
  coverImage,
  website: "https://www.purplebricks.co.uk",
  careersUrl: "https://purplebricks.bamboohr.com/careers",
  founded: "2014",
  hq: "Solihull",
  employees: "500+",
  sectors: ["Online Estate Agency", "PropTech", "Lettings", "Valuations"],
  glassdoor: 3.1,
  trustpilot: 3.9,
  about: [
    "Purplebricks launched in 2014 with a simple, provocative idea: why should selling your home cost thousands in commission? By offering a fixed-fee model and pairing local property experts with a digital-first platform, the company grew faster than any estate agency in UK history.",
    "Backed by heavy TV advertising and a slick online experience, Purplebricks reached a peak market cap of over £1 billion. The model proved that consumers were ready for an alternative to traditional high-street agents - even if the journey wasn't always smooth.",
    "Now operating under the Strike brand, the business continues to evolve. The core mission remains: make moving home simpler, more transparent, and radically more affordable. For anyone interested in where property meets technology, Purplebricks is one of the most important case studies in UK real estate.",
  ],
  whyWorkHere: [
    {
      title: "Disruptor DNA",
      description: "You'll work inside a company that genuinely challenged one of the UK's most entrenched industries. That appetite for doing things differently runs through every team.",
    },
    {
      title: "Tech meets property",
      description: "Purplebricks sits at the intersection of PropTech and traditional estate agency - meaning you'll use modern tools to solve real-world property problems.",
    },
    {
      title: "Flexible working",
      description: "Local Property Experts work from their territory, not from an office. HQ and tech roles offer remote and hybrid options, reflecting the company's digital-first culture.",
    },
    {
      title: "Real career variety",
      description: "From product engineering and data science to on-the-ground valuations and customer service - the range of roles is far broader than a traditional agency.",
    },
  ],
  values: [
    {
      emoji: "🏡",
      title: "Customer obsession",
      description: "Every decision starts with the home mover. The fixed-fee model exists because customers deserved a fairer deal, and that mindset hasn't changed.",
    },
    {
      emoji: "⚡",
      title: "Move fast, learn faster",
      description: "Purplebricks scaled at startup speed in a centuries-old industry. The culture rewards pace, experimentation, and learning from what doesn't work.",
    },
    {
      emoji: "🔍",
      title: "Transparency",
      description: "No hidden fees, no small print. The same principle applies internally - open communication, honest feedback, and clarity on what matters.",
    },
    {
      emoji: "🤝",
      title: "Local expertise, national scale",
      description: "Property is hyperlocal but the platform is national. The company values deep local knowledge delivered through a consistent, tech-enabled experience.",
    },
  ],
  perks: [
    "Remote & hybrid working",
    "Competitive base salary",
    "Performance bonuses",
    "25 days holiday + bank holidays",
    "Pension scheme",
    "Employee assistance programme",
    "Training & development budget",
    "Company laptop & phone",
    "Cycle to work scheme",
    "Team socials & away days",
  ],
  popularRoles: [
    "Local Property Expert",
    "PropTech Product Manager",
    "Software Engineer",
    "Customer Experience Advisor",
    "Data Analyst",
    "Marketing Manager",
    "Lettings Coordinator",
    "UX Designer",
  ],
};

const CompanyPurplebricks = () => <CompanyCultureProfile data={data} />;

export default CompanyPurplebricks;
