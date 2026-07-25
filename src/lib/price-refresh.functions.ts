import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertModerator(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("is_moderator", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export type PriceRow = {
  id: string;
  slug: string;
  name: string;
  price_ngn: number | null;
  source_url: string | null;
  price_source: string | null;
  price_last_scraped_at: string | null;
  price_last_scrape_status: string | null;
  price_last_scrape_note: string | null;
};

export const listNigerianPrices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PriceRow[]> => {
    await assertModerator(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, slug, name, price_ngn, source_url, price_source, price_last_scraped_at, price_last_scrape_status, price_last_scrape_note",
      )
      .eq("collection", "nigerian-houses")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as PriceRow[];
  });

export const updatePriceSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z
      .object({
        productId: z.string().uuid(),
        sourceUrl: z.string().url().max(500).nullable(),
        priceSource: z.string().max(80).nullable(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertModerator(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("products")
      .update({
        source_url: data.sourceUrl,
        price_source: data.priceSource,
      })
      .eq("id", data.productId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const refreshProductPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ productId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    await assertModerator(context.userId);
    const { refreshOneProduct } = await import("./price-refresh.server");
    return refreshOneProduct(data.productId);
  });

export const refreshAllPrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModerator(context.userId);
    const { refreshAllNigerianProducts } = await import("./price-refresh.server");
    return refreshAllNigerianProducts();
  });
