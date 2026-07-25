
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS price_source TEXT,
  ADD COLUMN IF NOT EXISTS price_last_scraped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS price_last_scrape_status TEXT,
  ADD COLUMN IF NOT EXISTS price_last_scrape_note TEXT;

CREATE TABLE IF NOT EXISTS public.price_scrape_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  source_url TEXT,
  old_price_ngn INTEGER,
  new_price_ngn INTEGER,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.price_scrape_log TO authenticated;
GRANT ALL ON public.price_scrape_log TO service_role;

ALTER TABLE public.price_scrape_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view scrape log"
  ON public.price_scrape_log
  FOR SELECT
  TO authenticated
  USING (public.is_moderator(auth.uid()));
