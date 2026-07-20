import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Known company → correct industry mapping ────────────────────────
// If a company appears here, it MUST be tagged with this industry
const COMPANY_INDUSTRY_MAP: Record<string, string> = {
  // Fashion / lingerie - NOT grocery
  "ann summers": "fashion",
  "victoria's secret": "fashion",
  "agent provocateur": "fashion",
  // Grocery
  "tesco": "grocery",
  "sainsbury": "grocery",
  "asda": "grocery",
  "waitrose": "grocery",
  "ocado": "grocery",
  "aldi": "grocery",
  "lidl": "grocery",
  "morrisons": "grocery",
  "m&s food": "grocery",
  "co-op food": "grocery",
  "booker group": "grocery",
  "booker wholesale": "grocery",
  "makro": "grocery",
  // Beauty (cosmetics, skincare, fragrance) - these were leaking into grocery
  "l'oréal": "beauty",
  "l'oreal": "beauty",
  "loreal": "beauty",
  "estée lauder": "beauty",
  "estee lauder": "beauty",
  "rituals": "beauty",
  "the body shop": "beauty",
  "lush retail": "beauty",
  "molton brown": "beauty",
  "jo malone": "beauty",
  "charlotte tilbury": "beauty",
  "space nk": "beauty",
  "sephora": "beauty",
  "boots uk": "beauty",
  "superdrug": "beauty",
  "mac cosmetics": "beauty",
  "benefit cosmetics": "beauty",
  "clinique": "beauty",
  "clarins": "beauty",
  "shiseido": "beauty",
  "bobbi brown": "beauty",
  "urban decay": "beauty",
  "nars cosmetics": "beauty",
  "elemis": "beauty",
  "liz earle": "beauty",
  "aesop": "beauty",
  "glossier": "beauty",
  "morphe": "beauty",
  "revolution beauty": "beauty",
  "cult beauty": "beauty",
  "feelunique": "beauty",
  "lookfantastic": "beauty",
  "thg beauty": "beauty",
  // Fashion / apparel - these were leaking into grocery
  "peacocks": "fashion",
  "primark": "fashion",
  "next plc": "fashion",
  "river island": "fashion",
  "h&m": "fashion",
  "zara": "fashion",
  "uniqlo": "fashion",
  // Coffee
  "starbucks": "coffee",
  "costa coffee": "coffee",
  "caffe nero": "coffee",
  "pret a manger": "coffee",
  // Cinema
  "netflix": "cinema",
  "warner bros": "cinema",
  "universal pictures": "cinema",
  "disney": "cinema",
  "paramount": "cinema",
  "sony pictures": "cinema",
  "lionsgate": "cinema",
  "framestore": "cinema",
  "vue": "cinema",
  "curzon": "cinema",
  // Estate agency
  "foxtons": "estate-agency",
  "savills": "estate-agency",
  "knight frank": "estate-agency",
  "rightmove": "estate-agency",
  "zoopla": "estate-agency",
  "purplebricks": "estate-agency",
  "dexters": "estate-agency",
  "winkworth": "estate-agency",
  "hamptons": "estate-agency",
  "connells": "estate-agency",
  // Football
  "premier league": "football",
  "manchester united": "football",
  "liverpool fc": "football",
  "arsenal": "football",
  "chelsea fc": "football",
  "tottenham hotspur": "football",
  // Beer - Diageo intentionally excluded as it spans beer + food-drink
  "brewdog": "beer",
  "heineken": "beer",
  "molson coors": "beer",
  "ab inbev": "beer",
  // Pets / animal welfare
  "pets at home": "pets",
  "vets4pets": "pets",
  "medivet": "pets",
  "battersea": "pets",
  "blue cross": "pets",
  "pdsa": "pets",
  "jollyes": "pets",
  "butternut box": "pets",
  "lily's kitchen": "pets",
  "ivc evidensia": "pets",
  "rspca": "pets",
  "dogs trust": "pets",
  "cats protection": "pets",
  "wood green": "pets",
  "mayhew animal": "pets",
  "world horse welfare": "pets",
  "redwings horse sanctuary": "pets",
  "international cat care": "pets",
  "guide dogs": "pets",
  "hearing dogs": "pets",
  "canine partners": "pets",
  // Travel
  "betterhomes": "estate-agency",
  // Cars / automotive - Tesla was leaking into grocery via Adzuna
  "tesla": "cars",
  "ford": "cars",
  "vauxhall": "cars",
  "bmw": "cars",
  "mercedes-benz": "cars",
  "audi": "cars",
  "volkswagen": "cars",
  "jaguar land rover": "cars",
  "stellantis": "cars",
  "toyota": "cars",
  "honda": "cars",
  "nissan": "cars",
  "kwik fit": "cars",
  "halfords autocentres": "cars",
  // Medical / healthcare device makers - keep out of cinema (Fujifilm Healthcare,
  // Fujifilm Medical etc were leaking in because the parent name contains "film")
  "fujifilm healthcare": "tech",
  "fujifilm medical": "tech",
  "fujifilm diosynth": "tech",
  // Politics / government - central departments, Parliament, regulators, think tanks
  "cabinet office": "politics",
  "hm treasury": "politics",
  "home office": "politics",
  "foreign, commonwealth & development office": "politics",
  "foreign commonwealth development office": "politics",
  "ministry of defence": "politics",
  "ministry of justice": "politics",
  "department for education": "politics",
  "department of health and social care": "politics",
  "department for transport": "politics",
  "department for business and trade": "politics",
  "department for work and pensions": "politics",
  "hmrc": "politics",
  "hm revenue": "politics",
  "department for energy security": "politics",
  "department for science, innovation": "politics",
  "ministry of housing, communities": "politics",
  "uk parliament": "politics",
  "house of commons": "politics",
  "house of lords": "politics",
  "scottish parliament": "politics",
  "welsh parliament": "politics",
  "senedd": "politics",
  "northern ireland assembly": "politics",
  "office for national statistics": "politics",
  "national crime agency": "politics",
  "national audit office": "politics",
  "electoral commission": "politics",
  "office for budget responsibility": "politics",
  "companies house": "politics",
  "government digital service": "politics",
  "local government association": "politics",
  "institute for public policy research": "politics",
  "institute of economic affairs": "politics",
  "centre for policy studies": "politics",
  "institute for government": "politics",
  "resolution foundation": "politics",
  "policy exchange": "politics",
  // Additional confirmed regulators/agencies/departments (found via live scrape
  // data - any genuine job at these bodies is a real government career,
  // regardless of the specific title, mirroring how e.g. Nike jobs all count
  // as footwear even when the title itself doesn't mention shoes)
  "ofgem": "politics",
  "ofcom": "politics",
  "health and safety executive": "politics",
  "environment agency": "politics",
  "crown commercial service": "politics",
  "national archives": "politics",
  "defence infrastructure organisation": "politics",
  "defence nuclear enterprise": "politics",
  "ai security institute": "politics",
  "scottish prison service": "politics",
  "natural resources wales": "politics",
  "national museums scotland": "politics",
  "medicines and healthcare products regulatory agency": "politics",
  "intellectual property office": "politics",
  "defence equipment and support": "politics",
  "northern ireland office": "politics",
  // Theatre - major companies/venues that should always tag as theatre
  // regardless of a generic job title (finance, HR, marketing etc.)
  "national theatre": "theatre",
  "royal shakespeare company": "theatre",
  "royal court theatre": "theatre",
  "ambassador theatre group": "theatre",
  "atg entertainment": "theatre",
  "lw theatres": "theatre",
  "delfont mackintosh": "theatre",
  "sonia friedman productions": "theatre",
  "nimax theatres": "theatre",
  "donmar warehouse": "theatre",
  "bristol old vic": "theatre",
  "chichester festival theatre": "theatre",
  "sheffield theatres": "theatre",
  "birmingham rep": "theatre",
  "royal exchange theatre": "theatre",
  "glyndebourne": "theatre",
  "production resource group": "theatre",
  "white light": "theatre",
  "rada": "theatre",
};

