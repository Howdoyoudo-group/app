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
import { Lightbulb, Code, Palette, Megaphone, Gamepad2, Store } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const gamingStages: CareerStage[] = [
  { title: "Concept & Pre-Production", icon: Lightbulb, roles: [
    { name: "Game Designer", description: "Designs core gameplay mechanics, systems, and player experiences.", salary: "£28k–£55k" },
    { name: "Narrative Designer", description: "Crafts storylines, dialogue, and world-building for games.", salary: "£26k–£50k" },
    { name: "Creative Director", description: "Sets the overall creative vision for a game or studio.", salary: "£55k–£100k" },
    { name: "Level Designer", description: "Designs game environments, layouts, and spatial challenges.", salary: "£28k–£50k" },
    { name: "UX Designer", description: "Ensures intuitive player interfaces, menus, and in-game interactions.", salary: "£30k–£55k" },
    { name: "Producer", description: "Manages project timelines, budgets, and cross-team coordination.", salary: "£35k–£70k" },
  ]},
  { title: "Development & Engineering", icon: Code, roles: [
    { name: "Gameplay Programmer", description: "Codes core game mechanics, physics, and player interactions.", salary: "£30k–£65k" },
    { name: "Engine Programmer", description: "Builds and optimises the game engine and rendering pipeline.", salary: "£35k–£75k" },
    { name: "Tools Programmer", description: "Creates internal tools to speed up content creation and testing.", salary: "£30k–£60k" },
    { name: "Network Engineer", description: "Develops multiplayer infrastructure, matchmaking, and netcode.", salary: "£35k–£70k" },
    { name: "AI Programmer", description: "Designs NPC behaviour, pathfinding, and procedural systems.", salary: "£32k–£65k" },
    { name: "Technical Director", description: "Leads the engineering team and sets technical architecture.", salary: "£55k–£95k" },
    { name: "DevOps / Build Engineer", description: "Manages build pipelines, version control, and deployment.", salary: "£35k–£60k" },
  ]},
  { title: "Art & Audio", icon: Palette, roles: [
    { name: "Concept Artist", description: "Creates visual reference art for characters, environments, and props.", salary: "£25k–£50k" },
    { name: "3D Character Artist", description: "Models, textures, and sculpts characters for games.", salary: "£28k–£55k" },
    { name: "Environment Artist", description: "Builds 3D worlds, terrain, and in-game locations.", salary: "£26k–£50k" },
    { name: "Animator", description: "Creates character movement, cutscenes, and visual effects animations.", salary: "£26k–£55k" },
    { name: "Technical Artist", description: "Bridges art and engineering - shaders, pipelines, and performance.", salary: "£32k–£60k" },
    { name: "VFX Artist", description: "Designs particle effects, explosions, spells, and environmental FX.", salary: "£28k–£55k" },
    { name: "Audio Designer / Composer", description: "Creates sound effects, ambient audio, and original music scores.", salary: "£25k–£50k" },
    { name: "UI Artist", description: "Designs in-game menus, HUDs, and interface visuals.", salary: "£26k–£48k" },
  ]},
  { title: "QA & Live Ops", icon: Gamepad2, roles: [
    { name: "QA Tester", description: "Tests for bugs, glitches, and gameplay issues across platforms.", salary: "£20k–£30k" },
    { name: "QA Lead", description: "Manages the testing team, triages bugs, and signs off builds.", salary: "£28k–£42k" },
    { name: "Live Ops Manager", description: "Runs post-launch content updates, seasonal events, and player engagement.", salary: "£35k–£60k" },
    { name: "Data Analyst", description: "Analyses player behaviour, retention, and monetisation metrics.", salary: "£30k–£55k" },
    { name: "Localisation Manager", description: "Coordinates translation and cultural adaptation for global markets.", salary: "£28k–£45k" },
    { name: "Community Manager", description: "Engages with players on social media, forums, and Discord.", salary: "£24k–£40k" },
  ]},
  { title: "Marketing & Publishing", icon: Megaphone, roles: [
    { name: "Brand Manager", description: "Defines and executes the marketing strategy for a game title.", salary: "£32k–£55k" },
    { name: "PR Manager", description: "Manages press coverage, review copies, and media relationships.", salary: "£30k–£50k" },
    { name: "Influencer Marketing Manager", description: "Partners with streamers, YouTubers, and content creators.", salary: "£28k–£50k" },
    { name: "Trailer Editor / Motion Designer", description: "Creates cinematic trailers and promotional video content.", salary: "£28k–£50k" },
    { name: "Social Media Manager", description: "Runs the studio or game's social channels and community tone.", salary: "£24k–£42k" },
    { name: "User Acquisition Manager", description: "Drives downloads and installs through paid and organic channels.", salary: "£30k–£55k" },
  ]},
  { title: "Business & Distribution", icon: Store, roles: [
    { name: "Business Development Manager", description: "Negotiates platform deals, partnerships, and licensing.", salary: "£35k–£65k" },
    { name: "Monetisation Designer", description: "Designs in-game economies, battle passes, and microtransaction models.", salary: "£30k–£55k" },
    { name: "Esports Manager", description: "Organises competitive leagues, tournaments, and broadcasting.", salary: "£28k–£50k" },
    { name: "Licensing Manager", description: "Manages IP licensing for merchandise, spin-offs, and adaptations.", salary: "£32k–£55k" },
    { name: "Platform Relations Manager", description: "Manages relationships with PlayStation, Xbox, Nintendo, and Steam.", salary: "£35k–£60k" },
  ]},
];

