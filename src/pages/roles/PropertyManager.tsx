import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Building2 } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Building2, roles: [
    { name: "Property Management Assistant", description: "Inbound queries, contractor coordination, basic compliance admin.", salary: "£22k–£26k" },
    { name: "Property Manager (Trainee)", description: "Owns a small portfolio (50–80 units) under supervision while studying ARLA.", salary: "£26k–£32k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Property Manager", description: "Owns a portfolio of 100–200 rental units - repairs, deposits, inspections, renewals.", salary: "£32k–£42k" },
    { name: "Senior Property Manager", description: "Larger / more complex portfolio - high-value stock or block management.", salary: "£40k–£55k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Block / Estate Manager", description: "Manages leasehold blocks - service charges, AGMs, major works, residents' associations.", salary: "£45k–£65k" },
    { name: "Head of Property Management", description: "Runs the PM department - team leadership, processes, lender / landlord SLAs.", salary: "£60k–£85k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Director - Property Management", description: "Owns the PM strategy across a national agency or block management firm.", salary: "£90k–£150k+" },
    { name: "Founder / MD - Independent PM Firm", description: "Equity stake - runs the business, landlord relationships and growth.", salary: "£100k–£300k+ (drawings)" },
  ]},
];

const podcasts = [
  { title: "The Property Management Podcast", description: "UK property management-focused - compliance, blocks, build-to-rent and team operations.", url: "https://www.propertymark.co.uk/" },
  { title: "The Property Hub Podcast", description: "Long-running UK property podcast covering management, lettings and BTL.", url: "https://propertyhub.net/podcasts/" },
];

const articles = [
  { title: "Property Industry Eye", source: "PIE", url: "https://propertyindustryeye.com/" },
  { title: "News on the Block", source: "News on the Block", url: "https://www.newsontheblock.com/" },
  { title: "ARLA Propertymark", source: "Propertymark", url: "https://www.propertymark.co.uk/news.html" },
];

const PropertyManager = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Property Manager" data={{
        summary: "Property managers look after rental properties on behalf of landlords - repairs, inspections, deposits, compliance, renewals and the relationship between landlord and tenant. The role splits into two main paths: residential (single AST units) and block management (whole leasehold buildings). With 4.6m UK rental homes and growing build-to-rent stock, the role is in structural undersupply.",
        dayToDay: ["Logging and dispatching maintenance tickets", "Coordinating contractors (plumbers, electricians, gas safety)", "Periodic property inspections", "Processing tenancy renewals and rent reviews", "Managing deposit returns and disputes (DPS / TDS)", "Compliance - gas safety, EICRs, EPCs, smoke alarms"],
        skills: ["Tenancy Law (Housing Act, Section 21/8)", "Compliance (Gas Safety, EICR, EPC, HHSRS)", "Contractor Management", "Service Charge & Block Accounting (TPI/IRPM for blocks)", "Conflict Resolution", "Property Software (Reapit, Alto, Jupix)"],
        traits: ["Calm under pressure - emergencies and angry tenants are part of the job", "Highly organised - 200 properties means 200 plates spinning", "Practical problem-solver", "Good written communicator - paper trails matter legally"],
        salary: "£22k assistant → £300k+ firm owner",
        entryTip: "Routes in: Apply to lettings agencies (Foxtons, Dexters, Leaders, Romans), block management firms (FirstPort, Rendall & Rittner, Y&Y) or build-to-rent operators (Greystar, Get Living). ARLA Propertymark Level 3 (residential) or IRPM / TPI qualifications (block) are the standard credentials.",
      }} />
      <CareerMap title="Property Management Career Path" subtitle="From assistant to head of department or firm founder." stages={careerStages} industry="estate-agency" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="property-manager" roleName="Property Manager" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Estate Agency" searchQuery="property management conference UK ARLA IRPM" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live property management roles across the UK.</p><Link to="/marketplace?role=property-manager#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View PM Jobs</Link></div><IndustryCVBuilder industry="Estate Agency" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Property Manager" description="Looking after a portfolio of rented homes - repairs, compliance, inspections and keeping landlords and tenants happy." tabs={tabs} category="craft" />;
};

export default PropertyManager;
