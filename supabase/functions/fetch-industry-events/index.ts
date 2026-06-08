// Weekly Perplexity-powered ingester for upcoming UK industry events.
// Writes into public.industry_events. Idempotent on (industry, url).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const INDUSTRIES: { slug: string; name: string; hint: string; eventbrite?: string; meetup?: string }[] = [
  { slug: "bakery", name: "Bakery", hint: "British Baker, Bakers Federation, Bake International, King's Trust bakery courses", eventbrite: "baking+bakery+UK", meetup: "baking+london" },
  { slug: "beauty", name: "Beauty", hint: "Tone of Beauty, Professional Beauty London, CEW UK, In-Cosmetics, King's Trust hair-and-make-up and nail-art programmes", eventbrite: "beauty+hair+makeup+UK", meetup: "beauty+london" },
  { slug: "beer", name: "Beer", hint: "CAMRA GBBF, Brewers Congress, Beavertown, SIBA BeerX", eventbrite: "craft+beer+brewery+UK", meetup: "beer+homebrewing+london" },
  { slug: "cars", name: "UK automotive industry", hint: "Automotive Management Live, CDX, British Motor Show, SMMT, King's Trust engineering programmes", eventbrite: "automotive+cars+UK", meetup: "automotive+cars+london" },
  { slug: "charity", name: "UK charity sector", hint: "Fundraising Convention, Charity Times Awards, NCVO, Institute of Fundraising, King's Trust enterprise and volunteer programmes", eventbrite: "charity+fundraising+nonprofit+UK", meetup: "charity+fundraising+london" },
  { slug: "cinema", name: "UK film and television", hint: "Edinburgh TV Festival, BAFTAs, London Film Festival, RTS, Sheffield DocFest, King's Trust media and theatre courses", eventbrite: "film+television+media+UK", meetup: "film+filmmaking+london" },
  { slug: "coffee", name: "UK speciality coffee", hint: "London Coffee Festival, Cup of Excellence, SCA UK, Allegra", eventbrite: "coffee+barista+UK", meetup: "coffee+specialty+london" },
  { slug: "estate-agency", name: "UK estate agency and property", hint: "RESI Convention, EA Masters, Negotiator Awards, UKREiiF, Propertymark", eventbrite: "property+estate+agent+UK", meetup: "property+investment+london" },
  { slug: "farming", name: "UK farming and agriculture", hint: "Farmers Weekly Awards, Cereals Event, LAMMA, Groundswell, Oxford Farming Conference, King's Trust environment and outdoor programmes", eventbrite: "farming+agriculture+UK", meetup: "farming+sustainability+london" },
  { slug: "fashion", name: "UK fashion industry", hint: "London Fashion Week, Drapers, Pure London, BFC, Vogue Business, King's Trust fashion and retail programmes", eventbrite: "fashion+design+UK", meetup: "fashion+styling+london" },
  { slug: "football", name: "UK football business and industry", hint: "World Football Summit, SoccerEx, Leaders in Sport, Football Business Awards, Premier League, King's Trust football programmes", eventbrite: "football+soccer+industry+UK", meetup: "football+london" },
  { slug: "footwear", name: "UK footwear industry", hint: "Micam, FN Summit, Drapers Footwear Awards, Footwear Friends", eventbrite: "footwear+shoes+fashion+UK", meetup: "footwear+fashion+london" },
  { slug: "formula-1", name: "UK motorsport and Formula 1", hint: "Autosport International, Motorsport Industry Association, RaceTech, Silverstone, King's Trust engineering programmes", eventbrite: "motorsport+formula1+racing+UK", meetup: "motorsport+london" },
  { slug: "gaming", name: "UK video games industry", hint: "Develop:Brighton, EGX, MCM Comic Con, BAFTA Games, Ukie, King's Trust digital skills programmes", eventbrite: "gaming+videogames+UK", meetup: "gamedev+gaming+london" },
  { slug: "grocery", name: "UK grocery and supermarket industry", hint: "IGD Convention, Grocer Gold Awards, Speciality & Fine Food Fair, King's Trust retail programmes", eventbrite: "grocery+retail+food+UK", meetup: "retail+food+london" },
  { slug: "health", name: "UK healthcare and NHS", hint: "NHS ConfedExpo, HSJ Awards, Nursing Times, Health Plus Care, Digital Health Rewired, King's Trust health and social care programmes", eventbrite: "healthcare+NHS+UK", meetup: "healthcare+medical+london" },
  { slug: "horse-racing", name: "UK horse racing industry", hint: "Cheltenham Festival, Royal Ascot, ROA Conference, TBA, Racing Welfare", eventbrite: "horse+racing+equestrian+UK", meetup: "horse+racing+london" },
  { slug: "hospitality", name: "UK hospitality and restaurants", hint: "HRC Excel, Casual Dining Show, Restaurant Awards, MCA, The Caterer, King's Trust leisure and hospitality courses", eventbrite: "hospitality+restaurant+food+UK", meetup: "hospitality+london" },
  { slug: "influencing", name: "UK creator economy and influencer marketing", hint: "VidCon London, Creator Economy Live, Cannes Lions, IAB, Influencer Marketing Show, King's Trust media programmes", eventbrite: "creator+influencer+social+media+UK", meetup: "content+creator+london" },
  { slug: "interior-design", name: "UK interior design industry", hint: "Decorex, 100% Design, Clerkenwell Design Week, House & Garden Festival", eventbrite: "interior+design+UK", meetup: "interior+design+london" },
  { slug: "jewellery", name: "UK jewellery industry", hint: "International Jewellery London IJL, Goldsmiths Fair, UK Jewellery Awards, NAJ", eventbrite: "jewellery+jewelry+UK", meetup: "jewellery+makers+london" },
  { slug: "journalism", name: "UK journalism and news media", hint: "Society of Editors, British Journalism Awards, Press Gazette, NUJ Conference, News Xchange, King's Trust media courses", eventbrite: "journalism+media+press+UK", meetup: "journalism+writing+london" },
  { slug: "money", name: "UK financial services and fintech", hint: "Money 20/20 Europe, FT Live, Finovate Europe, CityWire, CFA UK, UK Finance", eventbrite: "fintech+finance+banking+UK", meetup: "fintech+finance+london" },
  { slug: "music", name: "UK music industry", hint: "AIM Awards, The Great Escape, Wide Days, MMF, Music Week Awards, King's Trust music programmes", eventbrite: "music+industry+UK", meetup: "music+industry+london" },
  { slug: "pets", name: "UK pet industry", hint: "PATS Telford, London Vet Show, BSAVA Congress, Pet Industry Federation", eventbrite: "pets+veterinary+animal+UK", meetup: "pets+animals+london" },
  { slug: "physiotherapy", name: "UK physiotherapy profession", hint: "CSP Annual Conference, Therapy Expo, BASRaT, Physio First, King's Trust health programmes", eventbrite: "physiotherapy+sports+health+UK", meetup: "physiotherapy+london" },
  { slug: "psychotherapy", name: "UK psychotherapy and counselling", hint: "BACP Conference, UKCP, BPS Conference, New Savoy Conference, King's Trust steps-to-success mental health programmes", eventbrite: "therapy+counselling+mental+health+UK", meetup: "therapy+wellbeing+london" },
  { slug: "teaching", name: "UK schools and education sector", hint: "Bett Show, Schools and Academies Show, TES Awards, Festival of Education, ASCL, King's Trust team and steps-to-success programmes", eventbrite: "education+teaching+schools+UK", meetup: "education+teaching+london" },
  { slug: "travel", name: "UK travel industry", hint: "WTM London, ABTA Travel Convention, Arabian Travel Market, ITB Berlin, Travel Weekly Globe Awards", eventbrite: "travel+tourism+UK", meetup: "travel+london" },
  { slug: "wellness", name: "UK wellness and fitness industry", hint: "ukactive National Summit, Global Wellness Summit, IHRSA, FIBO, ELEVATE, King's Trust health-and-fitness programmes", eventbrite: "wellness+fitness+health+UK", meetup: "wellness+yoga+fitness+london" },
];

