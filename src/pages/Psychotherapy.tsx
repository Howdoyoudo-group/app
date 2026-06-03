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
import { GraduationCap, Brain, HeartHandshake, Building2, Shield, Crown } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const psychotherapyStages: CareerStage[] = [
  { title: "Training & Qualification", icon: GraduationCap, roles: [
    { name: "Trainee Counsellor", description: "Studies for a diploma or degree in counselling.", salary: "Student / £18k–£24k" },
    { name: "Trainee Psychotherapist", description: "Undertakes a postgraduate or doctoral programme.", salary: "Student / £20k–£28k" },
    { name: "Trainee Clinical Psychologist", description: "Completes a three-year funded doctorate (DClinPsy).", salary: "£33k–£40k (NHS funded)" },
    { name: "CBT Trainee", description: "Studies a postgraduate diploma in CBT.", salary: "£33k–£40k" },
    { name: "Placement Coordinator", description: "Manages student placements across therapy services.", salary: "£28k–£38k" },
    { name: "Training Programme Director", description: "Leads a counselling or psychotherapy training programme.", salary: "£50k–£75k" },
  ]},
  { title: "NHS & IAPT", icon: HeartHandshake, roles: [
    { name: "Psychological Wellbeing Practitioner", description: "Delivers low-intensity CBT interventions.", salary: "£29k–£36k" },
    { name: "High Intensity Therapist", description: "Provides one-to-one CBT for moderate to severe conditions.", salary: "£37k–£44k" },
    { name: "Clinical Psychologist", description: "Assesses and treats complex mental health conditions.", salary: "£46k–£60k" },
    { name: "Counselling Psychologist", description: "Works therapeutically using integrative approaches.", salary: "£40k–£55k" },
    { name: "IAPT Service Manager", description: "Manages an NHS Talking Therapies service.", salary: "£50k–£65k" },
    { name: "Art / Drama / Music Therapist", description: "Uses creative arts as a therapeutic medium.", salary: "£37k–£50k" },
    { name: "EMDR Therapist", description: "Delivers EMDR therapy for trauma and PTSD.", salary: "£37k–£55k" },
  ]},
  { title: "Private Practice", icon: Building2, roles: [
    { name: "Private Therapist", description: "Runs their own therapy practice.", salary: "£40k–£90k+" },
    { name: "Online Therapist", description: "Delivers therapy remotely via video platforms.", salary: "£35k–£70k" },
    { name: "Couples & Family Therapist", description: "Works with relationship and family dynamics.", salary: "£40k–£65k" },
    { name: "Practice Owner", description: "Runs a multi-therapist practice.", salary: "£50k–£120k+" },
    { name: "EAP Therapist", description: "Provides short-term therapy through Employee Assistance Programmes.", salary: "£30k–£50k" },
    { name: "Executive Coach / Therapist", description: "Works at the intersection of coaching and therapy.", salary: "£60k–£150k+" },
  ]},
  { title: "Specialist Populations", icon: Brain, roles: [
    { name: "Child & Adolescent Therapist", description: "Works with young people using age-appropriate techniques.", salary: "£33k–£55k" },
    { name: "Addiction Therapist", description: "Specialises in substance misuse and behavioural addictions.", salary: "£30k–£50k" },
    { name: "Trauma Therapist", description: "Works with complex trauma and PTSD.", salary: "£37k–£60k" },
    { name: "Eating Disorder Therapist", description: "Provides specialist therapy for eating disorders.", salary: "£35k–£55k" },
    { name: "Forensic Psychotherapist", description: "Works with offenders in secure settings.", salary: "£50k–£75k" },
    { name: "Perinatal Therapist", description: "Supports mothers and families with perinatal mental health.", salary: "£33k–£50k" },
  ]},
  { title: "Supervision & Ethics", icon: Shield, roles: [
    { name: "Clinical Supervisor", description: "Provides ongoing supervision to therapists.", salary: "£45k–£70k" },
    { name: "Ethics Committee Member", description: "Reviews complaints and upholds standards.", salary: "Voluntary / £35k–£55k" },
    { name: "Safeguarding Lead", description: "Oversees safeguarding policies and procedures.", salary: "£35k–£50k" },
    { name: "Clinical Governance Lead", description: "Ensures clinical standards and quality improvement.", salary: "£45k–£60k" },
    { name: "BACP / UKCP Assessor", description: "Assesses therapist applications for accreditation.", salary: "£35k–£55k" },
  ]},
  { title: "Leadership & Research", icon: Crown, roles: [
    { name: "Head of Psychology", description: "Leads the psychology department within an NHS trust.", salary: "£62k–£85k" },
    { name: "Therapy Service Director", description: "Directs a large therapy organisation or charity.", salary: "£65k–£100k+" },
    { name: "Research Psychotherapist", description: "Conducts clinical research into therapy outcomes.", salary: "£35k–£60k" },
    { name: "Policy Adviser (Mental Health)", description: "Advises government or charities on mental health policy.", salary: "£40k–£65k" },
    { name: "University Lecturer", description: "Teaches psychotherapy at university level.", salary: "£38k–£60k" },
    { name: "Author / Thought Leader", description: "Writes books and delivers keynotes on therapy and mental health.", salary: "Variable" },
  ]},
];

