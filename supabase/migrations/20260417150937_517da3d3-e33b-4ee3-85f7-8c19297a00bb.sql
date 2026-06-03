DELETE FROM public.jobs WHERE
  company = 'FashionJobs UK'
  OR url ~* '/(careers?|jobs?|grads|search|about|blog|recruitment|vacancies)/?(\?|#|$)'
  OR url ~* '\.com/?$'
  OR url ~* '\.co\.uk/?$'
  OR url ILIKE '%/search?%'
  OR url ILIKE 'https://www.eteach.com/jobs?empNo=%'
  OR url ILIKE 'https://dice.fm/jobs%'
  OR url ILIKE 'https://www.dice.com/jobs%'
  OR title ILIKE '%Careers at%'
  OR title ILIKE '%Search Jobs%'
  OR title ILIKE '%Job offer(s)%'
  OR url ILIKE '%/about-winkworth/careers%';