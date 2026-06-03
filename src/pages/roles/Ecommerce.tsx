import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Target, TrendingUp, BarChart3, ShoppingCart } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const industryExamples = [
  { industry: "Fashion", examples: [{ company: "ASOS", role: "E-commerce & Trading" }, { company: "ME+EM", role: "Online Retail" }], slug: "/fashion" },
  { industry: "Grocery", examples: [{ company: "Ocado", role: "Online Grocery Platform" }, { company: "Tesco", role: "E-commerce Operations" }], slug: "/grocery" },
  { industry: "Footwear", examples: [{ company: "Nike", role: "DTC E-commerce" }, { company: "Dr. Martens", role: "Digital Commerce" }], slug: "/footwear" },
  { industry: "Coffee", examples: [{ company: "Grind", role: "DTC & Subscriptions" }, { company: "Minor Figures", role: "Online Sales" }], slug: "/coffee" },
];

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Target, roles: [
    { name: "E-commerce Coordinator", description: "Manages product listings, site updates, and assists with online trading.", salary: "£22k–£30k" },
    { name: "Digital Merchandiser", description: "Curates online product ranges and optimises site layout for conversion.", salary: "£24k–£32k" },
  ]},
  { title: "Mid Level", icon: ShoppingCart, roles: [
    { name: "E-commerce Manager", description: "Owns the online sales channel - trading, conversion, and customer experience.", salary: "£38k–£55k" },
    { name: "CRO / Growth Manager", description: "Optimises the customer journey to maximise conversion and average order value.", salary: "£40k–£58k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head of E-commerce", description: "Leads the e-commerce function, setting strategy across platforms and markets.", salary: "£60k–£85k" },
    { name: "Head of Digital Trading", description: "Owns online revenue performance, merchandising strategy, and promotions.", salary: "£65k–£90k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "E-commerce Director", description: "Sets the digital commerce vision and leads cross-functional delivery.", salary: "£85k–£130k" },
    { name: "Chief Digital Officer", description: "C-suite leader responsible for the company's digital revenue and transformation.", salary: "£120k–£180k+" },
  ]},
];

const podcasts = [
  { title: "The Ecommerce Podcast", description: "Stories and strategies from e-commerce founders and leaders.", url: "https://ecommerce-podcast.com/" },
  { title: "Shopify Masters", description: "Entrepreneurs share how they built successful online stores from scratch.", url: "https://www.shopify.com/blog/topics/podcasts" },
];

const articles = [
  { title: "Econsultancy", source: "Econsultancy", url: "https://econsultancy.com/" },
  { title: "Internet Retailing", source: "Internet Retailing", url: "https://internetretailing.net/" },
  { title: "Shopify Blog", source: "Shopify", url: "https://www.shopify.com/blog" },
];

const Ecommerce = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="ecommerce" roleName="E-commerce" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "work", label: "Who?", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where E-commerce Exists<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-8">E-commerce exists wherever products meet digital customers.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{industryExamples.map((item) => (<div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors"><div className="flex items-center gap-3 mb-3"><IndustryIcon industry={item.industry} /><Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">E-commerce in {item.industry}</Link></div><ul className="space-y-1">{item.examples.map((ex) => (<li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full shrink-0" /><span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span></li>))}</ul><Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">Explore industry <ArrowRight className="w-3 h-3" /></Link></div>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="E-commerce" data={{ summary: "E-commerce is the digital storefront of modern business. It covers everything from managing product listings and optimising conversion rates to running paid media, analysing customer journeys, and driving online revenue. If you love the intersection of technology, data, and consumer behaviour, this is your space.", dayToDay: ["Managing product listings, content, and on-site merchandising", "Analysing site performance - traffic, conversion, and AOV", "Running A/B tests to improve the customer journey", "Collaborating with marketing on paid media and SEO", "Managing marketplace channels (Amazon, eBay, Zalando)", "Reporting on trading performance and forecasting revenue"], skills: ["Google Analytics / GA4", "CRO & A/B Testing", "Shopify / Magento / Salesforce Commerce", "SEO & Paid Media", "Data Analysis", "Merchandising", "UX Awareness", "Marketplace Management"], traits: ["You're data-driven but creative in how you solve problems", "You're curious about why people buy (and why they don't)", "You enjoy the pace of daily trading and real-time optimisation", "You're comfortable with tech platforms and learning new tools", "You like seeing direct, measurable impact from your work"], salary: "£22k–£30k", entryTip: "E-commerce is accessible - many start as coordinators or digital assistants. Google Analytics certification, Shopify knowledge, and a portfolio of personal projects can help you stand out. Brands increasingly value real trading experience over formal qualifications." }} /><CareerMap title="E-commerce Career Path" subtitle="From coordinator to CDO - the typical progression for e-commerce professionals." stages={careerStages} industry="ecommerce" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="E-commerce" searchQuery="ecommerce retail conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live e-commerce roles across all industries.</p><Link to="/marketplace?role=E-commerce#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View E-commerce Jobs</Link></div><IndustryCVBuilder industry="E-commerce" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="E-commerce" description="Online retail, digital storefronts, and conversion - where technology meets the customer." tabs={tabs} category="business" />;
};

export default Ecommerce;
