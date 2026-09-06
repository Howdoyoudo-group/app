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
import { Heart, Target, HandCoins, Settings, Users, BarChart3 } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import charityCareerMap from "@/assets/charity-career-map.png";
import PodcastGrid from "@/components/PodcastGrid";

const charityStages: CareerStage[] = [
  { title: "Mission & Cause", icon: Heart, roles: [
    { name: "Founder / CEO", description: "Sets the strategic vision and leads the organisation.", salary: "£50k–£120k+" },
    { name: "Trustee", description: "Provides governance and oversight on a voluntary basis.", salary: "Voluntary" },
    { name: "Policy Adviser", description: "Researches and develops policy positions.", salary: "£30k–£55k" },
    { name: "Research Analyst", description: "Conducts research to evidence the charity's impact.", salary: "£28k–£45k" },
    { name: "Advocacy Manager", description: "Leads public campaigns and lobbying efforts.", salary: "£32k–£55k" },
    { name: "Campaign Director", description: "Designs and manages large-scale campaigns.", salary: "£40k–£65k" },
    { name: "Public Affairs Lead", description: "Manages relationships with politicians and media.", salary: "£35k–£60k" },
  ]},
  { title: "Strategy", icon: Target, roles: [
    { name: "Head of Strategy", description: "Develops the organisation's long-term strategic plan.", salary: "£45k–£75k" },
    { name: "Business Development Manager", description: "Identifies new income streams and growth opportunities.", salary: "£32k–£55k" },
    { name: "Partnerships Manager", description: "Builds relationships with corporate partners and funders.", salary: "£30k–£50k" },
    { name: "Impact Director", description: "Defines how the charity measures success.", salary: "£45k–£70k" },
    { name: "Innovation Lead", description: "Explores new approaches and technologies.", salary: "£35k–£60k" },
    { name: "Programme Designer", description: "Designs new programmes based on beneficiary needs.", salary: "£30k–£50k" },
  ]},
  { title: "Fundraising", icon: HandCoins, roles: [
    { name: "Head of Fundraising", description: "Leads the fundraising team and strategy.", salary: "£45k–£75k" },
    { name: "Major Donor Manager", description: "Cultivates relationships with high-net-worth individuals.", salary: "£35k–£60k" },
    { name: "Grants Manager", description: "Manages applications to trusts and foundations.", salary: "£28k–£45k" },
    { name: "Events Fundraiser", description: "Plans and delivers fundraising events.", salary: "£25k–£40k" },
    { name: "Digital Fundraiser", description: "Runs online fundraising campaigns.", salary: "£26k–£42k" },
    { name: "Legacy Manager", description: "Manages the legacy giving programme.", salary: "£30k–£48k" },
    { name: "Corporate Partnerships Manager", description: "Secures partnerships with businesses.", salary: "£32k–£55k" },
  ]},
  { title: "Operations", icon: Settings, roles: [
    { name: "Operations Director", description: "Oversees finance, HR, IT, and facilities.", salary: "£45k–£75k" },
    { name: "Finance Manager", description: "Manages budgets and financial reporting.", salary: "£35k–£55k" },
    { name: "HR Manager", description: "Leads people management and volunteer coordination.", salary: "£32k–£50k" },
    { name: "Compliance Officer", description: "Ensures regulatory and governance requirements.", salary: "£30k–£48k" },
    { name: "Safeguarding Lead", description: "Develops safeguarding policies.", salary: "£32k–£50k" },
    { name: "IT Manager", description: "Manages technology infrastructure.", salary: "£35k–£55k" },
    { name: "Facilities Coordinator", description: "Manages office spaces and equipment.", salary: "£25k–£35k" },
  ]},
  { title: "Delivery", icon: Users, roles: [
    { name: "Programme Manager", description: "Manages delivery of specific programmes.", salary: "£32k–£50k" },
    { name: "Project Officer", description: "Supports project delivery.", salary: "£25k–£35k" },
    { name: "Volunteer Coordinator", description: "Recruits, trains, and manages volunteers.", salary: "£25k–£35k" },
    { name: "Community Worker", description: "Works directly with communities.", salary: "£25k–£35k" },
    { name: "Outreach Worker", description: "Engages hard-to-reach groups.", salary: "£25k–£33k" },
    { name: "Caseworker", description: "Provides direct one-to-one support.", salary: "£25k–£35k" },
    { name: "Service Manager", description: "Leads a team of frontline staff.", salary: "£30k–£48k" },
  ]},
  { title: "Impact & Reporting", icon: BarChart3, roles: [
    { name: "M&E Manager", description: "Designs monitoring and evaluation frameworks.", salary: "£32k–£52k" },
    { name: "Data Analyst", description: "Analyses programme and organisational data.", salary: "£28k–£45k" },
    { name: "Impact Officer", description: "Collects and reports on impact data.", salary: "£26k–£40k" },
    { name: "Report Writer", description: "Produces reports for funders and stakeholders.", salary: "£26k–£40k" },
    { name: "Communications Manager", description: "Leads external communications.", salary: "£30k–£50k" },
    { name: "PR Officer", description: "Generates media coverage.", salary: "£26k–£42k" },
    { name: "Digital Content Creator", description: "Produces content across channels.", salary: "£25k–£38k" },
  ]},
];

