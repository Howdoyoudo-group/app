DELETE FROM public.breaking_news
WHERE industry = 'football'
  AND (
    url ~* '://(www\.)?(nflpa|wnfcfootball|nfl|espn|cbssports|nbcsports|pro-football-reference|profootballtalk\.nbcsports)\.com'
    OR title ~* '\m(NFL|NFLPA|WNFC|Super Bowl|NCAA|college football|Aaron Rodgers|Patrick Mahomes|quarterback|touchdown|gridiron|American football)\M'
  );

DELETE FROM public.articles
WHERE industry = 'football'
  AND (
    url ~* '://(www\.)?(nflpa|wnfcfootball|nfl|espn|cbssports|nbcsports|pro-football-reference|profootballtalk\.nbcsports)\.com'
    OR title ~* '\m(NFL|NFLPA|WNFC|Super Bowl|NCAA|college football|Aaron Rodgers|Patrick Mahomes|quarterback|touchdown|gridiron|American football)\M'
  );

DELETE FROM public.daily_briefings
WHERE industry = 'football' AND briefing_date = CURRENT_DATE;