CREATE OR REPLACE FUNCTION public.classify_job_career_level()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  raw_min numeric;
  raw_max numeric;
  lower_title text;
  normalized text;
  parts text[];
BEGIN
  IF NEW.salary IS NOT NULL AND NEW.salary ~ '£' THEN
    normalized := regexp_replace(regexp_replace(NEW.salary, ',', '', 'g'), '–', '-', 'g');
    parts := regexp_matches(normalized, '£([0-9.]+).*£([0-9.]+)', 'i');
    IF parts IS NOT NULL THEN
      raw_min := parts[1]::numeric;
      raw_max := parts[2]::numeric;
    ELSE
      raw_min := regexp_replace(split_part(normalized, '-', 1), '[^0-9.]', '', 'g')::numeric;
      raw_max := raw_min;
    END IF;
    IF raw_min < 100 THEN raw_min := raw_min * 2080; END IF;
    IF raw_max < 100 THEN raw_max := raw_max * 2080; END IF;
    NEW.salary_min := raw_min;
    NEW.salary_max := CASE WHEN raw_max > 0 THEN raw_max ELSE raw_min END;
  END IF;

  lower_title := lower(COALESCE(NEW.title, ''));

  -- Single-site / shop-floor manager titles must NEVER be executive,
  -- even if they contain "general manager" or "director" of a single store.
  IF lower_title ~ '(restaurant general manager|store general manager|shop general manager|branch general manager|restaurant manager|store manager|shop manager|branch manager|assistant manager|deputy manager|shift manager|duty manager|kitchen manager|bar manager|cafe manager|hotel manager|venue manager|site manager|location manager|club manager)' THEN
    NEW.career_level := 'senior';
  ELSIF lower_title ~ '(chief|ceo|cfo|cto|coo|managing director|president|vp |vice president|partner|board|svp|senior vice)' THEN
    NEW.career_level := 'executive';
  ELSIF lower_title ~ '(head of|director of|director,|^director |group director|regional director|country director|brand director|commercial director|operations director|finance director|marketing director|people director|strategy director|sales director)' THEN
    NEW.career_level := 'executive';
  ELSIF lower_title ~ '(senior|lead|principal|staff|manager|supervisor|team lead|sr\.|head chef|sous chef)' THEN
    NEW.career_level := 'senior';
  ELSIF lower_title ~ '(junior|jr\.|trainee|apprentice|intern|graduate|entry|assistant|aide|crew member|team member|kitchen porter|kitchen assistant|barista|waiter|waitress|cashier|cleaner|host|hostess|sales assistant|shop assistant|warehouse operative)' THEN
    NEW.career_level := 'entry';
  ELSIF COALESCE(NEW.salary_max, 0) > 0 THEN
    IF NEW.salary_max >= 80000 THEN NEW.career_level := 'executive';
    ELSIF NEW.salary_max >= 45000 THEN NEW.career_level := 'senior';
    ELSIF NEW.salary_max >= 28000 THEN NEW.career_level := 'mid';
    ELSE NEW.career_level := 'entry';
    END IF;
  ELSE
    NEW.career_level := 'mid';
  END IF;
  RETURN NEW;
END;
$function$;

-- Re-classify all existing live jobs so the fix applies retroactively.
UPDATE public.jobs
SET title = title
WHERE expires_at IS NULL OR expires_at > now();