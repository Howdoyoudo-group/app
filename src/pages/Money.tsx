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
import { Landmark, TrendingUp, Shield, Wallet, Scale, Briefcase } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const moneyStages: CareerStage[] = [
  { title: "Banking", icon: Landmark, roles: [
    { name: "Retail Banker", description: "Front-line role helping personal customers with current accounts, mortgages and lending.", salary: "£25k–£38k" },
    { name: "Investment Banker", description: "Advises corporates on M&A, IPOs, debt and equity issuance - long hours, big numbers.", salary: "£60k–£150k+" },
    { name: "Relationship Manager", description: "Owns the bank's relationship with SME or corporate clients - credit, treasury, payments.", salary: "£40k–£75k" },
    { name: "Credit Analyst", description: "Assesses creditworthiness of borrowers and structures lending decisions.", salary: "£35k–£65k" },
  ]},
  { title: "Investment & Asset Management", icon: TrendingUp, roles: [
    { name: "Portfolio Manager", description: "Runs investment funds - stock and bond selection, asset allocation, client returns.", salary: "£70k–£200k+" },
    { name: "Equity Research Analyst", description: "Analyses listed companies and writes buy/sell/hold recommendations for investors.", salary: "£50k–£120k" },
    { name: "Quantitative Analyst", description: "Builds mathematical models for trading, risk and portfolio construction at hedge funds and banks.", salary: "£60k–£180k+" },
    { name: "Wealth Manager", description: "Manages the financial lives of high-net-worth individuals - investing, tax, succession.", salary: "£45k–£90k" },
    { name: "ESG Analyst", description: "Assesses the sustainability and governance of companies for impact-aligned investing.", salary: "£40k–£75k" },
  ]},
  { title: "Insurance & Risk", icon: Shield, roles: [
    { name: "Underwriter", description: "Decides what risks an insurer will take on - Lloyd's of London, life, motor, commercial.", salary: "£35k–£75k" },
    { name: "Actuary", description: "Uses statistics and modelling to price risk and reserve capital - long study path, very well paid.", salary: "£45k–£120k+" },
    { name: "Insurance Broker", description: "Acts for clients to find the best insurance cover - commercial, marine, specialty.", salary: "£30k–£70k" },
    { name: "Claims Manager", description: "Handles complex claims, fraud and customer outcomes for an insurer.", salary: "£35k–£60k" },
  ]},
  { title: "FinTech & Payments", icon: Wallet, roles: [
    { name: "Product Manager (FinTech)", description: "Builds digital banking, lending or payments products at challenger banks and fintechs.", salary: "£60k–£120k" },
    { name: "Payments Engineer", description: "Builds the rails - card schemes, Open Banking, faster payments, crypto on-ramps.", salary: "£60k–£130k" },
    { name: "Crypto / Web3 Analyst", description: "Researches and trades digital assets, stablecoins and on-chain protocols.", salary: "£45k–£120k" },
    { name: "Compliance Officer (FinTech)", description: "Ensures fast-growing fintechs meet FCA, AML and KYC obligations.", salary: "£45k–£90k" },
  ]},
  { title: "Accountancy, Audit & Tax", icon: Scale, roles: [
    { name: "Chartered Accountant (ACA/ACCA)", description: "Trains at a Big Four or mid-tier firm and qualifies into audit, tax or advisory.", salary: "£28k–£70k+" },
    { name: "Auditor", description: "Reviews companies' financial statements to confirm they're true and fair.", salary: "£32k–£70k" },
    { name: "Tax Adviser", description: "Advises companies and individuals on personal tax, corporate tax, VAT and international structures.", salary: "£35k–£90k+" },
    { name: "Forensic Accountant", description: "Investigates fraud, disputes and financial crime for clients and the courts.", salary: "£40k–£90k" },
  ]},
  { title: "Finance Leadership & Markets", icon: Briefcase, roles: [
    { name: "CFO / Finance Director", description: "Leads the finance function of a business - strategy, capital, investor relations, P&L.", salary: "£90k–£250k+" },
    { name: "Trader", description: "Trades equities, FX, rates, commodities or credit on behalf of a bank, hedge fund or prop firm.", salary: "£60k–£300k+" },
    { name: "Treasurer", description: "Manages a company's cash, debt, FX exposure and bank relationships.", salary: "£50k–£120k" },
    { name: "Risk Manager", description: "Identifies and controls market, credit and operational risk across a financial firm.", salary: "£50k–£110k" },
    { name: "Financial Planner / IFA", description: "Independent adviser helping individuals plan retirement, investments and protection.", salary: "£40k–£90k+" },
  ]},
];

