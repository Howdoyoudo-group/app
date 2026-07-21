import { industryVideos } from "@/data/industry-videos";
import VideoShowcase from "@/components/VideoShowcase";
import PodcastGrid from "@/components/PodcastGrid";
import ExploreFurther from "@/components/ExploreFurther";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { CompanyProfileGrid } from "@/components/CompanyProfileCard";
import coffeeInfographic from "@/assets/coffee-infographic.png";
import coffeeCareerMap from "@/assets/coffee-career-map.png";
import LiveArticles from "@/components/LiveArticles";
import DailyBriefing from "@/components/DailyBriefing";
import IndustryRolesLink from "@/components/IndustryRolesLink";
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
import { Sprout, Factory, Flame, Truck, Store, Coffee as CoffeeIcon } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";

const coffeeStages: CareerStage[] = [
  { title: "Farm & Origin", icon: Sprout, roles: [
    { name: "Coffee Farmer", description: "Grows and harvests coffee cherries, managing crop cycles, soil health, and processing at origin.", salary: "£20k–£35k" },
    { name: "Agronomist", description: "Advises farmers on plant science, pest management, and yield optimisation for coffee crops.", salary: "£28k–£45k" },
    { name: "Q Grader", description: "Certified coffee taster who evaluates and scores green and roasted coffee using SCA protocols.", salary: "£30k–£50k" },
    { name: "Origin Buyer", description: "Travels to producing countries to source green coffee, negotiating prices and building farmer relationships.", salary: "£32k–£55k" },
    { name: "Sustainability Manager", description: "Develops and oversees ethical sourcing, environmental, and social impact programmes across the supply chain.", salary: "£35k–£55k" },
    { name: "Cooperative Manager", description: "Runs a farmer cooperative, managing collective sales, quality control, and community development.", salary: "£25k–£40k" },
    { name: "Export Logistics", description: "Coordinates the shipping, documentation, and customs clearance of green coffee from origin to destination.", salary: "£26k–£42k" },
  ]},
  { title: "Processing", icon: Factory, roles: [
    { name: "Processing Manager", description: "Oversees wet or dry processing of coffee cherries, managing quality and throughput at the mill.", salary: "£28k–£45k" },
    { name: "Wet Mill Operator", description: "Operates washing stations where coffee cherries are pulped, fermented, and washed before drying.", salary: "£22k–£32k" },
    { name: "Dry Mill Operator", description: "Runs the dry mill where parchment coffee is hulled, sorted, and graded for export.", salary: "£22k–£32k" },
    { name: "Quality Controller", description: "Tests and grades green coffee samples for defects, moisture content, and cup quality.", salary: "£25k–£40k" },
    { name: "Green Coffee Trader", description: "Buys and sells green (unroasted) coffee on commodity or specialty markets, managing contracts and risk.", salary: "£35k–£70k" },
    { name: "Import Specialist", description: "Manages the import of green coffee into the UK, handling regulatory compliance and logistics.", salary: "£28k–£45k" },
{ name: "Import Specialist", description: "Manages the import of green coffee into the UK, handling regulatory compliance and logistics.", salary: "£28k–£45k" },
    { name: "Warehouse Manager", description: "Manages storage facilities for green coffee, controlling climate, inventory, and distribution.", salary: "£28k–£42k" },
  ]},
  { title: "Roasting", icon: Flame, roles: [
    { name: "Head Roaster", description: "Leads the roasting operation, developing profiles, managing production, and ensuring consistency.", salary: "£30k–£48k" },
    { name: "Production Roaster", description: "Operates roasting equipment on a daily basis, following profiles and monitoring batch quality.", salary: "£24k–£35k" },
    { name: "Sample Roaster", description: "Roasts small batches for quality evaluation and cupping, helping select and approve new lots.", salary: "£24k–£35k" },
    { name: "Quality Assurance", description: "Monitors and tests roasted coffee for consistency, freshness, and compliance with quality standards.", salary: "£26k–£40k" },
    { name: "Roastery Manager", description: "Runs the roastery's day-to-day operations including scheduling, staffing, and equipment maintenance.", salary: "£30k–£48k" },
    { name: "Packaging Technician", description: "Manages coffee packaging lines, ensuring proper sealing, labelling, and freshness preservation.", salary: "£22k–£30k" },
    { name: "R&D / Blend Developer", description: "Creates new blends and single-origin offerings, experimenting with profiles and flavour combinations.", salary: "£28k–£45k" },
  ]},
  { title: "Distribution", icon: Truck, roles: [
    { name: "Wholesale Manager", description: "Manages B2B sales to cafés, restaurants, and retailers, building long-term account relationships.", salary: "£30k–£50k" },
    { name: "Account Manager", description: "Maintains and grows relationships with existing wholesale customers, handling orders and support.", salary: "£26k–£42k" },
    { name: "Supply Chain Analyst", description: "Analyses demand, inventory, and logistics data to optimise coffee distribution efficiency.", salary: "£28k–£45k" },
    { name: "Logistics Coordinator", description: "Coordinates deliveries between roasteries, warehouses, and customers across the UK.", salary: "£24k–£35k" },
    { name: "E-Commerce Manager", description: "Runs the online direct-to-consumer channel, managing website, subscriptions, and digital sales.", salary: "£30k–£50k" },
    { name: "Brand Partnership Manager", description: "Develops co-branded products and partnerships with retailers, hospitality brands, and media.", salary: "£32k–£55k" },
  ]},
  { title: "Retail & Café", icon: Store, roles: [
    { name: "Café Manager", description: "Runs the daily operations of a coffee shop, managing staff, stock, and customer experience.", salary: "£26k–£38k" },
    { name: "Head Barista", description: "Leads the bar, trains junior baristas, and ensures drink quality and consistency.", salary: "£24k–£32k" },
    { name: "Barista Trainer", description: "Develops and delivers training programmes for baristas across multiple sites.", salary: "£26k–£38k" },
    { name: "Shift Supervisor", description: "Manages the café team during a shift, handling service, cash, and problem-solving.", salary: "£23k–£30k" },
    { name: "Operations Manager", description: "Oversees multiple café sites, standardising processes and driving performance.", salary: "£32k–£50k" },
    { name: "Area Manager", description: "Manages a cluster of cafés, responsible for P&L, staffing, and growth targets.", salary: "£35k–£55k" },
    { name: "Retail Buyer", description: "Selects and sources retail products like equipment, merchandise, and packaged goods for café shops.", salary: "£28k–£45k" },
  ]},
  { title: "Cup & Consumer", icon: CoffeeIcon, roles: [
    { name: "Brand Strategist", description: "Defines brand positioning, messaging, and identity to build a distinctive coffee brand.", salary: "£35k–£60k" },
    { name: "Content Creator", description: "Produces photography, video, and written content to tell the brand's story across channels.", salary: "£24k–£40k" },
    { name: "Social Media Manager", description: "Manages social media accounts, builds community, and drives engagement for the brand.", salary: "£26k–£42k" },
    { name: "Events Coordinator", description: "Plans and delivers tastings, pop-ups, latte art competitions, and brand events.", salary: "£24k–£36k" },
    { name: "Coffee Educator", description: "Teaches consumers and trade customers about coffee origins, brewing methods, and tasting.", salary: "£25k–£38k" },
    { name: "Subscription Manager", description: "Runs the coffee subscription programme, managing retention, logistics, and customer experience.", salary: "£28k–£45k" },
    { name: "Customer Experience Lead", description: "Designs and improves the end-to-end customer journey across retail and e-commerce channels.", salary: "£30k–£50k" },
  ]},
];

