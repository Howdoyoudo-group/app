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
import { Sprout, Factory, Warehouse, BarChart3, Store, ShoppingCart } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import ocadoInfographic from "@/assets/ocado-infographic.png";
import groceryCareerMap from "@/assets/grocery-career-map.png";
import PodcastGrid from "@/components/PodcastGrid";

const groceryStages: CareerStage[] = [
  { title: "Sourcing", icon: Sprout, roles: [
    { name: "Agricultural Buyer", description: "Purchases raw agricultural products from farms and cooperatives for grocery supply chains.", salary: "£28k–£48k" },
    { name: "Procurement Manager", description: "Manages supplier contracts, negotiations, and purchasing strategy across product categories.", salary: "£35k–£60k" },
    { name: "Supplier Relationship Manager", description: "Maintains long-term partnerships with key suppliers, managing performance and compliance.", salary: "£32k–£52k" },
    { name: "Sustainability Lead", description: "Develops and implements environmental and ethical sourcing policies across the supply chain.", salary: "£35k–£58k" },
    { name: "Quality Assurance Officer", description: "Ensures products meet food safety, quality, and regulatory standards before reaching shelves.", salary: "£28k–£45k" },
    { name: "Ethical Trading Manager", description: "Oversees fair trade practices, labour standards, and human rights compliance in the supply chain.", salary: "£32k–£55k" },
  ]},
  { title: "Manufacturing", icon: Factory, roles: [
    { name: "Food Technologist", description: "Develops and tests new food products, ensuring they meet safety, taste, and shelf-life requirements.", salary: "£26k–£45k" },
    { name: "Production Manager", description: "Oversees factory production lines, managing output, quality, and team performance.", salary: "£32k–£55k" },
    { name: "NPD Manager", description: "Leads new product development from concept to launch, coordinating cross-functional teams.", salary: "£35k–£60k" },
    { name: "Packaging Designer", description: "Designs product packaging that meets brand, regulatory, sustainability, and functional requirements.", salary: "£26k–£45k" },
    { name: "Quality Controller", description: "Conducts quality checks on production lines, sampling and testing products against standards.", salary: "£24k–£38k" },
    { name: "Factory Operations Manager", description: "Runs the overall factory operation, managing efficiency, safety, and continuous improvement.", salary: "£38k–£65k" },
    { name: "Process Engineer", description: "Designs and optimises manufacturing processes to improve efficiency, yield, and food safety.", salary: "£30k–£50k" },
  ]},
  { title: "Distribution", icon: Warehouse, roles: [
    { name: "Supply Chain Manager", description: "Plans and coordinates the movement of goods from suppliers through warehouses to stores.", salary: "£38k–£65k" },
    { name: "Logistics Planner", description: "Optimises delivery routes, schedules, and warehouse operations to reduce cost and time.", salary: "£28k–£45k" },
    { name: "Warehouse Manager", description: "Runs a distribution centre, managing picking, packing, stock accuracy, and team operations.", salary: "£30k–£50k" },
    { name: "Fleet Manager", description: "Manages the delivery vehicle fleet, including maintenance, compliance, and driver scheduling.", salary: "£32k–£52k" },
    { name: "Fulfilment Analyst", description: "Analyses order fulfilment data to improve speed, accuracy, and customer satisfaction.", salary: "£28k–£45k" },
    { name: "Temperature Control Specialist", description: "Ensures cold chain integrity for chilled and frozen products throughout the supply chain.", salary: "£28k–£42k" },
    { name: "Automation Engineer", description: "Designs and maintains automated warehouse systems, robotics, and conveyor technology.", salary: "£35k–£60k" },
  ]},
  { title: "Merchandising", icon: BarChart3, roles: [
    { name: "Category Manager", description: "Manages a product category's strategy, ranging, pricing, and supplier relationships.", salary: "£35k–£65k" },
    { name: "Buyer", description: "Selects and purchases products for stores, negotiating with suppliers on price and terms.", salary: "£30k–£60k" },
    { name: "Pricing Analyst", description: "Analyses competitor pricing and market data to set optimal price points and promotions.", salary: "£28k–£48k" },
    { name: "Range Planner", description: "Determines which products appear in stores, balancing customer demand with shelf space.", salary: "£28k–£48k" },
    { name: "Trade Marketing Manager", description: "Develops in-store marketing and promotional campaigns in partnership with suppliers.", salary: "£32k–£55k" },
    { name: "Space Planner", description: "Designs store layouts and planograms to maximise product visibility and sales.", salary: "£26k–£42k" },
    { name: "Promotions Manager", description: "Plans and executes promotional campaigns, managing pricing, timing, and supplier funding.", salary: "£30k–£50k" },
  ]},
  { title: "Retail Ops", icon: Store, roles: [
    { name: "Store Manager", description: "Runs a supermarket store, managing staff, sales, stock, and customer experience.", salary: "£28k–£48k" },
    { name: "Regional Manager", description: "Oversees a group of stores, driving performance and consistency across the region.", salary: "£45k–£75k" },
    { name: "Duty Manager", description: "Manages the store during a shift, handling staffing, deliveries, and customer issues.", salary: "£24k–£32k" },
    { name: "Stock Controller", description: "Monitors and manages inventory levels, reducing waste and ensuring availability.", salary: "£22k–£32k" },
    { name: "Customer Service Manager", description: "Leads the customer service team, handling complaints, refunds, and service standards.", salary: "£24k–£36k" },
    { name: "Fresh Food Manager", description: "Manages fresh departments (bakery, deli, produce), overseeing quality and waste reduction.", salary: "£25k–£38k" },
    { name: "Checkout Team Leader", description: "Supervises checkout operations, managing queues, staff, and till accuracy.", salary: "£22k–£28k" },
  ]},
  { title: "Consumer", icon: ShoppingCart, roles: [
    { name: "E-Commerce Manager", description: "Runs the online grocery platform, managing UX, product listings, and digital sales.", salary: "£35k–£60k" },
    { name: "Online Fulfilment Manager", description: "Manages the picking, packing, and delivery of online grocery orders.", salary: "£28k–£45k" },
    { name: "Customer Insight Analyst", description: "Analyses shopper data and loyalty card information to understand purchasing behaviour.", salary: "£28k–£48k" },
    { name: "Loyalty Programme Manager", description: "Designs and runs customer loyalty schemes to drive retention and basket size.", salary: "£32k–£55k" },
    { name: "App Product Manager", description: "Leads development of the grocery retailer's mobile app, managing features and user experience.", salary: "£40k–£65k" },
    { name: "Home Delivery Driver Coordinator", description: "Schedules and manages home delivery drivers, optimising routes and customer time slots.", salary: "£24k–£35k" },
  ]},
];

