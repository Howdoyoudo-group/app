import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Segment {
  speaker: "M" | "F";
  text: string;
}

// Charlie (young British male) & Lily (young British female)
const VOICE_MAP: Record<string, string> = {
  M: "IKne3meq5aSn9XLyUdCD",
  F: "pFZP5JQG7iQjIQuC4Bku",
};

async function generateTTS(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<Uint8Array> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.7,
          style: 0.55,
          use_speaker_boost: true,
          speed: 1.05,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS failed (${voiceId}): ${res.status} - ${err}`);
  }

  return new Uint8Array(await res.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { segments, industry, title, description } = (await req.json()) as {
      segments: Segment[];
      industry: string;
      title: string;
      description?: string;
    };

    if (!segments?.length || !industry || !title) {
      return new Response(
        JSON.stringify({ error: "segments, industry, and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY not set");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate all TTS segments in parallel batches
    const BATCH_SIZE = 5;
    const audioChunks: Uint8Array[] = new Array(segments.length);

    for (let i = 0; i < segments.length; i += BATCH_SIZE) {
      const batch = segments.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((seg) =>
          generateTTS(seg.text, VOICE_MAP[seg.speaker], ELEVENLABS_API_KEY),
        ),
      );
      results.forEach((buf, j) => {
        audioChunks[i + j] = buf;
      });
      console.log(
        `Batch ${Math.floor(i / BATCH_SIZE) + 1} complete (${Math.min(i + BATCH_SIZE, segments.length)}/${segments.length})`,
      );
    }

    // Concatenate MP3 buffers (MP3 is frame-based, so simple concat works)
    const totalLen = audioChunks.reduce((s, c) => s + c.length, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of audioChunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`Combined audio: ${combined.length} bytes`);

    // Upload to storage
    const fileName = `${industry}/${Date.now()}-dual.mp3`;
    const { error: uploadErr } = await supabase.storage
      .from("podcast-audio")
      .upload(fileName, combined, { contentType: "audio/mpeg", upsert: false });

    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

    const { data: urlData } = supabase.storage
      .from("podcast-audio")
      .getPublicUrl(fileName);

    // Estimate duration (~160 wpm for conversational)
    const totalWords = segments.reduce(
      (s, seg) => s + seg.text.split(/\s+/).length,
      0,
    );
    const durationSeconds = Math.round((totalWords / 160) * 60);

    const fullScript = segments
      .map((s) => `[${s.speaker === "M" ? "Him" : "Her"}] ${s.text}`)
      .join("\n");

    const { data: episode, error: insertErr } = await supabase
      .from("podcast_episodes")
      .insert({
        industry,
        title,
        description: description || fullScript.substring(0, 200) + "...",
        script: fullScript,
        audio_url: urlData.publicUrl,
        duration_seconds: durationSeconds,
        voice_id: "dual-host",
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) throw new Error(`DB insert failed: ${insertErr.message}`);

    console.log(`Episode saved: ${episode.id}`);

    return new Response(
      JSON.stringify({ success: true, episode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-dual-podcast error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
