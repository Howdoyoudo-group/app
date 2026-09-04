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
import { Plane, Train, Hotel, MapPin, Globe, Briefcase } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const travelStages: CareerStage[] = [
  { title: "Airlines & Aviation", icon: Plane, roles: [
    { name: "Pilot", description: "Flies commercial aircraft, managing flight operations and passenger safety.", salary: "£55k–£150k" },
    { name: "Cabin Crew", description: "Delivers in-flight service and safety, managing the passenger experience at altitude.", salary: "£25k–£40k" },
    { name: "Ground Operations Manager", description: "Coordinates airport ground handling, turnaround schedules, and ramp safety.", salary: "£32k–£55k" },
    { name: "Airline Revenue Manager", description: "Optimises pricing and seat inventory across routes to maximise yield.", salary: "£35k–£65k" },
    { name: "Flight Dispatcher", description: "Plans flight routes, fuel loads, and weather assessments for safe departures.", salary: "£28k–£42k" },
    { name: "Aviation Safety Officer", description: "Monitors compliance with CAA/EASA regulations and investigates safety incidents.", salary: "£35k–£60k" },
  ]},
  { title: "Rail & Public Transport", icon: Train, roles: [
    { name: "Train Driver", description: "Operates passenger or freight trains across the UK rail network.", salary: "£45k–£70k" },
    { name: "Station Manager", description: "Manages daily station operations, staffing, and passenger experience.", salary: "£30k–£48k" },
    { name: "Transport Planner", description: "Designs public transport networks, routes, and timetables for maximum coverage.", salary: "£28k–£50k" },
    { name: "Signalling Engineer", description: "Maintains and develops railway signalling systems for safe train movements.", salary: "£35k–£60k" },
    { name: "Bus Operations Manager", description: "Manages fleet scheduling, driver rotas, and route performance for bus operators.", salary: "£30k–£48k" },
    { name: "Accessibility & Inclusion Lead", description: "Ensures transport services are accessible and inclusive for all passengers.", salary: "£32k–£50k" },
  ]},
  { title: "Hotels & Accommodation", icon: Hotel, roles: [
    { name: "Hotel General Manager", description: "Runs an entire hotel operation - P&L, guest experience, staffing, and strategy.", salary: "£40k–£85k" },
    { name: "Revenue & Yield Manager", description: "Sets room rates dynamically based on demand, events, and competitor pricing.", salary: "£32k–£55k" },
    { name: "Front Office Manager", description: "Leads the reception and concierge teams, managing check-in and guest services.", salary: "£26k–£40k" },
    { name: "Housekeeping Manager", description: "Manages cleaning operations, linen supply, and room turnaround standards.", salary: "£25k–£36k" },
    { name: "F&B Director", description: "Oversees hotel restaurants, bars, room service, and events catering.", salary: "£35k–£60k" },
    { name: "Spa & Wellness Manager", description: "Runs the hotel spa, managing therapists, treatments, and revenue targets.", salary: "£28k–£45k" },
  ]},
  { title: "Tour Operators & Experiences", icon: MapPin, roles: [
    { name: "Tour Operator Manager", description: "Designs, packages, and manages holiday itineraries across destinations.", salary: "£28k–£50k" },
    { name: "Travel Consultant", description: "Advises customers on destinations, flights, and packages - in-store or online.", salary: "£25k–£35k" },
    { name: "Destination Manager", description: "Manages supplier relationships and product quality in a specific country or region.", salary: "£30k–£48k" },
    { name: "Experience Designer", description: "Creates immersive travel experiences - food tours, adventures, and cultural itineraries.", salary: "£26k–£42k" },
    { name: "Cruise Director", description: "Manages onboard entertainment, excursions, and guest experience on cruise ships.", salary: "£30k–£55k" },
    { name: "Contracting Manager", description: "Negotiates hotel, airline, and activity rates for tour operator packages.", salary: "£30k–£50k" },
  ]},
  { title: "Travel Tech & Platforms", icon: Globe, roles: [
    { name: "Product Manager (Travel)", description: "Leads product strategy for travel platforms - search, booking, and user experience.", salary: "£45k–£80k" },
    { name: "Software Engineer", description: "Builds and maintains travel booking platforms, APIs, and mobile apps.", salary: "£40k–£85k" },
    { name: "Data Scientist", description: "Analyses booking patterns, pricing models, and customer behaviour to drive growth.", salary: "£40k–£75k" },
    { name: "UX Designer", description: "Designs intuitive booking flows and travel app experiences for web and mobile.", salary: "£35k–£60k" },
    { name: "Trust & Safety Manager", description: "Manages fraud prevention, host verification, and platform integrity.", salary: "£38k–£65k" },
    { name: "Partnerships Manager", description: "Builds strategic alliances with airlines, hotels, and destination marketing organisations.", salary: "£35k–£60k" },
  ]},
  { title: "Business & Commercial", icon: Briefcase, roles: [
    { name: "Commercial Director", description: "Leads revenue strategy, partnerships, and business development across the travel business.", salary: "£60k–£120k" },
    { name: "Marketing Manager", description: "Develops brand campaigns, digital marketing, and content strategy for travel brands.", salary: "£32k–£55k" },
    { name: "PR & Communications Manager", description: "Manages press coverage, influencer trips, and brand storytelling.", salary: "£30k–£50k" },
    { name: "Sustainability Manager", description: "Develops responsible tourism strategies and carbon reduction programmes.", salary: "£32k–£55k" },
    { name: "Finance Manager", description: "Manages budgets, forecasting, and financial reporting for travel operations.", salary: "£35k–£60k" },
    { name: "HR & People Director", description: "Leads talent strategy, culture, and employee experience across the travel business.", salary: "£45k–£80k" },
  ]},
];

