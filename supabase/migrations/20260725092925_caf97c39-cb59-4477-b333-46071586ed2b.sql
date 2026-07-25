ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS collection text NOT NULL DEFAULT 'aethel',
  ADD COLUMN IF NOT EXISTS origin text,
  ADD COLUMN IF NOT EXISTS price_ngn integer;

CREATE INDEX IF NOT EXISTS products_collection_idx ON public.products(collection);
