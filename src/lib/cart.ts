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

/**
 * Money & rounding rules (single source of truth)
 * -------------------------------------------------
 * Storage:
 *   • USD is stored as integer CENTS  (1 USD = 100 cents)
 *   • NGN is stored as integer KOBO   (1 NGN = 100 kobo)
 * Display:
 *   • Both currencies render as WHOLE major units (no fractional $ / ₦)
 *   • Rounding is HALF-UP to the nearest whole major unit
 * Arithmetic:
 *   • Multiply / sum ONLY in integer minor units, never on formatted strings
 *   • Convert across currencies at the LAST step, via the helpers below
 */

// USD ↔ NGN reference rate (mid-2026). One knob, used everywhere.
const NGN_PER_USD = 1394;

/** Round HALF-UP; keeps behaviour identical for negative values too. */
function roundHalfUp(n: number): number {
  return Math.sign(n) * Math.round(Math.abs(n));
}

/** cents (USD minor) → kobo (NGN minor). Both are integers. */
export function usdCentsToNgnKobo(cents: number): number {
  // cents * (naira/dollar) = kobo   (because 100 cents = 1 dollar, 100 kobo = 1 naira)
  return roundHalfUp(cents * NGN_PER_USD);
}

/** kobo (NGN minor) → cents (USD minor). Both are integers. */
export function ngnKoboToUsdCents(kobo: number): number {
  return roundHalfUp(kobo / NGN_PER_USD);
}

export function formatPrice(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundHalfUp(cents) / 100);
}

export function formatNgn(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(roundHalfUp(kobo) / 100);
}

export type PriceInput = {
  price_cents: number;
  currency: string;
  price_ngn?: number | null;
  origin?: string | null;
};

/** True when a product's canonical price is stored in NGN. */
function isNgnNative(p: PriceInput): boolean {
  return p.origin?.toLowerCase() === "nigeria" && p.price_ngn != null;
}

/** Canonical minor-unit amount + currency for a single unit of `p`. */
export function unitMinor(p: PriceInput): { minor: number; currency: "NGN" | "USD" } {
  if (isNgnNative(p) && p.price_ngn != null) return { minor: p.price_ngn, currency: "NGN" };
  return { minor: p.price_cents, currency: "USD" };
}

/** Returns { primary, secondary } — NGN-primary for Nigerian products, USD-primary otherwise. */
export function formatDualPrice(p: PriceInput): { primary: string; secondary: string | null } {
  if (isNgnNative(p) && p.price_ngn != null) {
    return {
      primary: formatNgn(p.price_ngn),
      secondary: `~${formatPrice(ngnKoboToUsdCents(p.price_ngn), "USD")}`,
    };
  }
  const ngn = p.price_ngn ?? usdCentsToNgnKobo(p.price_cents);
  return {
    primary: formatPrice(p.price_cents, p.currency),
    secondary: `~${formatNgn(ngn)}`,
  };
}

/**
 * Sum a bag of lines into both currencies. Line math stays in integer minor
 * units per currency; cross-currency conversion happens exactly ONCE at the end.
 */
export function sumBagTotals(
  lines: Array<PriceInput & { quantity: number }>,
): { usdCents: number; ngnKobo: number; hasNgnNative: boolean } {
  let usdCents = 0;
  let ngnKobo = 0;
  let hasNgnNative = false;
  for (const l of lines) {
    const { minor, currency } = unitMinor(l);
    const lineMinor = minor * l.quantity; // exact integer
    if (currency === "NGN") {
      hasNgnNative = true;
      ngnKobo += lineMinor;
      usdCents += ngnKoboToUsdCents(lineMinor);
    } else {
      usdCents += lineMinor;
      ngnKobo += usdCentsToNgnKobo(lineMinor);
    }
  }
  return { usdCents, ngnKobo, hasNgnNative };
}

/** Line-total dual formatting: multiply in minor units, then format once. */
export function formatDualLineTotal(
  p: PriceInput,
  quantity: number,
): { primary: string; secondary: string | null } {
  const { minor, currency } = unitMinor(p);
  const lineMinor = minor * quantity;
  if (currency === "NGN") {
    return {
      primary: formatNgn(lineMinor),
      secondary: `~${formatPrice(ngnKoboToUsdCents(lineMinor), "USD")}`,
    };
  }
  return {
    primary: formatPrice(lineMinor, p.currency),
    secondary: `~${formatNgn(usdCentsToNgnKobo(lineMinor))}`,
  };
}


