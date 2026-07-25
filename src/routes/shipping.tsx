import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage } from "@/components/EditorialPage";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping — ÆTHEL" },
      {
        name: "description",
        content:
          "Complimentary carbon-neutral shipping worldwide. Discreet packaging, signature required, delivered in three to seven business days.",
      },
      { property: "og:title", content: "Shipping — ÆTHEL" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shipping" },
    ],
    links: [{ rel: "canonical", href: "/shipping" }],
  }),
  component: () => (
    <EditorialPage
      eyebrow="Delivery"
      title={
        <>
          Discreet, insured,
          <br />
          <span className="italic">carbon-neutral.</span>
        </>
      }
      lede="Every order leaves the atelier in silk-lined packaging, tracked, insured, and offset at origin."
    >
      <div className="space-y-10 text-[15px] leading-[1.85] text-muted-foreground">
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Rates & timing
          </h2>
          <ul className="mt-6 space-y-3">
            <li>
              <span className="text-foreground">Standard (worldwide)</span> —
              complimentary on all orders. 3–7 business days.
            </li>
            <li>
              <span className="text-foreground">Express</span> — €25. 1–3
              business days to most destinations.
            </li>
            <li>
              <span className="text-foreground">Same-day (Paris & Grasse)</span>{" "}
              — €40, placed before 11:00 CET.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Signature & customs
          </h2>
          <p className="mt-4">
            All shipments require an adult signature. Duties and taxes for
            destinations outside the EU are calculated at checkout so nothing
            arrives with a bill.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Restricted destinations
          </h2>
          <p className="mt-4">
            Perfume is a regulated flammable good. We are unable to ship to a
            small number of jurisdictions; if we cannot fulfil an order it is
            refunded in full within twenty-four hours.
          </p>
        </section>
      </div>
    </EditorialPage>
  ),
});
