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
import { Stethoscope, Heart, FlaskConical, HeartPulse, Cpu, Briefcase } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const healthStages: CareerStage[] = [
  { title: "Doctors & Clinicians", icon: Stethoscope, roles: [
    { name: "GP (General Practitioner)", description: "Front-line community doctor - the first point of contact for most NHS patients.", salary: "£65k–£110k" },
    { name: "Hospital Doctor / Consultant", description: "Specialist clinician working in NHS or private hospitals across surgery, medicine and emergency care.", salary: "£35k–£130k+" },
    { name: "Surgeon", description: "Performs surgical procedures across specialties - orthopaedics, cardiothoracic, neuro and more.", salary: "£55k–£140k+" },
    { name: "Psychiatrist", description: "Doctor specialising in mental health diagnosis, medication and inpatient care.", salary: "£55k–£120k" },
  ]},
  { title: "Nursing & Midwifery", icon: HeartPulse, roles: [
    { name: "Registered Nurse", description: "Delivers hands-on patient care across hospitals, GP practices and the community.", salary: "£28k–£44k" },
    { name: "Specialist Nurse", description: "Advanced practice in oncology, palliative, paediatric, mental health or A&E.", salary: "£35k–£55k" },
    { name: "Midwife", description: "Cares for women and babies through pregnancy, birth and the postnatal period.", salary: "£28k–£45k" },
    { name: "Nurse Practitioner", description: "Senior clinician with the autonomy to assess, diagnose and prescribe.", salary: "£45k–£60k" },
    { name: "Health Visitor", description: "Specialist community nurse supporting families with children under 5.", salary: "£35k–£48k" },
  ]},
  { title: "Care & Social Care", icon: Heart, roles: [
    { name: "Care Worker / Carer", description: "Provides personal, practical and emotional support to older or disabled people at home or in residential care.", salary: "£20k–£26k" },
    { name: "Care Home Manager", description: "Runs a residential or nursing home - staff, regulation, residents and families.", salary: "£30k–£55k" },
    { name: "Live-in Carer", description: "Provides 24/7 in-home support, often as an alternative to residential care.", salary: "£700–£1,100/wk" },
    { name: "Domiciliary Care Coordinator", description: "Plans and supervises home-care visits across a region for a care provider.", salary: "£24k–£32k" },
    { name: "Social Worker (Adults / Children)", description: "Statutory role safeguarding vulnerable people and coordinating care plans.", salary: "£30k–£45k" },
  ]},
  { title: "Allied Health & Pharmacy", icon: FlaskConical, roles: [
    { name: "Pharmacist", description: "Dispenses medication, advises patients and increasingly prescribes - community or hospital.", salary: "£35k–£65k" },
    { name: "Paramedic", description: "Front-line emergency care - ambulance crews, urgent treatment centres and community response.", salary: "£28k–£45k" },
    { name: "Radiographer", description: "Diagnostic and therapeutic imaging - X-ray, CT, MRI, ultrasound and oncology.", salary: "£28k–£48k" },
    { name: "Occupational Therapist", description: "Helps people regain independence after illness, injury or with a long-term condition.", salary: "£28k–£45k" },
    { name: "Dietitian", description: "NHS-registered nutrition specialist - clinical diets, public health and food service.", salary: "£28k–£45k" },
  ]},
  { title: "MedTech, Biotech & Pharma", icon: Cpu, roles: [
    { name: "Clinical Researcher", description: "Designs and runs clinical trials for new drugs, vaccines or devices.", salary: "£35k–£65k" },
    { name: "Biomedical Scientist", description: "Analyses samples in NHS or private pathology labs - haematology, microbiology, biochemistry.", salary: "£28k–£48k" },
    { name: "MedTech Product Manager", description: "Builds digital health, devices or diagnostics - from concept to clinical adoption.", salary: "£55k–£100k+" },
    { name: "Health Data Scientist", description: "Uses NHS and real-world data to improve outcomes, planning and AI in healthcare.", salary: "£45k–£90k" },
    { name: "Pharma Sales Rep", description: "Builds relationships with prescribers and hospital teams for a pharmaceutical company.", salary: "£35k–£65k+ bonus" },
  ]},
  { title: "Health Leadership & Policy", icon: Briefcase, roles: [
    { name: "Hospital Manager", description: "Runs an NHS or private hospital - operations, finance, governance and patient outcomes.", salary: "£55k–£120k+" },
    { name: "Practice Manager (GP)", description: "Manages the business side of a GP surgery - staff, finance, contracts and CQC compliance.", salary: "£35k–£60k" },
    { name: "Public Health Specialist", description: "Works in DHSC, UKHSA or local councils on prevention, health inequalities and emergencies.", salary: "£45k–£90k" },
    { name: "Health Policy Adviser", description: "Shapes NHS, social care and health-tech policy in government, think tanks or trade bodies.", salary: "£40k–£80k" },
    { name: "Healthcare Consultant", description: "Advises NHS Trusts, providers and pharma on strategy, transformation and operations.", salary: "£45k–£100k+" },
  ]},
];

