
-- 1. Reassign L'Oréal to beauty
UPDATE public.jobs
SET industry = 'beauty'
WHERE company ILIKE '%oréal%' OR company ILIKE '%oreal%' OR company ILIKE '%l''oreal%';

-- 2. Reassign Rituals (cosmetics brand) to beauty
UPDATE public.jobs
SET industry = 'beauty'
WHERE industry = 'grocery' AND company ILIKE '%rituals%';

-- 3. Reassign Peacocks (fashion retailer) to fashion
UPDATE public.jobs
SET industry = 'fashion'
WHERE industry = 'grocery' AND company ILIKE '%peacocks%';

-- 4. Delete recruiters and field-marketing agencies from grocery (they spam the feed
--    with hundreds of generic listings that aren't tied to real grocery employers)
DELETE FROM public.jobs
WHERE industry = 'grocery'
  AND (
    company ILIKE '%reed%'
    OR company ILIKE '%michael page%'
    OR company ILIKE '%hirecracker%'
    OR company ILIKE '%matchtech%'
    OR company ILIKE '%zachary daniels%'
    OR company ILIKE '%kingdom people%'
    OR company ILIKE '%centre people%'
    OR company ILIKE '%talentpool%'
    OR company ILIKE '%dr newitt%'
    OR company ILIKE '%drnewitt%'
    OR company ILIKE '%d r newitt%'
    OR company ILIKE '%henderson brown%'
    OR company ILIKE '%manucomm%'
    OR company ILIKE '%rise technical%'
    OR company ILIKE '%searchability%'
    OR company ILIKE '%agricultural & farming%'
    OR company ILIKE '%mayborn%'
    OR company ILIKE '%hertfordshire catering%'
    OR company ILIKE '%yo! sushi%'
    OR company ILIKE '%yo sushi%'
    OR company ILIKE '%ignite%'
    OR company ILIKE '%dee set%'
    OR company ILIKE '%one retail%'
  );
