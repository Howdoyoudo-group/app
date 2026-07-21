import { industryVideos } from "@/data/industry-videos";
import VideoShowcase from "@/components/VideoShowcase";
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
import ExploreFurther from "@/components/ExploreFurther";
import DayInTheLife from "@/components/DayInTheLife";
import CoursesSection from "@/components/CoursesSection";
import TheDownload from "@/components/TheDownload";
import YouTubeChannels from "@/components/YouTubeChannels";
import TikTokCreators from "@/components/TikTokCreators";
import SubstackNewsletters from "@/components/SubstackNewsletters";
import PodcastPlayer from "@/components/PodcastPlayer";
import IndustryPageLayout from "@/components/IndustryPageLayout";
import { Car, Factory, Wrench, Truck, Store, Zap } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const carsStages: CareerStage[] = [
  { title: "Design & Engineering", icon: Car, roles: [
    { name: "Vehicle Designer", description: "Creates exterior and interior design concepts for new car models, blending aesthetics with aerodynamics.", salary: "£35k–£65k" },
    { name: "Automotive Engineer", description: "Designs and develops vehicle systems including powertrain, chassis, and electronics.", salary: "£30k–£55k" },
    { name: "EV Powertrain Engineer", description: "Specialises in electric vehicle battery systems, motors, and charging architecture.", salary: "£40k–£70k" },
    { name: "Aerodynamics Engineer", description: "Optimises vehicle shape and airflow for performance, efficiency, and noise reduction.", salary: "£35k–£60k" },
    { name: "CAD/CAE Specialist", description: "Creates detailed 3D models and runs simulations to validate vehicle design and performance.", salary: "£30k–£50k" },
    { name: "Colour & Materials Designer", description: "Selects and develops interior and exterior colours, textures, and trim materials.", salary: "£30k–£50k" },
  ]},
  { title: "Manufacturing", icon: Factory, roles: [
    { name: "Production Manager", description: "Oversees the assembly line, managing output targets, quality, and shift operations.", salary: "£35k–£55k" },
    { name: "Quality Engineer", description: "Ensures vehicles meet quality standards through inspection, testing, and process improvement.", salary: "£30k–£50k" },
    { name: "Robotics Technician", description: "Maintains and programmes automated welding, painting, and assembly robots.", salary: "£28k–£45k" },
    { name: "Supply Chain Manager", description: "Coordinates the flow of thousands of components from global suppliers to the production line.", salary: "£35k–£60k" },
    { name: "Paint Shop Specialist", description: "Manages the vehicle painting process including primers, base coats, and clear coats.", salary: "£26k–£40k" },
    { name: "Lean Manufacturing Lead", description: "Drives continuous improvement and waste reduction across production operations.", salary: "£35k–£55k" },
  ]},
  { title: "Aftersales & Service", icon: Wrench, roles: [
    { name: "Master Technician", description: "Diagnoses and repairs complex vehicle faults, often specialising in a particular brand.", salary: "£32k–£50k" },
    { name: "Service Advisor", description: "The customer-facing role in a dealership workshop, booking services and managing expectations.", salary: "£24k–£35k" },
    { name: "Parts Manager", description: "Manages inventory of replacement parts and accessories for the dealership or group.", salary: "£28k–£42k" },
    { name: "Warranty Administrator", description: "Processes manufacturer warranty claims and ensures compliance with brand standards.", salary: "£24k–£35k" },
    { name: "MOT Tester", description: "Conducts annual roadworthiness inspections to legal standards.", salary: "£26k–£38k" },
    { name: "Body Shop Manager", description: "Runs the accident repair centre, managing technicians, insurance claims, and turnaround times.", salary: "£30k–£48k" },
    { name: "Breakdown Mechanic", description: "Responds to roadside breakdowns, diagnosing and fixing faults on the spot or arranging recovery. Often employed by the AA, RAC, or fleet operators.", salary: "£28k–£42k" },
    { name: "Driving Instructor", description: "Teaches learner drivers in a structured programme leading to their practical test. Most are self-employed through a franchise or run independently.", salary: "£25k–£45k" },
  ]},
  { title: "Distribution & Logistics", icon: Truck, roles: [
    { name: "Fleet Manager", description: "Manages company vehicle fleets, handling procurement, maintenance schedules, and compliance.", salary: "£32k–£55k" },
    { name: "Vehicle Logistics Coordinator", description: "Organises the transport of finished vehicles from factories to dealerships across the UK.", salary: "£26k–£40k" },
    { name: "Import/Export Specialist", description: "Manages customs, compliance, and logistics for vehicles entering and leaving the UK market.", salary: "£28k–£45k" },
    { name: "Used Car Buyer", description: "Sources and values pre-owned vehicles for dealer stock through auctions and part-exchanges.", salary: "£28k–£50k" },
    { name: "Remarketing Manager", description: "Manages the disposal and resale of ex-fleet, ex-lease, and trade-in vehicles.", salary: "£30k–£50k" },
    { name: "Driver", description: "Delivers vehicles, parts, or goods across the UK. Roles range from dealership delivery drivers to HGV operators moving car transporters and fleet vehicles.", salary: "£24k–£40k" },
  ]},
  { title: "Retail & Sales", icon: Store, roles: [
    { name: "Sales Executive", description: "Sells new and used vehicles to retail customers, managing the full buying journey.", salary: "£25k–£50k OTE" },
    { name: "Business Development Manager", description: "Builds relationships with corporate and fleet clients to drive volume sales.", salary: "£35k–£65k OTE" },
    { name: "Finance & Insurance Manager", description: "Structures vehicle finance deals, warranties, and insurance products for customers.", salary: "£30k–£55k OTE" },
    { name: "Dealership General Manager", description: "Runs the entire dealership operation - sales, aftersales, finance, and people.", salary: "£50k–£90k" },
    { name: "Digital Sales Specialist", description: "Manages online sales channels, virtual showrooms, and digital lead generation.", salary: "£28k–£45k" },
    { name: "Brand Experience Manager", description: "Creates immersive customer experiences in showrooms and at brand events.", salary: "£30k–£50k" },
  ]},
  { title: "EV & Future Mobility", icon: Zap, roles: [
    { name: "Charging Infrastructure Manager", description: "Plans and deploys EV charging networks across retail, workplace, and public locations.", salary: "£35k–£60k" },
    { name: "Connected Car Product Manager", description: "Develops in-car digital services including navigation, entertainment, and OTA updates.", salary: "£40k–£70k" },
    { name: "Autonomous Driving Engineer", description: "Works on self-driving technology including sensors, perception, and decision-making systems.", salary: "£45k–£80k" },
    { name: "Battery Cell Scientist", description: "Researches and develops next-generation battery chemistries for longer range and faster charging.", salary: "£40k–£70k" },
    { name: "Mobility Solutions Analyst", description: "Analyses new business models like car subscriptions, ride-sharing, and mobility-as-a-service.", salary: "£30k–£50k" },
    { name: "Sustainability Manager", description: "Leads decarbonisation strategy across manufacturing, supply chain, and vehicle lifecycle.", salary: "£35k–£60k" },
  ]},
];

