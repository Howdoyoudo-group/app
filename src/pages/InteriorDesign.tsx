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
import { FileText, Lightbulb, Ruler, ShoppingBag, Hammer, CheckCircle } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import interiorDesignCareerMap from "@/assets/interiordesign-career-map.png";
import PodcastGrid from "@/components/PodcastGrid";

const interiorDesignStages: CareerStage[] = [
  { title: "Brief & Research", icon: FileText, roles: [
    { name: "Client Liaison", description: "Manages client relationships, gathering briefs and ensuring design intent is understood.", salary: "£26k–£40k" },
    { name: "Design Researcher", description: "Researches materials, trends, and precedents to inform design concepts.", salary: "£25k–£38k" },
    { name: "Space Planner", description: "Analyses and optimises spatial layouts for functionality and flow.", salary: "£28k–£45k" },
    { name: "Project Coordinator", description: "Supports the project manager with scheduling and documentation.", salary: "£25k–£35k" },
    { name: "Sustainability Consultant", description: "Advises on sustainable materials and environmental certifications.", salary: "£30k–£52k" },
    { name: "Brand Strategist", description: "Aligns interior design with brand identity for commercial projects.", salary: "£32k–£55k" },
  ]},
  { title: "Concept", icon: Lightbulb, roles: [
    { name: "Interior Designer", description: "Creates design concepts and schemes for residential, commercial, or hospitality spaces.", salary: "£26k–£50k" },
    { name: "Creative Director", description: "Leads the creative vision across projects.", salary: "£50k–£90k" },
    { name: "Colour Consultant", description: "Advises on colour palettes and finishes.", salary: "£28k–£45k" },
    { name: "Mood Board Designer", description: "Creates visual presentations communicating design direction.", salary: "£25k–£35k" },
    { name: "3D Visualiser", description: "Produces photorealistic 3D renders and walkthroughs.", salary: "£28k–£48k" },
    { name: "Lighting Designer", description: "Designs lighting schemes that enhance spatial quality.", salary: "£28k–£50k" },
    { name: "Set Designer", description: "Designs sets for events, exhibitions, film, and television.", salary: "£26k–£45k" },
  ]},
  { title: "Design Development", icon: Ruler, roles: [
    { name: "Senior Designer", description: "Leads project design development.", salary: "£35k–£55k" },
    { name: "CAD Technician", description: "Produces detailed technical drawings.", salary: "£25k–£38k" },
    { name: "Technical Designer", description: "Develops detailed design specifications.", salary: "£28k–£48k" },
    { name: "BIM Modeller", description: "Creates Building Information Models.", salary: "£28k–£45k" },
    { name: "Specification Writer", description: "Writes detailed product and material specifications.", salary: "£28k–£42k" },
    { name: "FF&E Designer", description: "Selects and specifies furniture, fixtures, and equipment.", salary: "£28k–£48k" },
    { name: "Architect Liaison", description: "Coordinates between interior design and architecture teams.", salary: "£30k–£50k" },
  ]},
  { title: "Procurement", icon: ShoppingBag, roles: [
    { name: "Procurement Manager", description: "Sources and purchases materials and furniture.", salary: "£30k–£50k" },
    { name: "Furniture Buyer", description: "Selects and orders furniture pieces.", salary: "£26k–£42k" },
    { name: "Fabric Sourcer", description: "Sources upholstery fabrics and soft furnishings.", salary: "£25k–£38k" },
    { name: "Art Consultant", description: "Curates and commissions artwork for interiors.", salary: "£28k–£50k" },
    { name: "Antiques Dealer", description: "Sources and sells antique and vintage pieces.", salary: "£25k–£60k" },
    { name: "Sample Librarian", description: "Manages the studio's material sample library.", salary: "£25k–£30k" },
    { name: "Trade Account Manager", description: "Manages B2B relationships with design studios.", salary: "£26k–£42k" },
  ]},
  { title: "Build & Install", icon: Hammer, roles: [
    { name: "Project Manager", description: "Manages construction and fit-out phase.", salary: "£35k–£60k" },
    { name: "Site Manager", description: "Oversees day-to-day activity on the construction site.", salary: "£32k–£55k" },
    { name: "Joiner / Carpenter", description: "Builds and installs bespoke joinery and cabinetry.", salary: "£28k–£45k" },
    { name: "Painter & Decorator", description: "Applies specialist paint finishes and wallpapers.", salary: "£25k–£40k" },
    { name: "Upholsterer", description: "Covers and restores furniture with fabric and leather.", salary: "£25k–£38k" },
    { name: "Electrician", description: "Installs lighting, power, and AV systems.", salary: "£30k–£48k" },
    { name: "AV Installer", description: "Installs audio-visual and smart home technology.", salary: "£28k–£45k" },
  ]},
  { title: "Handover & Styling", icon: CheckCircle, roles: [
    { name: "Stylist", description: "Dresses and accessorises completed spaces.", salary: "£25k–£42k" },
    { name: "Snagging Inspector", description: "Inspects completed work for defects.", salary: "£26k–£40k" },
    { name: "Photographer", description: "Captures professional images of completed interiors.", salary: "£25k–£50k" },
    { name: "PR & Marketing", description: "Promotes completed projects through press and social media.", salary: "£28k–£48k" },
    { name: "Property Stager", description: "Furnishes and styles properties for sale or rental.", salary: "£25k–£40k" },
    { name: "Maintenance Planner", description: "Creates maintenance schedules post-handover.", salary: "£26k–£38k" },
    { name: "Client Aftercare Manager", description: "Manages ongoing client relationships after project completion.", salary: "£26k–£42k" },
  ]},
];

