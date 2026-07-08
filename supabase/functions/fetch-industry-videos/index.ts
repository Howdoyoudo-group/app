// Fetch fresh YouTube videos per industry for the Watch feed.
//
// Strategy: scrape the public YouTube search results page with an upload-date
// filter (this week / this month), parse `ytInitialData` from the HTML, and
// upsert results into public.industry_videos. No API key required.
//
// Called by:
//   - Weekly cron (every Monday)
//   - On-demand POST { industry?, window? } (single industry, single window)
//   - On-demand POST {} → full refresh
//
// Notes: this is intentionally narrow (1 query per industry per window). The
// curated `industryVideos` list in the client remains a fallback when no
// dynamic results exist yet.

import { INDUSTRY_REGISTRY } from "../_shared/industry-registry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Upload-date filters baked into `&sp=` parameter on /results.
// Source: youtube's own UI (these are stable base64 protobufs).
const WINDOW_SP: Record<"week" | "month", string> = {
  week: "EgIIAw%253D%253D",
  month: "EgIIBA%253D%253D",
};

// Per-industry YouTube search queries — two angles per industry so we get a
// richer mix of (a) day-in-the-life / role-focused and (b) business / industry news.
// Results from both queries are merged and deduplicated before storing.
const QUERIES: Record<string, string[]> = {
  bakery: [
    "day in the life UK baker pastry chef",
    "UK bakery business careers industry",
  ],
  beauty: [
    "day in the life beauty therapist UK salon",
    "UK beauty industry business careers",
  ],
  beer: [
    "day in the life UK brewer craft beer",
    "UK brewery business careers industry",
  ],
  cars: [
    "day in the life UK car mechanic automotive technician",
    "UK automotive industry business careers",
  ],
  charity: [
    "day in the life UK charity worker fundraiser",
    "UK charity sector careers jobs",
  ],
  cinema: [
    "day in the life UK film TV production careers",
    "UK film TV industry business careers",
  ],
  coffee: [
    "day in the life UK barista coffee shop",
    "UK coffee industry business careers",
  ],
  "estate-agency": [
    "day in the life UK estate agent property",
    "UK property market estate agency business careers",
  ],
  farming: [
    "day in the life UK farmer agriculture",
    "UK farming agriculture business careers",
  ],
  fashion: [
    "day in the life UK fashion industry careers",
    "UK fashion business industry careers",
  ],
  football: [
    "day in the life football club business careers UK",
    "football business finance Premier League revenue sponsorship broadcast",
  ],
  "formula-1": [
    "day in the life Formula 1 engineer careers",
    "Formula 1 business motorsport careers UK",
  ],
  gaming: [
    "day in the life UK game developer studio",
    "UK games industry business careers",
  ],
  grocery: [
    "day in the life UK supermarket buyer category manager",
    "UK grocery supermarket retail business careers",
  ],
  health: [
    "day in the life NHS careers UK healthcare",
    "UK NHS healthcare business careers industry",
  ],
  "horse-racing": [
    "day in the life UK jockey racehorse trainer stable",
    "UK horse racing industry business careers",
  ],
  hospitality: [
    "day in the life UK chef restaurant hotel careers",
    "UK hospitality industry restaurant hotel business careers",
  ],
  influencing: [
    "day in the life UK content creator influencer marketing",
    "UK creator economy influencer business careers",
  ],
  "interior-design": [
    "day in the life UK interior designer careers",
    "UK interior design business careers industry",
  ],
  jewellery: [
    "day in the life UK jeweller goldsmith careers",
    "UK jewellery industry business careers",
  ],
  journalism: [
    "day in the life UK journalist reporter newsroom",
    "UK journalism media industry business careers",
  ],
  money: [
    "day in the life UK fintech banking finance careers",
    "UK fintech banking financial services business careers",
  ],
  music: [
    "day in the life UK music industry careers",
    "UK music industry business careers record label",
  ],
  pets: [
    "day in the life UK vet veterinary nurse careers",
    "UK pet industry veterinary business careers",
  ],
  physiotherapy: [
    "day in the life UK physiotherapist NHS private",
    "UK physiotherapy careers business industry",
  ],
  psychotherapy: [
    "day in the life UK therapist counsellor careers",
    "UK counselling psychotherapy careers industry",
  ],
  teaching: [
    "day in the life UK teacher school classroom",
    "UK teaching careers education business industry",
  ],
  travel: [
    "day in the life UK travel agent aviation careers",
    "UK travel industry aviation tourism business careers",
  ],
  wellness: [
    "day in the life UK personal trainer gym careers",
    "UK fitness wellness industry business careers",
  ],
  footwear: [
    "day in the life UK footwear shoe industry careers",
    "UK footwear sneaker industry business careers",
  ],
  // NOTE: politics is deliberately NOT auto-scraped. UK political YouTube is
  // dominated by partisan news/commentary (e.g. "MP second jobs", Farage debate
  // clips) that the generic relevance filters can't distinguish from careers
  // content — inappropriate for a careers platform. The Politics Watch tab is
  // curated by hand in src/data/industry-videos.ts instead.
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

interface ParsedVideo {
  youtube_id: string;
  title: string;
  channel: string | null;
  channel_id: string | null;
  description: string | null;
  duration_seconds: number | null;
  view_count: number | null;
  published_at: string | null;
}

// Parse "12:34" or "1:02:33" or "Premiered 3 days ago" → seconds.
function parseDuration(text: string | undefined): number | null {
  if (!text) return null;
  const m = text.match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1] || 0);
  const mn = Number(m[2]);
  const s = Number(m[3]);
  return h * 3600 + mn * 60 + s;
}

