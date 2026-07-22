import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, GlassWater } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: GlassWater, roles: [
    { name: "Waiter / Front of House", description: "Service on the floor - taking orders, running food, looking after guests.", salary: "£20k–£26k (+ tips)" },
    { name: "Barback", description: "Supports the bar - restocks, glassware, and learning the craft.", salary: "£20k–£24k (+ tips)" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Bartender", description: "Builds drinks to spec, knows the menu inside out, and owns the guest at the bar.", salary: "£26k–£34k (+ tips)" },
    { name: "Head Waiter / Section Leader", description: "Runs a section of the floor - training juniors and managing service flow.", salary: "£28k–£36k (+ tips)" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head Bartender / Bar Manager", description: "Designs the cocktail menu, manages stock and supplier relationships, leads the bar team.", salary: "£32k–£45k" },
    { name: "Restaurant Manager", description: "Owns service standards, team performance, and venue P&L.", salary: "£38k–£55k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Group Beverage Director", description: "Sets the drinks strategy across multiple venues - sourcing, training, brand partnerships.", salary: "£60k–£90k" },
    { name: "Venue Owner / Operator", description: "Owns or operates a bar or restaurant - the entrepreneurial route.", salary: "Variable" },
  ]},
];

const podcasts = [
  { title: "The Liquid Lunch", description: "Conversations with leading UK bartenders and bar operators.", url: "https://www.classbarmag.com/" },
  { title: "Hospitality Mavericks", description: "Independent operators on building great hospitality businesses.", url: "https://hospitalitymavericks.com/podcast/" },
];

const articles = [
  { title: "Class Magazine", source: "Class", url: "https://www.classbarmag.com/" },
  { title: "Imbibe", source: "Imbibe", url: "https://imbibe.com/" },
  { title: "The Caterer", source: "The Caterer", url: "https://www.thecaterer.com/" },
];

const Bartender = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="bartender" roleName="Bartender / Front of House" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Bartender / Front of House" data={{ summary: "Bartenders and front of house staff are the face of hospitality - they create the atmosphere, deliver the service, and are often the reason guests come back. It's a craft career: drinks knowledge, service standards, and the soft skills of reading a room.", dayToDay: ["Setting up the bar or floor for service", "Building drinks to spec and recommending pairings", "Looking after guests and handling complaints", "Running mise en place - stock, garnish, glassware", "Cashing up and end-of-service reconciliation", "Training juniors and maintaining standards"], skills: ["Cocktail Craft", "Wine & Spirits Knowledge", "Service Standards", "Cash & EPOS", "Allergens & Food Safety", "Teamwork Under Pressure"], traits: ["Genuine love for hospitality and people", "High energy - long shifts on your feet", "Calm under pressure during a busy service", "Curious about drinks, food and culture"], salary: "£20k–£26k (+ tips)", entryTip: "Most start with no experience - get a job in a busy venue and learn on the floor. Personal Licence and WSET wine qualifications are great progression boosters. The best bartenders take pride in the craft and treat it as a long-term career." }} /><CareerMap title="Bartender / FOH Career Path" subtitle="" stages={careerStages} industry="hospitality" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Hospitality" searchQuery="bartender bar hospitality UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live bar and front of house roles.</p><Link to="/marketplace?industry=hospitality#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Hospitality Jobs</Link></div><IndustryCVBuilder industry="Hospitality" stages={careerStages} /></>) },
  ];

  return <RolePageLayout slug="bartender" name="Bartender / Front of House" description="The face of hospitality - service, drinks craft, and creating the atmosphere people come back for." tabs={tabs} category="craft" />;
};

export default Bartender;
