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
- **~60,000 live jobs** in DB as of 2026-07-20 (was 25,694 on 2026-06-06)
- Main scraper: `fetch-external-jobs` (Adzuna + Reed + Jooble + ATS boards) — runs 6am/6pm UTC
- Specialist: `scrape-jobs-in-football`, `scrape-film-boards`, `fetch-nhs-jobs`
- Emergency topup: `jobs-emergency-topup`
- Nightly cleanup: `audit-job-links` (2am), `validate-jobs` (23:59)
- Adzuna has a **day-of-week schedule** — only runs for certain industries each day to stay under free quota
- Dedup by URL only (`jobs_url_unique_idx`) — title/company/location constraint was dropped

### ⚠️ New ATS tenants (Greenhouse/Lever/Workable/Ashby/Teamtailor) must save EARLY
`fetch-external-jobs` processes one industry at a time and only writes most
sources to the DB in one batch at the *end* of that industry's pass. For
heavy industries (`money`, `health`, `wellness`, `football` — thousands of
existing jobs, deep Adzuna/Reed keyword sweeps) that end-of-pass save can
get killed by `WORKER_RESOURCE_LIMIT` before it's reached, silently
dropping every `GREENHOUSE_TENANTS`/`LEVER_TENANTS`/`WORKABLE_TENANTS`/
`ASHBY_TENANTS`/`TEAMTAILOR_TENANTS` entry for that industry even though
the ATS API itself returns real jobs when checked in isolation. Found live
2026-09-02: Tide, GoCardless, Zopa, Thought Machine, Marshmallow, ZOE,
ClassPass and Numan all silently failed to land until fixed.
**Fix applied:** a "Priority Greenhouse/Lever/Workable/Ashby/Teamtailor
tenants" block now runs early in the per-industry loop (right after
Priority OracleHCM/TalentFunnel, before the Adzuna sweep) and saves
immediately via `safeUpsertJobs`, mirroring the existing early-save pattern
for horse-racing/F1/football direct scrapers. **When adding a new tenant to
any of the five `*_TENANTS` arrays, it's automatically covered by this
priority pass — no extra work needed.** The old late passes are left in
place as a harmless redundant safety net (deduped by URL).
- Lever has an EU data-residency variant (`api.eu.lever.co`) some UK/EU
  companies use instead of the default `api.lever.co` (which 404s for
  them) — set `euRegion: true` on the `LeverTenant` entry if the default
  host 404s (e.g. Numan).

