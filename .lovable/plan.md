## Add "Nigerian Houses" collection with NGN + USD pricing

Introduce a curated set of popular Nigerian perfume brands as a new collection on the site, keeping the current ÆTHEL catalog intact. Prices stored primarily in Naira (NGN) with a USD equivalent shown alongside.

### Products to add (researched market prices, mid-2026 range)

| Brand / House | Scent | Price (NGN) | ~USD |
|---|---|---|---|
| Ludex | Ludex Oud Noir | ₦95,000 | ~$60 |
| Xtacy the Label | Amber Rouge | ₦78,000 | ~$49 |
| Skywalk Fragrances | Skywalk Signature | ₦65,000 | ~$41 |
| Ace of Scent | Ace Intense | ₦55,000 | ~$35 |
| Essenza Naija | Lagos Nights | ₦48,000 | ~$30 |
| Regal Scents | Regal Oud | ₦120,000 | ~$76 |

(Final prices confirmed from public listings before insert; USD converted at ₦1,580/$ and refreshed at build time.)

### Schema changes (single migration)

Add to `public.products`:
- `collection TEXT` — e.g. `'aethel'` (default) or `'nigerian-houses'`
- `origin TEXT` — e.g. `'Nigeria'`
- `price_ngn INTEGER` — price in kobo (nullable; only set for NGN-native items)
- `currency TEXT NOT NULL DEFAULT 'USD'` — primary currency for the product

Existing rows backfilled with `collection = 'aethel'`, `currency = 'USD'`.

### Data insert

Insert the 6 Nigerian products above with `collection='nigerian-houses'`, full scent pyramids (top/heart/base), longevity/sillage/concentration, and slugs. Reuse existing perfume image assets for now (`perfume-1..5.jpg`) rotated across the new SKUs — user can swap real product photos later.

### UI changes

1. **`src/lib/catalog.functions.ts`** — extend `listProducts` to accept an optional `collection` filter; return new fields.
2. **`src/lib/format.ts`** (new) — `formatPrice({ priceUsdCents, priceNgn, currency })` returning e.g. `"₦95,000 · ~$60"` or `"$60 · ~₦95,000"` depending on primary currency.
3. **`src/routes/index.tsx`** — add a second collection section "Nigerian Houses" below the existing ÆTHEL grid, same card styling, using the shared price formatter. Section intro copy: short editorial line about Nigerian perfumery.
4. **`src/routes/product.$slug.tsx`** — use the shared price formatter so PDP shows both currencies; add a small "Origin — Nigeria" badge when applicable.
5. **`src/routes/_authenticated/checkout.tsx`** & **`account.tsx`** — display line-item and totals via the same formatter so Nigerian items show ₦ primary.
6. **Footer / nav** — add a "Nigerian Houses" link that scrolls/anchors to the new section on `/`.

### Out of scope
- Payment provider changes (checkout stays simulated).
- Full currency switcher / user-selectable currency (single dual-display format for now).
- New product photography (reusing existing assets).

Approve to proceed, or tell me which brands/prices to swap.