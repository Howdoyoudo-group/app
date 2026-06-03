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
import { Sparkles, Users, Camera, Megaphone, Briefcase, BarChart3 } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const influencingStages: CareerStage[] = [
  { title: "Creators & Talent", icon: Sparkles, roles: [
    { name: "Content Creator", description: "Builds an audience by posting consistently across TikTok, Instagram, YouTube or Substack - full-time creator economy work.", salary: "£0–£500k+" },
    { name: "Vlogger / YouTuber", description: "Produces long-form video content - channel strategy, filming, editing, monetisation.", salary: "£0–£250k+" },
    { name: "Podcast Host", description: "Hosts and develops a podcast - interviews, story arcs, sponsor reads, and cross-platform distribution.", salary: "£20k–£150k+" },
    { name: "Newsletter Writer", description: "Builds a paid Substack or beehiiv audience - research, writing, and reader retention.", salary: "£0–£200k+" },
    { name: "Live Streamer", description: "Streams gaming, chat, or commentary on Twitch / YouTube - community building and subs revenue.", salary: "£0–£200k+" },
  ]},
  { title: "Production & Craft", icon: Camera, roles: [
    { name: "Video Editor", description: "Edits short-form (Reels/TikTok) and long-form (YouTube) content for creators and brands.", salary: "£25k–£55k" },
    { name: "Videographer", description: "Films creator content, brand shoots and behind-the-scenes - gear, lighting, and on-set direction.", salary: "£26k–£55k" },
    { name: "Photographer", description: "Shoots editorial, lifestyle and product imagery for creator brands and sponsors.", salary: "£24k–£60k" },
    { name: "Producer", description: "Plans shoots end-to-end - schedules, locations, talent briefs, and post-production handover.", salary: "£30k–£60k" },
    { name: "Graphic / Motion Designer", description: "Designs thumbnails, channel art, lower thirds, and motion graphics that drive click-through.", salary: "£26k–£50k" },
  ]},
  { title: "Talent Management & Agencies", icon: Users, roles: [
    { name: "Talent Manager", description: "Manages a roster of creators - deals, brand fit, career strategy, and personal admin.", salary: "£30k–£80k+" },
    { name: "Talent Agent", description: "Negotiates partnership and licensing deals on behalf of creators with brands and platforms.", salary: "£32k–£90k+" },
    { name: "Booker", description: "Coordinates appearances, podcast guesting, events, and speaking slots for talent.", salary: "£26k–£45k" },
    { name: "Talent Scout", description: "Spots emerging creators across TikTok, YouTube and Twitch and signs them to the agency.", salary: "£26k–£42k" },
  ]},
  { title: "Brand Partnerships & Sales", icon: Megaphone, roles: [
    { name: "Influencer Marketing Manager", description: "Runs influencer campaigns brand-side - briefs, vetting, contracts, and performance reporting.", salary: "£32k–£60k" },
    { name: "Partnerships Manager", description: "Builds long-term creator and brand partnerships across platforms.", salary: "£35k–£65k" },
    { name: "Sales / Account Executive", description: "Sells creator inventory and packages to brands and media agencies.", salary: "£28k–£70k+ OTE" },
    { name: "Campaign Manager", description: "Owns delivery of branded content campaigns - timelines, talent, deliverables, sign-off.", salary: "£28k–£48k" },
    { name: "PR & Comms Manager", description: "Handles press, crisis comms and personal brand PR for creators and agencies.", salary: "£32k–£55k" },
  ]},
  { title: "Strategy, Data & Growth", icon: BarChart3, roles: [
    { name: "Social Media Strategist", description: "Develops platform-specific content strategy and growth plans for creators and brands.", salary: "£32k–£60k" },
    { name: "Community Manager", description: "Manages creator communities - Discord, comments, DMs, super-fans and moderation.", salary: "£26k–£42k" },
    { name: "Growth / Analytics Lead", description: "Owns audience growth, A/B testing, retention metrics and platform algorithm insight.", salary: "£40k–£80k" },
    { name: "Paid Social Specialist", description: "Plans and runs paid amplification across Meta, TikTok and YouTube to scale organic content.", salary: "£30k–£55k" },
    { name: "SEO / Discovery Specialist", description: "Optimises titles, thumbnails, descriptions and metadata for discoverability across platforms.", salary: "£28k–£50k" },
  ]},
  { title: "Business & Commercial", icon: Briefcase, roles: [
    { name: "Creator Business Manager", description: "Runs the back office for a creator - finances, contracts, IP, and team coordination.", salary: "£35k–£70k" },
    { name: "Brand Director", description: "Builds and leads a creator-led product or media brand - strategy, P&L, hiring.", salary: "£60k–£120k+" },
    { name: "Legal / Contracts Counsel", description: "Reviews influencer contracts, image rights, ad disclosure and platform terms.", salary: "£45k–£90k" },
    { name: "Operations Manager", description: "Manages day-to-day operations across creator teams, agencies, and production schedules.", salary: "£32k–£55k" },
    { name: "Finance / Accounting Lead", description: "Oversees invoicing, royalties, tax and forecasting for creator businesses and agencies.", salary: "£35k–£65k" },
  ]},
];

