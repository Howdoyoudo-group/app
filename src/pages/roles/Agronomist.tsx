import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Sprout } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Sprout, roles: [
    { name: "Trainee Agronomist", description: "Fresh BSc graduate - supports a senior agronomist on farm visits while studying BASIS / FACTS.", salary: "£26k–£32k + car" },
    { name: "Crop Trials Technician", description: "Field trials work for Syngenta, Bayer, Corteva - collecting data on new chemistry and seed.", salary: "£25k–£30k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Agronomist (BASIS / FACTS qualified)", description: "Owns own portfolio of farms - recommends seed, nutrition, crop protection.", salary: "£35k–£50k + commission + car" },
    { name: "Senior Agronomist", description: "Larger book of farms, complex rotations, niche crops (potatoes, sugar beet, veg).", salary: "£45k–£65k + commission" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Regional / Lead Agronomist", description: "Manages a team of agronomists across a region for groups like Hutchinsons, Frontier or Agrii.", salary: "£60k–£80k + bonus" },
    { name: "Technical Specialist", description: "Specialism in crop nutrition, integrated pest management or precision ag.", salary: "£55k–£75k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head of Agronomy", description: "Sets agronomy strategy across a national distributor or large grower group.", salary: "£80k–£120k+" },
    { name: "Director - Agri-Tech / Crop Inputs", description: "Senior leadership at AHDB, NIAB, RSK or major manufacturers (Syngenta, Bayer).", salary: "£100k–£180k+" },
  ]},
];

const podcasts = [
  { title: "AHDB Food & Farming Podcast", description: "The UK levy board's official podcast - crop research, market reports and on-farm trials.", url: "https://ahdb.org.uk/podcasts" },
  { title: "Direct Driller Podcast", description: "UK regen and conservation agriculture conversations with leading farmers and agronomists.", url: "https://directdriller.com/" },
];

const articles = [
  { title: "Crop Production Magazine", source: "CPM", url: "https://cpm-magazine.co.uk/" },
  { title: "AHDB Cereals & Oilseeds", source: "AHDB", url: "https://ahdb.org.uk/cereals-oilseeds" },
  { title: "Farmers Weekly Arable", source: "FWi", url: "https://www.fwi.co.uk/arable" },
];

const Agronomist = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Agronomist" data={{
        summary: "Agronomists are the technical advisors that modern farmers rely on - they walk crops weekly, diagnose problems, and recommend the right seed, nutrition and crop protection. Most are BASIS and FACTS qualified, which is mandatory to recommend pesticides and fertilisers in the UK. With sustainability and IPM (integrated pest management) reshaping the industry, demand for skilled agronomists is structurally rising.",
        dayToDay: ["Walking fields weekly across a portfolio of farms", "Identifying weeds, pests and diseases", "Writing recommendations for seed, fertiliser and crop protection", "Soil sampling and nutrition planning", "Trial work - testing new varieties and chemistry", "CPD with BASIS, FACTS and AICC"],
        skills: ["Crop Identification & Disease Diagnosis", "BASIS Certificate in Crop Protection", "FACTS Qualification (Nutrition)", "Soil Science", "Precision Agriculture (NDVI, satellite imaging)", "On-farm Trial Design"],
        traits: ["Practical and outdoors - fields in all weathers", "Numerate and scientific mindset", "Strong communicator - farmers need clarity", "Commercially aware - recommendations affect yield and income"],
        salary: "£26k trainee → £180k+ industry director",
        entryTip: "Routes in: BSc Agriculture, Crop Science, Plant Science or Agronomy at Harper Adams, Reading, Newcastle, SRUC or Nottingham. Major employers - Hutchinsons, Frontier Agriculture, Agrii, ProCam, Bartholomews - sponsor BASIS / FACTS qualifications and provide a company car. Independent agronomy via AICC also a strong route after 3–5 years.",
      }} />
      <CareerMap title="Agronomy Career Path" subtitle="From trainee to head of agronomy or industry director." stages={careerStages} industry="farming" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="agronomist" roleName="Agronomist" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Farming" searchQuery="Cereals event LAMMA agronomy UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live agronomy roles across the UK.</p><Link to="/marketplace?role=agronomist#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Agronomy Jobs</Link></div><IndustryCVBuilder industry="Farming" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Agronomist" description="Soil science, crop health and yield optimisation - the technical advisors farmers rely on each season." tabs={tabs} category="craft" />;
};

export default Agronomist;
