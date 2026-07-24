import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, ChefHat } from "lucide-react";
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
  { title: "Entry Level", icon: ChefHat, roles: [
    { name: "Commis Chef", description: "Prepares ingredients, assists senior chefs, and learns kitchen disciplines.", salary: "£20k–£24k" },
    { name: "Kitchen Porter / Apprentice", description: "Supports kitchen operations and learns the fundamentals of professional cooking.", salary: "£18k–£22k" },
    { name: "Baker (Junior)", description: "Mixes, proves, and bakes under supervision, learning recipes and techniques.", salary: "£20k–£24k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Chef de Partie", description: "Runs a section of the kitchen - starters, mains, or pastry.", salary: "£24k–£30k" },
    { name: "Sous Chef", description: "Second in command - manages service, trains juniors, and controls quality.", salary: "£28k–£38k" },
    { name: "Development Chef", description: "Creates and tests new recipes for retail, food service, or restaurant groups.", salary: "£30k–£42k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head Chef", description: "Runs the entire kitchen - menu, team, costs, and service standards.", salary: "£35k–£55k" },
    { name: "Head Baker", description: "Leads bakery production, recipe development, and quality standards.", salary: "£32k–£45k" },
    { name: "Executive Chef", description: "Oversees multiple kitchens or a restaurant group's culinary direction.", salary: "£50k–£80k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Culinary Director", description: "Shapes the food vision for a brand or group, from concept to plate.", salary: "£60k–£100k" },
    { name: "Food Director / Head of NPD", description: "Leads new product development and food innovation for retail or hospitality.", salary: "£55k–£90k" },
  ]},
];

const podcasts = [
  { title: "Off Menu", description: "Ed Gamble and James Acaster invite guests to their dream restaurant.", url: "https://www.offmenupodcast.co.uk/" },
  { title: "The Food Programme (BBC)", description: "BBC Radio 4's long-running exploration of food, farming, and cooking.", url: "https://www.bbc.co.uk/programmes/b006qnx3" },
  { title: "Dish", description: "Nick Grimshaw and Angela Hartnett cook, chat, and explore food culture.", url: "https://www.waitrose.com" },
];

const articles = [
  { title: "The Caterer", source: "The Caterer", url: "https://www.thecaterer.com/" },
  { title: "Great British Chefs", source: "GBC", url: "https://www.greatbritishchefs.com/" },
  { title: "British Baker", source: "British Baker", url: "https://bakeryinfo.co.uk/" },
];

const Chef = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="chef" roleName="Chef / Baker" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Chef / Baker" data={{ summary: "Chefs and bakers create the food and baked goods that define restaurants, bakeries, and food brands. It's physically demanding, creatively rewarding, and one of the most meritocratic industries - talent and hard work matter more than qualifications. From fine dining to artisan bakeries, the kitchen is where ideas become edible.", dayToDay: ["Preparing, cooking, and plating dishes during service", "Developing recipes, menus, and seasonal specials", "Managing food costs, stock, and supplier relationships", "Training and managing junior kitchen staff", "Maintaining hygiene, food safety, and quality standards", "Working early mornings (bakers) or late evenings (chefs) in high-pressure environments"], skills: ["Knife Skills & Technique", "Menu Development", "Food Safety (Level 2/3)", "Stock & Cost Control", "Pastry & Baking", "Team Leadership", "Time Management", "Palate & Flavour Knowledge"], traits: ["You're passionate about food - cooking, eating, and learning", "You can handle pressure and stay calm in a fast kitchen", "You're physically fit and happy on your feet for long hours", "You enjoy working with your hands and seeing immediate results", "You're disciplined - consistency matters as much as creativity"], salary: "£20k–£25k", entryTip: "Many chefs start as commis or kitchen porters - no degree required. Culinary school (Le Cordon Bleu, Leiths, City & Guilds NVQ) accelerates learning, but the best training happens in a real kitchen. Stage (work experience) at top restaurants is how many break through." }} /><CareerMap title="Chef / Baker Career Path" subtitle="From commis to culinary director - the kitchen progression." stages={careerStages} industry="hospitality" /></>) },
    { id: "learn", label: "Learn", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Courses & Qualifications<span className="text-primary">.</span></h2><div className="space-y-4">{[{ title: "Le Cordon Bleu London", description: "World-renowned culinary school offering diplomas in cuisine and pâtisserie.", url: "https://www.cordonbleu.edu/london/" }, { title: "City & Guilds NVQ in Professional Cookery", description: "The standard UK qualification for professional chefs, from Level 1 to Level 3.", url: "https://www.cityandguilds.com/" }, { title: "Leiths School of Food and Wine", description: "Professional chef training and food writing courses in London.", url: "https://www.leiths.com/" }].map((c) => (<a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{c.description}</p></a>))}</div><OnlineLearningGrid roleName="Chef / Baker" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Hospitality" searchQuery="chef food hospitality event UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live chef and baker roles.</p><Link to="/marketplace?industry=hospitality#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Hospitality Jobs</Link></div><IndustryCVBuilder industry="Hospitality" stages={careerStages} /></>) },
  ];

  return <RolePageLayout slug="chef" name="Chef / Baker" description="Recipe development, kitchen leadership, and the craft of making food people love." tabs={tabs} category="craft" />;
};

export default Chef;
