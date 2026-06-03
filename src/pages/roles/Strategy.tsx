import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Target, TrendingUp, BarChart3, Compass } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const industryExamples = [
  { industry: "Fashion", examples: [{ company: "ASOS", role: "Commercial Strategy" }, { company: "Burberry", role: "Corporate Strategy" }], slug: "/fashion" },
  { industry: "Football", examples: [{ company: "Premier League", role: "Business Strategy" }, { company: "Sky Sports", role: "Content Strategy" }], slug: "/football" },
  { industry: "Film and TV", examples: [{ company: "Netflix", role: "Content Strategy" }, { company: "BFI", role: "Audience Strategy" }], slug: "/cinema" },
  { industry: "Grocery", examples: [{ company: "Tesco", role: "Corporate Strategy" }, { company: "Ocado", role: "Growth Strategy" }], slug: "/grocery" },
  { industry: "Music", examples: [{ company: "Spotify", role: "Market Strategy" }, { company: "DICE", role: "Expansion Strategy" }], slug: "/music" },
];

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Target, roles: [
    { name: "Strategy Analyst", description: "Conducts market research, builds models, and supports senior strategists with data-driven insights.", salary: "£28k–£38k" },
    { name: "Business Analyst", description: "Analyses processes and performance data to identify efficiency and growth opportunities.", salary: "£26k–£35k" },
  ]},
  { title: "Mid Level", icon: Compass, roles: [
    { name: "Strategy Manager", description: "Leads strategic projects, synthesises insights, and presents recommendations to leadership.", salary: "£45k–£65k" },
    { name: "Business Development Manager", description: "Identifies and develops new market opportunities, partnerships, and revenue streams.", salary: "£42k–£60k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head of Strategy", description: "Owns the strategic roadmap, leading cross-functional initiatives and long-term planning.", salary: "£70k–£100k" },
    { name: "Director of Business Development", description: "Drives growth strategy across markets and oversees partnership and M&A activity.", salary: "£80k–£110k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "VP of Strategy", description: "Sets multi-year strategic direction, working closely with the CEO and board.", salary: "£100k–£150k" },
    { name: "Chief Strategy Officer", description: "C-suite leader responsible for corporate strategy, transformation, and long-term vision.", salary: "£130k–£200k+" },
  ]},
];

const podcasts = [
  { title: "The Strategy Skills Podcast", description: "Practical frameworks for strategic thinking and problem-solving.", url: "https://strategyskills.com/podcast/" },
  { title: "HBR IdeaCast", description: "Harvard Business Review's weekly podcast on strategy, leadership, and management.", url: "https://hbr.org/2018/01/podcast-ideacast" },
  { title: "McKinsey Insights", description: "Insights from McKinsey partners on strategy, digital, and organisational change.", url: "https://www.mckinsey.com/featured-insights" },
];

const articles = [
  { title: "Harvard Business Review", source: "HBR", url: "https://hbr.org/" },
  { title: "McKinsey Insights", source: "McKinsey", url: "https://www.mckinsey.com/featured-insights" },
  { title: "Strategy+Business", source: "PwC", url: "https://www.strategy-business.com/" },
];

const Strategy = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={podcasts as PodcastItem[]} />
      </>
    )},
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="strategy" roleName="Strategy" /> },
    { id: "read", label: "Read", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2>
        <div className="space-y-4">{articles.map((a) => (
          <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
            <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3>
            <p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p>
          </a>
        ))}</div>
      </>
    )},
    { id: "work", label: "Who?", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Strategy Exists<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-8">Strategy looks different in every industry.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{industryExamples.map((item) => (
          <div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3"><IndustryIcon industry={item.industry} /><Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">Strategy in {item.industry}</Link></div>
            <ul className="space-y-1">{item.examples.map((ex) => (<li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full shrink-0" /><span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span></li>))}</ul>
            <Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">Explore industry <ArrowRight className="w-3 h-3" /></Link>
          </div>
        ))}</div>
      </>
    )},
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Strategy" data={{ summary: "Strategy is about figuring out where a business should go - and how to get there. Strategists analyse markets, competitors, and internal data to shape long-term plans. It's a role that blends analytical rigour with creative thinking, and exists in every industry from tech to sport.", dayToDay: ["Conducting market research and competitive analysis", "Building business cases and financial models for new initiatives", "Presenting strategic recommendations to senior leadership", "Identifying growth opportunities - new markets, M&A, partnerships", "Working cross-functionally to align teams around strategic priorities", "Monitoring industry trends and macroeconomic shifts"], skills: ["Market Analysis", "Financial Modelling", "Stakeholder Management", "Strategic Frameworks", "Data Synthesis", "Presentation & Storytelling", "Problem Structuring", "Commercial Judgement"], traits: ["You love understanding why businesses succeed or fail", "You're comfortable with ambiguity and complex problems", "You enjoy both deep analysis and big-picture thinking", "You communicate clearly and persuasively", "You're intellectually curious - you read widely and ask good questions"], salary: "£28k–£38k", entryTip: "Strategy roles are competitive. Many start in management consulting (McKinsey, BCG, Bain, Deloitte) before moving in-house. A strong degree, analytical mindset, and business awareness are key. Case study prep and networking are essential." }} /><CareerMap title="Strategy Career Path" subtitle="From analyst to CSO - the typical progression for strategy professionals." stages={careerStages} industry="strategy" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Strategy" searchQuery="strategy consulting conference" /> },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live strategy roles across all industries.</p>
          <Link to="/marketplace?role=Strategy#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Strategy Jobs</Link>
        </div>
        <IndustryCVBuilder industry="Strategy" stages={careerStages} />
      </>
    )},
  ];

  return <RolePageLayout name="Strategy" description="Market analysis, growth planning, and long-term thinking - shaping where industries go next." tabs={tabs} category="business" />;
};

export default Strategy;
