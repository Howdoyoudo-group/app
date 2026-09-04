import learningStartups from "@/assets/learning-startups.png";
import learningEmployability from "@/assets/learning-employability.png";
import learningMoney from "@/assets/learning-money.png";
import learningCareers from "@/assets/learning-careers.png";
import learningApprenticeships from "@/assets/learning-apprenticeships.png";
import learningEducation from "@/assets/learning-education.png";
import learningMentoring from "@/assets/learning-mentoring.png";

export interface ResourceLink {
  name: string;
  description: string;
  url: string;
  tags?: string[];
}

export interface ResourceTopic {
  slug: string;
  title: string;
  description: string;
  icon: string;
  watch: ResourceLink[];
  listen: ResourceLink[];
  read: ResourceLink[];
  help: ResourceLink[];
}

export const RESOURCE_TOPICS: ResourceTopic[] = [
  {
    slug: "startups",
    title: "Business & Startups",
    description: "Build your own thing - from your first idea to your first customer. UK-focused founder support, funding routes, and the people who'll back you.",
    icon: learningStartups,
    watch: [
      { name: "Steven Bartlett - The Diary Of A CEO (YouTube)", description: "Long-form interviews with founders, operators and investors. Practical and honest.", url: "https://www.youtube.com/@TheDiaryOfACEO" },
      { name: "Y Combinator - Startup School", description: "Free video curriculum from the world's most influential startup accelerator.", url: "https://www.youtube.com/@ycombinator" },
      { name: "BBC - Dragons' Den", description: "UK founders pitching real businesses to investors. Watch what makes a deal.", url: "https://www.bbc.co.uk/iplayer/episodes/b006vq92/dragons-den" },
    ],
    listen: [
      { name: "Secret Leaders", description: "UK podcast interviewing the founders behind brands like BrewDog, Innocent and Charlotte Tilbury.", url: "https://open.spotify.com/show/5Y5DkynP8m1jpnXH5IaG6r" },
      { name: "How I Built This (NPR)", description: "Founders telling the story of how their business actually got off the ground.", url: "https://open.spotify.com/show/6E709HRH7XaiZrMfgtNCun" },
      { name: "The Tim Ferriss Show", description: "Deep dives with operators, investors and creators on tactics, tools and habits.", url: "https://open.spotify.com/show/5qSUyCrk9KR69lEiXbjwXM" },
    ],
    read: [
      { name: "Sifted", description: "European startup news from the FT - funding, hiring, scaling.", url: "https://sifted.eu" },
      { name: "UKTN (UK Tech News)", description: "Daily UK tech and startup coverage.", url: "https://www.uktech.news" },
      { name: "Paul Graham essays", description: "The clearest writing on startups, ever. Required reading.", url: "https://paulgraham.com/articles.html" },
    ],
    help: [
      { name: "The King's Trust - Start a business", description: "Free training, mentoring and funding for 18–30s starting their own business.", url: "https://www.kingstrust.org.uk/how-we-can-help/support-starting-business", tags: ["Funding", "Mentoring"] },
      { name: "Young Enterprise", description: "The UK's leading enterprise and financial education charity.", url: "https://www.young-enterprise.org.uk", tags: ["Schools"] },
      { name: "Virgin StartUp", description: "Free 1-to-1 business advice, mentoring and government-backed Start Up Loans for UK founders.", url: "https://www.virginstartup.org", tags: ["Funding", "Mentoring"] },
      { name: "Launch It", description: "Helps young people build and grow real businesses.", url: "https://www.launchit.org.uk", tags: ["Mentoring"] },
      { name: "Founders4Schools", description: "Connects schools with local business leaders.", url: "https://www.founders4schools.org.uk", tags: ["Schools"] },
      { name: "Enterprise Nation", description: "The UK's leading small business community.", url: "https://www.enterprisenation.com/", tags: ["Community"] },
      { name: "Tycoon in Schools", description: "Real money to start and run a business at school.", url: "https://www.tycooninschools.com", tags: ["Schools"] },
    ],
  },
  {
    slug: "employability",
    title: "Employability",
    description: "Start with the basics - confidence, talking to people, presenting yourself, and handling interviews. The foundations that get you hired and help you grow.",
    icon: learningEmployability,
    watch: [
      { name: "Julian Treasure - How to speak so people listen", description: "TED talk on voice, tone and being heard.", url: "https://www.youtube.com/watch?v=eIho2S0ZahI" },
      { name: "Amy Cuddy - Body language shapes who you are", description: "Classic TED on confidence and presence before walking into a room.", url: "https://www.youtube.com/watch?v=Ks-_Mh1QhMc" },
      { name: "Vinh Giang (YouTube)", description: "Practical communication, public speaking and presentation coaching.", url: "https://www.youtube.com/@AskVinh" },
      { name: "Jeff Su (YouTube)", description: "Short, no-fluff videos on interviews, email, meetings and workplace skills.", url: "https://www.youtube.com/@JeffSu" },
      { name: "Linda Raynier (YouTube)", description: "Interview answers, CVs and how to come across well.", url: "https://www.youtube.com/@LindaRaynier" },
      { name: "TED - Career talks playlist", description: "Short, sharp talks on work, career and what makes people effective.", url: "https://www.ted.com/topics/career" },
      { name: "Simon Sinek (YouTube)", description: "Leadership, purpose and how to show up at work.", url: "https://www.youtube.com/@simonsinek" },
      { name: "How to Be on Time - 10 Tips for Punctuality", description: "Quick and Dirty Tips breaks down practical, science-backed habits for arriving on time to work, interviews and meetings.", url: "https://www.youtube.com/watch?v=UzVbpYO4FGc" },
      { name: "Time Management for Teens", description: "Simple planning and prioritising habits that stop the last-minute rush before school or work.", url: "https://www.youtube.com/watch?v=CBEQxJK9Y6Q" },
      { name: "Punctuality Expert Reveals the Secret to a More Productive Workplace", description: "Why employers still mark you down for being late, and how younger workers and older bosses read \"on time\" differently.", url: "https://www.youtube.com/watch?v=1VS9VF_TuCk" },
    ],
    listen: [
      { name: "How To Be On Time", description: "NPR's Life Kit podcast with a time-management coach on why people run late and the tactics that actually fix it.", url: "https://www.npr.org/2021/12/06/1061811764/how-to-be-on-time" },
      { name: "The Diary of a CEO - Communication & confidence episodes", description: "Steven Bartlett interviews on self-belief, presence and people skills.", url: "https://open.spotify.com/show/7iQXYTyuChrJGfo3FF6cog" },
      { name: "Squiggly Careers (Amazing If)", description: "The UK's most-listened-to career podcast - confidence, conversations, interviews.", url: "https://open.spotify.com/show/2JCRlgjewZqdgpovS3e8GA" },
      { name: "Think Fast, Talk Smart", description: "Stanford podcast on speaking clearly under pressure.", url: "https://open.spotify.com/show/6qEjsuSRnSGNRFEPbPNZeV" },
      { name: "WorkLife with Adam Grant", description: "Organisational psychologist on what makes work feel good.", url: "https://open.spotify.com/show/4eylg9GZJOVvUhTynt4jjA" },
      { name: "The High Performance Podcast", description: "UK podcast on what confident, high-performing people do differently.", url: "https://open.spotify.com/show/2Gtq5JU6mMc1oFGRvvDdzM" },
    ],
    read: [
      { name: "Prospects - Interview tips", description: "UK graduate guide to interview questions, formats and prep.", url: "https://www.prospects.ac.uk/careers-advice/interview-tips" },
      { name: "National Careers Service - Interview advice", description: "Free UK government guidance on preparing for interviews.", url: "https://nationalcareers.service.gov.uk/careers-advice/interview-advice" },
      { name: "Mind - Building confidence", description: "Practical mental health charity guide to growing self-confidence.", url: "https://www.mind.org.uk/information-support/tips-for-everyday-living/self-esteem/" },
      { name: "MindTools - Communication skills", description: "Library of guides on listening, presenting and interpersonal skills.", url: "https://www.mindtools.com/a4wo118/communication-skills" },
      { name: "Amazing If - Resources", description: "Free templates and frameworks from the Squiggly Careers team.", url: "https://www.amazingif.com/listen/" },
      { name: "Harvard Business Review", description: "Benchmark thinking on communication, leadership and careers.", url: "https://hbr.org" },
      { name: "FT Work & Careers", description: "UK career trends and workplace coverage.", url: "https://www.ft.com/work-careers" },
      { name: "Skills You Need - Time Management", description: "Core guide to prioritising tasks and using time productively rather than just working harder.", url: "https://www.skillsyouneed.com/ps/time-management.html" },
      { name: "Indeed UK - Time-management skills", description: "The core time-management competencies employers look for and steps to build them.", url: "https://uk.indeed.com/career-advice/career-development/time-management-skills" },
      { name: "Indeed UK - Being late for work", description: "What counts as a legitimate reason for lateness, and how to handle it professionally when it happens.", url: "https://uk.indeed.com/career-advice/career-development/excuses-for-being-late" },
    ],
    help: [
      { name: "Barclays LifeSkills", description: "Free modules on confidence, communication, CVs and interviews.", url: "https://barclayslifeskills.com", tags: ["Free", "Basics"] },
      { name: "Youth Employment UK - Self-Management Skills", description: "Free guide on getting organised, showing up on time and being accountable at work.", url: "https://www.youthemployment.org.uk/young-professional-training/self-management-skills-young-professional/", tags: ["Free", "Punctuality"] },
      { name: "Tiimo", description: "Visual planner app that turns your day into colour-coded time blocks - built to be simple for beginners.", url: "https://www.tiimoapp.com/", tags: ["App"] },
      { name: "The King's Trust - Team programme", description: "Free 12-week course for unemployed young people building time management and other work-readiness skills alongside real work experience.", url: "https://www.kingstrust.org.uk/how-we-can-help/grow-skills-and-confidence/team", tags: ["Under 30", "Free"] },
      { name: "National Careers Service", description: "Free UK advice on CVs, interviews and skills - by phone, chat or web.", url: "https://nationalcareers.service.gov.uk", tags: ["Free", "Advice"] },
      { name: "The King's Trust - Grow skills & confidence", description: "Free personal-development support for 16–30s - try new things, meet people and build essential skills for life and work.", url: "https://www.kingstrust.org.uk/how-we-can-help/grow-skills-and-confidence", tags: ["Under 30", "Confidence"] },
      { name: "The King's Trust - Email series", description: "Six free emails packed with tips to build your skills and confidence.", url: "https://www.kingstrust.org.uk/how-we-can-help/email-series", tags: ["Free"] },
      { name: "UK Youth", description: "Programmes focused on confidence, work skills and opportunities.", url: "https://www.ukyouth.org", tags: ["Skills"] },
      { name: "Toastmasters UK & Ireland", description: "Local clubs to practise public speaking and presenting in a friendly room.", url: "https://www.toastmasters.org/find-a-club", tags: ["Speaking"] },
      { name: "Speakers for Schools", description: "Free talks from top professionals and work experience for state school students.", url: "https://www.speakersforschools.org", tags: ["State Schools"] },
      { name: "Movement to Work", description: "Coalition of UK employers offering work placements to those not in work or education.", url: "https://www.movementtowork.com", tags: ["Placements"] },
      { name: "The Careers & Enterprise Company", description: "Links schools and colleges with employers.", url: "https://www.careersandenterprise.co.uk", tags: ["Schools"] },
    ],
  },
  {
    slug: "internships-graduates",
    title: "Internships & Graduates",
    description: "The shortest path from student to first proper job - placements, internships, and graduate schemes worth applying to.",
    icon: learningEmployability,
    watch: [
      { name: "Bright Network (YouTube)", description: "Graduate scheme insights, recruiter Q&As and industry overviews.", url: "https://www.youtube.com/user/Brightnetwork" },
      { name: "TARGETjobs (YouTube)", description: "Application tips and assessment-centre walkthroughs from UK graduate recruiters.", url: "https://www.youtube.com/@targetjobsUK" },
      { name: "BBC Bitesize Careers", description: "Industry guides and real-worker job profiles - useful background before applications.", url: "https://www.bbc.co.uk/bitesize/careers" },
    ],
    listen: [
      { name: "The Graduate Job Podcast", description: "Tactical episodes on landing your first graduate role in the UK.", url: "https://open.spotify.com/show/3Au2pkWKfidjjmxlPfpZny" },
      { name: "Bright Network - The Edit", description: "Career conversations with employers and recent graduates.", url: "https://www.brightnetwork.co.uk/the-edit/" },
    ],
    read: [
      { name: "Save the Student", description: "Brutally practical UK student finance, jobs and life advice.", url: "https://www.savethestudent.org" },
      { name: "TARGETjobs", description: "Sector-by-sector guides to UK graduate schemes.", url: "https://targetjobs.co.uk" },
    ],
    help: [
      { name: "Higherin", description: "Internships, placements, graduate schemes and apprenticeships.", url: "https://higherin.com/search-jobs/internships", tags: ["Jobs"] },
      { name: "Bright Network", description: "Internships, insight days and placements across every industry.", url: "https://www.brightnetwork.co.uk/internships/", tags: ["Network"] },
      { name: "Milkround", description: "Long-running graduate job board.", url: "https://www.milkround.com/jobs/graduate-scheme", tags: ["Jobs"] },
      { name: "The Trackr", description: "Live-tracked internships, spring weeks and grad schemes - Finance, Tech, Law.", url: "https://the-trackr.com/trackers/", tags: ["Finance", "Tech"] },
      { name: "My First Job in Film", description: "UK entry-level film, TV and broadcast jobs.", url: "https://myfirstjobinfilm.com/UK", tags: ["Film & TV"] },
      { name: "The King's Trust - Get a job", description: "For 16–30s: free programmes to figure out what you're passionate about and meet employers like JD Sports, NHS and M&S.", url: "https://www.kingstrust.org.uk/how-we-can-help/get-job", tags: ["Under 30", "Free"] },
    ],
  },
  {
    slug: "work-experience",
    title: "Work Experience",
    description: "Get inside a real workplace - virtual or in-person - before you commit to a path.",
    icon: learningEmployability,
    watch: [
      { name: "Springpod (YouTube)", description: "Virtual work experience programme highlights and employer days.", url: "https://www.youtube.com/@springpod" },
      { name: "Forage (YouTube)", description: "What virtual job simulations look like inside JPMorgan, BCG, Accenture and more.", url: "https://www.youtube.com/@TheForage" },
      { name: "BBC Bitesize Careers - A day in the life", description: "Hundreds of short films of real UK workers explaining what their job is actually like.", url: "https://www.bbc.co.uk/bitesize/careers" },
    ],
    listen: [
      { name: "Future of UK Hiring (Indeed)", description: "What employers actually want to see on a CV from someone with limited experience.", url: "https://open.spotify.com/search/Future%20of%20UK%20Hiring" },
    ],
    read: [
      { name: "Gov.uk - Work experience", description: "Official guidance on placements, your rights, and how schools arrange them.", url: "https://www.gov.uk/government/publications/post-16-work-experience-as-a-part-of-16-to-19-study-programmes" },
      { name: "Prospects - Work experience", description: "How to find, apply for, and make the most of work experience.", url: "https://www.prospects.ac.uk/jobs-and-work-experience/work-experience-and-internships" },
    ],
    help: [
      { name: "Springpod", description: "Free virtual work experience with top UK employers.", url: "https://www.springpod.com/opportunities?internalId=OP-00043", tags: ["Virtual", "Free"] },
      { name: "Speakers for Schools", description: "Free placements for state school students aged 14–19.", url: "https://www.speakersforschools.org/work-experience/", tags: ["State Schools"] },
      { name: "Forage", description: "Free virtual job simulations from BCG, JPMorgan, Accenture.", url: "https://www.theforage.com", tags: ["Virtual"] },
      { name: "InvestIN", description: "Career experience programmes for ages 12–18.", url: "https://investin.org", tags: ["Paid"] },
      { name: "Career Ready", description: "Mentors and paid four-week internships across the UK.", url: "https://careerready.org.uk", tags: ["Paid"] },
      { name: "Workfinder", description: "Short, paid placements at fast-growing UK companies for 14–24 year-olds.", url: "https://www.workfinder.com", tags: ["Paid"] },
      { name: "Nuffield Research Placements", description: "Funded summer STEM research placements for Year 12.", url: "https://www.nuffieldresearchplacements.org", tags: ["STEM"] },
      { name: "Social Mobility Foundation", description: "Internships and mentoring for high-achieving students from low-income backgrounds.", url: "https://www.socialmobility.org.uk", tags: ["Free"] },
      { name: "The King's Trust - Get a job", description: "Free 16–30 programmes that include real workplace experience with major UK employers.", url: "https://www.kingstrust.org.uk/how-we-can-help/get-job", tags: ["Under 30", "Free"] },
    ],
  },
  {
    slug: "money",
    title: "Money & Financial Skills",
    description: "Budgeting, saving, debt, pensions and tax - the stuff school never taught you, explained for the UK.",
    icon: learningMoney,
    watch: [
      { name: "Damien Talks Money (YouTube)", description: "UK personal finance, ISAs, pensions and investing - calm and clear.", url: "https://www.youtube.com/@DamienTalksMoney" },
      { name: "MoneyWeek Videos (YouTube)", description: "Markets, tax and big-picture money explainers from the UK.", url: "https://www.youtube.com/@MoneyWeekVideos" },
      { name: "Martin Lewis (YouTube)", description: "The UK's go-to consumer finance voice on bills, mortgages and savings.", url: "https://www.youtube.com/@MartinLewisOfficial" },
    ],
    listen: [
      { name: "Money Clinic (FT)", description: "FT podcast tackling listener money questions across investing, property and life.", url: "https://open.spotify.com/show/4P86ZzHf7EwldKFb3WJxSc" },
      { name: "Making Money - The Times", description: "UK personal finance show on saving, investing and getting your money in shape.", url: "https://open.spotify.com/show/4F5lk6XlRsUCWqGFCIwU4f" },
      { name: "ChooseFI UK", description: "Financial independence for a UK audience.", url: "https://open.spotify.com/show/3IpbJZyL8UAYa8bLk8TQ2X" },
    ],
    read: [
      { name: "MoneySavingExpert", description: "The UK's most-trusted consumer finance site - Martin Lewis.", url: "https://www.moneysavingexpert.com" },
      { name: "Be Clever With Your Cash", description: "UK personal finance written without the boring bits.", url: "https://www.becleverwithyourcash.com" },
      { name: "FT Money", description: "Serious UK personal finance journalism.", url: "https://www.ft.com/money" },
    ],
    help: [
      { name: "MyBnk", description: "Financial literacy workshops for young people in UK schools.", url: "https://mybnk.org", tags: ["Schools"] },
      { name: "MoneyHelper (MaPS)", description: "Government-backed free and impartial money guidance.", url: "https://www.moneyhelper.org.uk", tags: ["Government"] },
      { name: "Young Money", description: "Financial education programmes and resources for UK schools.", url: "https://www.young-money.org.uk", tags: ["Schools"] },
      { name: "LIBF Financial Education", description: "Qualifications in personal finance for students.", url: "https://www.libf.ac.uk/study/financial-education", tags: ["Qualifications"] },
      { name: "The King's Trust - Money skills", description: "Free tools and guidance from The King's Trust to help 16–30s manage money with confidence.", url: "https://www.kingstrust.org.uk/how-we-can-help/tools-resources", tags: ["Under 30", "Free"] },
    ],
  },
  {
    slug: "careers",
    title: "Careers Advice",
    description: "Working out what to do next - and the people, tools and frameworks to help you decide.",
    icon: learningCareers,
    watch: [
      { name: "icould - Career videos", description: "Hundreds of short videos of real people doing real UK jobs.", url: "https://icould.com/buzz-quiz/" },
      { name: "BBC Bitesize Careers (YouTube)", description: "Short, accessible career insight videos.", url: "https://www.bbc.co.uk/bitesize/careers" },
      { name: "The King's Trust (YouTube)", description: "Real stories from young people who used King's Trust support to find direction and work.", url: "https://www.youtube.com/@KingsTrust" },
    ],
    listen: [
      { name: "Squiggly Careers", description: "Weekly UK podcast on modern careers - non-linear, honest, practical.", url: "https://open.spotify.com/show/2JCRlgjewZqdgpovS3e8GA" },
      { name: "Career Contessa", description: "Direct advice on changing direction, asking for more, and figuring out what's next.", url: "https://open.spotify.com/show/0PVZS2kKBgaYtTXEKlc6qq" },
    ],
    read: [
      { name: "Designing Your Life (Burnett & Evans)", description: "Stanford-developed framework for career design - the bestselling guide.", url: "https://designingyour.life" },
      { name: "FT Work & Careers", description: "UK-led careers journalism and trend pieces.", url: "https://www.ft.com/work-careers" },
    ],
    help: [
      { name: "Youth Employment UK - Career Guides", description: "Sector-by-sector career guides across 18 industries - what the jobs involve, the skills and qualifications you need, and how to get in via traineeships, apprenticeships or college.", url: "https://www.youthemployment.org.uk/careers-hub/", tags: ["Sectors", "Free"] },
      { name: "National Careers Service", description: "Free government careers advice for adults and young people in England.", url: "https://nationalcareers.service.gov.uk", tags: ["Government"] },
      { name: "Prospects", description: "Graduate careers advice - job profiles and planning tools.", url: "https://www.prospects.ac.uk", tags: ["Graduate"] },
      { name: "UCAS Career Finder", description: "Explore careers and the qualifications you need.", url: "https://www.ucas.com/explore", tags: ["Education"] },
      { name: "Careerpilot", description: "Career videos and routes for young people (incorporates icould).", url: "https://www.careerpilot.org.uk", tags: ["Exploration"] },
      { name: "Success at School", description: "Career advice, employer profiles and apprenticeship guidance.", url: "https://successatschool.org", tags: ["Schools"] },
      { name: "AllAboutCareers", description: "Graduate and school leaver advice and sector guides.", url: "https://www.allaboutcareers.com", tags: ["Graduate"] },
      { name: "The King's Trust - Opportunity Explorer", description: "Tell them your interests and goals; get personalised, free support recommendations.", url: "https://www.kingstrust.org.uk/opportunity-explorer", tags: ["Under 30", "Free"] },
      { name: "UK CareerQuest", description: "Community-powered career growth - events, training and networking with industry leaders and employers.", url: "https://ukcareerquest.co.uk/", tags: ["Events", "Networking"] },
    ],
  },
  {
    slug: "apprenticeships",
    title: "Apprenticeships",
    description: "Earn while you learn - from Level 2 right up to a degree apprenticeship at a top UK employer.",
    icon: learningApprenticeships,
    watch: [
      { name: "Amazing Apprenticeships (YouTube)", description: "Vacancy snapshots, employer profiles and apprentice stories.", url: "https://www.youtube.com/@AmazingApprenticeships" },
      { name: "Apprenticeships England (YouTube)", description: "Official channel with employer case studies and route walkthroughs.", url: "https://www.youtube.com/@AmazingApprenticeships" },
    ],
    listen: [
      { name: "The Apprenticeship Podcast", description: "UK podcast featuring apprentices, employers and providers.", url: "https://open.spotify.com/search/the%20apprenticeship%20podcast" },
    ],
    read: [
      { name: "FE Week - Apprenticeships", description: "The UK's leading further education paper on apprenticeship policy and providers.", url: "https://feweek.co.uk/apprenticeships/" },
      { name: "Rate My Apprenticeship - Insights", description: "Real reviews from current and former apprentices.", url: "https://www.ratemyapprenticeship.co.uk" },
    ],
    help: [
      { name: "Find an Apprenticeship (Gov.uk)", description: "The official government search for apprenticeship vacancies in England.", url: "https://www.findapprenticeship.service.gov.uk", tags: ["Government"] },
      { name: "Amazing Apprenticeships", description: "Resources and guides for parents, students and teachers.", url: "https://amazingapprenticeships.com", tags: ["Resources"] },
      { name: "Not Going to Uni", description: "Apprenticeships, sponsored degrees and school leaver programmes.", url: "https://www.notgoingtouni.co.uk", tags: ["Alternatives"] },
      { name: "UCAS Apprenticeships", description: "Search apprenticeships alongside university options.", url: "https://www.ucas.com/apprenticeships", tags: ["Comparison"] },
      { name: "GetMyFirstJob", description: "Apprenticeship and school leaver listings.", url: "https://www.getmyfirstjob.co.uk", tags: ["Jobs"] },
      { name: "Rate My Apprenticeship", description: "Reviews of apprenticeship employers from real apprentices.", url: "https://www.ratemyapprenticeship.co.uk", tags: ["Reviews"] },
      { name: "Institute for Apprenticeships", description: "All approved apprenticeship standards by sector and level.", url: "https://www.instituteforapprenticeships.org", tags: ["Standards"] },
      { name: "The King's Trust - Get a job", description: "Free 16–30 routes into work, including support to get apprenticeship-ready.", url: "https://www.kingstrust.org.uk/how-we-can-help/get-job", tags: ["Under 30", "Free"] },
    ],
  },
  {
    slug: "cv-builder",
    title: "Profile Builder",
    description: "Build a CV that gets you interviews - using AI, templates, and the things UK employers actually look for.",
    icon: learningCareers,
    watch: [
      { name: "Jeff Su - Resume Tips (YouTube)", description: "Clean, modern advice on structure, keywords and what recruiters scan for.", url: "https://www.youtube.com/@JeffSu" },
      { name: "Self Made Millennial - CV/Resume", description: "Ex-recruiter Madeline Mann on what to keep on, off, and how to phrase wins.", url: "https://www.youtube.com/@SelfMadeMillennial" },
    ],
    listen: [
      { name: "Squiggly Careers - CV episodes", description: "Search the back catalogue for excellent CV episodes.", url: "https://www.amazingif.com/listen/" },
    ],
    read: [
      { name: "Reed - How to write a CV", description: "Clear UK CV guide with templates and examples by stage.", url: "https://www.reed.co.uk/career-advice/free-cv-template/" },
      { name: "Save the Student - CV tips", description: "Student-friendly CV writing advice and examples.", url: "https://www.savethestudent.org/jobs/how-to-write-a-cv.html" },
      { name: "Prospects - CV examples", description: "Sample CVs by sector for UK graduates.", url: "https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters" },
    ],
    help: [
      { name: "How do you do? Profile Builder", description: "Build a tailored, industry-specific CV with our AI-powered builder.", url: "/cv-builder", tags: ["Tool", "Free"] },
      { name: "Vizzy", description: "Free visual CV builder with smart templates.", url: "https://vizzy.com/", tags: ["Design", "Free"] },
      { name: "Save the Student - CV Tips", description: "Templates and advice tuned to UK employers.", url: "https://www.savethestudent.org/jobs/how-to-write-a-cv.html", tags: ["Students"] },
    ],
  },
  {
    slug: "interview-skills",
    title: "Interview Skills",
    description: "From the phone screen to the assessment centre - how to prep, perform, and follow up.",
    icon: learningCareers,
    watch: [
      { name: "Self Made Millennial (YouTube)", description: "STAR answers, behavioural questions and how to handle the awkward ones.", url: "https://www.youtube.com/@SelfMadeMillennial" },
      { name: "Indeed - Interviewing", description: "Short videos on interview prep, questions, and follow-up.", url: "https://www.youtube.com/@indeed" },
      { name: "Big Interview (YouTube)", description: "Mock interviews and structured prep across hundreds of roles.", url: "https://www.youtube.com/@BigInterview" },
    ],
    listen: [
      { name: "Find Your Dream Job (Mac's List)", description: "Recurring episodes on interview prep, salary negotiation and follow-up.", url: "https://open.spotify.com/show/3KDGQrxQwrLBBEx0WNc6IV" },
    ],
    read: [
      { name: "Reed - Interview Techniques", description: "UK-focused interview guide hub.", url: "https://www.reed.co.uk/career-advice/interview-techniques/" },
      { name: "Indeed Career Guide - Interviews", description: "Practical articles, STAR walkthroughs and templates.", url: "https://uk.indeed.com/career-advice/interviewing" },
      { name: "Prospects - Interview tips", description: "Comprehensive prep for graduates including assessment centres.", url: "https://www.prospects.ac.uk/careers-advice/interview-tips" },
    ],
    help: [
      { name: "National Careers Service - Interview Advice", description: "Free official guidance on prep, common questions and body language.", url: "https://nationalcareers.service.gov.uk/careers-advice/interview-advice", tags: ["Government"] },
      { name: "Big Interview", description: "Practice interviews on video with AI feedback.", url: "https://biginterview.com", tags: ["Practice", "AI"] },
    ],
  },
  {
    slug: "mentoring",
    title: "Mentoring",
    description: "Find someone who's done it before - and is willing to help you avoid their mistakes.",
    icon: learningMentoring,
    watch: [
      { name: "TED - Mentorship talks", description: "What good mentorship looks like, from people who've been mentored well.", url: "https://www.ted.com/search?q=mentorship" },
    ],
    listen: [
      { name: "The Mentoring Podcast", description: "Conversations on what makes mentoring relationships actually work.", url: "https://open.spotify.com/search/the%20mentoring%20podcast" },
    ],
    read: [
      { name: "Harvard Business Review - Mentoring", description: "Evidence-based articles on building and using mentoring relationships.", url: "https://hbr.org/topic/mentoring" },
    ],
    help: [
      { name: "Career Ready", description: "Connects 15–18 year-olds with professional mentors.", url: "https://careerready.org.uk/mentoring/", tags: ["Schools"] },
      { name: "The Diana Award Mentoring", description: "Structured 12-week mentoring for young people at risk of becoming NEET.", url: "https://diana-award.org.uk/our-programmes-and-initiatives/mentoring/become-a-mentor", tags: ["Youth"] },
      { name: "Power2 Aspire", description: "1-to-1 mentoring for over-18s in further or higher education.", url: "https://www.power2.org/aspire", tags: ["Students"] },
      { name: "Future First", description: "Connects students with alumni mentors from their own school.", url: "https://futurefirst.org.uk/", tags: ["Alumni"] },
      { name: "STEM Mentoring", description: "Free online mentoring with STEM professionals.", url: "https://www.stem.org.uk/secondary/careers/mentoring", tags: ["STEM"] },
      { name: "The Spear Programme", description: "Intensive coaching for 16–24 year-olds.", url: "https://www.spear.org.uk/spear-programme/", tags: ["Employment"] },
      { name: "MentorsMe", description: "Free mentoring matching for entrepreneurs and small business owners.", url: "https://www.mentorsme.co.uk", tags: ["Business"] },
      { name: "The King's Trust - Mentoring & support", description: "1-to-1 mentoring as part of King's Trust enterprise and employment programmes for 16–30s.", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", tags: ["Under 30", "Free"] },
      { name: "Smart Works", description: "Free interview coaching, styling and ongoing 1:1 mentoring for unemployed women preparing for job interviews.", url: "https://smartworks.org.uk", tags: ["Women", "Interviews"] },
    ],
  },
  {
    slug: "education",
    title: "Further Education & University",
    description: "Picking a course, picking a route, and the alternatives nobody told you about.",
    icon: learningEducation,
    watch: [
      { name: "UCAS (YouTube)", description: "Personal statement help, course choice and clearing explained.", url: "https://www.youtube.com/@UCAS" },
      { name: "The Student Room (YouTube)", description: "UK student life, revision and uni-choice videos.", url: "https://www.youtube.com/@thestudentroom" },
      { name: "BBC Bitesize", description: "Free GCSE, National 5, Higher and A-Level revision - plus careers content for next steps.", url: "https://www.bbc.co.uk/bitesize" },
    ],
    listen: [
      { name: "The UCAS Podcast", description: "Official UCAS show on application timelines and decisions.", url: "https://open.spotify.com/search/UCAS%20podcast" },
    ],
    read: [
      { name: "Complete University Guide", description: "Independent UK university league tables and subject rankings.", url: "https://www.thecompleteuniversityguide.co.uk" },
      { name: "Which? University", description: "Honest guides to UK courses, unis and student life.", url: "https://university.which.co.uk" },
    ],
    help: [
      { name: "UCAS", description: "Central hub for applying to UK universities and colleges.", url: "https://www.ucas.com", tags: ["Applications"] },
      { name: "The Student Room", description: "The UK's largest student community.", url: "https://www.thestudentroom.co.uk", tags: ["Community"] },
      { name: "Not Going to Uni", description: "Apprenticeships, gap years, sponsored degrees and school leaver programmes.", url: "https://www.notgoingtouni.co.uk", tags: ["Alternatives"] },
      { name: "Amazing Apprenticeships", description: "Resources and vacancies for apprenticeships.", url: "https://amazingapprenticeships.com", tags: ["Training"] },
      { name: "Open University", description: "Flexible distance learning around work.", url: "https://www.open.ac.uk", tags: ["Flexible"] },
      { name: "FutureLearn", description: "Free and paid online courses from top universities.", url: "https://www.futurelearn.com", tags: ["Online"] },
    ],
  },
  {
    slug: "support-into-work",
    title: "Support into Work",
    description: "Employment support specifically for people with mental health conditions - from job coaching to managing work and wellbeing.",
    icon: learningEmployability,
    watch: [
      { name: "The Mix - Jobs & Mental Health", description: "Real guides and support from The Mix for young people managing mental health while getting into work.", url: "https://www.themix.org.uk/search/?q=jobs" },
      { name: "Shaw Trust - Disability Employment Support", description: "Videos on workplace support, job coaching and what's available for disabled people.", url: "https://www.shawtrust.org.uk" },
    ],
    listen: [
      { name: "The Mix Podcast - Getting into Work", description: "Conversations on employment, managing mental health at work, and real support for vulnerable young people.", url: "https://open.spotify.com/episode/1AFbu7CwJTylx6ga0c5wba" },
    ],
    read: [
      { name: "Individual Placement Support - IPS Grow", description: "Guide to IPS - evidence-based employment support for people with mental health conditions.", url: "https://ipsgrow.org.uk/about/what-is-ips/" },
      { name: "Access to Work Guide", description: "Full guide to the government grant scheme funding practical support for disabled people in work.", url: "https://www.gov.uk/access-to-work" },
      { name: "ACAS - Disability at Work", description: "Workplace rights, reasonable adjustments and what you're entitled to as a disabled employee.", url: "https://www.acas.org.uk/disability-discrimination" },
    ],
    help: [
      { name: "Youth Employment UK - Opportunity Finder", description: "Searchable UK-wide database of entry-level jobs, apprenticeships, training and events - filter by location and type.", url: "https://www.youthemployment.org.uk/opportunity-finder-database/", tags: ["Jobs", "Free"] },
      { name: "Youth Employment UK - Overcoming Barriers", description: "A genuinely comprehensive hub covering mental health, disability, young carers, young parents, substance abuse, digital access and more - each with practical next steps.", url: "https://www.youthemployment.org.uk/overcoming-barriers-to-life-and-employment/", tags: ["Free", "Wide-ranging"] },
      { name: "Individual Placement Support (IPS)", description: "Evidence-based employment support for people with mental health conditions - personalized job search, placement and ongoing support.", url: "https://ipsgrow.org.uk/about/what-is-ips/", tags: ["Mental Health", "Funded"] },
      { name: "Shaw Trust", description: "UK-wide disability employment support provider - job coaching, workplace assessments, and ongoing support to help disabled people find and keep work.", url: "https://www.shawtrust.org.uk", tags: ["Disability", "Job Coaching"] },
      { name: "Access to Work Scheme", description: "Government grants for disabled people - funding for equipment, transport, support workers and interpreters.", url: "https://www.gov.uk/access-to-work", tags: ["Disability", "Funding"] },
      { name: "BASE - Supported Employment", description: "National network of accredited supported employment providers helping disabled, neurodivergent and disadvantaged people find and sustain work.", url: "https://base-uk.org/", tags: ["Employment Support"] },
      { name: "The Spear Programme", description: "Intensive employment support for 16–24 year-olds - job coaching, mentoring, benefits advice and in-work support.", url: "https://www.spear.org.uk/spear-programme/", tags: ["Youth", "Mentoring"] },
      { name: "Prince's Trust Get Into Work", description: "Free support for young people 16-30 struggling to find work - training, mentoring and job placement.", url: "https://www.princes-trust.org.uk/help-for-young-people/get-into-work", tags: ["Youth", "Free"] },
      { name: "Working Families", description: "Employment support for parents and carers - career advice, flexible working information and workplace rights.", url: "https://www.workingfamilies.org.uk", tags: ["Parents", "Carers"] },
      { name: "Traineeships", description: "Government-funded work experience combined with training for young people 16-24 - six-month programmes with real employers.", url: "https://www.gov.uk/find-traineeship", tags: ["Youth", "Training"] },
      { name: "Become - Finding Jobs & Apprenticeships", description: "Advice and one-to-one support from the UK's care leaver charity - CVs, applications, apprenticeships and the Care Leaver Covenant.", url: "https://becomecharity.org.uk/get-information/resources/finding-jobs/", tags: ["Care Leavers", "Free"] },
      { name: "Care Leaver Covenant", description: "Database of jobs, apprenticeships and training opportunities from employers who've pledged extra support to care leavers aged 16-25.", url: "https://mycovenant.org.uk/for-care-leavers/care-leaver-opportunities/", tags: ["Care Leavers"] },
      { name: "Catch22 - Care Leavers into Careers", description: "One-to-one employment support for care-experienced young people into jobs, education or training.", url: "https://www.catch-22.org.uk/find-services/care-leavers-into-careers/", tags: ["Care Leavers"] },
    ],
  },
  {
    slug: "social-mobility",
    title: "Social Mobility",
    description: "Programmes that open doors for talented young people from less-advantaged backgrounds - coaching, mentoring and direct routes into top employers.",
    icon: learningMentoring,
    watch: [
      { name: "Sutton Trust (YouTube)", description: "Films and talks on social mobility, access to top universities and the professions.", url: "https://www.youtube.com/@suttontrust" },
    ],
    listen: [
      { name: "The Sutton Trust Podcast", description: "Conversations on opportunity, education and what really shifts social mobility in the UK.", url: "https://open.spotify.com/search/sutton%20trust" },
    ],
    read: [
      { name: "Sutton Trust - Research", description: "Leading UK reports on access, fair admissions and social mobility.", url: "https://www.suttontrust.com/our-research/" },
      { name: "Social Mobility Commission", description: "Official UK research and recommendations on improving social mobility.", url: "https://www.gov.uk/government/organisations/social-mobility-commission" },
    ],
    help: [
      { name: "upReach", description: "Free intensive support for undergraduates from less-advantaged backgrounds - coaching, mentoring and employer access to land top graduate jobs.", url: "https://upreach.org.uk/", tags: ["Undergraduates", "Free"] },
      { name: "Making The Leap", description: "London-based social mobility charity running employability programmes, mentoring and youth-focused work for under-represented young people.", url: "https://makingtheleap.org.uk/about-us/", tags: ["Youth", "London"] },
      { name: "Career Ready", description: "Two-year programme of mentoring, masterclasses and paid internships for 16–18 year-olds in state schools and colleges.", url: "https://careerready.org.uk/", tags: ["Schools", "Mentoring"] },
      { name: "The Sutton Trust", description: "Programmes including UK Summer Schools and Pathways for top universities and professions.", url: "https://www.suttontrust.com/our-programmes/", tags: ["University", "Free"] },
      { name: "Social Mobility Foundation", description: "Aspiring Professionals Programme - mentoring, internships and skills sessions for high-achieving Year 12s from low-income homes.", url: "https://www.socialmobility.org.uk", tags: ["Sixth Form", "Internships"] },
      { name: "Future Frontiers", description: "Award-winning social mobility programme providing mentoring, skills development and career support for young people from disadvantaged backgrounds.", url: "https://www.futurefrontiers.org.uk", tags: ["Youth", "Mentoring", "Free"] },
    ],
  },
  {
    slug: "online-courses",
    title: "Online Courses",
    description: "Learn anything, on your terms - flexible online courses from world-class universities, accredited UK providers and skills-focused platforms. Most have free options.",
    icon: learningEducation,
    watch: [
      { name: "Coursera (YouTube)", description: "Trailers and previews of courses and specialisations from Stanford, Yale, Google, IBM and more.", url: "https://www.youtube.com/@coursera" },
      { name: "edX (YouTube)", description: "Course previews and learner stories from Harvard, MIT and other top universities.", url: "https://www.youtube.com/@edxonline" },
      { name: "TED-Ed", description: "Short, beautifully animated lessons across science, history, psychology and the arts - a free taster of how online learning can feel.", url: "https://www.youtube.com/@TEDEd" },
    ],
    listen: [
      { name: "The OU Podcast (Open University)", description: "Bite-sized audio from Open University academics on everything from psychology to climate to business.", url: "https://www.open.edu/openlearn/podcasts" },
      { name: "Coursera - The Learning Curve", description: "Conversations on the future of learning, skills and careers with industry leaders.", url: "https://open.spotify.com/search/coursera%20learning%20curve" },
      { name: "FutureLearn Podcast", description: "Learning, careers and personal development stories from FutureLearn educators and partners.", url: "https://open.spotify.com/search/futurelearn" },
    ],
    read: [
      { name: "Class Central", description: "Independent search engine and review site for online courses across every major platform - the easiest way to find free Coursera, edX and FutureLearn courses.", url: "https://www.classcentral.com" },
      { name: "OpenLearn (Open University)", description: "Thousands of completely free OU courses, articles and quizzes - earn statements of participation and digital badges.", url: "https://www.open.edu/openlearn/" },
      { name: "Reed Courses", description: "The UK's biggest online courses marketplace - filter by free, CPD-accredited and career path.", url: "https://www.reed.co.uk/courses" },
    ],
    help: [
      { name: "Youth Employment UK - Young Professional Training", description: "Free membership training built specifically for young people - practical skills like self-management, alongside events and a youth advice hub, not just video lessons.", url: "https://www.youthemployment.org.uk/young-professional-training/", tags: ["Free", "Youth-specific"] },
      { name: "Coursera", description: "Courses, professional certificates and degrees from 350+ universities and companies including Google, IBM, Meta and Yale. Many courses free to audit.", url: "https://www.coursera.org", tags: ["Free option", "Certificates"] },
      { name: "The Open University", description: "The UK's largest university - flexible distance-learning degrees, micro-credentials and free OpenLearn courses you can fit around work.", url: "https://www.open.ac.uk", tags: ["UK", "Degrees", "Flexible"] },
      { name: "learndirect", description: "UK online learning provider offering A Levels, GCSEs, Access to HE diplomas and CPD-accredited career courses you can study from home.", url: "https://www.learndirect.com", tags: ["UK", "A Levels", "CPD"] },
      { name: "FutureLearn", description: "UK-based platform with free and paid courses, ExpertTracks and online degrees from top universities and organisations.", url: "https://www.futurelearn.com", tags: ["UK", "Free option"] },
      { name: "edX", description: "Free and paid online courses, MicroMasters and professional certificates from Harvard, MIT, Berkeley and 250+ leading institutions.", url: "https://www.edx.org", tags: ["Free option", "Certificates"] },
      { name: "Udemy", description: "Huge marketplace of practical, skills-based courses - tech, design, business, marketing - often heavily discounted.", url: "https://www.udemy.com", tags: ["Skills", "Affordable"] },
      { name: "LinkedIn Learning", description: "Video courses on business, creative and tech skills - free trial, then bundled with LinkedIn Premium.", url: "https://www.linkedin.com/learning/", tags: ["Skills", "Career"] },
      { name: "Khan Academy", description: "Completely free world-class lessons in maths, science, economics, computing and more - for any age.", url: "https://www.khanacademy.org", tags: ["Free", "All ages"] },
      { name: "Google Career Certificates", description: "Industry-recognised entry-level certificates in IT support, data analytics, UX design, project management and cybersecurity - on Coursera.", url: "https://grow.google/intl/uk/certificates/", tags: ["Free option", "Career"] },
      { name: "Skillshare", description: "Online classes from working creatives - design, illustration, film, photography, writing and entrepreneurship.", url: "https://www.skillshare.com", tags: ["Creative"] },
      { name: "OpenLearn (Open University)", description: "Free Open University courses, articles and interactives - over 1,000 topics, badges and certificates of participation.", url: "https://www.open.edu/openlearn/", tags: ["UK", "Free"] },
      { name: "OpenClassrooms", description: "Online diplomas and bachelor's/master's-level programmes with mentor support, recognised across Europe.", url: "https://openclassrooms.com/en/", tags: ["Mentored", "Diplomas"] },
    ],
  },
  {
    slug: "cv-tips",
    title: "CV Tips",
    description: "Stand out on paper and online. Practical guides to writing a CV that gets read, passing ATS filters and making a great first impression.",
    icon: learningEmployability,
    watch: [
      { name: "How to Write a CV in 2024 (YouTube - Thomas Frank)", description: "Step-by-step walkthrough of a modern, effective CV with real examples.", url: "https://www.youtube.com/watch?v=y8YH0Qbu5h4" },
      { name: "ATS Resume Tips - Beat the Bots (YouTube - Jeff Su)", description: "How applicant tracking systems work and exactly how to format your CV to get past them.", url: "https://www.youtube.com/watch?v=9Gvz4_WExNs" },
      { name: "LinkedIn Learning - Writing a Great CV", description: "Short professional course on CV structure, language and what recruiters look for.", url: "https://www.linkedin.com/learning/topics/resume-writing" },
    ],
    listen: [
      { name: "Squiggly Careers - How to write a CV that works", description: "Practical episode on CVs, covering modern formats, what to include and how to tailor for roles.", url: "https://open.spotify.com/show/2JCRlgjewZqdgpovS3e8GA" },
      { name: "The Job Interview Experience", description: "Covers CVs, cover letters and interview prep from both sides of the table.", url: "https://open.spotify.com/show/3PCG3N9RqZOd2V0mcfTQUQ" },
    ],
    read: [
      { name: "TotalJobs - CV Guide", description: "UK's most comprehensive CV writing guide - formats, examples and what employers want to see.", url: "https://www.totaljobs.com/advice/cv-advice" },
      { name: "Reed.co.uk - CV Tips", description: "Recruiter-backed advice on CVs, covering length, structure, skills sections and common mistakes.", url: "https://www.reed.co.uk/career-advice/cv-advice/" },
      { name: "Guardian Careers - CV advice", description: "Practical articles from the Guardian on standout CVs, LinkedIn and job applications.", url: "https://www.theguardian.com/careers/cv" },
    ],
    help: [
      { name: "Howdoyoudo? CV Builder", description: "Build a tailored, industry-specific CV with our AI-powered builder.", url: "/cv-builder", tags: ["Tool", "Free"] },
      { name: "Vizzy", description: "Free visual CV builder with smart templates — looks great and takes minutes.", url: "https://vizzy.com/", tags: ["Design", "Free"] },
      { name: "National Careers Service - CV builder", description: "Free UK government CV builder with templates, tips and downloadable formats.", url: "https://nationalcareers.service.gov.uk/get-a-job/cv-sections", tags: ["Free", "UK"] },
      { name: "TopCV - Free CV review", description: "Submit your CV for a free expert review with actionable feedback.", url: "https://www.topcv.co.uk/free-cv-review", tags: ["Free", "Review"] },
      { name: "Save the Student - CV Tips", description: "Templates and advice tuned to UK employers and students.", url: "https://www.savethestudent.org/jobs/how-to-write-a-cv.html", tags: ["Students"] },
    ],
  },
  {
    slug: "volunteering",
    title: "Volunteering",
    description: "Build real skills, find your community and make a difference. Volunteering is one of the fastest ways to gain experience, references and confidence — whatever stage you're at.",
    icon: learningMentoring,
    watch: [
      { name: "Why volunteer? The surprising benefits (TED)", description: "TED playlist on social impact, purpose-driven work and why volunteering changes you more than you expect.", url: "https://www.ted.com/topics/volunteering" },
      { name: "Do IT - Volunteering for your career (YouTube)", description: "How volunteering builds employability, fills CV gaps and opens unexpected doors.", url: "https://www.youtube.com/@doitnow" },
      { name: "NCVO - Volunteering guides", description: "The National Council for Voluntary Organisations' practical videos on getting into volunteering.", url: "https://www.ncvo.org.uk/get-involved/volunteering/" },
    ],
    listen: [
      { name: "Social Impact with Dora Petherbridge", description: "Conversations about careers in charity, social enterprise and volunteering — what it's really like.", url: "https://open.spotify.com/show/0iJR8cTiAi4k23ZHFMFm8h" },
      { name: "Squiggly Careers - Building experience outside work", description: "Episode on how volunteering, side projects and community roles all count as real experience.", url: "https://open.spotify.com/show/2JCRlgjewZqdgpovS3e8GA" },
    ],
    read: [
      { name: "NCVO - What is volunteering?", description: "Everything you need to know about volunteering in the UK — rights, benefits and how to find the right role.", url: "https://www.ncvo.org.uk/get-involved/volunteering/" },
      { name: "Volunteering Matters", description: "UK volunteering charity — articles on the impact of volunteering at different life stages.", url: "https://volunteeringmatters.org.uk" },
      { name: "CharityJob - Volunteer roles guide", description: "How to find, apply for and make the most of voluntary roles in the UK charity sector.", url: "https://www.charityjob.co.uk/careeradvice/volunteer-roles/" },
    ],
    help: [
      { name: "Do IT", description: "The UK's largest volunteering platform — thousands of opportunities from big charities and local community groups.", url: "https://doit.life/volunteer", tags: ["UK", "Find roles"] },
      { name: "Volunteering Matters", description: "UK charity connecting volunteers with meaningful community projects, especially for young people and those facing barriers.", url: "https://volunteeringmatters.org.uk", tags: ["UK", "Young people"] },
      { name: "CharityJob - Volunteer roles", description: "Search hundreds of UK volunteer opportunities across every cause area.", url: "https://www.charityjob.co.uk/volunteer-jobs", tags: ["UK", "Find roles"] },
      { name: "Studenteer", description: "Matches students and recent grads with remote, skills-based volunteering placements at charities - includes mentorship, workshops and webinars along the way.", url: "https://studenteer.co.uk", tags: ["UK", "Students", "Remote"] },
    ],
  },
  {
    slug: "resilience-confidence",
    title: "Resilience & Confidence",
    description: "Rejection is part of the process. Build the mental toolkit to bounce back, back yourself and keep going — even when it feels like it's not working.",
    icon: learningEmployability,
    watch: [
      { name: "Angela Duckworth - Grit: The power of passion and perseverance (TED)", description: "The most-watched talk on why persistence matters more than talent. A must-watch.", url: "https://www.youtube.com/watch?v=H14bBuluwB8" },
      { name: "Brené Brown - The power of vulnerability (TED)", description: "On courage, shame, and why letting yourself be seen is the foundation of confidence.", url: "https://www.youtube.com/watch?v=iCvmsMzlF7o" },
      { name: "Amy Cuddy - Your body language may shape who you are (TED)", description: "How posture and presence affect your confidence and how others see you.", url: "https://www.youtube.com/watch?v=Ks-_Mh1QhMc" },
    ],
    listen: [
      { name: "Squiggly Careers - Dealing with setbacks and rejection", description: "UK career podcast episodes specifically on resilience, handling rejection and building confidence at work.", url: "https://open.spotify.com/show/2JCRlgjewZqdgpovS3e8GA" },
      { name: "Dare to Lead with Brené Brown", description: "Conversations on courage, vulnerability and showing up in work and life.", url: "https://open.spotify.com/show/3oEPsPKDhPVoNNL7pH5db6" },
      { name: "The Resilience Project Podcast", description: "Stories and practical tools for building gratitude, empathy and mindfulness.", url: "https://open.spotify.com/show/3Hkzz0P10lG0e0T4IEjBVj" },
    ],
    read: [
      { name: "Mind - How to cope with rejection", description: "Mental health charity's guide to handling rejection, self-esteem and staying well during job searching.", url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/self-esteem/" },
      { name: "Young Minds - Building resilience", description: "UK youth mental health charity with practical guides on resilience, stress and self-belief for young people.", url: "https://www.youngminds.org.uk/young-person/coping-with-life/building-resilience/" },
      { name: "Verywell Mind - Rejection sensitive dysphoria", description: "How to understand your emotional response to rejection and build healthier coping strategies.", url: "https://www.verywellmind.com/rejection-sensitive-dysphoria-4587099" },
    ],
    help: [
      { name: "Mind", description: "UK mental health charity offering advice, support and resources on all aspects of mental wellbeing.", url: "https://www.mind.org.uk", tags: ["Mental health", "UK"] },
      { name: "Young Minds", description: "The UK's leading charity fighting for young people's mental health — helpline, resources and campaigns.", url: "https://www.youngminds.org.uk", tags: ["Young people", "UK"] },
      { name: "The Mix", description: "Free support for under 25s in the UK — mental health, relationships, money, jobs and more. Chat, phone or email.", url: "https://www.themix.org.uk", tags: ["Under 25", "Free", "UK"] },
    ],
  },
  {
    slug: "neurodiversity-disability",
    title: "Neurodiversity & Disability",
    description: "Support, resources and job opportunities for neurodivergent people and those with disabilities — from career coaching to inclusive employers actively looking for you.",
    icon: learningMentoring,
    watch: [
      { name: "ADHD Foundation (YouTube)", description: "Videos on understanding ADHD in education and the workplace, and how to thrive with neurodivergent traits.", url: "https://www.youtube.com/@ADHDFoundation" },
      { name: "Ambitious About Autism (YouTube)", description: "Films and guides on employment, education and life for autistic people and their families.", url: "https://www.youtube.com/@AmbitiousAboutAutism" },
      { name: "Neurodiversity in the Workplace - TEDx", description: "Personal stories and practical insight into how neurodivergent people bring distinct strengths to work.", url: "https://www.youtube.com/results?search_query=neurodiversity+workplace+tedx" },
    ],
    listen: [
      { name: "ADHD reWired Podcast", description: "Practical strategies for managing ADHD at work and in life — hugely popular in the neurodivergent community.", url: "https://open.spotify.com/search/adhd%20rewired" },
      { name: "Autism & ADHD at Work (Exceptional Individuals Podcast)", description: "First-hand stories and expert advice on navigating the workplace as a neurodivergent person.", url: "https://open.spotify.com/search/exceptional%20individuals%20neurodiversity" },
      { name: "The Disability Download (Scope)", description: "Conversations on disability, employment, rights and lived experience from the UK disability charity Scope.", url: "https://open.spotify.com/search/disability%20download%20scope" },
    ],
    read: [
      { name: "National Autistic Society - Employment", description: "Comprehensive guidance for autistic jobseekers — finding the right role, requesting reasonable adjustments, and what support you're entitled to at work.", url: "https://www.autism.org.uk/advice-and-guidance/employment" },
      { name: "Exceptional Individuals - Resources", description: "Practical articles and guides on neurodiversity at work, disclosure, adjustments and how to present your strengths to employers.", url: "https://exceptionalindividuals.com/about-us/blog/" },
      { name: "Scope - Employment support", description: "UK disability charity with guides on rights, adjustments, Access to Work funding and navigating the job market as a disabled person.", url: "https://www.scope.org.uk/advice-and-support/career-and-employment/" },
      { name: "ACAS - Disability at work", description: "Official UK workplace guidance on disability discrimination, reasonable adjustments and your legal rights as a disabled employee.", url: "https://www.acas.org.uk/disability-at-work" },
    ],
    help: [
      { name: "Exceptional Individuals", description: "UK neurodiversity recruitment and career coaching specialists — helping people with ADHD, autism, dyslexia and dyspraxia find roles with inclusive employers.", url: "https://exceptionalindividuals.com", tags: ["Neurodiversity", "UK", "Jobs"] },
      { name: "Evenbreak", description: "The only global disability job board run by and for people with lived experience of disability — connects disabled candidates with employers who genuinely want to hire them.", url: "https://www.evenbreak.com/uk/", tags: ["Disability", "Jobs", "UK"] },
      { name: "Neurodiversity Jobs UK", description: "Specialist job board connecting neurodivergent, autistic and ADHD professionals with employers who actively seek diverse talent.", url: "https://neurodiversityjobs.co.uk", tags: ["Neurodiversity", "Jobs", "UK"] },
      { name: "Disability Jobs UK", description: "Careers platform connecting disabled jobseekers with Disability Confident employers committed to inclusive hiring.", url: "https://disabilityjob.co.uk", tags: ["Disability", "Jobs", "UK"] },
      { name: "National Autistic Society", description: "The UK's leading autism charity — employment support, reasonable adjustment guidance, and a directory of autism-friendly employers.", url: "https://www.autism.org.uk/advice-and-guidance/employment", tags: ["Autism", "Free", "UK"] },
      { name: "Access to Work (Gov.uk)", description: "Government grant scheme that pays for practical support to help disabled people and those with health conditions start or stay in work — up to £69,260 a year.", url: "https://www.gov.uk/access-to-work", tags: ["Funding", "Government", "UK"] },
      { name: "Scope", description: "UK disability charity offering employment advice, helpline support and information on your workplace rights.", url: "https://www.scope.org.uk", tags: ["Disability", "UK", "Free"] },
    ],
  },
  {
    slug: "music-industry",
    title: "Music Industry",
    description: "From songwriting and production to touring and festival management. Resources for careers across recorded music, live events, publishing, artist management and music tech.",
    icon: learningCareers,
    watch: [
      { name: "The Music Business Explainer (YouTube)", description: "Clear, visual breakdowns of how record labels, publishing, streaming and live music actually work.", url: "https://www.youtube.com/@TheMusicBusinessExplainer" },
      { name: "Rick Beato - How the Music Industry Works", description: "In-depth analysis of the music business - contracts, publishing, streaming economics and artist rights.", url: "https://www.youtube.com/@RickBeato" },
      { name: "Ari Herstand - The New Music Business (YouTube)", description: "Practical guides for independent artists - contracts, distribution, touring and DIY label operation.", url: "https://www.youtube.com/results?search_query=ari+herstand+music+business" },
      { name: "Abbey Road Institute - Career paths (YouTube)", description: "Short films on roles from studio engineering to live sound to music production.", url: "https://www.youtube.com/@AbbeyRoadInstitute" },
      { name: "Pensado's Place (YouTube)", description: "Interviews with producers, engineers and artists on creating music and running studios.", url: "https://www.youtube.com/@PensadosPlace" },
    ],
    listen: [
      { name: "The New Music Business with Ari Herstand (Podcast)", description: "The #1 podcast for navigating the modern music industry - contracts, rights, distribution, DIY artist strategy.", url: "https://shows.acast.com/thenewmusicbusiness" },
      { name: "Music Business Worldwide Podcast", description: "Global music industry news, deals and insight from the leading music business publication.", url: "https://www.musicbusinessworldwide.com" },
      { name: "Tape Notes (Podcast)", description: "Producers and artists break down how iconic records were made - studio insights and creative decision-making.", url: "https://www.tapenotes.co.uk/" },
      { name: "The Music Entrepreneur Code (Podcast)", description: "Strategies for independent musicians and producers building sustainable careers.", url: "https://open.spotify.com/show/3tSgd9tY0vt4qGxRdLJqCM" },
    ],
    read: [
      { name: "Music Week", description: "The UK's leading music industry publication - news, analysis and business insight.", url: "https://www.musicweek.com" },
      { name: "Musico - Career guides", description: "In-depth guides to music careers - roles, salary data, how to get into different sectors.", url: "https://musico.org" },
      { name: "The Unspoken Rules of Music PR (LinkedIn Article)", description: "Insight into how PR and publicity actually works in the music industry.", url: "https://www.linkedin.com" },
      { name: "UK Music - Skills Academy", description: "The industry body's career resources, skills pathways and sector data.", url: "https://www.ukmusic.org/skills-academy/" },
    ],
    help: [
      { name: "Doors Open", description: "The UK's main music industry job board - venues, festivals, promoters, labels, studios.", url: "https://www.doorsopen.co", tags: ["Jobs", "UK"] },
      { name: "Music Careers", description: "Specialist platform for music industry roles and opportunities.", url: "https://www.musiccareers.co", tags: ["Jobs", "Music"] },
      { name: "Music Jobs UK", description: "UK-focused board covering labels, venues, festivals and session work.", url: "https://www.music-jobs.com/uk", tags: ["Jobs", "UK"] },
      { name: "Berklee Online - Music Business Certificate", description: "Accredited certificate course in music business fundamentals - distribution, licensing, publishing and artist management.", url: "https://online.berklee.edu", tags: ["Course", "Online"] },
      { name: "Coursera - Music Production Specialisation", description: "Learn music production, mixing and mastering from top studios and educators.", url: "https://www.coursera.org/specializations/music-production", tags: ["Course", "Free option"] },
      { name: "Abbey Road Institute", description: "Specialist training in audio engineering, music production and studio technology - London-based and online programmes.", url: "https://www.abbeyroadinstitute.com", tags: ["UK", "Training"] },
      { name: "IMRO - Irish Music Rights", description: "Music licensing and royalties guidance for creators and performers.", url: "https://www.imro.ie", tags: ["Rights", "Royalties"] },
      { name: "PRS for Music", description: "UK's music licensing and royalties body - guides on collecting music rights and understanding publishing.", url: "https://www.prsformusic.com", tags: ["Rights", "UK"] },
      { name: "Access All - Artist Support", description: "UK charity supporting emerging artists with mentorship, funding and industry connections.", url: "https://www.access-all.org.uk", tags: ["Artists", "UK", "Support"] },
    ],
  },
];

export const getResourceTopic = (slug: string) =>
  RESOURCE_TOPICS.find((t) => t.slug === slug);
