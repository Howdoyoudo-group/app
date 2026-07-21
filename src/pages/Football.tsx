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
import TikTokCreators from "@/components/TikTokCreators";
import SubstackNewsletters from "@/components/SubstackNewsletters";
import PodcastPlayer from "@/components/PodcastPlayer";
import IndustryPageLayout from "@/components/IndustryPageLayout";
import IndustryRolesLink from "@/components/IndustryRolesLink";
import { Users, Search, Building2, Trophy, Tv, Briefcase } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import footballCareerMap from "@/assets/football-career-map.png";
import stageYouth from "@/assets/career-stages/football-youth-development.jpg";
import stageScouting from "@/assets/career-stages/football-scouting.jpg";
import stageOps from "@/assets/career-stages/football-club-operations.jpg";
import stageMatchday from "@/assets/career-stages/football-matchday.jpg";
import stageBroadcasting from "@/assets/career-stages/football-broadcasting.jpg";
import stageCommercial from "@/assets/career-stages/football-commercial.jpg";
import podPriceOfFootball from "@/assets/podcasts/price-of-football.jpg";
import podFootballRamble from "@/assets/podcasts/football-ramble.jpg";
import podTifoFootball from "@/assets/podcasts/tifo-football.jpg";
import podFootballWeekly from "@/assets/podcasts/football-weekly.jpg";

const footballStages: CareerStage[] = [
  { title: "Youth Development", icon: Users, image: stageYouth, roles: [{ name: "Academy Coach", description: "Develops young players' skills through structured training programmes.", salary: "£25k–£45k" },{ name: "Youth Development Officer", description: "Delivers youth football programmes in the community and at club level.", salary: "£24k–£38k" },{ name: "Academy Director", description: "Leads the academy strategy and oversees player pathway development.", salary: "£50k–£100k+" },{ name: "Sports Scientist", description: "Monitors player fitness, load management, and physical performance data.", salary: "£28k–£50k" },{ name: "Academy Scout", description: "Identifies talented young players across grassroots and school football.", salary: "£22k–£40k" },{ name: "Academy Physiotherapist", description: "Provides injury prevention, rehabilitation, and pitch-side care for academy players.", salary: "£28k–£45k" },{ name: "Safeguarding Officer", description: "Ensures the welfare and protection of young players across the academy.", salary: "£28k–£42k" }]},
  { title: "Scouting & Recruitment", icon: Search, image: stageScouting, roles: [{ name: "Chief Scout", description: "Leads the scouting department and oversees player recruitment strategy.", salary: "£45k–£90k" },{ name: "Data Analyst", description: "Uses statistical models and tools like Opta to evaluate player performance.", salary: "£30k–£55k" },{ name: "Video Analyst", description: "Analyses match and training footage for tactical and recruitment insights.", salary: "£24k–£40k" },{ name: "Agent / Intermediary", description: "Represents players in contract negotiations and transfer deals.", salary: "£30k–£200k+" },{ name: "Head of Recruitment", description: "Oversees the club's player identification and signing strategy.", salary: "£50k–£100k+" }]},
  { title: "Club Operations", icon: Building2, image: stageOps, roles: [{ name: "CEO / Managing Director", description: "Runs the business side of the club across all commercial and operational functions.", salary: "£80k–£250k+" },{ name: "Football Director", description: "Oversees football strategy including transfers, contracts, and sporting vision.", salary: "£60k–£150k+" },{ name: "Stadium Manager", description: "Oversees stadium facilities, maintenance, and non-matchday events.", salary: "£35k–£60k" },{ name: "Finance Director", description: "Oversees financial planning, FFP compliance, and budgeting.", salary: "£55k–£120k" },{ name: "Grounds Manager", description: "Maintains the pitch and training ground surfaces to elite standards.", salary: "£28k–£50k" },{ name: "Kit Manager", description: "Manages player and staff equipment, laundry, and matchday preparation.", salary: "£22k–£35k" },{ name: "Head of Women's Football", description: "Leads strategy and operations for the club's women's team.", salary: "£40k–£80k" }]},
  { title: "Matchday", icon: Trophy, image: stageMatchday, roles: [{ name: "First Team Manager", description: "Selects the team, sets tactics, and leads all first-team coaching.", salary: "£60k–£500k+" },{ name: "Performance Analyst", description: "Provides real-time data analysis during matches to inform tactical decisions.", salary: "£28k–£50k" },{ name: "Team Doctor", description: "Provides pitch-side medical care and oversees player health.", salary: "£50k–£120k" },{ name: "Matchday Operations Manager", description: "Coordinates matchday logistics including safety, stewards, and hospitality.", salary: "£30k–£50k" },{ name: "First Team Physiotherapist", description: "Delivers hands-on treatment, recovery protocols, and rehabilitation for players.", salary: "£30k–£55k" },{ name: "Nutritionist", description: "Designs player meal plans and optimises diet for performance and recovery.", salary: "£28k–£48k" },{ name: "Strength & Conditioning Coach", description: "Designs physical training programmes to build player resilience and athleticism.", salary: "£28k–£50k" }]},
  { title: "Broadcasting", icon: Tv, image: stageBroadcasting, roles: [{ name: "Commentator", description: "Provides live commentary for TV, radio, and streaming broadcasts.", salary: "£30k–£100k+" },{ name: "Producer", description: "Directs live football broadcasts and studio output.", salary: "£35k–£65k" },{ name: "Rights Negotiator", description: "Negotiates broadcasting rights deals worth billions across territories.", salary: "£45k–£100k+" },{ name: "Digital Content Manager", description: "Creates digital content across club and league platforms.", salary: "£28k–£48k" },{ name: "Media Officer", description: "Manages press conferences, media access, and club communications.", salary: "£26k–£42k" }]},
  { title: "Commercial", icon: Briefcase, image: stageCommercial, roles: [{ name: "Commercial Director", description: "Leads revenue generation across sponsorship, hospitality, and partnerships.", salary: "£60k–£120k+" },{ name: "Sponsorship Manager", description: "Secures and manages sponsorship deals with brands and partners.", salary: "£32k–£60k" },{ name: "Ticketing Manager", description: "Manages ticket sales, season tickets, and matchday revenue.", salary: "£28k–£45k" },{ name: "Community Officer", description: "Delivers community programmes linking the club to its local area.", salary: "£22k–£35k" },{ name: "Hospitality Manager", description: "Runs premium matchday hospitality suites and corporate experiences.", salary: "£30k–£50k" },{ name: "Merchandising Manager", description: "Manages retail operations including club shops and online merchandise.", salary: "£28k–£45k" }]},
];

