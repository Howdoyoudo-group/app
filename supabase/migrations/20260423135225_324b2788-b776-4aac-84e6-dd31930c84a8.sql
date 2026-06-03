INSERT INTO public.employer_companies (slug, name, industry, is_active)
VALUES ('howdoyoudo', 'Howdoyoudo', NULL, true)
ON CONFLICT DO NOTHING;