// ── Negative keywords: titles that should NEVER appear in an industry ──
const INDUSTRY_TITLE_BLOCKLIST: Record<string, RegExp> = {
  cinema: /\b(care assistant|care worker|carer|nurse|nursing|social worker|support worker|domiciliary|live.in care|healthcare|endoscopy|radiograph|sonograph|medical imaging|hospital|tesla|automotive|vehicle technician|service technician|solar|megapack|powerwall|test driver|dealership|service advisor|parts advisor)\b/i,
  grocery: /\b(lingerie|apparel|intimates|adult|sex|swimwear|toolstation|screwfix|b&q|homebase|wickes|dunelm|ikea|halfords|pets at home|cosmetic|skincare|fragrance|perfume|makeup|beauty advisor|sales advisor|peacocks|rituals|l'oreal|l'oréal|loreal|sushi chef|sushi)\b/i,
  football: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare)\b/i,
  beer: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare)\b/i,
  coffee: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|butcher|butchery|hgv|forklift|warehouse|picker|replenishment|branch assistant|wholesale)\b/i,
  music: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare)\b/i,
  teaching: /\b(plumber|electrician|welder|forklift|hgv|driver|paralegal|solicitor|barrister|legal counsel|swim|swimming|swim school|lifeguard|marketing executive|marketing manager|marketing assistant|sales executive|recruitment consultant|estate agent|nurse|nursing|care assistant|support worker|psychologist|aspiring child|psychology graduate|software engineer|cyber)\b/i,
  pets: /\b(lecturer|fe teacher|further education|btec|examiner|teacher of|sen teacher|primary teacher|secondary teacher|teaching assistant|tutor|cyber security|cybersecurity|software engineer|java developer|devops|sap consultant|hgv|forklift)\b/i,
  farming: /\b(uber|drive with uber|driver account|deliveroo|just eat courier|amazon flex|care assistant|care worker|carer|support worker|nurse|nursing|social worker|lawyer|solicitor|paralegal|barrister|legal counsel|legal secretary|legal assistant|head of prosecutions|prosecutor|conveyancer|compliance officer|export compliance|counsellor|counselor|psychotherapist|hgv class|delivery driver|courier|warehouse operative|forklift|cleaner|housekeep|draughtsperson|draughtsman|draftsman|cad technician|architectural technician|refrigeration|electrician|plumber|cyber security|software engineer)\b/i,
  gaming: /\b(care assistant|nurse|cyber security|investment banker|risk analyst|compliance officer|insurance|mortgage|conveyancer|estate agent|chef|barista|hgv|forklift|warehouse operative|electrician|plumber|teacher|social worker|civil engineer|structural engineer|mechanical engineer|wind turbine|nuclear|grid|substation|kafka engineer|java developer|spring boot|.net developer|salesforce|sap|oracle dba|workday|servicenow)\b/i,
  "interior-design": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|forklift|warehouse operative)\b/i,
  "estate-agency": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|forklift|warehouse operative)\b/i,
  "food-drink": /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|forklift|wind turbine|gas turbine|power plant|substation|transmission|grid|hvdc|nuclear|electrical engineer|commissioning specialist|wams|epc)\b/i,
  hospitality: /\b(care assistant|nurse|nursing|social worker|support worker|healthcare|forklift|wind turbine|gas turbine|power plant|substation|transmission|grid|hvdc|nuclear|electrical engineer|commissioning specialist|wams|epc)\b/i,
  travel: /\b(estate agent|real estate agent|lettings negotiator|property valuer|conveyancer|mortgage adviser)\b/i,
  cars: /\b(warehouse operative|warehouse manager|warehouse supervisor|3pl|third.party logistics|logistics coordinator|logistics manager|logistics administrator|transport coordinator|transport planner|transport administrator|freight coordinator|freight manager|haulage|pallet|forklift|class 1 driver|class 2 driver|hgv driver|lgv driver|tramper driver|night trunk|delivery driver|multi.?drop driver|van driver|courier driver|last mile|parcel operative|picker packer|fulfilment operative|distribution operative|care assistant|nurse|nursing|social worker|support worker|healthcare|cook|chef|catering|barista|bartender|waiter|waitress)\b/i,
  // "policy" alone would catch insurance/HR/warranty "policy" roles - block the
  // most common false-positive title patterns that slip through that word.
  politics: /\b(insurance policy|policy holder|warranty policy|hr policy administrator|return policy|returns policy|policy document|policy wording|underwrit)\b/i,
};

