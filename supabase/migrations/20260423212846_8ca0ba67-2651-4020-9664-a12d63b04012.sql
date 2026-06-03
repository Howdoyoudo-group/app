-- Purge polluted/off-topic jobs from pets, farming, and teaching feeds.
-- Mirrors the new INDUSTRY_TITLE_BLOCKLIST patterns so existing rows match.

-- FARMING: Uber spam, draughtspersons, care/charity/legal roles, couriers, etc.
DELETE FROM public.jobs
WHERE industry = 'farming'
  AND (
    title ~* '\m(uber|drive with uber|driver account|deliveroo|amazon flex|care assistant|care worker|carer|support worker|nurse|nursing|social worker|charity lawyer|solicitor|paralegal|barrister|hgv class|delivery driver|courier|warehouse operative|forklift|cleaner|housekeep|draughtsperson|draughtsman|draftsman|cad technician|architectural technician|refrigeration|electrician|plumber|cyber security|software engineer)\M'
  );

-- PETS: FE/BTEC teaching roles wrongly classed as pets industry.
DELETE FROM public.jobs
WHERE industry = 'pets'
  AND (
    title ~* '\m(lecturer|fe teacher|further education|btec|examiner|teacher of|sen teacher|primary teacher|secondary teacher|teaching assistant|tutor|cyber security|cybersecurity|software engineer|java developer|devops|sre|kafka|sap consultant)\M'
  );

-- TEACHING: Marketing/legal/swim/psychology graduate noise.
DELETE FROM public.jobs
WHERE industry = 'teaching'
  AND (
    title ~* '\m(plumber|electrician|welder|forklift|hgv driver|cyber security|software engineer|paralegal|solicitor|barrister|legal counsel|swim school|lifeguard|marketing executive|marketing manager|marketing assistant|sales executive|recruitment consultant|estate agent|nurse|nursing|care assistant|support worker|psychologist|aspiring child|psychology graduate)\M'
  );