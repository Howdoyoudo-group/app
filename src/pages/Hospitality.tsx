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
import { Lightbulb, ChefHat, ConciergeBell, Truck, Megaphone, Settings } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import hospitalityCareerMap from "@/assets/hospitality-career-map.png";
import PodcastGrid from "@/components/PodcastGrid";

const hospitalityStages: CareerStage[] = [
  { title: "Concept & Design", icon: Lightbulb, roles: [
    { name: "Restaurant Consultant", description: "Advises on concept development, menu strategy, and operational setup for new food & drink ventures.", salary: "£35k–£70k" },
    { name: "Interior Designer", description: "Designs the look and feel of restaurant and bar spaces.", salary: "£28k–£55k" },
    { name: "Menu Developer", description: "Creates and tests menus that balance creativity, cost, and operational efficiency.", salary: "£30k–£50k" },
    { name: "Concept Director", description: "Defines the overall identity of a hospitality venue.", salary: "£40k–£75k" },
    { name: "Brand Strategist", description: "Develops the brand positioning, voice, and visual identity for hospitality businesses.", salary: "£35k–£60k" },
    { name: "Licensing Consultant", description: "Advises on alcohol licensing, planning permissions, and regulatory compliance.", salary: "£30k–£55k" },
  ]},
  { title: "Kitchen", icon: ChefHat, roles: [
    { name: "Head Chef", description: "Leads the kitchen, creating menus, managing the brigade, and maintaining food quality standards.", salary: "£32k–£60k" },
    { name: "Sous Chef", description: "Second-in-command in the kitchen.", salary: "£26k–£38k" },
    { name: "Pastry Chef", description: "Specialises in desserts, bread, and pastry production.", salary: "£25k–£38k" },
    { name: "Kitchen Porter", description: "Maintains kitchen cleanliness and supports chefs.", salary: "£25k–£29k" },
    { name: "Food Safety Manager", description: "Ensures the kitchen meets food hygiene regulations.", salary: "£28k–£45k" },
    { name: "Development Chef", description: "Creates and tests new dishes and products.", salary: "£30k–£50k" },
    { name: "Kitchen Manager", description: "Manages kitchen operations including staffing, inventory, ordering, and cost control.", salary: "£28k–£42k" },
  ]},
  { title: "Front of House", icon: ConciergeBell, roles: [
    { name: "Restaurant Manager", description: "Runs the front-of-house operation.", salary: "£28k–£45k" },
    { name: "Maître d'", description: "Oversees the dining room, managing reservations, seating, and guest relations.", salary: "£30k–£50k" },
    { name: "Head Waiter", description: "Leads the floor team during service.", salary: "£25k–£32k" },
    { name: "Sommelier", description: "Curates the wine list and advises guests on pairings.", salary: "£26k–£45k" },
    { name: "Barista", description: "Prepares espresso-based drinks and other beverages.", salary: "£25k–£28k" },
    { name: "Bartender / Mixologist", description: "Creates and serves cocktails, manages the bar.", salary: "£25k–£32k" },
    { name: "Host / Receptionist", description: "Greets guests and manages reservations.", salary: "£25k–£26k" },
  ]},
  { title: "Supply Chain", icon: Truck, roles: [
    { name: "Procurement Manager", description: "Sources and purchases food, beverages, and supplies.", salary: "£30k–£52k" },
    { name: "Food Buyer", description: "Selects and negotiates with food suppliers.", salary: "£28k–£48k" },
    { name: "Supplier Manager", description: "Manages relationships with key suppliers.", salary: "£28k–£45k" },
    { name: "Inventory Controller", description: "Tracks stock levels, manages ordering, and minimises waste.", salary: "£25k–£35k" },
    { name: "Delivery Coordinator", description: "Schedules and manages deliveries to venues.", salary: "£25k–£32k" },
    { name: "Sustainability Manager", description: "Develops waste reduction and ethical sourcing initiatives.", salary: "£30k–£50k" },
  ]},
  { title: "Marketing", icon: Megaphone, roles: [
    { name: "Marketing Manager", description: "Plans and executes marketing campaigns.", salary: "£30k–£55k" },
    { name: "PR Manager", description: "Manages press coverage and media events.", salary: "£30k–£55k" },
    { name: "Social Media Manager", description: "Creates content and manages the brand's social media presence.", salary: "£26k–£42k" },
    { name: "Events Coordinator", description: "Plans and delivers private events, pop-ups, and promotional activities.", salary: "£25k–£38k" },
    { name: "Content Photographer", description: "Shoots food, interiors, and lifestyle imagery.", salary: "£25k–£45k" },
    { name: "Community Manager", description: "Builds local community engagement.", salary: "£25k–£38k" },
    { name: "Partnerships Manager", description: "Develops collaborations with brands and cultural partners.", salary: "£30k–£50k" },
  ]},
  { title: "Operations", icon: Settings, roles: [
    { name: "Operations Director", description: "Oversees all operational aspects of a hospitality group.", salary: "£50k–£90k" },
    { name: "General Manager", description: "Runs a venue end-to-end.", salary: "£35k–£60k" },
    { name: "Area Manager", description: "Manages multiple venues within a region.", salary: "£40k–£65k" },
    { name: "Revenue Manager", description: "Optimises pricing, covers, and yield.", salary: "£32k–£55k" },
    { name: "HR Manager", description: "Handles recruitment, training, and retention.", salary: "£30k–£50k" },
    { name: "Compliance Officer", description: "Ensures the business meets regulations.", salary: "£28k–£45k" },
    { name: "Finance Controller", description: "Manages financial reporting, budgeting, and cost control.", salary: "£38k–£65k" },
  ]},
];

