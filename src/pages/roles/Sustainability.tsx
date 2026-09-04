import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Leaf } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Leaf, roles: [
    { name: "Sustainability Coordinator", description: "Supports data collection, reporting and day-to-day delivery of the sustainability plan.", salary: "£24k–£30k" },
    { name: "Graduate Sustainability Scheme", description: "Structured early-career programme rotating across ESG, supply chain and comms.", salary: "£26k–£30k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Sustainability Manager", description: "Owns the strategy for a business area - net zero targets, ethical sourcing, reporting.", salary: "£35k–£55k" },
    { name: "ESG Manager", description: "Focuses on environmental, social and governance reporting and investor requirements.", salary: "£40k–£60k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head of Sustainability", description: "Sets sustainability strategy across the whole organisation and reports to the board.", salary: "£65k–£90k" },
    { name: "Senior ESG Manager", description: "Leads ESG reporting and strategy across a large or multi-site organisation.", salary: "£60k–£85k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Director of Sustainability", description: "Owns the environmental and social impact agenda at board level.", salary: "£90k–£130k" },
    { name: "Chief Sustainability Officer", description: "C-suite leader responsible for the organisation's entire sustainability strategy.", salary: "£120k–£180k+" },
  ]},
];

const podcasts = [
  { title: "Cleaning Up with Michael Liebreich", description: "In-depth conversations with leaders driving the shift to a low-carbon economy.", url: "https://www.cleaningup.live" },
  { title: "A Sustainable Mind", description: "Career-focused interviews with sustainability professionals about how they got in and what the work actually involves.", url: "https://asustainablemind.com" },
];

const articles = [
  { title: "ISEP (formerly IEMA)", source: "Institute of Sustainability and Environmental Professionals", url: "https://isepglobal.org" },
  { title: "BusinessGreen", source: "News and analysis for the low-carbon economy", url: "https://www.businessgreen.com" },
  { title: "Sustainability Magazine", source: "Sustainability Magazine", url: "https://sustainabilitymag.com" },
];

const Sustainability = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="sustainability" roleName="Sustainability Manager" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Sustainability Manager" data={{ summary: "Environmental strategy, ethical sourcing, and net-zero targets - making sure a business's growth doesn't cost the planet. Sustainability managers sit at the intersection of strategy, data and culture change, working across every department to cut emissions, hit environmental targets, and bring colleagues along with them.", dayToDay: ["Reading up on environmental policy, science and industry news to stay current", "Analysing environmental data and tracking progress against carbon and sustainability targets", "Working with departments across the business - from supply chain to marketing - to reduce environmental impact", "Building the case for sustainability strategy and getting buy-in from stakeholders who don't report to you", "Running training and internal communications to build sustainability knowledge across the organisation", "Keeping on top of changing environmental policy, legislation and reporting requirements"], skills: ["Stakeholder Influence & Persuasion", "Environmental & ESG Data Analysis", "Strategic Planning", "Business & Budget Management", "Verbal & Written Communication", "Initiative & Problem-Solving"], traits: ["You care about environmental impact but you're pragmatic about it, not preachy", "You're comfortable being the person who has to change other people's minds, not just your own", "You're analytical enough to read the data, but people-focused enough to act on it", "You get things done through influence, not authority"], salary: "£35k–£55k", entryTip: "You don't need an environmental science degree to get into sustainability - most people who make it in this field arrive from other departments (finance, communications, operations) with genuine interest and the ability to bring people on board with change. Degree apprenticeships are a genuine route in, not just a fallback. Get experience wherever you can find it - your workplace, community or college - and if you're already employed somewhere, see what your own organisation's sustainability team is doing and ask to get involved." }} /><CareerMap title="Sustainability Career Path" subtitle="From coordinator to Chief Sustainability Officer." stages={careerStages} industry="sustainability" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Sustainability" searchQuery="sustainability careers UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live sustainability roles across UK industries.</p><Link to="/marketplace?role=Sustainability+Manager#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Sustainability Jobs</Link></div><IndustryCVBuilder industry="Sustainability" stages={careerStages} /></>) },
  ];

  return <RolePageLayout slug="sustainability" name="Sustainability Manager" description="Environmental strategy, ethical sourcing, and net-zero targets - making sure a business's growth doesn't cost the planet." tabs={tabs} category="business" />;
};

export default Sustainability;
