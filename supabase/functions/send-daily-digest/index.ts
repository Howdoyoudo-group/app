import { createClient } from "npm:@supabase/supabase-js@2";
import { sendViaResend } from "../_shared/send-via-resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "notify.howdoyoudo.group";
const FROM_EMAIL = `digest@${SENDER_DOMAIN}`;
const FROM_NAME = "How Do You Do";

// Minimum content thresholds per industry before triggering a refresh
const MIN_NEWS = 2;
const MIN_ARTICLES = 2;

function last24hAgo(): string {
  const d = new Date();
  d.setHours(d.getHours() - 24);
  return d.toISOString();
}

function last48hAgo(): string {
  const d = new Date();
  d.setHours(d.getHours() - 48);
  return d.toISOString();
}

function last7dAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
}

const INDUSTRY_NAMES: Record<string, string> = {
  beer: "Beer",
  cinema: "Film and TV",
  fashion: "Fashion",
  coffee: "Coffee",
  music: "Music",
  grocery: "Grocery",
  "food-drink": "Food & Drink",
  football: "Football",
  teaching: "Teaching",
  "interior-design": "Interior Design",
  charity: "Charity",
  "estate-agency": "Estate Agency",
  bakery: "Bakery",
  hospitality: "Hospitality",
  footwear: "Footwear",
  physiotherapy: "Physiotherapy",
  psychotherapy: "Psychotherapy",
  wellness: "Wellness",
  gaming: "Gaming",
  journalism: "Journalism",
  jewellery: "Jewellery",
  pets: "Pets",
  travel: "Travel",
  cars: "Cars",
  beauty: "Beauty",
};

const INDUSTRY_CONTEXT: Record<string, string> = {
  cinema: "film, cinema, streaming, TV production, box office, studios, entertainment industry business",
  fashion: "fashion brands, clothing retail, luxury fashion, sustainable fashion, beauty industry",
  beer: "beer industry, craft beer, breweries, pub industry, brewing, taproom, beer brands",
  coffee: "coffee shops, coffee chains, specialty coffee, barista, coffee roasting, cafe industry",
  music: "music industry, record labels, live music, festivals, streaming, music business",
  grocery: "supermarkets, grocery retail, food supply chain, Tesco, Sainsburys, online grocery",
  "food-drink": "restaurants, pubs, bars, hotels, hospitality, catering, food service, dining",
  football: "football business, Premier League, sports media, clubs, sponsorship, broadcasting",
  teaching: "education policy, schools, teaching, EdTech, universities, teacher training",
  "interior-design": "interior design, architecture, home interiors, furnishings, design trends",
  charity: "charity sector, nonprofits, social enterprise, fundraising, grants, voluntary sector",
  "estate-agency": "property market, estate agents, lettings, proptech, housing market",
  bakery: "bakery industry, artisan bread, bakery chains, patisserie, baking business",
  hospitality: "hospitality industry, restaurants, hotels, pubs, bars, catering, events",
  footwear: "footwear industry, shoe brands, sneakers, Nike, Adidas, JD Sports",
  physiotherapy: "physiotherapy, physical therapy, NHS physio, sports rehab",
  psychotherapy: "psychotherapy, counselling, mental health services, CBT, therapy",
  wellness: "fitness, gyms, health wellness, activewear, spa, wellbeing, sports nutrition",
  gaming: "video game industry, game studios, esports, game development, gaming business",
  journalism: "journalism, media industry, newspapers, broadcasting, press, digital media",
  jewellery: "jewellery industry, luxury watches, diamonds, goldsmiths, jewellery retail",
  pets: "pet industry, pet food, veterinary, pet retail, animal health",
  travel: "travel industry, tourism, airlines, hotels, travel agencies, aviation",
  cars: "automotive industry, car manufacturers, electric vehicles, car dealers, motoring",
  beauty: "beauty industry, cosmetics, skincare, beauty retail, makeup brands",
};

const ASSET_BASE = "https://siqwclmzncubkrwabmvb.supabase.co/storage/v1/object/public/email-assets";

// Curated company → domain map for logos in newsletter job rows.
const COMPANY_LOGO_DOMAINS: Record<string, string> = {
  // Fashion & footwear
  "me+em": "meandem.com", "me&em": "meandem.com", "meem": "meandem.com",
  "burberry": "burberry.com", "asos": "asos.com", "nike": "nike.com",
  "adidas": "adidas.com", "new balance": "newbalance.co.uk", "newbalance": "newbalance.co.uk",
  "puma": "puma.com", "reebok": "reebok.com", "asics": "asics.com",
  "on": "on-running.com", "on running": "on-running.com", "on-running": "on-running.com",
  "hoka": "hoka.com", "hoka one one": "hoka.com",
  "vans": "vans.co.uk", "converse": "converse.com", "crocs": "crocs.co.uk",
  "clarks": "clarks.co.uk", "office": "office.co.uk", "schuh": "schuh.co.uk",
  "jd sports": "jdsports.co.uk", "jd": "jdsports.co.uk", "jd sports fashion": "jdsports.co.uk",
  "footlocker": "footlocker.co.uk", "foot locker": "footlocker.co.uk",
  "size?": "size.co.uk", "size": "size.co.uk",
  "sports direct": "sportsdirect.com", "sportsdirect": "sportsdirect.com",
  "frasers group": "frasers.group", "frasers": "frasers.group",
  "dr. martens": "drmartens.com", "dr martens": "drmartens.com",
  "birkenstock": "birkenstock.com", "timberland": "timberland.co.uk",
  "ugg": "ugg.com",
  "selfridges": "selfridges.com", "harrods": "harrods.com", "harvey nichols": "harveynichols.com",
  "liberty": "libertylondon.com", "liberty london": "libertylondon.com",
  "next": "next.co.uk", "marks & spencer": "marksandspencer.com",
  "m&s": "marksandspencer.com", "m&s food": "marksandspencer.com",
  "primark": "primark.com", "uniqlo": "uniqlo.com", "h&m": "hm.com",
  "zara": "zara.com", "inditex": "inditex.com",
  "boohoo": "boohoo.com", "missguided": "missguided.co.uk", "prettylittlething": "prettylittlething.com",
  "depop": "depop.com", "vinted": "vinted.co.uk", "farfetch": "farfetch.com",
  "matchesfashion": "matchesfashion.com", "matches": "matchesfashion.com",
  "mytheresa": "mytheresa.com", "net-a-porter": "net-a-porter.com", "net a porter": "net-a-porter.com",
  "ralph lauren": "ralphlauren.co.uk", "polo ralph lauren": "ralphlauren.co.uk",
  "tommy hilfiger": "tommy.com", "calvin klein": "calvinklein.co.uk",
  "lacoste": "lacoste.com", "fred perry": "fredperry.com",
  "barbour": "barbour.com", "belstaff": "belstaff.com", "mulberry": "mulberry.com",
  "ted baker": "tedbaker.com", "all saints": "allsaints.com", "allsaints": "allsaints.com",
  "reiss": "reiss.com", "cos": "cos.com", "arket": "arket.com",
  "sandro": "sandro-paris.com", "maje": "maje.com", "ganni": "ganni.com",
  "stella mccartney": "stellamccartney.com",
  "louis vuitton": "louisvuitton.com", "lvmh": "lvmh.com",
  "gucci": "gucci.com", "prada": "prada.com", "miu miu": "miumiu.com",
  "hermès": "hermes.com", "hermes": "hermes.com",
  "chanel": "chanel.com", "dior": "dior.com", "saint laurent": "ysl.com",
  "bottega veneta": "bottegaveneta.com", "balenciaga": "balenciaga.com",
  "loewe": "loewe.com", "celine": "celine.com",
  "fenwick": "fenwick.co.uk", "john lewis": "johnlewis.com",
  // Grocery & food
  "tesco": "tesco.com", "sainsbury's": "sainsburys.co.uk", "sainsburys": "sainsburys.co.uk",
  "asda": "asda.com", "asda stores": "asda.com",
  "morrisons": "morrisons.com",
  "waitrose": "waitrose.com", "waitrose & partners": "waitrose.com", "waitrose and partners": "waitrose.com",
  "lidl": "lidl.co.uk", "aldi": "aldi.co.uk", "aldi stores": "aldi.co.uk",
  "co-op": "coop.co.uk", "coop": "coop.co.uk", "the co-op": "coop.co.uk",
  "iceland": "iceland.co.uk",
  "ocado": "ocado.com", "ocado retail": "ocado.com",
  "ocado group": "ocadogroup.com",
  "ocado logistics": "ocado-logistics.com",
  "john lewis partnership": "johnlewis.com",
  "whole foods": "wholefoodsmarket.com", "whole foods market": "wholefoodsmarket.com",
  "booker": "booker.co.uk", "booker group": "booker.co.uk",
  "af blakemore": "afblakemore.com", "af blakemore - retail": "afblakemore.com",
  "premier foods": "premierfoods.co.uk",
  "greggs": "greggs.co.uk", "gail's": "gailsbread.co.uk", "gails": "gailsbread.co.uk",
  // Hospitality / coffee / pubs
  "starbucks": "starbucks.co.uk",
  "costa": "costa.co.uk", "costa coffee": "costa.co.uk",
  "caffè nero": "caffenero.com", "caffe nero": "caffenero.com",
  "pret": "pret.co.uk", "pret a manger": "pret.co.uk",
  "blank street": "blankstreet.com", "blank street coffee": "blankstreet.com",
  "grind": "grind.co.uk", "joe & the juice": "joejuice.com", "joe and the juice": "joejuice.com",
  "wagamama": "wagamama.com", "nando's": "nandos.co.uk", "nandos": "nandos.co.uk",
  "pizza express": "pizzaexpress.com", "pizzaexpress": "pizzaexpress.com",
  "five guys": "fiveguys.co.uk", "shake shack": "shakeshack.co.uk",
  "leon": "leon.co", "honest burgers": "honestburgers.co.uk",
  "soho house": "sohohouse.com", "the ned": "thened.com",
  "young's": "youngs.co.uk", "youngs": "youngs.co.uk",
  "fuller's": "fullers.co.uk", "fullers": "fullers.co.uk",
  "mitchells & butlers": "mbplc.com", "mitchells and butlers": "mbplc.com",
  "whitbread": "whitbread.co.uk", "premier inn": "premierinn.com",
  // Estate agency / property
  "savills": "savills.co.uk", "knight frank": "knightfrank.co.uk",
  "rightmove": "rightmove.co.uk", "purplebricks": "purplebricks.co.uk",
  "zoopla": "zoopla.co.uk", "foxtons": "foxtons.co.uk",
  "winkworth": "winkworth.co.uk", "hamptons": "hamptons.co.uk",
  "connells": "connells.co.uk", "connells group": "connellsgroup.co.uk",
  "dexters": "dexters.co.uk", "chestertons": "chestertons.com",
  "jll": "jll.co.uk", "cbre": "cbre.co.uk", "strutt & parker": "struttandparker.com",
  "strutt and parker": "struttandparker.com",
  // Media / film / streaming
  "netflix": "netflix.com", "disney+": "disneyplus.com", "disney plus": "disneyplus.com",
  "amazon prime": "primevideo.com", "prime video": "primevideo.com",
  "apple tv+": "tv.apple.com", "apple tv": "tv.apple.com",
  "paramount": "paramount.com", "paramount+": "paramountplus.com",
  "warner bros": "warnerbros.com", "warner bros discovery": "wbd.com",
  "sky": "sky.com", "bbc": "bbc.co.uk", "channel 4": "channel4.com",
  "itv": "itv.com", "itvx": "itv.com", "now": "nowtv.com",
  "everyman": "everymancinema.com",
  "everyman cinema": "everymancinema.com", "everyman cinemas": "everymancinema.com",
  "curzon": "curzon.com", "picturehouse": "picturehouses.com",
  "vue": "myvue.com", "cineworld": "cineworld.co.uk", "odeon": "odeon.co.uk",
  "bfi": "bfi.org.uk", "mubi": "mubi.com", "a24": "a24films.com",
  // Music
  "spotify": "spotify.com", "warner music": "warnermusic.com",
  "universal music": "universalmusic.com", "sony music": "sonymusic.com",
  "dice": "dice.fm", "dice fm": "dice.fm", "broadwick": "broadwicklive.com",
  "secretly group": "secretlygroup.com", "ticketmaster": "ticketmaster.co.uk",
  "live nation": "livenation.co.uk", "aeg": "aegworldwide.com",
  // Football
  "premier league": "premierleague.com",
  "the premier league": "premierleague.com", "sky sports": "skysports.com",
  "tottenham hotspur": "tottenhamhotspur.com", "england football": "englandfootball.com",
  "arsenal": "arsenal.com", "liverpool": "liverpoolfc.com",
  "manchester united": "manutd.com", "manchester city": "mancity.com",
  "chelsea": "chelseafc.com", "efl": "efl.com",
  "fa": "thefa.com", "the fa": "thefa.com", "uefa": "uefa.com",
  "dazn": "dazn.com", "tnt sports": "tntsports.co.uk",
  // Beauty
  "boots": "boots.com", "superdrug": "superdrug.com",
  "space nk": "spacenk.com", "spacenk": "spacenk.com",
  "charlotte tilbury": "charlottetilbury.com", "rare beauty": "rarebeauty.com",
  "fenty beauty": "fentybeauty.com", "glossier": "glossier.com",
  "drunk elephant": "drunkelephant.com", "the ordinary": "theordinary.com",
  "deciem": "deciem.com", "trinny london": "trinnylondon.com",
  // Bakery
  "paul": "paul-uk.com", "le pain quotidien": "lepainquotidien.com",
  "ole & steen": "oleandsteen.co.uk", "ole and steen": "oleandsteen.co.uk",
  // Charity & education
  "teach first": "teachfirst.org.uk", "save the children": "savethechildren.org.uk",
  "oxfam": "oxfam.org.uk", "british red cross": "redcross.org.uk",
  "macmillan": "macmillan.org.uk", "cancer research uk": "cancerresearchuk.org",
  "rspca": "rspca.org.uk", "national trust": "nationaltrust.org.uk",
  // News / publishing
  "news uk": "news.co.uk", "the guardian": "theguardian.com",
  "the times": "thetimes.co.uk", "the sunday times": "thetimes.co.uk",
  "the telegraph": "telegraph.co.uk", "financial times": "ft.com", "ft": "ft.com",
  "the economist": "economist.com", "reuters": "reuters.com",
  "bloomberg": "bloomberg.com", "getty images": "gettyimages.com",
  // Misc
  "tom dixon": "tomdixon.net", "hawkstone": "hawkstone.co",
  "pragnell": "pragnell.co.uk", "tate": "tate.org.uk",
  "minor figures": "minorfigures.com",
  // Pets & vets
  "pets at home": "petsathome.com", "vets4pets": "vets4pets.com",
  "ivc evidensia": "ivcevidensia.com", "cvs group": "cvsukltd.co.uk",
  "medivet": "medivet.co.uk", "medivet group": "medivet.co.uk",
  "tails.com": "tails.com", "butternut box": "butternutbox.com",
  "lily's kitchen": "lilyskitchen.co.uk", "lilys kitchen": "lilyskitchen.co.uk",
  "battersea": "battersea.org.uk", "battersea dogs & cats home": "battersea.org.uk",
  "dogs trust": "dogstrust.org.uk", "blue cross": "bluecross.org.uk",
  "pdsa": "pdsa.org.uk", "cats protection": "cats.org.uk",
  "linnaeus veterinary": "linnaeusgroup.co.uk", "jollyes": "jollyes.co.uk",
  "jollyes pets": "jollyes.co.uk",
};

const COMPANY_INITIAL_PALETTE = [
  "#1a1a1a", "#00a36c", "#0066cc", "#cc3300",
  "#7a3fb8", "#b8860b", "#3d6b3d", "#a4441a",
];

