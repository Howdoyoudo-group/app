import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Target, TrendingUp, BarChart3, Palette } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const industryExamples = [
  { industry: "Fashion", examples: [{ company: "Burberry", role: "Textile & Print Design" }, { company: "Alexander McQueen", role: "Creative Direction" }], slug: "/fashion" },
  { industry: "Film and TV", examples: [{ company: "A24", role: "Key Art & Graphic Design" }, { company: "Netflix", role: "Motion Design" }], slug: "/cinema" },
  { industry: "Music", examples: [{ company: "Spotify", role: "Brand Design" }, { company: "Warner Music", role: "Art Direction" }], slug: "/music" },
  { industry: "Coffee", examples: [{ company: "Grind", role: "Brand & Packaging Design" }, { company: "Minor Figures", role: "Illustration & Identity" }], slug: "/coffee" },
  { industry: "Interior Design", examples: [{ company: "Tom Dixon", role: "Product & Industrial Design" }], slug: "/interior-design" },
];

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Target, roles: [
    { name: "Junior Designer", description: "Creates assets under direction - layouts, social graphics, and brand collateral.", salary: "£22k–£30k" },
    { name: "Design Intern", description: "Assists the creative team with production work, mood boards, and concept development.", salary: "£20k–£25k" },
  ]},
  { title: "Mid Level", icon: Palette, roles: [
    { name: "Graphic Designer", description: "Owns visual output across print and digital, maintaining brand consistency.", salary: "£30k–£45k" },
    { name: "Art Director", description: "Leads the visual direction of campaigns, managing designers and external creatives.", salary: "£42k–£60k" },
    { name: "Motion Designer", description: "Creates animated content for social, broadcast, and digital platforms.", salary: "£35k–£52k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Designer / Design Lead", description: "Shapes creative output across the brand, mentoring junior talent.", salary: "£50k–£70k" },
    { name: "Head of Creative", description: "Owns the creative vision and manages the design team and external agencies.", salary: "£65k–£90k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Creative Director", description: "Sets the overall creative direction for the brand across all touchpoints.", salary: "£80k–£130k" },
    { name: "Chief Creative Officer", description: "C-suite leader responsible for brand identity, innovation, and creative culture.", salary: "£120k–£200k+" },
  ]},
];

const podcasts = [
  { title: "Creative Boom Podcast", description: "Conversations with designers, illustrators, and creative leaders.", url: "https://www.creativeboom.com/podcast/" },
  { title: "The Honest Designers Show", description: "Real talk about the creative industry - freelancing, burnout, and growth.", url: "https://www.youtube.com/@TomRoss" },
  { title: "Design Matters", description: "Debbie Millman interviews the world's most creative people.", url: "https://www.designmattersmedia.com/" },
];

const articles = [
  { title: "It's Nice That", source: "It's Nice That", url: "https://www.itsnicethat.com/" },
  { title: "Creative Review", source: "Creative Review", url: "https://www.creativereview.co.uk/" },
  { title: "Eye on Design (AIGA)", source: "AIGA", url: "https://eyeondesign.aiga.org" },
];

const Creative = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="creative" roleName="Creative" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "work", label: "Who?", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Creative Exists<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-8">Creative looks different in every industry.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{industryExamples.map((item) => (<div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors"><div className="flex items-center gap-3 mb-3"><IndustryIcon industry={item.industry} /><Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">Creative in {item.industry}</Link></div><ul className="space-y-1">{item.examples.map((ex) => (<li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full shrink-0" /><span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span></li>))}</ul><Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">Explore industry <ArrowRight className="w-3 h-3" /></Link></div>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Creative" data={{ summary: "Creative professionals shape how brands look, feel, and communicate. From graphic design and art direction to motion, illustration, and brand identity - this role is about visual problem-solving. Every industry needs creative talent, and the best creatives combine aesthetic skill with strategic thinking.", dayToDay: ["Designing brand assets - logos, campaigns, packaging, social content", "Developing creative concepts and mood boards for campaigns", "Art directing photo and video shoots", "Collaborating with marketing, product, and content teams", "Presenting creative work to stakeholders and clients", "Maintaining brand guidelines and visual consistency"], skills: ["Adobe Creative Suite", "Figma / Sketch", "Typography", "Art Direction", "Motion Design (After Effects)", "Brand Identity", "Photography Direction", "Visual Storytelling"], traits: ["You have a strong visual eye and care about detail", "You're both creative and strategic in your thinking", "You can take constructive feedback and iterate quickly", "You stay current with design trends and cultural movements", "You enjoy solving problems through visual communication"], salary: "£20k–£30k", entryTip: "A strong portfolio matters more than a degree (though a BA in Graphic Design or Visual Communication helps). Internships at agencies or in-house teams are the most common route in. Build a portfolio that shows process, not just final outcomes." }} /><CareerMap title="Creative Career Path" subtitle="From junior designer to CCO - the typical progression for creative professionals." stages={careerStages} industry="creative" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Creative" searchQuery="design creative conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live creative roles across all industries.</p><Link to="/marketplace?role=Creative#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Creative Jobs</Link></div><IndustryCVBuilder industry="Creative" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Creative" description="Design, content, and visual identity - the craft behind how industries look and feel." tabs={tabs} category="business" />;
};

export default Creative;