const newsfeed = [
  { title: "Sprudge", url: "https://sprudge.com" },
  { title: "Daily Coffee News", url: "https://dailycoffeenews.com" },
  { title: "Perfect Daily Grind", url: "https://perfectdailygrind.com" },
];

const coffeeCompanies = [
  { name: "Volcafe (ED&F Man)", url: "https://www.volcafe.com", founded: "1783", hq: "London", overview: "One of the world's largest green coffee trading companies, sourcing beans from 20+ origin countries and supplying roasters globally. The invisible link between farm and roastery.", valueChainStage: "Farm & Origin" },
  { name: "Square Mile Coffee", url: "https://shop.squaremilecoffee.com/pages/careers", founded: "2008", hq: "London", trustpilot: 4.6, overview: "Award-winning specialty roaster co-founded by a World Barista Champion.", valueChainStage: "Roasting" },
  { name: "Allpress Espresso", url: "https://uk.allpressespresso.com/careers/", founded: "1986", hq: "London / Auckland", glassdoor: 3.9, overview: "A specialty coffee roaster supplying cafés across London and beyond.", valueChainStage: "Roasting" },
  { name: "Grind", url: "https://grind.co.uk/pages/careers", founded: "2011", hq: "London", glassdoor: 3.6, trustpilot: 4.4, profileUrl: "/company/grind", overview: "A London coffee and cocktail brand with cafés, a roastery, and a fast-growing e-commerce business.", valueChainStage: "Retail & Café" },
  { name: "Costa Coffee", url: "https://www.costa.co.uk/careers", founded: "1971", hq: "Dunstable", glassdoor: 3.5, trustpilot: 1.8, profileUrl: "/company/costa", overview: "The UK's largest coffee chain with 2,800+ stores, owned by Coca-Cola.", valueChainStage: "Retail & Café" },
  { name: "Starbucks UK", url: "https://www.starbucksemeacareers.com/", founded: "1971", hq: "Seattle (UK: London)", glassdoor: 3.7, trustpilot: 1.5, profileUrl: "/company/starbucks", overview: "The world's largest coffeehouse chain with 1,000+ UK stores.", valueChainStage: "Retail & Café" },
  { name: "Caffè Nero", url: "https://www.caffenero.com/uk/careers/", founded: "1997", hq: "London", glassdoor: 3.4, trustpilot: 2.1, profileUrl: "/company/caffe-nero", overview: "A European-inspired coffee chain with 1,000+ stores globally.", valueChainStage: "Retail & Café" },
  { name: "Blank Street", url: "https://www.blankstreet.com/careers", founded: "2020", hq: "New York (UK: London)", profileUrl: "/company/blank-street", overview: "A VC-backed micro-café concept offering affordable specialty coffee from small-format kiosks.", valueChainStage: "Retail & Café" },
  { name: "Gail's", url: "https://jobs.gailsbread.co.uk", founded: "2005", hq: "London", glassdoor: 3.8, trustpilot: 2.3, profileUrl: "/company/gails", overview: "Neighbourhood bakery and coffee chain - sourdough, pastries, and a fast-growing café estate.", valueChainStage: "Retail & Café" },
  { name: "Gails", url: "https://jobs.gailsbread.co.uk", founded: "2005", hq: "London", glassdoor: 3.8, trustpilot: 2.3, profileUrl: "/company/gails", overview: "Alternate spelling of Gail's used by some hiring platforms - same neighbourhood bakery and coffee chain.", valueChainStage: "Retail & Café" },
];

