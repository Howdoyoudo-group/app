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
    { name: "Trainee Estate Agent", description: "Conducts viewings, registers applicants, and learns the property market.", salary: "£18k–£24k + commission" },
    { name: "Lettings Negotiator", description: "Matches tenants with properties and manages the letting process.", salary: "£20k–£26k + commission" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Senior Negotiator", description: "Wins instructions, negotiates offers, and manages a portfolio of properties.", salary: "£25k–£35k + commission" },
    { name: "Valuer", description: "Assesses property values and wins new instructions for the branch.", salary: "£28k–£40k + commission" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Branch Manager", description: "Runs a branch - team, targets, P&L, and local market strategy.", salary: "£35k–£55k + bonus" },
    { name: "Area Manager", description: "Oversees multiple branches and drives regional performance.", salary: "£45k–£65k + bonus" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Regional Director", description: "Leads a region of offices, setting strategy and managing senior teams.", salary: "£60k–£100k" },
    { name: "Director / Partner", description: "Equity partner or board-level leader in the agency.", salary: "£80k–£150k+" },
  ]},
];

const podcasts = [
  { title: "The Property Podcast", description: "Rob & Rob cover UK property investing, market trends, and career advice.", url: "https://www.propertyhub.net/podcast" },
  { title: "Estate Agent Networking Podcast", description: "Tips and interviews for estate agents building their careers.", url: "https://estateagentnetworking.co.uk/" },
];

const articles = [
  { title: "Estate Agent Today", source: "EAT", url: "https://www.estateagenttoday.co.uk/" },
  { title: "Property Industry Eye", source: "PIE", url: "https://propertyindustryeye.com/" },
  { title: "The Negotiator", source: "The Negotiator", url: "https://thenegotiator.co.uk/" },
];

const EstateAgent = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="estate-agent" roleName="Estate Agent" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Estate Agent" data={{ summary: "Estate agents are the face of the property industry. They help people buy, sell, rent, and let homes - and the best agents combine local market knowledge with negotiation skills and genuine people instincts. It's a career where your income is directly linked to your performance, and progression can be fast.", dayToDay: ["Conducting property valuations and market appraisals", "Running viewings and presenting properties to buyers or tenants", "Negotiating offers between buyers and sellers", "Building a pipeline through prospecting, referrals, and canvassing", "Managing the sales or lettings process through to completion", "Staying on top of local market data and competitor activity"], skills: ["Negotiation", "Local Market Knowledge", "Sales & Pipeline Management", "Customer Service", "Valuation Skills", "Property Law Basics", "CRM Systems", "Networking"], traits: ["You're naturally persuasive and enjoy closing deals", "You're resilient - not every viewing turns into a sale", "You're a people person who can build trust quickly", "You're self-motivated and driven by results", "You're interested in property, architecture, and local communities"], salary: "£18k–£24k + commission", entryTip: "No degree is required - most agents start as trainees or negotiators. Propertymark (NAEA/ARLA) qualifications are the industry standard. A clean driving licence, local area knowledge, and a commercial mindset will get you ahead." }} /><CareerMap title="Estate Agent Career Path" subtitle="From trainee to director - the property progression." stages={careerStages} industry="estate agency" /></>) },
    { id: "learn", label: "Learn", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Courses & Qualifications<span className="text-primary">.</span></h2><div className="space-y-4">{[{ title: "Propertymark Qualifications", description: "NAEA and ARLA qualifications - the industry standard for UK estate and letting agents.", url: "https://www.propertymark.co.uk/professional-standards/qualifications/" }, { title: "RICS (Royal Institution of Chartered Surveyors)", description: "Chartered surveyor pathway for those moving into valuation and consultancy.", url: "https://www.rics.org/" }].map((c) => (<a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{c.description}</p></a>))}</div></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Estate Agency" searchQuery="estate agent property conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live estate agency roles.</p><Link to="/marketplace?industry=estate-agency#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Estate Agency Jobs</Link></div><IndustryCVBuilder industry="Estate Agency" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Estate Agent" description="Valuations, viewings, and negotiation - the face of property transactions." tabs={tabs} category="craft" />;
};

export default EstateAgent;
