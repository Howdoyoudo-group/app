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
import { Tractor, Sprout, Beef, Truck, Cpu, Briefcase } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const farmingStages: CareerStage[] = [
  { title: "Crops & Arable", icon: Sprout, roles: [
    { name: "Arable Farm Manager", description: "Runs the day-to-day operation of a cereals, oilseed or root-crop farm - agronomy, machinery, harvest planning.", salary: "£35k–£55k" },
    { name: "Agronomist", description: "Advises growers on crop nutrition, protection, soil health and yield strategy across the season.", salary: "£28k–£50k" },
    { name: "Combine Driver / Harvest Operator", description: "Skilled operator running combines, balers and tractors through the seasonal harvest.", salary: "£25k–£40k" },
    { name: "Soil Scientist", description: "Analyses soil structure, nutrients and biology to improve regenerative farming outcomes.", salary: "£28k–£45k" },
  ]},
  { title: "Livestock & Dairy", icon: Beef, roles: [
    { name: "Herd Manager", description: "Leads a dairy or beef herd - feeding, breeding, health, milk yield and welfare standards.", salary: "£28k–£45k" },
    { name: "Stockperson", description: "Hands-on care of cattle, sheep or pigs - feeding, monitoring health and assisting with breeding.", salary: "£22k–£32k" },
    { name: "Dairy Farm Manager", description: "Runs a commercial dairy operation - parlour, pasture, staff and milk contracts.", salary: "£35k–£55k" },
    { name: "Shepherd", description: "Manages flocks across UK upland and lowland farms - lambing, shearing, grazing rotation.", salary: "£24k–£36k" },
    { name: "Poultry Manager", description: "Oversees broiler, layer or free-range egg production - biosecurity, feed, welfare.", salary: "£28k–£42k" },
  ]},
  { title: "Horticulture & Produce", icon: Sprout, roles: [
    { name: "Horticulturist", description: "Grows fruit, veg, salad or ornamentals at scale - protected cropping, plant health, picking schedules.", salary: "£24k–£38k" },
    { name: "Glasshouse Manager", description: "Runs a commercial glasshouse - climate control, irrigation, IPM and labour planning.", salary: "£32k–£48k" },
    { name: "Soft Fruit Grower", description: "Specialist in strawberries, raspberries and berries for UK supermarkets and direct sales.", salary: "£28k–£42k" },
    { name: "Nursery Manager", description: "Oversees a plant or tree nursery - propagation, sales, retail and trade customers.", salary: "£26k–£40k" },
  ]},
  { title: "AgriTech & Machinery", icon: Cpu, roles: [
    { name: "Precision Ag Specialist", description: "Implements GPS, drones, satellite and farm-management software to drive yield and sustainability.", salary: "£30k–£50k" },
    { name: "Agricultural Engineer", description: "Designs, services and repairs tractors, combines and farm machinery - dealerships and OEMs.", salary: "£28k–£45k" },
    { name: "AgriTech Product Manager", description: "Builds software and hardware for farms - sensors, robotics, livestock tracking and farm OS.", salary: "£45k–£75k" },
    { name: "Drone & Data Analyst", description: "Captures and analyses aerial imagery to map crop health, weeds and yield variability.", salary: "£28k–£42k" },
  ]},
  { title: "Supply Chain & Trading", icon: Truck, roles: [
    { name: "Grain Trader", description: "Buys and sells grain on behalf of merchants, mills or co-ops - managing risk and contracts.", salary: "£35k–£70k" },
    { name: "Livestock Auctioneer", description: "Runs livestock markets across the UK - pricing, bidding and farmer relationships.", salary: "£28k–£50k" },
    { name: "Farm Sales Rep", description: "Sells feed, seed, fertiliser, machinery or vet products into UK farms.", salary: "£28k–£48k" },
    { name: "Logistics Coordinator", description: "Plans haulage and cold chain from farm to processor, packer or supermarket DC.", salary: "£26k–£40k" },
  ]},
  { title: "Business & Estate", icon: Briefcase, roles: [
    { name: "Estate Manager", description: "Runs the commercial side of a rural estate - tenancies, diversification, forestry, events.", salary: "£40k–£70k" },
    { name: "Farm Business Consultant", description: "Advises farmers on profitability, succession, grants (ELMS, SFI) and diversification.", salary: "£35k–£60k" },
    { name: "Rural Surveyor", description: "RICS-qualified specialist in farmland valuation, planning and land agency.", salary: "£32k–£55k" },
    { name: "Sustainability Lead", description: "Drives carbon, biodiversity and regenerative practice across a farm or food supply chain.", salary: "£35k–£60k" },
    { name: "Farm Shop Manager", description: "Runs the retail and café side of farm-to-fork businesses - buying, staff and customer experience.", salary: "£26k–£38k" },
  ]},
];

