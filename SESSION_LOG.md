# Session Log

This file is updated by Claude at the start and end of every session.
**Always read this before starting work. Always update it when finishing.**

---

## 2026-07-03 — Andrew (main branch, new laptop setup)

### What was done
- **New machine setup**: repo was already fully cloned and configured (not actually a blank laptop) — found it mid-work with uncommitted changes and 2 unpushed local commits.
- **Fixed git remotes**: only `origin` existed, pointing at the main repo with a placeholder token (`ghp_YOURREALTOKENHERE`) that would never authenticate. Installed `gh` CLI via Homebrew, ran `gh auth login` (device flow) as `andrewandtristia-max`, then `gh auth setup-git` so git uses the `gh` credential helper (no raw tokens in remote URLs). Renamed `origin` → `howdoyoudo` (main repo, correct) and added a fresh `origin` pointing at the mirror.
- **Mirror repo (`origin` → `woody-versus/https-howdoyoudo-group`) is broken** — returns 404 for `andrewandtristia-max` even authenticated. The GitHub user `woody-versus` exists but has 0 public repos. Needs Woody to check whether the repo still exists/was renamed, and to add Andrew as a collaborator if it's private. **Origin push is not working — only `howdoyoudo` is currently syncing.**
- **Caught up on a backlog of undocumented commits** — noticed `SESSION_LOG.md` hadn't actually been updated since June 24 despite 7 commits landing since then on both branches (this entry retroactively covers them):
  - Andrew (local, unpushed until today): `c0f3e4c` fixed Boohoo Group → Debenhams Group careers URL; `547dcbf` added mailing-list subscribe/unsubscribe toggle to `/admin/users` (via `suppressed_emails` table).
  - Woody (pushed this morning, ~10:24–11:01am): sent the June 2026 founding-member email broadcast; nav label tweaks (added then reverted exclamation mark on "Inspire"); added behavioural industry affinity to job scoring; shipped Tinder-style swiping in Howdy Jobs (`MyJobs.tsx` rewrite + `useTrackInteraction.ts` + new `liked_jobs` migration).
  - Confirmed with Andrew that Woody was done for the session, then merged cleanly (no file overlap) and pushed to `howdoyoudo`.
