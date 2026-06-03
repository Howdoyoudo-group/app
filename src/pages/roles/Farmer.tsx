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
    { name: "Farm Worker / General Operative", description: "Hands-on day work - livestock, crops, machinery, fencing and seasonal harvest.", salary: "£22k–£28k" },
    { name: "Apprentice (Level 2/3 Agriculture)", description: "Combines on-farm work with college study via a recognised apprenticeship.", salary: "£14k–£20k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Stockperson / Herdsperson", description: "Owns the welfare of a herd - dairy, beef, sheep or pigs.", salary: "£28k–£36k" },
    { name: "Tractor / Combine Operator", description: "Skilled machinery work - drilling, spraying, harvesting at scale.", salary: "£28k–£38k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Farm Manager", description: "Runs the day-to-day P&L of a farm - labour, inputs, yields and compliance.", salary: "£40k–£60k" },
    { name: "Agronomist / Farm Consultant", description: "BASIS / FACTS-qualified - advises farms on crop nutrition and protection.", salary: "£40k–£65k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Estate Manager", description: "Manages a large estate or farming group - multiple sites, diversification income.", salary: "£60k–£90k+" },
    { name: "Farm Owner / Tenant", description: "Owns or tenants the business - full ownership of the land and the P&L.", salary: "Variable" },
  ]},
];

const podcasts = [
  { title: "Farmers Weekly Podcast", description: "The UK's most-read farming title in audio form - markets, policy and on-farm stories.", url: "https://www.fwi.co.uk/podcast" },
  { title: "Farmers Guardian Podcast", description: "Independent UK farming journalism on livestock, arable and rural business.", url: "https://www.fginsight.com/" },
];

const articles = [
  { title: "Farmers Weekly", source: "Farmers Weekly", url: "https://www.fwi.co.uk/" },
  { title: "Farmers Guardian", source: "Farmers Guardian", url: "https://www.fginsight.com/" },
  { title: "AHDB", source: "AHDB", url: "https://ahdb.org.uk/" },
];

const Farmer = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="farmer" roleName="Farmer" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Farmer" data={{ summary: "Farmers and farm workers produce the raw ingredients behind every food, drink and grocery brand in the UK. It's the most under-told frontline role in our food system - and one of the most varied. From dairy and arable to regenerative and direct-to-consumer, modern farming is part craft, part science, part business.", dayToDay: ["Tending livestock - feeding, health checks, calving / lambing", "Operating tractors, combines and specialist machinery", "Managing crop rotations, drilling, spraying and harvest", "Maintaining fences, buildings and farm infrastructure", "Recording yields, inputs and welfare for compliance", "Managing seasonal labour and contractors"], skills: ["Livestock Husbandry", "Crop Management", "Tractor & Machinery Operation", "Farm Compliance (Red Tractor, RSPCA Assured)", "Spray Operator (PA1, PA2)", "Business & Subsidy Knowledge (SFI, ELMS)"], traits: ["Genuine love for the land and animals", "Comfortable with early starts and physical work", "Practical problem-solver - kit breaks, weather changes", "Commercially curious - modern farming is a business"], salary: "£22k–£28k", entryTip: "Most enter via Level 2 / 3 Agriculture apprenticeships at colleges like Harper Adams, Hartpury, Bishop Burton or Reaseheath. Large estates (National Trust, Crown Estate, RSPB), farming groups (Velcourt, Strutt & Parker farms) and direct-to-consumer brands (Riverford, Pipers Farm) all hire frontline workers year-round." }} /><CareerMap title="Farmer Career Path" subtitle="From farm worker to estate manager." stages={careerStages} industry="grocery" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Grocery" searchQuery="farming agriculture UK show" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live farm and agricultural roles across the UK.</p><Link to="/marketplace?role=farmer#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Farming Jobs</Link></div><IndustryCVBuilder industry="Grocery" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Farmer" description="Land, livestock, and crops - the producers who feed the country and supply every food and drink brand." tabs={tabs} category="frontline" />;
};

export default Farmer;
