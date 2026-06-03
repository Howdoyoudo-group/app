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
  jobs_ind AS (
    SELECT COALESCE(NULLIF(trim(industry), ''), 'Unspecified') AS industry, count(*) AS c
    FROM jobs GROUP BY 1 ORDER BY 2 DESC
  ),
  jobs_role AS (
    SELECT COALESCE(NULLIF(trim(role_category), ''), 'Uncategorised') AS role, count(*) AS c
    FROM jobs GROUP BY 1 ORDER BY 2 DESC LIMIT 10
  ),
  top_employers AS (
    SELECT COALESCE(NULLIF(trim(company), ''), 'Unknown') AS company, count(*) AS c
    FROM jobs GROUP BY 1 ORDER BY 2 DESC LIMIT 15
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
    FROM jobs
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
    'jobsTotal', (SELECT count(*) FROM jobs),
    'jobsByIndustry', COALESCE((SELECT jsonb_agg(jsonb_build_object('industry', industry, 'count', c)) FROM jobs_ind), '[]'::jsonb),
    'jobsByRole', COALESCE((SELECT jsonb_agg(jsonb_build_object('role', role, 'count', c)) FROM jobs_role), '[]'::jsonb),
    'topEmployers', COALESCE((SELECT jsonb_agg(jsonb_build_object('company', company, 'count', c)) FROM top_employers), '[]'::jsonb),
    'jobsBySource', COALESCE((SELECT jsonb_agg(jsonb_build_object('source', src, 'count', c)) FROM jobs_src_agg), '[]'::jsonb),
    'articles30d', (SELECT count(*) FROM articles WHERE scraped_at >= v_30d),
    'briefings30d', (SELECT count(*) FROM daily_briefings WHERE generated_at >= v_30d),
    'newslettersSent30d', (SELECT COALESCE(sum(c),0) FROM email_tpl WHERE template_name IN ('daily_digest','daily-digest-test')),
    'emailsSentTotal30d', (SELECT COALESCE(sum(c),0) FROM email_tpl),
    'emailsByTemplate30d', COALESCE((SELECT jsonb_agg(jsonb_build_object('template', template_name, 'count', c)) FROM email_tpl), '[]'::jsonb),
    'contactRequests30d', (SELECT count(*) FROM contact_requests WHERE created_at >= v_30d),
    'contactReplies30d',  (SELECT count(*) FROM contact_requests WHERE replied_at IS NOT NULL AND replied_at >= v_30d)
  ) INTO result;

  RETURN result;
END;
$function$;