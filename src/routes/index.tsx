import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { listProducts } from "@/lib/catalog.functions";
import { useCart, formatPrice, formatDualPrice } from "@/lib/cart";
import { imageForSlug, heroImg } from "@/lib/product-images";
import { SiteFooter } from "@/components/SiteFooter";

const productsQO = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ÆTHEL — Rare Fragrances, Hand-Poured in Grasse" },
      {
        name: "description",
        content:
          "ÆTHEL is a maison of rare fragrances. Discover Nocturne, Velvet Hour, and Midnight Tide — hand-poured olfactory narratives crafted in Grasse.",
      },
      { property: "og:title", content: "ÆTHEL — Rare Fragrances, Hand-Poured in Grasse" },
      {
        property: "og:description",
        content:
          "ÆTHEL is a maison of rare fragrances. Discover Nocturne, Velvet Hour, and Midnight Tide — hand-poured olfactory narratives crafted in Grasse.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQO),
  errorComponent: ({ error }) => (
    <div className="p-10 text-sm text-destructive">Could not load collection: {error.message}</div>
  ),
  component: Home,
});

const notes = [
  { label: "Top", value: "Black Saffron, Bergamot" },
  { label: "Heart", value: "Leather Accord, Iris" },
  { label: "Base", value: "Vetiver, Ambergris, Oud" },
];

const families = [
  "Citrus & Bergamot",
  "Oud & Sandalwood",
  "Rose & Jasmine",
  "Amber & Resin",
];