const newsfeed = [
  { title: "The Grocer", url: "https://www.thegrocer.co.uk" },
  { title: "Retail Gazette", url: "https://www.retailgazette.co.uk" },
  { title: "IGD", url: "https://www.igd.com" },
];

const groceryCompanies = [
  { name: "Cranswick", founded: "1974", hq: "Hull", overview: "Major UK food producer supplying supermarkets with fresh pork, poultry, convenience foods, and pet food.", url: "https://www.cranswick.plc.uk/careers", glassdoor: 3.2, valueChainStage: "Sourcing" },
  { name: "Hilton Food Group", founded: "1994", hq: "Huntingdon", overview: "Global food packing business supplying major retailers including Tesco.", url: "https://www.hiltonfoodgroupplc.com/careers/", glassdoor: 3.0, valueChainStage: "Sourcing" },
  { name: "Greencore", founded: "1991", hq: "Dublin/UK", overview: "The world's largest manufacturer of sandwiches, supplying M&S, Tesco, and Sainsbury's.", url: "https://www.greencore.com/careers/", glassdoor: 3.1, valueChainStage: "Sourcing" },
  { name: "Premier Foods", founded: "1975", hq: "St Albans", overview: "Owns iconic brands including Mr Kipling, Batchelors, Bisto, and Ambrosia.", url: "https://www.premierfoods.co.uk/careers", glassdoor: 3.4, valueChainStage: "Manufacturing" },
  { name: "Associated British Foods", founded: "1935", hq: "London", overview: "Diversified food group owning Kingsmill, Twinings, Ovaltine, and Primark.", url: "https://www.abf.co.uk/careers", glassdoor: 3.5, valueChainStage: "Manufacturing" },
  { name: "Ocado Group", founded: "2000", hq: "Hatfield", overview: "The parent group behind Ocado Retail and Ocado Logistics - a global technology business licensing its automated grocery platform (OSP) to retailers worldwide.", glassdoor: 3.4, profileUrl: "/company/ocado", url: "https://careers.ocadogroup.com", valueChainStage: "Distribution" },
  { name: "Ocado Logistics", founded: "2000", hq: "Hatfield", overview: "The technology and logistics arm of Ocado Group.", glassdoor: 3.3, profileUrl: "/company/ocado", url: "https://www.ocado-logistics.com/job-listing", valueChainStage: "Distribution" },
  { name: "Wincanton", founded: "1925", hq: "Chippenham", overview: "Major UK logistics and supply chain partner for grocery retailers.", url: "https://www.wincanton.co.uk/careers/", glassdoor: 3.1, valueChainStage: "Distribution" },
  { name: "XPO Logistics", founded: "1989", hq: "London (UK)", overview: "Global supply chain and logistics company providing last-mile grocery delivery.", url: "https://jobs.xpo.com", glassdoor: 3.2, valueChainStage: "Distribution" },
  { name: "Tesco", founded: "1919", hq: "Welwyn Garden City", overview: "The UK's largest retailer with over 4,000 stores.", glassdoor: 3.4, trustpilot: 1.9, profileUrl: "/company/tesco", url: "https://www.tesco-careers.com", valueChainStage: "Retail Ops" },
  { name: "Sainsbury's", founded: "1869", hq: "London", overview: "The UK's second-largest supermarket chain.", glassdoor: 3.4, trustpilot: 3.7, url: "https://sainsburys.jobs", valueChainStage: "Retail Ops" },
  { name: "Ocado Retail", founded: "2020", hq: "Hatfield", overview: "The joint venture with M&S operating the UK's largest online-only supermarket.", glassdoor: 3.4, trustpilot: 2.3, url: "https://careers.ocadoretail.com/", valueChainStage: "Retail Ops" },
  { name: "M&S Food", founded: "1884", hq: "London", overview: "Renowned for premium quality and innovative ready meals.", glassdoor: 3.5, trustpilot: 1.8, url: "https://jobs.marksandspencer.com/our-teams/food", valueChainStage: "Retail Ops" },
  { name: "Aldi", founded: "1913", hq: "Atherstone (UK)", overview: "The German discount supermarket that transformed UK grocery.", glassdoor: 3.3, trustpilot: 1.9, url: "https://www.aldirecruitment.co.uk", valueChainStage: "Retail Ops" },
  { name: "Lidl", founded: "1973", hq: "Tolworth (UK)", overview: "German discounter with rapid UK growth.", glassdoor: 3.3, trustpilot: 1.8, url: "https://careers.lidl.co.uk", valueChainStage: "Retail Ops" },
  { name: "Waitrose", founded: "1904", hq: "Bracknell", overview: "Employee-owned food retailer known for premium quality.", glassdoor: 3.6, trustpilot: 1.9, url: "https://www.jlpjobs.com", valueChainStage: "Retail Ops" },
  { name: "Deliveroo", founded: "2013", hq: "London", overview: "On-demand food and grocery delivery platform.", url: "https://careers.deliveroo.co.uk", glassdoor: 3.6, valueChainStage: "Consumer" },
  { name: "Gousto", founded: "2012", hq: "London", overview: "Recipe box company using data and automation to reduce food waste.", url: "https://www.gousto.co.uk/careers", glassdoor: 3.8, trustpilot: 4.4, valueChainStage: "Consumer" },
];

