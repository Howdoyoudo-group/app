DELETE FROM public.articles
WHERE url ~* '^https?://([a-z0-9-]+\.)*(news\.google\.com|google\.(com|co\.uk)|news\.yahoo\.com|yahoo\.com|msn\.com|bing\.com|apple\.news|flipboard\.com|smartnews\.com|duckduckgo\.com|feedly\.com|t\.co|lnkd\.in|bit\.ly|tinyurl\.com)(/|$)'
   OR url ~* '/(search|results|topic|topics|tag|tags|category|categories|section|sections)(/|$)'
   OR url ~* '[?&](q|query)=';