const Coffee = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
           <div className="border border-border p-5 md:p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
              </div>
              <div>
                <h3 className="font-display font-700 text-foreground text-sm">The Brutal Economics of Your Flat White</h3>
                <p className="text-muted-foreground font-body text-xs">Episode - How Do You Do Coffee</p>
              </div>
            </div>
            <audio controls className="w-full h-10" preload="metadata">
              <source src="/audio/the-brutal-economics-of-your-flat-white.m4a" type="audio/mp4" />
            </audio>
          </div>

          <PodcastPlayer industry="coffee" />

          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
              { title: "Keys To The Shop", description: "Running a café, hiring, roasting, and the real business of specialty coffee.", url: "https://open.spotify.com/show/keys-to-the-shop" },
              { title: "Boss Barista", description: "Examining the coffee industry's labour practices, ethics, and culture.", url: "https://www.bossbarista.com" },
              { title: "Behind the Roast", description: "Inside stories from roasters, baristas, and café owners turning beans into brands.", url: "https://podcasts.apple.com/gb/podcast/behind-the-roast/id1871611598" },
              { title: "Actually Good Coffee Podcast", description: "How to start and grow a coffee empire - from one roaster's real journey.", url: "https://actuallygoodcoffeepodcast.podbean.com/" },
            ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="coffee" />
          <LiveArticles industry="coffee" fallbackArticles={[
            { title: "Will 2026 Be Different? Coffee Industry Challenges", source: "Perfect Daily Grind", url: "https://perfectdailygrind.com/2026/02/will-2026-be-different-coffee-industry-challenges/" },
            { title: "Biggest Challenges for the Specialty Coffee Industry in 2026", source: "Forest Coffee", url: "https://coffeegreenbeans.com/blogs/forest-blog/biggest-challenges-for-the-specialty-coffee-industry-in-2026" },
            { title: "What to Expect for The Coffee Market in 2026", source: "Coffee Trading Academy", url: "https://www.coffeetradingacademy.com/post/what-to-expect-for-the-coffee-market-in-2026" },
            { title: "Coffee Market Overview 2026 - Global Report", source: "Foodcom", url: "https://foodcom.pl/en/coffee-market-overview-2026-global-report/" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="coffee" />
            <div className="mt-4">
              <BreakingNewsFeed industry="coffee" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="coffee" />
          </div>
        </>
      ),
    },
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["coffee"] || []} /><div className="mt-12"><YouTubeChannels industry="coffee" /><TikTokCreators industry="coffee" /></div></>,
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={coffeeCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="coffee" />
          </div>
          <div className="mt-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2>
            <img src={coffeeInfographic} alt="The Business of Beans infographic" className="w-full rounded-sm" />
            <img src={coffeeCareerMap} alt="The Coffee Value Chain infographic" className="w-full rounded-sm mt-6" loading="lazy" />
          </div>
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From farm to cup - the roles that power every stage of the coffee value chain." stages={coffeeStages} industry="coffee" />
          <div className="mt-12">
            <IndustryRolesLink industry="Coffee" />
          </div>
          <ExploreFurther links={[
            { title: "SCA - Specialty Coffee Association", description: "The global trade body for specialty coffee - training, certifications, and career development.", url: "https://sca.coffee/education" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Coffee" searchQuery="coffee industry" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Coffee" slug="coffee" />
          <CoursesSection industry="coffee" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">What's brewing today<span className="text-primary">?</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the coffee industry.</p>
            <Link to="/marketplace?industry=Coffee#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={coffeeStages} industry="Coffee" companies={coffeeCompanies} />
        <IndustryCVBuilder industry="Coffee" stages={coffeeStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Coffee"
      description="Cult brands, bean traders, and the $500 billion industry in your morning cup."
      profile="The coffee industry stretches from global commodity trading and sourcing to local cafés and independent roasters. In the UK, it supports around 200,000 to 250,000 jobs, largely concentrated in hospitality and retail. What appears to be a simple daily ritual is powered by international supply chains, branding, and intense competition for consumer loyalty."
      tabs={tabs}
    />
  );
};

export default Coffee;