const newsfeed = [
  { title: "Dezeen", url: "https://www.dezeen.com/interiors/" },
  { title: "Wallpaper*", url: "https://www.wallpaper.com/interiors" },
  { title: "Elle Decoration", url: "https://www.elledecoration.co.uk" },
];

const interiorDesignCompanies = [
  { name: "IKEA", url: "https://www.ikea.com/gb/en/this-is-ikea/work-with-us/", founded: "1943", hq: "Leiden (UK: multiple)", glassdoor: 3.8, trustpilot: 1.5, overview: "The world's largest furniture retailer, known for flat-pack design and affordable home furnishings.", valueChainStage: "Product & Retail" },
  { name: "Dunelm", url: "https://corporate.dunelm.com/careers/", founded: "1979", hq: "Leicester", glassdoor: 3.5, trustpilot: 4.2, overview: "The UK's leading homewares retailer with over 180 stores.", valueChainStage: "Retail & Homewares" },
  { name: "John Lewis & Partners", url: "https://www.jlpjobs.com/", founded: "1864", hq: "London", glassdoor: 3.8, trustpilot: 2.5, overview: "Employee-owned department store renowned for home and interiors.", valueChainStage: "Retail & Homewares" },
  { name: "Next Home", url: "https://careers.next.co.uk/", founded: "1864", hq: "Leicester", glassdoor: 3.5, trustpilot: 4.0, overview: "Major high-street retailer with a growing home and interiors range.", valueChainStage: "Retail & Homewares" },
  { name: "Vinterior", url: "https://www.vinterior.co/about", founded: "2016", hq: "London", glassdoor: 4.0, overview: "Online marketplace for vintage and antique furniture, championing circular design.", valueChainStage: "Sourcing & Supply" },
  { name: "Gensler", url: "https://www.gensler.com/careers", founded: "1965", hq: "San Francisco (UK: London)", glassdoor: 3.9, overview: "The world's largest architecture and design firm.", valueChainStage: "Concept & Design" },
  { name: "Soho House Design", url: "https://www.sohohouse.com/careers", founded: "1995", hq: "London", glassdoor: 3.2, overview: "The in-house design team behind every Soho House.", valueChainStage: "Concept & Design" },
  { name: "Farrow & Ball", url: "https://www.farrow-ball.com", founded: "1946", hq: "Dorset", glassdoor: 3.6, trustpilot: 3.8, overview: "Premium paint and wallpaper manufacturer.", valueChainStage: "Materials & Finishes" },
  { name: "Havwoods", url: "https://havwoods.com/uk/careers/", founded: "1975", hq: "Lancashire", glassdoor: 3.7, trustpilot: 4.5, overview: "Specialist wood flooring supplier to the design trade.", valueChainStage: "Materials & Finishes" },
  { name: "Tom Dixon", url: "https://www.tomdixon.net/en_gb/jobs", founded: "2002", hq: "London", glassdoor: 3.6, trustpilot: 2.2, profileUrl: "/company/tom-dixon", overview: "A design brand spanning lighting, furniture, and accessories.", valueChainStage: "Product & Manufacturing" },
  { name: "Sonder Living", url: "https://www.sonderliving.com/careers", founded: "2015", hq: "London", glassdoor: 3.8, trustpilot: 4.6, overview: "A trade-focused furniture and accessories brand.", valueChainStage: "Sourcing & Supply" },
  { name: "Swoon", url: "https://www.swooneditions.com", founded: "2012", hq: "London", overview: "Online-only direct-to-consumer furniture retailer selling sofas, dining and living furniture direct from craftspeople at below-retail prices.", valueChainStage: "Retail & Homewares" },
];

