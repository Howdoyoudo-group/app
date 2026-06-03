create table public.pinned_industry_employers (
  id uuid primary key default gen_random_uuid(),
  industry text not null,
  company_name text not null,
  rank integer not null default 0,
  tagline text,
  logo_url text,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (industry, company_name)
);

create index idx_pinned_industry_employers_industry_rank
  on public.pinned_industry_employers (industry, rank, company_name);

alter table public.pinned_industry_employers enable row level security;

create policy "Pinned employers are publicly readable"
  on public.pinned_industry_employers
  for select
  using (true);

create policy "Admins manage pinned employers"
  on public.pinned_industry_employers
  for all
  to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

create trigger trg_pinned_industry_employers_updated
  before update on public.pinned_industry_employers
  for each row execute function public.set_updated_at();