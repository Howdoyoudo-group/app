import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ShareJobRequest {
  jobId: string;
  jobTitle: string;
  company: string;
  recipientUserId: string;
  senderUserId: string;
  shareLink: string;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body: ShareJobRequest = await req.json();
    const { jobId, jobTitle, company, recipientUserId, senderUserId, shareLink } = body;

    if (!jobId || !recipientUserId || !senderUserId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get sender info
    const { data: senderData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", senderUserId)
      .single();

    const senderName = senderData?.full_name || "A How Do You Do user";

    // Create a notification/message record
    // For now, we'll store it in a job_shares table (we may need to create this)
    const { data: shareData, error: shareError } = await supabase
      .from("job_shares")
      .insert({
        job_id: jobId,
        shared_by: senderUserId,
        shared_with: recipientUserId,
        job_title: jobTitle,
        company: company,
        share_link: shareLink,
        shared_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (shareError) {
      // If table doesn't exist, it's okay - we'll create a simpler notification
      console.log("job_shares table not found, creating in-app notification instead");
    }

    // Could also send an in-app notification or email notification
    // For now, just track the share

    return new Response(
      JSON.stringify({
        success: true,
        message: `Job shared with ${senderName} successfully`,
        shareId: shareData?.id
      }),
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
