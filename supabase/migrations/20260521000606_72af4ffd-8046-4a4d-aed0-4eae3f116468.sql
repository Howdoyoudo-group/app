DELETE FROM public.breaking_news
WHERE industry = 'fashion'
  AND (
    url IN (
      'https://uk.fashionnetwork.com/news/Giambattista-valli-buys-back-his-eponymous-label-from-artemis,1926069.html',
      'https://ww.fashionnetwork.com/news/Potential-puig-estee-lauder-merger-held-up-by-the-british-brand-charlotte-tilbury-s-renegotiation,1925724.html',
      'https://fashionunited.in/news/fashion',
      'https://ww.fashionnetwork.com/news/Chanel-returns-to-growth-as-blazy-s-designs-win-over-new-clients,1925813.html'
    )
  );

DELETE FROM public.articles
WHERE industry = 'fashion'
  AND url = 'https://fashionunited.in/news/fashion';