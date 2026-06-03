// Fetches the top course for an industry from Reed.co.uk Courses.
// Returns { title, provider, url, price } or { error }.
// Scrapes the public Reed Courses search HTML (no Reed Courses public API exists).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map industry slug -> a sensible Reed Courses search keyword.
const KEYWORDS: Record<string, string> = {
  bakery: "baking",
  beauty: "beauty therapy",
  beer: "beer brewing",
  cars: "automotive",
  charity: "fundraising",
  cinema: "film production",
  coffee: "barista",
  "estate-agency": "estate agency",
  farming: "agriculture",
  fashion: "fashion",
  football: "football coaching",
  footwear: "footwear design",
  "formula-1": "motorsport engineering",
  gaming: "game design",
  grocery: "retail management",
  health: "healthcare",
  "horse-racing": "equine",
  hospitality: "hospitality management",
  influencing: "content creation",
  "interior-design": "interior design",
  jewellery: "jewellery making",
  journalism: "journalism",
  money: "finance",
  music: "music production",
  pets: "animal care",
  physiotherapy: "physiotherapy",
  psychotherapy: "counselling",
  teaching: "teaching",
  travel: "travel and tourism",
  wellness: "wellbeing",
};

function pickKeyword(slug: string): string {
  if (!slug || slug === "all") return "career development";
  return KEYWORDS[slug] ?? slug.replace(/-/g, " ");
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/\s+/g, " ")
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { industry } = await req.json().catch(() => ({ industry: "all" }));
    const keyword = pickKeyword(industry);
    // Reed's canonical search endpoint. Category slugs (/courses/<slug>) 404 for
    // arbitrary keywords — /courses/all?keywords=... always works.
    const searchUrl = `https://www.reed.co.uk/courses/all?keywords=${encodeURIComponent(keyword)}`;

    const res = await fetch(searchUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-GB,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Reed ${res.status}`, fallbackUrl: searchUrl, keyword }),
        { status: 200, headers: { ...corsHeaders, "content-type": "application/json" } },
      );
    }

    const html = await res.text();

    // Course title anchors look like:
    //   <a href="/courses/<slug>/<id>#..." ... data-element-action="Title here" title="Title here">
    // The title sits in two attributes — much more reliable than parsing inner HTML.
    const linkRe =
      /<a\b[^>]*href="(\/courses\/[a-z0-9\-]+\/\d+)[^"]*"[^>]*>/gi;
    const titleAttrRe =
      /(?:data-element-action|title|data-element-name)="([^"]{8,300})"/i;

    let course: { title: string; url: string } | null = null;
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(html))) {
      const url = match[1];
      const tag = match[0];
      const t = tag.match(titleAttrRe);
      if (!t) continue; // first wrapper anchor for each card has no title; the title-bearing one comes next
      const title = decode(t[1]);
      if (title.length < 10) continue;
      if (/^(see more|see less|view|browse|sponsored|find a course)$/i.test(title)) continue;
      course = { title, url: `https://www.reed.co.uk${url}` };
      break;
    }

    // Try to grab a provider name near the course block
    let provider: string | null = null;
    if (course) {
      const id = course.url.match(/\/(\d+)(?:#|$)/)?.[1];
      if (id) {
        const blockStart = html.indexOf(`course-${id}`);
        const block = blockStart >= 0 ? html.slice(blockStart, blockStart + 4000) : "";
        const prov = block.match(
          /class="[^"]*provider-name[^"]*"[^>]*>\s*(?:<[^>]+>\s*)*([^<]{2,120})</i,
        );
        if (prov) provider = decode(prov[1]);
      }
    }


    if (!course) {
      const probeRe = /<a\b[^>]*href="(\/courses\/[a-z0-9\-]+\/\d+)[^"]*"[^>]*>/gi;
      const probeTitle = /(?:data-element-action|title|data-element-name)="([^"]{8,300})"/i;
      const probes: Array<{ url: string; tagSample: string; title: string | null }> = [];
      let pm: RegExpExecArray | null;
      let n = 0;
      while ((pm = probeRe.exec(html)) && n < 5) {
        const t = pm[0].match(probeTitle);
        probes.push({
          url: pm[1],
          tagSample: pm[0].slice(0, 250),
          title: t ? t[1] : null,
        });
        n++;
      }
      return new Response(
        JSON.stringify({
          error: "no-course-found",
          fallbackUrl: searchUrl,
          keyword,
          debug: { htmlLength: html.length, probes },
        }),
        { status: 200, headers: { ...corsHeaders, "content-type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        title: course.title,
        url: course.url,
        provider,
        keyword,
        searchUrl,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
          "cache-control": "public, max-age=86400",
        },
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String((e as Error)?.message ?? e) }),
      { status: 200, headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  }
});
