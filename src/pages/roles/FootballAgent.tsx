import { Link } from "react-router-dom";
import { Handshake, TrendingUp, Users, Briefcase } from "lucide-react";
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
  { title: "Entry Level", icon: Briefcase, roles: [
    { name: "Agency Intern / Assistant", description: "Supports registered agents with admin, scouting notes, and player logistics while learning the trade.", salary: "£25k–£28k" },
    { name: "Junior Intermediary", description: "Registered with the FA, building a first network of players and contacts under a senior agent.", salary: "£26k–£34k (often commission-supplemented)" },
  ]},
  { title: "Mid Level", icon: Handshake, roles: [
    { name: "Football Agent / Intermediary", description: "Represents a small roster of players - negotiating contracts, image rights, and transfers.", salary: "£30k–£80k + commission" },
    { name: "Player Care Manager", description: "Manages a player's life off the pitch - relocation, media, family, and wellbeing - usually within a bigger agency.", salary: "£28k–£45k" },
  ]},
  { title: "Senior Level", icon: TrendingUp, roles: [
    { name: "Senior Agent", description: "Represents established first-team and international players; leads major transfer and contract negotiations.", salary: "£60k–£150k+ (commission-driven)" },
    { name: "Head of Football / Agency Director", description: "Runs an agency's football operations - client strategy, club relationships, and deal oversight.", salary: "£80k–£200k+" },
  ]},
  { title: "Leadership", icon: Users, roles: [
    { name: "Agency Founder / Owner", description: "Builds and owns an agency - the top earners represent elite, marquee players across multiple clubs and countries.", salary: "£150k–£1m+ (deal-dependent)" },
  ]},
];

const podcasts = [
  { title: "The Agents Angle", description: "Two working football agents lift the lid on the industry - what agents actually do, and whether the 'shadowy sharks' stereotype holds up.", url: "https://open.spotify.com/show/3xrtnE3pVByql4hDxVYsuc" },
  { title: "FIFA Agent Exam Podcast", description: "SportsAgent Institute's episode-by-episode guide to passing the FIFA Football Agent Exam - the real entry route into the profession.", url: "https://open.spotify.com/show/6mkI7H5hEKvF1QYiionwnW" },
  { title: "The Price of Football", description: "Kieran Maguire breaks down football finances - including how transfer fees, agent commissions and player contracts actually work.", url: "https://open.spotify.com/show/7c7ltYVwnicbVz0uYTXAW5" },
];

const articles = [
  { title: "The Athletic — Transfers", source: "The Athletic", url: "https://theathletic.com/football/transfers/" },
  { title: "Sky Sports — Transfer Centre", source: "Sky Sports", url: "https://www.skysports.com/transfer-centre" },
  { title: "The FA — Football Agent Regulations", source: "The Football Association", url: "https://www.thefa.com/football-rules-governance/policies/player-status---agents" },
  { title: "FIFA Football Agent Regulations (FFAR)", source: "FIFA", url: "https://inside.fifa.com/transfer-system/agents" },
];

const courses = [
  { title: "FIFA Football Agent Exam", description: "The mandatory route in - a multiple-choice exam FIFA requires before you can legally act as a football agent worldwide. No formal qualifications needed to sit it, but it's demanding and pass rates are low.", url: "https://inside.fifa.com/transfer-system/agents" },
  { title: "The FA — Registered Football Agents", description: "How UK-based agents register with the Football Association, including the annual fee and compliance requirements once you're licensed.", url: "https://www.thefa.com/football-rules-governance/policies/player-status---agents" },
  { title: "Sports Law LLM / Postgraduate courses", description: "Not required, but many agents come via a sports law or sports management degree - useful for contract negotiation and regulatory knowledge.", url: "https://www.google.com/search?q=sports+law+LLM+UK+universities" },
];

const FootballAgent = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (
      <>
        <RoleOverview name="Football Agent" data={{
          summary: "Football agents (officially \"intermediaries\" under FA and FIFA rules) represent players and, sometimes, clubs in contract negotiations, transfers, and commercial deals. It's a relationship-driven, deal-based career - income comes almost entirely from commission on transfers, new contracts, and image-rights deals, which means the early years can be lean and unpredictable before a network and reputation are built. The best agents combine football knowledge, legal and financial literacy, and the trust of players and their families.",
          dayToDay: [
            "Building and maintaining relationships with players, families, and coaches",
            "Negotiating contracts, transfers, and renewals with clubs",
            "Scouting and identifying talent to bring onto the books",
            "Managing image rights, sponsorship, and commercial deals for clients",
            "Handling logistics - travel, relocation, visas - around transfers",
            "Staying on top of FA/FIFA regulations, transfer windows, and compliance",
          ],
          skills: ["Negotiation", "Contract & Regulatory Knowledge", "Relationship Building", "Football Market Knowledge", "Commercial Awareness", "Resilience Under Pressure"],
          traits: [
            "You're a natural relationship-builder who plays the long game",
            "You can handle rejection and slow-moving deals without losing momentum",
            "You're comfortable with irregular, commission-based income",
            "You understand football deeply - not just as a fan, but as a business",
            "You're organised enough to manage regulation, contracts, and deadlines under pressure",
          ],
          salary: "£25k–£28k starting out → £150k–£1m+ for established agents with top clients",
          entryTip: "There's no traditional degree route in. The real entry point is the FIFA Football Agent Exam plus FA intermediary registration - most people get there by interning or assisting at an established agency first, building contacts through grassroots/academy football, or coming in via a sports law or sports management background. Be wary of any agency internship advertised below National Living Wage - it should be a genuine paid role, not unpaid 'exposure'. Reputation and trust take years to build, so most agents start by helping a senior agent's roster before taking on their own clients.",
        }} />
        <CareerMap title="Football Agent Career Path" subtitle="From intern to running your own agency." stages={careerStages} industry="football" />
      </>
    ) },
    { id: "read", label: "Read", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2>
        <div className="space-y-4">{articles.map((a) => (
          <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
            <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3>
            <p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p>
          </a>
        ))}</div>
      </>
    ) },
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={podcasts as PodcastItem[]} />
      </>
    ) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="football-agent" roleName="Football Agent" /> },
    { id: "learn", label: "Learn", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Becoming a Football Agent<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6 max-w-2xl">The route in is regulatory, not academic - pass the FIFA exam, register as an intermediary, then build a network. Here's where to start.</p>
        <div className="space-y-4">{courses.map((c) => (
          <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
            <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3>
            <p className="text-muted-foreground font-body text-xs mt-1 leading-relaxed">{c.description}</p>
          </a>
        ))}</div>
        <OnlineLearningGrid roleName="Football Agent" />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Football" searchQuery="football agent intermediary conference UK" /> },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live football industry roles, including agency and player-care positions.</p>
          <Link to="/marketplace?industry=football#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Football Jobs</Link>
        </div>
        <IndustryCVBuilder industry="Football" stages={careerStages} />
      </>
    ) },
  ];

  return <RolePageLayout name="Football Agent" description="Contracts, transfers, and trust - representing players on and off the pitch." tabs={tabs} category="business" />;
};

export default FootballAgent;
