import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProductBySlug } from "@/lib/catalog.functions";
import { listReviewsForProduct, upsertReview, deleteMyReview } from "@/lib/reviews.functions";
import { useCart, formatPrice } from "@/lib/cart";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { imageForSlug } from "@/lib/product-images";

const productQO = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
    staleTime: 60_000,
  });

const reviewsQO = (productId: string | undefined) =>
  queryOptions({
    queryKey: ["reviews", productId],
    queryFn: () =>
      productId ? listReviewsForProduct({ data: { productId } }) : Promise.resolve([]),
    staleTime: 15_000,
    enabled: !!productId,
  });

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData(productQO(params.slug));
    if (!product) throw notFound();
    await context.queryClient.ensureQueryData(reviewsQO(product.id));
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Fragrance not found · ÆTHEL" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const p = loaderData.product;
    const desc = p.description ?? `${p.notes ?? ""} — a fragrance by ÆTHEL.`;
    return {
      meta: [
        { title: `${p.name} · ÆTHEL` },
        { name: "description", content: desc },
        { property: "og:title", content: `${p.name} · ÆTHEL` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(p.image_url
          ? [
              { property: "og:image", content: p.image_url },
              { name: "twitter:image", content: p.image_url },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 pt-40 pb-24 text-center">
        <h1 className="font-serif text-4xl">Fragrance not found.</h1>
        <Link to="/" className="mt-6 inline-block text-gold underline-offset-4 hover:underline">
          Return to maison
        </Link>
      </div>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="p-10 text-sm text-destructive">{error.message}</p>
    </AppShell>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { data: reviews = [] } = useSuspenseQuery(reviewsQO(product.id));
  const { add } = useCart();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      setUserId(data.session?.user.id ?? null),
    );
    const { data } = supabase.auth.onAuthStateChange((_e, s) =>
      setUserId(s?.user.id ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: py * -14, y: px * 18 });
  };

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
        <Link
          to="/"
          className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-gold transition-colors"
        >
          ← Collection
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div
            className="perspective-1200"
            onMouseMove={onMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          >
            <div
              className="preserve-3d relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-border shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out"
              style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
            >
              <img
                src={product.image_url || imageForSlug(product.slug)}
                alt={product.name}
                className="h-full w-full object-cover animate-float-3d"
              />

              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 55%, oklch(0.82 0.13 85 / 0.2) 60%, transparent 65%)",
                }}
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
              {product.house}
            </span>
            <h1 className="mt-2 font-serif text-5xl leading-tight">{product.name}</h1>
            <p className="mt-3 text-sm text-muted-foreground italic">{product.notes}</p>

            {reviews.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs">
                <Stars value={avg} />
                <span className="text-muted-foreground">
                  {avg.toFixed(1)} · {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-8 flex items-baseline gap-6">
              <span className="font-serif text-4xl">
                {formatPrice(product.price_cents, product.currency)}
              </span>
              <button
                onClick={() => {
                  add(product.id, 1);
                  toast.success(`${product.name} added to your bag`);
                }}
                className="rounded-full bg-gold px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Add to bag
              </button>
            </div>
          </div>
        </div>

        <ReviewsSection productId={product.id} reviews={reviews} userId={userId} />
      </div>
    </AppShell>
  );
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={i <= Math.round(value) ? "fill-gold" : "fill-border"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewsSection({
  productId,
  reviews,
  userId,
}: {
  productId: string;
  reviews: Awaited<ReturnType<typeof listReviewsForProduct>>;
  userId: string | null;
}) {
  const qc = useQueryClient();
  const myReview = userId ? reviews.find((r) => r.user_id === userId) : undefined;
  const [rating, setRating] = useState(myReview?.rating ?? 5);
  const [title, setTitle] = useState(myReview?.title ?? "");
  const [body, setBody] = useState(myReview?.body ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setRating(myReview?.rating ?? 5);
    setTitle(myReview?.title ?? "");
    setBody(myReview?.body ?? "");
  }, [myReview?.id, myReview?.rating, myReview?.title, myReview?.body]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return toast.error("Choose a rating");
    setBusy(true);
    try {
      await upsertReview({
        data: {
          productId,
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
        },
      });
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      toast.success(
        myReview
          ? "Review updated — awaiting moderation before it appears publicly"
          : "Thank you — your review is awaiting moderation",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post review");
    } finally {
      setBusy(false);
    }
  };

  const removeReview = async () => {
    setBusy(true);
    try {
      await deleteMyReview({ data: { productId } });
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      toast.success("Review removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-24 border-t border-border pt-12">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Impressions</span>
          <h2 className="mt-1 font-serif text-3xl">Reviews</h2>
        </div>
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_1.2fr]">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
          {userId ? (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Your rating
                </span>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      className="p-0.5"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        className={n <= rating ? "fill-gold" : "fill-border hover:fill-muted-foreground transition-colors"}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  className="mt-2 w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-gold"
                  placeholder="A brief impression"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Notes
                </span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-gold resize-none"
                  placeholder="How does it wear on you?"
                />
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-full bg-gold px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground disabled:opacity-60"
                >
                  {myReview ? "Update review" : "Post review"}
                </button>
                {myReview && (
                  <button
                    type="button"
                    onClick={removeReview}
                    disabled={busy}
                    className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Sign in to leave a review.</p>
              <Link
                to="/auth"
                className="mt-4 inline-block rounded-full bg-gold px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No impressions yet. Be the first to write one.
            </p>
          )}
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-border bg-card/40 p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span className="text-sm">{r.author_name ?? "Anonymous"}</span>
                  {r.verified && (
                    <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.25em] text-gold">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {r.title && <h3 className="mt-3 font-serif text-lg">{r.title}</h3>}
              {r.body && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {r.body}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
