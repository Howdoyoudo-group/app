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
import { Zap, Droplets, Flame, Monitor, Wrench, Users } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";

const fixingStages: CareerStage[] = [
  {
    title: "Electrical",
    icon: Zap,
    roles: [
      { name: "Electrician", description: "Installs, tests, and maintains electrical systems in homes and commercial buildings.", salary: "£28k–£50k" },
      { name: "Electrical Engineer", description: "Designs and oversees larger-scale electrical installations for commercial and industrial projects.", salary: "£35k–£65k" },
      { name: "Solar Panel Installer", description: "Installs photovoltaic systems for domestic and commercial properties.", salary: "£28k–£45k" },
      { name: "EV Charger Installer", description: "Installs home and commercial electric vehicle charging points.", salary: "£28k–£45k" },
    ],
  },
  {
    title: "Plumbing & Heating",
    icon: Droplets,
    roles: [
      { name: "Plumber", description: "Installs and repairs water, drainage, and heating pipework in homes and businesses.", salary: "£26k–£50k" },
      { name: "Heating Engineer", description: "Services, installs, and repairs central heating systems and boilers.", salary: "£28k–£52k" },
      { name: "Gas Engineer", description: "Inspects, installs, and maintains gas appliances and pipework. Gas Safe registered.", salary: "£30k–£55k" },
      { name: "Heat Pump Engineer", description: "Installs and services air source and ground source heat pump systems.", salary: "£30k–£55k" },
      { name: "HVAC Engineer", description: "Installs and maintains heating, ventilation, and air conditioning systems in commercial buildings.", salary: "£30k–£58k" },
    ],
  },
  {
    title: "Appliance & Device Repair",
    icon: Flame,
    roles: [
      { name: "Appliance Repair Technician", description: "Diagnoses and repairs domestic white goods — washing machines, dishwashers, ovens.", salary: "£25k–£40k" },
      { name: "Mobile Phone Repair Technician", description: "Fixes screens, batteries, and hardware faults on smartphones and tablets.", salary: "£25k–£35k" },
      { name: "Electronics Repair Technician", description: "Repairs consumer electronics — TVs, laptops, audio equipment.", salary: "£25k–£38k" },
    ],
  },
  {
    title: "IT & Tech Support",
    icon: Monitor,
    roles: [
      { name: "IT Support Technician", description: "Troubleshoots hardware, software, and network issues for businesses and end users.", salary: "£25k–£40k" },
      { name: "Field Engineer", description: "Travels to client sites to install, configure, and fix IT infrastructure.", salary: "£28k–£48k" },
      { name: "Network Engineer", description: "Designs and maintains computer networks for organisations.", salary: "£32k–£60k" },
    ],
  },
  {
    title: "Building Maintenance",
    icon: Wrench,
    roles: [
      { name: "Maintenance Technician", description: "Handles day-to-day repairs and upkeep in residential or commercial buildings.", salary: "£25k–£38k" },
      { name: "Facilities Manager", description: "Oversees all maintenance, compliance, and operational services in a building or estate.", salary: "£35k–£65k" },
      { name: "Multi-Trade Engineer", description: "Skilled across plumbing, electrics, and carpentry — handles a wide range of repair jobs.", salary: "£28k–£48k" },
      { name: "Handyperson", description: "General maintenance and repair across a range of trades for domestic clients.", salary: "£25k–£40k" },
    ],
  },
  {
    title: "Management & Training",
    icon: Users,
    roles: [
      { name: "Training Manager", description: "Runs apprenticeship and upskilling programmes for trades businesses.", salary: "£35k–£55k" },
      { name: "Operations Manager", description: "Coordinates engineers, scheduling, and customer service for a trades business.", salary: "£40k–£65k" },
      { name: "Business Owner", description: "Runs their own trades company — everything from quotes to VAT returns.", salary: "Varies widely" },
    ],
  },
];

