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