const newsfeed = [
  { title: "The Athletic", url: "https://theathletic.com/football/" },
  { title: "BBC Sport Football", url: "https://www.bbc.co.uk/sport/football" },
  { title: "Sky Sports Football", url: "https://www.skysports.com/football" },
];


const footballCompanies = [
  { name: "Manchester United", url: "https://www.manutd.com/en/club/jobs", founded: "1878", hq: "Manchester", glassdoor: 3.8, overview: "One of the world's most valuable football clubs - 1,000+ non-playing staff across Old Trafford and Carrington.", valueChainStage: "Club Operations" },
  { name: "Liverpool FC", url: "https://careers.liverpoolfc.com", founded: "1892", hq: "Liverpool", glassdoor: 4.0, overview: "Fenway Sports Group-owned club with major commercial and media operations.", valueChainStage: "Club Operations" },
  { name: "Arsenal", url: "https://careers.arsenal.com/jobs", founded: "1886", hq: "London", glassdoor: 3.9, overview: "North London club with a growing corporate operation spanning Emirates Stadium and the Sobha Realty Training Centre.", valueChainStage: "Club Operations" },
  { name: "Chelsea FC", url: "https://www.chelseafc.com/en/careers", founded: "1905", hq: "London", glassdoor: 3.7, overview: "Clearlake Capital-owned club undergoing major organisational expansion.", valueChainStage: "Club Operations" },
  { name: "Tottenham Hotspur", url: "https://www.tottenhamhotspur.com/the-club/careers/", founded: "1882", hq: "London", glassdoor: 3.8, overview: "Operators of the newest Premier League stadium - a major venue and events business.", valueChainStage: "Club Operations" },
  { name: "City Football Group", url: "https://www.cityfootballgroup.com/careers/", founded: "2013", hq: "Manchester", glassdoor: 3.9, overview: "The multi-club ownership group behind Manchester City.", valueChainStage: "Club Operations" },
  { name: "DAZN", url: "https://careers.dazn.com", founded: "2016", hq: "London", glassdoor: 3.3, overview: "The sports streaming platform challenging traditional pay-TV.", valueChainStage: "Broadcasting" },
  { name: "Levy UK", url: "https://levy.co.uk/people/", founded: "2017", hq: "London", glassdoor: 3.5, overview: "Premium matchday hospitality at major venues.", valueChainStage: "Matchday" },
  { name: "Sky Sports", url: "https://careers.sky.com", founded: "1991", hq: "Isleworth", glassdoor: 3.8, profileUrl: "/company/sky-sports", overview: "The UK's dominant sports broadcaster.", valueChainStage: "Broadcasting" },
  { name: "BBC Sport", url: "https://www.bbc.co.uk/careers", founded: "1922", hq: "Salford (MediaCityUK)", glassdoor: 4.1, overview: "The UK's public service broadcaster - Match of the Day, 5 Live, and the BBC Sport website.", valueChainStage: "Broadcasting" },
  { name: "Stats Perform (Opta)", url: "https://www.statsperform.com/careers/", founded: "1996", hq: "Leeds", glassdoor: 3.7, overview: "The world's leading sports data company.", valueChainStage: "Scouting & Recruitment" },
  { name: "The Football Association", url: "https://careers.thefa.com/jobs/home/", founded: "1863", hq: "London (Wembley)", glassdoor: 3.9, overview: "The governing body of English football.", valueChainStage: "Governing Bodies" },
  { name: "The Premier League", url: "https://careers.premierleague.com/", founded: "1992", hq: "London", glassdoor: 4.1, profileUrl: "/company/premier-league", overview: "The world's most-watched football league.", valueChainStage: "Governing Bodies" },
  { name: "EFL", url: "https://efl.com/working-at-the-efl", founded: "1888", hq: "Preston", glassdoor: 3.6, overview: "The English Football League - 72 clubs across the Championship, League One, and League Two.", valueChainStage: "Governing Bodies" },
  { name: "Wrexham AFC", url: "https://careers.wrexhamafc.co.uk", founded: "1864", hq: "Wrexham", glassdoor: 4.2, trustpilot: 4.5, overview: "The club acquired by Ryan Reynolds and Rob McElhenney.", valueChainStage: "Club Operations" },
  { name: "Brighton & Hove Albion", url: "https://www.brightonandhovealbion.com/club/work-for-us", founded: "1901", hq: "Brighton", glassdoor: 3.9, overview: "Premier League club known for data-led recruitment and one of the most progressive front offices in the game.", valueChainStage: "Club Operations" },
];

