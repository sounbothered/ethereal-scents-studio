import { createFileRoute } from "@tanstack/react-router";
import { refreshAllNigerianProducts } from "@/lib/price-refresh.server";

// Public cron endpoint. Called by pg_cron with an `apikey` header (Supabase
// anon key) — /api/public/* bypasses site auth, but we still verify a shared
// header to keep drive-by callers from spending Firecrawl credits.
export const Route = createFileRoute("/api/public/hooks/refresh-prices")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        const apikey = request.headers.get("apikey");
        if (!expected || apikey !== expected) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const results = await refreshAllNigerianProducts();
          const summary = results.reduce(
            (acc, r) => {
              acc[r.status] = (acc[r.status] ?? 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );
          return new Response(
            JSON.stringify({ ok: true, count: results.length, summary, results }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (e) {
          return new Response(
            JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
