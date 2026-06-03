import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderSiteMapForPrompt, renderSiteSearchResults, searchSiteIndex, buildRoutingDirective } from "../_shared/site-map.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CANDIDATE_KNOWLEDGE = `You are "Howdy", a friendly AI assistant for the Howdy platform - a UK site for young professionals exploring industries they're passionate about.

## Your personality
- Warm, encouraging, like a knowledgeable older sibling
- British English, professional but approachable
- Concise - keep answers helpful but not overwhelming
- Always link users to relevant pages on the site when possible

## Site structure & resources you can recommend
__SITE_MAP__



## How to help users
1. If they're exploring careers → suggest relevant industry pages and roles
2. If they want to apply for jobs → point to /marketplace and the CV/application tools
3. If they need skills/courses → recommend /learning and industry-specific courses tabs
4. If they want inspiration → suggest company profiles and career profiles
5. If they're unsure what suits them → recommend the "Understand Me" tool at /marketplace
6. **Side hustles / side income / making money on the side / part-time income / supplementing income / proving strategic value with a side project** → ALWAYS link to [/side-hustles](/side-hustles) FIRST, plus a specific topic page (e.g. [/side-hustles/freelancing](/side-hustles/freelancing), [/side-hustles/content-creation](/side-hustles/content-creation)) when relevant. Do NOT route side-hustle questions to industry pages, the Learning Hub, or the CV Builder — those are secondary at best. NEVER invent off-platform side-hustle ideas (no "start a scouting newsletter", no "help an artist with brand partnerships"). Only recommend the curated topics listed in the site map.
7. **Starting a business / founding a startup / incorporating / raising money / SEIS / EIS / Advance Assurance / angel investors / VC / grants / cap tables / fundraising** → ALWAYS link to [/starting-a-business](/starting-a-business) FIRST. It has dedicated SEIS/EIS, HMRC, legal foundations and fundraising sections with curated UK partner resources (SeedLegals, British Business Bank, SFC Capital, Angel Academe, BackerIQ, Legal Foundations). Do NOT route these to the Learning Hub or to role/industry pages — /starting-a-business is the canonical home.
8. Before recommending internal pages, use the live site-search context/tool results. If the user asks about Side Hustles or side income, the answer MUST start with [/side-hustles](/side-hustles). If they ask about SEIS/EIS/fundraising/startups, the answer MUST start with [/starting-a-business](/starting-a-business).
9. Always format links as markdown: [link text](/path)

## Rules
- Only recommend resources that exist in the site map below
- Treat "Relevant site pages found by live site search" as higher priority than your general knowledge.
- If asked about something outside your knowledge, say so honestly
- Never make up company profiles, roles, or pages that don't exist
- Keep responses under 300 words unless the user asks for detail

## Learning from the user (memory)
Every conversation is a learning moment. When the user reveals a meaningful fact about themselves - a role they want, an industry they love, a location, a constraint, a skill, a dislike - capture it.

At the very end of your reply, OPTIONALLY append a single line of memory updates in this exact format (one line, no markdown, no extra commentary):
\`MEMORY:: fact one || fact two || fact three\`

Only emit MEMORY:: when there is a genuinely new, durable fact about the user. Keep each fact under 12 words and write it as a third-person statement, e.g. "Wants producer roles in Manchester" or "Has 3 years marketing experience at startups". Do not repeat facts already in the user's existing memory.

## Default offer
When you've answered something useful, end with a short offer like: "Want me to keep watching for this overnight?"
`;

