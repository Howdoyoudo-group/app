import sidehustleSelling from "@/assets/sidehustle-selling.png";
import sidehustleFreelancing from "@/assets/sidehustle-freelancing.png";
import sidehustleDelivery from "@/assets/sidehustle-delivery.png";
import sidehustleTutoring from "@/assets/sidehustle-tutoring.png";
import sidehustleContent from "@/assets/sidehustle-content.png";
import sidehustlePets from "@/assets/sidehustle-pets.png";
import sidehustleRenting from "@/assets/sidehustle-renting.png";
import sidehustleHandmade from "@/assets/sidehustle-handmade.png";
import sidehustleDigital from "@/assets/sidehustle-digital.png";
import sidehustleLocal from "@/assets/sidehustle-local.png";

export interface SideHustleLink {
  name: string;
  description: string;
  url: string;
  tags?: string[];
}

export interface SideHustleTopic {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  watch: SideHustleLink[];
  listen: SideHustleLink[];
  read: SideHustleLink[];
  help: SideHustleLink[];
}

export const SIDE_HUSTLE_TOPICS: SideHustleTopic[] = [
  {
    slug: "selling-online",
    title: "Selling Online",
    shortTitle: "Selling Online",
    description:
      "Vinted, eBay, Depop, Etsy, Facebook Marketplace. Clothes, vintage, handmade items, furniture flipping. Low barrier to entry - the trick is finding what people actually want to buy.",
    icon: sidehustleSelling,
    watch: [
      { name: "Depop (YouTube)", description: "Official Depop channel with seller tips, packaging, photography and pricing.", url: "https://www.youtube.com/@Depop" },
      { name: "Becky Park (YouTube)", description: "Full-time Depop and Vinted reseller sharing what to source and how to price.", url: "https://www.youtube.com/@BeckyPark" },
      { name: "Furniture Flipping with Kayla (YouTube)", description: "Restoring and reselling second-hand furniture - exactly the niche that's blowing up on Marketplace.", url: "https://www.youtube.com/@kaylasimoneb" },
    ],
    listen: [
      { name: "The Side Hustle Show", description: "Nick Loper interviews real people earning side income online - reselling, ecommerce and more.", url: "https://podcasts.apple.com/us/podcast/the-side-hustle-show/id655135292" },
      { name: "Side Hustle Pro", description: "Interviews with founders who turned a side hustle into a real business.", url: "https://podcasts.apple.com/us/podcast/side-hustle-pro/id1126021323" },
    ],
    read: [
      { name: "Vinted - Seller help centre", description: "Official guide to listing, pricing, postage and getting paid on Vinted UK.", url: "https://www.vinted.co.uk/help/topic/selling" },
      { name: "eBay UK - Start selling", description: "How fees work, what sells, and getting your first listing live.", url: "https://www.ebay.co.uk/help/selling/selling/start-selling-ebay?id=4081" },
      { name: "Depop - Seller hub", description: "Official tips on photography, hashtags and growing a Depop shop.", url: "https://blog.depop.com/seller-tips" },
      { name: "Etsy - Open a shop", description: "Step-by-step guide to opening an Etsy shop in the UK, with fees and tax info.", url: "https://www.etsy.com/uk/sell" },
      { name: "Money Saving Expert - Selling old stuff", description: "Honest UK guide comparing eBay, Vinted, Depop and Marketplace for selling clothes and bits.", url: "https://www.moneysavingexpert.com/family/selling-old-stuff/" },
    ],
    help: [
      { name: "HMRC - Selling online and tax", description: "Official UK guidance on when your side hustle income needs declaring.", url: "https://www.gov.uk/guidance/check-if-you-need-to-tell-hmrc-about-your-income-from-online-platforms", tags: ["Tax", "Official"] },
      { name: "Trading Allowance (£1,000)", description: "You can earn up to £1,000 a year from side income without telling HMRC - here's how it works.", url: "https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income", tags: ["Tax", "Free"] },
    ],
  },
  {
    slug: "freelancing",
    title: "Freelancing",
    shortTitle: "Freelancing",
    description:
      "Writing, design, social media, video editing, admin, virtual assistant work, SEO, websites. Sell a skill by the hour or by the project - start with people you know, then go online.",
    icon: sidehustleFreelancing,
    watch: [
      { name: "Ali Abdaal - How to start freelancing", description: "Cambridge-trained doctor turned full-time creator on how he built freelance income alongside work.", url: "https://www.youtube.com/@aliabdaal" },
      { name: "Charli Marie (YouTube)", description: "UK designer with practical videos on freelance design work, rates and clients.", url: "https://www.youtube.com/@CharliMarieTV" },
      { name: "Roberto Blake - Freelance & Creative Business", description: "Long-running channel on freelance design, video and creative work.", url: "https://www.youtube.com/@robertoblake" },
    ],
    listen: [
      { name: "The Futur with Chris Do", description: "Chris Do interviews freelancers and creative founders on pricing, clients and craft.", url: "https://podcasts.apple.com/us/podcast/the-futur-with-chris-do/id1209219220" },
      { name: "Being Freelance", description: "Steve Folland interviews freelancers about how they actually find work and stay sane.", url: "https://podcasts.apple.com/us/podcast/being-freelance/id959401077" },
      { name: "Honest Marketing", description: "Honest Podcasts series on building a marketing and content practice.", url: "https://podcasts.apple.com/us/podcast/honest-marketing/id1643900237" },
    ],
    read: [
      { name: "IPSE - The self-employed association", description: "UK trade body for freelancers - advice, contracts, rates benchmarks and legal support.", url: "https://www.ipse.co.uk" },
      { name: "Upwork - Getting started guide", description: "How to set up a profile, win your first job and get paid on the world's biggest freelance platform.", url: "https://www.upwork.com/resources/how-to-start-freelancing" },
      { name: "Fiverr - Become a seller", description: "Official guide to launching gigs on Fiverr - the easiest place to start small.", url: "https://www.fiverr.com/start_selling" },
      { name: "PeoplePerHour - For freelancers", description: "UK-based freelance platform popular for design, writing and dev work.", url: "https://www.peopleperhour.com/freelance-jobs" },
    ],
    help: [
      { name: "Upwork", description: "Global freelance marketplace - good for writing, design, dev, virtual assistant work.", url: "https://www.upwork.com", tags: ["Marketplace"] },
      { name: "Fiverr", description: "Sell 'gigs' from £5 upwards - easiest place to test a service.", url: "https://www.fiverr.com", tags: ["Marketplace"] },
      { name: "Contra", description: "Commission-free freelance marketplace for independents.", url: "https://contra.com", tags: ["Marketplace", "Free"] },
      { name: "Toptal", description: "High-end freelance network for the top 3% of designers, devs and finance pros.", url: "https://www.toptal.com", tags: ["Premium"] },
      { name: "YunoJuno", description: "UK-based freelance network for creative and tech roles, with proper rates.", url: "https://www.yunojuno.com", tags: ["UK", "Creative"] },
    ],
  },
  {
    slug: "delivery-driving",
    title: "Delivery & Driving",
    shortTitle: "Delivery & Driving",
    description:
      "Uber, Deliveroo, Just Eat, Amazon Flex. Easy to start but the margins are tight once you factor in fuel, insurance, tax and your actual time. Know the numbers before you sign up.",
    icon: sidehustleDelivery,
    watch: [
      { name: "Tom Wrath (YouTube)", description: "UK Deliveroo and Uber Eats rider showing honest weekly earnings.", url: "https://www.youtube.com/@TomWrath" },
      { name: "Deliveroo (YouTube)", description: "Official Deliveroo channel - rider onboarding, kit and how the platform works.", url: "https://www.youtube.com/@deliveroo" },
      { name: "Amazon Flex UK (YouTube)", description: "Official Amazon Flex UK channel - blocks, requirements and driver onboarding.", url: "https://www.youtube.com/@AmazonFlexUK" },
    ],
    listen: [
      { name: "The GIG Economy Podcast", description: "Conversations on driving, delivery and platform work.", url: "https://podcasts.apple.com/us/podcast/the-gig-economy-podcast/id1330850946" },
    ],
    read: [
      { name: "Money Saving Expert - Become a delivery driver", description: "Honest UK breakdown of pay, costs and tax for Uber Eats, Deliveroo and Just Eat.", url: "https://www.moneysavingexpert.com/family/best-ways-to-earn-extra-money/", tags: ["Honest"] },
      { name: "Uber UK - Drive with Uber", description: "Official requirements, licensing and earnings info for UK driver-partners.", url: "https://www.uber.com/gb/en/drive/" },
      { name: "Deliveroo - Apply to ride", description: "How to sign up as a Deliveroo rider in the UK.", url: "https://riders.deliveroo.com/en/apply" },
      { name: "Just Eat - Become a courier", description: "Apply to deliver for Just Eat in the UK.", url: "https://couriers.just-eat.co.uk" },
      { name: "Amazon Flex UK", description: "Delivery blocks for Amazon - self-employed, you use your own car.", url: "https://flex.amazon.co.uk" },
    ],
    help: [
      { name: "HMRC - Tax for gig workers", description: "When you need to register as self-employed and how to file a tax return.", url: "https://www.gov.uk/working-for-yourself", tags: ["Tax", "Official"] },
      { name: "IWGB - Couriers & Logistics", description: "Independent union for couriers, riders and gig workers in the UK.", url: "https://iwgb.org.uk/page/cluc/", tags: ["Union", "Rights"] },
      { name: "Citizens Advice - Self-employed", description: "Free advice on rights, contracts and tax when you work for platforms.", url: "https://www.citizensadvice.org.uk/work/self-employed-or-employee/", tags: ["Free", "Advice"] },
    ],
  },
  {
    slug: "tutoring-coaching",
    title: "Tutoring & Coaching",
    shortTitle: "Tutoring & Coaching",
    description:
      "School subjects, languages, music, sport, fitness, university admissions. Strong rates if you've got the qualifications or the experience - and demand keeps rising.",
    icon: sidehustleTutoring,
    watch: [
      { name: "Tutorful (YouTube)", description: "Official Tutorful channel - how to become an online tutor and grow your roster.", url: "https://www.youtube.com/@Tutorful" },
      { name: "Ali Abdaal (YouTube)", description: "Cambridge-trained tutor turned creator - covers tutoring, study skills and pricing.", url: "https://www.youtube.com/@aliabdaal" },
    ],
    listen: [
      { name: "The Tutor Podcast", description: "Neil Cowmeadow on pricing, parents, pedagogy and running a tutoring business.", url: "https://podcasts.apple.com/us/podcast/the-tutor-podcast/id1369191372" },
    ],
    read: [
      { name: "MyTutor", description: "UK's biggest online tutoring platform - apply if you're at a top university.", url: "https://www.mytutor.co.uk/become-a-tutor", tags: ["Online"] },
      { name: "Tutorful", description: "UK platform for online and in-person tutoring across all subjects and levels.", url: "https://tutorful.co.uk/become-a-tutor", tags: ["Online"] },
      { name: "Superprof", description: "Lets you list lessons in anything - subjects, music, sport, languages.", url: "https://www.superprof.co.uk", tags: ["Broad"] },
      { name: "Tutor House", description: "Premium London-based tutoring agency with higher rates for experienced tutors.", url: "https://tutorhouse.co.uk/become-a-tutor", tags: ["London", "Premium"] },
      { name: "Save the Student - Tutoring guide", description: "Honest UK guide to becoming a tutor, including rates, tax and platforms.", url: "https://www.savethestudent.org/make-money/become-a-tutor.html" },
    ],
    help: [
      { name: "The Tutors' Association", description: "UK professional body for tutors - standards, safeguarding and a code of practice.", url: "https://www.thetutorsassociation.org.uk", tags: ["Professional"] },
      { name: "DBS check", description: "Most tutoring platforms require a DBS check - here's how to get one.", url: "https://www.gov.uk/request-copy-criminal-record", tags: ["Required"] },
    ],
  },
  {
    slug: "content-creation",
    title: "Content Creation",
    shortTitle: "Content Creation",
    description:
      "TikTok, YouTube, newsletters, podcasts. Cheap to start but slow to monetise - most people quit before they get there. Treat it as a long game and a portfolio, not a payslip.",
    icon: sidehustleContent,
    watch: [
      { name: "Ali Abdaal (YouTube)", description: "Built a multi-million-pound business from a YouTube channel. Explains exactly how.", url: "https://www.youtube.com/@aliabdaal" },
      { name: "Colin and Samir (YouTube)", description: "The go-to channel about the business of being a creator.", url: "https://www.youtube.com/@ColinandSamir" },
      { name: "Think Media (YouTube)", description: "Practical tutorials on starting and growing a YouTube channel.", url: "https://www.youtube.com/@ThinkMediaTV" },
    ],
    listen: [
      { name: "Creator Science with Jay Clouse", description: "Jay Clouse interviews full-time creators on how they actually make money.", url: "https://podcasts.apple.com/us/podcast/creator-science-with-jay-clouse/id1498801064" },
      { name: "The Colin and Samir Show", description: "Long-form conversations with the biggest creators on the internet.", url: "https://podcasts.apple.com/us/podcast/the-colin-and-samir-show/id1379942034" },
      { name: "The Creator Economy Podcast", description: "Jack Conte (Patreon) on the business of being a creator.", url: "https://podcasts.apple.com/us/podcast/the-creator-economy-podcast/id1595693102" },
    ],
    read: [
      { name: "Creator Hub - YouTube", description: "Official YouTube guidance on growth, monetisation and the Partner Programme.", url: "https://www.youtube.com/creators/" },
      { name: "TikTok Creator Centre", description: "Trends, tools and the Creator Fund / Rewards explained.", url: "https://www.tiktok.com/creators/creator-portal/" },
      { name: "Substack - Start a publication", description: "Easiest way to start a paid newsletter - keep 90% of subscription revenue.", url: "https://substack.com/going-paid" },
      { name: "ConvertKit / Kit - Creator economy reports", description: "Annual research on what creators actually earn.", url: "https://kit.com/creators/state-of-the-creator-economy" },
    ],
    help: [
      { name: "ASA - Influencer ad rules", description: "UK Advertising Standards Authority rules on disclosing paid posts - essential reading.", url: "https://www.asa.org.uk/advice-online/influencers-recognising-ads.html", tags: ["UK", "Required"] },
      { name: "Creator Union UK", description: "Union representing UK content creators - rights, contracts, pay disputes.", url: "https://creatorunion.uk", tags: ["Rights"] },
    ],
  },
  {
    slug: "pet-care",
    title: "Pet Care",
    shortTitle: "Pet Care",
    description:
      "Dog walking, pet sitting, house sitting. Strong demand in UK cities, very low setup cost, and once you have happy clients the bookings repeat themselves.",
    icon: sidehustlePets,
    watch: [
      { name: "Rover (YouTube)", description: "Official Rover channel - how to set up as a dog walker or pet sitter on the UK's biggest platform.", url: "https://www.youtube.com/@RoverDotCom" },
    ],
    listen: [
      { name: "The Modern Dog Trainer Podcast", description: "Building a dog-related business - useful if you want to take pet care seriously.", url: "https://podcasts.apple.com/us/podcast/the-modern-dog-trainer-podcast/id1054651801" },
    ],
    read: [
      { name: "Rover UK", description: "UK's biggest platform for dog walking, boarding, sitting and drop-in visits.", url: "https://www.rover.com/uk/become-a-sitter/", tags: ["Platform"] },
      { name: "Tailster", description: "UK-based pet sitting and walking platform with vetting and insurance built in.", url: "https://www.tailster.com/walkers", tags: ["UK", "Insured"] },
      { name: "PetBacker", description: "Global pet care platform - useful if Rover isn't busy in your area.", url: "https://www.petbacker.com" },
      { name: "Trusted Housesitters", description: "House and pet sit in exchange for free accommodation - more of a swap than an income.", url: "https://www.trustedhousesitters.com" },
    ],
    help: [
      { name: "Pet Industry Federation", description: "UK trade body - guidance on insurance, licensing and running a pet care business.", url: "https://www.petindustry.org.uk", tags: ["Professional"] },
      { name: "Pet business licensing (Gov.uk)", description: "When you need a council licence to board dogs or run a pet care business.", url: "https://www.gov.uk/government/publications/animal-activities-licensing-guidance-for-local-authorities", tags: ["Official"] },
      { name: "Pet sitter insurance - Cliverton", description: "UK specialist insurer for dog walkers and pet sitters.", url: "https://www.cliverton.co.uk/pet-business-insurance/", tags: ["Insurance"] },
    ],
  },
  {
    slug: "renting-assets",
    title: "Renting Out Assets",
    shortTitle: "Renting Assets",
    description:
      "Spare room, parking space, car, camera gear, tools, clothes. The stuff you already own can quietly pay for itself.",
    icon: sidehustleRenting,
    watch: [
      { name: "JustPark (YouTube)", description: "Official JustPark channel - how to list your driveway or parking space and what hosts earn.", url: "https://www.youtube.com/@JustPark" },
      { name: "Hiyacar (YouTube)", description: "Official Hiyacar channel - peer-to-peer car hire from the UK host's side.", url: "https://www.youtube.com/@HiyaCar" },
    ],
    listen: [
      { name: "The Property Podcast", description: "Rob Bence and Rob Dix from The Property Hub - useful if you're thinking about spare rooms or buy-to-let later.", url: "https://podcasts.apple.com/us/podcast/the-property-podcast/id624127071" },
    ],
    read: [
      { name: "Rent a Room scheme (£7,500 tax-free)", description: "Official UK guidance - rent a room in your main home and earn up to £7,500 tax-free per year.", url: "https://www.gov.uk/rent-room-in-your-home/the-rent-a-room-scheme", tags: ["Tax-free", "Official"] },
      { name: "SpareRoom", description: "UK's biggest flatshare site - list your spare room here.", url: "https://www.spareroom.co.uk" },
      { name: "Airbnb", description: "Host your spare room, whole home or holiday let - the world's biggest short-stay platform.", url: "https://www.airbnb.co.uk/host/homes", tags: ["Popular"] },
      { name: "JustPark", description: "Rent out your driveway or parking space - especially lucrative near stations and stadiums.", url: "https://www.justpark.com/rent-out-parking/" },
      { name: "YourParkingSpace", description: "Alternative UK parking rental platform.", url: "https://www.yourparkingspace.co.uk/rent-my-space" },
      { name: "Hiyacar", description: "Peer-to-peer car hire - rent out your car by the hour or day when you're not using it.", url: "https://www.hiyacar.co.uk/host" },
      { name: "Turo UK", description: "Global peer-to-peer car sharing platform now in the UK.", url: "https://turo.com/gb/en" },
      { name: "ByRotation", description: "UK app to rent out your designer wardrobe - clothes, bags, jewellery.", url: "https://www.byrotation.com" },
      { name: "Fat Llama", description: "Rent out cameras, tools, instruments, anything - peer-to-peer hire platform.", url: "https://fatllama.com" },
    ],
    help: [
      { name: "HMRC - Property Allowance (£1,000)", description: "Earn up to £1,000 a year from property-related income tax-free.", url: "https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income", tags: ["Tax-free"] },
      { name: "Check your mortgage and insurance", description: "Most lenders and insurers need to know if you're letting a room or renting your car - this is the official rule.", url: "https://www.moneyhelper.org.uk/en/homes/renting/letting-a-room-in-your-home", tags: ["Required"] },
    ],
  },
  {
    slug: "handmade-products",
    title: "Handmade Products",
    shortTitle: "Handmade",
    description:
      "Jewellery, candles, prints, personalised gifts, baked goods. Etsy and Instagram are where these usually start - it's a craft business and a marketing business at the same time.",
    icon: sidehustleHandmade,
    watch: [
      { name: "Etsy Success (YouTube)", description: "Official Etsy seller education channel - listings, SEO, photography, fees.", url: "https://www.youtube.com/@EtsySuccess" },
      { name: "Jewellers Academy (YouTube)", description: "Online school for jewellery making - free intro content on YouTube.", url: "https://www.youtube.com/@JewellersAcademy" },
    ],
    listen: [
      { name: "How to Sell Your Stuff on Etsy", description: "Lizzie Smiley on listings, SEO and growing an Etsy shop.", url: "https://podcasts.apple.com/us/podcast/how-to-sell-your-stuff-on-etsy/id1581848478" },
      { name: "Etsy Conversations Rewind", description: "Interviews with Etsy sellers about what's worked and what hasn't.", url: "https://podcasts.apple.com/us/podcast/etsy-conversations-rewind/id1801635354" },
    ],
    read: [
      { name: "Etsy - Open a UK shop", description: "Step-by-step guide to opening an Etsy shop, including UK VAT and tax.", url: "https://www.etsy.com/uk/sell" },
      { name: "Folksy", description: "UK-only alternative to Etsy - lower fees and a strong handmade-only ethos.", url: "https://folksy.com/sell" },
      { name: "Not On The High Street - Sell with us", description: "UK marketplace for premium handmade and personalised gifts.", url: "https://www.notonthehighstreet.com/about/sellwithus", tags: ["UK", "Premium"] },
      { name: "Shopify - Start an online shop", description: "Set up your own store when you outgrow marketplaces.", url: "https://www.shopify.com/uk" },
    ],
    help: [
      { name: "The Design Trust", description: "UK business support specifically for designer-makers and craft businesses.", url: "https://www.thedesigntrust.co.uk", tags: ["UK", "Craft"] },
      { name: "Crafts Council", description: "National development body for UK craft - funding, fairs and mentoring.", url: "https://www.craftscouncil.org.uk", tags: ["UK", "Funding"] },
      { name: "Food Standards Agency - Selling food from home", description: "Required reading if you're selling baked goods - registration, labelling, allergens.", url: "https://www.food.gov.uk/business-guidance/setting-up-a-food-business", tags: ["Food", "Required"] },
    ],
  },
  {
    slug: "digital-products",
    title: "Digital Products",
    shortTitle: "Digital Products",
    description:
      "Templates, Notion planners, CV templates, design packs, online courses. Harder to start than physical products but properly scalable - sell the same file a thousand times.",
    icon: sidehustleDigital,
    watch: [
      { name: "Ali Abdaal (YouTube)", description: "Breakdown of how creators make six and seven figures from digital products.", url: "https://www.youtube.com/@aliabdaal" },
      { name: "Thomas Frank (YouTube)", description: "Makes millions from Notion templates - shows you exactly how he does it.", url: "https://www.youtube.com/@Thomasfrank" },
      { name: "Sara Finance (YouTube)", description: "Sells Notion and digital templates full-time, walks through her workflow.", url: "https://www.youtube.com/@SaraFinance" },
    ],
    listen: [
      { name: "Creator Science with Jay Clouse", description: "Many episodes specifically on digital products - templates, courses, ebooks.", url: "https://podcasts.apple.com/us/podcast/creator-science-with-jay-clouse/id1498801064" },
      { name: "The Smart Passive Income Podcast", description: "Pat Flynn pioneered the digital-product side hustle - still the best place to learn it.", url: "https://podcasts.apple.com/us/podcast/the-smart-passive-income-online-business-and/id383084001" },
    ],
    read: [
      { name: "Gumroad - Start selling", description: "The easiest place in the world to sell a digital product. No setup fees.", url: "https://gumroad.com/start-selling" },
      { name: "Etsy - Digital downloads", description: "Etsy is huge for digital templates and printables.", url: "https://www.etsy.com/uk/sell" },
      { name: "Notion - Become a creator", description: "Sell Notion templates through the official Notion marketplace.", url: "https://www.notion.so/templates" },
      { name: "Creative Market", description: "Premium marketplace for design assets, fonts and templates.", url: "https://creativemarket.com/sell" },
      { name: "Teachable", description: "Build and sell your own online course on your own site.", url: "https://teachable.com" },
    ],
    help: [
      { name: "Stripe", description: "How to actually take payments online - the standard for digital businesses.", url: "https://stripe.com/gb", tags: ["Payments"] },
      { name: "HMRC - VAT on digital products", description: "Important VAT rules when selling digital products to EU customers from the UK.", url: "https://www.gov.uk/government/publications/vat-supplies-of-digital-services-to-private-consumers", tags: ["Tax", "Required"] },
    ],
  },
  {
    slug: "local-services",
    title: "Local Services",
    shortTitle: "Local Services",
    description:
      "Cleaning, gardening, handyman jobs, car washing, event staffing, babysitting. Local demand is high, competition is real, and reputation is everything - reviews are your CV.",
    icon: sidehustleLocal,
    watch: [
      { name: "Garden Answer (YouTube)", description: "Hugely popular gardening channel - practical content if you're starting a gardening round.", url: "https://www.youtube.com/@GardenAnswer" },
      { name: "The Handy One (YouTube)", description: "Real handyman content - jobs, tools and how a one-person trade business works.", url: "https://www.youtube.com/@TheHandyOne" },
    ],
    listen: [
      { name: "Lawns Across America", description: "Practical advice on small outdoor service businesses - lawn care, gardening, landscaping.", url: "https://podcasts.apple.com/us/podcast/lawns-across-america/id1448382730" },
    ],
    read: [
      { name: "TaskRabbit UK", description: "App-based platform for handyman, cleaning, moving and odd jobs.", url: "https://www.taskrabbit.co.uk/become-a-tasker" },
      { name: "Bark", description: "UK lead generation platform - customers come to you for cleaning, gardening, events, you name it.", url: "https://www.bark.com" },
      { name: "Airtasker UK", description: "App for local odd jobs - delivery, cleaning, assembly, moving.", url: "https://www.airtasker.com/uk/" },
      { name: "Childcare.co.uk", description: "UK's biggest platform for babysitters, childminders and nannies.", url: "https://www.childcare.co.uk" },
      { name: "Sittercity", description: "Babysitting and childcare platform popular with parents.", url: "https://www.sittercity.com" },
      { name: "Checkatrade", description: "UK directory for tradespeople - reviews drive everything.", url: "https://www.checkatrade.com/give-quotes" },
    ],
    help: [
      { name: "DBS check (for childcare)", description: "Required if you're going to babysit or work with children regularly.", url: "https://www.gov.uk/request-copy-criminal-record", tags: ["Childcare", "Required"] },
      { name: "Public liability insurance - Simply Business", description: "Most local service jobs need public liability cover - here's a UK comparison.", url: "https://www.simplybusiness.co.uk/insurance/public-liability/", tags: ["Insurance"] },
      { name: "Register as self-employed", description: "If you earn over £1,000 a year from side work, you need to register with HMRC.", url: "https://www.gov.uk/set-up-self-employed", tags: ["Tax", "Required"] },
    ],
  },
];

export const getSideHustleTopic = (slug: string) =>
  SIDE_HUSTLE_TOPICS.find((t) => t.slug === slug);
