import { Link } from "react-router-dom";
import { BookOpen, Users, Store, Network } from "lucide-react";
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
  { title: "Entry Level", icon: BookOpen, roles: [
    { name: "Bookseller / Bookshop Assistant", description: "Hand-sells books on the shop floor, builds displays, and helps customers find what they're looking for.", salary: "£25k–£28k" },
  ]},
  { title: "Mid Level", icon: Users, roles: [
    { name: "Senior Bookseller / Section Lead", description: "Owns a section (fiction, children's, non-fiction) - curates stock, runs events, and mentors newer booksellers.", salary: "£26k–£30k" },
  ]},
  { title: "Senior Level", icon: Store, roles: [
    { name: "Assistant Manager / Shop Manager", description: "Runs the day-to-day of a shop - stock, staffing, sales targets, and the in-store events programme.", salary: "£28k–£38k" },
  ]},
  { title: "Leadership", icon: Network, roles: [
    { name: "Area / Regional Manager", description: "Oversees multiple shops across a region for a chain like Waterstones - performance, hiring, and strategy.", salary: "£40k–£55k+" },
  ]},
];

const podcasts = [
  { title: "The Bookseller Podcast", description: "Author interviews, new releases and book recommendations from the UK publishing trade's own title.", url: "https://open.spotify.com/show/0aGtXLlUiS7fhSFRUtB8Pr" },
  { title: "The BookMachine Podcast", description: "Conversations shining a light on the unsung heroes of the publishing industry - including the shop floor.", url: "https://open.spotify.com/show/56x3lLhD4yDbI3wmF7HFhH" },
];

const articles = [
  { title: "Booksellers Association", source: "The UK & Ireland's trade body for bookshops", url: "https://www.booksellers.org.uk" },
  { title: "Bookseller job profile", source: "National Careers Service", url: "https://nationalcareers.service.gov.uk/job-profiles/bookseller" },
  { title: "Bookshop job openings", source: "Booksellers Association jobs board", url: "https://www.booksellers.org.uk/bookshopjobopenings" },
];

const courses = [
  { title: "Booksellers Association Training", description: "CPD, events and training resources for people working in bookshops, run by the UK trade body.", url: "https://www.booksellers.org.uk" },
  { title: "BookMachine Jobs", description: "Specialist job board for publishing and bookselling roles across the UK trade.", url: "https://bookmachine.org/jobs/" },
];

const Bookseller = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (
      <>
        <RoleOverview name="Bookseller" data={{
          summary: "A bookseller is the face of the publishing industry to readers - hand-selling books, curating displays, and helping people find their next favourite read. It's a shop-floor role at heart, whether that's an independent bookshop, a Waterstones or Foyles branch, or a WH Smith. The best booksellers combine genuine reading knowledge with retail skills - staying on top of new releases, running events and book clubs, and knowing their customers' taste well enough to hand-sell titles they'd never have picked up otherwise.",
          dayToDay: [
            "Helping customers find books, including recommendations based on what they've enjoyed before",
            "Building and refreshing displays and table curation around new releases, themes and seasons",
            "Processing deliveries, managing stock levels, and returns for titles that aren't selling",
            "Running or supporting in-store events - author signings, book clubs, and launches",
            "Operating the till, gift wrapping, and general shop-floor customer service",
            "Keeping up with new releases, prize lists (Booker, Women's Prize) and what's trending on BookTok",
          ],
          skills: ["Customer Service", "Product Knowledge", "Visual Merchandising", "Reading Breadth", "Stock Management", "Events Coordination"],
          traits: [
            "You read widely across genres, not just what you personally enjoy",
            "You like talking to people and are comfortable making recommendations to strangers",
            "You're happy on your feet for a full shift, including weekends",
            "You care about the physical experience of a bookshop, not just the sale",
          ],
          salary: "£25k–£28k starting out → £40k–£55k+ for regional/area management across a chain",
          entryTip: "Most booksellers start with no formal qualification - retail experience and a genuine passion for books matter more than a degree. Apply directly to independent bookshops or chains like Waterstones and Foyles; part-time and seasonal roles (especially over Christmas) are a common way in. The Booksellers Association's jobs board is the best single place to find open roles.",
        }} />
        <CareerMap title="Bookseller Career Path" subtitle="From the shop floor to running a region." stages={careerStages} industry="books" />
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
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="bookseller" roleName="Bookseller" /> },
    { id: "learn", label: "Learn", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Learn Bookselling<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6 max-w-2xl">No formal qualification is required - it's learned on the shop floor - but these resources help you understand the trade and find open roles.</p>
        <div className="space-y-4">{courses.map((c) => (
          <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
            <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3>
            <p className="text-muted-foreground font-body text-xs mt-1 leading-relaxed">{c.description}</p>
          </a>
        ))}</div>
        <OnlineLearningGrid roleName="Bookseller" />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Books" searchQuery="bookselling independent bookshop UK" /> },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live publishing and bookselling roles across the UK.</p>
          <Link to="/marketplace?industry=books#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Books Jobs</Link>
        </div>
        <IndustryCVBuilder industry="Books" stages={careerStages} />
      </>
    ) },
  ];

  return <RolePageLayout name="Bookseller" description="Hand-selling books and curating displays - the face of publishing on the high street." tabs={tabs} category="frontline" />;
};

export default Bookseller;
