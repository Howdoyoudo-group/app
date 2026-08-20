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
import { PenTool, Mic, SlidersHorizontal, Truck, Megaphone, Music as MusicIcon } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import musicCareerMap from "@/assets/music-career-map.png";
import PodcastGrid from "@/components/PodcastGrid";

const musicStages: CareerStage[] = [
  { title: "Creation", icon: PenTool, roles: [
    { name: "Songwriter", description: "Writes lyrics and melodies for artists.", salary: "£25k–£60k" },
    { name: "Composer", description: "Creates original music for film, TV, games, and advertising.", salary: "£25k–£70k" },
    { name: "Lyricist", description: "Specialises in writing song lyrics.", salary: "£25k–£50k" },
    { name: "Music Producer", description: "Shapes the sound and direction of a recording.", salary: "£25k–£80k" },
    { name: "Beat Maker", description: "Creates instrumental tracks and beats.", salary: "£25k–£50k" },
    { name: "Arranger", description: "Adapts and orchestrates compositions.", salary: "£25k–£50k" },
    { name: "Session Musician", description: "Performs on recordings and live sessions.", salary: "£25k–£50k" },
  ]},
  { title: "Recording", icon: Mic, roles: [
    { name: "Recording Engineer", description: "Captures audio performances in the studio.", salary: "£25k–£45k" },
    { name: "Studio Manager", description: "Runs the day-to-day operations of a recording studio.", salary: "£28k–£48k" },
    { name: "Session Vocalist", description: "Provides vocal performances for recordings.", salary: "£25k–£45k" },
    { name: "Vocal Coach", description: "Trains singers to improve technique and performance.", salary: "£25k–£50k" },
    { name: "A&R Scout", description: "Identifies and signs new talent for record labels.", salary: "£25k–£50k" },
    { name: "Demo Producer", description: "Produces rough recordings for label consideration.", salary: "£25k–£38k" },
    { name: "Studio Assistant", description: "Supports engineers and producers in the studio.", salary: "£25k–£32k" },
  ]},
  { title: "Production", icon: SlidersHorizontal, roles: [
    { name: "Mixing Engineer", description: "Balances and blends tracks into a cohesive mix.", salary: "£25k–£55k" },
    { name: "Mastering Engineer", description: "Applies the final polish to a mix.", salary: "£28k–£55k" },
    { name: "Sound Designer", description: "Creates original sound effects and sonic textures.", salary: "£26k–£50k" },
    { name: "Audio Programmer", description: "Develops custom audio tools and plugins.", salary: "£30k–£55k" },
    { name: "Post-Production Audio", description: "Edits and processes audio for final release.", salary: "£26k–£45k" },
    { name: "Remix Artist", description: "Reworks existing tracks into new versions.", salary: "£25k–£50k" },
    { name: "Foley Artist", description: "Creates real-world sound effects for productions.", salary: "£25k–£40k" },
  ]},
  { title: "Distribution", icon: Truck, roles: [
    { name: "Distribution Manager", description: "Oversees delivery of music to platforms and retailers.", salary: "£30k–£55k" },
    { name: "Digital Aggregator", description: "Manages uploads to Spotify, Apple Music, etc.", salary: "£25k–£40k" },
    { name: "Sync Licensing Manager", description: "Places music in film, TV, adverts, and games.", salary: "£30k–£60k" },
    { name: "Royalties Analyst", description: "Tracks and analyses royalty payments across territories.", salary: "£26k–£42k" },
    { name: "Label Manager", description: "Runs the operations of a record label.", salary: "£30k–£55k" },
    { name: "Copyright Administrator", description: "Registers works with collection societies like PRS and ensures correct royalty allocation.", salary: "£25k–£38k" },
    { name: "Music Lawyer", description: "Advises on contracts, rights, and disputes across publishing, recording, and live.", salary: "£35k–£80k" },
    { name: "Metadata Specialist", description: "Ensures accurate metadata for music releases across platforms.", salary: "£25k–£38k" },
  ]},
  { title: "Marketing", icon: Megaphone, roles: [
    { name: "Artist Manager", description: "Guides an artist's career.", salary: "£25k–£80k" },
    { name: "PR & Publicity", description: "Generates press coverage for artists and releases.", salary: "£25k–£48k" },
    { name: "Social Media Manager", description: "Creates and manages social content.", salary: "£25k–£42k" },
    { name: "Playlist Strategist", description: "Pitches and secures playlist placements.", salary: "£26k–£45k" },
    { name: "Brand Partnership Manager", description: "Develops commercial partnerships.", salary: "£30k–£55k" },
    { name: "Content Creator", description: "Produces visual and written content.", salary: "£25k–£40k" },
    { name: "Music Journalist", description: "Writes reviews and features for publications.", salary: "£25k–£42k" },
  ]},
  { title: "Live & Exhibition", icon: MusicIcon, roles: [
    { name: "Tour Manager", description: "Coordinates all logistics for touring artists.", salary: "£28k–£55k" },
    { name: "Live Sound Engineer", description: "Mixes and manages audio for live performances.", salary: "£25k–£45k" },
    { name: "Promoter", description: "Books and promotes live music events.", salary: "£25k–£60k" },
    { name: "Festival Programmer", description: "Curates the line-up for music festivals.", salary: "£30k–£55k" },
    { name: "Stage Manager", description: "Manages the running of a stage during live events.", salary: "£26k–£42k" },
    { name: "Booking Agent", description: "Secures live performance opportunities for artists.", salary: "£25k–£60k" },
    { name: "Venue Manager", description: "Runs the day-to-day operations of a live music venue.", salary: "£28k–£48k" },
  ]},
];

