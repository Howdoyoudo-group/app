import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Instagram URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate it looks like an Instagram URL
    const cleaned = url.trim();
    if (!cleaned.includes("instagram.com/")) {
      return new Response(
        JSON.stringify({ success: false, error: "Please provide a valid Instagram URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = cleaned;
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Scraping Instagram URL:", formattedUrl);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl API error:", data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || "Failed to scrape profile" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const markdown = data?.data?.markdown || data?.markdown || "";

    if (!markdown || markdown.length < 20) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not extract profile content. The profile may be private." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up the markdown - extract useful bits
    const lines = markdown.split("\n").filter((l: string) => l.trim().length > 0);
    const profileText = lines
      .filter((l: string) => {
        const lower = l.toLowerCase();
        // Filter out navigation noise
        return !lower.includes("log in") &&
          !lower.includes("sign up") &&
          !lower.includes("cookie") &&
          !lower.includes("download the app") &&
          !lower.includes("open instagram") &&
          !lower.includes("meta © ") &&
          !lower.startsWith("![");
      })
      .join("\n")
      .trim();

    console.log("Scraped profile text length:", profileText.length);

    return new Response(
      JSON.stringify({ success: true, profileText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error scraping Instagram:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