const newsfeed = [
  { title: "Farmers Weekly", url: "https://www.fwi.co.uk" },
  { title: "Farmers Guardian", url: "https://www.farmersguardian.com" },
  { title: "AHDB", url: "https://ahdb.org.uk" },
  { title: "NFU", url: "https://www.nfuonline.com" },
];

const farmingCompanies = [
  { name: "AHDB (Agriculture & Horticulture Development Board)", url: "https://ahdb.org.uk/careers", founded: "2008", hq: "Stoneleigh", overview: "The UK's levy-funded body for cereals, dairy, beef, lamb, pork and horticulture - research, market intel and exports.", valueChainStage: "Business & Estate" },
  { name: "NFU (National Farmers' Union)", url: "https://www.nfuonline.com/about-us/work-for-us", founded: "1908", hq: "Stoneleigh", overview: "The voice of British farming - policy, lobbying and member services for over 46,000 UK farmers.", valueChainStage: "Business & Estate" },
  { name: "Arla Foods UK", url: "https://www.arlafoods.co.uk/careers", founded: "2000", hq: "Leeds", overview: "Farmer-owned dairy co-op behind Cravendale, Anchor and Lurpak - 2,000+ UK farmer members.", valueChainStage: "Livestock & Dairy" },
  { name: "Müller UK", url: "https://www.muller.co.uk/careers", founded: "1896", hq: "Market Drayton", overview: "The UK's largest fresh dairy company - yogurts, milk and own-label desserts.", valueChainStage: "Livestock & Dairy" },
  { name: "G's Fresh", url: "https://www.gs-fresh.com/careers", founded: "1952", hq: "Ely, Cambridgeshire", overview: "One of Europe's leading growers of salad, celery and onions - supplies most UK supermarkets.", valueChainStage: "Horticulture & Produce" },
  { name: "Berry Gardens", url: "https://www.berrygardens.co.uk", founded: "1972", hq: "Tonbridge", overview: "The UK's largest soft and stone fruit cooperative - strawberries, raspberries, cherries.", valueChainStage: "Horticulture & Produce" },
  { name: "Velcourt", url: "https://www.velcourt.co.uk/careers", founded: "1969", hq: "Cirencester", overview: "The UK's largest farm management company - manages 55,000+ hectares for landowners.", valueChainStage: "Crops & Arable" },
  { name: "Frontier Agriculture", url: "https://www.frontierag.co.uk/careers", founded: "2005", hq: "Witham St Hughs", overview: "The UK's leading crop production and grain marketing business - agronomy, seeds, fertiliser, trading.", valueChainStage: "Supply Chain & Trading" },
  { name: "Openfield", url: "https://www.openfield.co.uk/careers", founded: "2008", hq: "Lincoln", overview: "Britain's only national farmer-owned grain marketing and arable inputs co-op.", valueChainStage: "Supply Chain & Trading" },
  { name: "John Deere UK", url: "https://careers.deere.com", founded: "1837", hq: "Langar (UK)", overview: "The world's largest farm machinery manufacturer - tractors, combines, precision ag.", valueChainStage: "AgriTech & Machinery" },
  { name: "AGCO (Massey Ferguson)", url: "https://careers.agcocorp.com", founded: "1990", hq: "Stoneleigh (UK)", overview: "Global ag equipment maker - Massey Ferguson, Fendt, Valtra brands across UK farms.", valueChainStage: "AgriTech & Machinery" },
  { name: "Small Robot Company", url: "https://www.smallrobotcompany.com/careers", founded: "2017", hq: "Salisbury", overview: "British AgriTech startup building autonomous farm robots for arable crops.", valueChainStage: "AgriTech & Machinery" },
  { name: "Riverford Organic Farmers", url: "https://www.riverford.co.uk/jobs", founded: "1986", hq: "Devon", overview: "Employee-owned organic veg box delivery - farmer-direct, ethical food at scale.", valueChainStage: "Business & Estate" },
  { name: "LEAF (Linking Environment And Farming)", url: "https://leaf.eco/about/careers", founded: "1991", hq: "Stoneleigh", overview: "Charity promoting sustainable farming through Integrated Farm Management and LEAF Marque.", valueChainStage: "Business & Estate" },
  { name: "Soil Association", url: "https://www.soilassociation.org/about-us/jobs/", founded: "1946", hq: "Bristol", overview: "Charity & certifier behind the UK's leading organic standard - farming, food and forestry.", valueChainStage: "Business & Estate" },
  { name: "ABP UK", url: "https://www.abpfoodgroup.com/careers/", founded: "1954", hq: "Shrewsbury", overview: "One of the UK's largest beef and lamb processors - supplies major retailers and foodservice.", valueChainStage: "Livestock & Dairy" },
];

