import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, BookOpen } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: BookOpen, roles: [
    { name: "Teaching Assistant (Level 2)", description: "General classroom support - small groups, 1:1, helping the teacher manage the room.", salary: "£25k–£29k (term-time, pro-rata)" },
    { name: "Cover Supervisor", description: "Covers absent teachers - supervises the class through pre-set work.", salary: "£25k–£29k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Higher Level Teaching Assistant (HLTA)", description: "Leads small groups, plans interventions, can cover whole classes.", salary: "£25k–£28k" },
    { name: "SEN Teaching Assistant", description: "Specialism in Special Educational Needs - autism, ADHD, EHCP support.", salary: "£25k–£28k (often higher in SEN schools)" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "SENCO Assistant / Lead TA", description: "Coordinates the TA team and supports the SENCO across the school.", salary: "£28k–£35k" },
    { name: "Pastoral / Behaviour Support Lead", description: "Owns whole-school approach to behaviour and pupil wellbeing.", salary: "£28k–£36k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Qualified Teacher (QTS)", description: "Top-up to QTS via apprenticeship or PGCE. Significant pay step.", salary: "£31k–£50k+ (see Teacher role)" },
    { name: "SENCO / Inclusion Lead", description: "After QTS - strategic SEN role, often senior leadership team.", salary: "£45k–£65k" },
  ]},
];

const podcasts = [
  { title: "The TA Podcast", description: "UK podcast specifically for teaching assistants - practical tips, career conversations.", url: "https://www.taresources.com/" },
  { title: "Tes Podagogy", description: "The Tes (Times Educational Supplement) podcast - covers TA, SEN and whole-school issues.", url: "https://www.tes.com/news/tes-podagogy" },
];

const articles = [
  { title: "Tes (Times Educational Supplement)", source: "Tes", url: "https://www.tes.com/" },
  { title: "Schools Week", source: "Schools Week", url: "https://schoolsweek.co.uk/" },
  { title: "nasen - SEN Membership Body", source: "nasen", url: "https://nasen.org.uk/news" },
];

const TeachingAssistant = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Teaching Assistant" data={{
        summary: "Teaching assistants are the second adult in 350,000+ UK classrooms - supporting teachers, working 1:1 with pupils with additional needs, and running small intervention groups. It's the most common entry route into a career in education. Many TAs progress to qualified teacher status (QTS) via the Teaching Apprenticeship route, which lets you train without a PGCE.",
        dayToDay: ["Supporting the class teacher through lessons", "Working 1:1 or small group with pupils who need extra help", "Running phonics, reading or maths interventions", "Helping prepare classroom resources and displays", "Playground supervision and pastoral care", "Liaising with parents, SENCO and external agencies"],
        skills: ["Classroom Management", "SEN Awareness (ASD, ADHD, Dyslexia, EHCPs)", "Phonics & Early Reading", "Behaviour Support", "Safeguarding", "Communication with Pupils, Parents & Staff"],
        traits: ["Genuine warmth with children", "Patient - progress is often slow", "Calm in noisy, unpredictable environments", "Reliable team player - supports a teacher daily"],
        salary: "£25k Level 2 → £65k+ SENCO",
        entryTip: "Routes in: Apply directly to schools - many take TAs without prior qualifications and train on the job. Level 2 Teaching Assistant Apprenticeship is the standard formal route. From there, Level 3 (Senior TA), HLTA status, then QTS via the Teaching Apprenticeship route (4 years, paid, no tuition fees) or PGCE.",
      }} />
      <CareerMap title="Teaching Assistant Career Path" subtitle="From Level 2 TA to qualified teacher and SENCO." stages={careerStages} industry="teaching" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="teaching-assistant" roleName="Teaching Assistant" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Teaching" searchQuery="Tes SEND education conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live teaching assistant roles across UK schools.</p><Link to="/marketplace?role=teaching-assistant#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View TA Jobs</Link><a href="https://www.tes.com/jobs/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">Tes Jobs ↗</a></div><IndustryCVBuilder industry="Teaching" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Teaching Assistant" description="Supporting teachers and pupils in the classroom - from one-to-one help to small group learning and SEN support." tabs={tabs} category="frontline" />;
};

export default TeachingAssistant;
