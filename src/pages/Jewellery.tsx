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
import { Gem, Hammer, Palette, Store, Megaphone, Briefcase } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const jewelleryStages: CareerStage[] = [
  { title: "Design & Creation", icon: Palette, roles: [
    { name: "Jewellery Designer", description: "Conceptualises and sketches new pieces - from engagement rings to high jewellery collections.", salary: "£25k–£50k" },
    { name: "CAD Designer", description: "Uses 3D modelling software (Rhino, MatrixGold) to render precise jewellery designs.", salary: "£25k–£45k" },
    { name: "Creative Director", description: "Sets the overall aesthetic vision for a jewellery brand or maison.", salary: "£55k–£120k" },
    { name: "Trend Forecaster", description: "Identifies upcoming materials, styles, and consumer preferences in the luxury market.", salary: "£30k–£50k" },
  ]},
  { title: "Craft & Workshop", icon: Hammer, roles: [
    { name: "Bench Jeweller", description: "Hand-fabricates, solders, sets stones, and finishes fine jewellery at the workbench.", salary: "£25k–£45k" },
    { name: "Stone Setter", description: "Secures gemstones into metal mounts using prong, bezel, pavé, and channel techniques.", salary: "£25k–£48k" },
    { name: "Polisher & Finisher", description: "Applies final surface treatments - polishing, plating, and quality finishing.", salary: "£25k–£32k" },
    { name: "Engraver", description: "Hand or machine engraves inscriptions, patterns, and decorative details.", salary: "£25k–£40k" },
    { name: "Gemmologist", description: "Identifies, grades, and certifies gemstones for quality and authenticity.", salary: "£25k–£50k" },
    { name: "Master Goldsmith", description: "Senior craftsperson overseeing complex commissions and bespoke pieces.", salary: "£35k–£65k" },
  ]},
  { title: "Sourcing & Supply", icon: Gem, roles: [
    { name: "Diamond Buyer", description: "Sources rough and polished diamonds from global markets and cutting centres.", salary: "£30k–£70k" },
    { name: "Precious Metals Trader", description: "Manages procurement of gold, platinum, and silver at market rates.", salary: "£35k–£80k" },
    { name: "Ethical Sourcing Manager", description: "Ensures responsible supply chains - conflict-free stones, recycled metals, and Fairmined gold.", salary: "£32k–£55k" },
    { name: "Quality Assurance Manager", description: "Inspects finished pieces against hallmarking standards and brand specifications.", salary: "£28k–£48k" },
  ]},
  { title: "Retail & Client Experience", icon: Store, roles: [
    { name: "Sales Consultant", description: "Advises clients in-store on engagement rings, gifts, and fine jewellery purchases.", salary: "£25k–£35k + commission" },
    { name: "Store Manager", description: "Leads a boutique team - targets, visual merchandising, and VIP client relationships.", salary: "£32k–£55k" },
    { name: "Bespoke Consultant", description: "Guides clients through the commission process - from brief to finished piece.", salary: "£28k–£45k" },
    { name: "Visual Merchandiser", description: "Creates compelling window and in-store displays that tell the brand story.", salary: "£25k–£40k" },
    { name: "E-commerce Manager", description: "Runs the online store - product photography, UX, and digital sales strategy.", salary: "£30k–£55k" },
  ]},
  { title: "Marketing & Brand", icon: Megaphone, roles: [
    { name: "Brand Manager", description: "Defines and protects the brand identity across all channels and campaigns.", salary: "£32k–£55k" },
    { name: "PR & Communications Manager", description: "Manages press coverage, celebrity placements, and influencer partnerships.", salary: "£30k–£50k" },
    { name: "Social Media Manager", description: "Creates aspirational content for Instagram, TikTok, and Pinterest.", salary: "£25k–£42k" },
    { name: "Photographer / Art Director", description: "Shoots campaign imagery and lookbooks for collections and e-commerce.", salary: "£28k–£55k" },
    { name: "Content Copywriter", description: "Writes product descriptions, brand stories, and editorial for digital and print.", salary: "£25k–£40k" },
  ]},
  { title: "Business & Operations", icon: Briefcase, roles: [
    { name: "Head of Retail", description: "Oversees multi-store or concession operations and commercial performance.", salary: "£50k–£90k" },
    { name: "Valuer / Appraiser", description: "Values jewellery for insurance, probate, and resale purposes.", salary: "£28k–£55k" },
    { name: "Auction Specialist", description: "Catalogues, estimates, and presents lots at jewellery auctions (Christie's, Sotheby's).", salary: "£30k–£60k" },
    { name: "Finance Manager", description: "Manages budgets, stock valuation, and financial planning for a jewellery business.", salary: "£35k–£65k" },
    { name: "Sustainability Director", description: "Leads ESG strategy - lab-grown diamond positioning, recycled materials, and B Corp goals.", salary: "£45k–£80k" },
  ]},
];

