
-- 1. Reclassify WPP jobs: influencing -> marketing, normalise company name
UPDATE public.jobs
SET industry = 'marketing',
    company  = 'WPP'
WHERE company ILIKE '%wpp%'
  AND industry = 'influencing';

-- 2. Decode HTML entities + strip residual tags from existing descriptions.
-- Handles double-encoded greenhouse payloads (&amp;lt;div&amp;gt;).
UPDATE public.jobs
SET description = trim(regexp_replace(
    regexp_replace(
        replace(replace(replace(replace(replace(replace(replace(replace(
        replace(replace(replace(replace(replace(replace(replace(replace(
            description,
            '&amp;nbsp;', ' '),
            '&amp;amp;', '&'),
            '&amp;quot;', '"'),
            '&amp;#39;', ''''),
            '&amp;lt;', '<'),
            '&amp;gt;', '>'),
            '&nbsp;', ' '),
            '&amp;', '&'),
            '&quot;', '"'),
            '&#39;', ''''),
            '&apos;', ''''),
            '&lt;', '<'),
            '&gt;', '>'),
            '&rsquo;', ''''),
            '&lsquo;', ''''),
            '&hellip;', '...'),
        '<[^>]*>', ' ', 'g'),
    '\s+', ' ', 'g'))
WHERE description LIKE '%&lt;%'
   OR description LIKE '%&gt;%'
   OR description LIKE '%&nbsp;%'
   OR description LIKE '%&amp;%'
   OR description LIKE '%&#39;%'
   OR description LIKE '%&quot;%';
