import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type ShippingAddress = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export type OrderItemView = {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  quantity: number;
  unit_price_cents: number;
};

export type OrderView = {
  id: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  shipping_address: ShippingAddress | null;
  items: OrderItemView[];
};

const shippingSchema = z.object({
  fullName: z.string().min(2).max(120),
  line1: z.string().min(2).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  region: z.string().max(100).optional(),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(60),
  phone: z.string().max(30).optional(),
});

const placeOrderInput = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
  shipping: shippingSchema,
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof placeOrderInput>) =>
    placeOrderInput.parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ids = Array.from(new Set(data.items.map((i) => i.productId)));
    const { data: products, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, price_cents, currency, active")
      .in("id", ids);
    if (prodErr) throw new Error(prodErr.message);
    if (!products || products.length !== ids.length) {
      throw new Error("Some items in your bag are no longer available.");
    }
    const priceMap = new Map(
      products.map((p) => [p.id as string, {
        price: p.price_cents as number,
        currency: p.currency as string,
        active: p.active as boolean,
      }]),
    );
    for (const item of data.items) {
      const p = priceMap.get(item.productId);
      if (!p || !p.active) throw new Error("Item unavailable.");
    }

    const currency = products[0].currency as string;
    const total = data.items.reduce(
      (sum, i) => sum + (priceMap.get(i.productId)!.price * i.quantity),
      0,
    );

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: context.userId,
        status: "paid",
        total_cents: total,
        currency,
        customer_email: context.claims?.email ?? null,
        shipping_address: data.shipping,
      })
      .select("id")
      .single();
    if (orderErr || !order) throw new Error(orderErr?.message ?? "Order failed");

    const rows = data.items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      quantity: i.quantity,
      unit_price_cents: priceMap.get(i.productId)!.price,
    }));
    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(rows);
    if (itemsErr) throw new Error(itemsErr.message);

    return { orderId: order.id as string };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OrderView[]> => {
    const { data: orders, error } = await context.supabase
      .from("orders")
      .select("id, status, total_cents, currency, created_at, shipping_address")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    if (!orders || orders.length === 0) return [];

    const orderIds = orders.map((o) => o.id as string);
    const { data: items, error: itemsErr } = await context.supabase
      .from("order_items")
      .select(
        "id, order_id, product_id, quantity, unit_price_cents, products(name, slug, image_url)",
      )
      .in("order_id", orderIds);
    if (itemsErr) throw new Error(itemsErr.message);

    const byOrder = new Map<string, OrderItemView[]>();
    for (const it of items ?? []) {
      const prod = (it as { products: { name: string; slug: string; image_url: string | null } | null }).products;
      const row: OrderItemView = {
        id: it.id as string,
        product_id: it.product_id as string,
        product_name: prod?.name ?? "Item",
        product_slug: prod?.slug ?? "",
        product_image: prod?.image_url ?? null,
        quantity: it.quantity as number,
        unit_price_cents: it.unit_price_cents as number,
      };
      const arr = byOrder.get(it.order_id as string) ?? [];
      arr.push(row);
      byOrder.set(it.order_id as string, arr);
    }

    return orders.map((o) => ({
      id: o.id as string,
      status: o.status as string,
      total_cents: o.total_cents as number,
      currency: o.currency as string,
      created_at: o.created_at as string,
      shipping_address: (o.shipping_address as ShippingAddress | null) ?? null,
      items: byOrder.get(o.id as string) ?? [],
    }));
  });
