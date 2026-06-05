import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Mirror of src/lib/industry-rankings.ts knownCompanies (kept in sync manually).
const KNOWN_COMPANIES: Record<string, string[]> = {
  "estate-agency": ["foxtons","savills","knight frank","rightmove","zoopla","purplebricks","countrywide","connells","dexters","hamptons","jll","cbre","cushman & wakefield","chestertons","winkworth","kfh","kinleigh folkard & hayward","douglas & gordon","spicerhaart","haart","lsl property services","leaders","romans","my home move","simplify","premier property lawyers","o'neill patient","slater and gordon","jmw solicitors"],
  fashion: ["asos","boohoo","burberry","net-a-porter","matchesfashion","matches","selfridges","harrods","harvey nichols","liberty","browns","farfetch","depop","vinted","marks & spencer","m&s","next","primark","river island","topshop","zara","h&m","uniqlo","cos","arket","ganni","stella mccartney","alexander mcqueen","victoria beckham","me+em","me+ em","reformation","& other stories","mulberry","barbour","ted baker","paul smith","jigsaw","whistles","reiss","anthropologie","free people","urban outfitters","joseph","the outnet"],
  footwear: ["nike","adidas","new balance","puma","asics","reebok","vans","converse","dr martens","dr. martens","birkenstock","ugg","timberland","clarks","kurt geiger","office","schuh","footlocker","foot locker","jd sports","russell & bromley","loake","church's","hunter","crocs","on running","hoka"],
  hospitality: ["soho house","the ivy","hawksmoor","dishoom","nobu","sexy fish","sketch","annabel's","annabels","mortimer house","five guys","honest burgers","shake shack","gail's","gails","ottolenghi","wagamama","pret","pret a manger","leon","itsu","wahaca","nando's","nandos","pizza pilgrims","franco manca","wright brothers","the wolseley","scott's","j sheekey","rick stein","tom kerridge","marriott","hilton","rosewood","claridge's","the savoy","the dorchester","the connaught","the langham","edition","ace hotel","the standard","broadwick","everyman cinema","merlin entertainments"],
  coffee: ["grind","blank street","caffe nero","caffè nero","costa","starbucks","pret","pret a manger","gail's","gails","joe & the juice","monmouth coffee","square mile","workshop coffee","ozone coffee","kaffeine","department of coffee","allpress","origin coffee","union hand-roasted","climpson & sons","watch house","rapha"],
  bakery: ["gail's","gails","greggs","pret","pret a manger","paul","le pain quotidien","ole & steen","fabrique","the dusty knuckle","e5 bakehouse","st john bakery","paul rhodes bakery","bread ahead","pophams","the hummingbird bakery","lola's cupcakes","honey & co","warburtons","hovis","kingsmill","allied bakeries"],
  beer: ["beavertown","camden town brewery","brewdog","fuller's","fullers","young's","youngs","shepherd neame","thornbridge","verdant","northern monk","cloudwater","five points","magic rock","the kernel","deya","siren craft","wild beer","innis & gunn","diageo","carlsberg","molson coors","heineken","asahi","budweiser","stone brewing","guinness","hawkstone"],
  cinema: ["netflix","amazon prime","amazon mgm","disney","warner bros","warner brothers","universal","paramount","sony pictures","a24","bbc films","bbc studios","channel 4","film4","bfi","working title","see-saw films","pathé","pathe","studiocanal","everyman","curzon","picturehouse","vue","odeon","cineworld","imax","lionsgate","focus features","searchlight"],
  music: ["spotify","apple music","youtube music","tidal","soundcloud","universal music","sony music","warner music","warner records","polydor","island records","atlantic records","columbia records","rca","domino","ninja tune","xl recordings","rough trade","beggars group","secretly group","ditto music","kobalt","bmg","live nation","aeg presents","broadwick","festival republic","academy music group","dice","ticketmaster","resident advisor"],
  football: ["premier league","english football league","efl","the fa","uefa","fifa","manchester united","manchester city","liverpool","chelsea","arsenal","tottenham","tottenham hotspur","newcastle united","aston villa","west ham","everton","brighton","crystal palace","fulham","wolves","leicester city","leeds united","sky sports","tnt sports","bt sport","dazn","espn","nike","adidas","puma","umbro","castore","kitbag","fanatics","stats perform","opta","wyscout","transfermarkt","the athletic"],
  charity: ["save the children","oxfam","british red cross","cancer research uk","macmillan","marie curie","mind","samaritans","shelter","barnardo's","barnardos","nspcc","wwf","rspb","national trust","english heritage","amnesty","unicef","the trussell trust","comic relief","crisis","centrepoint","stonewall","scope","age uk","alzheimer's society","alzheimers society","british heart foundation","rnli","guide dogs","teach first","the king's trust","kings trust","the prince's trust","princes trust"],
  "interior-design": ["tom dixon","soho home","the conran shop","heal's","heals","made.com","loaf","habitat","john lewis","liberty","kelly hoppen","martin brudnizki","rose uniacke","studio ashby","studioilse","ilse crawford","david collins studio","yabu pushelberg","farrow & ball","little greene","designers guild","house of hackney","porta romana","vaughan designs","andrew martin","fromental","dedar","kvadrat","pierre frey","armani casa","minotti","b&b italia","molteni","cassina","vitra","knoll","fritz hansen","carl hansen","muuto","&tradition","hay","ferm living"],
  gaming: ["rockstar","rockstar games","ubisoft","ea","electronic arts","activision blizzard","activision","blizzard","sony interactive","playstation","xbox","microsoft xbox","nintendo","epic games","riot games","valve","bungie","naughty dog","rare","playground games","creative assembly","sumo digital","sega","square enix","capcom","bandai namco","konami","cd projekt","embracer group","supercell","king","king games","zynga","miniclip","frontier developments","mediatonic"],
  grocery: ["tesco","sainsbury's","sainsburys","asda","morrisons","waitrose","ocado","marks & spencer food","m&s food","lidl","aldi","co-op","the co-operative","iceland","whole foods","amazon fresh","deliveroo","uber eats","gopuff","getir","gorillas","mindful chef","gousto","hellofresh","abel & cole","riverford","borough market","harrods food hall"],
  jewellery: ["tiffany","tiffany & co","cartier","bulgari","van cleef","van cleef & arpels","boodles","graff","harry winston","chopard","buccellati","pragnell","garrard","asprey","mappin & webb","goldsmiths","ernest jones","h. samuel","beaverbrooks","fraser hart","monica vinader","missoma","astrid & miyu","astley clarke","alighieri","annoushka","stephen webster","shaun leane","links of london","pandora","swarovski"],
  journalism: ["bbc","the times","the sunday times","the guardian","the observer","the telegraph","the daily telegraph","the financial times","ft","reuters","bloomberg","associated press","the economist","vogue","tatler","monocle","wallpaper","wired","vice","the new york times","the wall street journal","wsj","channel 4 news","itn","sky news","news uk","dmg media","daily mail","metro","i news","the spectator","the new statesman","prospect","private eye","tortoise","the athletic","buzzfeed","huffpost"],
  pets: ["pets at home","vets4pets","ivc evidensia","cvs group","medivet","linnaeus","tails.com","butternut box","lily's kitchen","lilys kitchen","burns pet nutrition","natures menu","natures:menu","barking heads","harringtons","wagg foods","battersea dogs and cats","dogs trust","rspca","blue cross","pdsa","cats protection"],
  physiotherapy: ["nuffield health","bupa","spire healthcare","hca healthcare","circle health","ramsay health care","the london clinic","physio.co.uk","ascenti","connect health","pure sports medicine","mlc physio","the chelsea consulting rooms","the wellington hospital","the princess grace hospital","the portland hospital","the english institute of sport","british olympic association","premier league clubs","england rugby","lawn tennis association"],
  psychotherapy: ["the priory","priory group","nuffield health","bupa","spire healthcare","tavistock","the tavistock and portman","the maudsley","south london and maudsley","the anna freud centre","british association for counselling and psychotherapy","bacp","ukcp","bps","british psychological society","headspace","calm","talkspace","betterhelp","spill","unmind","kooth","place2be","mind","samaritans","young minds"],
  teaching: ["teach first","ark schools","harris federation","united learning","outwood grange academies trust","oasis community learning","e-act","academies enterprise trust","reach academy","dixons academies trust","star academies","the king's college school","westminster school","eton college","harrow school","winchester college","st paul's school","city of london school","highgate school","north london collegiate","wellington college","marlborough college","rugby school","charterhouse","department for education","ofsted","education endowment foundation"],
  travel: ["british airways","virgin atlantic","easyjet","ryanair","jet2","tui","jet2holidays","expedia","booking.com","airbnb","trainline","national rail","eurostar","marriott","hilton","intercontinental","rosewood","four seasons","soho house","lonely planet","kuoni","trailfinders","audley travel","abercrombie & kent","scott dunn","secret escapes","loveholidays","on the beach","trip.com","skyscanner","kayak"],
  wellness: ["psycle","barry's","barrys bootcamp","f45","third space","equinox","soulcycle","1rebel","rumble","kobox","bxr","blok london","nuffield health","virgin active","david lloyd","pure gym","puregym","the gym group","fitness first","lululemon","alo yoga","sweaty betty","gymshark","headspace","calm","peloton","the class","frame","triyoga","yotopia","core collective","neville hair and beauty","neville","cowshed","the now massage","champneys","the lanesborough club & spa","akasha","espa"],
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RECIPIENT = "andrew@stanwoodoffice.com";

// Pretty industry display names
const INDUSTRY_LABELS: Record<string, string> = {
  "estate-agency": "Estate Agency",
  "interior-design": "Interior Design",
  fashion: "Fashion", footwear: "Footwear", hospitality: "Hospitality",
  coffee: "Coffee", bakery: "Bakery", beer: "Beer", cinema: "Film and TV",
  music: "Music", football: "Football", charity: "Charity", gaming: "Gaming",
  grocery: "Grocery", jewellery: "Jewellery", journalism: "Journalism",
  pets: "Pets", physiotherapy: "Physiotherapy", psychotherapy: "Psychotherapy",
  teaching: "Teaching", travel: "Travel", wellness: "Wellness",
  farming: "Farming", money: "Money", health: "Health", "horse-racing": "Horse Racing",
};

function normaliseSlug(industry: string | null | undefined): string {
  return (industry || "").toLowerCase().trim().replace(/\s+/g, "-");
}

function isKnownCompany(industrySlug: string, company: string): boolean {
  const list = KNOWN_COMPANIES[industrySlug];
  if (!list) return false;
  const lower = company.toLowerCase();
  return list.some((c) => lower.includes(c));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all live jobs
    const allJobs: { company: string; industry: string | null; title: string | null }[] = [];
    let from = 0;
    const batchSize = 1000;
    const nowIso = new Date().toISOString();
    while (true) {
      const { data, error } = await supabase
        .from("jobs")
        .select("company, industry, title")
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .range(from, from + batchSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allJobs.push(...data);
      if (data.length < batchSize) break;
      from += batchSize;
    }

    // Group: industry -> company -> count
    type IndustryAgg = {
      slug: string;
      label: string;
      total: number;
      known: Map<string, number>;
      other: Map<string, number>;
    };
    const industries = new Map<string, IndustryAgg>();

    for (const job of allJobs) {
      if (!job.company) continue;
      const company = job.company.trim();
      if (!company) continue;
      const slug = normaliseSlug(job.industry) || "uncategorised";
      const label = INDUSTRY_LABELS[slug] ?? (job.industry || "Uncategorised");
      let agg = industries.get(slug);
      if (!agg) {
        agg = { slug, label, total: 0, known: new Map(), other: new Map() };
        industries.set(slug, agg);
      }
      agg.total += 1;
      const bucket = isKnownCompany(slug, company) ? agg.known : agg.other;
      bucket.set(company, (bucket.get(company) || 0) + 1);
    }

    // Sort industries by total desc
    const sortedIndustries = [...industries.values()].sort((a, b) => b.total - a.total);
    const totalRoles = sortedIndustries.reduce((s, i) => s + i.total, 0);

    const today = new Date().toLocaleDateString("en-GB", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const renderCompanyTable = (companies: Map<string, number>, badge: string, badgeColor: string) => {
      if (companies.size === 0) return "";
      const rows = [...companies.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([co, n], i) => `
          <tr>
            <td style="padding:5px 10px;border-bottom:1px solid #f0f0f0;color:#bbb;font-size:11px;width:24px">${i + 1}</td>
            <td style="padding:5px 10px;border-bottom:1px solid #f0f0f0;font-size:13px">${co}</td>
            <td style="padding:5px 10px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;font-size:13px">${n}</td>
          </tr>`).join("");
      return `
        <div style="margin:10px 0 16px">
          <div style="display:inline-block;background:${badgeColor};color:#000;font-size:10px;font-weight:700;padding:3px 8px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px">${badge} · ${companies.size}</div>
          <table style="width:100%;border-collapse:collapse">${rows}</table>
        </div>`;
    };

    const industryBlocks = sortedIndustries.map((ind) => `
      <div style="margin-bottom:32px;padding:18px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa">
        <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:8px">
          <h2 style="font-size:18px;margin:0;color:#000">${ind.label}</h2>
          <div style="font-size:13px;color:#555"><strong>${ind.total.toLocaleString()}</strong> live roles · ${ind.known.size + ind.other.size} companies</div>
        </div>
        ${renderCompanyTable(ind.known, "In our Who? section", "#00e600")}
        ${renderCompanyTable(ind.other, "Other employers", "#e5e5e5")}
      </div>`).join("");

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;margin:0">
  <div style="max-width:720px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5">
    <div style="background:#000;padding:24px 30px">
      <h1 style="color:#fff;font-size:22px;margin:0">How do you do<span style="color:#00e600">.</span></h1>
      <p style="color:#aaa;font-size:13px;margin:6px 0 0">Weekly Employer Report - ${today}</p>
    </div>
    <div style="padding:24px 30px">
      <p style="font-size:14px;color:#333;margin:0 0 20px">Live roles broken down by industry, then split between companies featured in our <strong>Who?</strong> sections and others.</p>
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;flex:1;text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#000">${sortedIndustries.length}</div>
          <div style="font-size:12px;color:#777;margin-top:4px">Industries</div>
        </div>
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;flex:1;text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#000">${totalRoles.toLocaleString()}</div>
          <div style="font-size:12px;color:#777;margin-top:4px">Total live roles</div>
        </div>
      </div>
      ${industryBlocks}
      <p style="font-size:11px;color:#999;margin-top:24px;text-align:center">Generated automatically by howdoyoudo every Monday at 8am UK time.</p>
    </div>
  </div>
</body></html>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "howdoyoudo <reports@notify.howdoyoudo.group>",
        to: [RECIPIENT],
        subject: `Weekly Employer Report - ${sortedIndustries.length} industries · ${totalRoles.toLocaleString()} live roles`,
        html,
      }),
    });
    const emailResult = await emailRes.json();

    return new Response(JSON.stringify({
      success: true,
      industries: sortedIndustries.length,
      totalRoles,
      breakdown: sortedIndustries.map(i => ({
        industry: i.label, total: i.total,
        knownCompanies: i.known.size, otherCompanies: i.other.size,
      })),
      emailResult,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