const Farming = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind British farming.</p>
        <PodcastPlayer industry="farming" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Farmers Weekly Podcast", description: "The UK's leading farming weekly brings news, analysis and farmer interviews from across the country.", url: "https://www.fwi.co.uk/podcasts" },
            { title: "Rock & Roll Farming", description: "Farmer Will Evans interviews farmers, growers and agri-food legends about life on the land.", url: "https://open.spotify.com/show/0TQEf2pkgJTdUVF7DOA9d6" },
            { title: "Farm Gate", description: "Farmwel's podcast on regenerative agriculture, food systems and rural policy in the UK.", url: "https://farmwel.org.uk/podcast/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="farming" />
        <LiveArticles industry="farming" fallbackArticles={[
          { title: "UK Farming Faces Biggest Policy Shake-Up in 50 Years", source: "Farmers Weekly", url: "https://www.fwi.co.uk" },
          { title: "Regenerative Agriculture Goes Mainstream in Britain", source: "Farmers Guardian", url: "https://www.farmersguardian.com" },
          { title: "Sustainable Farming Incentive: What Farmers Need to Know", source: "AHDB", url: "https://ahdb.org.uk" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="farming" />
          <div className="mt-4"><BreakingNewsFeed industry="farming" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="farming" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["farming"] || []} /><div className="mt-12"><YouTubeChannels industry="farming" /><TikTokCreators industry="farming" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={farmingCompanies} />
        <div className="mt-12"><DayInTheLife industry="farming" /></div>
        <div className="mt-12"><IndustryRolesLink industry="Farming" /></div>
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From the farm gate to AgriTech and rural business - every role in British farming." stages={farmingStages} industry="farming" />
        <ExploreFurther links={[
          { title: "Institute of Agricultural Management", description: "Professional body for farm managers and rural business leaders - qualifications, events, networking.", url: "https://www.iagrm.com" },
          { title: "LANTRA - Land-Based Careers", description: "The skills body for the UK's land-based and environmental sector - courses, apprenticeships, careers.", url: "https://www.lantra.co.uk" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Farming" searchQuery="farming agriculture conference UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Farming" slug="farming" />
          <CoursesSection industry="farming" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">The best of the crop<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across UK farming and agriculture.</p>
          <Link to="/marketplace?industry=Farming#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={farmingStages} industry="Farming" companies={farmingCompanies} />
        <IndustryCVBuilder industry="Farming" stages={farmingStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Farming"
      description="From the farm gate to AgriTech - the people, businesses and policy shaping how Britain feeds itself."
      profile="UK farming covers 70% of Britain's land and contributes £13 billion to the economy each year. From arable estates and dairy herds to soft-fruit growers, regenerative pioneers and AgriTech startups, the sector spans craft and code. Major employers like Arla, Müller, Frontier, Velcourt and the AHDB sit alongside thousands of family farms and a fast-moving wave of robotics, satellite ag and sustainable food businesses."
      tabs={tabs}
    />
  );
};

export default Farming;
