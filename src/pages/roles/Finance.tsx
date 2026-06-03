import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { Building2, ArrowRight, Calculator, PiggyBank, BarChart3, TrendingUp } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import CareerMap from "@/components/CareerMap";
import type { CareerStage } from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const financeInIndustries = [
  { industry: "Fashion", examples: [{ company: "Burberry", role: "Group Finance", profileUrl: "/company/burberry" }, { company: "ASOS", role: "Commercial Finance", profileUrl: "/company/asos" }, { company: "ME+EM", role: "Finance Manager", profileUrl: "/company/me-em" }], slug: "/fashion" },
  { industry: "Coffee", examples: [{ company: "Costa", role: "Financial Controller", profileUrl: "/company/costa" }, { company: "Starbucks", role: "Business Finance", profileUrl: "/company/starbucks" }, { company: "Grind", role: "Finance & Ops", profileUrl: "/company/grind" }], slug: "/coffee" },
  { industry: "Film and TV", examples: [{ company: "Netflix", role: "Content Finance", profileUrl: "/company/netflix" }, { company: "Everyman", role: "Group Finance", profileUrl: "/company/everyman" }, { company: "Curzon", role: "Financial Planning" }], slug: "/cinema" },
  { industry: "Football", examples: [{ company: "Premier League", role: "Commercial Finance", profileUrl: "/company/premier-league" }, { company: "Arsenal", role: "Finance Team" }, { company: "Tottenham", role: "Financial Reporting" }], slug: "/football" },
  { industry: "Grocery", examples: [{ company: "Tesco", role: "Group Finance", profileUrl: "/company/tesco" }, { company: "Ocado", role: "FP&A", profileUrl: "/company/ocado" }, { company: "Greggs", role: "Commercial Finance", profileUrl: "/company/greggs" }], slug: "/grocery" },
  { industry: "Charity", examples: [{ company: "Save the Children", role: "Finance & Grants", profileUrl: "/company/save-the-children" }, { company: "Oxfam", role: "Financial Reporting" }, { company: "British Red Cross", role: "Management Accounts" }], slug: "/charity" },
  { industry: "Estate Agency", examples: [{ company: "Savills", role: "Property Finance", profileUrl: "/company/savills" }, { company: "Rightmove", role: "Commercial Finance", profileUrl: "/company/rightmove" }, { company: "Purplebricks", role: "FP&A", profileUrl: "/company/purplebricks" }], slug: "/estate-agency" },
];

const careerStages: CareerStage[] = [
  {
    title: "Entry Level",
    icon: Calculator,
    roles: [
      { name: "Accounts Assistant", description: "Processes invoices, manages ledgers, and supports the finance team with day-to-day bookkeeping.", salary: "£22k–£28k" },
      { name: "Finance Graduate", description: "Rotates across finance functions including management accounts, reporting, and commercial finance.", salary: "£25k–£32k" },
      { name: "Payroll Administrator", description: "Manages employee payroll processing, tax calculations, and benefits administration.", salary: "£23k–£30k" },
      { name: "Credit Controller", description: "Manages debtor accounts, chases payments, and maintains cash flow for the business.", salary: "£24k–£30k" },
    ],
  },
  {
    title: "Mid Level",
    icon: PiggyBank,
    roles: [
      { name: "Management Accountant", description: "Prepares internal financial reports, budgets, and variance analysis to support business decisions.", salary: "£35k–£50k" },
      { name: "Financial Analyst", description: "Builds financial models, analyses performance data, and supports strategic planning and forecasting.", salary: "£35k–£52k" },
      { name: "Commercial Finance Manager", description: "Partners with commercial teams to assess profitability, pricing, and investment decisions.", salary: "£42k–£60k" },
      { name: "Tax Manager", description: "Manages tax compliance, planning, and reporting across the business and its entities.", salary: "£40k–£58k" },
      { name: "Internal Auditor", description: "Reviews financial controls, processes, and risk management frameworks to ensure compliance.", salary: "£38k–£55k" },
    ],
  },
  {
    title: "Senior Level",
    icon: BarChart3,
    roles: [
      { name: "Financial Controller", description: "Oversees all accounting operations, financial reporting, and compliance for the business.", salary: "£55k–£80k" },
      { name: "Head of FP&A", description: "Leads financial planning, forecasting, and analysis, providing strategic insights to leadership.", salary: "£60k–£85k" },
      { name: "Head of Finance", description: "Manages the finance team and function, owning budgets, reporting, and financial strategy.", salary: "£65k–£90k" },
      { name: "Treasury Manager", description: "Manages the company's cash, investments, banking relationships, and financial risk.", salary: "£55k–£78k" },
    ],
  },
  {
    title: "Leadership",
    icon: TrendingUp,
    roles: [
      { name: "Finance Director", description: "Board-level leader responsible for financial strategy, governance, and stakeholder reporting.", salary: "£85k–£130k" },
      { name: "VP of Finance", description: "Oversees multiple finance functions across regions or business units, driving financial performance.", salary: "£95k–£150k" },
      { name: "Chief Financial Officer", description: "C-suite leader accountable for all financial operations, investor relations, and capital strategy.", salary: "£130k–£250k+" },
    ],
  },
];

