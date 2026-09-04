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
import { Landmark, Vote, Building2, BookOpen, Megaphone } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";

const politicsStages: CareerStage[] = [
  {
    title: "Civil Service",
    icon: Landmark,
    roles: [
      { name: "Administrative Officer (AO)", description: "Entry-level operational delivery — processing claims, running front-line services, no degree required. The most common way into a department.", salary: "£25k–£27k" },
      { name: "Policy Advisor", description: "Drafts and develops government policy — the largest and most iconic civil service function.", salary: "£30k–£45k" },
      { name: "Civil Service Fast Streamer", description: "The flagship 2-year accelerated leadership scheme across 17 specialisms (Policy, Diplomatic, Economics, Digital and more) — hugely competitive, success rates vary from under 1% to ~6% depending on the stream.", salary: "£28k–£35k (rising fast)" },
      { name: "Government Economist / Statistician", description: "Analyses economic and social data feeding directly into Treasury and departmental decisions (Government Economic Service / Government Statistical Service).", salary: "£35k–£60k" },
      { name: "Private Secretary", description: "Directly supports a minister or senior official day-to-day — briefings, diary, decisions. A common fast-track developmental posting.", salary: "£40k–£65k" },
      { name: "Deputy Director / Permanent Secretary", description: "Senior Civil Service leadership — from heading a branch (Deputy Director) up to running an entire department (Permanent Secretary).", salary: "£80k–£200k+" },
    ],
  },
  {
    title: "Parliament & Elected Politics",
    icon: Vote,
    roles: [
      { name: "Caseworker", description: "Handles constituent casework for an individual MP — immigration, housing, benefits, NHS complaints. Employed directly by the MP, not Parliament.", salary: "£25k–£30k" },
      { name: "Parliamentary Researcher", description: "Westminster-based — drafts speeches and briefings, monitors debates and select committees, handles political correspondence for an MP.", salary: "£25k–£35k" },
      { name: "House of Commons Library Researcher", description: "Produces impartial policy research briefings for any MP on any topic — employed by the parliamentary service, not an individual politician.", salary: "£30k–£45k" },
      { name: "Hansard Reporter", description: "Verbatim transcriber of debates in the Commons and Lords — trains toward a Diploma in Parliamentary Reporting, no politics background required.", salary: "£30k–£45k" },
      { name: "Special Adviser (SpAd)", description: "A political appointee working for a minister — unlike career civil servants, SpAds can give explicitly partisan advice and aren't bound by political impartiality rules.", salary: "£45k–£100k+" },
      { name: "Office Manager / Chief of Staff", description: "The most senior generalist role in an MP's office, sometimes combined with leading on policy.", salary: "£40k–£55k+" },
    ],
  },
  {
    title: "Local Government",
    icon: Building2,
    roles: [
      { name: "Planning Officer", description: "Assesses planning applications and works toward RTPI chartered status — a genuine UK-wide shortage occupation right now.", salary: "£28k–£45k" },
      { name: "Environmental Health Officer", description: "Food safety, licensing enforcement, noise/nuisance and health & safety at work — requires an EHORB-accredited qualification.", salary: "£30k–£48k" },
      { name: "Electoral Services Officer", description: "Runs elections, referendums and the annual canvass — recruits and manages the temporary polling-day workforce. A real permanent career, unlike polling-day staff.", salary: "£26k–£40k" },
      { name: "Democratic Services Officer", description: "Clerks council meetings and manages council governance — one of the least-known but most structurally important local government jobs.", salary: "£25k–£38k" },
      { name: "Housing Officer", description: "Homelessness prevention, tenancy management and housing allocations for a local authority.", salary: "£26k–£38k" },
      { name: "Head of Service / Director", description: "Senior local government leadership — real budgets and real community impact reached faster than in Whitehall.", salary: "£60k–£110k+" },
    ],
  },
  {
    title: "Think Tanks & Policy Research",
    icon: BookOpen,
    roles: [
      { name: "Research Assistant", description: "Entry point into policy research — literature reviews, data analysis, drafting sections of a report, often project-funded.", salary: "£25k–£32k" },
      { name: "Research Fellow", description: "Leads a research programme (e.g. 'Head of Housing'), publishes under their own name, becomes a media commentator on their subject.", salary: "£35k–£55k" },
      { name: "Programme Manager", description: "Coordinates multi-stakeholder research projects, often involving funders, government departments or corporate partners.", salary: "£32k–£50k" },
      { name: "Communications / Press Officer", description: "Pitches think tank findings to journalists — think tanks live or die by media pickup, making this a genuinely central role.", salary: "£28k–£45k" },
      { name: "Programme Director", description: "The most senior research leadership role, setting a think tank's strategic direction on a policy area.", salary: "£55k–£90k+" },
    ],
  },
  {
    title: "Public Affairs & Government Relations",
    icon: Megaphone,
    roles: [
      { name: "Public Affairs Executive", description: "Agency-side — monitors legislation, drafts consultation responses, arranges MP and minister meetings for corporate or NGO clients.", salary: "£26k–£38k" },
      { name: "Government Relations Manager", description: "In-house at a company or charity — the common 'second act' for ex-SpAds, ex-researchers and ex-journalists moving out of Westminster.", salary: "£45k–£70k" },
      { name: "Public Affairs Consultant", description: "Senior agency role advising clients on political risk, reputation and stakeholder engagement strategy.", salary: "£50k–£85k" },
      { name: "Head of Public Affairs", description: "Senior in-house leadership — building and running a company's entire government relations function.", salary: "£80k–£130k+" },
    ],
  },
];

