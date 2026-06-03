
-- 1. Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS member_directory_opt_in boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS member_bio text;

-- 2. Connections table
CREATE TABLE IF NOT EXISTS public.member_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  CONSTRAINT member_connections_self_check CHECK (requester_id <> recipient_id),
  CONSTRAINT member_connections_unique_pair UNIQUE (requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS member_connections_requester_idx ON public.member_connections(requester_id);
CREATE INDEX IF NOT EXISTS member_connections_recipient_idx ON public.member_connections(recipient_id);
CREATE INDEX IF NOT EXISTS member_connections_status_idx ON public.member_connections(status);

ALTER TABLE public.member_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their own connections"
  ON public.member_connections FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Members create their own connection requests"
  ON public.member_connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipients respond, requesters cancel"
  ON public.member_connections FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id)
  WITH CHECK (auth.uid() = recipient_id OR auth.uid() = requester_id);

CREATE POLICY "Either party can remove a connection"
  ON public.member_connections FOR DELETE TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS member_connections_set_updated_at ON public.member_connections;
CREATE TRIGGER member_connections_set_updated_at
  BEFORE UPDATE ON public.member_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Helper to test mutual acceptance
CREATE OR REPLACE FUNCTION public.are_members_connected(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.member_connections
    WHERE status = 'accepted'
      AND ((requester_id = _a AND recipient_id = _b)
        OR (requester_id = _b AND recipient_id = _a))
  );
$$;

-- 4. Messages table
CREATE TABLE IF NOT EXISTS public.member_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  body text NOT NULL CHECK (length(btrim(body)) > 0 AND length(body) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT member_messages_self_check CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS member_messages_pair_idx
  ON public.member_messages(LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), created_at DESC);
CREATE INDEX IF NOT EXISTS member_messages_recipient_unread_idx
  ON public.member_messages(recipient_id) WHERE read_at IS NULL;

ALTER TABLE public.member_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their own messages"
  ON public.member_messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Members send only to connections"
  ON public.member_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.are_members_connected(sender_id, recipient_id)
  );

CREATE POLICY "Recipients can mark messages read"
  ON public.member_messages FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Senders can delete their own messages"
  ON public.member_messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

-- 5. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.member_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.member_connections;

-- 6. Member directory: SECURITY DEFINER functions exposing only safe fields
CREATE OR REPLACE FUNCTION public.get_member_directory(
  _search text DEFAULT NULL,
  _industry text DEFAULT NULL,
  _limit int DEFAULT 60,
  _offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  full_name text,
  photo_url text,
  home_town text,
  career_level text,
  member_bio text,
  industry_interests text[],
  role_preferences text[],
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.photo_url, p.home_town, p.career_level,
         p.member_bio, p.industry_interests, p.role_preferences, p.created_at
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.member_directory_opt_in = true
    AND p.id <> auth.uid()
    AND COALESCE(p.full_name, '') <> ''
    AND (
      _search IS NULL OR _search = ''
      OR p.full_name ILIKE '%' || _search || '%'
      OR p.home_town ILIKE '%' || _search || '%'
      OR p.member_bio ILIKE '%' || _search || '%'
    )
    AND (
      _industry IS NULL OR _industry = ''
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.industry_interests, ARRAY[]::text[])) i
        WHERE lower(i) = lower(_industry)
      )
    )
  ORDER BY (p.photo_url IS NOT NULL) DESC, p.updated_at DESC NULLS LAST
  LIMIT GREATEST(LEAST(_limit, 200), 1)
  OFFSET GREATEST(_offset, 0);
$$;

CREATE OR REPLACE FUNCTION public.get_member_profile(_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  photo_url text,
  home_town text,
  home_town_blurb text,
  career_level text,
  member_bio text,
  industry_interests text[],
  role_preferences text[],
  riasec_scores jsonb,
  work_values jsonb,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.photo_url, p.home_town, p.home_town_blurb,
         p.career_level, p.member_bio, p.industry_interests, p.role_preferences,
         p.riasec_scores, p.work_values, p.created_at
  FROM public.profiles p
  WHERE p.id = _id
    AND auth.uid() IS NOT NULL
    AND (p.id = auth.uid() OR p.member_directory_opt_in = true);
$$;

GRANT EXECUTE ON FUNCTION public.get_member_directory(text, text, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_member_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.are_members_connected(uuid, uuid) TO authenticated;
