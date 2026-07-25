import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForCaller } from "../supabase";

export default defineTool({
  name: "list_my_orders",
  title: "List my orders",
  description: "List the signed-in user's ÆTHEL orders with items and totals.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForCaller(ctx);
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, status, total_cents, currency, created_at, order_items(id, product_id, product_name, product_slug, quantity, unit_price_cents)")
      .eq("user_id", ctx.getUserId()!)
      .order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(orders ?? []) }],
      structuredContent: { orders: orders ?? [] },
    };
  },
});