const newsfeed = [
  { title: "The Drum", url: "https://www.thedrum.com" },
  { title: "Tubefilter", url: "https://www.tubefilter.com" },
  { title: "Creator Economy by Peter Yang", url: "https://creatoreconomy.so" },
];

const influencingCompanies = [
  { name: "Whalar", url: "https://whalar.com/careers", founded: "2016", hq: "London", overview: "Global creator company representing thousands of creators and running brand campaigns at scale.", valueChainStage: "Talent Management & Agencies" },
  { name: "Gleam Futures", url: "https://www.thetalentmanager.com/companies/gleam-futures", founded: "2010", hq: "London", overview: "Pioneering UK talent agency that built the modern influencer category - Zoella, PointlessBlog, Tanya Burr.", valueChainStage: "Talent Management & Agencies" },
  { name: "YMU Group", url: "https://www.ymugroup.com/careers", founded: "1984", hq: "London", overview: "Global talent management spanning film, TV, music and digital creators - Ant & Dec, Claudia Winkleman.", valueChainStage: "Talent Management & Agencies" },
  { name: "Influencer", url: "https://influencer.com/careers", founded: "2015", hq: "London", overview: "Tech-led creator marketing platform connecting brands to vetted UK and global talent.", valueChainStage: "Brand Partnerships & Sales" },
  { name: "CreatorIQ", url: "https://www.creatoriq.com/careers", founded: "2014", hq: "London / San Francisco", overview: "Enterprise creator marketing platform used by global beauty, fashion and lifestyle brands.", valueChainStage: "Strategy, Data & Growth" },
  { name: "Goat Agency", url: "https://goatagency.com/", founded: "2015", hq: "London", overview: "Global influencer marketing agency - part of WPP, working with hundreds of major brands.", valueChainStage: "Brand Partnerships & Sales" },
  { name: "Billion Dollar Boy", url: "https://billiondollarboy.com/careers", founded: "2014", hq: "London", overview: "Award-winning creator content agency - strategy, creative and production for global brands.", valueChainStage: "Brand Partnerships & Sales" },
  { name: "TikTok UK", url: "https://careers.tiktok.com", founded: "2017", hq: "London", glassdoor: 3.9, overview: "The platform redefining short-form video - careers in creator partnerships, ads, trust & safety.", valueChainStage: "Strategy, Data & Growth" },
  { name: "YouTube (Google)", url: "https://www.google.com/about/careers/applications/", founded: "2005", hq: "London / San Bruno", glassdoor: 4.4, overview: "The world's largest video platform - creator partnerships, monetisation and shorts strategy.", valueChainStage: "Strategy, Data & Growth" },
  { name: "Meta (Instagram)", url: "https://www.metacareers.com/v2/jobs", founded: "2010", hq: "London / Menlo Park", glassdoor: 4.1, overview: "Instagram and Reels - creator products, brand partnerships and emerging creator monetisation.", valueChainStage: "Strategy, Data & Growth" },
  { name: "Substack", url: "https://substack.com/jobs", founded: "2017", hq: "Remote / San Francisco", overview: "Subscription publishing platform powering the modern paid newsletter economy.", valueChainStage: "Creators & Talent" },
  { name: "Patreon", url: "https://www.patreon.com", founded: "2013", hq: "Remote / San Francisco", overview: "Membership platform for creators - recurring revenue from super-fans across podcast, video and writing.", valueChainStage: "Creators & Talent" },
  { name: "Passionfroot", url: "https://www.passionfroot.me", founded: "2021", hq: "Berlin / Remote", overview: "All-in-one platform for creators to manage sponsorships, bookings and payments.", valueChainStage: "Business & Commercial" },
  { name: "The Tab", url: "https://www.thetab.com/uk", founded: "2009", hq: "London", overview: "Youth media network producing short-form social content for Gen Z audiences across the UK.", valueChainStage: "Production & Craft" },
];

