import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Wheat } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Wheat, roles: [
    { name: "General Farm Worker", description: "All-round farm work - livestock feeding, fencing, harvest help, machinery operation.", salary: "£25k–£26k (often + accommodation)" },
    { name: "Seasonal Picker / Harvest Worker", description: "Soft fruit, veg, hops, vines - peak-season demand from May to October.", salary: "£12–£15/hr + piece-rate" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Stockperson / Herdsperson", description: "Owns the welfare of a herd - dairy, beef, sheep or pigs. Often on-call.", salary: "£28k–£36k + house" },
    { name: "Tractor / Combine Operator", description: "Skilled machinery work - drilling, spraying (PA1/PA2), harvesting at scale.", salary: "£28k–£38k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Foreman / Working Supervisor", description: "Runs a small team day-to-day under the farm manager.", salary: "£32k–£42k + house" },
    { name: "Specialist Operator (Robotic Milking, Precision Drill)", description: "Niche tech skills - robotic dairy, GPS-guided machinery, slurry contracting.", salary: "£32k–£45k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Assistant / Deputy Farm Manager", description: "Stepping stone to full farm manager - learning the P&L and labour side.", salary: "£36k–£48k + house" },
    { name: "Farm Manager", description: "Full P&L of a working farm - see Farm Manager role page for full ladder.", salary: "£40k–£140k+ depending on scale" },
  ]},
];

const podcasts = [
  { title: "Farmers Weekly Podcast", description: "The UK's most-read farming title - markets, policy and on-farm stories.", url: "https://www.fwi.co.uk/podcast" },
  { title: "Just Farmers Podcast", description: "First-person stories from working UK farmers across livestock, arable and dairy.", url: "https://justfarmers.org/" },
];

const articles = [
  { title: "Farmers Weekly", source: "Farmers Weekly", url: "https://www.fwi.co.uk/" },
  { title: "Farmers Guardian", source: "Farmers Guardian", url: "https://www.fginsight.com/" },
  { title: "AHDB Beef & Lamb / Dairy", source: "AHDB", url: "https://ahdb.org.uk/" },
];

const FarmWorker = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Farm Worker" data={{
        summary: "Farm workers are the people who actually do the work of British food production - feeding livestock, driving tractors, harvesting crops, mending fences. It's hands-on, physical, often outdoors in all weather. It's also the proven entry route into farm management - almost every UK farm manager started this way. Many roles include accommodation as part of the package.",
        dayToDay: ["Feeding and checking livestock (dairy, beef, sheep, pigs)", "Driving tractors and operating machinery", "Seasonal harvest, drilling, spraying, baling", "Fencing, hedging and infrastructure repair", "Mucking out, calving / lambing assistance", "Loading and unloading deliveries"],
        skills: ["Livestock Husbandry", "Tractor & Telehandler Operation", "Spray Operator (PA1 / PA2 - usually sponsored)", "Manual Handling", "Basic Mechanics", "Health & Safety on Farm"],
        traits: ["Genuinely loves outdoor, physical work", "Comfortable with early starts (4am milking is real)", "Practical problem-solver", "Cares about animals and the land"],
        salary: "£25k entry → progresses into management",
        entryTip: "Routes in: Apply directly to working farms, large estates (National Trust, Crown Estate, RSPB), farming groups (Velcourt, Sentry) or direct-to-consumer producers (Riverford, Pipers Farm). Level 2 / 3 Agriculture apprenticeships at Harper Adams, Hartpury, Bishop Burton, Reaseheath. The Institute for Agriculture and Horticulture (TIAH) has a great careers tool.",
      }} />
      <CareerMap title="Farm Worker Career Path" subtitle="From general worker to farm manager." stages={careerStages} industry="farming" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="farm-worker" roleName="Farm Worker" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Farming" searchQuery="LAMMA Royal Welsh Show UK farming" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live farm worker and stockperson roles across the UK.</p><Link to="/marketplace?role=farm-worker#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Farm Worker Jobs</Link></div><IndustryCVBuilder industry="Farming" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Farm Worker" description="Hands-on land and livestock work - the seasonal and year-round labour that keeps farms producing." tabs={tabs} category="frontline" />;
};

export default FarmWorker;
