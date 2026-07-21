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
import { Landmark, GraduationCap, BookOpen, School, ClipboardCheck, Crown } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import teachingCareerMap from "@/assets/teaching-career-map.png";
import PodcastGrid from "@/components/PodcastGrid";

const teachingStages: CareerStage[] = [
  { title: "Policy & Governance", icon: Landmark, roles: [
    { name: "Policy Adviser", description: "Researches and develops education policy.", salary: "£32k–£55k" },
    { name: "Ofsted Inspector", description: "Inspects and evaluates schools against national standards.", salary: "£35k–£60k" },
    { name: "DfE Civil Servant", description: "Works within the Department for Education.", salary: "£28k–£55k" },
    { name: "School Governor", description: "Provides strategic oversight for a school.", salary: "Voluntary" },
    { name: "Trust Board Member", description: "Serves on the board of a multi-academy trust.", salary: "Voluntary" },
    { name: "Education Lobbyist", description: "Advocates for education policy changes.", salary: "£30k–£55k" },
    { name: "Research Analyst", description: "Conducts education research.", salary: "£28k–£45k" },
  ]},
  { title: "Training & CPD", icon: GraduationCap, roles: [
    { name: "ITT Provider", description: "Delivers initial teacher training programmes.", salary: "£35k–£55k" },
    { name: "PGCE Tutor", description: "Teaches and mentors trainee teachers.", salary: "£35k–£55k" },
    { name: "NQT Mentor", description: "Supports newly qualified teachers.", salary: "£30k–£45k" },
    { name: "CPD Coordinator", description: "Plans and delivers CPD programmes.", salary: "£30k–£48k" },
    { name: "Subject Lead Trainer", description: "Provides specialist training for teachers.", salary: "£32k–£50k" },
    { name: "Teaching School Hub Lead", description: "Leads a government-designated hub.", salary: "£40k–£60k" },
    { name: "ECF Mentor", description: "Mentors early career teachers.", salary: "£30k–£45k" },
  ]},
  { title: "Curriculum", icon: BookOpen, roles: [
    { name: "Curriculum Designer", description: "Creates structured curriculum plans.", salary: "£30k–£50k" },
    { name: "Subject Lead", description: "Leads teaching and strategy for a subject.", salary: "£32k–£48k" },
    { name: "Head of Department", description: "Manages a department's staff, budget, and results.", salary: "£38k–£55k" },
    { name: "Exam Board Author", description: "Writes exam papers and mark schemes.", salary: "£30k–£50k" },
    { name: "Textbook Editor", description: "Commissions and edits educational textbooks.", salary: "£28k–£45k" },
    { name: "EdTech Content Creator", description: "Designs digital learning content.", salary: "£28k–£48k" },
    { name: "Assessment Writer", description: "Creates assessment materials.", salary: "£28k–£45k" },
  ]},
  { title: "Classroom", icon: School, roles: [
    { name: "Classroom Teacher", description: "Plans and delivers lessons.", salary: "£30k–£46k" },
    { name: "Teaching Assistant", description: "Supports teachers in the classroom.", salary: "£18k–£25k" },
    { name: "SENCO", description: "Coordinates special educational needs provision.", salary: "£38k–£55k" },
    { name: "Cover Supervisor", description: "Supervises classes when teachers are absent.", salary: "£20k–£26k" },
    { name: "Tutor", description: "Provides one-to-one or small-group academic support.", salary: "£22k–£40k" },
    { name: "Learning Support Assistant", description: "Works with students with additional learning needs.", salary: "£18k–£24k" },
    { name: "Behaviour Mentor", description: "Supports students with behavioural challenges.", salary: "£22k–£30k" },
  ]},
  { title: "Assessment", icon: ClipboardCheck, roles: [
    { name: "Examiner", description: "Marks exam papers for national qualifications.", salary: "£25k–£40k" },
    { name: "Moderator", description: "Reviews and standardises marking across schools.", salary: "£28k–£42k" },
    { name: "Data Manager", description: "Manages and analyses school performance data.", salary: "£26k–£40k" },
    { name: "Assessment Coordinator", description: "Organises internal and external assessments.", salary: "£26k–£38k" },
    { name: "Progress Leader", description: "Tracks student progress across year groups.", salary: "£32k–£48k" },
    { name: "Head of Year", description: "Oversees pastoral care for a year group.", salary: "£35k–£50k" },
    { name: "Intervention Lead", description: "Designs targeted academic interventions.", salary: "£28k–£42k" },
  ]},
  { title: "Leadership", icon: Crown, roles: [
    { name: "Headteacher", description: "Leads the school.", salary: "£55k–£120k+" },
    { name: "Deputy Head", description: "Supports the headteacher.", salary: "£48k–£75k" },
    { name: "Assistant Head", description: "Takes responsibility for a specific area.", salary: "£42k–£65k" },
    { name: "MAT CEO", description: "Leads a multi-academy trust.", salary: "£80k–£200k+" },
    { name: "Executive Headteacher", description: "Leads two or more schools.", salary: "£65k–£130k" },
    { name: "Business Manager", description: "Manages the school's finances and operations.", salary: "£35k–£55k" },
    { name: "School Improvement Officer", description: "Works with schools to raise standards.", salary: "£45k–£70k" },
  ]},
];

