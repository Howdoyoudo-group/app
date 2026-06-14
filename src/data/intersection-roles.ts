/**
 * Cross-industry intersection roles.
 *
 * Models three types of intersection:
 *   1. industry1 × industry2  — role only exists at the meeting point of two industries
 *   2. role_function × industry1 — a universal function (Marketing, Legal, Finance…) applied inside a passion industry
 *   3. skills × industry — user's skill type narrows which combinations make sense
 *
 * Used by:
 *   - MatchMe "Where your worlds collide" section (static suggestions when user has 2+ industries)
 *   - understand-me edge function (seed examples for AI intersection ideas)
 *   - MyJobs scoring (keyword boost for intersection-matching job titles)
 */

export type SkillCategory = "creative" | "people" | "digital" | "practical";

export interface IntersectionRole {
  role: string;
  blend: string;
  industry1: string;
  industry2?: string;
  role_function?: string;
  skills: SkillCategory[];
  keywords: string[];
  example_companies: string[];
  description: string;
  surprise_factor: "medium" | "high";
}

export const INTERSECTION_ROLES: IntersectionRole[] = [

  // ── Football × other industries ──────────────────────────────────────────

  {
    role: "Kit Designer",
    blend: "Football × Fashion",
    industry1: "football", industry2: "fashion",
    skills: ["creative"],
    keywords: ["kit designer", "kit design", "sportswear designer", "teamwear designer"],
    example_companies: ["Nike", "Adidas", "Puma", "New Balance", "Castore"],
    description: "Designs performance kits and training wear for football clubs and national teams.",
    surprise_factor: "high",
  },
  {
    role: "Sportswear Buyer",
    blend: "Football × Fashion",
    industry1: "football", industry2: "fashion",
    skills: ["practical", "digital"],
    keywords: ["sportswear buyer", "sport fashion buyer", "athletic apparel buyer"],
    example_companies: ["JD Sports", "Sports Direct", "Foot Locker", "Nike", "Adidas"],
    description: "Sources and buys sportswear ranges for major retailers, balancing performance and style.",
    surprise_factor: "medium",
  },
  {
    role: "Sports Journalist",
    blend: "Football × Journalism",
    industry1: "football", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["sports journalist", "football journalist", "football writer", "sports reporter", "football correspondent"],
    example_companies: ["The Athletic", "Sky Sports", "BBC Sport", "The Guardian", "talkSPORT"],
    description: "Reports on football news, interviews players and managers, and writes analysis for print or broadcast.",
    surprise_factor: "medium",
  },
  {
    role: "Football Commentator",
    blend: "Football × Journalism",
    industry1: "football", industry2: "journalism",
    skills: ["people", "creative"],
    keywords: ["football commentator", "sports commentator", "match commentator"],
    example_companies: ["Sky Sports", "BT Sport", "BBC Sport", "TNT Sports", "ITV Sport"],
    description: "Provides live match commentary and punditry for broadcast audiences.",
    surprise_factor: "medium",
  },
  {
    role: "Sports Lawyer",
    blend: "Football × Legal",
    industry1: "football", role_function: "legal",
    skills: ["people", "practical"],
    keywords: ["sports lawyer", "football lawyer", "sports solicitor", "sports legal counsel", "football legal"],
    example_companies: ["Onside Law", "Brabners", "DLA Piper Sports", "Premier League"],
    description: "Advises clubs, players and agents on contracts, transfers, disciplinary hearings and image rights.",
    surprise_factor: "high",
  },
  {
    role: "Football Club Finance Manager",
    blend: "Football × Finance",
    industry1: "football", role_function: "finance",
    skills: ["practical", "digital"],
    keywords: ["football finance", "club finance manager", "sports finance", "football financial analyst"],
    example_companies: ["Premier League clubs", "EFL clubs", "Football Association"],
    description: "Manages club finances, transfer budgets, player wage structures and FFP compliance.",
    surprise_factor: "high",
  },
  {
    role: "Fan Engagement Manager",
    blend: "Football × Marketing",
    industry1: "football", role_function: "marketing",
    skills: ["creative", "digital", "people"],
    keywords: ["fan engagement", "supporter experience", "fan experience manager", "football marketing"],
    example_companies: ["Premier League clubs", "Fanatics", "Deltatre", "Sports Interactive"],
    description: "Drives fan loyalty through digital campaigns, matchday experiences and community programmes.",
    surprise_factor: "medium",
  },
  {
    role: "Performance Data Analyst",
    blend: "Football × Data",
    industry1: "football", role_function: "digital",
    skills: ["digital", "practical"],
    keywords: ["performance analyst", "football data analyst", "sports data analyst", "football analyst"],
    example_companies: ["StatsBomb", "Opta", "Hudl", "Premier League clubs", "SportLogiq"],
    description: "Analyses player tracking and match data to inform tactical decisions and recruitment.",
    surprise_factor: "medium",
  },
  {
    role: "Esports Football Producer",
    blend: "Football × Gaming",
    industry1: "football", industry2: "gaming",
    skills: ["creative", "digital"],
    keywords: ["esports producer", "football gaming", "ea sports", "fc esports", "gaming football"],
    example_companies: ["EA Sports", "Premier League", "FIFA Esports", "Guild Esports"],
    description: "Produces esports tournaments, content and broadcasts for football gaming franchises.",
    surprise_factor: "high",
  },

  // ── Fashion × other industries ───────────────────────────────────────────

  {
    role: "Costume Designer",
    blend: "Cinema × Fashion",
    industry1: "cinema", industry2: "fashion",
    skills: ["creative"],
    keywords: ["costume designer", "costume design", "wardrobe designer", "film costume"],
    example_companies: ["Netflix", "BBC Studios", "Working Title", "Pinewood Studios"],
    description: "Creates the clothing and costumes worn by actors to bring characters to life on screen.",
    surprise_factor: "high",
  },
  {
    role: "Wardrobe Supervisor",
    blend: "Cinema × Fashion",
    industry1: "cinema", industry2: "fashion",
    skills: ["creative", "practical"],
    keywords: ["wardrobe supervisor", "wardrobe manager", "costume supervisor", "wardrobe mistress"],
    example_companies: ["BBC", "ITV Studios", "Netflix", "Film production companies"],
    description: "Manages all costume logistics on set, from sourcing and fittings to continuity across shoots.",
    surprise_factor: "medium",
  },
  {
    role: "Fashion Stylist (Music)",
    blend: "Music × Fashion",
    industry1: "music", industry2: "fashion",
    skills: ["creative"],
    keywords: ["music stylist", "artist stylist", "celebrity stylist", "tour stylist", "music video stylist"],
    example_companies: ["Sony Music", "Universal Music", "Warner Music", "talent agencies"],
    description: "Styles artists for tours, music videos, press shoots and public appearances.",
    surprise_factor: "high",
  },
  {
    role: "Virtual Fashion Designer",
    blend: "Gaming × Fashion",
    industry1: "gaming", industry2: "fashion",
    skills: ["creative", "digital"],
    keywords: ["virtual fashion", "digital fashion designer", "metaverse fashion", "avatar clothing", "nft fashion"],
    example_companies: ["RTFKT (Nike)", "Dress-X", "The Fabricant", "Roblox", "Fortnite"],
    description: "Designs digital clothing and accessories for avatars, video games and virtual worlds.",
    surprise_factor: "high",
  },
  {
    role: "Accessories Designer",
    blend: "Jewellery × Fashion",
    industry1: "jewellery", industry2: "fashion",
    skills: ["creative"],
    keywords: ["accessories designer", "jewellery designer", "accessories buyer"],
    example_companies: ["ASOS", "Topshop", "Accessorize", "Missoma", "Monica Vinader"],
    description: "Designs jewellery and accessories collections that sit at the intersection of fashion trends and fine craftsmanship.",
    surprise_factor: "medium",
  },
  {
    role: "Fashion Editor",
    blend: "Fashion × Journalism",
    industry1: "fashion", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["fashion editor", "fashion journalist", "style editor", "fashion writer", "fashion critic"],
    example_companies: ["Vogue", "Elle", "Harper's Bazaar", "The Guardian", "Condé Nast"],
    description: "Curates fashion coverage, writes trend reports and commissions shoots for print and digital publications.",
    surprise_factor: "medium",
  },
  {
    role: "Sustainable Fashion Buyer",
    blend: "Fashion × Charity/Ethics",
    industry1: "fashion", role_function: "practical",
    skills: ["practical", "digital"],
    keywords: ["sustainable fashion buyer", "ethical fashion buyer", "circular fashion", "sustainability buyer fashion"],
    example_companies: ["Patagonia", "Reformation", "ASOS", "M&S", "Selfridges"],
    description: "Sources sustainable and ethical fashion ranges, balancing environmental targets with commercial demands.",
    surprise_factor: "medium",
  },

  // ── Music × other industries ─────────────────────────────────────────────

  {
    role: "Music Supervisor",
    blend: "Music × Cinema",
    industry1: "music", industry2: "cinema",
    skills: ["creative", "people"],
    keywords: ["music supervisor", "sync licensing", "film music supervisor", "tv music supervisor"],
    example_companies: ["Music Vine", "Musicbed", "Netflix", "BBC", "Channel 4"],
    description: "Selects and licenses music for films, TV shows and advertising, working with artists and labels.",
    surprise_factor: "high",
  },
  {
    role: "Game Audio Director",
    blend: "Music × Gaming",
    industry1: "music", industry2: "gaming",
    skills: ["creative", "digital"],
    keywords: ["game audio director", "game audio", "audio director games", "game sound designer", "game composer"],
    example_companies: ["EA Games", "Ubisoft", "SEGA", "Rockstar", "CD Projekt Red"],
    description: "Leads all audio direction for video games — from sound design and music composition to implementation.",
    surprise_factor: "high",
  },
  {
    role: "Music Technologist",
    blend: "Music × Technology",
    industry1: "music", role_function: "digital",
    skills: ["digital", "creative"],
    keywords: ["music technologist", "audio software engineer", "music software developer", "music tech"],
    example_companies: ["Spotify", "Native Instruments", "Ableton", "Focusrite", "Dolby"],
    description: "Builds or improves digital audio tools, streaming platforms and music production software.",
    surprise_factor: "high",
  },
  {
    role: "Music Journalist",
    blend: "Music × Journalism",
    industry1: "music", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["music journalist", "music writer", "music critic", "music reviewer", "album reviewer"],
    example_companies: ["NME", "The Guardian Music", "Pitchfork", "BBC Music", "Mojo"],
    description: "Reviews albums and gigs, interviews artists and writes features about the music industry.",
    surprise_factor: "medium",
  },
  {
    role: "Music Royalties Analyst",
    blend: "Music × Finance",
    industry1: "music", role_function: "finance",
    skills: ["digital", "practical"],
    keywords: ["music royalties", "royalties analyst", "music rights analyst", "publishing analyst music"],
    example_companies: ["PRS for Music", "PPL", "MCPS", "Kobalt Music", "Spotify"],
    description: "Tracks, calculates and manages royalty payments across streaming, broadcast and publishing rights.",
    surprise_factor: "high",
  },
  {
    role: "Festival Brand Manager",
    blend: "Music × Beer",
    industry1: "music", industry2: "beer",
    skills: ["creative", "people", "digital"],
    keywords: ["festival brand manager", "festival marketing", "drinks brand festivals", "music festival sponsor"],
    example_companies: ["Heineken", "BrewDog", "AB InBev", "Camden Town Brewery", "Festival Republic"],
    description: "Manages drinks brand presence and sponsorship activations at music festivals and live events.",
    surprise_factor: "high",
  },

  // ── Gaming × other industries ─────────────────────────────────────────────

  {
    role: "Games Journalist",
    blend: "Gaming × Journalism",
    industry1: "gaming", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["games journalist", "gaming journalist", "games writer", "games critic", "esports journalist"],
    example_companies: ["IGN", "Eurogamer", "Edge", "Kotaku", "PC Gamer"],
    description: "Reviews games, covers the gaming industry and produces features for specialist publications.",
    surprise_factor: "medium",
  },
  {
    role: "Narrative Game Designer",
    blend: "Gaming × Cinema",
    industry1: "gaming", industry2: "cinema",
    skills: ["creative"],
    keywords: ["narrative designer", "narrative game designer", "games writer", "cinematic director games", "story designer"],
    example_companies: ["Rockstar Games", "CD Projekt Red", "Naughty Dog", "Quantic Dream"],
    description: "Writes story, dialogue and branching narratives for cinematic video game experiences.",
    surprise_factor: "high",
  },
  {
    role: "Esports Events Manager",
    blend: "Gaming × Events",
    industry1: "gaming", role_function: "people",
    skills: ["people", "practical"],
    keywords: ["esports events", "esports manager", "gaming events manager", "esports tournament"],
    example_companies: ["ESL", "Riot Games", "FaZe Clan", "Guild Esports", "Gfinity"],
    description: "Plans and runs esports tournaments, broadcasts and live gaming events worldwide.",
    surprise_factor: "medium",
  },
  {
    role: "Educational Game Designer",
    blend: "Gaming × Teaching",
    industry1: "gaming", industry2: "teaching",
    skills: ["creative", "people", "digital"],
    keywords: ["educational game designer", "edtech game", "games-based learning", "learning game developer"],
    example_companies: ["Kahoot", "Duolingo", "Minecraft Education", "BBC Learning", "Hopscotch"],
    description: "Designs games that teach — from classroom tools to consumer apps that make learning stick.",
    surprise_factor: "high",
  },
  {
    role: "Games Lawyer",
    blend: "Gaming × Legal",
    industry1: "gaming", role_function: "legal",
    skills: ["people", "practical"],
    keywords: ["games lawyer", "gaming lawyer", "esports legal", "video game legal counsel", "ip games"],
    example_companies: ["EA", "Ubisoft", "Harbottle & Lewis", "TIGA", "Wiggin LLP"],
    description: "Advises games companies on IP, licensing, player contracts and regulatory compliance.",
    surprise_factor: "high",
  },

  // ── Journalism × other industries ────────────────────────────────────────

  {
    role: "Agricultural Journalist",
    blend: "Journalism × Farming",
    industry1: "journalism", industry2: "farming",
    skills: ["creative", "digital"],
    keywords: ["agricultural journalist", "farming journalist", "rural affairs journalist", "agricultural broadcaster", "farming reporter", "rural journalist"],
    example_companies: ["Farmers Weekly", "BBC Countryfile", "The Land Worker", "Farming Today BBC"],
    description: "Reports on farming, food production and rural affairs for broadcast, print and digital audiences.",
    surprise_factor: "high",
  },
  {
    role: "Medical Journalist",
    blend: "Journalism × Health",
    industry1: "journalism", industry2: "health",
    skills: ["creative", "digital"],
    keywords: ["medical journalist", "health journalist", "science journalist", "health reporter", "health editor"],
    example_companies: ["The Lancet", "BMJ", "NHS England", "BBC Health", "Channel 4 News"],
    description: "Translates complex medical research and health policy into clear, compelling journalism.",
    surprise_factor: "medium",
  },
  {
    role: "Financial Journalist",
    blend: "Journalism × Money",
    industry1: "journalism", industry2: "money",
    skills: ["creative", "digital"],
    keywords: ["financial journalist", "city reporter", "economics journalist", "business journalist", "financial writer"],
    example_companies: ["Financial Times", "Bloomberg", "Reuters", "The Economist", "City A.M."],
    description: "Covers markets, companies and economic trends for specialist financial publications.",
    surprise_factor: "medium",
  },
  {
    role: "Travel Journalist",
    blend: "Journalism × Travel",
    industry1: "journalism", industry2: "travel",
    skills: ["creative", "digital"],
    keywords: ["travel journalist", "travel writer", "travel editor", "destination content creator"],
    example_companies: ["Condé Nast Traveller", "Lonely Planet", "The Guardian Travel", "National Geographic"],
    description: "Writes immersive destination features and travel guides for print, digital and broadcast media.",
    surprise_factor: "medium",
  },
  {
    role: "Charity Communications Manager",
    blend: "Journalism × Charity",
    industry1: "journalism", industry2: "charity",
    skills: ["creative", "people", "digital"],
    keywords: ["charity communications", "charity comms manager", "charity copywriter", "fundraising communications"],
    example_companies: ["Macmillan", "Cancer Research UK", "Oxfam", "Comic Relief", "British Red Cross"],
    description: "Tells the charity's story through campaigns, press and content that inspire people to donate and act.",
    surprise_factor: "medium",
  },
  {
    role: "Food Critic",
    blend: "Journalism × Hospitality",
    industry1: "journalism", industry2: "hospitality",
    skills: ["creative"],
    keywords: ["food critic", "restaurant critic", "food writer", "food journalist", "restaurant reviewer"],
    example_companies: ["Michelin Guide", "The Guardian", "Time Out", "Hardens", "Square Meal"],
    description: "Reviews restaurants and profiles chefs for food publications, guides and newspapers.",
    surprise_factor: "medium",
  },

  // ── Beer × other industries ───────────────────────────────────────────────

  {
    role: "Craft Beer Writer",
    blend: "Beer × Journalism",
    industry1: "beer", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["beer writer", "craft beer journalist", "beer blogger", "beer critic", "beer reviewer"],
    example_companies: ["CAMRA", "Beer Advocate", "Good Beer Hunting", "Imbibe", "Pellicle"],
    description: "Writes about craft beer culture, new releases and breweries for specialist and mainstream media.",
    surprise_factor: "high",
  },
  {
    role: "Craft Beer Brand Ambassador",
    blend: "Beer × Marketing",
    industry1: "beer", role_function: "marketing",
    skills: ["people", "creative"],
    keywords: ["beer brand ambassador", "craft beer ambassador", "drinks brand ambassador", "brewery ambassador"],
    example_companies: ["BrewDog", "Camden Town Brewery", "Beavertown", "Heineken", "AB InBev"],
    description: "Champions a brewery's brands at events, on social media and in trade settings to build loyal audiences.",
    surprise_factor: "medium",
  },
  {
    role: "Brewery Tourism Manager",
    blend: "Beer × Travel",
    industry1: "beer", industry2: "travel",
    skills: ["people", "practical"],
    keywords: ["brewery tourism", "taproom experience", "beer tourism", "brewery tour manager"],
    example_companies: ["BrewDog", "Guinness Storehouse", "Meantime Brewing", "St Austell Brewery"],
    description: "Develops and runs visitor experiences at breweries, from tap room events to international beer tours.",
    surprise_factor: "high",
  },
  {
    role: "Hop Farmer / Ingredients Buyer",
    blend: "Beer × Farming",
    industry1: "beer", industry2: "farming",
    skills: ["practical"],
    keywords: ["hop farmer", "malting manager", "agricultural buyer beer", "ingredients buyer brewing"],
    example_companies: ["Charles Faram", "Wye Hops", "Crisp Malting", "Muntons", "Simpsons Malt"],
    description: "Grows or sources the hops, malt and adjuncts that give craft beers their flavour.",
    surprise_factor: "high",
  },

  // ── Coffee × other industries ─────────────────────────────────────────────

  {
    role: "Coffee Photographer",
    blend: "Coffee × Creative",
    industry1: "coffee", role_function: "creative",
    skills: ["creative"],
    keywords: ["coffee photographer", "food photographer coffee", "coffee brand photography", "cafe photographer"],
    example_companies: ["Square Mile", "Workshop Coffee", "Caravan Coffee", "independent cafes"],
    description: "Creates visual content for specialty coffee brands — from product shots to origin trip photography.",
    surprise_factor: "high",
  },
  {
    role: "Coffee Origin Sourcing Manager",
    blend: "Coffee × Travel",
    industry1: "coffee", industry2: "travel",
    skills: ["practical", "people"],
    keywords: ["coffee origin sourcing", "green coffee buyer", "coffee sourcing manager", "coffee buyer travel"],
    example_companies: ["Union Hand-Roasted", "Hasbean", "Clifton Coffee", "Ozone Coffee", "Volcafe"],
    description: "Travels to coffee-growing regions worldwide to build direct relationships with farmers and source exceptional lots.",
    surprise_factor: "high",
  },
  {
    role: "Specialty Coffee Writer",
    blend: "Coffee × Journalism",
    industry1: "coffee", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["coffee writer", "coffee journalist", "coffee editor", "specialty coffee content"],
    example_companies: ["Sprudge", "Perfect Daily Grind", "Standart Magazine", "Imbibe"],
    description: "Writes about coffee culture, specialty trends and origin stories for passionate global audiences.",
    surprise_factor: "high",
  },

  // ── Cinema × other industries ─────────────────────────────────────────────

  {
    role: "Film Score Composer",
    blend: "Cinema × Music",
    industry1: "cinema", industry2: "music",
    skills: ["creative"],
    keywords: ["film composer", "film score composer", "screen composer", "soundtrack composer"],
    example_companies: ["Working Title", "Universal Pictures", "Abbey Road Studios", "Air Studios"],
    description: "Composes original scores and soundtracks to shape the emotional journey of a film.",
    surprise_factor: "high",
  },
  {
    role: "Film Critic",
    blend: "Cinema × Journalism",
    industry1: "cinema", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["film critic", "film journalist", "cinema journalist", "film reviewer", "entertainment journalist"],
    example_companies: ["Sight & Sound", "Empire", "Little White Lies", "The Guardian Film", "BBC Film"],
    description: "Reviews films, profiles directors and writes cultural criticism for specialist and mainstream media.",
    surprise_factor: "medium",
  },
  {
    role: "Production Designer",
    blend: "Cinema × Interior Design",
    industry1: "cinema", industry2: "interior-design",
    skills: ["creative"],
    keywords: ["production designer", "set designer", "art director film", "set decorator", "film production design"],
    example_companies: ["Netflix", "BBC Studios", "Pinewood Studios", "Warner Bros"],
    description: "Creates the visual world of a film or TV show — designing sets, locations and overall visual aesthetic.",
    surprise_factor: "high",
  },
  {
    role: "Film & TV Makeup Artist",
    blend: "Cinema × Beauty",
    industry1: "cinema", industry2: "beauty",
    skills: ["creative", "practical"],
    keywords: ["makeup artist film", "sfx makeup", "prosthetics artist", "hair and makeup film", "film beauty"],
    example_companies: ["BBC", "Netflix", "ITV", "Pinewood Studios", "independent film productions"],
    description: "Creates character looks for actors through makeup, prosthetics and hair — from period drama to sci-fi.",
    surprise_factor: "medium",
  },

  // ── Health × other industries ─────────────────────────────────────────────

  {
    role: "Digital Health Product Manager",
    blend: "Health × Technology",
    industry1: "health", role_function: "digital",
    skills: ["digital", "people"],
    keywords: ["digital health product manager", "healthtech pm", "health app product", "medical product manager"],
    example_companies: ["Babylon Health", "Livi", "Monzo Health", "BUPA Digital", "NHS Digital"],
    description: "Builds digital health products — from patient-facing apps to clinical decision-support tools.",
    surprise_factor: "high",
  },
  {
    role: "Music Therapist",
    blend: "Health × Music",
    industry1: "health", industry2: "music",
    skills: ["people", "creative"],
    keywords: ["music therapist", "music therapy", "clinical music therapist"],
    example_companies: ["NHS Trusts", "BUPA", "Nordoff & Robbins", "care homes"],
    description: "Uses music-based interventions to support mental health, rehabilitation and wellbeing in clinical settings.",
    surprise_factor: "high",
  },
  {
    role: "Healthcare Communications Manager",
    blend: "Health × Journalism",
    industry1: "health", industry2: "journalism",
    skills: ["creative", "people", "digital"],
    keywords: ["healthcare communications", "health PR", "medical communications", "pharma communications"],
    example_companies: ["GSK", "AstraZeneca", "NHS England", "NICE", "health charities"],
    description: "Manages public-facing communications, media relations and health campaigns for healthcare organisations.",
    surprise_factor: "medium",
  },

  // ── Money × other industries ──────────────────────────────────────────────

  {
    role: "Fintech Product Manager",
    blend: "Money × Technology",
    industry1: "money", role_function: "digital",
    skills: ["digital", "people"],
    keywords: ["fintech product manager", "fintech pm", "digital banking product", "payments product manager"],
    example_companies: ["Monzo", "Revolut", "Wise", "Starling Bank", "Klarna"],
    description: "Builds financial products at the intersection of banking and technology — from payments to lending platforms.",
    surprise_factor: "medium",
  },
  {
    role: "Entertainment Finance Manager",
    blend: "Money × Music",
    industry1: "money", industry2: "music",
    skills: ["practical", "digital"],
    keywords: ["entertainment finance", "music finance manager", "artist finance", "label finance"],
    example_companies: ["Sony Music", "Universal Music", "Warner Music", "PPL", "Kobalt"],
    description: "Manages financial planning, budgets and reporting for music companies, artists and touring operations.",
    surprise_factor: "high",
  },
  {
    role: "Sports Finance Analyst",
    blend: "Money × Football",
    industry1: "money", industry2: "football",
    skills: ["practical", "digital"],
    keywords: ["sports finance analyst", "football finance analyst", "club finance analyst", "sports investment"],
    example_companies: ["Premier League", "Chelsea FC", "Deloitte Sports", "KPMG Sports Advisory"],
    description: "Analyses financial performance of clubs and sporting rights for investment and valuation decisions.",
    surprise_factor: "high",
  },

  // ── Travel × other industries ─────────────────────────────────────────────

  {
    role: "Football Travel Consultant",
    blend: "Travel × Football",
    industry1: "travel", industry2: "football",
    skills: ["people", "practical"],
    keywords: ["football travel", "sports travel consultant", "football hospitality travel", "match day travel"],
    example_companies: ["Sports Travel & Hospitality", "Keith Prowse", "Gullivers Sports Travel"],
    description: "Creates premium travel and hospitality packages for football matches, tournaments and stadium tours.",
    surprise_factor: "high",
  },
  {
    role: "Luxury Travel Designer",
    blend: "Travel × Fashion",
    industry1: "travel", industry2: "fashion",
    skills: ["people", "creative"],
    keywords: ["luxury travel designer", "fashion travel", "luxury travel consultant", "bespoke travel"],
    example_companies: ["Black Tomato", "Scott Dunn", "Abercrombie & Kent", "Quintessentially Travel"],
    description: "Designs ultra-personalised travel itineraries for fashion industry clients and luxury brand partnerships.",
    surprise_factor: "high",
  },

  // ── Interior Design × other industries ────────────────────────────────────

  {
    role: "Hotel Interior Designer",
    blend: "Interior Design × Hospitality",
    industry1: "interior-design", industry2: "hospitality",
    skills: ["creative", "practical"],
    keywords: ["hotel interior designer", "hospitality designer", "restaurant designer", "hotel design"],
    example_companies: ["Soho House", "Marriott", "Firmdale Hotels", "Conran & Partners", "AvroKO"],
    description: "Designs guest experiences through interior spaces — from boutique hotels to high-end restaurant interiors.",
    surprise_factor: "medium",
  },
  {
    role: "Property Staging Specialist",
    blend: "Interior Design × Estate Agency",
    industry1: "interior-design", industry2: "estate-agency",
    skills: ["creative", "practical"],
    keywords: ["property staging", "home staging", "show home designer", "property stylist"],
    example_companies: ["Savills", "Knight Frank", "Cheshire and Mayfair", "Houzz"],
    description: "Styles properties for sale or rent to maximise their appeal and achieve higher valuations.",
    surprise_factor: "medium",
  },

  // ── Jewellery × other industries ──────────────────────────────────────────

  {
    role: "Jewellery CAD Designer",
    blend: "Jewellery × Technology",
    industry1: "jewellery", role_function: "digital",
    skills: ["creative", "digital"],
    keywords: ["jewellery cad designer", "cad jewellery", "3d jewellery designer", "rhino jewellery"],
    example_companies: ["Pandora", "De Beers", "Boodles", "Graff", "Tiffany"],
    description: "Uses CAD software to design intricate jewellery pieces before they are made or 3D printed.",
    surprise_factor: "high",
  },

  // ── Footwear × other industries ──────────────────────────────────────────

  {
    role: "Performance Footwear Designer",
    blend: "Footwear × Football",
    industry1: "footwear", industry2: "football",
    skills: ["creative", "practical"],
    keywords: ["performance footwear designer", "football boot designer", "sports footwear designer", "cleat designer"],
    example_companies: ["Nike", "Adidas", "Puma", "New Balance Football", "Mizuno"],
    description: "Designs football boots and performance footwear, balancing biomechanics, aesthetics and player feedback.",
    surprise_factor: "high",
  },
  {
    role: "Footwear Buyer",
    blend: "Footwear × Fashion",
    industry1: "footwear", industry2: "fashion",
    skills: ["practical", "digital"],
    keywords: ["footwear buyer", "shoe buyer", "trainer buyer", "footwear merchandiser"],
    example_companies: ["ASOS", "JD Sports", "Selfridges", "Net-a-Porter", "Foot Locker"],
    description: "Selects and buys footwear ranges for retailers, tracking trends and negotiating with brands.",
    surprise_factor: "medium",
  },

  // ── Horse Racing × other industries ──────────────────────────────────────

  {
    role: "Racing Correspondent",
    blend: "Horse Racing × Journalism",
    industry1: "horse-racing", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["racing correspondent", "racing journalist", "horse racing journalist", "tipster", "racing writer"],
    example_companies: ["Racing Post", "At The Races", "Sky Sports Racing", "ITV Racing"],
    description: "Covers horse racing news, form analysis and race-day reporting for broadcast and specialist media.",
    surprise_factor: "high",
  },
  {
    role: "Bloodstock Analyst",
    blend: "Horse Racing × Finance",
    industry1: "horse-racing", role_function: "finance",
    skills: ["digital", "practical"],
    keywords: ["bloodstock analyst", "bloodstock agent", "racing investment analyst", "thoroughbred analyst"],
    example_companies: ["Godolphin", "Coolmore", "Tattersalls", "Weatherbys", "Juddmonte"],
    description: "Analyses the commercial value of thoroughbred horses for sales, breeding and investment decisions.",
    surprise_factor: "high",
  },

  // ── Pets × other industries ───────────────────────────────────────────────

  {
    role: "Animal Welfare Journalist",
    blend: "Pets × Journalism",
    industry1: "pets", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["animal welfare journalist", "pet journalist", "animal journalist", "wildlife journalist"],
    example_companies: ["RSPCA", "Dogs Trust", "BBC Natural History", "The Pet Gazette"],
    description: "Investigates and reports on animal welfare, pet industry trends and wildlife conservation stories.",
    surprise_factor: "high",
  },
  {
    role: "Pet Tech Developer",
    blend: "Pets × Technology",
    industry1: "pets", role_function: "digital",
    skills: ["digital"],
    keywords: ["pet tech", "pet app developer", "animal tech product", "veterinary technology"],
    example_companies: ["Tractive", "Whistle", "Barkibu", "VetCT", "PetsApp"],
    description: "Builds apps, wearables and digital tools that help pet owners care for their animals better.",
    surprise_factor: "high",
  },

  // ── Formula 1 × other industries ─────────────────────────────────────────

  {
    role: "Motorsport Journalist",
    blend: "Formula 1 × Journalism",
    industry1: "formula-1", industry2: "journalism",
    skills: ["creative", "digital"],
    keywords: ["motorsport journalist", "f1 journalist", "formula 1 journalist", "racing journalist", "f1 correspondent"],
    example_companies: ["Autosport", "Motorsport.com", "Sky Sports F1", "BBC Sport", "The Race"],
    description: "Reports on Formula 1 and motorsport — from technical analysis to driver interviews and paddock access.",
    surprise_factor: "medium",
  },
  {
    role: "Motorsport Sponsorship Manager",
    blend: "Formula 1 × Marketing",
    industry1: "formula-1", role_function: "marketing",
    skills: ["people", "creative", "digital"],
    keywords: ["motorsport sponsorship", "f1 sponsorship", "motorsport marketing", "racing brand partnerships"],
    example_companies: ["McLaren Racing", "Red Bull Racing", "Mercedes AMG F1", "Formula 1 Group"],
    description: "Sells and manages brand sponsorship deals in F1, delivering ROI through trackside and digital activation.",
    surprise_factor: "high",
  },
  {
    role: "Automotive Software Engineer",
    blend: "Formula 1 × Technology",
    industry1: "formula-1", role_function: "digital",
    skills: ["digital", "practical"],
    keywords: ["automotive software engineer", "motorsport software", "race car software", "f1 software engineer"],
    example_companies: ["McLaren Applied", "Williams Advanced Engineering", "Red Bull Technology", "Cosworth"],
    description: "Writes software for race car control systems, telemetry, simulation and strategy tools.",
    surprise_factor: "medium",
  },

  // ── Beauty × other industries ─────────────────────────────────────────────

  {
    role: "Beauty Tech Product Designer",
    blend: "Beauty × Technology",
    industry1: "beauty", role_function: "digital",
    skills: ["creative", "digital"],
    keywords: ["beauty tech", "beauty product designer", "cosmetic tech", "beauty innovation", "virtual try-on"],
    example_companies: ["L'Oréal Tech", "Estée Lauder Innovation", "Perfect Corp", "Revieve"],
    description: "Designs digital beauty experiences — virtual try-ons, AI skin analysis, beauty devices and apps.",
    surprise_factor: "high",
  },
  {
    role: "Clinical Aesthetics Practitioner",
    blend: "Beauty × Health",
    industry1: "beauty", industry2: "health",
    skills: ["practical", "people"],
    keywords: ["aesthetic nurse", "aesthetics practitioner", "clinical aesthetics", "cosmetic nurse", "medical aesthetics"],
    example_companies: ["private clinics", "Sk:n", "The Harley Medical Group", "Transform"],
    description: "Performs clinical aesthetic treatments such as injectables and skin therapies in medical settings.",
    surprise_factor: "medium",
  },

  // ── Charity × other industries ────────────────────────────────────────────

  {
    role: "Health Charity Programme Manager",
    blend: "Charity × Health",
    industry1: "charity", industry2: "health",
    skills: ["people", "practical"],
    keywords: ["health charity programme manager", "health charity manager", "healthcare charity", "nhs charity"],
    example_companies: ["Macmillan Cancer Support", "British Heart Foundation", "Cancer Research UK", "Mind"],
    description: "Designs and delivers community health programmes, measuring impact for donors and funders.",
    surprise_factor: "medium",
  },
  {
    role: "Music Charity Director",
    blend: "Charity × Music",
    industry1: "charity", industry2: "music",
    skills: ["people", "creative"],
    keywords: ["music charity director", "music charity manager", "music for good", "music charity"],
    example_companies: ["Nordoff & Robbins", "Help Musicians", "Youth Music", "Saffron Music"],
    description: "Leads a music charity — raising funds, commissioning research and delivering music education or therapy programmes.",
    surprise_factor: "high",
  },

];

