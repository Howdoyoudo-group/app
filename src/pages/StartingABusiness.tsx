import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Rocket,
  BookOpen,
  Play,
} from "lucide-react";
import learningStartups from "@/assets/learning-startups.png";
import learningEmployability from "@/assets/learning-employability.png";
import learningMoney from "@/assets/learning-money.png";
import learningCareers from "@/assets/learning-careers.png";
import learningApprenticeships from "@/assets/learning-apprenticeships.png";
import learningEducation from "@/assets/learning-education.png";
import learningMentoring from "@/assets/learning-mentoring.png";
import tabWatch from "@/assets/tab-watch.png";
import tabListen from "@/assets/tab-listen.png";
import tabRead from "@/assets/tab-read.png";
import tabWho from "@/assets/tab-who.png";
import PodcastGrid from "@/components/PodcastGrid";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

type TabId = "watch" | "listen" | "read" | "help";

const TAB_ICONS: Record<TabId, string> = {
  watch: tabWatch,
  listen: tabListen,
  read: tabRead,
  help: tabWho,
};

const TAB_LABELS: Record<TabId, string> = {
  watch: "Watch",
  listen: "Listen",
  read: "Read",
  help: "Help",
};

interface ResourceLink {
  title: string;
  url: string;
  description: string;
}

interface Section {
  doodle: string;
  title: string;
  intro: string;
  watch: ResourceLink[];
  listen: ResourceLink[];
  read: ResourceLink[];
  help: ResourceLink[];
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/* ── helpers (mirroring ResourceTopic) ───────────────── */
const getYouTubeVideoId = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};
const getYouTubeHandle = (url: string): string | null => {
  const m = url.match(/youtube\.com\/@([A-Za-z0-9_.-]+)/);
  return m ? m[1] : null;
};
const stringToHue = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
};
const getDomain = (url: string): string | null => {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
};

const WatchCard = ({ res }: { res: ResourceLink }) => {
  const videoId = getYouTubeVideoId(res.url);
  const handle = getYouTubeHandle(res.url);
  const hue = stringToHue(res.title);
  const thumb = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : handle
    ? `https://unavatar.io/youtube/${handle}`
    : null;
  return (
    <a
      href={res.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-2 border-border hover:border-primary transition-all group overflow-hidden bg-foreground/5"
    >
      <div className="relative aspect-video overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={res.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 25%), hsl(${(hue + 40) % 360}, 50%, 15%))` }}
          />
        )}
        <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors leading-snug">
          {res.title}
        </h3>
        <p className="text-muted-foreground font-body text-xs mt-1 line-clamp-2">
          {res.description}
        </p>
      </div>
    </a>
  );
};

