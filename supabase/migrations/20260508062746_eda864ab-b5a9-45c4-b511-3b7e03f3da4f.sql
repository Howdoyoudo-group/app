
-- Remove the old single briefing cron
SELECT cron.unschedule(31);

-- Batch 1: 5:30am
SELECT cron.schedule(
  'briefings-batch-1',
  '30 5 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://siqwclmzncubkrwabmvb.supabase.co/functions/v1/generate-daily-briefings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcXdjbG16bmN1Ymtyd2FibXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTUxNDgsImV4cCI6MjA4ODgzMTE0OH0.1Xj7BncNsxdriorLLxBJOO8gjF4-ZGbrkNkFXB6Bm5Q"}'::jsonb,
    body := '{"industries":["football","music","fashion","grocery","coffee"]}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- Batch 2: 5:32am
SELECT cron.schedule(
  'briefings-batch-2',
  '32 5 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://siqwclmzncubkrwabmvb.supabase.co/functions/v1/generate-daily-briefings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcXdjbG16bmN1Ymtyd2FibXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTUxNDgsImV4cCI6MjA4ODgzMTE0OH0.1Xj7BncNsxdriorLLxBJOO8gjF4-ZGbrkNkFXB6Bm5Q"}'::jsonb,
    body := '{"industries":["cinema","beauty","beer","cars","charity"]}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- Batch 3: 5:34am
SELECT cron.schedule(
  'briefings-batch-3',
  '34 5 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://siqwclmzncubkrwabmvb.supabase.co/functions/v1/generate-daily-briefings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcXdjbG16bmN1Ymtyd2FibXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTUxNDgsImV4cCI6MjA4ODgzMTE0OH0.1Xj7BncNsxdriorLLxBJOO8gjF4-ZGbrkNkFXB6Bm5Q"}'::jsonb,
    body := '{"industries":["estate-agency","farming","footwear","gaming","hospitality"]}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- Batch 4: 5:36am
SELECT cron.schedule(
  'briefings-batch-4',
  '36 5 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://siqwclmzncubkrwabmvb.supabase.co/functions/v1/generate-daily-briefings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcXdjbG16bmN1Ymtyd2FibXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTUxNDgsImV4cCI6MjA4ODgzMTE0OH0.1Xj7BncNsxdriorLLxBJOO8gjF4-ZGbrkNkFXB6Bm5Q"}'::jsonb,
    body := '{"industries":["health","horse-racing","interior-design","jewellery","journalism"]}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- Batch 5: 5:38am
SELECT cron.schedule(
  'briefings-batch-5',
  '38 5 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://siqwclmzncubkrwabmvb.supabase.co/functions/v1/generate-daily-briefings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcXdjbG16bmN1Ymtyd2FibXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTUxNDgsImV4cCI6MjA4ODgzMTE0OH0.1Xj7BncNsxdriorLLxBJOO8gjF4-ZGbrkNkFXB6Bm5Q"}'::jsonb,
    body := '{"industries":["money","pets","physiotherapy","psychotherapy","teaching"]}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

-- Batch 6: 5:40am
SELECT cron.schedule(
  'briefings-batch-6',
  '40 5 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://siqwclmzncubkrwabmvb.supabase.co/functions/v1/generate-daily-briefings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcXdjbG16bmN1Ymtyd2FibXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTUxNDgsImV4cCI6MjA4ODgzMTE0OH0.1Xj7BncNsxdriorLLxBJOO8gjF4-ZGbrkNkFXB6Bm5Q"}'::jsonb,
    body := '{"industries":["travel","wellness","bakery","influencing","formula-1"]}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
