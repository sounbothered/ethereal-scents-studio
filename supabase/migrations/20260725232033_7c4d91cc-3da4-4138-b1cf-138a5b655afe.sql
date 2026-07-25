
-- Restrict public profile visibility. Reviewer names are joined server-side via the
-- service-role client, so browsers no longer need direct anon read access.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
REVOKE SELECT ON public.profiles FROM anon;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Order writes happen only through the trusted server function using the
-- service-role client. Revoke client-role write privileges explicitly so a
-- future policy addition cannot accidentally expose these tables.
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon, authenticated;
