UPDATE jobs SET industry = 'health'
WHERE industry IN ('beauty','farming','cinema','coffee','beer','horse-racing')
  AND (
    company ILIKE '%hamberley%'
    OR company ILIKE '%voyage care%'
    OR company ILIKE '%hc-one%' OR company ILIKE '%hc one%'
    OR company ILIKE '%barchester%'
    OR company ILIKE '%outcomes first%'
    OR company ILIKE '%priory group%' OR company ILIKE 'the priory'
    OR company ILIKE '%cygnet health%'
    OR company ILIKE '%care uk%'
    OR company ILIKE '%four seasons health%'
    OR company ILIKE '%anchor hanover%'
    OR company ILIKE '%sanctuary care%'
    OR company ILIKE '%bupa care%'
    OR company ILIKE '%elysium healthcare%'
    OR company ILIKE '%ramsay health%'
    OR company ILIKE '%spire healthcare%'
    OR company ILIKE '%circle health%'
  );

UPDATE jobs SET industry = 'travel'
WHERE company ILIKE 'uber'
   OR (company ILIKE 'uber%' AND company NOT ILIKE '%uber eats%');

UPDATE jobs SET industry = 'hospitality'
WHERE company ILIKE '%uber eats%';