-- Employer Spotlight: let admins control the full tile content, not just
-- which company is pinned. Adds the "why work here" bullet list and an
-- active flag (soft-hide without losing the row / rank ordering).
alter table public.pinned_industry_employers
  add column if not exists why_work_here text[] not null default '{}',
  add column if not exists active boolean not null default true;

comment on column public.pinned_industry_employers.why_work_here is
  'Short bullet points shown on the Employer Spotlight tile ("Why work here").';
comment on column public.pinned_industry_employers.active is
  'Soft toggle - inactive rows are excluded from the spotlight without deleting them.';
