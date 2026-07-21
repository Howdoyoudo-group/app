import { industryVideos } from "@/data/industry-videos";
import VideoShowcase from "@/components/VideoShowcase";
import ExploreFurther from "@/components/ExploreFurther";
import { Link } from "react-router-dom";
import { CompanyProfileGrid } from "@/components/CompanyProfileCard";
import LiveArticles from "@/components/LiveArticles";
import DailyBriefing from "@/components/DailyBriefing";
import BreakingNewsFeed from "@/components/BreakingNewsFeed";
import NewsfeedModal from "@/components/NewsfeedModal";
import EventsSection from "@/components/EventsSection";
import CareerMap from "@/components/CareerMap";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import IndustryRolesShowcase from "@/components/IndustryRolesShowcase";
import DayInTheLife from "@/components/DayInTheLife";
import CoursesSection from "@/components/CoursesSection";
import TheDownload from "@/components/TheDownload";
import YouTubeChannels from "@/components/YouTubeChannels";
import TikTokCreators from "@/components/TikTokCreators";
import SubstackNewsletters from "@/components/SubstackNewsletters";
import PodcastPlayer from "@/components/PodcastPlayer";
import IndustryPageLayout from "@/components/IndustryPageLayout";
import IndustryRolesLink from "@/components/IndustryRolesLink";
import { Stethoscope, GraduationCap, Activity, HeartPulse, Brain, Building2 } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const physiotherapyStages: CareerStage[] = [
  { title: "Education & Training", icon: GraduationCap, roles: [
    { name: "Physiotherapy Student", description: "Studies a BSc or MSc in Physiotherapy at an accredited university.", salary: "Student" },
    { name: "Clinical Placement Coordinator", description: "Organises and manages student placements.", salary: "£28k–£40k" },
    { name: "University Lecturer", description: "Teaches physiotherapy modules at degree level.", salary: "£38k–£60k" },
    { name: "CPD Provider", description: "Designs and delivers post-qualification training courses.", salary: "£30k–£55k" },
    { name: "Research Physiotherapist", description: "Conducts clinical research to advance evidence-based practice.", salary: "£35k–£55k" },
  ]},
  { title: "NHS & Primary Care", icon: Stethoscope, roles: [
    { name: "Band 5 Physiotherapist", description: "Newly qualified physiotherapist.", salary: "£29k–£36k" },
    { name: "Band 6 Specialist", description: "Experienced physiotherapist specialising in MSK, respiratory, or neurology.", salary: "£37k–£44k" },
    { name: "Band 7 Advanced Practitioner", description: "Senior clinician managing complex caseloads.", salary: "£46k–£53k" },
    { name: "Band 8a Clinical Lead", description: "Leads a physiotherapy team or service.", salary: "£53k–£60k" },
    { name: "Consultant Physiotherapist", description: "The most senior clinical role.", salary: "£62k–£73k" },
    { name: "First Contact Practitioner", description: "Works in GP surgeries as the first point of contact for MSK conditions.", salary: "£37k–£53k" },
    { name: "Community Physiotherapist", description: "Treats patients in homes, care homes, or community clinics.", salary: "£29k–£44k" },
  ]},
  { title: "Sports & Performance", icon: Activity, roles: [
    { name: "Sports Physiotherapist", description: "Works with athletes and sports teams.", salary: "£30k–£65k" },
    { name: "Pitch-Side Physio", description: "Provides immediate injury assessment during training and matches.", salary: "£28k–£55k" },
    { name: "Strength & Conditioning Coach", description: "Designs exercise programmes to enhance performance.", salary: "£25k–£50k" },
    { name: "Team Lead Physiotherapist", description: "Heads the physiotherapy department for a sports club.", salary: "£50k–£80k" },
    { name: "Performance Analyst", description: "Uses data and movement analysis for rehabilitation.", salary: "£28k–£45k" },
  ]},
  { title: "Private Practice", icon: Building2, roles: [
    { name: "Private Physiotherapist", description: "Treats patients in a private clinic.", salary: "£35k–£70k" },
    { name: "Clinic Owner", description: "Runs their own physiotherapy practice.", salary: "£50k–£120k+" },
    { name: "Occupational Health Physio", description: "Works with employers on workplace injuries.", salary: "£35k–£55k" },
    { name: "Telehealth Physiotherapist", description: "Delivers consultations remotely via video.", salary: "£30k–£55k" },
    { name: "Domiciliary Physiotherapist", description: "Provides private physiotherapy in patients' homes.", salary: "£35k–£60k" },
  ]},
  { title: "Specialist Areas", icon: Brain, roles: [
    { name: "Neurological Physiotherapist", description: "Treats stroke, MS, Parkinson's, and spinal cord injuries.", salary: "£37k–£60k" },
    { name: "Respiratory Physiotherapist", description: "Manages breathing disorders and works in critical care.", salary: "£37k–£55k" },
    { name: "Paediatric Physiotherapist", description: "Works with children with developmental conditions.", salary: "£37k–£55k" },
    { name: "Women's Health Physiotherapist", description: "Specialises in pelvic health and post-natal rehabilitation.", salary: "£37k–£60k" },
    { name: "Hand Therapist", description: "Specialises in hand and upper limb injuries.", salary: "£37k–£55k" },
    { name: "Pain Management Specialist", description: "Helps patients manage chronic pain conditions.", salary: "£40k–£60k" },
  ]},
  { title: "Leadership & Management", icon: HeartPulse, roles: [
    { name: "Head of Physiotherapy", description: "Leads the physiotherapy department.", salary: "£55k–£75k" },
    { name: "AHP Director", description: "Oversees all allied health professions within a trust.", salary: "£70k–£95k" },
    { name: "Clinical Commissioner", description: "Commissions physiotherapy services for a region.", salary: "£50k–£75k" },
    { name: "Professional Body Officer", description: "Works for the CSP or HCPC.", salary: "£35k–£60k" },
    { name: "Quality Improvement Lead", description: "Drives service improvement initiatives.", salary: "£45k–£60k" },
  ]},
];

