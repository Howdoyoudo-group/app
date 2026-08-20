import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Target, TrendingUp, BarChart3, Handshake } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const industryExamples = [
  { industry: "Fashion", examples: [{ company: "ASOS", role: "Wholesale Sales" }, { company: "Burberry", role: "Retail Sales & Clienteling" }], slug: "/fashion" },
  { industry: "Grocery", examples: [{ company: "Tesco", role: "Commercial Sales" }, { company: "Ocado", role: "B2B Sales" }], slug: "/grocery" },
  { industry: "Hospitality", examples: [{ company: "Soho House", role: "Membership Sales" }, { company: "Five Guys", role: "Franchise Development" }], slug: "/hospitality" },
  { industry: "Estate Agency", examples: [{ company: "Savills", role: "Property Sales" }, { company: "Rightmove", role: "Advertising Sales" }], slug: "/estate-agency" },
  { industry: "Coffee", examples: [{ company: "Grind", role: "Wholesale Accounts" }, { company: "Costa", role: "Franchise Sales" }], slug: "/coffee" },
];

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Target, roles: [
    { name: "Sales Assistant / SDR", description: "Generates leads, qualifies prospects, and books meetings for senior salespeople.", salary: "£25k–£30k" },
    { name: "Account Executive (Junior)", description: "Manages a small portfolio of accounts and closes deals with guidance.", salary: "£25k–£35k + commission" },
  ]},
  { title: "Mid Level", icon: Handshake, roles: [
    { name: "Account Manager", description: "Owns client relationships, drives renewals, upsells, and ensures customer satisfaction.", salary: "£35k–£50k + commission" },
    { name: "Sales Manager", description: "Leads a sales team, sets targets, coaches reps, and owns territory strategy.", salary: "£40k–£60k + bonus" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head of Sales", description: "Drives the sales strategy, manages the full pipeline, and reports on revenue performance.", salary: "£65k–£95k" },
    { name: "Key Account Director", description: "Manages the most important client relationships and drives strategic partnerships.", salary: "£70k–£100k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Sales Director", description: "Owns revenue targets across channels, building and scaling sales teams.", salary: "£90k–£140k" },
    { name: "Chief Revenue Officer", description: "C-suite leader responsible for all revenue-generating functions.", salary: "£130k–£200k+" },
  ]},
];

const podcasts = [
  { title: "The Salesman Podcast", description: "Interviews with top performers sharing real-world B2B sales strategies.", url: "https://www.salesman.com/podcast/" },
  { title: "Revenue Builders", description: "Leaders from the world's best sales organisations share what works.", url: "https://www.forcemanagement.com/revenue-builders-podcast" },
  { title: "Sell or Die", description: "Jeffrey Gitomer's straight-talking advice on selling in the modern world.", url: "https://www.sellordiepodcast.com/" },
];

const articles = [
  { title: "Sales Hacker", source: "Sales Hacker", url: "https://www.saleshacker.com/" },
  { title: "HBR - Sales", source: "Harvard Business Review", url: "https://hbr.org/topic/sales" },
  { title: "Gartner - Sales Leaders", source: "Gartner", url: "https://www.gartner.com/en/sales" },
];

const Sales = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="sales" roleName="Sales" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "work", label: "Who?", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Sales Exists<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-8">Sales looks different in every industry.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{industryExamples.map((item) => (<div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors"><div className="flex items-center gap-3 mb-3"><IndustryIcon industry={item.industry} /><Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">Sales in {item.industry}</Link></div><ul className="space-y-1">{item.examples.map((ex) => (<li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full shrink-0" /><span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span></li>))}</ul><Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">Explore industry <ArrowRight className="w-3 h-3" /></Link></div>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Sales" data={{ summary: "Sales is about building relationships and driving revenue. Whether it's B2B enterprise deals or membership sign-ups, salespeople are the ones who connect products and services to the people who need them. Every industry has a sales function - and the best salespeople combine commercial instinct with genuine curiosity.", dayToDay: ["Prospecting and qualifying new business leads", "Running demos, pitches, and client presentations", "Managing a pipeline and forecasting revenue accurately", "Negotiating contracts and closing deals", "Building and nurturing long-term client relationships", "Collaborating with marketing, product, and ops teams"], skills: ["Negotiation", "Pipeline Management", "CRM (Salesforce/HubSpot)", "Presentation Skills", "Objection Handling", "Relationship Building", "Commercial Awareness", "Data-Driven Selling"], traits: ["You're naturally curious about people and what drives their decisions", "You're resilient - rejection doesn't knock your confidence", "You love the buzz of closing a deal", "You're competitive but collaborative", "You're organised and can manage multiple conversations at once"], salary: "£25k–£30k + commission", entryTip: "Many sales careers start as SDRs (Sales Development Reps) or account executives. No specific degree is required - attitude, resilience, and communication skills matter more. Graduate schemes at firms like Salesforce, Google, and enterprise SaaS companies are strong entry routes." }} /><CareerMap title="Sales Career Path" subtitle="From SDR to CRO - the typical progression for sales professionals." stages={careerStages} industry="sales" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Sales" searchQuery="sales conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live sales roles across all industries.</p><Link to="/marketplace?role=Sales#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Sales Jobs</Link></div><IndustryCVBuilder industry="Sales" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Sales" description="Client relationships, revenue growth, and deal-making across every sector." tabs={tabs} category="business" />;
};

export default Sales;
