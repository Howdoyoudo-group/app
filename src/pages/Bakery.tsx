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
import { Wheat, ShoppingBasket, Truck, Store, ChefHat, Users } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import bakeryCake from "@/assets/bakery-cake.png";
import bakeryPretzel from "@/assets/bakery-pretzel.png";
import bakeryLoaf from "@/assets/bakery-loaf.png";
import bakeryCupcake from "@/assets/bakery-cupcake.png";
import bakeryRollingpin from "@/assets/bakery-rollingpin.png";
import bakeryWhisk from "@/assets/bakery-whisk.png";
import bakeryDonut from "@/assets/bakery-donut.png";
import bakeryPie from "@/assets/bakery-pie.png";
import bakeryChefhat from "@/assets/bakery-chefhat.png";
import PodcastGrid from "@/components/PodcastGrid";

const bakeryIcons = [
  { src: bakeryCupcake, alt: "Cupcake" },
  { src: bakeryLoaf, alt: "Bread loaf" },
  { src: bakeryPretzel, alt: "Pretzel" },
  { src: bakeryRollingpin, alt: "Rolling pin" },
  { src: bakeryCake, alt: "Cake" },
  { src: bakeryWhisk, alt: "Whisk" },
  { src: bakeryDonut, alt: "Donut" },
  { src: bakeryPie, alt: "Pie" },
  { src: bakeryChefhat, alt: "Chef hat" },
];

const bakeryStages: CareerStage[] = [
  { title: "Ingredients & Sourcing", icon: Wheat, roles: [
    { name: "Flour Miller", description: "Sources and mills grain into specialist flours for bakeries.", salary: "£22k–£30k" },
    { name: "Ingredient Buyer", description: "Negotiates supply contracts for butter, sugar, yeast, and specialty ingredients.", salary: "£28k–£40k" },
    { name: "Quality Assurance Manager", description: "Tests raw materials and ensures compliance with food safety standards.", salary: "£30k–£45k" },
  ]},
  { title: "Production & Baking", icon: ChefHat, roles: [
    { name: "Artisan Baker", description: "Hand-crafts sourdough, pastries, and speciality breads.", salary: "£22k–£32k" },
    { name: "Head Baker", description: "Leads production schedules, recipe development, and kitchen teams.", salary: "£30k–£42k" },
    { name: "Pastry Chef", description: "Creates cakes, viennoiserie, and decorated celebration pieces.", salary: "£24k–£36k" },
    { name: "NPD Chef", description: "Develops new products and recipes, testing flavours and formats for market.", salary: "£28k–£42k" },
    { name: "Food Technologist", description: "Applies food science to improve shelf life, texture, and production processes.", salary: "£26k–£40k" },
    { name: "Production Operative", description: "Operates mixing, baking, and packaging machinery in commercial bakeries.", salary: "£20k–£26k" },
  ]},
  { title: "Distribution & Wholesale", icon: Truck, roles: [
    { name: "Wholesale Account Manager", description: "Manages relationships with cafés, restaurants, and retailers.", salary: "£28k–£40k" },
    { name: "Delivery Driver", description: "Runs early-morning routes getting fresh products to customers.", salary: "£22k–£28k" },
    { name: "Logistics Coordinator", description: "Plans delivery routes, manages cold-chain, and schedules production dispatch.", salary: "£24k–£35k" },
  ]},
  { title: "Retail & Shopfront", icon: Store, roles: [
    { name: "Bakery Manager", description: "Runs day-to-day operations, staffing, stock, and customer experience.", salary: "£26k–£35k" },
    { name: "Counter Staff", description: "Serves customers, handles till, and maintains displays.", salary: "£20k–£24k" },
    { name: "Café Manager", description: "Manages the eat-in side of bakery-café operations, including coffee and dine-in service.", salary: "£24k–£32k" },
  ]},
  { title: "Brand & Marketing", icon: ShoppingBasket, roles: [
    { name: "Brand Manager", description: "Develops the bakery's identity, packaging, and social media presence.", salary: "£30k–£45k" },
    { name: "Food Photographer", description: "Shoots product imagery for menus, social, and press.", salary: "£25k–£40k" },
  ]},
  { title: "Business & Growth", icon: Users, roles: [
    { name: "Franchise Manager", description: "Oversees expansion, new site launches, and franchisee relations.", salary: "£35k–£55k" },
    { name: "Bakery Owner", description: "Runs the entire business - from recipes to rent.", salary: "Varies widely" },
  ]},
];

