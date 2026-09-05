import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

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

/**
 * Places an order from the current cart contents.
 * Validates stock, snapshots product data, clears the cart.
 * Returns the new order id for the confirmation view.
 */
export const placeOrder = mutation({
  args: {
    fullName: v.string(),
    address: v.string(),
  },
  handler: async (ctx, { fullName, address }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to check out.");

    const name = fullName.trim();
    const addr = address.trim();
    if (name.length < 2) throw new Error("Please add the recipient name.");
    if (addr.length < 8) throw new Error("Please add a shipping address.");

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

    let total = 0;
    const lines: Array<{
      productId: any;
      productTitle: string;
      productImage: string;
      makerId: any;
      quantity: number;
      price: number;
    }> = [];

    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product || !product.isActive) continue;

      const qty = Math.min(item.quantity, product.stock);
      if (qty <= 0) continue;

      total += product.price * qty;
      lines.push({
        productId: product._id,
        productTitle: product.title,
        productImage: product.imageUrl,
        makerId: product.makerId,
        quantity: qty,
        price: product.price,
      });
    }

    if (lines.length === 0) throw new Error("Nothing left to check out.");

    const orderId = await ctx.db.insert("orders", {
      userId,
      status: "paid",
      total,
      fullName: name,
      address: addr,
      createdAt: Date.now(),
    });

    for (const line of lines) {
      await ctx.db.insert("orderItems", { orderId, ...line });
      const product = await ctx.db.get(line.productId as Id<"products">);
      if (product && "stock" in product) {
        await ctx.db.patch(product._id, {
          stock: Math.max(0, product.stock - line.quantity),
        });
      }
    }

    for (const item of items) await ctx.db.delete(item._id);

    return { orderId, total };
  },
});