// Turn "3 weeks ago" / "2 days ago" / "5 months ago" → approx ISO timestamp.
function approxPublishedAt(text: string | undefined): string | null {
  if (!text) return null;
  const m = text.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult: Record<string, number> = {
    second: 1, minute: 60, hour: 3600, day: 86400,
    week: 7 * 86400, month: 30 * 86400, year: 365 * 86400,
  };
  const seconds = n * (mult[unit] || 0);
  return new Date(Date.now() - seconds * 1000).toISOString();
}

function parseViewCount(text: string | undefined): number | null {
  if (!text) return null;
  const m = text.match(/([\d,.]+)\s*(K|M|B)?/i);
  if (!m) return null;
  let n = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const suffix = (m[2] || "").toUpperCase();
  if (suffix === "K") n *= 1_000;
  else if (suffix === "M") n *= 1_000_000;
  else if (suffix === "B") n *= 1_000_000_000;
  return Math.round(n);
}

// Pull ytInitialData JSON from a YouTube /results page.
function extractYtInitialData(html: string): any | null {
  const re = /var ytInitialData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/;
  const m = html.match(re);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function walkVideoRenderers(node: any, out: any[]) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walkVideoRenderers(item, out);
    return;
  }
  if (node.videoRenderer) out.push(node.videoRenderer);
  for (const v of Object.values(node)) walkVideoRenderers(v, out);
}

function parseSearchHtml(html: string): ParsedVideo[] {
  const data = extractYtInitialData(html);
  if (!data) return [];
  const renderers: any[] = [];
  walkVideoRenderers(data, renderers);
  const seen = new Set<string>();
  const out: ParsedVideo[] = [];
  for (const r of renderers) {
    const id: string | undefined = r.videoId;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const title: string =
      r.title?.runs?.[0]?.text || r.title?.simpleText || "";
    if (!title || title.length < 5) continue;
    const channel: string | null =
      r.ownerText?.runs?.[0]?.text ||
      r.longBylineText?.runs?.[0]?.text ||
      r.shortBylineText?.runs?.[0]?.text ||
      null;
    const channelId: string | null =
      r.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
      null;
    const description: string | null =
      r.detailedMetadataSnippets?.[0]?.snippetText?.runs
        ?.map((x: any) => x.text)
        .join("") || r.descriptionSnippet?.runs?.map((x: any) => x.text).join("") || null;
    const durationText: string | undefined =
      r.lengthText?.simpleText || r.lengthText?.accessibility?.accessibilityData?.label;
    const publishedText: string | undefined = r.publishedTimeText?.simpleText;
    const viewText: string | undefined = r.viewCountText?.simpleText;
    out.push({
      youtube_id: id,
      title: title.slice(0, 300),
      channel,
      channel_id: channelId,
      description: description?.slice(0, 500) || null,
      duration_seconds: parseDuration(durationText),
      view_count: parseViewCount(viewText),
      published_at: approxPublishedAt(publishedText),
    });
    if (out.length >= 20) break;
  }
  return out;
}

