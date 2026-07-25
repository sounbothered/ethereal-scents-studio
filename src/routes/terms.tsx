import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage } from "@/components/EditorialPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — ÆTHEL" },
      {
        name: "description",
        content:
          "Terms of sale and use for the Æthel online parfumerie. Written to be read, not filed away.",
      },
      { property: "og:title", content: "Terms — ÆTHEL" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <EditorialPage
      eyebrow="Terms"
      title={
        <>
          The quiet
          <br />
          <span className="italic">agreement.</span>
        </>
      }
      lede="A short set of terms governing the use of aethel.paris and the sale of our fragrances. This page is app-owner editable content and not a substitute for regulated legal advice."
    >
      <div className="space-y-10 text-[15px] leading-[1.85] text-muted-foreground">
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Orders
          </h2>
          <p className="mt-4">
            An order is confirmed only when a receipt email is issued. We may
            decline any order at our discretion — for example, if a product is
            out of stock or a delivery address cannot be verified.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Pricing
          </h2>
          <p className="mt-4">
            Prices are shown in the currency selected at checkout and include
            VAT where applicable. We reserve the right to correct pricing
            errors before a shipment leaves the atelier.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Accounts & reviews
          </h2>
          <p className="mt-4">
            You are responsible for the security of your account credentials.
            Reviews you submit are moderated before publication and must
            reflect your genuine experience with the fragrance.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Governing law
          </h2>
          <p className="mt-4">
            These terms are governed by the laws of France. Any dispute is
            addressed first through good-faith correspondence with the atelier.
          </p>
        </section>
      </div>
    </EditorialPage>
  ),
});