const TextCard = ({ res }: { res: ResourceLink }) => {
  const domain = getDomain(res.url);
  const [logoIdx, setLogoIdx] = useState(0);
  const logoSources = domain
    ? [
        `https://logo.clearbit.com/${domain}`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      ]
    : [];
  const logo = logoSources[logoIdx] ?? null;
  return (
    <a
      href={res.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 border border-border hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        {logo && (
          <div className="w-12 h-12 shrink-0 border border-border bg-background flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt=""
              className="w-full h-full object-contain p-1"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => { if (logoIdx < logoSources.length - 1) setLogoIdx(logoIdx + 1); }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-700 text-sm text-foreground group-hover:text-primary transition-colors">
              {res.title}
            </h3>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
          </div>
          <p className="text-muted-foreground font-body text-xs leading-relaxed mt-1.5">
            {res.description}
          </p>
        </div>
      </div>
    </a>
  );
};

const SECTIONS: Section[] = [
  {
    doodle: learningStartups,
    title: "Idea Generation",
    intro:
      "Every business starts with an idea. The best ones solve a real problem you've experienced yourself. These resources help you brainstorm, validate, and refine your concept before committing time and money.",
    watch: [
      { title: "How to Get Startup Ideas - Paul Graham (Y Combinator)", url: "https://www.youtube.com/watch?v=uvw-u99yj8w", description: "The classic talk on finding ideas worth building - start with problems you have yourself." },
      { title: "How to Validate Your Startup Idea", url: "https://www.youtube.com/watch?v=C27RVio2rOs", description: "Y Combinator's framework for testing whether an idea will actually work." },
      { title: "Steven Bartlett - How to Spot a Business Opportunity", url: "https://www.youtube.com/@TheDiaryOfACEO", description: "Diary of a CEO: founders explain how they spotted their idea." },
    ],
    listen: [
      { title: "How I Built This with Guy Raz", url: "https://open.spotify.com/show/6E709HRH7XaiZrMfgtNCun", description: "Founders tell the story of how their idea became a business." },
      { title: "The Diary of a CEO - Steven Bartlett", url: "https://open.spotify.com/show/7iQXmUT7XGuZSzAMjoNWlX", description: "UK founder interviews - often start with the lightbulb moment." },
      { title: "Secret Leaders", url: "https://open.spotify.com/show/2IwIk50zNhVsgK0rQRSik7", description: "UK podcast with founders of Monzo, Bulb, Zoopla and others on early ideas." },
    ],
    read: [
      { title: "Start Up Loans - Business Ideas", url: "https://www.startuploans.co.uk/business-ideas", description: "Government-backed inspiration hub with hundreds of UK business ideas and guides." },
      { title: "Gov.uk - Start a Business Guide", url: "https://www.business.gov.uk/start/", description: "Official government step-by-step guidance for starting a business in the UK." },
      { title: "Enterprise Nation - Start a Business", url: "https://www.enterprisenation.com/learn-something/start-a-business/", description: "UK's largest small business community with free guides on turning ideas into reality." },
    ],
    help: [
      { title: "King's Trust - Enterprise Programme", url: "https://www.kingstrust.org.uk/how-we-can-help/support-starting-business", description: "Free mentoring, funding and support for 18–30-year-olds developing a business idea." },
      { title: "British Library - Business & IP Centre", url: "https://www.bl.uk/business-and-ip-centre", description: "Free workshops, market research data and 1-1 advice in libraries across the UK." },
    ],
  },
  {
    doodle: learningEducation,
    title: "How to Use AI",
    intro:
      "AI tools like ChatGPT, Claude, and Gemini can dramatically accelerate every stage of building a business - from market research to writing copy, building websites, and automating operations.",
    watch: [
      { title: "HubSpot - AI for Small Business", url: "https://www.youtube.com/@HubSpotMarketing", description: "HubSpot's channel covering practical AI workflows for small business owners." },
      { title: "Building a Business with AI - Greg Isenberg", url: "https://www.youtube.com/@GregIsenberg", description: "Channel dedicated to using AI to find ideas and build startups solo." },
      { title: "Lovable - Build a Business in an Hour", url: "https://www.youtube.com/@lovable", description: "Build and ship real products using AI - no code required." },
    ],
    listen: [
      { title: "The AI Daily Brief", url: "https://open.spotify.com/show/7gKwwMLFLc6RmjmRpbMtEO", description: "Daily 15-minute briefing on what's happening in AI for business." },
      { title: "Lenny's Podcast", url: "https://open.spotify.com/show/2dR1MUZEHCOnz1LVfNac0j", description: "Frequent AI-for-product episodes from operators using AI day to day." },
    ],
    read: [
      { title: "Start Up Loans - Using AI to Start a Business", url: "https://www.startuploans.co.uk/support-and-guidance/business-guidance/starting-up/using-ai-to-start-a-business", description: "Practical guide covering how AI can help with market research, branding, content, and operations." },
      { title: "HSBC - Generative AI Guide for Small Business", url: "https://www.business.hsbc.uk/en-gb/insights/growing-my-business/unlocking-the-power-of-generative-ai-a-practical-guide-for-small-business-leaders", description: "A practical guide covering how small businesses can use generative AI effectively." },
      { title: "Halo Tech Lab - AI for Small Business UK (2026)", url: "https://halotechlab.com/blog/ai-for-small-business-uk-guide", description: "Everything UK small business owners need to know about AI - what it costs, where to start, and common pitfalls." },
    ],
    help: [
      { title: "Google for Small Business - AI Tools", url: "https://smallbusiness.withgoogle.com/ai/", description: "Google's free AI toolkit for small businesses including Gemini and Workspace." },
      { title: "Microsoft Copilot for Small Business", url: "https://www.microsoft.com/en-gb/microsoft-copilot/for-small-business", description: "AI assistant integrated into Microsoft 365 for emails, documents and admin." },
    ],
  },
  {
    doodle: learningCareers,
    title: "Business Plans",
    intro:
      "A business plan forces you to think critically about your market, your numbers, and your strategy. You'll need one for funding, but even if you're bootstrapping, the exercise is invaluable.",
    watch: [
      { title: "How to Write a Business Plan - Step by Step", url: "https://www.youtube.com/watch?v=Fqch5OrUPvA", description: "Clear walkthrough of every section a UK business plan needs." },
      { title: "Ash Maurya - Creator of the Lean Canvas", url: "https://www.youtube.com/@AshMaurya", description: "The 1-page alternative to traditional business plans, explained by its creator." },
    ],
    listen: [
      { title: "The Small Business Big Marketing Podcast - Tim Reid", url: "https://open.spotify.com/show/6IF6mlyCYMM3I5O4OjSTdq", description: "Award-winning interviews with founders on planning, positioning and building a real business." },
      { title: "The Tim Ferriss Show - Founder Episodes", url: "https://open.spotify.com/show/5qSUyCrk9KR69lEiXbjwXM", description: "Long-form interviews where founders unpack their early plans and pivots." },
    ],
    read: [
      { title: "Start Up Loans - Business Plan Template", url: "https://www.startuploans.co.uk/support-and-guidance/business-guidance/starting-up/business-plan-template", description: "Free downloadable business plan template from the government-backed programme." },
      { title: "Gov.uk - Write a Business Plan", url: "https://www.gov.uk/write-business-plan", description: "Official government guidance on what to include in your business plan." },
      { title: "British Library - Business Plan Resources", url: "https://www.bl.uk/business-and-ip-centre/articles/write-your-business-plan", description: "Free workshops, one-to-one support, and market research data from the BIPC network." },
    ],
    help: [
      { title: "King's Trust - Writing a Business Plan", url: "https://www.kingstrust.org.uk/how-we-can-help/tools-resources/business-tools/business-plans", description: "Step-by-step guide and template specifically designed for young entrepreneurs." },
      { title: "Enterprise Nation - Plan & Pitch Advisers", url: "https://www.enterprisenation.com/marketplace/", description: "Find a UK adviser to review your plan or pitch deck." },
    ],
  },
  {
    doodle: learningMoney,
    title: "How Funding Works",
    intro:
      "The UK has some of the most generous tax incentive schemes in the world for early-stage investment. Understanding SEIS, EIS, grants, angel networks, and crowdfunding is essential before you raise money.",
    watch: [
      { title: "SeedLegals - UK SEIS & EIS Explained", url: "https://www.youtube.com/@SeedLegals", description: "Plain-English explainers on the UK's two main investor tax-relief schemes from the SEIS specialists." },
      { title: "Y Combinator - Startup Lectures & Pitch Advice", url: "https://www.youtube.com/@ycombinator", description: "How to structure and deliver a fundraising pitch that actually closes." },
      { title: "Crowdcube - Equity Crowdfunding Explained", url: "https://www.youtube.com/@Crowdcube", description: "How UK companies raise from the crowd - case studies and how-tos." },
    ],
    listen: [
      { title: "The Twenty Minute VC (20VC) - Harry Stebbings", url: "https://open.spotify.com/show/3j2KMcZTtgTNBKwtZBMHvl", description: "The leading UK podcast on venture capital - how investors think and what they back." },
      { title: "Virgin StartUp Changemakers", url: "https://open.spotify.com/show/51gRhDxE1TPstTmJ8yvgRY", description: "Virgin StartUp's founder interviews on raising and scaling in the UK." },
    ],
    read: [
      { title: "British Business Bank - SEIS Explained", url: "https://www.british-business-bank.co.uk/business-guidance/guidance-articles/finance/what-is-the-seed-enterprise-investment-scheme-seis", description: "Official guide to SEIS - investors get 50% income tax relief on up to £200k." },
      { title: "SEIS & EIS Tax Relief Guide - BackerIQ (2026)", url: "https://backeriq.com/guides/seis-eis-tax-relief-guide", description: "SEIS gives 50% tax relief, EIS gives 30%. Comprehensive guide for founders and investors." },
      { title: "Grantify - UK Startup Funding Guide (2026)", url: "https://www.grantify.io/articles/startup-funding-guide", description: "Covers grants, equity, non-dilutive options and how to secure each type." },
    ],
    help: [
      { title: "British Business Bank", url: "https://www.british-business-bank.co.uk/", description: "The UK government's business development bank - Start Up Loans and Growth Guarantee Scheme." },
      { title: "Start Up Loans - Government Loans up to £25,000", url: "https://www.startuploans.co.uk/", description: "Government-backed personal loans at 6% fixed interest, plus 12 months of free mentoring." },
      { title: "UK Business Angels Association (UKBAA)", url: "https://ukbaa.org.uk/", description: "The national trade body for angel and early-stage investment - find networks and events near you." },
      { title: "SFC Capital - UK's Leading SEIS Fund", url: "https://sfccapital.com/seis-funds", description: "The UK's largest SEIS fund, investing in highly innovative early-stage businesses." },
      { title: "Angel Academe - EIS Fund (Female Founders)", url: "https://www.angelacademe.com/eis-fund", description: "The UK's first EIS fund focused on female founders." },
      { title: "Crowdfunder UK", url: "https://www.crowdfunder.co.uk/", description: "The UK's leading crowdfunding platform for rewards-based and community fundraising." },
      { title: "Seedrs (Republic Europe) - Equity Crowdfunding", url: "https://www.seedrs.com/", description: "Equity crowdfunding platform where you can raise investment from the public." },
      { title: "Innovate UK - Grants & Innovation Funding", url: "https://www.ukri.org/councils/innovate-uk/", description: "Government grants for innovative businesses - no equity given away." },
      { title: "King's Trust - Enterprise Funding", url: "https://www.kingstrust.org.uk/how-we-can-help/support-starting-business", description: "Grants and low-interest loans for 18–30-year-olds plus free mentoring." },
    ],
  },
  {
    doodle: learningApprenticeships,
    title: "Setting Up a Company",
    intro:
      "Sole trader, limited company, LLP, or CIC? Each structure has different tax, liability, and administrative implications. Getting this right from the start saves headaches later.",
    watch: [
      { title: "Gov.uk - Choosing Your Business Structure", url: "https://www.youtube.com/@GovUK", description: "Official Gov.uk guidance on sole trader vs limited company vs partnership." },
      { title: "HMRC - Setting Up & Running a Business", url: "https://www.youtube.com/@HMRCgovuk", description: "Official HMRC walk-throughs on registering, tax and incorporating with Companies House." },
    ],
    listen: [
      { title: "The Small Business Big Marketing Show", url: "https://open.spotify.com/show/6IF6mlyCYMM3I5O4OjSTdq", description: "Episodes on legal structure, banking and the early admin of a new business." },
    ],
    read: [
      { title: "Gov.uk - Set Up a Business", url: "https://www.gov.uk/set-up-business", description: "Official guidance on choosing your business structure and registering with HMRC." },
      { title: "Gov.uk - Business Structures Compared", url: "https://www.gov.uk/business-legal-structures", description: "Side-by-side comparison of sole trader, partnership, LLP, and limited company." },
      { title: "HMRC - Register for Self Assessment", url: "https://www.gov.uk/register-for-self-assessment", description: "If you're a sole trader or in a partnership, register here to file your tax return." },
    ],
    help: [
      { title: "Companies House - Incorporate Online", url: "https://www.gov.uk/limited-company-formation", description: "Register a limited company for £12 - usually processed within 24 hours." },
      { title: "Tide - Free Business Bank Account", url: "https://www.tide.co/", description: "Open a free business bank account in minutes - required for limited companies." },
      { title: "Starling Bank for Business", url: "https://www.starlingbank.com/business-account/", description: "Free UK business banking with strong app, multi-user access and integrations." },
    ],
  },
  {
    doodle: learningMentoring,
    title: "Employing People",
    intro:
      "Hiring your first employee is a big milestone. You'll need to set up PAYE, understand employment law, pension auto-enrolment, and your responsibilities as an employer.",
    watch: [
      { title: "HMRC - Becoming an Employer", url: "https://www.youtube.com/@HMRCgovuk", description: "Official HMRC channel covering what you legally have to do before someone's first payday." },
      { title: "Gov.uk - Employing People Guides", url: "https://www.youtube.com/@GovUK", description: "Government walk-throughs on contracts, payroll and your duties as a UK employer." },
    ],
    listen: [
      { title: "At The Table with Patrick Lencioni", url: "https://open.spotify.com/show/6NWAZzkzl4ljxX7S2xkHvu", description: "Practical leadership advice on hiring, team health and getting culture right from day one." },
    ],
    read: [
      { title: "Gov.uk - Employing People", url: "https://www.gov.uk/browse/employing-people", description: "Everything you need to know about hiring, contracts, payroll, and dismissal." },
      { title: "Gov.uk - Set Up PAYE", url: "https://www.gov.uk/paye-for-employers", description: "Register as an employer and set up Pay As You Earn before your first payday." },
      { title: "HMRC - Employment Allowance", url: "https://www.gov.uk/claim-employment-allowance", description: "Claim up to £5,000 off your employer NI contributions each year." },
    ],
    help: [
      { title: "ACAS - Starting Staff for the First Time", url: "https://www.acas.org.uk/taking-on-a-new-employee", description: "Free, impartial advice on employment rights, contracts and workplace relations." },
      { title: "The Pensions Regulator - Auto-Enrolment", url: "https://www.thepensionsregulator.gov.uk/en/employers", description: "Your legal duty to provide a workplace pension - even with just one employee." },
      { title: "Breathe HR - Small Business HR Software", url: "https://www.breathehr.com/", description: "UK HR platform built for small businesses - holiday, sickness and document storage." },
    ],
  },
  {
    doodle: learningEducation,
    title: "Legal & Compliance",
    intro:
      "From data protection to insurance, there are legal requirements every new business must meet. Getting proper advice early can prevent costly mistakes.",
    watch: [
      { title: "ICO - UK Data Protection Channel", url: "https://www.youtube.com/@ICOnews", description: "The official UK Information Commissioner's Office channel - what you have to do to comply with UK GDPR." },
      { title: "UK IPO - Trademarks, Patents & Copyright", url: "https://www.youtube.com/@TheIPO", description: "The official UK Intellectual Property Office channel explaining the three main forms of IP protection." },
    ],
    listen: [
      { title: "The Legal Cheek Podcast", url: "https://open.spotify.com/show/1Qs92UBOWNJhO8ZeLmiiO7", description: "UK legal news, market insight and commercial awareness for business owners." },
    ],
    read: [
      { title: "Gov.uk - Intellectual Property", url: "https://www.gov.uk/browse/business/intellectual-property", description: "Protect your brand, inventions and creative works with trademarks, patents and copyright." },
      { title: "Legal Foundations - UK Startup Legal Guide", url: "https://legalfoundations.org.uk/guide/startup-fundraising-seis-eis-uk/", description: "Clear legal guidance on fundraising documents, shareholder agreements, and cap tables." },
    ],
    help: [
      { title: "ICO - Data Protection for Small Businesses", url: "https://ico.org.uk/for-organisations/sme-web-hub/", description: "Free tools and checklists to help you comply with UK GDPR." },
      { title: "Gov.uk - Business Insurance", url: "https://www.gov.uk/browse/business/business-insurance", description: "What insurance you legally need and what's recommended for your business type." },
      { title: "LawBite - Affordable Online UK Lawyers", url: "https://www.lawbite.co.uk/", description: "Online legal advice and contract templates for small businesses." },
    ],
  },
  {
    doodle: learningEmployability,
    title: "Growing & Scaling",
    intro:
      "Once you've validated your idea and found customers, scaling requires a different mindset. These resources cover marketing, digital tools, mentoring, and accelerator programmes.",
    watch: [
      { title: "Growth Institute - Scaling Up Methodology", url: "https://www.youtube.com/@growthinstitute", description: "The official channel for Verne Harnish's Scaling Up methodology - disciplines that separate growing companies from stuck ones." },
      { title: "Y Combinator - How to Get Your First 100 Customers", url: "https://www.youtube.com/watch?v=yP176MBG9Tk", description: "Tactical advice on early-stage growth from YC partners." },
    ],
    listen: [
      { title: "Masters of Scale - Reid Hoffman", url: "https://open.spotify.com/show/1bJRgaFZHuzifad4IAApFR", description: "LinkedIn co-founder interviews founders on the counter-intuitive moves that scaled them." },
      { title: "My First Million", url: "https://open.spotify.com/show/3mliji9352UAk3XnWElnDV", description: "Two operators riff on growth, scaling and breakout business ideas." },
    ],
    read: [
      { title: "Founder & Lightning - UK Accelerators Directory", url: "https://founderandlightning.com/blog/uk-startup-accelerators", description: "Comprehensive list of UK accelerator and incubator programmes." },
    ],
    help: [
      { title: "Google Digital Garage - Free Online Courses", url: "https://grow.google/intl/uk/courses-and-tools/", description: "Free certified courses in digital marketing, data and AI from Google." },
      { title: "Innovate UK - Business Growth Programmes", url: "https://www.ukri.org/councils/innovate-uk/", description: "Government innovation agency offering grants, loans and expert support for scaling businesses." },
      { title: "Be the Business - Productivity & Growth", url: "https://www.bethebusiness.com/", description: "Free mentoring and benchmarking tools to help small businesses grow faster." },
    ],
  },
];

const SectionBlock = ({ section, index }: { section: Section; index: number }) => {
  const [active, setActive] = useState<TabId>("watch");
  const tabs: TabId[] = ["watch", "listen", "read", "help"];
  const items = section[active];

  return (
    <motion.section
      id={slugify(section.title)}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="scroll-mt-24"
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={section.doodle}
          alt=""
          className="w-8 h-8 object-contain"
          style={{ filter: "brightness(0)" }}
        />
        <h2 className="font-display text-2xl md:text-3xl font-700">
          {section.title}
          <span className="text-primary">.</span>
        </h2>
      </div>
      <p className="font-body text-muted-foreground leading-relaxed mb-6 max-w-3xl">
        {section.intro}
      </p>

      <div className="grid grid-cols-4 gap-3 border-b border-border pb-6">
        {tabs.map((id) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex flex-col items-center gap-2 px-3 py-3 transition-all border-2 ${
                isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <img
                src={TAB_ICONS[id]}
                alt={TAB_LABELS[id]}
                className={`w-8 h-8 md:w-10 md:h-10 object-contain transition-opacity ${
                  isActive ? "opacity-100" : "opacity-60"
                }`}
                loading="lazy"
              />
              <span
                className={`font-display font-700 text-[11px] md:text-xs tracking-wide uppercase transition-colors ${
                  isActive ? "text-primary" : "text-foreground"
                }`}
              >
                {TAB_LABELS[id]}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          {items.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">
              We're still curating this section - check back soon.
            </p>
          ) : active === "watch" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((res) => <WatchCard key={res.url} res={res} />)}
            </div>
          ) : active === "listen" ? (
            <PodcastGrid
              podcasts={items.map((r) => ({
                title: r.title.replace(/\s*\(.*?\)\s*$/, "").replace(/\s*-.*$/, "").trim(),
                description: r.description,
                url: r.url,
              }))}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((res) => <TextCard key={res.url} res={res} />)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
};

const StartingABusiness = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative border-b-2 border-foreground bg-background overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="w-8 h-8 text-primary" />
              <span className="text-xs font-display uppercase tracking-widest text-primary">
                Advice Hub
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-900 leading-[0.95] mb-4">
              Starting a Business
              <span className="text-primary">.</span>
            </h1>
            <p className="font-display text-xl md:text-2xl font-700 leading-snug max-w-3xl mb-6">
              Going from "I've got an idea" to actually running your own thing - without the guesswork.
            </p>
            <div className="space-y-4 text-muted-foreground font-body text-base md:text-lg max-w-2xl">
              <p>
                Every square below is a part of starting up - your idea, your plan, your funding, your first hire - and inside each one we've curated the UK resources actually worth your time.
              </p>
              <p>
                Things to <span className="font-700 text-foreground">watch</span> when you've got ten minutes. Podcasts to <span className="font-700 text-foreground">listen</span> to on the bus. Articles to <span className="font-700 text-foreground">read</span> when you want to go deeper. And the <span className="font-700 text-foreground">organisations</span> that will actually help - most of them free, all of them UK.
              </p>
            </div>
          </motion.div>

          {/* Section Nav */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-8">
            {SECTIONS.map((s) => (
              <a
                key={s.title}
                href={`#${slugify(s.title)}`}
                className="group relative aspect-square border-2 border-foreground bg-background p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-primary hover:-translate-y-0.5 transition-all"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                  <img
                    src={s.doodle}
                    alt=""
                    className="w-full h-full object-contain"
                    style={{ filter: "brightness(0)" }}
                  />
                </div>
                <span className="font-display font-700 text-[11px] md:text-xs leading-tight tracking-tight text-foreground">
                  {s.title}
                </span>
              </a>
            ))}
          </div>

          <p className="text-muted-foreground font-body text-xs md:text-sm mt-6">
            Tap a square to jump to what to <span className="font-700 text-foreground">watch</span>, <span className="font-700 text-foreground">listen</span>, <span className="font-700 text-foreground">read</span> and the <span className="font-700 text-foreground">organisations</span> to know.
          </p>
        </div>
      </section>

      {/* Sections */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-16">
        {SECTIONS.map((section, idx) => (
          <SectionBlock key={section.title} section={section} index={idx} />
        ))}

        {/* CTA */}
        <div className="border-2 border-foreground p-6 md:p-10 text-center">
          <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">
            Need more help<span className="text-primary">?</span>
          </h2>
          <p className="font-body text-muted-foreground mb-6 max-w-lg mx-auto">
            Check out our industry-specific resources, or head to the Job Marketplace to find roles at
            companies you could learn from before starting your own thing.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/learning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Resources Hub
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-foreground font-display text-sm uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
            >
              Job Marketplace
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StartingABusiness;
