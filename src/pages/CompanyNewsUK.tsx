import CompanyCultureProfile from "@/components/CompanyCultureProfile";
import type { CompanyCultureData } from "@/components/CompanyCultureProfile";
import coverImage from "@/assets/company-news-uk-cover.jpg";

const data: CompanyCultureData = {
  slug: "news-uk",
  name: "News UK",
  tagline: "Home of The Times, The Sunday Times, The Sun, and TalkTV.",
  industry: "Journalism",
  industrySlug: "journalism",
  coverImage,
  website: "https://www.news.co.uk",
  careersUrl: "https://www.newscareers.co.uk",
  founded: "1785",
  hq: "London Bridge, UK",
  employees: "3,000–5,000",
  sectors: ["National Newspapers", "Digital News", "Broadcasting", "Podcasts", "Radio", "Subscriptions"],
  glassdoor: 3.6,
  about: [
    "News UK is one of Britain's most influential media companies, publishing The Times (founded 1785), The Sunday Times, and The Sun - three of the most-read titles in the English-speaking world. The company is part of Rupert Murdoch's News Corp.",
    "Beyond print, News UK has invested heavily in digital transformation. The Times and Sunday Times operate a successful subscriber model with over 500,000 digital subscribers, while The Sun reaches over 30 million monthly users. The company also operates TalkTV, Talk Radio, Times Radio, and Virgin Radio through its Wireless division.",
    "The London Bridge headquarters - known as The News Building - houses newsrooms, broadcast studios, podcast production facilities, and commercial teams under one roof. It's one of the largest media campuses in Europe.",
    "News UK offers careers spanning investigative journalism, data science, product engineering, commercial sales, marketing, and broadcast production. The company runs graduate schemes and apprenticeships, and has a strong record of developing talent across editorial and commercial functions.",
  ],
  whyWorkHere: [
    {
      title: "Iconic titles, real influence",
      description:
        "The Times has been setting the news agenda for over 230 years. Working here means your journalism reaches ministers, CEOs, and millions of readers.",
    },
    {
      title: "Multi-platform media",
      description:
        "From print to podcasts, video to radio - News UK isn't just newspapers. You'll work across digital, broadcast, and audio in an integrated newsroom.",
    },
    {
      title: "Investment in digital",
      description:
        "News UK has built one of the most successful paywall models in the world. The tech, product, and data teams here are genuinely world-class.",
    },
    {
      title: "Graduate & apprenticeship schemes",
      description:
        "Structured entry programmes across editorial, commercial, and technology - with mentoring, rotations, and real responsibility from day one.",
    },
  ],
  values: [
    {
      emoji: "📰",
      title: "Journalism that matters",
      description:
        "From investigations that change government policy to sports coverage watched by millions - News UK takes its editorial responsibility seriously.",
    },
    {
      emoji: "🚀",
      title: "Innovation & transformation",
      description:
        "The company has pivoted from print-first to digital-first, launching Times Radio, TalkTV, and a thriving podcast network. Change is constant and encouraged.",
    },
    {
      emoji: "🌍",
      title: "Reach & diversity of audience",
      description:
        "The Sun and The Times serve fundamentally different audiences - but both are market leaders. This breadth creates unique career variety.",
    },
    {
      emoji: "🎓",
      title: "Develop & promote talent",
      description:
        "Many of the UK's most prominent journalists, editors, and media executives began their careers at News UK titles. The alumni network is extraordinary.",
    },
  ],
  perks: [
    "Competitive salary & bonus",
    "Private medical insurance",
    "Generous pension scheme",
    "25 days holiday + bank holidays",
    "Free digital subscriptions to all titles",
    "On-site gym & wellness facilities",
    "Cycle to work scheme",
    "Enhanced parental leave",
    "Learning & development budget",
    "Staff social events & networking",
  ],
  popularRoles: [
    "Reporter",
    "Sub-Editor",
    "Digital Producer",
    "Broadcast Journalist",
    "Podcast Producer",
    "Commercial Manager",
    "Data Analyst",
    "Product Manager",
    "Marketing Executive",
    "Graduate Trainee",
  ],
};

const CompanyNewsUK = () => <CompanyCultureProfile data={data} />;

export default CompanyNewsUK;