const newsfeed = [
  { title: "Autocar", url: "https://www.autocar.co.uk" },
  { title: "Auto Express", url: "https://www.autoexpress.co.uk" },
  { title: "Automotive News Europe", url: "https://europe.autonews.com" },
];

const carsCompanies = [
  { name: "Jaguar Land Rover", url: "https://www.jaguarlandrovercareers.com", founded: "2008", hq: "Coventry", glassdoor: 3.9, overview: "Britain's largest car manufacturer, producing Jaguar and Land Rover vehicles. Home to iconic models and a major UK employer with 30,000+ staff.", valueChainStage: "Design & Engineering" },
  { name: "Bentley Motors", url: "https://www.bentleycareers.com", founded: "1919", hq: "Crewe", glassdoor: 4.1, overview: "Ultra-luxury British car maker, handcrafting around 15,000 cars a year. Part of the Volkswagen Group.", valueChainStage: "Manufacturing" },
  { name: "Aston Martin", url: "https://careers.astonmartin.com", founded: "1913", hq: "Gaydon", glassdoor: 3.5, overview: "Iconic British luxury sports car brand with a rich motorsport heritage. Recently expanded with a new factory in Wales.", valueChainStage: "Design & Engineering" },
  { name: "Nissan UK", url: "https://careersatnissan.co.uk", founded: "1986 (Sunderland)", hq: "Sunderland", glassdoor: 3.8, overview: "The Sunderland plant is the UK's largest car factory, producing the Qashqai and Leaf EV. 6,000+ employees.", valueChainStage: "Manufacturing" },
  { name: "BMW Group UK", url: "https://www.bmwgroup.jobs/gb/en.html", founded: "2000 (Oxford)", hq: "Farnborough", glassdoor: 4.0, overview: "Produces MINI at its Oxford plant and Rolls-Royce in Goodwood. A major UK automotive employer.", valueChainStage: "Manufacturing" },
  { name: "Pendragon / Stratstone", url: "https://www.stratstone.com/about-us/careers/", founded: "1989", hq: "Nottingham", glassdoor: 3.3, overview: "One of the UK's largest car dealer groups operating Stratstone and Evans Halshaw dealerships.", valueChainStage: "Retail & Sales" },
  { name: "Arnold Clark", url: "https://www.arnoldclark.com/careers", founded: "1954", hq: "Glasgow", glassdoor: 3.5, overview: "Europe's largest independently owned car dealer, with 200+ branches across the UK.", valueChainStage: "Retail & Sales" },
  { name: "Octopus Electric Vehicles", url: "https://octopusev.com/careers", founded: "2018", hq: "London", overview: "Part of Octopus Energy, offering salary sacrifice EV schemes and making electric cars accessible.", valueChainStage: "EV & Future Mobility" },
  { name: "Halfords", url: "https://careers.halfordscareers.com", founded: "1892", hq: "Redditch", glassdoor: 3.3, overview: "The UK's largest retailer of motoring, cycling, and leisure products, with 400+ stores and Halfords Autocentres for servicing and repairs.", valueChainStage: "Retail & Sales" },
  { name: "AA (Automobile Association)", url: "https://www.theaacareers.co.uk", founded: "1905", hq: "Basingstoke", glassdoor: 3.6, overview: "The UK's largest breakdown cover provider, offering roadside assistance, repairs, and vehicle inspections to millions of members.", valueChainStage: "Aftersales & Service" },
  { name: "RAC", url: "https://www.rac-careers.com", founded: "1897", hq: "Walsall", glassdoor: 3.4, overview: "One of the UK's most recognised motoring organisations, providing breakdown cover, vehicle checks, and insurance to 13 million members.", valueChainStage: "Aftersales & Service" },
  { name: "Kwik Fit", url: "https://www.kwik-fit.com/careers", founded: "1971", hq: "Edinburgh", glassdoor: 3.2, overview: "The UK's leading fast-fit centre chain, specialising in tyres, exhausts, brakes, and MOTs across 600+ centres.", valueChainStage: "Aftersales & Service" },
];

