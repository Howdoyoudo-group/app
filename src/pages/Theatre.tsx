import { industryVideos } from "@/data/industry-videos";
import VideoShowcase from "@/components/VideoShowcase";
import ExploreFurther from "@/components/ExploreFurther";
import { Link } from "react-router-dom";
import { CompanyProfileGrid } from "@/components/CompanyProfileCard";
import LiveArticles from "@/components/LiveArticles";
import DailyBriefing from "@/components/DailyBriefing";
import BreakingNewsFeed from "@/components/BreakingNewsFeed";
import NewsfeedModal from "@/components/NewsfeedModal";
import EventsSection from "@/components/EventsSection";
import CareerMap from "@/components/CareerMap";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import IndustryRolesShowcase from "@/components/IndustryRolesShowcase";
import DayInTheLife from "@/components/DayInTheLife";
import CoursesSection from "@/components/CoursesSection";
import TheDownload from "@/components/TheDownload";
import YouTubeChannels from "@/components/YouTubeChannels";
import SubstackNewsletters from "@/components/SubstackNewsletters";
import TikTokCreators from "@/components/TikTokCreators";
import PodcastPlayer from "@/components/PodcastPlayer";
import IndustryPageLayout from "@/components/IndustryPageLayout";
import IndustryRolesLink from "@/components/IndustryRolesLink";
import PodcastGrid from "@/components/PodcastGrid";
import { Drama, Theater, Lightbulb, Briefcase, Ticket } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";

