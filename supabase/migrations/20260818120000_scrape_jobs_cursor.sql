-- scrape-jobs previously tried all 441 CAREER_SOURCES companies in one
-- synchronous request every run and was silently hitting Supabase's 150s
-- idle timeout after only ~5 companies, every single time (it has no
-- background-task pattern, unlike fetch-external-jobs). This cursor lets it
-- process a bounded batch per invocation and resume from where it left off
-- next time, the same pattern already used by validate-jobs (validate_cursor).
create table if not exists scrape_jobs_cursor (
  id boolean primary key default true,
  last_index int not null default 0,
  updated_at timestamptz not null default now(),
  constraint scrape_jobs_cursor_single_row check (id)
);

insert into scrape_jobs_cursor (id, last_index) values (true, 0)
  on conflict (id) do nothing;