// ── Placeholder/seed description detector ──
// Hipster Lorem Ipsum (generated by hipsum.co or similar) used in Lovable
// demo data and test imports. Any job with one of these terms is fake.
const FAKE_DESCRIPTION_REGEX = /\b(gentrify|taiyaki|banh mi|chambray|artisan kale chips|vape tattooed|tilde taiyaki|glossier neutra|quinoa chartreuse)\b/i;

// ── Trusted specialist job boards ──
// Curated, single-sector boards where every listing is inherently on-theme.
// Jobs from these sources skip the keyword-relevance purge (their titles are
// often generic — "Development Manager", "Client Executive" — even though the
// role is genuinely political / sector-specific).
const TRUSTED_SPECIALIST_SOURCES = /\b(w4mpjobs\.org|lgjobs\.com|jobsinfootball\.com|jobs\.nhs\.uk|mandy\.com)\b/i;

// ── Banned companies: regardless of industry, these should never appear ──
// (Generic recruiters/staffing agencies pollute industry feeds with hundreds of unrelated roles)
const BANNED_COMPANIES = /\b(ge vernova|vernova)\b/i;
const BANNED_IN_GROCERY = /\b(reed|michael page|hirecracker|matchtech|zachary daniels|kingdom people|centre people|talentpool|dr newitt|drnewitt|d r newitt|henderson brown|manucomm|rise technical|searchability|agricultural & farming|mayborn|hertfordshire catering|ignite|dee set|one retail)\b/i;

// ── Cross-industry company → only-allowed-industries map ──
// These companies are ONLY allowed in the listed industries. Anywhere else = delete.
// Stops energy/aerospace/scientific brands leaking into fashion/jewellery/music/etc.
const COMPANY_ALLOWED_INDUSTRIES: Record<string, string[]> = {
  "british heart foundation": ["charity"],
  "hitachi": ["cars", "tech"],
  "diamond light source": ["tech"],
  "saab": ["cars", "tech"],
  "leonardo": ["tech"],
  "scania": ["cars"],
  "bio-techne": ["tech"],
  "vitality": ["wellness"],
  "ge vernova": [], // never allowed
  "vernova": [],
  "roku": ["tech", "cinema"],
  "booker group": ["grocery"],
};

