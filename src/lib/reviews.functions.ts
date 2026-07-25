import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type ReviewWithMeta = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  author_name: string | null;
  verified: boolean;
};

export const listReviewsForProduct = createServerFn({ method: "GET" })
  .inputValidator((input: { productId: string }) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }): Promise<ReviewWithMeta[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("id, product_id, user_id, rating, title, body, created_at")
      .eq("product_id", data.productId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    if (!reviews || reviews.length === 0) return [];

    const userIds = Array.from(new Set(reviews.map((r) => r.user_id)));
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    const nameById = new Map(
      (profiles ?? []).map((p) => [p.id as string, (p.display_name as string | null) ?? null]),
    );

    const { data: purchases } = await supabaseAdmin
      .from("order_items")
      .select("product_id, order:orders!inner(user_id, status)")
      .eq("product_id", data.productId)
      .eq("order.status", "paid")
      .in("order.user_id", userIds);
    const verifiedSet = new Set<string>();
    for (const row of purchases ?? []) {
      const uid = (row as { order: { user_id: string } | null }).order?.user_id;
      if (uid) verifiedSet.add(uid);
    }

    return reviews.map((r) => ({
      id: r.id as string,
      product_id: r.product_id as string,
      user_id: r.user_id as string,
      rating: r.rating as number,
      title: (r.title as string | null) ?? null,
      body: (r.body as string | null) ?? null,
      created_at: r.created_at as string,
      author_name: nameById.get(r.user_id as string) ?? null,
      verified: verifiedSet.has(r.user_id as string),
    }));
  });

export const upsertReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    productId: string;
    rating: number;
    title?: string;
    body?: string;
  }) =>
    z
      .object({
        productId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        title: z.string().trim().max(120).optional(),
        body: z.string().trim().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("reviews")
      .upsert(
        {
          product_id: data.productId,
          user_id: context.userId,
          rating: data.rating,
          title: data.title ?? null,
          body: data.body ?? null,
        },
        { onConflict: "product_id,user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMyReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productId: string }) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("reviews")
      .delete()
      .eq("product_id", data.productId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
