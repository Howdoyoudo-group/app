-- Clean garbage jobs from the database
-- 1. Eteach broken links (87 rows)
DELETE FROM jobs WHERE url LIKE '%eteach.com/#';

-- 2. MUBI cast pages (not jobs)
DELETE FROM jobs WHERE url LIKE '%mubi.com/en/cast%';

-- 3. Renaissance Learning support articles
DELETE FROM jobs WHERE url LIKE '%support.renaissance%';

-- 4. Sky Sports blog posts (not vacancies)
DELETE FROM jobs WHERE url LIKE '%careers.sky.com/blog%';

-- 5. Barry's APAC jobs (not UK)
DELETE FROM jobs WHERE url LIKE '%barrys.com/apac%';

-- 6. ME+EM product pages
DELETE FROM jobs WHERE company = 'ME+EM' AND url NOT LIKE '%career%' AND url NOT LIKE '%job%' AND url ~* '/(us/|shop/|collection|trainer|sneaker|dress|skirt|trouser|jacket|coat|knit|shirt|top-)';

-- 7. Purplebricks property guides
DELETE FROM jobs WHERE url LIKE '%purplebricks.co.uk/property-guides%';

-- 8. Winkworth buyer guides
DELETE FROM jobs WHERE url LIKE '%winkworth.co.uk/buying%';

-- 9. Brakes product-assurance page
DELETE FROM jobs WHERE url LIKE '%brake.co.uk/why-brakes/product-assurance%';

-- 10. Diageo Australia jobs
DELETE FROM jobs WHERE title ILIKE '%australia%';

-- 11. Nuffield Health non-job service pages
DELETE FROM jobs WHERE company = 'Nuffield Health' AND url LIKE '%nuffieldhealth.com/healthcare-professionals%';

-- 12. Cranswick investor pages
DELETE FROM jobs WHERE url LIKE '%cranswick.plc.uk/investors%';

-- 13. Zara/Inditex generic listing pages (no specific job ID)
DELETE FROM jobs WHERE company LIKE '%Zara%' AND url LIKE '%inditexcareers%' AND url NOT LIKE '%/offer/%';

-- 14. Relate non-job pages
DELETE FROM jobs WHERE company = 'Relate' AND url LIKE '%relate.org.uk/%' AND url NOT LIKE '%/job%' AND url NOT LIKE '%/career%' AND url NOT LIKE '%/vacanc%';

-- 15. Hamptons property-consultant (service page, not a job)
DELETE FROM jobs WHERE url LIKE '%hamptons.co.uk/property-consultant';

-- 16. Charity Job category pages (not specific jobs)
DELETE FROM jobs WHERE company = 'Charity Job' AND url ~* 'charityjob\.co\.uk/[a-z-]+-jobs$';