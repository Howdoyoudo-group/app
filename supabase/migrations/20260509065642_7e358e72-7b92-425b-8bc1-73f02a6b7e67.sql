CREATE TABLE public.saved_feed_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_key)
);

ALTER TABLE public.saved_feed_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved feed items"
ON public.saved_feed_items FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved feed items"
ON public.saved_feed_items FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved feed items"
ON public.saved_feed_items FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_saved_feed_items_user_type ON public.saved_feed_items (user_id, item_type, created_at DESC);