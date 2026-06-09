# Session Log

This file is updated by Claude at the start and end of every session.
**Always read this before starting work. Always update it when finishing.**

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
