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
import DayInTheLife from "@/components/DayInTheLife";
import CoursesSection from "@/components/CoursesSection";
import TheDownload from "@/components/TheDownload";
import YouTubeChannels from "@/components/YouTubeChannels";
import TikTokCreators from "@/components/TikTokCreators";
import SubstackNewsletters from "@/components/SubstackNewsletters";
import PodcastPlayer from "@/components/PodcastPlayer";
import IndustryPageLayout from "@/components/IndustryPageLayout";
import IndustryRolesShowcase from "@/components/IndustryRolesShowcase";
import IndustryRolesLink from "@/components/IndustryRolesLink";
import { Wrench, TrendingUp, Tv, Users, Briefcase, Trophy } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const formula1Stages: CareerStage[] = [
  { title: "Engineering & Design", icon: Wrench, roles: [
    { name: "Aerodynamicist", description: "Designs and optimises the car's aerodynamic surfaces - wind-tunnel and CFD-led development.", salary: "£40k–£90k" },
    { name: "Race Engineer", description: "The driver's main point of contact on strategy, car setup and in-race communication.", salary: "£45k–£100k+" },
    { name: "Performance Engineer", description: "Analyses data from the car and simulator to find tenths across every lap.", salary: "£40k–£80k" },
    { name: "Design Engineer (Mechanical)", description: "Designs car components - suspension, gearbox casings, bodywork - in CAD for manufacture.", salary: "£35k–£75k" },
    { name: "Composite Technician", description: "Manufactures carbon-fibre components - laminating, autoclaving and finishing.", salary: "£28k–£45k" },
    { name: "Simulation Engineer", description: "Builds and runs vehicle dynamics models to predict car behaviour before it hits the track.", salary: "£45k–£85k" },
  ]},
  { title: "Operations & Logistics", icon: TrendingUp, roles: [
    { name: "Team Manager", description: "Runs the race team on track - pit-stop coordination, FIA liaison, team logistics.", salary: "£60k–£120k+" },
    { name: "Logistics Manager", description: "Moves cars, equipment and motorhomes across the global calendar - 24 races a year.", salary: "£40k–£70k" },
    { name: "Pit Crew / Mechanic", description: "Builds, strips and services the car in the garage - and executes sub-two-second pit stops.", salary: "£35k–£60k" },
    { name: "Tyre Engineer", description: "Manages the Pirelli tyre strategy - pressures, temperatures and degradation.", salary: "£40k–£75k" },
    { name: "IT / Trackside Systems Engineer", description: "Maintains trackside servers, telemetry links and communication networks at every Grand Prix.", salary: "£40k–£70k" },
  ]},
  { title: "Commercial & Marketing", icon: Briefcase, roles: [
    { name: "Sponsorship Manager", description: "Brings partners into F1 - negotiating title deals, activations and hospitality packages.", salary: "£45k–£90k" },
    { name: "Marketing Manager", description: "Runs brand campaigns, social media and fan engagement across race weekends and beyond.", salary: "£38k–£70k" },
    { name: "Hospitality & Events Coordinator", description: "Delivers Paddock Club and team hospitality at every Grand Prix and partner event.", salary: "£30k–£50k" },
    { name: "Licensing & Merchandise Manager", description: "Manages the team's consumer products - teamwear, accessories and brand licensing.", salary: "£35k–£60k" },
    { name: "Partnerships Analyst", description: "Values sponsorship assets, tracks ROI and supports new deal pitches.", salary: "£30k–£50k" },
  ]},
  { title: "Data & Technology", icon: Trophy, roles: [
    { name: "Data Scientist (Vehicle Performance)", description: "Applies machine-learning models to race telemetry and strategy optimisation.", salary: "£50k–£100k+" },
    { name: "Software Engineer (Control Systems)", description: "Writes real-time embedded code controlling the car's electronics and power unit.", salary: "£45k–£90k" },
    { name: "Strategy Engineer", description: "Builds race-strategy simulations - when to pit, tyre choice, weather scenarios.", salary: "£45k–£85k" },
    { name: "CFD Engineer", description: "Runs computational fluid dynamics simulations to test aero concepts within the cost cap.", salary: "£40k–£80k" },
    { name: "Electronics Engineer", description: "Designs and maintains on-car sensor systems, data logging and telemetry hardware.", salary: "£38k–£70k" },
  ]},
  { title: "Media & Broadcast", icon: Tv, roles: [
    { name: "F1 Broadcast Presenter", description: "Hosts race-day coverage on Sky Sports F1, Channel 4 or F1 TV - pit-lane and commentary.", salary: "£50k–£300k+" },
    { name: "Content Producer (F1 Media)", description: "Creates behind-the-scenes, social-first and long-form content for teams or F1 HQ.", salary: "£30k–£55k" },
    { name: "Social Media Manager", description: "Runs a team's race-day social - real-time content, memes, fan engagement.", salary: "£28k–£50k" },
    { name: "F1 Journalist", description: "Covers the paddock for Autosport, Motorsport.com, The Race or national press.", salary: "£28k–£65k" },
    { name: "Photographer / Videographer", description: "Captures on-track and paddock imagery for teams, sponsors and the FIA.", salary: "£30k–£60k" },
  ]},
  { title: "Business & Leadership", icon: Users, roles: [
    { name: "Team Principal", description: "Overall leader of an F1 team - sporting direction, commercial strategy and culture.", salary: "£500k–£10m+" },
    { name: "Technical Director", description: "Leads the entire engineering department - car concept, design philosophy and regulation interpretation.", salary: "£200k–£2m+" },
    { name: "Sporting Director", description: "Manages the sporting regulations, driver contracts and FIA relationship.", salary: "£100k–£500k+" },
    { name: "Head of Aerodynamics", description: "Leads the aero department - wind-tunnel programme, CFD and on-car development.", salary: "£120k–£400k+" },
    { name: "Finance Director / CFO", description: "Manages the team's budget under the F1 cost cap - financial compliance and reporting.", salary: "£100k–£300k+" },
  ]},
];

