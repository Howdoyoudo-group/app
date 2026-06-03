
-- ============================================
-- GAMING: Remove generic IT/finance jobs not from real game studios
-- ============================================
DELETE FROM jobs
WHERE industry = 'gaming'
  AND company NOT ILIKE ANY (ARRAY[
    '%games%','%studio%','%playstation%','%cloud imperium%','%pixel toys%',
    '%lighthouse%','%rebellion%','%tencent%','%sony%','%nintendo%','%xbox%',
    '%ubisoft%','%activision%','%blizzard%','%riot games%','%epic games%',
    '%unity%','%rockstar%','%king.com%','%bandai%','%sega%','%sumo%',
    '%playtech%','%light & wonder%','%hutch%','%climax%','%homa%','%lego%',
    '%bloxx%','%blue zoo%','%framestore%','%media molecule%',
    '%creative assembly%','%codemasters%','%mediatonic%','%bethesda%',
    '%square enix%','%capcom%','%konami%','%niantic%','%supercell%',
    '%miniclip%','%jagex%','%firesprite%','%housemarque%','%ndreams%',
    '%rocksteady%','%splash damage%','%traveller''s tales%','%natural motion%',
    '%sing king%','%1010 games%','%companion group%','%warner bros%','%autodesk%',
    '%cadence%','%nvidia%','%amd%','%razer%','%logitech%','%steelseries%',
    '%twitch%','%discord%','%bingo%','%bet365%','%entain%','%flutter%',
    '%paddy power%','%betfair%','%william hill%','%coral%','%ladbrokes%',
    '%universally speaking%','%keywords studios%','%pole to win%'
  ])
  AND lower(title) !~ '\m(game|gaming|esports|console|playstation|xbox|nintendo|level design|game design|game art|game engine|unreal|unity 3d|3d artist|character artist|environment artist|technical artist|narrative design|qa tester|game tester|gameplay|game producer|game director|game writer|animator|rigger|vfx artist|gameplay programmer|engine programmer|game audio|sound designer|game ux)\M';

-- ============================================
-- GROCERY: Remove non-grocery retailers
-- ============================================
DELETE FROM jobs
WHERE industry = 'grocery'
  AND (
    company ILIKE '%toolstation%'
    OR company ILIKE '%ikea%'
    OR company ILIKE '%bata%'
    OR company ILIKE '%frontier agriculture%'
    OR company ILIKE '%screwfix%'
    OR company ILIKE '%b&q%'
    OR company ILIKE '%homebase%'
    OR company ILIKE '%wickes%'
    OR company ILIKE '%dunelm%'
    OR company ILIKE '%the range%'
    OR company ILIKE '%argos%'
    OR company ILIKE '%boots%'
    OR company ILIKE '%superdrug%'
    OR company ILIKE '%poundland%'
    OR company ILIKE '%home bargains%'
    OR company ILIKE '%b&m%'
    OR company ILIKE '%matalan%'
    OR company ILIKE '%primark%'
    OR company ILIKE '%tk maxx%'
    OR company ILIKE '%halfords%'
    OR company ILIKE '%pets at home%'
    OR company ILIKE '%card factory%'
    OR company ILIKE '%clarks%'
    OR company ILIKE '%schuh%'
  );

-- ============================================
-- COFFEE: belt-and-braces — remove non-coffee retailers  
-- ============================================
DELETE FROM jobs
WHERE industry = 'coffee'
  AND company NOT ILIKE ANY (ARRAY[
    '%starbucks%','%costa%','%caffe nero%','%cafe nero%','%pret%',
    '%greggs%','%blank street%','%grind%','%gail%','%joe & the juice%',
    '%black sheep%','%notes%','%ozone%','%square mile%','%monmouth%',
    '%workshop%','%kaffeine%','%origin coffee%','%allpress%','%small batch%',
    '%caravan%','%department of coffee%','%pact%','%union hand-roasted%',
    '%lavazza%','%nespresso%','%illy%','%peets%','%dunkin%','%tim hortons%',
    '%cafe%','%coffee%','%espresso%','%barista%','%roastery%','%roasters%',
    '%blue bottle%','%intelligentsia%','%stumptown%','%la marzocco%'
  ]);

-- ============================================
-- FOOTBALL: remove obvious unrelated companies
-- ============================================
DELETE FROM jobs
WHERE industry = 'football'
  AND lower(title) ~ '\m(care assistant|carer|nurse|electrician|plumber|hgv driver|forklift|warehouse operative)\M';

-- ============================================
-- CINEMA: secondary cleanup of misclassified game studios
-- ============================================
UPDATE jobs SET industry='gaming'
WHERE industry='cinema'
  AND (company ILIKE '%games%' OR company ILIKE '%cloud imperium%' OR company ILIKE '%rebellion%' OR company ILIKE '%pixel toys%');

-- ============================================
-- BAKERY: remove non-bakery jobs
-- ============================================
DELETE FROM jobs
WHERE industry = 'bakery'
  AND lower(title) ~ '\m(care assistant|nurse|electrician|plumber|hgv|forklift|warehouse operative|cleaner)\M'
  AND company NOT ILIKE '%bakery%' AND company NOT ILIKE '%bakehouse%' AND company NOT ILIKE '%greggs%' AND company NOT ILIKE '%gail%';
