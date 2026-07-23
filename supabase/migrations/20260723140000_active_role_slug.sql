-- Single source-of-truth "active target role" a user is currently being
-- coached toward. Plain TEXT, not an FK: the role slug space is owned by
-- src/data/roles.ts (a TypeScript file), not a database table, so validity
-- is enforced in application code - same soft dependency role_skills.slug
-- already has on roles.ts staying in sync.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_role_slug TEXT,
  ADD COLUMN IF NOT EXISTS active_role_set_at TIMESTAMPTZ;
