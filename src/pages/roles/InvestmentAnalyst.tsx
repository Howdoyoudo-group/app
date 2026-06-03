import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, LineChart } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: LineChart, roles: [
    { name: "Investment Analyst (Graduate)", description: "Modelling, research and writing on a sector or asset class. CFA Level 1 expected within year one.", salary: "£45k–£60k + bonus" },
    { name: "Equity / Credit Research Associate", description: "Sell-side bank role supporting senior analysts on stock or bond coverage.", salary: "£55k–£75k + bonus" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Senior Analyst (CFA Charterholder)", description: "Owns coverage of names / sectors, makes buy / sell recommendations.", salary: "£80k–£140k + bonus" },
    { name: "Portfolio Manager (Junior)", description: "Begins running money - typically a sleeve of a larger fund or private mandate.", salary: "£90k–£160k + bonus" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Portfolio Manager", description: "Full P&L for a fund or mandate - accountable to investors for performance.", salary: "£150k–£400k+ (incl. perf. bonus)" },
    { name: "Head of Sector Research", description: "Leads a team of analysts covering a sector - equity, fixed income or credit.", salary: "£180k–£350k+" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "CIO (Chief Investment Officer)", description: "Owns the firm's overall investment strategy, asset allocation and risk.", salary: "£300k–£800k+" },
    { name: "Founder / Partner - Hedge Fund or Asset Manager", description: "Equity and carry - top end can be uncapped depending on AUM and performance.", salary: "£500k–£10m+" },
  ]},
];

const podcasts = [
  { title: "Money Maze Podcast", description: "In-depth interviews with leading investors, fund managers and asset allocators.", url: "https://www.moneymazepodcast.com/" },
  { title: "Invest Like the Best", description: "Patrick O'Shaughnessy on how the world's best investors think and operate.", url: "https://joincolossus.com/episodes/" },
  { title: "Bloomberg Odd Lots", description: "Markets, macro and money - required listening for anyone in investing.", url: "https://www.bloomberg.com/podcasts/series/odd-lots" },
];

const articles = [
  { title: "Financial Times - Markets", source: "FT", url: "https://www.ft.com/markets" },
  { title: "Citywire Wealth Manager", source: "Citywire", url: "https://citywire.com/" },
  { title: "Investors' Chronicle", source: "Investors' Chronicle", url: "https://www.investorschronicle.co.uk/" },
];

const InvestmentAnalyst = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Investment Analyst" data={{
        summary: "Investment analysts research markets, companies and assets to inform portfolio decisions. They sit on the buy-side (asset managers, hedge funds, pension funds) or sell-side (investment banks). It's the standard graduate path into running money - most portfolio managers and CIOs started here. The CFA Charter is the global gold-standard qualification.",
        dayToDay: ["Building financial models - DCF, comps, scenario analysis", "Reading company reports, broker notes and macro research", "Meeting management teams and industry experts", "Writing investment cases for the IC (investment committee)", "Monitoring positions and updating views post-results", "Studying for CFA exams (years 1–3 typically)"],
        skills: ["Financial Modelling (Excel)", "Valuation (DCF, multiples, sum-of-parts)", "Sector Knowledge", "Bloomberg / Refinitiv", "CFA Curriculum (3 levels)", "Written Research"],
        traits: ["Genuinely curious about businesses and markets", "Comfortable with quantitative work", "Independent thinker - consensus pays badly", "Long attention span - research is slow, careful work"],
        salary: "£45k grad → £10m+ partner-track",
        entryTip: "Routes in: Top-tier graduate - economics, maths, engineering or finance from a Russell Group / Oxbridge background. Apply to summer internships in penultimate year at Goldman Sachs, JP Morgan, Morgan Stanley, BlackRock, Schroders, M&G, Baillie Gifford. CFA Level 1 in your final year is a strong differentiator.",
      }} />
      <CareerMap title="Investment Career Path" subtitle="From graduate analyst to CIO or fund founder." stages={careerStages} industry="money" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="investment-analyst" roleName="Investment Analyst" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Money" searchQuery="CFA UK Society investment conference London" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live investment analyst and PM roles across the UK.</p><Link to="/marketplace?role=investment-analyst#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Investment Jobs</Link></div><IndustryCVBuilder industry="Money" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Investment Analyst" description="Researching markets, companies and assets to inform portfolio decisions for funds, banks and asset managers." tabs={tabs} category="business" />;
};

export default InvestmentAnalyst;
