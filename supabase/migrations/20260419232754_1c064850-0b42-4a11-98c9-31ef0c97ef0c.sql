-- Clean up the cinema industry: it's full of recruiter spam (Hertfordshire
-- Catering, Anglian Home Improvements, Aldi, Tesla, Google, etc.) and
-- mislabelled game-studio jobs (Rebellion, Cloud Imperium, 1010 Games).
-- This delete keeps only rows whose title or company plausibly relates to
-- film/TV/cinema. Future ingestion can refill from real sources.

-- 1) Move game-studio jobs that are tagged as cinema over to gaming.
UPDATE public.jobs
SET industry = 'gaming'
WHERE industry = 'cinema'
  AND LOWER(company) ~ 'rebellion|cloud imperium|1010 games|lighthouse games|hasbro|sumo digital|creative assembly|frontier developments|rocksteady|ninja theory|jagex|mediatonic|splash damage|playground games|codemasters|team17';

-- 2) Delete cinema rows that don't match film/TV signals on title OR company.
DELETE FROM public.jobs
WHERE industry = 'cinema'
  AND LOWER(title) !~ 'film|tv|cinema|production|vfx|editor|cinematogr|director|producer|screenwrit|broadcast|post.production|colourist|grader|animator|sound design|location manager|gaffer|grip|wardrobe|costume|makeup artist|set design|art director|projectionist|usher|box office|programmer|distribution|exhibition|studio|camera operator|runner|continuity|script|screening|movie|motion picture|tv series|drama series|reality tv|documentary|streaming'
  AND LOWER(company) !~ 'bbc|itv|channel 4|channel 5|sky studios|sky uk|netflix|amazon studios|disney|warner|universal pictures|paramount|sony pictures|lionsgate|working title|film4|bfi|odeon|cineworld|vue cinemas|picturehouse|everyman|curzon|imax|medicinema|wildbrain|hartswood|left bank|sister pictures|two brothers|world productions|bad wolf|drama republic|kudos film|silverback films|wall to wall|raw tv|expectation|fremantle|banijay|endemol|all3media|red bull media';