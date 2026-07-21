import { industryVideos } from "@/data/industry-videos";
import VideoShowcase from "@/components/VideoShowcase";
import ExploreFurther from "@/components/ExploreFurther";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { CompanyProfileGrid } from "@/components/CompanyProfileCard";
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
import { Sparkles, FlaskConical, Package, Store, Brush, Heart } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const beautyStages: CareerStage[] = [
  { title: "Product Development", icon: FlaskConical, roles: [
    { name: "Cosmetic Chemist", description: "Formulates skincare, haircare, and makeup products, balancing efficacy, safety, and texture.", salary: "£28k–£50k" },
    { name: "Product Development Manager", description: "Leads the creation of new products from concept to launch, coordinating labs, marketing, and manufacturing.", salary: "£35k–£60k" },
    { name: "Regulatory Affairs Specialist", description: "Ensures products comply with UK and EU cosmetics regulations, managing safety assessments and labelling.", salary: "£30k–£50k" },
    { name: "Fragrance Developer", description: "Works with perfumers and fragrance houses to create and select scents for products.", salary: "£30k–£55k" },
    { name: "Packaging Designer", description: "Designs the look, feel, and functionality of product packaging - from bottles to boxes.", salary: "£28k–£45k" },
    { name: "Lab Technician", description: "Supports R&D by preparing samples, running stability tests, and documenting results.", salary: "£22k–£32k" },
  ]},
  { title: "Manufacturing & Supply", icon: Package, roles: [
    { name: "Production Manager", description: "Oversees the manufacturing floor, ensuring products are made to specification, on time, and on budget.", salary: "£32k–£50k" },
    { name: "Quality Control Analyst", description: "Tests raw materials and finished goods for consistency, purity, and compliance.", salary: "£25k–£38k" },
    { name: "Supply Chain Coordinator", description: "Manages the flow of ingredients and packaging from suppliers to manufacturing facilities.", salary: "£26k–£40k" },
    { name: "Contract Manufacturing Liaison", description: "Manages relationships with third-party manufacturers who produce beauty products on behalf of brands.", salary: "£30k–£48k" },
    { name: "Sustainability Lead", description: "Develops eco-friendly formulations, reduces packaging waste, and drives ethical sourcing.", salary: "£32k–£55k" },
  ]},
  { title: "Brand & Marketing", icon: Sparkles, roles: [
    { name: "Brand Manager", description: "Owns the brand's positioning, identity, and go-to-market strategy across all channels.", salary: "£35k–£60k" },
    { name: "Social Media Manager", description: "Creates and manages content across Instagram, TikTok, and YouTube to build brand awareness.", salary: "£26k–£42k" },
    { name: "Influencer & PR Manager", description: "Builds relationships with beauty creators, manages gifting, and coordinates press coverage.", salary: "£28k–£50k" },
    { name: "Content Creator", description: "Produces photography, video, and editorial content to showcase products and tell brand stories.", salary: "£24k–£40k" },
    { name: "Copywriter", description: "Writes product descriptions, campaign copy, and editorial content with a beauty-savvy tone.", salary: "£26k–£40k" },
    { name: "Visual Merchandiser", description: "Designs in-store displays, counter layouts, and point-of-sale experiences.", salary: "£24k–£38k" },
  ]},
  { title: "Retail & Sales", icon: Store, roles: [
    { name: "Beauty Advisor / Counter Manager", description: "Guides customers through products, demonstrates techniques, and drives in-store sales.", salary: "£22k–£32k" },
    { name: "Retail Area Manager", description: "Manages multiple store locations, driving sales targets and team performance.", salary: "£35k–£55k" },
    { name: "E-Commerce Manager", description: "Runs the brand's online store, managing product listings, promotions, and digital sales.", salary: "£30k–£50k" },
    { name: "Key Account Manager", description: "Manages relationships with major retailers like Boots, Sephora, and Space NK.", salary: "£35k–£60k" },
    { name: "Trade Marketing Manager", description: "Creates marketing programmes specifically for retail partners and wholesale channels.", salary: "£32k–£52k" },
    { name: "Buyer", description: "Selects and negotiates product ranges for retailers, deciding what goes on the shelves.", salary: "£30k–£55k" },
  ]},
  { title: "Professional Services", icon: Brush, roles: [
    { name: "Makeup Artist", description: "Applies makeup for fashion shoots, film, TV, weddings, and editorial work.", salary: "£20k–£45k" },
    { name: "Hair Stylist", description: "Cuts, colours, and styles hair in salons, for events, or in editorial and media settings.", salary: "£18k–£40k" },
    { name: "Aesthetician / Skin Therapist", description: "Delivers facials, chemical peels, and skin treatments in clinics and spas.", salary: "£22k–£38k" },
    { name: "Nail Technician", description: "Provides manicures, pedicures, gel nails, and nail art in salons and freelance settings.", salary: "£18k–£30k" },
    { name: "Salon Manager", description: "Runs the day-to-day operations of a beauty salon, managing staff, bookings, and finances.", salary: "£26k–£40k" },
    { name: "Beauty Educator / Trainer", description: "Trains beauty professionals and retail staff on techniques, products, and brand standards.", salary: "£28k–£45k" },
  ]},
  { title: "Consumer & Community", icon: Heart, roles: [
    { name: "Beauty Editor", description: "Reviews products, covers industry trends, and writes for beauty publications and platforms.", salary: "£28k–£50k" },
    { name: "Brand Ambassador", description: "Represents a brand at events, launches, and in-store activations, embodying the brand identity.", salary: "£24k–£40k" },
    { name: "Community Manager", description: "Builds and nurtures the brand's online community, managing engagement and customer relationships.", salary: "£26k–£40k" },
    { name: "Customer Insights Analyst", description: "Analyses reviews, surveys, and sales data to understand what customers want and how they shop.", salary: "£28k–£45k" },
    { name: "Subscription Box Manager", description: "Curates and manages beauty subscription services, handling product selection and logistics.", salary: "£28k–£45k" },
  ]},
];

