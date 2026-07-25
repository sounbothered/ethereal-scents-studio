import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage } from "@/components/EditorialPage";

export const Route = createFileRoute("/maison")({
  head: () => ({
    meta: [
      { title: "The House — ÆTHEL" },
      {
        name: "description",
        content:
          "Founded in Grasse in 1908, Æthel is a quiet parfumerie devoted to rare olfactory narratives, hand-poured in small editions.",
      },
      { property: "og:title", content: "The House — ÆTHEL" },
      {
        property: "og:description",
        content:
          "A quiet parfumerie in Grasse, France, devoted to rare olfactory narratives.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/maison" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/maison" }],
  }),
  component: MaisonPage,
});

function MaisonPage() {
  return (
    <EditorialPage
      eyebrow="The House"
      title={
        <>
          A quiet parfumerie
          <br />
          <span className="italic">in Grasse.</span>
        </>
      }
      lede="Founded in 1908 by a former apothecary and a botanist, Æthel has spent five generations refining a single question — what remains of us when the word leaves the room?"
    >
      <section className="space-y-6 text-[15px] leading-[1.85] text-muted-foreground">
        <p>
          Each Æthel composition is written in the atelier before it is ever
          worn. A brief becomes a manuscript, the manuscript becomes an accord,
          and the accord is macerated for no fewer than sixteen weeks in
          copper vessels drawn from the original cellar.
        </p>
        <p>
          Our ingredients are not sourced — they are corresponded with. Iris
          from Chiusdino, ambrette from Ecuador, saffron threads harvested by
          the same three families in the Kashmir valley since 1974. Nothing
          synthetic hides in the base. Nothing rushed lingers in the drydown.
        </p>
        <h2 className="mt-16 font-serif text-3xl italic text-foreground">
          The four principles
        </h2>
        <dl className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {[
            {
              t: "Slowness",
              d: "Sixteen-week maceration. No shortcuts to depth.",
            },
            {
              t: "Provenance",
              d: "Every ingredient traceable to a name, a hillside, a season.",
            },
            {
              t: "Restraint",
              d: "Editions of five hundred. When they are gone, they are gone.",
            },
            {
              t: "Silence",
              d: "The bottle whispers. The wearer speaks.",
            },
          ].map((p) => (
            <div
              key={p.t}
              className="rounded-2xl border border-border bg-card/60 p-6"
            >
              <dt className="font-serif text-xl italic text-foreground">
                {p.t}
              </dt>
              <dd className="mt-2 text-sm">{p.d}</dd>
            </div>
          ))}
        </dl>
        <h2 className="mt-16 font-serif text-3xl italic text-foreground">
          The atelier
        </h2>
        <p>
          The workshop occupies a former glasshouse on the western edge of
          Grasse. Twelve perfumers, two apprentices, one archivist. No
          marketing department. No focus groups. A single lamp burns until the
          last accord of the day is signed off in ink.
        </p>
      </section>
    </EditorialPage>
  );
}
