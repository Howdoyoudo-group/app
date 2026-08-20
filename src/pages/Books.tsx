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
import { PenLine, SpellCheck2, Palette, Scale, Megaphone, Truck } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const booksStages: CareerStage[] = [
  { title: "Creation & Writing", icon: PenLine, roles: [
    { name: "Author", description: "Writes the book - fiction or non-fiction, on commission or on spec.", salary: "£25k–£60k (advance/royalty-based, highly variable)" },
    { name: "Ghostwriter", description: "Writes books credited to someone else - memoirs, business books, celebrity titles.", salary: "£25k–£70k (project-based)" },
    { name: "Illustrator", description: "Creates artwork for picture books, covers, and graphic novels.", salary: "£25k–£50k" },
    { name: "Literary Agent (Junior)", description: "Scouts new writers and manuscripts, builds a client list under a senior agent.", salary: "£25k–£32k + commission" },
    { name: "Co-Writer", description: "Collaborates with an author to shape and complete a manuscript.", salary: "£25k–£55k (project-based)" },
  ]},
  { title: "Editorial", icon: SpellCheck2, roles: [
    { name: "Editorial Assistant", description: "Supports editors with manuscripts, correspondence, and the acquisition process.", salary: "£25k–£28k" },
    { name: "Commissioning Editor", description: "Finds and signs new books, shaping a publisher's list.", salary: "£30k–£55k" },
    { name: "Development Editor", description: "Works closely with authors to shape structure, plot, and content before copy-edit.", salary: "£28k–£45k" },
    { name: "Copy Editor", description: "Checks grammar, consistency, and style before a manuscript goes to production.", salary: "£25k–£38k" },
    { name: "Proofreader", description: "Final check for errors before a book goes to print or publication.", salary: "£25k–£35k" },
  ]},
  { title: "Design & Production", icon: Palette, roles: [
    { name: "Book Designer", description: "Designs covers and interior layouts across a publisher's list.", salary: "£26k–£45k" },
    { name: "Typesetter", description: "Lays out text and images ready for print or digital formats.", salary: "£25k–£36k" },
    { name: "Production Editor", description: "Manages the schedule and budget from final manuscript to printed book.", salary: "£28k–£42k" },
    { name: "Cover Illustrator", description: "Creates the artwork that sells a book at first glance - usually freelance.", salary: "£25k–£50k (project-based)" },
    { name: "Print Buyer", description: "Sources and negotiates print production across paper, binding, and printers.", salary: "£28k–£45k" },
  ]},
  { title: "Rights & Business", icon: Scale, roles: [
    { name: "Rights Executive", description: "Sells UK books into overseas markets and other formats (film, TV, audio).", salary: "£26k–£40k" },
    { name: "Foreign Rights Manager", description: "Leads international rights deals and relationships with overseas publishers.", salary: "£35k–£60k" },
    { name: "Royalties Administrator", description: "Tracks sales and calculates royalty payments owed to authors.", salary: "£25k–£36k" },
    { name: "Literary Scout", description: "Identifies promising manuscripts and rights opportunities for international clients.", salary: "£28k–£45k" },
    { name: "Contracts Manager", description: "Drafts and manages publishing agreements between authors, agents, and the publisher.", salary: "£30k–£50k" },
  ]},
  { title: "Marketing & Publicity", icon: Megaphone, roles: [
    { name: "Marketing Assistant", description: "Supports campaigns - social content, proofs, events, and author promotion.", salary: "£25k–£28k" },
    { name: "Marketing Manager", description: "Plans and runs campaigns to launch and sell books.", salary: "£30k–£50k" },
    { name: "Publicist", description: "Secures press coverage, reviews, and media appearances for authors and books.", salary: "£26k–£45k" },
    { name: "Social Media Manager", description: "Runs a publisher or author's social presence, including BookTok and Bookstagram.", salary: "£25k–£40k" },
    { name: "Content Creator", description: "Produces video, photo, and written content for book marketing campaigns.", salary: "£25k–£38k" },
  ]},
  { title: "Distribution & Retail", icon: Truck, roles: [
    { name: "Bookseller", description: "Hand-sells books and curates displays in a physical bookshop.", salary: "£25k–£28k" },
    { name: "Distribution Manager", description: "Oversees getting physical stock from printer to warehouse to shop.", salary: "£30k–£50k" },
    { name: "Digital Publishing Manager", description: "Manages ebook and audiobook production, formatting, and platform delivery.", salary: "£28k–£48k" },
    { name: "Audiobook Producer", description: "Casts narrators and produces audiobook recordings from manuscript to final file.", salary: "£28k–£45k" },
    { name: "Wholesale Account Manager", description: "Manages supply relationships between publishers, wholesalers, and retailers.", salary: "£28k–£45k" },
  ]},
];

const newsfeed = [
  { title: "The Bookseller", url: "https://www.thebookseller.com" },
  { title: "Publishers Weekly", url: "https://www.publishersweekly.com" },
  { title: "BookBrunch", url: "https://www.bookbrunch.co.uk" },
];