const newsfeed = [
  { title: "Third Sector", url: "https://www.thirdsector.co.uk" },
  { title: "Civil Society News", url: "https://www.civilsociety.co.uk" },
  { title: "Charity Times", url: "https://www.charitytimes.com" },
];

const charityCompanies = [
  { name: "Blackbaud", url: "https://careers.blackbaud.com", founded: "1981", hq: "Charleston, USA (UK: London)", glassdoor: 3.5, overview: "The leading CRM and fundraising software provider for charities.", valueChainStage: "Operations" },
  { name: "Charities Aid Foundation", url: "https://www.cafonline.org/about-us/careers", founded: "1924", hq: "Kent", glassdoor: 3.5, overview: "CAF provides fundraising infrastructure for charities.", valueChainStage: "Fundraising" },
  { name: "Charity: Water", url: "https://www.charitywater.org", founded: "2006", hq: "New York", glassdoor: 4.3, trustpilot: 3.2, overview: "A nonprofit famous for its 100% model.", valueChainStage: "Fundraising" },
  { name: "Crisis", url: "https://www.crisis.org.uk", founded: "1967", hq: "London", glassdoor: 4.0, trustpilot: 4.1, overview: "The national charity for people experiencing homelessness.", valueChainStage: "Delivery" },
  { name: "Mental Health Innovations", url: "https://giveusashout.org", founded: "2017", hq: "London", glassdoor: 3.9, trustpilot: 4.3, overview: "The charity behind Shout 85258 text messaging support.", valueChainStage: "Delivery" },
  { name: "NCVO", url: "https://www.ncvo.org.uk", founded: "1919", hq: "London", glassdoor: 3.6, overview: "The umbrella body for charities in England.", valueChainStage: "Strategy" },
  { name: "Eastside People", url: "https://www.eastsidepeople.org", founded: "2006", hq: "Birmingham", overview: "A consultancy specialising in strategy, leadership, and governance for charities and social enterprises.", valueChainStage: "Strategy" },
  { name: "Save the Children UK", url: "https://jobs.savethechildren.org.uk/jobs/", founded: "1919", hq: "London", glassdoor: 3.7, trustpilot: 1.9, profileUrl: "/company/save-the-children", overview: "One of the UK's largest charities, working in over 100 countries.", valueChainStage: "Mission & Cause" },
  { name: "The Trussell Trust", url: "https://www.trusselltrust.org", founded: "1997", hq: "Salisbury", glassdoor: 4.1, trustpilot: 3.8, overview: "The UK's largest food bank network.", valueChainStage: "Delivery" },
  { name: "Oxfam GB", url: "https://jobs.oxfam.org.uk", founded: "1942", hq: "Oxford", glassdoor: 3.8, trustpilot: 3.6, overview: "One of the UK's best-known international development charities - 580+ shops and global humanitarian programmes.", valueChainStage: "Mission & Cause" },
  { name: "Comic Relief", url: "https://www.comicrelief.com/jobs/", founded: "1985", hq: "London", glassdoor: 3.9, overview: "The fundraising charity behind Red Nose Day and Sport Relief.", valueChainStage: "Fundraising" },
  { name: "Motability Foundation", url: "https://www.motability.org.uk/about/careers/", founded: "1977", hq: "Harlow", glassdoor: 4.0, overview: "The national charity helping disabled people access transport - funds the Motability Scheme.", valueChainStage: "Mission & Cause" },
  { name: "British Heart Foundation", url: "https://jobs.bhf.org.uk/", founded: "1961", hq: "London", glassdoor: 3.9, overview: "The UK's leading heart and circulatory disease charity, funding research and running a national chain of charity shops.", valueChainStage: "Mission & Cause" },
  { name: "British Red Cross", url: "https://careers.redcross.org.uk/", founded: "1870", hq: "London", glassdoor: 3.6, overview: "The UK arm of the international Red Cross movement, providing emergency response, crisis support and first aid services.", valueChainStage: "Mission & Cause" },
];

