import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Clapperboard } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Clapperboard, roles: [
    { name: "Runner / Production Assistant", description: "Supports the production team on set or in the studio with logistics and admin.", salary: "£25k–£31k" },
    { name: "Junior Producer", description: "Assists with scheduling, budgets, and coordinating talent and crew.", salary: "£25k–£28k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Producer", description: "Manages productions from pre to post - budgets, timelines, and creative delivery.", salary: "£32k–£50k" },
    { name: "Content Producer", description: "Creates and manages content across digital, social, and broadcast channels.", salary: "£30k–£45k" },
    { name: "Music Producer", description: "Writes, arranges, and produces music for artists, labels, or media.", salary: "Variable" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Producer", description: "Leads major productions and manages multiple projects and teams.", salary: "£50k–£75k" },
    { name: "Head of Production", description: "Oversees the production department - hiring, workflows, and quality standards.", salary: "£60k–£85k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Executive Producer", description: "Oversees a slate of projects, securing financing and guiding creative direction.", salary: "£75k–£130k" },
    { name: "Head of Content / Programming", description: "Sets the content strategy for a platform, studio, or broadcaster.", salary: "£80k–£140k" },
  ]},
];

const podcasts = [
  { title: "Kermode & Mayo's Take", description: "Film reviews and industry insight from the UK's most trusted film critics.", url: "https://www.kermodeandmayo.com/" },
  { title: "Song Exploder", description: "Musicians break down how they created a single song, piece by piece.", url: "https://songexploder.net/" },
  { title: "Broadcast", description: "Industry news and insights for TV, film, and content production professionals.", url: "https://www.broadcastnow.co.uk/" },
];

const articles = [
  { title: "Screen Daily", source: "Screen", url: "https://www.screendaily.com/" },
  { title: "Broadcast", source: "Broadcast", url: "https://www.broadcastnow.co.uk/" },
  { title: "Music Business Worldwide", source: "MBW", url: "https://www.musicbusinessworldwide.com/" },
];

const Producer = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="producer" roleName="Producer" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Producer" data={{ summary: "Producers are the people who make creative projects happen. Whether it's a film, a podcast, a music track, or a brand campaign - producers manage the budget, the schedule, the talent, and the logistics. It's a role that demands creativity and commercial discipline in equal measure, and exists across film, TV, music, and digital content.", dayToDay: ["Managing production schedules, budgets, and logistics", "Hiring and coordinating talent, crew, and freelancers", "Liaising with clients, commissioners, and stakeholders", "Problem-solving on set - adapting when things don't go to plan", "Overseeing post-production - editing, sound, delivery", "Pitching ideas and securing financing for new projects"], skills: ["Budget Management", "Scheduling & Logistics", "Talent Coordination", "Stakeholder Management", "Creative Briefing", "Problem Solving", "Contract Negotiation", "Post-Production Oversight"], traits: ["You're the person who makes things happen - you're a doer", "You stay calm under pressure and thrive on deadlines", "You enjoy working with creative people and managing chaos", "You're detail-oriented but can see the bigger picture", "You're commercially minded - you understand budgets and ROI"], salary: "£25k–£28k", entryTip: "Most producers start as runners or production assistants. Getting on set - even unpaid - is the most common route in. A degree in Film, Media, or Music Production helps, but practical experience and networking matter more. Build a portfolio of delivered projects." }} /><CareerMap title="Producer Career Path" subtitle="From runner to executive producer - the production progression." stages={careerStages} industry="cinema" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Film and TV" searchQuery="film production music producer conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live producer roles across film, TV, and music.</p><Link to="/marketplace?industry=cinema#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Production Jobs</Link></div><IndustryCVBuilder industry="Film and TV" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Producer" description="Bringing creative projects to life - from music tracks to film productions." tabs={tabs} category="craft" />;
};

export default Producer;
