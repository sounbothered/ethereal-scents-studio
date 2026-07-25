
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS top_notes text[],
  ADD COLUMN IF NOT EXISTS heart_notes text[],
  ADD COLUMN IF NOT EXISTS base_notes text[],
  ADD COLUMN IF NOT EXISTS longevity smallint CHECK (longevity BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS sillage smallint CHECK (sillage BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS concentration text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_address jsonb;

UPDATE public.products SET
  top_notes = ARRAY['Bergamot','Pink pepper','Cardamom'],
  heart_notes = ARRAY['Bulgarian rose','Iris','Saffron'],
  base_notes = ARRAY['Oud','Amber','White musk'],
  longevity = 5, sillage = 4, concentration = 'Extrait de Parfum'
WHERE slug = 'nocturne-01' AND top_notes IS NULL;

UPDATE public.products SET
  top_notes = ARRAY['Black plum','Bergamot','Davana'],
  heart_notes = ARRAY['Bulgarian rose','Suede','Violet'],
  base_notes = ARRAY['Vanilla orchid','Sandalwood','Musk'],
  longevity = 4, sillage = 3, concentration = 'Eau de Parfum'
WHERE slug = 'velvet-hour' AND top_notes IS NULL;

UPDATE public.products SET
  top_notes = ARRAY['Neroli','Yuzu','Mandarin'],
  heart_notes = ARRAY['Orange blossom','Jasmine sambac','Honey'],
  base_notes = ARRAY['Benzoin','Tonka bean','Amber'],
  longevity = 4, sillage = 4, concentration = 'Eau de Parfum'
WHERE slug = 'golden-veil' AND top_notes IS NULL;

UPDATE public.products SET
  top_notes = ARRAY['Sea salt','Aldehydes','Pink pepper'],
  heart_notes = ARRAY['Ambergris','Seaweed accord','Iris'],
  base_notes = ARRAY['Driftwood','Vetiver','Ambroxan'],
  longevity = 5, sillage = 5, concentration = 'Extrait de Parfum'
WHERE slug = 'midnight-tide' AND top_notes IS NULL;