const newsfeed = [
  { title: "Music Week", url: "https://www.musicweek.com" },
  { title: "NME", url: "https://www.nme.com" },
  { title: "DJ Mag", url: "https://djmag.com" },
];

const musicCompanies = [
  { name: "Abbey Road Studios", url: "https://www.umusiccareers.com/jobs/abbeyroad", founded: "1931", hq: "London", glassdoor: 4.2, overview: "The world's most famous recording studio.", valueChainStage: "Recording" },
  { name: "Spotify", url: "https://www.lifeatspotify.com", founded: "2006", hq: "Stockholm (UK: London)", glassdoor: 4.1, overview: "The world's largest music streaming platform.", valueChainStage: "Distribution" },
  { name: "Secretly Group", url: "https://secretlygroup.com", founded: "1996", hq: "Bloomington, Indiana", glassdoor: 3.8, overview: "An independent label family representing Bon Iver and Phoebe Bridgers.", valueChainStage: "Distribution" },
  { name: "Broadwick", url: "https://broadwick.com/careers/", founded: "2008", hq: "London", glassdoor: 3.6, trustpilot: 3.4, overview: "The company behind Printworks, Drumsheds, and immersive venues.", valueChainStage: "Live & Exhibition" },
  { name: "Dice", url: "https://dice.fm/jobs", founded: "2014", hq: "London", glassdoor: 4.0, trustpilot: 4.7, profileUrl: "/company/dice", overview: "Mobile-first ticketing platform.", valueChainStage: "Live & Exhibition" },
  { name: "WME (William Morris)", url: "https://www.wmeagency.com/careers", founded: "1898", hq: "Los Angeles (UK: London)", glassdoor: 3.8, overview: "One of the world's largest talent agencies.", valueChainStage: "Marketing" },
  { name: "Live Nation", url: "https://www.livenationentertainment.com/careers/", founded: "2010", hq: "Beverly Hills (UK: London)", glassdoor: 3.8, overview: "The world's largest live entertainment company - concerts, festivals, and venues.", valueChainStage: "Live & Exhibition" },
  { name: "Superstruct Entertainment", url: "https://www.superstruct.com", founded: "2017", hq: "London", glassdoor: 3.5, overview: "Europe's largest festival group - Parklife, Kendal Calling, Wilderness, and more.", valueChainStage: "Live & Exhibition" },
  { name: "Universal Music Group", url: "https://www.universalmusic.com/careers/", founded: "1934", hq: "Santa Monica (UK: London)", glassdoor: 3.9, overview: "The world's largest music company - home to Island, Polydor, Decca, Abbey Road, and more.", valueChainStage: "Distribution" },
  { name: "Sony Music", url: "https://careers.sonymusic.com/jobs/", founded: "1929", hq: "New York (UK: London)", glassdoor: 4.0, overview: "Major label group - RCA, Columbia, Ministry of Sound Recordings.", valueChainStage: "Distribution" },
  { name: "Warner Music Group", url: "https://www.wmg.com/careers", founded: "1958", hq: "New York (UK: London)", glassdoor: 3.8, overview: "Major label group - Atlantic, Parlophone, Warner Records.", valueChainStage: "Distribution" },
  { name: "BMG", url: "https://www.bmg.com/careers", founded: "2008", hq: "Berlin (UK: London)", glassdoor: 3.7, overview: "Modern rights management and label - a fair-trade alternative to the Big 3.", valueChainStage: "Distribution" },
  { name: "MTV", url: "https://www.paramountgroupcareers.com", founded: "1981", hq: "New York (UK: London)", overview: "Global music and pop culture media brand - production, commissioning and on-air content.", valueChainStage: "Marketing" },
  { name: "Glastonbury Festival", url: "https://www.glastonburyfestivals.co.uk/about-us/work-with-us/", founded: "1970", hq: "Somerset", overview: "The UK's most iconic music festival - world-class organisational infrastructure and event production.", valueChainStage: "Live & Exhibition" },
  { name: "Reading & Leeds Festivals", url: "https://www.liveunlimited.co.uk", founded: "1961", hq: "Berkshire & Leeds", overview: "Major British rock festivals with 60+ years of event production experience and touring logistics.", valueChainStage: "Live & Exhibition" },
  { name: "Latitude Festival", url: "https://www.latitudefestival.com", founded: "2006", hq: "Suffolk", overview: "Multi-genre festival known for curation and artist development - smaller, artist-friendly alternative to mega-festivals.", valueChainStage: "Live & Exhibition" },
  { name: "SoundCloud", url: "https://soundcloud.com/careers", founded: "2007", hq: "Berlin (UK: London)", overview: "Music distribution and streaming platform for independent artists - creator-focused alternative to majors.", valueChainStage: "Distribution" },
  { name: "DistroKid", url: "https://www.distrokid.com", founded: "2012", hq: "Los Angeles (UK operations)", overview: "Digital music distribution platform for independent artists to release to Spotify, Apple Music and more.", valueChainStage: "Distribution" },
  { name: "TuneCore", url: "https://www.tunecore.com", founded: "2006", hq: "New York (UK operations)", overview: "Music distribution and licensing platform empowering independent artists and labels.", valueChainStage: "Distribution" },
  { name: "Bandcamp", url: "https://bandcamp.com", founded: "2008", hq: "Oakland, California", overview: "Artist-friendly digital music platform and store - royalty-focused, used by indie and experimental artists globally.", valueChainStage: "Distribution" },
  { name: "AEG Live", url: "https://www.aeglive.com", founded: "2003", hq: "Los Angeles (UK: London)", overview: "Major live entertainment promoter and venue operator - O2 Arena, SSE Arenas, and festival promotions.", valueChainStage: "Live & Exhibition" },
  { name: "Ginkgo Music", url: "https://www.ginkomusic.com", founded: "2000", hq: "London", overview: "Artist accounting, business management and consultancy - helping independent artists understand and manage their finances and rights.", valueChainStage: "Marketing" },
  { name: "Peer Music", url: "https://www.peermusic.com", founded: "1928", hq: "New York (UK: London)", overview: "Global music publisher and rights administrator - publishing, licensing, and representation for songwriters and composers.", valueChainStage: "Distribution" },
  { name: "Chasing the Sun Talent", url: "https://chasingthesuntalent.com", founded: "2015", hq: "London", overview: "Independent talent management and artist representation - managing emerging and established artists across all genres.", valueChainStage: "Marketing" },
  { name: "Wise Music", url: "https://www.wisemusicclassical.com", founded: "1883", hq: "London", overview: "Music publishing, representation and artist management - particularly strong in classical, film and games music.", valueChainStage: "Distribution" },
  { name: "Ticketmaster", url: "https://www.ticketmaster.com/careers", founded: "1976", hq: "Los Angeles (UK: London)", glassdoor: 3.7, overview: "The world's largest ticketing platform - operates globally for concerts, festivals, theatre, and live events.", valueChainStage: "Live & Exhibition" },
  { name: "See Tickets", url: "https://careers.seetickets.com", founded: "2004", hq: "Nottingham (UK offices)", glassdoor: 3.4, overview: "UK's leading independent ticketing company - serves venues, promoters, and festivals across live music and events.", valueChainStage: "Live & Exhibition" },
  { name: "Eventbrite", url: "https://www.eventbrite.com/careers", founded: "2006", hq: "San Francisco (UK: London)", overview: "Event management and ticketing platform - used by promoters, festivals, and independent venues for ticket sales and promotion.", valueChainStage: "Live & Exhibition" },
  { name: "Skiddle", url: "https://www.skiddle.com", founded: "2003", hq: "Manchester", overview: "UK's largest independent events and ticketing platform - tickets for clubs, venues, festivals, comedy, and live music.", valueChainStage: "Live & Exhibition" },
];


