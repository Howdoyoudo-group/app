import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Headphones } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Headphones, roles: [
    { name: "Customer Service Advisor", description: "Phone, email and chat - answers product, order, returns and account queries.", salary: "£21k–£25k + shift bonus" },
    { name: "Live Chat / Social Care Agent", description: "Handles brand inbound on chat, Instagram, Twitter and review platforms.", salary: "£22k–£26k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Senior Advisor / Specialist", description: "Handles complex / escalated cases - refunds, complaints, technical issues.", salary: "£26k–£32k" },
    { name: "Team Leader (5–15 advisors)", description: "Day-to-day people manager - coaching, QA, shift performance.", salary: "£30k–£38k + bonus" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Operations Manager", description: "Runs a contact centre site or function - staffing, performance, P&L.", salary: "£45k–£60k + bonus" },
    { name: "CX / Voice of Customer Manager", description: "Owns customer experience programme - NPS, journey design, voice of customer.", salary: "£45k–£65k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head of Customer Service / Customer Operations", description: "Runs the whole CS function - strategy, tooling, multi-site teams.", salary: "£75k–£120k+" },
    { name: "Chief Customer Officer", description: "Board-level - owns customer experience across the whole business.", salary: "£150k–£300k+" },
  ]},
];

const podcasts = [
  { title: "Customer Experience Podcast (CXM)", description: "UK customer experience podcast - leadership, tools and case studies.", url: "https://cxm.co.uk/podcasts/" },
  { title: "Customer Service Secrets", description: "Practical, weekly customer service and CX podcast.", url: "https://kustomer.com/blog/customer-service-secrets-podcast/" },
];

const articles = [
  { title: "Customer Experience Magazine (CXM)", source: "CXM", url: "https://cxm.co.uk/" },
  { title: "Engage Customer", source: "Engage Customer", url: "https://engagecustomer.com/" },
  { title: "Institute of Customer Service", source: "ICS", url: "https://www.instituteofcustomerservice.com/news/" },
];

const CustomerService = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Customer Service" data={{
        summary: "Customer service roles are the front line of every retailer, brand and platform. They answer the calls, emails, chats and DMs when something has gone wrong (or right) for the customer. It's one of the largest entry-level functions in UK business - and one of the most under-rated career launchpads. Many CFOs, COOs and CEOs of consumer brands started in CS because it teaches the business inside out.",
        dayToDay: ["Inbound calls, emails, chat and social DMs", "Order tracking, refunds and returns", "Handling complaints - empathy plus action", "Logging tickets in the CRM (Zendesk, Freshdesk, Salesforce Service Cloud)", "Escalating systemic issues to product / ops", "Hitting CSAT, NPS and SLA targets"],
        skills: ["Active Listening", "Conflict Resolution & De-escalation", "CRM Software (Zendesk, Salesforce, Freshdesk)", "Written Communication", "Process & SLA Awareness", "Empathy under Pressure"],
        traits: ["Genuinely cares about resolving the customer's issue", "Calm with frustrated, occasionally rude callers", "Fast learner - product knowledge is everything", "Resilient - bad days are normal"],
        salary: "£21k advisor → £300k+ Chief Customer Officer",
        entryTip: "Routes in: Apply directly to retailers, brands and platforms (ASOS, Amazon, John Lewis, Octopus Energy, Monzo, Bulb). No formal qualifications needed. Level 2/3 Customer Service Practitioner Apprenticeship is the formal route. Octopus Energy, Monzo and Starling Bank in particular are known for hiring strongly from CS into product, ops and commercial roles.",
      }} />
      <CareerMap title="Customer Service Career Path" subtitle="From advisor to Chief Customer Officer." stages={careerStages} industry="grocery" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="customer-service" roleName="Customer Service" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Grocery" searchQuery="customer experience CX conference UK Institute of Customer Service" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live customer service roles across UK retailers, brands and platforms.</p><Link to="/marketplace?role=customer-service#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View CS Jobs</Link></div><IndustryCVBuilder industry="Grocery" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Customer Service" description="Front-line care for customers - solving problems on phone, email and chat for retailers, brands and platforms." tabs={tabs} category="frontline" />;
};

export default CustomerService;
