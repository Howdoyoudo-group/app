-- Real per-role job description, mandatory qualification/licensing requirements,
-- real skills and professional bodies, scraped from CareerPilot (closing 2026).
-- Previously scrape-careerpilot only captured salary/entry-routes/progression -
-- it never captured the "What you'll do", "Requirements and restrictions" or
-- "Skills required" sections, which is exactly where mandatory-qualification
-- data (e.g. Gas Safe Register for plumbers/heating engineers) actually lives.
ALTER TABLE public.role_metadata
  ADD COLUMN IF NOT EXISTS cp_description TEXT,
  ADD COLUMN IF NOT EXISTS cp_requirements TEXT,
  ADD COLUMN IF NOT EXISTS cp_skills JSONB,
  ADD COLUMN IF NOT EXISTS cp_professional_bodies JSONB;