const EMPLOYER_KNOWLEDGE = `You are "Howdy", an AI assistant for **employers** on the Howdy platform - a UK site that connects young professionals with culturally relevant brands.

## Who you're talking to
You are speaking to an employer (a hiring manager, recruiter, or brand owner) - NOT a job seeker. Never give them job-search or CV advice. Speak to them as a peer working on their hiring funnel and brand presence.

## Your personality
- Sharp, practical, like a smart in-house talent partner
- British English, professional, friendly but business-focused
- Concise - give actionable answers, not generic advice
- Reference their dashboard tools and link to specific pages with markdown: [link text](/path)

## What employers can do on Howdy
The employer dashboard lives at **/employer-dashboard** and contains:

### Candidates tab
- See candidates who've shown interest in their **brand** or **industry** (opt-in only)
- Filter by: All · Engaged with brand · Engaged with industry · Match %
- Sort by Recent / Match % / Brand engagement
- See each candidate's RIASEC code, career level, location, role preferences
- **AI Summary** - generate a tailored fit summary against a selected job
- **Request contact** - message a candidate (they must accept before contact details are shared)
- **Hide** candidates from the list (per-employer hide list, restorable from the Hidden tray)

### Jobs tab (/employer-dashboard)
- Post and manage jobs for their company
- Jobs appear in the public marketplace at [/marketplace](/marketplace)
- Edit, deactivate, or delete jobs they've posted

### Company profile editor
- Edit tagline, about, mission, culture, perks, locations
- Upload logo and cover image
- Add external links (website, LinkedIn, careers page, Instagram)
- Press mentions, awards, sustainability copy, custom blocks
- Live profile is at **/company/{their-slug}** - public to all visitors

### Stats section
- **Profile views** (7d / 30d) and unique visitors
- **Job clicks** (7d / 30d) from the marketplace
- **Saves to Most Wanted** - candidates who saved their company
- **Top jobs** - best-performing listings by clicks

## How to help employers
1. **"How do I find candidates?"** → Explain the Candidates tab filters, opt-in mechanic, match %, and the AI Summary tool. Point them to /employer-dashboard.
2. **"How do I write a better job post?"** → Suggest concrete improvements to the title, level tag, location, salary transparency, and 2–3 sentence pitch. Offer to draft copy if they paste a brief.
3. **"How do I get more profile views?"** → Audit their company profile editor checklist (logo, cover, tagline, perks, links, press) and suggest quick wins. Link to /employer-dashboard.
4. **"What do my stats mean?"** → Interpret the numbers in plain English (e.g. "30 profile views with 4 job clicks ≈ 13% click-through, healthy for a niche brand").
5. **"How does matching work?"** → Match % blends candidate's industry interest, role preferences, RIASEC fit, and brand engagement. Higher = better fit for that employer.
6. **"Can I contact a candidate directly?"** → No - use Request Contact. The candidate has to opt in to the platform AND accept the request before you exchange details. This protects them and keeps trust high.

## Rules
- Treat the user as the employer - never suggest /auth, /onboarding, /my-profile, CV tools, or learning resources
- Don't recommend other employers' company profiles unless asked for inspiration
- Never invent dashboard features that don't exist
- Keep responses under 250 words unless they ask for detail
- Always format internal links as markdown: [Employer dashboard](/employer-dashboard)
`;

const SIDE_HUSTLE_TOPIC_LINKS: Array<{ pattern: RegExp; label: string; path: string }> = [
  { pattern: /\b(freelanc|client|portfolio)\b/i, label: "Freelancing", path: "/side-hustles/freelancing" },
  { pattern: /\b(content|creator|tiktok|youtube|instagram|social)\b/i, label: "Content Creation", path: "/side-hustles/content-creation" },
  { pattern: /\b(tutor|coaching|teach)\b/i, label: "Tutoring & Coaching", path: "/side-hustles/tutoring-coaching" },
  { pattern: /\b(vinted|depop|etsy|ebay|sell|selling|online)\b/i, label: "Selling Online", path: "/side-hustles/selling-online" },
  { pattern: /\b(deliver|driver|driving|uber|deliveroo)\b/i, label: "Delivery & Driving", path: "/side-hustles/delivery-driving" },
  { pattern: /\b(pet|dog|cat|walk|sitting)\b/i, label: "Pet Care", path: "/side-hustles/pet-care" },
  { pattern: /\b(handmade|craft|jewellery|candles|product)\b/i, label: "Handmade Products", path: "/side-hustles/handmade-products" },
  { pattern: /\b(digital|template|notion|download|course)\b/i, label: "Digital Products", path: "/side-hustles/digital-products" },
  { pattern: /\b(rent|renting|camera|equipment|assets)\b/i, label: "Renting Assets", path: "/side-hustles/renting-assets" },
  { pattern: /\b(local|cleaning|gardening|errand|service)\b/i, label: "Local Services", path: "/side-hustles/local-services" },
];

