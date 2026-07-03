import SEO from "@/components/SEO";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import SignUpForm from "@/components/SignUpForm";
import { ArrowLeft, ExternalLink } from "lucide-react";

const industries = [
  {
    name: "Bakery",
    description: "Artisan bakers, high-street chains, wholesale & the craft of bread",
    companies: [
      { name: "Gail's", url: "https://jobs.gailsbread.co.uk", description: "Neighbourhood bakeries & cafés" },
      { name: "Paul UK", url: "https://careers.paul-uk.com/jobs.aspx", description: "French bakery & pâtisserie chain" },
      { name: "Greggs", url: "https://www.greggscareers.co.uk", description: "The UK's biggest bakery chain" },
      { name: "Bread Ahead", url: "https://www.breadahead.com/pages/careers", description: "Artisan bakery, school & doughnut pioneers" },
      { name: "Konditor", url: "https://www.konditor.co.uk/pages/careers", description: "Celebration cakes & London bakery cafés" },
      { name: "Hobbs House Bakery", url: "https://www.hobbshousebakery.co.uk/pages/careers", description: "Family-run artisan bakery since 1920" },
    ],
  },
  {
    name: "Beer",
    description: "Craft breweries, pub groups, global brewers & the business of beer",
    companies: [
      { name: "BrewDog", url: "https://www.brewdog.com/uk/careers", description: "Scotland's punk craft brewery" },
      { name: "Beavertown Brewery", url: "https://www.beavertownbrewery.co.uk/pages/careers", description: "Bold London craft brewery (Heineken)" },
      { name: "Camden Town Brewery", url: "https://www.camdentownbrewery.com/careers", description: "London lager brewery (AB InBev)" },
      { name: "Heineken UK", url: "https://www.theheinekencompany.com/our-company/uk", description: "UK's largest pub company & brewer" },
      { name: "Molson Coors UK", url: "https://www.molsoncoors.com/careers", description: "Carling, Coors, Doom Bar & more" },
      { name: "Fuller's", url: "https://careers.fullers.co.uk", description: "Historic London brewer & pub operator" },
    ],
  },
  {
    name: "Charity",
    description: "Nonprofits, foundations, social enterprises & the third sector",
    companies: [
      { name: "Save the Children UK", url: "https://www.savethechildren.org.uk/about-us/jobs", description: "Global children's rights charity" },
      { name: "The Trussell Trust", url: "https://www.trusselltrust.org/about/careers/", description: "UK's largest food bank network" },
      { name: "Charity Job", url: "https://www.charityjob.co.uk", description: "The UK's biggest charity job board" },
      { name: "Oxfam", url: "https://www.oxfam.org.uk/what-we-do/about-us/work-with-us/", description: "International anti-poverty charity" },
      { name: "British Red Cross", url: "https://www.redcross.org.uk/about-us/jobs", description: "Humanitarian aid & crisis response" },
    ],
  },
  {
    name: "Coffee",
    description: "From bean to cup - roasters, chains & independents",
    companies: [
      { name: "Oatly", url: "https://www.oatly.com/careers", description: "Plant-based & coffee culture disruptor" },
      { name: "Grind", url: "https://grind.co.uk/pages/careers", description: "Sustainable coffee & hospitality" },
      { name: "Minor Figures", url: "https://www.minorfigures.com/careers", description: "Oat milk & specialty coffee" },
      { name: "Origin Coffee", url: "https://www.origincoffee.co.uk/pages/careers", description: "Specialty roasters & cafés" },
    ],
  },
  {
    name: "Estate Agency",
    description: "Agents, portals, PropTech & the UK property market",
    companies: [
      { name: "Foxtons", url: "https://www.foxtons.co.uk/careers", description: "London's leading estate agency" },
      { name: "Savills", url: "https://www.savills.co.uk/careers", description: "Global property advisory & agency" },
      { name: "Knight Frank", url: "https://www.knightfrank.co.uk/careers", description: "Partnership-owned property consultancy" },
      { name: "Rightmove", url: "https://www.rightmove.co.uk/careers", description: "UK's largest property portal" },
      { name: "Purplebricks", url: "https://www.purplebricks.co.uk/careers", description: "Hybrid online estate agent (acquired Strike)" },
      { name: "Zoopla", url: "https://www.zoopla.co.uk/careers", description: "Property portal & data platform" },
    ],
  },
  {
    name: "Farming",
    description: "Arable, livestock, dairy, horticulture & the AgriTech revolution",
    companies: [
      { name: "Agricultural & Farming Jobs", url: "https://www.agrifj.co.uk", description: "The UK's leading farming & agriculture job board" },
      { name: "Velcourt", url: "https://www.velcourt.co.uk/careers", description: "The UK's largest farm management company" },
      { name: "Frontier Agriculture", url: "https://www.frontierag.co.uk/careers", description: "Crop production, agronomy & grain marketing" },
      { name: "Arla Foods UK", url: "https://www.arlafoods.co.uk/careers", description: "Farmer-owned dairy co-op" },
      { name: "AHDB", url: "https://ahdb.org.uk/careers", description: "Agriculture & Horticulture Development Board" },
    ],
  },
  {
    name: "Fashion",
    description: "Style, supply chains & the future of retail",
    companies: [
      { name: "ASOS", url: "https://www.asoscareers.com", description: "Global fashion & beauty destination" },
      { name: "Next", url: "https://careers.next.co.uk", description: "Retail, online & finance" },
      { name: "ME+EM", url: "https://www.meandem.com/careers", description: "Modern luxury womenswear" },
      { name: "Zara (Inditex)", url: "https://www.inditexcareers.com", description: "Fast fashion & global supply chain" },
      { name: "Depop", url: "https://www.depop.com/jobs", description: "Circular fashion marketplace" },
      { name: "Dr. Martens", url: "https://jobs.drmartens.com", description: "Iconic footwear & subculture brand" },
      { name: "Burberry", url: "https://burberrycareers.com", description: "British luxury fashion house" },
    ],
  },
  {
    name: "Film and TV",
    description: "Studios, streamers & the business of storytelling",
    companies: [
      { name: "Netflix", url: "https://jobs.netflix.com", description: "Streaming & original content" },
      { name: "A24", url: "https://a24films.com/jobs", description: "Independent film & culture" },
      { name: "Curzon", url: "https://www.curzon.com/careers/", description: "Cinemas, distribution & streaming" },
      { name: "MUBI", url: "https://mubi.com/jobs", description: "Curated streaming platform" },
    ],
  },
  {
    name: "Food & Drink",
    description: "Restaurants, bars, breweries & the people behind the plate",
    companies: [
      { name: "Host Staffing", url: "https://hoststaffing.co.uk", description: "Premium hospitality staffing agency" },
      { name: "Dishoom", url: "https://www.dishoom.com/careers", description: "Bombay-inspired café-restaurants" },
      { name: "Five Guys", url: "https://fiveguys.co.uk/careers", description: "Burgers, fries & fresh-to-order fast casual" },
      { name: "Gail's", url: "https://jobs.gailsbread.co.uk", description: "Neighbourhood bakeries & cafés" },
      { name: "JKS Restaurants", url: "https://jksrestaurants.com/careers", description: "Group behind Gymkhana, BAO & Hoppers" },
      { name: "Flat Iron", url: "https://flatironsteak.co.uk/careers", description: "Steak restaurants across London" },
      { name: "The Wolseley Hospitality Group", url: "https://www.thewolseley.com/careers", description: "Iconic London grand café-restaurants" },
    ],
  },
  {
    name: "Football",
    description: "Clubs, broadcasters, agencies & the business of the beautiful game",
    companies: [
      { name: "Jobs in Football", url: "https://jobsinfootball.com", description: "Football industry job board - clubs, federations & more" },
      { name: "Sky Sports", url: "https://careers.sky.com", description: "Major UK football broadcaster" },
      { name: "DAZN", url: "https://careers.dazn.com", description: "Global sports streaming platform" },
      { name: "City Football Group", url: "https://www.cityfootballgroup.com/careers", description: "Multi-club ownership group" },
      { name: "Kick It Out", url: "https://www.kickitout.org/jobs", description: "Football's equality & inclusion organisation" },
    ],
  },
  {
    name: "Footwear",
    description: "Sneakers, boots, sandals & the global shoe industry",
    companies: [
      { name: "Nike", url: "https://jobs.nike.com", description: "World's largest athletic footwear brand" },
      { name: "Dr. Martens", url: "https://www.drmartens.com/uk/en_gb/careers", description: "Iconic British boot brand" },
      { name: "Birkenstock", url: "https://www.birkenstock.com/gb/careers.html", description: "Heritage German sandal maker" },
      { name: "Timberland", url: "https://www.timberland.co.uk/careers.html", description: "Outdoor boot & apparel brand" },
      { name: "UGG", url: "https://www.deckers.com/careers", description: "Sheepskin boot pioneer (Deckers Brands)" },
    ],
  },
  {
    name: "Formula 1",
    description: "F1 teams, engineering, commercial, media & motorsport operations",
    companies: [
      { name: "Formula 1 (Liberty Media)", url: "https://corp.formula1.com/careers/", description: "The sport's commercial rights holder" },
      { name: "McLaren Racing", url: "https://racingcareers.mclaren.com/", description: "Legendary Woking-based F1 team" },
      { name: "Mercedes-AMG PETRONAS F1", url: "https://www.mercedesamgf1.com/careers", description: "Eight-time constructors' champions" },
      { name: "Red Bull Racing", url: "https://www.redbullracing.com/int-en/jobs", description: "Milton Keynes-based F1 powerhouse" },
      { name: "Aston Martin F1", url: "https://www.astonmartinf1.com/en-GB/careers", description: "Silverstone-based team building a new campus" },
      { name: "Williams Racing", url: "https://careers.williamsf1.com/", description: "Nine-time constructors' champions at Grove" },
      { name: "Motorsportjobs.com", url: "https://www.motorsportjobs.com/en/jobs/industry/formula-1-10611", description: "Dedicated F1 & motorsport job board" },
    ],
  },
  {
    name: "Gaming",
    description: "Studios, esports, publishers & the UK games industry",
    companies: [
      { name: "Rockstar Games", url: "https://www.rockstargames.com/careers", description: "Creators of GTA - Edinburgh & London" },
      { name: "Playground Games", url: "https://www.playground-games.com/careers", description: "Creators of Forza Horizon" },
      { name: "Creative Assembly", url: "https://www.creative-assembly.com/careers", description: "Total War studio (SEGA)" },
      { name: "Jagex", url: "https://www.jagex.com/en-GB/careers", description: "Creators of RuneScape" },
      { name: "Sumo Digital", url: "https://www.sumo-digital.com/careers/", description: "One of the UK's largest studios" },
      { name: "Games Jobs Direct", url: "https://www.gamesjobsdirect.com", description: "UK games industry job board" },
    ],
  },
  {
    name: "Health",
    description: "NHS, private healthcare, care, pharmacy, MedTech & pharma",
    companies: [
      { name: "NHS Jobs", url: "https://www.jobs.nhs.uk", description: "The UK's largest employer - 350+ careers" },
      { name: "Bupa UK", url: "https://www.bupa.com/careers", description: "Private health insurance, clinics & care homes" },
      { name: "HCA Healthcare UK", url: "https://www.hcahealthcare.co.uk/careers/", description: "London's leading private hospital group" },
      { name: "Boots UK", url: "https://www.boots.jobs", description: "The UK's largest pharmacy chain" },
      { name: "GSK", url: "https://www.gsk.com/en-gb/careers/", description: "Global pharma - vaccines & specialty medicines" },
      { name: "AstraZeneca", url: "https://careers.astrazeneca.com", description: "British-Swedish biopharma giant" },
      { name: "HC-One", url: "https://www.hc-one.co.uk/careers", description: "The UK's largest care home operator" },
    ],
  },
  {
    name: "Horse Racing",
    description: "Yards, racecourses, bloodstock, broadcasting & the BHA",
    companies: [
      { name: "Careers in Racing", url: "https://www.careersinracing.com", description: "Official careers hub for British racing" },
      { name: "The Jockey Club", url: "https://www.thejockeyclub.co.uk/careers/", description: "Aintree, Cheltenham, Epsom & 12 more racecourses" },
      { name: "Arena Racing Company", url: "https://www.arenaracingcompany.co.uk/careers", description: "The UK's largest racecourse operator" },
      { name: "Ascot Racecourse", url: "https://www.ascot.com/careers", description: "Home of Royal Ascot" },
      { name: "Tattersalls", url: "https://www.tattersalls.com/careers", description: "Europe's largest bloodstock auctioneer" },
      { name: "Racing Post", url: "https://www.racingpost.com/jobs/", description: "The UK's leading racing newspaper & data" },
      { name: "British Racing School", url: "https://www.brs.org.uk", description: "Newmarket-based industry training centre" },
    ],
  },
  {
    name: "Jewellery",
    description: "Designers, goldsmiths, gemmologists & luxury retail",
    companies: [
      { name: "Pragnell", url: "https://www.pragnell.co.uk/careers", description: "Royal Warrant fine jeweller" },
      { name: "Boodles", url: "https://www.boodles.com/careers", description: "Family-run fine jewellers since 1798" },
      { name: "Monica Vinader", url: "https://www.monicavinader.com/careers", description: "Accessible luxury DTC jewellery" },
      { name: "De Beers", url: "https://www.debeersgroup.com/careers", description: "World's leading diamond company" },
      { name: "Goldsmiths", url: "https://www.goldsmiths.co.uk/careers", description: "Premium UK jewellery & watch retailer" },
      { name: "NAJ Jobs", url: "https://naj.co.uk/jobs", description: "National Association of Jewellers job board" },
    ],
  },
  {
    name: "Journalism",
    description: "Newsrooms, broadcasters, publishers & the media industry",
    companies: [
      { name: "BBC Careers", url: "https://www.bbc.co.uk/careers", description: "The world's largest public broadcaster" },
      { name: "The Guardian", url: "https://workforus.theguardian.com", description: "Reader-funded quality journalism" },
      { name: "Financial Times", url: "https://aboutus.ft.com/careers", description: "Global business journalism" },
      { name: "Journalism.co.uk Jobs", url: "https://www.journalism.co.uk/media-jobs/s2/", description: "UK journalism job board" },
      { name: "Hold the Front Page", url: "https://www.holdthefrontpage.co.uk/jobs/", description: "Regional media job board" },
      { name: "PA Media", url: "https://careers.pamediagroup.com", description: "The UK's national news agency" },
    ],
  },
  {
    name: "Money",
    description: "Banks, asset managers, insurers, fintechs & the City of London",
    companies: [
      { name: "HSBC", url: "https://www.hsbc.com/careers", description: "Global universal bank" },
      { name: "Barclays", url: "https://home.barclays/careers/", description: "UK retail, corporate & investment bank" },
      { name: "BlackRock", url: "https://careers.blackrock.com", description: "World's largest asset manager" },
      { name: "Lloyd's of London", url: "https://www.lloyds.com/about-lloyds/careers", description: "Specialty insurance & reinsurance market" },
      { name: "Monzo", url: "https://monzo.com/careers/", description: "Leading UK challenger bank" },
      { name: "Revolut", url: "https://www.revolut.com/careers/", description: "Europe's most valuable fintech" },
      { name: "PwC UK", url: "https://www.pwc.co.uk/careers.html", description: "Big Four audit, tax & consulting" },
    ],
  },
  {
    name: "Music",
    description: "Labels, venues, promoters & the live experience",
    companies: [
      { name: "Dice", url: "https://dice.fm/careers", description: "Live music discovery & ticketing" },
      { name: "Spotify", url: "https://www.lifeatspotify.com", description: "Audio streaming & podcasting" },
      { name: "Broadwick", url: "https://broadwicklive.com/careers", description: "Venues, festivals & live events" },
      { name: "Secretly Group", url: "https://secretlygroup.com/careers", description: "Independent label family" },
    ],
  },
  {
    name: "Physiotherapy",
    description: "NHS, private practice, sports rehab & specialist clinics",
    companies: [
      { name: "NHS Jobs", url: "https://www.jobs.nhs.uk", description: "The UK's largest employer of physiotherapists" },
      { name: "Nuffield Health", url: "https://www.nuffieldhealth.com/careers", description: "Healthcare charity with physio roles" },
      { name: "Bupa", url: "https://www.bupajobs.com", description: "Private healthcare & clinics" },
      { name: "Six Physio", url: "https://www.sixphysio.com/careers", description: "Leading private physio practice" },
      { name: "CSP Jobs", url: "https://www.csp.org.uk/jobs-careers", description: "Chartered Society of Physiotherapy job board" },
    ],
  },
  {
    name: "Psychotherapy",
    description: "Counselling, talking therapies, mental health & private practice",
    companies: [
      { name: "NHS Talking Therapies", url: "https://www.jobs.nhs.uk", description: "The UK's largest talking therapy programme" },
      { name: "BACP Job Board", url: "https://www.bacp.co.uk/jobs/", description: "Counselling & psychotherapy vacancies" },
      { name: "BetterHelp", url: "https://www.betterhelp.com/therapist/", description: "Online therapy platform" },
      { name: "Ieso Digital Health", url: "https://www.iesohealth.com", description: "NHS digital therapy provider" },
      { name: "Psychology Jobs", url: "https://www.psychologyjobs.co.uk", description: "UK psychology & therapy job board" },
    ],
  },
  {
    name: "Teaching",
    description: "Schools, EdTech, teacher training & the education system",
    companies: [
      { name: "Teach First", url: "https://www.teachfirst.org.uk/careers", description: "Graduate teaching leadership programme" },
      { name: "TES", url: "https://www.tes.com/jobs", description: "The UK's largest teaching job board" },
      { name: "Ark Schools", url: "https://www.arkonline.org/careers", description: "Multi-academy trust across England" },
      { name: "Oak National Academy", url: "https://www.thenational.academy/jobs", description: "Free curriculum resources & EdTech" },
      { name: "Twinkl", url: "https://www.twinkl.co.uk/careers", description: "Educational resources & publishing" },
    ],
  },
  {
    name: "Travel",
    description: "Airlines, railways, ride-hailing, hotels, booking platforms & the transport industry",
    companies: [
      { name: "British Airways", url: "https://careers.ba.com", description: "UK's flag carrier airline" },
      { name: "easyJet", url: "https://careers.easyjet.com", description: "Europe's leading low-cost airline" },
      { name: "Uber", url: "https://www.uber.com/gb/en/careers/", description: "Global ride-hailing & mobility platform" },
      { name: "Booking.com", url: "https://careers.booking.com", description: "World's leading online travel agency" },
      { name: "Airbnb", url: "https://careers.airbnb.com", description: "Home stays, experiences & hosting" },
      { name: "Trainline", url: "https://www.thetrainline.com/careers", description: "Europe's leading rail booking platform" },
      { name: "TUI", url: "https://careers.tuigroup.com", description: "World's largest tourism group" },
      { name: "Transport for London", url: "https://tfl.gov.uk/corporate/careers", description: "London's public transport network" },
    ],
  },
  {
    name: "Wellness",
    description: "Gyms, personal training, supplements, activewear & the fitness industry",
    companies: [
      { name: "PureGym", url: "https://www.puregym.com/careers", description: "UK's largest gym chain" },
      { name: "Gymshark", url: "https://www.gymshark.com/pages/careers", description: "Fitness apparel & community brand" },
      { name: "Barry's", url: "https://www.barrys.com/careers", description: "Boutique fitness studios" },
      { name: "Myprotein", url: "https://www.myprotein.com/careers.list", description: "Sports nutrition & supplements" },
      { name: "Third Space", url: "https://www.thirdspace.london/careers", description: "Premium fitness clubs" },
      { name: "Lululemon", url: "https://www.lululemon.co.uk/en-gb/careers.html", description: "Premium activewear brand" },
    ],
  },
];

