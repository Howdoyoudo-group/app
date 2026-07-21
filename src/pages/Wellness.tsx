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
import { Dumbbell, Heart, Pill, Shirt, Users, TrendingUp, ShoppingBag } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const wellnessStages: CareerStage[] = [
  { title: "Gyms & Fitness", icon: Dumbbell, roles: [
    { name: "Gym Manager", description: "Runs day-to-day operations of a gym or fitness club.", salary: "£28k–£45k" },
    { name: "Personal Trainer", description: "Designs and delivers tailored exercise programmes.", salary: "£22k–£50k" },
    { name: "Group Fitness Instructor", description: "Leads group exercise classes.", salary: "£20k–£35k" },
    { name: "Membership Sales Advisor", description: "Drives new member sign-ups and retention.", salary: "£22k–£35k" },
    { name: "Fitness Operations Manager", description: "Oversees multiple gym sites.", salary: "£35k–£55k" },
    { name: "Strength & Conditioning Coach", description: "Works with athletes and clients to improve performance.", salary: "£25k–£45k" },
  ]},
  { title: "Health & Wellbeing", icon: Heart, roles: [
    { name: "Nutritionist", description: "Provides evidence-based dietary advice.", salary: "£25k–£45k" },
    { name: "Wellness Coach", description: "Guides clients through holistic lifestyle changes.", salary: "£24k–£40k" },
    { name: "Yoga / Pilates Teacher", description: "Teaches mind-body movement classes.", salary: "£20k–£40k" },
    { name: "Sports Massage Therapist", description: "Uses soft tissue techniques for recovery.", salary: "£22k–£38k" },
    { name: "Mental Health & Wellbeing Lead", description: "Develops workplace mental health programmes.", salary: "£30k–£50k" },
    { name: "Holistic Therapist", description: "Offers complementary therapies.", salary: "£20k–£35k" },
  ]},
  { title: "Supplements & Nutrition", icon: Pill, roles: [
    { name: "Product Development Manager", description: "Leads the creation of new supplement formulas.", salary: "£35k–£60k" },
    { name: "Regulatory Affairs Specialist", description: "Ensures products comply with regulations.", salary: "£30k–£50k" },
    { name: "Quality Assurance Manager", description: "Manages testing and manufacturing standards.", salary: "£32k–£50k" },
    { name: "Brand Manager", description: "Owns the brand positioning and growth of a supplement line.", salary: "£35k–£60k" },
    { name: "E-Commerce Manager", description: "Runs the direct-to-consumer online channel.", salary: "£30k–£50k" },
    { name: "Sports Nutritionist", description: "Advises athletes on performance nutrition.", salary: "£28k–£50k" },
  ]},
  { title: "Activewear & Apparel", icon: Shirt, roles: [
    { name: "Activewear Designer", description: "Designs performance and lifestyle apparel.", salary: "£28k–£50k" },
    { name: "Buyer", description: "Selects and negotiates product ranges.", salary: "£28k–£50k" },
    { name: "Visual Merchandiser", description: "Creates in-store and online displays.", salary: "£24k–£38k" },
    { name: "Supply Chain Coordinator", description: "Manages the production pipeline.", salary: "£26k–£42k" },
    { name: "Sustainability Manager", description: "Develops ethical sourcing initiatives.", salary: "£35k–£55k" },
  ]},
  { title: "Retail & Wellness", icon: ShoppingBag, roles: [
    { name: "Pharmacy Dispenser", description: "Assists pharmacists by preparing prescriptions.", salary: "£20k–£25k" },
    { name: "Beauty Advisor", description: "Provides expert skincare and beauty advice.", salary: "£20k–£26k" },
    { name: "Store Manager", description: "Leads a health and beauty retail store.", salary: "£28k–£42k" },
    { name: "Pharmacist", description: "Provides clinical services and health consultations.", salary: "£35k–£50k" },
    { name: "Buying Manager", description: "Selects product ranges across wellness categories.", salary: "£35k–£55k" },
    { name: "Category Manager", description: "Owns a product category P&L.", salary: "£40k–£60k" },
  ]},
  { title: "Community & Experience", icon: Users, roles: [
    { name: "Community Manager", description: "Builds communities around fitness brands.", salary: "£26k–£42k" },
    { name: "Events Coordinator", description: "Plans and delivers fitness events and retreats.", salary: "£24k–£38k" },
    { name: "Content Creator", description: "Produces content for wellness brands.", salary: "£24k–£42k" },
    { name: "Social Media Manager", description: "Manages social accounts for wellness brands.", salary: "£26k–£45k" },
    { name: "Studio Manager", description: "Runs a boutique fitness or wellness studio.", salary: "£26k–£40k" },
  ]},
  { title: "Business & Growth", icon: TrendingUp, roles: [
    { name: "Franchise Development Manager", description: "Manages gym or studio franchise expansion.", salary: "£40k–£70k" },
    { name: "Head of Partnerships", description: "Builds strategic partnerships.", salary: "£45k–£75k" },
    { name: "Data Analyst", description: "Analyses member behaviour and retention data.", salary: "£30k–£50k" },
    { name: "Wellness Tech Product Manager", description: "Leads development of fitness apps and wearables.", salary: "£40k–£70k" },
    { name: "CEO / Founder", description: "Leads a wellness business.", salary: "£50k–£150k+" },
  ]},
];

