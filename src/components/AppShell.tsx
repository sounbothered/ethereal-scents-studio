import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { isCurrentUserModerator } from "@/lib/reviews.functions";

const primaryLinks = [
  { to: "/", label: "Maison" },
  { to: "/journal", label: "Journal" },
  { to: "/maison", label: "The House" },
  { to: "/contact", label: "Contact" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const { data: modInfo } = useQuery({
    queryKey: ["is-moderator", userEmail],
    queryFn: () => isCurrentUserModerator(),
    enabled: !!userEmail,
    staleTime: 60_000,
  });
  const isModerator = modInfo?.isModerator ?? false;

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-50 glass-nav border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-gold animate-glow" />
            <span className="font-serif text-lg italic tracking-[0.25em]">
              ÆTHEL
            </span>
          </Link>
          <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            {primaryLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="hover:text-foreground transition-colors"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
            {userEmail && (
              <Link to="/account" className="hover:text-foreground transition-colors">
                Account
              </Link>
            )}
            {isModerator && (
              <Link to="/moderation" className="hover:text-gold transition-colors">
                Moderation
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
            {userEmail ? (
              <button
                onClick={signOut}
                className="hidden sm:inline-block text-muted-foreground hover:text-gold transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:inline-block text-muted-foreground hover:text-gold transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link
              to="/checkout"
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 hover:border-gold transition-colors"
            >
              <span>Bag</span>
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-primary-foreground">
                {count}
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden ml-1 grid size-9 place-items-center rounded-full border border-border hover:border-gold transition-colors"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-current transition-transform ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`}
                />
                <span
                  className={`absolute inset-x-0 top-[6px] h-px bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`absolute inset-x-0 top-[12px] h-px bg-current transition-transform ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div
          className={`absolute inset-x-0 top-0 bg-background border-b border-border pt-24 pb-10 px-6 transition-transform duration-500 ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="flex flex-col gap-1">
            {primaryLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 font-serif text-3xl italic border-b border-border hover:text-gold transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {[
              { to: "/faq", label: "FAQ" },
              { to: "/shipping", label: "Shipping" },
              { to: "/returns", label: "Returns" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-sm uppercase tracking-[0.25em] text-muted-foreground border-b border-border hover:text-foreground transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {userEmail ? (
              <>
                <li>
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-sm uppercase tracking-[0.25em] text-muted-foreground border-b border-border hover:text-foreground transition-colors"
                  >
                    Account
                  </Link>
                </li>
                {isModerator && (
                  <li>
                    <Link
                      to="/moderation"
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 text-sm uppercase tracking-[0.25em] text-gold border-b border-border"
                    >
                      Moderation
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={signOut}
                    className="block w-full text-left py-3 text-sm uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-sm uppercase tracking-[0.25em] text-gold"
                >
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      {children}
    </div>
  );
}
