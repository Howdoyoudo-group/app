-- Add CareerPilot enrichment columns to role_metadata
-- CareerPilot (careerpilot.org.uk) is a UK govt-funded career site closing in 2026.
-- These columns store the unique data it has that NCS doesn't: named qualification
-- entry routes (A levels, T Levels, BTECs, named apprenticeships), career progression
-- ladders, related roles with salary ranges, and work environment descriptions.

ALTER TABLE public.role_metadata
  ADD COLUMN IF NOT EXISTS cp_url TEXT,
  ADD COLUMN IF NOT EXISTS cp_salary_min INTEGER,        -- £/year lower bound
  ADD COLUMN IF NOT EXISTS cp_salary_max INTEGER,        -- £/year upper bound
  ADD COLUMN IF NOT EXISTS cp_entry_routes JSONB,        -- [{type, name?, level?, duration?, requirements?}]
  ADD COLUMN IF NOT EXISTS cp_career_progression JSONB,  -- string[] e.g. ["commis chef","sous chef","head chef"]
  ADD COLUMN IF NOT EXISTS cp_related_roles JSONB,       -- [{title, salary_range}]
  ADD COLUMN IF NOT EXISTS cp_work_environment TEXT,     -- e.g. "evenings, weekends, shift work · physically demanding"
  ADD COLUMN IF NOT EXISTS cp_growth TEXT,               -- e.g. "2.8% projected job growth by 2029"
  ADD COLUMN IF NOT EXISTS cp_fetched_at TIMESTAMPTZ;
