import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Home } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Home, roles: [
    { name: "Mortgage Administrator", description: "Supports advisors with documentation, lender submissions, and case progression.", salary: "£25k–£28k" },
    { name: "Trainee Mortgage Advisor", description: "Studies for CeMAP while learning the role under a qualified advisor.", salary: "£25k–£30k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Mortgage Advisor", description: "CeMAP-qualified, advises clients on mortgage and protection products.", salary: "£35k–£55k (OTE)" },
    { name: "Protection Advisor", description: "Specialises in life cover, critical illness, and income protection alongside mortgages.", salary: "£32k–£50k (OTE)" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Mortgage Advisor", description: "Handles complex cases, high-value clients, and self-employed borrowers.", salary: "£55k–£85k (OTE)" },
    { name: "Branch / Mortgage Manager", description: "Leads a team of advisors, owns lender relationships and compliance.", salary: "£55k–£80k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head of Mortgages", description: "Sets the mortgage strategy across an estate agency, broker or lender.", salary: "£80k–£120k" },
    { name: "Mortgage Broker / Founder", description: "Runs an independent brokerage - full ownership of clients and income.", salary: "Variable" },
  ]},
];

const podcasts = [
  { title: "The Mortgage Mum Podcast", description: "Sarah Tucker on the realities of building a mortgage advisory career.", url: "https://themortgagemum.co.uk/" },
  { title: "Mortgage Solutions Podcast", description: "Industry news, lender insights and broker interviews.", url: "https://www.mortgagesolutions.co.uk/" },
];

const articles = [
  { title: "Mortgage Solutions", source: "Mortgage Solutions", url: "https://www.mortgagesolutions.co.uk/" },
  { title: "Mortgage Strategy", source: "Mortgage Strategy", url: "https://www.mortgagestrategy.co.uk/" },
  { title: "FT Adviser", source: "FT Adviser", url: "https://www.ftadviser.com/" },
];

const MortgageAdvisor = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="mortgage-advisor" roleName="Mortgage Advisor" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Mortgage Advisor" data={{ summary: "Mortgage advisors help buyers find and secure the right mortgage - from first-time buyers to remortgages, buy-to-let and complex cases. It's a regulated, advice-led role inside estate agencies, banks, and independent brokers, with strong earnings tied to the volume and quality of deals you complete.", dayToDay: ["Meeting clients to assess affordability and goals", "Researching lenders and recommending the right product", "Submitting applications and managing cases through to completion", "Cross-selling protection (life, critical illness, income)", "Keeping CPD and FCA compliance up to date", "Building referral pipelines from agents and past clients"], skills: ["Mortgage & Protection Products", "Affordability & Underwriting", "Client Advice", "FCA Compliance", "CRM & Sourcing Systems (Trigold, Twenty7Tec)", "Lender Relationships"], traits: ["Trustworthy - clients are making the biggest financial decision of their lives", "Numerate and detail-oriented", "Resilient - deals can fall through, lenders change criteria overnight", "Commercial - earnings track closely to deal volume"], salary: "£35k–£55k OTE", entryTip: "You must hold CeMAP (Certificate in Mortgage Advice and Practice) to give regulated mortgage advice in the UK. Many start in estate agency or as administrators while studying. Estate agency groups (Connells, Countrywide) and brokers (John Charcol, L&C) all run trainee schemes." }} /><CareerMap title="Mortgage Advisor Career Path" subtitle="" stages={careerStages} industry="estate-agency" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Estate Agency" searchQuery="mortgage broker conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live mortgage advisor roles across UK estate agencies and brokers.</p><Link to="/marketplace?industry=estate-agency#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Property Jobs</Link></div><IndustryCVBuilder industry="Estate Agency" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Mortgage Advisor" description="Helping buyers find and secure the right mortgage - a regulated, advice-led role inside estate agencies, banks, and brokers." tabs={tabs} category="craft" />;
};

export default MortgageAdvisor;