const newsfeed = [
  { title: "Welltodo", url: "https://www.welltodo.co" },
  { title: "Health Club Management", url: "https://www.healthclubmanagement.co.uk" },
  { title: "Men's Health UK", url: "https://www.menshealth.com/uk" },
];

const wellnessCompanies = [
  { name: "David Lloyd Clubs", url: "https://careers.davidlloyd.co.uk", founded: "1982", hq: "Hatfield", glassdoor: 3.7, overview: "Premium health and fitness club operator.", valueChainStage: "Gyms & Fitness" },
  { name: "Virgin Active", url: "https://careers.virginactive.co.uk/jobs/home/", founded: "1999", hq: "London", glassdoor: 3.5, overview: "Premium gym and wellness brand.", valueChainStage: "Gyms & Fitness" },
  { name: "The Gym Group", url: "https://www.tggplc.com", founded: "2007", hq: "Croydon", glassdoor: 3.3, overview: "Low-cost, 24/7 gym chain.", valueChainStage: "Gyms & Fitness" },
  { name: "PureGym", url: "https://www.puregym.com/careers/", founded: "2009", hq: "Leeds", glassdoor: 3.4, overview: "The UK's largest gym chain.", valueChainStage: "Gyms & Fitness" },
  { name: "Barry's", url: "https://www.barrys.com/careers", founded: "1998", hq: "Los Angeles (UK: London)", glassdoor: 3.6, trustpilot: 4.0, overview: "Boutique fitness brand known for Red Room workouts.", valueChainStage: "Gyms & Fitness" },
  { name: "Third Space", url: "https://www.thirdspace.london/careers/", founded: "2001", hq: "London", glassdoor: 3.9, trustpilot: 4.5, overview: "A premium fitness club.", valueChainStage: "Gyms & Fitness" },
  { name: "Myprotein", url: "https://www.thg.com/jobs", founded: "2004", hq: "Manchester", glassdoor: 3.3, overview: "Europe's largest online sports nutrition brand.", valueChainStage: "Supplements & Nutrition" },
  { name: "Huel", url: "https://uk.huel.com/pages/careers", founded: "2015", hq: "Tring", glassdoor: 3.8, trustpilot: 4.0, overview: "A complete nutrition brand.", valueChainStage: "Supplements & Nutrition" },
  { name: "Gymshark", url: "https://careers.gymshark.com", founded: "2012", hq: "Solihull", glassdoor: 3.8, overview: "Fitness apparel brand built on social media.", valueChainStage: "Activewear & Apparel" },
  { name: "Lululemon", url: "https://info.lululemon.com/careers", founded: "1998", hq: "Vancouver (UK: London)", glassdoor: 4.0, overview: "Premium activewear brand.", valueChainStage: "Activewear & Apparel" },
  { name: "Tala", url: "https://www.wearetala.com/pages/careers", founded: "2019", hq: "London", overview: "Sustainable activewear brand.", valueChainStage: "Activewear & Apparel" },
  { name: "Boots", url: "https://www.boots.jobs", founded: "1849", hq: "Nottingham", glassdoor: 3.5, trustpilot: 1.9, overview: "The UK's largest health and beauty retailer.", valueChainStage: "Retail & Wellness" },
  { name: "Holland & Barrett", url: "https://careers.hollandandbarrett.com", founded: "1870", hq: "Nuneaton", glassdoor: 3.3, trustpilot: 1.8, overview: "Europe's largest health food retailer.", valueChainStage: "Retail & Wellness" },
  { name: "Superdrug", url: "https://www.superdrug.jobs", founded: "1966", hq: "Croydon", glassdoor: 3.4, trustpilot: 1.6, overview: "Health and beauty retailer.", valueChainStage: "Retail & Wellness" },
  { name: "GLL (Better)", url: "https://www.gll.org/careers", founded: "1993", hq: "London", glassdoor: 3.4, overview: "The UK's largest charitable social enterprise running leisure centres and gyms - operates 270+ Better-branded sites.", valueChainStage: "Gyms & Fitness" },
  { name: "JD Gyms", url: "https://careers.jdgyms.co.uk", founded: "2014", hq: "Bury", glassdoor: 3.5, overview: "Premium-value gym chain owned by JD Sports - one of the UK's fastest-growing operators.", valueChainStage: "Gyms & Fitness" },
];

