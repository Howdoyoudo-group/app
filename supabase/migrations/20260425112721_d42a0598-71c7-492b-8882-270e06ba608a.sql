CREATE OR REPLACE FUNCTION public.get_owner_insights()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  v_30d timestamptz := now() - interval '30 days';
  v_7d  timestamptz := now() - interval '7 days';
  v_24h timestamptz := now() - interval '24 hours';
  v_5m  timestamptz := now() - interval '5 minutes';
  v_yday_start timestamptz := date_trunc('day', now() - interval '1 day');
  v_yday_end   timestamptz := date_trunc('day', now());
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  WITH
  emp_users AS (SELECT user_id FROM employer_users),
  live AS (SELECT DISTINCT user_id FROM user_interactions WHERE created_at >= v_5m),
  active24 AS (SELECT DISTINCT user_id FROM user_interactions WHERE created_at >= v_24h),
  sessions AS (
    SELECT user_id, date_trunc('day', created_at) AS day, count(*) AS c
    FROM user_interactions
    WHERE created_at >= v_30d
    GROUP BY 1,2
  ),
  emails_dedup AS (
    SELECT DISTINCT ON (message_id) message_id, template_name, status, created_at
    FROM email_send_log
    WHERE message_id IS NOT NULL AND created_at >= v_30d
    ORDER BY message_id, created_at DESC
  ),
  live_jobs_all AS (
    SELECT id, title, company, industry, role_category, url
    FROM jobs
    WHERE (expires_at IS NULL OR expires_at > now())
      AND title IS NOT NULL
      AND company IS NOT NULL
  ),
  live_jobs AS (
    SELECT DISTINCT ON (lower(title), lower(company))
      id, title, company, industry, role_category, url
    FROM jobs
    WHERE (expires_at IS NULL OR expires_at > now())
      AND title IS NOT NULL
      AND company IS NOT NULL
    ORDER BY lower(title), lower(company), scraped_at DESC
  ),
  jobs_display AS (
    SELECT
      id, title, company, role_category, url,
      regexp_replace(lower(trim(COALESCE(company, ''))), '[^a-z0-9]+', '', 'g') AS company_key,
      CASE lower(COALESCE(NULLIF(trim(industry), ''), 'unspecified'))
        WHEN 'hospitality' THEN 'Food & Drink'
        WHEN 'cinema' THEN 'Film and TV'
        WHEN 'estate-agency' THEN 'Estate Agency'
        WHEN 'horse-racing' THEN 'Horse Racing'
        WHEN 'interior-design' THEN 'Interior Design'
        WHEN 'unspecified' THEN 'Unspecified'
        ELSE initcap(replace(industry, '-', ' '))
      END AS industry
    FROM live_jobs
  ),
  jobs_ind AS (
    SELECT industry, count(*) AS c
    FROM jobs_display GROUP BY 1 ORDER BY 2 DESC
  ),
  jobs_role AS (
    SELECT COALESCE(NULLIF(trim(role_category), ''), 'Uncategorised') AS role, count(*) AS c
    FROM jobs_display GROUP BY 1 ORDER BY 2 DESC LIMIT 10
  ),
  top_employers_raw AS (
    SELECT
      NULLIF(company_key, '') AS company_key,
      mode() WITHIN GROUP (ORDER BY company) AS company,
      count(*) AS c
    FROM jobs_display
    GROUP BY 1
  ),
  top_employers AS (
    SELECT COALESCE(company, 'Unknown') AS company, c
    FROM top_employers_raw
    ORDER BY c DESC
    LIMIT 15
  ),
  emp_by_ind_raw AS (
    SELECT
      industry,
      NULLIF(company_key, '') AS company_key,
      mode() WITHIN GROUP (ORDER BY company) AS company,
      count(*) AS c
    FROM jobs_display
    GROUP BY 1, 2
  ),
  emp_by_ind_ranked AS (
    SELECT
      industry,
      COALESCE(company, 'Unknown') AS company,
      c,
      row_number() OVER (PARTITION BY industry ORDER BY c DESC) AS rn
    FROM emp_by_ind_raw
  ),
  emp_by_ind AS (
    SELECT industry, company, c FROM emp_by_ind_ranked WHERE rn <= 15
  ),
  jobs_src AS (
    SELECT
      CASE
        WHEN url ILIKE '%adzuna%' THEN 'Adzuna'
        WHEN url ILIKE '%reed.co.uk%' THEN 'Reed'
        WHEN url ILIKE '%jooble%' THEN 'Jooble'
        WHEN url ILIKE '%linkedin%' THEN 'LinkedIn'
        WHEN url ILIKE '%indeed%' THEN 'Indeed'
        WHEN url ILIKE '%greenhouse%' THEN 'Greenhouse'
        WHEN url ILIKE '%lever.co%' THEN 'Lever'
        WHEN url ILIKE '%workable%' THEN 'Workable'
        WHEN url ILIKE '%workday%' THEN 'Workday'
        WHEN url ILIKE '%smartrecruiters%' THEN 'SmartRecruiters'
        WHEN url ILIKE '%ashbyhq%' THEN 'Ashby'
        WHEN url ILIKE '%totaljobs%' THEN 'Totaljobs'
        WHEN url ILIKE '%caterer.com%' THEN 'Caterer.com'
        WHEN url ILIKE '%nhs.uk%' THEN 'NHS Jobs'
        ELSE 'Direct / Other'
      END AS src
    FROM jobs_display
  ),
  jobs_src_agg AS (
    SELECT src, count(*) AS c
    FROM jobs_src
    GROUP BY 1 ORDER BY 2 DESC LIMIT 10
  ),
  email_tpl AS (
    SELECT template_name, count(*) AS c
    FROM emails_dedup
    WHERE status = 'sent'
    GROUP BY 1 ORDER BY 2 DESC
  ),
  digests_by_ind AS (
    SELECT lower(trim(industry)) AS industry, count(*) AS c
    FROM sent_newsletters
    WHERE sent_at >= v_30d AND industry IS NOT NULL AND trim(industry) <> ''
    GROUP BY 1 ORDER BY 2 DESC
  ),
  ui_by_ind AS (
    SELECT
      lower(trim(industry)) AS industry,
      count(*) FILTER (WHERE interaction_type = 'industry_view') AS views,
      count(*) FILTER (WHERE interaction_type = 'company_view') AS company_views,
      count(*) FILTER (WHERE interaction_type = 'job_click') AS job_clicks,
      count(*) AS total
    FROM user_interactions
    WHERE created_at >= v_30d AND industry IS NOT NULL AND trim(industry) <> ''
    GROUP BY 1
    ORDER BY total DESC
  ),
  src_case AS (
    SELECT
      url,
      scraped_at,
      expires_at,
      CASE
        WHEN url ILIKE '%adzuna%' THEN 'Adzuna'
        WHEN url ILIKE '%reed.co.uk%' THEN 'Reed'
        WHEN url ILIKE '%jooble%' THEN 'Jooble'
        WHEN url ILIKE '%linkedin%' THEN 'LinkedIn'
        WHEN url ILIKE '%indeed%' THEN 'Indeed'
        WHEN url ILIKE '%jsearch%' OR url ILIKE '%rapidapi%' THEN 'JSearch'
        WHEN url ILIKE '%greenhouse%' THEN 'Greenhouse'
        WHEN url ILIKE '%lever.co%' THEN 'Lever'
        WHEN url ILIKE '%workable%' THEN 'Workable'
        WHEN url ILIKE '%workday%' THEN 'Workday'
        WHEN url ILIKE '%smartrecruiters%' THEN 'SmartRecruiters'
        WHEN url ILIKE '%ashbyhq%' THEN 'Ashby'
        WHEN url ILIKE '%totaljobs%' THEN 'Totaljobs'
        WHEN url ILIKE '%caterer.com%' THEN 'Caterer.com'
        WHEN url ILIKE '%nhs.uk%' THEN 'NHS Jobs'
        WHEN url ILIKE '%pinpoint%' THEN 'Pinpoint'
        WHEN url ILIKE '%fantasticjobs%' OR url ILIKE '%internships%' THEN 'Internships API'
        ELSE 'Direct / Other'
      END AS src
    FROM jobs
    WHERE title IS NOT NULL AND company IS NOT NULL
  ),
  added_yday AS (
    SELECT src, count(*) AS c
    FROM src_case
    WHERE scraped_at >= v_yday_start AND scraped_at < v_yday_end
    GROUP BY 1
  ),
  removed_yday AS (
    SELECT src, count(*) AS c
    FROM src_case
    WHERE expires_at IS NOT NULL
      AND expires_at >= v_yday_start AND expires_at < v_yday_end
    GROUP BY 1
  ),
  src_union AS (
    SELECT src FROM added_yday
    UNION
    SELECT src FROM removed_yday
  ),
  added_removed AS (
    SELECT
      s.src AS source,
      COALESCE(a.c, 0) AS added,
      COALESCE(r.c, 0) AS removed,
      COALESCE(a.c, 0) - COALESCE(r.c, 0) AS net
    FROM src_union s
    LEFT JOIN added_yday a ON a.src = s.src
    LEFT JOIN removed_yday r ON r.src = s.src
    ORDER BY (COALESCE(a.c, 0) + COALESCE(r.c, 0)) DESC
  )
  SELECT jsonb_build_object(
    'liveUsers', (SELECT count(*) FROM live),
    'liveEmployers', (SELECT count(*) FROM live l JOIN emp_users e ON e.user_id = l.user_id),
    'active24h', (SELECT count(*) FROM active24),
    'totalUsers', (SELECT count(*) FROM profiles),
    'totalEmployers', (SELECT count(*) FROM employer_users),
    'applies30d', (SELECT count(*) FROM user_interactions WHERE interaction_type='job_click' AND created_at >= v_30d),
    'applies7d',  (SELECT count(*) FROM user_interactions WHERE interaction_type='job_click' AND created_at >= v_7d),
    'pageViews30d', (SELECT count(*) FROM user_interactions WHERE interaction_type IN ('industry_view','company_view','page_view') AND created_at >= v_30d),
    'totalSessions', (SELECT count(*) FROM sessions),
    'bouncedSessions', (SELECT count(*) FROM sessions WHERE c = 1),
    'profilesUpdated30d', (SELECT count(*) FROM profiles WHERE updated_at >= v_30d),
    'profilesUpdated7d',  (SELECT count(*) FROM profiles WHERE updated_at >= v_7d),
    'jobsTotal', (SELECT count(*) FROM jobs_display),
    'jobsTotalRaw', (SELECT count(*) FROM live_jobs_all),
    'jobsByIndustry', COALESCE((SELECT jsonb_agg(jsonb_build_object('industry', industry, 'count', c)) FROM jobs_ind), '[]'::jsonb),
    'jobsByRole', COALESCE((SELECT jsonb_agg(jsonb_build_object('role', role, 'count', c)) FROM jobs_role), '[]'::jsonb),
    'topEmployers', COALESCE((SELECT jsonb_agg(jsonb_build_object('company', company, 'count', c)) FROM top_employers), '[]'::jsonb),
    'topEmployersByIndustry', COALESCE((SELECT jsonb_agg(jsonb_build_object('industry', industry, 'company', company, 'count', c)) FROM emp_by_ind), '[]'::jsonb),
    'jobsBySource', COALESCE((SELECT jsonb_agg(jsonb_build_object('source', src, 'count', c)) FROM jobs_src_agg), '[]'::jsonb),
    'jobsAddedRemovedYesterday', COALESCE((SELECT jsonb_agg(jsonb_build_object('source', source, 'added', added, 'removed', removed, 'net', net)) FROM added_removed), '[]'::jsonb),
    'yesterdayDate', to_char(v_yday_start, 'YYYY-MM-DD'),
    'articles30d', (SELECT count(*) FROM articles WHERE scraped_at >= v_30d),
    'briefings30d', (SELECT count(*) FROM daily_briefings WHERE generated_at >= v_30d),
    'newslettersSent30d', (SELECT COALESCE(sum(c),0) FROM email_tpl WHERE template_name IN ('daily_digest','daily-digest-test')),
    'emailsSentTotal30d', (SELECT COALESCE(sum(c),0) FROM email_tpl),
    'emailsByTemplate30d', COALESCE((SELECT jsonb_agg(jsonb_build_object('template', template_name, 'count', c)) FROM email_tpl), '[]'::jsonb),
    'digestsByIndustry30d', COALESCE((SELECT jsonb_agg(jsonb_build_object('industry', industry, 'count', c)) FROM digests_by_ind), '[]'::jsonb),
    'interactionsByIndustry30d', COALESCE((SELECT jsonb_agg(jsonb_build_object('industry', industry, 'views', views, 'companyViews', company_views, 'jobClicks', job_clicks, 'total', total)) FROM ui_by_ind), '[]'::jsonb),
    'contactRequests30d', (SELECT count(*) FROM contact_requests WHERE created_at >= v_30d),
    'contactReplies30d',  (SELECT count(*) FROM contact_requests WHERE replied_at IS NOT NULL AND replied_at >= v_30d)
  ) INTO result;

  RETURN result;
END;
$function$;