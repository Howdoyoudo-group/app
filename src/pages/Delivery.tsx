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
import { Truck, Package, BarChart3, Route, Warehouse, Users } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";

const deliveryStages: CareerStage[] = [
  {
    title: "Last Mile & Courier",
    icon: Truck,
    roles: [
      { name: "Delivery Driver", description: "Collects and delivers parcels on a multi-drop route — often self-employed or employed by a carrier.", salary: "£25k–£32k" },
      { name: "HGV Driver", description: "Drives heavy goods vehicles on long-haul and regional trunking routes.", salary: "£32k–£50k" },
      { name: "LGV Driver", description: "Operates 7.5-tonne to 18-tonne vehicles on distribution and delivery routes.", salary: "£26k–£38k" },
      { name: "Courier Rider", description: "Delivers food, parcels, and documents by bicycle, motorcycle, or e-bike.", salary: "£25k–£30k" },
    ],
  },
  {
    title: "Warehouse & Fulfilment",
    icon: Warehouse,
    roles: [
      { name: "Warehouse Operative", description: "Picks, packs, and processes orders in a distribution centre or fulfilment hub.", salary: "£25k–£28k" },
      { name: "Forklift Operator", description: "Uses counterbalance, reach, or order picker trucks to move pallets and racking.", salary: "£25k–£32k" },
      { name: "Warehouse Supervisor", description: "Manages a shift team, overseeing productivity, safety, and order accuracy.", salary: "£26k–£36k" },
      { name: "Warehouse Manager", description: "Runs a warehouse operation — staffing, KPIs, health & safety, and throughput.", salary: "£35k–£55k" },
    ],
  },
  {
    title: "Operations & Logistics",
    icon: Route,
    roles: [
      { name: "Logistics Coordinator", description: "Plans and tracks shipments, managing carrier relationships and delivery schedules.", salary: "£25k–£38k" },
      { name: "Transport Planner", description: "Builds and optimises vehicle routes to maximise efficiency and on-time delivery.", salary: "£26k–£42k" },
      { name: "Fleet Manager", description: "Manages a vehicle fleet — maintenance, compliance, drivers, and costs.", salary: "£35k–£55k" },
      { name: "Operations Manager", description: "Oversees the full logistics operation — people, process, performance, and cost.", salary: "£40k–£70k" },
    ],
  },
  {
    title: "Data & Technology",
    icon: BarChart3,
    roles: [
      { name: "Route Optimisation Analyst", description: "Uses software and data to design delivery routes that reduce cost and emissions.", salary: "£28k–£45k" },
      { name: "Supply Chain Analyst", description: "Analyses stock, flow, and demand data to improve logistics performance.", salary: "£28k–£48k" },
      { name: "Last Mile Tech Product Manager", description: "Builds and improves the apps, platforms, and tracking systems used by carriers.", salary: "£45k–£80k" },
    ],
  },
  {
    title: "Customer & Account Management",
    icon: Package,
    roles: [
      { name: "Account Manager", description: "Manages relationships with business clients, resolving issues and growing revenue.", salary: "£28k–£45k" },
      { name: "Customer Experience Manager", description: "Leads the team handling delivery queries, complaints, and WISMO (Where Is My Order?).", salary: "£30k–£50k" },
    ],
  },
  {
    title: "Leadership & Strategy",
    icon: Users,
    roles: [
      { name: "Head of Logistics", description: "Sets the strategic direction for the logistics function across a business.", salary: "£65k–£110k" },
      { name: "Supply Chain Director", description: "Leads end-to-end supply chain from sourcing through to last mile.", salary: "£80k–£140k" },
    ],
  },
];

const newsfeed = [
  { title: "Logistics Manager", url: "https://www.logisticsmanager.com" },
  { title: "Motor Transport", url: "https://www.motortransport.co.uk" },
  { title: "The Grocer", url: "https://www.thegrocer.co.uk" },
];

