import { Link } from "react-router-dom";
import { Target, TrendingUp, BarChart3, Car } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import type { CareerStage } from "@/components/CareerMap";
import CareerMap from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const careerStages: CareerStage[] = [
  { title: "Entry Level", icon: Car, roles: [
    { name: "Sales Executive (Used Cars)", description: "Showroom floor - qualifying buyers, test drives, finance proposals. Most start here.", salary: "£22k–£26k basic + commission (£35k–£50k OTE)" },
    { name: "Sales Executive (New Cars)", description: "Brand-trained at a franchised dealership - Audi, BMW, Mercedes, Toyota, etc.", salary: "£24k–£28k basic + commission (£40k–£55k OTE)" },
  ]},
  { title: "Mid Level", icon: Target, roles: [
    { name: "Senior Sales Executive", description: "Top performer with repeat buyers - handles higher-value cars and complex deals.", salary: "£28k–£35k basic + commission (£55k–£75k OTE)" },
    { name: "Business Development / Fleet Specialist", description: "Sells to SMEs and corporate fleets - longer cycles, larger orders.", salary: "£32k–£42k basic + commission (£60k–£90k OTE)" },
  ]},
  { title: "Senior Level", icon: BarChart3, roles: [
    { name: "Sales Manager", description: "Runs the showroom team - pipeline, finance penetration, customer satisfaction.", salary: "£45k–£65k + bonus (£70k–£100k OTE)" },
    { name: "General Sales Manager (GSM)", description: "Owns whole-site sales P&L - new, used, fleet, F&I across multiple franchises.", salary: "£60k–£90k + bonus (£90k–£140k OTE)" },
  ]},
  { title: "Leadership", icon: TrendingUp, roles: [
    { name: "Dealer Principal / Head of Business", description: "Runs the entire dealership - sales, aftersales, parts, P&L, manufacturer relationship.", salary: "£90k–£140k + bonus + car (£130k–£200k+ OTE)" },
    { name: "Regional / Brand Director", description: "Multi-site oversight at group level (Sytner, Inchcape, Lookers, JCT600).", salary: "£140k–£250k+" },
  ]},
];

const podcasts = [
  { title: "Car Dealer Magazine Podcast", description: "UK car retail industry's leading podcast - dealer trends, manufacturer news and sales practice.", url: "https://cardealermagazine.co.uk/podcast" },
  { title: "AM Online Podcast", description: "Automotive Management's industry podcast for franchised UK dealers.", url: "https://www.am-online.com/" },
];

const articles = [
  { title: "Car Dealer Magazine", source: "Car Dealer", url: "https://cardealermagazine.co.uk/" },
  { title: "AM Online (Automotive Management)", source: "AM", url: "https://www.am-online.com/" },
  { title: "Auto Trader Insight", source: "Auto Trader", url: "https://plc.autotrader.co.uk/news-views/" },
];

const CarSalesExecutive = () => {
  const tabs = [
    { id: "plan", label: "Plan", content: (<>
      <RoleOverview name="Car Sales Executive" data={{
        summary: "Car sales is one of the highest-earning frontline retail jobs in the UK - and one of the few where commission can quickly outpace your basic. Sales executives sit on the showroom floor at franchised dealerships (Audi, BMW, Mercedes, Toyota, JLR) or independent groups, guiding customers through one of the biggest non-property purchases they'll make. The shift to EVs and online buying is reshaping the role but commission remains uncapped.",
        dayToDay: ["Greeting walk-in customers and qualifying needs", "Test drives and showroom demonstrations", "Building finance proposals (PCP, HP, lease)", "Selling F&I add-ons (GAP insurance, paint protection, service plans)", "Following up internet leads and existing customer database", "Handover days - preparing the car and customer experience"],
        skills: ["Consultative Sales", "Finance Products (PCP / HP / Lease)", "Product Knowledge (full model line-up)", "FCA Consumer Duty / SAF Approval", "CRM (Kerridge, Pinnacle, Drive)", "Negotiation"],
        traits: ["Genuinely passionate about cars", "Resilient - most leads don't convert", "Disciplined follow-up - money is in the database", "Customer-first - referrals drive long-term earnings"],
        salary: "£22k basic + commission → £200k+ Dealer Principal",
        entryTip: "Routes in: Apply directly to franchised dealerships (Sytner, Inchcape, Lookers, Vertu, JCT600) or independents. Most run sponsored brand training (Audi UK Academy, BMW Sales Academy, JLR Step-In). FCA SAF (Specialist Automotive Finance) qualification required to sell finance - usually completed within first 90 days. No degree required.",
      }} />
      <CareerMap title="Car Sales Career Path" subtitle="From showroom floor to Dealer Principal." stages={careerStages} industry="cars" />
    </>) },
    { id: "read", label: "Read", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Essential Reading<span className="text-primary">.</span></h2><div className="space-y-4">{articles.map((a) => (<a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="block border border-border p-4 hover:border-primary transition-colors group"><h3 className="font-display font-700 text-foreground text-sm group-hover:text-primary transition-colors">{a.title}</h3><p className="text-muted-foreground font-body text-xs mt-1">{a.source}</p></a>))}</div></>) },
    { id: "listen", label: "Listen", content: (<><h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Podcasts We Rate<span className="text-primary">.</span></h2><PodcastGrid podcasts={podcasts as PodcastItem[]} /></>) },
    { id: "watch", label: "Watch", content: <RoleWatchSection roleSlug="car-sales-executive" roleName="Car Sales Executive" /> },
    { id: "attend", label: "Attend", content: <EventsSection industry="Cars" searchQuery="UK car dealer conference Automotive Management Live" /> },
    { id: "apply", label: "Jobs", content: (<><div className="border border-border p-6 mb-12"><h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Job Marketplace<span className="text-primary">.</span></h2><p className="text-muted-foreground font-body text-sm mb-4">Browse live car sales roles across UK dealerships.</p><Link to="/marketplace?role=car-sales-executive#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Car Sales Jobs</Link></div><IndustryCVBuilder industry="Cars" stages={careerStages} /></>) },
  ];
  return <RolePageLayout name="Car Sales Executive" description="Showroom sales, test drives and finance - guiding customers through one of the biggest purchases they'll make." tabs={tabs} category="craft" />;
};

export default CarSalesExecutive;