const Charity = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring how charities fundraise, campaign, and navigate the pressures of public trust.</p>

          <PodcastPlayer industry="charity" />

          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
              { title: "Charity Chat", description: "Conversations with charity leaders on fundraising, leadership, and impact.", url: "https://charitychat.org.uk/" },
              { title: "The Fundraising Podcast", description: "Practical tips and strategies for charity fundraisers.", url: "https://www.civilsociety.co.uk/fundraising" },
              { title: "Reasons to be Cheerful", description: "Ed Miliband's podcast exploring solutions - often featuring charity-led initiatives.", url: "https://www.cheerfulpodcast.com/" },
              { title: "The Good Future Podcast", description: "How charities and social enterprises are building a better world.", url: "https://www.civilsociety.co.uk" },
            ]} />
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <DailyBriefing industry="charity" />
          <LiveArticles industry="charity" fallbackArticles={[
            { title: "The State of the UK Charity Sector in 2026", source: "Third Sector", url: "https://www.thirdsector.co.uk" },
            { title: "How Charities Are Adapting to the Cost of Living Crisis", source: "Civil Society", url: "https://www.civilsociety.co.uk" },
            { title: "Digital Fundraising: What's Working and What's Not", source: "Charity Digital", url: "https://charitydigital.org.uk" },
            { title: "CEO Pay in Charities: The Debate That Won't Go Away", source: "Third Sector", url: "https://www.thirdsector.co.uk" },
            { title: "Why Young People Are Choosing Charity Careers", source: "The Guardian", url: "https://www.theguardian.com/voluntary-sector-network" },
          ]} />
          <div className="mt-12">
            <NewsfeedModal sources={newsfeed} industry="charity" />
            <div className="mt-4">
              <BreakingNewsFeed industry="charity" sources={newsfeed} />
            </div>
          </div>
          <div className="mt-12">
            <SubstackNewsletters industry="charity" />
          </div>
        </>
      ),
    },
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["charity"] || []} /><div className="mt-12"><YouTubeChannels industry="charity" /><TikTokCreators industry="charity" /></div></> },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <CompanyProfileGrid companies={charityCompanies} />
          <div className="mt-12"><DayInTheLife industry="charity" /></div>
          <div className="mt-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2>
            <img src={charityCareerMap} alt="The Charity Value Chain infographic" className="w-full rounded-sm" loading="lazy" />
          </div>
          
        </>
      ),
    },
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From mission to impact - the roles that power the third sector." stages={charityStages} industry="charity" />
          <div className="mt-12"><IndustryRolesLink industry="Charity" /></div>
        <ExploreFurther links={[
          { title: "NCVO - Working in the Voluntary Sector", description: "The National Council for Voluntary Organisations' career resources, training, and sector insights.", url: "https://www.ncvo.org.uk/get-involved/volunteering/" },
          { title: "Charity Job - Career Advice", description: "The UK's largest charity sector job board, with guides on breaking into and progressing in the third sector.", url: "https://www.charityjob.co.uk/careeradvice" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Charity" searchQuery="charity nonprofit fundraising" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Charity" slug="charity" />
          <CoursesSection industry="charity" />
        </>
      ) },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Good jobs for good people<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the charity sector.</p>
            <Link to="/marketplace?industry=Charity#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
          </div>
          <IndustryRolesShowcase stages={charityStages} industry="Charity" companies={charityCompanies} />
        <IndustryCVBuilder industry="Charity" stages={charityStages} />
        </>
      ),
    },
  ];

  return (
    <IndustryPageLayout
      name="Charity"
      description="Fundraising, campaigning, governance, and the people powering the UK's £60 billion charity sector."
      profile="The UK charity sector spans fundraising, service delivery, advocacy, and governance across thousands of organisations. It employs roughly 950,000 to 1.1 million people, making it one of the country's largest social sectors alongside millions of volunteers. Its impact reaches across healthcare, education, and social support, operating at both grassroots and global levels."
      tabs={tabs}
    />
  );
};

export default Charity;