// ── Utility functions ─────────────────────────────────────────────────────────

/**
 * Returns intersection roles matching the user's industry interests.
 * A role matches if industry1 is in userIndustries (and industry2, if specified, is also in userIndustries).
 * For role_function entries (no industry2), matches on industry1 only.
 */
export function getMatchingIntersections(
  userIndustries: string[],
  userSkills: SkillCategory[] = [],
): IntersectionRole[] {
  const slugSet = new Set(userIndustries.map((i) => i.toLowerCase()));

  return INTERSECTION_ROLES.filter((ir) => {
    const i1Match = slugSet.has(ir.industry1);
    if (!i1Match) return false;
    // If there's a second industry, both must match
    if (ir.industry2 && !slugSet.has(ir.industry2)) return false;
    // If user has skills, prefer matches that use those skills (but don't exclude)
    return true;
  }).sort((a, b) => {
    // Sort: skill-matched roles first, high-surprise first
    const aSkillMatch = userSkills.length === 0 || a.skills.some((s) => userSkills.includes(s));
    const bSkillMatch = userSkills.length === 0 || b.skills.some((s) => userSkills.includes(s));
    if (aSkillMatch && !bSkillMatch) return -1;
    if (!aSkillMatch && bSkillMatch) return 1;
    if (a.surprise_factor === "high" && b.surprise_factor !== "high") return -1;
    if (b.surprise_factor === "high" && a.surprise_factor !== "high") return 1;
    return 0;
  });
}

/**
 * Returns all keywords across intersection roles that match the user's industries.
 * Used by the MyJobs scoring algorithm.
 */
export function getIntersectionKeywords(userIndustries: string[]): string[] {
  return getMatchingIntersections(userIndustries).flatMap((ir) => ir.keywords);
}
