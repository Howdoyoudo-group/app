-- role_metadata: stores enriched career data scraped from the National Careers Service
-- Fields are additive — displayed alongside (not replacing) hand-crafted role page content.
-- Roles with no NCS equivalent simply have no row; the UI degrades gracefully.

CREATE TABLE IF NOT EXISTS public.role_metadata (
  slug                  TEXT PRIMARY KEY,
  ncs_url               TEXT,
  ncs_salary_starter    INTEGER,   -- £/year (UK-wide average, NCS figure)
  ncs_salary_experienced INTEGER,  -- £/year
  ncs_hours             TEXT,      -- e.g. "40 to 45"
  ncs_work_pattern      TEXT,      -- e.g. "evenings / weekends / bank holidays"
  ncs_tasks             JSONB,     -- string[]
  ncs_skills            JSONB,     -- string[]
  ncs_entry_routes      JSONB,     -- [{type, name, level, duration}]
  ncs_qualifications    TEXT,
  ncs_related_roles     JSONB,     -- [{title, ncs_slug}]
  fetched_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.role_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read role_metadata"
  ON public.role_metadata FOR SELECT USING (true);
