import { industryVideos } from "@/data/industry-videos";
import VideoShowcase from "@/components/VideoShowcase";
import ExploreFurther from "@/components/ExploreFurther";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { CompanyProfileGrid } from "@/components/CompanyProfileCard";
import fashionInfographic from "@/assets/fashion-infographic.png";
import fashionCareerMap from "@/assets/fashion-career-map.png";
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
import { Pencil, Search, Factory, Megaphone, Store, ShoppingBag } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const fashionStages: CareerStage[] = [
  { title: "Design", icon: Pencil, roles: [{ name: "Fashion Designer", description: "Creates original clothing and accessory designs from concept to collection.", salary: "£25k–£55k" },{ name: "Textile Designer", description: "Designs fabrics, prints, and weaves for fashion collections.", salary: "£24k–£45k" },{ name: "Pattern Cutter", description: "Translates designs into technical patterns for garment construction.", salary: "£25k–£42k" },{ name: "Technical Designer", description: "Ensures garments meet fit, construction, and quality specifications.", salary: "£28k–£48k" },{ name: "Creative Director", description: "Sets the overall creative vision and direction for a brand.", salary: "£60k–£150k+" },{ name: "Trend Forecaster", description: "Predicts upcoming fashion trends by analysing culture, data, and consumer behaviour.", salary: "£30k–£55k" },{ name: "Fashion Illustrator", description: "Creates visual artwork and concept sketches to communicate design ideas.", salary: "£22k–£40k" },{ name: "Sample Machinist", description: "Sews prototype garments from patterns, bringing designs to life for the first time.", salary: "£22k–£32k" }]},
  { title: "Sourcing", icon: Search, roles: [{ name: "Sourcing Manager", description: "Manages relationships with global suppliers and factories.", salary: "£32k–£55k" },{ name: "Fabric Buyer", description: "Sources fabrics from mills worldwide, negotiating price and quality.", salary: "£28k–£48k" },{ name: "Sustainability Officer", description: "Develops sustainable sourcing policies and ethical supply chain standards.", salary: "£30k–£55k" },{ name: "Quality Inspector", description: "Checks garments against quality standards across production runs.", salary: "£24k–£38k" },{ name: "Grading Technologist", description: "Scales patterns across size ranges, ensuring consistent fit and proportion.", salary: "£24k–£38k" }]},
  { title: "Production", icon: Factory, roles: [{ name: "Production Manager", description: "Oversees manufacturing from sampling to bulk production delivery.", salary: "£32k–£55k" },{ name: "Garment Technologist", description: "Ensures garments are constructed correctly to design and safety standards.", salary: "£28k–£48k" },{ name: "Logistics Coordinator", description: "Manages the movement of goods from factory to warehouse to store.", salary: "£24k–£38k" },{ name: "Costing Analyst", description: "Calculates production costs and margins across product ranges.", salary: "£26k–£42k" }]},
  { title: "Marketing", icon: Megaphone, roles: [{ name: "Brand Manager", description: "Develops and executes brand strategy across all touchpoints.", salary: "£35k–£60k" },{ name: "PR Manager", description: "Manages press relations, media coverage, and influencer partnerships.", salary: "£30k–£55k" },{ name: "Social Media Manager", description: "Creates content and manages brand presence across social platforms.", salary: "£26k–£42k" },{ name: "Stylist", description: "Coordinates outfits for editorial shoots, campaigns, and celebrity dressing.", salary: "£25k–£50k" },{ name: "Fashion Copywriter", description: "Writes product descriptions, brand narratives, and campaign copy.", salary: "£24k–£38k" }]},
  { title: "Retail", icon: Store, roles: [{ name: "Retail Manager", description: "Oversees store operations, team management, and commercial targets.", salary: "£28k–£45k" },{ name: "Visual Merchandiser", description: "Designs in-store displays and window concepts to drive footfall.", salary: "£24k–£38k" },{ name: "Buyer", description: "Selects product ranges for retail, negotiating terms with brands.", salary: "£30k–£60k" },{ name: "Merchandiser", description: "Plans stock quantities, analyses sales data, and manages inventory flow.", salary: "£28k–£50k" },{ name: "E-Commerce Manager", description: "Manages the online store, conversion, and digital customer experience.", salary: "£32k–£55k" },{ name: "Wholesale Manager", description: "Manages relationships with stockists and multi-brand retailers.", salary: "£32k–£55k" },{ name: "Showroom Manager", description: "Runs the brand showroom, hosting buyers and press during market weeks.", salary: "£28k–£42k" }]},
  { title: "Consumer", icon: ShoppingBag, roles: [{ name: "Customer Experience Lead", description: "Designs the end-to-end customer journey across online and in-store.", salary: "£32k–£55k" },{ name: "Returns & Resale Manager", description: "Manages returns and circular fashion resale programmes.", salary: "£28k–£45k" },{ name: "Data Analyst", description: "Analyses customer and sales data to inform buying and marketing decisions.", salary: "£28k–£48k" }]},
];