const newsfeed = [
  { title: "BBC Health", url: "https://www.bbc.co.uk/news/health" },
  { title: "Nursing Times", url: "https://www.nursingtimes.net" },
  { title: "HSJ (Health Service Journal)", url: "https://www.hsj.co.uk" },
  { title: "Pulse", url: "https://www.pulsetoday.co.uk" },
];

const healthCompanies = [
  { name: "NHS England", url: "https://www.jobs.nhs.uk", founded: "1948", hq: "London", overview: "The UK's largest employer - 1.7m+ staff across hospitals, GPs, mental health and community services.", valueChainStage: "Doctors & Clinicians" },
  { name: "NHS Scotland", url: "https://jobs.scot.nhs.uk", founded: "1948", hq: "Edinburgh", overview: "Scotland's national health service - over 180,000 staff across 14 territorial NHS Boards.", valueChainStage: "Doctors & Clinicians" },
  { name: "Bupa UK", url: "https://www.bupa.com/careers", founded: "1947", hq: "London", overview: "International healthcare company - private health insurance, clinics, dental and care homes.", valueChainStage: "Doctors & Clinicians" },
  { name: "HCA Healthcare UK", url: "https://www.hcahealthcare.co.uk/careers/", founded: "1996", hq: "London", overview: "London's leading private hospital group - Wellington, Princess Grace, Harley Street Clinic.", valueChainStage: "Doctors & Clinicians" },
  { name: "Spire Healthcare", url: "https://www.spirehealthcare.com/careers/", founded: "2007", hq: "London", overview: "One of the UK's largest private hospital networks - 39 hospitals across England, Scotland and Wales.", valueChainStage: "Doctors & Clinicians" },
  { name: "Nuffield Health", url: "https://www.nuffieldhealth.com/careers", founded: "1957", hq: "Epsom", overview: "Healthcare charity - hospitals, fitness clubs and corporate wellbeing.", valueChainStage: "Doctors & Clinicians" },
  { name: "Royal College of Nursing", url: "https://www.rcn.org.uk/about-us/Work-for-the-RCN", founded: "1916", hq: "London", overview: "The UK's largest nursing union and professional body - 500,000+ members.", valueChainStage: "Nursing & Midwifery" },
  { name: "Care UK", url: "https://www.careukcareers.co.uk", founded: "1982", hq: "Colchester", overview: "Major independent care provider - care homes, NHS services and primary care.", valueChainStage: "Care & Social Care" },
  { name: "HC-One", url: "https://www.hc-one.co.uk/careers", founded: "2011", hq: "Darlington", overview: "The UK's largest care home operator - 280+ homes and 17,000 residents.", valueChainStage: "Care & Social Care" },
  { name: "Helping Hands", url: "https://www.helpinghandshomecare.co.uk/careers/", founded: "1989", hq: "Alcester", overview: "Leading UK home-care provider - visiting and live-in care across England and Wales.", valueChainStage: "Care & Social Care" },
  { name: "Boots UK", url: "https://www.boots.jobs", founded: "1849", hq: "Nottingham", overview: "The UK's largest pharmacy chain - community pharmacy, healthcare and beauty retail.", valueChainStage: "Allied Health & Pharmacy" },
  { name: "Well Pharmacy", url: "https://www.well.co.uk/about-well/careers", founded: "1973", hq: "Manchester", overview: "One of the UK's largest pharmacy chains (formerly LloydsPharmacy) - community and online medication services.", valueChainStage: "Allied Health & Pharmacy" },
  { name: "GSK", url: "https://www.gsk.com/en-gb/careers/", founded: "2000", hq: "London", overview: "Global pharma - vaccines, specialty medicines and HIV (ViiV).", valueChainStage: "MedTech, Biotech & Pharma" },
  { name: "AstraZeneca", url: "https://careers.astrazeneca.com", founded: "1999", hq: "Cambridge", overview: "British-Swedish biopharma giant - oncology, cardiovascular, respiratory and rare disease.", valueChainStage: "MedTech, Biotech & Pharma" },
  { name: "Babylon / eMed", url: "https://www.emed.com/uk/careers", founded: "2013", hq: "London", overview: "Digital-first health platform - virtual GP, asynchronous care and remote diagnostics.", valueChainStage: "MedTech, Biotech & Pharma" },
  { name: "Smith+Nephew", url: "https://www.smith-nephew.com/en/careers", founded: "1856", hq: "Watford", overview: "Global medical devices - orthopaedics, sports medicine, advanced wound management.", valueChainStage: "MedTech, Biotech & Pharma" },
  { name: "GE HealthCare", url: "https://www.gehealthcare.com/about/careers", founded: "1994", hq: "Amersham (UK)", overview: "Medical imaging, ultrasound, patient monitoring and digital health technology.", valueChainStage: "MedTech, Biotech & Pharma" },
  { name: "NICE (National Institute for Health and Care Excellence)", url: "https://www.nice.org.uk/about/who-we-are/jobs", founded: "1999", hq: "London / Manchester", overview: "Sets evidence-based guidance for UK healthcare - what the NHS funds and how care is delivered.", valueChainStage: "Health Leadership & Policy" },
  { name: "Department of Health & Social Care", url: "https://www.gov.uk/government/organisations/department-of-health-and-social-care/about/recruitment", founded: "1968", hq: "London", overview: "The government department responsible for UK health and social care policy and the NHS.", valueChainStage: "Health Leadership & Policy" },
  { name: "Wellcome Trust", url: "https://wellcome.org/jobs", founded: "1936", hq: "London", overview: "One of the world's largest health research foundations - funds biomedical and global health research.", valueChainStage: "Health Leadership & Policy" },
];

