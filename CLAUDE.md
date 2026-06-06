# Howdoyoudo — Claude Context

## What This Project Is
Howdoyoudo (HDYD) is a UK career exploration platform. The ethos is helping people discover industries they might love, not just find jobs. Think career coach meets industry guide — aimed at young people and career changers.

**Live site:** https://www.howdoyoudo.co.uk  
**Old Lovable site (still live):** https://howdoyoudo.group (do not touch)

## Tech Stack
- **Frontend:** React + Vite + TypeScript
- **Backend:** Supabase (Postgres + Edge Functions in Deno/TypeScript)
- **AI:** Google Gemini 2.5 Flash via OpenAI-compatible API
- **Hosting:** Vercel (`dist` project, auto-deploys from Howdoyoudo-group/app)
- **Email:** Resend (domain: notify.howdoyoudo.group ✅ verified)

## Credentials & IDs
- **Supabase project:** `wgistckxxbfpsuulbswr`
- **Supabase URL:** https://wgistckxxbfpsuulbswr.supabase.co
- **Supabase access token:** see local memory file (never commit to git)
- **Supabase service role key:** see local memory file (never commit to git)
- **Woody's user ID:** `640364f1-20d2-4be2-87ea-5bcd7200f3bc`
- **Old Lovable project ID:** `siqwclmzncubkrwabmvb` (reference only, no access)
- **All credentials stored in:** `~/.claude/projects/-Users-woodyharrison-Desktop-Howdoyoudo/memory/project_migration.md`

## GitHub
- **Primary remote:** `howdoyoudo` → github.com/Howdoyoudo-group/app (Vercel watches this)
- **Mirror remote:** `origin` → github.com/woody-versus/https-howdoyoudo-group
- **ALWAYS push to both:** `git push howdoyoudo main && git push origin main`
- Git push is allowed — no permission prompt needed

## Deploying Edge Functions
```
SUPABASE_ACCESS_TOKEN=<token-from-memory-file> npx supabase functions deploy <name> --project-ref wgistckxxbfpsuulbswr
```
(Access token in local memory file — never hardcode in git)

## CRITICAL: Service Key Issue
New Supabase projects auto-inject `SUPABASE_SERVICE_ROLE_KEY` in `sb_*` format which is **incompatible** with old supabase-js. Always use `HDYD_SERVICE_JWT` (custom secret) instead for all DB queries and function-to-function calls.

## API Keys in Supabase Secrets
- `GEMINI_API_KEY` — Google AI, billing active. Model: `gemini-2.5-flash`
- `HDYD_SERVICE_JWT` — JWT service role key (use this, not SUPABASE_SERVICE_ROLE_KEY)
- `ADZUNA_APP_ID` + `ADZUNA_API_KEY` — Adzuna jobs API
- `REED_API_KEY` — Reed jobs + courses
- `JOOBLE_API_KEY` — Jooble jobs
- `PERPLEXITY_API_KEY` — news/events discovery
- `RESEND_API_KEY` — all emails
- `FIRECRAWL_API_KEY` — web scraping (free tier)
- `RAPIDAPI_KEY` — JSearch/Google Jobs
- `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID` — Howdy voice
- `SERPAPI_KEY` — Google search
- Missing: `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` (WhatsApp, waiting on partner)

## Domain Setup
- `www.howdoyoudo.co.uk` → Vercel ✅ (A record: 216.198.79.1)
- `howdoyoudo.co.uk` → forwards to www via 123-reg ✅
- 123-reg nameservers switched to 123-reg's own (was GoDaddy) — propagating
- **TODO:** Add `A @ 216.198.79.1` in 123-reg DNS to fix bare domain hitting old Lovable servers

## Supabase Auth
- **Site URL:** https://www.howdoyoudo.co.uk
- **Redirect URLs:** www.howdoyoudo.co.uk/**, howdoyoudo.co.uk/**, dist-kappa-ten-23.vercel.app/**
- **Google OAuth:** Enabled, any Google account can sign in
- **Auth email hook:** ENABLED — branded emails via Resend

## Jobs Pipeline
- **25,694 live jobs** in DB as of 2026-06-06
- Main scraper: `fetch-external-jobs` (Adzuna + Reed + Jooble + ATS boards) — runs 6am/6pm UTC
- Specialist: `scrape-jobs-in-football`, `scrape-film-boards`, `fetch-nhs-jobs`
- Emergency topup: `jobs-emergency-topup`
- Nightly cleanup: `audit-job-links` (2am), `validate-jobs` (23:59)
- Adzuna has a **day-of-week schedule** — only runs for certain industries each day to stay under free quota
- Dedup by URL only (`jobs_url_unique_idx`) — title/company/location constraint was dropped

## Content Pipeline
- `refresh-all-content` → `fetch-rss-news` + `scrape-articles` per industry (6am weekdays)
- `generate-daily-briefings` — 5am weekdays, all 30 industries
- `send-daily-digest` — 7am weekdays

## Cron Jobs (all active)
- `process-email-queue` — every minute
- `fetch-external-jobs` — 6am + 6pm daily
- `generate-daily-briefings` — 5am weekdays
- `send-daily-digest` — 7am weekdays
- `audit-job-links` — 2am nightly
- `validate-jobs` — 23:59 weeknights
- `fetch-rss-news` — every 4 hours
- `scrape-articles` — every 6 hours
- `industry-health-monitor` — every 6 hours
- `whatsapp-daily-digest` — 8am weekdays
- `fetch-industry-events` — 8am Mondays

## Users
- 56 migrated user accounts from old Lovable site
- Many have empty `industry_interests` and `role_preferences` — they never completed onboarding on the old site. Their job feeds will be blank until they go to /onboarding
- Multiple duplicate Andrew Harrison accounts exist (harmless)

## Known Issues / TODOs
1. **Add `A @ 216.198.79.1`** in 123-reg DNS Records — fixes bare domain hitting Lovable
2. **Voxpops video** — currently served from Lovable CDN (`About.tsx`). Needs upload to Supabase Storage
3. **WhatsApp** — needs Twilio keys from partner
4. **Email users** — rewrite `send-account-migration` for two approaches: Google users (just sign in) vs email users (reset password)
5. **Onboarding empty profiles** — many migrated users need to complete /onboarding

## Important Patterns

### AI functions (Gemini)
```typescript
const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
  headers: { Authorization: `Bearer ${Deno.env.get("GEMINI_API_KEY")}` },
  body: JSON.stringify({ model: "gemini-2.5-flash", messages: [...] })
})
// NOTE: Omit tool_choice: "auto" — Gemini doesn't need it
```

### Supabase client in edge functions
```typescript
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("HDYD_SERVICE_JWT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)
```

### Background tasks in edge functions (avoid WORKER_RESOURCE_LIMIT)
```typescript
const work = (async () => { /* long running work */ })();
if (typeof EdgeRuntime !== "undefined" && (EdgeRuntime as any)?.waitUntil) {
  (EdgeRuntime as any).waitUntil(work);
} else {
  await work;
}
return new Response(JSON.stringify({ accepted: true }), { ... });
```

## Workflow Notes
- Woody (woodyharrison100@gmail.com) owns the project and manages credentials
- Andrew Harrison is the partner/boss — his Claude account needs this context
- Always check memory files for latest status before starting work
- Session memory location: `~/.claude/projects/-Users-woodyharrison-Desktop-Howdoyoudo/memory/`