const theatreStages: CareerStage[] = [
  {
    title: "Performing",
    icon: Drama,
    roles: [
      { name: "Ensemble Member", description: "The backbone of a musical or large-cast play — singing, dancing and character work as part of the company. The most common paid performing job in UK theatre.", salary: "£600–£800 per week (Equity minimum, production-based)" },
      { name: "Actor", description: "Principal or supporting roles across plays, musicals and touring productions — work is project-by-project, almost always freelance between contracts.", salary: "£600–£1,200+ per week (production-based)" },
      { name: "Dancer (Musical Theatre)", description: "Ensemble and featured dance work in musicals and dance-led productions — usually requires triple-threat (sing/dance/act) training.", salary: "£600–£800 per week (Equity minimum)" },
      { name: "Understudy / Swing", description: "Covers one or more principal or ensemble roles, ready to go on with little notice — a common route to a bigger break, usually paid a premium on top of the base ensemble rate.", salary: "£650–£900 per week" },
      { name: "Singer (Opera/Musical Theatre Chorus)", description: "Chorus and principal singing work at opera houses and music theatre companies — usually requires formal vocal training.", salary: "£500–£900 per week (contract-based)" },
    ],
  },
  {
    title: "Stage & Production Management",
    icon: Theater,
    roles: [
      { name: "Assistant Stage Manager (ASM)", description: "Entry point into stage management — running props, backstage tracking and supporting the DSM during the show. The standard first job for stage management graduates.", salary: "£450–£550 per week (touring) / £24k–£28k (venue-based)" },
      { name: "Deputy Stage Manager (DSM)", description: "\"Calls\" the show from the book — cueing lighting, sound and set changes live, every performance. The technical heart of stage management.", salary: "£550–£700 per week / £28k–£36k" },
      { name: "Stage Manager", description: "Runs the entire backstage operation and company welfare during rehearsals and the run — the senior stage management role on a production.", salary: "£600–£800 per week / £32k–£42k" },
      { name: "Company Manager", description: "Handles contracts, payroll, welfare and logistics for the whole cast and crew — especially critical on tours.", salary: "£35k–£50k" },
      { name: "Production Manager", description: "Owns the technical budget and schedule across every department (set, lighting, sound, costume) from first rehearsal to opening night.", salary: "£40k–£65k" },
      { name: "Touring Stage Manager", description: "Stage-manages a production as it moves venue to venue — get-ins, get-outs and adapting the show to a new stage every week or two.", salary: "£550–£750 per week" },
    ],
  },
  {
    title: "Design & Technical",
    icon: Lightbulb,
    roles: [
      { name: "Lighting Technician / LX", description: "Rigs, focuses and operates stage lighting — from a single follow-spot to a fully automated rig on a West End musical.", salary: "£26k–£40k" },
      { name: "Sound Engineer / No.1 Sound", description: "Designs and mixes a show's live sound — radio mics, playback and the acoustic balance between orchestra, band and voices.", salary: "£26k–£42k" },
      { name: "Set / Scenic Designer", description: "Designs the physical world of a production — usually freelance, paid per show, with fees scaling from small fringe venues to major subsidised houses.", salary: "£2k–£15k+ per production (freelance fee)" },
      { name: "Costume Designer / Wardrobe Supervisor", description: "Designs or maintains a show's costumes — wardrobe supervisors run day-to-day repairs, laundry and quick-changes throughout the run.", salary: "£25k–£38k (wardrobe staff role)" },
      { name: "Wigs, Hair & Makeup Artist", description: "Builds and maintains wigs, period hair and stage makeup — a specialist technical craft with its own training route (e.g. via Royal Central).", salary: "£24k–£34k" },
      { name: "AV / Video Technician", description: "Operates the video projection and screen content increasingly used in modern staging, from concept musicals to corporate-style theatre.", salary: "£28k–£42k" },
    ],
  },
  {
    title: "Producing & Theatre Administration",
    icon: Briefcase,
    roles: [
      { name: "Producer", description: "Raises the money, assembles the creative team and takes ultimate commercial responsibility for a production — from a single fringe show to a West End transfer.", salary: "Highly variable — £30k–£80k+ salaried, or profit-share for commercial producers" },
      { name: "General Manager", description: "Runs the day-to-day business of a production or venue — contracts, budgets, compliance and the link between the creative and commercial sides.", salary: "£35k–£55k" },
      { name: "Casting Director", description: "Finds and auditions actors for a production, working closely with directors and producers — often freelance, moving between shows.", salary: "£30k–£50k (or freelance per-project fees)" },
      { name: "Marketing & Press Officer", description: "Sells the tickets — campaigns, press nights, social content and reviews management for a venue or production.", salary: "£25k–£42k" },
      { name: "Literary Manager / Dramaturg", description: "Reads and develops new writing for a theatre, running script submissions and supporting writers through development — common at subsidised new-writing venues.", salary: "£28k–£45k" },
    ],
  },
  {
    title: "Front of House & Venue Operations",
    icon: Ticket,
    roles: [
      { name: "Venue Technician", description: "The resident technical crew for a theatre building — get-ins, get-outs and running the house systems for whatever show is in.", salary: "£22k–£32k" },
      { name: "House Manager", description: "Runs the audience-facing side of a venue on show nights — front of house team, safety, and the overall visitor experience.", salary: "£24k–£34k" },
      { name: "Box Office Manager", description: "Runs ticketing operations and the box office team — pricing, access schemes and the systems behind every sale.", salary: "£23k–£30k" },
      { name: "Front of House Team Member / Usher", description: "The most common entry-level job in a theatre building — ticket checks, ushering and audience service. A genuine route in for many backstage and admin careers.", salary: "£11–£13 per hour" },
    ],
  },
];

const newsfeed = [
  { title: "The Stage", url: "https://www.thestage.co.uk" },
  { title: "WhatsOnStage", url: "https://www.whatsonstage.com" },
  { title: "Official London Theatre", url: "https://officiallondontheatre.com/news/" },
];

