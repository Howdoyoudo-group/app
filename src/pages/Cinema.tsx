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
import CinemaCareerMap from "@/components/CinemaCareerMap";
import { cinemaStages } from "@/components/CinemaCareerMap";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import IndustryRolesShowcase from "@/components/IndustryRolesShowcase";
import CoursesSection from "@/components/CoursesSection";
import TheDownload from "@/components/TheDownload";
import YouTubeChannels from "@/components/YouTubeChannels";
import TikTokCreators from "@/components/TikTokCreators";
import SubstackNewsletters from "@/components/SubstackNewsletters";
import PodcastPlayer from "@/components/PodcastPlayer";
import DayInTheLife from "@/components/DayInTheLife";
import IndustryRolesLink from "@/components/IndustryRolesLink";
import IndustryPageLayout from "@/components/IndustryPageLayout";
import cinemaCareerInfographic from "@/assets/cinema-career-map.png";
import PodcastGrid from "@/components/PodcastGrid";

const newsfeed = [
  { title: "Screen Daily", url: "https://www.screendaily.com" },
  { title: "BFI", url: "https://www.bfi.org.uk" },
  { title: "Variety", url: "https://variety.com" },
];

const cinemaCompanies = [
  { name: "Working Title Films", url: "https://www.workingtitlefilms.com", founded: "1983", hq: "London", overview: "One of the UK's most successful production companies, behind Four Weddings, Love Actually, and Darkest Hour.", valueChainStage: "Production" },
  { name: "Pinewood Studios", url: "https://www.pinewoodgroup.com/careers", founded: "1936", hq: "Buckinghamshire", glassdoor: 3.8, overview: "The UK's most famous film studio complex, home to James Bond, Star Wars, and Marvel productions.", valueChainStage: "Production" },
  { name: "Warner Bros. Pictures", url: "https://www.warnerbroscareers.com", founded: "1923", hq: "Burbank (UK: Leavesden)", glassdoor: 4.0, overview: "Major studio behind Harry Potter, The Dark Knight, and Barbie - with Leavesden Studios in Hertfordshire.", valueChainStage: "Production" },
  { name: "Universal Pictures", url: "https://www.nbcunicareers.com", founded: "1912", hq: "Universal City (UK: London)", glassdoor: 4.0, overview: "One of Hollywood's oldest studios - Jurassic Park, Oppenheimer, and the Fast & Furious franchise.", valueChainStage: "Production" },
  { name: "The Walt Disney Company", url: "https://jobs.disneycareers.com", founded: "1923", hq: "Burbank (UK: Hammersmith)", glassdoor: 4.0, overview: "The entertainment giant - Pixar, Marvel Studios, Lucasfilm, 20th Century Studios, and Disney+.", valueChainStage: "Production" },
  { name: "Sony Pictures", url: "https://www.sonypictures.com/corp/help.html", founded: "1987", hq: "Culver City (UK: London)", glassdoor: 4.0, overview: "Major studio - Spider-Man, Ghostbusters, and Columbia Pictures.", valueChainStage: "Production" },
  { name: "Paramount Pictures", url: "https://www.paramount.com/careers", founded: "1912", hq: "Hollywood (UK: London)", glassdoor: 3.9, overview: "One of the original Big Five studios - Top Gun, Mission: Impossible, and Indiana Jones.", valueChainStage: "Production" },
  { name: "Lionsgate", url: "https://www.lionsgate.com/careers", founded: "1997", hq: "Santa Monica (UK: London)", glassdoor: 3.7, overview: "Independent studio behind The Hunger Games, John Wick, and La La Land.", valueChainStage: "Production" },
  { name: "A24", url: "https://a24films.com/jobs", founded: "2012", hq: "New York (UK: London)", glassdoor: 3.9, overview: "Cult independent studio and distributor behind Everything Everywhere All at Once, Hereditary and The Whale.", valueChainStage: "Production" },
  { name: "Framestore", url: "https://www.framestore.com/careers", founded: "1986", hq: "London", glassdoor: 3.7, overview: "Oscar-winning VFX studio behind Gravity, Blade Runner 2049, and Fantastic Beasts.", valueChainStage: "Post-Production" },
  { name: "DNEG", url: "https://www.dneg.com/careers/", founded: "1998", hq: "London", glassdoor: 3.6, overview: "Seven-time Oscar-winning VFX and animation studio - Dune, Tenet, Inception, Interstellar.", valueChainStage: "Post-Production" },
  { name: "Industrial Light & Magic", url: "https://www.ilm.com/careers/", founded: "1975", hq: "San Francisco (UK: London)", glassdoor: 4.0, overview: "George Lucas's pioneering VFX house - Star Wars, The Mandalorian, and most modern blockbusters.", valueChainStage: "Post-Production" },
  { name: "Cinesite", url: "https://www.cinesite.com/careers/", founded: "1991", hq: "London", glassdoor: 3.5, overview: "Major UK VFX and feature animation studio - Avengers, James Bond, The Addams Family.", valueChainStage: "Post-Production" },
  { name: "The Mill", url: "https://www.themill.com/careers", founded: "1990", hq: "London", glassdoor: 3.6, overview: "World-leading VFX, design and content studio for film, TV and advertising.", valueChainStage: "Post-Production" },
  { name: "Molinare", url: "https://www.molinare.co.uk/careers/", founded: "1973", hq: "London (Soho)", overview: "Soho-based post-production house - picture, sound, VFX and grading for premium TV and film.", valueChainStage: "Post-Production" },
  { name: "Technicolor (Streamland Media)", url: "https://www.streamlandmedia.com/careers/", founded: "1915", hq: "London / LA", overview: "Industry-defining colour, sound and post-production services for film and high-end TV.", valueChainStage: "Post-Production" },
  { name: "Curzon", url: "https://www.curzon.com/careers/", founded: "1934", hq: "London", glassdoor: 3.7, trustpilot: 2.7, overview: "A vertically integrated cinema, distribution, and streaming company.", valueChainStage: "Exhibition" },
  { name: "Netflix", url: "https://jobs.netflix.com", founded: "1997", hq: "Los Gatos, California", glassdoor: 4.0, trustpilot: 1.3, profileUrl: "/company/netflix", overview: "The world's largest streaming service with 280m+ subscribers.", valueChainStage: "Distribution" },
  { name: "Amazon MGM Studios", url: "https://www.amazon.jobs/en-gb/", founded: "2010", hq: "Culver City (UK: London)", glassdoor: 3.8, overview: "Amazon's film and TV arm - MGM legacy plus original productions for Prime Video.", valueChainStage: "Distribution" },
  { name: "Everyman", url: "https://careers.everymancinema.com/", founded: "2000", hq: "London", glassdoor: 3.9, trustpilot: 2.0, profileUrl: "/company/everyman", overview: "The boutique cinema chain rewriting the rules on what a trip to the pictures looks like.", valueChainStage: "Exhibition" },
  { name: "Vue International", url: "https://isw.changeworknow.co.uk/vue/vms/i/vue/search/new", founded: "2003", hq: "London", glassdoor: 3.2, trustpilot: 1.6, overview: "One of the world's largest cinema operators with 200+ sites across 10 countries.", valueChainStage: "Exhibition" },
  { name: "Odeon Cinemas", url: "https://careers.odeon.co.uk", founded: "1928", hq: "London", glassdoor: 3.4, trustpilot: 1.6, overview: "The UK's largest cinema chain - part of AMC Theatres, with 120+ sites across the country.", valueChainStage: "Exhibition" },
  { name: "Showcase Cinemas", url: "https://uk.showcasecinemas.co.uk/careers", founded: "1937", hq: "Reading", glassdoor: 3.3, trustpilot: 2.4, overview: "National Amusements-owned multiplex operator with 21 sites across the UK and Ireland.", valueChainStage: "Exhibition" },
  { name: "BBC", url: "https://careers.bbc.co.uk", founded: "1922", hq: "London", glassdoor: 4.0, overview: "The UK's public-service broadcaster - drama, comedy, news and natural history programming for global audiences.", valueChainStage: "Production" },
  { name: "ITV", url: "https://www.itvjobs.com", founded: "1955", hq: "London", glassdoor: 3.8, overview: "The UK's largest commercial broadcaster and producer - ITV Studios makes hits like Love Island, Vera and Mr Bates vs The Post Office.", valueChainStage: "Production" },
  { name: "Channel 4", url: "https://careers.channel4.com", founded: "1982", hq: "London/Leeds", glassdoor: 4.0, overview: "Publicly-owned commercial broadcaster commissioning bold, distinctive content from independent producers across the UK.", valueChainStage: "Distribution" },
  { name: "Channel 5", url: "https://www.paramount.com/careers", founded: "1997", hq: "London", glassdoor: 3.9, overview: "Paramount-owned UK broadcaster known for documentaries, drama and entertainment programming.", valueChainStage: "Distribution" },
  { name: "ITN", url: "https://www.itn.co.uk/careers", founded: "1955", hq: "London", glassdoor: 3.7, overview: "Award-winning news and content production company producing ITV News, Channel 4 News and 5 News.", valueChainStage: "Production" },
  { name: "Sky", url: "https://careers.sky.com", founded: "1989", hq: "Isleworth", glassdoor: 3.9, overview: "Europe's leading entertainment company - Sky Studios, Sky Atlantic, Sky Sports and Sky News across the UK and Europe.", valueChainStage: "Distribution" },
  { name: "HBO", url: "https://careers.wbd.com/global/en/c/hbo-jobs", founded: "1972", hq: "New York (UK: London)", glassdoor: 4.1, overview: "Premium content brand under Warner Bros. Discovery - Succession, House of the Dragon, The Last of Us.", valueChainStage: "Production" },
  { name: "Sister", url: "https://sister-pictures.com", founded: "2015", hq: "London", overview: "The independent production studio behind Chernobyl, Landscapers and This Is Going to Hurt - co-founded by Jane Featherstone and Elisabeth Murdoch.", valueChainStage: "Production" },
  { name: "Big Talk Productions", url: "https://www.bigtalk.co.uk", founded: "1995", hq: "London", overview: "ITV Studios-owned indie behind Cold Feet, Rev, Friday Night Dinner and Back - major UK comedy and drama producer.", valueChainStage: "Production" },
];

