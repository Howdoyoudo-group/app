
-- 1. Canonical roles table
CREATE TABLE public.canonical_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type text NOT NULL CHECK (role_type IN ('business', 'craft')),
  role_category text NOT NULL,
  role_subcategory text,
  display_name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_category, role_subcategory)
);

ALTER TABLE public.canonical_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Canonical roles are publicly readable"
  ON public.canonical_roles FOR SELECT
  TO public
  USING (true);

-- 2. Title variants table (maps messy titles → canonical roles)
CREATE TABLE public.title_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_title text NOT NULL,
  canonical_role_id uuid NOT NULL REFERENCES public.canonical_roles(id) ON DELETE CASCADE,
  source text DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (variant_title)
);

ALTER TABLE public.title_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Title variants are publicly readable"
  ON public.title_variants FOR SELECT
  TO public
  USING (true);

-- 3. Add AI classification columns to jobs table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS ai_role_category text,
  ADD COLUMN IF NOT EXISTS ai_role_subcategory text,
  ADD COLUMN IF NOT EXISTS ai_confidence numeric(3,2),
  ADD COLUMN IF NOT EXISTS needs_review boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS classified_at timestamptz;

-- 4. Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_jobs_ai_role_category ON public.jobs (ai_role_category);
CREATE INDEX IF NOT EXISTS idx_jobs_needs_review ON public.jobs (needs_review) WHERE needs_review = true;
CREATE INDEX IF NOT EXISTS idx_title_variants_lower ON public.title_variants (lower(variant_title));
