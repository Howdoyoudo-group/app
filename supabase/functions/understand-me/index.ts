import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ROLES = [
  { title: "Marketing", slug: "marketing", category: "business" },
  { title: "Finance / Accounting", slug: "finance", category: "business" },
  { title: "Operations", slug: "operations", category: "business" },
  { title: "Strategy", slug: "strategy", category: "business" },
  { title: "Sales", slug: "sales", category: "business" },
  { title: "Product", slug: "product", category: "business" },
  { title: "Creative", slug: "creative", category: "business" },
  { title: "HR & People", slug: "hr-people", category: "business" },
  { title: "Legal & Compliance", slug: "legal-compliance", category: "business" },
  { title: "Project & Programme Management", slug: "project-management", category: "business" },
  { title: "Commercial", slug: "commercial", category: "business" },
  { title: "E-commerce", slug: "ecommerce", category: "business" },
  { title: "Barista", slug: "barista", category: "craft" },
  { title: "Chef / Baker", slug: "chef", category: "craft" },
  { title: "Personal Trainer", slug: "personal-trainer", category: "craft" },
  { title: "Estate Agent", slug: "estate-agent", category: "craft" },
  { title: "Stylist / Designer", slug: "stylist", category: "craft" },
  { title: "Producer", slug: "producer", category: "craft" },
  { title: "Teacher", slug: "teacher", category: "craft" },
  { title: "Physiotherapist", slug: "physiotherapist", category: "craft" },
  { title: "Psychotherapist", slug: "psychotherapist", category: "craft" },
];

const INDUSTRIES = [
  "Bakery", "Beer", "Charity", "Cinema", "Coffee", "Estate Agency",
  "Fashion", "Football", "Footwear", "Grocery", "Hospitality",
  "Interior Design", "Music", "Physiotherapy", "Psychotherapy", "Teaching", "Wellness",
];

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function extractDocxText(bytes: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);

  const xmlFiles = Object.keys(zip.files)
    .filter((name) => /^word\/(document|header\d+|footer\d+|footnotes|endnotes)\.xml$/i.test(name))
    .sort((a, b) => a.localeCompare(b));

  const sections = await Promise.all(
    xmlFiles.map(async (name) => {
      const file = zip.file(name);
      if (!file) return "";

      const xml = await file.async("string");
      return decodeXmlEntities(
        xml
          .replace(/<w:tab[^>]*\/>/g, "\t")
          .replace(/<w:br[^>]*\/>/g, "\n")
          .replace(/<\/w:p>/g, "\n")
          .replace(/<\/w:tr>/g, "\n")
          .replace(/<[^>]+>/g, " ")
          .replace(/[ \t]+/g, " ")
          .replace(/ *\n */g, "\n")
          .trim(),
      );
    }),
  );

  return sections.filter(Boolean).join("\n\n").trim();
}

async function extractFileText(filePath: string, apiKey: string): Promise<string> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: fileData, error: downloadError } = await supabase.storage
    .from("cv-uploads")
    .download(filePath);

  if (downloadError || !fileData) {
    throw new Error("Failed to download file");
  }

  const fileName = filePath.toLowerCase();
  let extractedText = "";

  if (fileName.endsWith(".txt")) {
    extractedText = await fileData.text();
  } else if (fileName.endsWith(".docx")) {
    const bytes = new Uint8Array(await fileData.arrayBuffer());
    extractedText = await extractDocxText(bytes);
  } else if (fileName.endsWith(".pdf")) {
    const bytes = new Uint8Array(await fileData.arrayBuffer());
    const base64 = arrayBufferToBase64(bytes.buffer);
    const visionResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Extract ALL text from this document exactly as written. Return only the extracted text." },
            { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
          ],
        }],
      }),
    });
    if (!visionResp.ok) throw new Error("Vision extraction failed");
    const visionData = await visionResp.json();
    extractedText = visionData.choices?.[0]?.message?.content || "";
  } else {
    const rawText = await fileData.text();
    extractedText = rawText.replace(/<[^>]+>/g, " ").replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
    if (extractedText.length < 100) {
      const bytes = new Uint8Array(await fileData.arrayBuffer());
      const base64 = arrayBufferToBase64(bytes.buffer);
      const mime = fileName.endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/msword";
      const visionResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Extract ALL text from this document exactly as written." },
              { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
            ],
          }],
        }),
      });
      if (visionResp.ok) {
        const d = await visionResp.json();
        extractedText = d.choices?.[0]?.message?.content || extractedText;
      }
    }
  }

  // NOTE: We intentionally KEEP the uploaded CV in storage so that
  // employers can download the original file once the candidate has
  // explicitly shared their contact details (details_shared = true on
  // contact_requests). Access is mediated by the get-candidate-cv edge
  // function, never by direct bucket access.

  return extractedText;
}

