import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

/** One cart line resolved to its product + maker for the client. */
type CartLine = {
  itemId: Id<"cartItems">;
  quantity: number;
  lineTotal: number;
  product: Doc<"products">;
  makerName: string;
};

/** Full cart state for the signed-in user (reactive). */
export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const cart = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!cart) {
      return { items: [] as CartLine[], subtotal: 0, count: 0 };
    }

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
      .collect();

    const lines: CartLine[] = [];
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      const maker = await ctx.db.get(product.makerId);
      lines.push({
        itemId: item._id,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
        product,
        makerName: maker?.shopName ?? "Independent maker",
      });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    return { items: lines, subtotal, count };
  },
});

async function getOrCreateCart(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<Id<"carts">> {
  const cart = await ctx.db
    .query("carts")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (cart) return cart._id;
  return ctx.db.insert("carts", { userId });
}

export const addToCart = mutation({
  args: { productId: v.id("products"), quantity: v.optional(v.number()) },
  handler: async (ctx, { productId, quantity }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to add pieces to your bag.");
    const qty = Math.max(1, quantity ?? 1);

    const product = await ctx.db.get(productId);
    if (!product || !product.isActive)
      throw new Error("This piece is no longer available.");

    const cartId = await getOrCreateCart(ctx, userId);

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId_productId", (q) =>
        q.eq("cartId", cartId).eq("productId", productId),
      )
      .first();

    const desired = Math.min(
      (existing?.quantity ?? 0) + qty,
      Math.max(product.stock, 1),
    );
    if (existing) {
      await ctx.db.patch(existing._id, { quantity: desired });
    } else {
      await ctx.db.insert("cartItems", { cartId, productId, quantity: desired });
    }
    return { ok: true };
  },
});

export const updateCartItem = mutation({
  args: { itemId: v.id("cartItems"), quantity: v.number() },
  handler: async (ctx, { itemId, quantity }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const item = await ctx.db.get(itemId);
    if (!item) return { ok: false };

    const cart = await ctx.db.get(item.cartId);
    if (!cart || cart.userId !== userId) throw new Error("Not your cart.");

    if (quantity <= 0) {
      await ctx.db.delete(itemId);
    } else {
      const product = await ctx.db.get(item.productId);
      const max = product ? Math.max(product.stock, 1) : quantity;
      await ctx.db.patch(itemId, { quantity: Math.min(quantity, max) });
    }
    return { ok: true };
  },
});

export const removeCartItem = mutation({
  args: { itemId: v.id("cartItems") },
  handler: async (ctx, { itemId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const item = await ctx.db.get(itemId);
    if (!item) return { ok: false };
    const cart = await ctx.db.get(item.cartId);
    if (!cart || cart.userId !== userId) throw new Error("Not your cart.");

    await ctx.db.delete(itemId);
    return { ok: true };
  },
});

export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { ok: false };
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!cart) return { ok: true };
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
      .collect();
    for (const item of items) await ctx.db.delete(item._id);
    return { ok: true };
  },
});