const newsfeed = [
  { title: "Autosport", url: "https://www.autosport.com/f1/" },
  { title: "The Race", url: "https://www.the-race.com/formula-1/" },
  { title: "Motorsport.com", url: "https://www.motorsport.com/f1/" },
  { title: "Formula1.com News", url: "https://www.formula1.com/en/latest/all" },
];

const formula1Companies = [
  { name: "Formula 1 (Liberty Media)", url: "https://corp.formula1.com/careers/", founded: "1950", hq: "London", overview: "The commercial rights holder of F1 - 750-strong London HQ running the sport's global calendar, broadcast and digital platforms.", valueChainStage: "Business & Leadership" },
  { name: "McLaren Racing", url: "https://racingcareers.mclaren.com/", founded: "1963", hq: "Woking", overview: "One of the most successful teams in F1 history - the McLaren Technology Centre in Woking is one of motorsport's most iconic workplaces.", valueChainStage: "Engineering & Design" },
  { name: "Mercedes-AMG PETRONAS F1 Team", url: "https://www.mercedesamgf1.com/careers", founded: "2010", hq: "Brackley", overview: "Eight-time constructors' champions - over 1,000 staff across the Brackley race campus and Brixworth engine facility.", valueChainStage: "Engineering & Design" },
  { name: "Red Bull Racing", url: "https://www.redbullracing.com/int-en/jobs", founded: "2005", hq: "Milton Keynes", overview: "Four-time constructors' champions - the Red Bull Technology Campus is one of F1's most advanced facilities.", valueChainStage: "Engineering & Design" },
  { name: "Aston Martin Aramco F1 Team", url: "https://www.astonmartinf1.com/en-GB/careers", founded: "2021", hq: "Silverstone", overview: "Lawrence Stroll's ambitious F1 project - building a brand-new state-of-the-art campus at Silverstone.", valueChainStage: "Engineering & Design" },
  { name: "Williams Racing", url: "https://careers.williamsf1.com/", founded: "1977", hq: "Grove", overview: "Nine-time constructors' champions - one of F1's most storied teams, now under Dorilton Capital ownership.", valueChainStage: "Engineering & Design" },
  { name: "Cadillac F1 Team", url: "https://www.motorsportjobs.com/en/jobs/formula-one/united-kingdom", founded: "2026", hq: "Silverstone", overview: "F1's newest entry - GM/Cadillac building a UK-based team from scratch for the 2026 season.", valueChainStage: "Engineering & Design" },
  { name: "Alpine F1 Team", url: "https://www.alpinecars.com/en/formula-1/careers/", founded: "1977", hq: "Enstone", overview: "Renault's F1 works team - the Enstone factory in Oxfordshire is one of Motorsport Valley's key employers.", valueChainStage: "Engineering & Design" },
  { name: "Haas F1 Team", url: "https://www.haasf1team.com/careers", founded: "2016", hq: "Banbury", overview: "American-owned, UK-based - the youngest team on the F1 grid with operations in Banbury.", valueChainStage: "Operations & Logistics" },
  { name: "Sky Sports F1", url: "https://careers.sky.com", founded: "2012", hq: "London", overview: "The UK's primary F1 broadcaster - live coverage of every session, race and test.", valueChainStage: "Media & Broadcast" },
  { name: "Motorsport Network", url: "https://www.motorsportnetwork.com/careers", founded: "1999", hq: "London", overview: "The world's largest motorsport digital media group - Autosport, Motorsport.com and The Race.", valueChainStage: "Media & Broadcast" },
  { name: "Pirelli Motorsport", url: "https://www.pirelli.com/global/en-ww/life-at-pirelli/join-us", founded: "1872", hq: "Burton-on-Trent (UK)", overview: "F1's sole tyre supplier since 2011 - develops bespoke compounds for every circuit on the calendar.", valueChainStage: "Operations & Logistics" },
  { name: "FIA", url: "https://www.fia.com/careers", founded: "1904", hq: "Geneva / London", overview: "The governing body of world motorsport - writes the F1 technical and sporting regulations.", valueChainStage: "Business & Leadership" },
  { name: "Silverstone Circuits", url: "https://careers.silverstone.co.uk/", founded: "1948", hq: "Silverstone", overview: "Home of the British Grand Prix - the UK's premier motorsport venue and a major events destination.", valueChainStage: "Operations & Logistics" },
  { name: "Motorsport UK", url: "https://www.motorsportuk.org/about-us/vacancies/", founded: "1905", hq: "Bicester", overview: "The UK's national motorsport governing body - licensing, regulation and grassroots development.", valueChainStage: "Business & Leadership" },
];

