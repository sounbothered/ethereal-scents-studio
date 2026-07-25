import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForCaller } from "../supabase";

export default defineTool({
  name: "list_product_reviews",
  title: "List product reviews",
  description: "List approved reviews for a perfume by slug.",
  inputSchema: { slug: z.string().min(1).describe("Product slug.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForCaller(ctx);
    const { data: product, error: pErr } = await supabase
      .from("products").select("id").eq("slug", slug).maybeSingle();
    if (pErr) return { content: [{ type: "text", text: pErr.message }], isError: true };
    if (!product) return { content: [{ type: "text", text: `No product '${slug}'` }], isError: true };
    const { data, error } = await supabase
      .from("reviews")
      .select("id, rating, title, body, created_at, user_id")
      .eq("product_id", product.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { reviews: data ?? [] },
    };
  },
});
