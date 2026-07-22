import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Package } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Package, roles: [
    { name: "Warehouse Operative / Picker", description: "Picks, packs and labels orders for dispatch - the heart of every fulfilment centre.", salary: "£11–£13/hr (£22k–£26k)" },
    { name: "Delivery Driver / Rider", description: "Last-mile delivery for grocery, fashion, and food brands.", salary: "£24k–£30k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Forklift / FLT Operator", description: "Licensed to move pallets - moves stock from goods-in to picking faces.", salary: "£26k–£32k" },
    { name: "HGV Class 1/2 Driver", description: "Long-haul or multi-drop driving - the backbone of UK supply chain.", salary: "£32k–£42k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Warehouse Team Leader / Shift Supervisor", description: "Runs a shift on the warehouse floor - KPIs, people, and safety.", salary: "£30k–£38k" },
    { name: "Transport Manager", description: "Owns the fleet and drivers - compliance, routing, and on-time delivery.", salary: "£38k–£52k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Site / Distribution Centre Manager", description: "Owns a whole DC - P&L, headcount, throughput and safety.", salary: "£60k–£90k" },
    { name: "Head of Logistics / Supply Chain Director", description: "Sets the network strategy - DCs, carriers, and last-mile partners.", salary: "£90k–£150k+" },
  ]},
];

const podcasts = [
  { title: "Logistics Manager Podcast", description: "UK supply chain leaders on warehousing, transport and tech.", url: "https://www.logisticsmanager.com/" },
  { title: "The Logistics & Supply Chain Show", description: "Operators on running modern UK distribution centres.", url: "https://www.themhwexhibition.co.uk/" },
];

const articles = [
  { title: "Logistics Manager", source: "Logistics Manager", url: "https://www.logisticsmanager.com/" },
  { title: "Motor Transport", source: "Motor Transport", url: "https://motortransport.co.uk/" },
  { title: "The Loadstar", source: "The Loadstar", url: "https://theloadstar.com/" },
];

const WarehouseDelivery = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="warehouse-delivery" roleName="Warehouse & Delivery" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Warehouse & Delivery" data={{ summary: "Warehouse and delivery workers move every product from the supplier to the customer. They are the engine room of every retailer, grocer, and e-commerce brand. The work is physical and shift-based, but it is also the most reliable route into supply chain leadership.", dayToDay: ["Picking and packing customer orders to deadline", "Operating handheld scanners, conveyors and FLTs", "Loading and unloading vehicles to schedule", "Driving multi-drop or long-haul routes", "Hitting accuracy, safety and on-time-in-full KPIs", "Maintaining vehicle and equipment compliance"], skills: ["Manual Handling", "Forklift / FLT Licence", "HGV Class 1 or 2", "Warehouse Management Systems (WMS)", "Route Planning", "Health, Safety & Compliance"], traits: ["Reliable and punctual - shifts and routes depend on it", "Physically resilient - long days on your feet or behind the wheel", "Detail-focused - pick accuracy matters", "Calm under time pressure"], salary: "£11–£13/hr (£22k–£26k)", entryTip: "Most operators (Ocado, Amazon, Tesco, DPD, Royal Mail) hire warehouse staff with no experience and train on the job. Add an FLT licence within your first year to lift pay quickly. HGV Class 2 then Class 1 unlocks £35k–£45k+ within 2–3 years." }} /><CareerMap title="Warehouse & Delivery Career Path" subtitle="From the warehouse floor to logistics director." stages={careerStages} industry="grocery" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Grocery" searchQuery="logistics warehouse supply chain UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live warehouse, driver and logistics roles across the UK.</p><Link to="/marketplace?role=warehouse-delivery#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Warehouse & Delivery Jobs</Link></div><IndustryCVBuilder industry="Grocery" stages={careerStages} /></>) },
  ];

  return <RolePageLayout slug="warehouse-delivery" name="Warehouse & Delivery" description="Picking, packing, driving, and getting product from supplier to doorstep - the engine room of every retailer." tabs={tabs} category="frontline" />;
};

export default WarehouseDelivery;
