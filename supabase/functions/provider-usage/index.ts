// Admin-only: pulls live usage/balance from each AI/data provider where the
// provider exposes a public usage endpoint. Providers that don't expose one
// (Perplexity, Adzuna, Lovable AI Gateway) are returned with note=null and
// a friendly message.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProviderResult {
  provider: string;
  status: 'ok' | 'no_api' | 'error' | 'no_key';
  // Free-form metrics keyed by label -> displayable string
  metrics?: Record<string, string | number>;
  message?: string;
  docs?: string;
}

async function checkSerpapi(key: string | undefined): Promise<ProviderResult> {
  if (!key) return { provider: 'SerpAPI', status: 'no_key' };
  try {
    const r = await fetch(`https://serpapi.com/account?api_key=${encodeURIComponent(key)}`);
    if (!r.ok) return { provider: 'SerpAPI', status: 'error', message: `HTTP ${r.status}` };
    const d = await r.json();
    return {
      provider: 'SerpAPI',
      status: 'ok',
      metrics: {
        'Plan': d.plan_name ?? 'free',
        'Searches used (this month)': d.this_month_usage ?? 0,
        'Searches left': d.plan_searches_left ?? 0,
        'Hourly used': d.this_hour_searches ?? 0,
      },
    };
  } catch (e) {
    return { provider: 'SerpAPI', status: 'error', message: (e as Error).message };
  }
}

async function checkFirecrawl(key: string | undefined): Promise<ProviderResult> {
  if (!key) return { provider: 'Firecrawl', status: 'no_key' };
  try {
    const r = await fetch('https://api.firecrawl.dev/v1/team/credit-usage', {
      headers: { 'Authorization': `Bearer ${key}` },
    });
    if (!r.ok) return { provider: 'Firecrawl', status: 'error', message: `HTTP ${r.status}` };
    const d = await r.json();
    const remaining = d?.data?.remaining_credits ?? d?.remaining_credits ?? null;
    const planCredits = d?.data?.plan_credits ?? d?.plan_credits ?? null;
    return {
      provider: 'Firecrawl',
      status: 'ok',
      metrics: {
        'Credits remaining': remaining ?? 'unknown',
        'Plan credits': planCredits ?? 'unknown',
      },
    };
  } catch (e) {
    return { provider: 'Firecrawl', status: 'error', message: (e as Error).message };
  }
}

async function checkElevenLabs(key: string | undefined): Promise<ProviderResult> {
  if (!key) return { provider: 'ElevenLabs', status: 'no_key' };
  try {
    const r = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: { 'xi-api-key': key },
    });
    if (!r.ok) return { provider: 'ElevenLabs', status: 'error', message: `HTTP ${r.status}` };
    const d = await r.json();
    return {
      provider: 'ElevenLabs',
      status: 'ok',
      metrics: {
        'Tier': d.tier ?? 'unknown',
        'Characters used': d.character_count ?? 0,
        'Character limit': d.character_limit ?? 0,
        'Resets': d.next_character_count_reset_unix
          ? new Date(d.next_character_count_reset_unix * 1000).toLocaleDateString('en-GB')
          : 'n/a',
      },
    };
  } catch (e) {
    return { provider: 'ElevenLabs', status: 'error', message: (e as Error).message };
  }
}

async function checkRapidApi(key: string | undefined): Promise<ProviderResult> {
  if (!key) return { provider: 'JSearch (RapidAPI)', status: 'no_key' };
  // RapidAPI returns quota in response headers - we hit a tiny endpoint to read them
  try {
    const r = await fetch('https://jsearch.p.rapidapi.com/search?query=test&num_pages=1', {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });
    const limit = r.headers.get('x-ratelimit-requests-limit');
    const remaining = r.headers.get('x-ratelimit-requests-remaining');
    const reset = r.headers.get('x-ratelimit-requests-reset');
    return {
      provider: 'JSearch (RapidAPI)',
      status: 'ok',
      metrics: {
        'Monthly limit': limit ?? 'unknown',
        'Remaining': remaining ?? 'unknown',
        'Resets in (s)': reset ?? 'unknown',
      },
    };
  } catch (e) {
    return { provider: 'JSearch (RapidAPI)', status: 'error', message: (e as Error).message };
  }
}

async function checkAdzuna(appId: string | undefined, appKey: string | undefined): Promise<ProviderResult> {
  if (!appId || !appKey) return { provider: 'Adzuna', status: 'no_key' };
  // Adzuna has no usage endpoint - we just confirm the key works.
  try {
    const r = await fetch(`https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=1&what=test`);
    if (r.ok) {
      return {
        provider: 'Adzuna',
        status: 'no_api',
        message: 'Key valid. Adzuna does not expose usage stats - free tier is ~1k calls/month per app.',
      };
    }
    return { provider: 'Adzuna', status: 'error', message: `HTTP ${r.status}` };
  } catch (e) {
    return { provider: 'Adzuna', status: 'error', message: (e as Error).message };
  }
}

function noApi(provider: string, message: string, docs?: string): ProviderResult {
  return { provider, status: 'no_api', message, docs };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Auth check - admins only
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: isAdminRow } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdminRow) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = await Promise.all([
      checkSerpapi(Deno.env.get('SERPAPI_KEY')),
      checkFirecrawl(Deno.env.get('FIRECRAWL_API_KEY')),
      checkElevenLabs(Deno.env.get('ELEVENLABS_API_KEY_1')),
      checkRapidApi(Deno.env.get('RAPIDAPI_KEY')),
      checkAdzuna(Deno.env.get('ADZUNA_APP_ID'), Deno.env.get('ADZUNA_APP_KEY')),
      Promise.resolve(noApi(
        'Perplexity',
        'No public usage API. Check spend at perplexity.ai/settings/api.',
        'https://www.perplexity.ai/settings/api',
      )),
      Promise.resolve(noApi(
        'Lovable AI Gateway (Gemini)',
        'Workspace credits. View at Lovable workspace settings.',
      )),
      Promise.resolve(noApi(
        'Reed',
        'No public usage API. Free tier - usually unlimited reasonable use.',
      )),
      Promise.resolve(noApi(
        'Jooble',
        'No public usage API.',
      )),
      Promise.resolve(noApi(
        'Resend',
        'Check sends at resend.com/emails.',
      )),
    ]);

    return new Response(JSON.stringify({ providers: results, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
