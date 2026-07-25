import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SiteFooter } from "@/components/SiteFooter";

const entries = [
  {
    no: "XII",
    title: "On the Weight of Silence",
    excerpt:
      "Why the space between notes is the note itself — a meditation on drydown, memory, and the language of restraint.",
    read: "6 min",
    tag: "Perfumer's Note",
  },
  {
    no: "XI",
    title: "The Saffron Harvest, Autumn 2025",
    excerpt:
      "Three families, four hillsides, forty-eight thousand threads. A dispatch from the Pampore valley at first light.",
    read: "9 min",
    tag: "Provenance",
  },
  {
    no: "X",
    title: "Bottles That Remember",
    excerpt:
      "A conversation with our glassblower on why weight is an ingredient — and why a stopper should sigh, not click.",
    read: "5 min",
    tag: "Atelier",
  },
  {
    no: "IX",
    title: "Iris, in Waiting",
    excerpt:
      "The rhizome is buried, dried, buried again, dried again. Three years pass. And then, a whisper of powder.",
    read: "7 min",
    tag: "Ingredients",
  },
];

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — ÆTHEL" },
      {
        name: "description",
        content:
          "Editorial dispatches from the Æthel atelier — perfumer's notes, ingredient provenance, seasonal editions, and quiet observations from Grasse.",
      },
      { property: "og:title", content: "Journal — ÆTHEL" },
      {
        property: "og:description",
        content:
          "Editorial dispatches from the atelier — perfumer's notes and ingredient provenance from Grasse.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/journal" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/journal" }],
  }),
  component: JournalPage,
});

function JournalPage() {
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
        <header className="relative mx-auto max-w-6xl">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Maison Journal
          </span>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Dispatches
            <br />
            <span className="italic">from the atelier.</span>
          </h1>
        </header>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {entries.map((e) => (
            <article
              key={e.no}
              className="group flex flex-col justify-between gap-10 bg-background p-8 md:p-10 min-h-[320px] transition-colors hover:bg-card/60"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
                    No. {e.no}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {e.tag}
                  </span>
                </div>
                <h2 className="mt-6 font-serif text-3xl italic leading-tight transition-colors group-hover:text-gold">
                  {e.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {e.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                <span>{e.read} read</span>
                <span className="text-gold">— Read entry</span>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Older entries are archived in print. Subscribe to the{" "}
          <Link to="/" className="text-gold hover:underline">
            dispatch
          </Link>{" "}
          to receive future editions.
        </p>
      </section>
      <SiteFooter />
    </AppShell>
  );
}