const newsfeed = [
  { title: "TES", url: "https://www.tes.com/magazine" },
  { title: "Schools Week", url: "https://schoolsweek.co.uk" },
  { title: "Education Guardian", url: "https://www.theguardian.com/education" },
];

const teachingCompanies = [
  { name: "Teach First", url: "https://www.teachfirst.org.uk/careers", founded: "2002", hq: "London", glassdoor: 3.8, trustpilot: 3.6, profileUrl: "/company/teach-first", overview: "A charity recruiting graduates into teaching.", valueChainStage: "Training & Recruitment" },
  { name: "Pearson", url: "https://www.pearson.com/en-gb/careers.html", founded: "1844", hq: "London", glassdoor: 3.7, overview: "The world's largest education company.", valueChainStage: "Curriculum & Resources" },
  { name: "TES", url: "https://www.tes.com/jobs", founded: "1910", hq: "London", glassdoor: 3.5, overview: "The UK's largest teacher recruitment platform.", valueChainStage: "Training & Recruitment" },
  { name: "Oak National Academy", url: "https://www.thenational.academy", founded: "2020", hq: "London", glassdoor: 4.0, trustpilot: 4.1, overview: "Produces free, openly licensed curriculum resources.", valueChainStage: "Curriculum & Resources" },
  { name: "Ark Schools", url: "https://arkonline.org/careers", founded: "2004", hq: "London", glassdoor: 3.5, trustpilot: 3.2, overview: "A multi-academy trust running 39 schools.", valueChainStage: "School Leadership" },
  { name: "United Learning", url: "https://www.unitedlearning.org.uk/careers", founded: "2006", hq: "London", glassdoor: 3.4, overview: "One of the UK's largest multi-academy trusts.", valueChainStage: "School Leadership" },
];

const Teaching = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business of education.</p>
        <PodcastPlayer industry="teaching" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Teacher Talk Radio", description: "Conversations with educators, heads, and policymakers.", url: "https://teachertalkradio.com/" },
            { title: "The TES Podcast", description: "Weekly education news and teacher stories.", url: "https://www.tes.com/magazine/podcast" },
            { title: "Mr Barton Maths Podcast", description: "Deep dives into teaching, learning, and cognitive science.", url: "https://www.mrbartonmaths.com/podcast/" },
            { title: "The Education Research Reading Room", description: "Unpacking education research for the classroom.", url: "https://www.ollielovell.com/errr/" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="teaching" />
        <LiveArticles industry="teaching" fallbackArticles={[
          { title: "Why Are So Many Teachers Leaving the Profession?", source: "TES", url: "https://www.tes.com/magazine/analysis/general/teacher-retention-crisis-why-teachers-leaving" },
          { title: "The Teacher Recruitment Crisis in Numbers", source: "Schools Week", url: "https://schoolsweek.co.uk/" },
          { title: "How EdTech Is Reshaping the Classroom", source: "The Guardian", url: "https://www.theguardian.com/education" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="teaching" />
          <div className="mt-4"><BreakingNewsFeed industry="teaching" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="teaching" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["teaching"] || []} /><div className="mt-12"><YouTubeChannels industry="teaching" /><TikTokCreators industry="teaching" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={teachingCompanies} />
        <div className="mt-12"><DayInTheLife industry="teaching" /></div>
        <div className="mt-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Infographics<span className="text-primary">.</span></h2>
          <img src={teachingCareerMap} alt="The Teaching Value Chain" className="w-full rounded-sm" loading="lazy" />
        </div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From policy to the classroom - every role in the education value chain." stages={teachingStages} industry="teaching" />
          <div className="mt-12"><IndustryRolesLink industry="Teaching" /></div>
        <ExploreFurther links={[
          { title: "Get Into Teaching", description: "The Department for Education's official guide to becoming a teacher - routes, funding, and application support.", url: "https://getintoteaching.education.gov.uk" },
          { title: "Teach First - Career Changers", description: "A leading charity placing graduates and career changers into schools serving low-income communities.", url: "https://www.teachfirst.org.uk" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Teaching" searchQuery="education teaching" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Teaching" slug="teaching" />
          <CoursesSection industry="teaching" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Top of the class jobs<span className="text-primary">…</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the teaching industry.</p>
          <Link to="/marketplace?industry=Teaching#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={teachingStages} industry="Teaching" companies={teachingCompanies} />
        <IndustryCVBuilder industry="Teaching" stages={teachingStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Teaching" description="From classrooms to curricula, teacher training to EdTech - the people and systems shaping how we learn." profile="The teaching profession spans primary, secondary, and further education, shaping how knowledge is delivered across the population. In the UK, it employs around 1 to 1.5 million people across schools, colleges, and educational institutions. It plays a foundational role in economic development, social mobility, and lifelong learning." tabs={tabs} />;
};

export default Teaching;
