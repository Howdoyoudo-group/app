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
import { Trophy, Heart, Star, Tv, Briefcase, Users } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";

const tennisStages: CareerStage[] = [
  {
    title: "Playing & Coaching",
    icon: Trophy,
    roles: [
      { name: "Professional Player", description: "Competes on the ATP, WTA, or ITF circuits, managing a team of coaches, physios, and agents around a global tournament schedule.", salary: "Varies widely" },
      { name: "LTA Performance Coach", description: "Develops elite junior and senior players at the National Tennis Centre or regional academies.", salary: "£30k–£60k" },
      { name: "Club Head Coach", description: "Runs the coaching programme at a private or municipal tennis club, delivering group sessions and private lessons.", salary: "£26k–£50k" },
      { name: "Tennis Teacher", description: "Delivers coaching to recreational players of all ages and abilities at clubs, schools, and parks.", salary: "£22k–£38k" },
      { name: "Performance Director", description: "Sets the national player development strategy and oversees elite pathways from junior to senior level.", salary: "£60k–£120k" },
    ],
  },
  {
    title: "Player Support",
    icon: Heart,
    roles: [
      { name: "Tour Physiotherapist", description: "Travels with players providing injury treatment, recovery protocols, and pitch-side care across the tour calendar.", salary: "£35k–£65k" },
      { name: "Strength & Conditioning Coach", description: "Designs physical training programmes to build power, speed, and endurance specific to tennis demands.", salary: "£30k–£55k" },
      { name: "Sports Psychologist", description: "Works with players on mental performance — focus, pressure management, and competitive mindset.", salary: "£35k–£65k" },
      { name: "Nutritionist", description: "Designs tournament and training nutrition strategies to optimise performance and recovery.", salary: "£28k–£48k" },
      { name: "Player Agent / Manager", description: "Manages a player's career — tournament scheduling, sponsorship deals, contracts, and brand partnerships.", salary: "£30k–£150k+" },
    ],
  },
  {
    title: "Officiating & Tournaments",
    icon: Star,
    roles: [
      { name: "Chair Umpire", description: "Officiates on-court decisions at professional and amateur tournaments, including Grand Slam and ATP/WTA events.", salary: "£25k–£50k" },
      { name: "Tournament Referee", description: "Oversees draw procedures, scheduling, and on-site rule enforcement at tournaments.", salary: "£28k–£55k" },
      { name: "Tournament Director", description: "Manages all commercial, operational, and sporting aspects of a professional tournament.", salary: "£45k–£90k" },
      { name: "Events Operations Manager", description: "Coordinates logistics, staffing, and infrastructure for major tennis events including Wimbledon.", salary: "£35k–£60k" },
      { name: "Hawkeye / Tech Operator", description: "Operates ball-tracking and instant replay systems used for player challenges and broadcast graphics.", salary: "£28k–£45k" },
    ],
  },
  {
    title: "Media & Broadcasting",
    icon: Tv,
    roles: [
      { name: "Tennis Commentator", description: "Provides live expert commentary and analysis for TV, radio, and streaming broadcasts.", salary: "£30k–£100k+" },
      { name: "Broadcast Producer", description: "Directs and produces live tennis coverage and studio programming.", salary: "£35k–£65k" },
      { name: "Tennis Journalist", description: "Covers the tour for national or specialist publications — matchday reporting, features, and investigations.", salary: "£24k–£50k" },
      { name: "Digital Content Creator", description: "Creates social media content, short-form video, and editorial for clubs, tours, or media brands.", salary: "£24k–£40k" },
      { name: "Data Analyst / Statistician", description: "Produces performance statistics and visualisations used by broadcasters, coaches, and betting operators.", salary: "£28k–£50k" },
    ],
  },
  {
    title: "Commercial & Sponsorship",
    icon: Briefcase,
    roles: [
      { name: "Commercial Director", description: "Leads revenue generation across sponsorship, hospitality, broadcast rights, and licensing.", salary: "£65k–£130k+" },
      { name: "Sponsorship Manager", description: "Secures and manages partnerships with brands — title sponsors, equipment deals, and event partnerships.", salary: "£32k–£60k" },
      { name: "Marketing Manager", description: "Drives ticket sales, fan engagement, and brand awareness for a tournament or governing body.", salary: "£30k–£55k" },
      { name: "Hospitality Manager", description: "Runs premium tournament hospitality including corporate boxes, debenture packages, and VIP experiences.", salary: "£30k–£52k" },
      { name: "Licensing & Retail Manager", description: "Manages branded merchandise and licensing deals for events like Wimbledon.", salary: "£32k–£55k" },
    ],
  },
  {
    title: "Governing Bodies & Development",
    icon: Users,
    roles: [
      { name: "LTA Development Officer", description: "Grows participation in local areas — working with clubs, schools, and community groups to get more people playing.", salary: "£24k–£38k" },
      { name: "National Development Manager", description: "Leads regional or national participation strategies across schools, parks, and community clubs.", salary: "£38k–£60k" },
      { name: "ITF Programme Coordinator", description: "Coordinates international development programmes for the International Tennis Federation.", salary: "£28k–£45k" },
      { name: "Venue / Facility Manager", description: "Manages a tennis facility — courts, staff, scheduling, and commercial operations.", salary: "£28k–£50k" },
      { name: "Safeguarding & Welfare Officer", description: "Ensures the safety and welfare of junior players across clubs and academies.", salary: "£26k–£40k" },
    ],
  },
];

