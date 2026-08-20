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
import { Sprout, Factory, Beer as BeerIcon, Truck, Store, Megaphone } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const beerStages: CareerStage[] = [
  { title: "Ingredients & Agriculture", icon: Sprout, roles: [
    { name: "Maltster", description: "Processes raw barley and other grains into malt, managing germination, kilning, and quality.", salary: "£25k–£35k" },
    { name: "Hop Buyer", description: "Sources hops from UK and international farms, negotiating contracts and assessing quality.", salary: "£28k–£45k" },
    { name: "Agricultural Scientist", description: "Researches barley and hop varieties for improved yield, flavour, and disease resistance.", salary: "£30k–£50k" },
    { name: "Supply Chain Coordinator", description: "Manages the logistics of raw ingredient sourcing from farm to brewery.", salary: "£26k–£40k" },
    { name: "Sustainability Manager", description: "Develops environmental and ethical sourcing programmes across the supply chain.", salary: "£32k–£55k" },
  ]},
  { title: "Brewing & Production", icon: Factory, roles: [
    { name: "Head Brewer", description: "Leads the brewing operation, developing recipes, managing production schedules, and maintaining quality.", salary: "£35k–£60k" },
    { name: "Assistant Brewer", description: "Supports the head brewer with day-to-day brewing, cleaning, and fermentation monitoring.", salary: "£25k–£32k" },
    { name: "Quality Assurance Manager", description: "Tests beer at every stage for consistency, flavour, and compliance with safety standards.", salary: "£30k–£48k" },
    { name: "Cellar Technician", description: "Manages fermentation, conditioning, and tank operations in the brewery cellar.", salary: "£25k–£30k" },
    { name: "Packaging Manager", description: "Oversees canning, bottling, and kegging lines, ensuring efficiency and quality.", salary: "£28k–£42k" },
    { name: "R&D / Innovation Brewer", description: "Creates new beer styles, experimental batches, and seasonal specials.", salary: "£28k–£45k" },
    { name: "Production Planner", description: "Schedules brewing runs, manages raw material orders, and coordinates output targets.", salary: "£26k–£40k" },
  ]},
  { title: "Taproom & Retail", icon: BeerIcon, roles: [
    { name: "Taproom Manager", description: "Runs the brewery's on-site bar, managing staff, events, and customer experience.", salary: "£26k–£38k" },
    { name: "Bar Manager", description: "Manages a pub or bar's daily operations, staff, stock, and service quality.", salary: "£25k–£36k" },
    { name: "Beer Sommelier / Cicerone", description: "Advises customers on beer styles, food pairings, and tasting experiences.", salary: "£25k–£38k" },
    { name: "Bartender", description: "Serves beer and other drinks, maintaining quality pours and customer engagement.", salary: "£25k–£28k" },
    { name: "Pub General Manager", description: "Runs a pub end-to-end - P&L, staff, compliance, and community engagement.", salary: "£30k–£45k" },
    { name: "Events Coordinator", description: "Plans and delivers tap takeovers, beer festivals, and brewery tours.", salary: "£25k–£36k" },
  ]},
  { title: "Distribution & Wholesale", icon: Truck, roles: [
    { name: "National Account Manager", description: "Manages relationships with major pub groups, supermarkets, and wholesale customers.", salary: "£35k–£60k" },
    { name: "Sales Representative", description: "Visits pubs, bars, and off-licences to sell and promote the brewery's range.", salary: "£25k–£38k" },
    { name: "Logistics Manager", description: "Coordinates delivery routes, fleet management, and warehouse operations.", salary: "£30k–£48k" },
    { name: "Export Manager", description: "Manages international distribution, navigating trade regulations and overseas partnerships.", salary: "£32k–£55k" },
    { name: "E-Commerce Manager", description: "Runs the online direct-to-consumer channel, managing subscriptions and digital sales.", salary: "£28k–£48k" },
    { name: "Trade Marketing Manager", description: "Develops point-of-sale materials, promotions, and activations for on-trade and off-trade.", salary: "£30k–£50k" },
  ]},
  { title: "Retail & Off-Trade", icon: Store, roles: [
    { name: "Buyer (Beer Category)", description: "Selects and negotiates the beer range for supermarkets, bottle shops, or online retailers.", salary: "£30k–£55k" },
    { name: "Category Manager", description: "Manages the commercial performance of the beer category across retail.", salary: "£35k–£60k" },
    { name: "Bottle Shop Owner", description: "Runs an independent craft beer shop, curating stock and building community.", salary: "£25k–£40k" },
    { name: "Visual Merchandiser", description: "Designs in-store displays and promotions for beer brands in retail environments.", salary: "£25k–£35k" },
  ]},
  { title: "Brand & Marketing", icon: Megaphone, roles: [
    { name: "Brand Manager", description: "Defines and executes brand positioning, campaigns, and identity for a beer brand.", salary: "£32k–£55k" },
    { name: "Social Media Manager", description: "Creates content and manages the brand's online community and engagement.", salary: "£26k–£42k" },
    { name: "Content Creator", description: "Produces photography, video, and written content to tell the brewery's story.", salary: "£25k–£40k" },
    { name: "PR & Communications Manager", description: "Manages press coverage, awards entries, and media relationships.", salary: "£30k–£50k" },
    { name: "Partnerships Manager", description: "Develops collaborations with food brands, festivals, and cultural partners.", salary: "£30k–£50k" },
    { name: "Taproom Experience Designer", description: "Designs the customer journey, merchandise, and brand touchpoints in brewery spaces.", salary: "£28k–£45k" },
  ]},
];