const newsfeed = [
  { title: "Electrical Times", url: "https://www.electricaltimes.co.uk" },
  { title: "Plumbing & Heating Engineer", url: "https://www.pheonline.co.uk" },
  { title: "Facilities Management Journal", url: "https://www.fmj.co.uk" },
];

const fixingCompanies = [
  { name: "British Gas (Centrica)", founded: "1812", hq: "Windsor", overview: "The UK's largest energy supplier and home services company — employs over 5,000 engineers for heating, electrical, and appliance care.", url: "https://www.centrica.com/people-careers/", glassdoor: 3.5, valueChainStage: "Plumbing & Heating" },
  { name: "Dyno-Rod", founded: "1963", hq: "Staines", overview: "Britain's best-known drain unblocking and plumbing service, operating a national franchise network.", url: "https://www.dyno.com/careers", valueChainStage: "Plumbing & Heating" },
  { name: "HomeServe", founded: "1993", hq: "Walsall", overview: "Home repair and improvement service covering plumbing, electrical, and appliance breakdowns.", url: "https://homeserve.com/uk/careers-hub", glassdoor: 3.6, valueChainStage: "Building Maintenance" },
  { name: "iSmash", founded: "2013", hq: "London", overview: "Fast-growing tech repair brand with over 50 UK stores fixing phones, tablets, and laptops.", url: "https://www.ismash.co.uk/careers", valueChainStage: "Appliance & Device Repair" },
  { name: "Mitie", founded: "1987", hq: "London", overview: "The UK's largest facilities management company, employing engineers and technicians across thousands of client sites.", url: "https://www.mitie.com/careers", glassdoor: 3.3, valueChainStage: "Building Maintenance" },
  { name: "Pimlico Plumbers", founded: "1979", hq: "London", overview: "London's largest independent plumbing and heating business, known for fast-response domestic repairs.", url: "https://www.pimlicoplumbers.com/careers", trustpilot: 4.5, valueChainStage: "Plumbing & Heating" },
  { name: "Octopus Energy", founded: "2015", hq: "London", overview: "Fast-growing energy supplier expanding into heat pump installation and smart home energy management.", url: "https://octopus.energy/careers/", glassdoor: 4.3, valueChainStage: "Plumbing & Heating" },
  { name: "KCOM", founded: "1904", hq: "Hull", overview: "Telecoms and IT services business employing field engineers and network technicians across the UK.", url: "https://www.kcom.com/careers", glassdoor: 3.7, valueChainStage: "IT & Tech Support" },
  { name: "Geek Squad (Currys)", founded: "1994 (US)", hq: "London", overview: "Currys' tech support service offering in-store, home, and remote repair for consumer electronics.", url: "https://www.currys.co.uk/careers", glassdoor: 3.4, valueChainStage: "Appliance & Device Repair" },
  { name: "Uswitch / Go.Compare", founded: "2000/2006", hq: "London", overview: "Comparison platforms that drive large volumes of trade enquiries to independent plumbers, electricians, and gas engineers.", url: "https://www.zoopla.co.uk/careers", valueChainStage: "Management & Training" },
  { name: "Checkatrade", founded: "1998", hq: "Portsmouth", overview: "The UK's largest vetted-tradesperson marketplace, connecting homeowners with approved local builders, plumbers and electricians for home improvement work.", url: "https://www.checkatrade.com/careers", valueChainStage: "Management & Training" },
  { name: "Elyos AI", founded: "2023", hq: "London", overview: "AI voice and chat agents that automate customer service, scheduling and sales follow-up for trades and field-service businesses - plumbing, heating and electrical.", url: "https://elyos.ai/careers", valueChainStage: "IT & Tech Support" },
];

