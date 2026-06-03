
-- Sync profiles → subscribers so newly signed-up users automatically receive
-- the daily newsletter for the industries they selected during onboarding.

CREATE OR REPLACE FUNCTION public.sync_profile_to_subscribers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_name text;
BEGIN
  -- Only sync when the user actually wants newsletters for at least one industry.
  IF NEW.newsletter_industries IS NULL OR array_length(NEW.newsletter_industries, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = NEW.id;
  IF v_email IS NULL OR v_email = '' THEN
    RETURN NEW;
  END IF;

  v_name := COALESCE(NULLIF(NEW.full_name, ''), split_part(v_email, '@', 1));

  INSERT INTO public.subscribers (name, email, industry_interests, newsletter_industries)
  VALUES (v_name, v_email, COALESCE(NEW.industry_interests, '{}'::text[]), NEW.newsletter_industries)
  ON CONFLICT (email) DO UPDATE
    SET name = EXCLUDED.name,
        industry_interests = EXCLUDED.industry_interests,
        newsletter_industries = EXCLUDED.newsletter_industries;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_to_subscribers ON public.profiles;

CREATE TRIGGER trg_sync_profile_to_subscribers
AFTER INSERT OR UPDATE OF newsletter_industries, industry_interests, full_name ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_to_subscribers();
