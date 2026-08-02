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
import { Newspaper, Radio, Tv, Globe, Camera, Megaphone } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const journalismStages: CareerStage[] = [
  { title: "Reporting & Newsgathering", icon: Newspaper, roles: [
    { name: "News Reporter", description: "Researches, writes, and files news stories on deadline.", salary: "£22k–£40k" },
    { name: "Investigative Journalist", description: "Conducts in-depth, long-form investigations into public interest stories.", salary: "£30k–£55k" },
    { name: "Political Correspondent", description: "Covers Westminster, Whitehall, and UK political affairs.", salary: "£35k–£65k" },
    { name: "Foreign Correspondent", description: "Reports from overseas - conflict zones, elections, and global events.", salary: "£35k–£70k" },
    { name: "Court Reporter", description: "Covers legal proceedings, trials, and justice system stories.", salary: "£24k–£38k" },
    { name: "Data Journalist", description: "Uses data analysis and visualisation to find and tell stories.", salary: "£28k–£50k" },
    { name: "Sports Reporter", description: "Covers live sport, match reports, transfers, and player interviews.", salary: "£22k–£45k" },
  ]},
  { title: "Broadcast & Audio", icon: Radio, roles: [
    { name: "Broadcast Journalist", description: "Reports for TV or radio - writing scripts, presenting, and filing packages.", salary: "£24k–£45k" },
    { name: "News Presenter / Anchor", description: "Presents live news bulletins on TV or radio.", salary: "£30k–£80k+" },
    { name: "Audio Producer", description: "Produces podcasts, radio packages, and audio documentaries.", salary: "£26k–£45k" },
    { name: "Camera Operator", description: "Films news packages, live broadcasts, and documentary footage.", salary: "£24k–£42k" },
    { name: "Video Journalist (VJ)", description: "Self-shoots, edits, and files video reports - a one-person crew.", salary: "£24k–£40k" },
    { name: "Broadcast Engineer", description: "Manages studio equipment, outside broadcast units, and live feeds.", salary: "£28k–£50k" },
  ]},
  { title: "Digital & Multimedia", icon: Globe, roles: [
    { name: "Digital Editor", description: "Manages the newsroom's website, CMS, and real-time publishing.", salary: "£30k–£55k" },
    { name: "Social Media Editor", description: "Breaks news and drives engagement across social platforms.", salary: "£26k–£42k" },
    { name: "SEO / Audience Editor", description: "Optimises headlines, metadata, and distribution for maximum reach.", salary: "£28k–£48k" },
    { name: "Newsletter Editor", description: "Writes and curates email newsletters for subscriber audiences.", salary: "£26k–£42k" },
    { name: "Podcast Producer", description: "Plans, records, edits, and publishes podcast series.", salary: "£26k–£45k" },
    { name: "Interactive / Visual Journalist", description: "Creates data visualisations, maps, and interactive features.", salary: "£28k–£50k" },
  ]},
  { title: "Photography & Visual", icon: Camera, roles: [
    { name: "Press Photographer", description: "Captures news, sport, and feature images under deadline pressure.", salary: "£22k–£40k" },
    { name: "Picture Editor", description: "Selects, crops, and sequences images for publication.", salary: "£28k–£45k" },
    { name: "Photo Researcher", description: "Sources archive and stock images for articles and investigations.", salary: "£22k–£32k" },
    { name: "Graphic Designer", description: "Creates infographics, charts, and editorial design for print and digital.", salary: "£26k–£45k" },
  ]},
  { title: "Editorial & Production", icon: Tv, roles: [
    { name: "Editor-in-Chief", description: "Sets the editorial direction, tone, and news priorities for the publication.", salary: "£55k–£120k+" },
    { name: "Section Editor", description: "Runs a specific desk - e.g. business, culture, sport, or foreign.", salary: "£35k–£60k" },
    { name: "Sub-Editor / Copy Editor", description: "Checks facts, grammar, legal issues, and writes headlines.", salary: "£26k–£42k" },
    { name: "Features Editor", description: "Commissions and edits long-form articles, profiles, and opinion pieces.", salary: "£30k–£50k" },
    { name: "Fact-Checker", description: "Verifies claims, sources, and data before publication.", salary: "£24k–£36k" },
    { name: "Editorial Assistant", description: "Supports editors with research, admin, and content coordination.", salary: "£22k–£28k" },
  ]},
  { title: "Commercial & Business", icon: Megaphone, roles: [
    { name: "Head of Subscriptions", description: "Drives reader revenue through paywalls, memberships, and retention.", salary: "£40k–£70k" },
    { name: "Advertising Sales Manager", description: "Sells display, native, and sponsored content to advertisers.", salary: "£30k–£55k" },
    { name: "Audience Development Manager", description: "Grows readership across channels - SEO, social, referral, and email.", salary: "£30k–£50k" },
    { name: "Commercial Partnerships Manager", description: "Develops brand partnerships, events, and content collaborations.", salary: "£32k–£55k" },
    { name: "Media Lawyer", description: "Advises on defamation, privacy, contempt of court, and IPSO complaints.", salary: "£40k–£80k" },
    { name: "Head of Communications / PR", description: "Manages the publication's own reputation and media relations.", salary: "£35k–£60k" },
  ]},
];

