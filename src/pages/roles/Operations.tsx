import IndustryIcon from "@/components/IndustryIcon";
import { Link } from "react-router-dom";
import { Building2, ArrowRight, Settings, Truck, BarChart3, TrendingUp } from "lucide-react";
import RolePageLayout from "@/components/RolePageLayout";
import PodcastGrid, { type PodcastItem } from "@/components/PodcastGrid";
import RoleWatchSection from "@/components/RoleWatchSection";
import EventsSection from "@/components/EventsSection";
import IndustryCVBuilder from "@/components/IndustryCVBuilder";
import CareerMap from "@/components/CareerMap";
import type { CareerStage } from "@/components/CareerMap";
import RoleOverview from "@/components/RoleOverview";

const opsInIndustries = [
  { industry: "Fashion", examples: [{ company: "ASOS", role: "Warehouse & Fulfilment Ops", profileUrl: "/company/asos" }, { company: "Burberry", role: "Supply Chain Operations", profileUrl: "/company/burberry" }, { company: "ME+EM", role: "Retail Operations", profileUrl: "/company/me-em" }], slug: "/fashion" },
  { industry: "Coffee", examples: [{ company: "Costa", role: "Multi-site Ops", profileUrl: "/company/costa" }, { company: "Grind", role: "Café & Roastery Ops", profileUrl: "/company/grind" }, { company: "Starbucks", role: "Store Operations", profileUrl: "/company/starbucks" }], slug: "/coffee" },
  { industry: "Film and TV", examples: [{ company: "Everyman", role: "Venue Operations", profileUrl: "/company/everyman" }, { company: "Curzon", role: "Site Management" }, { company: "Vue", role: "Multi-site Ops" }], slug: "/cinema" },
  { industry: "Grocery", examples: [{ company: "Tesco", role: "Supply Chain Ops", profileUrl: "/company/tesco" }, { company: "Ocado", role: "Warehouse Automation", profileUrl: "/company/ocado" }, { company: "Greggs", role: "Manufacturing Ops", profileUrl: "/company/greggs" }], slug: "/grocery" },
  { industry: "Hospitality", examples: [{ company: "Soho House", role: "Club Operations", profileUrl: "/company/soho-house" }, { company: "Five Guys", role: "Restaurant Ops", profileUrl: "/company/five-guys" }, { company: "Dishoom", role: "Multi-site Management" }], slug: "/hospitality" },
  { industry: "Wellness", examples: [{ company: "PureGym", role: "Gym Operations" }, { company: "Barry's", role: "Studio Ops" }, { company: "Third Space", role: "Facilities Management" }], slug: "/wellness" },
  { industry: "Bakery", examples: [{ company: "Gail's", role: "Production & Retail Ops", profileUrl: "/company/gails" }, { company: "Greggs", role: "Manufacturing & Distribution", profileUrl: "/company/greggs" }, { company: "Paul", role: "Multi-site Operations" }], slug: "/bakery" },
];

const careerStages: CareerStage[] = [
  {
    title: "Entry Level",
    icon: Settings,
    roles: [
      { name: "Operations Coordinator", description: "Supports daily operations by coordinating schedules, managing admin, and solving logistical problems.", salary: "£23k–£30k" },
      { name: "Warehouse Operative", description: "Picks, packs, and manages stock in distribution centres, keeping the supply chain moving.", salary: "£22k–£28k" },
      { name: "Shift Manager", description: "Manages a team during a shift, handling staffing, targets, and real-time problem-solving.", salary: "£24k–£32k" },
      { name: "Logistics Assistant", description: "Coordinates deliveries, tracks shipments, and supports the logistics team with documentation.", salary: "£22k–£28k" },
    ],
  },
  {
    title: "Mid Level",
    icon: Truck,
    roles: [
      { name: "Operations Manager", description: "Runs day-to-day operations for a site or function, managing teams, budgets, and performance.", salary: "£35k–£52k" },
      { name: "Supply Chain Manager", description: "Oversees procurement, logistics, and inventory to ensure efficient product flow from source to customer.", salary: "£38k–£55k" },
      { name: "Facilities Manager", description: "Manages physical spaces - maintenance, health & safety, security, and vendor contracts.", salary: "£35k–£50k" },
      { name: "Process Improvement Manager", description: "Identifies and implements efficiency gains across operations using lean, six sigma, or agile methods.", salary: "£38k–£55k" },
      { name: "Project Manager", description: "Plans and delivers operational projects - new site openings, system rollouts, and process changes.", salary: "£38k–£55k" },
    ],
  },
  {
    title: "Senior Level",
    icon: BarChart3,
    roles: [
      { name: "Head of Operations", description: "Leads the operations function across the business, setting strategy and managing senior team members.", salary: "£55k–£80k" },
      { name: "Head of Supply Chain", description: "Owns end-to-end supply chain strategy, from sourcing through logistics to final delivery.", salary: "£60k–£85k" },
      { name: "Regional Operations Director", description: "Manages operations across multiple sites or regions, driving consistency and performance.", salary: "£65k–£90k" },
    ],
  },
  {
    title: "Leadership",
    icon: TrendingUp,
    roles: [
      { name: "Operations Director", description: "Board-level leader responsible for all operational performance, efficiency, and strategic execution.", salary: "£85k–£130k" },
      { name: "VP of Operations", description: "Oversees operations across multiple business units or geographies, driving scale and transformation.", salary: "£95k–£150k" },
      { name: "Chief Operating Officer", description: "C-suite leader accountable for the entire operational engine of the business.", salary: "£130k–£250k+" },
    ],
  },
];

