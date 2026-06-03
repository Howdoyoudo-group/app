-- Remove obviously fake / hallucinated breaking_news URLs that Perplexity
-- generated before the URL validator was tightened. Pattern: pure-numeric or
-- "article123"/"story456" final path segments which never resolve to a real
-- story on the publisher.
DELETE FROM public.breaking_news
WHERE url ~* '/(article|story|post|item)?[0-9]{4,}/?$';

-- Also drop anything fetched more than 60 days ago — the inbox feed only
-- shows last 30 days anyway, and stale rows just bloat tables.
DELETE FROM public.breaking_news
WHERE fetched_at < now() - interval '60 days';

DELETE FROM public.articles
WHERE scraped_at < now() - interval '60 days';