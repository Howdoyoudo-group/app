
CREATE OR REPLACE FUNCTION public.classify_job_career_level()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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
  IF lower_title ~ '(chief|ceo|cfo|cto|coo|managing director|president|vp |vice president|partner|board|director|head of|svp|senior vice|general manager)' THEN
    NEW.career_level := 'executive';
  ELSIF lower_title ~ '(senior|lead|principal|staff|manager|supervisor|team lead|sr\.)' THEN
    NEW.career_level := 'senior';
  ELSIF lower_title ~ '(junior|jr\.|trainee|apprentice|intern|graduate|entry|assistant|aide)' THEN
    NEW.career_level := 'entry';
  ELSIF COALESCE(NEW.salary_max, 0) > 0 THEN
    IF NEW.salary_max >= 65000 THEN NEW.career_level := 'executive';
    ELSIF NEW.salary_max >= 40000 THEN NEW.career_level := 'senior';
    ELSIF NEW.salary_max >= 25000 THEN NEW.career_level := 'mid';
    ELSE NEW.career_level := 'entry';
    END IF;
  ELSE
    NEW.career_level := 'mid';
  END IF;
  RETURN NEW;
END;
$$;
