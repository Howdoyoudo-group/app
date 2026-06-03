import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { strFromU8, unzipSync } from "https://esm.sh/fflate@0.8.2?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function arrayBufferToBase64(bytes: Uint8Array): string {
  // Encode in chunks to avoid call-stack overflow on large CVs
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.byteLength; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function parseJsonContent(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] || content).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return JSON.parse(start >= 0 && end >= start ? raw.slice(start, end + 1) : raw);
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const zip = unzipSync(bytes);
  const xmlFileNames = Object.keys(zip).filter((name) =>
    /^word\/(document|footnotes|endnotes|comments|header\d+|footer\d+)\.xml$/i.test(name)
  );
  const chunks: string[] = [];

  for (const name of xmlFileNames) {
    const file = zip[name];
    if (!file) continue;
    const xml = strFromU8(file);
    const paragraphXml = xml.replace(/<w:(?:tab|br)[^>]*\/>/g, " ").replace(/<\/w:p>/g, "\n");
    const textParts = [...paragraphXml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((m) =>
      decodeXmlEntities(m[1])
    );
    if (textParts.length) chunks.push(textParts.join(""));
  }

  return chunks.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeExtraction(parsed: any) {
  return {
    education: Array.isArray(parsed?.education)
      ? parsed.education.filter((e: any) => e?.school || e?.qualification || e?.grade || e?.dates)
      : [],
    qualifications: Array.isArray(parsed?.qualifications)
      ? parsed.qualifications.filter((q: any) => q?.name || q?.issuer || q?.year)
      : [],
    experience: Array.isArray(parsed?.experience)
      ? parsed.experience.filter((w: any) => w?.company || w?.title || w?.dates)
      : [],
  };
}

const SYSTEM_PROMPT = `Extract education, qualifications, AND work experience from the candidate's CV.

ABSOLUTE RULE - ZERO HALLUCINATION TOLERANCE:
- Use ONLY information EXPLICITLY stated in the CV.
- Do NOT infer, guess, or fill in details from your training data.
- If a field is not present, return an empty string for that field.

WHAT TO LOOK FOR (be thorough - scan the WHOLE document):
- EDUCATION: Schools, sixth-form colleges, FE colleges, universities. Degrees (BA, BSc, MA, MSc, PhD, MBA, etc.), A-Levels, BTECs, IB, GCSEs.
- QUALIFICATIONS: Standalone certifications, licences, professional memberships, short courses (CIPD, AWS, PRINCE2, First Aid, Driving Licence, Food Hygiene, etc.).
- WORK EXPERIENCE: Sections headed Experience, Work Experience, Employment, Career History, Professional Experience. Include paid jobs, internships, placements, part-time work, weekend jobs, freelance and self-employment. Capture company, job title, dates and a 1-2 sentence description of what they did.

OUTPUT - return ONLY valid JSON, no markdown, no commentary:
{
  "education": [
    { "school": "Institution name (or empty)", "qualification": "Degree / A-Levels / GCSEs etc.", "dates": "e.g. 2019-2022", "grade": "e.g. First Class, A*A*A", "link": "institution website only if explicitly stated in the CV, otherwise empty" }
  ],
  "qualifications": [
    { "name": "Certification name", "issuer": "Awarding body (or empty)", "year": "e.g. 2023" }
  ],
  "experience": [
    { "company": "Employer name", "title": "Job title", "dates": "e.g. Jun 2022 – Aug 2023", "location": "City (or empty)", "description": "1-2 sentence summary of the role and key responsibilities", "link": "company website only if explicitly stated in the CV, otherwise empty" }
  ]
}

Sort education and experience with most recent first. If you find nothing for a section, return an empty array - never invent.`;

async function callGemini(apiKey: string, body: any) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Sign in required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Invalid session." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub as string;

    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await svc
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("used_at", todayStart.toISOString());
    if ((count ?? 0) >= 10) {
      return new Response(JSON.stringify({ error: "You've reached your daily limit of 10 AI requests. Try again tomorrow." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    await svc.from("ai_usage_log").insert({ user_id: userId, function_name: "extract-cv-education" });

    const { filePath } = await req.json();
    if (!filePath) {
      return new Response(JSON.stringify({ error: "filePath is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { data: fileData, error: dlErr } = await svc.storage.from("cv-uploads").download(filePath);
    if (dlErr || !fileData) {
      console.error("download failed", filePath, dlErr);
      return new Response(JSON.stringify({ error: "Failed to download CV file" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const fn = filePath.toLowerCase();
    const isPdf = fn.endsWith(".pdf");
    const isDocx = fn.endsWith(".docx");
    const isDoc = fn.endsWith(".doc");
    const isTxt = fn.endsWith(".txt");

    console.log(`extract-cv-education: file=${filePath} size=${fileData.size}`);

    const runTextExtraction = async (cvText: string, label: string) => {
      console.log(`${label} path, cvText length=${cvText.length} preview=${cvText.slice(0, 300)}`);
      if (!cvText || cvText.trim().length < 20) {
        return new Response(JSON.stringify({ error: "Could not read enough text from the CV." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const r = await callGemini(LOVABLE_API_KEY, {
        model: "google/gemini-2.5-flash",
        max_tokens: 8192,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `CV text:\n\n${cvText.substring(0, 60000)}` },
        ],
      });
      if (!r.ok) {
        console.error(`Gemini text call failed (${label})`, r.status, await r.text().catch(() => ""));
        return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const d = await r.json();
      const content = d.choices?.[0]?.message?.content || "";
      console.log(`${label} extraction content length=${content.length}`);
      let parsed;
      try { parsed = normalizeExtraction(parseJsonContent(content)); }
      catch (err) {
        console.error(`parse failed (${label})`, err, "content=", content.slice(0, 500));
        return new Response(JSON.stringify({ error: "Failed to parse extraction results" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.log(`${label} extracted: edu=${parsed.education.length} qual=${parsed.qualifications.length} exp=${parsed.experience.length}`);
      return new Response(JSON.stringify({ success: true, ...parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    };

    // 1) Plain-text / DOCX paths - extract readable text before asking Gemini.
    if (isTxt) {
      return await runTextExtraction(await fileData.text(), "txt");
    }

    const bytes = new Uint8Array(await fileData.arrayBuffer());

    if (isDocx) {
      try {
        const docxText = await extractDocxText(bytes);
        return await runTextExtraction(docxText, "docx");
      } catch (err) {
        console.error("docx text extraction failed", err);
        return new Response(JSON.stringify({ error: "Could not read text from the DOCX CV. Try uploading it as a PDF." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // 2) PDF / DOC / DOCX - send the file directly to Gemini multimodal so we
    //    skip the brittle two-step (vision -> text -> parse) and let the model
    //    read the document end-to-end.
    const base64 = arrayBufferToBase64(bytes);
    const mime = isPdf
      ? "application/pdf"
      : isDocx
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : isDoc
          ? "application/msword"
          : "application/octet-stream";

    console.log(`binary path mime=${mime} bytes=${bytes.length}`);

    const r = await callGemini(LOVABLE_API_KEY, {
      model: "google/gemini-2.5-flash",
      max_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Read the attached CV and return the JSON structure described above. Scan the WHOLE document - Education sections often appear near the end, and capture EVERY job/role under Experience, Employment or Career History (oldest to newest)." },
            { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
          ],
        },
      ],
    });

    if (!r.ok) {
      const errBody = await r.text().catch(() => "");
      console.error("Gemini multimodal call failed", r.status, errBody);
      if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const d = await r.json();
    const content = d.choices?.[0]?.message?.content || "";
    console.log(`multimodal content length=${content.length} preview=${content.slice(0, 300)}`);

    let parsed;
    try { parsed = normalizeExtraction(parseJsonContent(content)); }
    catch (err) {
      console.error("parse failed (binary)", err, "content=", content.slice(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse extraction results" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`binary extracted: edu=${parsed.education.length} qual=${parsed.qualifications.length} exp=${parsed.experience.length}`);
    return new Response(JSON.stringify({ success: true, ...parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("extract-cv-education error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
