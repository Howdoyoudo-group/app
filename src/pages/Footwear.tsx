import { industryVideos } from "@/data/industry-videos";
import VideoShowcase from "@/components/VideoShowcase";
import PodcastGrid from "@/components/PodcastGrid";
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
import { Factory, Palette, Truck, Store, TrendingUp, Users } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import footwearSneaker from "@/assets/footwear-sneaker.png";
import footwearBoot from "@/assets/footwear-boot.png";
import footwearSandal from "@/assets/footwear-sandal.png";
import footwearLoafer from "@/assets/footwear-loafer.png";
import footwearBrogue from "@/assets/footwear-brogue.png";
import footwearLast from "@/assets/footwear-last.png";
import footwearSole from "@/assets/footwear-sole.png";
import footwearLaces from "@/assets/footwear-laces.png";
import footwearWellington from "@/assets/footwear-wellington.png";

const footwearIcons = [
  { src: footwearSneaker, alt: "Sneaker" },
  { src: footwearBoot, alt: "Boot" },
  { src: footwearSandal, alt: "Sandal" },
  { src: footwearLoafer, alt: "Loafer" },
  { src: footwearLast, alt: "Shoe last" },
  { src: footwearBrogue, alt: "Brogue" },
  { src: footwearSole, alt: "Sole" },
  { src: footwearLaces, alt: "Laces" },
  { src: footwearWellington, alt: "Wellington" },
];

const footwearStages: CareerStage[] = [
  { title: "Design & Development", icon: Palette, roles: [
    { name: "Footwear Designer", description: "Sketches concepts, selects materials, and develops prototypes for new styles.", salary: "£28k–£55k" },
    { name: "Last Engineer", description: "Creates and refines the 3D foot forms (lasts) that define shoe fit and shape.", salary: "£30k–£45k" },
    { name: "Materials Researcher", description: "Sources and tests leathers, textiles, rubber compounds, and sustainable alternatives.", salary: "£26k–£40k" },
    { name: "Colourway Designer", description: "Develops seasonal colour palettes and colourway options for footwear ranges.", salary: "£26k–£42k" },
    { name: "Product Developer", description: "Manages the product from concept to production-ready, coordinating design, tech, and factory.", salary: "£30k–£50k" },
  ]},
  { title: "Manufacturing & Production", icon: Factory, roles: [
    { name: "Production Manager", description: "Oversees factory output, quality targets, and lean-manufacturing schedules.", salary: "£35k–£55k" },
    { name: "Quality Controller", description: "Inspects samples and production runs for durability, finish, and fit consistency.", salary: "£25k–£35k" },
    { name: "Cobbler / Sample Maker", description: "Hand-builds prototypes and one-off repairs using traditional craft techniques.", salary: "£25k–£32k" },
    { name: "Fit Technologist", description: "Ensures footwear fits correctly across sizes through wear-testing and measurements.", salary: "£26k–£42k" },
  ]},
  { title: "Supply Chain & Logistics", icon: Truck, roles: [
    { name: "Supply Chain Analyst", description: "Maps global supplier networks, forecasts demand, and optimises lead times.", salary: "£30k–£50k" },
    { name: "Sourcing Manager", description: "Negotiates with tanneries, sole manufacturers, and component suppliers worldwide.", salary: "£35k–£60k" },
    { name: "Logistics Coordinator", description: "Manages shipping, customs clearance, and warehouse distribution for footwear lines.", salary: "£25k–£38k" },
  ]},
  { title: "Retail & E-Commerce", icon: Store, roles: [
    { name: "Store Manager", description: "Runs day-to-day retail operations, visual merchandising, and team performance.", salary: "£28k–£42k" },
    { name: "E-Commerce Manager", description: "Drives online sales, manages product pages, and oversees fulfilment and returns.", salary: "£32k–£55k" },
    { name: "Visual Merchandiser", description: "Designs in-store displays and window concepts that tell a product story.", salary: "£25k–£35k" },
    { name: "Trade Marketing Manager", description: "Develops marketing campaigns for wholesale partners and retail accounts.", salary: "£30k–£50k" },
  ]},
  { title: "Marketing & Brand", icon: TrendingUp, roles: [
    { name: "Brand Manager", description: "Shapes positioning, campaigns, and collaborations for footwear labels.", salary: "£35k–£60k" },
    { name: "Sneaker Buyer", description: "Curates seasonal ranges, negotiates allocations, and spots emerging trends.", salary: "£28k–£50k" },
    { name: "Social & Content Creator", description: "Produces on-foot photography, unboxing videos, and influencer partnerships.", salary: "£25k–£40k" },
  ]},
  { title: "Business & Strategy", icon: Users, roles: [
    { name: "Category Director", description: "Owns P&L for an entire footwear division - sets pricing, distribution, and growth targets.", salary: "£60k–£100k+" },
    { name: "Sustainability Lead", description: "Drives circularity programmes, carbon reporting, and ethical sourcing standards.", salary: "£40k–£65k" },
  ]},
];

