DELETE FROM jobs WHERE source_url = 'redbullracing.com' AND (
  title IN ('Races', 'Team', 'Cars', 'My Paddock', 'Web3', 'Partners', 'Careers', 'Hospitality', 'Podcast')
  OR url NOT LIKE '%/job%'
  OR description LIKE '%Direct listing discovered from Red Bull Racing.%'
);