import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Heart } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Heart, roles: [
    { name: "Fundraising Assistant", description: "Supports a fundraising team with admin, donor communications, and events.", salary: "£22k–£26k" },
    { name: "Community Fundraiser", description: "Builds local supporter networks - runs, bake sales, school appeals.", salary: "£24k–£30k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Individual Giving Manager", description: "Owns donor acquisition and retention through direct mail, email, and digital.", salary: "£32k–£42k" },
    { name: "Corporate Partnerships Manager", description: "Builds and grows partnerships with companies for sponsorship and CSR funding.", salary: "£35k–£48k" },
    { name: "Trusts & Foundations Manager", description: "Researches and writes funding bids to grant-making bodies.", salary: "£32k–£45k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head of Fundraising", description: "Leads the fundraising strategy and team across multiple income streams.", salary: "£50k–£70k" },
    { name: "Major Donor Lead", description: "Cultivates high-value relationships with philanthropists and patrons.", salary: "£45k–£65k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Director of Fundraising", description: "Sets the income strategy and sits on the senior leadership team.", salary: "£70k–£110k" },
  ]},
];

const podcasts = [
  { title: "The Fundraising Everywhere Podcast", description: "Practical insights from fundraisers across the sector.", url: "https://fundraisingeverywhere.com/podcast/" },
  { title: "Charity Chat", description: "Conversations on UK charity leadership and fundraising.", url: "https://www.civilsociety.co.uk/" },
];

const articles = [
  { title: "Chartered Institute of Fundraising", source: "CIoF", url: "https://ciof.org.uk/" },
  { title: "Civil Society / Fundraising", source: "Civil Society", url: "https://www.civilsociety.co.uk/fundraising.html" },
  { title: "Third Sector", source: "Third Sector", url: "https://www.thirdsector.co.uk/" },
];

const CharityFundraiser = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="charity-fundraiser" roleName="Charity Fundraiser" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Charity Fundraiser" data={{ summary: "Charity fundraisers secure the income that makes charitable work possible - from individual donations and community events to corporate partnerships, trusts, and major gifts. It's a strategic, relationship-driven role where storytelling and stewardship matter as much as numbers.", dayToDay: ["Planning campaigns and donor journeys", "Writing appeals, applications and pitches", "Building relationships with donors, companies and grant-makers", "Running events - challenges, galas, community fundraisers", "Reporting on income performance and donor retention", "Working with programmes teams to evidence impact"], skills: ["Donor Stewardship", "Campaign Planning", "Bid Writing", "Storytelling", "Events Management", "CRM (Raiser's Edge / Salesforce NPSP)", "GDPR & Fundraising Code"], traits: ["Mission-driven and genuinely care about the cause", "Confident communicator - written and in person", "Resilient with rejection (most asks are 'no')", "Organised across multiple campaigns and donors at once"], salary: "£22k–£26k", entryTip: "Most fundraisers start as assistants or community fundraisers. Volunteering and internships at charities are powerful entry points. The Chartered Institute of Fundraising offers respected qualifications." }} /><CareerMap title="Charity Fundraiser Career Path" subtitle="" stages={careerStages} industry="charity" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Charity" searchQuery="charity fundraising conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live fundraising roles across UK charities.</p><Link to="/marketplace?industry=charity#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Charity Jobs</Link></div><IndustryCVBuilder industry="Charity" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Charity Fundraiser" description="Securing the income that powers good causes - from individual giving to corporate partnerships and major gifts." tabs={tabs} category="craft" />;
};

export default CharityFundraiser;
