import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type TranscriptTurn = { role: "user" | "assistant"; content: string };

// Phase 5 of the Howdy improvement plan (see
// /Users/andrewharrison/.claude/plans/zany-rolling-dahl.md): a voice call was
// previously invisible to text-Howdy and vice versa - nothing from a spoken
// conversation ever reached howdy_messages/howdy_memory, so switching
// modality reset the relationship to zero. The client (HowdyVoiceButton)
// already receives every turn live via ElevenLabs' onMessage callback; it
// now buffers that transcript and sends it here on session end so it can be
// persisted the same way a text turn is.
function sanitizeTranscript(raw: unknown): TranscriptTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (t): t is TranscriptTurn =>
        t &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string" &&
        t.content.trim().length > 0,
    )
    .map((t) => ({ role: t.role, content: t.content.trim().slice(0, 2000) }))
    .slice(0, 200);
}

async function extractVoiceMemory(
  svcClient: ReturnType<typeof createClient>,
  userId: string,
  transcript: TranscriptTurn[],
) {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) return;

  const transcriptText = transcript
    .map((t) => `${t.role === "user" ? "User" : "Howdy"}: ${t.content}`)
    .join("\n");

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                'Read this transcript of a spoken careers-coaching call. If it contains a genuinely new, durable fact about the person (a role they want, an industry, a location, a constraint, a skill, a dislike), reply with ONLY one line in this exact format: MEMORY:: fact one || fact two - each fact under 12 words, third-person (e.g. "Wants producer roles in Manchester"). If there is nothing new and durable worth remembering, reply with exactly: NONE',
            },
            { role: "user", content: transcriptText },
          ],
        }),
      },
    );
    if (!res.ok) return;
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content || "";
    const memMatch = text.match(/MEMORY::\s*(.+)$/im);
    if (!memMatch) return;

    const newFacts = memMatch[1]
      .split("||")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 2 && s.length < 200);
    if (!newFacts.length) return;

    const { data: prof } = await svcClient
      .from("profiles")
      .select("howdy_memory")
      .eq("id", userId)
      .maybeSingle();
    const existing: string[] = (prof as any)?.howdy_memory ?? [];
    const lower = new Set(existing.map((s) => s.toLowerCase()));
    const merged = [...existing];
    for (const f of newFacts) if (!lower.has(f.toLowerCase())) merged.push(f);
    await svcClient.from("profiles").update({ howdy_memory: merged.slice(-80) }).eq("id", userId);
  } catch (e) {
    console.error("howdy-voice-log memory extraction error:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const duration = Math.max(0, Math.min(3600, Number(body?.duration_seconds) || 0));
    const transcript = sanitizeTranscript(body?.transcript);

    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const work = (async () => {
      await supabase.from("ai_usage_log").insert({
        user_id: user.id,
        feature: "howdy_voice",
        metadata: { duration_seconds: duration, event: "session_end" },
      });

      if (!transcript.length) return;

      await svcClient.from("howdy_messages").insert(
        transcript.map((t) => ({
          user_id: user.id,
          role: t.role,
          content: t.content,
          mode: "candidate",
        })),
      );

      await extractVoiceMemory(svcClient, user.id, transcript);
    })();

    if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
      (EdgeRuntime as any).waitUntil(work);
    } else {
      await work;
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("howdy-voice-log error:", e);
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
