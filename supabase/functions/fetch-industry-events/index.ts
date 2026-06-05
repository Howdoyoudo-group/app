// Weekly Perplexity-powered ingester for upcoming UK industry events.
// Writes into public.industry_events. Idempotent on (industry, url).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const INDUSTRIES: { slug: string; name: string; hint: string }[] = [
  { slug: "bakery", name: "Bakery", hint: "British Baker, Bakers Federation, Bake International" },
  { slug: "beauty", name: "Beauty", hint: "Tone of Beauty, Professional Beauty London, CEW UK, In-Cosmetics" },
  { slug: "beer", name: "Beer", hint: "CAMRA GBBF, Brewers Congress, Beavertown, SIBA BeerX" },
  { slug: "cars", name: "UK automotive industry", hint: "Automotive Management Live, CDX, British Motor Show, SMMT" },
  { slug: "charity", name: "UK charity sector", hint: "Fundraising Convention, Charity Times Awards, NCVO, Institute of Fundraising" },
  { slug: "cinema", name: "UK film and television", hint: "Edinburgh TV Festival, BAFTAs, London Film Festival, RTS, Sheffield DocFest" },
  { slug: "coffee", name: "UK speciality coffee", hint: "London Coffee Festival, Cup of Excellence, SCA UK, Allegra" },
  { slug: "estate-agency", name: "UK estate agency and property", hint: "RESI Convention, EA Masters, Negotiator Awards, UKREiiF, Propertymark" },
  { slug: "farming", name: "UK farming and agriculture", hint: "Farmers Weekly Awards, Cereals Event, LAMMA, Groundswell, Oxford Farming Conference" },
  { slug: "fashion", name: "UK fashion industry", hint: "London Fashion Week, Drapers, Pure London, BFC, Vogue Business" },
  { slug: "football", name: "UK football business and industry", hint: "World Football Summit, SoccerEx, Leaders in Sport, Football Business Awards, Premier League" },
  { slug: "footwear", name: "UK footwear industry", hint: "Micam, FN Summit, Drapers Footwear Awards, Footwear Friends" },
  { slug: "formula-1", name: "UK motorsport and Formula 1", hint: "Autosport International, Motorsport Industry Association, RaceTech, Silverstone" },
  { slug: "gaming", name: "UK video games industry", hint: "Develop:Brighton, EGX, MCM Comic Con, BAFTA Games, Ukie" },
  { slug: "grocery", name: "UK grocery and supermarket industry", hint: "IGD Convention, Grocer Gold Awards, Speciality & Fine Food Fair" },
  { slug: "health", name: "UK healthcare and NHS", hint: "NHS ConfedExpo, HSJ Awards, Nursing Times, Health Plus Care, Digital Health Rewired" },
  { slug: "horse-racing", name: "UK horse racing industry", hint: "Cheltenham Festival, Royal Ascot, ROA Conference, TBA, Racing Welfare" },
  { slug: "hospitality", name: "UK hospitality and restaurants", hint: "HRC Excel, Casual Dining Show, Restaurant Awards, MCA, The Caterer" },
  { slug: "influencing", name: "UK creator economy and influencer marketing", hint: "VidCon London, Creator Economy Live, Cannes Lions, IAB, Influencer Marketing Show" },
  { slug: "interior-design", name: "UK interior design industry", hint: "Decorex, 100% Design, Clerkenwell Design Week, House & Garden Festival" },
  { slug: "jewellery", name: "UK jewellery industry", hint: "International Jewellery London IJL, Goldsmiths Fair, UK Jewellery Awards, NAJ" },
  { slug: "journalism", name: "UK journalism and news media", hint: "Society of Editors, British Journalism Awards, Press Gazette, NUJ Conference, News Xchange" },
  { slug: "money", name: "UK financial services and fintech", hint: "Money 20/20 Europe, FT Live, Finovate Europe, CityWire, CFA UK, UK Finance" },
  { slug: "music", name: "UK music industry", hint: "AIM Awards, The Great Escape, Wide Days, MMF, Music Week Awards" },
  { slug: "pets", name: "UK pet industry", hint: "PATS Telford, London Vet Show, BSAVA Congress, Pet Industry Federation" },
  { slug: "physiotherapy", name: "UK physiotherapy profession", hint: "CSP Annual Conference, Therapy Expo, BASRaT, Physio First" },
  { slug: "psychotherapy", name: "UK psychotherapy and counselling", hint: "BACP Conference, UKCP, BPS Conference, New Savoy Conference" },
  { slug: "teaching", name: "UK schools and education sector", hint: "Bett Show, Schools and Academies Show, TES Awards, Festival of Education, ASCL" },
  { slug: "travel", name: "UK travel industry", hint: "WTM London, ABTA Travel Convention, Arabian Travel Market, ITB Berlin, Travel Weekly Globe Awards" },
  { slug: "wellness", name: "UK wellness and fitness industry", hint: "ukactive National Summit, Global Wellness Summit, IHRSA, FIBO, ELEVATE" },
];

