import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import getProduct from "./tools/get-product";
import listMyOrders from "./tools/list-my-orders";
import listProductReviews from "./tools/list-product-reviews";
import submitReview from "./tools/submit-review";

// Direct Supabase issuer (not the .lovable.cloud proxy). Inlined by Vite at
// build time; fallback keeps the URL well-formed during manifest extraction.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "aethel-mcp",
  title: "ÆTHEL Perfumery",
  version: "0.1.0",
  instructions:
    "Tools for the ÆTHEL perfumery: browse the catalog, look up perfume details, view your orders, read approved reviews, and submit your own review.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProducts, getProduct, listMyOrders, listProductReviews, submitReview],
});
