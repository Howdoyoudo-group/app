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
import { Dog, Heart, Store, Megaphone, Briefcase, Stethoscope } from "lucide-react";
import type { CareerStage } from "@/components/CareerMap";
import PodcastGrid from "@/components/PodcastGrid";

const petsStages: CareerStage[] = [
  { title: "Veterinary & Animal Health", icon: Stethoscope, roles: [
    { name: "Veterinary Surgeon", description: "Diagnoses and treats illness and injury in companion animals across GP and referral practice.", salary: "£35k–£65k" },
    { name: "Veterinary Nurse", description: "Supports surgical procedures, administers medication, and provides pre- and post-operative care.", salary: "£25k–£32k" },
    { name: "Veterinary Receptionist", description: "First point of contact for pet owners - manages appointments, billing, and client communication.", salary: "£25k–£26k" },
    { name: "Animal Behaviourist", description: "Assesses and treats behavioural issues in dogs, cats, and other companion animals.", salary: "£25k–£45k" },
    { name: "Locum Vet", description: "Provides temporary cover across practices - flexibility and variety with premium day rates.", salary: "£300–£600/day" },
  ]},
  { title: "Pet Food & Nutrition", icon: Dog, roles: [
    { name: "Pet Nutritionist", description: "Formulates balanced diets and develops new pet food recipes backed by nutritional science.", salary: "£28k–£50k" },
    { name: "NPD Manager", description: "Leads new product development for pet food brands - from concept to shelf.", salary: "£35k–£55k" },
    { name: "Quality Assurance Manager", description: "Ensures pet food production meets safety, labelling, and regulatory standards.", salary: "£30k–£48k" },
    { name: "Supply Chain Coordinator", description: "Manages ingredient sourcing and logistics for pet food manufacturing.", salary: "£26k–£40k" },
  ]},
  { title: "Pet Retail & E-Commerce", icon: Store, roles: [
    { name: "Store Manager", description: "Runs a pet retail store - stock management, team leadership, and customer experience.", salary: "£26k–£38k" },
    { name: "E-Commerce Manager", description: "Drives online sales for pet brands and retailers - from UX to conversion optimisation.", salary: "£32k–£52k" },
    { name: "Buyer", description: "Selects and negotiates product ranges - toys, accessories, food, and health products.", salary: "£28k–£48k" },
    { name: "Visual Merchandiser", description: "Creates engaging in-store and window displays for pet retail environments.", salary: "£25k–£34k" },
  ]},
  { title: "Pet Services & Wellbeing", icon: Heart, roles: [
    { name: "Dog Groomer", description: "Provides grooming, bathing, and styling services for dogs across breeds.", salary: "£25k–£30k" },
    { name: "Dog Walker / Pet Sitter", description: "Provides daily exercise, companionship, and overnight care for pets.", salary: "£25k–£28k" },
    { name: "Dog Trainer", description: "Teaches obedience, socialisation, and specialist skills through structured training programmes.", salary: "£25k–£35k" },
    { name: "Pet Photographer", description: "Captures professional portraits and lifestyle images of pets for owners and brands.", salary: "£25k–£40k" },
    { name: "Animal Physiotherapist", description: "Delivers rehabilitation and mobility therapy for injured or post-operative animals.", salary: "£26k–£42k" },
  ]},
  { title: "Marketing & Brand", icon: Megaphone, roles: [
    { name: "Brand Manager", description: "Defines and grows brand identity for pet food, accessories, or services companies.", salary: "£32k–£55k" },
    { name: "Social Media Manager", description: "Creates engaging pet content for Instagram, TikTok, and YouTube - the internet loves animals.", salary: "£25k–£40k" },
    { name: "PR & Communications Manager", description: "Manages press, influencer partnerships, and media coverage for pet brands.", salary: "£28k–£48k" },
    { name: "Content Creator", description: "Produces blogs, videos, and educational content about pet care and products.", salary: "£25k–£38k" },
  ]},
  { title: "Business & Operations", icon: Briefcase, roles: [
    { name: "Practice Manager", description: "Manages the business side of a veterinary practice - finances, staffing, and compliance.", salary: "£30k–£48k" },
    { name: "Head of Retail", description: "Oversees multi-site pet retail operations and commercial performance.", salary: "£45k–£75k" },
    { name: "Franchise Manager", description: "Supports franchisees across pet grooming, daycare, or retail networks.", salary: "£35k–£55k" },
    { name: "Sustainability Manager", description: "Drives environmental initiatives - sustainable packaging, ethical sourcing, and carbon reduction.", salary: "£32k–£55k" },
    { name: "Finance Manager", description: "Manages budgets, forecasting, and financial planning for pet businesses.", salary: "£35k–£60k" },
  ]},
];

