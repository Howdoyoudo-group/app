import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Briefcase } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Briefcase, roles: [
    { name: "Wealth Analyst / Investment Associate", description: "Supports senior managers with research, modelling and client portfolio admin.", salary: "£35k–£50k + bonus" },
    { name: "Graduate Wealth Trainee", description: "Two-year sponsored programme through CISI / CFA exams at firms like Rothschild, Coutts, JPM.", salary: "£40k–£55k + bonus" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Wealth Manager (CISI Diploma / CFA L2+)", description: "Owns a portfolio of HNW clients - investment, tax, structuring, lifestyle planning.", salary: "£70k–£120k + bonus" },
    { name: "Investment Manager", description: "Discretionary portfolio management on behalf of HNW and family-office clients.", salary: "£75k–£140k + bonus" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Wealth Manager", description: "£100m+ AUM book, lead on multi-generational planning and complex structures.", salary: "£140k–£250k + bonus" },
    { name: "Director of Private Wealth", description: "Owns relationships with UHNW (£10m+) clients - often international and trust-based.", salary: "£200k–£400k + bonus" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head of Private Wealth (UK)", description: "Leads a team of wealth managers and the regional P&L.", salary: "£300k–£600k+" },
    { name: "CEO Wealth Division", description: "Group-level - runs a private bank or wealth manager (Coutts, Rathbones, Quilter).", salary: "£500k–£2m+ (incl. equity)" },
  ]},
];

const podcasts = [
  { title: "Citywire Wealth Manager Podcast", description: "The UK's wealth management trade publication's official podcast.", url: "https://citywire.com/wealth-manager/podcasts" },
  { title: "Money Maze Podcast", description: "Conversations with the world's top investors, fund managers and wealth leaders.", url: "https://www.moneymazepodcast.com/" },
];

const articles = [
  { title: "Citywire Wealth Manager", source: "Citywire", url: "https://citywire.com/wealth-manager" },
  { title: "Spear's Magazine", source: "Spear's", url: "https://spearswms.com/" },
  { title: "Financial Times - Wealth", source: "FT", url: "https://www.ft.com/wealth-management" },
];

const WealthManager = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Wealth Manager" data={{
        summary: "Wealth managers look after the financial lives of high-net-worth (£1m+) and ultra-high-net-worth (£10m+) clients. The role blends investment management, tax planning, intergenerational wealth structuring and old-fashioned relationship building. UK private banks and wealth firms - Coutts, Rothschild, Rathbones, Brewin Dolphin, Cazenove, JPM Private Bank - are among the most sought-after employers in financial services.",
        dayToDay: ["Client meetings - strategy, performance, life events", "Portfolio construction and rebalancing", "Tax-efficient structuring (trusts, EIS, VCT, pensions)", "Liaising with lawyers, accountants and family offices", "Investment research and manager selection", "Compliance, KYC and onboarding new HNW clients"],
        skills: ["Portfolio Construction", "Tax & Estate Planning", "Trust Structures", "Investment Research", "Client Relationship Management", "FCA Compliance (CISI / CFA)"],
        traits: ["Trust-builder - clients hand over their life's wealth", "Discreet and emotionally intelligent", "Strong commercial instincts", "Long-game patient - relationships span decades and generations"],
        salary: "£35k associate → £2m+ CEO",
        entryTip: "Routes in: Top of class graduate - typically economics, finance, maths or law from a strong UK university. Two-year graduate schemes at JP Morgan Private Bank, Goldman Sachs, Rothschild, Coutts, Rathbones and Brewin Dolphin. CISI Investment Advice Diploma + CFA Level 2/3 are the standard credentials.",
      }} />
      <CareerMap title="Wealth Management Career Path" subtitle="From analyst to CEO of a private bank." stages={careerStages} industry="money" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="wealth-manager" roleName="Wealth Manager" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Money" searchQuery="wealth management conference London CISI Citywire" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live wealth manager and private banking roles across the UK.</p><Link to="/marketplace?role=wealth-manager#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Wealth Jobs</Link></div><IndustryCVBuilder industry="Money" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Wealth Manager" description="Looking after high-net-worth clients across investments, tax and intergenerational planning." tabs={tabs} category="craft" />;
};

export default WealthManager;