- **Committed and pushed two of Andrew's own in-progress fixes** that were sitting uncommitted:
  - Purplebricks/Strike careers link correction across 8 industry pages (Strike was acquired by Purplebricks).
  - `fetch-external-jobs`: fixed cross-industry job "ownership stealing" (upsert-by-url was letting a later-run industry silently reassign a job already claimed by another industry, e.g. health stealing physiotherapy's jobs) + added `PASSION_SIGNAL` regex relevance filtering to `fetchPassionJobs` (Adzuna/Reed loose keyword search was returning unrelated jobs for passion searches like "tennis club"). **This was already deployed to production before being committed** — deploy happened first while verifying Supabase CLI access, commit followed after review.
- Verified Supabase CLI deploy access works (`SUPABASE_ACCESS_TOKEN` + `supabase functions deploy`), confirmed `.env` already has correct `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` matching `client.ts`, ran `npm install` and `npm run dev` — site loads correctly, no Supabase-related console/network errors (only pre-existing `validateDOMNesting` warnings in `RolesGrid` and a blocked Cloudflare analytics beacon, both unrelated to setup).

### Current state
- Live at: www.howdoyoudo.co.uk, deployed through commit `d5b5abc`
- `howdoyoudo` remote fully working (push access confirmed) via `gh` credential helper — no token stored in remote URL
- `origin` (mirror) remote added but **not working** — 404, needs Woody
- Local dev environment fully verified (npm install, npm run dev, Supabase connectivity all working)

### Left for next session / Woody
- **Fix mirror repo access** — check https://github.com/woody-versus/https-howdoyoudo-group/settings/access (or confirm the repo still exists under that name) and add `andrewandtristia-max` as collaborator, or tell Andrew the correct URL.
- Everything else pending from the June 24 session is still outstanding (DNS A record, WhatsApp Twilio keys, Voxpop video migration, tennis job cleanup) — see below.

---

## 2026-06-24 — Woody (main branch)

### What was done
- **Fixed tennis job quality (3 root causes)**:
  1. **Adzuna had no signal filter for tennis** — all Adzuna results for tennis keywords were accepted. Added `REQUIRED_SIGNAL.tennis` (requires tennis term in title/description) + `COMPANY_ALLOWLIST.tennis` (LTA/AELTC/ATP/WTA/ITF pass regardless of title). Frieze, Bedruthan Hotel, MARI Group etc. now blocked.
  2. **Removed "Wimbledon" from `INDUSTRY_KEYWORDS.tennis`** — it's a London suburb (SW19) so Reed/Jooble were returning "Finance Manager | Wimbledon" and "School Teachers | Wimbledon" as location-tagged results.
  3. **Removed bare `wimbledon` from `INDUSTRY_SIGNALS.tennis` regex** — jobs with "Wimbledon" in title as a location suffix (e.g. "Audit Assistant | Wimbledon") were passing the signal check. Now only `all england club`, `aeltc`, `LTA`, `ATP tour` etc. trigger the tennis signal.
  - `EMPLOYER_INDUSTRY_OVERRIDES` still has `wimbledon` for company-name matching — correct, since "Wimbledon" as a company name is the tennis club.
  - Deployed updated `fetch-external-jobs` to Supabase and triggered a fresh tennis rescrape.
  - **Note:** Dirty tennis jobs (Frieze, Wimbledon-suburb, Bedruthan) still in DB — need manual SQL `DELETE FROM jobs WHERE industry='tennis'` in Supabase dashboard, then wait for rescrape to finish.

- **Added 15 real tennis events** to `industry_events` table (industry=`tennis`):
  - **Tournaments**: Wimbledon 2026 (Jun 29–Jul 12), Queen's Club Championships (Jun 13–21), Eastbourne International (Jun 20–27), US Open (Aug 24–Sep 6), Laver Cup, ATP Finals (Turin, Nov 8–15), WTA Finals
  - **Conferences**: Leaders Sport Business Summit (Oct 6–8, London), SportsPro Live, ITF World Tennis Conference
  - **Awards**: LTA Inspiration Awards
  - **Programmes**: LTA Coach Education Courses, ITF Officiating Certification, Tennis Foundation Inclusion Series
  - **Talk**: Hawk-Eye Technology Talks
  - All have real URLs. Industry field set to `"tennis"` (slug, not display name).

### Pending
- **DELETE dirty tennis jobs** — run `DELETE FROM jobs WHERE industry='tennis'` in Supabase SQL editor, then re-trigger the scraper. The fix is deployed, just needs a clean slate.
- **Upload `email-icon-tennis.png`** to Supabase Storage `email-assets` bucket
- **Replace `series-tennis.jpg`** with proper scattered-style illustration (current is a structured icon grid, mismatched style vs other cards)
- **DNS bare domain fix** — Add `A @ 216.198.79.1` in 123-reg
- **WhatsApp** — needs Twilio keys from partner
- **Voxpop video** — move from Lovable CDN to Supabase Storage

---

## 2026-06-19 — Woody (main branch)

### What was done
- **Added 3 new industries: Building, Fixing, Delivery** — full first-class integration across the entire platform:
  - **Frontend**: New pages (`Building.tsx`, `Fixing.tsx`, `Delivery.tsx`) each with Watch/Listen/Read/Who/Plan/Attend/Learn/Jobs tabs, full career maps, company profiles (10-12 per industry), curated podcast grids, real article fallbacks, and jobs links to Marketplace
  - **Routes**: Added lazy imports + Routes in `App.tsx` for `/building`, `/fixing`, `/delivery`
  - **SeriesGrid**: Added 3 cards with descriptions to the homepage grid (alphabetical order maintained)
  - **Onboarding**: Added to INDUSTRIES array
  - **Marketplace**: Added to industries filter chip array
  - **industryIcons.ts**: Added image imports and INDUSTRY_ICONS entries
  - **industry-videos.ts**: 4 curated YouTube clips per industry (careers, day-in-life, explainer content)
  - **Industry images**: Placeholder `.jpg` files created (need replacing with real photography)
  - **Backend functions deployed**: `industry-registry.ts` (synonyms + job baselines), `generate-daily-briefings`, `fetch-rss-news`, `scrape-articles`, `refresh-all-content`, `send-daily-digest`, `understand-me` — all 6 deployed to Supabase
  - Companies covered: Balfour Beatty, Kier, Mace, Taylor Wimpey, Vistry, Wates, Willmott Dixon (Building); British Gas, HomeServe, Mitie, Pimlico Plumbers, Octopus Energy (Fixing); DPD, Evri, Royal Mail, Amazon Logistics, Ocado Logistics, DHL, Wincanton (Delivery)

### Pending
- **Replace placeholder hero images** — series-building.jpg (copy of farming), series-fixing.jpg (copy of cars), series-delivery.jpg (copy of travel) need real photography
- SXSW voxpop 1-5 need proper titles/descriptions from Woody
- Short Stories videos broken on Safari (10-bit H.264 issue — video-2316/2317/2318)
- DNS fix — Add `A @ 216.198.79.1` in 123-reg for bare howdoyoudo.co.uk
- WhatsApp — needs Twilio keys from partner
- Adzuna XML feed — awaiting their reply

---

## 2026-06-16 — Woody (main branch)

### What was done
- **Crons restarted on Pro plan** — toggled all 13 cron jobs in Supabase Integrations → Cron (set timeout to 5000ms each). pg_cron was dead since June 12 due to bandwidth throttling. Now on Pro plan, should stay stable.
- **Cleared cron run history** — `cron.job_run_details` table was bloated, causing overview to fail. Deleted rows older than 1 day via dashboard prompt.
- **Manually sent today's digest** — triggered `send-daily-digest?confirm_full_send=true` to all 45 subscribers (briefings existed for today but hadn't been emailed). Confirmed function works.
- **DB migration: skill_courses tables** — ran Andrew's `skill_courses`, `skill_course_lessons`, `skill_course_questions`, `skill_course_progress` tables + indexes + RLS policies via Supabase API. Tables were already present (Andrew had run it).
- **Deployed `generate-skill-course`** — Andrew's new edge function, deployed on his request.
- **Deployed `blend-roles` (x2)** — deployed twice at Andrew's request; second deploy picked up schema reorder fix (entry_routes before roles so Gemini can't close JSON early).
- **Videos page title** — changed "Watch & learn." to "Watch."
- **Farming — Groundswell event** — inserted Groundswell Agriculture 2026 (25–26 Jun, Hertfordshire) into `industry_events` table for farming industry.
- **Farming — Only Farmers (Who tab)** — added Only Farmers card at top of Who? tab with their logo (uploaded to Supabase Storage) linking to onlyfarmers.co.uk/#about.
- **Farming — Clarkson's Farm (Watch tab)** — added "Shows Worth Watching" section with Clarkson's Farm card (TVMaze poster image, links to Amazon Prime).
- **Farming — World According to Kaleb** — added second show card below Clarkson's Farm with Amazon promo image, links to Amazon Prime.
- **Farming — Unpacking on Screen video** — constrained to `max-w-2xl` so it doesn't dominate the page.
- **Adzuna XML feed partnership** — Adzuna reached out about providing an XML feed. Drafted reply. If they say yes, I'll build an ingest edge function (download feed → map fields → upsert jobs). Would replace ~90 API calls per refresh and potentially 10x job count.

