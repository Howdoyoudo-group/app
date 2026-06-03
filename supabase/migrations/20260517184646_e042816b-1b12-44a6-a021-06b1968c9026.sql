DELETE FROM public.jobs
WHERE industry = 'coffee'
  AND url ILIKE '%reed.co.uk%'
  AND NOT (
    (COALESCE(title,'') || ' ' || COALESCE(company,'')) ~* '\m(coffee|barista|caf[eé]|caff[èe]|espresso|roastery|roaster|costa|starbucks|pret|nero|gail|blank street|black sheep|joe & the juice|ole & steen|tim hortons|dunkin|cafenero|q grader)\M'
  );