import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, HandHeart } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: HandHeart, roles: [
    { name: "Healthcare Assistant (Band 2)", description: "Personal care, observations, supporting nurses on the ward - no formal qualifications needed to start.", salary: "£22k–£24k (Band 2)" },
    { name: "Senior HCA (Band 3)", description: "Care Certificate completed, plus extra clinical skills (venepuncture, ECG, catheter care).", salary: "£24k–£27k (Band 3)" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Assistant Practitioner (Band 4)", description: "Foundation degree-level - extended clinical role, supervises Band 2/3 staff.", salary: "£27k–£30k (Band 4)" },
    { name: "Nursing Associate", description: "2-year apprenticeship - bridges HCA and Registered Nurse, registered with NMC.", salary: "£27k–£30k (Band 4)" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Registered Nurse (Band 5)", description: "Top-up via Nursing Degree Apprenticeship while still earning. Three-year route.", salary: "£29k–£35k (Band 5)" },
    { name: "Specialist HCA / Theatre Practitioner", description: "Deep skills in one area - theatres, A&E, endoscopy, mental health.", salary: "£28k–£34k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Senior Nurse / Ward Manager", description: "Following the RN route, you can progress through the standard nursing ladder to Band 7+.", salary: "£46k–£60k+ (Band 7/8a)" },
    { name: "HCA Lead / Workforce Trainer", description: "Trains and develops the wider HCA workforce across a Trust.", salary: "£35k–£45k" },
  ]},
];

const podcasts = [
  { title: "The RCN Podcast", description: "Royal College of Nursing podcast - covers HCA, nursing associate and NA progression routes.", url: "https://www.rcn.org.uk/news-and-events/podcasts" },
  { title: "Nursing Times Podcast", description: "Career stories and clinical updates relevant to all NHS frontline staff.", url: "https://www.nursingtimes.net/podcasts/" },
];

const articles = [
  { title: "Nursing Times - HCA & Support Workers", source: "Nursing Times", url: "https://www.nursingtimes.net/clinical-archive/healthcare-assistants/" },
  { title: "Health Careers - Healthcare Support", source: "NHS Health Careers", url: "https://www.healthcareers.nhs.uk/explore-roles/wider-healthcare-team/roles-wider-healthcare-team/clinical-support-staff/healthcare-assistant" },
  { title: "Skills for Health", source: "Skills for Health", url: "https://www.skillsforhealth.org.uk/" },
];

const HealthcareAssistant = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Healthcare Assistant" data={{
        summary: "Healthcare assistants (HCAs) are the backbone of every NHS ward, GP surgery and care setting. It's the most accessible entry point into the health workforce - no formal qualifications needed to start - and it leads directly into Nursing Associate and Registered Nurse routes (paid apprenticeships, no tuition fees). Around 350,000 HCAs work in the NHS today.",
        dayToDay: ["Personal care - washing, dressing, toileting, mobility", "Observations - blood pressure, temperature, pulse, respiration", "Helping patients eat and drink", "Making beds and turning patients to prevent pressure sores", "Chaperoning, escorting and supporting nurses on procedures", "Documentation in patient notes"],
        skills: ["Care Certificate (15 standards)", "Basic Life Support (BLS)", "Manual Handling", "Infection Control", "Communication with Patients & Families", "Record Keeping"],
        traits: ["Genuinely warm - you're the person patients see most", "Physically resilient - lots of bending, lifting, on your feet", "Calm with bodily fluids and difficult moments", "Reliable - wards run on shift cover"],
        salary: "£22k Band 2 → £30k+ Nursing Associate",
        entryTip: "Routes in: Apply directly to NHS Trusts, Bupa, HCA Healthcare and care homes - most train you on the Care Certificate in your first 12 weeks. Healthcare Support Worker apprenticeship (Level 2/3) is the formal route. From here you can progress to Nursing Associate (Level 5 apprenticeship) and then Registered Nurse via the Nursing Degree Apprenticeship.",
      }} />
      <CareerMap title="HCA Career Path" subtitle="From Band 2 to Registered Nurse via paid apprenticeships." stages={careerStages} industry="health" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="healthcare-assistant" roleName="Healthcare Assistant" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Health" searchQuery="healthcare support worker conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live HCA and healthcare support roles across the NHS and private sector.</p><Link to="/marketplace?role=healthcare-assistant#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View HCA Jobs</Link><a href="https://www.jobs.nhs.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">NHS Jobs ↗</a></div><IndustryCVBuilder industry="Health" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Healthcare Assistant" description="Frontline patient care, observations and ward support - a vital first step into the health workforce." tabs={tabs} category="frontline" />;
};

export default HealthcareAssistant;