### Current state
- Live at: www.howdoyoudo.co.uk
- Crons active on Pro plan (all 13, 5000ms timeout)
- 45 subscribers received today's digest
- Farming page has Shows, Only Farmers, and Groundswell event added
- generate-skill-course and blend-roles both live

### Left for next session
- **Adzuna XML feed** — awaiting their reply. If confirmed, build `ingest-adzuna-feed` edge function. Ask them: does feed include redirect_url? Any CPC terms?
- **Short Stories videos broken on Safari** — video-2316/2317/2318 (10-bit H.264). Need re-encode or YouTube swap.
- **DNS fix** — Add `A @ 216.198.79.1` in 123-reg for bare howdoyoudo.co.uk
- **WhatsApp** — needs Twilio keys from partner
- **Inbox layout redesign** (parked)
- **BBC, Universal Pictures, Tails.com** — ATS integrations (Andrew)
- **Re-run Understand Me** for existing users to generate intersectionIdeas (Andrew)

---

## 2026-06-15 — Woody (main branch)

### What was done
- **New HDYD Explainer Film** — compressed 511MB source to 11MB web-optimised H.264, uploaded to Supabase Storage. Replaced old promo video in Hero (desktop native player), About Us, and The Show page. About + The Show now use YouTube embeds (bandwidth saving). Hero stays native `<video>` for full controls.
- **Strapline update** — Hero: "Start with what you love. And see where it takes you." (love. in green)
- **The Show second video** — set to HDYD promo (youtu.be/NrYsqaJRqFo)
- **Gallery photos** — 8 new behind-the-scenes shoot photos uploaded and added to The Show gallery
- **Voxpops** — 5 TikTok-style clips compressed (686MB → 96MB), uploaded to new `voxpops` Supabase bucket, added to /videos page in vertical 9:16 grid (2-col mobile, 5-col desktop)
- **Howdy Jobs Saved tab** — added Saved to bottom nav with badge count; save toast shows "View saved" button
- **Supabase upgraded to Pro** — was hitting bandwidth limit (14.7GB vs 5.5GB free tier). Switched all video embeds to YouTube to stop bandwidth drain. Upgraded to Pro plan.
- **Crons restarted** — pg_cron was silently dying due to Supabase fair-use throttling (happened June 5, 9, 12). Root cause: bandwidth overuse triggering partial project restriction. Fixed by upgrading to Pro + toggling crons back on in dashboard. Manually triggered refresh-all-content and generate-daily-briefings.
- **Skills England data deployed** — triggered sync-skills-england for all 36 matched roles in batches. 108 skills landed in role_skills table.

