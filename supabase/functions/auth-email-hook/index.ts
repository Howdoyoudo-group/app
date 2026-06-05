import { sendViaResend } from '../_shared/send-via-resend.ts'

const SITE_NAME = "How do you do?"
const FROM_EMAIL = "hello@notify.howdoyoudo.group"
const SITE_URL = "https://dist-kappa-ten-23.vercel.app"
const SUPABASE_URL = "https://wgistckxxbfpsuulbswr.supabase.co"

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

    // Temporary debug — remove after confirming token_hash field
    if (!tokenHash) {
      return new Response(JSON.stringify({ debug: true, emailDataKeys: Object.keys(emailData), emailData }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let subject = ''
    let html = ''

    if (type === 'recovery') {
      const resetUrl = `${SITE_URL}/reset-password?token_hash=${tokenHash}&type=recovery`
      subject = 'Reset your password — How do you do?'
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <h1 style="color:#1a1a1a;font-size:24px;">Reset your password</h1>
          <p style="color:#444;font-size:16px;">Hi there,</p>
          <p style="color:#444;font-size:16px;">We received a request to reset your password for your How do you do? account.</p>
          <p style="margin:32px 0;">
            <a href="${resetUrl}" style="background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">Reset password</a>
          </p>
          <p style="color:#888;font-size:14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          <p style="color:#888;font-size:14px;">— The Howdy team</p>
        </div>
      `
    } else if (type === 'signup') {
      const confirmUrl = `${SITE_URL}/auth?token_hash=${tokenHash}&type=signup`
      subject = 'Confirm your email — How do you do?'
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <h1 style="color:#1a1a1a;font-size:24px;">Welcome to How do you do?</h1>
          <p style="color:#444;font-size:16px;">Hi there,</p>
          <p style="color:#444;font-size:16px;">Thanks for signing up! Please confirm your email address to get started.</p>
          <p style="margin:32px 0;">
            <a href="${confirmUrl}" style="background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">Confirm email</a>
          </p>
          <p style="color:#888;font-size:14px;">If you didn't create an account, you can safely ignore this email.</p>
          <p style="color:#888;font-size:14px;">— The Howdy team</p>
        </div>
      `
    } else if (type === 'magiclink') {
      const magicUrl = `${SITE_URL}/auth?token_hash=${tokenHash}&type=magiclink`
      subject = 'Your login link — How do you do?'
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <h1 style="color:#1a1a1a;font-size:24px;">Your magic link</h1>
          <p style="color:#444;font-size:16px;">Click below to sign in to your How do you do? account.</p>
          <p style="margin:32px 0;">
            <a href="${magicUrl}" style="background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">Sign in</a>
          </p>
          <p style="color:#888;font-size:14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          <p style="color:#888;font-size:14px;">— The Howdy team</p>
        </div>
      `
    } else if (type === 'invite') {
      const inviteUrl = `${SITE_URL}/auth?token_hash=${tokenHash}&type=invite`
      subject = "You've been invited — How do you do?"
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <h1 style="color:#1a1a1a;font-size:24px;">You've been invited</h1>
          <p style="color:#444;font-size:16px;">You've been invited to join How do you do?. Click below to accept.</p>
          <p style="margin:32px 0;">
            <a href="${inviteUrl}" style="background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">Accept invite</a>
          </p>
          <p style="color:#888;font-size:14px;">— The Howdy team</p>
        </div>
      `
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
