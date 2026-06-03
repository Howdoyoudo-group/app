ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS accept_messages boolean NOT NULL DEFAULT true;