import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, KeyRound } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: KeyRound, roles: [
    { name: "Lettings Assistant / Trainee", description: "Phone enquiries, viewing bookings, accompanying senior negotiators on viewings.", salary: "£25k–£31k + commission" },
    { name: "Lettings Negotiator", description: "Owns viewings, applications and offer negotiation across a patch of properties.", salary: "£25k–£30k + commission (£28k–£40k OTE)" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Senior Lettings Negotiator", description: "Top biller in branch, mentors juniors, handles higher-end stock.", salary: "£30k–£40k + commission (£40k–£60k OTE)" },
    { name: "Lettings Manager", description: "Runs the lettings side of a branch - team of 2–4, valuations, landlord pitches.", salary: "£35k–£50k + bonus (£50k–£75k OTE)" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Branch Manager (Lettings & Sales)", description: "Owns whole branch P&L - sales and lettings teams under one roof.", salary: "£50k–£75k + bonus (£70k–£110k OTE)" },
    { name: "Area / Regional Lettings Manager", description: "Multi-branch oversight - performance, recruitment, landlord pitches at scale.", salary: "£60k–£85k + car + bonus" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head of Lettings", description: "Sets lettings strategy across a regional or national agency.", salary: "£90k–£150k+" },
    { name: "Director / Owner - Independent Agency", description: "Equity stake - runs the business, valuations, landlord relationships.", salary: "£100k–£300k+ (drawings)" },
  ]},
];

const podcasts = [
  { title: "The Letting Agent Hub Podcast", description: "UK lettings-specific podcast on regulation, lead gen and growing a lettings book.", url: "https://thelettingagenthub.co.uk/" },
  { title: "The Property Hub Podcast", description: "Long-running UK property podcast covering lettings, BTL and the wider market.", url: "https://propertyhub.net/podcasts/" },
];

const articles = [
  { title: "Letting Agent Today", source: "Letting Agent Today", url: "https://www.lettingagenttoday.co.uk/" },
  { title: "Property Industry Eye", source: "PIE", url: "https://propertyindustryeye.com/" },
  { title: "Negotiator Magazine", source: "The Negotiator", url: "https://thenegotiator.co.uk/" },
];

const LettingsNegotiator = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Lettings Negotiator" data={{
        summary: "Lettings negotiators match tenants to rental properties - viewings, referencing, offer negotiation and managing the relationship between tenant and landlord. It's a fast-paced, target-driven sales role with a clear progression to lettings manager and beyond. UK rental demand has consistently outstripped supply, making lettings one of the most active sides of the property industry.",
        dayToDay: ["Phone work - qualifying tenant enquiries", "Viewings (often back-to-back evenings and weekends)", "Negotiating offers between tenant and landlord", "Referencing, right-to-rent checks and contract setup", "Pitching for new landlord instructions", "Liaising with property management on move-in"],
        skills: ["Sales / Negotiation", "Lettings Compliance (Right to Rent, Deposit Schemes)", "Phone & Viewing Skills", "Landlord Relationship Management", "ARLA Propertymark Awareness", "Local Market Knowledge"],
        traits: ["Energetic - branch life moves fast", "Resilient - competitive market, lots of rejection", "Genuinely interested in property and people", "Self-motivated - commission rewards effort"],
        salary: "£25k trainee → £300k+ agency owner",
        entryTip: "Routes in: Apply directly to high-street agencies (Foxtons, Dexters, Hamptons, Knight Frank, Savills) or independent agents. Most train on the job, with sponsored ARLA Propertymark qualifications (Level 3 Lettings & Property Management). No degree required.",
      }} />
      <CareerMap title="Lettings Career Path" subtitle="From trainee to head of lettings or agency owner." stages={careerStages} industry="estate-agency" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="lettings-negotiator" roleName="Lettings Negotiator" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Estate Agency" searchQuery="ARLA Propertymark lettings conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live lettings negotiator roles across the UK.</p><Link to="/marketplace?role=lettings-negotiator#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Lettings Jobs</Link></div><IndustryCVBuilder industry="Estate Agency" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Lettings Negotiator" description="Matching tenants to homes - viewings, referencing and managing landlords across busy rental markets." tabs={tabs} category="craft" />;
};

export default LettingsNegotiator;
