import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Coffee } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";
import OnlineLearningGrid from "@/components/OnlineLearningGrid";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Coffee, roles: [
    { name: "Barista", description: "Prepares espresso-based drinks, steams milk, and delivers great customer service.", salary: "£25k–£29k" },
    { name: "Trainee Barista", description: "Learns espresso technique, drink recipes, and café operations.", salary: "£25k–£29k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Senior Barista / Shift Supervisor", description: "Leads shifts, trains new baristas, and ensures quality and service standards.", salary: "£25k–£30k" },
    { name: "Barista Trainer", description: "Develops and delivers training programmes across café locations.", salary: "£26k–£34k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Café Manager", description: "Runs a café - P&L, team management, stock, and customer experience.", salary: "£28k–£38k" },
    { name: "Head Barista / Quality Lead", description: "Sets quality standards, develops recipes, and leads coffee sourcing decisions.", salary: "£30k–£40k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Area / Regional Manager", description: "Oversees multiple sites, driving consistency and performance across a region.", salary: "£38k–£55k" },
    { name: "Head of Coffee / Coffee Director", description: "Leads the entire coffee programme - sourcing, roasting, training, and brand.", salary: "£45k–£70k" },
  ]},
];

const podcasts = [
  { title: "Cat & Cloud Coffee Podcast", description: "Conversations about specialty coffee, café culture, and the craft of the barista.", url: "https://catandcloud.com/pages/podcast" },
  { title: "Keys to the Shop", description: "Career growth, shop management, and barista skills from industry professionals.", url: "https://open.spotify.com/show/5HrmlTKFwWDFoW4ojb1A4g" },
  { title: "Tim Wendelboe Podcast", description: "Insights from the 2004 World Barista Champion on roasting, sourcing, and coffee craft.", url: "https://timwendelboe.podbean.com/" },
];

const articles = [
  { title: "Sprudge", source: "Sprudge", url: "https://sprudge.com/" },
  { title: "Perfect Daily Grind", source: "Perfect Daily Grind", url: "https://perfectdailygrind.com/" },
  { title: "European Coffee Trip", source: "European Coffee Trip", url: "https://europeancoffeetrip.com/" },
];

const Barista = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="barista" roleName="Barista" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Barista" data={{ summary: "Being a barista is far more than making coffee. It's a craft role that combines technical skill, sensory knowledge, and customer experience. The best baristas understand extraction science, origin stories, and how to create a space people want to come back to. It's also a launchpad into coffee roasting, training, and business.", dayToDay: ["Pulling espresso shots and dialling in grinders", "Steaming milk and creating latte art", "Educating customers on beans, origins, and brew methods", "Maintaining equipment - cleaning, calibrating, troubleshooting", "Managing stock, opening/closing, and cash handling", "Building relationships with regulars and creating atmosphere"], skills: ["Espresso Technique", "Milk Texturing", "Sensory Skills (Cupping)", "Brew Methods", "Customer Service", "Speed & Consistency", "Equipment Maintenance", "Stock Management"], traits: ["You care about quality and consistency in everything you do", "You're a people person who enjoys face-to-face interaction", "You're curious about where coffee comes from and how it's made", "You thrive in fast-paced environments", "You take pride in the craft - even when it's busy"], salary: "£25k–£29k", entryTip: "Most baristas learn on the job - no qualifications are needed to start. An SCA certificate or barista course can help you stand out. The best way in is to visit speciality coffee shops, show genuine interest, and ask about training opportunities." }} /><CareerMap title="Barista Career Path" subtitle="From trainee barista to coffee director - the craft progression." stages={careerStages} industry="coffee" /></>) },
    { id: "learn", label: "Learn", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Courses & Certifications<span className="text-primary">.</span></h2><div className="space-y-4">{[{ title: "SCA Coffee Skills Programme", description: "The global standard for coffee education - from Introduction to Professional level.", url: "https://sca.coffee/education/coffee-skills-program" }, { title: "City & Guilds Barista Skills", description: "UK-recognised qualification covering espresso preparation, milk technique, and drink presentation.", url: "https://www.cityandguilds.com/" }, { title: "London School of Coffee", description: "Hands-on barista courses from beginner to advanced, based in central London.", url: "https://londonschoolofcoffee.com/" }].map((c) => (<a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{c.description}</p></a>))}</div><OnlineLearningGrid roleName="Barista" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Coffee" searchQuery="coffee barista competition UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live barista and coffee roles.</p><Link to="/marketplace?industry=coffee#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Coffee Jobs</Link></div><IndustryCVBuilder industry="Coffee" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Barista" description="The craft of coffee - from espresso technique to customer experience on the shop floor." tabs={tabs} category="craft" />;
};

export default Barista;