const podcasts = [
  { title: "Accounting Stuff", description: "Making accounting and finance concepts easy to understand for aspiring professionals.", url: "https://www.youtube.com/@AccountingStuff" },
  { title: "CFO Thought Leader", description: "In-depth conversations with CFOs about strategy, leadership, and career paths.", url: "https://www.cfothoughtleader.com/" },
  { title: "Abrdn Financial Fairness Podcast", description: "Exploring financial literacy, fairness, and the changing world of personal and corporate finance.", url: "https://www.abrdn.com/en-gb/corporate/insights/podcast" },
  { title: "The Plain Bagel", description: "Finance and economics explained clearly - from investing basics to market analysis.", url: "https://www.youtube.com/@ThePlainBagel" },
];

const articles = [
  { title: "Financial Times", source: "FT", url: "https://www.ft.com/" },
  { title: "Accountancy Age", source: "Accountancy Age", url: "https://www.accountancyage.com/" },
  { title: "ICAEW Insights", source: "ICAEW", url: "https://www.icaew.com/insights" },
  { title: "CIMA - Chartered Management Accountants", source: "CIMA", url: "https://www.cimaglobal.com/" },
];


const Finance = () => {
  const tabs = [
    {
      id: "listen",
      label: "Listen",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2>
          <div className="space-y-4 mb-12">
            {podcasts.map((pod) => (
              <a key={pod.url} href={pod.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
                <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{pod.title}</h3>
                <p className="text-muted-foreground font-body text-xs mt-1">{pod.description}</p>
              </a>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "read",
      label: "Read",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2>
          <div className="space-y-4 mb-12">
            {articles.map((a) => (
              <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
                <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3>
                <p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p>
              </a>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "watch",
      label: "Watch",
      content: <RoleWatchSection roleSlug="finance" roleName="Finance & Accounting" />,
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Finance Exists<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-8">Every industry needs finance. Here's where the role shows up - and what it looks like.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financeInIndustries.map((item) => (
              <div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <IndustryIcon industry={item.industry} />
                  <Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">
                    Finance in {item.industry}
                  </Link>
                </div>
                <ul className="space-y-1">
                  {item.examples.map((ex) => (
                    <li key={ex.company} className="text-muted-foreground font-body text-xs flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full shrink-0" />
                      {ex.profileUrl ? (
                        <Link to={ex.profileUrl} className="hover:text-primary transition-colors">
                          <span className="font-600 text-foreground">{ex.company}</span> - {ex.role}
                        </Link>
                      ) : (
                        <span><span className="font-600 text-foreground">{ex.company}</span> - {ex.role}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <Link to={item.slug} className="inline-flex items-center gap-1.5 text-xs font-display font-600 tracking-wide uppercase text-primary mt-3">
                  Explore industry <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "plan",
      label: "Plan",
      content: (
        <>
          <RoleOverview
            name="Finance"
            data={{
              summary: "Finance is the backbone of every organisation. It covers everything from managing budgets and forecasting revenue to strategic planning, risk management, and investor relations. Every industry - from fashion to football - needs finance professionals who can turn numbers into decisions.",
              dayToDay: [
                "Preparing management accounts, budgets, and variance reports",
                "Building financial models and forecasting future performance",
                "Supporting commercial teams with pricing and profitability analysis",
                "Managing tax compliance, audits, and regulatory reporting",
                "Presenting financial insights to leadership and stakeholders",
                "Monitoring cash flow and managing working capital",
              ],
              skills: ["Financial Modelling", "Excel & Reporting", "Budgeting & Forecasting", "Tax & Compliance", "Data Analysis", "Commercial Acumen", "Stakeholder Management", "ERP Systems"],
              traits: [
                "You enjoy problem-solving through numbers and data",
                "You're detail-oriented but can see the bigger picture",
                "You're comfortable communicating complex information simply",
                "You thrive under deadlines - month-end doesn't faze you",
                "You want to understand how businesses really work",
              ],
              salary: "£22k–£32k",
              entryTip: "Most finance careers start through graduate schemes or accounts assistant roles. An AAT qualification can get you started, while ACA, ACCA, or CIMA are the gold-standard professional qualifications. Many firms will sponsor your study.",
            }}
          />
          <CareerMap
            title="Finance Career Path"
            subtitle="From accounts assistant to CFO - the typical progression for finance professionals."
            stages={careerStages}
            industry="finance"
          />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Finance" searchQuery="finance accounting" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Qualifications & Courses<span className="text-primary">.</span></h2>
          <div className="space-y-4">
            {[
              { title: "ACA (ICAEW)", description: "The UK's premier chartered accountancy qualification - combines exams, ethics, and practical experience.", url: "https://www.icaew.com/learning-and-development/aca" },
              { title: "ACCA", description: "Globally recognised accounting qualification with flexible study options and broad career pathways.", url: "https://www.accaglobal.com/gb/en/qualifications.html" },
              { title: "CIMA", description: "Chartered management accountancy - focused on business strategy, risk, and management accounting.", url: "https://www.cimaglobal.com/Qualifications/" },
              { title: "CFA Institute", description: "The gold standard for investment analysis and portfolio management - rigorous three-level programme.", url: "https://www.cfainstitute.org/" },
            ].map((course) => (
              <a key={course.url} href={course.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group">
                <h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-muted-foreground font-body text-xs mt-1">{course.description}</p>
              </a>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "apply",
      label: "Jobs",
      content: (
        <>
          <div className="border border-border p-6 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2>
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live finance and accounting roles across all industries.</p>
            <Link to="/marketplace?role=Finance#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Finance Jobs
            </Link>
          </div>
          <IndustryCVBuilder industry="Finance" stages={careerStages} />
        </>
      ),
    },
  ];

  return (
    <RolePageLayout
      name="Finance"
      description="Budgets, forecasting, and financial strategy - the numbers behind every industry."
      tabs={tabs}
      category="business"
    />
  );
};

export default Finance;