const newsfeed = [
  { title: "Pet Gazette", url: "https://www.petgazette.biz" },
  { title: "Pet Industry Federation", url: "https://www.petfederation.co.uk" },
  { title: "Vet Times", url: "https://www.vettimes.co.uk" },
];

const petsCompanies = [
  { name: "Pets at Home", url: "https://www.petsathomejobs.com", founded: "1991", hq: "Handforth, Cheshire", overview: "The UK's largest pet care business - retail, veterinary practices (Vets4Pets), and grooming services under one roof.", valueChainStage: "Pet Retail & E-Commerce" },
  { name: "Vets4Pets", url: "https://www.vets4petscareers.com", founded: "2001", hq: "Swindon", overview: "One of the UK's largest veterinary groups - joint venture practices with entrepreneurial vets.", valueChainStage: "Veterinary & Animal Health" },
  { name: "IVC Evidensia", url: "https://ivcevidensia.co.uk/careers", founded: "2011", hq: "Bristol", overview: "Europe's largest veterinary care provider - 1,800+ practices across the UK and Europe.", valueChainStage: "Veterinary & Animal Health" },
  { name: "Medivet", url: "https://www.medivet.co.uk/careers", founded: "1987", hq: "Watford", overview: "Community-focused veterinary group with 400+ practices across the UK.", valueChainStage: "Veterinary & Animal Health" },
  { name: "Purina (Nestlé)", url: "https://www.nestle.co.uk/en-gb/jobs", founded: "1894", hq: "Gatwick", overview: "One of the world's largest pet food manufacturers - brands include Felix, Winalot, and Pro Plan.", valueChainStage: "Pet Food & Nutrition" },
  { name: "Mars Petcare", url: "https://www.mars.com/careers", founded: "1935", hq: "McLean (UK offices)", overview: "Global pet care leader - Pedigree, Whiskas, Royal Canin, and the Banfield veterinary network.", valueChainStage: "Pet Food & Nutrition" },
  { name: "Lily's Kitchen", url: "https://www.lilyskitchen.co.uk/pages/jobs", founded: "2008", hq: "London", overview: "Premium natural pet food brand - proper food for pets, now part of Nestlé Purina.", valueChainStage: "Pet Food & Nutrition" },
  { name: "Butternut Box", url: "https://www.butternutbox.com/careers", founded: "2016", hq: "London", overview: "Fresh, home-cooked dog food delivered to your door - one of the UK's fastest-growing pet startups.", valueChainStage: "Pet Food & Nutrition" },
  { name: "Rover", url: "https://www.rover.com/uk/become-a-sitter/", founded: "2011", hq: "Seattle (UK operations)", overview: "The world's largest marketplace for pet sitting and dog walking services.", valueChainStage: "Pet Services & Wellbeing" },
  { name: "Battersea Dogs & Cats Home", url: "https://www.battersea.org.uk/jobs", founded: "1860", hq: "London", overview: "Iconic animal rescue charity - rehoming, campaigning, and community programmes.", valueChainStage: "Pet Services & Wellbeing" },
  { name: "Blue Cross", url: "https://jobs.bluecross.org.uk", founded: "1897", hq: "Burford", overview: "National pet charity providing veterinary care, rehoming, and support for pet owners in need.", valueChainStage: "Pet Services & Wellbeing" },
  { name: "PDSA", url: "https://www.pdsa.org.uk/careers", founded: "1917", hq: "Telford", overview: "The UK's leading vet charity - free and low-cost veterinary care for pets of people in financial hardship.", valueChainStage: "Veterinary & Animal Health" },
  { name: "Pooch & Mutt", url: "https://www.poochandmutt.co.uk", founded: "2008", hq: "London", overview: "Health-focused dog food and supplement brand - grain-free, functional nutrition.", valueChainStage: "Pet Food & Nutrition" },
  { name: "Jollyes", url: "https://careers.jollyes.co.uk", founded: "1971", hq: "Newcastle-under-Lyme", overview: "The pet people - growing UK pet retail chain with 90+ stores and a focus on value.", valueChainStage: "Pet Retail & E-Commerce" },
  { name: "Vets Now", url: "https://www.vets-now.com/careers/", founded: "2001", hq: "Dunfermline", glassdoor: 3.2, overview: "The UK's leading provider of out-of-hours emergency veterinary care - 60+ clinics and pet emergency hospitals.", valueChainStage: "Veterinary & Animal Health" },
  { name: "CVS Group", url: "https://careers.cvsukltd.co.uk", founded: "1999", hq: "Diss, Norfolk", glassdoor: 3.0, overview: "One of the UK's largest veterinary groups - 500+ practices and the MiPet Cover insurance brand.", valueChainStage: "Veterinary & Animal Health" },
];