const newsfeed = [
  { title: "CSP (Chartered Society of Physiotherapy)", url: "https://www.csp.org.uk/news" },
  { title: "Frontline Magazine", url: "https://www.csp.org.uk/frontline" },
  { title: "Physio Network", url: "https://www.physio-network.com" },
];

const physiotherapyCompanies = [
  { name: "CSP", url: "https://www.csp.org.uk/careers", founded: "1894", hq: "London", glassdoor: 3.6, overview: "The Chartered Society of Physiotherapy - the professional body and trade union.", valueChainStage: "Professional Bodies" },
  { name: "NHS", url: "https://www.jobs.nhs.uk", founded: "1948", hq: "Nationwide", glassdoor: 3.8, trustpilot: 4.3, overview: "The world's largest publicly funded health service.", valueChainStage: "NHS & Public Sector" },
  { name: "Bupa", url: "https://careers.bupa.co.uk/search-jobs", founded: "1947", hq: "London", glassdoor: 3.6, overview: "One of the UK's largest private healthcare providers.", valueChainStage: "Private Practice" },
  { name: "Nuffield Health", url: "https://www.nuffieldhealth.com/careers", founded: "1957", hq: "London", glassdoor: 3.7, overview: "The UK's largest healthcare charity.", valueChainStage: "Private Practice" },
  { name: "Six Physio", url: "https://sixphysio.com/physiotherapy-jobs", founded: "2003", hq: "London", glassdoor: 4.2, trustpilot: 4.8, overview: "A leading private physiotherapy practice in London.", valueChainStage: "Private Practice" },
  { name: "PhysioFirst", url: "https://www.physiofirst.org.uk", founded: "1952", hq: "London", overview: "The professional body for private physiotherapy practitioners.", valueChainStage: "Professional Bodies" },
  { name: "Ramsay Health Care UK", url: "https://www.ramsayhealth.co.uk/Careers", founded: "1964", hq: "Sydney (UK: Surrey)", glassdoor: 3.4, overview: "One of the UK's largest private hospital groups - 30+ facilities running musculoskeletal and rehab services.", valueChainStage: "Private Practice" },
];

const Physiotherapy = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the world of physiotherapy.</p>
        <PodcastPlayer industry="physiotherapy" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Physio Matters Podcast", description: "Real talk about clinical practice and career progression.", url: "https://www.physiomatters.com/" },
            { title: "The Physio Network Podcast", description: "Evidence-based conversations with leading researchers.", url: "https://www.physio-network.com/podcast/" },
            { title: "In Touch Podcast (CSP)", description: "The CSP's official podcast covering policy and practice.", url: "https://www.csp.org.uk/news" },
            { title: "The Sports Physio Podcast", description: "Deep dives into sports injury management.", url: "https://thesportsphysio.com/podcast/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="physiotherapy" />
        <LiveArticles industry="physiotherapy" fallbackArticles={[
          { title: "Why the NHS Is Struggling to Recruit Physiotherapists", source: "CSP", url: "https://www.csp.org.uk/news" },
          { title: "The Rise of Private Physiotherapy in the UK", source: "Frontline", url: "https://www.csp.org.uk/frontline" },
          { title: "How Sports Physiotherapy Became One of the Most Competitive Careers", source: "The Guardian", url: "https://www.theguardian.com/healthcare-network" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="physiotherapy" />
          <div className="mt-4"><BreakingNewsFeed industry="physiotherapy" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="physiotherapy" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["physiotherapy"] || []} /><div className="mt-12"><YouTubeChannels industry="physiotherapy" /><TikTokCreators industry="physiotherapy" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={physiotherapyCompanies} />
        <div className="mt-12"><DayInTheLife industry="physiotherapy" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From student placement to consultant practitioner - every role in the physiotherapy value chain." stages={physiotherapyStages} industry="physiotherapy" />
          <div className="mt-12"><IndustryRolesLink industry="Physiotherapy" /></div>
        <ExploreFurther links={[
          { title: "CSP - Careers in Physiotherapy", description: "The Chartered Society of Physiotherapy's guide to becoming a physio, career development, and specialisms.", url: "https://www.csp.org.uk/careers-jobs" },
          { title: "NHS Health Careers - Physiotherapist", description: "The NHS guide to physiotherapy careers, training routes, and what to expect from the role.", url: "https://www.healthcareers.nhs.uk/explore-roles/allied-health-professionals/physiotherapist" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Physiotherapy" searchQuery="physiotherapy conference UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Physiotherapy" slug="physiotherapy" />
          <CoursesSection industry="physiotherapy" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Hands on roles that make a difference<span className="text-primary">…</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the physiotherapy industry.</p>
          <Link to="/marketplace?industry=Physiotherapy#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={physiotherapyStages} industry="Physiotherapy" companies={physiotherapyCompanies} />
        <IndustryCVBuilder industry="Physiotherapy" stages={physiotherapyStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Physiotherapy" description="From NHS wards to elite sports clubs, private clinics to community care - the people getting the world moving again." profile="The physiotherapy sector focuses on physical rehabilitation, injury prevention, and performance improvement across healthcare and sport. In the UK, it employs roughly 70,000 to 90,000 professionals across the NHS, private practice, and elite sport. It plays a critical role in recovery, mobility, and long-term health outcomes." tabs={tabs} />;
};

export default Physiotherapy;