### Current state
- Live at: www.howdoyoudo.co.uk
- Supabase on Pro plan — crons should now run reliably
- New explainer video live across Hero, About, The Show
- 5 voxpop clips live on /videos page
- Skills England data populated (108 skills across 36 roles)

### Left for next session
- **Verify crons all active** — check Supabase Dashboard → Database → Cron Jobs, all ~12 should be toggled on
- **Short Stories videos broken** — video-2316/2317/2318 show broken play icon on Safari (10-bit H.264 encoding). Need source files re-encoded to 8-bit H.264 or replace with YouTube embeds
- **DNS fix** — Add `A @ 216.198.79.1` in 123-reg DNS for bare howdoyoudo.co.uk
- **Inbox layout redesign** (parked) — unified message list with type badges, two-pane desktop view
- **WhatsApp** — needs Twilio keys from partner
- **Voxpops video in About.tsx** — old Lovable CDN reference fully removed (done), but verify no other Lovable URLs remain in codebase
- **BBC, Universal Pictures, Tails.com** — ATS integrations pending (Andrew)

---

## 2026-06-14 — Andrew (main branch)

### What was done
- **Cross-industry intersection roles** — major new feature across 5 files:
  - `src/data/intersection-roles.ts` (NEW) — 80 curated role combinations (Football × Fashion → Kit Designer, etc.) with skill tags, keywords for job matching, and utility functions
  - `src/pages/MatchMe.tsx` — replaced "Unexpected Ideas" with new **"Where your worlds collide"** section: dashed lime cards showing AI + static intersection role suggestions with Blend badge, reason, example companies, and Find Jobs links
  - `src/pages/MyJobs.tsx` — added +20pt intersection boost when job title matches cross-industry keywords (e.g. Kit Designer scores higher for Football+Fashion users)
  - `supabase/functions/understand-me/index.ts` — extended prompt + output schema to generate `intersectionIdeas` array; seeds AI with 10 example blends
  - `src/lib/understand-me.ts` — added `UnderstandMeIntersectionIdea` interface + field on `UnderstandMeResults`
- **Deployed `understand-me` edge function**
- Pushed all changes to origin

### Woody's changes (rebased in from remote)
- Hero strapline updated: "Start with what you love. And see where it takes you."
- About.tsx and The Show: replaced old promo video with new HDYD Explainer Film V2
- HowdyJobs: added Saved tab to bottom nav + toast link on save

