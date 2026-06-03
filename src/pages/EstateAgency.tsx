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
import { Lightbulb, Home, Users, Megaphone, FileText, Settings } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const estateAgencyStages: CareerStage[] = [
  { title: "Sales & Lettings", icon: Home, roles: [
    { name: "Sales Negotiator", description: "Entry-level role - handles viewings, enquiries, and offers between buyers and sellers.", salary: "£20k–£30k + commission" },
    { name: "Lettings Negotiator", description: "Entry-level role - markets rental properties, conducts viewings and matches tenants to landlords.", salary: "£20k–£28k + commission" },
    { name: "Senior Sales Negotiator", description: "Manages higher-value instructions and mentors junior negotiators.", salary: "£25k–£40k + commission" },
    { name: "Lettings Manager", description: "Runs the lettings department - landlord relationships, rent reviews, and team performance.", salary: "£30k–£45k + bonus" },
    { name: "New Homes Sales Consultant", description: "Sells properties on behalf of housebuilders and developers, often on-site.", salary: "£25k–£40k + commission" },
    { name: "Auction Specialist", description: "Manages property sales through auction.", salary: "£28k–£45k + commission" },
  ]},
  { title: "Valuation & Instruction", icon: Lightbulb, roles: [
    { name: "Valuer", description: "Assesses properties to determine accurate market value.", salary: "£25k–£40k" },
    { name: "Lister / Listing Agent", description: "Wins new instructions from homeowners looking to sell or let.", salary: "£22k–£45k + commission" },
    { name: "Branch Manager", description: "Runs an estate agency branch end-to-end - sales, lettings, and team.", salary: "£35k–£60k + bonus" },
    { name: "RICS Surveyor", description: "Conducts formal property surveys for buyers and lenders.", salary: "£30k–£55k" },
    { name: "Area Director", description: "Oversees multiple branches in a region.", salary: "£50k–£80k + bonus" },
  ]},
  { title: "Client Services", icon: Users, roles: [
    { name: "Property Manager", description: "Manages a portfolio of rental properties on behalf of landlords.", salary: "£24k–£35k" },
    { name: "Sales Progressor", description: "Chases solicitors and brokers to keep transactions moving to completion.", salary: "£22k–£32k" },
    { name: "Customer Service Coordinator", description: "Handles enquiries and schedules viewings.", salary: "£20k–£26k" },
    { name: "Relocation Consultant", description: "Supports corporate clients relocating staff to new cities.", salary: "£28k–£45k" },
    { name: "Tenancy Administrator", description: "Processes agreements, references, and deposits for new tenancies.", salary: "£20k–£26k" },
  ]},
  { title: "Marketing & PropTech", icon: Megaphone, roles: [
    { name: "Marketing Manager", description: "Plans campaigns and manages portal listings on Rightmove and Zoopla.", salary: "£30k–£50k" },
    { name: "Property Photographer", description: "Shoots professional property photography, floorplans and video tours.", salary: "£22k–£38k" },
    { name: "Social Media Manager", description: "Builds the agency's online presence and lead generation.", salary: "£24k–£38k" },
    { name: "PropTech Product Manager", description: "Develops digital tools for agents - CRMs, valuation platforms, virtual viewings.", salary: "£40k–£70k" },
    { name: "Content Writer / Copywriter", description: "Writes property descriptions, brochures and market reports.", salary: "£24k–£38k" },
    { name: "Data Analyst", description: "Analyses market data, lead conversion and branch performance.", salary: "£30k–£50k" },
  ]},
  { title: "Legal & Compliance", icon: FileText, roles: [
    { name: "Conveyancer", description: "Handles legal transfer of property ownership for buyers and sellers.", salary: "£25k–£45k" },
    { name: "Compliance Manager", description: "Ensures AML, GDPR, and lettings regulations are followed.", salary: "£30k–£50k" },
    { name: "Mortgage Adviser", description: "Advises buyers on mortgage products - often based in branch.", salary: "£28k–£55k + commission" },
    { name: "Financial Planner", description: "Provides broader financial advice to property clients.", salary: "£35k–£65k" },
    { name: "Leasehold Manager", description: "Manages service charges and leaseholder relations on blocks of flats.", salary: "£26k–£40k" },
  ]},
  { title: "Operations & Growth", icon: Settings, roles: [
    { name: "Operations Director", description: "Oversees systems, infrastructure and branch operations.", salary: "£55k–£90k" },
    { name: "Franchise Development Manager", description: "Recruits and supports new franchisees in networks like Belvoir or Winkworth.", salary: "£40k–£65k + bonus" },
    { name: "Training & Development Manager", description: "Designs and delivers training programmes for negotiators and managers.", salary: "£30k–£50k" },
    { name: "HR Manager", description: "Manages recruitment and retention across branches.", salary: "£30k–£50k" },
    { name: "Finance Director", description: "Manages financial planning and strategy.", salary: "£60k–£100k" },
    { name: "Land & New Homes Director", description: "Identifies land opportunities for development.", salary: "£50k–£85k + bonus" },
  ]},
];

