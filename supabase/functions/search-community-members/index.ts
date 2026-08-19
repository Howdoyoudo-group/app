import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SearchRequest {
  query: string;
  limit?: number;
}

interface CommunityMember {
  id: string;
  full_name: string | null;
  member_bio: string | null;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body: SearchRequest = await req.json();
    const { query, limit = 10 } = body;

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ members: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: members, error } = await supabase
      .from("profiles")
      .select("id, full_name, member_bio")
      .eq("member_directory_opt_in", true)
      .ilike("full_name", `%${query}%`)
      .limit(limit);

    if (error) {
      console.error("Search error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ members: members || [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
