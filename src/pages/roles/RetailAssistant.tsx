import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, ShoppingBag } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: ShoppingBag, roles: [
    { name: "Sales Assistant / Store Colleague", description: "Till work, restocking, customer service on the shop floor.", salary: "£13–£14/hr (£25k–£27k)" },
    { name: "Visual Merchandiser (Junior)", description: "Window displays, in-store layouts, and product presentation.", salary: "£25k–£26k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Supervisor / Team Leader", description: "Runs a shift, manages the team on the floor and handles escalations.", salary: "£25k–£30k" },
    { name: "Assistant Store Manager", description: "Owns rotas, opens and closes, deputises for the Store Manager.", salary: "£26k–£34k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Store Manager", description: "Runs the whole store P&L - sales, team, stock, and customer experience.", salary: "£32k–£48k" },
    { name: "Concession / Flagship Manager", description: "Runs a high-profile site, often inside a department store or flagship location.", salary: "£40k–£55k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Area / Regional Manager", description: "Owns a portfolio of stores across a region - performance, people, and standards.", salary: "£55k–£80k" },
    { name: "Head of Retail / Retail Director", description: "Sets the retail strategy nationally - store estate, formats, and customer experience.", salary: "£90k–£140k+" },
  ]},
];

const podcasts = [
  { title: "Retail Week Podcast", description: "Industry conversations on store performance, customer trends, and retail leadership.", url: "https://www.retail-week.com/podcasts" },
  { title: "Future of Retail", description: "How brands and retailers are reinventing the store experience.", url: "https://www.modernretail.co/podcasts/" },
];

const articles = [
  { title: "Retail Week", source: "Retail Week", url: "https://www.retail-week.com/" },
  { title: "Drapers", source: "Drapers", url: "https://www.drapersonline.com/" },
  { title: "The Grocer", source: "The Grocer", url: "https://www.thegrocer.co.uk/" },
];

const RetailAssistant = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="retail-assistant" roleName="Retail Assistant" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Retail Assistant" data={{ summary: "Retail assistants are the people customers actually meet. They are the face of every brand on the high street and the engine of every store's performance. It's a hugely scalable career - most retail directors started on the till.", dayToDay: ["Serving customers on the till and on the floor", "Restocking, replenishing, and rotating product", "Maintaining visual merchandising standards", "Handling deliveries and stock transfers", "Processing returns and exchanges", "Hitting daily sales and conversion targets"], skills: ["Customer Service", "Cash Handling / EPOS", "Visual Merchandising", "Stock Management", "Up-selling & Add-on Sales", "Health & Safety on the Shop Floor"], traits: ["Genuine warmth with customers - service is everything", "High energy - long shifts on your feet", "Reliable and punctual - shifts depend on it", "Commercially curious - interested in why product sells"], salary: "£13–£14/hr (£25k–£27k)", entryTip: "No formal qualifications needed - most retailers (Tesco, Sainsbury's, ASOS, Next, Selfridges) hire for attitude and train on the job. Get any retail role to start, then push for shift supervisor within 12–18 months. Apprenticeships in Retail Operations are a strong route." }} /><CareerMap title="Retail Career Path" subtitle="From shop floor to retail director." stages={careerStages} industry="grocery" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Grocery" searchQuery="retail conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live retail and shop floor roles across the UK.</p><Link to="/marketplace?role=retail-assistant#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Retail Jobs</Link></div><IndustryCVBuilder industry="Grocery" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Retail Assistant" description="Shop floor service, till work, restocking, and visual merchandising - the people customers actually meet." tabs={tabs} category="frontline" />;
};

export default RetailAssistant;
