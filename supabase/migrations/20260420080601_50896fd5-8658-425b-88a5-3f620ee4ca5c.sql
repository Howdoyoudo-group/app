-- Remove cross-industry pollution: IT/cyber jobs, charity store roles, energy/aerospace companies in unrelated feeds
-- Targets verified pollution: Hitachi Energy, British Heart Foundation, Diamond Light Source, Saab UK, Scania, Leonardo, Booker Group, etc.

-- 1. Delete IT/cyber/dev pollution from non-tech industries
DELETE FROM jobs
WHERE title ~* '\m(cyber security|cybersecurity|it support|software engineer|devops|sre|data engineer|cloud engineer|java developer|\.net developer|salesforce developer|sap consultant|oracle dba|kafka engineer|spring boot|backend engineer|frontend engineer|full[- ]?stack|qa engineer|test engineer|systems engineer|network engineer|infrastructure engineer)\M'
AND industry NOT IN ('gaming', 'tech', 'remote', 'graduate');

-- 2. Delete British Heart Foundation jobs from non-charity industries (they're a charity)
DELETE FROM jobs
WHERE company ILIKE '%british heart foundation%'
AND industry != 'charity';

-- 3. Delete energy/aerospace/scientific companies from unrelated industries
DELETE FROM jobs
WHERE (
  company ILIKE '%hitachi%'
  OR company ILIKE '%diamond light source%'
  OR company ILIKE '%saab%'
  OR company ILIKE '%leonardo%'
  OR company ILIKE '%scania%'
  OR company ILIKE '%bio-techne%'
  OR company ILIKE '%vitality%'
  OR company ILIKE '%ge vernova%'
  OR company ILIKE '%vernova%'
  OR company ILIKE '%roku%'
)
AND industry NOT IN ('cars', 'tech', 'graduate');

-- 4. Delete charity-shop roles bleeding into hospitality/wellness
DELETE FROM jobs
WHERE title ~* '\m(charity shop|store manager)\M'
AND company ILIKE '%foundation%'
AND industry != 'charity';

-- 5. Delete generic recruiters from non-graduate industries (they spam everything)
DELETE FROM jobs
WHERE company ~* '\m(versorecruitment|wayman learning|netcom online|love finance limited|newto training|lorien|addition|nexter\.co\.uk|avanti recruitment|la fosse associates|marchant recruitment|oscar technology|sa group|qa apprenticeships)\M'
AND industry NOT IN ('graduate', 'remote');

-- 6. Booker Group is grocery wholesale, not coffee
DELETE FROM jobs
WHERE company ILIKE '%booker group%'
AND industry != 'grocery';