import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { PRODUCT_CATEGORIES, categoryValidator } from "./schema";

/** The signed-in user's maker profile, if they created one. */
export const myMaker = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

/** Create the studio profile from the onboarding form. One per user. */
export const createMaker = mutation({
  args: {
    shopName: v.string(),
    craft: v.string(),
    location: v.string(),
    bio: v.string(),
    story: v.string(),
    image: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to open your studio.");

    const shopName = args.shopName.trim();
    if (shopName.length < 2) throw new Error("Give your shop a name.");

    const existing = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existing) throw new Error("You already have a studio.");

    return ctx.db.insert("makers", {
      userId,
      shopName,
      craft: args.craft,
      location: args.location.trim() || "Somewhere handmade",
      bio: args.bio.trim() || shopName,
      story: args.story.trim() || shopName,
      image: args.image,
      coverImage: args.coverImage,
      isFeatured: false,
    });
  },
});

/** Update the studio profile. */
export const updateMaker = mutation({
  args: {
    makerId: v.id("makers"),
    shopName: v.string(),
    craft: v.string(),
    location: v.string(),
    bio: v.string(),
    story: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const maker = await ctx.db.get(args.makerId);
    if (!maker) throw new Error("Studio not found.");
    if (maker.userId !== userId) throw new Error("Not your studio.");

    await ctx.db.patch(args.makerId, {
      shopName: args.shopName.trim() || maker.shopName,
      craft: args.craft,
      location: args.location.trim() || maker.location,
      bio: args.bio.trim() || maker.bio,
      story: args.story.trim() || maker.story,
    });
    return { ok: true };
  },
});

const CATEGORIES = PRODUCT_CATEGORIES as readonly string[];

/** The studio's listings with live stats (views are simulated client-side noise-free). */
export const myListings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const maker = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!maker) return null;

    const products = await ctx.db
      .query("products")
      .withIndex("by_makerId", (q) => q.eq("makerId", maker._id))
      .collect();
    products.sort((a, b) => b._creationTime - a._creationTime);

    return { maker, products };
  },
});

/** Publish a new listing. */
export const createProduct = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    price: v.number(),
    imageUrl: v.string(),
    materials: v.array(v.string()),
    madeToOrder: v.boolean(),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const maker = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!maker) throw new Error("Create your studio first.");

    const title = args.title.trim();
    if (title.length < 3) throw new Error("Give your piece a name.");
    if (args.price <= 0) throw new Error("Price must be greater than zero.");
    if (!args.imageUrl.trim())
      throw new Error("Add an image URL for your piece.");

    return ctx.db.insert("products", {
      makerId: maker._id,
      title,
      description: args.description.trim() || "A handmade piece.",
      category: args.category,
      price: Math.round(args.price * 100) / 100,
      imageUrl: args.imageUrl.trim(),
      materials: args.materials.filter((m) => m.trim().length > 0),
      madeToOrder: args.madeToOrder,
      stock: Math.max(0, Math.round(args.stock)),
      isActive: true,
    });
  },
});

/** Edit an existing listing. */
export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    price: v.number(),
    imageUrl: v.string(),
    materials: v.array(v.string()),
    madeToOrder: v.boolean(),
    stock: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Listing not found.");

    const maker = await ctx.db.get(product.makerId);
    if (!maker || maker.userId !== userId)
      throw new Error("Not your listing.");

    await ctx.db.patch(args.productId, {
      title: args.title.trim() || product.title,
      description: args.description.trim() || product.description,
      category: CATEGORIES.includes(args.category)
        ? args.category
        : product.category,
      price: Math.max(0.5, Math.round(args.price * 100) / 100),
      imageUrl: args.imageUrl.trim() || product.imageUrl,
      materials: args.materials.filter((m) => m.trim().length > 0),
      madeToOrder: args.madeToOrder,
      stock: Math.max(0, Math.round(args.stock)),
      isActive: args.isActive,
    });
    return { ok: true };
  },
});

/** Soft-delete a listing (hide it from the marketplace). */
export const retireProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in.");

    const product = await ctx.db.get(productId);
    if (!product) return { ok: false };

    const maker = await ctx.db.get(product.makerId);
    if (!maker || maker.userId !== userId)
      throw new Error("Not your listing.");

    await ctx.db.patch(productId, { isActive: false });
    return { ok: true };
  },
});

/** Orders containing this studio's pieces — the maker's sales feed. */
export const mySales = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const maker = await ctx.db
      .query("makers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!maker) return null;

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_makerId", (q) => q.eq("makerId", maker._id))
      .collect();
    items.sort((a, b) => b._creationTime - a._creationTime);

    return Promise.all(
      items.map(async (item) => {
        const order = await ctx.db.get(item.orderId);
        return { ...item, order };
      }),
    );
  },
});
