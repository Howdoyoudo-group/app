import type { VideoClip } from "@/components/VideoShowcase";

/**
 * Curated video clips for each industry's Watch tab.
 * Key = industry slug (lowercase, hyphenated).
 * ALL YouTube IDs have been verified as working via oembed API.
 */
export const industryVideos: Record<string, VideoClip[]> = {
  football: [
    { youtubeId: "A_pxpJgY7V4", title: "The Big Data Arms Race in Football", description: "How clubs and leagues are using data to gain a competitive edge - on and off the pitch.", tag: "Documentary", duration: "11:26", channel: "Financial Times" },
    { youtubeId: "SxEc5-UeE2E", title: "When Man United Was Almost Sold to Rupert Murdoch", description: "The story of BSkyB's attempted takeover and what it reveals about football ownership.", tag: "Explainer", duration: "8:36", channel: "Tifo Football" },
    { youtubeId: "DqljJRzW2do", title: "Why Italian Football Has No Money", description: "The financial collapse of Serie A and the business lessons for the Premier League.", tag: "Explainer", duration: "6:32", channel: "Tifo Football" },
    { youtubeId: "s6UcNGzE8sU", title: "How Moneyball Brings Success - Brentford to FC Midtjylland", description: "Matthew Benham's data-driven approach to football club ownership.", tag: "Documentary", duration: "13:20", channel: "COPA90" },
    { youtubeId: "F9z-V4g3dh8", title: "Building a Career in Football Analytics", description: "Tom Worville on breaking into the industry and the skills clubs actually need.", tag: "Careers", duration: "1:28:30", channel: "Chris Gill" },
    { youtubeId: "I3wLt_wFvpY", title: "What It's Really Like Being a Football Scout", description: "Joe Savage on the reality of scouting and the path to sporting director.", tag: "Interview", duration: "1:42:32", channel: "Chris Gill" },
    { youtubeId: "FxgR2i6vhEA", title: "How to Get a Sports Marketing Job in the Premier League", description: "Crystal Palace's Alex King on landing a marketing role at a top-flight club.", tag: "Careers", duration: "57:37", channel: "SportsGrad" },
  ],
  fashion: [
    { youtubeId: "5-0zHqYGnlo", title: "The True Cost: Who Pays the Real Price for Your Clothes?", description: "An investigative documentary exploring the human and environmental price of cheap clothing.", tag: "Documentary", duration: "50:55", channel: "ENDEVR" },
    { youtubeId: "23vUvQN-R1Y", title: "The Truth Behind Fast Fashion", description: "Are fashion retailers honest with their customers? DW investigates.", tag: "Documentary", duration: "42:26", channel: "DW Documentary" },
    { youtubeId: "ON-vFJbq1Vc", title: "Zara's Billion Dollar Business Strategy", description: "How Inditex's speed-to-market model disrupted the fashion industry.", tag: "Explainer", duration: "14:41", channel: "Think School" },
    { youtubeId: "Fz9GyboQXK0", title: "How Bernard Arnault Turned LVMH into an Empire", description: "The strategy behind the world's largest luxury conglomerate.", tag: "Documentary", duration: "16:47", channel: "Business Stories" },
  ],
  bakery: [
    { youtubeId: "3VIw6fhSN70", title: "How Are Greggs Sausage Rolls Made?", description: "A behind-the-scenes look at the entire process of creating the famous Greggs sausage roll.", tag: "Behind the Scenes", duration: "7:35", channel: "Inside The Factory" },
    { youtubeId: "WgI81HTrOv0", title: "13 Ways Gail's Became London's Best Bakery", description: "How Gail's scaled artisan baking without losing its soul.", tag: "Explainer", channel: "YouTube" },
    { youtubeId: "A4PGXxfYq5s", title: "Greggs CFO - Executive Interview on Growth Strategy", description: "Richard Hutton, CFO of Greggs, on their five-year growth plan, new store formats, and expansion into evening trade.", tag: "Interview", duration: "14:50", channel: "Edison" },
  ],
  beauty: [
    { youtubeId: "IABNnwdZMko", title: "What It's Really Like to Build a Beauty Brand from Scratch", description: "Shani Darden on building a skincare brand from Hollywood facialist to Sephora shelves.", tag: "Interview", duration: "23:28", channel: "Nancy Twine" },
    { youtubeId: "axgoWPLViac", title: "How to Start a Cosmetic Business at Home", description: "From formulation to selling - practical steps into the beauty industry.", tag: "Careers", duration: "12:12", channel: "Formula Botanica" },
    { youtubeId: "MPTzOLYHpJY", title: "How to Build a Million Dollar Beauty Brand", description: "Alicia Scott on launching and scaling a beauty business.", tag: "Interview", duration: "52:20", channel: "Foundr" },
  ],
  beer: [
    { youtubeId: "9OIbU5IotCQ", title: "Starting a Brewery for £60,000", description: "How Wildcraft Brewing in Norfolk launched on a shoestring budget - a real look at the economics of starting small.", tag: "Careers", duration: "17:31", channel: "Bin Day Brewing Co." },
    { youtubeId: "7GXRs580bEw", title: "Inside Shepherd Neame - Britain's Oldest Brewery", description: "A deep dive into the UK's oldest brewer, exploring heritage, production, and the business of keeping a centuries-old brewery alive.", tag: "Behind the Scenes", duration: "45:11", channel: "The Craft Beer Channel" },
  ],
  cars: [
    { youtubeId: "F3FUH9fVC_M", title: "Porsche: High-Level Car Manufacturer", description: "Free Documentary's deep dive into Porsche's precision engineering and manufacturing.", tag: "Documentary", duration: "48:14", channel: "Free Documentary" },
    { youtubeId: "aGQF5RvByNE", title: "Inside BMW Dingolfing Plant - 5-Series Production", description: "How BMW builds the 5 Series from raw materials to finished car on one of Europe's largest assembly lines.", tag: "Behind the Scenes", duration: "11:46", channel: "GommeBlog" },
    { youtubeId: "C8fwWrlHe2w", title: "The Cutting-Edge Production Line Delivering Electric Cars", description: "Next-generation EV manufacturing technology and engineering across multiple brands.", tag: "Documentary", duration: "45:58", channel: "Blueprint" },
  ],
  charity: [
    { youtubeId: "AYKfdscj5Fs", title: "Fundraising Manager - Career Insights", description: "A fundraising manager shares how they got into the role, the skills needed, and what a typical day looks like.", tag: "Careers", duration: "21:37", channel: "Career Insights" },
    { youtubeId: "SD-eSy8CJTw", title: "Careers in Charities & Non-Profits - Cambridge Careers", description: "A broad introduction to working in charities: what people love, the challenges, salaries, and skills needed.", tag: "Explainer", duration: "18:40", channel: "Cambridge University Careers Service" },
    { youtubeId: "uPk8oLOPvhg", title: "A Day in My Life - The Solan Connor Fawcett Family Cancer Trust", description: "Behind the scenes at a small UK cancer charity - meeting the founder, volunteers, and the emotional reality of front-line work.", tag: "Documentary", duration: "16:18", channel: "Dean Midas Films" },
  ],
  cinema: [
    { youtubeId: "ObL2xm5NrCk", title: "Why the Era of Cheap Streaming Is Over", description: "Vox explains how the TV streaming business model shifted - from growth-at-all-costs to profitability, ads, and rising prices.", tag: "Explainer", duration: "6:40", channel: "Vox" },
    { youtubeId: "Alqt6RCEWdM", title: "How We Built a $150 Million Streaming Platform with $100,000", description: "Wendover Productions reveals how Nebula challenged Netflix and YouTube - a masterclass in the economics of TV distribution.", tag: "Documentary", duration: "28:33", channel: "Wendover Productions" },
    { youtubeId: "ILaU78Oo7XM", title: "How Streaming Caused the TV Writers Strike", description: "Vox explains how streaming residuals reshaped careers and working conditions for TV writers.", tag: "Explainer", duration: "10:32", channel: "Vox" },
    { youtubeId: "a-5aV9GWsRA", title: "TV Screenwriting 101 - BFI Future Film Festival 2025", description: "BFI masterclass on developing a TV series from character creation to crafting a pilot episode.", tag: "Careers", duration: "1:03:20", channel: "BFI" },
    { youtubeId: "VJ_kPcLAKv0", title: "Why Hollywood Is Facing a Very Unhappy Ending", description: "Bloomberg investigates the crisis gripping film and TV - layoffs, consolidation, streaming losses, and AI.", tag: "Documentary", duration: "12:21", channel: "Bloomberg Originals" },
    { youtubeId: "BKSgBu_F-Ak", title: "How a TV Producer's Job Actually Works - Waterloo Road", description: "A working BBC drama producer explains the day-to-day reality of producing episodic television.", tag: "Careers", duration: "2:18", channel: "BBC Waterloo Road" },
    { youtubeId: "VSpCSU2DyLg", title: "How I Got My Job at the BBC", description: "Three young BBC employees share how they broke into television through apprenticeships and entry-level routes.", tag: "Careers", duration: "4:12", channel: "UCAS" },
  ],
  coffee: [
    { youtubeId: "5euWenO1wNM", title: "Inside the Global Fight to Save Coffee", description: "How climate change threatens coffee production and what the industry is doing about it.", tag: "Documentary", duration: "22:19", channel: "Bloomberg Originals" },
    { youtubeId: "A0fvX-wV70Y", title: "Starbucks (with Howard Schultz)", description: "The epic story of how Starbucks became one of the most ubiquitous brands on earth.", tag: "Documentary", duration: "3:15:41", channel: "Acquired" },
    { youtubeId: "xyeYKWoKWEM", title: "How Coffee Culture Was Shaped by the Pacific Northwest", description: "The origins of modern specialty coffee culture.", tag: "Explainer", duration: "21:35", channel: "Oregon Public Broadcasting" },
  ],
  "estate-agency": [
    { youtubeId: "SrGz4NbPgto", title: "Day in the Life of an 18-Year-Old Estate Agent in London", description: "A young London estate agent shares the reality of starting a property career.", tag: "Careers", duration: "16:56", channel: "Bart Chmielecki" },
    { youtubeId: "IRP-UwClhIE", title: "UK Property Market 2026 - Opportunities, Risks & Trends", description: "Spring update covering market shifts, new builds, and what it means for agents.", tag: "Explainer", duration: "14:13", channel: "John Howard" },
  ],
  farming: [
    { youtubeId: "uyglicRCf40", title: "UK Farming Is Not Economically Sustainable", description: "NFU President Tom Bradshaw on the reality of modern British farming.", tag: "Interview", channel: "YouTube" },
  ],
  footwear: [
    { youtubeId: "73O81rxazoQ", title: "How On Running Shoes Are Taking On Nike and Adidas", description: "The Swiss brand challenging sportswear's biggest names.", tag: "Explainer", duration: "10:29", channel: "CNBC" },
    { youtubeId: "LsJJtP0Sy3M", title: "Inside Sneaker Manufacturing in the USA", description: "From rough samples to real prototypes - the art and science of making shoes.", tag: "Behind the Scenes", duration: "41:13", channel: "Pete Roberts" },
  ],
  "formula-1": [
    { youtubeId: "aDXMoTZX6a0", title: "How F1 Teams Actually Spend $350M a Year", description: "Guenther Steiner breaks down the real expenses of running a Formula 1 team.", tag: "Explainer", duration: "16:34", channel: "Driver61" },
    { youtubeId: "kkwAHpn6reo", title: "How to Become an F1 Engineer - An Insider Guide", description: "What it really takes to land an engineering role in Formula 1.", tag: "Careers", channel: "YouTube" },
    { youtubeId: "nUv72BgOEA0", title: "How to Get a Job in Formula 1: Step by Step", description: "A practical guide to F1 career paths beyond the track.", tag: "Careers", duration: "13:46", channel: "Racing Pilot" },
    { youtubeId: "iL0sVxatPf8", title: "How an Unknown Sportswear Brand Landed Red Bull & McLaren", description: "Castore's rapid rise to supplying top F1 teams.", tag: "Documentary", channel: "YouTube" },
  ],
  gaming: [
    { youtubeId: "7U_deCkLt0A", title: "The Realities of Life in Game Development", description: "Game studios discuss what it's really like to make video games professionally.", tag: "Documentary", duration: "48:18", channel: "Full Sail University" },
    { youtubeId: "Xo6RbwSrVn0", title: "How to Thrive in the Games Industry", description: "Practical career advice for aspiring game developers.", tag: "Careers", duration: "15:32", channel: "Harvey Newman" },
    { youtubeId: "P2TbHDpaD68", title: "He Helped 4,000 People Land a Job in the Games Industry", description: "Amir Satvat on building the biggest gaming career community online.", tag: "Interview", duration: "1:09:07", channel: "Harry Phokou" },
    { youtubeId: "bcZNueSDonI", title: "Game Dev 101: Studio Structure", description: "How a modern game studio is organised - from artists to producers.", tag: "Explainer", duration: "17:23", channel: "GameDev Professor" },
  ],
  grocery: [
    { youtubeId: "4DKrcpa8Z_E", title: "Inside a Warehouse Where Thousands of Robots Pack Groceries", description: "Ocado's robotic fulfilment centre - thousands of bots working a giant grid to pack online grocery orders.", tag: "Behind the Scenes", duration: "3:20", channel: "Insider Tech" },
    { youtubeId: "9Bh4OJkMANw", title: "How ALDI Wins Where Everyone Else Fails", description: "The business strategy behind Aldi's discount model - why it's so cheap and how it keeps beating traditional supermarkets.", tag: "Explainer", duration: "20:51", channel: "Micro" },
    { youtubeId: "ajuniiw2_eE", title: "Inside Ocado's AI-Powered Grocery Model", description: "A tour of Ocado's newest UK fulfilment centre and a breakdown of their automation-first approach to grocery ecommerce.", tag: "Documentary", duration: "3:37", channel: "Groceryshop" },
    { youtubeId: "aatEQRJK6ms", title: "The Business Strategies Behind McDonald's, Aldi, 7-Eleven and More", description: "WSJ breaks down the economics of fast food, grocery, and convenience - franchising, real estate, and supply chains.", tag: "Documentary", duration: "1:02:28", channel: "Wall Street Journal" },
  ],
  health: [
    { youtubeId: "tH_Jriu7XkU", title: "Day in the Life as a Doctor", description: "Ali Abdaal's real look at what life as a junior doctor involves.", tag: "Careers", duration: "5:09", channel: "Ali Abdaal" },
    { youtubeId: "ehwygP0Yw-g", title: "Day in the Life of a UK Junior Doctor (Honest Reflection)", description: "A candid look at the daily reality of working in the NHS.", tag: "Careers", channel: "YouTube" },
  ],
  "horse-racing": [
    { youtubeId: "47BPprbt0KE", title: "Jockeys: The Podcast - David Egan on Racing Life", description: "David Egan on working for Amo Racing, poker, and life as a professional jockey.", tag: "Interview", duration: "45:34", channel: "Racing TV" },
    { youtubeId: "mGyzGYk81KU", title: "The Fight for a Multi-Billion Sports Empire", description: "The staggering numbers behind Cheltenham, the governance battle threatening British racing, and what needs to change.", tag: "Documentary", duration: "29:29", channel: "Business of Sport" },
    { youtubeId: "103-Rx3N5fk", title: "A Day in the Life of a Jockey - Jonjo O'Neill Jr.", description: "Betfred follows a professional jump jockey through a full working day - from early morning riding out to race day.", tag: "Careers", duration: "11:16", channel: "Betfred" },
    { youtubeId: "oGKlmkMvwxI", title: "Racing Unfiltered - Every Detail Matters", description: "Racing Post goes behind the scenes in a Lambourn yard to show the precision and welfare focus of modern racehorse training.", tag: "Behind the Scenes", duration: "5:21", channel: "Racing Post" },
  ],
  hospitality: [
    { youtubeId: "viG8HkcWmuA", title: "The Entire History of the Hospitality Industry", description: "From ancient customs to modern hospitality - how the industry evolved.", tag: "Documentary", channel: "YouTube" },
    { youtubeId: "rx3Z8V-EKTQ", title: "Inside McDonald's: How They REALLY Run the Empire", description: "A full documentary on how McDonald's built and operates its global fast-food empire - franchising, operations, and real estate.", tag: "Documentary", duration: "44:38", channel: "Jimmy's Jobs of the Future" },
    { youtubeId: "aatEQRJK6ms", title: "The Economics of McDonald's, Aldi & More", description: "WSJ's deep dive into the business models of the world's biggest food and retail chains - franchising, supply chains, and pricing.", tag: "Documentary", duration: "1:02:28", channel: "Wall Street Journal" },
    { youtubeId: "WtLuaGxNtYM", title: "The Truth About Growing Your Career in Hospitality", description: "Will Scoffield shares his journey from assistant manager to running his own pub - the reality of hospitality career progression.", tag: "Careers", duration: "37:07", channel: "BII Workforce" },
    { youtubeId: "jIVl65y0DpY", title: "Meet the Hotel Manager - Corinthia London", description: "What it takes to run a five-star hotel - career path, daily challenges, and leadership in luxury hospitality.", tag: "Careers", duration: "5:02", channel: "Corinthia London" },
  ],
  influencing: [
    { youtubeId: "Li-6QMs9_G4", title: "How AI Is Reshaping the Creator Economy", description: "Dan Koe on how AI is changing content creation and what it means for creators' careers.", tag: "Explainer", duration: "27:57", channel: "Dan Koe" },
  ],
  "interior-design": [
    { youtubeId: "S8t0O9WlwyY", title: "The Rise of Everyday Design: The Arts and Crafts Movement", description: "How the Arts and Crafts movement shaped British design and interiors.", tag: "Documentary", channel: "YouTube" },
    { youtubeId: "5f7fHHEr_NA", title: "Abstract: The Art of Design - Ilse Crawford: Interior Design", description: "Netflix's full episode on British designer Ilse Crawford - how she designs spaces that put human wellbeing first.", tag: "Documentary", duration: "41:54", channel: "Netflix" },
    { youtubeId: "wXNkzgxc4ck", title: "Behind the Scenes in the Life of an Interior Designer", description: "Sophie Paterson shows the reality of running a luxury interiors practice - client meetings, site visits, and sourcing.", tag: "Careers", duration: "15:07", channel: "Sophie Paterson" },
    { youtubeId: "vcJLa01WFVc", title: "Life as an Interior Designer Based in London", description: "A London-based luxury designer shares site visits, fabric selections, and how she broke into the industry.", tag: "Careers", duration: "21:39", channel: "Jordan Anais" },
    { youtubeId: "q5ptHEY0I64", title: "A Day in My Life - Top 50 UK Interior Designer", description: "Noor Charchafchi walks through a typical working day as one of the UK's top-rated interior designers.", tag: "Careers", duration: "10:43", channel: "Celine Interior Design" },
    { youtubeId: "J5Syn87YuVs", title: "A Day with Sophie & Her Team - Interior Design Studio", description: "Inside a busy UK design studio - how a team collaborates on high-end residential projects.", tag: "Behind the Scenes", duration: "15:12", channel: "Sophie Paterson" },
    { youtubeId: "UyhjNdVa280", title: "The Secrets to Starting a Successful Interior Design Business", description: "Practical advice on launching and growing an interior design practice - pricing, clients, and positioning.", tag: "Explainer", duration: "25:54", channel: "IntoDesign" },
  ],
  jewellery: [
    { youtubeId: "um5rBVdOX9o", title: "How to Start a Jewellery Business in 2026", description: "Jessica Rose shares her top tips for launching a jewellery brand.", tag: "Careers", duration: "1:15:09", channel: "Jewellers Academy" },
    { youtubeId: "clOrP1PUfWQ", title: "How I Started a $3M Luxury Watch Business", description: "Inside the business of high-end timepieces.", tag: "Documentary", channel: "YouTube" },
  ],
  journalism: [
    { youtubeId: "-BpSoeGFxo4", title: "How Jeff Bezos Broke The Washington Post", description: "The Atlantic investigates what went wrong at one of America's most storied newsrooms - layoffs, leadership, and the business of news.", tag: "Documentary", duration: "31:21", channel: "The Atlantic" },
    { youtubeId: "fd4tnA7osX4", title: "Digital News Report 2025: What You Need to Know", description: "Reuters Institute authors discuss the state of news media - AI, trust, subscriptions, news avoidance, and podcasts.", tag: "Explainer", duration: "34:27", channel: "Reuters Institute" },
    { youtubeId: "0rKDo3hKbVk", title: "The Internet Didn't Fail. It Was Taken.", description: "Johnny Harris on how the internet reshaped journalism - algorithms, independent media, and the future of news.", tag: "Explainer", duration: "13:02", channel: "Johnny Harris" },
    { youtubeId: "HrU-Zi7TRi4", title: "Behind the Scenes as a TV News Reporter", description: "Come to work with a TV news reporter for a day - from the morning meeting to going live on air.", tag: "Careers", channel: "YouTube" },
    { youtubeId: "chBDvqyinT8", title: "What Does an NBC News Field Producer Do?", description: "A field producer explains the behind-the-scenes logistics of getting a news story on air.", tag: "Careers", duration: "7:37", channel: "NBCU Academy" },
    { youtubeId: "6F0g4N415uw", title: "Media Institution - Crash Course Government & Politics", description: "A fast-paced overview of how the media industry works - print, broadcast, social, and the economics of news.", tag: "Explainer", duration: "8:44", channel: "CrashCourse" },
    { youtubeId: "HGrE_hETgTA", title: "A Day in the Life of a Multimedia Journalist", description: "A working TV journalist walks through a full day - shooting, editing, and filing packages on deadline.", tag: "Careers", duration: "8:44", channel: "Julian Kolsut" },
  ],
  money: [
    { youtubeId: "zHcgMgjiRb8", title: "Realistic Day in My Life as an Investment Banker in London", description: "A 16-hour day in the life of a London investment banker.", tag: "Careers", channel: "YouTube" },
    { youtubeId: "s6k7EDNVdZQ", title: "A Day in the Life: Working at an Investment Bank", description: "Plus a practical guide to getting into investment banking.", tag: "Careers", duration: "18:12", channel: "Dean Edward" },
    { youtubeId: "L-TCjokRfWY", title: "What Auditors Actually Do - Junior Auditor Day-to-Day", description: "A Big Four auditor explains the real day-to-day work at EY, KPMG, PwC and Deloitte - graduate advice included.", tag: "Careers", duration: "9:57", channel: "Devamsha" },
    { youtubeId: "0s7HdgvSgf0", title: "Day in the Life: Working in London as a Qualified Accountant", description: "A UK-qualified accountant walks through a typical working day in London - from commute to close.", tag: "Careers", duration: "7:29", channel: "Poppy Dontree" },
    
    { youtubeId: "Wi8wNWdkdiY", title: "What Do Big 4 Consultants Actually Do?", description: "A clear breakdown of consulting roles at Deloitte, PwC, EY and KPMG - what the work looks like day to day.", tag: "Explainer", duration: "11:16", channel: "My Consulting Offer" },
    { youtubeId: "qjXgpJpSlCc", title: "Insurance Explained - How Do Insurance Companies Make Money?", description: "The Infographics Show breaks down the business model behind insurance - premiums, risk pools, and profit.", tag: "Explainer", duration: "6:57", channel: "The Infographics Show" },
    { youtubeId: "fZ-R1TQDf-E", title: "How the Lloyd's of London Market Works", description: "Lloyd's own explainer on how risk is placed in the world's leading specialist insurance market.", tag: "Explainer", duration: "1:52", channel: "Lloyd's of London" },
    { youtubeId: "GNXyX1pvfy4", title: "What Does an Insurance Broker Do? Breaking Into the Industry", description: "Tips and insights on how to start a career in insurance broking.", tag: "Careers", channel: "YouTube" },
  ],
  books: [
    { youtubeId: "sWeMjVkhhQE", title: "What Does a Book Editor Do?", description: "A look inside the day-to-day of a book editor at one of the UK's biggest publishers.", tag: "Careers", channel: "Penguin Random House UK" },
    { youtubeId: "uCsZmeydAiI", title: "Come to Work With Me... Literary Agent Edition!", description: "A day in the life of a literary agent, from submissions to deal-making.", tag: "Careers", channel: "Publishers Association" },
    { youtubeId: "Vb0gsH12hdk", title: "Getting a Job in Publishing - What Does a Literary Agent Do?", description: "Breaking down the literary agent role and how to get into publishing.", tag: "Explainer", channel: "Epic Reads" },
    { youtubeId: "2jotS_0evWM", title: "A Day in the Life of... a Waterstones Bookseller!", description: "A shift on the shop floor at Waterstones Nuneaton - what bookselling actually involves day to day.", tag: "Careers", channel: "Publishers Association" },
    { youtubeId: "R6DSbf13iio", title: "How to Become a Book Editor at Penguin Random House", description: "A working editor on how she broke into publishing and what the job really involves.", tag: "Careers", channel: "Alyssa Matesic" },
  ],
  music: [
    { youtubeId: "Nb8idwwX4Yo", title: "How Do You Do, Music?", description: "Our own podcast — going inside the music industry with the people who live it: the paths in, the graft, and how it really works.", tag: "Podcast", channel: "How Do You Do?" },
    { youtubeId: "bXDU5E2_VDc", title: "How I Earn Money in the Music Business", description: "A breakdown of royalties, advances, publishing, and how artists actually get paid.", tag: "Explainer", duration: "17:16", channel: "KARRA" },
    { youtubeId: "A6n3GkB5-kU", title: "How to Make It in the New Music Business", description: "Ari Herstand on the modern music industry and building a sustainable career.", tag: "Interview", duration: "1:25:37", channel: "One More Time Podcast" },
    { youtubeId: "nyHMgxzKa6Y", title: "Are Artist Managers More Important Than Record Labels Now?", description: "The shifting power dynamics in the modern music industry.", tag: "Explainer", channel: "YouTube" },
    { youtubeId: "XnSJwdIoR4k", title: "Music Law Essentials", description: "Key legal concepts for musicians - contracts, rights, publishing, and protecting your work in the music industry.", tag: "Explainer", channel: "BAFTA" },
  ],
  pets: [
    { youtubeId: "04WhT1D4bS8", title: "A Day in the Life of a Vet - Working at Cats Protection", description: "Senior vet Emily walks through her rounds at a UK cat centre.", tag: "Careers", duration: "5:50", channel: "Cats Protection" },
    { youtubeId: "9CiXnoCKu6U", title: "Inside the Corporate Battle Over Your Pet's Health", description: "The Fifth Estate investigates the business of veterinary care and the pet health industry.", tag: "Documentary", duration: "41:30", channel: "The Fifth Estate" },
  ],
  physiotherapy: [
    { youtubeId: "RnHsG2UV4uU", title: "A Day in the Life of a Physiotherapist UK", description: "What a typical working day looks like for a UK physiotherapist.", tag: "Careers", duration: "5:33", channel: "Days of Dan" },
    { youtubeId: "Q-GyjPzQTg4", title: "Beyond the Bench: A Pro Sports Physio's Journey", description: "Philip Andersson on building a career in professional sports physiotherapy.", tag: "Interview", duration: "40:28", channel: "Physiotutors" },
  ],
  politics: [
    { youtubeId: "ql1Rr2KS_Bc", title: "A Day in the Life of a 23-Year-Old Civil Servant (Fast Stream)", description: "What life is really like inside the Civil Service Fast Stream — the flagship graduate route into Whitehall.", tag: "Careers", channel: "Dr. Vee Kativhu" },
    { youtubeId: "AysryzEoF2k", title: "Day in the Life of a Policy & Public Affairs Officer", description: "A behind-the-scenes look at the day-to-day of working in policy and public affairs.", tag: "Careers", channel: "JustFrankie" },
    { youtubeId: "b9ryIATceT4", title: "Working in the Think Tank Sector", description: "Resolution Foundation's webinar for students on how to break into policy research and what think tank work involves.", tag: "Careers", channel: "Resolution Foundation" },
    { youtubeId: "RAMbIz3Y2JA", title: "An Introduction to Parliament", description: "The official explainer on how the UK Parliament works — the Commons, the Lords and the monarch.", tag: "Explainer", channel: "UK Parliament" },
    { youtubeId: "CfkAZnVVRjc", title: "What is Prorogation? | House of Lords", description: "A quick explainer on one of Westminster's key procedures, from the House of Lords itself.", tag: "Explainer", channel: "House of Lords" },
    { youtubeId: "5wpuqp_c1sQ", title: "Meet the Think Tanks Shaping Government Policy", description: "The New Statesman goes inside the think tanks that quietly shape UK political decisions.", tag: "Explainer", channel: "The New Statesman" },
  ],
  psychotherapy: [
    { youtubeId: "o17nmOsJWi0", title: "How to Become a CBT Therapist: Training & Qualifications", description: "The training pathway, accreditation, and what to expect as a CBT therapist in the UK.", tag: "Careers", duration: "22:35", channel: "Dr Marianne Trent" },
  ],
  teaching: [
    { youtubeId: "D5gbE4wfNKw", title: "Educating Greater Manchester - Series 1 Episode 1", description: "Award-winning fly-on-the-wall documentary following staff and students at a UK secondary school.", tag: "Documentary", duration: "46:55", channel: "Our Stories" },
    { youtubeId: "YFzD8mLh4Ho", title: "Sal Khan on AI and the Future of Education", description: "Khan Academy's founder discusses how AI is reshaping teaching and learning with Adam Grant.", tag: "Explainer", duration: "38:33", channel: "TED Audio Collective" },
    { youtubeId: "1EQYB08ArG0", title: "New Teacher Struggles at His First School", description: "A raw look at the challenges facing early-career teachers in a UK school.", tag: "Documentary", channel: "Our Stories" },
  ],
  theatre: [
    { youtubeId: "oBV8pqN4MFs", title: "Welcome to the National Theatre", description: "A look behind the scenes at the National Theatre, and who it takes to make a production for one of its three stages.", tag: "Explainer", duration: "3:48", channel: "National Theatre" },
    { youtubeId: "Cp6mXLWGF_w", title: "Backstage at the National Theatre in the hour before a play begins", description: "The hour before actors go on stage is a performance in and of itself - a real-time look at backstage life.", tag: "Documentary", duration: "30:25", channel: "Aeon Video" },
    { youtubeId: "fFqBJ0RsjX8", title: "Behind the Scenes of a West End Production - Deputy Stage Manager (DSM)", description: "A working DSM shows the technical side of calling a West End show - lighting, flies, sound, MD, pyros and SFX.", tag: "Careers", channel: "Rebs Tries It" },
    { youtubeId: "x0OIw29TyFw", title: "Behind the scenes at Disney's Frozen in the West End", description: "The hard work, dedication and skill of the many people who brought Arendelle to life on a West End stage.", tag: "Documentary", channel: "OfficialLondonTheatre" },
    { youtubeId: "V4bMY3Icme4", title: "My RADA: BA (Hons) in Acting the audition", description: "The UK's most prestigious drama school on what it's actually training actors, stage managers and technical specialists for.", tag: "Careers", channel: "RADA" },
    { youtubeId: "2GNFkxNj8m8", title: "Acting Headshots (Do's and Don'ts, How To Find Photographers, What to Wear)", description: "The practical first step for any aspiring performer - how to find a photographer, what to wear, and what casting directors actually want to see.", tag: "Careers", channel: "Makayla Lysiak" },
    { youtubeId: "qMa0vCsJSvo", title: "How To Make A Reel From Scratch", description: "Shooting your own demo reel, gathering footage from existing projects, and editing and uploading a showreel that represents your range.", tag: "Careers", channel: "Will Westwater" },
    { youtubeId: "3qFLWxkPOqQ", title: "How To Get an Acting Agent (Advice From a Signed Actress)", description: "How to approach agents and managers with no experience - what they're looking for and how auditions actually get booked once you're signed.", tag: "Careers", channel: "Makayla Lysiak" },
  ],
  travel: [
    { youtubeId: "q3F8f1dhJEA", title: "So You Want to Be a Travel Agent in 2025?", description: "What the modern travel agent role looks like and how to get started.", tag: "Careers", channel: "YouTube" },
  ],
  wellness: [
    { youtubeId: "nOvCeoD2HYs", title: "How to Start a Wellness Business: Step-by-Step Guide", description: "A practical guide for massage therapists and wellness practitioners.", tag: "Careers", duration: "57:34", channel: "AIM Wellness Education" },
    { youtubeId: "qJhcehBnzJo", title: "Day in My Life as a Personal Trainer in London", description: "Behind the scenes of training clients, meal prep and the hustle of building a fitness career.", tag: "Careers", duration: "15:22", channel: "Obi Vincent" },
  ],
  building: [
    { youtubeId: "6qTM0lbxsLE", title: "A Day in the Life of a Construction Site Manager in the UK", description: "Behind the scenes of a real day on site — from blueprints to big decisions as a construction site manager.", tag: "Careers", channel: "Construction Careers" },
    { youtubeId: "qvRql-LV2Ow", title: "How Much Does a Quantity Surveyor Earn? (2025)", description: "Salary expectations at every level of quantity surveying — from apprentice to senior QS.", tag: "Careers", channel: "QS Careers" },
    { youtubeId: "S52vWPdkWwQ", title: "Quantity Surveyor vs Building Surveyor — Which Career?", description: "The key differences between QS and building surveying roles and which path might suit you.", tag: "Explainer", channel: "Construction Careers" },
    { youtubeId: "sQxea9eTW-w", title: "Should You Become a Quantity Surveyor?", description: "An honest look at the pros and cons of a career in quantity surveying in the UK.", tag: "Interview", channel: "QS Careers" },
  ],
  fixing: [
    { youtubeId: "zwTOIYRBB9I", title: "How to Become an Electrician in the UK (2025 Guide)", description: "A comprehensive walkthrough of every route into electrical work — apprenticeships, qualifications, and earnings.", tag: "Careers", channel: "Learn Trade Skills" },
    { youtubeId: "mXVFWifyEvU", title: "A Day in the Life of an Electrician UK", description: "What a real working day looks like for a UK electrician — jobs, customers, and the trade lifestyle.", tag: "Careers", channel: "Trade Life" },
    { youtubeId: "ErUkdNkKmzo", title: "Day in the Life of a UK Plumber", description: "A self-employed UK plumber walks through a typical working day including an oil boiler replacement.", tag: "Careers", channel: "The Trades Guy" },
    { youtubeId: "yqSgI4dfT8w", title: "Is Being an Electrician Worth It in 2025?", description: "Honest take on the earnings, lifestyle, and career prospects of being an electrician in the UK right now.", tag: "Explainer", channel: "Trades Career" },
  ],
  tennis: [
    { youtubeId: "MR9xgDoN_uQ", title: "How Much Money I Lost Playing 1 Season of Pro Tennis", description: "A top-300 player breaks down the real economics of life on tour — travel costs, prize money, coaching fees, and what it actually takes to survive as a pro.", tag: "Explainer", channel: "YouTube" },
    { youtubeId: "ELMYbgmjecE", title: "Behind the Scenes at Wimbledon", description: "A rare inside look at the All England Club before the crowds arrive — the courts, players' areas, and the operation behind one of sport's greatest events.", tag: "Documentary", channel: "YouTube" },
    { youtubeId: "_ZFUhp4sWi8", title: "The Modern Tennis Coach (A Day in the Life)", description: "What a real working day looks like for a tennis coach — sessions, planning, player development, and the business of running a coaching operation.", tag: "Careers", channel: "YouTube" },
    { youtubeId: "p0DgmkI2FiE", title: "The Biggest Secret in Tennis — The Tour: A Reality Show", description: "ATP Tour's own documentary series pulling back the curtain on the business, politics, and human stories behind men's professional tennis.", tag: "Documentary", channel: "ATP Tour" },
  ],
  delivery: [
    { youtubeId: "AJbnSPvIQjE", title: "A Full Day in the Life of an HGV Driver | Amazon UK", description: "Class 1 HGV driving for Amazon UK — the early starts, long hauls, and realities of life on the road.", tag: "Careers", channel: "UK Drivers Guide" },
    { youtubeId: "jLGQUVLa8vA", title: "A Day in the Life of a UK HGV Lorry Driver", description: "Behind the wheel of an HGV — what the job really involves, day to day in the UK.", tag: "Careers", channel: "HGV Life" },
    { youtubeId: "XJqsdprXF5c", title: "Inside Ocado's Distribution Warehouse | WIRED", description: "How the world's most automated online grocery warehouse operates — robots, conveyor systems, and 65,000 orders a week.", tag: "Documentary", channel: "WIRED" },
    { youtubeId: "4DKrcpa8Z_E", title: "Inside the Warehouse Where Thousands of Robots Pack Groceries", description: "A deep dive into the technology and careers powering Britain's most advanced fulfilment operation.", tag: "Documentary", channel: "Business Insider" },
  ],
};