const newsfeed = [
  { title: "Financial Times", url: "https://www.ft.com" },
  { title: "Reuters Finance", url: "https://www.reuters.com/business/finance/" },
  { title: "Bloomberg UK", url: "https://www.bloomberg.com/europe" },
  { title: "City AM", url: "https://www.cityam.com" },
];

const moneyCompanies = [
  { name: "HSBC", url: "https://www.hsbc.com/careers", founded: "1865", hq: "London", overview: "One of the world's largest banks - universal banking across retail, commercial and investment.", valueChainStage: "Banking" },
  { name: "Barclays", url: "https://home.barclays/careers/", founded: "1690", hq: "London", overview: "Global bank with deep UK roots - retail, corporate, investment and Barclaycard.", valueChainStage: "Banking" },
  { name: "Lloyds Banking Group", url: "https://www.lloydsbankinggroup.com/careers.html", founded: "1765", hq: "London", overview: "The UK's largest retail bank - Lloyds, Halifax, Bank of Scotland and Scottish Widows.", valueChainStage: "Banking" },
  { name: "NatWest Group", url: "https://jobs.natwestgroup.com", founded: "1727", hq: "Edinburgh", overview: "Major UK retail and commercial bank - NatWest, RBS, Coutts and Ulster Bank.", valueChainStage: "Banking" },
  { name: "Goldman Sachs", url: "https://www.goldmansachs.com/careers", founded: "1869", hq: "London (UK HQ)", overview: "Global investment bank - M&A, markets, asset management and Marcus consumer banking.", valueChainStage: "Investment & Asset Management" },
  { name: "JP Morgan", url: "https://careers.jpmorgan.com", founded: "1799", hq: "London (UK HQ)", overview: "The world's largest bank by market cap - investment banking, markets, asset & wealth management.", valueChainStage: "Investment & Asset Management" },
  { name: "BlackRock", url: "https://careers.blackrock.com", founded: "1988", hq: "London (UK HQ)", overview: "The world's largest asset manager - $10 trillion AUM, ETFs (iShares), and Aladdin tech platform.", valueChainStage: "Investment & Asset Management" },
  { name: "Schroders", url: "https://www.schroders.com/en/careers/", founded: "1804", hq: "London", overview: "Britain's largest standalone asset manager - public markets, private assets and wealth.", valueChainStage: "Investment & Asset Management" },
  { name: "M&G", url: "https://www.mandg.com/careers", founded: "1931", hq: "London", overview: "UK savings and investments business - asset management, retirement and wealth.", valueChainStage: "Investment & Asset Management" },
  { name: "Lloyd's of London", url: "https://www.lloyds.com/about-lloyds/careers", founded: "1688", hq: "London", overview: "The world's leading specialty insurance and reinsurance market - 50+ syndicates underwrite under one roof.", valueChainStage: "Insurance & Risk" },
  { name: "Aviva", url: "https://careers.aviva.com", founded: "2000", hq: "London", overview: "The UK's largest insurer - life, general insurance, pensions and investments.", valueChainStage: "Insurance & Risk" },
  { name: "Legal & General", url: "https://group.legalandgeneral.com/en/careers", founded: "1836", hq: "London", overview: "Major UK insurer and asset manager - pensions, retirement, housing and infrastructure investing.", valueChainStage: "Insurance & Risk" },
  { name: "Revolut", url: "https://www.revolut.com/careers/", founded: "2015", hq: "London", overview: "Europe's most valuable fintech - banking, FX, crypto, savings, business accounts and stocks.", valueChainStage: "FinTech & Payments" },
  { name: "Monzo", url: "https://monzo.com/careers/", founded: "2015", hq: "London", overview: "Britain's leading challenger bank - 9m+ customers, current accounts, lending and savings.", valueChainStage: "FinTech & Payments" },
  { name: "Starling Bank", url: "https://www.starlingbank.com/careers/", founded: "2014", hq: "London", overview: "Profitable UK challenger bank - personal, business and Banking-as-a-Service.", valueChainStage: "FinTech & Payments" },
  { name: "Wise", url: "https://wise.jobs", founded: "2011", hq: "London", overview: "Listed cross-border money transfer and multi-currency accounts - moves billions in low-cost FX.", valueChainStage: "FinTech & Payments" },
  { name: "PwC UK", url: "https://www.pwc.co.uk/careers.html", founded: "1849", hq: "London", overview: "One of the Big Four - audit, tax, deals and consulting across UK financial services and beyond.", valueChainStage: "Accountancy, Audit & Tax" },
  { name: "Deloitte UK", url: "https://www2.deloitte.com/uk/en/pages/careers/", founded: "1845", hq: "London", overview: "Big Four firm - audit, tax, consulting, financial advisory and risk advisory.", valueChainStage: "Accountancy, Audit & Tax" },
  { name: "EY UK", url: "https://www.ey.com/en_uk/careers", founded: "1989", hq: "London", overview: "Big Four firm - audit, tax, strategy & transactions and consulting.", valueChainStage: "Accountancy, Audit & Tax" },
  { name: "KPMG UK", url: "https://www.kpmgcareers.co.uk", founded: "1987", hq: "London", overview: "Big Four firm - audit, tax, consulting and deal advisory across UK financial services.", valueChainStage: "Accountancy, Audit & Tax" },
  { name: "Bank of England", url: "https://www.bankofengland.co.uk/careers", founded: "1694", hq: "London", overview: "The UK's central bank - monetary policy, financial stability and banknote issuance.", valueChainStage: "Finance Leadership & Markets" },
  { name: "Hargreaves Lansdown", url: "https://www.hl.co.uk/about-us/careers", founded: "1981", hq: "Bristol", overview: "The UK's largest investment platform - SIPPs, ISAs and stockbroking for retail investors.", valueChainStage: "Finance Leadership & Markets" },
];

