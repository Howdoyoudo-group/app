-- Remove any breaking_news rows where the publisher URL itself carries a
-- year/month/day older than 21 days. These slipped in when the ingester
-- fabricated published_at = now() for items without a real RSS pubDate.
DELETE FROM public.breaking_news
WHERE url ~ '/(20[0-9]{2})/(0[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/'
  AND (
    -- /YYYY/MM/... numeric form
    (substring(url from '/(20[0-9]{2})/(0[1-9]|1[0-2])/')::text IS NOT NULL
      AND (to_date(substring(url from '/(20[0-9]{2}/(?:0[1-9]|1[0-2])/(?:[0-3]?[0-9]))'), 'YYYY/MM/DD') < (now() - interval '21 days'))
    )
    OR
    -- /YYYY/mon/... textual month form (Guardian etc.)
    (substring(url from '/(20[0-9]{2})/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/') IS NOT NULL
      AND (to_date(substring(url from '/(20[0-9]{2}/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/(?:[0-3]?[0-9]))'), 'YYYY/Mon/DD') < (now() - interval '21 days'))
    )
  );

-- Hard-remove the two contradictory Dr. Martens "profit warning" headlines
-- the user flagged - both are Jan 2024 BBC/Sky stories whose URLs carry no
-- date so the slug-age check above can't reach them.
DELETE FROM public.breaking_news
WHERE url IN (
  'https://www.bbc.co.uk/news/business-68294526',
  'https://news.sky.com/story/dr-martens-shares-jump-as-bootmaker-outlines-plans-for-turnaround-of-us-business-13128046'
);