const newsfeed = [
  { title: "GamesIndustry.biz", url: "https://www.gamesindustry.biz" },
  { title: "Eurogamer", url: "https://www.eurogamer.net" },
  { title: "MCV/DEVELOP", url: "https://www.mcvdevelop.com" },
];

const gamingCompanies = [
  { name: "Rockstar Games", url: "https://www.rockstargames.com/careers", founded: "1998", hq: "Edinburgh / London", overview: "Creators of GTA and Red Dead Redemption - one of the UK's most iconic studios.", valueChainStage: "Development & Engineering" },
  { name: "Playground Games", url: "https://www.playground-games.com/careers", founded: "2010", hq: "Leamington Spa", overview: "Creators of Forza Horizon - one of Xbox's flagship first-party studios.", valueChainStage: "Development & Engineering" },
  { name: "Rare", url: "https://www.rare.co.uk/careers", founded: "1985", hq: "Twycross", overview: "Legendary studio behind Sea of Thieves, Banjo-Kazooie, and GoldenEye.", valueChainStage: "Development & Engineering" },
  { name: "Frontier Developments", url: "https://www.frontier.co.uk/careers", founded: "1994", hq: "Cambridge", glassdoor: 3.6, overview: "Creators of Planet Coaster and Elite Dangerous - publicly listed UK studio.", valueChainStage: "Development & Engineering" },
  { name: "Creative Assembly", url: "https://www.creative-assembly.com/careers", founded: "1987", hq: "Horsham", overview: "Home of Total War - one of SEGA's key European studios.", valueChainStage: "Development & Engineering" },
  { name: "Ninja Theory", url: "https://www.ninjatheory.com/careers", founded: "2000", hq: "Cambridge", overview: "Award-winning studio (Hellblade) - now part of Xbox Game Studios.", valueChainStage: "Development & Engineering" },
  { name: "Sumo Digital", url: "https://www.sumo-digital.com/careers/", founded: "2003", hq: "Sheffield", overview: "One of the UK's largest independent studios - work-for-hire and original IP.", valueChainStage: "Development & Engineering" },
  { name: "Team17", url: "https://www.team17.com/careers", founded: "1990", hq: "Wakefield", glassdoor: 3.4, overview: "Publisher and developer - Worms, Overcooked, and a large indie publishing label.", valueChainStage: "Marketing & Publishing" },
  { name: "Jagex", url: "https://www.jagex.com/en-GB/careers", founded: "2001", hq: "Cambridge", overview: "Creators and live operators of RuneScape - one of the UK's longest-running MMOs.", valueChainStage: "QA & Live Ops" },
  { name: "Sports Interactive", url: "https://www.sigames.com/careers", founded: "1994", hq: "London", overview: "Creators of Football Manager - a beloved annual simulation franchise.", valueChainStage: "Development & Engineering" },
  { name: "Ubisoft Reflections", url: "https://www.ubisoft.com/en-gb/company/careers", founded: "1984", hq: "Newcastle", overview: "Ubisoft's Newcastle studio - contributed to The Division, Watch Dogs, and more.", valueChainStage: "Development & Engineering" },
  { name: "nDreams", url: "https://www.ndreams.com/careers", founded: "2006", hq: "Farnborough", overview: "Leading UK VR game studio - pushing the boundaries of immersive gaming.", valueChainStage: "Development & Engineering" },
  { name: "Playrix", url: "https://playrix.com/job/open", founded: "2004", hq: "Dublin (global remote)", overview: "One of the world's largest mobile game developers - creators of Gardenscapes, Homescapes, and Township.", valueChainStage: "Development & Engineering" },
];

