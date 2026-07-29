import SEO, { jobPostingsJsonLd } from "@/components/SEO";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import CVBuilder from "@/components/CVBuilder";
import CompanyLogo from "@/components/CompanyLogo";
import CompanyLogoStrip from "@/components/CompanyLogoStrip";
import JobApplicationHelper, { type JobForHelper } from "@/components/JobApplicationHelper";
import DynamicJobsEmptyState from "@/components/marketplace/DynamicJobsEmptyState";
import SortFilterSheet, { type SortOption } from "@/components/SortFilterSheet";
import { supabase } from "@/integrations/supabase/client";
import { getCached, setCached } from "@/lib/ttlCache";
import { useAuth } from "@/contexts/AuthContext";
import howdyMascot from "@/assets/howdy-mascot.png";
import {
  ArrowLeft,
  Search,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Building2,
  Banknote,
  ExternalLink,
  RefreshCw,
  Briefcase,
  Users,
  X,
  Plus,
  Trash2,
  FileText,
  Download,
  Sparkles,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inferCareerLevelFromUnderstandMe, normalizeCareerLevel, isCraftServiceJob, isBusinessRoleSlug, LEVEL_ORDER } from "@scoring/understand-me.ts";
import { getIndustryRankBoost } from "@scoring/industry-rankings.ts";
import { getCompanyProfilePath, getCompanySlug } from "@/lib/company-profiles";
import { getCompanyBrand } from "@/lib/company-brand";
import { getCompanyExternalUrl } from "@/lib/company-external-links";
import { trackInteraction } from "@/hooks/useTrackInteraction";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import SourceAttribution, { SourceAttributionFooter, detectJobSource } from "@/components/AdzunaAttribution";
import SignUpPopup, { useSignUpPopup } from "@/components/SignUpPopup";
import { roles as ROLE_DEFINITIONS } from "@/data/roles";
import { INDUSTRIES as CANONICAL_INDUSTRIES } from "@/data/industries";

// Featured employer per industry - when a user filters by an industry, this
// brand is shown as the second tile in the job list as an "Employer Spotlight".
// Each entry MUST point at a /company/<slug> page that already exists in the app.
// Industry keys MUST match the labels in the `industries` chip filter below
// (e.g. "Food & Drink", not "food-drink").
type FeaturedEmployer = {
  company: string;
  slug: string;
  tagline: string;
  whyWorkHere: string[];
  careersUrl: string;
};
const FEATURED_EMPLOYERS: Record<string, FeaturedEmployer> = {
  Bakery: {
    company: "Greggs", slug: "greggs",
    tagline: "Britain's biggest bakery chain - 2,400+ shops and still growing.",
    careersUrl: "https://www.greggscareers.co.uk",
    whyWorkHere: [
      "Competitive hourly pay plus free food on every shift",
      "Structured training from counter to shop manager",
      "Genuinely supportive team culture - ask any Greggs employee",
    ],
  },
  Beauty: {
    company: "Burberry", slug: "burberry",
    tagline: "British luxury house - 168 years of craft and creativity.",
    careersUrl: "https://www.burberryplc.com/careers",
    whyWorkHere: [
      "Global luxury brand with deep roots in British culture",
      "Generous staff discount and sample sales",
      "Career paths across design, digital, retail and supply chain",
    ],
  },
  "Film and TV": {
    company: "Netflix", slug: "netflix",
    tagline: "The world's leading streaming service - 260 million members.",
    careersUrl: "https://jobs.netflix.com",
    whyWorkHere: [
      "Freedom and responsibility culture - no micromanagement",
      "Top-of-market pay and unlimited holiday",
      "Work on content seen by hundreds of millions worldwide",
    ],
  },
  Coffee: {
    company: "Blank Street", slug: "blank-street",
    tagline: "Tech-powered micro-cafés rethinking the UK coffee experience.",
    careersUrl: "https://www.blankstreet.com/careers",
    whyWorkHere: [
      "Fast-growing start-up with real career progression",
      "Sleek, modern stores - no clutter, no chaos",
      "Competitive pay plus tips and free coffee",
    ],
  },
  Fashion: {
    company: "Burberry", slug: "burberry",
    tagline: "British luxury house - 168 years of craft and creativity.",
    careersUrl: "https://www.burberryplc.com/careers",
    whyWorkHere: [
      "Global luxury brand with deep roots in British culture",
      "Generous staff discount and sample sales",
      "Career paths across design, digital, retail and supply chain",
    ],
  },
  "Food & Drink": {
    company: "Soho House", slug: "soho-house",
    tagline: "Global members' club - restaurants, hotels and creative spaces.",
    careersUrl: "https://careers.sohohouse.com",
    whyWorkHere: [
      "Free House membership - access every club worldwide",
      "Tips, meals on shift and wellness benefits from day one",
      "Hospitality careers across food, events, and hotel operations",
    ],
  },
  Football: {
    company: "Premier League", slug: "premier-league",
    tagline: "The world's most-watched football league - HQ in London.",
    careersUrl: "https://careers.premierleague.com/",
    whyWorkHere: [
      "Shape the future of football broadcasting and commercial strategy",
      "Small, high-impact team behind a global brand",
      "Tickets to Premier League matches as standard",
    ],
  },
  Footwear: {
    company: "Dr. Martens", slug: "dr-martens",
    tagline: "British icon - boots that built subcultures.",
    careersUrl: "https://careers.drmartens.com",
    whyWorkHere: [
      "Two free pairs of boots a year, plus 65% staff discount",
      "Global brand with Camden roots and a real heritage",
      "Strong design, retail and wholesale career paths",
    ],
  },
  "Formula 1": {
    company: "McLaren Racing", slug: "mclaren-racing",
    tagline: "One of the most successful teams in motorsport history - based in Woking.",
    careersUrl: "https://racingcareers.mclaren.com/",
    whyWorkHere: [
      "Work inside the iconic McLaren Technology Centre",
      "Cutting-edge engineering across F1, IndyCar and FE",
      "Strong apprenticeship and graduate programmes",
    ],
  },
  Gaming: {
    company: "Playrix", slug: "playrix",
    tagline: "Global mobile games studio - fully remote teams.",
    careersUrl: "https://playrix.com/job/open",
    whyWorkHere: [
      "100% remote - work from anywhere in the UK",
      "Top 5 mobile games publisher worldwide (Gardenscapes, Homescapes)",
      "Generous learning budget and English-language coaching",
    ],
  },
  Grocery: {
    company: "Tesco", slug: "tesco",
    tagline: "Britain's biggest supermarket - every little helps.",
    careersUrl: "https://www.tesco-careers.com",
    whyWorkHere: [
      "10% colleague discount plus seasonal double-discount events",
      "Structured programmes from store floor to head office",
      "Share schemes, pension matching, and flexible shifts",
    ],
  },
  Journalism: {
    company: "News UK", slug: "news-uk",
    tagline: "Home of The Times, The Sun and Times Radio.",
    careersUrl: "https://www.newsukcareers.co.uk",
    whyWorkHere: [
      "Newsroom training across print, digital, audio and video",
      "London Bridge HQ with rooftop views and subsidised café",
      "Award-winning graduate and apprenticeship schemes",
    ],
  },
  Charity: {
    company: "Save the Children", slug: "save-the-children",
    tagline: "Global charity - careers in fundraising, programmes & policy.",
    careersUrl: "https://www.savethechildren.org.uk/about-us/jobs",
    whyWorkHere: [
      "Mission-led work changing children's lives in 100+ countries",
      "Flexible and hybrid working as standard",
      "Strong learning culture across fundraising, policy and programmes",
    ],
  },
  "Estate Agency": {
    company: "Rightmove", slug: "rightmove",
    tagline: "The UK's number one property portal - 80% of all listings.",
    careersUrl: "https://careers.rightmove.co.uk",
    whyWorkHere: [
      "Tech company feel inside a property powerhouse",
      "Hybrid working, share scheme and private healthcare",
      "Product, data and engineering careers at scale",
    ],
  },
  Beer: {
    company: "Hawkstone", slug: "hawkstone",
    tagline: "Jeremy Clarkson's Cotswolds brewery.",
    careersUrl: "https://www.hawkstone.co.uk",
    whyWorkHere: [
      "Founder-led brand growing fast across UK pubs and supermarkets",
      "Small team, big visibility - no two days the same",
      "Brewery, hospitality and commercial routes from day one",
    ],
  },
  "Interior Design": {
    company: "Tom Dixon", slug: "tom-dixon",
    tagline: "British design studio - lighting, furniture, accessories.",
    careersUrl: "https://www.tomdixon.net/pages/careers",
    whyWorkHere: [
      "Work alongside one of Britain's most influential designers",
      "Coal Office HQ in King's Cross - studio, restaurant, showroom",
      "Global brand with a small-studio feel",
    ],
  },
  Jewellery: {
    company: "Pragnell", slug: "pragnell",
    tagline: "Family-owned British jewellers since 1954.",
    careersUrl: "https://www.pragnell.co.uk/careers",
    whyWorkHere: [
      "Train as a goldsmith, gemmologist or client advisor",
      "Family-run business with long tenures and real craft",
      "Sponsored GIA and JET qualifications",
    ],
  },
  Music: {
    company: "Dice", slug: "dice",
    tagline: "Live music ticketing platform built for fans.",
    careersUrl: "https://dice.fm/careers",
    whyWorkHere: [
      "Free gig tickets - discover artists every week",
      "Tech-led culture changing how live music works",
      "Hybrid working from London, NYC, LA, Paris and beyond",
    ],
  },
  Teaching: {
    company: "Teach First", slug: "teach-first",
    tagline: "Training the next generation of teachers in UK state schools.",
    careersUrl: "https://www.teachfirst.org.uk/training-programme",
    whyWorkHere: [
      "Earn a salary while training as a qualified teacher",
      "Fully funded PGDE alongside the two-year programme",
      "Lifetime ambassador network across business and education",
    ],
  },
};

const DoodleButton = ({ children, className = "", ...props }: React.ComponentPropsWithoutRef<"span">) => (
  <span
    className={`relative inline-flex items-center ${className}`}
    {...props}
  >
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
    <span className="relative font-display font-600 text-sm tracking-wide uppercase text-primary-foreground px-6 py-3">
      {children}
    </span>
  </span>
);

const DoodleChip = ({ children, active = false, className = "", ...props }: React.ComponentPropsWithoutRef<"span"> & { active?: boolean }) => (
  <span
    className={`relative inline-flex items-center ${className}`}
    {...props}
  >
    <svg
      viewBox="0 0 160 44"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M8,4 C4,6 3,10 3,16 C3,22 2,30 4,36 C6,40 10,42 20,42 L140,42 C150,42 155,40 157,36 C158,30 158,22 157,16 C156,10 158,6 152,4 C148,2 140,3 132,3 L28,3 C16,3 12,2 8,4 Z"
        className={active ? "fill-primary stroke-foreground" : "fill-card stroke-foreground"}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
    <span className={`relative font-display font-600 text-xs tracking-wide uppercase px-5 py-2.5 ${active ? "text-primary-foreground" : "text-foreground"}`}>
      {children}
    </span>
  </span>
);

// ── Filter dropdown pill ──────────────────────────────────────
// Mobile: native <select> (always works on iOS/Android)
// Desktop: custom styled dropdown

