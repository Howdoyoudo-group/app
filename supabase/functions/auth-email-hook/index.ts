import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your login link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

const SITE_NAME = "How do you do?"
const FROM_LOCAL_PART = "hello"
const SENDER_DOMAIN = "notify.howdoyoudo.group"
const ROOT_DOMAIN = "howdoyoudo.group"
const FROM_DOMAIN = "howdoyoudo.group"

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Supabase sends auth hook payloads as JSON POST
    const payload = await req.json()

    // payload shape from Supabase auth hooks:
    // { type: "signup"|"magiclink"|"recovery"|"invite"|"email_change"|"reauthentication", user: {...}, email_data: { token, token_hash, redirect_to, ... } }
    const emailType = payload.type
    const user = payload.user
    const emailData = payload.email_data ?? {}

    if (!emailType || !user?.email) {
      return new Response(JSON.stringify({ error: 'Invalid hook payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const EmailTemplate = EMAIL_TEMPLATES[emailType]
    if (!EmailTemplate) {
      // Unknown type — return success so Supabase falls back to default
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const confirmationUrl = emailData.redirect_to
      ? `${emailData.redirect_to}?token_hash=${emailData.token_hash}&type=${emailType}`
      : `https://${ROOT_DOMAIN}`

    const templateProps = {
      siteName: SITE_NAME,
      siteUrl: `https://${ROOT_DOMAIN}`,
      recipient: user.email,
      confirmationUrl,
      token: emailData.token,
      email: user.email,
      newEmail: user.new_email,
    }

    const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
    const text = await renderAsync(React.createElement(EmailTemplate, templateProps), { plainText: true })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const messageId = crypto.randomUUID()

    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: emailType,
      recipient_email: user.email,
      status: 'pending',
    })

    await supabase.rpc('enqueue_email', {
      queue_name: 'auth_emails',
      payload: {
        message_id: messageId,
        to: user.email,
        from: `${SITE_NAME} <${FROM_LOCAL_PART}@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: EMAIL_SUBJECTS[emailType] || 'Notification',
        html,
        text,
        purpose: 'transactional',
        label: emailType,
        queued_at: new Date().toISOString(),
      },
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('auth-email-hook error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
