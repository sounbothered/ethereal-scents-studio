# Project Handover

Checklist for the new owner after ownership transfer.

## What transfers automatically

- **Codebase** — all routes, components, server functions, migrations.
- **Lovable Cloud backend** — database rows, RLS policies, auth users, `pg_cron` jobs, storage, and secrets stay bound to the project.
- **Published URL** and any connected custom domain.
- **MCP server** at `/mcp` with its 5 OAuth-protected tools.

## What does NOT transfer

- **Billing & credits** — new owner sets up their own plan/credits on the destination workspace.
- **Workspace-scoped connectors** (e.g. Firecrawl) — if moving to a different workspace, reconnect them or the daily Nigerian price refresh will fail silently.
- **Google OAuth config** — may need re-verification depending on workspace policy.
- **Custom domain DNS** — remains valid, but confirm it still resolves.

## Post-transfer verification checklist

Run through these in order on the transferred project:

### 1. Public routes render
- [ ] `/` — homepage loads, product grid shows both Midnight Velvet and Nigerian Houses collections
- [ ] `/product/nocturne-01` (or any product slug) — detail page, olfactory pyramid, reviews load
- [ ] `/maison`, `/journal`, `/faq`, `/shipping`, `/returns`, `/privacy`, `/terms`, `/contact`

### 2. Authentication
- [ ] `/auth` — email/password sign-up works
- [ ] `/auth` — Google sign-in works (if broken, re-run social auth config)
- [ ] After sign-in, redirected correctly; sign-out clears session

### 3. Authenticated flows (bearer attach + RLS)
- [ ] `/account` — order history loads
- [ ] `/checkout` — add item from `/`, place simulated order, appears in `/account`
- [ ] `/product/<slug>` — submit a review, see "pending moderation" badge

### 4. Moderator flows (requires `admin` or `moderator` role in `user_roles`)
- [ ] `/moderation` — link visible in nav
- [ ] Approve/reject/delete a pending review
- [ ] **Prices tab** — set a source URL, click "Refresh now"; confirms Firecrawl connector is linked

### 5. Automation
- [ ] Confirm `pg_cron` job still scheduled (Cloud → Database → Extensions/Cron)
- [ ] Check `price_scrape_log` after 03:00 UTC for a fresh entry

### 6. Secrets present
In Cloud → Secrets, verify:
- `LOVABLE_API_KEY`
- `FIRECRAWL_API_KEY` (managed by connector — reconnect if missing)
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 7. MCP
- [ ] `/mcp` responds; agent clients can list `list_products`, `get_product`, `list_my_orders`, `list_product_reviews`, `submit_review`

## If something breaks

- **Google sign-in fails** → Cloud → Users → Auth Settings → re-enable Google provider.
- **Firecrawl calls 401** → Connectors → reconnect Firecrawl in the new workspace.
- **Service role errors** → ask Lovable to rebind Cloud secrets.
- **Custom domain not resolving** → Project Settings → Domains → re-verify DNS.
