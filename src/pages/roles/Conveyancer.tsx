import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, FileText } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: FileText, roles: [
    { name: "Conveyancing Assistant / Paralegal", description: "File opening, ID checks, search ordering, supporting fee earners.", salary: "£25k–£28k" },
    { name: "Trainee Licensed Conveyancer (CLC)", description: "Studying CLC qualification while working in a conveyancing firm.", salary: "£25k–£32k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Licensed Conveyancer / Property Solicitor", description: "Runs own caseload of 50–80 active matters from instruction to completion.", salary: "£35k–£50k" },
    { name: "Senior Conveyancer", description: "Handles complex transactions - leasehold, new build, BTL portfolios.", salary: "£45k–£65k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Team Leader / Department Head", description: "Manages a team of conveyancers - files, training, quality and lender accreditation.", salary: "£55k–£80k" },
    { name: "Specialist Property Lawyer", description: "Commercial property, plot sales, complex enfranchisement work.", salary: "£60k–£90k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Partner / Director", description: "Equity stake in the firm, owns business development and lender relationships.", salary: "£90k–£200k+" },
    { name: "Head of Conveyancing (National Firm)", description: "Runs conveyancing across multi-site firms (Countrywide, Simpson Millar, O'Neill Patient).", salary: "£100k–£180k" },
  ]},
];

const podcasts = [
  { title: "The Conveyancing Podcast", description: "UK conveyancing-specific podcast on practice, regulation and case studies.", url: "https://www.conveyancingpodcast.com/" },
  { title: "Today's Conveyancer Podcast", description: "Industry podcast from the UK's main conveyancing trade publication.", url: "https://todaysconveyancer.co.uk/" },
];

const articles = [
  { title: "Today's Conveyancer", source: "Today's Conveyancer", url: "https://todaysconveyancer.co.uk/" },
  { title: "Law Society Gazette - Property", source: "Law Society", url: "https://www.lawgazette.co.uk/practice/property" },
  { title: "Estate Agent Today (linked sector)", source: "EAT", url: "https://www.estateagenttoday.co.uk/" },
];

const Conveyancer = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Conveyancer" data={{
        summary: "Conveyancers handle the legal side of buying and selling property - searches, contracts, mortgages and completion. Every house sale in England and Wales requires one. It's the engine room of the property industry: high volume, deadline-driven and quietly one of the most accessible professional legal careers in the UK. You don't need a law degree - the CLC (Council for Licensed Conveyancers) qualification is the standard route.",
        dayToDay: ["Reviewing draft contracts and title deeds", "Ordering and reviewing property searches (LA, water, environmental)", "Raising and answering enquiries with the other side", "Liaising with mortgage lenders and brokers", "Coordinating exchange and completion days", "Final accounting and post-completion (SDLT, Land Registry)"],
        skills: ["Property Law (Conveyancing)", "CLC / SQE Knowledge", "Case Management Software", "Lender Panel Compliance", "Client Communication under Pressure", "SDLT & HMRC Filing"],
        traits: ["Methodical - one missed enquiry can break a chain", "Calm under client and chain pressure", "Strong written communicator", "Detail-obsessed - small print matters"],
        salary: "£25k assistant → £200k+ partner",
        entryTip: "Routes in: Apply directly to high-street firms, conveyancing factories (Premier Property Lawyers, O'Neill Patient, My Home Move) or estate agency in-house teams. Most will sponsor your CLC qualification. Solicitor route via SQE is also possible. Apprenticeships at Levels 4–6 in conveyancing are a strong school-leaver entry.",
      }} />
      <CareerMap title="Conveyancing Career Path" subtitle="From assistant to partner or department head." stages={careerStages} industry="estate-agency" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="conveyancer" roleName="Conveyancer" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Estate Agency" searchQuery="conveyancing conference UK CLC Today's Conveyancer" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live conveyancing roles across the UK.</p><Link to="/marketplace?role=conveyancer#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Conveyancer Jobs</Link></div><IndustryCVBuilder industry="Estate Agency" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Conveyancer" description="The legal engine room of property - handling contracts, searches and completions that move every house sale forward." tabs={tabs} category="craft" />;
};

export default Conveyancer;
