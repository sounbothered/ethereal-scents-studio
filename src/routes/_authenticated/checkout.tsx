import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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

type AddressForm = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
};

const EMPTY_ADDRESS: AddressForm = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  phone: "",
};

const ADDRESS_KEY = "aethel:shipping";

function CheckoutPage() {
  const { items, setQty, remove, clear, ready } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [addr, setAddr] = useState<AddressForm>(EMPTY_ADDRESS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADDRESS_KEY);
      if (raw) setAddr({ ...EMPTY_ADDRESS, ...JSON.parse(raw) });
    } catch {}
  }, []);

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

  const setField = (k: keyof AddressForm) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setAddr((prev) => ({ ...prev, [k]: e.target.value }));

  const addressValid =
    addr.fullName.trim().length >= 2 &&
    addr.line1.trim().length >= 2 &&
    addr.city.trim().length >= 1 &&
    addr.postalCode.trim().length >= 2 &&
    addr.country.trim().length >= 2;

  const handlePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) return;
    if (!addressValid) return toast.error("Please complete your shipping address");
    setSubmitting(true);
    try {
      try { localStorage.setItem(ADDRESS_KEY, JSON.stringify(addr)); } catch {}
      const { orderId } = await placeOrder({
        data: {
          items: lines.map((l) => ({ productId: l.id, quantity: l.quantity })),
          shipping: {
            fullName: addr.fullName.trim(),
            line1: addr.line1.trim(),
            line2: addr.line2.trim() || undefined,
            city: addr.city.trim(),
            region: addr.region.trim() || undefined,
            postalCode: addr.postalCode.trim(),
            country: addr.country.trim(),
            phone: addr.phone.trim() || undefined,
          },
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

  const inputCls =
    "mt-2 w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-gold transition-colors";
  const labelCls = "block";
  const legendCls = "text-[10px] uppercase tracking-[0.3em] text-muted-foreground";

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-24">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Checkout</span>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">Your commission</h1>

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
          <form onSubmit={handlePlace} className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
            <section className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
              <h2 className="font-serif text-2xl">Shipping</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Where should the maison send your flacon?
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={`${labelCls} sm:col-span-2`}>
                  <span className={legendCls}>Full name</span>
                  <input required value={addr.fullName} onChange={setField("fullName")} className={inputCls} autoComplete="name" />
                </label>
                <label className={`${labelCls} sm:col-span-2`}>
                  <span className={legendCls}>Address line 1</span>
                  <input required value={addr.line1} onChange={setField("line1")} className={inputCls} autoComplete="address-line1" />
                </label>
                <label className={`${labelCls} sm:col-span-2`}>
                  <span className={legendCls}>Address line 2 (optional)</span>
                  <input value={addr.line2} onChange={setField("line2")} className={inputCls} autoComplete="address-line2" />
                </label>
                <label className={labelCls}>
                  <span className={legendCls}>City</span>
                  <input required value={addr.city} onChange={setField("city")} className={inputCls} autoComplete="address-level2" />
                </label>
                <label className={labelCls}>
                  <span className={legendCls}>Region / State</span>
                  <input value={addr.region} onChange={setField("region")} className={inputCls} autoComplete="address-level1" />
                </label>
                <label className={labelCls}>
                  <span className={legendCls}>Postal code</span>
                  <input required value={addr.postalCode} onChange={setField("postalCode")} className={inputCls} autoComplete="postal-code" />
                </label>
                <label className={labelCls}>
                  <span className={legendCls}>Country</span>
                  <input required value={addr.country} onChange={setField("country")} className={inputCls} autoComplete="country-name" />
                </label>
                <label className={`${labelCls} sm:col-span-2`}>
                  <span className={legendCls}>Phone (optional)</span>
                  <input value={addr.phone} onChange={setField("phone")} className={inputCls} autoComplete="tel" inputMode="tel" />
                </label>
              </div>
            </section>

            <aside className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl h-fit lg:sticky lg:top-24">
              <h2 className="font-serif text-2xl">Bag</h2>
              <ul className="mt-4 divide-y divide-border">
                {lines.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-4">
                    {l.image_url && (
                      <img src={l.image_url} alt="" className="size-14 rounded-md object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/product/$slug"
                        params={{ slug: l.slug }}
                        className="block truncate font-serif text-base hover:text-gold transition-colors"
                      >
                        {l.name}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <button type="button" onClick={() => setQty(l.id, l.quantity - 1)} className="size-6 rounded-full border border-border hover:border-gold text-xs" aria-label="Decrease">−</button>
                        <span className="w-6 text-center text-xs tabular-nums">{l.quantity}</span>
                        <button type="button" onClick={() => setQty(l.id, l.quantity + 1)} className="size-6 rounded-full border border-border hover:border-gold text-xs" aria-label="Increase">+</button>
                        <button type="button" onClick={() => remove(l.id)} className="ml-auto text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive">Remove</button>
                      </div>
                    </div>
                    <div className="text-sm tabular-nums">
                      {formatPrice(l.price_cents * l.quantity, l.currency)}
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(total, currency)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Shipping</dt><dd>Complimentary</dd>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-border">
                  <dt className="text-[10px] uppercase tracking-[0.3em]">Total</dt>
                  <dd className="font-serif text-2xl tabular-nums">{formatPrice(total, currency)}</dd>
                </div>
              </dl>

              <button
                type="submit"
                disabled={submitting || !addressValid}
                className="mt-6 w-full rounded-full bg-gold py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
              >
                {submitting ? "Placing order…" : "Place order"}
              </button>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Simulated checkout · no payment collected
              </p>
            </aside>
          </form>
        )}
      </div>
    </AppShell>
  );
}
