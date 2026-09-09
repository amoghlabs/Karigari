import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { finalizeOrder, loadPayableLines } from "./orderFinalize";

/**
 * Buyer-facing checkout queries and the demo checkout mutation. The live
 * Razorpay actions live in ./paymentsActions ("use node").
 */

/** Whether live Razorpay checkout is configured for this deployment. */
export const getPaymentMode = query({
  args: {},
  handler: () => ({ razorpay: !!process.env.RAZORPAY_KEY_ID }),
});

/** Cart snapshot (validated for stock) used to preview the payment amount. */
export const getCheckoutCart = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to check out.");

    const cart = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!cart) throw new Error("Your bag is empty.");

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
      .collect();
    if (items.length === 0) throw new Error("Your bag is empty.");

    const lines = [];
    let subtotal = 0;
    let count = 0;
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) continue;
      const qty = Math.min(item.quantity, product.stock);
      if (qty <= 0) continue;
      lines.push({
        productId: product._id,
        title: product.title,
        image: product.imageUrl,
        quantity: qty,
        price: product.price,
      });
      subtotal += product.price * qty;
      count += qty;
    }
    if (lines.length === 0) throw new Error("Nothing left to check out.");
    return { lines, subtotal, count };
  },
});

/**
 * Demo checkout — used until RAZORPAY_KEY_ID/SECRET exist. Simulates the
 * gateway round-trip locally so the full cart → payment → order journey
 * works end-to-end in the preview.
 */
export const demoPlaceOrder = mutation({
  args: {
    fullName: v.string(),
    address: v.string(),
    method: v.union(v.literal("upi"), v.literal("card")),
  },
  handler: async (ctx, { fullName, address, method }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to check out.");

    const name = fullName.trim();
    const addr = address.trim();
    if (name.length < 2) throw new Error("Please add the recipient name.");
    if (addr.length < 8) throw new Error("Please add a shipping address.");

    const { lines } = await loadPayableLines(ctx, userId);

    // Convex mutations must be deterministic (no setTimeout/timers), so the
    // demo gateway completes immediately — the client shows the pay spinner
    // while the mutation round-trips.
    const paymentId = `demo_${method}_${Date.now().toString(36)}`;

    const result = await finalizeOrder(ctx, {
      userId,
      fullName: name,
      address: addr,
      lines,
      paymentId,
      paymentMethod: method,
    });
    return result;
  },
});