// ── Cross-industry title blocklist: IT/cyber/dev roles never belong in non-tech industries ──
const TECH_ROLE_REGEX = /\b(cyber security|cybersecurity|it support|software engineer|devops|sre|data engineer|cloud engineer|java developer|\.net developer|salesforce developer|sap consultant|oracle dba|kafka engineer|spring boot|backend engineer|frontend engineer|full[- ]?stack|qa engineer|test engineer|systems engineer|network engineer|infrastructure engineer)\b/i;
// "politics" included because Government Digital Service / digital civil
// service roles are a real, named profession (GOV.UK, departmental data/tech
// teams) - genuine tech jobs at KNOWN government bodies (company map) survive
// this check and are then never re-examined; genuine unknown-company tech
// spam that slipped in via a synonym match still gets caught by the later
// relevance-keyword step, which requires a real politics/government term.
const TECH_ALLOWED_INDUSTRIES = new Set(["gaming", "tech", "remote", "graduate", "politics"]);

// ── Industry relevance keywords: at least one must appear in title OR description ──
// CRITICAL: keep these tight - they are the primary defence against generic IT/finance/recruiter spam
const INDUSTRY_RELEVANCE_KEYWORDS: Record<string, RegExp> = {
  // Cinema relevance - broad film/TV/cinema vocabulary. \b word boundaries
  // mean "film" matches "film" but NOT "Fujifilm" or "fulfilment". Generic
  // words like "creative" / "media" / "studio" / "production" / "editor" are
  // INTENTIONALLY excluded because they match thousands of unrelated jobs
  // (Tesla, recruiters, agencies). Non-cinema companies are blocked separately
  // via COMPANY_INDUSTRY_MAP and the cinema title blocklist below.
  cinema: /\b(film|films|filmmaker|filmmaking|cinema|cinemas|cinematic|movie|movies|tv|television|broadcast|broadcasting|broadcaster|vfx|visual effects|animation|animator|screenwriter|screenwriting|script|scriptwriter|cinematograph|cinematographer|post.production|postproduction|sound design|sound designer|colourist|colorist|gaffer|grip|stunt|costume designer|casting director|casting|location scout|dolby|imax|streaming|netflix|bbc studios|itv studios|channel 4|channel 5|sky studios|hbo|warner bros|paramount|disney|universal|sony pictures|lionsgate|a24|production assistant|production runner|production coordinator|production manager|production designer|line producer|series producer|tv producer|film producer|film director|tv director|video editor|video producer|videographer|first assistant director|second assistant director|development executive|commissioning editor|drama|documentary|reality tv|short film|feature film|projectionist|box office|cinema manager|cinema team|cinema host|projection|exhibitor|exhibition|distributor|distribution|acquisitions|festival programmer|programmer cinema|edit assistant|assistant editor|colour grade|grading|foley|adr|sound mixer|boom operator|focus puller|clapper loader|dop|director of photography|matte painter|3d artist|compositor|rotoscope|previz|pre.viz|on set|on.set|crew|runner)\b/i,
  "estate-agency": /\b(estate agent|letting|lettings|property|conveyancing|mortgage|surveyor|valuation|rightmove|zoopla|negotiator|RICS|land|housing|real estate|renting|tenant|landlord|sales progressor|EPC)\b/i,
  "interior-design": /\b(interior|design|architect|furniture|lighting|fabric|textile|décor|decor|showroom|upholstery|joinery|kitchen|bathroom|renovation|specification|FF&E|procurement|styling|home)\b/i,
  "food-drink": /\b(chef|kitchen|restaurant|food|drink|beverage|hospitality|bar|bartender|waiter|waitress|sous|sommelier|catering|dining|menu|recipe|baking|pastry|brunch|café|cafe|pub|hotel|front of house|general manager|F&B)\b/i,
  grocery: /\b(grocery|supermarket|fmcg|fresh produce|chilled|frozen food|bakery|deli|checkout|replenish|shelf|cafe|café|pharmacy|online grocery|click.collect|customer assistant|store manager|store team|shop floor|tesco|sainsbury|asda|waitrose|ocado|aldi|lidl|morrisons|m&s food|co-op food|booker)\b/i,
  gaming: /\b(game|games|gaming|esports|console|playstation|xbox|nintendo|level design|game design|game art|game engine|unreal|unity|3d artist|character artist|environment artist|technical artist|narrative design|qa tester|game tester|gameplay|game producer|game director|game writer|animator|rigger|vfx artist|sound designer|game ux|game audio|mobile game|mmo|rpg|fps|aaa|indie game)\b/i,
  coffee: /\b(barista|coffee|espresso|cafe|café|roastery|roaster|latte|cappuccino|brew bar|pour over|coffee shop)\b/i,
  bakery: /\b(baker|bakery|bakehouse|pastry|patisserie|sourdough|bread|viennoiserie|cake decorator|chocolatier)\b/i,
  beer: /\b(brewer|brewery|beer|ale|lager|cask|keg|cellar|publican|landlord|landlady|tap room|hop|cask ale|craft beer)\b/i,
  travel: /\b(travel|tourism|tour operator|cruise|airline|cabin crew|flight attendant|holiday|hotel|resort|destination|booking|reservations|tour guide|adventure|expedition|hospitality|concierge|spa|wellness retreat)\b/i,
  // Intentionally excludes bare "car", "vehicle", "motor" — these match "car allowance",
  // "company vehicle", "motor insurance" in job descriptions for non-automotive roles.
  // Relevance is confirmed by genuinely automotive terms in title or description.
  cars: /\b(automotive|dealership|motor trade|MOT tester|vehicle technician|vehicle mechanic|vehicle inspector|car mechanic|car sales|car dealer|used car|new car|car retail|service advisor|parts advisor|workshop controller|bodyshop|body shop|panel beater|paint sprayer|tyre fitter|tyre technician|EV technician|electric vehicle technician|powertrain|chassis engineer|calibration engineer|vehicle engineer|diagnostics technician|PDI technician|aftersales|warranty administrator|dealership manager|fleet manager automotive|automotive fleet|motor vehicle technician)\b/i,
  pets: /\b(pet|pets|veterinary|vet|animal|dog|cat|grooming|kennel|cattery|pet shop|pet food|aquarium|reptile)\b/i,
  fashion: /\b(fashion|apparel|clothing|garment|textile|tailor|seamstress|pattern cutter|stylist|merchandiser|buyer|visual merchandiser|womenswear|menswear|childrenswear|accessories|jewellery|footwear|luxury|brand|boutique|retail assistant|store manager|sales assistant)\b/i,
  jewellery: /\b(jewell|jewelry|gold|silver|platinum|diamond|gemstone|watchmaker|goldsmith|silversmith|engraver|polisher|setter|valuer|hallmark|bullion|fine jewellery)\b/i,
  beauty: /\b(beauty|cosmetic|skincare|haircare|makeup|nail|spa|salon|aesthetic|laser|waxing|brow|lash|massage|facial|microblading|dermatology)\b/i,
  hospitality: /\b(hotel|restaurant|bar|pub|café|cafe|chef|waiter|waitress|sommelier|concierge|housekeeping|front of house|F&B|catering|hospitality|barista|bartender|reception)\b/i,
  charity: /\b(charity|charit|fundrais|non.profit|nfp|third sector|donor|giving|grant|trustee|volunteer coordinator|community engagement|impact|cause|advocacy|outreach|nhs charity|hospice|aid|relief)\b/i,
  music: /\b(music|musician|composer|producer|sound engineer|recording|mixing|mastering|songwriter|a&r|label|artist|band|tour manager|music supervisor|orchestra|conductor|DJ|disc jockey|venue|festival|booking agent|session musician|session vocalist|touring musician|live performer|performing arts|royalt|sync licensing|sync supervisor|music rights|music catalogue|music publishing|music streaming|music coordinator|music assistant|label assistant|label manager|label coordinator|music accountant|entertainment lawyer|studio runner|music runner|FOH engineer|monitor engineer|live sound|promoter|music producer|music marketing|artist manager|music agent|music licensing|music business)\b/i,
  teaching: /\b(teach|teacher|education|school|college|university|tutor|lecturer|TA|teaching assistant|SENCO|head teacher|deputy head|primary|secondary|EYFS|ofsted|safeguarding|curriculum)\b/i,
  farming: /\b(farm|farming|farmer|agronomist|agricultural|agriculture|agritech|livestock|dairy|herd|shepherd|stockperson|poultry|tractor|combine|harvest|arable|crop|horticultur|glasshouse|vineyard|viticulture|nursery|grain|silage|fertiliser|fertilizer|defra|nfu|ahdb|estate manager|rural|smallholding|orchard|equine farm|farmhand)\b/i,
  journalism: /\b(journalist|reporter|editor|news|writer|correspondent|sub.editor|newsroom|publication|magazine|broadcast|investigative|features|columnist|press)\b/i,
  football: /\b(football|soccer|club|premier league|championship|EFL|FA|UEFA|FIFA|player|coach|scout|matchday|stadium|broadcasting|sponsorship|commercial partnership|kit|football operations|academy|youth development)\b/i,
  "horse-racing": /\b(horse[- ]?rac(?:e|ing)|racehorse|racecourse|race.?course|race.?day|equine|equestrian|thoroughbred|jockey|amateur jockey|apprentice jockey|conditional jockey|jockey coach|stable lad|stable lass|stable hand|head lad|head girl|work rider|exercise rider|travelling head|yard manager|racing yard|stud farm|stud manager|stud groom|bloodstock|bloodstock agent|farrier|paddock|turf club|BHA|British Horseracing|gallops|point.to.point|hunt yard|riding school|riding centre|racing manager|racing secretary|racing administrator|racecourse manager|clerk of the course)\b/i,
  // Politics relevance - deliberately excludes bare "policy" and bare "council"
  // (too broad: insurance policy, HR policy, student council, parish council
  // notices). Every term below is either a distinctive institution/grade name
  // or a compound phrase that's genuinely government/politics-specific.
  politics: /\b(civil servant|civil service|policy advisor|policy adviser|policy officer|policy manager|government policy|public policy|government economist|government social researcher|fast stream|whitehall|cabinet office|hm treasury|home office|foreign commonwealth|ministry of defence|ministry of justice|department for education|department of health and social care|defra|department for transport|dcms|department for business and trade|department for work and pensions|hmrc|hm revenue|parliamentary researcher|parliamentary assistant|caseworker mp|member of parliament|house of commons|house of lords|hansard|westminster|special adviser|special advisor|scottish parliament|senedd|welsh parliament|northern ireland assembly|local government officer|local authority|council officer|planning officer|environmental health officer|electoral services officer|democratic services officer|trading standards officer|building control surveyor|licensing officer|national graduate development programme|office for national statistics|national crime agency|national audit office|electoral commission|office for budget responsibility|government digital service|think tank|policy institute|policy researcher|policy fellow|public affairs|government relations|government affairs manager|lobbyist|political consultant|permanent secretary|deputy director civil service|director general civil service)\b/i,
  // Theatre relevance - deliberately excludes bare "stage"/"director"/"producer"
  // (too broad: staging area, project stage-gate, sales/finance director, TV
  // producer). Every term below is either a distinctive theatre-specific
  // compound phrase or a named theatre company/venue.
  theatre: /\b(theatre|theatres|theatrical|west end|stage manager|stage management|deputy stage manager|assistant stage manager|touring stage manager|company manager theatre|production manager theatre|wardrobe supervisor|wardrobe assistant|wardrobe mistress|costume designer|costume maker|set designer|scenic designer|scenic artist|scenic painter|lighting designer theatre|lighting technician theatre|theatre technician|sound designer theatre|dramaturg|literary manager|casting director|panto\b|pantomime|national theatre|royal shakespeare company|\brsc\b|ambassador theatre group|lw theatres|delfont mackintosh|sonia friedman|nimax theatres|donmar warehouse|bristol old vic|chichester festival theatre|sheffield theatres|birmingham rep|royal exchange theatre|glyndebourne|production resource group|white light lighting|rada drama school)\b/i,
};

