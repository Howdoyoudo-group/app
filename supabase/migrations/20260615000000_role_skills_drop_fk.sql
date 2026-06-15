-- Drop FK constraint on role_skills.slug so it can hold any role slug,
-- not just those in role_metadata (which only has 36 occupation-level rows).
-- role_se_mapping keeps its FK — it's still occupation-level only.

ALTER TABLE public.role_skills DROP CONSTRAINT IF EXISTS role_skills_slug_fkey;
