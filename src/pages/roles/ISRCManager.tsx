import { Link } from "react-router-dom";
import { Hash, Database, ShieldCheck, Network } from "lucide-react";
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
  { title: "Entry Level", icon: Hash, roles: [
    { name: "Metadata Coordinator / Assistant", description: "Enters and checks release data - track titles, credits, and basic tagging - for a label or distributor.", salary: "£25k–£28k" },
  ]},
  { title: "Mid Level", icon: Database, roles: [
    { name: "ISRC Manager", description: "Assigns and tracks ISRCs for every release, verifies rights-owner permission, and keeps the catalogue's metadata accurate.", salary: "£28k–£38k" },
    { name: "Music Metadata Specialist", description: "Owns metadata quality across a wider catalogue - ISRC, ISWC, UPC and DDEX delivery to DSPs and collection societies.", salary: "£28k–£40k" },
  ]},
  { title: "Senior Level", icon: ShieldCheck, roles: [
    { name: "Head of Metadata & Rights Operations", description: "Leads the team responsible for catalogue data integrity and royalty-reporting accuracy across a label or distributor.", salary: "£45k–£65k" },
  ]},
  { title: "Leadership", icon: Network, roles: [
    { name: "Director of Catalogue & Data Operations", description: "Sets metadata and rights-data strategy for a major label, distributor, or streaming platform - the standards used across the whole catalogue.", salary: "£70k–£110k+" },
  ]},
];

const podcasts = [
  { title: "Introduction to Music Metadata", description: "Why metadata is the foundation of music distribution and licensing - the most common (and costly) mistakes, and how standards like ISRC, ISWC, ISNI, UPC and DDEX shape the whole ecosystem.", url: "https://open.spotify.com/episode/10SQicxNuiMQ66kXvJ09pl" },
  { title: "Music Metadata Specialist Keith Kirk", description: "A metadata specialist who's worked at Universal Music, BMG, Sony Music UK and TOVA Music Group on how to create and embed metadata properly to actually collect royalties.", url: "https://open.spotify.com/episode/1erbNfugLi4iwoIJKuufnL" },
];

const articles = [
  { title: "ISRC Agencies", source: "IFPI (International Standard)", url: "https://isrc.ifpi.org/isrc-standard/isrc-agencies" },
  { title: "ISRC Search Database", source: "IFPI", url: "https://isrcsearch.ifpi.org/#!/search" },
  { title: "BPI — UK's Appointed ISRC Agency", source: "British Phonographic Industry", url: "https://www.bpi.co.uk" },
  { title: "About ISRC", source: "US ISRC Agency", url: "https://usisrc.org/about-isrc/" },
];

const courses = [
  { title: "Register to Assign ISRC Online", description: "IFPI's own registration route - the way labels, distributors and rights administrators actually become an authorised ISRC-issuing entity.", url: "https://isrc.ifpi.org/register" },
  { title: "DDEX Standards", description: "The messaging standards (ERN, DSR and more) that carry ISRC and other metadata between labels, distributors and streaming platforms - essential technical literacy for the role.", url: "https://ddex.net/" },
];

const ISRCManager = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (
      <>
        <RoleOverview name="ISRC Manager" data={{
          summary: "An ISRC Manager assigns International Standard Recording Codes - the unique 12-character identifiers attached to every recorded track and music video - on behalf of labels, distributors and independent artists. In the UK the BPI is the officially appointed national ISRC agency, but the day-to-day role sits inside labels, distributors (TuneCore, DistroKid, CD Baby) and recording studios that have their own registrant code. It's a detail-driven, behind-the-scenes job: get the metadata wrong and an artist's royalties can go missing or get misattributed for years.",
          dayToDay: [
            "Assigning unique ISRCs to new tracks and music videos before release",
            "Checking a recording doesn't already have a code, and that the rights owner has given explicit permission",
            "Maintaining accurate logs of every code issued alongside release and track metadata",
            "Reporting issued ISRC data to industry databases and collection societies like PRS and SoundExchange",
            "Troubleshooting metadata errors that cause missing or misdirected royalty payments",
            "Working with DDEX-standard delivery feeds to distributors and streaming platforms",
          ],
          skills: ["Attention to Detail", "Music Metadata Systems (DDEX)", "Rights & Licensing Knowledge", "Data Management", "ISRC / ISWC / UPC Standards", "Cross-team Communication"],
          traits: [
            "You're methodical - one wrong digit can misdirect royalties for years",
            "You like systems and order more than the spotlight",
            "You're interested in the business and rights side of music, not just the creative side",
            "You're comfortable being the person who catches other people's mistakes",
          ],
          salary: "£25k–£28k starting out → £70k–£110k+ for catalogue/data operations leadership",
          entryTip: "There's no dedicated qualification - most people arrive via a label or distributor's operations, catalogue, or royalties team, then specialise into metadata and rights administration. Getting familiar with DDEX delivery standards and how ISRC, ISWC and UPC codes relate to each other will set you apart early. If you want to work at the agency level rather than inside a label, the BPI (UK) or IFPI directly are the route in.",
        }} />
        <CareerMap title="ISRC Manager Career Path" subtitle="From metadata coordinator to catalogue data director." stages={careerStages} industry="music" />
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
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="isrc-manager" roleName="ISRC Manager" /> },
    { id: "learn", label: "Learn", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Learn Music Metadata & ISRC<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6 max-w-2xl">No formal qualification exists for this role - it's learned on the job inside a label or distributor, or via the standards bodies directly.</p>
        <div className="space-y-4">{courses.map((c) => (
          <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
            <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3>
            <p className="text-muted-foreground font-body text-xs mt-1 leading-relaxed">{c.description}</p>
          </a>
        ))}</div>
        <OnlineLearningGrid roleName="ISRC Manager" />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Music" searchQuery="music metadata rights DDEX conference UK" /> },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live music industry roles, including catalogue, metadata and rights administration positions.</p>
          <Link to="/marketplace?industry=music#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Music Jobs</Link>
        </div>
        <IndustryCVBuilder industry="Music" stages={careerStages} />
      </>
    ) },
  ];

  return <RolePageLayout name="ISRC Manager" description="Assigning the codes that make sure every artist gets paid for every stream." tabs={tabs} category="business" />;
};

export default ISRCManager;
