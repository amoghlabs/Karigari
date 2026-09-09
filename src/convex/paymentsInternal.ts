import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { finalizeOrder, loadPayableLines } from "./orderFinalize";

/**
 * Internal helpers backing the live Razorpay checkout flow and the demo
 * artisan sales history. Not callable from the client.
 */

/** Cart snapshot for the signed-in buyer (inside an action context). */
export const getPayableCart = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to check out.");
    const { lines, subtotal } = await loadPayableLines(ctx, userId);
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    return { lines, subtotal, count };
  },
});

/** Records a pending Razorpay checkout session with the cart snapshot. */
export const recordSession = internalMutation({
  args: {
    userId: v.id("users"),
    rzpOrderId: v.string(),
    amount: v.number(),
    currency: v.string(),
    fullName: v.string(),
    address: v.string(),
    lines: v.array(
      v.object({
        productId: v.id("products"),
        title: v.string(),
        image: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // One active session per buyer: supersede older pending ones.
    const previous = await ctx.db
      .query("checkoutSessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const s of previous) {
      if (s.status === "pending") await ctx.db.delete(s._id);
    }

    await ctx.db.insert("checkoutSessions", {
      userId: args.userId,
      rzpOrderId: args.rzpOrderId,
      amount: args.amount,
      currency: args.currency,
      fullName: args.fullName,
      address: args.address,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

/** Fetches a buyer's pending session for signature verification. */
export const getSessionForVerify = internalQuery({
  args: { rzpOrderId: v.string() },
  handler: async (ctx, { rzpOrderId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to check out.");

    const session = await ctx.db
      .query("checkoutSessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    if (!session || session.rzpOrderId !== rzpOrderId) return null;
    return session;
  },
});

/**
 * Places the order for a signature-verified payment: marks the session as
 * used, snapshots the cart again (so stock is honored at finish time) and
 * finalizes the order atomically.
 */
export const placeVerifiedOrder = internalMutation({
  args: {
    rzpOrderId: v.string(),
    rzpPaymentId: v.string(),
  },
  handler: async (ctx, { rzpOrderId, rzpPaymentId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to check out.");

    const session = await ctx.db
      .query("checkoutSessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    if (!session || session.rzpOrderId !== rzpOrderId)
      throw new Error("Checkout session not found — please start again.");
    if (session.status !== "pending")
      throw new Error("This payment has already been used.");

    await ctx.db.patch(session._id, { status: "placed", rzpPaymentId });

    const { lines } = await loadPayableLines(ctx, userId);
    return finalizeOrder(ctx, {
      userId,
      fullName: session.fullName,
      address: session.address,
      lines,
      paymentId: rzpPaymentId,
      paymentMethod: "razorpay",
    });
  },
});

/**
 * Gives the demo artisan (Mitti Kala) a small, believable sales history so
 * the studio dashboard isn't empty on a fresh deployment. Idempotent: no-ops
 * once the demo order exists.
 */
export const recordDemoSale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sellerUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "demo@kaarigari.example"))
      .first();
    if (!sellerUser) return;

    const existingOrders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", sellerUser._id))
      .collect();
    if (existingOrders.length > 0) return;

    const maker = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", sellerUser._id))
      .first();
    if (!maker) return;

    const listings = await ctx.db
      .query("products")
      .withIndex("by_makerId", (q) => q.eq("makerId", maker._id))
      .collect();
    if (listings.length === 0) return;
    const product = listings[0];

    const orderId = await ctx.db.insert("orders", {
      userId: sellerUser._id,
      status: "paid",
      total: product.price * 2,
      fullName: "Ananya Sharma",
      address: "22 Rose Villa, Civil Lines, Jaipur, Rajasthan 302006",
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      paymentId: "demo_upi_history",
      paymentMethod: "demoSale",
    });

    await ctx.db.insert("orderItems", {
      orderId,
      productId: product._id,
      productTitle: product.title,
      productImage: product.imageUrl,
      makerId: maker._id,
      quantity: 2,
      price: product.price,
    });
  },
});