const newsfeed = [
  { title: "Propel Hospitality", url: "https://propelhospitality.com" },
  { title: "QSR Media UK", url: "https://qsrmedia.co.uk" },
  { title: "The Caterer", url: "https://www.thecaterer.com" },
  { title: "Big Hospitality", url: "https://www.bighospitality.co.uk" },
  { title: "Eater London", url: "https://london.eater.com" },
];

const hospitalityCompanies = [
  { name: "Diageo", url: "https://www.diageo.com/en/careers", founded: "1997", hq: "London", glassdoor: 4.0, overview: "The world's largest spirits company - Guinness, Johnnie Walker, Tanqueray, Smirnoff.", valueChainStage: "Manufacturing & FMCG" },
  { name: "Unilever", url: "https://careers.unilever.com", founded: "1929", hq: "London", glassdoor: 4.0, overview: "Global FMCG giant - Ben & Jerry's, Hellmann's, Magnum, Knorr.", valueChainStage: "Manufacturing & FMCG" },
  { name: "Nestlé UK", url: "https://www.nestle.co.uk/en-gb/jobs", founded: "1866", hq: "Vevey (UK: Gatwick)", glassdoor: 3.9, overview: "The world's largest food company - KitKat, Nescafé, San Pellegrino.", valueChainStage: "Manufacturing & FMCG" },
  { name: "PepsiCo UK", url: "https://www.pepsicojobs.com/main/jobs?location=United+Kingdom", founded: "1965", hq: "New York (UK: Reading)", glassdoor: 4.0, overview: "Walkers, Quaker, Tropicana, Doritos - snacking and beverages.", valueChainStage: "Manufacturing & FMCG" },
  { name: "Coca-Cola Europacific Partners", url: "https://www.cocacolaep.com/careers/", founded: "2016", hq: "Uxbridge", glassdoor: 3.9, overview: "The world's largest Coca-Cola bottler - manufacturing and distributing across Europe.", valueChainStage: "Manufacturing & FMCG" },
  { name: "Associated British Foods", url: "https://www.abf.co.uk/careers", founded: "1935", hq: "London", glassdoor: 3.6, overview: "Kingsmill, Twinings, Ovaltine, Silver Spoon - and Primark's parent company.", valueChainStage: "Manufacturing & FMCG" },
  { name: "Premier Foods", url: "https://www.premierfoods.co.uk/careers/", founded: "1975", hq: "St Albans", glassdoor: 3.5, overview: "Mr Kipling, Bisto, Ambrosia, Batchelors - iconic British food brands.", valueChainStage: "Manufacturing & FMCG" },
  { name: "Heineken UK", url: "https://www.theheinekencompany.com/our-company/uk", founded: "1864", hq: "Amsterdam (UK: Edinburgh)", glassdoor: 3.8, overview: "The UK's largest pub company (Star Pubs) and brewer - Heineken, Birra Moretti, Beavertown.", valueChainStage: "Brewing & Beverages" },
  { name: "Molson Coors UK", url: "https://www.molsoncoors.com/careers", founded: "2005", hq: "Burton upon Trent", glassdoor: 3.7, overview: "Major brewer - Carling, Coors, Doom Bar, Cobra, Aspall Cyder.", valueChainStage: "Brewing & Beverages" },
  { name: "AB InBev UK", url: "https://www.ab-inbev.com/", founded: "2008", hq: "Leuven (UK: London)", glassdoor: 3.8, overview: "The world's largest brewer - Budweiser, Stella Artois, Corona, Camden Town Brewery.", valueChainStage: "Brewing & Beverages" },
  { name: "Brakes (Sysco)", url: "https://syscogbjobs.co.uk", founded: "1958", hq: "Ashford", glassdoor: 3.2, overview: "The UK's largest foodservice distributor.", valueChainStage: "Supply Chain" },
  { name: "Compass Group", url: "https://www.compass-group.co.uk/jobs/", founded: "1941", hq: "Chertsey", glassdoor: 3.4, overview: "The world's largest contract catering company.", valueChainStage: "Supply Chain" },
  { name: "Five Guys", url: "https://www.fiveguys.co.uk/careers", founded: "1986", hq: "Virginia (UK: London)", glassdoor: 3.5, trustpilot: 2.8, profileUrl: "/company/five-guys", overview: "A family-founded burger chain obsessed with simplicity.", valueChainStage: "Restaurant & QSR" },
  { name: "Gail's", url: "https://jobs.gailsbread.co.uk", founded: "2005", hq: "London", glassdoor: 3.8, trustpilot: 2.3, overview: "Neighbourhood bakery chain that grew from a single shop to 130+ locations.", valueChainStage: "Restaurant & QSR" },
  { name: "Soho House", url: "https://www.sohohouse.com/careers", founded: "1995", hq: "London", glassdoor: 3.2, trustpilot: 2.7, profileUrl: "/company/soho-house", overview: "A members' club empire spanning 40+ Houses globally.", valueChainStage: "Hotels & Members' Clubs" },
  { name: "The Wolseley Hospitality Group", url: "https://thewolseleyhospitalitygroup.com/careers/", founded: "2003", hq: "London", glassdoor: 3.5, trustpilot: 4.2, overview: "The group behind The Wolseley, The Delaunay, and Brasserie Zédel.", valueChainStage: "Restaurant & QSR" },
  { name: "Dishoom", url: "https://www.dishoom.com/careers/", founded: "2010", hq: "London", glassdoor: 4.0, trustpilot: 4.3, overview: "Bombay-inspired restaurant group.", valueChainStage: "Restaurant & QSR" },
  { name: "Domino's", url: "https://corporate.dominos.co.uk/careers", founded: "1960", hq: "Milton Keynes", glassdoor: 3.4, trustpilot: 2.1, overview: "The UK's leading pizza delivery chain.", valueChainStage: "Restaurant & QSR" },
  { name: "Pret A Manger", url: "https://www.pret.co.uk/en-GB/pret-jobs", founded: "1986", hq: "London", glassdoor: 3.6, trustpilot: 1.9, overview: "Freshly-made food and coffee chain with 550+ shops.", valueChainStage: "Restaurant & QSR" },
  { name: "McDonald's", url: "https://people.mcdonalds.co.uk/opportunities/restaurant/crew-member?places_position=51.51437%2C-0.09229&places_query=London%2C%20Greater%20London%2C%20England&country%5B0%5D=United%20Kingdom", founded: "1955", hq: "Chicago (UK: London)", glassdoor: 3.5, trustpilot: 1.8, overview: "The world's largest restaurant chain with 1,400+ UK locations.", valueChainStage: "Restaurant & QSR" },
  { name: "KFC", url: "https://www.kfc.co.uk/careers", founded: "1952", hq: "Louisville (UK: Woking)", glassdoor: 3.4, trustpilot: 1.6, overview: "The UK's biggest fried chicken chain with 1,000+ restaurants.", valueChainStage: "Restaurant & QSR" },
  { name: "Nando's", url: "https://www.nandos.jobs", founded: "1987", hq: "Johannesburg (UK: London)", glassdoor: 3.7, trustpilot: 2.4, overview: "Peri-peri chicken restaurant chain with 470+ UK sites and a cult employer brand.", valueChainStage: "Restaurant & QSR" },
  { name: "Whitbread / Premier Inn", url: "https://careers.whitbread.co.uk", founded: "1742", hq: "Dunstable", glassdoor: 3.6, trustpilot: 4.5, overview: "The UK's largest hotel and restaurant operator - Premier Inn, Beefeater, Brewers Fayre.", valueChainStage: "Hotels & Members' Clubs" },
  { name: "SSP Group", url: "https://careers.foodtravelexperts.com/", founded: "2006", hq: "London", glassdoor: 3.3, overview: "Operates food and beverage outlets in airports and railway stations across 35 countries - Upper Crust, Caffè Ritazza, Camden Food Co.", valueChainStage: "Restaurant & QSR" },
];

