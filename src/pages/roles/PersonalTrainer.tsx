import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Dumbbell } from "lucide-react";
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
  { title: "Entry Level", icon: Dumbbell, roles: [
    { name: "Fitness Instructor", description: "Delivers group classes and gym floor support, building foundational coaching skills.", salary: "£25k–£33k" },
    { name: "Junior Personal Trainer", description: "Works with clients 1-to-1 on fitness goals, building a client base.", salary: "£25k–£28k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Personal Trainer", description: "Manages a full client roster with tailored programmes and nutrition guidance.", salary: "£28k–£45k" },
    { name: "Specialist Coach", description: "Focuses on a niche - strength, rehab, sports performance, or pre/postnatal.", salary: "£30k–£50k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head of PT / Fitness Manager", description: "Leads the personal training team and drives PT revenue for a gym or chain.", salary: "£35k–£55k" },
    { name: "Online Coach / Educator", description: "Builds a digital coaching business or creates fitness education content.", salary: "£40k–£80k+" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Fitness Director", description: "Sets the fitness strategy for a gym group or wellness brand.", salary: "£50k–£80k" },
    { name: "Founder / Brand Owner", description: "Builds a fitness brand, gym, or training methodology.", salary: "Variable" },
  ]},
];

const podcasts = [
  { title: "Mind Pump", description: "Three trainers break down fitness myths, programming, and business strategy.", url: "https://mindpumppodcast.com/" },
  { title: "The PT Hustle", description: "UK-focused advice on building a successful personal training career.", url: "https://www.thepthustle.com/" },
  { title: "The PTDC Podcast", description: "Business and coaching advice for personal trainers building a career.", url: "https://www.theptdc.com/" },
];

const articles = [
  { title: "CIMSPA", source: "CIMSPA", url: "https://www.cimspa.co.uk/" },
  { title: "Personal Trainer Development Center", source: "PTDC", url: "https://www.theptdc.com/" },
  { title: "Men's Health / Women's Health", source: "Hearst", url: "https://www.menshealth.com/uk/" },
];

const PersonalTrainer = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="personal-trainer" roleName="Personal Trainer" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Personal Trainer" data={{ summary: "Personal trainers help people move better, get stronger, and transform their health. It's a hands-on, people-focused career that blends exercise science with coaching psychology. The best PTs build loyal client bases, develop specialisms, and create businesses around their expertise - whether in a gym, online, or both.", dayToDay: ["Designing bespoke training programmes for individual clients", "Running 1-to-1 sessions and group classes", "Tracking client progress and adjusting programmes", "Providing nutrition guidance and lifestyle coaching", "Building and retaining a client base through marketing and referrals", "Staying current with new training methods and research"], skills: ["Exercise Programming", "Anatomy & Physiology", "Nutrition Basics", "Coaching & Motivation", "Client Management", "Movement Assessment", "Business & Self-Employment", "First Aid"], traits: ["You genuinely enjoy helping people improve their lives", "You're energetic, positive, and lead by example", "You're comfortable being self-employed and managing your own diary", "You're curious about science - how the body moves and adapts", "You can build rapport quickly with all types of people"], salary: "£25k–£28k", entryTip: "You need a Level 3 Personal Training qualification (CIMSPA accredited) to work in the UK. Courses take 6–12 weeks. From there, it's about building clients, developing a niche, and investing in CPD. NASM and Precision Nutrition are strong additions." }} /><CareerMap title="Personal Trainer Career Path" subtitle="From fitness instructor to fitness director." stages={careerStages} industry="wellness" /></>) },
    { id: "learn", label: "Learn", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Courses & Certifications<span className="text-primary">.</span></h2><div className="space-y-4">{[{ title: "Level 3 Personal Training (CIMSPA)", description: "The minimum qualification to work as a PT in the UK - covers anatomy, programming, and client management.", url: "https://www.cimspa.co.uk/" }, { title: "NASM Certified Personal Trainer", description: "Globally recognised certification with a strong focus on corrective exercise.", url: "https://www.nasm.org/" }, { title: "Precision Nutrition (PN1)", description: "The gold-standard nutrition coaching certification for fitness professionals.", url: "https://www.precisionnutrition.com/" }].map((c) => (<a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{c.description}</p></a>))}</div><OnlineLearningGrid roleName="Personal Trainer" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Wellness" searchQuery="fitness personal training conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live personal training and fitness roles.</p><Link to="/marketplace?industry=wellness#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Wellness Jobs</Link></div><IndustryCVBuilder industry="Wellness" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Personal Trainer" description="Coaching, programming, and guiding people through physical transformation." tabs={tabs} category="craft" />;
};

export default PersonalTrainer;
