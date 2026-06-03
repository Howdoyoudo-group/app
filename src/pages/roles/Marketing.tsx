import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, TrendingUp, Users, Target, Megaphone, BarChart3 } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import CoursesSection from "@/components/CoursesSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import { industryToSlug } from "@/data/roles";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";
import type { RoleOverviewData } from "@/components/RoleOverview";

const marketingInIndustries = [
  { industry: "Fashion", examples: [{ company: "ASOS", role: "Brand & Creative Marketing", profileUrl: "/company/asos" }, { company: "Burberry", role: "Digital Marketing", profileUrl: "/company/burberry" }, { company: "ME+EM", role: "Performance Marketing", profileUrl: "/company/me-em" }], slug: "/fashion" },
  { industry: "Coffee", examples: [{ company: "Grind", role: "Social Media & Brand", profileUrl: "/company/grind" }, { company: "Costa", role: "National Campaigns", profileUrl: "/company/costa" }, { company: "Blank Street", role: "Growth Marketing", profileUrl: "/company/blank-street" }], slug: "/coffee" },
  { industry: "Film and TV", examples: [{ company: "Netflix", role: "Content Marketing", profileUrl: "/company/netflix" }, { company: "Everyman", role: "Audience Development", profileUrl: "/company/everyman" }, { company: "Curzon", role: "Membership Marketing" }], slug: "/cinema" },
  { industry: "Football", examples: [{ company: "Premier League", role: "Global Brand", profileUrl: "/company/premier-league" }, { company: "Sky Sports", role: "Broadcast Marketing", profileUrl: "/company/sky-sports" }, { company: "Arsenal", role: "Fan Engagement" }], slug: "/football" },
  { industry: "Grocery", examples: [{ company: "Tesco", role: "Loyalty & CRM", profileUrl: "/company/tesco" }, { company: "Ocado", role: "Digital Marketing", profileUrl: "/company/ocado" }, { company: "Greggs", role: "Social Media", profileUrl: "/company/greggs" }], slug: "/grocery" },
  { industry: "Music", examples: [{ company: "DICE", role: "Growth Marketing", profileUrl: "/company/dice" }, { company: "Live Nation", role: "Event Promotion" }, { company: "Spotify", role: "Artist Marketing" }], slug: "/music" },
  { industry: "Hospitality", examples: [{ company: "Soho House", role: "Membership Marketing", profileUrl: "/company/soho-house" }, { company: "Five Guys", role: "Brand Campaigns", profileUrl: "/company/five-guys" }, { company: "Dishoom", role: "PR & Communications" }], slug: "/hospitality" },
  { industry: "Wellness", examples: [{ company: "Gymshark", role: "Influencer Marketing" }, { company: "Barry's", role: "Community Marketing" }, { company: "Huel", role: "Performance Marketing" }], slug: "/wellness" },
];

const careerStages: CareerStage[] = [
  {
    title: "Entry Level",
    icon: Target,
    roles: [
      { name: "Marketing Assistant", description: "Supports campaigns, manages social calendars, and coordinates marketing assets across channels.", salary: "£22k–£28k" },
      { name: "Social Media Coordinator", description: "Creates and schedules social content, monitors engagement, and reports on channel performance.", salary: "£23k–£30k" },
      { name: "Content Writer", description: "Writes blog posts, email copy, and website content aligned with brand voice and SEO strategy.", salary: "£24k–£30k" },
      { name: "Marketing Intern", description: "Rotates across marketing functions, gaining exposure to campaigns, analytics, and creative processes.", salary: "£20k–£24k" },
    ],
  },
  {
    title: "Mid Level",
    icon: Megaphone,
    roles: [
      { name: "Marketing Manager", description: "Owns campaign strategy and execution across channels, managing budgets and agency relationships.", salary: "£35k–£50k" },
      { name: "Brand Manager", description: "Guards and evolves brand identity, positioning, and messaging across all consumer touchpoints.", salary: "£38k–£55k" },
      { name: "Digital Marketing Manager", description: "Runs paid media, SEO/SEM, email marketing, and analytics to drive acquisition and retention.", salary: "£35k–£52k" },
      { name: "CRM Manager", description: "Designs and optimises customer lifecycle journeys, segmentation, and personalisation strategies.", salary: "£38k–£55k" },
      { name: "PR & Comms Manager", description: "Manages media relations, press coverage, crisis communications, and stakeholder messaging.", salary: "£35k–£52k" },
    ],
  },
  {
    title: "Senior Level",
    icon: BarChart3,
    roles: [
      { name: "Head of Marketing", description: "Leads the marketing function, setting strategy, managing teams, and reporting to the C-suite.", salary: "£55k–£80k" },
      { name: "Head of Brand", description: "Owns the brand strategy end-to-end, from creative direction to consumer perception and positioning.", salary: "£60k–£85k" },
      { name: "Head of Digital", description: "Leads all digital channels and performance marketing, driving data-led growth strategies.", salary: "£58k–£82k" },
      { name: "Head of Content", description: "Sets content strategy across editorial, social, and video, managing creative teams and agencies.", salary: "£55k–£78k" },
    ],
  },
  {
    title: "Leadership",
    icon: TrendingUp,
    roles: [
      { name: "Marketing Director", description: "Shapes the overall marketing vision, aligning brand and commercial goals with business strategy.", salary: "£80k–£120k" },
      { name: "VP of Marketing", description: "Oversees multiple marketing functions and teams, driving growth across markets and channels.", salary: "£90k–£140k" },
      { name: "Chief Marketing Officer", description: "C-suite leader responsible for the entire marketing organisation, brand equity, and revenue growth.", salary: "£120k–£200k+" },
    ],
  },
];

