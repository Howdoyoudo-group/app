SELECT cron.schedule(
  'daily-jobs-report',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url:='https://siqwclmzncubkrwabmvb.supabase.co/functions/v1/daily-jobs-report',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcXdjbG16bmN1Ymtyd2FibXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTUxNDgsImV4cCI6MjA4ODgzMTE0OH0.1Xj7BncNsxdriorLLxBJOO8gjF4-ZGbrkNkFXB6Bm5Q"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);