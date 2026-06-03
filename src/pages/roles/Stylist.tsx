import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Scissors } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Scissors, roles: [
    { name: "Styling Assistant", description: "Pulls samples, steams garments, and assists stylists on shoots and shows.", salary: "£18k–£24k" },
    { name: "Junior Designer", description: "Assists with mood boards, fabric sourcing, and design development.", salary: "£22k–£28k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Fashion Stylist", description: "Styles editorial shoots, campaigns, and brand lookbooks.", salary: "£28k–£45k" },
    { name: "Fashion Designer", description: "Designs collections from concept to production, managing the development process.", salary: "£30k–£48k" },
    { name: "Interior Stylist", description: "Creates interior schemes for editorial, commercial, and residential projects.", salary: "£28k–£42k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Stylist / Style Director", description: "Leads the visual direction of shoots and defines the aesthetic for a brand or publication.", salary: "£45k–£70k" },
    { name: "Senior Designer / Design Manager", description: "Manages a design team and owns a product category or collection.", salary: "£48k–£68k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Creative Director", description: "Sets the overall creative and visual direction for a brand.", salary: "£70k–£120k" },
    { name: "Head of Design", description: "Leads the design function across all categories and collections.", salary: "£65k–£100k" },
  ]},
];

const podcasts = [
  { title: "The Business of Fashion Podcast", description: "BoF's take on fashion industry trends, design, and creative leadership.", url: "https://www.businessoffashion.com/podcasts/" },
  { title: "Vogue Business", description: "Industry analysis on fashion commerce, luxury, and the business of style.", url: "https://www.voguebusiness.com/" },
];

const articles = [
  { title: "Business of Fashion", source: "BoF", url: "https://www.businessoffashion.com/" },
  { title: "Dezeen - Design", source: "Dezeen", url: "https://www.dezeen.com/" },
  { title: "Vogue Business", source: "Vogue Business", url: "https://www.voguebusiness.com/" },
];

const Stylist = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="stylist" roleName="Stylist / Designer" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Stylist / Designer" data={{ summary: "Stylists and designers shape how we see fashion. Whether it's styling editorial shoots, designing collections, or creating interior schemes - this role is about translating creative vision into visual reality. It's highly competitive but deeply rewarding for those with a strong aesthetic eye and relentless work ethic.", dayToDay: ["Researching trends, fabrics, and colour palettes for upcoming seasons", "Creating mood boards, concept presentations, and design sketches", "Pulling samples and styling garments for shoots, shows, or campaigns", "Collaborating with photographers, models, and creative directors", "Managing fittings, alterations, and production timelines", "Building relationships with PRs, brands, and showrooms"], skills: ["Trend Forecasting", "Mood Boarding", "Garment Construction Knowledge", "Art Direction", "Colour Theory", "Adobe Suite / Sketch", "Fabric & Materials", "Editorial Styling"], traits: ["You have a strong, distinctive visual eye", "You're obsessed with detail - proportion, texture, colour", "You're resourceful and can work with tight budgets", "You stay current with culture, art, and street style", "You're comfortable in fast-paced, high-pressure creative environments"], salary: "£18k–£24k", entryTip: "Assist, assist, assist. Most stylists and designers start by assisting established professionals - pulling samples, steaming garments, and learning on the job. A degree in Fashion Design or Styling helps but isn't essential. Build a portfolio on Instagram and through test shoots." }} /><CareerMap title="Stylist / Designer Career Path" subtitle="From assistant to creative director - the design progression." stages={careerStages} industry="fashion" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Fashion" searchQuery="fashion design styling event UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live styling and design roles.</p><Link to="/marketplace?industry=fashion#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Fashion Jobs</Link></div><IndustryCVBuilder industry="Fashion" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Stylist / Designer" description="Trend forecasting, garment design, and shaping the visual identity of brands." tabs={tabs} category="craft" />;
};

export default Stylist;