const newsfeed = [
  { title: "Press Gazette", url: "https://pressgazette.co.uk" },
  { title: "The Guardian – Media", url: "https://www.theguardian.com/media" },
  { title: "BBC News – Media", url: "https://www.bbc.co.uk/news/topics/cg41ylwv43pt" },
  { title: "Journalism.co.uk", url: "https://www.journalism.co.uk" },
];

const journalismCompanies = [
  { name: "BBC News", url: "https://www.bbc.co.uk/careers", founded: "1922", hq: "London", glassdoor: 4.0, overview: "The world's largest public broadcaster - TV, radio, digital, and global bureaux.", valueChainStage: "Broadcast & Audio" },
  { name: "Sky News", url: "https://www.lifeatsky.com/search-results", founded: "1989", hq: "London", overview: "24-hour rolling TV news and digital journalism - part of Comcast/Sky.", valueChainStage: "Broadcast & Audio" },
  { name: "ITN", url: "https://www.itn.co.uk/careers", founded: "1955", hq: "London", overview: "Produces ITV News, Channel 4 News, and 5 News - independent TV news.", valueChainStage: "Broadcast & Audio" },
  { name: "Channel 4 News", url: "https://careers.channel4.com", founded: "1982", hq: "London", overview: "Award-winning current affairs - produced by ITN for Channel 4.", valueChainStage: "Broadcast & Audio" },
  { name: "Global (Capital, Heart, LBC)", url: "https://www.global.com/careers/", founded: "2007", hq: "London", overview: "UK's largest commercial radio group - Capital, Heart, LBC, Classic FM, and Global Player.", valueChainStage: "Broadcast & Audio" },
  { name: "Bauer Media (Kiss, Hits Radio)", url: "https://www.totaljobs.com/jobs/bauer-media", founded: "1875", hq: "London", overview: "Major UK radio group - Kiss FM, Hits Radio, Absolute Radio, and Grazia.", valueChainStage: "Broadcast & Audio" },
  { name: "Associated Press", url: "https://www.ap.org/careers/", founded: "1846", hq: "New York (London bureau)", overview: "The world's oldest and largest news agency - supplies text, photo, and video to newsrooms globally.", valueChainStage: "Broadcast & Audio" },
  { name: "The News Movement", url: "https://www.thenewsmovement.com", founded: "2021", hq: "London / New York", overview: "Gen-Z-focused digital newsroom - short-form news across TikTok, Instagram, and YouTube.", valueChainStage: "Broadcast & Audio" },
  { name: "GB News", url: "https://careers.gbnews.com/jobs", founded: "2021", hq: "London", overview: "UK opinion-led TV news channel - known for giving people their first on-screen breaks.", valueChainStage: "Broadcast & Audio" },
  { name: "The Guardian", url: "https://workforus.theguardian.com", founded: "1821", hq: "London", glassdoor: 3.9, overview: "Scott Trust-owned, reader-funded quality journalism - global digital reach.", valueChainStage: "Reporting & Newsgathering" },
  { name: "News UK", url: "https://www.newscareers.co.uk", founded: "1785", hq: "London", overview: "Publisher of The Times, The Sunday Times, The Sun, and TalkTV - Murdoch's UK news arm.", valueChainStage: "Reporting & Newsgathering", profileUrl: "/company/news-uk" },
  { name: "The Telegraph", url: "https://careers.telegraph.co.uk", founded: "1855", hq: "London", overview: "Broadsheet newspaper and growing digital subscriber base - news, sport, and comment.", valueChainStage: "Reporting & Newsgathering" },
  { name: "Associated Newspapers (DMGT)", url: "https://www.dmgmedia.co.uk/careers/", founded: "1896", hq: "London", overview: "Publisher of the Daily Mail, Mail on Sunday, and MailOnline - the world's most-read English-language news website.", valueChainStage: "Reporting & Newsgathering" },
  { name: "Financial Times", url: "https://aboutus.ft.com/careers", founded: "1888", hq: "London", glassdoor: 4.1, overview: "Global business and financial journalism - 1m+ digital subscribers.", valueChainStage: "Reporting & Newsgathering" },
  { name: "The Observer", url: "https://observer.co.uk/careers", founded: "1791", hq: "London", overview: "The world's oldest Sunday newspaper - now owned by Tortoise Media.", valueChainStage: "Reporting & Newsgathering" },
  { name: "Reuters", url: "https://www.thomsonreuters.com/en/careers.html", founded: "1851", hq: "London", glassdoor: 3.9, overview: "Global wire service - text, photo, and video journalism for newsrooms worldwide.", valueChainStage: "Reporting & Newsgathering" },
  { name: "PA Media", url: "https://careers.pamediagroup.com", founded: "1868", hq: "London", overview: "The UK's national news agency - supplies stories to every major outlet.", valueChainStage: "Reporting & Newsgathering" },
  { name: "Reach plc", url: "https://www.reachplc.com/careers", founded: "2018", hq: "London", glassdoor: 3.2, overview: "UK's largest commercial publisher - Mirror, Express, Manchester Evening News, and 100+ titles.", valueChainStage: "Reporting & Newsgathering" },
  { name: "Newsquest / Archant", url: "https://www.newsquest.co.uk/careers", founded: "1995", hq: "London", overview: "Major regional publisher - 200+ local and regional titles across the UK.", valueChainStage: "Editorial & Production" },
  { name: "Condé Nast", url: "https://www.condenast.com/careers", founded: "1909", hq: "London / New York", overview: "Global magazine publisher - Vogue, GQ, Wired, Vanity Fair, and The New Yorker.", valueChainStage: "Editorial & Production" },
  { name: "Hearst UK", url: "https://www.hearst.co.uk/careers", founded: "1910", hq: "London", overview: "Major magazine publisher - Cosmopolitan, Elle, Esquire, Country Living, Digital Spy, and more.", valueChainStage: "Editorial & Production" },
];

