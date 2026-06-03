DO $$
DECLARE
  job_rec RECORD;
  new_command TEXT;
BEGIN
  FOR job_rec IN
    SELECT jobid, jobname, schedule, command
    FROM cron.job
    WHERE command ILIKE '%send-daily-digest%'
  LOOP
    -- Only patch jobs that don't already pass confirm_full_send
    IF job_rec.command NOT ILIKE '%confirm_full_send%' THEN
      -- Insert ?confirm_full_send=true into the URL. Handles URLs with or without an existing query string.
      new_command := regexp_replace(
        job_rec.command,
        'send-daily-digest(\?[^''" )]*)?',
        CASE
          WHEN job_rec.command ~ 'send-daily-digest\?'
            THEN 'send-daily-digest\1&confirm_full_send=true'
          ELSE 'send-daily-digest?confirm_full_send=true'
        END,
        'g'
      );
      PERFORM cron.alter_job(job_rec.jobid, command := new_command);
      RAISE NOTICE 'Updated cron job % (%) to include confirm_full_send=true', job_rec.jobid, job_rec.jobname;
    END IF;
  END LOOP;
END $$;