const newsfeed = [
  { title: "Cosmetics Business", url: "https://www.cosmeticsbusiness.com" },
  { title: "Beauty Independent", url: "https://www.beautyindependent.com" },
  { title: "British Beauty Council", url: "https://britishbeautycouncil.com" },
];

const beautyCompanies = [
  { name: "Charlotte Tilbury", url: "https://apply.workable.com/charlotte-tilbury/", founded: "2013", hq: "London", glassdoor: 3.6, overview: "British luxury makeup and skincare brand founded by the celebrity makeup artist. Now part of Puig, with a global cult following.", valueChainStage: "Brand & Marketing" },
  { name: "Boots (No7 Beauty)", url: "https://www.boots.jobs", founded: "1849", hq: "Nottingham", glassdoor: 3.5, overview: "The UK's largest health and beauty retailer, home to No7 and owner of brands like Soap & Glory. 2,200+ stores.", valueChainStage: "Retail & Sales" },
  { name: "The Body Shop", url: "https://careers.thebodyshop.com", founded: "1976", hq: "London", overview: "Pioneering ethical beauty brand known for activism, community trade, and cruelty-free products.", valueChainStage: "Brand & Marketing" },
  { name: "Space NK", url: "https://careers.spacenk.com/jobs", founded: "1993", hq: "London", glassdoor: 3.4, overview: "Premium beauty retailer curating the best niche and luxury beauty brands under one roof.", valueChainStage: "Retail & Sales" },
  { name: "Elemis", url: "https://careers.elemis.com/en", founded: "1990", hq: "London", glassdoor: 3.7, overview: "British luxury skincare brand, big in spas and now booming in DTC and international retail.", valueChainStage: "Product Development" },
  { name: "Revolution Beauty", url: "https://revolutionbeauty.teamtailor.com/jobs", founded: "2014", hq: "London", glassdoor: 3.2, overview: "Fast-beauty brand making trend-led makeup and skincare accessible. Listed on AIM, sold globally.", valueChainStage: "Manufacturing & Supply" },
  { name: "Cult Beauty (THG)", url: "https://www.thg.com/careers", founded: "2008", hq: "London / Manchester", overview: "Online beauty retailer (now part of THG) curating premium and indie beauty brands for a savvy audience.", valueChainStage: "Retail & Sales" },
  { name: "Larry King Hair", url: "https://www.larryking.co.uk/pages/careers", founded: "2016", hq: "London", overview: "Celebrity hairdresser's salon and product brand, bringing editorial hair expertise to the high street.", valueChainStage: "Professional Services" },
  { name: "Toni & Guy", url: "https://www.toniandguy.com/careers", founded: "1963", hq: "London", glassdoor: 3.5, overview: "Iconic global hairdressing brand with 475+ salons worldwide. Known for fashion-forward styling, education academies, and launching thousands of hairdressing careers.", valueChainStage: "Professional Services" },
  { name: "Townhouse", url: "https://townhousebeauty.com/careers/", founded: "2017", hq: "London", overview: "Fast-growing luxury nail salon brand redefining the nail bar experience with chic interiors, hygiene-first standards, and a tech-enabled booking model.", valueChainStage: "Professional Services" },
];