const Journalism = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind the news.</p>
        <PodcastPlayer industry="journalism" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "The Media Show", description: "BBC Radio 4's weekly look at the media industry - regulation, tech, and journalism.", url: "https://www.bbc.co.uk/programmes/b00dv9hq" },
            { title: "The Guardian's Today in Focus", description: "Daily deep-dive into the biggest stories from Guardian journalists.", url: "https://www.theguardian.com/news/series/todayinfocus" },
            { title: "Journalism.co.uk Podcast", description: "Covering the tools, techniques, and trends shaping modern journalism.", url: "https://www.journalism.co.uk/podcast" },
            { title: "The Media Club", description: "Matt Deegan talks to top media industry figures about radio, TV, podcasts, and the business of content.", url: "https://podcasts.apple.com/gb/podcast/the-media-club-with-matt-deegan/id883205650" },
            { title: "The Rest Is Entertainment", description: "Richard Osman and Marina Hyde dissect the entertainment and media industries - TV, film, news, and publishing.", url: "https://www.goalhangerpodcasts.com/the-rest-is-entertainment" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="journalism" />
        <LiveArticles industry="journalism" fallbackArticles={[
          { title: "The State of UK Journalism 2026", source: "Press Gazette", url: "https://pressgazette.co.uk" },
          { title: "How Newsrooms Are Adapting to AI", source: "Reuters Institute", url: "https://reutersinstitute.politics.ox.ac.uk" },
          { title: "The Business Model Crisis in Local News", source: "The Guardian", url: "https://www.theguardian.com/media" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="journalism" />
          <div className="mt-4"><BreakingNewsFeed industry="journalism" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="journalism" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: (
      <>
        <div className="mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">The HDYD Show<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Episode 1: How Do You Do, Journalism?</p>
          <p className="text-muted-foreground font-body text-sm mb-6">Real stories from journalists, storytellers, and those uncovering what matters.</p>
          <Link to="/the-show" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">Watch Episode</Link>
        </div>
        <VideoShowcase heading="Unpacking on Screen" clips={industryVideos["journalism"] || []} />
        <div className="mt-12"><YouTubeChannels industry="journalism" /><TikTokCreators industry="journalism" /></div>
      </>
    ) },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={journalismCompanies} />
        <div className="mt-12"><DayInTheLife industry="journalism" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From the newsroom to the front page - every role behind the stories that matter." stages={journalismStages} industry="journalism" />
          <div className="mt-12"><IndustryRolesLink industry="Journalism" /></div>
        <ExploreFurther links={[
          { title: "NCTJ - Careers in Journalism", description: "The National Council for the Training of Journalists - the industry's accreditation body for training and qualifications.", url: "https://www.nctj.com/journalism-careers/" },
          { title: "BBC Academy", description: "Free training resources and career advice from the BBC across journalism, production, and technology.", url: "https://www.bbc.co.uk/academy" },
          { title: "IPSO - Resources for Journalists", description: "The UK's digital and print journalism regulator has free advice and guidance for journalists and editors.", url: "https://www.ipso.co.uk/resources-guidance/resources-and-guidance-for-journalists-and-editors/" },
          { title: "National Union of Journalists", description: "The NUJ represents journalists across the UK and Ireland - info, resources, and industry support.", url: "https://www.nuj.org.uk/" },
          { title: "Royal Television Society - Journalism Masterclasses", description: "The RTS offers free journalism masterclasses covering broadcast and digital reporting.", url: "https://rts.org.uk/education-and-training-pages/journalism" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Journalism" searchQuery="journalism media news UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Journalism" slug="journalism" />
          <CoursesSection industry="journalism" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Hold the front page, have we got jobs for you<span className="text-primary">…</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the journalism industry.</p>
          <Link to="/marketplace?industry=Journalism#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={journalismStages} industry="Journalism" companies={journalismCompanies} />
        <IndustryCVBuilder industry="Journalism" stages={journalismStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Journalism"
      description="Newsrooms, broadcasters, digital publishers, and the people behind every story."
      profile="The UK journalism industry covers national and regional newspapers, broadcasters, magazines, and a fast-expanding world of digital publishers, newsletters, and independent creators. It employs tens of thousands of reporters, editors, producers, and commercial staff, and underpins public debate across politics, business, sport, and culture. The sector is in constant flux as audiences shift online, advertising models evolve, and trust, speed, and storytelling all compete for attention."
      tabs={tabs}
    />
  );
};

export default Journalism;