const newsfeed = [
  { title: "TTG - Travel Trade Gazette", url: "https://www.ttgmedia.com" },
  { title: "Skift", url: "https://skift.com" },
  { title: "Travolution", url: "https://www.travolution.com" },
];

const travelCompanies = [
  { name: "British Airways", url: "https://careers.ba.com", founded: "1974", hq: "London", glassdoor: 3.8, overview: "The UK's flag carrier airline - long-haul, short-haul, and cargo operations.", valueChainStage: "Airlines & Aviation" },
  { name: "easyJet", url: "https://careers.easyjet.com", founded: "1995", hq: "Luton", glassdoor: 3.5, overview: "Europe's leading low-cost airline with a major UK network.", valueChainStage: "Airlines & Aviation" },
  { name: "Virgin Atlantic", url: "https://careersuk.virgin-atlantic.com", founded: "1984", hq: "Crawley", glassdoor: 3.9, overview: "Premium long-haul airline known for innovation and customer experience.", valueChainStage: "Airlines & Aviation" },
  { name: "Jet2", url: "https://www.jet2careers.com", founded: "2003", hq: "Leeds", glassdoor: 4.0, overview: "UK leisure airline and package holiday operator - fast-growing and award-winning.", valueChainStage: "Airlines & Aviation" },
  { name: "Ryanair", url: "https://careers.ryanair.com", founded: "1984", hq: "Dublin (UK ops)", glassdoor: 3.0, overview: "Europe's largest airline by passenger numbers - ultra-low-cost model.", valueChainStage: "Airlines & Aviation" },
  { name: "Uber", url: "https://www.uber.com/gb/en/careers/", founded: "2009", hq: "London (UK)", glassdoor: 4.0, overview: "Global ride-hailing and mobility platform - also Uber Eats and freight.", valueChainStage: "Travel Tech & Platforms" },
  { name: "Booking.com", url: "https://careers.booking.com", founded: "1996", hq: "Amsterdam (UK office)", glassdoor: 3.9, overview: "The world's leading online travel agency - hotels, flights, and car hire.", valueChainStage: "Travel Tech & Platforms" },
  { name: "loveholidays", url: "https://www.loveholidays.com/about-us/careers.html", founded: "2012", hq: "London", glassdoor: 3.8, overview: "The UK and Ireland's largest online travel agent for package holidays - flights and hotels bundled together at scale.", valueChainStage: "Travel Tech & Platforms" },
  { name: "Airbnb", url: "https://careers.airbnb.com", founded: "2008", hq: "London (UK)", glassdoor: 4.3, overview: "The platform that reinvented accommodation - home stays, experiences, and hosting.", valueChainStage: "Travel Tech & Platforms" },
  { name: "Trainline", url: "https://www.trainlinegroup.com/careers/en/", founded: "1997", hq: "London", glassdoor: 3.7, overview: "Europe's leading rail booking platform - simplifying train and coach travel.", valueChainStage: "Travel Tech & Platforms" },
  { name: "Skyscanner", url: "https://www.skyscanner.net/jobs", founded: "2003", hq: "Edinburgh", glassdoor: 4.2, overview: "Global flight comparison engine - meta-search for flights, hotels, and car hire.", valueChainStage: "Travel Tech & Platforms" },
  { name: "TUI", url: "https://careers.tuigroup.com", founded: "1923", hq: "Luton (UK)", glassdoor: 3.5, overview: "The world's largest tourism group - holidays, airlines, cruises, and hotels.", valueChainStage: "Tour Operators & Experiences" },
  { name: "Avanti West Coast", url: "https://www.avantiwestcoast.co.uk/about-us/careers", founded: "2019", hq: "Birmingham", overview: "Operates the West Coast Main Line - London to Glasgow via Birmingham and Manchester.", valueChainStage: "Rail & Public Transport" },
  { name: "LNER", url: "https://www.lner.co.uk/about-us/careers/", founded: "2018", hq: "York", overview: "Runs the East Coast Main Line - London to Edinburgh via York and Newcastle.", valueChainStage: "Rail & Public Transport" },
  { name: "Transport for London", url: "https://tfl.gov.uk/corporate/careers/", founded: "2000", hq: "London", glassdoor: 3.8, overview: "Manages London's public transport network - Tube, buses, Overground, and cycling.", valueChainStage: "Rail & Public Transport" },
  { name: "National Express", url: "https://careers.nationalexpress.com", founded: "1972", hq: "Birmingham", glassdoor: 3.3, overview: "Major UK coach and bus operator - long-distance travel and local services.", valueChainStage: "Rail & Public Transport" },
  { name: "FirstGroup", url: "https://www.firstgroupplc.com/careers.aspx", founded: "1995", hq: "Aberdeen", glassdoor: 3.2, overview: "One of the UK's largest bus and rail operators - First Bus and GWR.", valueChainStage: "Rail & Public Transport" },
  { name: "IHG Hotels & Resorts", url: "https://careers.ihg.com", founded: "2003", hq: "Windsor", glassdoor: 3.8, overview: "Global hotel group - Holiday Inn, Crowne Plaza, InterContinental, and more.", valueChainStage: "Hotels & Accommodation" },
  { name: "Whitbread (Premier Inn)", url: "https://www.whitbreadcareers.com", founded: "1742", hq: "Dunstable", glassdoor: 3.5, overview: "The UK's largest hotel chain - Premier Inn and hub by Premier Inn.", valueChainStage: "Hotels & Accommodation" },
  { name: "Accor", url: "https://careers.accor.com", founded: "1967", hq: "London (UK)", glassdoor: 3.7, overview: "Global hospitality group - Ibis, Novotel, Sofitel, Fairmont, and more.", valueChainStage: "Hotels & Accommodation" },
  { name: "Marriott International", url: "https://careers.marriott.com", founded: "1927", hq: "London (UK)", glassdoor: 3.8, overview: "World's largest hotel company - Marriott, Sheraton, W Hotels, The Ritz-Carlton.", valueChainStage: "Hotels & Accommodation" },
  { name: "Expedia Group", url: "https://lifeatexpediagroup.com/jobs", founded: "1996", hq: "London (UK)", glassdoor: 3.8, overview: "Travel tech giant - Expedia, Hotels.com, Vrbo, and Trivago.", valueChainStage: "Travel Tech & Platforms" },
];

