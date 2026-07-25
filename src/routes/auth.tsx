import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import heroImg from "@/assets/perfume-hero.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · ÆTHEL" },
      {
        name: "description",
        content:
          "Sign in or create an account with ÆTHEL to save your fragrances and orders.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password too long");

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: py * -14, y: px * 18 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailV = emailSchema.safeParse(email);
    if (!emailV.success) return toast.error(emailV.error.issues[0].message);
    const pwV = passwordSchema.safeParse(password);
    if (!pwV.success) return toast.error(pwV.error.issues[0].message);

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: emailV.data,
          password: pwV.data,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailV.data,
          password: pwV.data,
        });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/", replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 500px at 20% 30%, oklch(0.82 0.13 85 / 0.18), transparent 70%), radial-gradient(500px 400px at 80% 70%, oklch(0.82 0.13 85 / 0.10), transparent 70%)",
        }}
      />
      {/* Slow rotating conic */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 size-[900px] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, oklch(0.82 0.13 85 / 0.4) 25%, transparent 50%, oklch(0.82 0.13 85 / 0.3) 75%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2">
        {/* Left: 3D floating bottle */}
        <div
          className="perspective-1200 hidden md:block"
          onMouseMove={onMove}
          onMouseLeave={reset}
        >
          <div
            className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border border-border shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] preserve-3d transition-transform duration-300 ease-out"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
          >
            <div className="absolute inset-0 animate-float-3d">
              <img
                src={heroImg}
                alt="Nocturne perfume bottle"
                className="h-full w-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 55%, oklch(0.82 0.13 85 / 0.2) 60%, transparent 65%)",
                }}
              />
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
                Maison
              </p>
              <p className="mt-1 font-serif text-3xl italic">ÆTHEL</p>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="relative animate-rise">
          <Link
            to="/"
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-gold transition-colors"
          >
            ← Return to maison
          </Link>

          <div className="mt-6 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
              {mode === "signin" ? "Welcome back" : "Join the house"}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl leading-tight">
              {mode === "signin" ? (
                <>
                  Sign in to <span className="italic">ÆTHEL</span>
                </>
              ) : (
                <>
                  Create your <span className="italic">account</span>
                </>
              )}
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              {mode === "signin"
                ? "Access your fragrances, orders, and bespoke commissions."
                : "Save favorites, track orders, and compose bespoke scents."}
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background/60 px-6 py-3.5 text-sm font-medium transition-all hover:border-gold hover:bg-background disabled:opacity-50"
            >
              <GoogleMark />
              <span>Continue with Google</span>
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleEmail} className="space-y-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-gold"
                  placeholder="you@maison.com"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-gold"
                  placeholder="At least 8 characters"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 w-full overflow-hidden rounded-full bg-gold py-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {loading
                  ? "Please wait…"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {mode === "signin" ? (
                <>
                  New to ÆTHEL?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-gold underline-offset-4 hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="text-gold underline-offset-4 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.5 1.1 7.5 2.9l5.7-5.7C33.8 6.6 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.9 19 12.5 24 12.5c2.9 0 5.5 1.1 7.5 2.9l5.7-5.7C33.8 6.6 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.1 0 9.7-2 13.2-5.2l-6.1-5.2c-2 1.4-4.5 2.3-7.1 2.3-5.3 0-9.7-3.1-11.3-7.4l-6.5 5C9.6 39 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.1 5.2c-.4.4 6.7-4.9 6.7-14.7 0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
