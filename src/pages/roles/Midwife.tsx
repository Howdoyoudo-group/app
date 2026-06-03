import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Heart } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Heart, roles: [
    { name: "Student Midwife (3-year BSc)", description: "Direct-entry midwifery degree with NHS placements from year one.", salary: "£29k starting on qualification (Band 5)" },
    { name: "Newly Qualified Midwife - Preceptorship", description: "First year on labour ward, antenatal and community supervised by senior midwives.", salary: "£29k–£32k (Band 5)" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Band 6 Midwife", description: "Autonomous practice across labour ward, community and birth centres.", salary: "£36k–£44k (Band 6)" },
    { name: "Caseload / Continuity Midwife", description: "Owns a small caseload of women through pregnancy, birth and postnatal.", salary: "£37k–£45k (Band 6)" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Specialist Midwife (Bereavement, Diabetes, PMH)", description: "Lead on a clinical specialism across the whole maternity service.", salary: "£46k–£55k (Band 7)" },
    { name: "Labour Ward Coordinator", description: "Runs the labour ward shift - allocations, escalations, MDT lead.", salary: "£46k–£55k (Band 7)" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Matron / Consultant Midwife", description: "Owns standards across maternity - quality, safety and clinical practice.", salary: "£55k–£75k (Band 8a/b)" },
    { name: "Director of Midwifery", description: "Trust executive lead for maternity strategy, workforce and safety.", salary: "£90k–£130k+ (Band 9)" },
  ]},
];

const podcasts = [
  { title: "The Practising Midwife Podcast", description: "Clinical practice, research and policy from a leading UK midwifery journal.", url: "https://www.all4maternity.com/podcasts/" },
  { title: "RCM Podcast", description: "The Royal College of Midwives' official podcast on practice and policy.", url: "https://www.rcm.org.uk/" },
];

const articles = [
  { title: "MIDIRS Midwifery Digest", source: "MIDIRS", url: "https://www.midirs.org/" },
  { title: "All4Maternity", source: "All4Maternity", url: "https://www.all4maternity.com/" },
  { title: "RCM News", source: "Royal College of Midwives", url: "https://www.rcm.org.uk/news-views/news/" },
];

const Midwife = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Midwife" data={{
        summary: "Midwifery is a fully autonomous, regulated profession - midwives are the lead carer for the majority of UK pregnancies. They look after women through pregnancy, birth and the postnatal period, working across labour ward, antenatal clinic, birth centres, community and home births. It's the only profession dedicated entirely to one of the biggest moments in a family's life.",
        dayToDay: ["Antenatal appointments and risk assessment", "Supporting women through labour and birth", "Postnatal care for mother and baby", "Home visits and community clinics", "Liaising with obstetricians, neonatal teams and health visitors", "Safeguarding and mental health screening"],
        skills: ["Clinical Assessment in Pregnancy", "Intrapartum Care", "Neonatal Resuscitation", "Breastfeeding Support", "Communication & Advocacy", "Safeguarding"],
        traits: ["Calm in genuinely high-stakes moments", "Strong advocate for the women in your care", "Physically resilient - long shifts, on your feet", "Comfortable working autonomously"],
        salary: "£29k Band 5 → £130k+ Director of Midwifery",
        entryTip: "Routes in: 3-year BSc Midwifery (direct entry) at any UK university, or a shortened 18-month programme for already-registered nurses. Apprenticeship route also available via NHS Trusts. Registration is with the NMC.",
      }} />
      <CareerMap title="Midwifery Career Path" subtitle="From newly qualified to Director of Midwifery." stages={careerStages} industry="health" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="midwife" roleName="Midwife" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Health" searchQuery="midwifery conference UK RCM" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live midwifery roles across the NHS and private sector.</p><Link to="/marketplace?role=midwife#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Midwifery Jobs</Link><a href="https://www.jobs.nhs.uk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 ml-3 border-2 border-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors">NHS Jobs ↗</a></div><IndustryCVBuilder industry="Health" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Midwife" description="Antenatal care, birth and postnatal support - guiding families through one of life's biggest moments." tabs={tabs} category="craft" />;
};

export default Midwife;
