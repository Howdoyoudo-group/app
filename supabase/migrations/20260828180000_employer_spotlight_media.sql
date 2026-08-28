alter table public.pinned_industry_employers
  add column if not exists media_url text,
  add column if not exists media_type text check (media_type in ('image', 'video'));

comment on column public.pinned_industry_employers.media_url is
  'Optional banner image or video URL for the Employer Spotlight tile - uploaded to the company-assets storage bucket, or an external link (e.g. YouTube/Vimeo for video).';
comment on column public.pinned_industry_employers.media_type is
  'Whether media_url is an image or a video - determines how the spotlight tile renders it.';