const newsfeed = [
  { title: "The Morning Advertiser", url: "https://www.morningadvertiser.co.uk" },
  { title: "The Brewers Journal", url: "https://www.brewersjournal.info" },
  { title: "Pellicle Magazine", url: "https://pelliclemag.com" },
];

const beerCompanies = [
  { name: "Fever-Tree", url: "https://fever-tree.com/en-gb/careers", founded: "2004", hq: "London", glassdoor: 4.0, overview: "The world's leading premium mixer brand — tonic, ginger beer, elderflower and more, in 85+ countries.", valueChainStage: "Distribution & Wholesale", profileUrl: "/company/fever-tree" },
  { name: "Hawkstone", url: "https://hawkstone.com", founded: "2021", hq: "Chipping Norton", overview: "Jeremy Clarkson's farm-born lager and cider - one of the UK's fastest-growing drinks brands.", valueChainStage: "Brewing & Production", profileUrl: "/company/hawkstone" },
  { name: "Northern Monk", url: "https://www.northernmonk.com", founded: "2013", hq: "Leeds", overview: "Independent craft brewery known for creative collaborations and a thriving taproom culture.", valueChainStage: "Brewing & Production" },
  { name: "BrewDog", url: "https://jobs.brewdog.com/", founded: "2007", hq: "Ellon, Aberdeenshire", glassdoor: 3.2, overview: "Scotland's punk craft brewery - IPAs, taprooms, and a hotel inside a brewery.", valueChainStage: "Brewing & Production" },
  { name: "Beavertown Brewery", url: "https://www.beavertownbrewery.co.uk", founded: "2011", hq: "London", overview: "Founded by Logan Plant, now owned by Heineken - bold artwork and bold beer.", valueChainStage: "Brewing & Production" },
  { name: "Camden Town Brewery", url: "https://www.camdentownbrewery.com", founded: "2010", hq: "London", overview: "London lager brewery, acquired by AB InBev in 2015.", valueChainStage: "Brewing & Production" },
  { name: "Cloudwater Brew Co", url: "https://cloudwaterbrew.co", founded: "2015", hq: "Manchester", overview: "One of the UK's most acclaimed craft breweries - modern styles, limited releases.", valueChainStage: "Brewing & Production" },
  { name: "Heineken UK", url: "https://www.theheinekencompany.com/our-company/uk", founded: "1864", hq: "Edinburgh", glassdoor: 3.8, overview: "The UK's largest pub company (Star Pubs) and brewer - Heineken, Birra Moretti, Beavertown.", valueChainStage: "Distribution & Wholesale" },
  { name: "Molson Coors UK", url: "https://www.molsoncoors.com/careers", founded: "2005", hq: "Burton upon Trent", glassdoor: 3.7, overview: "Major brewer - Carling, Coors, Doom Bar, Cobra, Aspall Cyder.", valueChainStage: "Distribution & Wholesale" },
  { name: "AB InBev UK", url: "https://www.ab-inbev.com/", founded: "2008", hq: "London", glassdoor: 3.8, overview: "The world's largest brewer - Budweiser, Stella Artois, Corona, Camden Town.", valueChainStage: "Distribution & Wholesale" },
  { name: "Fuller's", url: "https://careers.fullers.co.uk", founded: "1845", hq: "London", glassdoor: 3.5, overview: "Historic London brewer (now Asahi-owned) operating 400+ pubs across the south.", valueChainStage: "Taproom & Retail" },
  { name: "Marston's", url: "https://www.marstonspubs.co.uk/careers", founded: "1834", hq: "Wolverhampton", glassdoor: 3.3, overview: "One of the UK's largest pub operators with a deep brewing heritage.", valueChainStage: "Taproom & Retail" },
  { name: "JD Wetherspoon", url: "https://www.jdwetherspooncareers.com/", founded: "1979", hq: "Watford", glassdoor: 3.3, overview: "The UK's largest pub chain - 800+ pubs, known for value and heritage buildings.", valueChainStage: "Taproom & Retail" },
  { name: "Diageo (Guinness)", url: "https://www.diageo.com/en/careers", founded: "1997", hq: "London", glassdoor: 4.0, overview: "Global spirits giant and brewer of Guinness - the world's most iconic stout.", valueChainStage: "Brewing & Production" },
  { name: "Toast Ale", url: "https://www.toastale.com", founded: "2016", hq: "London", overview: "Award-winning B-Corp brewery making beer from surplus bread - sustainability-first.", valueChainStage: "Brewing & Production" },
];

