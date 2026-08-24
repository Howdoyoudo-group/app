import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Award } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Award, roles: [
    { name: "Stable Hand / Work Rider", description: "Year-round yard work - riding out daily, mucking out, strapping. The standard route in.", salary: "£25k–£28k + bed & board" },
    { name: "Pupil Assistant Trainer", description: "Often a former jockey or BHA-trained yard manager working under a senior trainer.", salary: "£28k–£40k + accommodation" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Head Lad / Travelling Head Lad", description: "Runs the yard's day-to-day or travels horses to racecourses on race days.", salary: "£32k–£45k + bonus on winners" },
    { name: "Assistant Trainer", description: "Senior right-hand to the licence holder - entries, riding plans, owner liaison.", salary: "£40k–£60k + bonus" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Licensed Trainer (Small / Mid Yard)", description: "Holds own BHA licence - typically 30–80 horses, regional racing.", salary: "Variable - £40k–£150k drawings" },
    { name: "Licensed Trainer (Group-winning Yard)", description: "100+ horses, Pattern-race wins, top owners.", salary: "£200k–£1m+ (training fees + % prize money)" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Champion Trainer (Flat or Jumps)", description: "Most winners or highest prize money in a season - names like Henderson, Mullins, O'Brien, Gosden.", salary: "£2m–£20m+ (incl. global Group 1s)" },
    { name: "International Trainer (Coolmore / Godolphin / Juddmonte)", description: "Salaried role at one of the global breeding & racing operations.", salary: "£300k–£2m+" },
  ]},
];

const podcasts = [
  { title: "The Nick Luck Daily", description: "ITV Racing's daily podcast - the must-listen for everyone in the sport.", url: "https://www.racingtv.com/podcasts" },
  { title: "Sky Sports Racing Podcast", description: "Daily UK racing analysis with regular trainer interviews.", url: "https://www.skysports.com/racing/podcasts" },
];

const articles = [
  { title: "Racing Post", source: "Racing Post", url: "https://www.racingpost.com/" },
  { title: "British Horseracing Authority", source: "BHA", url: "https://www.britishhorseracing.com/" },
  { title: "Thoroughbred Daily News", source: "TDN", url: "https://www.thoroughbreddailynews.com/" },
];

const RacehorseTrainer = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Racehorse Trainer" data={{
        summary: "Trainers are the CEOs of a racing yard - responsible for the conditioning, race planning, owner relationships and commercial performance of every horse in their care. There are around 550 licensed UK trainers. The big yards (Henderson, Nicholls, Skelton, Gosden, Appleby) operate as multi-million-pound businesses with international ownership; the small ones run a tight commercial operation with a handful of horses for local owners.",
        dayToDay: ["Planning the morning's gallops with head lad and work riders", "Watching every lot up the gallops and noting condition", "Vet, farrier and feed planning across the string", "Owner calls - updates, race plans, sales conversations", "Race day at one or more meetings - saddling, instructions to jockey", "Entries, declarations and engagement with handicapper"],
        skills: ["Equine Conditioning & Physiology", "Race Planning & Handicapping", "Owner Relationship Management", "Yard P&L (training fees + prize money)", "BHA Licensing & Welfare Compliance", "Bloodstock Knowledge"],
        traits: ["7-day-a-week mindset - horses don't take weekends off", "Calm and decisive under media and owner pressure", "Strong people manager - yard is 10–60+ staff", "Resilient - bad weeks happen often"],
        salary: "Variable - £40k starter yard → £20m+ global champion",
        entryTip: "Routes in: Most start as stable hands or work riders at a licensed yard. The British Horseracing Authority offers a Diploma in the Management of a Racing Yard - required to apply for a trainer's licence. The National Stud and the Godolphin Flying Start (international) are the gold-standard graduate routes for management.",
      }} />
      <CareerMap title="Racehorse Trainer Career Path" subtitle="From stable hand to champion trainer." stages={careerStages} industry="horse-racing" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="racehorse-trainer" roleName="Racehorse Trainer" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Horse Racing" searchQuery="Cheltenham Festival Royal Ascot UK racing trainers" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live racing yard and assistant trainer roles across the UK.</p><Link to="/marketplace?role=racehorse-trainer#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Racing Jobs</Link><a href="https://careersinracing.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">Careers in Racing ↗</a></div><IndustryCVBuilder industry="Horse Racing" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Racehorse Trainer" description="Conditioning, race planning and stable leadership - preparing thoroughbreds to win on the track." tabs={tabs} category="craft" />;
};

export default RacehorseTrainer;
