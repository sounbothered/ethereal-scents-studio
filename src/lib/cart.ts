import { useEffect, useState, useCallback } from "react";

export type CartItem = { productId: string; quantity: number };

const KEY = "aethel_cart_v1";
const EVENT = "aethel:cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        i && typeof i.productId === "string" && typeof i.quantity === "number",
    );
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
    const sync = () => setItems(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((productId: string, qty = 1) => {
    const current = read();
    const idx = current.findIndex((i) => i.productId === productId);
    if (idx >= 0) current[idx].quantity += qty;
    else current.push({ productId, quantity: qty });
    write(current);
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    let current = read();
    if (qty <= 0) current = current.filter((i) => i.productId !== productId);
    else {
      const idx = current.findIndex((i) => i.productId === productId);
      if (idx >= 0) current[idx].quantity = qty;
    }
    write(current);
  }, []);

  const remove = useCallback((productId: string) => setQty(productId, 0), [setQty]);
  const clear = useCallback(() => write([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  return { items, count, ready, add, setQty, remove, clear };
}

export function formatPrice(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatNgn(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

// USD-per-NGN rate for approximate cross-display (mid-2026)
const NGN_PER_USD = 1580;

export type PriceInput = {
  price_cents: number;
  currency: string;
  price_ngn?: number | null;
  origin?: string | null;
};

/** Returns { primary, secondary } — NGN-primary for Nigerian products, USD-primary otherwise. */
export function formatDualPrice(p: PriceInput): { primary: string; secondary: string | null } {
  const isNgnNative = (p.origin?.toLowerCase() === "nigeria") && p.price_ngn != null;
  if (isNgnNative && p.price_ngn != null) {
    const usd = Math.round(p.price_ngn / 100 / NGN_PER_USD);
    return { primary: formatNgn(p.price_ngn), secondary: `~$${usd}` };
  }
  const primary = formatPrice(p.price_cents, p.currency);
  const ngn = p.price_ngn ?? Math.round((p.price_cents / 100) * NGN_PER_USD * 100);
  return { primary, secondary: `~${formatNgn(ngn)}` };
}

