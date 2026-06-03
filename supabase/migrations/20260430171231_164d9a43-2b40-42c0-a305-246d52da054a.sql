UPDATE public.jobs
SET role_category = NULL
WHERE role_category = 'influencing'
  AND (expires_at IS NULL OR expires_at > now())
  AND title !~* '\m(influencer|creator|tiktok|youtube|youtuber|vlogger|instagram|reels|community manager|social media|paid social|content creator|creator partnerships|booker|podcast|podcaster|newsletter writer|substack|streamer|twitch|video editor|videographer|thumbnail|motion designer|social strategist|influencer marketing|branded content|short.?form video|youtube seo|audience growth)\M';