const Beauty = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <PodcastPlayer industry="beauty" />
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
              { title: "Fat Mascara", description: "Beauty editors from major publications breaking down industry trends, product science, and careers.", url: "https://www.fatmascara.com" },
              { title: "Gloss Angeles", description: "LA-based beauty podcast covering brand strategies, industry business, and what's really happening behind the counter.", url: "https://podcasts.apple.com/gb/podcast/gloss-angeles/id1458854313" },
              { title: "Beauty Brain Trust", description: "Industry executives and founders sharing how beauty brands are built, marketed, and scaled.", url: "https://podcasts.apple.com/gb/podcast/beauty-brain-trust/id1538989616" },
              { title: "Breaking Beauty", description: "Founders of the biggest beauty brands sharing their origin stories and business insights.", url: "https://www.breakingbeautypodcast.com" },
            ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="beauty" />
          <LiveArticles industry="beauty" fallbackArticles={[
            { title: "The Business of Beauty: UK Market Report 2026", source: "British Beauty Council", url: "https://britishbeautycouncil.com" },
            { title: "How Clean Beauty Is Reshaping the Industry", source: "Cosmetics Business", url: "https://www.cosmeticsbusiness.com" },
            { title: "Gen Z and the Future of Beauty Retail", source: "Beauty Independent", url: "https://www.beautyindependent.com" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="beauty" />
            <div className="mt-4">
              <BreakingNewsFeed industry="beauty" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="beauty" />
          </div>
        </>
      ),
    },
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["beauty"] || []} /><div className="mt-12"><YouTubeChannels industry="beauty" /><TikTokCreators industry="beauty" /></div></>,
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={beautyCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="beauty" />
          </div>
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From the lab to the salon - the roles that power every stage of the beauty industry." stages={beautyStages} industry="beauty" />
          <div className="mt-12">
            <IndustryRolesLink industry="Beauty" />
          </div>
          <ExploreFurther links={[
            { title: "HABIA - Careers in Hair & Beauty", description: "The government-approved standards setting body for hair, beauty, nails, and spa industries.", url: "https://www.habia.org/careers/" },
            { title: "BABTAC - Career Hub", description: "The British Association of Beauty Therapy & Cosmetology's career advice and industry resources.", url: "https://www.babtac.com" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Beauty" searchQuery="beauty industry UK" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Beauty" slug="beauty" />
          <CoursesSection industry="beauty" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Good looking jobs<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the beauty industry.</p>
            <Link to="/marketplace?industry=Beauty#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={beautyStages} industry="Beauty" companies={beautyCompanies} />
        <IndustryCVBuilder industry="Beauty" stages={beautyStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Beauty"
      description="Formulas, founders, and the £30 billion UK industry behind every product on your shelf."
      profile="The UK beauty industry is worth over £30 billion and employs hundreds of thousands of people across cosmetics, skincare, haircare, fragrance, and professional services. From indie brands born on Instagram to heritage houses like Charlotte Tilbury and Elemis, it's one of Britain's most dynamic and fast-moving sectors - blending science, creativity, and commerce."
      tabs={tabs}
    />
  );
};

export default Beauty;
