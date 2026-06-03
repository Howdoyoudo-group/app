import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Target, TrendingUp, BarChart3, Users } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const industryExamples = [
  { industry: "Fashion", examples: [{ company: "ASOS", role: "People & Culture" }, { company: "Burberry", role: "Talent Acquisition" }], slug: "/fashion" },
  { industry: "Hospitality", examples: [{ company: "Soho House", role: "People Operations" }, { company: "Five Guys", role: "HR & Training" }], slug: "/hospitality" },
  { industry: "Football", examples: [{ company: "Premier League", role: "People & Talent" }, { company: "Chelsea FC", role: "HR Business Partner" }], slug: "/football" },
  { industry: "Grocery", examples: [{ company: "Tesco", role: "People Partner" }, { company: "Ocado", role: "Talent & Development" }], slug: "/grocery" },
];

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Target, roles: [
    { name: "HR Coordinator", description: "Supports the HR team with admin, onboarding, and employee queries.", salary: "£22k–£28k" },
    { name: "Recruitment Coordinator", description: "Manages job postings, screens candidates, and coordinates interviews.", salary: "£24k–£30k" },
  ]},
  { title: "Mid Level", icon: Users, roles: [
    { name: "HR Business Partner", description: "Partners with business leaders on people strategy, performance, and organisational design.", salary: "£40k–£58k" },
    { name: "Talent Acquisition Manager", description: "Leads recruitment strategy and manages the hiring pipeline across the business.", salary: "£38k–£55k" },
    { name: "L&D Manager", description: "Designs and delivers learning and development programmes across the organisation.", salary: "£38k–£52k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head of People", description: "Leads the people function, owning culture, engagement, and workforce planning.", salary: "£65k–£90k" },
    { name: "Head of Talent", description: "Shapes employer brand and talent strategy to attract and retain top people.", salary: "£60k–£85k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "People Director / HR Director", description: "Sets the strategic people agenda and sits on the leadership team.", salary: "£85k–£130k" },
    { name: "Chief People Officer", description: "C-suite leader responsible for the entire people, culture, and talent function.", salary: "£120k–£200k+" },
  ]},
];

const podcasts = [
  { title: "HR Happy Hour", description: "Covers HR technology, workplace trends, and leadership with industry practitioners.", url: "https://www.hrhappyhour.net/" },
  { title: "People Problems", description: "Real HR dilemmas and practical advice for people professionals.", url: "https://www.cipd.org/uk/knowledge/podcasts/" },
  { title: "HR Leaders Podcast", description: "Conversations with CHROs and people leaders shaping the future of work.", url: "https://www.hrleaders.co/podcast" },
];

const articles = [
  { title: "CIPD - People Management", source: "CIPD", url: "https://www.cipd.org/uk/" },
  { title: "People Management Magazine", source: "People Management", url: "https://www.peoplemanagement.co.uk/" },
  { title: "HR Magazine", source: "HR Magazine", url: "https://www.hrmagazine.co.uk/" },
];

const HRPeople = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="hr-people" roleName="People & Culture" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "work", label: "Who?", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where People & Culture Exists<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-8">People roles look different in every industry.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{industryExamples.map((item) => (<div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors"><div className="flex items-center gap-3 mb-3"><IndustryIcon industry={item.industry} /><Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">HR in {item.industry}</Link></div><ul className="space-y-1">{item.examples.map((ex) => (<li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full shrink-0" /><span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span></li>))}</ul><Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">Explore industry <ArrowRight className="w-3 h-3" /></Link></div>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="People & Culture" data={{ summary: "People & Culture teams are responsible for the most important asset in any business - the people. From recruitment and onboarding to culture, learning, and employee relations, this function ensures organisations attract, develop, and retain the best talent. Modern people teams are strategic partners, not just admin.", dayToDay: ["Managing recruitment - writing job specs, screening, and interviewing", "Onboarding new starters and managing employee lifecycle", "Advising managers on performance, wellbeing, and employee relations", "Designing learning and development programmes", "Running engagement surveys and acting on feedback", "Managing HR systems, payroll coordination, and compliance"], skills: ["Recruitment & Selection", "Employee Relations", "CIPD Knowledge", "L&D Design", "HR Systems (Workday/BambooHR)", "Employment Law Basics", "Data & People Analytics", "Coaching & Facilitation"], traits: ["You genuinely care about people and their development", "You're a great listener and a trusted confidant", "You can balance empathy with business pragmatism", "You enjoy building culture and community", "You're organised and can handle sensitive information with discretion"], salary: "£22k–£28k", entryTip: "Many HR careers start with a coordinator or recruitment role. A CIPD Level 3 qualification is the industry standard entry point. Some people move into HR from other roles within a business - operational experience is a genuine advantage." }} /><CareerMap title="HR & People Career Path" subtitle="From coordinator to CPO - the typical progression for people professionals." stages={careerStages} industry="hr" /></>) },
    { id: "learn", label: "Learn", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Courses & Qualifications<span className="text-primary">.</span></h2><div className="space-y-4">{[
      { title: "CIPD Level 3 Foundation Certificate", description: "The industry-standard entry qualification for HR professionals in the UK.", url: "https://www.cipd.org/uk/learning/qualifications/foundation-certificate/", badge: "Professional" },
      { title: "CIPD Level 5 Associate Diploma", description: "Mid-level CIPD qualification for experienced HR practitioners.", url: "https://www.cipd.org/uk/learning/qualifications/associate-diploma/", badge: "Professional" },
      { title: "CIPD Level 7 Advanced Diploma", description: "The senior strategic HR qualification, equivalent to postgraduate level.", url: "https://www.cipd.org/uk/learning/qualifications/advanced-diploma/", badge: "Professional" },
      { title: "People Analytics (Coursera / Wharton)", description: "Data-driven approach to people management from the University of Pennsylvania.", url: "https://www.coursera.org/learn/wharton-people-analytics", badge: "Free" },
      { title: "HR Fundamentals (FutureLearn / CIPD)", description: "Free introductory course covering the basics of HR practice.", url: "https://www.futurelearn.com/subjects/business-and-management-courses/human-resources", badge: "Free" },
      { title: "Diversity and Inclusion in the Workplace (FutureLearn)", description: "Practical frameworks for building inclusive workplaces.", url: "https://www.futurelearn.com/courses/diversity-inclusion-workplace", badge: "Free" },
    ].map((c) => (<a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><div className="flex items-center justify-between mb-1"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3>{c.badge && <span className={`text-[10px] tracking-wider uppercase font-display font-700 px-2 py-0.5 ${c.badge === "Free" ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"}`}>{c.badge}</span>}</div><p className="text-muted-foreground font-body text-xs mt-1">{c.description}</p></a>))}</div></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="HR" searchQuery="HR people conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live People & Culture roles across all industries.</p><Link to="/marketplace?role=People+%26+Culture#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View People & Culture Jobs</Link></div><IndustryCVBuilder industry="People & Culture" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="People & Culture" description="Recruitment, culture, and talent development - the people who look after the people." tabs={tabs} category="business" />;
};

export default HRPeople;
