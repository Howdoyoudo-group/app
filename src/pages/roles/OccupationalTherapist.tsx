import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Activity } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Activity, roles: [
    { name: "Student OT (3-year BSc)", description: "HCPC-approved degree at a UK university. Or 2-year MSc for graduates of related fields.", salary: "£29k starting on qualification (Band 5)" },
    { name: "Newly Qualified OT (Band 5)", description: "Rotational post - typically 4–6 months in stroke, mental health, paeds, surgery.", salary: "£29k–£32k (Band 5)" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Specialist OT (Band 6)", description: "Specialism in one area - neuro-rehab, paeds, mental health, hand therapy.", salary: "£36k–£44k (Band 6)" },
    { name: "Community OT", description: "Home assessments, equipment, adaptations - local authority or community health.", salary: "£36k–£44k (Band 6)" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Advanced OT / Clinical Specialist (Band 7)", description: "Leads on complex cases, team supervision, service development.", salary: "£46k–£55k (Band 7)" },
    { name: "OT Clinical Lead", description: "Owns OT clinical standards across a service or pathway.", salary: "£46k–£55k (Band 7)" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head OT / Service Manager (Band 8)", description: "Runs the OT service across a Trust or local authority - strategy, budget, workforce.", salary: "£55k–£75k (Band 8a/b)" },
    { name: "AHP Director", description: "Senior leadership across all Allied Health Professions in a Trust.", salary: "£75k–£110k+ (Band 8c/9)" },
  ]},
];

const podcasts = [
  { title: "The Royal College of Occupational Therapists Podcast", description: "RCOT's official podcast - practice, careers and policy in OT.", url: "https://www.rcot.co.uk/news/podcasts" },
  { title: "OT4Lyfe", description: "UK occupational therapy podcast - practice tips, specialism stories and CPD.", url: "https://ot4lyfe.com/" },
];

const articles = [
  { title: "OT News (RCOT)", source: "Royal College of OT", url: "https://www.rcot.co.uk/news" },
  { title: "British Journal of Occupational Therapy", source: "RCOT / Sage", url: "https://journals.sagepub.com/home/bjo" },
  { title: "Health Careers - OT", source: "NHS Health Careers", url: "https://www.healthcareers.nhs.uk/explore-roles/allied-health-professionals/roles-allied-health-professions/occupational-therapist" },
];

const OccupationalTherapist = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Occupational Therapist" data={{
        summary: "Occupational therapists help people regain independence after illness, injury or disability - through practical, everyday-task focused therapy. Where physiotherapists focus on physical movement, OTs focus on the activities of daily life: dressing, cooking, working, school. It's an HCPC-regulated, graduate Allied Health Profession across NHS, social care, schools, mental health and private practice.",
        dayToDay: ["Functional assessments - what can the patient actually do at home, work or school?", "Setting and reviewing therapy goals", "Prescribing equipment and adaptations (grab rails, perching stools, wheelchairs)", "Splinting and graded activity", "Working with families, carers and MDTs", "Documentation and discharge planning"],
        skills: ["Functional Assessment", "Activity Analysis & Grading", "Splinting & Equipment Prescription", "Mental Health Awareness", "Goal Setting (COPM, Goal Attainment Scaling)", "MDT Working"],
        traits: ["Practical, problem-solving mindset", "Strong communicator - works closely with patients and families", "Patient - rehab is slow", "Creative - every adaptation is bespoke"],
        salary: "£29k Band 5 → £110k+ AHP Director",
        entryTip: "Routes in: 3-year BSc Occupational Therapy at any HCPC-approved UK university (Brunel, Cardiff, Glasgow Caledonian, Oxford Brookes). 2-year pre-reg MSc for graduates of related degrees. Apprenticeship route (Occupational Therapist Degree Apprenticeship) increasingly available via NHS Trusts.",
      }} />
      <CareerMap title="OT Career Path" subtitle="From newly qualified to AHP Director." stages={careerStages} industry="physiotherapy" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="occupational-therapist" roleName="Occupational Therapist" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Physiotherapy" searchQuery="RCOT occupational therapy conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live OT roles across the NHS, social care and private sector.</p><Link to="/marketplace?role=occupational-therapist#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View OT Jobs</Link><a href="https://www.jobs.nhs.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">NHS Jobs ↗</a></div><IndustryCVBuilder industry="Physiotherapy" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Occupational Therapist" description="Helping people regain independence after illness or injury - through practical, everyday-task focused therapy." tabs={tabs} category="craft" />;
};

export default OccupationalTherapist;
