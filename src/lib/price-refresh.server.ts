// Server-only helpers for scraping Nigerian perfume prices via Firecrawl.
// Never import from a route or component module — only from *.functions.ts
// handlers or /api/public/* server routes.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firecrawl/v2";

export type ScrapeOutcome = {
  productId: string;
  slug: string;
  name: string;
  sourceUrl: string | null;
  oldPriceNgn: number | null;
  newPriceNgn: number | null;
  status: "updated" | "unchanged" | "skipped" | "failed";
  note: string | null;
};

async function firecrawlExtractPrice(url: string): Promise<{ price_ngn: number | null; currency: string | null; note?: string }> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const connectionKey = process.env.FIRECRAWL_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY missing");
  if (!connectionKey) throw new Error("FIRECRAWL_API_KEY missing");

  const res = await fetch(`${GATEWAY_URL}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connectionKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      onlyMainContent: true,
      formats: [
        {
          type: "json",
          prompt:
            "Extract the current selling price of this perfume in Nigerian Naira. Return the price as an integer number of naira with no separators, and the currency code (e.g. NGN). If a discount price is shown, return the current buy-now price, not the crossed-out price.",
          schema: {
            type: "object",
            properties: {
              price_ngn: { type: "number", description: "Price in Nigerian Naira, integer" },
              currency: { type: "string" },
            },
            required: ["price_ngn"],
          },
        },
      ],
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Firecrawl ${res.status}: ${text.slice(0, 300)}`);
  }
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response: ${text.slice(0, 200)}`);
  }
  const data = body?.data ?? body ?? {};
  const json = data.json ?? body.json ?? {};
  const raw = json.price_ngn;
  const price = typeof raw === "number" ? Math.round(raw) : raw ? Math.round(Number(raw)) : null;
  return { price_ngn: Number.isFinite(price as number) ? (price as number) : null, currency: json.currency ?? null };
}

export async function refreshOneProduct(productId: string): Promise<ScrapeOutcome> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("id, slug, name, price_ngn, source_url")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!product) throw new Error("Product not found");

  const base: ScrapeOutcome = {
    productId: product.id as string,
    slug: product.slug as string,
    name: product.name as string,
    sourceUrl: (product.source_url as string | null) ?? null,
    oldPriceNgn: (product.price_ngn as number | null) ?? null,
    newPriceNgn: null,
    status: "skipped",
    note: null,
  };

  if (!product.source_url) {
    base.note = "No source URL configured";
    await supabaseAdmin.from("price_scrape_log").insert({
      product_id: product.id,
      source_url: null,
      old_price_ngn: base.oldPriceNgn,
      new_price_ngn: null,
      status: "skipped",
      note: base.note,
    });
    return base;
  }

  try {
    const { price_ngn } = await firecrawlExtractPrice(product.source_url as string);
    if (!price_ngn || price_ngn < 100 || price_ngn > 100_000_000) {
      const note = price_ngn ? `Rejected implausible price ${price_ngn}` : "Price not found on page";
      await supabaseAdmin
        .from("products")
        .update({
          price_last_scraped_at: new Date().toISOString(),
          price_last_scrape_status: "failed",
          price_last_scrape_note: note,
        })
        .eq("id", product.id);
      await supabaseAdmin.from("price_scrape_log").insert({
        product_id: product.id,
        source_url: product.source_url,
        old_price_ngn: base.oldPriceNgn,
        new_price_ngn: price_ngn ?? null,
        status: "failed",
        note,
      });
      return { ...base, status: "failed", note, newPriceNgn: price_ngn ?? null };
    }

    // Store in "kobo" (integer * 100) — the existing seed data uses integer * 100
    // (e.g. 55,000 NGN stored as 5,500,000). Match that convention.
    const stored = price_ngn * 100;
    const changed = stored !== base.oldPriceNgn;

    await supabaseAdmin
      .from("products")
      .update({
        price_ngn: stored,
        price_last_scraped_at: new Date().toISOString(),
        price_last_scrape_status: changed ? "updated" : "unchanged",
        price_last_scrape_note: null,
      })
      .eq("id", product.id);

    await supabaseAdmin.from("price_scrape_log").insert({
      product_id: product.id,
      source_url: product.source_url,
      old_price_ngn: base.oldPriceNgn,
      new_price_ngn: stored,
      status: changed ? "updated" : "unchanged",
      note: null,
    });

    return {
      ...base,
      newPriceNgn: stored,
      status: changed ? "updated" : "unchanged",
    };
  } catch (e) {
    const note = e instanceof Error ? e.message : String(e);
    await supabaseAdmin
      .from("products")
      .update({
        price_last_scraped_at: new Date().toISOString(),
        price_last_scrape_status: "failed",
        price_last_scrape_note: note.slice(0, 500),
      })
      .eq("id", product.id);
    await supabaseAdmin.from("price_scrape_log").insert({
      product_id: product.id,
      source_url: product.source_url,
      old_price_ngn: base.oldPriceNgn,
      new_price_ngn: null,
      status: "failed",
      note: note.slice(0, 500),
    });
    return { ...base, status: "failed", note };
  }
}

export async function refreshAllNigerianProducts(): Promise<ScrapeOutcome[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("collection", "nigerian-houses")
    .not("source_url", "is", null);
  if (error) throw new Error(error.message);

  const outcomes: ScrapeOutcome[] = [];
  for (const row of data ?? []) {
    // Serial to be gentle on the source sites and stay under Firecrawl rate limits.
    // eslint-disable-next-line no-await-in-loop
    const o = await refreshOneProduct(row.id as string);
    outcomes.push(o);
  }
  return outcomes;
}
