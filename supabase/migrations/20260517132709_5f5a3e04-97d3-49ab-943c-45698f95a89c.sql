DELETE FROM public.jobs
WHERE industry = 'coffee'
  AND url ILIKE '%reed.co.uk%'
  AND NOT (
    title ~* '\m(coffee|barista|caf[eé]|espresso|roaster|roastery)\M'
    OR company ~* '\m(costa|starbucks|pret|nero|gail|blank street|grind|black sheep|tim hortons|dunkin|joe & the juice|ole & steen|paul bakery)\M'
    OR description ~* '\m(coffee shop|coffee house|coffee chain|coffee bean|specialty coffee|speciality coffee|barista|espresso|roastery)\M'
  );