import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { isCurrentUserModerator } from "@/lib/reviews.functions";

export function AppShell({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-50 glass-nav border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-gold animate-glow" />
            <span className="font-serif text-lg italic tracking-[0.25em]">ÆTHEL</span>
          </Link>
          <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Maison</Link>
            {userEmail && (
              <Link to="/account" className="hover:text-foreground transition-colors">Account</Link>
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
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