const Health = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring careers across the NHS, care, pharma and medtech.</p>
        <PodcastPlayer industry="health" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "BMJ Talk Medicine", description: "The British Medical Journal's flagship podcast - clinical research, debate and news for doctors.", url: "https://soundcloud.com/bmjpodcasts" },
            { title: "Nursing Standard Podcast", description: "Conversations with nurses, midwives and health leaders across the UK.", url: "https://rcni.com/nursing-standard/podcast" },
            { title: "The HSJ Podcast", description: "The Health Service Journal's weekly take on the politics, policy and people of the NHS.", url: "https://www.hsj.co.uk/podcasts" },
            { title: "NHS England's The NHS Long Read", description: "Stories and insight from across England's national health service.", url: "https://www.england.nhs.uk/blog/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="health" />
        <LiveArticles industry="health" fallbackArticles={[
          { title: "Inside the NHS Workforce Plan: 300,000 New Staff by 2037", source: "HSJ", url: "https://www.hsj.co.uk" },
          { title: "AI in the NHS: Hype, Hope and Hospital Reality", source: "BBC Health", url: "https://www.bbc.co.uk/news/health" },
          { title: "Social Care Crisis Deepens as Vacancies Top 150,000", source: "Nursing Times", url: "https://www.nursingtimes.net" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="health" />
          <div className="mt-4"><BreakingNewsFeed industry="health" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="health" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["health"] || []} /><div className="mt-12"><YouTubeChannels industry="health" /><TikTokCreators industry="health" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={healthCompanies} />
        <div className="mt-12"><DayInTheLife industry="health" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From the NHS to MedTech, care to pharma - every career in UK health and social care." stages={healthStages} industry="health" />
          <div className="mt-12"><IndustryRolesLink industry="Health" /></div>
        <ExploreFurther links={[
          { title: "NHS Careers", description: "The official guide to 350+ NHS roles - clinical and non-clinical, training routes and apprenticeships.", url: "https://www.healthcareers.nhs.uk" },
          { title: "Skills for Care", description: "The strategic body for the adult social care workforce in England - careers, training, employers.", url: "https://www.skillsforcare.org.uk" },
          { title: "Health Education England", description: "Training and development for the NHS workforce - medical schools, nursing, AHP routes.", url: "https://www.hee.nhs.uk" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Health" searchQuery="healthcare NHS medtech conference UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Health" slug="health" />
          <CoursesSection industry="health" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Look what the Doctor ordered<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the NHS, private healthcare, care and MedTech.</p>
          <Link to="/marketplace?industry=Health#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={healthStages} industry="Health" companies={healthCompanies} />
        <IndustryCVBuilder industry="Health" stages={healthStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Health"
      description="Doctors, nurses, carers, pharmacists, MedTech founders and the people keeping the UK well."
      profile="Health is the UK's biggest sector by employment. The NHS alone employs 1.7 million people across hospitals, GPs, ambulance trusts, mental health and community services - making it one of the largest workforces in the world. Add in 1.5 million social-care workers, 65,000 community pharmacists, the UK's £30bn pharmaceutical industry, world-leading MedTech and a rapidly growing digital health scene (Babylon, eMed, Cera) and you get a sector that touches every life."
      tabs={tabs}
    />
  );
};

export default Health;
