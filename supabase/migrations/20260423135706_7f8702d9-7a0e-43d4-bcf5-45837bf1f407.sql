CREATE OR REPLACE FUNCTION public.get_owner_insights()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_now timestamptz := now();
  v_30d timestamptz := now() - interval '30 days';
  v_7d  timestamptz := now() - interval '7 days';
  v_24h timestamptz := now() - interval '24 hours';
  v_5m  timestamptz := now() - interval '5 minutes';
BEGIN
  -- Admins only
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  WITH
  emp_users AS (SELECT user_id FROM employer_users),
  live AS (
    SELECT DISTINCT user_id FROM user_interactions WHERE created_at >= v_5m
  ),
  active24 AS (
    SELECT DISTINCT user_id FROM user_interactions WHERE created_at >= v_24h
  ),
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
    FROM jobs GROUP BY 1 ORDER BY 2 DESC LIMIT 12
  ),
  jobs_role AS (
    SELECT COALESCE(NULLIF(trim(role_category), ''), 'Uncategorised') AS role, count(*) AS c
    FROM jobs GROUP BY 1 ORDER BY 2 DESC LIMIT 10
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
$$;

GRANT EXECUTE ON FUNCTION public.get_owner_insights() TO authenticated;