import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Target, TrendingUp, BarChart3, ClipboardList } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const industryExamples = [
  { industry: "Fashion", examples: [{ company: "ASOS", role: "Programme Management" }, { company: "Burberry", role: "Project Delivery" }], slug: "/fashion" },
  { industry: "Film and TV", examples: [{ company: "Netflix", role: "Production Management" }, { company: "BBC Studios", role: "Programme Delivery" }], slug: "/cinema" },
  { industry: "Football", examples: [{ company: "Premier League", role: "Project Management" }, { company: "Tottenham", role: "Stadium Projects" }], slug: "/football" },
  { industry: "Grocery", examples: [{ company: "Tesco", role: "Transformation PMO" }, { company: "Ocado", role: "Tech Programme Management" }], slug: "/grocery" },
];

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Target, roles: [
    { name: "Project Coordinator", description: "Supports project managers with scheduling, tracking, and stakeholder communication.", salary: "£25k–£32k" },
    { name: "PMO Analyst", description: "Maintains project dashboards, risk logs, and reporting for the project office.", salary: "£26k–£34k" },
  ]},
  { title: "Mid Level", icon: ClipboardList, roles: [
    { name: "Project Manager", description: "Leads projects end-to-end - scoping, planning, delivery, and stakeholder management.", salary: "£38k–£55k" },
    { name: "Programme Manager", description: "Manages multiple related projects, ensuring alignment with strategic objectives.", salary: "£50k–£70k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Programme Manager", description: "Delivers large-scale transformation programmes with complex dependencies.", salary: "£65k–£90k" },
    { name: "Head of PMO", description: "Leads the project management office, setting standards and governance.", salary: "£70k–£95k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Director of Programmes", description: "Owns the portfolio of change and transformation across the business.", salary: "£90k–£130k" },
    { name: "Chief Transformation Officer", description: "C-suite leader responsible for organisational change and strategic delivery.", salary: "£120k–£180k+" },
  ]},
];

const podcasts = [
  { title: "The Project Management Podcast", description: "Tips, tools, and interviews for project professionals at every level.", url: "https://www.project-management-podcast.com/" },
  { title: "PM Happy Hour", description: "Casual conversations about the realities of project management.", url: "https://www.pmhappyhour.com/" },
];

const articles = [
  { title: "APM - Association for Project Management", source: "APM", url: "https://www.apm.org.uk" },
  { title: "PMI - Project Management Institute", source: "PMI", url: "https://www.pmi.org/" },
  { title: "ProjectManager.com Blog", source: "ProjectManager", url: "https://www.projectmanager.com/blog" },
];

const ProjectManagement = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="project-management" roleName="Project & Programme Management" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "work", label: "Who?", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Project Management Exists<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-8">Every industry needs people who can deliver complex work on time.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{industryExamples.map((item) => (<div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors"><div className="flex items-center gap-3 mb-3"><IndustryIcon industry={item.industry} /><Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">PM in {item.industry}</Link></div><ul className="space-y-1">{item.examples.map((ex) => (<li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full shrink-0" /><span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span></li>))}</ul><Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">Explore industry <ArrowRight className="w-3 h-3" /></Link></div>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Project & Programme Management" data={{ summary: "Project managers are the people who make things happen on time, on budget, and to spec. They coordinate teams, manage risks, and keep complex work on track. Whether it's opening a new store, launching a product, or running a digital transformation - every industry needs PMs.", dayToDay: ["Planning project timelines, milestones, and dependencies", "Running stand-ups, steering groups, and stakeholder meetings", "Tracking budgets, risks, and issues across workstreams", "Managing cross-functional teams without direct authority", "Creating reports and dashboards for senior leadership", "Adapting plans when things change - which they always do"], skills: ["Planning & Scheduling", "Risk Management", "Stakeholder Management", "Agile & Waterfall", "Budget Tracking", "JIRA / MS Project / Monday", "Change Management", "Communication"], traits: ["You're a natural organiser who loves bringing order to chaos", "You stay calm when plans change (which they always do)", "You enjoy working with different teams and personalities", "You're detail-oriented but keep the big picture in focus", "You get genuine satisfaction from delivering things on time"], salary: "£25k–£32k", entryTip: "Many PMs start as coordinators or PMO analysts. PRINCE2 Foundation and APM qualifications are widely recognised in the UK. Agile certifications (Scrum Master, SAFe) are valuable in tech-heavy industries. Real delivery experience matters most." }} /><CareerMap title="Project Management Career Path" subtitle="From coordinator to CTO - the typical progression." stages={careerStages} industry="project management" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Project Management" searchQuery="project management conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live project & programme management roles.</p><Link to="/marketplace?role=Project+%26+Programme+Management#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View PM Jobs</Link></div><IndustryCVBuilder industry="Project Management" stages={careerStages} /></>) },
  ];

  return <RolePageLayout slug="project-management" name="Project & Programme Management" description="Planning, delivery, and coordination - keeping complex projects on track across sectors." tabs={tabs} category="business" />;
};

export default ProjectManagement;
