-- Add home_address column to profiles table
ALTER TABLE public.profiles ADD COLUMN home_address TEXT;

-- Update existing RLS policies to include the new column (policies use column-level security through SELECT/UPDATE)
-- No policy changes needed since profiles RLS policies are user-scoped on user_id