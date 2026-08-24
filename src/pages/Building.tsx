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
import { HardHat, Ruler, Truck, Building2, Users, BarChart3 } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";

const buildingStages: CareerStage[] = [
  {
    title: "Design & Architecture",
    icon: Ruler,
    roles: [
      { name: "Architect", description: "Designs buildings and oversees delivery from concept through planning to completion.", salary: "£30k–£80k" },
      { name: "Architectural Technician", description: "Produces detailed technical drawings and manages planning applications.", salary: "£25k–£45k" },
      { name: "Structural Engineer", description: "Ensures buildings and infrastructure are safe and structurally sound.", salary: "£35k–£70k" },
      { name: "Interior Architect", description: "Designs the internal spaces, layouts, and specifications of buildings.", salary: "£30k–£55k" },
    ],
  },
  {
    title: "Surveying & Commercial",
    icon: BarChart3,
    roles: [
      { name: "Quantity Surveyor", description: "Manages construction costs from tender through final account.", salary: "£30k–£75k" },
      { name: "Estimator", description: "Prepares tender bids and cost forecasts for new construction projects.", salary: "£32k–£60k" },
      { name: "Building Surveyor", description: "Inspects buildings, advises on defects, and oversees maintenance works.", salary: "£28k–£60k" },
      { name: "Commercial Manager", description: "Leads the commercial team, managing contracts, claims, and risk.", salary: "£55k–£90k" },
    ],
  },
  {
    title: "Site Management & Engineering",
    icon: HardHat,
    roles: [
      { name: "Site Manager", description: "Runs day-to-day operations on site — programme, safety, quality, and subcontractors.", salary: "£40k–£70k" },
      { name: "Civil Engineer", description: "Plans and oversees infrastructure — roads, drainage, foundations, and groundworks.", salary: "£30k–£65k" },
      { name: "Project Manager", description: "Delivers construction projects on time and budget, coordinating all teams.", salary: "£45k–£90k" },
      { name: "MEP Engineer", description: "Coordinates mechanical, electrical, and plumbing services within a building.", salary: "£35k–£65k" },
      { name: "Health & Safety Manager", description: "Ensures site safety compliance, risk assessment, and accident prevention.", salary: "£40k–£65k" },
    ],
  },
  {
    title: "Trades & Skilled Labour",
    icon: Truck,
    roles: [
      { name: "Bricklayer", description: "Lays brick, block, and stone for residential and commercial structures.", salary: "£28k–£45k" },
      { name: "Carpenter/Joiner", description: "Installs timber frames, roofs, staircases, doors, and fitted joinery.", salary: "£26k–£45k" },
      { name: "Plasterer", description: "Applies plaster and render finishes to internal and external walls.", salary: "£26k–£42k" },
      { name: "Groundworker", description: "Excavates, lays foundations, and installs drainage and utilities.", salary: "£25k–£42k" },
      { name: "Roofer", description: "Installs, repairs, and maintains roofing systems including tiles, flat, and felt.", salary: "£26k–£45k" },
    ],
  },
  {
    title: "Development & Land",
    icon: Building2,
    roles: [
      { name: "Land Buyer", description: "Identifies and acquires land for residential or commercial development.", salary: "£40k–£80k" },
      { name: "Planning Manager", description: "Manages planning applications and negotiations with local authorities.", salary: "£45k–£75k" },
      { name: "Development Manager", description: "Oversees a development from land purchase through planning to delivery.", salary: "£55k–£95k" },
    ],
  },
  {
    title: "Leadership & Procurement",
    icon: Users,
    roles: [
      { name: "Contracts Manager", description: "Manages multiple construction contracts, subcontractors, and programme delivery.", salary: "£55k–£85k" },
      { name: "Buyer", description: "Procures materials and subcontract packages at best cost and quality.", salary: "£30k–£55k" },
      { name: "Director", description: "Leads business units, bids for major projects, and drives strategic growth.", salary: "£80k–£150k+" },
    ],
  },
];

const newsfeed = [
  { title: "Construction News", url: "https://www.constructionnews.co.uk" },
  { title: "Building.co.uk", url: "https://www.building.co.uk" },
  { title: "CIOB News", url: "https://www.ciob.org/industry/news" },
];

