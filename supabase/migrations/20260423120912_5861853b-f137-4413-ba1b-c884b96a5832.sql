-- Shared trigger function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Company profiles table
CREATE TABLE public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL UNIQUE REFERENCES public.employer_companies(id) ON DELETE CASCADE,
  tagline TEXT,
  about TEXT,
  mission TEXT,
  culture TEXT,
  perks TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  careers_url TEXT,
  instagram_url TEXT,
  press_mentions JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  sustainability TEXT,
  custom_blocks JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company profiles are publicly readable"
ON public.company_profiles FOR SELECT
USING (true);

CREATE POLICY "Employers can insert their own company profile"
ON public.company_profiles FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'employer'::app_role) AND company_id = get_employer_company_id(auth.uid()))
);

CREATE POLICY "Employers can update their own company profile"
ON public.company_profiles FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'employer'::app_role) AND company_id = get_employer_company_id(auth.uid()))
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'employer'::app_role) AND company_id = get_employer_company_id(auth.uid()))
);

CREATE POLICY "Admins can delete company profiles"
ON public.company_profiles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_company_profiles_updated_at
BEFORE UPDATE ON public.company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Company assets are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

CREATE POLICY "Employers can upload assets for their company"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-assets'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (
      has_role(auth.uid(), 'employer'::app_role)
      AND (storage.foldername(name))[1] = (
        SELECT slug FROM public.employer_companies WHERE id = get_employer_company_id(auth.uid())
      )
    )
  )
);

CREATE POLICY "Employers can update assets for their company"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-assets'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (
      has_role(auth.uid(), 'employer'::app_role)
      AND (storage.foldername(name))[1] = (
        SELECT slug FROM public.employer_companies WHERE id = get_employer_company_id(auth.uid())
      )
    )
  )
);

CREATE POLICY "Employers can delete assets for their company"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-assets'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (
      has_role(auth.uid(), 'employer'::app_role)
      AND (storage.foldername(name))[1] = (
        SELECT slug FROM public.employer_companies WHERE id = get_employer_company_id(auth.uid())
      )
    )
  )
);