
-- Purge Reed jobs in beauty/wellness that don't match the current signal regex.
-- BEAUTY: scope=title+company. Keep only rows where title or company contains a real beauty term.
DELETE FROM public.jobs
WHERE source_url = 'reed.co.uk'
  AND industry = 'beauty'
  AND NOT (
    (title || ' ' || COALESCE(company,'')) ~* '\m(beauty (therapist|advisor|consultant|counter|manager|expert|assistant|specialist|trainer|salon|brand)|beautician|aesthetician|aesthetic (nurse|practitioner|clinic)|hair (stylist|salon|colour|colourist|technician|extension)|hairdress(er|ing)|barber(ing|shop)?|makeup (artist|consultant|advisor)|mua|nail (technician|artist|bar)|manicur|pedicur|lash (tech|artist|technician)|brow (artist|technician|bar)|salon manager|spa (manager|therapist|host)|skincare|skin (therapist|specialist|expert)|cosmetic(s)? (buyer|brand|counter|advisor|consultant|trainer|merchandiser|developer|chemist|formulator|product|category)|fragrance (advisor|consultant|buyer|counter)|haircare|perfumer|sephora|space ?nk|charlotte tilbury|the body shop|loreal|l''oreal|l''oréal|estee lauder|estée lauder|mac cosmetics|benefit cosmetics|bobbi brown|clinique|nars|rituals|lush|elemis|liz earle|trinny london|huda beauty|drunk elephant|glossier|fenty beauty|bare ?minerals|illamasqua|morphe|too faced|urban decay|sally beauty|cult beauty|lookfantastic|feel ?unique|boots no7|no7)\M'
  );

-- WELLNESS: scope=title+company+description. Keep only rows matching wellness terms.
-- NOTE: drop "\bpt\b" from the check because it false-matches countless part-time/PT references.
DELETE FROM public.jobs
WHERE source_url = 'reed.co.uk'
  AND industry = 'wellness'
  AND NOT (
    (title || ' ' || COALESCE(company,'') || ' ' || COALESCE(description,'')) ~* '\m(gym|personal trainer|fitness instructor|fitness coach|wellness coach|wellbeing coach|nutritionist|dietitian|nutrition coach|yoga (instructor|teacher)|pilates (instructor|teacher)|spa (manager|therapist|host)|spa receptionist|massage therapist|sports therapist|holistic therapist|meditation|mindfulness|breathwork|reformer pilates|barre instructor|class instructor|group exercise|exercise referral|health coach|life coach|wellness centre|wellness retreat|activewear|sweaty betty|lululemon|gymshark|barry''s|psycle|third space|equinox|david lloyd|virgin active|nuffield health|pure gym|the gym group|fitness first|f45|orangetheory|peloton|les mills)\M'
  );
