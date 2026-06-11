# Session Log

This file is updated by Claude at the start and end of every session.
**Always read this before starting work. Always update it when finishing.**

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