function buildSystemPrompt(inputType: string, hasInstagram: boolean): string {
  const rolesList = ROLES.map(r => `${r.title} (slug: ${r.slug}, category: ${r.category})`).join("\n");
  const industriesList = INDUSTRIES.join(", ");

  let inputGuidance = "";
  if (inputType === "instagram") {
    inputGuidance = `The input is from an Instagram profile (URL, bio, or captions). This is NOT a formal career source.
Treat it as a softer signal of the person's interests, identity, style, audience, and likely industry or role alignment.
Use tentative, suggestive language in your analysis:
- "Your profile suggests…"
- "You seem aligned with…"
- "You may be suited to…"
This is especially useful for creative, creator, wellness, fashion, fitness, media, and community-led paths.`;
  } else if (hasInstagram) {
    inputGuidance = `The input combines formal career data (CV or LinkedIn) with Instagram profile content.
- The CV/LinkedIn data represents what they've DONE - formal experience, role history, qualifications.
- The Instagram data represents who they SEEM TO BE - interests, identity, style, audience, and world they belong in.
Combine both signals thoughtfully. Use formal language for career-derived insights and softer, suggestive language for Instagram-derived insights (e.g. "Your Instagram suggests…", "You seem aligned with…").`;
  }

  return `You are an expert UK career analyst. Analyse the person's background and map them to roles and industries.

ABSOLUTE RULE - ZERO HALLUCINATION TOLERANCE:
1. You must ONLY use information that is EXPLICITLY and LITERALLY stated in the input text below.
2. Do NOT infer, guess, assume, or fill in ANY details from your training data or general knowledge.
3. If the person's name matches a public figure, celebrity, or anyone you have prior knowledge about - COMPLETELY IGNORE all external knowledge. Treat them as a total stranger.
4. Every single claim you make - every company name, job title, location, skill, or fact - MUST be directly and literally traceable to a specific sentence in the input.
5. If the input is vague or lacks detail, say "Based on limited information provided" - do NOT fabricate or embellish.
6. NEVER invent or assume: employer names, job titles, locations, industries, qualifications, or years of experience that are not explicitly written in the input.
7. In the "personalityInsights" field, ONLY describe traits evident from the actual text provided - do not create a fictional persona.
8. If you cannot determine something from the input, omit it or say "not specified" - NEVER guess.
9. Never assign hands-on craft or service roles (such as barista, chef, stylist, personal trainer, teacher, therapist, estate agent) unless the input EXPLICITLY states the person personally did that job.
10. If the input shows executive, board, founder, chair, C-suite, president, vice president, managing director, non-executive, or senior independent director experience, prioritise business leadership roles and do NOT downgrade them to shop-floor or service roles.

Available roles:
${rolesList}

Available industries: ${industriesList}

${inputGuidance}

The input may be a CV, LinkedIn profile, Instagram profile, or a free-text description of experience. Focus on WHO the person is, their working style, strengths and natural fit - not just job titles.

Return JSON with this exact structure:
{
  "roleMatches": [
    { "role": "Role Title", "slug": "role-slug", "percentage": <number 1-100>, "reason": "Why this is a match - cite specific experience from the input" }
  ],
  "industryFit": [
    { "industry": "Industry Name", "confidence": <number 1-100>, "reason": "Why this fits - reference specific companies or roles from the input" }
  ],
  "careerLevel": "entry|mid|senior|executive|null",
  "transferableSkills": ["skill1", "skill2", ...],
  "personalityInsights": "2-3 sentences about their working style and strengths based ONLY on what they've shared in the input",
  "suggestedNextSteps": [
    { "action": "Brief action description", "link": "/path", "type": "role|industry|jobs" }
  ]
}

Rules:
- Return 2-3 role matches sorted by percentage (highest first), minimum 40%
- Return 3-5 industry fits sorted by confidence (highest first), minimum 30%
- Set careerLevel using only explicit evidence from the input:
  - executive = board/chair/C-suite/founder/managing director/president/vice president/non-executive/senior independent director/CEO-style leadership
  - senior = explicit senior/head/director/lead/manager-level experience without executive evidence
  - mid = experienced individual contributor or specialist with no senior/executive evidence
  - entry = junior/intern/assistant/apprentice/graduate/trainee
  - null = unclear from the text
- Return 4-8 transferable skills as concise bullet points
- NEVER reference companies, roles, locations, or experience not EXPLICITLY and LITERALLY written in the input text
- If the CV mentions a company, use that EXACT company name - do not substitute, abbreviate, or "correct" it
- Double-check every fact in your response against the input text before returning
- For suggestedNextSteps, use these URL patterns: roles → /roles/{slug}, industries → /{industry-slug}, jobs → /marketplace?industry={Industry Name}
- Industry slugs: bakery, beer, charity, cinema, coffee, estate-agency, fashion, football, footwear, grocery, hospitality, interior-design, music, physiotherapy, psychotherapy, teaching, wellness
- Only return valid JSON, no markdown`;
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

    // Rate limit: 10 AI calls per user per day (admins and premium users are exempt)
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: roleRows } = await svcClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (roleRows ?? []).map((r: any) => r.role);
    const isUnlimited = roles.includes("admin") || roles.includes("premium");
    if (!isUnlimited) {
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
    }
    await svcClient.from("ai_usage_log").insert({ user_id: userId, function_name: "understand-me" });

    const { inputType, text, filePath, instagramText, linkedinText, linkedinScreenshotPath } = await req.json();

    if (!inputType || (!text && !filePath && !instagramText && !linkedinText && !linkedinScreenshotPath)) {
      return new Response(JSON.stringify({ error: "Input is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // Build combined text from all available sources
    const sections: string[] = [];

    // Extract CV text if uploaded
    if (filePath) {
      const cvText = await extractFileText(filePath, GEMINI_API_KEY);
      if (cvText && cvText.trim().length > 10) {
        sections.push(`=== CV / RESUME ===\n${cvText}`);
      }
    }

    // Extract LinkedIn text from screenshot via vision
    if (linkedinScreenshotPath) {
      try {
        const svcClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        const { data: imgData, error: dlError } = await svcClient.storage
          .from("cv-uploads")
          .download(linkedinScreenshotPath);
        if (!dlError && imgData) {
          const bytes = new Uint8Array(await imgData.arrayBuffer());
          const base64 = arrayBufferToBase64(bytes.buffer);
          const ext = linkedinScreenshotPath.toLowerCase().split(".").pop() || "png";
          const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
          const visionResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "gemini-2.5-flash",
              messages: [{
                role: "user",
                content: [
                  { type: "text", text: "This is a screenshot of a LinkedIn profile. Extract ALL visible text exactly as written - name, headline, about section, experience entries (job titles, companies, dates, descriptions), education, skills, and any other visible profile text. Return only the extracted text, well-formatted." },
                  { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
                ],
              }],
            }),
          });
          if (visionResp.ok) {
            const visionData = await visionResp.json();
            const linkedinExtracted = visionData.choices?.[0]?.message?.content || "";
            if (linkedinExtracted.trim().length > 10) {
              sections.push(`=== LINKEDIN PROFILE ===\n${linkedinExtracted}`);
            }
          }
          // Clean up screenshot
          await svcClient.storage.from("cv-uploads").remove([linkedinScreenshotPath]);
        }
      } catch (e) {
        console.error("LinkedIn screenshot extraction error:", e);
      }
    }

    // LinkedIn profile text (pasted manually)
    if (linkedinText && linkedinText.trim()) {
      sections.push(`=== LINKEDIN PROFILE (PASTED) ===\n${linkedinText.trim()}`);
    }

    // Free text / personal description
    if (text && text.trim()) {
      sections.push(`=== PERSONAL DESCRIPTION ===\n${text.trim()}`);
    }

    // Legacy Instagram support
    const hasInstagram = !!(instagramText && instagramText.trim());
    if (hasInstagram) {
      sections.push(`=== INSTAGRAM PROFILE ===\n${instagramText.trim()}`);
    }

    const extractedText = sections.join("\n\n");

    if (!extractedText || extractedText.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Not enough information to analyse. Please provide more detail." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(inputType, hasInstagram);

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyse this person's background:\n\n${extractedText.substring(0, 30000)}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      return new Response(JSON.stringify({ error: "Failed to parse results" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: parsed,
        // Echo back the stored CV path so the client can persist it on the
        // profile for later employer-mediated download.
        cvFilePath: filePath || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("understand-me error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