const Music = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind venues, labels, festivals, and the live music economy.</p>
        <PodcastPlayer industry="music" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "The New Music Business with Ari Herstand", description: "The #1 podcast for navigating the modern music industry.", url: "https://shows.acast.com/thenewmusicbusiness" },
            { title: "Music Business Worldwide Podcast", description: "Global music industry news and deals.", url: "https://www.musicbusinessworldwide.com" },
            { title: "Tape Notes", description: "Producers and artists break down how iconic records were made.", url: "https://www.tapenotes.co.uk/" },
            { title: "Switched On Pop", description: "Musicology meets pop culture.", url: "https://switchedonpop.com/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="music" />
        <LiveArticles industry="music" fallbackArticles={[
          { title: "Over Half of UK Grassroots Music Venues Made No Profit in 2025", source: "BBC News", url: "https://www.bbc.co.uk/news/articles/c20d1lxlx3go" },
          { title: "Music Venue Trust Annual Report Warns Grassroots Sector Remains Financially Fragile", source: "NME", url: "https://www.nme.com/news/music/music-venue-trust-report-2025-half-grassroots-no-profit-6000-jobs-lost-3924588" },
          { title: "UK Electronic Music Generated £2.5 Billion in Economic Activity in 2025", source: "Music Week", url: "https://www.musicweek.com/talent/read/ntia-uk-electronic-music-generated-2-5-billion-in-economic-activity-in-2025/093560" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="music" />
          <div className="mt-4"><BreakingNewsFeed industry="music" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="music" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["music"] || []} /><div className="mt-12"><YouTubeChannels industry="music" /><TikTokCreators industry="music" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={musicCompanies} />
        <div className="mt-12"><DayInTheLife industry="music" /></div>
        <div className="mt-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2>
          <img src={musicCareerMap} alt="The Music Value Chain" className="w-full rounded-sm" loading="lazy" />
        </div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From songwriting to stage - the roles that make the music industry work." stages={musicStages} industry="music" />
          <div className="mt-12"><IndustryRolesLink industry="Music" /></div>
        <ExploreFurther links={[
          { title: "UK Music - Careers", description: "The industry body representing the UK's commercial music sector, with career guides and workforce data.", url: "https://www.ukmusic.org/skills-academy/" },
          { title: "UK Music - Skills Academy", description: "The umbrella body for the UK's commercial music industry - workforce data, skills resources, and career pathways.", url: "https://www.ukmusic.org/skills-academy/" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Music" searchQuery="music industry" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Music" slug="music" />
          <CoursesSection industry="music" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Find your next gig<span className="text-primary">…</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the music industry.</p>
          <Link to="/marketplace?industry=Music#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <ExploreFurther
          title="More places to look"
          subtitle="Music industry job boards and specialist platforms where you can find roles directly."
          links={[
            { title: "Doors Open", description: "The UK's main music industry job board - roles across venues, festivals, promoters, labels and studios.", url: "https://www.doorsopen.co" },
            { title: "Music Careers", description: "Specialist platform for music industry roles - performing, production, promotion and technical positions.", url: "https://www.musiccareers.co" },
            { title: "Music Jobs UK", description: "UK-focused music jobs board covering all sectors - labels, venues, festivals, session work and artist management.", url: "https://www.music-jobs.com/uk" },
            { title: "Rostr Jobs", description: "Platform for music industry roles and artist opportunities on the Rostr network.", url: "https://jobs.rostr.cc" },
            { title: "IQ Magazine Jobs", description: "Events and entertainment industry job board with live music, festivals and venue operations roles.", url: "https://www.iqmagazine.com/jobs" },
            { title: "Run The Check", description: "Curated UK creative and arts opportunities - music, orchestras, labels and entry-level roles at the likes of Sony Music and Youth Music.", url: "https://www.runthecheck.com" },
          ]}
        />
        <IndustryRolesShowcase stages={musicStages} industry="Music" companies={musicCompanies} />
        <IndustryCVBuilder industry="Music" stages={musicStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Music" description="Tiny promoters, giant corporations, and the invisible machinery behind live music." profile="The music industry includes recorded music, live events, publishing, and artist management across a global ecosystem. In the UK, it supports approximately 200,000 to 250,000 jobs spanning both creative and commercial functions. From grassroots venues to global tours, it is driven by audience demand, technology, and evolving revenue models." tabs={tabs} />;
};

export default Music;
