-- Partner job feeds (CPC backfill) — schema support.
--
-- Adds the three columns the partner-feed pipeline needs. All are additive and
-- nullable (or defaulted), so existing rows and every current scraper keep
-- working untouched.

-- The affiliate-tagged URL a user is sent to when they click Apply.
--
-- This MUST stay separate from jobs.url. url is the dedup key
-- (jobs_url_unique_idx), and the pipeline deliberately strips query strings
-- from aggregator links (see the Jooble adapter in fetch-external-jobs) because
-- per-search tracking params otherwise defeat URL-based dedup entirely.
--
-- For partner feeds those same tracking params ARE the payment attribution.
-- So: canonical/stripped URL in `url` for dedup, affiliate-tagged URL in
-- `apply_url` for the outbound click. Collapsing the two loses either dedup or
-- all the revenue.
--
-- NULL means "no distinct apply URL" — callers fall back to `url`.
alter table public.jobs
  add column if not exists apply_url text;

-- Which partner supplied this listing ("careerjet", "talent", "whatjobs").
-- NULL = our own scraped/curated inventory.
-- Drives partner labelling in the UI and per-partner revenue reconciliation.
alter table public.jobs
  add column if not exists partner_source text;

-- ISO country code. Defaults to 'GB' because every existing row came from a
-- UK-scoped source, and the pipeline had no country concept before this.
--
-- Note this default encodes the pipeline's historical assume-UK behaviour for
-- EXISTING rows only. New partner ingestion must set this explicitly from the
-- feed and gate on _shared/uk-location.ts, which returns false for unknown
-- locations rather than assuming UK.
alter table public.jobs
  add column if not exists country text not null default 'GB';

-- Advertiser/employer logo URL supplied by the feed.
--
-- CV-Library's feed carries an <image> tag that resolves to the advertiser's
-- real logo (verified: one sample renders the "NW Recruitment" wordmark) even
-- though its <company> tag is hardcoded to the string "CV-Library". Storing the
-- logo lets us show who is advertising a role even while the feed withholds
-- the advertiser's name as text.
alter table public.jobs
  add column if not exists company_logo text;

-- Partner rows are queried as a set for reporting and for the placement
-- feature flag. Partial index keeps it small — the vast majority of rows are
-- our own inventory and stay out of the index entirely.
create index if not exists jobs_partner_source_idx
  on public.jobs (partner_source)
  where partner_source is not null;

-- Country filtering on the main feed paths.
create index if not exists jobs_country_idx
  on public.jobs (country);