const newsfeed = [
  { title: "Business of Fashion", url: "https://www.businessoffashion.com" },
  { title: "Drapers", url: "https://www.drapersonline.com" },
  { title: "Vogue Business", url: "https://www.voguebusiness.com" },
];

const fashionCompanies = [
  { name: "Coats Group", url: "https://www.coats.com/careers", founded: "1755", hq: "London", glassdoor: 3.8, overview: "The world's largest industrial thread manufacturer - supplying yarn and thread to garment factories globally.", valueChainStage: "Sourcing" },
  { name: "Boohoo Group", url: "https://www.boohoogroup.com/careers", founded: "2006", hq: "Manchester", glassdoor: 3.2, trustpilot: 1.5, overview: "Fast-fashion group owning Boohoo, PrettyLittleThing, and Nasty Gal.", valueChainStage: "Brand" },
  { name: "Burberry", url: "https://www.burberryplc.com/careers", founded: "1856", hq: "London", glassdoor: 3.9, trustpilot: 2.1, profileUrl: "/company/burberry", overview: "A 160-year-old British luxury house - design, manufacturing, and global retail.", valueChainStage: "Brand" },
  { name: "ME+EM", url: "https://www.meandem.com/careers", founded: "2009", hq: "London", glassdoor: 3.8, trustpilot: 4.6, profileUrl: "/company/me-em", overview: "Modern luxury womenswear - direct-to-consumer brand with own stores.", valueChainStage: "Brand" },
  { name: "Uniqlo", url: "https://www.uniqlo.com/uk/en/", founded: "1984", hq: "Tokyo (UK: London)", glassdoor: 3.6, trustpilot: 2.4, overview: "Japanese global brand known for functional, affordable basics - part of Fast Retailing.", valueChainStage: "Brand" },
  { name: "Zara", url: "https://www.inditexcareers.com", founded: "1975", hq: "A Coruña (UK: London)", glassdoor: 3.5, trustpilot: 1.8, overview: "The world's largest fast-fashion brand - part of Inditex, known for speed-to-market design and global retail.", valueChainStage: "Brand" },
  { name: "Monsoon", url: "https://www.monsoonjobs.com", founded: "1973", hq: "London", glassdoor: 3.5, trustpilot: 3.2, overview: "British brand known for occasion wear, bohemian prints, and embellished designs.", valueChainStage: "Brand" },
  { name: "Li & Fung", url: "https://www.lifung.com/careers/", founded: "1906", hq: "Hong Kong", glassdoor: 3.5, overview: "A global supply chain orchestrator connecting brands with manufacturers and retailers.", valueChainStage: "Wholesale & Distribution" },
  { name: "Pentland Brands", url: "https://pentlandbrands.com/jobs/", founded: "1932", hq: "London", glassdoor: 3.7, overview: "Owner and distributor of global brands including Speedo, Canterbury, and Ellesse.", valueChainStage: "Wholesale & Distribution" },
  { name: "Brand Machine Group", url: "https://www.brandmachinegroup.com/careers", founded: "1992", hq: "Manchester", glassdoor: 3.4, overview: "Licensed fashion wholesaler - designs, sources, and distributes branded clothing for major retailers.", valueChainStage: "Wholesale & Distribution" },
  { name: "JOOR", url: "https://www.joor.com/careers", founded: "2010", hq: "New York (UK: London)", glassdoor: 3.6, overview: "The leading digital wholesale platform connecting brands with retailers globally.", valueChainStage: "Wholesale & Distribution" },
  { name: "Faire", url: "https://www.faire.com/careers", founded: "2017", hq: "San Francisco (UK: London)", glassdoor: 3.9, overview: "Online wholesale marketplace making it easy for independent retailers to discover and buy from brands.", valueChainStage: "Wholesale & Distribution" },
  { name: "Rainbowwave", url: "https://www.rainbowwave.com", founded: "2002", hq: "London", glassdoor: 3.5, overview: "Fashion sales and distribution agency representing emerging and established brands across UK retail.", valueChainStage: "Wholesale & Distribution" },
  { name: "Tomorrow London", url: "https://apply.workable.com/tomorrow-2/", founded: "2008", hq: "London", glassdoor: 3.6, overview: "Showroom and distribution partner for contemporary fashion brands entering the UK market.", valueChainStage: "Wholesale & Distribution" },
  { name: "Next", url: "https://careers.next.co.uk/jobs", founded: "1864", hq: "Leicester", glassdoor: 3.5, trustpilot: 3.8, overview: "One of the UK's biggest fashion retailers - high street, online, and a growing third-party platform.", valueChainStage: "Retail & Platforms" },
  { name: "Marks & Spencer", url: "https://jobs.marksandspencer.com", founded: "1884", hq: "London", glassdoor: 3.6, trustpilot: 2.3, overview: "Iconic British retailer - clothing, home, and food, with a renewed focus on fashion and digital.", valueChainStage: "Retail & Platforms" },
  { name: "ASOS", url: "https://www.asoscareers.com", founded: "2000", hq: "London", glassdoor: 3.4, trustpilot: 2.6, profileUrl: "/company/asos", overview: "The UK's largest online-only fashion retailer and marketplace.", valueChainStage: "Retail & Platforms" },
  { name: "Zalando", url: "https://jobs.zalando.com", founded: "2008", hq: "Berlin (UK: London)", glassdoor: 3.8, trustpilot: 2.0, overview: "Europe's leading online fashion platform - retail, marketplace, and logistics.", valueChainStage: "Retail & Platforms" },
  { name: "Selfridges", url: "https://jobsearch.selfridges.com", founded: "1909", hq: "London", glassdoor: 3.8, trustpilot: 2.3, overview: "Iconic British luxury department store - a destination for fashion, beauty, and lifestyle.", valueChainStage: "Retail & Platforms" },
  { name: "Harrods", url: "https://harrodscareers.harrods.com", founded: "1849", hq: "London", glassdoor: 3.9, trustpilot: 2.1, overview: "The world's most famous luxury department store - seven floors of fashion, food, and lifestyle.", valueChainStage: "Retail & Platforms" },
  { name: "John Lewis", url: "https://www.jlpjobs.com", founded: "1864", hq: "London", glassdoor: 3.7, trustpilot: 2.5, overview: "Employee-owned department store chain known for fashion, home, and customer service.", valueChainStage: "Retail & Platforms" },
  { name: "Flannels", url: "https://www.flannels.com/careers", founded: "1976", hq: "Manchester", glassdoor: 3.3, trustpilot: 1.8, overview: "Premium fashion retailer - part of Frasers Group, stocking luxury and designer brands.", valueChainStage: "Retail & Platforms" },
  { name: "END.", url: "https://www.endclothing.com/gb/careers", founded: "2005", hq: "Newcastle", glassdoor: 3.5, trustpilot: 2.0, overview: "Global online destination for contemporary menswear and streetwear brands.", valueChainStage: "Retail & Platforms" },
  { name: "Depop", url: "https://depopcareers.com/careers", founded: "2011", hq: "London", glassdoor: 3.6, trustpilot: 1.3, overview: "A peer-to-peer fashion resale marketplace for Gen Z.", valueChainStage: "Resale & Circular" },
  { name: "Vinted", url: "https://www.vinted.com/jobs", founded: "2008", hq: "Vilnius (UK: London)", glassdoor: 4.0, trustpilot: 4.3, overview: "Europe's largest second-hand fashion marketplace - making pre-loved the first choice.", valueChainStage: "Resale & Circular" },
  { name: "eBay", url: "https://www.ebayinc.com/careers/", founded: "1995", hq: "San Jose (UK: London)", glassdoor: 4.0, trustpilot: 1.5, overview: "Global marketplace with a massive pre-owned fashion segment - pioneering authentication and circular commerce.", valueChainStage: "Resale & Circular" },
];