const newsfeed = [
  { title: "Estate Agent Today", url: "https://www.estateagenttoday.co.uk" },
  { title: "The Negotiator", url: "https://www.thenegotiator.co.uk" },
  { title: "Property Industry Eye", url: "https://propertyindustryeye.com" },
];

const estateAgencyCompanies = [
  { name: "Connells Group", url: "https://www.connellsgroup.co.uk/careers", founded: "1936", hq: "Leighton Buzzard", glassdoor: 3.0, overview: "The UK's largest estate agency group - owns Connells, Hamptons, Countrywide, Bairstow Eves, William H Brown and many more.", valueChainStage: "Sales & Lettings" },
  { name: "Foxtons", url: "https://www.foxtons.co.uk/careers/", founded: "1981", hq: "London", glassdoor: 3.3, trustpilot: 3.6, overview: "London's most visible estate agency brand - strong sales and lettings footprint.", valueChainStage: "Sales & Lettings" },
  { name: "Hamptons", url: "https://www.hamptons.co.uk/careers/", founded: "1869", hq: "London", glassdoor: 3.4, overview: "Premium sales and lettings agent across London and the Home Counties - part of Connells Group.", valueChainStage: "Sales & Lettings" },
  { name: "Dexters", url: "https://www.dexters.co.uk/careers", founded: "1993", hq: "London", glassdoor: 3.6, overview: "London's largest independent estate agent - sales, lettings and property management across 70+ branches.", valueChainStage: "Sales & Lettings" },
  { name: "Chestertons", url: "https://www.chestertons.co.uk/careers/", founded: "1805", hq: "London", glassdoor: 3.3, overview: "Long-established London sales and lettings agency, also active in international property.", valueChainStage: "Sales & Lettings" },
  { name: "Winkworth", url: "https://www.winkworth.co.uk/careers", founded: "1835", hq: "London", glassdoor: 3.4, overview: "Franchise network of estate and letting agents across London and the UK.", valueChainStage: "Sales & Lettings" },
  { name: "Leaders Romans Group", url: "https://www.lrg.co.uk/careers/", founded: "1987", hq: "Worthing", glassdoor: 3.2, overview: "One of the UK's largest property services groups - sales, lettings, mortgages and surveying.", valueChainStage: "Sales & Lettings" },
  { name: "Spicerhaart", url: "https://www.spicerhaart.co.uk/careers", founded: "1989", hq: "Colchester", glassdoor: 3.0, overview: "Owner of haart, Felicity J Lord and Chewton Rose - one of the UK's largest independent agency groups.", valueChainStage: "Sales & Lettings" },
  { name: "Belvoir Group", url: "https://www.belvoirgroup.com/careers", founded: "1995", hq: "Grantham", glassdoor: 3.5, overview: "Multi-brand franchise network specialising in lettings - owns Belvoir, Northwood, Newton Fallowell and Mr & Mrs Clarke.", valueChainStage: "Sales & Lettings" },
  { name: "Knight Frank", url: "https://www.knightfrank.co.uk", founded: "1896", hq: "London", glassdoor: 3.7, trustpilot: 4.8, overview: "A partnership-owned global property consultancy - prime sales, lettings and advisory.", valueChainStage: "Sales & Lettings" },
  { name: "Savills", url: "https://www.savills.co.uk/careers/", founded: "1855", hq: "London", glassdoor: 3.8, trustpilot: 4.2, profileUrl: "/company/savills", overview: "A global real estate advisory firm - sales, lettings, valuation and commercial.", valueChainStage: "Sales & Lettings" },
  { name: "Purplebricks", url: "https://www.purplebricks.co.uk", founded: "2014", hq: "Solihull", glassdoor: 3.1, trustpilot: 3.9, profileUrl: "/company/purplebricks", overview: "The hybrid online agent that disrupted the market.", valueChainStage: "Sales & Lettings" },
  { name: "Rightmove", url: "https://boards.greenhouse.io/rightmovecareers", founded: "2000", hq: "Milton Keynes", glassdoor: 4.1, trustpilot: 3.5, profileUrl: "/company/rightmove", overview: "The UK's largest property portal.", valueChainStage: "Technology & Portals" },
  { name: "Zoopla", url: "https://apply.workable.com/zoopla/", founded: "2008", hq: "London", glassdoor: 3.6, overview: "The UK's second-largest property portal.", valueChainStage: "Technology & Portals" },
  { name: "My Home Move", url: "https://myhomemove.current-vacancies.com/", founded: "2001", hq: "Leicester", glassdoor: 3.2, overview: "The UK's largest conveyancing provider, handling over 100,000 transactions a year.", valueChainStage: "Conveyancing" },
  { name: "Simplify (Premier Property Lawyers)", url: "https://www.simplify.co.uk/careers/", founded: "2005", hq: "Manchester", glassdoor: 3.1, overview: "One of the UK's biggest conveyancing groups, including Premier Property Lawyers and DC Law.", valueChainStage: "Conveyancing" },
  { name: "O'Neill Patient", url: "https://www.oneillpatient.co.uk/careers", founded: "1960", hq: "Stoke-on-Trent", glassdoor: 3.4, overview: "Major volume conveyancing firm working with lenders and estate agents nationwide.", valueChainStage: "Conveyancing" },
  { name: "Slater and Gordon", url: "https://www.slatergordon.co.uk/careers/", founded: "1935", hq: "Manchester", glassdoor: 3.3, overview: "A leading consumer law firm with a large residential conveyancing practice.", valueChainStage: "Conveyancing" },
  { name: "JMW Solicitors", url: "https://www.jmw.co.uk/careers", founded: "2003", hq: "Manchester", glassdoor: 3.5, overview: "A full-service law firm with a specialist residential property and conveyancing team.", valueChainStage: "Conveyancing" },
  // ── Lettings specialists ─────────────────────────────────
  { name: "KFH (Kinleigh Folkard & Hayward)", url: "https://www.kfh.co.uk/about-us/careers", founded: "1976", hq: "London", glassdoor: 3.4, overview: "London's largest independent estate agent - sales, lettings, property management, financial services and surveying.", valueChainStage: "Sales & Lettings" },
  { name: "Marsh & Parsons", url: "https://www.marshandparsons.co.uk/careers", founded: "1856", hq: "London", glassdoor: 3.5, overview: "Prime central London sales and lettings agent with 30+ branches across the capital.", valueChainStage: "Sales & Lettings" },
  { name: "John D Wood & Co", url: "https://www.johndwood.co.uk/careers/", founded: "1872", hq: "London", glassdoor: 3.3, overview: "London and country sales, lettings and property management - part of Connells Group.", valueChainStage: "Sales & Lettings" },
  { name: "Andrews Property Group", url: "https://www.andrewsonline.co.uk/careers/", founded: "1946", hq: "Bristol", glassdoor: 3.2, overview: "Charity-owned residential sales and lettings agency across southern England.", valueChainStage: "Sales & Lettings" },
  { name: "Strutt & Parker", url: "https://www.struttandparker.com/careers", founded: "1885", hq: "London", glassdoor: 3.6, overview: "Prime country and London sales, lettings and rural advisory - part of BNP Paribas Real Estate.", valueChainStage: "Sales & Lettings" },
  { name: "Carter Jonas", url: "https://www.carterjonas.co.uk/about-us/careers", founded: "1855", hq: "London", glassdoor: 3.6, overview: "National property consultancy - residential sales and lettings, commercial, planning and rural.", valueChainStage: "Sales & Lettings" },
  { name: "Cluttons", url: "https://apply.workable.com/cluttons/", founded: "1765", hq: "London", glassdoor: 3.4, overview: "Independent property consultancy - residential and commercial sales, lettings, valuation and management.", valueChainStage: "Sales & Lettings" },
  { name: "Hunters", url: "https://www.hunters.com/careers/", founded: "1992", hq: "London", glassdoor: 3.3, overview: "National network of estate and letting agents - part of The Property Franchise Group.", valueChainStage: "Sales & Lettings" },
  { name: "Your Move", url: "https://www.your-move.co.uk/careers", founded: "1982", hq: "Newcastle", glassdoor: 3.1, overview: "One of the UK's largest estate and letting agency networks - part of LSL Property Services.", valueChainStage: "Sales & Lettings" },
  { name: "Reeds Rains", url: "https://www.reedsrains.co.uk/careers", founded: "1868", hq: "Manchester", glassdoor: 3.2, overview: "National estate and lettings agency with 150+ branches - part of LSL Property Services.", valueChainStage: "Sales & Lettings" },
  { name: "OpenRent", url: "https://apply.workable.com/openrent/", founded: "2012", hq: "London", glassdoor: 3.7, overview: "The UK's largest online letting agent - direct landlord-to-tenant platform with referencing, contracts and rent collection.", valueChainStage: "Technology & Portals" },
  { name: "Goodlord", url: "https://goodlord.pinpointhq.com/", founded: "2014", hq: "London", glassdoor: 4.0, overview: "Lettings software platform powering tenant referencing, e-signing, rent collection and onboarding for thousands of UK letting agents.", valueChainStage: "Technology & Portals" },
];

