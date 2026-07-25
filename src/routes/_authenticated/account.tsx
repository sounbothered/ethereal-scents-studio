import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getMyOrders, type OrderView } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/cart";
import { AppShell } from "@/components/AppShell";

const myOrdersQO = () =>
  queryOptions({
    queryKey: ["my-orders"],
    queryFn: () => getMyOrders(),
    staleTime: 15_000,
  });

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account · ÆTHEL" },
      { name: "description", content: "Your ÆTHEL orders and account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(myOrdersQO()),
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="text-destructive text-sm">Could not load orders: {error.message}</p>
    </AppShell>
  ),
  component: AccountPage,
});

const TIMELINE: { key: string; label: string; hint: string }[] = [
  { key: "paid", label: "Confirmed", hint: "Commission received" },
  { key: "processing", label: "Composing", hint: "Blended by our atelier" },
  { key: "shipped", label: "Shipped", hint: "In transit to you" },
  { key: "delivered", label: "Delivered", hint: "Arrived" },
];

function stageIndex(status: string) {
  const map: Record<string, number> = {
    pending: 0, paid: 0, processing: 1, shipped: 2, delivered: 3,
  };
  return map[status] ?? 0;
}

function AccountPage() {
  const { data: orders } = useSuspenseQuery(myOrdersQO());

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-24">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Account</span>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">Your orders</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl">
          A record of every commission through the maison.
        </p>

        <div className="mt-12 space-y-6">
          {orders.length === 0 && (
            <div className="rounded-2xl border border-border bg-card/60 p-10 text-center backdrop-blur-xl">
              <p className="font-serif text-2xl italic">No commissions yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Discover a fragrance to begin your archive.
              </p>
              <Link
                to="/"
                className="mt-6 inline-block rounded-full bg-gold px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground hover:scale-[1.02] transition-transform"
              >
                Browse collection
              </Link>
            </div>
          )}

          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function OrderCard({ order: o }: { order: OrderView }) {
  const stage = stageIndex(o.status);
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Order · {o.id.slice(0, 8).toUpperCase()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {new Date(o.created_at).toLocaleDateString(undefined, {
              year: "numeric", month: "long", day: "numeric",
            })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">{o.status}</div>
          <div className="mt-1 font-serif text-xl">
            {formatPrice(o.total_cents, o.currency)}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <ol className="mt-6 grid grid-cols-4 gap-2">
        {TIMELINE.map((step, i) => {
          const done = i <= stage;
          const current = i === stage;
          return (
            <li key={step.key} className="flex flex-col items-center text-center">
              <div className="relative flex w-full items-center">
                <span
                  className={`h-px flex-1 ${i === 0 ? "opacity-0" : done ? "bg-gold" : "bg-border"}`}
                />
                <span
                  className={`mx-1 flex size-6 items-center justify-center rounded-full border text-[10px] ${
                    done
                      ? "border-gold bg-gold text-primary-foreground"
                      : "border-border bg-background/60 text-muted-foreground"
                  } ${current ? "ring-2 ring-gold/40" : ""}`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`h-px flex-1 ${i === TIMELINE.length - 1 ? "opacity-0" : done && i < stage ? "bg-gold" : "bg-border"}`}
                />
              </div>
              <div className={`mt-2 text-[10px] uppercase tracking-[0.25em] ${done ? "text-gold" : "text-muted-foreground"}`}>
                {step.label}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground/80">{step.hint}</div>
            </li>
          );
        })}
      </ol>

      <ul className="mt-6 divide-y divide-border">
        {o.items.map((it) => (
          <li key={it.id} className="flex items-center gap-4 py-3">
            {it.product_image && (
              <img src={it.product_image} alt="" className="size-14 rounded-md object-cover" />
            )}
            <div className="flex-1">
              <Link
                to="/product/$slug"
                params={{ slug: it.product_slug }}
                className="font-serif text-lg hover:text-gold transition-colors"
              >
                {it.product_name}
              </Link>
              <div className="text-xs text-muted-foreground">Qty {it.quantity}</div>
            </div>
            <div className="text-sm">
              {formatPrice(it.unit_price_cents * it.quantity, o.currency)}
            </div>
          </li>
        ))}
      </ul>

      {o.shipping_address && (
        <div className="mt-6 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Shipping to</div>
            <address className="mt-2 not-italic text-sm leading-relaxed text-foreground/90">
              {o.shipping_address.fullName}<br />
              {o.shipping_address.line1}
              {o.shipping_address.line2 ? <><br />{o.shipping_address.line2}</> : null}<br />
              {o.shipping_address.city}
              {o.shipping_address.region ? `, ${o.shipping_address.region}` : ""} {o.shipping_address.postalCode}<br />
              {o.shipping_address.country}
            </address>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Contact</div>
            <p className="mt-2 text-sm text-foreground/90">
              {o.shipping_address.phone ?? "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
