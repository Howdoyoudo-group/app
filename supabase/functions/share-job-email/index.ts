import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendViaResend } from "../_shared/send-via-resend.ts";

interface ShareJobEmailRequest {
  jobId: string;
  jobTitle: string;
  company: string;
  shareLink: string;
  email: string;
  senderName?: string;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body: ShareJobEmailRequest = await req.json();
    const { jobId, jobTitle, company, shareLink, email, senderName = "A How Do You Do user" } = body;

    if (!email || !jobTitle || !shareLink) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00ff00 0%, #ccff00 100%); padding: 32px; text-align: center;">
          <h1 style="color: #000; margin: 0; font-size: 24px; font-weight: 900;">How Do You Do?</h1>
        </div>

        <div style="padding: 32px; border: 1px solid #e5e5e5;">
          <p style="margin-top: 0; font-size: 16px;">Hi there,</p>

          <p style="font-size: 16px; line-height: 1.6;">
            ${senderName} found a job on <strong>How Do You Do?</strong> and thought you might be interested:
          </p>

          <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #00ff00; margin: 24px 0;">
            <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #000;">${jobTitle}</h2>
            <p style="margin: 0; font-size: 14px; color: #666;">${company}</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${shareLink}" style="background: #00ff00; color: #000; padding: 12px 32px; text-decoration: none; font-weight: 700; border-radius: 4px; display: inline-block; font-size: 16px;">
              View Job on How Do You Do
            </a>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 0;">
            Explore 30+ industries, 100k+ jobs, and discover roles you never knew existed.<br>
            <a href="https://www.howdoyoudo.co.uk" style="color: #00ff00; text-decoration: none;">Visit How Do You Do</a>
          </p>
        </div>

        <div style="padding: 16px; text-align: center; background: #f9f9f9; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999;">
          <p style="margin: 0;">This email was sent because someone shared a job with you.<br>Questions? Visit our <a href="https://www.howdoyoudo.co.uk" style="color: #00ff00; text-decoration: none;">help center</a></p>
        </div>
      </div>
    `;

    const result = await sendViaResend({
      from: "jobs@notify.howdoyoudo.group",
      to: email,
      subject: `${senderName} shared "${jobTitle}" at ${company}`,
      html,
      reply_to: "support@howdoyoudo.co.uk",
    });

    if (result.error) {
      console.error("Email send failed:", result.error);
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
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
