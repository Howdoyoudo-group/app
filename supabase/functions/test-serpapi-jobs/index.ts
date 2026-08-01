// Temporary diagnostic: test SerpAPI's google_jobs engine for Asda/Tesco
// coverage before committing to a quota/plan decision. Not part of the
// regular pipeline - delete once the decision is made.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY") || "";
  if (!SERPAPI_KEY) {
    return new Response(JSON.stringify({ error: "SERPAPI_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { q = "Asda jobs UK" } = await req.json().catch(() => ({}));

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_jobs");
  url.searchParams.set("q", q);
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "uk");
  url.searchParams.set("location", "United Kingdom");
  url.searchParams.set("api_key", SERPAPI_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();

  const results = data?.jobs_results || [];
  return new Response(
    JSON.stringify({
      status: res.status,
      query: q,
      result_count: results.length,
      has_next_page_token: !!data?.serpapi_pagination?.next_page_token,
      search_metadata_status: data?.search_metadata?.status,
      error: data?.error,
      sample: results.slice(0, 5).map((r: any) => ({
        title: r.title,
        company_name: r.company_name,
        location: r.location,
        via: r.via,
        posted_at: r.detected_extensions?.posted_at,
      })),
    }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
