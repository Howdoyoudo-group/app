DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-external-jobs-daily') THEN
    PERFORM cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'fetch-external-jobs-daily'), schedule := '0 6,18 * * *');
  END IF;
END $$;