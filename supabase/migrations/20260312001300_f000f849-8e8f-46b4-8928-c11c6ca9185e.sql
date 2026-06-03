DELETE FROM jobs WHERE industry ILIKE '%charity%' AND id IN (
  SELECT id FROM jobs WHERE industry ILIKE '%charity%' AND lower(title) IN ('senior analytics engineer', 'personal assistant-volunteer', 'nonprofit cloud solution architect', 'qa lead', 'finance controller (foundations)', 'lead functional consultant')
);