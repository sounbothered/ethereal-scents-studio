
# Making ÆTHEL feel like a real luxury house

The foundation (catalog, cart, auth, orders, reviews, moderation, MCP) is solid. What's missing is the *editorial* and *operational* layer that separates a demo store from a house customers trust. Here's a prioritized set of additions — pick any combination and I'll build them.

## 1. Brand & storytelling pages
Luxury perfume sites live on narrative, not product grids.
- **/maison** — House story, founder note, olfactory philosophy, atelier imagery
- **/journal** — Editorial articles (scent notes, seasonal edits, perfumer interviews) with MDX or a `posts` table
- **/craft** — Ingredient sourcing map with subtle 3D globe / parallax
- **Press & accolades** strip on the home page

## 2. Product page depth
- **Scent pyramid visualization** (top / heart / base) — animated SVG
- **Longevity & sillage meters**
- **"Pairs well with"** cross-sell carousel
- **Sample / discovery set** purchase option (5ml vials)
- **Ingredient provenance** with hover cards
- **Sticky add-to-bag** rail on scroll

## 3. Real commerce mechanics
Currently checkout is simulated. To be credible:
- **Shipping address + contact** capture at checkout, stored on `orders`
- **Order confirmation email** (transactional) + `/orders/:id` receipt page
- **Order status timeline** (placed → prepared → shipped → delivered) with moderator/admin controls
- **Discovery set / gift wrapping** upsell
- **Currency + region selector** (display only initially)
- Optional: switch simulated flow to **real Stripe** once regional access allows, or **Paddle** as alternative

## 4. Trust & policy surface
Non-negotiable for a luxury brand:
- **/shipping**, **/returns**, **/privacy**, **/terms**, **/contact** with real copy scaffolds
- **FAQ accordion** with schema.org markup
- **Newsletter signup** (double opt-in) → `subscribers` table
- **Contact form** → stored + notification email

## 5. Discovery & search
- **Scent finder quiz** ("mood, season, intensity") → recommends 2–3 fragrances
- **Filter/sort** on collection (family, intensity, price, notes)
- **Global search** (command-k) across products & journal

## 6. Account depth
- **Profile page** — display name, avatar upload, preferences
- **Wishlist / saved scents**
- **Reorder** from past orders
- **My reviews** management view

## 7. UI/UX polish (biggest professionalism lift)
- **Loading skeletons** (currently blank flashes) on all data routes
- **Empty states** with illustration + CTA (empty bag, no orders, no reviews)
- **Error boundaries** with branded fallback instead of white screen
- **Toast consistency** — replace inline messages
- **Mobile nav drawer** (currently sparse on small screens)
- **Focus-visible rings** & full keyboard nav audit
- **Reduced-motion** variants for the 3D tilt & parallax
- **Real product photography lighting pass** (regenerate hero shots at premium quality with consistent bottle across shots)
- **Micro-interactions**: button press haptics, add-to-bag flight animation to cart icon
- **Page transitions** (view transitions API) between routes

## 8. Performance & SEO
- **Per-route metadata** already partial — audit every leaf route for unique title/description/og
- **Product JSON-LD** (`Product`, `Offer`, `AggregateRating` from reviews)
- **Sitemap.xml** + **robots.txt**
- **Image `<picture>` with AVIF/WebP** and explicit width/height
- **Lighthouse pass**: preload hero image, defer non-critical fonts

## 9. Admin depth (beyond review moderation)
- **Product CRUD** UI at `/admin/products` (create, edit, archive, reorder)
- **Order management** dashboard (mark shipped, add tracking)
- **Analytics tiles** — orders/day, revenue, top scents, review sentiment

## 10. Legal & compliance basics
- **Cookie consent banner** (EU)
- **Age gate** if selling to restricted markets
- **Accessibility statement**

---

## Recommended first sprint (highest ROI for "professional")

If you want one focused wave, I'd build these together:

1. **Journal + Maison story pages** (narrative depth)
2. **Product page: scent pyramid + notes visualization + sample option**
3. **Real checkout: address capture, order confirmation page, status timeline**
4. **Policy pages** (shipping/returns/privacy/terms/contact)
5. **Loading skeletons + empty states + mobile nav drawer** (the polish that makes everything feel intentional)
6. **Product JSON-LD + sitemap** (SEO credibility)

### Tell me which to build
Reply with the numbers (e.g. "1, 3, 5, 7") or "first sprint" and I'll scope the migrations, routes, and components, then implement.
