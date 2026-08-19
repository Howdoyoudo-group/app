create or replace function public.ops_health_check()
returns jsonb
language plpgsql
security definer
set search_path = public, cron, net
as $$
declare
  http_hard_failures integer;
  http_timeouts integer;
  http_sample jsonb;
  cron_failures jsonb;
  current_total_jobs integer;
  baseline_snapshot record;
  pct_change numeric;
  health_monitor_last timestamptz;
  result jsonb;
begin
  -- Real HTTP-level failures (4xx/5xx) — e.g. the 401-JWT-format bug that
  -- silently disabled embed-jobs for months. This is the actionable signal.
  select count(*) into http_hard_failures
  from net._http_response
  where created > now() - interval '12 hours'
    and status_code >= 400;

  -- Timeouts (status_code null) are usually benign: many crons fire a
  -- background trigger with a short net.http_post timeout by design
  -- (EdgeRuntime.waitUntil pattern) and the pg_net call reports a timeout
  -- even though the actual work continues fine. Track but don't alert on these alone.
  select count(*) into http_timeouts
  from net._http_response
  where created > now() - interval '12 hours'
    and status_code is null;

  select coalesce(jsonb_agg(jsonb_build_object(
      'status_code', status_code, 'error_msg', error_msg, 'created', created
    )), '[]'::jsonb)
  into http_sample
  from (
    select status_code, error_msg, created
    from net._http_response
    where created > now() - interval '12 hours'
      and status_code >= 400
    order by created desc
    limit 5
  ) s;

  select coalesce(jsonb_agg(jsonb_build_object(
      'jobname', j.jobname, 'status', jrd.status,
      'return_message', jrd.return_message, 'start_time', jrd.start_time
    )), '[]'::jsonb)
  into cron_failures
  from cron.job_run_details jrd
  join cron.job j on j.jobid = jrd.jobid
  where jrd.status = 'failed'
    and jrd.start_time > now() - interval '12 hours';

  select count(*) into current_total_jobs from public.jobs;

  select ohs.checked_at, ohs.total_jobs as prev_total
  into baseline_snapshot
  from public.ops_health_snapshots ohs
  where ohs.checked_at < now() - interval '20 hours'
  order by ohs.checked_at desc
  limit 1;

  if baseline_snapshot.prev_total is not null and baseline_snapshot.prev_total > 0 then
    pct_change := round(((current_total_jobs - baseline_snapshot.prev_total)::numeric / baseline_snapshot.prev_total) * 100, 1);
  else
    pct_change := null;
  end if;

  insert into public.ops_health_snapshots (total_jobs) values (current_total_jobs);

  select max(created_at) into health_monitor_last from public.industry_health_log;

  result := jsonb_build_object(
    'http_hard_failures_12h', http_hard_failures,
    'http_timeouts_12h', http_timeouts,
    'http_failure_sample', http_sample,
    'cron_failures_12h', cron_failures,
    'total_jobs', current_total_jobs,
    'baseline_checked_at', baseline_snapshot.checked_at,
    'baseline_total_jobs', baseline_snapshot.prev_total,
    'pct_change_24h', pct_change,
    'industry_health_monitor_last_run', health_monitor_last
  );

  return result;
end;
$$;

grant execute on function public.ops_health_check() to service_role;
grant execute on function public.ops_health_check() to authenticated;
