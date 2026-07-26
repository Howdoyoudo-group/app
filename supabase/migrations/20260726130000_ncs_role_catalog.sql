-- Free-standing catalog of ALL National Careers Service job profiles (733
-- live as of 2026-07-26, verified via their sitemap), keyed by NCS's OWN
-- slug rather than a roles.ts slug. This is separate from role_metadata
-- (which is keyed by our 104 roles.ts slugs and only covers the 71 roles
-- with a clean 1:1 NCS mapping) - it exists to fuzzy-match CareerMap tile
-- role names that have no roles.ts equivalent, so those tiles can show
-- real government-sourced facts instead of an AI-improvised blurb.
CREATE TABLE IF NOT EXISTS public.ncs_role_catalog (
  ncs_slug               TEXT PRIMARY KEY,
  title                  TEXT NOT NULL,
  ncs_url                TEXT NOT NULL,
  ncs_sector             TEXT,
  ncs_salary_starter     INTEGER,
  ncs_salary_experienced INTEGER,
  ncs_hours              TEXT,
  ncs_work_pattern       TEXT,
  ncs_tasks              JSONB,
  ncs_skills             JSONB,
  ncs_entry_routes       JSONB,
  ncs_qualifications     TEXT,
  ncs_related_roles      JSONB,
  ncs_video_url          TEXT,
  scrape_status          TEXT NOT NULL DEFAULT 'pending',
  scrape_error           TEXT,
  fetched_at             TIMESTAMPTZ
);

ALTER TABLE public.ncs_role_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ncs_role_catalog"
  ON public.ncs_role_catalog
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS ncs_role_catalog_status_idx ON public.ncs_role_catalog (scrape_status);
