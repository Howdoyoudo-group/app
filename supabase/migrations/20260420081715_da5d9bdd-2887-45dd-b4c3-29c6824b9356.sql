DELETE FROM jobs
WHERE industry = 'football'
  AND (
    title ILIKE '%support worker%'
    OR title ILIKE '%children%'
    OR title ILIKE '%care manager%'
    OR title ILIKE '%pastoral%'
    OR title ILIKE '%care and accommodation%'
    OR company ILIKE '%witherslack%'
    OR company ILIKE '%appcastenterprise%'
    OR company ILIKE '%awd online%'
  );