async function searchYouTube(
  query: string,
  window: "week" | "month",
): Promise<ParsedVideo[]> {
  const url =
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` +
    `&sp=${WINDOW_SP[window]}&hl=en-GB&gl=GB`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept-Language": "en-GB,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) {
      console.warn(`YT search ${res.status} for "${query}" (${window})`);
      return [];
    }
    const html = await res.text();
    const vids = parseSearchHtml(html);
    if (vids.length === 0) {
      console.warn(`YT search empty for "${query}" (${window}) - html=${html.length}b`);
    }
    // Drop obvious junk: shorts, fancams, hour-stream mood videos.
    return vids.filter((v) => {
      if (v.duration_seconds !== null) {
        if (v.duration_seconds < 60) return false; // shorts
        if (v.duration_seconds > 3 * 3600) return false; // 3h+ streams/loops
      }
      const lower = v.title.toLowerCase();
      if (/\b(lofi|asmr|live now|24\/7|loop|sleep music)\b/.test(lower)) return false;
      return true;
    });
  } catch (err) {
    console.warn(`YT search failed for "${query}" (${window}):`, err);
    return [];
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


// Universal filter: every video must be about one of
//   1. Careers / jobs / hiring / apprenticeships
//   2. A day in the life / week in the life of a role
//   3. Business / industry / commercial / finance / strategy
//   4. Events / conferences / summits / awards / keynotes
// AND must not look like fan content, reviews, tours, gossip, vlogs, clips,
// full episodes, foreign-language soaps, prank/challenge/ASMR junk.
const UNIVERSAL_SIGNAL = /\b(career|careers|job|jobs|hiring|recruit(?:ment|er|ing)?|apprentice(?:ship)?|graduate scheme|trainee|internship|work experience|how to (?:become|get into|break into)|day in the (?:life|job)|week in the life|a day with|a day at|behind the scenes at|business|industry|industries|commercial|commerce|finance|financial|revenue|earnings|profit|market|markets|strategy|strategic|economy|economics|ceo|cfo|founder|entrepreneur|startup|scale[- ]?up|company|companies|enterprise|sector|conference|summit|expo|awards|event|keynote|panel|talk|fireside|symposium|trade show|exhibition)\b/i;

const UNIVERSAL_BLOCK = /\b(full (?:movie|film|episode|match|game)|official trailer|official teaser|music video|official video|fan ?cam|fan edit|tribute video|ranked|ranking|top \d+|best \d+|worst \d+|easter eggs?|theor(?:y|ies)|ending explained|recap|spoiler|untold|shocking secret|gossip|passes away|funeral|net worth|mansion|car collection|girlfriend|boyfriend|dating life|wife |husband |biopic|asmr|lofi|sleep music|24\/7|loop|prank|challenge|tier list|who would win|funny moments|reaction(?! to industry)|first time (?:watching|reaction)|house tour|home tour|room tour|apartment tour|property tour|mansion tour|hotel tour|shop with me|come (?:shopping|cook|clean) with me|grwm|haul|unboxing|day vlog|weekly vlog|family vlog|wedding vlog)\b/i;

// Per-industry extra layer (stricter than universal).
const FOOTBALL_BUSINESS_SIGNAL = /\b(business|finance|financial|revenue|earnings|profit|loss|wages|wage bill|salary cap|sponsor|sponsorship|broadcast|tv (?:rights|deal|money)|prize money|ownership|owner|takeover|investment|invested|valuation|valued|deal|deals|commercial|economy|economics|market|matchday|ftse|psr|ffp|profitability and sustainability|accounts|balance sheet|shareholder|ipo|private equity|fund|funding|debt|transfer fee|amortisation)\b/i;
const FOOTBALL_FAN_BLOCK = /\b(prediction|predictions|preview|reaction|rant|rants|live[: ]|match ?day live|fancam|highlights|relegation battle|title race(?! finance)|gameweek|game ?week|fpl|fantasy|tipster|bookies|odds|acca|accumulator|injury news|team news|line ?ups?|xi reveal|starting xi|matchday vlog|stadium vlog|away day|vlog|tier list|who would win|goal of the|best goals|top 10 goals|funny moments|skills|tackle of)\b/i;

// Cinema/film/TV must explicitly mention the film, TV, or streaming industry.
const CINEMA_SIGNAL = /\b(film|films|filmmaker|filmmaking|movie|movies|cinema|screen|screenplay|screenwriter|screenwriting|director|directing|producer|producing|production|post[- ]?production|cinematograph(?:y|er)|editor|editing|vfx|sfx|animation|animator|tv|television|broadcast|broadcaster|broadcasting|streamer|streaming|netflix|amazon prime|disney\+?|bbc|itv|channel 4|channel 5|sky\b|bfi|bafta|cannes|sundance|venice film|toronto film|berlin film|distribution|distributor|exhibitor|box office|theatrical|commission(?:er|ing|ed)?|showrunner|writers? room|indie film|independent film|short film|feature film|documentary|docu(?:mentary|series)|reality tv|scripted|unscripted|casting|location manager|gaffer|grip|sound designer|foley|colourist|colorist)\b/i;
const CINEMA_BLOCK = /\b(\bvan\b|\bvans\b|hmrc|tax trap|franchise show|apparel|heat transfer|jade miner|weapons|drone|missile|ukraine|russian|pakistan|bollywood|pakistani|kenyan|airline|airways|supercar|car collection|wedding film|wedding video|music industry|apparel business|farming|farmhand|construction)\b/i;

// Global noise: politics, religion, trafficking, war, crypto pumps, prayer/sermons,
// generic "side hustle / make money online" content, and unrelated geographies.
const GLOBAL_NOISE_BLOCK = /\b(trump|biden|maga|kamala|putin|zelensky|netanyahu|hamas|gaza|israel|palestin|trafficking|smuggl|cartel|terror|jihad|isis|al[- ]qaeda|coup|sermon|prayer|prayers|pastor|preacher|priest|bishop|prophet|prophecy|deliverance|spiritual|god\s+will|jesus|bible|quran|allah|hindu|temple |mosque |church (?!street)|crypto pump|memecoin|forex signals|signals group|side hustle|make money online|earn \$\d|earn £\d|passive income|drop ?ship(?:ping)?|amazon fba|affiliate (?:marketing|cash))\b/i;

// UK relevance: title/description should signal UK (or major UK brand/place).
// If a non-UK geography is named without any UK signal, drop the video.
const UK_SIGNAL = /\b(uk\b|u\.k\.|united kingdom|britain|british|england|english(?! premier)|scotland|scottish|wales|welsh|northern ireland|london|manchester|birmingham|liverpool|leeds|glasgow|edinburgh|cardiff|belfast|bristol|sheffield|newcastle|nottingham|oxford|cambridge|brighton|£|gbp\b|pound sterling|hmrc|nhs|bbc|itv|channel 4|channel 5|sky\b|ofcom|fca\b|companies house|hm treasury|defra|dft\b|dfe\b|westminster|whitehall|parliament|house of commons|premier league|championship|efl|fa cup|prs for music|ppl\b|bpi\b|mobo|brit awards|brits\b|glastonbury|reading festival|leeds festival|isle of wight festival|aim\b|music week|abrsm)\b/i;
const NON_UK_BLOCK = /\b(usa\b|u\.s\.a\.|united states|america|american(?! express)|\$\d|us dollar|usd\b|nyc\b|new york|los angeles|california|texas|chicago|miami|silicon valley|hollywood|bollywood|tollywood|india\b|indian(?! ocean)|mumbai|delhi|bangalore|bengaluru|hyderabad|chennai|kolkata|pakistan|pakistani|karachi|lahore|islamabad|punjab|nepal|nepali|bangladesh|sri lanka|nigeria|nigerian|lagos|abuja|kenya|kenyan|nairobi|ghana|south africa|johannesburg|cape town|egypt|cairo|uae|dubai|abu dhabi|saudi|riyadh|qatar|doha|kuwait|china|chinese|beijing|shanghai|hong kong|singapore|malaysia|philippines|indonesia|thailand|vietnam|japan|japanese|tokyo|korea|korean|seoul|australia|australian|sydney|melbourne|brisbane|new zealand|auckland|canada|canadian|toronto|vancouver|montreal|brazil|brazilian|mexico|mexican|argentina|colombia|chile|peru|venezuela|france|french(?! press)|paris|germany|german|berlin|munich|spain|spanish|madrid|barcelona|italy|italian|rome|milan|portugal|portuguese|lisbon|greece|greek|athens|turkey|turkish|istanbul|russia|russian|moscow|ukraine|ukrainian|kyiv|poland|polish|warsaw|romania|hungary|netherlands|dutch|amsterdam|belgium|belgian|brussels|sweden|swedish|stockholm|norway|norwegian|oslo|denmark|danish|copenhagen|finland|finnish|helsinki|switzerland|swiss|zurich|geneva|austria|austrian|vienna|ireland|irish|dublin)\b/i;

// Per-industry SIGNAL: at least one industry-specific keyword must appear.
// Generic "business/career" alone is not enough — that's how we got Trump
// in grocery and trafficking videos everywhere.
const INDUSTRY_SIGNALS: Record<string, RegExp> = {
  bakery: /\b(baker|bakery|bakeries|baking|bread|loaf|loaves|pastry|pastries|cake|cakes|patisserie|patissier|sourdough|viennoiserie|croissant|doughnut|donut|cookies|biscuit|pie shop|artisan bread)\b/i,
  beauty: /\b(beauty|cosmetic|cosmetics|makeup|make[- ]up|skincare|skin care|haircare|hair care|salon|salons|hairdress|hairstylist|hair stylist|barber|barbers|nail bar|nail tech|nails inc|sephora|space nk|boots beauty|lookfantastic|cult beauty|fragrance|perfume|aesthetician|esthetician|brow|lash|spa\b|spas)\b/i,
  beer: /\b(brew|brewery|breweries|brewer|brewing|beer|ale|lager|stout|ipa|cask|craft beer|cider|pub|pubs|publican|landlord|landlady|brewpub|tap room|taproom|camra|hospitality)\b/i,
  cars: /\b(car|cars|automotive|automobile|vehicle|vehicles|motor|motoring|dealership|dealer|garage|mechanic|technician|ev\b|electric vehicle|tesla|jaguar|land rover|jlr|nissan|toyota|bmw|audi|vw|volkswagen|stellantis|ford|vauxhall|mini\b|mclaren|aston martin|bentley|rolls[- ]royce|jcb|hgv|lorry|truck driver|hgv driver|car dealer|used car|new car|workshop|mot|servicing|bodyshop|paint shop|parts|aftermarket)\b/i,
  charity: /\b(charity|charities|charitable|non[- ]?profit|nonprofit|ngo|third sector|voluntary sector|fundraising|fundrais(?:er|ing)|donor|donat(?:e|ion)|grant|grants|trustee|trustees|foundation|community interest|cic\b|social enterprise|cause|impact|volunteer|volunteering)\b/i,
  cinema: CINEMA_SIGNAL,
  coffee: /\b(coffee|cafe|café|cafés|cafes|espresso|barista|baristas|roaster|roastery|roasting|bean|beans|brew bar|costa|pret|starbucks|nero|gail's|gails|pret a manger|specialty coffee|speciality coffee|flat white|cold brew|tea shop)\b/i,
  "estate-agency": /\b(estate agent|estate agency|estate agencies|letting agent|lettings|conveyanc|chartered surveyor|surveyor|rics\b|naea|propertymark|residential property|commercial property|property market|housing market|house price|home buyer|home buying|first[- ]time buyer|mortgage broker|rightmove|zoopla|onthemarket|purplebricks|knight frank|savills|foxtons|hamptons|winkworth|chestertons|dexters|jll\b|cushman|cbre|cluttons|stamp duty|leasehold|freehold|landlord|tenant|rental market)\b/i,
  farming: /\b(farm|farms|farmer|farming|farmland|agricult|arable|livestock|dairy|cattle|sheep|poultry|crop|crops|harvest|tractor|combine|nfu\b|defra|agri[- ]?(?:business|tech|food)|red tractor|aic\b|cap reform|subsid(?:y|ies)|smallholding|estate manager|gamekeeper|land agent|rural)\b/i,
  fashion: /\b(fashion|apparel|clothing|garment|textile|tailor|tailoring|couture|designer|stylist|catwalk|runway|london fashion week|lfw|paris fashion week|milan fashion week|burberry|asos|boohoo|next plc|primark|marks & spencer|m&s|river island|all ?saints|reiss|jigsaw|whistles|ted baker|paul smith|stella mccartney|jw anderson|vogue|elle|drapers|wgsn|business of fashion|bof\b)\b/i,
  football: /\b(football|soccer|premier league|championship|efl|fa cup|uefa|champions league|europa league|club|clubs|fifa|premier|epl|matchday|stadium|kit deal|sponsor|broadcast|tv rights|psr|ffp|wage bill|transfer|takeover|owner|ownership|valuation|fan engagement|matchday revenue|commercial deal|merchandising|sky sports|tnt sports|bt sport|dazn)\b/i,
  "formula-1": /\b(formula 1|formula one|f1\b|grand prix|gp\b|fia\b|mclaren|mercedes|red bull racing|ferrari|williams f1|aston martin f1|alpine f1|haas f1|sauber|stake f1|hamilton|verstappen|leclerc|norris|russell|paddock|pit lane|pit crew|race engineer|aerodynamicist|chassis|powertrain|silverstone|monza|monaco gp|le mans|motorsport|motor sport|wec\b|imsa|indycar)\b/i,
  gaming: /\b(game|games|gaming|video game|videogame|esports|e[- ]sports|game dev|game design|game studio|games studio|games industry|publisher|publishing|playstation|xbox|nintendo|switch|steam|epic games|unity\b|unreal engine|sony interactive|sega|capcom|square enix|ea sports|electronic arts|ubisoft|activision|king\b|rockstar|rocksteady|sumo digital|tiga|ukie|bafta games)\b/i,
  grocery: /\b(grocery|groceries|grocer|supermarket|supermarkets|convenience store|c[- ]store|hypermarket|fmcg|tesco|sainsbury|asda|morrisons|waitrose|aldi|lidl|m&s food|marks & spencer food|co[- ]?op|iceland foods|ocado|booker|spar|nisa|costcutter|own[- ]brand|private label|grocery sector|retail sector|food retail|grocery aisle|category management|buyer|buying team|merchandising)\b/i,
  health: /\b(nhs|healthcare|health care|clinical|clinician|hospital|hospitals|gp\b|doctor|doctors|nurse|nurses|nursing|midwife|midwifery|paramedic|consultant|ward|patient|patients|primary care|secondary care|pharma|pharmaceutical|biotech|medtech|medical device|life sciences|nice\b|cqc\b|royal college)\b/i,
  "horse-racing": /\b(horse racing|horseracing|racing industry|racecourse|jockey|jockeys|trainer|trainers|stable|stables|stud farm|thoroughbred|bloodstock|tattersalls|godolphin|coolmore|cheltenham|aintree|ascot|epsom|derby|grand national|gold cup|bhA|british horseracing|levy board|tote|tattersall|stable lad|stable hand|going stick|handicap)\b/i,
  hospitality: /\b(hospitality|restaurant|restaurants|hotel|hotels|hotelier|chef|chefs|sommelier|maitre d|front of house|foh\b|boh\b|back of house|bar manager|kitchen|catering|caterer|bartender|mixologist|michelin|gordon ramsay|wagamama|jkS|jks restaurants|nobu|ivy collection|d&d london|caprice|whitbread|premier inn|travelodge|hilton|marriott|accor|ihg\b|four seasons|soho house)\b/i,
  influencing: /\b(influencer|influencing|creator|creators|creator economy|content creator|youtuber|tiktoker|streamer|streamers|twitch|patreon|substack|onlyfans|talent agency|talent manager|creator agency|brand deal|brand partnership|sponsored (?:post|content)|ugc\b|user generated|community manager|social media manager|monetiz|monetisation|monetization|adsense|creator fund|partner program|gleam futures|wmg\b|whalar|the goat agency|influencer marketing)\b/i,
  "interior-design": /\b(interior design|interior designer|interiors|home staging|kitchen design|bathroom design|architectur|soft furnishings|upholster|fabric house|wallpaper|paint range|farrow & ball|little greene|dulux|john lewis home|loaf\b|made\.com|west elm|heal's|liberty|harrods home|conran|kelly hoppen|abigail ahern|house & garden|elle decoration|world of interiors|bida|sbid|kbsa)\b/i,
  jewellery: /\b(jewellery|jewelry|jeweller|jeweler|diamond|diamonds|gemstone|gemstones|gemmolog|gemolog|goldsmith|silversmith|gold|silver|platinum|pearls|tiffany|cartier|graff|bulgari|chopard|boodles|harry winston|de beers|hatton garden|assay office|hallmarking|hallmark|engagement ring|wedding band|bespoke jewellery|fine jewellery|fashion jewellery|jewellery designer|gem-a|gia\b|nag\b)\b/i,
  journalism: /\b(journalis(?:m|t)|reporter|reporters|newsroom|news[- ]?desk|editor|sub[- ]?editor|editor[- ]in[- ]chief|press|media|broadcaster|bbc|itn|sky news|channel 4 news|reuters|associated press|ap\b|bloomberg|financial times|ft\b|the guardian|the times|telegraph|daily mail|the sun|mirror|economist|huffpost|buzzfeed|vice|publisher|publishing|nuj\b|press gazette|investigative|foi\b|column|columnist|byline)\b/i,
  money: /\b(fintech|finance|financial services|banking|bank|banks|investment bank|asset management|wealth management|private equity|venture capital|vc\b|hedge fund|trading floor|trader|equity research|m&a|capital markets|fca\b|pra\b|boe\b|bank of england|hsbc|barclays|natwest|lloyds|standard chartered|monzo|starling|revolut|wise\b|tide bank|fidelity|blackrock|man group|schroders|jupiter|hargreaves lansdown|aj bell|mortgage|insurance|insurer|underwrit|actuary|actuarial|accountant|accountancy|ica(?:ew|s)\b|cima|acca|big four|deloitte|kpmg|pwc|ey\b|ernst & young)\b/i,
  music: /\b(music industry|record label|recording artist|musician|musicians|band|bands|songwriter|songwriting|composer|composing|producer|engineer|a&r\b|publishing|sync|sync deal|tour manager|booking agent|promoter|festival|venue|gig|gigs|live music|streaming royalt|spotify|apple music|tidal|deezer|amazon music|youtube music|universal music|sony music|warner music|bmg\b|merlin|prs for music|ppl\b|aim\b|mu\b|music week)\b/i,
  pets: /\b(pet|pets|petcare|pet care|pet industry|pet shop|pet store|pet food|dog|dogs|cat|cats|puppy|kitten|veterinar|vet\b|vets|vca\b|rspca|kennel club|grooming|groomer|dog walker|dog walking|pet sitter|pet sitting|boarding kennel|cattery|aquatics|reptile|pet retail|pets at home|jollyes|battersea|dogs trust|blue cross)\b/i,
  physiotherapy: /\b(physio|physiotherap|physical therap|physiotherapist|rehab(?:ilitation)?|musculoskeletal|msk\b|sports therap|sports massage|osteopath|chiropract|csp\b|chartered society of physio|hcpc|nhs physio|private physio|clinic|clinical practice|patient assessment|manual therapy|exercise prescription)\b/i,
  psychotherapy: /\b(psychotherap|psychotherapist|counsell?or|counsell?ing|therap(?:y|ist)|psycholog(?:y|ist)|clinical psychology|mental health|cbt\b|cognitive behavioural|psychodynamic|bacp|ukcp|hcpc|nhs talking therapies|iapt|nhs psychology|private practice|client work|supervision)\b/i,
  teaching: /\b(teacher|teachers|teaching|classroom|school|schools|secondary school|primary school|sixth form|college|further education|fe\b|higher education|he\b|ofsted|ks1|ks2|ks3|ks4|ks5|gcse|a[- ]level|sen(?:co)?\b|tlr\b|pgce|qts\b|ect\b|nqt\b|early career teacher|head ?teacher|deputy head|headship|ofsted|trust|multi[- ]academy|mat\b|department for education|dfe\b|nasuwt|neu\b|nahT|aSCL)\b/i,
  travel: /\b(travel|travel industry|tourism|tour operator|tour operators|abta|atol|travel agent|travel agency|airline|airlines|aviation|cabin crew|pilot|pilots|airport|airports|easyJet|ryanair|british airways|ba\b|virgin atlantic|jet2|tui\b|hays travel|trailfinders|kuoni|expedia|booking\.com|airbnb|hotel chain|cruise|p&o cruises|cunard|royal caribbean)\b/i,
  wellness: /\b(wellness|wellbeing|well[- ]being|fitness|gym|gyms|personal trainer|pt\b|pilates|yoga|spin class|crossfit|nutrition|nutritionist|dietitian|david lloyd|virgin active|pure ?gym|gymshark|f45|barrys?\b|barre|reformer|psoas|mindfulness|meditation|peloton)\b/i,
  footwear: /\b(footwear|shoe|shoes|sneaker|sneakers|trainers|boot|boots|cobbler|last\b|lasts|leather|shoemak|cordwainer|dr\.?\s*martens|clarks|church's|crockett & jones|grenson|loake|nike|adidas|puma|new balance|on running|hoka|asics|reebok)\b/i,
  politics: /\b(civil servant|civil service|whitehall|westminster|parliament|parliamentary|house of commons|house of lords|mp\b|mps\b|member of parliament|cabinet office|hm treasury|home office|ministry of defence|ministry of justice|fast stream|special adviser|spad\b|policy advisor|policy adviser|policy officer|think tank|policy institute|local government|council officer|electoral commission|scottish parliament|senedd|hansard)\b/i,
};

function passesIndustryFilter(slug: string, v: ParsedVideo): boolean {
  const hay = `${v.title} ${v.description ?? ""}`;

  // 1. Universal filter applies to every industry.
  if (UNIVERSAL_BLOCK.test(hay)) return false;
  if (GLOBAL_NOISE_BLOCK.test(hay)) return false;
  if (!UNIVERSAL_SIGNAL.test(hay)) return false;

  // 2. English-language only: drop titles dominated by non-Latin scripts.
  const nonLatin = (v.title.match(/[^\x00-\x7F]/g) || []).length;
  if (nonLatin > v.title.length * 0.3) return false;

  // 2b. UK relevance: if any non-UK geography is named and the video has
  // no UK signal, drop it. Catches Pakistani wholesalers, Bollywood, US
  // politics, Indian street food, etc.
  if (NON_UK_BLOCK.test(hay) && !UK_SIGNAL.test(hay)) return false;

  // 3. Football needs stricter business-only signal on top.
  if (slug === "football") {
    if (FOOTBALL_FAN_BLOCK.test(hay)) return false;
    if (!FOOTBALL_BUSINESS_SIGNAL.test(hay)) return false;
  }

  // 4. Cinema-specific block (vans, construction, etc.).
  if (slug === "cinema") {
    if (CINEMA_BLOCK.test(hay)) return false;
  }

  // 5. Industry-specific signal: title/description must mention the
  // actual industry, not just generic "business/career" words.
  const sig = INDUSTRY_SIGNALS[slug];
  if (sig && !sig.test(hay)) return false;

  // 6. For music we require an explicit UK signal — otherwise we get
  // drowned out by US/Indian/Punjabi singing podcasts that pass the
  // generic music-industry signal.
  if (slug === "music" && !UK_SIGNAL.test(hay)) return false;

  return true;
}


async function refreshIndustry(
  supabaseUrl: string,
  serviceKey: string,
  slug: string,
  window: "week" | "month",
): Promise<number> {
  const queries = QUERIES[slug] || [`${slug.replace(/-/g, " ")} industry UK careers`];
  // Run all queries sequentially (polite to YouTube), then merge + deduplicate.
  const rawResults: ParsedVideo[] = [];
  const seen = new Set<string>();
  for (const q of queries) {
    const results = await searchYouTube(q, window);
    for (const v of results) {
      if (!seen.has(v.youtube_id)) {
        seen.add(v.youtube_id);
        rawResults.push(v);
      }
    }
    if (queries.length > 1) await sleep(800);
  }
  const vids = rawResults.filter((v) => passesIndustryFilter(slug, v));
  if (vids.length === 0) return 0;


  const rows = vids.slice(0, 12).map((v) => ({
    industry: slug,
    window_tag: window,
    fetched_at: new Date().toISOString(),
    ...v,
  }));

  const upsertRes = await fetch(
    `${supabaseUrl}/rest/v1/industry_videos?on_conflict=industry,youtube_id`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(rows),
    },
  );
  if (!upsertRes.ok) {
    const err = await upsertRes.text();
    console.error(`upsert [${slug}/${window}]`, err.slice(0, 200));
    return 0;
  }
  return rows.length;
}

// Bounded concurrency to keep Deno Deploy happy.
async function pMapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) break;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  let body: { industry?: string; window?: "week" | "month" } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body is fine - full refresh */
  }

  const windows: ("week" | "month")[] = body.window
    ? [body.window]
    : ["week", "month"];

  const allSlugs = INDUSTRY_REGISTRY.map((i) => i.slug);
  const slugs = body.industry
    ? allSlugs.filter((s) => s === body.industry)
    : allSlugs;

  if (slugs.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: `Unknown industry: ${body.industry}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const tasks: { slug: string; window: "week" | "month" }[] = [];
  for (const s of slugs) for (const w of windows) tasks.push({ slug: s, window: w });

  // If this is a bulk refresh (no industry filter, many tasks), fan out as
  // background per-industry HTTP calls so we don't hit the 60s gateway timeout
  // and so YouTube doesn't see a wall of concurrent requests. We respond
  // immediately and let the work continue via EdgeRuntime.waitUntil.
  const isBulk = !body.industry && tasks.length > 4;
  if (isBulk) {
    const fnUrl = `${supabaseUrl}/functions/v1/fetch-industry-videos`;
    const bg = (async () => {
      for (const s of slugs) {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 45_000);
          const r = await fetch(fnUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
              apikey: serviceKey,
            },
            body: JSON.stringify({ industry: s }),
            signal: ctrl.signal,
          }).finally(() => clearTimeout(timer));
          const txt = await r.text();
          console.log(`[videos][bulk] ${s} -> ${r.status} ${txt.slice(0, 120)}`);
        } catch (err) {
          console.warn(`[videos][bulk] ${s} failed:`, err);
        }
        // Spacing between industries to avoid YouTube throttling.
        await sleep(1500 + Math.floor(Math.random() * 800));
      }
    })();
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(bg);
    }
    return new Response(
      JSON.stringify({ success: true, mode: "bulk-fanout", industries: slugs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Single-industry (or tiny) run: do it inline.
  const perIndustry: Record<string, number> = {};
  let total = 0;
  for (const t of tasks) {
    const n = await refreshIndustry(supabaseUrl, serviceKey, t.slug, t.window);
    total += n;
    perIndustry[`${t.slug}/${t.window}`] = n;
    console.log(`[videos] ${t.slug}/${t.window} -> ${n}`);
    await sleep(400 + Math.floor(Math.random() * 300));
  }



  // Clean out rows older than 60 days so the table doesn't accrue forever.
  try {
    await fetch(
      `${supabaseUrl}/rest/v1/industry_videos?fetched_at=lt.${
        encodeURIComponent(new Date(Date.now() - 60 * 86400 * 1000).toISOString())
      }`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
      },
    );
  } catch (_) { /* non-fatal */ }

  return new Response(
    JSON.stringify({
      success: true,
      industries: slugs.length,
      windows: windows.length,
      rows_upserted: total,
      per_task: perIndustry,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );

});
