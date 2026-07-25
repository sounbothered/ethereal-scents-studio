import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage } from "@/components/EditorialPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — ÆTHEL" },
      {
        name: "description",
        content:
          "How Æthel collects, uses, and safeguards personal data. Written by the maison, not by a template.",
      },
      { property: "og:title", content: "Privacy — ÆTHEL" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <EditorialPage
      eyebrow="Privacy"
      title={
        <>
          What we know,
          <br />
          <span className="italic">and why.</span>
        </>
      }
      lede="This page is maintained by Maison Æthel to answer common privacy questions about our online parfumerie. It is not a legal certification."
    >
      <div className="space-y-10 text-[15px] leading-[1.85] text-muted-foreground">
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            What we collect
          </h2>
          <p className="mt-4">
            Account name and email, order and shipping details, and the reviews
            you choose to publish. We do not process card data — payments are
            handled by our payment provider.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            How we use it
          </h2>
          <p className="mt-4">
            To fulfil your order, communicate about it, and — if you subscribe
            — send the seasonal dispatch. Nothing is sold. Nothing is shared
            beyond the subprocessors required to run the shop.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Your rights
          </h2>
          <p className="mt-4">
            You may request a copy of your data, or its deletion, by writing to
            privacy@aethel.paris. We respond within thirty days.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl italic text-foreground">
            Cookies
          </h2>
          <p className="mt-4">
            Strictly necessary cookies keep your bag and session alive. We do
            not run advertising trackers.
          </p>
        </section>
        <p className="pt-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Last revised — this edition
        </p>
      </div>
    </EditorialPage>
  ),
});
