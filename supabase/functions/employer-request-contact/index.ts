import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Detect admin - admins can act on behalf of any company
    const { data: roleRows } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isAdmin = (roleRows ?? []).some((r) => r.role === "admin");

    const { candidateUserId, message, companyId: bodyCompanyId } = await req.json();
    if (!candidateUserId) {
      return new Response(JSON.stringify({ error: "candidateUserId required" }), { status: 400, headers: corsHeaders });
    }

    // Resolve which company this contact is on behalf of
    let companyId: string | null = null;
    let companyName = "An employer";

    if (isAdmin) {
      const targetCompanyId = bodyCompanyId ?? null;
      if (!targetCompanyId) {
        return new Response(JSON.stringify({ error: "companyId required for admin" }), { status: 400, headers: corsHeaders });
      }
      const { data: companyRow } = await admin
        .from("employer_companies")
        .select("id, name")
        .eq("id", targetCompanyId)
        .maybeSingle();
      if (!companyRow) {
        return new Response(JSON.stringify({ error: "Company not found" }), { status: 404, headers: corsHeaders });
      }
      companyId = companyRow.id;
      companyName = companyRow.name;
    } else {
      const { data: empRow } = await admin
        .from("employer_users")
        .select("company_id, employer_companies(name)")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!empRow) {
        return new Response(JSON.stringify({ error: "Employer access required" }), { status: 403, headers: corsHeaders });
      }
      companyId = empRow.company_id;
      companyName = (empRow.employer_companies as any)?.name ?? companyName;
    }

    // Soft throttle - allow up to 2 contacts per company per candidate per 7 days.
    const { data: recentList } = await admin
      .from("contact_requests")
      .select("id")
      .eq("company_id", companyId)
      .eq("candidate_user_id", candidateUserId)
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
    if ((recentList ?? []).length >= 2) {
      return new Response(JSON.stringify({ ok: false, error: `${companyName} has already reached out twice to this candidate this week.` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertErr } = await admin.from("contact_requests").insert({
      candidate_user_id: candidateUserId,
      employer_user_id: user.id,
      company_id: companyId,
      message: message ?? null,
    });

    if (insertErr) {
      console.error("contact_requests insert", insertErr);
      return new Response(JSON.stringify({ error: insertErr.message }), { status: 500, headers: corsHeaders });
    }

    // Try to email the candidate (best effort)
    try {
      const { data: candidateAuth } = await admin.auth.admin.getUserById(candidateUserId);
      const email = candidateAuth?.user?.email;
      // companyName already resolved above

      // Look up candidate's name from profile
      const { data: candidateProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", candidateUserId)
        .maybeSingle();
      const fullName = (candidateProfile?.full_name ?? "").trim();
      const firstName = fullName ? fullName.split(/\s+/)[0] : "";
      const greetingName = firstName || "there";

      if (email) {
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (resendKey) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "How do you do? <hello@notify.howdoyoudo.group>",
              to: [email],
              subject: `${companyName} have their eye on you`,
              html: `<p>Hello ${greetingName}, How do you do?</p>
<p>You have caught the eye of <strong>${companyName}</strong> and they would like to chat with you about an opportunity.</p>
<p>Head to your <a href="https://howdoyoudo.group/my-jobs">Jobs Inbox</a> to see the request and reply.</p>
<p>- The How do you do? team</p>`,
            }),
          });
        }
      }
    } catch (emailErr) {
      console.error("Email send failed (non-fatal)", emailErr);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("employer-request-contact error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