const newsfeed = [
  { title: "Institute for Government", url: "https://www.instituteforgovernment.org.uk" },
  { title: "PoliticsHome", url: "https://www.politicshome.com" },
  { title: "The House Magazine", url: "https://www.politicshome.com/thehouse" },
];

const politicsCompanies = [
  { name: "UK Parliament", founded: "1707", hq: "Westminster, London", overview: "The House of Commons and House of Lords — the institutional employer for parliamentary staff (Clerks, Hansard, Library researchers), separate from individual MPs' own offices.", url: "https://www.parliament.uk/about/careers/", valueChainStage: "Parliament & Elected Politics" },
  { name: "Cabinet Office", founded: "1916", hq: "Whitehall, London", overview: "Coordinates government, supports the Prime Minister, and runs the Civil Service Fast Stream.", url: "https://www.gov.uk/government/organisations/cabinet-office", valueChainStage: "Civil Service" },
  { name: "HM Treasury", founded: "1660s", hq: "Whitehall, London", overview: "Sets economic and fiscal policy and controls public spending — the department every Budget comes from.", url: "https://www.gov.uk/government/organisations/hm-treasury", valueChainStage: "Civil Service" },
  { name: "Home Office", founded: "1782", hq: "Westminster, London", overview: "Policing, immigration, borders and counter-terrorism policy.", url: "https://www.gov.uk/government/organisations/home-office", valueChainStage: "Civil Service" },
  { name: "Foreign, Commonwealth & Development Office", founded: "1782", hq: "Westminster, London", overview: "UK foreign policy, diplomacy and international development — home of the highly competitive Diplomatic Fast Stream.", url: "https://www.gov.uk/government/organisations/foreign-commonwealth-development-office", valueChainStage: "Civil Service" },
  { name: "National Audit Office", founded: "1983", hq: "London", overview: "Audits government spending for value-for-money. Runs a well-regarded graduate scheme that combines real audit work with a funded ACA accountancy qualification.", url: "https://www.nao.org.uk/careers/", valueChainStage: "Think Tanks & Policy Research" },
  { name: "Local Government Association", founded: "1997", hq: "London", overview: "The national voice for English councils — lobbies central government on their behalf. Does not employ council staff directly, but runs its own small policy team and backs the National Graduate Development Programme.", url: "https://www.local.gov.uk/about/jobs", valueChainStage: "Local Government" },
  { name: "Institute for Government", founded: "2008", hq: "London", overview: "The most widely-respected non-partisan UK think tank, focused on how government actually works — Whitehall effectiveness, ministerial handovers, machinery of government.", url: "https://www.instituteforgovernment.org.uk/about-us/vacancies", valueChainStage: "Think Tanks & Policy Research" },
  { name: "IPPR", founded: "1988", hq: "London", overview: "The UK's leading progressive think tank, working across the economy, climate, health and migration.", url: "https://www.ippr.org/about-us/jobs", valueChainStage: "Think Tanks & Policy Research" },
  { name: "Centre for Policy Studies", founded: "1974", hq: "London", overview: "Free-market, right-leaning think tank founded by Keith Joseph and Margaret Thatcher.", url: "https://cps.org.uk/about/jobs/", valueChainStage: "Think Tanks & Policy Research" },
  { name: "Electoral Commission", founded: "2000", hq: "London", overview: "Independent regulator of UK elections, referendums and political party finance.", url: "https://www.electoralcommission.org.uk/who-we-are/jobs", valueChainStage: "Local Government" },
  { name: "FGS Global", founded: "2021", hq: "London", overview: "One of the largest global public affairs and strategic communications firms, with a structured UK graduate programme — a common route from Westminster into the private sector.", url: "https://fgsglobal.com/join-us/", valueChainStage: "Public Affairs & Government Relations" },
  { name: "Department for Work and Pensions", founded: "2001", hq: "London", glassdoor: 3.8, overview: "The UK's largest public service department, administering the State Pension and working-age, disability and ill-health benefits.", url: "https://www.civil-service-careers.gov.uk/dwp-our-careers/", valueChainStage: "Civil Service" },
  { name: "Ofgem", founded: "2000", hq: "London", glassdoor: 3.6, overview: "The UK government regulator for the electricity and gas markets in Great Britain, based at Canary Wharf.", url: "https://www.ofgem.gov.uk/about-us/join-ofgem/work-ofgem", valueChainStage: "Civil Service" },
];