const SYSTEM_PROMPT = `You are a UK events researcher. You return ONLY real, verifiable events with working URLs. For well-known recurring annual events (e.g. The Great Escape, AIM Awards, ILMC, Music Week Awards, BAFTA, London Fashion Week, WTM London), use the latest officially announced or confirmed edition — these have predictable yearly dates. Never invent an organiser or fake URL. Output strict JSON only.`;

function buildPrompt(name: string, hint: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const next = new Date(Date.now() + 365 * 86400_000).toISOString().slice(0, 10);
  return `Today is ${today}. List 8-12 UK industry events for the ${name} sector that take place between ${today} and ${next} (or within the last 30 days if major).
Include: conferences, summits, awards ceremonies, exhibitions, trade shows, networking events, panel talks and webinars.
Known authoritative events to check first: ${hint}. Most of these run annually — find the confirmed next edition. You may include other reputable UK industry events too.
IMPORTANT: Recurring annual events have a predictable next edition — include them even if the full agenda is not yet published, using the official event homepage URL. Do not return an empty list when well-known annual events exist for this sector.
Be generous — aim for at least 8 events.
For each event, return:
{
  "title": "Event name",
  "description": "1 sentence (max 20 words) on what it is and who attends",
  "event_type": "conference|talk|webinar|awards|networking|exhibition",
  "organizer": "Organising body",
  "location": "City, UK"  OR  "Online",
  "starts_on": "YYYY-MM-DD",
  "ends_on":   "YYYY-MM-DD or null",
  "date_label":"e.g. 3-5 Mar 2027",
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

// Curated baseline of recurring annual UK events. Always upserted so the feed
// is never empty even when Perplexity is overly cautious. URLs are official
// event homepages — they remain valid year-to-year.
const SEED_EVENTS: Record<string, Array<{
  title: string; url: string; date_label: string; starts_on?: string;
  location: string; event_type: string; organizer: string; description: string;
}>> = {
  music: [
    { title: "The Great Escape 2027", url: "https://greatescapefestival.com", date_label: "May 2027", location: "Brighton, UK", event_type: "conference", organizer: "The Great Escape", description: "UK's leading festival for new music and the music industry's annual gathering." },
    { title: "ILMC – International Live Music Conference", url: "https://www.ilmc.com", date_label: "Mar 2027", location: "London, UK", event_type: "conference", organizer: "ILMC", description: "Global summit for the live music industry, held annually in London." },
    { title: "AIM Awards", url: "https://aim.org.uk/aim-awards/", date_label: "Sep 2026", location: "London, UK", event_type: "awards", organizer: "Association of Independent Music", description: "Celebrating the independent music community in the UK." },
    { title: "Music Week Awards", url: "https://www.musicweek.com/awards", date_label: "Apr 2027", location: "London, UK", event_type: "awards", organizer: "Music Week", description: "Industry awards recognising excellence across the UK music business." },
    { title: "Wide Days", url: "https://www.widedays.com", date_label: "Apr 2027", location: "Edinburgh, UK", event_type: "conference", organizer: "Wide Days", description: "Scotland's flagship music industry convention and showcase festival." },
    { title: "Output Belfast", url: "https://www.outputbelfast.com", date_label: "Feb 2027", location: "Belfast, UK", event_type: "conference", organizer: "Output Belfast", description: "Northern Ireland's biggest music industry conference and showcase event." },
    { title: "FOCUS Wales", url: "https://focuswales.com", date_label: "May 2027", location: "Wrexham, UK", event_type: "conference", organizer: "FOCUS Wales", description: "International music showcase festival and industry conference in Wales." },
    { title: "BPI AGM & Conference", url: "https://www.bpi.co.uk", date_label: "Jul 2026", location: "London, UK", event_type: "conference", organizer: "BPI", description: "British Phonographic Industry annual gathering of UK record labels." },
  ],
  wellness: [
    { title: "ukactive National Summit", url: "https://www.ukactive.com/events/", date_label: "Nov 2026", location: "London, UK", event_type: "conference", organizer: "ukactive", description: "UK's largest gathering of the physical activity and fitness sector." },
    { title: "Elevate", url: "https://www.elevatearena.com", date_label: "Jun 2026", location: "London, UK", event_type: "exhibition", organizer: "Elevate", description: "UK trade event for physical activity, health and performance." },
    { title: "Global Wellness Summit", url: "https://www.globalwellnesssummit.com", date_label: "Nov 2026", location: "London, UK", event_type: "conference", organizer: "GWS", description: "International gathering of leaders shaping the future of wellness." },
  ],
};



Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const PPLX = Deno.env.get("PERPLEXITY_API_KEY");
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

  const summary: Record<string, number | string> = {};

  // Sequential, with 2s delay between calls to respect Perplexity rate limits.
  for (const ind of targets) {
    try {
      const events = await callPerplexity(ind.name, ind.hint, PPLX);
      let kept = 0;
      const rows = [];
      for (const e of events) {
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

  return new Response(JSON.stringify({ ok: true, summary }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
