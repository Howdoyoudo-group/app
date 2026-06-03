DELETE FROM public.jobs
WHERE industry = 'music'
  AND (expires_at IS NULL OR expires_at > now())
  AND (url ILIKE '%reed.co.uk%' OR url ILIKE '%adzuna%')
  AND title !~* '\m(music|musician|musical|record label|recording studio|sound engineer|live sound|tour manager|touring|gig|gigging|festival|concert|venue|artist manager|a&r|songwriter|composer|producer|dj|orchestra|band|choir|opera|conductor|spotify|live nation|aeg|stagehand|roadie|lighting designer|stage manager|booking agent|talent buyer|audio engineer|mastering engineer|mixing engineer|foh engineer|monitor engineer|av technician)\M';