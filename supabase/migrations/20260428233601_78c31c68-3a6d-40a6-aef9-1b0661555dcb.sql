update public.jobs
set expires_at = now()
where company ilike 'Ocado Retail'
  and (expires_at is null or expires_at > now());