import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ÆTHEL" },
      {
        name: "description",
        content:
          "Write to the atelier in Grasse. We answer every message within two business days.",
      },
      { property: "og:title", content: "Contact — ÆTHEL" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [state, setState] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state.name || !state.email || !state.message) {
      toast.error("Please complete every field");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setState({ name: "", email: "", message: "" });
    toast.success("Message received — the atelier will write back shortly");
  };

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
            Correspondence
          </span>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Write to the
            <br />
            <span className="italic">atelier.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            We answer every message within two business days. For orders,
            please include the confirmation reference.
          </p>
        </header>
      </div>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-14 px-6 pb-24 md:grid-cols-5">
        <aside className="md:col-span-2 space-y-8 text-sm text-muted-foreground">
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.35em] text-gold">
              Atelier
            </h4>
            <p className="mt-3 leading-relaxed">
              14 Chemin des Serres
              <br />
              06130 Grasse
              <br />
              France
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.35em] text-gold">
              Correspondence
            </h4>
            <p className="mt-3 leading-relaxed">
              atelier@aethel.paris
              <br />
              +33 4 93 00 00 00
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.35em] text-gold">
              Hours
            </h4>
            <p className="mt-3 leading-relaxed">
              Tuesday — Saturday
              <br />
              10:00 — 18:00 CET
            </p>
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          className="md:col-span-3 space-y-6 rounded-2xl border border-border bg-card/40 p-8"
        >
          <div>
            <label className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Your name
            </label>
            <input
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={state.email}
              onChange={(e) => setState({ ...state, email: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Your message
            </label>
            <textarea
              rows={6}
              value={state.message}
              onChange={(e) => setState({ ...state, message: e.target.value })}
              className="mt-2 w-full resize-none rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-foreground px-8 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-background transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
      <SiteFooter />
    </AppShell>
  );
}
