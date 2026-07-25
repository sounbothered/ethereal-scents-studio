import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImg from "@/assets/perfume-hero.jpg";
import p1 from "@/assets/perfume-1.jpg";
import p2 from "@/assets/perfume-2.jpg";
import p3 from "@/assets/perfume-3.jpg";
import p4 from "@/assets/perfume-4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ÆTHEL — Rare Fragrances, Hand-Poured in Grasse" },
      {
        name: "description",
        content:
          "ÆTHEL is a maison of rare fragrances. Discover Nocturne, Lumière Ambrée, and Noir Élixir — hand-poured, olfactory narratives crafted in Grasse.",
      },
      { property: "og:title", content: "ÆTHEL — Rare Fragrances" },
      {
        property: "og:description",
        content:
          "Hand-poured olfactory narratives designed to linger in the space between memory and moment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const products = [
  {
    name: "Nocturne",
    tagline: "Black Saffron · Leather · Vetiver",
    price: 240,
    img: heroImg,
    ratio: "aspect-[4/5]",
  },
  {
    name: "Lumière Ambrée",
    tagline: "Amber · Vanilla · Library Dust",
    price: 195,
    img: p1,
    ratio: "aspect-square",
  },
  {
    name: "Cristal Blanc",
    tagline: "Iris · White Musk · Bergamot",
    price: 220,
    img: p2,
    ratio: "aspect-[4/5]",
  },
  {
    name: "Noble Marine",
    tagline: "Sea Salt · Ambergris · Cedar",
    price: 210,
    img: p3,
    ratio: "aspect-square",
  },
  {
    name: "Noir Élixir",
    tagline: "Oud · Rose · Tobacco",
    price: 285,
    img: p4,
    ratio: "aspect-[4/5]",
  },
];

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
  const [cart, setCart] = useState(0);
  const [selected, setSelected] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onHeroMove = (e: React.MouseEvent | React.TouchEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pt =
      "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    const px = (pt.clientX - rect.left) / rect.width - 0.5;
    const py = (pt.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -18, y: px * 22 });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 glass-nav border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-gold animate-glow" />
            <span className="font-serif text-lg italic tracking-[0.25em]">
              ÆTHEL
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <a className="hover:text-foreground transition-colors">Maison</a>
            <a className="hover:text-foreground transition-colors">Collection</a>
            <a className="hover:text-foreground transition-colors">Journal</a>
          </div>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.25em]">
            <button aria-label="Search" className="opacity-70 hover:opacity-100">
              ⌕
            </button>
            <button
              onClick={() => setCart((c) => c + 1)}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 hover:border-gold transition-colors"
            >
              <span>Bag</span>
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-primary-foreground">
                {cart}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 pt-28 pb-16">
        {/* ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(600px 400px at 50% 30%, oklch(0.82 0.13 85 / 0.18), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-3 animate-rise">
            <div className="h-px w-8 bg-gold/50" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
              Maison de Parfum · Est. 1908
            </span>
          </div>

          <h1 className="animate-rise font-serif text-[clamp(2.75rem,10vw,6rem)] leading-[0.95] tracking-tight text-balance">
            The Scent of
            <br />
            <span className="italic text-shimmer">Unspoken</span> Memory.
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground animate-rise [animation-delay:120ms]">
            Hand-poured olfactory narratives, composed grain by grain in the
            hills of Grasse — designed to linger between the present and the
            past.
          </p>

          {/* 3D bottle stage */}
          <div
            ref={heroRef}
            onMouseMove={onHeroMove}
            onMouseLeave={resetTilt}
            onTouchMove={onHeroMove}
            onTouchEnd={resetTilt}
            className="relative mt-12 perspective-1200 animate-rise [animation-delay:240ms]"
          >
            {/* slow-rotating aura */}
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
              <div
                className="absolute inset-0 animate-float-3d"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={heroImg}
                  alt="Nocturne Eau de Parfum bottle"
                  width={800}
                  height={1104}
                  className="h-full w-full object-cover"
                />
                {/* rim highlight */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 55%, oklch(0.82 0.13 85 / 0.18) 60%, transparent 65%)",
                  }}
                />
              </div>
              {/* label */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
                    No. 07
                  </p>
                  <p className="mt-1 font-serif text-3xl italic">Nocturne</p>
                </div>
                <p className="font-serif text-xl">$240</p>
              </div>
            </div>

            {/* shadow */}
            <div
              aria-hidden
              className="mx-auto mt-4 h-6 w-2/3 max-w-xs rounded-[50%] bg-black/70 blur-2xl"
            />
          </div>

          {/* Note strip */}
          <div className="mt-10 flex gap-3 overflow-x-auto no-scrollbar pb-2">
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

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={() => setCart((c) => c + 1)}
              className="group relative overflow-hidden rounded-full bg-foreground px-8 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-background transition-transform hover:scale-[1.02]"
            >
              <span className="relative z-10">Add Nocturne — $240</span>
              <span className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-500 group-hover:translate-x-0" />
              <span className="absolute inset-0 -z-0 flex items-center justify-center text-primary-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                Add Nocturne — $240
              </span>
            </button>
            <button className="rounded-full border border-border px-8 py-4 text-[11px] font-medium uppercase tracking-[0.3em] hover:border-gold transition-colors">
              Discover Scent
            </button>
          </div>
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
            <button className="border-b border-gold pb-1 text-[10px] uppercase tracking-[0.3em] text-gold">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {products.map((p, i) => (
              <article
                key={p.name}
                className="group cursor-pointer"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className={`relative ${p.ratio} overflow-hidden rounded-2xl border border-border bg-card`}
                >
                  <img
                    src={p.img}
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
                      e.stopPropagation();
                      setCart((c) => c + 1);
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
                      {p.tagline}
                    </p>
                  </div>
                  <span className="font-serif text-xl">${p.price}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

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

      {/* SCULPT YOUR SCENT */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Bespoke
          </span>
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
                    <span className="text-sm uppercase tracking-[0.2em]">
                      {f}
                    </span>
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

          <button className="mt-10 rounded-full bg-gold px-10 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-primary-foreground transition-transform hover:scale-[1.02]">
            Commission Your Vial — $360
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-gold" />
                <span className="font-serif text-2xl italic tracking-[0.25em]">
                  ÆTHEL
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Rare fragrances hand-poured in Grasse, France. A quiet maison
                for those who wear scent as language.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 md:grid-cols-3 md:gap-16 text-sm">
              {[
                {
                  title: "Maison",
                  items: ["Our Story", "Atelier", "Ingredients"],
                },
                {
                  title: "Boutique",
                  items: ["Shop All", "Bespoke", "Gift Cards"],
                },
                {
                  title: "Care",
                  items: ["Shipping", "Contact", "Journal"],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                    {col.title}
                  </p>
                  <ul className="mt-4 space-y-2 text-muted-foreground">
                    {col.items.map((it) => (
                      <li
                        key={it}
                        className="cursor-pointer hover:text-foreground transition-colors"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex-row md:items-center">
            <span>© 2026 Æthel Parfumerie · Grasse</span>
            <span>Crafted with intent</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