const Cars = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <PodcastPlayer industry="cars" />
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
              { title: "Drive Torque Podcast", description: "UK content creators Joe Achilles and Petrol Ped discuss cars, launches, motorsport, and industry trends.", url: "https://podcasts.apple.com/gb/podcast/drive-torque-podcast/id1682436087" },
              { title: "Autocar Podcast", description: "The UK's oldest car magazine breaks down industry news, reviews, and what's driving the market.", url: "https://www.autocar.co.uk/podcasts" },
              { title: "Fully Charged Show", description: "Clean energy and electric vehicles - exploring the future of transport and sustainability.", url: "https://fullycharged.show/podcasts/" },
              { title: "Motoring Podcast", description: "Weekly car and motoring news, opinion, and industry chat from Alan Bradley and Andrew Clews.", url: "https://motoringpodcast.co.uk/" },
            ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="cars" />
          <LiveArticles industry="cars" fallbackArticles={[
            { title: "UK Car Industry: EV Transition Challenges and Opportunities", source: "Autocar", url: "https://www.autocar.co.uk/car-news" },
            { title: "The Future of British Car Manufacturing Post-Brexit", source: "Auto Express", url: "https://www.autoexpress.co.uk" },
            { title: "How the UK Became a Global Hub for EV Battery Development", source: "The Guardian", url: "https://www.theguardian.com/business/automotive-industry" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="cars" />
            <div className="mt-4">
              <BreakingNewsFeed industry="cars" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="cars" />
          </div>
        </>
      ),
    },
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["cars"] || []} /><div className="mt-12"><YouTubeChannels industry="cars" /><TikTokCreators industry="cars" /></div></>,
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={carsCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="cars" />
          </div>
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From design studio to showroom - the roles that power every stage of the automotive industry." stages={carsStages} industry="cars" />
          <div className="mt-12">
            <IndustryRolesLink industry="Cars" />
          </div>
          <ExploreFurther links={[
            { title: "IMI Motor Careers", description: "Explore career paths across the motor industry with the Institute of the Motor Industry.", url: "https://tide.theimi.org.uk/motor-careers" },
            { title: "SMMT - Workforce of the Future", description: "The Society of Motor Manufacturers and Traders on skills, talent, and the future automotive workforce.", url: "https://www.smmt.co.uk/automotive-intelligence/workforce-of-the-future/" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Cars" searchQuery="automotive industry UK" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Cars" slug="cars" />
          <CoursesSection industry="cars" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Jobs to get you motoring<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the automotive industry.</p>
            <Link to="/marketplace?industry=Cars#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={carsStages} industry="Cars" companies={carsCompanies} />
        <IndustryCVBuilder industry="Cars" stages={carsStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Cars"
      description="From design studios to dealership floors - the engineering, manufacturing, and business behind the UK's automotive industry."
      profile="The UK automotive industry contributes over £70 billion to the economy and employs around 800,000 people across manufacturing, retail, aftersales, and the rapidly growing electric vehicle sector. From Jaguar Land Rover in the Midlands to Nissan in Sunderland, it remains one of Britain's most significant industrial sectors - now undergoing its biggest transformation since the invention of the motor car."
      tabs={tabs}
    />
  );
};

export default Cars;
