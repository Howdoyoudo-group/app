import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildTargetRolesContext } from "../_shared/coach-context.ts";

const VOICE_PERSONA = `You are "Howdy", a warm UK careers coach speaking out loud with a young person exploring their career. British English, concise - this is a spoken conversation, not a chat, so keep replies short and natural, no markdown, no links, no headings. Be encouraging but honest: don't say "that's great, keep going" if their readiness is genuinely low. If they ask about their gaps or plan, use the real facts below rather than asking them to repeat information already on their profile. If more than one target role is listed, always say which role you mean before giving a number.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DAILY_MINUTE_CAP = 10;

async function mintConversationToken(apiKey: string, agentId: string) {
  return fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
    { headers: { "xi-api-key": apiKey } },
  );
}

async function mintSignedUrl(apiKey: string, agentId: string) {
  return fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
    { headers: { "xi-api-key": apiKey } },
  );
}

async function findFirstAgentId(apiKey: string) {
  const res = await fetch("https://api.elevenlabs.io/v1/convai/agents?page_size=20", {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.agents?.[0]?.agent_id ?? data?.items?.[0]?.id ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Sign in to use voice mode" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const ELEVENLABS_API_KEY =
      Deno.env.get("ELEVENLABS_API_KEY") ?? Deno.env.get("ELEVENLABS_API_KEY_1");
    const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID");

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
      return new Response(
        JSON.stringify({ error: "Voice agent not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const svcClient = createClient(
      SUPABASE_URL,
      Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sign in to use voice mode" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Premium gate — voice mode is for premium subscribers + admins only.
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isPremium = (roles ?? []).some(
      (r: any) => r.role === "premium" || r.role === "admin",
    );
    if (!isPremium) {
      return new Response(
        JSON.stringify({
          error: "Voice mode is a premium feature. Upgrade to chat with Howdy by voice.",
          code: "premium_required",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Daily minute cap — count voice sessions started in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: usage } = await supabase
      .from("ai_usage_log")
      .select("metadata")
      .eq("user_id", user.id)
      .eq("feature", "howdy_voice")
      .gte("created_at", since);

    const usedSeconds = (usage ?? []).reduce(
      (sum: number, row: any) =>
        sum + (Number(row?.metadata?.duration_seconds) || 0),
      0,
    );
    const usedMinutes = usedSeconds / 60;

    if (usedMinutes >= DAILY_MINUTE_CAP) {
      return new Response(
        JSON.stringify({
          error:
            `You've reached today's voice limit (${DAILY_MINUTE_CAP} min). Try again tomorrow or keep chatting in text.`,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Build the same live coaching context the text chat uses, so voice
    // stops being a disconnected, contextless conversation. Persisted first
    // name + target-role names give a personalised opener too.
    const [{ data: profile }, targetRolesContext] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      buildTargetRolesContext(svcClient, user.id),
    ]);
    const firstName = (profile?.full_name as string | undefined)?.trim().split(/\s+/)[0] || null;
    const { data: targetRows } = await supabase
      .from("user_target_roles")
      .select("role_slug")
      .eq("user_id", user.id)
      .order("set_at", { ascending: false });
    const roleCount = (targetRows ?? []).length;

    const promptOverride = targetRolesContext ? `${VOICE_PERSONA}\n${targetRolesContext}` : null;
    const firstMessage = roleCount > 0
      ? `Hey${firstName ? " " + firstName : ""} - I can see where you're at on your target role${roleCount > 1 ? "s" : ""}. Want to talk through that, or something else?`
      : `Hey${firstName ? " " + firstName : ""}! I'm Howdy. What can I help you figure out today?`;

    // Mint a WebRTC conversation token. If the configured agent belongs to an old
    // ElevenLabs account, fall back to the first agent on the connected account.
    let tokRes = await mintConversationToken(ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID);

    if (!tokRes.ok) {
      const t = await tokRes.clone().text();
      if (t.includes("invalid_agent_id") || t.includes("agent_not_found")) {
        const fallbackAgentId = await findFirstAgentId(ELEVENLABS_API_KEY);
        if (fallbackAgentId && fallbackAgentId !== ELEVENLABS_AGENT_ID) {
          tokRes = await mintConversationToken(ELEVENLABS_API_KEY, fallbackAgentId);
        }
      }
    }

    if (!tokRes.ok) {
      const t = await tokRes.text();
      console.error("ElevenLabs token error", tokRes.status, t);
      return new Response(JSON.stringify({ error: "Voice agent unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { token } = await tokRes.json();

    // Also mint a signed WebSocket URL as a fallback transport (WebRTC validate
    // path is currently 404 for this account, so client prefers WebSocket).
    let signedUrl: string | null = null;
    let agentForUrl = ELEVENLABS_AGENT_ID;
    let urlRes = await mintSignedUrl(ELEVENLABS_API_KEY, agentForUrl);
    if (!urlRes.ok) {
      const fb = await findFirstAgentId(ELEVENLABS_API_KEY);
      if (fb) {
        agentForUrl = fb;
        urlRes = await mintSignedUrl(ELEVENLABS_API_KEY, fb);
      }
    }
    if (urlRes.ok) {
      const j = await urlRes.json();
      signedUrl = j?.signed_url ?? null;
    }

    // Log session start (0 duration; client patches duration on end)
    await supabase.from("ai_usage_log").insert({
      user_id: user.id,
      feature: "howdy_voice",
      metadata: { duration_seconds: 0, event: "session_start" },
    });

    return new Response(
      JSON.stringify({
        token,
        signed_url: signedUrl,
        remaining_minutes: Math.max(0, DAILY_MINUTE_CAP - usedMinutes),
        prompt_override: promptOverride,
        first_message: firstMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("howdy-voice-token error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