const deliveryCompanies = [
  { name: "Amazon Logistics", founded: "2014 (UK)", hq: "London", overview: "Amazon's own delivery network, now covering around 70% of its UK parcels with a fleet of delivery partners and permanent drivers.", url: "https://www.amazon.jobs/en-gb", glassdoor: 3.1, valueChainStage: "Last Mile & Courier" },
  { name: "DHL Supply Chain", founded: "1969", hq: "Bonn (UK: Milton Keynes)", overview: "One of the world's largest logistics businesses — UK operations cover warehousing, contract logistics, and express parcel delivery.", url: "https://careers.dhl.com/gb/en", glassdoor: 3.6, valueChainStage: "Operations & Logistics" },
  { name: "DPD", founded: "1977", hq: "Smethwick", overview: "The UK's largest parcel delivery company by volume, operating a network of 10,000+ drivers and 60+ depots.", url: "https://jobs.dpd.co.uk", glassdoor: 3.3, valueChainStage: "Last Mile & Courier" },
  { name: "Evri", founded: "1974 (as Hermes)", hq: "Morley", overview: "The UK's second-largest parcel carrier, handling over 700 million parcels per year through a self-employed courier network.", url: "https://www.evri.com/about/careers", glassdoor: 2.9, valueChainStage: "Last Mile & Courier" },
  { name: "Gophr", founded: "2014", hq: "London", overview: "UK same-day courier platform connecting businesses to a network of cyclists, motorcyclists, and van drivers.", url: "https://uk.gophr.com/careers", valueChainStage: "Last Mile & Courier" },
  { name: "Ocado Logistics", founded: "2000", hq: "Hatfield", overview: "Runs one of the most automated grocery fulfilment operations in the world, with its own fleet of delivery vans and drivers.", url: "https://www.ocadogroup.com/careers", glassdoor: 3.4, profileUrl: "/company/ocado-logistics", valueChainStage: "Warehouse & Fulfilment" },
  { name: "Royal Mail", founded: "1516", hq: "London", overview: "Britain's national postal service, delivering to 32 million addresses every working day with 80,000+ posties and drivers.", url: "https://jobs.royalmail.com", glassdoor: 3.1, valueChainStage: "Last Mile & Courier" },
  { name: "XPO Logistics", founded: "2011", hq: "London (UK)", overview: "Global logistics provider specialising in heavy goods, freight brokerage, and last-mile delivery for UK retailers.", url: "https://jobs.xpo.com/gb/en", glassdoor: 3.2, valueChainStage: "Operations & Logistics" },
  { name: "Yodel", founded: "2010", hq: "Liverpool", overview: "Parcel carrier operating a network of service centres and self-employed couriers, focused on the retail sector.", url: "https://jobs.yodel.co.uk", glassdoor: 2.7, valueChainStage: "Last Mile & Courier" },
  { name: "Wincanton", founded: "1925", hq: "Chippenham", overview: "UK contract logistics specialist providing supply chain solutions for grocery, retail, defence, and construction.", url: "https://www.wincanton.co.uk/careers", glassdoor: 3.4, valueChainStage: "Operations & Logistics" },
  { name: "HIVED", founded: "2021", hq: "London", overview: "All-electric last-mile parcel delivery network for e-commerce brands - 100% electric fleet, ships for 100+ brands including Asos and Zara.", url: "https://www.hived.space/careers", valueChainStage: "Last Mile & Courier" },
  { name: "Relay", founded: "2022", hq: "London", overview: "AI-powered hyperlocal last-mile delivery network for e-commerce - routes parcels through a distributed network of high-street partner depots instead of a hub-and-spoke model.", url: "https://relaytech.co/careers", valueChainStage: "Last Mile & Courier" },
  { name: "AnyVan", founded: "2009", hq: "London", overview: "Online marketplace matching large-item deliveries, removals and vehicle transport to available capacity on transport providers' existing routes.", url: "https://www.anyvan.com/careers", valueChainStage: "Last Mile & Courier" },
];

