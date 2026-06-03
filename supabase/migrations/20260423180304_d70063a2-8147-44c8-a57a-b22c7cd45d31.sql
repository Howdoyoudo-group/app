ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS newsletter_industries text[] DEFAULT '{}'::text[];
ALTER TABLE public.profiles    ADD COLUMN IF NOT EXISTS newsletter_industries text[] DEFAULT '{}'::text[];

UPDATE public.subscribers
SET newsletter_industries = COALESCE(industry_interests, '{}'::text[])
WHERE newsletter_industries IS NULL OR newsletter_industries = '{}'::text[];

UPDATE public.profiles
SET newsletter_industries = COALESCE(industry_interests, '{}'::text[])
WHERE newsletter_industries IS NULL OR newsletter_industries = '{}'::text[];