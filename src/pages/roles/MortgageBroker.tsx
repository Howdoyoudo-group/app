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
    { name: "Mortgage Administrator", description: "Case packaging, lender liaison, supporting brokers - common entry route.", salary: "£25k–£30k" },
    { name: "Trainee Broker (CeMAP studying)", description: "Working towards Certificate in Mortgage Advice & Practice on a sponsored route.", salary: "£26k–£32k + commission" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Mortgage Broker (CeMAP qualified)", description: "Full advice - first-time buyers, remortgages, BTL across whole-of-market lenders.", salary: "£40k–£70k OTE" },
    { name: "Specialist Broker (BTL / Adverse / Bridging)", description: "Niche expertise - complex cases, higher loan sizes, specialist lenders.", salary: "£55k–£100k+ OTE" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Broker / Team Lead", description: "Top performer with own client book, mentors juniors and handles complex cases.", salary: "£75k–£140k OTE" },
    { name: "Protection & Insurance Specialist", description: "Adds life cover, CIC and income protection to mortgage cases - boosts OTE significantly.", salary: "£70k–£130k OTE" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head of Mortgages / Practice Principal", description: "Runs the broker team - recruitment, compliance, lender relationships, P&L.", salary: "£100k–£200k" },
    { name: "Network / Brokerage Founder", description: "Owns the firm - equity, AR fees, lender override commissions.", salary: "£150k–£500k+ (drawings)" },
  ]},
];

const podcasts = [
  { title: "The Mortgage Mum Podcast", description: "Sarah Tucker's UK mortgage industry podcast - broker stories, lender insight and career conversations.", url: "https://themortgagemum.co.uk/podcast/" },
  { title: "Mortgage Strategy Podcast", description: "The UK mortgage trade press's official podcast on market trends and broker practice.", url: "https://www.mortgagestrategy.co.uk/" },
];

const articles = [
  { title: "Mortgage Strategy", source: "Mortgage Strategy", url: "https://www.mortgagestrategy.co.uk/" },
  { title: "Mortgage Solutions", source: "Mortgage Solutions", url: "https://www.mortgagesolutions.co.uk/" },
  { title: "FT Adviser - Mortgages", source: "FT Adviser", url: "https://www.ftadviser.com/mortgages/" },
];

const MortgageBroker = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Mortgage Broker" data={{
        summary: "Mortgage brokers source the right home loan for clients across the whole UK lending market - high-street banks, building societies and specialist lenders. The job blends regulated advice, sales skill and detailed product knowledge. CeMAP (Certificate in Mortgage Advice and Practice) is the entry qualification. Demand is high - first-time buyers and remortgagors increasingly use brokers rather than going direct.",
        dayToDay: ["Fact-finding with new clients - income, deposit, plans", "Researching products across 90+ UK lenders", "Submitting decisions in principle and full applications", "Liaising with lenders, solicitors and estate agents through to completion", "Selling protection (life, CIC, income protection) alongside the mortgage", "Maintaining CPD and FCA compliance"],
        skills: ["Mortgage Product Knowledge", "Regulated Advice (CeMAP)", "Affordability Assessment", "Lender Criteria Navigation", "Client Communication", "Protection / Insurance Sales"],
        traits: ["Resilient - chains break, completion dates slip", "Patient - buying a home is stressful for clients", "Numerate and detail-oriented", "Commercially driven - most income is commission"],
        salary: "£26k trainee → £500k+ brokerage owner",
        entryTip: "Routes in: Apply directly to brokerages (John Charcol, L&C, Habito, SPF Private Clients, Coreco) or estate agency in-house teams (Connells, Countrywide). Most sponsor your CeMAP qualification. Pure trainee routes also exist via the major lenders' graduate schemes (Nationwide, Halifax).",
      }} />
      <CareerMap title="Mortgage Broker Career Path" subtitle="From admin to brokerage owner." stages={careerStages} industry="money" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="mortgage-broker" roleName="Mortgage Broker" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Money" searchQuery="mortgage broker conference UK Mortgage Business Expo" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live mortgage broker and advisor roles across the UK.</p><Link to="/marketplace?role=mortgage-broker#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Broker Jobs</Link></div><IndustryCVBuilder industry="Money" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Mortgage Broker" description="Sourcing the right home loan for clients across high-street and specialist lenders." tabs={tabs} category="craft" />;
};

export default MortgageBroker;
