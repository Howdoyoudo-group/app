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
import { Trophy, Users, Stethoscope, Tv, Coins, Briefcase } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const horseRacingStages: CareerStage[] = [
  { title: "Riding & Stable", icon: Trophy, roles: [
    { name: "Jockey (Flat / Jump)", description: "Rides racehorses competitively - apprentice, conditional or fully licensed across UK racecourses.", salary: "£25k–£200k+ (with prize money)" },
    { name: "Stable Lass / Lad", description: "Daily care of racehorses - feeding, mucking out, tack work and exercise rides.", salary: "£20k–£28k" },
    { name: "Work Rider", description: "Experienced rider who exercises racehorses on the gallops each morning.", salary: "£24k–£35k" },
    { name: "Head Lad / Head Person", description: "Runs the day-to-day in the trainer's yard - leads stable staff and looks after the horses.", salary: "£28k–£45k" },
    { name: "Pupil Assistant", description: "Trainee position learning all aspects of running a racing yard with a view to assistant trainer.", salary: "£20k–£28k" },
  ]},
  { title: "Training & Performance", icon: Users, roles: [
    { name: "Racehorse Trainer", description: "Licensed by the BHA to train horses for racing - develops the horses, manages owners and entries.", salary: "£40k–£500k+ (highly variable)" },
    { name: "Assistant Trainer", description: "Number two in a training yard - runs the yard, manages staff and represents the trainer at the races.", salary: "£30k–£60k" },
    { name: "Travelling Head", description: "Takes horses to racecourses across the UK and Europe - saddles, presents and looks after them on the day.", salary: "£28k–£40k" },
    { name: "Equine Physiotherapist", description: "Provides rehabilitation and performance therapy for racehorses across yards.", salary: "£28k–£50k" },
    { name: "Racehorse Nutritionist", description: "Designs feeding programmes to optimise condition, performance and recovery.", salary: "£28k–£48k" },
  ]},
  { title: "Veterinary & Welfare", icon: Stethoscope, roles: [
    { name: "Equine Vet", description: "Specialist veterinary surgeon caring for racehorses - diagnostics, surgery and racecourse cover.", salary: "£40k–£90k" },
    { name: "Veterinary Nurse (Equine)", description: "Supports equine vets with surgery, hospitalisation and stable visits.", salary: "£24k–£34k" },
    { name: "Farrier", description: "Specialist in shoeing racehorses - independent or attached to major training yards.", salary: "£30k–£60k" },
    { name: "Welfare Officer", description: "Works for the BHA, RoR or charities to safeguard racehorse welfare on and off the track.", salary: "£28k–£45k" },
  ]},
  { title: "Racecourse & Raceday", icon: Tv, roles: [
    { name: "Clerk of the Course", description: "Senior racecourse role responsible for ground, fixtures and raceday safety.", salary: "£40k–£80k" },
    { name: "Racecourse Manager", description: "Runs a UK racecourse - racing operations, hospitality and commercial.", salary: "£45k–£90k" },
    { name: "Starter / Stewards / Judges", description: "BHA officials managing the integrity, fairness and timing of every UK race.", salary: "£30k–£70k" },
    { name: "Racing Broadcaster / Pundit", description: "Hosts and analysts on Racing TV, ITV Racing or Sky Sports Racing.", salary: "£40k–£200k+" },
    { name: "Hospitality & Events Manager", description: "Runs corporate hospitality and event days at major UK racecourses (Ascot, Cheltenham, York).", salary: "£30k–£55k" },
  ]},
  { title: "Bloodstock & Betting", icon: Coins, roles: [
    { name: "Bloodstock Agent", description: "Buys and sells racehorses on behalf of owners and breeders - at sales like Tattersalls.", salary: "£30k–£150k+ (commission)" },
    { name: "Stud Manager", description: "Runs a thoroughbred breeding operation - stallions, mares, foals and yearlings.", salary: "£35k–£70k" },
    { name: "Racing Manager (Owner)", description: "Manages a racing portfolio for a major owner or syndicate - entries, jockey bookings, sales.", salary: "£40k–£100k+" },
    { name: "Trader / Pricing Analyst (Bookmaker)", description: "Sets and trades prices for racing markets at Bet365, William Hill, Paddy Power.", salary: "£35k–£90k" },
    { name: "Sponsorship Manager", description: "Brings brands into racing - race sponsorship, team partnerships and major festivals.", salary: "£35k–£65k" },
  ]},
  { title: "Business & Industry", icon: Briefcase, roles: [
    { name: "Racing Journalist", description: "Writes for the Racing Post, Sporting Life or national press on form, news and personalities.", salary: "£26k–£60k" },
    { name: "BHA Regulatory Officer", description: "British Horseracing Authority - integrity, licensing, anti-doping and rules of racing.", salary: "£32k–£65k" },
    { name: "Racecourse Operations Director", description: "Senior leadership at Jockey Club, Arena Racing or independent courses.", salary: "£70k–£130k+" },
    { name: "Owner Relations Manager", description: "Looks after owners' experience - racedays, communications and retention.", salary: "£28k–£45k" },
    { name: "Charity Programme Manager (RoR)", description: "Retraining of Racehorses - manages aftercare, second careers and welfare programmes.", salary: "£28k–£45k" },
  ]},
];