const Football = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<>
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
      <div className="border border-border p-5 mb-6"><h3 className="font-display font-700 text-foreground text-sm mb-1">Wall Street Is Rewiring European Soccer</h3><p className="text-muted-foreground font-body text-xs mb-3">How American private equity is buying up football clubs.</p><audio controls className="w-full" preload="metadata"><source src="/audio/wall-street-is-rewiring-european-soccer.m4a" type="audio/mp4" /></audio></div>
      <PodcastPlayer industry="football" />
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { title: "The Price of Football", description: "Kieran Maguire breaks down the business and finances behind football.", url: "https://open.spotify.com/show/7c7ltYVwnicbVz0uYTXAW5", image: podPriceOfFootball },
          { title: "Football Ramble", description: "Culture, tactics, and the beautiful game - since 2007.", url: "https://open.spotify.com/show/5vK22FRxc1VghAYzyemMZP", image: podFootballRamble },
          { title: "Tifo Football Podcast", description: "Tactics, history, and the stories behind football.", url: "https://open.spotify.com/show/06QIGhqK31Qw1UvfHzRIDA", image: podTifoFootball },
          { title: "Football Weekly", description: "The Guardian's flagship football podcast.", url: "https://open.spotify.com/show/6w8qWe0kjgHEHSWDSDGoLW", image: podFootballWeekly },
        ].map((pod) => (
          <a key={pod.url} href={pod.url} target="_blank" rel="noopener noreferrer" className="block border-2 border-border hover:border-primary transition-all group overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img src={pod.image} alt={pod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" width={512} height={512} />
            </div>
            <div className="p-3">
              <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors leading-tight">{pod.title}</h3>
              <p className="text-muted-foreground font-body text-xs mt-1 line-clamp-2">{pod.description}</p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-display font-600 text-primary uppercase tracking-wider">Listen on Spotify →</span>
            </div>
          </a>
        ))}
      </div>
    </>) },
    { id: "read", label: "Read", content: (<><DailyBriefing industry="football" /><LiveArticles industry="football" fallbackArticles={[{ title: "Premier League Clubs Generated £6.4 Billion in Revenue", source: "Deloitte", url: "https://www2.deloitte.com/uk/en/pages/sports-business-group.html" },{ title: "How Multi-Club Ownership Is Reshaping Football", source: "The Athletic", url: "https://theathletic.com/football/" }]} /><div className="mt-12"><NewsfeedModal sources={newsfeed} industry="football" /><div className="mt-4"><BreakingNewsFeed industry="football" sources={newsfeed} /></div></div><div className="mt-12"><SubstackNewsletters industry="football" /></div></>) },
    { id: "watch", label: "Watch", content: (<><VideoShowcase heading="Unpacking Football on Screen" clips={industryVideos["football"] || []} /><div className="mt-12"><YouTubeChannels industry="football" /></div><div className="mt-10"><TikTokCreators industry="football" /></div></>) },
    { id: "work", label: "Who?", content: (<><CompanyProfileGrid companies={footballCompanies} /><div className="mt-12"><DayInTheLife industry="football" /></div><div className="mt-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2><img src={footballCareerMap} alt="Football career map infographic" className="w-full rounded-sm" loading="lazy" /></div></>) },
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From academy to boardroom - the careers that power the beautiful game." stages={footballStages} industry="football" />
          <div className="mt-12"><IndustryRolesLink industry="Football" /></div>
        <ExploreFurther links={[
          { title: "Premier League - Careers", description: "Explore careers across the Premier League organisation and its member clubs.", url: "https://www.premierleague.com/about" },
          { title: "The Football Association - Jobs", description: "Career opportunities at English football's governing body, from coaching to commercial.", url: "https://careers.thefa.com/jobs/home/" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Football" searchQuery="football industry" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <Link to="/football/badge" className="block border-2 border-foreground bg-primary/10 p-6 mb-8 hover:bg-primary/20 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">New · Earn your badge</p>
            <h2 className="font-display text-2xl md:text-3xl mb-2">Football Fundamentals<span className="text-primary">.</span></h2>
            <p className="text-sm text-muted-foreground mb-3">Four short lessons + a quiz. About 15 minutes. Earn the badge and show employers on Howdy that you know the industry.</p>
            <span className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-wide text-primary">Start learning →</span>
          </Link>
          <TheDownload industry="Football" slug="football" />
          <CoursesSection industry="football" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Kick off something new or fancy a transfer<span className="text-primary">?</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the football industry.</p><Link to="/marketplace?industry=Football#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link></div><IndustryRolesShowcase stages={footballStages} industry="Football" companies={footballCompanies} />
        <IndustryCVBuilder industry="Football" stages={footballStages} /></>) },
  ];
  return <IndustryPageLayout name="Football" description="Billions in broadcast deals, grassroots clubs on the brink, and the business empire behind the beautiful game." profile="The football industry encompasses professional clubs, leagues, media rights, sponsorship, and grassroots participation. In the UK, it supports around 100,000 to 150,000 jobs across sporting, commercial, and operational roles. Beneath the surface of the game lies a global business driven by broadcasting revenue, fan engagement, and commercial partnerships." tabs={tabs} />;
};

export default Football;