const Hospitality = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the mechanics behind restaurants, bars, and the food & drink economy.</p>
        <PodcastPlayer industry="hospitality" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Hospitality Daily", description: "The #1 hotel industry podcast.", url: "https://podcast.hospitalitydaily.com/" },
            { title: "The Hospitality Hangout", description: "Food service, investment trends, and insider stories.", url: "https://www.thehospitalityhangout.com/" },
            { title: "The Restaurant Guy Podcast", description: "Real talk on running restaurants and bars.", url: "https://www.thehospitalityhangout.com/" },
            { title: "Turning the Tables", description: "How chefs, hoteliers, and operators navigate margins and culture.", url: "https://www.bighospitality.co.uk" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="food-drink" />
        <LiveArticles industry="food-drink" fallbackArticles={[
          { title: "Propel Hospitality - Industry News & Insight", source: "Propel Hospitality", url: "https://propelhospitality.com" },
          { title: "QSR Media UK - Quick Service Restaurant News", source: "QSR Media UK", url: "https://qsrmedia.co.uk" },
          { title: "What Are the Trends and Challenges for UK Hospitality in 2026?", source: "Keystone Law", url: "https://www.keystonelaw.com/keynotes/what-are-the-trends-and-challenges-for-uk-hospitality-in-2026-navigating-uncertainty-while-redesigning-value" },
          { title: "Toast Report Reveals UK Hospitality Predictions for 2026", source: "Expert Market", url: "https://www.expertmarket.com/uk/food-beverage/hospitality-predictions-for-2026" },
          { title: "UK Hospitality Faces Rates Reset and Wage Rises", source: "The Drinks Business", url: "https://www.thedrinksbusiness.com/2026/01/uk-hospitality-faces-rates-reset-and-wage-rise/" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="food & drink" />
          <div className="mt-4"><BreakingNewsFeed industry="food-drink" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="hospitality" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["hospitality"] || []} /><div className="mt-12"><YouTubeChannels industry="hospitality" /><TikTokCreators industry="hospitality" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={hospitalityCompanies} />
        <div className="mt-12"><DayInTheLife industry="hospitality" /></div>
        <div className="mt-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2>
          <img src={hospitalityCareerMap} alt="The Food and Drink Value Chain" className="w-full rounded-sm" loading="lazy" />
        </div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From concept to customer - the roles behind every restaurant, bar, and kitchen." stages={hospitalityStages} industry="hospitality" />
          <div className="mt-12"><IndustryRolesLink industry="Hospitality" /></div>
        <ExploreFurther links={[
          { title: "Institute of Hospitality", description: "The professional body for the hospitality industry - qualifications, career support, and networking.", url: "https://www.instituteofhospitality.org/careers/" },
          { title: "Springboard - Hospitality Careers", description: "The charity supporting people into careers across hospitality, leisure, and tourism.", url: "https://springboard.uk.net" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Food & Drink" searchQuery="food drink hospitality" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Hospitality" slug="hospitality" />
          <CoursesSection industry="food & drink" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Tasty roles served up for you<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the food & drink industry.</p>
          <Link to="/marketplace?industry=Food+%26+Drink#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={hospitalityStages} industry="Food & Drink" companies={hospitalityCompanies} />
        <IndustryCVBuilder industry="Hospitality" stages={hospitalityStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Food & Drink" description="Restaurants, bars, breweries, and the people behind the plate - how the food and drink industry really runs." profile="The UK food and drink industry covers restaurants, bars, catering, and production, forming one of the country's largest economic sectors. It employs approximately 2.5 to 3 million people, making it a major source of jobs across all regions and skill levels. Fast-paced and margin-sensitive, it sits at the centre of culture, consumption, and everyday life." tabs={tabs} />;
};

export default Hospitality;
