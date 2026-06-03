
-- Add career tier columns to jobs
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS career_level text,
ADD COLUMN IF NOT EXISTS salary_min numeric,
ADD COLUMN IF NOT EXISTS salary_max numeric;

-- Add career preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS career_level text,
ADD COLUMN IF NOT EXISTS salary_expectation text;

-- Create index for career level filtering
CREATE INDEX IF NOT EXISTS idx_jobs_career_level ON public.jobs (career_level);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_min ON public.jobs (salary_min);

-- Create function to parse salary and classify career level
CREATE OR REPLACE FUNCTION public.classify_job_career_level()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  raw_min numeric;
  raw_max numeric;
  lower_title text;
BEGIN
  -- Parse salary string like "£33,457 - £44,893" or "£12 - £18" (hourly)
  IF NEW.salary IS NOT NULL AND NEW.salary ~ '£' THEN
    raw_min := regexp_replace(
      split_part(regexp_replace(NEW.salary, ',', '', 'g'), '-', 1),
      '[^0-9.]', '', 'g'
    )::numeric;
    
    raw_max := regexp_replace(
      split_part(regexp_replace(NEW.salary, ',', '', 'g'), '-', 2),
      '[^0-9.]', '', 'g'
    )::numeric;
    
    -- If values look like hourly rates (under £100), annualise them
    IF raw_min < 100 THEN
      raw_min := raw_min * 2080; -- 40hrs * 52 weeks
    END IF;
    IF raw_max < 100 THEN
      raw_max := raw_max * 2080;
    END IF;
    
    NEW.salary_min := raw_min;
    NEW.salary_max := CASE WHEN raw_max > 0 THEN raw_max ELSE raw_min END;
  END IF;

  -- Classify career level from title keywords + salary
  lower_title := lower(COALESCE(NEW.title, ''));
  
  IF lower_title ~ '(chief|ceo|cfo|cto|coo|managing director|president|vp |vice president|partner|board)' THEN
    NEW.career_level := 'executive';
  ELSIF lower_title ~ '(director|head of|svp|senior vice|general manager)' THEN
    NEW.career_level := 'executive';
  ELSIF lower_title ~ '(senior|lead|principal|staff|manager|supervisor|team lead|sr\.)' THEN
    NEW.career_level := 'senior';
  ELSIF lower_title ~ '(junior|jr\.|trainee|apprentice|intern|graduate|entry|assistant|aide)' THEN
    NEW.career_level := 'entry';
  ELSIF COALESCE(NEW.salary_max, 0) > 0 THEN
    -- Classify by salary band if title doesn't give clear signals
    IF NEW.salary_max >= 65000 THEN
      NEW.career_level := 'executive';
    ELSIF NEW.salary_max >= 40000 THEN
      NEW.career_level := 'senior';
    ELSIF NEW.salary_max >= 25000 THEN
      NEW.career_level := 'mid';
    ELSE
      NEW.career_level := 'entry';
    END IF;
  ELSE
    NEW.career_level := 'mid'; -- default
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on jobs
CREATE TRIGGER classify_job_level
BEFORE INSERT OR UPDATE OF salary, title ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.classify_job_career_level();
