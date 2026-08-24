import { Link } from "react-router-dom";
import { FileText, Handshake, Award, Crown } from "lucide-react";
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
  { title: "Entry Level", icon: FileText, roles: [
    { name: "Agency Assistant / Foreign Rights Assistant", description: "Reads the slush pile, drafts submission letters, and handles rights admin for a senior agent.", salary: "£25k–£28k" },
  ]},
  { title: "Mid Level", icon: Handshake, roles: [
    { name: "Associate Literary Agent", description: "Builds a small client list under a senior agent's mentorship, alongside supporting their existing authors.", salary: "£28k–£35k + commission" },
    { name: "Literary Agent", description: "Runs an independent client list - finds writers, sells manuscripts to publishers, and negotiates every deal.", salary: "£30k–£45k + commission" },
  ]},
  { title: "Senior Level", icon: Award, roles: [
    { name: "Senior Literary Agent", description: "An established list of bestselling or high-value authors, commission-driven earnings well above base salary.", salary: "£50k–£90k+ (mostly commission)" },
  ]},
  { title: "Leadership", icon: Crown, roles: [
    { name: "Agency Director / Partner", description: "Owns or co-owns the agency - sets strategy, mentors junior agents, and holds the biggest client relationships.", salary: "£90k–£200k+ (mostly commission)" },
  ]},
];

const podcasts = [
  { title: "Print Run Podcast", description: "Literary agents Laura Zats and Erik Hane on the book and writing industries, minus the institutional optimism.", url: "https://open.spotify.com/show/5QwEx4lBytwDnHPAAsHj9O" },
  { title: "The Shit No One Tells You About Writing", description: "Literary agents Carly Watters and Cece Lyra critique real query letters and demystify the submission process.", url: "https://open.spotify.com/show/2q6HSdKs0iTkgwCZtyplnA" },
];

const articles = [
  { title: "Association of Authors' Agents", source: "AAA - UK trade body for literary agents", url: "https://www.agentsassoc.co.uk" },
  { title: "Bookseller job profile", source: "National Careers Service", url: "https://nationalcareers.service.gov.uk/job-profiles/literary-agent" },
  { title: "Society of Authors", source: "The UK's trade union for writers and agents", url: "https://societyofauthors.org/" },
];

const courses = [
  { title: "AgentMatch", description: "Jericho Writers' searchable database of UK literary agents and what they're each looking for - essential reading for understanding how agents work.", url: "https://jerichowriters.com/our-services/agentmatch/" },
  { title: "Curtis Brown Creative", description: "Writing courses run by one of the UK's oldest literary agencies, taught by working agents and authors.", url: "https://www.curtisbrowncreative.co.uk/" },
];

const LiteraryAgent = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (
      <>
        <RoleOverview name="Literary Agent" data={{
          summary: "A literary agent represents authors, sells their manuscripts to publishers, and negotiates every deal on their behalf - from a debut novel's first sale through to film and TV rights years later. In the UK, agents are the gatekeepers to traditional publishing: almost every major publisher only accepts submissions that come through an agent. It's a commission-based job (typically 15% of UK earnings, 20% on foreign and film/TV deals, per the Association of Authors' Agents' Code of Practice) which means an agent's income is tied directly to how well their authors' books sell.",
          dayToDay: [
            "Reading submissions from prospective authors and deciding who to take on",
            "Editing manuscripts and shaping submission pitches before they go to publishers",
            "Submitting books to commissioning editors and running the auction if there's interest",
            "Negotiating contracts, advances, and royalty terms on an author's behalf",
            "Selling foreign, audio, film and TV rights alongside the core UK/US deal",
            "Managing ongoing author relationships - a mix of business advice and emotional support",
            "Attending book fairs like the London Book Fair to sell rights internationally",
          ],
          skills: ["Manuscript Assessment", "Negotiation", "Contract & Rights Knowledge", "Relationship Building", "Sales & Pitching", "Market Awareness"],
          traits: [
            "You read constantly and have strong, well-formed opinions about what works",
            "You're comfortable being the one who says no, often, to hopeful writers",
            "You like negotiating and don't shy away from talking about money",
            "You're genuinely invested in other people's careers, not just your own",
          ],
          salary: "£25k–£28k starting out as an assistant → £90k–£200k+ for senior agents and agency directors, though most income beyond base salary is commission-driven and highly variable",
          entryTip: "There's no set qualification - most agents start as an agency assistant or in a publisher's rights department, reading submissions and learning the business before building their own list. A junior/assistant role at an agency like Curtis Brown or United Agents is the classic route in. Read as widely as possible in the genres you want to represent, and get familiar with how UK publishing deals actually work.",
        }} />
        <CareerMap title="Literary Agent Career Path" subtitle="From reading the slush pile to running your own client list." stages={careerStages} industry="books" />
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
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="literary-agent" roleName="Literary Agent" /> },
    { id: "learn", label: "Learn", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Learn About Publishing & Agenting<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6 max-w-2xl">No formal qualification exists for this role - it's learned on the job at an agency, but these resources help you understand the business before you get there.</p>
        <div className="space-y-4">{courses.map((c) => (
          <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
            <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3>
            <p className="text-muted-foreground font-body text-xs mt-1 leading-relaxed">{c.description}</p>
          </a>
        ))}</div>
        <OnlineLearningGrid roleName="Literary Agent" />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Books" searchQuery="literary agent publishing rights UK" /> },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live publishing industry roles, including agency and rights positions.</p>
          <Link to="/marketplace?industry=books#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Books Jobs</Link>
        </div>
        <IndustryCVBuilder industry="Books" stages={careerStages} />
      </>
    ) },
  ];

  return <RolePageLayout name="Literary Agent" description="Finding the next great book, and fighting for the best possible deal for the person who wrote it." tabs={tabs} category="business" />;
};

export default LiteraryAgent;
