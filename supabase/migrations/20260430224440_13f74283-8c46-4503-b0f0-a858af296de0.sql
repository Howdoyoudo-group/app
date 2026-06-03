
-- Remove obvious cross-industry brand contamination.
-- Mirrors the new CROSS_INDUSTRY_BRAND_BLOCKLIST in fetch-external-jobs.
-- We delete rather than expire so the URL unique index stays clean for future re-fetches
-- (those re-fetches will now be blocked at ingestion time).

WITH bad_cinema AS (
  SELECT id FROM public.jobs
  WHERE industry = 'cinema'
    AND lower(company) ~ '\b(uniqlo|zara|primark|h&m|asos|boohoo|next plc|next retail|ted baker|reiss|whistles|hobbs|jigsaw|river island|new look|peacocks|matalan|tk maxx|fat face|white stuff|seasalt|joules|barbour|fred perry|ben sherman|superdry|all ?saints|urban outfitters|abercrombie|hollister|tommy hilfiger|calvin klein|ralph lauren|lacoste|topshop|topman|monsoon|accessorize|french connection|tesco|sainsbury|asda|morrisons|aldi|lidl|waitrose|co-?op food|iceland foods|ocado|home bargains|b&m retail|wilko|gail|pret|greggs|costa coffee|starbucks|caffe nero|caff[èe] nero|nero group|leon restaurants|itsu|wagamama|nando|pizza express|pizza hut|domino|kfc|mcdonald|burger king|five guys|subway|premier inn|travelodge|hilton|marriott|holiday inn|whitbread|stonegate|greene king|wetherspoon|haart|foxtons|savills|knight frank|hamptons|chestertons|winkworth|dexters|connells|countrywide|william h brown|martin & co|belvoir|reeds rains|bupa|nuffield health|spire healthcare|priory group|barchester|hc-?one|care uk|hamberley|voyage care|witherslack|caretech|allied healthcare|agria|arnold clark|sytner|lookers|vertu motors|inchcape|kwik fit|halfords autocentre|pets at home|vets4pets|medivet|ivc evidensia|jollyes|barclays|hsbc|natwest|lloyds bank|santander uk|nationwide building|tsb bank|metro bank|monzo|starling|paypal|klarna|capital one|bt group|openreach|virgin media|talktalk|vodafone|hyperoptic|cityfibre|british gas|centrica|edf energy|octopus energy|ovo energy|scottish power|sse plc|drax|national grid|yodel|dpd|evri|hermes|royal mail|parcelforce|fedex|tnt express|dhl supply|gxo|wincanton|xpo logistics|culina|stobart|zachary daniels|four squared|norfolk capsey|bv recruitment|grapevine jobs|harnham|pyramid recruitment|rocking zebra|get staffed|handle recruitment|christy media)\b'
),
bad_music AS (
  SELECT id FROM public.jobs
  WHERE industry = 'music'
    AND lower(company) ~ '\b(uniqlo|zara|primark|h&m|asos|boohoo|next plc|next retail|ted baker|reiss|whistles|hobbs|jigsaw|river island|new look|matalan|tk maxx|fat face|white stuff|seasalt|joules|barbour|superdry|all ?saints|urban outfitters|abercrombie|hollister|tommy hilfiger|topshop|monsoon|accessorize|tesco|sainsbury|asda|morrisons|aldi|lidl|waitrose|co-?op food|iceland foods|ocado|home bargains|b&m retail|wilko|gail|pret|greggs|costa coffee|starbucks|caffe nero|nero group|wagamama|nando|pizza express|pizza hut|kfc|mcdonald|burger king|five guys|premier inn|travelodge|hilton|marriott|whitbread|wetherspoon|haart|foxtons|savills|knight frank|chestertons|connells|countrywide|martin & co|belvoir|bupa|nuffield health|spire healthcare|priory group|barchester|hc-?one|care uk|hamberley|voyage care|witherslack|arnold clark|sytner|lookers|vertu motors|inchcape|kwik fit|pets at home|vets4pets|medivet|jollyes|barclays|hsbc|natwest|lloyds bank|santander uk|nationwide building|tsb bank|monzo|starling|paypal|klarna|bt group|openreach|virgin media|talktalk|vodafone|british gas|centrica|edf energy|octopus energy|ovo energy|scottish power|drax|national grid|yodel|dpd|evri|hermes|royal mail|fedex|tnt express|dhl supply|gxo|wincanton|xpo logistics)\b'
),
bad_football AS (
  SELECT id FROM public.jobs
  WHERE industry = 'football'
    AND lower(company) ~ '\b(uniqlo|zara|primark|h&m|asos|boohoo|next plc|next retail|ted baker|reiss|river island|new look|matalan|tk maxx|fat face|joules|barbour|superdry|urban outfitters|abercrombie|hollister|topshop|monsoon|accessorize|tesco|sainsbury|asda|morrisons|aldi|lidl|waitrose|co-?op food|iceland foods|ocado|home bargains|b&m retail|wilko|gail|pret|greggs|costa coffee|starbucks|caffe nero|wagamama|nando|pizza express|kfc|mcdonald|burger king|premier inn|travelodge|hilton|marriott|whitbread|wetherspoon|haart|foxtons|savills|knight frank|chestertons|connells|countrywide|martin & co|belvoir|bupa|nuffield health|spire healthcare|priory group|barchester|hc-?one|care uk|hamberley|voyage care|witherslack|pets at home|vets4pets|medivet|jollyes|barclays|hsbc|natwest|lloyds bank|santander uk|monzo|starling|bt group|openreach|virgin media|vodafone|british gas|centrica|edf energy|octopus energy|ovo energy|yodel|dpd|evri|hermes|royal mail|fedex|dhl supply|gxo|wincanton)\b'
),
bad_beauty AS (
  SELECT id FROM public.jobs
  WHERE industry = 'beauty'
    AND lower(company) ~ '\b(tesco|sainsbury|asda|morrisons|aldi|lidl|iceland foods|ocado|home bargains|b&m retail|wilko|gail|pret|greggs|wagamama|nando|pizza express|kfc|mcdonald|burger king|premier inn|travelodge|hilton|marriott|whitbread|wetherspoon|haart|foxtons|savills|chestertons|connells|countrywide|belvoir|bupa|nuffield health|spire healthcare|priory group|barchester|hc-?one|care uk|hamberley|voyage care|witherslack|arnold clark|sytner|lookers|vertu motors|inchcape|kwik fit|barclays|hsbc|natwest|lloyds bank|santander uk|bt group|openreach|virgin media|vodafone|yodel|dpd|evri|royal mail|fedex|dhl supply|gxo|wincanton)\b'
),
bad_fashion AS (
  SELECT id FROM public.jobs
  WHERE industry = 'fashion'
    AND lower(company) ~ '\b(tesco|sainsbury|asda|morrisons|aldi|lidl|iceland foods|ocado|gail|pret|greggs|costa coffee|starbucks|caffe nero|wagamama|nando|pizza express|kfc|mcdonald|burger king|premier inn|travelodge|hilton|marriott|whitbread|wetherspoon|bupa|nuffield health|spire healthcare|priory group|barchester|hc-?one|care uk|hamberley|voyage care|arnold clark|sytner|lookers|vertu motors|kwik fit|pets at home|vets4pets|medivet|barclays|hsbc|natwest|lloyds bank|santander uk|bt group|openreach|virgin media|vodafone|british gas|centrica|edf energy|octopus energy|ovo energy|yodel|dpd|evri|hermes|royal mail|fedex|dhl supply|gxo|wincanton|deloitte|kpmg|pricewaterhousecoopers|ernst & young|accenture|capgemini|atos)\b'
)
DELETE FROM public.jobs
WHERE id IN (
  SELECT id FROM bad_cinema
  UNION ALL SELECT id FROM bad_music
  UNION ALL SELECT id FROM bad_football
  UNION ALL SELECT id FROM bad_beauty
  UNION ALL SELECT id FROM bad_fashion
);