const newsfeed = [
  { title: "Racing Post", url: "https://www.racingpost.com/news/" },
  { title: "Sporting Life Racing", url: "https://www.sportinglife.com/racing" },
  { title: "BHA News", url: "https://www.britishhorseracing.com/press_releases/" },
  { title: "Thoroughbred Daily News", url: "https://www.thoroughbreddailynews.com" },
];

const horseRacingCompanies = [
  { name: "British Horseracing Authority (BHA)", url: "https://www.britishhorseracing.com/people/working-for-the-bha/", founded: "2007", hq: "London", overview: "The governing and regulatory body for British horseracing - integrity, fixtures, rules and welfare.", valueChainStage: "Business & Industry" },
  { name: "The Jockey Club", url: "https://www.thejockeyclub.co.uk/careers/", founded: "1750", hq: "London", overview: "The largest commercial group in British racing - owns Aintree, Cheltenham, Epsom, Newmarket and 11 other courses.", valueChainStage: "Racecourse & Raceday" },
  { name: "Arena Racing Company (ARC)", url: "https://www.arenaracingcompany.co.uk/careers", founded: "2012", hq: "Doncaster", overview: "The UK's largest racecourse operator - 16 racecourses including Doncaster, Lingfield and Newcastle.", valueChainStage: "Racecourse & Raceday" },
  { name: "Ascot Racecourse", url: "https://www.ascot.com/careers", founded: "1711", hq: "Ascot", overview: "Home of Royal Ascot, QIPCO British Champions Day and some of the world's most prestigious racing.", valueChainStage: "Racecourse & Raceday" },
  { name: "York Racecourse", url: "https://www.yorkracecourse.co.uk/about-york/job-vacancies", founded: "1731", hq: "York", overview: "Voted the UK's best racecourse - home of the Ebor Festival and Yorkshire Oaks.", valueChainStage: "Racecourse & Raceday" },
  { name: "Goodwood Racecourse", url: "https://www.goodwood.com/careers/", founded: "1802", hq: "Chichester", overview: "Glorious Goodwood and Sussex's premier racecourse - part of the Goodwood Estate.", valueChainStage: "Racecourse & Raceday" },
  { name: "Tattersalls", url: "https://www.tattersalls.com/careers", founded: "1766", hq: "Newmarket", overview: "Europe's largest bloodstock auctioneer - yearling, breeding stock and horses-in-training sales.", valueChainStage: "Bloodstock & Betting" },
  { name: "Goffs UK", url: "https://www.goffs.com/about/careers", founded: "1866", hq: "Doncaster", overview: "Leading bloodstock auctioneer - National Hunt, breeze-up and yearling sales.", valueChainStage: "Bloodstock & Betting" },
  { name: "Coolmore Stud", url: "https://www.coolmore.com", founded: "1975", hq: "Tipperary (UK ops)", overview: "The world's leading thoroughbred breeding operation - stallions including Galileo, Frankel and Dubawi.", valueChainStage: "Bloodstock & Betting" },
  { name: "Darley (Godolphin)", url: "https://www.godolphin.com/careers", founded: "1981", hq: "Newmarket", overview: "Sheikh Mohammed's global racing and breeding operation - major Newmarket employer.", valueChainStage: "Bloodstock & Betting" },
  { name: "Racing Post", url: "https://www.racingpost.com/jobs/", founded: "1986", hq: "London", overview: "The UK's leading horseracing newspaper, website and data business - owned by Spotlight Sports Group.", valueChainStage: "Business & Industry" },
  { name: "Racing TV", url: "https://www.racingtv.com/about/work-for-us", founded: "2007", hq: "Ealing", overview: "The UK's dedicated racing channel - covers 60+ UK and Irish racecourses live.", valueChainStage: "Racecourse & Raceday" },
  { name: "ITV Racing", url: "https://careers.itv.com", founded: "2017", hq: "London", overview: "Free-to-air UK racing coverage - Cheltenham, Aintree, Royal Ascot and the Derby.", valueChainStage: "Racecourse & Raceday" },
  { name: "Bet365", url: "https://www.bet365careers.com", founded: "2000", hq: "Stoke-on-Trent", overview: "The UK's largest privately-owned bookmaker - major employer in racing trading and pricing.", valueChainStage: "Bloodstock & Betting" },
  { name: "Paddy Power Betfair (Flutter)", url: "https://careers.flutter.com", founded: "1988", hq: "Dublin / London", overview: "The world's largest online betting operator - Paddy Power, Sky Bet, Betfair and tote partnerships.", valueChainStage: "Bloodstock & Betting" },
  { name: "Racing Welfare", url: "https://www.racingwelfare.co.uk/about-us/jobs", founded: "2000", hq: "Newmarket", overview: "Charity supporting the workforce of British racing - wellbeing, housing and personal development.", valueChainStage: "Veterinary & Welfare" },
  { name: "Retraining of Racehorses (RoR)", url: "https://www.ror.org.uk", founded: "2000", hq: "London", overview: "British racing's official charity for the welfare of horses retired from racing.", valueChainStage: "Veterinary & Welfare" },
  { name: "Newmarket Equine Hospital", url: "https://www.newmarketequinehospital.com/careers", founded: "1899", hq: "Newmarket", overview: "One of the world's leading equine hospitals - diagnostics, surgery and rehabilitation for racehorses.", valueChainStage: "Veterinary & Welfare" },
  { name: "British Racing School", url: "https://www.brs.org.uk", founded: "1983", hq: "Newmarket", overview: "The UK's centre for training stable staff, jockeys and racing professionals.", valueChainStage: "Riding & Stable" },
  { name: "National Horseracing College", url: "https://www.nationalhorseracingcollege.com/careers", founded: "1984", hq: "Doncaster", overview: "Leading UK training centre for careers in racing - funded courses for stable staff and jockeys.", valueChainStage: "Riding & Stable" },
];