function isSideHustleQuery(message: string): boolean {
  return /\b(side\s*hustl|side\s*income|extra\s*(cash|money|income)|make\s*money\s*on\s*the\s*side|part[-\s]*time\s*income|supplement\s*(my\s*)?income)\b/i.test(message);
}

function sideHustleAnswer(message: string): string {
  const specific = SIDE_HUSTLE_TOPIC_LINKS.filter((topic) => topic.pattern.test(message)).slice(0, 2);
  const topicLine = specific.length
    ? `For your angle, go straight to ${specific.map((t) => `[${t.label}](${t.path})`).join(" or ")}.`
    : "Good starting points are [Freelancing](/side-hustles/freelancing), [Selling Online](/side-hustles/selling-online), [Content Creation](/side-hustles/content-creation), and [Tutoring & Coaching](/side-hustles/tutoring-coaching).";

  return `Start here: [Side Hustles](/side-hustles). That is the dedicated Howdy section for UK side-income ideas — not the Learning Hub or generic industry pages.

${topicLine}

It includes curated watch/listen/read resources plus practical UK help around tax, registration and insurance.

Want me to help you choose the best side-hustle route for your skills?`;
}

function sseText(text: string): Response {
  const sse = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
  return new Response(sse, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authUser.id;

    // Rate limit: 10 AI calls per day (admins and premium users are exempt)
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
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
    await svcClient.from("ai_usage_log").insert({ user_id: userId, function_name: "career-assistant" });

    const { messages, mode: requestedMode } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const latestUserMessage = [...messages].reverse().find((m: any) => m.role === "user")?.content ?? "";

    // Server-side role check - never trust the client mode flag alone (reuse roles fetched above)
    const isEmployer = roles.includes("employer");
    const mode: "employer" | "candidate" =
      requestedMode === "employer" && isEmployer ? "employer" : "candidate";

    // (No hardcoded topic bypass — routing is handled generically below via buildRoutingDirective)


    // Build context block
    let userContext = "";

    if (mode === "employer") {
      // Load the employer's company + key dashboard signals
      const { data: empRow } = await svcClient
        .from("employer_users")
        .select("company_id, contact_name, job_title")
        .eq("user_id", userId)
        .maybeSingle();

      if (empRow?.company_id) {
        const [{ data: company }, { data: profile }, { count: jobCount }] =
          await Promise.all([
            svcClient
              .from("employer_companies")
              .select("name, slug, industry")
              .eq("id", empRow.company_id)
              .maybeSingle(),
            svcClient
              .from("company_profiles")
              .select("tagline, logo_url, cover_image_url, about, perks, website_url")
              .eq("company_id", empRow.company_id)
              .maybeSingle(),
            svcClient
              .from("jobs")
              .select("id", { count: "exact", head: true })
              .eq("posted_by", userId),
          ]);

        const parts: string[] = [];
        if (empRow.contact_name) parts.push(`Contact name: ${empRow.contact_name}`);
        if (empRow.job_title) parts.push(`Their role: ${empRow.job_title}`);
        if (company?.name) parts.push(`Company: ${company.name}`);
        if (company?.industry) parts.push(`Industry: ${company.industry}`);
        if (company?.slug) parts.push(`Public profile: /company/${company.slug}`);
        parts.push(`Live jobs posted by them: ${jobCount ?? 0}`);

        // Profile completeness checklist (helps tailor advice)
        const missing: string[] = [];
        if (!profile?.logo_url) missing.push("logo");
        if (!profile?.cover_image_url) missing.push("cover image");
        if (!profile?.tagline) missing.push("tagline");
        if (!profile?.about) missing.push("about");
        if (!profile?.perks || profile.perks.length === 0) missing.push("perks");
        if (!profile?.website_url) missing.push("website link");
        if (missing.length) {
          parts.push(`Company profile is missing: ${missing.join(", ")}`);
        } else {
          parts.push("Company profile looks complete.");
        }

        userContext = `\n\n## Current employer context\n${parts.join("\n")}`;
      } else {
        userContext = `\n\n## Current employer context\nNo company linked to this account yet - direct them to /employer-dashboard or /employers to get set up.`;
      }
    } else {
      // Candidate context
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, career_level, industry_interests, role_preferences, location_preference, howdy_memory")
        .single();
      const parts: string[] = [];
      if (profile) {
        if (profile.full_name) parts.push(`Name: ${profile.full_name}`);
        if (profile.career_level) parts.push(`Career level: ${profile.career_level}`);
        if (profile.industry_interests?.length)
          parts.push(`Interested in: ${profile.industry_interests.join(", ")}`);
        if (profile.role_preferences?.length)
          parts.push(`Role preferences: ${profile.role_preferences.join(", ")}`);
        if (profile.location_preference) parts.push(`Location: ${profile.location_preference}`);
        if (profile.howdy_memory?.length) {
          parts.push(`\n### What you've already learned about them\n- ${profile.howdy_memory.join("\n- ")}`);
        }
      }

      // Pull a handful of live jobs that look relevant to the latest user message + memory
      const memoryBlob = (profile?.howdy_memory ?? []).join(" ");
      const haystack = `${latestUserMessage} ${memoryBlob} ${(profile?.industry_interests ?? []).join(" ")} ${(profile?.role_preferences ?? []).join(" ")}`.toLowerCase();
      const tokens = Array.from(new Set(
        haystack.split(/[^a-z0-9]+/).filter((t) => t.length >= 4 && !["want","with","that","this","have","from","your","jobs","role","roles","like","about"].includes(t))
      )).slice(0, 6);

      if (tokens.length) {
        const orFilter = tokens.map((t) => `title.ilike.%${t}%,company.ilike.%${t}%,industry.ilike.%${t}%`).join(",");
        const { data: liveJobs } = await svcClient
          .from("jobs")
          .select("id, title, company, industry, location, url")
          .or(orFilter)
          .or("expires_at.is.null,expires_at.gt.now()")
          .limit(8);
        if (liveJobs?.length) {
          const lines = liveJobs.map((j) => `- ${j.title} · ${j.company}${j.location ? " · " + j.location : ""} → /marketplace?jobId=${j.id}`).join("\n");
          parts.push(`\n### Live jobs that might fit them right now (cite these by title only - never invent)\n${lines}`);
        }
      }

      const relevantPages = renderSiteSearchResults(latestUserMessage);
      if (!relevantPages.startsWith("No matching")) {
        parts.push(`\n### Relevant site pages found by live site search (prioritise these over general advice)\n${relevantPages}`);
      }

      if (parts.length) userContext = `\n\n## Current user context\n${parts.join("\n")}`;
    }

    const AGENT_INSTRUCTIONS = mode === "candidate" ? `

## You are an AGENT - act, don't just chat
When the user expresses an intent, USE THE TOOLS to act on their behalf, then confirm what you did. Examples:
- "I want to be a CEO" → call add_dream_role(role: "CEO")
- "I love fashion and music" → call add_industry_interest for each
- "Add Nike to my list" / "I'd love to work at Burberry" → call add_dream_company
- "Find me marketing jobs in London" / "any chef roles?" → call search_jobs
- "Show me coffee jobs at Costa" → call search_jobs(query: "barista", company: "Costa")

You can call multiple tools in one turn. After acting, briefly confirm in plain English (e.g. "Added **CEO** to your dream roles ✅ - I'll watch for openings.") and offer a relevant next step. Don't ask permission to add things the user clearly asked for - just do it.

When users ask about jobs, ALWAYS prefer search_jobs over hand-waving. Quote real titles & companies from the tool results, never invent them.
When search_jobs returns matches, every job title you show MUST be a clickable markdown link using the EXACT url provided by the tool (these are in-app /marketplace?jobId=... links that open the job with the "Howdy can help" helper). Format: [Job Title at Company](/marketplace?jobId=...). Never link to the external job site - always use the in-app marketplace link.
` : "";

    const baseKnowledge = mode === "employer"
      ? EMPLOYER_KNOWLEDGE
      : CANDIDATE_KNOWLEDGE.replace("__SITE_MAP__", renderSiteMapForPrompt());
    const systemPrompt = baseKnowledge + AGENT_INSTRUCTIONS + userContext;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // ---------- Agent tools (candidate mode only) ----------
    const tools = mode === "candidate" ? [
      {
        type: "function",
        function: {
          name: "search_site",
          description: "Search Howdy's live site index for the best internal pages to recommend. Use before answering any navigation/resource question, especially side hustles, SEIS, EIS, startups, business, courses, roles, industries or tools.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "The user's topic or question, e.g. 'side hustles', 'SEIS', 'start a business', 'freelancing'" },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_dream_role",
          description: "Add a job title or role to the user's dream roles ('Most Wanted'). Use whenever the user expresses they want, dream of, or aim to be a particular role (e.g. 'I want to be a CEO', 'add producer to my list').",
          parameters: {
            type: "object",
            properties: {
              role: { type: "string", description: "The job title, e.g. 'CEO', 'Marketing Director', 'Chef de Partie'." },
            },
            required: ["role"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_dream_company",
          description: "Add a company to the user's dream companies ('Most Wanted'). Use when they name an employer they'd love to work at.",
          parameters: {
            type: "object",
            properties: {
              company: { type: "string", description: "The company name, e.g. 'Nike', 'Burberry'." },
            },
            required: ["company"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_industry_interest",
          description: "Add an industry to the user's industry interests. Use when they express love or curiosity for a sector (e.g. fashion, music, football).",
          parameters: {
            type: "object",
            properties: {
              industry: { type: "string", description: "Industry name, e.g. 'Fashion', 'Music', 'Football'." },
            },
            required: ["industry"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_jobs",
          description: "Search live UK job listings on the Howdy marketplace by keywords, company, industry or location. Returns up to 8 matches with titles, companies and apply URLs.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Free-text search across job titles (e.g. 'marketing manager', 'barista')." },
              company: { type: "string", description: "Optional company filter." },
              industry: { type: "string", description: "Optional industry filter." },
              location: { type: "string", description: "Optional location filter, e.g. 'London'." },
            },
          },
        },
      },
    ] : undefined;

    const executeTool = async (name: string, args: any): Promise<string> => {
      try {
        if (name === "search_site") {
          const query = String(args?.query || latestUserMessage || "").trim();
          const pages = searchSiteIndex(query);
          return JSON.stringify({
            count: pages.length,
            pages,
            clickableResults: pages.map((p) => `- [${p.title}](${p.path}) — ${p.description}`).join("\n"),
            instruction: "Use the first result as the primary recommendation. Format internal links as markdown. Do not recommend internal pages absent from these results or the site map.",
          });
        }
        if (name === "add_dream_role") {
          const role = String(args?.role || "").trim();
          if (!role) return JSON.stringify({ error: "role required" });
          const { data: prof } = await svcClient.from("profiles").select("job_preferences, role_preferences").eq("id", userId).maybeSingle();
          const jp: any = prof?.job_preferences || {};
          const existing: string[] = Array.isArray(jp.targetRoles) ? jp.targetRoles : [];
          if (!existing.some((r) => r.toLowerCase() === role.toLowerCase())) existing.push(role);
          jp.targetRoles = existing.slice(-50);
          const rolePrefs: string[] = Array.isArray(prof?.role_preferences) ? [...prof!.role_preferences] : [];
          if (!rolePrefs.some((r) => r.toLowerCase() === role.toLowerCase())) rolePrefs.push(role);
          await svcClient.from("profiles").update({ job_preferences: jp, role_preferences: rolePrefs }).eq("id", userId);
          return JSON.stringify({ ok: true, added: role, totalDreamRoles: existing.length, viewAt: "/my-profile" });
        }
        if (name === "add_dream_company") {
          const company = String(args?.company || "").trim();
          if (!company) return JSON.stringify({ error: "company required" });
          const { data: prof } = await svcClient.from("profiles").select("job_preferences").eq("id", userId).maybeSingle();
          const jp: any = prof?.job_preferences || {};
          const existing: string[] = Array.isArray(jp.targetCompanies) ? jp.targetCompanies : [];
          if (!existing.some((c) => c.toLowerCase() === company.toLowerCase())) existing.push(company);
          jp.targetCompanies = existing.slice(-50);
          await svcClient.from("profiles").update({ job_preferences: jp }).eq("id", userId);
          return JSON.stringify({ ok: true, added: company, totalDreamCompanies: existing.length, viewAt: "/my-profile" });
        }
        if (name === "add_industry_interest") {
          const industry = String(args?.industry || "").trim();
          if (!industry) return JSON.stringify({ error: "industry required" });
          const { data: prof } = await svcClient.from("profiles").select("industry_interests").eq("id", userId).maybeSingle();
          const existing: string[] = Array.isArray(prof?.industry_interests) ? [...prof!.industry_interests] : [];
          if (!existing.some((i) => i.toLowerCase() === industry.toLowerCase())) existing.push(industry);
          await svcClient.from("profiles").update({ industry_interests: existing }).eq("id", userId);
          return JSON.stringify({ ok: true, added: industry, totalIndustries: existing.length });
        }
        if (name === "search_jobs") {
          const q = String(args?.query || "").trim();
          const company = String(args?.company || "").trim();
          const industry = String(args?.industry || "").trim();
          const location = String(args?.location || "").trim();
          let query = svcClient.from("jobs").select("id, title, company, industry, location, url, salary").or("expires_at.is.null,expires_at.gt.now()").limit(8);
          if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
          if (company) query = query.ilike("company", `%${company}%`);
          if (industry) query = query.ilike("industry", `%${industry}%`);
          if (location) query = query.ilike("location", `%${location}%`);
          const { data, error } = await query;
          if (error) return JSON.stringify({ error: error.message });
          const jobs = data || [];
          // Link into the in-app Marketplace so the user lands on the job
          // with the "Howdy can help" application helper pre-opened, and we
          // log an interaction signal employers can see.
          const clickableResults = jobs
            .map((j: any) => `- [${j.title} at ${j.company}](/marketplace?jobId=${j.id})${j.location ? ` (${j.location})` : ""}${j.salary ? ` — ${j.salary}` : ""}`)
            .join("\n");
          return JSON.stringify({
            count: jobs.length,
            jobs,
            clickableResults,
            formattingRule: "In your final answer, paste clickableResults for the job list. Do not convert these into plain bold text.",
            browseAt: "/marketplace",
          });
        }
        return JSON.stringify({ error: "unknown tool" });
      } catch (e) {
        return JSON.stringify({ error: e instanceof Error ? e.message : "tool failed" });
      }
    };

    // ---------- Agent loop: up to 3 tool rounds, then stream final reply ----------
    const convo: any[] = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-10),
    ];

    // High-priority routing directive — inserted right before the latest user
    // turn so the model can't ignore it. Generic across ANY topic that maps
    // strongly to a canonical Howdy page.
    if (mode === "candidate") {
      const directive = buildRoutingDirective(latestUserMessage);
      if (directive) {
        // Insert as system message right before the final user message
        const lastUserIdx = convo.length - 1 - [...convo].reverse().findIndex((m) => m.role === "user");
        if (lastUserIdx >= 0) {
          convo.splice(lastUserIdx, 0, { role: "system", content: directive });
        } else {
          convo.push({ role: "system", content: directive });
        }
      }
    }


    if (mode === "candidate") {
      for (let round = 0; round < 3; round++) {
        const toolResp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${GEMINI_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: convo,
            tools,
            tool_choice: "auto",
          }),
        });
        if (!toolResp.ok) {
          if (toolResp.status === 429) return new Response(JSON.stringify({ error: "Rate limited - try again shortly" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          if (toolResp.status === 402) return new Response(JSON.stringify({ error: "AI credits required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          break;
        }
        const data = await toolResp.json();
        const msg = data?.choices?.[0]?.message;
        if (!msg) break;
        const toolCalls = msg.tool_calls || [];
        if (!toolCalls.length) {
          // No tool calls - we have the final reply already. Stream it as one SSE chunk.
          const finalText = msg.content || "";
          const sse = `data: ${JSON.stringify({ choices: [{ delta: { content: finalText } }] })}\n\ndata: [DONE]\n\n`;
          // Persist memory if present
          const memMatch = finalText.match(/MEMORY::\s*(.+)$/im);
          if (memMatch) {
            const newFacts = memMatch[1].split("||").map((s: string) => s.trim()).filter((s: string) => s.length > 2 && s.length < 200);
            if (newFacts.length) {
              const { data: prof } = await svcClient.from("profiles").select("howdy_memory").eq("id", userId).maybeSingle();
              const existing: string[] = prof?.howdy_memory ?? [];
              const lower = new Set(existing.map((s) => s.toLowerCase()));
              const merged = [...existing];
              for (const f of newFacts) if (!lower.has(f.toLowerCase())) merged.push(f);
              await svcClient.from("profiles").update({ howdy_memory: merged.slice(-40) }).eq("id", userId);
            }
          }
          return new Response(sse, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }
        // Execute tool calls
        convo.push(msg);
        for (const tc of toolCalls) {
          const args = (() => { try { return JSON.parse(tc.function?.arguments || "{}"); } catch { return {}; } })();
          const result = await executeTool(tc.function?.name, args);
          convo.push({ role: "tool", tool_call_id: tc.id, content: result });
        }
        // loop again so the model can use results / call more tools
      }
    }

    // Final streaming pass (employer mode, or after agent loop hit max rounds)
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: convo,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited - try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI service error");
    }

    // Tee the stream: pass through to client, sniff full assistant text for MEMORY:: lines, then persist.
    const [clientStream, sniffStream] = response.body!.tee();

    if (mode === "candidate") {
      (async () => {
        try {
          const reader = sniffStream.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let assistantText = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let nl: number;
            while ((nl = buf.indexOf("\n")) !== -1) {
              const line = buf.slice(0, nl).replace(/\r$/, "");
              buf = buf.slice(nl + 1);
              if (!line.startsWith("data: ")) continue;
              const json = line.slice(6).trim();
              if (json === "[DONE]") continue;
              try {
                const parsed = JSON.parse(json);
                const c = parsed.choices?.[0]?.delta?.content;
                if (c) assistantText += c;
              } catch { /* ignore */ }
            }
          }
          // Extract MEMORY:: line(s)
          const memMatch = assistantText.match(/MEMORY::\s*(.+)$/im);
          if (memMatch) {
            const newFacts = memMatch[1]
              .split("||")
              .map((s) => s.trim())
              .filter((s) => s.length > 2 && s.length < 200);
            if (newFacts.length) {
              const { data: prof } = await svcClient
                .from("profiles")
                .select("howdy_memory")
                .eq("id", userId)
                .maybeSingle();
              const existing: string[] = prof?.howdy_memory ?? [];
              const existingLower = new Set(existing.map((s) => s.toLowerCase()));
              const merged = [...existing];
              for (const f of newFacts) {
                if (!existingLower.has(f.toLowerCase())) merged.push(f);
              }
              // Cap at most-recent 40 facts.
              const trimmed = merged.slice(-40);
              await svcClient.from("profiles").update({ howdy_memory: trimmed }).eq("id", userId);
            }
          }
        } catch (err) {
          console.error("memory sniff failed:", err);
        }
      })();
    }

    return new Response(clientStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("career-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