const Fixing = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-6">Coming soon — episodes exploring the skilled trades keeping Britain running.</p>
          <PodcastPlayer industry="fixing" />
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
          <PodcastGrid podcasts={[
            { title: "Sparky's Life", description: "Electricians helping electricians — interviews, trade talk, and life as a sparky in the UK.", url: "https://open.spotify.com/show/4VobsrkSDpqkhwFfOeCT01" },
            { title: "The Heating & Plumbing Show", description: "Weekly conversations from the world of plumbing — stories, tips, and interviews with top plumbers.", url: "https://open.spotify.com/show/6bPDY3SoLV5AL7QImScwWM" },
            { title: "Trades Talk", description: "Conversations with successful trade business owners — growth strategies, marketing, and the realities of running a trades company.", url: "https://open.spotify.com/show/2nBFRHDNzlakKban657sbB" },
            { title: "The Facilities Management Exchange", description: "In-depth conversations with FM and property management leaders on the issues shaping the industry.", url: "https://open.spotify.com/show/22Bz43zoDk5d5DSMkUJajA" },
          ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="fixing" />
          <LiveArticles industry="fixing" fallbackArticles={[
            { title: "The UK Trades Skills Shortage: What's Being Done", source: "Electrical Times", url: "https://www.electricaltimes.co.uk" },
            { title: "Heat Pump Installers: The New Growth Career in Trades", source: "Plumbing & Heating Engineer", url: "https://www.pheonline.co.uk" },
            { title: "Apprenticeship Starts in Electrical and Plumbing: 2024 Update", source: "CITB", url: "https://www.citb.co.uk" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="fixing" />
            <div className="mt-4">
              <BreakingNewsFeed industry="fixing" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="fixing" />
          </div>
        </>
      ),
    },
    {
      id: "watch",
      label: "Watch",
      content: (
        <>
          <VideoShowcase heading="Unpacking on Screen" clips={industryVideos["fixing"] || []} />
          <div className="mt-12">
            <YouTubeChannels industry="fixing" />
            <TikTokCreators industry="fixing" />
          </div>
        </>
      ),
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={fixingCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="fixing" />
          </div>
          
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From first call-out to running your own business — every role in the fixing industry." stages={fixingStages} industry="fixing" />
          <div className="mt-12"><IndustryRolesLink industry="Fixing" /></div>
          <ExploreFurther links={[
            { title: "JIB — Joint Industry Board (Electrical)", description: "The industry body for electricians — grading, pay scales, training, and apprenticeships.", url: "https://www.jib.org.uk/career-information/" },
            { title: "Gas Safe Register", description: "The official gas registration body — essential for anyone working with gas appliances in the UK.", url: "https://www.gassaferegister.co.uk/about-gas-safe-register/careers-in-gas/" },
            { title: "CIPHE — Institute of Plumbing and Heating Engineering", description: "Professional membership and career resources for plumbers and heating engineers.", url: "https://www.ciphe.org.uk/careers" },
            { title: "IWFM — Institute of Workplace and Facilities Management", description: "Professional body for facilities management — courses, events, and career pathways.", url: "https://www.iwfm.org.uk/careers-in-fm" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Fixing" searchQuery="trades industry events UK electrician plumber" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Fixing" slug="fixing" />
          <CoursesSection industry="fixing" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Live trades jobs<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across electricians, plumbers, gas engineers, and maintenance.</p>
            <Link to="/marketplace?industry=Fixing#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={fixingStages} industry="Fixing" companies={fixingCompanies} />
          <IndustryCVBuilder industry="Fixing" stages={fixingStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Fixing"
      description="Electricians, plumbers, gas engineers, and the skilled trades keeping Britain's homes and businesses running."
      profile="The UK trades and fixing industry employs over 3 million people across electrical work, plumbing, heating, appliance repair, and facilities management. It's one of the most in-demand sectors in the country — a skills shortage means qualified tradespeople can earn well above average wages, set their own hours, and often run their own businesses. With the green energy transition accelerating demand for heat pump and EV charger installers, the sector is evolving fast."
      tabs={tabs}
    />
  );
};

export default Fixing;