const Jobs = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.getElementById(location.hash.slice(1));
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Jobs - Find Your Next Role"
        description="Discover thousands of live UK job listings across footwear, fashion, grocery, cinema, music and 25+ more industries."
        path="/jobs"
      />
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body text-sm mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-5xl md:text-7xl font-900 leading-[0.9] tracking-tight mb-4">
            Jobs<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-xl mb-16">
            Work inside the industries we unpack. Here are companies hiring
            across the worlds of fashion, coffee, cinema & music.
          </p>
        </motion.div>

        <div className="space-y-16">
          {industries.map((industry, i) => (
            <motion.div
              key={industry.name}
              id={industry.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}
              className="scroll-mt-24"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="font-display text-2xl md:text-3xl font-700 mb-1">
                How do you do<span className="text-primary">?</span> {industry.name}
              </h2>
              <p className="text-muted-foreground font-body text-sm mb-6">
                {industry.description}
              </p>
              <div className="grid gap-3">
                {industry.companies.map((company) => (
                  <a
                    key={company.name}
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between border border-border p-4 md:p-5 hover:border-primary transition-colors"
                  >
                    <div>
                      <span className="font-display font-600 text-foreground group-hover:text-primary transition-colors">
                        {company.name}
                      </span>
                      <p className="text-muted-foreground font-body text-sm mt-0.5">
                        {company.description}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-4" />
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <SignUpForm />
    </div>
  );
};

export default Jobs;
