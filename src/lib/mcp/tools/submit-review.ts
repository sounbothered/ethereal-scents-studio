import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForCaller } from "../supabase";

export default defineTool({
  name: "submit_review",
  title: "Submit a review",
  description:
    "Submit or update the signed-in user's review of a perfume. Reviews enter moderation before appearing publicly.",
  inputSchema: {
    slug: z.string().min(1).describe("Product slug."),
    rating: z.number().int().min(1).max(5).describe("Star rating from 1 to 5."),
    title: z.string().max(120).optional().describe("Optional review title."),
    body: z.string().max(4000).optional().describe("Optional review body."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug, rating, title, body }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForCaller(ctx);
    const { data: product, error: pErr } = await supabase
      .from("products").select("id").eq("slug", slug).maybeSingle();
    if (pErr) return { content: [{ type: "text", text: pErr.message }], isError: true };
    if (!product) return { content: [{ type: "text", text: `No product '${slug}'` }], isError: true };
    const { data, error } = await supabase
      .from("reviews")
      .upsert(
        {
          product_id: product.id,
          user_id: ctx.getUserId()!,
          rating,
          title: title ?? null,
          body: body ?? null,
          status: "pending",
        },
        { onConflict: "product_id,user_id" },
      )
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Review submitted — status: ${data.status} (awaiting moderation).` }],
      structuredContent: { review: data },
    };
  },
});
