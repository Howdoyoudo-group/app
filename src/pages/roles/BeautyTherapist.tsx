import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Sparkles } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Sparkles, roles: [
    { name: "Beauty Therapist (Level 2)", description: "Facials, waxing, manicures and pedicures in a salon, spa or counter setting.", salary: "£20k–£24k" },
    { name: "Counter Beauty Advisor", description: "Brand counter (Boots, Selfridges, John Lewis) - sales, demos and consultations.", salary: "£21k–£26k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Senior Beauty Therapist (Level 3+)", description: "Advanced treatments - body, electrical, aesthetics support.", salary: "£24k–£30k" },
    { name: "Aesthetic Practitioner", description: "Skin, laser and non-surgical aesthetic treatments (regulated).", salary: "£28k–£40k+" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Spa / Salon Manager", description: "Runs the venue P&L - team, treatments, retail and guest experience.", salary: "£32k–£45k" },
    { name: "Lead Trainer / Educator", description: "Trains therapists for a brand or training academy across the UK.", salary: "£35k–£50k" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Group Spa Director", description: "Owns the spa proposition across a hotel group or chain (Soho House, Champneys).", salary: "£60k–£90k" },
    { name: "Salon Owner / Founder", description: "Runs an independent salon, clinic or treatment brand.", salary: "Variable" },
  ]},
];

const podcasts = [
  { title: "Professional Beauty Podcast", description: "UK salon and spa operators on running a beauty business.", url: "https://professionalbeauty.co.uk/" },
  { title: "The Aesthetics Business Podcast", description: "Aesthetic clinic owners on growing a regulated treatment business.", url: "https://aestheticsjournal.com/" },
];

const articles = [
  { title: "Professional Beauty", source: "Professional Beauty", url: "https://professionalbeauty.co.uk/" },
  { title: "Aesthetics Journal", source: "Aesthetics Journal", url: "https://aestheticsjournal.com/" },
  { title: "Cosmetics Business", source: "Cosmetics Business", url: "https://www.cosmeticsbusiness.com/" },
];

const BeautyTherapist = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="beauty-therapist" roleName="Beauty Therapist" /> },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "plan", label: "Plan", content: (<><RoleOverview name="Beauty Therapist" data={{ summary: "Beauty therapists deliver one-to-one client care across salons, spas, hotels and clinics. It's a regulated craft - qualifications matter, hygiene matters, and great therapists build a loyal client book that travels with them. The growth area is aesthetics: skin, laser and non-surgical treatments.", dayToDay: ["Consulting with clients on skin, hair and body concerns", "Performing facials, waxing, lash, brow, mani / pedi treatments", "Maintaining strict hygiene and infection control", "Recommending and selling retail aftercare products", "Managing the treatment room, stock and bookings", "Building a regular client base through service and rebooking"], skills: ["VTCT / NVQ Level 2 & 3 Beauty Therapy", "Skincare & Product Knowledge", "Massage & Body Treatments", "Lash & Brow Specialism", "Aesthetics (Level 4 / clinical)", "Retail & Consultative Selling"], traits: ["Genuine warmth and presence with clients", "Calm, hygienic and detail-obsessed", "Resilient hands and back - physical work", "Commercial - therapists who hit retail targets earn more"], salary: "£20k–£24k", entryTip: "VTCT or NVQ Level 2 Beauty Therapy is the foundation; Level 3 unlocks senior treatments and most spas. Major employers (Champneys, Nuffield Health, Soho House, Bannatyne, hotel spas, Superdrug) hire qualified therapists year-round. For aesthetics, Level 4 plus a medical sponsor is the gateway." }} /><CareerMap title="Beauty Therapist Career Path" subtitle="From treatment room to spa director." stages={careerStages} industry="beauty" /></>) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Beauty" searchQuery="professional beauty UK exhibition" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live beauty therapist, spa and aesthetics roles.</p><Link to="/marketplace?role=beauty-therapist#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Beauty Jobs</Link></div><IndustryCVBuilder industry="Beauty" stages={careerStages} /></>) },
  ];

  return <RolePageLayout name="Beauty Therapist" description="Treatments, skincare, and one-to-one client care - the frontline of the beauty and wellbeing industry." tabs={tabs} category="frontline" />;
};

export default BeautyTherapist;