const Travel = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind travel, transport, and tourism.</p>
        <PodcastPlayer industry="travel" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Skift Podcast", description: "Deep dives into the global travel industry - airlines, hotels, tech, and tourism trends.", url: "https://skift.com/podcast/" },
            { title: "The Travel Diaries", description: "Holly Rubenstein talks to celebrities about their most meaningful travel experiences.", url: "https://www.thetraveldiariespodcast.com" },
            { title: "The Lonely Planet Podcast", description: "Destination stories, travel tips, and the business of exploration from the world's leading travel publisher.", url: "https://www.lonelyplanet.com/podcast" },
            { title: "No Such Thing as a Fish", description: "QI researchers share the most extraordinary facts they've found - often travel and culture stories.", url: "https://www.nosuchthingasafish.com" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="travel" />
        <LiveArticles industry="travel" fallbackArticles={[
          { title: "The Future of UK Aviation After Net Zero", source: "Skift", url: "https://skift.com" },
          { title: "How Train Operators Are Competing for Passengers", source: "TTG", url: "https://www.ttgmedia.com" },
          { title: "Airbnb's Impact on UK High Streets", source: "Travolution", url: "https://www.travolution.com" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="travel" />
          <div className="mt-4"><BreakingNewsFeed industry="travel" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="travel" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["travel"] || []} /><div className="mt-12"><YouTubeChannels industry="travel" /><TikTokCreators industry="travel" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={travelCompanies} />
        <div className="mt-12"><DayInTheLife industry="travel" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From runways to railways, platforms to packages - the people and business behind how the world moves." stages={travelStages} industry="travel" />
          <div className="mt-12"><IndustryRolesLink industry="Travel" /></div>
        <ExploreFurther links={[
          { title: "ABTA - Careers in Travel", description: "The Association of British Travel Agents - career resources, qualifications, and training for the travel industry.", url: "https://www.abta.com/industry-zone/education-and-career-development/careers-in-travel" },
          { title: "Institute of Travel and Tourism", description: "The UK's professional body for travel and tourism - education, CPD, and career pathways.", url: "https://www.itt.co.uk" },
          { title: "NSAR - National Skills Academy for Rail", description: "The UK's rail skills body - apprenticeships, training standards, and career routes into the rail industry.", url: "https://www.nsar.co.uk" },
          { title: "UKHospitality - Careers", description: "Industry body for the UK's hospitality and accommodation sector - workforce resources and career guides.", url: "https://www.ukhospitality.org.uk" },
        ]} />
      </>
    )},
    { id: "attend", label: "Attend", content: <EventsSection industry="Travel" searchQuery="travel transport aviation tourism" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Travel" slug="travel" />
          <CoursesSection industry="travel" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Ready to start a new journey<span className="text-primary">?</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the travel & transport industry.</p>
          <Link to="/marketplace?industry=Travel#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={travelStages} industry="Travel" companies={travelCompanies} />
        <IndustryCVBuilder industry="Travel" stages={travelStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Travel"
      description="Airlines, railways, ride-hailing, hotels, and booking platforms - the people and business behind how the world moves."
      profile="The UK travel and transport industry contributes over £230 billion to the economy and employs more than 3.8 million people across aviation, rail, road, hospitality, and travel technology. From flag carriers and budget airlines to ride-hailing platforms and global hotel groups, the sector spans traditional operators and disruptive tech companies reshaping how we move, stay, and explore."
      tabs={tabs}
    />
  );
};

export default Travel;
