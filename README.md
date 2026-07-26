ÆTHEL — Ethereal Scents Studio
A modern, full-stack e-commerce storefront for a fragrance house, built to demonstrate a production-style shopping experience: product catalog, cart, authentication, checkout, and a bespoke "build your own scent" flow — all on a fast, type-safe stack.
Live demo: https://ethereal-scents-studio.lovable.app
Originally scaffolded and iterated on with Lovable. This README documents the project as a standalone, portable codebase — useful as a SaaS starting point or a portfolio piece.
Features
Product catalog — curated collections with rich product detail (top/heart/base notes, pricing in multiple currencies)
Multi-currency pricing — dual NGN/USD display pattern, useful reference for any regional-pricing storefront
Shopping cart & checkout — add-to-bag flow with a dedicated checkout route
Authentication — sign-in flow wired up for account-gated actions
Content pages — Journal (editorial/blog-style content), Maison/About, Contact, Shipping, Returns, FAQ, Privacy, Terms
Bespoke product builder — a "sculpt your scent" configurator pattern (composable options → custom product)
Newsletter capture — email subscription component
Responsive, design-forward UI — built with Tailwind CSS and a component-driven architecture
Tech Stack
Layer
Technology
Framework
TanStack Start
Language
TypeScript
UI
React
Styling
Tailwind CSS
Backend / DB / Auth
Supabase
Build tool
Vite
Package manager
npm / bun (both package-lock.json and bun.lock are present)
Project Structure
Code
Getting Started
Prerequisites
Node.js (LTS recommended) — install via nvm
A Supabase project (for auth, database, and any storage-backed features)
Installation
Bash
Environment Variables
Create a .env (or .env.local) file in the project root with your Supabase credentials:
Bash
Check supabase/ for any migrations or edge functions that need to be applied to your project via the Supabase CLI.
Run locally
Bash
The app will be available at http://localhost:5173 (default Vite port).
Build for production
Bash
Using This as a Starter
This project is a reasonable base for:
SaaS storefronts — swap the product/catalog data source for your own, keep the cart/checkout/auth scaffolding
Portfolio pieces — clean example of a full customer-facing flow (browse → detail → cart → checkout → account) done with a modern typed stack
Supabase + TanStack Start reference — a real-world example wiring these two together with Tailwind for styling
To repurpose it: update branding/copy, replace product data and images, connect your own Supabase project, and adjust the checkout flow for your actual payment provider.
Deployment
The project builds to static/SSR output compatible with common hosts (Vercel, Netlify, Cloudflare Pages) or can continue to be deployed via Lovable. Confirm the adapter configuration in vite.config.ts matches your target host.
License
No license specified yet — add a LICENSE file (MIT is a common default for portfolio/starter projects) if you intend for others to reuse this code.
Acknowledgements
Built with Lovable
UI components via shadcn/ui
Backend by Supabasecd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
