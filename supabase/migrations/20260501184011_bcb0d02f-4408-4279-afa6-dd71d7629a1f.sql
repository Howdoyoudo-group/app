DELETE FROM jobs WHERE industry = 'beer' AND (
  company ILIKE '%brewer morris%' 
  OR company ILIKE '%expedia%' 
  OR company ILIKE '%la fosse%' 
  OR company ILIKE '%yodel%' 
  OR company ILIKE '%larbey%' 
  OR company ILIKE '%nala%' 
  OR company ILIKE '%gearing recruitment%'
);