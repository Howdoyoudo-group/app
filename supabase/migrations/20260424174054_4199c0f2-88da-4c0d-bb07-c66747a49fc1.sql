DELETE FROM public.jobs
WHERE industry = 'horse-racing'
  AND NOT (
    title ~* '\b(horse|race|racing|equine|equestrian|jockey|stable|stud|bloodstock|thoroughbred|paddock|turf|farrier|gallops|BHA|hunt yard|riding|racecourse)\b'
    OR description ~* '\b(horse[- ]?rac|racehorse|racecourse|equine|equestrian|thoroughbred|jockey|bloodstock|stud farm|stud manager|paddock|turf club|BHA|British Horseracing|gallops|point.to.point|riding school|riding centre)\b'
  );