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
  status: "pending" | "approved" | "rejected";
  created_at: string;
  author_name: string | null;
  verified: boolean;
};

async function decorateReviews(
  reviews: Array<{
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    title: string | null;
    body: string | null;
    status: string;
    created_at: string;
  }>,
): Promise<ReviewWithMeta[]> {
  if (reviews.length === 0) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const userIds = Array.from(new Set(reviews.map((r) => r.user_id)));
  const productIds = Array.from(new Set(reviews.map((r) => r.product_id)));

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
    .in("product_id", productIds)
    .eq("order.status", "paid")
    .in("order.user_id", userIds);
  const verifiedSet = new Set<string>();
  for (const row of purchases ?? []) {
    const uid = (row as { order: { user_id: string } | null }).order?.user_id;
    const pid = (row as { product_id: string }).product_id;
    if (uid && pid) verifiedSet.add(`${uid}:${pid}`);
  }

  return reviews.map((r) => ({
    id: r.id,
    product_id: r.product_id,
    user_id: r.user_id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    status: r.status as ReviewWithMeta["status"],
    created_at: r.created_at,
    author_name: nameById.get(r.user_id) ?? null,
    verified: verifiedSet.has(`${r.user_id}:${r.product_id}`),
  }));
}

// Public: only approved reviews are returned publicly.
// When a signed-in user calls this, they also see their own pending/rejected reviews.
export const listReviewsForProduct = createServerFn({ method: "GET" })
  .inputValidator((input: { productId: string }) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }): Promise<ReviewWithMeta[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Try to identify caller (optional) so we can also return their own pending items.
    let callerId: string | null = null;
    try {
      const req = (await import("@tanstack/react-start/server")).getRequest?.();
      const auth = req?.headers.get("authorization");
      if (auth?.startsWith("Bearer ")) {
        const { data: userData } = await supabaseAdmin.auth.getUser(auth.slice(7));
        callerId = userData.user?.id ?? null;
      }
    } catch {
      // no request context — treat as anonymous
    }

    let q = supabaseAdmin
      .from("reviews")
      .select("id, product_id, user_id, rating, title, body, status, created_at")
      .eq("product_id", data.productId)
      .order("created_at", { ascending: false });

    if (callerId) {
      q = q.or(`status.eq.approved,user_id.eq.${callerId}`);
    } else {
      q = q.eq("status", "approved");
    }

    const { data: reviews, error } = await q;
    if (error) throw new Error(error.message);
    return decorateReviews((reviews ?? []) as never);
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
    // New/edited reviews always return to pending for re-moderation.
    const { error } = await context.supabase
      .from("reviews")
      .upsert(
        {
          product_id: data.productId,
          user_id: context.userId,
          rating: data.rating,
          title: data.title ?? null,
          body: data.body ?? null,
          status: "pending",
          moderated_at: null,
          moderated_by: null,
          moderation_note: null,
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

// --- Moderation ---

async function assertModerator(supabase: {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}, userId: string) {
  const { data, error } = await supabase.rpc("is_moderator", { _user_id: userId });
  if (error) throw new Error((error as { message: string }).message);
  if (!data) throw new Error("Forbidden: moderator role required");
}

export const isCurrentUserModerator = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("is_moderator", {
      _user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { isModerator: Boolean(data) };
  });

export const listReviewsForModeration = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status?: "pending" | "approved" | "rejected" | "all" }) =>
    z
      .object({
        status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<ReviewWithMeta[]> => {
    await assertModerator(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("reviews")
      .select("id, product_id, user_id, rating, title, body, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: reviews, error } = await q;
    if (error) throw new Error(error.message);
    return decorateReviews((reviews ?? []) as never);
  });

export const setReviewStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    reviewId: string;
    status: "pending" | "approved" | "rejected";
    note?: string;
  }) =>
    z
      .object({
        reviewId: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected"]),
        note: z.string().trim().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertModerator(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("reviews")
      .update({
        status: data.status,
        moderated_at: new Date().toISOString(),
        moderated_by: context.userId,
        moderation_note: data.note ?? null,
      })
      .eq("id", data.reviewId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReviewAsModerator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { reviewId: string }) =>
    z.object({ reviewId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertModerator(context.supabase, context.userId);
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.reviewId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