const booksCompanies = [
  { name: "Penguin Random House UK", url: "https://jobsearch.createyourowncareer.com/PRH_UK/content/home/?locale=en_GB", founded: "2013", hq: "London", overview: "The world's largest trade book publisher - home to Penguin, Vintage, Transworld and dozens of imprints.", valueChainStage: "Editorial" },
  { name: "HarperCollins UK", url: "https://harpercollins.pinpointhq.com", founded: "1817", hq: "London", overview: "One of the world's largest publishers, second only to Penguin Random House - fiction, non-fiction and children's books.", valueChainStage: "Editorial" },
  { name: "Hachette UK", url: "https://www.hachette.co.uk/careers/", founded: "1826", hq: "London", overview: "Major UK publishing group - Orion, Headline, John Murray and more under one roof.", valueChainStage: "Editorial" },
  { name: "Pan Macmillan", url: "https://www.panmacmillan.com/careers", founded: "1843", hq: "London", overview: "One of the 'Big Five' UK publishers - Pan, Macmillan, Picador and Bluebird imprints.", valueChainStage: "Editorial" },
  { name: "Bloomsbury Publishing", url: "https://www.bloomsbury.com/uk/discover/careers/", founded: "1986", hq: "London", overview: "Independent publisher famous for Harry Potter - now a major international publishing group.", valueChainStage: "Editorial" },
  { name: "Faber & Faber", url: "https://www.faber.co.uk/careers/", founded: "1929", hq: "London", overview: "Independent literary publisher with a legendary poetry and fiction list.", valueChainStage: "Editorial" },
  { name: "Simon & Schuster UK", url: "https://www.simonandschuster.co.uk/careers", founded: "1986", hq: "London", overview: "UK arm of the major international trade publisher.", valueChainStage: "Editorial" },
  { name: "Bonnier Books UK", url: "https://www.bonnierbooks.co.uk", founded: "2015", hq: "London", overview: "Fast-growing publishing group behind Manilla Press, Zaffre and John Blake.", valueChainStage: "Editorial" },
  { name: "Canongate Books", url: "https://canongate.co.uk", founded: "1973", hq: "Edinburgh", overview: "Independent publisher known for literary fiction and bold non-fiction.", valueChainStage: "Editorial" },
  { name: "Profile Books", url: "https://profilebooks.com/about/", founded: "1996", hq: "London", overview: "Independent publisher of serious non-fiction, including the Wren imprint.", valueChainStage: "Editorial" },
  { name: "The Literary Consultancy", url: "https://literaryconsultancy.co.uk", founded: "1996", hq: "London", overview: "The UK's leading manuscript assessment service - a genuine route in for aspiring editors and writers.", valueChainStage: "Creation & Writing" },
  { name: "Society of Authors", url: "https://societyofauthors.org/", founded: "1884", hq: "London", overview: "The UK's trade union for writers, illustrators and literary translators.", valueChainStage: "Creation & Writing" },
  { name: "Curtis Brown", url: "https://www.curtisbrown.co.uk/about-us/careers/", founded: "1899", hq: "London", overview: "One of the UK's oldest and most prestigious literary and talent agencies.", valueChainStage: "Rights & Business" },
  { name: "United Agents", url: "https://www.unitedagents.co.uk/about", founded: "2007", hq: "London", overview: "Leading literary, theatrical and talent agency representing top UK authors.", valueChainStage: "Rights & Business" },
  { name: "London Book Fair", url: "https://londonbookfair.co.uk", founded: "1971", hq: "London", overview: "The UK's biggest publishing trade event, where rights deals across the world get done.", valueChainStage: "Rights & Business" },
  { name: "Clays", url: "https://www.clays.co.uk/careers", founded: "1972", hq: "Bungay, Suffolk", overview: "The UK's leading book printer - production behind millions of physical books a year.", valueChainStage: "Design & Production" },
  { name: "The Bookseller", url: "https://www.thebookseller.com/jobs", founded: "1858", hq: "London", overview: "The UK publishing trade's essential news title, bestseller charts and jobs board.", valueChainStage: "Marketing & Publicity" },
  { name: "Waterstones", url: "https://www.waterstones.com/careers", founded: "1982", hq: "London", overview: "The UK's biggest dedicated book retailer, with 300+ shops nationwide.", valueChainStage: "Distribution & Retail" },
  { name: "WH Smith", url: "https://whsmithcareers.co.uk", founded: "1792", hq: "Swindon", overview: "High street and travel retailer - one of the UK's biggest book sellers by volume.", valueChainStage: "Distribution & Retail" },
  { name: "Foyles", url: "https://www.foyles.co.uk/Content/Careers", founded: "1903", hq: "London", overview: "Iconic independent bookshop, now part of Waterstones - famous flagship store on Charing Cross Road.", valueChainStage: "Distribution & Retail" },
  { name: "Blackwell's", url: "https://blackwells.co.uk/bookshop/pages/careers", founded: "1879", hq: "Oxford", overview: "Historic UK bookshop chain, strong in academic and university towns.", valueChainStage: "Distribution & Retail" },
  { name: "Amazon KDP", url: "https://kdp.amazon.com/en_US/", founded: "2007", hq: "Seattle (UK operations)", overview: "Amazon's self-publishing and digital distribution platform - the biggest single channel for independent authors.", valueChainStage: "Distribution & Retail" },
  { name: "Audible", url: "https://www.amazon.jobs/en/teams/audible", founded: "1995", hq: "Newark, US (UK: London)", overview: "The world's leading audiobook platform, owned by Amazon.", valueChainStage: "Distribution & Retail" },
  { name: "Ingram Content Group", url: "https://www.ingramcontent.com/careers", founded: "1970", hq: "Tennessee, US (UK operations)", overview: "Global book wholesaler and print-on-demand distributor connecting publishers to retailers worldwide.", valueChainStage: "Distribution & Retail" },
  { name: "Gardners Books", url: "https://www.gardners.com/careers", founded: "1978", hq: "Eastbourne", overview: "The UK's largest book wholesaler, supplying independent bookshops and online retailers nationwide.", valueChainStage: "Distribution & Retail" },
];

