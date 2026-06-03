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
    { name: "Student Nurse (Band 5 on qualification)", description: "Three-year BSc (Adult, Child, Mental Health or Learning Disability) with NHS placements throughout.", salary: "£29k starting (Band 5)" },
    { name: "Newly Qualified Nurse - Preceptorship", description: "Your first 12 months on a ward, supervised and signed off into independent practice.", salary: "£29k–£32k (Band 5)" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Senior Staff Nurse / Charge Nurse", description: "Owns a bay or shift, mentors juniors, leads on complex patients.", salary: "£36k–£44k (Band 6)" },
    { name: "Specialist Nurse (Diabetes, Oncology, A&E…)", description: "Deep specialism in one clinical area - often clinic-based with own caseload.", salary: "£37k–£45k (Band 6)" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Advanced Nurse Practitioner", description: "Master's-level autonomous practice - diagnoses, prescribes, runs clinics.", salary: "£46k–£55k (Band 7)" },
    { name: "Ward / Department Manager", description: "Runs a whole ward - rotas, budget, quality, recruitment.", salary: "£46k–£60k (Band 7/8a)" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Matron / Lead Nurse", description: "Owns nursing standards across multiple wards or a clinical division.", salary: "£60k–£75k (Band 8a/b)" },
    { name: "Director of Nursing / Chief Nurse", description: "Trust-level executive - accountable for nursing strategy, safety and workforce.", salary: "£90k–£140k+ (Band 9 / VSM)" },
  ]},
];

const podcasts = [
  { title: "The RCN Podcast", description: "The Royal College of Nursing's official podcast - pay, policy and frontline practice.", url: "https://www.rcn.org.uk/news-and-events/podcasts" },
  { title: "Nursing Standard Podcast", description: "Clinical updates, career interviews and practical CPD from the UK's leading nursing journal.", url: "https://rcni.com/nursing-standard/podcasts" },
];

const articles = [
  { title: "Nursing Times", source: "Nursing Times", url: "https://www.nursingtimes.net/" },
  { title: "Nursing Standard", source: "RCNi", url: "https://rcni.com/nursing-standard" },
  { title: "NMC News & Updates", source: "Nursing & Midwifery Council", url: "https://www.nmc.org.uk/news/" },
];

const Nurse = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Nurse" data={{
        summary: "Nursing is the UK's largest regulated profession - over 750,000 nurses on the NMC register, working across the NHS, private hospitals, GP surgeries, prisons, schools and the community. It's a graduate profession with a clear, banded career ladder (Band 5 → Band 9) and four specialism routes from day one: Adult, Child, Mental Health and Learning Disability nursing.",
        dayToDay: ["Patient assessment, observations and handover", "Administering medication and IV therapy", "Wound care, catheter care and clinical procedures", "Care planning with doctors, AHPs and families", "Supervising healthcare assistants and student nurses", "Documentation and safeguarding"],
        skills: ["Clinical Assessment", "Medication Management", "Infection Control", "Resuscitation (ILS / ALS)", "Care Planning", "Safeguarding (Adults & Children)"],
        traits: ["Calm under pressure - wards move fast", "Genuine compassion for patients and families", "Physically and emotionally resilient", "Team-first - nursing is never solo"],
        salary: "£29k Band 5 → £140k+ Chief Nurse",
        entryTip: "Routes in: 3-year BSc Nursing (Adult / Child / Mental Health / LD) at any UK university, or the Nursing Degree Apprenticeship (paid, no tuition fees). Healthcare Assistant → Nursing Associate → Registered Nurse is a strong route if you want to earn while you learn. NHS Trusts, Bupa, HCA Healthcare and Spire all run preceptorship programmes for newly qualifieds.",
      }} />
      <CareerMap title="Nursing Career Path" subtitle="From newly qualified to Chief Nurse." stages={careerStages} industry="health" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="nurse" roleName="Nurse" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Health" searchQuery="nursing conference UK RCN" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live nursing roles across the NHS and private sector.</p><Link to="/marketplace?role=nurse#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Nursing Jobs</Link><a href="https://www.jobs.nhs.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">NHS Jobs ↗</a></div><IndustryCVBuilder industry="Health" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Nurse" description="Patient care, clinical skills and ward leadership - across NHS hospitals, GP surgeries and community settings." tabs={tabs} category="craft" />;
};

export default Nurse;