const theatreCompanies = [
  { name: "National Theatre", founded: "1963", hq: "South Bank, London", overview: "The UK's flagship subsidised theatre — three stages, a large in-house production department, and one of the biggest employers of stage management, technical and backstage staff in the country.", url: "https://www.nationaltheatre.org.uk/about-us/careers/", valueChainStage: "Producing & Theatre Administration" },
  { name: "Royal Shakespeare Company", founded: "1961", hq: "Stratford-upon-Avon", overview: "One of the world's leading Shakespeare and classical theatre companies, with its own actor ensemble, technical departments and a major learning/participation programme.", url: "https://www.rsc.org.uk/jobs", valueChainStage: "Producing & Theatre Administration" },
  { name: "ATG Entertainment", founded: "1992", hq: "London", overview: "The largest theatre operator in the UK by number of venues (Ambassador Theatre Group) — runs dozens of West End and regional theatres, employing large front-of-house and venue technical teams.", url: "https://www.atgtickets.com/careers/", valueChainStage: "Front of House & Venue Operations" },
  { name: "LW Theatres", founded: "1977", hq: "London", overview: "Andrew Lloyd Webber's theatre group, owning and operating seven West End venues including the London Palladium and Theatre Royal Drury Lane.", url: "https://www.lwtheatres.co.uk/jobs/", valueChainStage: "Front of House & Venue Operations" },
  { name: "Delfont Mackintosh Theatres", founded: "2005", hq: "London", overview: "Cameron Mackintosh's West End theatre group, operating venues including the Prince Edward and Wyndham's — Mackintosh's own productions (Les Misérables, Hamilton UK) sit alongside the venue business.", url: "https://www.delfontmackintosh.co.uk/vacancies/", valueChainStage: "Producing & Theatre Administration" },
  { name: "Sonia Friedman Productions", founded: "2002", hq: "London", overview: "One of the most prolific commercial theatre producers in the UK, behind major West End and Broadway transfers — a common route into commercial producing and general management.", url: "https://www.soniafriedman.com", valueChainStage: "Producing & Theatre Administration" },
  { name: "PRG (Production Resource Group)", founded: "1997", hq: "London & Birmingham", overview: "One of the largest entertainment technology suppliers in the world — lighting, sound, rigging and scenic services behind most major West End and touring productions. Employs thousands of technical staff globally.", url: "https://www.prg.com/en-gb/global/uk", valueChainStage: "Design & Technical" },
  { name: "White Light", founded: "1979", hq: "London", overview: "One of the UK's leading entertainment lighting and AV specialists, supplying and crewing lighting for theatre, music and events across the country.", url: "https://www.whitelight.ltd.uk", valueChainStage: "Design & Technical" },
  { name: "Glyndebourne", founded: "1934", hq: "Lewes, East Sussex", overview: "World-renowned opera house and festival with its own large technical, costume and stage management departments running a full opera season every summer.", url: "https://www.glyndebourne.com/about/jobs/", valueChainStage: "Design & Technical" },
  { name: "Royal Exchange Theatre", founded: "1976", hq: "Manchester", overview: "One of the UK's leading regional producing theatres, known for the quality of its in-house production and stage management — a well-regarded training ground outside London.", url: "https://www.royalexchange.co.uk/get-involved/jobs", valueChainStage: "Stage & Production Management" },
  { name: "RADA (Royal Academy of Dramatic Art)", founded: "1904", hq: "London", overview: "The UK's most prestigious drama school, training actors, stage managers, designers and technical stage craft specialists — not an employer, but the single most important training route into professional performing and technical theatre.", url: "https://www.rada.ac.uk", valueChainStage: "Performing" },
];

