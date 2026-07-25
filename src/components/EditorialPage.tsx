import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import { SiteFooter } from "./SiteFooter";

export function EditorialPage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <AppShell>
      <div className="relative px-6 pt-32 pb-20">
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
            {eyebrow}
          </span>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
            {title}
          </h1>
          {lede && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {lede}
            </p>
          )}
        </header>
      </div>
      <article className="prose-editorial mx-auto max-w-3xl px-6 pb-24">
        {children}
      </article>
      <SiteFooter />
    </AppShell>
  );
}
