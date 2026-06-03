const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALL_INDUSTRIES = [
  "bakery", "beauty", "beer", "cars", "charity", "cinema", "coffee",
  "estate-agency", "farming", "fashion", "food-drink", "football", "footwear",
  "gaming", "grocery", "health", "horse-racing", "hospitality",
  "interior-design", "jewellery", "journalism", "money", "music", "pets",
  "physiotherapy", "psychotherapy", "teaching", "travel", "wellness",
];

// Shuffle so no industry is consistently starved by edge function timeouts
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BATCH_SIZE = 5; // Process 5 industries at a time (10 parallel fetches)
const BATCH_DELAY_MS = 1500; // 1.5s pause between batches

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const results: Record<string, unknown> = {};
  const INDUSTRIES = shuffle(ALL_INDUSTRIES);

  // Process industries in small batches to avoid edge function timeouts
  for (let i = 0; i < INDUSTRIES.length; i += BATCH_SIZE) {
    const batch = INDUSTRIES.slice(i, i + BATCH_SIZE);

    const callFn = async (industry: string, fnName: string): Promise<[string, string, any]> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);
        const res = await fetch(`${supabaseUrl}/functions/v1/${fnName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ industry }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data = await res.json();
        return [industry, fnName, data];
      } catch (err) {
        console.warn(`${fnName} failed for ${industry}:`, err);
        return [industry, fnName, { error: String(err) }];
      }
    };

    // Step 1: RSS first (free). Run in parallel for the whole batch.
    const rssResults = await Promise.allSettled(batch.map((ind) => callFn(ind, "fetch-rss-news")));

    const rssByIndustry: Record<string, any> = {};
    for (const r of rssResults) {
      if (r.status === "fulfilled") {
        const [industry, _fn, data] = r.value;
        rssByIndustry[industry] = data;
        if (!results[industry]) results[industry] = {};
        (results[industry] as Record<string, unknown>).rss = data;
      }
    }

    // Step 2: Only call Perplexity (paid) when RSS returned < 5 headlines.
    const RSS_THRESHOLD = 5;
    const needsPerplexity = batch.filter((ind) => {
      const found = rssByIndustry[ind]?.headlines_found ?? 0;
      return found < RSS_THRESHOLD;
    });

    if (needsPerplexity.length > 0) {
      console.log(`Perplexity fallback for ${needsPerplexity.length}/${batch.length}: ${needsPerplexity.join(", ")}`);
      const articleResults = await Promise.allSettled(
        needsPerplexity.map((ind) => callFn(ind, "scrape-articles"))
      );
      for (const r of articleResults) {
        if (r.status === "fulfilled") {
          const [industry, _fn, data] = r.value;
          if (!results[industry]) results[industry] = {};
          (results[industry] as Record<string, unknown>).articles = data;
        }
      }
    }

    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} complete: ${batch.join(", ")}`);

    // Pause between batches (skip after last batch)
    if (i + BATCH_SIZE < INDUSTRIES.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // Track which industries returned 0 results so we can see in logs
  const empty = Object.entries(results).filter(([_, r]: any) => {
    const rss = r?.rss?.headlines_found ?? 0;
    const arts = r?.articles?.articles_found ?? 0;
    return rss === 0 && arts === 0;
  }).map(([k]) => k);
  if (empty.length > 0) {
    console.warn(`Industries with 0 new content: ${empty.join(", ")}`);
  }

  console.log("Content refresh complete for all industries");

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
