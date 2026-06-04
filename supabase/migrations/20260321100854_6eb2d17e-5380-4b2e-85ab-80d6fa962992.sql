DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-daily-digest-7am-uk') THEN
    PERFORM cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'send-daily-digest-7am-uk'), '0 7 * * 1-5');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-all-content-daily') THEN
    PERFORM cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'refresh-all-content-daily'), '0 6 * * 1-5');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'nightly-content-refresh') THEN
    PERFORM cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'nightly-content-refresh'), '59 23 * * 0-4');
  END IF;
END $$;