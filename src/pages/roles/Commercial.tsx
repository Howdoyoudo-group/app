import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Target, TrendingUp, BarChart3, PoundSterling } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const industryExamples = [
  { industry: "Football", examples: [{ company: "Premier League", role: "Commercial Partnerships" }, { company: "Chelsea FC", role: "Sponsorship & Revenue" }], slug: "/football" },
  { industry: "Fashion", examples: [{ company: "Burberry", role: "Commercial Planning" }, { company: "ASOS", role: "Trading & Margin" }], slug: "/fashion" },
  { industry: "Music", examples: [{ company: "Live Nation", role: "Commercial Strategy" }, { company: "DICE", role: "Revenue & Pricing" }], slug: "/music" },
  { industry: "Grocery", examples: [{ company: "Tesco", role: "Commercial Buying" }, { company: "Ocado", role: "Supplier Commercials" }], slug: "/grocery" },
  { industry: "Hospitality", examples: [{ company: "Soho House", role: "Commercial Operations" }, { company: "Dishoom", role: "Pricing & Revenue" }], slug: "/hospitality" },
];

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Target, roles: [
    { name: "Commercial Analyst", description: "Analyses pricing, margins, and market data to support commercial decisions.", salary: "£26k–£35k" },
    { name: "Commercial Coordinator", description: "Supports commercial teams with contracts, reporting, and partner liaison.", salary: "£24k–£30k" },
  ]},
  { title: "Mid Level", icon: PoundSterling, roles: [
    { name: "Commercial Manager", description: "Owns pricing strategy, contract negotiations, and revenue optimisation.", salary: "£42k–£60k" },
    { name: "Partnerships Manager", description: "Identifies, negotiates, and manages commercial partnerships.", salary: "£40k–£58k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head of Commercial", description: "Leads the commercial function, driving revenue strategy and partner relationships.", salary: "£70k–£100k" },
    { name: "Commercial Director", description: "Shapes the commercial strategy and sits on the senior leadership team.", salary: "£85k–£120k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Chief Commercial Officer", description: "C-suite leader responsible for all revenue, partnerships, and commercial growth.", salary: "£120k–£200k+" },
  ]},
];

const podcasts = [
  { title: "The Commercial Break", description: "Insights into commercial strategy, partnerships, and revenue growth.", url: "https://www.thecommercialbreak.com/" },
  { title: "Business Wars", description: "The biggest business rivalries - told as stories of commercial strategy.", url: "https://wondery.com/shows/business-wars/" },
];

const articles = [
  { title: "Harvard Business Review - Strategy", source: "HBR", url: "https://hbr.org/topic/strategy" },
  { title: "McKinsey - Growth & Revenue", source: "McKinsey", url: "https://www.mckinsey.com/capabilities/growth-marketing-and-sales" },
];

const Commercial = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="commercial" roleName="Commercial" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "work", label: "Who?", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Commercial Exists<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-8">Commercial roles exist wherever revenue needs to grow.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{industryExamples.map((item) => (<div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors"><div className="flex items-center gap-3 mb-3"><IndustryIcon industry={item.industry} /><Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">Commercial in {item.industry}</Link></div><ul className="space-y-1">{item.examples.map((ex) => (<li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full shrink-0" /><span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span></li>))}</ul><Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">Explore industry <ArrowRight className="w-3 h-3" /></Link></div>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Commercial" data={{ summary: "Commercial roles sit at the intersection of sales, strategy, and finance. You'll be responsible for driving revenue - whether through pricing strategy, partner negotiations, sponsorship deals, or supplier management. It's a highly versatile function that exists wherever money changes hands.", dayToDay: ["Analysing pricing, margins, and revenue performance", "Negotiating contracts with suppliers, partners, and clients", "Building commercial business cases for new products or partnerships", "Managing sponsorship and partnership portfolios", "Collaborating with finance, marketing, and product teams", "Tracking market trends to identify commercial opportunities"], skills: ["Negotiation", "Commercial Analysis", "Contract Management", "Revenue Strategy", "Partnership Development", "Financial Acumen", "Stakeholder Management", "Market Intelligence"], traits: ["You enjoy the art of the deal - negotiation energises you", "You're commercially minded and think in terms of value", "You can build relationships at all levels", "You're comfortable with numbers but also a strong communicator", "You thrive in fast-paced, revenue-driven environments"], salary: "£24k–£35k", entryTip: "Many commercial careers start through commercial analyst or coordinator roles. A business or economics degree helps, but industry-specific experience can be just as valuable. Understanding both the numbers and the relationships is key." }} /><CareerMap title="Commercial Career Path" subtitle="From analyst to CCO - the typical progression for commercial professionals." stages={careerStages} industry="commercial" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Commercial" searchQuery="commercial strategy conference" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live commercial roles across all industries.</p><Link to="/marketplace?role=Commercial#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Commercial Jobs</Link></div><IndustryCVBuilder industry="Commercial" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Commercial" description="Pricing, partnerships, and revenue strategy - turning industry knowledge into business growth." tabs={tabs} category="business" />;
};

export default Commercial;