function Home() {
  const { data: products } = useSuspenseQuery(productsQO);
  const { count, add } = useCart();
  const [selected, setSelected] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  const aethel = products.filter((p) => p.collection !== "nigerian-houses");
  const nigerian = products.filter((p) => p.collection === "nigerian-houses");
  const hero = aethel[0] ?? products[0];
  const collection = aethel;

  const onHeroMove = (e: React.MouseEvent | React.TouchEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pt = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    const px = (pt.clientX - rect.left) / rect.width - 0.5;
    const py = (pt.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -18, y: px * 22 });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const ratios = ["aspect-[4/5]", "aspect-square", "aspect-[4/5]", "aspect-square"];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 glass-nav border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-gold animate-glow" />
            <span className="font-serif text-lg italic tracking-[0.25em]">ÆTHEL</span>
          </div>
          <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/maison" className="hover:text-foreground transition-colors">The House</Link>
            <a href="#nigerian-houses" className="hover:text-foreground transition-colors">Nigerian</a>
            <Link to="/journal" className="hover:text-foreground transition-colors">Journal</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            {userEmail && (
              <Link to="/account" className="hover:text-foreground transition-colors">
                Account
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
            {userEmail ? (
              <button
                onClick={handleSignOut}
                className="inline-block text-muted-foreground hover:text-gold transition-colors"
                title={userEmail}
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                className="inline-block text-muted-foreground hover:text-gold transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link
              to="/checkout"
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 hover:border-gold transition-colors"
            >
              <span>Bag</span>
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-primary-foreground">
                {count}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 pt-28 pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 500px at 20% 30%, oklch(0.82 0.13 85 / 0.18), transparent 70%), radial-gradient(500px 400px at 80% 70%, oklch(0.82 0.13 85 / 0.10), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid grid-cols-12 items-center gap-8">
            <div className="col-span-12 md:col-span-6 space-y-6 animate-rise">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
                Est. Grasse, 1908 · Maison Æthel
              </span>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-shimmer">
                Scent, <br />
                <span className="italic">Sculpted.</span>
              </h1>
              <p className="max-w-md text-sm md:text-base text-muted-foreground leading-relaxed">
                Hand-poured olfactory narratives designed to linger in the space
                between memory and moment. Never rushed, never in the past.
              </p>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div
                ref={heroRef}
                onMouseMove={onHeroMove}
                onMouseLeave={resetTilt}
                onTouchMove={onHeroMove}
                onTouchEnd={resetTilt}
                className="relative perspective-1200 animate-rise [animation-delay:240ms]"
              >
                <div
                  aria-hidden
                  className="absolute left-1/2 top-1/2 -z-10 size-[110%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full opacity-40"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0%, oklch(0.82 0.13 85 / 0.35) 25%, transparent 50%, oklch(0.82 0.13 85 / 0.25) 75%, transparent 100%)",
                    filter: "blur(40px)",
                  }}
                />
                <div
                  className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-3xl border border-border shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] preserve-3d transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateY(${scrollY * -0.08}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  }}
                >
                  <div className="absolute inset-0 animate-float-3d">
                    <img
                      src={heroImg}
                      alt="Nocturne perfume bottle"
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(115deg, transparent 55%, oklch(0.82 0.13 85 / 0.18) 60%, transparent 65%)",
                      }}
                    />
                  </div>
                  {hero && (
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
                          No. 01
                        </p>
                        <p className="mt-1 font-serif text-3xl italic">{hero.name}</p>
                      </div>
                      <p className="font-serif text-xl">
                        {formatPrice(hero.price_cents, hero.currency)}
                      </p>
                    </div>
                  )}
                </div>
                <div
                  aria-hidden
                  className="mx-auto mt-4 h-6 w-2/3 max-w-xs rounded-[50%] bg-black/70 blur-2xl"
                />
              </div>
            </div>
          </div>

          <div className="mt-16 flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {notes.map((n) => (
              <div
                key={n.label}
                className="min-w-[190px] rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-colors hover:border-gold/50"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
                  {n.label} Note
                </span>
                <p className="mt-2 font-serif text-lg">{n.value}</p>
              </div>
            ))}
          </div>

          {hero && (
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  add(hero.id, 1);
                  toast.success(`${hero.name} added to your bag`);
                }}
                className="group relative overflow-hidden rounded-full bg-foreground px-8 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-background transition-transform hover:scale-[1.02]"
              >
                <span className="relative z-10">
                  Add {hero.name} — {formatPrice(hero.price_cents, hero.currency)}
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-500 group-hover:translate-x-0" />
              </button>
              <Link
                to="/product/$slug"
                params={{ slug: hero.slug }}
                className="rounded-full border border-border px-8 py-4 text-[11px] font-medium uppercase tracking-[0.3em] hover:border-gold transition-colors"
              >
                Discover Scent
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-border py-6 overflow-hidden">
        <div className="flex gap-16 whitespace-nowrap animate-[shimmer_30s_linear_infinite] font-serif italic text-2xl text-muted-foreground">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-16 shrink-0">
              <span>Grasse · France</span>
              <span className="text-gold">✦</span>
              <span>Hand-Poured</span>
              <span className="text-gold">✦</span>
              <span>Rare Ingredients</span>
              <span className="text-gold">✦</span>
              <span>Since 1908</span>
              <span className="text-gold">✦</span>
              <span>Free Shipping</span>
              <span className="text-gold">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* COLLECTION */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
                The Archive
              </span>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-none">
                Curated
                <br />
                <span className="italic">Collections</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {collection.map((p, i) => (
              <Link
                key={p.id}
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="group block"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className={`relative ${ratios[i % ratios.length]} overflow-hidden rounded-2xl border border-border bg-card`}
                >
                  <img
                    src={imageForSlug(p.slug)}
                    alt={`${p.name} perfume bottle`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      add(p.id, 1);
                      toast.success(`${p.name} added to your bag`);
                    }}
                    className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
                    aria-label={`Add ${p.name} to bag`}
                  >
                    <span className="text-xl leading-none">+</span>
                  </button>
                  <div className="absolute bottom-4 left-4 right-4 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                      Discover
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-2xl italic">{p.name}</h3>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {p.notes}
                    </p>
                  </div>
                  <span className="font-serif text-xl">
                    {formatPrice(p.price_cents, p.currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NIGERIAN HOUSES */}
      {nigerian.length > 0 && (
        <section id="nigerian-houses" className="px-6 py-24 border-t border-border bg-card/20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex items-end justify-between gap-6 flex-wrap">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
                  Lagos · Abuja · Port Harcourt
                </span>
                <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-none">
                  Nigerian
                  <br />
                  <span className="italic">Houses</span>
                </h2>
                <p className="mt-4 max-w-md text-sm text-muted-foreground">
                  A curated selection of contemporary Nigerian perfumery — oud,
                  amber and rose, priced in Naira with USD equivalents.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {nigerian.map((p) => {
                const dual = formatDualPrice(p);
                return (
                  <Link
                    key={p.id}
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card">
                      <img
                        src={imageForSlug(p.slug)}
                        alt={`${p.name} by ${p.house}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-background/60 px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-gold backdrop-blur">
                        {p.house}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          add(p.id, 1);
                          toast.success(`${p.name} added to your bag`);
                        }}
                        className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
                        aria-label={`Add ${p.name} to bag`}
                      >
                        <span className="text-xl leading-none">+</span>
                      </button>
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-xl italic">{p.name}</h3>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {p.notes}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-lg leading-tight">{dual.primary}</div>
                        {dual.secondary && (
                          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {dual.secondary}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* QUOTE */}
      <section className="px-6 py-24 bg-card/40 border-y border-border">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif italic text-3xl md:text-4xl leading-relaxed text-foreground/90">
            "A scent is a silent language — a memory captured
            <br className="hidden md:block" /> in a bottle of quiet glass."
          </p>
          <div className="mt-10 flex items-center justify-center gap-2">
            <span className="h-px w-12 bg-gold/40" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
              Maison Journal · No. XII
            </span>
            <span className="h-px w-12 bg-gold/40" />
          </div>
        </div>
      </section>

      {/* SCULPT */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Bespoke</span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            Sculpt <span className="italic">Your</span> Scent
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            Compose a private accord from four base families. Each vial is
            blended by hand and delivered in seven days.
          </p>
          <div className="mt-10 flex flex-col gap-2">
            {families.map((f, i) => {
              const active = selected === i;
              return (
                <button
                  key={f}
                  onClick={() => setSelected(i)}
                  className={`group flex h-16 items-center justify-between rounded-xl border px-5 text-left transition-all ${
                    active
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border hover:border-gold/60 hover:bg-card"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className="font-serif text-xs tabular-nums opacity-60">
                      0{i + 1}
                    </span>
                    <span className="text-sm uppercase tracking-[0.2em]">{f}</span>
                  </span>
                  <span
                    className={`size-3 rounded-full border transition-colors ${
                      active ? "border-gold bg-gold" : "border-gold/40"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
