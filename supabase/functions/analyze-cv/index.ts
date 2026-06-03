import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INDUSTRIES = [
  "Bakery", "Charity", "Cinema", "Coffee", "Estate Agency",
  "Fashion", "Food & Drink", "Football", "Grocery", "Interior Design",
  "Music", "Teaching",
];

function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function extractTextViaVision(
  fileBytes: Uint8Array,
  mimeType: string,
  apiKey: string
): Promise<string> {
  const base64 = arrayBufferToBase64(fileBytes);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extract ALL text from this document exactly as written. Return only the extracted text, no commentary." },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Vision extraction error:", response.status, err);
    throw new Error(`Vision extraction failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Invalid session. Please sign in again." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;

    // Rate limit: 10 AI calls per user per day
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await svcClient
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("used_at", todayStart.toISOString());
    if ((count ?? 0) >= 10) {
      return new Response(
        JSON.stringify({ error: "You've reached your daily limit of 10 AI requests. Try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    await svcClient.from("ai_usage_log").insert({ user_id: userId, function_name: "analyze-cv" });

    const { filePath } = await req.json();
    if (!filePath) {
      return new Response(JSON.stringify({ error: "filePath is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("cv-uploads")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(JSON.stringify({ error: "Failed to download CV file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract text content from the file
    let cvText = "";
    const fileName = filePath.toLowerCase();

    if (fileName.endsWith(".txt")) {
      cvText = await fileData.text();
    } else if (fileName.endsWith(".pdf")) {
      // Use vision API to properly read PDF content (handles scanned docs too)
      const bytes = new Uint8Array(await fileData.arrayBuffer());
      cvText = await extractTextViaVision(bytes, "application/pdf", LOVABLE_API_KEY);
    } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
      // Try text extraction first, fall back to vision API
      const text = await fileData.text();
      const cleaned = text.replace(/<[^>]+>/g, " ").replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
      if (cleaned.length > 100) {
        cvText = cleaned;
      } else {
        const bytes = new Uint8Array(await fileData.arrayBuffer());
        const mime = fileName.endsWith(".docx")
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/msword";
        cvText = await extractTextViaVision(bytes, mime, LOVABLE_API_KEY);
      }
    } else {
      cvText = await fileData.text();
    }

    console.log(`Extracted ${cvText.length} chars from CV`);

    if (!cvText || cvText.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Could not extract enough text from the CV. Please try a different file format." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze with AI
    const systemPrompt = `You are an expert UK career advisor. Analyze the uploaded CV and provide:
1. A detailed feedback report covering strengths, weaknesses, and improvement suggestions
2. Match the candidate to the most relevant industries from this list: ${INDUSTRIES.join(", ")}

ABSOLUTE RULE - ZERO HALLUCINATION TOLERANCE:
- You must ONLY use information EXPLICITLY and LITERALLY stated in the CV text below.
- Do NOT infer, guess, assume, or fill in ANY details from your training data or general knowledge.
- If the person's name matches a public figure or anyone you know about - COMPLETELY IGNORE all external knowledge.
- Every company name, job title, location, and fact you mention MUST be directly copied from the CV text.
- If the CV is vague or lacks detail, say so - do NOT fabricate or embellish.
- NEVER invent employer names, job titles, locations, or qualifications not written in the CV.

Return JSON with this exact structure:
{
  "feedback": {
    "overallScore": <number 1-10>,
    "strengths": ["strength1", "strength2", ...],
    "improvements": ["improvement1", "improvement2", ...],
    "summary": "2-3 sentence overall assessment using ONLY facts from the CV"
  },
  "matchedIndustries": [
    { "industry": "Industry Name", "confidence": <number 1-100>, "reason": "Why this is a match - cite specific CV content" }
  ]
}

Only include industries with confidence >= 40. Sort by confidence descending. Only return valid JSON, no markdown.
Double-check every fact in your response against the CV text before returning.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze this CV:\n\n${cvText.substring(0, 30000)}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse analysis results" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean up: delete the uploaded file after analysis
    await supabase.storage.from("cv-uploads").remove([filePath]);

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-cv error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