const Pets = () => {
  const tabs = [
    { id: "listen", label: "Listen", content: (
      <>
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6">Episodes<span className="text-primary">.</span></h2>
        <p className="text-muted-foreground font-body text-sm mb-6">Coming soon - episodes exploring the business behind pets.</p>
        <PodcastPlayer industry="pets" />
        <h2 className="font-display text-2xl md:text-3xl font-700 mb-6 mt-12">Podcasts We Rate<span className="text-primary">.</span></h2>
        <PodcastGrid podcasts={[
            { title: "Your Pet Business, Your Way", description: "Rachel Spencer's podcast for UK pet professionals growing their business their own way.", url: "https://open.spotify.com/show/7FNtn0FvZEUIdLNkV5ezWd" },
            { title: "The Vet Vault", description: "Veterinary career development, work-life balance, and burnout prevention with Dr. Hubert Hiemstra.", url: "https://open.spotify.com/show/3zrSVIYBUnXCVCvLWBwG27" },
            { title: "Pet Business Disruptors", description: "Clayton Payne interviews founders shaking up the pet industry - raw feeding, retail, and beyond.", url: "https://podscan.fm/podcasts/pet-business-disruptors" },
          ]} />
      </>
    )},
    { id: "read", label: "Read", content: (
      <>
        <DailyBriefing industry="pets" />
        <LiveArticles industry="pets" fallbackArticles={[
          { title: "UK Pet Industry Worth £8 Billion and Growing", source: "Pet Gazette", url: "https://www.petgazette.biz" },
          { title: "The Rise of Premium Pet Food in Britain", source: "Pet Industry Federation", url: "https://www.petfederation.co.uk" },
          { title: "Veterinary Workforce Crisis: What's Next?", source: "Vet Times", url: "https://www.vettimes.co.uk" },
        ]} />
        <div className="mt-12">
          <NewsfeedModal sources={newsfeed} industry="pets" />
          <div className="mt-4"><BreakingNewsFeed industry="pets" sources={newsfeed} /></div>
        </div>
        <div className="mt-12"><SubstackNewsletters industry="pets" /></div>
      </>
    )},
    { id: "watch", label: "Watch", content: <><VideoShowcase heading="Unpacking on Screen" clips={industryVideos["pets"] || []} /><div className="mt-12"><YouTubeChannels industry="pets" /><TikTokCreators industry="pets" /></div></> },
    { id: "work", label: "Who?", content: (
      <>
        <CompanyProfileGrid companies={petsCompanies} />
        <div className="mt-12"><DayInTheLife industry="pets" /></div>
        
      </>
    )},
    { id: "plan", label: "Plan", content: (
      <>
        <CareerMap title="Where You Fit In" subtitle="From veterinary practice to pet food innovation - every role in the pets industry." stages={petsStages} industry="pets" />
          <div className="mt-12"><IndustryRolesLink industry="Pets" /></div>
        <ExploreFurther links={[
          { title: "RCVS - Careers in Veterinary", description: "The Royal College of Veterinary Surgeons' guide to careers as a vet, vet nurse, and allied roles.", url: "https://www.rcvs.org.uk" },
          { title: "BVA - Become a Vet", description: "The British Veterinary Association's guide to veterinary training, routes, and what to expect.", url: "https://www.bva.co.uk/your-career/" },
        ]} />
      </>
    ) },
    { id: "attend", label: "Attend", content: <EventsSection industry="Pets" searchQuery="pet industry veterinary UK" /> },
    { id: "learn", label: "Learn", content: (
        <>
          <TheDownload industry="Pets" slug="pets" />
          <CoursesSection industry="pets" />
        </>
      ) },
    { id: "apply", label: "Jobs", content: (
      <>
        <div className="border border-border p-6 mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-700 mb-3">Unleash your next role<span className="text-primary">.</span></h2>
          <p className="text-muted-foreground font-body text-sm mb-4">Browse live roles across the pets industry.</p>
          <Link to="/marketplace?industry=Pets#jobs-list" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-600 text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">View Jobs</Link>
        </div>
        <IndustryRolesShowcase stages={petsStages} industry="Pets" companies={petsCompanies} />
        <IndustryCVBuilder industry="Pets" stages={petsStages} />
      </>
    )},
  ];
  return (
    <IndustryPageLayout
      name="Pets"
      description="Vets, pet food brands, groomers, and the booming UK pet care industry - worth over £8 billion."
      profile="The UK pet industry is one of the fastest-growing consumer sectors, worth over £8 billion annually. With 34 million pets across 12 million households, the market spans veterinary care, premium nutrition, grooming, pet tech, and a thriving services economy. From legacy players like Pets at Home and Mars Petcare to disruptors like Butternut Box, the sector offers careers across science, retail, marketing, and animal welfare."
      tabs={tabs}
    />
  );
};

export default Pets;
