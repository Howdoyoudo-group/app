import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import Footer from "@/components/Footer";
import learningStartups from "@/assets/learning-startups.png";
import learningEmployability from "@/assets/learning-employability.png";
import learningMoney from "@/assets/learning-money.png";
import learningCareers from "@/assets/learning-careers.png";
import learningApprenticeships from "@/assets/learning-apprenticeships.png";
import learningEducation from "@/assets/learning-education.png";
import learningMentoring from "@/assets/learning-mentoring.png";
import learningCv from "@/assets/learning-cv.png";
import learningInterview from "@/assets/learning-interview.png";
import learningInternship from "@/assets/learning-internship.png";
import learningWorkExperience from "@/assets/learning-work-experience.png";
import learningUniversity from "@/assets/learning-university.png";
import learningSocialMobility from "@/assets/learning-social-mobility.png";
import learningIndustry from "@/assets/learning-industry.png";
import { INDUSTRIES as ALL_INDUSTRIES } from "@/data/industries";

// Doodle CTA pill - matches homepage Hero buttons
const DoodlePill = ({ children }: { children: React.ReactNode }) => (
  <span className="relative inline-flex items-center">
    <svg
      viewBox="0 0 200 56"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M10,4 C5,6 3,12 3,20 C3,28 2,38 4,46 C6,52 12,54 24,54 L176,54 C188,54 195,52 197,46 C199,38 198,28 197,20 C196,12 198,6 192,3 C186,1 178,2 170,2 L30,2 C18,3 14,2 10,4 Z"
        fill="hsl(120, 100%, 45%)"
        className="stroke-foreground"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    <span className="relative font-display font-600 text-xs md:text-sm tracking-wide uppercase text-primary-foreground px-5 py-3 whitespace-nowrap">
      {children}
    </span>
  </span>
);

interface Resource {
  name: string;
  description: string;
  url: string;
  tags: string[];
}

interface Category {
  title: string;
  icon: React.ReactNode;
  slug: string;
  resources: Resource[];
}

const industries = ALL_INDUSTRIES.map((i) => ({
  name: i.name,
  path: `/${i.slug}#courses`,
}));