const Money = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business of money, banking and investing.</p>
        <PodcastPlayer industry="money" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Money Stuff (Bloomberg)", description: "Matt Levine's witty deep-dives on Wall Street, finance regulation and the absurd corners of capital.", url: "https://www.bloomberg.com/podcasts/series/money-stuff" },
            { title: "The Rest Is Money", description: "Robert Peston and Steph McGovern unpack the UK economy, your money and the headlines.", url: "https://podfollow.com/the-rest-is-money" },
            { title: "FT News Briefing", description: "The Financial Times' daily roundup of the biggest business and finance stories.", url: "https://www.ft.com/news-briefing" },
            { title: "Fintech Insider by 11:FS", description: "The leading podcast on fintech, banking and the future of financial services.", url: "https://11fs.com/insights/fintech-insider-podcast" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="money" />
        <LiveArticles industry="money" fallbackArticles={[
          { title: "Inside the City: How London's Finance Sector Is Reinventing Itself", source: "Financial Times", url: "https://www.ft.com" },
          { title: "Challenger Banks Take On the High Street - and Win", source: "City AM", url: "https://www.cityam.com" },
          { title: "Bank of England Holds Rates Amid Inflation Fight", source: "Reuters", url: "https://www.reuters.com/business/finance/" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="money" />
          <div className="mt-4"><BreakingNewsFeed industry="money" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="money" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["money"] || []} /><div className="mt-12"><YouTubeChannels industry="money" /><TikTokCreators industry="money" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={moneyCompanies} />
        <div className="mt-12"><DayInTheLife industry="money" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From the high street to Lloyd's, hedge funds to fintech - every career in the money industry." stages={moneyStages} industry="money" />
          <div className="mt-12"><IndustryRolesLink industry="Money" /></div>
        <ExploreFurther links={[
          { title: "FCA Careers", description: "The Financial Conduct Authority - the UK's financial regulator hires across policy, supervision and enforcement.", url: "https://www.fca.org.uk/about/careers" },
          { title: "ICAEW - Become a Chartered Accountant", description: "The Institute of Chartered Accountants in England and Wales - qualifications, ACA and careers.", url: "https://www.icaew.com/learning-and-development/aca" },
          { title: "CFA Institute", description: "The global Chartered Financial Analyst programme - the gold standard in investment management.", url: "https://www.cfainstitute.org" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Money" searchQuery="finance fintech banking conference UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Money" slug="money" />
          <CoursesSection industry="money" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Jobs you can count on<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across UK banking, investing, insurance and fintech.</p>
          <Link to="/marketplace?industry=Money#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={moneyStages} industry="Money" companies={moneyCompanies} />
        <IndustryCVBuilder industry="Money" stages={moneyStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Money"
      description="Banks, brokers, fintechs, insurers and the people who create, store, move, grow, measure and protect financial value."
      profile="The money industry comprises any organisation whose primary purpose is to create, store, move, grow, measure, or protect financial value. From the Bank of England, Lloyd's of London and the Big Four to challenger banks like Monzo and Revolut, hedge funds, the City's investment banks and the UK's army of independent advisers - financial services contribute over £200 billion a year to the UK economy and employ more than 2 million people. Careers span banking, asset management, insurance, accountancy, fintech and crypto."
      tabs={tabs}
    />
  );
};

export default Money;