## Content Pipeline
- `refresh-all-content` → `fetch-rss-news` + `scrape-articles` per industry (6am weekdays)
- `generate-daily-briefings` — 5am weekdays, all 30 industries
- `send-daily-digest` — 7am Mon/Fri (was weekdays until 2026-09-02; also restructured to one consolidated email per subscriber covering all their industries, instead of one full email per industry — see the function's own comments)

## Cron Jobs
27 scheduled as of 2026-09-06 (the list below isn't fully reconciled to that —
several daily scrapers added since aren't listed individually yet). Crons live
in the DB (`cron.job`), NOT in migrations — list them with:
`select jobname, schedule, active from cron.job order by jobname;`

- `process-email-queue` — every minute
- `embed-jobs-continuous` — every 15 min (semantic embeddings)
- `extract-job-traits-backfill` — every 10 min ⚠️ see below
- `fetch-external-jobs` — 6am + 6pm daily
- `fetch-cvlibrary-jobs` — 3am daily (affiliate XML feed)
- `score-new-jobs` — 6:30am + 6:30pm
- `compute-curiosity-scores` — 4am daily (composite candidate engagement score, `profiles.curiosity_score` — see below)
- `generate-daily-briefings` — 5am Mon/Thu
- `send-daily-digest` — 7am Mon/Fri (was weekdays until 2026-09-02; also restructured to one consolidated email per subscriber covering all their industries, instead of one full email per industry — see the function's own comments)
- `audit-job-links` — 2am nightly
- `validate-jobs` — 23:59 Sun–Thu
- `refresh-all-content` — every 6h + 6am weekdays
- `industry-health-monitor` — every 6 hours
- `whatsapp-daily-digest` — 8am weekdays
- `fetch-industry-events` — 8am Mondays
- `fetch-industry-videos-weekly` — 7am Mondays
- `scrape-w4mp-jobs-weekly` / `scrape-lgjobs-weekly` — 7am Mondays
- `daily-jobs-report` — 7am daily
- `scrape-jobs-weekly` — 6:30am + 6:30pm daily (see note below — name is legacy, don't go by it)

### ⚠️ `scrape-jobs-weekly` was silently running every hour, not weekly
Found 2026-09-06 while investigating Firecrawl hitting 90% of its monthly
100k-credit quota with 12 days left in the billing period. The cron (jobid
31) was scheduled `0 * * * *` (every hour, ~180x more often than its own
name implies) and had never been added to this doc's cron list — looks
like a leftover from initial testing that was never reconciled to a real
cadence. `scrape-jobs` Firecrawl-scrapes a rolling window of the 463-entry
`CAREER_SOURCES` list (cursor-based, ~30-60 companies/run) every time it
fires, so 24 runs/day was burning credits roughly 12x faster than needed.
Changed to `30 6,18 * * *` (twice daily, alongside `fetch-external-jobs`'s
own rhythm) — at that cadence the full company list still gets swept about
once a week, just spread evenly instead of hourly, for ~1/12th the credit
cost. Monitor `check-firecrawl-usage`-style credit-usage query (see
`provider-usage` function) over the next billing cycle to confirm this
cadence holds up; adjust `cron.alter_job(job_id := 31, schedule := ...)` if
it turns out too sparse or still too much.

### ⚠️ Crons fail SILENTLY — check them
A cron can be `active` and still never work. Check actual HTTP results:
```sql
select status_code, count(*), max(created) from net._http_response
where created > now() - interval '6 hours' group by status_code;
```
- **`401 UNAUTHORIZED_INVALID_JWT_FORMAT`** = the cron's Authorization header
  has an `sb_*`-format key. Crons must use the **service_role JWT** (`eyJ...`),
  same rule as `HDYD_SERVICE_JWT` elsewhere. This silently disabled
  `embed-jobs` from launch until 2026-07-20 — only 306 of 64k jobs had
  embeddings, so semantic matching never actually ran in production.
- **`status_code` NULL** = timeout, no response. Function likely blocks instead
  of returning immediately; use the `EdgeRuntime.waitUntil` pattern.
- Fix a cron's command with `cron.alter_job(job_id := ..., command := ...)`.

## Users
- 56 migrated user accounts from old Lovable site
- Many have empty `industry_interests` and `role_preferences` — they never completed onboarding on the old site. Their job feeds will be blank until they go to /onboarding
- Multiple duplicate Andrew Harrison accounts exist (harmless)

## Candidate Curiosity Score (Employer Talent Pool)
- `profiles.curiosity_score` (0-100, percentile rank) + `curiosity_breadth` (0-5) — a composite engagement signal blending `user_interactions`, `saved_jobs`/`liked_jobs`, `job_tracker_items` pipeline depth, `saved_feed_items`, and `skill_course_progress`/`earned_badges`, each with its own recency decay. Computed daily by `compute-curiosity-scores` for every profile (not just employer-visibility-opted-in ones — a privacy toggle shouldn't silently shift everyone else's percentile; RLS still fully protects who can *read* it).
- Surfaced to employers in `EmployerDashboard.tsx` as a `"{score}% curious"` badge and folded into `computeMatch()` (up to +18 pts).
- **Found and fixed 2026-09-03**: `user_interactions_interaction_type_check` only allowed 4 of the 10 interaction types the app actually logs (`save_company`, `save_role`, `save_industry`, `marketplace_search`, `career_map_role_link`, `career_map_ncs_link` were silently failing every insert since they were added — the error is deliberately swallowed in `trackInteraction()`). Confirmed live via `select interaction_type, count(*) from user_interactions group by interaction_type` returning zero rows for all six before the fix. Widened the constraint; this also means the pre-existing `brand_interactions`/`industry_interactions` counts on `EmployerDashboard.tsx` were undercounting real engagement the whole time, not just the new curiosity score.

## Known Issues / TODOs
1. **Add `A @ 216.198.79.1`** in 123-reg DNS Records — fixes bare domain hitting Lovable
2. **Voxpops video** — currently served from Lovable CDN (`About.tsx`). Needs upload to Supabase Storage
3. **WhatsApp** — needs Twilio keys from partner
4. **Email users** — rewrite `send-account-migration` for two approaches: Google users (just sign in) vs email users (reset password)
5. **Onboarding empty profiles** — many migrated users need to complete /onboarding
6. **Harden cron auth against Supabase's legacy-JWT deprecation** — on 2026-09-01 found Supabase silently started rejecting the project's original auto-generated `anon` key (issued May 2025) for any function with `verify_jwt: true`. Broke 6 crons (`ops-health-alert`, `industry-health-monitor`, `generate-daily-briefings`, `fetch-industry-events`, `refresh-all-content-daily`, `whatsapp-daily-digest`) for ~11 days, silently — pg_cron reported "succeeded" throughout because `net.http_post` only queues the call, it doesn't check the actual HTTP result. Patched by swapping those crons' Authorization headers to `HDYD_SERVICE_JWT` (works today, but is still a JWT that could face the same deprecation later). The durable fix Supabase itself recommends: set `verify_jwt = false` on every cron-triggered function and do the auth check in code instead — see the new pattern below. Not yet applied to the 6 patched functions.
7. **`score-new-jobs-morning`'s Authorization header doesn't match the current `HDYD_SERVICE_JWT`** — found 2026-09-03 while wiring up `compute-curiosity-scores` (same technique as item 6: a manual `net.http_post` test using that cron's stored header got `401 Unauthorized` from a fresh function that checks `HDYD_SERVICE_JWT` in code, while `industry-health-monitor-6h`'s header worked correctly). Not yet confirmed whether `score-new-jobs` itself is actually broken (it may not do its own bearer check at all, per item 6's "not yet applied to the 6 patched functions" note — a mismatched header would only matter if the function checks it) — needs investigation, not assumed. Check `net._http_response` for `score-new-jobs`'s actual status codes before concluding anything is silently failing.

## Important Patterns

### Edge function auth — cron-triggered functions
Supabase is deprecating "legacy" JWT-format API keys project-wide, and any
function with `verify_jwt: true` in its deploy config is at risk of a future
key getting silently rejected (`UNAUTHORIZED_LEGACY_JWT`) — pg_cron won't
surface this as a failure, since `net.http_post` only confirms the call was
queued, not that it succeeded. `fetch-external-jobs` never broke because it
already deploys with `verify_jwt: false`.

**For every new cron-triggered function:**
1. Deploy with `verify_jwt: false` (add `[functions.<name>] verify_jwt = false`
   to `supabase/config.toml`, or pass `--no-verify-jwt` on deploy) — this
   takes Supabase's own key-rotation risk out of the picture entirely.
2. Check auth yourself in the function's own code instead, e.g.:
   ```typescript
   const auth = req.headers.get("Authorization");
   if (auth !== `Bearer ${Deno.env.get("HDYD_SERVICE_JWT")}`) {
     return new Response("Unauthorized", { status: 401 });
   }
   ```
   (`fetch-external-jobs` itself skips even this in-code check today — that's
   a pre-existing gap, not the pattern to copy. New functions should add it.)

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

## Design Rules — ALWAYS FOLLOW

- **Every UI change must work on both mobile and desktop** — test mentally for both before committing
- Use Tailwind responsive prefixes (`md:`, `lg:`) to create layouts optimised per screen size, not just scaled down
- Mobile first — base styles are mobile, `md:` overrides for desktop
- Never hide important content on mobile unless there's a mobile-specific alternative
- Touch targets must be large enough on mobile (min 44px)

## Workflow Rules — IMPORTANT

### Verifying types — use `npm run typecheck`, NOT bare `tsc --noEmit`
The root `tsconfig.json` is solution-style (`"files": []` + project references), so
`npx tsc --noEmit` type-checks **nothing** and always exits 0 — it is not a real gate.
Always verify with `npm run typecheck` (`tsc -b`, which builds the app + node projects).
`npm run build` does NOT run tsc, so it won't catch type errors either.
Regenerate DB types after schema changes:
`SUPABASE_ACCESS_TOKEN=<token> npx supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts`

### At the start of EVERY session (do this automatically, without being asked):
1. Run `git pull` to get the latest code
2. Read `SESSION_LOG.md` to see what the other person did last
3. Greet the user by name and give a 3-bullet summary of: what was done last session, what's pending, and a suggested first task

### At the end of EVERY session:
1. Commit and push all changes
2. Update `SESSION_LOG.md` with what you did and what's left — be specific
3. Push the log update

### Branching strategy
- **Both Woody and Andrew work on `main`** — changes deploy to the live site immediately
- Never both work at the same time — check SESSION_LOG.md first to see if the other is active
- If you see the other person's session was recent, check what files they changed before starting
- Never both edit the same file at the same time

### Git is fully allowed — no permission prompts
Commits, pushes, branch switches — all pre-approved in `.claude/settings.json`

### People
- **Woody** (woodyharrison100@gmail.com) — owns project, manages credentials
- **Andrew Harrison** — partner, works on `andrew` branch
- Credentials are in Woody's local memory file — Andrew needs them shared privately

### Session memory (Woody's machine only)
`~/.claude/projects/-Users-woodyharrison-Desktop-Howdoyoudo/memory/`
