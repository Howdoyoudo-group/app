import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Scissors } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Scissors, roles: [
    { name: "Assistant Garment Technologist", description: "Supports fit sessions, sample tracking, and basic spec sheets.", salary: "£22k–£28k" },
    { name: "Quality Assurance Assistant", description: "Inspects samples and production for fit and construction issues.", salary: "£22k–£27k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Garment Technologist", description: "Owns fit, construction and tech packs across a category from sample to bulk.", salary: "£30k–£42k" },
    { name: "Pattern Cutter", description: "Translates designs into patterns - the technical bridge between design and production.", salary: "£30k–£45k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Garment Technologist", description: "Leads complex categories and mentors junior tech team members.", salary: "£42k–£55k" },
    { name: "Tech Manager", description: "Owns the technical function for a category - fit standards, supplier QA, and processes.", salary: "£50k–£68k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head of Garment Technology", description: "Sets technical strategy, fit blocks and supplier engineering across the brand.", salary: "£70k–£100k" },
  ]},
];

const podcasts = [
  { title: "The Business of Fashion Podcast", description: "How brands actually get clothes made - sourcing, supply chain and quality.", url: "https://www.businessoffashion.com/podcasts/" },
  { title: "Apparel Insider", description: "Industry conversations on garment manufacturing and supply chain.", url: "https://apparelinsider.com/" },
];

const articles = [
  { title: "Drapers", source: "Drapers", url: "https://www.drapersonline.com/" },
  { title: "Apparel Insider", source: "Apparel Insider", url: "https://apparelinsider.com/" },
  { title: "Just Style", source: "Just Style", url: "https://www.just-style.com/" },
];

const GarmentTechnologist = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="garment-technologist" roleName="Garment Technologist" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Garment Technologist" data={{ summary: "Garment technologists are the technical backbone of fashion. They own fit, construction, and quality - translating designs into garments that actually work, fit consistently, and survive production. Every brand from ASOS to Burberry relies on this craft.", dayToDay: ["Running fit sessions on samples and signing off bulk", "Writing and maintaining tech packs for factories", "Working with suppliers to solve construction and quality issues", "Owning size charts, fit blocks and grading rules", "Inspecting bulk production for quality assurance", "Partnering with designers and buyers from concept to launch"], skills: ["Pattern & Construction Knowledge", "Fit Sessions", "Tech Pack Authoring (PLM)", "Fabric & Trim Knowledge", "Supplier Engineering", "Quality Assurance", "Grading"], traits: ["Detail-obsessed - millimetres matter", "Practical and hands-on with garments", "Calm communicator with overseas suppliers", "Curious about how things are made"], salary: "£30k–£42k", entryTip: "Most garment tech careers start with a fashion degree (BA Fashion Tech, Pattern Cutting, or similar - UAL, MMU, De Montfort are strong). Internships at high-street retailers (M&S, Next, ASOS) are a fast track. Hands-on sewing skills are gold." }} /><CareerMap title="Garment Technologist Career Path" subtitle="" stages={careerStages} industry="fashion" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Fashion" searchQuery="fashion garment technology UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live garment tech and fit roles.</p><Link to="/marketplace?industry=fashion#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Fashion Jobs</Link></div><IndustryCVBuilder industry="Fashion" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Garment Technologist" description="The technical backbone of fashion - fit, construction, and quality from sample to factory floor." tabs={tabs} category="craft" />;
};

export default GarmentTechnologist;
