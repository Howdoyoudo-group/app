import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const employerUserId = claims.claims.sub as string;

    let body: { candidateUserId?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const candidateUserId = body.candidateUserId?.trim();
    if (!candidateUserId || !/^[0-9a-f-]{36}$/i.test(candidateUserId)) {
      return new Response(JSON.stringify({ error: "Valid candidateUserId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Authorisation: caller must be admin OR an employer with a contact_request
    // for this candidate where details_shared = true.
    const { data: adminCheck } = await svcClient
      .from("user_roles")
      .select("role")
      .eq("user_id", employerUserId)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!adminCheck;

    if (!isAdmin) {
      const { data: cr, error: crError } = await svcClient
        .from("contact_requests")
        .select("id, details_shared")
        .eq("employer_user_id", employerUserId)
        .eq("candidate_user_id", candidateUserId)
        .eq("details_shared", true)
        .limit(1)
        .maybeSingle();

      if (crError || !cr) {
        return new Response(
          JSON.stringify({ error: "Candidate has not shared their CV with you." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Fetch candidate's stored CV path from understand_me_results._inputData
    const { data: profile, error: profError } = await svcClient
      .from("profiles")
      .select("understand_me_results, full_name")
      .eq("id", candidateUserId)
      .maybeSingle();

    if (profError || !profile) {
      return new Response(JSON.stringify({ error: "Candidate profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const um = (profile.understand_me_results || {}) as Record<string, unknown>;
    const inputData = (um._inputData || {}) as Record<string, unknown>;
    const cvFilePath = typeof inputData.cvFilePath === "string" ? inputData.cvFilePath : null;
    const cvFileName = typeof inputData.cvFileName === "string" ? inputData.cvFileName : null;

    if (!cvFilePath) {
      return new Response(
        JSON.stringify({ error: "This candidate did not upload a CV file." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const safeName = (cvFileName || cvFilePath.split("/").pop() || "cv").replace(/[^a-zA-Z0-9._-]/g, "_");

    const { data: signed, error: signError } = await svcClient.storage
      .from("cv-uploads")
      .createSignedUrl(cvFilePath, 60, { download: safeName });

    if (signError || !signed?.signedUrl) {
      console.error("createSignedUrl failed", signError);
      return new Response(
        JSON.stringify({ error: "Could not generate download link. The file may have been removed." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: signed.signedUrl,
        fileName: safeName,
        candidateName: profile.full_name ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("get-candidate-cv error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