const Influencing = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind the creator economy.</p>
        <PodcastPlayer industry="influencing" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "The Colin and Samir Show", description: "The definitive show about the creator economy - interviews with the biggest YouTubers and platform leaders.", url: "https://www.colinandsamir.com" },
            { title: "Creator Science with Jay Clouse", description: "Deep-dive interviews with full-time creators on building audiences, products and businesses.", url: "https://creatorscience.com/podcast/" },
            { title: "Influencer Marketing Talks", description: "Industry conversations on creator strategy, brand partnerships and platform shifts.", url: "https://open.spotify.com/show/5WcBSNDLOQjzD68Kn8GNvr" },
            { title: "The Trapital Podcast", description: "Dan Runcie on the business of music, media and creators - sharp strategy and deal analysis.", url: "https://trapital.co/podcast/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="influencing" />
        <LiveArticles industry="influencing" fallbackArticles={[
          { title: "The Creator Economy Hits $250 Billion", source: "The Drum", url: "https://www.thedrum.com" },
          { title: "How Brands Are Rebuilding Their Influencer Strategies", source: "Tubefilter", url: "https://www.tubefilter.com" },
          { title: "The Rise of the Long-Tail Creator", source: "Creator Economy", url: "https://creatoreconomy.so" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="influencing" />
          <div className="mt-4"><BreakingNewsFeed industry="influencing" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="influencing" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["influencing"] || []} /><div className="mt-12"><YouTubeChannels industry="influencing" /><TikTokCreators industry="influencing" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={influencingCompanies} />
        <div className="mt-12"><DayInTheLife industry="influencing" /></div>
        <div className="mt-12"><IndustryRolesLink industry="Influencing" /></div>
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From solo creators to global agencies - every role in the creator economy." stages={influencingStages} industry="influencing" />
        <ExploreFurther links={[
          { title: "Influencer Marketing Hub - Careers", description: "Industry research, salary benchmarks and career routes across the global creator economy.", url: "https://influencermarketinghub.com" },
          { title: "Passionfroot - For Creators", description: "Tools and resources for creators turning content into a business.", url: "https://www.passionfroot.me" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Influencing" searchQuery="creator economy influencer marketing UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Influencing" slug="influencing" />
          <CoursesSection industry="influencing" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Find Your Most Influential Role Yet<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the creator economy.</p>
          <Link to="/marketplace?industry=Influencing#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={influencingStages} industry="Influencing" companies={influencingCompanies} />
        <IndustryCVBuilder industry="Influencing" stages={influencingStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Influencing"
      description="Creators, agencies, platforms, and the booming creator economy - from TikTok to Substack."
      profile="The creator economy is now valued at over $250 billion globally and growing fast. The UK sits at its centre - home to leading talent agencies, platform headquarters (TikTok, YouTube EMEA, Meta), and a thousands-strong professional creator workforce. Behind every viral post sits a network of editors, producers, talent managers, brand partnerships leads, and growth strategists shaping how brands, audiences, and culture connect."
      industrySlug="influencing"
      tabs={tabs}
    />
  );
};

export default Influencing;
