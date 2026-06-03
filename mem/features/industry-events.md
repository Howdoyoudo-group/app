---
name: Industry Events (Attend tab)
description: Per-industry upcoming UK events powered by Perplexity sonar-pro weekly cron, stored in public.industry_events, rendered by EventsSection as rich date-badge cards grouped by month.
type: feature
---
- Table `public.industry_events` (industry slug, title, description, event_type, organizer, location, starts_on, ends_on, date_label, url, fetched_at). Unique on (industry, url). Public SELECT, writes via service role only.
- Edge function `fetch-industry-events` calls Perplexity `sonar-pro` per industry with curated source hints (e.g. football → World Football Summit, SoccerEx; farming → Farmers Weekly Awards, Cereals Event; beauty → Tone of Beauty, CEW UK). Sequential, 2s delay between calls. Deletes past-by-120-days rows. In-batch dedupe by url before upsert (Postgres upsert can't touch same row twice).
- Weekly cron `weekly-fetch-industry-events`: Mondays 04:30 UTC. Manual re-seed: POST `/functions/v1/fetch-industry-events` with `{"industries":[...]}` (subset) or `{}` for all.
- Frontend `src/components/EventsSection.tsx` loads from table by industry slug (mapped from display name via `INDUSTRIES`). Renders monthly groups of rich cards with date badge, event-type pill, organiser, location and ExternalLink CTA. Falls back to Eventbrite UK search when empty.
- All event cards open in new tab (per External Links rule).
