-- Normalise all job industry values to lowercase slug format
UPDATE jobs SET industry = 'bakery' WHERE industry = 'Bakery';
UPDATE jobs SET industry = 'cinema' WHERE industry IN ('Cinema', 'Film', 'Culture', 'Media');
UPDATE jobs SET industry = 'estate-agency' WHERE industry = 'Estate Agency';
UPDATE jobs SET industry = 'fashion' WHERE industry = 'Fashion';
UPDATE jobs SET industry = 'food-drink' WHERE industry = 'Food & Drink';
UPDATE jobs SET industry = 'football' WHERE industry = 'Football';
UPDATE jobs SET industry = 'footwear' WHERE industry = 'Footwear';
UPDATE jobs SET industry = 'grocery' WHERE industry = 'Grocery';
UPDATE jobs SET industry = 'interior-design' WHERE industry = 'Interior Design';
UPDATE jobs SET industry = 'physiotherapy' WHERE industry = 'Physiotherapy';
UPDATE jobs SET industry = 'psychotherapy' WHERE industry = 'Psychotherapy';
UPDATE jobs SET industry = 'teaching' WHERE industry = 'Teaching';
UPDATE jobs SET industry = 'wellness' WHERE industry = 'Wellness';