const SYSTEM_PROMPT = `You are a UK events researcher. Find ONLY real, verifiable upcoming events with working URLs.

Sources to check for every industry:
1. Official trade body / association events (conferences, awards, exhibitions)
2. Eventbrite UK (eventbrite.co.uk) — search for networking, workshops and meetups in this sector
3. Meetup.com — UK groups and upcoming events in this sector
4. King's Trust (kingstrust.org.uk) — career programmes, courses and workshops for young people in this sector
5. Any other reputable UK organiser

For well-known recurring annual events (e.g. The Great Escape, AIM Awards, BAFTA, London Fashion Week, WTM London), use the latest confirmed edition. Never invent a URL. Output strict JSON only.`;

function buildPrompt(name: string, hint: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const next = new Date(Date.now() + 365 * 86400_000).toISOString().slice(0, 10);
  return `Today is ${today}. List 10-15 UK events for the ${name} sector between ${today} and ${next} (or within 30 days if major).

Include a MIX of:
- Major trade conferences, summits, awards, exhibitions
- Smaller networking events and meetups (Meetup.com, Eventbrite)
- King's Trust career programmes and workshops relevant to this sector
- Any other hands-on or career-entry programmes

Known anchor events: ${hint}.
Explicitly check: Eventbrite UK, Meetup.com UK groups, kingstrust.org.uk/how-we-can-help/courses for this sector.
Recurring annual events — find and include the next confirmed edition even without full agenda.
Aim for at least 10 events. Mix big and small.

For each event return:
{
  "title": "Event name",
  "description": "1 sentence (max 20 words) on what it is and who attends",
  "event_type": "conference|talk|webinar|awards|networking|exhibition|programme",
  "organizer": "Organising body",
  "location": "City, UK or Online",
  "starts_on": "YYYY-MM-DD",
  "ends_on": "YYYY-MM-DD or null",
  "date_label": "e.g. 3-5 Mar 2027",
  "url": "Direct event page URL (must work)"
}
Return ONLY this JSON: { "events": [ ... ] }. No prose, no markdown.`;
}

