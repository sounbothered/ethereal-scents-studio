import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage } from "@/components/EditorialPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns — ÆTHEL" },
      {
        name: "description",
        content:
          "Thirty days to reconsider. Unopened bottles may be returned for a full refund; sampled bottles for store credit.",
      },
      { property: "og:title", content: "Returns — ÆTHEL" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/returns" },
    ],
    links: [{ rel: "canonical", href: "/returns" }],
  }),
  component: () => (
    <EditorialPage
      eyebrow="Returns"
      title={
        <>
          Thirty days
          <br />
          <span className="italic">to reconsider.</span>
        </>
      }
      lede="A scent needs weeks to settle into a wardrobe. Take yours; if it does not become yours, return it."
    >
      <div className="space-y-10 text-[15px] leading-[1.85] text-muted-foreground">
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            The window
          </h2>
          <p className="mt-4">
            You have thirty days from delivery to initiate a return. Unopened
            bottles are refunded to the original method of payment. Bottles
            opened but under 20% used are credited in full to your Æthel
            account.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            The process
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            <li>Write to atelier@aethel.paris with your order number.</li>
            <li>A prepaid, insured return label is issued within 24 hours.</li>
            <li>
              Refunds settle within 5 business days of the bottle arriving at
              our atelier.
            </li>
          </ol>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Sample sets & bespoke
          </h2>
          <p className="mt-4">
            Discovery vials and bespoke commissions are final sale, as each
            composition is blended for the wearer. We remain available for
            adjustments at cost.
          </p>
        </section>
      </div>
    </EditorialPage>
  ),
});
