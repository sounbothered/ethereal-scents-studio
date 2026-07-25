import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Beta namespace: keep a tiny typed wrapper so TS sees the three methods
// we use. Runtime is the real @supabase/supabase-js client.
type OAuthAuthorizationDetails = {
  client?: { name?: string; redirect_uri?: string } | null;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthResult = { data: OAuthAuthorizationDetails | null; error: { message: string } | null };
const oauth = (supabase.auth as unknown as {
  oauth: {
    getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
    approveAuthorization: (id: string) => Promise<OAuthResult>;
    denyAuthorization: (id: string) => Promise<OAuthResult>;
  };
}).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center p-8 text-foreground">
      <div className="max-w-md rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Authorization error</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setErr(null);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setErr(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setErr("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 500px at 20% 30%, oklch(0.82 0.13 85 / 0.18), transparent 70%), radial-gradient(500px 400px at 80% 70%, oklch(0.82 0.13 85 / 0.10), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-lg px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Authorize</p>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl leading-tight">
          Connect <span className="italic">{clientName}</span> to your <span className="italic">ÆTHEL</span> account
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This lets {clientName} use ÆTHEL as you — browse the catalog, view your orders, and submit reviews on your behalf. It does not bypass ÆTHEL's permissions or backend policies.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl space-y-3">
          <Row label="Client" value={clientName} />
          {details?.client?.redirect_uri && (
            <Row label="Redirect" value={details.client.redirect_uri} />
          )}
          {details?.scope && <Row label="Requested access" value={details.scope} />}
        </div>

        {err && (
          <p role="alert" className="mt-6 text-sm text-red-400">{err}</p>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-full bg-gold py-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {busy ? "Please wait…" : "Approve"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-full border border-border py-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/80 hover:border-gold disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <span className="text-right text-foreground/90 break-all">{value}</span>
    </div>
  );
}