async function callPerplexity(name: string, hint: string, apiKey: string) {
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(name, hint) },
      ],
      temperature: 0.1,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Perplexity ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  const jsonText = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const match = jsonText.match(/\{[\s\S]*\}/);
  if (!match) {
    console.log(`[${name}] no JSON match. content head:`, content.slice(0, 300));
    return [];
  }
  try {
    const parsed = JSON.parse(match[0]);
    const events = Array.isArray(parsed.events) ? parsed.events : [];
    console.log(`[${name}] parsed ${events.length} events`);
    return events;
  } catch (err) {
    console.log(`[${name}] JSON parse error:`, (err as Error).message, "head:", match[0].slice(0, 200));
    return [];
  }
}

function clean(s: unknown, max = 500): string | null {
  if (typeof s !== "string") return null;
  const t = s.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function isoDate(s: unknown): string | null {
  if (typeof s !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.trim())) return null;
  return s.trim();
}

// Curated baseline of recurring annual UK events + King's Trust programmes.
// Always upserted so the feed is never empty even when Perplexity is overly cautious.
const SEED_EVENTS: Record<string, Array<{
  title: string; url: string; date_label: string; starts_on?: string;
  location: string; event_type: string; organizer: string; description: string;
}>> = {
  music: [
    { title: "The Great Escape", url: "https://greatescapefestival.com", date_label: "May 2027", location: "Brighton, UK", event_type: "conference", organizer: "The Great Escape", description: "UK's leading festival for new music and the music industry's annual gathering." },
    { title: "ILMC – International Live Music Conference", url: "https://www.ilmc.com", date_label: "Mar 2027", location: "London, UK", event_type: "conference", organizer: "ILMC", description: "Global summit for the live music industry, held annually in London." },
    { title: "AIM Awards", url: "https://aim.org.uk/aim-awards/", date_label: "Sep 2026", location: "London, UK", event_type: "awards", organizer: "Association of Independent Music", description: "Celebrating the independent music community in the UK." },
    { title: "Music Week Awards", url: "https://www.musicweek.com/awards", date_label: "Apr 2027", location: "London, UK", event_type: "awards", organizer: "Music Week", description: "Industry awards recognising excellence across the UK music business." },
    { title: "Wide Days", url: "https://www.widedays.com", date_label: "Apr 2027", location: "Edinburgh, UK", event_type: "conference", organizer: "Wide Days", description: "Scotland's flagship music industry convention and showcase festival." },
    { title: "Output Belfast", url: "https://www.outputbelfast.com", date_label: "Feb 2027", location: "Belfast, UK", event_type: "conference", organizer: "Output Belfast", description: "Northern Ireland's biggest music industry conference and showcase event." },
    { title: "FOCUS Wales", url: "https://focuswales.com", date_label: "May 2027", location: "Wrexham, UK", event_type: "conference", organizer: "FOCUS Wales", description: "International music showcase festival and industry conference in Wales." },
    { title: "King's Trust — Get into Music", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free music industry career programme for 16-30 year olds, helping break into the sector." },
  ],
  wellness: [
    { title: "ukactive National Summit", url: "https://www.ukactive.com/events/", date_label: "Nov 2026", location: "London, UK", event_type: "conference", organizer: "ukactive", description: "UK's largest gathering of the physical activity and fitness sector." },
    { title: "Elevate", url: "https://www.elevatearena.com", date_label: "Jun 2026", location: "London, UK", event_type: "exhibition", organizer: "Elevate", description: "UK trade event for physical activity, health and performance." },
    { title: "Global Wellness Summit", url: "https://www.globalwellnesssummit.com", date_label: "Nov 2026", location: "London, UK", event_type: "conference", organizer: "GWS", description: "International gathering of leaders shaping the future of wellness." },
    { title: "King's Trust — Health & Fitness Programme", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free employability programme for 16-30s helping launch a career in health and fitness." },
  ],
  beauty: [
    { title: "Professional Beauty London", url: "https://www.professionalbeauty.co.uk", date_label: "Mar 2027", location: "London, UK", event_type: "exhibition", organizer: "Professional Beauty", description: "UK's premier trade show for beauty professionals, therapists and salons." },
    { title: "King's Trust — Hair, Make-up & Nail Art Courses", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free hands-on beauty courses for 16-30 year olds, leading to industry qualifications." },
  ],
  fashion: [
    { title: "London Fashion Week", url: "https://www.londonfashionweek.co.uk", date_label: "Feb 2027", location: "London, UK", event_type: "exhibition", organizer: "British Fashion Council", description: "The UK's biggest fashion showcase bringing together designers, press and buyers." },
    { title: "King's Trust — Get into Fashion & Retail", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free fashion and retail career programme for 16-30 year olds looking to break in." },
  ],
  football: [
    { title: "King's Trust — Get into Football", url: "https://www.kingstrust.org.uk/how-we-can-help/courses/football", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free football industry career programme for 16-30 year olds, run with clubs and coaches." },
  ],
  cinema: [
    { title: "King's Trust — Get into Media & Theatre", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free media and theatre programmes for 16-30 year olds seeking a first foot in the door." },
  ],
  gaming: [
    { title: "King's Trust — Digital Skills Programme", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free digital skills course for 16-30 year olds, building tech and coding foundations for a career in gaming or tech." },
  ],
  health: [
    { title: "King's Trust — Health & Social Care Programme", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free career programme helping 16-30 year olds get into healthcare and social care roles." },
  ],
  hospitality: [
    { title: "King's Trust — Hospitality & Leisure Programme", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free hospitality employability course for 16-30 year olds, leading to real job opportunities." },
  ],
  grocery: [
    { title: "King's Trust — Get into Retail", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free retail work experience and training programme for 16-30 year olds." },
  ],
  influencing: [
    { title: "King's Trust — Media & Digital Programme", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free digital media career course for 16-30 year olds wanting to work in content and social media." },
  ],
  journalism: [
    { title: "King's Trust — Get into Media", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free media industry career programme helping 16-30 year olds get their first break." },
  ],
  teaching: [
    { title: "King's Trust — Team Programme", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "12-week personal development programme for 16-25 year olds building skills for education and community careers." },
    { title: "King's Trust — Steps to Success", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Short employability programme for young people looking to enter education or community work." },
  ],
  charity: [
    { title: "King's Trust — Explore Enterprise", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free enterprise and start-up programme for 18-30 year olds with a business idea in the social or charity sector." },
  ],
  farming: [
    { title: "King's Trust — Environment & Outdoor Activities", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Outdoor and environmental career programme for 16-30 year olds looking to work in land, nature and sustainability." },
  ],
  "formula-1": [
    { title: "King's Trust — Engineering Programme", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free engineering career programme for 16-30 year olds looking to enter technical and motorsport industries." },
  ],
  cars: [
    { title: "King's Trust — Engineering Programme", url: "https://www.kingstrust.org.uk/how-we-can-help/explore-all-support", date_label: "Rolling", location: "UK-wide", event_type: "programme", organizer: "King's Trust", description: "Free engineering and automotive career programme helping 16-30 year olds break into the industry." },
  ],
};



// Scrape Eventbrite UK search results for an industry via Firecrawl
async function scrapeEventbrite(query: string, firecrawlKey: string): Promise<Array<{
  title: string; url: string; location: string; date_label: string; description: string;
}>> {
  const searchUrl = `https://www.eventbrite.co.uk/d/united-kingdom/${encodeURIComponent(query.replace(/\+/g, "-"))}/`;
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: searchUrl,
        formats: ["markdown"],
        actions: [],
        waitFor: 2000,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const md: string = data?.data?.markdown || "";
    if (!md) return [];

    // Parse markdown for event links — Eventbrite markdown includes [Title](url) patterns
    const events: Array<{ title: string; url: string; location: string; date_label: string; description: string }> = [];
    const linkRe = /\[([^\]]{10,120})\]\((https:\/\/www\.eventbrite\.co\.uk\/e\/[^\)]+)\)/g;
    let m;
    while ((m = linkRe.exec(md)) !== null && events.length < 8) {
      const title = m[1].trim();
      const url = m[2].split("?")[0]; // strip tracking params
      if (title && url && !title.toLowerCase().includes("sign in") && !title.toLowerCase().includes("log in")) {
        events.push({ title, url, location: "UK", date_label: "", description: "Eventbrite event" });
      }
    }
    return events;
  } catch {
    return [];
  }
}

// Scrape Meetup.com search for a UK industry query
async function scrapeMeetup(query: string, firecrawlKey: string): Promise<Array<{
  title: string; url: string; location: string; date_label: string; description: string;
}>> {
  const searchUrl = `https://www.meetup.com/find/?q=${encodeURIComponent(query.replace(/\+/g, " "))}&source=EVENTS&location=gb`;
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: searchUrl,
        formats: ["markdown"],
        waitFor: 3000,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const md: string = data?.data?.markdown || "";
    if (!md) return [];

    const events: Array<{ title: string; url: string; location: string; date_label: string; description: string }> = [];
    const linkRe = /\[([^\]]{10,120})\]\((https:\/\/www\.meetup\.com\/[^\)]+events\/[^\)]+)\)/g;
    let m;
    while ((m = linkRe.exec(md)) !== null && events.length < 6) {
      const title = m[1].trim();
      const url = m[2].split("?")[0];
      if (title && url) {
        events.push({ title, url, location: "UK", date_label: "", description: "Meetup event" });
      }
    }
    return events;
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const PPLX = Deno.env.get("PERPLEXITY_API_KEY");
  const FIRECRAWL = Deno.env.get("FIRECRAWL_API_KEY");
  if (!PPLX) {
    return new Response(JSON.stringify({ error: "PERPLEXITY_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  let body: { industries?: string[]; only?: string } = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const filter = body.industries?.map((s) => s.toLowerCase()) ?? null;
  const targets = INDUSTRIES.filter((i) => !filter || filter.includes(i.slug));

  // Return immediately — run the heavy Perplexity calls in the background
  // to avoid hitting the edge-function wall-clock resource limit.
  const work = (async () => {
    const summary: Record<string, number | string> = {};

    // Sequential, with 2s delay between calls to respect Perplexity rate limits.
    for (const ind of targets) {
      try {
        // Run Perplexity + optional Firecrawl scrapes in parallel
        const [pplxEvents, ebEvents, muEvents] = await Promise.all([
          callPerplexity(ind.name, ind.hint, PPLX),
          FIRECRAWL && ind.eventbrite ? scrapeEventbrite(ind.eventbrite, FIRECRAWL) : Promise.resolve([]),
          FIRECRAWL && ind.meetup ? scrapeMeetup(ind.meetup, FIRECRAWL) : Promise.resolve([]),
        ]);

        let kept = 0;
        const rows = [];

        // Perplexity results
        for (const e of pplxEvents) {
          const title = clean(e?.title, 200);
          const url = clean(e?.url, 600);
          if (!title || !url || !/^https?:\/\//i.test(url)) continue;
          rows.push({
            industry: ind.slug,
            title,
            description: clean(e?.description, 400),
            event_type: clean(e?.event_type, 40),
            organizer: clean(e?.organizer, 200),
            location: clean(e?.location, 120),
            starts_on: isoDate(e?.starts_on),
            ends_on: isoDate(e?.ends_on),
            date_label: clean(e?.date_label, 80),
            url,
            source: "perplexity",
            fetched_at: new Date().toISOString(),
          });
          kept++;
        }

        // Eventbrite results
        for (const e of ebEvents) {
          const title = clean(e.title, 200);
          const url = clean(e.url, 600);
          if (!title || !url) continue;
          rows.push({
            industry: ind.slug,
            title,
            description: "Eventbrite event — click for full details.",
            event_type: "networking",
            organizer: "Eventbrite",
            location: "UK",
            starts_on: null,
            ends_on: null,
            date_label: null,
            url,
            source: "eventbrite",
            fetched_at: new Date().toISOString(),
          });
          kept++;
        }

        // Meetup results
        for (const e of muEvents) {
          const title = clean(e.title, 200);
          const url = clean(e.url, 600);
          if (!title || !url) continue;
          rows.push({
            industry: ind.slug,
            title,
            description: "Meetup event — click for full details.",
            event_type: "networking",
            organizer: "Meetup",
            location: "UK",
            starts_on: null,
            ends_on: null,
            date_label: null,
            url,
            source: "meetup",
            fetched_at: new Date().toISOString(),
          });
          kept++;
        }

        // Always append curated seed events so the feed has a baseline.
        const seeds = SEED_EVENTS[ind.slug] ?? [];
        for (const s of seeds) {
          rows.push({
            industry: ind.slug,
            title: s.title,
            description: s.description,
            event_type: s.event_type,
            organizer: s.organizer,
            location: s.location,
            starts_on: s.starts_on ?? null,
            ends_on: null,
            date_label: s.date_label,
            url: s.url,
            source: "seed",
            fetched_at: new Date().toISOString(),
          });
        }

        if (rows.length) {
          // Dedupe by url within this batch (Postgres upsert can't touch same row twice).
          const seen = new Set<string>();
          const deduped = rows.filter((r) => {
            const key = r.url.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          const { error } = await supabase
            .from("industry_events")
            .upsert(deduped, { onConflict: "industry,url" });
          if (error) {
            summary[ind.slug] = `db error: ${error.message}`;
            continue;
          }
        }

        // Drop events for this industry that are >120 days in the past.
        const cutoff = new Date(Date.now() - 120 * 86400_000).toISOString().slice(0, 10);
        await supabase
          .from("industry_events")
          .delete()
          .eq("industry", ind.slug)
          .not("starts_on", "is", null)
          .lt("starts_on", cutoff);

        summary[ind.slug] = kept;
      } catch (err) {
        summary[ind.slug] = `error: ${(err as Error).message}`;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    console.log("fetch-industry-events complete:", JSON.stringify(summary));
  })();

  if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
    (EdgeRuntime as any).waitUntil(work);
  } else {
    await work;
  }

  return new Response(JSON.stringify({ ok: true, accepted: true, message: "Event fetch started in background", industries: targets.map(t => t.slug) }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
