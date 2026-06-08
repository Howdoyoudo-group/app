import { sendViaResend } from '../_shared/send-via-resend.ts'
import { brandedEmail } from '../_shared/email-brand.ts'

const SITE_NAME = "Howdoyoudo"
const FROM_EMAIL = "hello@notify.howdoyoudo.group"
const SITE_URL = "https://www.howdoyoudo.co.uk"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const body = await req.text()
    console.log('Auth hook raw body:', body)

    let payload: any
    try { payload = JSON.parse(body) } catch(e) {
      console.error('Failed to parse body:', e)
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Supabase auth hook payload:
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
        footerNote: "Didn't request this? You can safely ignore this email — your password won't change.",
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
        footerNote: "If you didn't create an account, you can safely ignore this.",
      })
    } else if (type === 'magiclink') {
      const magicUrl = `${SITE_URL}/auth?token_hash=${tokenHash}&type=magiclink`
      subject = 'Your sign-in link — Howdoyoudo'
      html = brandedEmail({
        title: "Here's your sign-in link.",
        body: `<p style="margin:0 0 24px 0;font-size:15px;color:#333;line-height:1.7;">Click below to sign in to your Howdoyoudo account. This link expires in 1 hour.</p>`,
        ctaText: 'Sign in',
        ctaUrl: magicUrl,
        footerNote: "If you didn't request this link, you can safely ignore this email.",
      })
    } else if (type === 'invite') {
      const inviteUrl = `${SITE_URL}/auth?token_hash=${tokenHash}&type=invite`
      subject = "You've been invited — Howdoyoudo"
      html = brandedEmail({
        title: "You've been invited.",
        body: `<p style="margin:0 0 24px 0;font-size:15px;color:#333;line-height:1.7;">You've been invited to join Howdoyoudo. Click below to accept and set up your account.</p>`,
        ctaText: 'Accept invite',
        ctaUrl: inviteUrl,
      })
    } else {
      // Unknown type — log and return success so Supabase doesn't retry
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
