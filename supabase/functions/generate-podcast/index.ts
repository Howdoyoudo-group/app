import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const INDUSTRIES = [
  "cinema", "fashion", "coffee", "music", "grocery",
  "hospitality", "football", "teaching", "interior-design",
  "charity", "estate-agency", "bakery", "footwear",
  "physiotherapy", "psychotherapy", "wellness",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry } = await req.json();

    if (!industry || !INDUSTRIES.includes(industry.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: `Invalid industry. Must be one of: ${INDUSTRIES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const industryKey = industry.toLowerCase();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Generate script with AI
    console.log(`Generating podcast script for ${industryKey}...`);
    const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a career podcast scriptwriter for young professionals in the UK. Write short, punchy podcast scripts (60-90 seconds when read aloud, roughly 150-200 words). The tone is friendly, encouraging, and practical - like a knowledgeable older sibling giving career advice. Never use markdown formatting - write plain spoken text only. Start with a brief greeting and the topic, give 2-3 actionable tips, and end with encouragement.`,
          },
          {
            role: "user",
            content: `Write a short career tip podcast episode for someone interested in working in the ${industryKey} industry in the UK. Pick a specific, useful topic like "how to get your first role", "skills employers actually want", "what a typical day looks like", or "common mistakes to avoid". Make it specific to ${industryKey} - mention real job titles, companies, or qualifications where relevant.`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited - try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI script generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const script = aiData.choices?.[0]?.message?.content;
    if (!script) throw new Error("No script generated");

    // Extract a title from the first line
    const firstLine = script.split(/[.!?\n]/)[0].trim();
    const title = firstLine.length > 10 && firstLine.length < 100
      ? firstLine
      : `Career Tips: ${industryKey.charAt(0).toUpperCase() + industryKey.slice(1)}`;

    console.log(`Script generated: "${title}" (${script.length} chars)`);

    // Step 2: Generate audio with ElevenLabs TTS
    console.log("Generating audio with ElevenLabs...");
    const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // George - warm British male voice
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      console.error("TTS error:", ttsResponse.status, errText);
      throw new Error(`ElevenLabs TTS failed: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);
    console.log(`Audio generated: ${audioBytes.length} bytes`);

    // Step 3: Upload to storage
    const fileName = `${industryKey}/${Date.now()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("podcast-audio")
      .upload(fileName, audioBytes, {
        contentType: "audio/mpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("podcast-audio")
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;

    // Rough duration estimate: ~150 words per minute
    const wordCount = script.split(/\s+/).length;
    const durationSeconds = Math.round((wordCount / 150) * 60);

    // Step 4: Save episode record
    const { data: episode, error: insertError } = await supabase
      .from("podcast_episodes")
      .insert({
        industry: industryKey,
        title,
        description: script.substring(0, 200) + "...",
        script,
        audio_url: audioUrl,
        duration_seconds: durationSeconds,
        voice_id: voiceId,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`DB insert failed: ${insertError.message}`);
    }

    console.log(`Episode saved: ${episode.id}`);

    return new Response(
      JSON.stringify({ success: true, episode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-podcast error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
