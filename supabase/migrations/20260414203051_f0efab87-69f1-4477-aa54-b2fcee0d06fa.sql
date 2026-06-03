
-- Phase 1: Add RIASEC and work values columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS riasec_scores JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS work_values JSONB DEFAULT NULL;

-- Phase 2: Create role RIASEC reference table
CREATE TABLE public.role_riasec_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_category TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  riasec_code TEXT NOT NULL,
  riasec_scores JSONB NOT NULL,
  work_values JSONB NOT NULL,
  typical_traits TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Anyone can read role profiles (reference data)
ALTER TABLE public.role_riasec_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role RIASEC profiles are publicly readable"
ON public.role_riasec_profiles
FOR SELECT
USING (true);