const categories: Category[] = [
  {
    title: "Business & Startups",
    icon: <img src={learningStartups} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "startups",
    resources: [
      {
        name: "The King's Trust",
        description: "Helps young people start businesses, gain skills, and find jobs through mentoring, funding, and enterprise programmes.",
        url: "https://www.kingstrust.org.uk",
        tags: ["Employability", "Startup"],
      },
      {
        name: "Young Enterprise",
        description: "The UK's leading enterprise and financial education charity, running programmes in schools and colleges.",
        url: "https://www.young-enterprise.org.uk",
        tags: ["Startup", "Education"],
      },
      {
        name: "Virgin StartUp",
        description: "Free 1-to-1 business advice, mentoring and government-backed Start Up Loans for UK founders.",
        url: "https://www.virginstartup.org",
        tags: ["Startup", "Funding"],
      },
      {
        name: "Tycoon in Schools",
        description: "Gives students real money to start and run a business, building entrepreneurial confidence.",
        url: "https://www.tycooninschools.com",
        tags: ["Startup", "Schools"],
      },
      {
        name: "Launch It",
        description: "Helps young people build and grow real businesses with structured support and mentoring.",
        url: "https://www.launchit.org.uk",
        tags: ["Startup"],
      },
      {
        name: "Founders4Schools",
        description: "Connects schools with local business leaders for workplace visits and career inspiration.",
        url: "https://www.founders4schools.org.uk",
        tags: ["Startup", "Schools"],
      },
      {
        name: "Enterprise Nation",
        description: "The UK's leading small business community - advice, events, and support for founders starting and growing a business.",
        url: "https://www.enterprisenation.com/",
        tags: ["Startup", "Community"],
      },
    ],
  },
  {
    title: "Employability",
    icon: <img src={learningEmployability} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "employability",
    resources: [
      {
        name: "UK Youth",
        description: "Programmes focused on confidence, work skills, and opportunities for young people across the UK.",
        url: "https://www.ukyouth.org",
        tags: ["Employability", "Skills"],
      },
      {
        name: "The Careers & Enterprise Company",
        description: "Works with schools and colleges to link young people with employers and improve careers provision.",
        url: "https://www.careersandenterprise.co.uk",
        tags: ["Employability", "Schools"],
      },
      {
        name: "Movement to Work",
        description: "A coalition of UK employers offering work placements and opportunities to young people not in work or education.",
        url: "https://www.movementtowork.com",
        tags: ["Employability", "Placements"],
      },
      {
        name: "Barclays LifeSkills",
        description: "Free employability resources, tools, and experiences to help young people prepare for the workplace.",
        url: "https://barclayslifeskills.com",
        tags: ["Employability", "Skills"],
      },
      {
        name: "Speakers for Schools",
        description: "Provides free talks from top professionals and work experience placements to state school students.",
        url: "https://www.speakersforschools.org",
        tags: ["Employability", "Work Experience"],
      },
    ],
  },
  {
    title: "Internships & Graduates",
    icon: <img src={learningInternship} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "internships-graduates",
    resources: [
      {
        name: "Higherin",
        description: "UK platform for internships, placements, graduate schemes, and apprenticeships - search thousands of entry-level opportunities across every sector.",
        url: "https://higherin.com/search-jobs/internships",
        tags: ["Internships", "Graduate", "Apprenticeships"],
      },
      {
        name: "Bright Network",
        description: "The UK's leading graduate and internship network - browse thousands of internships, insight days, and placements across every industry.",
        url: "https://www.brightnetwork.co.uk/internships/",
        tags: ["Internships", "Graduate"],
      },
      {
        name: "Milkround",
        description: "One of the UK's longest-running graduate job boards - graduate schemes, internships, placements and entry-level roles across every sector.",
        url: "https://www.milkround.com/jobs/graduate-scheme",
        tags: ["Internships", "Graduate"],
      },
      {
        name: "The Trackr",
        description: "Live-tracked internships, spring weeks, training contracts and graduate schemes across UK Finance, Technology, Law, plus NA and EU Finance - opening and closing dates updated daily.",
        url: "https://the-trackr.com/trackers/",
        tags: ["Internships", "Graduate", "Finance", "Law", "Tech"],
      },
      {
        name: "My First Job in Film",
        description: "The UK's leading entry-level jobs board for the film, TV and broadcast industry - runner roles, trainee placements and assistant jobs across production companies and studios.",
        url: "https://myfirstjobinfilm.com/UK",
        tags: ["Film & TV", "Entry-level", "Production"],
      },
    ],
  },
  {
    title: "Work Experience",
    icon: <img src={learningWorkExperience} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "work-experience",
    resources: [
      {
        name: "Springpod",
        description: "Free virtual work experience programmes with top UK employers - explore careers, build skills, and earn certificates from real companies.",
        url: "https://www.springpod.com/opportunities?internalId=OP-00043",
        tags: ["Work Experience", "Virtual", "Free"],
      },
      {
        name: "Speakers for Schools",
        description: "Free in-person and virtual work experience placements with leading UK employers - exclusively for state school students aged 14–19.",
        url: "https://www.speakersforschools.org/work-experience/",
        tags: ["Work Experience", "State Schools", "Free"],
      },
      {
        name: "Forage",
        description: "Free virtual job simulations from global firms (BCG, JPMorgan, Accenture) - complete real tasks and add credentials to your CV.",
        url: "https://www.theforage.com",
        tags: ["Work Experience", "Virtual", "Free"],
      },
      {
        name: "InvestIN",
        description: "Immersive career experience programmes for ages 12–18 across medicine, law, finance, film, fashion and more, run by industry professionals.",
        url: "https://investin.org",
        tags: ["Work Experience", "Paid", "Career Insight"],
      },
      {
        name: "Career Ready",
        description: "Pairs young people with mentors from top employers and delivers paid four-week internships across the UK.",
        url: "https://careerready.org.uk",
        tags: ["Work Experience", "Mentoring", "Paid Internship"],
      },
      {
        name: "Workfinder (Founders4Schools)",
        description: "Connects 14–24 year-olds with short, paid work experience placements at fast-growing UK companies.",
        url: "https://www.workfinder.com",
        tags: ["Work Experience", "Paid", "Startup"],
      },
      {
        name: "Nuffield Research Placements",
        description: "Free fully-funded summer research placements for Year 12 students in STEM with universities, research institutes and companies.",
        url: "https://www.nuffieldresearchplacements.org",
        tags: ["Work Experience", "STEM", "Free"],
      },
      {
        name: "Social Mobility Foundation",
        description: "Free Aspiring Professionals Programme offering internships, mentoring and university support for high-achieving students from low-income backgrounds.",
        url: "https://www.socialmobility.org.uk",
        tags: ["Work Experience", "Social Mobility", "Free"],
      },
    ],
  },
  {
    title: "Money & Financial Skills",
    icon: <img src={learningMoney} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "money",
    resources: [
      {
        name: "MyBnk",
        description: "Teaches financial literacy, budgeting, and money confidence to young people through workshops in schools.",
        url: "https://mybnk.org",
        tags: ["Finance", "Education"],
      },
      {
        name: "MoneyHelper (MaPS)",
        description: "Government-backed free and impartial money guidance - budgeting, saving, pensions, and more.",
        url: "https://www.moneyhelper.org.uk",
        tags: ["Finance", "Guidance"],
      },
      {
        name: "Young Money",
        description: "Part of Young Enterprise - delivers financial education programmes and teacher resources across UK schools.",
        url: "https://www.young-money.org.uk",
        tags: ["Finance", "Schools"],
      },
      {
        name: "LIBF Financial Education",
        description: "Professional qualifications and learning in personal finance and financial capability for students.",
        url: "https://www.libf.ac.uk/study/financial-education",
        tags: ["Finance", "Qualifications"],
      },
    ],
  },
  {
    title: "Careers Advice",
    icon: <img src={learningCareers} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "careers",
    resources: [
      {
        name: "National Careers Service",
        description: "Government service offering free careers information, advice, and guidance for adults and young people in England.",
        url: "https://nationalcareers.service.gov.uk",
        tags: ["Careers", "Government"],
      },
      {
        name: "Prospects",
        description: "Graduate careers advice - job profiles, postgraduate courses, and career planning tools.",
        url: "https://www.prospects.ac.uk",
        tags: ["Careers", "Graduate"],
      },
      {
        name: "UCAS Career Finder",
        description: "Explore careers, find out what qualifications you need, and discover pathways into different industries.",
        url: "https://www.ucas.com/explore",
        tags: ["Careers", "Education"],
      },
      {
        name: "icould (now part of Careerpilot)",
        description: "Career videos and information helping young people explore jobs and career routes.",
        url: "https://www.careerpilot.org.uk",
        tags: ["Careers", "Exploration"],
      },
      {
        name: "BBC Bitesize Careers",
        description: "Free UK careers library from the BBC - hundreds of 'a day in the life' videos, job profiles by subject, and guides to apprenticeships, university and the world of work.",
        url: "https://www.bbc.co.uk/bitesize/careers",
        tags: ["Careers", "Free", "Videos"],
      },
      {
        name: "Success at School",
        description: "Career advice, employer profiles, and guidance on apprenticeships, university, and gap years.",
        url: "https://successatschool.org",
        tags: ["Careers", "Schools"],
      },
      {
        name: "AllAboutCareers",
        description: "Graduate and school leaver career advice, job listings, and sector guides.",
        url: "https://www.allaboutcareers.com",
        tags: ["Careers", "Graduate"],
      },
    ],
  },
  {
    title: "Apprenticeships",
    icon: <img src={learningApprenticeships} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "apprenticeships",
    resources: [
      {
        name: "Find an Apprenticeship (Gov.uk)",
        description: "The official government service to search and apply for apprenticeship vacancies across England.",
        url: "https://www.findapprenticeship.service.gov.uk",
        tags: ["Apprenticeships", "Government"],
      },
      {
        name: "Amazing Apprenticeships",
        description: "Resources, vacancy snapshots, and guides for parents, students, and teachers on apprenticeships at every level.",
        url: "https://amazingapprenticeships.com",
        tags: ["Apprenticeships", "Resources"],
      },
      {
        name: "Not Going to Uni",
        description: "Alternatives to university including apprenticeships, sponsored degrees, school leaver programmes, and gap years.",
        url: "https://www.notgoingtouni.co.uk",
        tags: ["Apprenticeships", "Alternatives"],
      },
      {
        name: "UCAS Apprenticeships",
        description: "Search apprenticeship opportunities alongside university options - compare routes and entry requirements.",
        url: "https://www.ucas.com/apprenticeships",
        tags: ["Apprenticeships", "Comparison"],
      },
      {
        name: "GetMyFirstJob",
        description: "Apprenticeship and school leaver job listings with employer profiles and application support.",
        url: "https://www.getmyfirstjob.co.uk",
        tags: ["Apprenticeships", "Jobs"],
      },
      {
        name: "Rate My Apprenticeship",
        description: "Reviews and ratings of apprenticeship employers written by real apprentices - find out what it's really like.",
        url: "https://www.ratemyapprenticeship.co.uk",
        tags: ["Apprenticeships", "Reviews"],
      },
      {
        name: "Institute for Apprenticeships & Technical Education",
        description: "The body responsible for apprenticeship standards - explore all approved standards by sector and level.",
        url: "https://www.instituteforapprenticeships.org",
        tags: ["Apprenticeships", "Standards"],
      },
      {
        name: "Apprenticeship Guide",
        description: "Independent advice on apprenticeship levels, pay, applications, and what to expect from your first day.",
        url: "https://www.apprenticeshipguide.co.uk",
        tags: ["Apprenticeships", "Guidance"],
      },
    ],
  },
  {
    title: "Profile Builder",
    icon: <img src={learningCv} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "cv-builder",
    resources: [
      {
        name: "How do you do? Profile Builder",
        description: "Build a tailored, industry-specific CV using our AI-powered Profile Builder - pick your industry, your stage, and get a polished CV ready to send.",
        url: "/cv-builder",
        tags: ["CV", "Tool", "Free"],
      },
      {
        name: "Save the Student - CV Tips",
        description: "Student-friendly CV writing advice with templates, examples, and what UK employers actually look for.",
        url: "https://www.savethestudent.org/jobs/how-to-write-a-cv.html",
        tags: ["CV", "Students"],
      },
      {
        name: "Vizzy",
        description: "Free visual CV builder - turn your CV into a beautiful, modern, designer-quality document with smart templates and instant exports.",
        url: "https://vizzy.com/",
        tags: ["CV", "Design", "Free"],
      },
    ],
  },
  {
    title: "Interview Skills",
    icon: <img src={learningInterview} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "interview-skills",
    resources: [
      {
        name: "National Careers Service - Interview Advice",
        description: "Free official guidance on preparing for interviews, common questions, body language, and what to wear.",
        url: "https://nationalcareers.service.gov.uk/careers-advice/interview-advice",
        tags: ["Interviews", "Government"],
      },
      {
        name: "Prospects - Interview Tips",
        description: "Comprehensive interview prep for graduates - competency questions, video interviews, assessment centres, and follow-ups.",
        url: "https://www.prospects.ac.uk/careers-advice/interview-tips",
        tags: ["Interviews", "Graduate"],
      },
      {
        name: "Reed - Interview Techniques",
        description: "Hub of UK-focused interview guides covering preparation, questions to ask, follow-ups, telephone/video interviews and competency-based formats.",
        url: "https://www.reed.co.uk/career-advice/interview-techniques/",
        tags: ["Interviews", "Examples"],
      },
      {
        name: "Indeed Career Guide - Interviews",
        description: "Practical interview prep articles, STAR method walkthroughs, and post-interview thank-you templates.",
        url: "https://uk.indeed.com/career-advice/interviewing",
        tags: ["Interviews", "STAR"],
      },
      {
        name: "Big Interview",
        description: "Practice interviews on video with AI feedback and curriculum-style training across hundreds of industries.",
        url: "https://biginterview.com",
        tags: ["Interviews", "Practice", "AI"],
      },
    ],
  },
  {
    title: "Mentoring",
    icon: <img src={learningMentoring} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "mentoring",
    resources: [
      {
        name: "Career Ready",
        description: "Connects young people aged 15–18 with professional mentors for 1-to-1 career guidance and workplace visits.",
        url: "https://careerready.org.uk/mentoring/",
        tags: ["Mentoring", "Schools"],
      },
      {
        name: "The Diana Award Mentoring",
        description: "Professional mentoring programme supporting young people at risk of becoming NEET, with structured 12-week cycles.",
        url: "https://diana-award.org.uk/our-programmes-and-initiatives/mentoring/become-a-mentor",
        tags: ["Mentoring", "Youth"],
      },
      {
        name: "Power2 Aspire",
        description: "1-to-1 mentoring for over-18s in further or higher education, focused on wellbeing, independence, and employability.",
        url: "https://www.power2.org/aspire",
        tags: ["Mentoring", "Students"],
      },
      {
        name: "Future First",
        description: "Connects students with alumni mentors from their own school for relatable career guidance and online mentoring.",
        url: "https://futurefirst.org.uk/",
        tags: ["Mentoring", "Alumni"],
      },
      {
        name: "STEM Mentoring",
        description: "Free online mentoring connecting students with STEM professionals to explore science, tech, and engineering careers.",
        url: "https://www.stem.org.uk/secondary/careers/mentoring",
        tags: ["Mentoring", "STEM"],
      },
      {
        name: "The Spear Programme",
        description: "Intensive coaching and mentoring programme for 16–24 year-olds, one of the UK's most effective youth employment schemes.",
        url: "https://www.spear.org.uk/spear-programme/",
        tags: ["Mentoring", "Employment"],
      },
      {
        name: "MentorsMe",
        description: "Free mentoring matching service connecting entrepreneurs and small business owners with experienced mentors.",
        url: "https://www.mentorsme.co.uk",
        tags: ["Mentoring", "Business"],
      },
      {
        name: "Smart Works",
        description: "Free interview coaching, styling and ongoing 1:1 mentoring for unemployed women preparing for job interviews.",
        url: "https://smartworks.org.uk",
        tags: ["Mentoring", "Women"],
      },
    ],
  },
  {
    title: "Online Courses",
    icon: <img src={learningEducation} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "online-courses",
    resources: [
      {
        name: "Coursera",
        description: "Courses, professional certificates and degrees from 350+ universities and companies including Google, IBM, Meta and Yale. Many free to audit.",
        url: "https://www.coursera.org",
        tags: ["Free option", "Certificates"],
      },
      {
        name: "The Open University",
        description: "The UK's largest university - flexible distance-learning degrees and free OpenLearn courses you can fit around work.",
        url: "https://www.open.ac.uk",
        tags: ["UK", "Degrees"],
      },
      {
        name: "learndirect",
        description: "UK online provider offering A Levels, GCSEs, Access to HE diplomas and CPD-accredited career courses you can study from home.",
        url: "https://www.learndirect.com",
        tags: ["UK", "A Levels", "CPD"],
      },
      {
        name: "FutureLearn",
        description: "UK-based platform with free and paid courses, ExpertTracks and online degrees from top universities and organisations.",
        url: "https://www.futurelearn.com",
        tags: ["UK", "Free option"],
      },
      {
        name: "edX",
        description: "Free and paid online courses, MicroMasters and professional certificates from Harvard, MIT, Berkeley and 250+ institutions.",
        url: "https://www.edx.org",
        tags: ["Free option"],
      },
      {
        name: "Udemy",
        description: "Huge marketplace of practical, skills-based courses across tech, design, business and marketing - often heavily discounted.",
        url: "https://www.udemy.com",
        tags: ["Skills"],
      },
      {
        name: "Khan Academy",
        description: "Completely free world-class lessons in maths, science, economics, computing and more - for any age.",
        url: "https://www.khanacademy.org",
        tags: ["Free"],
      },
      {
        name: "Google Career Certificates",
        description: "Industry-recognised entry-level certificates in IT support, data analytics, UX design, project management and cybersecurity.",
        url: "https://grow.google/intl/uk/certificates/",
        tags: ["Career", "Free option"],
      },
    ],
  },
  {
    title: "Further Education & University",
    icon: <img src={learningUniversity} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "education",
    resources: [
      {
        name: "UCAS",
        description: "The central hub for applying to UK universities and colleges - courses, clearing, and personal statements.",
        url: "https://www.ucas.com",
        tags: ["University", "Applications"],
      },
      {
        name: "The Student Room",
        description: "The UK's largest student community - advice on courses, unis, revision, and student life.",
        url: "https://www.thestudentroom.co.uk",
        tags: ["University", "Community"],
      },
      {
        name: "Not Going to Uni",
        description: "Alternatives to university - apprenticeships, gap years, sponsored degrees, and school leaver programmes.",
        url: "https://www.notgoingtouni.co.uk",
        tags: ["Apprenticeships", "Alternatives"],
      },
      {
        name: "Amazing Apprenticeships",
        description: "Resources and vacancies for apprenticeships across all sectors and levels.",
        url: "https://amazingapprenticeships.com",
        tags: ["Apprenticeships", "Training"],
      },
      {
        name: "Open University",
        description: "Flexible distance learning - undergraduate and postgraduate courses you can study around work.",
        url: "https://www.open.ac.uk",
        tags: ["University", "Flexible Learning"],
      },
      {
        name: "FutureLearn",
        description: "Free and paid online courses from top UK and international universities and organisations.",
        url: "https://www.futurelearn.com",
        tags: ["Online Learning", "Courses"],
      },
    ],
  },
  {
    title: "Social Mobility",
    icon: <img src={learningSocialMobility} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "social-mobility",
    resources: [
      {
        name: "upReach",
        description: "Free intensive support for undergraduates from less-advantaged backgrounds - coaching, mentoring and employer access to land top graduate jobs.",
        url: "https://upreach.org.uk/",
        tags: ["Undergraduates", "Free"],
      },
      {
        name: "Making The Leap",
        description: "London-based social mobility charity running employability programmes, mentoring and youth-focused work for under-represented young people.",
        url: "https://makingtheleap.org.uk/about-us/",
        tags: ["Youth", "London"],
      },
      {
        name: "Career Ready",
        description: "Two-year programme of mentoring, masterclasses and paid internships for 16–18 year-olds in state schools and colleges.",
        url: "https://careerready.org.uk/",
        tags: ["Schools", "Mentoring"],
      },
      {
        name: "The Sutton Trust",
        description: "Programmes including UK Summer Schools and Pathways for top universities and professions.",
        url: "https://www.suttontrust.com/our-programmes/",
        tags: ["University", "Free"],
      },
      {
        name: "Social Mobility Foundation",
        description: "Aspiring Professionals Programme - mentoring, internships and skills sessions for high-achieving Year 12s from low-income homes.",
        url: "https://www.socialmobility.org.uk",
        tags: ["Sixth Form", "Internships"],
      },
    ],
  },
  {
    title: "CV Tips",
    icon: <img src={learningCv} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "cv-tips",
    resources: [
      { name: "National Careers Service CV builder", description: "Free UK government CV templates and builder.", url: "https://nationalcareers.service.gov.uk/get-a-job/cv-sections", tags: ["Free", "UK"] },
      { name: "TotalJobs CV Guide", description: "UK's most comprehensive CV writing guide.", url: "https://www.totaljobs.com/advice/cv-advice", tags: ["Guide"] },
    ],
  },
  {
    title: "Volunteering",
    icon: <img src={learningMentoring} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "volunteering",
    resources: [
      { name: "Do IT", description: "The UK's largest volunteering platform.", url: "https://doit.life/volunteer", tags: ["Find roles", "UK"] },
      { name: "CharityJob - Volunteer roles", description: "Search hundreds of UK volunteer opportunities.", url: "https://www.charityjob.co.uk/volunteer-jobs", tags: ["UK"] },
    ],
  },
  {
    title: "Resilience & Confidence",
    icon: <img src={learningEmployability} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />,
    slug: "resilience-confidence",
    resources: [
      { name: "Mind", description: "UK mental health charity offering advice and support.", url: "https://www.mind.org.uk", tags: ["Mental health", "UK"] },
      { name: "Young Minds", description: "The UK's leading charity fighting for young people's mental health.", url: "https://www.youngminds.org.uk", tags: ["Young people", "UK"] },
    ],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

const Learning = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Learning Hub - Courses & Resources"
        description="Explore curated courses, degrees and learning resources to build your career across 30+ industries."
        path="/learning"
      />
      {/* Hero */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <p className="text-primary text-xs tracking-[0.3em] uppercase font-body">
                Learning Hub
              </p>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-900 leading-[0.9] tracking-tight mb-6">
              Learning Hub<span className="text-primary">.</span>
            </h1>
            <p className="font-display text-xl md:text-2xl font-700 leading-snug max-w-3xl mb-4">
              From finding your direction to landing the job — everything you need in one place.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["✅ ATS CV builder", "✅ Interview practice", "✅ Find a mentor", "✅ Confidence & resilience", "✅ Skills passport"].map(item => (
                <span key={item} className="text-sm font-body font-600 bg-primary/10 px-3 py-1 rounded-full">{item}</span>
              ))}
            </div>
            <p className="text-muted-foreground font-body text-sm md:text-base max-w-2xl italic">
              School skips it, parents guess at it, the internet shouts at you. We did the digging — every square below has curated videos, podcasts, articles and organisations. Most of it free, all of it UK.
            </p>
          </motion.div>

          {/* Section Nav - doodle squares linking to per-topic pages */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/resources/${cat.slug}`}
                className="group relative aspect-square border-2 border-foreground bg-background p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-primary hover:-translate-y-0.5 transition-all"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center [&_img]:w-full [&_img]:h-full">
                  {cat.icon}
                </div>
                <span className="font-display font-700 text-[11px] md:text-xs leading-tight tracking-tight text-foreground">
                  {cat.title}
                </span>
              </Link>
            ))}
            <a
              href="#industry"
              className="group relative aspect-square border-2 border-foreground bg-background p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-primary hover:-translate-y-0.5 transition-all"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center [&_img]:w-full [&_img]:h-full">
                <img src={learningIndustry} alt="" style={{ filter: "brightness(0)" }} />
              </div>
              <span className="font-display font-700 text-[11px] md:text-xs leading-tight tracking-tight text-foreground">
                Industry Learning
              </span>
            </a>
          </div>

          <p className="text-muted-foreground font-body text-xs md:text-sm mt-6">
            Tap a square to see what to <span className="font-700 text-foreground">watch</span>, <span className="font-700 text-foreground">listen</span>, <span className="font-700 text-foreground">read</span> and the <span className="font-700 text-foreground">organisations</span> to know.
          </p>
        </div>
      </section>

      {/* Industry-Specific Learning */}
      <section id="industry" className="py-12 md:py-16 px-6 md:px-12 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-3 mb-6">
              <img src={learningEducation} alt="" className="w-7 h-7" style={{ filter: "brightness(0)" }} />
              <h2 className="font-display text-2xl md:text-3xl font-900 tracking-tight">
                Industry-Specific Learning<span className="text-primary">.</span>
              </h2>
            </div>
            <p className="text-muted-foreground font-body text-sm mb-8 max-w-xl">
              Curated courses from top universities, industry bodies, and learning platforms for each industry we cover.
            </p>
          </motion.div>

          <div className="space-y-1">
            {industries.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.02 * i, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={ind.path}
                  className="group flex items-center justify-between p-4 border border-border hover:bg-muted/30 transition-colors"
                >
                  <span className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors">
                    {ind.name}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Learning;