const InteriorDesign = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes unpacking the business behind interior design studios, trade shows, and the luxury homes market.</p>
        <PodcastPlayer industry="interior-design" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "The Great Indoors", description: "Sophie Robinson and Kate Watson-Smyth talk interiors, colour, and design trends.", url: "https://www.thegreatindoorspodcast.co.uk/" },
            { title: "Design Matters with Debbie Millman", description: "Long-running interviews with designers and creatives.", url: "https://www.designmattersmedia.com/" },
            { title: "Material Matters", description: "Grant Gibson explores the stories behind materials and craft.", url: "https://www.materialmatterspodcast.com/" },
            { title: "The Modern House Podcast", description: "Architecture, interiors, and the meaning of home.", url: "https://www.themodernhouse.com/journal/podcast/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="interior-design" />
        <LiveArticles industry="interior-design" fallbackArticles={[
          { title: "The Business of Interior Design: How Studios Actually Make Money", source: "Dezeen", url: "https://www.dezeen.com/interiors/" },
          { title: "Why the UK Interior Design Market Is Booming", source: "Financial Times", url: "https://www.ft.com/stream/design" },
          { title: "How Social Media Changed Interior Design Forever", source: "Wallpaper*", url: "https://www.wallpaper.com/interiors" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="interior design" />
          <div className="mt-4"><BreakingNewsFeed industry="interior-design" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="interior-design" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["interior-design"] || []} /><div className="mt-12"><YouTubeChannels industry="interior-design" /><TikTokCreators industry="interior-design" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={interiorDesignCompanies} />
        <div className="mt-12"><DayInTheLife industry="interior-design" /></div>
        <div className="mt-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2>
          <img src={interiorDesignCareerMap} alt="The Interior Design Value Chain" className="w-full rounded-sm" loading="lazy" />
        </div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From brief to handover - the roles that shape every space." stages={interiorDesignStages} industry="interior-design" />
          <div className="mt-12"><IndustryRolesLink industry="Interior Design" /></div>
        <ExploreFurther links={[
          { title: "BIID - Become an Interior Designer", description: "The British Institute of Interior Design's guide to qualifications, accreditation, and career development.", url: "https://biid.org.uk" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Interior Design" searchQuery="interior design" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Interior Design" slug="interior-design" />
          <CoursesSection industry="interior design" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Well designed jobs, with real style<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the interior design industry.</p>
          <Link to="/marketplace?industry=Interior+Design#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={interiorDesignStages} industry="Interior Design" companies={interiorDesignCompanies} />
        <IndustryCVBuilder industry="Interior Design" stages={interiorDesignStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Interior Design" description="From mood boards to mansions - the creative studios, trade suppliers, and trends shaping the spaces we live in." profile="The interior design industry spans residential, commercial, and hospitality spaces, combining creative vision with technical execution. In the UK, it employs around 150,000 to 200,000 people across studios, suppliers, and project roles. It shapes the environments people live and work in, influenced by trends, budgets, and client needs." tabs={tabs} />;
};

export default InteriorDesign;