const newsfeed = [
  { title: "Tennishead", url: "https://tennishead.net" },
  { title: "BBC Sport Tennis", url: "https://www.bbc.co.uk/sport/tennis" },
  { title: "The Guardian Tennis", url: "https://www.theguardian.com/sport/tennis" },
];

const tennisCompanies = [
  {
    name: "LTA (Lawn Tennis Association)",
    founded: "1888",
    hq: "Roehampton, London",
    overview: "The governing body of tennis in Great Britain — responsible for growing the game, funding elite programmes, and running national competitions. Based at the National Tennis Centre.",
    url: "https://careers.lta.org.uk/vacancies/vacancy-search-results.aspx",
    glassdoor: 3.8,
    valueChainStage: "Governing Bodies & Development",
  },
  {
    name: "All England Club (AELTC)",
    founded: "1868",
    hq: "Wimbledon, London",
    overview: "The private members' club that hosts The Championships — one of the world's most iconic sporting events. Employs 600+ year-round staff, rising to thousands during Wimbledon fortnight.",
    url: "https://jobs.wimbledon.com/",
    glassdoor: 4.2,
    valueChainStage: "Officiating & Tournaments",
  },
  {
    name: "ITF (International Tennis Federation)",
    founded: "1913",
    hq: "London",
    overview: "The world governing body of tennis — overseeing 210 member nations, the Davis Cup, Billie Jean King Cup, and the Olympic tennis programme. Global HQ is based in London.",
    url: "https://www.itftennis.com/en/about-us/organisation/jobs/latest-jobs/",
    glassdoor: 3.7,
    valueChainStage: "Governing Bodies & Development",
  },
  {
    name: "ATP Tour",
    founded: "1972",
    hq: "London (European HQ)",
    overview: "The governing body of men's professional tennis — running the ATP Tour, ATP 250/500/1000 events, and ATP Finals. London is home to its European headquarters.",
    url: "https://www.atptour.com/en/corporate/careers",
    glassdoor: 3.9,
    valueChainStage: "Officiating & Tournaments",
  },
  {
    name: "WTA (Women's Tennis Association)",
    founded: "1973",
    hq: "St. Petersburg, FL (London office)",
    overview: "The global organising body of women's professional tennis, running 50+ events across 30 countries including the WTA Finals.",
    url: "https://www.wtatennis.com/job-opportunities",
    valueChainStage: "Officiating & Tournaments",
  },
  {
    name: "IMG Tennis",
    founded: "1960",
    hq: "London",
    overview: "IMG's tennis division manages elite player careers, owns and operates major tournaments (including the Miami Open), and produces tennis content globally.",
    url: "https://www.img.com/careers",
    glassdoor: 3.6,
    valueChainStage: "Commercial & Sponsorship",
  },
  {
    name: "Amazon Prime Video",
    founded: "2006",
    hq: "London",
    overview: "The exclusive UK rights holder for ATP Tour tennis — broadcasting live matches, producing studio coverage, and growing tennis audiences through Prime Video.",
    url: "https://www.amazon.jobs/en-gb",
    glassdoor: 3.8,
    valueChainStage: "Media & Broadcasting",
  },
  {
    name: "Hawk-Eye Innovations",
    founded: "2001",
    hq: "Basingstoke",
    overview: "The company behind ball-tracking technology used at every Grand Slam and major tournament — electronic line calling, VAR, and broadcast graphics.",
    url: "https://careers.hawkeyeinnovations.com/",
    glassdoor: 3.9,
    valueChainStage: "Officiating & Tournaments",
  },
  {
    name: "Castore",
    founded: "2015",
    hq: "Liverpool",
    overview: "Premium British sportswear brand dressing elite tennis players including Andy Murray — expanding rapidly across racket sports globally.",
    url: "https://castore.com/pages/careers",
    glassdoor: 3.4,
    valueChainStage: "Commercial & Sponsorship",
  },
  {
    name: "Babolat",
    founded: "1875",
    hq: "Lyon (UK office: London)",
    overview: "The world's oldest racket sports brand — creators of the modern tennis string and rackets used by top professionals worldwide.",
    url: "https://www.babolat.com/us/about-us/careers.html",
    valueChainStage: "Playing & Coaching",
  },
];

