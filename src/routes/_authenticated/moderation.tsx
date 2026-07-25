import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  isCurrentUserModerator,
  listReviewsForModeration,
  setReviewStatus,
  deleteReviewAsModerator,
  type ReviewWithMeta,
} from "@/lib/reviews.functions";
import {
  listNigerianPrices,
  updatePriceSource,
  refreshProductPrice,
  refreshAllPrices,
  type PriceRow,
} from "@/lib/price-refresh.functions";

export const Route = createFileRoute("/_authenticated/moderation")({
  head: () => ({
    meta: [
      { title: "Moderation · ÆTHEL" },
      { name: "description", content: "Approve reviews and manage automated price refresh for ÆTHEL." },
      { property: "og:title", content: "Moderation · ÆTHEL" },
      { property: "og:description", content: "Internal moderation dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ModerationPage,
});

type Section = "reviews" | "prices";
type Filter = "pending" | "approved" | "rejected" | "all";

function ModerationPage() {
  const [section, setSection] = useState<Section>("reviews");
  const { data: mod, isLoading: modLoading } = useQuery({
    queryKey: ["is-moderator"],
    queryFn: () => isCurrentUserModerator(),
  });
  const isMod = mod?.isModerator ?? false;

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 pt-32 pb-24">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Atelier</span>
            <h1 className="mt-1 font-serif text-4xl">Moderation</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Approve customer reviews and keep the Nigerian collection prices in sync.
            </p>
          </div>
          <Link to="/account" className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-gold">
            ← Account
          </Link>
        </div>

        {modLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">Checking permissions…</p>
        ) : !isMod ? (
          <div className="mt-10 rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
            You don't have moderator access.
          </div>
        ) : (
          <>
            <div className="mt-8 flex gap-2">
              {(["reviews", "prices"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={
                    "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.3em] transition-colors " +
                    (section === s
                      ? "border-gold bg-gold text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-gold hover:text-gold")
                  }
                >
                  {s}
                </button>
              ))}
            </div>

            {section === "reviews" ? <ReviewsSection /> : <PricesSection />}
          </>
        )}
      </main>
    </AppShell>
  );
}

function ReviewsSection() {
  const [filter, setFilter] = useState<Filter>("pending");
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["moderation-reviews", filter],
    queryFn: () => listReviewsForModeration({ data: { status: filter } }),
  });

  const setStatus = useMutation({
    mutationFn: (v: { reviewId: string; status: "approved" | "rejected"; note?: string }) =>
      setReviewStatus({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moderation-reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const remove = useMutation({
    mutationFn: (reviewId: string) => deleteReviewAsModerator({ data: { reviewId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moderation-reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.3em] transition-colors " +
              (filter === f
                ? "border-gold bg-gold text-primary-foreground"
                : "border-border text-muted-foreground hover:border-gold hover:text-gold")
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            No reviews in this bucket.
          </p>
        ) : (
          reviews.map((r) => (
            <ReviewRow
              key={r.id}
              review={r}
              onApprove={() => setStatus.mutate({ reviewId: r.id, status: "approved" })}
              onReject={(note) => setStatus.mutate({ reviewId: r.id, status: "rejected", note })}
              onDelete={() => remove.mutate(r.id)}
              busy={setStatus.isPending || remove.isPending}
            />
          ))
        )}
      </div>
    </>
  );
}

function PricesSection() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["nigerian-prices"],
    queryFn: () => listNigerianPrices(),
  });

  const refreshAll = useMutation({
    mutationFn: () => refreshAllPrices(),
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ["nigerian-prices"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      const updated = results.filter((r) => r.status === "updated").length;
      const failed = results.filter((r) => r.status === "failed").length;
      const skipped = results.filter((r) => r.status === "skipped").length;
      toast.success(`Refresh complete — ${updated} updated, ${failed} failed, ${skipped} skipped`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Refresh failed"),
  });

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 p-5 text-sm">
        <div>
          <p className="font-serif text-lg">Automated price refresh</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Runs daily at 03:00 UTC. Set a source URL per product; the scraper reads the current NGN price from that page.
          </p>
        </div>
        <button
          onClick={() => refreshAll.mutate()}
          disabled={refreshAll.isPending}
          className="rounded-full bg-gold px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground disabled:opacity-60"
        >
          {refreshAll.isPending ? "Refreshing…" : "Refresh all now"}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading products…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No Nigerian products.</p>
        ) : (
          rows.map((row) => <PriceRowCard key={row.id} row={row} />)
        )}
      </div>
    </div>
  );
}

function PriceRowCard({ row }: { row: PriceRow }) {
  const qc = useQueryClient();
  const [sourceUrl, setSourceUrl] = useState(row.source_url ?? "");
  const [priceSource, setPriceSource] = useState(row.price_source ?? "");

  const save = useMutation({
    mutationFn: () =>
      updatePriceSource({
        data: {
          productId: row.id,
          sourceUrl: sourceUrl.trim() || null,
          priceSource: priceSource.trim() || null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nigerian-prices"] });
      toast.success("Source saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const refresh = useMutation({
    mutationFn: () => refreshProductPrice({ data: { productId: row.id } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["nigerian-prices"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      if (r.status === "updated") {
        toast.success(`Updated — ₦${((r.newPriceNgn ?? 0) / 100).toLocaleString()}`);
      } else if (r.status === "unchanged") {
        toast.message("Price unchanged");
      } else if (r.status === "failed") {
        toast.error(r.note ?? "Scrape failed");
      } else {
        toast.message(r.note ?? "Skipped");
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Refresh failed"),
  });

  const priceNgn = row.price_ngn ? Math.round(row.price_ngn / 100) : null;
  const dirty = (sourceUrl.trim() || null) !== (row.source_url ?? null)
    || (priceSource.trim() || null) !== (row.price_source ?? null);

  return (
    <article className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl">{row.name}</h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{row.slug}</p>
        </div>
        <div className="text-right">
          <div className="font-serif text-lg text-gold">
            {priceNgn ? `₦${priceNgn.toLocaleString()}` : "—"}
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {row.price_last_scraped_at
              ? `Checked ${new Date(row.price_last_scraped_at).toLocaleString()}`
              : "Never checked"}
          </div>
        </div>
      </header>

      {row.price_last_scrape_status && (
        <p
          className={
            "mt-2 text-[11px] uppercase tracking-[0.3em] " +
            (row.price_last_scrape_status === "failed"
              ? "text-destructive"
              : row.price_last_scrape_status === "updated"
              ? "text-gold"
              : "text-muted-foreground")
          }
        >
          {row.price_last_scrape_status}
          {row.price_last_scrape_note ? ` — ${row.price_last_scrape_note}` : ""}
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://www.jumia.com.ng/…"
          className="rounded-lg border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          value={priceSource}
          onChange={(e) => setPriceSource(e.target.value)}
          placeholder="Jumia"
          className="w-32 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-gold"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate()}
          className="rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold disabled:opacity-50"
        >
          {save.isPending ? "Saving…" : "Save source"}
        </button>
        <button
          disabled={!row.source_url || refresh.isPending}
          onClick={() => refresh.mutate()}
          className="rounded-full bg-gold px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground disabled:opacity-50"
        >
          {refresh.isPending ? "Refreshing…" : "Refresh now"}
        </button>
      </div>
    </article>
  );
}

function ReviewRow({
  review,
  onApprove,
  onReject,
  onDelete,
  busy,
}: {
  review: ReviewWithMeta;
  onApprove: () => void;
  onReject: (note?: string) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [note, setNote] = useState("");
  const [showReject, setShowReject] = useState(false);

  return (
    <article className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
      <header className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em]">
        <span
          className={
            review.status === "approved"
              ? "rounded-full border border-gold/60 px-2 py-0.5 text-gold"
              : review.status === "rejected"
              ? "rounded-full border border-destructive/60 px-2 py-0.5 text-destructive"
              : "rounded-full border border-border px-2 py-0.5 text-muted-foreground"
          }
        >
          {review.status}
        </span>
        <span className="flex items-center gap-1 text-gold">
          {"★".repeat(review.rating)}
          <span className="text-muted-foreground">{"★".repeat(5 - review.rating)}</span>
        </span>
        <span className="text-muted-foreground">by {review.author_name ?? "Anonymous"}</span>
        {review.verified && (
          <span className="rounded-full border border-gold/60 px-2 py-0.5 text-gold">Verified purchase</span>
        )}
        <span className="text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </header>

      {review.title && <h3 className="mt-3 font-serif text-xl">{review.title}</h3>}
      {review.body && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.body}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {review.status !== "approved" && (
          <button
            disabled={busy}
            onClick={onApprove}
            className="rounded-full bg-gold px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground disabled:opacity-60"
          >
            Approve
          </button>
        )}
        {review.status !== "rejected" && (
          <button
            disabled={busy}
            onClick={() => setShowReject((v) => !v)}
            className="rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.3em] hover:border-destructive hover:text-destructive"
          >
            Reject
          </button>
        )}
        <button
          disabled={busy}
          onClick={onDelete}
          className="ml-auto text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-destructive"
        >
          Delete
        </button>
      </div>

      {showReject && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional moderation note"
            maxLength={500}
            className="flex-1 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-gold"
          />
          <button
            disabled={busy}
            onClick={() => {
              onReject(note.trim() || undefined);
              setShowReject(false);
              setNote("");
            }}
            className="rounded-full bg-destructive px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-destructive-foreground disabled:opacity-60"
          >
            Confirm reject
          </button>
        </div>
      )}
    </article>
  );
}