const Books = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind publishing houses, agents, and the modern book trade.</p>
        <PodcastPlayer industry="books" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Inside Publishing", description: "The Society of Young Publishers interviews industry experts on everything publishing.", url: "https://open.spotify.com/show/3utrTcitCdYZFkNEenfvje" },
            { title: "The BookMachine Podcast", description: "Conversations shining a light on the unsung heroes of the publishing industry.", url: "https://open.spotify.com/show/56x3lLhD4yDbI3wmF7HFhH" },
            { title: "The Bookseller Podcast", description: "Author interviews, new releases and book recommendations from the UK trade's own title.", url: "https://open.spotify.com/show/0aGtXLlUiS7fhSFRUtB8Pr" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="books" />
        <LiveArticles industry="books" fallbackArticles={[
          { title: "UK Book Sales Hit Record High as Physical Books Resist Digital", source: "The Bookseller", url: "https://www.thebookseller.com" },
          { title: "Publishers Association Reports Strong Export Growth for UK Books", source: "Publishers Association", url: "https://www.publishers.org.uk" },
          { title: "Independent Bookshops See Continued Growth Across the UK", source: "BookBrunch", url: "https://www.bookbrunch.co.uk" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="books" />
          <div className="mt-4"><BreakingNewsFeed industry="books" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="books" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["books"] || []} /><div className="mt-12"><YouTubeChannels industry="books" /><TikTokCreators industry="books" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={booksCompanies} />
        <div className="mt-12"><DayInTheLife industry="books" /></div>
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From the manuscript to the shelf - the roles that make the book industry work." stages={booksStages} industry="books" />
          <div className="mt-12"><IndustryRolesLink industry="Books" /></div>
        <ExploreFurther links={[
          { title: "Publishers Association", description: "The trade body for UK publishers - skills, careers, and industry data.", url: "https://www.publishers.org.uk" },
          { title: "The Society of Young Publishers", description: "The UK's leading network and careers resource for people starting out in publishing.", url: "https://www.thesyp.org.uk" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Books" searchQuery="publishing industry" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Books" slug="books" />
          <CoursesSection industry="books" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Find your next chapter<span className="text-primary">…</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the book publishing industry.</p>
          <Link to="/marketplace?industry=Books#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <ExploreFurther
          title="More places to look"
          subtitle="Publishing industry job boards and specialist platforms where you can find roles directly."
          links={[
            { title: "BookMachine Jobs", description: "Specialist job board for publishing roles across editorial, marketing, rights and production.", url: "https://bookmachine.org/jobs/" },
            { title: "Publishers Association Jobs Board", description: "The UK publishing trade body's own jobs board, covering major and independent publishers.", url: "https://www.publishers.org.uk/jobs/" },
            { title: "The Bookseller Jobs", description: "Jobs from the UK publishing trade's essential news title.", url: "https://www.thebookseller.com/jobs" },
            { title: "Society of Young Publishers Jobs", description: "Entry-level and early-career publishing roles, curated for people starting out.", url: "https://www.thesyp.org.uk/jobs" },
          ]}
        />
        <IndustryRolesShowcase stages={booksStages} industry="Books" companies={booksCompanies} />
        <IndustryCVBuilder industry="Books" stages={booksStages} />
      </>
    )},
  ];
  return <IndustryPageLayout name="Books" description="Publishing houses, booksellers, authors, editors, and the stories behind the world's favourite reads." profile="The book publishing industry spans creation, editorial, production, rights, marketing, and distribution - both physical and digital. In the UK it is one of the world's largest book markets, home to global publishing houses, thousands of independent presses, and a growing self-publishing sector. From a debut author's first manuscript to a paperback on a supermarket shelf or an audiobook in someone's ears, it runs on rights deals, editorial judgement, and getting the right book to the right reader." tabs={tabs} />;
};

export default Books;