// Normalise a company name: strip parentheticals, common corporate/club
// suffixes, punctuation, then collapse whitespace. Lets "Manchester City FC",
// "Tottenham Hotspur Football & Athletic Co Ltd", "Nike (UK) Limited" all
// reduce to clean keys we can match against COMPANY_LOGO_DOMAINS.
function normaliseCompanyKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(ltd\.?|limited|plc|llc|inc\.?|incorporated|holdings|holding|group|company|co\.?|stores?|fc|afc|cf|football and athletic|football & athletic|football club|athletic|& partners|and partners)\b/g, " ")
    .replace(/&/g, " and ")
    .replace(/[.,'’`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Find a curated domain via exact then progressively looser matches so club
// names like "Manchester City FC" still resolve to "mancity.com".
function findCuratedDomain(company: string): string | null {
  if (!company) return null;
  const raw = company.trim().toLowerCase();
  if (COMPANY_LOGO_DOMAINS[raw]) return COMPANY_LOGO_DOMAINS[raw];

  const normalised = normaliseCompanyKey(company);
  if (COMPANY_LOGO_DOMAINS[normalised]) return COMPANY_LOGO_DOMAINS[normalised];

  // NHS catch-all
  if (/\bnhs\b/.test(normalised)) return "nhs.uk";

  const noUk = normalised.replace(/\s+uk$/, "").trim();
  if (noUk && COMPANY_LOGO_DOMAINS[noUk]) return COMPANY_LOGO_DOMAINS[noUk];

  // Try first 1-3 words of normalised (e.g. "manchester city fc" → "manchester city")
  const words = normalised.split(" ").filter(Boolean);
  for (let take = Math.min(3, words.length); take >= 1; take--) {
    const prefix = words.slice(0, take).join(" ");
    if (COMPANY_LOGO_DOMAINS[prefix]) return COMPANY_LOGO_DOMAINS[prefix];
  }

  // Last resort: longest curated key the normalised name starts with
  let bestKey: string | null = null;
  for (const candidate of Object.keys(COMPANY_LOGO_DOMAINS)) {
    if (candidate.length < 4) continue;
    if (normalised === candidate || normalised.startsWith(candidate + " ")) {
      if (!bestKey || candidate.length > bestKey.length) bestKey = candidate;
    }
  }
  return bestKey ? COMPANY_LOGO_DOMAINS[bestKey] : null;
}

function resolveCompanyDomain(company: string): string | null {
  const curated = findCuratedDomain(company);
  if (curated) return curated;

  // Heuristic guess for unknown companies (kept conservative)
  const tokens = (company || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const stopWords = new Set(["the", "ltd", "limited", "uk", "group", "and", "co", "fc", "afc", "football", "club", "athletic", "plc", "inc", "llc", "holdings", "company"]);
  const meaningful = tokens.filter(t => !stopWords.has(t));
  if (meaningful.length === 1 && meaningful[0].length >= 3) return `${meaningful[0]}.com`;
  if (meaningful.length >= 2 && meaningful.length <= 3) return `${meaningful.join("")}.com`;
  return null;
}

function companyLogoUrl(company: string): string | null {
  const domain = resolveCompanyDomain(company);
  if (!domain) return null;
  return `https://img.logo.dev/${domain}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ&size=256&format=png`;
}

// Returns true only when we can resolve the company to a curated domain.
function hasCuratedLogo(company: string): boolean {
  return findCuratedDomain(company) !== null;
}

function companyLogoCell(company: string, industry?: string): string {
  // Only render an actual favicon when we have a curated domain - otherwise
  // Google's service returns a generic globe placeholder, which looks broken.
  if (hasCuratedLogo(company)) {
    const url = companyLogoUrl(company);
    if (url) {
      return `<img src="${url}" alt="${company}" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:6px;background:#f5f5f5;" />`;
    }
  }
  // Fall back to the industry doodle from our existing icon set.
  const indKey = (industry || "").toLowerCase();
  const doodle = INDUSTRY_ICONS[indKey];
  if (doodle) {
    return `<img src="${doodle}" alt="${industry}" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:6px;background:#ffffff;border:1px solid #1a1a1a;" />`;
  }
  // Last-resort coloured initials.
  const initials = (company || "?")
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "").join("") || "?";
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = (hash * 31 + company.charCodeAt(i)) | 0;
  const bg = COMPANY_INITIAL_PALETTE[Math.abs(hash) % COMPANY_INITIAL_PALETTE.length];
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="48" height="48" style="border-collapse:collapse;background-color:${bg};border-radius:6px;"><tr><td align="center" valign="middle" style="width:48px;height:48px;color:#ffffff;font-family:Arial,sans-serif;font-weight:700;font-size:14px;letter-spacing:0.5px;">${initials}</td></tr></table>`;
}

const INDUSTRY_ICONS: Record<string, string> = {
  beer: `${ASSET_BASE}/email-icon-beer.png`,
  cinema: `${ASSET_BASE}/email-icon-cinema.png`,
  fashion: `${ASSET_BASE}/email-icon-fashion.png`,
  coffee: `${ASSET_BASE}/email-icon-coffee.png`,
  music: `${ASSET_BASE}/email-icon-music.png`,
  grocery: `${ASSET_BASE}/email-icon-grocery.png`,
  "food-drink": `${ASSET_BASE}/email-icon-food-drink.png`,
  football: `${ASSET_BASE}/email-icon-football.png`,
  teaching: `${ASSET_BASE}/email-icon-teaching.png`,
  "interior-design": `${ASSET_BASE}/email-icon-interior-design.png`,
  charity: `${ASSET_BASE}/email-icon-charity.png`,
  "estate-agency": `${ASSET_BASE}/email-icon-estate-agency.png`,
  bakery: `${ASSET_BASE}/email-icon-bakery.png`,
  hospitality: `${ASSET_BASE}/email-icon-hospitality.png`,
  footwear: `${ASSET_BASE}/email-icon-footwear.png`,
  physiotherapy: `${ASSET_BASE}/email-icon-physiotherapy.png`,
  psychotherapy: `${ASSET_BASE}/email-icon-psychotherapy.png`,
  wellness: `${ASSET_BASE}/email-icon-wellness.png`,
  gaming: `${ASSET_BASE}/email-icon-gaming.png`,
  journalism: `${ASSET_BASE}/email-icon-journalism.png`,
  jewellery: `${ASSET_BASE}/email-icon-jewellery.png`,
  pets: `${ASSET_BASE}/email-icon-pets.png`,
  travel: `${ASSET_BASE}/email-icon-travel.png`,
  cars: `${ASSET_BASE}/email-icon-cars.png`,
  beauty: `${ASSET_BASE}/email-icon-beauty.png`,
  influencing: `${ASSET_BASE}/email-icon-influencing.png`,
  "horse-racing": `${ASSET_BASE}/email-icon-horse-racing.png`,
  money: `${ASSET_BASE}/email-icon-money.png`,
  health: `${ASSET_BASE}/email-icon-health.png`,
  farming: `${ASSET_BASE}/email-icon-farming.png`,
};

function formatIndustryName(industry: string): string {
  return INDUSTRY_NAMES[industry.toLowerCase()] || 
    industry.split(/[-\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// Slug aliases: legacy industry names that should be presented as a unified
// section in the digest. We treat "Hospitality" as "Food & Drink" so that
// subscribers see one well-stocked section drawing on the broader pool
// (hospitality + grocery + coffee + bakery + beer) instead of a hospitality-only
// silo.
const SLUG_ALIASES: Record<string, string> = {
  "hospitality": "food-drink",
};

function toSlug(name: string): string {
  const raw = name.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return SLUG_ALIASES[raw] ?? raw;
}

interface BriefingSection {
  mainNews: string; // HTML paragraphs
  people: string;   // HTML paragraphs
  takeaway: string; // HTML paragraphs
  sourceLinks: { title: string; url: string }[]; // cited articles
}

interface NewsItem {
  title: string;
  source: string;
  url: string;
}

interface JobItem {
  title: string;
  company: string;
  location: string | null;
  url: string;
  salary: string | null;
}

/* ─────────── Industry priority (mirrors src/lib/industry-rankings.ts) ─────────── */
const INDUSTRY_KNOWN_COMPANIES: Record<string, string[]> = {
  "estate-agency": ["foxtons","savills","knight frank","rightmove","zoopla","purplebricks","connells","dexters","hamptons","jll","cbre","chestertons","winkworth"],
  fashion: ["asos","boohoo","burberry","net-a-porter","selfridges","harrods","harvey nichols","liberty","farfetch","depop","vinted","marks & spencer","m&s","next","primark","river island","zara","h&m","uniqlo","cos","arket","ganni","mulberry","barbour","ted baker","paul smith","reiss","me+em"],
  footwear: ["nike","adidas","new balance","puma","asics","reebok","vans","converse","dr martens","birkenstock","ugg","timberland","clarks","kurt geiger","schuh","jd sports","crocs","on running","hoka"],
  hospitality: ["soho house","the ivy","hawksmoor","dishoom","nobu","gail's","gails","wagamama","pret","leon","nando's","franco manca","wolseley","marriott","hilton","claridge's","the savoy","the dorchester","the connaught","edition","ace hotel"],
  "food-drink": ["soho house","the ivy","hawksmoor","dishoom","nobu","gail's","gails","wagamama","pret","leon","nando's","franco manca","wolseley","marriott","hilton","claridge's","the savoy","the dorchester","the connaught","edition","ace hotel","caffe nero","caffè nero","costa","starbucks","greggs","paul","ole & steen","bread ahead","grind","blank street","prezzo","ask italian","pizza express","zizzi","côte","cote","bill's","bills","honest burgers","five guys","shake shack","gbk","byron","busaba","ping pong","yo sushi","itsu","tortilla","chipotle","leon","crussh","joe & the juice","caravan","granger","barrafina","rovi","ottolenghi","lina stores","sticks'n'sushi","sticksnsushi","searcys","fortnum & mason","brewdog","fuller's","fullers","young's","greene king","mitchells & butlers","jd wetherspoon","stonegate","whitbread","premier inn"],
  coffee: ["grind","blank street","caffe nero","caffè nero","costa","starbucks","pret","gail's","gails","joe & the juice","monmouth coffee","square mile","workshop coffee","watch house"],
  bakery: ["gail's","gails","greggs","pret","paul","ole & steen","bread ahead","pophams","warburtons","hovis","kingsmill"],
  beer: ["beavertown","camden","brewdog","fuller's","fullers","young's","shepherd neame","thornbridge","verdant","northern monk","cloudwater","diageo","carlsberg","molson coors","heineken","guinness","hawkstone"],
  cinema: ["netflix","amazon prime","disney","warner bros","universal","paramount","sony pictures","a24","bbc films","bbc studios","film4","working title","everyman","curzon","picturehouse","vue","odeon","cineworld","imax","lionsgate"],
  music: ["spotify","apple music","tidal","universal music","sony music","warner music","polydor","atlantic","columbia","domino","ninja tune","xl recordings","beggars","kobalt","bmg","live nation","aeg presents","dice","ticketmaster"],
  football: ["premier league","efl","the fa","uefa","fifa","manchester united","manchester city","liverpool","chelsea","arsenal","tottenham","newcastle united","aston villa","west ham","sky sports","tnt sports","dazn","nike","adidas","puma","castore","the athletic"],
  charity: ["save the children","oxfam","british red cross","cancer research uk","macmillan","marie curie","mind","samaritans","shelter","barnardo's","nspcc","wwf","national trust","amnesty","unicef","crisis","scope","age uk","british heart foundation","rnli","teach first"],
  "interior-design": ["tom dixon","soho home","the conran shop","heal's","made.com","loaf","habitat","john lewis","liberty","farrow & ball","little greene","designers guild","house of hackney","vitra","knoll","muuto","hay","ferm living"],
  gaming: ["rockstar","ubisoft","ea","electronic arts","activision","blizzard","sony interactive","playstation","xbox","nintendo","epic games","riot games","valve","sega","square enix","capcom","king","supercell","frontier developments"],
  grocery: ["tesco","sainsbury's","sainsburys","asda","morrisons","waitrose","ocado","m&s food","lidl","aldi","co-op","iceland","whole foods","amazon fresh","gousto","hellofresh","abel & cole","riverford"],
  jewellery: ["tiffany","cartier","bulgari","van cleef","boodles","graff","chopard","pragnell","garrard","asprey","mappin & webb","goldsmiths","ernest jones","beaverbrooks","monica vinader","missoma","astrid & miyu","pandora"],
  journalism: ["bbc","the times","the guardian","the telegraph","financial times","reuters","bloomberg","the economist","vogue","tatler","monocle","wired","sky news","news uk","daily mail","the spectator","tortoise","the athletic"],
  pets: ["pets at home","vets4pets","ivc evidensia","cvs group","medivet","tails.com","butternut box","lily's kitchen","battersea","dogs trust","rspca","blue cross","pdsa","cats protection"],
  beauty: ["l'oréal","l'oreal","loreal","estée lauder","estee lauder","rituals","the body shop","molton brown","jo malone","charlotte tilbury","space nk","sephora","boots","superdrug","mac cosmetics","clinique","aesop","glossier","cult beauty","lookfantastic"],
  cars: ["tesla","ford","vauxhall","bmw","mercedes-benz","audi","volkswagen","jaguar land rover","stellantis","toyota","honda","nissan","kwik fit","halfords"],
};

const INDUSTRY_DEPRIORITISE: Record<string, RegExp> = {
  hospitality: /\b(kitchen porter|pot wash|dishwasher|housekeeper|chambermaid|cleaner|night porter|kp\b|commis|busser|runner)\b/i,
  "food-drink": /\b(kitchen porter|pot wash|dishwasher|housekeeper|chambermaid|cleaner|night porter|kp\b|commis|busser|runner|crew member|team member|cafe assistant|catering assistant)\b/i,
  bakery: /\b(bakery assistant|cleaner|kitchen porter|cashier|crew member|team member|night packer|warehouse operative)\b/i,
  coffee: /\b(crew member|team member|cleaner|kitchen porter|dishwasher|cashier|cafe assistant)\b/i,
  fashion: /\b(sales assistant|store assistant|cashier|stockroom|warehouse operative|loss prevention|cleaner)\b/i,
  footwear: /\b(sales assistant|store assistant|cashier|stockroom|warehouse operative|cleaner|retail associate)\b/i,
  grocery: /\b(checkout|till operator|cashier|shelf stacker|night replenishment|warehouse operative|picker|packer|delivery driver|cleaner|customer assistant|store assistant)\b/i,
  cinema: /\b(cinema host|usher|concession|cleaner|crew member|cashier|popcorn|ticketing assistant)\b/i,
  music: /\b(security|steward|bar staff|bartender|cleaner|stagehand|merchandise seller|ticket scanner|usher|warehouse operative)\b/i,
  football: /\b(steward|security|cleaner|catering assistant|kit man|groundsman|ticket office|matchday casual|hospitality waiter|bar staff)\b/i,
  charity: /\b(charity shop assistant|shop volunteer|street fundraiser|f2f|door to door|warehouse operative|cleaner|driver)\b/i,
  beer: /\b(bar staff|bartender|waiter|waitress|cleaner|kitchen porter|warehouse operative|delivery driver|merchandiser)\b/i,
  jewellery: /\b(security guard|cleaner|warehouse operative|delivery driver|stockroom|sales assistant)\b/i,
  pets: /\b(dog walker|pet sitter|kennel assistant|cattery assistant|grooming assistant|reception|store assistant|warehouse operative)\b/i,
};

function isWhoSectionCompany(industry: string, company: string): boolean {
  const ind = (industry || "").toLowerCase();
  const companyLc = (company || "").toLowerCase();
  const known = INDUSTRY_KNOWN_COMPANIES[ind];
  if (!known) return false;
  return known.some((c) => companyLc.includes(c));
}

function getIndustryRankBoost(industry: string, title: string, company: string): number {
  const titleLc = (title || "").toLowerCase();
  const ind = (industry || "").toLowerCase();
  let score = 0;
  // HUGE boost for brands featured in the industry's "Who?" section - these
  // recognisable employers are the whole reason subscribers signed up.
  if (isWhoSectionCompany(industry, company)) score += 200;
  const dep = INDUSTRY_DEPRIORITISE[ind];
  if (dep && dep.test(titleLc)) score -= 50;
  return score;
}

// Group titles into broad families so we don't email 8 chefs in a row.
function getRoleFamily(title: string): string {
  const t = (title || "").toLowerCase();
  // Kitchen - split into sub-families so we don't get 5 sous chefs in a row.
  if (/\bsous chef\b/.test(t)) return "kitchen-sous";
  if (/\b(head chef|executive chef|chef de cuisine)\b/.test(t)) return "kitchen-head";
  if (/\b(pastry|baker|patissier)\b/.test(t)) return "kitchen-pastry";
  if (/\b(chef de partie|cdp|line cook|commis)\b/.test(t)) return "kitchen-line";
  if (/\b(kitchen porter|\bkp\b|dishwasher)\b/.test(t)) return "kitchen-porter";
  if (/\b(chef|cook|kitchen)\b/.test(t)) return "kitchen-other";
  if (/\b(barista|server|waiter|waitress|host|bartender|front of house|concierge)\b/.test(t)) return "front-of-house";
  if (/\b(buyer|merchandis|trader|allocator|category)\b/.test(t)) return "buying";
  if (/\b(designer|design|creative|art director|stylist|illustrator)\b/.test(t)) return "creative";
  if (/\b(marketing|brand|pr |press|communications|content|social media)\b/.test(t)) return "marketing";
  if (/\b(sales|account manager|business development|wholesale|partnerships|commercial)\b/.test(t)) return "sales";
  if (/\b(finance|accountant|controller|cfo|treasury)\b/.test(t)) return "finance";
  if (/\b(operations|ops|supply chain|logistics|production manager)\b/.test(t)) return "operations";
  if (/\b(engineer|developer|technical|data|product manager|cto|software)\b/.test(t)) return "tech";
  if (/\b(manager|director|head of|lead|chief|ceo|coo|vp )\b/.test(t)) return "leadership";
  if (/\b(hr|people|talent|recruit)\b/.test(t)) return "people";
  if (/\b(assistant|coordinator|administrator|admin|receptionist)\b/.test(t)) return "support";
  return "other";
}

// Normalised title key - strips seniority words so "Sous Chef", "Senior Sous
// Chef" and "Sous Chef - London" collapse to the same key. Used to cap
// near-identical titles to 1 per digest.
function getTitleKey(title: string): string {
  return (title || "")
    .toLowerCase()
    .replace(/\b(senior|junior|lead|assistant|trainee|graduate|exec|executive|full[- ]time|part[- ]time)\b/g, "")
    .replace(/[-–|,/().]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Diversify jobs across companies AND role families.
 * BRAND-FIRST: jobs from the industry's "Who?" companies are picked first,
 * non-brand jobs only fill remaining slots if there aren't enough brand jobs.
 */
function diversifyJobs(jobs: JobItem[], limit: number, maxPerCompany: number, industry = ""): JobItem[] {
  const brandJobs = jobs.filter((j) => isWhoSectionCompany(industry, j.company));
  const otherJobs = jobs.filter((j) => !isWhoSectionCompany(industry, j.company));

  const pickFrom = (pool: JobItem[], remaining: number, companyCounts: Record<string, number>, familyCounts: Record<string, number>, titleCounts: Record<string, number>) => {
    const result: JobItem[] = [];
    const ranked = [...pool].sort((a, b) =>
      getIndustryRankBoost(industry, b.title, b.company) - getIndustryRankBoost(industry, a.title, a.company)
    );
    const maxPerFamily = Math.max(2, Math.ceil(limit / 4));
    const kitchenSubCap = Math.max(1, Math.ceil(limit / 6));
    const isKitchenSub = (fk: string) => fk.startsWith("kitchen-");
    for (const job of ranked) {
      if (result.length >= remaining) break;
      const ck = (job.company || "").toLowerCase();
      const fk = getRoleFamily(job.title);
      const tk = getTitleKey(job.title);
      if ((companyCounts[ck] || 0) >= maxPerCompany) continue;
      const familyCap = isKitchenSub(fk) ? kitchenSubCap : maxPerFamily;
      if ((familyCounts[fk] || 0) >= familyCap) continue;
      if ((titleCounts[tk] || 0) >= 1) continue; // only 1 of each near-identical title
      result.push(job);
      companyCounts[ck] = (companyCounts[ck] || 0) + 1;
      familyCounts[fk] = (familyCounts[fk] || 0) + 1;
      titleCounts[tk] = (titleCounts[tk] || 0) + 1;
    }
    return result;
  };

  const companyCounts: Record<string, number> = {};
  const familyCounts: Record<string, number> = {};
  const titleCounts: Record<string, number> = {};

  // Pass 1 - brand jobs only.
  const result: JobItem[] = pickFrom(brandJobs, limit, companyCounts, familyCounts, titleCounts);

  // Pass 2 - fill remaining slots with non-brand jobs only if short.
  if (result.length < limit) {
    result.push(...pickFrom(otherJobs, limit - result.length, companyCounts, familyCounts, titleCounts));
  }

  // Final fallback - relax family + title cap, keep company cap.
  if (result.length < limit) {
    for (const job of [...brandJobs, ...otherJobs]) {
      if (result.length >= limit) break;
      if (result.some((r) => r.url === job.url)) continue;
      const ck = (job.company || "").toLowerCase();
      if ((companyCounts[ck] || 0) >= maxPerCompany) continue;
      result.push(job);
      companyCounts[ck] = (companyCounts[ck] || 0) + 1;
    }
  }
  return result;
}

/* ─────────── Personalised job matching (mirrors My Jobs Inbox basics) ─────────── */
interface SubscriberProfile {
  role_preferences: string[] | null;
  industry_interests: string[] | null;
  location_preference: string | null;
  salary_expectation: string | null;
  career_level: string | null;
}

interface ScorableJob {
  id?: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
  salary: string | null;
  industry: string | null;
  career_level?: string | null;
  role_category?: string | null;
  ai_role_category?: string | null;
  work_mode?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
}

const LEVEL_ORDER: Record<string, number> = {
  entry: 0,
  mid: 1,
  senior: 2,
  executive: 3,
};

function normalizeCareerLevel(v: string | null | undefined): string | null {
  if (!v) return null;
  const s = v.toLowerCase().trim();
  if (s in LEVEL_ORDER) return s;
  if (/(exec|director|head|chief|cxo|vp)/.test(s)) return "executive";
  if (/(senior|lead|principal|manager)/.test(s)) return "senior";
  if (/(junior|graduate|entry|intern|apprentice|trainee)/.test(s)) return "entry";
  if (/(mid|associate)/.test(s)) return "mid";
  return null;
}

function parseExpectedSalary(v: string | null): number {
  if (!v) return 0;
  const m = v.replace(/[, ]/g, "").match(/(\d{2,7})/g);
  if (!m) return 0;
  const nums = m.map(Number).filter((n) => n >= 10000);
  if (nums.length === 0) return 0;
  return Math.min(...nums);
}

function jobMaxSalaryNum(job: ScorableJob): number | null {
  if (typeof job.salary_max === "number" && job.salary_max > 0) return job.salary_max;
  if (typeof job.salary_min === "number" && job.salary_min > 0) return job.salary_min;
  if (!job.salary) return null;
  const m = job.salary.replace(/[, ]/g, "").match(/(\d{2,7})/g);
  if (!m) return null;
  const nums = m.map(Number).filter((n) => n > 0).map((n) => (n < 1000 ? n * 2080 : n));
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

function scoreJobForSubscriber(job: ScorableJob, profile: SubscriberProfile): number {
  let weighted = 0;
  let total = 0;

  const titleLc = (job.title || "").toLowerCase();
  const jobCat = ((job.ai_role_category || job.role_category || "") as string).toLowerCase();
  const roles = (profile.role_preferences || []).map((r) => r.toLowerCase().trim()).filter(Boolean);
  const industries = (profile.industry_interests || []).map((i) => i.toLowerCase().trim()).filter(Boolean);
  const userLevel = normalizeCareerLevel(profile.career_level);

  // Role - 35%
  if (roles.length > 0) {
    total += 35;
    const match = roles.some((r) => {
      if (!r) return false;
      if (jobCat && jobCat.includes(r)) return true;
      if (titleLc.includes(r)) return true;
      // simple word splits
      const words = r.split(/[\s/-]+/).filter((w) => w.length > 2);
      return words.some((w) => titleLc.includes(w));
    });
    if (match) weighted += 35;
  }

  // Industry - 30%
  if (industries.length > 0) {
    total += 30;
    if (job.industry && industries.some((i) => i === job.industry!.toLowerCase().trim())) {
      weighted += 30;
    }
  }

  // Career level - 20% (within 1 step)
  if (userLevel) {
    total += 20;
    const jobLvl = normalizeCareerLevel(job.career_level || null);
    if (jobLvl) {
      const diff = Math.abs((LEVEL_ORDER[userLevel] ?? 1) - (LEVEL_ORDER[jobLvl] ?? 1));
      if (diff === 0) weighted += 20;
      else if (diff === 1) weighted += 12;
    } else {
      // unknown job level - don't penalise
      weighted += 10;
    }
  }

  // Location - 10%
  if (profile.location_preference) {
    total += 10;
    const pref = profile.location_preference.toLowerCase();
    if (job.location && job.location.toLowerCase().includes(pref)) weighted += 10;
    else if ((job.work_mode || "").toLowerCase() === "remote" && pref === "remote") weighted += 10;
  }

  // Salary - 5% (lighter touch in newsletter)
  const wanted = parseExpectedSalary(profile.salary_expectation);
  if (wanted > 0) {
    total += 5;
    const jobMax = jobMaxSalaryNum(job);
    if (jobMax === null) weighted += 2.5; // unknown - half credit
    else if (jobMax >= wanted) weighted += 5;
    else if (jobMax >= wanted * 0.85) weighted += 3;
  }

  if (total === 0) return Math.max(0, getIndustryRankBoost(job.industry || "", job.title, job.company));
  // Add industry brand boost on top so recognisable employers and on-target titles win ties
  return Math.round((weighted / total) * 100) + getIndustryRankBoost(job.industry || "", job.title, job.company);
}

/**
 * Pick top N personalised jobs - BRAND-FIRST: jobs from the industry's "Who?"
 * companies are picked before any non-brand jobs (regardless of relevance score).
 * Non-brand jobs only fill remaining slots if there aren't enough brand jobs.
 */
function pickPersonalisedJobs(
  jobs: ScorableJob[],
  profile: SubscriberProfile,
  limit: number,
  maxPerCompany = 2,
): JobItem[] {
  const industry = (jobs[0]?.industry || "").toLowerCase();
  const scored = jobs
    .map((j) => ({ job: j, score: scoreJobForSubscriber(j, profile), brand: isWhoSectionCompany(j.industry || "", j.company) }))
    .sort((a, b) => b.score - a.score);

  const brandPool = scored.filter((s) => s.brand);
  const otherPool = scored.filter((s) => !s.brand);

  const perCompany: Record<string, number> = {};
  const perFamily: Record<string, number> = {};
  const perTitle: Record<string, number> = {};
  const maxPerFamily = Math.max(2, Math.ceil(limit / 4));
  const kitchenSubCap = Math.max(1, Math.ceil(limit / 6));
  const isKitchenSub = (fk: string) => fk.startsWith("kitchen-");

  const pickFrom = (pool: typeof scored, remaining: number): JobItem[] => {
    const picked: JobItem[] = [];
    for (const { job } of pool) {
      if (picked.length >= remaining) break;
      const ck = (job.company || "").toLowerCase();
      const fk = getRoleFamily(job.title);
      const tk = getTitleKey(job.title);
      if ((perCompany[ck] || 0) >= maxPerCompany) continue;
      const familyCap = isKitchenSub(fk) ? kitchenSubCap : maxPerFamily;
      if ((perFamily[fk] || 0) >= familyCap) continue;
      if ((perTitle[tk] || 0) >= 1) continue; // only 1 of each near-identical title
      picked.push({ title: job.title, company: job.company, location: job.location, url: job.url, salary: job.salary });
      perCompany[ck] = (perCompany[ck] || 0) + 1;
      perFamily[fk] = (perFamily[fk] || 0) + 1;
      perTitle[tk] = (perTitle[tk] || 0) + 1;
    }
    return picked;
  };

  // Pass 1 - brand jobs only.
  const out: JobItem[] = pickFrom(brandPool, limit);

  // Pass 2 - fill with non-brand jobs only if short.
  if (out.length < limit) {
    out.push(...pickFrom(otherPool, limit - out.length));
  }

  // Final fallback - relax family cap.
  if (out.length < limit) {
    for (const { job } of [...brandPool, ...otherPool]) {
      if (out.length >= limit) break;
      if (out.some((r) => r.url === job.url)) continue;
      const ck = (job.company || "").toLowerCase();
      if ((perCompany[ck] || 0) >= maxPerCompany) continue;
      out.push({ title: job.title, company: job.company, location: job.location, url: job.url, salary: job.salary });
      perCompany[ck] = (perCompany[ck] || 0) + 1;
    }
  }
  return out;
}

/**
 * AI quality gate: filters content for relevance before including in digest.
 * Returns filtered arrays of news and articles.
 */
// ---------------------------------------------------------------------------
// Entity-based near-duplicate dedup (deterministic, no AI).
// Catches "same story, different headlines" cases that Jaccard misses because
// the wording diverges (e.g. "Michael defies critics" vs "Michael moonwalks
// to No.1" vs "Michael Jackson biopic smashes record" - only "Michael" and
// "box office" overlap, well under any sane Jaccard threshold).
// ---------------------------------------------------------------------------
const STOP_PROPER = new Set([
  "The","A","An","And","Or","But","For","With","From","Into","Over","Under",
  "UK","US","USA","U.K.","U.S.","BBC","ITV","Sky","Netflix","Amazon","Apple",
  "Google","Meta","BFI","NHS","London","Britain","British","England","Scotland",
  "Wales","Ireland","Europe","World","Today","Yesterday","New","Top","Best",
  "Inc","Ltd","Plc","No","Mr","Mrs","Ms","Dr","Sir","Dame",
  // Common nouns that get capitalised in headline case but aren't entities:
  "Box","Office","Film","Films","Movie","Movies","Star","Stars","Show","Shows",
  "Series","Season","Episode","News","Report","Reports","Update","Updates",
  "Forecast","Weekend","Opening","Record","History","Highest","Grossing",
  "Set","Thrill","Becomes","Bollywood","Hollywood","Beats","Wins",
]);
const TOPIC_VERBS = /\b(wins?|won|tops?|topped|smashes?|smashed|beats?|beat|opens?|opened|opening|defies?|defied|moonwalks?|moonwalked|debuts?|debuted|takes?|took|leads?|led|crowns?|crowned|reigns?|dominates?|dominated|nears?|hits?|hit|sets?|set|breaks?|broke|launches?|launched|reveals?|revealed|unveils?|unveiled|announces?|announced|appoints?|appointed|names?|named|reports?|reported|raises?|raised|acquires?|acquired|buys?|bought|sells?|sold|closes?|closed|opens?|cuts?|cut|hires?|hired|fires?|fired|exits?|joins?|launches?)\b/i;
const MONEY_RE = /£\s?\d[\d.,]*\s?(?:m|bn|k|million|billion|thousand)?/gi;
const QUOTED_TITLE_RE = /['‘"“]([A-Z][^'’"”]{1,80})['’"”]/g;
const PROPER_PHRASE_RE = /\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+){0,3})\b/g;

function extractEntitySignal(title: string): {
  propers: Set<string>;
  money: Set<string>;
  topicHit: boolean;
  hasBoxOffice: boolean;
} {
  const propers = new Set<string>();
  const money = new Set<string>();

  // Normalise SHOUTING tokens to Titlecase so "MICHAEL" matches "Michael".
  const normalised = title.replace(/\b[A-Z]{2,}\b/g, (w) =>
    w[0] + w.slice(1).toLowerCase()
  );

  // Quoted titles ('Michael', "The Mummy") count as strong proper nouns.
  // Each significant token in the quoted title is added individually so
  // "Michael Jackson" still matches a plain "Michael".
  for (const m of normalised.matchAll(QUOTED_TITLE_RE)) {
    const v = m[1].trim();
    for (const tok of v.split(/\s+/)) {
      if (tok.length >= 3 && !STOP_PROPER.has(tok)) {
        propers.add(tok.toLowerCase());
      }
    }
  }
  // Capitalised tokens (each one individually) - names, brands, films.
  // Skip the very first token of the title to avoid sentence-initial false
  // positives, unless it looks like a name (followed by another capitalised
  // token).
  let firstSeen = false;
  for (const m of normalised.matchAll(/\b([A-Z][a-zA-Z0-9]{2,})\b/g)) {
    const tok = m[1];
    if (!firstSeen) {
      firstSeen = true;
      // Allow first token only if it's clearly a known proper noun
      // (e.g. it appears multiple times or has neighbours). Cheap heuristic:
      // skip first token if it's a common stop word OR a topic verb root.
      if (STOP_PROPER.has(tok) || TOPIC_VERBS.test(tok)) continue;
    }
    if (STOP_PROPER.has(tok)) continue;
    if (TOPIC_VERBS.test(tok)) continue;
    propers.add(tok.toLowerCase());
  }
  for (const m of normalised.matchAll(MONEY_RE)) {
    money.add(m[0].toLowerCase().replace(/\s+/g, ""));
  }
  return {
    propers,
    money,
    topicHit: TOPIC_VERBS.test(title),
    hasBoxOffice: /\bbox[\s-]?office\b/i.test(title),
  };
}

const SOURCE_PRIORITY: Array<[RegExp, number]> = [
  [/screendaily/i, 100],
  [/deadline/i, 95],
  [/variety/i, 95],
  [/hollywoodreporter/i, 95],
  [/bbc\./i, 90],
  [/theguardian|guardian\./i, 90],
  [/ft\.com|financial\s*times/i, 90],
  [/reuters/i, 88],
  [/televisual/i, 85],
  [/broadcastnow|campaignlive|adweek/i, 80],
  [/news\.google\.com/i, 20], // aggregator wrappers - deprioritise
];
function sourceScore(src: string): number {
  for (const [re, score] of SOURCE_PRIORITY) if (re.test(src || "")) return score;
  return 50;
}
function pickBestVariant(items: NewsItem[]): NewsItem {
  return [...items].sort((a, b) => {
    const sa = sourceScore(a.source);
    const sb = sourceScore(b.source);
    if (sa !== sb) return sb - sa;
    // Prefer the longer, less clickbait-y headline (no ALL CAPS shouting).
    return b.title.length - a.title.length;
  })[0];
}

/**
 * Collapse near-duplicate headlines that share a lead proper noun + a topic
 * signal (money figure, action verb, or "box office"). Order is preserved
 * (earliest item in each cluster wins position; strongest variant wins text).
 */
function collapseEntityDuplicates(items: NewsItem[], label = ""): NewsItem[] {
  if (items.length <= 1) return items;
  const sigs = items.map((it) => extractEntitySignal(it.title));
  const clusterOf = new Array(items.length).fill(-1);
  const clusters: number[][] = [];

  for (let i = 0; i < items.length; i++) {
    if (clusterOf[i] !== -1) continue;
    const ci = clusters.length;
    clusters.push([i]);
    clusterOf[i] = ci;
    const A = sigs[i];
    if (A.propers.size === 0) continue;
    for (let j = i + 1; j < items.length; j++) {
      if (clusterOf[j] !== -1) continue;
      const B = sigs[j];
      if (B.propers.size === 0) continue;
      // Share at least one proper noun?
      let shared = false;
      for (const p of A.propers) if (B.propers.has(p)) { shared = true; break; }
      if (!shared) continue;
      // Share at least one topic signal?
      let topicShared = false;
      if (A.hasBoxOffice && B.hasBoxOffice) topicShared = true;
      if (!topicShared && A.topicHit && B.topicHit) topicShared = true;
      if (!topicShared) {
        for (const m of A.money) if (B.money.has(m)) { topicShared = true; break; }
      }
      if (!topicShared) continue;
      clusters[ci].push(j);
      clusterOf[j] = ci;
    }
  }

  const out: NewsItem[] = [];
  for (const cluster of clusters) {
    const variants = cluster.map((idx) => items[idx]);
    const winner = pickBestVariant(variants);
    out.push(winner);
    if (variants.length > 1 && label) {
      const dropped = variants.filter((v) => v.url !== winner.url).map((v) => `"${v.title}"`).join(" | ");
      console.log(`[${label}] entity-dedup: collapsed ${variants.length} variants (kept "${winner.title}" - ${winner.source}; dropped: ${dropped})`);
    }
  }
  return out;
}

async function aiFilterDigestContent(
  news: NewsItem[],
  articles: NewsItem[],
  industry: string,
  apiKey: string
): Promise<{ news: NewsItem[]; articles: NewsItem[] }> {
  const allItems = [
    ...news.map((n, i) => ({ idx: i, type: 'news' as const, title: n.title, source: n.source })),
    ...articles.map((a, i) => ({ idx: i, type: 'article' as const, title: a.title, source: a.source })),
  ];

  if (allItems.length === 0) return { news, articles };

  const context = INDUSTRY_CONTEXT[industry] || industry;
  const numberedList = allItems.map((item, i) => `${i}. [${item.type}] [${item.source}] ${item.title}`).join('\n');

  const prompt = `You are a ruthlessly selective newsletter editor for a UK-focused career daily digest about the "${formatIndustryName(industry)}" industry.

Industry context: ${context}

Below is a list of items for today's digest. Each is tagged [news] or [article].

NEWS (Breaking News section) = timely headlines. Things that just happened. Announcements, appointments, earnings, launches, closures. Quick factual updates. AIM: 5-8 strong headlines max.

ARTICLE (Going Deeper section) = thoughtful viewpoints, perspectives, opinion pieces, analysis, behind-the-scenes features, long-form profiles, "why this matters" explainers, career insights. These should feel like a morning briefing - decode the industry, go behind the scenes. AIM: 2-4 genuinely insightful pieces max.

ABSOLUTE TOPIC RULE - APPLY FIRST:
- Every kept item MUST clearly be about the ${formatIndustryName(industry)} industry as defined above.
- REJECT any item that is obviously about a different industry, even if it slipped into the pool (e.g. fashion, legal, beauty, tech retail items in an estate-agency pool). When in doubt, reject.

STRICT RULES FOR [article] ITEMS - BE VERY SELECTIVE:
- The test: Could this headline appear on a news ticker? If yes, REJECT it even though it's tagged [article].
- Only KEEP [article] items that are genuinely analytical, opinionated, or feature-length.
- Headlines like "X launches Y", "X appoints Y", "X reports Q2 results", "X opens new venue" are NEWS, not articles - REJECT them from the [article] category.
- MAXIMUM 4 articles. It's better to have 2 outstanding deep pieces than 4 mediocre ones.
- "Best of" lists, roundups, buying guides, and listicles are NOT deep analysis - REJECT.

STRICT RULES FOR [news] ITEMS:
- For fashion, footwear, and product-driven industries: product launches, collaborations, and new releases ARE legitimate business news - KEEP them.
- REJECT hyper-local stories: a single venue opening in one town, a local shop closure, a regional event. Keep big-picture, national, or industry-wide news only.
- REJECT: US-only news with no UK relevance, pure consumer "best of" lists or buying guides, celebrity gossip unrelated to the industry business, match results or scores, recipes or lifestyle tips, app/tech product press releases unrelated to the industry.
- MAXIMUM 6 news items. Pick the strongest.

CRITICAL DEDUP RULE - ENFORCE AGGRESSIVELY:
- If two or more headlines mention the SAME film, person, company, product launch, or event, you MUST keep AT MOST ONE - even if the wording is completely different.
- "Same story" includes: same film at the box office, same appointment, same earnings release, same launch, same closure.
- A national-paper rewrite of a wire story is the same story - pick one.
- If a [news] item and an [article] item cover the same story, KEEP only the [news] version.
- Worked example - these are ALL the same story, keep ONE only:
    "'Michael' tops UK box office with £8.4m"
    "Michael moonwalks to No. 1 at U.K., Ireland Box Office"
    "Michael Jackson biopic smashes opening-weekend record"
    "Michael set for second biggest opening of 2026"
- Worked example - these are ALL the same story, keep ONE only:
    "Acme appoints Jane Smith as new CEO"
    "Jane Smith named CEO of Acme"
    "Acme names Smith to top job"
- When in doubt, drop. Better six unique stories than eight with duplicates.

Items:
${numberedList}

Return ONLY a JSON array of the index numbers of items to KEEP, e.g. [0, 2, 5]. If none are relevant, return [].`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a precise content relevance filter for a professional newsletter. Return only a JSON array of index numbers.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      console.warn('AI digest filter failed, keeping all:', response.status);
      return { news, articles };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    const jsonMatch = content.match(/\[[\d,\s]*\]/);
    if (jsonMatch) {
      const keepIndices = new Set<number>(JSON.parse(jsonMatch[0]));
      
      const filteredNews: NewsItem[] = [];
      const filteredArticles: NewsItem[] = [];
      
      for (const item of allItems) {
        const globalIdx = allItems.indexOf(item);
        if (keepIndices.has(globalIdx)) {
          if (item.type === 'news') filteredNews.push(news[item.idx]);
          else filteredArticles.push(articles[item.idx]);
        }
      }

      // SAFETY FLOOR: never let the AI filter strip a section to <4 news / <2 articles
      // when the source pool actually has more. We had real-world cases where Gemini
      // returned just 1 headline for industries with 40+ valid news rows.
      const NEWS_FLOOR = 4;
      const ARTICLE_FLOOR = 2;
      if (filteredNews.length < NEWS_FLOOR && news.length >= NEWS_FLOOR) {
        const keptUrls = new Set(filteredNews.map(n => n.url));
        for (const n of news) {
          if (filteredNews.length >= NEWS_FLOOR) break;
          if (!keptUrls.has(n.url)) filteredNews.push(n);
        }
      }
      if (filteredArticles.length < ARTICLE_FLOOR && articles.length >= ARTICLE_FLOOR) {
        const keptUrls = new Set(filteredArticles.map(a => a.url));
        for (const a of articles) {
          if (filteredArticles.length >= ARTICLE_FLOOR) break;
          if (!keptUrls.has(a.url)) filteredArticles.push(a);
        }
      }

      console.log(`AI digest filter for ${industry}: news ${news.length}→${filteredNews.length}, articles ${articles.length}→${filteredArticles.length}`);
      return { news: filteredNews, articles: filteredArticles };
    }

    return { news, articles };
  } catch (err) {
    console.warn('AI digest filter error, keeping all:', err);
    return { news, articles };
  }
}

/**
 * Trigger content refresh for a specific industry if content is thin.
 */
async function refreshIndustryContent(industry: string, supabaseUrl: string, anonKey: string): Promise<void> {
  console.log(`Content thin for ${industry}, triggering refresh...`);
  
  const calls = ['fetch-rss-news', 'scrape-articles'].map(async (fn) => {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ industry }),
      });
      const data = await res.json();
      console.log(`Refresh ${fn} for ${industry}:`, data);
    } catch (err) {
      console.warn(`Refresh ${fn} failed for ${industry}:`, err);
    }
  });

  await Promise.allSettled(calls);
}

/**
 * Generate a narrative editorial briefing from articles, styled as a Morning News briefing.
 */
async function generateEditorialBriefing(
  articles: NewsItem[],
  news: NewsItem[],
  industry: string,
  apiKey: string
): Promise<BriefingSection | null> {
  if (articles.length === 0 && news.length === 0) return null;

  const context = INDUSTRY_CONTEXT[industry] || industry;
  const industryName = formatIndustryName(industry);

  const articleList = articles.map((a, i) => `[A${i}] "${a.title}" (${a.source}) - ${a.url}`).join('\n');
  const newsList = news.map((n, i) => `[N${i}] "${n.title}" (${n.source})`).join('\n');

  const prompt = `You are a sharp, professional UK newsletter editor writing the "Going Deeper" morning briefing for the ${industryName} industry.

Industry context: ${context}

You have TWO pools of content to draw from:

BREAKING NEWS (already shown separately - DO NOT repeat these as headlines, but you can reference them for context):
${newsList || 'None today.'}

ARTICLES (your primary source for the briefing):
${articleList || 'None today.'}

Write a concise editorial briefing with EXACTLY 3 sections. Use a professional, slightly witty British tone - like the FT or City AM morning briefing.

SECTION 1 - "Main News" (2-3 short paragraphs)
Synthesize the most important stories from the ARTICLES into a narrative. Don't just list headlines - connect the dots, explain why it matters for the industry. Reference the underlying trends. If articles overlap with breaking news stories, go DEEPER - add context, analysis, what it means.

SECTION 2 - "People" (1-2 short paragraphs)
STRICTLY limited to genuine appointments, resignations, promotions, and career moves. Senior hires, CEO changes, board moves. If there are no genuine people moves in the articles or news, write "No major moves to report today." Do NOT pad this with general news about people doing things.

SECTION 3 - "The Takeaway" (1 paragraph)
What does today's news mean for someone building a career in ${industryName}? Industry direction, skills in demand, companies to watch.

AI ANGLE (IMPORTANT):
Scan the ARTICLES for any stories involving artificial intelligence, machine learning, automation, generative AI, algorithmic tools, or AI-powered products being applied within the ${industryName} industry. If you find a genuine, substantive AI-related story (not a passing mention), weave it explicitly into "Main News" and flag it with the phrase "AI angle:" at the start of that sentence or paragraph so readers can spot it. Examples: AI used in scouting/recruitment, AI-driven design, AI in customer service, automation of supply chains, generative tools changing creative workflows. DO NOT invent or stretch - only surface AI angles that are clearly present in the source articles. If there is no genuine AI story today, simply omit this - do NOT force it.

FORMAT RULES:
- Write in flowing prose, NOT bullet points
- Keep each section punchy - max 150 words per section
- DO NOT repeat breaking news headlines verbatim
- CRITICAL - LINKING: Every time you reference a story from an ARTICLE, wrap a meaningful phrase from your sentence (3-8 words describing the story, e.g. the company name + what happened, or the topic) using Markdown link syntax pointing to the article tag, like [the 30% surge in backyard chickens](A1) or [Mars Petcare's acquisition of Kinship](A0). The phrase MUST be substantive text the reader can see and tap - never use bare tags like [A1] or arrows. Every article you reference MUST have at least one clickable phrase.
- Return as JSON: { "mainNews": "...", "people": "...", "takeaway": "...", "citedArticles": [0, 2, 3] }
  where citedArticles is the array of article indices referenced`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional newsletter editor. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
      }),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      console.warn('Editorial briefing generation failed:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not parse editorial briefing JSON');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const citedIndices: number[] = parsed.citedArticles || [];

    let mainNews = parsed.mainNews || '';
    let people = parsed.people || '';
    let takeaway = parsed.takeaway || '';

    // Replace Markdown-style [phrase](A0) references with full clickable links.
    // Also handles legacy bare [A0] tags (fallback to a small arrow) for back-compat.
    const linkStyle = 'color:#1a1a1a; text-decoration:underline; text-decoration-color:#00e600; text-decoration-thickness:2px; text-underline-offset:3px; font-weight:600;';
    const referencedIndices = new Set<number>();
    const wrap = (text: string): string => {
      // 1) Markdown-style: [visible phrase](A0)
      let out = text.replace(/\[([^\]]+)\]\(A(\d+)\)/g, (_m, phrase, idxStr) => {
        const i = Number(idxStr);
        if (i >= articles.length || !articles[i]?.url) return phrase;
        referencedIndices.add(i);
        return `<a href="${articles[i].url}" style="${linkStyle}">${phrase}</a>`;
      });
      // 2) Legacy bare [A0] tags - keep working as a fallback arrow
      for (let i = 0; i < articles.length; i++) {
        const arrow = `<a href="${articles[i].url}" style="color:#00e600; text-decoration:underline;">[→]</a>`;
        const re = new RegExp(`\\[A${i}\\]`, 'g');
        if (re.test(out)) {
          referencedIndices.add(i);
          out = out.replace(new RegExp(`\\[A${i}\\]`, 'g'), arrow);
        }
      }
      return out;
    };
    mainNews = wrap(mainNews);
    people = wrap(people);
    takeaway = wrap(takeaway);

    // Union of AI-self-reported citations + phrases we actually linked.
    // Guarantees every referenced article is recoverable in the Sources footer
    // even if the AI mentions a story without wrapping it in a clickable phrase.
    const allReferenced = new Set<number>([...citedIndices, ...referencedIndices]);
    const sourceLinks = Array.from(allReferenced)
      .filter(i => i < articles.length && articles[i]?.url)
      .map(i => ({ title: articles[i].title, url: articles[i].url }));

    console.log(`Editorial briefing for ${industry}: mainNews=${mainNews.length}chars, people=${people.length}chars, takeaway=${takeaway.length}chars, sources=${sourceLinks.length}`);

    return { mainNews, people, takeaway, sourceLinks };
  } catch (err) {
    console.warn('Editorial briefing generation error:', err);
    return null;
  }
}

// ============================================================
// CLICK TRACKER - wraps outbound newsletter URLs through the
// click-tracker edge function so we can attribute clicks to
// the subscriber + log into user_interactions (employer engagement).
// ============================================================
const CLICK_TRACKER_BASE = `${Deno.env.get("SUPABASE_URL") || "https://siqwclmzncubkrwabmvb.supabase.co"}/functions/v1/click-tracker`;
function trackUrl(
  rawUrl: string,
  opts: { kind: "job" | "news" | "link"; sub?: string; ind?: string; jid?: string; co?: string },
): string {
  if (!rawUrl) return rawUrl;
  // Skip non-http (mailto:, tel:) and our own unsubscribe / app routes - no benefit tracking those.
  if (!/^https?:\/\//i.test(rawUrl)) return rawUrl;
  const params = new URLSearchParams();
  params.set("u", rawUrl);
  params.set("kind", opts.kind);
  if (opts.sub) params.set("sub", opts.sub);
  if (opts.ind) params.set("ind", opts.ind);
  if (opts.jid) params.set("jid", opts.jid);
  if (opts.co) params.set("co", opts.co);
  return `${CLICK_TRACKER_BASE}?${params.toString()}`;
}

// ============================================================
// TABLOID PILOT - Booklet-style newsletter (Edition 01 aesthetic)
// Wired behind ?style=tabloid query param so it does NOT replace
// the live newsletter. Use buildEmailHtmlTabloid for previews.
// ============================================================
const INDUSTRY_JOB_TAGLINES: Record<string, string> = {
  "bakery": "Oven ready jobs",
  "beauty": "Good looking jobs",
  "beer": "Jobs on tap today",
  "cars": "Jobs to get you motoring",
  "charity": "Good jobs for good people",
  "cinema": "Ready for a new starring role?",
  "film-tv": "Ready for a new starring role?",
  "film and tv": "Ready for a new starring role?",
  "ai": "Smart jobs for smart minds",
  "coffee": "What's brewing today?",
  "estate agency": "Ready to make your next move?",
  "estate-agency": "Ready to make your next move?",
  "fashion": "Jobs tailored for you",
  "food & drink": "Tasty roles served up for you",
  "food and drink": "Tasty roles served up for you",
  "food-drink": "Tasty roles served up for you",
  "football": "Kick off something new or fancy a transfer?",
  "footwear": "Step into your next role?",
  "gaming": "Enter a new level",
  "grocery": "A basket of jobs for you",
  "interior design": "Well designed jobs, with real style",
  "interior-design": "Well designed jobs, with real style",
  "jewellery": "Jobs worth their weight in gold",
  "journalism": "Hold the front page, have we got jobs for you…",
  "music": "Find your next gig…",
  "pets": "Unleash your next role",
  "physiotherapy": "Hands on roles that make a difference…",
  "psychotherapy": "Jobs to get you thinking…",
  "teaching": "Top of the class jobs…",
  "travel": "Ready to start a new journey?",
  "wellness": "A healthy selection of new jobs…",
  "farming": "The best of the crop",
  "money": "Jobs you can count on",
  "health": "Look what the Doctor ordered",
  "horse racing": "Be first past the post",
  "horse-racing": "Be first past the post",
};

function getIndustryJobTagline(industry: string): string {
  const key = (industry || "").toLowerCase().trim();
  if (INDUSTRY_JOB_TAGLINES[key]) return INDUSTRY_JOB_TAGLINES[key];
  const variants = [
    key.replace(/-/g, " "),
    key.replace(/-/g, " & "),
    key.replace(/-/g, " and "),
    key.replace(/\s+/g, "-"),
    key.replace(/\s*&\s*/g, "-"),
    key.replace(/\s+and\s+/g, "-"),
  ];
  for (const v of variants) {
    if (INDUSTRY_JOB_TAGLINES[v]) return INDUSTRY_JOB_TAGLINES[v];
  }
  return "no boring job boards.";
}

function buildEmailHtmlTabloid(
  industry: string,
  news: NewsItem[],
  articles: NewsItem[],
  jobs: JobItem[],
  unsubscribeUrl: string,
  subscriberName: string,
  totalJobCount: number,
  briefing?: BriefingSection | null,
  personalised: boolean = false,
  nudgeSignup: boolean = false,
  subscriberEmail: string = "",
): string {
  const rawFirst = subscriberName.split(" ")[0] || subscriberName;
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const editionStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, ".");
  const industryTitle = formatIndustryName(industry);
  const industryIconUrl = INDUSTRY_ICONS[industry.toLowerCase()] || "";
  const marketplaceUrl = `https://howdoyoudo.group/marketplace?industry=${encodeURIComponent(industryTitle)}&ref=email`;

  const topJobs = jobs.slice(0, 3);
  const moreJobs = jobs.slice(3, 8);

  // Lead headline: prefer breaking news → fallback to first article
  const leadStory = news[0] || articles[0];
  const subHeadlines = news.slice(1, 4);

  const fontStack = `'Helvetica Neue', Helvetica, Arial, sans-serif`;
  const displayFont = `'Arial Black', 'Helvetica Neue', Impact, sans-serif`;
  // Dela Gothic One = the same chunky display font used on the website + booklet.
  // Falls back to Arial Black on email clients that strip the @import (Outlook, etc.)
  const mastheadFont = `'Dela Gothic One', 'Arial Black', Impact, sans-serif`;
  const handFont = `'Bradley Hand', 'Comic Sans MS', cursive`;

  const subHeadlineHtml = subHeadlines.map(n => `
    <tr>
      <td style="padding:14px 0; border-bottom:1px solid #1a1a1a;">
        <a href="${trackUrl(n.url, { kind: 'news', sub: subscriberEmail, ind: industry })}" style="color:#1a1a1a; text-decoration:none; font-weight:900; font-size:18px; line-height:1.15; font-family:${displayFont}; letter-spacing:-0.5px;">${n.title}</a>
        <div style="color:#1a1a1a; font-size:10px; text-transform:uppercase; letter-spacing:2px; margin-top:6px; font-weight:700; font-family:${fontStack};">${n.source}</div>
      </td>
    </tr>`).join('');

  const topJobsHtml = topJobs.map(j => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #1a1a1a;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td width="48" valign="top" style="width:48px; padding-right:12px;">${companyLogoCell(j.company, industry)}</td>
            <td valign="top">
              <a href="${trackUrl(j.url, { kind: 'job', sub: subscriberEmail, ind: industry, jid: (j as any).id, co: (j as any).company })}" style="color:#1a1a1a; text-decoration:none; font-weight:900; font-size:15px; line-height:1.25; font-family:${displayFont}; letter-spacing:-0.3px;">${j.title}</a>
              <div style="color:#1a1a1a; font-size:11px; margin-top:3px; font-family:${fontStack}; text-transform:uppercase; letter-spacing:1px; font-weight:700;">${j.company}${j.location ? ` · ${j.location}` : ''}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  const moreJobsHtml = moreJobs.map(j => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px dotted #1a1a1a;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td width="36" valign="top" style="width:36px; padding-right:10px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="36" height="36" style="border-collapse:collapse;">
                <tr><td style="width:36px; height:36px;">${companyLogoCell(j.company, industry).replace(/width="48"/g,'width="36"').replace(/height="48"/g,'height="36"').replace(/width:48px/g,'width:36px').replace(/height:48px/g,'height:36px').replace(/font-size:14px/g,'font-size:11px')}</td></tr>
              </table>
            </td>
            <td valign="top">
              <a href="${trackUrl(j.url, { kind: 'job', sub: subscriberEmail, ind: industry, jid: (j as any).id, co: (j as any).company })}" style="color:#1a1a1a; text-decoration:none; font-weight:700; font-size:13px; line-height:1.3; font-family:${fontStack};">${j.title}</a>
              <div style="color:#555; font-size:11px; margin-top:2px; font-family:${fontStack};">${j.company}${j.location ? ` · ${j.location}` : ''}${j.salary ? ` · ${j.salary}` : ''}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  // Going Deeper as a magazine-style article
  let goingDeeperHtml = '';
  if (briefing) {
    const para = `font-size:15px; color:#1a1a1a; line-height:1.55; font-family:Georgia, 'Times New Roman', serif; margin:0 0 14px 0;`;
    const dropCap = `font-family:${displayFont}; font-size:54px; font-weight:900; color:#1a1a1a; float:left; line-height:0.9; padding:6px 10px 0 0; letter-spacing:-2px;`;
    const subhead = `font-size:11px; color:#1a1a1a; text-transform:uppercase; letter-spacing:3px; font-weight:900; margin:22px 0 10px 0; font-family:${displayFont}; border-bottom:3px solid #00e600; padding-bottom:6px; display:inline-block;`;
    // Add drop cap to first paragraph
    const mainNewsWithCap = briefing.mainNews.replace(/^(<p[^>]*>)?(.)/, (_, p, c) => `${p || ''}<span style="${dropCap}">${c}</span>`);
    goingDeeperHtml = `
      <h3 style="${subhead}">The Main News</h3>
      <div style="${para}">${mainNewsWithCap}</div>
      <h3 style="${subhead}">The People</h3>
      <div style="${para}">${briefing.people}</div>
      <h3 style="${subhead}">The Takeaway</h3>
      <div style="${para}">${briefing.takeaway}</div>
      ${briefing.sourceLinks.length > 0 ? `
      <p style="font-size:10px; color:#555; margin:18px 0 0 0; font-family:${fontStack}; text-transform:uppercase; letter-spacing:1.5px;">
        Sources: ${briefing.sourceLinks.map(s => `<a href="${s.url}" style="color:#555; text-decoration:underline;">${s.title.slice(0, 40)}${s.title.length > 40 ? '…' : ''}</a>`).join(' · ')}
      </p>` : ''}`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap');
  </style>
</head>
<body style="margin:0; padding:0; background-color:#e8e8e0; font-family:${fontStack};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e8e8e0;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#ffffff; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- TOP GREEN STRIP (Edition bar) -->
          <tr>
            <td style="background-color:#00e600; padding:10px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:${displayFont}; font-size:11px; font-weight:900; color:#1a1a1a; letter-spacing:1.5px; text-transform:uppercase;">
                    How do you do? · Unpacking the industries we love and live in
                  </td>
                  <td align="right" style="font-family:${displayFont}; font-size:11px; font-weight:900; color:#1a1a1a; letter-spacing:1.5px; text-transform:uppercase; white-space:nowrap;">
                    Ed. ${editionStr}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MASTHEAD -->
          <tr>
            <td style="padding:36px 28px 20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">
                    <p style="margin:0 0 14px 0; font-size:11px; color:#1a1a1a; text-transform:uppercase; letter-spacing:3px; font-weight:900; font-family:${displayFont};">
                      A daily bulletin · ${industryTitle}
                    </p>
                  </td>
                  ${industryIconUrl ? `
                  <td align="right" valign="middle" width="64" style="width:64px;">
                    <img src="${industryIconUrl}?v=2" alt="${industryTitle}" width="56" height="56" style="display:block; width:56px; height:56px; border-radius:50%; border:2px solid #1a1a1a; background:#ffffff;" />
                  </td>
                  ` : ''}
                </tr>
              </table>
              <img src="${ASSET_BASE}/howdoyoudo-wordmark.png" alt="How do you do?" width="360" height="155" style="display:block; width:360px; height:auto; max-width:100%; margin:0;" />

              <p style="margin:18px 0 0 0; font-family:${displayFont}; font-size:22px; font-weight:900; color:#1a1a1a; letter-spacing:-0.5px; line-height:1.15;">
                Good morning ${firstName}<span style="color:#00e600;">.</span>
              </p>
              <p style="margin:8px 0 0 0; font-family:${fontStack}; font-size:14px; color:#1a1a1a; line-height:1.5;">
                What's happening in the world of ${industryTitle} today - who's moved, where to work next. ${dateStr}.
              </p>

              <!-- Stat chips -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                <tr>
                  <td style="border:2px solid #1a1a1a; padding:7px 12px; font-family:${displayFont}; font-size:10px; font-weight:900; letter-spacing:1.5px; text-transform:uppercase; color:#1a1a1a;">${news.length + articles.length} Headlines</td>
                  <td style="width:8px;"></td>
                  <td style="border:2px solid #1a1a1a; padding:7px 12px; font-family:${displayFont}; font-size:10px; font-weight:900; letter-spacing:1.5px; text-transform:uppercase; color:#1a1a1a;">${totalJobCount.toLocaleString()} Jobs Live</td>
                  <td style="width:8px;"></td>
                  <td style="border:2px solid #1a1a1a; padding:7px 12px; font-family:${displayFont}; font-size:10px; font-weight:900; letter-spacing:1.5px; text-transform:uppercase; color:#1a1a1a;">Daily Briefing</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HOWDY:SECTION-START -->

          <!-- GREEN ACCENT BAR -->
          <tr><td style="padding:0 28px;"><div style="height:6px; background-color:#00e600;"></div></td></tr>

          <!-- LEAD HEADLINE (the big tabloid splash) -->
          ${leadStory ? `
          <tr>
            <td style="padding:24px 28px 8px 28px;">
              <p style="margin:0 0 8px 0; font-family:${displayFont}; font-size:10px; color:#00e600; text-transform:uppercase; letter-spacing:3px; font-weight:900;">
                ▼ Today's Lead Story
              </p>
              <a href="${trackUrl(leadStory.url, { kind: 'news', sub: subscriberEmail, ind: industry })}" style="text-decoration:none; color:#1a1a1a;">
                <h2 style="margin:0; font-family:${displayFont}; font-size:24px; font-weight:900; color:#1a1a1a; letter-spacing:-0.8px; line-height:1.05;">
                  ${leadStory.title}
                </h2>
              </a>
              <p style="margin:10px 0 0 0; font-family:${fontStack}; font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:700; color:#1a1a1a;">
                ${leadStory.source} · Read the full story →
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- SUB-HEADLINES -->
          ${subHeadlineHtml ? `
          <tr>
            <td style="padding:24px 28px 8px 28px;">
              <h3 style="margin:0 0 4px 0; font-family:${displayFont}; font-size:11px; color:#1a1a1a; text-transform:uppercase; letter-spacing:3px; font-weight:900; border-top:3px solid #1a1a1a; padding-top:14px;">
                Also Breaking
              </h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${subHeadlineHtml}
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- GOING DEEPER (magazine feature) -->
          ${goingDeeperHtml ? `
          <tr>
            <td style="padding:32px 28px 8px 28px; background-color:#f5f5f0;">
              <p style="margin:0 0 4px 0; font-family:${handFont}; font-size:18px; color:#1a1a1a; font-style:italic;">going deeper.</p>
              <h2 style="margin:0 0 18px 0; font-family:${displayFont}; font-size:24px; font-weight:900; color:#1a1a1a; letter-spacing:-1px; line-height:1;">
                The story behind<br/>the headlines<span style="color:#00e600;">.</span>
              </h2>
              <div style="overflow:hidden;">
                ${goingDeeperHtml}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- JOBS SECTION -->
          ${topJobs.length > 0 ? `
          <tr>
            <td style="padding:32px 28px 8px 28px;">
              <p style="margin:0 0 4px 0; font-family:${handFont}; font-size:24px; color:#1a1a1a; font-style:italic;">${getIndustryJobTagline(industry)}</p>
              <h2 style="margin:0 0 4px 0; font-family:${displayFont}; font-size:24px; font-weight:900; color:#1a1a1a; letter-spacing:-1px; line-height:1;">
                ${personalised ? `Our top matches ` : `Hot jobs `}<span style="color:#00e600;">.</span>
              </h2>
              <p style="margin:0 0 16px 0; font-family:${fontStack}; font-size:12px; color:#1a1a1a; text-transform:uppercase; letter-spacing:2px; font-weight:700;">
                ${totalJobCount.toLocaleString()} live in ${industryTitle} now
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:3px solid #1a1a1a;">
                ${topJobsHtml}
              </table>
            </td>
          </tr>
          ` : ''}

          ${moreJobs.length > 0 ? `
          <tr>
            <td style="padding:18px 28px 8px 28px;">
              <h3 style="margin:0 0 6px 0; font-family:${displayFont}; font-size:11px; color:#1a1a1a; text-transform:uppercase; letter-spacing:3px; font-weight:900;">
                More on the boards
              </h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${moreJobsHtml}
              </table>
            </td>
          </tr>
          ` : ''}

          <tr>
            <td align="center" style="padding:20px 28px 32px 28px;">
              <a href="${marketplaceUrl}" style="background-color:#1a1a1a; color:#ffffff; text-decoration:none; font-family:${displayFont}; font-size:13px; font-weight:900; text-transform:uppercase; letter-spacing:2px; padding:14px 32px; display:inline-block;">
                Browse all ${industryTitle} jobs →
              </a>
            </td>
          </tr>

          <!-- HDYD FEATURES PROMO (modern) -->
          <tr>
            <td style="padding:0 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:3px solid #1a1a1a;">
                <tr>
                  <td style="padding:18px 0 10px 0;">
                    <p style="margin:0 0 4px 0; font-family:${displayFont}; font-size:11px; color:#1a1a1a; text-transform:uppercase; letter-spacing:3px; font-weight:900;">
                      More on howdoyoudo<span style="color:#00e600;">?</span>
                    </p>
                    <p style="margin:0 0 14px 0; font-family:${fontStack}; font-size:13px; color:#444; line-height:1.5;">
                      Beyond the bulletin - tools and resources to help you actually move.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        { letter: 'D', title: 'The Download', desc: `A free, print-ready one-pager on the ${industryTitle} industry - perfect for class, careers events, or sharing.`, href: `https://howdoyoudo.group/${industry}?ref=email-features#learn`, isNew: false },
                        { letter: 'F', title: 'The Feed', desc: 'Get all your news and analysis in one place.', href: 'https://howdoyoudo.group/my-jobs?ref=email-features', isNew: true },
                        { letter: 'J', title: 'My Jobs Inbox', desc: 'Live jobs matched to your profile, scored on fit. The smarter way to look.', href: 'https://howdoyoudo.group/my-jobs?ref=email-features', isNew: false },
                        { letter: 'P', title: 'Profile Builder', desc: 'A CV like you have never seen before - tailored, industry-specific and built in minutes.', href: 'https://howdoyoudo.group/cv-builder?ref=email-features', isNew: false },
                        { letter: 'R', title: 'Resources', desc: 'Courses, books, podcasts and tools - everything you need to grow, in one place.', href: 'https://howdoyoudo.group/learning?ref=email-features', isNew: false },
                        { letter: 'U', title: `Unpacking ${industryTitle}`, desc: `The full ${industryTitle} hub - career map, salaries, who's hiring, podcasts, courses and more.`, href: `https://howdoyoudo.group/${industry}?ref=email-features`, isNew: false },
                      ].map((f, idx, arr) => `
                        <tr>
                          <td style="padding:12px 0; ${idx < arr.length - 1 ? 'border-bottom:1px solid #e5e5e5;' : ''}">
                            <a href="${f.href}" style="text-decoration:none; color:#1a1a1a; display:block;">
                              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                <tr>
                                  <td valign="top" style="width:44px; padding-right:12px;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="36" height="36" style="border-collapse:collapse; background-color:#1a1a1a;">
                                      <tr>
                                        <td align="center" valign="middle" style="width:36px; height:36px; color:#ffffff; font-family:${displayFont}; font-size:16px; font-weight:900; line-height:36px;">${f.letter}<span style="color:#00e600;">.</span></td>
                                      </tr>
                                    </table>
                                  </td>
                                  <td valign="top">
                                    <span style="display:block; font-family:${displayFont}; font-size:14px; font-weight:900; color:#1a1a1a;">${f.title}<span style="color:#00e600;">.</span>${f.isNew ? ` <span style="display:inline-block; margin-left:6px; padding:2px 7px; background-color:#00e600; color:#1a1a1a; font-family:${displayFont}; font-size:9px; font-weight:900; letter-spacing:1.5px; text-transform:uppercase; vertical-align:middle;">New</span>` : ''}</span>
                                    <span style="display:block; margin-top:2px; font-family:${fontStack}; font-size:12px; color:#666; line-height:1.4;">${f.desc}</span>
                                  </td>
                                </tr>
                              </table>
                            </a>
                          </td>
                        </tr>
                      `).join('')}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${nudgeSignup ? `
          <tr>
            <td style="padding:0 28px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;">
                <tr>
                  <td style="padding:24px 22px;">
                    <p style="margin:0 0 8px 0; font-family:${displayFont}; font-size:22px; font-weight:900; color:#ffffff; letter-spacing:-0.5px; line-height:1;">
                      Get jobs matched to <span style="color:#00e600;">you</span><span style="color:#00e600;">.</span>
                    </p>
                    <p style="margin:0 0 14px 0; font-family:${fontStack}; font-size:13px; color:#e8e8e0; line-height:1.5;">
                      Tell us your roles, level and location - we'll personalise your bulletin and unlock your private Jobs Inbox.
                    </p>
                    <a href="https://howdoyoudo.group/auth?ref=newsletter" style="background-color:#00e600; color:#1a1a1a; text-decoration:none; font-family:${displayFont}; font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:2px; padding:12px 24px; display:inline-block;">
                      Create your free profile →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- HOWDY:SECTION-END -->

          <!-- FOOTER -->
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <div style="border-top:3px solid #1a1a1a; padding-top:16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-family:${displayFont}; font-size:11px; font-weight:900; color:#1a1a1a; letter-spacing:1.5px; text-transform:uppercase;">
                      <span style="background-color:#1a1a1a; color:#ffffff; padding:4px 10px;">HOWDOYOUDO<span style="color:#00e600;">.GROUP</span></span>
                    </td>
                    <td align="right" style="font-family:${handFont}; font-size:14px; color:#1a1a1a; font-style:italic;">
                      no jargon. no boring job boards.
                    </td>
                  </tr>
                </table>
                <p style="font-size:10px; color:#888; margin:18px 0 0 0; line-height:1.5; font-family:${fontStack};">
                  You're receiving this because you joined the How do you do<span style="color:#00e600;">?</span> community.
                  <a href="${unsubscribeUrl}" style="color:#888; text-decoration:underline;">Unsubscribe</a>
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailHtml(
  industry: string,
  news: NewsItem[],
  articles: NewsItem[],
  jobs: JobItem[],
  unsubscribeUrl: string,
  subscriberName: string,
  totalJobCount: number,
  briefing?: BriefingSection | null,
  personalised: boolean = false,
  nudgeSignup: boolean = false,
  subscriberEmail: string = "",
): string {
  const rawFirst = subscriberName.split(" ")[0] || subscriberName;
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const industryTitle = formatIndustryName(industry);
  const iconUrl = INDUSTRY_ICONS[industry.toLowerCase()] || "";
  const dividerUrl = `${ASSET_BASE}/email-doodle-divider.png`;
  const marketplaceUrl = `https://howdoyoudo.group/marketplace?industry=${encodeURIComponent(industryTitle)}&ref=email`;

  // Split jobs: 3 featured at top, rest below
  const topJobs = jobs.slice(0, 3);
  const moreJobs = jobs.slice(3);

  const topJobsHtml = topJobs.map(j => `
    <tr>
      <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td width="48" valign="top" style="width:48px; padding-right:12px;">
              ${companyLogoCell(j.company, industry)}
            </td>
            <td valign="top">
              <a href="${trackUrl(j.url, { kind: 'job', sub: subscriberEmail, ind: industry, jid: (j as any).id, co: (j as any).company })}" style="color:#1a1a1a; text-decoration:none; font-weight:700; font-size:14px; line-height:1.4; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">${j.title}</a>
              <div style="color:#888; font-size:12px; margin-top:2px; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">${j.company}${j.location ? ` · ${j.location}` : ''}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  const newsHtml = news.length > 0
    ? news.map(n => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #e5e5e5;">
        <a href="${trackUrl(n.url, { kind: 'news', sub: subscriberEmail, ind: industry })}" style="color:#1a1a1a; text-decoration:none; font-weight:700; font-size:15px; line-height:1.5; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">${n.title}</a>
        <div style="color:#888; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-top:3px; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">${n.source}</div>
      </td>
    </tr>`).join('')
    : `<tr><td style="padding:12px 0; color:#888; font-size:14px;">No breaking news yesterday.</td></tr>`;

  // Build Going Deeper as narrative briefing or fallback to article links
  const briefingStyle = `font-size:14px; color:#333; line-height:1.6; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif; margin:0 0 14px 0;`;
  const subsectionStyle = `font-size:11px; color:#00e600; text-transform:uppercase; letter-spacing:1.5px; font-weight:700; margin:16px 0 6px 0; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;`;

  let goingDeeperHtml = '';
  if (briefing) {
    goingDeeperHtml = `
      <p style="${subsectionStyle}">Main News</p>
      <p style="${briefingStyle}">${briefing.mainNews}</p>
      <p style="${subsectionStyle}">People</p>
      <p style="${briefingStyle}">${briefing.people}</p>
      <p style="${subsectionStyle}">The Takeaway</p>
      <p style="${briefingStyle}">${briefing.takeaway}</p>
      ${briefing.sourceLinks.length > 0 ? `
      <p style="font-size:11px; color:#999; margin:12px 0 0 0; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
        Sources: ${briefing.sourceLinks.map(s => `<a href="${s.url}" style="color:#888; text-decoration:underline;">${s.title.slice(0, 50)}${s.title.length > 50 ? '…' : ''}</a>`).join(' · ')}
      </p>` : ''}`;
  } else if (articles.length > 0) {
    // Fallback to article link list if briefing generation failed
    goingDeeperHtml = articles.map(a => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #e5e5e5;">
        <a href="${trackUrl(a.url, { kind: 'news', sub: subscriberEmail, ind: industry })}" style="color:#1a1a1a; text-decoration:none; font-weight:700; font-size:15px; line-height:1.5; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">${a.title}</a>
        <div style="color:#888; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-top:3px; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">${a.source}</div>
      </td>
    </tr>`).join('');
  }

  const moreJobsHtml = moreJobs.map(j => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #f0f0f0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td width="48" valign="top" style="width:48px; padding-right:12px;">
              ${companyLogoCell(j.company, industry)}
            </td>
            <td valign="top">
              <a href="${trackUrl(j.url, { kind: 'job', sub: subscriberEmail, ind: industry, jid: (j as any).id, co: (j as any).company })}" style="color:#1a1a1a; text-decoration:none; font-weight:600; font-size:14px; line-height:1.4; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">${j.title}</a>
              <div style="color:#888; font-size:12px; margin-top:2px; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">${j.company}${j.location ? ` · ${j.location}` : ''}${j.salary ? ` · ${j.salary}` : ''}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#f5f5f0; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#ffffff;background-image:url('${ASSET_BASE}/hero-bg.jpg');background-size:cover;background-position:center top;padding:24px 28px;text-align:left;border-radius:8px 8px 0 0;">
              <h1 style="margin:0; font-size:22px; font-weight:900; color:#1a1a1a; letter-spacing:-1px; font-family:Arial Black,Impact,'Helvetica Neue',Arial,sans-serif; line-height:0.9;">
                How do<br>you do<span style="color:#00e600;">?</span>
              </h1>
            </td>
          </tr>

          <!-- White card body -->
          <tr>
            <td style="background-color:#ffffff; padding:28px 28px 0 28px;">

              <!-- Greeting + Date -->
              <p style="margin:0 0 4px 0; font-size:20px; color:#1a1a1a; font-weight:800; font-family:Arial Black,Impact,'Helvetica Neue',Arial,sans-serif;">
                Good morning ${firstName}<span style="color:#00e600;">.</span>
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr>
                ${iconUrl ? `<td style="vertical-align:middle; padding-right:10px;"><img src="${iconUrl}" alt="${industryTitle}" width="36" height="36" style="width:36px; height:36px; display:block;" /></td>` : ''}
                <td style="vertical-align:middle;">
                  <p style="margin:0; font-size:13px; color:#00e600; text-transform:uppercase; letter-spacing:2px; font-weight:600;">
                    ${industryTitle} Daily · ${dateStr}
                  </p>
                </td>
              </tr></table>

            </td>
          </tr>

          <!-- HOWDY:SECTION-START -->

          <!-- TOP JOBS CARD - appears early so it's seen -->
          ${topJobs.length > 0 ? `
          <tr>
            <td style="background-color:#ffffff; padding:0 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9faf5; border:2px solid #00e600; border-radius:8px; overflow:hidden;">
                <tr>
                  <td style="background-color:#00e600; padding:10px 16px;">
                    <p style="margin:0; font-size:12px; font-weight:700; color:#1a1a1a; text-transform:uppercase; letter-spacing:1.5px; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                      ${personalised ? `🎯 Matched for You` : `🔥 Hot ${industryTitle} Jobs`} ${totalJobCount > 0 ? `<span style="font-weight:400; text-transform:none; letter-spacing:0;">- ${totalJobCount.toLocaleString()} live now</span>` : ''}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${topJobsHtml}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;" align="center">
                    <a href="${marketplaceUrl}" style="background-color:#1a1a1a; color:#ffffff; text-decoration:none; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; padding:10px 24px; display:inline-block; border-radius:4px; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                      Browse all ${industryTitle} jobs →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="background-color:#ffffff; padding:20px 28px 0 28px;"></td></tr>
          ` : ''}

          <!-- BREAKING NEWS -->
          <tr>
            <td style="background-color:#ffffff; padding:0 28px;">
              <h3 style="margin:0 0 10px 0; font-size:12px; color:#00e600; text-transform:uppercase; letter-spacing:2px; font-weight:600; border-bottom:2px solid #1a1a1a; padding-bottom:8px;">
                Breaking News
              </h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${newsHtml}
              </table>
            </td>
          </tr>

          ${goingDeeperHtml ? `
          <!-- GOING DEEPER -->
          <tr>
            <td style="background-color:#ffffff; padding:24px 28px 0 28px;">
              <h3 style="margin:0 0 10px 0; font-size:12px; color:#00e600; text-transform:uppercase; letter-spacing:2px; font-weight:600; border-bottom:2px solid #1a1a1a; padding-bottom:8px;">
                Going Deeper
              </h3>
              ${briefing ? goingDeeperHtml : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${goingDeeperHtml}</table>`}
            </td>
          </tr>
          ` : ''}

          ${moreJobs.length > 0 ? `
          <!-- MORE JOBS -->
          <tr>
            <td style="background-color:#ffffff; padding:24px 28px 0 28px;">
              <h3 style="margin:0 0 10px 0; font-size:12px; color:#00e600; text-transform:uppercase; letter-spacing:2px; font-weight:600; border-bottom:2px solid #1a1a1a; padding-bottom:8px;">
                More Jobs
              </h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${moreJobsHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff; padding:16px 28px 0 28px;" align="center">
              <a href="${marketplaceUrl}" style="background-color:#00e600; color:#1a1a1a; text-decoration:none; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; padding:12px 28px; display:inline-block; border-radius:4px; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                Browse all ${industryTitle} jobs →
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- HDYD FEATURES PROMO (classic) -->
          <tr>
            <td style="background-color:#ffffff; padding:24px 28px 0 28px;">
              <h3 style="margin:0 0 10px 0; font-size:12px; color:#00e600; text-transform:uppercase; letter-spacing:2px; font-weight:600; border-bottom:2px solid #1a1a1a; padding-bottom:8px;">
                More on howdoyoudo?
              </h3>
              <p style="margin:0 0 12px 0; font-size:13px; color:#444; line-height:1.5; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                Beyond the bulletin - tools and resources to help you actually move.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${[
                  { letter: 'D', title: 'The Download', desc: `A free, print-ready one-pager on the ${industryTitle} industry - perfect for class, careers events, or sharing.`, href: `https://howdoyoudo.group/${industry}?ref=email-features#learn`, isNew: false },
                  { letter: 'F', title: 'The Feed', desc: 'Get all your news and analysis in one place.', href: 'https://howdoyoudo.group/my-jobs?ref=email-features', isNew: true },
                  { letter: 'J', title: 'My Jobs Inbox', desc: 'Live jobs matched to your profile, scored on fit. The smarter way to look.', href: 'https://howdoyoudo.group/my-jobs?ref=email-features', isNew: false },
                  { letter: 'P', title: 'Profile Builder', desc: 'A CV like you have never seen before - tailored, industry-specific and built in minutes.', href: 'https://howdoyoudo.group/cv-builder?ref=email-features', isNew: false },
                  { letter: 'R', title: 'Resources', desc: 'Courses, books, podcasts and tools - everything you need to grow, in one place.', href: 'https://howdoyoudo.group/learning?ref=email-features', isNew: false },
                  { letter: 'U', title: `Unpacking ${industryTitle}`, desc: `The full ${industryTitle} hub - career map, salaries, who's hiring, podcasts, courses and more.`, href: `https://howdoyoudo.group/${industry}?ref=email-features`, isNew: false },
                ].map((f, idx, arr) => `
                  <tr>
                    <td style="padding:10px 0; ${idx < arr.length - 1 ? 'border-bottom:1px solid #eee;' : ''}">
                      <a href="${f.href}" style="text-decoration:none; color:#1a1a1a; display:block;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                          <tr>
                            <td valign="top" style="width:44px; padding-right:12px;">
                              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="36" height="36" style="border-collapse:collapse; background-color:#1a1a1a;">
                                <tr>
                                  <td align="center" valign="middle" style="width:36px; height:36px; color:#ffffff; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif; font-size:16px; font-weight:700; line-height:36px;">${f.letter}<span style="color:#00e600;">.</span></td>
                                </tr>
                              </table>
                            </td>
                            <td valign="top">
                              <span style="display:block; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif; font-weight:700; font-size:14px; color:#1a1a1a;">${f.title}${f.isNew ? ` <span style="display:inline-block; margin-left:6px; padding:2px 7px; background-color:#00e600; color:#1a1a1a; font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; vertical-align:middle;">New</span>` : ''}</span>
                              <span style="display:block; margin-top:2px; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif; font-size:12px; color:#666; line-height:1.4;">${f.desc}</span>
                            </td>
                          </tr>
                        </table>
                      </a>
                    </td>
                  </tr>
                `).join('')}
              </table>
            </td>
          </tr>

          ${nudgeSignup ? `
          <!-- SIGNUP NUDGE -->
          <tr>
            <td style="background-color:#ffffff; padding:24px 28px 0 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffce6; border:2px dashed #1a1a1a; border-radius:8px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="margin:0 0 6px 0; font-size:14px; font-weight:800; color:#1a1a1a; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                      Get jobs matched to <span style="color:#00e600;">you</span><span style="color:#00e600;">.</span>
                    </p>
                    <p style="margin:0 0 12px 0; font-size:13px; color:#444; line-height:1.5; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                      Tell us your roles, level and location and we'll personalise your daily newsletter - and unlock your private Jobs Inbox.
                    </p>
                    <a href="https://howdoyoudo.group/auth?ref=newsletter" style="background-color:#1a1a1a; color:#ffffff; text-decoration:none; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; padding:10px 22px; display:inline-block; border-radius:4px; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
                      Create your free profile →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- HOWDY:SECTION-END -->

          <!-- Footer -->
          <tr>
            <td style="background-color:#ffffff; padding:28px 28px 24px 28px; border-radius:0 0 8px 8px;">
              <p style="font-size:11px; color:#999; margin:0; line-height:1.5; border-top:1px solid #e5e5e5; padding-top:16px;">
                You're receiving this because you joined the How do you do<span style="color:#00e600;">?</span> community.<br>
                <a href="${unsubscribeUrl}" style="color:#999; text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPlainText(
  industry: string,
  news: NewsItem[],
  articles: NewsItem[],
  jobs: JobItem[],
  unsubscribeUrl: string,
  subscriberName: string,
  totalJobCount: number,
  briefing?: BriefingSection | null,
  personalised: boolean = false,
  nudgeSignup: boolean = false,
): string {
  const rawFirst = subscriberName.split(" ")[0] || subscriberName;
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const industryTitle = formatIndustryName(industry);

  let text = `HOW DO YOU DO? - ${industryTitle} Daily\n${dateStr}\n\n`;
  text += `Good morning ${firstName}, how do you do? Here's what happened in ${industryTitle.toLowerCase()} yesterday.\n\n`;

  text += "BREAKING NEWS\n";
  if (news.length) {
    news.forEach((n) => (text += `• ${n.title} (${n.source}) - ${n.url}\n`));
  } else {
    text += "No breaking news yesterday.\n";
  }

  text += "\nGOING DEEPER\n";
  if (briefing) {
    text += "MAIN NEWS\n" + briefing.mainNews.replace(/<[^>]+>/g, '') + "\n\n";
    text += "PEOPLE\n" + briefing.people.replace(/<[^>]+>/g, '') + "\n\n";
    text += "THE TAKEAWAY\n" + briefing.takeaway.replace(/<[^>]+>/g, '') + "\n";
  } else if (articles.length) {
    articles.forEach((a) => (text += `• ${a.title} (${a.source}) - ${a.url}\n`));
  }

  text += personalised ? "\nMATCHED FOR YOU\n" : "\nA SELECTION OF THE LATEST JOBS\n";
  if (totalJobCount > 0) {
    text += `We have ${totalJobCount.toLocaleString()} ${formatIndustryName(industry)} jobs live on our site\n\n`;
  }
  if (jobs.length) {
    jobs.forEach(
      (j) =>
        (text += `• ${j.title} at ${j.company}${j.location ? ` (${j.location})` : ""}${j.salary ? ` - ${j.salary}` : ""}\n  ${j.url}\n`)
    );
  }

  text += `\nBrowse ${industryTitle} jobs: https://howdoyoudo.group/marketplace?industry=${encodeURIComponent(industryTitle)}&ref=email\n`;
  if (nudgeSignup) {
    text += `\nGet jobs matched to you - create your free profile: https://howdoyoudo.group/auth?ref=newsletter\n`;
  }
  text += `\nUnsubscribe: ${unsubscribeUrl}\n`;
  return text;
}

/**
 * Consolidate N per-industry HTML emails (each rendered by buildEmailHtml or
 * buildEmailHtmlTabloid) into ONE email document. Preserves the existing
 * design exactly - no layout changes - by using the first email's header +
 * greeting and footer/unsubscribe, then splicing each industry's content
 * section (between HOWDY:SECTION-START and HOWDY:SECTION-END markers) in
 * order, separated by a thin divider rule.
 */
function consolidateEmails(htmls: string[], industries: string[] = []): string {
  if (htmls.length === 0) return "";

  const startMarker = "<!-- HOWDY:SECTION-START -->";
  const endMarker = "<!-- HOWDY:SECTION-END -->";

  const first = htmls[0];
  const firstStart = first.indexOf(startMarker);
  const firstEnd = first.indexOf(endMarker);
  if (firstStart === -1 || firstEnd === -1) {
    return first;
  }

  const headerPart = first.slice(0, firstStart + startMarker.length);
  const footerPart = first.slice(firstEnd);

  // Anchor-safe slug for jump links.
  const anchorFor = (ind: string) => `ind-${ind.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  // Industry tab nav (jump links). Emails don't support sticky, but anchor
  // links inside an HTML email work in most clients (Gmail web/app, Apple
  // Mail). Renders as a wrapping pill row.
  const tabNav = industries.length > 1 ? `
          <tr>
            <td style="background-color:#ffffff; padding:0 20px 20px 20px;">
              <p style="margin:0 0 10px 0; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif; font-size:11px; font-weight:700; color:#1a1a1a; text-transform:uppercase; letter-spacing:2px;">
                Jump to industry
              </p>
              <div style="line-height:1.9;">
                ${industries.map((ind) => `<a href="#${anchorFor(ind)}" style="display:inline-block; margin:0 6px 6px 0; padding:6px 12px; background-color:#1a1a1a; color:#00e600; text-decoration:none; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif; font-size:12px; font-weight:700; letter-spacing:0.5px; border-radius:999px; border:2px solid #1a1a1a;">${formatIndustryName(ind)}</a>`).join('')}
              </div>
            </td>
          </tr>` : '';

  // Per-industry banner heading (anchor target + bold restored heading) so
  // each industry section is clearly demarcated in the consolidated email.
  const sectionBanner = (ind: string, idx: number) => {
    const title = formatIndustryName(ind);
    const topPad = idx === 0 ? '8px' : '40px';
    return `
          <tr>
            <td id="${anchorFor(ind)}" style="background-color:#ffffff; padding:${topPad} 28px 12px 28px;">
              <a name="${anchorFor(ind)}" id="${anchorFor(ind)}-a" style="display:block; text-decoration:none; color:inherit;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:3px solid #1a1a1a;">
                <tr>
                  <td style="padding:14px 14px 12px 14px; background-color:#00e600;">
                    <p style="margin:0; font-family:Arial Black,Impact,'Helvetica Neue',Arial,sans-serif; font-size:22px; font-weight:900; color:#1a1a1a; letter-spacing:-0.5px; line-height:1.1;">
                      ${title}<span style="color:#1a1a1a;">.</span>
                    </p>
                    <p style="margin:4px 0 0 0; font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif; font-size:11px; font-weight:700; color:#1a1a1a; text-transform:uppercase; letter-spacing:2px;">
                      Today's bulletin
                    </p>
                  </td>
                </tr>
              </table>
              </a>
            </td>
          </tr>`;
  };

  const sections: string[] = [];
  for (let i = 0; i < htmls.length; i++) {
    const html = htmls[i];
    const s = html.indexOf(startMarker);
    const e = html.indexOf(endMarker);
    if (s === -1 || e === -1) continue;
    const ind = industries[i] || `Section ${i + 1}`;
    sections.push(sectionBanner(ind, i) + html.slice(s + startMarker.length, e));
  }

  return headerPart + tabNav + sections.join('') + footerPart;
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Widened to 48h: some industry fetches only run once every ~24h, so a strict
  // 24h window leaves cinema/beer/music empty when the cron lands a few hours late.
  // The published_at floor (48h) still prevents truly stale stories.
  const since = last48hAgo();
  const publishedSince = last48hAgo(); // guard against stale published_at
  const articlesSince = last7dAgo();
  // Dedup against headlines we sent in the last 36h so today's lead can't repeat
  // yesterday's. (Kept short so genuinely fresh follow-up stories aren't suppressed.)
  const yesterdayCutoff = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();

    const url = new URL(req.url);
    const testEmail = url.searchParams.get("test_email");
    const testIndustry = url.searchParams.get("test_industry");
    const styleParam = url.searchParams.get("style");
    const useTabloidTemplate = styleParam !== "legacy" && styleParam !== "classic";
    // Comma-separated list of emails to restrict the send to. Used for QA/test runs
    // where we want real subscriber industry interests, but only deliver to a few addresses.
    const restrictEmailsParam = url.searchParams.get("restrict_emails");
    const restrictEmails = restrictEmailsParam
      ? restrictEmailsParam
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)
      : [];

    // SAFETY: if test_email is passed without test_industry, refuse to run.
    // This prevents accidentally fanning out to the whole subscriber list when
    // someone means to test but forgets the industry param.
    if (testEmail && !testIndustry) {
      console.warn(`[digest] BLOCKED: test_email provided without test_industry. Refusing to send.`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "test_email requires test_industry. Pass ?test_email=you@x.com&test_industry=food-drink",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SAFETY: hard cap on accidental full-list sends. A run that targets the
    // full subscriber base must explicitly opt in with confirm_full_send=true.
    // Cron passes this param. Anything else (manual test triggers, accidental
    // re-invocations) must use test_email + test_industry, or restrict_emails.
    const confirmFullSend = url.searchParams.get("confirm_full_send") === "true";
    const isFullSend = !testEmail && restrictEmails.length === 0;
    if (isFullSend && !confirmFullSend) {
      console.warn(`[digest] BLOCKED: full-list send without confirm_full_send=true. Refusing.`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Full-list sends require confirm_full_send=true. For tests use ?test_email=you@x.com&test_industry=food-drink, or ?restrict_emails=a@x.com,b@x.com",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESTRICT_TO_EMAIL = "";

  // Run the entire digest build in the background so cron/HTTP triggers don't time out.
  // The function returns 202 immediately; work continues until completion.
  // @ts-ignore - EdgeRuntime is available in Supabase Edge Runtime
  const runInBackground = async () => {
  const t0 = Date.now();
  const ms = () => `${Date.now() - t0}ms`;
  const isTest = !!testEmail;
  console.log(`[digest] start (test=${isTest}, testEmail=${testEmail || 'none'}, testIndustry=${testIndustry || 'none'}, restrictEmails=${restrictEmails.length}) ${ms()}`);
  try {
    // 1. Get subscribers
    // newsletter_industries is the source of truth for *which* industries get a daily email.
    // industry_interests is kept for site personalisation only (no email side-effects).
    // Fallback: if newsletter_industries is empty/null, treat industry_interests as the list
    // (preserves current behaviour for any subscriber not yet migrated).
    let subscribers: Array<{ id: string; name: string; email: string; industry_interests: string[]; newsletter_industries: string[] | null }>;
    if (testEmail) {
      subscribers = [{
        id: "test-subscriber",
        name: testEmail.split("@")[0] || "there",
        email: testEmail.toLowerCase(),
        industry_interests: [testIndustry!],
        newsletter_industries: [testIndustry!],
      }];
      console.log(`[digest] TEST MODE: synthesized 1 subscriber (${testEmail}, industry=${testIndustry}) ${ms()}`);
    } else {
      let query = supabase
        .from("subscribers")
        .select("id, name, email, industry_interests, newsletter_industries");
      if (RESTRICT_TO_EMAIL) {
        query = query.eq("email", RESTRICT_TO_EMAIL);
        console.log(`SAFETY GATE: restricting digest to ${RESTRICT_TO_EMAIL} only`);
      }
      const { data, error: subErr } = await query;
      if (subErr) throw subErr;
      subscribers = (data || []) as typeof subscribers;
      if (restrictEmails.length) {
        const before = subscribers.length;
        subscribers = subscribers.filter((s) => restrictEmails.includes(s.email.toLowerCase()));
        console.log(`[digest] restrict_emails active: ${subscribers.length}/${before} subscribers retained`);
      }
      console.log(`[digest] subscribers fetched: ${subscribers.length} ${ms()}`);
    }

    if (!subscribers.length) {
      console.log(`[digest] no subscribers - done ${ms()}`);
      return;
    }

    // 2. Get suppressed emails
    const { data: suppressed } = await supabase
      .from("suppressed_emails")
      .select("email");
    const suppressedSet = new Set((suppressed || []).map((s) => s.email));

    // 3. Collect unique industries (only those that subscribers actually want emails for)
    // newsletter_industries is the SOLE source of truth - no fallback to
    // industry_interests. If a subscriber's newsletter_industries is null or
    // empty, we send them nothing. Legacy null rows are backfilled by
    // migration 20260513_backfill_newsletter_industries.sql.
    const newsletterListFor = (s: { industry_interests: string[]; newsletter_industries: string[] | null }) => {
      const nl = s.newsletter_industries;
      return Array.isArray(nl) ? nl : [];
    };
    const allIndustries = new Set<string>();
    subscribers.forEach((s) =>
      newsletterListFor(s).forEach((i: string) =>
        allIndustries.add(toSlug(i))
      )
    );

    // 4. Fetch initial content
    // News + articles use the daily-recency window. Jobs are fetched PER-INDUSTRY
    // so high-volume industries (Hospitality, Grocery) can't crowd out lower-volume
    // ones (Football, Fashion brands) inside a single LIMIT 1500 query.
    const industriesForJobs = Array.from(allIndustries);
    const [newsRes, articlesRes, perIndustryJobsResults] = await Promise.all([
      supabase
        .from("breaking_news")
        .select("title, source, url, industry")
        .gte("fetched_at", since)
        .gte("published_at", publishedSince)
        .order("published_at", { ascending: false })
        .limit(500),
      supabase
        .from("articles")
        .select("title, source, url, industry")
        .gte("scraped_at", articlesSince)
        .order("scraped_at", { ascending: false })
        .limit(500),
      // Per-industry jobs: up to 300 most recent active jobs per industry, no global
      // recency cutoff (some brand sites only refresh weekly - we don't want to lose them).
      // FOOD-DRINK fallback: there's no `food-drink` industry on the jobs table - those
      // roles live under hospitality/grocery/coffee/bakery/beer. So when we ask for
      // food-drink jobs we union those buckets.
      Promise.all(
        industriesForJobs.map(async (ind) => {
          const targetIndustries = ind === "food-drink"
            ? ["hospitality", "coffee", "bakery", "beer"]
            : [ind];
          const r = await supabase
            .from("jobs")
            .select("id, title, company, location, url, salary, industry, career_level, role_category, ai_role_category, work_mode, salary_min, salary_max")
            .in("industry", targetIndustries)
            .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
            .order("created_at", { ascending: false })
            .limit(300);
          // Tag rows so downstream grouping still buckets them under the requested slug.
          const tagged = (r.data || []).map((row) => ({ ...row, industry: ind }));
          return { ind, data: tagged };
        })
      ),
    ]);

    let allNews = newsRes.data || [];
    let allArticles = articlesRes.data || [];
    // Flatten per-industry job results into the single allJobs array used downstream.
    const allJobs = perIndustryJobsResults.flatMap((r) => r.data);
    console.log(
      `Per-industry job fetch: ${industriesForJobs.length} industries, ${allJobs.length} total jobs ` +
      `(${perIndustryJobsResults.map((r) => `${r.ind}:${r.data.length}`).join(", ")})`
    );

    // 5. PRE-SEND QUALITY CHECK: identify thin industries and auto-refresh
    const groupBy = <T extends { industry: string | null }>(
      items: T[]
    ): Record<string, T[]> => {
      const map: Record<string, T[]> = {};
      items.forEach((item) => {
        const key = (item.industry || "").toLowerCase();
        if (!map[key]) map[key] = [];
        map[key].push(item);
      });
      return map;
    };

    let newsByIndustry = groupBy(allNews);
    let articlesByIndustry = groupBy(allArticles);

    // Check which industries need a refresh
    const thinIndustries: string[] = [];
    for (const ind of allIndustries) {
      const newsCount = (newsByIndustry[ind] || []).length;
      const articleCount = (articlesByIndustry[ind] || []).length;
      if (newsCount < MIN_NEWS || articleCount < MIN_ARTICLES) {
        thinIndustries.push(ind);
      }
    }

    // Auto-refresh thin industries (skip in test mode - too slow, makes tests hang)
    if (thinIndustries.length > 0 && !isTest) {
      console.log(`[digest] Pre-send check: ${thinIndustries.length} thin industries: ${thinIndustries.join(', ')} ${ms()}`);
      const refreshBatch = thinIndustries.slice(0, 5);
      await Promise.allSettled(
        refreshBatch.map(ind => refreshIndustryContent(ind, supabaseUrl, anonKey))
      );

      // Re-fetch content after refresh
      const [freshNews, freshArticles] = await Promise.all([
        supabase
          .from("breaking_news")
          .select("title, source, url, industry")
          .gte("fetched_at", since)
          .gte("published_at", publishedSince)
          .order("published_at", { ascending: false })
          .limit(500),
        supabase
          .from("articles")
          .select("title, source, url, industry")
          .gte("scraped_at", articlesSince)
          .order("scraped_at", { ascending: false })
          .limit(500),
      ]);

      allNews = freshNews.data || allNews;
      allArticles = freshArticles.data || allArticles;
      newsByIndustry = groupBy(allNews);
      articlesByIndustry = groupBy(allArticles);
      console.log(`[digest] post-refresh content reloaded ${ms()}`);
    } else if (thinIndustries.length > 0) {
      console.log(`[digest] thin industries detected but skipped (test mode): ${thinIndustries.join(', ')} ${ms()}`);
    }

    const jobsByIndustry = groupBy(allJobs);

    // 5b. Fetch total job counts per industry for the newsletter.
    // Include testIndustry too - subscribers may not have it in their interests.
    const jobCountByIndustry: Record<string, number> = {};
    const industriesForCounts = new Set<string>(allIndustries);
    if (testIndustry) industriesForCounts.add(toSlug(testIndustry));
    for (const ind of industriesForCounts) {
      const { count } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .ilike("industry", ind);
      jobCountByIndustry[ind] = count || 0;
    }

    // 5c. Build email → profile map for personalised job matching.
    // Uses auth.admin.listUsers to map subscriber emails → user_id, then loads profiles.
    // Skipped in test mode - listUsers paging is slow and tests just want a sample render.
    const profileByEmail = new Map<string, SubscriberProfile>();
    if (!isTest) {
      try {
        const subscriberEmails = new Set(subscribers.map((s) => s.email.toLowerCase()));
        const userIdByEmail = new Map<string, string>();
        for (let page = 1; page <= 50; page++) {
          const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
          if (error || !data?.users?.length) break;
          for (const u of data.users) {
            const e = (u.email || "").toLowerCase();
            if (e && subscriberEmails.has(e)) userIdByEmail.set(e, u.id);
          }
          if (data.users.length < 200) break;
        }
        const userIds = Array.from(userIdByEmail.values());
        if (userIds.length > 0) {
          const { data: profileRows } = await supabase
            .from("profiles")
            .select("id, role_preferences, industry_interests, location_preference, salary_expectation, career_level")
            .in("id", userIds);
          const profileById = new Map<string, SubscriberProfile>();
          for (const p of profileRows || []) {
            profileById.set(p.id as string, {
              role_preferences: (p.role_preferences as string[] | null) || null,
              industry_interests: (p.industry_interests as string[] | null) || null,
              location_preference: (p.location_preference as string | null) || null,
              salary_expectation: (p.salary_expectation as string | null) || null,
              career_level: (p.career_level as string | null) || null,
            });
          }
          for (const [email, uid] of userIdByEmail) {
            const prof = profileById.get(uid);
            if (prof) profileByEmail.set(email, prof);
          }
        }
        console.log(`[digest] Personalisation: matched ${profileByEmail.size}/${subscribers.length} subscribers to profiles ${ms()}`);
      } catch (err) {
        console.warn("[digest] Profile lookup failed (will fall back to industry-only jobs):", err);
      }
    } else {
      console.log(`[digest] skipping profile lookup (test mode) ${ms()}`);
    }

    // 5b. PRE-COMPUTE per-industry editorial assets ONCE (shared across all subscribers).
    // The AI quality filter and editorial briefing are identical for every subscriber for a
    // given industry, so doing them per-subscriber wastes huge amounts of time and reliably
    // times out the function once we have multiple subscribers with many interests.
    const industriesNeeded = new Set<string>();
    for (const sub of subscribers) {
      if (suppressedSet.has(sub.email)) continue;
      const ints = testIndustry
        ? [toSlug(testIndustry)]
        : newsletterListFor(sub).map((i: string) => toSlug(i));
      ints.forEach((i) => i && industriesNeeded.add(i));
    }

    const industryAssets = new Map<string, { news: NewsItem[]; articles: NewsItem[]; briefing: BriefingSection | null }>();

    // Fetch yesterday's lead headline per industry so we don't repeat it today.
    // We pull the top news rows seen 24-48h ago (i.e. the pool that fed yesterday's digest).
    const yesterdayLeadByIndustry = new Map<string, Set<string>>();
    try {
      const { data: yest } = await supabase
        .from("breaking_news")
        .select("title, industry, fetched_at")
        .gte("fetched_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
        .lt("fetched_at", yesterdayCutoff)
        .limit(1500);
      for (const row of yest || []) {
        const ind = (row.industry || "").toLowerCase();
        if (!ind) continue;
        const stem = (row.title || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);
        if (!stem) continue;
        if (!yesterdayLeadByIndustry.has(ind)) yesterdayLeadByIndustry.set(ind, new Set());
        yesterdayLeadByIndustry.get(ind)!.add(stem);
      }
      console.log(`[digest] Loaded yesterday-headline stems for ${yesterdayLeadByIndustry.size} industries`);
    } catch (e) {
      console.warn("[digest] yesterday-headline lookup failed:", e);
    }

    const buildIndustryAssets = async (ind: string) => {
      let news: NewsItem[] = (newsByIndustry[ind] || []).map((n) => ({
        title: n.title, source: n.source, url: n.url,
      }));
      let articles: NewsItem[] = (articlesByIndustry[ind] || []).map((a) => ({
        title: a.title, source: a.source, url: a.url,
      }));

      // Demote (push to bottom) any headline we already led with yesterday so a fresh
      // story takes the lead slot. We don't drop them entirely - sometimes the user
      // hasn't actually opened yesterday's email and we still want continuity.
      const yLead = yesterdayLeadByIndustry.get(ind);
      if (yLead && yLead.size > 0 && news.length > 1) {
        const fresh: NewsItem[] = [];
        const stale: NewsItem[] = [];
        for (const n of news) {
          const stem = n.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);
          if (yLead.has(stem)) stale.push(n); else fresh.push(n);
        }
        if (fresh.length > 0) news = [...fresh, ...stale];
      }

      // PRE-AI entity dedup: collapse obvious "same story, different headlines"
      // clusters (shared proper noun + topic signal) so the AI doesn't get to
      // hedge and keep multiple Michael-biopic-box-office variants.
      const newsBefore = news.length;
      news = collapseEntityDuplicates(news, ind);
      if (news.length !== newsBefore) {
        console.log(`[${ind}] pre-AI entity dedup: news ${newsBefore} → ${news.length}`);
      }

      if (lovableApiKey && (news.length > 0 || articles.length > 0)) {
        try {
          const filtered = await aiFilterDigestContent(news, articles, ind, lovableApiKey);
          news = filtered.news;
          articles = filtered.articles;
        } catch (e) {
          console.error(`AI filter failed for ${ind}, using raw content:`, e);
        }
      }

      // POST-AI Pass A: re-run entity dedup in case the AI still hedged.
      news = collapseEntityDuplicates(news, `${ind}/post-ai`);

      // POST-AI Pass B: belt-and-braces Jaccard fallback for wire rewrites that
      // share enough wording but didn't trigger entity clustering.
      const titleTokens = (t: string) =>
        new Set(
          t.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim()
            .split(" ").filter((w) => w.length > 3),
        );
      const newsDeduped: NewsItem[] = [];
      for (const item of news) {
        const A = titleTokens(item.title);
        const isDupe = newsDeduped.some((kept) => {
          const B = titleTokens(kept.title);
          if (A.size === 0 || B.size === 0) return false;
          let inter = 0;
          for (const w of A) if (B.has(w)) inter++;
          const j = inter / (A.size + B.size - inter);
          return j >= 0.5;
        });
        if (!isDupe) newsDeduped.push(item);
      }
      news = newsDeduped;

      // Hard cap to match AI cap - never let more than 6 news items reach the briefing.
      if (news.length > 6) news = news.slice(0, 6);


      // Deduplicate: remove any Going Deeper article whose URL OR title overlaps with Breaking News
      const newsUrls = new Set(news.map((n) => n.url));
      const newsTitlesNorm = new Set(news.map((n) => n.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60)));
      articles = articles.filter((a) => {
        if (newsUrls.has(a.url)) return false;
        const normTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
        for (const nt of newsTitlesNorm) {
          if (normTitle === nt) return false;
          if (normTitle.length > 20 && nt.length > 20 && (normTitle.includes(nt.slice(0, 30)) || nt.includes(normTitle.slice(0, 30)))) return false;
        }
        return true;
      });

      let briefing: BriefingSection | null = null;
      if (lovableApiKey && articles.length > 0) {
        try {
          briefing = await generateEditorialBriefing(articles, news, ind, lovableApiKey);
        } catch (e) {
          console.error(`Briefing failed for ${ind}:`, e);
        }
      }

      // Fallback: if we couldn't build a fresh briefing (no fresh articles, AI
      // skip, etc.), load today's persisted briefing from daily_briefings so
      // the "Going Deeper" section still appears in the newsletter.
      if (!briefing) {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const { data: saved } = await supabase
            .from("daily_briefings")
            .select("main_news, people, takeaway, source_links, briefing_date")
            .eq("industry", ind)
            .lte("briefing_date", today)
            .order("briefing_date", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (saved && saved.main_news) {
            briefing = {
              mainNews: saved.main_news,
              people: saved.people || "",
              takeaway: saved.takeaway || "",
              sourceLinks: Array.isArray(saved.source_links)
                ? (saved.source_links as { title: string; url: string }[])
                : [],
            };
            console.log(`[${ind}] Going Deeper fallback: loaded saved briefing from ${saved.briefing_date}`);
          }
        } catch (e) {
          console.warn(`[${ind}] saved-briefing fallback failed:`, e);
        }
      }

      industryAssets.set(ind, { news, articles, briefing });
      console.log(`Pre-computed ${ind}: news=${news.length}, articles=${articles.length}, briefing=${briefing ? "yes" : "no"}`);
    };

    // Process industries in parallel batches of 5 to avoid hammering the AI gateway
    const indList = Array.from(industriesNeeded);
    console.log(`[digest] building assets for ${indList.length} industries: ${indList.join(', ')} ${ms()}`);
    const BATCH = 5;
    for (let i = 0; i < indList.length; i += BATCH) {
      await Promise.all(indList.slice(i, i + BATCH).map(buildIndustryAssets));
    }
    console.log(`[digest] all industry assets built ${ms()}`);

    // 6. Enqueue ONE consolidated email per subscriber containing ALL their
    // industries as stacked sections (was previously one-email-per-industry,
    // which produced 9+ emails/day for power subscribers).
    let enqueued = 0;
    const dateLabel = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const todayKey = new Date().toISOString().slice(0, 10);

    for (const sub of subscribers) {
      if (suppressedSet.has(sub.email)) continue;

      // ONLY send to industries the subscriber has explicitly opted in to via
      // newsletter_industries (NOT industry_interests, which is for site
      // personalisation only).
      let interests: string[] = newsletterListFor(sub).map(
        (i: string) => toSlug(i)
      );
      if (!interests.length) continue;

      if (testIndustry) {
        interests = [toSlug(testIndustry)];
      }

      const subProfile = profileByEmail.get(sub.email.toLowerCase());
      const personalised = !!subProfile;
      const nudgeSignup = !subProfile;

      let sentForThisSub = 0;

      for (const ind of interests) {
        const assets = industryAssets.get(ind);
        if (!assets) continue;
        const news: NewsItem[] = assets.news;
        const articles: NewsItem[] = assets.articles;
        const industryJobsRaw = (jobsByIndustry[ind] || []) as ScorableJob[];

        let jobs: JobItem[] = [];
        if (subProfile) {
          jobs = pickPersonalisedJobs(industryJobsRaw, subProfile, 8, 2);
        }

        if (!jobs.length) {
          const rawJobs: JobItem[] = industryJobsRaw.map((j) => ({
            title: j.title,
            company: j.company,
            location: j.location,
            url: j.url,
            salary: j.salary,
          }));
          jobs = diversifyJobs(rawJobs, 8, 2, ind);
        }

        if (!jobs.length) {
          const { data: fallbackJobs } = await supabase
            .from("jobs")
            .select("id, title, company, location, url, salary, industry, career_level, role_category, ai_role_category, work_mode, salary_min, salary_max")
            .ilike("industry", ind)
            .order("created_at", { ascending: false })
            .limit(50);
          const fallbackRaw = (fallbackJobs || []) as ScorableJob[];
          if (subProfile) {
            jobs = pickPersonalisedJobs(fallbackRaw, subProfile, 8, 2);
          }
          if (!jobs.length) {
            jobs = diversifyJobs(
              fallbackRaw.map((j) => ({
                title: j.title,
                company: j.company,
                location: j.location,
                url: j.url,
                salary: j.salary,
              })),
              8,
              2,
              ind,
            );
          }
        }

        if (!news.length && !articles.length && !jobs.length) continue;

        const briefing: BriefingSection | null = assets.briefing;
        const totalJobCount = jobCountByIndustry[ind] || 0;
        // Show signup nudge only on the very first email this subscriber
        // receives in this run.
        const sectionNudge = nudgeSignup && sentForThisSub === 0;

        // One unsubscribe token per email.
        const token = crypto.randomUUID();
        await supabase.from("email_unsubscribe_tokens").insert({
          email: sub.email,
          token,
        });
        const unsubscribeUrl = `https://howdoyoudo.group/unsubscribe?token=${token}`;

        const html = (useTabloidTemplate ? buildEmailHtmlTabloid : buildEmailHtml)(
          ind, news, articles, jobs, unsubscribeUrl, sub.name, totalJobCount, briefing, personalised, sectionNudge, sub.email
        );
        const text = buildPlainText(
          ind, news, articles, jobs, unsubscribeUrl, sub.name, totalJobCount, briefing, personalised, sectionNudge
        );

        const indLabel = formatIndustryName(ind);
        const subject = useTabloidTemplate
          ? `Your bulletin · ${indLabel} · ${dateLabel}`
          : `☀️ Your Daily - ${indLabel} - ${dateLabel}`;

        const messageId = crypto.randomUUID();

        const sendRes = await sendViaResend({
          message_id: messageId,
          to: sub.email,
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          sender_domain: SENDER_DOMAIN,
          subject,
          html,
          text,
        });
        const enqErr = sendRes.error ? { message: sendRes.error } : null;

        if (enqErr) {
          console.error("Failed to enqueue digest for", sub.email, ind, enqErr);
        } else {
          enqueued++;
          sentForThisSub++;
          try {
            await supabase
              .from("sent_newsletters")
              .upsert(
                {
                  recipient_email: sub.email,
                  industry: ind,
                  subject,
                  html,
                  briefing_date: todayKey,
                },
                { onConflict: "recipient_email,industry,briefing_date" },
              );
          } catch (archiveErr) {
            console.error("Failed to archive newsletter for", sub.email, ind, archiveErr);
          }
        }
      }
    }

    console.log(`[digest] DONE: enqueued ${enqueued} consolidated emails for ${subscribers.length} subscribers (refreshed ${thinIndustries.length} thin industries) ${ms()}`);
  } catch (err) {
    console.error(`[digest] ERROR ${ms()}:`, err);
  }
  };

  // @ts-ignore - EdgeRuntime is provided by Supabase Edge Runtime
  if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
    // @ts-ignore
    EdgeRuntime.waitUntil(runInBackground());
  } else {
    // Fallback: fire and forget
    runInBackground();
  }

  return new Response(
    JSON.stringify({ success: true, status: "started", message: "Digest build running in background" }),
    { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
