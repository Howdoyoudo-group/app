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

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Dumbbell, roles: [
    { name: "Gym Floor Instructor", description: "Inducts new members, runs basic programmes, and supports the gym floor.", salary: "£25k–£31k" },
    { name: "Group Exercise Instructor", description: "Delivers group classes - spin, HIIT, yoga, strength.", salary: "£25k–£26k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Fitness Instructor", description: "Leads programmes, builds member relationships, and delivers a varied class timetable.", salary: "£25k–£30k" },
    { name: "Master Trainer", description: "Specialist in a method (e.g. Les Mills, Reformer) - trains other instructors.", salary: "£28k–£40k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Fitness Manager", description: "Runs the fitness team and timetable for a club or studio.", salary: "£32k–£45k" },
    { name: "Studio Owner", description: "Owns or operates a boutique studio - combines coaching with business.", salary: "Variable" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Regional Fitness Director", description: "Sets fitness strategy and standards across multiple sites.", salary: "£50k–£75k" },
  ]},
];

const podcasts = [
  { title: "Mind Pump", description: "Three trainers break down fitness myths, programming, and business.", url: "https://mindpumppodcast.com/" },
  { title: "The PT Hustle", description: "UK-focused career advice for instructors and trainers.", url: "https://www.thepthustle.com/" },
];

const articles = [
  { title: "CIMSPA", source: "CIMSPA", url: "https://www.cimspa.co.uk/" },
  { title: "ukactive", source: "ukactive", url: "https://www.ukactive.com/" },
];

const FitnessInstructor = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="fitness-instructor" roleName="Fitness Instructor" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Fitness Instructor" data={{ summary: "Fitness instructors deliver group classes, run inductions, and keep members moving. It's a hands-on, energetic role and the most common entry point into the fitness industry - many PTs, studio owners and fitness directors started here.", dayToDay: ["Teaching group classes - HIIT, spin, strength, yoga", "Running gym floor inductions and member check-ins", "Designing simple programmes for new members", "Maintaining the gym floor and equipment", "Building rapport with members to drive retention"], skills: ["Group Coaching", "Anatomy & Physiology Basics", "Class Choreography", "Member Engagement", "First Aid", "Music & Energy Management"], traits: ["Energetic and naturally motivating", "Comfortable performing in front of groups", "Genuinely interested in helping people move better", "Reliable - early starts and evening classes are the norm"], salary: "£25k–£29k", entryTip: "A Level 2 Gym Instructor qualification (CIMSPA accredited) is the minimum. Many add Level 3 PT and method certifications (Les Mills, Reformer Pilates) to expand earnings and progression." }} /><CareerMap title="Fitness Instructor Career Path" subtitle="" stages={careerStages} industry="wellness" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Wellness" searchQuery="fitness instructor conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live fitness instructor roles.</p><Link to="/marketplace?industry=wellness#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Wellness Jobs</Link></div><IndustryCVBuilder industry="Wellness" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Fitness Instructor" description="Group classes, gym floor coaching, and getting people moving - the front line of the fitness industry." tabs={tabs} category="craft" />;
};

export default FitnessInstructor;
