import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForCaller } from "../supabase";

export default defineTool({
  name: "get_product",
  title: "Get perfume details",
  description: "Fetch a single perfume by its slug, including notes and price.",
  inputSchema: { slug: z.string().min(1).describe("Product slug, e.g. 'nocturne-01'.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForCaller(ctx)
      .from("products")
      .select("id, slug, name, tagline, notes, price_cents, currency, image_url, active")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No product with slug '${slug}'` }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { product: data },
    };
  },
});
