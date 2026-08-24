import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Building2, Download } from "lucide-react";
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
    { name: "Receptionist / Front Office", description: "Front-of-house service, guest check-in, and the first face of the hotel.", salary: "£25k–£30k" },
    { name: "Duty Manager", description: "Oversees a shift across departments - service, safety, and guest experience.", salary: "£25k–£32k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Front of House Manager", description: "Leads the front office team and owns the guest arrival experience.", salary: "£30k–£40k" },
    { name: "Operations Manager", description: "Coordinates housekeeping, F&B, and front office to keep the hotel running.", salary: "£35k–£48k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Hotel Manager", description: "Runs a single hotel - P&L, team, guest experience, and brand standards.", salary: "£45k–£75k" },
    { name: "General Manager", description: "Owns the full commercial and operational performance of the hotel.", salary: "£55k–£100k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Cluster / Regional GM", description: "Oversees multiple properties and reports into group leadership.", salary: "£90k–£150k" },
    { name: "VP Operations / COO", description: "Group-level role setting standards across an entire hotel brand.", salary: "£150k+" },
  ]},
];

const podcasts = [
  { title: "Hospitality Mavericks", description: "Conversations with leading hospitality founders and operators.", url: "https://hospitalitymavericks.com/podcast/" },
  { title: "The Hotelier's Almanac", description: "Hotel industry insights, trends and operator stories.", url: "https://www.hotelnewsresource.com/" },
];

const articles = [
  { title: "Hotel Owner", source: "Hotel Owner", url: "https://www.hotelowner.co.uk/" },
  { title: "Boutique Hotelier", source: "Boutique Hotelier", url: "https://www.boutiquehotelier.com/" },
  { title: "The Caterer", source: "The Caterer", url: "https://www.thecaterer.com/" },
];

const HotelManager = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="hotel-manager" roleName="Hotel Manager" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Hotel Manager" data={{ summary: "Hotel managers run the day-to-day of a hotel - leading teams across front office, housekeeping, F&B and events, while owning guest experience and commercial performance. It's a hands-on leadership role where standards, people and numbers all matter equally.", dayToDay: ["Walking the floor - guest interactions and standards checks", "Leading daily ops meetings across departments", "Owning P&L, occupancy and ADR (average daily rate)", "Recruiting, training and developing the team", "Managing escalations and VIP guests", "Working with brand and group teams on standards"], skills: ["Hospitality Operations", "Revenue Management", "P&L Ownership", "Team Leadership", "Guest Experience", "Brand Standards", "Health & Safety"], traits: ["Genuinely enjoy hospitality and looking after people", "Comfortable on your feet - long shifts, weekends, festive periods", "Calm under pressure with the ability to switch from guest to spreadsheet quickly", "Naturally raise standards in everyone around you"], salary: "£45k–£75k", entryTip: "Most hotel managers came up through the floor - front office, F&B, or operations. A hospitality degree (e.g. Glion, Les Roches) accelerates progression but isn't essential. Group graduate schemes at IHG, Marriott and Hilton are strong launchpads." }} /><div className="border-2 border-foreground bg-background mb-12"><div className="bg-primary px-5 py-2"><span className="font-display text-[10px] tracking-[0.18em] uppercase font-700 text-primary-foreground">The Download · Industry Briefings</span></div><div className="p-6"><p className="font-body text-sm text-muted-foreground mb-4">Hotel management sits across two industries - get the briefing for both.</p><div className="flex flex-wrap gap-3"><a href="/downloads/download-travel.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-3 font-display font-700 text-xs tracking-[0.1em] uppercase hover:bg-primary hover:text-primary-foreground transition-colors"><Download className="w-4 h-4" />Travel Briefing</a><a href="/downloads/download-hospitality.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-3 font-display font-700 text-xs tracking-[0.1em] uppercase hover:bg-primary hover:text-primary-foreground transition-colors"><Download className="w-4 h-4" />Food & Drink Briefing</a></div></div></div><CareerMap title="Hotel Manager Career Path" subtitle="" stages={careerStages} industry="hospitality" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Hospitality" searchQuery="hotel hospitality conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live hotel management roles.</p><Link to="/marketplace?industry=hospitality#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Hospitality Jobs</Link></div><IndustryCVBuilder industry="Hospitality" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Hotel Manager" description="Running the day-to-day of a hotel - guest experience, team leadership, and commercial performance under one roof." tabs={tabs} category="craft" />;
};

export default HotelManager;
