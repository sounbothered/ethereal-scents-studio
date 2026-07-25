import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getProductsByIds } from "@/lib/catalog.functions";
import { placeOrder } from "@/lib/orders.functions";
import { useCart, formatPrice } from "@/lib/cart";
import { AppShell } from "@/components/AppShell";

const productsQO = (ids: string[]) =>
  queryOptions({
    queryKey: ["products-by-ids", [...ids].sort()],
    queryFn: () => getProductsByIds({ data: { ids } }),
    staleTime: 30_000,
    enabled: ids.length > 0,
  });

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · ÆTHEL" },
      { name: "description", content: "Review your bag and place your commission." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, setQty, remove, clear, ready } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const ids = useMemo(() => items.map((i) => i.productId), [items]);
  const { data: products = [] } = useSuspenseQuery(productsQO(ids));

  const lines = items
    .map((i) => {
      const p = products.find((x) => x.id === i.productId);
      return p ? { ...p, quantity: i.quantity } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = lines.reduce((s, l) => s + l.price_cents * l.quantity, 0);
  const currency = lines[0]?.currency ?? "usd";

  const handlePlace = async () => {
    if (lines.length === 0) return;
    setSubmitting(true);
    try {
      const { orderId } = await placeOrder({
        data: {
          items: lines.map((l) => ({ productId: l.id, quantity: l.quantity })),
        },
      });
      clear();
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Order placed. Thank you.");
      navigate({ to: "/account", search: { placed: orderId } as never });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not place order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Checkout</span>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">Your bag</h1>

        {ready && lines.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card/60 p-10 text-center backdrop-blur-xl">
            <p className="font-serif text-2xl italic">Your bag is empty.</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-full bg-gold px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground"
            >
              Discover fragrances
            </Link>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
            <ul className="divide-y divide-border">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-4 py-4">
                  {l.image_url && (
                    <img
                      src={l.image_url}
                      alt=""
                      className="size-16 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/product/$slug"
                      params={{ slug: l.slug }}
                      className="font-serif text-lg hover:text-gold transition-colors"
                    >
                      {l.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{l.notes}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(l.id, l.quantity - 1)}
                      className="size-7 rounded-full border border-border hover:border-gold"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">
                      {l.quantity}
                    </span>
                    <button
                      onClick={() => setQty(l.id, l.quantity + 1)}
                      className="size-7 rounded-full border border-border hover:border-gold"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <div className="w-24 text-right text-sm">
                    {formatPrice(l.price_cents * l.quantity, l.currency)}
                  </div>
                  <button
                    onClick={() => remove(l.id)}
                    className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-baseline justify-between border-t border-border pt-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Total
              </span>
              <span className="font-serif text-3xl">
                {formatPrice(total, currency)}
              </span>
            </div>

            <button
              onClick={handlePlace}
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-gold py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Simulated checkout · no payment collected
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