const newsfeed = [
  { title: "Professional Jeweller", url: "https://www.professionaljeweller.com" },
  { title: "The Jeweller", url: "https://www.jeweller.com" },
  { title: "Retail Jeweller", url: "https://www.retail-jeweller.com" },
];

const jewelleryCompanies = [
  { name: "Pragnell", url: "https://www.pragnell.co.uk/careers", founded: "1954", hq: "Stratford-upon-Avon", overview: "Family-owned fine jeweller and Royal Warrant holder - high jewellery, engagement rings, and antique pieces.", valueChainStage: "Retail & Client Experience", profileUrl: "/company/pragnell" },
  { name: "Boodles", url: "https://www.boodles.com/careers", founded: "1798", hq: "Liverpool / London", overview: "One of Britain's oldest family-run fine jewellers - seven generations of luxury craftsmanship.", valueChainStage: "Retail & Client Experience" },
  { name: "Graff", url: "https://www.graff.com/us-en/careers.html", founded: "1960", hq: "London", overview: "Ultra-high-end diamond house - from mine to masterpiece, vertically integrated.", valueChainStage: "Design & Creation" },
  { name: "De Beers", url: "https://www.debeersgroup.com/careers", founded: "1888", hq: "London", overview: "The world's leading diamond company - mining, trading, and retail through De Beers Jewellers.", valueChainStage: "Sourcing & Supply" },
  { name: "Pandora", url: "https://www.pandoragroup.com/careers", founded: "1982", hq: "Copenhagen (UK HQ London)", glassdoor: 3.5, overview: "World's largest jewellery brand by volume - affordable luxury charms, rings, and collections.", valueChainStage: "Retail & Client Experience" },
  { name: "Tiffany & Co.", url: "https://www.tiffany.com/faq/career-faq/where-can-i-apply-for-a-career-at-tiffany/", founded: "1837", hq: "New York (UK stores)", overview: "Iconic luxury jeweller - now part of LVMH, with flagship stores across the UK.", valueChainStage: "Retail & Client Experience" },
  { name: "Cartier", url: "https://www.careers.cartier.com", founded: "1847", hq: "Paris (London boutique)", overview: "One of the world's most prestigious jewellery maisons - high jewellery, watches, and icons like the Love bracelet.", valueChainStage: "Design & Creation" },
  { name: "Bulgari", url: "https://careers.bulgari.com", founded: "1884", hq: "Rome (London boutique)", overview: "Italian luxury house known for bold, colourful jewellery design - part of LVMH.", valueChainStage: "Design & Creation" },
  { name: "Hatton Garden (BID)", url: "https://www.hatton-garden.london", founded: "Historic", hq: "London EC1", overview: "London's historic jewellery quarter - hundreds of independent dealers, setters, and workshops.", valueChainStage: "Craft & Workshop" },
  { name: "Birmingham Jewellery Quarter", url: "https://jewelleryquarter.net", founded: "Historic", hq: "Birmingham", overview: "The UK's largest jewellery-making hub - home to hundreds of workshops producing 40% of UK jewellery.", valueChainStage: "Craft & Workshop" },
  { name: "Signet Jewelers", url: "https://www.signetjewelers.com/careers/", founded: "1949", hq: "Akron (UK stores)", glassdoor: 3.3, overview: "World's largest retailer of diamond jewellery - H. Samuel and Ernest Jones on the UK high street, plus 280+ UK stores.", valueChainStage: "Retail & Client Experience" },
  { name: "Mappin & Webb", url: "https://www.mappinandwebb.com/careers", founded: "1775", hq: "London", overview: "Historic British luxury jeweller - Crown Jeweller and silversmith with Royal Warrants.", valueChainStage: "Retail & Client Experience" },
  { name: "Monica Vinader", url: "https://careers.monicavinader.com/jobs", founded: "2008", hq: "London / Norfolk", overview: "Accessible luxury jewellery brand - demi-fine, personalisation, and strong DTC e-commerce.", valueChainStage: "Marketing & Brand" },
  { name: "Astley Clarke", url: "https://www.astleyclarke.com/join-us", founded: "2006", hq: "London", overview: "British fine jewellery brand - engagement rings, everyday pieces, and digital-first retail.", valueChainStage: "Marketing & Brand" },
  { name: "Christie's (Jewellery Dept)", url: "https://www.christies.com/en/careers", founded: "1766", hq: "London", overview: "World-leading auction house - specialist jewellery department handling record-breaking sales.", valueChainStage: "Business & Operations" },
  { name: "Sotheby's (Jewellery Dept)", url: "https://www.sothebys.com/en/about/careers", founded: "1744", hq: "London", overview: "Global auction house with a prestigious jewellery department - valuations, sales, and private deals.", valueChainStage: "Business & Operations" },
];