const HorseRacing = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring careers across British and Irish horseracing.</p>
        <PodcastPlayer industry="horse-racing" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "The Final Furlong Podcast", description: "Emmet Kennedy and guests on the biggest stories in flat and jump racing.", url: "https://open.spotify.com/show/5jZJlZDGlojxuMFtdyf2gS" },
            { title: "Racing Post Podcast", description: "The Racing Post's flagship daily preview, tips and analysis.", url: "https://www.racingpost.com/podcasts/" },
            { title: "Nick Luck Daily", description: "Nick Luck's daily racing show - interviews, news and big-race reaction.", url: "https://open.spotify.com/show/4PWeS9oFVTHxQ22pfnPkkS" },
            { title: "Off The Fence", description: "Lydia Hislop's deep-dive interview podcast with the biggest names in racing.", url: "https://www.racingtv.com/podcasts" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="horse-racing" />
        <LiveArticles industry="horse-racing" fallbackArticles={[
          { title: "British Racing's Funding Crisis: What's Next for the Levy?", source: "Racing Post", url: "https://www.racingpost.com/news/" },
          { title: "Cheltenham Festival Roundup: Winners, Stories and Stars", source: "Sporting Life", url: "https://www.sportinglife.com/racing" },
          { title: "Inside the Boom in Racehorse Welfare and Aftercare", source: "BHA", url: "https://www.britishhorseracing.com/press_releases/" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="horse-racing" />
          <div className="mt-4"><BreakingNewsFeed industry="horse-racing" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="horse-racing" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["horse-racing"] || []} /><div className="mt-12"><YouTubeChannels industry="horse-racing" /><TikTokCreators industry="horse-racing" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={horseRacingCompanies} />
        <div className="mt-12"><DayInTheLife industry="horse-racing" /></div>
        <div className="mt-12"><IndustryRolesLink industry="Horse Racing" /></div>
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From the stable yard to the saddle, the racecourse to the boardroom - every role in British racing." stages={horseRacingStages} industry="horse-racing" />
        <ExploreFurther links={[
          { title: "Careers in Racing", description: "The official careers hub for British horseracing - jobs, training and apprenticeships.", url: "https://www.careersinracing.com" },
          { title: "British Racing School", description: "Newmarket-based training centre - foundation, jockey and stable-staff courses.", url: "https://www.brs.org.uk" },
          { title: "National Horseracing College", description: "Doncaster-based college offering funded careers training for racing.", url: "https://www.nationalhorseracingcollege.com" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Horse Racing" searchQuery="horse racing equestrian conference UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Horse Racing" slug="horse-racing" />
          <CoursesSection industry="horse-racing" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Be first past the post<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across UK horseracing - yards, racecourses, bloodstock and broadcasting.</p>
          <Link to="/marketplace?industry=Horse+Racing#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={horseRacingStages} industry="Horse Racing" companies={horseRacingCompanies} />
        <IndustryCVBuilder industry="Horse Racing" stages={horseRacingStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Horse Racing"
      description="Trainers, jockeys, stable staff, racecourses, bloodstock and the business of British racing."
      profile="British horseracing is the country's second-largest spectator sport. The industry contributes over £4 billion to the UK economy each year and supports more than 85,000 jobs - across 59 racecourses, 550+ licensed trainers, the Newmarket and Lambourn training centres, world-class breeding operations, broadcasting, betting and bloodstock sales. From Royal Ascot and the Cheltenham Festival to early mornings on the gallops, careers span the saddle, the stable, the racecourse and the boardroom."
      industrySlug="horse-racing"
      tabs={tabs}
    />
  );
};

export default HorseRacing;
