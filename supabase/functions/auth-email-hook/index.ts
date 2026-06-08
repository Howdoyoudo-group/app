import { sendViaResend } from '../_shared/send-via-resend.ts'

const SITE_NAME = "Howdoyoudo"
const FROM_EMAIL = "hello@notify.howdoyoudo.group"
const SITE_URL = "https://www.howdoyoudo.co.uk"
const SUPABASE_URL = "https://wgistckxxbfpsuulbswr.supabase.co"

// Branded email template — consistent with main transactional emails
function brandedEmail({ title, body, ctaText, ctaUrl, footer }: {
  title: string; body: string; ctaText: string; ctaUrl: string; footer?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Trebuchet MS','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;"><tr><td align="center" style="padding:32px 16px 40px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:2px solid #1a1a1a;">
  <!-- Header -->
  <tr><td style="background:#1a1a1a;padding:0;">
    <img src="https://www.howdoyoudo.co.uk/assets/email-header-dark-cropped.jpg" alt="Howdoyoudo" width="600" style="display:block;width:100%;max-width:600px;border:0;" />
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:36px 36px 0 36px;">
    <h1 style="margin:0 0 20px 0;font-size:26px;font-weight:800;color:#1a1a1a;line-height:1.1;font-family:'Arial Black',Impact,'Helvetica Neue',Arial,sans-serif;">${title}</h1>
    ${body}
    <p style="margin:0 0 32px 0;">
      <a href="${ctaUrl}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:14px 28px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${ctaText}</a>
    </p>
    ${footer ? `<p style="margin:0 0 8px 0;font-size:13px;color:#999;line-height:1.6;">${footer}</p>` : ''}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:24px 36px;background:#1a1a1a;border-top:2px solid #10b981;margin-top:32px;">
    <p style="margin:0 0 4px 0;font-size:13px;color:#ffffff;font-weight:700;font-family:'Arial Black',Impact,Arial,sans-serif;">howdoyoudo<span style="color:#10b981;">?</span></p>
    <p style="margin:0;font-size:12px;color:#999;"><a href="${SITE_URL}" style="color:#10b981;text-decoration:none;">www.howdoyoudo.co.uk</a></p>
  </td></tr>
</table></td></tr></table></body></html>`
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const body = await req.text()
    console.log('Auth hook raw body:', body)
    console.log('Auth hook headers:', JSON.stringify(Object.fromEntries(req.headers)))

    let payload: any
    try { payload = JSON.parse(body) } catch(e) {
      console.error('Failed to parse body:', e)
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Supabase auth hook payload structure:
    // { user: {...}, email_data: { email_action_type, token, token_hash, redirect_to, site_url, ... } }
    const user = payload?.user
    const emailData = payload?.email_data ?? {}
    const type = emailData?.email_action_type ?? payload?.type

    if (!user?.email) {
      console.error('No email in payload')
      return new Response(JSON.stringify({ error: 'No email in payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const email = user.email
    const tokenHash = emailData?.token_hash ?? emailData?.token ?? ''
    const siteUrl = emailData?.site_url ?? SITE_URL

    console.log('Auth hook type:', type, '| tokenHash present:', !!tokenHash, '| emailDataKeys:', Object.keys(emailData))

    let subject = ''
    let html = ''

    if (type === 'recovery') {
      const resetUrl = `${SITE_URL}/reset-password?token_hash=${tokenHash}&type=recovery`
      subject = 'Reset your password — Howdoyoudo'
      html = brandedEmail({
        title: 'Reset your password.',
        body: `<p style="margin:0 0 24px 0;font-size:15px;color:#333;line-height:1.7;">We received a request to reset your Howdoyoudo password. Click below — this link expires in 1 hour.</p>`,
        ctaText: 'Reset my password',
        ctaUrl: resetUrl,
        footer: "Didn't request this? You can safely ignore this email — your password won't change.",
      })
    } else if (type === 'signup') {
      const confirmUrl = `${SITE_URL}/auth?token_hash=${tokenHash}&type=signup`
      subject = 'Confirm your email — Howdoyoudo'
      html = brandedEmail({
        title: 'Welcome to Howdoyoudo.',
        body: `<p style="margin:0 0 16px 0;font-size:15px;color:#333;line-height:1.7;">Thanks for joining. We help people discover industries they'll love — not just find a job.</p>
<p style="margin:0 0 24px 0;font-size:15px;color:#333;line-height:1.7;">Confirm your email address to get started:</p>`,
        ctaText: 'Confirm my email',
        ctaUrl: confirmUrl,
        footer: "If you didn't create an account, you can safely ignore this.",
      })
    } else if (type === 'magiclink') {
      const magicUrl = `${SITE_URL}/auth?token_hash=${tokenHash}&type=magiclink`
      subject = 'Your sign-in link — Howdoyoudo'
      html = brandedEmail({
        title: 'Here\'s your sign-in link.',
        body: `<p style="margin:0 0 24px 0;font-size:15px;color:#333;line-height:1.7;">Click below to sign in to your Howdoyoudo account. This link expires in 1 hour.</p>`,
        ctaText: 'Sign in',
        ctaUrl: magicUrl,
        footer: "If you didn't request this link, you can safely ignore this email.",
      })
    } else if (type === 'invite') {
      const inviteUrl = `${SITE_URL}/auth?token_hash=${tokenHash}&type=invite`
      subject = "You've been invited — Howdoyoudo"
      html = brandedEmail({
        title: "You've been invited.",
        body: `<p style="margin:0 0 24px 0;font-size:15px;color:#333;line-height:1.7;">You've been invited to join Howdoyoudo. Click below to accept and set up your account.</p>`,
        ctaText: 'Accept invite',
        ctaUrl: inviteUrl,
        footer: '',
      })
    } else {
      // Unknown type — return success so Supabase uses default
      console.log('Unknown hook type:', type)
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const result = await sendViaResend({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject,
      html,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Email sent:', result.id)
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('auth-email-hook error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
