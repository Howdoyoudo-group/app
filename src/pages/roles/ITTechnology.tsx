import { Link } from "react-router-dom";
import { Code, Server, Cpu, Network } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Code, roles: [
    { name: "Junior Software Engineer", description: "Builds and maintains features under the guidance of senior engineers.", salary: "£32k–£45k" },
    { name: "IT Support Analyst", description: "First-line technical support for internal users and systems.", salary: "£24k–£32k" },
    { name: "Data Analyst", description: "Cleans, models, and reports on data to support business decisions.", salary: "£28k–£40k" },
  ]},
  { title: "Mid Level", icon: Server, roles: [
    { name: "Software Engineer", description: "Owns features end-to-end across frontend, backend, or full stack.", salary: "£55k–£85k" },
    { name: "DevOps / Platform Engineer", description: "Builds and maintains the infrastructure, CI/CD and cloud platforms.", salary: "£65k–£95k" },
    { name: "Solutions Engineer", description: "Bridges sales and engineering - demos, integrations, and customer onboarding.", salary: "£60k–£90k" },
    { name: "Product Manager (Technical)", description: "Owns the roadmap for technical and developer-facing products.", salary: "£65k–£100k" },
  ]},
  { title: "Senior Level", icon: Cpu, roles: [
    { name: "Senior Engineer / Staff Engineer", description: "Leads architecture, mentors others, and sets technical direction.", salary: "£90k–£140k" },
    { name: "Engineering Manager", description: "Leads a team of engineers - hiring, performance, delivery.", salary: "£95k–£150k" },
    { name: "Machine Learning Engineer", description: "Builds and deploys models in production environments.", salary: "£90k–£160k" },
  ]},
  { title: "Leadership", icon: Network, roles: [
    { name: "Head of Engineering / VP", description: "Owns the engineering org - strategy, structure, and execution.", salary: "£150k–£250k" },
    { name: "CTO", description: "Sets technical vision across the business; reports to the CEO/board.", salary: "£180k–£400k+" },
    { name: "Chief Information Officer (CIO)", description: "Owns enterprise IT, security, and digital transformation.", salary: "£150k–£300k" },
  ]},
];

const podcasts = [
  { title: "Lenny's Podcast", description: "Product, growth, and engineering leadership conversations.", url: "https://www.lennyspodcast.com/" },
  { title: "Software Engineering Daily", description: "Daily interviews with engineers building today's biggest systems.", url: "https://softwareengineeringdaily.com/" },
  { title: "The Pragmatic Engineer", description: "Gergely Orosz on what's actually happening inside tech companies.", url: "https://newsletter.pragmaticengineer.com/podcast" },
];

const articles = [
  { title: "The Pragmatic Engineer", source: "Gergely Orosz", url: "https://newsletter.pragmaticengineer.com/" },
  { title: "Stratechery", source: "Ben Thompson", url: "https://stratechery.com/" },
  { title: "The Information", source: "The Information", url: "https://www.theinformation.com/" },
];

const ITTechnology = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="it-technology" roleName="IT & Technology" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="IT & Technology" data={{ summary: "IT & Technology covers the people who build and run the software, infrastructure, and data behind every modern business - from software engineers and data scientists at AI labs and SaaS companies, to platform teams keeping retailers, banks, and hospitals running. It's the highest-paid functional career path in the UK, and increasingly the strategic core of every industry on this site.", dayToDay: ["Writing, reviewing, and shipping code", "Designing systems and architecture", "Working with product and design on roadmap delivery", "On-call, incident response, and reliability work", "Cloud infrastructure, security and data pipelines", "Hiring, mentoring, and team leadership"], skills: ["Software Engineering (any stack)", "Cloud (AWS / GCP / Azure)", "Data & ML", "DevOps & Platform", "Systems Design", "Security & Compliance"], traits: ["Curious - the stack changes every year", "Rigorous - shipping things that don't break", "Collaborative - modern engineering is a team sport", "Commercially aware - the best engineers understand the business"], salary: "£32k entry → £400k+ at senior leadership", entryTip: "There are now multiple credible routes in: traditional CompSci degrees, conversion master's, intensive bootcamps (Makers, Le Wagon, Founders & Coders), and apprenticeships at companies like Salesforce, IBM, and Sky. AI labs (Anthropic, OpenAI, DeepMind) and US-headquartered SaaS giants (Salesforce, Stripe, Datadog) currently offer the strongest UK compensation." }} /><CareerMap title="IT & Technology Career Path" subtitle="" stages={careerStages} industry="charity" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Technology" searchQuery="software engineering AI tech conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-6"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live IT & Technology roles across UK and global employers.</p><Link to="/marketplace?role=it-technology#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Tech Jobs</Link></div><div className="border border-border p-6 mb-12 bg-primary/5"><p className="text-primary text-xs tracking-[0.3em] uppercase font-body mb-2">New role</p><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Looking for AI<span className="text-primary">?</span></h2><p className="text-muted-foreground font-body text-sm mb-4">AI is now its own role on How do you do - covering frontier labs (Anthropic, OpenAI, DeepMind) and AI teams across every industry.</p><Link to="/roles/ai" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">Explore AI Role</Link></div><IndustryCVBuilder industry="Technology" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="IT & Technology" description="The people who build and run the software, data, and infrastructure behind every modern business - engineering, data, AI, and platform." tabs={tabs} category="business" />;
};

export default ITTechnology;
