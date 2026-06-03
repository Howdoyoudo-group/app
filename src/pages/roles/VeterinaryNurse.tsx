import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, PawPrint } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: PawPrint, roles: [
    { name: "Student Veterinary Nurse", description: "3-year apprenticeship or 2-year diploma in a training practice - on-the-job + college.", salary: "£18k–£22k while training" },
    { name: "Veterinary Care Assistant (VCA)", description: "Pre-RVN role - animal handling, kennels, theatre prep, owner support.", salary: "£20k–£23k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Registered Veterinary Nurse (RVN)", description: "Independent clinical role - anaesthesia, nursing care, surgery assist, owner consults.", salary: "£26k–£32k" },
    { name: "Senior RVN", description: "Mentors students, takes lead nursing cases, runs nurse clinics.", salary: "£30k–£36k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Head Nurse", description: "Owns the nursing team - rotas, training, clinical standards across the practice.", salary: "£35k–£45k" },
    { name: "Specialist / Diploma Nurse (Anaesthesia, ECC, Surgery)", description: "Post-graduate certificate or diploma in a chosen specialism.", salary: "£36k–£48k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Practice / Hospital Manager", description: "Runs the operational and people side of the practice - often an RVN by background.", salary: "£40k–£60k" },
    { name: "Group Nursing Lead", description: "Sets nursing standards across multi-site corporate groups (CVS, IVC Evidensia, VetPartners).", salary: "£50k–£75k" },
  ]},
];

const podcasts = [
  { title: "Vet Nurse Rounds", description: "Practical clinical podcast aimed specifically at student and qualified veterinary nurses.", url: "https://veterinarynurserounds.buzzsprout.com/" },
  { title: "BVNA Podcast", description: "British Veterinary Nursing Association podcast - covers practice, careers and CPD.", url: "https://bvna.org.uk/" },
];

const articles = [
  { title: "Veterinary Nursing Journal", source: "BVNA", url: "https://bvna.org.uk/news/" },
  { title: "Veterinary Times", source: "Vet Times", url: "https://www.vettimes.co.uk/" },
  { title: "RCVS Knowledge", source: "RCVS Knowledge", url: "https://knowledge.rcvs.org.uk/" },
];

const VeterinaryNurse = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Veterinary Nurse" data={{
        summary: "Veterinary nurses are the engine room of every UK practice. RVNs are RCVS-registered, autonomous practitioners - they run anaesthesia, recover patients, hold their own clinics, and assist in surgery. The role is hands-on from day one and the apprenticeship route means you can train as you earn, with no university debt.",
        dayToDay: ["Anaesthesia monitoring during surgery", "Inpatient nursing - meds, IV fluids, post-op care", "Theatre prep and surgical assist", "Owner clinics - weight, dental, behaviour, second vaccinations", "Lab work - bloods, urinalysis, microscopy", "Mentoring student nurses and VCAs"],
        skills: ["Anaesthesia & Analgesia", "Surgical Nursing", "IV Catheterisation", "Pharmacology", "Owner Communication", "Clinical Coaching"],
        traits: ["Practical hands-on temperament - physical, varied days", "Comfortable with sick animals and difficult conversations", "Calm in surgical and emergency settings", "Strong team player - practices live and die on team"],
        salary: "£18k trainee → £75k group lead nurse",
        entryTip: "Routes in: 3-year Veterinary Nursing Apprenticeship (Level 3) at an RCVS-approved training practice, or a 2-year FdSc / diploma at a vet college (Bicton, Bishop Burton, Hadlow). RVN registration with the RCVS on completion.",
      }} />
      <CareerMap title="Veterinary Nursing Career Path" subtitle="From trainee to head nurse or hospital manager." stages={careerStages} industry="pets" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="veterinary-nurse" roleName="Veterinary Nurse" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Pets" searchQuery="BVNA congress veterinary nursing UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live RVN and veterinary nursing roles across the UK.</p><Link to="/marketplace?role=veterinary-nurse#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Vet Nurse Jobs</Link><a href="https://jobs.bva.co.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">BVA Jobs ↗</a></div><IndustryCVBuilder industry="Pets" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Veterinary Nurse" description="Surgical assistance, animal care and client support - the backbone of every busy vet practice." tabs={tabs} category="craft" />;
};

export default VeterinaryNurse;
