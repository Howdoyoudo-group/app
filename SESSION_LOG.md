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

## 2026-06-08 — Andrew (main branch)

### What was done
- Fixed RIASEC quiz accordion closing after retake in MyProfile — `CollapsibleEdit` was using controlled `open={defaultOpen}` which forced close on every parent re-render; changed to internal React state with `onToggle` handler
- Collapsed Help section in GlobalMobileMenu (Community page) so services are hidden by default behind a toggle; added The King's Trust link
- Fixed ElevenLabs voice (Howdy) — stale API key updated, correct agent ID set (`agent_1001krm7gvwefwjr7yd8nyyam3rg`), fixed fallback error check (`agent_not_found` not just `invalid_agent_id`), redeployed `howdy-voice-token` function
- Fixed onboarding completion screen: "View my profile" is now the primary (green) button instead of "Take the 90-sec tour" — users were landing on the home page doodle background because the tour button called `navigate("/")` and was the first thing tapped on mobile

### Current state
- Live at: www.howdoyoudo.co.uk
- 25,694+ live jobs
- ElevenLabs voice working (premium users only)
- RIASEC quiz working in MyProfile and Onboarding

### Left for next session / Woody
- Add `A @ 216.198.79.1` DNS record in 123-reg (fixes bare howdoyoudo.co.uk → still may hit old Lovable)
- Twilio keys needed for WhatsApp
- Voxpops video needs permanent Supabase Storage upload (currently Lovable CDN)
- Email users migration notice (send-account-migration needs rewrite for Google vs email users)
- Test ElevenLabs voice end-to-end on a premium account

---
<!-- Add new sessions above this line, keep most recent at top -->
