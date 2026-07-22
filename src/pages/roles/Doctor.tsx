import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Stethoscope } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Stethoscope, roles: [
    { name: "Medical Student (5–6 years)", description: "MBBS / MBChB at a UK medical school - pre-clinical science then clinical rotations.", salary: "Student loan / NHS bursary in final years" },
    { name: "Foundation Doctor (FY1 / FY2)", description: "Two-year mandatory programme rotating through medicine, surgery, A&E and GP.", salary: "£36k–£42k (FY1/FY2 basic + banding)" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Core / Speciality Trainee (CT/ST 1–3)", description: "Choose your path: GP, surgery, anaesthetics, paeds, psychiatry, radiology, etc.", salary: "£44k–£55k (basic + on-call)" },
    { name: "Registrar (ST3–ST7+)", description: "Senior trainee - runs clinics and theatre lists under consultant supervision.", salary: "£55k–£72k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "GP Partner / Salaried GP", description: "Independent practitioner running a list of patients in primary care.", salary: "£75k–£120k+ (partner)" },
    { name: "Hospital Consultant", description: "Specialist lead - own clinics, theatre lists, MDT chair, training juniors.", salary: "£105k–£140k NHS + private practice" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Clinical Director / Divisional Lead", description: "Runs a clinical division - strategy, quality, workforce and budget.", salary: "£130k–£170k" },
    { name: "Medical Director / CMO", description: "Trust executive - accountable for clinical standards across the whole organisation.", salary: "£160k–£250k+" },
  ]},
];

const podcasts = [
  { title: "The BMJ Podcast", description: "Weekly conversations with researchers and clinicians from the British Medical Journal.", url: "https://www.bmj.com/podcasts" },
  { title: "Sharp Scratch", description: "The BMJ's career podcast for medical students and junior doctors.", url: "https://www.bmj.com/podcasts/sharpscratch" },
];

const articles = [
  { title: "The BMJ", source: "British Medical Journal", url: "https://www.bmj.com/" },
  { title: "BMA News", source: "British Medical Association", url: "https://www.bma.org.uk/news-and-opinion" },
  { title: "Pulse", source: "Pulse (GP news)", url: "https://www.pulsetoday.co.uk/" },
];

const Doctor = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Doctor / GP" data={{
        summary: "Medicine in the UK is a long, structured career. Five-to-six years at medical school, two foundation years on the wards, then a chosen training pathway that takes another 3–8 years to consultant or GP partner. It's one of the few professions where the route is genuinely meritocratic - your training number is competitive, but once on it the ladder is clear.",
        dayToDay: ["Ward rounds, clerking and clinical decision-making", "Outpatient clinics or GP surgery consultations", "Procedures and / or theatre lists", "On-call shifts (nights and weekends as a junior)", "Multi-disciplinary team meetings", "Audit, teaching juniors and CPD"],
        skills: ["Clinical Diagnosis", "Procedural Skills", "Prescribing", "Communication with Patients & Families", "Teamwork & Leadership", "Evidence-Based Medicine"],
        traits: ["Long-game mindset - training takes 10+ years", "Resilient under genuine pressure", "Comfortable with uncertainty and risk", "Lifelong learner - medicine never stands still"],
        salary: "£36k FY1 → £250k+ Medical Director",
        entryTip: "Routes in: A-level (or equivalent) entry to a 5–6 year MBBS / MBChB; or graduate-entry medicine (4 years) for those with a relevant first degree. UCAT or BMAT required. NHS Foundation Programme is the next step. Apprenticeship route (Medical Doctor Degree Apprenticeship) launched 2024 with NHS Trust sponsors.",
      }} />
      <CareerMap title="Medical Career Path" subtitle="From medical school to Medical Director." stages={careerStages} industry="health" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="doctor" roleName="Doctor / GP" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Health" searchQuery="medical conference UK BMA Royal College" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live medical and GP roles across the NHS and private sector.</p><Link to="/marketplace?role=doctor#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Doctor Jobs</Link><a href="https://www.jobs.nhs.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">NHS Jobs ↗</a></div><IndustryCVBuilder industry="Health" stages={careerStages} /></>) },
  ];
  return <RolePageLayout slug="doctor" name="Doctor / GP" description="Diagnosis, treatment and care - from hospital consultants to community general practitioners." tabs={tabs} category="craft" />;
};

export default Doctor;