const Gaming = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind games.</p>
        <PodcastPlayer industry="gaming" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "My Perfect Console", description: "Guests build their dream console lineup - gaming nostalgia meets industry chat.", url: "https://www.myperfectconsole.com" },
            { title: "The AIAS Game Maker's Notebook", description: "AIAS interviews with top game developers on craft, creativity, and careers.", url: "https://open.spotify.com/show/2yB9jTRog4XGCKG5bpNZUA" },
            { title: "Eggplant: The Secret Lives of Games", description: "Long-form developer conversations on the design, business and craft of making games.", url: "https://open.spotify.com/show/3pWWpGpkVmaP6QyNgPLqde" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="gaming" />
        <LiveArticles industry="gaming" fallbackArticles={[
          { title: "UK Games Industry Census 2026", source: "UKIE", url: "https://ukie.org.uk" },
          { title: "How UK Studios Are Shaping Next-Gen", source: "GamesIndustry.biz", url: "https://www.gamesindustry.biz" },
          { title: "The Business of Live Service Games", source: "MCV/DEVELOP", url: "https://www.mcvdevelop.com" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="gaming" />
          <div className="mt-4"><BreakingNewsFeed industry="gaming" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="gaming" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["gaming"] || []} /><div className="mt-12"><YouTubeChannels industry="gaming" /><TikTokCreators industry="gaming" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={gamingCompanies} />
        <div className="mt-12"><DayInTheLife industry="gaming" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From concept art to competitive esports - every role in the games industry." stages={gamingStages} industry="gaming" />
          <div className="mt-12"><IndustryRolesLink industry="Gaming" /></div>
        <ExploreFurther links={[
          { title: "UKIE - The UK Games Industry Body", description: "The trade body for the UK games industry, with career resources, events, and workforce data.", url: "https://ukie.org.uk" },
          { title: "Into Games", description: "Free career resources, mentoring, and events helping people break into the games industry.", url: "https://intogames.org" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Gaming" searchQuery="gaming esports game development UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Gaming" slug="gaming" />
          <CoursesSection industry="gaming" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Enter a new level<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the gaming industry.</p>
          <Link to="/marketplace?industry=Gaming#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={gamingStages} industry="Gaming" companies={gamingCompanies} />
        <IndustryCVBuilder industry="Gaming" stages={gamingStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Gaming"
      description="Studios, esports, streamers, and the £7 billion UK industry behind the games we play."
      profile="The UK gaming industry is one of the largest in Europe, generating over £7 billion in annual revenue and employing more than 70,000 people across development studios, publishers, esports organisations, and creator platforms. It spans AAA console titles, indie studios, mobile and live-service games, and a fast-growing streaming and competitive scene. Behind every release sits a deep network of designers, engineers, artists, marketers, and community teams shaping how millions of players spend their time."
      tabs={tabs}
    />
  );
};

export default Gaming;
