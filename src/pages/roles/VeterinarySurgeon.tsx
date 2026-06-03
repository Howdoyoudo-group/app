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
    { name: "Veterinary Student (5 years)", description: "BVetMed / BVMS at one of 11 RCVS-accredited UK vet schools.", salary: "Student loan during study" },
    { name: "New Graduate Vet", description: "First-opinion practice - consults, vaccinations, minor surgery, supported by senior vets.", salary: "£32k–£40k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Vet Surgeon (2–5 years)", description: "Independent caseload - surgery, dentistry, complex medicine, on-call rota.", salary: "£42k–£55k" },
    { name: "Certificate Holder (CertAVP)", description: "Post-grad qualification in a chosen area (small animal medicine, surgery, exotics).", salary: "£50k–£65k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior / Lead Vet", description: "Mentors juniors, owns clinical standards in the practice, complex case lead.", salary: "£60k–£80k" },
    { name: "RCVS Specialist (Diploma)", description: "European or RCVS Diploma in a specialism - referral-level work in oncology, cardiology, orthopaedics.", salary: "£75k–£110k+" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Practice Owner / Partner", description: "Owns the business - clinical lead plus full P&L responsibility.", salary: "£90k–£200k+ (drawings)" },
    { name: "Clinical Director (Group)", description: "Sets clinical standards across multi-site corporate groups (CVS, IVC Evidensia, VetPartners).", salary: "£100k–£150k+" },
  ]},
];

const podcasts = [
  { title: "Veterinary Ramblings", description: "UK-focused vet podcast covering clinical cases, careers and practice life.", url: "https://veterinaryramblings.podbean.com/" },
  { title: "The Veterinary Project", description: "Practical clinical updates and career conversations for UK vets and nurses.", url: "https://www.theveterinaryproject.co.uk/" },
];

const articles = [
  { title: "Veterinary Times", source: "Vet Times", url: "https://www.vettimes.co.uk/" },
  { title: "Vet Record", source: "BVA / BMJ", url: "https://www.bva.co.uk/news-and-blog/" },
  { title: "RCVS News", source: "Royal College of Veterinary Surgeons", url: "https://www.rcvs.org.uk/news-and-views/" },
];

const VeterinarySurgeon = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Veterinary Surgeon" data={{
        summary: "Vets are the doctors of the animal world. UK vets are RCVS-registered after a 5-year degree at one of 11 accredited vet schools. The job covers everything from routine vaccinations to emergency orthopaedic surgery - most vets work in small-animal first-opinion practice, but routes also exist into farm, equine, exotics, research, public health and corporate roles.",
        dayToDay: ["Consulting clients on sick and well animals", "Surgical procedures - neutering, dentals, soft tissue", "Diagnostic work - imaging, bloods, ultrasound", "On-call shifts (depending on practice)", "Mentoring nurses and new graduate vets", "Client communication on difficult decisions including end-of-life"],
        skills: ["Clinical Diagnosis (multi-species)", "Soft Tissue Surgery", "Anaesthesia", "Imaging & Lab Interpretation", "Client Communication", "Emergency Triage"],
        traits: ["Resilient - euthanasia and difficult news come with the job", "Practical, hands-on problem-solver", "Strong communicator - owners need clarity", "Comfortable with high-stakes decision-making"],
        salary: "£32k new grad → £200k+ practice owner",
        entryTip: "Routes in: A-levels in Biology and Chemistry plus a third science → 5-year BVetMed at RVC, Cambridge, Edinburgh, Bristol, Nottingham, Liverpool, Glasgow, Surrey, Aberystwyth, Keele or Harper & Keele. Highly competitive - most schools want strong work experience across small-animal and large-animal practice. Graduate-entry route also available.",
      }} />
      <CareerMap title="Veterinary Career Path" subtitle="From new grad to practice owner or specialist." stages={careerStages} industry="pets" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="veterinary-surgeon" roleName="Veterinary Surgeon" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Pets" searchQuery="London Vet Show BSAVA congress" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live veterinary surgeon roles across the UK.</p><Link to="/marketplace?role=veterinary-surgeon#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Vet Jobs</Link><a href="https://jobs.bva.co.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">BVA Jobs ↗</a></div><IndustryCVBuilder industry="Pets" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Veterinary Surgeon" description="Diagnosing, treating and operating on animals - from family pets to working dogs and exotic species." tabs={tabs} category="craft" />;
};

export default VeterinarySurgeon;