const newsfeed = [
  { title: "British Baker", url: "https://bakeryinfo.co.uk" },
  { title: "The Craft Bakers Association", url: "https://www.craftbakersassociation.co.uk" },
];

const bakeryCompanies = [
  { name: "Allied Bakeries", founded: "1935", hq: "Maidenhead", overview: "Produces Kingsmill and Allinson's bread at industrial scale.", url: "https://www.alliedbakeries.co.uk", glassdoor: 3.2, valueChainStage: "Production & Manufacturing" },
  { name: "Bidfood", founded: "1929", hq: "Slough", overview: "Major UK foodservice wholesaler delivering to bakeries, hotels, and restaurants nationwide.", url: "https://www.bidfood.co.uk/careers/", glassdoor: 3.1, valueChainStage: "Distribution & Wholesale" },
  { name: "Brakes (Sysco)", founded: "1958", hq: "Ashford", overview: "The UK's largest foodservice distributor, supplying bakeries, restaurants, and cafés.", url: "https://syscogbjobs.co.uk", glassdoor: 3.2, valueChainStage: "Distribution & Wholesale" },
  { name: "Bread Ahead", founded: "2013", hq: "London", overview: "Borough Market bakery and baking school championing sourdough and doughnuts.", url: "https://www.breadahead.com", trustpilot: 4.8, valueChainStage: "Retail & Shopfront" },
  { name: "Carr's Flour", founded: "1831", hq: "Cumbria", overview: "Major UK flour miller supplying both artisan and industrial bakeries.", url: "https://www.carrsflour.co.uk", valueChainStage: "Ingredients & Sourcing" },
  { name: "Gail's Bakery", founded: "2005", hq: "London", overview: "Neighbourhood bakeries across London and the South East known for sourdough and pastries.", url: "https://jobs.gailsbread.co.uk", glassdoor: 3.8, trustpilot: 2.3, profileUrl: "/company/gails", valueChainStage: "Retail & Shopfront" },
  { name: "Gails", founded: "2005", hq: "London", overview: "Alternate spelling of Gail's used by some hiring platforms - same neighbourhood bakery chain.", url: "https://jobs.gailsbread.co.uk", glassdoor: 3.8, trustpilot: 2.3, profileUrl: "/company/gails", valueChainStage: "Retail & Shopfront" },
  { name: "Greggs", founded: "1939", hq: "Newcastle", overview: "The UK's largest bakery chain with over 2,000 shops nationwide.", url: "https://careerssearch.greggs.co.uk/", glassdoor: 3.5, trustpilot: 2.4, profileUrl: "/company/greggs", valueChainStage: "Retail & Shopfront" },
  { name: "Hobbs House Bakery", founded: "1920", hq: "Gloucestershire", overview: "Family-run, slow-fermented bread baked since 1920.", url: "https://www.hobbshousebakery.co.uk", trustpilot: 4.5, valueChainStage: "Retail & Shopfront" },
  { name: "Hovis", founded: "1886", hq: "High Wycombe", overview: "Iconic British bread brand with over 130 years of heritage.", url: "https://www.hovis.co.uk/join-the-team", glassdoor: 3.4, valueChainStage: "Production & Manufacturing" },
  { name: "Marriage's Flour", founded: "1824", hq: "Chelmsford", overview: "One of the UK's oldest independent flour millers, supplying artisan bakeries.", url: "https://flour.co.uk/recruitment/", valueChainStage: "Ingredients & Sourcing" },
  { name: "Ole & Steen", founded: "2018 (UK)", hq: "London", overview: "Danish bakery chain bringing Scandinavian baking traditions to the UK high street.", url: "https://www.oleandsteen.co.uk/careers", glassdoor: 3.3, valueChainStage: "Retail & Shopfront" },
  { name: "Paul UK", founded: "1889", hq: "London", overview: "French-inspired artisan bakery and café chain.", url: "https://careers.paul-uk.com/jobs.aspx", glassdoor: 3.4, trustpilot: 2.8, valueChainStage: "Retail & Shopfront" },
  { name: "Shipton Mill", founded: "1981", hq: "Gloucestershire", overview: "Organic and stoneground flour supplier to top UK bakeries.", url: "https://www.shipton-mill.com", trustpilot: 4.7, valueChainStage: "Ingredients & Sourcing" },
  { name: "Warburtons", founded: "1876", hq: "Bolton", overview: "The UK's largest family-owned bakery, producing 2 million loaves daily.", url: "https://careers.warburtons.co.uk/", glassdoor: 3.7, valueChainStage: "Production & Manufacturing" },
];

