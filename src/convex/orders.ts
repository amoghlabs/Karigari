import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

/** Order history for the signed-in buyer, newest first. */
export const listMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    orders.sort((a, b) => b.createdAt - a.createdAt);

    return Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await ctx.db
          .query("orderItems")
          .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
          .collect(),
      })),
    );
  },
});

// Checkout lives in ./payments (Razorpay + verified demo flow).
