import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Wrench } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Wrench, roles: [
    { name: "Apprentice Vehicle Technician", description: "3–4 year apprenticeship combining workshop training with college study.", salary: "£14k–£20k" },
    { name: "Service Advisor", description: "Front-of-house - books in customers, manages the workshop's customer relationship.", salary: "£25k–£30k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Vehicle Technician", description: "Qualified mechanic - services, MOTs, diagnostics and repairs.", salary: "£28k–£36k" },
    { name: "Parts Advisor", description: "Manages parts ordering, stock and supply across the workshop.", salary: "£26k–£32k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Master Technician / Diagnostic Specialist", description: "Manufacturer-certified - handles the most complex diagnostic and EV work.", salary: "£38k–£50k" },
    { name: "Workshop Controller / Service Manager", description: "Runs the workshop floor - productivity, quality, and team leadership.", salary: "£40k–£55k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Aftersales Manager", description: "Owns the dealership's service, parts and bodyshop P&L.", salary: "£55k–£75k" },
    { name: "Dealer Principal / GM", description: "Runs the entire dealership - sales, aftersales and bodyshop.", salary: "£80k–£140k+" },
  ]},
];

const podcasts = [
  { title: "Auto Service World Podcast", description: "Conversations with workshop owners and technicians on the future of the trade.", url: "https://www.autoserviceworld.com/" },
  { title: "Car Dealer Magazine Podcast", description: "UK dealership operators on aftersales, EV, and the workshop economy.", url: "https://cardealermagazine.co.uk/podcast" },
];

const articles = [
  { title: "Car Dealer Magazine", source: "Car Dealer", url: "https://cardealermagazine.co.uk/" },
  { title: "Auto Express", source: "Auto Express", url: "https://www.autoexpress.co.uk/" },
  { title: "AM Online", source: "AM Online", url: "https://www.am-online.com/" },
];

const VehicleTechnician = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="vehicle-technician" roleName="Vehicle Technician" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Vehicle Technician" data={{ summary: "Vehicle technicians keep the country moving. With the EV transition, the trade is changing fast - diagnostics, software and battery work matter as much as a torque wrench. It's a skilled trade with a clear path from apprenticeship to running a workshop or dealership.", dayToDay: ["Servicing and MOT-testing customer vehicles", "Diagnosing faults using manufacturer software", "Carrying out mechanical and electrical repairs", "Working on EVs, hybrids, and ADAS recalibration", "Updating job cards and aftersales notes", "Liaising with the service advisor on customer updates"], skills: ["Mechanical & Electrical Diagnostics", "MOT Testing", "EV / Hybrid Systems", "Manufacturer Diagnostic Software", "Bodyshop / Paint (specialist)", "Health & Safety in the Workshop"], traits: ["Practical and hands-on - happy in workshop conditions", "Methodical problem-solver", "Curious about how vehicles work", "Customer-aware - your work directly affects safety and cost"], salary: "£14k–£20k (apprentice)", entryTip: "Apprenticeships are the dominant route - most main dealers (JLR, BMW, Mercedes, Sytner, Listers, Arnold Clark, Lookers) run 3–4 year programmes with college study. Level 3 IMI Light Vehicle Maintenance & Repair is the gold standard. EV qualifications (IMI TechSafe) are the strongest progression bet." }} /><CareerMap title="Vehicle Technician Career Path" subtitle="From apprentice to dealer principal." stages={careerStages} industry="cars" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Cars" searchQuery="automotive aftersales workshop UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live vehicle technician, MOT, and service advisor roles.</p><Link to="/marketplace?role=vehicle-technician#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Workshop Jobs</Link></div><IndustryCVBuilder industry="Cars" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Vehicle Technician" description="Servicing, MOTs, diagnostics, and bodyshop - the trades that keep the country's vehicles moving." tabs={tabs} category="frontline" />;
};

export default VehicleTechnician;
