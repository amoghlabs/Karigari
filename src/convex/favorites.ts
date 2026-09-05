import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Product ids the signed-in user has favorited (reactive). */
export const listFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return ctx.db
      .query("favorites")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** The favorited products (joined) for the signed-in user. */
export const listFavoriteProducts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      favs.map(async (fav) => {
        const product = await ctx.db.get(fav.productId);
        if (!product) return null;
        const maker = await ctx.db.get(product.makerId);
        return { ...product, maker };
      }),
    ).then((rows) => rows.filter((row): row is NonNullable<typeof row> => row !== null));
  },
});

/** Toggle a favorite; returns whether it is now favorited. */
export const toggleFavorite = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to save favorites.");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_userId_productId", (q) =>
        q.eq("userId", userId).eq("productId", productId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("favorites", { userId, productId });
    return true;
  },
});
