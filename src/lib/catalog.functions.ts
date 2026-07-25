import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Product = {
  id: string;
  slug: string;
  name: string;
  house: string | null;
  notes: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  image_url: string | null;
  sort: number;
};

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    const supabase = await publicClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, house, notes, description, price_cents, currency, image_url, sort",
      )
      .eq("active", true)
      .order("sort", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Product[];
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }): Promise<Product | null> => {
    const supabase = await publicClient();
    const { data: rows, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, house, notes, description, price_cents, currency, image_url, sort",
      )
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (rows as Product | null) ?? null;
  });

export const getProductsByIds = createServerFn({ method: "POST" })
  .inputValidator((input: { ids: string[] }) =>
    z.object({ ids: z.array(z.string().uuid()).max(50) }).parse(input),
  )
  .handler(async ({ data }): Promise<Product[]> => {
    if (data.ids.length === 0) return [];
    const supabase = await publicClient();
    const { data: rows, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, house, notes, description, price_cents, currency, image_url, sort",
      )
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return (rows ?? []) as Product[];
  });
