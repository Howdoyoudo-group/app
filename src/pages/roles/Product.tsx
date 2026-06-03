import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Target, TrendingUp, BarChart3, Box } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const industryExamples = [
  { industry: "Fashion", examples: [{ company: "ASOS", role: "Product Management" }, { company: "ME+EM", role: "Product Development" }], slug: "/fashion" },
  { industry: "Film and TV", examples: [{ company: "Netflix", role: "Product (Streaming)" }, { company: "MUBI", role: "Product Design" }], slug: "/cinema" },
  { industry: "Music", examples: [{ company: "Spotify", role: "Product Management" }, { company: "DICE", role: "Product (Ticketing)" }], slug: "/music" },
  { industry: "Grocery", examples: [{ company: "Ocado", role: "Product (Tech & Logistics)" }, { company: "Deliveroo", role: "Product (Marketplace)" }], slug: "/grocery" },
];

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Target, roles: [
    { name: "Associate Product Manager", description: "Supports product leads with research, backlog grooming, and feature scoping.", salary: "£30k–£40k" },
    { name: "Product Analyst", description: "Analyses user data and product metrics to inform roadmap prioritisation.", salary: "£28k–£38k" },
  ]},
  { title: "Mid Level", icon: Box, roles: [
    { name: "Product Manager", description: "Owns a product area end-to-end - from discovery and design to delivery and iteration.", salary: "£45k–£65k" },
    { name: "UX/Product Designer", description: "Designs user experiences that balance business goals with customer needs.", salary: "£40k–£60k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Product Manager", description: "Leads complex product initiatives, mentors junior PMs, and shapes product strategy.", salary: "£65k–£90k" },
    { name: "Head of Product", description: "Manages the product team and owns the product vision and roadmap.", salary: "£80k–£110k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "VP of Product", description: "Oversees multiple product lines and aligns product strategy with business goals.", salary: "£100k–£150k" },
    { name: "Chief Product Officer", description: "C-suite leader responsible for the entire product organisation and innovation.", salary: "£130k–£200k+" },
  ]},
];

const podcasts = [
  { title: "Lenny's Podcast", description: "Interviews with world-class product leaders on building and growing products.", url: "https://www.lennyspodcast.com/" },
  { title: "Product Thinking", description: "Melissa Perri explores how great product teams work and think.", url: "https://produxlabs.com/product-thinking" },
  { title: "Mind the Product", description: "Articles, talks, and community insights for product managers worldwide.", url: "https://www.mindtheproduct.com/" },
];

const articles = [
  { title: "Mind the Product", source: "Mind the Product", url: "https://www.mindtheproduct.com/" },
  { title: "Silicon Valley Product Group", source: "SVPG", url: "https://www.svpg.com/articles/" },
  { title: "Product School Blog", source: "Product School", url: "https://productschool.com/blog" },
];

const Product = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="product" roleName="Product" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "work", label: "Who?", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Product Exists<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-8">Product looks different in every industry.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{industryExamples.map((item) => (<div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors"><div className="flex items-center gap-3 mb-3"><IndustryIcon industry={item.industry} /><Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">Product in {item.industry}</Link></div><ul className="space-y-1">{item.examples.map((ex) => (<li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full shrink-0" /><span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span></li>))}</ul><Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">Explore industry <ArrowRight className="w-3 h-3" /></Link></div>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Product" data={{ summary: "Product managers are the people who decide what gets built and why. They sit at the intersection of business, technology, and design - prioritising features, running user research, and shipping products that solve real problems. It's one of the fastest-growing roles in business, and exists across every industry with a digital product.", dayToDay: ["Defining product vision and roadmap priorities", "Running user research, interviews, and usability tests", "Writing user stories and product requirements", "Working with engineers and designers to ship features", "Analysing product metrics - retention, activation, engagement", "Balancing stakeholder requests with customer needs"], skills: ["Product Discovery", "Roadmap Planning", "User Research", "Data Analysis (SQL, Amplitude)", "Agile / Scrum", "Wireframing (Figma)", "A/B Testing", "Stakeholder Communication"], traits: ["You love understanding customer problems deeply", "You're comfortable making decisions with imperfect information", "You can translate between technical and non-technical audiences", "You're obsessed with outcomes, not just outputs", "You enjoy building things - even if you're not writing the code"], salary: "£28k–£40k", entryTip: "Product is hard to break into directly. Many PMs start in adjacent roles - consulting, project management, UX, engineering, or customer success. Building a side project, earning a Product School certificate, or joining an APM programme (Google, Meta, Deliveroo) are strong routes in." }} /><CareerMap title="Product Career Path" subtitle="From associate PM to CPO - the typical progression for product professionals." stages={careerStages} industry="product" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Product" searchQuery="product management conference" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live product roles across all industries.</p><Link to="/marketplace?role=Product#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Product Jobs</Link></div><IndustryCVBuilder industry="Product" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Product" description="From concept to launch - the people who build what customers actually use." tabs={tabs} category="business" />;
};

export default Product;