const Politics = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-6">Coming soon — episodes unpacking how UK government, Parliament and policy really work.</p>
          <PodcastPlayer industry="politics" />
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
          <PodcastGrid podcasts={[
            { title: "The Institute for Government Podcast", description: "How Whitehall and government really work, explained by the people who study it closest.", url: "https://www.instituteforgovernment.org.uk/podcasts" },
            { title: "Newscast", description: "BBC's daily politics podcast unpacking the day's biggest UK political stories.", url: "https://www.bbc.co.uk/programmes/p05299nl" },
            { title: "The Rest Is Politics", description: "Alastair Campbell and Rory Stewart on the ideas and personalities shaping UK and global politics.", url: "https://open.spotify.com/show/2sjIvsOhb1MpqLoiIWfLtj" },
            { title: "Political Currency", description: "Ed Balls and George Osborne — a Labour and Conservative former Chancellor on how decisions actually get made.", url: "https://open.spotify.com/show/3H5g0uHVXmTdCXolqvOvXK" },
          ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="politics" />
          <LiveArticles industry="politics" fallbackArticles={[
            { title: "Institute for Government — Explainers", source: "Institute for Government", url: "https://www.instituteforgovernment.org.uk/explainers" },
            { title: "PoliticsHome News", source: "PoliticsHome", url: "https://www.politicshome.com" },
            { title: "Working for an MP — A Beginner's Guide", source: "w4mp", url: "https://w4mp.org" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="politics" />
            <div className="mt-4">
              <BreakingNewsFeed industry="politics" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="politics" />
          </div>
        </>
      ),
    },
    {
      id: "watch",
      label: "Watch",
      content: (
        <>
          <VideoShowcase heading="Unpacking on Screen" clips={industryVideos["politics"] || []} />
          <div className="mt-12">
            <YouTubeChannels industry="politics" />
            <TikTokCreators industry="politics" />
          </div>
        </>
      ),
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={politicsCompanies} />
          <div className="mt-12">
            <DayInTheLife industry="politics" />
          </div>
          
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <CareerMap title="Where You Fit In" subtitle="From a council planning office to the Cabinet Office — every route into UK politics and government." stages={politicsStages} industry="politics" />
          <div className="mt-12"><IndustryRolesLink industry="Politics" /></div>
          <ExploreFurther links={[
            { title: "Civil Service Careers", description: "Official hub for civil service professions, the Fast Stream, and entry routes including apprenticeships.", url: "https://www.civil-service-careers.gov.uk" },
            { title: "w4mp — Working for an MP", description: "The definitive jobs board and guide for anyone working for an MP in Westminster.", url: "https://w4mp.org" },
            { title: "Institute for Government", description: "The best plain-English explainers on how UK government and Whitehall actually work.", url: "https://www.instituteforgovernment.org.uk/explainers" },
            { title: "Local Government Association — Careers", description: "Routes into local government including the National Graduate Development Programme.", url: "https://www.local.gov.uk/about/jobs" },
          ]} />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Politics" searchQuery="UK politics government policy events conferences" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <TheDownload industry="Politics" slug="politics" />
          <CoursesSection industry="politics" />
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Live politics & government jobs<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across civil service, Parliament, local government, think tanks and public affairs.</p>
            <Link to="/marketplace?industry=Politics#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Jobs
            </Link>
          </div>
          <IndustryRolesShowcase stages={politicsStages} industry="Politics" companies={politicsCompanies} />
          <IndustryCVBuilder industry="Politics" stages={politicsStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Politics"
      description="Whitehall, Westminster, town halls and think tanks — every way to build a career shaping how the UK is run."
      profile="Politics isn't just Question Time and special advisers — the vast majority of people doing genuinely political and policy work in the UK are in a council planning office, a civil service department, or a think tank, not on TV. From an Administrative Officer processing claims at a government department, to a caseworker helping constituents in an MP's office, to a council Electoral Services Officer running the next election — this industry spans apolitical career civil servants, political appointees, elected representatives and the researchers, regulators and consultants who sit around them."
      tabs={tabs}
    />
  );
};

export default Politics;
