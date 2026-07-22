import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Target, TrendingUp, BarChart3, Scale } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const industryExamples = [
  { industry: "Fashion", examples: [{ company: "Burberry", role: "IP & Brand Protection" }, { company: "ASOS", role: "Commercial Contracts" }], slug: "/fashion" },
  { industry: "Football", examples: [{ company: "Premier League", role: "Regulatory & Governance" }, { company: "Chelsea FC", role: "Player Contracts" }], slug: "/football" },
  { industry: "Music", examples: [{ company: "Warner Music", role: "Music Rights & Licensing" }, { company: "Spotify", role: "Content Licensing" }], slug: "/music" },
  { industry: "Grocery", examples: [{ company: "Tesco", role: "Regulatory Compliance" }, { company: "Ocado", role: "Commercial Legal" }], slug: "/grocery" },
];

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Target, roles: [
    { name: "Legal Assistant / Paralegal", description: "Supports lawyers with research, document drafting, and case management.", salary: "£22k–£30k" },
    { name: "Compliance Coordinator", description: "Assists with regulatory monitoring, policy documentation, and audit preparation.", salary: "£24k–£32k" },
  ]},
  { title: "Mid Level", icon: Scale, roles: [
    { name: "Legal Counsel", description: "Provides legal advice on contracts, disputes, and regulatory matters.", salary: "£50k–£75k" },
    { name: "Compliance Manager", description: "Owns compliance programmes, risk assessments, and regulatory reporting.", salary: "£45k–£65k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Legal Counsel", description: "Leads complex legal matters and advises senior leadership on risk.", salary: "£75k–£100k" },
    { name: "Head of Compliance", description: "Sets compliance strategy and manages the regulatory framework.", salary: "£70k–£95k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "General Counsel", description: "Leads the legal function and serves as the company's chief legal adviser.", salary: "£100k–£160k" },
    { name: "Chief Legal Officer", description: "C-suite leader overseeing all legal, compliance, and governance matters.", salary: "£130k–£200k+" },
  ]},
];

const podcasts = [
  { title: "Counsel Magazine Podcast", description: "Insights from barristers and legal professionals across practice areas.", url: "https://www.counselmagazine.co.uk/" },
  { title: "The In-House Lawyer Podcast", description: "Conversations with in-house legal teams about life inside organisations.", url: "https://www.legalbusiness.co.uk/" },
];

const articles = [
  { title: "The Law Society Gazette", source: "Law Society", url: "https://www.lawgazette.co.uk/" },
  { title: "Legal Cheek", source: "Legal Cheek", url: "https://www.legalcheek.com/" },
  { title: "The Lawyer", source: "The Lawyer", url: "https://www.thelawyer.com/" },
];

const LegalCompliance = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="legal-compliance" roleName="Legal & Compliance" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "work", label: "Who?", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Legal & Compliance Exists<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-8">Legal looks different in every industry.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{industryExamples.map((item) => (<div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors"><div className="flex items-center gap-3 mb-3"><IndustryIcon industry={item.industry} /><Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">Legal in {item.industry}</Link></div><ul className="space-y-1">{item.examples.map((ex) => (<li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full shrink-0" /><span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span></li>))}</ul><Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">Explore industry <ArrowRight className="w-3 h-3" /></Link></div>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Legal & Compliance" data={{ summary: "Legal and compliance professionals protect organisations from risk. Whether it's drafting contracts, advising on regulation, managing IP, or ensuring data protection compliance, this function is essential in every industry. In-house legal teams are growing fast as businesses want strategic legal advice embedded in the business.", dayToDay: ["Drafting, reviewing, and negotiating commercial contracts", "Advising business teams on regulatory and legal risk", "Managing compliance programmes and policy frameworks", "Handling IP protection, trademarks, and licensing", "Preparing for and managing audits and regulatory inspections", "Staying up to date with changes in law and regulation"], skills: ["Contract Drafting", "Regulatory Knowledge", "Risk Assessment", "IP & Data Protection", "Legal Research", "Stakeholder Advisory", "Compliance Frameworks", "Attention to Detail"], traits: ["You enjoy reading the fine print and spotting what others miss", "You're analytical and can assess risk objectively", "You communicate complex legal concepts in plain language", "You're diligent and thorough - nothing slips through", "You're interested in how law intersects with business decisions"], salary: "£22k–£30k", entryTip: "For solicitors: law degree or GDL conversion, then SQE (or LPC). For compliance: many enter through compliance coordinator roles - a degree helps, but industry certifications (ICA, CISI) are valued. Paralegals can build strong foundations before qualifying." }} /><CareerMap title="Legal & Compliance Career Path" subtitle="From paralegal to General Counsel - the typical progression." stages={careerStages} industry="legal" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Legal" searchQuery="legal compliance conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live legal & compliance roles.</p><Link to="/marketplace?role=Legal+%26+Compliance#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Legal Jobs</Link></div><IndustryCVBuilder industry="Legal & Compliance" stages={careerStages} /></>) },
  ];

  return <RolePageLayout slug="legal-compliance" name="Legal & Compliance" description="Contracts, regulation, and risk - making sure industries operate within the rules." tabs={tabs} category="business" />;
};

export default LegalCompliance;