const buildingCompanies = [
  { name: "Balfour Beatty", founded: "1909", hq: "London", overview: "One of the UK's largest construction groups, delivering infrastructure and building projects across the public and private sectors.", url: "https://www.balfourbeatty.com/careers", glassdoor: 3.6, valueChainStage: "Site Management & Engineering" },
  { name: "Berkeley Group", founded: "1976", hq: "Cobham", overview: "Premium residential developer delivering large regeneration projects across London and the South East.", url: "https://www.berkeleygroup.co.uk/careers", glassdoor: 3.9, valueChainStage: "Development & Land" },
  { name: "Galliford Try", founded: "1908", hq: "Uxbridge", overview: "Mid-tier contractor working across building, infrastructure, and environment sectors.", url: "https://www.gallifordtry.co.uk/careers", glassdoor: 3.5, valueChainStage: "Site Management & Engineering" },
  { name: "Kier Group", founded: "1928", hq: "Solihull", overview: "Major UK contractor covering infrastructure, buildings, and civil engineering with a large public sector portfolio.", url: "https://www.kier.co.uk/careers", glassdoor: 3.4, valueChainStage: "Site Management & Engineering" },
  { name: "Laing O'Rourke", founded: "1978", hq: "Dartford", overview: "International contractor known for complex engineering, modular construction, and major infrastructure projects.", url: "https://www.laingorourke.com/careers", glassdoor: 3.7, valueChainStage: "Site Management & Engineering" },
  { name: "Mace", founded: "1990", hq: "London", overview: "Global construction and consultancy firm delivering some of the UK's most complex projects including the Shard and Battersea Power Station.", url: "https://www.macegroup.com/careers", glassdoor: 4.0, valueChainStage: "Site Management & Engineering" },
  { name: "Morgan Sindall", founded: "1977", hq: "London", overview: "Construction and regeneration group working across fit-out, infrastructure, and affordable housing.", url: "https://www.morgansindall.com/careers", glassdoor: 3.9, valueChainStage: "Site Management & Engineering" },
  { name: "Persimmon", founded: "1972", hq: "York", overview: "One of the UK's largest housebuilders, delivering over 14,000 homes per year across the country.", url: "https://www.persimmonhomes.com/corporate/careers", glassdoor: 3.3, valueChainStage: "Development & Land" },
  { name: "Taylor Wimpey", founded: "1880", hq: "High Wycombe", overview: "Major UK housebuilder operating across 24 regional businesses, building homes of all types nationwide.", url: "https://www.taylorwimpey.co.uk/careers", glassdoor: 3.5, valueChainStage: "Development & Land" },
  { name: "Vistry Group", founded: "2020", hq: "Kings Hill", overview: "Created from the merger of Bovis Homes and Galliford Try's housebuilding arm, now a major affordable housing provider.", url: "https://www.vistrycareers.co.uk/", glassdoor: 3.4, valueChainStage: "Development & Land" },
  { name: "Willmott Dixon", founded: "1852", hq: "Letchworth", overview: "Independent contractor and developer working across education, health, leisure, and residential sectors.", url: "https://www.willmottdixon.co.uk/careers", glassdoor: 4.1, valueChainStage: "Site Management & Engineering" },
  { name: "Wates Group", founded: "1897", hq: "Leatherhead", overview: "Family-owned contractor working across residential, commercial, and public sector construction.", url: "https://www.wates.co.uk/careers", glassdoor: 3.8, valueChainStage: "Site Management & Engineering" },
];

const Building = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-6">Coming soon — episodes unpacking how the UK construction industry really works.</p>
          <PodcastPlayer industry="building" />
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
          <PodcastGrid podcasts={[
            { title: "UK Construction Podcast", description: "Candid conversations with construction leaders, architects, and engineers sharing insights from across the industry.", url: "https://open.spotify.com/show/7nvj1kVrm1YaKL6nIa4u3E" },
            { title: "Construction Talk", description: "Hosted by construction journalist Peter Haddock — interviews with leaders pushing the UK building industry forward.", url: "https://open.spotify.com/show/6CZeJsdGQilE1aIT2d8NGv" },
            { title: "Built Environment Networking", description: "Leading property and construction podcast covering development, planning, and infrastructure.", url: "https://www.built-environment-networking.com/podcasts/" },
            { title: "Women in Construction", description: "Celebrating and championing women across the built environment — hosted by Michaela Wain.", url: "https://open.spotify.com/show/2ddhoPpKLez8dH1QDLHQkd" },
          ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="building" />
          <LiveArticles industry="building" fallbackArticles={[
            { title: "UK Construction Output Rises for Third Quarter", source: "Construction News", url: "https://www.constructionnews.co.uk" },
            { title: "The Skills Gap Threatening UK Housebuilding", source: "Building.co.uk", url: "https://www.building.co.uk" },
            { title: "How Modern Methods of Construction Are Changing the Industry", source: "CIOB", url: "https://www.ciob.org" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="building" />
            <div className="mt-4">
              <BreakingNewsFeed industry="building" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="building" />
          </div>
        </>
      ),
    },
    {
      id: "watch",
      label: "Watch",
      content: (
        <>
          <VideoShowcase heading="Unpacking on Screen" clips={industryVideos["building"] || []} />
          <div className="mt-12">
            <YouTubeChannels industry="building" />
            <TikTokCreators industry="building" />
          </div>
        </>
      ),
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={buildingCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="building" />
          </div>
          
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From blueprint to building — every role in the construction value chain." stages={buildingStages} industry="building" />
          <div className="mt-12"><IndustryRolesLink industry="Building" /></div>
          <ExploreFurther links={[
            { title: "CIOB — Chartered Institute of Building", description: "The professional body for construction management — qualifications, membership, and career resources.", url: "https://www.ciob.org/careers" },
            { title: "RICS Careers", description: "The Royal Institution of Chartered Surveyors — routes into surveying, development, and project management.", url: "https://www.rics.org/uk/careers-in-land-property-construction" },
            { title: "CITB — Construction Industry Training Board", description: "Industry training levy body — apprenticeships, grants, and career pathways.", url: "https://www.citb.co.uk/careers-in-construction/" },
            { title: "GoConstruct", description: "The official careers portal for the UK construction industry — roles, routes, and inspiration.", url: "https://www.goconstruct.org" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Building" searchQuery="construction industry events UK" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Building" slug="building" />
          <CoursesSection industry="building" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Live construction jobs<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the building and construction industry.</p>
            <Link to="/marketplace?industry=Building#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={buildingStages} industry="Building" companies={buildingCompanies} />
          <IndustryCVBuilder industry="Building" stages={buildingStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Building"
      description="Construction sites, architects, quantity surveyors, and the £160 billion UK industry shaping every skyline."
      profile="The UK construction industry is one of the country's largest employers, with over 2.7 million people working across housebuilding, civil engineering, commercial development, and infrastructure. From a site manager running a new housing estate to a structural engineer designing a railway bridge, construction spans hands-on trades, technical roles, and commercial careers — all tied together by the shared goal of making things that last."
      tabs={tabs}
    />
  );
};

export default Building;
