import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Database } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Database, roles: [
    { name: "Junior Data Analyst", description: "Builds dashboards, runs reports, supports senior analysts and commercial teams.", salary: "£30k–£40k" },
    { name: "BI Analyst / Reporting Analyst", description: "Owns the reporting layer - Tableau, Power BI, Looker for stakeholders.", salary: "£32k–£42k" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Data Analyst", description: "Owns analysis end-to-end - extracts, models, visualises and presents insight to commercial leads.", salary: "£45k–£60k" },
    { name: "Analytics Engineer", description: "Builds the data models and transformation layer (dbt, Snowflake, BigQuery).", salary: "£55k–£75k" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Senior Data Analyst / Analytics Lead", description: "Leads on a domain (commercial, product, marketing) and mentors juniors.", salary: "£70k–£95k" },
    { name: "Data Scientist", description: "Adds modelling, ML and statistics on top of analysis. Strong career pivot.", salary: "£75k–£120k+" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Head of Analytics / Data", description: "Runs the analytics team - strategy, hiring, stakeholder management.", salary: "£100k–£160k" },
    { name: "Chief Data Officer / VP Data", description: "Board-level - owns enterprise data strategy, governance and value.", salary: "£150k–£350k+" },
  ]},
];

const podcasts = [
  { title: "Super Data Science", description: "One of the largest English-language data science / analytics podcasts.", url: "https://www.superdatascience.com/podcast" },
  { title: "Data Skeptic", description: "Long-running data and ML podcast - practical, technical, accessible.", url: "https://dataskeptic.com/" },
];

const articles = [
  { title: "Towards Data Science (Medium)", source: "Towards Data Science", url: "https://towardsdatascience.com/" },
  { title: "The Modern Data Stack (dbt Labs)", source: "dbt Labs", url: "https://www.getdbt.com/blog" },
  { title: "FT Data Visualisation", source: "Financial Times", url: "https://www.ft.com/visual-and-data-journalism" },
];

const DataAnalyst = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Data Analyst" data={{
        summary: "Data analysts turn raw business data into decisions. They sit between the data pipeline and the commercial team - building dashboards, running ad-hoc analysis and answering questions like 'why did sales drop?', 'which customers churn?', 'what's the ROI of this campaign?'. It's one of the most cross-industry roles in modern business - every UK sector now hires data analysts at scale.",
        dayToDay: ["Writing SQL queries against the data warehouse", "Building and maintaining dashboards (Tableau, Power BI, Looker)", "Ad-hoc analysis for commercial, marketing or operations stakeholders", "Modelling data with dbt or in the warehouse", "Presenting findings to non-technical leaders", "Working with engineers on data quality and pipelines"],
        skills: ["SQL (essential)", "Excel & Google Sheets", "Tableau / Power BI / Looker", "Python or R (statistics & automation)", "dbt / Modern Data Stack", "Stakeholder Communication"],
        traits: ["Genuinely curious about the business, not just the data", "Strong communicator - analysis only counts if it lands", "Detail-oriented - small errors get amplified", "Pragmatic - perfect is the enemy of decision-ready"],
        salary: "£30k junior → £350k+ CDO",
        entryTip: "Routes in: STEM degree (any quantitative subject) → graduate scheme at a major employer (Tesco, Sky, BBC, BT, JLR, Bet365, Octopus Energy). Bootcamps (CodeFirst Girls, Multiverse, General Assembly) and the Level 4 Data Analyst Apprenticeship are strong non-degree routes. Build a portfolio of SQL + dashboard projects on GitHub.",
      }} />
      <CareerMap title="Data Career Path" subtitle="From junior analyst to Chief Data Officer." stages={careerStages} industry="football" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="data-analyst" roleName="Data Analyst" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Football" searchQuery="Big Data London data analytics conference UK" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live data analyst roles across the UK.</p><Link to="/marketplace?role=data-analyst#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Data Jobs</Link></div><IndustryCVBuilder industry="Football" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Data Analyst" description="Turning raw data into decisions - dashboards, reporting and insight for commercial, marketing and operations teams." tabs={tabs} category="business" />;
};

export default DataAnalyst;