const Fashion = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<>
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
      <div className="border border-border p-5 md:p-6 mb-6"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"><Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" /></div><div><h3 className="font-display font-700 text-foreground text-sm">The Hidden Engineering Behind Your Clothes</h3><p className="text-muted-foreground font-body text-xs">Episode - How Do You Do Fashion</p></div></div><audio controls className="w-full h-10" preload="metadata"><source src="/audio/the-hidden-engineering-behind-your-clothes.m4a" type="audio/mp4" /></audio></div>
      <PodcastPlayer industry="fashion" />
      <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
      <PodcastGrid podcasts={[{ title: "The Business of Fashion Podcast", description: "BoF's flagship - interviews with the power players shaping global fashion.", url: "https://www.businessoffashion.com/podcasts/" },{ title: "Dressed: The History of Fashion", description: "How fashion reflects culture, politics, and identity.", url: "https://www.iheart.com" },{ title: "The Glossy Podcast", description: "Inside the business strategies of fashion and DTC brands.", url: "https://www.glossy.co/podcasts/" },{ title: "Wardrobe Crisis with Clare Press", description: "Sustainability, ethics, and activism in fashion.", url: "https://thewardrobecrisis.com/" }]} />
    </>) },
    { id: "read", label: "Read", content: (<>
      <DailyBriefing industry="fashion" />
      <LiveArticles industry="fashion" fallbackArticles={[{ title: "The Forces That Will Shape Fashion's Supply Chains in 2026", source: "Vogue Business", url: "https://compute.vogue.com/article/the-forces-that-will-shape-fashions-supply-chains-in-2026" },{ title: "The State of Fashion 2026 Report", source: "Business of Fashion / McKinsey", url: "https://www.caf-fcv.ca/posts/business-of-fashion-2026/" }]} />
      <div className="mt-12"><NewsfeedModal sources={newsfeed} industry="fashion" /><div className="mt-4"><BreakingNewsFeed industry="fashion" sources={newsfeed} /></div></div>
      <div className="mt-12"><SubstackNewsletters industry="fashion" /></div>
    </>) },
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["fashion"] || []} /><div className="mt-12"><YouTubeChannels industry="fashion" /><TikTokCreators industry="fashion" /></div></> },
    { id: "work", label: "Who?", content: (<><CompanyProfileGrid companies={fashionCompanies} /><div className="mt-12"><DayInTheLife industry="fashion" /></div><div className="mt-12"><IndustryRolesLink industry="Fashion" /></div><div className="mt-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2><img src={fashionInfographic} alt="Fashion infographic" className="w-full rounded-sm" /><img src={fashionCareerMap} alt="Fashion career map infographic" className="w-full rounded-sm mt-6" loading="lazy" /></div></>) },
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From sketch to wardrobe - the roles across the fashion value chain." stages={fashionStages} industry="fashion" />
        <ExploreFurther links={[
          { title: "British Fashion Council - Careers", description: "The BFC supports emerging talent and provides career resources across the UK fashion industry.", url: "https://www.britishfashioncouncil.co.uk/careers" },
          { title: "Fashion Minority Report", description: "Resources, mentorship, and career advice promoting diversity and inclusion in fashion.", url: "https://www.fashionminorityreport.com" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Fashion" searchQuery="fashion industry" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Fashion" slug="fashion" />
          <CoursesSection industry="fashion" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Jobs tailored for you<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the fashion industry.</p><Link to="/marketplace?industry=Fashion#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link></div><IndustryRolesShowcase stages={fashionStages} industry="Fashion" companies={fashionCompanies} />
        <IndustryCVBuilder industry="Fashion" stages={fashionStages} /></>) },
  ];
  return <IndustryPageLayout name="Fashion" description="Global supply chains, fast fashion empires, and the people stitching it all together." profile="The fashion industry spans design, manufacturing, branding, and global retail, connecting creative direction with complex supply chains. In the UK, it employs approximately 800,000 to 1.2 million people across both creative and commercial roles. Fast-moving and trend-driven, it sits at the intersection of culture, identity, and globalised production." tabs={tabs} />;
};

export default Fashion;
