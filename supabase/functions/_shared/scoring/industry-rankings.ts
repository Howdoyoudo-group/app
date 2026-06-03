/**
 * Industry-specific job re-ranking.
 *
 * For each industry we define:
 * - knownCompanies: companies that appear in the "Who?" section of the
 *   industry page (the brands users actually want to work at). Matching jobs
 *   get a strong positive boost.
 * - priorityTitles: regex of titles that appear on that industry's career
 *   map (the roles that genuinely belong to the industry). Boosted.
 * - deprioritise: regex of generic recruiter-noise titles that technically
 *   match the industry keyword but aren't what most people are looking for
 *   (e.g. "property manager" under Estate Agency, "kitchen porter" under
 *   Hospitality). Pushed down.
 *
 * Companies are matched as substrings (lower-cased). Titles are matched
 * with case-insensitive regexes against the job title only.
 */

export interface IndustryRanking {
  knownCompanies: string[];
  priorityTitles: RegExp;
  deprioritise: RegExp;
}

const NEVER_MATCH = /a^/; // regex that never matches anything

export const INDUSTRY_RANKINGS: Record<string, IndustryRanking> = {
  "estate-agency": {
    knownCompanies: [
      "foxtons", "savills", "knight frank", "rightmove", "zoopla", "purplebricks",
      "countrywide", "connells", "dexters", "hamptons", "jll", "cbre",
      "cushman & wakefield", "chestertons", "winkworth", "kfh",
      "kinleigh folkard & hayward", "douglas & gordon", "spicerhaart", "haart",
      "lsl property services", "leaders", "romans", "my home move", "simplify",
      "premier property lawyers", "o'neill patient", "slater and gordon",
      "jmw solicitors",
    ],
    priorityTitles: /\b(negotiator|valuer|lister|listing agent|branch manager|sales progressor|lettings|auction|new homes|conveyanc|mortgage adviser|mortgage advisor|surveyor|proptech|land manager|area director|estate agent)\b/i,
    deprioritise: /\b(block manager|property manager|estate manager|housing officer|housing manager|facilities manager|residential property manager|leasehold manager)\b/i,
  },

  fashion: {
    knownCompanies: [
      "asos", "boohoo", "burberry", "net-a-porter", "matchesfashion", "matches",
      "selfridges", "harrods", "harvey nichols", "liberty", "browns",
      "farfetch", "depop", "vinted", "marks & spencer", "m&s", "next",
      "primark", "river island", "topshop", "zara", "h&m", "uniqlo", "cos",
      "arket", "ganni", "stella mccartney", "alexander mcqueen", "victoria beckham",
      "me+em", "me+ em", "reformation", "& other stories", "mulberry",
      "barbour", "ted baker", "paul smith", "jigsaw", "whistles", "reiss",
      "anthropologie", "free people", "urban outfitters", "joseph", "the outnet",
    ],
    priorityTitles: /\b(buyer|merchandis|garment tech|pattern cutter|design assistant|fashion designer|stylist|visual merchandis|wholesale|press|pr exec|pr manager|brand|creative director|product developer|sustainability|allocator|trader|trading|head of design|womenswear|menswear|kidswear|footwear|accessories)\b/i,
    deprioritise: /\b(sales assistant|store assistant|cashier|stock room|stockroom|warehouse operative|loss prevention|cleaner|seamstress fitter|alterations tailor)\b/i,
  },

  footwear: {
    knownCompanies: [
      "nike", "adidas", "new balance", "puma", "asics", "reebok", "vans",
      "converse", "dr martens", "dr. martens", "birkenstock", "ugg", "timberland",
      "clarks", "kurt geiger", "office", "schuh", "footlocker", "foot locker",
      "jd sports", "russell & bromley", "loake", "church's", "hunter", "crocs",
      "on running", "hoka",
    ],
    priorityTitles: /\b(buyer|merchandis|product developer|footwear designer|sneaker|shoe designer|wholesale|brand|trade marketing|category|sole|last maker|cobbler|product line manager|pattern|allocator)\b/i,
    deprioritise: /\b(sales assistant|store assistant|cashier|stock room|stockroom|warehouse operative|cleaner|store manager assistant|retail associate)\b/i,
  },

  "food-drink": {
    knownCompanies: [
      "soho house", "the ivy", "hawksmoor", "dishoom", "nobu", "sexy fish",
      "sketch", "annabel's", "annabels", "mortimer house",
      "five guys", "five guys uk",
      "honest burgers", "shake shack", "gail's", "gails", "ottolenghi",
      "wagamama", "pret", "pret a manger", "leon", "itsu", "wahaca",
      "nando's", "nandos", "pizza pilgrims", "franco manca", "wright brothers",
      "the wolseley", "scott's", "j sheekey", "rick stein", "tom kerridge",
      "broadwick",
    ],
    priorityTitles: /\b(head chef|sous chef|chef de partie|pastry chef|sommelier|restaurant manager|general manager|deputy general manager|assistant manager|operations manager|food and beverage|f&b|bar manager|head bartender|reservations manager|events manager|front of house manager|maitre d|director of|brand manager|marketing manager)\b/i,
    deprioritise: /\b(kitchen porter|pot wash|dishwasher|cleaner|kitchen assistant|kp\b|commis|waiter|waitress|server\b|busser|runner)\b/i,
  },

  // NOTE: 'travel' rules (including hotels) are defined further down in this file.


  // Legacy alias - some older code paths may still reference "hospitality".
  hospitality: {
    knownCompanies: [
      "soho house", "the ivy", "hawksmoor", "dishoom", "nobu",
      "five guys", "five guys uk", "honest burgers", "shake shack",
      "marriott", "hilton", "rosewood", "the savoy", "premier inn",
    ],
    priorityTitles: /\b(head chef|sous chef|restaurant manager|general manager|hotel manager|operations manager|f&b|director of|brand manager|marketing manager)\b/i,
    deprioritise: /\b(kitchen porter|pot wash|dishwasher|housekeeper|chambermaid|cleaner|night porter)\b/i,
  },

  coffee: {
    knownCompanies: [
      "grind", "blank street", "caffe nero", "caffè nero", "costa", "starbucks",
      "pret", "pret a manger", "gail's", "gails", "joe & the juice",
      "monmouth coffee", "square mile", "workshop coffee", "ozone coffee",
      "kaffeine", "department of coffee", "allpress", "origin coffee",
      "union hand-roasted", "climpson & sons", "watch house", "rapha",
    ],
    priorityTitles: /\b(coffee buyer|head of coffee|q grader|roaster|coffee trainer|store manager|operations manager|district manager|area manager|brand manager|marketing|product developer|head of retail|wholesale|account manager|trainer)\b/i,
    deprioritise: /\b(barista|crew member|team member|cleaner|kitchen porter|dishwasher|cashier|cafe assistant)\b/i,
  },

  bakery: {
    knownCompanies: [
      "gail's", "gails", "greggs", "pret", "pret a manger", "paul",
      "le pain quotidien", "ole & steen", "fabrique", "the dusty knuckle",
      "e5 bakehouse", "st john bakery", "paul rhodes bakery", "bread ahead",
      "pophams", "the hummingbird bakery", "lola's cupcakes", "honey & co",
      "warburtons", "hovis", "kingsmill", "allied bakeries",
    ],
    priorityTitles: /\b(head baker|production baker|pastry chef|bakery manager|head of bakery|operations|district manager|area manager|wholesale|new product development|npd|food technologist|brand manager|marketing|category)\b/i,
    deprioritise: /\b(bakery assistant|cleaner|kitchen porter|cashier|crew member|team member|night packer|warehouse operative)\b/i,
  },

  beer: {
    knownCompanies: [
      "beavertown", "camden town brewery", "brewdog", "fuller's", "fullers",
      "young's", "youngs", "shepherd neame", "thornbridge", "verdant",
      "northern monk", "cloudwater", "five points", "magic rock",
      "the kernel", "deya", "siren craft", "wild beer", "innis & gunn",
      "diageo", "carlsberg", "molson coors", "heineken", "asahi", "budweiser",
      "stone brewing", "guinness", "hawkstone",
    ],
    priorityTitles: /\b(head brewer|brewer|cellarperson|production manager|quality manager|brand manager|trade marketing|on-trade|off-trade|key account|national account|sales manager|brewery manager|operations manager|distillery)\b/i,
    deprioritise: /\b(bar staff|bartender|waiter|waitress|cleaner|kitchen porter|warehouse operative|delivery driver|merchandiser)\b/i,
  },

  cinema: {
    knownCompanies: [
      "netflix", "amazon prime", "amazon mgm", "disney", "warner bros",
      "warner brothers", "universal", "paramount", "sony pictures", "a24",
      "bbc films", "bbc studios", "channel 4", "film4", "bfi", "working title",
      "see-saw films", "pathé", "pathe", "studiocanal", "everyman", "curzon",
      "picturehouse", "vue", "odeon", "cineworld", "imax", "lionsgate",
      "focus features", "searchlight",
    ],
    priorityTitles: /\b(producer|director|cinematographer|editor|film editor|colourist|colorist|sound designer|production manager|line producer|development executive|commissioning|distribution|programmer|projectionist|festival|acquisitions|scheduler|publicist|press|marketing|brand|head of)\b/i,
    deprioritise: /\b(cinema host|usher|concession|cleaner|crew member|team member|cashier|popcorn|ticketing assistant)\b/i,
  },

  music: {
    knownCompanies: [
      "spotify", "apple music", "youtube music", "tidal", "soundcloud",
      "universal music", "sony music", "warner music", "warner records",
      "polydor", "island records", "atlantic records", "columbia records",
      "rca", "domino", "ninja tune", "xl recordings", "rough trade",
      "beggars group", "secretly group", "ditto music", "kobalt", "bmg",
      "live nation", "aeg presents", "broadwick", "festival republic",
      "academy music group", "dice", "ticketmaster", "resident advisor",
    ],
    priorityTitles: /\b(a&r|artist manager|tour manager|label manager|product manager|marketing manager|brand|sync|publishing|royalt|music supervisor|booker|booking agent|promoter|festival|programmer|head of|press|pr exec|pr manager|playlist|editorial)\b/i,
    deprioritise: /\b(security|steward|bar staff|bartender|cleaner|crew\b|stagehand|merchandise seller|ticket scanner|usher|warehouse operative)\b/i,
  },

  football: {
    knownCompanies: [
      "premier league", "english football league", "efl", "the fa", "uefa",
      "fifa", "manchester united", "manchester city", "liverpool", "chelsea",
      "arsenal", "tottenham", "tottenham hotspur", "newcastle united",
      "aston villa", "west ham", "everton", "brighton", "crystal palace",
      "fulham", "wolves", "leicester city", "leeds united",
      "sky sports", "tnt sports", "bt sport", "dazn", "espn",
      "nike", "adidas", "puma", "umbro", "castore", "kitbag", "fanatics",
      "stats perform", "opta", "wyscout", "transfermarkt", "the athletic",
    ],
    priorityTitles: /\b(commercial|sponsorship|partnerships|broadcast|media rights|marketing|brand|content|social media|digital|data analyst|performance analyst|scout|recruitment analyst|academy|head of|director of|operations manager|matchday|hospitality manager|finance|legal|esg)\b/i,
    deprioritise: /\b(steward|security|cleaner|catering assistant|kit man|groundsman|ticket office|matchday casual|hospitality waiter|bar staff)\b/i,
  },

  charity: {
    knownCompanies: [
      "save the children", "oxfam", "british red cross", "cancer research uk",
      "macmillan", "marie curie", "mind", "samaritans", "shelter", "barnardo's",
      "barnardos", "nspcc", "wwf", "rspb", "national trust", "english heritage",
      "amnesty", "unicef", "the trussell trust", "comic relief",
      "crisis", "centrepoint", "stonewall", "scope", "age uk", "alzheimer's society",
      "alzheimers society", "british heart foundation", "rnli", "guide dogs",
      "teach first", "the king's trust", "kings trust", "the prince's trust", "princes trust",
    ],
    priorityTitles: /\b(fundraising|fundraiser|major donor|trusts and foundations|legacy|individual giving|campaigns|policy|advocacy|programme manager|programmes manager|head of|director of|communications|press|pr exec|pr manager|brand|marketing|impact|monitoring and evaluation|partnerships)\b/i,
    deprioritise: /\b(charity shop assistant|shop volunteer|retail assistant|street fundraiser|face to face fundraiser|f2f|door to door|warehouse operative|cleaner|driver)\b/i,
  },

  "interior-design": {
    knownCompanies: [
      "tom dixon", "soho home", "the conran shop", "heal's", "heals",
      "made.com", "loaf", "habitat", "john lewis", "liberty",
      "kelly hoppen", "martin brudnizki", "rose uniacke", "studio ashby",
      "studioilse", "ilse crawford", "david collins studio", "yabu pushelberg",
      "farrow & ball", "little greene", "designers guild", "house of hackney",
      "porta romana", "vaughan designs", "andrew martin", "fromental",
      "dedar", "kvadrat", "pierre frey", "armani casa", "minotti", "b&b italia",
      "molteni", "cassina", "vitra", "knoll", "fritz hansen", "carl hansen",
      "muuto", "&tradition", "hay", "ferm living",
    ],
    priorityTitles: /\b(interior designer|interior architect|junior designer|senior designer|design director|fit out|ffe|specification|project designer|set designer|creative director|head of design|design manager|colour consultant|materials library|sample library)\b/i,
    deprioritise: /\b(showroom assistant|sales assistant|warehouse operative|driver|fitter|installer|painter decorator|labourer|cleaner)\b/i,
  },

  gaming: {
    knownCompanies: [
      "rockstar", "rockstar games", "ubisoft", "ea", "electronic arts",
      "activision blizzard", "activision", "blizzard", "sony interactive",
      "playstation", "xbox", "microsoft xbox", "nintendo", "epic games",
      "riot games", "valve", "bungie", "naughty dog", "rare", "playground games",
      "creative assembly", "sumo digital", "sega", "square enix", "capcom",
      "bandai namco", "konami", "cd projekt", "embracer group", "supercell",
      "king", "king games", "zynga", "miniclip", "frontier developments",
      "mediatonic", "dice (sports app)",
    ],
    priorityTitles: /\b(game designer|level designer|game programmer|gameplay programmer|engine programmer|3d artist|technical artist|character artist|environment artist|narrative designer|producer|game producer|qa lead|qa tester|community manager|esports|live ops|monetisation|user acquisition|product manager|marketing manager|brand)\b/i,
    deprioritise: /\b(retail assistant|store assistant|customer service|warehouse operative|moderator entry|playtest casual|test centre)\b/i,
  },

  grocery: {
    knownCompanies: [
      "tesco", "sainsbury's", "sainsburys", "asda", "morrisons", "waitrose",
      "ocado", "marks & spencer food", "m&s food", "lidl", "aldi", "co-op",
      "the co-operative", "iceland", "whole foods", "amazon fresh",
      "deliveroo", "uber eats", "gopuff", "getir", "gorillas",
      "mindful chef", "gousto", "hellofresh", "abel & cole", "riverford",
      "borough market", "harrods food hall",
    ],
    priorityTitles: /\b(buyer|category manager|merchandis|trading manager|supply chain manager|brand manager|marketing|product developer|food technologist|npd|new product development|quality manager|store manager|area manager|operations manager|head of|director of|ecommerce|digital|data analyst)\b/i,
    deprioritise: /\b(checkout|till operator|cashier|shelf stacker|night replenishment|warehouse operative|picker|packer|delivery driver|cleaner|customer assistant|store assistant)\b/i,
  },

  jewellery: {
    knownCompanies: [
      "tiffany", "tiffany & co", "cartier", "bulgari", "van cleef",
      "van cleef & arpels", "boodles", "graff", "harry winston", "chopard",
      "buccellati", "pragnell", "garrard", "asprey", "mappin & webb",
      "goldsmiths", "ernest jones", "h. samuel", "beaverbrooks", "fraser hart",
      "monica vinader", "missoma", "astrid & miyu", "astley clarke",
      "alighieri", "annoushka", "stephen webster", "shaun leane", "links of london",
      "pandora", "swarovski",
    ],
    priorityTitles: /\b(buyer|merchandis|gemmologist|gemologist|jewellery designer|jewelry designer|goldsmith|silversmith|stone setter|polisher|workshop manager|brand manager|marketing|press|pr|store manager|client advisor|sales advisor|valuations|head of|director of|product developer)\b/i,
    deprioritise: /\b(security guard|cleaner|warehouse operative|delivery driver|stock room|stockroom|polisher entry|sales assistant)\b/i,
  },

  journalism: {
    knownCompanies: [
      "bbc", "the times", "the sunday times", "the guardian", "the observer",
      "the telegraph", "the daily telegraph", "the financial times", "ft",
      "reuters", "bloomberg", "associated press", "the economist", "vogue",
      "tatler", "monocle", "wallpaper", "wired", "vice", "the new york times",
      "the wall street journal", "wsj", "channel 4 news", "itn", "sky news",
      "news uk", "dmg media", "daily mail", "metro", "i news",
      "the spectator", "the new statesman", "prospect", "private eye",
      "tortoise", "the athletic", "buzzfeed", "huffpost",
    ],
    priorityTitles: /\b(journalist|reporter|correspondent|news editor|editor|sub editor|sub-editor|copy editor|features editor|chief reporter|investigations|producer|news producer|senior producer|content editor|digital editor|columnist|writer|head of|director of|commissioning|video journalist|broadcast journalist|fact checker)\b/i,
    deprioritise: /\b(distribution|delivery driver|warehouse operative|advertising sales|sales assistant|telesales|moderator entry|admin assistant)\b/i,
  },

  pets: {
    knownCompanies: [
      "pets at home", "vets4pets", "ivc evidensia", "cvs group", "medivet",
      "linnaeus", "tails.com", "butternut box", "lily's kitchen", "lilys kitchen",
      "burns pet nutrition", "natures menu", "natures:menu", "barking heads",
      "harringtons", "wagg foods", "battersea dogs and cats", "dogs trust",
      "rspca", "blue cross", "pdsa", "cats protection",
    ],
    priorityTitles: /\b(veterinary surgeon|vet\b|head vet|clinical director|practice manager|vet nurse registered|registered veterinary nurse|rvn|head nurse|head of|director of|product developer|brand manager|marketing|category|buyer)\b/i,
    deprioritise: /\b(dog walker|pet sitter|kennel assistant|cattery assistant|grooming assistant|reception|veterinary care assistant|vca|store assistant|warehouse operative)\b/i,
  },

  physiotherapy: {
    knownCompanies: [
      "nuffield health", "bupa", "spire healthcare", "hca healthcare",
      "circle health", "ramsay health care", "the london clinic",
      "physio.co.uk", "ascenti", "connect health", "pure sports medicine",
      "mlc physio", "the chelsea consulting rooms", "the wellington hospital",
      "the princess grace hospital", "the portland hospital",
      "the english institute of sport", "british olympic association",
      "premier league clubs", "england rugby", "lawn tennis association",
    ],
    priorityTitles: /\b(physiotherapist|physio\b|senior physiotherapist|specialist physiotherapist|clinical lead|head of physiotherapy|musculoskeletal|msk|sports physiotherapist|rehabilitation lead|head of|director of|practice manager)\b/i,
    deprioritise: /\b(physio assistant|rehabilitation assistant|healthcare assistant|hca\b|reception|admin assistant|massage therapist|sports massage therapist)\b/i,
  },

  psychotherapy: {
    knownCompanies: [
      "the priory", "priory group", "nuffield health", "bupa", "spire healthcare",
      "tavistock", "the tavistock and portman", "the maudsley", "south london and maudsley",
      "the anna freud centre", "british association for counselling and psychotherapy",
      "bacp", "ukcp", "bps", "british psychological society", "headspace",
      "calm", "talkspace", "betterhelp", "spill", "unmind", "kooth",
      "place2be", "mind", "samaritans", "young minds",
    ],
    priorityTitles: /\b(psychotherapist|counsellor|counselor|clinical psychologist|counselling psychologist|counseling psychologist|cbt therapist|cognitive behavioural therapist|systemic therapist|art therapist|child psychotherapist|head of|clinical lead|director of|practice manager)\b/i,
    deprioritise: /\b(support worker|mental health support worker|healthcare assistant|reception|admin assistant|peer support|recovery worker entry)\b/i,
  },

  teaching: {
    knownCompanies: [
      "teach first", "ark schools", "harris federation", "united learning",
      "outwood grange academies trust", "oasis community learning", "e-act",
      "academies enterprise trust", "reach academy", "dixons academies trust",
      "star academies", "the king's college school", "westminster school",
      "eton college", "harrow school", "winchester college", "st paul's school",
      "city of london school", "highgate school", "north london collegiate",
      "wellington college", "marlborough college", "rugby school", "charterhouse",
      "department for education", "ofsted", "education endowment foundation",
    ],
    priorityTitles: /\b(teacher|head of department|head of year|deputy head|head teacher|headteacher|principal|assistant principal|vice principal|sendco|senco|director of|head of curriculum|lead practitioner|teaching and learning|early careers teacher|ect\b|nqt|subject lead|key stage)\b/i,
    deprioritise: /\b(teaching assistant|ta\b|cover supervisor|midday supervisor|lunchtime supervisor|exam invigilator|invigilator|sports coach casual|after school club assistant|caretaker|cleaner)\b/i,
  },

  travel: {
    knownCompanies: [
      "british airways", "virgin atlantic", "easyjet", "ryanair", "jet2",
      "tui", "jet2holidays", "expedia", "booking.com", "airbnb",
      "trainline", "national rail", "eurostar",
      "marriott", "hilton", "rosewood", "claridge's", "the savoy", "the dorchester",
      "the connaught", "the langham", "edition", "ace hotel", "the standard",
      "soho house", "premier inn", "travelodge", "ihg", "intercontinental",
      "accor", "four seasons", "mandarin oriental", "shangri-la", "raffles",
      "hyatt", "kempinski", "belmond", "small luxury hotels",
      "lonely planet", "kuoni", "trailfinders", "audley travel",
      "abercrombie & kent", "scott dunn", "secret escapes", "loveholidays",
      "on the beach", "trip.com", "skyscanner", "kayak",
    ],
    priorityTitles: /\b(travel consultant|hotel manager|general manager|deputy general manager|product manager|destination manager|tour operator|operations manager|revenue manager|commercial manager|marketing manager|brand|product developer|partnerships|head of|director of|cabin crew manager|crew planning|customer experience manager|guest experience|concierge manager|spa manager|trade marketing|reservations manager)\b/i,
    deprioritise: /\b(cabin crew|flight attendant|ground staff|baggage handler|check in agent|check-in agent|customer service agent|coach driver|tour rep|reservations agent|housekeeper|chambermaid|night porter|cleaner)\b/i,
  },

  wellness: {
    knownCompanies: [
      "psycle", "barry's", "barrys bootcamp", "f45", "third space",
      "equinox", "soulcycle", "1rebel", "rumble", "kobox", "bxr",
      "blok london", "nuffield health", "virgin active", "david lloyd",
      "pure gym", "puregym", "the gym group", "fitness first", "lululemon",
      "alo yoga", "sweaty betty", "gymshark", "headspace", "calm", "peloton",
      "the class", "frame", "triyoga", "yotopia", "core collective",
      "neville hair and beauty", "neville", "cowshed", "the now massage",
      "champneys", "the lanesborough club & spa", "akasha", "espa",
    ],
    priorityTitles: /\b(head of|director of|brand manager|marketing manager|product manager|operations manager|studio manager|general manager|trainer manager|head of fitness|head of programming|wellness director|spa director|head therapist|partnerships|head of retail|category)\b/i,
    deprioritise: /\b(personal trainer entry|gym instructor|class instructor casual|receptionist|spa receptionist|cleaner|locker attendant|nail technician|beauty therapist entry|massage therapist entry)\b/i,
  },
};

/**
 * Returns the ranking score adjustment for a job within an industry.
 * Positive = boost, negative = deprioritise, 0 = neutral / no rules.
 */
export function getIndustryRankBoost(
  industrySlug: string | null | undefined,
  title: string | null | undefined,
  company: string | null | undefined,
): number {
  if (!industrySlug) return 0;
  const slug = industrySlug.toLowerCase().trim().replace(/\s+/g, "-");
  const rules = INDUSTRY_RANKINGS[slug];
  if (!rules) return 0;

  const lowerTitle = (title || "").toLowerCase();
  const lowerCompany = (company || "").toLowerCase();
  let score = 0;

  if (rules.deprioritise && rules.deprioritise.test(lowerTitle)) score -= 3;
  if (rules.priorityTitles && rules.priorityTitles.test(lowerTitle)) score += 2;
  if (rules.knownCompanies.some((c) => lowerCompany.includes(c))) score += 3;

  return score;
}

/** Lower-case industry slug used as map keys. */
export function normaliseIndustrySlug(industry: string | null | undefined): string {
  return (industry || "").toLowerCase().trim().replace(/\s+/g, "-");
}
