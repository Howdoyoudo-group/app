/**
 * delete-account — permanently removes a user's account and all associated data.
 *
 * Called by authenticated users only. Validates the JWT, extracts the user ID,
 * then deletes in order: suppressed_emails, subscribers, profiles, and finally
 * calls auth.admin.deleteUser to remove the auth record.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify the caller is authenticated
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userJwt = authHeader.replace("Bearer ", "").trim();

  // Create a user-scoped client to confirm the JWT is valid and get the user ID
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${userJwt}` } } }
  );
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use service role for the actual deletions
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const userId = user.id;
  const userEmail = user.email || "";

  // Delete in dependency order
  const steps = [
    () => supabase.from("suppressed_emails").delete().eq("email", userEmail),
    () => supabase.from("subscribers").delete().eq("email", userEmail),
    () => supabase.from("profiles").delete().eq("id", userId),
  ];

  for (const step of steps) {
    const { error } = await step();
    if (error) {
      console.error("delete-account step error:", error.message);
      // Non-fatal — continue trying to delete remaining data
    }
  }

  // Finally delete the auth user (service role admin endpoint)
  const adminRes = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users/${userId}`,
    {
      method: "DELETE",
      headers: {
        "apikey": Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        "Authorization": `Bearer ${Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!adminRes.ok) {
    const body = await adminRes.text();
    console.error("delete-account auth delete failed:", adminRes.status, body);
    return new Response(JSON.stringify({ error: "Failed to delete auth user" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`delete-account: deleted user ${userId} (${userEmail})`);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