const podcasts = [
  { title: "The Manufacturing Show", description: "How leading manufacturers build and scale operations - real stories from the factory floor.", url: "https://www.themanufacturer.com/" },
  { title: "Supply Chain Revolution", description: "Exploring the future of supply chains, logistics, and operational technology.", url: "https://www.supplychainrevolution.com" },
  { title: "The Lean Solutions Podcast", description: "Practical lean thinking for operations professionals - real cases, real results.", url: "https://www.leansolutions.co/" },
];

const articles = [
  { title: "Supply Chain Digital", source: "Supply Chain Digital", url: "https://supplychaindigital.com/" },
  { title: "The Manufacturer", source: "The Manufacturer", url: "https://www.themanufacturer.com/" },
  { title: "Logistics Manager", source: "Logistics Manager", url: "https://www.logisticsmanager.com/" },
  { title: "CIPS - Supply Management", source: "CIPS", url: "https://www.cips.org/supply-management/" },
];


const Operations = () => {
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
      content: <RoleWatchSection roleSlug="operations" roleName="Operations" />,
    },
    {
      id: "work",
      label: "Who?",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-2">Where Operations Exists<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-8">Operations is the engine room of every business. Here's how the role looks across different industries.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opsInIndustries.map((item) => (
              <div key={item.industry} className="border border-border p-5 hover:border-primary transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <IndustryIcon industry={item.industry} />
                  <Link to={item.slug} className="font-display font-700 text-foreground text-sm hover:text-primary transition-colors">
                    Operations in {item.industry}
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
            name="Operations"
            data={{
              summary: "Operations is the engine room of every business. It's about making sure things run smoothly - from supply chains and logistics to store management, process improvement, and facilities. If you like solving problems, improving systems, and seeing real-world impact, operations could be your thing.",
              dayToDay: [
                "Managing daily workflows, staffing, and schedules",
                "Optimising supply chain, logistics, and inventory processes",
                "Analysing operational data to identify bottlenecks and improvements",
                "Coordinating with suppliers, warehouses, and distribution partners",
                "Implementing new systems, tools, and standard operating procedures",
                "Managing health & safety, compliance, and quality standards",
              ],
              skills: ["Process Improvement", "Supply Chain Management", "Data Analysis", "Lean / Six Sigma", "Project Management", "Vendor Management", "ERP Systems", "Problem Solving"],
              traits: [
                "You enjoy making things work better and more efficiently",
                "You're practical and good at solving real-world problems",
                "You stay calm under pressure - especially on busy days",
                "You're a natural organiser who loves structure",
                "You get satisfaction from measurable improvements",
              ],
              salary: "£23k–£30k",
              entryTip: "Operations roles are everywhere - from warehouse coordinators to shift managers to ops assistants. Many people move into ops from frontline roles. CIPS, Lean Six Sigma, and CMI qualifications can accelerate your progression.",
            }}
          />
          <CareerMap
            title="Operations Career Path"
            subtitle="From coordinator to COO - the typical progression for operations professionals."
            stages={careerStages}
            industry="operations"
          />
        </>
      ),
    },
    {
      id: "attend",
      label: "Attend",
      content: <EventsSection industry="Operations" searchQuery="operations supply chain" />,
    },
    {
      id: "learn",
      label: "Learn",
      content: (
        <>
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Qualifications & Courses<span className="text-primary">.</span></h2>
          <div className="space-y-4">
            {[
              { title: "CIPS - Supply Chain Qualification", description: "The professional standard for procurement and supply chain management in the UK.", url: "https://www.cips.org/qualifications/" },
              { title: "Lean Six Sigma (Green/Black Belt)", description: "Industry-recognised certification in process improvement and operational efficiency.", url: "https://www.sixsigmaonline.org/" },
              { title: "APICS CPIM", description: "Global certification in production and inventory management - the ops professional's credential.", url: "https://www.ascm.org/learning-development/certifications-credentials/cpim/" },
              { title: "CMI Operations Management", description: "Chartered Management Institute qualification focused on operational leadership and strategy.", url: "https://www.managers.org.uk/education-and-learning/qualifications/" },
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
            <p className="text-muted-foreground font-body text-sm mb-4">Browse live operations roles across all industries.</p>
            <Link to="/marketplace?role=Operations#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              View Operations Jobs
            </Link>
          </div>
          <IndustryCVBuilder industry="Operations" stages={careerStages} />
        </>
      ),
    },
  ];

  return (
    <RolePageLayout
      name="Operations"
      description="Supply chains, logistics, and the systems that keep industries running day to day."
      tabs={tabs}
      category="business"
    />
  );
};

export default Operations;