const newsfeed = [
  { title: "Footwear News", url: "https://footwearnews.com" },
  { title: "Sneaker Freaker", url: "https://www.sneakerfreaker.com" },
  { title: "The Business of Fashion", url: "https://www.businessoffashion.com" },
  { title: "Partnerwise", url: "https://www.partnerwise.co.uk" },
];

const footwearCompanies = [
  { name: "Vibram", url: "https://www.vibram.com/us/brand/br_careers_vibram.html", founded: "1937", hq: "Albizzate, Italy", overview: "The world's leading rubber sole manufacturer, supplying outsoles to hundreds of footwear brands from hiking boots to luxury shoes.", valueChainStage: "Manufacturing & Production" },
  { name: "ECCO", url: "https://www.ecco.com/en-gb/careers/", founded: "1963", hq: "Bredebro, Denmark", glassdoor: 3.6, overview: "One of the few major footwear brands that owns its entire supply chain - from tanneries to factories to retail.", valueChainStage: "Manufacturing & Production" },
  { name: "Nike", founded: "1964", hq: "Beaverton, Oregon", overview: "The world's largest athletic footwear and apparel brand.", url: "https://jobs.nike.com", glassdoor: 4.0, trustpilot: 1.6, profileUrl: "/company/nike", valueChainStage: "Brand" },
  { name: "Adidas", founded: "1949", hq: "Herzogenaurach, Germany", overview: "The world's second-largest sportswear brand.", url: "https://careers.adidas-group.com", glassdoor: 4.0, trustpilot: 1.7, profileUrl: "/company/adidas", valueChainStage: "Brand" },
  { name: "Dr. Martens", founded: "1960", hq: "London, UK", overview: "Iconic British boot brand rooted in subculture.", url: "https://jobs.drmartens.com", glassdoor: 3.5, trustpilot: 2.2, profileUrl: "/company/dr-martens", valueChainStage: "Brand" },
  { name: "Birkenstock", founded: "1774", hq: "Linz am Rhein, Germany", overview: "Heritage German sandal maker famed for contoured cork footbeds.", url: "https://www.birkenstock.com/us/us-about-careers.html", glassdoor: 3.6, trustpilot: 1.7, profileUrl: "/company/birkenstock", valueChainStage: "Brand" },
  { name: "UGG", founded: "1978", hq: "Goleta, California", overview: "Sheepskin boot pioneer turned global comfort brand.", url: "https://www.deckers.com/careers", glassdoor: 3.7, trustpilot: 3.8, profileUrl: "/company/ugg", valueChainStage: "Brand" },
  { name: "Timberland", founded: "1973", hq: "Stratham, New Hampshire", overview: "Iconic outdoor boot brand owned by VF Corporation.", url: "https://careers.vfc.com", glassdoor: 3.8, trustpilot: 1.6, profileUrl: "/company/timberland", valueChainStage: "Brand" },
  { name: "Schuh", url: "https://careers.schuh.co.uk", founded: "1981", hq: "Livingston, Scotland", glassdoor: 3.5, trustpilot: 4.3, overview: "One of the UK's largest footwear retailers with 120+ stores.", valueChainStage: "Retail & E-Commerce" },
  { name: "JD Sports", url: "https://careers.jdplc.com", founded: "1981", hq: "Bury, Greater Manchester", glassdoor: 3.3, trustpilot: 1.5, overview: "Europe's leading trainer and sportswear retailer.", valueChainStage: "Retail & E-Commerce" },
  { name: "Foot Locker", url: "https://jobs.footlocker.com", founded: "1974", hq: "New York City, USA", glassdoor: 3.5, trustpilot: 1.6, overview: "The world's largest athletic footwear retailer.", valueChainStage: "Retail & E-Commerce" },
  { name: "Office", url: "https://www.office.co.uk", founded: "1981", hq: "London, UK", glassdoor: 3.2, overview: "UK fashion-footwear retailer stocking a curated edit of contemporary brands.", valueChainStage: "Retail & E-Commerce" },
  { name: "Footasylum", url: "https://footasylum.teamtailor.com/jobs", founded: "2005", hq: "Manchester", glassdoor: 3.3, trustpilot: 1.4, overview: "A UK streetwear and sneaker retailer with 60+ stores.", valueChainStage: "Retail & E-Commerce" },
  { name: "New Balance", url: "https://careers.newbalance.com", founded: "1906", hq: "Boston (UK: Warrington)", glassdoor: 3.9, trustpilot: 2.5, overview: "Privately-held athletic footwear and apparel brand - UK manufacturing in Flimby, Cumbria.", valueChainStage: "Brand" },
  { name: "Skechers", url: "https://about.skechers.com/careers/", founded: "1992", hq: "Manhattan Beach (UK: Hertfordshire)", glassdoor: 3.6, trustpilot: 2.0, overview: "The third-largest athletic footwear brand globally - comfort-led product across performance and lifestyle.", valueChainStage: "Brand" },
  { name: "Shoe Zone", url: "https://www.shoezone.com/Careers", founded: "1980", hq: "Leicester", glassdoor: 3.0, trustpilot: 4.4, overview: "The UK's largest value footwear retailer with 280+ stores.", valueChainStage: "Retail & E-Commerce" },
  { name: "Kurt Geiger", url: "https://www.kurtgeigercareers.com", founded: "1963", hq: "London", glassdoor: 3.4, trustpilot: 1.8, overview: "London's leading luxury footwear and accessories brand - owned-store, wholesale, and e-commerce.", valueChainStage: "Brand" },
  { name: "Clarks", url: "https://www.clarksjobs.com", founded: "1825", hq: "Street, Somerset", glassdoor: 3.6, overview: "A long-established British footwear brand with stores and products sold internationally.", valueChainStage: "Brand" },
  { name: "On", url: "https://culture.on-running.com/jobs", founded: "2010", hq: "Zurich, Switzerland", glassdoor: 2.8, overview: "A Swiss sportswear brand known for its running shoes, with a growing retail and office presence including London.", valueChainStage: "Brand" },
  { name: "Jimmy Choo", url: "https://www.jimmychoo.com/en/careers.html", founded: "1996", hq: "London", glassdoor: 3.8, overview: "A luxury accessories house that began as an East London shoemaking atelier and now operates stores worldwide.", valueChainStage: "Brand" },
  { name: "Deichmann", url: "https://corpsite.deichmann.com/gb-en/careers/", founded: "1913", hq: "Essen, Germany", glassdoor: 3.0, overview: "A European footwear retailer with over 120 stores across the UK.", valueChainStage: "Retail & E-Commerce" },
];

