import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SiteFooter } from "@/components/SiteFooter";

const faqs = [
  {
    q: "How long does an Æthel fragrance last on skin?",
    a: "Between 8 and 12 hours, depending on skin chemistry and season. The drydown continues to evolve for 24 to 48 hours on fabric.",
  },
  {
    q: "Do you offer discovery sets?",
    a: "Yes — a 5×2ml discovery vial set is available on every product page. The cost is refunded against a full bottle purchase within thirty days.",
  },
  {
    q: "Are your fragrances vegan and cruelty-free?",
    a: "Every composition is vegan and never tested on animals. Ambergris is sustainably foraged from beach strandings; we use no synthetic musks derived from animal sources.",
  },
  {
    q: "Can I have a bottle engraved?",
    a: "Complimentary engraving of up to twelve characters is available at checkout. Bespoke commissions include hand-blown flacons.",
  },
  {
    q: "How should I store my bottle?",
    a: "Away from direct sunlight, at a stable temperature below 22°C. The silk-lined box is designed for exactly this — keep it.",
  },
  {
    q: "Do you accept trade or press enquiries?",
    a: "Please write to press@aethel.paris with a brief on your outlet or boutique. We respond to every request within a week.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — ÆTHEL" },
      {
        name: "description",
        content:
          "Answers on longevity, discovery sets, sourcing, engraving, storage, and trade enquiries for Æthel fragrances.",
      },
      { property: "og:title", content: "FAQ — ÆTHEL" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <AppShell>
      <div className="relative px-6 pt-32 pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
          style={{
            background:
              "radial-gradient(700px 400px at 30% 20%, oklch(0.82 0.13 85 / 0.14), transparent 70%)",
          }}
        />
        <header className="relative mx-auto max-w-3xl">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Answers
          </span>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Quiet
            <br />
            <span className="italic">questions.</span>
          </h1>
        </header>
      </div>
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/40">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group p-6 md:p-8 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                <span className="font-serif text-lg italic text-foreground">
                  {f.q}
                </span>
                <span className="mt-1 shrink-0 text-gold transition-transform group-open:rotate-45 text-xl leading-none">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
      <SiteFooter />
    </AppShell>
  );
}
