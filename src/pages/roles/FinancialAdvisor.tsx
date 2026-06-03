import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, PoundSterling } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: PoundSterling, roles: [
    { name: "Paraplanner", description: "Supports advisors with research, suitability reports and compliance. Common route into advice.", salary: "£28k–£38k" },
    { name: "Trainee Financial Advisor", description: "Studying towards Diploma in Regulated Financial Planning (Level 4) on a sponsored route.", salary: "£28k–£35k + bonus" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Financial Advisor (Diploma qualified)", description: "Authorised to advise on pensions, investments, protection and mortgages.", salary: "£45k–£70k OTE" },
    { name: "Independent Financial Advisor (IFA)", description: "Whole-of-market - works across all providers rather than a tied panel.", salary: "£55k–£90k OTE" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Chartered Financial Planner", description: "CII Chartered status - the gold standard for UK advice. Top 1% of advisors.", salary: "£75k–£140k OTE" },
    { name: "Senior Wealth Planner / Partner", description: "Owns a high-value client book within a wealth firm or partner-led practice (e.g. SJP).", salary: "£100k–£200k+ OTE" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head of Advice / Practice Principal", description: "Runs an advice practice - compliance, recruitment, P&L.", salary: "£120k–£250k" },
    { name: "Director of Financial Planning", description: "Group-level - sets advice strategy across a national firm.", salary: "£180k–£400k+" },
  ]},
];

const podcasts = [
  { title: "The Money Marketing Podcast", description: "The UK financial advice industry's main podcast - regulation, advice trends and IFA voices.", url: "https://www.moneymarketing.co.uk/podcast/" },
  { title: "Citywire Wealth Manager Podcast", description: "Conversations with the UK's top wealth managers and IFAs.", url: "https://citywire.com/wealth-manager/podcasts" },
];

const articles = [
  { title: "Money Marketing", source: "Money Marketing", url: "https://www.moneymarketing.co.uk/" },
  { title: "Professional Adviser", source: "Professional Adviser", url: "https://www.professionaladviser.com/" },
  { title: "FT Adviser", source: "Financial Times", url: "https://www.ftadviser.com/" },
];

const FinancialAdvisor = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Financial Advisor" data={{
        summary: "Financial advisors help individuals and families plan their money - pensions, investments, protection, retirement and intergenerational wealth. It's a regulated profession governed by the FCA, requiring Level 4 Diploma qualification minimum. The UK has ~37,000 advisors and demand significantly outstrips supply - average client age is 60+ and a major succession opportunity is opening up.",
        dayToDay: ["Client meetings - understanding goals and circumstances", "Building financial plans across pensions, ISAs, investments, protection", "Suitability reports and product recommendations", "Liaising with platforms, providers and tax specialists", "Annual reviews and portfolio rebalancing", "Compliance, file checks and CPD"],
        skills: ["Pensions (DC, DB, SIPP)", "Investment Planning (ISA, GIA, Onshore/Offshore)", "Tax Planning", "Cashflow Modelling", "Client Communication", "Regulatory Compliance (FCA / CII)"],
        traits: ["Genuine interest in people's lives, not just their money", "Patient teacher - most clients aren't financially literate", "Commercially driven - advice is a business", "High integrity - fiduciary duty to clients"],
        salary: "£28k trainee → £400k+ partner / director",
        entryTip: "Routes in: Many start as Paraplanners while studying for the CII Diploma in Regulated Financial Planning (Level 4 - minimum to advise). Sponsored academy routes at SJP, Quilter, Openwork, M&G Wealth, Brewin Dolphin and the major banks. Apprenticeship route (Level 4 Financial Adviser) also available.",
      }} />
      <CareerMap title="Financial Advice Career Path" subtitle="From paraplanner to chartered planner or practice principal." stages={careerStages} industry="money" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="financial-advisor" roleName="Financial Advisor" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Money" searchQuery="financial planning conference UK CII PFS" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live financial advisor and paraplanner roles across the UK.</p><Link to="/marketplace?role=financial-advisor#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Advisor Jobs</Link></div><IndustryCVBuilder industry="Money" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Financial Advisor" description="Helping individuals plan their savings, pensions and investments - a regulated, advice-led role across banks and IFAs." tabs={tabs} category="craft" />;
};

export default FinancialAdvisor;
