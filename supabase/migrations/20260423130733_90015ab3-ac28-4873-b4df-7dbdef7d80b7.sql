ALTER TABLE public.contact_requests
DROP CONSTRAINT IF EXISTS contact_requests_status_check;

ALTER TABLE public.contact_requests
ADD CONSTRAINT contact_requests_status_check
CHECK (status IN ('pending', 'accepted', 'declined', 'replied'));