const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  scrollable = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  scrollable?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const active = value !== "All";

  const openDropdown = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const panelWidth = Math.min(220, window.innerWidth - 16);
      const left = Math.min(r.left, window.innerWidth - panelWidth - 8);
      setPos({ top: r.bottom + 6, left: Math.max(8, left) });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="shrink-0 relative">
      {/* Mobile: native select overlaid invisibly on the pill button */}
      <div className="md:hidden relative">
        <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-display font-700 text-xs uppercase tracking-wide whitespace-nowrap pointer-events-none ${
          active ? "border-foreground bg-foreground text-background" : "border-foreground/40 bg-background text-foreground"
        }`}>
          {active ? value : label}
          <ChevronDown size={11} strokeWidth={3} />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          aria-label={label}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Desktop: custom dropdown */}
      <div className="hidden md:block">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => open ? setOpen(false) : openDropdown()}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-display font-700 text-xs uppercase tracking-wide transition-colors whitespace-nowrap ${
            active
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/40 bg-background text-foreground hover:border-foreground hover:bg-primary"
          }`}
        >
          {active ? value : label}
          <ChevronDown size={11} strokeWidth={3} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && pos && (
            <motion.ul
              ref={panelRef}
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "fixed", top: pos.top, left: pos.left, width: 220 }}
              className={`z-[200] bg-background border-2 border-foreground rounded-xl shadow-[4px_4px_0_0_hsl(var(--foreground))] p-1.5 space-y-0.5 ${scrollable ? "max-h-72 overflow-y-auto" : ""}`}
            >
              {options.map((opt) => {
                const isActive = value === opt;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => { onChange(opt); setOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg font-display font-700 text-xs uppercase tracking-wide transition-colors ${
                        isActive ? "bg-primary text-foreground" : "text-foreground hover:bg-primary/60"
                      }`}
                    >
                      {opt}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Sample Data ──────────────────────────────────────────────

type Job = {
  id: number;
  dbId?: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  tags: string[];
  industry: string;
  type: string;
  workMode: string;
  featured: boolean;
  url?: string;
  roleCategory?: string | null;
  careerLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  scrapedAt?: string | null;
};

const companyUrls: Record<string, string> = {
  "Nike": "https://jobs.nike.com",
  "Birkenstock": "https://www.birkenstock.com/gb/careers.html",
  "Timberland": "https://www.timberland.co.uk/careers.html",
  "UGG": "https://www.deckers.com/careers",
  "DAZN": "https://careers.dazn.com",
  "ASOS": "https://www.asoscareers.com",
  "BFI": "https://www.bfi.org.uk/about-bfi/job-opportunities",
  "Spotify": "https://www.lifeatspotify.com",
  "Grind": "https://grind.co.uk/pages/careers",
  "Getty Images": "https://www.gettyimages.com/company/careers",
  "Broadwick": "https://broadwicklive.com/careers",
  "ME+EM": "https://www.meandem.com/careers",
  "Netflix": "https://jobs.netflix.com",
  "Depop": "https://www.depop.com/jobs",
  "Tottenham Hotspur": "https://www.tottenhamhotspur.com/the-club/jobs",
  "The Guardian": "https://workforus.theguardian.com",
  "Secretly Group": "https://secretlygroup.com/careers",
  "Dice": "https://dice.fm/careers",
  "Ocado": "https://careers.ocadogroup.com",
  "A24": "https://a24films.com/jobs",
  "Tate": "https://www.tate.org.uk/about-us/working-at-tate",
  "Zara (Inditex)": "https://www.inditexcareers.com",
  "MUBI": "https://mubi.com/jobs",
  "England Cricket Board": "https://www.ecb.co.uk/careers",
  "M&S Food": "https://careers.marksandspencer.com",
  "Minor Figures": "https://www.minorfigures.com/careers",
  "Curzon": "https://www.curzon.com/careers/",
  "Next": "https://careers.next.co.uk",
  "UK Athletics": "https://www.uka.org.uk/about/work-for-us",
  "Sky Sports": "https://careers.sky.com",
  "Selfridges": "https://careers.selfridges.com",
  "Warner Music": "https://www.wmg.com/careers",
  "Gousto": "https://www.gousto.co.uk/careers",
  "IMG": "https://img.com/careers",
  "BBC Studios": "https://careerssearch.bbc.co.uk",
  "Burberry": "https://careers.burberryplc.com",
  "NME": "https://www.nme.com",
  "Deliveroo": "https://careers.deliveroo.co.uk",
  "The FA": "https://careers.thefa.com/jobs/home/",
  "Channel 4": "https://careers.channel4.com",
  "Alexander McQueen": "https://www.alexandermcqueen.com/en-gb/experience/careers",
  "White Cube": "https://whitecube.com",
  
  "FACEIT": "https://www.faceit.com/en/careers",
  "Vice Media": "https://company.vice.com/careers",
  "Primark": "https://careers.primark.com",
  "National Theatre": "https://www.nationaltheatre.org.uk/jobs",
  "Tesco": "https://www.tesco-careers.com",
  "Opta (Stats Perform)": "https://www.statsperform.com/careers",
  "Acast": "https://www.acast.com/en/careers",
  "Mr Porter": "https://www.mrporter.com/en-gb/content/careers",
  "Printworks": "https://printworkslondon.co.uk",
  
  "British Cycling": "https://www.britishcycling.org.uk/about/article/about-Vacancies",
  "ITV": "https://www.itvjobs.com",
  "Dr. Martens": "https://jobs.drmartens.com",
  "Glastonbury": "https://www.glastonburyfestivals.co.uk",
  "Waitrose": "https://www.waitrosejobs.com",
  "Premiership Rugby": "https://www.premiershiprugby.com",
  "Financial Times": "https://aboutus.ft.com/careers",
  "WGSN": "https://www.wgsn.com/en/careers",
  "V&A": "https://www.vam.ac.uk/info/jobs",
  "The River Café": "https://www.rivercafe.co.uk",
  "LTA": "https://www.lta.org.uk/about-us/work-for-us",
  "Amazon Prime Video": "https://www.amazon.jobs",
  "Levi's": "https://www.levistrauss.com/careers",
  "Penguin Random House": "https://www.penguinrandomhousecareers.co.uk",
  "Sainsbury's": "https://sainsburys.jobs",
  "Swim England": "https://www.swimming.org/swimengland/vacancies",
  "The Times": "https://www.newscareers.co.uk",
  "Monica Vinader": "https://www.monicavinader.com/careers",
  "Fabric": "https://fabriclondon.com",
  "Arsenal FC": "https://www.arsenal.com/the-club/jobs",
  "Banijay UK": "https://www.banijayuk.com/careers",
  "COS": "https://career.hmgroup.com",
  "Live Nation": "https://www.livenationentertainment.com/careers",
  "Mindful Chef": "https://www.mindfulchef.com/careers",
  "Chelsea FC": "https://www.chelseafc.com/en/about-chelsea/careers",
  "Manchester City": "https://www.mancity.com/careers",
  "Premier League": "https://careers.premierleague.com/",
  "EFL": "https://www.efl.com/careers",
  "Wembley Stadium": "https://www.wembleystadium.com/about/careers",
  "Leicester City FC": "https://www.lcfc.com/club/careers",
  "England Football": "https://careers.thefa.com/jobs/home/",
  "Foxtons": "https://www.foxtons.co.uk/about/careers",
  "Savills": "https://www.savills.co.uk/careers",
  "Purplebricks": "https://www.purplebricks.co.uk/careers",
  "Rightmove": "https://www.rightmove.co.uk/careers/",
  "Knight Frank": "https://www.knightfrank.co.uk/careers",
  "Costa Coffee": "https://www.costa.co.uk/careers",
  "Starbucks UK": "https://www.starbucks.co.uk/careers",
  "Caffè Nero": "https://caffenero.com/uk/careers/",
  "Blank Street": "https://www.blankstreet.com/careers",
  "Nuffield Health": "https://www.nuffieldhealth.com/careers",
  "Bupa": "https://jobs.bupa.co.uk",
  "Circle Health Group": "https://www.circlehealthgroup.co.uk/careers",
  "Priory Group": "https://jobs.priorygroup.com",
  "Relate": "https://www.relate.org.uk/about-us/work-us",
  "PureGym": "https://www.puregym.com/careers/",
  "Gymshark": "https://careers.gymshark.com",
  "Barry's": "https://www.barrys.com/careers",
  "Myprotein": "https://careers.thehutgroup.com",
  "Third Space": "https://www.thirdspace.london/careers",
  "Lululemon": "https://careers.lululemon.com",
  "David Lloyd": "https://www.davidlloyd.co.uk/careers",
  "Huel": "https://uk.huel.com/pages/careers",
  "Holland & Barrett": "https://careers.hollandandbarrett.com",
};

// Roll-up filter: when filter === "nhs", match any company containing "nhs"
// (e.g. "Barts Health NHS Trust"). Otherwise exact match (case-insensitive).
function matchesCompanyFilter(company: string | null | undefined, filter: string): boolean {
  const c = (company || "").trim().toLowerCase();
  if (!c) return false;
  if (filter === "nhs") return /\bnhs\b/.test(c);
  return c === filter;
}

function getCompanyUrl(company: string): string {
  // Prefer the local hand-curated map, then the shared external-links registry,
  // then fall back to our own Marketplace filtered by company (no Google search).
  return (
    companyUrls[company] ||
    getCompanyExternalUrl(company) ||
    `/marketplace?company=${encodeURIComponent(company)}`
  );
}

const sampleJobs: Job[] = [
  { id: 1, title: "Football Marketing Manager", company: "Nike", location: "London", salary: "£55k–£70k", description: "Lead integrated marketing campaigns for Nike Football across the UK & Ireland, including kit launches and player partnerships.", tags: ["Marketing", "Football", "Brand"], industry: "Football", type: "Full-time", workMode: "Hybrid", featured: true },
  { id: 2, title: "Football Content Producer", company: "DAZN", location: "London", salary: "£28k–£34k", description: "Create short-form video content for Premier League and Champions League social channels.", tags: ["Content", "Video", "Football"], industry: "Football", type: "Full-time", workMode: "On-site", featured: false },
  { id: 3, title: "Fashion Buyer – Womenswear", company: "ASOS", location: "London", salary: "£42k–£55k", description: "Source and negotiate with global suppliers for the womenswear own-brand range.", tags: ["Buying", "Fashion", "Retail"], industry: "Fashion", type: "Full-time", workMode: "Hybrid", featured: true },
  { id: 4, title: "Film Festival Coordinator", company: "BFI", location: "London", salary: "£32k–£38k", description: "Coordinate programming logistics for the London Film Festival and year-round events.", tags: ["Film", "Events", "Culture"], industry: "Film and TV", type: "Contract", workMode: "On-site", featured: false },
  { id: 5, title: "Podcast Producer", company: "Spotify", location: "London", salary: "£40k–£52k", description: "Produce and edit original podcast content across culture and lifestyle verticals.", tags: ["Audio", "Podcast", "Media"], industry: "Music", type: "Full-time", workMode: "Remote", featured: true },
  { id: 6, title: "Social Media Intern", company: "Grind", location: "London", salary: "£22k", description: "Assist the marketing team with social content creation and community management.", tags: ["Social", "Coffee", "Internship"], industry: "Coffee", type: "Internship", workMode: "On-site", featured: false },
  { id: 7, title: "Freelance Sports Photographer", company: "Getty Images", location: "Manchester", salary: "Day rate £350–£500", description: "Cover Premier League and Championship fixtures for editorial clients.", tags: ["Photography", "Freelance", "Sport"], industry: "Football", type: "Freelance", workMode: "On-site", featured: false },
  { id: 8, title: "Brand Partnerships Lead", company: "Broadwick", location: "London", salary: "£50k–£65k", description: "Sell and manage brand partnerships across live music venues and festivals.", tags: ["Partnerships", "Music", "Sales"], industry: "Music", type: "Full-time", workMode: "Hybrid", featured: true },
  { id: 9, title: "E-commerce Manager", company: "ME+EM", location: "London", salary: "£45k–£58k", description: "Own the end-to-end online customer journey and drive conversion rate optimisation.", tags: ["E-commerce", "Fashion", "Digital"], industry: "Fashion", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 10, title: "Data Analyst – Viewer Insights", company: "Netflix", location: "London", salary: "£48k–£62k", description: "Analyse viewing patterns to inform content commissioning and scheduling decisions.", tags: ["Data", "Streaming", "Film"], industry: "Film and TV", type: "Full-time", workMode: "Remote", featured: true },
  { id: 11, title: "Sustainability Officer", company: "Depop", location: "London", salary: "£38k–£48k", description: "Drive circular fashion initiatives and measure environmental impact across the platform.", tags: ["Sustainability", "Fashion", "Impact"], industry: "Fashion", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 12, title: "Stadium Operations Manager", company: "Tottenham Hotspur", location: "London", salary: "£52k–£68k", description: "Oversee match-day and non-match-day operations at the 62,000-seat stadium.", tags: ["Operations", "Sport", "Events"], industry: "Football", type: "Full-time", workMode: "On-site", featured: true },
  { id: 13, title: "Food Writer", company: "The Guardian", location: "London", salary: "£35k–£42k", description: "Write reviews, features and opinion pieces for the food and drink desk.", tags: ["Writing", "Food", "Journalism"], industry: "Hospitality", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 14, title: "Music A&R Scout", company: "Secretly Group", location: "London", salary: "£30k–£40k", description: "Discover and sign emerging artists across indie, electronic and alternative genres.", tags: ["A&R", "Music", "Talent"], industry: "Music", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 15, title: "UX Designer – Ticketing", company: "Dice", location: "London", salary: "£50k–£65k", description: "Design seamless discovery and purchasing flows for the live events ticketing app.", tags: ["UX", "Design", "Music"], industry: "Music", type: "Full-time", workMode: "Remote", featured: true },
  { id: 16, title: "Grocery Category Manager", company: "Ocado", location: "Hatfield", salary: "£45k–£58k", description: "Manage supplier relationships and range planning for ambient grocery categories.", tags: ["Category", "Grocery", "Retail"], industry: "Grocery", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 17, title: "Freelance Graphic Designer", company: "A24", location: "Remote", salary: "Project rate £2k–£5k", description: "Create key art and marketing assets for upcoming independent film releases.", tags: ["Design", "Film", "Freelance"], industry: "Film and TV", type: "Freelance", workMode: "Remote", featured: false },
  { id: 18, title: "Events Intern – Culture", company: "Tate", location: "London", salary: "£23k", description: "Support the programming team with exhibition openings, late events and community projects.", tags: ["Events", "Art", "Internship"], industry: "Charity", type: "Internship", workMode: "On-site", featured: false },
  { id: 19, title: "Performance Marketing Manager", company: "Zara (Inditex)", location: "London", salary: "£48k–£60k", description: "Run paid social and search campaigns to drive online revenue across UK markets.", tags: ["Performance", "Fashion", "Digital"], industry: "Fashion", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 20, title: "Head of Content", company: "MUBI", location: "London", salary: "£70k–£90k", description: "Lead editorial strategy, curation and original content commissioning for the UK market.", tags: ["Content", "Film", "Strategy"], industry: "Film and TV", type: "Full-time", workMode: "Hybrid", featured: true },
  { id: 21, title: "Performance Analyst", company: "England Football", location: "Burton-on-Trent", salary: "£35k–£45k", description: "Provide data-driven performance insights and opposition analysis for the senior men's squad.", tags: ["Analytics", "Football", "Performance"], industry: "Football", type: "Full-time", workMode: "On-site", featured: false },
  { id: 22, title: "Freelance Food Stylist", company: "M&S Food", location: "London", salary: "Day rate £400–£600", description: "Style food for seasonal campaign shoots across print, digital and in-store.", tags: ["Styling", "Food", "Freelance"], industry: "Hospitality", type: "Freelance", workMode: "On-site", featured: false },
  { id: 23, title: "Community Manager", company: "Minor Figures", location: "London", salary: "£30k–£38k", description: "Build and nurture the brand's online community across social platforms.", tags: ["Community", "Social", "Coffee"], industry: "Coffee", type: "Full-time", workMode: "Remote", featured: false },
  { id: 24, title: "Venue Programmer", company: "Curzon", location: "London", salary: "£34k–£42k", description: "Curate and schedule film programming across Curzon cinemas and the home cinema platform.", tags: ["Programming", "Film", "Cinema"], industry: "Film and TV", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 25, title: "Fashion PR Executive", company: "Next", location: "Leicester", salary: "£28k–£35k", description: "Manage press relationships and coordinate product placement for seasonal collections.", tags: ["PR", "Fashion", "Comms"], industry: "Fashion", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 26, title: "Player Welfare Officer", company: "Premier League", location: "London", salary: "£30k–£38k", description: "Provide welfare and safeguarding support for players across Premier League academies.", tags: ["Welfare", "Football", "Safeguarding"], industry: "Football", type: "Full-time", workMode: "On-site", featured: false },
  { id: 27, title: "Video Editor – Football", company: "Sky Sports", location: "London", salary: "£35k–£45k", description: "Edit match highlights, analysis packages and social clips for Premier League coverage.", tags: ["Video", "Football", "Media"], industry: "Football", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 28, title: "Visual Merchandiser", company: "Selfridges", location: "London", salary: "£32k–£40k", description: "Design and install window displays and in-store visual concepts for luxury fashion brands.", tags: ["Visual", "Retail", "Fashion"], industry: "Fashion", type: "Full-time", workMode: "On-site", featured: true },
  { id: 29, title: "Music Rights Analyst", company: "Warner Music", location: "London", salary: "£34k–£44k", description: "Analyse royalty data and support licensing negotiations across the UK catalogue.", tags: ["Rights", "Music", "Data"], industry: "Music", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 30, title: "Recipe Developer", company: "Gousto", location: "London", salary: "£30k–£40k", description: "Create and test new recipes for the meal-kit subscription service.", tags: ["Food", "NPD", "Creative"], industry: "Hospitality", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 31, title: "Football Sponsorship Executive", company: "IMG", location: "London", salary: "£35k–£48k", description: "Manage brand activation and sponsor servicing across Premier League and EFL properties.", tags: ["Sponsorship", "Football", "Sales"], industry: "Football", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 32, title: "Documentary Researcher", company: "BBC Studios", location: "London", salary: "£28k–£36k", description: "Research stories and contributors for flagship factual and documentary series.", tags: ["Research", "Film", "Factual"], industry: "Film and TV", type: "Contract", workMode: "Hybrid", featured: false },
  { id: 33, title: "Textile Designer", company: "Burberry", location: "London", salary: "£38k–£50k", description: "Design original prints and woven textiles for mainline and accessories collections.", tags: ["Design", "Textiles", "Luxury"], industry: "Fashion", type: "Full-time", workMode: "On-site", featured: true },
  { id: 34, title: "Freelance Music Journalist", company: "NME", location: "Remote", salary: "Per piece £150–£400", description: "Write reviews, features and interviews covering UK and international music scenes.", tags: ["Writing", "Music", "Freelance"], industry: "Music", type: "Freelance", workMode: "Remote", featured: false },
  { id: 35, title: "Supply Chain Coordinator", company: "Deliveroo", location: "London", salary: "£32k–£42k", description: "Coordinate grocery fulfilment logistics across dark stores in Greater London.", tags: ["Supply Chain", "Grocery", "Logistics"], industry: "Grocery", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 36, title: "Grassroots Football Development Officer", company: "The FA", location: "Manchester", salary: "£28k–£35k", description: "Deliver coaching programmes and grow participation in underrepresented communities.", tags: ["Coaching", "Football", "Community"], industry: "Football", type: "Full-time", workMode: "On-site", featured: false },
  { id: 37, title: "Commissioning Editor – Arts", company: "Channel 4", location: "London", salary: "£55k–£72k", description: "Commission original arts and culture programming for linear and streaming platforms.", tags: ["Commissioning", "Arts", "TV"], industry: "Film and TV", type: "Full-time", workMode: "Hybrid", featured: true },
  { id: 38, title: "Accessories Designer", company: "Alexander McQueen", location: "London", salary: "£40k–£55k", description: "Design handbags and small leather goods from concept through to production.", tags: ["Accessories", "Luxury", "Design"], industry: "Fashion", type: "Full-time", workMode: "On-site", featured: false },
  { id: 39, title: "Gallery Assistant", company: "White Cube", location: "London", salary: "£25k–£30k", description: "Support exhibition installations and provide front-of-house services to gallery visitors.", tags: ["Gallery", "Art", "Culture"], industry: "Charity", type: "Full-time", workMode: "On-site", featured: false },
  { id: 40, title: "Barista Trainer", company: "Origin Coffee", location: "London", salary: "£28k–£34k", description: "Develop and deliver barista training programmes across all café locations.", tags: ["Training", "Coffee", "Hospitality"], industry: "Coffee", type: "Full-time", workMode: "On-site", featured: false },
  { id: 41, title: "Football Digital Content Producer", company: "EFL", location: "London", salary: "£32k–£42k", description: "Produce matchday and behind-the-scenes digital content for EFL clubs and social channels.", tags: ["Content", "Football", "Digital"], industry: "Football", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 42, title: "Freelance Motion Designer", company: "Vice Media", location: "Remote", salary: "Day rate £300–£450", description: "Create animated graphics and title sequences for digital editorial content.", tags: ["Motion", "Design", "Freelance"], industry: "Film and TV", type: "Freelance", workMode: "Remote", featured: false },
  { id: 43, title: "Garment Technologist", company: "Primark", location: "London", salary: "£35k–£45k", description: "Ensure quality and fit standards across jersey and knitwear product categories.", tags: ["Technical", "Fashion", "Quality"], industry: "Fashion", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 44, title: "Theatre Marketing Manager", company: "National Theatre", location: "London", salary: "£40k–£52k", description: "Plan and execute marketing campaigns for the NT's programme of productions.", tags: ["Theatre", "Marketing", "Culture"], industry: "Film and TV", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 45, title: "Food Safety Manager", company: "Tesco", location: "Welwyn Garden City", salary: "£48k–£60k", description: "Lead food safety compliance and supplier audit programmes across own-brand products.", tags: ["Food Safety", "Compliance", "Grocery"], industry: "Grocery", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 46, title: "Sports Data Engineer", company: "Opta (Stats Perform)", location: "London", salary: "£50k–£68k", description: "Build data pipelines processing real-time match events across football and cricket.", tags: ["Data", "Engineering", "Sport"], industry: "Football", type: "Full-time", workMode: "Remote", featured: true },
  { id: 47, title: "Podcast Marketing Intern", company: "Acast", location: "London", salary: "£23k", description: "Support podcast growth campaigns and creator marketing across UK shows.", tags: ["Podcast", "Marketing", "Internship"], industry: "Music", type: "Internship", workMode: "Hybrid", featured: false },
  { id: 48, title: "Menswear Stylist", company: "Mr Porter", location: "London", salary: "£35k–£48k", description: "Style editorial shoots and curate outfit recommendations for the online magazine.", tags: ["Styling", "Menswear", "Editorial"], industry: "Fashion", type: "Full-time", workMode: "On-site", featured: false },
  { id: 49, title: "Freelance Sound Engineer", company: "Printworks", location: "London", salary: "Day rate £350–£500", description: "Provide front-of-house sound engineering for electronic music events.", tags: ["Sound", "Live", "Freelance"], industry: "Music", type: "Freelance", workMode: "On-site", featured: false },
  { id: 50, title: "Plant-Based NPD Scientist", company: "Oatly", location: "London", salary: "£40k–£55k", description: "Develop new plant-based dairy alternative products from bench to pilot scale.", tags: ["NPD", "Science", "Food"], industry: "Grocery", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 51, title: "Football Academy Coordinator", company: "Manchester City", location: "Manchester", salary: "£28k–£35k", description: "Coordinate logistics and player development programmes across the academy age groups.", tags: ["Academy", "Football", "Youth"], industry: "Football", type: "Full-time", workMode: "On-site", featured: false },
  { id: 52, title: "Social Media Manager", company: "ITV", location: "London", salary: "£36k–£46k", description: "Manage social strategy and content for Love Island and entertainment brands.", tags: ["Social", "TV", "Media"], industry: "Film and TV", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 53, title: "Footwear Designer", company: "Dr. Martens", location: "London", salary: "£42k–£55k", description: "Design seasonal footwear collections balancing heritage DNA with contemporary trends.", tags: ["Footwear", "Design", "Fashion"], industry: "Footwear", type: "Full-time", workMode: "Hybrid", featured: true },
  { id: 54, title: "Festival Site Manager", company: "Glastonbury", location: "Somerset", salary: "£35k–£48k", description: "Manage infrastructure and site logistics for the world's largest greenfield festival.", tags: ["Festival", "Operations", "Music"], industry: "Music", type: "Contract", workMode: "On-site", featured: false },
  { id: 55, title: "Bakery Development Chef", company: "Waitrose", location: "Bracknell", salary: "£38k–£50k", description: "Develop artisan bakery products for the in-store bakery and packaged bread ranges.", tags: ["Bakery", "NPD", "Food"], industry: "Grocery", type: "Full-time", workMode: "On-site", featured: false },
  { id: 56, title: "Football Commercial Manager", company: "Chelsea FC", location: "London", salary: "£48k–£62k", description: "Sell and deliver commercial partnerships across matchday, stadium and digital assets.", tags: ["Commercial", "Football", "Partnerships"], industry: "Football", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 57, title: "Investigative Journalist – Media", company: "Financial Times", location: "London", salary: "£50k–£68k", description: "Investigate business stories across the media, entertainment and technology sectors.", tags: ["Journalism", "Investigation", "Media"], industry: "Journalism", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 58, title: "Trend Forecaster", company: "WGSN", location: "London", salary: "£38k–£50k", description: "Research and write trend reports for global fashion and lifestyle brands.", tags: ["Trends", "Research", "Fashion"], industry: "Fashion", type: "Full-time", workMode: "Remote", featured: false },
  { id: 59, title: "Museum Curator – Design", company: "V&A", location: "London", salary: "£38k–£48k", description: "Curate exhibitions and manage collections across fashion, textiles and design.", tags: ["Curation", "Museum", "Culture"], industry: "Charity", type: "Full-time", workMode: "On-site", featured: false },
  { id: 60, title: "Gameplay Programmer", company: "Rockstar Games", location: "Edinburgh", salary: "£35k–£65k", description: "Code core game mechanics, physics systems, and player interactions for AAA titles.", tags: ["Programming", "Games", "Development"], industry: "Gaming", type: "Full-time", workMode: "On-site", featured: true },
  { id: 61, title: "QA Tester", company: "Playground Games", location: "Leamington Spa", salary: "£22k–£28k", description: "Test for bugs, glitches, and gameplay issues across console and PC platforms.", tags: ["QA", "Testing", "Games"], industry: "Gaming", type: "Full-time", workMode: "On-site", featured: false },
  { id: 62, title: "3D Character Artist", company: "Ninja Theory", location: "Cambridge", salary: "£30k–£50k", description: "Model, texture, and sculpt characters for next-gen action-adventure games.", tags: ["Art", "3D", "Games"], industry: "Gaming", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 63, title: "Community Manager", company: "Jagex", location: "Cambridge", salary: "£28k–£38k", description: "Engage with the RuneScape player community across social media, forums, and Discord.", tags: ["Community", "Social", "Games"], industry: "Gaming", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 64, title: "Broadcast Journalist", company: "BBC News", location: "London", salary: "£30k–£45k", description: "Report for TV and radio - writing scripts, presenting, and filing news packages.", tags: ["Broadcast", "News", "Journalism"], industry: "Journalism", type: "Full-time", workMode: "On-site", featured: true },
  { id: 65, title: "Digital Editor", company: "The Guardian", location: "London", salary: "£38k–£52k", description: "Manage the newsroom's website, CMS, and real-time digital publishing.", tags: ["Digital", "Editorial", "News"], industry: "Journalism", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 66, title: "Social Media Editor", company: "Sky News", location: "London", salary: "£32k–£42k", description: "Break news and drive engagement across Sky News social platforms.", tags: ["Social", "News", "Digital"], industry: "Journalism", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 67, title: "Bench Jeweller", company: "Pragnell", location: "Stratford-upon-Avon", salary: "£28k–£42k", description: "Hand-fabricate, solder, set stones, and finish fine jewellery for a Royal Warrant holder.", tags: ["Jewellery", "Craft", "Luxury"], industry: "Jewellery", type: "Full-time", workMode: "On-site", featured: true },
  { id: 68, title: "Jewellery Sales Consultant", company: "Boodles", location: "London", salary: "£26k–£35k + commission", description: "Advise clients on engagement rings, fine jewellery, and bespoke commissions in Mayfair.", tags: ["Sales", "Luxury", "Retail"], industry: "Jewellery", type: "Full-time", workMode: "On-site", featured: false },
  { id: 69, title: "E-commerce Manager", company: "Monica Vinader", location: "London", salary: "£38k–£52k", description: "Own the DTC digital experience - product pages, conversion, and online merchandising.", tags: ["E-commerce", "Digital", "Jewellery"], industry: "Jewellery", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 70, title: "Gemmologist", company: "De Beers", location: "London", salary: "£30k–£50k", description: "Grade and certify diamonds and gemstones for quality, colour, and clarity.", tags: ["Gems", "Quality", "Luxury"], industry: "Jewellery", type: "Full-time", workMode: "On-site", featured: false },
  { id: 60, title: "Freelance Sommelier", company: "The River Café", location: "London", salary: "Day rate £250–£400", description: "Curate wine pairings and host tasting events at one of London's iconic restaurants.", tags: ["Wine", "Hospitality", "Freelance"], industry: "Hospitality", type: "Freelance", workMode: "On-site", featured: false },
  { id: 61, title: "Football Ticketing Manager", company: "Wembley Stadium", location: "London", salary: "£42k–£55k", description: "Manage ticketing operations for international matches, FA Cup finals and major football events.", tags: ["Ticketing", "Football", "Operations"], industry: "Football", type: "Full-time", workMode: "On-site", featured: false },
  { id: 62, title: "Streaming Rights Manager", company: "Amazon Prime Video", location: "London", salary: "£55k–£72k", description: "Negotiate and manage content licensing deals for sport and entertainment in the UK.", tags: ["Rights", "Streaming", "Legal"], industry: "Film and TV", type: "Full-time", workMode: "Hybrid", featured: true },
  { id: 63, title: "Denim Designer", company: "Levi's", location: "London", salary: "£38k–£50k", description: "Design seasonal denim collections for the European market with a focus on sustainability.", tags: ["Denim", "Design", "Sustainability"], industry: "Fashion", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 64, title: "Creative Writing Intern", company: "Penguin Random House", location: "London", salary: "£24k", description: "Support editorial teams with manuscript reading, copywriting and author event coordination.", tags: ["Writing", "Publishing", "Internship"], industry: "Film and TV", type: "Internship", workMode: "Hybrid", featured: false },
  { id: 65, title: "Quality Assurance Manager", company: "Sainsbury's", location: "London", salary: "£45k–£58k", description: "Lead QA processes across chilled food supply chain and own-label manufacturing partners.", tags: ["QA", "Grocery", "Supply Chain"], industry: "Grocery", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 66, title: "Football Physiotherapist", company: "Leicester City FC", location: "Leicester", salary: "£32k–£42k", description: "Deliver pitch-side and rehabilitation physiotherapy for first team and U21 squads.", tags: ["Physio", "Football", "Performance"], industry: "Football", type: "Full-time", workMode: "On-site", featured: false },
  { id: 67, title: "Audience Development Manager", company: "The Times", location: "London", salary: "£45k–£58k", description: "Drive subscriber growth through data-driven audience acquisition and retention strategies.", tags: ["Audience", "Growth", "Media"], industry: "Film and TV", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 68, title: "Jewellery Designer", company: "Monica Vinader", location: "London", salary: "£35k–£48k", description: "Design fine and demi-fine jewellery collections from concept to production-ready CADs.", tags: ["Jewellery", "Design", "Luxury"], industry: "Fashion", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 69, title: "Freelance DJ Booker", company: "Fabric", location: "London", salary: "Per event £200–£500", description: "Scout, book and manage DJ talent for weekly and special events at the iconic nightclub.", tags: ["Booking", "Music", "Freelance"], industry: "Music", type: "Freelance", workMode: "On-site", featured: false },
  { id: 70, title: "Delivery Operations Analyst", company: "Ocado", location: "Hatfield", salary: "£34k–£44k", description: "Optimise last-mile delivery routing and capacity planning using operational data.", tags: ["Operations", "Data", "Logistics"], industry: "Grocery", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 71, title: "Strength & Conditioning Coach", company: "Arsenal FC", location: "London", salary: "£45k–£60k", description: "Design and deliver S&C programmes for the first team and academy squads.", tags: ["S&C", "Football", "Performance"], industry: "Football", type: "Full-time", workMode: "On-site", featured: true },
  { id: 72, title: "Scriptwriter – Entertainment", company: "Banijay UK", location: "London", salary: "£32k–£42k", description: "Write scripts and running orders for entertainment and reality TV formats.", tags: ["Scriptwriting", "TV", "Creative"], industry: "Film and TV", type: "Contract", workMode: "Hybrid", featured: false },
  { id: 73, title: "Retail Store Manager", company: "COS", location: "Manchester", salary: "£34k–£42k", description: "Lead store operations, team management and visual merchandising for the premium fashion retailer.", tags: ["Retail", "Management", "Fashion"], industry: "Fashion", type: "Full-time", workMode: "On-site", featured: false },
  { id: 74, title: "Touring Production Manager", company: "Live Nation", location: "London", salary: "£42k–£58k", description: "Manage production logistics for major UK and European arena and stadium tours.", tags: ["Touring", "Production", "Live"], industry: "Music", type: "Full-time", workMode: "On-site", featured: false },
  { id: 75, title: "Nutrition Intern", company: "Mindful Chef", location: "London", salary: "£22k", description: "Assist the nutrition team with meal planning, macro analysis and recipe content creation.", tags: ["Nutrition", "Food", "Internship"], industry: "Hospitality", type: "Internship", workMode: "Hybrid", featured: false },
  { id: 76, title: "Senior Negotiator", company: "Foxtons", location: "London", salary: "£28k–£45k + commission", description: "Manage property viewings, negotiate offers, and progress sales through to completion across prime London postcodes.", tags: ["Sales", "Property", "Negotiation"], industry: "Estate Agency", type: "Full-time", workMode: "On-site", featured: true },
  { id: 77, title: "Lettings Manager", company: "Savills", location: "London", salary: "£40k–£55k", description: "Lead the lettings team, manage landlord relationships, and drive revenue across a portfolio of premium rental properties.", tags: ["Lettings", "Property", "Management"], industry: "Estate Agency", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 78, title: "Digital Marketing Executive", company: "Rightmove", location: "London", salary: "£32k–£42k", description: "Plan and execute digital campaigns to drive agent sign-ups and consumer engagement on the UK's largest property portal.", tags: ["Digital", "Marketing", "Property"], industry: "Estate Agency", type: "Full-time", workMode: "Hybrid", featured: true },
  { id: 79, title: "Property Valuer", company: "Knight Frank", location: "London", salary: "£35k–£50k", description: "Conduct market appraisals and provide accurate valuations for residential properties across prime central London.", tags: ["Valuation", "Property", "Residential"], industry: "Estate Agency", type: "Full-time", workMode: "On-site", featured: false },
  { id: 80, title: "PropTech Product Manager", company: "Purplebricks", location: "Remote", salary: "£55k–£72k", description: "Lead product development for the online estate agency platform, driving UX improvements and conversion optimisation.", tags: ["Product", "PropTech", "Digital"], industry: "Estate Agency", type: "Full-time", workMode: "Remote", featured: false },
  { id: 81, title: "Sneaker Buyer", company: "Nike", location: "London", salary: "£40k–£55k", description: "Curate seasonal sneaker assortments for UK retail partners and Nike.com, balancing trend, allocation and margin.", tags: ["Buying", "Footwear", "Retail"], industry: "Footwear", type: "Full-time", workMode: "Hybrid", featured: true },
  { id: 82, title: "E-Commerce Manager", company: "Birkenstock", location: "London", salary: "£45k–£60k", description: "Own the UK direct-to-consumer digital experience, from product pages to checkout conversion.", tags: ["E-commerce", "Digital", "Footwear"], industry: "Footwear", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 83, title: "Sustainability Analyst", company: "Timberland", location: "London", salary: "£35k–£48k", description: "Track environmental KPIs and support the brand's commitment to net-positive impact by 2030.", tags: ["Sustainability", "ESG", "Footwear"], industry: "Footwear", type: "Full-time", workMode: "Remote", featured: false },
  { id: 84, title: "Brand Marketing Manager", company: "UGG", location: "London", salary: "£42k–£58k", description: "Plan and execute seasonal marketing campaigns for the UK market across digital and retail.", tags: ["Marketing", "Brand", "Footwear"], industry: "Footwear", type: "Full-time", workMode: "Hybrid", featured: false },
  { id: 85, title: "Production Coordinator", company: "Dr. Martens", location: "Northamptonshire", salary: "£28k–£36k", description: "Coordinate 'Made in England' production schedules at the Cobbs Lane factory.", tags: ["Production", "Manufacturing", "Footwear"], industry: "Footwear", type: "Full-time", workMode: "On-site", featured: false },
];

const featuredEmployers = [
  { name: "Nike", industry: "Footwear" },
  { name: "Netflix", industry: "Film and TV" },
  { name: "ASOS", industry: "Fashion" },
  { name: "Spotify", industry: "Music" },
  { name: "A24", industry: "Film and TV" },
  { name: "Broadwick", industry: "Music" },
  { name: "Ocado", industry: "Grocery" },
  { name: "Dice", industry: "Music" },
  { name: "Arsenal FC", industry: "Football" },
  { name: "Tottenham Hotspur", industry: "Football" },
  { name: "The FA", industry: "Football" },
  { name: "Sky Sports", industry: "Football" },
  { name: "Chelsea FC", industry: "Football" },
  { name: "Manchester City", industry: "Football" },
  { name: "Dr. Martens", industry: "Footwear" },
  { name: "Birkenstock", industry: "Footwear" },
];

// Derived from the canonical industry list (src/data/industries.ts) so new
// industries appear as filter chips automatically - no separate hardcoded list
// to drift. "All" is prepended as the default no-filter option.
const industries = ["All", ...CANONICAL_INDUSTRIES.map((i) => i.name)];
const locations = ["All", "London", "Manchester", "Remote", "Leicester", "Hatfield", "Loughborough"];
const jobTypes = ["All", "Full-time", "Part-time", "Temporary", "Internship / Graduate", "Apprenticeship", "Freelance"];
const workModes = ["All", "Remote", "Hybrid", "On-site"];
const salaryRanges = ["All", "Under £30k", "£30k–£50k", "£50k–£70k", "£70k+"];
const careerLevels = ["All", "Entry", "Mid", "Senior", "Executive"];

function parseSalaryBand(salary: string): number {
  const match = salary.match(/£([\d,]+)k/);
  return match ? parseInt(match[1].replace(",", "")) * 1000 : 0;
}

function inSalaryRange(salary: string, range: string): boolean {
  if (range === "All") return true;
  const val = parseSalaryBand(salary);
  if (!val) return true; // day-rate / project-rate always shown
  if (range === "Under £30k") return val < 30000;
  if (range === "£30k–£50k") return val >= 30000 && val <= 50000;
  if (range === "£50k–£70k") return val > 50000 && val <= 70000;
  if (range === "£70k+") return val > 70000;
  return true;
}

// ── Component ────────────────────────────────────────────────

// Map display industry names to DB slugs
const INDUSTRY_SLUG_MAP: Record<string, string> = {
  "Estate Agency": "estate-agency",
  "Interior Design": "interior-design",
  "Food & Drink": "hospitality",
  "Food and Drink": "hospitality",
  "Hospitality": "hospitality",
  "Film and TV": "cinema",
  "Cinema": "cinema",
  "Remote": "remote",
};

const normalizeFilterToken = (value: string) =>
  value.toLowerCase().trim().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-');

function canonicalizeIndustryParam(value: string | null): string {
  if (!value) return "All";
  const raw = value.trim();
  if (!raw || raw.toLowerCase() === "all") return "All";

  const normalized = normalizeFilterToken(raw);
  const byLabel = industries.find((industry) => industry !== "All" && normalizeFilterToken(industry) === normalized);
  if (byLabel) return byLabel;

  const byAlias = Object.entries(INDUSTRY_SLUG_MAP).find(([, slug]) => slug === normalized)?.[0];
  if (byAlias) return byAlias;

  return raw;
}

function normalizeIndustryFilter(name: string): string {
  if (name === "All") return "All";
  const canonical = canonicalizeIndustryParam(name);
  return INDUSTRY_SLUG_MAP[canonical] || normalizeFilterToken(canonical);
}

// Some user-facing industries span multiple DB `industry` buckets. "Food & Drink"
// in particular has no rows tagged `food-drink` - those listings live under
// hospitality / grocery / coffee / bakery / beer. Expanding the slug here means
// picking the chip surfaces the full ~5,000-job pool instead of just one bucket.
const INDUSTRY_SLUG_EXPANSIONS: Record<string, string[]> = {
  hospitality: ["hospitality", "coffee", "bakery", "beer"],
};

function expandIndustrySlug(slug: string): string[] {
  return INDUSTRY_SLUG_EXPANSIONS[slug] ?? [slug];
}

const INDUSTRY_FALLBACK_FILTERS: Record<string, { companies: string[]; titles: string[]; strongTitles?: string[] }> = {
  beauty: {
    companies: [
      'superdrug', 'facegym', 'boots uk', 'boots plc', 'sephora', 'charlotte tilbury', 'space nk',
      'loreal', "l'oréal", 'aesop', 'glossier', 'estee lauder', 'estée lauder', 'mac cosmetics',
      'the body shop', 'lush ', 'lush retail', 'rituals', 'molton brown', 'jo malone', 'penhaligon',
      'elemis', 'liz earle', 'no7 beauty', 'soap & glory', 'revolution beauty', 'cult beauty',
      'beauty pie', 'feelunique', 'lookfantastic', 'birchbox', 'glossybox', 'morphe', 'nyx',
      'mac uk', 'urban decay', 'benefit cosmetics', 'clinique', 'clarins', 'shiseido', 'bobbi brown',
      'toni & guy', 'larry king hair', 'townhouse beauty', 'thg beauty',
    ],
    titles: ['makeup', 'skincare', 'cosmetic', 'fragrance', 'haircare', 'beauty advisor', 'beauty consultant', 'beauty editor', 'beauty buyer', 'beauty marketing'],
    strongTitles: ['beauty therapist', 'spa therapist', 'esthetician', 'aesthetician', 'makeup artist', 'nail technician', 'lash technician', 'hair stylist', 'hairdresser', 'colourist', 'salon manager', 'spa manager', 'cosmetic chemist', 'beauty advisor'],
  },
  jewellery: {
    companies: ['pragnell', 'tiffany', 'cartier', 'bulgari', 'graff', 'boodles', 'mappin & webb', 'goldsmiths', 'beaverbrooks', 'ernest jones', 'h samuel', 'pandora', 'monica vinader', 'astley clarke', 'missoma', 'links of london', 'theo fennell', 'david morris', 'asprey', 'garrard'],
    titles: ['jewellery', 'jeweller', 'goldsmith', 'silversmith', 'gemmolog', 'gemolog', 'diamond grader', 'diamond mounter', 'stone setter', 'bench jeweller', 'watchmaker', 'horolog'],
    strongTitles: ['jewellery designer', 'jewellery sales', 'jewellery consultant', 'jewellery buyer', 'fine jewellery'],
  },
  bakery: {
    companies: ['greggs', 'gail', "gail's", 'paul uk', 'paul bakery', 'pret a manger', 'le pain quotidien', 'fabrique', 'dominique ansel', 'bread ahead', 'st john bakery', 'flourish bakery', 'cinnamon square', 'pophams', 'jolene bakery', 'real patisserie', 'karaway bakery', 'lovingly artisan'],
    titles: ['baker', 'pastry chef', 'patissier', 'bread maker', 'viennoiserie', 'sourdough'],
    strongTitles: ['head baker', 'bakery manager', 'pastry chef', 'bakery assistant', 'production baker'],
  },
  pets: {
    companies: ['pets at home', 'jollyes', 'petsmart', 'cats protection', 'rspca', 'pdsa', 'blue cross', 'battersea dogs', 'dogs trust', 'guide dogs', 'medivet', 'vets4pets', 'companion care', 'cvs group', 'ivc evidensia', 'linnaeus', 'butternut box', 'lily kitchen', "lily's kitchen", 'tails.com', 'forthglade', 'burns pet', 'royal canin', 'mars petcare'],
    titles: ['veterinary', 'vet nurse', 'animal care', 'pet care', 'kennel', 'cattery', 'dog groom', 'dog walk', 'pet sitter', 'animal welfare'],
    strongTitles: ['veterinary surgeon', 'veterinary nurse', 'animal behaviourist', 'pet shop assistant', 'dog groomer', 'pet food'],
  },
  influencing: {
    companies: ['whalar', 'gleam futures', 'ymu group', 'goat agency', 'billion dollar boy', 'tiktok', 'youtube', 'meta platforms', 'instagram', 'substack', 'patreon', 'linktree', 'beacons', 'creatoriq', 'tribe dynamics', 'klear', 'aspire.io', 'humanz', 'tagger media', 'fohr', 'captiv8', 'mavrck', 'the tab', 'vice media', 'ladbible', 'unilad', 'pocket', 'social chain', 'fanbytes', 'takumi', 'tribe agency', 'buttermilk', 'collectively', 'viral nation', 'wpromote', 'studio71', 'jellysmack', 'spotter', 'creator plus'],
    titles: ['influencer', 'creator', 'content creator', 'social media manager', 'social media executive', 'community manager', 'youtube manager', 'tiktok manager', 'paid social', 'social strategist', 'social media strategist', 'partnerships manager', 'creator partnerships', 'influencer marketing', 'talent manager', 'talent agent', 'video editor', 'short form video', 'reels editor', 'tiktok editor', 'podcast producer', 'newsletter editor'],
    strongTitles: ['influencer marketing', 'creator marketing', 'creator partnerships', 'talent manager creator', 'social media manager', 'content creator', 'tiktok manager', 'youtube manager', 'community manager', 'creator economy'],
  },
  gaming: {
    companies: ['rockstar games', 'rockstar north', 'sony interactive', 'playstation', 'sumo digital', 'rebellion developments', 'creative assembly', 'codemasters', 'jagex', 'mediatonic', 'splash damage', 'frontier developments', 'ninja theory', 'rocksteady studios', 'team17', 'sega europe', 'ubisoft', 'ea games', 'electronic arts', 'epic games', 'unity technologies', 'king digital', 'king games', 'space ape games', 'kwalee', 'natural motion', 'supercell', 'zynga', 'square enix', 'bandai namco'],
    titles: ['game designer', 'game developer', 'game artist', 'game programmer', 'gameplay engineer', 'game producer', 'game tester', 'esports', 'unity developer', 'unreal engine', 'level designer', 'narrative designer'],
    strongTitles: ['game designer', 'game developer', 'gameplay programmer', 'qa games', 'game qa', 'game writer'],
  },
  travel: {
    companies: ['british airways', 'virgin atlantic', 'easyjet', 'ryanair', 'jet2', 'tui ', 'on the beach', 'expedia uk', 'booking.com', 'skyscanner', 'lastminute.com', 'trainline', 'national rail', 'great western railway', 'lner', 'avanti west coast', 'gatwick airport', 'heathrow airport', 'manchester airport', 'stansted airport', 'p&o cruises', 'cunard', 'saga cruises', 'fred olsen', 'kuoni', 'audley travel', 'abercrombie & kent', 'thomas cook'],
    titles: ['cabin crew', 'flight attendant', 'pilot ', 'first officer', 'airport operations', 'ground handler', 'baggage handler', 'aviation', 'train driver', 'rail engineer', 'station manager', 'travel consultant', 'tour operator', 'cruise ', 'concierge', 'reservations agent', 'booking agent', 'tour guide'],
    strongTitles: ['cabin crew', 'flight attendant', 'travel consultant', 'tour operator', 'reservations'],
  },
  journalism: {
    companies: ['bbc news', 'bbc journalism', 'sky news', 'itn ', 'reuters', 'bloomberg news', 'financial times', 'the guardian', 'guardian news', 'the times', 'sunday times', 'daily telegraph', 'telegraph media', 'the independent', 'evening standard', 'metro newspaper', 'mirror group', 'reach plc', 'news uk', 'press association', 'pa media', 'channel 4 news', 'channel 5 news', 'condé nast', 'conde nast', 'hearst uk', 'haymarket'],
    titles: ['journalist', 'reporter', 'news editor', 'sub editor', 'sub-editor', 'broadcast journalist', 'newsroom', 'feature writer', 'staff writer', 'editorial assistant', 'correspondent'],
    strongTitles: ['journalist', 'reporter', 'newsroom', 'sub editor', 'sub-editor'],
  },
  footwear: {
    companies: ['dr martens', 'dr. martens', 'clarks', 'clarks shoes', 'kurt geiger', 'office shoes', 'schuh', 'jd sports footwear', 'foot locker', 'foot asylum', 'birkenstock', 'ugg ', 'ugg uk', 'timberland uk', 'crocs uk', 'vans uk', 'converse uk', 'reebok uk', 'new balance uk', 'asics uk', 'on running', 'hotter shoes', 'jimmy choo', 'manolo blahnik', 'church shoes', 'church\'s', "church's", 'loake'],
    titles: ['footwear designer', 'shoe designer', 'sneaker', 'shoe buyer', 'footwear buyer', 'last maker', 'shoe maker', 'shoemaker', 'cordwainer', 'pattern cutter footwear'],
    strongTitles: ['footwear designer', 'shoe designer', 'footwear developer', 'footwear technologist', 'shoe sales'],
  },
  coffee: {
    companies: ['costa coffee', 'caffe nero', 'caffè nero', 'starbucks uk', 'pret a manger', 'leon restaurants', 'blank street', 'grind coffee', 'workshop coffee', 'monmouth coffee', 'square mile coffee', 'origin coffee', 'allpress', 'ozone coffee', 'kiss the hippo', 'difference coffee', 'union hand-roasted', 'lavazza uk', 'illy uk', 'percol coffee'],
    titles: ['barista', 'coffee roaster', 'coffee buyer', 'cafe manager', 'café manager', 'q grader'],
    strongTitles: ['barista', 'head barista', 'coffee roaster', 'coffee buyer', 'café manager', 'coffee shop manager'],
  },
  football: {
    companies: [
      'football club', ' fc ', ' fc,', ' f.c', 'afc ', 'manchester united', 'manchester city',
      'liverpool fc', 'arsenal', 'chelsea fc', 'tottenham', 'everton', 'burnley', 'southampton',
      'leicester city', 'brighton', 'crystal palace', 'fulham', 'watford', 'norwich city',
      'birmingham city', 'wrexham', 'middlesbrough', 'derby county', 'celtic', 'rangers',
      'the fa', 'football association', 'premier league', 'efl', 'english football league',
      'uefa', 'fifa', 'sky sports', 'dazn', 'bt sport', 'tnt sports', 'stats perform', 'opta',
      'kitman labs', 'transferroom', 'city football group', 'jobs in football', 'nlp sports',
      'smartodds', 'football beyond borders', 'inploi football', 'european football clubs',
    ],
    titles: [
      'football', 'soccer', 'matchday', 'match day', 'academy coach', 'football coach',
      'sports analyst', 'performance analyst', 'football operations', 'kit manager',
      'grounds manager', 'pitch ', 'scout ', 'recruitment analyst', 'head of football',
      'sports scientist', 'football safeguarding', 'football coaching', 'football development',
    ],
    strongTitles: [
      'football coach', 'academy coach', 'first team', 'goalkeeper coach', 'football scout',
      'head of recruitment', 'football analyst', 'matchday operations', 'stadium manager',
      'football physiotherapist', 'football operations',
    ],
  },
  cars: {
    // Use specific multi-word company names so substrings like "ford" don't
    // catch "Bromford"/"Oxford"/"Welford" and pull in unrelated jobs.
    companies: [
      'jaguar land rover', 'jaguar', 'land rover', 'jlr', 'bentley motors', 'aston martin',
      'nissan uk', 'nissan motor', 'bmw group', 'mini plant', 'rolls-royce motor',
      'pendragon', 'stratstone', 'evans halshaw', 'arnold clark', 'sytner', 'lookers',
      'motorpoint', 'listers', 'inchcape', 'vertu motors', 'marshall motor',
      'octopus electric vehicles', 'halfords', 'kwik fit', 'kwik-fit',
      'autotrader', 'auto trader', 'mclaren automotive', 'lotus cars', 'morgan motor',
      'vauxhall motors', 'toyota motor', 'honda motor', 'ford motor', 'tesla motors',
      'porsche cars', 'audi uk', 'mercedes-benz', 'volkswagen group', 'stellantis',
      'the aa', 'aa plc', 'rac motoring', 'rac breakdown',
    ],
    titles: [
      'vehicle technician', 'master technician', 'motor technician', 'mot tester',
      'service advisor', 'parts advisor', 'parts manager',
      'bodyshop', 'body shop', 'paint technician', 'smart repair',
      'automotive engineer', 'powertrain engineer', 'aerodynamics engineer',
      'ev charging', 'ev powertrain', 'electric vehicle',
      'dealership', 'showroom sales', 'car sales executive', 'used car buyer',
      'fleet manager', 'vehicle logistics', 'remarketing manager',
      'autonomous driving', 'connected car', 'mobility solutions',
    ],
  },
};

function matchesIndustryFilter(job: Pick<Job, 'industry' | 'company' | 'title' | 'tags'>, selectedIndustry: string): boolean {
  if (selectedIndustry === "All") return true;

  const selectedSlug = normalizeIndustryFilter(selectedIndustry);
  const jobIndustrySlug = normalizeIndustryFilter(job.industry || '');
  // Some chips (e.g. "Food & Drink") map to several DB industry slugs.
  // Accept any job whose industry is in the expanded set so we don't drop
  // grocery/coffee/bakery/beer rows when the user picks Food & Drink.
  const acceptedSlugs = new Set(expandIndustrySlug(selectedSlug));
  if (acceptedSlugs.has(jobIndustrySlug)) return true;

  const fallback = INDUSTRY_FALLBACK_FILTERS[selectedSlug];
  if (!fallback) return false;

  const companyHay = (job.company || '').toLowerCase();
  const titleHay = (job.title || '').toLowerCase();
  const haystack = `${job.company} ${job.title} ${job.tags.join(' ')}`.toLowerCase();

  // Strong title or company match overrides industry mis-tagging
  // (e.g. "Beauty Therapist" at any company → counts as Beauty even if the
  // ingestion engine mis-tagged it as psychotherapy).
  const strongTitleMatch = (fallback.strongTitles ?? []).some((t) => titleHay.includes(t));
  const strongCompanyMatch = fallback.companies.some((c) => companyHay.includes(c));
  if (strongTitleMatch || strongCompanyMatch) return true;

  // Weaker keyword fallback - but reject when the job is already tagged to
  // a different recognised industry to prevent generic-token leakage.
  // Slugs in the accepted-expansion set (e.g. beer/coffee for Food & Drink)
  // are NOT treated as competing industries here.
  const KNOWN_INDUSTRY_SLUGS = new Set(industries.filter((i) => i !== 'All').map((i) => normalizeIndustryFilter(i)));
  if (jobIndustrySlug && !acceptedSlugs.has(jobIndustrySlug) && KNOWN_INDUSTRY_SLUGS.has(jobIndustrySlug)) {
    return false;
  }

  return fallback.titles.some((title) => haystack.includes(title));
}

// Server-side role filtering: maps a role-slug to (a) canonical role_category
// values stored in the DB and (b) title ilike patterns. Used to push the role
// filter down into the SQL query so we don't pull all 28k jobs into memory.
const ROLE_SQL_FILTERS: Record<string, { categories: string[]; titles: string[] }> = {
  marketing: { categories: ['Marketing', 'Communications', 'Events'], titles: ['marketing', 'brand', 'communications', 'comms', 'crm', 'content', 'campaign', 'copywriter', 'seo', 'ppc', 'paid media', 'paid social', 'influencer', 'martech', 'growth', 'event programs', 'event manager', 'events manager', 'event lead', 'events lead', 'event marketing', 'experiential', 'pr manager', 'public relations', 'ai research', 'research scientist', 'ai researcher', 'ml researcher', 'alignment', 'interpretability'] },
  finance: { categories: ['Finance'], titles: ['finance', 'accountant', 'accounting', 'financial', 'fp&a', 'treasury', 'tax', 'audit', 'bookkeep', 'payroll', 'controller'] },
  operations: { categories: ['Operations'], titles: ['operations', 'supply chain', 'logistics', 'warehouse', 'procurement', 'fulfilment', 'distribution'] },
  strategy: { categories: ['Strategy'], titles: ['strategy', 'strategic', 'business development', 'corporate development', 'chief of staff', 'consultant', 'consulting'] },
  sales: { categories: ['Sales'], titles: ['sales', 'account manager', 'account executive', 'business development', 'partnerships'] },
  product: { categories: ['Product'], titles: ['product manager', 'product owner', 'product design', 'product marketing'] },
  creative: { categories: ['Creative'], titles: ['creative', 'designer', 'art director', 'photographer', 'videographer', 'illustrator', 'graphic designer'] },
  'hr-people': { categories: ['HR & People', 'People & Culture', 'HR'], titles: ['human resources', 'talent', 'recruitment', 'recruiter', 'people partner', 'people manager', 'employee relations', 'reward', 'compensation'] },
  // Note: 'counsel' is intentionally excluded as a title keyword - it matches "counsellor"
  // (a psychotherapy role). Use specific phrases like 'general counsel' / 'legal counsel' instead.
  'legal-compliance': { categories: ['Legal', 'Legal & Compliance', 'Compliance'], titles: ['legal', 'compliance officer', 'regulatory affairs', 'governance', 'solicitor', 'lawyer', 'paralegal', 'general counsel', 'legal counsel', 'in-house counsel', 'ai policy', 'ai safety', 'ai governance', 'trust and safety', 'trust & safety', 'responsible ai', 'ai ethics', 'ai risk', 'red team', 'red-team'] },
  'project-management': { categories: ['Project Management', 'Project & Programme Management'], titles: ['project manager', 'programme manager', 'program manager', 'pmo', 'delivery manager', 'scrum master'] },
  commercial: { categories: ['Commercial'], titles: ['commercial', 'trading', 'trader', 'merchandiser', 'merchandising', 'category manager', 'buying', 'buyer', 'ai product manager', 'ai sales', 'ai go-to-market', 'ai gtm', 'ai partnerships', 'ai account', 'ai customer', 'ai solutions', 'ai consultant', 'ai strategy', 'forward deployed'] },
  ecommerce: { categories: ['E-commerce', 'Ecommerce'], titles: ['ecommerce', 'e-commerce', 'digital trading', 'online trading'] },
  'it-technology': { categories: ['Technology', 'IT & Technology', 'IT', 'Tech'], titles: ['engineer', 'developer', 'software', 'devops', 'cloud', 'data engineer', 'data scientist', 'machine learning', 'security engineer', 'sre', 'full stack', 'frontend', 'backend', 'machine learning engineer', 'ml engineer', 'research engineer', 'applied ai', 'applied scientist', 'ai engineer', 'deep learning', 'mlops', 'ai infrastructure', 'model engineer', 'forward deployed engineer'] },
  ai: { categories: ['AI', 'AI Engineering', 'AI Research', 'AI Commercial', 'AI Sales', 'AI Policy', 'AI Safety', 'Trust & Safety', 'Machine Learning', 'ML', 'Research'], titles: ['machine learning engineer', 'ml engineer', 'research engineer', 'applied ai', 'applied scientist', 'ai engineer', 'deep learning', 'mlops', 'ai infrastructure', 'model engineer', 'forward deployed engineer', 'forward deployed', 'research scientist', 'alignment', 'interpretability', 'frontier model', 'ai researcher', 'ml researcher', 'member of technical staff', 'ai product manager', 'ai sales', 'ai go-to-market', 'ai gtm', 'ai partnerships', 'ai account', 'ai customer', 'ai solutions', 'ai consultant', 'ai strategy', 'ai policy', 'ai safety', 'ai governance', 'trust and safety', 'trust & safety', 'red team', 'red-team', 'responsible ai', 'ai ethics', 'ai risk', 'safety researcher'] },
  retail: { categories: ['Retail'], titles: ['store manager', 'retail', 'sales associate', 'shop floor', 'visual merchandiser', 'concession'] },
  // Craft roles
  barista: { categories: ['Barista'], titles: ['barista'] },
  bartender: { categories: ['Bartender', 'Front of House'], titles: ['bartender', 'front of house', 'waiter', 'waitress', 'server', 'bar staff', 'bar manager', 'mixologist'] },
  chef: { categories: ['Chef', 'Head Chef', 'Sous Chef', 'Baker'], titles: ['chef', 'baker', 'cook', 'pastry', 'kitchen'] },
  'hotel-manager': { categories: ['Hotel Manager', 'Hospitality Manager', 'Restaurant General Manager'], titles: ['hotel manager', 'general manager', 'duty manager', 'front office manager', 'reservations manager', 'guest experience'] },
  'estate-agent': { categories: ['Estate Agent'], titles: ['estate agent', 'lettings', 'property consultant', 'sales negotiator', 'lettings negotiator', 'valuer', 'branch manager'] },
  'mortgage-advisor': { categories: ['Mortgage Advisor'], titles: ['mortgage advisor', 'mortgage adviser', 'mortgage broker', 'mortgage consultant'] },
  'personal-trainer': { categories: ['Personal Trainer'], titles: ['personal trainer'] },
  'fitness-instructor': { categories: ['Fitness Instructor'], titles: ['fitness instructor', 'group exercise', 'yoga instructor', 'pilates instructor', 'spin instructor', 'gym instructor'] },
  'charity-fundraiser': { categories: ['Charity Fundraiser'], titles: ['fundraiser', 'fundraising', 'major gifts', 'individual giving', 'corporate partnerships'] },
  'garment-technologist': { categories: ['Garment Technologist'], titles: ['garment technologist', 'garment tech', 'fit technician', 'pattern cutter', 'pattern grader'] },
  stylist: { categories: ['Stylist', 'Designer', 'Interior Designer'], titles: ['stylist', 'fashion designer', 'interior designer', 'jewellery designer', 'creative director'] },
  producer: { categories: ['Producer'], titles: ['producer', 'production manager', 'line producer', 'executive producer'] },
  teacher: { categories: ['Teacher', 'Primary School Teacher', 'Secondary Teacher', 'Secondary School Teacher'], titles: ['teacher', 'tutor', 'lecturer', 'teaching assistant'] },
  physiotherapist: { categories: ['Physiotherapist', 'Senior Physiotherapist'], titles: ['physiotherapist', 'physio', 'physical therapist', 'sports therapist'] },
  psychotherapist: { categories: ['Psychotherapist'], titles: ['psychotherapist', 'counsellor', 'counselor', 'cbt therapist', 'psychologist'] },
  // Frontline roles
  'retail-assistant': { categories: ['Retail', 'Sales Assistant', 'Store Assistant'], titles: ['sales assistant', 'store assistant', 'retail assistant', 'shop assistant', 'store colleague', 'shop floor', 'cashier', 'till', 'concession', 'visual merchandiser', 'store supervisor', 'store manager', 'assistant store manager'] },
  'warehouse-delivery': { categories: ['Warehouse', 'Logistics', 'Driver'], titles: ['warehouse', 'picker', 'packer', 'pick & pack', 'forklift', 'flt', 'goods in', 'fulfilment', 'fulfillment', 'distribution', 'driver', 'hgv', 'lgv', 'van driver', 'delivery rider', 'courier', 'multi-drop', 'transport manager', 'shunter'] },
  'vehicle-technician': { categories: ['Vehicle Technician', 'Mechanic', 'Service Advisor', 'Parts Advisor'], titles: ['vehicle technician', 'mot tester', 'mechanic', 'motor technician', 'service advisor', 'parts advisor', 'bodyshop', 'paint technician', 'panel beater', 'master technician', 'workshop controller', 'aftersales', 'diagnostic technician'] },
  'beauty-therapist': { categories: ['Beauty Therapist', 'Spa Therapist', 'Aesthetician'], titles: ['beauty therapist', 'spa therapist', 'esthetician', 'aesthetician', 'beauty advisor', 'beauty consultant', 'nail technician', 'lash technician', 'aesthetic practitioner', 'massage therapist', 'skin therapist', 'salon manager', 'spa manager'] },
  farmer: { categories: ['Farmer', 'Farm Worker', 'Agriculture'], titles: ['farm worker', 'farm operative', 'farm assistant', 'farm hand', 'farmhand', 'stockperson', 'herdsperson', 'shepherd', 'dairy', 'tractor driver', 'combine operator', 'agronomist', 'farm manager', 'agricultural', 'arable', 'livestock', 'shepherdess', 'crop'] },
  // New frontline - Travel & transport
  'cabin-crew': { categories: ['Cabin Crew', 'Flight Attendant'], titles: ['cabin crew', 'flight attendant', 'air hostess', 'air steward', 'in-flight', 'inflight', 'purser'] },
  'train-driver': { categories: ['Train Driver'], titles: ['train driver', 'train operator', 'tram driver', 'underground driver', 'tube driver', 'locomotive driver'] },
  'aviation-ground-crew': { categories: ['Aviation', 'Ground Crew', 'Ground Operations'], titles: ['ground crew', 'ground handler', 'ground operations', 'baggage handler', 'ramp agent', 'flight dispatcher', 'turnaround coordinator', 'check-in agent', 'gate agent', 'aircraft cleaner', 'pilot', 'first officer', 'aviation safety'] },
  'rail-transport-staff': { categories: ['Rail', 'Transport'], titles: ['station manager', 'station assistant', 'station staff', 'train conductor', 'train guard', 'ticket inspector', 'revenue protection', 'platform staff', 'rail customer', 'bus driver', 'tram conductor', 'transport assistant'] },
  // New frontline - Hospitality
  'hotel-front-of-house': { categories: ['Front of House', 'Hotel', 'Hospitality'], titles: ['front office', 'hotel receptionist', 'concierge', 'guest services', 'guest experience', 'porter', 'bellboy', 'bellhop', 'housekeeper', 'housekeeping', 'room attendant', 'night auditor', 'duty manager'] },
  'restaurant-floor-kitchen': { categories: ['Front of House', 'Kitchen', 'Hospitality'], titles: ['waiter', 'waitress', 'waiting staff', 'server', 'host', 'hostess', 'maitre', 'sommelier', 'food runner', 'busser', 'kitchen porter', 'kitchen assistant', 'commis chef', 'chef de partie', 'sous chef', 'line cook', 'prep cook', 'dishwasher'] },
  // New frontline - Pets
  'veterinary-nurse': { categories: ['Veterinary Nurse', 'Veterinary'], titles: ['veterinary nurse', 'vet nurse', 'rvn', 'student vet nurse', 'svn', 'veterinary care assistant', 'animal care assistant', 'veterinary receptionist'] },
  'pet-care': { categories: ['Pet Care', 'Animal Care'], titles: ['dog groomer', 'pet groomer', 'cat groomer', 'dog walker', 'pet sitter', 'dog trainer', 'kennel assistant', 'cattery assistant', 'animal care', 'doggy daycare', 'pet shop assistant'] },
  // New frontline - Teaching
  'teaching-assistant': { categories: ['Teaching Assistant', 'Education Support'], titles: ['teaching assistant', 'classroom assistant', 'higher level teaching assistant', 'hlta'] },
  'school-support-staff': { categories: ['School Support', 'Education Support', 'Early Years'], titles: ['cover supervisor', 'learning support assistant', 'special needs assistant', 'sen support', 'send support', 'behaviour mentor', 'pastoral', 'school administrator', 'school receptionist', 'midday supervisor', 'lunchtime supervisor', 'school caretaker', 'school cleaner', 'nursery assistant', 'nursery practitioner', 'early years practitioner', 'eyfs practitioner'] },
  // New frontline - Beauty / Wellness / Pharmacy
  'hair-stylist': { categories: ['Hair Stylist', 'Hairdresser'], titles: ['hair stylist', 'hairdresser', 'hair dresser', 'hair colourist', 'colorist', 'barber', 'hair technician', 'hair artist'] },
  'salon-staff': { categories: ['Salon', 'Beauty'], titles: ['nail technician', 'nail artist', 'manicurist', 'pedicurist', 'makeup artist', 'lash technician', 'brow technician', 'salon manager', 'salon assistant', 'salon receptionist', 'aesthetic practitioner'] },
  'wellness-practitioner': { categories: ['Wellness', 'Therapy', 'Holistic'], titles: ['yoga teacher', 'yoga instructor', 'pilates teacher', 'pilates instructor', 'sports massage', 'massage therapist', 'holistic therapist', 'reflexologist', 'acupuncturist', 'wellness coach', 'sound therapist', 'reiki', 'meditation teacher'] },
  'pharmacy-staff': { categories: ['Pharmacy', 'Dispensing'], titles: ['pharmacy dispenser', 'dispensing assistant', 'pharmacy assistant', 'pharmacy technician', 'pharmacy advisor', 'pharmacy counter assistant', 'medicines counter assistant'] },
  // New frontline - Charity
  'charity-frontline': { categories: ['Charity', 'Support Worker', 'Outreach'], titles: ['caseworker', 'case worker', 'outreach worker', 'support worker', 'volunteer coordinator', 'community worker', 'community outreach', 'service coordinator', 'helpline advisor', 'helpline volunteer', 'advice worker', 'welfare adviser', 'safeguarding officer'] },
  // Healthcare craft + frontline
  nurse: { categories: ['Registered Nurse', 'Staff Nurse', 'Nurse', 'Practice Nurse', 'Mental Health Nurse', 'Charge Nurse'], titles: ['nurse', 'staff nurse', 'registered nurse', 'rgn', 'rmn', 'rnld', 'theatre nurse', 'community nurse', 'practice nurse', 'district nurse', 'a&e nurse', 'icu nurse', 'itu nurse', 'paediatric nurse', 'mental health nurse', 'school nurse', 'specialist nurse', 'clinical nurse', 'ward nurse', 'night nurse', 'bank nurse', 'charge nurse', 'sister'] },
  midwife: { categories: ['Midwife', 'Midwifery'], titles: ['midwife', 'midwifery', 'community midwife', 'band 5 midwife', 'band 6 midwife', 'band 7 midwife', 'maternity nurse'] },
  'healthcare-assistant': { categories: ['Healthcare Assistant', 'HCA', 'Care Assistant', 'Support Worker'], titles: ['healthcare assistant', 'health care assistant', 'hca', 'nursing assistant', 'clinical support worker', 'ward clerk', 'phlebotomist', 'theatre assistant', 'care assistant'] },
  doctor: { categories: ['Doctor', 'GP', 'Consultant', 'Registrar'], titles: ['doctor', 'gp ', 'general practitioner', 'consultant', 'registrar', 'physician', 'surgeon', 'house officer', 'foundation doctor', 'specialty doctor', 'locum'] },
  // Formula 1 / Motorsport craft roles
  'race-engineer': { categories: ['Race Engineer', 'Performance Engineer', 'Vehicle Dynamics'], titles: ['race engineer', 'performance engineer', 'vehicle dynamics', 'track engineer', 'test engineer', 'simulation engineer', 'strategy engineer', 'race strategist'] },
  mechanic: { categories: ['Mechanic', 'Race Mechanic', 'Pit Crew'], titles: ['mechanic', 'race mechanic', 'pit crew', 'car build', 'build technician', 'tyre technician', 'sub-assembly'] },
  aerodynamicist: { categories: ['Aerodynamicist', 'Aerodynamics', 'CFD'], titles: ['aerodynamicist', 'aerodynamics', 'aero engineer', 'cfd engineer', 'cfd analyst', 'wind tunnel', 'aero performance'] },
  'performance-engineer': { categories: ['Performance Engineer', 'Vehicle Performance', 'Simulation'], titles: ['performance engineer', 'vehicle performance', 'simulation engineer', 'telemetry', 'trackside engineer', 'race data'] },
  'composite-technician': { categories: ['Composite Technician', 'Composite', 'Carbon Fibre'], titles: ['composite technician', 'composite', 'carbon fibre', 'carbon fiber', 'laminator', 'autoclave', 'prepreg', 'composite lay-up'] },
  // Football craft/frontline
  'football-coach': { categories: ['Football Coach', 'Coach', 'First Team Coach', 'Academy Coach'], titles: ['football coach', 'head coach', 'first team coach', 'assistant coach', 'coaching', 'goalkeeping coach', 'fitness coach'] },
  'football-scout': { categories: ['Scout', 'Recruitment Analyst', 'Talent Identification'], titles: ['scout', 'scouting', 'recruitment analyst', 'talent identification', 'chief scout'] },
  'sports-scientist': { categories: ['Sports Scientist', 'Sport Scientist', 'S&C'], titles: ['sports scientist', 'sport scientist', 'strength and conditioning', 'exercise scientist', 'head of performance'] },
  'football-physio': { categories: ['Physiotherapist', 'Sports Therapist', 'Medical'], titles: ['physiotherapist', 'physio', 'sports therapist', 'rehabilitation', 'head of medical', 'soft tissue'] },
  groundsperson: { categories: ['Groundsperson', 'Groundsman', 'Grounds'], titles: ['groundsperson', 'groundsman', 'groundskeeper', 'pitch maintenance', 'turf', 'greenkeeper'] },
  'kit-manager': { categories: ['Kit Manager', 'Equipment Manager'], titles: ['kit manager', 'kit man', 'kit assistant', 'equipment manager', 'equipment officer'] },
  'football-analyst': { categories: ['Performance Analyst', 'Match Analyst', 'Video Analyst'], titles: ['performance analyst', 'match analyst', 'video analyst', 'tactical analyst', 'opposition analyst', 'head of analysis'] },
  'academy-coach': { categories: ['Academy Coach', 'Youth Coach', 'Academy Manager'], titles: ['academy coach', 'academy manager', 'youth coach', 'youth development', 'foundation phase', 'professional development phase'] },
  // Journalism
  reporter: { categories: ['Reporter', 'Journalist', 'Correspondent'], titles: ['reporter', 'journalist', 'correspondent', 'feature writer', 'staff writer', 'investigative journalist'] },
  editor: { categories: ['Editor', 'Sub-Editor', 'Commissioning Editor'], titles: ['editor', 'sub-editor', 'commissioning editor', 'features editor', 'section editor', 'deputy editor', 'editor-in-chief', 'copy editor'] },
  'broadcast-journalist': { categories: ['Broadcast Journalist', 'Presenter', 'Radio'], titles: ['broadcast journalist', 'presenter', 'newsreader', 'radio journalist', 'podcast presenter', 'tv reporter', 'broadcast producer'] },
  // Gaming
  'game-designer': { categories: ['Game Designer', 'Level Designer', 'Narrative Designer'], titles: ['game designer', 'level designer', 'narrative designer', 'systems designer', 'gameplay designer', 'game director'] },
  'qa-tester': { categories: ['QA Tester', 'Quality Assurance', 'Game Tester'], titles: ['qa tester', 'qa analyst', 'quality assurance', 'game tester', 'test analyst', 'compliance tester'] },
  // Music
  'sound-engineer': { categories: ['Sound Engineer', 'Audio Engineer', 'Studio Engineer'], titles: ['sound engineer', 'audio engineer', 'recording engineer', 'mix engineer', 'mastering engineer', 'studio engineer', 'live sound'] },
  'live-events-manager': { categories: ['Tour Manager', 'Event Manager', 'Venue Manager'], titles: ['tour manager', 'event manager', 'festival manager', 'promoter', 'live events', 'stage manager', 'venue manager', 'booking agent'] },
  // Travel
  'travel-consultant': { categories: ['Travel Agent', 'Travel Consultant', 'Travel Advisor'], titles: ['travel agent', 'travel consultant', 'travel advisor', 'holiday consultant', 'cruise consultant', 'tour operator', 'reservations agent'] },
  // Interior Design
  'interior-designer': { categories: ['Interior Designer', 'Interior Stylist', 'Space Planner'], titles: ['interior designer', 'interior stylist', 'space planner', 'interior architect', 'kitchen designer', 'bathroom designer'] },
  // Grocery
  'grocery-store-manager': { categories: ['Store Manager', 'Branch Manager', 'Supermarket Manager'], titles: ['store manager', 'branch manager', 'supermarket manager', 'deputy manager', 'department manager', 'section manager'] },
};

function escapeForOr(value: string): string {
  // Keep PostgREST or() values parse-safe by stripping punctuation that breaks
  // logic parsing, while preserving wildcard % matching.
  return value
    .replace(/[(),]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildRoleOrFilter(roleSlug: string): string | null {
  // Special case: the "AI" chip surfaces every role at an AI-industry company
  // (engineering, research, commercial, ops, people, comms, events, etc.).
  // Industry is the strongest signal - title keywords miss too many real roles
  // at OpenAI / Anthropic / DeepMind that aren't named "AI Engineer".
  if (roleSlug === 'ai') {
    return 'industry.eq.ai';
  }
  const config = ROLE_SQL_FILTERS[roleSlug];
  if (!config) return null;
  const parts: string[] = [];
  for (const cat of config.categories) {
    parts.push(`ai_role_category.ilike.${escapeForOr(cat)}`);
    parts.push(`role_category.ilike.${escapeForOr(cat)}`);
  }
  // Title ILIKEs are backed by a pg_trgm GIN index on jobs.title, so we can
  // safely include all role keywords without hitting statement timeouts.
  // Categories cover well-classified jobs; titles catch the long tail.
  for (const title of config.titles) {
    parts.push(`title.ilike.${escapeForOr(`%${title}%`)}`);
  }
  return parts.join(',');
}

const Marketplace = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const routerLocation = useLocation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  // Company filter set by clicking a logo in the CompanyLogoStrip. Stored as
  // the lowercase company name; null means no filter. Kept separate from the
  // free-text search box so the two can co-exist.
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [industry, setIndustry] = useState(() => canonicalizeIndustryParam(searchParams.get("industry")));
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [roleCategoryView, setRoleCategoryView] = useState<"all" | "business" | "craft" | "frontline">("all");

  const updateRoleFilter = useCallback((nextRole: string) => {
    const normalisedRole = toRoleSlug(nextRole || "");
    setRoleFilter(normalisedRole);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (normalisedRole) next.set("role", normalisedRole);
      else next.delete("role");
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Sync filters with URL params so role/industry CTAs always resolve to canonical values
  useEffect(() => {
    setIndustry(canonicalizeIndustryParam(searchParams.get("industry")));
    const roleParam = toRoleSlug(searchParams.get("role") || "");
    setRoleFilter((current) => (current === roleParam ? current : roleParam));
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
      // Scroll the tabs section into view so deep-links land on the chosen tab
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [searchParams]);
  const [location, setLocation] = useState("All");
  const [jobType, setJobType] = useState("All");
  const [salary, setSalary] = useState("All");
  const [workMode, setWorkMode] = useState("All");
  const [careerLevel, setCareerLevel] = useState("All");
  const [tempOnly, setTempOnly] = useState(false);
  // DB-pinned employer for the active industry - overrides FEATURED_EMPLOYERS map
  const [dbPinnedEmployer, setDbPinnedEmployer] = useState<FeaturedEmployer | null>(null);
  useEffect(() => {
    if (industry === "All") { setDbPinnedEmployer(null); return; }
    const slug = normalizeIndustryFilter(industry);
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("pinned_industry_employers")
        .select("company_name, tagline, url, rank")
        .ilike("industry", slug)
        .order("rank", { ascending: true })
        .limit(1);
      if (cancelled) return;
      if (!data || data.length === 0) { setDbPinnedEmployer(null); return; }
      const row = data[0] as { company_name: string; tagline: string | null; url: string | null };
      setDbPinnedEmployer({
        company: row.company_name,
        slug: row.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        tagline: row.tagline || `A notable employer in ${industry}.`,
        whyWorkHere: [],
        careersUrl: row.url || `/marketplace?industry=${encodeURIComponent(industry)}`,
      });
    })();
    return () => { cancelled = true; };
  }, [industry]);
  const { isSaved: isJobSaved, toggle: toggleSavedJob } = useSavedJobs();
  const { open: signupOpen, close: closeSignup, openPopup: openSignup } = useSignUpPopup(0, false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("smart");
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "all");
  const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(null);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchLabel, setAiSearchLabel] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [userCareerLevel, setUserCareerLevel] = useState<string | null>(null);
  const [userRoleSlugs, setUserRoleSlugs] = useState<string[]>([]);
  // Craft (chef, barista, baker, footballer, coach, etc.) vs Business (marketing,
  // finance, ops, tech, sales). Seeded from profile after load (see effect below).
  const [workFamily, setWorkFamily] = useState<'all' | 'craft' | 'business'>('all');
  const [workFamilyTouched, setWorkFamilyTouched] = useState(false);
  const [hasLoadedSelection, setHasLoadedSelection] = useState(false);
  // Load cached counts from localStorage so users see numbers instantly
  const getCachedCounts = () => {
    try {
      const cached = localStorage.getItem('marketplace-tab-counts');
      if (cached) return JSON.parse(cached);
    } catch {}
    return { all: null, featured: null, internships: null, freelance: null, remote: null, temp: null, parttime: null };
  };

  const [tabCounts, setTabCounts] = useState<{
    all: number | null;
    featured: number | null;
    internships: number | null;
    freelance: number | null;
    remote: number | null;
    temp: number | null;
    parttime: number | null;
  }>(getCachedCounts);
  const requestIdRef = useRef(0);
  const [helperJob, setHelperJob] = useState<JobForHelper | null>(null);
  const [focusedJobId, setFocusedJobId] = useState<string | null>(null);
  const [focusedJob, setFocusedJob] = useState<Job | null>(null);



  useEffect(() => {
    if (routerLocation.hash) {
      setTimeout(() => {
        document.getElementById(routerLocation.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  }, [routerLocation.hash]);

  // Fetch user's career level and role matches from profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("career_level, salary_expectation, understand_me_results")
        .eq("id", user.id)
        .single();
      let resolvedSlugs: string[] = [];
      let resolvedLevel: string | null = null;
      if (data?.understand_me_results && typeof data.understand_me_results === 'object') {
        const results = data.understand_me_results as any;
        resolvedLevel = inferCareerLevelFromUnderstandMe(results) || normalizeCareerLevel(data?.career_level);
        setUserCareerLevel(resolvedLevel);
        if (Array.isArray(results.roleMatches)) {
          resolvedSlugs = results.roleMatches.map((m: any) => (m.slug || '').toLowerCase()).filter(Boolean);
          setUserRoleSlugs(resolvedSlugs);
        }
      } else {
        resolvedLevel = normalizeCareerLevel(data?.career_level);
        setUserCareerLevel(resolvedLevel);
      }
      // Default the Craft / Business toggle to "All" so users see every role
      // across the marketplace by default. Users can narrow to Craft or Business
      // via the chip group above the tabs.
      if (!workFamilyTouched) {
        setWorkFamily('all');
      }
    })();
  }, [user]);

  const isValidJobTitle = (title: string) => {
    const lower = title.toLowerCase().trim();
    const invalidTitles = ['join us', 'join our team', 'careers', 'work with us', 'come work with us', 'we are hiring', 'apply now', 'opportunities', 'vacancies'];
    if (invalidTitles.includes(lower)) return false;
    if (lower.length < 4) return false;
    return true;
  };

  // Filter out government/public sector employers that get misclassified into creative industries
  const IRRELEVANT_COMPANIES_RE = /\b(hm treasury|hmrc|home office|ministry of|cabinet office|dwp|defra|mod |civil service)\b/i;

  const mapDbJobs = useCallback((data: any[]): Job[] => {
    return data
      .filter((j: any) => isValidJobTitle(j.title) && !IRRELEVANT_COMPANIES_RE.test(j.company))
      .map((j: any, i: number) => ({
        id: 10000 + i,
        dbId: j.id,
        title: j.title,
        company: j.company,
        location: j.location || 'Not specified',
        salary: j.salary || 'Not listed',
        description: j.description || '',
        tags: j.tags || [],
        industry: j.industry || 'Other',
        type: j.type || 'Full-time',
        workMode: j.work_mode || 'On-site',
        featured: j.featured || false,
        url: j.url,
        roleCategory: j.ai_role_category || j.role_category || null,
        careerLevel: j.career_level || null,
        salaryMin: j.salary_min || null,
        salaryMax: j.salary_max || null,
        scrapedAt: j.scraped_at || null,
      }));
  }, []);

  const normalizeIndustryKey = (value: string) =>
    value.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-');

  const UK_INDICATORS = [
    'uk', 'united kingdom', 'london', 'manchester', 'birmingham', 'leeds', 'glasgow',
    'edinburgh', 'liverpool', 'bristol', 'cardiff', 'belfast', 'nottingham', 'sheffield',
    'newcastle', 'southampton', 'brighton', 'leicester', 'oxford', 'cambridge',
    'bath', 'york', 'exeter', 'norwich', 'coventry', 'reading', 'derby',
    'aberdeen', 'dundee', 'swansea', 'milton keynes', 'northampton', 'luton',
    'sunderland', 'wolverhampton', 'plymouth', 'stoke', 'portsmouth', 'warwick',
    'england', 'scotland', 'wales', 'northern ireland',
    'surrey', 'kent', 'essex', 'sussex', 'hampshire', 'hertfordshire',
    'berkshire', 'somerset', 'dorset', 'suffolk', 'norfolk', 'devon', 'cornwall',
    'lancashire', 'cheshire', 'greater london', 'west midlands', 'east midlands',
    'oxfordshire', 'bicester', 'warrington', 'ashford', 'ellesmere port',
    'nantwich', 'bury', 'bolton', 'wigan', 'stockport', 'rochdale', 'oldham',
    'cheltenham', 'gloucester', 'swindon', 'peterborough', 'ipswich', 'colchester',
    'guildford', 'woking', 'crawley', 'maidstone', 'canterbury', 'tunbridge',
    'middlesbrough', 'darlington', 'carlisle', 'chester', 'crewe', 'stafford',
    'worcester', 'hereford', 'shrewsbury', 'telford', 'lincoln', 'grimsby',
    'hull', 'doncaster', 'rotherham', 'barnsley', 'wakefield', 'huddersfield',
    'halifax', 'harrogate', 'scarborough', 'blackpool', 'preston', 'burnley',
    'lancaster', 'inverness', 'stirling', 'perth', 'dumfries', 'hatfield',
    'loughborough', 'burton', 'remote',
  ];

  const NON_UK_INDICATORS = [
    'united states', 'usa', 'canada', 'australia', 'new zealand', 'germany', 'france',
    'spain', 'italy', 'netherlands', 'singapore', 'dubai', 'uae', 'india', 'poland',
    'new york', 'san francisco', 'los angeles', 'toronto', 'vancouver', 'sydney',
    'melbourne', 'berlin', 'paris', 'amsterdam', 'madrid', 'barcelona',
    'shanghai', 'tokyo', 'hong kong', 'mumbai', 'beijing', 'seoul',
  ];

  const isUkJob = (loc: string | null, title: string): boolean => {
    if (!loc || loc === 'Not specified') return true;
    const textToCheck = `${loc}`.toLowerCase();
    if (NON_UK_INDICATORS.some(ind => textToCheck.includes(ind))) return false;
    // Our sources are UK-focused, so unknown locations are assumed UK
    return true;
  };

  const hasActiveSelection = activeTab !== "all" || search.trim() !== "" || industry !== "All" || location !== "All" || jobType !== "All" || salary !== "All" || workMode !== "All" || careerLevel !== "All" || roleFilter !== "" || tempOnly || companyFilter !== null || (aiSearchResults !== null && aiSearchResults.length > 0);
  const shouldLoadJobs = hasActiveSelection && activeTab !== "cv-builder";
  const isJobsQueryBroad = !roleFilter && search.trim() === "" && location === "All" && jobType === "All" && salary === "All" && workMode === "All" && careerLevel === "All" && !tempOnly && aiSearchResults === null;

  const handleIndustryChange = (nextIndustry: string) => {
    setIndustry(nextIndustry);
    setSearch("");
    setCompanyFilter(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextIndustry && nextIndustry !== "All") next.set("industry", nextIndustry);
      else next.delete("industry");
      return next;
    }, { replace: true });
    if (nextIndustry && nextIndustry !== "All") {
      trackInteraction({
        type: "industry_view",
        industry: nextIndustry.toLowerCase(),
        metadata: { source: "marketplace_filter" },
      });
    }
  };

  const fetchOverviewCounts = useCallback(async () => {
    // Tab badge counts. Filtered exact counts time out on 30k+ rows, so we:
    //  1. Use 'estimated' (pg_class stats first, falls back to exact when small).
    //  2. Run sequentially so we don't open 7 parallel DB connections (which compound the timeout).
    //  3. Per-query try/catch so one failure doesn't blank all badges.
    const safeCount = async (build: () => any, fallback: number | null): Promise<number | null> => {
      try {
        const { count, error } = await build();
        if (error) return fallback;
        return count ?? fallback;
      } catch {
        return fallback;
      }
    };
    try {
      // Exclude expired listings everywhere - expires_at is set on ingestion
      // (typically now + 60d) but was never actually filtered on here, so
      // long-expired jobs (e.g. postings from 6+ weeks ago) kept inflating
      // every count and showing up in every industry/filter indefinitely.
      const notExpired = `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`;
      // Use exact count for "All Jobs" so the headline matches Site Insights (estimated counts can drift far from reality between ANALYZE runs).
      const all = await safeCount(() => supabase.from('jobs').select('*', { count: 'exact', head: true }).or(notExpired), tabCounts.all);
      const featured = await safeCount(() => supabase.from('jobs').select('*', { count: 'estimated', head: true }).eq('featured', true).or(notExpired), tabCounts.featured);
      // "Internships and Graduates" tab - internship type OR titles like
      // graduate / apprentice / trainee / placement so the badge matches the
      // tab label (was previously only counting type='Internship').
      const internships = await safeCount(
        () =>
          supabase
            .from('jobs')
            .select('*', { count: 'estimated', head: true })
            .or('type.eq.Internship,title.ilike.%graduate%,title.ilike.%intern%,title.ilike.%apprentice%,title.ilike.%trainee%,title.ilike.%placement%')
            .or(notExpired),
        tabCounts.internships,
      );
      const freelance = await safeCount(() => supabase.from('jobs').select('*', { count: 'estimated', head: true }).eq('type', 'Freelance').or(notExpired), tabCounts.freelance);
      const remote = await safeCount(() => supabase.from('jobs').select('*', { count: 'estimated', head: true }).eq('work_mode', 'Remote').or(notExpired), tabCounts.remote);
      const temp = await safeCount(() => supabase.from('jobs').select('*', { count: 'estimated', head: true }).eq('type', 'Temporary').or(notExpired), tabCounts.temp);
      const parttime = await safeCount(() => supabase.from('jobs').select('*', { count: 'estimated', head: true }).eq('type', 'Part-time').or(notExpired), tabCounts.parttime);
      const counts = { all, featured, internships, freelance, remote, temp, parttime };
      setTabCounts(counts);
      try { localStorage.setItem('marketplace-tab-counts', JSON.stringify(counts)); } catch {}
    } catch (err) {
      console.error('Failed to fetch tab counts', err);
    }
  }, [tabCounts.all, tabCounts.featured, tabCounts.freelance, tabCounts.internships, tabCounts.parttime, tabCounts.remote, tabCounts.temp]);

  useEffect(() => {
    fetchOverviewCounts();
  }, [fetchOverviewCounts]);

  const fetchJobs = useCallback(async () => {
    if (!shouldLoadJobs) return;

    const requestId = ++requestIdRef.current;

    // Stable cache key from all filter inputs. Realtime subscription elsewhere
    // keeps the list fresh, so a short TTL is fine — this just avoids the
    // expensive paginated re-fetch when users switch tabs and come back.
    const jobsCacheKey = `marketplace-jobs:${[
      industry, activeTab, careerLevel, companyFilter, jobType, location, workMode,
      roleFilter || "", (aiSearchResults || []).join(",").slice(0, 200),
    ].join("|")}`;
    const cachedJobs = getCached<ReturnType<typeof mapDbJobs>>(jobsCacheKey, 5 * 60 * 1000);
    if (cachedJobs) {
      setDbJobs(cachedJobs);
      setHasLoadedSelection(true);
      setIsLoadingJobs(false);
    } else {
      setIsLoadingJobs(true);
      setHasLoadedSelection(false);
    }
    // Exclude expired listings - expires_at is set on ingestion (typically
    // now + 60d) but was never actually filtered on here, so long-expired
    // jobs kept showing up in every industry/filter indefinitely.
    const notExpired = `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`;
    let query = supabase
      .from('jobs')
      .select('id, title, company, location, salary, description, tags, industry, type, work_mode, featured, url, ai_role_category, role_category, career_level, salary_min, salary_max, scraped_at, ai_confidence')
      .or(notExpired)
      // Rank highest-confidence classifications first so well-matched jobs surface
      // and noisy unclassified rows fall to the bottom of the list.
      .order('ai_confidence', { ascending: false, nullsFirst: false })
      .order('scraped_at', { ascending: false });

    // When AI smart search returned IDs, fetch those exact rows directly so
    // they aren't lost behind the 1000-row recency limit or other filters.
    // IMPORTANT: chunk the .in() query - Postgrest URLs cap around 8KB, and
    // 200+ UUIDs blow past that, silently truncating results (e.g. Gail's
    // returning 58 of 308 jobs).
    if (aiSearchResults && aiSearchResults.length > 0) {
      const CHUNK = 100;
      const chunks: string[][] = [];
      for (let i = 0; i < aiSearchResults.length; i += CHUNK) {
        chunks.push(aiSearchResults.slice(i, i + CHUNK));
      }
      try {
        const results = await Promise.all(
          chunks.map((ids) =>
            supabase
              .from('jobs')
              .select('id, title, company, location, salary, description, tags, industry, type, work_mode, featured, url, ai_role_category, role_category, career_level, salary_min, salary_max, scraped_at')
              .in('id', ids)
              .or(notExpired)
          )
        );
        if (requestId !== requestIdRef.current) return;
        const firstError = results.find((r) => r.error)?.error;
        if (firstError) {
          console.error('Failed to load AI search jobs', firstError);
          setDbJobs([]);
        } else {
          const merged = results.flatMap((r) => r.data ?? []);
          setDbJobs(mapDbJobs(merged));
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error('Failed to load AI search jobs', err);
        setDbJobs([]);
      }
      setHasLoadedSelection(true);
      setIsLoadingJobs(false);
      return;
    }

    // Category tabs (internships, remote, freelance, temp, parttime) pull from
    // dedicated ingestion buckets (e.g. industry='graduate' from grad boards,
    // industry='remote' from remote-first feeds) that aren't real industries.
    // For these tabs we IGNORE the industry restriction so the full category
    // pool is visible - otherwise 400+ graduate jobs and 60+ remote jobs are
    // hidden behind an industry slug no user ever picks.
    const isCategoryTab = activeTab === 'internships' || activeTab === 'remote'
      || activeTab === 'freelance' || activeTab === 'temp' || activeTab === 'parttime';

    if (industry !== 'All' && !isCategoryTab) {
      const slug = normalizeIndustryFilter(industry);
      const slugs = expandIndustrySlug(slug);
      // All fallback-eligible industries now have 200+ correctly-tagged rows in
      // the DB (travel: 324, journalism: 392, gaming: 263, etc), so the legacy
      // OR-fallback (50+ ILIKE patterns) just causes Postgres statement timeouts.
      // Use plain industry equality - it hits the (industry, scraped_at) index.
      query = slugs.length > 1 ? query.in('industry', slugs) : query.eq('industry', slug);
    }
    // Push companyFilter down to the DB so we don't lose rows behind the
    // ~1,000-row recency cap. Without this, brands with many older listings
    // (e.g. Five Guys, all scraped on the same day) get truncated to 1-2 jobs
    // because newer scrapes from other employers fill the recency window.
    if (companyFilter) {
      if (companyFilter === 'nhs') {
        query = query.ilike('company', '%nhs%');
      } else {
        query = query.ilike('company', companyFilter);
      }
    }
    if (location !== 'All') query = query.eq('location', location);
    if (jobType !== 'All') query = query.eq('type', jobType === 'Internship / Graduate' ? 'Internship' : jobType);
    if (workMode !== 'All') query = query.eq('work_mode', workMode);
    if (careerLevel !== 'All') query = query.eq('career_level', careerLevel.toLowerCase());
    if (activeTab === 'featured') query = query.eq('featured', true);
    if (activeTab === 'freelance') query = query.eq('type', 'Freelance');
    if (activeTab === 'remote') query = query.eq('work_mode', 'Remote');
    if (activeTab === 'internships') {
      query = query.or('type.eq.Internship,title.ilike.%graduate%,title.ilike.%intern%,title.ilike.%apprentice%,title.ilike.%trainee%,title.ilike.%placement%');
    }
    if (activeTab === 'temp') query = query.eq('type', 'Temporary');
    if (activeTab === 'parttime') query = query.eq('type', 'Part-time');

    if (roleFilter) {
      const slug = toRoleSlug(roleFilter);
      const orFilter = buildRoleOrFilter(slug);
      if (orFilter) query = query.or(orFilter);
    }

    // Cap result size. The API returns at most 1,000 rows per request even
    // when a larger range is requested, so industry views must paginate in
    // 1,000-row chunks. Health has 6k+ live listings (mostly NHS); using a
    // 3k chunk made the first 1,000-row response look like the final page,
    // which is why the visible list deduped down to ~930 jobs.
    const isCompanyScoped = !!companyFilter;
    // Any explicit filter pick (type, location, onsite/remote, career level,
    // salary band, temp toggle) narrows the result set just as much as an
    // industry pick does - without paginating past the default 80-row single
    // page, only the newest/highest-confidence 80 ever got fetched, then
    // deduping trimmed that further. Confirmed on real data: Apprenticeship
    // (248 rows) showed 71, London (1,728 rows) showed 74, and Senior career
    // level (23,287 rows) would have shown ~80 - all silently truncated.
    // Free-text search has the identical problem and was missed here: it's
    // applied client-side (below, against job.title/company/industry/tags)
    // to whatever this query happens to fetch, so with no other filter set
    // it only ever searched the top 80 broadest/highest-confidence jobs.
    // Confirmed on real data: searching "plumbing" with no filters found 0
    // of 397 real matching jobs, because none of them were in that top 80.
    const shouldPaginate = (industry !== 'All' && !isCategoryTab) || isCompanyScoped
      || jobType !== 'All' || location !== 'All' || workMode !== 'All' || careerLevel !== 'All'
      || salary !== 'All' || tempOnly || search.trim() !== '';
    const HARD_CAP = shouldPaginate ? 9000 : 1000;
    const CHUNK = shouldPaginate
      ? 1000
      : (roleFilter || isCategoryTab)
        ? 1000
        : (activeTab !== 'all' ? 200 : 80);

    let allData: any[] = [];
    let offset = 0;
    let lastError: any = null;
    while (offset < HARD_CAP) {
      const upper = Math.min(offset + CHUNK - 1, HARD_CAP - 1);
      const { data: pageData, error: pageError } = await query.range(offset, upper);
      if (requestId !== requestIdRef.current) return;
      if (pageError) { lastError = pageError; break; }
      const rows = pageData ?? [];
      allData = allData.concat(rows);
      // Stop on last page (fewer rows than requested) or once paginated fetch is exhausted.
      if (rows.length < (upper - offset + 1)) break;
      offset += CHUNK;
      if (!shouldPaginate) break;
    }
    const data = allData;
    const error = lastError;

    if (requestId !== requestIdRef.current) return;

    if (error) {
      console.error('Failed to load jobs', error);
      setHasLoadedSelection(true);
      setIsLoadingJobs(false);
      return;
    }

    // Always pull featured/premium listings for the active industry separately.
    // PostgREST caps responses at 1000 rows, so a paying employer's listing can
    // get truncated from the recency-ordered fetch above. Merging featured rows
    // in guarantees premium employers (Five Guys, Greggs, Costa, etc.) appear.
    let merged: any[] = data ?? [];
    if (industry !== 'All' && activeTab !== 'featured') {
      const slug = normalizeIndustryFilter(industry);
      const slugs = expandIndustrySlug(slug);
      let featuredQuery = supabase
        .from('jobs')
        .select('id, title, company, location, salary, description, tags, industry, type, work_mode, featured, url, ai_role_category, role_category, career_level, salary_min, salary_max, scraped_at')
        .eq('featured', true)
        .or(notExpired);
      featuredQuery = slugs.length > 1
        ? featuredQuery.in('industry', slugs)
        : featuredQuery.eq('industry', slug);
      const { data: featuredRows } = await featuredQuery;
      if (featuredRows && featuredRows.length > 0) {
        const existingIds = new Set(merged.map((j: any) => j.id));
        const extras = featuredRows.filter((j: any) => !existingIds.has(j.id));
        merged = [...extras, ...merged];
      }
    }

    const ukOnly = merged.filter((j: any) => isUkJob(j.location, j.title));
    const mapped = mapDbJobs(ukOnly);
    setDbJobs(mapped);
    setCached(jobsCacheKey, mapped);
    setHasLoadedSelection(true);
    setIsLoadingJobs(false);
  }, [activeTab, careerLevel, companyFilter, industry, jobType, location, mapDbJobs, roleFilter, shouldLoadJobs, workMode, isJobsQueryBroad, aiSearchResults, search]);

  useEffect(() => {
    if (!shouldLoadJobs) {
      setIsLoadingJobs(false);
      setHasLoadedSelection(false);
      return;
    }

    fetchJobs();
  }, [fetchJobs, shouldLoadJobs]);

  // Realtime subscription for live updates
  useEffect(() => {
   const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => {
          fetchOverviewCounts();
          if (shouldLoadJobs) {
            fetchJobs();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs, fetchOverviewCounts, shouldLoadJobs]);

  const allJobs = dbJobs;

  // Deep-link from Howdy chat: /marketplace?jobId=<uuid> opens the job with
  // the "Howdy can help" application helper, and logs a help_apply interaction
  // so the employer sees a candidate signal.
  const jobIdParam = searchParams.get("jobId");
  const handledJobIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!jobIdParam || handledJobIdRef.current === jobIdParam) return;
    handledJobIdRef.current = jobIdParam;
    (async () => {
      const { data: j } = await supabase
        .from("jobs")
        .select("id, title, company, industry, location, salary, description, tags, type, url, work_mode, featured, ai_role_category, role_category, career_level, salary_min, salary_max, scraped_at")
        .eq("id", jobIdParam)
        .maybeSingle();
      if (!j) return;
      // Open the full job listing in the Marketplace (not the AI apply helper).
      // Render it as a spotlight card at the top so it shows regardless of
      // current filters / pagination.
      const mapped = mapDbJobs([j])[0];
      if (mapped) {
        setFocusedJob(mapped);
        setFocusedJobId(mapped.dbId ?? null);
      }
      setActiveTab("all");
      trackInteraction({
        type: "job_click",
        companySlug: getCompanySlug(j.company) ?? undefined,
        industry: j.industry ?? undefined,
        jobId: j.id,
        metadata: { title: j.title, company: j.company, source: "my-jobs" },
      });
    })();

  }, [jobIdParam]);



  const handleScrapeJobs = async () => {
    setIsScrapingJobs(true);
    try {
      const refreshIndustryJobs = async (industryKey: string) => {
        return await Promise.allSettled([
          supabase.functions.invoke('scrape-jobs', { body: { industry: industryKey } }),
          supabase.functions.invoke('fetch-external-jobs', { body: { industry: industryKey } }),
        ]);
      };

      if (industry === 'All') {
        const industryKeys = industries
          .filter((option) => option !== 'All')
          .map((option) => normalizeIndustryKey(option));

        for (let i = 0; i < industryKeys.length; i += 3) {
          const batch = industryKeys.slice(i, i + 3);
          await Promise.allSettled(batch.map((industryKey) => refreshIndustryJobs(industryKey)));
        }
      } else {
        const normalizedIndustry = normalizeIndustryKey(industry);
        await refreshIndustryJobs(normalizedIndustry);
      }

      await fetchOverviewCounts();
      await fetchJobs();
    } catch (err) {
      console.error('Error scraping jobs:', err);
    }
    setIsScrapingJobs(false);
  };

  const toggleSave = (job: Job) => {
    if (!user) { openSignup(); return; }
    if (!job.dbId) return;
    toggleSavedJob(job.dbId);
  };

  const activeFilterCount = [industry, location, jobType, salary, workMode, careerLevel].filter(
    (v) => v !== "All"
  ).length + (roleFilter ? 1 : 0) + (companyFilter ? 1 : 0) + (workFamily !== "all" ? 1 : 0);

  // Role chips: { slug: matches role page URL param, label: display name }
  const ROLE_CHIPS: { slug: string; label: string; group: "business" | "craft" | "frontline" }[] = [
    // Business roles
    { slug: 'marketing', label: 'Marketing', group: 'business' },
    { slug: 'finance', label: 'Finance', group: 'business' },
    { slug: 'operations', label: 'Operations', group: 'business' },
    { slug: 'strategy', label: 'Strategy', group: 'business' },
    { slug: 'sales', label: 'Sales', group: 'business' },
    { slug: 'product', label: 'Product', group: 'business' },
    { slug: 'creative', label: 'Creative', group: 'business' },
    { slug: 'hr-people', label: 'People & Culture', group: 'business' },
    { slug: 'legal-compliance', label: 'Legal & Compliance', group: 'business' },
    { slug: 'project-management', label: 'Project & Programme Management', group: 'business' },
    { slug: 'commercial', label: 'Commercial', group: 'business' },
    { slug: 'ecommerce', label: 'E-commerce', group: 'business' },
    { slug: 'it-technology', label: 'IT & Technology', group: 'business' },
    { slug: 'ai', label: 'AI', group: 'business' },
    { slug: 'retail', label: 'Retail', group: 'business' },
    // Craft / vocational roles
    { slug: 'barista', label: 'Barista', group: 'craft' },
    { slug: 'bartender', label: 'Bartender / Front of House', group: 'craft' },
    { slug: 'chef', label: 'Chef / Baker', group: 'craft' },
    { slug: 'hotel-manager', label: 'Hotel Manager', group: 'craft' },
    { slug: 'estate-agent', label: 'Estate Agent', group: 'craft' },
    { slug: 'mortgage-advisor', label: 'Mortgage Advisor', group: 'craft' },
    { slug: 'personal-trainer', label: 'Personal Trainer', group: 'craft' },
    { slug: 'fitness-instructor', label: 'Fitness Instructor', group: 'craft' },
    { slug: 'charity-fundraiser', label: 'Charity Fundraiser', group: 'craft' },
    { slug: 'garment-technologist', label: 'Garment Technologist', group: 'craft' },
    { slug: 'stylist', label: 'Stylist / Designer', group: 'craft' },
    { slug: 'producer', label: 'Producer', group: 'craft' },
    { slug: 'teacher', label: 'Teacher', group: 'craft' },
    { slug: 'physiotherapist', label: 'Physiotherapist', group: 'craft' },
    { slug: 'psychotherapist', label: 'Psychotherapist', group: 'craft' },
    // Frontline roles
    { slug: 'retail-assistant', label: 'Retail Assistant', group: 'frontline' },
    { slug: 'warehouse-delivery', label: 'Warehouse & Delivery', group: 'frontline' },
    { slug: 'vehicle-technician', label: 'Vehicle Technician', group: 'frontline' },
    { slug: 'beauty-therapist', label: 'Beauty Therapist', group: 'frontline' },
    { slug: 'farmer', label: 'Farmer', group: 'frontline' },
    // Frontline - Travel & transport
    { slug: 'cabin-crew', label: 'Cabin Crew', group: 'frontline' },
    { slug: 'train-driver', label: 'Train Driver', group: 'frontline' },
    { slug: 'aviation-ground-crew', label: 'Aviation Ground Crew', group: 'frontline' },
    { slug: 'rail-transport-staff', label: 'Rail & Transport Staff', group: 'frontline' },
    // Frontline - Hospitality
    { slug: 'hotel-front-of-house', label: 'Hotel Front of House', group: 'frontline' },
    { slug: 'restaurant-floor-kitchen', label: 'Restaurant Floor & Kitchen', group: 'frontline' },
    // Frontline - Pets
    { slug: 'veterinary-nurse', label: 'Veterinary Nurse', group: 'frontline' },
    { slug: 'pet-care', label: 'Pet Care', group: 'frontline' },
    // Frontline - Teaching
    { slug: 'teaching-assistant', label: 'Teaching Assistant', group: 'frontline' },
    { slug: 'school-support-staff', label: 'School Support Staff', group: 'frontline' },
    // Frontline - Beauty / Wellness / Pharmacy
    { slug: 'hair-stylist', label: 'Hair Stylist', group: 'frontline' },
    { slug: 'salon-staff', label: 'Salon Staff', group: 'frontline' },
    { slug: 'wellness-practitioner', label: 'Wellness Practitioner', group: 'frontline' },
    { slug: 'pharmacy-staff', label: 'Pharmacy Staff', group: 'frontline' },
    // Frontline - Charity
    { slug: 'charity-frontline', label: 'Charity Frontline', group: 'frontline' },
    // Craft / Frontline - Horse Racing
    { slug: 'jockey', label: 'Jockey', group: 'craft' },
    { slug: 'racehorse-trainer', label: 'Racehorse Trainer', group: 'craft' },
    { slug: 'stable-hand', label: 'Stable Hand / Groom', group: 'frontline' },
    // Career-map craft roles - Estate Agency
    { slug: 'conveyancer', label: 'Conveyancer', group: 'craft' },
    { slug: 'lettings-negotiator', label: 'Lettings Negotiator', group: 'craft' },
    { slug: 'property-manager', label: 'Property Manager', group: 'craft' },
    // Career-map craft roles - Cars
    { slug: 'car-sales-executive', label: 'Car Sales Executive', group: 'craft' },
    // Career-map craft roles - Pets
    { slug: 'veterinary-surgeon', label: 'Veterinary Surgeon', group: 'craft' },
    // Career-map craft roles - Wellness / Physiotherapy
    { slug: 'occupational-therapist', label: 'Occupational Therapist', group: 'craft' },
    // Career-map business roles - Buying / Data / Service
    { slug: 'buyer', label: 'Buyer / Merchandiser', group: 'business' },
    { slug: 'data-analyst', label: 'Data Analyst', group: 'business' },
    { slug: 'customer-service', label: 'Customer Service', group: 'frontline' },
    // Career-map roles - Farming
    { slug: 'agronomist', label: 'Agronomist', group: 'craft' },
    { slug: 'farm-manager', label: 'Farm Manager', group: 'craft' },
    { slug: 'farm-worker', label: 'Farm Worker', group: 'frontline' },
    // Career-map roles - Health
    { slug: 'nurse', label: 'Nurse', group: 'craft' },
    { slug: 'doctor', label: 'Doctor / GP', group: 'craft' },
    { slug: 'midwife', label: 'Midwife', group: 'craft' },
    { slug: 'healthcare-assistant', label: 'Healthcare Assistant', group: 'frontline' },
    { slug: 'care-worker', label: 'Care Worker', group: 'frontline' },
    // Career-map roles - Money
    { slug: 'financial-advisor', label: 'Financial Advisor', group: 'craft' },
    { slug: 'wealth-manager', label: 'Wealth Manager', group: 'craft' },
    { slug: 'investment-analyst', label: 'Investment Analyst', group: 'business' },
    { slug: 'mortgage-broker', label: 'Mortgage Broker', group: 'craft' },
    // Formula 1 / Motorsport craft roles
    { slug: 'race-engineer', label: 'Race Engineer', group: 'craft' },
    { slug: 'mechanic', label: 'Mechanic', group: 'craft' },
    { slug: 'aerodynamicist', label: 'Aerodynamicist', group: 'craft' },
    { slug: 'performance-engineer', label: 'Performance Engineer', group: 'craft' },
    { slug: 'composite-technician', label: 'Composite Technician', group: 'craft' },
    // Football craft/frontline roles
    { slug: 'football-coach', label: 'Football Coach', group: 'craft' },
    { slug: 'football-scout', label: 'Scout', group: 'craft' },
    { slug: 'sports-scientist', label: 'Sports Scientist', group: 'craft' },
    { slug: 'football-physio', label: 'Physio (Football)', group: 'craft' },
    { slug: 'groundsperson', label: 'Groundsperson', group: 'frontline' },
    { slug: 'kit-manager', label: 'Kit Manager', group: 'frontline' },
    { slug: 'football-analyst', label: 'Performance Analyst', group: 'craft' },
    { slug: 'academy-coach', label: 'Academy Coach', group: 'craft' },
    // Journalism
    { slug: 'reporter', label: 'Reporter / Journalist', group: 'craft' },
    { slug: 'editor', label: 'Editor', group: 'craft' },
    { slug: 'broadcast-journalist', label: 'Broadcast Journalist', group: 'craft' },
    // Gaming
    { slug: 'game-designer', label: 'Game Designer', group: 'craft' },
    { slug: 'qa-tester', label: 'QA Tester', group: 'frontline' },
    // Music
    { slug: 'sound-engineer', label: 'Sound Engineer', group: 'craft' },
    { slug: 'live-events-manager', label: 'Live Events / Tour Manager', group: 'craft' },
    // Travel
    { slug: 'travel-consultant', label: 'Travel Consultant', group: 'craft' },
    // Interior Design
    { slug: 'interior-designer', label: 'Interior Designer', group: 'craft' },
    // Grocery
    { slug: 'grocery-store-manager', label: 'Store Manager (Grocery)', group: 'craft' },
  ];

  // Fallback keyword matching for jobs that don't have role_category set yet (slug-keyed)
  const ROLE_KEYWORDS: Record<string, string[]> = {
    marketing: ['marketing', 'brand', 'social media', 'content', 'pr ', 'public relations', 'communications', 'seo', 'ppc', 'paid media', 'paid social', 'digital marketing', 'crm', 'campaign', 'copywriter', 'advertising', 'influencer', 'lifecycle', 'martech', 'product marketing', 'field marketing', 'growth'],
    finance: ['finance', 'accountant', 'accounting', 'financial', 'fp&a', 'treasury', 'tax', 'audit', 'bookkeep', 'payroll', 'credit control', 'management accounts', 'commercial finance', 'controller'],
    operations: ['operations', 'ops ', 'supply chain', 'logistics', 'warehouse', 'facilities', 'procurement', 'process improvement', 'shift manager', 'site manager', 'fulfilment', 'distribution'],
    strategy: ['strategy', 'strategic', 'business development', 'corporate development', 'go-to-market', 'gtm', 'm&a', 'ventures', 'chief of staff', 'analyst', 'consulting', 'consultant', 'transformation', 'insight'],
    sales: ['sales', 'account manager', 'account executive', 'business development', 'revenue', 'partnerships', 'bdr', 'sdr', 'new business'],
    product: ['product manager', 'product owner', 'product design', 'product marketing', 'ux ', 'ui ', 'user experience', 'roadmap'],
    creative: ['creative', 'designer', 'design', 'art director', 'photographer', 'videographer', 'illustrator', 'graphic', 'copywriter'],
    'hr-people': ['hr ', 'human resources', 'people ', 'talent', 'recruitment', 'recruiter', 'learning & development', 'l&d', 'employee relations', 'reward', 'compensation', 'benefits', 'culture'],
    'legal-compliance': ['legal', 'compliance', 'regulatory', 'governance', 'solicitor', 'counsel', 'lawyer', 'barrister', 'paralegal', 'risk', 'privacy'],
    'project-management': ['project manager', 'programme manager', 'program manager', 'pmo', 'delivery manager', 'implementation', 'transformation', 'scrum', 'agile', 'project lead'],
    commercial: ['commercial', 'partnerships', 'trading', 'trader', 'merchandiser', 'merchandising', 'category manager', 'buying', 'buyer', 'wholesale', 'head of sales', 'account management', 'business development'],
    ecommerce: ['e-commerce', 'ecommerce', 'digital trading', 'online trading', 'marketplace', 'conversion', 'retention', 'merchandiser', 'dtc', 'd2c', 'omnichannel', 'online manager'],
    'it-technology': ['engineer', 'developer', 'software', 'devops', 'cloud', 'platform', 'data engineer', 'security engineer', 'sre', 'architect', 'full stack', 'frontend', 'backend', 'mobile developer', 'data analyst', 'technology', ' it ', 'machine learning engineer', 'ml engineer', 'applied ai', 'ai engineer', 'mlops'],
    ai: ['machine learning engineer', 'ml engineer', 'research engineer', 'applied ai', 'applied scientist', 'ai engineer', 'deep learning', 'mlops', 'ai infrastructure', 'model engineer', 'forward deployed engineer', 'forward deployed', 'research scientist', 'alignment', 'interpretability', 'frontier model', 'ai researcher', 'ml researcher', 'member of technical staff', 'ai product manager', 'ai sales', 'ai go-to-market', 'ai gtm', 'ai partnerships', 'ai account', 'ai customer', 'ai solutions', 'ai consultant', 'ai strategy', 'ai policy', 'ai safety', 'ai governance', 'trust and safety', 'trust & safety', 'red team', 'red-team', 'responsible ai', 'ai ethics', 'ai risk', 'safety researcher'],
    retail: ['store manager', 'assistant manager', 'retail', 'sales associate', 'sales assistant', 'shop floor', 'visual merchandiser', 'store supervisor', 'store ', 'concession', 'shop manager'],
    // Craft roles
    barista: ['barista', 'coffee'],
    bartender: ['bartender', 'front of house', 'waiter', 'waitress', 'waiting staff', 'server', 'host', 'bar staff', 'bar manager', 'mixologist'],
    chef: ['chef', 'baker', 'cook ', 'pastry', 'sous chef', 'head chef', 'kitchen'],
    'hotel-manager': ['hotel manager', 'general manager', 'duty manager', 'front office manager', 'reservations manager', 'guest experience', 'hospitality manager'],
    'estate-agent': ['estate agent', 'lettings', 'property consultant', 'sales negotiator', 'lettings negotiator', 'valuer', 'branch manager'],
    'mortgage-advisor': ['mortgage advisor', 'mortgage adviser', 'mortgage broker', 'mortgage consultant'],
    'personal-trainer': ['personal trainer', ' pt ', 'strength coach'],
    'fitness-instructor': ['fitness instructor', 'group exercise', 'yoga instructor', 'pilates instructor', 'spin instructor', 'gym instructor', 'class instructor'],
    'charity-fundraiser': ['fundraiser', 'fundraising', 'major gifts', 'individual giving', 'corporate partnerships', 'trusts and foundations', 'legacy giving', 'community fundraising'],
    'garment-technologist': ['garment technologist', 'garment tech', 'fit technician', 'pattern cutter', 'pattern grader', 'production technologist'],
    stylist: ['stylist', 'designer', 'creative director', 'fashion designer', 'interior designer', 'jewellery designer'],
    producer: ['producer', 'production manager', 'line producer', 'executive producer', 'music producer', 'film producer'],
    teacher: ['teacher', 'teaching', 'tutor', 'lecturer', 'sen ', 'eyfs', 'ks1', 'ks2', 'ks3', 'ks4', 'sixth form', 'ect ', 'ect pool', 'early career teacher', 'nqt', 'newly qualified teacher', 'curriculum lead', 'curriculum leader', 'curriculum manager', 'curriculum director', 'head of department', 'head of faculty', 'head of year', 'subject lead', 'phase leader', 'supply teacher', 'cover teacher'],
    physiotherapist: ['physiotherapist', 'physio ', 'physical therapist', 'sports therapist', 'rehabilitation therapist'],
    psychotherapist: ['psychotherapist', 'counsellor', 'counselor', 'cbt therapist', 'psychologist', 'mental health practitioner'],
    // Frontline roles
    'retail-assistant': ['sales assistant', 'store assistant', 'retail assistant', 'shop assistant', 'store colleague', 'shop floor', 'cashier', 'till operator', 'visual merchandiser', 'store supervisor', 'store manager', 'concession', 'beauty advisor'],
    'warehouse-delivery': ['warehouse', 'picker', 'packer', 'forklift', 'flt operator', 'goods in', 'fulfilment', 'distribution', 'driver', 'hgv', 'lgv', 'van driver', 'delivery rider', 'courier', 'multi-drop', 'transport', 'shunter'],
    'vehicle-technician': ['vehicle technician', 'mot tester', 'mechanic', 'motor technician', 'service advisor', 'parts advisor', 'bodyshop', 'paint technician', 'panel beater', 'workshop', 'aftersales', 'diagnostic technician'],
    'beauty-therapist': ['beauty therapist', 'spa therapist', 'esthetician', 'aesthetician', 'beauty advisor', 'beauty consultant', 'nail technician', 'lash technician', 'aesthetic practitioner', 'massage therapist', 'skin therapist', 'salon manager', 'spa manager'],
    farmer: ['farm worker', 'farm operative', 'farm hand', 'farmhand', 'stockperson', 'herdsperson', 'shepherd', 'dairy', 'tractor driver', 'combine operator', 'agronomist', 'farm manager', 'agricultural', 'arable', 'livestock', 'crop'],
    // Frontline - Travel & transport
    'cabin-crew': ['cabin crew', 'flight attendant', 'air hostess', 'air steward', 'in-flight', 'inflight', 'purser'],
    'train-driver': ['train driver', 'train operator', 'tram driver', 'underground driver', 'tube driver', 'locomotive driver'],
    'aviation-ground-crew': ['ground crew', 'ground handler', 'ground operations', 'baggage handler', 'ramp agent', 'dispatcher', 'flight dispatcher', 'turnaround coordinator', 'check-in agent', 'gate agent', 'aircraft cleaner', 'pilot', 'first officer', 'aviation safety'],
    'rail-transport-staff': ['station manager', 'station assistant', 'station staff', 'train conductor', 'train guard', 'ticket inspector', 'revenue protection', 'platform staff', 'rail customer', 'bus driver', 'tram conductor', 'transport assistant'],
    // Frontline - Hospitality
    'hotel-front-of-house': ['front office', 'receptionist', 'hotel receptionist', 'concierge', 'guest services', 'guest experience', 'porter', 'bellboy', 'bellhop', 'housekeeper', 'housekeeping', 'room attendant', 'night auditor', 'duty manager'],
    'restaurant-floor-kitchen': ['waiter', 'waitress', 'waiting staff', 'server', 'host ', 'hostess', 'maitre', 'sommelier', 'food runner', 'busser', 'kitchen porter', 'kitchen assistant', 'commis chef', 'chef de partie', 'sous chef', 'line cook', 'prep cook', 'dishwasher'],
    // Frontline - Pets
    'veterinary-nurse': ['veterinary nurse', 'vet nurse', 'rvn ', 'student vet nurse', 'svn ', 'veterinary care assistant', 'vca ', 'animal care assistant', 'veterinary receptionist'],
    'pet-care': ['dog groomer', 'pet groomer', 'cat groomer', 'dog walker', 'pet sitter', 'dog trainer', 'kennel assistant', 'cattery assistant', 'animal care', 'doggy daycare', 'pet shop assistant'],
    // Frontline - Teaching
    'teaching-assistant': ['teaching assistant', ' ta ', 'classroom assistant', 'higher level teaching assistant', 'hlta'],
    'school-support-staff': ['cover supervisor', 'learning support assistant', 'lsa ', 'sen ', 'send ', 'send teaching', 'special needs assistant', 'behaviour mentor', 'pastoral', 'school office', 'school administrator', 'school receptionist', 'midday supervisor', 'lunchtime supervisor', 'school caretaker', 'school cleaner', 'nursery assistant', 'nursery practitioner', 'early years practitioner', 'eyfs practitioner'],
    // Frontline - Beauty / Wellness / Pharmacy
    'hair-stylist': ['hair stylist', 'hairdresser', 'hair dresser', 'hair colourist', 'colorist', 'barber', 'hair technician', 'hair artist'],
    'salon-staff': ['nail technician', 'nail artist', 'manicurist', 'pedicurist', 'makeup artist', 'mua ', 'lash technician', 'brow technician', 'salon manager', 'salon assistant', 'salon receptionist', 'aesthetic practitioner'],
    'wellness-practitioner': ['yoga teacher', 'yoga instructor', 'pilates teacher', 'pilates instructor', 'sports massage', 'massage therapist', 'holistic therapist', 'reflexologist', 'acupuncturist', 'wellness coach', 'sound therapist', 'reiki', 'meditation teacher'],
    'pharmacy-staff': ['pharmacy dispenser', 'dispensing assistant', 'pharmacy assistant', 'pharmacy technician', 'pharmacy advisor', 'pharmacy counter assistant', 'medicines counter assistant'],
    // Frontline - Charity
    'charity-frontline': ['caseworker', 'case worker', 'outreach worker', 'support worker', 'volunteer coordinator', 'community worker', 'community outreach', 'service coordinator', 'helpline advisor', 'helpline volunteer', 'advice worker', 'welfare adviser', 'safeguarding officer'],
    // Horse Racing
    jockey: ['jockey', 'apprentice jockey', 'conditional jockey', 'work rider', 'exercise rider', 'race rider'],
    'racehorse-trainer': ['racehorse trainer', 'assistant trainer', 'pupil assistant', 'head lad', 'head lass', 'travelling head', 'yard manager', 'racing yard'],
    'stable-hand': ['stable hand', 'stable lad', 'stable lass', 'stable staff', 'groom', 'stud groom', 'stud hand', 'stud worker', 'racing groom', 'stable assistant', 'stud assistant', 'yard person', 'yard staff'],
    // Estate Agency career-map roles
    conveyancer: ['conveyancer', 'conveyancing', 'licensed conveyancer', 'property lawyer', 'completions executive'],
    'lettings-negotiator': ['lettings negotiator', 'lettings consultant', 'lettings manager', 'lettings agent', 'rental negotiator'],
    'property-manager': ['property manager', 'block manager', 'portfolio manager', 'property administrator', 'tenancy manager', 'lettings administrator'],
    // Cars career-map
    'car-sales-executive': ['car sales executive', 'sales executive', 'used car sales', 'new car sales', 'business manager', 'sales controller', 'showroom sales', 'automotive sales'],
    // Pets career-map
    'veterinary-surgeon': ['veterinary surgeon', 'vet surgeon', ' vet ', 'veterinarian', 'mrcvs', 'small animal vet', 'equine vet', 'farm vet', 'locum vet'],
    // Physio / Wellness
    'occupational-therapist': ['occupational therapist', ' ot ', 'band 5 ot', 'band 6 ot', 'community ot', 'paediatric occupational therapist'],
    // Business - buying / data / service
    buyer: ['buyer', 'assistant buyer', 'senior buyer', 'merchandiser', 'merchandise', 'merchandising', 'category manager', 'category buyer', 'range planner', 'allocator'],
    'data-analyst': ['data analyst', 'business analyst', 'insight analyst', 'reporting analyst', 'commercial analyst', 'bi analyst', 'analytics manager', 'data scientist', 'analytics engineer'],
    'customer-service': ['customer service', 'customer support', 'customer care', 'customer experience', 'cx ', 'contact centre', 'call centre', 'customer advisor', 'helpdesk', 'support agent', 'service desk'],
    // Farming
    agronomist: ['agronomist', 'crop advisor', 'farm advisor', 'farm consultant', 'fertiliser advisor'],
    'farm-manager': ['farm manager', 'estate manager', 'assistant farm manager', 'dairy manager', 'arable manager', 'livestock manager', 'unit manager'],
    'farm-worker': ['farm worker', 'farm operative', 'farm hand', 'farmhand', 'general farm worker', 'tractor driver', 'combine operator', 'shepherd', 'stockperson', 'herdsperson', 'dairy assistant'],
    // Health
    nurse: ['nurse', 'staff nurse', 'registered nurse', 'rgn ', 'rmn ', 'theatre nurse', 'community nurse', 'practice nurse', 'district nurse', 'a&e nurse', 'icu nurse', 'paediatric nurse', 'mental health nurse'],
    doctor: ['doctor', ' gp ', 'general practitioner', 'consultant', 'registrar', 'specialty doctor', 'foundation doctor', 'sho ', 'specialist doctor', 'salaried gp', 'gp partner', 'locum gp'],
    midwife: ['midwife', 'community midwife', 'band 5 midwife', 'band 6 midwife', 'band 7 midwife', 'maternity nurse'],
    'healthcare-assistant': ['healthcare assistant', 'health care assistant', 'hca ', 'nursing assistant', 'clinical support worker', 'ward clerk', 'phlebotomist', 'theatre assistant'],
    'care-worker': ['care worker', 'care assistant', 'senior care assistant', 'night care assistant', 'care home', 'support worker', 'care team leader', 'clinical lead', 'deputy home manager', 'home manager', 'registered manager', 'activities coordinator', 'activities co-ordinator', 'live-in carer', 'domiciliary care', 'community carer', 'personal care assistant'],
    // Money
    'financial-advisor': ['financial advisor', 'financial adviser', 'ifa ', 'paraplanner', 'wealth advisor', 'wealth adviser', 'pensions advisor', 'investment advisor'],
    'wealth-manager': ['wealth manager', 'private banker', 'private wealth', 'investment manager', 'portfolio manager', 'relationship manager wealth'],
    'investment-analyst': ['investment analyst', 'equity analyst', 'fund analyst', 'research analyst', 'buy-side analyst', 'sell-side analyst', 'credit analyst', 'fixed income analyst'],
    'mortgage-broker': ['mortgage broker', 'mortgage adviser', 'mortgage advisor', 'mortgage consultant', 'protection advisor', 'protection adviser'],
    // Formula 1 / Motorsport
    'race-engineer': ['race engineer', 'performance engineer', 'vehicle dynamics engineer', 'track engineer', 'test engineer', 'simulation engineer', 'strategy engineer', 'race strategist'],
    mechanic: ['mechanic', 'no.1 mechanic', 'number one mechanic', 'pit crew', 'car build', 'race team mechanic', 'tyre technician', 'tyre fitter', 'sub-assembly', 'build technician'],
    aerodynamicist: ['aerodynamicist', 'aerodynamics', 'aero engineer', 'cfd engineer', 'cfd analyst', 'wind tunnel', 'aerodynamic', 'aero performance'],
    'performance-engineer': ['performance engineer', 'vehicle performance', 'vehicle dynamics', 'simulation engineer', 'telemetry', 'data engineer motorsport', 'race data', 'trackside engineer'],
    'composite-technician': ['composite technician', 'composite', 'carbon fibre', 'carbon fiber', 'laminator', 'autoclave', 'prepreg', 'composite lay-up', 'composite layup'],
    // Football
    'football-coach': ['football coach', 'head coach', 'first team coach', 'assistant coach', 'assistant manager', 'coaching', 'goalkeeping coach', 'set-piece coach', 'fitness coach', 'u18 coach', 'u21 coach', 'u23 coach', 'development coach', 'lead coach', 'pdp coach'],
    'football-scout': ['scout', 'scouting', 'recruitment analyst', 'talent identification', 'opposition analyst', 'recruitment scout', 'chief scout', 'regional scout', 'head of recruitment'],
    'sports-scientist': ['sports scientist', 'sport scientist', 'exercise scientist', 'strength and conditioning', 's&c coach', 'load monitoring', 'gps analyst', 'fitness testing', 'head of sports science', 'head of performance'],
    'football-physio': ['physiotherapist', 'physio', 'first team physio', 'head physiotherapist', 'rehabilitation coach', 'soft tissue therapist', 'sports therapist', 'head of medical'],
    groundsperson: ['groundsperson', 'groundsman', 'groundskeeper', 'pitch maintenance', 'head groundsman', 'assistant groundsperson', 'greenkeeper', 'turf', 'grounds team'],
    'kit-manager': ['kit manager', 'kit man', 'kit assistant', 'equipment manager', 'equipment officer', 'kit coordinator', 'first team kit'],
    'football-analyst': ['performance analyst', 'match analyst', 'video analyst', 'tactical analyst', 'opposition analyst', 'data analyst football', 'first team analyst', 'lead analyst', 'head of analysis', 'technical scout'],
    'academy-coach': ['academy coach', 'academy manager', 'youth coach', 'youth development', 'foundation phase coach', 'youth phase coach', 'professional development phase', 'pda coach', 'academy director', 'head of coaching'],
    // Journalism
    reporter: ['reporter', 'journalist', 'correspondent', 'news reporter', 'feature writer', 'staff writer', 'investigative journalist', 'senior reporter', 'news editor'],
    editor: ['editor', 'sub-editor', 'subeditor', 'commissioning editor', 'features editor', 'section editor', 'deputy editor', 'editor-in-chief', 'managing editor', 'copy editor', 'digital editor', 'video editor'],
    'broadcast-journalist': ['broadcast journalist', 'presenter', 'newsreader', 'news anchor', 'radio presenter', 'radio journalist', 'podcast presenter', 'podcast host', 'tv presenter', 'tv reporter', 'broadcast producer'],
    // Gaming
    'game-designer': ['game designer', 'level designer', 'narrative designer', 'systems designer', 'gameplay designer', 'combat designer', 'quest designer', 'game director', 'creative lead'],
    'qa-tester': ['qa tester', 'qa analyst', 'quality assurance', 'game tester', 'test analyst', 'compliance tester', 'localisation tester', 'localization tester', 'bug hunter'],
    // Music
    'sound-engineer': ['sound engineer', 'audio engineer', 'recording engineer', 'mix engineer', 'mastering engineer', 'studio engineer', 'live sound', 'foh engineer', 'monitor engineer', 'post-production audio'],
    'live-events-manager': ['tour manager', 'event manager', 'festival manager', 'promoter', 'live events', 'production manager', 'stage manager', 'venue manager', 'gig promoter', 'booking agent', 'artist manager'],
    // Travel
    'travel-consultant': ['travel agent', 'travel consultant', 'travel advisor', 'travel adviser', 'holiday consultant', 'cruise consultant', 'luxury travel', 'tour operator', 'reservations agent', 'travel planner'],
    // Interior Design
    'interior-designer': ['interior designer', 'interior stylist', 'space planner', 'interior architect', 'kitchen designer', 'bathroom designer', 'showroom designer', 'design consultant'],
    // Grocery
    'grocery-store-manager': ['store manager', 'branch manager', 'supermarket manager', 'deputy manager', 'department manager', 'section manager', 'duty manager', 'night manager', 'shift manager'],
  };

  const VALID_ROLE_SLUGS = new Set(ROLE_CHIPS.map(r => r.slug));

  const updateRoleCategoryView = (nextCategory: "all" | "business" | "craft" | "frontline") => {
    setRoleCategoryView(nextCategory);
    if (nextCategory === "all" || !roleFilter) return;
    const activeRole = ROLE_CHIPS.find((r) => r.slug === toRoleSlug(roleFilter));
    if (activeRole && activeRole.group !== nextCategory) {
      updateRoleFilter("");
    }
  };

  // Roles allowed for the currently-selected industry. When industry === "All"
  // we allow every chip. Otherwise we use the explicit role→industry mapping
  // in src/data/roles.ts as the source of truth - including business roles
  // (e.g. Investment Analyst is only relevant to Money, not Influencing).
  // If an industry has no entries in roles.ts at all (e.g. Influencing,
  // Food & Drink), we fall back to showing every chip so the filter is useful.
  // Some Marketplace industry names differ from the canonical names in roles.ts.
  // Map them here so the role-chip filter stays accurate.
  const INDUSTRY_ROLE_ALIASES: Record<string, string[]> = {
    "Food & Drink": ["Hospitality"],
  };

  const allowedRoleSlugsForIndustry = useMemo(() => {
    if (industry === "All") return null; // null = no restriction
    const allowed = new Set<string>();
    const names = [industry, ...(INDUSTRY_ROLE_ALIASES[industry] || [])];
    // Use explicit mappings from roles.ts for every group (business, craft, frontline)
    for (const r of ROLE_DEFINITIONS) {
      if (names.some(n => r.industries.includes(n))) allowed.add(r.slug);
    }
    // Safety net: if the industry has no mapped roles yet, allow all chips
    if (allowed.size === 0) return null;
    return allowed;
  }, [industry]);

  // Keep the role-category toggle in sync with the active role filter
  useEffect(() => {
    if (!roleFilter) return;
    const slug = toRoleSlug(roleFilter);
    const match = ROLE_CHIPS.find(r => r.slug === slug);
    if (match && match.group !== roleCategoryView) {
      setRoleCategoryView(match.group);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  // If the active role isn't applicable to the chosen industry, clear it so
  // users don't end up with an empty result list from a stale filter.
  useEffect(() => {
    if (!roleFilter || !allowedRoleSlugsForIndustry) return;
    const slug = toRoleSlug(roleFilter);
    if (!allowedRoleSlugsForIndustry.has(slug)) {
      updateRoleFilter("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedRoleSlugsForIndustry]);

  // Map DB ai_role_category / role_category values (free text) to our slugs
  const ROLE_CATEGORY_ALIASES: Record<string, string> = {
    'legal': 'legal-compliance',
    'legal & compliance': 'legal-compliance',
    'legal-compliance': 'legal-compliance',
    'hr & people': 'hr-people',
    'people & culture': 'hr-people',
    'hr-people': 'hr-people',
    'hr': 'hr-people',
    'human resources': 'hr-people',
    'e-commerce': 'ecommerce',
    'ecommerce': 'ecommerce',
    'project & programme management': 'project-management',
    'project management': 'project-management',
    'project-management': 'project-management',
    'technology': 'it-technology',
    'it & technology': 'it-technology',
    'it-technology': 'it-technology',
    'tech': 'it-technology',
  };

  // Normalise an incoming role filter value (could be a slug or a display label)
  // into a canonical slug we can match against.
  const toRoleSlug = (value: string): string => {
    const v = value.toLowerCase().trim();
    if (VALID_ROLE_SLUGS.has(v)) return v;
    if (ROLE_CATEGORY_ALIASES[v]) return ROLE_CATEGORY_ALIASES[v];
    // Try matching by chip label
    const byLabel = ROLE_CHIPS.find(c => c.label.toLowerCase() === v);
    if (byLabel) return byLabel.slug;
    return v;
  };

  // Exclude healthcare/nursing false positives from People & Culture (HR)
  const HR_EXCLUSION_KEYWORDS = ['nurse', 'nursing', 'nursery', 'midwife', 'midwifery', 'carer', 'care worker', 'care assistant', 'healthcare assistant', 'clinical', 'medical', 'health visitor', 'physiotherapist', 'occupational therapist', 'speech therapist', 'social worker'];

  const matchesRole = (job: Job, role: string): boolean => {
    const roleSlug = toRoleSlug(role);

    // Special case: the AI chip surfaces every role at an AI-industry company.
    if (roleSlug === 'ai') {
      return (job.industry || '').toLowerCase() === 'ai';
    }

    const keywords = ROLE_KEYWORDS[roleSlug] || [roleSlug.replace(/-/g, ' ')];

    // If ai_role_category or role_category is a controlled value, use it directly
    if (job.roleCategory) {
      const dbCategory = job.roleCategory.toLowerCase();
      const normalised = ROLE_CATEGORY_ALIASES[dbCategory] || dbCategory;

      if (VALID_ROLE_SLUGS.has(normalised)) {
        // Exclude healthcare false positives from People & Culture
        if (normalised === 'hr-people') {
          const titleLower = job.title.toLowerCase();
          if (HR_EXCLUSION_KEYWORDS.some(kw => titleLower.includes(kw))) return false;
        }
        return normalised === roleSlug;
      }
    }

    // Fallback: keyword match against TITLE and TAGS only (not description, which often contains unrelated terms)
    const jobText = `${job.title} ${job.tags.join(" ")}`.toLowerCase();
    return keywords.some((kw) => jobText.includes(kw));
  };

  // Temp / casual / seasonal / contract detection. Drives both the
  // "Temp only" toggle and the "Temp" badge on job cards.
  const isTempJob = (j: Job): boolean => {
    return (j.type || "").toLowerCase() === "temporary";
  };

  const filteredJobs = useMemo(() => {
    const userLevel = userCareerLevel ? LEVEL_ORDER[userCareerLevel.toLowerCase()] ?? null : null;
    const hasBusinessProfileSignals = userRoleSlugs.some(isBusinessRoleSlug) || (userLevel !== null && userLevel >= 2);
    const isSeniorBusiness = hasBusinessProfileSignals && (userLevel !== null && userLevel >= 2);
    const isCategoryTab = activeTab === 'internships' || activeTab === 'remote'
      || activeTab === 'freelance' || activeTab === 'temp' || activeTab === 'parttime';

    const BUSINESS_CATS = new Set([
      "marketing", "operations", "strategy", "commercial", "e-commerce", "ecommerce",
      "finance", "sales", "hr-people", "legal-compliance", "product", "project-management", "producer", "creative",
    ]);

    // Build a set of role category keywords from user's Understand Me role slugs
    const SLUG_TO_CATEGORIES: Record<string, string[]> = {
      operations: ['operations', 'ops ', 'supply chain', 'logistics', 'warehouse', 'procurement'],
      strategy: ['strategy', 'strategic', 'business development', 'analyst', 'transformation'],
      'project-management': ['project', 'programme', 'program', 'pmo', 'delivery manager'],
      marketing: ['marketing', 'brand', 'social media', 'content', 'pr ', 'communications', 'seo', 'crm'],
      finance: ['finance', 'accountant', 'financial', 'fp&a', 'treasury', 'tax', 'audit'],
      sales: ['sales', 'account manager', 'revenue', 'client', 'partnerships'],
      product: ['product manager', 'product owner', 'ux ', 'ui '],
      creative: ['creative', 'designer', 'design', 'art director'],
      'hr-people': ['hr', 'human resources', 'people', 'talent', 'recruitment', 'learning & development'],
      'legal-compliance': ['legal', 'compliance', 'regulatory', 'governance', 'solicitor', 'counsel', 'lawyer'],
      commercial: ['commercial', 'trading', 'buyer', 'merchandis', 'category manager'],
      ecommerce: ['ecommerce', 'e-commerce', 'digital', 'online'],
    };

    const isRoleMatch = (job: Job): boolean => {
      if (userRoleSlugs.length === 0) return false;
      const jobText = `${job.title} ${job.roleCategory || ''} ${job.tags.join(' ')}`.toLowerCase();
      return userRoleSlugs.some(slug => {
        const keywords = SLUG_TO_CATEGORIES[slug];
        if (!keywords) return jobText.includes(slug.replace(/-/g, ' '));
        return keywords.some(kw => jobText.includes(kw));
      });
    };

    const isBusinessCat = (job: Job): boolean => {
      const cat = (job.roleCategory || "").trim().toLowerCase().replace(/&/g, "-").replace(/\s+/g, "-");
      return BUSINESS_CATS.has(cat);
    };

    let jobs = allJobs.filter((job) => {
      const hasAiMatches = !!(aiSearchResults && aiSearchResults.length > 0);
      if (!hasAiMatches && search && !`${job.title} ${job.company} ${job.industry} ${job.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase())) return false;
      // Company logo strip filter - exact match on company name (case-insensitive).
      // Special case: "nhs" rolls up every NHS Trust (any company name containing "nhs").
      if (companyFilter && !matchesCompanyFilter(job.company, companyFilter)) return false;
      // When AI smart search is active, the AI has already chosen the most relevant
      // filters - profile defaults don't override AI results, but explicit user
      // dropdown selections (industry !== "All", roleFilter set) should always apply
      // even when AI search is active, so users can narrow AI results further.
      if (!isCategoryTab && !matchesIndustryFilter(job, industry)) return false;
      if (location !== "All" && job.location !== location) return false;
      if (jobType !== "All") {
        // "Internship / Graduate" is a synthetic bucket - DB rows are stored as
        // type='Internship' and grad/apprentice/trainee/placement titles. Match
        // the same logic the Internships tab uses so the filter actually returns
        // results instead of always-zero.
        if (jobType === "Internship / Graduate") {
          const isEarly = job.type === "Internship"
            || /\b(intern|internship|graduate|grad scheme|apprentice|apprenticeship|trainee|placement)\b/i.test(job.title || "");
          if (!isEarly) return false;
        } else if (job.type !== jobType) {
          return false;
        }
      }
      if (workMode !== "All" && job.workMode !== workMode) return false;
      if (tempOnly && !isTempJob(job)) return false;
      if (!inSalaryRange(job.salary, salary)) return false;
      if (roleFilter && !matchesRole(job, roleFilter)) return false;
      // When no specific role chip is selected, the Business / Vocational / Frontline
      // toggle filters the whole job list to that role group.
      if (!hasAiMatches && !roleFilter && roleCategoryView !== 'all') {
        const matchesAnyInGroup = ROLE_CHIPS
          .filter(r => r.group === roleCategoryView)
          .some(r => matchesRole(job, r.slug));
        if (!matchesAnyInGroup) return false;
      }
      if (careerLevel !== "All" && job.careerLevel && job.careerLevel.toLowerCase() !== careerLevel.toLowerCase()) return false;
      // Explicit Craft / Business segment chosen by the user (or seeded from
      // their profile). Craft = chef, baker, barista, footballer, coach,
      // hairdresser… Business = marketing, finance, ops, tech, sales, etc.
      // Skip when AI search is active - the AI's chosen jobs are the user's intent.
      if (!hasAiMatches && workFamily === 'craft') {
        if (!isCraftServiceJob(job.title, [job.roleCategory])) return false;
      } else if (!hasAiMatches && workFamily === 'business') {
        if (isCraftServiceJob(job.title, [job.roleCategory])) return false;
      }
      // Profile-based business/craft whitelisting only kicks in for the broad
      // "All industries" view AND when the user hasn't picked an explicit
      // Craft/Business segment. Category tabs (Remote / Internships / etc.) are
      // explicit user intent and must not be collapsed by the senior-business
      // profile heuristic, otherwise 121 remote jobs can shrink to a single role.
      // Any dropdown filter pick (type, location, onsite/remote, salary, career
      // level, temp toggle, company chip) is just as explicit as those - without
      // these, picking "Full-time" or "London" alone still let the heuristic
      // silently crush results down to ~1 job for logged-in senior/business
      // profiles, which looked exactly like "the filter doesn't work".
      const hasExplicitIntent = isCategoryTab || !!roleFilter || industry !== "All" || search.trim() !== "" || !!aiSearchResults || workFamily !== 'all'
        || jobType !== "All" || location !== "All" || workMode !== "All" || salary !== "All" || careerLevel !== "All" || tempOnly || !!companyFilter;
      if (!hasExplicitIntent && hasBusinessProfileSignals && isCraftServiceJob(job.title, [job.roleCategory])) return false;
      if (!hasExplicitIntent && isSeniorBusiness && !isBusinessCat(job)) return false;
      // AI search filter
      if (aiSearchResults && aiSearchResults.length > 0) {
        if (!job.dbId || !aiSearchResults.includes(job.dbId)) return false;
      }
      return true;
    });

    // ── Deduplicate jobs with same title + company but different locations ──
    // Do not dedupe AI smart-search results: company searches like Gail's should
    // show every returned vacancy/location, not collapse 300+ rows into 58 titles.
    if (!(aiSearchResults && aiSearchResults.length > 0)) {
      const dedupeMap = new Map<string, Job>();
      const locationMap = new Map<string, Set<string>>();
      for (const job of jobs) {
        const key = `${job.title.toLowerCase().trim()}::${job.company.toLowerCase().trim()}`;
        if (!dedupeMap.has(key)) {
          dedupeMap.set(key, { ...job });
          locationMap.set(key, new Set([job.location]));
        } else {
          locationMap.get(key)!.add(job.location);
          // Keep the entry with the most info (description, salary)
          const existing = dedupeMap.get(key)!;
          if ((!existing.description && job.description) || (existing.salary === 'Not listed' && job.salary !== 'Not listed')) {
            const locs = locationMap.get(key)!;
            dedupeMap.set(key, { ...job, location: Array.from(locs).join(' · ') });
          }
        }
      }
      // Update locations on all deduped entries
      for (const [key, job] of dedupeMap) {
        const locs = locationMap.get(key)!;
        if (locs.size > 1) {
          const locArray = Array.from(locs).filter(l => l !== 'Not specified');
          job.location = locArray.length > 3
            ? `${locArray.slice(0, 3).join(' · ')} +${locArray.length - 3} more`
            : locArray.join(' · ') || 'Multiple locations';
        }
      }
      jobs = Array.from(dedupeMap.values());
    }

    // ── Industry-specific re-ranking ──
    // For each industry, boost jobs at well-known companies (from the Who?
    // section) and roles that match the career map; deprioritise generic
    // recruiter-noise titles that technically match the industry but aren't
    // what users are looking for. Rules live in src/lib/industry-rankings.ts.
    const industryBoost = (job: Job): number =>
      getIndustryRankBoost(job.industry, job.title, job.company);

    // Sort best matches to top for logged-in users (combine career level + role fit).
    // CRITICAL: featured/premium listings ALWAYS pin to the very top of every
    // industry view - paying employers must never be buried by an industry boost
    // on a regular job. Featured comparison runs FIRST in every comparator.
    if (user && (userLevel !== null || userRoleSlugs.length > 0)) {
      jobs = [...jobs].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        const aBoost = industryBoost(a);
        const bBoost = industryBoost(b);
        if (aBoost !== bBoost) return bBoost - aBoost;
        const aRoleMatch = isRoleMatch(a) ? 1 : 0;
        const bRoleMatch = isRoleMatch(b) ? 1 : 0;
        const aLevelMatch = (userLevel !== null && a.careerLevel && LEVEL_ORDER[a.careerLevel.toLowerCase()] === userLevel) ? 1 : 0;
        const bLevelMatch = (userLevel !== null && b.careerLevel && LEVEL_ORDER[b.careerLevel.toLowerCase()] === userLevel) ? 1 : 0;
        const aScore = aRoleMatch * 2 + aLevelMatch;
        const bScore = bRoleMatch * 2 + bLevelMatch;
        if (aScore !== bScore) return bScore - aScore;
        if (userLevel !== null) {
          const aDist = Math.abs((LEVEL_ORDER[a.careerLevel?.toLowerCase() || ''] ?? 99) - userLevel);
          const bDist = Math.abs((LEVEL_ORDER[b.careerLevel?.toLowerCase() || ''] ?? 99) - userLevel);
          if (aDist !== bDist) return aDist - bDist;
        }
        return 0;
      });
    } else {
      jobs = [...jobs].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        const aBoost = industryBoost(a);
        const bBoost = industryBoost(b);
        if (aBoost !== bBoost) return bBoost - aBoost;
        return 0;
      });
    }

    // ── Explicit sort override ──
    // When the user picks a sort from the Sort & Filter sheet, it wins over
    // the smart "best match" ordering above.
    if (sortBy !== "smart") {
      const parseDate = (d?: string | null) => (d ? new Date(d).getTime() : 0);
      const salaryNum = (j: Job): number | null => {
        if (j.salaryMax && j.salaryMax > 0) return j.salaryMax;
        if (j.salaryMin && j.salaryMin > 0) return j.salaryMin;
        const parsed = parseSalaryBand(j.salary || "");
        return parsed > 0 ? parsed : null;
      };
      jobs = [...jobs].sort((a, b) => {
        if (sortBy === "newest") {
          return parseDate(b.scrapedAt) - parseDate(a.scrapedAt);
        }
        if (sortBy === "salary-high" || sortBy === "salary-low") {
          const aSal = salaryNum(a);
          const bSal = salaryNum(b);
          // Push jobs without a listed salary to the bottom
          if (aSal === null && bSal === null) return 0;
          if (aSal === null) return 1;
          if (bSal === null) return -1;
          return sortBy === "salary-high" ? bSal - aSal : aSal - bSal;
        }
        if (sortBy === "company-az") {
          return a.company.localeCompare(b.company);
        }
        return 0;
      });
    }

    return jobs;
  }, [search, companyFilter, industry, location, jobType, salary, workMode, roleFilter, roleCategoryView, careerLevel, tempOnly, allJobs, userCareerLevel, userRoleSlugs, user, aiSearchResults, sortBy, workFamily]);

  // Match the server-side "Internships and Graduates" filter: type=Internship
  // OR title contains intern / graduate / apprentice / trainee / placement.
  const EARLY_CAREER_TITLE_RE = /\b(intern|internship|graduate|grad scheme|apprentice|apprenticeship|trainee|placement)\b/i;
  const isInternship = (j: Job) =>
    j.type === "Internship" || EARLY_CAREER_TITLE_RE.test(j.title || "");

  const tabJobs = (tab: string) => {
    if (tab === "all") return filteredJobs;
    if (tab === "featured") return filteredJobs.filter((j) => j.featured);
    if (tab === "internships") return filteredJobs.filter(isInternship);
    if (tab === "freelance") return filteredJobs.filter((j) => j.type === "Freelance");
    if (tab === "remote") return filteredJobs.filter((j) => j.workMode === "Remote");
    if (tab === "temp") return filteredJobs.filter(isTempJob);
    if (tab === "parttime") return filteredJobs.filter((j) => j.type === "Part-time");
    return filteredJobs;
  };

  const handleSmartSearch = async () => {
    const q = search.trim();
    if (!q) return;
    if (industry && industry !== "All") {
      trackInteraction({
        type: "marketplace_search",
        industry: industry.toLowerCase(),
        metadata: { source: "marketplace_search", query: q.slice(0, 100) },
      });
    }
    // Always keep the keyword search active too
    if (q.length < 3) {
      // Too short for AI - just rely on keyword filter
      setAiSearchResults(null);
      setAiSearchLabel("");
      return;
    }
    setAiSearchLoading(true);
    setAiSearchResults(null);
    setAiSearchLabel("");
    try {
      const { data, error } = await supabase.functions.invoke('ai-job-search', {
        body: { query: q },
      });
      if (error) throw error;
      if (data?.job_ids && data.job_ids.length > 0) {
        setAiSearchResults(data.job_ids);
        setAiSearchLabel(q);
        if (!hasActiveSelection) setActiveTab("all");
      } else {
        // AI matched nothing - fall back silently to keyword search
        setAiSearchResults(null);
        setAiSearchLabel("");
      }
    } catch (err) {
      console.error('Smart search error:', err);
      setAiSearchResults(null);
      setAiSearchLabel("");
    }
    setAiSearchLoading(false);
  };

  const clearFilters = () => {
    setIndustry("All");
    setLocation("All");
    setJobType("All");
    setSalary("All");
    setWorkMode("All");
    setCareerLevel("All");
    setTempOnly(false);
    setSearch("");
    setCompanyFilter(null);
    updateRoleFilter("");
    setAiSearchResults(null);
    setAiSearchLabel("");
    setSortBy("smart");
    setWorkFamily("all");
    setWorkFamilyTouched(false);
  };

  const JobCard = ({ job }: { job: Job }) => {
    const isFocused = !!focusedJobId && job.dbId === focusedJobId;
    const [expanded, setExpanded] = useState(isFocused);
    const [fullDesc, setFullDesc] = useState<string | null>(null);
    const [enriching, setEnriching] = useState(false);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const displayDesc = fullDesc || job.description || "";
    const isShort = displayDesc.length < 900;

    useEffect(() => {
      if (!isFocused) return;
      setExpanded(true);
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      // Clear so it doesn't refire on re-renders
      setFocusedJobId(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleReadMore = async () => {
      if (expanded) {
        setExpanded(false);
        return;
      }
      setExpanded(true);
      if (fullDesc || !isShort || !job.dbId) return;
      setEnriching(true);
      try {
        const { data, error } = await supabase.functions.invoke("enrich-job-description", {
          body: { jobId: job.dbId },
        });
        if (!error && data?.description && data.description.length > displayDesc.length) {
          setFullDesc(data.description);
        }
      } catch (e) {
        console.error("enrich error:", e);
      } finally {
        setEnriching(false);
      }
    };

    return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}

      className={`border bg-card p-4 md:p-6 flex flex-col gap-3 transition-colors group min-w-0 overflow-hidden ${
        job.featured
          ? "border-primary border-2 ring-1 ring-primary/30 hover:border-primary"
          : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <CompanyLogo company={job.company} size={44} />
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-700 text-foreground text-base md:text-lg leading-tight group-hover:text-primary transition-colors break-words">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground font-body">
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {job.company}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" />
                {job.salary}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleSave(job); }}
          className="shrink-0 p-1.5 text-muted-foreground hover:text-primary transition-colors"
          aria-label={isJobSaved(job.dbId) ? "Unsave job" : "Save job"}
        >
          {isJobSaved(job.dbId) ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className={`text-muted-foreground font-body text-sm leading-relaxed whitespace-pre-line ${expanded ? "" : "line-clamp-2"}`}>
        {displayDesc}
      </p>
      {job.dbId && (
        <button
          onClick={handleReadMore}
          className="self-start text-xs font-display font-700 uppercase tracking-wide text-primary hover:underline"
        >
          {enriching ? "Loading…" : expanded ? "Show less" : "Read full description"}
        </button>
      )}

      <div className="flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs font-body"
          >
            {tag}
          </Badge>
        ))}
        {job.featured && (
          <Badge className="text-xs font-body bg-primary text-primary-foreground border border-foreground inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Premium
          </Badge>
        )}
        {isTempJob(job) && (
          <Badge className="text-xs font-body bg-accent text-accent-foreground border border-foreground">
            Temp
          </Badge>
        )}
        {job.careerLevel && (
          <Badge variant="outline" className="text-xs font-body capitalize">
            {job.careerLevel}
          </Badge>
        )}
        {(() => {
          const SLUG_TO_CATS: Record<string, string[]> = {
            operations: ['operations', 'ops '], strategy: ['strategy', 'strategic'],
            'project-management': ['project', 'programme', 'program'],
            marketing: ['marketing', 'brand'], finance: ['finance', 'financial'],
            sales: ['sales', 'account manager'], product: ['product manager'],
            creative: ['creative', 'designer'], commercial: ['commercial', 'trading'],
          };
          const jobText = `${job.title} ${job.roleCategory || ''} ${job.tags.join(' ')}`.toLowerCase();
          const roleMatch = userRoleSlugs.length > 0 && userRoleSlugs.some(slug => {
            const kws = SLUG_TO_CATS[slug];
            if (!kws) return jobText.includes(slug.replace(/-/g, ' '));
            return kws.some(kw => jobText.includes(kw));
          });
          const levelMatch = userCareerLevel && job.careerLevel && job.careerLevel.toLowerCase() === userCareerLevel.toLowerCase();
          if (roleMatch && levelMatch) return <Badge className="text-xs font-body bg-green-600 text-white">Best match</Badge>;
          if (roleMatch) return <Badge className="text-xs font-body bg-green-600/80 text-white">Role fit</Badge>;
          if (levelMatch) return <Badge className="text-xs font-body bg-green-600/60 text-white">Level match</Badge>;
          return null;
        })()}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
        {/* Primary: Apply now */}
        <Button size="sm" className="font-body text-xs" asChild>
          <a
            href={job.url || getCompanyUrl(job.company)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackInteraction({
                type: "job_click",
                companySlug: getCompanySlug(job.company) ?? undefined,
                industry: job.industry ?? undefined,
                jobId: job.dbId,
                metadata: { title: job.title, company: job.company, source: "marketplace" },
              });
            }}
          >
            Apply now
          </a>
        </Button>

        {/* Secondary but noticeable: Howdy helper */}
        <Button
          size="default"
          className="font-body text-sm gap-2 bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground"
          onClick={() => {
            setHelperJob({
              title: job.title,
              company: job.company,
              industry: job.industry,
              location: job.location,
              salary: job.salary,
              description: job.description,
              tags: job.tags,
              type: job.type,
            });
            setActiveTab("cv-builder");
            setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
          }}
        >
          <img src={howdyMascot} alt="" className="h-9 w-9 object-contain -ml-2" />
          Howdy can help
        </Button>

        {(() => {
          const profilePath = getCompanyProfilePath(job.company);
          if (!profilePath) return null;
          return (
            <Button
              size="sm"
              variant="outline"
              className="font-body text-xs gap-1 border-foreground/30 hover:border-primary hover:text-primary"
              asChild
            >
              <Link to={profilePath}>
                <Building2 className="w-3.5 h-3.5" />
                {job.company} profile
              </Link>
            </Button>
          );
        })()}
        {(() => {
          const src = detectJobSource(job.url);
          return src ? <SourceAttribution source={src} variant="badge" className="ml-auto" /> : null;
        })()}
      </div>
    </motion.div>
    );
  };

  const JobsLoadingState = () => (
    <div className="col-span-full border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <p className="font-display font-700 text-foreground text-base">Loading live jobs…</p>
          <p className="text-sm font-body text-muted-foreground">We’re pulling the latest roles for your selection.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="border border-border bg-background p-5 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EmployerSpotlight = ({ emp }: { emp: FeaturedEmployer }) => {
    const brand = getCompanyBrand(emp.slug);
    // Only show "View company profile" when a real profile page exists -
    // otherwise the button used to dead-end on a 404 placeholder route.
    const profilePath = getCompanyProfilePath(emp.company);
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative border-2 border-foreground bg-card flex flex-col min-w-0 overflow-hidden shadow-[6px_6px_0_0_hsl(var(--foreground))]"
      >
        {/* Brand band */}
        <div
          className="relative px-4 md:px-5 pt-4 pb-12"
          style={{ backgroundColor: brand.bg, color: brand.fg }}
        >
          {/* subtle diagonal pattern to differentiate from job cards */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 10px)",
            }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div
                className="inline-flex items-center gap-1 text-[10px] font-body uppercase tracking-[0.18em] px-2 py-0.5 border"
                style={{ borderColor: brand.fg, color: brand.fg, opacity: 0.85 }}
              >
                <Sparkles className="w-3 h-3" /> Employer spotlight
              </div>
              <h3
                className="font-display font-700 text-xl md:text-2xl leading-tight mt-2 break-words"
                style={{ color: brand.fg }}
              >
                {emp.company}
              </h3>
              <p
                className="font-body text-sm leading-relaxed mt-1.5 max-w-prose"
                style={{ color: brand.fg, opacity: 0.92 }}
              >
                {emp.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Logo overlapping the band */}
        <div className="relative px-4 md:px-5">
          <div className="-mt-9 mb-3 inline-flex bg-card border-2 border-foreground p-1.5 shadow-sm">
            <CompanyLogo company={emp.company} size={56} />
          </div>
        </div>

        <div className="px-4 md:px-5 pb-4 md:pb-5 flex flex-col gap-3 flex-1">
          {emp.whyWorkHere?.length ? (
            <div>
              <p className="font-display font-700 text-xs uppercase tracking-wide text-foreground mb-2">
                Why work here
              </p>
              <ul className="space-y-1.5">
                {emp.whyWorkHere.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-foreground/80 font-body text-xs leading-relaxed"
                  >
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: brand.bg }}
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
            {profilePath ? (
              <Button
                size="sm"
                className="font-body text-xs border-2 border-foreground hover:opacity-90"
                style={{ backgroundColor: brand.bg, color: brand.fg }}
                asChild
              >
                <Link to={profilePath}>
                  <Building2 className="w-3.5 h-3.5 mr-1" /> View company profile
                </Link>
              </Button>
            ) : null}
            {(() => {
              const href = emp.careersUrl || "";
              const isExternal = /^https?:\/\//i.test(href);
              if (!isExternal) return null;
              return (
                <Button size="sm" variant="outline" className="font-body text-xs border-2 border-foreground" asChild>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <Briefcase className="w-3.5 h-3.5 mr-1" />
                    See open roles
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              );
            })()}
          </div>
        </div>
      </motion.div>
    );
  };

  const JobList = ({ jobs }: { jobs: Job[] }) => {
    // If the user clicked a company logo (or otherwise filtered by a single
    // company), build a spotlight for THAT company - overriding both the
    // DB-pinned employer and the per-industry FEATURED_EMPLOYERS map.
    let featuredEmployer: FeaturedEmployer | undefined;
    if (companyFilter) {
      const match = jobs.find(
        (j) => matchesCompanyFilter(j.company, companyFilter),
      );
      const isNhsRollup = companyFilter === "nhs";
      const displayName = isNhsRollup ? "NHS" : (match?.company?.trim() || companyFilter);
      const slug = getCompanySlug(displayName) ?? companyFilter.replace(/[^a-z0-9]+/g, "-");
      const careersUrl = isNhsRollup ? "https://www.jobs.nhs.uk/" : (getCompanyExternalUrl(displayName) || "");
      const liveCount = jobs.filter(
        (j) => matchesCompanyFilter(j.company, companyFilter),
      ).length;
      featuredEmployer = {
        company: displayName,
        slug,
        tagline: liveCount > 0
          ? `${liveCount} live role${liveCount === 1 ? "" : "s"} at ${displayName} right now.`
          : `Explore careers at ${displayName}.`,
        whyWorkHere: [],
        careersUrl,
      };
    } else {
      featuredEmployer = dbPinnedEmployer ?? (industry !== "All" ? FEATURED_EMPLOYERS[industry] : undefined);
    }
    return (
    <div className="grid gap-4 md:grid-cols-2 min-w-0">
      {focusedJob && (
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-display text-[10px] font-700 uppercase tracking-[0.18em] text-primary">
              From your jobs feed
            </span>
            <button
              onClick={() => { setFocusedJob(null); setFocusedJobId(null); }}
              className="font-body text-xs text-muted-foreground hover:text-foreground underline"
            >
              Close
            </button>
          </div>
          <JobCard key={`focused-${focusedJob.dbId}`} job={focusedJob} />
        </div>
      )}
      {!hasActiveSelection ? (
        focusedJob ? null : (
          <DynamicJobsEmptyState
            totalJobs={tabCounts.all ?? 0}
            onPickIndustry={(ind) => setIndustry(ind)}
          />
        )
      ) : isLoadingJobs && !hasLoadedSelection ? (
        <JobsLoadingState />
      ) : jobs.length > 0 ? (
        <>
          {jobs.slice(0, 1).map((job) => <JobCard key={job.id} job={job} />)}
          {featuredEmployer && <EmployerSpotlight emp={featuredEmployer} />}
          {jobs.slice(1).map((job) => <JobCard key={job.id} job={job} />)}
        </>
      ) : (
        <div className="col-span-full text-center py-16 text-muted-foreground font-body">
          No jobs match your filters.{" "}
          <button onClick={clearFilters} className="text-primary underline">
            Clear all
          </button>
        </div>
      )}
    </div>

    );
  };


  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {!user && <SignUpPopup open={signupOpen} onClose={closeSignup} />}
      {!embedded && (
        <SEO
          title="Job Marketplace - Browse UK Jobs"
          description="Browse thousands of live UK jobs across 30+ industries. Filter by industry, role type, location and more."
          path="/marketplace"
          jsonLd={jobPostingsJsonLd(filteredJobs, 25)}
        />
      )}
      <div className={`container mx-auto px-4 sm:px-6 md:px-12 ${embedded ? 'pt-2 pb-12 md:py-8' : 'pt-4 pb-12 md:py-8'} max-w-full`}>
        {/* spacer */}

        {/* Hero */}
        {!embedded && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 md:mb-8"
          >
            {/* Title */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-900 leading-[0.9] tracking-tight text-foreground mb-4 md:mb-6 whitespace-nowrap">
              Howdoyoudo<span className="text-primary">?</span> Jobs
            </h1>
          </motion.div>
        )}

        {/* Search + filter toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`mb-8 ${embedded ? 'hidden md:block' : ''}`}
        >
          <div className="relative p-1 sm:p-1.5 bg-card border-2 border-primary rounded-2xl shadow-[6px_6px_0_0_hsl(var(--primary))] hover:shadow-[8px_8px_0_0_hsl(var(--primary))] transition-shadow">
            <div className="flex gap-2 items-stretch">
              <div className="relative flex-1">
                <div className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-primary/10 border-2 border-foreground overflow-hidden">
                  <img src={howdyMascot} alt="Howdy" className="h-full w-full object-contain" />
                </div>
                <Input
                  type="search"
                  name="job-search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  placeholder="Ask Howdy: search jobs, skills or describe what you want…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (aiSearchLabel) {
                      setAiSearchResults(null);
                      setAiSearchLabel("");
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                  className="pl-16 sm:pl-[68px] h-14 sm:h-16 text-base sm:text-lg font-body bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
                />
              </div>
              <Button
                onClick={handleSmartSearch}
                disabled={aiSearchLoading || !search.trim()}
                className="font-body gap-2 shrink-0 h-14 sm:h-16 px-4 sm:px-7 text-base sm:text-lg rounded-xl"
              >
                {aiSearchLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                <span className="hidden sm:inline font-semibold">Search</span>
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-body px-1">
            <Sparkles className="w-3 h-3 inline -mt-0.5 mr-1 text-primary" />
            Try natural language - e.g. <span className="italic">"remote junior data role in fashion"</span> or <span className="italic">"weekend bar work in Manchester"</span>
          </p>

          {/* AI smart-match indicator */}
          {aiSearchLabel && (
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border border-primary/20 font-body text-xs gap-1">
                <Sparkles className="w-3 h-3" />
                Smart match: "{aiSearchLabel}" - {aiSearchResults?.length ?? 0} jobs
              </Badge>
              <button
                onClick={() => {
                  setAiSearchResults(null);
                  setAiSearchLabel("");
                }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-body flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}

          {/* Filter bar */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
            <FilterDropdown
              label="Industry"
              value={industry}
              options={industries}
              onChange={handleIndustryChange}
              scrollable
            />
            <FilterDropdown
              label="Role"
              value={roleFilter
                ? (ROLE_CHIPS.find(r => r.slug === toRoleSlug(roleFilter))?.label ?? roleFilter)
                : "All"}
              options={["All", ...ROLE_CHIPS
                .filter(r => !allowedRoleSlugsForIndustry || allowedRoleSlugsForIndustry.has(r.slug))
                .sort((a, b) => a.label.localeCompare(b.label))
                .map(r => r.label)]}
              onChange={(v) => updateRoleFilter(v === "All" ? "" : (ROLE_CHIPS.find(r => r.label === v)?.slug ?? ""))}
              scrollable
            />
            <FilterDropdown label="Type of role" value={jobType} options={jobTypes} onChange={setJobType} />
            <FilterDropdown label="Location" value={location} options={locations} onChange={setLocation} />
            <FilterDropdown label="Onsite / remote" value={workMode} options={workModes} onChange={setWorkMode} />

            {/* Sort & more filters pill */}
            <button
              type="button"
              onClick={() => setShowSortFilter(true)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 font-display font-700 text-xs uppercase tracking-wide transition-colors whitespace-nowrap ${
                sortBy !== "smart"
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/40 bg-background text-foreground hover:border-foreground hover:bg-primary"
              }`}
            >
              <ArrowUpDown size={11} strokeWidth={3} />
              Filter
              {(activeFilterCount > 0 || sortBy !== "smart") && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-display font-700 bg-primary text-foreground rounded-full">
                  {activeFilterCount + (sortBy !== "smart" ? 1 : 0)}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-full border-2 border-foreground/30 bg-background text-foreground/50 font-display font-700 text-xs uppercase tracking-wide hover:border-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                <X size={10} strokeWidth={3} /> Clear
              </button>
            )}
          </div>
        </motion.div>


        {/* Jobs list anchor */}

        {/* Tabs + jobs feed */}
        <motion.div
          id="jobs-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="scroll-mt-24"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-4 flex items-center gap-2 text-base md:text-lg font-body flex-wrap">
              {industry !== "All" && (
                <span className="font-display font-700 text-foreground">{industry}:</span>
              )}
              {roleFilter && (
                <span className="font-display font-700 text-foreground">
                  {ROLE_CHIPS.find((r) => r.slug === toRoleSlug(roleFilter))?.label || roleFilter}:
                </span>
              )}
               <span className="text-muted-foreground font-600">
                {isLoadingJobs
                  ? "loading…"
                  : `${filteredJobs.length.toLocaleString()} ${filteredJobs.length === 1 ? "job" : "jobs"} found`}
               </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-1 px-3 py-1 border-2 border-foreground bg-background rounded-full font-display font-700 text-[10px] uppercase tracking-wider text-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow-[2px_2px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  aria-label="Clear all filters"
                >
                  <X className="w-3 h-3" strokeWidth={3} />
                  Clear filters
                </button>
              )}
            </div>
            <div ref={tabsRef}>

            <TabsList className="hidden">
              <TabsTrigger value="all" className="font-body text-sm">All Jobs ({tabCounts.all ?? '…'})</TabsTrigger>
              <TabsTrigger value="featured" className="font-body text-sm">Premium ({tabCounts.featured ?? '…'})</TabsTrigger>
              <TabsTrigger value="internships" className="font-body text-sm border border-green-600 text-green-700 dark:text-green-400 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:border-green-700">🎓 Internships and Graduates ({activeTab === "internships" ? tabJobs("internships").length : (tabCounts.internships ?? '…')})</TabsTrigger>
              <TabsTrigger value="parttime" className="font-body text-sm">Part-time ({tabCounts.parttime ?? '…'})</TabsTrigger>
              <TabsTrigger value="temp" className="font-body text-sm">Temp ({tabCounts.temp ?? '…'})</TabsTrigger>
              <TabsTrigger value="freelance" className="font-body text-sm">Freelance ({tabCounts.freelance ?? '…'})</TabsTrigger>
              <TabsTrigger value="remote" className="font-body text-sm">Remote ({tabCounts.remote ?? '…'})</TabsTrigger>
              <TabsTrigger value="cv-builder" className="font-body text-sm">Profile Builder</TabsTrigger>
            </TabsList>
            </div>
            {["all", "featured", "internships", "parttime", "temp", "freelance", "remote"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {tab === "internships" && (
                  <div className="grid gap-2 mb-4 md:grid-cols-2">
                    <a
                      href="https://www.brightnetwork.co.uk/internships/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border border-green-600 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors text-sm font-body"
                    >
                      <span className="text-green-700 dark:text-green-400 font-display font-700">🎓 Browse internships and graduate schemes on Bright Network</span>
                      <ExternalLink className="w-3.5 h-3.5 text-green-600 ml-auto shrink-0" />
                    </a>
                    <a
                      href="https://the-trackr.com/trackers/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border border-green-600 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors text-sm font-body"
                    >
                      <span className="text-green-700 dark:text-green-400 font-display font-700">📊 Browse internships and graduate schemes on The Trackr</span>
                      <ExternalLink className="w-3.5 h-3.5 text-green-600 ml-auto shrink-0" />
                    </a>
                  </div>
                )}
                <CompanyLogoStrip
                  jobs={tabJobs(tab)}
                  activeCompany={companyFilter}
                  onCompanyClick={(c) => setCompanyFilter(c ? c.toLowerCase() : null)}
                />
                <JobList jobs={tabJobs(tab)} />
                <SourceAttributionFooter
                  jobs={tabJobs(tab)}
                  className="mt-6 pt-4 border-t border-foreground/10"
                />
              </TabsContent>
            ))}
            <TabsContent value="cv-builder">
              {helperJob ? (
                <JobApplicationHelper
                  job={helperJob}
                  onBack={() => setHelperJob(null)}
                />
              ) : (
                <CVBuilder />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>


      <SortFilterSheet
        open={showSortFilter}
        onClose={() => setShowSortFilter(false)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterGroups={[
          {
            label: "Show",
            value: workFamily === "all" ? "All" : workFamily === "craft" ? "Craft / Frontline" : "Business / Office",
            setValue: (v: string) => {
              setWorkFamilyTouched(true);
              if (v === "Craft / Frontline") setWorkFamily("craft");
              else if (v === "Business / Office") setWorkFamily("business");
              else setWorkFamily("all");
            },
            options: ["All", "Craft / Frontline", "Business / Office"],
          },
          {
            label: "Category",
            value:
              activeTab === "featured" ? "Premium"
              : activeTab === "internships" ? "Grad / Intern"
              : activeTab === "parttime" ? "Part-time"
              : activeTab === "temp" ? "Temp"
              : activeTab === "freelance" ? "Freelance"
              : activeTab === "remote" ? "Remote"
              : activeTab === "cv-builder" ? "Profile Builder"
              : "",
            setValue: (v: string) => {
              const map: Record<string, string> = {
                "Premium": "featured",
                "Grad / Intern": "internships",
                "Part-time": "parttime",
                "Temp": "temp",
                "Freelance": "freelance",
                "Remote": "remote",
                "Profile Builder": "cv-builder",
              };
              // Defaults to "all" when no category selected.
              setActiveTab(map[v] ?? "all");
            },
            options: ["Premium", "Grad / Intern", "Part-time", "Temp", "Freelance", "Remote", "Profile Builder"],
          },
          { label: "Job type", value: jobType, setValue: setJobType, options: jobTypes },
          { label: "Salary", value: salary, setValue: setSalary, options: salaryRanges },
          { label: "Work mode", value: workMode, setValue: setWorkMode, options: workModes },
          { label: "Career level", value: careerLevel, setValue: setCareerLevel, options: careerLevels },
          { label: "Location", value: location, setValue: setLocation, options: locations },
        ]}
        activeFilterCount={activeFilterCount}
        onClearAll={clearFilters}
        resultCount={filteredJobs.length}
        preserveBottomNav={embedded}
      />
    </div>
  );
};

// ── Small helper ─────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="font-body text-sm bg-background">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className="font-body text-sm">
            {opt === "All" ? `${label}: All` : opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default Marketplace;
