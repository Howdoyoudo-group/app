import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Heart } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Heart, roles: [
    { name: "Stable Hand / Groom (Trainee)", description: "Mucking out, feeding, leading horses. Often comes with bed and board.", salary: "£25k–£26k + accommodation" },
    { name: "Apprentice (Level 2 Racehorse Care)", description: "Two-year apprenticeship through the National Horseracing College or British Racing School.", salary: "£18k–£22k while training + accommodation" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Work Rider / Riding-Out Lad", description: "Rides 3–6 lots per morning on the gallops. Pre-jockey stepping stone.", salary: "£26k–£32k + accommodation + ride fees" },
    { name: "Senior Groom / Travelling Groom", description: "Looks after a small string and travels horses to the races.", salary: "£28k–£36k + race-day bonuses" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head Lad / Travelling Head Lad", description: "Runs the yard's day-to-day operations or leads on race days.", salary: "£32k–£45k + winners' bonuses" },
    { name: "Yard Manager / Stud Hand (Breeding)", description: "Senior welfare and breeding responsibility at a stud farm or training yard.", salary: "£35k–£50k + accommodation" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Stud Manager (Breeding Operation)", description: "Runs a thoroughbred stud - Coolmore, Juddmonte, Cheveley Park, Tweenhills.", salary: "£60k–£120k+ + house" },
    { name: "Assistant Trainer / Trainer Pathway", description: "Promotion route into training - many trainers came up through the yard floor.", salary: "See Racehorse Trainer role" },
  ]},
];

const podcasts = [
  { title: "The Racing Industry Podcast", description: "Conversations with people across the UK racing workforce - yard staff, vets, trainers.", url: "https://careersinracing.com/" },
  { title: "The Nick Luck Daily", description: "ITV Racing's daily podcast on the life and business of UK racing.", url: "https://www.racingtv.com/podcasts" },
];

const articles = [
  { title: "Racing Post", source: "Racing Post", url: "https://www.racingpost.com/" },
  { title: "Careers in Racing", source: "BHA / NTF", url: "https://careersinracing.com/" },
  { title: "Thoroughbred Daily News", source: "TDN", url: "https://www.thoroughbreddailynews.com/" },
];

const StableHand = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Stable Hand / Groom" data={{
        summary: "Stable hands and grooms are the backbone of every UK racing yard. They look after the horses 365 days a year - mucking out, feeding, exercising, travelling. The role typically comes with bed and board, and is the proven entry route into work-riding, becoming a jockey, or progressing into yard management and ultimately training. Around 6,000 yard staff work in British racing.",
        dayToDay: ["Mucking out - usually 3–4 boxes per groom", "Feeding (dawn and evening)", "Grooming, plaiting, strapping for races", "Leading horses out for exercise lots", "Tack cleaning and yard maintenance", "Travelling horses to racecourses on race days"],
        skills: ["Horse Handling & Welfare", "Yard Hygiene & Stable Management", "Tack Care", "Trailer / Horsebox Loading", "Basic Equine First Aid", "BHA Welfare Standards"],
        traits: ["Genuine love of horses - they're hard work", "Physically fit and tireless - early starts every day", "Calm temperament - horses pick up your energy", "Team player - yards live or die on staff cohesion"],
        salary: "£25k entry → £120k+ stud manager",
        entryTip: "Routes in: Apply directly to a licensed trainer's yard - most provide accommodation and on-the-job training. The National Horseracing College (Doncaster) and British Racing School (Newmarket) offer Level 2 Racehorse Care apprenticeships - the formal entry route, fully funded.",
      }} />
      <CareerMap title="Stable Career Path" subtitle="From groom to head lad, stud manager or trainer." stages={careerStages} industry="horse-racing" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="stable-hand" roleName="Stable Hand / Groom" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Horse Racing" searchQuery="Careers in Racing UK racing yard" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live stable, groom and yard roles across UK racing.</p><Link to="/marketplace?role=stable-hand#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Stable Jobs</Link><a href="https://careersinracing.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">Careers in Racing ↗</a></div><IndustryCVBuilder industry="Horse Racing" stages={careerStages} /></>) },
  ];
  return <RolePageLayout slug="stable-hand" name="Stable Hand / Groom" description="Daily horse care - mucking out, feeding, exercising and travelling racehorses to and from meetings." tabs={tabs} category="frontline" />;
};

export default StableHand;
