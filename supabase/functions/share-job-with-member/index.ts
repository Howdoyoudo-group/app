import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ShareJobRequest {
  jobId: string;
  jobTitle: string;
  company: string;
  recipientUserId: string;
  senderUserId: string;
  shareLink: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body: ShareJobRequest = await req.json();
    const { jobId, jobTitle, company, recipientUserId, senderUserId, shareLink } = body;

    if (!jobId || !recipientUserId || !senderUserId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get sender info
    const { data: senderData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", senderUserId)
      .single();

    const senderName = senderData?.full_name || "A How Do You Do user";

    const { data: shareData, error: shareError } = await supabase
      .from("job_shares")
      .insert({
        job_id: jobId,
        shared_by: senderUserId,
        shared_with: recipientUserId,
        job_title: jobTitle,
        company: company,
        share_link: shareLink,
      })
      .select()
      .single();

    if (shareError) {
      console.error("Failed to record share:", shareError);
      return new Response(
        JSON.stringify({ error: shareError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Job shared by ${senderName} successfully`,
        shareId: shareData?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