const Tennis = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-6">Coming soon — episodes unpacking how the tennis industry really works, from Wimbledon to the ATP locker room.</p>
          <PodcastPlayer industry="tennis" />
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
          <PodcastGrid podcasts={[
            { title: "The Tennis Podcast", description: "David Law and Catherine Whitaker — the UK's sharpest tennis journalism turned into podcast form. Essential listening for anyone in or entering the sport.", url: "https://open.spotify.com/show/0HiYmST4mfkVKVt8LmJCMg" },
            { title: "No Challenges Remaining", description: "Ben Rothenberg and Carl Bialik dig into the stories behind the scores — culture, controversy, and the business of professional tennis.", url: "https://open.spotify.com/show/6AvMFoFNy6pBXjK4CIjJip" },
            { title: "Served with Andy Roddick", description: "Former US Open champion Andy Roddick offers an insider view on the game — player careers, business, and what the modern tour really looks like.", url: "https://open.spotify.com/show/1jkuDnPZ9Tc2PG5wFGSuYc" },
            { title: "The Baseline", description: "The ATP Tour's official podcast — interviews with players, coaches, and tennis insiders from across the men's professional circuit.", url: "https://open.spotify.com/show/2mACqmcDcQoHpwFBATxGgE" },
          ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="tennis" />
          <LiveArticles industry="tennis" fallbackArticles={[
            { title: "Inside the LTA's Plan to Make Britain a Tennis Nation", source: "Tennishead", url: "https://tennishead.net" },
            { title: "How Wimbledon Became a £50 Million Business in a Fortnight", source: "The Guardian", url: "https://www.theguardian.com/sport/tennis" },
            { title: "The Careers Behind the Court: Working in Professional Tennis", source: "BBC Sport", url: "https://www.bbc.co.uk/sport/tennis" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="tennis" />
            <div className="mt-4">
              <BreakingNewsFeed industry="tennis" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="tennis" />
          </div>
        </>
      ),
    },
    {
      id: "watch",
      label: "Watch",
      content: (
        <>
          <VideoShowcase heading="Tennis on Screen" clips={industryVideos["tennis"] || []} />
          <div className="mt-12">
            <YouTubeChannels industry="tennis" />
            <TikTokCreators industry="tennis" />
          </div>
        </>
      ),
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={tennisCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="tennis" />
          </div>
          <div className="mt-12"><IndustryRolesLink industry="Tennis" /></div>
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From the practice court to the boardroom — every career in the tennis industry." stages={tennisStages} industry="tennis" />
          <ExploreFurther links={[
            { title: "LTA Coaching Pathway", description: "The official route to becoming a qualified tennis coach in Great Britain — Level 1 through to Master Professional.", url: "https://www.lta.org.uk/play-and-compete/ways-to-play/coaching/become-a-coach/" },
            { title: "ITF Officiating", description: "How to become an international tennis umpire or referee — training courses, grading, and progression to Grand Slam events.", url: "https://www.itftennis.com/en/growing-the-game/officiating/" },
            { title: "Sport England — Working in Sport", description: "Funding, grants, and career resources across the UK sport sector including racket sports.", url: "https://www.sportengland.org/careers" },
            { title: "Sports Management Worldwide", description: "Specialised courses in sports management, agent work, and the business side of professional sports.", url: "https://www.sportsmanagementworldwide.com" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Tennis" searchQuery="tennis industry events UK Wimbledon LTA" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Tennis" slug="tennis" />
          <CoursesSection industry="tennis" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Live tennis jobs<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles at the LTA, Wimbledon, ATP Tour, IMG, and across the UK tennis industry.</p>
            <Link to="/marketplace?industry=Tennis#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={tennisStages} industry="Tennis" companies={tennisCompanies} />
          <IndustryCVBuilder industry="Tennis" stages={tennisStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Tennis"
      description="The LTA, Wimbledon, ATP Tour, and the careers behind the world's most prestigious sport."
      profile="The UK tennis industry is built around some of the most iconic institutions in sport — from the All England Club hosting Wimbledon to the LTA developing the next generation of British champions. Beyond the court, the sector employs thousands across coaching, officiating, media, commercial, and player support roles. The ATP and ITF are both headquartered in London, making the UK the global administrative centre of the game. With Amazon Prime Video's broadcast deal transforming viewership and the LTA's £1 billion investment in tennis facilities, the industry is growing fast — and so is the demand for talent off the court."
      tabs={tabs}
    />
  );
};

export default Tennis;
