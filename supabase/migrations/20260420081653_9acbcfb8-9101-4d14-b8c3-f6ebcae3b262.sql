-- Remove care/social-work pollution that leaked into football, plus generic Reed aggregators
DELETE FROM jobs
WHERE industry = 'football'
  AND (
    title ~* '\m(support worker|care assistant|care worker|carer|nurse|nursing|social worker|healthcare|residential|children''s home|childrens home|domiciliary|paediatric|pastoral|teacher|teaching assistant|tutor|housekeep|cleaner|warehouse|forklift|hgv|electrician|plumber|welder|labourer)\M'
    OR company ~* '\m(appcastenterprise|appcast|witherslack|awd online|hays|reed specialist|michael page|robert walters|adecco|randstad|manpower)\M'
  );

-- Also clean a few obvious cross-industry recruiters from any industry
DELETE FROM jobs
WHERE company ~* '\m(witherslack group|appcastenterprise)\M'
  AND industry NOT IN ('charity', 'teaching', 'wellness');