const Footwear = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<>
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
      <PodcastPlayer industry="footwear" />
      <div className="mt-12">
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
          { title: "In Their Shoes - Cordwainers", description: "Interviews with the brightest in the footwear industry - from the Creative Director of Pentland Brands to the CEO of Kurt Geiger.", url: "https://podcasts.apple.com/gb/podcast/in-their-shoes/id1585981544" },
          { title: "Sneaker History Podcast", description: "Nearly 600k downloads - the business, culture, and stories behind iconic sneakers and the people who make them.", url: "https://open.spotify.com/show/6BRApFKpxPwr6ob0TzhN6e" },
          { title: "Women In Sneakers", description: "Celebrating women in the sneaker industry - behind-the-scenes stories and career advice from designers, buyers, and marketers.", url: "https://podcasts.apple.com/gb/podcast/womeninsneakers/id1533588063" },
        ]} />
      </div>
    </>)},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="footwear" />
        <LiveArticles industry="footwear" fallbackArticles={[
          { title: "How Nike Is Rebuilding After a Turbulent Year", source: "Business of Fashion", url: "https://www.businessoffashion.com" },
          { title: "Birkenstock's IPO and the Rise of Comfort-Led Fashion", source: "Financial Times", url: "https://www.ft.com" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="footwear" />
          <div className="mt-4">
            <BreakingNewsFeed industry="footwear" sources={newsfeed} />
          </div>
        </div>
        <div className="mt-12">
          <SubstackNewsletters industry="footwear" />
        </div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["footwear"] || []} /><div className="mt-12"><YouTubeChannels industry="footwear" /><TikTokCreators industry="footwear" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={footwearCompanies} />
        <div className="mt-12"><DayInTheLife industry="footwear" /></div>
        <div className="mt-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Footwear Essentials<span className="text-primary">.</span></h2>
          <div className="grid grid-cols-3 gap-6 md:gap-10 max-w-xl mx-auto">
            {footwearIcons.map((icon) => (
              <div key={icon.alt} className="flex items-center justify-center p-4">
                <img src={icon.src} alt={icon.alt} className="w-20 h-20 md:w-28 md:h-28 object-contain" />
              </div>
            ))}
          </div>
        </div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From last to lace - every role in the footwear value chain." stages={footwearStages} industry="footwear" />
          <div className="mt-12"><IndustryRolesLink industry="Footwear" /></div>
        <ExploreFurther links={[
          { title: "British Footwear Association", description: "The trade body for the UK footwear industry - industry data, careers, and events.", url: "https://www.britishfootwearassociation.co.uk" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Footwear" searchQuery="footwear" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Footwear" slug="footwear" />
          <CoursesSection industry="footwear" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Step into your next role<span className="text-primary">?</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the footwear industry.</p>
          <Link to="/marketplace?industry=Footwear#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={footwearStages} industry="Footwear" companies={footwearCompanies} />
        <IndustryCVBuilder industry="Footwear" stages={footwearStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Footwear" description="Sneakers, boots, sandals, and luxury shoes - from the factory floor to the shop floor." profile="The footwear industry covers the design, manufacturing, distribution, and retail of shoes across fashion and performance markets. In the UK, it employs approximately 50,000 to 100,000 people, often as part of the wider fashion and retail ecosystem. Though smaller in scale, it plays a key role in global supply chains and brand-driven consumer markets." tabs={tabs} />;
};

export default Footwear;