// Company keys are matched on WORD BOUNDARIES, not as raw substrings.
//
// A naive `lower.includes(key)` silently reassigns any company whose name
// merely contains a key as a substring. Real cases this produced:
//
//   "Blake Stephenson MP (Mid Bedfordshire)"  -> "ford"  -> cars
//   "Oxford University Hospitals NHS Trust"   -> "ford"  -> cars
//   "Hertfordshire Partnership NHS"           -> "ford"  -> cars
//   "Vuelio" (a PR/monitoring firm)           -> "vue"   -> cinema
//
// Every UK place name containing "ford" — Oxford, Bedfordshire, Chelmsford,
// Salford, Watford, Guildford, Brentford, Trafford, Hertfordshire — was in
// scope, along with anything containing "vue", "seat", "mini" etc. Worse, a
// job reassigned into the wrong industry then fails that industry's relevance
// check on the next run and gets DELETED.
//
// \b anchors mean "Ford Motor Company" still matches while "Bedfordshire"
// does not. Patterns are precompiled once at module load rather than rebuilt
// per company.
const COMPANY_KEY_PATTERNS: { re: RegExp; industry: string }[] = Object
  .entries(COMPANY_INDUSTRY_MAP)
  .map(([key, industry]) => ({
    re: new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
    industry,
  }));