const newsfeed = [
  { title: "BACP", url: "https://www.bacp.co.uk/news/" },
  { title: "Therapy Today", url: "https://www.bacp.co.uk/bacp-journals/therapy-today/" },
  { title: "The Psychologist (BPS)", url: "https://www.bps.org.uk/psychologist" },
];

const psychotherapyCompanies = [
  { name: "Tavistock & Portman NHS Trust", url: "https://tavistockandportman.nhs.uk", founded: "1920", hq: "London", glassdoor: 3.9, overview: "A world-renowned mental health trust.", valueChainStage: "Training & Education" },
  { name: "BACP", url: "https://www.bacp.co.uk", founded: "1977", hq: "Lutterworth", glassdoor: 3.5, overview: "The UK's largest professional body for therapists.", valueChainStage: "Professional Bodies" },
  { name: "NHS Talking Therapies", url: "https://www.jobs.nhs.uk", founded: "2008", hq: "Nationwide", glassdoor: 3.7, overview: "The world's largest publicly funded talking therapy programme.", valueChainStage: "NHS & Public Sector" },
  { name: "BetterHelp", url: "https://www.betterhelp.com/therapist/", founded: "2013", hq: "San Francisco", glassdoor: 3.8, trustpilot: 4.0, overview: "The world's largest online therapy platform.", valueChainStage: "Digital & Online" },
  { name: "Ieso Digital Health", url: "https://www.iesohealth.com", founded: "2000", hq: "Cambridge", glassdoor: 3.6, trustpilot: 4.2, overview: "An NHS-contracted digital therapy provider.", valueChainStage: "Digital & Online" },
];

const Psychotherapy = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the world of therapy.</p>
        <PodcastPlayer industry="psychotherapy" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Other People's Problems", description: "Therapist Hillary McBride takes listeners inside real therapy sessions.", url: "https://open.spotify.com/show/2TzjQgrXB9rx1nU1NDGJWS" },
            { title: "Therapist Uncensored", description: "Two therapists explore attachment, neuroscience, and clinical practice.", url: "https://therapistuncensored.com/" },
            { title: "Where Should We Begin? with Esther Perel", description: "World-renowned therapist counsels real couples.", url: "https://podcasts.apple.com/gb/podcast/where-should-we-begin-with-esther-perel/id1237931798" },
            { title: "The Psychology Podcast", description: "Scott Barry Kaufman explores the mind and human potential.", url: "https://open.spotify.com/show/2zHRbWCT8LvIeDBxyjcuhh" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="psychotherapy" />
        <LiveArticles industry="psychotherapy" fallbackArticles={[
          { title: "The NHS Talking Therapies Workforce Crisis", source: "BACP", url: "https://www.bacp.co.uk/news/news-from-bacp/" },
          { title: "Is Private Therapy Only for the Privileged?", source: "The Guardian", url: "https://www.theguardian.com/society/2024/jan/15/private-therapy-privilege-mental-health" },
          { title: "How to Become a Therapist in the UK: Routes Explained", source: "Therapy Today", url: "https://www.bacp.co.uk/bacp-journals/therapy-today/" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="psychotherapy" />
          <div className="mt-4"><BreakingNewsFeed industry="psychotherapy" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="psychotherapy" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["psychotherapy"] || []} /><div className="mt-12"><YouTubeChannels industry="psychotherapy" /><TikTokCreators industry="psychotherapy" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={psychotherapyCompanies} />
        <div className="mt-12"><DayInTheLife industry="psychotherapy" /></div>
        <div className="mt-12"><IndustryRolesLink industry="Psychotherapy" /></div>
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From trainee to thought leader - every role in the talking therapies value chain." stages={psychotherapyStages} industry="psychotherapy" />
        <ExploreFurther links={[
          { title: "BACP - Careers in Counselling", description: "The British Association for Counselling and Psychotherapy's guide to training, qualifications, and career paths.", url: "https://www.bacp.co.uk/careers/" },
          { title: "UKCP - Become a Psychotherapist", description: "The UK Council for Psychotherapy's resources on training routes and professional registration.", url: "https://www.psychotherapy.org.uk" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Psychotherapy" searchQuery="psychotherapy counselling conference UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Psychotherapy" slug="psychotherapy" />
          <CoursesSection industry="psychotherapy" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Jobs to get you thinking<span className="text-primary">…</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the psychotherapy industry.</p>
          <Link to="/marketplace?industry=Psychotherapy#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={psychotherapyStages} industry="Psychotherapy" companies={psychotherapyCompanies} />
        <IndustryCVBuilder industry="Psychotherapy" stages={psychotherapyStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Psychotherapy" description="From NHS talking therapies to private practice, trauma specialists to training institutes - the people helping us make sense of our minds." profile="The psychotherapy sector provides mental health support through a range of therapeutic approaches in both public and private settings. It employs approximately 80,000 to 120,000 practitioners across the UK. As demand for mental health services grows, the sector is becoming increasingly central to public health and wellbeing." tabs={tabs} />;
};

export default Psychotherapy;
