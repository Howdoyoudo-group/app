UPDATE profiles 
SET understand_me_results = NULL,
    job_preferences = jsonb_set(COALESCE(job_preferences, '{}'::jsonb), '{understandMe}', 'null'::jsonb)
WHERE id = '2c709954-222e-4889-bf97-3f91385ca0a8';