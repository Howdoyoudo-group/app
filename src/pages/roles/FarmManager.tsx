import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Tractor } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Tractor, roles: [
    { name: "Farm Worker / Stockperson", description: "On-the-ground farm experience - essential foundation before management.", salary: "£25k–£28k + accommodation often" },
    { name: "Assistant Farm Manager", description: "Deputy role on a larger farm - learns the P&L, labour and machinery side.", salary: "£28k–£36k + house" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Farm Manager (Mid-size)", description: "Runs a 200–600 ha mixed or specialist farm - labour, inputs, yields, compliance.", salary: "£40k–£55k + house + bonus" },
    { name: "Estate / Block Manager", description: "Manages multiple holdings on behalf of an estate or farming group.", salary: "£50k–£70k + house" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Farm Manager (Large Estate)", description: "Runs 1,000+ ha - multiple managers below, full P&L responsibility.", salary: "£65k–£90k + house + bonus" },
    { name: "Operations Director - Farming Group", description: "Multi-site oversight for groups like Velcourt, Strutt & Parker farms, Co-op Farms.", salary: "£75k–£110k+" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Estate Manager / Head of Farming", description: "Runs farming for a major estate (National Trust, Crown Estate, Duchy of Cornwall).", salary: "£90k–£140k + house" },
    { name: "Tenant / Owner-Farmer", description: "Equity in the business - full ownership of P&L. Income highly variable with markets.", salary: "Variable (£50k–£500k+)" },
  ]},
];

const podcasts = [
  { title: "Farmers Weekly Podcast", description: "The UK's most-read farming title in audio form - markets, policy, on-farm stories.", url: "https://www.fwi.co.uk/podcast" },
  { title: "Farmers Guardian Podcast", description: "Independent UK farming journalism on livestock, arable and rural business.", url: "https://www.fginsight.com/" },
];

const articles = [
  { title: "Farmers Weekly", source: "Farmers Weekly", url: "https://www.fwi.co.uk/" },
  { title: "Farmers Guardian", source: "Farmers Guardian", url: "https://www.fginsight.com/" },
  { title: "AHDB", source: "AHDB", url: "https://ahdb.org.uk/" },
];

const FarmManager = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Farm Manager" data={{
        summary: "Farm managers run the day-to-day P&L of a working farm - labour, machinery, livestock or crops, inputs, yields and compliance. It's part craft, part business - increasingly part data. Most farm managers come up through hands-on roles before stepping into management. Modern farming groups (Velcourt, Sentry, Strutt & Parker farms) and large estates (National Trust, Crown Estate) hire professional farm managers on six-figure packages.",
        dayToDay: ["Daily walk-through - livestock health, crop progress, machinery", "Planning the week's labour, contractors and operations", "Procurement of feed, seed, fertiliser and chemistry", "Liaising with agronomists, vets and consultants", "Compliance - Red Tractor, RSPCA Assured, SFI, ELMS", "Reporting to the owner / board on yields and P&L"],
        skills: ["Farm P&L Management", "Labour & Machinery Planning", "Livestock or Crop Husbandry", "Spray Operator (PA1, PA2)", "Subsidy & Grant Management (SFI, ELMS, Countryside Stewardship)", "Farm Software (Gatekeeper, Muddy Boots, Herdwatch)"],
        traits: ["Practical and hands-on - still walks the fields", "Commercially minded - modern farming is a business", "Calm decision-maker - weather, prices and markets all change fast", "People manager - labour and contractors live or die on relationships"],
        salary: "£40k mid-size farm → £140k+ major estate",
        entryTip: "Routes in: Most start with hands-on farm work then take a BSc Agriculture or Agricultural Business Management at Harper Adams, RAU, Newcastle or SRUC. Velcourt, Strutt & Parker, Sentry and Albanwise all run formal trainee farm manager programmes.",
      }} />
      <CareerMap title="Farm Management Career Path" subtitle="From farm worker to estate manager." stages={careerStages} industry="farming" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="farm-manager" roleName="Farm Manager" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Farming" searchQuery="LAMMA Cereals Royal Highland Show UK farming" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live farm management roles across the UK.</p><Link to="/marketplace?role=farm-manager#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Farm Management Jobs</Link></div><IndustryCVBuilder industry="Farming" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Farm Manager" description="Running a working farm - managing land, livestock, staff and the commercial side of food production." tabs={tabs} category="craft" />;
};

export default FarmManager;
