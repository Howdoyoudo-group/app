// Shared helper: send transactional email via Resend instead of Lovable queue.
// Accepts the same payload shape used by enqueue_email (from, to, subject, html, text).

interface ResendPayload {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  reply_to?: string | string[];
}

interface QueuePayload {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
  [key: string]: any;
}

export async function sendViaResend(payload: QueuePayload): Promise<{ id?: string; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return { error: "RESEND_API_KEY not configured" };

  const body: ResendPayload = {
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  };
  if (payload.text) body.text = payload.text;
  if (payload.reply_to) body.reply_to = payload.reply_to;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Resend send failed", res.status, data);
      return { error: data?.message || `Resend HTTP ${res.status}` };
    }
    return { id: data?.id };
  } catch (err) {
    console.error("Resend fetch error", err);
    return { error: String(err) };
  }
}