const Grocery = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <div className="border border-border p-5 mb-12">
          <h3 className="font-display font-700 text-foreground text-sm mb-1">Special: Inside Ocado</h3>
          <p className="text-muted-foreground font-body text-xs mb-3">How a tech company disguised as a supermarket is reshaping grocery delivery worldwide.</p>
          <audio controls className="w-full" preload="metadata"><source src="/audio/are-robotic-grocery-grids-over-engineered.m4a" type="audio/mp4" /></audio>
        </div>
        <PodcastPlayer industry="grocery" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "The Grocer Podcast", description: "UK grocery news, supermarket strategy, and FMCG trends from the industry bible.", url: "https://www.thegrocer.co.uk/podcast" },
            { title: "Remarkable Retail", description: "Steve Dennis on disruption, innovation, and what's next for retail.", url: "https://stevenpdennis.com" },
            { title: "The Retail Razor Show", description: "Cutting through the noise in retail strategy, tech, and consumer shifts.", url: "https://retailrazor.com/podcast/the-retail-razor-show/" },
            { title: "RETHINK Retail Podcast", description: "Deep dives into grocery operations, inventory, and the future of food retail.", url: "https://rethink.industries/podcast/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="grocery" />
        <LiveArticles industry="grocery" fallbackArticles={[
          { title: "UK Grocery Inflation Edges Higher to 4.3%", source: "Reuters", url: "https://www.reuters.com/business/retail-consumer/uk-grocery-inflation-edges-higher-43-says-worldpanel-2026-03-03/" },
          { title: "The Most Important UK Grocery Retail Trends 2026", source: "Assosia", url: "https://www.assosia.com/uk-grocery-retail-trends-2026" },
          { title: "Convenience-Led Growth: How UK Supermarkets Are Adapting in 2026", source: "International Supermarket News", url: "https://internationalsupermarketnews.com/convenience-led-growth-how-uk-supermarkets-are-adapting-in-2026/" },
          { title: "UK Trends 2026: The Grocery Retail Perspective", source: "IGD", url: "https://www.igd.com/reports/highlights-uk-trends-2026-the-grocery-retail-perspective/71892" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="grocery" />
          <div className="mt-4"><BreakingNewsFeed industry="grocery" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="grocery" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["grocery"] || []} /><div className="mt-12"><YouTubeChannels industry="grocery" /><TikTokCreators industry="grocery" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid subtitle="Who's who" title="Company Profiles" companies={groceryCompanies} />
        <div className="mt-12"><DayInTheLife industry="grocery" /></div>
        <div className="mt-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2>
          <img src={ocadoInfographic} alt="From Grocer to Global Tech Powerhouse: 25 Years of Ocado Innovation" className="w-full border border-border" loading="lazy" />
           <img src={groceryCareerMap} alt="The Grocery Value Chain: Careers From Farm to Shelf" className="w-full rounded-sm mt-6" loading="lazy" />
         </div>
         <div className="mt-12"><IndustryRolesLink industry="Grocery" /></div>
       </>
     )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From field to fridge - every role across the grocery supply chain." stages={groceryStages} industry="grocery" />
        <ExploreFurther links={[
          { title: "IGD - Careers in Food & Grocery", description: "The research and training charity for the food and grocery industry - career pathways and workforce insights.", url: "https://www.igd.com" },
          { title: "Food & Drink Federation - Careers", description: "The FDF's guide to careers in food and drink manufacturing - the UK's largest manufacturing sector.", url: "https://www.fdf.org.uk" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Grocery" searchQuery="grocery retail food" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Grocery" slug="grocery" />
          <CoursesSection industry="grocery" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">A basket of jobs for you<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the grocery industry.</p>
          <Link to="/marketplace?industry=Grocery#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={groceryStages} industry="Grocery" companies={groceryCompanies} />
        <IndustryCVBuilder industry="Grocery" stages={groceryStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Grocery" description="The food on your shelves and the grocery delivered - supermarkets, supply chains & the race to your front door." profile="The grocery industry includes supermarkets, convenience stores, wholesalers, and the logistics networks that keep them stocked. It employs roughly 3 to 4 million people in the UK, making it one of the country's largest employers. Highly competitive and operationally complex, it underpins everyday consumption and national food security." tabs={tabs} />;
};

export default Grocery;
