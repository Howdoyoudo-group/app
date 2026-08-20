import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Trophy } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Trophy, roles: [
    { name: "Apprentice / Conditional Jockey", description: "9-month BHA licence course at the National Horseracing College or British Racing School, then attached to a trainer.", salary: "£12k–£18k + ride fees (£171/ride flat, £230/ride jumps)" },
    { name: "Stable Lad / Work Rider", description: "Pre-jockey route - riding out daily for a trainer while applying for licence.", salary: "£25k–£28k + bed & board" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Professional Jockey (5+ winners)", description: "Loses apprentice claim - competing on level terms in handicaps and listed races.", salary: "£25k–£60k (ride fees + win % + retainers)" },
    { name: "Retained Jockey (Stable Pick)", description: "First call for a major yard's runners - guaranteed quality rides.", salary: "£60k–£150k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Group / Grade 1 Jockey", description: "Riding in the biggest races at Cheltenham, Royal Ascot, the Derby, the Grand National.", salary: "£100k–£500k+ (incl. % of prize money)" },
    { name: "Stable Jockey (Major Owner)", description: "Retained by Coolmore, Godolphin, Juddmonte etc. Top global circuit.", salary: "£300k–£3m+" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Champion Jockey (Flat or Jumps)", description: "Most winners in a season - defines the upper end of the sport.", salary: "£500k–£5m+ (career earnings + sponsorships)" },
    { name: "Post-Riding: Trainer / Pundit / Mentor", description: "Most jockeys move into training, broadcasting (ITV Racing, RTV) or coaching after retirement.", salary: "Variable - see Racehorse Trainer role" },
  ]},
];

const podcasts = [
  { title: "The Nick Luck Daily", description: "ITV Racing's lead presenter's daily podcast - the must-listen for everyone in the sport.", url: "https://www.racingtv.com/podcasts" },
  { title: "Sky Sports Racing Podcast", description: "Daily UK racing analysis from Sky Sports Racing's team.", url: "https://www.skysports.com/racing/podcasts" },
];

const articles = [
  { title: "Racing Post", source: "Racing Post", url: "https://www.racingpost.com/" },
  { title: "British Horseracing Authority News", source: "BHA", url: "https://www.britishhorseracing.com/press_releases/" },
  { title: "Thoroughbred Daily News", source: "TDN", url: "https://www.thoroughbreddailynews.com/" },
];

const Jockey = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Jockey" data={{
        summary: "Jockeys are the elite athletes of horse racing - riding 1,000-pound thoroughbreds at 40mph in races worth millions. There are around 450 licensed professional jockeys in Great Britain. The route in is highly structured: a 9-month residential course at the National Horseracing College (Doncaster) or British Racing School (Newmarket), then attaching to a trainer as an apprentice (Flat) or conditional (Jumps).",
        dayToDay: ["Riding out 4–8 lots every morning at trainer's yard (5am–9am)", "Strict weight management - daily sauna, controlled diet", "Travelling to racecourses across the UK and Ireland", "Race riding - 4–7 rides per meeting", "Reviewing race videos with trainer and agent", "Schooling young horses over fences (jumps jockeys)"],
        skills: ["Race Riding (Tactics, Pace, Position)", "Weight Management & Fitness", "Horse Handling & Stable Craft", "Reading the Race", "Media Skills (post-race interviews)", "BHA Rules of Racing"],
        traits: ["Genuinely loves horses - this is a 6-day-a-week life", "Mentally tough - falls, injuries and rejection are constant", "Light and naturally lean (Flat: 7st 12lb; Jumps: 9st 7lb minimum)", "Brave and competitive in equal measure"],
        salary: "£12k apprentice → £5m+ champion",
        entryTip: "Routes in: Apply to the National Horseracing College (Doncaster) or the British Racing School (Newmarket) for the 9-month Foundation Course. Aged 16+. After the course you're attached to a licensed trainer to gain race experience and ride out for them. Pony Racing Authority is the route for younger riders.",
      }} />
      <CareerMap title="Jockey Career Path" subtitle="From apprentice to champion jockey." stages={careerStages} industry="horse-racing" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="jockey" roleName="Jockey" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Horse Racing" searchQuery="Cheltenham Festival Royal Ascot UK racing" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live jockey, work rider and stable roles across UK racing.</p><Link to="/marketplace?role=jockey#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Racing Jobs</Link><a href="https://careersinracing.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">Careers in Racing ↗</a></div><IndustryCVBuilder industry="Horse Racing" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Jockey" description="Race riding, weight management and competing at racecourses across the country - the elite athletes of the sport." tabs={tabs} category="craft" />;
};

export default Jockey;
