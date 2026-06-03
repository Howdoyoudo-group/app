ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS value_chain_stage text,
  ADD COLUMN IF NOT EXISTS role_category text,
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;