import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, ShoppingCart } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: ShoppingCart, roles: [
    { name: "Buying Admin Assistant (BAA)", description: "Critical path, sample chasing, supplier liaison, range admin. Standard entry route.", salary: "£25k–£28k" },
    { name: "Allocator (Merchandising side)", description: "Allocates stock to stores, monitors sell-through, partners with the buyer.", salary: "£25k–£30k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Assistant Buyer / Junior Buyer", description: "Supports senior buyer on a category - supplier negotiation, range building, trade meetings.", salary: "£32k–£42k" },
    { name: "Buyer", description: "Owns a category - full P&L, supplier strategy, trend direction.", salary: "£45k–£65k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Buyer / Category Manager", description: "Bigger category, larger team, owns commercial relationship with strategic suppliers.", salary: "£60k–£90k" },
    { name: "Head of Buying - Department", description: "Runs a buying department (e.g. Womenswear Casual, Fresh Produce, Beauty).", salary: "£80k–£130k+ bonus" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Buying Director", description: "Owns whole buying P&L for a major brand - Selfridges, John Lewis, Tesco, ASOS.", salary: "£140k–£250k+ bonus" },
    { name: "Chief Commercial / Trading Officer", description: "Board-level - sets commercial strategy across all categories and channels.", salary: "£250k–£700k+ (incl. equity)" },
  ]},
];

const podcasts = [
  { title: "Drapers Podcast", description: "The UK fashion industry's leading trade publication's official podcast - buying, retail, brands.", url: "https://www.drapersonline.com/podcasts" },
  { title: "Retail Week Podcast", description: "UK retail trade publication's podcast - covers buying, merchandising and retail strategy.", url: "https://www.retail-week.com/podcasts" },
];

const articles = [
  { title: "Drapers", source: "Drapers", url: "https://www.drapersonline.com/" },
  { title: "Retail Week", source: "Retail Week", url: "https://www.retail-week.com/" },
  { title: "The Grocer", source: "The Grocer", url: "https://www.thegrocer.co.uk/" },
];

const Buyer = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Buyer / Merchandiser" data={{
        summary: "Buyers decide what brands stock and sell. They own the range, the suppliers, the trade calendar and the commercial outcome of a category. Most buyers come up through the Buying Admin Assistant (BAA) → Assistant Buyer → Buyer ladder, working closely with merchandisers (the data and stock side). It's one of the most commercially exposed careers in retail - your decisions show up in the P&L every week.",
        dayToDay: ["Supplier meetings - UK and international", "Reviewing samples and signing off ranges", "Trade meetings with the merchandiser, weekly performance reviews", "Trend research and competitor analysis", "Negotiation on cost prices, margins, terms", "Critical path management - getting stock from sample to shop floor"],
        skills: ["Range Planning", "Supplier Negotiation", "Margin & Markup Calculation", "Trend Forecasting", "Critical Path Management", "Excel / Microsoft AX / Oracle Retail"],
        traits: ["Commercial - every decision affects the P&L", "Visually literate - taste matters", "Resilient negotiator - suppliers push back hard", "Highly organised - managing 100+ SKUs at once is normal"],
        salary: "£25k BAA → £700k+ CCO",
        entryTip: "Routes in: Most enter via a graduate scheme - Marks & Spencer, John Lewis, Next, ASOS, Tesco, Sainsbury's, Selfridges all run rotational buying & merchandising programmes. Open to any degree but business, fashion or maths backgrounds dominate. Direct entry as a BAA also possible.",
      }} />
      <CareerMap title="Buying Career Path" subtitle="From BAA to Chief Commercial Officer." stages={careerStages} industry="fashion" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="buyer" roleName="Buyer / Merchandiser" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Fashion" searchQuery="Pure London Drapers buying conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live buying and merchandising roles across UK retail.</p><Link to="/marketplace?role=buyer#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Buying Jobs</Link></div><IndustryCVBuilder industry="Fashion" stages={careerStages} /></>) },
  ];
  return <RolePageLayout slug="buyer" name="Buyer / Merchandiser" description="Choosing what brands stock and sell - range planning, supplier relationships and the numbers behind every product on the shelf." tabs={tabs} category="business" />;
};

export default Buyer;