const Formula1 = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes unpacking careers behind the pit wall, in the wind tunnel and across the paddock.</p>
        <PodcastPlayer industry="formula-1" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Beyond The Grid", description: "F1's official podcast - long-form interviews with drivers, team principals and the people who make the sport.", url: "https://open.spotify.com/show/43mVBC14eBqaJiCjMyOMbA" },
            { title: "The Race F1 Podcast", description: "Daily news, analysis and debate from The Race's expert team.", url: "https://open.spotify.com/show/5MFbrBgqHSrdgGGkCWmjjy" },
            { title: "Autosport Podcast", description: "Autosport's paddock regulars on the biggest stories in F1 and motorsport.", url: "https://open.spotify.com/show/4tfDmrUE7Z0Xv5plWh20SS" },
            { title: "Bring Back V10s", description: "In-depth technical analysis of F1 engineering - aero, PU development and regulations.", url: "https://open.spotify.com/show/0SA6DLBB8bBSGWeGlXrxQW" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="formula-1" />
        <LiveArticles industry="formula-1" fallbackArticles={[
          { title: "How F1's Cost Cap Is Reshaping Team Operations", source: "The Race", url: "https://www.the-race.com/formula-1/" },
          { title: "Inside Cadillac's Build From Scratch: The Newest Team on the Grid", source: "Autosport", url: "https://www.autosport.com/f1/" },
          { title: "The Business of Being an F1 Engineer in Motorsport Valley", source: "Motorsport.com", url: "https://www.motorsport.com/f1/" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="formula-1" />
          <div className="mt-4"><BreakingNewsFeed industry="formula-1" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="formula-1" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["formula-1"] || []} /><div className="mt-12"><YouTubeChannels industry="formula-1" /><TikTokCreators industry="formula-1" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={formula1Companies} />
        <div className="mt-12"><DayInTheLife industry="formula-1" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From the factory floor to the pit wall, the wind tunnel to the boardroom - every role in F1." stages={formula1Stages} industry="formula-1" />
          <div className="mt-12"><IndustryRolesLink industry="Formula 1" /></div>
        <ExploreFurther links={[
          { title: "F1 Careers", description: "Official Formula 1 careers page - roles across the sport's London HQ.", url: "https://corp.formula1.com/careers/" },
          { title: "Motorsportjobs.com", description: "The dedicated F1 and motorsport jobs board - 200+ live roles.", url: "https://www.motorsportjobs.com/en/jobs/industry/formula-1-10611" },
          { title: "Motorsport UK Careers", description: "The UK governing body's guide to getting into motorsport.", url: "https://www.motorsportuk.org/get-started/" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Formula 1" searchQuery="formula 1 motorsport conference careers UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Formula 1" slug="formula-1" />
          <CoursesSection industry="formula-1" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Find Your Pole Position<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across UK Formula 1 teams - engineering, commercial, media and operations.</p>
          <Link to="/marketplace?industry=Formula+1#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={formula1Stages} industry="Formula 1" companies={formula1Companies} />
        <IndustryCVBuilder industry="Formula 1" stages={formula1Stages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Formula 1"
      description="Engineers, strategists, mechanics, commercial teams and the business behind the world's fastest sport."
      profile="Formula 1 is the pinnacle of motorsport - and it's headquartered in Britain. Seven of ten teams are based in the UK's 'Motorsport Valley', stretching from Woking to Milton Keynes. The industry supports thousands of engineering, commercial, media and operations jobs, from aerodynamicists in wind tunnels to hospitality coordinators at 24 Grand Prix weekends a year. With the 2026 regulation changes, a new Cadillac entry and a cost cap reshaping how teams operate, F1 has never offered more career pathways."
      industrySlug="formula-1"
      tabs={tabs}
    />
  );
};

export default Formula1;
