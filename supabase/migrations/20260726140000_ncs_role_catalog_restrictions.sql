-- "Restrictions and Requirements" section (e.g. Gas Safe Register, CSCS
-- card) - discovered while fixing the scraper's accordion-content bug,
-- same kind of mandatory-licensing data CareerPilot's cp_requirements
-- captures for our own roles.ts-mapped roles.
ALTER TABLE public.ncs_role_catalog
  ADD COLUMN IF NOT EXISTS ncs_restrictions TEXT;