const Bakery = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the craft and business behind the UK's favourite bakeries.</p>

          <PodcastPlayer industry="bakery" />

          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
              { title: "My Baking Journey", description: "OLBAA's podcast exploring the stories and journeys of bakers across the UK.", url: "https://www.olbaa.uk/my-baking-journey-podcast" },
              { title: "The Business of Cake Making", description: "UK-based podcast on running a baking business - pricing, marketing, and growth.", url: "https://thebusinessofcakemaking.podbean.com/" },
              { title: "The Food Programme (BBC)", description: "BBC Radio 4's long-running exploration of food, farming, and baking culture.", url: "https://www.bbc.co.uk/programmes/b006qnx3" },
            ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="bakery" />
          <LiveArticles industry="bakery" fallbackArticles={[
            { title: "The Rise of Artisan Bakeries in the UK", source: "British Baker", url: "https://bakeryinfo.co.uk" },
            { title: "How Sourdough Went Mainstream", source: "The Guardian", url: "https://theguardian.com" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="bakery" />
            <div className="mt-4">
              <BreakingNewsFeed industry="bakery" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="bakery" />
          </div>
          <div className="mt-12 border-2 border-foreground bg-primary/10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
            <div className="flex-1">
              <p className="font-display text-xs tracking-[0.25em] uppercase text-primary mb-2">
                Free download · No 01
              </p>
              <h3 className="font-display text-2xl md:text-3xl leading-tight mb-2">
                The Bakery Guide<span className="text-primary">.</span>
              </h3>
              <p className="font-body text-sm text-muted-foreground max-w-xl">
                11 pages unpacking how the UK bakery industry works - routes in, career map, salaries, who's hiring, what to read &amp; listen to.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const url = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/guides/bakery-guide.pdf";
                try {
                  const res = await fetch(url);
                  const blob = await res.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = blobUrl;
                  a.download = "Howdoyoudo-Bakery-Guide-No01.pdf";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                } catch {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }}
              className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-colors font-display text-sm tracking-wide uppercase px-6 py-4 border-2 border-foreground"
            >
              ↓ Download PDF
            </button>
          </div>
        </>
      ),
    },
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["bakery"] || []} /><div className="mt-12"><YouTubeChannels industry="bakery" /><TikTokCreators industry="bakery" /></div></>,
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={bakeryCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="bakery" />
          </div>
          <div className="mt-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2>
            <div className="grid grid-cols-3 gap-6 md:gap-10 max-w-xl mx-auto">
              {bakeryIcons.map((icon) => (
                <div key={icon.alt} className="flex items-center justify-center p-4">
                  <img src={icon.src} alt={icon.alt} className="w-20 h-20 md:w-28 md:h-28 object-contain" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12"><IndustryRolesLink industry="Bakery" /></div>
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From flour to franchise - every role in the bakery value chain." stages={bakeryStages} industry="bakery" />
          <ExploreFurther links={[
            { title: "The Craft Bakers Association", description: "The trade body for independent and craft bakeries - training, events, and career resources.", url: "https://www.craftbakersassociation.co.uk" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Bakery" searchQuery="bakery industry events UK" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Bakery" slug="bakery" />
          <CoursesSection industry="bakery" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Oven ready jobs<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the bakery industry.</p>
            <Link to="/marketplace?industry=Bakery#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={bakeryStages} industry="Bakery" companies={bakeryCompanies} />
        <IndustryCVBuilder industry="Bakery" stages={bakeryStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Bakery"
      description="Sourdough starters, 4 a.m. shifts, and the craft behind the UK's favourite loaves - how the bakery industry really works."
      profile="The UK bakery industry spans everything from artisan sourdough shops to large-scale industrial production, supplying both retail and hospitality markets. It employs around 100,000 to 120,000 people across manufacturing, distribution, and high street bakeries, making it a mid-sized but essential part of the food system. Despite its everyday familiarity, the sector is shaped by complex supply chains, early-hours labour, and evolving consumer demand for quality and convenience."
      tabs={tabs}
    />
  );
};

export default Bakery;