### Left for next session
- **Verify MatchMe UI** — "Where your worlds collide" section not yet visually tested in browser. Run dev server and check `/match-me` for a user with 2+ industry interests
- **Homepage video (pending ffmpeg)** — 511MB file needs compression before upload. `brew install ffmpeg` on user's machine first, then: `ffmpeg -i "HDYD Explainer Film 2 V2 (Subtitles).mp4" -vcodec libx264 -crf 28 -preset fast output.mp4`
- **Integrate BBC (SuccessFactors)** — detected in ATS scan, not yet scraped
- **Integrate Universal Pictures (SmartRecruiters)** — needs company/org ID
- **Integrate Tails.com (Teamtailor)** — no Teamtailor scraper built yet
- **DNS fix** — Add `A @ 216.198.79.1` in 123-reg DNS for bare domain
- **Re-run Understand Me** for existing users to generate `intersectionIdeas` (old results won't have this field)

---

## 2026-06-13 — Andrew (main branch)

### What was done
- **Built `detect-ats-boards` edge function** — scans career URLs one company at a time, detects ATS type from URL patterns + page fetching, saves to `ats_detection_results` table
- **Created `scripts/run-ats-detection.sh`** — local runner that iterates 158 companies and calls the edge function sequentially
- **Ran full ATS scan** — 43/158 companies detected. New boards found:
  - Charlotte Tilbury → Workable (`charlotte-tilbury`)
  - On Running → Greenhouse (`onrunning`)
  - Molson Coors → Workday (`molsoncoors.wd5`)
  - Pfizer UK → Workday (`npfizer.wd5`)
  - Johnson & Johnson → Workday (`jj.wd3`)
  - BBC → SuccessFactors (not yet integrated)
  - Universal Pictures → SmartRecruiters (not yet integrated)
  - Tails.com → Teamtailor (not yet integrated)
- **Added new boards to scraper** — Molson Coors, Pfizer, J&J (Workday) + On Running (Greenhouse) deployed to fetch-external-jobs
- Deployed updated `fetch-external-jobs` function

### Current state
- ATS scan results stored in `ats_detection_results` table
- 4 new employer boards active in scraper

### Left for next session
- **Integrate BBC (SuccessFactors)** — needs SuccessFactors API integration
- **Integrate Universal Pictures (SmartRecruiters)** — add company ID to SmartRecruiters scraper
- **Integrate Tails.com (Teamtailor)** — build Teamtailor scraper or use their jobs feed
- **Re-run ATS scan with more companies** — many "not detected" companies need Firecrawl to detect JS-rendered career pages. Check `FIRECRAWL_API_KEY` is set in Supabase secrets
- **Verify new Workday tenants** — confirm Molson Coors/Pfizer/J&J are returning UK jobs
- **URGENT: Fix pg_cron silently stopping** — see Woody's note
- Fix howdoyoudo.co.uk bare domain — add A record `@ → 216.198.79.1` in 123-reg DNS

---

## 2026-06-12 — Woody (main branch)

### What was done
- **Regenerated Supabase access token** — old one (sbp_85b5...) was expired; new one saved to memory
- **Ran DB migration** — applied `20260611000000_skills_england.sql`: created `role_se_mapping`, `role_skills`, `user_skill_ratings` tables + `se_synced_at` column on role_metadata
- **Deployed `sync-skills-england` edge function** — Andrew had built it; now live on Supabase
- **Set `SKILLSENGLAND_API_KEY` secret** — value from Andrew's notes now stored as Supabase secret
- **Triggered initial sync** — `sync-skills-england` running in background to seed all roles; will take ~5-10 mins to complete
- **Task 5: Badge → skill ratings** — `grade-badge-quiz` now auto-upserts `user_skill_ratings` (rating=4, evidenced=true, source=`badge:{industry}`) for all skills in that industry's roles when badge is passed. Deployed.
- **Pulled Andrew's 19 commits** — lots of new work: Indeed/Glassdoor job sources, RapidAPI, Community page mentors, Member Talks carousel, Show gallery updates, Skills nav reordering

### Current state
- Skills England sync running (check `role_se_mapping` row count — should be 50+ when done)
- Badge-to-skills pipeline live
- All Andrew's June 12 changes integrated

### Left for next session
- **Verify sync completed** — check `role_se_mapping` and `role_skills` row counts in Dashboard; re-trigger if 0 rows after 15 mins
- **URGENT: Fix pg_cron silently stopping** — happens every few days (June 5, June 9 documented). No permanent fix yet
- Fix howdoyoudo.co.uk bare domain — add A record `@ → 216.198.79.1` in 123-reg DNS
- Fix old Lovable references in `send-daily-digest` — lines 92, 1244, 2721 still reference old project/domain
- Fix `industry-health-monitor` cron URL (still points to old Lovable Supabase project)
- Cancel Lovable HDYD project (keep account — Andrew uses for other projects)
- Safari video fix — vox pop videos still fail on desktop Safari (10-bit H.264); re-encode needed
- Twilio keys for WhatsApp
- Voxpops video (About page) — still served from Lovable CDN

---

## 2026-06-11 — Andrew (main branch) [continued session]

### What was done
- **Diagnosed and restarted stalled daily briefings** — Supabase cron silently stopped again (same issue as June 5). Content pipeline stopped updating after June 9 08:00 UTC. Manually regenerated all 28 industry briefings. Fixed phrase-filter over-blocking bug in `generate-daily-briefings` and deployed.
- **Skills England integration (Tasks 1-4 complete):**
  - DB migration: `role_se_mapping`, `role_skills`, `user_skill_ratings` tables + `se_synced_at` column
  - `sync-skills-england` edge function: SE API → Jaro-Winkler matching → Firecrawl KSB scraping → Gemini categorisation
  - `RoleSkillsBlock` component injected into all role Plan tabs (domain bars, skill chips, readiness card, inline 1-5 rating)
  - `useRoleSkills` and `useSkillGap` hooks
  - `/skills-passport` page: now has 4 tabs — Badges (existing), Skills Assessment, Skill Gaps, Career Passport
  - `SiteHeader`: Skills Assessment + Skill Gaps now link to live tabs (removed "Coming Soon")
  - SE logo attribution on all relevant pages (licence requirement)

### Current state
- All 28 briefings live for today
- Skills England frontend fully built; data will populate once `sync-skills-england` is deployed and run
- Skills passport tabs accessible at `/skills-passport?tab=assessment|gaps|passport`

### Left for next session / Woody
- **Deploy `sync-skills-england` and add `SKILLSENGLAND_API_KEY` secret** — value: `A7E7211152B54E2AA2F720C97D8C70F7`. Command: `SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy sync-skills-england --project-ref wgistckxxbfpsuulbswr` then set the secret in Dashboard → Settings → Secrets. Run the function once to seed data.
- **Run the DB migration** — apply `supabase/migrations/20260611000000_skills_england.sql` if not auto-applied (check Supabase Dashboard → Database → Migrations).
- **Task 5 (pending): Badge → skill ratings linkage** — in `grade-badge-quiz` edge function, when a badge is earned auto-upsert `user_skill_ratings` rows for that industry's domain skills with `evidenced=true, source='badge:{industry}'`.
- **URGENT: Check Supabase cron health** — pg_cron silently stops every few days (June 5, June 9). Add monitoring alert or fix permanently.
- Add `A @ 216.198.79.1` DNS record in 123-reg (fixes bare howdoyoudo.co.uk)
- Twilio keys needed for WhatsApp
- Voxpops video needs permanent Supabase Storage upload (currently Lovable CDN)

---

## 2026-06-07 — Woody (main branch)

### What was done
- Added 6 gallery photos to The Show page (uploaded to Supabase Storage: the-show/gallery/)
- Added 3 vox pop videos to The Show page (compressed from 2.5GB MOV → 24MB MP4s, uploaded to the-show/videos/)
- Fixed video player — switched from link to native video element; videos play inline now
- Fixed 10-bit H.264 encoding bug (Safari incompatible) — re-encode was started but killed mid-session, needs finishing
- Added "Coming Soon" badge to The Show in nav dropdown
- Switched howdoyoudo.group → redirects to www.howdoyoudo.co.uk (308 via Vercel + DNS updated in 123-reg)
- Supabase access token was expired — regenerated and shared with Andrew
- **Fixed daily digest emails** — cron was missing `?confirm_full_send=true`, safety gate silently blocked every send since day one. Now fixed.
- Found industry-health-monitor cron still pointing to OLD Lovable project — not yet fixed

### Current state
- howdoyoudo.group and www.howdoyoudo.group redirect to www.howdoyoudo.co.uk
- Daily digest cron fixed
- Videos on The Show page load but may still fail on desktop Safari (re-encode incomplete)

### Left for next session
- Finish video re-encode for Safari (10-bit → 8-bit H.264)
- Fix howdoyoudo.co.uk bare domain — add A record in 123-reg
- Fix industry-health-monitor cron — URL points to old Lovable project
- Cancel Lovable HDYD project (keep account — Andrew uses it for other projects)

---

## 2026-06-09 (session 3) — Andrew (main branch)

### What was done
- **Fixed apprenticeship name display** — Added `cleanApprName()` helper to `RoleNCSPanel.tsx` that strips leading prose filler from CareerPilot apprenticeship names. Some roles (nurse, bartender, hotel-manager) had names stored as full sentences like "You might be able to apply for a Registered Nurse Level 6 Degree Apprenticeship" — the helper reduces these to just "Registered Nurse". Handles multiple patterns: "You might/may/can/could be able to apply for a...", "apply for a...", "to do a...", "through a...", "complete a...". Also strips any trailing " Level N Apprenticeship" if it leaked into the name. Client-side fix so it corrects all already-scraped data with no re-scrape needed.
- Committed latest `scrape-careerpilot/index.ts` (was deployed but not in git since 8e1ec10)

### Current state
- Apprenticeship cards on all role pages now show clean professional titles
- 35 roles have CareerPilot data; entry routes, T Levels, A levels, salaries all correct

### Left for next session / Woody
- **Career progression** — CareerPilot writes prose not lists; all `cp_career_progression` = null. Skip for now or do a one-off Gemini pass.
- **Related roles** — `cp_related_roles` = null for most roles; section parser may not be finding the right format.
- Trigger `scrape-careerpilot` again for any roles that need refreshing (it's idempotent)
- Check Supabase cron health — all 14 crons should be active
- Add `A @ 216.198.79.1` DNS record in 123-reg (bare domain fix)
- Twilio keys for WhatsApp
- Voxpops video permanent upload to Supabase Storage

---

## 2026-06-06 — Woody (main branch)

### What was done
- Full audit of all edge functions and crons — all healthy
- Fixed Adzuna API key bug (`ADZUNA_APP_KEY` → `ADZUNA_API_KEY`) — was broken since day one
- Fixed `fetch-industry-events` and `scrape-jobs-in-football` WORKER_RESOURCE_LIMIT crashes
- Connected `www.howdoyoudo.co.uk` to Vercel — site is live
- Updated Supabase Auth site_url to `www.howdoyoudo.co.uk`
- Fixed promo video and voxpops video (Supabase Storage / Lovable CDN)
- Fixed onboarding blank screen bug after completion
- Fixed login page for migrated users who need to reset password
- Imported 26,918 jobs from Lovable CSV export — now 25,694 live jobs
- Switched 123-reg nameservers from GoDaddy to 123-reg (fixes bare domain hitting Lovable)
- Sped up MyJobs page — now filters by industry at DB level instead of client-side
- Added CLAUDE.md and SESSION_LOG.md for handoff between Woody and Andrew

### Current state
- Live at: www.howdoyoudo.co.uk
- 25,694 live jobs
- All 68 edge functions active, all 14 crons running

### Left for next session / Andrew
- Add `A @ 216.198.79.1` DNS record in 123-reg (fixes bare howdoyoudo.co.uk)
- Twilio keys needed for WhatsApp
- Many migrated users have empty profiles — direct them to /onboarding
- Voxpops video needs permanent Supabase Storage upload (currently Lovable CDN)
- Email users migration notice (send-account-migration needs rewrite)

---

## 2026-06-09 (session 2) — Andrew (main branch)

### What was done
- **New OG image** — replaced old rounded rectangle with hand-drawn wobble speech bubble matching the site's SVG bezier path from Hero.tsx. PIL bezier approximation, mascot left, logo inside bubble, green underline + decorative dots. Image now served from howdoyoudo.co.uk (v=8) not old Lovable CDN.
- **CareerPilot data enrichment** — scraped ~35 job profiles from careerpilot.org.uk (UK govt site closing 2026). New `scrape-careerpilot` edge function uses Firecrawl to parse:
  - Named apprenticeship routes with Level badges (L2/L3/L4/L6) and durations
  - T Levels (e.g. "T Level in Catering", "T Level in Digital Production")
  - A level requirements per route
  - BTEC routes where present
  - Salary min/max ranges (preferenced over NCS single figures)
  - Work environment descriptions
  - Career progression and related roles (parsers in place, may need refinement)
- New migration `20260609111938_careerpilot_columns.sql` adds `cp_*` columns to `role_metadata`
- Updated `RoleNCSPanel.tsx` to show T Level cards with tooltip, colour-coded apprenticeship cards (L2=blue, L3=green, L4=yellow, L6=purple), career ladder (horizontal desktop / numbered vertical mobile), related role chips, work environment badge
- Fixed `20260608232152_role_metadata.sql` policy creation to use idempotent DO block (was failing on `db push` because table already existed)

### Current state
- 35 roles scraped — entry routes (apprenticeships, T Levels, A levels, salary ranges) all populating
- Career progression text parsing needs improvement (CareerPilot writes prose not lists)
- `/roles/chef` shows: 4 apprenticeship routes, T Level in Catering, A level route, salary £22k–£40k, work environment
- `/roles/nurse` shows: Registered Nurse L6 degree apprenticeship, T Level in Adult Nursing, "2–3 A levels inc. science"
- `/roles/it-technology` shows: 5 apprenticeships (L3–L7), T Level in Digital, salary £30k–£75k

### Left for next session / Woody
- **Career progression** — CareerPilot writes prose ("from commis chef... to sous chef...") not lists. Could either: (a) run a one-off Gemini extraction pass on the stored text, or (b) just skip progression ladder for now since entry routes are the bigger value
- Trigger `scrape-careerpilot` again if more roles need refreshing (it's idempotent)
- Check Supabase cron health — all 14 crons should be active (they silently stopped on June 5)
- Add `A @ 216.198.79.1` DNS record in 123-reg (fixes bare howdoyoudo.co.uk)
- Twilio keys needed for WhatsApp
- Voxpops video needs permanent Supabase Storage upload

---

## 2026-06-09 — Andrew (main branch)

### What was done
- **Fixed Career Map role resolver bug** — "AI data analyst" was routing to "teaching assistant" due to regex alternation precedence: `/\bteaching assistant|ta\b/i` matched "ta" in "data". Fixed by wrapping alternatives: `/\b(teaching assistant|ta)\b/i`. Same fix for bartender/barback/mixologist alias.
- **Fixed King's Trust events showing fabricated dates** — Perplexity was hallucinating specific dates for rolling programmes. Two-layer fix: (1) `fetch-industry-events` now force-sets `event_type="programme"` and `starts_on=null` for any kingstrust.org.uk URL; (2) `EventsSection.tsx` renders programme-type events in a separate "Programmes & opportunities" section with "Rolling" badge instead of a date box. Cleared 12 DB records with bad dates.
- **Implemented NCS data integration** — Scraped National Careers Service profiles for 57 role slugs. New `role_metadata` table stores salary starter/experienced, hours/week, work pattern, entry routes, tasks, skills. New `scrape-ncs-roles` edge function uses Firecrawl. New `RoleNCSPanel.tsx` component shows in the Plan tab on all role pages.
- **Fixed CV Builder PDF crash** — `addLogoSafe` const was called before its declaration (temporal dead zone ReferenceError). Moved definition before first use. Fixed PDF generation for users with 1-2 education entries.
- **Fixed CV Builder LinkedIn not saving** — `linkedinUrl` was missing from the `profileBuilder` JSON blob in `saveProfile()`. Added field and hydration.
- **Fixed double header on /videos page** — Added `/videos` to `skipRoutes` in `GlobalHomeButton.tsx`.
- **Refreshed stale industry videos (1-week gap)** — `fetch-industry-videos` wasn't running (cron stopped). Updated search queries from single generic query to two targeted angles per industry: (1) "day in the life [role] UK" and (2) "[industry] business careers UK". Function now runs both queries and deduplicates before storing. Deployed and triggered full 30-industry refresh.
- **Fixed stale news feed (3-day gap)** — `breaking_news`, `articles`, and `daily_briefings` tables all stopped updating on June 5 (Supabase cron failure). Manually triggered `refresh-all-content` and `generate-daily-briefings` to repopulate. Fixed service key issue in `fetch-rss-news` and `scrape-articles` — both were using `SUPABASE_SERVICE_ROLE_KEY` instead of `HDYD_SERVICE_JWT` (project standard). Redeployed both functions.

### Current state
- Live at: www.howdoyoudo.co.uk
- Content pipeline manually re-triggered and refreshed (news, articles, briefings all updated today)
- Career map resolver working correctly
- King's Trust events show as rolling programmes, no fabricated dates
- NCS data populated for ~57 roles — visible on Role Plan tab
- CV Builder PDF working, LinkedIn saves correctly
- /videos page has single header

### Left for next session / Woody
- **Check Supabase cron health** — all 14 crons should be active in Dashboard → Database → Cron Jobs. The 3-day gap suggests pg_cron silently stopped. Worth reviewing and re-enabling if any are paused.
- Add `A @ 216.198.79.1` DNS record in 123-reg (fixes bare howdoyoudo.co.uk → still may hit old Lovable)
- Twilio keys needed for WhatsApp
- Voxpops video needs permanent Supabase Storage upload (currently Lovable CDN)
- Email users migration notice (send-account-migration needs rewrite for Google vs email users)
- NCS scrape: verify data quality on role pages (chef, nurse, teacher) — some roles may have sparse entry routes. Can re-trigger `scrape-ncs-roles` for any specific slugs.

---

## 2026-06-08 — Andrew (main branch)

### What was done
- Fixed RIASEC quiz accordion closing after retake in MyProfile — `CollapsibleEdit` was using controlled `open={defaultOpen}` which forced close on every parent re-render; changed to internal React state with `onToggle` handler
- Collapsed Help section in GlobalMobileMenu (Community page) so services are hidden by default behind a toggle; added The King's Trust link
- Fixed ElevenLabs voice (Howdy) — stale API key updated, correct agent ID set (`agent_1001krm7gvwefwjr7yd8nyyam3rg`), fixed fallback error check (`agent_not_found` not just `invalid_agent_id`), redeployed `howdy-voice-token` function
- Fixed onboarding completion screen: "View my profile" is now the primary (green) button instead of "Take the 90-sec tour" — users were landing on the home page doodle background because the tour button called `navigate("/")` and was the first thing tapped on mobile
- Removed "Discover Yourself" item from nav (SiteHeader + GlobalMobileMenu) — it was just a link to the profile page, redundant
- Match Me: added empty-state cards prompting "Take the Quiz" or "Re-run Onboarding" for users with no RIASEC scores; added "Also factored into your matches" panel showing RIASEC bars, passions, dream roles, and dream companies
- Match Me (understand-me edge function): now fetches RIASEC scores, work values, industry interests, role preferences, dream companies and passions from DB and injects them into the AI prompt — matches now weighted by personality and stated preferences
- CV Builder redesigned: replaced html2canvas screenshot with proper jsPDF text-based two-column A4 layout (navy sidebar + white main column); Preview button fixed (opens blob URL directly)
- CV Builder: fixed duplication — work-experience "Things" (kind=Role) are now excluded from Projects & Achievements so jobs don't appear twice
- CV Builder: company and school logos pre-fetched in parallel (Clearbit API, with fallback name guessing); embedded as 6mm squares next to each experience and education entry

### Current state
- Live at: www.howdoyoudo.co.uk
- 25,694+ live jobs
- ElevenLabs voice working (premium users only)
- RIASEC quiz → profile flow working end-to-end
- Match Me uses full personality + preferences context
- CV Builder produces clean, professional A4 PDF with logos

### Left for next session / Woody
- Add `A @ 216.198.79.1` DNS record in 123-reg (fixes bare howdoyoudo.co.uk → still may hit old Lovable)
- Twilio keys needed for WhatsApp
- Voxpops video needs permanent Supabase Storage upload (currently Lovable CDN)
- Email users migration notice (send-account-migration needs rewrite for Google vs email users)
- Test ElevenLabs voice end-to-end on a premium account
- CV Builder: consider adding a "Review & Edit" step before PDF generation so users can make final tweaks without re-opening every section

---
<!-- Add new sessions above this line, keep most recent at top -->