const Wellness = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind gyms, supplements, and the wellness economy.</p>
        <PodcastPlayer industry="wellness" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "The Fitness Business Podcast", description: "How gym owners and fitness entrepreneurs build, scale, and survive.", url: "https://www.fitnessbusinesspodcast.com/" },
            { title: "Mind Pump", description: "Personal trainers breaking down fitness industry myths.", url: "https://www.mindpumpmedia.com" },
            { title: "The IMAGE Wellness Project", description: "IMAGE Media's podcast on the wellness industry - interviews exploring intentional wellness culture and business.", url: "https://shows.acast.com/the-wellness-project-podcast" },
            { title: "Barbell Logic", description: "Running a gym, building a brand, and the real economics of strength training.", url: "https://barbell-logic.com/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="wellness" />
        <LiveArticles industry="wellness" fallbackArticles={[
          { title: "UK Fitness Industry Report 2026", source: "ukactive", url: "https://www.ukactive.com/" },
          { title: "The Rise of Boutique Fitness Studios", source: "Welltodo", url: "https://www.welltodo.co/" },
          { title: "How the Supplement Industry Really Works", source: "Men's Health", url: "https://www.menshealth.com/uk/nutrition/" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="wellness" />
          <div className="mt-4"><BreakingNewsFeed industry="wellness" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="wellness" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["wellness"] || []} /><div className="mt-12"><YouTubeChannels industry="wellness" /><TikTokCreators industry="wellness" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={wellnessCompanies} />
        <div className="mt-12"><DayInTheLife industry="wellness" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From the gym floor to the boardroom - every role in the wellness value chain." stages={wellnessStages} industry="wellness" />
          <div className="mt-12"><IndustryRolesLink industry="Wellness" /></div>
        <ExploreFurther links={[
          { title: "CIMSPA - Careers in Sport & Physical Activity", description: "The Chartered Institute for the Management of Sport and Physical Activity - career pathways and professional standards.", url: "https://www.cimspa.co.uk/careers" },
          { title: "ukactive - Workforce", description: "The sector body for the UK's physical activity industry, with workforce development resources.", url: "https://www.ukactive.com" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Wellness" searchQuery="wellness fitness industry" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Wellness" slug="wellness" />
          <CoursesSection industry="wellness" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">A healthy selection of new jobs<span className="text-primary">…</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the wellness industry.</p>
          <Link to="/marketplace?industry=Wellness#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={wellnessStages} industry="Wellness" companies={wellnessCompanies} />
        <IndustryCVBuilder industry="Wellness" stages={wellnessStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Wellness" description="Gyms, personal training, supplements, activewear, and the booming industry keeping the world moving." profile="The wellness industry covers gyms, fitness, personal training, supplements, and broader health-focused lifestyle services. In the UK, it employs approximately 300,000 to 400,000 people across a rapidly growing market. Driven by consumer focus on health and performance, it blends physical activity, branding, and community engagement." tabs={tabs} />;
};

export default Wellness;
