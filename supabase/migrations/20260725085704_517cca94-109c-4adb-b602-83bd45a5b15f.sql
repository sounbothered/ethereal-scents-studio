
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Convenience: is_moderator = admin or moderator
CREATE OR REPLACE FUNCTION public.is_moderator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','moderator')
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_moderator(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_moderator(uuid) TO authenticated, service_role;

-- Review moderation status
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.reviews
  ADD COLUMN status public.review_status NOT NULL DEFAULT 'pending',
  ADD COLUMN moderated_at timestamptz,
  ADD COLUMN moderated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN moderation_note text;

CREATE INDEX reviews_status_idx ON public.reviews(status);
CREATE INDEX reviews_product_status_idx ON public.reviews(product_id, status);

-- Rewrite RLS: public sees only approved; owner sees own; moderators see all + update status
DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;
DROP POLICY IF EXISTS "Users insert own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users delete own reviews" ON public.reviews;

CREATE POLICY "Approved reviews are public"
  ON public.reviews FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Users read own reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators read all reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (public.is_moderator(auth.uid()));

CREATE POLICY "Users insert own reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderators update any review"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (public.is_moderator(auth.uid()))
  WITH CHECK (public.is_moderator(auth.uid()));

CREATE POLICY "Users delete own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators delete any review"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (public.is_moderator(auth.uid()));
