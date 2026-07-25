import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

const cols: Array<{
  title: string;
  links: Array<{ label: string; to: string }>;
}> = [
  {
    title: "Maison",
    links: [
      { label: "The House", to: "/maison" },
      { label: "Journal", to: "/journal" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Care",
    links: [
      { label: "Shipping", to: "/shipping" },
      { label: "Returns", to: "/returns" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setEmail("");
    toast.success("Welcome to the Æthel dispatch — check your inbox");
  };

  return (
    <footer className="border-t border-border px-6 pt-20 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-gold" />
              <span className="font-serif text-2xl italic tracking-[0.25em]">
                ÆTHEL
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Rare fragrances hand-poured in Grasse, France. A quiet maison for
              those who wear scent as language.
            </p>
            <form onSubmit={onSubmit} className="mt-8 max-w-sm">
              <label className="text-[10px] uppercase tracking-[0.35em] text-gold">
                The Dispatch
              </label>
              <p className="mt-2 text-xs text-muted-foreground">
                Seasonal editions, private previews, atelier notes.
              </p>
              <div className="mt-4 flex items-center gap-2 border-b border-border py-2 focus-within:border-gold transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@dispatch.com"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  aria-label="Email for the Æthel dispatch"
                />
                <button
                  type="submit"
                  className="text-[10px] uppercase tracking-[0.3em] text-gold hover:text-foreground transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          <div className="md:col-span-7 grid grid-cols-3 gap-8">
            {cols.map((col) => (
              <div key={col.title}>
                <h4 className="text-[10px] uppercase tracking-[0.35em] text-gold">
                  {col.title}
                </h4>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border pt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Æthel Parfumerie · Grasse</span>
          <span>Crafted with intent</span>
        </div>
      </div>
    </footer>
  );
}