const Jewellery = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind jewellery.</p>
        <PodcastPlayer industry="jewellery" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "The Jewellery Cut", description: "In-depth interviews with jewellery designers, brand founders, and industry leaders.", url: "https://www.thejewellerycut.com/podcast" },
            { title: "Gemological Institute Podcast", description: "GIA experts discuss diamonds, coloured stones, and the science behind gems.", url: "https://www.gia.edu" },
            { title: "In Good Company", description: "Monica Vinader's podcast on building a jewellery brand, entrepreneurship, and creative careers.", url: "https://www.monicavinader.com" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="jewellery" />
        <LiveArticles industry="jewellery" fallbackArticles={[
          { title: "The State of UK Fine Jewellery 2026", source: "Professional Jeweller", url: "https://www.professionaljeweller.com" },
          { title: "Lab-Grown vs Natural: The Market Shifts", source: "The Jeweller", url: "https://www.jeweller.com" },
          { title: "How British Jewellery Brands Are Going DTC", source: "Retail Jeweller", url: "https://www.retail-jeweller.com" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="jewellery" />
          <div className="mt-4"><BreakingNewsFeed industry="jewellery" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="jewellery" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["jewellery"] || []} /><div className="mt-12"><YouTubeChannels industry="jewellery" /><TikTokCreators industry="jewellery" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={jewelleryCompanies} />
        <div className="mt-12"><DayInTheLife industry="jewellery" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From gemstone sourcing to Mayfair boutiques - every role in the jewellery industry." stages={jewelleryStages} industry="jewellery" />
          <div className="mt-12"><IndustryRolesLink industry="Jewellery" /></div>
        <ExploreFurther links={[
          { title: "NAJ - Careers in Jewellery", description: "The National Association of Jewellers' career resources, training pathways, and industry insights.", url: "https://www.naj.co.uk/about" },
          { title: "The Goldsmiths' Company - Training", description: "Apprenticeships and training programmes from the historic City of London livery company.", url: "https://www.thegoldsmiths.co.uk/about/" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Jewellery" searchQuery="jewellery gemstone luxury UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Jewellery" slug="jewellery" />
          <CoursesSection industry="jewellery" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Jobs worth their weight in gold<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the jewellery industry.</p>
          <Link to="/marketplace?industry=Jewellery#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={jewelleryStages} industry="Jewellery" companies={jewelleryCompanies} />
        <IndustryCVBuilder industry="Jewellery" stages={jewelleryStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Jewellery"
      description="Diamonds, gold, gemstones, and the skilled craftspeople behind every piece - from Hatton Garden workshops to Mayfair boutiques."
      profile="The UK jewellery industry is worth over £6 billion annually, employing around 40,000 people across design, manufacturing, retail, and auction. From Birmingham's Jewellery Quarter - producing 40% of British jewellery - to London's Hatton Garden and Bond Street, the sector spans artisan bench work, global luxury brands, and fast-growing direct-to-consumer labels."
      tabs={tabs}
    />
  );
};

export default Jewellery;