const Delivery = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-6">Coming soon — episodes unpacking how the UK logistics and delivery industry really works.</p>
          <PodcastPlayer industry="delivery" />
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
          <PodcastGrid podcasts={[
            { title: "Supply Chain Now", description: "Weekly conversations with supply chain and logistics leaders on strategy, technology, and careers.", url: "https://open.spotify.com/show/65DDhOBrpKlEEHlbDMLG7j" },
            { title: "The Supply Chain Podcast", description: "Practical insights on freight, logistics, and supply chain — from warehouse floor to boardroom.", url: "https://open.spotify.com/show/6WRQ6O7W8xi94gYW8St5gy" },
            { title: "Parcel and Postal Technology International", description: "Industry news and leadership interviews from the parcel delivery world.", url: "https://www.parcelandpostaltechnologyinternational.com" },
            { title: "Leaders in Supply Chain & Logistics", description: "In-depth interviews with senior leaders on the trends, technology, and strategy shaping logistics.", url: "https://open.spotify.com/show/3rdqvzvAvXv0LxnR8c93AK" },
          ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="delivery" />
          <LiveArticles industry="delivery" fallbackArticles={[
            { title: "Royal Mail Modernisation: What It Means for 80,000 Posties", source: "Logistics Manager", url: "https://www.logisticsmanager.com" },
            { title: "Inside DPD's Plan to Build the UK's Greenest Fleet", source: "Motor Transport", url: "https://www.motortransport.co.uk" },
            { title: "Last Mile Delivery: Who Wins the Race to Your Door?", source: "Financial Times", url: "https://www.ft.com" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="delivery" />
            <div className="mt-4">
              <BreakingNewsFeed industry="delivery" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="delivery" />
          </div>
        </>
      ),
    },
    {
      id: "watch",
      label: "Watch",
      content: (
        <>
          <VideoShowcase heading="Unpacking on Screen" clips={industryVideos["delivery"] || []} />
          <div className="mt-12">
            <YouTubeChannels industry="delivery" />
            <TikTokCreators industry="delivery" />
          </div>
        </>
      ),
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={deliveryCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="delivery" />
          </div>
          
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From the depot to the data team — every role in the delivery and logistics industry." stages={deliveryStages} industry="delivery" />
          <div className="mt-12"><IndustryRolesLink industry="Delivery" /></div>
          <ExploreFurther links={[
            { title: "CILT — Chartered Institute of Logistics and Transport", description: "Professional body for logistics, supply chain, and transport — qualifications, events, and career support.", url: "https://www.ciltuk.org.uk/Careers/Career-Resources" },
            { title: "Road Haulage Association", description: "The UK trade body for road haulage — advice on HGV licensing, driver training, and industry news.", url: "https://www.rha.uk.net/membership/rha-membership/drivers" },
            { title: "UKWA — UK Warehousing Association", description: "Trade body for warehousing and logistics businesses — training, compliance, and industry resources.", url: "https://www.ukwa.org.uk" },
            { title: "Logistics UK", description: "The UK's largest logistics trade body, representing every part of the supply chain — policy, training, and jobs.", url: "https://logistics.org.uk/careers-in-logistics" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Delivery" searchQuery="logistics delivery supply chain events UK" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Delivery" slug="delivery" />
          <CoursesSection industry="delivery" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Live delivery jobs<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across courier, logistics, warehousing, and operations.</p>
            <Link to="/marketplace?industry=Delivery#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={deliveryStages} industry="Delivery" companies={deliveryCompanies} />
          <IndustryCVBuilder industry="Delivery" stages={deliveryStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Delivery"
      description="Couriers, HGV drivers, logistics coordinators, and the operations moving 5 billion parcels across the UK every year."
      profile="The UK delivery and logistics industry is the invisible backbone of the economy — getting goods from warehouses to doorsteps, keeping shelves stocked, and powering the £120 billion e-commerce market. It employs around 2.5 million people in roles ranging from parcel delivery drivers and warehouse operatives to data analysts and supply chain directors. With electrification, automation, and same-day delivery expectations all reshaping the sector, it's one of the fastest-changing industries in the UK."
      tabs={tabs}
    />
  );
};

export default Delivery;