function lookupCompanyIndustry(company: string): string | null {
  const lower = company.toLowerCase().trim();
  for (const { re, industry } of COMPANY_KEY_PATTERNS) {
    if (re.test(lower)) return industry;
  }
  return null;
}

function isBlockedTitle(title: string, industry: string): boolean {
  const blocklist = INDUSTRY_TITLE_BLOCKLIST[industry];
  if (!blocklist) return false;
  return blocklist.test(title);
}

function isRelevantToIndustry(title: string, description: string, industry: string): boolean {
  const relevance = INDUSTRY_RELEVANCE_KEYWORDS[industry];
  if (!relevance) return true; // no relevance check for this industry = assume OK
  const combined = `${title} ${description || ""}`;
  return relevance.test(combined);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const batchSize = body.batch_size || 500;
    const targetIndustry = body.industry || null;
    const dryRun = body.dry_run || false;
    // Manual override for the expiry-purge safety limit below. Deliberately
    // opt-in per invocation — the nightly cron never sets it, so a genuine
    // mass-expiry needs a human to look first and then re-run.
    const forceExpiredPurge = body.force_expired_purge || false;

    const results = {
      scanned: 0,
      reassigned: 0,
      removed: 0,
      blocked_titles: 0,
      irrelevant: 0,
      banned_company: 0,
      expired: 0,
      expired_purge_aborted: false as boolean,
      details: [] as string[],
    };

    // Safety valve for the expiry purge below. The purge runs unattended at
    // 23:59 and deletes in bulk with no backup, so a single bad expires_at
    // (a scraper parsing bug, a timezone slip, a source that starts emitting
    // past dates) could wipe a large slice of the table before anyone noticed.
    // If a run wants to delete more than this share of live jobs, we abort and
    // report instead — a stuck purge is recoverable, a mass delete is not.
    const EXPIRED_PURGE_MAX_SHARE = 0.10;
    // Below this count the percentage guard is meaningless (and would block
    // legitimate small per-industry purges), so always allow it.
    const EXPIRED_PURGE_ALWAYS_ALLOW_BELOW = 500;

    // Purge expired listings first, in one bulk delete rather than per-row
    // in the scan loop below - expires_at is set on ingestion (typically
    // now + 60d) but nothing was ever actually deleting rows once it passed.
    // Marketplace.tsx has its own query-level filter for display, but the
    // rows themselves were piling up here indefinitely (found via a 6-week-old
    // Tesla job still live 15 days past its expiry).
    {
      const nowIso = new Date().toISOString();
      let expiredQuery = supabase
        .from("jobs")
        .select("id", { count: "exact" })
        .not("expires_at", "is", null)
        .lt("expires_at", nowIso);
      if (targetIndustry) expiredQuery = expiredQuery.eq("industry", targetIndustry);
      const { count: expiredCount, error: expiredCountError } = await expiredQuery;
      if (expiredCountError) throw expiredCountError;

      if (expiredCount && expiredCount > 0) {
        results.expired = expiredCount;
        results.details.push(`EXPIRED: ${expiredCount} job(s) past expires_at`);

        // Blast-radius check: compare against the total in the same scope, so
        // a per-industry run is measured against that industry, not the whole
        // table.
        let totalQuery = supabase.from("jobs").select("id", { count: "exact", head: true });
        if (targetIndustry) totalQuery = totalQuery.eq("industry", targetIndustry);
        const { count: totalCount, error: totalCountError } = await totalQuery;
        if (totalCountError) throw totalCountError;

        const share = totalCount && totalCount > 0 ? expiredCount / totalCount : 0;
        const overShare = share > EXPIRED_PURGE_MAX_SHARE;
        const smallEnoughToAllow = expiredCount < EXPIRED_PURGE_ALWAYS_ALLOW_BELOW;

        if (overShare && !smallEnoughToAllow && !forceExpiredPurge) {
          results.expired_purge_aborted = true;
          results.details.push(
            `EXPIRED PURGE ABORTED: ${expiredCount} of ${totalCount} ` +
              `(${(share * 100).toFixed(1)}%) exceeds the ${(EXPIRED_PURGE_MAX_SHARE * 100).toFixed(0)}% ` +
              `safety limit${targetIndustry ? ` for industry '${targetIndustry}'` : ""}. ` +
              `Nothing deleted — check for a source writing bad expires_at values, ` +
              `then re-run with force_expired_purge:true if this is genuinely correct.`,
          );
          console.error(
            `[validate-jobs] Expired purge aborted: ${expiredCount}/${totalCount} (${(share * 100).toFixed(1)}%)`,
          );
        } else if (!dryRun) {
          let deleteQuery = supabase
            .from("jobs")
            .delete()
            .not("expires_at", "is", null)
            .lt("expires_at", nowIso);
          if (targetIndustry) deleteQuery = deleteQuery.eq("industry", targetIndustry);
          const { error: deleteError } = await deleteQuery;
          if (deleteError) throw deleteError;
        }
      }
    }

    // Process in pages
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from("jobs")
        .select("id, title, company, industry, description, source_url")
        .range(offset, offset + batchSize - 1);

      if (targetIndustry) {
        query = query.eq("industry", targetIndustry);
      }

      const { data: jobs, error } = await query;
      if (error) throw error;
      if (!jobs || jobs.length === 0) {
        hasMore = false;
        break;
      }

      results.scanned += jobs.length;

      for (const job of jobs) {
        const title = job.title || "";
        const company = job.company || "";
        const industry = job.industry || "";
        const description = job.description || "";
        const sourceUrl = job.source_url || "";

        // Curated specialist job boards are inherently on-theme (e.g. every
        // w4mpjobs.org listing is a political role, even when the title is
        // generic like "Development Manager"). Trust them: skip the keyword
        // relevance purge below. They still pass through fake-description and
        // banned-company checks.
        const isTrustedSource = TRUSTED_SPECIALIST_SOURCES.test(sourceUrl);

        // 0. Fake/seed description (hipster lorem ipsum from Lovable demo data)
        if (FAKE_DESCRIPTION_REGEX.test(description)) {
          if (!dryRun) {
            await supabase.from("jobs").delete().eq("id", job.id);
          }
          results.banned_company++;
          results.details.push(`FAKE DESCRIPTION: "${title}" @ ${company}`);
          continue;
        }

        // 0. Banned company - delete regardless of industry
        if (BANNED_COMPANIES.test(company)) {
          if (!dryRun) {
            await supabase.from("jobs").delete().eq("id", job.id);
          }
          results.banned_company++;
          results.details.push(`BANNED COMPANY: "${title}" @ ${company} in ${industry}`);
          continue;
        }

        // 0b. Industry-specific banned companies (recruiters polluting grocery)
        if (industry === "grocery" && BANNED_IN_GROCERY.test(company)) {
          if (!dryRun) {
            await supabase.from("jobs").delete().eq("id", job.id);
          }
          results.banned_company++;
          results.details.push(`RECRUITER IN GROCERY: "${title}" @ ${company}`);
          continue;
        }

        // 0c. Cross-industry company allow-list - kill rows where a company appears
        // in an industry that isn't in its allow-list (e.g. Hitachi in fashion, BHF in hospitality)
        const companyLower = company.toLowerCase();
        for (const [key, allowed] of Object.entries(COMPANY_ALLOWED_INDUSTRIES)) {
          if (companyLower.includes(key) && !allowed.includes(industry)) {
            if (!dryRun) {
              await supabase.from("jobs").delete().eq("id", job.id);
            }
            results.banned_company++;
            results.details.push(`WRONG-INDUSTRY: "${title}" @ ${company} in ${industry}`);
            break;
          }
        }
        // If the previous loop deleted, skip the rest. Re-fetch via a flag isn't possible here,
        // so use the simpler approach: check again at top of next iteration via `continue`.
        if (companyLower && Object.keys(COMPANY_ALLOWED_INDUSTRIES).some(
          (k) => companyLower.includes(k) && !COMPANY_ALLOWED_INDUSTRIES[k].includes(industry)
        )) {
          continue;
        }

        // 0d. Tech/IT roles in non-tech industries
        if (TECH_ROLE_REGEX.test(title) && !TECH_ALLOWED_INDUSTRIES.has(industry)) {
          if (!dryRun) {
            await supabase.from("jobs").delete().eq("id", job.id);
          }
          results.blocked_titles++;
          results.details.push(`TECH ROLE LEAK: "${title}" @ ${company} in ${industry}`);
          continue;
        }

        // 1. Check company→industry mapping
        const correctIndustry = lookupCompanyIndustry(company);
        if (correctIndustry && correctIndustry !== industry) {
          if (!dryRun) {
            await supabase
              .from("jobs")
              .update({ industry: correctIndustry })
              .eq("id", job.id);
          }
          results.reassigned++;
          results.details.push(
            `REASSIGN: "${title}" @ ${company} from ${industry} → ${correctIndustry}`
          );
          continue;
        }

        // 2. Check title blocklist
        if (isBlockedTitle(title, industry)) {
          if (!dryRun) {
            await supabase.from("jobs").delete().eq("id", job.id);
          }
          results.blocked_titles++;
          results.details.push(
            `BLOCKED: "${title}" @ ${company} in ${industry}`
          );
          continue;
        }

        // 3. Relevance check - apply to jobs from unknown companies from the
        // generic aggregators (Adzuna, Reed, Jooble, RapidAPI push generic jobs
        // into specific industries). Trusted specialist boards are exempt.
        const isKnownCompany = lookupCompanyIndustry(company) !== null;

        if (!isTrustedSource && !isKnownCompany && !isRelevantToIndustry(title, description, industry)) {
          if (!dryRun) {
            await supabase.from("jobs").delete().eq("id", job.id);
          }
          results.irrelevant++;
          results.details.push(
            `IRRELEVANT: "${title}" @ ${company} in ${industry}`
          );
          continue;
        }
      }

      if (jobs.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    // Truncate details for response
    const truncatedDetails = results.details.slice(0, 100);

    return new Response(
      JSON.stringify({
        message: `Validated ${results.scanned} jobs`,
        dry_run: dryRun,
        ...results,
        details: truncatedDetails,
        details_truncated: results.details.length > 100,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("validate-jobs error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