const Cinema = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the mechanics behind film studios, independent cinema, and the streaming wars.</p>

          <PodcastPlayer industry="cinema" />

          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
              { title: "The Filmmaker's Podcast", description: "Cannes, festivals, indie films, AI, and the business of getting films made.", url: "https://www.thefilmmakerspodcast.com/" },
              { title: "The Screen Podcast", description: "Screen Daily's take on the film industry stories set to dominate.", url: "https://www.screendaily.com/the-screen-podcast" },
              { title: "The Business", description: "KCRW's long-running show on the business side of Hollywood and entertainment.", url: "https://www.kcrw.com/culture/shows/the-business" },
              { title: "Kermode & Mayo's Take", description: "Film criticism meets industry insight - the UK's most-loved film podcast.", url: "https://www.kermodeandmayo.com/" },
            ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="cinema" />
          <LiveArticles industry="cinema" fallbackArticles={[
            { title: "UK Film and High-End TV Production Hits £6.8bn in 2025", source: "IBC", url: "https://www.ibc.org/production/news/uk-film-and-high-end-tv-production-hits-6-8bn-in-2025/23004" },
            { title: "Official BFI Statistics Reveal Record UK Production Spend", source: "BFI", url: "https://www.bfi.org.uk/news/official-bfi-statistics-2025" },
            { title: "UK Film Production Spend Hit £2.8bn in 2025, Highest on Record", source: "Screen Global Production", url: "https://www.screenglobalproduction.com/news/2026/02/06/uk-film-production-spend-2025-record-high" },
            { title: "Where Next for Independent Cinemas?", source: "Advantage Creative", url: "https://www.advantagecreative.co.uk/2025/05/19/where-next-for-independent-cinemas/" },
            { title: "Almost a Third of UK Independent Cinemas Say They Are at Risk", source: "The Guardian", url: "https://www.theguardian.com/culture/2025/apr/12/uk-independent-cinemas-at-risk-investment-funding" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="cinema" />
            <div className="mt-4">
              <BreakingNewsFeed industry="cinema" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="cinema" />
          </div>
        </>
      ),
    },
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["cinema"] || []} /><div className="mt-12"><YouTubeChannels industry="cinema" /><TikTokCreators industry="cinema" /></div></>,
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={cinemaCompanies} />
          <div className="mt-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2>
            <img src={cinemaCareerInfographic} alt="The Cinema Value Chain infographic" className="w-full rounded-sm" loading="lazy" />
          </div>
          <div className="mt-12">
            <DayInTheLife industry="cinema" />
          </div>
          <div className="mt-12">
            <IndustryRolesLink industry="Film and TV" />
          </div>
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CinemaCareerMap />
          <ExploreFurther links={[
            { title: "ScreenSkills", description: "The industry-led skills body for the UK's screen industries - careers advice, training, and bursaries.", url: "https://www.screenskills.com/starting-your-career/" },
            { title: "BFI - Work in Film", description: "The British Film Institute's guide to careers, training, and opportunities across the UK film sector.", url: "https://www.bfi.org.uk" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Film and TV" searchQuery="film cinema industry" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Cinema" slug="cinema" />
          <CoursesSection industry="cinema" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Ready for a new starring role<span className="text-primary">?</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the cinema and film industry.</p>
            <Link to="/marketplace?industry=Film%20and%20TV#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={cinemaStages} industry="Film and TV" companies={cinemaCompanies} />
        <IndustryCVBuilder industry="Film and TV" stages={cinemaStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Film and TV"
      description="From multi-billion dollar studios to indie darlings - how does the film industry really work?"
      profile="The UK cinema and film industry ranges from major studios and global distributors to independent filmmakers and local exhibitors. It employs approximately 100,000 to 150,000 people across production, distribution, and exhibition. Behind the screen sits a complex ecosystem of financing, talent networks, and shifting audience behaviour driven by streaming and theatrical demand."
      tabs={tabs}
    />
  );
};

export default Cinema;
