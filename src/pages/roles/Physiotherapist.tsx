import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, HeartPulse } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";
import OnlineLearningGrid from "@/components/OnlineLearningGrid";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: HeartPulse, roles: [
    { name: "Band 5 Physiotherapist (NHS)", description: "Newly qualified - assesses and treats patients across musculoskeletal, neuro, or respiratory.", salary: "£29k–£36k" },
    { name: "Junior Physiotherapist (Private)", description: "Treats clients in private practice, sports clubs, or occupational health settings.", salary: "£25k–£32k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Band 6 Senior Physiotherapist", description: "Specialises in a clinical area and manages a caseload independently.", salary: "£36k–£44k" },
    { name: "Sports Physiotherapist", description: "Works with athletes on injury prevention, rehabilitation, and performance.", salary: "£32k–£50k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Band 7 Clinical Specialist", description: "Advanced clinical role with expertise in a specialist area, mentoring juniors.", salary: "£44k–£52k" },
    { name: "Private Practice Owner", description: "Runs a physiotherapy clinic - clinical work, business management, and team leadership.", salary: "£50k–£90k+" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Band 8 Consultant Physiotherapist", description: "Leads service development, research, and clinical governance at a senior level.", salary: "£52k–£75k" },
    { name: "Head of Physiotherapy / Allied Health", description: "Leads the physiotherapy department or allied health services across an organisation.", salary: "£55k–£85k" },
  ]},
];

const podcasts = [
  { title: "Physio Matters Podcast", description: "Evidence-based physiotherapy discussions for clinicians at all levels.", url: "https://www.physiomatters.com/" },
  { title: "CSP Frontline", description: "The Chartered Society of Physiotherapy's resource for clinical practice and career development.", url: "https://www.csp.org.uk/frontline" },
];

const articles = [
  { title: "CSP - Chartered Society of Physiotherapy", source: "CSP", url: "https://www.csp.org.uk/" },
  { title: "Frontline Magazine", source: "CSP Frontline", url: "https://www.csp.org.uk/frontline" },
  { title: "Physiopedia", source: "Physiopedia", url: "https://www.physio-pedia.com/" },
];

const PhysiotherapistRole = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="physiotherapist" roleName="Physiotherapist" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Physiotherapist" data={{ summary: "Physiotherapists help people recover from injury, manage chronic conditions, and move better. It's a regulated healthcare profession that blends anatomy, biomechanics, and patient care. Physios work in the NHS, private practice, sports teams, and occupational health - and the demand for qualified professionals is consistently high.", dayToDay: ["Assessing patients - taking histories, observing movement, diagnosing conditions", "Designing and delivering treatment programmes (manual therapy, exercise, electrotherapy)", "Educating patients on self-management and injury prevention", "Writing clinical notes and discharge reports", "Working with multidisciplinary teams - GPs, surgeons, sport scientists", "Managing a clinical caseload and patient appointments"], skills: ["Anatomy & Biomechanics", "Manual Therapy", "Exercise Prescription", "Clinical Reasoning", "Patient Communication", "MSK Assessment", "Rehabilitation Planning", "Research Literacy"], traits: ["You're genuinely interested in how the body moves and heals", "You're empathetic and patient - recovery takes time", "You enjoy problem-solving with real human impact", "You're good with your hands and confident in physical assessment", "You're self-motivated and committed to lifelong learning"], salary: "£28k (NHS Band 5)", entryTip: "You need an HCPC-approved BSc in Physiotherapy (3 years) to practise. Competition for places is high - work experience in healthcare settings is essential. Graduate roles are available in NHS trusts, private clinics, and sports organisations." }} /><CareerMap title="Physiotherapy Career Path" subtitle="From Band 5 to consultant - the clinical progression." stages={careerStages} industry="physiotherapy" /></>) },
    { id: "learn", label: "Learn", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Routes into Physiotherapy<span className="text-primary">.</span></h2><div className="space-y-4">{[{ title: "BSc Physiotherapy (HCPC Approved)", description: "3-year degree programme leading to registration with the Health & Care Professions Council.", url: "https://www.hcpc-uk.org/" }, { title: "CSP Preceptorship", description: "Structured support programme for newly qualified physiotherapists entering practice.", url: "https://www.csp.org.uk/" }, { title: "MSc Sports Physiotherapy", description: "Postgraduate specialism for those working in sports medicine and performance.", url: "https://www.ucas.com/" }].map((c) => (<a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{c.description}</p></a>))}</div><OnlineLearningGrid roleName="Physiotherapist" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Physiotherapy" searchQuery="physiotherapy conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live physiotherapy roles.</p><Link to="/marketplace?industry=physiotherapy#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Physiotherapy Jobs</Link></div><IndustryCVBuilder industry="Physiotherapy" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Physiotherapist" description="Rehabilitation, movement science, and hands-on patient care." tabs={tabs} category="craft" />;
};

export default PhysiotherapistRole;