const Theatre = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-6">Coming soon — episodes unpacking how UK theatre, from the West End to the regions, actually works.</p>
          <PodcastPlayer industry="theatre" />
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
          <PodcastGrid podcasts={[
            { title: "The Stage Podcast: Seven Stages", description: "The Stage's own podcast — intimate conversations with performers and creatives about the productions that shaped their careers.", url: "https://open.spotify.com/show/3wvzLhJsxiKgFDq0wnd7gg" },
            { title: "The London Theatre Podcast", description: "Insight from London's West End, Off West End and Fringe — conversations with working theatre artists.", url: "https://open.spotify.com/show/1W4sqLYpEPd0ZKqlIErYnJ" },
            { title: "A Sense Of Direction", description: "Stage Directors UK's podcast on the nuts and bolts of actually working as a director in UK theatre.", url: "https://podcasts.apple.com/gb/podcast/a-sense-of-direction/id1536938824" },
          ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="theatre" />
          <LiveArticles industry="theatre" fallbackArticles={[
            { title: "The Stage — News", source: "The Stage", url: "https://www.thestage.co.uk" },
            { title: "WhatsOnStage — News", source: "WhatsOnStage", url: "https://www.whatsonstage.com" },
            { title: "Official London Theatre — News", source: "Official London Theatre", url: "https://officiallondontheatre.com/news/" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="theatre" />
            <div className="mt-4">
              <BreakingNewsFeed industry="theatre" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="theatre" />
          </div>
        </>
      ),
    },
    {
      id: "watch",
      label: "Watch",
      content: (
        <>
          <VideoShowcase heading="Behind the Curtain" clips={industryVideos["theatre"] || []} />
          <div className="mt-12">
            <YouTubeChannels industry="theatre" />
            <TikTokCreators industry="theatre" />
          </div>
        </>
      ),
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={theatreCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="theatre" />
          </div>
          <div className="mt-12"><IndustryRolesLink industry="Theatre" /></div>
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From front of house at your local venue to designing lighting for a West End musical — every route into UK theatre, on stage and off it." stages={theatreStages} industry="theatre" />
          <ExploreFurther links={[
            { title: "Spotlight", description: "The essential UK casting directory — build a profile here once you have professional credits, training or agent representation. The single most important platform for a performing career.", url: "https://www.spotlight.com" },
            { title: "UK Theatre — Industry Job Vacancies", description: "The trade body's own jobs board, covering venues and companies across the UK.", url: "https://uktheatre.org/jobs/" },
            { title: "Association of British Theatre Technicians (ABTT)", description: "The professional body for backstage and technical theatre — training, safety guidance and industry standards.", url: "https://www.abtt.org.uk" },
            { title: "Get Into Theatre", description: "UK Theatre and SOLT's own careers hub, with plain-English guides to every backstage and performing role.", url: "https://getintotheatre.org" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Theatre" searchQuery="UK theatre industry careers events conferences" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Theatre" slug="theatre" />
          <CoursesSection industry="theatre" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Live theatre jobs<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across performing, stage management, technical, producing and front of house.</p>
            <Link to="/marketplace?industry=Theatre#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <ExploreFurther
            title="More places to look"
            subtitle="A few specialist theatre job boards we can't pull into the Marketplace automatically - worth checking directly."
            links={[
              { title: "The Stage Jobs", description: "The UK's biggest theatre and performing arts jobs board - performing, backstage, technical and touring roles, plus auditions.", url: "https://jobs.thestage.co.uk/" },
              { title: "Arts Jobs (Arts Council England)", description: "Vacancies across the wider UK arts and culture sector, hosted by Arts Council England.", url: "https://www.artsjobs.org.uk/jobs" },
              { title: "UK Theatre — Industry Job Vacancies", description: "The trade body's own jobs board, covering venues and companies across the UK.", url: "https://uktheatre.org/jobs/" },
            ]}
          />
          <IndustryRolesShowcase stages={theatreStages} industry="Theatre" companies={theatreCompanies} />
          <IndustryCVBuilder industry="Theatre" stages={theatreStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Theatre"
      description="On stage and behind it — every way to build a career in UK theatre, from the West End to your local producing house."
      profile="Theatre isn't just actors — for every person on stage there's a much larger team who never take a bow: the deputy stage manager calling the show from the book, the lighting technician rigging the rig, the wardrobe supervisor keeping every costume running, the company manager sorting contracts on tour, and the front of house team who greet every audience. From an usher checking tickets at your local theatre, to a stage manager touring the UK with a major musical, to a producer raising the money for a West End transfer — this industry spans performing, technical craft, production management, and the administration that keeps it all running."
      tabs={tabs}
    />
  );
};

export default Theatre;
