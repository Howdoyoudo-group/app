CREATE TABLE public.team_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder TEXT NOT NULL DEFAULT 'General',
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view team docs"
  ON public.team_docs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert team docs"
  ON public.team_docs FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update team docs"
  ON public.team_docs FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete team docs"
  ON public.team_docs FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER team_docs_set_updated_at
  BEFORE UPDATE ON public.team_docs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.team_docs (folder, title, description, url, sort_order) VALUES
('Core Documents', 'HDYD Master Document', 'Covers the Explainer Film, all five episodes, workshops, community ideas and website releases.', 'https://docs.google.com/document/d/1jXcKDPmfVg5ij5Bpsnt4P1sJ6C3S6MG8LGnSnfCN_WY/edit?usp=sharing', 0),
('Core Documents', 'HDYD Tracker', 'Tracks talent, episodes, key dates and contacts.', 'https://docs.google.com/spreadsheets/d/1qwhhyVn-irmAn04CeKWJUalWR1gUsqHF_kELWfHiuyk/edit?gid=2092075795#gid=2092075795', 1);