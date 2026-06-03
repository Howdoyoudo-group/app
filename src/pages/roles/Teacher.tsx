import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, GraduationCap } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: GraduationCap, roles: [
    { name: "Trainee Teacher (PGCE / QTS)", description: "Completes initial teacher training while gaining classroom experience.", salary: "£24k–£28k" },
    { name: "Teaching Assistant", description: "Supports classroom teachers with learning activities and student welfare.", salary: "£18k–£22k" },
    { name: "NQT / ECT", description: "Early Career Teacher - completes the induction period and builds classroom confidence.", salary: "£30k–£32k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Classroom Teacher", description: "Plans and delivers lessons, assesses progress, and manages a classroom.", salary: "£30k–£42k" },
    { name: "Subject Lead / Head of Department", description: "Leads curriculum planning and standards for a specific subject.", salary: "£38k–£50k" },
    { name: "Year Group Lead / Pastoral Lead", description: "Manages student welfare and behaviour across a year group.", salary: "£36k–£48k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Assistant Headteacher", description: "Supports the head with strategic leadership, teaching & learning, or behaviour.", salary: "£50k–£65k" },
    { name: "Deputy Headteacher", description: "Second in command - leads on curriculum, staffing, or school improvement.", salary: "£55k–£75k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Headteacher", description: "Leads the school - vision, culture, standards, budget, and community.", salary: "£65k–£120k" },
    { name: "Executive Headteacher / CEO (MAT)", description: "Leads multiple schools or a multi-academy trust.", salary: "£90k–£180k+" },
  ]},
];

const podcasts = [
  { title: "TES Podagogy", description: "The TES team explores the latest in teaching, policy, and school leadership.", url: "https://www.tes.com/magazine/topic/podcasts" },
  { title: "Teacher Toolkit Podcast", description: "Ross Morrison McGill shares practical classroom and leadership advice.", url: "https://www.teachertoolkit.co.uk/podcast/" },
  { title: "Schools Week", description: "In-depth reporting and analysis on education policy and school leadership in England.", url: "https://schoolsweek.co.uk/" },
];

const articles = [
  { title: "TES", source: "TES", url: "https://www.tes.com/" },
  { title: "Schools Week", source: "Schools Week", url: "https://schoolsweek.co.uk/" },
  { title: "Teacher Toolkit", source: "Teacher Toolkit", url: "https://www.teachertoolkit.co.uk/" },
];

const TeacherRole = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="teacher" roleName="Teacher" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Teacher" data={{ summary: "Teachers shape the next generation. It's one of the most impactful careers you can choose - part educator, part mentor, part performer. Teaching requires deep subject knowledge, classroom management, and the ability to adapt to different learners. It's demanding, rewarding, and offers a clear career structure with strong job security.", dayToDay: ["Planning and delivering lessons across your subject area", "Assessing and marking student work and providing feedback", "Managing classroom behaviour and creating a positive learning environment", "Attending staff meetings, parents' evenings, and CPD sessions", "Supporting students pastorally - wellbeing, behaviour, careers guidance", "Adapting teaching for different abilities and learning needs (SEND)"], skills: ["Subject Knowledge", "Lesson Planning", "Behaviour Management", "Differentiation & SEND", "Assessment & Feedback", "Safeguarding", "Communication", "Resilience & Adaptability"], traits: ["You're passionate about your subject and want to share that passion", "You enjoy working with young people - even the challenging ones", "You're patient, organised, and can think on your feet", "You care about making a difference - not just a living", "You can command a room and make complex ideas accessible"], salary: "£30k (England, M1)", entryTip: "You need Qualified Teacher Status (QTS). Routes include PGCE (university-based), School Direct, Teach First, or assessment-only for experienced educators. A degree in your subject area is usually required. Get school experience before applying." }} /><CareerMap title="Teaching Career Path" subtitle="From trainee to headteacher - the teaching progression." stages={careerStages} industry="teaching" /></>) },
    { id: "learn", label: "Learn", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Routes into Teaching<span className="text-primary">.</span></h2><div className="space-y-4">{[{ title: "Get Into Teaching (DfE)", description: "Official government resource for exploring teaching routes, funding, and applications.", url: "https://getintoteaching.education.gov.uk/" }, { title: "Teach First", description: "Leadership development programme placing graduates in schools in disadvantaged areas.", url: "https://www.teachfirst.org.uk/" }, { title: "PGCE (Postgraduate Certificate in Education)", description: "University-based teacher training leading to Qualified Teacher Status.", url: "https://www.ucas.com/teaching-in-the-uk" }].map((c) => (<a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{c.description}</p></a>))}</div></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Teaching" searchQuery="teaching education conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live teaching roles.</p><Link to="/marketplace?industry=teaching#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Teaching Jobs</Link></div><IndustryCVBuilder industry="Teaching" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Teacher" description="Lesson planning, classroom leadership, and shaping the next generation." tabs={tabs} category="craft" />;
};

export default TeacherRole;
