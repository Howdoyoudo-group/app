DELETE FROM jobs WHERE source_url = 'motorsportjobs.com' AND (
  title ~ '^\w+\(\d+\)$' 
  OR title IN ('Register', 'United Kingdom', 'United States', 'Italy', 'Switzerland', 'France', 'Mechanical Engineering', 'Racing Team', 'Production', 'Electrical Engineering', 'Management', 'Aerodynamics', 'Software Engineering', 'Procurement', 'Business', 'Finance')
  OR title ~ '^[a-z ]+\(\d+\)$'
  OR description = 'Direct listing discovered from Motorsportjobs.com.'
);