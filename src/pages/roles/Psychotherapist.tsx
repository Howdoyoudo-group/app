import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Brain } from "lucide-react";
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
  { title: "Entry Level", icon: Brain, roles: [
    { name: "Trainee Counsellor / Therapist", description: "Completes placement hours under supervision while studying for accreditation.", salary: "£20k–£26k" },
    { name: "Mental Health Support Worker", description: "Provides front-line emotional support in NHS, charity, or community settings.", salary: "£22k–£28k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Counsellor (BACP Accredited)", description: "Delivers therapy sessions - person-centred, CBT, integrative, or psychodynamic.", salary: "£28k–£38k" },
    { name: "Psychotherapist", description: "Provides in-depth therapeutic work with individuals, couples, or groups.", salary: "£32k–£48k" },
    { name: "CBT Therapist (IAPT)", description: "Delivers evidence-based CBT within the NHS Improving Access to Psychological Therapies programme.", salary: "£35k–£45k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Therapist / Clinical Lead", description: "Supervises trainees, leads clinical practice, and manages a caseload.", salary: "£42k–£58k" },
    { name: "Private Practice Owner", description: "Runs a therapy practice - client work, business development, and possibly a team.", salary: "£45k–£80k+" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Clinical Director", description: "Leads therapeutic services across an organisation or charity.", salary: "£55k–£80k" },
    { name: "Head of Psychological Services", description: "Oversees all psychological therapies within a trust, charity, or private group.", salary: "£60k–£90k" },
  ]},
];

const podcasts = [
  { title: "BACP Podcasts", description: "The British Association for Counselling and Psychotherapy's conversations on practice and training.", url: "https://www.bacp.co.uk/" },
  { title: "Esther Perel - Where Should We Begin?", description: "Anonymised real therapy sessions exploring relationships and identity.", url: "https://www.estherperel.com/podcast" },
  { title: "Feel Better, Live More", description: "Dr Rangan Chatterjee explores mental health, wellbeing, and human connection.", url: "https://drchatterjee.com/podcast/" },
];

const articles = [
  { title: "BACP - British Association for Counselling", source: "BACP", url: "https://www.bacp.co.uk/" },
  { title: "UKCP - UK Council for Psychotherapy", source: "UKCP", url: "https://www.psychotherapy.org.uk/" },
  { title: "Psychology Today UK", source: "Psychology Today", url: "https://www.psychologytoday.com/gb" },
];

const PsychotherapistRole = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="psychotherapist" roleName="Psychotherapist" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Psychotherapist" data={{ summary: "Psychotherapists help people understand and work through emotional and psychological difficulties. It's a deeply human profession that requires empathy, rigorous training, and a willingness to sit with complexity. Therapists work in the NHS, private practice, charities, schools, and corporate settings - and demand is growing fast.", dayToDay: ["Conducting therapy sessions - 50 minutes, 1-to-1 or group", "Assessing new clients and creating treatment plans", "Taking clinical notes and managing confidential records", "Attending clinical supervision sessions (mandatory)", "Engaging in continuing professional development (CPD)", "Managing referrals, waiting lists, and session scheduling"], skills: ["Active Listening", "Clinical Assessment", "Therapeutic Modalities (CBT, Psychodynamic, Integrative)", "Ethical Practice", "Safeguarding", "Reflective Practice", "Boundaries & Containment", "Research & Evidence-Based Practice"], traits: ["You're drawn to understanding people at a deep level", "You can hold space for difficult emotions without being overwhelmed", "You're self-aware and committed to your own personal development", "You're patient - change takes time", "You have strong ethical boundaries and a sense of responsibility"], salary: "£28k–£35k (NHS Band 6)", entryTip: "Training is long - typically a diploma or masters (3–4 years), plus 450+ clinical placement hours. BACP and UKCP are the main accrediting bodies. Many trainees are career changers. Personal therapy is usually a requirement of training." }} /><CareerMap title="Psychotherapy Career Path" subtitle="From trainee to clinical director - the therapeutic progression." stages={careerStages} industry="psychotherapy" /></>) },
    { id: "learn", label: "Learn", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Routes into Psychotherapy<span className="text-primary">.</span></h2><div className="space-y-4">{[{ title: "BACP Accredited Training", description: "Diploma or masters-level courses accredited by the British Association for Counselling & Psychotherapy.", url: "https://www.bacp.co.uk/careers/careers-in-counselling/training/" }, { title: "UKCP Training", description: "Routes to UKCP registration across modalities - psychoanalytic, systemic, humanistic, integrative.", url: "https://www.psychotherapy.org.uk/training/" }, { title: "IAPT (High Intensity CBT)", description: "NHS-funded training to become a qualified CBT therapist within the IAPT programme.", url: "https://www.hee.nhs.uk/" }].map((c) => (<a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{c.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{c.description}</p></a>))}</div><OnlineLearningGrid roleName="Psychotherapist" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Psychotherapy" searchQuery="psychotherapy counselling conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live psychotherapy and counselling roles.</p><Link to="/marketplace?industry=psychotherapy#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Psychotherapy Jobs</Link></div><IndustryCVBuilder industry="Psychotherapy" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Psychotherapist" description="Talk therapy, mental health support, and guiding people through personal challenges." tabs={tabs} category="craft" />;
};

export default PsychotherapistRole;
