UPDATE public.jobs
SET
  type = 'Full-time',
  tags = COALESCE(array_remove(array_remove(tags, 'Graduate'), 'Internship'), ARRAY[]::text[])
WHERE
  (type = 'Internship' OR 'Graduate' = ANY(COALESCE(tags, ARRAY[]::text[])) OR 'Internship' = ANY(COALESCE(tags, ARRAY[]::text[])))
  AND (
    title !~* '\m(graduate|intern|internship|placement|trainee|apprentice|apprenticeship|spring week|summer analyst|year in industry|industrial placement)\M'
    OR title ~* '\m(crane|forklift|fork lift|hgv|lgv|pcv|driver|warehouse operative|warehouse worker|labourer|cleaner|chef|cook|barista|bartender|waiter|waitress|carer|care assistant|support worker|nurse|electrician|plumber|welder|machinist|mechanic|operative|operator|fitter|fabricator|joiner|carpenter|bricklayer|scaffolder|roofer|painter|decorator|gardener|groundsman|porter|stocker|picker|packer|cashier|sales assistant|retail assistant|kitchen assistant|housekeeper|security guard|receptionist|administrator|admin assistant|teaching assistant|nursery assistant|hairdresser|beautician|dog walker|delivery|courier|technician)\M'
  );