const Beer = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind the pint.</p>
        <PodcastPlayer industry="beer" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "CAMRA Official", description: "The Campaign for Real Ale's video channel - pub culture, brewery features and the UK beer industry.", url: "https://www.youtube.com/@CAMRAOfficial" },
            { title: "The Craft Beer Channel", description: "Brewery tours, beer education, and interviews with brewers across the UK.", url: "https://www.youtube.com/@TheCraftBeerChannel" },
            { title: "Hop Forward", description: "Award-winning weekly podcast - interviews with brewers, pub owners and beer business founders.", url: "https://hopforward.beer/hop-forward-podcast/" },
            { title: "Beer Edge with John Holl & Andy Crouch", description: "A weekly dive into the business and culture of beer - interviews with industry leaders.", url: "https://www.beeredge.com/podcasts/the-beer-edge-podcast/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="beer" />
        <LiveArticles industry="beer" fallbackArticles={[
          { title: "UK Craft Beer Market Report 2026", source: "The Morning Advertiser", url: "https://www.morningadvertiser.co.uk" },
          { title: "How the UK Pub Industry Is Evolving", source: "The Morning Advertiser", url: "https://www.morningadvertiser.co.uk" },
          { title: "The Business of Brewing in Britain", source: "The Morning Advertiser", url: "https://www.morningadvertiser.co.uk" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="beer" />
          <div className="mt-4"><BreakingNewsFeed industry="beer" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="beer" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["beer"] || []} /><div className="mt-12"><YouTubeChannels industry="beer" /><TikTokCreators industry="beer" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={beerCompanies} />
        <div className="mt-12"><DayInTheLife industry="beer" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From grain to glass - the roles behind every pint, tap, and taproom." stages={beerStages} industry="beer" />
          <div className="mt-12"><IndustryRolesLink industry="Beer" /></div>
        <ExploreFurther links={[
          { title: "SIBA - Careers in Brewing", description: "The Society of Independent Brewers' resources on careers, apprenticeships, and training in the brewing industry.", url: "https://www.siba.co.uk" },
          { title: "British Beer & Pub Association", description: "The trade body representing UK brewers and pubs - industry data, careers, and workforce insights.", url: "https://beerandpub.com" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Beer" searchQuery="beer brewing craft beer" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Beer" slug="beer" />
          <CoursesSection industry="beer" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Jobs on tap today<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the beer industry.</p>
          <Link to="/marketplace?industry=Beer#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={beerStages} industry="Beer" companies={beerCompanies} />
        <IndustryCVBuilder industry="Beer" stages={beerStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Beer"
      description="Craft breweries, global giants, taprooms, and pubs - the people and business behind every pint."
      profile="The UK beer industry spans global brewing groups, independent craft breweries, pubs, taprooms, and the supply chains of malt, hops, and packaging that feed them. It supports around 600,000 jobs across production, hospitality, and retail, and contributes billions in tax revenue each year. Behind every pint sits a complex network of farmers, brewers, distributors, publicans, and marketers shaping one of Britain's most culturally embedded industries."
      tabs={tabs}
    />
  );
};

export default Beer;