const podcasts = [
  { title: "Marketing Over Coffee", description: "Weekly discussion covering both classic and new marketing, blending traditional and digital tactics.", url: "https://www.marketingovercoffee.com/" },
  { title: "Everyone Hates Marketers", description: "No-BS marketing strategies with a focus on standing out, not fitting in.", url: "https://www.everyonehatesmarketers.com/" },
  { title: "The Marketing Meetup Podcast", description: "UK-based marketing community sharing honest, practical advice from real marketers.", url: "https://themarketingmeetup.com/podcast/" },
  { title: "The Diary of a CEO", description: "Steven Bartlett interviews marketers, founders, and creative leaders on growth and brand building.", url: "https://www.youtube.com/@TheDiaryOfACEO" },
];

const articles = [
  { title: "The Drum - Marketing News", source: "The Drum", url: "https://www.thedrum.com/" },
  { title: "Marketing Week - Strategy & Insights", source: "Marketing Week", url: "https://www.marketingweek.com/" },
  { title: "Campaign - Creative & Advertising", source: "Campaign", url: "https://www.campaignlive.co.uk/" },
  { title: "Econsultancy - Digital Marketing", source: "Econsultancy", url: "https://econsultancy.com/" },
];


const Marketing = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2>
          <div className="space-y-4 mb-12">
            {podcasts.map((pod) => (
              <a key={pod.url} href={pod.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
                <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{pod.title}</h3>
                <p className="text-muted-foreground font-body text-xs mt-1">{pod.description}</p>
              </a>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2>
          <div className="space-y-4 mb-12">
            {articles.map((a) => (
              <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
                <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3>
                <p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p>
              </a>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "watch",
      label: "Watch",
      content: <RoleWatchSection roleSlug="marketing" roleName="Marketing" />,
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Marketing Exists<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-8">Marketing looks different in every industry. Here's where this role shows up - and what it looks like.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketingInIndustries.map((item) => (
              <div
                key={item.industry}
                className="border border-border p-5 hover:border-primary transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <IndustryIcon industry={item.industry} />
                  <Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">
                    Marketing in {item.industry}
                  </Link>
                </div>
                <ul className="space-y-1">
                  {item.examples.map((ex) => (
                    <li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full shrink-0" />
                      {ex.profileUrl ? (
                        <Link to={ex.profileUrl} className="hover:text-primary transition-colors">
                          <span className="font-600 text-foreground">{ex.company}</span> - {ex.role}
                        </Link>
                      ) : (
                        <span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">
                  Explore industry <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <RoleOverview
            name="Marketing"
            data={{
              summary: "Marketing is the engine that connects a brand to its audience. It covers everything from social media and content creation to data-driven campaigns, partnerships, and brand strategy. Every industry needs marketers - and the role looks different depending on where you work.",
              dayToDay: [
                "Planning and executing campaigns across digital and offline channels",
                "Writing copy for social media, email, websites, and ads",
                "Analysing performance data to optimise spend and engagement",
                "Briefing designers, agencies, and content creators",
                "Managing brand guidelines, tone of voice, and messaging",
                "Coordinating product launches, events, and PR activity",
              ],
              skills: [
                "Copywriting",
                "Data & Analytics",
                "Social Media",
                "SEO / SEM",
                "CRM & Email",
                "Paid Media",
                "Brand Strategy",
                "Stakeholder Management",
              ],
              traits: [
                "You're naturally curious about why people buy things",
                "You love both creative ideas and hard numbers",
                "You're a strong communicator - written and verbal",
                "You keep up with trends without losing sight of strategy",
                "You're comfortable juggling multiple projects at once",
              ],
              salary: "£22k–£28k",
              entryTip: "Many marketers start as assistants or interns - but freelance projects, personal blogs, and social media portfolios can fast-track your way in. A CIM qualification or Google Digital Marketing certificate helps, but real-world experience matters most.",
            }}
          />
          <CareerMap
            title="Marketing Career Path"
            subtitle="From entry-level coordinator to CMO - the typical progression for marketing professionals."
            stages={careerStages}
            industry="marketing"
          />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Marketing" searchQuery="marketing conference" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Courses & Certifications<span className="text-primary">.</span></h2>
          <div className="space-y-4">
            {[
              { title: "Google Digital Marketing Certificate", description: "Free certification covering SEO, SEM, analytics, and digital advertising fundamentals.", url: "https://grow.google/intl/uk/courses-and-tools/" },
              { title: "CIM (Chartered Institute of Marketing)", description: "The gold-standard UK marketing qualification - from Foundation to Chartered Marketer.", url: "https://www.cim.co.uk/qualifications/" },
              { title: "HubSpot Academy", description: "Free courses on inbound marketing, content strategy, social media, and email marketing.", url: "https://academy.hubspot.com/" },
              { title: "Meta Blueprint", description: "Official training for Facebook and Instagram advertising, from basics to advanced.", url: "https://www.facebook.com/business/learn" },
            ].map((course) => (
              <a key={course.url} href={course.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
                <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-muted-foreground font-body text-xs mt-1">{course.description}</p>
              </a>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live marketing roles across all industries.</p>
            <Link to="/marketplace?role=Marketing#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Marketing Jobs
            </Link>
          </div>
          <IndustryCVBuilder industry="Marketing" stages={careerStages} />
        </>
      ),
    },
  ];

  return (
    <RolePageLayout
      name="Marketing"
      description="Brand strategy, digital campaigns, and storytelling - the people who shape how industries talk to the world."
      tabs={tabs}
      category="business"
    />
  );
};

export default Marketing;