const EstateAgency = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<>
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
      <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the mechanics behind estate agencies, property portals, and the UK housing market.</p>
      <PodcastPlayer industry="estate-agency" />
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
          { title: "The Estate Agent Podcast", description: "Straight-talking advice for agents on listings, sales, and growing your business.", url: "https://www.estateagentpodcast.co.uk/" },
          { title: "Property Hub Podcast", description: "Rob & Rob's weekly take on the UK property market.", url: "https://www.propertyhub.net/podcast" },
          { title: "The Kerfuffle Podcast", description: "Tech, innovation, and the future of estate agency.", url: "https://www.kerfuffle.com" },
          { title: "Under the Hammer", description: "Stories and strategies from estate agents and property pros.", url: "https://www.estateagenttoday.co.uk" },
        ]} />
    </>) },
    { id: "read", label: "Read", content: (<>
      <DailyBriefing industry="estate-agency" />
      <LiveArticles industry="estate-agency" fallbackArticles={[
        { title: "UK Housing Market Outlook 2026", source: "Estate Agent Today", url: "https://www.estateagenttoday.co.uk" },
        { title: "How PropTech Is Transforming the High Street Agency", source: "The Negotiator", url: "https://www.thenegotiator.co.uk" },
        { title: "The Economics of Estate Agency", source: "Property Industry Eye", url: "https://propertyindustryeye.com" },
      ]} />
      <div className="mt-12"><NewsfeedModal sources={newsfeed} industry="estate agency" /><div className="mt-4"><BreakingNewsFeed industry="estate-agency" sources={newsfeed} /></div></div>
      <div className="mt-12"><SubstackNewsletters industry="estate-agency" /></div>
    </>) },
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["estate-agency"] || []} /><div className="mt-12"><YouTubeChannels industry="estate-agency" /><TikTokCreators industry="estate-agency" /></div></> },
    { id: "work", label: "Who?", content: (<><CompanyProfileGrid companies={estateAgencyCompanies} /><div className="mt-12"><DayInTheLife industry="estate-agency" /></div><div className="mt-12"><IndustryRolesLink industry="Estate Agency" /></div></>) },
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From valuation to completion - the roles behind every property transaction." stages={estateAgencyStages} industry="estate-agency" />
        <ExploreFurther links={[
          { title: "Propertymark - Careers", description: "The professional body for estate and letting agents - qualifications, regulation, and career development.", url: "https://www.propertymark.co.uk/careers-in-property/" },
          { title: "RICS - Surveying Careers", description: "The Royal Institution of Chartered Surveyors' guide to careers in property, construction, and land.", url: "https://www.rics.org/surveying-profession/pathways-into-surveying" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Estate Agency" searchQuery="property estate agency" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Estate Agency" slug="estate-agency" />
          <CoursesSection industry="estate agency" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (<>
      <div className="border border-border p-6 mb-12">
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Ready to make your next move<span className="text-primary">?</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the estate agency industry.</p>
        <Link to="/marketplace?industry=Estate Agency#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
      </div>
      <IndustryRolesShowcase stages={estateAgencyStages} industry="Estate Agency" companies={estateAgencyCompanies} />
        <IndustryCVBuilder industry="Estate Agency" stages={estateAgencyStages} />
    </>) },
  ];
  return <IndustryPageLayout name="Estate Agency" description="Sales, lettings, valuations, viewings and property management - the people behind every &quot;Sold&quot; and &quot;Let Agreed&quot; sign, and how the UK property industry really works." profile="The UK estate agency sector covers both residential sales and lettings - from valuing homes and winning instructions, to negotiating offers, managing tenancies and progressing transactions to completion. It employs roughly 150,000 to 200,000 people across high-street agencies, lettings specialists, online and hybrid models, property portals and conveyancing firms. Closely tied to housing cycles, interest rates and rental demand, it plays a central role in how people move, rent, invest and build wealth." tabs={tabs} />;
};

export default EstateAgency;
